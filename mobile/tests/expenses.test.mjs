import test from 'node:test';import assert from 'node:assert/strict';
import {emptyData,addVehicle,addFuel,addService} from '../src/domain.ts';
import {expenseSummary,estimateTripFuelCost} from '../src/expenses.ts';
const day='2026-11-25';
function fixture(){let s=addVehicle(emptyData(),{make:'A',model:'B',year:'2020',engine:'2.0',mileage:'0',plate:'TEST',vin:''},'a',day);s=addFuel(s,{vehicleId:'a',date:'2026-10-01',mileage:'0',liters:'40',price:'6',full:true},'f1',day);s=addFuel(s,{vehicleId:'a',date:'2026-11-01',mileage:'500',liters:'40',price:'6.50',full:true},'f2',day);return addService(s,{vehicleId:'a',date:day,mileage:'500',title:'Olej',cost:'100',note:''},'s1',day);}
test('expense summary separates selected month and year and weights fuel prices by volume',()=>{const s=fixture();const a=expenseSummary(s,'a','2026-11');assert.equal(a.monthCents,36000);assert.equal(a.yearCents,60000);assert.equal(a.averagePriceCents,625);assert.equal(a.estimatedCost100KmCents,5200);assert.equal(expenseSummary(s,'other','2026-11').monthCents,0);});
test('estimated trip fuel uses known full-to-full consumption and latest fuel price, never zero for missing data',()=>{assert.equal(estimateTripFuelCost(emptyData(),'a',10000),null);assert.equal(estimateTripFuelCost(fixture(),'a',10000),520);assert.equal(estimateTripFuelCost(fixture(),'a',NaN),null);});
