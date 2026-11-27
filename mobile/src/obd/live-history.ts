import type { LiveParameters } from './types.ts';

export const LIVE_HISTORY_LIMIT = 300;
export type LiveHistorySample = LiveParameters & { breakBefore?: boolean };
function scope(value: LiveParameters): string { return `${value.vehicleId}:${value.ecu?.protocol ?? ''}:${value.ecu?.responseId ?? ''}`; }
export function appendLiveSample(history: readonly LiveHistorySample[], next: LiveHistorySample): LiveHistorySample[] {
  const previous = history.at(-1);
  if (previous && (scope(previous) !== scope(next) || next.timestamp < previous.timestamp)) return [next];
  return [...history.slice(-(LIVE_HISTORY_LIMIT - 1)), next];
}
export function liveSeries(history: readonly LiveHistorySample[], pid: number) {
  const observations = history.map(sample => sample.measurements?.find(m => m.pid === pid));
  const known = observations.filter(m => m && m.value !== null && Number.isFinite(m.value));
  const values = known.map(m => m!.value!);
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  const times = history.map((sample, index) => observations[index]?.readAt ?? sample.timestamp);
  const from = times.length ? Math.min(...times) : null;
  const to = times.length ? Math.max(...times) : null;
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] | null = null;
  for (const [index, observation] of observations.entries()) {
    if (history[index].breakBefore) current = null;
    if (!observation || observation.value === null || !Number.isFinite(observation.value)) { current = null; continue; }
    if (!current) { current = []; segments.push(current); }
    current.push({ x: from === to ? 0.5 : (observation.readAt - from!) / (to! - from!), y: min === max ? 0.5 : (max! - observation.value) / (max! - min!) });
  }
  const latest = observations.at(-1)?.value;
  return { segments, count: values.length, min, max, mean: values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null, current: typeof latest === 'number' && Number.isFinite(latest) ? latest : null, from, to };
}
