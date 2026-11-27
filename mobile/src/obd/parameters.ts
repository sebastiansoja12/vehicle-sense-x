import { ObdError, responseBytes } from './protocol.ts';

export type ObdMeasurement = { pid: number; value: number | null; readAt: number };
export type ParameterScaling = { pid4f?: [number, number, number, number] | null; pid50?: [number, number, number, number] | null };
export type ParameterDefinition = {
  pid: number; label: string; unit: string; bytes: number; maxBytes: number; valueBytes: number;
  scale: number; offset: number; decimals: number; min: number; max: number;
};
function parameter(pid: number, label: string, unit: string, bytes: number, scale = 1, offset = 0, decimals = 0, valueBytes = bytes, maxBytes = bytes): ParameterDefinition {
  return { pid, label, unit, bytes, maxBytes, valueBytes, scale, offset, decimals, min: offset, max: (2 ** (8 * valueBytes) - 1) * scale + offset };
}
// SAE J1979 scalar fields: units/scaling checked against the linked vendor PID table.
export const parameterDefinitions: readonly ParameterDefinition[] = [
  parameter(0x04, 'Obciążenie silnika', '%', 1, 100 / 255, 0, 1),
  parameter(0x05, 'Płyn chłodzący', '°C', 1, 1, -40),
  parameter(0x06, 'Korekta krótkoterminowa · bank 1', '%', 1, 100 / 128, -100, 1, 1, 2),
  parameter(0x07, 'Korekta długoterminowa · bank 1', '%', 1, 100 / 128, -100, 1, 1, 2),
  parameter(0x08, 'Korekta krótkoterminowa · bank 2', '%', 1, 100 / 128, -100, 1, 1, 2),
  parameter(0x09, 'Korekta długoterminowa · bank 2', '%', 1, 100 / 128, -100, 1, 1, 2),
  parameter(0x0A, 'Ciśnienie paliwa', 'kPa', 1, 3),
  parameter(0x0B, 'Ciśnienie bezwzględne w kolektorze', 'kPa', 1),
  parameter(0x0C, 'Obroty silnika', 'rpm', 2, 0.25),
  parameter(0x0D, 'Prędkość pojazdu z ECU', 'km/h', 1),
  parameter(0x0E, 'Wyprzedzenie zapłonu', '°', 1, 0.5, -64, 1),
  parameter(0x0F, 'Temperatura powietrza dolotowego', '°C', 1, 1, -40),
  parameter(0x10, 'Przepływ powietrza MAF', 'g/s', 2, 0.01, 0, 2),
  parameter(0x11, 'Położenie przepustnicy', '%', 1, 100 / 255, 0, 1),
  ...Array.from({ length: 8 }, (_, index) => parameter(0x14 + index, `Napięcie O2 · czujnik ${index + 1}`, 'V', 2, 0.005, 0, 3, 1)),
  parameter(0x1F, 'Czas pracy od uruchomienia', 's', 2),
  parameter(0x21, 'Dystans przy aktywnej MIL', 'km', 2),
  parameter(0x22, 'Ciśnienie szyny względem kolektora', 'kPa', 2, 0.079, 0, 1),
  parameter(0x23, 'Ciśnienie szyny paliwowej', 'kPa', 2, 10),
  parameter(0x2C, 'Zadane otwarcie EGR', '%', 1, 100 / 255, 0, 1),
  parameter(0x2D, 'Odchylenie EGR', '%', 1, 100 / 128, -100, 1),
  parameter(0x2E, 'Zadane oczyszczanie EVAP', '%', 1, 100 / 255, 0, 1),
  parameter(0x2F, 'Poziom paliwa z ECU', '%', 1, 100 / 255, 0, 1),
  parameter(0x30, 'Rozgrzania od kasowania kodów', '', 1),
  parameter(0x31, 'Dystans od kasowania kodów', 'km', 2),
  parameter(0x33, 'Ciśnienie atmosferyczne', 'kPa', 1),
  parameter(0x3C, 'Katalizator · bank 1, czujnik 1', '°C', 2, 0.1, -40, 1),
  parameter(0x3D, 'Katalizator · bank 2, czujnik 1', '°C', 2, 0.1, -40, 1),
  parameter(0x3E, 'Katalizator · bank 1, czujnik 2', '°C', 2, 0.1, -40, 1),
  parameter(0x3F, 'Katalizator · bank 2, czujnik 2', '°C', 2, 0.1, -40, 1),
  parameter(0x42, 'Napięcie sterownika ECU', 'V', 2, 0.001, 0, 3),
  parameter(0x43, 'Bezwzględne obciążenie silnika', '%', 2, 100 / 255, 0, 1),
  parameter(0x44, 'Zadany współczynnik lambda', 'λ', 2, 1 / 32768, 0, 3),
  parameter(0x45, 'Względne położenie przepustnicy', '%', 1, 100 / 255, 0, 1),
  parameter(0x46, 'Temperatura otoczenia', '°C', 1, 1, -40),
  parameter(0x49, 'Pedał przyspieszenia D', '%', 1, 100 / 255, 0, 1),
  parameter(0x4A, 'Pedał przyspieszenia E', '%', 1, 100 / 255, 0, 1),
  parameter(0x4B, 'Pedał przyspieszenia F', '%', 1, 100 / 255, 0, 1),
  parameter(0x4C, 'Zadane położenie przepustnicy', '%', 1, 100 / 255, 0, 1),
  parameter(0x4D, 'Czas pracy przy aktywnej MIL', 'min', 2),
  parameter(0x4E, 'Czas od kasowania kodów', 'min', 2),
  parameter(0x52, 'Udział etanolu w paliwie', '%', 1, 100 / 255, 0, 1),
  parameter(0x5C, 'Temperatura oleju silnikowego', '°C', 1, 1, -40),
  parameter(0x5E, 'Wydatek paliwa z ECU', 'l/h', 2, 0.05, 0, 2),
  parameter(0x61, 'Żądany moment względem referencji', '%', 1, 1, -125),
  parameter(0x62, 'Rzeczywisty moment względem referencji', '%', 1, 1, -125),
  parameter(0x63, 'Referencyjny moment silnika', 'Nm', 2),
];
export function parameterByPid(pid: number): ParameterDefinition | undefined { return parameterDefinitions.find(parameter => parameter.pid === pid); }
export function pidHex(pid: number): string { return pid.toString(16).toUpperCase().padStart(2, '0'); }
function effectiveScale(definition: ParameterDefinition, scaling: ParameterScaling): number | null {
  if (definition.pid === 0x0B || definition.pid === 0x44) {
    if (scaling.pid4f === null) return null;
    const maximum = scaling.pid4f?.[definition.pid === 0x0B ? 3 : 0] ?? 0;
    if (maximum > 0) return definition.pid === 0x0B ? maximum * 10 / 255 : maximum / 65535;
  }
  if (definition.pid === 0x10) {
    if (scaling.pid50 === null) return null;
    const maximum = scaling.pid50?.[0] ?? 0;
    if (maximum > 0) return maximum * 10 / 65535;
  }
  return definition.scale;
}
export function parseScalingConfiguration(raw: string, pid: 0x4F | 0x50): [number, number, number, number] {
  const b = responseBytes(raw, `01${pidHex(pid)}`);
  if (b.length !== 6 || b[0] !== 0x41 || b[1] !== pid) throw new ObdError('Invalid scaling configuration response');
  return [b[2], b[3], b[4], b[5]];
}
export function validScaling(value: unknown, supportedPids: number[]): value is ParameterScaling {
  if (value === undefined) return !supportedPids.includes(0x4F) && !supportedPids.includes(0x50);
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !['pid4f', 'pid50'].includes(key))) return false;
  const scaling = value as ParameterScaling;
  return ([['pid4f', 0x4F], ['pid50', 0x50]] as const).every(([key, pid]) => {
    if (!supportedPids.includes(pid)) return scaling[key] === undefined;
    const bytes = scaling[key];
    return bytes === null || Array.isArray(bytes) && bytes.length === 4 && bytes.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255);
  });
}
export function decodeMeasurement(raw: string, pid: number, mode: 1 | 2 = 1, scaling: ParameterScaling = {}): number {
  const definition = parameterByPid(pid);
  if (!definition || ![1, 2].includes(mode)) throw new ObdError('Unsupported scalar PID', 'unsupported');
  const b = responseBytes(raw, `0${mode}${pidHex(pid)}${mode === 2 ? '00' : ''}`);
  const header = mode === 2 ? 3 : 2;
  if (b.length < header + definition.bytes || b.length > header + definition.maxBytes || b[0] !== 0x40 + mode || b[1] !== pid || (mode === 2 && b[2] !== 0)) throw new ObdError('Unexpected parameter or freeze-frame response');
  const scale = effectiveScale(definition, scaling);
  if (scale === null) throw new ObdError('ECU scaling configuration unavailable', 'no-data');
  const rawValue = definition.valueBytes === 1 ? b[header] : b[header] * 256 + b[header + 1];
  return rawValue * scale + definition.offset;
}
export function validMeasurements(value: unknown, supportedPids: number[], scaling: ParameterScaling = {}): value is ObdMeasurement[] {
  if (!Array.isArray(value) || value.length > parameterDefinitions.length) return false;
  const seen = new Set<number>();
  return value.every(measurement => {
    if (!measurement || typeof measurement !== 'object' || Array.isArray(measurement)) return false;
    const { pid, value, readAt } = measurement;
    const definition = parameterByPid(pid);
    if (!definition || seen.has(pid) || !supportedPids.includes(pid) || typeof readAt !== 'number' || !Number.isSafeInteger(readAt) || readAt < 0 || readAt > 253402300799999) return false;
    seen.add(pid);
    const scale = effectiveScale(definition, scaling);
    const maximum = scale === null ? null : (2 ** (8 * definition.valueBytes) - 1) * scale + definition.offset;
    return value === null || maximum !== null && typeof value === 'number' && Number.isFinite(value) && value >= definition.min && value <= maximum;
  });
}
