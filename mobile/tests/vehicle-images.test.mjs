import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicleImageQuery,parseVehicleImages,lookupVehicleImages} from '../src/vehicle-images.ts';
const car={make:'BMW',model:'320i',year:2020,vin:'SECRET_VIN',plate:'SECRET_PLATE'};
const image={pageid:123,title:'File:BMW 320i.jpg',imageinfo:[{mime:'image/jpeg',thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/BMW.jpg/960px-BMW.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:BMW_320i.jpg',extmetadata:{Artist:{value:'<a href="/">Jane Doe</a>'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]};
test('image search uses only the model identity, escapes query operators and sends no VIN or plate',async()=>{
 const url=new URL(vehicleImageQuery(car));
 assert.equal(url.origin,'https://commons.wikimedia.org');assert.equal(url.searchParams.get('origin'),'*');
 assert.ok(url.searchParams.get('gsrsearch').includes('BMW 320i'));assert.ok(!url.href.includes('SECRET'));
 const injected=new URL(vehicleImageQuery({...car,model:'320i" OR intitle:secret&origin=x'}));
 assert.ok(!injected.searchParams.get('gsrsearch').includes('OR'));assert.equal(injected.searchParams.get('origin'),'*');
 let calls=0;await assert.rejects(lookupVehicleImages({...car,make:''},{},async()=>{calls++;}),/markę/);assert.equal(calls,0);
});
test('only attributable Commons raster thumbnails are accepted; titles and authors render as plain text',()=>{
 const [photo]=parseVehicleImages({query:{pages:[image]}});
 assert.equal(photo.author,'Jane Doe');assert.equal(photo.license,'CC BY-SA 4.0');assert.equal(photo.title,'BMW 320i.jpg');
 for(const change of [{thumburl:'https://evil.example/image.jpg'},{thumburl:'https://upload.wikimedia.org.evil.example/image.jpg'},{mime:'image/svg+xml'},{descriptionurl:'javascript:alert(1)'},{extmetadata:{Artist:{value:'Jane'}}}])
  assert.deepEqual(parseVehicleImages({query:{pages:[{...image,imageinfo:[{...image.imageinfo[0],...change}]}]}}),[]);
 assert.throws(()=>parseVehicleImages({error:{info:'SECRET'}}),/Commons/);
 assert.deepEqual(parseVehicleImages({batchcomplete:true}),[]);
});
test('image client bounds responses and rejects redirects and provider failures without leaking raw errors',async()=>{
 const answer=await lookupVehicleImages(car,{},async(url,options)=>{
  assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');return Response.json({query:{pages:[image]}});
 });assert.equal(answer.length,1);
 for(const response of [new Response('SECRET',{status:503}),new Response('x',{headers:{'content-type':'text/html'}}),new Response('x',{headers:{'content-type':'application/json','content-length':'999999'}}),Response.json({error:{info:'SECRET'}})]){
  await assert.rejects(lookupVehicleImages(car,{},async()=>response),error=>!error.message.includes('SECRET'));
 }
 const controller=new AbortController();controller.abort();let calls=0;
 await assert.rejects(lookupVehicleImages(car,{signal:controller.signal},async()=>{calls++;}),{name:'AbortError'});assert.equal(calls,0);
});

test('when a model year has no photos, search broadens only to the same model for manual selection',async()=>{
 const queries=[];const photos=await lookupVehicleImages(car,{},async url=>{queries.push(new URL(url).searchParams.get('gsrsearch'));return Response.json(queries.length===1?{batchcomplete:true}:{query:{pages:[image]}});});
 assert.equal(queries.length,2);assert.match(queries[0],/2020/);assert.ok(!queries[1].includes('2020'));assert.match(queries[1],/BMW 320i/);assert.equal(photos.length,1);
});

test('accepts the current official Wikimedia thumbnail CDN and rejects lookalike hosts',()=>{
 const current={...image,imageinfo:[{...image.imageinfo[0],thumburl:'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/BMW.jpg/960px-BMW.jpg'}]};
 assert.equal(parseVehicleImages({query:{pages:[current]}}).length,1);
 current.imageinfo[0].thumburl='https://thumb.wikimedia.org.evil.example/wikipedia/commons/a.jpg';
 assert.equal(parseVehicleImages({query:{pages:[current]}}).length,0);
});

test('aborting an in-flight search stops waiting even if the provider never settles',{timeout:1000},async()=>{
 const controller=new AbortController();let providerSignal;
 const pending=lookupVehicleImages(car,{signal:controller.signal},async(_url,options)=>{providerSignal=options.signal;return new Promise(()=>{});});
 controller.abort();await assert.rejects(pending,{name:'AbortError'});assert.equal(providerSignal.aborted,true);
});
test('oversized streamed bodies and malformed JSON are rejected as provider failures',async()=>{
 for(const raw of [' '.repeat(131073),'{broken'])await assert.rejects(lookupVehicleImages(car,{},async()=>new Response(raw,{headers:{'content-type':'application/json'}})),/Wikimedia Commons/);
});
