(()=> {
const root=document.querySelector('.imb-v2'), scene=document.querySelector('#embuimentos');
const q=s=>root.querySelector(s), qa=s=>[...root.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active='market',manualPause=false,loopTimer,transferTimer,flowTimers=[],visible=false;
const views=['market','plan','history'], materialButtons=qa('[data-copy-item]');
function clearFlow(){flowTimers.forEach(clearTimeout);flowTimers=[];clearTimeout(transferTimer);root.classList.remove('is-transferring');}
function isMoving(){return visible&&!manualPause&&!reduced.matches&&!document.body.classList.contains('paused')&&!document.hidden;}
function renderView(name){clearFlow();active=name;root.dataset.view=name;qa('[data-imb-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.imbView===name)));qa('[data-imb-pane]').forEach(p=>{const show=p.dataset.imbPane===name;p.classList.toggle('is-active',show);p.inert=!show;p.setAttribute('aria-hidden',String(!show));});}
function fillMarket(button){q('#market-search').value=button.dataset.copyItem;q('#market-item').textContent=button.dataset.copyItem;q('#market-qty').textContent=button.dataset.qty;q('#market-price').textContent=button.dataset.price+' gp';q('.market-placeholder').hidden=true;q('.market-found').hidden=false;}
function moveName(button){clearTimeout(transferTimer);root.classList.remove('is-transferring');materialButtons.forEach(b=>b.classList.toggle('is-copying',b===button));q('.copy-trail').textContent=button.dataset.copyItem;requestAnimationFrame(()=>root.classList.add('is-transferring'));transferTimer=setTimeout(()=>{fillMarket(button);root.classList.remove('is-transferring');materialButtons.forEach(b=>b.classList.remove('is-copying'));},reduced.matches?0:950);}
async function copyMaterial(button){clearFlow();scheduleLoop();moveName(button);try{await navigator.clipboard.writeText(button.dataset.copyItem);q('#imb-copy-status').textContent='Nome copiado. Cole na busca do Market do Tibia.';}catch{q('#imb-copy-status').textContent='Busca demonstrada. Selecione o nome para copiar.';}}
materialButtons.forEach(b=>b.onclick=()=>copyMaterial(b));
function startMarketFlow(){flowTimers.push(setTimeout(()=>{if(!isMoving()||active!=='market')return;moveName(materialButtons[0]);q('#imb-copy-status').textContent='Copiar nome → colar no Market. Sem Alt+Tab.';},2200),setTimeout(()=>{if(!isMoving()||active!=='market')return;moveName(materialButtons[1]);},4800));}
function scheduleLoop(){clearTimeout(loopTimer);if(!isMoving())return;loopTimer=setTimeout(()=>{if(!isMoving())return;renderView(views[(views.indexOf(active)+1)%views.length]);if(active==='market')startMarketFlow();scheduleLoop();},8500);}
function updateMotion(){clearTimeout(loopTimer);if(!isMoving()){clearFlow();return;}if(active==='market')startMarketFlow();scheduleLoop();}
qa('[data-imb-view]').forEach(b=>b.onclick=()=>{renderView(b.dataset.imbView);scheduleLoop();});
q('#imb-play').onclick=()=>{manualPause=!manualPause;q('#imb-play').setAttribute('aria-pressed',String(manualPause));q('#imb-play').setAttribute('aria-label',manualPause?'Retomar demonstração':'Pausar demonstração');q('#imb-play').textContent=manualPause?'▷':'Ⅱ';updateMotion();};
q('#imb-profile').onchange=()=>{const druid=q('#imb-profile').value==='druid';q('#imb-hist-world').textContent=druid?'Secura':'Antica';q('#imb-hist-price').innerHTML=druid?'3.100 <small>gp</small>':'2.400 <small>gp</small>';q('#imb-hist-change').textContent=druid?'+10,7% no período':'−20% no período';q('#imb-history-line').setAttribute('d',druid?'M8 105 90 85 175 102 260 50 345 65 430 25':'M8 25 90 45 175 36 260 75 345 86 430 110');q('#imb-history-dot').setAttribute('cy',druid?'25':'110');scheduleLoop();};
new MutationObserver(()=>{const nextVisible=scene.classList.contains('is-current')&&!document.body.classList.contains('locked');if(nextVisible!==visible){visible=nextVisible;updateMotion();}}).observe(scene,{attributes:true,attributeFilter:['class']});
new MutationObserver(updateMotion).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',updateMotion);reduced.addEventListener('change',updateMotion);
})();
