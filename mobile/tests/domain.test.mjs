import test from 'node:test';
import assert from 'node:assert/strict';
import * as d from '../src/domain.ts';

const day='2026-11-25';
const invalid = fn => assert.throws(fn, error => ['ValidationError','StorageFormatError'].includes(error.name));
const car={make:'Volkswagen',model:'Tiguan',year:'2021',engine:'2.0 TDI · DSG',mileage:'1000',plate:'wa 12345',vin:''};
function garage(){return d.addVehicle(d.emptyData(),car,'v1',day);}
function fuel(state,id,mileage,liters,full=true,date='2026-11-25',vehicleId='v1'){
 return d.addFuel(state,{vehicleId,date,mileage:String(mileage),liters:String(liters),price:'6,50',full},id,day);
}

test('first vehicle becomes active and normalizes fields without mutating previous state',()=>{
 const initial=d.emptyData(); const next=d.addVehicle(initial,car,'v1',day);
 assert.equal(next.activeVehicleId,'v1');assert.equal(next.vehicles[0].plate,'WA 12345');assert.equal(initial.vehicles.length,0);
 assert.equal(next.fuel.length,0);
});
test('vehicle validation rejects blank, future year, fractional mileage and invalid VIN',()=>{
 for(const patch of [{make:' '},{year:'2028'},{mileage:'1.2'},{vin:'1234567890123456I'}])
  invalid(()=>d.addVehicle(d.emptyData(),{...car,...patch},'v1',day));
});
test('fuel accepts Polish decimals, stores integer units and rounds cents once',()=>{
 const next=d.addFuel(garage(),{vehicleId:'v1',date:day,mileage:'1100',liters:'10,25',price:'6.49',full:true},'f1',day);
 assert.equal(next.fuel[0].volumeMl,10250);assert.equal(next.fuel[0].priceCents,649);assert.equal(next.fuel[0].costCents,6652);
 assert.equal(next.vehicles[0].mileage,1100);
});
test('fuel rejects imaginary dates, future dates, backwards mileage and invalid decimal values',()=>{
 const base={vehicleId:'v1',date:day,mileage:'1100',liters:'40',price:'6.50',full:true};
 for(const patch of [{date:'2026-02-30'},{date:'2026-11-26'},{mileage:'900'},{liters:'NaN'},{liters:'0'},{liters:'300'},{price:'-1'},{price:'6,123'},{price:'1e2'}])
  invalid(()=>d.addFuel(garage(),{...base,...patch},'f1',day));
});
test('fuel entries cannot be inserted before the last tanking or for an unknown vehicle',()=>{
 const state=fuel(garage(),'f1',1100,30,true,'2026-11-24');
 invalid(()=>fuel(state,'f2',1200,30,true,'2026-11-23'));
 invalid(()=>fuel(state,'f2',1200,30,true,day,'missing'));
});
test('partial tankings are accumulated between full tankings',()=>{
 let state=fuel(garage(),'f1',1000,50,true,'2026-11-01');
 state=fuel(state,'f2',1200,10,false,'2026-11-10');state=fuel(state,'f3',1500,30,true,day);
 const result=d.vehicleSummary(state,'v1','2026-11');
 assert.equal(result.consumption,8);assert.equal(result.measuredDistance,500);assert.equal(result.fuelCents,58500);
});
test('no consumption is invented without two full tankings or with zero distance',()=>{
 assert.equal(d.vehicleSummary(garage(),'v1','2026-11').consumption,null);
 let state=fuel(garage(),'f1',1000,30);assert.equal(d.vehicleSummary(state,'v1','2026-11').consumption,null);
 state=fuel(state,'f2',1000,5);assert.equal(d.vehicleSummary(state,'v1','2026-11').consumption,null);
});
test('summary keeps both vehicles isolated and filters monthly costs',()=>{
 let state=fuel(garage(),'f1',1000,10,true,'2026-10-31');
 state=d.addVehicle(state,{...car,model:'Golf',plate:'WA 99999'},'v2',day);
 state=fuel(state,'f2',1100,20,true,day,'v2');
 state=d.addService(state,{vehicleId:'v1',title:'Olej',date:day,mileage:'1000',cost:'250,99',note:''},'s1',day);
 const one=d.vehicleSummary(state,'v1','2026-11');const two=d.vehicleSummary(state,'v2','2026-11');
 assert.equal(one.fuelCents,0);assert.equal(one.serviceCents,25099);assert.equal(one.totalCents,25099);
 assert.equal(two.fuelCents,13000);assert.equal(two.serviceCents,0);assert.equal(two.consumption,null);
});
test('historical service does not decrease current mileage and rejects invalid cost or date',()=>{
 const base={vehicleId:'v1',title:'Olej',date:'2026-01-01',mileage:'500',cost:'0',note:'Przegląd'};
 const next=d.addService(garage(),base,'s1',day);assert.equal(next.vehicles[0].mileage,1000);assert.equal(next.service[0].costCents,0);
 for(const patch of [{title:''},{cost:'-1'},{date:'2026-02-29'},{mileage:'-1'}])invalid(()=>d.addService(garage(),{...base,...patch},'s1',day));
});
test('stored state round-trips and malformed or unknown schemas are rejected',()=>{
 const state=garage();assert.deepEqual(d.parseStoredData(JSON.stringify(state)),state);assert.deepEqual(d.parseStoredData(null),d.emptyData());
 for(const bad of ['{','{}',JSON.stringify({...state,version:99}),JSON.stringify({...state,activeVehicleId:'unknown'}),JSON.stringify({...state,fuel:[{vehicleId:'missing'}]})])invalid(()=>d.parseStoredData(bad));
});
test('tampered numeric fields, duplicate ids and impossible dates are rejected on load',()=>{
 const state=fuel(garage(),'f1',1100,20);
 const patches=[{vehicles:[{...state.vehicles[0],mileage:-1}]},{vehicles:[state.vehicles[0],state.vehicles[0]]},{fuel:[{...state.fuel[0],volumeMl:-1}]},{fuel:[{...state.fuel[0],date:'2026-02-30'}]},{fuel:[{...state.fuel[0],costCents:1}]}];
 for(const patch of patches)invalid(()=>d.parseStoredData(JSON.stringify({...state,...patch})));
});
test('stored fuel mileage cannot go backwards across calendar days',()=>{
 let state=fuel(garage(),'f1',1000,20,true,'2026-11-20');state=fuel(state,'f2',1200,20,true,'2026-11-23');
 const broken={...state,fuel:[state.fuel[0],{...state.fuel[1],mileage:900}]};
 invalid(()=>d.parseStoredData(JSON.stringify(broken)));
});
