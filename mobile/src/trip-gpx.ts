import type {TripRecord} from './trips.ts';
import {analyzeTrip, validateTripRecord} from './trips.ts';

// GPX coordinates are XML decimals; exponent notation is not allowed.
const decimal = (value: number) => String(value).replace(/^(-?)(\d)(?:\.(\d+))?e-(\d+)$/, (_match, sign: string, digit: string, fraction: string | undefined, exponent: string) => sign + '0.' + '0'.repeat(Number(exponent) - 1) + digit + (fraction ?? ''));

export function tripGpx(trip: TripRecord): string {
  if (!validateTripRecord(trip)) throw new Error('Nieprawidłowy przejazd. Nie można utworzyć pliku GPX.');
  if (trip.source !== 'gps') throw new Error('Przejazd ręczny nie zawiera śladu GPS do eksportu GPX.');
  const {segments, acceptedPoints} = analyzeTrip(trip);
  if (acceptedPoints < 2) throw new Error('Eksport GPX wymaga co najmniej 2 poprawnych punktów GPS.');
  if (/[^\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u.test(trip.label)) throw new Error('Nazwa przejazdu zawiera niedozwolone znaki XML.');
  const name = trip.label.replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[character]!));
  // GPX excludes +180°, so use its equivalent WGS84 meridian −180°.
  const track = segments.map(segment => '<trkseg>' + segment.map(point => `<trkpt lat="${decimal(point.latitude)}" lon="${decimal(point.longitude === 180 ? -180 : point.longitude)}"><time>${new Date(point.timestamp).toISOString()}</time></trkpt>`).join('') + '</trkseg>').join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="VehicleSenseX" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${name}</name>${track}</trk></gpx>`;
}
