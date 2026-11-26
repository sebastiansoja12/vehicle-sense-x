import {useState} from 'react';
import {View,Text,TextInput,Pressable} from 'react-native';
import {chooseCatalogMake,chooseCatalogModel,initialCatalogMode,searchMakes,searchModels} from './vehicle-catalog';
import {CatalogNotices} from './CatalogNotices';
import {styles as s,colors} from './theme';

type Identity={make:string;model:string};
export function VehicleIdentityFields({value,onChange,disabled=false}:{value:Identity;onChange:(value:Identity)=>void;disabled?:boolean}){
 const [manual,setManual]=useState(()=>initialCatalogMode(value.make,value.model)==='manual');
 const [active,setActive]=useState<'make'|'model'|null>(null),[query,setQuery]=useState(''),[notices,setNotices]=useState(false);
 const hasModels=searchModels(value.make,'',1).total>0;
 function open(field:'make'|'model'){setActive(active===field?null:field);setQuery('');}
 function select(name:string){onChange(active==='make'?chooseCatalogMake(value,name):chooseCatalogModel(value,name));setActive(null);setQuery('');}
 function choices(field:'make'|'model'){
  if(active!==field)return null;
  const result=field==='make'?searchMakes(query,8):searchModels(value.make,query,8);
  return <View style={{marginTop:8,borderWidth:1,borderColor:colors.line,padding:12,backgroundColor:'#fff'}}>
   <TextInput accessibilityLabel={field==='make'?'Szukaj marki':'Szukaj modelu'} placeholder={field==='make'?'Np. Škoda, Toyota, VW':'Wpisz nazwę modelu'} value={query} onChangeText={setQuery} editable={!disabled} autoCorrect={false} autoCapitalize="none" maxLength={80} style={s.input}/>
   <Text accessibilityLiveRegion="polite" style={[s.fine,{marginTop:10}]}>{result.total===0?'Brak wyników. Możesz wpisać samochód ręcznie.':`Wyniki: ${result.total}${result.total>result.items.length?`. Pokazano ${result.items.length} — doprecyzuj wyszukiwanie.`:'.'}`}</Text>
   {result.items.map(name=><Pressable key={name} accessibilityRole="button" accessibilityLabel={`Wybierz ${name}`} disabled={disabled} accessibilityState={{selected:name===(field==='make'?value.make:value.model),disabled}} onPress={()=>select(name)} style={({pressed})=>({minHeight:46,justifyContent:'center',borderBottomWidth:1,borderBottomColor:colors.line,opacity:pressed?0.5:1})}><Text style={s.body}>{name}</Text></Pressable>)}
   <Pressable accessibilityRole="button" disabled={disabled} onPress={()=>setActive(null)} style={s.link}><Text style={s.linkText}>Zamknij listę</Text></Pressable>
  </View>;
 }
 function selector(field:'make'|'model',label:string,blocked=false){return <View style={s.field}><Text style={s.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Wybierz ${field==='make'?'markę':'model'}${value[field]?`. Wybrano: ${value[field]}`:''}`} accessibilityState={{expanded:active===field,disabled:disabled||blocked}} disabled={disabled||blocked} onPress={()=>open(field)} style={[s.input,s.between,(disabled||blocked)&&s.disabled]}><Text style={[s.body,{flex:1}]}>{value[field]||`Wybierz ${field==='make'?'markę':'model'}`}</Text><Text style={s.muted}>{active===field?'−':'⌄'}</Text></Pressable>{blocked&&<Text style={s.fine}>Najpierw wybierz markę z katalogu.</Text>}{choices(field)}</View>;}
 return <View>
  {manual?<>{(['make','model'] as const).map(field=><View key={field} style={s.field}><Text style={s.label}>{field==='make'?'Marka':'Model'}</Text><TextInput accessibilityLabel={field==='make'?'Marka':'Model'} value={value[field]} onChangeText={text=>onChange({...value,[field]:text})} editable={!disabled} autoCorrect={false} maxLength={field==='make'?60:80} style={s.input}/></View>)}</>:<>{selector('make','Marka')}{selector('model','Model',!hasModels)}</>}
  <Pressable accessibilityRole="button" disabled={disabled} onPress={()=>{setManual(!manual);setActive(null);setQuery('');}} style={[s.link,{marginBottom:8}]}><Text style={[s.linkText,{textDecorationLine:'underline'}]}>{manual?'Wybierz samochód z katalogu':'Nie ma mojego auta — wpisz ręcznie'}</Text></Pressable>
  <Text style={[s.fine,{marginBottom:4}]}>{manual?'Własny wpis zostanie zapisany bez dopasowywania do katalogu.':'Wybór działa bez internetu. Rocznik i dane techniczne uzupełnij zgodnie z dokumentami auta.'}</Text>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:notices}} disabled={disabled} onPress={()=>setNotices(!notices)} style={[s.link,{marginBottom:12}]}><Text style={s.linkText}>Źródła katalogu i licencje {notices?'−':'+'}</Text></Pressable>
  {notices&&<CatalogNotices/>}
 </View>;
}
