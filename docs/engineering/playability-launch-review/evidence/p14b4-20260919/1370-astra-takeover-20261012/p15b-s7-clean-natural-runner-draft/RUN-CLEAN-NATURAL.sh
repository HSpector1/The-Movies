#!/bin/bash
# DRAFT ONLY: pending future159 packet/helper rebind; parent sole owned lane.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/p15b
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/PENDING-159-RESEARCH-TEST-REPAIR-PACKET"
PATCH_PIN=PENDING_REVIEWED_159_PATCH_SHA256
PACKET_MANIFEST_PIN=PENDING_REVIEWED_159_MANIFEST_SHA256
HELPER_PIN=PENDING_REBOUND_HELPER_SHA256
# Fail before any work until exact pending fields are rebound and independently reviewed.
case "$PATCH_PIN:$PACKET_MANIFEST_PIN:$HELPER_PIN" in *PENDING*) echo 'STOP: draft pending exact future159/helper pins; not runnable' >&2; exit 90;; esac
OUT="$A/p15b-s7-final-natural-r1-run"
SCRIPT="$A/p15b-s7-clean-natural-runner-draft/RUN-CLEAN-NATURAL.sh"
export S7_HELPER="$A/PENDING-REBOUND-S7-HELPER/MAKE-S7-MANIFEST.ts"
export S7_HELPER_BRIEF="$A/PENDING-REBOUND-S7-HELPER/BRIEF.md"
export S7_HELPER_PINS="$A/PENDING-REBOUND-S7-HELPER/PINS.json"
export S7_PROBE_PINS="$A/p15b-o1-o6-s7-current-draft-r2/PINS.json"
export S7_OBSERVER_PATCH="$A/p15b-o1-o6-s7-current-draft-r2/scratch-observer.patch"
export S7_RUNNER_BRIEF="$A/p15b-s7-clean-natural-runner-draft/BRIEF.md"
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH GIT_OPTIONAL_LOCKS=0
export P15B_FOCUS_INPUT_1="$C/tests/fixtures/p1364/generated-v45-late-draft"
export P15B_FOCUS_INPUT_2="$C/tests/fixtures/p14/genuine-v42-pre-shelving"
export P15B_FOCUS_INPUT_3="$C/tests/fixtures/p14/genuine-v42-pre-shelving-week93"
export P15B_FOCUS_INPUT_4="$C/tests/fixtures/p14/genuine-v45-recovery-predecessors-1363"
export P15B_FOCUS_INPUT_5="$C/tests/fixtures/p13b/genuine-v26-old-era-period-1363"
export P15B_FOCUS_INPUT_6="$C/tests/fixtures/p05a1-owner-profile-rev2.save.json"
export P15B_FOCUS_INPUT_7="$C/tests/fixtures/p05a3-owner-profile-rev10.save.json"
export P15B_FOCUS_INPUT_8="$C/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1171-p3-current45-capture"
export P15B_FOCUS_INPUT_9="$C/ui/public/lot/hollywood/role-atlas-v1.json"
export P15B_FOCUS_INPUT_10="$C/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-endurance-A-observer-fixed/authority-6240.json"
export P15B_FOCUS_INPUT_11="$C/tests/fixtures/p15/p15c2-route-l-captures"
export P15B_FOCUS_INPUT_12="$C/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368"
export P15B_FOCUS_INPUT_13="$A/p15b-bridge-ranking-impl-r1-run/freeze.json"
export P15B_FOCUS_INPUT_14="$A/p15b-bridge-ranking-impl-r1-run/bridge-focused.json"
export P1368_ACCEPTED45_ROOT="$P15B_FOCUS_INPUT_12"
export P1368_ACCEPTED45_MANIFEST_SHA256=11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5
export S7_TREE=final-current S7_SEED=p13a-core-causal-01 S7_WEEKS=520 S7_OBSERVER_MODE=clean
export S7_RUN=p15b-final-natural-r1
unset S7_SOURCE_MANIFEST S7_SOURCE_MANIFEST_SHA256 S7_CANDIDATE_SOURCE_ID
cd "$C" || exit 90
disk_floor() {
  local need=$1 avail
  avail=$(df -Pk "$R" | awk 'NR==2 {print $4}')
  [[ "$avail" =~ ^[0-9]+$ ]] && [ "$avail" -ge "$need" ] || { echo "STOP: disk below ${need}KiB" >&2; return 97; }
}
freeze_snapshot() {
python3 -I - "$C" "$P" "$SCRIPT" <<'SNAP'
import os,sys,json,hashlib,subprocess,pathlib
r,p,b=sys.argv[1:]; g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',r]
def git(*a): return subprocess.check_output(g+list(a))
def digest(q):
 q=pathlib.Path(q)
 if q.is_symlink(): return ['symlink',os.readlink(q)]
 if q.is_file(): return ['file',hashlib.sha256(q.read_bytes()).hexdigest(),q.stat().st_mode & 0o777]
 return ['missing']
paths=set(x.decode() for x in git('ls-files','-z').split(b'\0') if x)
untracked=[x.decode() for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x]
m=json.loads((pathlib.Path(p)/'MANIFEST.json').read_text())
probes={'tests/zz-s7-lib.ts','tests/zz-s7-natural-route.test.ts','tests/zz-s7-decide-diag.test.ts'}
manifest_paths={f['path'] for f in m['files']}
def scoped(x):
 q=pathlib.PurePosixPath(x)
 if x in manifest_paths or x in probes:return True
 if x.startswith('tests/fixtures/'):return False
 if q.parts[0] in ('src','tests','ui','bridge','generated','scripts','tools'):
  return q.suffix in ('.ts','.tsx','.js','.mjs','.cjs','.json','.css','.html','.py','.sh','.yaml','.yml') and 'node_modules' not in q.parts and 'public' not in q.parts[1:]
 return len(q.parts)==1 and (q.suffix in ('.json','.js','.mjs','.cjs','.yaml','.yml') or x in ('package-lock.json','package.json'))
paths={x for x in paths if scoped(x)}
paths.update(x for x in untracked if x in manifest_paths or x in probes)
paths.add('generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs')
d={'HEAD':git('rev-parse','HEAD').decode().strip(),'index':hashlib.sha256(git('ls-files','--stage','-z')).hexdigest(),'cached':hashlib.sha256(git('diff','--cached','--binary')).hexdigest(),'diff':hashlib.sha256(git('diff','--binary')).hexdigest(),'status':git('status','--porcelain=v1','-z','--untracked-files=all').hex(),'untrackedPaths':sorted(untracked),'files':{x:digest(pathlib.Path(r)/x) for x in sorted(paths)},'inputs':{}}
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(b),pathlib.Path(os.environ['S7_HELPER']),pathlib.Path(os.environ['S7_HELPER_BRIEF']),pathlib.Path(os.environ['S7_HELPER_PINS']),pathlib.Path(os.environ['S7_PROBE_PINS']),pathlib.Path(os.environ['S7_OBSERVER_PATCH']),pathlib.Path(os.environ['S7_RUNNER_BRIEF'])]:d['inputs'][str(q)]=digest(q)
for key in ['P15B_FOCUS_INPUT_1','P15B_FOCUS_INPUT_2','P15B_FOCUS_INPUT_3','P15B_FOCUS_INPUT_4','P15B_FOCUS_INPUT_5','P15B_FOCUS_INPUT_6','P15B_FOCUS_INPUT_7','P15B_FOCUS_INPUT_8','P15B_FOCUS_INPUT_9','P15B_FOCUS_INPUT_10','P15B_FOCUS_INPUT_11','P15B_FOCUS_INPUT_12','P15B_FOCUS_INPUT_13','P15B_FOCUS_INPUT_14']:
 root=os.environ.get(key)
 if root:
  q=pathlib.Path(root)
  if not q.exists(): raise SystemExit('STOP: missing required input '+root)
  d['inputs'][root]=digest(q) if not q.is_dir() else {str(x.relative_to(q)):digest(x) for x in sorted(q.rglob('*')) if x.is_file() or x.is_symlink()}
if os.environ.get('S7_SOURCE_MANIFEST'):
 d['inputs'][os.environ['S7_SOURCE_MANIFEST']]=digest(os.environ['S7_SOURCE_MANIFEST'])
 d['inputs'][str(pathlib.Path(os.environ['S7_SOURCE_MANIFEST']).parent/'actual-fields.json')]=digest(pathlib.Path(os.environ['S7_SOURCE_MANIFEST']).parent/'actual-fields.json')
print(json.dumps(d,sort_keys=True))
SNAP
}
check_freeze() {
  freeze_snapshot > "$OUT/freeze-current.json" || return 98
  cmp -s "$FREEZE_REF" "$OUT/freeze-current.json" || { echo 'STOP: frozen HEAD/index/worktree/inputs changed' >&2; return 98; }
}
require_lane() {
python3 -I - <<'LANE'
import os,pathlib,subprocess,shlex
p=pathlib.Path('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
if p.is_symlink() or not p.is_file() or p.stat().st_nlink!=1:raise SystemExit('STOP: unsafe or absent lane lock')
marker=p.read_text().strip();pid=os.getppid();found=False
while pid>1:
 args=subprocess.check_output(['ps','-p',str(pid),'-o','args='],text=True).strip();parts=shlex.split(args)
 for i,x in enumerate(parts):
  if x.endswith('/lane-run-r8.sh') and len(parts)>i+2 and marker.startswith('lane-run '+parts[i+2]+' token='):found=True
 pid=int(subprocess.check_output(['ps','-p',str(pid),'-o','ppid='],text=True).strip())
if not found:raise SystemExit('STOP: gate must be child of owned existing lane')
LANE
}

require_lane || exit 99
[ "$(node --version)" = v20.20.2 ] || exit 90
[ "$(command -v python3)" = "$R/.venv/bin/python3" ] || exit 90
disk_floor 3670016 || exit 97
[ ! -e "$OUT" ] && [ ! -L "$OUT" ] || exit 90
[ ! -e /Users/zacheryspector/studio-scratch/1363-measurement-prep/runs/p15b-final-natural-r1 ] && [ ! -L /Users/zacheryspector/studio-scratch/1363-measurement-prep/runs/p15b-final-natural-r1 ] || exit 90
# Bind actual packet and helper before hashing/install execution; helper handles full159 admission.
python3 -I - "$P" "$PATCH_PIN" "$PACKET_MANIFEST_PIN" "$S7_HELPER" "$HELPER_PIN" "$OUT" <<'PINS'
import hashlib,pathlib,sys
p,patch,manifest,helper,hpin,out=sys.argv[1:]
for name,pin in [(str(pathlib.Path(p)/'PATCH.diff'),patch),(str(pathlib.Path(p)/'MANIFEST.json'),manifest),(helper,hpin)]:
 q=pathlib.Path(name)
 if q.is_symlink() or q.resolve()!=q or hashlib.sha256(q.read_bytes()).hexdigest()!=pin:raise SystemExit('STOP: exact rebind pin '+name)
q=pathlib.Path(out);a=q.parent
if a.resolve()!=a or not a.is_dir():raise SystemExit('STOP: unsafe output parent')
q.mkdir()
PINS
[ "$?" = 0 ] || exit 98
FREEZE_REF="$OUT/freeze-initial.json"
freeze_snapshot > "$FREEZE_REF" || exit 98
run() {
 local name=$1 ec start end; shift
 check_freeze || return 98
 disk_floor 3145728 || return 97
 start=$(date +%s)
 nice -n 10 "$@" > "$OUT/$name.log" 2>&1
 ec=$?;end=$(date +%s)
 python3 -I - "$OUT" "$name" "$ec" "$start" "$end" "$@" <<'RECORD'
import json,pathlib,sys
out,name,ec,start,end,*cmd=sys.argv[1:]
r={'name':name,'exit':int(ec),'startEpoch':int(start),'endEpoch':int(end),'seconds':int(end)-int(start),'node':'v20.20.2','command':cmd,'log':str(pathlib.Path(out)/(name+'.log'))}
with (pathlib.Path(out)/'results.jsonl').open('a') as f:f.write(json.dumps(r)+'\n')
print(json.dumps({k:r[k] for k in ['name','exit','seconds']}),flush=True)
RECORD
 [ "$?" = 0 ] || return 98
 check_freeze || return 98
 disk_floor 3145728 || return 97
 return "$ec"
}
# Initial source/input freeze deliberately excludes nonexistent manifest. Only helper creates it.
run manifest-clean ./node_modules/.bin/vite-node --root "$C" "$S7_HELPER" clean "$OUT/source-clean.json" || exit "$?"
check_freeze || exit 98
# Admit actual produced shape/pins, then extend freeze. Initial freeze is preserved forever.
python3 -I - "$OUT/source-clean.json" "$OUT" <<'FIELDS'
import hashlib,json,pathlib,sys
p,out=map(pathlib.Path,sys.argv[1:]);raw=p.read_bytes();m=json.loads(raw)
if p.is_symlink() or p.resolve()!=p or m['arm']!='final-current' or m['head']!='d68d4b13b454922cf84eff5c0c73cae3e780eebe' or m['liveSaveVersion']!=48 or m['admission']['mode']!='clean':raise SystemExit('STOP: actual helper manifest scope')
pins={'S7_SOURCE_MANIFEST_SHA256':hashlib.sha256(raw).hexdigest(),'S7_CANDIDATE_SOURCE_ID':m['candidateSourceIdentity'],'S7_EXPECTED_HEAD':m['head']}
for v in pins.values():
 if not all(c in '0123456789abcdef' for c in v) or len(v) not in (40,64):raise SystemExit('STOP: unsafe actual pin')
with (out/'actual-fields.json').open('x') as f:json.dump(pins,f,indent=2);f.write('\n')
FIELDS
[ "$?" = 0 ] || exit 98
export S7_SOURCE_MANIFEST="$OUT/source-clean.json"
export S7_SOURCE_MANIFEST_SHA256="$(python3 -I -c 'import json,sys;print(json.load(open(sys.argv[1]))["S7_SOURCE_MANIFEST_SHA256"])' "$OUT/actual-fields.json")"
export S7_CANDIDATE_SOURCE_ID="$(python3 -I -c 'import json,sys;print(json.load(open(sys.argv[1]))["S7_CANDIDATE_SOURCE_ID"])' "$OUT/actual-fields.json")"
export S7_EXPECTED_HEAD=d68d4b13b454922cf84eff5c0c73cae3e780eebe
FREEZE_REF="$OUT/freeze-test.json"
freeze_snapshot > "$FREEZE_REF" || exit 98
# Exactly one natural test, original3,600,000ms body budget; NO timeout override/watchdog/compiler.
run natural-final node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache tests/zz-s7-natural-route.test.ts --reporter=default --reporter=json --outputFile.json="$OUT/natural-final.json"
ec=$?
check_freeze || exit 98
printf 'terminal natural-final=%s; unchanged=yes; final-arm-first520/legacy521, no control/full1363V claim\n' "$ec"
exit "$ec"
