import {validCanEcu} from './can.ts';
import {parameterByPid,pidHex,validMeasurements,validScaling} from './parameters.ts';
import type {ParameterScaling} from './parameters.ts';
import {LIVE_HISTORY_LIMIT} from './live-history.ts';
import type {LiveHistorySample} from './live-history.ts';

export type LiveSessionExport = 'csv' | 'json' | 'report';
export type LiveMetric = {pid:number|'ATRV';label:string;unit:string;reported:number;missing:number;notRecorded:number;min:number|null;max:number|null;mean:number|null;latest:number|null};
const invalid=():never=>{throw new Error('Nieprawidłowe dane sesji Live Data.');};
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=200;
const time=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=253402300799999;
const reading=(v:unknown,min:number,max:number)=>v===null||typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const sameEcu=(a:LiveHistorySample['ecu'],b:LiveHistorySample['ecu'])=>a?.protocol===b?.protocol&&a?.responseId===b?.responseId;

export function buildLiveSessionReport(history:readonly LiveHistorySample[]) {
 if(!Array.isArray(history)||history.length===0||history.length>LIVE_HISTORY_LIMIT)invalid();
 const first=history[0];
 if(!first||!text(first.vehicleId)||!text(first.adapterName))invalid();
 const samples=history.map((sample,index)=>{
  if(!sample||sample.vehicleId!==first.vehicleId||sample.adapterName!==first.adapterName||!sameEcu(sample.ecu,first.ecu)
   ||sample.ecu!==undefined&&!validCanEcu(sample.ecu)||!time(sample.timestamp)||index>0&&sample.timestamp<history[index-1].timestamp
   ||sample.breakBefore!==undefined&&typeof sample.breakBefore!=='boolean')invalid();
  const p=sample.parameters;
  if(!p||!reading(p.rpm,0,16383.75)||!reading(p.coolantC,-40,215)||!reading(p.loadPercent,0,100)||!reading(p.voltageV,0,100))invalid();
  const scaling=sample.scaling===undefined?{}:sample.scaling;
  const scalingPids=[...(scaling&&Object.hasOwn(scaling,'pid4f')?[0x4F]:[]),...(scaling&&Object.hasOwn(scaling,'pid50')?[0x50]:[])];
  if(!validScaling(scaling,scalingPids))invalid();
  const observations=sample.measurements===undefined?[]:sample.measurements;
  if(!Array.isArray(observations)||observations.length>8||!validMeasurements(observations,observations.map(m=>m?.pid),scaling)
   ||observations.some(m=>m.readAt>sample.timestamp))invalid();
  if(sample.measurements!==undefined){
   for(const [key,pid] of [['rpm',12],['coolantC',5],['loadPercent',4]] as const){
    if(p[key] !== (observations.find(m=>m.pid===pid)?.value??null))invalid();
   }
  }
  const scalingCopy:ParameterScaling={};
  for(const key of ['pid4f','pid50'] as const){const bytes=scaling[key];if(bytes!==undefined)scalingCopy[key]=bytes===null?null:[...bytes];}
  return {timestamp:sample.timestamp,breakBefore:sample.breakBefore===true,
   parameters:{rpm:p.rpm,coolantC:p.coolantC,loadPercent:p.loadPercent,voltageV:p.voltageV},
   measurements:observations.map(m=>({pid:m.pid,value:m.value,readAt:m.readAt})),
   ...(sample.scaling===undefined?{}:{scaling:scalingCopy})};
 });
 const pids=[...new Set(samples.flatMap(s=>s.measurements.map(m=>m.pid)))].sort((a,b)=>a-b);
 const metrics:LiveMetric[]=[...pids,'ATRV' as const].map(pid=>{
  const values=samples.map(s=>pid==='ATRV'?s.parameters.voltageV:s.measurements.find(m=>m.pid===pid)?.value);
  const known=values.filter((v):v is number=>typeof v==='number');
  const definition=pid==='ATRV'?null:parameterByPid(pid)!;
  return {pid,label:definition?.label??'Napięcie adaptera ATRV',unit:definition?.unit??'V',reported:known.length,
   missing:values.filter(v=>v===null).length,notRecorded:values.filter(v=>v===undefined).length,
   min:known.length?Math.min(...known):null,max:known.length?Math.max(...known):null,
   mean:known.length?known.reduce((sum,v)=>sum+v,0)/known.length:null,latest:values.at(-1)??null};
 });
 const times=samples.flatMap(s=>[s.timestamp,...s.measurements.map(m=>m.readAt)]);
 const from=Math.min(...times),to=Math.max(...times);
 return {format:'vehiclesensex-live-session' as const,version:1 as const,vehicleId:first.vehicleId,adapterName:first.adapterName,
  ...(first.ecu?{ecu:{protocol:first.ecu.protocol,responseId:first.ecu.responseId}}:{}),
  bufferLimit:LIVE_HISTORY_LIMIT,bufferFull:samples.length===LIVE_HISTORY_LIMIT,
  summary:{cycles:samples.length,from,to,durationMs:to-from,segments:1+samples.slice(1).filter(s=>s.breakBefore).length,metrics},samples};
}
export function liveSessionJson(history:readonly LiveHistorySample[]):string {
 return JSON.stringify(buildLiveSessionReport(history),null,2);
}
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const number=(v:number|null)=>v===null?'—':v.toLocaleString('pl-PL',{maximumFractionDigits:3});
export function liveSessionReportHtml(history:readonly LiveHistorySample[],vehicleLabel='Pojazd'):string {
 const r=buildLiveSessionReport(history),s=r.summary;
 const rows=s.metrics.map(m=>`<tr><td>${m.pid==='ATRV'?'ATRV':pidHex(m.pid)} · ${esc(m.label)} (${esc(m.unit)})</td><td>${m.reported}</td><td>${m.missing}</td><td>${m.notRecorded}</td><td>${number(m.min)}</td><td>${number(m.max)}</td><td>${number(m.mean)}</td><td>${number(m.latest)}</td></tr>`).join('');
 return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>VehicleSenseX · sesja Live Data</title><style>body{font:13px Arial,sans-serif;max-width:1000px;margin:24px auto;padding:16px;color:#202420}table{width:100%;border-collapse:collapse;font-size:11px}td,th{padding:7px 4px;text-align:left;border-bottom:1px solid #ddd}p{line-height:1.6}tr{break-inside:avoid}thead{display:table-header-group}</style></head><body><h1>VehicleSenseX · sesja Live Data</h1><h2>${esc(vehicleLabel)}</h2><p>${esc(r.adapterName)} · ${r.ecu?`CAN ${esc(r.ecu.responseId)}, protokół ${r.ecu.protocol}`:'adres ECU niepotwierdzony'}</p><p>${new Date(s.from).toISOString()} — ${new Date(s.to).toISOString()} · ${s.cycles} cykli · ${s.segments} odcinki sesji · ${number(s.durationMs/1000)} s czasu kalendarzowego, w tym przerwy.</p><p>Bufor obejmuje maksymalnie ${r.bufferLimit} ostatnich cykli i nie jest automatycznie zapisywany w garażu.${r.bufferFull?' Bufor jest pełny; wcześniejsze cykle mogą być niedostępne.':''}</p><table><thead><tr><th>Parametr</th><th>Pomiary</th><th>Brak odpowiedzi</th><th>Brak zapisanej próbki</th><th>Min.</th><th>Maks.</th><th>Średnia</th><th>Ostatni cykl</th></tr></thead><tbody>${rows}</tbody></table><p>Średnia jest arytmetyczna z dostępnych pomiarów, bez ważenia czasem. Parametry są odczytywane kolejno. Zmiana wyboru PID lub przerwa nie oznacza wartości zerowej; — oznacza wartość nieznaną. Ostatni cykl nie przenosi wcześniejszych wartości.</p><p>ATRV jest napięciem adaptera, nie pomiarem stanu akumulatora; PID 42, jeśli zebrany, jest osobnym napięciem zgłoszonym przez ECU. Odczyty mogą być wartościami zastępczymi i nie potwierdzają sprawności pojazdu.</p><p>Pełne próbki, czasy i przerwy są dostępne w JSON/CSV. Sesja nie zawiera odczytu kodów i nie zastępuje kopii pełnego raportu przed kasowaniem DTC. Nazwa adaptera i pojazdu mogą zawierać dane identyfikujące; sprawdź je przed udostępnieniem. Osobne pola VIN, rejestracji i GPS są pomijane.</p></body></html>`;
}
