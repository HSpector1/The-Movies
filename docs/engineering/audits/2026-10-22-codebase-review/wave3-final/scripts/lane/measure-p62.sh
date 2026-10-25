#!/bin/bash
# Independent projection 62 declaration measurement in the rebase worktree (after the regenerated files are committed).
export PATH="/usr/local/bin:$PATH"
WT=/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt
OUT=/Users/zacheryspector/studio-scratch/1370-codebase-review-20261022-r1/lane-logs
G="git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks"
cd "$WT" || exit 9
echo "node $(node --version) at $(date '+%F %T'); worktree HEAD $($G rev-parse --short HEAD); load $(uptime | sed 's/.*load/load/')"
P62_DECLARATION_EXPECTED_HEAD=$($G rev-parse HEAD) npx vite-node docs/engineering/audits/2026-10-22-codebase-review/p62-declaration-measurement.ts > "$OUT/p62-declaration-measurement.json"
rc=$?; echo "=== measurement exit=$rc"; [ $rc -eq 0 ] && python3 -I -c '
import json,sys; d=json.load(open(sys.argv[1]))
print("schemaId", d["schemaId"]); print("csharp", d["generatedCsharp"]["bytes"], d["generatedCsharp"]["sha256"])
for k in ("F10_CURRENT_QUOTE_UNIONS","F11_CURRENT_COMMAND_UNION"): i=d["identities"][k]; print(k, i["bytes"], i["sha256"], "matchesPrior", i["matchesPrior"])
print("fixed unchanged:", all(d["identities"][k]["matchesPrior"] for k in d["identities"] if not k.startswith(("F10","F11"))), d["completion"])' "$OUT/p62-declaration-measurement.json"
echo "=== ALL DONE at $(date '+%F %T')"
