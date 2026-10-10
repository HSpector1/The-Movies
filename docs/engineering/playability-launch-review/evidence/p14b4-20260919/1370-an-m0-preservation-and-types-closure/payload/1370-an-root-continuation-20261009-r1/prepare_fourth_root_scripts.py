import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
def put(n,b):
 p=A/n
 with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
changes=[('1370-an-m0-fullfunction-qualification-source-20261010-r10','1370-an-m0-fullfunction-qualification-source-20261010-r11'),('1370-an-m0-fullfunction-parent-source-20261010-r3','1370-an-m0-fullfunction-parent-source-20261010-r4'),('eb43fa973b7a9ded1a834a944b2351150236df1c5b7e566b8df904661f689f46','18b014711ab516c421e5ade49a6cea9757f34ba9aa85f896e126087be3349b36'),('bfd2caee59bf7bdc5698b97bca19340513dcf0b761ef66dfe3b970eef39eec86','bbd9477ee57d96fbf4b325277542819725cff0d707418aea6acd038d10d55618'),('1370-an-m0-fullfunction-parent-independent-source-review-20261010-r3','1370-an-m0-fullfunction-parent-independent-source-review-20261010-r4'),('410d3e784e742abe9c089a8b9ae52cd4db426dabda6022212ea2f09df2417fe7','6ebdd529dbb7d5a1fff2483c72eff328230dbac794da9ea35928fd47213fd86d'),('M0-FULLFUNCTION-R3-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R4-CURRENT-PROTECTION.json'),('FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R3.json','FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R4.json'),('1370-an-m0-fullfunction-parent-recorded-20261010-r3','1370-an-m0-fullfunction-parent-recorded-20261010-r4'),('FULLFUNCTION-ROOT-BINDING-R3.json','FULLFUNCTION-ROOT-BINDING-R4.json')]
old=(A/'run_fullfunction_third_once.py').read_text();assert hashlib.sha256(old.encode()).hexdigest()=='4f0898349d67592a24b5bced2964c9c82f54fa4814a02979a4ebf10b02d9a88f'
checks=[]
for source,target,cs in [('run_fullfunction_third_once.py','run_fullfunction_fourth_once.py',changes),('adopt_fullfunction_r3_current_protection.py','adopt_fullfunction_r4_current_protection.py',[('M0-FULLFUNCTION-R3-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json','M0-FULLFUNCTION-R4-CURRENT-PREFLIGHT-OBSERVED-ADOPTION.json'),('FULLFUNCTION-R2-STOP-OBSERVED-ADOPTION.json','FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json'),('M0-FULLFUNCTION-R3-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R4-CURRENT-PROTECTION.json')])]:
 old=(A/source).read_text();new=old
 for a,b in cs:assert new.count(a)==1;new=new.replace(a,b)
 restored=new
 for a,b in reversed(cs):assert restored.count(b)==1;restored=restored.replace(b,a)
 assert restored==old;compile(new,target,'exec');r=put(target,new);checks.append({'source':source,'sourceSha256':hashlib.sha256(old.encode()).hexdigest(),'updated':r,'changes':cs,'wholeInverseExact':True})
print(json.dumps(put('FULLFUNCTION-R4-ROOT-SOURCE-DELTA.json',json.dumps({'schema':'1370-root-fullfunction-fourth-source-delta/v1','executionAuthorization':False,'sourceOnly':True,'checks':checks,'unchangedFutureIndependentReviewContract':True},sort_keys=True,indent=2)+'\n')))
