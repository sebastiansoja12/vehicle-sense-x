import test from 'node:test';
import assert from 'node:assert/strict';

const replies={ATZ:'ELM327 v2.3>',ATE0:'OK>',ATL0:'OK>',ATS1:'OK>',ATH0:'OK>',ATCAF1:'OK>',ATSP0:'OK>',ATDPN:'A3>','0100':'41 00 00 00 00 00>',ATRV:'12.6V>','03':'43 00>','07':'NO DATA>','0A':'NO DATA>'};
function adapter(overrides={}){
 const sent=[];let disconnected=0;
 return {sent,get disconnected(){return disconnected;},adapterName:'Physical transport name',async send(command){sent.push(command);const response=overrides[command]??replies[command];assert.notEqual(response,undefined,`unexpected ${command}`);return response;},async disconnect(){disconnected++;}};
}
test('starting diagnostics verifies ECU replies and returns a real scan rather than just adapter initialization',async()=>{
 const {startDiagnostics}=await import('../src/obd/session.ts');const link=adapter();
 const result=await startDiagnostics(link,'car');assert.equal(result.reading.vehicleId,'car');
 assert.equal(result.reading.adapterName,'Physical transport name');assert.deepEqual(result.reading.readStatuses,['stored']);
 assert.ok(link.sent.includes('0100'));assert.ok(link.sent.includes('03'));assert.equal(link.disconnected,0);
});
test('an initialized adapter without a vehicle response is closed and never returned as a successful diagnostic session',async()=>{
 const {startDiagnostics}=await import('../src/obd/session.ts');const link=adapter({'0100':'UNABLE TO CONNECT>'});
 await assert.rejects(startDiagnostics(link,'car'));assert.equal(link.disconnected,1);assert.equal(link.sent.includes('03'),false);
});
test('multiple responding CAN controllers leave the transport open for explicit ECU selection',async()=>{
 const {startDiagnostics}=await import('../src/obd/session.ts');const link=adapter({ATDPN:'A6>','ATH1':'OK>','ATD0':'OK>','ATCFC1':'OK>','0100':'7E8 06 41 00 00 00 00 00\r7E9 06 41 00 00 00 00 00>'});
 const result=await startDiagnostics(link,'car');assert.equal(result.reading,null);assert.deepEqual(result.ecus,[{protocol:6,responseId:'7E8'},{protocol:6,responseId:'7E9'}]);
 assert.equal(link.disconnected,0);assert.equal(link.sent.includes('03'),false);
});
