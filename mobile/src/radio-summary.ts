import {vehicleSummary} from './domain.ts';
import type {AppData} from './domain.ts';
import {dueReminders} from './features.ts';

export type AudioOutput={name:string;type:'bluetooth'|'car'|'usb'|'wired'|'speaker'|'airplay'|'other'};
export type AudioOutputs={scope:'current'|'available';outputs:AudioOutput[]};

export function parseAudioOutputs(value:unknown):AudioOutputs{
 if(!value||typeof value!=='object')throw new Error('Nieprawidłowe dane wyjść audio.');
 const data=value as Record<string,unknown>;
 if(!['current','available'].includes(data.scope as string)||!Array.isArray(data.outputs)||data.outputs.length>32||data.outputs.some(output=>
  !output||typeof output!=='object'||typeof output.name!=='string'||!output.name.trim()||output.name.length>120||!['bluetooth','car','usb','wired','speaker','airplay','other'].includes(output.type)))throw new Error('Nieprawidłowe dane wyjść audio.');
 return {scope:data.scope as AudioOutputs['scope'],outputs:data.outputs.map(output=>({name:output.name,type:output.type}))};
}

export function buildRadioSummary(state:AppData,vehicleId:string,today:string):string{
 const car=state.vehicles.find(vehicle=>vehicle.id===vehicleId);
 if(!car)throw new Error('Najpierw wybierz samochód w garażu.');
 const fuel=vehicleSummary(state,vehicleId,today.slice(0,7));
 const due=dueReminders(state,vehicleId,today).filter(reminder=>reminder.due).length;
 const number=(value:number,digits=0)=>new Intl.NumberFormat('pl-PL',{maximumFractionDigits:digits}).format(value);
 return `VehicleSenseX. ${car.make} ${car.model}. Ostatni zapisany przebieg: ${number(car.mileage)} kilometrów. ${fuel.consumption===null?'Brak danych do obliczenia spalania.':`Średnie spalanie z zapisanych tankowań: ${number(fuel.consumption,1)} litrów na 100 kilometrów.`} Liczba osiągniętych terminów serwisowych: ${due}. To podsumowanie zapisów w garażu, a nie bieżący odczyt samochodu.`;
}
