import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyData,addVehicle,parseStoredData} from '../src/domain.ts';
import {editVehicle} from '../src/features.ts';
import {attachDecodedSource,decodeVinResponse} from '../src/vin-decoder.ts';
import {createBackup,parseBackup,healthReportHtml} from '../src/reports.ts';
import {buildAssistantContext} from '../src/assistant-context.ts';
import {applyVinObservation} from '../src/vin.ts';
const vin='1D4GP00R55B123456',day='2026-11-26';
const input={make:'DODGE',model:'Caravan',year:'2005',engine:'Wpis właściciela',plate:'PRIVATE',mileage:'1000',vin,displacementCc:'3300'};
const source=decodeVinResponse({Count:1,Results:[{VIN:vin,ErrorCode:'0',Make:'DODGE',Model:'Caravan',ModelYear:'2005',DisplacementCC:'3300'}]},vin,Date.UTC(2026,10,26));
const garage=()=>addVehicle(emptyData(),input,'car',day);
test('confirmed source data survives storage and full backups without modifying other vehicles',()=>{
 const before=addVehicle(garage(),{...input,vin:'WVWZZZ1JZXW000001'},'other',day);
 const saved=attachDecodedSource(before,'car',source);
 assert.deepEqual(saved.vehicles[0].decodedSource,source);assert.equal(saved.vehicles[1].decodedSource,undefined);assert.equal(before.vehicles[0].decodedSource,undefined);
 assert.deepEqual(parseStoredData(JSON.stringify(saved)).vehicles[0].decodedSource,source);
 assert.deepEqual(parseBackup(createBackup(saved,day)).vehicles[0].decodedSource,source);
});
test('manual field changes remove only stale field provenance; changing VIN removes the whole association',()=>{
 const saved=attachDecodedSource(garage(),'car',source);
 const changed=editVehicle(saved,'car',{...input,model:'Manual model'},day);
 assert.deepEqual(changed.vehicles[0].decodedSource.fields,{make:'DODGE',year:'2005',displacementCc:'3300'});
 const different=editVehicle(saved,'car',{...input,vin:'WVWZZZ1JZXW000001'},day);assert.equal(different.vehicles[0].decodedSource,undefined);
 const afterLookupEdit=attachDecodedSource(editVehicle(garage(),'car',{...input,year:'2006'},day),'car',source);
 assert.equal(afterLookupEdit.vehicles[0].decodedSource.fields.year,undefined);
});
test('forged or mismatched source evidence cannot be imported or attached to a missing car',()=>{
 for(const patch of [{vin:'WVWZZZ1JZXW000001'},{provider:'unverified'},{fields:{make:'Other'}}]){
  const data=garage();data.vehicles[0].decodedSource={...source,...patch};assert.throws(()=>parseStoredData(JSON.stringify(data)));
 }
 assert.throws(()=>attachDecodedSource(garage(),'missing',source));
});
test('VIN lookup evidence stays out of AI and sale reports',()=>{
 const saved=attachDecodedSource(garage(),'car',source);
 const ai=JSON.stringify(buildAssistantContext(saved,'car','2026-11'));assert.ok(!ai.includes(vin));assert.ok(!ai.includes('nhtsa-vpic'));assert.ok(!ai.includes('decodedSource'));
 const report=healthReportHtml(saved,'car',day);assert.ok(!report.includes(vin));assert.ok(!report.includes('decodedSource'));
});
test('a different VIN read from OBD invalidates an old external decode association',()=>{
 const saved=attachDecodedSource(garage(),'car',source);
 const changed=applyVinObservation(saved,{vehicleId:'car',source:'obd',vin:'WVWZZZ1JZXW000001',timestamp:42,adapterName:'ELM',ecu:{protocol:6,responseId:'7E8'}},vin);
 assert.equal(changed.vehicles[0].decodedSource,undefined);
 assert.doesNotThrow(()=>parseStoredData(JSON.stringify(changed)));
});
