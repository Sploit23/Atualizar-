const fs = require('fs');
const path = require('path');
module.exports.register = function(ctx){
  ctx.registerRoute(async (req,res,info)=>{
    const p = info.pathname.toLowerCase();
    if (!(p.startsWith('/static/') || p.startsWith('/app/'))) return false;
    const rel = p.replace(/^\//,'');
    const override = path.join(ctx.userDataPath, 'ui-overrides', rel);
    if (fs.existsSync(override)){
      try {
        const ext = path.extname(override).toLowerCase();
        const mime = {
          '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml'
        }[ext] || 'application/octet-stream';
        const buf = fs.readFileSync(override);
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma':'no-cache', 'Expires':'0' });
        res.end(buf);
        return true;
      } catch (_) { return false; }
    }
    return false;
  });
};