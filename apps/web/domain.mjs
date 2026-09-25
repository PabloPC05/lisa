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

export const FINANCE_TYPES = ['Fondo','ETF','Acción','Renta fija','Efectivo','Cripto','Otro'];
function financeFinite(value,label,{positive=false,nonNegative=false}={}) {
  const n=Number(value);
  if(!Number.isFinite(n) || (positive && n<=0) || (nonNegative && n<0)) throw new Error(`${label} inválido.`);
  return n;
}
export function normalizeFinancePosition(input,id=uid()) {
  const type=String(input?.type||'Otro');
  if(!FINANCE_TYPES.includes(type)) throw new Error('Tipo de activo desconocido.');
  const currency=String(input?.currency||'EUR').trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(currency)) throw new Error('Divisa inválida.');
  return {
    id,
    name:text(input?.name,120),
    symbol:String(input?.symbol||'').trim().toUpperCase().slice(0,24),
    type,
    account:String(input?.account||'Manual').trim().slice(0,80)||'Manual',
    quantity:financeFinite(input?.quantity,'Cantidad',{positive:true}),
    avgPrice:financeFinite(input?.avgPrice,'Precio medio',{nonNegative:true}),
    currentPrice:financeFinite(input?.currentPrice,'Precio actual',{nonNegative:true}),
    currency,
    fxToEur:currency==='EUR'?1:financeFinite(input?.fxToEur,'Cambio a EUR',{positive:true}),
    updatedAt:new Date().toISOString()
  };
}
export function financePositionMetrics(position) {
  const fx=Number(position.fxToEur||1);
  const invested=Number(position.quantity)*Number(position.avgPrice)*fx;
  const value=Number(position.quantity)*Number(position.currentPrice)*fx;
  const gain=value-invested;
  return {invested,value,gain,gainPct:invested?gain/invested*100:0};
}
export function financeTotals(positions=[]) {
  return positions.reduce((total,position)=>{
    const metrics=financePositionMetrics(position);
    total.invested+=metrics.invested; total.value+=metrics.value; total.gain+=metrics.gain;
    return total;
  },{invested:0,value:0,gain:0,gainPct:0});
}
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
    knowledge: [
      {id:'demo-note-1', title:'Cómo se organiza este espacio', category:'general', format:'markdown', revision:3, updatedAt:'2026-09-23T18:20:00Z', source:'Guía de demostración', status:'approved', content:`# Cómo se organiza este espacio

Lisa separa **documentos**, **conversaciones** y **conocimiento** para que guardar algo no cambie sus permisos ni su significado.

## Principios

- Una conversación guardada sigue siendo historial.
- El conocimiento aprobado vive en Markdown.
- Un proyecto organiza; no concede permisos.
- Las fuentes se conservan para poder revisar y revocar.

> Guardar una conversación no la convierte automáticamente en memoria.

## Flujo de memoria

| Paso | Estado |
| --- | --- |
| Conversación | Historial |
| Propuesta | Pendiente de revisión |
| Aprobación | Memoria activa |
| Edición | Nueva revisión |

## Checklist

- [x] Mantener Markdown portable
- [x] Conservar la fuente
- [ ] Conectar persistencia PostgreSQL
- [ ] Añadir backlinks reales
`},
      {id:'demo-note-2', title:'Diseño de proyectos', category:'personal', format:'markdown', revision:2, updatedAt:'2026-09-23T19:10:00Z', source:'Decisiones de producto', status:'approved', content:`# Diseño de proyectos

Un **proyecto** agrupa trabajo relacionado sin cargar todas sus conversaciones en cada prompt.

## Qué contiene

1. Historial de conversaciones.
2. Conversaciones fijadas.
3. Archivos y notas relacionados.
4. Agente por defecto.
5. Contexto autorizado.

### Regla importante

**Project != Agent != Category != Memory**

Los permisos se evalúan en cada recuperación de contexto.
`},
      {id:'demo-note-3', title:'Nota pendiente de revisión', category:'universidad', format:'markdown', revision:1, updatedAt:'2026-09-23T20:05:00Z', source:'Conversación de ejemplo', status:'proposed', content:`# Nota pendiente

Esta nota representa una propuesta todavía **no aprobada**.

- Revisar exactitud.
- Confirmar fuentes.
- Aprobar solo si merece formar parte de la memoria.
`}
    ],
    finance: {
      positions: [
        {id:'demo-position-1',name:'Fondo global de ejemplo',symbol:'GLOBAL-A',type:'Fondo',account:'Cuenta de ejemplo',quantity:72.5,avgPrice:101.40,currentPrice:107.20,currency:'EUR',fxToEur:1,updatedAt:'2026-09-25T10:00:00Z'},
        {id:'demo-position-2',name:'ETF dividendos de ejemplo',symbol:'DIV-100',type:'ETF',account:'Cuenta de ejemplo',quantity:31,avgPrice:43.80,currentPrice:45.10,currency:'EUR',fxToEur:1,updatedAt:'2026-09-25T10:00:00Z'},
        {id:'demo-position-3',name:'Monetario de ejemplo',symbol:'CASH-LIKE',type:'Renta fija',account:'Cuenta de ejemplo',quantity:58.2,avgPrice:100,currentPrice:101.05,currency:'EUR',fxToEur:1,updatedAt:'2026-09-25T10:00:00Z'}
      ],
      snapshots: [
        {id:'demo-snapshot-1',date:'2026-04-01',value:14220,invested:14000},
        {id:'demo-snapshot-2',date:'2026-05-01',value:14380,invested:14000},
        {id:'demo-snapshot-3',date:'2026-06-01',value:14610,invested:14250},
        {id:'demo-snapshot-4',date:'2026-07-01',value:14540,invested:14250},
        {id:'demo-snapshot-5',date:'2026-08-01',value:14960,invested:14500},
        {id:'demo-snapshot-6',date:'2026-09-01',value:15240,invested:14500}
      ]
    },
    audit: []
  };
}
