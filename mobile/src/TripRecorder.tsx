import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {PropsWithChildren} from 'react';
import {AppState,Text,View} from 'react-native';
import {keyValue as AsyncStorage} from './key-value';
import * as Location from 'expo-location';
import {useApp} from './AppProvider';
import {DraftStore} from './trip-draft';
import {acquireRecordingLease} from './recording-lease';
import {addTrip} from './features';
import type {TripRecord,TripPoint} from './trips';
import {styles as s} from './theme';
import {Button} from './ui';
const store=new DraftStore(AsyncStorage);
type Recorder={corrupt:boolean;exportRaw:()=>Promise<string|null>;draft:TripRecord|null;running:boolean;busy:boolean;error:string;start:()=>Promise<void>;pause:()=>void;resume:()=>Promise<void>;save:()=>Promise<void>;discard:()=>Promise<void>};
const Context=createContext<Recorder|null>(null);
export function TripRecorderProvider({children}:PropsWithChildren){
 const app=useApp(),appRef=useRef(app);useLayoutEffect(()=>{appRef.current=app;},[app]);
 const [draft,setDraft]=useState<TripRecord|null>(null),[running,setRunning]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
 const [corrupt,setCorrupt]=useState(false);
 const releaseLease=useRef<(()=>void)|null>(null);
 const current=useRef<TripRecord|null>(null),watch=useRef<Location.LocationSubscription|null>(null),generation=useRef(0),breakNext=useRef(true),operation=useRef(false);
 const invalidate=useCallback(()=>{generation.current++;watch.current?.remove();watch.current=null;breakNext.current=true;},[]);
 const pause=useCallback(()=>{invalidate();setRunning(false);},[invalidate]);
 const update=(value:TripRecord|null)=>{current.current=value;setDraft(value);appRef.current.setRecordingVehicleId(value?.vehicleId??null);};
 useEffect(()=>{let mounted=true;store.load().then(async value=>{if(!mounted)return;if(value&&appRef.current.data.trips.some(t=>t.id===value!.id)){value=null;}if(mounted){current.current=value;setDraft(value);appRef.current.setRecordingVehicleId(value?.vehicleId??null);setReady(true);}}).catch(e=>{if(mounted){setError(e instanceof Error?e.message:'Nie udało się odzyskać szkicu.');setCorrupt(true);setReady(true);}});const listener=AppState.addEventListener('change',state=>{if(state!=='active')pause();});return()=>{mounted=false;invalidate();releaseLease.current?.();releaseLease.current=null;listener.remove();};},[pause,invalidate]);
 async function claim(){if(releaseLease.current)return;const release=await acquireRecordingLease();releaseLease.current=release;try{let saved=await store.load();if(saved&&appRef.current.data.trips.some(t=>t.id===saved!.id)){await store.clear();saved=null;}update(saved);}catch(e){release();releaseLease.current=null;throw e;}}
 function release(){releaseLease.current?.();releaseLease.current=null;}
 async function listen(){
  const token=++generation.current;const permission=await Location.requestForegroundPermissionsAsync();if(token!==generation.current)return;
  if(permission.status!=='granted')throw new Error('Brak zgody na lokalizację. Możesz dodać przejazd ręcznie.');
  if(AppState.currentState!=='active'&&AppState.currentState!==null)throw new Error('Wróć do aplikacji, aby wznowić GPS.');
  const subscription=await Location.watchPositionAsync({accuracy:Location.Accuracy.High,timeInterval:2000,distanceInterval:2},location=>{
   if(token!==generation.current||!current.current)return;
   const old=current.current;if(old.points.length>=10000){pause();setError('Osiągnięto limit 10 000 punktów. Zapisz trasę i rozpocznij kolejną.');return;}
   if(location.timestamp<old.startedAt||location.timestamp<=(old.points.at(-1)?.timestamp??0))return;
   const c=location.coords;const point:TripPoint={latitude:c.latitude,longitude:c.longitude,timestamp:location.timestamp,accuracy:c.accuracy,speedMps:c.speed!==null&&c.speed>=0?c.speed:null,...(breakNext.current?{segmentBreak:true}:{})};
   breakNext.current=false;const next={...old,endedAt:Math.max(Date.now(),location.timestamp),points:[...old.points,point]};current.current=next;setDraft(next);
   void store.save(next).catch(()=>{pause();setError('Nie udało się zapisać szkicu. Punkty są nadal w pamięci — spróbuj zapisać trasę przed zamknięciem aplikacji.');});
  },message=>{if(token===generation.current){pause();setError('GPS przerwany: '+message);}});
  if(token!==generation.current){subscription.remove();return;}watch.current=subscription;setRunning(true);
 }
 async function perform(action:()=>Promise<void>){if(operation.current)return;operation.current=true;setBusy(true);setError('');try{await action();}catch(e){pause();setError(e instanceof Error?e.message:'Nie udało się wykonać operacji.');}finally{if(!current.current)release();operation.current=false;setBusy(false);}}
 async function start(){await perform(async()=>{const a=appRef.current;await claim();if(current.current)throw new Error('Najpierw zakończ poprzednią trasę.');const vehicleId=a.data.activeVehicleId;if(!vehicleId)throw new Error('Dodaj samochód.');const time=Date.now();const next:TripRecord={id:'trip-'+time.toString(36)+'-'+Math.random().toString(36).slice(2,8),vehicleId,startedAt:time,endedAt:time,label:'Przejazd GPS',source:'gps',points:[],manualDistanceM:null,manualDurationS:null,fuelCostCents:null};await store.save(next);update(next);breakNext.current=true;await listen();});}
 async function resume(){await perform(async()=>{await claim();if(!current.current){release();throw new Error('Szkic został zakończony w innej karcie.');}if(!appRef.current.data.vehicles.some(v=>v.id===current.current!.vehicleId))throw new Error('Samochód ze szkicu nie jest dostępny w garażu. Wyeksportuj szkic lub odrzuć go.');pause();await listen();});}
 async function save(){await perform(async()=>{await claim();pause();const value=current.current;if(!value)return;if(value.points.length<2)throw new Error('Zapis wymaga co najmniej dwóch punktów GPS. Wznów pomiar lub odrzuć szkic.');const next={...value,endedAt:value.points.at(-1)!.timestamp};await store.save(next);await appRef.current.commit(state=>state.trips.some(t=>t.id===next.id)?state:addTrip(state,next));await store.clear();update(null);release();});}
 async function discard(){await perform(async()=>{if(corrupt){if(!releaseLease.current)releaseLease.current=await acquireRecordingLease();pause();await store.clear();setCorrupt(false);update(null);release();return;}await claim();pause();await store.clear();update(null);release();});}
 if(!ready)return <View style={[s.content,{gap:20}]}><Text style={s.body}>{error||'Sprawdzanie szkicu trasy…'}</Text>{error!==''&&<Button label="Ponów odczyt szkicu" onPress={()=>{void store.load().then(value=>{update(value);setError('');setReady(true);},e=>setError(String(e)));}}/>}</View>;
 return <Context.Provider value={{corrupt,exportRaw:()=>store.readRaw(),draft,running,busy,error,start,pause,resume,save,discard}}>{children}</Context.Provider>;
}
export function useRecorder(){const value=useContext(Context);if(!value)throw new Error('Brak rejestratora.');return value;}
