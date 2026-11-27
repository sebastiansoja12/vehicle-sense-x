import { ObdError, responseBytes } from './protocol.ts';

export const monitorLabels = {
  misfire: 'Wypadanie zapłonów', 'fuel-system': 'Układ paliwowy', components: 'Elementy układu napędowego',
  catalyst: 'Katalizator', 'heated-catalyst': 'Podgrzewany katalizator', evap: 'Układ EVAP', 'secondary-air': 'Powietrze wtórne',
  'ac-refrigerant': 'Czynnik chłodniczy A/C', 'oxygen-sensor': 'Czujniki tlenu', 'oxygen-heater': 'Grzałki czujników tlenu', 'egr-vvt': 'EGR / VVT',
  'nmhc-catalyst': 'Katalizator NMHC', 'nox-scr': 'Układ NOx / SCR', 'boost-pressure': 'Ciśnienie doładowania',
  'exhaust-gas-sensor': 'Czujniki spalin', 'particulate-filter': 'Filtr cząstek stałych',
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
export function validReadiness(value: unknown): value is ReadinessStatus {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const r = value as ReadinessStatus;
  if (typeof r.milOn !== 'boolean' || !Number.isInteger(r.storedDtcCount) || r.storedDtcCount < 0 || r.storedDtcCount > 127 || !['spark', 'compression'].includes(r.ignition) || !Array.isArray(r.monitors)) return false;
  const expected = [...common, ...(r.ignition === 'spark' ? spark : compression).map(([id]) => id)];
  return r.monitors.length === expected.length && r.monitors.every((m, index) => m && m.id === expected[index] && typeof m.supported === 'boolean' && (m.supported ? typeof m.complete === 'boolean' : m.complete === null));
}
