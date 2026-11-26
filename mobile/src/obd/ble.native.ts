import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import type { Device, Subscription } from 'react-native-ble-plx';
import { createConnectedBleTransport, validateBleProfile } from './ble-session.ts';
import {discoverBleProfile,validAutoProfile} from './ble-discovery.ts';
import { ObdError } from './protocol.ts';
import type { BleProfile, BleTransport, ScannedDevice, StopScan } from './types.ts';
export { validateBleProfile } from './ble-session.ts';

async function requestPermissions(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const permissions = Number(Platform.Version) >= 31
    ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const result = await PermissionsAndroid.requestMultiple(permissions);
  if (permissions.some(p => result[p] !== PermissionsAndroid.RESULTS.GRANTED)) throw new ObdError('Bluetooth permission was denied');
}
async function ready(manager: BleManager): Promise<void> {
  const current = await manager.state();
  if (current === State.PoweredOn) return;
  if (current !== State.Unknown && current !== State.Resetting) throw new ObdError('Enable Bluetooth and grant Bluetooth access before connecting');
  return new Promise((resolve, reject) => {
    let subscription: Subscription | undefined;
    const timer = setTimeout(() => { subscription?.remove(); reject(new ObdError('Bluetooth is not ready', 'timeout')); }, 10000);
    subscription = manager.onStateChange(state => {
      if (state === State.Unknown || state === State.Resetting) return;
      clearTimeout(timer); subscription?.remove();
      if (state === State.PoweredOn) resolve();
      else reject(new ObdError('Enable Bluetooth and grant Bluetooth access before connecting'));
    }, true);
  });
}
export async function createBleTransport(profile: BleProfile): Promise<BleTransport> {
  if (!validateBleProfile(profile)&&!validAutoProfile(profile)) throw new ObdError('Specify the adapter and all three BLE UUIDs');
  await requestPermissions();
  const manager = new BleManager();
  let device: Device | undefined;
  let destroying: Promise<void> | null = null;
  const destroy = () => destroying ??= manager.destroy();
  try {
    await ready(manager);
    device = await manager.connectToDevice(profile.deviceId, { timeout: 15000 });
    device = await device.discoverAllServicesAndCharacteristics();
    if(validAutoProfile(profile)){const services=await device.services();const discovered=[];for(const service of services)discovered.push({uuid:service.uuid,characteristics:await device.characteristicsForService(service.uuid)});profile=discoverBleProfile(profile.deviceId,profile.adapterName,discovered);}
    return await createConnectedBleTransport(device, profile, destroy);
  } catch (error) {
    if (device) { try { await device.cancelConnection(); } catch { /* Already disconnected. */ } }
    await destroy();
    throw error;
  }
}
export async function scanDevices(onDevice: (device: ScannedDevice) => void, onError: (error: Error) => void): Promise<StopScan> {
  await requestPermissions();
  const manager = new BleManager();
  let stopped = false;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  async function stop() {
    if (stopped) return;
    stopped = true;
    clearTimeout(stopTimer);
    try { await manager.stopDeviceScan(); } finally { await manager.destroy(); }
  }
  try {
    await ready(manager);
    stopTimer = setTimeout(() => { void stop().catch(onError); }, 15000);
    await manager.startDeviceScan(null, null, (error, device) => {
      if (stopped) return;
      if (error) { onError(error); void stop().catch(onError); return; }
      if (device) onDevice({ id: device.id, name: device.name ?? device.localName, rssi: device.rssi });
    });
    return stop;
  } catch (error) { await stop(); throw error; }
}
