import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVehicleEvidence, findServiceFollowUp } from '../src/vehicle-evidence.ts';
import { addVehicle, emptyData } from '../src/domain.ts';
const day = '2026-11-27';
const garage = () => addVehicle(emptyData(), { make: 'Toyota', model: 'Test', year: '2020', engine: 'Test', mileage: '10000', plate: 'PRIVATE', vin: '' }, 'v', day);
const reading = (id, date, patch = {}) => ({ id, vehicleId: 'v', timestamp: Date.parse(date + 'T12:00:00Z'), source: 'obd', adapterName: 'ELM', ecu: { protocol: 6, responseId: '7E8' }, readStatuses: ['stored', 'pending', 'permanent'], codes: [], parameters: { rpm: null, coolantC: null, loadPercent: null, voltageV: null }, supportedPids: [], ...patch });
const service = (id, date, mileage, vehicleId = 'v') => ({ id, vehicleId, date, mileage, title: 'Serwis', note: '', costCents: 10000 });
test('empty evidence is missing information rather than a healthy vehicle or a score', () => {
  const value = buildVehicleEvidence(garage(), 'v', day);
  assert.equal(value.items.find(c => c.id === 'diagnostics').status, 'missing');
  assert.equal(value.items.find(c => c.id === 'mileage').status, 'missing');
  assert.equal('score' in value, false);
  assert.throws(() => buildVehicleEvidence(garage(), 'other', day));
});
test('mileage audit finds cross-day contradictions, without inventing an order within one day', () => {
  const state = garage();
  state.service = [service('a', '2026-11-20', 9000), service('b', '2026-11-20', 8000), service('c', '2026-11-21', 8500)];
  let result = buildVehicleEvidence(state, 'v', day);
  assert.equal(result.mileageConflicts.length, 1);
  assert.deepEqual(result.mileageConflicts[0], { earlierId: 'a', laterId: 'c', earlierDate: '2026-11-20', laterDate: '2026-11-21', earlierMileage: 9000, laterMileage: 8500 });
  state.service.pop(); result = buildVehicleEvidence(state, 'v', day);
  assert.equal(result.mileageConflicts.length, 0);
  assert.equal(result.items.find(c => c.id === 'mileage').status, 'partial');
});
test('imports, unread statuses and unknown ECU remain visible even with no codes', () => {
  const state = garage(); state.diagnostics = [reading('r', day, { source: 'import', ecu: undefined, readStatuses: ['stored'] })];
  const result = buildVehicleEvidence(state, 'v', day);
  const evidence = result.items.find(c => c.id === 'diagnostics');
  assert.equal(evidence.status, 'partial');
  assert.match(evidence.details.join(' '), /import/i);
  assert.match(evidence.details.join(' '), /ECU/);
  assert.match(evidence.details.join(' '), /1\/3/);
  assert.equal(result.items.find(c => c.id === 'readiness').status, 'missing');
});
test('post-service follow-up uses same confirmed ECU/protocol, real source and strict before/after dates', () => {
  const state = garage(); state.service = [service('s', '2026-11-23', 8000)];
  state.diagnostics = [reading('pre', '2026-11-22'), reading('same-day', '2026-11-23'), reading('post', '2026-11-24'), reading('different', '2026-11-25', { ecu: { protocol: 8, responseId: '7E8' } }), reading('imported', '2026-11-26', { source: 'import' })];
  const result = findServiceFollowUp(state, 'v', day);
  assert.equal(result.status, 'paired'); assert.equal(result.serviceId, 's');
  assert.equal(result.beforeId, 'pre'); assert.equal(result.afterId, 'post'); assert.equal(result.sameDayCount, 1);
});
test('same-day-only readings do not prove which one happened before repair', () => {
  const state = garage(); state.service = [service('s', day, 9000)]; state.diagnostics = [reading('a', day), reading('b', day, { timestamp: Date.parse(day + 'T16:00:00Z') })];
  const result = findServiceFollowUp(state, 'v', day);
  assert.equal(result.status, 'same-day-only'); assert.equal(result.beforeId, null); assert.equal(result.afterId, null);
});
test('future records and other cars cannot silently fill evidence for the selected car', () => {
  const state = garage(); state.service = [service('future', '2026-11-28', 9000), service('other', '2026-11-23', 5000, 'other')];
  state.diagnostics = [reading('future-read', '2026-11-28'), reading('other-read', '2026-11-26', { vehicleId: 'other' })];
  const result = buildVehicleEvidence(state, 'v', day);
  assert.equal(result.items.find(c => c.id === 'dates').status, 'conflict');
  assert.equal(result.followUp.status, 'no-service');
  assert.equal(result.items.find(c => c.id === 'diagnostics').status, 'conflict');
});
test('both sides with unmatched ECU or imports cannot claim a confirmed post-service comparison', () => {
  const state = garage(); state.service = [service('s', '2026-11-23', 8000)];
  state.diagnostics = [reading('a', '2026-11-22'), reading('b', '2026-11-24', { ecu: { protocol: 6, responseId: '7E9' } })];
  assert.equal(findServiceFollowUp(state, 'v', day).status, 'different-ecu');
  state.diagnostics[1].source = 'import'; assert.notEqual(findServiceFollowUp(state, 'v', day).status, 'paired');
});
test('future fuel records do not establish evidence for current consumption', () => {
  const state = garage();
  state.fuel = [{ id: 'f1', vehicleId: 'v', date: '2026-11-26', mileage: 1000, volumeMl: 10000, priceCents: 600, costCents: 6000, full: true }, { id: 'f2', vehicleId: 'v', date: '2026-11-28', mileage: 1100, volumeMl: 10000, priceCents: 600, costCents: 6000, full: true }];
  assert.equal(buildVehicleEvidence(state, 'v', day).items.find(c => c.id === 'fuel').status, 'missing');
});
test('future readiness and missing ECU scope cannot establish complete evidence for today', () => {
  const state = garage();
  const readiness = { statusBytes: [0, 7, 0, 0], warmupsSinceClear: null, distanceSinceClearKm: null };
  state.diagnostics = [reading('future', '2026-11-28', { supportedPids: [1], readiness })];
  assert.equal(buildVehicleEvidence(state, 'v', day).items.find(c => c.id === 'readiness').status, 'conflict');
  state.diagnostics = [reading('unknown', day, { supportedPids: [1], readiness, ecu: undefined })];
  assert.equal(buildVehicleEvidence(state, 'v', day).items.find(c => c.id === 'readiness').status, 'partial');
});
