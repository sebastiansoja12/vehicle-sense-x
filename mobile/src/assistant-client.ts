import {validCanEcu} from './obd/can.ts';
import type {CanEcu} from './obd/can.ts';
/** Only this explicit, consented summary is sent. Unknown fields are dropped. */
export type AssistantContext = {
  vehicle: { make: string; model: string; year: number; engine: string; mileage: number };
  fuelSummary?: { consumption: number | null; totalCents: number };
  recentServices: { date: string; title: string; mileage: number; costCents: number }[];
  diagnostics?: {
    timestamp: number;
    codes: string[];
    parameters: { rpm: number | null; coolantC: number | null; loadPercent: number | null; voltageV: number | null };
    ecu?:CanEcu;
  };
};
type AssistantRequest = { endpoint: string; token: string; question: string; context: AssistantContext; signal?: AbortSignal };
class AssistantError extends Error {}
function invalid(): never { throw new AssistantError('Nieprawidłowe pytanie lub dane pojazdu.'); }
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return invalid();
  return value.trim();
}
function number(value: unknown, min: number, max: number, integer = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) return invalid();
  return value;
}
const nullable = (value: unknown, min: number, max: number): number | null => value === null ? null : number(value, min, max);
function minimalContext(value: unknown): AssistantContext {
  if (!object(value) || !object(value.vehicle) || !Array.isArray(value.recentServices) || value.recentServices.length > 20) return invalid();
  const v = value.vehicle;
  const result: AssistantContext = {
    vehicle: { make: text(v.make, 80), model: text(v.model, 80), year: number(v.year, 1886, 2100, true), engine: text(v.engine, 120), mileage: number(v.mileage, 0, 10_000_000, true) },
    recentServices: value.recentServices.map((item: unknown) => {
      if (!object(item) || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Date.parse(item.date)) || new Date(item.date).toISOString().slice(0, 10) !== item.date) return invalid();
      return { date: item.date, title: text(item.title, 120), mileage: number(item.mileage, 0, 10_000_000, true), costCents: number(item.costCents, 0, 1_000_000_000_000, true) };
    }),
  };
  if (value.fuelSummary !== undefined) {
    if (!object(value.fuelSummary)) return invalid();
    result.fuelSummary = { consumption: nullable(value.fuelSummary.consumption, 0, 1000), totalCents: number(value.fuelSummary.totalCents, 0, 1_000_000_000_000, true) };
  }
  if (value.diagnostics !== undefined) {
    const d = value.diagnostics;
    if (!object(d) || !object(d.parameters) || !Array.isArray(d.codes) || d.codes.length > 50 || d.codes.some(code => typeof code !== 'string' || !/^[PCBU][0-3][0-9A-F]{3}$/.test(code))) return invalid();
    result.diagnostics = { timestamp: number(d.timestamp, 0, 8_640_000_000_000_000, true), codes: [...d.codes], parameters: { rpm: nullable(d.parameters.rpm, 0, 20_000), coolantC: nullable(d.parameters.coolantC, -80, 250), loadPercent: nullable(d.parameters.loadPercent, 0, 100), voltageV: nullable(d.parameters.voltageV, 0, 100) } };
    if(d.ecu!==undefined){if(!validCanEcu(d.ecu))return invalid();result.diagnostics.ecu={protocol:d.ecu.protocol,responseId:d.ecu.responseId};}
  }
  return result;
}
function assistantUrl(endpoint: string): string {
  try {
    if (typeof endpoint !== 'string' || endpoint !== endpoint.trim() || /[?#]/.test(endpoint) || /^\w+:\/\/[^/]*@/.test(endpoint)) throw new Error();
    const url = new URL(endpoint);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) || url.username || url.password || url.pathname !== '/') throw new Error();
    return new URL('/assistant', url).href;
  } catch { throw new AssistantError('Podaj adres HTTPS serwera asystenta (HTTP tylko lokalnie).'); }
}
async function responseText(response: Response): Promise<string> {
  const invalidResponse = () => new AssistantError('Nieprawidłowa odpowiedź serwera asystenta.');
  if (Number(response.headers.get('content-length')) > 32_768) throw invalidResponse();
  // Native fetch may expose only text(); the trusted proxy also bounds its response.
  if (!response.body?.getReader) {
    const value = await response.text();
    if (value.length > 32_768) throw invalidResponse();
    return value;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0, value = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 32_768) throw invalidResponse();
      value += decoder.decode(chunk.value, { stream: true });
    }
    return value + decoder.decode();
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

/** endpoint is the server origin. Never put an OpenAI key in this client. */
export async function askAssistant({ endpoint, token, question, context, signal }: AssistantRequest): Promise<string> {
  const url = assistantUrl(endpoint);
  if (typeof token !== 'string' || !/^[A-Za-z0-9._~-]{32,512}$/.test(token)) throw new AssistantError('Nieprawidłowy token asystenta.');
  const body = JSON.stringify({ question: text(question, 2000), context: minimalContext(context) });
  if (body.length > 16_384) return invalid();
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 30_000);
  signal?.addEventListener('abort', abort, { once: true });
  try {
    if (signal?.aborted) controller.abort();
    if (controller.signal.aborted) throw new Error();
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body, signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      const messages: Record<number, string> = { 400: 'Nieprawidłowe pytanie lub dane pojazdu.', 401: 'Nieprawidłowy token asystenta.', 403: 'Serwer nie zezwala na to źródło żądania.', 413: 'Żądanie jest zbyt duże.', 429: 'Limit zapytań. Spróbuj ponownie później.', 503: 'Asystent AI nie jest skonfigurowany.', 504: 'Przekroczono czas odpowiedzi asystenta.' };
      throw new AssistantError(messages[response.status] || 'Asystent AI jest chwilowo niedostępny.');
    }
    const raw = await responseText(response);
    let result: unknown;
    try { result = JSON.parse(raw); } catch { throw new AssistantError('Nieprawidłowa odpowiedź serwera asystenta.'); }
    if (!object(result) || typeof result.answer !== 'string' || !result.answer.trim() || result.answer.length > 8000) throw new AssistantError('Nieprawidłowa odpowiedź serwera asystenta.');
    return result.answer.trim();
  } catch (error) {
    if (controller.signal.aborted) {
      const aborted = new Error(timedOut ? 'Przekroczono czas odpowiedzi asystenta.' : 'Przerwano zapytanie do asystenta.');
      aborted.name = timedOut ? 'TimeoutError' : 'AbortError';
      throw aborted;
    }
    if (error instanceof AssistantError) throw error;
    throw new AssistantError('Nie można połączyć się z asystentem. Sprawdź adres i połączenie.');
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
