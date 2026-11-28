import test from 'node:test';
import assert from 'node:assert/strict';
import * as reports from '../src/obd/live-report.ts';
const ecu={protocol:6,responseId:'7E8'};
const sample=(timestamp,measurements,extra={})=>({vehicleId:'car',adapterName:'ELM',timestamp,ecu,parameters:{rpm:measurements.find(m=>m.pid===12)?.value??null,coolantC:measurements.find(m=>m.pid===5)?.value??null,loadPercent:measurements.find(m=>m.pid===4)?.value??null,voltageV:14},measurements,...extra});
const history=[
 sample(1000,[{pid:12,value:0,readAt:900},{pid:6,value:-10,readAt:950}],{parameters:{rpm:0,coolantC:null,loadPercent:null,voltageV:0},breakBefore:true}),
 sample(3000,[{pid:12,value:1000,readAt:2800},{pid:5,value:null,readAt:2900}],{parameters:{rpm:1000,coolantC:null,loadPercent:null,voltageV:null}}),
 sample(10000,[{pid:5,value:80,readAt:9900}],{breakBefore:true}),
];
test('session statistics preserve zeros, missing versus unrecorded PIDs, pauses and observation times',()=>{
 assert.equal(typeof reports.buildLiveSessionReport,'function');
 const r=reports.buildLiveSessionReport(history);
 assert.equal(r.format,'vehiclesensex-live-session');assert.equal(r.version,1);assert.deepEqual(r.ecu,ecu);
 assert.deepEqual([r.summary.cycles,r.summary.from,r.summary.to,r.summary.durationMs,r.summary.segments],[3,900,10000,9100,2]);
 const rpm=r.summary.metrics.find(m=>m.pid===12);assert.deepEqual([rpm.reported,rpm.missing,rpm.notRecorded,rpm.min,rpm.max,rpm.mean,rpm.latest],[2,0,1,0,1000,500,null]);
 const coolant=r.summary.metrics.find(m=>m.pid===5);assert.deepEqual([coolant.reported,coolant.missing,coolant.notRecorded,coolant.min,coolant.mean,coolant.latest],[1,1,1,80,80,80]);
 const voltage=r.summary.metrics.find(m=>m.pid==='ATRV');assert.deepEqual([voltage.reported,voltage.missing,voltage.notRecorded,voltage.min,voltage.max,voltage.mean,voltage.latest],[2,1,0,0,14,7,14]);
 assert.equal(r.bufferFull,false);assert.equal(r.bufferLimit,300);
});
test('session JSON projects a detached sample copy without report-only or private fields',()=>{
 assert.equal(typeof reports.liveSessionJson,'function');
 const input=structuredClone(history);Object.assign(input[0],{vin:'PRIVATE-VIN',plate:'PRIVATE-PLATE',gps:'PRIVATE-GPS',codes:['PRIVATE-DTC'],extended:{identification:'PRIVATE-IDENTITY'}});input[0].measurements[0].note='PRIVATE-NOTE';input[0].parameters.secret='PRIVATE-SECRET';
 const json=reports.liveSessionJson(input);assert.equal(json.includes('PRIVATE-'),false);
 const r=reports.buildLiveSessionReport(input);input[0].measurements[0].value=500;input[0].parameters.voltageV=99;input[0].ecu.responseId='7E9';
 assert.equal(r.samples[0].measurements[0].value,0);assert.equal(r.samples[0].parameters.voltageV,0);assert.equal(r.ecu.responseId,'7E8');
 assert.equal(JSON.parse(json).samples[1].measurements[1].value,null);
});
test('voltage-only sessions retain unknown ECU scope and full buffer is disclosed without claiming truncation',()=>{
 assert.equal(typeof reports.buildLiveSessionReport,'function');
 const h=Array.from({length:300},(_,i)=>sample(1000+i,[],{ecu:undefined}));
 const r=reports.buildLiveSessionReport(h);assert.equal(r.ecu,undefined);assert.equal(r.bufferFull,true);assert.equal(r.summary.metrics.length,1);assert.equal(r.summary.metrics[0].pid,'ATRV');assert.equal(r.summary.metrics[0].mean,14);
});
test('session export retains validated ECU scaling instead of rejecting scaled measurements',()=>{
 assert.equal(typeof reports.buildLiveSessionReport,'function');
 const h=[sample(1000,[{pid:11,value:1000,readAt:900}],{scaling:{pid4f:[0,0,0,200]}})];
 const r=reports.buildLiveSessionReport(h);h[0].scaling.pid4f[3]=1;assert.deepEqual(r.samples[0].scaling,{pid4f:[0,0,0,200]});assert.equal(r.summary.metrics.find(m=>m.pid===11).max,1000);
});
test('invalid or mixed sessions fail before they can be serialized as diagnostic evidence',()=>{
 assert.equal(typeof reports.buildLiveSessionReport,'function');
 const invalid=[[],Array.from({length:301},()=>history[0]),[history[1],history[0]],[history[0],{...history[1],vehicleId:'other'}],[history[0],{...history[1],adapterName:'Other'}],[history[0],{...history[1],ecu:undefined}],[history[0],{...history[1],ecu:{protocol:8,responseId:'7E8'}}],
 [{...history[0],timestamp:NaN}],[{...history[0],timestamp:-1}],[{...history[0],timestamp:253402300800000}],[sample(1000,[{pid:12,value:100,readAt:1001}])],[sample(1000,[{pid:12,value:Infinity,readAt:900}])],[sample(1000,[{pid:12,value:20000,readAt:900}])],[sample(1000,[{pid:12,value:0,readAt:900},{pid:12,value:0,readAt:900}])],[sample(1000,[{pid:255,value:0,readAt:900}])],[{...history[0],parameters:{...history[0].parameters,rpm:42}}],[{...history[0],scaling:{private:'secret'}}],[{...history[0],breakBefore:'yes'}],
 [sample(1000,[4,5,6,7,8,9,10,11,12].map(pid=>({pid,value:null,readAt:900})))]];
 for(const h of invalid)assert.throws(()=>reports.buildLiveSessionReport(h),/sesj/i);
});
test('HTML summary escapes labels, preserves unknown values and discloses scope and statistical limits',()=>{
 assert.equal(typeof reports.liveSessionReportHtml,'function');
 const h=history.map(s=>({...s,adapterName:'<script>bad()</script>'}));const html=reports.liveSessionReportHtml(h,'<b>Car</b>');
 assert.ok(html.includes('&lt;b&gt;Car&lt;/b&gt;'));assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));assert.equal(html.includes('<script>'),false);
 for(const text of ['7E8','ATRV','300','arytmetyczna','kasowaniem','JSON/CSV','odpowiedzi','zapisanej','1970-01-01T00:00:00.900Z'])assert.ok(html.includes(text),text);
 assert.ok(reports.liveSessionReportHtml([sample(1000,[],{ecu:undefined})]).includes('niepotwierdzony'));
});
