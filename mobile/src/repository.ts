import { parseStoredData } from './domain.ts';
import type { AppData } from './domain.ts';
export const STORAGE_KEY='vehiclesensex:data:v1';
export type StorageAdapter={getItem(key:string):Promise<string|null>;setItem(key:string,value:string):Promise<void>;withLock?:<T>(task:()=>Promise<T>)=>Promise<T>};
export function createRepository(storage:StorageAdapter){
 let state:AppData|null=null;let writing=false;
 return {
  current:()=>state,
  async load(){if(writing)throw new Error('Trwa zapis danych.');const next=parseStoredData(await storage.getItem(STORAGE_KEY));state=next;return next;},
  async update(change:(current:AppData)=>AppData){
   if(!state)throw new Error('Najpierw wczytaj dane.');if(writing)throw new Error('Trwa zapis poprzedniej zmiany.');
   writing=true;
   try{
    const write=async()=>{const latest=parseStoredData(await storage.getItem(STORAGE_KEY));const next=change(latest);const serialized=JSON.stringify(next);parseStoredData(serialized);await storage.setItem(STORAGE_KEY,serialized);state=next;return next;};
    return await (storage.withLock?storage.withLock(write):write());
   }
   finally{writing=false;}
  }
 };
}
