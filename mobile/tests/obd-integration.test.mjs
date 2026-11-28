import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDiagnosticSnapshot} from '../src/obd/types.ts';
import {parseReadiness,decodeReadiness} from '../src/obd/readiness.ts';
import {compareDiagnostics,compareAdvancedDiagnostics} from '../src/obd/comparison.ts';
const scan={id:'before',vehicleId:'car',timestamp:100,source:'obd',adapterName:'ELM',parameters:{rpm:1000,coolantC:null,loadPercent:null,voltageV:14},codes:[],readStatuses:['stored'],supportedPids:[1,12,48,49,92],ecu:{protocol:6,responseId:'7E8'},oilTemperatureC:85,readiness:{statusBytes:[0,7,0,0],warmupsSinceClear:2,distanceSinceClearKm:10},extended:{version:1,measurements:[{pid:12,value:1000,readAt:90},{pid:48,value:2,readAt:91},{pid:49,value:10,readAt:92},{pid:92,value:85,readAt:93}],readiness:parseReadiness('41 01 00 07 00 00>'),freezeFrame:{status:'no-data',frame:0,readAt:95}}};
test('combined reports preserve legacy readiness and oil evidence without allowing contradictory extended fields',()=>{
 assert.equal(validateDiagnosticSnapshot(scan),true);assert.equal(decodeReadiness(scan.readiness).mil,scan.extended.readiness.milOn);
 for(const patch of [{oilTemperatureC:86},{readiness:{...scan.readiness,statusBytes:[128,7,0,0]}},{readiness:null},{readiness:{...scan.readiness,warmupsSinceClear:3}},{readiness:{...scan.readiness,distanceSinceClearKm:11}}])assert.equal(validateDiagnosticSnapshot({...scan,...patch}),false,JSON.stringify(patch));
 const legacy={...scan};delete legacy.extended;assert.equal(validateDiagnosticSnapshot(legacy),true);
 const advanced={...scan};delete advanced.readiness;delete advanced.oilTemperatureC;assert.equal(validateDiagnosticSnapshot(advanced),true);
});
test('workshop and advanced history comparisons retain their public contracts and consistent confirmed ECU changes',()=>{
 const after={...scan,id:'after',timestamp:200,codes:[{code:'P0133',status:'stored'}]};
 const workshop=compareDiagnostics(scan,after),advanced=compareAdvancedDiagnostics(scan,after);
 assert.equal(workshop.scope,'same-ecu');assert.equal(workshop.codes[0].change,'added');assert.equal(advanced.added[0].code,'P0133');
 const unknown={...after,ecu:undefined,extended:undefined};assert.equal(compareDiagnostics(scan,unknown).scope,'unknown-ecu');assert.throws(()=>compareAdvancedDiagnostics(scan,unknown),/ECU/);
});
