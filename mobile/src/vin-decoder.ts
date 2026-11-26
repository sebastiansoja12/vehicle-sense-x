import {ValidationError} from './validation.ts';
import type {Vehicle,AppData} from './domain.ts';

export const decodedFieldLabels={make:'Marka',model:'Model',year:'Rok modelowy',displacementCc:'Pojemność (cm³)',transmission:'Skrzynia biegów',drive:'Napęd'};
export type DecodedField=keyof typeof decodedFieldLabels;
export type DecodedFields=Partial<Record<DecodedField,string>>;
export type DecodedVehicleSource={provider:'nhtsa-vpic';vin:string;timestamp:number;fields:DecodedFields};
const fieldNames=Object.keys(decodedFieldLabels) as DecodedField[];
const isObject=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const validVin=(value:unknown):value is string=>typeof value==='string'&&/^[A-HJ-NPR-Z0-9]{17}$/.test(value)&&!/^0{17}$/.test(value);
export function normalizeDecodeVin(value:string):string{
 const vin=typeof value==='string'?value.trim().toUpperCase():'';
 if(!validVin(vin))throw new ValidationError('Podaj pełny, 17-znakowy VIN bez liter I, O i Q.');
 return vin;
}
function validField(key:string,value:unknown):value is string{
 if(typeof value!=='string'||!value||value!==value.trim()||/[\u0000-\u001f\u007f]/.test(value))return false;
 if(key==='year')return /^\d{4}$/.test(value)&&Number(value)>=1980;
 if(key==='displacementCc')return /^[1-9]\d{0,4}$/.test(value)&&Number(value)<=30000;
 const maximum=({make:60,model:80,transmission:80,drive:60} as Record<string,number>)[key];
 return !!maximum&&value.length<=maximum;
}
export function validDecodedSource(value:unknown):value is DecodedVehicleSource{
 if(!isObject(value)||value.provider!=='nhtsa-vpic'||!validVin(value.vin)||typeof value.timestamp!=='number'||!Number.isSafeInteger(value.timestamp)||value.timestamp<0||value.timestamp>253402300799999||!isObject(value.fields))return false;
 const entries=Object.entries(value.fields);
 return entries.length>0&&entries.length<=fieldNames.length&&entries.every(([key,field])=>fieldNames.includes(key as DecodedField)&&validField(key,field));
}
export function decodeVinResponse(body:unknown,requestedVin:string,timestamp=Date.now()):DecodedVehicleSource{
 const vin=normalizeDecodeVin(requestedVin);
 if(!isObject(body)||body.Count!==1||!Array.isArray(body.Results)||body.Results.length!==1||!isObject(body.Results[0]))throw new ValidationError('NHTSA nie zwróciła pojedynczej odpowiedzi dla tego VIN.');
 const row=body.Results[0];
 if(typeof row.VIN!=='string'||normalizeDecodeVin(row.VIN)!==vin)throw new ValidationError('VIN odpowiedzi NHTSA różni się od zapytania.');
 if(typeof row.ErrorCode!=='string'||row.ErrorCode.trim()!=='0')throw new ValidationError('NHTSA zgłosiła błąd lub niepełne dekodowanie. Sprawdź VIN i uzupełnij auto ręcznie.');
 const fields:DecodedFields={};
 const mapping:Record<DecodedField,string>={make:'Make',model:'Model',year:'ModelYear',displacementCc:'DisplacementCC',transmission:'TransmissionStyle',drive:'DriveType'};
 for(const key of fieldNames){
  const raw=row[mapping[key]];
  if(raw===null||raw===undefined||raw==='')continue;
  if(typeof raw!=='string')throw new ValidationError('Nieprawidłowy format danych NHTSA.');
  let value=raw.trim();
  if(!value||/^(?:not applicable|not available|n\/a)$/i.test(value))continue;
  if(key==='displacementCc'){
   if(!/^\d+(?:\.\d+)?$/.test(value))throw new ValidationError('Nieprawidłowa pojemność w odpowiedzi NHTSA.');
   const cc=Number(value);if(cc===0)continue;
   if(!Number.isFinite(cc)||cc>30000)throw new ValidationError('Pojemność NHTSA wykracza poza obsługiwany zakres.');
   if(!Number.isSafeInteger(cc))continue;
   value=String(cc);
  }
  if(!validField(key,value)||key==='year'&&Number(value)>new Date(timestamp).getUTCFullYear()+1)throw new ValidationError('Dane NHTSA wykraczają poza obsługiwany zakres.');
  fields[key]=value;
 }
 const result:DecodedVehicleSource={provider:'nhtsa-vpic',vin,timestamp,fields};
 if(!validDecodedSource(result))throw new ValidationError('NHTSA nie udostępniła danych możliwych do uzupełnienia.');
 return result;
}
export function applyDecodedFields(current:Record<string,string>,source:DecodedVehicleSource,selected:readonly DecodedField[],expected:Record<string,string>):{values:Record<string,string>;source:DecodedVehicleSource}{
 if(!validDecodedSource(source)||normalizeDecodeVin(current.vin)!==source.vin||normalizeDecodeVin(expected.vin)!==source.vin)throw new ValidationError('VIN formularza zmienił się. Pobierz dane ponownie.');
 if(!Array.isArray(selected)||!selected.length||new Set(selected).size!==selected.length||selected.some(key=>!fieldNames.includes(key)||!Object.hasOwn(source.fields,key)))throw new ValidationError('Wybierz pola z otrzymanej odpowiedzi.');
 const fields:DecodedFields={},values={...current};
 for(const key of selected as readonly DecodedField[]){
  if((current[key]??'')!==(expected[key]??''))throw new ValidationError('Wybrane pole zmieniło się podczas pobierania. Pobierz dane ponownie.');
  fields[key]=source.fields[key]!;values[key]=source.fields[key]!;
 }
 const same=(a:string,b:string)=>a.trim().toUpperCase()===b.trim().toUpperCase();
 if(selected.includes('make')&&current.model?.trim()&&source.fields.model&&!same(values.model,source.fields.model)||selected.includes('model')&&current.make?.trim()&&source.fields.make&&!same(values.make,source.fields.make))throw new ValidationError('Marka i model nie tworzą pary ze źródła. Wybierz oba pola lub sprawdź wpis ręczny.');
 return {values,source:{provider:'nhtsa-vpic',vin:source.vin,timestamp:source.timestamp,fields}};
}
export function retainDecodedSource(vehicle:Pick<Vehicle,'vin'|'make'|'model'|'year'|'spec'>,source:unknown):DecodedVehicleSource|undefined{
 if(!validDecodedSource(source)||vehicle.vin!==source.vin)return undefined;
 const values={make:vehicle.make,model:vehicle.model,year:String(vehicle.year),displacementCc:vehicle.spec?.displacementCc==null?'':String(vehicle.spec.displacementCc),transmission:vehicle.spec?.transmission??'',drive:vehicle.spec?.drive??''};
 const fields=Object.fromEntries(Object.entries(source.fields).filter(([key,value])=>values[key as DecodedField]===value)) as DecodedFields;
 return Object.keys(fields).length?{provider:'nhtsa-vpic',vin:source.vin,timestamp:source.timestamp,fields}:undefined;
}
export function attachDecodedSource(state:AppData,vehicleId:string,source:DecodedVehicleSource):AppData{
 if(!validDecodedSource(source))throw new ValidationError('Nieprawidłowe źródło danych VIN.');
 const vehicle=state.vehicles.find(car=>car.id===vehicleId);
 if(!vehicle)throw new ValidationError('Samochód z tego formularza nie jest już dostępny.');
 const decodedSource=retainDecodedSource(vehicle,source);
 return {...state,vehicles:state.vehicles.map(car=>car.id===vehicleId?{...car,decodedSource}:car)};
}
