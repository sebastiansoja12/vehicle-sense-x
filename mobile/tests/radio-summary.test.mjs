import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyData,addVehicle,addFuel} from '../src/domain.ts';
import {buildRadioSummary,parseAudioOutputs} from '../src/radio-summary.ts';

test('spoken summary uses the selected garage vehicle and never reads identifiers or private notes',()=>{
 let data=addVehicle(emptyData(),{make:'Toyota',model:'Corolla',year:'2020',engine:'Benzyna',mileage:'50000',plate:'SECRET_PLATE',vin:'WVWZZZ1JZXW000001'},'a','2026-11-27');
 data=addVehicle(data,{make:'Ford',model:'Focus',year:'2019',engine:'Diesel',mileage:'90000',plate:'OTHER_PLATE',vin:''},'b','2026-11-27');
 data.reminders=[{id:'r',vehicleId:'a',title:'SECRET_NOTE',dueDate:'2026-11-26',dueMileage:null,completed:false,notificationId:null}];
 const text=buildRadioSummary(data,'a','2026-11-27');
 assert.match(text,/Toyota Corolla/);assert.match(text,/50.?000/);assert.match(text,/termin.*1/i);
 assert.match(text,/zapisany przebieg/i);assert.match(text,/Brak danych do obliczenia spalania/);
 for(const secret of ['Ford','Focus','SECRET','WVWZZZ1JZXW000001','OTHER_PLATE'])assert.ok(!text.includes(secret));
 assert.throws(()=>buildRadioSummary(data,'missing','2026-11-27'),/samochód/);
});
test('spoken fuel result comes from recorded tankings, without pretending it is live car data',()=>{
 let data=addVehicle(emptyData(),{make:'Saab',model:'9-3',year:'2008',engine:'Benzyna',mileage:'1000',plate:'TEST',vin:''},'a','2026-11-27');
 for(const [id,date,mileage] of [['f1','2026-11-25','1000'],['f2','2026-11-26','1500']])data=addFuel(data,{vehicleId:'a',date,mileage,liters:'40',price:'6',full:true},id,'2026-11-27');
 assert.match(buildRadioSummary(data,'a','2026-11-27'),/8.*litr.*100 kilometrów/);
 assert.match(buildRadioSummary(data,'a','2026-11-27'),/zapisanych tankowań/);
});
test('available Android audio devices remain distinct from an active iOS route',()=>{
 const outputs=[{name:'Radio',type:'bluetooth'}];
 assert.deepEqual(parseAudioOutputs({scope:'available',outputs}),{scope:'available',outputs});
 assert.deepEqual(parseAudioOutputs({scope:'current',outputs:[{name:'Car Audio',type:'car'}]}),{scope:'current',outputs:[{name:'Car Audio',type:'car'}]});
 assert.deepEqual(parseAudioOutputs({scope:'available',outputs:[]}),{scope:'available',outputs:[]});
 for(const invalid of [null,{scope:'connected',outputs},{scope:'current',outputs:[{name:'Radio',type:'carplay-connected'}]},{scope:'available',outputs:[{name:42,type:'bluetooth'}]}])assert.throws(()=>parseAudioOutputs(invalid),/audio/);
});
