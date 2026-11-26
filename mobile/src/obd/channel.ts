import { ObdError } from './protocol.ts';
import type { CommandTransport } from './types.ts';

type Pending = { command: string; resolve: (value: string) => void; reject: (reason: Error) => void };
export type ElmChannel = CommandTransport & { push(chunk: string): void; disconnect(reason?: Error): void };
export function createElmChannel(write: (ascii: string) => Promise<void>, options: { timeoutMs?: number; maxResponseLength?: number } = {}): ElmChannel {
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxLength = options.maxResponseLength ?? 8192;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isInteger(maxLength) || maxLength <= 0 || maxLength > 8192) throw new ObdError('Invalid channel limits');
  const queue: Pending[] = [];
  let active: Pending | null = null;
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed: Error | null = null;
  function disconnect(reason: Error = new ObdError('Adapter disconnected', 'disconnected')) {
    if (closed) return;
    closed = reason;
    clearTimeout(timer);
    active?.reject(reason);
    active = null;
    for (const item of queue.splice(0)) item.reject(reason);
    buffer = '';
  }
  function next() {
    if (closed || active || !queue.length) return;
    active = queue.shift()!;
    buffer = '';
    timer = setTimeout(() => disconnect(new ObdError('Adapter response timed out; reconnect before retrying', 'timeout')), timeoutMs);
    try { void write(`${active.command}\r`).catch(error => disconnect(error instanceof Error ? error : new ObdError('Adapter write failed'))); }
    catch (error) { disconnect(error instanceof Error ? error : new ObdError('Adapter write failed')); }
  }
  return {
    send(command) {
      if (closed) return Promise.reject(closed);
      if (typeof command !== 'string' || !/^[A-Z0-9 ]{1,32}$/i.test(command) || !command.trim() || queue.length >= 32) return Promise.reject(new ObdError('Invalid command or full command queue'));
      return new Promise((resolve, reject) => { queue.push({ command: command.toUpperCase().replace(/ /g, ''), resolve, reject }); next(); });
    },
    push(chunk) {
      if (closed) return;
      if (!active) { if (chunk.trim()) disconnect(new ObdError('Unexpected adapter data; reconnect before retrying')); return; }
      buffer += chunk;
      if (buffer.length > maxLength || /[^\x20-\x7E\r\n\t]/.test(buffer)) { disconnect(new ObdError('Adapter response exceeds limits or contains invalid bytes')); return; }
      const prompt = buffer.indexOf('>');
      if (prompt === -1) return;
      if (buffer.slice(prompt + 1).trim()) { disconnect(new ObdError('Unexpected data after ELM327 prompt')); return; }
      clearTimeout(timer);
      const completed = active;
      active = null;
      const response = buffer.slice(0, prompt + 1);
      buffer = '';
      completed.resolve(response);
      queueMicrotask(next);
    },
    disconnect,
  };
}
