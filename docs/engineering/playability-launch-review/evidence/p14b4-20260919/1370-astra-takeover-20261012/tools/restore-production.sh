#!/bin/bash
# Restore only unchanged, gate-owned candidate paths. Foreign changes always stop restoration.
set -u
[ "$#" = 1 ] || exit 90
OUT="$1"; R=/Users/zacheryspector/The-Movies-headless-program
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
for f in HEAD-BEFORE staged-added.txt staged-modified.txt freeze.json PACKAGE BASELINE; do
 [ -f "$OUT/$f" ] || { echo "STOP: missing $f"; exit 91; }
done
P=$(cat "$OUT/PACKAGE"); BASELINE=$(cat "$OUT/BASELINE")
cd "$R" || exit 90
disk_floor() {
  local need=$1 avail
  avail=$(df -Pk "$R" | awk 'NR==2 {print $4}')
  [[ "$avail" =~ ^[0-9]+$ ]] && [ "$avail" -ge "$need" ] || { echo "STOP: disk below ${need}KiB" >&2; return 97; }
}
freeze_snapshot() {
python3 -I - "$R" "$P" "$BASELINE" <<'SNAP'
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
for key in ['P1368_ACCEPTED45_ROOT','P1368_ACCEPTED26_ROOT','RIVAL_WRITING_CAPTURE_DIR','TRUST_AUTHORING_CAPTURE_DIR']:
 root=os.environ.get(key)
 if root:
  q=pathlib.Path(root);d['inputs'][root]=digest(q) if not q.is_dir() else {str(x.relative_to(q)):digest(x) for x in sorted(q.rglob('*')) if x.is_file() or x.is_symlink()}
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
# Restore under the exact same fixture environment recorded by the gate.
export P1368_ACCEPTED45_ROOT=$R/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368
export P1368_ACCEPTED26_ROOT=$R/tests/fixtures/p13b/genuine-v26-period52-1368
export RIVAL_WRITING_CAPTURE_DIR=$R/tests/fixtures/p14/genuine-v46-rival-writing-pre414-1368
export TRUST_AUTHORING_CAPTURE_DIR=$R/tests/fixtures/p14/genuine-v45-trust-authoring-week195-1368
check_freeze || exit 98
[ "$($G rev-parse HEAD)" = "$(cat "$OUT/HEAD-BEFORE")" ] || exit 92
# A gate running concurrently inside this lane would violate parent ownership; refuse project children.
if ps -axo args= | grep -E '[v]itest run|[/]bin/tsc|[/]lib/tsc.js|[g]enerate-bridge-contract' >/dev/null; then
 echo 'STOP: project check still running'; exit 93
fi
cat "$OUT/staged-added.txt" "$OUT/staged-modified.txt" > "$OUT/restore-owned.txt"
$G restore --staged --pathspec-from-file="$OUT/restore-owned.txt" || exit 95
$G restore --worktree --pathspec-from-file="$OUT/staged-modified.txt" || exit 95
while IFS= read -r f; do
 [ -n "$f" ] || continue
 [ -f "$R/$f" ] && [ ! -L "$R/$f" ] || { echo "STOP: unsafe added path $f"; exit 95; }
 rm -- "$R/$f" || exit 95
done < "$OUT/staged-added.txt"
[ -z "$($G status --porcelain=v1 --untracked-files=all)" ] || { echo 'STOP: restore left changes'; exit 96; }
echo "production restored at $($G rev-parse HEAD)"
