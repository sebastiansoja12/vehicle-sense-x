import {useEffect,useState} from 'react';
import {Platform,Text} from 'react-native';
import {useApp} from './AppProvider';
import {buildCarDisplayPayload} from './cockpit';
import {syncCarDisplay} from './car-display';
import {styles as s} from './theme';

export function CarDisplaySync(){
 const {data}=useApp();const[error,setError]=useState(false);
 useEffect(()=>{const payload=Platform.OS==='ios'?buildCarDisplayPayload(data,Date.now()):null;let mounted=true;void syncCarDisplay(payload).then(()=>{if(mounted)setError(false);},()=>{if(mounted)setError(true);});return()=>{mounted=false;};},[data]);
 return error?<Text accessibilityRole="alert" style={s.error}>Nie udało się zaktualizować lokalnego raportu CarPlay. Otwórz aplikację ponownie przed użyciem widoku samochodowego.</Text>:null;
}
