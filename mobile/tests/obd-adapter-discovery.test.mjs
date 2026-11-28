import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,createConnection} from 'node:net';
import * as discovery from '../src/obd/adapter-discovery.ts';
import {connectWifi} from '../src/obd/wifi-core.ts';
const saved={host:'192.168.4.1',port:12345,adapterName:'Saved adapter'};
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
const link=(reply='ATI\rELM327 v2.3\r>')=>({adapterName:'Probe',commands:[],closed:0,onDisconnected:()=>()=>{},async send(command){this.commands.push(command);return reply;},async disconnect(){this.closed++;}});
test('Bluetooth selection builds an automatic profile without inherited UUIDs or invented identifiers',()=>{
 assert.equal(typeof discovery.automaticBleProfile,'function');
 const p=discovery.automaticBleProfile({id:'actual-device',name:'OBDLink CX',serviceUUID:'stale',writeUUID:'stale',notifyUUID:'stale'});
 assert.deepEqual(p,{deviceId:'actual-device',adapterName:'OBDLink CX',serviceUUID:'',writeUUID:'',notifyUUID:''});
 assert.equal(discovery.automaticBleProfile({id:'actual-device',name:null}).adapterName,'Adapter Bluetooth');
 for(const id of ['', ' '.repeat(3),'x'.repeat(201)])assert.throws(()=>discovery.automaticBleProfile({id,name:'ELM'}));
});
test('Wi-Fi automatically verifies the remembered endpoint and closes the probe before returning it',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const probe=link();let actual;
 const result=await discovery.detectWifiProfile(async(profile,options)=>{actual={profile,options};return probe;},{saved});
 assert.deepEqual(actual.profile,saved);assert.deepEqual(actual.options,{connectTimeoutMs:2000,commandTimeoutMs:2000});
 assert.equal(result.host,saved.host);assert.equal(result.port,saved.port);assert.equal(result.adapterName,'ELM327 V2.3');assert.deepEqual(probe.commands,['ATI']);assert.equal(probe.closed,1);
});
test('Wi-Fi rejects a non-ELM service before trying the documented default and closes every socket',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const bad=link('HTTP/1.1 200 OK>'),good=link();const profiles=[];
 const result=await discovery.detectWifiProfile(async profile=>{profiles.push(profile);if(profiles.length===1)return bad;assert.equal(bad.closed,1);return good;},{saved});
 assert.deepEqual(profiles.map(p=>[p.host,p.port]),[['192.168.4.1',12345],['192.168.0.10',35000]]);assert.equal(result.host,'192.168.0.10');assert.equal(good.closed,1);
});
test('Wi-Fi does not probe public addresses or duplicate the standard endpoint',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');
 for(const remembered of [{...saved,host:'8.8.8.8'},{...saved,host:'192.168.0.10',port:35000}]){
  const targets=[];await assert.rejects(discovery.detectWifiProfile(async p=>{targets.push(p);return link('NOT AN ADAPTER>');},{saved:remembered}),/wykry|adapter/i);
  assert.deepEqual(targets.map(p=>[p.host,p.port]),[['192.168.0.10',35000]]);
 }
});
test('an already cancelled Wi-Fi search opens no connection',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const controller=new AbortController();controller.abort();let calls=0;
 await assert.rejects(discovery.detectWifiProfile(async()=>{calls++;return link();},{signal:controller.signal}),/Anulowano/);assert.equal(calls,0);
});
test('cancellation during dialing closes a late socket without sending ATI or trying another endpoint',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const pending=deferred(),probe=link(),controller=new AbortController();let calls=0;
 const searching=discovery.detectWifiProfile(async()=>{calls++;return pending.promise;},{saved,signal:controller.signal});
 controller.abort();pending.resolve(probe);await assert.rejects(searching,/Anulowano/);assert.equal(calls,1);assert.deepEqual(probe.commands,[]);assert.equal(probe.closed,1);
});
test('cancellation while waiting for identification closes the active probe',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const started=deferred(),controller=new AbortController();let rejectCommand,closed=0,calls=0;
 const searching=discovery.detectWifiProfile(async()=>{calls++;return {adapterName:'Probe',onDisconnected:()=>()=>{},send(){started.resolve();return new Promise((_,reject)=>{rejectCommand=reject;});},async disconnect(){closed++;rejectCommand?.(Error('socket closed'));}};},{saved,signal:controller.signal});
 await started.promise;controller.abort();await assert.rejects(searching,/Anulowano/);assert.equal(calls,1);assert.equal(closed,1);
});
test('a failed probe cleanup stops detection before another connection can be opened',async()=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');let calls=0;const probe=link('WRONG>');probe.disconnect=async()=>{throw Error('close failed');};
 await assert.rejects(discovery.detectWifiProfile(async()=>{calls++;return probe;},{saved}),/close failed/);assert.equal(calls,1);
});
test('automatic Wi-Fi recognition exchanges real TCP ATI bytes without resetting or querying the vehicle',async t=>{
 assert.equal(typeof discovery.detectWifiProfile,'function');const commands=[],sockets=new Set();
 const server=createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.on('data',data=>{commands.push(data.toString());socket.write('ATI\rELM327 v');setImmediate(()=>socket.write('2.3\r>'));});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{for(const s of sockets)s.destroy();return new Promise(r=>server.close(r));});
 const result=await discovery.detectWifiProfile((p,o)=>connectWifi(p,()=>createConnection({host:'127.0.0.1',port:server.address().port}),o));
 assert.equal(result.host,'192.168.0.10');assert.deepEqual(commands,['ATI\r']);
});
