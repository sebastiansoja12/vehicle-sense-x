import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {tripGpx} from '../src/trip-gpx.ts';

const point = (seconds, patch = {}) => ({latitude: 52, longitude: 21, timestamp: Date.UTC(2026, 10, 26) + seconds * 1000, accuracy: 5, speedMps: null, ...patch});
const trip = (points = [point(0), point(5, {longitude: 21.0001})], patch = {}) => ({id: 't1', vehicleId: 'v1', startedAt: point(0).timestamp, endedAt: point(120).timestamp, label: 'Przejazd', source: 'gps', points, manualDistanceM: null, manualDurationS: null, fuelCostCents: null, ...patch});

test('GPX exports actual coordinates and UTC sample times without inventing measurements or modifying the trip', () => {
  const recorded = trip();
  const before = structuredClone(recorded);
  const xml = tripGpx(recorded);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<gpx\b[^>]*version="1.1"[^>]*creator="VehicleSenseX"[^>]*xmlns="http:\/\/www.topografix.com\/GPX\/1\/1"/);
  assert.match(xml, /<trk><name>Przejazd<\/name>/);
  assert.match(xml, /<trkpt lat="52" lon="21"><time>2026-11-26T00:00:00.000Z<\/time><\/trkpt>/);
  assert.match(xml, /<trkpt lat="52" lon="21.0001"><time>2026-11-26T00:00:05.000Z<\/time><\/trkpt>/);
  assert.equal((xml.match(/<trkpt /g) ?? []).length, 2);
  assert.doesNotMatch(xml, /<(?:ele|speed|distance|extensions|rte|wpt)\b/);
  assert.deepEqual(recorded, before);
});

test('GPX rejects malformed records and nonchronological samples instead of sorting or repairing input', () => {
  for (const invalid of [null, {}, trip([], {source: 'demo'}), trip([], {endedAt: Infinity}), trip([point(1), point(0)]), trip([point(0), point(0)]), trip([point(0), point(1, {latitude: NaN})]), trip([point(0), point(121)])]) {
    assert.throws(() => tripGpx(invalid), /Nieprawidłowy przejazd/);
  }
});

test('GPX refuses manual distance and GPS recordings with fewer than two accepted points', () => {
  assert.throws(() => tripGpx(trip([], {source: 'manual', manualDistanceM: 1000, manualDurationS: 60})), /ręczny/);
  for (const points of [[], [point(0)], [point(0, {accuracy: null}), point(5, {accuracy: 31})], [point(0), point(5, {speedMps: 71})], [point(0), point(5, {longitude: 22})]]) {
    assert.throws(() => tripGpx(trip(points)), /co najmniej 2 poprawnych punktów GPS/);
  }
});

test('GPX preserves every rejected-sample, long-gap and explicit-pause boundary including singleton segments', () => {
  const xml = tripGpx(trip([point(0), point(5), point(10, {accuracy: null}), point(15), point(20), point(55), point(60, {segmentBreak: true}), point(65, {speedMps: 71}), point(70), point(71, {longitude: 22}), point(75)]));
  const segments = [...xml.matchAll(/<trkseg>(.*?)<\/trkseg>/g)].map(match => [...match[1].matchAll(/<time>2026-11-26T00:(\d\d):(\d\d)\.000Z<\/time>/g)].map(time => Number(time[1]) * 60 + Number(time[2])));
  assert.deepEqual(segments, [[0, 5], [15, 20], [55], [60], [70], [75]]);
  const isolated = tripGpx(trip([point(0), point(60)]));
  assert.equal((isolated.match(/<trkseg>/g) ?? []).length, 2);
  assert.equal((isolated.match(/<trkpt /g) ?? []).length, 2);
});

test('GPX escapes XML markup in the trip name and preserves international text', () => {
  const xml = tripGpx(trip(undefined, {label: 'Łódź & <Berlin> "A" \'B\' 🚗'}));
  assert.match(xml, /<name>Łódź &amp; &lt;Berlin&gt; &quot;A&quot; &apos;B&apos; 🚗<\/name>/);
  for (const label of ['A\u0000B', 'A\u000bB', 'A\ud800B', 'A\ufffeB']) {
    assert.throws(() => tripGpx(trip(undefined, {label})), /znaki XML/);
  }
});

test('GPX coordinates use XML decimal notation and the GPX longitude interval', () => {
  const xml = tripGpx(trip([point(0, {latitude: 1.23e-7, longitude: -1e-8}), point(5, {latitude: 0, longitude: -1e-8})]));
  assert.match(xml, /lat="0.000000123" lon="-0.00000001"/);
  const antimeridian = tripGpx(trip([point(0, {longitude: 180}), point(5, {longitude: 180})]));
  assert.equal((antimeridian.match(/lon="-180"/g) ?? []).length, 2);
});

test('GPX output is parsed by xmllint with namespace, name, track and segment structure intact', {skip: spawnSync('xmllint', ['--version']).error?.code === 'ENOENT'}, () => {
  const xml = tripGpx(trip([point(0), point(5), point(60)], {label: 'Łódź & <Berlin> 🚗'}));
  const parsed = spawnSync('xmllint', ['--nonet', '--xpath', 'concat(namespace-uri(/*), "|", /*/@version, "|", count(//*[local-name()="trk"]), "|", count(//*[local-name()="trkseg"]), "|", count(//*[local-name()="trkpt"]), "|", string(//*[local-name()="name"]))', '-'], {input: xml, encoding: 'utf8'});
  assert.equal(parsed.status, 0, parsed.stderr);
  assert.equal(parsed.stdout.trim(), 'http://www.topografix.com/GPX/1/1|1.1|1|2|3|Łódź & <Berlin> 🚗');
});
