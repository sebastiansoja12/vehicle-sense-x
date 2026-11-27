import {useState} from 'react';
import {View,Text,TextInput,Switch} from 'react-native';
import Svg,{Path,Line,Circle} from 'react-native-svg';
import type {LiveHistorySample} from './live-history';
import {parameterDefinitions,parameterByPid,pidHex} from './parameters';
import {liveSeries,LIVE_HISTORY_LIMIT} from './live-history';
import {Button,Note,Stat,number} from '../ui';
import {styles as s,colors} from '../theme';

type Props={
 supportedPids:number[];selectedPids:number[];onSelection:(pids:number[])=>void;
 interval:number;onInterval:(seconds:number)=>void;live:boolean;onLive:(enabled:boolean)=>void;
 disabled:boolean;connected:boolean;history:LiveHistorySample[];
 onExport:()=>void;onReset:()=>void;
};
export function LiveDataPanel(p:Props) {
 const[picker,setPicker]=useState(false),[query,setQuery]=useState(''),[chartPid,setChartPid]=useState<number|null>(null);
 const available=parameterDefinitions.filter(d=>p.supportedPids.includes(d.pid));
 const q=query.trim().toLocaleLowerCase('pl');
 const shown=available.filter(d=>(d.label+' '+pidHex(d.pid)).toLocaleLowerCase('pl').includes(q));
 const plotted=p.selectedPids.includes(chartPid??-1)?chartPid:p.selectedPids[0];
 const definition=plotted==null?undefined:parameterByPid(plotted),series=liveSeries(p.history,plotted??-1),latest=p.history.at(-1);
 const format=(value:number|null)=>value===null?'—':number(value,definition?.decimals??1);
 return <View style={{gap:14,marginTop:14}}>
  <View style={s.between}><Text style={[s.body,{flex:1}]}>Live Data · {p.live?'odczyt aktywny':'wstrzymany'}</Text><Switch accessibilityLabel="Odczytuj wybrane parametry Live Data" value={p.live} disabled={p.disabled||!p.connected} onValueChange={p.onLive}/></View>
  <Text style={s.fine}>Przerwa po zakończeniu cyklu. Parametry odczytywane są kolejno; rzeczywiste tempo zależy od adaptera. Kody i pełny raport nie są odświeżane.</Text>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[2,5,10].map(seconds=><Button key={seconds} label={`Co ${seconds} s${p.interval===seconds?' · wybrano':''}`} secondary={p.interval!==seconds} disabled={p.disabled} onPress={()=>p.onInterval(seconds)}/>)}</View>
  <Button label={`${picker?'Zwiń':'Wybierz'} parametry · ${p.selectedPids.length}/8`} secondary disabled={p.disabled} onPress={()=>setPicker(v=>!v)}/>
  {picker&&<><TextInput accessibilityLabel="Szukaj parametru Live Data" placeholder="Nazwa lub PID" value={query} onChangeText={setQuery} maxLength={80} style={s.input}/>
   {shown.map(d=>{const selected=p.selectedPids.includes(d.pid);return <View key={d.pid} style={s.between}><View style={{flex:1}}><Text style={s.body}>{d.label}</Text><Text style={s.fine}>PID {pidHex(d.pid)} · {d.unit}</Text></View><Switch accessibilityLabel={`Live Data: ${d.label}, PID ${pidHex(d.pid)}`} value={selected} disabled={p.disabled||(!selected&&p.selectedPids.length>=8)} onValueChange={enabled=>p.onSelection(enabled?[...p.selectedPids,d.pid]:p.selectedPids.filter(pid=>pid!==d.pid))}/></View>;})}
   {available.length===0&&<Text style={s.muted}>ECU nie zgłosił obsługiwanych parametrów z katalogu.</Text>}
  </>}
  {p.selectedPids.length===0&&<Note>Nie wybrano parametrów ECU. Cykl odczyta wyłącznie napięcie adaptera ATRV.</Note>}
  {latest&&<><Text style={s.fine}>Ostatni cykl: {new Date(latest.timestamp).toLocaleString('pl-PL')}{latest.ecu?` · CAN ${latest.ecu.responseId}`:''} · {p.history.length}/{LIVE_HISTORY_LIMIT} cykli</Text>
   <View style={s.stats}>{p.selectedPids.map(pid=>{const d=parameterByPid(pid)!,m=latest.measurements?.find(v=>v.pid===pid);return <Stat key={pid} label={d.label} value={m?.value==null?'—':number(m.value,d.decimals)} unit={d.unit}/>;})}<Stat label="Napięcie adaptera ATRV" value={latest.parameters.voltageV===null?'—':number(latest.parameters.voltageV,1)} unit="V"/></View>
   {p.selectedPids.length>0&&<><Text style={s.label}>Parametr na wykresie</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{p.selectedPids.map(pid=><Button key={pid} label={`PID ${pidHex(pid)}${plotted===pid?' · wykres':''}`} secondary={plotted!==pid} onPress={()=>setChartPid(pid)}/>)}</View></>}
   {definition&&<><Text style={s.body}>{definition.label} · {definition.unit}</Text>
    {series.count>0?<View accessible accessibilityLabel={`Wykres: ${definition.label}. ${series.count} pomiarów. Minimum ${format(series.min)}, maksimum ${format(series.max)}. Ostatni ${format(series.current)}.`}>
     <Svg width="100%" height={120} viewBox="0 0 320 120"><Line x1={8} y1={112} x2={312} y2={112} stroke={colors.line}/>{series.segments.map((segment,i)=>segment.length===1?<Circle key={i} cx={8+segment[0].x*304} cy={8+segment[0].y*96} r={3} fill={colors.red}/>:<Path key={i} d={segment.map((point,j)=>`${j?'L':'M'}${8+point.x*304},${8+point.y*96}`).join(' ')} fill="none" stroke={colors.red} strokeWidth={2}/>)}</Svg>
     <View style={s.between}><Text style={s.fine}>{new Date(series.from!).toLocaleTimeString('pl-PL')}</Text><Text style={s.fine}>{new Date(series.to!).toLocaleTimeString('pl-PL')}</Text></View>
    </View>:<Text style={s.muted}>Brak dostępnych pomiarów dla wykresu.</Text>}
    <Text style={s.fine}>Min. {format(series.min)} · maks. {format(series.max)} · średnia {format(series.mean)} · ostatni {format(series.current)} {definition.unit}</Text>
   </>}
   <Text style={s.fine}>Przerwy oznaczają brak odczytu. — oznacza wartość nieznaną. Bufor sesji obejmuje ostatnie {LIVE_HISTORY_LIMIT} cykli i nie zapisuje się automatycznie w garażu.</Text>
   <Button label="Eksportuj sesję Live Data CSV" secondary disabled={p.disabled} onPress={p.onExport}/>
   <Button label="Wyczyść wykres sesji" secondary disabled={p.disabled||p.live} onPress={p.onReset}/>
  </>}
 </View>;
}
