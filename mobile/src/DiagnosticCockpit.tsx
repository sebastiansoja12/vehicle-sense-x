import {useCallback,useEffect,useState} from 'react';
import {AccessibilityInfo,Animated,AppState,Pressable,ScrollView,StyleSheet,Text,useWindowDimensions,View} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import {CockpitVehicle} from './CockpitVehicle';
import type {VehicleSystem} from './CockpitVehicle';
import {CockpitIdentity} from './CockpitIdentity';
import {CockpitDetails} from './CockpitDetails';
import {useFocusEffect,useIsFocused} from 'expo-router';
import type {Vehicle} from './domain';
import type {DiagnosticSnapshot,LiveParameters} from './obd/types';
import {buildCockpit,cockpitMetrics} from './cockpit';
import {number} from './ui';
import {CockpitTrend} from './CockpitTrend';
import type {CanEcu} from './obd/can';

function useReducedMotion(){
 const [reduced,setReduced]=useState(true);
 useEffect(()=>{let mounted=true;const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduced(value);}).catch(()=>{});return()=>{mounted=false;subscription.remove();};},[]);
 return reduced;
}
const AnimatedPath=Animated.createAnimatedComponent(Path);
function Gauge({metric,value,reduced,selected}:{metric:typeof cockpitMetrics[number];value:number|null;reduced:boolean;selected:boolean}){
 const [progress]=useState(()=>new Animated.Value(0));
 const focused=useIsFocused();
 const ratio=value===null?0:Math.max(0,Math.min(1,(value-metric.min)/(metric.max-metric.min)));
 useEffect(()=>{progress.stopAnimation();if(reduced||!focused)progress.setValue(ratio);else Animated.timing(progress,{toValue:ratio,duration:450,useNativeDriver:false}).start();return()=>progress.stopAnimation();},[ratio,reduced,focused,progress]);
 const display=value===null?'Brak odczytu':`${number(value,metric.digits)} ${metric.unit}`;
 return <View style={[c.gauge,selected&&{borderColor:metric.color}]} accessible accessibilityRole="progressbar" accessibilityLabel={metric.label} accessibilityValue={{min:0,max:100,...(value===null?{}:{now:Math.round(ratio*100)}),text:display}}>
  <Text style={c.label}>{metric.label}</Text><Svg accessible={false} width="100%" height={78} viewBox="0 0 120 70"><Path d="M10 60 A50 50 0 0 1 110 60" stroke="#344854" strokeWidth={7} fill="none" strokeLinecap="round"/><AnimatedPath d="M10 60 A50 50 0 0 1 110 60" stroke={value===null?'#344854':metric.color} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="157.08 157.08" strokeDashoffset={progress.interpolate({inputRange:[0,1],outputRange:[157.08,0]})}/></Svg><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.55} style={c.value}>{value===null?'—':number(value,metric.digits)}<Text style={c.unit}> {metric.unit}</Text></Text>
  <View style={c.track}><Animated.View style={[c.bar,{backgroundColor:metric.color,width:progress.interpolate({inputRange:[0,1],outputRange:['0%','100%']})}]}/></View>
  <Text style={c.fine}>Skala {metric.min}–{metric.max} {metric.unit}</Text>
 </View>;
}
function Action({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[c.action,(disabled||pressed)&&{opacity:.45}]}><Text style={c.actionText}>{label}</Text></Pressable>;}

type CockpitProps={
 vehicle:Vehicle;saved:DiagnosticSnapshot[];session?:DiagnosticSnapshot|null;live?:LiveParameters|null;connected?:boolean;streaming?:boolean;busy?:boolean;error?:string;message?:string;
 onClose:()=>void;onRefresh?:()=>void;onStreaming?:(enabled:boolean)=>void;
 onCancel?:()=>void;liveInterval?:number;onReadVin?:()=>void;canReadVin?:boolean;onExtended?:()=>void;
 samples?:LiveParameters[];onSave?:()=>void;savedInHistory?:boolean;saving?:boolean;
 adapter?:{label:string;ecus:CanEcu[];selectedEcu:string|null;onConnect:()=>void;onDisconnect:()=>void;onConfigure:()=>void;onSelectEcu:(responseId:string)=>void};
};
export function DiagnosticCockpit({vehicle,saved,session=null,live=null,connected=false,streaming=false,busy=false,error='',message='',onClose,onRefresh,onStreaming,samples,onSave,savedInHistory=false,saving=false,adapter,onCancel,liveInterval=5,onReadVin,canReadVin=false,onExtended}:CockpitProps){
 const {width}=useWindowDimensions();const reduced=useReducedMotion();const focused=useIsFocused();const[foreground,setForeground]=useState(AppState.currentState!=='background'&&AppState.currentState!=='inactive');const[selected,setSelected]=useState<VehicleSystem>('rpm');const[now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const subscription=AppState.addEventListener('change',state=>setForeground(state==='active'));return()=>subscription.remove();},[]);
 useFocusEffect(useCallback(()=>{setNow(Date.now());if(!connected)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[connected]));
 const view=buildCockpit(vehicle.id,{saved,session,live,connected,streaming},now);
 const still=reduced||!focused||!foreground;
 const source={none:'Brak odczytu',live:'Live · OBD2',session:'Odczyt w tej sesji',saved:'Zapisany odczyt',import:'Import · bez weryfikacji'}[view.source];
 return <ScrollView style={c.screen} contentContainerStyle={[c.content,width>=900&&{paddingHorizontal:32}]}>
  <View style={c.top}><View style={{flex:1}}><Text style={c.kicker}>VEHICLESENSEX / KOKPIT</Text><Text accessibilityRole="header" style={c.title}>Samochód pod lupą.</Text></View><Action label="Diagnostyka" onPress={onClose}/></View>
  <View style={c.statusRow}><View style={[c.dot,{backgroundColor:view.source==='live'?'#92c4b1':'#d6b77e'}]}/><Text style={c.status}>{source}</Text><Text style={c.fine}>{connected?'Adapter połączony':'Brak aktywnego połączenia'}</Text></View>
  {error!==''&&<Text accessibilityRole="alert" style={c.notice}>{error}</Text>}
  {message!==''&&<Text accessibilityLiveRegion="polite" style={c.fine}>{message}</Text>}
  {adapter&&<View style={c.connection}>
   <Text style={c.label}>{adapter.label}</Text>
   <View style={c.controls}>{connected?<Action label="Rozłącz adapter" disabled={busy} onPress={adapter.onDisconnect}/>:<Action label={busy?'Łączenie…':'Połącz adapter'} disabled={busy} onPress={adapter.onConnect}/>}<Action label="Konfiguracja adaptera" disabled={busy} onPress={adapter.onConfigure}/></View>
   {connected&&adapter.ecus.length>1&&<><Text style={c.fine}>Wybierz sterownik, który odpowiedział. Każdy jest osobnym źródłem odczytu.</Text><View style={c.controls}>{adapter.ecus.map(ecu=><Action key={ecu.responseId} label={`CAN ${ecu.responseId}${adapter.selectedEcu===ecu.responseId?' · wybrany':''}`} disabled={busy||adapter.selectedEcu===ecu.responseId} onPress={()=>adapter.onSelectEcu(ecu.responseId)}/>)}</View></>}
  </View>}
  <View style={[c.main,width>=900&&{flexDirection:'row'}]}>
   <View style={[c.vehicle,width>=900&&{flex:1}]}>
    <Text style={c.kicker}>AUTO WYBRANE W GARAŻU</Text><Text style={c.make}>{vehicle.make}</Text><Text style={c.model}>{vehicle.model}</Text><Text style={c.subtitle}>{vehicle.year} · {vehicle.engine}</Text>
    <CockpitVehicle active={view.source==='live'} busy={busy} reduced={still} selected={selected} onSelect={setSelected}/>
    <View style={c.vehicleFoot}><Text style={c.label}>Zapisany przebieg</Text><Text style={c.subtitle}>{number(vehicle.mileage)} km</Text></View>
    <Text style={c.fine}>Profil i zdjęcie wybierasz w garażu. Same odczyty parametrów nie potwierdzają tożsamości podłączonego auta — porównaj VIN.</Text>
   </View>
   <View style={[c.measurements,width>=900&&{flex:1.15}]}>{cockpitMetrics.map(metric=><Gauge key={metric.key} metric={metric} value={view.parameters[metric.key]} reduced={still} selected={selected===metric.key}/>)}</View>
  </View>
  <View style={c.focusPanel}><Text style={c.label}>{{rpm:'Silnik · obroty',coolantC:'Chłodzenie · temperatura płynu',voltageV:'Zasilanie · napięcie adaptera',faults:'Kody z pełnego raportu ECU'}[selected]}</Text><Text style={c.subtitle}>{selected==='faults'?(view.faults?`${view.faults.count} kodów · ${view.faults.partial?'odczyt częściowy':'trzy statusy odczytane'}`:'Brak pełnego odczytu kodów'):view.parameters[selected]===null?'Ten parametr nie został odczytany.':`${number(view.parameters[selected]!,selected==='voltageV'?1:0)} ${cockpitMetrics.find(metric=>metric.key===selected)?.unit}`}</Text><Text style={c.fine}>{selected==='voltageV'?'Napięcie mierzy adapter; to nie jest test akumulatora.':selected==='faults'?'Brak kodów nie potwierdza sprawności wszystkich układów.':'Wartość dotyczy wybranego źródła. Schemat nie pokazuje faktycznego położenia części.'}</Text></View>
  {samples&&<CockpitTrend samples={samples}/>}
  <CockpitDetails report={view.report}/>
  <CockpitIdentity key={`${vehicle.id}:${vehicle.make}:${vehicle.model}:${vehicle.year}`} vehicle={vehicle} onReadVin={onReadVin} canReadVin={canReadVin} busy={busy}/>

  <View style={c.report}>
   <View style={c.reportTop}><Text accessibilityRole="header" style={c.reportTitle}>Diagnostyka sterownika</Text><Text style={c.scope}>{view.scope}</Text></View>
   <Text style={c.subtitle}>{view.timestamp===null?'Brak pomiarów. Połącz adapter na ekranie diagnostyki.':`Parametry: ${new Date(view.timestamp).toLocaleString('pl-PL')}${view.source!=='live'?' · nie są danymi Live':''}`}</Text>
   {view.source==='session'&&view.stale&&<Text style={c.notice}>Brak świeżych danych Live. Pokazano ostatni otrzymany pomiar.</Text>}
   <Text style={c.faultCount}>{view.faults===null?'—':view.faults.count}<Text style={c.unit}> kodów w odczytanych statusach</Text></Text>
   {view.faults&&<><Text style={c.fine}>Kody z pełnego odczytu: {new Date(view.faults.timestamp).toLocaleString('pl-PL')}. {view.faults.partial?'Odczyt częściowy — pozostałe statusy nieznane.':'Sprawdzono statusy zapisane, oczekujące i trwałe.'}</Text><View style={c.codes}>{view.faults.codes.slice(0,8).map((code,index)=><Text key={`${code.code}-${code.status}-${index}`} style={c.code}>{code.code} · {{stored:'zapisany',pending:'oczekujący',permanent:'trwały'}[code.status]}</Text>)}</View>{view.faults.count===0&&<Text style={c.fine}>Brak kodów w odczytanych statusach nie potwierdza sprawności całego auta.</Text>}</>}
   <View style={c.controls}>{busy&&onCancel&&<Action label="Przerwij odczyt i rozłącz adapter" onPress={onCancel}/>} {onExtended&&<Action label="Skan rozszerzony" disabled={busy||!connected||!!adapter&&adapter.ecus.length>1&&!adapter.selectedEcu} onPress={onExtended}/>} {onRefresh&&<Action label={busy?'Odczytywanie…':'Odczytaj ponownie'} disabled={busy||!connected||!!adapter&&adapter.ecus.length>1&&!adapter.selectedEcu} onPress={onRefresh}/>} {onStreaming&&<Action label={`Live co ${liveInterval} s · ${streaming?'włączone':'wyłączone'}`} disabled={busy||!connected||!session} onPress={()=>onStreaming(!streaming)}/>} {onSave&&<Action label={savedInHistory?'Odczyt jest w historii':saving?'Zapisywanie…':'Zapisz pełny odczyt'} disabled={busy||saving||!session||savedInHistory} onPress={onSave}/>}</View>
  </View>
  <Text style={[c.fine,{marginTop:20}]}>Animowany kokpit jest ekranem aplikacji na telefonie, tablecie lub samodzielnym radiu Android. Nie jest projekcją Android Auto ani ekranem CarPlay. Widok CarPlay korzysta z osobnej listy systemowej i wymaga zatwierdzonej konfiguracji Apple. Skale wykresów nie są progami oceny sprawności pojazdu.</Text>
 </ScrollView>;
}

const c=StyleSheet.create({
 screen:{flex:1,backgroundColor:'#111a20'},content:{padding:16,paddingBottom:36,width:'100%',maxWidth:1440,alignSelf:'center'},
 top:{flexDirection:'row',alignItems:'center',gap:20,marginBottom:22},kicker:{fontSize:10,letterSpacing:1.7,color:'#9ba9ad',marginBottom:12},title:{fontSize:26,fontWeight:'500',letterSpacing:-.8,color:'#f2f1e9'},
 statusRow:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:22},dot:{width:7,height:7,borderRadius:4},status:{fontSize:12,fontWeight:'600',color:'#ecede6'},
 connection:{padding:16,gap:12,borderWidth:1,borderColor:'#30404a',borderRadius:8,marginBottom:18},main:{gap:18},vehicle:{backgroundColor:'#182a35',borderWidth:1,borderColor:'#2b3b44',borderRadius:18,padding:22,gap:8},make:{fontSize:16,color:'#c9d0cf'},model:{fontSize:42,fontWeight:'600',letterSpacing:-1.4,color:'#fff'},subtitle:{fontSize:13,lineHeight:21,color:'#d1d8d7'},
 photo:{height:235,width:'100%',marginVertical:12},noPhoto:{minHeight:235,alignItems:'center',justifyContent:'center',gap:12,padding:14},vehicleFoot:{flexDirection:'row',justifyContent:'space-between',gap:12,borderTopWidth:1,borderColor:'#32424a',paddingTop:16,marginTop:10,marginBottom:10},
 measurements:{flexDirection:'row',flexWrap:'wrap',gap:12},gauge:{flexGrow:1,flexBasis:'45%',minWidth:100,backgroundColor:'#1b2a32',borderWidth:1,borderColor:'#30404a',borderRadius:18,padding:14,gap:9,minHeight:220},label:{fontSize:12,lineHeight:18,color:'#c5cfce'},value:{fontSize:36,fontWeight:'500',letterSpacing:-1.2,color:'#f4f2ea',fontVariant:['tabular-nums']},unit:{fontSize:12,fontWeight:'400',letterSpacing:0,color:'#bdc8c6'},track:{height:5,backgroundColor:'#34434b',borderRadius:4,overflow:'hidden'},bar:{height:5,borderRadius:4},fine:{fontSize:11,lineHeight:18,color:'#a8b7b9'},
 report:{marginTop:18,padding:22,borderRadius:18,borderWidth:1,borderColor:'#30404a',backgroundColor:'#17242b',gap:12},reportTop:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:12},reportTitle:{fontSize:16,fontWeight:'600',color:'#eff0e8'},scope:{fontSize:11,lineHeight:18,color:'#b9c8c7'},focusPanel:{marginTop:18,padding:18,gap:7,borderWidth:1,borderColor:'#3b5360',borderRadius:14,backgroundColor:'#203540'},faultCount:{fontSize:36,fontWeight:'500',color:'#f4f2ea'},codes:{flexDirection:'row',flexWrap:'wrap',gap:10},code:{fontSize:12,color:'#edd4b0',paddingVertical:8,paddingHorizontal:10,backgroundColor:'#2a3439',borderRadius:4},notice:{fontSize:12,lineHeight:18,color:'#e5c58c'},controls:{flexDirection:'row',flexWrap:'wrap',gap:12},action:{minHeight:48,paddingHorizontal:16,paddingVertical:12,justifyContent:'center',borderWidth:1,borderColor:'#53666e',borderRadius:5,backgroundColor:'#233640'},actionText:{fontSize:12,lineHeight:18,color:'#f1f1e9',textAlign:'center'},
});
