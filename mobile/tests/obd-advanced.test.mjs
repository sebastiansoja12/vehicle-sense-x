import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSupportedPids} from '../src/obd/protocol.ts';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';

test('supported PID pages cover later standard pages and frame-zero service 02 bitmaps',()=>{
 assert.deepEqual(parseSupportedPids('41 40 40 00 00 01>',64),[66,96]);
 assert.deepEqual(parseSupportedPids('42 00 00 08 18 00 00>',0,2),[5,12,13]);
 assert.deepEqual(parseSupportedPids('41 E0 00 00 00 03>',224),[255]);
 for(const page of [-32,1,256])assert.throws(()=>parseSupportedPids('41 00 00 00 00 00>',page));
 assert.throws(()=>parseSupportedPids('42 00 01 08 18 00 00>',0,2));
});

test('standard scalar parameters decode physical units with exact payload lengths',async()=>{
 const {decodeMeasurement,parameterByPid}=await import('../src/obd/parameters.ts');
 const cases=[
  [6,'41 06 80>',0,'%'],[7,'41 07 90>',12.5,'%'],[8,'41 08 00>',-100,'%'],
  [10,'41 0A 64>',300,'kPa'],[11,'41 0B 65>',101,'kPa'],[12,'41 0C 1A F8>',1726,'rpm'],
  [13,'41 0D 64>',100,'km/h'],[14,'41 0E 80>',0,'°'],[15,'41 0F 50>',40,'°C'],
  [16,'41 10 03 E8>',10,'g/s'],[17,'41 11 FF>',100,'%'],[20,'41 14 C8 FF>',1,'V'],
  [31,'41 1F 01 2C>',300,'s'],[33,'41 21 00 64>',100,'km'],[35,'41 23 01 00>',2560,'kPa'],
  [47,'41 2F FF>',100,'%'],[48,'41 30 04>',4,''],[49,'41 31 00 64>',100,'km'],
  [51,'41 33 65>',101,'kPa'],[60,'41 3C 03 E8>',60,'°C'],[66,'41 42 36 B0>',14,'V'],
  [68,'41 44 80 00>',1,'λ'],[70,'41 46 3C>',20,'°C'],[77,'41 4D 00 0A>',10,'min'],
  [78,'41 4E 00 3C>',60,'min'],[82,'41 52 FF>',100,'%'],[92,'41 5C 7D>',85,'°C'],
  [94,'41 5E 00 64>',5,'l/h'],[97,'41 61 64>',-25,'%'],[98,'41 62 7D>',0,'%'],[99,'41 63 01 2C>',300,'Nm'],
 ];
 for(const [pid,raw,value,unit] of cases){assert.equal(decodeMeasurement(raw,pid),value,`PID ${pid}`);assert.equal(parameterByPid(pid).unit,unit);}
});
test('scalar decoding refuses a wrong PID, malformed bytes, extra data and a wrong freeze-frame number',async()=>{
 const {decodeMeasurement}=await import('../src/obd/parameters.ts');
 for(const raw of ['41 0D 10>','41 0C 1A>','41 0C 1A F8 00>','41 0C ZZ F8>','NO DATA>'])assert.throws(()=>decodeMeasurement(raw,12));
 assert.equal(decodeMeasurement('42 0C 00 1A F8>',12,2),1726);
 assert.throws(()=>decodeMeasurement('42 0C 01 1A F8>',12,2));assert.throws(()=>decodeMeasurement('41 0C 1A F8>',12,2));
 assert.throws(()=>decodeMeasurement('41 FF 00>',255));
});
test('configuration PIDs override MAP, MAF and commanded lambda scaling while zero retains standard defaults',async()=>{
 const {decodeMeasurement,parseScalingConfiguration}=await import('../src/obd/parameters.ts');
 const scaling={pid4f:parseScalingConfiguration('41 4F 04 00 00 4D>',0x4F),pid50:parseScalingConfiguration('41 50 64 00 00 00>',0x50)};
 assert.ok(Math.abs(decodeMeasurement('41 0B 7F>',11,1,scaling)-383.490196)<0.000001);
 assert.ok(Math.abs(decodeMeasurement('41 10 E2 90>',16,1,scaling)-885.023270)<0.000001);
 assert.ok(Math.abs(decodeMeasurement('41 44 7D 00>',68,1,scaling)-1.9531548)<0.0000001);
 assert.equal(decodeMeasurement('41 0B 7F>',11,1,{pid4f:[0,0,0,0]}),127);
 assert.equal(decodeMeasurement('41 10 E2 90>',16,1,{pid50:[0,0,0,0]}),580);
 assert.throws(()=>decodeMeasurement('41 0B 7F>',11,1,{pid4f:null}),e=>e.kind==='no-data');
 assert.throws(()=>parseScalingConfiguration('41 4F 04 00 00>',0x4F));
});
test('fuel-trim primary bank values accept the standard optional second bank byte without accepting extra padding',async()=>{
 const {decodeMeasurement}=await import('../src/obd/parameters.ts');
 assert.equal(decodeMeasurement('41 06 80 90>',6),0);assert.equal(decodeMeasurement('42 09 00 90 80>',9,2),12.5);
 assert.throws(()=>decodeMeasurement('41 06 80 90 00>',6));
});
test('spark readiness distinguishes unsupported, complete and incomplete monitors without treating readiness as repair',async()=>{
 const {parseReadiness}=await import('../src/obd/readiness.ts');const r=parseReadiness('41 01 82 07 E5 21>');
 assert.equal(r.milOn,true);assert.equal(r.storedDtcCount,2);assert.equal(r.ignition,'spark');
 assert.deepEqual(r.monitors.find(m=>m.id==='catalyst'),{id:'catalyst',supported:true,complete:false});
 assert.deepEqual(r.monitors.find(m=>m.id==='evap'),{id:'evap',supported:true,complete:true});
 assert.deepEqual(r.monitors.find(m=>m.id==='heated-catalyst'),{id:'heated-catalyst',supported:false,complete:null});
 assert.deepEqual(r.monitors.find(m=>m.id==='oxygen-sensor'),{id:'oxygen-sensor',supported:true,complete:false});
});
test('compression readiness uses diesel monitor bits and keeps reserved bits out of the monitor list',async()=>{
 const {parseReadiness}=await import('../src/obd/readiness.ts');const r=parseReadiness('41 01 01 7F FF 48>');
 assert.equal(r.milOn,false);assert.equal(r.storedDtcCount,1);assert.equal(r.ignition,'compression');
 assert.deepEqual(r.monitors.find(m=>m.id==='boost-pressure'),{id:'boost-pressure',supported:true,complete:false});
 assert.deepEqual(r.monitors.find(m=>m.id==='particulate-filter'),{id:'particulate-filter',supported:true,complete:false});
 assert.deepEqual(r.monitors.find(m=>m.id==='nox-scr'),{id:'nox-scr',supported:true,complete:true});
 assert.equal(r.monitors.some(m=>m.id==='evap'||m.id==='oxygen-sensor'),false);
 assert.equal(r.monitors.find(m=>m.id==='misfire').complete,false);
 for(const raw of ['41 01 00 00 00>','41 01 00 00 00 00 00>','41 02 00 00 00 00>','NO DATA>'])assert.throws(()=>parseReadiness(raw));
});

test('frame-zero trigger decoding keeps a positive no-frame reply distinct from absent data',async()=>{
 const {parseFreezeDtc}=await import('../src/obd/details.ts');
 assert.equal(parseFreezeDtc('42 02 00 01 33>'),'P0133');assert.equal(parseFreezeDtc('42 02 00 C1 00>'),'U0100');
 assert.equal(parseFreezeDtc('42 02 00 00 00>'),null);
 for(const raw of ['NO DATA>','42 02 01 01 33>','42 02 00 01>','42 02 00 01 33 00>'])assert.throws(()=>parseFreezeDtc(raw));
});
const snapshot={id:'scan',vehicleId:'car',timestamp:100,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:80,loadPercent:50,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[4,5,12,13]};
const details={version:1,measurements:[{pid:4,value:50,readAt:90},{pid:5,value:80,readAt:90},{pid:12,value:1000,readAt:90}],readiness:null,freezeFrame:{status:'available',frame:0,readAt:90,code:'P0133',supportedPids:[5],measurements:[{pid:5,value:30,readAt:90}]}};
test('extended snapshots validate physical bounds, supported PIDs and independent frame capabilities while legacy reports remain valid',()=>{
 assert.equal(validateDiagnosticSnapshot(snapshot),true);assert.equal(validateDiagnosticSnapshot({...snapshot,extended:details}),true);
 for(const patch of [
  {version:2},{measurements:[{pid:12,value:Infinity,readAt:90}]},{measurements:[{pid:12,value:17000,readAt:90}]},
  {measurements:[{pid:66,value:14,readAt:90}]},{measurements:[{pid:12,value:1000,readAt:-1}]},
  {measurements:[{pid:12,value:null,readAt:90},{pid:12,value:1000,readAt:91}]},
  {freezeFrame:{...details.freezeFrame,frame:1}},{freezeFrame:{...details.freezeFrame,code:'P0000'}},
  {freezeFrame:{...details.freezeFrame,supportedPids:null}},{freezeFrame:{...details.freezeFrame,measurements:[{pid:13,value:40,readAt:90}]}},
  {readiness:{milOn:'false',storedDtcCount:0,ignition:'spark',monitors:[]}},
 ])assert.equal(validateDiagnosticSnapshot({...snapshot,extended:{...details,...patch}}),false,JSON.stringify(patch));
 assert.equal(validateDiagnosticSnapshot({...snapshot,parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:14},extended:{...details,measurements:[{pid:12,value:null,readAt:90}],freezeFrame:{status:'no-data',frame:0,readAt:90}}}),true);
});
test('extended imports cannot contradict duplicate basic values or claim unsupported readiness',async()=>{
 const {parseReadiness}=await import('../src/obd/readiness.ts');
 assert.equal(validateDiagnosticSnapshot({...snapshot,extended:{...details,measurements:[{pid:12,value:4500,readAt:90}]}}),false);
 assert.equal(validateDiagnosticSnapshot({...snapshot,extended:{...details,readiness:parseReadiness('41 01 00 00 00 00>')}}),false);
});
