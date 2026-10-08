#!/usr/bin/env python3
"""Static-only exact command check. Never executes launch or materializer."""
import hashlib,json,pathlib,shlex,stat,subprocess
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-materializer-types-launch-proposal-r2')
S=P.parent;REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=json.loads((P/'BINDING.json').read_text());command=(P/'LAUNCH.command').read_text()
assert sha(P/'LAUNCH.command')==b['launchCommandSha256']
argv=shlex.split(command)
assert argv[:6]==['/bin/bash',str(S/'heavy-queue/lane-run.sh'),'0',b['laneLog'],'/usr/local/bin/python3','-I']
assert argv[6:8]==['-B','-c'] and len(argv)==9
code=argv[8];compile(code,'<verified-bootstrap>','exec')
for label,path in [('materializerSha256',S/'1370-c0-h-m0-mirror-materializer-proposal-r2/materialize.py'),
                   ('materializerStaticReviewSha256',S/'1370-c0-h-m0-mirror-materializer-independent-static-review-r2/RECEIPT.json'),
                   ('sourceManifestSha256',S/'1370-c0-h-m0-corrected-overlay-source-manifest-r2/H-SOURCE-MANIFEST.json'),
                   ('sourceReviewSha256',S/'1370-c0-h-m0-corrected-overlay-source-manifest-independent-review-r2/H-RECEIPT.json')]:
 assert sha(path)==b[label]
 assert b[label] in code
assert sha(S/'1370-c0-h-materializer-types-launch-independent-exact-review-r1/RECEIPT.json')==b['predecessorR1RefineReceiptSha256']
assert '--run-id' in code and b['runId'] in code and 'os.O_NOFOLLOW' in code and 'os.fstat(fd)' in code and 'exec(compile(data[script]' in code
for path in [pathlib.Path(b['laneLog']),pathlib.Path(b['laneMeta']),pathlib.Path(b['mirrorPath']),pathlib.Path(b['resultPath'])]:
 assert not path.exists(),str(path)+' collided'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()==b['productionHead']
assert subprocess.check_output(['git','rev-parse','HEAD:src'],cwd=REPO,text=True).strip()==b['productionSrcTree']
assert subprocess.check_output(['git','status','--porcelain=v1'],cwd=REPO,text=True).strip()==''
print('EXACT_R2_STATIC_SELFCHECK_PASS_NO_LAUNCH')
