import {ObdError} from './protocol.ts';
import type {BleProfile} from './types.ts';
type Characteristic={uuid:string;isWritableWithResponse:boolean;isWritableWithoutResponse:boolean;isNotifiable:boolean;isIndicatable:boolean};
type Service={uuid:string;characteristics:Characteristic[]};
function standardService(uuid:string){const short=uuid.toLowerCase().replace(/^0000([0-9a-f]{4})(?:-0000-1000-8000-00805f9b34fb)?$/,'$1');return /^[0-9a-f]{4}$/.test(short)&&parseInt(short,16)>=0x1800&&parseInt(short,16)<=0x27ff;}
export function discoverBleProfile(deviceId:string,adapterName:string,services:Service[]):BleProfile{
 const candidates:BleProfile[]=[];
 for(const service of services){if(standardService(service.uuid))continue;const writers=service.characteristics.filter(c=>c.isWritableWithResponse||c.isWritableWithoutResponse);const readers=service.characteristics.filter(c=>c.isNotifiable||c.isIndicatable);for(const writer of writers)for(const reader of readers)candidates.push({deviceId,adapterName,serviceUUID:service.uuid,writeUUID:writer.uuid,notifyUUID:reader.uuid});}
 if(candidates.length!==1)throw new ObdError('Nie znaleziono jednoznacznej usługi szeregowej BLE. W ustawieniach zaawansowanych podaj UUID z instrukcji adaptera.');return candidates[0];
}
export function validAutoProfile(profile:BleProfile){return [profile.deviceId,profile.adapterName].every(v=>typeof v==='string'&&v.trim().length>0&&v.length<=200)&&[profile.serviceUUID,profile.writeUUID,profile.notifyUUID].every(v=>v==='');}
