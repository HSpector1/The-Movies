# Current-game Unity bridge (protocol 2)

This bridge keeps the current TypeScript `GameState` as the only simulation authority. Unity
receives a current lot snapshot plus opaque, state-bound choices and can submit only an emitted
`intentId`. The bridge invokes the existing adapter/core read models and actions; it contains no
calendar, budget, production, casting, construction, RNG, save, migration, or legality formula.

The adoption gate is based on current game commit
`737bbe1f37586552a1dc55c4e82b614e57dfc2f2`. Three.js remains in place and its existing scripts
are unchanged.

## Run

```sh
npm run typecheck:bridge
npm run test:bridge
npm run proof:bridge
PROJECT_STUDIO_BRIDGE_PORT=4317 npm run bridge
```

The server binds only to `127.0.0.1`, accepts at most 2 MB per request, and prints the live schema,
session, revision, digest, snapshot size, and serialization time at startup.

## Pinned wire contract

- `protocolVersion`: `2`
- `snapshotVersion`: `2`
- schema: emitted as `SCHEMA_ID` by `bridge/protocol.ts` and `GET /contract`
- `GET /health`: protocol/session/revision/digest health record
- `GET /contract`: the complete hashed contract descriptor
- `GET /session`: connection bootstrap identity and current digest
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
  "protocolVersion": 2,
  "schemaId": "sha256:...",
  "sessionId": "...",
  "commandId": "unity-generated-id",
  "expectedStateRevision": 0,
  "type": "submitIntent",
  "payload": { "intentId": "intent-v2-..." }
}
```

Unity must display `label`/`detail`, retain the exact nullable identities for presentation routing,
and send only the selected opaque ID. It must never infer legality from `kind`, titles, dates,
money, facility status, or production phase. The TypeScript server rebuilds choices from the live
authoritative state immediately before dispatch.

## Revision, replay, and reconnect rules

Session identity is checked before replay. An identical repeated command returns its cached exact
response. Reusing a `commandId` with any different route or envelope returns `COMMAND_ID_REUSE`.
An old revision returns `STALE_REVISION`; an old or forged option returns
`INTENT_NOT_AVAILABLE`. Every rejection includes current `stateDigest`.

`POST /save` and `POST /load` use the same session/revision/command protections. The returned
`saveJson` is the current engine's canonical export. `BridgeSession.fromSaveJson` reconstructs a
fresh session exclusively through the current `importSaveJson` migration boundary; no bridge
revision is written into `GameState` or the save. Tests prove export/import/export byte identity,
fresh-session digest equality, and bridge/headless byte equality.

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
