#!/bin/bash
# UNRUN derivative: root compiler then four complete terminal-family files / five exact replacement leaves; pending final packet.
# Parent alone schedules. No test/source mutation or timeout override.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C="$R"
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/p15b-pending-families204-r3"
OUT="$A/p15b-pending-families-r2-run"
SCRIPT="$A/p15b-pending-families-runner-r3/runner.sh"
AUTO_HELPER="$A/p15b-auto-recorder-r4r2-draft/auto_freeze.py"
EXTRA_INPUTS="$A/p15b-d16-ui-r5-draft/RUNTIME-INPUTS.json"
SELECTION="$A/p15b-pending-families-runner-r3/SELECTION.json"
export AUTO_HELPER OUT EXTRA_INPUTS SELECTION
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
manifest_paths={f['path'] for f in m['files']}
def scoped(x):
 q=pathlib.PurePosixPath(x)
 if x in manifest_paths:return True
 if x.startswith('tests/fixtures/'):return False
 if q.parts[0] in ('src','tests','ui','bridge','generated','scripts','tools'):
  return q.suffix in ('.ts','.tsx','.js','.mjs','.cjs','.json','.css','.html','.py','.sh','.yaml','.yml') and 'node_modules' not in q.parts and 'public' not in q.parts[1:]
 return len(q.parts)==1 and (q.suffix in ('.json','.js','.mjs','.cjs','.yaml','.yml') or x in ('package-lock.json','package.json'))
paths={x for x in paths if scoped(x)}
paths.update(x for x in untracked if x in manifest_paths)
paths.add('generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs')
d={'HEAD':git('rev-parse','HEAD').decode().strip(),'index':hashlib.sha256(git('ls-files','--stage','-z')).hexdigest(),'cached':hashlib.sha256(git('diff','--cached','--binary')).hexdigest(),'diff':hashlib.sha256(git('diff','--binary')).hexdigest(),'status':git('status','--porcelain=v1','-z','--untracked-files=all').hex(),'untrackedPaths':sorted(untracked),'files':{x:digest(pathlib.Path(r)/x) for x in sorted(paths)},'inputs':{}}
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(b),pathlib.Path(os.environ['AUTO_HELPER']),pathlib.Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/p15b-d16-identity-accounting.py')]:d['inputs'][str(q)]=digest(q)
for key in ['P15B_FOCUS_INPUT_1','P15B_FOCUS_INPUT_2','P15B_FOCUS_INPUT_3','P15B_FOCUS_INPUT_4','P15B_FOCUS_INPUT_5','P15B_FOCUS_INPUT_6','P15B_FOCUS_INPUT_7','P15B_FOCUS_INPUT_8','P15B_FOCUS_INPUT_9','P15B_FOCUS_INPUT_10','P15B_FOCUS_INPUT_11','P15B_FOCUS_INPUT_12','P15B_FOCUS_INPUT_13','P15B_FOCUS_INPUT_14']:
 root=os.environ.get(key)
 if root:
  q=pathlib.Path(root)
  if not q.exists(): raise SystemExit('STOP: missing required input '+root)
  d['inputs'][root]=digest(q) if not q.is_dir() else {str(x.relative_to(q)):digest(x) for x in sorted(q.rglob('*')) if x.is_file() or x.is_symlink()}
import uuid
receipt=pathlib.Path(os.environ['OUT'])/('metadata-'+uuid.uuid4().hex)
d['autoMetadata']=json.loads(subprocess.check_output([sys.executable,'-I',os.environ['AUTO_HELPER'],'capture',r,str(receipt)]))
extra=pathlib.Path(os.environ['EXTRA_INPUTS']);selection=pathlib.Path(os.environ['SELECTION'])
d['inputs'][str(extra)]=digest(extra);d['inputs'][str(selection)]=digest(selection)
for item in json.loads(extra.read_text()):
 q=pathlib.Path(r)/item['path'];kind=item['kind']
 if kind=='optionalFile' and not q.exists() and not q.is_symlink():
  d['inputs'][str(q)]=['missing'];continue
 if q.is_symlink() or not q.exists():raise SystemExit('missing/unsafe extra input '+str(q))
 if kind in ('file','optionalFile'):
  if not q.is_file():raise SystemExit('not file '+str(q))
  d['inputs'][str(q)]=digest(q)
 else:
  if not q.is_dir():raise SystemExit('not directory '+str(q))
  walk=q.iterdir() if kind=='topLevelFiles' else q.rglob('*')
  entries=sorted(x for x in walk if x.is_file() or x.is_symlink())
  if not entries:raise SystemExit('empty required input '+str(q))
  if any(x.is_symlink() for x in entries):raise SystemExit('unsafe extra input symlink '+str(q))
  d['inputs'][str(q)]={str(x.relative_to(q)):digest(x) for x in entries}
print(json.dumps(d,sort_keys=True))
SNAP
}
check_freeze() {
  freeze_snapshot > "$OUT/freeze-current.json" || return 98
  python3 -I "$AUTO_HELPER" check "$OUT/freeze.json" "$OUT/freeze-current.json" >> "$OUT/metadata-checks.jsonl" 2>> "$OUT/metadata-checks-errors.log" || return 98
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
# MODE ADMISSION NOTE: final packet must be R-specific, or crossworkspace content+gitexec
# admission followed by exact actual-R mode freeze. Do not chmod R or waive its mode drift.
# AUTO helper/script are package-input frozen; changed stamps require exact hook facts.
# PENDING pins intentionally fail closed until parent supplies that reviewed binding.
python3 -I - "$C" "$P" "$SCRIPT" "$AUTO_HELPER" <<'ADMIT'
import os,hashlib,json,pathlib,subprocess,sys
c,p,script,helper=map(pathlib.Path,sys.argv[1:]);g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',str(c)]
def need(ok,msg):
 if not ok:raise SystemExit('STOP: '+msg)
need(hashlib.sha256(pathlib.Path(os.environ['EXTRA_INPUTS']).read_bytes()).hexdigest()=='2fceb39464fe13985c12d7d7503ed700696fbffcd1b9abea84fb2fec099c8d35','runtime input-list changed')
need(hashlib.sha256(pathlib.Path(os.environ['EXTRA_INPUTS']).read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_INPUTS_SHA256','PENDING'),'external input-list pin')
need(hashlib.sha256(pathlib.Path(os.environ['SELECTION']).read_bytes()).hexdigest()=='007ceac0ebcd6c26fbe9ca62d264bd2b7346016f8f2c634b4bacd864d9433750','literal complete followup selection pin')
need((c/'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs').is_file() and not (c/'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs').is_symlink(),'union fixture mandatory current binding')
need(hashlib.sha256(pathlib.Path(os.environ['SELECTION']).read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_SELECTION_SHA256','PENDING'),'external selection pin')
need(hashlib.sha256(script.read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_RUNNER_SHA256','PENDING_EXTERNAL_RUNNER_SHA256'),'external bootstrap runner pin')
need(hashlib.sha256(helper.read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_HELPER_SHA256','PENDING_EXTERNAL_HELPER_SHA256'),'external bootstrap helper pin')
need(subprocess.check_output(g+['rev-parse','HEAD']).decode().strip()=='6c7c77efab73fef2b4ad1b2a79a830242f1cb011','candidate HEAD changed')
for f,h in [('PATCH.diff','d4982f2e11c3737ee49cc22e27e450e89207dc7bc4c606bcedc5194549141b68'),('MANIFEST.json','36a2436cd24e7547c1187b151c6afbf1b96204047bb67b15880ce54205858d39')]:need(hashlib.sha256((p/f).read_bytes()).hexdigest()==h,'candidate packet changed '+f)
need(hashlib.sha256((c/'tests/fixtures/p14/genuine-v45-recovery-witnesses-1368/MANIFEST.json').read_bytes()).hexdigest()=='11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5','actual1368 pin differs')
m=json.loads((p/'MANIFEST.json').read_text());need(len(m['files'])==204,'manifest count')
def paths(*args):return {x.decode() for x in subprocess.check_output(g+list(args)).split(b'\0') if x}
expected={f['path'] for f in m['files']}
need(paths('diff','--cached','--name-only','-z')==expected,'complete staged path set differs from candidate')
need(paths('diff','--name-only','-z') <= {'HANDOFF.md'},'unstaged change outside local HANDOFF')
need(not subprocess.check_output(g+['ls-files','--unmerged','-z']),'unmerged index entries')
need(not paths('ls-files','--others','--exclude-standard','-z'),'unexpected untracked input')
need(hashlib.sha256((c/'tests/p13b-s2-doc03.test.ts').read_bytes()).hexdigest()=='370f0a64327df5463f2b91952a12b2da0355e1e840733fc29ed807594b59b780','reviewed loan-window DOC03 source')
for f in m['files']:
 q=c/f['path'];need(not q.is_symlink() and oct(q.stat().st_mode & 0o777)==f['mode'],'working mode '+f['path']);need(hashlib.sha256(q.read_bytes()).hexdigest()==f['sha256'],'working postimage '+f['path'])
 need(hashlib.sha256(subprocess.check_output(g+['show',':'+f['path']])).hexdigest()==f['sha256'],'indexed postimage '+f['path'])
 entry=subprocess.check_output(g+['ls-files','--stage','--',f['path']]).decode().split()[0]
 need(entry==('100755' if int(f['mode'],8)&0o111 else '100644'),'git executable mode '+f['path'])
subprocess.run(g+['diff','--check'],check=True)
subprocess.run(g+['apply','--check','--reverse',str(p/'PATCH.diff')],check=True)

print('Exact pending-rebound production WT/index candidate, no unstaged change, reviewed final pins, reverse check PASS')

ADMIT
[ "$?" = 0 ] || exit 98
mkdir "$OUT" || exit 90
freeze_snapshot > "$OUT/freeze.json" || exit 98
printf 'node=%s python=%s start=%s\n' "$(node --version)" "$(python3 --version)" "$(date -u +%FT%TZ)"
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
# All terminal paths after this point retain serial group statuses and child exit.
export FOLLOWUP_GROUPS_JSON='{}'
finish() {
 local exit_code=$?
 trap - EXIT
 python3 -I - "$OUT" "$exit_code" <<'TERMINAL'
import json,os,pathlib,sys
out=pathlib.Path(sys.argv[1]);code=int(sys.argv[2])
r={'overallExit':code,'groups':json.loads(os.environ['FOLLOWUP_GROUPS_JSON']),
'scope':'root compiler then four complete terminal-family files / five exact replacement leaves',
'identityAccounting':'parent independent complete reporter identity validation required',
'freezeQualification':'see preserved before/post snapshots and metadata checks; no blanket success on abnormal stop'}
with (out/'terminal.json').open('x') as f:json.dump(r,f,indent=2);f.write('\n')
TERMINAL
 [ "$?" = 0 ] || exit 98
 exit "$exit_code"
}
trap finish EXIT
remember() {
 FOLLOWUP_GROUPS_JSON=$(python3 -I - "$FOLLOWUP_GROUPS_JSON" "$1" "$2" <<'STATUS'
import json,sys
r=json.loads(sys.argv[1]);r[sys.argv[2]]=int(sys.argv[3]);print(json.dumps(r))
STATUS
 ) || exit 98
 export FOLLOWUP_GROUPS_JSON
}
run tsc-root node node_modules/typescript/bin/tsc --noEmit
ec=$?;remember tsc-root "$ec"
[ "$ec" = 0 ] || exit "$ec"
run equipment-core node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache --reporter=default --reporter=json --outputFile.json="$OUT/equipment-core.json" tests/p15b4-pending-player-adoption.test.ts tests/p15b4-proposal-transaction.test.ts tests/p15b4-pending-rival-work.test.ts tests/p15b4-player-proposal-transaction.test.ts
core_ec=$?;remember core "$core_ec"
[ "$core_ec" -le 1 ] || exit "$core_ec"
check_freeze || exit 98
disk_floor 3145728 || exit 97
exit "$core_ec"
