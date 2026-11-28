import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticReportHtml,diagnosticCsv,healthReportHtml,createBackup,parseBackup} from '../src/reports.ts';
import {addVehicle,emptyData} from '../src/domain.ts';
import {addDiagnostic} from '../src/features.ts';
import {buildAssistantContext} from '../src/assistant-context.ts';
import {askAssistant} from '../src/assistant-client.ts';
import {compareAdvancedDiagnostics as compareDiagnostics} from '../src/obd/comparison.ts';
const identity={version:1,status:'available',readAt:90,supportedInfoTypes:[4,6,10],calibrationIds:{status:'available',value:['<Calibration>','=SUM(1,2)'],readAt:91},cvns:{status:'available',value:['0010ABFF','00000000'],readAt:92},ecuName:{status:'available',value:{acronym:'ECM',name:'<Engine>'},readAt:93}};
const scan={id:'scan',vehicleId:'car',timestamp:100,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:null,loadPercent:null,voltageV:14},codes:[],readStatuses:['stored','pending','permanent'],supportedPids:[12],ecu:{protocol:6,responseId:'7E8'},extended:{version:1,measurements:[{pid:12,value:1000,readAt:90}],readiness:null,freezeFrame:{status:'no-data',frame:0,readAt:90},identification:identity}};
function garage(value=scan){return addDiagnostic(addVehicle(emptyData(),{make:'Test',model:'Car',year:'2020',engine:'1.0',mileage:'1000',plate:'PRIVATE-PLATE',vin:''},'car','2030-01-01'),value);}
test('diagnostic report includes escaped ECU identity with count, retrieval time and source limitations',()=>{
 const html=diagnosticReportHtml(scan);for(const text of ['CALID','CVN','0010ABFF','00000000','&lt;Calibration&gt;','&lt;Engine&gt;','Identyfikacja ECU','1970-01-01T00:00:00.091Z'])assert.ok(html.includes(text),text);
 assert.equal(html.includes('<Engine>'),false);assert.equal(html.includes('<Calibration>'),false);assert.ok(html.includes('oryginalności'));
});
test('diagnostic CSV preserves identity order, hexadecimal zeroes and formula-safe text',()=>{
 const csv=diagnosticCsv(scan);for(const text of ['"ecu-identification"','"0904"','"0906"','"090A"','"0010ABFF"','"00000000"','"\'=SUM(1,2)"'])assert.ok(csv.includes(text),text);
 assert.ok(csv.indexOf('<Calibration>')<csv.indexOf('SUM(1,2)'));
});
test('negative and unavailable identity states stay distinct in exported evidence',()=>{
 const copy=structuredClone(scan);copy.extended.identification={...identity,supportedInfoTypes:[6,10],calibrationIds:{status:'unsupported',readAt:90},cvns:{status:'no-data',readAt:91},ecuName:{status:'negative-response',nrc:'31',readAt:92}};
 const csv=diagnosticCsv(copy),html=diagnosticReportHtml(copy);
 for(const text of ['"unsupported"','"no-data"','"negative-response"','"31"'])assert.ok(csv.includes(text),text);
 assert.ok(html.includes('NRC 31'));assert.equal(html.includes('0010ABFF'),false);
});
test('garage backup retains ECU identity but sale reports omit all identifiers and unexpected basic parameter fields',()=>{
 const state=garage({...scan,parameters:{...scan.parameters,unexpected:'PRIVATE-UNEXPECTED'}}),restored=parseBackup(createBackup(state,'2030-01-01'));
 assert.deepEqual(restored.diagnostics[0].extended.identification,identity);const html=healthReportHtml(restored,'car','2030-01-01');
 for(const text of ['0010ABFF','&lt;Calibration&gt;','&lt;Engine&gt;','PRIVATE-UNEXPECTED','PRIVATE-PLATE'])assert.equal(html.includes(text),false,text);
});
test('automatic AI context and serialized client requests contain only four basic measurements and no calibration identity',async()=>{
 const context=buildAssistantContext(garage({...scan,parameters:{...scan.parameters,unexpected:'PRIVATE-UNEXPECTED'}}),'car','2030-01');
 assert.deepEqual(Object.keys(context.diagnostics.parameters).sort(),['coolantC','loadPercent','rpm','voltageV']);
 let body;const previous=globalThis.fetch;
 globalThis.fetch=async(_url,options)=>{body=JSON.parse(options.body);return new Response(JSON.stringify({answer:'Test'}),{status:200,headers:{'content-type':'application/json'}});};
 try{await askAssistant({endpoint:'http://127.0.0.1:5019',token:'A'.repeat(32),question:'Explain the reported code',context});}finally{globalThis.fetch=previous;}
 for(const text of ['0010ABFF','Calibration','PRIVATE-UNEXPECTED','identification'])assert.equal(JSON.stringify(body).includes(text),false,text);
});
test('identity comparisons use only common available fields, preserve record order and canonicalize ECU-name property order',()=>{
 const after=structuredClone(scan);after.id='after';after.timestamp=200;after.extended.identification.cvns.value=['0020ABFF','00000000'];after.extended.identification.ecuName.value={name:'<Engine>',acronym:'ECM'};
 const change=compareDiagnostics(scan,after).identification;assert.deepEqual(change.comparedFields,['calibrationIds','cvns','ecuName']);assert.deepEqual(change.changes,[{field:'cvns',before:['0010ABFF','00000000'],after:['0020ABFF','00000000']}]);
 after.extended.identification.cvns={status:'no-data',readAt:95};const partial=compareDiagnostics(scan,after).identification;assert.deepEqual(partial.comparedFields,['calibrationIds','ecuName']);assert.deepEqual(partial.changes,[]);
 const legacy={...after,extended:{...after.extended}};delete legacy.extended.identification;assert.deepEqual(compareDiagnostics(scan,legacy).identification,{comparedFields:[],changes:[]});
});
test('basic diagnostic HTML and CSV retain captured readiness counters and oil readings without claiming PID 01 was unread',()=>{
 const basic={...scan,extended:undefined,supportedPids:[1,12,48,49,92],readiness:{statusBytes:[128,7,0,0],warmupsSinceClear:3,distanceSinceClearKm:123},oilTemperatureC:85};
 const html=diagnosticReportHtml(basic),csv=diagnosticCsv(basic);
 for(const text of ['MIL:','Rozgrzania','123 km','85 °C'])assert.ok(html.includes(text),text);
 assert.equal(html.includes('Nie odczytano rozszerzonych parametrów, PID 01'),false);
 for(const text of ['"015C"','"85"','"0130"','"3"','"0131"','"123"','"readiness"'])assert.ok(csv.includes(text),text);
 const missing=diagnosticReportHtml({...scan,extended:undefined});assert.ok(missing.includes('brak danych'));
});
