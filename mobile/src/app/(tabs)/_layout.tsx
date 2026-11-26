import {Tabs} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../theme';
export default function TabLayout(){return <Tabs screenOptions={{headerShown:false,sceneStyle:{backgroundColor:colors.paper},tabBarStyle:{backgroundColor:colors.paper,borderTopColor:'#c7cdc1',elevation:0,shadowOpacity:0},tabBarActiveTintColor:colors.red,tabBarInactiveTintColor:colors.muted,tabBarLabelStyle:{fontSize:10},tabBarItemStyle:{minHeight:48},tabBarHideOnKeyboard:true}}>
 <Tabs.Screen name="index" options={{title:'Start',tabBarIcon:({focused})=><Ionicons name="home-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="diagnostics" options={{title:'Diagnostyka',tabBarIcon:({focused})=><Ionicons name="pulse-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="trips" options={{title:'Trasy',tabBarIcon:({focused})=><Ionicons name="navigate-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="expenses" options={{title:'Koszty',tabBarIcon:({focused})=><Ionicons name="wallet-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 <Tabs.Screen name="garage" options={{title:'Garaż',tabBarIcon:({focused})=><Ionicons name="car-outline" size={21} color={focused?colors.red:colors.muted}/>}}/>
 </Tabs>;}
