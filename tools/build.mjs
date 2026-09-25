import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { openapi } from '../contracts/openapi.mjs';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
let html=await read('apps/web/index.html');
for(const name of ['styles.css','sky.css']) {
  const css=await read(`apps/web/${name}`);
  html=html.replace(`<link rel="stylesheet" href="./${name}">`,`<style>${css}</style>`);
}
// Explicit concatenator for these dependency-free modules. Sky initializes before app.
const modules=['domain.mjs','client.mjs','sky.mjs','app.mjs'];
const source=[];
for(const name of modules){
  const code=await read(`apps/web/${name}`);
  const imports=[...code.matchAll(/^import .* from '([^']+)';$/gm)].map(m=>m[1]);
  if(imports.some(i=>!modules.some(n=>'./'+n===i))) throw new Error(`Unexpected import in ${name}`);
  source.push(`// MODULE: ${name}\n`+code.replace(/^import .* from '[^']+';\n/gm,'').replace(/^export /gm,''));
}
const script=source.join('\n\n').replace(/<\/script/gi,'<\\/script');
html=html.replace('<script type="module" src="./sky.mjs"></script>','').replace('<script type="module" src="./app.mjs"></script>',`<script type="module">${script}</script>`);
if (/<(?:script|link)[^>]+(?:src|href)="\.\//.test(html)) throw new Error('Unbundled local asset');
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/index.html',root),html);
await writeFile(new URL('dist/openapi.json',root),JSON.stringify(openapi,null,2)+'\n');
const hash=createHash('sha256').update(script).digest('base64');
await writeFile(new URL('dist/build-info.json',root),JSON.stringify({version:'0.6.0-finance',scriptSha256:hash,mode:'demo',home:'sky-local-clock',finance:'manual-portfolio'},null,2));
console.log(`Built dist/index.html (${Buffer.byteLength(html)} bytes), openapi.json, build-info.json`);
