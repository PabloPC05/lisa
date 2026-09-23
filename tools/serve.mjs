import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../api/v1/[...path].js';
const root=resolve(fileURLToPath(new URL('../apps/web/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json'};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/v1/')){
    res.status=code=>{res.statusCode=code;return res;};
    res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
    req.query={path:url.pathname.slice('/api/v1/'.length).split('/')};
    handler(req,res);return;
  }
  try{
    const pathname=decodeURIComponent(url.pathname);
    const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
    if(!(await stat(path)).isFile())throw new Error('Not a file');
    res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','no-store');
    res.end(await readFile(path));
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('Lisa demo: http://127.0.0.1:'+(process.env.PORT||3000)));
