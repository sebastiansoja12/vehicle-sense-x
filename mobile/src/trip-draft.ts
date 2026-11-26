import {validateTripRecord} from './trips.ts';
import type {TripRecord} from './trips.ts';
export function parseDraft(raw:string):TripRecord{const value:unknown=JSON.parse(raw);if(!validateTripRecord(value)||(value as TripRecord).source!=='gps')throw new Error('Szkic przejazdu jest uszkodzony. Zachowano zapis; nie rozpoczynaj nowej trasy przed odzyskaniem danych.');return value as TripRecord;}
type Storage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem:(key:string)=>Promise<void>};
export class DraftStore{
 private queue:Promise<void>=Promise.resolve();private storage:Storage;private key='vehiclesensex:trip-draft:v1';
 constructor(storage:Storage){this.storage=storage;}
 async readRaw(){await this.queue;return this.storage.getItem(this.key);}
 async load(){await this.queue;const raw=await this.storage.getItem(this.key);return raw?parseDraft(raw):null;}
 private run(operation:()=>Promise<void>){const next=this.queue.then(operation,operation);this.queue=next.catch(()=>{});return next;}
 save(trip:TripRecord){if(!validateTripRecord(trip)||trip.source!=='gps')return Promise.reject(new Error('Nieprawidłowy szkic.'));const json=JSON.stringify(trip);return this.run(()=>this.storage.setItem(this.key,json));}
 clear(){return this.run(()=>this.storage.removeItem(this.key));}
}
