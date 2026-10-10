import ast,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r8'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']=='9af7b525628eb79336121909f54ca7a6c6afb342c2172fb199507eef57146878'
m=read(mr['path']);assert m['executionAuthorization'] is False
for r in m['files'].values():assert role(r['path'])==r
p=read(Q/'SOURCE-PROOF.json');assert p['executionAuthorization'] is False and p['futureActualRouteReadback'] is None and p['futureGrant'] is None
for k in ('predecessorSourceManifest','predecessorAcceptedRootReview'):assert role(p[k]['path'])==p[k]
assert p['predecessorSourceManifest']['sha256']=='827e809acded4d54a4d69ed34a1dfb06f3b31f5ea6ce2ddcd5f732abb1681342'
assert p['predecessorAcceptedRootReview']['sha256']=='fd056e8caac7e381b9ec58cdc807d881553eb8407e54c019ff4e732dc6f8dcd7'
oldm=read(p['predecessorSourceManifest']['path']);oldr=read(p['predecessorAcceptedRootReview']['path']);assert oldr['concreteFindings']==[] and oldr['executionAuthorization'] is False
allowed=[['1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry','1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r5'],['postflight-fullfunction-qualification-r4-disk-retry','postflight-fullfunction-qualification-r5']]
assert p['changes']==allowed and len(p['completeSourcePairs'])==2
checks=[]
for pair in p['completeSourcePairs']:
 for r in (pair['baseline'],pair['derivative'],pair['forward'],pair['inverse']):assert role(r['path'])==r
 name=Path(pair['derivative']['path']).name;assert pair['derivative']==m['files'][name]
 prior=oldm['files'][name];assert role(prior['path'])==prior
 old=Path(prior['path']).read_text();assert Path(pair['baseline']['path']).read_text()==old
 new=Path(pair['derivative']['path']).read_text();expected=old
 for a,b in allowed:assert expected.count(a)==1;expected=expected.replace(a,b)
 assert expected==new;inverse=new
 for a,b in reversed(allowed):assert inverse.count(b)==1;inverse=inverse.replace(b,a)
 assert inverse==old;compile(new,pair['derivative']['path'],'exec')
 helpers={}
 for x in ast.parse(old).body:
  if isinstance(x,ast.FunctionDef) and x.name!='main':
   y=next(v for v in ast.parse(new).body if isinstance(v,ast.FunctionDef) and v.name==x.name)
   assert ast.get_source_segment(old,x)==ast.get_source_segment(new,y);helpers[x.name]=True
 checks.append({'name':name,'wholeForwardAndInverseExact':True,'originalNonMainHelpersExact':helpers,'compileOnly':True})
v={'schema':'1370-root-independent-path-only-adapter-source-review/v1','decision':'ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP','sourceManifest':mr,'sourcePins':m['files'],'concreteFindings':[],'executionAuthorization':False,'reviewer':'root, independent from b109 author','checks':checks,'scope':'Only two declared original R7 recovery-to-R5 output identity substitutions per source. Original scanner/config/baseline/180s commands/no whole clock and ownership remain exact. Failed7509 and passing17336 remain separate preserved facts. No future actual R5 result or execution admission.'}
D=S/'1370-an-fullfunction-shared-fullpostflight-independent-source-review-20261010-r8';D.mkdir(mode=0o700);out=D/'RECEIPT.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps(role(out)))
