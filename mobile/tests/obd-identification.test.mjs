import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';
const bytes=value=>[...Buffer.from(value,'ascii')];
const padded=(value,size)=>[...bytes(value),...Array(size-value.length).fill(0)];
const raw=(pid,count,data)=>[0x49,pid,count,...data].map(b=>b.toString(16).padStart(2,'0')).join(' ')+'>';
const nameData=[...padded('ECM',4),45,...padded('EngineControl',15)];
const identity={version:1,status:'available',readAt:90,supportedInfoTypes:[2,4,6,10],calibrationIds:{status:'available',value:['cal-id'],readAt:91},cvns:{status:'available',value:['0010ABFF'],readAt:92},ecuName:{status:'available',value:{acronym:'ECM',name:'EngineControl'},readAt:93}};
const scan={id:'scan',vehicleId:'car',timestamp:100,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:null,loadPercent:null,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[12],ecu:{protocol:6,responseId:'7E8'},extended:{version:1,measurements:[{pid:12,value:1000,readAt:90}],readiness:null,freezeFrame:{status:'no-data',frame:0,readAt:90}}};
test('service 09 capability bitmap is independent from service 01 and bounded to the first information page',async()=>{
 const {parseIdentificationSupported}=await import('../src/obd/identification.ts');
 assert.deepEqual(parseIdentificationSupported('49 00 54 40 00 01>'),[2,4,6,10,32]);
 for(const value of ['41 00 54 40 00 01>','49 00 01 54 40 00 01>','49 20 54 40 00 01>','NO DATA>'])assert.throws(()=>parseIdentificationSupported(value));
});
test('calibration identifiers preserve case and order and enforce counted fixed-width records and trailing-only padding',async()=>{
 const {parseCalibrationIds}=await import('../src/obd/identification.ts');
 assert.deepEqual(parseCalibrationIds(raw(4,2,[...padded('Abc-123',16),...padded('SECOND',16)])),['Abc-123','SECOND']);
 for(const value of [raw(4,0,[]),raw(4,2,padded('short',16)),raw(4,1,padded('long',17)),raw(4,1,[65,0,66,...Array(13).fill(0)]),raw(4,1,Array(16).fill(0)),raw(4,1,[31,...Array(15).fill(0)]),raw(4,65,Array(65*16).fill(65))])assert.throws(()=>parseCalibrationIds(value));
});
test('CVNs are counted big-endian four-byte hexadecimal records without losing zeroes or claiming validation',async()=>{
 const {parseCalibrationVerificationNumbers}=await import('../src/obd/identification.ts');
 assert.deepEqual(parseCalibrationVerificationNumbers(raw(6,3,[0,16,171,255,0,0,0,0,255,255,255,255])),['0010ABFF','00000000','FFFFFFFF']);
 for(const value of [raw(6,0,[]),raw(6,2,[0,16,171,255]),raw(6,1,[0,16,171]),raw(6,1,[0,16,171,255,0]),raw(4,1,[0,16,171,255])])assert.throws(()=>parseCalibrationVerificationNumbers(value));
});
test('ECU names decode separately padded acronym and name fields and reject embedded padding or an incorrect delimiter',async()=>{
 const {parseEcuName}=await import('../src/obd/identification.ts');
 assert.deepEqual(parseEcuName(raw(10,1,nameData)),{acronym:'ECM',name:'EngineControl'});
 for(const value of [raw(10,2,nameData),raw(10,1,nameData.slice(1)),raw(10,1,[...padded('ECM',4),0,...padded('EngineControl',15)]),raw(10,1,[69,0,67,0,45,...padded('EngineControl',15)]),raw(10,1,[...padded('ECM',4),45,...Array(15).fill(0)])])assert.throws(()=>parseEcuName(value));
});
test('negative service 09 replies retain NRC while response-pending and wrong-service replies fail before another query',async()=>{
 const {parseIdentificationNegative}=await import('../src/obd/identification.ts');
 assert.equal(parseIdentificationNegative('7F 09 11>',0),'11');assert.equal(parseIdentificationNegative('7F 09 31>',4),'31');
 assert.equal(parseIdentificationNegative(raw(6,1,[0,0,0,0]),6),null);
 for(const value of ['7F 09 78>','7F 01 11>','7F 09 00>','7F 09 11 00>'])assert.throws(()=>parseIdentificationNegative(value,0));
});
test('identification imports require explicit CAN scope, valid support/status and bounded records while older reports remain valid',()=>{
 assert.equal(validateDiagnosticSnapshot(scan),true);
 const withIdentity={...scan,extended:{...scan.extended,identification:identity}};assert.equal(validateDiagnosticSnapshot(withIdentity),true);
 assert.equal(validateDiagnosticSnapshot({...withIdentity,ecu:undefined}),false);
 for(const patch of [{version:2},{supportedInfoTypes:[4,4,6,10]},{supportedInfoTypes:[6,10]},
  {calibrationIds:{status:'unsupported',readAt:90}},{cvns:{status:'available',value:['123'],readAt:90}},
  {ecuName:{status:'available',value:{acronym:'TOOLONG',name:'Engine'},readAt:90}},{readAt:-1},
  {cvns:{status:'no-data',value:['0010ABFF'],readAt:90}},
 ])assert.equal(validateDiagnosticSnapshot({...scan,extended:{...scan.extended,identification:{...identity,...patch}}}),false,JSON.stringify(patch));
 for(const data of [{version:1,status:'no-data',readAt:90},{version:1,status:'negative-response',nrc:'11',readAt:90}])assert.equal(validateDiagnosticSnapshot({...scan,extended:{...scan.extended,identification:data}}),true);
 assert.equal(validateDiagnosticSnapshot({...scan,extended:{...scan.extended,identification:{version:1,status:'negative-response',nrc:'78',readAt:90}}}),false);
});
