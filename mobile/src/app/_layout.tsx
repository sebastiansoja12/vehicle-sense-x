import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {AppProvider} from '../AppProvider';
import {AutomotiveProvider} from '../AutomotiveProvider';
import {NotificationSync} from '../NotificationSync';
import {CarDisplaySync} from '../CarDisplaySync';
import {TripRecorderProvider} from '../TripRecorder';
import {styles as s,colors} from '../theme';
import {AppChrome} from '../AppChrome';
export default function Layout(){return <SafeAreaProvider><AppProvider><AutomotiveProvider><TripRecorderProvider><SafeAreaView style={s.fill} edges={['top','left','right']}><AppChrome><NotificationSync/><CarDisplaySync/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.paper}}}><Stack.Screen name="(tabs)"/><Stack.Screen name="cockpit"/><Stack.Screen name="vehicle-evidence"/><Stack.Screen name="insights"/><Stack.Screen name="diagnostic-comparison"/><Stack.Screen name="workshops"/><Stack.Screen name="parts"/><Stack.Screen name="maintenance"/><Stack.Screen name="health"/><Stack.Screen name="analytics"/><Stack.Screen name="assistant"/><Stack.Screen name="accessories"/><Stack.Screen name="settings"/><Stack.Screen name="privacy"/><Stack.Screen name="catalog-sources"/></Stack></AppChrome><StatusBar style="dark"/></SafeAreaView></TripRecorderProvider></AutomotiveProvider></AppProvider></SafeAreaProvider>;}
