#!/bin/zsh
# OPS-P11A-OUTCOME-FIRST-20260909-01 — the Owner-profile PRIVATE COPY on the REAL sealed engine.
# Boots the sealed current-projection engine on a private working copy of the accepted profile (its
# ORIGINAL prior-schema envelope, so the migration happens on boot exactly as it would for the
# Owner), reads the served session/snapshot over HTTP, asks a read-only consequence (no mutation),
# saves through the authority, STOPS the engine and starts a fresh one on the same runtime dir
# (engine replacement / reconnect), and checks the second engine serves the same studio. Every
# artefact lands in the PRIVATE evidence dir; the live profile is never opened for writing.
set -euo pipefail
umask 077
TS_REPO="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE_BUNDLE="${P11_ENGINE_BUNDLE:?P11_ENGINE_BUNDLE must be the sealed current-projection engine bundle}"
EXPECTED_SCHEMA=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["schemaId"])' "$TS_REPO/generated/unity/project-studio-bridge.contract-manifest.json")
PRIVATE="${P11_OWNER_COPY_DIR:-/Users/bruce/Project Studio Owner Profile Baselines/P11A-20260909}"
MASTER="$PRIVATE/MASTER-bridge-runtime-v1.json"
BASELINE="/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json"
LIVE="$HOME/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json"
EXPECT_SHA="d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b"
PORT="${P11_OWNER_ENGINE_PORT:-43421}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
EVIDENCE="$PRIVATE/engine-run-$STAMP"; mkdir -p "$EVIDENCE"; chmod 700 "$EVIDENCE"
[[ -f "$MASTER" ]] || { echo "[owner-engine] master copy missing (run scripts/p11-owner-profile-copy.mts first)" >&2; exit 5; }
[[ "$(shasum -a 256 "$MASTER" | cut -d' ' -f1)" == "$EXPECT_SHA" ]] || { echo "[owner-engine] master copy hash mismatch" >&2; exit 5; }
[[ "$(shasum -a 256 "$LIVE" | cut -d' ' -f1)" == "$EXPECT_SHA" ]] || { echo "[owner-engine] LIVE profile changed since acceptance — refusing" >&2; exit 5; }
[[ "$(shasum -a 256 "$BASELINE" | cut -d' ' -f1)" == "$EXPECT_SHA" ]] || { echo "[owner-engine] immutable baseline hash mismatch" >&2; exit 5; }
[[ -f "$PRIVATE/expected-current-finance.json" && -f "$PRIVATE/expected-saved-finance.json" ]] || { echo "[owner-engine] independent Finance expectations missing" >&2; exit 5; }
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then echo "[owner-engine] private port already occupied" >&2; exit 5; fi
ENGINE_SHA=$(shasum -a 256 "$ENGINE_BUNDLE" | cut -d' ' -f1)
TS_HEAD=$(git -C "$TS_REPO" rev-parse HEAD)
python3 - "$LIVE" "$BASELINE" "$MASTER" > "$EVIDENCE/protected-before.json" <<'PYPROTECTED'
import hashlib,json,sys,os
print(json.dumps({p:{'sha256':hashlib.sha256(open(p,'rb').read()).hexdigest(),'mtimeNs':os.stat(p).st_mtime_ns} for p in sys.argv[1:]}))
PYPROTECTED
RUNTIME=$(mktemp -d "/tmp/p11-owner-copy.XXXXXX"); chmod 700 "$RUNTIME"
cp "$MASTER" "$RUNTIME/bridge-runtime-v1.json"; chmod 600 "$RUNTIME/bridge-runtime-v1.json"
CAP=$(python3 -c 'import secrets;print(secrets.token_urlsafe(32))')
ENGINE_PID=""
cleanup() {
  if [[ -n "$ENGINE_PID" ]]; then kill "$ENGINE_PID" 2>/dev/null || true; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""; fi
  for label in first second third; do
    [[ ! -f "$RUNTIME/engine-$label.log" ]] || sed "s/$CAP/<capability-scrubbed>/g" "$RUNTIME/engine-$label.log" > "$EVIDENCE/engine-$label.log"
  done
}
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
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/00-migrated-before-any-save.checkpoint.json"
cp "$PRIVATE/expected-current-finance.json" "$EVIDENCE/expected-current-finance.json"
cp "$PRIVATE/expected-saved-finance.json" "$EVIDENCE/expected-saved-finance.json"
# A read-only consequence on a REAL contracted person (renewal is closed at week 8 — an accepted refusal; nothing moves).
python3 - "$EVIDENCE/01-session-first.json" "$EVIDENCE/02-snapshot-first.json" > "$EVIDENCE/03-quote-request.json" <<'PY'
import json,sys
sess=json.load(open(sys.argv[1])); snap=json.load(open(sys.argv[2]))
profiles=snap['snapshot']['talent']['talent']['profiles']
contracted=[p for p in profiles if p['employment']['contract'] is not None]
print(json.dumps({"protocolVersion":sess['protocolVersion'],"schemaId":sess['schemaId'],"sessionId":sess['sessionId'],"commandId":"owner-copy-quote-1","expectedStateRevision":sess['stateRevision'],"type":"quoteContract","draft":{"verb":"renew","talentId":contracted[0]['talentId'],"termWeeks":52}}))
PY
post /quote < "$EVIDENCE/03-quote-request.json" > "$EVIDENCE/04-quote-response.json"
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/04-checkpoint-after-quote.json"
# Load the ORIGINAL explicit slot before a Save can overwrite it. The published
# Finance after Load must match the independently migrated saved-state expectation.
python3 - "$EVIDENCE/01-session-first.json" > "$EVIDENCE/05-load-request.json" <<'PYCONTROL'
import json,sys
s=json.load(open(sys.argv[1]))
print(json.dumps({k:s[k] for k in ['protocolVersion','schemaId','sessionId']}|{'expectedStateRevision':s['stateRevision'],'commandId':'p11-owner-copy-load-original-saved'}))
PYCONTROL
post /load < "$EVIDENCE/05-load-request.json" > "$EVIDENCE/06-load-response.json"
get /snapshot > "$EVIDENCE/07-snapshot-after-load.json"
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/07-checkpoint-after-load.json"
python3 - "$EVIDENCE/07-snapshot-after-load.json" > "$EVIDENCE/08-save-request.json" <<'PYCONTROL'
import json,sys
s=json.load(open(sys.argv[1]))
print(json.dumps({k:s[k] for k in ['protocolVersion','schemaId','sessionId']}|{'expectedStateRevision':s['stateRevision'],'commandId':'p11-owner-copy-save-loaded-state'}))
PYCONTROL
post /save < "$EVIDENCE/08-save-request.json" > "$EVIDENCE/09-save-response.json"
get /session > "$EVIDENCE/10-session-after-save.json"
kill "$ENGINE_PID"; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/11-checkpoint-after-first-engine.json"
python3 - "$RUNTIME/bridge-runtime-v1.json" > "$EVIDENCE/11-checkpoint-stat.json" <<'PYSTAT'
import json,os,sys
print(json.dumps({'mtimeNs':os.stat(sys.argv[1]).st_mtime_ns}))
PYSTAT
start_engine second
get /session > "$EVIDENCE/12-session-second.json"
get /snapshot > "$EVIDENCE/13-snapshot-second.json"
kill "$ENGINE_PID"; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/14-checkpoint-after-second-engine.json"
python3 - "$RUNTIME/bridge-runtime-v1.json" > "$EVIDENCE/14-checkpoint-stat.json" <<'PYSTAT'
import json,os,sys
print(json.dumps({'mtimeNs':os.stat(sys.argv[1]).st_mtime_ns}))
PYSTAT
start_engine third
get /session > "$EVIDENCE/15-session-third.json"
get /snapshot > "$EVIDENCE/16-snapshot-third.json"
kill "$ENGINE_PID"; wait "$ENGINE_PID" 2>/dev/null || true; ENGINE_PID=""
cp "$RUNTIME/bridge-runtime-v1.json" "$EVIDENCE/17-checkpoint-after-third-engine.json"
python3 - "$RUNTIME/bridge-runtime-v1.json" > "$EVIDENCE/17-checkpoint-stat.json" <<'PYSTAT'
import json,os,sys
print(json.dumps({'mtimeNs':os.stat(sys.argv[1]).st_mtime_ns}))
PYSTAT
cleanup
python3 - "$EVIDENCE" "$ENGINE_SHA" "$EXPECT_SHA" "$TS_HEAD" "$EXPECTED_SCHEMA" "$MASTER" "$LIVE" "$BASELINE" "$ENGINE_BUNDLE" "$0" "$RUNTIME" <<'PYREPORT'
import json,sys,hashlib,os
E,engine_sha,expect,ts,expected_schema,master,live,baseline,engine_path,tool_path,runtime=sys.argv[1:]
L=lambda n: json.load(open(os.path.join(E,n)))
B=lambda n: open(os.path.join(E,n),'rb').read()
source=json.load(open(master)); migrated=L('00-migrated-before-any-save.checkpoint.json')
s1=L('01-session-first.json'); snap1=L('02-snapshot-first.json'); q=L('04-quote-response.json')
loaded=L('06-load-response.json'); snap_loaded=L('07-snapshot-after-load.json'); cp_loaded=L('07-checkpoint-after-load.json')
sv=L('09-save-response.json'); s1b=L('10-session-after-save.json'); cp=L('11-checkpoint-after-first-engine.json')
s2=L('12-session-second.json'); snap2=L('13-snapshot-second.json'); s3=L('15-session-third.json'); snap3=L('16-snapshot-third.json')
checks=[]
def ck(name,cond):
    checks.append({'name':name,'ok':bool(cond)})
    print(('  PASS ' if cond else '  FAIL ')+name)
def preserve(slot_before,slot_after):
    if slot_before is None: return slot_after is None
    before,after=json.loads(slot_before),json.loads(slot_after)
    expected_state=dict(before['state'],releaseAuthority={'commitments':[]},studioHistory={'recordingStartedWeek':before['state']['market']['tick'],'nextEventId':0,'rows':[]},foundingRegime='endowed')
    return before['saveVersion']==15 and after==dict(before,saveVersion=18,state=expected_state)
def finance(snap): return snap['snapshot']['finance']['finance']
ck('actual bundle serves the generated current schema',s1['schemaId']==snap1['schemaId']==expected_schema)
ck('genuine predecessor boot publishes a new session, revision zero and empty journal',migrated['schemaId']==expected_schema and migrated['sessionId']!=source['sessionId'] and migrated['stateRevision']==0 and migrated['journal']==[])
ck('CURRENT slot: all original V15 meanings survive before any Save',preserve(source['currentSaveJson'],migrated['currentSaveJson']))
ck('EXPLICIT SAVED slot: independently preserves all original V15 meanings before any Save',preserve(source['savedSaveJson'],migrated['savedSaveJson']))
ck('source current/saved distinction is preserved', (source['currentSaveJson']==source['savedSaveJson'])==(migrated['currentSaveJson']==migrated['savedSaveJson']))
ck('initial Finance agrees with independently migrated current slot',finance(snap1)==L('expected-current-finance.json'))
ck('current Finance cash is literal and obligations remain separate',finance(snap1)['cash']==json.loads(migrated['currentSaveJson'])['state']['studio']['cash'] and 'not subtracted from Cash' in finance(snap1)['obligationsBasis'])
ck('quote is an accepted renewal-window refusal without gameplay revision change',q.get('accepted') is True and q['quote']['ok'] is False and q['quote']['refusal']=='renewalWindowClosed' and q['stateRevision']==s1['stateRevision'])
ck('read-only quote preserves full checkpoint bytes including both slots and journal',B('00-migrated-before-any-save.checkpoint.json')==B('04-checkpoint-after-quote.json'))
ck('actual HTTP Load restores the original saved slot before it can be overwritten',loaded.get('accepted') is True and cp_loaded['currentSaveJson']==migrated['savedSaveJson'] and cp_loaded['savedSaveJson']==migrated['savedSaveJson'])
ck('Finance after actual Load matches independently migrated explicit saved state',finance(snap_loaded)==L('expected-saved-finance.json'))
ck('actual Save captures the loaded state under V18 without changing gameplay',sv.get('accepted') is True and cp['savedSaveJson']==cp_loaded['currentSaveJson'] and cp['currentSaveJson']==cp_loaded['currentSaveJson'] and json.loads(cp['savedSaveJson'])['saveVersion']==18 and s1b['stateRevision']==snap_loaded['stateRevision'])
ck('first engine replacement resumes the same session, revision and current/saved meanings',s2['sessionId']==s1b['sessionId'] and s2['stateDigest']==s1b['stateDigest'] and s2['stateRevision']==s1b['stateRevision'] and B('14-checkpoint-after-second-engine.json')==B('11-checkpoint-after-first-engine.json'))
ck('Finance is identical across Load, Save and first replacement',finance(snap2)==finance(snap_loaded))
ck('second restart preserves full checkpoint bytes, session and state',s3['sessionId']==s2['sessionId'] and s3['stateDigest']==s2['stateDigest'] and B('17-checkpoint-after-third-engine.json')==B('11-checkpoint-after-first-engine.json'))
ck('both restarts avoid rewriting the current checkpoint',L('11-checkpoint-stat.json')==L('14-checkpoint-stat.json')==L('17-checkpoint-stat.json'))
ck('Finance and saved-slot metadata remain identical across second restart',finance(snap3)==finance(snap2) and snap3['savedSlot']==snap2['savedSlot']==snap_loaded['savedSlot'])
ck('public people and facility identities remain intact across Load and restarts',snap_loaded['snapshot']['talent']==snap2['snapshot']['talent']==snap3['snapshot']['talent'] and snap_loaded['snapshot']['lot']['buildings']==snap2['snapshot']['lot']['buildings']==snap3['snapshot']['lot']['buildings'])
protected=L('protected-before.json')
for path,label in [(live,'live original'),(baseline,'immutable accepted baseline'),(master,'private raw master')]:
    ck(label+' retains hash and mtime',hashlib.sha256(open(path,'rb').read()).hexdigest()==expect==protected[path]['sha256'] and os.stat(path).st_mtime_ns==protected[path]['mtimeNs'])
ck('tested engine bytes are stable throughout the journey',hashlib.sha256(open(engine_path,'rb').read()).hexdigest()==engine_sha)
rep={'kind':'p11-owner-copy-engine-run','engineBundlePath':os.path.realpath(engine_path),'engineBundleSha256':engine_sha,'toolSha256':hashlib.sha256(open(tool_path,'rb').read()).hexdigest(),'tsCommit':ts,'servedSchemaId':s1['schemaId'],'projectionVersion':snap1['snapshotVersion'],'runtime':runtime,'sourceCheckpointSha256':expect,'checks':checks,'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks)}
json.dump(rep,open(os.path.join(E,'report.json'),'w'),indent=2)
print(f"=== P11 OWNER-COPY ENGINE RUN: {rep['passed']} passed, {rep['failed']} failed === engine {engine_sha[:12]} ts {ts[:8]}")
print('Private evidence: '+E)
sys.exit(0 if rep['failed']==0 else 2)
PYREPORT
