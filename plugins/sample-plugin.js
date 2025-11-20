module.exports.register = function(ctx){
  ctx.registerRoute(async (req,res,info)=>{
    const p = info.pathname;
    const m = info.method;
    if (p === '/api/hello' && m === 'GET'){
      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok: true, msg: 'plugin ativo' }));
      return true;
    }
    return false;
  });
};