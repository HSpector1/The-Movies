import hashlib,json,subprocess
from pathlib import Path
D=Path(__file__).parent;R=Path('/Users/zacheryspector/The-Movies-headless-program')
prefix=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
manifest=prefix/'1370-an-m0-preservation-and-types-closure/ARCHIVE-MANIFEST.json'
assert hashlib.sha256(manifest.read_bytes()).hexdigest()=='2b2247acd980dda8109fdad09a6a83bc3219cd053433e80684301b8a44dd665a'
def git(*args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R)
assert git('rev-parse','HEAD').decode().strip()=='7087f116cf998fd86e33fb8e004df628e0686dbd'
original=git('show','7087f116cf998fd86e33fb8e004df628e0686dbd:HANDOFF.md');assert (R/'HANDOFF.md').read_bytes()==original
for source,target,h in [('HANDOFF-FINAL.md',R/'HANDOFF.md','4f3f6435ba8fecd3645512f2e4a225740d91ceb9733f6668ef5507953ad0b102'),('REPORT-FINAL.md',prefix/'1370-AN-m0-preservation-and-types-closure.md','9a042c95acac18c1860152f6a5eec8a386229726dc42e7971ebddb65fb3b9980')]:
 b=(D/source).read_bytes();assert hashlib.sha256(b).hexdigest()==h
 if source.startswith('REPORT'):assert not target.exists()
 target.write_bytes(b);assert target.read_bytes()==b
 print(json.dumps({'path':str(target),'bytes':len(b),'sha256':h}))
