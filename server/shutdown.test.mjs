import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

const token = 'test-only-token-at-least-32-characters';
const body = JSON.stringify({ question: 'Co sprawdzić?', context: {
  vehicle: { make: 'Toyota', model: 'Corolla', year: 2020, engine: '1.8', mileage: 80000 }, recentServices: [],
} });

async function startServer(t, hanging = false) {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const preload = `
    globalThis.fetch = (_url, { signal }) => new Promise((resolve, reject) => {
      process.send('upstream');
      signal.addEventListener('abort', () => { process.send('aborted'); reject(signal.reason); }, { once: true });
      ${hanging ? '' : `setTimeout(() => resolve(new Response(JSON.stringify({ status: 'completed', error: null, output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Odpowiedź.' }] }] }))), 300);`}
    });
    process.channel.unref();
  `;
  const child = fork(new URL('./index.mjs', import.meta.url), [], {
    execArgv: ['--import', `data:text/javascript,${encodeURIComponent(preload)}`],
    env: { HOST: '127.0.0.1', PORT: String(port), OPENAI_API_KEY: 'sk-test-only-no-real-key', APP_API_TOKEN: token },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await once(child, 'exit'); }
  });
  const exited = once(child, 'exit');
  let stderr = '';
  child.stderr.on('data', data => { stderr += data; });
  await once(child.stdout, 'data', { signal: AbortSignal.timeout(3000) });
  const response = fetch(`http://127.0.0.1:${port}/assistant`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body,
  });
  // Observe the socket failure immediately so shutdown cannot leave an unhandled rejection.
  response.catch(() => {});
  const [message] = await once(child, 'message', { signal: AbortSignal.timeout(3000) });
  assert.equal(message, 'upstream');
  return { child, response, exited, stderr: () => stderr, port };
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  test(`${signal} stops accepting connections and drains an active HTTP response`, { timeout: 5000 }, async t => {
    const { child, response, exited, stderr, port } = await startServer(t);
    child.kill(signal);
    await new Promise(resolve => setTimeout(resolve, 50));
    await assert.rejects(fetch(`http://127.0.0.1:${port}/health`));
    const result = await response;
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { answer: 'Odpowiedź.' });
    assert.deepEqual(await exited, [0, null]);
    assert.equal(stderr(), '');
  });
}

test('shutdown deadline closes active HTTP sockets and aborts the upstream request', { timeout: 8000 }, async t => {
  const { child, response, exited, stderr } = await startServer(t, true);
  const aborted = once(child, 'message', { signal: AbortSignal.timeout(6500) });
  const started = Date.now();
  child.kill('SIGTERM');
  await assert.rejects(response);
  assert.equal((await aborted)[0], 'aborted');
  assert.deepEqual(await exited, [0, null]);
  assert.ok(Date.now() - started >= 4500, 'active request must receive its grace period');
  assert.ok(Date.now() - started < 6500, 'shutdown must finish before the container stop deadline');
  assert.equal(stderr(), '');
});
