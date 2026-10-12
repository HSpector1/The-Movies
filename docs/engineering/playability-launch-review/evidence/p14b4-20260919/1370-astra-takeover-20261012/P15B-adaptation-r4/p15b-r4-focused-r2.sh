#!/bin/bash
# Bounded r4 adaptation prerequisites, using the existing lane/freeze pattern.
# Parent alone schedules. No test/source mutation or timeout override.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/p15b
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/p15b-save48-on-d68d4b13-r4"
OUT="$A/p15b-r4-focused-r2-run"
SCRIPT="$A/p15b-r4-focused-r2.sh"
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH GIT_OPTIONAL_LOCKS=0
export P15B_FOCUS_INPUT_1="$C/tests/fixtures/p1364/generated-v45-late-draft"
export P15B_FOCUS_INPUT_2="$C/tests/fixtures/p14/genuine-v42-pre-shelving"
export P15B_FOCUS_INPUT_3="$C/tests/fixtures/p14/genuine-v42-pre-shelving-week93"
export P15B_FOCUS_INPUT_4="$C/tests/fixtures/p14/genuine-v45-recovery-predecessors-1363"
export P15B_FOCUS_INPUT_5="$C/tests/fixtures/p13b/genuine-v26-old-era-period-1363"
export P15B_FOCUS_INPUT_6="$C/tests/fixtures/p05a1-owner-profile-rev2.save.json"
export P15B_FOCUS_INPUT_7="$C/tests/fixtures/p05a3-owner-profile-rev10.save.json"
export P15B_FOCUS_INPUT_8="$C/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1171-p3-current45-capture"
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
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(b)]:d['inputs'][str(q)]=digest(q)
for key in ['P15B_FOCUS_INPUT_1','P15B_FOCUS_INPUT_2','P15B_FOCUS_INPUT_3','P15B_FOCUS_INPUT_4','P15B_FOCUS_INPUT_5','P15B_FOCUS_INPUT_6','P15B_FOCUS_INPUT_7','P15B_FOCUS_INPUT_8']:
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
for f,h in [('PATCH.diff','c0958daf3a71176d349343ad3b16532ead4db8f0392a0a25cea5cc0e108db340'),('MANIFEST.json','ee867eba68baa19dfc7c968459c23d4c7f94cc625f914dc5146b75a71e7bbf32')]:need(hashlib.sha256((p/f).read_bytes()).hexdigest()==h,'candidate packet changed '+f)
m=json.loads((p/'MANIFEST.json').read_text());need(len(m['files'])==137,'manifest count')
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
print('r4: exact137 WT/index postimages; reviewed packet; reverse check PASS')
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
run tsc-root node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json || exit "$?"
run tsc-ui node node_modules/typescript/bin/tsc --noEmit -p ui/tsconfig.json || exit "$?"
run tsc-bridge node node_modules/typescript/bin/tsc --noEmit -p tsconfig.bridge.json || exit "$?"
run generator-contract node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts --check || exit "$?"
run generator-fixtures node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts --check || exit "$?"
run core-preservation node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache tests/p1364-late-founding.test.ts tests/bridge-p1364-founding-no-advance.test.ts tests/p15b2-corporate-condition-save.test.ts tests/p15b4-studio-closure-save.test.ts --reporter=default --reporter=json --outputFile.json="$OUT/core-preservation.json"
core_ec=$?
[ "$core_ec" -le 1 ] || exit "$core_ec"
run q07 node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache tests/p14p4p5-opportunities.test.ts -t 'Q07 rejects nonempty suffix and owner contradictions after actual cast work' --reporter=default --reporter=json --outputFile.json="$OUT/q07.json"
q07_ec=$?
[ "$q07_ec" -le 1 ] || exit "$q07_ec"
check_freeze || exit 98
printf 'terminal core=%s q07=%s; unchanged=yes; parent must inspect reporter completeness\n' "$core_ec" "$q07_ec"
[ "$core_ec" = 0 ] || exit "$core_ec"
exit "$q07_ec"
