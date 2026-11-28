import {useState} from 'react';
import {View,Text,TextInput} from 'react-native';
import type {DiagnosticDetails as Details} from './details';
import type {ObdMeasurement} from './parameters';
import {parameterByPid,pidHex} from './parameters';
import {monitorLabels} from './readiness';
import {Button,Note,number} from '../ui';
import {styles as s,colors} from '../theme';
import {IdentificationView} from './IdentificationView';

export function Measurements({values}:{values:ObdMeasurement[]}) {
 return <View>{values.map(m=>{const p=parameterByPid(m.pid)!;return <View key={m.pid} style={s.listRow}>
  <View style={s.between}><Text style={[s.body,{flex:1}]}>{p.label}</Text><Text style={[s.body,{fontWeight:'600',fontVariant:['tabular-nums']}]}>{m.value===null?'—':number(m.value,p.decimals)} {p.unit}</Text></View>
  <Text style={s.fine}>PID {pidHex(m.pid)} · pobrano {new Date(m.readAt).toLocaleTimeString('pl-PL')}</Text>
 </View>;})}{values.length===0&&<Text style={s.muted}>Brak odczytanych parametrów.</Text>}</View>;
}
export function DiagnosticDetails({value}:{value:Details}) {
 const[query,setQuery]=useState('');
 const q=query.trim().toLocaleLowerCase('pl');
 const values=value.measurements.filter(m=>{const p=parameterByPid(m.pid)!;return (p.label+' '+pidHex(m.pid)).toLocaleLowerCase('pl').includes(q);});
 const ready=value.readiness,frame=value.freezeFrame;
 return <View style={{gap:14}}>
  {value.identification&&<IdentificationView value={value.identification}/>}
  <Text accessibilityRole="header" style={s.sectionTitle}>Parametry rozszerzone · {value.measurements.length}</Text>
  <TextInput accessibilityLabel="Szukaj parametru po nazwie lub PID" placeholder="Nazwa parametru lub PID" value={query} onChangeText={setQuery} maxLength={80} style={s.input}/>
  {Object.values(value.scaling??{}).some(v=>v===null)&&<Note>ECU nie podał konfiguracji skalowania. Zależne od niej pomiary pozostają nieznane.</Note>}
  <Measurements values={values}/>
  <Text accessibilityRole="header" style={s.sectionTitle}>Gotowość emisji · PID 01</Text>
  {ready?<><Text style={s.body}>MIL: {ready.milOn?'aktywna':'nieaktywna'} · DTC wg PID 01: {ready.storedDtcCount}</Text>
   <Text style={s.muted}>Zapłon {ready.ignition==='spark'?'iskrowy':'samoczynny'} · monitory od ostatniego kasowania</Text>
   {ready.monitors.map(m=><View key={m.id} style={s.between}><Text style={[s.body,{flex:1}]}>{monitorLabels[m.id]}</Text><Text style={[s.fine,{color:m.supported&&!m.complete?colors.red:colors.muted}]}>{!m.supported?'Nieobsługiwany':m.complete?'Zakończony':'Niezakończony'}</Text></View>)}
  </>:<Text style={s.muted}>Brak odpowiedzi PID 01 lub parametr nie jest obsługiwany. Gotowość pozostaje nieznana.</Text>}
  <Text style={s.fine}>Zakończony monitor nie potwierdza naprawy ani wyniku badania technicznego.</Text>
  <Text accessibilityRole="header" style={s.sectionTitle}>Freeze frame · ramka 0</Text>
  {frame.status==='available'?<><Text style={s.body}>Kod wyzwalający: {frame.code}</Text><Text style={s.fine}>Pobrano {new Date(frame.readAt).toLocaleString('pl-PL')}. Czas zapisania usterki przez ECU jest nieznany. To zapisane warunki, a nie pomiar bieżący.</Text>
   {frame.supportedPids===null?<Text style={s.muted}>ECU nie podał listy parametrów ramki. Jej pomiary są nieznane.</Text>:<Measurements values={frame.measurements}/>}
  </>:<Text style={s.muted}>{frame.status==='no-frame'?'ECU zwrócił zerowy kod wyzwalający: brak zapisanej ramki 0.':'Brak odpowiedzi na zapytanie o ramkę 0. Jej zawartość jest nieznana.'}</Text>}
 </View>;
}
export function DetailsToggle({value,initiallyOpen=false}:{value:Details;initiallyOpen?:boolean}){
 const[open,setOpen]=useState(initiallyOpen);
 return <View style={{gap:14}}><Button label={open?'Zwiń dane rozszerzone':'Pokaż parametry, gotowość i freeze frame'} secondary onPress={()=>setOpen(v=>!v)}/>{open&&<DiagnosticDetails value={value}/>}</View>;
}
