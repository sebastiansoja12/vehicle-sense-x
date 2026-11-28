import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyData,addVehicle} from '../src/domain.ts';
import {buildCockpit,buildCarDisplayPayload} from '../src/cockpit.ts';
const now=1806314400000;
const snapshot=(overrides={})=>({id:'s',vehicleId:'a',timestamp:now-1000,source:'obd',adapterName:'ELM',parameters:{rpm:1200,coolantC:85,loadPercent:30,voltageV:14.1},codes:[],readStatuses:['stored','pending','permanent'],supportedPids:[4,5,12],ecu:{protocol:6,responseId:'7E8'},...overrides});

test('cockpit never borrows another vehicle’s readings and preserves unknown versus measured zero',()=>{
 const missing=buildCockpit('a',{saved:[snapshot({vehicleId:'b'})]},now);
 assert.equal(missing.source,'none');assert.equal(missing.parameters.rpm,null);assert.equal(missing.faults,null);
 const zero=buildCockpit('a',{saved:[snapshot({parameters:{rpm:0,coolantC:null,loadPercent:0,voltageV:null}})]},now);
 assert.equal(zero.source,'saved');assert.equal(zero.parameters.rpm,0);assert.equal(zero.parameters.coolantC,null);
});
test('Live requires an active matching session, a recent sample and the same adapter and ECU',()=>{
 const session=snapshot();const live={...session,timestamp:now,parameters:{...session.parameters,rpm:2500}};
 const view=buildCockpit('a',{session,live,connected:true,streaming:true},now);
 assert.equal(view.source,'live');assert.equal(view.parameters.rpm,2500);assert.equal(view.faults.timestamp,now-1000);
 const otherEcu=snapshot({timestamp:now,ecu:{protocol:6,responseId:'7E9'},codes:[{code:'P0300',status:'stored'}]});
 assert.equal(buildCockpit('a',{session,live,saved:[otherEcu],connected:true,streaming:true},now).faults.count,0);
 for(const override of [{connected:false},{streaming:false},{live:{...live,vehicleId:'b'}},{live:{...live,ecu:{protocol:6,responseId:'7E9'}}},{live:{...live,adapterName:'OTHER'}},{live:{...live,timestamp:now-16000}},{live:{...live,timestamp:now+1000}}]){
  assert.notEqual(buildCockpit('a',{session,live,connected:true,streaming:true,...override},now).source,'live');
 }
 assert.equal(buildCockpit('a',{saved:[snapshot({source:'import'})],connected:true,streaming:true},now).source,'import');
});
test('cockpit rejects invalid numbers, shows the latest saved report and retains partial fault scope',()=>{
 const latest=snapshot({timestamp:now-500,codes:[{code:'P0300',status:'stored'}],readStatuses:['stored']});
 const view=buildCockpit('a',{saved:[snapshot({timestamp:now-2000}),latest,snapshot({timestamp:now+1})]},now);
 assert.equal(view.timestamp,latest.timestamp);assert.equal(view.faults.count,1);assert.equal(view.faults.partial,true);
 assert.equal(buildCockpit('a',{saved:[snapshot({parameters:{rpm:NaN,coolantC:85,loadPercent:30,voltageV:14}})]},now).source,'none');
});
test('car display exports only the selected car’s own photo and recorded diagnostic summary',()=>{
 let data=addVehicle(emptyData(),{make:'Saab',model:'9-3',year:'2008',engine:'Benzyna',mileage:'150000',plate:'SECRET_PLATE',vin:'WVWZZZ1JZXW000001'},'a','2026-11-27');
 data=addVehicle(data,{make:'Toyota',model:'Corolla',year:'2020',engine:'Benzyna',mileage:'50000',plate:'OTHER',vin:''},'b','2026-11-27');
 const photo={id:'p',name:'SECRET_PHOTO_NAME',mime:'image/png',base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6IP0AAAAASUVORK5CYII=',date:'2026-11-27'};
 data.vehicles[0].photos=[photo];data.diagnostics=[snapshot({codes:[{code:'P0300',status:'stored'}]}),snapshot({vehicleId:'b',parameters:{rpm:4000,coolantC:85,loadPercent:30,voltageV:14}})];
 const payload=buildCarDisplayPayload(data,now);assert.equal(payload.vehicleLabel,'Saab 9-3');assert.equal(payload.photoBase64,photo.base64);
 assert.equal(payload.recordedAt,now-1000);assert.match(payload.rows[0].detail,/1.?200/);
 assert.match(payload.rows.find(row=>row.title==='Kody usterek')?.detail??'',/P0300/);
 const json=JSON.stringify(payload);for(const secret of ['SECRET','WVWZZZ','Toyota','Corolla','ELM'])assert.ok(!json.includes(secret));
 data.activeVehicleId='b';assert.equal(buildCarDisplayPayload(data,now).photoBase64,null);
 data.activeVehicleId=null;assert.equal(buildCarDisplayPayload(data,now),null);
});

test('car display accepts the longest valid make and model within native label limits',()=>{
 const data=emptyData();data.vehicles=[{id:'long',make:'A'.repeat(100),model:'B'.repeat(100),year:2020,engine:'2.0',mileage:0,plate:'',vin:''}];data.activeVehicleId='long';
 assert.ok(Array.from(buildCarDisplayPayload(data,now).vehicleLabel).length<=160);
});

test('expanded cockpit preserves the full report scope independently of live measurements',()=>{
 const session=snapshot();const view=buildCockpit('a',{session,connected:true,streaming:true,live:{...session,timestamp:now,parameters:{...session.parameters,rpm:2400}}},now);
 assert.equal(view.report.id,session.id);assert.equal(view.report.timestamp,now-1000);assert.equal(view.parameters.rpm,2400);
 assert.equal(buildCockpit('b',{saved:[session]},now).report,null);
});
