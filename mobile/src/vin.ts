import type {AppData} from './domain.ts';
import type {CanEcu} from './obd/can.ts';
import {validCanEcu} from './obd/can.ts';
import {ObdError,responseLines} from './obd/protocol.ts';
import {ValidationError} from './validation.ts';
import {retainDecodedSource} from './vin-decoder.ts';
export type VinSource={source:'obd';vin:string;timestamp:number;adapterName:string;ecu:CanEcu};
export type VinObservation=VinSource&{vehicleId:string};
export function validVinSource(value:unknown):value is VinSource{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const source=value as Record<string,unknown>;
 return source.source==='obd'&&typeof source.vin==='string'&&/^[A-HJ-NPR-Z0-9]{17}$/.test(source.vin)&&!/^0{17}$/.test(source.vin)&&typeof source.timestamp==='number'&&Number.isSafeInteger(source.timestamp)&&source.timestamp>=0&&source.timestamp<=253402300799999&&typeof source.adapterName==='string'&&source.adapterName.trim().length>0&&source.adapterName.length<=200&&validCanEcu(source.ecu);
}
export function parseObdVin(raw:string):string{
 const lines=responseLines(raw,'0902'),hex=lines.length===1?lines[0].replace(/\s/g,''):'';
 if(!/^490201[0-9A-F]{34}$/.test(hex))throw new ObdError('Sterownik nie zwrócił kompletnego VIN w obsługiwanym formacie.');
 const vin=String.fromCharCode(...hex.slice(6).match(/../g)!.map(byte=>parseInt(byte,16)));
 if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)||/^0{17}$/.test(vin))throw new ObdError('Sterownik nie zwrócił prawidłowego, zaprogramowanego VIN.');
 return vin;
}
export function applyVinObservation(state:AppData,reading:VinObservation,expectedVin:string):AppData{
 if(!validVinSource(reading)||typeof reading.vehicleId!=='string')throw new ValidationError('Nieprawidłowy odczyt VIN.');
 const car=state.vehicles.find(vehicle=>vehicle.id===reading.vehicleId);
 if(!car)throw new ValidationError('Samochód z tego odczytu nie jest już dostępny.');
 if(car.vin!==expectedVin)throw new ValidationError('VIN w profilu zmienił się od wyświetlenia odczytu. Sprawdź profil i odczytaj go ponownie.');
 const vinSource:VinSource={source:'obd',vin:reading.vin,timestamp:reading.timestamp,adapterName:reading.adapterName,ecu:{protocol:reading.ecu.protocol,responseId:reading.ecu.responseId}};
 return {...state,vehicles:state.vehicles.map(vehicle=>vehicle.id===car.id?{...vehicle,vin:reading.vin,vinSource,decodedSource:retainDecodedSource({...vehicle,vin:reading.vin},vehicle.decodedSource)}:vehicle)};
}
