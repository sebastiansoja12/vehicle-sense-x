import {Platform} from 'react-native';
import {AndroidImportance} from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import type {Reminder} from './records';
const prefix='vsx-reminder-';
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
export async function requestReminderPermission(){if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('maintenance',{name:'Serwis samochodu',importance:AndroidImportance.DEFAULT});const permission=await Notifications.requestPermissionsAsync();if(!permission.granted)throw new Error('Brak zgody na powiadomienia. Termin pozostaje widoczny w aplikacji.');}
export async function reconcileReminders(reminders:Reminder[]){
 const title='VehicleSenseX · termin serwisu';
 const desired=new Map(reminders.filter(r=>!r.completed&&r.notificationId!==null&&r.dueDate!==null&&new Date(r.dueDate+'T09:00:00').getTime()>Date.now()).map(r=>[prefix+r.id,{reminder:r,dueAt:new Date(r.dueDate+'T09:00:00').getTime()}]));
 const existing=await Notifications.getAllScheduledNotificationsAsync();const retained=new Set<string>();
 for(const item of existing){
  if(!item.identifier.startsWith(prefix))continue;
  const target=desired.get(item.identifier);
  if(target&&item.content.title===title&&item.content.body===target.reminder.title&&item.content.data?.dueAt===target.dueAt)retained.add(item.identifier);
  else await Notifications.cancelScheduledNotificationAsync(item.identifier);
 }
 if(!desired.size)return;
 const permission=await Notifications.getPermissionsAsync();if(!permission.granted)throw new Error('Powiadomienia serwisowe są wyłączone w systemie. Terminy są widoczne w aplikacji.');
 for(const [identifier,{reminder,dueAt}] of desired){
  if(retained.has(identifier))continue;
  await Notifications.scheduleNotificationAsync({identifier,content:{title,body:reminder.title,sound:false,data:{dueAt}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(dueAt),channelId:'maintenance'}});
 }
}
