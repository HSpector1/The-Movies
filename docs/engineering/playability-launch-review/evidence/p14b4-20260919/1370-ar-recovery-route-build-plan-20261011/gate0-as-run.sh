#!/bin/bash
# AR-BUILD-PLAN.md section 7.1 Gate 0 script (read-only on the repository; writes only A/GATE0-OBSERVATION.json).
set -u
S=/Users/zacheryspector/studio-scratch; R=/Users/zacheryspector/The-Movies-headless-program; A=$S/1370-ar-root-continuation-20261010-r1
export GIT_OPTIONAL_LOCKS=0; G="/usr/bin/git --no-optional-locks -c gc.auto=0 -c maintenance.auto=0 -C $R"
HEAD=$($G rev-parse HEAD); WIP=$($G rev-parse refs/heads/wip/headless-program-20260916-ts)
RWIP=$($G ls-remote origin refs/heads/wip/headless-program-20260916-ts | cut -f1); RMAIN=$($G ls-remote origin refs/heads/main | cut -f1)
LMAIN=$($G rev-parse refs/remotes/origin/main); SRC=$($G rev-parse "$HEAD:src"); STATUS=$($G status --porcelain=v1 --untracked-files=all)
NONDOCS_LIST=$($G diff --name-only -z 4812bb123781632dd39e44f918eb85a6a2c12623 "$HEAD" | tr '\0' '\n' | grep -v -E '^(docs/|HANDOFF\.md$)')
NONDOCS=$(printf '%s' "$NONDOCS_LIST" | grep -c . || true)
$G merge-base --is-ancestor d20347b83ea7497ed17c48ec14d8f64a3ce69cc8 "$HEAD" && ANC=true || ANC=false
test "$HEAD" = "$WIP" -a "$HEAD" = "$RWIP" -a "$SRC" = 13880d9b0ba72aff5d4c5bcf5d12fe682c5de554 -a "$ANC" = true -a "$NONDOCS" = 0 -a -z "$STATUS" -a "$LMAIN" = c902a704eb948cc576083d0973c8c23e59937dc1 -a "$RMAIN" = c902a704eb948cc576083d0973c8c23e59937dc1 && VERDICT=PASS || VERDICT=BLOCKED
[ -e "$A" ] && { echo "STOP: $A already exists"; exit 2; }
mkdir -p "$A"
LOCK=false; [ -e "$S/HEAVY-LANE-LOCK" ] || LOCK=true
FREE=$(df -k "$S" | tail -1 | awk '{print $4*1024}')
AC=$(pmset -g batt 2>/dev/null | head -1 | grep -q "AC Power" && echo true || echo false)
BOOT=$(sysctl -n kern.bootsessionuuid 2>/dev/null)
UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)
export HEAD WIP RWIP RMAIN LMAIN SRC STATUS NONDOCS_LIST NONDOCS ANC VERDICT LOCK FREE AC BOOT UTC
python3 -I - "$A/GATE0-OBSERVATION.json" <<'PY'
import json, os, sys
e = os.environ
failed = []
if not (e["HEAD"] == e["WIP"] == e["RWIP"]): failed.append(1)
if e["SRC"] != "13880d9b0ba72aff5d4c5bcf5d12fe682c5de554": failed.append(2)
if e["ANC"] != "true": failed.append(3)
if int(e["NONDOCS"]) != 0: failed.append(4)
if e["STATUS"] != "": failed.append(5)
if not (e["LMAIN"] == e["RMAIN"] == "c902a704eb948cc576083d0973c8c23e59937dc1"): failed.append(6)
nondocs = [p for p in e["NONDOCS_LIST"].split("\n") if p]
obs = {
  "schema": "1370-ar-gate0-observation/v1",
  "utc": e["UTC"], "head": e["HEAD"], "headSrcTree": e["SRC"], "localWip": e["WIP"], "remoteWip": e["RWIP"],
  "localOriginMain": e["LMAIN"], "remoteMain": e["RMAIN"], "workingTreeStatus": e["STATUS"],
  "nonDocsPathsFrom4812": nondocs[:200], "nonDocsCount": len(nondocs), "apIsAncestor": e["ANC"] == "true",
  "heavyLaneLockAbsent": e["LOCK"] == "true", "freeBytes": int(e["FREE"]), "acPower": e["AC"] == "true",
  "bootSessionUuid": e["BOOT"], "verdict": e["VERDICT"], "failedPredicates": failed,
  "integratorDecision": "HOLD_AR_ROUTE_CONTINUE_GAMEPLAY_LANDINGS_REQUALIFY_LINEAGE_AT_STABLE_TREE",
  "integratorDecisionText": "Gate 0 cannot pass on any reachable HEAD: the landed R8 source moved HEAD:src from 13880d9b to " + e["SRC"][:8] + " while the whole M0 fullfunction lineage pins 13880d9b (types adoption be632d53, proof-library TREE constant, CORE-TEST-TEMPLATE L12, A208 copy at 4812bb12). Refs do not move backward. Under the Owner's 2026-10-10 orders (game development first; no further approval gates) the integrator holds the AR run, preserves the complete AR build plan, continues gameplay landings in dependency order, and schedules a new route generation that qualifies a fresh lineage against the stable landed tree after the gameplay slices settle. Historical failures 42397, 54871, 96592 and the unexplained interval stay failed and unexplained; nothing is repinned.",
  "executionAuthorization": False,
}
with open(sys.argv[1], "w") as f:
    json.dump(obs, f, sort_keys=True, indent=2); f.write("\n")
os.chmod(sys.argv[1], 0o444)
print(json.dumps({k: obs[k] for k in ("verdict","failedPredicates","head","headSrcTree","nonDocsCount","freeBytes","heavyLaneLockAbsent")}, indent=1))
PY
