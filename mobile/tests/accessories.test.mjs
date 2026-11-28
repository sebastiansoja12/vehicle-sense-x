import test from 'node:test';
import assert from 'node:assert/strict';
import * as accessories from '../src/accessories.ts';
import makes from '../src/vehicle-catalog-data.ts';
const {recommendAccessories,accessoryBrands}=accessories;

test('recommendations follow the selected make and recognize European spelling and aliases',()=>{
 for(const [input,name,host] of [[' Škoda ','Škoda','eshop.skoda-auto.com'],['vw','Volkswagen','www.volkswagen.pl'],['bMw','BMW','www.bmw.pl'],['KIA','Kia','www.kia.com'],['Mercedes','Mercedes-Benz','store.mercedes-benz.pl'],['Tesla','Tesla','shop.tesla.com']]){
  const result=recommendAccessories(input);
  assert.equal(result.brand.name,name);
  assert.equal(new URL(result.brand.catalog.url).hostname,host);
  assert.ok(result.items.length>=3);
 }
 assert.ok(recommendAccessories('BMW').items.some(item=>item.id==='travel-comfort'));
 assert.ok(!recommendAccessories('Toyota').items.some(item=>item.id==='travel-comfort'));
});

test('every make in the garage catalogue has its own accessory profile and all categories',()=>{
 assert.equal(accessoryBrands.length,makes.length);
 for(const make of makes){
  const result=recommendAccessories(make.name);
  assert.ok(result.brand,make.name);
  assert.ok(result.brand.name.length>0);
  for(const category of ['protection','transport','comfort','care'])assert.ok(recommendAccessories(make.name,category).items.length>0,`${make.name}: ${category}`);
 }
});

test('manually entered makes retain their identity without borrowing another make’s official catalogue',()=>{
 for(const make of ['Własna marka', 'BMW Motorrad', 'Toyota Lexus']){
  const result=recommendAccessories(make);
  assert.equal(result.brand.name,make);
  assert.equal(result.brand.catalog,null);
  assert.ok(result.items.length>0);
  assert.ok(result.items.every(item=>!['travel-comfort','youclip'].includes(item.id)));
 }
 assert.equal(recommendAccessories('   ').brand,null);
});

test('category and accent insensitive word search combine and can return no matches',()=>{
 const transport=recommendAccessories('Toyota','transport').items;
 assert.ok(transport.length>0);
 assert.ok(transport.every(item=>item.category==='transport'));
 assert.deepEqual(recommendAccessories('Toyota','transport','  BAGAZNIK   DACHOWY ').items.map(item=>item.id),['roof']);
 assert.equal(recommendAccessories('Toyota','protection','bagażnik dachowy').items.length,0);
 assert.equal(recommendAccessories('Toyota','all','nieistniejący produkt').items.length,0);
 assert.ok(recommendAccessories('Škoda','all','WNETRZE').items.length>0);
});

test('make profiles keep verified HTTPS sources separate from shared compatibility guidance',()=>{
 assert.equal(new Set(accessoryBrands.map(brand=>brand.name)).size,accessoryBrands.length);
 for(const brand of accessoryBrands){
  if(brand.catalog){
   assert.equal(new URL(brand.catalog.url).protocol,'https:');
   assert.match(brand.catalog.checkedOn,/^2026-11-(26|27)$/);
  }
  const items=recommendAccessories(brand.name).items;
  assert.equal(new Set(items.map(item=>item.id)).size,items.length);
  assert.ok(items.every(item=>item.reason.length>20&&item.check.length>20));
 }
});

test('offer searches contain only public make, model, year and a useful accessory term',()=>{
 const vehicle={make:'Saab',model:'9-3',year:2008,vin:'SECRET_VIN',plate:'SECRET_PLATE',note:'SECRET_NOTE'};
 const item=recommendAccessories('Saab').items.find(item=>item.id==='mats');
 const url=new URL(accessories.accessorySearchUrl(vehicle,item));
 assert.equal(url.origin,'https://allegro.pl');
 assert.equal(url.pathname,'/listing');
 assert.deepEqual([...url.searchParams.keys()],['string']);
 assert.equal(url.searchParams.get('string'),'dywaniki Saab 9-3 2008');
 assert.doesNotMatch(url.href,/SECRET/);
 assert.equal(new URL(accessories.accessorySearchUrl(vehicle)).searchParams.get('string'),'akcesoria Saab 9-3 2008');
});

test('make and model punctuation cannot inject URL parameters or change the offer search host',()=>{
 const item=recommendAccessories('Własna marka').items.find(item=>item.id==='trunk');
 const url=new URL(accessories.accessorySearchUrl({make:'A & O',model:'Roadster?#&redirect=https://evil.example',year:2020},item));
 assert.equal(url.origin,'https://allegro.pl');
 assert.equal(url.searchParams.size,1);
 assert.equal(url.hash,'');
 assert.equal(url.searchParams.get('string'),'mata bagażnika A & O Roadster?#&redirect=https://evil.example 2020');
});
