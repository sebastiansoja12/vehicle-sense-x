import {ValidationError,addVehicle,addFuel,addService,addExpense,validDate,parseStoredData} from './domain.ts';
import type {AppData,VehicleInput,FuelInput,ServiceInput,ExpenseInput} from './domain.ts';
import {retainDecodedSource} from './vin-decoder.ts';
import type {Reminder,Comparison} from './records.ts';
import {validOfferUrl} from './records.ts';
import {estimateTripFuelCost} from './expenses.ts';
import {analyzeTrip,validateTripRecord} from './trips.ts';
import type {TripRecord} from './trips.ts';
import {validateDiagnosticSnapshot} from './obd/types.ts';
import type {DiagnosticSnapshot} from './obd/types.ts';
const all=(state:AppData)=>[...state.vehicles,...state.fuel,...state.service,...state.trips,...state.diagnostics,...state.reminders,...state.comparisons,...state.expenses];
function check(state:AppData,vehicleId:string,id:string){if(!state.vehicles.some(v=>v.id===vehicleId))throw new ValidationError('Wybierz istniejący samochód.');if(!id||all(state).some(r=>r.id===id))throw new ValidationError('Wpis o tym identyfikatorze już istnieje.');}
const target=(v:string):number|null=>{if(v.trim()==='')return null;if(!/^\d+$/.test(v.trim())||!Number.isSafeInteger(Number(v))||Number(v)>5000000)throw new ValidationError('Wpisz prawidłowy przebieg.');return Number(v);};
export function addReminder(state:AppData,input:{vehicleId:string;title:string;dueDate:string;dueMileage:string},id:string,today:string):AppData{
 check(state,input.vehicleId,id);const title=input.title.trim(),dueDate=input.dueDate.trim()||null,dueMileage=target(input.dueMileage);
 if(!title||title.length>100||(dueDate!==null&&(!validDate(dueDate)||dueDate<'1900-01-01'))||(dueDate===null&&dueMileage===null)||!validDate(today))throw new ValidationError('Podaj nazwę i co najmniej jeden poprawny termin: datę lub przebieg.');
 const reminder:Reminder={id,vehicleId:input.vehicleId,title,dueDate,dueMileage,completed:false,notificationId:null};return {...state,reminders:[...state.reminders,reminder]};
}
export function completeReminder(state:AppData,id:string):AppData{if(!state.reminders.some(r=>r.id===id))throw new ValidationError('Nie znaleziono przypomnienia.');return {...state,reminders:state.reminders.map(r=>r.id===id?{...r,completed:true}:r)};}
export function dueReminders(state:AppData,vehicleId:string,today:string){const car=state.vehicles.find(v=>v.id===vehicleId);return state.reminders.filter(r=>r.vehicleId===vehicleId&&!r.completed).map(r=>({...r,due:(r.dueDate!==null&&r.dueDate<=today)||(r.dueMileage!==null&&r.dueMileage<=(car?.mileage??-1))})).sort((a,b)=>Number(b.due)-Number(a.due)||(a.dueDate??'9999').localeCompare(b.dueDate??'9999'));}
export function addComparison(state:AppData,input:{vehicleId:string;price:string;url:string;date:string;note:string},id:string,today:string):AppData{
 check(state,input.vehicleId,id);if(!/^\d+(?:[,.]\d{1,2})?$/.test(input.price.trim()))throw new ValidationError('Wpisz cenę oferty w złotych.');
 const priceCents=Math.round(Number(input.price.replace(',','.'))*100);
 if(!Number.isSafeInteger(priceCents)||priceCents<=0||priceCents>10000000000||!validOfferUrl(input.url)||!validDate(input.date)||input.date>today||input.note.length>500)throw new ValidationError('Sprawdź cenę, adres źródła i datę oferty.');
 if(state.comparisons.some(c=>c.vehicleId===input.vehicleId&&c.url===input.url.trim()))throw new ValidationError('Ta oferta jest już zapisana.');
 const record:Comparison={id,vehicleId:input.vehicleId,priceCents,url:input.url.trim(),date:input.date,note:input.note.trim()};return {...state,comparisons:[...state.comparisons,record]};
}
export function marketEstimate(state:AppData,vehicleId:string,today:string){const prices=state.comparisons.filter(c=>c.vehicleId===vehicleId&&c.date<=today&&(Date.parse(today)-Date.parse(c.date))/86400000<=90).map(c=>c.priceCents).sort((a,b)=>a-b);if(prices.length<2)return null;const mid=Math.floor(prices.length/2);return{lowCents:prices[0],highCents:prices.at(-1)!,medianCents:prices.length%2?prices[mid]:Math.round((prices[mid-1]+prices[mid])/2),count:prices.length,source:'manual-comparisons' as const};}
export function addTrip(state:AppData,trip:TripRecord):AppData{check(state,trip.vehicleId,trip.id);if(!validateTripRecord(trip))throw new ValidationError('Przejazd zawiera nieprawidłowe dane.');const record=trip.fuelCostCents===null?{...trip,fuelCostCents:estimateTripFuelCost(state,trip.vehicleId,analyzeTrip(trip).distanceM)}:trip;return {...state,trips:[...state.trips,record]};}
export function addDiagnostic(state:AppData,snapshot:DiagnosticSnapshot):AppData{check(state,snapshot.vehicleId,snapshot.id);if(!validateDiagnosticSnapshot(snapshot))throw new ValidationError('Nieprawidłowy odczyt diagnostyczny.');return {...state,diagnostics:[...state.diagnostics,snapshot]};}
export type RecordKind='vehicle'|'fuel'|'service'|'trip'|'diagnostic'|'reminder'|'comparison'|'expense';
export function removeRecord(state:AppData,kind:RecordKind,id:string):AppData{
 if(kind==='vehicle'){
  const vehicles=state.vehicles.filter(v=>v.id!==id);return {...state,vehicles,activeVehicleId:state.activeVehicleId===id?(vehicles[0]?.id??null):state.activeVehicleId,fuel:state.fuel.filter(v=>v.vehicleId!==id),service:state.service.filter(v=>v.vehicleId!==id),trips:state.trips.filter(v=>v.vehicleId!==id),diagnostics:state.diagnostics.filter(v=>v.vehicleId!==id),reminders:state.reminders.filter(v=>v.vehicleId!==id),comparisons:state.comparisons.filter(v=>v.vehicleId!==id),expenses:state.expenses.filter(v=>v.vehicleId!==id)};
 }
 const key=({fuel:'fuel',service:'service',trip:'trips',diagnostic:'diagnostics',reminder:'reminders',comparison:'comparisons',expense:'expenses'} as const)[kind];return {...state,[key]:state[key].filter(r=>r.id!==id)};
}
export function editVehicle(state:AppData,id:string,input:VehicleInput,today:string):AppData{
 const original=state.vehicles.find(v=>v.id===id);if(!original)throw new ValidationError('Nie znaleziono samochodu.');
 const record=addVehicle({...state,vehicles:state.vehicles.filter(v=>v.id!==id)},input,id,today).vehicles.at(-1)!;
 const observed=Math.max(0,...state.fuel.filter(r=>r.vehicleId===id).map(r=>r.mileage),...state.service.filter(r=>r.vehicleId===id).map(r=>r.mileage));if(record.mileage<observed)throw new ValidationError('Przebieg jest niższy niż zapisany we wpisach.');
 return {...state,vehicles:state.vehicles.map(v=>v.id===id?{...record,photos:original.photos,vinSource:record.vin===original.vin?original.vinSource:undefined,decodedSource:retainDecodedSource(record,original.decodedSource)}:v)};
}
export function editFuel(state:AppData,id:string,input:FuelInput,today:string):AppData{
 const original=state.fuel.find(r=>r.id===id);if(!original||original.vehicleId!==input.vehicleId)throw new ValidationError('Nie znaleziono tankowania dla tego auta.');
 const trimmed={...state,vehicles:state.vehicles.map(v=>v.id===input.vehicleId?{...v,mileage:0}:v),fuel:state.fuel.filter(r=>r.vehicleId!==input.vehicleId||r.id!==id&&r.date<=input.date&&r.mileage<=Number(input.mileage))};
 const entry=addFuel(trimmed,input,id,today).fuel.at(-1)!;const next={...state,fuel:state.fuel.map(r=>r.id===id?entry:r),vehicles:state.vehicles.map(v=>v.id===input.vehicleId?{...v,mileage:Math.max(v.mileage,entry.mileage)}:v)};
 try{return parseStoredData(JSON.stringify(next));}catch{throw new ValidationError('Data lub przebieg nie pasują do historii tankowań.');}
}
export function editService(state:AppData,id:string,input:ServiceInput,today:string):AppData{
 const original=state.service.find(r=>r.id===id);if(!original||original.vehicleId!==input.vehicleId)throw new ValidationError('Nie znaleziono wpisu serwisowego.');
 const updated=addService({...state,service:state.service.filter(r=>r.id!==id)},input,id,today);return {...updated,service:state.service.map(r=>r.id===id?{...updated.service.at(-1)!,attachments:original.attachments,...(original.oilObservation?{oilObservation:original.oilObservation}:{}),...(original.maintenanceComponent?{maintenanceComponent:original.maintenanceComponent}:{})}:r)};
}
export function editExpense(state:AppData,id:string,input:ExpenseInput,today:string):AppData{
 const original=state.expenses.find(r=>r.id===id);if(!original||original.vehicleId!==input.vehicleId)throw new ValidationError('Nie znaleziono wydatku dla tego samochodu.');
 const updated=addExpense({...state,expenses:state.expenses.filter(r=>r.id!==id)},input,id,today).expenses.at(-1)!;
 return {...state,expenses:state.expenses.map(r=>r.id===id?updated:r)};
}
