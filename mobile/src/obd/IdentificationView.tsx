import {View,Text} from 'react-native';
import {identificationFields,identificationValues,identificationStatus} from './identification';
import type {EcuIdentification} from './identification';
import {pidHex} from './parameters';
import {styles as s} from '../theme';
export function IdentificationView({value}:{value:EcuIdentification}){
 return <View style={{gap:14}}>
  <Text accessibilityRole="header" style={s.sectionTitle}>Identyfikacja ECU · usługa 09</Text>
  <Text style={s.fine}>Mapa informacji pobrana {new Date(value.readAt).toLocaleString('pl-PL')}.</Text>
  {value.status!=='available'?<Text style={s.body}>{identificationStatus(value)}</Text>:<>
   <Text style={s.fine}>Zadeklarowane InfoTypes w zakresie 01–20 hex: {value.supportedInfoTypes.map(pidHex).join(', ')||'brak'}.</Text>
   {identificationFields.map(field=>{const reading=value[field.key],values=identificationValues(reading);return <View key={field.key} style={s.listRow}>
    <Text style={s.body}>{field.label}{values?' · '+(field.key==='ecuName'?1:values.length):''}</Text>
    {values?values.map((item,index)=><Text selectable key={index} style={[s.body,{fontVariant:['tabular-nums']}]}>{field.key==='ecuName'?(index===0?'Skrót: ':'Opis: '):(index+1)+'. '}{item}</Text>):<Text style={s.muted}>{identificationStatus(reading)}</Text>}
    <Text style={s.fine}>09 {pidHex(field.infoType)} · zarejestrowano {new Date(reading.readAt).toLocaleTimeString('pl-PL')}</Text>
   </View>;})}
  </>}
  <Text style={s.fine}>To dane zgłoszone przez wybrany sterownik. CVN nie potwierdza oryginalności oprogramowania, naprawy ani sprawności pojazdu. Kolejność list zachowano; nie przypisujemy automatycznie jednego CVN do jednego CALID. VIN ma osobny odczyt.</Text>
 </View>;
}
