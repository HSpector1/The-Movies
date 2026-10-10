import hashlib,json,os,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-an-exact-identity-json-controls-parent-recorded-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
rp=S/'1370-an-exact-identity-json-controls-independent-observed-review-20261010-r1/RECEIPT.json';rr=role(rp);assert rr['sha256']=='113d10553caccefa0d3248eaf9507d6768db961933c3d697b3004e8e2539b353';r=read(rp)
assert r['decision']=='ACCEPT_ACTUAL_EXACT_IDENTITY_JSON_PURE_CONTROLS_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
br=role(P/'READBACK.json');assert br['sha256']=='e12da8f225f30e06caf072d56797b2d420b98cac682ff9bad585297031ff96e4';b=read(br['path']);assert b['toolSessionId']==91619 and b['toolExit']==0 and b['caseCount']==32 and b['allSpecificControlsPassed'] and b['laneReleased']
for key in ('result','actualTool','parserSource','controlsSource'):assert role(b[key]['path'])==b[key]
v=read(b['result']['path']);assert v['status']=='PASS_EXACT_IDENTITY_JSON_PURE_CONTROLS_ALL_CASES_ONLY' and v['caseCount']==32 and v['game'] is False and v['privateM0ReadOrWritten'] is False
assert r['result']==b['result'] and r['actualTool']==b['actualTool']
out={'schema':'1370-root-exact-identity-json-controls-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_EXACT_IDENTITY_JSON_CONTROLS_ONLY','actualExit':0,'independentObservedReview':rr,'readback':br,**{k:b[k] for k in ('result','actualTool','parserSource','controlsSource')},'caseCount':32,'soleLaneReleased':True,'executionAuthorization':False,'game':False,'privateM0ReadOrWritten':False,'scope':'The actual finite32 public exact-JSON controls only. No full-function fixture, mutant or neutrality acceptance.'}
p=A/'PARSER-CONTROLS-OBSERVED-ADOPTION.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
