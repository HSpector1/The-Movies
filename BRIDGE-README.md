# Current-game Unity bridge (protocol 4)

This bridge keeps the current TypeScript `GameState` as the only simulation authority. Unity
receives a current lot snapshot plus opaque, state-bound choices and can submit only an emitted
`intentId`. The bridge invokes the existing adapter/core read models and actions; it contains no
calendar, budget, production, casting, construction, RNG, save, migration, or legality formula.

The adoption gate is based on current game commit
`737bbe1f37586552a1dc55c4e82b614e57dfc2f2`. Three.js remains in place and its existing scripts
are unchanged.

## Run

The preferred native development path launches the authoritative TypeScript engine and the
compatible Unity build together, waits for an authenticated health check, and supervises engine
restarts:

```sh
npm run studio -- --unity-project "/absolute/path/to/unity-project"
```

The Unity project must already contain the standard macOS build at
`Builds/macOS/Project Studio Visual Spike.app`. The supervisor keeps authoritative runtime state
under a stable private profile, while each product launch receives a new in-memory capability and
its own bounded logs. Use `--profile-root PATH` to select a different persistent profile; reusing
that profile is what preserves current and explicitly saved V14 authority across full launches.
Run `npm run studio -- --help` for the executable/app alternatives and restart-budget option.

If the ignored native build is absent, rebuild it first with the pinned Unity editor:

```sh
"/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity" \
  -batchmode \
  -projectPath "/absolute/path/to/unity-project" \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/project-studio-native-build.log \
  -quit
```

The lower-level commands remain available for bridge-only diagnostics:

```sh
npm run typecheck:bridge
npm run test:bridge
npm run proof:bridge
export PROJECT_STUDIO_BRIDGE_CAPABILITY="$(node -e \
  "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))")"
PROJECT_STUDIO_BRIDGE_PORT=4317 npm run bridge
```

The server binds only to `127.0.0.1`, accepts at most 2 MB per request, and prints the live schema,
session, revision, digest, snapshot size, and serialization time at startup.

The command above is intentionally memory-only for compatibility with the existing manual
development flow. To exercise the durable runtime primitive, create one private runtime directory
and reuse that exact directory across restarts:

```sh
runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/project-studio-runtime.XXXXXX")"
chmod 700 "$runtime_dir"
echo "$runtime_dir"
export PROJECT_STUDIO_BRIDGE_CAPABILITY="$(node -e \
  "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))")"
PROJECT_STUDIO_BRIDGE_RUNTIME_DIR="$runtime_dir" \
  PROJECT_STUDIO_BRIDGE_PORT=4317 \
  npm run bridge
```

The TypeScript engine and Unity client must inherit that same capability for one product launch.
Reuse it when restarting only the engine within that launch; rotate it for the next product launch.
Never put it in command-line arguments, logs, checkpoints, saves, reports, or repository files.

Do not delete `runtime_dir` between the processes being tested. Startup reports
`checkpoint=durable` when disk persistence is active and `checkpoint=memory-only` otherwise.
`npm run studio` creates and owns its stable durable profile automatically; the manual environment
variable remains a validated infrastructure seam for bridge-only tests and diagnostics.

## Pinned wire contract

- `protocolVersion`: `4`
- `snapshotVersion`: `4` (the generated Unity presentation projection)
- schema: emitted as `SCHEMA_ID` by `bridge/protocol.ts` and `GET /contract`
- `GET /health`: protocol/runtime-instance/session/revision/digest health record
- `GET /contract`: the complete canonical contract JSON plus its SHA-256 identity
- `GET /session`: runtime/session bootstrap identity and current digest
- `GET /snapshot`: authoritative snapshot and current opaque choices
- `POST /command`: one `submitIntent` envelope
- `POST /save`: guarded export of the current V14 TypeScript save
- `POST /load`: guarded import/migration of the last captured TypeScript save

Every available choice has exactly these fields:

```text
intentId, kind, label, detail, projectId, castingSessionId, productionId
```

The three identity fields are strings or `null`. A command has exactly these fields:

```json
{
  "protocolVersion": 4,
  "schemaId": "sha256:...",
  "sessionId": "...",
  "commandId": "unity-generated-id",
  "expectedStateRevision": 0,
  "type": "submitIntent",
  "payload": { "intentId": "intent-v4-..." }
}
```

Unity must display `label`/`detail`, retain the exact nullable identities for presentation routing,
and send only the selected opaque ID. It must never infer legality from `kind`, titles, dates,
money, facility status, or production phase. The TypeScript server rebuilds choices from the live
authoritative state immediately before dispatch.

Protocol 4 requires an opaque, non-empty `runtimeInstanceId` on `GET /health` and `GET /session`.
It identifies one engine-process incarnation, changes when that process restarts, and is never
written to snapshots, command/control responses, the replay journal, V14 saves, or the durable
runtime checkpoint. Clients use it only to detect engine replacement during reconnect.

## Revision, replay, and reconnect rules

Session identity is checked before replay. An identical repeated command returns its cached exact
response. Reusing a `commandId` with any different route or envelope returns `COMMAND_ID_REUSE`.
An old revision returns `STALE_REVISION`; an old or forged option returns
`INTENT_NOT_AVAILABLE`. Every genuine rejection includes current `stateDigest` and a closed,
TypeScript-owned `rejection` object. Its `category` is a stable presentation category;
`blocker` and `remedy` are required non-empty player-readable text, while `currentHolder` is a
required nullable field. The authority uses `null` rather than inventing a holder. Capacity
contention that the engine accepts into a queue is an accepted receipt, never a rejection.

`POST /save` and `POST /load` use the same session/revision/command protections. The returned
`saveJson` is the current engine's canonical export. `BridgeSession.fromSaveJson` reconstructs a
fresh session exclusively through the current `importSaveJson` migration boundary; no bridge
revision is written into `GameState` or the save. Tests prove export/import/export byte identity,
fresh-session digest equality, and bridge/headless byte equality.

## Durable runtime checkpoint

When `PROJECT_STUDIO_BRIDGE_RUNTIME_DIR` is set, the bridge stores a strict
`BridgeRuntimeCheckpointV1` beside a single-process lock. It is operational infrastructure and is
not a new gameplay save version. The closed checkpoint contains:

- untouched canonical current V14 save JSON and its SHA-256 digest;
- untouched last explicitly saved V14 JSON and digest, or exact `null` values;
- the logical session ID and state revision;
- a bounded journal of canonical route, command ID, exact request JSON, and exact full response
  JSON; and
- a digest over the complete canonical journal.

All state-dependent reads and command/save/load dispatches share one serialized coordinator.
A first-seen result is not returned to HTTP until the complete next checkpoint has been written to
a same-directory temporary file, synced, renamed, and the directory synced. A duplicate replays
the stored response bytes directly. A real-process test commits command/save/command/load, sends
`SIGKILL`, restarts from the same directory, and proves the logical session, revision, state digest,
V14 bytes, and all four raw HTTP responses are exact.

A strict forward-only operational migration accepts the immediately preceding protocol-3
checkpoint schema. It validates its canonical bytes, both V14 slots, digests, journal, and terminal
authority before atomically writing protocol 4. Because protocol-3 replay bytes cannot be returned
under the protocol-4 contract, the migration preserves current and explicitly saved V14 bytes but
starts a new logical session at revision zero with an empty journal. Corrupt or unsupported
checkpoints fail closed; the old bytes remain intact if the migration write fails.

The runtime root must be a dedicated current-user directory with mode `0700`; checkpoint and lock
files use `0600`. Symlinks, unexpected nesting, corrupt UTF-8, oversized files, concurrent live
owners, and unverifiable or mismatched lock ownership fail closed. A stale lock is reclaimed only
after process-incarnation verification. Graceful `SIGINT`/`SIGTERM` drains accepted work and
releases the lock.

Journal bounds never silently evict a command identity. If existing history alone fills the bound,
the checkpoint atomically rolls to a new logical session at revision zero while preserving current
and explicit-save V14 authority, then requires the client to reconnect. If one candidate cannot fit
an empty journal, the runtime fails fatally instead of cycling sessions forever.

`npm run studio` now owns the private durable profile, fresh launch capability, random initial
port, authenticated readiness, direct Unity startup, fixed-port engine restarts, bounded redacted
logs, and exact child-process cleanup. Unity retains an ambiguous command/save/load envelope and
retries its identical UTF-8 bytes only after a compatible session handshake; the TypeScript replay
journal returns the already committed response without applying the operation twice.

This completes the bounded development lifecycle, not production packaging. `npm run studio`
still executes the checked-in TypeScript through the pinned `vite-node` development graph. A
packaged runtime must define and audit its emitted dependency set and establish install/update and
profile-backup behavior before public distribution.

## Movie #2 interaction

The server starts after a real managed-studio founding and a complete Movie #1 driven through the
same legal choices, leaving the journey on released Movie #1 with a `commissionScreenplay` choice.
The Movie #2 path is entirely server-issued:

```text
startConstruction (independent lot choice)
commissionScreenplay
advanceWeek
acceptScreenplay
startAuditions
advanceWeek
acknowledgeAuditions
greenlightPicture
advanceWeek / resolveProductionBlocker as emitted
advanceWeek through shooting, post-production, release-ready, and released
```

The greenlight option's detail names the exact Director, Lead, Antagonist, Support, and
Production/Craft choices. Its hidden action uses the accepted screenplay's locked concept, writer,
shape, and promise; current audition evidence; current staffing availability; and the engine's
`requiredNegative` result. Production commands come byte-for-byte from `studioDecision`.

Run `npm run proof:bridge` for a machine-readable exact command/identity/digest trace and captures
for the whole lot, construction, screenplay ready, auditions reviewed, roles/greenlight,
production blockers, shooting, post-production, released Movie #2, save/load, reconnect,
headless parity, and command/snapshot performance.
