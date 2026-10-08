import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const old=root+'/1370-c0-m0-feasibility-hook-overlay-r7-partial'
const neo=root+'/1370-c0-m0-feasibility-hook-overlay-r8-partial'
const read=(dir,name)=>fs.readFileSync(dir+'/'+name,'utf8')
const parse=(name,s)=>{const a=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true);assert.equal(a.parseDiagnostics.length,0);return a}
const fn=(a,name)=>{const n=a.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(n,name);return n.getText(a).replace(/^export\s+/,'')}
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
function counts(s){const out={};function walk(n){if(ts.isCallExpression(n)){const e=n.expression,k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null;if(k)out[k]=(out[k]??0)+1}ts.forEachChild(n,walk)}walk(parse('functions.ts',s));return out}
const guarded=['dominates','pairwiseWins','priorityOrder','bandsFor','canAfford','rivalOperatingReserve','affordabilityRefusal','stream','promiseFeasibility','attachedFeasibility','chooseProposal']
for(const era of ['historical','modern']){
 const name=era+'-talentMarket.ts',a=parse(name,read(old,name)),b=parse(name,read(neo,name))
 for(const part of ['chooseProposal','affordabilityRefusal','survivesFreeze']){
  const ac=counts(fn(a,part)),bc=counts(fn(b,part))
  for(const key of guarded)assert.equal(bc[key]??0,ac[key]??0,era+' '+part+' changed production call '+key)
 }
 let latestRows=[]
 function make(ast){let reserveCalls=0,priorityCalls=0
  const funcs=transpile(['chooseProposal','affordabilityRefusal'].map(k=>fn(ast,k)).join('\n'))
  const factory=new Function('M0_SUBJECT','m0Record','m0ChooserRef','m0ChooserRefs','bandsFor','dominates','pairwiseWins','priorityOrder','DESCRIPTOR_ORDER','DESCRIPTOR_REASON','relationshipsReasonSentence','canAfford','rivalOperatingReserve',funcs+';return {chooseProposal,affordabilityRefusal}')
  const desc=era==='historical'?['compensation','term','opportunity','trust','standing','incumbency']:['compensation','term','opportunity','trust','relationships','standing','incumbency']
  const refs=(state,ps)=>ps.map(p=>({digest:p.digest,proposalSourceIndex:p.index,proposalOccurrence:p.occurrence}))
  const refsOne=(_state,p)=>({digest:p.digest,proposalSourceIndex:p.index,proposalOccurrence:p.occurrence})
  const obj=factory('target',(_s,phase,_issuer,detail)=>latestRows.push({phase,detail}),refsOne,refs,
   (_s,ps)=>new Map(ps.map(p=>[p,p.bands])),(x,y)=>desc.every(k=>x[k]>=y[k])&&desc.some(k=>x[k]>y[k]),
   (x,y)=>desc.filter(k=>x[k]>y[k]).length,()=>{priorityCalls++;return desc},desc,Object.fromEntries(desc.map(k=>[k,k])),()=> 'relationship reason',
   ()=>({ok:true}),()=>{reserveCalls++;return 200})
  return {...obj,getCounts:()=>({reserveCalls,priorityCalls})}
 }
 const before=make(a),after=make(b)
 const makeP=(digest,index,band,submittedWeek=196,issuerStudioId='studio-r02')=>({digest,index,occurrence:index,bands:Object.fromEntries((era==='historical'?['compensation','term','opportunity','trust','standing','incumbency']:['compensation','term','opportunity','trust','relationships','standing','incumbency']).map(k=>[k,band])),submittedWeek,issuerStudioId})
 const state={hollywood:{playerStudioId:'player',businesses:[{studioId:'studio-r02',account:{cash:1000},policy:{reserveWeeks:8}}]}}
 const kase={talentId:'target',subjectStudioId:'studio-r01'}
 const cases=[
  [makeP('one',0,2)],
  [makeP('high',0,2),makeP('low',1,0)],
  [makeP('early',0,1,195),makeP('late',1,1,196)],
  [makeP('incumbent',0,1,196,'studio-r01'),makeP('rival',1,1,196)],
  [makeP('tieA',0,1),makeP('tieB',1,1)]
 ]
 for(const ps of cases){
  latestRows=[];const x=before.chooseProposal(state,kase,ps,208);latestRows=[];const y=after.chooseProposal(state,kase,ps,208)
  assert.equal(y.winner?.digest??null,x.winner?.digest??null,era+' winner parity')
  assert.deepEqual(y.reasons??null,x.reasons??null,era+' reasons parity')
  assert.equal(y.tiedCount??null,x.tiedCount??null,era+' tie parity')
  const stages=latestRows.filter(r=>r.phase==='chooserStages')
  assert.equal(stages.length,1,era+' one chooser-stage row')
  assert.ok(stages[0].detail.finalTie.every(ref=>Number.isSafeInteger(ref.proposalSourceIndex)))
  assert.ok(['REACHED','NOT_REACHED'].includes(stages[0].detail.priority))
  if(ps.length===1)assert.deepEqual([stages[0].detail.priority,stages[0].detail.submission,stages[0].detail.incumbent],['NOT_REACHED','NOT_REACHED','NOT_REACHED'])
 }
 const noCapture=before.affordabilityRefusal(state,'studio-r02',100,208)
 latestRows=[];let captured=null
 const withCapture=after.affordabilityRefusal(state,'studio-r02',100,208,d=>{captured=d})
 assert.equal(withCapture,noCapture)
 assert.deepEqual([captured.path,captured.cash,captured.bonus,captured.netCash,captured.reserve,captured.refusal],['rival',1000,100,900,200,null])
}
console.log('R8_CHOOSER_STATIC_SYNTHETIC_PASS: H/M0 guarded calls, five winner/reason/tie scenarios, nonreached stages, actual affordability reserve capture')
