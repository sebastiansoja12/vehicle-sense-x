export type ServiceConfig = { endpoint: string; token: string };
export type Coordinates = { latitude: number; longitude: number };
export type WorkshopCategory = 'repair' | 'tyres' | 'inspection' | 'parts';
export const workshopCategories: Record<WorkshopCategory, string> = { repair: 'Warsztaty', tyres: 'Opony i wulkanizacja', inspection: 'Stacje kontroli', parts: 'Sklepy z częściami' };
export type Place = Coordinates & { id: string; label: string };
export type Workshop = Coordinates & { id: string; name: string; distanceM: number; address: string; phone: string | null; website: string | null; openingHours: string | null };
export type PartOffer = { id: string; title: string; url: string; priceMinor: number; currency: string; shippingMinor: number | null; seller: string | null; condition: string | null };
export type ServiceInputs = {
  places: { query: string };
  workshops: Coordinates & { radiusKm: number; category: WorkshopCategory };
  parts: { query: string };
};
export type ServiceResults = {
  places: { source: 'OpenStreetMap'; fetchedAt: string; places: Place[] };
  workshops: ServiceInputs['workshops'] & { source: 'OpenStreetMap'; fetchedAt: string; limited: boolean; workshops: Workshop[] };
  parts: { source: 'eBay'; marketplace: 'EBAY_PL'; fetchedAt: string; query: string; skipped: number; offers: PartOffer[] };
};
type Kind = keyof ServiceInputs;
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number, empty = false): v is string => typeof v === 'string' && v.length <= max && (empty || v.trim().length > 0) && !/[\u0000-\u001f\u007f]/.test(v);
const coordinate = (v: unknown, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= max;
const coordinates = (v: Record<string, unknown>) => coordinate(v.latitude, 90) && coordinate(v.longitude, 180);
const nonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= 1_000_000_000_000;
const nullableText = (v: unknown, max: number) => v === null || text(v, max);
function invalid(): never { throw new Error('Nieprawidłowe dane wyszukiwania lub odpowiedź serwera.'); }
function safeHttps(value: unknown): value is string {
  if (!text(value, 2048)) return false;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function validateServiceConfig({ endpoint, token }: ServiceConfig): string {
  try {
    if (!text(endpoint, 2048) || endpoint.trim() !== endpoint || /[?#]/.test(endpoint)) throw new Error();
    const url = new URL(endpoint);
    if (url.username || url.password || url.pathname !== '/' || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) throw new Error();
    if (!/^[A-Za-z0-9._~-]{32,512}$/.test(token)) throw new Error();
    return url.origin;
  } catch { throw new Error('Podaj adres HTTPS serwera i token aplikacji (32–512 znaków). HTTP jest dostępny tylko lokalnie.'); }
}
function minimalInput(kind: Kind, value: unknown): ServiceInputs[Kind] {
  if (!object(value)) return invalid();
  if (kind === 'places' || kind === 'parts') {
    if (!text(value.query, kind === 'parts' ? 160 : 120) || value.query.trim().length < 2) return invalid();
    return { query: value.query.trim() };
  }
  if (!coordinates(value) || ![5, 10, 25].includes(value.radiusKm as number) || typeof value.category !== 'string' || !Object.hasOwn(workshopCategories, value.category)) return invalid();
  return { latitude: value.latitude as number, longitude: value.longitude as number, radiusKm: value.radiusKm as number, category: value.category as WorkshopCategory };
}
function decode<K extends Kind>(kind: K, value: unknown): ServiceResults[K] {
  if (!object(value) || !text(value.fetchedAt, 40) || !Number.isFinite(Date.parse(value.fetchedAt))) return invalid();
  if (kind === 'places') {
    if (value.source !== 'OpenStreetMap' || !Array.isArray(value.places) || value.places.length > 5 || value.places.some(p => !object(p) || !coordinates(p) || !text(p.id, 100) || !text(p.label, 500))) return invalid();
  } else if (kind === 'workshops') {
    minimalInput(kind, value);
    if (value.source !== 'OpenStreetMap' || typeof value.limited !== 'boolean' || !Array.isArray(value.workshops) || value.workshops.length > 50 || value.workshops.some(p => !object(p) || !coordinates(p) || !text(p.id, 100) || !/^(node|way|relation)\/\d+$/.test(p.id) || !text(p.name, 200) || !text(p.address, 300, true) || !nonnegative(p.distanceM) || p.distanceM > (value.radiusKm as number) * 1000 || !nullableText(p.openingHours, 200) || !(p.website === null || safeHttps(p.website)) || !(p.phone === null || typeof p.phone === 'string' && /^\+?\d{6,15}$/.test(p.phone)))) return invalid();
  } else {
    if (value.source !== 'eBay' || value.marketplace !== 'EBAY_PL' || !text(value.query, 160) || !nonnegative(value.skipped) || !Array.isArray(value.offers) || value.offers.length > 20 || value.offers.some(p => !object(p) || !text(p.id, 100) || !text(p.title, 300) || !safeHttps(p.url) || !/(^|\.)ebay\.(pl|de|com|co\.uk|fr|it|es|nl|at|ie|ch)$/.test(new URL(p.url).hostname) || !nonnegative(p.priceMinor) || !['PLN', 'EUR', 'USD', 'GBP', 'CHF', 'CZK', 'SEK', 'DKK', 'NOK'].includes(p.currency as string) || !(p.shippingMinor === null || nonnegative(p.shippingMinor)) || !nullableText(p.seller, 100) || !nullableText(p.condition, 100))) return invalid();
  }
  return value as unknown as ServiceResults[K];
}
async function readResponse(response: Response): Promise<unknown> {
  const limit = 131_072;
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '') || Number(response.headers.get('content-length')) > limit) return invalid();
  let raw = '';
  if (!response.body?.getReader) {
    // Native fetch buffers text; the private server also limits provider responses and result counts.
    raw = await response.text(); if (raw.length > limit) return invalid();
  } else {
    const reader = response.body.getReader(), decoder = new TextDecoder(); let bytes = 0;
    try {
      while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.byteLength; if (bytes > limit) return invalid(); raw += decoder.decode(chunk.value, { stream: true }); }
      raw += decoder.decode();
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
  try { return JSON.parse(raw); } catch { return invalid(); }
}
export async function searchAutomotive<K extends Kind>(options: ServiceConfig & { kind: K; input: ServiceInputs[K]; consent: boolean; signal?: AbortSignal }, fetchImpl: typeof fetch = fetch): Promise<ServiceResults[K]> {
  if (options.consent !== true) throw new Error('Najpierw zaznacz zgodę na wysłanie zapytania do dostawcy danych.');
  const origin = validateServiceConfig(options), body = minimalInput(options.kind, options.input);
  const controller = new AbortController(); let failure: Error | null = null;
  let rejectStop: (error: Error) => void = () => {};
  const stopped = new Promise<never>((_, reject) => { rejectStop = reject; });
  function stop(timeout = false) {
    const error = new Error(timeout ? 'Przekroczono czas wyszukiwania. Spróbuj później.' : 'Anulowano wyszukiwanie.');
    error.name = timeout ? 'TimeoutError' : 'AbortError'; failure = error; controller.abort(); rejectStop(error);
  }
  const abort = () => stop();
  const timer = setTimeout(() => stop(true), 30_000);
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    if (options.signal?.aborted) stop();
    const request = async () => {
      if (failure) throw failure;
      const response = await fetchImpl(`${origin}/automotive/${options.kind}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${options.token}` }, body: JSON.stringify(body), signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' });
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        const messages: Record<number, string> = { 400: 'Sprawdź zapytanie i lokalizację.', 401: 'Nieprawidłowy token aplikacji.', 403: 'Serwer nie zezwala na połączenie z tej przeglądarki.', 429: 'Limit zapytań. Odczekaj chwilę i spróbuj ponownie.', 503: options.kind === 'parts' ? 'Ceny części wymagają konfiguracji konta eBay na serwerze.' : 'Usługi samochodowe wymagają konfiguracji serwera.', 504: 'Dostawca nie odpowiedział na czas. Spróbuj później.' };
        throw new Error(messages[response.status] || 'Dostawca danych jest chwilowo niedostępny.');
      }
      return decode(options.kind, await readResponse(response));
    };
    return await Promise.race([request(), stopped]);
  } catch (error) {
    if (failure) throw failure;
    if (error instanceof TypeError) throw new Error('Nie można połączyć się z usługą. Sprawdź adres serwera i internet.');
    throw error;
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); controller.abort(); }
}
export function buildPartsQuery(part: string, vehicle?: { make: string; model: string; year: number; engine: string }): string {
  const query = [part.trim(), ...(vehicle ? [vehicle.make, vehicle.model, String(vehicle.year), vehicle.engine] : [])].join(' ').replace(/\s+/g, ' ').trim();
  if (part.trim().length < 2 || !text(query, 160)) throw new Error('Wpisz część lub numer OEM. Całe zapytanie może mieć do 160 znaków.');
  return query;
}
export function navigationUrl(position: Coordinates): string {
  if (!coordinates(position)) return invalid();
  return `https://www.google.com/maps/dir/?api=1&destination=${position.latitude},${position.longitude}&travelmode=driving`;
}
