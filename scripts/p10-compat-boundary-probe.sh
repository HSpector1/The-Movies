#!/bin/zsh
# CLOSE-GATES-01 §9 — the exact compatibility boundary between engine/player pairs and durable
# checkpoints, observed on the real engines (no screen): which checkpoints each engine accepts,
# what it does with them (migrate + re-project vs refuse), and the exact refusal reason.
set -uo pipefail
TS_REPO="$(cd "$(dirname "$0")/.." && pwd)"
OLD="${P10_OLD_ENGINE:?P10_OLD_ENGINE (the projection-17 engine bundle) required}"
NEW="${P10_ENGINE_BUNDLE:?P10_ENGINE_BUNDLE (the sealed projection-19 engine bundle) required}"
OUT="${1:-$TS_REPO/Evidence/P10-Compat-Boundary-$(date -u +%Y%m%dT%H%M%SZ)}"; mkdir -p "$OUT"
PORT="${P10_COMPAT_PORT:-43398}"
probe() { # label engine checkpoint
  local label="$1" engine="$2" cp="$3"
  local rt; rt=$(mktemp -d "/tmp/p10-compat.XXXXXX"); chmod 700 "$rt"
  cp "$cp" "$rt/bridge-runtime-v1.json"; chmod 600 "$rt/bridge-runtime-v1.json"
  local cap; cap=$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')
  PROJECT_STUDIO_BRIDGE_CAPABILITY="$cap" PROJECT_STUDIO_BRIDGE_PORT="$PORT" PROJECT_STUDIO_BRIDGE_RUNTIME_DIR="$rt" node "$engine" > "$rt/engine.log" 2>&1 &
  local pid=$!
  local health=0
  for i in $(seq 1 40); do curl -s -o /dev/null -H "x-project-studio-capability: $cap" "http://127.0.0.1:$PORT/health" && { health=1; break; }; sleep 0.25; done
  local session="{}"
  [[ $health == 1 ]] && session=$(curl -s -H "x-project-studio-capability: $cap" "http://127.0.0.1:$PORT/session")
  kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null
  local code=$?
  sed "s/$cap/<cap>/g" "$rt/engine.log" > "$OUT/$label.engine.log"
  python3 - "$label" "$engine" "$cp" "$health" "$session" "$rt/bridge-runtime-v1.json" "$OUT" <<'PY'
import json,sys,hashlib,os
label,engine,cp,health,session,after,out=sys.argv[1:8]
src=json.load(open(cp)); s=json.loads(session) if session.strip().startswith('{') else {}
aft=json.load(open(after)) if os.path.exists(after) else {}
log=open(os.path.join(out,label+'.engine.log'),errors='ignore').read()
refusal=[l for l in log.splitlines() if 'refus' in l.lower() or 'reject' in l.lower() or 'error' in l.lower() or 'unsupported' in l.lower() or 'schema' in l.lower()][:6]
rec={'label':label,'engineSha256':hashlib.sha256(open(engine,'rb').read()).hexdigest()[:16],'checkpointSchemaId':src.get('schemaId'),'checkpointSessionId':src.get('sessionId'),
 'engineHealthy':health=='1','servedSchemaId':s.get('schemaId'),'servedSessionId':s.get('sessionId'),'servedGameWeek':s.get('gameWeek'),
 'checkpointAfterSchemaId':aft.get('schemaId'),'sessionPreserved':(s.get('sessionId')==src.get('sessionId')) if s else None,'logExcerpt':refusal}
json.dump(rec,open(os.path.join(out,label+'.json'),'w'),indent=1)
print(f"{label}: healthy={rec['engineHealthy']} cp={str(rec['checkpointSchemaId'])[7:19]} served={str(rec['servedSchemaId'])[7:19]} session={'same' if rec['sessionPreserved'] else 'new/none'} week={rec['servedGameWeek']}")
for l in refusal[:3]: print('   log:', l[:200])
PY
  rm -rf "$rt"
}
P17="$TS_REPO/ui/e2e/p09-visual-oracle-v1/s2-p09-sparse-start.checkpoint.json"
P18="$TS_REPO/ui/e2e/p09-visual-oracle-v1-p18/s2-p09-sparse-start.checkpoint.json"
P19="$TS_REPO/ui/e2e/p09-visual-oracle-v1-p19/s2-p09-sparse-start.checkpoint.json"
probe old-engine-on-p17 "$OLD" "$P17"
probe old-engine-on-p18 "$OLD" "$P18"
probe old-engine-on-p19 "$OLD" "$P19"
probe new-engine-on-p17 "$NEW" "$P17"
probe new-engine-on-p18 "$NEW" "$P18"
probe new-engine-on-p19 "$NEW" "$P19"
echo "evidence → $OUT"
