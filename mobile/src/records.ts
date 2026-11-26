import {validateTripRecord} from './trips.ts';
import type {TripRecord} from './trips.ts';
import {validateDiagnosticSnapshot} from './obd/types.ts';
import type {DiagnosticSnapshot} from './obd/types.ts';
export type Reminder={id:string;vehicleId:string;title:string;dueDate:string|null;dueMileage:number|null;completed:boolean;notificationId:string|null};
export type Comparison={id:string;vehicleId:string;priceCents:number;url:string;date:string;note:string};
export type Extensions={trips:TripRecord[];diagnostics:DiagnosticSnapshot[];reminders:Reminder[];comparisons:Comparison[]};
export const emptyExtensions=():Extensions=>({trips:[],diagnostics:[],reminders:[],comparisons:[]});
const text=(v:unknown,max=200):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const whole=(v:unknown,min=0,max=5000000)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const day=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
export function validOfferUrl(value:unknown):value is string{if(!text(value,1000))return false;try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password;}catch{return false;}}
export function validateExtensions(data:Extensions,owners:Set<string>):boolean{
 if(![data.trips,data.diagnostics,data.reminders,data.comparisons].every(v=>Array.isArray(v)&&v.length<=10000))return false;
 for(const row of [...data.trips,...data.diagnostics,...data.reminders,...data.comparisons])if(!row||!text(row.id)||!owners.has(row.vehicleId))return false;
 if(!data.trips.every(validateTripRecord)||!data.diagnostics.every(validateDiagnosticSnapshot))return false;
 if(!data.reminders.every(r=>text(r.title,100)&&(r.dueDate===null||day(r.dueDate))&&(r.dueMileage===null||whole(r.dueMileage))&&(r.dueDate!==null||r.dueMileage!==null)&&typeof r.completed==='boolean'&&(r.notificationId===null||text(r.notificationId))))return false;
 return data.comparisons.every(c=>whole(c.priceCents,1,10000000000)&&validOfferUrl(c.url)&&day(c.date)&&typeof c.note==='string'&&c.note.length<=500);
}
