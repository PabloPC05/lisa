import { AREAS, uid, copy, text, createConversation, saveConversation, promoteConversation, makeFixtures, categoryOK } from './domain.mjs';

/** All views use this transport. Demo state is memory-only and disappears on reload. */
export class DemoClient {
  constructor() { this.reset(); }
  reset() { this.data = makeFixtures(); this.chats = []; }
  log(action, resource) { this.data.audit.unshift({id:uid(), action, resource, at:new Date().toISOString(), result:'simulated'}); }
  chat(id) { const c = this.chats.find(c => c.id === id); if (!c) throw new Error('Conversación no encontrada.'); return c; }
  async request(method, path, body = {}) {
    const [route, query = ''] = path.split('?');
    const q = new URLSearchParams(query);
    if (method === 'GET' && route === '/bootstrap') return {mode:'demo', agents:copy(AREAS), integrations:[], version:'0.4.0'};
    if (method === 'GET' && route === '/chats') return copy(this.chats.filter(c => q.get('saved') !== 'true' || c.saved));
    if (method === 'POST' && route === '/chats') { const c = createConversation(body.mode, body.agentId); this.chats.push(c); return copy(c); }
    const match = route.match(/^\/chats\/([^/]+)(?:\/(messages|save|promotions|knowledge-proposals))?$/);
    if (match) {
      const c = this.chat(match[1]); const action = match[2];
      if (method === 'GET' && !action) return copy(c);
      if (method === 'DELETE' && !action) { this.chats = this.chats.filter(x => x.id !== c.id); this.log('chat.discard', c.id); return null; }
      if (method === 'POST' && action === 'messages') {
        const value = text(body.content);
        const attachments = Array.isArray(body.attachments) ? body.attachments.slice(0, 8).map(file => {
          const name = text(String(file?.name || 'archivo'), 180);
          const size = Number(file?.size || 0);
          if (!Number.isFinite(size) || size < 0 || size > 25 * 1024 * 1024) throw new Error('Cada adjunto debe ocupar como máximo 25 MiB.');
          return {id:String(file?.id || uid()), name, size, type:String(file?.type || 'application/octet-stream').slice(0,120), status:'attached'};
        }) : [];
        const now = new Date().toISOString();
        c.messages.push({id:uid(), role:'user', content:value, attachments, createdAt:now, status:'delivered'});
        if (c.title === 'Nueva conversación') c.title = value.slice(0,60);
        const note = c.mode === 'sandbox' ? 'Este chat representa el modo Sandbox: sin conocimiento personal ni herramientas privadas. El aislamiento real se implementará en el servidor.' : 'Este chat representa el acceso al conocimiento autorizado. Aún no está conectado a tus documentos ni a ningún modelo.';
        c.messages.push({id:uid(), role:'assistant', content:`Respuesta de demostración, no generada por IA.\n\n${note}\n\nEl composer ya admite cola de mensajes, adjuntos de demostración, reenvío y cancelación. El backend real sustituirá esta respuesta simulada por streaming.`, attachments:[], createdAt:new Date().toISOString(), status:'complete'});
        c.revision++; return copy(c);
      }
      if (method === 'POST' && action === 'save') {
        if (body.expectedRevision !== c.revision) throw new Error('Conflicto de revisión. Vuelve a abrir el chat.');
        Object.assign(c, saveConversation(c, body.category)); this.log('chat.save', c.id); return copy(c);
      }
      if (method === 'POST' && action === 'promotions') {
        const next = promoteConversation(c, body.target); this.chats.push(next); this.log('chat.promote', next.id); return copy(next);
      }
      if (method === 'POST' && action === 'knowledge-proposals') {
        if (!c.saved) throw new Error('Guarda la conversación antes de proponer conocimiento.');
        const item = {id:uid(), title:text(body.title,120), category:c.category, content:text(body.content), source:c.id, status:'proposed'};
        this.data.knowledge.push(item); this.log('knowledge.propose', item.id); return copy(item);
      }
    }
    if (method === 'GET' && route === '/files') return copy(this.data.files.filter(f => !q.get('category') || f.category === q.get('category')));
    if (method === 'GET' && route.startsWith('/files/')) { const f=this.data.files.find(f=>f.id === route.slice(7)); if (!f) throw new Error('Archivo no encontrado.'); return copy(f); }
    for (const collection of ['tasks','events','knowledge','audit']) {
      if (method === 'GET' && route === `/${collection}`) return copy(this.data[collection]);
    }
    if (method === 'POST' && route === '/tasks') {
      if (!categoryOK(body.category)) throw new Error('Categoría desconocida.');
      const task = {id:uid(), title:text(body.title,200), category:body.category, done:false};
      this.data.tasks.unshift(task); this.log('task.create',task.id); return copy(task);
    }
    if (method === 'PATCH' && route.startsWith('/tasks/')) {
      const task = this.data.tasks.find(t=>t.id === route.slice(7)); if (!task) throw new Error('Tarea no encontrada.');
      if (typeof body.done !== 'boolean') throw new Error('Estado inválido.');
      task.done = body.done; this.log('task.update',task.id); return copy(task);
    }
    if (method === 'POST' && route === '/events') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time) || !categoryOK(body.category)) throw new Error('Fecha, hora o categoría inválidas.');
      const event={id:uid(),title:text(body.title,160),date:body.date,time:body.time,category:body.category};
      this.data.events.push(event); this.log('event.create',event.id); return copy(event);
    }
    if (method === 'POST' && /^\/knowledge\/[^/]+\/approve$/.test(route)) {
      const item=this.data.knowledge.find(n=>n.id === route.split('/')[2]); if(!item) throw new Error('Nota no encontrada.');
      item.status='approved'; this.log('knowledge.approve',item.id); return copy(item);
    }
    throw new Error('Función pendiente del backend. No se ha ejecutado ninguna acción real.');
  }
}

/** Future HTTP transport. Never sends secrets in localStorage, URLs or bundles. */
export class HttpClient {
  constructor(base='/api/v1') {
    if (!base.startsWith('/') || base.startsWith('//')) throw new Error('La API debe ser del mismo origen.');
    this.base=base.replace(/\/$/,'');
  }
  async request(method,path,body) {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new Error('Ruta de API inválida.');
    const controller = new AbortController(); const timer=setTimeout(()=>controller.abort(),15000);
    try {
      const headers={Accept:'application/json'};
      if (method !== 'GET') {
        headers['Content-Type']='application/json';
        headers['Idempotency-Key']=uid();
        const csrf=globalThis.document?.querySelector('meta[name="csrf-token"]')?.content;
        if(csrf) headers['X-CSRF-Token']=csrf;
      }
      const response=await fetch(this.base+path,{method,headers,credentials:'same-origin',signal:controller.signal,...(body === undefined ? {} : {body:JSON.stringify(body)})});
      if(response.status===204) return null;
      const payload=await response.json();
      if(!response.ok) throw new Error(payload.error?.message || `Error de API (${response.status}).`);
      return payload.data;
    } catch(error) {
      if(error.name==='AbortError') throw new Error('La API no respondió a tiempo. No se ha reintentado la acción.');
      throw error;
    } finally {clearTimeout(timer);}
  }
}
