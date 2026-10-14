const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const scenes=$$('.scene'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
let unlocked=false, current=0, pending=false, paused=reduced.matches, demoTimeout, timerRAF, timerRunning=false;
const video=$('#gameplay');
function playBackground(){if(!paused&&!document.hidden)video.play().catch(()=>{});else video.pause();}
function setPaused(value){paused=value;document.body.classList.toggle('paused',paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').setAttribute('aria-label',paused?'Retomar movimento de fundo':'Pausar movimento de fundo');$('#motion').textContent=paused?'▷':'Ⅱ';$$('img[src*="symbol."]').forEach(img=>img.src=paused?'assets/symbol.png':'assets/symbol.gif');playBackground();}
setPaused(paused);
$('#motion').onclick=()=>setPaused(!paused);
document.addEventListener('visibilitychange',playBackground);
reduced.addEventListener('change',e=>setPaused(e.matches));
scenes.forEach((scene,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',scene.dataset.name);b.innerHTML='<span>'+scene.dataset.name+'</span>';b.onclick=()=>go(i);$('#rail').append(b);});
function go(i){scrollTo({top:Math.max(0,Math.min(scenes.length-1,i))*innerHeight,behavior:reduced.matches?'instant':'smooth'});}
const scrollTrack=document.createElement('div');
scrollTrack.className='scroll-track';scrollTrack.setAttribute('aria-hidden','true');
scenes.forEach(()=>{const stop=document.createElement('div');stop.className='scroll-stop';scrollTrack.append(stop);});
$('#journey').append(scrollTrack);
const ease=x=>x*x*(3-2*x);
function paint(){
 pending=false;if(!unlocked)return;
 const position=Math.max(0,Math.min(scenes.length-1,scrollY/innerHeight));
 current=Math.round(position);
 scenes.forEach((scene,i)=>{
  const delta=i-position,content=scene.firstElementChild,near=Math.abs(delta)<1.01;
  scene.style.visibility=near?'visible':'hidden';
  scene.style.zIndex=delta>0?'3':'2';
  const progress=delta>=0?1-Math.min(1,delta):Math.min(1,-delta);
  let scale=1,opacity=1,blur=0;
  if(reduced.matches){opacity=i===current?1:0;}
  else if(delta>=0){const t=ease(progress);scale=.32+.68*t;opacity=Math.max(0,Math.min(1,(progress-.08)/.7));blur=(1-t)*18;}
  else {const t=ease(progress);scale=1+t*2.5;opacity=Math.max(0,1-progress*1.65);blur=t*18;}
  content.style.opacity=String(near?opacity:0);
  content.style.filter='blur('+blur+'px)';
  content.style.transform='scale('+scale+')';
  scene.classList.toggle('is-current',i===current);scene.inert=i!==current;
 });
 $$('#rail button').forEach((b,i)=>i===current?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
 $('#section-counter').innerHTML=String(current+1).padStart(2,'0')+' <i>/ 10</i>';
 $('#section-name').textContent=scenes[current].dataset.name;
 $('#next').innerHTML=current===9?'Back to the start <span>↑</span>':'Scroll to explore <span>↓</span>';
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(paint);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{if(unlocked)scrollTo({top:current*innerHeight,behavior:'instant'});schedule();});
$('#unlock').onclick=()=>{unlocked=true;document.body.classList.remove('locked');$('#gate').classList.add('leaving');$('#gate').inert=true;$('#journey').inert=false;$$('.hud,#rail').forEach(x=>x.inert=false);scrollTo({top:0,behavior:'instant'});paint();scenes[0].querySelector('h1').tabIndex=-1;scenes[0].querySelector('h1').focus({preventScroll:true});playBackground();};
$('#restart').onclick=()=>{unlocked=false;document.body.classList.add('locked');$('#gate').classList.remove('leaving');$('#gate').inert=false;$('#journey').inert=true;$$('.hud,#rail').forEach(x=>x.inert=true);$('#unlock').focus({preventScroll:true});scrollTo({top:0,behavior:'instant'});};
$('#next').onclick=()=>go(current===9?0:current+1);
document.addEventListener('keydown',e=>{if(!unlocked||/INPUT|BUTTON|SELECT|TEXTAREA|A/.test(e.target.tagName))return;if(['ArrowDown','PageDown','ArrowUp','PageUp','Home','End',' '].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?9:current+(['ArrowUp','PageUp'].includes(e.key)?-1:1));}});
$('#level').oninput=()=>{const n=Number($('#level').value);const valid=Number.isInteger(n)&&n>=1&&n<=10000;$('#min-level').textContent=valid?Math.ceil(n*2/3):'—';$('#max-level').textContent=valid?Math.floor(n*1.5):'—';$('#shared-status').textContent=valid?'Faixa de level para compartilhar XP.':'Informe um level inteiro entre 1 e 10.000.';};
$('#timer-demo').onclick=()=>{cancelAnimationFrame(timerRAF);if(timerRunning){timerRunning=false;$('#timer-value').textContent='0:05';$('#timer-ring').style.strokeDashoffset='0';$('#timer-status').textContent='Toque para experimentar · sem áudio';return;}timerRunning=true;const start=performance.now();$('#timer-status').textContent='Contando · toque para cancelar';function tick(now){const elapsed=Math.min(5000,now-start),remaining=Math.ceil((5000-elapsed)/1000);$('#timer-value').textContent='0:0'+remaining;$('#timer-ring').style.strokeDashoffset=String(629*elapsed/5000);if(elapsed<5000){timerRAF=requestAnimationFrame(tick);}else{timerRunning=false;$('#timer-status').textContent='Tempo encerrado · toque para repetir';}}timerRAF=requestAnimationFrame(tick);};
history.scrollRestoration='manual';scrollTo({top:0,behavior:'instant'});



