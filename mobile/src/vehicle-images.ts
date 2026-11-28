import type {Vehicle} from './domain.ts';
export type VehicleImage={id:number;title:string;uri:string;page:string;author:string;license:string};
type Identity=Pick<Vehicle,'make'|'model'|'year'>;
const limit=131072;
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
function plain(value:unknown,max=240){return typeof value==='string'?value.replace(/<[^>]*>/g,' ').replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,entity=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[entity]??' ')).replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';}
export function vehicleImageQuery(vehicle:Identity,includeYear=true){
 const clean=(value:string)=>typeof value==='string'?value.replace(/[^\p{L}\p{N}\s-]/gu,' ').replace(/\b(?:OR|AND|NOT)\b/g,' ').replace(/\s+/g,' ').trim().slice(0,100):'';
 const make=clean(vehicle.make),model=clean(vehicle.model);
 if(!make||!model||!Number.isInteger(vehicle.year)||vehicle.year<1886||vehicle.year>new Date().getFullYear()+1)throw new Error('Uzupełnij markę, model i rok w Garażu.');
 const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'search',gsrnamespace:'6',gsrsearch:`intitle:"${make} ${model}" ${includeYear?vehicle.year:''} filetype:bitmap`,gsrlimit:'4',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'960',iiextmetadatafilter:'Artist|LicenseShortName'});
 return `https://commons.wikimedia.org/w/api.php?${params}`;
}
function safeUrl(value:unknown,origin:string,path:string){if(typeof value!=='string'||value.length>2048)return null;try{const url=new URL(value);return url.origin===origin&&!url.username&&!url.password&&url.pathname.startsWith(path)?url.href:null;}catch{return null;}}
export function parseVehicleImages(body:unknown):VehicleImage[]{
 if(!record(body)||body.error)throw new Error('Wikimedia Commons nie zwróciła zdjęć. Spróbuj później.');
 if(body.query===undefined){if(body.batchcomplete===true)return [];throw new Error('Nieprawidłowa odpowiedź Wikimedia Commons.');}
 if(!record(body.query)||!Array.isArray(body.query.pages)||body.query.pages.length>4)throw new Error('Nieprawidłowa odpowiedź Wikimedia Commons.');
 const result:VehicleImage[]=[];
 for(const page of body.query.pages){
  if(!record(page)||!Number.isSafeInteger(page.pageid)||(page.pageid as number)<=0||!Array.isArray(page.imageinfo))continue;
  const info=page.imageinfo[0];if(!record(info)||!['image/jpeg','image/png','image/webp'].includes(String(info.mime)))continue;
  const uri=(safeUrl(info.thumburl,'https://upload.wikimedia.org','/wikipedia/commons/')??safeUrl(info.thumburl,'https://thumb.wikimedia.org','/wikipedia/commons/')),source=safeUrl(info.descriptionurl,'https://commons.wikimedia.org','/wiki/File:');
  const meta=info.extmetadata;if(!record(meta))continue;
  const author=plain(record(meta.Artist)?meta.Artist.value:null),license=plain(record(meta.LicenseShortName)?meta.LicenseShortName.value:null,80),title=plain(page.title).replace(/^File:/,'');
  if(uri&&source&&author&&license&&title&&!result.some(image=>image.id===page.pageid))result.push({id:page.pageid as number,title,uri,page:source,author,license});
 }
 return result;
}
export async function lookupVehicleImages(vehicle:Identity,{signal}:{signal?:AbortSignal}={},fetchImpl:typeof fetch=fetch):Promise<VehicleImage[]>{
 const url=vehicleImageQuery(vehicle);
 const aborted=()=>Object.assign(new Error('Przerwano wyszukiwanie zdjęć.'),{name:'AbortError'});
 if(signal?.aborted)throw aborted();
 const controller=new AbortController();let rejectStop:(error:Error)=>void=()=>{};
 const stopped=new Promise<never>((_,reject)=>{rejectStop=reject;});
 const stop=(error:Error)=>{controller.abort();rejectStop(error);};
 const abort=()=>stop(aborted());signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(()=>stop(new Error('Przekroczono czas wyszukiwania zdjęć.')),12000);
 const request=async(requestUrl:string)=>{
  const response=await fetchImpl(requestUrl,{signal:controller.signal,headers:{accept:'application/json'},credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'});
  if(!response.ok||response.url&&new URL(response.url).origin!=='https://commons.wikimedia.org')throw new Error('Zdjęcia Wikimedia Commons są chwilowo niedostępne.');
  if(Number(response.headers.get('content-length'))>limit||!/^application\/json(?:;|$)/i.test(response.headers.get('content-type')??''))throw new Error('Nieprawidłowa odpowiedź Wikimedia Commons.');
  let raw='';const reader=response.body?.getReader?.();
  if(reader){let bytes=0;const decoder=new TextDecoder();try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>limit)throw new Error('Odpowiedź Wikimedia Commons jest za duża.');raw+=decoder.decode(chunk.value,{stream:true});}raw+=decoder.decode();}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}}
  else{raw=await response.text();if(raw.length>limit||new TextEncoder().encode(raw).byteLength>limit)throw new Error('Odpowiedź Wikimedia Commons jest za duża.');}
  return parseVehicleImages(JSON.parse(raw));
 };
 try{return await Promise.race([stopped,(async()=>{const photos=await request(url);return photos.length?photos:request(vehicleImageQuery(vehicle,false));})()]);}catch(error){if(error instanceof Error&&error.name==='AbortError')throw error;throw new Error('Nie udało się pobrać zdjęć Wikimedia Commons. Sprawdź internet lub dodaj własne zdjęcie.');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);controller.abort();}
}
