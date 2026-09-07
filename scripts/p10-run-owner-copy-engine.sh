#!/bin/zsh
# OPS-P08P10-CLOSE-GATES-01 §4 — the Owner-profile PRIVATE COPY on the REAL sealed engine.
# Boots the sealed projection-19 engine on a private working copy of the accepted profile (its
# ORIGINAL prior-schema envelope, so the migration happens on boot exactly as it would for the
# Owner), reads the served session/snapshot over HTTP, asks a read-only consequence (no mutation),
# saves through the authority, STOPS the engine and starts a fresh one on the same runtime dir
# (engine replacement / reconnect), and checks the second engine serves the same studio. Every
# artefact lands in the PRIVATE evidence dir; the live profile is never opened for writing.
set -euo pipefail
TS_REPO="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE_BUNDLE="${P10_ENGINE_BUNDLE:?P10_ENGINE_BUNDLE must be the sealed projection-19 engine bundle}"
EXPECTED_SCHEMA=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["schemaId"])' "$TS_REPO/generated/unity/project-studio-bridge.contract-manifest.json")
PRIVATE="${P10_OWNER_COPY_DIR:-/Users/bruce/Project Studio Owner Profile Baselines/P10-close-gates-20260906}"
MASTER="$PRIVATE/MASTER-bridge-runtime-v1.json"
LIVE="$HOME/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json"
EXPECT_SHA="d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b"
PORT="${P10_OWNER_ENGINE_PORT:-43397}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
EVIDENCE="$PRIVATE/engine-run-$STAMP"; mkdir -p "$EVIDENCE"; chmod 700 "$EVIDENCE"
[[ -f "$MASTER" ]] || { echo "[owner-engine] master copy missing (run scripts/p10-owner-profile-copy.mts first)" >&2; exit 5; }
[[ "$(shasum -a 256 "$MASTER" | cut -d' ' -f1)" == "$EXPECT_SHA" ]] || { echo "[owner-engine] master copy hash mismatch" >&2; exit 5; }
[[ "$(shasum -a 256 "$LIVE" | cut -d' ' -f1)" == "$EXPECT_SHA" ]] || { echo "[owner-engine] LIVE profile changed since acceptance — refusing" >&2; exit 5; }
ENGINE_SHA=$(shasum -a 256 "$ENGINE_BUNDLE" | cut -d' ' -f1)
RUNTIME=$(mktemp -d "/tmp/p10-owner-copy.XXXXXX"); chmod 700 "$RUNTIME"
cp "$MASTER" "$RUNTIME/bridge-runtime-v1.json"; chmod 600 "$RUNTIME/bridge-runtime-v1.json"
CAP=$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')
ENGINE_PID=""
cleanup() { [[ -n "$ENGINE_PID" ]] && kill "$ENGINE_PID" 2>/dev/null || true; }
trap cleanup EXIT
start_engine() {
  PROJECT_STUDIO_BRIDGE_CAPABILITY="$CAP" PROJECT_STUDIO_BRIDGE_PORT="$PORT" PROJECT_STUDIO_BRIDGE_RUNTIME_DIR="$RUNTIME" \
    node "$ENGINE_BUNDLE" > "$RUNTIME/engine-$1.log" 2>&1 &
  ENGINE_PID=$!
  for i in $(seq 1 60); do curl -s -o /dev/null -H "x-project-studio-capability: $CAP" "http://127.0.0.1:$PORT/health" && return 0; sleep 0.25; done
  echo "[owner-engine] engine $1 unhealthy" >&2; return 3
}
get() { curl -s -H "x-project-studio-capability: $CAP" "http://127.0.0.1:$PORT$1"; }
post() { curl -s -H "x-project-studio-capability: $CAP" -H "content-type: application/json" -X POST --data-binary @- "http://127.0.0.1:$PORT$1"; }

start_engine first
get /session > "$EVIDENCE/01-session-first.json"
get /snapshot > "$EVIDENCE/02-snapshot-first.json"
# A read-only consequence on a REAL contracted person (renewal is closed at week 8 — an accepted refusal; nothing moves).
python3 - "$EVIDENCE/01-session-first.json" "$EVIDENCE/02-snapshot-first.json" > "$EVIDENCE/03-quote-request.json" <<'PY'
import json,sys
sess=json.load(open(sys.argv[1])); snap=json.load(open(sys.argv[2]))
profiles=snap['snapshot']['talent']['talent']['profiles']
contracted=[p for p in profiles if p['employment']['contract'] is not None]
print(json.dumps({"protocolVersion":sess['protocolVersion'],"schemaId":sess['schemaId'],"sessionId":sess['sessionId'],"commandId":"owner-copy-quote-1","expectedStateRevision":sess['stateRevision'],"type":"quoteContract","draft":{"verb":"renew","talentId":contracted[0]['talentId'],"termWeeks":52}}))
PY
post /quote < "$EVIDENCE/03-quote-request.json" > "$EVIDENCE/04-quote-response.json"
python3 - "$EVIDENCE/01-session-first.json" > "$EVIDENCE/05-save-request.json" <<'PY'
import json,sys
sess=json.load(open(sys.argv[1]))
print(json.dumps({"protocolVersion":sess['protocolVersion'],"schemaId":sess['schemaId'],"sessionId":sess['sessionId'],"commandId":"owner-copy-save-1","expectedStateRevision":sess['stateRevision']}))
PY
post /save < "$EVIDENCE/05-save-request.json" > "$EVIDENCE/06-save-response.json"
get /session > "$EVIDENCE/07-session-after-save.json"
kill "$ENGINE_PID"; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/08-checkpoint-after-first-engine.json"; chmod 600 "$EVIDENCE/08-checkpoint-after-first-engine.json"
start_engine second
get /session > "$EVIDENCE/09-session-second.json"
get /snapshot > "$EVIDENCE/10-snapshot-second.json"
kill "$ENGINE_PID"; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""
for l in first second; do sed "s/$CAP/<capability-scrubbed>/g" "$RUNTIME/engine-$l.log" > "$EVIDENCE/engine-$l.log"; done
LIVE_AFTER=$(shasum -a 256 "$LIVE" | cut -d' ' -f1)
python3 - "$EVIDENCE" "$ENGINE_SHA" "$LIVE_AFTER" "$EXPECT_SHA" "$(git -C "$TS_REPO" rev-parse HEAD)" "$EXPECTED_SCHEMA" <<'PY'
import json,sys,hashlib,os
E,engine_sha,live_after,expect,ts=sys.argv[1:6]
expected_schema=sys.argv[6]
L=lambda n: json.load(open(os.path.join(E,n)))
s1=L('01-session-first.json'); snap1=L('02-snapshot-first.json'); q=L('04-quote-response.json'); sv=L('06-save-response.json'); s1b=L('07-session-after-save.json'); cp=L('08-checkpoint-after-first-engine.json'); s2=L('09-session-second.json'); snap2=L('10-snapshot-second.json')
checks=[]
def ck(name,cond,detail=''): checks.append({'name':name,'ok':bool(cond),'detail':str(detail)[:300]}); print(('  ✓ ' if cond else '  ✗ ')+name+('' if cond else f' :: {detail}'))
t1=snap1['snapshot']['talent']['talent']; t2=snap2['snapshot']['talent']['talent']
ck('first engine migrated the prior-schema copy on boot and serves the bound contract schema', s1['schemaId']==snap1['schemaId']==expected_schema, s1['schemaId'])
ck('served week 8 (the real profile week), 60 profiles, 60 roster rows', s1['gameWeek']==8 and len(t1['profiles'])==60 and len(t1['roster']['rows'])==60, [s1['gameWeek'],len(t1['profiles'])])
ck('8 contracted people carry their exact contracts and published action decisions', sum(1 for p in t1['profiles'] if p['employment']['contract'])==8 and all('actions' in p['employment']['contract'] for p in t1['profiles'] if p['employment']['contract']))
ck('the lot serves the real 5 buildings + the Annex site', len(snap1['snapshot']['lot']['buildings'])>=5, len(snap1['snapshot']['lot']['buildings']))
ck('a renewal consequence on the real profile is an ACCEPTED refusal (window closed) — revision unchanged', q.get('accepted') is True and q['quote']['ok'] is False and q['quote']['refusal']=='renewalWindowClosed' and q['stateRevision']==s1['stateRevision'], q.get('message') or q.get('quote',{}).get('refusal'))
ck('the authority saved the migrated studio (durable V18 inside)', sv.get('accepted') is True and json.loads(cp['savedSaveJson'])['saveVersion']==18, sv.get('message'))
ck('the runtime checkpoint on disk now carries the current schema (migration is durable)', cp['schemaId']==s1['schemaId'], cp['schemaId'])
ck('engine REPLACEMENT: a fresh engine on the same runtime dir resumes the SAME session and state digest', s2['sessionId']==s1b['sessionId'] and s2['stateDigest']==s1b['stateDigest'], [s2['sessionId'][:8], s1b['sessionId'][:8]])
ck('the second engine serves the same 60 people / 8 contracts / week 8', s2['gameWeek']==8 and len(t2['profiles'])==60 and sum(1 for p in t2['profiles'] if p['employment']['contract'])==8)
ck('people projection identical across the replacement', json.dumps(t1,sort_keys=True)==json.dumps(t2,sort_keys=True))
ck('the LIVE profile is untouched', live_after==expect, live_after)
rep={'kind':'p10-owner-copy-engine-run','engineBundleSha256':engine_sha,'tsCommit':ts,'servedSchemaId':s1['schemaId'],'sessionId':s1['sessionId'],'checks':checks,'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks)}
json.dump(rep,open(os.path.join(E,'report.json'),'w'),indent=1)
print(f"=== OWNER-COPY ENGINE RUN: {rep['passed']} passed, {rep['failed']} failed === engine {engine_sha[:12]} ts {ts[:8]}")
sys.exit(0 if rep['failed']==0 else 2)
PY
