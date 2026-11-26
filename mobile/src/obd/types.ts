import {validCanEcu} from './can.ts';
import type {CanEcu} from './can.ts';
export type Dtc = { code: string; status: 'stored' | 'pending' | 'permanent' };
export type DiagnosticSnapshot = {
  id: string;
  vehicleId: string;
  timestamp: number;
  source: 'obd' | 'import';
  adapterName: string;
  codes: Dtc[];
  readStatuses: Dtc['status'][];
  parameters: { rpm: number | null; coolantC: number | null; loadPercent: number | null; voltageV: number | null };
  supportedPids: number[];
  ecu?:CanEcu;
};
export interface CommandTransport { send(command: string): Promise<string> }
export type LiveParameters = Pick<DiagnosticSnapshot, 'vehicleId' | 'timestamp' | 'adapterName' | 'parameters' | 'ecu'>;
export interface BleTransport extends CommandTransport { adapterName: string; disconnect(): Promise<void>; onDisconnected(listener: () => void): () => void }
export type BleProfile = { deviceId: string; adapterName: string; serviceUUID: string; writeUUID: string; notifyUUID: string };
export type ScannedDevice = { id: string; name: string | null; rssi: number | null };
export type StopScan = () => Promise<void>;

function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 && value.length <= 200; }
function measurement(value: unknown, min: number, max: number) { return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max); }
export function validateDiagnosticSnapshot(value: unknown): value is DiagnosticSnapshot {
  if(record(value)&&value.ecu!==undefined&&!validCanEcu(value.ecu))return false;
  if (!record(value) || !text(value.id) || !text(value.vehicleId) || !text(value.adapterName)
    || typeof value.timestamp !== 'number' || !Number.isSafeInteger(value.timestamp) || value.timestamp < 0 || value.timestamp > 253402300799999
    || !['obd', 'import'].includes(String(value.source)) || !record(value.parameters)
    || !Array.isArray(value.codes) || value.codes.length > 1000 || !Array.isArray(value.supportedPids) || value.supportedPids.length > 255) return false;
  if (!Array.isArray(value.readStatuses) || value.readStatuses.length === 0 || value.readStatuses.length > 3 || new Set(value.readStatuses).size !== value.readStatuses.length || !value.readStatuses.every(s => ['stored', 'pending', 'permanent'].includes(s))) return false;
  const statuses = value.readStatuses;
  if (!value.codes.every(c => record(c) && typeof c.code === 'string' && /^[PCBU][0-3][0-9A-F]{3}$/.test(c.code) && statuses.includes(c.status))) return false;
  if (!value.supportedPids.every(p => Number.isInteger(p) && p > 0 && p <= 255) || new Set(value.supportedPids).size !== value.supportedPids.length) return false;
  const p = value.parameters;
  return measurement(p.rpm, 0, 16383.75) && measurement(p.coolantC, -40, 215) && measurement(p.loadPercent, 0, 100) && measurement(p.voltageV, 0, 100);
}
