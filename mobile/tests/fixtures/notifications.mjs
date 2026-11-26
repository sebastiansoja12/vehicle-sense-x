export const Platform={OS:'android'};
export const AndroidImportance={DEFAULT:3};
export const SchedulableTriggerInputTypes={DATE:'date'};
export const state={scheduled:[],cancelled:[],created:[],granted:true};
export let handler;
export function setNotificationHandler(value){handler=value;}
export function reset(scheduled=[]){Object.assign(state,{scheduled:structuredClone(scheduled),cancelled:[],created:[],granted:true});}
export async function getAllScheduledNotificationsAsync(){return structuredClone(state.scheduled);}
export async function cancelScheduledNotificationAsync(id){state.cancelled.push(id);state.scheduled=state.scheduled.filter(n=>n.identifier!==id);}
export async function getPermissionsAsync(){return {granted:state.granted};}
export async function requestPermissionsAsync(){return {granted:state.granted};}
export async function setNotificationChannelAsync(){}
export async function scheduleNotificationAsync(request){state.created.push(request);state.scheduled.push(request);return request.identifier;}
