import {ObdError,responseLines} from './protocol.ts';
import {validateWifiProfile} from './wifi-core.ts';
import type {WifiProfile} from './wifi-core.ts';
import type {BleProfile,BleTransport,ScannedDevice} from './types.ts';

export type AdapterDevice=ScannedDevice & {transport:'ble'|'classic'};
export function automaticBleProfile(device:Pick<ScannedDevice,'id'|'name'>):BleProfile {
 if(typeof device.id!=='string'||!device.id.trim()||device.id.length>200)throw new ObdError('Wybierz urządzenie z wyszukanej listy.');
 return {deviceId:device.id,adapterName:device.name?.trim().slice(0,200)||'Adapter Bluetooth',serviceUUID:'',writeUUID:'',notifyUUID:''};
}
export type WifiOpener=(profile:WifiProfile,options:{connectTimeoutMs:number;commandTimeoutMs:number})=>Promise<BleTransport>;
// Documented OBDLink MX Wi-Fi default; custom endpoints come only from a saved profile.
const standardWifi:WifiProfile={host:'192.168.0.10',port:35000,adapterName:'Adapter OBD2 Wi-Fi'};
export async function detectWifiProfile(open:WifiOpener,{saved,signal}:{saved?:WifiProfile;signal?:AbortSignal}={}):Promise<WifiProfile> {
 const cancelled=()=>new ObdError('Anulowano wyszukiwanie adaptera.','disconnected');
 const candidates:WifiProfile[]=[];
 for(const profile of [saved,standardWifi]){
  if(validateWifiProfile(profile)&&!candidates.some(p=>p.host===profile.host&&p.port===profile.port))candidates.push({...profile});
 }
 for(const profile of candidates){
  if(signal?.aborted)throw cancelled();
  let link:BleTransport|undefined,closing:Promise<void>|undefined,found:WifiProfile|undefined;
  const close=()=>{if(!link)return Promise.resolve();return closing??=Promise.resolve().then(()=>link!.disconnect());};
  const abort=()=>{void close().catch(()=>{});};
  signal?.addEventListener('abort',abort,{once:true});
  try{
   link=await open(profile,{connectTimeoutMs:2000,commandTimeoutMs:2000});
   if(signal?.aborted)throw cancelled();
   const lines=responseLines(await link.send('ATI'),'ATI');
   if(signal?.aborted)throw cancelled();
   if(lines.length===1&&/^ELM327\b/.test(lines[0])&&lines[0].length<=200)found={...profile,adapterName:lines[0]};
  }catch{if(signal?.aborted)throw cancelled();}
  finally{signal?.removeEventListener('abort',abort);await close();}
  if(signal?.aborted)throw cancelled();
  if(found)return found;
 }
 throw new ObdError('Nie wykryto adaptera Wi-Fi. Połącz telefon z siecią adaptera i spróbuj ponownie. Nietypowy profil można ustawić w opcjach zaawansowanych.');
}
