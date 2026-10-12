#!/bin/bash
# Bounded r5q3 root compiler and complete new11 regression file; original15 results retained separately.
# Parent alone schedules. No test/source mutation or timeout override.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
C=/Users/zacheryspector/studio-specialists/p15b
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
P="$A/p15b-save48-modern-legacy-r5q3-regression"
OUT="$A/p15b-legacy-regression-r5q3-run"
SCRIPT="$A/p15b-legacy-regression-r5q3.sh"
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
for q in [pathlib.Path(p)/'PATCH.diff',pathlib.Path(p)/'MANIFEST.json',pathlib.Path(b)]:d['inputs'][str(q)]=digest(q)
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
for f,h in [('PATCH.diff','945ac4d52bf55d2ecf399377b36a02127fa1647fe877256c925b80e2caaa78e9'),('MANIFEST.json','282cadedb3435df5db361db436531286e2313fc256459fb75822ae07198172eb')]:need(hashlib.sha256((p/f).read_bytes()).hexdigest()==h,'candidate packet changed '+f)
m=json.loads((p/'MANIFEST.json').read_text());need(len(m['files'])==142,'manifest count')
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
print('Legacy regression r5q3: exact142 WT/index postimages; reviewed packet; reverse check PASS')
ADMIT
[ "$?" = 0 ] || exit 98
mkdir "$OUT" || exit 90
freeze_snapshot > "$OUT/freeze.json" || exit 98
python3 -I - "$A" "$OUT" "$C" <<'REUSE'
import pathlib,hashlib,json,subprocess,sys
A,O,C=map(pathlib.Path,sys.argv[1:]);old=A/'p15b-legacy-modern-r5q2-run';P=A/'p15b-save48-modern-legacy-r5q2';N=A/'p15b-save48-modern-legacy-r5q3-regression'
newfile='tests/p15b-legacy-terminal-regression.test.ts'
def need(ok,msg):
 if not ok:raise SystemExit('STOP: original15 reuse '+msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for name,h in [('freeze.json','3d5800d5ff42c268b154f8066210fb0c8a640d6fb3a8b6b6774909cbfd44130d'),('freeze-current.json','3d5800d5ff42c268b154f8066210fb0c8a640d6fb3a8b6b6774909cbfd44130d'),('results.jsonl','720d510ae2a3fd24007a556a65b71162ce2775ebc5647c40681721c063f16e74'),('legacy-modern.json','0b223fdab7a4d5975b9ce1f2743c12a4ec75c04005a587add1016f3d37240d35')]:need(sha(old/name)==h,'pinned actual record '+name)
for name,h in [('PATCH.diff','420e91014b98487971f9f49b549972013ec3aa86e701e88e66b761b212d81087'),('MANIFEST.json','f17b024eb4b136a1f5a654b32d1a4ead54904fd9f52e8c847c778a85e7d2c078')]:need(sha(P/name)==h,'old packet '+name)
before=json.loads((old/'freeze.json').read_text());now=json.loads((O/'freeze.json').read_text())
need(before['HEAD']==now['HEAD'],'HEAD changed')
newfiles=dict(now['files']);need(newfiles.pop(newfile)==['file','7f21e7b10157618ac0026aab43bd33f2052bcc23c7bb2dda693a7ac5338c8b00',420],'new test bytes')
need(before['files']==newfiles,'old source/test/helper/config bytes changed')
g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',str(C)]
def git(*args):return subprocess.check_output(g+list(args))
rows=git('ls-files','--stage','-z').split(b'\0')
kept=[row for row in rows if row and row.split(b'\t',1)[1].decode()!=newfile]
need(hashlib.sha256(b'\0'.join(kept)+b'\0').hexdigest()==before['index'],'old index map changed')
need(hashlib.sha256(git('diff','--cached','--binary','--','.',':(exclude)'+newfile)).hexdigest()==before['cached'],'delta is not solely new test')
oldm={f['path']:f for f in json.loads((P/'MANIFEST.json').read_text())['files']};newm={f['path']:f for f in json.loads((N/'MANIFEST.json').read_text())['files']}
newm.pop(newfile);need(oldm==newm,'original141 manifest postimages changed')
oldinputs=dict(before['inputs']);newinputs=dict(now['inputs'])
for name in ['PATCH.diff','MANIFEST.json']:
 oldinputs.pop(str(P/name));newinputs.pop(str(N/name))
oldinputs.pop(str(A/'p15b-legacy-modern-r5q2.sh'));newinputs.pop(str(A/'p15b-legacy-regression-r5q3.sh'))
need(oldinputs==newinputs,'original required inputs changed')
results=[json.loads(line)for line in (old/'results.jsonl').read_text().splitlines()]
need(len(results)==2 and all(r['exit']==0 and r['node']=='v20.20.2' for r in results),'old child/runtime results')
report=json.loads((old/'legacy-modern.json').read_text());need(report['numTotalTests']==report['numPassedTests']==15 and report['numFailedTests']==report['numPendingTests']==report['numTodoTests']==0,'old15 completeness')
receipt={'original15Passed':15,'new11':'unexecuted at admission; root compiler then complete file required','oldPacketSha256':sha(P/'PATCH.diff'),'newPacketSha256':sha(N/'PATCH.diff'),'oldReporterSha256':sha(old/'legacy-modern.json'),'exactOriginal141':True,'exactOldIndexExcludingNewTest':True,'exactOldSourceTestsHelpersConfigAndRequiredInputs':True,'metadataException':'HANDOFF-only unstaged metadata changed outside runs; current complete freeze enforced','environment':'same Node20.20.2 and installed dependencies; no dependency install or edits in this session; package and lock bytes unchanged','claimsLimit':'15 reused plus independently measured new11, never one26-test run'}
(O/'original15-reuse.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('Original15 GREEN retained: exact original indexed postimages, source/helpers/config and required inputs; one new test only')
REUSE
[ "$?" = 0 ] || exit 98
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
run tsc-root node node_modules/typescript/bin/tsc --noEmit || exit "$?"
run legacy-regression node node_modules/vitest/vitest.mjs run --project core --no-file-parallelism --no-cache tests/p15b-legacy-terminal-regression.test.ts --reporter=default --reporter=json --outputFile.json="$OUT/legacy-regression.json"
legacy_ec=$?
[ "$legacy_ec" -le 1 ] || exit "$legacy_ec"
check_freeze || exit 98
printf 'terminal legacy-regression=%s; unchanged=yes; parent must inspect reporter completeness\n' "$legacy_ec"
exit "$legacy_ec"
