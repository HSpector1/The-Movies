#!/bin/bash
# After the main chain exits: re-run the ten kit files plus any file whose only failures were docs/ ENOENT, in the fixed environment.
set -u
export PATH=/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin:$PATH
export GIT_OPTIONAL_LOCKS=0
C=/Users/zacheryspector/studio-specialists/r8
P=/Users/zacheryspector/studio-scratch/1370-ar-1363-r8-rebase-20261010-r1
export P1368_ACCEPTED45_ROOT=$C/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368
export P1368_ACCEPTED45_MANIFEST_SHA256=11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5
export P1368_ACCEPTED26_ROOT=$C/tests/fixtures/p13b/genuine-v26-period52-1368
export P1368_ACCEPTED26_MANIFEST_SHA256=8e40e51bb360ba6ff6c0d641a03e90aa8ed6f73f8c0b232a9a4b5861af358db4
export RIVAL_WRITING_CAPTURE_DIR=$C/tests/fixtures/p14/genuine-v46-rival-writing-pre414-1368
export RIVAL_WRITING_MANIFEST_SHA256=d097bbf131c1dc495b881d73e96994953b2f6a0ef50f88bd3b043f263024f205
export TRUST_AUTHORING_CAPTURE_DIR=$C/tests/fixtures/p14/genuine-v45-trust-authoring-week195-1368
export TRUST_AUTHORING_MANIFEST_SHA256=0b98763001eb96949d8e312df5dfe600f1adf599f5466dd59eec214e1f229991
cd "$C" || exit 99
while pgrep -f 'gates/run-gates.sh' > /dev/null; do sleep 20; done
sleep 5
files=$(python3 -I - "$P/tests" <<'PY'
import json,glob,os,sys
d=sys.argv[1]; files=[l.strip() for l in open(os.path.join(d,'b1-modified10.files')) if l.strip()]
for path in sorted(glob.glob(os.path.join(d,'b*.vitest.json'))):
    if path.endswith('-r2.vitest.json'): continue
    try: j=json.load(open(path))
    except Exception: continue
    for tr in j['testResults']:
        n=tr['name']; rel=n[n.find('/r8/')+4:]
        fails=[a for a in tr['assertionResults'] if a['status']=='failed']
        if fails and all(('ENOENT' in ' '.join(a.get('failureMessages') or []) and '/docs/' in ' '.join(a.get('failureMessages') or [])) for a in fails) and rel not in files:
            files.append(rel)
print(' '.join(files))
PY
)
echo "$files" | tr ' ' '\n' > "$P/tests/b7-rerun-docs-fixed.files"
t0=$(date +%s)
npx vitest run --project core --no-file-parallelism --no-cache --reporter=verbose --reporter=json --outputFile.json="$P/tests/b7-rerun-docs-fixed.vitest.json" $files > "$P/tests/b7-rerun-docs-fixed.log" 2>&1; ec=$?
t1=$(date +%s)
printf '{"name":"vitest-b7-rerun-docs-fixed","exit":%d,"seconds":%d,"log":"%s","node":"%s","command":%s,"note":"re-run of the ten kit files (plus any file whose only failures were docs/ ENOENT) after copying the referenced evidence captures into the clone"}\n' "$ec" "$((t1-t0))" "$P/tests/b7-rerun-docs-fixed.log" "$(node --version)" "$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1:]))' npx vitest run --project core --no-file-parallelism --no-cache --reporter=verbose --reporter=json --outputFile.json="$P/tests/b7-rerun-docs-fixed.vitest.json" $files)" >> "$P/gates/results.jsonl"
echo "$(date '+%F %T') vitest-b7-rerun-docs-fixed exit=$ec seconds=$((t1-t0)) files=$(echo "$files" | wc -w | tr -d ' ')" >> "$P/gates/run-gates.console.log"
echo "$(date '+%F %T') rerun done" >> "$P/gates/run-gates.console.log"
