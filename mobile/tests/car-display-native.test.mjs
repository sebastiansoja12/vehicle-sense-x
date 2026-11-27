import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {Platform,state} from './fixtures/radio.mjs';
const fixture=new URL('./fixtures/radio.mjs',import.meta.url).href;
registerHooks({resolve(specifier,context,next){
 if(context.parentURL?.endsWith('/car-display.native.ts')&&['react-native','expo'].includes(specifier))return {url:fixture,shortCircuit:true};
 return next(specifier,context);
}});
test('CarPlay bridge preserves payload and explicit clear and does not attempt Android projection',async()=>{
 const bridge=await import('../src/car-display.native.ts');const writes=[];
 state.nativeModule={async syncCarDisplay(json){writes.push(JSON.parse(json??'null'));return true;}};
 Platform.OS='ios';const payload={vehicleId:'a',vehicleLabel:'Saab 9-3',subtitle:'Zapisany odczyt',photoBase64:null,recordedAt:null,rows:[]};
 assert.equal(await bridge.syncCarDisplay(payload),true);assert.deepEqual(writes[0],payload);
 await bridge.syncCarDisplay(null);assert.equal(writes[1],null);
 Platform.OS='android';assert.equal(await bridge.syncCarDisplay(payload),false);assert.equal(writes.length,2);
});
test('old native builds degrade to unavailable while native bridge failures remain visible',async()=>{
 const bridge=await import('../src/car-display.native.ts');Platform.OS='ios';state.nativeModule=null;
 assert.equal(await bridge.syncCarDisplay(null),false);
 state.nativeModule={async syncCarDisplay(){throw new Error('Write failed');}};
 await assert.rejects(bridge.syncCarDisplay(null),/Write failed/);Platform.OS='android';
});
