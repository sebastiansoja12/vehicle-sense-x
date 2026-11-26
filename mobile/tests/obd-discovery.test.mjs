import test from 'node:test';import assert from 'node:assert/strict';
import {discoverBleProfile} from '../src/obd/ble-discovery.ts';
const custom={uuid:'fff0',characteristics:[{uuid:'fff1',isWritableWithResponse:true,isWritableWithoutResponse:false,isNotifiable:false,isIndicatable:false},{uuid:'fff2',isWritableWithResponse:false,isWritableWithoutResponse:false,isNotifiable:true,isIndicatable:false}]};
test('BLE discovers an unambiguous serial service from real advertised capabilities without guessed UUIDs',()=>{assert.deepEqual(discoverBleProfile('device','Adapter',[custom]),{deviceId:'device',adapterName:'Adapter',serviceUUID:'fff0',writeUUID:'fff1',notifyUUID:'fff2'});});
test('BLE refuses ambiguous serial services and never writes to standard GATT control points',()=>{assert.throws(()=>discoverBleProfile('device','Adapter',[custom,{...custom,uuid:'ffe0'}]));assert.throws(()=>discoverBleProfile('device','Adapter',[{...custom,uuid:'180d'}]));assert.throws(()=>discoverBleProfile('device','Adapter',[{...custom,uuid:'0000180d-0000-1000-8000-00805f9b34fb'}]));assert.throws(()=>discoverBleProfile('device','Adapter',[]));});
test('eight-digit SIG UUIDs are excluded without excluding a genuine custom serial service',()=>{
 const sensor={...custom,uuid:'0000180D'};
 assert.throws(()=>discoverBleProfile('device','Adapter',[sensor]));
 assert.equal(discoverBleProfile('device','Adapter',[sensor,custom]).serviceUUID,'fff0');
 assert.equal(discoverBleProfile('device','Adapter',[{...custom,uuid:'0000FFF0'}]).serviceUUID,'0000FFF0');
});
