import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;P=A.parent/'1370-an-checkpoint-documentation-drafts-20261010-r8/LESSONS-r17-PROPOSED.md'
b=P.read_bytes();assert len(b)==48015 and hashlib.sha256(b).hexdigest()=='de514f44b783ba457e30b69279efd04e5d440d6bd94aa8df61707590fb6703cc'
prior=(A/'LESSONS-r16.md').read_bytes();assert hashlib.sha256(prior).hexdigest()=='644d7d1ec2512131aeba0be2b634dbbb6b81761b511bda1c318fb1770b801324' and b.startswith(prior)
p=A/'LESSONS-r17.md'
with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'scope':'Verified source-only point in time, before R5 actual56544. No runtime inference.'}))
