/** Canonical design contract. npm run build emits dist/openapi.json. */
const str=(maxLength=8000)=>({type:'string',minLength:1,maxLength});
const ref=name=>({$ref:`#/components/schemas/${name}`});
const obj=(properties,required=Object.keys(properties))=>({type:'object',additionalProperties:false,required,properties});
const schemas={
 Category:{type:'string',enum:['general','vivienda','universidad','finanzas','personal','familia']},
 Attachment:obj({id:str(100),name:str(180),size:{type:'integer',minimum:0,maximum:26214400},type:str(120),status:{enum:['attached','uploading','ready','failed']}},['id','name','size','type']),
 Project:obj({id:str(100),name:str(160),category:ref('Category'),agentId:{type:['string','null']}},['id','name','category']),
 CreateChat:obj({mode:{enum:['general','sandbox','agent']},agentId:{type:['string','null']},projectId:{type:['string','null']}},['mode']),
 ChatPatch:obj({pinned:{type:'boolean'},archived:{type:'boolean'},title:str(200),projectId:{type:['string','null']}},[]),
 MessageInput:{type:'object',additionalProperties:false,properties:{content:{type:'string',maxLength:8000,default:''},attachments:{type:'array',items:ref('Attachment'),maxItems:8,default:[]}},anyOf:[{required:['content'],properties:{content:{type:'string',minLength:1,maxLength:8000}}},{required:['attachments'],properties:{attachments:{type:'array',minItems:1,maxItems:8}}}]},
 SaveChat:obj({category:ref('Category'),expectedRevision:{type:'integer',minimum:1}}),
 PromoteChat:obj({target:ref('Category'),selectedAttachmentIds:{type:'array',items:str(100),maxItems:20}}),
 KnowledgeInput:obj({title:str(120),content:str()}),
 TaskInput:obj({title:str(200),category:ref('Category')}),
 TaskPatch:obj({done:{type:'boolean'}}),
 EventInput:obj({title:str(160),date:{type:'string',format:'date'},time:{type:'string',pattern:'^([01][0-9]|2[0-3]):[0-5][0-9]$'},timezone:{type:'string',default:'Europe/Madrid'},category:ref('Category')},['title','date','time','category']),
 ActionInput:obj({capability:str(100),resourceId:str(100),parameters:{type:'object'},expectedRevision:{type:'integer'}},['capability','resourceId','parameters']),
 ApprovalInput:obj({decision:{enum:['approve','deny']},proposalHash:str(128)}),
 ControlInput:obj({operation:{enum:['request','release','stop']},expectedRevision:{type:'integer',minimum:1},leaseId:str(100)},['operation','expectedRevision']),
 ChangeInput:obj({description:str(4000)}),
 Error:obj({error:obj({code:str(100),message:str(),retryable:{type:'boolean'},requestId:str(100)},['code','message'])}),
 Envelope:obj({data:{},meta:{type:'object',properties:{cursor:{type:['string','null']},requestId:{type:'string'}}}},['data']),
 Chat:obj({id:str(100),mode:{enum:['general','sandbox','agent']},agentId:{type:['string','null']},category:ref('Category'),projectId:{type:['string','null']},pinned:{type:'boolean'},archived:{type:'boolean'},saved:{type:'boolean'},title:str(200),revision:{type:'integer'},sourceId:{type:['string','null']},createdAt:{type:'string',format:'date-time'},updatedAt:{type:'string',format:'date-time'},messages:{type:'array',items:obj({id:str(100),role:{enum:['user','assistant','imported']},content:{type:'string',maxLength:8000},attachments:{type:'array',items:ref('Attachment')},createdAt:{type:'string',format:'date-time'},status:{enum:['sending','delivered','complete','failed']},trust:{enum:['untrusted']},sourceRole:{type:'string'}},['id','role','content'])}},['id','mode','category','saved','revision','messages'])
};
// path, method, operationId, description, input schema, authentication required
export const routes=[
 ['/health','get','health','Public liveness. Reports backendConnected=false.',null,false],
 ['/bootstrap','get','bootstrap','Authenticated session, effective capabilities, agents, projects and integration state.',null,true],
 ['/projects','get','listProjects','Projects visible to the authenticated principal.',null,true],
 ['/chats','get','listChats','Visible conversations; filter by project, pinned, archived or explicit saved history.',null,true],
 ['/chats','post','createChat','Create unsaved chat. Agent mode requires a registered agentId.','CreateChat',true],
 ['/chats/{id}','get','getChat','Read authorized conversation.',null,true],
 ['/chats/{id}','patch','patchChat','Pin, archive, rename or move a conversation without changing agent permissions.','ChatPatch',true],
 ['/chats/{id}','delete','deleteChat','Discard and initiate transcript retention purge.',null,true],
 ['/chats/{id}/messages','post','sendMessage','Send message. Runtime integration must version the asynchronous run response.','MessageInput',true],
 ['/chats/{id}/save','post','saveChat','Archive explicitly; never change execution mode or add memory.','SaveChat',true],
 ['/chats/{id}/promotions','post','promoteChat','Create NEW session; original unchanged; imported text remains untrusted.','PromoteChat',true],
 ['/chats/{id}/knowledge-proposals','post','proposeKnowledge','Propose unapproved knowledge from a saved chat.','KnowledgeInput',true],
 ['/knowledge','get','listKnowledge','Only authorized knowledge and proposals.',null,true],
 ['/knowledge/{id}/approve','post','approveKnowledge','Authenticated human approval, not model approval.',null,true],
 ['/files','get','listFiles','Authorized metadata; no local paths, secrets or unfiltered counts.',null,true],
 ['/files/{id}','get','getFile','Resolve stable Lisa ID after current ACL check.',null,true],
 ['/tasks','get','listTasks','List authorized tasks.',null,true],
 ['/tasks','post','createTask','Create task in an authorized scope.','TaskInput',true],
 ['/tasks/{id}','patch','patchTask','Update task status.','TaskPatch',true],
 ['/events','get','listEvents','List events within authorized calendars and date range.',null,true],
 ['/events','post','createEvent','Create event; preserve local time and IANA timezone.','EventInput',true],
 ['/audit','get','listAudit','Human-visible redacted action metadata.',null,true],
 ['/actions','post','proposeAction','Capability request; broker denies, awaits approval or enqueues.','ActionInput',true],
 ['/actions/{id}','get','getAction','Job status without credential material.',null,true],
 ['/actions/{id}/approval','post','decideAction','One-time human approval bound to the exact proposal hash.','ApprovalInput',true],
 ['/computers','get','listComputers','Authorized session metadata; not public VNC.',null,true],
 ['/computers/{id}/control','post','controlComputer','Exclusive control lease; cancel and pause agent input before handoff.','ControlInput',true],
 ['/developer/changes','post','proposeCodeChange','Code-only proposal; not an arbitrary shell execution endpoint.','ChangeInput',true],
 ['/developer/changes/{id}','get','getCodeChange','Diff, test state, preview and approval status.',null,true],
 ['/runs/{id}/events','get','streamRun','SSE with authorized reconnection and monotonic cursor.',null,true]
];
const paths={};
for(const [path,method,operationId,summary,input,auth] of routes){
 const op={operationId,summary,security:auth?[{sessionCookie:[]}]:[],responses:{
  200:{description:'Future implementation. Local DemoClient returns fixtures; server seam returns 501 except health.',content:{'application/json':{schema:ref('Envelope')}}},
  401:{description:'Unauthenticated'},403:{description:'Denied'},404:{description:'Absent or inaccessible'},409:{description:'Revision or idempotency conflict'},422:{description:'Invalid request'},429:{description:'Rate limited'},
  501:{description:'Backend not configured',content:{'application/json':{schema:ref('Error')}}}
 }};
 const parameters=[];
 if(path.includes('{id}'))parameters.push({name:'id',in:'path',required:true,schema:str(100)});
 if(method!=='get')parameters.push({name:'Idempotency-Key',in:'header',required:true,schema:{type:'string',format:'uuid'}},{name:'X-CSRF-Token',in:'header',required:true,schema:str(200)});
 if(method==='get'&&!path.includes('{id}')&&path!=='/health')parameters.push({name:'cursor',in:'query',schema:str(200)},{name:'limit',in:'query',schema:{type:'integer',minimum:1,maximum:100,default:50}});
 if(path==='/chats'&&method==='get')parameters.push({name:'saved',in:'query',schema:{type:'boolean'}},{name:'projectId',in:'query',schema:str(100)},{name:'pinned',in:'query',schema:{type:'boolean'}},{name:'archived',in:'query',schema:{type:'boolean'}});
 if(path==='/files')parameters.push({name:'category',in:'query',schema:ref('Category')});
 if(path==='/events'&&method==='get')parameters.push({name:'from',in:'query',schema:{type:'string',format:'date'}},{name:'to',in:'query',schema:{type:'string',format:'date'}});
 if(parameters.length)op.parameters=parameters;
 if(input)op.requestBody={required:true,content:{'application/json':{schema:ref(input)}}};
 if(path==='/runs/{id}/events')op.responses[200]={description:'Events: message.delta, run.status, action.approval_required, computer.handoff_required, run.completed, run.failed. Never include secrets.',content:{'text/event-stream':{schema:{type:'string'}}}};
 (paths[path]??={})[method]=op;
}
export const openapi={openapi:'3.1.0',info:{title:'Lisa Personal API',version:'0.4.0',description:'DESIGN contract; NOT a working backend. Every private server route currently returns 501. DemoClient is local memory only. Server authentication and authorization are prerequisites for real data.'},servers:[{url:'/api/v1'}],paths,components:{securitySchemes:{sessionCookie:{type:'apiKey',in:'cookie',name:'lisa_session',description:'HttpOnly, Secure, SameSite. Backend derives identity from authenticated session or scoped service credential, never X-Agent-ID.'}},schemas}};
