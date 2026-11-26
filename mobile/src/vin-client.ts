import {decodeVinResponse,normalizeDecodeVin} from './vin-decoder.ts';
import type {DecodedVehicleSource} from './vin-decoder.ts';
import {ValidationError} from './validation.ts';

const limit=131072;
class LookupError extends Error{}
function stopped(timeout=false){const error=new LookupError(timeout?'Przekroczono czas odpowiedzi NHTSA. Spróbuj później.':'Przerwano pobieranie danych VIN.');error.name=timeout?'TimeoutError':'AbortError';return error;}
async function boundedText(response:Response):Promise<string>{
 const invalid=()=>new LookupError('Nieprawidłowa lub zbyt duża odpowiedź NHTSA.');
 if(Number(response.headers.get('content-length'))>limit||!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')??''))throw invalid();
 if(!response.body?.getReader){
  // Native fetch can buffer text before exposing it; the fixed provider endpoint returns one VIN.
  const text=await response.text();if(text.length>limit)throw invalid();
  let bytes=0;for(const char of text){const cp=char.codePointAt(0)!;bytes+=cp>65535?4:cp>2047?3:cp>127?2:1;if(bytes>limit)throw invalid();}
  return text;
 }
 const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,text='';
 try{
  while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>limit)throw invalid();text+=decoder.decode(chunk.value,{stream:true});}
  return text+decoder.decode();
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
export async function lookupVin({vin,consent,signal}:{vin:string;consent:boolean;signal?:AbortSignal},fetchImpl:typeof fetch=fetch):Promise<DecodedVehicleSource>{
 if(consent!==true)throw new LookupError('Najpierw wyraź zgodę na wysłanie VIN do NHTSA.');
 const normalized=normalizeDecodeVin(vin);if(signal?.aborted)throw stopped();
 const url=`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${normalized}?format=json`;
 const controller=new AbortController();let failure:Error|null=null;let rejectStop:(error:Error)=>void=()=>{};
 const terminated=new Promise<never>((_,reject)=>{rejectStop=reject;});
 const stop=(error:Error)=>{failure=error;controller.abort();rejectStop(error);};
 const abort=()=>stop(stopped());signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(()=>stop(stopped(true)),20000);
 const request=async()=>{
  const response=await fetchImpl(url,{method:'GET',signal:controller.signal,headers:{accept:'application/json'},redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
  if(!response.ok){void response.body?.cancel().catch(()=>{});throw new LookupError(response.status===429?'NHTSA ograniczyła zapytania. Spróbuj ponownie później.':'Dane NHTSA są chwilowo niedostępne. Możesz wpisać samochód ręcznie.');}
  if(response.url&&new URL(response.url).origin!=='https://vpic.nhtsa.dot.gov')throw new LookupError('NHTSA przekierowała odpowiedź do innej usługi.');
  const raw=await boundedText(response);let body:unknown;
  try{body=JSON.parse(raw);}catch{throw new LookupError('NHTSA nie zwróciła poprawnych danych JSON.');}
  return decodeVinResponse(body,normalized);
 };
 try{return await Promise.race([request(),terminated]);}
 catch(error){if(failure)throw failure;if(error instanceof LookupError||error instanceof ValidationError)throw error;throw new LookupError('Nie można pobrać danych NHTSA. Sprawdź połączenie lub wpisz samochód ręcznie.');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);controller.abort();}
}
