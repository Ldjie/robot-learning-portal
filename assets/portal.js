'use strict';
(function(){
  const rootKey='rlportal:progress:detail:';
  const pageKey=document.body.dataset.pageKey||location.pathname;
  const checks=[...document.querySelectorAll('input[type="checkbox"][data-check]')];
  function get(k){try{return localStorage.getItem(k)}catch(_){return null}}
  function set(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}
  function refresh(){let completed=0;checks.forEach(c=>{if(c.checked)completed++});const fill=document.querySelector('[data-progress-fill]');const text=document.querySelector('[data-progress-text]');if(fill)fill.style.width=(checks.length?completed/checks.length*100:0)+'%';if(text)text.textContent=`已完成 ${completed} / ${checks.length} 项（${checks.length?Math.round(completed/checks.length*100):0}%）`}
  checks.forEach(c=>{const key=rootKey+pageKey+':'+c.dataset.check;c.checked=get(key)==='1';c.addEventListener('change',()=>{set(key,c.checked?'1':'0');refresh()})});
  document.querySelectorAll('[data-answer-target]').forEach(button=>button.addEventListener('click',()=>{const el=document.getElementById(button.dataset.answerTarget);if(!el)return;const open=el.hidden;el.hidden=!open;button.setAttribute('aria-expanded',String(open));button.textContent=open?'隐藏答案':'查看答案'}));
  const reset=document.querySelector('[data-reset-progress]');if(reset)reset.addEventListener('click',()=>{if(!confirm('确定重置本页的学习进度吗？'))return;checks.forEach(c=>{try{localStorage.removeItem(rootKey+pageKey+':'+c.dataset.check)}catch(_){}c.checked=false});refresh()});
  refresh();
})();
