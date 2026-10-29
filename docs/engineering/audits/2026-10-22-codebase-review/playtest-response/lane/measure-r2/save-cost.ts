// Decision 3b: save cost on operated route worlds (the two Owner route saves), then idle natural ticks on from each
// world's week with the save probe at 1000, 1500 and 2000 or at the player's closure. Read-only on the tree; no RNG seed.
import {performance} from 'node:perf_hooks'
import {readFileSync} from 'node:fs'
import {importSave,migrateToLive,makeSave,exportSave,validateSaveV51} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/index.js'
import {tick} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/tick.ts'
const R='/Users/zacheryspector/The-Movies-headless-program/docs/engineering/audits/2026-10-22-codebase-review/sprint16-playtest/owner-saves'
const ms=(f:()=>unknown)=>{const s=performance.now();const v=f();return {ms:Math.round((performance.now()-s)*10)/10,v}}
function probe(state:any,label:string){
  const m=ms(()=>makeSave(state)); const save:any=m.v
  const v=ms(()=>validateSaveV51(save))
  const e=ms(()=>exportSave(save)); const bytes=(e.v as string).length
  const closed=state.studioClosure?.closedWeek ?? state.studioClosure?.closed ?? null
  return {label,week:state.market.tick,cash:state.studio.cash,makeSaveMs:m.ms,validateMs:v.ms,exportMs:e.ms,bytes,rivalsAlive:(state.hollywood?.businesses??[]).filter((b:any)=>b.closedWeek==null).length,closure:closed}
}
const rows:any[]=[]
for (const [file,targets] of [['p17-cameo-world.json',[2000,2500]],['p18-season-world.json',[1000,1500,2000]]] as const) {
  let state:any
  try { state=migrateToLive(importSave(readFileSync(R+'/'+file,'utf8'))).state }
  catch (e) { rows.push({label:file+' REFUSED by Node import (decision 5: the p18 file was written by Chrome)',error:String((e as Error).message).slice(0,200)}); continue }
  rows.push(probe(state,file+' as exported'))
  let tickMs=0, ticks=0
  for (const target of targets) {
    while (state.market.tick<target) {
      const s=performance.now(); state=tick(state); tickMs+=performance.now()-s; ticks++
      if (state.studioClosure && state.studioClosure.closedWeek!=null) break
    }
    rows.push({...probe(state,file+' idle to '+target),ticks,tickMsTotal:Math.round(tickMs),msPerTick:Math.round(tickMs/Math.max(1,ticks)*100)/100})
    if (state.studioClosure && state.studioClosure.closedWeek!=null) break
  }
}
console.log(JSON.stringify(rows,null,1))
