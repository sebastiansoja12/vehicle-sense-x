import {ObdError} from './protocol';
import type {WifiProfile} from './wifi-core';
import type {BleTransport} from './types';
export {validateWifiProfile} from './wifi-core';
export async function createWifiTransport(_profile:WifiProfile,_limits?:{connectTimeoutMs?:number;commandTimeoutMs?:number}):Promise<BleTransport>{throw new ObdError('Połączenie TCP z adapterem Wi-Fi wymaga aplikacji na iOS lub Androidzie. Przeglądarka nie udostępnia surowych gniazd TCP.','unsupported');}
