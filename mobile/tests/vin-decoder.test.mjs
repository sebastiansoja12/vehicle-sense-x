import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeVinResponse,applyDecodedFields,retainDecodedSource,validDecodedSource} from '../src/vin-decoder.ts';

const vin='1D4GP00R55B123456',timestamp=Date.UTC(2026,10,26);
const response=(patch={})=>({Count:1,Results:[{VIN:vin,ErrorCode:'0',Make:'DODGE',Model:'Caravan',ModelYear:'2005',DisplacementCC:'3300.000000',TransmissionStyle:'Automatic',DriveType:'FWD/Front-Wheel Drive',EngineHP:'180',...patch}]});
const draft={vin,make:'',model:'',year:'',engine:'Własny silnik',mileage:'1200',plate:'PRIVATE',displacementCc:'',transmission:'',drive:''};
test('vPIC decodes only explicit vehicle fields and never turns SAE horsepower into metric PS',()=>{
 const source=decodeVinResponse(response(),vin,timestamp);
 assert.deepEqual(source,{provider:'nhtsa-vpic',vin,timestamp,fields:{make:'DODGE',model:'Caravan',year:'2005',displacementCc:'3300',transmission:'Automatic',drive:'FWD/Front-Wheel Drive'}});
 assert.equal(validDecodedSource(source),true);
});
test('wrong VIN, partial decode, warnings and implausible values cannot become vehicle specifications',()=>{
 for(const patch of [{VIN:'WVWZZZ1JZXW000001'},{VIN:vin.slice(0,10)},{ErrorCode:'1'},{ErrorCode:'0,14'},{ModelYear:'2040'},{DisplacementCC:'NaN'},{Make:'x'.repeat(61)},{Model:'bad\nmodel'}])assert.throws(()=>decodeVinResponse(response(patch),vin,timestamp));
 for(const value of [{Count:2,Results:response().Results},null,{Count:1,Results:[]}])assert.throws(()=>decodeVinResponse(value,vin,timestamp));
});
test('missing optional fields remain absent and a response with no usable fields is rejected',()=>{
 const source=decodeVinResponse(response({ModelYear:'',DisplacementCC:null,TransmissionStyle:'Not Applicable',DriveType:''}),vin,timestamp);
 assert.deepEqual(source.fields,{make:'DODGE',model:'Caravan'});
 assert.throws(()=>decodeVinResponse(response({Make:'',Model:'',ModelYear:'',DisplacementCC:'',TransmissionStyle:'',DriveType:''}),vin,timestamp));
});
test('fractional displacement published by NHTSA does not discard other usable vehicle fields or invent rounded cc',()=>{
 const source=decodeVinResponse(response({DisplacementCC:'2979.1682352'}),vin,timestamp);
 assert.equal(source.fields.make,'DODGE');assert.equal(source.fields.displacementCc,undefined);
});
test('field selection changes only confirmed fields and protects edits made while a lookup was pending',()=>{
 const source=decodeVinResponse(response(),vin,timestamp);
 const changed=applyDecodedFields({...draft,mileage:'1300'},source,['make','year'],draft);
 assert.equal(changed.values.make,'DODGE');assert.equal(changed.values.year,'2005');assert.equal(changed.values.model,'');assert.equal(changed.values.engine,'Własny silnik');assert.equal(changed.values.mileage,'1300');
 assert.deepEqual(changed.source.fields,{make:'DODGE',year:'2005'});assert.equal(draft.make,'');
 assert.throws(()=>applyDecodedFields({...draft,make:'Manual'},source,['make'],draft));
 assert.throws(()=>applyDecodedFields({...draft,vin:'WVWZZZ1JZXW000001'},source,['make'],draft));
 for(const selection of [[],['make','make'],['engine'],['__proto__']])assert.throws(()=>applyDecodedFields(draft,source,selection,draft));
});
test('persisted source evidence retains only values still matching the vehicle and disappears after VIN edits',()=>{
 const source=decodeVinResponse(response(),vin,timestamp);
 const vehicle={...draft,make:'DODGE',year:2005,model:'Caravan',spec:{displacementCc:3300,transmission:'Manual',drive:''}};
 assert.deepEqual(retainDecodedSource(vehicle,source).fields,{make:'DODGE',model:'Caravan',year:'2005',displacementCc:'3300'});
 assert.equal(retainDecodedSource({...vehicle,vin:'WVWZZZ1JZXW000001'},source),undefined);
 for(const patch of [{provider:'guess'},{timestamp:NaN},{fields:{equipment:'invented'}},{vin:'0'.repeat(17)}])assert.equal(validDecodedSource({...source,...patch}),false);
});
test('applying an identity field cannot silently pair a decoded make or model with a conflicting existing identity',()=>{
 const source=decodeVinResponse(response(),vin,timestamp);
 assert.throws(()=>applyDecodedFields({...draft,make:'Other',model:'Existing'},source,['make'],{...draft,make:'Other',model:'Existing'}));
 assert.throws(()=>applyDecodedFields({...draft,make:'Other',model:'Existing'},source,['model'],{...draft,make:'Other',model:'Existing'}));
 const both=applyDecodedFields({...draft,make:'Other',model:'Existing'},source,['make','model'],{...draft,make:'Other',model:'Existing'});
 assert.equal(both.values.make,'DODGE');assert.equal(both.values.model,'Caravan');
});
