import {ObdError,responseLines} from './protocol.ts';
export type CanProtocol=6|7|8|9;
export type CanEcu={protocol:CanProtocol;responseId:string};
export class EcuSelectionRequired extends ObdError{readonly ecus:CanEcu[];constructor(ecus:CanEcu[]){super('Wykryto kilka sterowników CAN. Wybierz źródło odczytu.','ambiguous');this.ecus=ecus.map(ecu=>({...ecu}));}}
export function validCanEcu(value:unknown):value is CanEcu{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const ecu=value as Record<string,unknown>;
 if(typeof ecu.responseId!=='string')return false;
 if(ecu.protocol===6||ecu.protocol===8)return /^7E[8-F]$/.test(ecu.responseId);
 return (ecu.protocol===7||ecu.protocol===9)&&/^18DAF1[0-9A-F]{2}$/.test(ecu.responseId)&&ecu.responseId!=='18DAF1F1';
}
export function requestIdFor(ecu:CanEcu):string{
 if(!validCanEcu(ecu))throw new ObdError('Nieobsługiwany adres sterownika CAN.','unsupported');
 return ecu.protocol===6||ecu.protocol===8?(parseInt(ecu.responseId,16)-8).toString(16).toUpperCase():`18DA${ecu.responseId.slice(-2)}F1`;
}
export function parseProtocol(raw:string):number{
 const lines=responseLines(raw,'ATDPN');
 if(lines.length!==1||!/^A?[1-9]$/.test(lines[0]))throw new ObdError('Nie rozpoznano obsługiwanego protokołu OBD.','unsupported');
 return Number(lines[0].slice(-1));
}
export function parseCanMessages(raw:string,command:string,protocol:CanProtocol):{responseId:string;payload:number[]}[]{
 if(![6,7,8,9].includes(protocol))throw new ObdError('Unsupported CAN protocol');
 const messages=new Map<string,{payload:number[];length:number;sequence:number}>();
 for(const line of responseLines(raw,command)){
  const hex=line.replace(/\s/g,''),headerLength=protocol===6||protocol===8?3:8;
  if(!/^[0-9A-F]+$/.test(hex)||(hex.length-headerLength)%2!==0)throw new ObdError('Invalid CAN frame');
  const responseId=hex.slice(0,headerLength);
  if(!validCanEcu({protocol,responseId}))throw new ObdError('Unsupported CAN response address','unsupported');
  const frame=(hex.slice(headerLength).match(/../g)??[]).map(byte=>parseInt(byte,16));
  if(frame.length<2||frame.length>8)throw new ObdError('Invalid CAN frame length');
  const kind=frame[0]>>>4,existing=messages.get(responseId);
  if(kind===0){
   const length=frame[0]&15;
   if(existing||length<1||length>7||frame.length<length+1)throw new ObdError('Invalid or duplicated CAN single frame');
   messages.set(responseId,{payload:frame.slice(1,length+1),length,sequence:1});
  }else if(kind===1){
   const length=(frame[0]&15)*256+frame[1];
   if(existing||frame.length!==8||length<=7)throw new ObdError('Invalid or duplicated CAN first frame');
   messages.set(responseId,{payload:frame.slice(2),length,sequence:1});
  }else if(kind===2){
   if(!existing||existing.payload.length>=existing.length||(frame[0]&15)!==existing.sequence)throw new ObdError('Missing or out-of-sequence CAN frame');
   const remaining=existing.length-existing.payload.length;
   if(frame.length<Math.min(7,remaining)+1)throw new ObdError('Truncated CAN consecutive frame');
   existing.payload.push(...frame.slice(1,Math.min(7,remaining)+1));existing.sequence=(existing.sequence+1)%16;
  }else throw new ObdError('Unsupported CAN frame type');
 }
 if([...messages.values()].some(message=>message.payload.length!==message.length))throw new ObdError('Incomplete CAN message');
 return [...messages].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([responseId,message])=>({responseId,payload:message.payload}));
}
