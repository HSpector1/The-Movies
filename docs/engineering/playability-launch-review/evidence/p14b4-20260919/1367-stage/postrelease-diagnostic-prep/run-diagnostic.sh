#!/usr/bin/env bash
# Parent-controlled observation-only replay. Never invokes or qualifies a full route.
# Usage: bash run-diagnostic.sh <actual-full-HEAD-with-original-src-tree> <new-exclusive-leaf>
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
PREP=/Users/zacheryspector/studio-scratch/1361-postrelease-diagnostic-prep
HEAD_PIN=${1:?actual full HEAD required}
LEAF=${2:?new exclusive run leaf required}
[ "$#" -eq 2 ] || exit 2
[[ "$HEAD_PIN" =~ ^[0-9a-f]{40}$ && "$LEAF" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 2
SOURCE_TREE=88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'source HEAD mismatch' >&2; exit 2; }
[ "$(git -C "$R" rev-parse "$HEAD_PIN:src")" = "$SOURCE_TREE" ] || { echo 'original source tree required' >&2; exit 2; }
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(node --version)" = v20.20.2 ] || exit 2
FREE_KIB=$(df -k / | awk 'NR==2 {print $4}')
[ "$FREE_KIB" -ge 5242880 ] || { echo 'requires 5 GiB free' >&2; exit 2; }
X=/Users/zacheryspector/studio-scratch/1361-postrelease-diagnostic-runs/$LEAF
python3 - "$X" "$PREP" <<'PY'
from pathlib import Path
import hashlib,json,sys
root,prep=map(Path,sys.argv[1:])
for rel,expected in json.loads((prep/'SHA256.json').read_text()).items():
 assert hashlib.sha256((prep/rel).read_bytes()).hexdigest()==expected, 'prep hash mismatch: '+rel
assert not root.exists(),'run path exists'
for part in [root,*root.parents]:
 assert not part.is_symlink(),'symlink ancestor'
 assert not part.exists() or part.is_dir(),'non-directory ancestor'
root.mkdir(parents=True,exist_ok=False)
PY
mkdir "$X/tree" "$X/probe" "$X/out"
git -C "$R" archive "$HEAD_PIN" src package.json package-lock.json tsconfig.json | tar -x -C "$X/tree"
ln -s "$R/node_modules" "$X/tree/node_modules"
cp "$PREP/probe/postrelease.ts" "$PREP/probe/postrelease-original.ts.txt" "$PREP/probe/baseline-result.json" "$PREP/probe/baseline-run.json" "$X/probe/"
cp "$PREP/tsconfig.diagnostic.json" "$X/tsconfig.diagnostic.json"
cp "$PREP/SHA256.json" "$X/out/PREP-SHA256.json"
cp "$0" "$X/out/executed-wrapper.sh"
pmset -g batt > "$X/out/power.txt"
caffeinate -is -w $$ >/dev/null 2>&1 &
# Parent typechecks this proposal separately before execution; this wrapper does not launch a second tool lane.
set +e
python3 - "$X" "$HEAD_PIN" "$SOURCE_TREE" <<'PY'
import datetime,hashlib,json,os,signal,subprocess,sys,time
from pathlib import Path
root=Path(sys.argv[1]);head,source_tree=sys.argv[2:];out=root/'out'
sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((out/'PREP-SHA256.json').read_text())
for rel in ['probe/postrelease.ts','probe/postrelease-original.ts.txt','probe/baseline-result.json','probe/baseline-run.json','tsconfig.diagnostic.json']:
 assert sha(root/rel)==manifest[rel], 'copied input hash mismatch: '+rel
assert sha(out/'executed-wrapper.sh')==manifest['run-diagnostic.sh'],'wrapper copy changed'
base=json.loads((root/'probe/baseline-result.json').read_text())
base_run=json.loads((root/'probe/baseline-run.json').read_text())
assert sha(root/'probe/baseline-result.json')=='4aec19502c0da86a9de96ac160526371d4d7041abb35f9f92b55edb9d34296dc'
assert sha(root/'probe/baseline-run.json')=='c4d1f1b7e8e83b4bc8a2ff1dbe50e9573bf7839966c8f19fda102bc9b128a414'
assert base_run['sourceTree']==source_tree and base_run['mode']=='trial' and base_run['exitCode']==1 and not base_run['timedOut']
assert base['trialQualified'] is False and base['finalWeek']==520 and base['policySha']==sha(root/'probe/postrelease-original.ts.txt')
env=dict(os.environ,PROBE_HORIZON='520',PROBE_CEILING_MS='600000')
env.pop('QUALIFIED_POLICY_SHA',None)
start=time.monotonic();stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();timed_out=False
with (out/'result.json').open('x') as stdout,(out/'stderr.txt').open('x') as stderr:
 p=subprocess.Popen([str(root/'tree/node_modules/.bin/vite-node'),'--root',str(root/'tree'),str(root/'probe/postrelease.ts')],env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 try:code=p.wait(timeout=630)
 except subprocess.TimeoutExpired:
  timed_out=True
  try:os.killpg(p.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  grace=time.monotonic()+5
  while time.monotonic()<grace:
   p.poll()
   try:os.killpg(p.pid,0)
   except ProcessLookupError:break
   time.sleep(min(0.1,max(0,grace-time.monotonic())))
  try:os.killpg(p.pid,signal.SIGKILL)
  except ProcessLookupError:pass
  code=p.wait()
meta={'mode':'diagnostic-observation-only','neverQualifiesFullRoute':True,'sourceHead':head,'sourceTree':source_tree,
 'diagnosticProbeSha':sha(root/'probe/postrelease.ts'),'originalPolicySha':base['policySha'],
 'baselineResultSha':sha(root/'probe/baseline-result.json'),'baselineRunSha':sha(root/'probe/baseline-run.json'),
 'wrapperSha':sha(out/'executed-wrapper.sh'),'horizon':520,'resourceCapMs':600000,'start':stamp,
 'elapsedMs':(time.monotonic()-start)*1000,'exitCode':code,'timedOut':timed_out,'postflightPassed':False}
(out/'run.json').write_text(json.dumps(meta,indent=2)+'\n')
sys.exit(124 if timed_out else (code if code>=0 else 1))
PY
RC=$?
set -e
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'source HEAD changed' >&2; exit 3; }
[ "$(git -C "$R" rev-parse "$HEAD_PIN:src")" = "$SOURCE_TREE" ] || exit 3
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
python3 - "$X" <<'PY'
from pathlib import Path
import hashlib,json,sys
root=Path(sys.argv[1]);out=root/'out'
manifest=json.loads((out/'PREP-SHA256.json').read_text())
for rel in ['probe/postrelease.ts','probe/postrelease-original.ts.txt','probe/baseline-result.json','probe/baseline-run.json','tsconfig.diagnostic.json']:
 assert hashlib.sha256((root/rel).read_bytes()).hexdigest()==manifest[rel], 'postflight input changed: '+rel
assert hashlib.sha256((out/'executed-wrapper.sh').read_bytes()).hexdigest()==manifest['run-diagnostic.sh']
meta=json.loads((out/'run.json').read_text());meta['postflightPassed']=True
meta['resultSha256']=hashlib.sha256((out/'result.json').read_bytes()).hexdigest()
meta['stderrSha256']=hashlib.sha256((out/'stderr.txt').read_bytes()).hexdigest()
(out/'run.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta))
PY
exit "$RC"
