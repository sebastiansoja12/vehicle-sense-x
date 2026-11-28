import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from '../node_modules/typescript/lib/typescript.js';
import * as parameters from '../src/obd/parameters.ts';
import * as history from '../src/obd/live-history.ts';
const compiled=ts.transpileModule(readFileSync(new URL('../src/obd/LiveDataPanel.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function panel(disabled=false,hasSamples=true){
 const exports=[],jsx=(type,props)=>({type,props:props??{}});
 const modules={react:{useState:initial=>[initial,()=>{}]},'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'react-native':{View:'View',Text:'Text',TextInput:'TextInput',Switch:'Switch'},'react-native-svg':{default:'Svg',Path:'Path',Line:'Line',Circle:'Circle'},'./parameters':parameters,'./live-history':history,'../ui':{Button:'Button',Note:'Note',Stat:'Stat',number:String},'../theme':{styles:{},colors:{}}};
 const module={exports:{}};vm.runInNewContext(compiled,{module,exports:module.exports,require:name=>{assert.ok(name in modules,name);return modules[name];}});
 const tree=module.exports.LiveDataPanel({supportedPids:[12],selectedPids:[12],onSelection:()=>{},interval:5,onInterval:()=>{},live:false,onLive:()=>{},disabled,connected:false,history:hasSamples?[{vehicleId:'car',timestamp:1000,adapterName:'ELM',parameters:{rpm:0,coolantC:null,loadPercent:null,voltageV:14},measurements:[{pid:12,value:0,readAt:900}]}]:[],onExport:format=>exports.push(format),onReset:()=>{}});
 const nodes=[];function visit(node){if(Array.isArray(node))node.forEach(visit);else if(node&&typeof node==='object'){nodes.push(node);visit(node.props?.children);}}visit(tree);
 return {exports,buttons:nodes.filter(n=>n.type==='Button'&&n.props.label.startsWith('Eksportuj sesję Live Data'))};
}
test('session export controls route CSV, JSON and printable reports even after disconnection',()=>{
 const p=panel();assert.equal(p.buttons.length,3);
 for(const b of p.buttons){assert.equal(b.props.disabled,false);b.props.onPress();}
 assert.deepEqual(p.exports,['csv','json','report']);
});
test('session export controls cannot run during a pending diagnostic operation',()=>{
 const p=panel(true);assert.equal(p.buttons.length,3);assert.ok(p.buttons.every(b=>b.props.disabled===true));
});
test('an empty session offers no export controls',()=>{assert.equal(panel(false,false).buttons.length,0);});
