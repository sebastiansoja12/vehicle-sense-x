import {ReadinessDetails} from './ReadinessDetails';
import {OilTemperatureDetails} from './OilTemperatureDetails';
import {useState} from 'react';
import {View,Text} from 'react-native';
import type {DiagnosticSnapshot} from './types';
import {Stat,Note,Button,number} from '../ui';
import {styles as s} from '../theme';
import {DetailsToggle} from './DiagnosticDetails';
const labels={stored:'Zapisane',pending:'Oczekujące',permanent:'Trwałe'};

function ParameterGrid({parameters:p}:{parameters:DiagnosticSnapshot['parameters']}) {
 return <View style={s.stats}>
  <Stat label="Obroty silnika" value={p.rpm===null?'—':number(p.rpm)} unit="rpm"/>
  <Stat label="Płyn chłodzący" value={p.coolantC===null?'—':number(p.coolantC)} unit="°C"/>
  <Stat label="Obciążenie" value={p.loadPercent===null?'—':number(p.loadPercent)} unit="%"/>
  <Stat label="Napięcie adaptera" value={p.voltageV===null?'—':number(p.voltageV,1)} unit="V"/>
 </View>;
}
export function Snapshot({value,expanded=false}:{value:DiagnosticSnapshot;expanded?:boolean}) {
 const[open,setOpen]=useState(expanded);
 return <View style={{gap:12,marginTop:12}}>
  <Text style={s.fine}>{new Date(value.timestamp).toLocaleString('pl-PL')} · {value.source==='obd'?'Odczyt OBD2':'Import · bez weryfikacji adaptera'}</Text>
  <Text style={s.body}>{value.codes.length} kodów · {value.extended?'skan rozszerzony':'odczyt podstawowy'}</Text>
  {value.ecu?<Text style={s.muted}>Zakres: sterownik CAN {value.ecu.responseId} · protokół {value.ecu.protocol}. Ten odczyt nie obejmuje wszystkich sterowników samochodu.</Text>:<Text style={s.muted}>Adres ECU niepotwierdzony. Odczyt nie obejmuje wszystkich sterowników samochodu.</Text>}
  <Text style={s.fine}>{value.adapterName} · odczytane statusy: {value.readStatuses.map(v=>labels[v]).join(', ')}</Text>
  <Button label={open?'Zwiń raport diagnostyczny':'Pokaż raport diagnostyczny'} secondary onPress={()=>setOpen(v=>!v)}/>
  {open&&<>
   {value.readStatuses.length<3&&<Note>Odczyt częściowy. Pozostałe statusy kodów są nieznane.</Note>}
   <ParameterGrid parameters={value.parameters}/>{!value.extended&&<><OilTemperatureDetails value={value}/><ReadinessDetails value={value}/></>}
   {value.codes.length?value.codes.map((code,i)=><View key={`${code.code}-${code.status}-${i}`} style={s.between}><Text style={[s.body,{fontWeight:'700'}]}>{code.code}</Text><Text style={s.muted}>{labels[code.status]}</Text></View>):<Text style={s.body}>Brak kodów w odczytanych statusach. Nie potwierdza to sprawności samochodu.</Text>}
   <Text style={s.fine}>— oznacza brak obsługi lub odczytu parametru. Wspierane PID: {value.supportedPids.map(v=>v.toString(16).toUpperCase().padStart(2,'0')).join(', ')||'brak'}.</Text>
   {value.extended?<DetailsToggle key={value.id} value={value.extended} initiallyOpen={expanded}/>:<Text style={s.fine}>Raport podstawowy. Pełny katalog parametrów i freeze frame nie zostały odczytane.</Text>}
  </>}
 </View>;
}
