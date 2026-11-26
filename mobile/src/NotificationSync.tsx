import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {useApp} from './AppProvider';
import {reconcileReminders} from './notifications';
import {styles as s} from './theme';
let queue=Promise.resolve();
export function NotificationSync(){const app=useApp();const[error,setError]=useState('');useEffect(()=>{let mounted=true;queue=queue.catch(()=>{}).then(()=>reconcileReminders(app.data.reminders));void queue.then(()=>{if(mounted)setError('');},()=>{if(mounted)setError('Nie udało się zsynchronizować powiadomień serwisowych. Sprawdź zgodę systemową.');});return()=>{mounted=false;};},[app.data.reminders]);return error?<Text accessibilityRole="alert" style={[s.error,{paddingHorizontal:22}]}>{error}</Text>:null;}
