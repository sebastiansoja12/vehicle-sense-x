import test from 'node:test';
import assert from 'node:assert/strict';
const sample=(time,value,patch={})=>({vehicleId:'car',timestamp:time,adapterName:'ELM',parameters:{rpm:value,coolantC:null,loadPercent:null,voltageV:14},measurements:[{pid:12,value,readAt:time}],ecu:{protocol:6,responseId:'7E8'},...patch});
test('live history is bounded and resets for a different vehicle, ECU or backward clock movement',async()=>{
 const {appendLiveSample}=await import('../src/obd/live-history.ts');let history=[];
 for(let i=0;i<305;i++)history=appendLiveSample(history,sample(i,1000+i));
 assert.equal(history.length,300);assert.equal(history[0].timestamp,5);assert.equal(history.at(-1).timestamp,304);
 assert.equal(appendLiveSample(history,sample(305,1200,{vehicleId:'other'})).length,1);
 assert.equal(appendLiveSample(history,sample(305,1200,{ecu:{protocol:6,responseId:'7E9'}})).length,1);
 assert.equal(appendLiveSample(history,sample(1,1200)).length,1);
});
test('live graphs show real gaps and current unknown data instead of connecting missing measurements',async()=>{
 const {liveSeries}=await import('../src/obd/live-history.ts');const history=[sample(1000,1000),sample(2000,null),sample(3000,2000),sample(4000,null)];
 const series=liveSeries(history,12);assert.equal(series.segments.length,2);assert.equal(series.segments[0].length,1);assert.equal(series.segments[1].length,1);
 assert.equal(series.current,null);assert.equal(series.min,1000);assert.equal(series.max,2000);assert.equal(series.mean,1500);assert.equal(series.count,2);
 assert.equal(series.from,1000);assert.equal(series.to,4000);
 assert.ok(series.segments.flat().every(p=>p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1));
 assert.equal(liveSeries(history,13).count,0);assert.deepEqual(liveSeries([],12).segments,[]);
});
const report=(id,time,patch={})=>({id,vehicleId:'car',timestamp:time,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:80,loadPercent:50,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[4,5,12],ecu:{protocol:6,responseId:'7E8'},...patch});
test('diagnostic comparisons limit code changes to common statuses and distinguish not-reported from repaired',async()=>{
 const {compareAdvancedDiagnostics:compareDiagnostics}=await import('../src/obd/comparison.ts');
 const before=report('before',1000,{readStatuses:['stored','pending'],codes:[{code:'P0133',status:'stored'},{code:'P0300',status:'pending'}]});
 const after=report('after',2000,{readStatuses:['stored','permanent'],codes:[{code:'P0171',status:'stored'},{code:'P0300',status:'permanent'}],parameters:{rpm:1500,coolantC:80,loadPercent:50,voltageV:14}});
 const change=compareDiagnostics(before,after);assert.deepEqual(change.added,[{code:'P0171',status:'stored'}]);assert.deepEqual(change.notReported,[{code:'P0133',status:'stored'}]);
 assert.deepEqual(change.commonStatuses,['stored']);assert.deepEqual(change.unknownStatuses,['pending','permanent']);assert.equal(change.scopeVerified,true);
 assert.deepEqual(change.parameters,[{pid:12,before:1000,after:1500,unit:'rpm'}]);
});
test('diagnostic comparisons refuse cross-vehicle and cross-controller reports and disclose unknown legacy scope',async()=>{
 const {compareAdvancedDiagnostics:compareDiagnostics}=await import('../src/obd/comparison.ts');const before=report('before',1000);
 for(const after of [report('other',2000,{vehicleId:'other'}),report('other',2000,{ecu:{protocol:6,responseId:'7E9'}}),report('other',2000,{ecu:undefined}),report('other',500)])assert.throws(()=>compareDiagnostics(before,after));
 assert.throws(()=>compareDiagnostics({...before,ecu:undefined},report('after',2000,{ecu:undefined})),/ECU|zakres/i);
});
test('resuming a live session begins a new chart segment without inventing missing readings',async()=>{
 const {appendLiveSample,liveSeries}=await import('../src/obd/live-history.ts');
 const history=appendLiveSample([sample(1000,1000),sample(2000,1100)],{...sample(60000,1200),breakBefore:true});
 const series=liveSeries(history,12);assert.equal(series.segments.length,2);assert.equal(series.segments[0].length,2);assert.equal(series.segments[1].length,1);assert.equal(series.count,3);
});
test('backup eligibility requires the exact exported or saved payload, including when report IDs collide',async()=>{
 const {hasDiagnosticBackup}=await import('../src/obd/backup.ts');
 const current=report('same-id',2000),older=report('same-id',1000);
 assert.equal(hasDiagnosticBackup(current,[older],JSON.stringify(older)),false);
 assert.equal(hasDiagnosticBackup(current,[],JSON.stringify(current)),true);
 assert.equal(hasDiagnosticBackup(current,[structuredClone(current)],null),true);
 assert.equal(hasDiagnosticBackup(null,[current],JSON.stringify(current)),false);
});
