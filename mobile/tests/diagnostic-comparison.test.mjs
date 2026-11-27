import test from 'node:test';
import assert from 'node:assert/strict';
import { compareDiagnostics, selectDiagnosticPair } from '../src/obd/comparison.ts';
import { diagnosticComparisonHtml } from '../src/reports.ts';

const before = (patch = {}) => ({ id: 'a', vehicleId: 'car', timestamp: 1000, source: 'obd', adapterName: 'Adapter A', ecu: { protocol: 6, responseId: '7E8' }, readStatuses: ['stored', 'pending', 'permanent'], codes: [{ code: 'P0300', status: 'stored' }, { code: 'P0133', status: 'pending' }], parameters: { rpm: 800, coolantC: 0, loadPercent: null, voltageV: 12.6 }, supportedPids: [4, 5, 12], ...patch });
const after = (patch = {}) => before({ id: 'b', timestamp: 2000, adapterName: 'Adapter B', codes: [{ code: 'P0300', status: 'stored' }, { code: 'P0133', status: 'stored' }], parameters: { rpm: 0, coolantC: 20, loadPercent: 0, voltageV: 14.1 }, ...patch });
test('comparison keeps statuses separate and distinguishes present, absent and unobserved', () => {
  const value = compareDiagnostics(before(), after({ readStatuses: ['stored', 'permanent'] }));
  assert.equal(value.scope, 'same-ecu');
  assert.deepEqual(value.commonStatuses, ['stored', 'permanent']);
  assert.deepEqual(value.codes, [
    { code: 'P0133', status: 'stored', before: 'absent', after: 'present', change: 'added' },
    { code: 'P0300', status: 'stored', before: 'present', after: 'present', change: 'unchanged' },
    { code: 'P0133', status: 'pending', before: 'present', after: 'unknown', change: 'unknown' },
  ]);
});
test('a missing code is only not observed in the new read, never proof of repair', () => {
  const value = compareDiagnostics(before(), after({ codes: [] }));
  assert.deepEqual(value.codes.map(c => c.change), ['not-seen', 'not-seen']);
  assert.ok(value.warnings.some(w => /nie potwierdza naprawy/i.test(w)));
});
test('zero is a real measurement; missing values do not create a delta', () => {
  const value = compareDiagnostics(before(), after());
  assert.equal(value.parameters.rpm.delta, -800);
  assert.equal(value.parameters.coolantC.delta, 20);
  assert.equal(value.parameters.voltageV.delta, 1.5);
  assert.deepEqual(value.parameters.loadPercent, { before: null, after: 0, delta: null });
});
test('different or unconfirmed ECU scope shows raw data without invented changes', () => {
  for (const patch of [{ ecu: { protocol: 6, responseId: '7E9' } }, { ecu: { protocol: 8, responseId: '7E8' } }, { ecu: undefined }]) {
    const value = compareDiagnostics(before(), after(patch));
    assert.notEqual(value.scope, 'same-ecu');
    assert.deepEqual(value.codes, []);
    assert.equal(value.parameters.rpm.delta, null);
    assert.equal(value.parameters.rpm.after, 0);
  }
  assert.equal(compareDiagnostics(before({ ecu: undefined }), after({ ecu: undefined })).scope, 'unknown-ecu');
});
test('imports and lack of shared statuses remain visible in the comparison', () => {
  const value = compareDiagnostics(before({ readStatuses: ['pending'], codes: [{ code: 'P0300', status: 'pending' }] }), after({ source: 'import', readStatuses: ['stored'], codes: [] }));
  assert.deepEqual(value.commonStatuses, []);
  assert.equal(value.codes[0].change, 'unknown');
  assert.ok(value.warnings.some(w => /import/i.test(w)));
  assert.ok(value.warnings.some(w => /wspólnych statusów/i.test(w)));
});
test('comparison refuses corrupt snapshots, other cars, duplicate identities and invalid chronology', () => {
  for (const other of [after({ vehicleId: 'other' }), after({ id: 'a' }), after({ timestamp: 1000 }), after({ timestamp: 500 }), after({ parameters: { rpm: NaN } }), after({ codes: [{ code: '<script>', status: 'stored' }] })]) assert.throws(() => compareDiagnostics(before(), other));
});
test('default pair finds the closest earlier matching ECU without changing the caller history', () => {
  const history = [before(), after({ id: 'other-ecu', timestamp: 1500, ecu: { protocol: 6, responseId: '7E9' } }), after(), after({ id: 'other-car', vehicleId: 'other', timestamp: 3000 })];
  const copy = structuredClone(history);
  assert.deepEqual(selectDiagnosticPair(history, 'car'), { beforeId: 'a', afterId: 'b' });
  assert.deepEqual(history, copy);
  assert.deepEqual(selectDiagnosticPair([after()], 'car'), { beforeId: null, afterId: 'b' });
  assert.deepEqual(selectDiagnosticPair([], 'car'), { beforeId: null, afterId: null });
});
test('report escapes symptoms and metadata, excludes private car fields and includes both raw code sets', () => {
  const vehicle = { id: 'car', make: '<Toyota>', model: 'Corolla', year: 2021, engine: 'Hybrid', plate: 'PRIVATE_PLATE', vin: 'PRIVATE_VIN', equipment: 'PRIVATE_NOTE' };
  const html = diagnosticComparisonHtml({ vehicle, before: before({ adapterName: '<img src=x onerror=alert(1)>' }), after: after(), symptoms: '<script>alert(1)</script>\nSzarpanie', createdAt: 3000 });
  assert.match(html, /&lt;Toyota&gt;/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|<img|PRIVATE_/);
  assert.match(html, /P0133/);
  assert.match(html, /P0300/);
  assert.match(html, /7E8/);
  assert.match(html, /nie potwierdza naprawy/i);
  assert.match(html, /default-src 'none'/);
  assert.throws(() => diagnosticComparisonHtml({ vehicle: { ...vehicle, id: 'other' }, before: before(), after: after(), symptoms: '', createdAt: 3000 }));
  assert.throws(() => diagnosticComparisonHtml({ vehicle, before: before(), after: after(), symptoms: 'x'.repeat(2001), createdAt: 3000 }));
});
