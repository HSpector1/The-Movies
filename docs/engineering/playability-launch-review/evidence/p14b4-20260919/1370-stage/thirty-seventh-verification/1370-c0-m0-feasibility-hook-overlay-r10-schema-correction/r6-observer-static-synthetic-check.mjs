import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const old=root+'/1370-c0-m0-feasibility-hook-overlay-r6-partial'
const neo=root+'/1370-c0-m0-feasibility-hook-overlay-r9-propagation-correction'
const read=(dir,name)=>fs.readFileSync(dir+'/'+name,'utf8')
const parse=(name,s)=>{const ast=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true);assert.equal(ast.parseDiagnostics.length,0);return ast}
const fn=(ast,name)=>{const n=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(n,name);return n.getText(ast).replace(/^export\s+/,'')}
const transpile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
function counts(ast){const out={};function walk(n){if(ts.isCallExpression(n)){const e=n.expression;const k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null;if(k)out[k]=(out[k]??0)+1}ts.forEachChild(n,walk)}walk(ast);return out}
const guarded=['rivalProposalTrigger','rivalPremiumTier','submitProposal','proposalDraft','proposalPriceAt','studioOffer','isProven','promiseFeasibility','attachedFeasibility','survivesFreeze','bandsFor','chooseProposal','stream','iround','publicPreferredOpportunity']
for(const era of ['historical','modern']){
 const name=era+'-talentMarket.ts',a=parse(name,read(old,name)),b=parse(name,read(neo,name));const ac=counts(a),bc=counts(b)
 for(const k of guarded)assert.equal(bc[k]??0,ac[k]??0,era+' extra decision/helper call '+k)
 const bs=read(neo,name)
 assert.match(bs,/if \(m0Case !== undefined\) m0Record\(state, 'freezeStart'/)
 assert.match(bs,/droppedOrder: frozen\.map\(\(f, submittedOrdinal\)/)
 assert.match(bs,/survivorOrder: frozen\.map\(\(f, submittedOrdinal\)/)
 assert.match(bs,/authorInputs:/)
 assert.match(bs,/publicPreferredOpportunity: 'NOT_EVALUATED_AT_AUTHOR'/)
 assert.match(bs,/m0Record\(state, 'triggerInputs'/)
 assert.match(bs,/m0Record\(state, 'draftPrice'/)
 assert.match(bs,/m0Record\(state, 'priceAt'/)
 assert.match(bs,/m0Record\(state, 'publicPreferredOpportunity'/)
 for(const source of [a,b]){
  const f=fn(source,'rivalProposalTrigger')
  const js=transpile(f)
  let rows=[]
  const make=new Function('M0_SUBJECT','M0_ISSUERS','RIVAL_TEAM_ROLES','m0Record',js+'; return rivalProposalTrigger')
  const trigger=make('person-target',['studio-r01','studio-r02','studio-r03'],['actor','actor'],(_s,phase,issuer,detail)=>rows.push({phase,issuer,detail}))
  const state={talent:[{id:'person-target',role:'actor'}],market:{tick:196}}
  const business={studioId:'studio-r02'}
  const descriptor={talentId:'person-target',subjectStudioId:'studio-r01',decisionWeek:208}
  const hollywood={activeEmploymentOrdinals:[],employment:[]}
  assert.equal(trigger(state,hollywood,business,descriptor,196),true)
  assert.equal(rows.length,1)
  assert.deepEqual([rows[0].phase,rows[0].detail.branch,rows[0].detail.required,rows[0].detail.heldAtEffectiveWeek],['triggerInputs','seatDeficit',2,0])
  rows=[];assert.equal(trigger(state,hollywood,{studioId:'studio-r01'},descriptor,196),true)
  assert.equal(rows[0].detail.branch,'incumbent')
 }
}
console.log('R6_OBSERVER_STATIC_SYNTHETIC_PASS: H/M0 decision helper counts, r5 defects fixed, trigger branch output parity and captured locals')
