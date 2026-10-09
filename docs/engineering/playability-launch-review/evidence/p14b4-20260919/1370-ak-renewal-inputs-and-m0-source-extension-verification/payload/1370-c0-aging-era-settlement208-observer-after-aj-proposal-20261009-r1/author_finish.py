"""Scratch source authoring only; does not import or execute any proposal source."""
from pathlib import Path
import ast, difflib, hashlib, json, os, stat
S=Path('/Users/zacheryspector/studio-scratch')
D=Path(__file__).resolve().parent
B=S/'1370-c0-aging-era-employment-witness-source-r9-devnull-proposal-20261008-r1'
G=S/'1370-c0-renewal208-input-gap-and-minimal-observer-design-20261009-r1'
sha=lambda b:hashlib.sha256(b).hexdigest()
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 raw=p.read_bytes();assert len(raw)<=16*1024**2
 return {'path':str(p),'bytes':len(raw),'sha256':sha(raw)}
def checked(r):
 assert role(r['path'])==r
 return Path(r['path']).read_bytes()
def put(n,b):
 if isinstance(b,str):b=b.encode()
 fd=os.open(D/n,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def jout(n,x):put(n,json.dumps(x,sort_keys=True,indent=2)+'\n')
factsrole=role(G/'FACTS.json');assert factsrole['sha256']=='d928be4e8022203f4c0c86fe1c8196397c41f04e89fc984b1133693812988044'
facts=json.loads(checked(factsrole))
baserole=role(B/'SOURCE-PINS.json');assert baserole['sha256']=='584e5cc9ba3c0bd4f7a82e7bf0ddae60f74b45e757e93c50ee4c1fb5a5453759'
base=json.loads(checked(baserole));old={n:(B/n).read_bytes() for n in base['files']}
assert all(sha(old[n])==r['sha256'] and len(old[n])==r['bytes'] for n,r in base['files'].items())
# Two small author-time repairs before source is sealed; no proposal code runs.
t=D/'test-settlement208.mjs';t.write_text(t.read_text().replace('reads++;return40','reads++;return 40'))
for name in ('supervise.py','outer-recorder.py'):
 p=D/name;text=p.read_text()
 needle="    raw = base64.b64decode(frame['settlement208Base64'], validate=True)"
 replacement="    encoded = frame['settlement208Base64']\n    if not isinstance(encoded, str) or len(encoded) > 4 * ((64 * 1024 + 2) // 3):\n        raise ValueError('a208-encoded-cap')\n    raw = base64.b64decode(encoded, validate=True)"
 assert text.count(needle)==1;text=text.replace(needle,replacement);ast.parse(text);p.write_text(text)
R=Path(facts['roles']['A_tick.ts']['path']).parent
external={
 'baseR9SourcePins':baserole,
 'baseR9IndependentSourceReview':role(S/'1370-c0-aging-era-employment-witness-independent-static-review-r9/RECEIPT.json'),
 'baseR9ObservedReview':role(S/'1370-c0-aging-era-employment-witness-r9-observed-independent-review-20261009-r1/RECEIPT.json'),
 'renewalGapFacts':factsrole,'renewalGapInputPins':role(G/'INPUT-PINS.json'),
 'renewalGapDesign':role(G/'RECEIPT.json'),
 'independentGapDesignReview':role(S/'1370-c0-renewal208-input-gap-independent-design-review-20261009-r1/RECEIPT.json'),
 'parentGapDesignAdoption':role(S/'1370-c0-renewal208-design-parent-adoption-20261009-r1/ADOPTION.json'),
 'parentPremiumFloorSourceAdoption':role(S/'1370-c0-renewal208-premium-floor-parent-adoption-after-aj-20261009-r1/ADOPTION.json'),
 'parentSingleDrawNumericAdoption':role(S/'1370-c0-renewal208-r03-2-first-draw-parent-recorded-after-aj-20261009-r1/WITNESS-ADOPTION.json'),
 'AJPublishedReadback':role(S/'1370-aj-checkpoint-root-finalization-20261009-r1/PUSH-READBACK.json'),
 'AEmployment':facts['roles']['AEmployment'],
 'A_tick.ts':facts['roles']['A_tick.ts'],
 'A_talentMarket.ts':facts['roles']['A_talentMarket.ts'],
 'A_employment.ts':facts['roles']['A_employment.ts'],
 'A_worldgen.ts':facts['roles']['A_src/core/worldgen.ts'],
 'A_talentSummary.ts':role(R/'talentSummary.ts'),
 'A_tuning.ts':role(R/'tuning.ts'),
 'A_promises.ts':role(R/'promises.ts'),
 'A_hollywood.ts':role(R/'hollywood.ts')}
raws={k:checked(v) for k,v in external.items()}
assert external['parentPremiumFloorSourceAdoption']['sha256']=='ef30c2fd1be9e503e3b4cc45ffdefb940566f770614fbd2c072c77e1181c3a1d'
assert external['parentSingleDrawNumericAdoption']['sha256']=='7bb25980c62442674200b3a3e4b9067d740858d70efa44a332a0e65d6226ccb3'
aj=json.loads(raws['AJPublishedReadback']);assert aj['head']==aj['remoteWorkingRef']=='f0fb818fe7534c3e3784206d16728b015c7f059a' and aj['clean'] is True
selection=json.loads((D/'SELECTION.json').read_text())
assert len(selection['rows'])==16 and [x['sourceOrder'] for x in selection['rows']]==list(range(24,40))
def excerpt(key,first,last):
 lines=raws[key].decode().splitlines(True)
 return {'role':external[key],'firstLine':first,'lastLine':last,'exactText':''.join(lines[first-1:last])}
proof={'schema':'1370-a208-external-observer-phase-input-proof-r1','status':'SOURCE_ONLY_UNRUN_REQUIRES_INDEPENDENT_REVIEW',
 'executionAuthorization':False,'productionHeadAtPreparation':aj['head'],'productionSourceTree':aj['sourceTree'],
 'externalRoles':external,'selectionRole':role(D/'SELECTION.json'),
 'selected16ExactGapProjection':True,'original44AIdentityOccurrenceLocators':'16 unchanged paired renewal identities; sourceOrder24..39; occurrence0; each old row is unique and ends208',
 'pricingProjection':{'required':'id,role,age,fame,skills[primary discipline][six declared SKILL_ORDER keys].perceived',
 'excluded':['stored salary','legacy scalar skill','persona perceived','actual skill','secondary skills','evolved F1 persons'],
 'reason':'worldgen salaryCurve169-173 invokes primary roleOVR, whose skillVector reads only six perceived values; ageFactor reads age; key reads id. No helper is invoked by this observer.'},
 'phaseTransport':[
  'Tick release-career growth precedes materialized new-week age and finalized talent assignment.',
  'Tick terminal return directly invokes advanceTalentMarketWeek after advancePromisesWeek; no engine statement executes after market returns.',
  'advanceTalentMarketWeek passes evolving state through settlement; returned talent/pricing records are preserved. Its functions construct employment/account/market/promise/contract/ledger roots; no talent or talent-field assignments occur.',
  'For selected rival winners commitRivalWinner re-derives proposalPriceAt from the current precommit state, then writes business account and appended employment/receipts/ordinals; it spreads the same state talent. closeCase changes only talentMarket.',
  'The external wrapper serializes the selected persons from that returned state immediately before another natural tick. This is source transport of quote inputs, not observed quote-local capture or precommit availability/freeze evidence.'],
 'contextScope':'old and current employment, closed case, winner receipt, current winner business policy, deleted proposal count, bounded old termination receipts; no premium/floor calculation or promise-feasibility reconstruction.',
 'sourceExcerpts':[excerpt('A_tick.ts',928,941),excerpt('A_tick.ts',1037,1072),excerpt('A_tick.ts',1114,1145),excerpt('A_talentMarket.ts',195,244),excerpt('A_talentMarket.ts',345,354),excerpt('A_talentMarket.ts',921,946),excerpt('A_talentMarket.ts',978,1027),excerpt('A_talentMarket.ts',1159,1294),excerpt('A_worldgen.ts',158,174),excerpt('A_talentSummary.ts',50,57),excerpt('A_talentSummary.ts',70,126)],
 'terminalSourceLexicalCorroboration':{'noDirectTalentRootWrites':not any(s in raws['A_talentMarket.ts'].decode() for s in ['talent:', '.talent =', '.talent=']),
 'scope':'Corroboration over authenticated complete file, not a standalone dependency-closure proof. Independent review must inspect complete settlement call/write closure; source-only premium/floor supplement is separately adopted.'},
 'requiredActualAcceptance':'selected16 phase/person/context/frame/source/readback integrity; all original416/44/four digests/RNG controls; current protected proofs and owned process cleanup under separately reviewed exact binding. No pay causes before separate pure pricing verification.'}
jout('PHASE-INPUT-PROOF.json',proof)
plan='''SOURCE ONLY A208 observer proposal, no runtime binding or grant.

The accepted R9 witness-core is byte-identical, including firstQuote,416 normal ticks,44 employment rows, employment/settlement/receipt/takes digests and final RNG state. A separate external wrapper calls that same observer with a natural tick callback: it calls the real tick exactly once, immediately serializes selected data from returned week208, then returns that same state. The captured bytes are independent of all later state references. No quote, age, OVR, market predicate or RNG helper is invoked.

SELECTION freezes exactly the16 identities from admitted gap46d788/review12145/root8f29, A source-order24..39 and occurrence0. Person fields are id,role,age,fame and six primary perceived skill fields. Stored generation salary, legacy skill, persona perceived, secondary skills and F1 evolved persons are excluded. PHASE-INPUT-PROOF pins complete source roles and exact source excerpts establishing release-growth/aging before terminal pricing and preservation of these person fields through market settlement to tick return. It records source transport, not original quote-local measurement or precommit feasibility evidence.

Each row also captures old/current terms, case, winner receipt, current policy, empty current-proposal count and bounded old termination receipts. Current terms match the accepted A preimage by identity/occurrence/order with endedWeek null at208. Context is data only; no premium/floor value is computed. The newly available source-only premium/floor adoption and one-key numeric adoption are pinned as separate prerequisites, not as A208 observations or pay conclusions.

The frozen208 payload cap is64KiB, with4096 bytes per row, bounded native data strings/lists and byte admission before accumulated join/Buffer growth. Base64 transport guards refuse oversized encoded input before decode. The original512KiB total stdout cap and720/742/750 clocks/policy/dev-null/source-role/cleanup mechanisms stay unchanged. The JS wrapper's capture is included in the original720 inner deadline. Frame status retains existing candidate protocol and gains only settlement208Bytes/Rows/Sha256/Base64. Both transport layers require these roles and their phase/hash/size caps. Additional talentMarket/talentSummary/tuning blob/worktree guards explicitly bind source used by the new projection proof.

All original six synthetic ledger/guard tests and original outer controls are byte-identical. Supervisor synthetic fixture gets only required208 transport roles/new source-review schema; its original assertions remain. New authored seven JS groups test phase/seed, complete identity/order, duplicate/missing person/context, nonfinite/accessor/caps, deeply frozen state purity and exactly416 callback calls with an208 byte snapshot stable after209 mutation. Two pure Python transport methods test required fields, digest/count/phase/cap refusals. All UNRUN. The synthetic fixture uses authenticated employment records as inert data plus explicit synthetic40/50 pricing inputs; it does not measure or regenerate a person.

Binding operational inputs, independentSourceReviewReceipt,selected16InputReview,premiumFloorReview and actual grants remain null. AJ published readback f0fb is a predecessor/provenance record, not a future run authority. Root must independently accept source/controls, grant recorded synthetic controls, admit their actual outcomes, fill a fresh reviewed exact binding/current runtime authority with accepted reusable/private-root and protected-proof scopes, and grant one actual observer only after adopted preflight. No existing binding or consumed output is replayed. Full protected postflight and independent raw208/frame/full416 output review remain required by the authorized exact procedure.

No imports/tests/Node/game/compiler/pricing/RNG execution, full scan, Git or protected source/mirror mutation occurred while authoring. No observed/archive receipt scaffolding was authored. A208 vectors remain unmeasured and16 renewal causes unresolved in this proposal.
'''
put('PLAN.md',plan)
recipe={'schema':'1370-a208-source-control-recipe-r1','status':'SOURCE_ONLY_UNRUN','executionAuthorization':False,
 'sourceReview':None,'selected16InputReview':None,'operationalRuntimeAuthority':None,'controlsGrant':None,'witnessGrant':None,
 'productionHeadAtPreparation':aj['head'],'scope':'Author exact runtime and helper argv only after new source controls admission/current binding. Source proposal contains no autoexecute.',
 'prospectivePureCommands':[['PINNED_NODE20','--test',str(D/'test-synthetic.mjs'),str(D/'test-settlement208.mjs')],['PINNED_PYTHON','-I','-B','-m','unittest','test-supervisor.py','test-outer.py','test-settlement208-frame.py']],
 'controlsClockAndOwnership':'Reuse already qualified recorded helper/finite test recorder under concrete root grant; exact owned PID/group retention and suite bounds must be reviewed before actual controls. These placeholder commands are not granted runnable argv.',
 'actualWitnessBoundsUnchanged':{'inner':720,'supervisorStop':742,'supervisorWhole':750,'stdoutBytes':524288,'settlement208Bytes':65536,'settlement208RowBytes':4096},
 'sequence':['independent source/input/phase proof review','root exact recorded synthetic controls grant and observed admission','new exact filled binding/runtime/protected-root/current guard reviews and adoption','separate root actual once-only observer grant','full protected postflight and independent actual frame208+original416 controls review','future separately reviewed pure16 source-order pricing verification']}
jout('CONTROL-RECIPE-HELD.json',recipe)
# Exact changed-source diffs; new files are individually source-pinned below.
for n in ['witness.mts','supervise.py','outer-recorder.py','test-supervisor.py','BINDING-UNFILLED.json','PLAN.md']:
 put(n+'.diff',''.join(difflib.unified_diff(old[n].decode().splitlines(True),(D/n).read_text().splitlines(True),fromfile=str(B/n),tofile=str(D/n))))
def functions(raw):
 return {x.name:ast.dump(x,include_attributes=False) for x in ast.parse(raw).body if isinstance(x,(ast.FunctionDef,ast.ClassDef))}
unchanged={}
for n,changed in [('supervise.py',{'validate_source_review','validate_frame'}),('outer-recorder.py',{'validate_outer_frame'})]:
 before=functions(old[n]);after=functions((D/n).read_text());same=[k for k,v in before.items() if k not in changed and v==after[k]]
 assert len(same)==len(before)-len(changed),(n,same)
 unchanged[n]=same
for n in ['witness-core.mjs','bounds-guard.mjs','worktree-guard.mjs','POLICY.sb','test-synthetic.mjs','test-outer.py']:
 assert (D/n).read_bytes()==old[n]
check={'schema':'1370-a208-static-author-checks-r1','sourceOnly':True,'executionAuthorization':False,
 'base12FilesAuthenticated':True,'externalRolesAuthenticated':len(external),'originalR9CoreLedgerControlsAndSelectedSourceHelpersByteIdentical':True,
 'pythonUnchangedOwnershipClockPolicyCleanupFunctionASTs':unchanged,'newJSControlGroupsAuthored':7,'newPythonTransportMethodsAuthored':2,
 'sourceMapKeyOrdersLiteralExtractedFromPinnedTuning':True,'newNodeEngineCompilerHelperPricingRngCallsExecuted':False,
 'requiredObservedA208Role':None}
jout('STATIC-AUTHOR-CHECKS.json',check)
# Preserve the accepted fixed SOURCE_FILES contract, explicitly extended only by6 new finite source roles.
text=(D/'supervise.py').read_text();tree=ast.parse(text);sourcefiles=None
for node in tree.body:
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SOURCE_FILES' for t in node.targets):sourcefiles=ast.literal_eval(node.value)
assert sourcefiles is not None and len(sourcefiles)==18 and all((D/n).is_file() for n in sourcefiles)
for p in D.iterdir():
 if p.is_file():os.chmod(p,0o600)
def finiteitem(p):
 r=role(p);return {'bytes':r['bytes'],'sha256':r['sha256']}
manifest={'status':'FROZEN_UNRUN_UNLAUNCHABLE_SOURCE_REVIEW_REQUIRED','sourceSha':base['sourceSha'],'protocol':base['protocol'],
 'productionHeadAtPreparation':aj['head'],'productionSourceTree':aj['sourceTree'],'executionAuthorization':False,
 'independentSourceReviewReceipt':None,'operationalRuntimeAuthority':None,'controlsGrant':None,'witnessGrant':None,
 'files':{n:finiteitem(D/n) for n in sourcefiles},
 'supportFiles':{p.name:finiteitem(p) for p in sorted(D.iterdir()) if p.name not in sourcefiles},
 'externalRoles':external,'newPayloadBytesCap':65536,'newPayloadRows':16,'noGameOrSourceCallsExecuted':True}
jout('SOURCE-PINS.json',manifest)
print(json.dumps({'directory':str(D),'sourcePins':role(D/'SOURCE-PINS.json'),'sourceFiles':len(sourcefiles),'supportFiles':len(manifest['supportFiles']),
 'observer':role(D/'settlement208-core.mjs'),'witness':role(D/'witness.mts'),'newControls':role(D/'test-settlement208.mjs'),'phaseProof':role(D/'PHASE-INPUT-PROOF.json'),'status':'FROZEN_SOURCE_ONLY_UNRUN'},indent=2))
