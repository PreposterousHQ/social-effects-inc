import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {transform} from 'esbuild';
const moduleUrl=new URL('.voice-volume-runtime-'+process.pid+'.mjs',import.meta.url);
const source=await readFile(new URL('../src/wizard/voice.ts',import.meta.url),'utf8');
const compiled=await transform(source,{loader:'ts',format:'esm',target:'es2022'});
await writeFile(moduleUrl,compiled.code);
let VoiceConversation;
try {({VoiceConversation}=await import(moduleUrl.href));}
finally {await unlink(moduleUrl);}

test('voice volume updates its output gain and restores the phone session on stop',async()=>{
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 const oldAudioContext=globalThis.AudioContext;
 const session={type:'auto'};
 const gainUpdates=[];
 const gain={gain:{value:1,setTargetAtTime:value=>gainUpdates.push(value)},connect(){},disconnect(){}};
 let requestMicrophone;
 const microphone=new Promise(resolve=>{requestMicrophone=resolve;});
 let closed=false;
 let trackStopped=false;
 class FakeAudioContext {
  destination={};currentTime=0;
  createGain(){return gain;}
  async resume(){}
  async close(){closed=true;}
 }
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{audioSession:session,mediaDevices:{getUserMedia:()=>microphone}}});
 globalThis.AudioContext=FakeAudioContext;
 try {
  const conversation=new VoiceConversation({onState(){},onPartial(){},onTranscript(){},onError:message=>assert.fail(message)},0.6);
  const started=conversation.start();
  await Promise.resolve();
  assert.equal(session.type,'play-and-record');
  assert.equal(gain.gain.value,0.6);
  conversation.setVolume(0.25);
  conversation.setVolume(-1);
  conversation.setVolume(2);
  assert.deepEqual(gainUpdates,[0.25,0,1]);
  conversation.stop();
  assert.equal(session.type,'auto');
  assert.equal(closed,true);
  requestMicrophone({getTracks:()=>[{stop(){trackStopped=true;}}]});
  await started;
  assert.equal(trackStopped,true);
 } finally {
  if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;
  globalThis.AudioContext=oldAudioContext;
 }
});
