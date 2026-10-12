import {chromium} from '@playwright/test';
const url=process.argv[2];
if(new URL(url).hostname!=='127.0.0.1')throw new Error('Preview browser is restricted to localhost');
let browser,stopping=false;
const stop=()=>{stopping=true;void browser?.close();};
process.on('SIGTERM',stop);process.on('SIGINT',stop);
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:process.env.PREVIEW_HEADLESS==='1'});
 const closed=new Promise(resolve=>browser.once('disconnected',resolve));
 if(stopping)await browser.close();
 else{const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});page.once('close',stop);await page.goto(url);console.log('ISOLATED_BROWSER_READY '+url);}
 await closed;
}catch(error){if(!stopping)throw error;}finally{await browser?.close();}
