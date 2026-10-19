(function(){'use strict';
 document.querySelectorAll('[data-dive-copy]').forEach(function(button){
  button.addEventListener('click',function(){
   var group=button.closest('.dives-share'),feedback=group.querySelector('.dives-share-feedback'),url=button.dataset.diveCopy;
   function fallback(){feedback.textContent='Copy this link: '+url;}
   if(!navigator.clipboard||!navigator.clipboard.writeText){fallback();return;}
   navigator.clipboard.writeText(url).then(function(){feedback.textContent=button.dataset.copyPlatform?'Link copied. Paste it into your Instagram message or story.':'Link copied.';}).catch(fallback);
  });
 });
})();
