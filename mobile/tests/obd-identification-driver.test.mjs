import test from 'node:test';
import assert from 'node:assert/strict';
import {Elm327Driver} from '../src/obd/driver.ts';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';
import {EcuSelectionRequired} from '../src/obd/can.ts';
const pad=(value,size)=>[...Buffer.from(value),...Array(size-value.length).fill(0)];
const frame=(data,id)=>{
 const lines=[];if(data.length<=7)lines.push([data.length,...data]);
 else{lines.push([0x10|(data.length>>8),data.length&255,...data.slice(0,6)]);let sequence=1;for(let start=6;start<data.length;start+=7)lines.push([0x20|(sequence++%16),...data.slice(start,start+7)]);}
 return lines.map(line=>id+' '+line.map(b=>b.toString(16).padStart(2,'0')).join(' ')).join('\r');
};
function fixture({can=true,multi=false,overrides={}}={}){
 const sent=[];let headers=false,selected=null;
 const replies={'0100':[0x41,0,8,16,0,0],'0105':[0x41,5,120],'010C':[0x41,12,15,160],
  '03':[0x43,0],'07':[0x47,0],'0A':[0x4A,0],'04':[0x44],'0101':'NO DATA>','020200':'NO DATA>',
  '0900':[0x49,0,0x54,0x40,0,0],
  '0904':[0x49,4,2,...pad('Cal-Engine',16),...pad('Cal-Gear',16)],
  '0906':[0x49,6,2,0,0,1,255,0x12,0x34,0x56,0x78],
  '090A':[0x49,10,1,...pad('ECM',4),45,...pad('EngineControl',15)]};
 const driver=new Elm327Driver({async send(command){sent.push(command);
  if(command==='ATZ'){headers=false;selected=null;return 'ELM327 v2.3>';}
  if(command==='ATH1'){headers=true;return 'OK>';}
  if(command==='ATDPN')return can?'A6>':'A3>';
  if(command.startsWith('ATSH')){selected=command.endsWith('7E1')?'7E9':'7E8';return 'OK>';}
  if(command==='ATRV')return '14.1V>';if(command.startsWith('AT'))return 'OK>';
  let value=Object.hasOwn(overrides,command)?overrides[command]:replies[command];if(typeof value==='function')value=value();assert.notEqual(value,undefined,command);
  if(typeof value==='string')return value;if(value.raw)return value.raw;
  if(!headers)return value.map(b=>b.toString(16).padStart(2,'0')).join(' ')+'>';
  if(command==='0100'&&multi&&!selected)return frame(value,'7E8')+'\r'+frame(value,'7E9')+'>';
  return frame(value,selected??'7E8')+'>';
 }},'ELM test boundary');return {driver,sent};
}
test('ECU identification is separately enabled, parses multiframe responses and never requests VIN',async()=>{
 const {driver,sent}=fixture();await driver.initialize();await driver.readSnapshot('car');await driver.readSnapshot('car',{extended:true});assert.equal(sent.some(c=>c.startsWith('09')),false);
 sent.length=0;const events=[];const scan=await driver.readSnapshot('car',{extended:true,identification:true,onProgress:p=>events.push(p)});
 assert.deepEqual(sent.filter(c=>c.startsWith('09')),['0900','0904','0906','090A']);
 assert.deepEqual(scan.extended.identification.calibrationIds.value,['Cal-Engine','Cal-Gear']);assert.deepEqual(scan.extended.identification.cvns.value,['000001FF','12345678']);
 assert.deepEqual(scan.extended.identification.ecuName.value,{acronym:'ECM',name:'EngineControl'});assert.equal(validateDiagnosticSnapshot(scan),true);
 assert.ok(events.some(p=>p.stage==='identification'&&p.completed===4&&p.total===4));
});
test('identity fields distinguish unadvertised, unanswered and negative-response data',async()=>{
 const {driver,sent}=fixture({overrides:{'0900':[0x49,0,4,0x40,0,0],'0906':'NO DATA>','090A':[0x7F,9,0x31]}});await driver.initialize();await driver.readSnapshot('car');
 const scan=await driver.readSnapshot('car',{extended:true,identification:true}),i=scan.extended.identification;
 assert.equal(i.calibrationIds.status,'unsupported');assert.equal(i.cvns.status,'no-data');assert.equal(i.ecuName.status,'negative-response');assert.equal(i.ecuName.nrc,'31');assert.equal(sent.includes('0904'),false);assert.equal(validateDiagnosticSnapshot(scan),true);
});
test('no-data and negative capability responses do not trigger speculative identity requests',async()=>{
 for(const [reply,status] of [['NO DATA>','no-data'],[[0x7F,9,0x11],'negative-response']]){
  const {driver,sent}=fixture({overrides:{'0900':reply}});await driver.initialize();await driver.readSnapshot('car');const scan=await driver.readSnapshot('car',{extended:true,identification:true});
  assert.equal(scan.extended.identification.status,status);assert.deepEqual(sent.filter(c=>c.startsWith('09')),['0900']);assert.equal(validateDiagnosticSnapshot(scan),true);
 }
});
test('response-pending fails before the next query and invalidates the earlier report clear permission',async()=>{
 const {driver,sent}=fixture({overrides:{'0906':[0x7F,9,0x78]}});await driver.initialize();const previous=await driver.readSnapshot('car');
 await assert.rejects(driver.readSnapshot('car',{extended:true,identification:true}),/NRC 78/);assert.equal(sent.includes('090A'),false);
 const count=sent.length;await assert.rejects(driver.readSnapshot('car'),/Initialize/);assert.equal(sent.length,count);
 await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:previous,vehicleId:'car'}),e=>e.kind==='confirmation');assert.equal(sent.includes('04'),false);
});
test('identity requests remain physically scoped and reject a different controller',async()=>{
 const overrides={};const {driver,sent}=fixture({multi:true,overrides});await driver.initialize();await assert.rejects(driver.readSnapshot('car'),EcuSelectionRequired);await driver.selectEcu('7E9');await driver.readSnapshot('car');
 const scan=await driver.readSnapshot('car',{extended:true,identification:true});assert.equal(scan.ecu.responseId,'7E9');
 overrides['0904']={raw:frame([0x49,4,1,...pad('Other ECU',16)],'7E8')+'>'};sent.length=0;
 await assert.rejects(driver.readSnapshot('car',{extended:true,identification:true}),e=>e.kind==='ambiguous');assert.equal(sent.includes('0906'),false);
});
test('identification requires an extended scan and an established CAN scope before querying',async()=>{
 for(const can of [true,false]){const {driver,sent}=fixture({can});await driver.initialize();
  await assert.rejects(driver.readSnapshot('car',{extended:true,identification:true}),e=>e.kind==='unsupported');
  await driver.readSnapshot('car');sent.length=0;
  await assert.rejects(driver.readSnapshot('car',{identification:true}),e=>e.kind==='unsupported');assert.equal(sent.length,0);
  if(!can){await assert.rejects(driver.readSnapshot('car',{extended:true,identification:true}),e=>e.kind==='unsupported');assert.equal(sent.length,0);}
 }
});
test('altering calibration evidence cannot authorize clearing a different full report',async()=>{
 const {driver,sent}=fixture();await driver.initialize();await driver.readSnapshot('car');const scan=await driver.readSnapshot('car',{extended:true,identification:true});
 scan.extended.identification.cvns.value[0]='00000000';await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:scan,vehicleId:'car'}),e=>e.kind==='confirmation');assert.equal(sent.includes('04'),false);
});
