import test from 'node:test';
import assert from 'node:assert/strict';
import { searchAutomotive, buildPartsQuery, navigationUrl } from '../src/automotive-client.ts';
const config = { endpoint: 'https://services.example.com', token: 'test-token-at-least-32-safe-characters' };
const json = body => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const date = '2026-11-26T10:00:00.000Z';
const parts = { source: 'eBay', marketplace: 'EBAY_PL', fetchedAt: date, query: 'filtr', skipped: 0, offers: [{ id: '1', title: 'Filtr', url: 'https://www.ebay.pl/itm/1', priceMinor: 4999, currency: 'PLN', shippingMinor: null, seller: null, condition: null }] };
test('queries transmit only consented fields to a validated private server', async () => {
  let call;
  const response = await searchAutomotive({ ...config, kind: 'parts', input: { query: 'filtr', vin: 'PRIVATE', token: 'PRIVATE' }, consent: true }, async (url, init) => { call = { url, init }; return json(parts); });
  assert.equal(call.url, 'https://services.example.com/automotive/parts');
  assert.deepEqual(JSON.parse(call.init.body), { query: 'filtr' });
  assert.equal(call.init.credentials, 'omit');
  assert.equal(response.offers[0].shippingMinor, null);
  assert.equal(response.offers[0].priceMinor, 4999);
});
test('missing consent, invalid endpoint, token and coordinates stop before a network call', async () => {
  const base = { ...config, kind: 'parts', input: { query: 'filtr' }, consent: true };
  const noFetch = () => assert.fail('invalid request transmitted');
  await assert.rejects(searchAutomotive({ ...base, consent: false }, noFetch));
  for (const endpoint of ['http://services.example.com', 'https://user:pass@services.example.com', 'https://services.example.com/path', 'https://services.example.com?token=secret']) await assert.rejects(searchAutomotive({ ...base, endpoint }, noFetch));
  await assert.rejects(searchAutomotive({ ...base, token: 'secret' }, noFetch));
  await assert.rejects(searchAutomotive({ ...base, kind: 'workshops', input: { latitude: NaN, longitude: 20, radiusKm: 10, category: 'repair' } }, noFetch));
});
test('malformed provider responses cannot be rendered as trusted prices or links', async () => {
  const base = { ...config, kind: 'parts', input: { query: 'filtr' }, consent: true };
  for (const change of [{ priceMinor: -1 }, { currency: 'BAD' }, { shippingMinor: 'free' }, { url: 'javascript:alert(1)' }, { url: 'https://ebay.pl.evil.test' }]) {
    await assert.rejects(searchAutomotive(base, async () => json({ ...parts, offers: [{ ...parts.offers[0], ...change }] })));
  }
  await assert.rejects(searchAutomotive(base, async () => json({ ...parts, fetchedAt: 'not a date' })));
  await assert.rejects(searchAutomotive(base, async () => new Response('<html>error</html>')));
});
test('cancellation and deadline reject even when fetch ignores its signal', async t => {
  const controller = new AbortController();
  const base = { ...config, kind: 'parts', input: { query: 'filtr' }, consent: true };
  let resolve;
  const pending = searchAutomotive({ ...base, signal: controller.signal }, () => new Promise(r => { resolve = r; }));
  controller.abort(); await assert.rejects(pending, { name: 'AbortError' }); resolve(json(parts));
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const timed = searchAutomotive(base, () => new Promise(() => {}));
  const check = assert.rejects(timed, { name: 'TimeoutError' }); t.mock.timers.tick(30000); await check;
});
test('HTTP failures do not leak raw server content or retry requests', async () => {
  let calls = 0;
  await assert.rejects(searchAutomotive({ ...config, kind: 'parts', input: { query: 'filtr' }, consent: true }, async () => { calls++; return new Response('PRIVATE-token', { status: 503 }); }), e => /eBay/.test(e.message) && !e.message.includes('PRIVATE'));
  assert.equal(calls, 1);
});
test('vehicle query uses only public description and map coordinates cannot inject a URL', () => {
  const vehicle = { make: 'Toyota', model: 'Corolla', year: 2020, engine: '1.8', vin: 'PRIVATE', plate: 'PRIVATE' };
  assert.equal(buildPartsQuery('filtr oleju', vehicle), 'filtr oleju Toyota Corolla 2020 1.8');
  assert.equal(buildPartsQuery('90915-YZZJ1'), '90915-YZZJ1');
  assert.equal(new URL(navigationUrl({ latitude: 52, longitude: 21 })).searchParams.get('destination'), '52,21');
  assert.throws(() => navigationUrl({ latitude: '52&token=secret', longitude: 21 }));
});
test('workshop responses validate coordinates, distances, phone schemes and OSM provenance', async () => {
  const base = { ...config, kind: 'workshops', input: { latitude: 52, longitude: 21, radiusKm: 10, category: 'repair' }, consent: true };
  const result = { ...base.input, source: 'OpenStreetMap', fetchedAt: date, limited: false, workshops: [{ id: 'node/1', latitude: 52.01, longitude: 21, distanceM: 1112, name: 'Serwis', address: '', phone: '+48123456789', website: null, openingHours: null }] };
  assert.equal((await searchAutomotive(base, async () => json(result))).workshops.length, 1);
  for (const change of [{ latitude: 200 }, { distanceM: -2 }, { phone: 'tel:evil' }, { website: 'file:///private/secret' }]) await assert.rejects(searchAutomotive(base, async () => json({ ...result, workshops: [{ ...result.workshops[0], ...change }] })));
});
