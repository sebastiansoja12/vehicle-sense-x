import { ObdError, responseBytes } from './protocol.ts';

export const monitorLabels = {
  misfire: 'Wypadanie zapłonów', 'fuel-system': 'Układ paliwowy', components: 'Elementy układu napędowego',
  catalyst: 'Katalizator', 'heated-catalyst': 'Podgrzewany katalizator', evap: 'Układ EVAP', 'secondary-air': 'Powietrze wtórne',
  'ac-refrigerant': 'Czynnik chłodniczy A/C', 'oxygen-sensor': 'Czujniki tlenu', 'oxygen-heater': 'Grzałki czujników tlenu', 'egr-vvt': 'EGR / VVT',
  'nmhc-catalyst': 'Katalizator NMHC', 'nox-scr': 'Układ NOx / SCR', 'boost-pressure': 'Ciśnienie doładowania',
  'exhaust-gas-sensor': 'Czujniki spalin', 'particulate-filter': 'Filtr cząstek stałych',
  egr:'EGR / VVT',boost:'Doładowanie','exhaust-sensor':'Czujniki spalin','pm-filter':'Filtr cząstek stałych',
} as const;
export type MonitorId = keyof typeof monitorLabels;
export type ReadinessMonitor = { id: MonitorId; supported: boolean; complete: boolean | null };
export type ReadinessStatus = { milOn: boolean; storedDtcCount: number; ignition: 'spark' | 'compression'; monitors: ReadinessMonitor[] };
const common: MonitorId[] = ['misfire', 'fuel-system', 'components'];
const spark: readonly [MonitorId, number][] = [['catalyst', 0], ['heated-catalyst', 1], ['evap', 2], ['secondary-air', 3], ['ac-refrigerant', 4], ['oxygen-sensor', 5], ['oxygen-heater', 6], ['egr-vvt', 7]];
const compression: readonly [MonitorId, number][] = [['nmhc-catalyst', 0], ['nox-scr', 1], ['boost-pressure', 3], ['exhaust-gas-sensor', 5], ['particulate-filter', 6], ['egr-vvt', 7]];
function monitor(id: MonitorId, supported: boolean, incomplete: boolean): ReadinessMonitor { return { id, supported, complete: supported ? !incomplete : null }; }
export function parseReadiness(raw: string): ReadinessStatus {
  const b = responseBytes(raw, '0101');
  if (b.length !== 6 || b[0] !== 0x41 || b[1] !== 1) throw new ObdError('Invalid readiness response');
  const [, , a, commonBits, supported, incomplete] = b;
  const ignition = commonBits & 8 ? 'compression' : 'spark';
  return {
    milOn: !!(a & 128), storedDtcCount: a & 127, ignition,
    monitors: [
      ...common.map((id, bit) => monitor(id, !!(commonBits & (1 << bit)), !!(commonBits & (1 << (bit + 4))))),
      ...(ignition === 'spark' ? spark : compression).map(([id, bit]) => monitor(id, !!(supported & (1 << bit)), !!(incomplete & (1 << bit)))),
    ],
  };
}
export function validReadinessStatus(value: unknown): value is ReadinessStatus {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as ReadinessStatus;
  if (typeof r.milOn !== 'boolean' || !Number.isInteger(r.storedDtcCount) || r.storedDtcCount < 0 || r.storedDtcCount > 127 || !['spark', 'compression'].includes(r.ignition) || !Array.isArray(r.monitors)) return false;
  const expected = [...common, ...(r.ignition === 'spark' ? spark : compression).map(([id]) => id)];
  return r.monitors.length === expected.length && r.monitors.every((m, index) => m && m.id === expected[index] && typeof m.supported === 'boolean' && (m.supported ? typeof m.complete === 'boolean' : m.complete === null));
}

export type ReadinessData = { statusBytes: number[]; warmupsSinceClear: number | null; distanceSinceClearKm: number | null };

export function validReadiness(value: unknown): value is ReadinessData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const integer = (n: unknown, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max;
  return Array.isArray(v.statusBytes) && v.statusBytes.length === 4 && v.statusBytes.every(n => integer(n, 255))
    && (v.warmupsSinceClear === null || integer(v.warmupsSinceClear, 255))
    && (v.distanceSinceClearKm === null || integer(v.distanceSinceClearKm, 65535));
}
export function parseReadinessStatus(raw: string): number[] {
  const b = responseBytes(raw, '0101');
  if (b.length !== 6 || b[0] !== 0x41 || b[1] !== 1) throw new ObdError('Nieprawidłowa odpowiedź monitorów gotowości OBD.');
  return b.slice(2);
}
export function parseClearCounter(raw: string, command: '0130' | '0131'): number {
  const b = responseBytes(raw, command), length = command === '0130' ? 3 : 4;
  if (b.length !== length || b[0] !== 0x41 || b[1] !== Number.parseInt(command.slice(2), 16)) throw new ObdError('Nieprawidłowy licznik od kasowania DTC.');
  return command === '0130' ? b[2] : b[2] * 256 + b[3];
}
/** Mode 01 PID 01: support and incomplete are independent flags; reserved bits are ignored. */
export function decodeReadiness(value: ReadinessData) {
  if (!validReadiness(value)) throw new ObdError('Nieprawidłowe dane gotowości OBD.');
  const [a, b, c, d] = value.statusBytes;
  const ignition = b & 8 ? 'compression' as const : 'spark' as const;
  const monitors: { id: MonitorId; available: boolean; complete: boolean | null }[] = [];
  const add = (id: MonitorId, available: boolean, incomplete: boolean) => monitors.push({ id, available, complete: available ? !incomplete : null });
  for (const [bit, id] of [[0, 'misfire'], [1, 'fuel-system'], [2, 'components']] as const) add(id, Boolean(b & (1 << bit)), Boolean(b & (1 << (bit + 4))));
  const nonContinuous: readonly (readonly [number, MonitorId])[] = ignition === 'spark'
    ? [[0, 'catalyst'], [1, 'heated-catalyst'], [2, 'evap'], [3, 'secondary-air'], [5, 'oxygen-sensor'], [6, 'oxygen-heater'], [7, 'egr']]
    : [[0, 'nmhc-catalyst'], [1, 'nox-scr'], [3, 'boost'], [5, 'exhaust-sensor'], [6, 'pm-filter'], [7, 'egr']];
  for (const [bit, id] of nonContinuous) add(id, Boolean(c & (1 << bit)), Boolean(d & (1 << bit)));
  return { mil: Boolean(a & 0x80), dtcCount: a & 0x7F, ignition, monitors };
}
