import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCanMessages,parseProtocol,requestIdFor,validCanEcu,EcuSelectionRequired} from '../src/obd/can.ts';
import {Elm327Driver} from '../src/obd/driver.ts';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';
import {parseDtc} from '../src/obd/protocol.ts';

test('CAN protocol numbers and physical request IDs are constrained to standard OBD addressing',()=>{
 assert.equal(parseProtocol('ATDPN\rA6>'),6);assert.equal(parseProtocol('9>'),9);assert.equal(parseProtocol('A3>'),3);
 assert.equal(requestIdFor({protocol:6,responseId:'7E8'}),'7E0');assert.equal(requestIdFor({protocol:8,responseId:'7EF'}),'7E7');
 assert.equal(requestIdFor({protocol:7,responseId:'18DAF110'}),'18DA10F1');
 for(const raw of ['A0>','AUTO>','OK>','6\r7>','A6'])assert.throws(()=>parseProtocol(raw));
 for(const ecu of [{protocol:6,responseId:'7DF'},{protocol:6,responseId:'FFF'},{protocol:7,responseId:'18DAF1F1'},{protocol:3,responseId:'7E8'}])assert.equal(validCanEcu(ecu),false);
});
test('CAN frames preserve ECU identity and declared payload length while omitting padding',()=>{
 assert.deepEqual(parseCanMessages('7E8 04 41 0C 1A F8 AA AA AA>','010C',6),[{responseId:'7E8',payload:[0x41,0x0C,0x1A,0xF8]}]);
 assert.deepEqual(parseCanMessages('18 DA F1 10 03 41 05 7B 00 00 00 00>','0105',7),[{responseId:'18DAF110',payload:[0x41,0x05,0x7B]}]);
 assert.deepEqual(parseCanMessages('18DAF1100341057B00000000>','0105',9),[{responseId:'18DAF110',payload:[0x41,0x05,0x7B]}]);
});
test('interleaved CAN frames reassemble independently without mixing two ECU payloads',()=>{
 const raw='7E8 10 0A 43 04 01 33 02 10\r7E9 02 43 00 00 00 00 00 00\r7E8 21 C1 00 03 00 AA AA AA>';
 assert.deepEqual(parseCanMessages(raw,'03',6),[{responseId:'7E8',payload:[0x43,4,1,0x33,2,0x10,0xC1,0,3,0]},{responseId:'7E9',payload:[0x43,0]}]);
});
test('missing, duplicated, malformed and out-of-sequence CAN frames never produce a partial success',()=>{
 for(const raw of ['7E8 04 41 0C>','7E8 00 00>','7E8 08 41 00 00 00 00 00 00>','7E8 10 0A 43 04 01 33 02 10>','7E8 10 0A 43 04 01 33 02 10\r7E8 22 C1 00 03 00 00 00 00>','7E8 21 C1 00 00 00 00 00 00>','7E8 02 43 00\r7E8 02 43 00>','7E8 30 00 00>','7E8 02 43 ZZ>','7E9 02 43 00\rNO DATA>'])assert.throws(()=>parseCanMessages(raw,'03',6));
});
test('CAN DTC payloads require a valid explicit count and cannot hide a missing code as zero faults',()=>{
 assert.deepEqual(parseDtc('43 01 01 33>','03','can'),[{code:'P0133',status:'stored'}]);assert.deepEqual(parseDtc('43 00>','03','can'),[]);
 for(const raw of ['43 01 33>','43 01 00 00>','43 02 01 33>'])assert.throws(()=>parseDtc(raw,'03','can'));
});

function fixture({extended=false,one=false,overrides={}}={}){
 const ids=extended?['18DAF110','18DAF118']:['7E8','7E9'];const sent=[];let selected=null,headers=false;
 const driver=new Elm327Driver({send:async command=>{
  sent.push(command);if(Object.hasOwn(overrides,command))return overrides[command];
  if(command==='ATZ'){selected=null;headers=false;return 'ELM327 v2.3>';}
  if(command==='ATDPN')return extended?'A7>':'A6>';
  if(command==='ATH1'){headers=true;return 'OK>';}
  if(command.startsWith('ATSH')){selected=command.endsWith(extended?'18DA18F1':'7E1')?ids[1]:ids[0];return 'OK>';}
  if(command.startsWith('AT'))return command==='ATRV'?'12.6V>':'OK>';
  if(command==='0100')return !headers?'41 00 00 10 00 00\r41 00 00 10 00 00>':selected||one?`${selected??ids[0]} 06 41 00 00 10 00 00 00>`:`${ids[0]} 06 41 00 00 10 00 00 00\r${ids[1]} 06 41 00 00 10 00 00 00>`;
  if(command==='010C')return `${selected} 04 41 0C 1A F8 00 00 00>`;
  if(command==='03')return `${selected} 10 0A 43 04 01 33 02 10\r${selected} 21 C1 00 03 00 00 00 00>`;
  if(command==='07'||command==='0A')return `${selected} 02 ${command==='07'?'47':'4A'} 00 00 00 00 00 00>`;
  if(command==='04')return `${selected} 01 44 00 00 00 00 00 00>`;
  throw new Error(`Unexpected command ${command}`);
 }},'Actual ELM transport fixture');return {driver,sent,ids};
}
test('multiple discovered CAN ECUs require explicit selection and produce a scoped physical read',async()=>{
 const {driver,sent}=fixture();await driver.initialize();await assert.rejects(driver.readSnapshot('car'),error=>error instanceof EcuSelectionRequired&&error.ecus.length===2);
 assert.equal(sent.includes('03'),false);await driver.selectEcu('7E9');const snapshot=await driver.readSnapshot('car');
 assert.ok(sent.includes('ATSH7E1'));assert.ok(sent.includes('ATCRA7E9'));
 assert.deepEqual(snapshot.ecu,{protocol:6,responseId:'7E9'});assert.equal(snapshot.parameters.rpm,1726);assert.equal(snapshot.codes.length,4);assert.equal(validateDiagnosticSnapshot(snapshot),true);
});
test('29-bit selection targets the discovered ECU and changing ECU invalidates old clear permission',async()=>{
 const {driver,sent}=fixture({extended:true});await driver.initialize();await assert.rejects(driver.readSnapshot('car'),EcuSelectionRequired);
 await driver.selectEcu('18DAF110');const snapshot=await driver.readSnapshot('car');await driver.selectEcu('18DAF118');
 await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:snapshot,vehicleId:'car'}));assert.equal(sent.includes('04'),false);
 const next=await driver.readSnapshot('car');assert.ok(sent.includes('ATSH18DA18F1'));assert.ok(sent.includes('ATCRA18DAF118'));
 await driver.clearFaults({confirmed:true,backedUpSnapshot:next,vehicleId:'car'});assert.equal(sent.at(-1),'04');
});
test('CAN receive filtering is verified in software and another ECU cannot satisfy a read or clear',async()=>{
 const read=fixture({overrides:{'010C':'7E8 04 41 0C 00 00 00 00 00>'}});await read.driver.initialize();await assert.rejects(read.driver.readSnapshot('car'),EcuSelectionRequired);await read.driver.selectEcu('7E9');await assert.rejects(read.driver.readSnapshot('car'));
 const clear=fixture({overrides:{'04':'7E8 01 44 00 00 00 00 00 00>'}});await clear.driver.initialize();await assert.rejects(clear.driver.readSnapshot('car'),EcuSelectionRequired);await clear.driver.selectEcu('7E9');const s=await clear.driver.readSnapshot('car');await assert.rejects(clear.driver.clearFaults({confirmed:true,backedUpSnapshot:s,vehicleId:'car'}));await assert.rejects(clear.driver.clearFaults({confirmed:true,backedUpSnapshot:s,vehicleId:'car'}));assert.equal(clear.sent.filter(c=>c==='04').length,1);
});
test('failed physical filter configuration prevents any later read or clear until reinitialized',async()=>{
 const {driver,sent}=fixture({overrides:{ATCRA7E9:'?>'}});await driver.initialize();await assert.rejects(driver.readSnapshot('car'),EcuSelectionRequired);
 await assert.rejects(driver.selectEcu('7E9'));const before=sent.length;await assert.rejects(driver.readSnapshot('car'));assert.equal(sent.length,before);
 await assert.rejects(driver.selectEcu('7DF'));assert.equal(sent.includes('04'),false);
});
test('a single actually discovered CAN address can be read without a selection dialog',async()=>{
 const {driver,sent}=fixture({one:true});await driver.initialize();const snapshot=await driver.readSnapshot('car');
 assert.deepEqual(snapshot.ecu,{protocol:6,responseId:'7E8'});assert.ok(sent.includes('ATSH7E0'));assert.ok(sent.includes('ATCRA7E8'));
});
