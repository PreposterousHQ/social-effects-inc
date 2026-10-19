(function(){'use strict';
 // A native post can grow after a fragment has initially scrolled into place.
 // Keep the intended entry visible until the visitor starts interacting.
 var navigation=performance.getEntriesByType('navigation')[0],target;
 try { target=document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch(e) { target=null; }
 var feature=document.querySelector('.dives-feature');
 if(target&&feature&&navigation&&navigation.type==='navigate'){
  var aligning=true,observer;
  function align(){if(aligning)target.scrollIntoView({block:'start',behavior:'instant'});}
  function stop(){aligning=false;if(observer)observer.disconnect();}
  ['wheel','touchstart','pointerdown','keydown'].forEach(function(type){window.addEventListener(type,stop,{passive:true,once:true});});
  window.addEventListener('pageshow',function(event){if(event.persisted)stop();});
  if(window.ResizeObserver){observer=new ResizeObserver(function(){requestAnimationFrame(align);});observer.observe(feature);}
  if(document.fonts)document.fonts.ready.then(align);
  window.addEventListener('load',align,{once:true});
 }
 document.querySelectorAll('[data-dive-copy]').forEach(function(button){
  button.addEventListener('click',function(){
   var group=button.closest('.dives-share'),feedback=group.querySelector('.dives-share-feedback'),url=button.dataset.diveCopy;
   function fallback(){feedback.textContent='Copy this link: '+url;}
   if(!navigator.clipboard||!navigator.clipboard.writeText){fallback();return;}
   navigator.clipboard.writeText(url).then(function(){feedback.textContent=button.dataset.copyPlatform?'Link copied. Paste it into your Instagram message or story.':'Link copied.';}).catch(fallback);
  });
 });
})();
