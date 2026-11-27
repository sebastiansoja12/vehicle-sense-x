import test from 'node:test';
import assert from 'node:assert/strict';
import { saveMaintenancePlan, maintenanceStatus, recordMaintenance, addOilObservation } from '../src/maintenance.ts';
import { scheduleDue, validMaintenanceSchedule } from '../src/maintenance-model.ts';
import { addVehicle, emptyData, parseStoredData } from '../src/domain.ts';
import { editService, dueReminders, removeRecord } from '../src/features.ts';
import { createBackup, parseBackup } from '../src/reports.ts';
const day='2026-11-27';
const state=()=>addVehicle(emptyData(),{make:'Test',model:'Test',engine:'Test',year:'2020',mileage:'15000',plate:'TEST',vin:''},'v',day);
const input=(patch={})=>({vehicleId:'v',component:'engine-oil',action:'replace',title:'Olej silnikowy',lastDate:'2026-01-31',lastMileage:'5000',intervalMonths:'12',intervalKm:'15000',source:'Instrukcja mojego auta, str. 20',...patch});
const plan=()=>saveMaintenancePlan(state(),input(),'p',day);

test('calendar month arithmetic clamps month ends and handles leap years',()=>{
 const base={component:'engine-oil',action:'replace',lastDate:'2024-01-31',lastMileage:1000,intervalMonths:1,intervalKm:null,source:'Instrukcja'};
 assert.deepEqual(scheduleDue(base),{dueDate:'2024-02-29',dueMileage:null});
 assert.equal(scheduleDue({...base,lastDate:'2025-01-31'}).dueDate,'2025-02-28');
 assert.equal(scheduleDue({...base,lastDate:'2024-02-29',intervalMonths:12}).dueDate,'2025-02-28');
});
test('plan is due on whichever boundary comes first, remaining counters are independent',()=>{
 const s=plan(),p=s.reminders[0];assert.equal(p.dueDate,'2027-01-31');assert.equal(p.dueMileage,20000);
 let a=maintenanceStatus(p,15000,day);assert.equal(a.due,false);assert.equal(a.remainingKm,5000);assert.equal(a.remainingDays,65);
 assert.equal(maintenanceStatus(p,20000,day).due,true);assert.equal(maintenanceStatus(p,15000,'2027-01-31').due,true);
 assert.equal(dueReminders(s,'v',day)[0].due,false);assert.equal(maintenanceStatus(p,4999,day).baselineConflict,true);
 assert.equal(maintenanceStatus(p,15000,'2025-12-01').baselineConflict,true);
});
test('source, positive intervals, nonfuture baseline and owner are validated',()=>{
 for(const patch of [{source:''},{intervalKm:'0',intervalMonths:''},{intervalKm:'',intervalMonths:''},{intervalMonths:'1.5'},{lastDate:'2026-12-01'},{lastMileage:'15001'},{lastDate:'2026-02-30'},{intervalKm:'5000000'},{vehicleId:'missing'},{component:'unknown'},{action:'unknown'}])assert.throws(()=>saveMaintenancePlan(state(),input(patch),'p',day));
 const s=plan();assert.throws(()=>saveMaintenancePlan(s,input(),'q',day));
 assert.equal(validMaintenanceSchedule({...s.reminders[0].schedule,source:''}),false);
});
test('editing a plan preserves its identity and notification choice without duplicating it',()=>{
 const s=plan();s.reminders[0].notificationId='vsx-reminder-p';
 const updated=saveMaintenancePlan(s,input({intervalKm:'10000'}),'unused',day,'p');
 assert.equal(updated.reminders.length,1);assert.equal(updated.reminders[0].id,'p');assert.equal(updated.reminders[0].dueMileage,15000);assert.equal(updated.reminders[0].notificationId,'vsx-reminder-p');
});
test('completion atomically records actual service, closes old plan and creates the next cycle',()=>{
 const s=recordMaintenance(plan(),'p',{date:day,mileage:'15000',cost:'250,50',note:'Filtr i olej'},'service','next',day);
 assert.equal(s.service[0].costCents,25050);assert.equal(s.service[0].maintenanceComponent,'engine-oil');assert.equal(s.reminders.find(r=>r.id==='p').completed,true);
 const next=s.reminders.find(r=>r.id==='next');assert.equal(next.dueDate,'2027-11-27');assert.equal(next.dueMileage,30000);assert.equal(next.notificationId,null);assert.equal(next.schedule.lastDate,day);
 assert.throws(()=>recordMaintenance(s,'p',{date:day,mileage:'15000',cost:'1',note:''},'other','other-next',day));
 assert.throws(()=>recordMaintenance(plan(),'p',{date:day,mileage:'15000',cost:'bad',note:''},'service','next',day));
 assert.throws(()=>recordMaintenance(plan(),'p',{date:'2025-01-01',mileage:'4000',cost:'0',note:''},'service','next',day));
 assert.equal(plan().service.length,0);
});
test('manual oil observations preserve low/high/unknown and zero, without inventing OBD evidence',()=>{
 const s=addOilObservation(state(),{vehicleId:'v',date:day,mileage:'15000',level:'low',addedLiters:'0,25',oilLifePercent:'0',cost:'0',note:'Odczyt z bagnetu'},'oil',day);
 assert.deepEqual(s.service[0].oilObservation,{level:'low',addedMl:250,oilLifePercent:0,source:'manual'});
 assert.equal(s.reminders.length,0);assert.equal(s.service[0].costCents,0);
 assert.deepEqual(parseBackup(createBackup(s,day)).service[0].oilObservation,s.service[0].oilObservation);
 const edited=editService(s,'oil',{vehicleId:'v',date:day,mileage:'15000',title:'Kontrola oleju',cost:'10',note:'Korekta kosztu'},day);
 assert.deepEqual(edited.service[0].oilObservation,s.service[0].oilObservation);
 for(const patch of [{level:'ok'},{addedLiters:'-1'},{oilLifePercent:'101'},{oilLifePercent:'NaN'},{addedLiters:'1.0001'}])assert.throws(()=>addOilObservation(state(),{vehicleId:'v',date:day,mileage:'15000',level:'unknown',addedLiters:'0',oilLifePercent:'',cost:'0',note:'',...patch},'oil',day));
});
test('new optional fields round-trip old storage and reject tampered due dates or observations',()=>{
 const s=plan();assert.deepEqual(parseStoredData(JSON.stringify(s)),s);assert.deepEqual(parseStoredData(JSON.stringify(state())),state());
 for(const patch of [{dueDate:'2028-01-31'},{dueMileage:1},{schedule:{...s.reminders[0].schedule,intervalKm:-1}}])assert.throws(()=>parseStoredData(JSON.stringify({...s,reminders:[{...s.reminders[0],...patch}]})));
 const o=addOilObservation(state(),{vehicleId:'v',date:day,mileage:'15000',level:'unknown',addedLiters:'0',oilLifePercent:'',cost:'0',note:''},'o',day);
 for(const patch of [{level:'ok'},{addedMl:-1},{source:'obd'},{oilLifePercent:101}])assert.throws(()=>parseStoredData(JSON.stringify({...o,service:[{...o.service[0],oilObservation:{...o.service[0].oilObservation,...patch}}]})));
 assert.equal(removeRecord(s,'vehicle','v').reminders.length,0);
});
