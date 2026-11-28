import type {AppData} from './domain.ts';
import {validAsset} from './media.ts';
import {validateDiagnosticSnapshot} from './obd/types.ts';
import type {DiagnosticSnapshot,LiveParameters} from './obd/types.ts';

export const cockpitMetrics=[
 {key:'rpm',label:'Obroty silnika',unit:'rpm',min:0,max:8000,digits:0,color:'#dc755c'},
 {key:'coolantC',label:'Płyn chłodzący',unit:'°C',min:-40,max:150,digits:0,color:'#63b6c6'},
 {key:'loadPercent',label:'Obciążenie silnika',unit:'%',min:0,max:100,digits:0,color:'#d6b77e'},
 {key:'voltageV',label:'Napięcie adaptera',unit:'V',min:0,max:20,digits:1,color:'#9db89a'},
] as const;
type Inputs={saved?:DiagnosticSnapshot[];session?:DiagnosticSnapshot|null;live?:LiveParameters|null;connected?:boolean;streaming?:boolean};
const emptyParameters=():DiagnosticSnapshot['parameters']=>({rpm:null,coolantC:null,loadPercent:null,voltageV:null});

export function buildCockpit(vehicleId:string,input:Inputs,now:number){
 const valid=(value:unknown):value is DiagnosticSnapshot=>validateDiagnosticSnapshot(value)&&value.vehicleId===vehicleId&&value.timestamp<=now;
 const session=valid(input.session)?input.session:null;
 const full=session&&input.connected?session:[...(session?[session]:[]),...(input.saved??[]).filter(valid)].sort((a,b)=>b.timestamp-a.timestamp)[0]??null;
 const live=validatedCockpitLive(input.live,session,now);
 const scopedLive=live!==null;
 const sample=live??full;
 const fresh=!!sample&&now-sample.timestamp<=15000;
 const source=!sample?'none':scopedLive&&input.connected&&input.streaming&&fresh?'live':scopedLive?'session':full?.source==='import'?'import':full===session?'session':'saved';
 const faultReport=scopedLive?session:full;
 return {source:source as 'none'|'live'|'session'|'saved'|'import',timestamp:sample?.timestamp??null,stale:!fresh,
  parameters:sample?{...sample.parameters}:emptyParameters(),
  report:faultReport,
  scope:sample?.ecu?`CAN ${sample.ecu.responseId} · protokół ${sample.ecu.protocol}`:'Zakres sterownika niepodany',
  faults:faultReport?{count:faultReport.codes.length,codes:faultReport.codes.map(code=>({...code})),partial:faultReport.readStatuses.length<3,timestamp:faultReport.timestamp}:null};
}

export type CarDisplayPayload={vehicleId:string;vehicleLabel:string;subtitle:string;photoBase64:string|null;recordedAt:number|null;rows:{title:string;detail:string}[]};
export function buildCarDisplayPayload(data:AppData,now:number):CarDisplayPayload|null{
 const car=data.vehicles.find(vehicle=>vehicle.id===data.activeVehicleId);
 if(!car)return null;
 const view=buildCockpit(car.id,{saved:data.diagnostics},now);
 const photo=car.photos?.find(asset=>asset.mime!=='application/pdf'&&validAsset(asset));
 const rows:CarDisplayPayload['rows']=cockpitMetrics.map(metric=>({title:metric.label,detail:view.parameters[metric.key]===null?'Brak odczytu':`${new Intl.NumberFormat('pl-PL',{maximumFractionDigits:metric.digits}).format(view.parameters[metric.key]!)} ${metric.unit}`}));
 rows.push({title:'Kody w odczytanych statusach',detail:view.faults?`${view.faults.count}${view.faults.partial?' · odczyt częściowy':''}`:'Brak odczytu'});
 rows.push({title:'Kody usterek',detail:view.faults?(view.faults.codes.slice(0,3).map(code=>`${code.code} · ${{stored:'zapisany',pending:'oczekujący',permanent:'trwały'}[code.status]}`).join(', ')||'Brak kodów w odczytanych statusach'):'Brak odczytu'});
 rows.push({title:'Zakres',detail:view.scope});
 return {vehicleId:car.id,vehicleLabel:Array.from(`${car.make} ${car.model}`).slice(0,160).join(''),subtitle:`${car.year} · ${view.source==='none'?'Brak odczytu':view.source==='import'?'Import raportu':'Zapisana diagnostyka'} · nie Live`,photoBase64:photo?.base64??null,recordedAt:view.timestamp,rows};
}


function validatedCockpitLive(live:LiveParameters|null|undefined,session:DiagnosticSnapshot|null,now:number):LiveParameters|null{
 if(!live||session?.source!=='obd')return null;
 // Reuse snapshot measurement bounds without inventing DTC results for Live samples.
 if(!validateDiagnosticSnapshot({id:'live-display',source:'obd',vehicleId:live.vehicleId,timestamp:live.timestamp,adapterName:live.adapterName,parameters:live.parameters,ecu:live.ecu,codes:[],readStatuses:['stored'],supportedPids:[]}))return null;
 return live.vehicleId===session.vehicleId&&live.adapterName===session.adapterName&&live.ecu?.responseId===session.ecu?.responseId&&live.ecu?.protocol===session.ecu?.protocol&&live.timestamp>=session.timestamp&&live.timestamp<=now?live:null;
}
export function appendCockpitSample(samples:LiveParameters[],next:LiveParameters|null,session:DiagnosticSnapshot|null,now:number):LiveParameters[]{
 if(!session||!validateDiagnosticSnapshot(session)||session.source!=='obd'||session.timestamp>now)return [];
 const scoped=samples.filter(sample=>validatedCockpitLive(sample,session,now)&&now-sample.timestamp<=300000);
 const valid=validatedCockpitLive(next,session,now);
 if(!valid||now-valid.timestamp>15000||valid.timestamp<=(scoped.at(-1)?.timestamp??-1))return scoped;
 return [...scoped,{vehicleId:valid.vehicleId,timestamp:valid.timestamp,adapterName:valid.adapterName,parameters:{...valid.parameters},...(valid.ecu?{ecu:{...valid.ecu}}:{})}].slice(-60);
}
export function buildCockpitTrend(samples:LiveParameters[],key:typeof cockpitMetrics[number]['key']){
 const values=samples.map(sample=>sample.parameters[key]).filter((value):value is number=>value!==null&&Number.isFinite(value));
 const segments:{x:number;y:number}[][]=[];
 if(!values.length)return {segments,count:0,min:null,max:null,start:null,end:null};
 const min=Math.min(...values),max=Math.max(...values),start=samples[0].timestamp,end=samples.at(-1)!.timestamp;
 let segment:typeof segments[number]|null=null,previous:number|null=null;
 for(const sample of samples){
  const value=sample.parameters[key];
  if(value===null||!Number.isFinite(value)){segment=null;previous=null;continue;}
  if(!segment||previous===null||sample.timestamp-previous>15000){segment=[];segments.push(segment);}
  segment.push({x:end===start?150:4+(sample.timestamp-start)/(end-start)*292,y:max===min?40:76-(value-min)/(max-min)*72});
  previous=sample.timestamp;
 }
 return {segments,count:values.length,min,max,start,end};
}
