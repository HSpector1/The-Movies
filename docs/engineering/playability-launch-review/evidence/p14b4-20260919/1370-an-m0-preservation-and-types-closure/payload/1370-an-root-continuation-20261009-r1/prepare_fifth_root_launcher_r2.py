import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
old=(A/'run_fullfunction_fourth_once.py').read_text();new=old
changes=[
 ('1370-an-m0-fullfunction-qualification-source-20261010-r11','1370-an-m0-fullfunction-qualification-source-20261010-r12'),
 ('1370-an-m0-fullfunction-parent-source-20261010-r4','1370-an-m0-fullfunction-parent-source-20261010-r5'),
 ('18b014711ab516c421e5ade49a6cea9757f34ba9aa85f896e126087be3349b36','79d9400a49dc02abc836d9e3b9e9f4a814966da47cae67293f299b1993deb283'),
 ('bbd9477ee57d96fbf4b325277542819725cff0d707418aea6acd038d10d55618','541be09dd5c5d0232ce19653c700115b440f2e3e599e9f919cb5f7624ca74a0b'),
 ('1370-an-m0-fullfunction-parent-independent-source-review-20261010-r4','1370-an-m0-fullfunction-parent-independent-source-review-20261010-r5-r2'),
 ('6ebdd529dbb7d5a1fff2483c72eff328230dbac794da9ea35928fd47213fd86d','b29b7f890250b749ea6bda0d7a4751016c75a684945021a6bdb22cee4e3b274a'),
 ('M0-FULLFUNCTION-R4-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R5-CURRENT-PROTECTION.json'),
 ('FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R4.json','FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R5.json'),
 ('1370-an-m0-fullfunction-parent-recorded-20261010-r4','1370-an-m0-fullfunction-parent-recorded-20261010-r5'),
 ('FULLFUNCTION-ROOT-BINDING-R4.json','FULLFUNCTION-ROOT-BINDING-R5.json')]
for a,b in changes:assert new.count(a)==1;new=new.replace(a,b)
anchor="rt=checked(A/'FULLFUNCTION-RUNTIME-TOOLS.json'"
assert new.count(anchor)==1
block="""lossless=checked(A/'LOSSLESS-CONTROLS-OBSERVED-ADOPTION.json','fa668549c4526317f1c5f7f17494ae3bdaec2f6713e6b72351f30d384cfa096a');lv=read(lossless['path'])
assert lv['schema']=='1370-root-lossless-trace-controls-observed-adoption/v1' and lv['status']=='ROOT_ADOPTED_ACTUAL_LOSSLESS_TRACE_49_CONTROLS_ONLY' and lv['actualExit']==0 and lv['caseCount']==49 and lv['positiveCount']==9 and lv['specificNegativeCount']==40 and lv['soleLaneReleased'] is True and lv['executionAuthorization'] is False and lv['game'] is False and lv['fullBodyGameAssertionsExecuted'] is False
for key in ('independentObservedReview','readback','result','actualTool','implementationSourcePins','implementationSourceReview','controlsSourcePins','controlsSourceReview','sourceReviewedFullBodyTemplate'):assert role(lv[key]['path'])==lv[key]
assert read(lv['independentObservedReview']['path'])['decision']=='ACCEPT_ACTUAL_PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_CONTROLS_ONLY'
assert lv['sourceReviewedFullBodyTemplate']==pins['files']['FULL-BODY-CONTROLS-TEMPLATE.ts']
for key in ('m0TraceCodec.mjs','m0WiringProbe.ts','ordering.ts','traceSequences.mjs'):assert lv['inputRoles'][key]==pins['files'][key]
config=read(Q/'CONFIG.json');assert config['actualLosslessControlsObservedAdoption']==lossless
for name in config['runtimeSourceReviewAliases']:assert read(sr['path'])['sourcePins'][name]==read(sr['path'])['routeSourcePins'][name]==pins['files'][name]
"""
# Read exact alias contract from the actual R12 RECIPE, not CONFIG.
recipe=json.loads((A.parent/'1370-an-m0-fullfunction-qualification-source-20261010-r12/RECIPE.json').read_bytes())
assert len(recipe['reviewAliases'])==15 and 'm0TraceCodec.mjs' in recipe['reviewAliases']
block=block.replace("config['runtimeSourceReviewAliases']", "read(Q/'RECIPE.json')['reviewAliases']")
aliasKeys=['RECIPE.reviewAliases']
new=new.replace(anchor,block+anchor)
needle="'parserControlsAdoption':parser,"
assert new.count(needle)==2
new=new.replace(needle,needle+"'losslessControlsObservedAdoption':lossless,")
back=new.replace(needle+"'losslessControlsObservedAdoption':lossless,",needle)
assert back.count(block)==1;back=back.replace(block,'')
for a,b in reversed(changes):assert back.count(b)==1;back=back.replace(b,a)
assert back==old;compile(new,'run_fullfunction_fifth_once.py','exec')
p=A/'run_fullfunction_fifth_once.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
v={'schema':'1370-root-fullfunction-fifth-source-delta/v1','sourceOnly':True,'executionAuthorization':False,'baseSha256':hashlib.sha256(old.encode()).hexdigest(),'updated':{'path':str(p),'bytes':len(new.encode()),'sha256':hashlib.sha256(new.encode()).hexdigest()},'changes':changes,'addedObservedLosslessGate':block,'losslessRolePassedIntoSourceAdoptionAndRootBinding':True,'wholeInverseExact':True,'futureSourceReviewPassedExternally':True}
q=A/'FULLFUNCTION-R5-ROOT-SOURCE-DELTA.json'
with q.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(json.dumps({'delta':str(q),'launcher':v['updated'],'configAliasKey':aliasKeys[0]}))
