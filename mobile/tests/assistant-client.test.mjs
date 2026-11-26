import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { askAssistant } from '../src/assistant-client.ts';

const token = 'test-only-token-at-least-32-characters';
const context = { vehicle: { make: 'Toyota', model: 'Corolla', year: 2020, engine: '1.8 Hybrid', mileage: 80000 }, recentServices: [] };
async function withServer(handler, run) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
const query = (endpoint, extras = {}) => askAssistant({ endpoint, token, question: 'Co sprawdzić?', context, ...extras });
test('client carries validated ECU scope while omitting unlisted controller metadata',async()=>{
 let received;
 await withServer(async(req,res)=>{let raw='';for await(const chunk of req)raw+=chunk;received=JSON.parse(raw);res.end(JSON.stringify({answer:'Odpowiedź.'}));},async endpoint=>{
  const diagnostics={timestamp:42,codes:[],parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:null},ecu:{protocol:7,responseId:'18DAF110',private:'SECRET'}};
  await query(endpoint,{context:{...context,diagnostics}});assert.deepEqual(received.context.diagnostics.ecu,{protocol:7,responseId:'18DAF110'});assert.ok(!JSON.stringify(received).includes('SECRET'));
  diagnostics.ecu.responseId='7DF';await assert.rejects(query(endpoint,{context:{...context,diagnostics}}));
 });
});

test('client sends authenticated minimal data and returns a real server answer', async () => {
  let received;
  await withServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    received = { path: req.url, authorization: req.headers.authorization, body: JSON.parse(raw) };
    res.end(JSON.stringify({ answer: 'Odpowiedź z serwera.' }));
  }, async endpoint => {
    const dirty = structuredClone(context);
    dirty.vehicle.vin = 'SECRET_VIN'; dirty.vehicle.plate = 'SECRET_PLATE'; dirty.routes = [{ lat: 52 }]; dirty.notes = 'SECRET_NOTES';
    assert.equal(await query(endpoint, { context: dirty }), 'Odpowiedź z serwera.');
    assert.deepEqual(received, { path: '/assistant', authorization: `Bearer ${token}`, body: { question: 'Co sprawdzić?', context } });
  });
});

test('client rejects unsafe endpoints before any network access or credential disclosure', async () => {
  for (const endpoint of ['http://example.com', 'https://name:password@example.com', 'https://example.com?token=secret', 'https://example.com#secret', 'https://example.com?', 'https://@example.com', 'file:///etc/passwd', 'https://example.com/path', 'http://127.0.0.1.evil.test']) {
    await assert.rejects(query(endpoint), error => error.message === 'Podaj adres HTTPS serwera asystenta (HTTP tylko lokalnie).');
  }
});

test('client validates token, question and context before reaching the server', async () => {
  await withServer(() => assert.fail('invalid request reached server'), async endpoint => {
    for (const extras of [{ token: '' }, { token: 'short' }, { question: '' }, { question: 'x'.repeat(2001) }, { context: { ...context, vehicle: { ...context.vehicle, mileage: -1 } } }]) {
      await assert.rejects(query(endpoint, extras));
    }
  });
});

test('client reports stable status errors and never echoes untrusted provider messages', async () => {
  for (const [status, message] of [[401, 'Nieprawidłowy token asystenta.'], [503, 'Asystent AI nie jest skonfigurowany.'], [429, 'Limit zapytań. Spróbuj ponownie później.'], [502, 'Asystent AI jest chwilowo niedostępny.']]) {
    await withServer((_req, res) => { res.writeHead(status); res.end(JSON.stringify({ error: 'SECRET_TOKEN private upstream detail' })); }, async endpoint => {
      await assert.rejects(query(endpoint), error => error.message === message);
    });
  }
});

test('client rejects malformed, empty and oversized success responses', async () => {
  for (const body of ['{broken', 'null', JSON.stringify({ answer: '' }), JSON.stringify({ answer: 'x'.repeat(8001) }), 'x'.repeat(40000)]) {
    await withServer((_req, res) => res.end(body), async endpoint => {
      await assert.rejects(query(endpoint), error => error.message === 'Nieprawidłowa odpowiedź serwera asystenta.');
    });
  }
});

test('redirects cannot forward assistant credentials to a second destination', async () => {
  await withServer((_req, _res) => assert.fail('redirect target must never be contacted'), async target => {
    await withServer((_req, res) => { res.writeHead(307, { location: `${target}/capture` }); res.end(); }, async endpoint => {
      await assert.rejects(query(endpoint), /Nie można połączyć się z asystentem/);
    });
  });
});

test('an already aborted request never contacts the server', async () => {
  await withServer(() => assert.fail('aborted request reached server'), async endpoint => {
    const controller = new AbortController(); controller.abort();
    await assert.rejects(query(endpoint, { signal: controller.signal }), error => error.name === 'AbortError');
  });
});

test('aborting an in-flight request rejects promptly with a stable error', async () => {
  let arrived;
  const arrival = new Promise(resolve => { arrived = resolve; });
  await withServer(() => arrived(), async endpoint => {
    const controller = new AbortController();
    const pending = assert.rejects(query(endpoint, { signal: controller.signal }), error => error.name === 'AbortError' && error.message === 'Przerwano zapytanie do asystenta.');
    await arrival; controller.abort(); await pending;
  });
});
