from pathlib import Path
import hashlib,json
D=Path(__file__).resolve().parent
R1=D.parent/'1370-ap-native-fullfunction-current-prelaunch-preparation-source-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
t=(R1/'prepare_source.py').read_text()
before="changes=[\n"
after="changes=[\n ('1370-ao-root-continuation-20261010-r1','1370-ap-root-continuation-20261010-r1'),\n (oldparent.name,parent.name),\n"
assert t.count(before)==1
t=t.replace(before,after)
t=t.replace('  change("A=Path(\'/Users/zacheryspector/studio-scratch/1370-ao-root-continuation-20261010-r1\')","A=Path(\'/Users/zacheryspector/studio-scratch/1370-ap-root-continuation-20261010-r1\')",True)\n','')
before="config=json.loads((B/'PRELAUNCH-CONFIG-UNFILLED.json').read_text())\n"
after="""scanner=(D/'current-ao-root-prelaunch.py').read_text()
assert repr(ar['path']) in scanner
assert 'SCRATCH/'+repr(parent.name) in scanner
assert str(B) not in scanner and '1370-ao-root-continuation-20261010-r1' not in scanner
assert '1370-ao-m0-fullfunction-current-prelaunch-parent-recorded-20261010-r1' not in scanner
assert str(D/'current-ao-root-prelaunch.py') in (D/'run_current_ao_prelaunch_once.py').read_text() or "str(Q/'current-ao-root-prelaunch.py')" in (D/'run_current_ao_prelaunch_once.py').read_text()
config=json.loads((B/'PRELAUNCH-CONFIG-UNFILLED.json').read_text())
"""
assert t.count(before)==1
t=t.replace(before,after)
with (D/'prepare_source.py').open('x') as f:f.write(t)
finding={'schema':'1370-ap-short-prelaunch-unrun-binding-correction/v1','preservedPredecessorSourceManifest':role(R1/'SOURCE-PINS.json'),
 'findings':[{'source':role(R1/'current-ao-root-prelaunch.py'),'defect':'Split SCRATCH/old-AO-parent config allowlist was not covered by full absolute-path rebasing.'},
 {'source':role(R1/'current-ao-root-prelaunch.py'),'defect':'Exact current fullpreflight adoption dictionary retained AO-root path, contradicting genuine AP-root e380/config role.'}],
 'effect':'Early original input-role refusal; no runtime, grant or acceptance occurred.',
 'repair':'Two literal substitutions only, plus explicit pre-seal consistency checks; original AO whole inverses and unchanged helpers independently recomputed.',
 'executionAuthorization':False}
with (D/'PREDECESSOR-SOURCE-STOP.json').open('x') as f:json.dump(finding,f,indent=2);f.write('\n')
