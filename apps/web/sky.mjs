/** Lisa Sky — decorative local-clock environment; no location, weather or network. */
export const SKY_STOPS = [
  {h:0, top:'#17294d', middle:'#394c78', bottom:'#9b92b6', cloud:'#c4d0e5', ink:'#f5f2ff', muted:'#d1dbee', glass:'30,48,79', stars:1},
  {h:5, top:'#29335b', middle:'#695d89', bottom:'#caa8b0', cloud:'#e2c9d5', ink:'#fff5f5', muted:'#e6dce9', glass:'58,49,83', stars:.65},
  {h:7, top:'#86acd3', middle:'#b9c7dc', bottom:'#f1cfb7', cloud:'#fff9f1', ink:'#25445c', muted:'#466379', glass:'245,249,252', stars:0},
  {h:10, top:'#6ca5d7', middle:'#75afe0', bottom:'#8bbce3', cloud:'#fff9f1', ink:'#17344b', muted:'#35546d', glass:'240,248,255', stars:0},
  {h:14, top:'#68a2d5', middle:'#78b0de', bottom:'#91bfe2', cloud:'#fff9f1', ink:'#17344b', muted:'#35546d', glass:'240,248,255', stars:0},
  {h:17, top:'#779ccb', middle:'#aebbd1', bottom:'#e8ccb6', cloud:'#fff9f1', ink:'#29455a', muted:'#506579', glass:'248,246,242', stars:0},
  {h:19, top:'#6c659d', middle:'#bd91af', bottom:'#f4c6a3', cloud:'#ffe4cb', ink:'#fff7ef', muted:'#f4e2e6', glass:'89,71,102', stars:.12},
  {h:21, top:'#2c3b68', middle:'#645f8f', bottom:'#b49bbc', cloud:'#d8cee6', ink:'#f5f2ff', muted:'#d1dbee', glass:'41,44,77', stars:.75},
  {h:24, top:'#17294d', middle:'#394c78', bottom:'#9b92b6', cloud:'#c4d0e5', ink:'#f5f2ff', muted:'#d1dbee', glass:'30,48,79', stars:1}
];
export function skyHour(value) {
  if (!Number.isFinite(value)) throw new TypeError('Sky hour must be finite');
  return ((value % 24) + 24) % 24;
}
export function skyMix(a,b,t) {
  const read=s=>s.startsWith('#')?[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)):s.split(',').map(Number);
  return read(a).map((n,i)=>Math.round(n+(read(b)[i]-n)*t));
}
export function skyEnvironment(value) {
  const hour=skyHour(value), right=SKY_STOPS.findIndex(s=>s.h>hour), a=SKY_STOPS[right-1], b=SKY_STOPS[right];
  const raw=(hour-a.h)/(b.h-a.h), t=raw*raw*(3-2*raw);
  const result={hour};
  for (const key of ['top','middle','bottom','cloud','ink','muted']) result[key]=`rgb(${skyMix(a[key],b[key],t).join(',')})`;
  result.glass=skyMix(a.glass,b.glass,t).join(',');
  result.stars=a.stars+(b.stars-a.stars)*t;
  result.phase=hour<6?'Noche':hour<9?'Amanecer':hour<17?'Día':hour<21?'Atardecer':'Noche';
  result.greeting=hour<6?'Buenas noches.':hour<12?'Buenos días.':hour<21?'Buenas tardes.':'Buenas noches.';
  const day=(hour-6)/14;
  result.sunX=12+76*Math.max(0,Math.min(1,day));
  result.sunY=62-48*Math.sin(Math.PI*Math.max(0,Math.min(1,day)));
  result.sunOpacity=hour<5.5||hour>20.5?0:Math.min(1,(hour-5.5)/1.5,(20.5-hour)/1.5);
  result.moonOpacity=Math.max(0,Math.min(1,(result.stars-.15)*1.4));
  return result;
}
export function skyClock(value) {
  const minutes=Math.floor(skyHour(value)*60+1e-7);
  return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
}

if (typeof document !== 'undefined') {
  const skyApp=document.querySelector('#app');
  const skyMedia=matchMedia('(prefers-reduced-motion: reduce)');
  let skyRoot=null, skyTimer=null, skyPreview=null, skyPaused=false, skyFrame=null;
  const skyText=(selector,value)=>{const node=skyRoot?.querySelector(selector);if(node&&node.textContent!==value)node.textContent=value;};
  const skySet=(name,value)=>document.body.style.setProperty(`--sky-${name}`,String(value));
  const skyPreference=()=>{try{return localStorage.getItem('lisa.sky.motion')==='off';}catch{return false;}};
  skyPaused=skyPreference();
  function skyPaint(){
    if(!skyRoot||document.hidden)return;
    const now=new Date(), h=skyPreview??(now.getHours()+now.getMinutes()/60+now.getSeconds()/3600), env=skyEnvironment(h);
    for(const key of ['top','middle','bottom','cloud','ink','muted','glass','stars'])skySet(key,env[key]);
    skySet('sun-x',env.sunX+'%');skySet('sun-y',env.sunY+'%');skySet('sun-opacity',env.sunOpacity);skySet('moon-opacity',env.moonOpacity);
    skyText('[data-sky-clock]',skyClock(h));skyText('[data-sky-greeting]',env.greeting);skyText('[data-sky-phase]',env.phase);
    skyText('[data-sky-date]',new Intl.DateTimeFormat('es',{weekday:'long',day:'numeric',month:'long'}).format(now));
    skyText('[data-sky-timezone]',Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_',' '));
    skyText('[data-sky-sync]',skyPreview===null?'Sincronizado con tu hora':'Vista previa · '+skyClock(h));
    skyText('[data-sky-output]',skyClock(h));
    const slider=skyRoot.querySelector('[data-sky-slider]');
    if(slider){slider.value=String(Math.floor(h*60));slider.setAttribute('aria-valuetext',skyClock(h));}
    skyRoot.querySelectorAll('[data-sky-preset]').forEach(button=>button.setAttribute('aria-pressed',String(skyPreview!==null&&Number(button.dataset.skyPreset)===skyPreview)));
    const live=skyRoot.querySelector('[data-sky-live]');if(live)live.setAttribute('aria-pressed',String(skyPreview===null));
    const motion=skyRoot.querySelector('[data-sky-motion]');
    const reduced=skyPaused||skyMedia.matches;
    document.body.classList.toggle('sky-still',reduced);
    if(motion){motion.setAttribute('aria-pressed',String(!reduced));motion.setAttribute('aria-label',reduced?'Activar movimiento del cielo':'Pausar movimiento del cielo');motion.title=motion.getAttribute('aria-label');}
    skyText('[data-sky-motion-label]',reduced?'Sin movimiento':'Pausar cielo');
  }
  function skyStart(){clearInterval(skyTimer);skyTimer=null;if(skyRoot&&!document.hidden){skyPaint();skyTimer=setInterval(skyPaint,10000);}}
  function skyMount(){
    const next=document.querySelector('#sky-home');
    document.body.classList.toggle('sky-home-active',Boolean(next));
    if(next===skyRoot)return;
    skyRoot=next;
    if(skyFrame){cancelAnimationFrame(skyFrame);skyFrame=null;}
    skySet('px','0px');skySet('py','0px');
    if(skyRoot){
      const field=skyRoot.querySelector('[data-sky-stars]');
      if(field&&!field.childElementCount)field.innerHTML=Array.from({length:52},(_,i)=>`<i style="left:${(i*37.71)%100}%;top:${(i*19.43)%72}%;width:${i%4===0?3:2}px;height:${i%4===0?3:2}px;opacity:${.2+(i%6)*.12}"></i>`).join('');
    }
    skyStart();
  }
  function skyClose(){const panel=skyRoot?.querySelector('[data-sky-panel]');if(panel)panel.hidden=true;skyRoot?.querySelector('[data-sky-toggle]')?.setAttribute('aria-expanded','false');}
  document.addEventListener('click',event=>{
    if(!skyRoot)return;
    const target=event.target.closest('button');
    if(target?.hasAttribute('data-sky-toggle')){
      const panel=skyRoot.querySelector('[data-sky-panel]');panel.hidden=!panel.hidden;target.setAttribute('aria-expanded',String(!panel.hidden));return;
    }
    if(target?.hasAttribute('data-sky-preset')){skyPreview=Number(target.dataset.skyPreset);skyPaint();return;}
    if(target?.hasAttribute('data-sky-live')){skyPreview=null;skyPaint();return;}
    if(target?.hasAttribute('data-sky-motion')){
      if(!skyMedia.matches){skyPaused=!skyPaused;try{localStorage.setItem('lisa.sky.motion',skyPaused?'off':'on');}catch{}}
      skySet('px','0px');skySet('py','0px');skyPaint();return;
    }
    if(!event.target.closest('.sky-time-control'))skyClose();
  });
  document.addEventListener('input',event=>{if(event.target.matches('[data-sky-slider]')){skyPreview=Number(event.target.value)/60;skyPaint();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&skyRoot&&!skyRoot.querySelector('[data-sky-panel]').hidden){skyClose();skyRoot.querySelector('[data-sky-toggle]').focus();}});
  document.addEventListener('pointermove',event=>{
    if(!skyRoot||document.hidden||skyPaused||skyMedia.matches||event.pointerType!=='mouse'||skyFrame)return;
    skyFrame=requestAnimationFrame(()=>{skySet('px',((event.clientX/innerWidth-.5)*10).toFixed(2)+'px');skySet('py',((event.clientY/innerHeight-.5)*6).toFixed(2)+'px');skyFrame=null;});
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('sky-hidden',document.hidden);skyStart();});
  skyMedia.addEventListener('change',skyPaint);
  if(skyApp)new MutationObserver(skyMount).observe(skyApp,{childList:true});
  skyMount();
}
