import {ObdError,responseBytes,parseSupportedPids} from './protocol.ts';

export const MAX_IDENTIFICATION_ITEMS=64;
export type EcuName={acronym:string;name:string};
type NoData={status:'no-data';readAt:number};
type NegativeResponse={status:'negative-response';nrc:string;readAt:number};
export type IdentityReading<T>=NoData|NegativeResponse|{status:'unsupported';readAt:number}|{status:'available';value:T;readAt:number};
export type EcuIdentification={version:1}&(NoData|NegativeResponse|{
 status:'available';readAt:number;supportedInfoTypes:number[];
 calibrationIds:IdentityReading<string[]>;cvns:IdentityReading<string[]>;ecuName:IdentityReading<EcuName>;
});
export const identificationFields=[
 {key:'calibrationIds',infoType:4,label:'Identyfikatory kalibracji · CALID'},
 {key:'cvns',infoType:6,label:'Numery weryfikacji kalibracji · CVN'},
 {key:'ecuName',infoType:10,label:'Nazwa ECU · skrót i opis'},
] as const;
export type IdentificationKey=typeof identificationFields[number]['key'];
export function identificationValues(reading:IdentityReading<string[]|EcuName>):string[]|null {
 return reading.status!=='available'?null:Array.isArray(reading.value)?[...reading.value]:[reading.value.acronym,reading.value.name];
}
export function identificationStatus(value:IdentityReading<unknown>|EcuIdentification):string {
 if(value.status==='available')return 'Zgłoszone przez ECU';
 if(value.status==='unsupported')return 'Nieobsługiwane według mapy 09 00';
 if(value.status==='negative-response')return 'Negatywna odpowiedź ECU · NRC '+value.nrc;
 return 'Brak odpowiedzi · nieznane';
}
export function parseIdentificationSupported(raw:string):number[]{return parseSupportedPids(raw,0,9);}
export function parseIdentificationNegative(raw:string,infoType:number):string|null {
 const b=responseBytes(raw,'09'+infoType.toString(16).padStart(2,'0'));
 if(b[0]!==0x7F){if(b[0]!==0x49||b[1]!==infoType)throw new ObdError('Nieprawidłowy typ odpowiedzi identyfikacji ECU.');return null;}
 if(b.length!==3||b[1]!==9||b[2]===0)throw new ObdError('Nieprawidłowa negatywna odpowiedź usługi 09.');
 if(b[2]===0x78)throw new ObdError('ECU oczekuje na wynik usługi 09 (NRC 78). Połącz ponownie przed kolejnym zapytaniem.','unsupported');
 return b[2].toString(16).toUpperCase().padStart(2,'0');
}
function records(raw:string,pid:number,width:number,max=MAX_IDENTIFICATION_ITEMS):number[][] {
 const b=responseBytes(raw,'09'+pid.toString(16).padStart(2,'0'));
 if(b[0]!==0x49||b[1]!==pid||b.length<3||b[2]<1||b[2]>max||b.length!==3+b[2]*width)throw new ObdError('Nieprawidłowa liczba lub długość rekordów identyfikacji ECU.');
 return Array.from({length:b[2]},(_,i)=>b.slice(3+i*width,3+(i+1)*width));
}
function paddedText(bytes:number[]):string {
 const end=bytes.indexOf(0);const used=end===-1?bytes:bytes.slice(0,end);
 if(!used.length||used.some(b=>b<0x20||b>0x7E)||(end!==-1&&bytes.slice(end).some(b=>b!==0)))throw new ObdError('Nieprawidłowy tekst lub wypełnienie identyfikacji ECU.');
 const text=String.fromCharCode(...used);
 if(!text.trim())throw new ObdError('ECU zwrócił pusty identyfikator.');
 return text;
}
export function parseCalibrationIds(raw:string):string[]{return records(raw,4,16).map(paddedText);}
export function parseCalibrationVerificationNumbers(raw:string):string[]{
 return records(raw,6,4).map(item=>item.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(''));
}
export function parseEcuName(raw:string):EcuName {
 const bytes=records(raw,10,20,1)[0];
 if(bytes[4]!==0x2D)throw new ObdError('Nieprawidłowy separator nazwy ECU.');
 return {acronym:paddedText(bytes.slice(0,4)),name:paddedText(bytes.slice(5))};
}
function object(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value);}
function keys(value:Record<string,unknown>,allowed:string[]):boolean{return Object.keys(value).every(key=>allowed.includes(key));}
function time(value:unknown):boolean{return typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=253402300799999;}
function ascii(value:unknown,max:number):value is string{return typeof value==='string'&&value.trim().length>0&&value.length<=max&&/^[\x20-\x7E]+$/.test(value);}
function nrc(value:unknown):boolean{return typeof value==='string'&&/^[0-9A-F]{2}$/.test(value)&&value!=='00'&&value!=='78';}
function list(value:unknown,test:(v:unknown)=>boolean):value is string[]{return Array.isArray(value)&&value.length>0&&value.length<=MAX_IDENTIFICATION_ITEMS&&value.every(test);}
function validName(value:unknown):value is EcuName{return object(value)&&keys(value,['acronym','name'])&&ascii(value.acronym,4)&&ascii(value.name,15);}
function reading(value:unknown,supported:boolean,valid:(v:unknown)=>boolean):boolean{
 if(!object(value)||!time(value.readAt))return false;
 if(!supported)return value.status==='unsupported'&&keys(value,['status','readAt']);
 if(value.status==='available')return keys(value,['status','readAt','value'])&&valid(value.value);
 if(value.status==='negative-response')return keys(value,['status','readAt','nrc'])&&nrc(value.nrc);
 return value.status==='no-data'&&keys(value,['status','readAt']);
}
export function validEcuIdentification(value:unknown):value is EcuIdentification {
 if(!object(value)||value.version!==1||!time(value.readAt))return false;
 if(value.status==='no-data')return keys(value,['version','status','readAt']);
 if(value.status==='negative-response')return keys(value,['version','status','readAt','nrc'])&&nrc(value.nrc);
 if(value.status!=='available'||!keys(value,['version','status','readAt','supportedInfoTypes','calibrationIds','cvns','ecuName']))return false;
 const pids=value.supportedInfoTypes;
 if(!Array.isArray(pids)||pids.length>32||new Set(pids).size!==pids.length||!pids.every(p=>Number.isInteger(p)&&p>0&&p<=32))return false;
 return reading(value.calibrationIds,pids.includes(4),v=>list(v,item=>ascii(item,16)))
  &&reading(value.cvns,pids.includes(6),v=>list(v,item=>typeof item==='string'&&/^[0-9A-F]{8}$/.test(item)))
  &&reading(value.ecuName,pids.includes(10),validName);
}
