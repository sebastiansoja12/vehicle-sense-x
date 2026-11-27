import test from 'node:test';
import assert from 'node:assert/strict';
import { createAutomotiveService } from './automotive.mjs';
import { createAssistantServer } from './index.mjs';

const json = body => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const token = 'automotive-test-token-at-least-32-chars';
const env = { APP_API_TOKEN: token, EBAY_CLIENT_ID: 'test-client', EBAY_CLIENT_SECRET: 'test-secret' };
const location = { latitude: 52.23, longitude: 21.01, radiusKm: 10, category: 'repair' };
const item = { itemId: 'v1|123|0', title: 'Filtr oleju', itemWebUrl: 'https://www.ebay.pl/itm/123', price: { value: '49.99', currency: 'PLN' }, seller: { username: 'parts-shop' }, condition: 'New' };
const osm = { type: 'node', id: 1, lat: 52.231, lon: 21.011, tags: { shop: 'car_repair', name: 'Serwis', 'addr:street': 'Testowa', 'addr:housenumber': '3', 'contact:phone': '+48 123 456 789', website: 'javascript:alert(1)' } };
test('places are explicit Polish searches, cached and rate limited across different queries', async () => {
  const calls = [];
  const service = createAutomotiveService({ env, fetchImpl: async (url, init) => { calls.push({ url: new URL(url), init }); return json([{ place_id: 1, lat: '52.23', lon: '21.01', display_name: 'Warszawa, Polska' }]); } });
  const first = await service.places({ query: 'Warszawa', vin: 'PRIVATE' });
  assert.equal(first.places[0].latitude, 52.23);
  assert.deepEqual(await service.places({ query: 'Warszawa' }), first);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.hostname, 'nominatim.openstreetmap.org');
  assert.equal(calls[0].url.searchParams.get('countrycodes'), 'pl');
  assert.ok(!calls[0].url.href.includes('PRIVATE'));
  assert.match(calls[0].init.headers['user-agent'], /VehicleSenseX/);
  await assert.rejects(service.places({ query: 'Kraków' }), { status: 429 });
});
test('workshops filter radius, validate types, handle polygon centres, deduplicate and sort by distance', async () => {
  let request;
  const service = createAutomotiveService({ env, fetchImpl: async (url, init) => { request = { url, init }; return json({ elements: [
    { ...osm, id: 2, lat: 52.24 }, osm, osm,
    { ...osm, id: 3, lat: 50 }, { ...osm, id: 4, lat: '52.23' },
    { ...osm, type: 'way', id: 5, lat: undefined, lon: undefined, center: { lat: 52.2301, lon: 21.01 } },
  ] }); } });
  const result = await service.workshops(location);
  assert.equal(result.workshops.length, 3);
  assert.equal(result.workshops[0].id, 'way/5');
  assert.equal(result.workshops[1].website, null);
  assert.equal(result.workshops[1].phone, '+48123456789');
  assert.match(result.workshops[1].address, /Testowa 3/);
  assert.equal(result.source, 'OpenStreetMap');
  assert.match(new URLSearchParams(request.init.body).get('data'), /around:10000,52.23,21.01/);
  assert.equal(request.init.redirect, 'error');
  assert.ok(!JSON.stringify(result).includes('alert(1)'));
});
test('invalid requests never reach a provider and partial Overpass responses are errors', async () => {
  const service = createAutomotiveService({ env, fetchImpl: () => assert.fail('invalid input reached upstream') });
  for (const input of [{ ...location, latitude: '52' }, { ...location, radiusKm: 1000 }, { ...location, longitude: Infinity }, { ...location, category: '"]evil' }]) await assert.rejects(service.workshops(input), { status: 400 });
  for (const query of ['', 'x'.repeat(161), 'A\nB']) await assert.rejects(service.parts({ query }), { status: 400 });
  const partial = createAutomotiveService({ env, fetchImpl: async () => json({ remark: 'runtime error: timeout', elements: [] }) });
  await assert.rejects(partial.workshops(location), { status: 502 });
});
test('part prices use server OAuth and EBAY_PL; unknown shipping stays unknown; tokens are reused', async () => {
  const calls = [];
  const service = createAutomotiveService({ env, fetchImpl: async (url, init) => {
    calls.push({ url: new URL(url), init });
    return url.includes('/oauth2/') ? json({ access_token: 'provider-private-token', expires_in: 7200 }) : json({ itemSummaries: [item, { ...item, itemId: '2', price: { value: '60.00', currency: 'EUR' }, shippingOptions: [{ shippingCost: { value: '4.20', currency: 'EUR' } }] }] });
  } });
  const result = await service.parts({ query: 'filtr Toyota Corolla', vin: 'PRIVATE' });
  assert.equal(result.offers[0].priceMinor, 4999);
  assert.equal(result.offers[0].shippingMinor, null);
  assert.equal(result.offers[1].currency, 'EUR');
  assert.equal(result.offers[1].shippingMinor, 420);
  assert.equal(calls[1].init.headers['X-EBAY-C-MARKETPLACE-ID'], 'EBAY_PL');
  assert.equal(calls[1].url.searchParams.get('filter'), 'buyingOptions:{FIXED_PRICE},deliveryCountry:PL');
  assert.ok(!calls[1].url.href.includes('PRIVATE'));
  assert.ok(!JSON.stringify(result).includes('provider-private-token'));
  await service.parts({ query: 'tarcze' });
  assert.equal(calls.filter(c => c.url.pathname.includes('/oauth2/')).length, 1);
});
test('malformed money, foreign links and incomplete provider JSON never become plausible offers', async () => {
  const service = createAutomotiveService({ env, fetchImpl: async url => url.includes('/oauth2/') ? json({ access_token: 'secret', expires_in: 7200 }) : json({ itemSummaries: [
    item, { ...item, itemId: '2', itemWebUrl: 'https://ebay.pl.evil.test/itm/1' },
    { ...item, itemId: '3', price: { value: '-10', currency: 'PLN' } },
    { ...item, itemId: '4', price: { value: '1.001', currency: 'PLN' } },
    { ...item, itemId: '5', shippingOptions: [{ shippingCost: { value: '12', currency: 'USD' } }] },
  ] }) });
  const result = await service.parts({ query: 'filtr' });
  assert.equal(result.offers.length, 2);
  assert.equal(result.offers[1].shippingMinor, null);
  assert.ok(result.skipped > 0);
  const broken = createAutomotiveService({ env, fetchImpl: async () => json({}) });
  await assert.rejects(broken.workshops(location), { status: 502 });
});
test('no keys and provider failures are explicit errors, not empty or invented results', async () => {
  const unconfigured = createAutomotiveService({ env: {}, fetchImpl: () => assert.fail('missing keys reached provider') });
  await assert.rejects(unconfigured.parts({ query: 'filtr' }), { status: 503 });
  const failure = createAutomotiveService({ env, fetchImpl: async () => new Response('PRIVATE', { status: 429 }) });
  await assert.rejects(failure.workshops(location), e => e.status === 429 && !e.message.includes('PRIVATE'));
  const oversized = createAutomotiveService({ env, fetchImpl: async () => json({ pad: 'x'.repeat(1_100_000) }) });
  await assert.rejects(oversized.workshops(location), { status: 502 });
});
test('authenticated automotive routes work without OpenAI configuration and preserve CORS and method controls', async () => {
  let calls = 0;
  const server = createAssistantServer({ env: { APP_API_TOKEN: token, ALLOWED_ORIGINS: 'https://app.example.com' }, fetchImpl: async () => { calls++; return json({ elements: [osm] }); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, auth = token) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${auth}` }, body: JSON.stringify(body) });
  try {
    assert.equal((await post('/automotive/workshops', location, 'wrong')).status, 401);
    assert.equal(calls, 0);
    assert.equal((await post('/automotive/workshops', location)).status, 200);
    assert.equal((await post('/automotive/parts', { query: 'filtr' })).status, 503);
    assert.equal((await fetch(base + '/automotive/workshops')).status, 405);
    const preflight = await fetch(base + '/automotive/workshops', { method: 'OPTIONS', headers: { origin: 'https://app.example.com', 'access-control-request-method': 'POST' } });
    assert.equal(preflight.status, 204);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
