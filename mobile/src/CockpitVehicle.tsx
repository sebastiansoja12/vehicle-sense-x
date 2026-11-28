import {useEffect,useState} from 'react';
import {Animated,Easing,Pressable,StyleSheet,Text,View} from 'react-native';
import Svg,{Circle,Defs,Ellipse,G,Line,LinearGradient,Path,Stop} from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
export type VehicleSystem='rpm'|'coolantC'|'voltageV'|'faults';
const systems=[{key:'rpm',label:'Silnik',icon:'speedometer-outline',x:458,y:142,color:'#f49b7c'},{key:'coolantC',label:'Chłodzenie',icon:'thermometer-outline',x:534,y:161,color:'#7dcddd'},{key:'voltageV',label:'Zasilanie',icon:'flash-outline',x:374,y:151,color:'#b4d2a0'},{key:'faults',label:'Kody ECU',icon:'hardware-chip-outline',x:255,y:144,color:'#e6ca86'}] as const;
export function CockpitVehicle({active,busy,reduced,selected,onSelect}:{active:boolean;busy:boolean;reduced:boolean;selected:VehicleSystem;onSelect:(system:VehicleSystem)=>void}){
 const [pulse]=useState(()=>new Animated.Value(0)),[scan]=useState(()=>new Animated.Value(0));const[width,setWidth]=useState(300),[preview,setPreview]=useState(false);
 const demo=preview&&!active&&!busy;const motion=!reduced&&(active||demo);
 useEffect(()=>{pulse.setValue(0);if(!motion)return;const animation=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1,duration:850,easing:Easing.inOut(Easing.ease),useNativeDriver:true,isInteraction:false}),Animated.timing(pulse,{toValue:0,duration:850,useNativeDriver:true,isInteraction:false})]));animation.start();return()=>animation.stop();},[motion,pulse]);
 useEffect(()=>{scan.setValue(0);if(!busy||reduced)return;const animation=Animated.loop(Animated.timing(scan,{toValue:1,duration:2200,easing:Easing.linear,useNativeDriver:true,isInteraction:false}));animation.start();return()=>animation.stop();},[busy,reduced,scan]);
 return <View style={s.panel}>
  <View style={s.heading}><Text style={s.kicker}>MAPA ODCZYTÓW</Text><Text style={[s.badge,demo&&{color:'#e6ca86'}]}>{demo?'Podgląd animacji · bez danych OBD':active?'Animacja · świeże Live':busy?'Trwa odczyt OBD':'Schemat poglądowy'}</Text></View>
  <View style={s.stage} onLayout={event=>setWidth(event.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
   <Svg accessible={false} width="100%" height={Math.max(125,Math.min(220,width*.4375))} viewBox="0 0 640 280">
    <Defs><LinearGradient id="body" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#c5d1d5"/><Stop offset=".46" stopColor="#80979f"/><Stop offset=".53" stopColor="#4b6772"/><Stop offset="1" stopColor="#243e4b"/></LinearGradient><LinearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#203e4c"/><Stop offset="1" stopColor="#0d202b"/></LinearGradient></Defs>
    {[70,130,190,250].map(y=><Line key={y} x1={28} y1={y} x2={612} y2={y} stroke="#253a45" strokeWidth={.7}/>)}
    {[80,160,240,320,400,480,560].map(x=><Line key={x} x1={x} y1={40} x2={x-35} y2={260} stroke="#253a45" strokeWidth={.7}/>)}
    <Ellipse cx={327} cy={226} rx={254} ry={16} fill="#080f16" opacity={.8}/>
    <Path d="M73 181 L84 148 Q87 137 114 131 L166 122 L222 76 Q237 66 263 66 L352 66 Q379 67 406 91 L444 123 L517 137 Q548 144 566 171 L571 197 Q563 210 535 211 L100 211 Q76 207 73 181Z" fill="url(#body)" stroke="#9bb0b7" strokeWidth={1.3}/>
    <Path d="M184 122 L232 84 Q245 76 266 76 L350 76 Q367 76 391 96 L421 122Z" fill="url(#glass)" stroke="#b5c7cb" strokeWidth={1}/>
    <Path d="M294 78 L298 122 M359 80 L373 122" stroke="#718b96" strokeWidth={5}/>
    <Path d="M102 146 Q282 126 529 153 M104 181 L530 183 M194 134 L191 186 M365 133 L379 187" fill="none" stroke="#a3b7bd" strokeWidth={1} opacity={.5}/>
    <Path d="M101 196 L536 196" stroke="#0d222d" strokeWidth={8}/>
    {[177,478].map(x=><G key={x}><Circle cx={x} cy={199} r={35} fill="#0a141b" stroke="#415965" strokeWidth={3}/><Circle cx={x} cy={199} r={23} fill="#8398a1"/><Circle cx={x} cy={199} r={17} fill="#263e4b"/>{[0,60,120].map(angle=><Line key={angle} x1={x} y1={179} x2={x} y2={219} rotation={angle} origin={`${x},199`} stroke="#a2b4bc" strokeWidth={4}/>)}<Circle cx={x} cy={199} r={6} fill="#bdcbd0"/></G>)}
    <Path d="M541 155 L558 166 L559 176 L532 170Z" fill="#ecddbd"/><Path d="M83 151 L99 147 L95 163 L80 165Z" fill="#c97564"/><Path d="M433 125 L441 114 L455 116 L459 127Z" fill="#5c7d8c"/>
    <Path d="M255 144 L374 151 L458 142 L534 161" fill="none" stroke="#9ab9bd" strokeDasharray="4 7" opacity={.65}/>
    {systems.map(system=><G key={system.key}><Circle cx={system.x} cy={system.y} r={selected===system.key?17:12} fill="#0c1b25" stroke={system.color} strokeWidth={selected===system.key?2:1}/><Circle cx={system.x} cy={system.y} r={4} fill={system.color}/></G>)}
   </Svg>
   {(active||demo)&&<Animated.View style={[s.engineGlow,{opacity:pulse.interpolate({inputRange:[0,1],outputRange:[.2,.65]}),transform:[{scale:pulse.interpolate({inputRange:[0,1],outputRange:[1,1.7]})}]}]}/>}
   {busy&&!reduced&&<Animated.View style={[s.scan,{transform:[{translateX:scan.interpolate({inputRange:[0,1],outputRange:[-90,width+90]})}]}]}/>}
  </View>
  <View style={s.systems}>{systems.map(system=><Pressable key={system.key} accessibilityRole="button" accessibilityState={{selected:selected===system.key}} accessibilityLabel={`Pokaż: ${system.label}`} onPress={()=>onSelect(system.key)} style={[s.system,selected===system.key&&{borderColor:system.color,backgroundColor:'#263c48'}]}><Ionicons accessible={false} name={system.icon} color={system.color} size={17}/><Text style={s.systemText}>{system.label}</Text></Pressable>)}</View>
  <Text style={s.fine}>Schemat ogólny; położenie podzespołów jest umowne. Puls oznacza napływ danych, nie ruch auta ani pracę konkretnej części.</Text>
  {!active&&!busy&&<Pressable accessibilityRole="button" accessibilityState={{selected:demo,disabled:reduced}} disabled={reduced} onPress={()=>setPreview(!preview)} style={s.preview}><Ionicons accessible={false} name={demo?'pause-circle-outline':'play-circle-outline'} size={19} color="#b9cbd0"/><Text style={s.fine}>{reduced?'Ograniczenie animacji jest włączone':demo?'Zatrzymaj podgląd animacji':'Podgląd animacji'}</Text></Pressable>}
 </View>;
}
const s=StyleSheet.create({panel:{gap:14,marginTop:18,padding:12,borderRadius:18,backgroundColor:'#142530',borderWidth:1,borderColor:'#2a404c'},heading:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8},kicker:{fontSize:10,letterSpacing:1.6,color:'#b9cbd0'},badge:{fontSize:10,color:'#9fb8ba'},stage:{position:'relative',overflow:'hidden',minHeight:125},engineGlow:{position:'absolute',width:32,height:32,borderRadius:16,backgroundColor:'#f49b7c',left:'69%',top:'44%'},scan:{position:'absolute',top:0,bottom:0,left:0,width:3,backgroundColor:'#a6d3cd',opacity:.4},systems:{flexDirection:'row',flexWrap:'wrap',gap:8},system:{minHeight:44,flexBasis:'45%',flexGrow:1,borderWidth:1,borderColor:'#304754',borderRadius:10,padding:10,flexDirection:'row',alignItems:'center',gap:9},systemText:{fontSize:12,color:'#e8efed'},fine:{fontSize:11,lineHeight:18,color:'#a8b9be'},preview:{alignSelf:'flex-start',minHeight:44,flexDirection:'row',alignItems:'center',gap:8}});
