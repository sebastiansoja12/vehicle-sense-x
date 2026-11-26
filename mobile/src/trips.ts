export type TripPoint = { latitude: number; longitude: number; timestamp: number; accuracy: number | null; speedMps: number | null; segmentBreak?: boolean };
export type TripRecord = { id: string; vehicleId: string; startedAt: number; endedAt: number; label: string; source: 'gps' | 'manual'; points: TripPoint[]; manualDistanceM: number | null; manualDurationS: number | null; fuelCostCents: number | null };

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nonnegative = (value: unknown): value is number => finite(value) && value >= 0;
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const timestamp = (value:unknown):value is number => integer(value) && value <= 253402300799999;
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 200;

function validPoint(value: unknown): value is TripPoint {
  if (!value || typeof value !== 'object') return false;
  const p = value as TripPoint;
  return finite(p.latitude) && Math.abs(p.latitude) <= 90 && finite(p.longitude) && Math.abs(p.longitude) <= 180
    && timestamp(p.timestamp) && (p.accuracy === null || nonnegative(p.accuracy))
    && (p.speedMps === null || nonnegative(p.speedMps)) && (p.segmentBreak === undefined || typeof p.segmentBreak === 'boolean');
}

export function validateTripRecord(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const t = value as TripRecord;
  if (!text(t.id) || !text(t.vehicleId) || !text(t.label) || !timestamp(t.startedAt) || !timestamp(t.endedAt)
    || t.endedAt < t.startedAt || !['gps', 'manual'].includes(t.source)
    || !Array.isArray(t.points) || t.points.length > 10000 || !(t.fuelCostCents === null || integer(t.fuelCostCents))) return false;
  if (t.source === 'manual') {
    return t.points.length === 0 && integer(t.manualDistanceM) && integer(t.manualDurationS);
  }
  if (t.manualDistanceM !== null || t.manualDurationS !== null) return false;
  let previousTime = -Infinity;
  for (const p of t.points) {
    if (!validPoint(p) || p.timestamp <= previousTime || p.timestamp < t.startedAt || p.timestamp > t.endedAt) return false;
    previousTime = p.timestamp;
  }
  return true;
}

function distance(a: TripPoint, b: TripPoint): number {
  const radians = Math.PI / 180;
  const halfLatitude = (b.latitude - a.latitude) * radians / 2;
  const halfLongitude = (b.longitude - a.longitude) * radians / 2;
  const haversine = Math.sin(halfLatitude) ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(halfLongitude) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

/** Timestamps are milliseconds; accuracy is metres and speed is metres/second.
 * Unknown or >30 m accuracy, >70 m/s speed/jumps, and non-increasing times are rejected.
 * Every rejection or gap >30 seconds ends the polyline; no distance crosses that boundary.
 */
export function filterTripPoints(points: TripPoint[]) {
  const segments: TripPoint[][] = [];
  let segment: TripPoint[] | undefined;
  let lastTime = -Infinity;
  let acceptedPoints = 0;
  for (const p of points) {
    const chronological = nonnegative(p?.timestamp) && p.timestamp > lastTime;
    if (chronological) lastTime = p.timestamp;
    if (!validPoint(p) || !chronological || p.accuracy === null || p.accuracy > 30 || (p.speedMps !== null && p.speedMps > 70)) {
      segment = undefined;
      continue;
    }
    if (p.segmentBreak) segment = undefined;
    const previous = segment?.[segment.length - 1];
    if (previous) {
      const seconds = (p.timestamp - previous.timestamp) / 1000;
      if (seconds > 30) segment = undefined;
      else if (distance(previous, p) / seconds > 70) {
        segment = undefined;
        continue;
      }
    }
    if (!segment) {
      segment = [];
      segments.push(segment);
    }
    segment.push(p);
    acceptedPoints++;
  }
  return { segments, acceptedPoints, rejectedPoints: points.length - acceptedPoints };
}

export type TripAnalysis = {
  distanceM: number; durationS: number; averageSpeedKmh: number | null; maxSpeedKmh: number | null;
  accelerationEvents: number | null; brakingEvents: number | null;
  acceptedPoints: number; rejectedPoints: number; segments: TripPoint[][];
};

/** GPS event heuristics: >=2.5 m/s² acceleration or <=-3 m/s² braking, with
 * consecutive measured speeds 1–10 seconds apart. One event per consecutive
 * threshold episode; gaps, missing speeds and ineligible intervals reset it.
 * These thresholds require device/road validation and are not an Eco Score.
 */
export function analyzeTrip(trip: TripRecord): TripAnalysis {
  if (trip.source === 'manual') {
    return { distanceM: trip.manualDistanceM ?? 0, durationS: trip.manualDurationS ?? 0, averageSpeedKmh: null, maxSpeedKmh: null,
      accelerationEvents: null, brakingEvents: null, acceptedPoints: 0, rejectedPoints: 0, segments: [] };
  }
  const filtered = filterTripPoints(trip.points);
  const durationS = Math.max(0, (trip.endedAt - trip.startedAt) / 1000);
  let distanceM = 0;
  let maxSpeedMps: number | null = null;
  let intervals = 0;
  let measuredIntervals = 0;
  let accelerationEvents = 0;
  let brakingEvents = 0;
  for (const segment of filtered.segments) {
    let episode: 'acceleration' | 'braking' | null = null;
    for (let i = 0; i < segment.length; i++) {
      const p = segment[i];
      if (p.speedMps !== null) maxSpeedMps = Math.max(maxSpeedMps ?? 0, p.speedMps);
      if (i === 0) continue;
      const previous = segment[i - 1];
      const seconds = (p.timestamp - previous.timestamp) / 1000;
      const metres = distance(previous, p);
      distanceM += metres;
      intervals++;
      maxSpeedMps = Math.max(maxSpeedMps ?? 0, metres / seconds);
      if (seconds < 1 || seconds > 10 || p.speedMps === null || previous.speedMps === null) {
        episode = null;
        continue;
      }
      measuredIntervals++;
      const acceleration = (p.speedMps - previous.speedMps) / seconds;
      const next = acceleration >= 2.5 ? 'acceleration' : acceleration <= -3 ? 'braking' : null;
      if (next !== episode) {
        if (next === 'acceleration') accelerationEvents++;
        if (next === 'braking') brakingEvents++;
      }
      episode = next;
    }
  }
  return { ...filtered, distanceM, durationS,
    averageSpeedKmh: intervals > 0 && durationS > 0 ? distanceM / durationS * 3.6 : null,
    maxSpeedKmh: maxSpeedMps === null ? null : maxSpeedMps * 3.6,
    accelerationEvents: measuredIntervals ? accelerationEvents : null,
    brakingEvents: measuredIntervals ? brakingEvents : null };
}
