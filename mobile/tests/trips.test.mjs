import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTrip, filterTripPoints, validateTripRecord } from '../src/trips.ts';

const point = (seconds, patch = {}) => ({ latitude: 0, longitude: 0, timestamp: seconds * 1000, accuracy: 5, speedMps: null, ...patch });
const trip = (points = [], patch = {}) => ({ id: 't1', vehicleId: 'v1', startedAt: 0, endedAt: 120000, label: 'Przejazd', source: 'gps', points, manualDistanceM: null, manualDurationS: null, fuelCostCents: null, ...patch });

test('trip validation rejects malformed values, reversed time, uncontained or nonmonotonic points and oversized records', () => {
  assert.equal(validateTripRecord(trip([point(0), point(1)])), true);
  for (const value of [null, {}, trip([], { id: '' }), trip([], { vehicleId: ' ' }), trip([], { endedAt: -1 }), trip([], { endedAt: Infinity }), trip([], { source: 'other' }), trip([], { fuelCostCents: 1.2 }), trip([], { fuelCostCents: -1 }), trip([], { manualDistanceM: 1 }), trip([point(121)]), trip([point(2), point(1)]), trip([point(1), point(1)]), trip([point(1, { latitude: 91 })]), trip([point(1, { longitude: NaN })]), trip([point(1, { accuracy: -1 })]), trip([point(1, { speedMps: Infinity })]), trip(Array.from({ length: 10001 }, (_, i) => point(i / 100)))]) {
    assert.equal(validateTripRecord(value), false);
  }
});

test('manual trips validate integer units and report no GPS speed or driving events', () => {
  const manual = trip([], { source: 'manual', manualDistanceM: 12000, manualDurationS: 900, fuelCostCents: 0 });
  assert.equal(validateTripRecord(manual), true);
  for (const patch of [{ manualDistanceM: null }, { manualDurationS: -1 }, { manualDistanceM: 1.1 }, { points: [point(0)] }]) assert.equal(validateTripRecord({ ...manual, ...patch }), false);
  assert.deepEqual(analyzeTrip(manual), { distanceM: 12000, durationS: 900, averageSpeedKmh: null, maxSpeedKmh: null, accelerationEvents: null, brakingEvents: null, acceptedPoints: 0, rejectedPoints: 0, segments: [] });
});

test('no GPS measurements differs from measured stationary movement', () => {
  const absent = analyzeTrip(trip());
  assert.equal(absent.distanceM, 0);
  assert.equal(absent.durationS, 120);
  assert.equal(absent.averageSpeedKmh, null);
  assert.equal(absent.maxSpeedKmh, null);
  assert.equal(absent.accelerationEvents, null);
  const stationary = analyzeTrip(trip([point(0, { speedMps: 0 }), point(5, { speedMps: 0 })], { endedAt: 5000 }));
  assert.equal(stationary.distanceM, 0);
  assert.equal(stationary.averageSpeedKmh, 0);
  assert.equal(stationary.maxSpeedKmh, 0);
  assert.equal(stationary.accelerationEvents, 0);
  assert.equal(stationary.brakingEvents, 0);
});

test('GPS distance uses geographic coordinates and record duration without mutating samples', () => {
  const points = [point(0), point(10, { longitude: 0.001 })];
  const before = structuredClone(points);
  const result = analyzeTrip(trip(points, { endedAt: 10000 }));
  assert.ok(Math.abs(result.distanceM - 111.195) < 0.1);
  assert.ok(Math.abs(result.averageSpeedKmh - 40.03) < 0.1);
  assert.ok(Math.abs(result.maxSpeedKmh - 40.03) < 0.1);
  assert.equal(result.accelerationEvents, null);
  assert.deepEqual(points, before);
});

test('poor or unknown accuracy and invalid samples split paths and never bridge distance', () => {
  const points = [point(0), point(5, { longitude: 0.0001 }), point(10, { accuracy: null }), point(15, { longitude: 0.01 }), point(20, { longitude: 0.0101 }), point(25, { accuracy: 31 }), point(30, { latitude: 100 })];
  const filtered = filterTripPoints(points);
  assert.deepEqual(filtered.segments.map(segment => segment.map(p => p.timestamp)), [[0, 5000], [15000, 20000]]);
  const result = analyzeTrip(trip(points));
  assert.equal(result.acceptedPoints, 4);
  assert.equal(result.rejectedPoints, 3);
  assert.ok(Math.abs(result.distanceM - 22.239) < 0.1);
});

test('long gaps start new segments without adding a line or inferred speed across the gap', () => {
  const result = analyzeTrip(trip([point(0), point(31, { longitude: 1 }), point(36, { longitude: 1.0001 })]));
  assert.deepEqual(result.segments.map(s => s.length), [1, 2]);
  assert.equal(result.acceptedPoints, 3);
  assert.equal(result.rejectedPoints, 0);
  assert.ok(Math.abs(result.distanceM - 11.1195) < 0.1);
  assert.ok(result.maxSpeedKmh < 9);
});

test('out-of-order samples and impossible sensor speeds or coordinate jumps are rejected', () => {
  const points = [point(0), point(5, { longitude: 0.0001 }), point(4), point(6, { longitude: 0.0002 }), point(7, { longitude: 1 }), point(8, { longitude: 0.0003 }), point(9, { speedMps: 71 }), point(10, { longitude: 0.0004 })];
  const result = analyzeTrip(trip(points));
  assert.equal(result.rejectedPoints, 3);
  assert.equal(result.acceptedPoints, 5);
  assert.deepEqual(result.segments.map(s => s.length), [2, 1, 1, 1]);
  assert.ok(result.distanceM < 12);
});

test('acceleration and braking count each consecutive threshold episode once', () => {
  const points = [0, 3, 6, 6, 2, 0, 0, 3].map((speedMps, seconds) => point(seconds, { speedMps }));
  const result = analyzeTrip(trip(points, { endedAt: 7000 }));
  assert.equal(result.accelerationEvents, 2);
  assert.equal(result.brakingEvents, 1);
  assert.equal(result.maxSpeedKmh, 21.6);
});

test('events require consecutive measured 1–10 second intervals and reset at gaps or missing speed', () => {
  const points = [point(0, { speedMps: 0 }), point(0.5, { speedMps: 3 }), point(11.5, { speedMps: 40 }), point(12.5), point(13.5, { speedMps: 60 }), point(14.5, { accuracy: 100, speedMps: 0 }), point(15.5, { speedMps: 0 }), point(46.5, { speedMps: 60 })];
  const result = analyzeTrip(trip(points));
  assert.equal(result.accelerationEvents, null);
  assert.equal(result.brakingEvents, null);
});

test('a rejection ends an acceleration episode and does not suppress the next valid episode', () => {
  const points = [point(0, { speedMps: 0 }), point(1, { speedMps: 3 }), point(2, { accuracy: null }), point(3, { speedMps: 3 }), point(4, { speedMps: 6 })];
  assert.equal(analyzeTrip(trip(points)).accelerationEvents, 2);
});

test('trip timestamps must be representable as calendar dates for history and exports',()=>{const t=trip([], {source:'manual',manualDistanceM:100,manualDurationS:10});assert.equal(validateTripRecord({...t,startedAt:1e100,endedAt:1e100}),false);});
test('release schema rejects simulated trip sources instead of accepting demo measurements',()=>{assert.equal(validateTripRecord(trip([],{source:'demo'})),false);});
