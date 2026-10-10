import hashlib,json,subprocess
from pathlib import Path
D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
prefix=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
manifest=prefix/'1370-am-natural208-and-renewal-pricing-closure/ARCHIVE-MANIFEST.json'
assert hashlib.sha256(manifest.read_bytes()).hexdigest()=='f9c9926ce5b94f446c89284c48295e0631bd888a5b582521c947a4eb892dc6c6'
original=subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','show','8cb704e2f18e6a635943893422c9cfdc206e106d:HANDOFF.md'],cwd=R)
assert (R/'HANDOFF.md').read_bytes()==original
for source,target,h in [('HANDOFF-FINAL.md',R/'HANDOFF.md','b2784da6a3a1378a919734fe892fc00841861f47b79687446b41f6273ba8d292'),('REPORT-FINAL.md',prefix/'1370-AM-natural208-and-renewal-pricing-closure.md','c3b12f6c2552b5afc96b39eef2159a23b85548178052940628f089d5c5246c9e')]:
 b=(D/source).read_bytes();assert hashlib.sha256(b).hexdigest()==h
 if source.startswith('REPORT'):assert not target.exists()
 target.write_bytes(b);assert target.read_bytes()==b
 print(json.dumps({'path':str(target),'bytes':len(b),'sha256':h}))
