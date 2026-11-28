import {Platform,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {isWideWeb} from '../../navigation';
import {Tabs} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
export default function TabLayout(){const {width}=useWindowDimensions();const insets=useSafeAreaInsets();return <Tabs screenOptions={{headerShown:false,sceneStyle:{backgroundColor:colors.paper},tabBarStyle:{display:isWideWeb(width,Platform.OS)?'none':'flex',backgroundColor:colors.surface,borderTopColor:colors.line,height:64+insets.bottom,paddingTop:7,paddingBottom:Math.max(insets.bottom,7),elevation:0,shadowOpacity:0},tabBarActiveTintColor:colors.red,tabBarInactiveTintColor:colors.muted,tabBarLabelStyle:{fontSize:10,fontWeight:'500'},tabBarItemStyle:{minHeight:48},tabBarHideOnKeyboard:true}}>
 <Tabs.Screen name="index" options={{title:'Start',tabBarIcon:({focused})=><Ionicons name="home-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="diagnostics" options={{title:width<360?'OBD2':'Diagnostyka',tabBarIcon:({focused})=><Ionicons name="pulse-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="trips" options={{title:'Trasy',tabBarIcon:({focused})=><Ionicons name="navigate-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="expenses" options={{title:'Koszty',tabBarIcon:({focused})=><Ionicons name="wallet-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="garage" options={{title:'Garaż',tabBarIcon:({focused})=><Ionicons name="car-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 </Tabs>;}
