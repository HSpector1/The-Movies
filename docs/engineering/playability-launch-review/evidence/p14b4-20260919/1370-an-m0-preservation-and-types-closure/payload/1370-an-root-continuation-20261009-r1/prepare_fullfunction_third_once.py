import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;old=(A/'run_fullfunction_retry_once.py').read_text();assert hashlib.sha256(old.encode()).hexdigest()=='d69cd29cbc1134211b89e7fa95a8c6708a5c39fda41821326978ffc83067da60'
changes=[
 ('1370-an-m0-fullfunction-qualification-source-20261010-r9','1370-an-m0-fullfunction-qualification-source-20261010-r10'),
 ('1370-an-m0-fullfunction-parent-source-20261010-r2','1370-an-m0-fullfunction-parent-source-20261010-r3'),
 ('51926780c880416000d592b6f7e3ba8a0c42f005a833e6813708abc25823087c','eb43fa973b7a9ded1a834a944b2351150236df1c5b7e566b8df904661f689f46'),
 ("sr=checked(S/'1370-an-m0-fullfunction-qualification-independent-source-review-20261010-r9/RECEIPT.json','1c7ee4c57f05f16cf509efd5739ca3106e1703da8653d7f7a971597cef3ca1d8')","sr=checked(sys.argv[1],sys.argv[2])"),
 ('len(sys.argv)==1','len(sys.argv)==3'),
 ('fb047e0bcf7685b40fd80bcd4d5550f2cef7a967ee936a3644bb0446309da62e','bfd2caee59bf7bdc5698b97bca19340513dcf0b761ef66dfe3b970eef39eec86'),
 ('1370-an-m0-fullfunction-parent-independent-source-review-20261010-r2','1370-an-m0-fullfunction-parent-independent-source-review-20261010-r3'),
 ('785b2a13d304e24a21b39f2de075bffb75ccb43cb086b677a32e4bca10ee3c93','410d3e784e742abe9c089a8b9ae52cd4db426dabda6022212ea2f09df2417fe7'),
 ('M0-FULLFUNCTION-RETRY-CURRENT-PROTECTION.json','M0-FULLFUNCTION-R3-CURRENT-PROTECTION.json'),
 ('FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R2.json','FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R3.json'),
 ('1370-an-m0-fullfunction-parent-recorded-20261010-r2','1370-an-m0-fullfunction-parent-recorded-20261010-r3'),
 ('FULLFUNCTION-ROOT-BINDING-R2.json','FULLFUNCTION-ROOT-BINDING-R3.json')]
new=old
for a,b in changes:assert new.count(a)==1;new=new.replace(a,b)
v=new
for a,b in reversed(changes):assert v.count(b)==1;v=v.replace(b,a)
assert v==old;compile(new,'run_fullfunction_third_once.py','exec');p=A/'run_fullfunction_third_once.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
d={'schema':'1370-root-fullfunction-retry-launcher-source-delta/v1','sourceOnly':True,'executionAuthorization':False,'completeInverseExact':True,'changes':changes,'beforeSha256':hashlib.sha256(old.encode()).hexdigest(),'afterSha256':hashlib.sha256(new.encode()).hexdigest(),'sourcePath':str(p),'sourceReviewFutureArguments':['genuine completed independent source review path','exact SHA256'],'unchangedReviewRequiresExactManifestDecisionNoFindings':True}
q=A/'FULLFUNCTION-R3-ROOT-SOURCE-DELTA.json'
with q.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(json.dumps({'path':str(p),'bytes':len(new.encode()),'sha256':d['afterSha256']}))
