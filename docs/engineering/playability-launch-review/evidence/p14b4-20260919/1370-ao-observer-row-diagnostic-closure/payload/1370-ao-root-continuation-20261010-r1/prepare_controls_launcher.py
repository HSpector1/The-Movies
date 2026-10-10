import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve()==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
base=S/'1370-an-root-continuation-20261009-r1/run_lossless_controls_once.py';old=base.read_bytes();new=old
changes=[
 ('1370-an-lossless-trace-pure-controls-recorded-route-source-20261010-r2','1370-ao-observer-row-diagnostic-pure-controls-recorded-route-source-20261010-r1'),
 ('2b035412243347f60e8a1148a290899158ce975f755a1b8837324b1e07bd644f','a27f8bf8756ab5804411ff1592aef49f8012c3dc65e14cbf073dcec2995a97ec'),
 ('1370-lossless-trace-pure-controls-recorded-route-independent-source-review/v1','1370-observer-row-diagnostic-pure-controls-recorded-route-independent-source-review/v1'),
 ('ACCEPT_STATIC_LOSSLESS_TRACE_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY','ACCEPT_STATIC_OBSERVER_ROW_DIAGNOSTIC_PURE_CONTROLS_RECORDED_ROUTE_SOURCE_ONLY'),
 ("config['caseCount']==49 and config['positiveCount']==9 and config['specificNegativeCount']==40","config['caseCount']==48 and config['positiveCount']==6 and config['specificNegativeCount']==42"),
 ("A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'","S/'1370-an-root-continuation-20261009-r1/FULLFUNCTION-R5-STOP-OBSERVED-ADOPTION.json'"),
 ('d684408bdfcc6eb43f59c56594b4b30018904bec3b142cd0d7c1f14a335332ee','ab5b801da2ec6408281115aa424bfafad8a8e458b96e3f068d5fecfb2346669f'),
 ("priorValue['freshPassingSharedPostSession']==17336","priorValue['freshPassingSharedPostSession']==92358"),
 ('LOSSLESS-CONTROLS-SOURCE-ADOPTION.json','OBSERVER-DIAGNOSTIC-CONTROLS-SOURCE-ADOPTION.json'),
 ("'rootDesignAdoption','implementationControlsSourceAdoption')","'rootDesignAdoption','implementationControlsSourceAdoption','api')"),
 ('d508ed71a4607104aeab0541887dd456687378467bc79915c8425b339e4e47b7','1112ed2166d623284be4a1c1bd40ae455212921d16ec32da0e727f9bcca566c7'),
 ('19327bf21bd5379586ffa98ad853ac3b6c91b22dd18eb2637c4137f74fae306a','12d11061dd21827447ef0563d9ab4c5bec0c636986e8690ed067eb0be37dfa0c'),
 ('launch-lossless-controls.py','launch-observer-row-controls.py'),
]
for x,y in changes:
 assert new.count(x.encode())==1 and y.encode() not in new
 new=new.replace(x.encode(),y.encode())
inverse=new
for x,y in reversed(changes):inverse=inverse.replace(y.encode(),x.encode())
assert inverse==old;compile(new,str(A/'run_observer_controls_once.py'),'exec')
out=put(A/'run_observer_controls_once.py',new)
proof=put(A/'CONTROLS-ROOT-LAUNCHER-PROOF.json',(json.dumps({'schema':'1370-ao-observer-diagnostic-controls-root-launcher-proof/v1','base':role(base),'new':out,'changes':[{'before':x,'after':y,'occurrences':old.count(x.encode())} for x,y in changes],'wholeInverseEqualsBase':True,'originalOwnershipAndBoundsUnchanged':True,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode())
print(json.dumps({'launcher':out,'proof':proof}))
