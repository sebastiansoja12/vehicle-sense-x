import test from 'node:test';
import assert from 'node:assert/strict';
import {extractCatalog} from '../scripts/build-vehicle-catalog.mjs';

// Catches leaking excluded sources, duplicating case variants and merging Golf+ into Golf.
const fixture=()=>({sources:[{source_id:'rdw-nl-vehicle-register'},{source_id:'unreviewed-source'}],makes:[{make_id:1,make_name:'ŠKODA'},{make_id:2,make_name:'VOLKSWAGEN'}],modelNames:['Octavia','OCTAVIA','Secret model','Golf','Golf+','Truck only'],models:[[2020,1,11,0,2,1],[2021,1,12,1,2,1],[2021,1,13,2,2,2],[2020,2,14,3,2,1],[2020,2,15,4,7,1],[2020,2,16,5,3,1]]});
test('extracts only reviewed-source passenger cars and preserves distinct model punctuation',()=>{
 assert.deepEqual(extractCatalog(fixture()),[{name:'ŠKODA',models:['Octavia']},{name:'VOLKSWAGEN',models:['Golf','Golf+']}]);
});
test('rejects invalid tuple references and names that cannot be saved by the garage',()=>{
 for(const mutate of [d=>{d.models[0][3]=999;},d=>{d.models[0][5]=8;},d=>{d.makes[0].make_name='x'.repeat(61);},d=>{d.modelNames[0]='x'.repeat(81);},d=>{d.models[0][4]=NaN;},d=>{d.modelNames[0]='Bad\u0000name';}]){const d=fixture();mutate(d);assert.throws(()=>extractCatalog(d));}
});
test('cannot silently generate an empty catalog from an incompatible upstream schema',()=>{
 assert.throws(()=>extractCatalog({...fixture(),sources:[]}));
 assert.throws(()=>extractCatalog({...fixture(),models:[]}));
});
