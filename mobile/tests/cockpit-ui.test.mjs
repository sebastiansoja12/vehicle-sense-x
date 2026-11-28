import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from '../node_modules/typescript/lib/typescript.js';
import {validAsset} from '../src/media.ts';
import {retainDecodedSource} from '../src/vin-decoder.ts';
const compiled=ts.transpileModule(readFileSync(new URL('../src/CockpitIdentity.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const base64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6IP0AAAAASUVORK5CYII=';
test('replacing a failed owner photograph immediately displays the new image without remounting the cockpit',()=>{
 const slots=[];let cursor=0;
 const jsx=(type,props)=>({type,props});
 const modules={react:{useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=value;}];},useRef:initial=>{const i=cursor++;return slots[i]??(slots[i]={current:initial});},useEffect:()=>{}},'react/jsx-runtime':{jsx,jsxs:jsx},'react-native':{Image:'Image',Text:'Text',View:'View',Pressable:'Pressable',StyleSheet:{create:value=>value}},'expo-router':{useIsFocused:()=>true},'./AppProvider':{useApp:()=>({})},'./media':{validAsset},'./vin-decoder':{retainDecodedSource}};
 const module={exports:{}};vm.runInNewContext(compiled,{module,exports:module.exports,require:name=>modules[name]??{}});
 const vehicle={id:'car',make:'BMW',model:'320i',year:2020,vin:'',photos:[{id:'a',mime:'image/png',base64,date:'2026-11-28',name:'photo.png'}]};
 function render(){cursor=0;const nodes=[];const visit=node=>{if(Array.isArray(node))node.forEach(visit);else if(node&&typeof node==='object'){nodes.push(node);visit(node.props?.children);}};visit(module.exports.CockpitIdentity({vehicle,busy:false,canReadVin:false}));return nodes.find(node=>node.type==='Image');}
 const first=render();assert.ok(first);first.props.onError();assert.equal(render(),undefined);
 vehicle.photos=[{...vehicle.photos[0],id:'b'}];
 // Replacing the asset can keep identical bytes: changing its id is also a new photo attempt.
 assert.ok(render());
});
