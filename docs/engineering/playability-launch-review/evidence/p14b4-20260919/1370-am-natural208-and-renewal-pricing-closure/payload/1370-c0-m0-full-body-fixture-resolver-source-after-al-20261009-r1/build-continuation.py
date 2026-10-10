from pathlib import Path
import hashlib,json,difflib
P=Path(__file__).resolve().parent
S=Path('/Users/zacheryspector/studio-scratch/1370-c0-m0-real-full-body-wiring-next-slice-source-after-al-20261009-r2')
R=S.parent/'1370-c0-m0-real-full-body-wiring-next-slice-independent-source-review-after-al-20261009-r2/RECEIPT.json'
A=S.parent/'1370-am-root-continuation-20261009-r1/M0-FULLBODY-HELD-DESIGN-SOURCE-ADOPTION.json'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(R)['sha256']=='af4a51151b1c04e18b6b41d03feed32b97aba7c9d3f0d7cbdc69e815d025b881'
assert role(A)['sha256']=='d61438e23ad54f42c50f31f0c81e14a54f36f6ed629d950884a8dbace7a9ecb8'
receipt=json.loads(R.read_text())
for expected in receipt['all31PackageRoles']:
 assert role(Path(expected['path']))==expected
def put(rel,text):
 p=P/rel;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(text)
def change(text,old,new):
 assert text.count(old)==1,(old,text.count(old));return text.replace(old,new)
modules=['talentMarket.ts','promises.ts','opportunityPromises.ts','employment.ts','rng.ts','m0WiringProbe.ts']
proof={}
for module in modules:
 original=(S/'derivative/src/core'/module).read_text();new=original
 if module=='talentMarket.ts':
  old="""  if (!__m0WiringProbe.captureEnabled()) return undefined
  const proposalIdentity = m0ProposalIdentity(state, proposal)
  const base = { era: 'M0' as const, week: state.market.tick, ...kaseIdentity,
    subject: proposal.talentId, issuer: proposal.issuerStudioId, ...proposalIdentity }
"""
  replacement="""  const proposalIdentity = m0ProposalIdentity(state, proposal)
  const base = { era: 'M0' as const, week: state.market.tick, ...kaseIdentity,
    subject: proposal.talentId, issuer: proposal.issuerStudioId, ...proposalIdentity }
  const context = { ...base, phase, ...(phase === 'authorCandidate' ? {candidateOrdinal: ordinal}
    : phase === 'freezeProposal' ? {submittedOrdinal: ordinal} : {survivorOrdinal: ordinal}) }
  __m0WiringProbe.call('m0SourceArrays', {context,
    cases: state.talentMarket.cases.map((row, sourceIndex) => ({sourceIndex,key:m0CaseKey(row)})),
    proposals: state.talentMarket.proposals.map((row, sourceIndex) => ({sourceIndex,
      talentId:row.talentId,issuer:row.issuerStudioId,digest:row.digest,
      key:JSON.stringify([row.talentId,row.issuerStudioId,row.digest,row.submittedWeek])}))})
  if (!__m0WiringProbe.captureEnabled()) return undefined
"""
  new=change(original,old,replacement)
  assert change(new,replacement,old)==original
 if module=='opportunityPromises.ts':
  old="  __m0WiringProbe.call('opportunityAssessment')"
  replacement="  __m0WiringProbe.call('opportunityAssessment', {week,issuer:draft.issuerStudioId,subject:draft.beneficiaryPersonId,family:draft.family,predicate:draft.predicate})"
  new=change(original,old,replacement)
  assert change(new,replacement,old)==original
 put('derivative/src/core/'+module,new)
 forward=''.join(difflib.unified_diff(original.splitlines(True),new.splitlines(True),fromfile='r2/'+module,tofile='r3/'+module))
 inverse=''.join(difflib.unified_diff(new.splitlines(True),original.splitlines(True),fromfile='r3/'+module,tofile='r2/'+module))
 if forward:put('diffs/'+module+'.forward.diff',forward);put('diffs/'+module+'.inverse.diff',inverse)
 proof[module]={'predecessor':role(S/'derivative/src/core'/module),'derivative':role(P/'derivative/src/core'/module),
  'unchanged':new==original,'inverseByteReconstructionVerifiedByBuilder':True}
market=(P/'derivative/src/core/talentMarket.ts').read_text()
gate='        if (error instanceof M0ObserverError) throw error'
mutant=change(market,gate,'        // HELD typed observer-error propagation mutant: original rethrow gate removed.')
put('mutants/typed-propagation-removed-talentMarket.ts',mutant)
assert change(mutant,'        // HELD typed observer-error propagation mutant: original rethrow gate removed.',gate)==market
control=(S/'controls/full-body-controls.ts').read_text()
control=change(control,"import assert from 'node:assert/strict'","import assert from 'node:assert/strict'\nimport {assertFullProjectionOrdering} from '../ordering.js'")
control=change(control,"type Boundary={sourcePhase:'tick.before.advanceTalentMarketWeek';state:GameState}","type Boundary={sourcePhase:'tick.before.advanceTalentMarketWeek'|'synthetic.valid-market-state';state:GameState}")
control=change(control," assert.equal(boundary.sourcePhase,'tick.before.advanceTalentMarketWeek')"," assert.ok(['tick.before.advanceTalentMarketWeek','synthetic.valid-market-state'].includes(boundary.sourcePhase))")
control=change(control,'  return{after,probe,market,feasibility}','  if(capture)assertFullProjectionOrdering(probe,market,feasibility)\n  return{after,probe,market,feasibility}')
control=change(control," for(const fixture of [fixtures.opportunity196,fixtures.opportunity208]){", " assert.equal(fixtures.opportunity196.state.market.tick,196)\n assert.equal(fixtures.opportunity208.state.market.tick,208)\n assert.equal(fixtures.opportunity196.sourcePhase,'synthetic.valid-market-state')\n assert.equal(fixtures.opportunity208.sourcePhase,'synthetic.valid-market-state')\n for(const fixture of [fixtures.opportunity196,fixtures.opportunity208]){")
control=change(control,'  const result=pair(fixture)\n  callsInOrder',"  const result=pair(fixture)\n  const phase=fixture.state.market.tick===196?'authorCandidate':'freezeProposal'\n  const targetEvaluations=result.probe.evaluations.filter(e=>{const c=e.context as {subject?:string;phase?:string}|null;\n   const inputs=e.inputs as unknown[];return c?.subject===SUBJECT&&c.phase===phase&&\n    ['SPECIFIC_PROJECT','PREFERRED_GENRE_OPPORTUNITY'].includes(inputs[0] as string)})\n  assert.ok(targetEvaluations.length>0,'target caller, phase and real opportunity tuple are reached')\n  assert.ok(result.probe.calls.some(c=>{const d=c.detail as {week?:number;subject?:string;family?:string}|null;\n   return c.name==='opportunityAssessment'&&d?.week===fixture.state.market.tick&&d.subject===SUBJECT&&\n    targetEvaluations.some(e=>(e.inputs as unknown[])[0]===d.family)}),'actual target opportunity evaluator invocation')\n  callsInOrder")
put('controls/full-body-controls.ts',control)
put('diffs/controls.forward.diff',''.join(difflib.unified_diff((S/'controls/full-body-controls.ts').read_text().splitlines(True),control.splitlines(True),fromfile='r2/controls',tofile='r3/controls')))
factsRole=json.loads((S/'NEXT-SLICE.json').read_text())['sourceAuthorities']['m0PhysicalFacts']
assert role(Path(factsRole['path']))==factsRole
facts=json.loads(Path(factsRole['path']).read_text())
mirror='/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2'
print('FACT_FORMAT',facts['files']['src/core/tick.ts'])
fileRoles={}
for logical,value in facts['files'].items():
 if logical.startswith(('src/','bridge/')):
  fileRoles[logical]={'path':mirror+'/'+logical,'bytes':value['bytes'],'sha256':value['sha256']}
special={'src/core/'+module:role(P/'derivative/src/core'/module) for module in modules}
binding={'schema':'1370-m0-full-body-source-resolution/v1','mirrorRoot':mirror,
 'derivativeRoot':str(P/'derivative'),'sourceFiles':fileRoles,'derivatives':special,
 'typedCatchMutant':role(P/'mutants/typed-propagation-removed-talentMarket.ts'),
 'dependencyRoot':'/Users/zacheryspector/The-Movies-headless-program/node_modules',
 'physicalFactsAuthority':factsRole,'singleCanonicalIdentityPrefix':'\u0000m0-full-body/',
 'actualM0Types':None,'operationalProtection':None,'fixtureGenerationGrant':None,'controlExecutionGrant':None,
 'executionAuthorization':False,'executionPerformed':False}
put('RESOLUTION-SOURCE-BINDING.json',json.dumps(binding,indent=2,sort_keys=True)+'\n')
put('SOURCE-PROOF.json',json.dumps({'modules':proof,'exactSingleTypedCatchMutant':True,
 'r2Review':role(R),'r2ParentSourceAdoption':role(A),'sourceImportedOrCompiled':False,
 'privateMirrorReadOrModified':False},indent=2,sort_keys=True)+'\n')
