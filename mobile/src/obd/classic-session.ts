import {createElmChannel} from './channel.ts';
import {createDisconnectSignal} from './disconnect-signal.ts';
import {ObdError} from './protocol.ts';
import type {BleTransport} from './types.ts';
type Subscription={remove:()=>void};
export type ClassicDevice={name:string;address:string;write:(data:string)=>Promise<boolean>;disconnect:()=>Promise<boolean>;onDataReceived:(listener:(event:{data:string})=>void)=>Subscription};
export function createClassicSession(device:ClassicDevice,subscribeDisconnect?:(listener:()=>void)=>Subscription):BleTransport{
 let closed=false,sent=false,startupLength=0;let receive:Subscription|undefined,disconnectEvent:Subscription|undefined;let closing:Promise<void>|null=null;
 const disconnected=createDisconnectSignal();
 const channel=createElmChannel(async ascii=>{if(closed)throw new ObdError('Bluetooth Classic rozłączony.','disconnected');const written=await device.write(ascii);if(!written)throw new ObdError('Nie udało się zapisać polecenia Bluetooth Classic.');});
 function close(){if(closing)return closing;closed=true;channel.disconnect(new ObdError('Połączenie Bluetooth Classic zostało przerwane.','disconnected'));receive?.remove();disconnectEvent?.remove();closing=Promise.resolve().then(()=>device.disconnect()).then(()=>{});disconnected.close();return closing;}
 receive=device.onDataReceived(event=>{if(closed)return;if(typeof event.data!=='string'){void close().catch(()=>{});return;}if(!sent){startupLength+=event.data.length;if(startupLength>8192)void close().catch(()=>{});return;}channel.push(event.data);});
 disconnectEvent=subscribeDisconnect?.(()=>{void close().catch(()=>{});});
 return {adapterName:device.name||device.address,onDisconnected:disconnected.subscribe,async send(command){sent=true;try{return await channel.send(command);}catch(e){await close().catch(()=>{});throw e;}},disconnect:close};
}
