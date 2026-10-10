import pathlib,json,hashlib,difflib,re
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
P=S/'1370-c0-m0-real-full-body-wiring-next-slice-source-after-al-20261009-r2'
P.mkdir(mode=0o700)
B=json.loads((S/'1370-c0-m0-types-next-slice-after-ak-20261009-r1/BINDING-UNFILLED.json').read_text())
def sha(raw):return hashlib.sha256(raw).hexdigest()
def role_read(r):
 raw=pathlib.Path(r['path']).read_bytes();assert len(raw)==r['bytes'] and sha(raw)==r['sha256'];return raw
F=json.loads(role_read(B['sourceAuthorities']['m0PhysicalFacts']))
manifest=json.loads(role_read(B['sourceAuthorities']['sourceManifest']))
source_roles={}
original={}
for r in manifest['files']:
 source_roles[r['destination']]={'path':r['source'],'bytes':r['bytes'],'sha256':r['sha256']}
 original[r['destination']]=role_read(source_roles[r['destination']]).decode()
for dest in ['src/core/rng.ts','src/core/employment.ts','src/harness/p13a/fixtures.ts']:
 row=F['files'][dest];r={'path':str(REPO/dest),'bytes':row['bytes'],'sha256':row['sha256']}
 original[dest]=role_read(r).decode();source_roles[dest]=r
for name in ['functionOnlyChecker','syntheticCatchChecker','sourceReview','m0CopyParentAdoption','m0CompleteParentAdoption']:
 role_read(B['sourceAuthorities'][name])
review=S/'1370-c0-m0-types-collection-source-independent-review-after-al-20261009-r4/RECEIPT.json'
reviewraw=review.read_bytes();assert len(reviewraw)==22411 and sha(reviewraw)=='2d6ab3da894efc86513a6909471781aed7a4ddddcd9f9475e33a71031e71aec0'
def put(name,data):
 if isinstance(data,str):data=data.encode()
 path=P/name;path.parent.mkdir(mode=0o700,parents=True,exist_ok=True);path.write_bytes(data)
 return {'path':str(path),'bytes':len(data),'sha256':sha(data)}
def j(data):return json.dumps(data,indent=2,sort_keys=True)+'\n'
probe='''// Test derivative only. Default behavior leaves the accepted observer enabled.
// No GameState writes, no RNG, no globals monkey-patching, no gameplay stubs.
import type { GameState } from './types.js'
type Fault = 'row-cap' | 'row-byte-cap' | 'total-byte-cap' | 'serialization' | 'ordinary-refusal'
type Call = { sequence: number; name: string; detail: unknown }
type Evaluation = { inputs: unknown; canonicalInputs: string; result: unknown; context: unknown }
let active = false, enabled = true, overflow = false, fault: Fault | null = null
let calls: Call[] = [], evaluations: Evaluation[] = [], bytes = 0
let boundary: ((state: GameState) => void) | null = null
let faultReached: { kind: Fault; phase: string } | null = null
const MAX_ENTRIES=16384, MAX_ROW_BYTES=64*1024, MAX_TOTAL_BYTES=2*1024*1024
function bounded(value: unknown): unknown | undefined {
  if (overflow) return undefined
  const raw = JSON.stringify(value)
  const n = new TextEncoder().encode(raw + '\\n').length
  if (calls.length + evaluations.length >= MAX_ENTRIES || n > MAX_ROW_BYTES || bytes + n > MAX_TOTAL_BYTES) {
    overflow = true; return undefined
  }
  bytes += n; return JSON.parse(raw) as unknown
}
export const m0WiringProbe = Object.freeze({
  captureEnabled: (): boolean => enabled,
  call(name: string, detail: unknown = null): void {
    if (!active) return
    const row=bounded({ sequence:calls.length,name,detail })
    if (row !== undefined) calls.push(row as Call)
  },
  evaluation(inputs: readonly unknown[], canonicalInputs: string, result: unknown, context: unknown): void {
    if (!active) return
    const row=bounded({inputs,canonicalInputs,result,context})
    if (row !== undefined) evaluations.push(row as Evaluation)
  },
  beforeAdvance(state: GameState): void { boundary?.(state) },
  setBoundaryConsumer(value: ((state: GameState) => void) | null): void { boundary=value },
  begin(capture: boolean, requestedFault: Fault | null = null): void {
    active=true;enabled=capture;overflow=false;calls=[];evaluations=[];bytes=0;fault=requestedFault;faultReached=null
  },
  consumeFault(phase: string): Fault | null {
    if (!active || fault === null || (fault === 'ordinary-refusal' ? phase !== 'submitProposal' : phase !== 'draftPrice')) return null
    const kind=fault;fault=null;faultReached={kind,phase};return kind
  },
  end() {
    active=false;enabled=true;fault=null
    return {calls,evaluations,overflow,faultReached,bytes}
  },
})
'''
put('derivative/src/core/m0WiringProbe.ts',probe)
patches={};derivatives={}
def edit(dest,anchor,replacement,label):
 text=derivatives.setdefault(dest,original[dest]);assert text.count(anchor)==1,(dest,label,text.count(anchor))
 derivatives[dest]=text.replace(anchor,replacement)
 patches.setdefault(dest,[]).append({'label':label,'originalAnchorSha256':sha(anchor.encode()),'replacementSha256':sha(replacement.encode())})
for dest in ['src/core/talentMarket.ts','src/core/promises.ts','src/core/opportunityPromises.ts','src/core/rng.ts','src/core/employment.ts']:
 derivatives[dest]="import { m0WiringProbe as __m0WiringProbe } from './m0WiringProbe.js'\n"+original[dest]
 patches[dest]=[{'label':'test-only shared probe import','bytesAdded':len("import { m0WiringProbe as __m0WiringProbe } from './m0WiringProbe.js'\n")}]
# Exact insertion anchors come from authenticated complete modules. No extracted
# functions are executed, and every implementation/import remains in the derivative.
anchors={
 'src/core/talentMarket.ts':[
  ('advanceTalentMarketWeek','export function advanceTalentMarketWeek(state: GameState): GameState {'),
  ('rivalProposalTrigger','): boolean {\n  const m0ObserveTrigger'),
  ('rivalPremiumTier','function rivalPremiumTier(business: RivalBusiness, descriptor: MarketCaseDescriptor): number {'),
  ('submitProposal','export function submitProposal(state: GameState, intent: ProposalIntent): GameState {'),
  ('proposalDraft','): ProposalDraft {\n  if (!isPremiumTier'),
  ('proposalPriceAt','): { askAnnual: number; annualSalary: number; signingBonus: number } {'),
  ('authorRivalPromise','  m0Case?: M0CaseIdentity): GameState {'),
  ('attachedFeasibility','  capture?: M0FeasibilityCapture): PromiseFeasibilityReceipt | null {'),
  ('settleCase','function settleCase(state: GameState, kase: TalentMarketCaseV36, week: number): GameState {'),
  ('isProven','function isProven(state: GameState, talentId: string): boolean {'),
  ('rivalOperatingReserve','function rivalOperatingReserve(business: RivalBusiness, hollywood: HollywoodState, week: number): number {'),
 ],
 'src/core/promises.ts':[
  ('promiseFeasibility','  capture?: M0FeasibilityCapture): PromiseFeasibilityReceipt {'),
  ('feasibilityInputs','  productionOccupancy: readonly PromiseProductionOccupancy[] = []): readonly unknown[] {'),
  ('receipt','): PromiseFeasibilityReceipt {\n  // Serialize once'),
 ],
 'src/core/opportunityPromises.ts':[
  ('opportunityAssessment','  reservations: readonly ProfessionalPromise[], capture?: M0FeasibilityCapture): { classification: PromiseClassification; bottleneck: string | null } {'),
 ],
 'src/core/employment.ts':[
  ('canAfford','export function canAfford(state: CashState, amount: number): Affordability {'),
  ('contractOffer','): ContractOffer {\n  const talent = state.talent.find'),
 ],
 'src/core/rng.ts':[
  ('RngStream.next','  next(): number {'),
  ('stream','export function stream(seed: string, purpose: RngPurpose, key: string | number): RngStream {'),
 ],
}
for dest,rows in anchors.items():
 for name,anchor in rows:
  at=anchor.rfind('{');replacement=anchor[:at+1]+f"\n  __m0WiringProbe.call({name!r})"+anchor[at+1:]
  if name=='stream':replacement=replacement.replace(f"call({name!r})",f"call({name!r}, {{seed,purpose,key}})")
  edit(dest,anchor,replacement,'entry call trace '+name)
edit('src/core/talentMarket.ts',"  __m0WiringProbe.call('advanceTalentMarketWeek')","  __m0WiringProbe.call('advanceTalentMarketWeek')\n  __m0WiringProbe.beforeAdvance(state)",'actual already-incremented caller boundary')
edit('src/core/talentMarket.ts',"  __m0WiringProbe.call('submitProposal')","  __m0WiringProbe.call('submitProposal')\n  if (__m0WiringProbe.consumeFault('submitProposal') === 'ordinary-refusal') throw new Error('M0 wiring ordinary submission refusal fixture')",'single-use ordinary refusal through full submit body entry')
edit('src/core/talentMarket.ts',"  phase: 'authorCandidate' | 'freezeProposal' | 'chooserBand', ordinal: number): M0FeasibilityCapture {",
 "  phase: 'authorCandidate' | 'freezeProposal' | 'chooserBand', ordinal: number): M0FeasibilityCapture | undefined {\n  if (!__m0WiringProbe.captureEnabled()) return undefined",'test capture-off feasibility sink only')
recordanchor="  contractId: string | null = null, variant: string | null = null): void {\n  try {"
recordreplacement="""  contractId: string | null = null, variant: string | null = null): void {
  if (!__m0WiringProbe.captureEnabled()) return
  const __fault = __m0WiringProbe.consumeFault(phase)
  const __rowsBefore=m0Rows.length, __totalBefore=m0TotalBytes
  try {"""
edit('src/core/talentMarket.ts',recordanchor,recordreplacement,'capture toggle and single-use fault snapshot')
gate="    if (week !== 196 && week !== 208) return\n    if (m0Rows.length >= M0_MAX_ROWS)"
inject="""    if (week !== 196 && week !== 208) return
    if (__fault === 'row-cap') m0Rows.length=M0_MAX_ROWS
    if (__fault === 'total-byte-cap') m0TotalBytes=M0_MAX_TOTAL_BYTES
    if (__fault === 'row-byte-cap') detail={pad:'x'.repeat(M0_MAX_ROW_BYTES)}
    if (__fault === 'serialization') { const cycle: {self?: unknown}={};cycle.self=cycle;detail=cycle }
    if (m0Rows.length >= M0_MAX_ROWS)"""
edit('src/core/talentMarket.ts',gate,inject,'actual recorder cap/JSON fault at draftPrice')
catchtail="""    throw new M0ObserverError('M0 observer recording failed: ' +
      (error instanceof Error ? error.message : typeof error))
  }
}
const m0FreezeOrder"""
catchnew="""    throw new M0ObserverError('M0 observer recording failed: ' +
      (error instanceof Error ? error.message : typeof error))
  } finally {
    // Fault is single-use: a swallowed submission fault must not fail again
    // at a later issuerAttempt and accidentally satisfy the propagation RED.
    if (__fault !== null) {m0Rows.length=__rowsBefore;m0TotalBytes=__totalBefore}
  }
}
const m0FreezeOrder"""
edit('src/core/talentMarket.ts',catchtail,catchnew,'restore injected recorder bounds after one actual failure')
receipt="  const result = { classification, bottleneck, inputsDigest: fnv1a64(canonicalInputs), rulesVersion, week }"
edit('src/core/promises.ts',receipt,receipt+"\n  __m0WiringProbe.evaluation(inputs,canonicalInputs,result,capture?.context ?? null)",'actual evaluation canonical tuple/result readback')
derivatives['src/core/talentMarket.ts']+='''
// Test-only access to existing complete implementations; no replacements.
export const m0WiringTestApi = Object.freeze({M0ObserverError,authorRivalPromise,settleCase,
  reset: (): void => {drainM0MarketDecisionRows();drainM0FeasibilityRows()},
})
'''
patches['src/core/talentMarket.ts'].append({'label':'test-only exports of existing complete functions/class and reset'})
# Additional helper definitions are recorded by exact body-entry anchors located
# lexically, never by extracting/replacing their bodies or mocking their imports.
extra_helpers={'src/core/talentMarket.ts':['survivesFreeze','bandsFor','chooseProposal','affordabilityRefusal'],
 'src/core/promises.ts':['attachPromise']}
for dest,names in extra_helpers.items():
 for name in names:
  text=derivatives[dest];match=re.search(r'(?:export )?function '+name+r'\(',text);assert match
  # These anchored signatures have no object literal return types; select a brace
  # followed by a newline and an indented executable/comment line.
  m=re.search(r'\{\n',text[match.start():]);assert m
  index=match.start()+m.start()+1
  derivatives[dest]=text[:index]+f"\n  __m0WiringProbe.call({name!r})"+text[index:]
  patches[dest].append({'label':'entry call trace '+name,'insertOffset':index})
# Retain module-specific source preimages locally so all inverse proofs are finite.
diffroles={}
def verify_patch(source,target,diff):
 sl=source.splitlines(keepends=True);rows=diff.splitlines(keepends=True);i=2;pos=0;out=[]
 while i<len(rows):
  m=re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',rows[i]);assert m
  at=int(m[1])-1;out.extend(sl[pos:at]);pos=at;i+=1
  while i<len(rows) and not rows[i].startswith('@@ '):
   line=rows[i];i+=1
   if line[0] in ' -':assert sl[pos]==line[1:];pos+=1
   if line[0] in ' +':out.append(line[1:])
 out.extend(sl[pos:]);assert ''.join(out)==target
for dest,text in derivatives.items():
 put('derivative/'+dest,text);put('predecessor/'+dest,original[dest])
 for suffix,left,right in [('forward',original[dest],text),('inverse',text,original[dest])]:
  diff=''.join(difflib.unified_diff(left.splitlines(keepends=True),right.splitlines(keepends=True),fromfile=dest,tofile=dest,n=3))
  verify_patch(left,right,diff);diffroles[dest+'.'+suffix]=put('diffs/'+pathlib.Path(dest).name+'.'+suffix+'.diff',diff)
 # The accepted full-body typed catch remains byte-identical and exactly once.
 if dest=='src/core/talentMarket.ts':
  gate="        if (error instanceof M0ObserverError) throw error"
  assert original[dest].count(gate)==text.count(gate)==1
put('controls/full-body-controls.ts','''// HELD source-only controls API. Every tested implementation is a full imported
// derivative module. Fixtures must come from actual recorded caller boundaries.
import assert from 'node:assert/strict'
import {advanceTalentMarketWeek,drainM0MarketDecisionRows,drainM0FeasibilityRows,
  rivalProposalTrigger,m0WiringTestApi} from '../derivative/src/core/talentMarket.js'
import {m0WiringProbe} from '../derivative/src/core/m0WiringProbe.js'
import type {GameState} from '../derivative/src/core/types.js'
import type {MarketCaseDescriptor} from '../derivative/src/core/talentMarket.js'
import type {RivalBusiness} from '../derivative/src/core/hollywoodTypes.js'
const SUBJECT='person-studio-aca408ec-r01-0'
const encode=(value:unknown):string=>JSON.stringify(value)
const clone=<T>(value:T):T=>structuredClone(value)
type Boundary={sourcePhase:'tick.before.advanceTalentMarketWeek';state:GameState}
type TriggerFixture={state:GameState;business:RivalBusiness;descriptor:MarketCaseDescriptor}
export type WiringFixtures={author196:Boundary;freeze208:Boundary;offWeek:Boundary;
  opportunity196:Boundary;opportunity208:Boundary;offSubject:TriggerFixture;offIssuer196:TriggerFixture}
function sortedInputs(inputs:unknown):string {
 return JSON.stringify(inputs,(_key,value:unknown)=>value===null||typeof value!=='object'||Array.isArray(value)
  ? value:Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0)))
}
function arm(boundary:Boundary,capture:boolean){
 assert.equal(boundary.sourcePhase,'tick.before.advanceTalentMarketWeek')
 const state=clone(boundary.state),before=encode(state)
 m0WiringTestApi.reset();m0WiringProbe.begin(capture)
 try{
  const after=advanceTalentMarketWeek(state)
  const probe=m0WiringProbe.end(),market=drainM0MarketDecisionRows(),feasibility=drainM0FeasibilityRows()
  assert.equal(probe.overflow,false,'complete bounded helper/RNG trace, never dropped evidence')
  assert.equal(encode(state),before,'full caller input is unchanged')
  for(const row of probe.evaluations) assert.equal(sortedInputs(row.inputs),row.canonicalInputs,'actual canonical tuple')
  for(const value of feasibility){
   const row=value as {kind:string;context:unknown;detail:{canonicalInputs?:string;inputsDigest?:string}}
   if(row.kind!=='inputTuple')continue
   const evaluations=probe.evaluations.filter(e=>encode(e.context)===encode(row.context))
   assert.ok(evaluations.some(e=>e.canonicalInputs===row.detail.canonicalInputs&&
    (e.result as {inputsDigest:string}).inputsDigest===row.detail.inputsDigest),'witness is the actual full-body evaluation tuple')
  }
  return{after,probe,market,feasibility}
 }finally{m0WiringProbe.end();m0WiringTestApi.reset()}
}
function pair(boundary:Boundary){
 const off=arm(boundary,false),on=arm(boundary,true)
 assert.equal(encode(on.after),encode(off.after),'all policy output, including promises/receipts/employment and RNG')
 assert.equal(encode(on.probe.calls),encode(off.probe.calls),'helper and RNG call order/counts/stream keys')
 const semantic=(rows:typeof on.probe.evaluations)=>rows.map(({inputs,canonicalInputs,result})=>({inputs,canonicalInputs,result}))
 assert.equal(encode(semantic(on.probe.evaluations)),encode(semantic(off.probe.evaluations)),'actual receipt bytes/inputs unaffected')
 assert.equal(off.market.length,0);assert.equal(off.feasibility.length,0)
 return on
}
function callsInOrder(names:string[],wanted:string[]):void{
 let at=0;for(const name of names)if(name===wanted[at])at++
 assert.equal(at,wanted.length,'complete real full-body caller chain was reached')
}
function assertOrdinals(rows:readonly unknown[]):void{
 for(const value of rows){
  const row=value as {sequence:number;context:{caseSourceIndex:number;caseOccurrence:number;proposalSourceIndex:number;proposalOccurrence:number;phase:string;candidateOrdinal?:number;submittedOrdinal?:number;survivorOrdinal?:number}}
  const c=row.context
  for(const n of [c.caseSourceIndex,c.caseOccurrence,c.proposalSourceIndex,c.proposalOccurrence])assert.ok(Number.isInteger(n)&&n>=0)
  const ordinal=c.phase==='authorCandidate'?c.candidateOrdinal:c.phase==='freezeProposal'?c.submittedOrdinal:c.survivorOrdinal
  assert.ok(Number.isInteger(ordinal)&&ordinal!>=0)
 }
}
export function runFullBodyWiringControls(fixtures:WiringFixtures):void{
 assert.equal(fixtures.author196.state.market.tick,196);assert.equal(fixtures.freeze208.state.market.tick,208)
 const author=pair(fixtures.author196),freeze=pair(fixtures.freeze208)
 callsInOrder(author.probe.calls.map(c=>c.name),['advanceTalentMarketWeek','submitProposal','proposalDraft','authorRivalPromise','promiseFeasibility','receipt'])
 callsInOrder(freeze.probe.calls.map(c=>c.name),['advanceTalentMarketWeek','settleCase','attachedFeasibility','promiseFeasibility','receipt'])
 assert.ok(author.feasibility.length>0);assert.ok(freeze.feasibility.length>0)
 assertOrdinals(author.feasibility);assertOrdinals(freeze.feasibility)
 assert.ok(fixtures.offWeek.state.market.tick!==196&&fixtures.offWeek.state.market.tick!==208)
 const other=pair(fixtures.offWeek);assert.equal(other.market.length,0);assert.equal(other.feasibility.length,0)
 for(const fixture of [fixtures.opportunity196,fixtures.opportunity208]){
  assert.ok(fixture.state.market.tick===196||fixture.state.market.tick===208)
  const result=pair(fixture)
  callsInOrder(result.probe.calls.map(c=>c.name),fixture.state.market.tick===196
   ? ['advanceTalentMarketWeek','authorRivalPromise','promiseFeasibility','opportunityAssessment']
   : ['advanceTalentMarketWeek','settleCase','attachedFeasibility','promiseFeasibility','opportunityAssessment'])
 }
 for(const [kind,fixture] of [['subject',fixtures.offSubject],['issuer',fixtures.offIssuer196]] as const){
  assert.equal(fixture.state.market.tick,196)
  if(kind==='subject')assert.notEqual(fixture.descriptor.talentId,SUBJECT)
  else assert.ok(!['studio-aca408ec-r01','studio-aca408ec-r02','studio-aca408ec-r03'].includes(fixture.business.studioId))
  assert.ok(fixture.state.hollywood)
  const outcomes=[]
  for(const capture of [false,true]){
   const state=clone(fixture.state);m0WiringTestApi.reset();m0WiringProbe.begin(capture)
   try{
    const value=rivalProposalTrigger(state,state.hollywood!,clone(fixture.business),clone(fixture.descriptor),196)
    const trace=m0WiringProbe.end();assert.equal(trace.overflow,false)
    assert.equal(drainM0MarketDecisionRows().length,0,'trigger-specific off-target filter')
    outcomes.push({value,calls:trace.calls,rngState:state.rngState})
   }finally{m0WiringProbe.end();m0WiringTestApi.reset()}
  }
  assert.deepEqual(outcomes[0],outcomes[1])
 }
 for(const [kind,message] of [['row-cap','row bound exceeded'],['row-byte-cap','row byte bound exceeded'],
  ['total-byte-cap','total byte bound exceeded'],['serialization','recording failed']] as const){
  m0WiringTestApi.reset();m0WiringProbe.begin(true,kind)
  try{
   assert.throws(()=>advanceTalentMarketWeek(clone(fixtures.author196.state)),error=>
    error instanceof m0WiringTestApi.M0ObserverError&&error.message.includes(message),'actual recorder failure must cross actual submitProposal catch')
   const trace=m0WiringProbe.end();assert.equal(trace.overflow,false)
   assert.deepEqual(trace.faultReached,{kind,phase:'draftPrice'})
   callsInOrder(trace.calls.map(c=>c.name),['advanceTalentMarketWeek','submitProposal','proposalDraft'])
  }finally{m0WiringProbe.end();m0WiringTestApi.reset()}
 }
 m0WiringTestApi.reset();m0WiringProbe.begin(true,'ordinary-refusal')
 try{
  advanceTalentMarketWeek(clone(fixtures.author196.state))
  const trace=m0WiringProbe.end();assert.equal(trace.overflow,false)
  assert.deepEqual(trace.faultReached,{kind:'ordinary-refusal',phase:'submitProposal'})
  const rows=drainM0MarketDecisionRows() as {phase:string;detail:{outcome?:string;refusal?:string}}[]
  assert.ok(rows.some(row=>row.phase==='issuerAttempt'&&row.detail.outcome==='SUBMISSION_REFUSED'&&
   row.detail.refusal==='M0 wiring ordinary submission refusal fixture'),'ordinary gameplay refusal stays a refusal')
 }finally{m0WiringProbe.end();m0WiringTestApi.reset()}
}
''')
mutant=derivatives['src/core/talentMarket.ts'].replace('        if (error instanceof M0ObserverError) throw error','        // Expected RED: typed observer failure swallowed by original gameplay catch')
assert mutant!=derivatives['src/core/talentMarket.ts'];put('mutants/typed-propagation-removed-talentMarket.ts',mutant)
put('FIXTURE-ROLES-UNFILLED.json',j({'schema':'1370-m0-full-body-wiring-fixture-roles-held/v1','actualM0Types':None,
 'author196':None,'freeze208':None,'offWeek':None,'opportunity196':None,'opportunity208':None,'offSubject':None,'offIssuer196':None,
 'controlExecutionGrant':None,'operationalProtection':None,'runtimeTools':None,'recordedRoute':None,'executionAuthorization':False}))
plan={'schema':'1370-m0-real-full-body-next-slice/v1','status':'HELD_FULL_MODULE_DERIVATIVE_AND_CONTROLS_API_FIXTURE_AND_LOADER_INTEGRATION_UNSETTLED',
 'executionAuthorization':False,'executionPerformed':False,'actualM0TypesAccepted':False,'actualWiringAccepted':False,
 'sourceAuthorities':B['sourceAuthorities'],'fullModuleSourceRoles':source_roles,
 'typesSourceIndependentReview':{'path':str(review),'bytes':len(reviewraw),'sha256':sha(reviewraw)},
 'selectedSourceCommit':B['historicalM0SourceCommit'],'historicalAdmissionHead':B['historicalDataAuthorityHead'],
 'operationalHead':'8cb704e2f18e6a635943893422c9cfdc206e106d','productionSourceTree':B['productionSourceTree'],
 'neutralSourceUnmodified':True,'privateMirrorReadOrModified':False,'fullBodyChains':{
  '196':['advanceTalentMarketWeek','submitProposal','proposalDraft','authorRivalPromise','promiseFeasibility','receipt'],
  '208':['advanceTalentMarketWeek','settleCase','attachedFeasibility','promiseFeasibility','receipt'],
  'opportunity196':['advanceTalentMarketWeek','authorRivalPromise','promiseFeasibility','opportunityAssessment'],
  'opportunity208':['advanceTalentMarketWeek','settleCase','attachedFeasibility','promiseFeasibility','opportunityAssessment']},
 'filterContracts':{'authorAndTrigger196':'target subject and three exact issuers','draftPriceAndPriceAt':'target subject,196/208; not issuer-filtered','freeze208':'all submitted proposals of target case; not limited to three issuers','offWeek':'market record returns and feasibility caller contexts absent outside196/208'},
 'remainingUnknowns':[
  'actual current M0 types/collection outcome and full protection admission (root work in progress)',
  'authenticated actual196/208 already-incremented pre-market GameState boundary fixtures; returned195/207 states are different inputs',
  'minimal explicitly labelled fixture variants that force real authoring and freeze opportunityAssessment without replacing candidate/helper policy',
  'valid full-state/business/descriptor fixtures for196 off-subject and off-issuer trigger filters; no universal off-issuer observer suppression is valid',
  'reviewed test-only runtime module resolution/projection: whole-module derivative imports must resolve untouched helpers against admitted M0 without duplicated module identity; never transplant derivatives into neutral mirror',
  'separate exact recorded controls route/tool/grant and meaningful mutant RED after source/fixture integration'],
 'controlsReadyForRuntime':False,'codeParsingClaim':'Python source builder parsed by interpreter; generated TypeScript has NOT been parsed, compiled, imported or run',
 'bounds':{'existingObserverRows':512,'existingObserverRowBytes':16384,'existingObserverTotalBytes':2097152,
  'testProbeEntries':16384,'testProbeRowBytes':65536,'testProbeTotalBytes':2097152,
  'clockAndRecorder':'reuse qualified300/320/330 only in a later reviewed exact route; no route/timing acceptance here'}}
put('NEXT-SLICE.json',j(plan))
put('SOURCE-PROOF.json',j({'schema':'1370-m0-full-body-derivative-source-proof/v1','fullModulesRetained':list(derivatives),'patches':patches,
 'originalTypedCatchByteIdentical':True,'wholeByteForwardInverseVerified':True,'diffRoles':diffroles,'generatedSourceExecuted':False,
 'privateMirrorRead':False,'sourceClaim':'Full implementations and imports preserved with explicit test probes, capture toggles and single-use faults; fixture/loader integration remains held.'}))
put('NEXT-STEPS.md','''# Real full-body M0 observer controls: next bounded implementation

This package supplies five complete derivative modules, one shared test probe, and a controls API. It executes no source and grants no runtime. The neutral five-overlay manifest4c4/source292d and admitted M0 mirror remain unchanged. Historical function-only ec85 and stub-catch2586 are source leads only and are not counted as full-body qualification.

First admit actual M0 types/collection and full protection. Then settle the exact test-only module resolution and fixtures below. The controls API imports complete modules and executes real advanceTalentMarketWeek,submitProposal,authorRivalPromise,settleCase,attachedFeasibility,promiseFeasibility and opportunityAssessment. No function-body extraction, gameplay mock, source install into the neutral arm or RNG replacement is used.

The actual tick calls the market after incrementing the week and after earlier weekly phases. The boundary consumer at the top of the complete advanceTalentMarketWeek may record a structuredClone of that actual caller state at196/208 and a non-target week in a separately granted bounded setup. A returned195/207 state cannot be passed off as that196/208 boundary. The exact source/metadata and capture-generation role must be admitted before fixtures are consumed. This package does not generate or decode them.

Keep probe inactive while building prefix fixtures, and preserve default accepted capture behavior. Boundary capture should record only the finite requested states; no full416 game is needed just to prepare controls. Prefix work and all variants remain within a separately reviewed qualified300/320/330 recorded route. Elapsed time and cap sufficiency are unknown; do not extend clocks or promote a runtime claim from this source.

Run capture on/off from independent structuredClone inputs. Compare whole returned GameState bytes, original caller purity, all captured helper/RNG call sequences and derived-stream keys, actual canonical inputs and returned receipt bytes. Correlate existing inputTuple witness rows to evaluations captured after actual receipt canonical serialization. Case/proposal indices, occurrence and candidate/submitted/survivor ordinals remain checked as existing context facts. Full submitted/dropped/survivor and chooser ordering assertions need fixture-authenticated source-array projections during integration; the current ordinal nonnegative checks alone do not certify those orders.

The natural196 count candidate may succeed before opportunity candidates are reached. An explicit valid fixture variant must make the real author loop reach opportunityAssessment. A208 variant must carry a real attached opportunity promise so attachedFeasibility reaches that same evaluator. Reusing a direct opportunityAssessment test would miss both callers. No fixture or outcome is invented here; these two exact fixture constructions remain unresolved.

Off-target assertions follow actual phase filters. Author/trigger196 require the target and three issuers. draftPrice/priceAt observe a target at196/208 without an issuer filter. Freeze208 records all submitted proposals in the target case. Thus offIssuer196 below tests the trigger filter specifically; it must not be generalized to freeze208 or price recording. Supply a valid actual state/business/descriptor premise, including an explicitly labelled synthetic parameter variant if no naturally entered fourth issuer exists.

Four single-use draftPrice faults exercise the actual market recorder row cap,row-byte cap,total-byte cap and JSON cycle. They arise inside the complete submitProposal call and must pass the actual typed catch unchanged. Injected counters are restored in finally so removing the typed catch causes a specific failure to propagate, rather than a later outside-catch cap throw falsely satisfying RED. An ordinary single-use submission refusal checks the existing gameplay refusal path. The held mutant removes only the typed catch gate; the independently authored expected RED must specifically fail the propagated-failure assertion, never a loader/fixture/timeout failure.

Whole-module imports need a reviewed resolver mapping original M0 logical IDs to these selected complete derivatives and mapping untouched imports to the admitted M0 tree with one canonical module identity. The two copied public originals (RNG/employment) were authenticated against e9f facts; production bodies were only read, not changed. No mirror replication or private inventory was performed. A resolver implementation and standalone test registration are deliberately not claimed ready until these fixture and module-identity contracts are settled.
''')
put('LESSONS.md','''# Recorded lessons

The196/208 caller chains matter. Passing promiseFeasibility or an extracted submit catch does not prove authoring or settlement wiring. Complete module identity must be retained, including cyclic market/promise imports and untouched dependencies.

Filter scope is call-site-specific: a target208 freeze has no three-issuer filter, and price recorder sites also lack it. A blanket off-issuer no-row expectation would reject correct source or conceal a false oracle.

A single-use fault must restore injected recorder counters. Otherwise a mutant that swallows the inside-submit error can throw again at a later issuerAttempt, giving a false propagation GREEN. The derivative retains the real typed class and catch; it does not throw a preconstructed observer error from a fake submitProposal.

Full function bodies and byte inverse proofs still do not establish actual fixture premises, TypeScript/import compatibility, helper/RNG neutrality or runtime success. Source work records those unknowns honestly. Real opportunity fallback fixtures and the already-incremented pre-market boundary are essential remaining inputs.

The test evaluation envelope contains both the raw tuple and its canonical string, plus the returned result and context. Its separate64KiB row cap allows that duplicated test evidence without changing the accepted16KiB observer cap. Probe overflow is sticky and fails the consumer; it never changes a gameplay return or is silently accepted as complete tracing. Aggregate probe2MiB and entry16384 bounds remain explicit, with actual sufficiency unmeasured. The initial source draft remains preserved.
''')
put('BUILD-SOURCE.py',pathlib.Path(__file__).read_bytes())
paths=sorted(p for p in P.rglob('*') if p.is_file())
pins={'schema':'1370-m0-full-body-wiring-source-pins/v1','files':{str(p.relative_to(P)):{'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in paths},'executionAuthorization':False}
pinrole=put('SOURCE-PINS.json',j(pins))
seal=put('SEAL.json',j({'schema':'1370-m0-full-body-wiring-held-source-seal/v1','status':plan['status'],'sourcePins':pinrole,'executionAuthorization':False,'executionPerformed':False,'actualControls':None,'actualMutantRed':None,'actualTypes':None,'actualNeutrality':None,'actualGrant':None}))
for p in P.rglob('*'):
 if p.is_file():p.chmod(0o444)
print(j({'package':str(P),'sourcePins':pinrole,'seal':seal,'files':len(pins['files'])+2,'remainingUnknowns':plan['remainingUnknowns']}))
