#!/bin/bash
# land-slice.sh <package-dir> <expected-patch-sha256> <expected-predecessor-src-tree> <baseline-failures.txt> <out-subdir>
# Landing gate in the production worktree for one slice. Applies PATCH.diff to the index (uncommitted), verifies
# the MANIFEST, then runs root/UI/bridge tsc, both generator checks, d16, the FULL core suite and the FULL UI suite
# under the formal runner environment, and attributes core failures by identity against the predecessor baseline.
# The full core run doubles as the next predecessor baseline. Never commits. On any STOP the tree is left as found.
set -u
[ "$#" = 5 ] || exit 90
P="$1"; EXPECT_SHA="$2"; EXPECT_SRC="$3"; BASELINE="$4"; SUB="$5"
R=/Users/zacheryspector/The-Movies-headless-program
OUT="$P/$SUB"
[ ! -e "$OUT" ] && [ ! -L "$OUT" ] || { echo "STOP: output already exists"; exit 90; }
mkdir "$OUT" || exit 90
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$R/.venv/bin:$PATH   # 1361-M3: the venv (numpy/Pillow) is on the core/UI PATH
export GIT_OPTIONAL_LOCKS=0
export P1368_ACCEPTED45_ROOT=$R/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368
export P1368_ACCEPTED45_MANIFEST_SHA256=11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5
export P1368_ACCEPTED26_ROOT=$R/tests/fixtures/p13b/genuine-v26-period52-1368
export P1368_ACCEPTED26_MANIFEST_SHA256=8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4
export RIVAL_WRITING_CAPTURE_DIR=$R/tests/fixtures/p14/genuine-v46-rival-writing-pre414-1368
export RIVAL_WRITING_MANIFEST_SHA256=d097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205
export TRUST_AUTHORING_CAPTURE_DIR=$R/tests/fixtures/p14/genuine-v45-trust-authoring-week195-1368
export TRUST_AUTHORING_MANIFEST_SHA256=0b98763001eb96949d8e312df5dfe600f1adf599f5466dd59eec214e1f229991
RES="$OUT/results.jsonl"; : > "$RES"
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

FAILED=0
run() { local name=$1 log=$2; shift 2; check_freeze && disk_floor 3145728 || exit $?; local t0=$(date +%s); "$@" > "$log" 2>&1; local ec=$?; local t1=$(date +%s)
  printf '{"name":"%s","exit":%d,"seconds":%d,"log":"%s","node":"%s"}\n' "$name" "$ec" "$((t1-t0))" "$log" "$(node --version)" >> "$RES" || exit 1
  check_freeze || exit $?
  [ "$ec" = 0 ] || FAILED=1
  echo "$(date '+%T') $name exit=$ec seconds=$((t1-t0)) $(grep -E 'Tests +[0-9]+ (passed|failed)' "$log" | tail -1 | tr -s ' ' | cut -c1-90)"; }

require_lane || exit 99
disk_floor 3670016 || exit 97
echo "== preconditions $(date -u +%FT%TZ)"
dirty=$($G status --short | wc -l | tr -d ' '); [ "$dirty" = "0" ] || { echo "STOP: dirty tree"; $G status --short | head; exit 91; }
HEAD0=$($G rev-parse HEAD); echo "$HEAD0" > "$OUT/HEAD-BEFORE"; echo "HEAD before: $HEAD0 src $($G rev-parse HEAD:src) node $(node --version)"
[ "$($G rev-parse HEAD:src)" = "$EXPECT_SRC" ] || { echo "STOP: src tree $($G rev-parse HEAD:src) != expected $EXPECT_SRC"; exit 92; }
SHA=$(shasum -a 256 "$P/PATCH.diff" | cut -d' ' -f1); [ "$SHA" = "$EXPECT_SHA" ] || { echo "STOP: PATCH.diff sha $SHA != $EXPECT_SHA"; exit 93; }
python3 -I - "$P/MANIFEST.json" "$HEAD0" "$EXPECT_SHA" "$EXPECT_SRC" <<'IDENTITY'
import json,sys
m=json.load(open(sys.argv[1]))
import subprocess
r='/Users/zacheryspector/The-Movies-headless-program'
g=['git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks','-C',r]
if m['baseSrcTree'] != sys.argv[4] or m['patch']['sha256'] != sys.argv[3]:raise SystemExit('STOP: manifest source or patch identity mismatch')
base=subprocess.run(g+['rev-parse',m['baseHead']+':src'],capture_output=True,text=True)
if base.returncode==0:
 if base.stdout.strip()!=sys.argv[4]:raise SystemExit('STOP: available base source mismatch')
 if subprocess.run(g+['merge-base','--is-ancestor',m['baseHead'],sys.argv[2]]).returncode!=0:raise SystemExit('STOP: available package base is not ancestor of HEAD')
if any(f['status'] not in ('modified','added') for f in m['files']):raise SystemExit('STOP: unsupported restoration file status')
IDENTITY
[ "$?" = 0 ] || exit 93
echo "== apply"; $G apply --check "$P/PATCH.diff" || { echo "STOP: apply --check"; exit 94; }
$G apply --index "$P/PATCH.diff" || { echo "STOP: apply"; exit 95; }
echo "staged entries: $($G diff --cached --name-only | wc -l | tr -d ' ')"
$G diff --cached --name-only --diff-filter=A > "$OUT/staged-added.txt"; $G diff --cached --name-only --diff-filter=M > "$OUT/staged-modified.txt"
python3 -I - "$P/MANIFEST.json" "$R" "$OUT/manifest-verify.json" <<'PY'
import json, sys, hashlib, os
m = json.load(open(sys.argv[1])); root = sys.argv[2]; res = {"ok": 0, "mismatch": [], "missing": []}
for f in m["files"]:
    p = os.path.join(root, f["path"])
    if not os.path.exists(p): res["missing"].append(f["path"]); continue
    if hashlib.sha256(open(p, "rb").read()).hexdigest() == f["sha256"]: res["ok"] += 1
    else: res["mismatch"].append(f["path"])
json.dump(res, open(sys.argv[3], "w"), indent=1)
print(f"manifest ok={res['ok']} mismatch={len(res['mismatch'])} missing={len(res['missing'])}")
if res['mismatch'] or res['missing']: raise SystemExit(96)
PY
[ "$?" = 0 ] || exit 96
freeze_snapshot > "$OUT/freeze.json" || exit 98
printf '%s\n' "$P" > "$OUT/PACKAGE"
printf '%s\n' "$BASELINE" > "$OUT/BASELINE"
echo "== types and generators"
run tsc-root "$OUT/tsc-root.log" nice -n 5 npx tsc --noEmit -p tsconfig.json
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
run tsc-ui "$OUT/tsc-ui.log" nice -n 5 npx tsc -p ui/tsconfig.json --noEmit
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
run tsc-bridge "$OUT/tsc-bridge.log" nice -n 5 npx tsc -p tsconfig.bridge.json --noEmit
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
run gen-contract "$OUT/gen-contract.log" node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts --check
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
run gen-contract-fixtures "$OUT/gen-contract-fixtures.log" node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts --check
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
[ "$FAILED" = 0 ] || { echo "STOP: prerequisite failed"; exit 1; }
echo "== d16"
run d16 "$OUT/d16.log" nice -n 5 npx vitest run --no-file-parallelism --config src/harness/d16/vitest.d16.config.ts --no-cache --reporter=default --reporter=json --outputFile.json="$OUT/d16.json"
echo "== full core (doubles as the next predecessor baseline)"
date -u +%FT%TZ > "$OUT/core-START"
run vitest-core-full "$OUT/core.log" nice -n 10 npx vitest run --no-file-parallelism --project core --reporter=json --outputFile="$OUT/core-full.json"
date -u +%FT%TZ > "$OUT/core-END"
python3 -I - "$OUT/core-full.json" "$BASELINE" "$OUT/core-failures.txt" "$OUT/attribution.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1])); base = set(l.rstrip("\n") for l in open(sys.argv[2]) if l.strip())
now = []; msgs = {}; occurrences = {}
for tr in sorted(d["testResults"], key=lambda t: t["name"]):
    for a in tr["assertionResults"]:
        if a["status"] == "failed":
            k = tr["name"].split("/tests/")[-1] + " :: " + (a.get("fullName") or "")
            occurrences[k] = occurrences.get(k, 0) + 1
            if occurrences[k] > 1: k += " :: occurrence=" + str(occurrences[k])
            now.append(k)
            msgs[k] = a.get("failureMessages") or []
open(sys.argv[3], "w").write("\n".join(now) + "\n")
ns = set(now); same = sorted(ns & base); new = sorted(ns - base); gone = sorted(base - ns)
json.dump({"tests": d["numTotalTests"], "passed": d["numPassedTests"], "failed": d["numFailedTests"], "pending": d["numPendingTests"],
           "todo": d["numTodoTests"], "failures": [{"id": x, "messages": msgs[x]} for x in now], "same": same, "new": [{"id": x, "msg": msgs[x]} for x in new], "gone": gone, "suiteDiagnostics": [{"name": t["name"], "message": t.get("message"), "status": t.get("status")} for t in d["testResults"]], "classificationLimit": "SAME is identity overlap only; message changes require manual comparison, solo passes are NONREPRODUCTION"}, open(sys.argv[4], "w"), indent=1)
print(f"core tests={d['numTotalTests']} passed={d['numPassedTests']} failed={d['numFailedTests']} SAME={len(same)} NEW={len(new)} GONE={len(gone)}")
for x in new: print("  NEW", x[:200]); print("      ", msgs[x])
PY
[ "$?" = 0 ] || exit 1
echo "== full UI"
run vitest-ui-full "$OUT/ui.log" nice -n 10 npx vitest run --no-file-parallelism --project ui --reporter=json --outputFile="$OUT/ui-full.json"
python3 -I - "$OUT/ui-full.json" "$OUT/ui-attribution.json" <<'PY'
import json, sys
# No UI baseline supplied: failures are unclassified and require controlled predecessor comparison.
d = json.load(open(sys.argv[1])); new = []; occurrences = {}
print(f"ui tests={d['numTotalTests']} passed={d['numPassedTests']} failed={d['numFailedTests']}")
for tr in d["testResults"]:
    for a in tr["assertionResults"]:
        if a["status"] == "failed":
            i = tr["name"].split("/ui/src/")[-1] + " :: " + (a.get("fullName") or "")
            occurrences[i] = occurrences.get(i, 0) + 1
            if occurrences[i] > 1: i += " :: occurrence=" + str(occurrences[i])
            new.append({"id": i, "msg": a.get("failureMessages") or []})
            print("  UI-FAIL", i[:180])
json.dump({"tests": d["numTotalTests"], "passed": d["numPassedTests"], "failed": d["numFailedTests"], "pending": d.get("numPendingTests"), "todo": d.get("numTodoTests"), "new": new, "suiteDiagnostics": [{"name": t["name"], "message": t.get("message"), "status": t.get("status")} for t in d["testResults"]]}, open(sys.argv[2], "w"), indent=1)
PY
[ "$?" = 0 ] || exit 1

check_freeze || exit $?
for f in d16.json core-full.json ui-full.json attribution.json ui-attribution.json; do
  [ -s "$OUT/$f" ] || { echo "STOP: missing result $f"; exit 1; }
done
python3 -I - "$OUT" <<'RESULTS'
import json,sys,pathlib
out=pathlib.Path(sys.argv[1]);bad=False
for name in ['d16.json','core-full.json','ui-full.json']:
 d=json.loads((out/name).read_text())
 if not isinstance(d.get('testResults'),list) or d.get('numTotalTests',0)<=0:raise SystemExit('STOP: empty or malformed test result '+name)
 if not d.get('success',False) or d.get('numFailedTests',0) or d.get('numFailedTestSuites',0):bad=True
raise SystemExit(1 if bad else 0)
RESULTS
[ "$?" = 0 ] || FAILED=1
echo "== done $(date -u +%FT%TZ)"; cat "$RES"
echo "Patch applied and staged at $HEAD0; NOT committed."

exit "$FAILED"
