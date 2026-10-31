import {useEffect,useRef,useState,type FormEvent} from 'react';
import {VoiceConversation,voiceEndpoint,type VoiceState} from './voice';
type Source={title:string;url:string;kind?:string};
type Turn={role:'user'|'assistant';content:string;sources?:Source[]};
const volumeKey='socialfx-v4:bucky-volume';
function loadVolume() {
  try {const saved=localStorage.getItem(volumeKey);const value=Number(saved);if(saved!==null&&Number.isFinite(value)&&value>=0&&value<=1)return value;}catch{}
  return 1;
}
const transcriptKey='socialfx-v4:bucky-transcript:1';
function loadTranscript():Turn[] {
  try {
    const turns=JSON.parse(localStorage.getItem(transcriptKey)||'[]');
    if(Array.isArray(turns)&&turns.every(turn=>['user','assistant'].includes(turn.role)&&typeof turn.content==='string'))return turns.slice(-40);
  }catch{}
  return [];
}
export function Bucky({context}:{context:string}) {
  const [open,setOpen]=useState(false);
  const [turns,setTurns]=useState<Turn[]>(loadTranscript);
  const [question,setQuestion]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [typing,setTyping]=useState(false);
  const [volume,setVolume]=useState(loadVolume);
  const [voiceState,setVoiceState]=useState<VoiceState>('idle');
  const voice=useRef<VoiceConversation|null>(null);
  const generation=useRef(0);
  const request=useRef<AbortController|null>(null);
  const answerRef=useRef<(message:string,spoken:boolean)=>Promise<void>>(async()=>{});
  const toggle=useRef<HTMLButtonElement>(null);
  const log=useRef<HTMLDivElement>(null);
  const status={idle:'Ready when you are.',connecting:'Connecting your microphone…',listening:'Listening. Your words appear below.',thinking:'Looking into that…',speaking:'Bucky is speaking.'}[voiceState];
  useEffect(()=>{voice.current?.setVolume(volume);try{localStorage.setItem(volumeKey,String(volume));}catch{}},[volume]);
  useEffect(()=>{try{localStorage.setItem(transcriptKey,JSON.stringify(turns.slice(-40)));}catch{}},[turns]);
  useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[turns,busy]);
  function end() {generation.current++;request.current?.abort();request.current=null;voice.current?.stop();voice.current=null;setBusy(false);}
  useEffect(()=>{
    const cleanup=()=>{generation.current++;request.current?.abort();voice.current?.stop();voice.current=null;};
    window.addEventListener('pagehide',cleanup);
    return ()=>{window.removeEventListener('pagehide',cleanup);cleanup();};
  },[]);
  function close() {end();setOpen(false);toggle.current?.focus();}
  async function answer(message:string,spoken:boolean) {
    const attempt=++generation.current;
    request.current?.abort();
    const controller=new AbortController();request.current=controller;
    const timeout=setTimeout(()=>controller.abort(),55000);
    const session=voice.current;
    setQuestion(message);setBusy(true);setError('');
    setTurns(current=>[...current,{role:'user' as const,content:message}].slice(-40));
    try {
      const response=await fetch('https://storylivingry.studio/api/socialfx/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,context,voice:spoken,history:turns.slice(-8).map(({role,content})=>({role,content}))}),signal:controller.signal});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Bucky could not answer right now.');
      if(attempt!==generation.current)return;
      setTurns(current=>[...current,{role:'assistant' as const,content:data.reply,sources:data.sources}].slice(-40));
      if(spoken&&session?.isActive){
        clearTimeout(timeout);
        const speechTimeout=setTimeout(()=>controller.abort(),40000);
        try {
          const speech=await fetch(voiceEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'speak',text:data.reply}),signal:controller.signal});
          if(!speech.ok){const failure=await speech.json();throw Error(failure.error||'Bucky’s voice could not play.');}
          const bytes=await speech.arrayBuffer();
          if(attempt!==generation.current)return;
          await session.speak(bytes);
        }finally{clearTimeout(speechTimeout);}
      }
    }catch(problem){
      if(attempt===generation.current)setError((problem as Error).name==='AbortError'?'The reply took too long. Please try again.':(problem as Error).message);
    }finally{
      clearTimeout(timeout);
      if(attempt===generation.current){setBusy(false);session?.resume();}
    }
  }
  answerRef.current=answer;
  function start() {
    end();setTyping(false);setError('');setQuestion('');
    const session=new VoiceConversation({onState:setVoiceState,onPartial:setQuestion,onTranscript:text=>void answerRef.current(text,true),onError:setError},volume);
    voice.current=session;void session.start();
  }
  function interrupt() {generation.current++;request.current?.abort();setBusy(false);setQuestion('');voice.current?.interrupt();}
  function submit(event:FormEvent) {event.preventDefault();if(question.trim()&&!busy)void answer(question.trim(),false);}
  function download() {
    const text=turns.map(turn=>(turn.role==='user'?'You':'Bucky')+'\n'+turn.content+'\n'+(turn.sources||[]).map(source=>source.title+' '+source.url).join('\n')).join('\n\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
    const link=document.createElement('a');link.href=url;link.download='bucky-social-fx-conversation.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const active=voiceState!=='idle';
  return <div className={'companion voice-'+voiceState}>
    <button className="bucky-toggle" ref={toggle} aria-expanded={open} aria-controls="bucky-panel" onClick={()=>{if(open)close();else setOpen(true);}}><span className="bucky-figure" aria-hidden="true"/><span>Talk to Bucky</span></button>
    {open&&<section id="bucky-panel" className="bucky-panel" aria-label="Talk to Bucky" onKeyDown={event=>{if(event.key==='Escape')close();}}>
      <header><strong>Bucky · Social FX guide</strong><button aria-label="Close Bucky" onClick={close}>×</button></header>
      <button className="start-voice" onClick={start} disabled={active}>Talk to Bucky</button>
      <p className="voice-status" role="status">{status}</p>
      <label className="voice-volume" htmlFor="bucky-volume"><span>Bucky volume <output>{Math.round(volume*100)}%</output></span><input id="bucky-volume" type="range" min="0" max="100" step="1" value={Math.round(volume*100)} onChange={event=>setVolume(Number(event.target.value)/100)}/></label>
      {active&&<div className="voice-actions">{(voiceState==='thinking'||voiceState==='speaking')&&<button onClick={interrupt}>Let me speak</button>}<button onClick={end}>End conversation</button></div>}
      <p className="bucky-intro">Allow the microphone, then speak. Bucky replies in the saved One Mind voice. A pause sends your question.</p>
      <label htmlFor="bucky-question">{typing?'Your question':'Your live transcript'}</label>
      <textarea id="bucky-question" aria-label={typing?'Your question':'Your live transcript'} value={question} readOnly={!typing||active} maxLength={2500} placeholder="Your words appear here as you speak…" onChange={event=>setQuestion(event.target.value)}/>
      <details className="typing-option" open={typing} onToggle={event=>{const shown=event.currentTarget.open;setTyping(shown);if(shown&&active)end();}}><summary>Prefer typing?</summary><form onSubmit={submit}><button type="submit" disabled={busy||!question.trim()}>Ask Bucky →</button></form></details>
      {error&&<p className="chat-error" role="alert">{error}</p>}
      <div className="chat-log" ref={log} aria-live="polite">{turns.map((turn,index)=><article key={index} className={turn.role}><strong>{turn.role==='user'?'You':'Bucky'}</strong><p>{turn.content}</p>{turn.sources?.length?<details><summary>Sources</summary>{turn.sources.filter(source=>/^https?:\/\//.test(source.url)).map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</details>:null}</article>)}</div>
      {!!turns.length&&<button className="save-transcript" onClick={download}>Download conversation ↓</button>}
      <small>Speech uses ElevenLabs. Questions and step context use OpenAI or Anthropic with the public Ledger library and web search. The written conversation is saved in this browser.</small>
    </section>}
  </div>;
}
