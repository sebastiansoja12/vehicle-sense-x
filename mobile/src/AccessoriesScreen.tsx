import {useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {router} from 'expo-router';
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useApp} from './AppProvider';
import type {Vehicle} from './domain';
import {accessoryBrands,accessoryCategories,accessorySearchUrl,recommendAccessories} from './accessories';
import type {AccessoryCategory} from './accessories';
import {Button,Empty,Note,Page,Section,Title,displayDate} from './ui';
import {colors,styles as s} from './theme';

const icons={protection:'shield-checkmark-outline',transport:'bicycle-outline',comfort:'briefcase-outline',care:'sparkles-outline'} as const;
const categories=Object.keys(accessoryCategories) as AccessoryCategory[];

function VehicleAccessories({vehicle}:{vehicle:Vehicle}){
 const [category,setCategory]=useState<AccessoryCategory>('all');
 const [query,setQuery]=useState('');
 const [failedUrl,setFailedUrl]=useState('');
 const {brand,items}=recommendAccessories(vehicle.make,category,query);
 const catalog=brand?.catalog;

 async function openSource(url:string){
  setFailedUrl('');
  try{await Linking.openURL(url);}
  catch{setFailedUrl(url);}
 }

 return <Page>
  <Button label="Garaż" secondary onPress={()=>router.navigate('/garage')}/>
  <View style={a.hero}>
   <View style={a.heroTop}>
    <Text style={[s.kicker,{flex:1,marginBottom:0}]}>WIĘCEJ Z TWOJEGO SAMOCHODU</Text>
    <Ionicons name="bag-handle-outline" size={28} color={colors.red}/>
   </View>
   <Title title="Polecane akcesoria" subtitle={`${vehicle.make} ${vehicle.model} · ${vehicle.year}`}/>
   <Text style={s.body}>Małe dodatki, wygodniejsza codzienność. Zacznij od ochrony wnętrza, a resztę dobierz do swoich podróży.</Text>
   <View style={a.badges}>
    <Text style={a.badge}>{accessoryBrands.length} marek + wpis ręczny</Text>
    <Text style={a.badge}>Dostępne offline</Text>
   </View>
  </View>

  <Note>Dobór według marki, nie potwierdzenie zgodności. Przed zakupem sprawdź model, generację, rocznik, nadwozie i wymagane mocowania.</Note>

  <Section title="Znajdź coś dla siebie">
   <Text style={[s.muted,{marginTop:10,marginBottom:16}]}>Propozycje dla marki {brand?.name??vehicle.make}. Oferty wyszukasz dla modelu {vehicle.model} z rocznika {vehicle.year}. To wybór rodzajów akcesoriów, a nie lista potwierdzonych części.</Text>
   <Text style={[s.fine,{marginBottom:16}]}>Po kliknięciu „Szukaj ofert” do Allegro trafią marka, model, rocznik i nazwa akcesorium. Oferty otwierają się poza aplikacją.</Text>
   <Text style={s.label}>Szukaj akcesoriów</Text>
   <TextInput accessibilityLabel="Szukaj akcesoriów" placeholder="np. mata, rowery, bagażnik" placeholderTextColor={colors.muted} style={s.input} value={query} onChangeText={setQuery} maxLength={100} autoCorrect={false} returnKeyType="search"/>
   <View style={a.filters}>
    {categories.map(value=><Pressable key={value} accessibilityRole="button" accessibilityLabel={`Kategoria: ${accessoryCategories[value]}`} accessibilityState={{selected:category===value}} onPress={()=>setCategory(value)} style={[a.filter,category===value&&a.filterSelected]}>
     <Text style={[a.filterText,category===value&&{color:'#fff'}]}>{accessoryCategories[value]}</Text>
    </Pressable>)}
   </View>
   <Text accessibilityLiveRegion="polite" style={s.fine}>Wyniki: {items.length} · {brand?.name??vehicle.make}</Text>
   {items.length===0?<Empty title="Brak pasujących akcesoriów" description="Zmień kategorię lub skróć wyszukiwane hasło." action={<Button label="Wyczyść filtry" secondary onPress={()=>{setQuery('');setCategory('all');}}/>}/>:items.map(item=><View key={item.id} style={a.card}>
    <View style={s.row}>
     <View style={a.icon}><Ionicons name={icons[item.category]} size={23} color={colors.red}/></View>
     <View style={{flex:1,gap:5}}><Text style={s.fine}>{accessoryCategories[item.category]}</Text><Text accessibilityRole="header" style={s.sectionTitle}>{item.title}</Text></View>
    </View>
    <Text style={s.body}>{item.reason}</Text>
    <View style={a.check}><Text style={[s.fine,{fontWeight:'600',color:colors.ink}]}>PRZED ZAKUPEM</Text><Text style={s.muted}>{item.check}</Text></View>
    <Button label="Szukaj ofert na Allegro ↗" onPress={()=>void openSource(accessorySearchUrl(vehicle,item))}/>
    {catalog&&<Button label={`Katalog producenta · ${item.source?.label??brand?.name} ↗`} secondary onPress={()=>void openSource(item.source?.url??catalog.url)}/>}
   </View>)}
   {failedUrl!==''&&<View style={a.error}><Text accessibilityRole="alert" style={s.error}>Nie udało się otworzyć strony. Spróbuj ponownie lub skopiuj adres do przeglądarki.</Text><Text selectable style={s.muted}>{failedUrl}</Text><Button label="Ponów otwarcie strony" secondary onPress={()=>void openSource(failedUrl)}/></View>}
  </Section>

  <Section title="Skąd pochodzą rekomendacje?">
   <Text style={[s.muted,{marginTop:14}]}>Rekomendacje VehicleSenseX obejmują wszystkie marki katalogu garażu oraz marki wpisane ręcznie. Dla każdej dostępne są cztery kategorie i wyszukiwanie ofert. Dostępność produktów i zgodność z konkretną wersją auta sprawdź u sprzedawcy; dla rzadkich modeli wyniki mogą być puste.</Text>
   {catalog&&<Text style={[s.muted,{marginTop:14}]}>Dodatkowe źródło: oficjalny katalog {brand?.name}. Sprawdzono {displayDate(catalog.checkedOn)}. Linki prowadzą do katalogu marki lub opisu systemu; wybierz tam swój model i wersję.</Text>}
   <Text style={[s.fine,{marginTop:12}]}>Lista działa bez internetu. Strony producentów i wyszukiwarka ofert wymagają połączenia i otwierają się dopiero po naciśnięciu przycisku. Nie wysyłamy VIN, tablic, historii ani notatek.</Text>
   <View style={{marginTop:16,gap:12}}><Button label={`Wszystkie akcesoria · ${brand?.name??vehicle.make} ↗`} secondary onPress={()=>void openSource(accessorySearchUrl(vehicle))}/>{catalog&&<Button label={`Otwórz katalog ${brand?.name} ↗`} secondary onPress={()=>void openSource(catalog.url)}/>}</View>
  </Section>
 </Page>;
}

export function AccessoriesScreen(){
 const app=useApp();
 const vehicle=app.data.vehicles.find(item=>item.id===app.data.activeVehicleId);
 if(!vehicle)return <Page><Button label="Garaż" secondary onPress={()=>router.navigate('/garage')}/><View style={{height:22}}/><Title title="Polecane akcesoria"/><Empty title="Najpierw wybierz samochód" description="Dodaj auto w garażu, aby zobaczyć propozycje dla jego marki." action={<Button label="Dodaj samochód" disabled={app.busy} onPress={()=>app.openForm('vehicle')}/>}/></Page>;
 return <VehicleAccessories key={`${vehicle.id}-${vehicle.make}`} vehicle={vehicle}/>;
}

const a=StyleSheet.create({
 hero:{paddingTop:28,paddingBottom:22,borderBottomWidth:1,borderColor:colors.line},
 heroTop:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:18},
 badges:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:18},
 badge:{fontSize:11,color:colors.ink,backgroundColor:colors.soft,paddingHorizontal:10,paddingVertical:7,borderRadius:3},
 filters:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14,marginBottom:16},
 filter:{minHeight:44,paddingHorizontal:13,justifyContent:'center',borderWidth:1,borderColor:colors.line,borderRadius:3},
 filterSelected:{backgroundColor:colors.ink,borderColor:colors.ink},
 filterText:{fontSize:12,color:colors.ink},
 card:{borderWidth:1,borderColor:colors.line,backgroundColor:'#fff',borderRadius:4,padding:18,gap:16,marginTop:16},
 icon:{width:44,height:44,alignItems:'center',justifyContent:'center',backgroundColor:colors.soft,borderRadius:4},
 check:{backgroundColor:colors.paper,padding:13,gap:6,borderLeftWidth:2,borderColor:colors.line},
 error:{gap:12,marginTop:14},
});
