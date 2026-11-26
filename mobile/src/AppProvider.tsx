import {createContext,useContext,useEffect,useRef,useState,useCallback} from 'react';
import type {PropsWithChildren} from 'react';
import {ActivityIndicator,View,Text} from 'react-native';
import type {AppData} from './domain';
import {repository} from './storage';
import {EntryForm} from './EntryForm';
import type {FormSelection} from './EntryForm';
import {Button} from './ui';
import {styles as s} from './theme';
type AppContextValue={data:AppData;busy:boolean;commit:(change:(state:AppData)=>AppData)=>Promise<void>;openForm:(type:FormSelection['type'],recordId?:string)=>void;recordingVehicleId:string|null;setRecordingVehicleId:(id:string|null)=>void};
const AppContext=createContext<AppContextValue|null>(null);
export function AppProvider({children}:PropsWithChildren){
 const [data,setData]=useState<AppData|null>(null),[busy,setBusy]=useState(false),[loadError,setLoadError]=useState(''),[selection,setSelection]=useState<FormSelection|null>(null),[recordingVehicleId,setRecordingState]=useState<string|null>(null);
 const writing=useRef(false),mounted=useRef(true),recording=useRef<string|null>(null);
 const load=useCallback(async()=>{try{const next=await repository.load();if(mounted.current){setData(next);setLoadError('');}}catch(e){if(mounted.current)setLoadError(e instanceof Error?e.message:'Nie można odczytać danych. Spróbuj ponownie.');}},[]);
 useEffect(()=>{mounted.current=true;repository.load().then(next=>{if(mounted.current)setData(next);},error=>{if(mounted.current)setLoadError(error instanceof Error?error.message:'Nie można odczytać danych.');});return()=>{mounted.current=false;};},[load]);
 function setRecordingVehicleId(id:string|null){recording.current=id;setRecordingState(id);}
 async function commit(change:(state:AppData)=>AppData){
  if(writing.current)throw new Error('Trwa zapis poprzedniej zmiany.');writing.current=true;setBusy(true);
  try{const next=await repository.update(state=>{const updated=change(state);if(recording.current&&(updated.activeVehicleId!==state.activeVehicleId||!updated.vehicles.some(v=>v.id===recording.current)))throw new Error('Najpierw zapisz lub odrzuć rejestrowaną trasę.');return updated;});setData(next);}
  catch(e){if(e instanceof Error&&(['ValidationError','StorageFormatError'].includes(e.name)||e.message.startsWith('Najpierw zapisz')))throw e;throw new Error('Nie udało się zapisać na urządzeniu. Zmiana nie została zatwierdzona. Sprawdź wolne miejsce i spróbuj ponownie.');}
  finally{writing.current=false;setBusy(false);}
 }
 if(!data)return <View style={[s.fill,{justifyContent:'center',padding:28,gap:20}]}>{loadError?<><Text accessibilityRole="header" style={s.heading}>Nie można wczytać garażu</Text><Text accessibilityRole="alert" style={s.error}>{loadError}</Text><Text style={s.muted}>Zapis nie został usunięty ani zastąpiony. Spróbuj ponownie; nie czyść danych aplikacji.</Text><Button label="Ponów odczyt" onPress={()=>{setLoadError('');void load();}}/></>:<><ActivityIndicator/><Text style={s.muted}>Wczytywanie garażu…</Text></>}</View>;
 return <AppContext.Provider value={{data,busy,commit,recordingVehicleId,setRecordingVehicleId,openForm:(type,recordId)=>{if(!writing.current&&(type==='vehicle'||data.activeVehicleId))setSelection({type,recordId,vehicleId:type==='vehicle'&&!recordId?null:data.activeVehicleId});}}}>{children}{selection&&<EntryForm key={`${selection.type}-${selection.vehicleId}-${selection.recordId??'new'}`} selection={selection} data={data} busy={busy} save={commit} onClose={()=>setSelection(null)}/>}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('Brak kontekstu aplikacji.');return value;}
