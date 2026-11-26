import test from 'node:test';
import assert from 'node:assert/strict';
import {createConnection} from 'node:net';
import {createServer} from 'node:net';
import {connectWifi,validateWifiProfile} from '../src/obd/wifi-core.ts';
import {startDiagnostics} from '../src/obd/session.ts';
const profile={host:'192.168.0.10',port:35000,adapterName:'Mój adapter Wi-Fi'};
test('Wi-Fi profile requires a local IPv4 address, explicit valid port and adapter name',()=>{assert.equal(validateWifiProfile(profile),true);for(const patch of [{host:'api.example.com'},{host:'https://192.168.0.1'},{host:'8.8.8.8'},{host:'192.168.0.999'},{host:'192.168.0.01'},{port:0},{port:65536},{port:1.1},{adapterName:''}])assert.equal(validateWifiProfile({...profile,...patch}),false);assert.equal(validateWifiProfile({...profile,host:'10.0.0.1'}),true);assert.equal(validateWifiProfile({...profile,host:'172.16.1.1'}),true);});
async function server(t,handler){const sockets=new Set();const value=createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));handler(socket);});await new Promise(r=>value.listen(0,'127.0.0.1',r));t.after(()=>{for(const socket of sockets)socket.destroy();return new Promise(r=>value.close(r));});return value.address().port;}
const dial=port=>(_options)=>createConnection({host:'127.0.0.1',port});
test('Wi-Fi transport exchanges real TCP bytes and buffers split ELM prompts',async t=>{const port=await server(t,s=>{s.on('data',data=>{assert.equal(data.toString(),'010C\r');s.write('41 0C 1A');setTimeout(()=>s.write(' F8\r>'),5);});});const link=await connectWifi(profile,dial(port));assert.equal(await link.send('010C'),'41 0C 1A F8\r>');await link.disconnect();await assert.rejects(link.send('03'));});
test('Wi-Fi disconnect rejects an unfinished command and destroys the socket',async t=>{const port=await server(t,s=>s.on('data',()=>s.destroy()));const link=await connectWifi(profile,dial(port));await assert.rejects(link.send('03'),/przerwane|zamknięte|disconnected/i);await link.disconnect();});
test('Wi-Fi physical disconnection notifies observers even when no command is running',async t=>{let drop,accept;const accepted=new Promise(resolve=>{accept=resolve;});const port=await server(t,s=>{drop=()=>s.destroy();accept();});const link=await connectWifi(profile,dial(port));await accepted;let calls=0;const disconnected=new Promise(resolve=>link.onDisconnected(()=>{calls++;resolve();}));drop();await disconnected;await link.disconnect();assert.equal(calls,1);});
test('Wi-Fi command timeout poisons transport and late bytes cannot become a new response',async t=>{const port=await server(t,()=>{});const link=await connectWifi(profile,dial(port),{commandTimeoutMs:20});await assert.rejects(link.send('03'),/timed out/i);await assert.rejects(link.send('010C'));await link.disconnect();});
test('Wi-Fi refuses invalid profiles before opening a socket',async()=>{let called=false;await assert.rejects(connectWifi({...profile,host:'8.8.8.8'},()=>{called=true;throw Error('unexpected');}));assert.equal(called,false);});
test('connection deadline destroys an unresponsive socket before any ELM command',async()=>{let destroyed=false;const socket={on(){return this;},write(){assert.fail('must not write before connecting');},destroy(){destroyed=true;}};await assert.rejects(connectWifi(profile,()=>socket,{connectTimeoutMs:10}),/czas połączenia/i);assert.equal(destroyed,true);});
test('default TCP dialing uses system routing without binding every app request to adapter Wi-Fi',async()=>{let actual;const socket={on(event,listener){if(event==='connect')queueMicrotask(()=>listener());return this;},write(_data,callback){callback();},destroy(){}};const link=await connectWifi(profile,options=>{actual=options;return socket;});assert.equal(actual.interface,undefined);assert.equal(actual.host,profile.host);assert.equal(actual.port,35000);await link.disconnect();});
test('a complete Wi-Fi diagnostic session and live polling use the real TCP channel end to end',{timeout:5000},async t=>{
 const replies={ATZ:'ELM327 v2.3>',ATE0:'OK>',ATL0:'OK>',ATS1:'OK>',ATH0:'OK>',ATCAF1:'OK>',ATSP0:'OK>',ATDPN:'A3>','0100':'41 00 18 10 00 00>','010C':'41 0C 1A F8>','0105':'41 05 7B>','0104':'41 04 FF>',ATRV:'12.6V>','03':'43 01 33 00 00>','07':'NO DATA>','0A':'4A 00>'};
 const commands=[];
 const port=await server(t,s=>{let buffered='';s.on('data',data=>{
  buffered+=data.toString('ascii');let end;
  while((end=buffered.indexOf('\r'))!==-1){
   const command=buffered.slice(0,end);buffered=buffered.slice(end+1);commands.push(command);
   assert.ok(Object.hasOwn(replies,command),`unexpected wire command ${command}`);
   const reply=replies[command];s.write(reply.slice(0,-1));setImmediate(()=>{if(!s.destroyed)s.write('>');});
  }
 });});
 const link=await connectWifi(profile,dial(port));t.after(()=>link.disconnect());
 const {driver,reading}=await startDiagnostics(link,'car');assert.equal(reading.parameters.rpm,1726);
 assert.deepEqual(reading.codes,[{code:'P0133',status:'stored'}]);assert.deepEqual(reading.readStatuses,['stored','permanent']);
 assert.deepEqual(commands,['ATZ','ATE0','ATL0','ATS1','ATH0','ATCAF1','ATSP0','0100','ATDPN','010C','0105','0104','ATRV','03','07','0A']);
 replies['010C']='41 0C 0F A0>';commands.length=0;
 const live=await driver.readLiveParameters('car');assert.equal(live.parameters.rpm,1000);
 assert.deepEqual(commands,['010C','0105','0104','ATRV']);assert.equal(reading.parameters.rpm,1726);
 await assert.rejects(driver.clearFaults({confirmed:true,backedUpSnapshot:reading,vehicleId:'car'}));assert.equal(commands.includes('04'),false);
});
