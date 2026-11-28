import test from 'node:test';
import assert from 'node:assert/strict';

function engine(){let options;const spoken=[];let stops=0;return {async getAvailableVoicesAsync(){return [{language:'pl-PL'}];},spoken,get options(){return options;},get stops(){return stops;},speak(text,value){spoken.push(text);options=value;},async stop(){stops++;}};}
test('cancelling during Android speech initialization never queues an utterance that can play later',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();let ready;
 speech.getAvailableVoicesAsync=()=>new Promise(resolve=>{ready=resolve;});
 const player=createRadioAudioTest(speech);const playing=player.play();const rejected=assert.rejects(playing,/przerwana/);
 assert.deepEqual(speech.spoken,[]);await player.stop();ready([{language:'pl-PL'}]);await rejected;await Promise.resolve();assert.deepEqual(speech.spoken,[]);
});
test('radio audio test speaks an explicit test phrase and waits for actual speech completion',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();const player=createRadioAudioTest(speech);
 let finished=false;const playing=player.play().then(()=>{finished=true;});await Promise.resolve();
 assert.equal(finished,false);assert.match(speech.spoken[0],/próba dźwięku/i);assert.equal(speech.options.language,'pl-PL');
 speech.options.onDone();await playing;assert.equal(finished,true);
});
test('radio test cancellation rejects playback and ignores a late completion callback',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();const player=createRadioAudioTest(speech);
 const playing=player.play();const rejected=assert.rejects(playing,/przerwana/);await Promise.resolve();await player.stop();speech.options.onDone();await rejected;assert.equal(speech.stops,1);
 await player.stop();assert.equal(speech.stops,1);
});
test('speech engine failure and overlapping playback cannot be reported as a successful radio test',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();const player=createRadioAudioTest(speech);
 const playing=player.play();const rejected=assert.rejects(playing,/syntezy mowy/);
 await assert.rejects(player.play(),/trwa/);speech.options.onError(new Error('TTS failed'));await rejected;
 const again=player.play();await Promise.resolve();speech.options.onDone();await again;
});
test('a speech engine that never completes times out and is stopped',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();const player=createRadioAudioTest(speech,5);
 await assert.rejects(player.play(),/czas/);assert.equal(speech.stops,1);
});
test('radio player reads only an explicitly supplied nonempty bounded summary and still cancels it',async()=>{
 const {createRadioAudioTest}=await import('../src/radio-audio.ts');const speech=engine();const player=createRadioAudioTest(speech);
 const playing=player.play('Toyota Corolla. Zapisany przebieg: 50000 kilometrów.');
 await Promise.resolve();assert.equal(speech.spoken[0],'Toyota Corolla. Zapisany przebieg: 50000 kilometrów.');
 const rejected=assert.rejects(playing,/przerwana/);await player.stop();await rejected;
 await assert.rejects(player.play(''),/komunikat/);await assert.rejects(player.play('x'.repeat(2001)),/komunikat/);
 assert.equal(speech.spoken.length,1);
});
