import {ObdError} from './protocol';
import type {BleTransport,ScannedDevice} from './types';
export async function listClassicDevices():Promise<ScannedDevice[]>{throw new ObdError('Bluetooth Classic/SPP jest dostępny w aplikacji Android. Na iPhone wybierz BLE lub Wi-Fi.','unsupported');}
export async function createClassicTransport(_address:string):Promise<BleTransport>{throw new ObdError('Bluetooth Classic/SPP jest dostępny w aplikacji Android.','unsupported');}
