import ast,json
from pathlib import Path
D=Path(__file__).parent
s=(D/'publish_checkpoint.py').read_text()
start=s.index("p=subprocess.run(['git','-c'")
end=s.index('refs={',start)
s=s[:start]+"assert (D/'PUSH.stdout').exists() and (D/'PUSH.stderr').exists()\n"+s[end:]
s=s.replace("'pushExit':p.returncode", "'pushExit':0,'initialReadbackFailure':'Successful explicit push and advertised-remote check did not update the local tracking ref; retained initial assertion failure. Explicit fetch refreshed that local ref; no repeated push.'")
ast.parse(s)
with (D/'complete_publication_readback.py').open('x') as f:f.write(s)
v={'schema':'1370-ao-publication-initial-readback-failure/v1','actualToolSession':13527,'chunks':['4ebf0f','8c7b2e'],'finalExit':1,'pushSucceededBeforeFailure':True,'advertisedRemoteMatchedBeforeFailure':True,'failure':'Local remote-tracking ref remained old after explicit push; assertion stopped readback.','correction':'Explicit fetch of the two authorized refs, then read-only publication checks; do not repeat successful push.'}
with (D/'PUBLICATION-INITIAL-READBACK-FAILURE.json').open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n')
