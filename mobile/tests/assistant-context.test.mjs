import test from 'node:test';
import assert from 'node:assert/strict';
import {addVehicle,emptyData,addService} from '../src/domain.ts';
import * as c from '../src/assistant-context.ts';
test('assistant context includes only selected vehicle facts and excludes identifiers and notes',()=>{
 let state=addVehicle(emptyData(),{make:'Toyota',model:'Yaris',year:'2022',engine:'Hybrid',mileage:'1000',plate:'SECRET-PLATE',vin:''},'v1','2026-11-25');
 state=addVehicle(state,{make:'Other',model:'Private',year:'2020',engine:'Other',mileage:'2000',plate:'SECRET-2',vin:''},'v2','2026-11-25');
 state=addService(state,{vehicleId:'v1',title:'Oil',date:'2026-11-01',mileage:'900',cost:'100',note:'SECRET-NOTE'},'s1','2026-11-25');
 const context=c.buildAssistantContext(state,'v1','2026-11');const raw=JSON.stringify(context);
 assert.equal(context.vehicle.make,'Toyota');assert.equal(context.recentServices.length,1);
 for(const forbidden of ['SECRET','vehicleId','vin','plate','note','points','Private'])assert.ok(!raw.includes(forbidden));
 assert.throws(()=>c.buildAssistantContext(state,'missing','2026-11'));
});
test('assistant context preserves the selected ECU scope of otherwise complete OBD readings',()=>{
 const state=addVehicle(emptyData(),{make:'Toyota',model:'Yaris',year:'2022',engine:'Hybrid',mileage:'1000',plate:'PRIVATE',vin:''},'v1','2026-11-25');
 state.diagnostics=[{id:'obd',vehicleId:'v1',timestamp:42,source:'obd',adapterName:'ELM',readStatuses:['stored','pending','permanent'],codes:[],supportedPids:[],parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:null},ecu:{protocol:6,responseId:'7E9'}}];
 assert.deepEqual(c.buildAssistantContext(state,'v1','2026-11').diagnostics.ecu,{protocol:6,responseId:'7E9'});
});
