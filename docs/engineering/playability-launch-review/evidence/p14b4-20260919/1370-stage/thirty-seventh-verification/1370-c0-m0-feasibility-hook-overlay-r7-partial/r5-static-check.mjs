import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from '/Users/zacheryspector/The-Movies-headless-program/node_modules/typescript/lib/typescript.js'
const root='/Users/zacheryspector/studio-scratch'
const r4=root+'/1370-c0-m0-feasibility-hook-overlay-r4'
const r5=root+'/1370-c0-m0-feasibility-hook-overlay-r7-partial'
const source=(dir,name)=>fs.readFileSync(dir+'/'+name,'utf8')
function parse(name,s){const a=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true);assert.equal(a.parseDiagnostics.length,0,name+' parse');return a}
function calls(ast){const out={};function walk(n){if(ts.isCallExpression(n)){const e=n.expression;const name=ts.isIdentifier(e)?e.text:ts.isPropertyAccessExpression(e)?e.name.text:null;if(name)out[name]=(out[name]??0)+1}ts.forEachChild(n,walk)}walk(ast);return out}
const guarded=['rivalProposalTrigger','submitProposal','promiseFeasibility','attachedFeasibility','survivesFreeze','bandsFor','chooseProposal','stream','isProven','proposalPriceAt','priorityOrder','trustDescriptor']
for(const era of ['historical','modern']){
 const name=era+'-talentMarket.ts', before=source(r4,name),after=source(r5,name)
 const oldCalls=calls(parse(name,before)),newCalls=calls(parse(name,after))
 for(const key of guarded)assert.equal(newCalls[key]??0,oldCalls[key]??0,era+' changed '+key+' call sites')
 assert.match(after,/caseSourceIndex: m0Case!\.caseSourceIndex/)
 assert.match(after,/priorCases: state\.talentMarket\.cases\.slice\(0, m0Case!\.caseSourceIndex\)/)
 assert.match(after,/submittedOrder: frozen\.map/)
 assert.match(after,/droppedOrder: frozen\.map/)
 assert.match(after,/survivorOrder: frozen\.map/)
 assert.match(after,/submittedOrdinal: row\.submittedOrdinal/)
 assert.match(after,/if \(m0Case !== undefined\) m0Record\(state, 'freezeStart'/)
 if(era==='historical'){
  assert.doesNotMatch(after,/bands: \{ compensation, term, opportunity, trust, standing, incumbency \}/)
  assert.match(after,/relationships: 'NOT_PRESENT_IN_ERA', standing, incumbency/)
 }
}
const diagnostic=source(r5,'diagnostic.test.ts')
parse('diagnostic.test.ts',diagnostic)
assert.doesNotMatch(diagnostic,/from '\.\.\/src\/core\/rng\.js'/)
assert.doesNotMatch(diagnostic,/\bstream\s*\(/)
assert.doesNotMatch(diagnostic,/\bofferForTalent\s*\(/)
assert.match(diagnostic,/scarcityDraw: 'UNOBSERVED', internalSalaryQuote: 'UNOBSERVED'/)
assert.match(diagnostic,/freezeObservedInputPreimage: \{ sha256: sha\(encode\(freeze\[0\]!\.detail\)\)/)
console.log('R6_BASE_STATIC_PASS: market decision call-site parity, source-ordered freeze rows, H flat bands, test RNG removed, observed preimage digest')
