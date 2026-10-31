class SocialFxScribeCapture extends AudioWorkletProcessor {
  constructor() {super();this.buffer=new Int16Array(4096);this.offset=0;}
  process(inputs) {
    const channel=inputs[0]?.[0];
    if(!channel)return true;
    for(const value of channel){
      const sample=Math.max(-1,Math.min(1,value));
      this.buffer[this.offset++]=sample<0?sample*32768:sample*32767;
      if(this.offset===this.buffer.length){
        this.port.postMessage(this.buffer.buffer,[this.buffer.buffer]);
        this.buffer=new Int16Array(4096);this.offset=0;
      }
    }
    return true;
  }
}
registerProcessor('socialfx-scribe-capture',SocialFxScribeCapture);
