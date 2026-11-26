import type { Dtc } from './types.ts';

type ErrorKind = 'no-data' | 'protocol' | 'ambiguous' | 'timeout' | 'disconnected' | 'unsupported' | 'confirmation';
export class ObdError extends Error {
  readonly kind: ErrorKind;
  constructor(message: string, kind: 'no-data' | 'protocol' | 'ambiguous' | 'timeout' | 'disconnected' | 'unsupported' | 'confirmation' = 'protocol') { super(message); this.name = 'ObdError'; this.kind = kind; }
}

// ELM327DSK pp. 8, 30–36, 43: headers-off ASCII, prompt termination and SAE DTC pairs.
export function responseLines(raw: string, command: string): string[] {
  if (raw.length > 8192 || /[^\x20-\x7E\r\n\t]/.test(raw)) throw new ObdError('Malformed ELM327 response');
  const response = raw.trim().toUpperCase();
  if (!response.endsWith('>') || response.indexOf('>') !== response.length - 1) throw new ObdError('Incomplete ELM327 response');
  const lines = response.slice(0, -1).replace(/SEARCHING\.{3}/g, '').split(/[\r\n]+/).map(l => l.trim()).filter(l => l && l.replace(/\s/g, '') !== command.toUpperCase().replace(/\s/g, ''));
  if (lines.some(l => /NO\s*DATA/.test(l))) throw new ObdError('No response from vehicle', 'no-data');
  if (lines.some(l => /ERROR|UNABLE|STOPPED|BUS BUSY|BUFFER FULL|LV RESET|\?/.test(l))) throw new ObdError('Adapter or vehicle rejected the request');
  if (!lines.length) throw new ObdError('Empty ELM327 response');
  return lines;
}
function bytes(raw: string, command: string): number[] {
  const lines = responseLines(raw, command);
  if (lines.length !== 1) throw new ObdError('Multiple ECU responses or unsupported segmented reply; select a single ECU', 'ambiguous');
  const line = lines[0];
  if (!/^(?:[0-9A-F]{2}\s*)+$/.test(line) && !/^[0-9A-F]+$/.test(line)) throw new ObdError('Invalid hexadecimal response');
  const hex = line.replace(/\s/g, '');
  if (hex.length % 2) throw new ObdError('Incomplete hexadecimal byte');
  return hex.match(/../g)!.map(b => parseInt(b, 16));
}
export function parseSupportedPids(raw: string, page = 0): number[] {
  if (page !== 0 && page !== 32) throw new ObdError('Unsupported PID bitmap page');
  const b = bytes(raw, `01${page.toString(16).padStart(2, '0')}`);
  if (b.length !== 6 || b[0] !== 0x41 || b[1] !== page) throw new ObdError('Invalid supported PID response');
  const supported: number[] = [];
  for (let i = 0; i < 32; i++) if (b[2 + Math.floor(i / 8)] & (0x80 >>> (i % 8))) supported.push(page + i + 1);
  return supported;
}
export function parsePid(raw: string, command: '010C' | '0105' | '0104'): number {
  const b = bytes(raw, command);
  const pid = parseInt(command.slice(2), 16);
  if (b[0] !== 0x41 || b[1] !== pid || b.length !== (pid === 12 ? 4 : 3)) throw new ObdError('Unexpected PID response');
  if (pid === 12) return (b[2] * 256 + b[3]) / 4;
  if (pid === 5) return b[2] - 40;
  return b[2] * 100 / 255;
}
export function parseVoltage(raw: string): number {
  const lines = responseLines(raw, 'ATRV');
  if (lines.length !== 1 || !/^\d{1,2}\.\d{1,2}V$/.test(lines[0])) throw new ObdError('Invalid adapter voltage response');
  return Number(lines[0].slice(0, -1));
}
export function parseDtc(raw: string, mode: '03' | '07' | '0A',format:'auto'|'can'='auto'): Dtc[] {
  const b = bytes(raw, mode);
  if (b[0] !== parseInt(mode, 16) + 0x40 || b.length < 2) throw new ObdError('Invalid DTC response');
  let data = b.slice(1);
  if(format==='can'&&data.length%2!==1)throw new ObdError('Missing CAN DTC count');
  // CAN replies may include an explicit DTC count; legacy replies consist of pairs only.
  if (data.length % 2) {
    const count = data.shift()!;
    if (data.length < count * 2 || data.slice(count * 2).some(v => v !== 0)) throw new ObdError('Invalid DTC count');
    data = data.slice(0, count * 2);
    if(format==='can'&&data.some((value,index)=>index%2===0&&value===0&&data[index+1]===0))throw new ObdError('CAN DTC count includes an empty code');
  }
  const status = { '03': 'stored', '07': 'pending', '0A': 'permanent' }[mode] as Dtc['status'];
  const result: Dtc[] = [];
  for (let i = 0; i < data.length; i += 2) {
    const value = data[i] * 256 + data[i + 1];
    if (value === 0) continue;
    const code = 'PCBU'[data[i] >>> 6] + ((data[i] >>> 4) & 3) + (value & 0xFFF).toString(16).toUpperCase().padStart(3, '0');
    if (!result.some(c => c.code === code)) result.push({ code, status });
  }
  return result;
}
export function parseClearResponse(raw: string): true {
  const b = bytes(raw, '04');
  if (b.length !== 1 || b[0] !== 0x44) throw new ObdError('Vehicle did not acknowledge fault clearing');
  return true;
}
