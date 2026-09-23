/** Lisa v0.3. Pure demo domain. These checks are NOT a server security boundary. */
export const AREAS = [
  { id: 'vivienda', name: 'Vivienda', icon: 'home', color: 'amber', description: 'Documentos, recibos y gestiones del hogar.' },
  { id: 'universidad', name: 'Universidad', icon: 'book', color: 'blue', description: 'Apuntes, asignaturas y organización académica.' },
  { id: 'finanzas', name: 'Finanzas', icon: 'chart', color: 'green', description: 'Facturas, presupuestos y documentación financiera.' },
  { id: 'personal', name: 'Personal', icon: 'user', color: 'purple', description: 'Planes, ideas y las cosas del día a día.' },
  { id: 'familia', name: 'Familia', icon: 'heart', color: 'rose', description: 'Información y gestiones familiares, en su lugar.' }
];
export const PROJECTS = [
  {id:'demo-project-vivienda',name:'Vivienda · Proyecto',category:'vivienda',agentId:'vivienda'},
  {id:'demo-project-universidad',name:'Universidad · Proyecto',category:'universidad',agentId:'universidad'},
  {id:'demo-project-finanzas',name:'Finanzas · Proyecto',category:'finanzas',agentId:'finanzas'},
  {id:'demo-project-personal',name:'Personal · Proyecto',category:'personal',agentId:'personal'},
  {id:'demo-project-familia',name:'Familia · Proyecto',category:'familia',agentId:'familia'}
];
export const uid = () => {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
};
export const copy = value => structuredClone(value);
export function categoryOK(value) { return value === 'general' || AREAS.some(a => a.id === value); }
export function text(value, max = 8000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Introduce entre 1 y ${max} caracteres.`);
  return value.trim();
}
export function createConversation(mode, agentId = null, projectId = null) {
  if (!['general', 'sandbox', 'agent'].includes(mode)) throw new Error('Modo desconocido.');
  if (mode === 'agent' && !AREAS.some(a => a.id === agentId)) throw new Error('Agente desconocido.');
  if (projectId && !PROJECTS.some(p => p.id === projectId)) throw new Error('Proyecto desconocido.');
  const now = new Date().toISOString();
  return { id: uid(), mode, agentId: mode === 'agent' ? agentId : null, category: mode === 'agent' ? agentId : 'general', projectId, pinned:false, archived:false, title: 'Nueva conversación', saved: Boolean(projectId), revision: 1, messages: [], createdAt: now, updatedAt: now, sourceId: null };
}
export function saveConversation(chat, category = chat.category) {
  if (!categoryOK(category)) throw new Error('Categoría desconocida.');
  return { ...copy(chat), saved: true, category, revision: chat.revision + 1 };
}
export function promoteConversation(chat, target) {
  if (!categoryOK(target)) throw new Error('Destino desconocido.');
  const result = createConversation(target === 'general' ? 'general' : 'agent', target);
  result.title = chat.title;
  result.sourceId = chat.id;
  result.projectId = null;
  result.saved = false;
  // Imports remain untrusted text, never executable tool calls or system instructions.
  result.messages = chat.messages.map(m => ({ id: uid(), role: 'imported', content: m.content, sourceRole: m.role, trust: 'untrusted' }));
  return result;
}
export function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
export function makeFixtures() {
  return {
    projects: copy(PROJECTS),
    files: [
      {id:'demo-file-1', name:'Contrato de ejemplo.pdf', category:'vivienda', type:'PDF', size:'240 KB', version:1, content:'Documento ficticio para revisar la vista de archivos. No contiene contratos ni datos reales.'},
      {id:'demo-file-2', name:'Ideas para el próximo curso.md', category:'universidad', type:'MD', size:'3 KB', version:2, content:'Nota de demostración. Objetivo: reunir apuntes, lecturas y preguntas en un mismo espacio.'},
      {id:'demo-file-3', name:'Presupuesto de ejemplo.csv', category:'finanzas', type:'CSV', size:'8 KB', version:1, content:'categoría,importe\nEjemplo A,100\nEjemplo B,200\n\nCifras totalmente ficticias.'},
      {id:'demo-file-4', name:'Lista de ideas.md', category:'personal', type:'MD', size:'2 KB', version:1, content:'Ideas de muestra: aprender algo nuevo, organizar documentos y planear una escapada.'},
      {id:'demo-file-5', name:'Organización familiar.md', category:'familia', type:'MD', size:'4 KB', version:1, content:'Espacio de prueba para notas y gestiones familiares. Sin información personal.'}
    ],
    tasks: [
      {id:'demo-task-1', title:'Revisar el diseño de Lisa', category:'personal', done:false},
      {id:'demo-task-2', title:'Probar un chat sin conocimiento personal', category:'personal', done:false},
      {id:'demo-task-3', title:'Organizar una carpeta de ejemplo', category:'vivienda', done:false},
      {id:'demo-task-4', title:'Explorar las vistas del calendario', category:'universidad', done:true}
    ],
    events: [
      {id:'demo-event-1', title:'Revisión del prototipo', date:'2026-09-23', time:'17:00', category:'personal'},
      {id:'demo-event-2', title:'Bloque de estudio · ejemplo', date:'2026-09-24', time:'10:00', category:'universidad'},
      {id:'demo-event-3', title:'Organizar documentos · ejemplo', date:'2026-09-25', time:'18:00', category:'vivienda'}
    ],
    knowledge: [{id:'demo-note-1', title:'Cómo se organiza este espacio', category:'general', content:'Los documentos, las conversaciones y el conocimiento son cosas distintas. Guardar un chat no lo convierte automáticamente en memoria.', source:'Guía de demostración', status:'approved'}],
    audit: []
  };
}
