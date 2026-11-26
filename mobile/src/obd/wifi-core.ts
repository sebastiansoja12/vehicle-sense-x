import {createElmChannel} from './channel.ts';
import {ObdError} from './protocol.ts';
import type {BleTransport} from './types.ts';
export type WifiProfile={host:string;port:number;adapterName:string};
export interface TcpSocket {
 on(event:'connect'|'data'|'error'|'close'|'end',listener:(value?:unknown)=>void):unknown;
 write(data:string,callback:(error?:Error|null)=>void):unknown;
 destroy():unknown;
 setNoDelay?(enabled:boolean):unknown;
}
export type Dial=(options:{host:string;port:number;connectTimeout:number})=>TcpSocket;
export function validateWifiProfile(value:unknown):value is WifiProfile{
 if(!value||typeof value!=='object')return false;const p=value as WifiProfile;
 if(typeof p.adapterName!=='string'||!p.adapterName.trim()||p.adapterName.length>200||typeof p.host!=='string'||!Number.isInteger(p.port)||p.port<1||p.port>65535)return false;
 const parts=p.host.split('.');if(parts.length!==4||parts.some(s=>! /^(?:0|[1-9]\d{0,2})$/.test(s)||Number(s)>255))return false;
 const [a,b]=parts.map(Number);return a===10||a===192&&b===168||a===172&&b>=16&&b<=31||a===169&&b===254;
}
/** Uses an actual TCP socket. The socket factory is the OS boundary, not an ELM simulator. */
export function connectWifi(profile:WifiProfile,dial:Dial,options:{connectTimeoutMs?:number;commandTimeoutMs?:number}={}):Promise<BleTransport>{
 if(!validateWifiProfile(profile))return Promise.reject(new ObdError('Podaj lokalny adres IPv4 adaptera, port 1–65535 i nazwę.'));
 const connectTimeoutMs=options.connectTimeoutMs??10000;
 if(!Number.isFinite(connectTimeoutMs)||connectTimeoutMs<=0)return Promise.reject(new ObdError('Nieprawidłowy limit czasu połączenia.'));
 return new Promise((resolve,reject)=>{
  let socket:TcpSocket|undefined,connected=false,closed=false,sent=false,startupBytes=0;
  const channel=createElmChannel(ascii=>new Promise<void>((done,fail)=>{if(!socket||!connected||closed){fail(new ObdError('Połączenie Wi-Fi zostało przerwane.','disconnected'));return;}try{socket.write(ascii,error=>error?fail(error):done());}catch(e){fail(e);}}),{timeoutMs:options.commandTimeoutMs});
  const close=(reason=new ObdError('Połączenie Wi-Fi zostało zamknięte.','disconnected'))=>{if(closed)return;closed=true;clearTimeout(timer);channel.disconnect(reason);try{socket?.destroy();}finally{if(!connected)reject(reason);}};
  const timer=setTimeout(()=>close(new ObdError('Przekroczono czas połączenia. Połącz telefon z siecią Wi-Fi adaptera i sprawdź adres oraz port.','timeout')),connectTimeoutMs);
  try{
   socket=dial({host:profile.host,port:profile.port,connectTimeout:connectTimeoutMs});
   socket.on('connect',()=>{if(closed)return;try{socket?.setNoDelay?.(true);}catch{close(new ObdError('Nie udało się skonfigurować połączenia TCP.'));return;}connected=true;clearTimeout(timer);resolve({adapterName:profile.adapterName,async send(command){sent=true;try{return await channel.send(command);}catch(e){close(e instanceof ObdError?e:new ObdError('Błąd transmisji Wi-Fi. Połącz ponownie.'));throw e;}},async disconnect(){close();}});});
   socket.on('data',data=>{if(closed)return;const chunk=typeof data==='string'?data:(data as {toString?:()=>string})?.toString?.();if(typeof chunk!=='string'){close(new ObdError('Nieprawidłowe dane TCP.'));return;}if(!sent){startupBytes+=chunk.length;if(startupBytes>8192||/[^\x20-\x7E\r\n\t]/.test(chunk))close(new ObdError('Nieprawidłowy komunikat startowy adaptera.'));return;}channel.push(chunk);});
   socket.on('error',()=>close(new ObdError('Błąd połączenia Wi-Fi. Sprawdź sieć adaptera, adres, port i zgodę na sieć lokalną.','disconnected')));
   socket.on('close',()=>close());socket.on('end',()=>close());
  }catch{close(new ObdError('Nie udało się otworzyć połączenia TCP z adapterem.'));}
 });
}
