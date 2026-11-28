import test from 'node:test';
import assert from 'node:assert/strict';
import {appendCockpitSample,buildCockpitTrend} from '../src/cockpit.ts';
const now=1806314400000;
const report={id:'scan',vehicleId:'a',timestamp:now-300000,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:80,loadPercent:0,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[4,5,12],ecu:{protocol:6,responseId:'7E8'}};
const sample=(offset,rpm=1000,extra={})=>({...report,timestamp:now+offset,parameters:{...report.parameters,rpm},...extra});
test('trend retains at most 60 actual samples and five minutes without duplicate or reverse time',()=>{
 let values=[];for(let i=0;i<65;i++)values=appendCockpitSample(values,sample(-320000+i*5000),report,now-320000+i*5000);
 assert.equal(values.length,60);assert.equal(values[0].timestamp,now-295000);assert.equal(values.at(-1).timestamp,now);
 for(const next of [sample(0,5000),sample(-1000),sample(1)])assert.deepEqual(appendCockpitSample(values,next,report,now),values);
 assert.equal(appendCockpitSample(values,sample(300001),report,now+300001).length,1);
});
test('trend isolates car adapter ECU and full-reading session and ignores invalid numbers',()=>{
 const values=appendCockpitSample([],sample(-1000),report,now);
 for(const extra of [{vehicleId:'b'},{adapterName:'other'},{ecu:{protocol:6,responseId:'7E9'}},{parameters:{...report.parameters,rpm:NaN}}])assert.deepEqual(appendCockpitSample(values,sample(0,1000,extra),report,now),values);
 assert.deepEqual(appendCockpitSample(values,null,null,now),[]);
 const nextSession={...report,timestamp:now-500};
 const reset=appendCockpitSample(values,sample(0),nextSession,now);assert.equal(reset.length,1);assert.equal(reset[0].timestamp,now);
 assert.deepEqual(appendCockpitSample(values,null,{...report,vehicleId:'b'},now),[]);
});
test('trend breaks missing values and long gaps while preserving true min max and timestamps',()=>{
 const trend=buildCockpitTrend([sample(-30000,0),sample(-25000,1000),sample(-20000,null),sample(-15000,2000),sample(1000,3000)],'rpm');
 assert.equal(trend.count,4);assert.equal(trend.min,0);assert.equal(trend.max,3000);assert.equal(trend.start,now-30000);assert.equal(trend.end,now+1000);
 assert.deepEqual(trend.segments.map(s=>s.length),[2,1,1]);assert.equal(trend.segments[0][0].x,4);assert.equal(trend.segments.at(-1)[0].x,296);
 assert.equal(trend.segments[0][0].y,76);assert.equal(trend.segments.at(-1)[0].y,4);
});
test('empty and constant trend never fabricates a measurement or produces invalid coordinates',()=>{
 const empty=buildCockpitTrend([sample(0,null)],'rpm');assert.equal(empty.count,0);assert.equal(empty.min,null);assert.deepEqual(empty.segments,[]);
 const flat=buildCockpitTrend([sample(-5000,0),sample(0,0)],'rpm');assert.equal(flat.min,0);assert.equal(flat.max,0);assert.equal(flat.segments[0][0].y,40);
 assert.ok(flat.segments.flat().every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)));
 const single=buildCockpitTrend([sample(0,500)],'rpm');assert.equal(single.segments[0][0].x,150);assert.equal(single.segments[0][0].y,40);
});
test('a complete report with readiness can seed trend without becoming a synthetic fault report',()=>{
 const complete={...report,timestamp:now,supportedPids:[1,4,5,12],readiness:{statusBytes:[0,7,0,0],warmupsSinceClear:null,distanceSinceClearKm:null}};
 const values=appendCockpitSample([],complete,complete,now);
 assert.equal(values.length,1);assert.equal(values[0].parameters.rpm,1000);
 assert.equal(values[0].readiness,undefined);assert.equal(values[0].codes,undefined);
});
