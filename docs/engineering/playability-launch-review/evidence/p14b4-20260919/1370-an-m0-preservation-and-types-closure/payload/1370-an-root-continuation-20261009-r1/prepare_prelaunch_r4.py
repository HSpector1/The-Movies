import difflib,hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
B=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r3';Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r4'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(B/'SOURCE-PINS.json')['sha256']=='91b581a7658c2875186cbbc57e1245d0fd7a83a9aa025b84900bbc64b73e1cbc'
bp=json.loads((B/'SOURCE-PINS.json').read_bytes())
for r in bp['files'].values():assert role(Path(r['path']))==r
Q.mkdir(mode=0o700)
def put(n,t):
 p=Q/n
 with p.open('x') as f:f.write(t);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
files={};proof={}
for label,n in [('launcher','run_fullfunction_current_prelaunch_once.py'),('reader','read_fullfunction_current_prelaunch.py')]:
 old=(B/n).read_text();new=old;changes=[]
 for before,after in [('1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r3','1370-an-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r4'),('1370-an-m0-fullfunction-current-prelaunch-output-20261010-r3','1370-an-m0-fullfunction-current-prelaunch-output-20261010-r4'),('M0-FULLFUNCTION-R3-CURRENT-','M0-FULLFUNCTION-R4-CURRENT-'),('ROOT_ADOPTED_FULLFUNCTION_GENERATED_TYPESCRIPT_PARSE_STOP_WITH_FULL_SHARED_POSTFLIGHT','ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT')]:
  count=new.count(before);assert count==1;new=new.replace(before,after);changes.append({'before':before,'after':after,'occurrences':count})
 restored=new
 for c in reversed(changes):assert restored.count(c['after'])==c['occurrences'];restored=restored.replace(c['after'],c['before'])
 assert restored==old;compile(new,str(Q/n),'exec')
 files[n]=put(n,new);files['BASE-r3-'+label+'.py.txt']=put('BASE-r3-'+label+'.py.txt',old)
 for suffix,x,y in [('forward.diff',old,new),('inverse.diff',new,old)]:files[label+'.'+suffix]=put(label+'.'+suffix,''.join(difflib.unified_diff(x.splitlines(True),y.splitlines(True),fromfile='before',tofile='after')))
 proof[label]=changes
 filespec={'sourceOnly':True,'executionAuthorization':False,'baseManifest':role(B/'SOURCE-PINS.json'),'sourceChanges':proof,'wholeInversesExact':True,'allHelpersUnchanged':True,'scope':'Fresh R4 current prelaunch; exact independently/root admitted prior R3 generation-plus-overflow STOP status, original current scanner and three null configuration fills unchanged. No new inventory or type/control replay.'}
files['SOURCE-PROOF.json']=put('SOURCE-PROOF.json',json.dumps(filespec,sort_keys=True,indent=2)+'\n')
argv=json.loads((B/'EXACT-ARGV.json').read_bytes())
raw=json.dumps(argv,sort_keys=True,indent=2).replace('preparation-source-20261010-r3','preparation-source-20261010-r4').replace('parent-recorded-20261010-r3','parent-recorded-20261010-r4')+'\n'
files['EXACT-ARGV.json']=put('EXACT-ARGV.json',raw)
print(json.dumps(put('SOURCE-PINS.json',json.dumps({'schema':'1370-fullfunction-current-prelaunch-preparation-source-pins/v1','files':files,'executionAuthorization':False},sort_keys=True,indent=2)+'\n')))
