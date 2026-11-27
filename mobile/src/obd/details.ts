import { ObdError, decodeDtcPair, responseBytes } from './protocol.ts';
import { validMeasurements, validScaling } from './parameters.ts';
import type { ObdMeasurement, ParameterScaling } from './parameters.ts';
import { validReadiness } from './readiness.ts';
import type { ReadinessStatus } from './readiness.ts';

export type FreezeFrame = { frame: 0; readAt: number } & (
  { status: 'no-frame' | 'no-data' } |
  { status: 'available'; code: string; supportedPids: number[] | null; measurements: ObdMeasurement[] }
);
export type DiagnosticDetails = { version: 1; measurements: ObdMeasurement[]; scaling?: ParameterScaling; readiness: ReadinessStatus | null; freezeFrame: FreezeFrame };
export function parseFreezeDtc(raw: string): string | null {
  const bytes = responseBytes(raw, '020200');
  if (bytes.length !== 5 || bytes[0] !== 0x42 || bytes[1] !== 2 || bytes[2] !== 0) throw new ObdError('Invalid freeze-frame trigger response');
  return decodeDtcPair(bytes[3], bytes[4]);
}
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function pids(value: unknown): value is number[] { return Array.isArray(value) && value.length <= 255 && new Set(value).size === value.length && value.every(p => Number.isInteger(p) && p > 0 && p <= 255); }
export function validDiagnosticDetails(value: unknown, supportedPids: number[]): value is DiagnosticDetails {
  if (!record(value) || value.version !== 1 || !Array.isArray(supportedPids) || !validScaling(value.scaling, supportedPids) || !validMeasurements(value.measurements, supportedPids, value.scaling) || (value.readiness !== null && (!supportedPids.includes(1) || !validReadiness(value.readiness)))) return false;
  const frame = value.freezeFrame;
  if (!record(frame) || frame.frame !== 0 || typeof frame.readAt !== 'number' || !Number.isSafeInteger(frame.readAt) || frame.readAt < 0 || frame.readAt > 253402300799999) return false;
  if (frame.status === 'no-frame' || frame.status === 'no-data') return frame.code === undefined && frame.supportedPids === undefined && frame.measurements === undefined;
  if (frame.status !== 'available' || typeof frame.code !== 'string' || !/^[PCBU][0-3][0-9A-F]{3}$/.test(frame.code) || frame.code === 'P0000') return false;
  return (frame.supportedPids === null || pids(frame.supportedPids)) && validMeasurements(frame.measurements, frame.supportedPids ?? [], value.scaling);
}
