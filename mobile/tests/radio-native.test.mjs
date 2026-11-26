import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {Platform,state} from './fixtures/radio.mjs';
const fixture=new URL('./fixtures/radio.mjs',import.meta.url).href;
registerHooks({resolve(specifier,context,next){
 if(context.parentURL?.endsWith('/radio.native.ts')&&['react-native','expo-speech'].includes(specifier))return {url:fixture,shortCircuit:true};
 return next(specifier,context);
}});
const radio=await import('../src/radio.native.ts');
test('Android radio setup opens documented Bluetooth settings and reports an unavailable settings activity',async()=>{
 await radio.openBluetoothSettings();assert.deepEqual(state.intents,['android.settings.BLUETOOTH_SETTINGS']);
 state.settingsError=new Error('No activity');await assert.rejects(radio.openBluetoothSettings(),/No activity/);state.settingsError=null;
});
test('iOS setup opens app settings without using private Bluetooth URL schemes',async()=>{
 Platform.OS='ios';await radio.openBluetoothSettings();assert.equal(state.settings,1);assert.equal(state.intents.length,1);Platform.OS='android';
});
test('native audio test delegates a fixed phrase to the OS speech engine and propagates failure',async()=>{
 const player=radio.createRadioTest();const playing=player.play();const rejected=assert.rejects(playing,/syntezy mowy/);await Promise.resolve();
 const utterance=state.utterances.at(-1);assert.match(utterance.text,/Próba dźwięku/);assert.equal(utterance.options.useApplicationAudioSession,false);
 utterance.options.onError(new Error('No TTS voice'));await rejected;
});
test('web radio boundary refuses hardware actions instead of reporting a connected radio',async()=>{
 const web=await import('../src/radio.ts');await assert.rejects(web.openBluetoothSettings());await assert.rejects(web.createRadioTest().play());
});
