import {useEffect,useRef,useState} from 'react';
import {Image,Linking,Pressable,StyleSheet,Text,View} from 'react-native';
import {router,useIsFocused} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useApp} from './AppProvider';
import type {Vehicle} from './domain';
import {validAsset} from './media';
import {retainDecodedSource} from './vin-decoder';
import {lookupVehicleImages} from './vehicle-images';
import type {VehicleImage} from './vehicle-images';
function Control({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.control,disabled&&{opacity:.45}]}><Text style={s.controlText}>{label}</Text></Pressable>;}
export function CockpitIdentity({vehicle,onReadVin,canReadVin,busy}:{vehicle:Vehicle;onReadVin?:()=>void;canReadVin:boolean;busy:boolean}){
 const app=useApp(),focused=useIsFocused();const[images,setImages]=useState<VehicleImage[]|null>(null),[chosen,setChosen]=useState<VehicleImage|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[failedKey,setFailedKey]=useState<string|null>(null);
 const request=useRef<AbortController|null>(null);useEffect(()=>()=>{const current=request.current;request.current=null;current?.abort();},[]);
 useEffect(()=>{if(!focused)request.current?.abort();},[focused]);
 const photo=vehicle.photos?.find(value=>value.mime!=='application/pdf'&&validAsset(value));
 const uri=photo?`data:${photo.mime};base64,${photo.base64}`:chosen?.uri??null;const imageKey=photo?`${photo.id}:${uri}`:uri;const failed=imageKey!==null&&failedKey===imageKey;
 const decoded=retainDecodedSource(vehicle,vehicle.decodedSource),observed=vehicle.vinSource?.vin===vehicle.vin?vehicle.vinSource:null;
 async function search(){request.current?.abort();const controller=new AbortController();request.current=controller;setLoading(true);setError('');try{const values=await lookupVehicleImages(vehicle,{signal:controller.signal});if(!controller.signal.aborted)setImages(values);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Nie udało się pobrać zdjęć.');}finally{if(request.current===controller)setLoading(false);}}
 async function attribution(){if(!chosen)return;try{await Linking.openURL(chosen.page);}catch{setError('Nie udało się otworzyć strony autora i licencji.');}}
 return <View style={s.panel}>
  <View style={s.top}><Ionicons accessible={false} name="finger-print-outline" size={23} color="#a7cbc5"/><View style={{flex:1}}><Text accessibilityRole="header" style={s.title}>Rozpoznawanie samochodu</Text><Text style={s.fine}>{observed?'VIN zapisany z odczytu OBD':vehicle.vin?'VIN wpisany w profilu':'Tożsamość z profilu w Garażu'}</Text></View></View>
  <Text selectable style={s.vin}>{vehicle.vin||'Brak zapisanego VIN'}</Text>
  {observed&&<Text style={s.fine}>Odczyt VIN: {new Date(observed.timestamp).toLocaleString('pl-PL')} · CAN {observed.ecu.responseId}. Zapis historyczny, nie porównanie z bieżącym połączeniem.</Text>}
  <Text style={s.fine}>{decoded?`Dane z dekodera NHTSA: ${Object.keys(decoded.fields).length} pól w profilu. `:''}OBD może podać VIN. Dekoder pomaga ustalić markę, model i rok, o ile pojazd jest w bazie. Nie określa koloru ani nie dostarcza zdjęcia.</Text>
  <View style={s.controls}>{onReadVin&&<Control label="Odczytaj VIN przez OBD" disabled={busy||!canReadVin} onPress={onReadVin}/>}<Control label="Sprawdź dane VIN w Garażu" disabled={busy||app.busy||!!app.recordingVehicleId} onPress={()=>app.openForm('vehicle',vehicle.id)}/></View>
  <View style={s.divider}/>
  <Text accessibilityRole="header" style={s.title}>Zdjęcie samochodu</Text>
  {(photo||chosen)&&!failed?<Image accessibilityLabel={photo?`Zdjęcie właściciela: ${vehicle.make} ${vehicle.model}`:`Zdjęcie poglądowe: ${chosen!.title}`} source={{uri:uri!}} resizeMode="contain" style={s.photo} onError={()=>setFailedKey(imageKey)}/>:<View style={s.empty}><Ionicons accessible={false} name="images-outline" size={24} color="#93aab3"/><Text style={s.fine}>{failed?'Nie udało się wyświetlić zdjęcia.':`Wyszukaj zdjęcie poglądowe ${vehicle.make} ${vehicle.model} lub dodaj własne w Garażu.`}</Text></View>}
  {photo?<Text style={s.fine}>Własne zdjęcie z Garażu · ma pierwszeństwo przed zdjęciami poglądowymi.</Text>:chosen?<><Text style={s.fine}>Zdjęcie poglądowe · {chosen.title}. Wersja, rocznik i kolor mogą się różnić.</Text><Text style={s.fine}>{chosen.author} · {chosen.license} · Wikimedia Commons</Text><Control label="Autor, licencja i plik źródłowy ↗" onPress={()=>void attribution()}/></>:null}
  {!photo&&<><Text style={s.fine}>Wyszukiwanie wyśle do Wikimedia Commons tylko markę, model i rok; VIN i rejestracja pozostają na urządzeniu. Wyniki wybierasz samodzielnie, do podglądu w tej sesji.</Text><Control label={loading?'Wyszukiwanie zdjęć…':'Znajdź zdjęcia modelu'} disabled={loading} onPress={()=>void search()}/></>}
  {error!==''&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}
  {!photo&&images&&<><Text style={s.fine}>{images.length?'Wybierz fotografię. Porównaj nadwozie i generację ze swoim autem.':'Brak zdjęć z wymaganym opisem autora i licencji. Dodaj własne zdjęcie w Garażu.'}</Text><View style={s.results}>{images.map(image=><Pressable key={image.id} accessibilityRole="button" accessibilityState={{selected:chosen?.id===image.id}} accessibilityLabel={`Wybierz zdjęcie poglądowe: ${image.title}. ${image.author}, ${image.license}`} onPress={()=>{setChosen(image);setFailedKey(null);}} style={[s.result,chosen?.id===image.id&&{borderColor:'#a7cbc5'}]}><Image accessible={false} source={{uri:image.uri}} style={s.thumb} resizeMode="cover"/><Text numberOfLines={2} style={s.resultText}>{image.title}</Text><Text numberOfLines={2} style={s.fine}>{image.author} · {image.license}</Text></Pressable>)}</View></>}
  <Control label="Dodaj własne zdjęcie w Garażu" disabled={busy} onPress={()=>router.navigate('/garage')}/>
 </View>;
}
const s=StyleSheet.create({panel:{marginTop:18,padding:22,borderRadius:18,backgroundColor:'#172832',borderWidth:1,borderColor:'#304652',gap:12},top:{flexDirection:'row',alignItems:'center',gap:12},title:{fontSize:15,fontWeight:'600',color:'#eaf0ee'},fine:{fontSize:11,lineHeight:18,color:'#a8bcc1'},vin:{fontSize:16,letterSpacing:1,fontVariant:['tabular-nums'],color:'#e5efec',flexShrink:1},controls:{flexDirection:'row',flexWrap:'wrap',gap:10},control:{alignSelf:'flex-start',minHeight:44,paddingVertical:11,paddingHorizontal:13,borderWidth:1,borderColor:'#3d5662',borderRadius:10,justifyContent:'center'},controlText:{fontSize:12,lineHeight:19,color:'#e8efec'},divider:{height:1,backgroundColor:'#304652',marginVertical:8},photo:{width:'100%',height:240,borderRadius:12,backgroundColor:'#0d1c26'},empty:{flexDirection:'row',alignItems:'center',gap:12,padding:16,backgroundColor:'#12232d',borderRadius:12},notice:{fontSize:12,lineHeight:19,color:'#e7cb94'},results:{flexDirection:'row',flexWrap:'wrap',gap:12},result:{flexBasis:'45%',flexGrow:1,borderWidth:1,borderColor:'#304652',padding:8,borderRadius:12,gap:7},thumb:{height:100,width:'100%',borderRadius:7},resultText:{fontSize:11,lineHeight:16,color:'#e3ecea'}});
