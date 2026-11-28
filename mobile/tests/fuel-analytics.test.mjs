import test from 'node:test';
import assert from 'node:assert/strict';
import { fuelAnalytics } from '../src/fuel-analytics.ts';
import { emptyData, addVehicle } from '../src/domain.ts';
const today = '2026-11-27';
function state(fuel = []) { return { ...addVehicle(emptyData(), { make:'Test',model:'Test',year:'2020',engine:'Test',mileage:'20000',plate:'TEST',vin:'' }, 'v', today), fuel }; }
function fill(id,date,mileage,liters,full=true,vehicleId='v') { return { id,vehicleId,date,mileage,volumeMl:liters*1000,priceCents:600,costCents:liters*600,full }; }

test('full-to-full includes partial fills, excludes baseline/open fuel and weights by distance', () => {
 const a=fuelAnalytics(state([fill('a','2026-09-01',1000,40),fill('b','2026-09-10',1200,10,false),fill('c','2026-10-01',1500,20),fill('d','2026-11-01',1600,10),fill('e','2026-11-20',1700,5,false)]),'v',today);
 assert.equal(a.periods.length,2);assert.equal(a.periods[0].volumeMl,30000);assert.equal(a.periods[0].distanceKm,500);assert.equal(a.periods[0].consumption,6);assert.equal(a.periods[1].consumption,10);
 assert.equal(a.measuredDistanceKm,600);assert.equal(a.measuredVolumeMl,40000);assert.ok(Math.abs(a.consumption-40/600*100)<1e-10);assert.equal(a.openVolumeMl,5000);
 assert.equal(a.months.at(-1).purchasedMl,15000);assert.equal(a.months.at(-1).costCents,9000);assert.equal(a.periods[0].startDate,'2026-09-01');assert.equal(a.periods[0].endDate,'2026-10-01');
});
test('missing anchor and unfinished cycle never become zero consumption', () => {
 for(const fuel of [[],[fill('a','2026-10-01',1000,20,false)],[fill('a','2026-10-01',1000,20),fill('b','2026-11-01',1200,10,false)]]){
 const a=fuelAnalytics(state(fuel),'v',today);assert.equal(a.consumption,null);assert.equal(a.measuredDistanceKm,0);assert.equal(a.periods.length,0);
 }
});
test('future entries and another car cannot affect measurements or purchase charts', () => {
 const base=[fill('a','2026-10-01',1000,40),fill('b','2026-11-01',1500,30)];
 const a=fuelAnalytics(state([...base,fill('future','2026-12-01',2000,100),fill('other','2026-11-01',9000,200,true,'other')]),'v',today);
 assert.equal(a.consumption,6);assert.equal(a.months.length,12);assert.equal(a.months[0].month,'2025-12');assert.equal(a.months.at(-1).purchasedMl,30000);assert.equal(a.futureCount,1);
});
test('duplicate and decreasing odometers break a cycle and expose excluded evidence', () => {
 const fuel=[fill('a','2026-07-01',1000,40),fill('b','2026-08-01',1000,10),fill('c','2026-09-01',1500,20),fill('d','2026-10-01',1400,30),fill('e','2026-11-01',1600,10)];
 const a=fuelAnalytics(state(fuel),'v',today);assert.equal(a.periods.length,0);assert.equal(a.consumption,null);assert.ok(a.issues.length>=2);assert.equal(a.months.at(-1).purchasedMl,10000);
});
test('monthly buckets cross year boundaries and invalid owner/date is rejected',()=>{
 const a=fuelAnalytics(state([fill('a','2025-12-31',1000,20),fill('b','2026-01-01',1200,10)]),'v',today);
 assert.equal(a.months[0].purchasedMl,20000);assert.equal(a.months[1].purchasedMl,10000);
 assert.throws(()=>fuelAnalytics(state(),'unknown',today));assert.throws(()=>fuelAnalytics(state(),'v','2026-02-30'));
});
test('dashboard and reports use the same conservative fuel measurements as charts',async()=>{
 const {vehicleSummary}=await import('../src/domain.ts');
 const fuel=[fill('a','2026-09-01',1000,40),fill('b','2026-10-01',1000,10),fill('c','2026-11-01',1500,30)];
 const s=state(fuel);assert.equal(vehicleSummary(s,'v','2026-11',today).consumption,null);
 const normal=state([fill('a','2026-09-01',1000,40),fill('b','2026-10-01',1500,30),fill('future','2026-12-01',2000,100)]);
 assert.equal(vehicleSummary(normal,'v','2026-11',today).consumption,6);
});
