import ast,hashlib,json,os
from pathlib import Path
A=Path(__file__).parent
replacements=[
 ('1370-an-m0-fullfunction-qualification-source-20261010-r7','1370-an-m0-fullfunction-qualification-source-20261010-r9'),
 ('1370-an-m0-fullfunction-parent-source-20261010-r1','1370-an-m0-fullfunction-parent-source-20261010-r2'),
 ('d1357e8fe9b082313f79b27e870df63ec01245d52e725c5698b9045bfe77ac7f','51926780c880416000d592b6f7e3ba8a0c42f005a833e6813708abc25823087c'),
 ('1370-an-m0-fullfunction-qualification-independent-source-review-20261010-r7','1370-an-m0-fullfunction-qualification-independent-source-review-20261010-r9'),
 ('3f8c38d007d381db407bf1953781a089488fa3c4979d742f452697c4bef9d48f','1c7ee4c57f05f16cf509efd5739ca3106e1703da8653d7f7a971597cef3ca1d8'),
 ('522109288f54a5a08a758ef58175ca670bbd8d76a4e78b98098c35753c3b9aeb','fb047e0bcf7685b40fd80bcd4d5550f2cef7a967ee936a3644bb0446309da62e'),
 ('1370-an-m0-fullfunction-parent-independent-source-review-20261010-r1','1370-an-m0-fullfunction-parent-independent-source-review-20261010-r2'),
 ('5b34d36a67c86692ca172251cae85f51ced6beb47a76eb7927d8d64a94ff6834','785b2a13d304e24a21b39f2de075bffb75ccb43cb086b677a32e4bca10ee3c93'),
 ('M0-FULLFUNCTION-CURRENT-PROTECTION.json','M0-FULLFUNCTION-RETRY-CURRENT-PROTECTION.json'),
 ('FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION.json','FULLFUNCTION-QUALIFICATION-SOURCE-ADOPTION-R2.json'),
 ('1370-an-m0-fullfunction-parent-recorded-20261010-r1','1370-an-m0-fullfunction-parent-recorded-20261010-r2'),
 ('FULLFUNCTION-ROOT-BINDING.json','FULLFUNCTION-ROOT-BINDING-R2.json')]
before=(A/'run_fullfunction_once.py').read_text();after=before
for old,new in replacements:
 assert after.count(old)==1,(old,after.count(old));after=after.replace(old,new)
restored=after
for old,new in reversed(replacements):
 assert restored.count(new)==1;restored=restored.replace(new,old)
assert restored==before
compile(after,'run_fullfunction_retry_once.py','exec')
p=A/'run_fullfunction_retry_once.py'
with p.open('x') as f:f.write(after);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
v={'schema':'1370-root-fullfunction-retry-launcher-source-delta/v1','sourceOnly':True,'executionAuthorization':False,'completeInverseExact':True,'changes':[{'before':a,'after':b} for a,b in replacements],'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'sourcePath':str(p),'preservedParserObservedAdoption':'2684b2b4a2c0e90b1d9fec5ee079ede8eb945eb3378ff88619f3cd04b943735d'}
q=A/'FULLFUNCTION-RETRY-ROOT-SOURCE-DELTA.json'
with q.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
q.chmod(0o444);print(json.dumps(v))
