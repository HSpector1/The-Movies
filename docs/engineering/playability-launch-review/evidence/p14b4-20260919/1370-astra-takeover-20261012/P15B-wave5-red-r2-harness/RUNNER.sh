#!/bin/bash
# Bounded Wave5 UI compiler and exactly four corrected browser controls; prior core results are separate evidence.
# Parent alone schedules. No test/source mutation or timeout override.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/p15b
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/p15b-save48-wave5-red-r2-harness"
OUT="$A/p15b-wave5-red-r2-run"
SCRIPT="$A/p15b-wave5-red-r2.sh"
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
d={'HEAD':git('rev-parse','HEAD').decode().strip(),'index':hashlib.sha256(git('ls-files','--stage','-z')).hexdigest(),'cached':hashlib.sha256(git('diff','--cached','--binary')).hexdigest(),'diff':hashlib.sha256(git('diff','--binary')).hexdigest(),'status':git('status','--porcelain=v1','-z','--untracked-files=all').hex(),'untrackedPaths':sorted(untracked),'files':{x:digest(pathlib.Path(r)/x) for x in sorted(paths)},'inputs':{}}
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(p)/'SELECTED-FOUR-IDENTITIES.json',pathlib.Path(b)]:d['inputs'][str(q)]=digest(q)
for key in ['P15B_FOCUS_INPUT_1','P15B_FOCUS_INPUT_2','P15B_FOCUS_INPUT_3','P15B_FOCUS_INPUT_4','P15B_FOCUS_INPUT_5','P15B_FOCUS_INPUT_6','P15B_FOCUS_INPUT_7','P15B_FOCUS_INPUT_8','P15B_FOCUS_INPUT_9','P15B_FOCUS_INPUT_10','P15B_FOCUS_INPUT_11']:
 root=os.environ.get(key)
 if root:
  q=pathlib.Path(root)
  if not q.exists(): raise SystemExit('STOP: missing required input '+root)
  d['inputs'][root]=digest(q) if not q.is_dir() else {str(x.relative_to(q)):digest(x) for x in sorted(q.rglob('*')) if x.is_file() or x.is_symlink()}
print(json.dumps(d,sort_keys=True))
SNAP
}
check_freeze() {
  freeze_snapshot > "$OUT/freeze-current.json" || return 98
  cmp -s "$OUT/freeze.json" "$OUT/freeze-current.json" || { echo 'STOP: frozen HEAD/index/worktree/inputs changed' >&2; return 98; }
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
python3 -I - "$C" "$P" <<'ADMIT'
import hashlib,json,pathlib,subprocess,sys
c,p=map(pathlib.Path,sys.argv[1:]);g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',str(c)]
def need(ok,msg):
 if not ok:raise SystemExit('STOP: '+msg)
need(subprocess.check_output(g+['rev-parse','HEAD']).decode().strip()=='d68d4b13b454922cf84eff5c0c73cae3e780eebe','candidate HEAD changed')
for f,h in [('PATCH.diff','d1d70308328416ec3644b6dc4a8cda9ab89a5c5dab5efb390bd275bb41ae9093'),('MANIFEST.json','44026cb783b1a4ecddb1785a7ae8e65931628bd768c6c90e329faf2c109a1178'),('SELECTED-FOUR-IDENTITIES.json','5e967cbf52ba628c6f3dc25f19fd42cb1111184cbeb2ce70246a07c94339303c')]:need(hashlib.sha256((p/f).read_bytes()).hexdigest()==h,'candidate packet changed '+f)
m=json.loads((p/'MANIFEST.json').read_text());need(len(m['files'])==145,'manifest count')
def paths(*args):return {x.decode() for x in subprocess.check_output(g+list(args)).split(b'\0') if x}
expected={f['path'] for f in m['files']}
need(paths('diff','--cached','--name-only','-z')==expected,'complete staged path set differs from candidate')
need(paths('diff','--name-only','-z') <= {'HANDOFF.md'},'unstaged change outside local HANDOFF')
need(not subprocess.check_output(g+['ls-files','--unmerged','-z']),'unmerged index entries')
need(not paths('ls-files','--others','--exclude-standard','-z'),'unexpected untracked input')
for f in m['files']:
 q=c/f['path'];need(not q.is_symlink() and oct(q.stat().st_mode & 0o777)==f['mode'],'working mode '+f['path']);need(hashlib.sha256(q.read_bytes()).hexdigest()==f['sha256'],'working postimage '+f['path'])
 need(hashlib.sha256(subprocess.check_output(g+['show',':'+f['path']])).hexdigest()==f['sha256'],'indexed postimage '+f['path'])
subprocess.run(g+['diff','--check'],check=True)
subprocess.run(g+['apply','--check','--reverse',str(p/'PATCH.diff')],check=True)
print('Wave5 RED r2: exact145 WT/index postimages; reviewed packet; reverse check PASS')
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
run tsc-ui node node_modules/typescript/bin/tsc --noEmit -p ui/tsconfig.json || exit "$?"
run wave5-red node node_modules/vitest/vitest.mjs run --project ui --no-file-parallelism --no-cache ui/src/saves.test.tsx ui/src/lot/livingTurn.parity.test.tsx -t '^(?:Wave5\ genuine47\ normal\ import\ replaces\ App\ session\ prospectively\ without\ old\ notices|Wave5\ actual\ terminal\ import\ replaces\ active\ App\ state\ and\ reloads\ read\-only\ with\ exact\ export/history|Wave5\ unsupported\ due\-only\ draft\ refuses\ before\ App\ replacement\ or\ any\ autosave|Wave5\ living\ loop\ commits\ terminal\ once\ and\ keeps\ history/export\ accessible\ without\ operating\ verbs)$' --reporter=default --reporter=json --outputFile.json="$OUT/wave5-red.json"
wave5_ec=$?
[ "$wave5_ec" -le 1 ] || exit "$wave5_ec"
check_freeze || exit 98
printf 'terminal wave5-red=%s; unchanged=yes; parent must check exact four selected identities and report excluded historical leaves separately\n' "$wave5_ec"
exit "$wave5_ec"
