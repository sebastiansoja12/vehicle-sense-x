import base64 from 'base-64';
import type { Device, Subscription } from 'react-native-ble-plx';
import { createElmChannel } from './channel.ts';
import { ObdError } from './protocol.ts';
import type { BleProfile, BleTransport } from './types.ts';

function uuid(value: string): string {
  const lower = value.toLowerCase();
  return lower.length === 4 ? `0000${lower}-0000-1000-8000-00805f9b34fb` : lower.length === 8 ? `${lower}-0000-1000-8000-00805f9b34fb` : lower;
}
export function validateBleProfile(value: unknown): value is BleProfile {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (![p.deviceId, p.adapterName].every(v => typeof v === 'string' && v.trim().length > 0 && v.length <= 200)) return false;
  return [p.serviceUUID, p.writeUUID, p.notifyUUID].every(v => typeof v === 'string' && /^(?:[0-9a-f]{4}|[0-9a-f]{8}|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})$/i.test(v));
}
type ConnectedDevice = Pick<Device, 'id' | 'characteristicsForService' | 'monitorCharacteristicForService' | 'onDisconnected' | 'writeCharacteristicWithResponseForService' | 'writeCharacteristicWithoutResponseForService' | 'cancelConnection'>;
// SDK 3.5.1 source signatures and the official BLE-PLX reference (see README).
export async function createConnectedBleTransport(device: ConnectedDevice, profile: BleProfile, cleanup: () => Promise<void>): Promise<BleTransport> {
  if (!validateBleProfile(profile) || device.id !== profile.deviceId) throw new ObdError('Specify the adapter and all three BLE UUIDs');
  const characteristics = await device.characteristicsForService(profile.serviceUUID);
  const writer = characteristics.find(c => uuid(c.uuid) === uuid(profile.writeUUID));
  const notifier = characteristics.find(c => uuid(c.uuid) === uuid(profile.notifyUUID));
  if (!writer || (!writer.isWritableWithResponse && !writer.isWritableWithoutResponse) || !notifier || (!notifier.isNotifiable && !notifier.isIndicatable)) throw new ObdError('Selected UUIDs do not provide writable and notifying BLE characteristics');
  let notifications: Subscription | undefined;
  let disconnections: Subscription | undefined;
  let closing: Promise<void> | null = null;
  let closed = false;
  const channel = createElmChannel(async ascii => {
    const encoded = base64.encode(ascii);
    if (writer.isWritableWithResponse) await device.writeCharacteristicWithResponseForService(profile.serviceUUID, profile.writeUUID, encoded);
    else await device.writeCharacteristicWithoutResponseForService(profile.serviceUUID, profile.writeUUID, encoded);
  });
  function close(reason?: Error): Promise<void> {
    if (closing) return closing;
    closed = true;
    channel.disconnect(reason);
    notifications?.remove(); disconnections?.remove();
    closing = (async () => { try { await device.cancelConnection(); } catch { /* Already disconnected. */ } finally { await cleanup(); } })();
    return closing;
  }
  try {
    disconnections = device.onDisconnected(error => { void close(error ?? new ObdError('BLE adapter disconnected', 'disconnected')).catch(() => {}); });
    notifications = device.monitorCharacteristicForService(profile.serviceUUID, profile.notifyUUID, (error, characteristic) => {
      if (error) { void close(error).catch(() => {}); return; }
      if (characteristic?.value === null || characteristic?.value === undefined) return;
      try { channel.push(base64.decode(characteristic.value)); }
      catch { void close(new ObdError('Invalid BLE notification encoding')).catch(() => {}); }
    });
    if (closed) { notifications.remove(); disconnections.remove(); throw new ObdError('Adapter disconnected during setup', 'disconnected'); }
  } catch (error) { await close(error instanceof Error ? error : new ObdError('BLE monitoring failed')); throw error; }
  return {
    adapterName: profile.adapterName,
    async send(command) {
      try { return await channel.send(command); }
      catch (error) { await close(error instanceof Error ? error : new ObdError('BLE command failed')); throw error; }
    },
    disconnect: () => close(),
  };
}
