import test from 'node:test';
import assert from 'node:assert/strict';
import * as reports from '../src/reports.ts';
import {addVehicle,emptyData} from '../src/domain.ts';
import {addDiagnostic} from '../src/features.ts';
import {buildAssistantContext} from '../src/assistant-context.ts';
const scan={id:'scan',vehicleId:'car',timestamp:1000,source:'obd',adapterName:'=UNTRUSTED <script>x</script>',parameters:{rpm:1000,coolantC:null,loadPercent:null,voltageV:14},codes:[{code:'P0133',status:'stored'}],readStatuses:['stored'],supportedPids:[6,12],ecu:{protocol:6,responseId:'7E8'},extended:{version:1,measurements:[{pid:6,value:-12.5,readAt:900},{pid:12,value:1000,readAt:950}],readiness:null,freezeFrame:{status:'available',frame:0,readAt:980,code:'P0133',supportedPids:[5],measurements:[{pid:5,value:30,readAt:980}]}}};
test('diagnostic HTML includes extended and freeze-frame data with escaped labels and honest scope',()=>{
 assert.equal(typeof reports.diagnosticReportHtml,'function');const html=reports.diagnosticReportHtml(scan,'<b>Vehicle</b>');
 assert.ok(html.includes('&lt;b&gt;Vehicle&lt;/b&gt;'));assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt;'));assert.equal(html.includes('<script>'),false);
 for(const text of ['7E8','P0133','Freeze frame','-12.5','30','PID 01','Czas pobrania'])assert.ok(html.includes(text),text);
 assert.ok(html.includes('Nie potwierdza'));assert.ok(html.includes('częściowy'));
});
test('diagnostic CSV preserves signed numeric measurements and blocks formulas in textual metadata',()=>{
 assert.equal(reports.csvCell(-12.5),'"-12.5"');assert.equal(reports.csvCell('-12.5'),'"\'-12.5"');
 const csv=reports.diagnosticCsv(scan);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"-12.5"'));assert.ok(csv.includes('"\'=UNTRUSTED'));
 assert.ok(csv.includes('"06"'));assert.ok(csv.includes('"freeze-frame"'));assert.ok(csv.includes('"stored"'));
});
test('live CSV preserves each observation time and unknown values without leaking report-only data',()=>{
 const csv=reports.liveDataCsv([{vehicleId:'car',timestamp:1000,adapterName:'ELM',ecu:{protocol:6,responseId:'7E8'},parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:14},measurements:[{pid:6,value:-12.5,readAt:900},{pid:12,value:null,readAt:950}]}]);
 assert.ok(csv.includes('1970-01-01T00:00:00.900Z'));assert.ok(csv.includes('"-12.5"'));assert.ok(csv.includes('"ATRV"'));assert.equal(csv.includes('VIN'),false);
 assert.ok(csv.includes('"0C"'));assert.ok(csv.includes('""'));
});
test('diagnostic CSV discloses unread statuses, missing readiness and unknown adapter voltage',()=>{
 const csv=reports.diagnosticCsv({...scan,parameters:{...scan.parameters,voltageV:null}});
 assert.ok(csv.includes('"coverage";"1970-01-01T00:00:01.000Z";"";"pending";"";"";"unknown";"7E8"'));
 assert.ok(csv.includes('"readiness";"1970-01-01T00:00:01.000Z";"01";"Gotowość emisji";"";"";"unknown";"7E8"'));
 assert.ok(csv.includes('"ATRV";"Napięcie adaptera";"";"V";"unknown"'));
});
test('extended reports survive garage backups, appear in sale reports and stay outside automatic AI context',()=>{
 let state=addVehicle(emptyData(),{make:'Test',model:'Car',year:'2020',engine:'1.0',mileage:'1000',plate:'PRIVATE',vin:''},'car','2030-01-01');
 state=addDiagnostic(state,{...scan,readStatuses:['stored','pending','permanent']});
 const restored=reports.parseBackup(reports.createBackup(state,'2030-01-01'));assert.deepEqual(restored.diagnostics[0].extended,scan.extended);
 const html=reports.healthReportHtml(restored,'car','2030-01-01');assert.ok(html.includes('Freeze frame 0'));assert.equal(html.includes('PRIVATE'),false);
 const context=buildAssistantContext(restored,'car','2030-01');assert.equal(context.diagnostics.extended,undefined);assert.deepEqual(Object.keys(context.diagnostics.parameters).sort(),['coolantC','loadPercent','rpm','voltageV']);
});
