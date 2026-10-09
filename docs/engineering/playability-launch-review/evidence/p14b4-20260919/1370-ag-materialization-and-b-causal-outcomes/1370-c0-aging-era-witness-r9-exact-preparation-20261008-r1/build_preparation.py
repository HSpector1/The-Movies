"""Scratch-only r9 authoring from accepted r8-r2 procedures. Never executes fill/adopt."""
from pathlib import Path
import ast,difflib,hashlib,json,os,stat
S=Path('/Users/zacheryspector/studio-scratch');HERE=Path(__file__).resolve().parent
OLD=S/'1370-c0-aging-era-witness-r8-exact-preparation-20261008-r2'
SOURCE=S/'1370-c0-aging-era-employment-witness-source-r9-devnull-proposal-20261008-r1'
WIRING=S/'1370-c0-aging-era-employment-witness-r9-devnull-preparation-20261008-r1'
PINS='584e5cc9ba3c0bd4f7a82e7bf0ddae60f74b45e757e93c50ee4c1fb5a5453759'
REVIEW='9652d41c68cf1adcbc6614702226a49ed5c49b4cbabd3857f96baa9134c1c75f'
DESIGN='b0983e174b93ee8ebc6964c83517e46a0cd43bdc40ff5c822ec0c551ed8d705d'
def sha(b):return hashlib.sha256(b).hexdigest()
def enc(v):return (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
def put(name,b):
 if not isinstance(b,bytes):b=enc(b)
 fd=os.open(HERE/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o644)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o644);f.write(b);f.flush();os.fsync(f.fileno())
 return sha(b)
oldraw=(OLD/'PREPARATION-PINS.json').read_bytes();assert sha(oldraw)=='077ef3087757fde8db18777347a611a81f5454f95dfc654d866a00a5bcad65e9'
for n,h in json.loads(oldraw)['files'].items():assert sha((OLD/n).read_bytes())==h
assert sha((SOURCE/'SOURCE-PINS.json').read_bytes())==PINS
newpins=json.loads((SOURCE/'SOURCE-PINS.json').read_bytes())
replacements={
 '1370-c0-aging-era-employment-witness-source-r8-diagnostic-proposal-20261008-r1':SOURCE.name,
 '1370-c0-aging-era-employment-witness-r8-diagnostic-controls-preparation-20261008-r1':WIRING.name,
 'bounded-sink-r8-proposed.py':'bounded-sink-r9-proposed.py',
 'launch-pipeline-r8-proposed.sh':'launch-pipeline-r9-proposed.sh',
 '1370-c0-aging-era-employment-witness-r8-exact-draft-20261008-r1':'1370-c0-aging-era-employment-witness-r9-exact-draft-20261008-r1',
 '1370-c0-aging-era-employment-witness-r8-pre-adoption-archive-20261008-r1':'1370-c0-aging-era-employment-witness-r9-pre-adoption-archive-20261008-r1',
 '1370-c0-aging-era-employment-witness-r8-adoption-output-20261008-r1':'1370-c0-aging-era-employment-witness-r9-adoption-output-20261008-r1',
 '1370-c0-aging-era-employment-witness-r8-lane-20261008-r1':'1370-c0-aging-era-employment-witness-r9-lane-20261008-r1',
 'witness-r8.lane.log':'witness-r9.lane.log',
 '1370-c0-aging-era-employment-witness-independent-static-review-r8':'1370-c0-aging-era-employment-witness-independent-static-review-r9',
 '0d8e9d26fecfdf4765267b9e4a2708418870551a0a80b96abfaadc5290375715':PINS,
 '0df56d411ea22b65e3407b27abe161481acaa06ca4cc7dede11656faa41e8da0':REVIEW,
 '38afc47e8bcb834df333f2834fdf4a6f5bd3f3826d96c8fce02a9c72d164a16f':'0ebc508d9a181b1071769399c62baa86fbe2d2c20678c8590c79e969b68d5bd4',
 '0d9a5bf7e187e141bccc20a1b65740bedd3a67a926b6c7eb873f3df74c78982a':'9bd9fa9f1bc00712d000bd73097de8db930bfcab87c47dbefee2017725aaa8ef',
 '1370-witness-r8-':'1370-witness-r9-',
 '1370-r8-':'1370-r9-',
}
def replace(t):
 for a,b in replacements.items():t=t.replace(a,b)
 return t
config=json.loads(replace((OLD/'CONFIG-PENDING.json').read_text()))
config['schema']='1370-witness-r9-exact-preparation-config-r1'
config['acceptedFrozenPostflight']['path']=str(S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2/evidence/postflight-r8-r1/SNAPSHOT.json')
config['acceptedFrozenPostflight']['sha256']='07b785480707a2c972dbdba4b0865461507939c1891f8b5386c40a375dab105e'
def role(p,h):
 assert sha(p.read_bytes())==h
 return {'path':str(p),'sha256':h,'mode':format(stat.S_IMODE(p.lstat().st_mode),'04o')}
config['roles']['parentDevNullOperationalDesign']=role(S/'1370-c0-aging-era-employment-witness-null-device-parent-design-adoption-20261008-r1/ADOPTION.json',DESIGN)
config['roles']['acceptedFrozenPostflightReview']=role(S/'1370-c0-aging-era-employment-witness-r8-observed-stop-full-postflight-independent-review-20261008-r1/RECEIPT.json','9bc5f3d9ccff1625c3af8532a9153e3385933cc7848bde0f9eb17be97af3e0e5')
config['scope']['fullInventoryReuse']='Parent authorized accepted r8 full postflight immutable baseline reuse while HEAD4812/copied source stay frozen; no actual procedure while another game lane is active. Fresh exact files/roles/current strict roots/FD/worker/ref/AC/disk gates remain required.'
binding=json.loads(replace((OLD/'BINDING-TEMPLATE-PENDING.json').read_text()))
binding['observerSha256']={n:newpins['files'][n]['sha256'] for n in binding['observerSha256']}
config['bindingTemplateSha256']=put('BINDING-TEMPLATE-PENDING.json',binding)
launch=json.loads(replace((OLD/'LAUNCH-SPEC-TEMPLATE.json').read_text()))
launch['roles']=config['roles'];launch['claimLimit']='Unrun r9 operational exact template. Narrow literal /dev/null data exception under unchanged global regular-file write/metadata denial; fresh character-device identity guard before Popen. Game/fixture/frame/digests/bounds/cleanup unchanged. Source accepted; independent exact review, three-field adoption and fresh adopted preflight required.'
config['launchTemplateSha256']=put('LAUNCH-SPEC-TEMPLATE.json',launch)
configsha=put('CONFIG-PENDING.json',config)
parentgate="""\n operational=config['roles']['parentDevNullOperationalDesign'];design_raw,_=read(operational['path']);require(sha(design_raw)==operational['sha256'],'parent null-device design bytes');design=json.loads(design_raw)
 require(r.get('parentOperationalDesignAdoption')=={k:operational[k] for k in ('path','sha256')},'source acceptance parent operational role')
 require(design.get('decision')=='ADOPT_NARROW_NULL_DEVICE_OPERATIONAL_DESIGN_SOURCE_PREPARATION_ONLY' and design.get('proposedPolicySha256')==pins['files']['POLICY.sb']['sha256']=='8e5756225a70618c763bc888a62c7ba1e1f8382d10392f21be5766fbb96a24b5','narrow accepted null-device policy role')
 require(r.get('actualToolExit')==0 and r.get('actualControls')=={'allGroupsClearedFresh':True,'fullFixtureUnchanged':True,'newPolicyDeniedRegularMutations':5,'newPolicyReadonlyGreen':5,'noSandboxedPython':True,'originalPolicyRed':2,'ownedFixtureSetup':5},'actual null-device policy RED/GREEN/regular denial control acceptance')\n"""
postgate="""\n review_role=config['roles']['acceptedFrozenPostflightReview'];review_raw,_=read(review_role['path']);require(sha(review_raw)==review_role['sha256'],'accepted full postflight review bytes');review=json.loads(review_raw)
 require(review.get('decision')=='STOP_OBSERVED_NO_FRAME_FULL_POSTFLIGHT_ACCEPTED' and review.get('fullPostflightSnapshotSha256')==p['sha256'] and review.get('fullBaselineSha256')==p['baselineSha256'] and review.get('productionHead')==config['productionHead'] and review.get('fullImmutableBaselineEqual') is True and review.get('productionSourceCopyAndDependencyProofAccepted') is True,'accepted frozen r8 postflight review role')\n"""
for name in ('fill_actual_candidate.py','adopt_reviewed_candidate.py'):
 t=replace((OLD/name).read_text()).replace("CONFIG_SHA='0c481e8f81375e306ccbe44fd96c4695df3b2f952a1a3fec47f967dbe550e922'","CONFIG_SHA="+repr(configsha))
 needle=" return {'path':str(role_path),'sha256':approved_sha,'mode':config['roles']['witnessSourceReview']['mode']}";assert t.count(needle)==1;t=t.replace(needle,parentgate+needle)
 needle=" require(all(config['scope'][k] is True";assert t.count(needle)==1;t=t.replace(needle,postgate+needle)
 t=t.replace('exact r7 candidate','exact r9 candidate').replace("'r7 source pins'","'r9 source pins'").replace("'r7 source file '","'r9 source file '")
 ast.parse(t);put(name,t.encode())
check=(OLD/'check_source_constants.py').read_text();put('check_source_constants.py',check.encode())
recipe=json.loads(replace((OLD/'FILL-RECIPE.json').read_text()));recipe['argv'][2]=str(HERE/'fill_actual_candidate.py');recipe['claimLimit']='Fill only after independent procedure acceptance and parent lane grant. Do not execute fill/guards while any other game lane is active. No launch/adoption/game; root reviews resulting exact bytes.';put('FILL-RECIPE.json',recipe)
diff=''.join(''.join(difflib.unified_diff((OLD/n).read_text().splitlines(True),(HERE/n).read_text().splitlines(True),fromfile='accepted-r8-r2/'+n,tofile='prepared-r9-r1/'+n)) for n in ('fill_actual_candidate.py','adopt_reviewed_candidate.py','CONFIG-PENDING.json','BINDING-TEMPLATE-PENDING.json','LAUNCH-SPEC-TEMPLATE.json','FILL-RECIPE.json'))
put('PROCEDURE-DIFF.patch',diff.encode())
print(json.dumps({'status':'AUTHORING_ONLY_UNRUN','configSha256':configsha,'fillProcedureSha256':sha((HERE/'fill_actual_candidate.py').read_bytes()),'adoptionProcedureSha256':sha((HERE/'adopt_reviewed_candidate.py').read_bytes()),'candidatePath':config['candidatePath']}))
