import {ValidationError} from './validation.ts';
import {parseVehicleSpec,validVehicleSpec,validAssets} from './media.ts';
import type {VehicleSpec,Asset} from './media.ts';
import {emptyExtensions,validateExtensions,expenseCategories} from './records.ts';
import type {Extensions,ExpenseEntry,ExpenseCategory} from './records.ts';
import {validVinSource} from './vin.ts';
import type {VinSource} from './vin.ts';
import {validDecodedSource,retainDecodedSource} from './vin-decoder.ts';
import type {DecodedVehicleSource} from './vin-decoder.ts';
export {ValidationError} from './validation.ts';
export type Vehicle = { id: string; make: string; model: string; year: number; engine: string; mileage: number; plate: string; vin: string; spec?:VehicleSpec;photos?:Asset[];vinSource?:VinSource;decodedSource?:DecodedVehicleSource };
export type FuelEntry = { id: string; vehicleId: string; date: string; mileage: number; volumeMl: number; priceCents: number; costCents: number; full: boolean };
export type ServiceEntry = { id: string; vehicleId: string; date: string; mileage: number; title: string; costCents: number; note: string;attachments?:Asset[] };
export type AppData = Extensions & { version: 3; activeVehicleId: string | null; vehicles: Vehicle[]; fuel: FuelEntry[]; service: ServiceEntry[] };
export type VehicleInput = { make: string; model: string; year: string; engine: string; mileage: string; plate: string; vin: string } & Partial<Record<keyof VehicleSpec,string>>;
export type FuelInput = { vehicleId: string; date: string; mileage: string; liters: string; price: string; full: boolean };
export type ServiceInput = { vehicleId: string; date: string; mileage: string; title: string; cost: string; note: string };
export type ExpenseInput={vehicleId:string;date:string;category:ExpenseCategory;title:string;cost:string;note:string};

export class StorageFormatError extends Error { constructor() { super('Nie można odczytać zapisanych danych. Nie zostały usunięte ani nadpisane.'); this.name = 'StorageFormatError'; } }
export const emptyData = (): AppData => ({ version: 3, activeVehicleId: null, vehicles: [], fuel: [], service: [], ...emptyExtensions() });
export function localDay(now = new Date()): string { return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }
const integer = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
const text = (value: unknown, max = 100): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export function validDate(value: string): boolean {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const parsed = new Date(`${value}T12:00:00Z`);
 return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
}
function dateInput(value: string, today: string) {
 if (!validDate(value) || value > today || value < '1900-01-01') throw new ValidationError('Wpisz prawidłową datę, nie późniejszą niż dzisiaj (RRRR-MM-DD).');
 return value;
}
function required(value: string, label: string, max = 100) {
 const clean = value.trim(); if (!text(clean,max)) throw new ValidationError(`${label}: wpisz od 1 do ${max} znaków.`); return clean;
}
function whole(value: string, label: string, min = 0, max = 5000000) {
 if (!/^\d+$/.test(value.trim()) || !integer(Number(value),min,max)) throw new ValidationError(`${label}: wpisz liczbę całkowitą od ${min} do ${max}.`);
 return Number(value);
}
function decimal(value: string, label: string, digits: number, min: number, max: number) {
 const clean = value.trim().replace(',','.');
 if (!new RegExp(`^\\d+(?:\\.\\d{1,${digits}})?$`).test(clean)) throw new ValidationError(`${label}: wpisz poprawną liczbę z maksymalnie ${digits} miejscami po przecinku.`);
 const [wholePart,fraction=''] = clean.split('.'); const units = Number(wholePart)*10**digits + Number(fraction.padEnd(digits,'0'));
 if (!integer(units,min,max)) throw new ValidationError(`${label}: wartość poza dopuszczalnym zakresem.`);
 return units;
}
function findVehicle(state: AppData, id: string) {
 const vehicle = state.vehicles.find(v=>v.id===id); if (!vehicle) throw new ValidationError('Najpierw wybierz samochód.'); return vehicle;
}
function withMileage(state: AppData, vehicleId: string, mileage: number): Vehicle[] {
 return state.vehicles.map(v=>v.id===vehicleId ? {...v,mileage:Math.max(v.mileage,mileage)} : v);
}
function unusedId(state: AppData,id: string) {
 if (!text(id) || [...state.vehicles,...state.fuel,...state.service,...state.trips,...state.diagnostics,...state.reminders,...state.comparisons,...state.expenses].some(r=>r.id===id)) throw new ValidationError('Identyfikator wpisu już istnieje. Spróbuj ponownie.');
}
export function addVehicle(state: AppData, input: VehicleInput, id: string, today: string): AppData {
 unusedId(state,id);
 const vin=input.vin.trim().toUpperCase(); if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) throw new ValidationError('VIN musi mieć 17 znaków i nie może zawierać I, O ani Q.');
 const vehicle: Vehicle={id,make:required(input.make,'Marka',60),model:required(input.model,'Model',80),year:whole(input.year,'Rok',1900,Number(today.slice(0,4))+1),engine:required(input.engine,'Silnik',100),mileage:whole(input.mileage,'Przebieg'),plate:required(input.plate,'Rejestracja',20).toUpperCase(),vin,spec:parseVehicleSpec(input)};
 return {...state,vehicles:[...state.vehicles,vehicle],activeVehicleId:state.activeVehicleId??id};
}
export function addFuel(state: AppData, input: FuelInput, id: string, today: string): AppData {
 unusedId(state,id); const vehicle=findVehicle(state,input.vehicleId); const date=dateInput(input.date,today);
 const mileage=whole(input.mileage,'Przebieg'); const last=state.fuel.filter(r=>r.vehicleId===vehicle.id).sort((a,b)=>b.date.localeCompare(a.date)||b.mileage-a.mileage)[0];
 if (mileage<vehicle.mileage || (last && date<last.date)) throw new ValidationError(`Dodaj tankowanie po ostatnim wpisie i z przebiegiem co najmniej ${vehicle.mileage} km.`);
 const volumeMl=decimal(input.liters,'Ilość paliwa',3,1,250000); const priceCents=decimal(input.price,'Cena za litr',2,1,10000);
 const entry: FuelEntry={id,vehicleId:vehicle.id,date,mileage,volumeMl,priceCents,costCents:Math.round(volumeMl*priceCents/1000),full:input.full};
 return {...state,fuel:[...state.fuel,entry],vehicles:withMileage(state,vehicle.id,mileage)};
}
export function addService(state: AppData, input: ServiceInput, id: string, today: string): AppData {
 unusedId(state,id);findVehicle(state,input.vehicleId);
 const mileage=whole(input.mileage,'Przebieg');const date=dateInput(input.date,today);
 if (input.note.length>1000) throw new ValidationError('Notatka może mieć najwyżej 1000 znaków.');
 const entry: ServiceEntry={id,vehicleId:input.vehicleId,date,mileage,title:required(input.title,'Nazwa serwisu',100),costCents:decimal(input.cost,'Koszt',2,0,100000000),note:input.note.trim()};
 return {...state,service:[...state.service,entry],vehicles:withMileage(state,input.vehicleId,mileage)};
}
export function addExpense(state:AppData,input:ExpenseInput,id:string,today:string):AppData{
 unusedId(state,id);findVehicle(state,input.vehicleId);const date=dateInput(input.date,today);
 if(!expenseCategories.includes(input.category)||typeof input.note!=='string'||input.note.length>1000)throw new ValidationError('Wybierz kategorię; notatka może mieć najwyżej 1000 znaków.');
 const entry:ExpenseEntry={id,vehicleId:input.vehicleId,date,category:input.category,title:required(input.title,'Nazwa wydatku',100),costCents:decimal(input.cost,'Kwota',2,1,100000000),note:input.note.trim()};
 return {...state,expenses:[...state.expenses,entry]};
}
export function vehicleSummary(state: AppData, vehicleId: string, month: string) {
 const fuel=state.fuel.filter(r=>r.vehicleId===vehicleId);
 const service=state.service.filter(r=>r.vehicleId===vehicleId);
 let anchor: number|null=null, accumulatedMl=0, measuredMl=0, measuredDistance=0;
 for (const entry of [...fuel].sort((a,b)=>a.mileage-b.mileage||a.date.localeCompare(b.date))) {
  if (anchor!==null) accumulatedMl+=entry.volumeMl;
  if (entry.full) {
   if (anchor!==null && entry.mileage>anchor) { measuredMl+=accumulatedMl; measuredDistance+=entry.mileage-anchor; }
   anchor=entry.mileage; accumulatedMl=0;
  }
 }
 const fuelCents=fuel.filter(r=>r.date.startsWith(month+'-')).reduce((sum,r)=>sum+r.costCents,0);
 const serviceCents=service.filter(r=>r.date.startsWith(month+'-')).reduce((sum,r)=>sum+r.costCents,0);
 const otherCents=state.expenses.filter(r=>r.vehicleId===vehicleId&&r.date.startsWith(month+'-')).reduce((sum,r)=>sum+r.costCents,0);
 return {fuelCents,serviceCents,otherCents,totalCents:fuelCents+serviceCents+otherCents,consumption:measuredDistance?measuredMl/1000/measuredDistance*100:null,measuredDistance,fuelCount:fuel.length,serviceCount:service.length};
}

export function parseStoredData(raw: string|null): AppData {
 if (raw===null) return emptyData();
 try {
  const parsed=JSON.parse(raw);
  const data: AppData=parsed?.version===1?{...parsed,version:3,...emptyExtensions()}:parsed?.version===2?{...parsed,version:3,expenses:parsed.expenses===undefined?[]:parsed.expenses}:parsed;
  if (!data || data.version!==3 || !Array.isArray(data.vehicles) || !Array.isArray(data.fuel) || !Array.isArray(data.service)) throw new StorageFormatError();
  const vehicleOwners=new Set<string>(data.vehicles.map(v=>v?.id));
  if(!validateExtensions(data,vehicleOwners))throw new StorageFormatError();
  const ids=new Set<string>();
  for(const record of [...data.vehicles,...data.fuel,...data.service,...data.trips,...data.diagnostics,...data.reminders,...data.comparisons,...data.expenses]) { if (!record||!text(record.id)||ids.has(record.id)) throw new StorageFormatError();ids.add(record.id); }
  for(const v of data.vehicles) if (!text(v.make,60)||!text(v.model,80)||!text(v.engine,100)||!text(v.plate,20)||typeof v.vin!=='string'||(v.vin!==''&&!/^[A-HJ-NPR-Z0-9]{17}$/.test(v.vin))||!integer(v.year,1900,9999)||!integer(v.mileage,0,5000000)) throw new StorageFormatError();
  for(const v of data.vehicles)if(v.vinSource!==undefined&&(!validVinSource(v.vinSource)||v.vinSource.vin!==v.vin))throw new StorageFormatError();
  for(const v of data.vehicles)if(v.decodedSource!==undefined){
   if(!validDecodedSource(v.decodedSource))throw new StorageFormatError();
   const retained=retainDecodedSource(v,v.decodedSource);
   if(!retained||Object.keys(retained.fields).length!==Object.keys(v.decodedSource.fields).length)throw new StorageFormatError();
  }
  const vehicleIds=new Set(data.vehicles.map(v=>v.id));
  if ((data.vehicles.length===0&&data.activeVehicleId!==null)||(data.vehicles.length>0&&!vehicleIds.has(data.activeVehicleId??''))) throw new StorageFormatError();
  for(const e of [...data.fuel,...data.service]) if (!vehicleIds.has(e.vehicleId)||typeof e.date!=='string'||!validDate(e.date)||!integer(e.mileage,0,5000000)||!integer(e.costCents,0,100000000)||e.mileage>findVehicle(data,e.vehicleId).mileage) throw new StorageFormatError();
  for(const f of data.fuel) if (!integer(f.volumeMl,1,250000)||!integer(f.priceCents,1,10000)||f.costCents!==Math.round(f.volumeMl*f.priceCents/1000)||typeof f.full!=='boolean') throw new StorageFormatError();
  for(const vehicle of data.vehicles){
   const history=data.fuel.filter(f=>f.vehicleId===vehicle.id).sort((a,b)=>a.date.localeCompare(b.date));
   for(let i=1;i<history.length;i++)if(history[i].mileage<history[i-1].mileage)throw new StorageFormatError();
  }
  for(const s of data.service) if (!text(s.title,100)||typeof s.note!=='string'||s.note.length>1000) throw new StorageFormatError();
  for(const v of data.vehicles)if(v.spec!==undefined&&!validVehicleSpec(v.spec)||v.photos!==undefined&&!validAssets(v.photos,true))throw new StorageFormatError();
  for(const v of data.service)if(v.attachments!==undefined&&!validAssets(v.attachments))throw new StorageFormatError();
  return data;
 } catch { throw new StorageFormatError(); }
}
