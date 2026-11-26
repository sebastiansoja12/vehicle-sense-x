import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../src/domain.ts';
import * as f from '../src/features.ts';
import * as r from '../src/reports.ts';
import {expenseSummary,estimateTripFuelCost} from '../src/expenses.ts';
import {buildAssistantContext} from '../src/assistant-context.ts';
const today='2026-11-26';
const vehicle={make:'Toyota',model:'Corolla',year:'2020',engine:'Hybrid',mileage:'0',plate:'PRIVATE',vin:''};
const garage=()=>d.addVehicle(d.emptyData(),vehicle,'car',today);
const input={vehicleId:'car',date:today,category:'parking',title:'Parking',cost:'0,29',note:'Private receipt note'};

test('schema 1 and 2 migrate to a complete schema 3 without losing existing history',()=>{
 const current=garage();const v2={...current,version:2};delete v2.expenses;
 const migrated=d.parseStoredData(JSON.stringify(v2));assert.equal(migrated.version,3);assert.deepEqual(migrated.expenses,[]);assert.deepEqual(migrated.vehicles,current.vehicles);
 const retained={id:'imported',vehicleId:'car',date:today,category:'other',title:'Existing expense',costCents:100,note:''};
 assert.deepEqual(d.parseStoredData(JSON.stringify({...v2,expenses:[retained]})).expenses,[retained]);
 assert.throws(()=>d.parseStoredData(JSON.stringify({...v2,expenses:null})),/odczytać/);
 const v1={version:1,activeVehicleId:'car',vehicles:current.vehicles,fuel:[],service:[]};const older=d.parseStoredData(JSON.stringify(v1));assert.equal(older.version,3);assert.deepEqual(older.expenses,[]);assert.deepEqual(older.trips,[]);
 const invalid={...current,version:3};delete invalid.expenses;assert.throws(()=>d.parseStoredData(JSON.stringify(invalid)),/odczytać/);
});
test('an ownership expense stores exact grosz and preserves vehicle mileage',()=>{
 const original=garage();const next=d.addExpense(original,input,'parking',today);
 assert.equal(next.expenses[0].costCents,29);assert.equal(next.expenses[0].category,'parking');assert.equal(next.vehicles[0].mileage,0);assert.equal(original.expenses.length,0);
 assert.equal(d.addExpense(original,{...input,cost:'1000000'},'max',today).expenses[0].costCents,100000000);
});
test('invalid dates, categories, amounts and text are rejected without committing an entry',()=>{
 for(const patch of [{vehicleId:'missing'},{date:'2026-02-30'},{date:'2026-11-27'},{date:'1899-01-01'},{category:'fuel'},{category:'unknown'},{title:' '},{title:'x'.repeat(101)},{note:'x'.repeat(1001)},...['0','-1','NaN','1e2','1.001','1000000.01',''].map(cost=>({cost}))]){
  assert.throws(()=>d.addExpense(garage(),{...input,...patch},'expense',today),{name:'ValidationError'},JSON.stringify(patch));
 }
});
test('expense IDs share the same uniqueness boundary as fuel and reminders',()=>{
 const state=d.addExpense(garage(),input,'expense',today);
 assert.throws(()=>d.addExpense(state,input,'expense',today));assert.throws(()=>d.addExpense(state,input,'car',today));
 assert.throws(()=>d.addFuel(state,{vehicleId:'car',date:today,mileage:'0',liters:'10',price:'6',full:true},'expense',today));
 assert.throws(()=>f.addReminder(state,{vehicleId:'car',title:'Oil',dueDate:'2027-01-01',dueMileage:''},'expense',today));
});
test('editing an expense replaces its value once and cannot transfer it to another vehicle',()=>{
 let state=d.addExpense(garage(),input,'expense',today);state=d.addVehicle(state,{...vehicle,plate:'SECOND'},'second',today);
 const edited=f.editExpense(state,'expense',{...input,category:'insurance',title:'OC',cost:'1234.56'},today);
 assert.equal(edited.expenses.length,1);assert.equal(edited.expenses[0].costCents,123456);assert.equal(edited.expenses[0].id,'expense');assert.equal(state.expenses[0].costCents,29);
 assert.throws(()=>f.editExpense(state,'expense',{...input,vehicleId:'second'},today));assert.throws(()=>f.editExpense(state,'missing',input,today));
});
test('expense deletion and vehicle deletion remove only the selected ownership records',()=>{
 let state=d.addExpense(garage(),input,'first',today);state=d.addVehicle(state,{...vehicle,plate:'SECOND'},'second',today);state=d.addExpense(state,{...input,vehicleId:'second'},'second-expense',today);
 const removed=f.removeRecord(state,'expense','first');assert.deepEqual(removed.expenses.map(e=>e.id),['second-expense']);assert.equal(state.expenses.length,2);
 const carRemoved=f.removeRecord(state,'vehicle','car');assert.deepEqual(carRemoved.expenses.map(e=>e.id),['second-expense']);assert.equal(carRemoved.vehicles.length,1);
});
test('monthly and yearly totals include every cost once and isolate the selected vehicle',()=>{
 let state=d.addFuel(garage(),{vehicleId:'car',date:today,mileage:'0',liters:'10',price:'6.50',full:true},'fuel',today);
 state=d.addService(state,{vehicleId:'car',date:today,mileage:'0',title:'Oil',cost:'100',note:''},'service',today);
 for(const [id,patch] of [['insurance',{category:'insurance',cost:'1200'}],['parking',{cost:'8.50'}],['toll',{category:'toll',date:'2026-10-01',cost:'5'}],['old',{date:'2025-01-01',cost:'2'}]])state=d.addExpense(state,{...input,...patch},id,today);
 state=d.addVehicle(state,{...vehicle,plate:'SECOND'},'second',today);state=d.addExpense(state,{...input,vehicleId:'second',cost:'1000'},'other-car',today);
 const summary=d.vehicleSummary(state,'car','2026-11');assert.equal(summary.otherCents,120850);assert.equal(summary.totalCents,137350);
 const costs=expenseSummary(state,'car','2026-11');assert.equal(costs.monthCents,137350);assert.equal(costs.yearCents,137850);assert.equal(costs.averagePriceCents,650);
});
test('ownership expenses never enter fuel-consumption estimates or AI context',()=>{
 let state=d.addFuel(garage(),{vehicleId:'car',date:'2026-11-01',mileage:'0',liters:'40',price:'6',full:true},'f1',today);
 state=d.addFuel(state,{vehicleId:'car',date:today,mileage:'500',liters:'40',price:'6.50',full:true},'f2',today);
 state=d.addExpense(state,{...input,title:'PRIVATE-INSURANCE',note:'PRIVATE-POLICY-NOTE',cost:'9000'},'expense',today);
 assert.equal(estimateTripFuelCost(state,'car',100000),5200);
 const context=JSON.stringify(buildAssistantContext(state,'car','2026-11'));assert.doesNotMatch(context,/PRIVATE-INSURANCE|PRIVATE-POLICY-NOTE|900000/);
});
test('backups preserve ownership entries and reject malformed or orphaned records',()=>{
 const state=d.addExpense(garage(),input,'expense',today);assert.deepEqual(r.parseBackup(r.createBackup(state,today)).expenses,state.expenses);
 for(const patch of [{vehicleId:'missing'},{id:'car'},{category:'unknown'},{costCents:0},{costCents:1.5},{costCents:100000001},{date:'2026-02-30'},{note:42}]){
  const invalid=structuredClone(state);Object.assign(invalid.expenses[0],patch);assert.throws(()=>d.parseStoredData(JSON.stringify(invalid)),undefined,JSON.stringify(patch));
 }
 for(const expenses of [null,{},new Array(10001).fill(state.expenses[0])])assert.throws(()=>d.parseStoredData(JSON.stringify({...state,expenses})));
});
test('backup import rejects future ownership expenses without locking existing storage after a clock change',()=>{
 const state=d.addExpense(garage(),input,'expense',today);state.expenses[0].date='9999-12-31';
 assert.doesNotThrow(()=>d.parseStoredData(JSON.stringify(state)));
 assert.throws(()=>r.parseBackup(r.createBackup(state,today)),/przysz/);
});
test('expense CSV protects spreadsheet cells while the sale report includes only the cost total',()=>{
 const state=d.addExpense(garage(),{...input,title:'=FORMULA',note:'PRIVATE-EXPENSE-NOTE',cost:'12.34'},'expense',today);
 const csv=r.expensesCsv(state,'car');assert.match(csv,/"'=FORMULA"/);assert.match(csv,/12.34/);assert.match(csv,/PRIVATE-EXPENSE-NOTE/);assert.doesNotMatch(r.expensesCsv(state,'missing'),/PRIVATE-EXPENSE-NOTE/);
 const report=r.healthReportHtml(state,'car',today);assert.match(report,/12.34 zł/);assert.doesNotMatch(report,/PRIVATE-EXPENSE-NOTE|=FORMULA/);
});
