import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
B=A/'prepare_prelaunch_r4.py';old=B.read_text()
oldselector="Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r4'"
newselector="Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r5'"
assert old.count(oldselector)==1;new=old.replace(oldselector,newselector)
start="raw=json.dumps(argv,sort_keys=True,indent=2).replace('preparation-source-20261010-r3','preparation-source-20261010-r4').replace('parent-recorded-20261010-r3','parent-recorded-20261010-r4')+'\\n'"
replacement="""argv['expectedPriorReadback']=role(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r3/READBACK.json')
argv['expectedPriorStopAdoptionPath']=str(A/'FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json')
argv['futureRootStopStatus']='ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT'
argv['schema']='1370-fullfunction-fourth-current-prelaunch-exact-argv/v1'
argv['originalExecutedArgv'][4]=str(A/'M0-FULLFUNCTION-R4-CURRENT-PRELAUNCH-CONFIG.json')
argv['launcherArgv'][4]=str(Q/'run_fullfunction_current_prelaunch_once.py')
argv['readerArgv'][4]=str(Q/'read_fullfunction_current_prelaunch.py')
raw=json.dumps(argv,sort_keys=True,indent=2)+'\\n'"""
assert new.count(start)==1;new=new.replace(start,replacement)
compile(new,str(B),'exec')
finding={'status':'UNRUN_ROOT_PREPARATION_STOP','sourceManifestPath':str(S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r4/SOURCE-PINS.json'),'sourceManifestSha256':'5f1170b67672276af454058d2f321b8e53de8f9d07d561cd3eadda32ee4ef2c2','executionAuthorization':False,'finding':'Execution source correctly used fresh R4 and prior R3 overflow STOP, but EXACT-ARGV retained stale R2 prior role/status and original executed R3 config. Preserve unrun package; fresh R5 preparation corrects documentation roles from genuine completed R3 evidence. Runtime selectors remain R4.'}
p=A/'FULLFUNCTION-R4-PRELAUNCH-PREPARATION-STOP.json'
with p.open('x') as f:json.dump(finding,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444)
exec(compile(new,str(B),'exec'),{'__file__':str(B)})
