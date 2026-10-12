#!/bin/bash
# ONE USE: parent-approved remaining UI after exact1032 AUTO incident. Never a full-gate pass.
# Run only under existing lane after original lane terminal98. No restoration or source mutation.
set -u
R=/Users/zacheryspector/The-Movies-headless-program
P=/Users/zacheryspector/studio-scratch/1370-ar-1364-1365-founding-market-implementation-20261010-r1
A=/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012
INC="$A/handoff-freeze-incident-1032"
OLD="$P/landing-r7q2-astra"
OUT="$P/landing-r7q2-astra-ui-continuation"
BASELINE=/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ar-post-r8-baseline-20261011/core-db3fc572-failures.txt
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
[ "$(node --version)" = v20.20.2 ] || exit 90
[ "$(command -v python3)" = "$R/.venv/bin/python3" ] || { echo 'STOP: scoped venv missing'; exit 90; }
disk_floor 3670016 || exit 97
[ ! -e "$OUT" ] && [ ! -L "$OUT" ] || { echo 'STOP: continuation output already exists'; exit 90; }
# Verify only the one immutable observed incident, never a general AUTO exemption.
python3 -I - "$INC" "$OLD" "$A" "$R" <<'PRE'
import json,pathlib,hashlib,re,sys
inc,old,a,r=map(pathlib.Path,sys.argv[1:])
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,msg):
 if not ok:raise SystemExit('STOP: '+msg)
pins={'freeze-at-start.json': '6a41d1e229f76c7297f174252899d021c1c9994d7b19b4a9058c7ba132ce3405', 'status.z': '59e747245d82deaee6ab4997af3f82c694288d63fc54917eccb330bce8e5689b', 'HANDOFF.before-hook.md': '7996863bbf22755643a96e0cebfa8e8c06b5d2b8dfcd46ab1a97a65921dd45b4', 'OBSERVATION.json': '61f5abd51b93d3c14cef9b8a831b6e44781fa99250b3635b3952aaa8cd0c30e2', 'HANDOFF.after-hook.md': 'c93d3abab5da95a5faf9b428ac3a4ea2d35a40008d469272447b91b6f453f549', 'freeze-observed-after-hook.json': '2a9bf3de5cc5e0c83f7f23406e7823bac35839a5979d6ae82cdf65f84546cb9a', 'freeze-last-successful-postflight.json': '6a41d1e229f76c7297f174252899d021c1c9994d7b19b4a9058c7ba132ce3405', 'HANDOFF.patch': '203bf4968332b4d7df9b2658b5554a73fdae8b69ae8847a78438cea08c9febf7'}
for name,h in pins.items():require(sha(inc/name)==h,'incident changed '+name)
meta=(a/'founding-r7q2-gate.log.meta').read_text();prefix='waiting for pid 0; then: bash /Users/zacheryspector/studio-scratch/1370-ar-integrator-tools-20261011/land-slice.sh /Users/zacheryspector/studio-scratch/1370-ar-1364-1365-founding-market-implementation-20261010-r1 f9d012fba521a05e56bee675c6b7527d099e0d2195f858af0102d36ed268961f cf7d20cd585f72fd178e06c3cd2a8821bbc0c26f /Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-ar-post-r8-baseline-20261011/core-db3fc572-failures.txt landing-r7q2-astra; 2026-10-12 09:14:09 CDT\nstart; 2026-10-12 09:14:09 CDT\n'
require(meta.startswith(prefix),'original lane meta prefix changed')
require(re.fullmatch(r'end, exit 98; [^\n]+\n',meta[len(prefix):]) is not None,'original lane not exact terminal98')
start=json.loads((inc/'freeze-at-start.json').read_text());observed=json.loads((inc/'freeze-observed-after-hook.json').read_text())
require(json.loads((old/'freeze.json').read_text())==start,'original freeze changed')
require(json.loads((old/'freeze-current.json').read_text())==observed,'original final snapshot not preserved observed drift')
require([k for k in start if start[k]!=observed[k]]==['diff','status'],'incident is not metadata-only')
before=(inc/'HANDOFF.before-hook.md').read_bytes();after=(inc/'HANDOFF.after-hook.md').read_bytes()
def outside(b):
 require(b.count(b'<!-- AUTO:BEGIN')==1 and b.count(b'<!-- AUTO:END -->')==1,'ambiguous AUTO markers')
 begin=b.index(b'<!-- AUTO:BEGIN');head=b.index(b'-->',begin)+3;end=b.index(b'<!-- AUTO:END -->',head)
 return b[:head]+b[end:]
require(outside(before)==outside(after),'HANDOFF outside AUTO changed')
require((r/'HANDOFF.md').read_bytes()==after,'HANDOFF differs from exact preserved stamp')
require((old/'HEAD-BEFORE').read_text().strip()==start['HEAD'],'HEAD receipt differs')
rows=[json.loads(l) for l in (old/'results.jsonl').read_text().splitlines()]
names=['tsc-root','tsc-ui','tsc-bridge','gen-contract','gen-contract-fixtures','d16','vitest-core-full']
require([x['name'] for x in rows]==names,'original children incomplete/unexpected')
require([x['exit'] for x in rows[:6]]==[0,0,0,0,0,1] and rows[6]['exit'] in (0,1),'unexpected original child outcomes')
logs=['tsc-root.log','tsc-ui.log','tsc-bridge.log','gen-contract.log','gen-contract-fixtures.log','d16.log','core.log']
for x,filename in zip(rows,logs):
 require(pathlib.Path(x['log'])==old/filename,'original child log identity differs')
 require(x['node']=='v20.20.2' and pathlib.Path(x['log']).parent==old and pathlib.Path(x['log']).is_file(),'child log/runtime mismatch')
def validate_result(path, child_exit, log):
 from collections import Counter
 d=json.loads(path.read_text())
 def need(ok,msg):
  if not ok:raise SystemExit('STOP: incomplete/malformed '+path.name+': '+msg)
 keys=['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests','numTotalTestSuites','numPassedTestSuites','numFailedTestSuites','numPendingTestSuites']
 for key in keys:need(type(d.get(key)) is int and d[key]>=0,'invalid '+key)
 need(type(d.get('success')) is bool,'invalid success')
 results=d.get('testResults');need(isinstance(results,list) and len(results)>0,'missing file results')
 counts=Counter();failed_files=0
 for tr in results:
  need(isinstance(tr,dict) and isinstance(tr.get('name'),str) and tr['name'],'missing file identity')
  need(tr.get('status') in ('passed','failed'),'nonterminal file status')
  need(isinstance(tr.get('message'),str),'missing suite diagnostic field')
  assertions=tr.get('assertionResults');need(isinstance(assertions,list) and len(assertions)>0,'missing assertion list '+tr['name'])
  failed_files+=tr['status']=='failed'
  for assertion in assertions:
   need(isinstance(assertion,dict) and assertion.get('status') in ('passed','failed','skipped','todo','pending'),'unknown assertion status')
   need(isinstance(assertion.get('fullName'),str) and assertion['fullName'],'missing assertion identity')
   need(isinstance(assertion.get('failureMessages'),list) and all(isinstance(x,str) for x in assertion['failureMessages']),'missing assertion diagnostics')
   counts[assertion['status']]+=1
  need(not any(a['status']=='failed' for a in assertions) or tr['status']=='failed','failed assertion in passing file')
 # Vitest2.1.9: pending header includes skipped/run; todo has its own header.
 # Reported pending assertion status is unfinished run/only, not a completed skip.
 need(counts['pending']==0,'unfinished pending assertions')
 expected={'numTotalTests':sum(counts.values()),'numPassedTests':counts['passed'],'numFailedTests':counts['failed'],'numPendingTests':counts['skipped'],'numTodoTests':counts['todo']}
 for key,value in expected.items():need(d[key]==value,'actual assertion count differs '+key)
 need(d['numTotalTests']>0 and d['numTotalTestSuites']>0,'empty totals')
 need(d['numTotalTestSuites']==d['numPassedTestSuites']+d['numFailedTestSuites']+d['numPendingTestSuites'],'suite summary counts inconsistent')
 need(d['numTotalTestSuites']>=len(results),'suite total below file count')
 need(d['numFailedTestSuites']>=failed_files,'failed suite count below failed files')
 genuine_failure=d['numFailedTests']>0 or d['numFailedTestSuites']>0
 need(d['success']==(not genuine_failure),'success inconsistent with failure counts')
 need(child_exit in (0,1) and ((child_exit==0 and d['success']) or (child_exit==1 and genuine_failure and not d['success'])),'child exit inconsistent with JSON success/failure')
 log_text=log.read_text()
 need('Some tests are still running when generating the JSON report' not in log_text,'recorder reports unfinished workers')
 for marker in ('Worker exited unexpectedly','worker exited unexpectedly','Worker terminated unexpectedly'):
  need(marker not in log_text,'worker-incomplete diagnostic '+marker)
 return d

validate_result(old/'d16.json',rows[5]['exit'],old/'d16.log')
validate_result(old/'core-full.json',rows[6]['exit'],old/'core.log')
require('STOP: frozen HEAD/index/worktree/inputs changed' in (a/'founding-r7q2-gate.log').read_text(),'original gate has no expected freeze failure')
require(not (old/'ui-full.json').exists() and not (old/'attribution.json').exists(),'original output unexpectedly advanced beyond core postflight')
print('original terminal98 and exact1032 incident verified; completed core retained with incident limit')
PRE
[ "$?" = 0 ] || exit 98
mkdir "$OUT" || exit 90
freeze_snapshot > "$OUT/freeze.json" || exit 98
cmp -s "$OUT/freeze.json" "$INC/freeze-observed-after-hook.json" || { echo 'STOP: additional drift since preserved incident'; exit 98; }
# Bind original raw evidence without modifying original output or incident files.
python3 -I - "$OLD" "$INC" "$A" "$OUT" <<'REFS'
import pathlib,json,hashlib,shutil,sys
old,inc,a,out=map(pathlib.Path,sys.argv[1:]);paths=[p for p in old.iterdir() if p.is_file()]+[p for p in inc.iterdir() if p.is_file()]+[a/'founding-r7q2-gate.log',a/'founding-r7q2-gate.log.meta']
refs={str(p):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(paths)}
(out/'original-evidence-refs.json').write_text(json.dumps(refs,indent=2)+'\n')
shutil.copyfile(old/'core-full.json',out/'core-full.json')
(out/'LIMITS.txt').write_text('Original gate exit 98 remains a freeze failure. Core completed across one verified HANDOFF AUTO stamp; source/index/HEAD/input facts unchanged. This remaining-UI continuation never grants full-gate acceptance; original d16 failure and any core/UI failure remain. No arbitrary future AUTO exception.\n')
REFS
[ "$?" = 0 ] || exit 98
originals_unchanged() {
python3 -I - "$OUT/original-evidence-refs.json" <<'REFCHECK'
import json,pathlib,hashlib,sys
for name,pin in json.load(open(sys.argv[1])).items():
 p=pathlib.Path(name)
 if not p.is_file() or p.stat().st_size!=pin['bytes'] or hashlib.sha256(p.read_bytes()).hexdigest()!=pin['sha256']:raise SystemExit('STOP: original evidence changed '+name)
REFCHECK
}
RES="$OUT/results.jsonl"; : > "$RES" || exit 1
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

check_freeze || exit 98
originals_unchanged || exit 98
disk_floor 3145728 || exit 97
# UI only, exact original foreground command. Parent owns live disk/child monitoring.
start=$(date +%s)
nice -n 10 npx vitest run --no-file-parallelism --project ui --reporter=json --outputFile="$OUT/ui-full.json" > "$OUT/ui.log" 2>&1
ui_exit=$?
end=$(date +%s)
printf '{"name":"vitest-ui-full","exit":%d,"seconds":%d,"log":"%s","node":"%s"}\n' "$ui_exit" "$((end-start))" "$OUT/ui.log" "$(node --version)" >> "$RES" || exit 1
# Child exit is recorded before checking postflight. No future hook-stamp exemption.
check_freeze || exit 98
originals_unchanged || exit 98
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

python3 -I - "$OUT/ui-full.json" "$ui_exit" "$OUT/ui.log" <<'UIRESULT'
import json,pathlib,sys
def validate_result(path, child_exit, log):
 from collections import Counter
 d=json.loads(path.read_text())
 def need(ok,msg):
  if not ok:raise SystemExit('STOP: incomplete/malformed '+path.name+': '+msg)
 keys=['numTotalTests','numPassedTests','numFailedTests','numPendingTests','numTodoTests','numTotalTestSuites','numPassedTestSuites','numFailedTestSuites','numPendingTestSuites']
 for key in keys:need(type(d.get(key)) is int and d[key]>=0,'invalid '+key)
 need(type(d.get('success')) is bool,'invalid success')
 results=d.get('testResults');need(isinstance(results,list) and len(results)>0,'missing file results')
 counts=Counter();failed_files=0
 for tr in results:
  need(isinstance(tr,dict) and isinstance(tr.get('name'),str) and tr['name'],'missing file identity')
  need(tr.get('status') in ('passed','failed'),'nonterminal file status')
  need(isinstance(tr.get('message'),str),'missing suite diagnostic field')
  assertions=tr.get('assertionResults');need(isinstance(assertions,list) and len(assertions)>0,'missing assertion list '+tr['name'])
  failed_files+=tr['status']=='failed'
  for assertion in assertions:
   need(isinstance(assertion,dict) and assertion.get('status') in ('passed','failed','skipped','todo','pending'),'unknown assertion status')
   need(isinstance(assertion.get('fullName'),str) and assertion['fullName'],'missing assertion identity')
   need(isinstance(assertion.get('failureMessages'),list) and all(isinstance(x,str) for x in assertion['failureMessages']),'missing assertion diagnostics')
   counts[assertion['status']]+=1
  need(not any(a['status']=='failed' for a in assertions) or tr['status']=='failed','failed assertion in passing file')
 # Vitest2.1.9: pending header includes skipped/run; todo has its own header.
 # Reported pending assertion status is unfinished run/only, not a completed skip.
 need(counts['pending']==0,'unfinished pending assertions')
 expected={'numTotalTests':sum(counts.values()),'numPassedTests':counts['passed'],'numFailedTests':counts['failed'],'numPendingTests':counts['skipped'],'numTodoTests':counts['todo']}
 for key,value in expected.items():need(d[key]==value,'actual assertion count differs '+key)
 need(d['numTotalTests']>0 and d['numTotalTestSuites']>0,'empty totals')
 need(d['numTotalTestSuites']==d['numPassedTestSuites']+d['numFailedTestSuites']+d['numPendingTestSuites'],'suite summary counts inconsistent')
 need(d['numTotalTestSuites']>=len(results),'suite total below file count')
 need(d['numFailedTestSuites']>=failed_files,'failed suite count below failed files')
 genuine_failure=d['numFailedTests']>0 or d['numFailedTestSuites']>0
 need(d['success']==(not genuine_failure),'success inconsistent with failure counts')
 need(child_exit in (0,1) and ((child_exit==0 and d['success']) or (child_exit==1 and genuine_failure and not d['success'])),'child exit inconsistent with JSON success/failure')
 log_text=log.read_text()
 need('Some tests are still running when generating the JSON report' not in log_text,'recorder reports unfinished workers')
 for marker in ('Worker exited unexpectedly','worker exited unexpectedly','Worker terminated unexpectedly'):
  need(marker not in log_text,'worker-incomplete diagnostic '+marker)
 return d

validate_result(pathlib.Path(sys.argv[1]),int(sys.argv[2]),pathlib.Path(sys.argv[3]))
UIRESULT
[ "$?" = 0 ] || exit 1
check_freeze && originals_unchanged || exit 98
echo "Remaining UI recorded child_exit=$ui_exit; original gate remains98; original d16 remains1. NOT full-gate pass."
exit 1
