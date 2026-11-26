import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {reset,state,handler} from './fixtures/notifications.mjs';
const fixture=new URL('./fixtures/notifications.mjs',import.meta.url).href;
registerHooks({resolve(specifier,context,next){
 if(context.parentURL?.endsWith('/notifications.native.ts')&&['react-native','expo-notifications'].includes(specifier))return {url:fixture,shortCircuit:true};
 return next(specifier,context);
}});
const {reconcileReminders}=await import('../src/notifications.native.ts');
const reminder={id:'oil',vehicleId:'car',title:'Wymiana oleju',dueDate:'2030-06-12',dueMileage:null,completed:false,notificationId:'vsx-reminder-oil'};
const dueAt=new Date('2030-06-12T09:00:00').getTime();
const scheduled={identifier:'vsx-reminder-oil',content:{title:'VehicleSenseX · termin serwisu',body:'Wymiana oleju',data:{dueAt}},trigger:{type:'date',date:new Date(dueAt),channelId:'maintenance'}};

test('service reminders are displayed while the app is open without playing a sound',async()=>{
 assert.ok(handler,'a foreground notification handler must be registered');
 assert.deepEqual(await handler.handleNotification(),{shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false});
});

test('a stale due date replaces the previous OS schedule for the same reminder',async()=>{
 reset([scheduled]);await reconcileReminders([{...reminder,dueDate:'2030-07-20'}]);
 assert.deepEqual(state.cancelled,['vsx-reminder-oil']);assert.equal(state.created.length,1);
 assert.equal(state.created[0].trigger.date.getTime(),new Date('2030-07-20T09:00:00').getTime());
 assert.equal(state.created[0].content.data.dueAt,new Date('2030-07-20T09:00:00').getTime());
});
test('a changed title replaces old notification content',async()=>{
 reset([scheduled]);await reconcileReminders([{...reminder,title:'Wymiana opon'}]);
 assert.equal(state.created.length,1);assert.equal(state.created[0].content.body,'Wymiana opon');
});
test('legacy schedules without date evidence are replaced once and then kept unchanged',async()=>{
 reset([{...scheduled,content:{title:scheduled.content.title,body:scheduled.content.body}}]);await reconcileReminders([reminder]);
 assert.equal(state.created.length,1);assert.equal(state.created[0].content.data.dueAt,dueAt);
 await reconcileReminders([reminder]);assert.equal(state.created.length,1);assert.equal(state.cancelled.length,1);
});
test('completion, deletion and disabling cancel only app-owned notifications',async()=>{
 reset([scheduled,{...scheduled,identifier:'other-library'}]);await reconcileReminders([{...reminder,completed:true}]);
 assert.deepEqual(state.cancelled,['vsx-reminder-oil']);assert.equal(state.created.length,0);assert.equal(state.scheduled[0].identifier,'other-library');
 reset([scheduled]);await reconcileReminders([]);assert.deepEqual(state.cancelled,['vsx-reminder-oil']);
 reset([scheduled]);await reconcileReminders([{...reminder,notificationId:null}]);assert.deepEqual(state.cancelled,['vsx-reminder-oil']);
});
test('permission denial still removes stale schedules before refusing a replacement',async()=>{
 reset([scheduled]);state.granted=false;
 await assert.rejects(reconcileReminders([{...reminder,dueDate:'2030-07-20'}]),/wyłączone/);
 assert.deepEqual(state.cancelled,['vsx-reminder-oil']);assert.equal(state.created.length,0);
});
test('reminders without a future date never create an OS notification',async()=>{
 reset();await reconcileReminders([{...reminder,dueDate:null},{...reminder,id:'past',dueDate:'2020-01-01'}]);assert.equal(state.created.length,0);
});
