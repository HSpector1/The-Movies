#!/usr/bin/env bash
# Parent-controlled analysis route. Invoke only through the single heavy lane.
# Arguments: accepted full HEAD, exclusive run leaf, trial|full, [qualified trial output dir].
set -euo pipefail
R=/Users/zacheryspector/The-Movies-headless-program
PREP=/Users/zacheryspector/studio-scratch/1361-postrelease-maintenance-prep
HEAD_PIN=${1:?accepted source HEAD required}
LEAF=${2:?exclusive run leaf required}
MODE=${3:?trial or full required}
[[ "$HEAD_PIN" =~ ^[0-9a-f]{40}$ && "$LEAF" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 2
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'source HEAD mismatch' >&2; exit 2; }
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
[ "$(node --version)" = v20.20.2 ] || exit 2
FREE_KIB=$(df -k / | awk 'NR==2 {print $4}')
[ "$FREE_KIB" -ge 5242880 ] || { echo 'requires5GiB free' >&2; exit 2; }
X=/Users/zacheryspector/studio-scratch/1361-postrelease-maintenance-runs/$LEAF
case "$MODE" in
  trial) WEEKS=520; CAP_MS=600000 ;;
  full) WEEKS=6344; CAP_MS=7200000 ;;
  *) exit 2 ;;
esac
# These are operational resource caps, not game or Bridge acceptance ceilings.
POLICY_SHA=$(shasum -a 256 "$PREP/probe/postrelease.ts" | awk '{print $1}')
QUALIFIED_SHA=
TRIAL=
SOURCE_TREE=$(git -C "$R" rev-parse "$HEAD_PIN:src")
[ "$SOURCE_TREE" = 88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837 ] || { echo 'original Save45 source required' >&2; exit 2; }
WRAPPER_SHA=$(shasum -a 256 "$0" | awk '{print $1}')
if [ "$MODE" = full ]; then
  TRIAL=${4:?qualified trial output directory required}
  python3 - "$TRIAL" "$HEAD_PIN" "$POLICY_SHA" <<'PY'
import json,sys
from pathlib import Path
root=Path(sys.argv[1]);meta=json.loads((root/'run.json').read_text());result=json.loads((root/'result.json').read_text())
assert meta['sourceHead']==sys.argv[2] and meta['policySha']==sys.argv[3]
assert meta['exitCode']==0 and meta['timedOut'] is False and meta['mode']=='trial'
assert result['trialQualified'] is True and result['policySha']==sys.argv[3] and result['finalWeek']==520
assert len(result['replacementHires'])>0 and result['recentReleases']>0
assert result['maintenance']['accepted']>0, 'qualified maintenance policy must actually exercise paid repair'
PY
  QUALIFIED_SHA=$POLICY_SHA
fi
python3 - "$X" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1]);assert not root.exists(),'run path exists'
for part in [root,*root.parents]:
 assert not part.is_symlink(),'symlink ancestor'
 assert not part.exists() or part.is_dir(),'non-directory ancestor'
root.mkdir(parents=True,exist_ok=False)
PY
mkdir "$X/tree" "$X/probe" "$X/out"
git -C "$R" archive "$HEAD_PIN" src package.json package-lock.json tsconfig.json | tar -x -C "$X/tree"
ln -s "$R/node_modules" "$X/tree/node_modules"
cp "$PREP/probe/postrelease.ts" "$X/probe/postrelease.ts"
[ "$(shasum -a 256 "$X/probe/postrelease.ts" | awk '{print $1}')" = "$POLICY_SHA" ] || { echo 'probe copy hash mismatch' >&2; exit 2; }
cp "$0" "$X/out/executed-wrapper.sh"
pmset -g batt > "$X/out/power.txt"
caffeinate -is -w $$ >/dev/null 2>&1 &
set +e
python3 - "$X" "$HEAD_PIN" "$MODE" "$WEEKS" "$CAP_MS" "$POLICY_SHA" "$QUALIFIED_SHA" "$SOURCE_TREE" "$WRAPPER_SHA" "$TRIAL" <<'PY'
import datetime,hashlib,json,os,signal,subprocess,sys,time
from pathlib import Path
root=Path(sys.argv[1]);head,mode,weeks,cap,policy,qualified,source_tree,wrapper_sha,trial_path=sys.argv[2:];out=root/'out'
assert hashlib.sha256((root/'probe/postrelease.ts').read_bytes()).hexdigest()==policy,'probe changed before execution'
assert hashlib.sha256((out/'executed-wrapper.sh').read_bytes()).hexdigest()==wrapper_sha,'wrapper copy changed'
qualification=None
if trial_path:
 trial=Path(trial_path).resolve()
 qualification={'path':str(trial),'runSha256':hashlib.sha256((trial/'run.json').read_bytes()).hexdigest(),'resultSha256':hashlib.sha256((trial/'result.json').read_bytes()).hexdigest()}
env=dict(os.environ,PROBE_HORIZON=weeks,PROBE_CEILING_MS=cap)
if qualified:env['QUALIFIED_POLICY_SHA']=qualified
else:env.pop('QUALIFIED_POLICY_SHA',None)
start=time.monotonic();stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();timed_out=False
with (out/'result.json').open('x') as stdout,(out/'stderr.txt').open('x') as stderr:
 p=subprocess.Popen([str(root/'tree/node_modules/.bin/vite-node'),'--root',str(root/'tree'),str(root/'probe/postrelease.ts')],env=env,stdout=stdout,stderr=stderr,start_new_session=True)
 try:code=p.wait(timeout=int(cap)/1000+30)
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
meta={'sourceHead':head,'sourceTree':source_tree,'policySha':policy,'wrapperSha':wrapper_sha,'qualification':qualification,'mode':mode,'horizon':int(weeks),'resourceCapMs':int(cap),'start':stamp,'elapsedMs':(time.monotonic()-start)*1000,'exitCode':code,'timedOut':timed_out}
(out/'run.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta));sys.exit(124 if timed_out else (code if code>=0 else 1))
PY
RC=$?
set -e
[ "$(git -C "$R" rev-parse HEAD)" = "$HEAD_PIN" ] || { echo 'source HEAD changed' >&2; exit 3; }
git -C "$R" diff --quiet HEAD -- src package.json package-lock.json tsconfig.json
exit "$RC"
