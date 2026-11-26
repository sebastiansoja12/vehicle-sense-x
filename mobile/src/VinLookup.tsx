import {useEffect,useRef,useState} from 'react';
import {View,Text,Switch} from 'react-native';
import {Link} from 'expo-router';
import {lookupVin} from './vin-client';
import {decodedFieldLabels,normalizeDecodeVin} from './vin-decoder';
import type {DecodedField,DecodedVehicleSource} from './vin-decoder';
import {Button} from './ui';
import {styles as s} from './theme';

type Props={values:Record<string,string>;disabled:boolean;onApply:(source:DecodedVehicleSource,selected:DecodedField[],expected:Record<string,string>)=>void};
export function VinLookup({values,disabled,onApply}:Props){
 let vin='';try{vin=normalizeDecodeVin(values.vin);}catch{}
 return <VinLookupSession key={`${vin}:${disabled}`} values={values} disabled={disabled} onApply={onApply} vin={vin}/>;
}
function VinLookupSession({values,disabled,onApply,vin}:Props&{vin:string}){
 const [consentedVin,setConsentedVin]=useState<string|null>(null),[running,setRunning]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [preview,setPreview]=useState<{source:DecodedVehicleSource;expected:Record<string,string>}|null>(null),[selected,setSelected]=useState<DecodedField[]>([]);
 const request=useRef<AbortController|null>(null);
 useEffect(()=>()=>{request.current?.abort();request.current=null;},[]);
 async function lookup(){
  if(disabled||running||!vin||consentedVin!==vin)return;
  const controller=new AbortController();request.current=controller;const expected={...values};
  setRunning(true);setError('');setMessage('');setPreview(null);
  try{
   const source=await lookupVin({vin,consent:true,signal:controller.signal});
   if(request.current!==controller)return;
   setPreview({source,expected});setSelected((Object.keys(source.fields) as DecodedField[]).filter(key=>!expected[key]?.trim()));
  }catch(e){if(request.current===controller&&!controller.signal.aborted)setError(e instanceof Error?e.message:'Nie udało się pobrać danych VIN.');}
  finally{if(request.current===controller){request.current=null;setRunning(false);}}
 }
 function apply(){
  if(!preview)return;
  try{onApply(preview.source,selected,preview.expected);setPreview(null);setSelected([]);setMessage('Wybrane pola uzupełniono. Sprawdź formularz i zapisz samochód.');setError('');}
  catch(e){setError(e instanceof Error?e.message:'Nie udało się uzupełnić formularza.');}
 }
 const visible=preview?.source.vin===vin?preview:null;
 const stale=!!visible&&selected.some(key=>(values[key]??'')!==(visible.expected[key]??''));
 return <View style={{gap:12,marginBottom:20}}>
  <Text style={s.body}>Uzupełnij z VIN · opcjonalnie</Text>
  <Text style={s.fine}>Po zgodzie wyślemy wyłącznie powyższy VIN przez internet do amerykańskiego serwisu NHTSA vPIC. Nie wysyłamy rejestracji, przebiegu ani historii garażu. Wynik może być niepełny, szczególnie dla aut spoza rynku USA. Możesz wpisać wszystko ręcznie.</Text>
  <Link href="https://vpic.nhtsa.dot.gov/api/" style={s.linkText}>Źródło i ograniczenia NHTSA ›</Link>
  <View style={s.between}><Text style={[s.fine,{flex:1}]}>Zgadzam się wysłać ten VIN do NHTSA</Text><Switch accessibilityLabel="Zgoda na wysłanie VIN do NHTSA vPIC" value={!!vin&&consentedVin===vin} disabled={disabled||running||!vin} onValueChange={checked=>setConsentedVin(checked?vin:null)}/></View>
  <Button label={running?'Pobieranie danych NHTSA…':'Pobierz dane po VIN'} secondary disabled={disabled||running||!vin||consentedVin!==vin} onPress={()=>void lookup()}/>
  {running&&<Button label="Anuluj pobieranie VIN" secondary onPress={()=>{request.current?.abort();request.current=null;setRunning(false);}}/>}
  {visible&&<View style={{gap:12}}>
   <Text style={s.body}>NHTSA vPIC · podgląd</Text>
   <Text style={s.fine}>Pobrano {new Date(visible.source.timestamp).toLocaleString('pl-PL')}. Rok to rok modelowy, nie potwierdzona data produkcji. Dane nie potwierdzają wyposażenia, historii ani autentyczności samochodu. Wybierz pola; istniejące wartości nie są zaznaczane automatycznie.</Text>
   {(Object.keys(visible.source.fields) as DecodedField[]).map(key=><View key={key} style={s.between}><View style={{flex:1,gap:4}}><Text style={s.label}>{decodedFieldLabels[key]}</Text><Text style={s.body}>{visible.source.fields[key]}</Text><Text style={s.fine}>Obecnie: {values[key]?.trim()||'puste pole'}</Text></View><Switch accessibilityLabel={`Użyj pola NHTSA: ${decodedFieldLabels[key]}`} value={selected.includes(key)} disabled={disabled} onValueChange={checked=>setSelected(keys=>checked?[...keys.filter(k=>k!==key),key]:keys.filter(k=>k!==key))}/></View>)}
   {stale&&<Text accessibilityRole="alert" style={s.error}>Zaznaczone pole zmieniło się po rozpoczęciu pobierania. Pobierz dane ponownie.</Text>}
   <Button label="Użyj wybranych pól w formularzu" disabled={disabled||running||!selected.length||stale} onPress={apply}/>
   <Button label="Odrzuć dane NHTSA" secondary disabled={disabled} onPress={()=>{setPreview(null);setSelected([]);}}/>
  </View>}
  {error!==''&&<Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
  {message!==''&&<Text accessibilityLiveRegion="polite" style={s.fine}>{message}</Text>}
 </View>;
}

export function VehicleDecodeEvidence({source}:{source:DecodedVehicleSource|undefined}){
 if(!source)return null;
 return <View style={{gap:8,marginTop:12}}><Text style={s.body}>Zapisane źródło: NHTSA vPIC</Text><Text style={s.fine}>Pobrano {new Date(source.timestamp).toLocaleString('pl-PL')}. Poniższe wartości są nadal zgodne z zapisanym wynikiem; nie potwierdzają wyposażenia ani autentyczności pojazdu.</Text>{(Object.keys(source.fields) as DecodedField[]).map(key=><Text key={key} style={s.fine}>{decodedFieldLabels[key]}: {source.fields[key]}</Text>)}<Link href="https://vpic.nhtsa.dot.gov/api/" style={s.linkText}>O źródle NHTSA ›</Link></View>;
}
