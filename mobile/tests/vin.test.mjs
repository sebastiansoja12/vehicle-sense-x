import test from 'node:test';import assert from 'node:assert/strict';
import {parseObdVin,applyVinObservation,validVinSource} from '../src/vin.ts';
import {emptyData,addVehicle,parseStoredData} from '../src/domain.ts';
import {editVehicle} from '../src/features.ts';
import {createBackup,parseBackup} from '../src/reports.ts';
import {buildAssistantContext} from '../src/assistant-context.ts';
import {Elm327Driver} from '../src/obd/driver.ts';
const vin='1D4GP00R55B123456',day='2026-11-25';
const input={make:'Marka',model:'Model',year:'2005',engine:'Benzyna',mileage:'1000',plate:'PRIVATE',vin:''};
const observation={vehicleId:'car',vin,source:'obd',timestamp:42,adapterName:'ELM BLE',ecu:{protocol:6,responseId:'7E8'}};
const garage=()=>addVehicle(addVehicle(emptyData(),input,'car',day),{...input,plate:'OTHER'},'other',day);
test('VIN decoder accepts exactly one standard 17-character CAN VIN data item',()=>{
 assert.equal(parseObdVin('49 02 01 31 44 34 47 50 30 30 52 35 35 42 31 32 33 34 35 36>'),vin);
 for(const raw of ['NO DATA>','49 02 00 31 44 34 47 50 30 30 52 35 35 42 31 32 33 34 35 36>','49 02 01 31 44>','49 02 01 49 44 34 47 50 30 30 52 35 35 42 31 32 33 34 35 36>','49 02 01 31 44 34 47 50 30 30 52 35 35 42 31 32 33 34 35 36\r49 02 01>'])assert.throws(()=>parseObdVin(raw));
});
test('an unprogrammed all-zero VIN is missing information, not a usable observation',()=>{
 assert.throws(()=>parseObdVin('49 02 01 '+Array(17).fill('30').join(' ')+'>'));
 assert.equal(validVinSource({...observation,vin:'0'.repeat(17)}),false);
});
test('saving an observed VIN targets its original car and detects stale profile values',()=>{
 const before=garage();const saved=applyVinObservation(before,observation,'');
 assert.equal(saved.vehicles[0].vin,vin);assert.equal(saved.vehicles[1].vin,'');assert.equal(before.vehicles[0].vin,'');assert.equal(saved.activeVehicleId,before.activeVehicleId);
 assert.equal(saved.vehicles[0].vinSource.ecu.responseId,'7E8');assert.equal(saved.vehicles[0].model,'Model');
 assert.throws(()=>applyVinObservation(saved,{...observation,vin:'WVWZZZ1JZXW000001'},''));
 assert.throws(()=>applyVinObservation(before,{...observation,vehicleId:'missing'},''));
});
test('VIN source survives backup and ordinary editing but disappears if the VIN is changed manually',()=>{
 const saved=applyVinObservation(garage(),observation,'');const restored=parseBackup(createBackup(saved,day));
 assert.equal(restored.vehicles[0].vinSource?.source,'obd');assert.deepEqual(restored.vehicles[0].vinSource,saved.vehicles[0].vinSource);
 const same=editVehicle(restored,'car',{...input,vin,mileage:'1100'},day);assert.deepEqual(same.vehicles[0].vinSource,saved.vehicles[0].vinSource);
 const changed=editVehicle(same,'car',{...input,vin:'WVWZZZ1JZXW000001',mileage:'1100'},day);assert.equal(changed.vehicles[0].vinSource,undefined);
 assert.ok(!JSON.stringify(buildAssistantContext(saved,'car','2026-11')).includes(vin));
});
test('invalid VIN evidence or evidence for another VIN cannot enter local storage',()=>{
 assert.equal(validVinSource(observation),true);
 for(const patch of [{vin:'BAD'},{source:'guessed'},{timestamp:NaN},{ecu:{protocol:6,responseId:'7DF'}}])assert.equal(validVinSource({...observation,...patch}),false);
 const state=garage();state.vehicles[0].vin='WVWZZZ1JZXW000001';state.vehicles[0].vinSource=observation;assert.throws(()=>parseStoredData(JSON.stringify(state)));
});
test('driver reads framed VIN only from an initialized, selected CAN controller',async()=>{
 let headers=false;const sent=[];
 const driver=new Elm327Driver({send:async command=>{sent.push(command);if(command==='ATZ')return 'ELM327 v2.3>';if(command==='ATDPN')return 'A6>';if(command==='ATH1'){headers=true;return 'OK>';}if(command==='ATRV')return '12.6V>';if(command.startsWith('AT'))return 'OK>';if(command==='0100')return headers?'7E8 06 41 00 00 00 00 00 00>':'41 00 00 00 00 00>';if(command==='03')return '7E8 02 43 00 00 00 00 00 00>';if(command==='07'||command==='0A')return 'NO DATA>';if(command==='0902')return '7E8 10 14 49 02 01 31 44 34\r7E8 21 47 50 30 30 52 35 35\r7E8 22 42 31 32 33 34 35 36>';throw new Error(command);}},'ELM BLE');
 await driver.initialize();await assert.rejects(driver.readVin('car'));assert.equal(sent.includes('0902'),false);
 await driver.readSnapshot('car');const result=await driver.readVin('car');assert.equal(result.vin,vin);assert.equal(result.vehicleId,'car');assert.deepEqual(result.ecu,{protocol:6,responseId:'7E8'});assert.equal(result.source,'obd');
});
