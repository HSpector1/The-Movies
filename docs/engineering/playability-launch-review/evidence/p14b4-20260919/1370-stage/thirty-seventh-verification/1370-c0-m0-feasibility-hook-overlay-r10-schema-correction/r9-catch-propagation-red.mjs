import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const before=root+'/1370-c0-m0-feasibility-hook-overlay-r8-partial'
const after=root+'/1370-c0-m0-feasibility-hook-overlay-r9-propagation-correction'
const read=(dir,era)=>fs.readFileSync(`${dir}/${era}-talentMarket.ts`,'utf8')
const parse=(name,s)=>{const ast=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true);assert.equal(ast.parseDiagnostics.length,0);return ast}
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
const declaration=(ast,name,kind)=>{const n=ast.statements.find(node=>kind(node)&&node.name?.text===name);assert.ok(n,name);return n.getText(ast).replace(/^export\s+/,'')}
function submissionTry(ast){const f=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='advanceTalentMarketWeek');assert.ok(f)
 let found=null;function walk(n){if(ts.isTryStatement(n)&&n.tryBlock.getText(ast).includes('submitProposal('))found=n;ts.forEachChild(n,walk)}walk(f)
 assert.ok(found,'submission try');return found.getText(ast)}
function makeCatch(ast){
 const cls=ast.statements.some(n=>ts.isClassDeclaration(n)&&n.name?.text==='M0ObserverError')
  ? declaration(ast,'M0ObserverError',ts.isClassDeclaration) : 'class M0ObserverError extends Error {}'
 const record=declaration(ast,'m0Record',ts.isFunctionDeclaration)
 const block=submissionTry(ast)
 const code=transpile(cls+`
const M0_MAX_ROWS=512,M0_MAX_ROW_BYTES=16384,M0_MAX_TOTAL_BYTES=2097152,M0_SUBJECT='person-target'
const m0Rows=[];let m0TotalBytes=0
${record}
function run(error) {
  let next = {}, refusal = null, premiumTier = null, termWeeks = null
  const business = {studioId:'studio-r02'}, descriptor={decisionWeek:208}
  const kase = {talentId:'person-target'}, extension=false, observing=true
  const TUNING={HOLLYWOOD_CONTRACT_WEEKS:52,RETIREMENT_NOTICE_WEEKS:52}
  const rivalPremiumTier=()=>1, retirementRecordFor=()=>({effectiveWeek:208})
  const submitProposal=()=>{
    if(error==='SUCCESS')return {ok:true}
    if(error==='CAP')return m0Record({market:{tick:196}},'draftPrice','studio-r02',{annualSalary:1})
    if(error==='SERIALIZE'){const cycle={};cycle.self=cycle;return m0Record({market:{tick:196}},'draftPrice','studio-r02',cycle)}
    throw error
  }
  ${block}
  return {refusal,next}
}`)
 return new Function('TextEncoder',code+'\nreturn {run,M0ObserverError,m0Rows}') (TextEncoder)
}

const guarded=['rivalProposalTrigger','rivalPremiumTier','submitProposal','proposalDraft','proposalPriceAt',
  'promiseFeasibility','attachedFeasibility','survivesFreeze','bandsFor','chooseProposal','stream',
  'isProven','canAfford','rivalOperatingReserve','affordabilityRefusal']
function callCounts(ast){const out={};function walk(n){if(ts.isCallExpression(n)){
 const e=n.expression,k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null
 if(k)out[k]=(out[k]??0)+1}ts.forEachChild(n,walk)}walk(ast);return out}
for(const era of ['historical','modern']){
 const oldAst=parse(era,read(before,era)),newAst=parse(era,read(after,era))
 const ac=callCounts(oldAst),bc=callCounts(newAst)
 for(const key of guarded)assert.equal(bc[key]??0,ac[key]??0,era+' changed '+key+' call count')
 const oldCatch=makeCatch(oldAst),newCatch=makeCatch(newAst)
 assert.deepEqual(oldCatch.run('SUCCESS'),{refusal:null,next:{ok:true}})
 assert.deepEqual(newCatch.run('SUCCESS'),{refusal:null,next:{ok:true}})
 const normal=new Error('ordinary gameplay refusal')
 assert.equal(oldCatch.run(normal).refusal,'ordinary gameplay refusal')
 assert.equal(newCatch.run(normal).refusal,'ordinary gameplay refusal')
 // The *actual* market recorder is called by the extracted submitProposal try block.
 oldCatch.m0Rows.length=512;newCatch.m0Rows.length=512
 assert.equal(oldCatch.run('CAP').refusal,'M0 observer row bound exceeded',era+' predecessor cap RED')
 assert.throws(()=>newCatch.run('CAP'),e=>e instanceof newCatch.M0ObserverError && /row bound/.test(e.message),era+' cap propagates')
 oldCatch.m0Rows.length=0;newCatch.m0Rows.length=0
 assert.match(oldCatch.run('SERIALIZE').refusal,/circular/i,era+' predecessor serialization RED')
 assert.throws(()=>newCatch.run('SERIALIZE'),e=>e instanceof newCatch.M0ObserverError && /recording failed/.test(e.message),era+' serialization propagates')
 console.log(era,'R8_EXPECTED_RED_R9_PROPAGATION_AND_ORDINARY_REFUSAL_PASS')
}
