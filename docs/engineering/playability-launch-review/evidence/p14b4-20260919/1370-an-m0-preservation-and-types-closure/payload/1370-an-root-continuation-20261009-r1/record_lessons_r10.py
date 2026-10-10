import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
p=S/'1370-an-checkpoint-documentation-drafts-20261010-r3/LESSONS-PROPOSED.md';b=p.read_bytes();assert hashlib.sha256(b).hexdigest().startswith('1222dee8') and b.startswith((A/'LESSONS-r9.md').read_bytes())
b=b.replace(b'## Proposed additions after the first fullfunction STOP',b'## R10 - preservation acceptance does not turn a failed test into a pass')
b+=b'\nThe original failed95737 is now independently reviewed26076d01 and root-adopted ba123465 as a protected STOP. Mandatory shared post89456 completed0 in519.498031787 seconds; its full immutable map matches original0136, all nine strict roots and scratch identity match, and all eight recorded PID/group checks are absent. This closes shared preservation only. Missing complete M0 afterproofs remain absent. R9 source51926780 is independently accepted1c7ee4 with the authenticated leaf, return after finally, and fresh executed recorder selector. No source correction was mistaken for an actual successful run.\n\nFresh original current prelaunch67549 and reader55012 completed0, retaining actual scanner39275 and genuine four prior groups. Its independent review is still pending at this version; the R2 fullfunction retry has not been launched. Successful types and32 parser controls remain closed instead of being replayed to compensate for wrapper changes.\n'
out=A/'LESSONS-r10.md'
with out.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps({'path':str(out),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
