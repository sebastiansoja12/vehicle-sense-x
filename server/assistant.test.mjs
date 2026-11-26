import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistantServer } from './index.mjs';

const token = 'test-only-token-at-least-32-characters';
const env = { OPENAI_API_KEY: 'sk-test-only-no-real-key', APP_API_TOKEN: token };
const context = {
  vehicle: { make: 'Toyota', model: 'Corolla', year: 2020, engine: '1.8 Hybrid', mileage: 80000 },
  fuelSummary: { consumption: null, totalCents: 24000 },
  recentServices: [{ date: '2026-11-20', title: 'Olej', mileage: 79000, costCents: 55000 }],
  diagnostics: { timestamp: 1795560000000, codes: ['P0300'], parameters: { rpm: 800, coolantC: 80, loadPercent: null, voltageV: 14.1 } },
};
const upstreamAnswer = (text = 'Sprawdź historię serwisu.') => new Response(JSON.stringify({
  id: 'resp_test', object: 'response', status: 'completed', error: null,
  output: [{ id: 'msg_test', type: 'message', status: 'completed', role: 'assistant', content: [{ type: 'output_text', text, annotations: [], logprobs: [] }] }],
}), { headers: { 'content-type': 'application/json' } });
async function withServer(options, run) {
  const server = createAssistantServer({ env, fetchImpl: async () => upstreamAnswer(), ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); } finally { await new Promise(resolve => server.close(resolve)); }
}
function post(base, body = { question: 'Co sprawdzić?', context }, headers = {}) {
  return fetch(`${base}/assistant`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
test('server preserves valid single-controller scope and rejects invented CAN addresses',async()=>{
 let input;
 await withServer({fetchImpl:async(_url,init)=>{input=JSON.parse(JSON.parse(init.body).input);return upstreamAnswer();}},async base=>{
  const scoped=structuredClone(context);scoped.diagnostics.ecu={protocol:6,responseId:'7E9',private:'SECRET'};
  assert.equal((await post(base,{question:'Co sprawdzić?',context:scoped})).status,200);assert.deepEqual(input.context.diagnostics.ecu,{protocol:6,responseId:'7E9'});assert.ok(!JSON.stringify(input).includes('SECRET'));
  scoped.diagnostics.ecu.responseId='7DF';assert.equal((await post(base,{question:'Co sprawdzić?',context:scoped})).status,400);
 });
});

test('health exposes only availability and never calls the paid upstream', async () => {
  await withServer({ fetchImpl: () => assert.fail('health must not call upstream') }, async base => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { configured: true });
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});

test('assistant uses authenticated fixed Responses endpoint and whitelists context at every depth', async () => {
  let call;
  await withServer({ fetchImpl: async (url, init) => { call = { url, init, body: JSON.parse(init.body) }; return upstreamAnswer(); } }, async base => {
    const dirty = structuredClone(context);
    dirty.vehicle.vin = 'VIN_SECRET'; dirty.vehicle.plate = 'PLATE_SECRET'; dirty.notes = 'NOTES_SECRET';
    dirty.routes = [{ latitude: 52 }]; dirty.recentServices[0].notes = 'SERVICE_SECRET';
    dirty.diagnostics.location = 'LOCATION_SECRET'; dirty.diagnostics.parameters.gps = 'GPS_SECRET';
    const response = await post(base, { question: 'Co sprawdzić?', context: dirty, upstreamUrl: 'http://evil.test', model: 'evil', conversation: 'secret' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { answer: 'Sprawdź historię serwisu.' });
    assert.equal(call.url, 'https://api.openai.com/v1/responses');
    assert.equal(call.init.headers.authorization, `Bearer ${env.OPENAI_API_KEY}`);
    assert.equal(call.init.redirect, 'error');
    assert.equal(call.body.store, false);
    assert.equal(call.body.model, 'gpt-5-mini');
    assert.equal(call.body.max_output_tokens, 1600);
    assert.deepEqual(call.body.tools, []);
    assert.equal(call.body.previous_response_id, undefined);
    assert.equal(call.body.conversation, undefined);
    assert.deepEqual(JSON.parse(call.body.input), { question: 'Co sprawdzić?', context });
    assert.match(call.body.instructions, /polsku/);
    assert.doesNotMatch(JSON.stringify(call.body), /SECRET|evil/);
  });
});

test('missing key or missing/weak server token disables the endpoint without upstream work', async () => {
  for (const invalidEnv of [{ APP_API_TOKEN: token }, { OPENAI_API_KEY: env.OPENAI_API_KEY }, { ...env, APP_API_TOKEN: 'short' }, { ...env, OPENAI_API_KEY: 'bad\nkey' }]) {
    await withServer({ env: invalidEnv, fetchImpl: () => assert.fail('disabled endpoint called upstream') }, async base => {
      assert.deepEqual(await (await fetch(`${base}/health`)).json(), { configured: false });
      assert.equal((await post(base)).status, 503);
    });
  }
});

test('missing or invalid caller token rejects before reading input or upstream access', async () => {
  await withServer({ fetchImpl: () => assert.fail('unauthenticated request called upstream') }, async base => {
    for (const authorization of ['', 'Bearer wrong', `Basic ${token}`, `Bearer ${token}X`]) {
      const response = await post(base, '{invalid', { authorization });
      assert.equal(response.status, 401);
      assert.doesNotMatch(await response.text(), /sk-test|test-only-token/);
    }
  });
});

test('malformed, overlarge and invalid bodies never reach upstream', async () => {
  await withServer({ fetchImpl: () => assert.fail('invalid input called upstream') }, async base => {
    for (const body of ['{broken', 'null', { question: '', context }, { question: 'x'.repeat(2001), context }, { question: 'x', context: { ...context, vehicle: { ...context.vehicle, year: '2020' } } }, { question: 'x', context: { ...context, recentServices: Array(21).fill(context.recentServices[0]) } }, { question: 'x', context: { ...context, diagnostics: { ...context.diagnostics, codes: ['not a DTC'] } } }]) {
      assert.equal((await post(base, body)).status, 400);
    }
    assert.equal((await post(base, 'x'.repeat(17000))).status, 413);
    assert.equal((await post(base, {}, { 'content-type': 'text/plain' })).status, 415);
  });
});

test('origin allowlist rejects unlisted origins and permits only exact configured origins', async () => {
  await withServer({ env: { ...env, ALLOWED_ORIGINS: 'https://app.example.com' } }, async base => {
    const response = await post(base, undefined, { origin: 'https://app.example.com' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example.com');
    assert.equal((await post(base, undefined, { origin: 'https://app.example.com.evil.test' })).status, 403);
    const preflight = await fetch(`${base}/assistant`, { method: 'OPTIONS', headers: { origin: 'https://app.example.com', 'access-control-request-method': 'POST' } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-headers'), 'authorization, content-type');
  });
  await withServer({}, async base => assert.equal((await post(base, undefined, { origin: 'https://app.example.com' })).status, 403));
  assert.throws(() => createAssistantServer({ env: { ...env, ALLOWED_ORIGINS: '*' } }), /ALLOWED_ORIGINS/);
});

test('upstream failures are mapped without leaking provider bodies or credentials', async () => {
  for (const fake of [async () => new Response('sk-secret private provider failure', { status: 401 }), async () => new Response('{bad'), async () => upstreamAnswer(''), async () => upstreamAnswer('x'.repeat(8001)), async () => new Response('x'.repeat(70000)), async () => { throw new Error('private network detail'); }]) {
    await withServer({ fetchImpl: fake }, async base => {
      const response = await post(base);
      assert.equal(response.status, 502);
      const body = await response.json();
      assert.equal(typeof body.error, 'string');
      assert.doesNotMatch(body.error, /secret|private|sk-/);
    });
  }
});

test('upstream timeout aborts fetch and returns a bounded error', async () => {
  let aborted = false;
  await withServer({ env: { ...env, ASSISTANT_TIMEOUT_MS: '100' }, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => { aborted = true; reject(signal.reason); }, { once: true })) }, async base => {
    assert.equal((await post(base)).status, 504);
    assert.equal(aborted, true);
  });
});

test('paid requests have a shared bounded rate limit independent of spoofed forwarded IP', async () => {
  let calls = 0;
  await withServer({ fetchImpl: async () => { calls++; return upstreamAnswer(); } }, async base => {
    for (let i = 0; i < 20; i++) assert.equal((await post(base, undefined, { 'x-forwarded-for': `1.2.3.${i}` })).status, 200);
    const limited = await post(base);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('retry-after')) > 0);
    assert.equal(calls, 20);
  });
});
