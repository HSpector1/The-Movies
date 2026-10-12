import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const output=new URL('../evidence/inspection-r1/',import.meta.url);mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['scripts/server.mjs'],{cwd:root,env:{...process.env,PREVIEW_OPEN:'0'},stdio:['ignore','pipe','pipe']});
let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server readiness timeout')),10000);server.stdout.on('data',chunk=>{if(String(chunk).includes('READY')){clearTimeout(timer);resolve();}});server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited ${code}`));});server.stderr.on('data',c=>process.stderr.write(c));});
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 await page.goto('http://127.0.0.1:4197/');await page.waitForFunction(()=>window.preview?.snapshot().ready||window.preview?.snapshot().disposed,{},{timeout:20000});
 console.log(await page.locator('#status').textContent());console.log(await page.locator('#error').textContent());
 await page.evaluate(()=>window.preview.freeze());
 await page.screenshot({path:fileURLToPath(new URL('overview.png',output)),fullPage:true});
 await page.evaluate(()=>window.preview.view('crew'));await page.screenshot({path:fileURLToPath(new URL('crew.png',output)),fullPage:true});
 const result={browser:browser.version(),errors,snapshot:await page.evaluate(()=>window.preview.snapshot()),rig:await page.evaluate(()=>window.preview.rig())};
 writeFileSync(new URL('result.json',output),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 if(!result.snapshot.ready||errors.length)process.exitCode=1;
}finally{if(browser)await browser.close();if(server.exitCode===null){server.kill('SIGTERM');await once(server,'exit');}}
