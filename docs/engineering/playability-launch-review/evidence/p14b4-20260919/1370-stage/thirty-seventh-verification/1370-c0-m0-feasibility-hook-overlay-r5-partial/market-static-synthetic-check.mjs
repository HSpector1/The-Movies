import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const old=root+'/1370-c0-m0-market-decision-source-overlay-r4-step12-draft'
const neo=root+'/1370-c0-m0-feasibility-hook-overlay-r5-partial'
const parse=(name,s)=>{const ast=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true)
 assert.equal(ast.parseDiagnostics.length,0,name+' parse');return ast}
const source=(dir,name)=>fs.readFileSync(dir+'/'+name,'utf8')
const functionText=(ast,name)=>{const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name)
 assert.ok(node,name+' missing');return node.getText(ast).replace(/^export\s+/,'')}
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
const count=s=>{const out={};const walk=n=>{if(ts.isCallExpression(n)){
 const e=n.expression,k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null
 if(k)out[k]=(out[k]??0)+1}ts.forEachChild(n,walk)}
 walk(parse('count.ts',s));return out}
const guarded=['rivalProposalTrigger','submitProposal','promiseFeasibility','attachedFeasibility','bandsFor','chooseProposal','stream']
for(const era of ['historical','modern']){
 const name=era+'-talentMarket.ts',a=source(old,name),b=source(neo,name)
 const ac=count(a),bc=count(b)
 for(const key of guarded)assert.equal(bc[key]??0,ac[key]??0,era+' changed '+key+' callsite count')
 assert.equal(bc.isProven,ac.isProven-1,era+' observer-only isProven not removed exactly once')
 const ast=parse(name,b)
 const chooser=functionText(ast,'bandsFor')
 assert.match(chooser,/m0Capture\(state, m0Case, p, 'chooserBand', index\)/)
 assert.match(chooser,/attachedFeasibility\(state, p, week, capture\)/)
 const attached=functionText(ast,'attachedFeasibility')
 assert.match(attached,/NO_ATTACHED_PROMISE/)
 assert.match(attached,/\}, week, capture\)/)
 assert.match(functionText(ast,'settleCase'),/m0Capture\(state, m0Case, proposal, 'freezeProposal', submittedOrdinal\)/)
 assert.match(functionText(ast,'authorRivalPromise'),/m0Capture\(state, m0Case!, proposal, 'authorCandidate', candidateOrdinal\)/)
 assert.equal(b.includes('caseId:'),false,era+' still labels contractId as caseId')
}
const sinkSource=source(neo,'m0FeasibilityWitness.ts')
const sinkJs=ts.transpileModule(sinkSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText
const exports={}
vm.runInNewContext(sinkJs,{exports,TextEncoder,Map,Object,JSON,Number,Error})
for(const era of ['historical','modern']){
 const ast=parse(era,source(neo,era+'-talentMarket.ts'))
 const funcs=['m0CaseKey','m0CaseIdentity','m0ProposalIdentity','m0Capture','attachedFeasibility']
 const js=transpile(funcs.map(n=>functionText(ast,n)).join('\n'))
 let feasibilityCalls=0,passedCapture=null
 const promiseFeasibility=(_state,_draft,_week,capture)=>{feasibilityCalls++;passedCapture=capture
  return {classification:'FRAGILE',bottleneck:'synthetic',inputsDigest:'abcd',rulesVersion:4,week:208}}
 const make=new Function('createM0FeasibilitySink','promiseFeasibility',
  'let m0FeasibilitySink=createM0FeasibilitySink();\n'+js+'\nreturn {m0CaseKey,m0CaseIdentity,m0ProposalIdentity,m0Capture,attachedFeasibility,m0FeasibilitySink}')
 const m=make(exports.createM0FeasibilitySink,promiseFeasibility)
 const c0={talentId:'p',subjectStudioId:'s',contractId:'c',openedWeek:196}
 const c1={...c0}
 const p0={talentId:'p',issuerStudioId:'s',digest:'d',submittedWeek:196,promises:[],startWeek:208,termWeeks:52}
 const p1={...p0,promises:['promise-x']}
 const state={market:{tick:208},talentMarket:{cases:[c0,c1],proposals:[p0,p1]},promises:[]}
 const ci0=m.m0CaseIdentity(state,c0),ci1=m.m0CaseIdentity(state,c1)
 assert.equal(ci0.caseKey,JSON.stringify(['p','s','c',196]))
 assert.equal(ci1.caseKey,ci0.caseKey)
 assert.deepEqual([ci0.caseSourceIndex,ci0.caseOccurrence,ci1.caseSourceIndex,ci1.caseOccurrence],[0,0,1,1])
 assert.deepEqual([m.m0ProposalIdentity(state,p0).proposalOccurrence,m.m0ProposalIdentity(state,p1).proposalOccurrence],[0,1])
 const reordered={...state,talentMarket:{...state.talentMarket,cases:[c1,c0]}}
 assert.deepEqual([m.m0CaseIdentity(reordered,c0).caseSourceIndex,m.m0CaseIdentity(reordered,c0).caseOccurrence],[1,1])
 assert.throws(()=>m.m0CaseIdentity(state,{...c0}),/absent/)
 const noAttachment=m.m0Capture(state,ci0,p0,'chooserBand',0)
 assert.equal(m.attachedFeasibility(state,p0,208,noAttachment),null)
 assert.equal(feasibilityCalls,0)
 assert.equal(m.m0FeasibilitySink.rows()[0].kind,'NO_ATTACHED_PROMISE')
 const missing=m.m0Capture(state,ci0,p1,'freezeProposal',1)
 assert.throws(()=>m.attachedFeasibility(state,p1,208,missing),/root missing/)
 assert.equal(feasibilityCalls,0)
 state.promises=[{promiseId:'promise-x',family:'APPEARANCE_COUNT',issuerStudioId:'s',beneficiaryPersonId:'p',
   predicate:{count:1},windowStartWeek:208,dueWeekExclusive:260}]
 assert.equal(m.attachedFeasibility(state,p1,208,missing).classification,'FRAGILE')
 assert.equal(feasibilityCalls,1)
 assert.equal(passedCapture,missing)
 assert.equal(missing.context.phase,'freezeProposal')
 assert.equal(missing.context.submittedOrdinal,1)
 assert.equal(m.m0FeasibilitySink.rows().filter(row=>row.kind==='NO_ATTACHED_PROMISE').length,1)
}
console.log('MARKET_STATIC_SYNTHETIC_PASS: H/M0 parse and helper callsites; H/M0 author/freeze/chooser capture sites; case/proposal collision and reorder; null/missing/attached promise behavior')
