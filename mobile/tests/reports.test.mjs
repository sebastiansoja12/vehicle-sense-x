import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyData,addVehicle,addFuel} from '../src/domain.ts';
import * as r from '../src/reports.ts';
const day='2026-11-25';
const garage=()=>addVehicle(emptyData(),{make:'<Toyota>',model:'Corolla',year:'2021',engine:'Hybrid',mileage:'1000',plate:'PRIVATE',vin:''},'v1',day);
test('backup round trip preserves records and rejects malformed formats',()=>{
 const state=garage();assert.deepEqual(r.parseBackup(r.createBackup(state,day)),state);
 assert.throws(()=>r.parseBackup('{broken'));assert.throws(()=>r.parseBackup('{"format":"other","data":{}}'));
});
test('CSV separates vehicle records and quotes dangerous cells',()=>{
 const state=addFuel(garage(),{vehicleId:'v1',date:day,mileage:'1000',liters:'10',price:'6.50',full:true},'f1',day);
 const csv=r.fuelCsv(state,'v1');assert.ok(csv.includes('6500')||csv.includes('65.00'));assert.ok(!r.fuelCsv(state,'missing').includes('10.00'));
 assert.equal(r.csvCell(' \t=SUM(A1)'), '"\' \t=SUM(A1)"');assert.equal(r.csvCell('a"b'), '"a""b"');
});
test('health report escapes input and identifies missing mechanical evidence',()=>{
 const html=r.healthReportHtml(garage(),'v1',day);assert.ok(html.includes('&lt;Toyota&gt;'));assert.ok(!html.includes('<Toyota>'));
 assert.ok(html.includes('Nieznany'));assert.ok(html.includes('nie jest certyfikatem'));assert.ok(!html.includes('PRIVATE'));
});
test('backup export refuses an archive too large for the importer',()=>{const state={...emptyData(),extra:'x'.repeat(21*1024*1024)};assert.throws(()=>r.createBackup(state,'2026-11-25'),/20 MB/);});
test('backup and sales report preserve single-ECU scope rather than suggesting a whole-car scan',()=>{
 const state=garage();state.diagnostics=[{id:'obd',vehicleId:'v1',timestamp:42,source:'obd',adapterName:'ELM',readStatuses:['stored','pending','permanent'],codes:[],supportedPids:[],parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:null},ecu:{protocol:6,responseId:'7E9'}}];
 assert.deepEqual(r.parseBackup(r.createBackup(state,day)).diagnostics[0].ecu,{protocol:6,responseId:'7E9'});
 const html=r.healthReportHtml(state,'v1',day);assert.match(html,/7E9/);assert.match(html,/jednego sterownika/);
 const invalid=structuredClone(state);invalid.diagnostics[0].ecu.responseId='7DF';assert.throws(()=>r.parseBackup(JSON.stringify({format:'vehiclesensex-backup',version:1,date:day,data:invalid})));
});
