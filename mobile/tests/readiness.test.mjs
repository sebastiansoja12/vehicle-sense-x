import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeReadiness, parseReadinessStatus, parseClearCounter, validReadiness } from '../src/obd/readiness.ts';
import { Elm327Driver } from '../src/obd/driver.ts';
import { ObdError } from '../src/obd/protocol.ts';
import { validateDiagnosticSnapshot } from '../src/obd/types.ts';
import { emptyData, addVehicle } from '../src/domain.ts';
import { createBackup, parseBackup, healthReportHtml } from '../src/reports.ts';

test('spark readiness decodes MIL, DTC count and independent availability/completion bits', () => {
  const raw = parseReadinessStatus('0101\r41 01 82 07 65 20\r>');
  assert.deepEqual(raw, [130, 7, 101, 32]);
  const value = decodeReadiness({ statusBytes: raw, warmupsSinceClear: 0, distanceSinceClearKm: null });
  assert.equal(value.mil, true); assert.equal(value.dtcCount, 2); assert.equal(value.ignition, 'spark');
  assert.equal(value.monitors.find(m => m.id === 'oxygen-sensor').complete, false);
  assert.equal(value.monitors.find(m => m.id === 'catalyst').complete, true);
  assert.deepEqual(value.monitors.find(m => m.id === 'heated-catalyst'), { id: 'heated-catalyst', available: false, complete: null });
});
test('compression ignition uses diesel monitors and continuous monitors keep their own completion bits', () => {
  const value = decodeReadiness({ statusBytes: [0, 0x1F, 0xEB, 0x40], warmupsSinceClear: null, distanceSinceClearKm: 0 });
  assert.equal(value.ignition, 'compression'); assert.equal(value.mil, false);
  assert.equal(value.monitors.find(m => m.id === 'pm-filter').complete, false);
  assert.equal(value.monitors.find(m => m.id === 'nox-scr').complete, true);
  assert.equal(value.monitors.find(m => m.id === 'misfire').complete, false);
  assert.equal(value.monitors.some(m => m.id === 'oxygen-sensor'), false);
});
test('truncated, ambiguous, negative and no-data responses cannot become a ready result', () => {
  for (const raw of ['41 01 00>', '41 02 00 00 00 00>', '41 01 00 00 00 00 FF>', 'NO DATA>', '41 01 00 00 00 00\r41 01 00 00 00 00>', '41 01 GG 00 00 00>']) assert.throws(() => parseReadinessStatus(raw));
  assert.equal(parseClearCounter('41 30 00>', '0130'), 0);
  assert.equal(parseClearCounter('41 31 FF FF>', '0131'), 65535);
  assert.throws(() => parseClearCounter('41 31 10>', '0131'));
  for (const patch of [{ statusBytes: [0, 0, 0] }, { statusBytes: [0, 0, 0, 256] }, { warmupsSinceClear: -1 }, { distanceSinceClearKm: NaN }]) assert.equal(validReadiness({ statusBytes: [0, 0, 0, 0], warmupsSinceClear: null, distanceSinceClearKm: null, ...patch }), false);
});
const replies = { ATZ: 'ELM327 v2.3>', ATE0: 'OK>', ATL0: 'OK>', ATS1: 'OK>', ATH0: 'OK>', ATCAF1: 'OK>', ATSP0: 'OK>', ATDPN: 'A3>', '0100': '41 00 80 00 00 01>', '0120': '41 20 00 01 80 00>', ATRV: '12.6V>', '0101': '41 01 82 07 65 20>', '0130': '41 30 00>', '0131': '41 31 00 64>', '03': '43 00>', '07': 'NO DATA>', '0A': 'NO DATA>', '04': '44>' };
function fixture(overrides = {}) {
  const sent = [], driver = new Elm327Driver({ send: async c => { sent.push(c); const response = Object.hasOwn(overrides, c) ? overrides[c] : replies[c]; if (response instanceof Error) throw response; if (response === undefined) throw Error('Unexpected command ' + c); return response; } }, 'Fixture');
  return { sent, driver };
}
test('full scans request only advertised readiness and counters, keep zero and preserve the clear backup', async () => {
  const { driver, sent } = fixture(); await driver.initialize(); const value = await driver.readSnapshot('v');
  assert.deepEqual(value.readiness, { statusBytes: [130, 7, 101, 32], warmupsSinceClear: 0, distanceSinceClearKm: 100 });
  assert.equal(validateDiagnosticSnapshot(value), true);
  sent.length = 0; await driver.clearFaults({ confirmed: true, backedUpSnapshot: value, vehicleId: 'v' }); assert.deepEqual(sent, ['04']);
  const unsupported = fixture({ '0100': '41 00 00 00 00 00>' }); await unsupported.driver.initialize();
  assert.equal((await unsupported.driver.readSnapshot('v')).readiness, undefined);
  assert.ok(!unsupported.sent.includes('0101')); assert.ok(!unsupported.sent.includes('0130'));
});
test('NO DATA remains missing, while timeout and malformed readiness fail the scan', async () => {
  const noData = fixture({ '0101': 'NO DATA>' }); await noData.driver.initialize(); assert.equal((await noData.driver.readSnapshot('v')).readiness, null);
  for (const response of ['41 01 00>', new ObdError('timeout', 'timeout')]) {
    const f = fixture({ '0101': response }); await f.driver.initialize(); await assert.rejects(f.driver.readSnapshot('v'));
    assert.ok(!f.sent.includes('04'));
  }
  const f = fixture({ '0130': 'NO DATA>', '0131': 'NO DATA>' }); await f.driver.initialize(); const value = await f.driver.readSnapshot('v');
  assert.equal(value.readiness.warmupsSinceClear, null); assert.equal(value.readiness.distanceSinceClearKm, null);
  f.sent.length = 0; await f.driver.readLiveParameters('v'); assert.deepEqual(f.sent, ['ATRV']);
});
test('readiness evidence survives backup and appears in reports without overriding DTC status coverage', async () => {
  const f = fixture(); await f.driver.initialize(); const value = await f.driver.readSnapshot('v');
  let state = addVehicle(emptyData(), { make: 'Toyota', model: 'Test', year: '2020', engine: 'Test', mileage: '1000', plate: 'PRIVATE', vin: '' }, 'v', '2026-11-27');
  state = { ...state, diagnostics: [value] };
  assert.deepEqual(parseBackup(createBackup(state, '2026-11-27')).diagnostics[0].readiness, value.readiness);
  const html = healthReportHtml(state, 'v', '2026-11-27'); assert.match(html, /MIL/); assert.match(html, /100 km/); assert.doesNotMatch(html, /PRIVATE/);
  assert.equal(validateDiagnosticSnapshot({ ...value, readiness: { ...value.readiness, distanceSinceClearKm: -1 } }), false);
  assert.equal(validateDiagnosticSnapshot({ ...value, supportedPids: [], readiness: value.readiness }), false);
  assert.deepEqual(value.readStatuses, ['stored']);
});
test('CAN readiness stays scoped to the selected ECU and rejects a response from another ECU', async () => {
  for (const wrong of [false, true]) {
    let bitmap = 0;
    const driver = new Elm327Driver({ send: async command => {
      if (command === '0100') return ++bitmap === 1 ? '41 00 80 00 00 00>' : '7E8 06 41 00 80 00 00 00>';
      if (command === 'ATDPN') return 'A6>';
      if (['ATH1', 'ATD0', 'ATCFC1', 'ATSH7E0', 'ATCRA7E8'].includes(command)) return 'OK>';
      if (command === '0101') return `${wrong ? '7E9' : '7E8'} 06 41 01 00 07 00 00>`;
      if (command === '03') return '7E8 02 43 00>';
      return replies[command];
    } }, 'CAN fixture');
    await driver.initialize();
    if (wrong) await assert.rejects(driver.readSnapshot('v'), error => error.kind === 'ambiguous');
    else { const value = await driver.readSnapshot('v'); assert.deepEqual(value.ecu, { protocol: 6, responseId: '7E8' }); assert.equal(decodeReadiness(value.readiness).mil, false); }
  }
});
