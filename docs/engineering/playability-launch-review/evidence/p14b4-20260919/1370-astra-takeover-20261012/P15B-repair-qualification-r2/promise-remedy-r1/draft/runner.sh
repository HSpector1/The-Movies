#!/bin/bash
# UNRUN DRAFT: production DOC03 complete-file setup diagnostic only, no timeout override; final pins intentionally PENDING.
# Parent alone schedules. No test/source mutation or timeout override.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C="$R"
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/p15b-post-fullgate-lawful194-r2"
OUT="$A/p15b-promise-public-remedy-r1-run"
SCRIPT="$A/p15b-promise-public-remedy-r1-draft/runner.sh"
AUTO_HELPER="$A/p15b-auto-recorder-r4r2-draft/auto_freeze.py"
EXTRA_INPUTS="$A/p15b-affected44-r1-draft/RUNTIME-INPUTS.json"
SELECTION="/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-astra-takeover-20261012/P15B-post-fullgate-repairs-r1/AFFECTED-CORE-FILES.json"
DIAGNOSTIC="$A/p15b-promise-public-remedy-r1-draft/DIAGNOSTIC.ts"
export AUTO_HELPER OUT EXTRA_INPUTS SELECTION DIAGNOSTIC
export P15B_PROMISE_PUBLIC_REMEDY_JSON="$OUT/diagnostic.json"
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
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(b),pathlib.Path(os.environ['DIAGNOSTIC']),pathlib.Path(r)/'node_modules/vite-node/vite-node.mjs',pathlib.Path(os.environ['AUTO_HELPER']),pathlib.Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/p15b-d16-identity-accounting.py')]:d['inputs'][str(q)]=digest(q)
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
 if q.is_symlink() or not q.exists():raise SystemExit('missing/unsafe extra input '+str(q))
 if kind=='file':
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
need(hashlib.sha256(pathlib.Path(os.environ['EXTRA_INPUTS']).read_bytes()).hexdigest()=='d06a2ecd4644a325918b2b2153f3f6099f02771bd66a85c8ea55844734934097','runtime input-list changed')
need(hashlib.sha256(pathlib.Path(os.environ['EXTRA_INPUTS']).read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_INPUTS_SHA256','PENDING'),'external input-list pin')
need(hashlib.sha256(pathlib.Path(os.environ['SELECTION']).read_bytes()).hexdigest()=='f291b97bb1d74a7318c73a8d0972e3a12730aea440d6fbe7de13f879dda4b0b7','literal complete44 selection pin')
need((c/'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs').is_file() and not (c/'generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs').is_symlink(),'union fixture mandatory current binding')
need(hashlib.sha256(pathlib.Path(os.environ['SELECTION']).read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_SELECTION_SHA256','PENDING'),'external selection pin')
need(hashlib.sha256(pathlib.Path(os.environ['DIAGNOSTIC']).read_bytes()).hexdigest()=='db28daca840408d2ebb3726974b6008d221f4d7a258a165e8d814590d66098e1','diagnostic derivative pin')
need((c/'node_modules/vite-node/vite-node.mjs').is_file(),'installed vite-node entrypoint')
need(hashlib.sha256(script.read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_RUNNER_SHA256','PENDING_EXTERNAL_RUNNER_SHA256'),'external bootstrap runner pin')
need(hashlib.sha256(helper.read_bytes()).hexdigest()==os.environ.get('P15B_BOOTSTRAP_HELPER_SHA256','PENDING_EXTERNAL_HELPER_SHA256'),'external bootstrap helper pin')
need(subprocess.check_output(g+['rev-parse','HEAD']).decode().strip()=='d099499a3423cd99018495e057cf419215c71e99','candidate HEAD changed')
for f,h in [('PATCH.diff','7f6db62c4bf897c30b92e4d6644cfd46d3aef0a919f89cbaa00839adad97763d'),('MANIFEST.json','b642bad9359023e777f242f3e68aeb23ecb8bd90969b24bd5287347f68fb3c96')]:need(hashlib.sha256((p/f).read_bytes()).hexdigest()==h,'candidate packet changed '+f)
need(hashlib.sha256((c/'tests/fixtures/p14/genuine-v45-recovery-witnesses-1368/MANIFEST.json').read_bytes()).hexdigest()=='11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5','actual1368 pin differs')
m=json.loads((p/'MANIFEST.json').read_text());need(len(m['files'])==194,'manifest count')
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

print('Exact production194 WT/index candidate, no unstaged change, reviewed final pins, reverse check PASS')

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
run promise-public-remedy python3 -I - "$R" "$DIAGNOSTIC" "$OUT" <<'WATCHDOG'
import json,os,pathlib,signal,subprocess,sys,time
r,driver,out=sys.argv[1:];out=pathlib.Path(out)
start=time.monotonic();deadline=start+30.0
p=None;spawning=False;cleaning=False;interrupted=None;timed=False;child_exit=None;errors=[];remaining=None
class Interrupted(BaseException):pass
def interrupt(signum,frame):
 global interrupted
 interrupted=signum
 if not cleaning and not spawning:raise Interrupted()
for signum in (signal.SIGINT,signal.SIGTERM,signal.SIGHUP):signal.signal(signum,interrupt)
try:
 spawning=True
 try:
  p=subprocess.Popen(['node',str(pathlib.Path(r)/'node_modules/vite-node/vite-node.mjs'),driver],start_new_session=True)
 finally:spawning=False
 if interrupted is not None:raise Interrupted()
 try:child_exit=p.wait(timeout=max(0.001,deadline-time.monotonic()))
 except subprocess.TimeoutExpired:timed=True
except Interrupted:pass
except BaseException as e:errors.append(type(e).__name__+': '+str(e))
finally:
 cleaning=True
 # No poll here: returncodeNone reserves unreaped rootPID. Never signal a group
 # after wait/reap, even if another numerically matching process appears later.
 if p is not None and p.returncode is None:
  try:os.killpg(p.pid,signal.SIGKILL)
  except BaseException as e:errors.append('owned-group signal: '+type(e).__name__+': '+str(e))
  try:child_exit=p.wait(timeout=1.0) # cleanup/reap only; engine was killed, no cap extension
  except BaseException as e:errors.append('bounded reap: '+type(e).__name__+': '+str(e))
 elif p is not None:child_exit=p.returncode
 if p is not None:
  try:
   rows=subprocess.check_output(['ps','-axo','pid=,pgid='],text=True,timeout=1.0).splitlines()
   remaining=[x for x in rows if len(x.split())==2 and int(x.split()[1])==p.pid]
  except BaseException as e:errors.append('cleanup probe: '+type(e).__name__+': '+str(e))
 uncertain=bool(errors) or p is None or child_exit is None or remaining is None or bool(remaining)
 overall=98 if uncertain else (124 if timed else (128+interrupted if interrupted else (child_exit if child_exit>=0 else 128-child_exit)))
 record={'childPID':None if p is None else p.pid,'ownedGroupID':None if p is None else p.pid,
 'childExit':child_exit,'timedOut':timed,'interruptionSignal':interrupted,'deadlineSeconds':30,
 'elapsedSeconds':time.monotonic()-start,'cleanupUncertain':uncertain,'cleanupErrors':errors,
 'remainingOwnedGroupCount':None if remaining is None else len(remaining),'overallExit':overall,
 'scope':'standalone30s diagnostic cap, not original core5s leaf budget; no acceptance'}
 # Raw process rows stay local. Failure to record itself is98 and requires parent audit.
 try:
  with (out/'diagnostic-child.json').open('x') as f:json.dump(record,f,indent=2);f.write('\n')
  if remaining is not None:(out/'cleanup-processes.LOCAL.txt').write_text('\n'.join(remaining)+'\n')
  print(json.dumps(record),flush=True)
 except BaseException as e:
  print('STOP: receipt failed '+repr(e),file=sys.stderr,flush=True);overall=98
raise SystemExit(overall)

WATCHDOG
ec=$?
check_freeze || exit 98
disk_floor 3145728 || exit 97
printf 'terminal promise-public-remedy=%s; fixedgenuine35/cap horizon2704; earliest unmet premise retained, original4leaves unchanged\n' "$ec"
exit "$ec"
