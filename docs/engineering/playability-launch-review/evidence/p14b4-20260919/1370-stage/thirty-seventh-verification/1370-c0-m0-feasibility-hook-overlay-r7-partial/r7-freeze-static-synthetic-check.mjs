import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const old=root+'/1370-c0-m0-feasibility-hook-overlay-r6-partial'
const neo=root+'/1370-c0-m0-feasibility-hook-overlay-r7-partial'
const read=(dir,name)=>fs.readFileSync(dir+'/'+name,'utf8')
const parse=(name,s)=>{const ast=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true);assert.equal(ast.parseDiagnostics.length,0,name+' parse');return ast}
const fn=(ast,name)=>{const n=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(n,name);return n.getText(ast).replace(/^export\s+/,'')}
function counts(s){const out={};function walk(n){if(ts.isCallExpression(n)){const e=n.expression,k=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null;if(k)out[k]=(out[k]??0)+1}ts.forEachChild(n,walk)}walk(parse('function.ts',s));return out}
const guarded=['enteredStudioIds','trustDescriptor','subjectTerms','seatsHeldAfter','proposalPriceAt','proposalDraft','attachedPromiseDigest','affordabilityRefusal','extensionAdmitted','contractEndRefusal','rosterAt','tiersOnRoster','extensionReservation','promiseFeasibility','stream','rivalProposalTrigger','rivalPremiumTier','chooseProposal']
for(const era of ['historical','modern']){
 const name=era+'-talentMarket.ts',a=parse(name,read(old,name)),b=parse(name,read(neo,name))
 const oldCalls=counts(fn(a,'survivesFreeze')),newCalls=counts(fn(b,'survivesFreeze'))
 for(const k of guarded)assert.equal(newCalls[k]??0,oldCalls[k]??0,era+' changed production call '+k)
 const source=read(neo,name)
 assert.doesNotMatch(source,/NOT_APPLICABLE/)
 assert.match(source,/values: Record<string, unknown> = \{\}/)
 assert.match(source,/proposalSourceIndex: identity\.proposalSourceIndex/)
 const orderMatch=source.match(/const m0FreezeOrder = (\[[^\n]+\]) as const/);assert.ok(orderMatch)
 const order=Function('return '+orderMatch[1])()
 assert.equal(order.length,12)
 const absent=era==='historical'?['retirementCap','nemesisOnRoster','belowRetirementReservation']:[]
 const body=ts.transpileModule(fn(b,'m0FreezeCheck'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText
 let rows=[]
 const make=new Function('M0_SUBJECT','m0FreezeOrder','m0AbsentFreezePredicates','m0ProposalIdentity','m0Record',body+';return m0FreezeCheck')
 const check=make('target',order,absent,()=>({proposalSourceIndex:4,proposalOccurrence:2}),(_state,_phase,_issuer,row)=>rows.push(row))
 const state={market:{tick:208}},proposal={talentId:'target',issuerStudioId:'studio-r02',digest:'repeat'}
 const active=order.filter(k=>!absent.includes(k))
 for(const predicate of active)check(state,proposal,208,predicate,false,true,{sample:predicate})
 assert.deepEqual(rows.map(r=>r.predicateOrdinal),order.map((_,i)=>i),era+' canonical success order')
 assert.deepEqual(rows.map(r=>r.predicate),order,era+' all statuses once')
 assert.ok(rows.every(r=>r.proposalSourceIndex===4&&r.proposalOccurrence===2))
 for(const row of rows)assert.equal(row.result,absent.includes(row.predicate)?'NOT_PRESENT_IN_ERA':'PASSED')
 rows=[];check(state,proposal,208,active[0],true,true,{failedAt:active[0]})
 assert.deepEqual(rows.map(r=>r.predicateOrdinal),order.map((_,i)=>i),era+' canonical first failure order')
 assert.equal(rows[0].result,'FAILED')
 for(const row of rows.slice(1))assert.equal(row.result,absent.includes(row.predicate)?'NOT_PRESENT_IN_ERA':'NOT_REACHED')
 rows=[];check(state,proposal,208,active[0],false,true,{sample:1});check(state,proposal,208,active[1],true,true,{sample:2})
 assert.deepEqual(rows.map(r=>r.predicateOrdinal),order.map((_,i)=>i),era+' canonical later failure order')
 assert.equal(rows.filter(r=>absent.includes(r.predicate)).length,absent.length)
 rows=[];check(state,proposal,208,active[0],false,false,{value:'NOT_EVALUATED'})
 assert.equal(rows[0].result,'NOT_EVALUATED')
}
console.log('R7_FREEZE_STATIC_SYNTHETIC_PASS: H/M0 production calls unchanged; 12 canonical unique source-order predicates on success/early failure; H absent markers; NOT_EVALUATED')
