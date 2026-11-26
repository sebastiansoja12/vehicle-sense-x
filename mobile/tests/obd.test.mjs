import test from 'node:test';
import assert from 'node:assert/strict';
import * as obd from '../src/obd/index.ts';

test('ELM responses decode PID bytes after echoes, SEARCHING and prompts', () => {
 assert.equal(typeof obd.parsePid,'function');
 assert.equal(obd.parsePid('010C\rSEARCHING...\r41 0C 1A F8\r>','010C'),1726);
 assert.equal(obd.parsePid('41057B>','0105'),83);
 assert.equal(obd.parsePid('41 04 FF>','0104'),100);
 assert.equal(obd.parsePid('41 0C 00 00>','010C'),0);
 assert.equal(obd.parseVoltage('ATRV\r12.6V\r>'),12.6);
});
test('ELM refuses absent, malformed, errored and ambiguous ECU data',()=>{
 assert.equal(typeof obd.parsePid,'function');
 for (const raw of ['NO DATA>','CAN ERROR>','?>','SEARCHING...>','41 0C 1G 00>','41 0C 1A>','41 0C 1A F8\r41 0C 00 00>','7E8 04 41 0C 1A F8>','41 05 7B>','41 0C 1A F8\u0000>'])
  assert.throws(()=>obd.parsePid(raw,'010C'));
 assert.throws(()=>obd.parseVoltage('12.6V\r13.1V>'));
});
test('supported PID bitmap reads only advertised bits and continuation page',()=>{
 assert.equal(typeof obd.parseSupportedPids,'function');
 assert.deepEqual(obd.parseSupportedPids('41 00 18 10 00 01>'),[4,5,12,32]);
 assert.deepEqual(obd.parseSupportedPids('41 20 80 00 00 00>',32),[33]);
 assert.throws(()=>obd.parseSupportedPids('41 00 18 10>'));
});
test('stored, pending and permanent DTCs decode SAE families with zero padding distinct from no data',()=>{
 assert.equal(typeof obd.parseDtc,'function');
 assert.deepEqual(obd.parseDtc('03\r43 01 33 C1 00 00 00>','03'),[{code:'P0133',status:'stored'},{code:'U0100',status:'stored'}]);
 assert.deepEqual(obd.parseDtc('47 02 10>','07'),[{code:'P0210',status:'pending'}]);
 assert.deepEqual(obd.parseDtc('4A 01 33>','0A'),[{code:'P0133',status:'permanent'}]);
 assert.deepEqual(obd.parseDtc('43 00 00 00 00 00 00>','03'),[]);
 assert.deepEqual(obd.parseDtc('43 00>','03'),[]);
 assert.deepEqual(obd.parseDtc('43 01 01 33>','03'),[{code:'P0133',status:'stored'}]);
 for(const raw of ['NO DATA>','43 02 01 33>','43 01 33\r43 00 00>','43 01>']) assert.throws(()=>obd.parseDtc(raw,'03'));
});
test('snapshot validation rejects nonfinite measurements, invalid codes and cross-record omissions',()=>{
 assert.equal(typeof obd.validateDiagnosticSnapshot,'function');
 const s={id:'s1',vehicleId:'v1',timestamp:42,source:'obd',adapterName:'adapter',readStatuses:['stored'],codes:[],parameters:{rpm:null,coolantC:0,loadPercent:100,voltageV:12},supportedPids:[4,5]};
 assert.equal(obd.validateDiagnosticSnapshot(s),true);
 for(const patch of [{source:'unknown'},{source:'demo'},{vehicleId:''},{timestamp:Infinity},{timestamp:9000000000000000},{codes:[{code:'BAD',status:'stored'}]},{parameters:{...s.parameters,rpm:NaN}},{parameters:{...s.parameters,loadPercent:101}},{supportedPids:[-1]},{supportedPids:[4,4]}]) assert.equal(obd.validateDiagnosticSnapshot({...s,...patch}),false);
});

test('snapshot requires explicit successful DTC modes and codes must belong to them',()=>{
 const s={id:'s',vehicleId:'v',timestamp:42,source:'obd',adapterName:'BLE',codes:[],parameters:{rpm:null,coolantC:null,loadPercent:null,voltageV:null},supportedPids:[]};
 assert.equal(obd.validateDiagnosticSnapshot(s),false);
 assert.equal(obd.validateDiagnosticSnapshot({...s,readStatuses:['stored']}),true);
 assert.equal(obd.validateDiagnosticSnapshot({...s,readStatuses:[]}),false);
 assert.equal(obd.validateDiagnosticSnapshot({...s,readStatuses:['stored'],codes:[{code:'P0133',status:'pending'}]}),false);
});

test('channel serializes commands and assembles chunks until a prompt',async()=>{
 assert.equal(typeof obd.createElmChannel,'function');
 const writes=[];
 const channel=obd.createElmChannel(async command=>{writes.push(command);},{timeoutMs:100});
 const first=channel.send('010C'); const second=channel.send('0105');
 assert.deepEqual(writes,['010C\r']);
 channel.push('41 0'); channel.push('C 1A F8\r');
 assert.deepEqual(writes,['010C\r']);
 channel.push('>'); assert.equal(await first,'41 0C 1A F8\r>');
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(writes,['010C\r','0105\r']);
 channel.push('41 05 7B>'); assert.equal(await second,'41 05 7B>');
 channel.disconnect();
});
test('timeout poisons channel so late bytes cannot become next command data',async()=>{
 assert.equal(typeof obd.createElmChannel,'function');
 const writes=[]; const channel=obd.createElmChannel(async c=>{writes.push(c);},{timeoutMs:5});
 const results=await Promise.allSettled([channel.send('010C'),channel.send('0105')]);
 assert.equal(results[0].status,'rejected'); assert.equal(results[0].reason.kind,'timeout');
 assert.equal(results[1].status,'rejected'); assert.deepEqual(writes,['010C\r']);
 channel.push('41 0C 00 00>'); await assert.rejects(channel.send('010C'));
});
test('disconnect, overflow, write failure and invalid commands reject with no fabricated reply',async()=>{
 assert.equal(typeof obd.createElmChannel,'function');
 let channel=obd.createElmChannel(async()=>{},{});
 const a=channel.send('010C'); const b=channel.send('0105'); channel.disconnect();
 await assert.rejects(a); await assert.rejects(b);
 channel=obd.createElmChannel(async()=>{},{maxResponseLength:8});
 const c=channel.send('010C'); channel.push('123456789'); await assert.rejects(c);
 channel=obd.createElmChannel(async()=>{throw Error('write failed');},{});
 await assert.rejects(channel.send('010C'),/write failed/);
 await assert.rejects(channel.send('010C\r04')); channel.disconnect();
});

const replies={ATZ:'ELM327 v2.3>',ATE0:'OK>',ATL0:'OK>',ATS1:'OK>',ATH0:'OK>',ATCAF1:'OK>',ATSP0:'OK>',ATDPN:'A3>','0100':'41 00 18 10 00 00>','0104':'41 04 FF>','0105':'41 05 7B>','010C':'41 0C 1A F8>',ATRV:'12.6V>','03':'43 01 33 00 00 00 00>','07':'NO DATA>','0A':'4A 00>','04':'44>'};
function driverFixture(overrides={}) { const sent=[]; const driver=new obd.Elm327Driver({send:async c=>{sent.push(c);const r=Object.hasOwn(overrides,c)?overrides[c]:replies[c]; if(r instanceof Error) throw r; if(r===undefined) throw Error(`unexpected ${c}`);return r;}},'ELM BLE');return {driver,sent}; }
test('driver initializes and records genuine supported measurements with explicit DTC coverage',async()=>{
 assert.equal(typeof obd.Elm327Driver,'function');
 const {driver,sent}=driverFixture();
 await driver.initialize(); const s=await driver.readSnapshot('v1');
 assert.equal(s.vehicleId,'v1');assert.equal(s.source,'obd');assert.equal(s.adapterName,'ELM BLE');
 assert.deepEqual(s.parameters,{rpm:1726,coolantC:83,loadPercent:100,voltageV:12.6});
 assert.deepEqual(s.readStatuses,['stored','permanent']);assert.deepEqual(s.codes,[{code:'P0133',status:'stored'}]);
 assert.deepEqual(s.supportedPids,[4,5,12]);assert.equal(sent.includes('0120'),false);
 assert.equal(obd.validateDiagnosticSnapshot(s),true);
});
test('driver skips unadvertised PIDs and keeps absent measurements null',async()=>{
 assert.equal(typeof obd.Elm327Driver,'function');
 const {driver,sent}=driverFixture({'0100':'41 00 00 00 00 01>','0120':'41 20 80 00 00 00>',ATRV:'NO DATA>'});
 await driver.initialize();const s=await driver.readSnapshot('v');
 assert.deepEqual(s.parameters,{rpm:null,coolantC:null,loadPercent:null,voltageV:null});
 assert.deepEqual(s.supportedPids,[32,33]);for(const c of ['0104','0105','010C']) assert.equal(sent.includes(c),false);
});
test('driver does not convert timeout or entirely absent DTC reads into zero faults',async()=>{
 assert.equal(typeof obd.Elm327Driver,'function');
 const {driver}=driverFixture({'03':'NO DATA>','07':'NO DATA>','0A':'NO DATA>'});await driver.initialize();await assert.rejects(driver.readSnapshot('v'));
 const other=driverFixture({'010C':new obd.ObdError('timeout','timeout')}).driver;await other.initialize();await assert.rejects(other.readSnapshot('v'),/timeout/);
});
test('clear requires explicit confirmation and last backed-up real vehicle snapshot, and actual ECU acknowledgement',async()=>{
 assert.equal(typeof obd.Elm327Driver,'function');
 const {driver,sent}=driverFixture();await driver.initialize();const s=await driver.readSnapshot('v');
 for(const options of [{confirmed:false,backedUpSnapshot:s,vehicleId:'v'},{confirmed:true,backedUpSnapshot:{...s,vehicleId:'other'},vehicleId:'v'},{confirmed:true,backedUpSnapshot:s,vehicleId:'v',tripRecording:true},{confirmed:true,backedUpSnapshot:{...s,source:'demo'},vehicleId:'v'}]) await assert.rejects(driver.clearFaults(options));
 assert.equal(sent.includes('04'),false);
 const result=await driver.clearFaults({confirmed:true,backedUpSnapshot:s,vehicleId:'v'});assert.equal(result.acknowledged,true);assert.equal(result.rawResponse,'44>');
 const bad=driverFixture({'04':'NO DATA>'}).driver;await bad.initialize();const backup=await bad.readSnapshot('v');await assert.rejects(bad.clearFaults({confirmed:true,backedUpSnapshot:backup,vehicleId:'v'}));
});
