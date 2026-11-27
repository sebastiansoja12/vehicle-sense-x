export class ServiceError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value, max = 300) => typeof value === 'string' && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : '';
function query(value, max) {
  const result = string(value, max);
  if (result.length < 2) throw new ServiceError(400, 'Wpisz zapytanie o długości od 2 do ' + max + ' znaków.');
  return result;
}
const coordinate = (value, max) => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= max;
function https(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function endpoint(value, fallback) {
  const result = https(value || fallback);
  if (!result) throw new Error('Automotive provider endpoint must use HTTPS');
  return result;
}
function distance(a, b) {
  const rad = x => x * Math.PI / 180;
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return Math.round(12_742_000 * Math.asin(Math.sqrt(Math.min(1, h))));
}
const filters = { repair: '[shop="car_repair"]', tyres: '[shop="tyres"]', inspection: '[amenity="vehicle_inspection"]', parts: '[shop="car_parts"]' };
function money(value) {
  if (!object(value) || !['PLN', 'EUR', 'USD', 'GBP', 'CHF', 'CZK', 'SEK', 'DKK', 'NOK'].includes(value.currency) || typeof value.value !== 'string' || !/^\d{1,9}(?:\.\d{1,2})?$/.test(value.value)) return null;
  const [whole, fraction = ''] = value.value.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(minor) ? { minor, currency: value.currency } : null;
}
async function boundedJson(response) {
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    throw new ServiceError(response.status === 429 ? 429 : 502, response.status === 429 ? 'Dostawca ograniczył zapytania. Spróbuj później.' : 'Dostawca danych jest chwilowo niedostępny.');
  }
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '') || Number(response.headers.get('content-length')) > 1_048_576) {
    await response.body?.cancel().catch(() => {});
    throw new Error('Invalid provider response');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing provider response');
  let bytes = 0, raw = ''; const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      bytes += chunk.value.byteLength; if (bytes > 1_048_576) throw new Error('Provider response too large');
      raw += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(raw + decoder.decode());
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

/** Provider URLs are operator configuration, never accepted from request bodies. */
export function createAutomotiveService({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const overpass = endpoint(env.OVERPASS_URL, 'https://overpass-api.de/api/interpreter');
  const nominatim = endpoint(env.NOMINATIM_URL, 'https://nominatim.openstreetmap.org/search');
  const partsConfigured = Boolean(string(env.EBAY_CLIENT_ID, 512) && string(env.EBAY_CLIENT_SECRET, 512));
  const cache = new Map();
  let geocodeAfter = 0, overpassAfter = 0, access = null;
  const cached = key => { const hit = cache.get(key); if (hit && hit.expires > Date.now()) return hit.value; cache.delete(key); return null; };
  const remember = (key, value, ttl) => {
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, { value, expires: Date.now() + ttl }); return value;
  };
  async function request(url, init, signal) {
    try {
      const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(22_000)]) : AbortSignal.timeout(22_000);
      return await boundedJson(await fetchImpl(url, { ...init, signal: combined, redirect: 'error' }));
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(signal?.aborted || error?.name === 'TimeoutError' ? 504 : 502, 'Nie udało się pobrać danych dostawcy. Spróbuj ponownie później.');
    }
  }
  return {
    partsConfigured,
    async places(body, signal) {
      const text = query(body?.query, 120), key = 'place:' + text.toLocaleLowerCase('pl');
      const hit = cached(key); if (hit) return hit;
      if (Date.now() < geocodeAfter) throw new ServiceError(429, 'Odczekaj chwilę przed kolejnym wyszukiwaniem miejscowości.');
      geocodeAfter = Date.now() + 1100;
      const url = new URL(nominatim);
      url.search = new URLSearchParams({ q: text, format: 'jsonv2', countrycodes: 'pl', limit: '5', 'accept-language': 'pl' }).toString();
      const raw = await request(url.href, { headers: { 'user-agent': 'VehicleSenseX/0.4 (private automotive search)', accept: 'application/json' } }, signal);
      if (!Array.isArray(raw)) throw new ServiceError(502, 'Nieprawidłowa odpowiedź wyszukiwarki miejscowości.');
      const places = raw.slice(0, 5).flatMap(p => {
        if (!object(p) || !string(p.display_name, 500) || typeof p.lat !== 'string' || typeof p.lon !== 'string' || !p.lat.trim() || !p.lon.trim()) return [];
        const latitude = Number(p.lat), longitude = Number(p.lon);
        return coordinate(latitude, 90) && coordinate(longitude, 180) ? [{ id: String(p.place_id), label: p.display_name, latitude, longitude }] : [];
      });
      if (raw.length && !places.length) throw new ServiceError(502, 'Nieprawidłowe współrzędne miejscowości.');
      return remember(key, { source: 'OpenStreetMap', fetchedAt: new Date().toISOString(), places }, 86_400_000);
    },
    async workshops(body, signal) {
      if (!object(body) || !coordinate(body.latitude, 90) || !coordinate(body.longitude, 180) || ![5, 10, 25].includes(body.radiusKm) || !Object.hasOwn(filters, body.category)) throw new ServiceError(400, 'Sprawdź lokalizację, kategorię i promień wyszukiwania.');
      const { latitude, longitude, radiusKm, category } = body;
      const key = `shop:${latitude}:${longitude}:${radiusKm}:${category}`;
      const hit = cached(key); if (hit) return hit;
      if (Date.now() < overpassAfter) throw new ServiceError(429, 'Odczekaj chwilę przed kolejnym wyszukiwaniem warsztatów.');
      overpassAfter = Date.now() + 2000;
      const raw = await request(overpass, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body: new URLSearchParams({ data: `[out:json][timeout:18];nwr${filters[category]}(around:${radiusKm * 1000},${latitude},${longitude});out center tags 200;` }).toString() }, signal);
      if (!object(raw) || !Array.isArray(raw.elements) || raw.remark) throw new ServiceError(502, 'Niepełny wynik wyszukiwania warsztatów. Spróbuj ponownie lub zmniejsz promień.');
      const seen = new Set();
      const workshops = raw.elements.flatMap(p => {
        if (!object(p) || !['node', 'way', 'relation'].includes(p.type) || !Number.isSafeInteger(p.id) || !object(p.tags)) return [];
        const latitude = p.lat ?? p.center?.lat, longitude = p.lon ?? p.center?.lon;
        if (!coordinate(latitude, 90) || !coordinate(longitude, 180)) return [];
        const distanceM = distance(body, { latitude, longitude }), id = `${p.type}/${p.id}`;
        if (distanceM > radiusKm * 1000 || seen.has(id)) return [];
        seen.add(id); const t = p.tags;
        const phone = string(t['contact:phone'] || t.phone, 40).replace(/[\s()-]/g, '');
        return [{ id, latitude, longitude, distanceM, name: string(t.name, 200) || 'Obiekt bez nazwy w OpenStreetMap',
          address: [string(t['addr:street'], 120), string(t['addr:housenumber'], 20), string(t['addr:postcode'], 20), string(t['addr:city'], 120)].filter(Boolean).join(' '),
          phone: /^\+?\d{6,15}$/.test(phone) ? phone : null, website: https(t['contact:website'] || t.website), openingHours: string(t.opening_hours, 200) || null }];
      }).sort((a, b) => a.distanceM - b.distanceM).slice(0, 50);
      return remember(key, { source: 'OpenStreetMap', fetchedAt: new Date().toISOString(), latitude, longitude, radiusKm, category, limited: raw.elements.length >= 200 || workshops.length >= 50, workshops }, 300_000);
    },
    async parts(body, signal) {
      const text = query(body?.query, 160);
      if (!partsConfigured) throw new ServiceError(503, 'Ceny części wymagają konfiguracji konta eBay na serwerze.');
      if (!access || access.expires <= Date.now()) {
        const raw = await request('https://api.ebay.com/identity/v1/oauth2/token', {
          method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', authorization: 'Basic ' + Buffer.from(env.EBAY_CLIENT_ID + ':' + env.EBAY_CLIENT_SECRET).toString('base64') },
          body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'https://api.ebay.com/oauth/api_scope' }).toString(),
        }, signal);
        if (!object(raw) || !string(raw.access_token, 8192) || !Number.isInteger(raw.expires_in) || raw.expires_in < 60) throw new ServiceError(502, 'Nie udało się uwierzytelnić dostawcy ofert.');
        access = { token: raw.access_token, expires: Date.now() + Math.min(raw.expires_in - 30, 7200) * 1000 };
      }
      const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
      url.search = new URLSearchParams({ q: text, limit: '20', filter: 'buyingOptions:{FIXED_PRICE},deliveryCountry:PL' }).toString();
      const raw = await request(url.href, { headers: { authorization: 'Bearer ' + access.token, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_PL', accept: 'application/json' } }, signal);
      if (!object(raw) || (raw.itemSummaries !== undefined && !Array.isArray(raw.itemSummaries)) || (raw.itemSummaries === undefined && raw.total !== 0)) throw new ServiceError(502, 'Nieprawidłowa odpowiedź dostawcy ofert.');
      const seen = new Set();
      const items = (raw.itemSummaries || []).slice(0, 20);
      const offers = items.flatMap(p => {
        if (!object(p)) return [];
        const price = money(p.price), link = https(p.itemWebUrl);
        if (!price || !link || !/(^|\.)ebay\.(pl|de|com|co\.uk|fr|it|es|nl|at|ie|ch)$/.test(new URL(link).hostname) || !string(p.title, 300) || !string(p.itemId, 100) || seen.has(p.itemId)) return [];
        seen.add(p.itemId);
        const shipping = (Array.isArray(p.shippingOptions) ? p.shippingOptions : []).map(s => money(s?.shippingCost)).filter(s => s?.currency === price.currency).map(s => s.minor);
        return [{ id: p.itemId, title: p.title, url: link, priceMinor: price.minor, currency: price.currency, shippingMinor: shipping.length ? Math.min(...shipping) : null, seller: string(p.seller?.username, 100) || null, condition: string(p.condition, 100) || null }];
      });
      return { source: 'eBay', marketplace: 'EBAY_PL', fetchedAt: new Date().toISOString(), query: text, skipped: items.length - offers.length, offers };
    },
  };
}
