import hashlib,json
from pathlib import Path
A=Path(__file__).parent
old=(A/'LESSONS-r2.md').read_bytes()
assert hashlib.sha256(old).hexdigest()=='a327d936a767d9d6f5f137a2e5cde36c695e2889fc15eeede4780db0e7287d6b'
extra='''
## Actual paired evidence distinguishes the failure from the repair

The R2 disposable real-loader run completed with all six actual exits zero. Recorder time was 5.054661210 seconds and aggregate controller time 3.978103873 seconds, within unchanged 60/75/90 bounds. RED changed root mtimeNs and ctimeNs while every nonroot entry stayed exact; GREEN preserved the complete eight-entry map. Both arms collected the identical one-test raw JSON bytes and actual core project identity. The retained consumer accepted actual outcome 3375ca3c. This is evidence that external configurations prevent this tooling mutation on the disposable fixture, not a retroactive pass for R6 or proof of current M0 source preservation. Original R6 still needs a complete audit and a fresh type/collection run.

The fixture deliberately exercises an extended project config in addition to the root/workspace configuration paths. The historical M0 workspace instead contains inline projects. Extra coverage is useful only if it stays clearly labelled; the repair must preserve the historical inline configuration semantics rather than transplant the synthetic fixture's structure.

## Keep inherited HOME and locate actual tool writes explicitly

The disposable R1 controller repurposed HOME to isolate output. The applicable developer instruction prohibits that, including in child environments. R2 removes that override and uses explicit external temp/cache/config/output locations while preserving HOME. The source review also found the older M0 executor used the same override; its fresh derivative must remove it. Reusing a previously accepted wrapper does not excuse a newly identified instruction conflict.

## Separate producer output from the enclosing helper log

The successful controller produced no stderr, while the enclosing helper log retained the unchanged Python recorder's SyntaxWarning. The consumer checks both artifacts by their true roles. Empty producer stderr is not a claim of an empty enclosing log. Cleanup was measured for actual helper42574/controller43084 PIDs and process groups, with the real recorder override path absent; do not invent internal identifiers or an unrelated override filename.
'''
p=A/'LESSONS-r3.md'
with p.open('xb') as f:f.write(old+extra.encode())
p.chmod(0o444)
print(json.dumps({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}))
