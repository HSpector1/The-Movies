import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFileSync} from 'node:fs';
const root=await realpath(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.PREVIEW_PORT||4197);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Use an unprivileged preview port');
const peers=new Set();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
export const server=createServer(async(req,res)=>{
  const expected=`127.0.0.1:${port}`;
  if(req.headers.host!==expected||!['GET','HEAD'].includes(req.method)){res.writeHead(403).end();return;}
  if(req.url==='/__preview_lifecycle'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});res.write(': ready\n\n');peers.add(res);req.on('close',()=>peers.delete(res));return;}
  try{const path=decodeURIComponent(new URL(req.url,`http://${expected}`).pathname);if(path.includes('\0'))throw new Error('Bad path');const file=await realpath(resolve(root,'.'+(path==='/'?'/index.html':path)));if(!file.startsWith(root+sep)||(await stat(file)).isDirectory()){res.writeHead(404).end();return;}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self'; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404).end('Preview file not found');}
});
const heartbeat=setInterval(()=>{for(const peer of peers)peer.write(': heartbeat\n\n');},5000);
let stopping=false;
function stop(){if(stopping)return;stopping=true;clearInterval(heartbeat);for(const peer of peers)peer.end();server.close();server.closeAllConnections();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
server.once('error',error=>{clearInterval(heartbeat);console.error(`Preview did not start: ${error.message}. Port ${port} may be occupied; choose PREVIEW_PORT without stopping another process.`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{const url=`http://127.0.0.1:${port}/`;console.log(`READY ${url} · Control-C stops this server.`);if(process.env.PREVIEW_READY_FILE)writeFileSync(process.env.PREVIEW_READY_FILE,JSON.stringify({pid:process.pid,url}),{flag:'wx'});});
