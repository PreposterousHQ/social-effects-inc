import {Scribe, AudioFormat, CommitStrategy, RealtimeEvents, type RealtimeConnection} from '@elevenlabs/client';
export const voiceEndpoint = 'https://storylivingry.studio/api/socialfx/voice';
export type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
type Callbacks = {onState:(state:VoiceState)=>void; onPartial:(text:string)=>void; onTranscript:(text:string)=>void; onError:(message:string)=>void};
export class VoiceConversation {
  private audio: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private connection: RealtimeConnection | null = null;
  private input: MediaStreamAudioSourceNode | null = null;
  private capture: AudioWorkletNode | null = null;
  private speaker: AudioBufferSourceNode | null = null;
  private finishSpeech: (()=>void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private active = false;
  private ready = false;
  private state: VoiceState = 'idle';
  constructor(private callbacks: Callbacks) {}
  get isActive() {return this.active;}
  private change(state:VoiceState) {this.state=state;this.callbacks.onState(state);}
  async start() {
    this.active=true;
    this.change('connecting');
    try {
      this.audio=new AudioContext({sampleRate:24000});
      await this.audio.resume();
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      if(!this.active){stream.getTracks().forEach(track=>track.stop());return;}
      this.stream=stream;
      const response=await fetch(voiceEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'listen'}),signal:AbortSignal.timeout(15000)});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Live transcription could not start.');
      if(!this.active)return;
      await this.audio.audioWorklet.addModule(new URL('./scribe-capture.js',import.meta.url));
      if(!this.active)return;
      const connection=Scribe.connect({token:data.token,modelId:'scribe_v2_realtime',audioFormat:AudioFormat.PCM_24000,sampleRate:24000,commitStrategy:CommitStrategy.VAD,vadSilenceThresholdSecs:2,languageCode:'en'});
      this.connection=connection;
      connection.on(RealtimeEvents.SESSION_STARTED,()=>{if(this.active){this.ready=true;this.change('listening');}});
      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT,data=>{if(this.state==='listening'&&data.text.trim())this.callbacks.onPartial(data.text);});
      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT,data=>{
        if(this.state!=='listening'||!data.text.trim())return;
        this.change('thinking');
        this.callbacks.onTranscript(data.text.trim());
      });
      connection.on(RealtimeEvents.ERROR,()=>this.fail('Live transcription was interrupted. Start the conversation again.'));
      connection.on(RealtimeEvents.UNACCEPTED_TERMS,()=>this.fail('ElevenLabs requires its Speech to Text terms to be accepted in your account.'));
      connection.on(RealtimeEvents.CLOSE,()=>{if(this.active)this.fail('The listening connection ended. Start the conversation again.');});
      this.input=this.audio.createMediaStreamSource(stream);
      this.capture=new AudioWorkletNode(this.audio,'socialfx-scribe-capture');
      this.capture.port.onmessage=({data}:{data:ArrayBuffer})=>{
        if(!this.active||!this.ready)return;
        const bytes=new Uint8Array(data);
        if(this.state!=='listening')bytes.fill(0);
        let binary='';
        for(const byte of bytes)binary+=String.fromCharCode(byte);
        try{connection.send({audioBase64:btoa(binary)});}catch{this.fail('The listening connection ended. Start again when ready.');}
      };
      this.input.connect(this.capture);
      const silent=this.audio.createGain();silent.gain.value=0;
      this.capture.connect(silent).connect(this.audio.destination);
      this.timer=setTimeout(()=>this.fail('This conversation has paused. Tap Talk to Bucky to continue.'),5*60*1000);
    }catch(problem){
      const error=problem as Error;
      if(!this.active)return;
      this.fail(error.name==='NotAllowedError'?'Allow microphone access to talk with Bucky.':error.name==='NotFoundError'?'No microphone was found. Connect one and try again.':error.message);
    }
  }
  async speak(bytes:ArrayBuffer) {
    if(!this.active||!this.audio)return;
    const audio=this.audio;
    const buffer=await audio.decodeAudioData(bytes);
    if(!this.active)return;
    this.change('speaking');
    await new Promise<void>(resolve=>{
      this.finishSpeech=resolve;
      const source=audio.createBufferSource();
      this.speaker=source;source.buffer=buffer;source.connect(audio.destination);
      source.onended=()=>{this.speaker=null;this.finishSpeech=null;resolve();};
      source.start();
    });
  }
  resume() {if(this.active)this.change('listening');}
  interrupt() {this.speaker?.stop();this.speaker=null;this.finishSpeech?.();this.finishSpeech=null;this.resume();}
  private fail(message:string) {this.stop();this.callbacks.onError(message);}
  stop() {
    this.active=false;this.ready=false;
    if(this.timer)clearTimeout(this.timer);
    this.timer=null;
    this.connection?.close();this.connection=null;
    this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
    this.input?.disconnect();this.input=null;
    if(this.capture){this.capture.port.onmessage=null;this.capture.disconnect();this.capture=null;}
    this.speaker?.stop();this.speaker=null;
    this.finishSpeech?.();this.finishSpeech=null;
    void this.audio?.close();this.audio=null;
    this.change('idle');
  }
}
