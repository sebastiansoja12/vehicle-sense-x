import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../src/domain.ts';
import * as r from '../src/repository.ts';

function memory(initial=null){
 let raw=initial;let fail=false;let pending=null;
 return {get raw(){return raw},set fail(value){fail=value},set pending(value){pending=value},async getItem(){return raw},async setItem(key,value){if(pending)await pending;if(fail)throw new Error('disk full');raw=value;}};
}
const add=state=>d.addVehicle(state,{make:'Toyota',model:'Corolla',year:'2020',engine:'1.8 Hybrid',mileage:'5000',plate:'WA 123',vin:''},'v1','2026-11-25');
test('repository commits only after persistence and new instances read saved data',async()=>{
 const storage=memory();const repo=r.createRepository(storage);await repo.load();await repo.update(add);
 const reopened=r.createRepository(storage);const loaded=await reopened.load();assert.equal(loaded.vehicles[0].make,'Toyota');
 assert.deepEqual(repo.current(),loaded);
});
test('failed write leaves in-memory and persisted state unchanged and permits retry',async()=>{
 const storage=memory();const repo=r.createRepository(storage);await repo.load();storage.fail=true;
 await assert.rejects(repo.update(add),/disk full/);assert.equal(repo.current().vehicles.length,0);assert.equal(storage.raw,null);
 storage.fail=false;await repo.update(add);assert.equal(repo.current().vehicles.length,1);
});
test('corrupted persisted data cannot be overwritten by an update',async()=>{
 const storage=memory('{broken');const repo=r.createRepository(storage);
 await assert.rejects(repo.load(),error=>error.name==='StorageFormatError');
 await assert.rejects(repo.update(add));assert.equal(storage.raw,'{broken');assert.equal(repo.current(),null);
});
test('concurrent writes are rejected instead of overwriting a pending change',async()=>{
 const storage=memory();const repo=r.createRepository(storage);await repo.load();let release;
 storage.pending=new Promise(resolve=>{release=resolve});const first=repo.update(add);
 await assert.rejects(repo.update(state=>({...state,activeVehicleId:null})),/zapis/);
 assert.equal(repo.current().vehicles.length,0);release();await first;assert.equal(repo.current().vehicles.length,1);
});
test('a stale second instance preserves vehicles added by the first',async()=>{
 const storage=memory();const first=r.createRepository(storage),second=r.createRepository(storage);
 await first.load();await second.load();await first.update(add);
 await second.update(state=>d.addVehicle(state,{make:'Skoda',model:'Octavia',year:'2021',engine:'1.5 TSI',mileage:'1000',plate:'TEST 2',vin:''},'v2','2026-11-25'));
 assert.deepEqual((await first.load()).vehicles.map(v=>v.id),['v1','v2']);
});
test('a new unknown schema is preserved when an older open instance tries writing',async()=>{
 const storage=memory();const repo=r.createRepository(storage);await repo.load();
 const future=JSON.stringify({version:99,vehicles:[{id:'future'}]});await storage.setItem(r.STORAGE_KEY,future);
 await assert.rejects(repo.update(add),error=>error.name==='StorageFormatError');assert.equal(storage.raw,future);
});
test('shared exclusive access protects simultaneous writes from two instances',async()=>{
 const storage=memory();let tail=Promise.resolve();
 storage.withLock=task=>{const result=tail.then(task);tail=result.catch(()=>{});return result;};
 const first=r.createRepository(storage),second=r.createRepository(storage);await first.load();await second.load();
 await Promise.all([first.update(add),second.update(state=>d.addVehicle(state,{make:'Skoda',model:'Octavia',year:'2021',engine:'1.5 TSI',mileage:'1000',plate:'TEST 2',vin:''},'v2','2026-11-25'))]);
 assert.equal((await first.load()).vehicles.length,2);
});
