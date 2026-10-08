import assert from 'node:assert/strict'
import fs from 'node:fs'
import cp from 'node:child_process'
import vm from 'node:vm'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'

const repo = '/Users/zacheryspector/The-Movies-headless-program'
const dir = '/Users/zacheryspector/studio-scratch/1370-c0-m0-feasibility-hook-overlay-r6-partial'
const before = (ref) => cp.execFileSync('git', ['show', ref], { cwd: repo, encoding: 'utf8' })
const after = (file) => fs.readFileSync(`${dir}/${file}`, 'utf8')
const parse = (file, source) => {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  assert.equal(ast.parseDiagnostics.length, 0, `${file} parse diagnostics`)
  return ast
}
const functionText = (ast, name) => {
  const node = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name)
  assert.ok(node, `missing ${name}`)
  return node.getText(ast).replace(/^export\s+/, '')
}
const variableText = (ast, name) => {
  const node = ast.statements.find(n => ts.isVariableStatement(n) &&
    n.declarationList.declarations.some(d => ts.isIdentifier(d.name) && d.name.text === name))
  assert.ok(node, `missing ${name}`)
  return node.getText(ast)
}
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  reportDiagnostics: true,
}).outputText
const fnv = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return String(h >>> 0) }
const receiptFactory = (source, modern) => {
  const ast = parse('promises.ts', source)
  const defs = (modern ? functionText(ast, 'serializeFeasibilityInputs') + '\n' : '') +
    functionText(ast, 'receipt')
  const js = compile(defs)
  return new Function('fnv1a64', 'PROMISE_RULES_VERSION', 'TextEncoder',
    js + '\nreturn receipt')(fnv, 4, TextEncoder)
}
const originalH = before('8708d6a98e6eb4ad53e3a54e431c4b40b974f79d:src/core/promises.ts')
const overlayH = after('historical-promises.ts')
const originalM = before('292d6fd3b5293fe2a520b681ae4c1dde997dc113:src/core/promises.ts')
const overlayM = after('modern-promises.ts')
const originalO = before('292d6fd3b5293fe2a520b681ae4c1dde997dc113:src/core/opportunityPromises.ts')
const overlayO = after('modern-opportunityPromises.ts')
for (const [file, source] of [['H',overlayH],['M0',overlayM],['O',overlayO],['sink',after('m0FeasibilityWitness.ts')]]) parse(file,source)
const callCounts = source => {
  const ast = parse('call-sites.ts', source), counts = {}
  const walk = n => { if (ts.isCallExpression(n)) {
    const e=n.expression, k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null
    if(k) counts[k]=(counts[k]??0)+1
  } ts.forEachChild(n,walk) }
  walk(ast); return counts
}
for(const [label,oldSource,newSource,keys] of [
  ['H',originalH,overlayH,['feasibilityInputs','expectedFirstTakeWeek','stockGreenlightAvailable','promiseFeasibility']],
  ['M0',originalM,overlayM,['feasibilityInputs','opportunityFeasibilityInputs','opportunityReservations','directingScopeReservations','promiseProductionOccupancy','opportunityAssessment','serializeFeasibilityInputs','expectedTake','promiseFeasibility']],
  ['O',originalO,overlayO,['paths','reservationWitness','physicalReason','opportunityAssessment']],
]){
  const a=callCounts(oldSource),b=callCounts(newSource)
  for(const key of keys) assert.equal(b[key]??0,a[key]??0,`${label} extra/missing ${key} call site`)
}
const sinkJs=ts.transpileModule(after('m0FeasibilityWitness.ts'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
}).outputText
const exports={}
vm.runInNewContext(sinkJs,{exports,TextEncoder,Map,Object,JSON,Number,Error})
const context={era:'M0',phase:'authorCandidate',week:196,caseKey:'["p","s","c",196]',
  caseOccurrence:0,caseSourceIndex:0,subject:'p',issuer:'s',proposalKey:'["p","s","d",196]',
  proposalOccurrence:0,proposalSourceIndex:0,candidateOrdinal:0}
const sink=exports.createM0FeasibilitySink()
const capture=sink.capture(context)
const inputs=[['a',{z:1,a:2}],['b',3]]
for(const [label,orig,overlay,modern] of [
  ['H',originalH,overlayH,false],['M0',originalM,overlayM,true]
]){
  const oldReceipt=receiptFactory(orig,modern),newReceipt=receiptFactory(overlay,modern)
  const receiptSink=exports.createM0FeasibilitySink()
  const c=receiptSink.capture({...context,era:label})
  const oldResult=modern?oldReceipt('FRAGILE','synthetic',inputs,196,7):oldReceipt('FRAGILE','synthetic',inputs,196)
  const newResult=modern?newReceipt('FRAGILE','synthetic',inputs,196,7,c,{X:1}):newReceipt('FRAGILE','synthetic',inputs,196,c,{X:1})
  assert.deepEqual(newResult,oldResult,`${label} receipt changed`)
  const noCapture=modern?newReceipt('FRAGILE','synthetic',inputs,196,7):newReceipt('FRAGILE','synthetic',inputs,196)
  assert.deepEqual(noCapture,oldResult,`${label} ordinary receipt changed`)
  const rows=receiptSink.rows()
  assert.equal(rows.length,modern?2:3)
  assert.equal(rows[0].kind,'inputTuple')
  assert.equal(rows[0].detail.inputsDigest,oldResult.inputsDigest)
  assert.equal(rows[0].detail.canonicalInputs,modern
    ? JSON.stringify(inputs,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v)
    : JSON.stringify(inputs))
  assert.equal(rows[1].kind,'assessment')
  assert.equal(rows[1].detail.classification,'FRAGILE')
  if(!modern) assert.deepEqual(rows[2].detail,{status:'NOT_PRESENT_IN_ERA'})
}
// RED/positive branch-local schema: early refusal and fully reached count path.
const feasibilityFactory=(source,modern,receiptFn,notOffered)=>{
  const ast=parse('feasibility.ts',source)
  const js=compile(functionText(ast,'promiseFeasibility'))
  const calls={}
  const counted=(name,fn)=>(...args)=>{calls[name]=(calls[name]??0)+1;return fn(...args)}
  const deps={
    receipt:receiptFn, NOT_OFFERED_IN_B1:notOffered, PROMISE_RULES_VERSION:4,
    DIRECTING_PROMISE_RULES_VERSION:6, OPPORTUNITY_PROMISE_RULES_VERSION:7,
    PROMISE_SLACK_WEEKS:8,
    feasibilityInputs:counted('feasibilityInputs',()=>[['synthetic',1]]),
    opportunityReservations:counted('opportunityReservations',()=>undefined),
    directingScopeReservations:counted('directingScopeReservations',()=>undefined),
    isDirectorPredicate:counted('isDirectorPredicate',()=>false),
    promiseProductionOccupancy:counted('promiseProductionOccupancy',()=>[]),
    opportunityFeasibilityInputs:counted('opportunityFeasibilityInputs',()=>[]),
    isOpportunityPredicate:counted('isOpportunityPredicate',()=>false),
    opportunityPredicateRefusal:counted('opportunityPredicateRefusal',()=>null),
    opportunityAssessment:counted('opportunityAssessment',()=>{throw Error('unexpected opportunity')}),
    reservedByActivePromises:counted('reservedByActivePromises',()=>0),
    retirementRecordFor:counted('retirementRecordFor',()=>undefined),
    earliestReleaseWeek:counted('earliestReleaseWeek',()=>0),
    expectedFirstTakeWeek:counted('expectedFirstTakeWeek',(...args)=>5+10*args[modern?3:3]),
    retirementQuoteTakeWeek:counted('retirementQuoteTakeWeek',()=>{throw Error('unexpected retirement')}),
    committedPromiseSeats:counted('committedPromiseSeats',()=>[]),
    seatedPreFirstTake:counted('seatedPreFirstTake',()=>[]),
    promiseCastSlots:counted('promiseCastSlots',()=>['lead']),
    unproducedScripts:counted('unproducedScripts',()=>1),
    stockGreenlightAvailable:counted('stockGreenlightAvailable',()=>true),
    promiseBuffer:counted('promiseBuffer',()=>1),
  }
  const names=Object.keys(deps)
  const fn=new Function(...names,js+'\nreturn promiseFeasibility')(...names.map(k=>deps[k]))
  return {fn,calls}
}
for(const [label,orig,overlay,modern,refusedFamily] of [
  ['H',originalH,overlayH,false,'DIRECTING_COUNT'],
  ['M0',originalM,overlayM,true,'SPECIFIC_PROJECT'],
]){
  const originalReceipt=receiptFactory(orig,modern),overlayReceipt=receiptFactory(overlay,modern)
  const denied={[refusedFamily]:'synthetic not offered'}
  const draft={family:refusedFamily,issuerStudioId:'s',beneficiaryPersonId:'p',
    predicate:{count:1},windowStartWeek:196,dueWeekExclusive:248,startWeek:196,termWeeks:52}
  const original=feasibilityFactory(orig,modern,originalReceipt,denied)
  const instrumented=feasibilityFactory(overlay,modern,overlayReceipt,denied)
  const branchSink=exports.createM0FeasibilitySink()
  const branchCapture=branchSink.capture({...context,era:label})
  const a=original.fn({talent:[]},draft,196)
  const b=instrumented.fn({talent:[]},draft,196,branchCapture)
  assert.deepEqual(b,a,`${label} early-refusal receipt changed`)
  assert.deepEqual(instrumented.calls,original.calls,`${label} early-refusal helper calls changed`)
  const local=branchSink.rows().find(r=>r.kind==='assessment').detail.locals
  for(const key of ['X','from','reserved','nMax','existingPath','lastEventWeek','notOffered','personFound','disciplineAvailable'])
    assert.ok(Object.hasOwn(local,key),`${label} omitted ${key}`)
  assert.equal(local.from,modern?196:'NOT_EVALUATED')
  assert.equal(local.reserved,'NOT_EVALUATED')
  assert.equal(local.nMax,'NOT_EVALUATED')
  assert.equal(local.existingPath,'NOT_EVALUATED')
  assert.equal(local.lastEventWeek,'NOT_EVALUATED')
  assert.equal(local.personFound,'NOT_EVALUATED')
  assert.equal(local.notOffered,'synthetic not offered')
  assert.equal(local.opportunityScope,modern?false:'NOT_PRESENT_IN_ERA')
  assert.equal(local.hasRetirement,modern?'NOT_EVALUATED':'NOT_PRESENT_IN_ERA')
  const goodDraft={...draft,family:'APPEARANCE_COUNT'}
  const goodState={talent:[{id:'p',skills:{acting:1}}]}
  const oldGood=feasibilityFactory(orig,modern,originalReceipt,{})
  const newGood=feasibilityFactory(overlay,modern,overlayReceipt,{})
  const goodSink=exports.createM0FeasibilitySink(),goodCapture=goodSink.capture({...context,era:label})
  const goodA=oldGood.fn(goodState,goodDraft,196)
  const goodB=newGood.fn(goodState,goodDraft,196,goodCapture)
  assert.deepEqual(goodB,goodA,`${label} reached receipt changed`)
  assert.deepEqual(newGood.calls,oldGood.calls,`${label} reached helper calls changed`)
  const reached=goodSink.rows().find(r=>r.kind==='assessment').detail.locals
  for(const key of ['from','reserved','nMax','existingPath','lastEventWeek','personFound','disciplineAvailable'])
    assert.notEqual(reached[key],'NOT_EVALUATED',`${label} reachable ${key} not captured`)
}

// Opportunity assessment: use the SAME synthetic helper responses for original and overlay.
const opportunityFactory=(source,scenario)=>{
  const ast=parse('opportunity.ts',source)
  const helpers=source===overlayO?variableText(ast,'m0Finite')+'\n'+variableText(ast,'m0PathSummary')+'\n':''
  const js=compile(helpers+functionText(ast,'opportunityAssessment'))
  const calls={paths:0,witness:0,physical:0}
  const paths=(_state,_draft,_week,_capped,delay)=>{calls.paths++;return delay===undefined?scenario.candidates:scenario.delayed}
  const reservationWitness=()=>{calls.witness++;return scenario.witness}
  const physicalReason=()=>{calls.physical++;return 'synthetic physical'}
  const fn=new Function('paths','reservationWitness','physicalReason',js+'\nreturn opportunityAssessment')(paths,reservationWitness,physicalReason)
  return {fn,calls}
}
const path=(id,physical=null,uncertainty=null,takeWeek=2)=>({id,production:null,takeWeek,freshWeek:1,physical,uncertainty})
for(const scenario of [
  {candidates:[path('a'),path('b')],delayed:[],witness:1},
  {candidates:[path('a'),path('b')],delayed:[path('a',null,'uncertain',3)],witness:2},
  {candidates:[path('a','blocked')],delayed:[],witness:null},
]){
  const a=opportunityFactory(originalO,scenario),b=opportunityFactory(overlayO,scenario)
  const args=[{}, {dueWeekExclusive:10},196,[]]
  const opportunitySink=exports.createM0FeasibilitySink()
  const ca=opportunitySink.capture(context)
  const resultA=a.fn(...args),resultB=b.fn(...args,ca)
  assert.deepEqual(resultB,resultA,'opportunity result changed')
  assert.deepEqual(b.calls,a.calls,'opportunity helper invocation changed')
  assert.ok(opportunitySink.rows().some(r=>r.kind==='opportunityResult'))
}
// Sink: copies, occurrence, reentrancy and caps fail before append.
capture.record('synthetic',{value:1})
capture.record('synthetic',{value:2})
assert.equal(sink.rows()[1].occurrence,1)
const external=sink.rows()
external[0].kind='tampered'
assert.equal(sink.rows()[0].kind,'synthetic')
assert.throws(()=>capture.record('large',{text:'x'.repeat(17_000)}),/row byte bound/)
assert.equal(sink.rows().length,2)
assert.throws(()=>capture.record('cycle',(()=>{const x={};x.self=x;return x})()),/circular/i)
assert.equal(sink.rows().length,2)
assert.throws(()=>capture.record('reentry',{toJSON(){capture.record('inner',{});return {}}}),/reentrant/)
assert.equal(sink.rows().length,2)
assert.throws(()=>sink.capture({...context,caseSourceIndex:-1}),/invalid context/)
assert.throws(()=>sink.capture({...context,candidateOrdinal:undefined}),/invalid context/)
assert.throws(()=>sink.capture({...context,submittedOrdinal:0}),/invalid context/)
assert.throws(()=>sink.capture({...context,phase:'freezeProposal',candidateOrdinal:undefined}),/invalid context/)
assert.throws(()=>sink.capture({...context,phase:'freezeProposal',submittedOrdinal:0,candidateOrdinal:0}),/invalid context/)
assert.throws(()=>sink.capture({...context,phase:'chooserBand',candidateOrdinal:undefined}),/invalid context/)
assert.throws(()=>sink.capture({...context,phase:'chooserBand',survivorOrdinal:0,candidateOrdinal:0}),/invalid context/)
assert.ok(sink.capture({...context,phase:'freezeProposal',candidateOrdinal:undefined,submittedOrdinal:0}))
assert.ok(sink.capture({...context,phase:'chooserBand',candidateOrdinal:undefined,survivorOrdinal:0}))
const rowSink=exports.createM0FeasibilitySink()
const rowCap=rowSink.capture(context)
for(let i=0;i<511;i++) rowCap.record('small',{i})
const secondContext=rowSink.capture({...context,candidateOrdinal:1})
secondContext.record('small',{i:511})
assert.equal(rowSink.rows().length,512)
assert.throws(()=>rowCap.record('overflow',{}),/row bound/)
const totalSink=exports.createM0FeasibilitySink()
const totalCap=totalSink.capture(context)
let totalStopped=false
for(let i=0;i<512;i++){
  try{totalCap.record('medium',{i,text:'x'.repeat(5000)})}
  catch(e){assert.match(String(e),/total byte bound/);totalStopped=true;break}
}
assert.equal(totalStopped,true)
console.log('STATIC_SYNTHETIC_PASS: 4 parse; H/M0/O helper call sites unchanged; H/M0 receipt bytes/results and early-refusal/reached locals; 3 opportunity paths; sink copying/occurrence/caps/reentry/phase ordinals')
