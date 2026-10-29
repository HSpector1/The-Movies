// Decision 3b detail: which save roots grow between the operated week 1872 world and 128 idle weeks later.
import {readFileSync} from 'node:fs'
import {importSave,migrateToLive,makeSave} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/index.js'
import {tick} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/tick.ts'
const R='/Users/zacheryspector/The-Movies-headless-program/docs/engineering/audits/2026-10-22-codebase-review/sprint16-playtest/owner-saves'
let state:any=migrateToLive(importSave(readFileSync(R+'/p17-cameo-world.json','utf8'))).state
const sizes=(s:any)=>Object.fromEntries(Object.entries(makeSave(s) as any).map(([k,v])=>[k,JSON.stringify(v).length]))
const a=sizes(state); for(let i=0;i<128;i++) state=tick(state); const b=sizes(state)
const rows=Object.keys({...a,...b}).map(k=>({root:k,at1872:a[k]??0,at2000:b[k]??0,delta:(b[k]??0)-(a[k]??0)})).sort((x,y)=>y.delta-x.delta)
console.log(JSON.stringify({top:rows.slice(0,12),total:{at1872:Object.values(a).reduce((p,c)=>p+c,0),at2000:Object.values(b).reduce((p,c)=>p+c,0)}},null,1))
// second level of the largest grower
const top=rows[0]!.root; const sub=(s:any)=>{const v=(makeSave(s) as any)[top]; return typeof v==='object'&&v!==null?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,JSON.stringify(x).length])):{}}
const sa=sub(migrateToLive(importSave(readFileSync(R+'/p17-cameo-world.json','utf8'))).state), sb=sub(state)
console.log(JSON.stringify({root:top,children:Object.keys({...sa,...sb}).map(k=>({key:k,at1872:sa[k]??0,at2000:sb[k]??0,delta:(sb[k]??0)-(sa[k]??0)})).sort((x,y)=>y.delta-x.delta).slice(0,10)},null,1))
