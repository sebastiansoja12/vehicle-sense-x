import { ObdError } from './protocol.ts';
import type { BleProfile, BleTransport, ScannedDevice, StopScan } from './types.ts';
export { validateBleProfile } from './ble-session.ts';
export async function createBleTransport(_profile: BleProfile): Promise<BleTransport> {
  throw new ObdError('OBD BLE requires an iOS or Android development build; web Bluetooth is not supported', 'unsupported');
}
export async function scanDevices(_onDevice: (device: ScannedDevice) => void, _onError: (error: Error) => void): Promise<StopScan> {
  throw new ObdError('BLE adapter scanning requires an iOS or Android development build', 'unsupported');
}
