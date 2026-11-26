import Storage from 'expo-sqlite/kv-store';
import LegacyStorage from '@react-native-async-storage/async-storage';
import {createMigratingStorage} from './storage-migration';
import {parseStoredData} from './domain';
export const keyValue=createMigratingStorage(Storage,LegacyStorage,(key,raw)=>{if(key==='vehiclesensex:data:v1')parseStoredData(raw);else if(key==='vehiclesensex:trip-draft:v1')return;else JSON.parse(raw);});
