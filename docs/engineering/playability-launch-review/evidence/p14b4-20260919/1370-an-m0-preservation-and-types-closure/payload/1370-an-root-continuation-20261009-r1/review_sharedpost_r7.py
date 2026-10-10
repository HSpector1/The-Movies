import ast,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
for folder,h,out,decision,allowed in [('1370-an-fullfunction-shared-fullpostflight-source-20261010-r7','827e809acded4d54a4d69ed34a1dfb06f3b31f5ea6ce2ddcd5f732abb1681342','1370-an-fullfunction-shared-fullpostflight-independent-source-review-20261010-r7','ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP',{'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4':'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry','postflight-fullfunction-qualification-r4':'postflight-fullfunction-qualification-r4-disk-retry'})]:
 Q=S/folder;mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']==h;m=read(mr['path']);assert m['executionAuthorization'] is False
 for r in m['files'].values():assert role(r['path'])==r
 proof=read(Q/'SOURCE-PROOF.json');assert proof['executionAuthorization'] is False
 for k in ('predecessorSourcePins','predecessorIndependentSourceReview'):assert role(proof[k]['path'])==proof[k]
 oldm=read(proof['predecessorSourcePins']['path']);oldr=read(proof['predecessorIndependentSourceReview']['path']);assert oldr['concreteFindings']==[] and oldr['executionAuthorization'] is False
 checks=[]
 for name,pair in proof['pairs'].items():
  assert pair['originalSource']==oldm['files'][name] and pair['updatedSource']==m['files'][name]
  assert role(pair['originalSource']['path'])==pair['originalSource']
  old=Path(pair['originalSource']['path']).read_text();new=(Q/name).read_text();expected=old
  assert {c['from']:c['to'] for c in pair['exactLiteralChanges']}==allowed
  for a,b in allowed.items():assert expected.count(a)==1;expected=expected.replace(a,b)
  assert expected==new;restored=new
  for a,b in reversed(list(allowed.items())):assert restored.count(b)==1;restored=restored.replace(b,a)
  assert restored==old;compile(new,str(Q/name),'exec')
  before=ast.parse(old);after=ast.parse(new);helpers=[]
  for fn in before.body:
   if isinstance(fn,ast.FunctionDef) and fn.name!='main':
    same=next(x for x in after.body if isinstance(x,ast.FunctionDef) and x.name==fn.name);assert ast.get_source_segment(old,fn)==ast.get_source_segment(new,same);helpers.append(fn.name)
  checks.append({'name':name,'exactWholeForwardAndInverse':True,'byteExactHelperFunctions':helpers,'compileOnly':True})
 v={'schema':'1370-root-independent-path-only-adapter-source-review/v1','decision':decision,'sourceManifest':mr,'sourcePins':m['files'],'concreteFindings':[],'executionAuthorization':False,'reviewer':'root, independent from b109_focused_route_review author','checks':checks,'scope':'Only explicitly enumerated fresh R4 post-disk-retry identities; failed7509 remains failed and separate root35222 ownership checks remain required. Original parent helpers, external alias allowlist, separate preparation60 and300/320/330 bounds, original full shared scanner/config/baseline/percommand180/no whole timer remain byte-exact. Future runtime roles are not admitted.'}
 d=S/out;d.mkdir(mode=0o700);p=d/'RECEIPT.json'
 with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);print(json.dumps(role(p)))
