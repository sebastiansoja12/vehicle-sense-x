import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {Platform,reset,state} from './fixtures/classic-native.mjs';
const fixture=new URL('./fixtures/classic-native.mjs',import.meta.url).href;
registerHooks({resolve(specifier,context,next){
 if(context.parentURL?.endsWith('/classic.android.ts')){
  if(['react-native','react-native-bluetooth-classic'].includes(specifier))return {url:fixture,shortCircuit:true};
  if(specifier.startsWith('./'))return next(new URL(specifier+'.ts',context.parentURL).href,context);
 }
 return next(specifier,context);
}});
const classic=await import('../src/obd/classic.android.ts');
test('Android Classic lists real bonded device identities only after CONNECT permission',async()=>{
 reset();assert.deepEqual(await classic.listClassicDevices(),[{id:'AA:BB:CC:DD:EE:FF',name:'ELM adapter',rssi:null}]);
 assert.deepEqual(state.requests,['android.permission.BLUETOOTH_CONNECT']);assert.equal(state.bondedReads,1);
});
test('Android permission denial or a disabled radio prevents a native RFCOMM opening',async()=>{
 reset();state.permission='denied';await assert.rejects(classic.createClassicTransport('AA:BB:CC:DD:EE:FF'),/zgody/);assert.deepEqual(state.opens,[]);
 reset();state.enabled=false;await assert.rejects(classic.listClassicDevices(),/Włącz Bluetooth/);assert.equal(state.bondedReads,0);
});
test('Classic native binding preserves ELM prompt bytes with the installed RFCOMM option contract',async()=>{
 reset();const link=await classic.createClassicTransport('AA:BB:CC:DD:EE:FF');
 assert.deepEqual(state.opens,[{address:'AA:BB:CC:DD:EE:FF',options:{connectorType:'rfcomm',connectionType:'delimited',delimiter:'',charset:'ascii',readSize:1024}}]);
 const reading=link.send('ATZ');assert.deepEqual(state.writes,['ATZ\r']);state.receive({data:'ELM327 v2.3>'});assert.equal(await reading,'ELM327 v2.3>');
 let disconnected=0;link.onDisconnected(()=>disconnected++);state.dropped({device:{address:'AA:BB:CC:DD:EE:00'}});assert.equal(disconnected,0);
 state.dropped({device:{address:'AA:BB:CC:DD:EE:FF'}});await link.disconnect();assert.equal(disconnected,1);assert.equal(state.closed,1);
});
test('older Android uses declared Bluetooth permission and an invalid address never reaches native APIs',async()=>{
 reset();Platform.Version=30;await classic.listClassicDevices();assert.deepEqual(state.requests,[]);
 reset();await assert.rejects(classic.createClassicTransport('a-radio-name'));assert.deepEqual(state.requests,[]);assert.deepEqual(state.opens,[]);
});
