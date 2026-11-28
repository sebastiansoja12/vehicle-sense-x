import {useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {DiagnosticSnapshot} from './obd/types';
import {parameterByPid,pidHex} from './obd/parameters';
import {number} from './ui';
import {parseReadiness} from './obd/readiness';
export function CockpitDetails({report}:{report:DiagnosticSnapshot|null}){
 const[expanded,setExpanded]=useState(false);const rows=report?.extended?.measurements??[];
 const readiness=report?.extended?.readiness??(report?.readiness?parseReadiness('41 01 '+report.readiness.statusBytes.map(value=>value.toString(16).padStart(2,'0')).join(' ')+'>'):null);
 const supported=readiness?.monitors.filter(value=>value.supported)??[];
 return <View style={s.panel}>
  <Text accessibilityRole="header" style={s.title}>Pełniejszy obraz sterownika</Text>
  <View style={s.summary}><View style={s.item}><Text style={s.number}>{report?report.supportedPids.length:'—'}</Text><Text style={s.fine}>zgłoszonych PID</Text></View><View style={s.item}><Text style={s.number}>{report?.extended?rows.length:'—'}</Text><Text style={s.fine}>pozycji skanu rozszerzonego</Text></View><View style={s.item}><Text style={s.number}>{readiness?`${supported.filter(value=>value.complete).length}/${supported.length}`:'—'}</Text><Text style={s.fine}>gotowych monitorów emisji</Text></View></View>
  <Text style={s.fine}>{report?`Pełny raport: ${new Date(report.timestamp).toLocaleString('pl-PL')}. ${report.source==='import'?'Import bez weryfikacji. ':''}Poniższe dane pochodzą z raportu, nie z cyklicznego Live.`:'Wykonaj skan, aby zobaczyć obsługiwane parametry i gotowość emisji.'}</Text>
  {readiness&&<Text style={s.fine}>Kontrolka MIL zgłoszona przez ECU: {readiness.milOn?'włączona':'wyłączona'}. Gotowość monitorów nie jest oceną sprawności całego pojazdu.</Text>}
  {rows.length>0?<><View style={s.rows}>{rows.slice(0,expanded?rows.length:6).map(row=>{const definition=parameterByPid(row.pid);return <View key={row.pid} style={s.row}><Text style={s.label}>{definition?.label??`PID ${pidHex(row.pid)}`}</Text><Text style={s.value}>{row.value===null?'Brak odczytu':`${number(row.value,definition?.decimals??1)} ${definition?.unit??''}`}</Text><Text style={s.fine}>{new Date(row.readAt).toLocaleTimeString('pl-PL')}</Text></View>;})}</View>{rows.length>6&&<Pressable accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={s.button}><Text style={s.label}>{expanded?'Zwiń parametry':`Pokaż wszystkie parametry (${rows.length})`}</Text></Pressable>}</>:<Text style={s.fine}>Skan rozszerzony odczytuje tylko pozycje wspierane przez ECU. Uruchom go przyciskiem „Skan rozszerzony”.</Text>}
 </View>;
}
const s=StyleSheet.create({panel:{marginTop:18,padding:22,gap:14,borderWidth:1,borderColor:'#304652',borderRadius:18,backgroundColor:'#172832'},title:{fontSize:16,fontWeight:'600',color:'#ecf0ed'},summary:{flexDirection:'row',flexWrap:'wrap',gap:12},item:{flexBasis:'28%',flexGrow:1,minWidth:90,gap:6,paddingVertical:12},number:{fontSize:28,color:'#d9eae5',fontVariant:['tabular-nums']},fine:{fontSize:11,lineHeight:18,color:'#a8b9bf'},rows:{flexDirection:'row',flexWrap:'wrap',gap:10},row:{flexBasis:'45%',flexGrow:1,minWidth:100,padding:12,gap:6,borderRadius:10,backgroundColor:'#11232d'},label:{fontSize:12,lineHeight:18,color:'#dce8e7'},value:{fontSize:21,fontWeight:'500',color:'#eef1ec',fontVariant:['tabular-nums']},button:{minHeight:44,paddingVertical:12,alignSelf:'flex-start'}});
