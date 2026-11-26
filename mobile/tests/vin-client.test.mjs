import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupVin} from '../src/vin-client.ts';
const vin='1D4GP00R55B123456';
const body={Count:1,Results:[{VIN:vin,ErrorCode:'0',Make:'DODGE',Model:'Caravan',ModelYear:'2005'}]};
const json=value=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}});
test('VIN requests need explicit consent and a complete VIN before any network call',async()=>{
 let calls=0;const fetchImpl=async()=>{calls++;return json(body);};
 await assert.rejects(lookupVin({vin,consent:false},fetchImpl));
 for(const bad of ['BAD',vin+'?token=private','0'.repeat(17)])await assert.rejects(lookupVin({vin:bad,consent:true},fetchImpl));
 assert.equal(calls,0);
});
test('client uses the single official HTTPS endpoint without credentials and returns source evidence',async()=>{
 const calls=[];const source=await lookupVin({vin:vin.toLowerCase(),consent:true},async(url,options)=>{calls.push({url,options});return json(body);});
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/1D4GP00R55B123456?format=json');
 assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');assert.ok(calls[0].options.signal instanceof AbortSignal);
 assert.deepEqual(source.fields,{make:'DODGE',model:'Caravan',year:'2005'});
});
test('HTTP failures are not retried and raw provider messages or VINs are not exposed as errors',async()=>{
 let calls=0;
 await assert.rejects(lookupVin({vin,consent:true},async()=>{calls++;return new Response('private raw upstream '+vin,{status:429});}),e=>!e.message.includes(vin)&&!e.message.includes('upstream'));
 assert.equal(calls,1);
 await assert.rejects(lookupVin({vin,consent:true},async()=>{throw Error('network-secret '+vin);}),e=>!e.message.includes(vin)&&!e.message.includes('network-secret'));
});
test('oversized declared, streamed and native-text responses are rejected',async()=>{
 await assert.rejects(lookupVin({vin,consent:true},async()=>new Response('{}',{headers:{'content-type':'application/json','content-length':'999999'}})));
 await assert.rejects(lookupVin({vin,consent:true},async()=>json({pad:'x'.repeat(140000)})));
 await assert.rejects(lookupVin({vin,consent:true},async()=>({ok:true,status:200,headers:new Headers({'content-type':'application/json'}),text:async()=> 'x'.repeat(140000)})));
});
test('cancellation prevents even a late successful response from filling the form',async()=>{
 const controller=new AbortController();let resolve;
 const pending=lookupVin({vin,consent:true,signal:controller.signal},()=>new Promise(r=>{resolve=r;}));
 controller.abort();await assert.rejects(pending,{name:'AbortError'});resolve(json(body));
 const stopped=new AbortController();stopped.abort();let calls=0;
 await assert.rejects(lookupVin({vin,consent:true,signal:stopped.signal},async()=>{calls++;return json(body);}),{name:'AbortError'});assert.equal(calls,0);
});
test('the deadline is enforced even when the platform fetch never observes its abort signal',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let signal;
 const pending=lookupVin({vin,consent:true},async(_,options)=>{signal=options.signal;return new Promise(()=>{});});
 const rejected=assert.rejects(pending,{name:'TimeoutError'});t.mock.timers.tick(20000);await rejected;assert.equal(signal.aborted,true);
});
test('HTML and malformed JSON responses cannot populate the garage',async()=>{
 await assert.rejects(lookupVin({vin,consent:true},async()=>new Response('<html>error</html>')));
 await assert.rejects(lookupVin({vin,consent:true},async()=>new Response('{',{headers:{'content-type':'application/json'}})));
});
