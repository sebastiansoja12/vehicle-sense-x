import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from '../node_modules/typescript/lib/typescript.js';
import {hasDiagnosticBackup} from '../src/obd/backup.ts';

// Exercise the real screen's async handlers with native I/O replaced at its boundary.
const compiled=ts.transpileModule(readFileSync(new URL('../src/obd/DiagnosticsScreen.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
const report={id:'previous',vehicleId:'car',timestamp:1000,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:80,loadPercent:50,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[4,5,12],ecu:{protocol:6,responseId:'7E8'}};
function harness({scanStop=async()=>{},createLink,selectEcu=async()=>{},records=[]}={}) {
 const slots=[];let cursor=0,layouts=[],tree,factoryCalls=0;const scanOptions=[];
 const state=initial=>{const index=cursor++;if(!(index in slots))slots[index]=typeof initial==='function'?initial():initial;return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;}];};
 const ref=initial=>{const index=cursor++;return slots[index]??(slots[index]={current:initial});};
 const jsx=(type,props)=>({type,props:props??{}});
 const link={adapterName:'ELM',disconnect:async()=>{},onDisconnected:()=>()=>{}};
 const driver={selectEcu,readSnapshot:async(_vehicle,options)=>{scanOptions.push(options);return {...report,id:'new',ecu:{protocol:6,responseId:'7E9'}};}};
 const modules={
  react:{useState:state,useRef:ref,useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:()=>{},useLayoutEffect:fn=>layouts.push(fn)},
  'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
  'react-native':{View:'View',Text:'Text',TextInput:'TextInput',Switch:'Switch',Platform:{OS:'android'},AppState:{}},
  'expo-constants':{default:{executionEnvironment:'bare'}},
  'expo-router':{router:{},useFocusEffect:()=>{},useIsFocused:()=>true},
  '../AppProvider':{useApp:()=>({data:{activeVehicleId:'car',diagnostics:records,vehicles:[{id:'car',vin:''}]},recordingVehicleId:null,busy:false})},
  '../ui':Object.fromEntries(['Page','Title','Section','Note','Button','Empty'].map(name=>[name,name])),
  './SnapshotView':{Snapshot:'Snapshot'},'./LiveDataPanel':{LiveDataPanel:'LiveDataPanel'},
  '../theme':{styles:{}},'./backup':{hasDiagnosticBackup},
  '../key-value':{keyValue:{setItem:async()=>{}}},
  '../file-export':{shareTextFile:async()=>{}},
  './DiagnosticHistory':{DiagnosticHistory:'DiagnosticHistory',DiagnosticExports:'DiagnosticExports'},
  './ble-discovery':{validAutoProfile:()=>true},
  './ble':{validateBleProfile:()=>true,scanDevices:async()=>scanStop,createBleTransport:async()=>{factoryCalls++;return createLink?createLink():link;}},
  './session':{startDiagnostics:async()=>({driver,reading:report,ecus:[{protocol:6,responseId:'7E8'},{protocol:6,responseId:'7E9'}]})},
 };
 const module={exports:{}};vm.runInNewContext(compiled,{module,exports:module.exports,require:name=>modules[name]??{},setTimeout,clearTimeout,setInterval,clearInterval,console});
 const render=()=>{cursor=0;layouts=[];const root=module.exports.DiagnosticsScreen();tree=root.type(root.props);for(const fn of layouts)fn();return tree;};
 const all=()=>{const nodes=[];const visit=node=>{if(Array.isArray(node))node.forEach(visit);else if(node&&typeof node==='object'){nodes.push(node);visit(node.props?.children);}};visit(render());return nodes;};
 return {
  get factoryCalls(){return factoryCalls;},
  get scanOptions(){return scanOptions;},
  async click(label){const button=all().find(node=>node.type==='Button'&&node.props.label===label);assert.ok(button,`button ${label}; visible: ${all().filter(n=>n.type==='Text'||n.type==='Button').map(n=>n.props.label??n.props.children).join(' | ')}`);assert.equal(!!button.props.disabled,false,label);button.props.onPress();await flush();},
  get report(){return all().find(node=>node.type==='Snapshot')?.props.value;},
  get backupDisabled(){return all().find(node=>node.type==='Switch'&&node.props.accessibilityLabel==='Potwierdzam zapis kopii odczytu OBD')?.props.disabled;},
  async exportHistory(scan){all().find(node=>node.type==='DiagnosticHistory').props.onExport(scan,'json');await flush();},
 };
}
test('cancelling a connection while scan cleanup is pending never creates a transport later',async()=>{
 const cleanup=deferred();const ui=harness({scanStop:()=>cleanup.promise});
 await ui.click('Wyszukaj urządzenia BLE');await ui.click('Połącz i odczytaj samochód');
 await ui.click('Przerwij odczyt i rozłącz adapter');cleanup.resolve();await flush();assert.equal(ui.factoryCalls,0);
});
test('a cancelled reconnect retains the last complete unsaved diagnostic report',async()=>{
 const pending=deferred();let calls=0;const link={adapterName:'ELM',disconnect:async()=>{},onDisconnected:()=>()=>{}};
 const ui=harness({createLink:()=>++calls===1?link:pending.promise});
 await ui.click('Połącz i odczytaj samochód');assert.equal(ui.report?.id,'previous');
 await ui.click('Rozłącz adapter');await ui.click('Połącz i odczytaj samochód');await ui.click('Przerwij odczyt i rozłącz adapter');
 pending.resolve(link);await flush();assert.equal(ui.report?.id,'previous');
});
test('cancelling an ECU change retains the last complete report without accepting a late replacement',async()=>{
 const selection=deferred(),ui=harness({selectEcu:()=>selection.promise});
 await ui.click('Połącz i odczytaj samochód');await ui.click('Sterownik CAN 7E9');
 await ui.click('Przerwij odczyt i rozłącz adapter');selection.resolve();await flush();assert.equal(ui.report?.id,'previous');
});
test('exporting a different historical report with a colliding ID cannot enable the clear backup confirmation',async()=>{
 const older={...report,timestamp:500},ui=harness({records:[older]});
 await ui.click('Połącz i odczytaj samochód');assert.equal(ui.backupDisabled,true);
 await ui.exportHistory(older);assert.equal(ui.backupDisabled,true);
 await ui.exportHistory(report);assert.equal(ui.backupDisabled,false);
});

test('the full CAN identification scan requires an explicit button action and passes both scan options',async()=>{
 const ui=harness();await ui.click('Połącz i odczytaj samochód');assert.equal(ui.scanOptions.length,0);
 await ui.click('Pełny skan z identyfikacją ECU');assert.equal(ui.scanOptions.length,1);assert.equal(ui.scanOptions[0].extended,true);assert.equal(ui.scanOptions[0].identification,true);
});
