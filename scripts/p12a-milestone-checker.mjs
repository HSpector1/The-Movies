// R05 explicit warning adapter. Automatic Stop integration is INACTIVE.
import {readFile,writeFile,lstat} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
const ORDER='OPS-P12A-LIVING-HOLLYWOOD-20260910-05'
const required={
  'early-preview':['entry-bindings','calendar','authored-history','native-industry','native-campaign-naming','product-review-early'],
  'gate-a':['entry-bindings','calendar','authored-history','live-production','employment','conservation','migration','generated-contract','native-industry','native-campaign-naming','product-review-early','product-review-core','correctness-review'],
  'gate-b':['entry-bindings','calendar','authored-history','live-production','employment','conservation','migration','generated-contract','native-industry','native-campaign-naming','product-review-early','product-review-core','product-review-full','correctness-review','all-nine','endurance','named-campaigns','save-as','rng-isolation','quit-relaunch','back-restoration','large-text-final-row','ready-extensions','cumulative-regression','performance','launch-binding'],
}
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
export function evaluate(index,attestations={},event={}) {
  if(event.stop_hook_active===true || event.owner_stop===true)return {}
  if(index.order!==ORDER||index.version!==1)throw new Error('wrong evidence index order/version')
  if(['PARTIAL','BLOCKED','INTERRUPTED'].includes(index.status))return {}
  if(index.status!=='COMPLETE')throw new Error('unknown milestone claim status')
  if(!required[index.milestone])throw new Error('unknown milestone')
  const warnings=[]
  const scope=index.scope
  if(!scope||scope.rivals!==9||scope.incumbents!==4||JSON.stringify(scope.arrivals)!=='[520,988,1560,1872,2548]'||
    scope.calendar!=='1920-52-week-v1'||scope.authoredHistory!==true||scope.liveProduction!==true||scope.namedIndependentCampaigns<3||
    scope.saveAs!==true||scope.rngIsolation!==true||scope.migration!=='B')warnings.push('R05 activated scope is missing or changed')
  const candidate=index.candidate
  if(!candidate||!['ts','unity','schema','dto','executable','engine','manifest'].every(k=>typeof candidate[k]==='string'&&candidate[k].length>10))warnings.push('source/build/contract binding missing')
  const records=Array.isArray(index.evidence)?index.evidence:[]
  for(const kind of required[index.milestone]) {
    const applicable=records.some(row=>{
      const att=attestations[row.attestationId]
      if(row.kind!==kind||row.outcome!=='PASS'||!att||att.outcome!=='PASS'||att.kind!==kind||att.id!==row.attestationId)return false
      if(!['source-review','synthetic','real-native-input','ordinary-progression','independent-review','measured-build'].includes(att.provenance))return false
      const exact=JSON.stringify(att.binding)===JSON.stringify(candidate)
      const reused=att.reuse?.reviewed===true&&att.reuse?.applicable===true&&att.reuse?.reviewer&&JSON.stringify(att.reuse.targetBinding)===JSON.stringify(candidate)&&att.reuse.reason?.length>20
      if(!exact&&!reused)return false
      if(kind.startsWith('product-review')||kind==='correctness-review')return att.provenance==='independent-review'&&att.reviewer&&att.reviewer!=='lead'&&Array.isArray(att.obstacles)&&Array.isArray(att.rechecks)
      if(['native-industry','native-campaign-naming','quit-relaunch','back-restoration','large-text-final-row'].includes(kind))return att.provenance==='real-native-input'&&att.captureIds?.length>0&&att.inputWitness==='clean'
      if(kind==='live-production')return att.provenance==='ordinary-progression'&&att.actualReleasedFilms>0&&att.authoredFilmsExcluded===true
      if(kind==='endurance')return att.provenance==='ordinary-progression'&&att.allNineAtStart===true&&att.additionalAdvances>=6240
      if(kind==='named-campaigns')return att.independentStorageIds>=3&&att.inactiveBytesUnchanged===true
      if(kind==='authored-history')return att.canonicalIncumbents===4&&att.newcomersHaveNoRetrospectiveFilms===true&&att.noHistoricalRepayment===true
      return true
    })
    if(!applicable)warnings.push(`missing applicable ${kind} evidence`)
  }
  return warnings.length?{systemMessage:`R05 MILESTONE WARNING (${index.milestone}): ${warnings.slice(0,6).join('; ')}${warnings.length>6?`; plus ${warnings.length-6} gaps`:''}. No-warning output is not certification.`}:{}
}
async function boundedJson(path) {
  const stat=await lstat(path)
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>524288)throw new Error('index/attestation must be a regular file no larger than 512 KiB')
  return JSON.parse(await readFile(path,'utf8'))
}
export async function run(indexPath,event={}) {
  if(event.stop_hook_active===true||event.owner_stop===true)return {}
  const index=await boundedJson(indexPath)
  let attestations={}
  if(index.status==='COMPLETE') {
    if(typeof index.attestationsPath!=='string')throw new Error('completion requires explicit attestation path')
    const path=resolve(dirname(indexPath),index.attestationsPath)
    if(relative(dirname(indexPath),path).startsWith('..'))throw new Error('attestations must be within the index directory')
    attestations=await boundedJson(path)
  }
  const result=evaluate(index,attestations,event)
  if(!result.systemMessage)return result
  const fingerprint=digest({milestone:index.milestone,index,attestations})
  const cachePath=resolve(dirname(indexPath),'.p12a-checker-cache.json')
  let cache=null
  try{cache=await boundedJson(cachePath)}catch(error){if(error.code!=='ENOENT')throw error}
  if(cache?.fingerprint===fingerprint)return {}
  await writeFile(cachePath,JSON.stringify({fingerprint}),{mode:0o600})
  return result
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  let emitted=false
  const emit=value=>{if(!emitted){emitted=true;process.stdout.write(JSON.stringify(value)+'\n')}}
  const deadline=setTimeout(()=>{emit({systemMessage:'CHECKER_ERROR: two-second runtime bound reached'});process.exit(0)},1900)
  try{emit(await run(resolve(process.argv[2]??'evidence/p12a/EVIDENCE-INDEX.json'),process.argv[3]?JSON.parse(process.argv[3]):{}))}
  catch(error){emit({systemMessage:`CHECKER_ERROR: ${String(error.message).slice(0,300)}`})}
  finally{clearTimeout(deadline);process.exitCode=0}
}
