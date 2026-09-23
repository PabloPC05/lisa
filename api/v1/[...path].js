/** Deliberately inert backend seam. No credentials, storage or upstream calls. */
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  const path=Array.isArray(req.query?.path)?req.query.path.join('/'):String(req.query?.path||'');
  if(req.method==='GET'&&path==='health')return res.status(200).json({data:{status:'ok',mode:'demo',backendConnected:false,version:'0.3.0'}});
  if(!['GET','POST','PATCH','DELETE'].includes(req.method))return res.status(405).json({error:{code:'METHOD_NOT_ALLOWED',message:'Método no admitido.'}});
  return res.status(501).json({error:{code:'BACKEND_NOT_CONFIGURED',message:'Backend de Lisa pendiente. No se ha leído, guardado ni ejecutado nada.',retryable:false}});
}
