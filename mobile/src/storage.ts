import {keyValue as AsyncStorage} from './key-value';
import {Platform} from 'react-native';
import {createRepository,STORAGE_KEY} from './repository';
export const repository=createRepository({
 getItem:key=>AsyncStorage.getItem(key),
 setItem:(key,value)=>AsyncStorage.setItem(key,value),
 async withLock<T>(task:()=>Promise<T>):Promise<T>{
  if(Platform.OS!=='web')return task();
  const locks=globalThis.navigator?.locks;
  if(!locks)throw new Error('Ta przeglądarka nie zapewnia bezpiecznego zapisu między kartami. Użyj aktualnej przeglądarki lub aplikacji mobilnej.');
  return locks.request(STORAGE_KEY,task);
 }
});
