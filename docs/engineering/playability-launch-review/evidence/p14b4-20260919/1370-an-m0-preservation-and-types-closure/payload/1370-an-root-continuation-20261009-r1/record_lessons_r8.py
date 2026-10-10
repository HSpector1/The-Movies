import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;old=A/'LESSONS-r7.md'
assert hashlib.sha256(old.read_bytes()).hexdigest()=='5028e95ec064db8771654feaacd236a0bf88ec3795f87948bae67c1adccc6c2a'
addition='''

## R8 — genuine admission and exact timestamp controls (2026-10-10 UTC)

The repaired external-config type/collection result is now independently admitted by aa9b78e2 and root be632d53 after its mandatory fullpostflight. This closes current M0 type/collection and preservation verification for actualR3 under the explicitly qualified post-R6 root. The historical root is still not unchanged; all original R6 and R1disk failures remain failures. Source-side reasoning and loader RED/GREEN reproduction support the repair, without proving an exclusive cause of the original timestamp event.

The isolated exact-integer parser now has a real32-case recorded result: session91619/helper40597/Node40853, all0,0.988398931s recorder, four fresh owned PID/PGID absence checks, lane released. Specific cases preserve adjacent unsafe positive/negative integers and real neighboring nanosecond timestamps; distinguish booleans/numbers and arrays/objects; reject duplicate keys, malformed numbers/escapes/UTF8, depth overflow and trailing data with the intended refusal. This is evidence for the exact public helper only. At this lesson version its independent observed admission is pending; it is not proof of full simulation fixtures or gameplay neutrality. The original JSON proof bytes were not converted to strings or rewritten; BigInts remain in validation memory.

Source review traced serialization separately from parsing: no unsafe integer proof object reaches Node JSON.stringify, while Python writes exact numeric tokens. For failure reporting, do not publish even an internal success variable until the candidate result's status, actual prefix flag, exact weeks and three successful phases have passed validation. Loading a JSON file is not validating its claimed success. R5 and R6 source-only reporting STOPs remain preserved; R7 independently accepted3f8c closes that defect before any simulation run.

The next current-prelaunch actual86072 and reader36194 both completed0; independent0634/root8c84 accept original full-map reuse under continuous freeze, fresh nine roots and current checks. Its4raw PS/FD roles remain local-only. Reusing this original provision does not mean a new M0 full source/dependency proof occurred: those remain required inside the upcoming aggregate simulation qualification, followed by the original mandatory shared fullpostflight.
'''
p=A/'LESSONS-r8.md'
with p.open('x') as f:f.write(old.read_text()+addition);f.flush();os.fsync(f.fileno())
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
