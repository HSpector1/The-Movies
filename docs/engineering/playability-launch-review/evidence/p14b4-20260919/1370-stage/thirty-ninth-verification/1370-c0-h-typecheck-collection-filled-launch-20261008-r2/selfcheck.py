#!/usr/bin/env python3
"""Read-only exact launch check. Never runs recorder, types or Vitest."""
import ast,hashlib,json,pathlib,shlex,subprocess,shutil
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-h-typecheck-collection-filled-launch-20261008-r2'
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=json.loads((P/'BINDING.json').read_text())
assert b['status']=='FILLED_INDEPENDENT_REVIEW_REQUIRED' and b['runId']=='20261008-h-types-r3'
assert b['materializerResultSha256']==sha(pathlib.Path(b['materializerResultPath']))
assert b['observedHMirrorReceiptSha256']==sha(pathlib.Path(b['observedHMirrorReceiptPath']))
assert b['runnerStaticReviewSha256']==sha(pathlib.Path(b['runnerStaticReviewPath']))
assert b['runnerSha256']==sha(pathlib.Path(b['runnerPath'])) and b['recorderSha256']==sha(pathlib.Path(b['recorderPath']))
assert json.loads(pathlib.Path(b['observedHMirrorReceiptPath']).read_text())['decision']=='ACCEPT_OBSERVED_H_MIRROR_SOURCE_ONLY'
assert json.loads(pathlib.Path(b['runnerStaticReviewPath']).read_text())['decision']=='ACCEPT_STATIC_ONLY'
argv=shlex.split((P/'LAUNCH.command').read_text())
assert argv[:4]==['/usr/local/bin/python3','-I','-B','-c'] and len(argv)==5
code=argv[4];ast.parse(code)
for key in ['materializerResultSha256','observedHMirrorReceiptSha256','runnerStaticReviewSha256','runnerSha256','recorderSha256']:
 assert b[key] in code,key
assert sha(P/'BINDING.json') in code
assert 'os.O_NOFOLLOW' in code and 'os.fstat(fd)' in code and 'exec(compile(data[recorder]' in code
for field in ['outputPath','recorderResultPath','laneLogPath','laneMetaPath']:
 assert not pathlib.Path(b[field]).exists(),field+' collision'
lane_busy=(S/'HEAVY-LANE-LOCK').exists() # stage38 may own lane during static preparation; exact bootstrap refuses it
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()==b['productionHead']
assert subprocess.check_output(['git','rev-parse','HEAD:src'],cwd=REPO,text=True).strip()==b['productionSrcTree']
assert subprocess.check_output(['git','status','--porcelain=v1'],cwd=REPO,text=True).strip()==''
assert b['fullMirrorFileProofDigestSha256']=='55fd1afb4437386867cdb23c5daf137e9613d41e51f31dafc619bedf37bc59a4'
print('H_TYPECHECK_FILLED_R2_STATIC_BYTES_PASS_NO_LAUNCH',{'laneBusy':lane_busy,'freeBytes':shutil.disk_usage(S).free})
