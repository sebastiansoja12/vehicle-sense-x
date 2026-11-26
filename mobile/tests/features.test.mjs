import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../src/domain.ts';
import * as f from '../src/features.ts';
const today='2026-11-25';
const car={make:'Toyota',model:'Corolla',year:'2021',engine:'1.8 Hybrid',mileage:'10000',plate:'TEST',vin:''};
const garage=()=>d.addVehicle(d.emptyData(),car,'v1',today);
test('v1 migration preserves core records and initializes feature collections',()=>{
 const old={version:1,activeVehicleId:'v1',vehicles:garage().vehicles,fuel:[],service:[]};
 const migrated=d.parseStoredData(JSON.stringify(old));
 assert.equal(migrated.version,3);assert.equal(migrated.vehicles[0].id,'v1');assert.deepEqual(migrated.trips,[]);assert.deepEqual(migrated.diagnostics,[]);assert.deepEqual(migrated.reminders,[]);assert.deepEqual(migrated.comparisons,[]);assert.deepEqual(migrated.expenses,[]);
});
test('reminders become due by earlier time or mileage and completed reminders disappear',()=>{
 let state=f.addReminder(garage(),{vehicleId:'v1',title:'Olej',dueDate:'2026-12-01',dueMileage:'10000'},'r1',today);
 state=f.addReminder(state,{vehicleId:'v1',title:'Przegląd',dueDate:today,dueMileage:''},'r2',today);
 state=f.addReminder(state,{vehicleId:'v1',title:'Przyszłość',dueDate:'2027-01-01',dueMileage:'20000'},'r3',today);
 assert.deepEqual(f.dueReminders(state,'v1',today).filter(r=>r.due).map(r=>r.id).sort(),['r1','r2']);
 state=f.completeReminder(state,'r1');assert.deepEqual(f.dueReminders(state,'v1',today).filter(r=>r.due).map(r=>r.id),['r2']);
});
test('reminder requires a target and valid owner/date/mileage',()=>{
 const input={vehicleId:'v1',title:'Olej',dueDate:'',dueMileage:''};
 for(const patch of [{},{dueDate:'2026-02-30'},{dueMileage:'-1'},{vehicleId:'missing',dueDate:today}])assert.throws(()=>f.addReminder(garage(),{...input,...patch},'r1',today),e=>e.name==='ValidationError');
});
test('comparable market offers produce only a sourced range and expire after 90 days',()=>{
 let state=f.addComparison(garage(),{vehicleId:'v1',price:'70000',url:'https://example.com/offer/a',date:today,note:'Podobny rocznik'},'c1',today);
 state=f.addComparison(state,{vehicleId:'v1',price:'90000',url:'https://example.com/offer/b',date:today,note:''},'c2',today);
 state=f.addComparison(state,{vehicleId:'v1',price:'10000',url:'https://example.com/offer/old',date:'2026-01-01',note:''},'c3',today);
 assert.deepEqual(f.marketEstimate(state,'v1',today),{lowCents:7000000,highCents:9000000,medianCents:8000000,count:2,source:'manual-comparisons'});
 assert.equal(f.marketEstimate(state,'missing',today),null);
 assert.throws(()=>f.addComparison(state,{vehicleId:'v1',price:'10',url:'javascript:alert(1)',date:today,note:''},'c4',today));
});
test('deleting one vehicle cascades its own records and keeps other cars',()=>{
 let state=d.addVehicle(garage(),{...car,plate:'SECOND'},'v2',today);
 state=f.addReminder(state,{vehicleId:'v1',title:'Olej',dueDate:today,dueMileage:''},'r1',today);
 state=f.addReminder(state,{vehicleId:'v2',title:'Drugi',dueDate:today,dueMileage:''},'r2',today);
 const next=f.removeRecord(state,'vehicle','v1');assert.equal(next.activeVehicleId,'v2');assert.equal(next.vehicles.length,1);assert.deepEqual(next.reminders.map(r=>r.id),['r2']);
});
test('editing an older tanking preserves the odometer and chronology',()=>{
 let state=d.addFuel(garage(),{vehicleId:'v1',date:'2026-11-01',mileage:'10000',liters:'40',price:'6.50',full:true},'f1',today);
 state=d.addFuel(state,{vehicleId:'v1',date:today,mileage:'10500',liters:'40',price:'6.50',full:true},'f2',today);
 const next=f.editFuel(state,'f1',{vehicleId:'v1',date:'2026-11-01',mileage:'10000',liters:'40',price:'7',full:true},today);
 assert.equal(next.fuel[0].costCents,28000);assert.equal(next.vehicles[0].mileage,10500);assert.equal(next.fuel.length,2);
 assert.throws(()=>f.editFuel(state,'f1',{vehicleId:'v1',date:'2026-11-01',mileage:'11000',liters:'40',price:'7',full:true},today));
});
