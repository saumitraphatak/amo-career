// node scrape.js <site> <page> <id,id,...> [js-to-run-before]
const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const [dir0,pg,ids,pre]=process.argv.slice(2); const dir=path.resolve(dir0); const CHART=path.resolve(__dirname,'../vendor/chart.umd.js');
const srv=http.createServer((q,r)=>{const p=path.join(dir,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,b)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html'});r.end(p.endsWith('.html')?b.toString().replace(/ integrity="[^"]*"/g,''):b);});});
srv.listen(0,'127.0.0.1',async()=>{const port=srv.address().port,b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});
 await ctx.route('**/*',r=>{const u=r.request().url(); if(u.startsWith('http://127.0.0.1:'+port))return r.continue(); if(/chart\.umd|chart\.js/.test(u))return r.fulfill({status:200,contentType:'text/javascript',body:fs.readFileSync(CHART)}); return r.abort();});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://127.0.0.1:${port}/pages/${pg}.html`); await p.waitForTimeout(1200);
 if(pre){await p.evaluate(pre); await p.waitForTimeout(600);}
 const r=await p.evaluate(ids=>Object.fromEntries(ids.split(',').map(i=>{const e=document.getElementById(i);return [i,e?e.textContent.trim():null];})),ids);
 console.log(JSON.stringify(r)); if(errs.length) console.error('ERR',errs.join('|')); await b.close(); srv.close();});
