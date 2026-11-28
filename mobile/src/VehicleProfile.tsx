import {Image,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {Vehicle} from './domain';
import {number} from './ui';
import {styles as s} from './theme';
export function VehicleProfile({vehicle}:{vehicle:Vehicle}){
 const photo=vehicle.photos?.[0];
 return <View style={s.vehicle}>
  <View style={v.top}><Text style={v.kicker}>TWÓJ SAMOCHÓD</Text><View style={v.profileLabel}><View style={v.dot}/><Text style={v.profileText}>Profil w garażu</Text></View></View>
  <View style={v.main}><View style={v.identity}><Text style={v.make}>{vehicle.make}</Text><Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={.65} style={s.vehicleModel}>{vehicle.model}</Text><Text style={v.details}>{vehicle.year} · {vehicle.engine}</Text></View>{photo?<Image accessibilityLabel={`Własne zdjęcie ${vehicle.make} ${vehicle.model}`} source={{uri:`data:${photo.mime};base64,${photo.base64}`}} style={v.photo} resizeMode="cover"/>:<View style={v.placeholder}><Ionicons accessible={false} name="car-sport-outline" size={66} color="#b3c0b6"/><Text style={v.photoHint}>Własne zdjęcie dodasz w Garażu</Text></View>}</View>
  <View style={v.footer}>{vehicle.plate?<Text style={s.registration}>{vehicle.plate}</Text>:<Text style={v.caption}>Brak rejestracji w profilu</Text>}<View style={{alignItems:'flex-end'}}><Text style={v.mileage}>{number(vehicle.mileage)}<Text style={{fontSize:12,fontWeight:'400'}}> km</Text></Text><Text style={v.caption}>Zapisany przebieg</Text></View></View>
 </View>;
}
const v=StyleSheet.create({top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10},kicker:{fontSize:9,letterSpacing:1.7,fontWeight:'600',color:'#bfcac0'},profileLabel:{flexDirection:'row',alignItems:'center',gap:6},profileText:{fontSize:9,color:'#bec9c0'},dot:{width:4,height:4,borderRadius:2,backgroundColor:'#bec9c0'},main:{flexDirection:'row',gap:12,minHeight:170,paddingVertical:20,alignItems:'center'},identity:{flex:1,minWidth:0},make:{fontSize:12,letterSpacing:1,color:'#c7d1c9'},details:{fontSize:11,lineHeight:18,color:'#c7d1c9',marginTop:10},photo:{width:'40%',height:145,borderRadius:10},placeholder:{width:'36%',alignItems:'center',gap:10},photoHint:{fontSize:9,lineHeight:15,textAlign:'center',color:'#b6c4ba'},footer:{borderTopWidth:1,borderTopColor:'#4b5c55',paddingTop:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},mileage:{fontSize:21,fontWeight:'600',fontVariant:['tabular-nums'],color:'#fff'},caption:{fontSize:9,lineHeight:16,color:'#b6c4ba'}});
