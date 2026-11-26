import test from 'node:test';
import assert from 'node:assert/strict';
import {searchMakes,searchModels,chooseCatalogMake,chooseCatalogModel,initialCatalogMode} from '../src/vehicle-catalog.ts';
import {emptyData,addVehicle} from '../src/domain.ts';
import {createBackup,parseBackup} from '../src/reports.ts';

// Catches the actual offline asset being empty, unscoped or unusable with European spelling.
test('offline catalog finds European makes without case or diacritic sensitivity',()=>{
 assert.ok(searchMakes('škoda').items.includes('SKODA'));
 assert.ok(searchMakes('vw').items.includes('VOLKSWAGEN'));
 for(const [make,model] of [['SKODA','OCTAVIA'],['VOLKSWAGEN','Golf'],['DACIA','DUSTER'],['CUPRA','FORMENTOR'],['TOYOTA','Corolla']])assert.ok(searchModels(make,model).items.includes(model),`${make} ${model}`);
 assert.equal(searchModels('DACIA','OCTAVIA').total,0);
 assert.equal(searchModels('unknown','').total,0);
});
test('search bounds visible results and ranks the exact model above trim labels',()=>{
 const results=searchModels('VOLKSWAGEN','golf',5);
 assert.equal(results.items[0],'Golf');assert.equal(results.items.length,5);assert.ok(results.total>5);
 assert.equal(searchModels('VOLKSWAGEN','golf+').total,0);
 assert.ok(searchMakes('',5).total>5);assert.equal(searchMakes('',5).items.length,5);
});
test('choosing a different make clears the old model without touching other form values',()=>{
 const before={make:'SKODA',model:'OCTAVIA',year:'2020',engine:'Własny silnik'};
 assert.deepEqual(chooseCatalogMake(before,'DACIA'),{...before,make:'DACIA',model:''});
 assert.deepEqual(before,{make:'SKODA',model:'OCTAVIA',year:'2020',engine:'Własny silnik'});
 assert.equal(chooseCatalogMake(before,'škoda').model,'OCTAVIA');
 assert.throws(()=>chooseCatalogModel(before,'DUSTER'));
 assert.equal(chooseCatalogModel({...before,model:''},'octavia').model,'OCTAVIA');
});
test('manual and existing vehicle names remain saveable and round trip without catalog coercion',()=>{
 assert.equal(initialCatalogMode('',''),'catalog');assert.equal(initialCatalogMode('Škoda','Octavia'),'catalog');
 assert.equal(initialCatalogMode('Własna marka','Własny model'),'manual');assert.equal(initialCatalogMode('SKODA','Nieznana wersja'),'manual');
 const input={make:'Własna marka',model:'Własny model',year:'2001',engine:'Benzyna',mileage:'1200',plate:'TEST',vin:''};
 const data=addVehicle(emptyData(),input,'manual','2026-11-25');
 assert.equal(parseBackup(createBackup(data,'2026-11-25')).vehicles[0].model,'Własny model');
});
