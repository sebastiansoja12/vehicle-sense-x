import test from 'node:test';
import assert from 'node:assert/strict';
import base64 from 'base-64';
import * as ble from '../src/obd/ble-session.ts';
import * as web from '../src/obd/ble.ts';
const profile={deviceId:'adapter',adapterName:'My ELM',serviceUUID:'FFF0',writeUUID:'FFF1',notifyUUID:'FFF2'};
function peripheral({withResponse=true,notifiable=true}={}) {
 let listener; let disconnected; const writes=[];let cancels=0,removed=0;
 const device={id:'adapter',async characteristicsForService(){return [{uuid:'fff1',isWritableWithResponse:withResponse,isWritableWithoutResponse:!withResponse},{uuid:'fff2',isNotifiable:notifiable,isIndicatable:false}];},
 monitorCharacteristicForService(service,characteristic,callback){assert.equal(service,'FFF0');assert.equal(characteristic,'FFF2');listener=callback;return {remove(){removed++;}};},
 onDisconnected(callback){disconnected=callback;return {remove(){removed++;}};},
 async writeCharacteristicWithResponseForService(s,c,value){writes.push({s,c,value,withResponse:true});},
 async writeCharacteristicWithoutResponseForService(s,c,value){writes.push({s,c,value,withResponse:false});},
 async cancelConnection(){cancels++;}};
 return {device,writes,emit(text){listener(null,{value:base64.encode(text)});},disconnect(){disconnected(null,device);},counts(){return {cancels,removed};}};
}
test('BLE profile requires manually supplied characteristic UUIDs',()=>{
 assert.equal(typeof ble.validateBleProfile,'function');
 assert.equal(ble.validateBleProfile(profile),true);
 for(const patch of [{deviceId:''},{serviceUUID:''},{writeUUID:'not-uuid'},{notifyUUID:'FFF'}]) assert.equal(ble.validateBleProfile({...profile,...patch}),false);
});
test('BLE session sends base64 ASCII to configured characteristic and decodes notifications',async()=>{
 assert.equal(typeof ble.createConnectedBleTransport,'function');const p=peripheral();let cleaned=0;
 const transport=await ble.createConnectedBleTransport(p.device,profile,async()=>{cleaned++;});
 const response=transport.send('010C');await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(p.writes,[{s:'FFF0',c:'FFF1',value:'MDEwQw0=',withResponse:true}]);
 p.emit('41 0C 1A');p.emit(' F8>');assert.equal(await response,'41 0C 1A F8>');
 await transport.disconnect();assert.deepEqual(p.counts(),{cancels:1,removed:2});assert.equal(cleaned,1);
 await transport.disconnect();assert.equal(cleaned,1);
});
test('BLE session supports explicitly discovered write-without-response and rejects disconnected requests',async()=>{
 assert.equal(typeof ble.createConnectedBleTransport,'function');const p=peripheral({withResponse:false});
 const transport=await ble.createConnectedBleTransport(p.device,profile,async()=>{});
 const response=transport.send('03');await new Promise(resolve=>setImmediate(resolve));assert.equal(p.writes[0].withResponse,false);
 p.disconnect();await assert.rejects(response);await assert.rejects(transport.send('03'));await transport.disconnect();
});
test('BLE session rejects missing notification support before sending commands',async()=>{
 assert.equal(typeof ble.createConnectedBleTransport,'function');const p=peripheral({notifiable:false});
 await assert.rejects(ble.createConnectedBleTransport(p.device,profile,async()=>{}));assert.equal(p.writes.length,0);
});
test('BLE startup notifications do not poison the first ELM command',async()=>{
 const p=peripheral();const transport=await ble.createConnectedBleTransport(p.device,profile,async()=>{});
 p.emit('\r\nELM327 v2.3\r\n>');
 const response=transport.send('ATZ');await new Promise(resolve=>setImmediate(resolve));
 p.emit('ELM327 v2.3>');assert.equal(await response,'ELM327 v2.3>');
 await transport.disconnect();
});
test('BLE disconnection is observable even between commands and a removed observer is not notified',async()=>{
 const p=peripheral();const transport=await ble.createConnectedBleTransport(p.device,profile,async()=>{});
 let disconnected=0,removed=0;transport.onDisconnected(()=>{disconnected++;});const stop=transport.onDisconnected(()=>{removed++;});stop();
 p.disconnect();await transport.disconnect();assert.equal(disconnected,1);assert.equal(removed,0);
 let late=false;transport.onDisconnected(()=>{late=true;});assert.equal(late,true);
});
test('BLE refuses oversized or non-ASCII startup data and closes the physical link',async()=>{
 for(const banner of ['A'.repeat(8193),'\u0000']){
  const p=peripheral();const transport=await ble.createConnectedBleTransport(p.device,profile,async()=>{});
  p.emit(banner);await new Promise(resolve=>setImmediate(resolve));
  await assert.rejects(transport.send('ATZ'));assert.equal(p.counts().cancels,1);
 }
});
test('web fallback reports unsupported BLE instead of generating devices or readings',async()=>{
 assert.equal(typeof web.createBleTransport,'function');
 await assert.rejects(web.createBleTransport(profile),error=>error.kind==='unsupported');
 let found=false;await assert.rejects(web.scanDevices(()=>{found=true;},()=>{}),error=>error.kind==='unsupported');assert.equal(found,false);
});
