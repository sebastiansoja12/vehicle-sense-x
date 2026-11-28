import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePid, parseSupportedPids, ObdError } from '../src/obd/protocol.ts';
import { Elm327Driver } from '../src/obd/driver.ts';
import { validateDiagnosticSnapshot } from '../src/obd/types.ts';
import { addVehicle, emptyData } from '../src/domain.ts';
import { createBackup, parseBackup, healthReportHtml, diagnosticComparisonHtml } from '../src/reports.ts';
const replies={ATZ:'ELM327>',ATE0:'OK>',ATL0:'OK>',ATS1:'OK>',ATH0:'OK>',ATCAF1:'OK>',ATSP0:'OK>',ATDPN:'A3>','0100':'41 00 00 00 00 01>','0120':'41 20 00 00 00 01>','0140':'41 40 00 00 00 10>','015C':'41 5C 28>',ATRV:'12.6V>','03':'43 00>','07':'NO DATA>','0A':'NO DATA>','04':'44>'};
function fixture(overrides={}){const sent=[];const driver=new Elm327Driver({send:async c=>{sent.push(c);const r=Object.hasOwn(overrides,c)?overrides[c]:replies[c];if(r instanceof Error)throw r;if(r===undefined)throw Error('Unexpected '+c);return r;}},'Oil test');return{sent,driver};}
test('oil temperature and page 40 parse strictly and preserve real zero',()=>{
 assert.equal(parsePid('41 5C 28>','015C'),0);assert.equal(parsePid('41 5C 00>','015C'),-40);assert.equal(parsePid('41 5C 82>','015C'),90);
 assert.deepEqual(parseSupportedPids('41 40 00 00 00 10>',64),[92]);
 for(const r of ['41 5C>','41 5D 28>','41 5C 28 FF>','NO DATA>','41 5C 28\r41 5C 28>'])assert.throws(()=>parsePid(r,'015C'));
});
test('full scan reads advertised oil temperature, Live Data does not add the query, clear guard includes it',async()=>{
 const f=fixture();await f.driver.initialize();const s=await f.driver.readSnapshot('v');assert.equal(s.oilTemperatureC,0);assert.ok(f.sent.includes('0140'));assert.ok(f.sent.includes('015C'));assert.equal(validateDiagnosticSnapshot(s),true);
 await assert.rejects(f.driver.clearFaults({confirmed:true,backedUpSnapshot:{...s,oilTemperatureC:1},vehicleId:'v'}));
 await f.driver.clearFaults({confirmed:true,backedUpSnapshot:s,vehicleId:'v'});
 const live=fixture();await live.driver.initialize();await live.driver.readSnapshot('v');live.sent.length=0;await live.driver.readLiveParameters('v');assert.deepEqual(live.sent,['ATRV']);
 const no=fixture({'0120':'41 20 00 00 00 00>'});await no.driver.initialize();assert.equal((await no.driver.readSnapshot('v')).oilTemperatureC,undefined);assert.equal(no.sent.includes('0140'),false);assert.equal(no.sent.includes('015C'),false);
});
test('missing oil data stays null but malformed/timeout/wrong ECU fails instead of fabricating a reading',async()=>{
 const no=fixture({'015C':'NO DATA>'});await no.driver.initialize();assert.equal((await no.driver.readSnapshot('v')).oilTemperatureC,null);
 for(const r of ['41 5C>',new ObdError('timeout','timeout')]){const f=fixture({'015C':r});await f.driver.initialize();await assert.rejects(f.driver.readSnapshot('v'));assert.equal(f.sent.includes('04'),false);}
 let initial=0;const f=fixture({'ATDPN':'A6>'});const driver=new Elm327Driver({send:async c=>{
 if(c==='0100')return ++initial===1?replies[c]:'7E8 06 41 00 00 00 00 01>';
 if(['ATH1','ATD0','ATCFC1','ATSH7E0','ATCRA7E8'].includes(c))return 'OK>';
 if(c==='0120')return '7E8 06 41 20 00 00 00 01>';if(c==='0140')return '7E8 06 41 40 00 00 00 10>';if(c==='015C')return '7E9 03 41 5C 28>';
 return c==='ATDPN'?'A6>':replies[c];}},'CAN test');await driver.initialize();await assert.rejects(driver.readSnapshot('v'),e=>e.kind==='ambiguous');
});
test('oil temperature survives backups/reports without becoming an oil level or lifetime estimate',async()=>{
 const f=fixture();await f.driver.initialize();const s=await f.driver.readSnapshot('v');
 let state=addVehicle(emptyData(),{make:'Test',model:'Test',engine:'Test',year:'2020',mileage:'1000',plate:'PRIVATE',vin:''},'v','2026-11-27');state={...state,diagnostics:[s]};
 assert.equal(parseBackup(createBackup(state,'2026-11-27')).diagnostics[0].oilTemperatureC,0);
 const html=healthReportHtml(state,'v','2026-11-27');assert.match(html,/Temperatura oleju/);assert.match(html,/0 °C/);assert.doesNotMatch(html,/PRIVATE/);
 assert.match(diagnosticComparisonHtml({vehicle:state.vehicles[0],before:s,after:{...s,id:'after',timestamp:s.timestamp+1},symptoms:'',createdAt:s.timestamp+2}),/Temperatura oleju/);
 for(const patch of [{oilTemperatureC:216},{oilTemperatureC:NaN},{oilTemperatureC:-41},{oilTemperatureC:0,supportedPids:[]}])assert.equal(validateDiagnosticSnapshot({...s,...patch}),false);
});
