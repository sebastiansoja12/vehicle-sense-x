import {useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import Svg,{Circle,Line,Polyline} from 'react-native-svg';
import type {LiveParameters} from './obd/types';
import {buildCockpitTrend,cockpitMetrics} from './cockpit';
import {number} from './ui';

export function CockpitTrend({samples}:{samples:LiveParameters[]}){
 const[key,setKey]=useState<typeof cockpitMetrics[number]['key']>('rpm');
 const metric=cockpitMetrics.find(value=>value.key===key)!;
 const trend=buildCockpitTrend(samples,key);
 const clock=(timestamp:number)=>new Date(timestamp).toLocaleTimeString('pl-PL');
 const range=trend.min===null||trend.max===null?'Brak pomiarów':`${number(trend.min,metric.digits)}–${number(trend.max,metric.digits)} ${metric.unit}`;
 return <View style={s.panel}>
  <Text accessibilityRole="header" style={s.title}>Zmiany parametrów w tej sesji</Text>
  <View style={s.choices}>{cockpitMetrics.map(value=><Pressable key={value.key} accessibilityRole="button" accessibilityLabel={`Wykres: ${value.label}${key===value.key?' · wybrany':''}`} accessibilityState={{selected:key===value.key}} onPress={()=>setKey(value.key)} style={[s.choice,key===value.key&&s.selected]}><Text style={s.label}>{value.label}</Text></Pressable>)}</View>
  <Text style={s.range}>{range}</Text>
  {trend.count?<>
   <View accessible accessibilityRole="image" accessibilityLabel={`${metric.label}. ${trend.count} pomiarów. Zakres ${range}. Od ${clock(trend.start!)} do ${clock(trend.end!)}. Przerwy w linii oznaczają brak danych.`}>
    <Svg accessible={false} width="100%" height={130} viewBox="0 0 300 80" preserveAspectRatio="none">
     {[4,40,76].map(y=><Line key={y} x1={4} y1={y} x2={296} y2={y} stroke="#34434b" strokeWidth={.5}/>)}
     {trend.segments.map((segment,index)=><Polyline key={index} points={segment.map(point=>`${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')} stroke={metric.color} strokeWidth={1.5} strokeLinejoin="round" fill="none"/>)}
     {trend.segments.map((segment,index)=><Circle key={index} cx={segment.at(-1)!.x} cy={segment.at(-1)!.y} r={1.7} fill={metric.color}/>)}
    </Svg>
   </View>
   <View style={s.times}><Text style={s.fine}>{clock(trend.start!)}</Text><Text style={s.fine}>{trend.count} pomiarów</Text><Text style={s.fine}>{clock(trend.end!)}</Text></View>
  </>:<View style={s.empty}><Text style={s.fine}>Połącz adapter i włącz Live, aby zobaczyć zmiany tego parametru.</Text></View>}
  <Text style={s.fine}>Do 60 próbek w oknie zbierania do 5 minut, tylko w pamięci tej sesji. Po zatrzymaniu Live pozostają ostatnio zebrane próbki. Przerwy i brak odczytu przerywają linię. Zakres oznacza zaobserwowane wartości, nie normę sprawności. Zapis historii zachowuje pełny raport, bez wykresu Live.</Text>
 </View>;
}
const s=StyleSheet.create({
 panel:{marginTop:18,padding:22,gap:14,backgroundColor:'#17242b',borderWidth:1,borderColor:'#30404a',borderRadius:12},title:{fontSize:16,fontWeight:'600',color:'#eff0e8'},choices:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{minHeight:44,paddingVertical:12,paddingHorizontal:12,justifyContent:'center',borderWidth:1,borderColor:'#34434b',borderRadius:5},selected:{backgroundColor:'#30444c',borderColor:'#92c4b1'},label:{fontSize:12,color:'#edf0e9'},range:{fontSize:22,fontWeight:'500',color:'#f4f2ea',fontVariant:['tabular-nums']},fine:{fontSize:11,lineHeight:18,color:'#a8b7b9'},times:{flexDirection:'row',justifyContent:'space-between',gap:10},empty:{height:100,justifyContent:'center'},
});
