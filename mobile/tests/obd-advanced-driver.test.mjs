import test from 'node:test';
import assert from 'node:assert/strict';
import {Elm327Driver} from '../src/obd/driver.ts';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';
import {EcuSelectionRequired} from '../src/obd/can.ts';

function fixture({can=false,multi=false,overrides={}}={}){
 const sent=[];let headers=false,selected=null;
 const replies={
  '0100':'41 00 88 38 00 01>','0120':'41 20 00 00 00 01>','0140':'41 40 40 00 00 00>',
  '0101':'41 01 81 07 E5 21>','0105':'41 05 7B>','010B':'41 0B 65>','010C':'41 0C 1A F8>','010D':'41 0D 64>','0142':'41 42 36 B0>',
  '03':'43 01 01 33>','07':'NO DATA>','0A':'4A 00>','04':'44>',
  '020200':'42 02 00 01 33>','020000':'42 00 00 08 18 00 00>',
  '020500':'42 05 00 46>','020C00':'42 0C 00 0F A0>','020D00':'42 0D 00 28>',
 };
 const driver=new Elm327Driver({async send(command){
  sent.push(command);
  if(command==='ATZ'){headers=false;selected=null;return 'ELM327 v2.3>';}
  if(command==='ATDPN')return can?'A6>':'A3>';
  if(command==='ATH1'){headers=true;return 'OK>';}
  if(command.startsWith('ATSH')){selected=command.endsWith('7E1')?'7E9':'7E8';return 'OK>';}
  if(command==='ATRV')return '12.6V>';
  if(command.startsWith('AT'))return 'OK>';
  let reply=Object.hasOwn(overrides,command)?overrides[command]:replies[command];if(typeof reply==='function')reply=reply();
  assert.notEqual(reply,undefined,`unexpected ${command}`);if(reply instanceof Error)throw reply;
  if(reply&&typeof reply==='object'&&reply.raw)return reply.raw;
  if(!can||!headers||reply==='NO DATA>')return reply;
  const bytes=reply.slice(0,-1).split(' ');
  const frame=id=>`${id} ${bytes.length.toString(16).padStart(2,'0')} ${bytes.join(' ')}`;
  return command==='0100'&&multi&&!selected?`${frame('7E8')}\r${frame('7E9')}>`:`${frame(selected??'7E8')}>`;
 }},'ELM hardware boundary');return {driver,sent};
}
test('extended scan discovers later pages and records readiness, current measurements and a distinct historical freeze frame',async()=>{
 const {driver,sent}=fixture();await driver.initialize();const scan=await driver.readSnapshot('car',{extended:true});
 assert.ok(sent.includes('0140'));assert.equal(scan.extended.readiness.milOn,true);
 assert.equal(scan.extended.measurements.find(m=>m.pid===12).value,1726);
 assert.equal(scan.extended.measurements.find(m=>m.pid===66).value,14);
 assert.deepEqual(scan.extended.freezeFrame.supportedPids,[5,12,13]);
 assert.equal(scan.extended.freezeFrame.code,'P0133');assert.equal(scan.extended.freezeFrame.measurements.find(m=>m.pid===12).value,1000);
 assert.equal(scan.parameters.rpm,1726);assert.equal(validateDiagnosticSnapshot(scan),true);
 assert.equal(sent.filter(c=>c==='020200').length,2);
});
test('freeze-frame absence and no data remain distinct and do not fabricate current or historical measurements',async()=>{
 for(const [reply,status] of [['42 02 00 00 00>','no-frame'],['NO DATA>','no-data']]){
  const {driver,sent}=fixture({overrides:{'020200':reply}});await driver.initialize();const scan=await driver.readSnapshot('car',{extended:true});
  assert.equal(scan.extended.freezeFrame.status,status);assert.equal(sent.includes('020000'),false);assert.equal(validateDiagnosticSnapshot(scan),true);
 }
});
test('a changed freeze-frame trigger during collection fails the scan and leaves no permission to clear',async()=>{
 let calls=0;const {driver,sent}=fixture({overrides:{'020200':()=>++calls===1?'42 02 00 01 33>':'42 02 00 03 00>'}});
 await driver.initialize();await assert.rejects(driver.readSnapshot('car',{extended:true}),/frame|ramk/i);assert.equal(sent.includes('04'),false);
});
test('selected live parameters use cached capabilities and never rescan codes, readiness or freeze frames',async()=>{
 const {driver,sent}=fixture();await driver.initialize();const report=await driver.readSnapshot('car',{extended:true});sent.length=0;
 const live=await driver.readLiveParameters('car',[13,66]);assert.deepEqual(sent,['010D','0142','ATRV']);
 assert.deepEqual(live.measurements.map(m=>[m.pid,m.value]),[[13,100],[66,14]]);
 await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:report,vehicleId:'car'}),e=>e.kind==='confirmation');assert.equal(sent.includes('04'),false);
 const before=sent.length;for(const selection of [[13,13],[255],Array.from({length:9},(_,i)=>i+1)])await assert.rejects(driver.readLiveParameters('car',selection));assert.equal(sent.length,before);
});
test('extended CAN and selected live data stay scoped to the discovered controller',async()=>{
 const overrides={};const {driver,sent}=fixture({can:true,multi:true,overrides});await driver.initialize();await assert.rejects(driver.readSnapshot('car',{extended:true}),EcuSelectionRequired);
 await driver.selectEcu('7E9');const scan=await driver.readSnapshot('car',{extended:true});assert.deepEqual(scan.ecu,{protocol:6,responseId:'7E9'});
 assert.equal(scan.extended.freezeFrame.code,'P0133');overrides['010D']={raw:'7E8 03 41 0D 64>'};
 await assert.rejects(driver.readLiveParameters('car',[13]),e=>e.kind==='ambiguous');assert.equal(sent.includes('04'),false);
});
test('configured scaling is queried once per scan, persisted and reused for live measurements',async()=>{
 const {driver,sent}=fixture({overrides:{'0100':'41 00 88 39 00 01>','0140':'41 40 50 03 00 00>','014F':'41 4F 04 00 00 4D>','0150':'41 50 64 00 00 00>','010B':'41 0B 7F>','0110':'41 10 E2 90>','0144':'41 44 7D 00>'}});
 await driver.initialize();const scan=await driver.readSnapshot('car',{extended:true});assert.equal(validateDiagnosticSnapshot(scan),true);
 assert.ok(scan.extended.measurements.find(m=>m.pid===16).value>885);assert.deepEqual(scan.extended.scaling.pid4f,[4,0,0,77]);
 sent.length=0;const live=await driver.readLiveParameters('car',[11,16,68]);assert.ok(live.measurements[0].value>383);assert.deepEqual(sent,['010B','0110','0144','ATRV']);
});
test('advertised but unreadable configuration leaves affected units unknown instead of using an incorrect default scale',async()=>{
 const {driver}=fixture({overrides:{'0100':'41 00 88 39 00 01>','0140':'41 40 50 03 00 00>','014F':'NO DATA>','0150':'NO DATA>','0110':'41 10 E2 90>','0144':'41 44 7D 00>'}});
 await driver.initialize();const scan=await driver.readSnapshot('car',{extended:true});
 assert.equal(validateDiagnosticSnapshot(scan),true);assert.deepEqual(scan.extended.scaling,{pid4f:null,pid50:null});
 for(const pid of [11,16,68])assert.equal(scan.extended.measurements.find(m=>m.pid===pid).value,null);
 assert.equal(scan.parameters.rpm,1726);
});
test('mutating a returned report cannot alter cached ECU scaling or authorize clearing altered diagnostic data',async()=>{
 const {driver,sent}=fixture({overrides:{'0140':'41 40 00 02 00 00>','014F':'41 4F 00 00 00 4D>','010B':'41 0B 7F>'}});
 await driver.initialize();const scan=await driver.readSnapshot('car',{extended:true});
 scan.extended.scaling.pid4f[3]=1;scan.extended.measurements[0].value=0;
 await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:scan,vehicleId:'car'}),e=>e.kind==='confirmation');assert.equal(sent.includes('04'),false);
 const live=await driver.readLiveParameters('car',[11]);assert.ok(live.measurements[0].value>383);
});
test('scan progress counts requested parameters and fault modes without treating absent replies as successful measurements',async()=>{
 const {driver}=fixture();const events=[];await driver.initialize();await driver.readSnapshot('car',{extended:true,onProgress:event=>events.push({...event})});
 assert.ok(events.some(e=>e.stage==='parameters'&&e.completed===6&&e.total===6));
 assert.ok(events.some(e=>e.stage==='faults'&&e.completed===3&&e.total===3));
 assert.ok(events.some(e=>e.stage==='freeze-frame'&&e.completed===3&&e.total===3));
 assert.ok(events.every(e=>e.completed>=0&&e.completed<=e.total));
});
