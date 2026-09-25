import { AREAS, FINANCE_TYPES, financeTotals, financePositionMetrics, escapeHtml } from './domain.mjs';
import { DemoClient, HttpClient } from './client.mjs';

const api = new DemoClient();
const e = escapeHtml;
const paths = {
  spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
  home:'m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7',
  shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z M9 12l2 2 4-4',
  plus:'M12 5v14M5 12h14', arrow:'M5 12h14m-5-5 5 5-5 5',
  chevron:'m9 5 7 7-7 7', close:'m6 6 12 12M6 18 18 6',
  book:'M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z',
  chart:'M4 3v17h17M8 15l4-5 4 2 5-7', user:'M5 21v-2a7 7 0 0 1 14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  heart:'M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z',
  folder:'M3 6h7l2 2h9v12H3Z M3 6V4h7l2 2h7v2', calendar:'M4 5h16v16H4ZM4 10h16M8 3v4M16 3v4',
  check:'m5 12 4 4L19 6', tasks:'M9 5h11M9 12h11M9 19h11M3 5h1M3 12h1M3 19h1',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-2 4 6 6',
  chat:'M3 4h18v13H8l-5 4Z', monitor:'M3 4h18v13H3ZM12 17v4M7 21h10',
  lock:'M5 10h14v11H5ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  code:'m8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20', moon:'M20 14a9 9 0 0 1-10-11 9 9 0 1 0 10 11',
  info:'M12 8h.01M12 11v6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  file:'M5 2h9l5 5v15H5ZM14 2v6h5M8 12h8M8 16h6', save:'M3 3h15l3 3v15H3ZM7 3v6h9V3M7 21v-8h10v8',
  clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  menu:'M4 6h16M4 12h16M4 18h16', send:'m3 3 19 9-19 9 4-9Zm4 9h15',
  cloud:'M6 18a5 5 0 1 1 0-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1-1 11Z',
  refresh:'M20 7A9 9 0 1 0 21 15M20 3v5h-5', download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  layers:'m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  pin:'M12 17v5M5 3h14l-3 6v4l3 2H5l3-2V9Z'
};
function icon(name) { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`; }
function btn(label, action, kind='', extra='') { return `<button class="btn ${kind}" data-action="${action}" ${extra}>${label}</button>`; }
function area(id) { return AREAS.find(a=>a.id===id) || {id:'general',name:'General',icon:'spark',color:'purple'}; }
function options(selected='general') { return [{id:'general',name:'General'},...AREAS].map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${e(a.name)}</option>`).join(''); }
const state={view:'home', chatId:null, category:'', filter:'', menu:false, sidebarCollapsed:false, month:8, year:2026, computer:'idle', busy:false, chatDrafts:{}, chatSends:{}, knowledgeId:null, knowledgeQuery:'', knowledgeCategory:'', knowledgeMode:'read', financeRange:'6m'};
const titles={home:'Inicio',chat:'Conversación',history:'Conversaciones',files:'Archivos',calendar:'Calendario',tasks:'Tareas',knowledge:'Conocimiento',finance:'Finanzas',agents:'Agentes',accounts:'Cuentas e integraciones',computer:'Ordenadores',developer:'Developer',settings:'Ajustes',audit:'Registro de actividad'};
const mount=document.querySelector('#app');
const dialog=document.querySelector('#dialog');
let toastTimer;
function toast(message) { const el=document.querySelector('#toast'); el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4800); }
function modal(title, html) { dialog.innerHTML=`<div class="modal-head"><h2>${e(title)}</h2><button class="icon-btn" data-action="close" aria-label="Cerrar diálogo">${icon('close')}</button></div>${html}`;dialog.showModal(); }
function nav(view) {state.view=view;state.menu=false;state.filter='';state.category='';history.replaceState(null,'',`#${view}`);render().then(()=>document.querySelector('#main')?.focus());}
function navItem(view,label,ico) { return `<button class="nav-item ${state.view===view?'active':''}" data-nav="${view}" ${state.view===view?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></button>`; }
function sidebar() {return `<button class="menu-shade" data-action="menu" aria-label="Cerrar navegación"></button><aside class="sidebar" aria-label="Navegación principal">
<div class="sidebar-top"><button class="brand" data-nav="home" aria-label="Lisa, inicio"><span class="logo">L</span><span class="brand-copy"><strong>lisa</strong><small>ESPACIO PERSONAL</small></span></button><button class="collapse-btn" data-action="sidebar-collapse" aria-label="${state.sidebarCollapsed?'Expandir':'Contraer'} menú">${icon('menu')}</button></div>
<button class="new-chat primary" data-new="general">${icon('spark')}<span>Con conocimiento</span>${icon('plus')}</button>
<button class="new-chat" data-new="sandbox">${icon('shield')}<span>Nuevo chat Sandbox</span>${icon('plus')}</button>
<div class="nav-group">${navItem('home','Inicio','home')}${navItem('history','Conversaciones','chat')}</div>
<div class="nav-group"><div class="nav-label">Tus agentes</div>${AREAS.map(a=>`<button class="nav-item" data-agent="${a.id}" title="${e(a.name)}">${icon(a.icon)}<span>${a.name}</span><i class="dot" aria-hidden="true"></i></button>`).join('')}</div>
<div class="nav-group"><div class="nav-label">Tu espacio</div>${navItem('files','Archivos','folder')}${navItem('calendar','Calendario','calendar')}${navItem('tasks','Tareas','tasks')}${navItem('knowledge','Conocimiento','layers')}${navItem('finance','Finanzas','chart')}</div>
<div class="sidebar-bottom">${navItem('computer','Ordenadores','monitor')}${navItem('accounts','Cuentas','lock')}${navItem('developer','Developer','code')}${navItem('settings','Ajustes','settings')}<div class="profile"><span class="avatar">L</span><div><strong>Mi espacio</strong><small>Preview · datos ficticios</small></div></div></div></aside>`;}
function topbar(){return `<header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Abrir navegación" aria-expanded="${state.menu}">${icon('menu')}</button><div class="breadcrumb">Mi espacio ${icon('chevron')} <strong>${e(titles[state.view]||'Inicio')}</strong></div><div class="topbar-right"><span class="pill">${icon('spark')} Preview 0.4</span><button class="icon-btn" data-action="audit" aria-label="Ver registro de actividad">${icon('clock')}</button></div></header>`;}
const banner=()=>`<div class="demo-note">${icon('info')}<span>Demostración interactiva. Solo datos ficticios; sin IA ni servicios conectados. Los cambios se pierden al recargar. No introduzcas información personal.</span></div>`;
function heading(title,desc,action=''){return `<div class="view-heading"><div><h1>${e(title)}</h1><p>${e(desc)}</p></div>${action}</div>`;}
function section(title,action=''){return `<div class="section-head"><h2>${title}</h2>${action}</div>`;}
function empty(title,description,action=''){return `<div class="empty">${icon('layers')}<h3>${title}</h3><p>${description}</p>${action}</div>`;}
function taskRow(t){return `<div class="list-row ${t.done?'done':''}"><button class="check ${t.done?'checked':''}" data-task="${e(t.id)}" data-done="${t.done}" aria-label="${t.done?'Marcar pendiente':'Completar'}: ${e(t.title)}">${t.done?icon('check'):''}</button><div><strong>${e(t.title)}</strong><small>${e(area(t.category).name)} · ejemplo</small></div></div>`;}
function eventRow(v){return `<div class="list-row"><div class="mini-date">${e(v.time)}</div><div><strong>${e(v.title)}</strong><small>${e(v.date)} · ${e(area(v.category).name)}</small></div></div>`;}
const eur=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2});
function financeMoney(value){return eur.format(Number(value||0));}
function financePct(value){const n=Number(value||0);return `${n>0?'+':''}${n.toFixed(2)} %`;}
function financeClass(value){return Number(value)>0?'positive':Number(value)<0?'negative':'neutral';}
function financeHistoryForRange(rows,range){
  const clean=[...rows].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(range==='all'||clean.length<2)return clean;
  const days={ '1m':31,'3m':93,'6m':186,'1y':366 }[range]||186;
  const latest=new Date(clean.at(-1).date+'T12:00:00Z');
  const cutoff=new Date(latest);cutoff.setUTCDate(cutoff.getUTCDate()-days);
  const filtered=clean.filter(row=>new Date(row.date+'T12:00:00Z')>=cutoff);
  return filtered.length>=2?filtered:clean.slice(-2);
}
function financeChart(rows){
  if(!rows.length)return '<div class="finance-chart-empty">Guarda una valoración para empezar el histórico.</div>';
  const values=rows.map(r=>Number(r.value));const min=Math.min(...values),max=Math.max(...values),span=Math.max(max-min,1);
  const w=760,h=230,p=18;
  const points=rows.map((row,index)=>{const x=p+(w-p*2)*(rows.length===1?.5:index/(rows.length-1));const y=h-p-(h-p*2)*(Number(row.value)-min)/span;return {x,y,row};});
  const line=points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area=`${p},${h-p} ${line} ${w-p},${h-p}`;
  const first=rows[0],last=rows.at(-1),change=Number(last.value)-Number(first.value),changePct=Number(first.value)?change/Number(first.value)*100:0;
  return `<div class="finance-chart-wrap">
    <div class="finance-chart-head"><div><span>Periodo</span><strong>${financeMoney(first.value)} → ${financeMoney(last.value)}</strong></div><span class="finance-delta ${financeClass(change)}">${financeMoney(change)} · ${financePct(changePct)}</span></div>
    <svg class="finance-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución del valor de la cartera">
      <defs><linearGradient id="finance-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".18"/><stop offset="1" stop-color="currentColor" stop-opacity=".015"/></linearGradient></defs>
      <polygon points="${area}" fill="url(#finance-area)"></polygon><polyline points="${line}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"></polyline>
      ${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4"></circle>`).join('')}
    </svg>
    <div class="finance-axis"><span>${e(first.date)}</span><span>${e(last.date)}</span></div>
  </div>`;
}
async function home(){return document.querySelector('#home-dashboard').innerHTML;}
const MAX_CHAT_FILES=8;
const MAX_CHAT_FILE_BYTES=25*1024*1024;
function composerState(chatId=state.chatId){
  if(!chatId)return {text:'',attachments:[]};
  return state.chatDrafts[chatId] ||= {text:'',attachments:[]};
}
function sendingState(chatId=state.chatId){
  if(!chatId)return {busy:false,queue:[],sending:null,token:null};
  return state.chatSends[chatId] ||= {busy:false,queue:[],sending:null,token:null};
}
function formatBytes(value){
  const n=Number(value||0); if(n<1024)return n+' B'; if(n<1024*1024)return (n/1024).toFixed(n<10240?1:0)+' KB'; return (n/1024/1024).toFixed(1)+' MB';
}
function timeLabel(value){if(!value)return '';try{return new Date(value).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});}catch{return '';}}
function attachmentMarkup(files=[], removable=false){
  if(!files.length)return '';
  return `<div class="chat-attachments">${files.map(file=>`<span class="attachment-chip">${icon('file')}<span><strong>${e(file.name)}</strong><small>${e(formatBytes(file.size))}</small></span>${removable?`<button type="button" data-action="remove-attachment" data-attachment="${e(file.id)}" aria-label="Quitar ${e(file.name)}">${icon('close')}</button>`:''}</span>`).join('')}</div>`;
}
function chatMessageMarkup(message, messages, index){
  const role=message.role;
  const assistant=role==='assistant';
  const user=role==='user';
  const imported=role==='imported';
  const label=user?'Tú':imported?'Contexto importado':'Lisa';
  const status=message.status==='sending'?'Enviando…':message.status==='delivered'?'Entregado ✓✓':assistant?'Completado':'';
  const content=message.content?`<div class="message-content">${e(message.content).replace(/\n/g,'<br>')}</div>`:'';
  const previousUser=assistant?[...messages.slice(0,index)].reverse().find(m=>m.role==='user'):null;
  const actions=message.pending?'':`<div class="message-actions">
    ${message.content?`<button type="button" data-action="copy-message" data-message="${e(message.id)}">Copiar</button>`:''}
    ${user?`<button type="button" data-action="reuse-message" data-message="${e(message.id)}">Editar y reenviar</button>`:''}
    ${assistant&&previousUser?`<button type="button" data-action="retry-message" data-message="${e(message.id)}">Reintentar</button>`:''}
  </div>`;
  return `<article class="message ${e(role)} ${message.pending?'pending':''}">
    <div class="message-avatar">${assistant?'L':user?'T':imported?'↳':'L'}</div>
    <div class="message-main"><div class="message-meta"><strong>${label}</strong><span>${timeLabel(message.createdAt)}${status?' · '+status:''}</span></div>
    ${content}${attachmentMarkup(message.attachments||[])}${actions}</div>
  </article>`;
}
function stageFiles(fileList){
  const draft=composerState(); const incoming=[...fileList];
  for(const file of incoming){
    if(draft.attachments.length>=MAX_CHAT_FILES){toast(`Máximo ${MAX_CHAT_FILES} adjuntos por mensaje.`);break;}
    if(file.size>MAX_CHAT_FILE_BYTES){toast(`${file.name} supera 25 MiB.`);continue;}
    if(draft.attachments.some(x=>x.name===file.name&&x.size===file.size))continue;
    draft.attachments.push({id:globalThis.crypto?.randomUUID?.()||String(Date.now()+Math.random()),name:file.name,size:file.size,type:file.type||'application/octet-stream'});
  }
}
async function sendChatPayload(chatId,payload){
  const flow=sendingState(chatId);
  if(flow.busy){flow.queue.push(payload);if(state.chatId===chatId&&state.view==='chat')await render();return 'queued';}
  flow.busy=true;flow.sending=payload;const token={cancelled:false};flow.token=token;
  if(state.chatId===chatId&&state.view==='chat')await render();
  await new Promise(resolve=>setTimeout(resolve,520));
  if(token.cancelled)return 'cancelled';
  try{
    await api.request('POST',`/chats/${chatId}/messages`,payload);
  }catch(error){
    const draft=composerState(chatId);
    if(!draft.text)draft.text=payload.content||'';
    draft.attachments=[...(payload.attachments||[]),...draft.attachments].slice(0,MAX_CHAT_FILES);
    throw error;
  }finally{
    if(!token.cancelled){flow.busy=false;flow.sending=null;flow.token=null;}
  }
  if(state.chatId===chatId&&state.view==='chat')await render();
  if(flow.queue.length&&!flow.busy){
    const next=flow.queue.shift();
    setTimeout(()=>sendChatPayload(chatId,next).catch(error=>toast(error.message||'No se pudo enviar el mensaje.')),0);
  }
  return 'sent';
}
async function chatView(){
  if(!state.chatId)return empty('Elige cómo empezar','Con tu conocimiento personal o desde un espacio Sandbox.',`${btn('Con conocimiento','new-general','primary')} ${btn('Sandbox','new-sandbox')}`);
  const c=await api.request('GET',`/chats/${state.chatId}`);
  const sandbox=c.mode==='sandbox';
  const name=c.mode==='agent'?area(c.agentId).name:sandbox?'Sandbox':'Con conocimiento';
  const projects=await api.request('GET','/projects');
  const project=projects.find(p=>p.id===c.projectId)||null;
  const projectChats=project?await api.request('GET',`/chats?projectId=${encodeURIComponent(project.id)}`):[];
  const pinnedChats=projectChats.filter(chat=>chat.pinned);
  const recentChats=projectChats.filter(chat=>!chat.pinned);
  const projectPanel=project?`<section class="project-history-card">
    <div class="project-history-head"><div><span class="project-kicker">Proyecto</span><h3>${e(project.name)}</h3></div><button class="project-new" type="button" data-action="project-new-chat" data-project="${e(project.id)}" data-agent="${e(project.agentId)}" aria-label="Nueva conversación en el proyecto">${icon('plus')}</button></div>
    ${pinnedChats.length?`<div class="project-section-label">Fijadas</div>${pinnedChats.map(chat=>`<div class="project-chat-row ${chat.id===c.id?'current':''}"><button type="button" data-chat="${e(chat.id)}"><span>${icon('pin')}</span><span><strong>${e(chat.title)}</strong><small>${timeLabel(chat.updatedAt||chat.createdAt)}</small></span></button><button type="button" data-action="pin-chat" data-chat-id="${e(chat.id)}" data-pinned="true" aria-label="Desfijar">${icon('close')}</button></div>`).join('')}`:''}
    <div class="project-section-label">Recientes</div>
    ${recentChats.length?recentChats.slice(0,8).map(chat=>`<div class="project-chat-row ${chat.id===c.id?'current':''}"><button type="button" data-chat="${e(chat.id)}"><span>${icon('chat')}</span><span><strong>${e(chat.title)}</strong><small>${timeLabel(chat.updatedAt||chat.createdAt)}</small></span></button><button type="button" data-action="pin-chat" data-chat-id="${e(chat.id)}" data-pinned="false" aria-label="Fijar">${icon('pin')}</button></div>`).join(''):`<div class="project-history-empty">Aún no hay conversaciones anteriores.</div>`}
    <div class="project-history-footer"><button type="button" data-action="archive-chat" data-chat-id="${e(c.id)}">Archivar conversación actual</button></div>
  </section>`:'';
  const draft=composerState(c.id),flow=sendingState(c.id);
  const messages=[...c.messages,...(flow.sending?[{id:'pending-send',role:'user',content:flow.sending.content,attachments:flow.sending.attachments||[],createdAt:new Date().toISOString(),status:'sending',pending:true}]:[])];
  const queue=flow.queue.length?`<div class="send-queue"><div class="send-queue-title">${icon('clock')} ${flow.queue.length} ${flow.queue.length===1?'mensaje en cola':'mensajes en cola'}</div>${flow.queue.map((item,i)=>`<div class="queued-message"><span>${e((item.content||item.attachments?.[0]?.name||'Mensaje').slice(0,80))}</span><button type="button" data-action="cancel-queued" data-queue-index="${i}" aria-label="Quitar de la cola">${icon('close')}</button></div>`).join('')}</div>`:'';
  return `${heading(name,sandbox?'Explora sin utilizar tu conocimiento personal.':'Un espacio para preguntar, adjuntar y trabajar con un agente.')}
  <div class="chat-layout chat-layout-pro"><section class="chat-panel chat-panel-pro">
    <div class="chat-heading chat-heading-pro"><div class="agent-heading"><span class="agent-avatar">${icon(sandbox?'shield':c.mode==='agent'?area(c.agentId).icon:'spark')}</span><div><h2>${e(c.title)}</h2><small>${project?e(project.name)+' · ':''}${sandbox?'Sandbox aislado':c.mode==='agent'?'Agente · '+e(name):'Chat general'} · demo</small></div></div>
      <div class="chat-heading-actions"><span class="pill ${sandbox?'neutral':''}">${icon(sandbox?'shield':'spark')}${sandbox?'Sin contexto personal':'Contexto autorizado'}</span></div>
    </div>
    <div class="messages messages-pro" id="messages">${messages.length?messages.map((m,i)=>chatMessageMarkup(m,messages,i)).join(''):`<div class="chat-empty">${icon(sandbox?'shield':'spark')}<h3>${sandbox?'Un comienzo en blanco.':'¿Qué quieres hacer con '+e(name)+'?'}</h3><p>${sandbox?'Puedes escribir o adjuntar archivos de prueba sin utilizar conocimiento personal.':'Envía una instrucción, añade archivos o reutiliza un mensaje anterior. El backend real tendrá streaming y herramientas.'}</p>${btn('Probar con una pregunta','sample')}</div>`}</div>
    ${flow.busy?`<div class="generation-status"><span class="generation-dot"></span><span>Lisa está procesando el envío…</span><button type="button" data-action="stop-generation">Detener</button></div>`:''}
    ${queue}
    <form class="composer composer-pro" data-form="message">
      ${attachmentMarkup(draft.attachments,true)}
      <div class="composer-shell" data-dropzone="chat">
        <label class="sr-only" for="message">Mensaje</label>
        <textarea id="message" name="content" placeholder="Escribe a ${e(name)}…" maxlength="8000" rows="1">${e(draft.text)}</textarea>
        <div class="composer-toolbar">
          <div class="composer-tools">
            <button class="composer-icon" type="button" data-action="attach-files" aria-label="Adjuntar archivos" title="Adjuntar archivos">${icon('plus')}</button>
            <span class="composer-capability">${icon('file')} Archivos</span>
            <span class="composer-capability">${icon('layers')} Contexto</span>
          </div>
          <div class="composer-send">
            <span class="composer-hint"><kbd>Enter</kbd> enviar · <kbd>Shift</kbd>+<kbd>Enter</kbd> salto</span>
            ${flow.busy?`<button class="stop-btn" type="button" data-action="stop-generation" aria-label="Detener">${icon('close')}</button>`:''}
            <button class="send-btn" type="submit" aria-label="${flow.busy?'Añadir mensaje a la cola':'Enviar mensaje'}">${flow.busy?icon('plus'):icon('send')}</button>
          </div>
        </div>
      </div>
      <input id="chat-files" type="file" multiple hidden accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp">
      <div class="composer-note"><span>Hasta 8 archivos · 25 MiB por archivo</span><span>En esta demo solo se conserva metadato local; no se sube contenido.</span></div>
    </form>
  </section>
  <aside class="chat-side">${projectPanel}<section class="context-card context-card-pro"><h3>Contexto del agente</h3><p>${sandbox?'Nada de tu espacio personal se añade al contexto.':'Los permisos del agente deciden qué puede recuperar; el proyecto organiza conversaciones pero no amplía permisos.'}</p>
    <div class="context-line"><span>Proyecto</span><strong>${project?e(project.name):'Ninguno'}</strong></div>
    <div class="context-line"><span>Conocimiento</span><strong>${sandbox?'Ninguno':c.mode==='agent'?e(name):'General autorizado'}</strong></div>
    <div class="context-line"><span>Historial</span><strong>${project?'Automático en proyecto':c.saved?'Guardado · demo':'Sin guardar'}</strong></div>
    <div class="context-line"><span>Adjuntos</span><strong>Por mensaje</strong></div>
    <span class="pill warning">Proyecto ≠ memoria</span>
    ${project?'':btn(`${icon('save')} Guardar`,'save-chat')}${btn(`${icon('folder')} Guardar en…`,'categorize')}${btn(`${icon('arrow')} Continuar con…`,'promote')}${btn(`${icon('layers')} Proponer conocimiento`,'extract','',c.saved?'':'disabled title="Guarda primero la conversación"')}${btn('Descartar chat','discard','danger')}
  </section></aside></div>`;
}
async function historyView(){const chats=await api.request('GET','/chats?saved=true');return heading('Conversaciones','Solo aparecen las que has decidido guardar durante esta demostración.')+(chats.length?`<div class="panel">${chats.map(c=>`<button class="list-row list-button" data-chat="${e(c.id)}"><span class="tile-icon small">${icon(c.mode==='sandbox'?'shield':'chat')}</span><div><strong>${e(c.title)}</strong><small>${e(area(c.category).name)} · modo ${e(c.mode)} · guardado en memoria de la demo</small></div><span class="trailing">${icon('chevron')}</span></button>`).join('')}</div>`:empty('Aún no hay conversaciones guardadas','Inicia un chat y pulsa Guardar. La demo no conserva datos tras recargar.',btn('Empezar con conocimiento','new-general','primary')));}
async function filesView(){const files=await api.request('GET',`/files${state.category?'?category='+state.category:''}`);const filtered=files.filter(f=>f.name.toLocaleLowerCase().includes(state.filter.toLocaleLowerCase()));return heading('Tus archivos','La interfaz de Lisa; en el futuro, Nextcloud por debajo.',btn(`${icon('cloud')} Integración Nextcloud`,'nextcloud'))+`<div class="chips"><button class="chip ${!state.category?'active':''}" data-category="">Todos</button>${AREAS.map(a=>`<button class="chip ${state.category===a.id?'active':''}" data-category="${a.id}">${a.name}</button>`).join('')}<form data-form="search" style="margin-left:auto"><label class="sr-only" for="file-search">Buscar archivos</label><input id="file-search" name="query" value="${e(state.filter)}" placeholder="Buscar archivo…" style="border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:var(--panel);color:var(--ink);max-width:170px"></form></div><div class="file-grid">${filtered.map(f=>`<button class="file-card" data-file="${f.id}"><div class="file-cover">${icon('file')}</div><strong>${e(f.name)}</strong><small>${e(area(f.category).name)} · ${f.size} · v${f.version}</small><div class="resource-line">ID estable de ejemplo · ${f.id}</div></button>`).join('')}</div>${!filtered.length?empty('No hay coincidencias','Prueba otra categoría o búsqueda.'):''}`;}
async function tasksView(){const list=await api.request('GET','/tasks');return heading('Una cosa cada vez','Organiza lo pendiente sin perder de vista el contexto.',btn(`${icon('plus')} Nueva tarea`,'new-task','primary'))+`<div class="chips"><span class="pill">${list.filter(t=>!t.done).length} pendientes</span><span class="pill neutral">${list.filter(t=>t.done).length} completadas</span><span class="pill neutral">Persistencia: solo esta demo</span></div><div class="panel">${list.map(taskRow).join('')}</div>`;}
async function calendarView(){const events=await api.request('GET','/events');const first=new Date(state.year,state.month,1);const offset=(first.getDay()+6)%7;const total=new Date(state.year,state.month+1,0).getDate();const month=first.toLocaleDateString('es',{month:'long',year:'numeric'});let cells='';for(let i=0;i<offset;i++)cells+='<div class="day blank"></div>';for(let d=1;d<=total;d++){const date=`${state.year}-${String(state.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;cells+=`<button class="day ${date==='2026-09-23'?'today':''}" data-date="${date}" aria-label="Crear evento el ${date}"><span class="day-number">${d}</span>${events.filter(v=>v.date===date).map(v=>`<span class="day-event ${area(v.category).color}">${e(v.time)} ${e(v.title)}</span>`).join('')}</button>`;}return heading('Tu tiempo, con perspectiva','Calendario de muestra. La sincronización CalDAV todavía no está conectada.',btn(`${icon('plus')} Nuevo evento`,'new-event','primary'))+`<div class="calendar-toolbar"><button class="icon-btn" data-month="-1" aria-label="Mes anterior">←</button><h2>${e(month)}</h2><button class="icon-btn" data-month="1" aria-label="Mes siguiente">→</button><span class="pill neutral">Fechas de ejemplo</span></div><div class="panel calendar-panel"><div class="calendar-grid">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>`<div class="day-name">${d}</div>`).join('')}${cells}</div></div>${section('Agenda de demostración')}<div class="panel">${events.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(eventRow).join('')}</div>`;}

function financePositionForm(position=null){
  const p=position||{type:'Fondo',currency:'EUR',fxToEur:1,account:'Manual'};
  return `<form data-form="finance-position">
    <input type="hidden" name="id" value="${e(position?.id||'')}">
    <div class="grid-2"><label class="field">Activo<input name="name" required maxlength="120" value="${e(p.name||'')}" placeholder="Nombre del fondo, ETF, acción…"></label><label class="field">Ticker / ISIN<input name="symbol" maxlength="24" value="${e(p.symbol||'')}" placeholder="Opcional"></label></div>
    <div class="grid-2"><label class="field">Tipo<select name="type">${FINANCE_TYPES.map(type=>`<option ${type===p.type?'selected':''}>${e(type)}</option>`).join('')}</select></label><label class="field">Cuenta / origen<input name="account" maxlength="80" value="${e(p.account||'Manual')}" placeholder="Manual, bróker…"></label></div>
    <div class="grid-2"><label class="field">Cantidad<input type="number" step="any" min="0.00000001" name="quantity" required value="${e(p.quantity??'')}"></label><label class="field">Precio medio<input type="number" step="any" min="0" name="avgPrice" required value="${e(p.avgPrice??'')}"></label></div>
    <div class="grid-2"><label class="field">Precio actual<input type="number" step="any" min="0" name="currentPrice" required value="${e(p.currentPrice??'')}"></label><label class="field">Divisa<input name="currency" maxlength="3" pattern="[A-Za-z]{3}" required value="${e(p.currency||'EUR')}"></label></div>
    <label class="field">Cambio de esa divisa a EUR<input type="number" step="any" min="0.00000001" name="fxToEur" required value="${e(p.fxToEur??1)}"><small>Para EUR usa 1. En esta demo no se consulta ningún cambio automáticamente.</small></label>
    <div class="modal-footer"><button class="btn primary" type="submit">${position?'Guardar cambios':'Añadir posición'}</button></div>
  </form>`;
}
async function financeView(){
  const [positions,snapshots]=await Promise.all([api.request('GET','/finance/positions'),api.request('GET','/finance/snapshots')]);
  const totals=financeTotals(positions);
  const today=new Date().toISOString().slice(0,10);
  const current={id:'current',date:today,value:Number(totals.value.toFixed(2)),invested:Number(totals.invested.toFixed(2))};
  const history=[...snapshots.filter(s=>s.date!==today),current].sort((a,b)=>a.date.localeCompare(b.date));
  const visible=financeHistoryForRange(history,state.financeRange);
  const allocations=new Map();
  positions.forEach(position=>{const value=financePositionMetrics(position).value;allocations.set(position.type,(allocations.get(position.type)||0)+value);});
  const maxAllocation=Math.max(...allocations.values(),1);
  return heading('Tus finanzas','Introduce tus posiciones y revisa su valor, rentabilidad y evolución. En esta entrega todo permanece solo durante la sesión.',btn(`${icon('plus')} Añadir posición`,'finance-add','primary'))+
  `<div class="finance-status"><span class="pill warning">Manual · sin cotizaciones automáticas</span><span class="pill neutral">Renta 4 / otras fuentes: integración futura</span><button class="subtle-btn" data-action="finance-snapshot">${icon('save')} Guardar valoración de hoy</button></div>
  <section class="finance-kpis">
    <article class="finance-kpi"><span>Valor actual</span><strong>${financeMoney(totals.value)}</strong><small>${positions.length} posiciones</small></article>
    <article class="finance-kpi"><span>Capital invertido</span><strong>${financeMoney(totals.invested)}</strong><small>Coste medio convertido a EUR</small></article>
    <article class="finance-kpi ${financeClass(totals.gain)}"><span>Resultado</span><strong>${financeMoney(totals.gain)}</strong><small>${financePct(totals.invested?totals.gain/totals.invested*100:0)}</small></article>
    <article class="finance-kpi"><span>Última valoración</span><strong>${e(history.at(-1)?.date||'—')}</strong><small>Histórico manual</small></article>
  </section>
  <div class="finance-grid">
    <section class="finance-card finance-performance"><div class="finance-card-head"><div><span class="finance-kicker">Cartera</span><h2>Evolución</h2></div><div class="finance-range">${[['1m','1M'],['3m','3M'],['6m','6M'],['1y','1A'],['all','Todo']].map(([id,label])=>`<button data-finance-range="${id}" class="${state.financeRange===id?'active':''}">${label}</button>`).join('')}</div></div>${financeChart(visible)}</section>
    <section class="finance-card"><div class="finance-card-head"><div><span class="finance-kicker">Distribución</span><h2>Por tipo de activo</h2></div></div><div class="finance-allocation">${[...allocations.entries()].sort((a,b)=>b[1]-a[1]).map(([type,value])=>`<div class="finance-allocation-row"><div><strong>${e(type)}</strong><span>${financeMoney(value)}</span></div><div class="finance-allocation-track"><i style="width:${Math.max(4,value/maxAllocation*100).toFixed(1)}%"></i></div><small>${totals.value?(value/totals.value*100).toFixed(1):'0.0'} %</small></div>`).join('')||'<div class="finance-chart-empty">Añade una posición para ver la distribución.</div>'}</div></section>
  </div>
  ${section('Posiciones',`<span class="pill neutral">${positions.length} activas</span>`)}
  <div class="finance-table-wrap"><table class="finance-table"><thead><tr><th>Activo</th><th>Tipo / origen</th><th>Cantidad</th><th>Precio medio</th><th>Precio actual</th><th>Valor</th><th>Resultado</th><th></th></tr></thead><tbody>
  ${positions.map(position=>{const m=financePositionMetrics(position);return `<tr><td><strong>${e(position.name)}</strong><small>${e(position.symbol||'Sin ticker')} · ${e(position.currency)}</small></td><td><strong>${e(position.type)}</strong><small>${e(position.account)}</small></td><td>${Number(position.quantity).toLocaleString('es-ES',{maximumFractionDigits:6})}</td><td>${Number(position.avgPrice).toLocaleString('es-ES',{maximumFractionDigits:4})} ${e(position.currency)}</td><td>${Number(position.currentPrice).toLocaleString('es-ES',{maximumFractionDigits:4})} ${e(position.currency)}</td><td><strong>${financeMoney(m.value)}</strong></td><td><strong class="${financeClass(m.gain)}">${financeMoney(m.gain)}</strong><small class="${financeClass(m.gainPct)}">${financePct(m.gainPct)}</small></td><td><div class="finance-row-actions"><button data-action="finance-edit" data-id="${e(position.id)}" aria-label="Editar ${e(position.name)}">Editar</button><button data-action="finance-delete" data-id="${e(position.id)}" aria-label="Eliminar ${e(position.name)}">Eliminar</button></div></td></tr>`;}).join('')}
  </tbody></table>${positions.length?'':empty('Todavía no hay posiciones','Añade tu primera posición para empezar a construir la cartera.',btn('Añadir posición','finance-add','primary'))}</div>
  <p class="finance-footnote">La gráfica combina valoraciones guardadas con el valor actual calculado a partir de tus precios manuales. No representa datos de mercado en tiempo real.</p>`;
}
function knowledgeSlug(value){
  return String(value||'seccion').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'seccion';
}
function safeMarkdownHref(value){
  const href=String(value||'').trim();
  if(href.startsWith('#')||href.startsWith('/')||/^https?:\/\//i.test(href)||/^mailto:/i.test(href))return href;
  return '#';
}
function markdownInline(raw){
  let source=String(raw??'');
  const tokens=[];
  const token=html=>{const key=`@@MDTOKEN${tokens.length}@@`;tokens.push(html);return key;};
  source=source.replace(/`([^`\n]+)`/g,(_,code)=>token(`<code>${e(code)}</code>`));
  source=source.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g,(_,label,href)=>token(`<a href="${e(safeMarkdownHref(href))}" rel="noopener noreferrer">${e(label)}</a>`));
  let html=e(source);
  html=html.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
           .replace(/__([^_]+)__/g,'<strong>$1</strong>')
           .replace(/~~([^~]+)~~/g,'<del>$1</del>')
           .replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>')
           .replace(/(^|[^_])_([^_\n]+)_/g,'$1<em>$2</em>');
  tokens.forEach((value,index)=>{html=html.replaceAll(`@@MDTOKEN${index}@@`,value);});
  return html;
}
function markdownHeadings(markdown){
  const result=[];let fenced=false;
  for(const line of String(markdown||'').replace(/\r/g,'').split('\n')){
    if(/^\s*```/.test(line)){fenced=!fenced;continue;}
    if(fenced)continue;
    const match=line.match(/^(#{1,6})\s+(.+)$/);
    if(match)result.push({level:match[1].length,text:match[2].replace(/[*_`~]/g,'').trim(),id:knowledgeSlug(match[2])});
  }
  return result;
}
function markdownReader(markdown){
  const lines=String(markdown||'').replace(/\r/g,'').split('\n');let html='',i=0;
  const isBlock=line=>/^\s*(#{1,6})\s+/.test(line)||/^\s*```/.test(line)||/^\s*>/.test(line)||/^\s*[-+*]\s+/.test(line)||/^\s*\d+[.)]\s+/.test(line)||/^\s*(---+|___+|\*\*\*+)\s*$/.test(line);
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    const fence=line.match(/^\s*```([\w-]*)\s*$/);
    if(fence){
      const language=fence[1]||'text',body=[];i++;
      while(i<lines.length&&!/^\s*```/.test(lines[i]))body.push(lines[i++]);
      if(i<lines.length)i++;
      html+=`<div class="md-code"><div class="md-code-head">${e(language)}</div><pre><code>${e(body.join('\n'))}</code></pre></div>`;continue;
    }
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    if(heading){const level=heading[1].length,id=knowledgeSlug(heading[2]);html+=`<h${level} id="${e(id)}">${markdownInline(heading[2])}</h${level}>`;i++;continue;}
    if(i+1<lines.length&&line.includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
      const header=line.replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
      i+=2;const rows=[];
      while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){rows.push(lines[i].replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));i++;}
      html+=`<div class="md-table-wrap"><table><thead><tr>${header.map(c=>`<th>${markdownInline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${header.map((_,idx)=>`<td>${markdownInline(row[idx]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;continue;
    }
    if(/^\s*>/.test(line)){
      const quote=[];while(i<lines.length&&/^\s*>/.test(lines[i]))quote.push(lines[i++].replace(/^\s*>\s?/,''));html+=`<blockquote>${quote.map(markdownInline).join('<br>')}</blockquote>`;continue;
    }
    if(/^\s*[-+*]\s+/.test(line)){
      const items=[];while(i<lines.length&&/^\s*[-+*]\s+/.test(lines[i])){const body=lines[i++].replace(/^\s*[-+*]\s+/,'');const task=body.match(/^\[([ xX])\]\s+(.*)$/);items.push(task?`<li class="task-list-item"><input type="checkbox" disabled ${task[1].toLowerCase()==='x'?'checked':''}><span>${markdownInline(task[2])}</span></li>`:`<li>${markdownInline(body)}</li>`);}html+=`<ul>${items.join('')}</ul>`;continue;
    }
    if(/^\s*\d+[.)]\s+/.test(line)){
      const items=[];while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i]))items.push(`<li>${markdownInline(lines[i++].replace(/^\s*\d+[.)]\s+/,''))}</li>`);html+=`<ol>${items.join('')}</ol>`;continue;
    }
    if(/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)){html+='<hr>';i++;continue;}
    const paragraph=[line.trim()];i++;
    while(i<lines.length&&lines[i].trim()&&!isBlock(lines[i])&&!(i+1<lines.length&&lines[i].includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])))paragraph.push(lines[i++].trim());
    html+=`<p>${paragraph.map(markdownInline).join('<br>')}</p>`;
  }
  return html;
}
async function knowledgeView(){
  const notes=await api.request('GET','/knowledge');
  const query=state.knowledgeQuery.toLocaleLowerCase();
  const filtered=notes.filter(n=>(!state.knowledgeCategory||n.category===state.knowledgeCategory)&&(!query||n.title.toLocaleLowerCase().includes(query)||n.content.toLocaleLowerCase().includes(query)));
  if(!state.knowledgeId||!notes.some(n=>n.id===state.knowledgeId))state.knowledgeId=filtered[0]?.id||notes[0]?.id||null;
  const note=notes.find(n=>n.id===state.knowledgeId)||null;
  const headings=note?markdownHeadings(note.content):[];
  const edit=state.knowledgeMode==='edit';
  return `${heading('Conocimiento','Tu memoria durable en Markdown, con fuentes y revisiones.',`<div class="btn-row">${note?btn(edit?'Cancelar edición':'Editar Markdown',edit?'knowledge-cancel-edit':'knowledge-edit',edit?'':'primary'):''}</div>`)}
  <div class="knowledge-shell">
    <aside class="knowledge-library">
      <div class="knowledge-library-head"><div><span class="knowledge-kicker">Memoria</span><h2>Notas Markdown</h2></div><span class="pill neutral">${notes.length}</span></div>
      <label class="knowledge-search">${icon('search')}<input id="knowledge-search" value="${e(state.knowledgeQuery)}" placeholder="Buscar en memoria…"></label>
      <div class="knowledge-filters"><button class="${!state.knowledgeCategory?'active':''}" data-knowledge-category="">Todo</button>${AREAS.map(a=>`<button class="${state.knowledgeCategory===a.id?'active':''}" data-knowledge-category="${a.id}">${e(a.name)}</button>`).join('')}</div>
      <div class="knowledge-list">${filtered.length?filtered.map(n=>`<button class="knowledge-list-item ${n.id===state.knowledgeId?'active':''}" data-knowledge="${e(n.id)}"><span class="knowledge-doc-icon">${icon('file')}</span><span><strong>${e(n.title)}</strong><small>${e(area(n.category).name)} · v${n.revision||1} · ${n.status==='approved'?'memoria activa':'pendiente'}</small></span></button>`).join(''):`<div class="knowledge-list-empty">No hay notas con este filtro.</div>`}</div>
    </aside>
    <section class="knowledge-reader">
      ${note?`<header class="knowledge-doc-head"><div><div class="knowledge-badges"><span class="pill ${note.status==='proposed'?'warning':''}">${note.status==='approved'?'Memoria activa':'Pendiente de revisión'}</span><span class="pill neutral">Markdown · v${note.revision||1}</span></div><h1>${e(note.title)}</h1><p>Fuente: ${e(note.source)} · ${e(area(note.category).name)} · actualizado ${e(note.updatedAt?new Date(note.updatedAt).toLocaleString('es'):'—')}</p></div>${note.status==='proposed'?btn('Aprobar','approve-note','primary',`data-id="${e(note.id)}"`):''}</header>
        ${edit?`<form class="knowledge-editor" data-form="knowledge-edit"><input type="hidden" name="id" value="${e(note.id)}"><input type="hidden" name="expectedRevision" value="${note.revision||1}"><label>Título<input name="title" maxlength="120" value="${e(note.title)}" required></label><div class="knowledge-editor-grid"><label>Markdown<textarea id="knowledge-markdown" name="content" maxlength="50000" required>${e(note.content)}</textarea></label><div class="knowledge-preview"><div class="knowledge-preview-label">Preview</div><article class="markdown-body" id="knowledge-live-preview">${markdownReader(note.content)}</article></div></div><div class="knowledge-editor-footer"><span>Guardar crea una nueva revisión.</span><button class="btn primary" type="submit">Guardar revisión</button></div></form>`:`<article class="markdown-body">${markdownReader(note.content)}</article>`}
      `:`<div class="knowledge-empty">No hay notas disponibles.</div>`}
    </section>
    <aside class="knowledge-outline">
      <div class="knowledge-outline-card"><span class="knowledge-kicker">Documento</span><h3>Índice</h3>${headings.length?headings.map(h=>`<a class="level-${h.level}" href="#${e(h.id)}">${e(h.text)}</a>`).join(''):`<span class="knowledge-outline-empty">Sin encabezados.</span>`}</div>
      ${note?`<div class="knowledge-outline-card"><span class="knowledge-kicker">Memoria</span><h3>Metadatos</h3><div class="context-line"><span>Estado</span><strong>${note.status==='approved'?'Activa':'Propuesta'}</strong></div><div class="context-line"><span>Revisión</span><strong>v${note.revision||1}</strong></div><div class="context-line"><span>Formato</span><strong>Markdown</strong></div><div class="context-line"><span>Ámbito</span><strong>${e(area(note.category).name)}</strong></div></div>`:''}
    </aside>
  </div>`;
}
function agentsView(){return heading('Agentes con límites claros','Vista de la política propuesta. El backend deberá hacerla cumplir.')+`<div class="integration-grid">${AREAS.map(a=>`<article class="panel integration-card ${a.color}"><span class="tile-icon colored">${icon(a.icon)}</span><h3>${a.name}</h3><p>${a.description}</p><div class="pill neutral">Solo su área · sin cuentas conectadas</div><div style="margin-top:18px">${btn('Abrir conversación','start-agent','',`data-id="${a.id}"`)}</div></article>`).join('')}</div>${section('Matriz de permisos propuesta')}<div class="panel table-wrap"><table class="permission-table"><thead><tr><th>Identidad</th><th>Conocimiento</th><th>Calendario / tareas</th><th>Secretos en texto</th><th>Acciones sensibles</th></tr></thead><tbody><tr><td>General</td><td>Áreas autorizadas</td><td>Según permiso</td><td>No</td><td>Confirmación</td></tr>${AREAS.map(a=>`<tr><td>${a.name}</td><td>Solo ${a.name}</td><td>Ámbitos autorizados</td><td>No</td><td>Confirmación</td></tr>`).join('')}<tr><td>Sandbox</td><td>Ninguno</td><td>No</td><td>No</td><td>No</td></tr><tr><td>Developer</td><td>Código / fixtures</td><td>No por defecto</td><td>No</td><td>Revisión humana</td></tr></tbody></table></div>`;}
function accountsView(){return heading('Conexiones, bajo tu control','Ninguna cuenta está conectada en este prototipo.')+`<div class="integration-grid">${[{id:'nextcloud',icon:'cloud',name:'Nextcloud',desc:'Archivos, versiones, calendario y sincronización. Tu UI, sus APIs.'},{id:'1password',icon:'lock',name:'1Password',desc:'Un broker utilizará credenciales autorizadas. El modelo no recibirá acceso a tu bóveda.'},{id:'openclaw',icon:'spark',name:'OpenClaw',desc:'Runtime de agentes detrás de un adaptador. Sesiones privadas y Sandbox separadas.'},{id:'tasks',icon:'tasks',name:'Tareas / CalDAV',desc:'Primera opción de backend para tareas. Vikunja queda como alternativa.'},{id:'authorization',icon:'shield',name:'Autorización',desc:'Políticas aplicadas por el servidor. OpenFGA es una opción, no una dependencia de la UI.'},{id:'models',icon:'layers',name:'Modelos por API',desc:'Proveedor intercambiable. Sin claves, consumo de tokens ni llamadas a modelos en la demo.'}].map(i=>`<article class="panel integration-card"><span class="tile-icon">${icon(i.icon)}</span><h3>${i.name}</h3><span class="pill neutral">No conectado</span><p>${i.desc}</p>${btn('Ver contrato de integración','integration','',`data-id="${i.id}"`)}</article>`).join('')}</div>`;}
function computerView(){const label={idle:'Sin sesión activa',waiting:'Esperando intervención · simulación',human:'Control humano · simulación',paused:'Sesión detenida · simulación'}[state.computer];return heading('Cuando necesitas tomar el control','Vista de diseño. No hay escritorio remoto ni navegador conectado.')+`<div class="split"><div class="panel"><div class="btn-row" style="justify-content:space-between;margin-bottom:20px"><h3>Escritorio de una tarea</h3><span class="pill warning">Simulación</span></div><div class="screen"><div class="screen-inner">${icon('monitor')}<h3>${label}</h3><p>En producción verás aquí la misma sesión gráfica que utiliza el agente. El control deberá tener un único propietario.</p></div></div><div class="btn-row" style="margin-top:18px">${btn('Simular solicitud','computer-wait')}${btn('Tomar control','computer-take','primary',state.computer==='waiting'?'':'disabled')}${btn('Devolver control','computer-release','',state.computer==='human'?'':'disabled')}${btn('Detener','computer-stop')}</div></div><div class="panel"><h2>Intervención humana</h2>${[{title:'El agente se detiene',desc:'El runtime suspende las entradas antes de ceder la sesión.'},{title:'Tú completas el paso',desc:'Autenticación, permisos o confirmaciones que requieren una persona.'},{title:'Confirmas la continuación',desc:'El agente captura el estado actualizado y vuelve a evaluar la tarea.'}].map((s,i)=>`<div class="step"><b>${i+1}</b><div><strong>${s.title}</strong><p>${s.desc}</p></div></div>`).join('')}<div class="note-box warning">No se presupone compatibilidad nativa. El adaptador debe verificar pausa, control exclusivo, reconexión y captura en la versión concreta.</div></div></div>`;}
function developerView(){return heading('Lisa, a tu manera','Diseña cambios sin tocar tus datos ni la versión estable.',btn(`${icon('plus')} Proponer un cambio`,'dev-proposal','primary'))+`<div class="split"><div class="panel"><div class="eyebrow">Entorno de desarrollo</div><h2>Código separado de tu vida personal.</h2><p style="font-size:12px;margin-top:13px;line-height:1.9">Este panel será el punto de entrada para un agente programador, un editor y una terminal aislada. En esta versión solo puedes revisar el flujo propuesto.</p><pre class="code">$ git switch -c propuesta/cambio-ui\n$ ejecutar pruebas\n$ abrir preview\n\n# Vista ilustrativa. No se ejecutan comandos.\n# Sin acceso a documentos, secretos o producción.</pre>${btn('Terminal pendiente del backend','none','','disabled')}</div><div class="panel"><h2>Del cambio a la versión estable</h2>${[{title:'Propuesta',desc:'Describe el resultado deseado.'},{title:'Rama y preview',desc:'El agente trabaja sobre código y fixtures, no sobre datos privados.'},{title:'Pruebas y revisión',desc:'Ver diff, pruebas y permisos afectados.'},{title:'Aplicar o descartar',desc:'Publicar exige autorización. Conservar versión anterior para rollback.'}].map((s,i)=>`<div class="step"><b>${i+1}</b><div><strong>${s.title}</strong><p>${s.desc}</p></div></div>`).join('')}</div></div>`;}
async function auditView(){const rows=await api.request('GET','/audit');return heading('Actividad visible','Registro de interacciones simuladas. No es una auditoría de producción.')+(rows.length?`<div class="panel">${rows.map(r=>`<div class="timeline">${icon('check')}<div><strong style="font-size:12px">${e(r.action)}</strong><p>${e(r.resource)}</p></div><span class="pill neutral" style="margin-left:auto">${new Date(r.at).toLocaleTimeString('es')}</span></div>`).join('')}</div>`:empty('Todavía no hay actividad','Guarda un chat, crea una tarea o promueve una conversación para revisar el flujo.'));}
function settingsView(){return heading('Un sistema que puedas cambiar','Configuración y estado real de esta entrega.')+`<div class="grid-2"><div class="panel"><h2>Modo de demostración</h2><p style="font-size:12px;margin:15px 0;line-height:1.8">Los datos viven en memoria del navegador. No usamos almacenamiento local para mensajes ni enviamos tus textos a un servidor. Recargar elimina también las conversaciones marcadas como guardadas en la demo.</p><div class="btn-row">${btn('Reiniciar la demo','reset','danger')}${btn('Cambiar tema','theme')}</div></div><div class="panel"><h2>API preparada, backend pendiente</h2><p style="font-size:12px;margin:15px 0;line-height:1.8">Las vistas consumen un adaptador común. La base futura es <code>/api/v1</code>. Los endpoints privados no se abren sin autenticación: actualmente rechazan acciones con un error explícito de no implementado.</p>${btn('Comprobar endpoint','check-api')}</div><div class="panel"><h2>Revisar este diseño</h2><p style="font-size:12px;margin:15px 0;line-height:1.8">Prueba ambos chats, guarda uno, clasifícalo y continúa en otro agente. Revisa también los tamaños de móvil y el modo oscuro.</p>${btn(`${icon('download')} Descargar checklist`,'download-checklist')}</div><div class="panel"><h2>Sin conexiones ocultas</h2><p style="font-size:12px;margin:15px 0;line-height:1.8">Nextcloud, 1Password, OpenClaw, modelos, escritorio y terminal están pendientes. No se ha desplegado el servidor personal ni se han migrado archivos.</p>${btn('Ver integraciones','accounts')}</div></div>`;}
const views={home,chat:chatView,history:historyView,files:filesView,tasks:tasksView,calendar:calendarView,knowledge:knowledgeView,finance:financeView,agents:agentsView,accounts:accountsView,computer:computerView,developer:developerView,audit:auditView,settings:settingsView};
async function render(){const body=await (views[state.view]||home)();mount.innerHTML=`<div class="shell ${state.menu?'menu-open':''} ${state.sidebarCollapsed?'collapsed':''}">${sidebar()}<div class="main-wrap">${topbar()}<main class="content" id="main" tabindex="-1">${banner()}${body}</main></div></div>`;document.title=`${titles[state.view]||'Inicio'} · Lisa`;if(state.view==='chat'){const box=document.querySelector('#messages');if(box)box.scrollTop=box.scrollHeight;}}
async function newChat(mode,agentId,projectId=null){const c=await api.request('POST','/chats',{mode,agentId,projectId});state.chatId=c.id;nav('chat');}
function eventModal(date='2026-09-23'){modal('Nuevo evento de ejemplo',`<form data-form="event"><label class="field">Título<input name="title" required maxlength="160" placeholder="¿Qué quieres organizar?"></label><div class="grid-2"><label class="field">Fecha<input type="date" name="date" value="${e(date)}" required></label><label class="field">Hora<input type="time" name="time" value="10:00" required></label></div><label class="field">Categoría<select name="category">${options()}</select></label><div class="modal-footer"><button class="btn primary" type="submit">Crear en la demo</button></div></form>`);}
async function financeModal(id=null){
  const positions=id?await api.request('GET','/finance/positions'):[];
  const position=id?positions.find(p=>p.id===id):null;
  if(id&&!position)throw new Error('Posición no encontrada.');
  modal(position?'Editar posición':'Añadir posición',financePositionForm(position));
}
async function handleAction(action,target){
 if(action==='close'){dialog.close();return;}
 if(action==='theme'){toast('Esta propuesta visual está fijada en modo claro.');return;}
 if(action==='menu'){state.menu=!state.menu;document.querySelector('.shell').classList.toggle('menu-open',state.menu);const b=document.querySelector('.mobile-menu');b?.setAttribute('aria-expanded',String(state.menu));return;}
 if(action==='sidebar-collapse'){state.sidebarCollapsed=!state.sidebarCollapsed;await render();return;}
 if(action==='new-general'||action==='new-sandbox'){await newChat(action==='new-general'?'general':'sandbox');return;}
 if(action==='audit'||action==='accounts'){nav(action);return;}
 if(action==='start-agent'){const projects=await api.request('GET','/projects');const project=projects.find(p=>p.agentId===target.dataset.id);await newChat('agent',target.dataset.id,project?.id||null);return;}
 if(action==='project-new-chat'){await newChat('agent',target.dataset.agent,target.dataset.project);return;}
 if(action==='pin-chat'){const id=target.dataset.chatId;await api.request('PATCH',`/chats/${id}`,{pinned:target.dataset.pinned!=='true'});await render();toast(target.dataset.pinned==='true'?'Conversación desfijada.':'Conversación fijada.');return;}
 if(action==='archive-chat'){const id=target.dataset.chatId;await api.request('PATCH',`/chats/${id}`,{archived:true});if(id===state.chatId){const c=await api.request('GET',`/chats/${id}`);const list=c.projectId?await api.request('GET',`/chats?projectId=${encodeURIComponent(c.projectId)}`):[];state.chatId=list[0]?.id||null;if(!state.chatId){const projects=await api.request('GET','/projects');const project=projects.find(p=>p.id===c.projectId);if(project) return newChat('agent',project.agentId,project.id);}}await render();toast('Conversación archivada.');return;}
 if(action==='sample'){const draft=composerState();draft.text='¿Cómo podría organizar mis ideas en este espacio?';const box=document.querySelector('#message');if(box){box.value=draft.text;box.focus();}return;}
 if(action==='attach-files'){document.querySelector('#chat-files')?.click();return;}
 if(action==='remove-attachment'){const draft=composerState();draft.attachments=draft.attachments.filter(file=>file.id!==target.dataset.attachment);await render();document.querySelector('#message')?.focus();return;}
 if(action==='cancel-queued'){const flow=sendingState();const index=Number(target.dataset.queueIndex);if(Number.isInteger(index)&&index>=0)flow.queue.splice(index,1);await render();return;}
 if(action==='stop-generation'){const flow=sendingState();if(flow.token)flow.token.cancelled=true;const active=flow.sending;flow.busy=false;flow.sending=null;flow.token=null;if(active){const draft=composerState();if(!draft.text&&!draft.attachments.length){draft.text=active.content||'';draft.attachments=[...(active.attachments||[])];}else{flow.queue.unshift(active);}}await render();toast('Envío detenido. El borrador se ha recuperado.');return;}
 if(action==='copy-message'||action==='reuse-message'||action==='retry-message'){const c=await api.request('GET',`/chats/${state.chatId}`);let message=c.messages.find(m=>m.id===target.dataset.message);if(action==='retry-message'){const index=c.messages.findIndex(m=>m.id===target.dataset.message);message=[...c.messages.slice(0,index)].reverse().find(m=>m.role==='user');}if(!message)return;if(action==='copy-message'){if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(message.content||'');toast('Mensaje copiado.');return;}const draft=composerState();draft.text=message.content||'';draft.attachments=(message.attachments||[]).map(file=>({...file,id:globalThis.crypto?.randomUUID?.()||file.id}));await render();document.querySelector('#message')?.focus();toast(action==='retry-message'?'Mensaje preparado para reintentar.':'Mensaje cargado para editar y reenviar.');return;}
 if(action==='save-chat'){const c=await api.request('GET',`/chats/${state.chatId}`);await api.request('POST',`/chats/${c.id}/save`,{category:c.category,expectedRevision:c.revision});await render();toast('Guardado en el historial de la demo. No se ha añadido conocimiento.');return;}
 if(action==='categorize'||action==='promote'){const c=await api.request('GET',`/chats/${state.chatId}`);modal(action==='promote'?'Continuar con otro agente':'Guardar en una categoría',`<p class="modal-copy">${action==='promote'?'Se crea una conversación nueva. La original no cambia de permisos. El texto importado se trata como contenido no confiable.':'Solo cambia la clasificación en el historial. Un chat Sandbox continúa siendo Sandbox.'}</p><form data-form="${action}"><label class="field">Destino<select name="target">${options(c.category)}</select></label><div class="note-box">${action==='promote'?'La nueva conversación empieza sin guardar. No se transfieren cookies, herramientas, credenciales ni archivos.':'Guardar no añade el contenido a la memoria personal.'}</div><div class="modal-footer"><button class="btn primary" type="submit">${action==='promote'?'Crear nueva conversación':'Guardar aquí'}</button></div></form>`);return;}
 if(action==='discard'){modal('Descartar esta conversación',`<p class="modal-copy">Se eliminará de la memoria de esta demo. Esta acción no afecta a ninguna cuenta externa.</p><div class="modal-footer">${btn('Cancelar','close')}${btn('Descartar','confirm-discard','danger')}</div>`);return;}
 if(action==='confirm-discard'){await api.request('DELETE',`/chats/${state.chatId}`);state.chatId=null;dialog.close();nav('history');toast('Conversación descartada.');return;}
 if(action==='extract'){modal('Proponer conocimiento',`<p class="modal-copy">Escribe una nota de prueba. Se guardará como propuesta pendiente, separada del historial. No hay extracción por IA en esta demo.</p><form data-form="knowledge"><label class="field">Título<input name="title" maxlength="120" required></label><label class="field">Nota<textarea name="content" maxlength="8000" required></textarea></label><div class="modal-footer"><button class="btn primary" type="submit">Crear propuesta</button></div></form>`);return;}
 if(action==='approve-note'){await api.request('POST',`/knowledge/${target.dataset.id}/approve`,{});await render();toast('Nota de ejemplo aprobada.');return;}
 if(action==='knowledge-edit'){state.knowledgeMode='edit';await render();document.querySelector('#knowledge-markdown')?.focus();return;}
 if(action==='knowledge-cancel-edit'){state.knowledgeMode='read';await render();return;}
 if(action==='new-task'){modal('Nueva tarea',`<form data-form="task"><label class="field">Qué hay que hacer<input name="title" required maxlength="200" placeholder="Una tarea de ejemplo…"></label><label class="field">Categoría<select name="category">${options('personal')}</select></label><div class="modal-footer"><button class="btn primary" type="submit">Crear en la demo</button></div></form>`);return;}
 if(action==='new-event'){eventModal();return;}
 if(action==='finance-add'){await financeModal();return;}
 if(action==='finance-edit'){await financeModal(target.dataset.id);return;}
 if(action==='finance-delete'){const positions=await api.request('GET','/finance/positions');const position=positions.find(p=>p.id===target.dataset.id);if(!position)throw new Error('Posición no encontrada.');modal('Eliminar posición',`<p class="modal-copy">Se eliminará <strong>${e(position.name)}</strong> de esta sesión de demostración.</p><div class="modal-footer">${btn('Cancelar','close')}${btn('Eliminar','finance-confirm-delete','danger',`data-id="${e(position.id)}"`)}</div>`);return;}
 if(action==='finance-confirm-delete'){await api.request('DELETE',`/finance/positions/${target.dataset.id}`);dialog.close();await render();toast('Posición eliminada de la demo.');return;}
 if(action==='finance-snapshot'){await api.request('POST','/finance/snapshots',{});await render();toast('Valoración de hoy guardada en la sesión.');return;}
 if(action==='integration'||action==='nextcloud'){const id=action==='nextcloud'?'nextcloud':target.dataset.id;modal(`Integración: ${id}`,`<p class="modal-copy">Estado: pendiente de implementación y pruebas con el servicio real.</p><pre class="code">UI → Lisa API → autorización → adaptador\n\n${e(id)}\n\nSin tokens ni credenciales en el frontend.\nLa conexión se configurará en el servidor.</pre><p class="modal-copy">Las capacidades se publicarán desde /api/v1/bootstrap. El contrato completo está en contracts/openapi.mjs y en la especificación del repositorio.</p>${btn('Conexión no disponible en demo','none','','disabled')}`);return;}
 if(action.startsWith('computer-')){const transitions={'computer-wait':'waiting','computer-take':'human','computer-release':'waiting','computer-stop':'paused'};state.computer=transitions[action];api.log('computer.simulation',state.computer);await render();toast('Transición visual simulada. No se ha controlado ningún ordenador.');return;}
 if(action==='dev-proposal'){modal('Proponer un cambio de interfaz',`<form data-form="developer"><label class="field">Describe el cambio<textarea name="content" maxlength="4000" required placeholder="Por ejemplo: añadir una vista de documentos pendientes…"></textarea></label><div class="note-box">Se mostrará una propuesta visual. No se ejecutarán comandos, cambios en Git ni despliegues.</div><div class="modal-footer"><button class="btn primary" type="submit">Revisar propuesta</button></div></form>`);return;}
 if(action==='reset'){modal('Reiniciar la demostración',`<p class="modal-copy">Se borrarán las conversaciones, notas y cambios de esta demo. Los ejemplos iniciales volverán a aparecer.</p><div class="modal-footer">${btn('Cancelar','close')}${btn('Reiniciar','confirm-reset','danger')}</div>`);return;}
 if(action==='confirm-reset'){api.reset();state.chatId=null;dialog.close();nav('home');toast('Demo reiniciada.');return;}
 if(action==='check-api'){try{await new HttpClient().request('GET','/bootstrap');toast('La API ha respondido. El frontend sigue en modo demo.');}catch(error){toast(`API no conectada: ${error.message}`);}return;}
 if(action==='download-checklist'){const body='# Auditoría Lisa v0.3\n\n- [ ] Crear ambos modos de chat\n- [ ] Guardar sin añadir memoria\n- [ ] Categorizar Sandbox sin elevar permisos\n- [ ] Continuar en un agente: nuevo ID y original intacto\n- [ ] Proponer y aprobar conocimiento\n- [ ] Crear y completar tarea\n- [ ] Navegar calendario y crear evento ficticio\n- [ ] Filtrar y previsualizar archivos ficticios\n- [ ] Revisar permisos e integraciones no conectadas\n- [ ] Probar móvil, teclado y modo oscuro\n- [ ] Ver transición visual de takeover\n- [ ] Ver propuesta de desarrollo sin ejecución\n- [ ] Recargar elimina todo el estado demo\n';const url=URL.createObjectURL(new Blob([body],{type:'text/markdown'}));const a=document.createElement('a');a.href=url;a.download='lisa-auditoria.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
}
document.addEventListener('click',async ev=>{const target=ev.target.closest('button');if(!target||target.disabled)return;try{
 if(target.dataset.nav){nav(target.dataset.nav);return;}
 if(target.dataset.new){await newChat(target.dataset.new);return;}
 if(target.dataset.agent){const projects=await api.request('GET','/projects');const project=projects.find(p=>p.agentId===target.dataset.agent);await newChat('agent',target.dataset.agent,project?.id||null);return;}
 if(target.dataset.chat){state.chatId=target.dataset.chat;nav('chat');return;}
 if(target.dataset.financeRange){state.financeRange=target.dataset.financeRange;await render();return;}
 if(target.hasAttribute('data-category')){state.category=target.dataset.category;await render();return;}
 if(target.dataset.knowledge){state.knowledgeId=target.dataset.knowledge;state.knowledgeMode='read';await render();return;}
 if(target.hasAttribute('data-knowledge-category')){state.knowledgeCategory=target.dataset.knowledgeCategory;state.knowledgeId=null;state.knowledgeMode='read';await render();return;}
 if(target.dataset.task){await api.request('PATCH',`/tasks/${target.dataset.task}`,{done:target.dataset.done!=='true'});await render();return;}
 if(target.dataset.file){const f=await api.request('GET',`/files/${target.dataset.file}`);modal(f.name,`<p class="modal-copy">Vista de contenido ficticio, no un archivo real.</p><pre class="code">${e(f.content)}</pre><p class="resource-line">ID: ${e(f.id)} · versión ${f.version} · ${e(area(f.category).name)}</p>`);return;}
 if(target.dataset.month){state.month+=Number(target.dataset.month);if(state.month<0){state.month=11;state.year--;}if(state.month>11){state.month=0;state.year++;}await render();return;}
 if(target.dataset.date){eventModal(target.dataset.date);return;}
 if(target.dataset.action)await handleAction(target.dataset.action,target);
 }catch(error){toast(error.message||'No se pudo completar la acción.');}});
document.addEventListener('submit',async ev=>{const form=ev.target;if(!form.dataset.form)return;ev.preventDefault();const body=Object.fromEntries(new FormData(form));const kind=form.dataset.form;try{
 if(kind==='message'){const chatId=state.chatId,draft=composerState(chatId),content=String(body.content||'').trim(),attachments=[...draft.attachments];if(!content&&!attachments.length)return;const payload={content,attachments};draft.text='';draft.attachments=[];const flow=sendingState(chatId);if(flow.busy){flow.queue.push(payload);await render();document.querySelector('#message')?.focus();toast('Mensaje añadido a la cola.');return;}await sendChatPayload(chatId,payload);document.querySelector('#message')?.focus();return;}
 if(kind==='search'){state.filter=body.query;await render();return;}
 if(kind==='categorize'){const c=await api.request('GET',`/chats/${state.chatId}`);await api.request('POST',`/chats/${c.id}/save`,{category:body.target,expectedRevision:c.revision});dialog.close();await render();toast('Clasificado sin cambiar el modo ni los permisos.');return;}
 if(kind==='promote'){const c=await api.request('POST',`/chats/${state.chatId}/promotions`,{target:body.target,selectedAttachmentIds:[]});state.chatId=c.id;dialog.close();await render();toast('Nueva conversación creada. La original no ha cambiado.');return;}
 if(kind==='knowledge'){await api.request('POST',`/chats/${state.chatId}/knowledge-proposals`,body);dialog.close();nav('knowledge');toast('Propuesta creada; falta tu aprobación.');return;}
 if(kind==='knowledge-edit'){const updated=await api.request('PATCH',`/knowledge/${body.id}`,{title:body.title,content:body.content,expectedRevision:Number(body.expectedRevision)});state.knowledgeId=updated.id;state.knowledgeMode='read';await render();toast(`Memoria actualizada · revisión v${updated.revision}.`);return;}
 if(kind==='task'){await api.request('POST','/tasks',body);dialog.close();await render();toast('Tarea creada en la demo.');return;}
 if(kind==='event'){await api.request('POST','/events',body);dialog.close();await render();toast('Evento de ejemplo creado.');return;}
 if(kind==='finance-position'){const id=String(body.id||'');delete body.id;if(id)await api.request('PATCH',`/finance/positions/${id}`,body);else await api.request('POST','/finance/positions',body);dialog.close();await render();toast(id?'Posición actualizada.':'Posición añadida a la demo.');return;}
 if(kind==='developer'){dialog.close();modal('Propuesta · sin ejecutar',`<p class="modal-copy">${e(body.content)}</p><pre class="code">Estado: propuesta de demostración\nDestino: nueva rama de código\nDatos: solo fixtures\nValidaciones: tests, diff, preview\nPublicación: aprobación humana</pre><div class="modal-footer">${btn('Cerrar','close')}${btn('Aplicar · backend pendiente','none','primary','disabled')}</div>`);return;}
 }catch(error){toast(error.message||'No se pudo completar la operación.');}});
document.addEventListener('input',ev=>{if(ev.target?.id==='message')composerState().text=ev.target.value;if(ev.target?.id==='knowledge-search'){state.knowledgeQuery=ev.target.value;clearTimeout(globalThis.__knowledgeSearchTimer);globalThis.__knowledgeSearchTimer=setTimeout(()=>render().catch(error=>toast(error.message)),180);}if(ev.target?.id==='knowledge-markdown'){const preview=document.querySelector('#knowledge-live-preview');if(preview)preview.innerHTML=markdownReader(ev.target.value);}});
document.addEventListener('change',async ev=>{if(ev.target?.id!=='chat-files')return;stageFiles(ev.target.files||[]);ev.target.value='';await render();document.querySelector('#message')?.focus();});
document.addEventListener('keydown',ev=>{if(ev.target?.id!=='message'||ev.isComposing)return;if(ev.key==='Enter'&&!ev.shiftKey&&window.innerWidth>760){ev.preventDefault();ev.target.form?.requestSubmit();}});
document.addEventListener('paste',async ev=>{if(ev.target?.id!=='message')return;const files=[...(ev.clipboardData?.files||[])];if(!files.length)return;ev.preventDefault();stageFiles(files);await render();document.querySelector('#message')?.focus();});
document.addEventListener('dragover',ev=>{if(ev.target.closest?.('[data-dropzone="chat"]'))ev.preventDefault();});
document.addEventListener('drop',async ev=>{if(!ev.target.closest?.('[data-dropzone="chat"]'))return;ev.preventDefault();const files=[...(ev.dataTransfer?.files||[])];if(!files.length)return;stageFiles(files);await render();document.querySelector('#message')?.focus();});
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(views[v]){state.view=v;render().catch(err=>toast(err.message));}});
const initial=location.hash.slice(1);if(views[initial])state.view=initial;
render().catch(error=>{mount.textContent=`No se pudo iniciar Lisa: ${error.message}`;});
