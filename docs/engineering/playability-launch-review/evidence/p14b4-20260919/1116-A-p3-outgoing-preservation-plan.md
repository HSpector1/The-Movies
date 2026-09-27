# 1116-A — concrete outgoing Save 38 / projection 53 preservation

Docs-only plan for the reviewed 1112-A/C candidate. Capture is deferred until
final C.3 qualification and publication, at the actual then-current source and
before the P3 writer changes it. No producer, compiler, test or gameplay was run
for this plan. Inspection used source reads and standard-library hashing,
decompression and JSON counts of the exact immutable files below.

The capture has **two actual tick calls**, six public mutation-route invocations
(four new accepted operations and two duplicate replays), and one waiver quote.
No additional seed, funding, person, age, clock, promise, receipt or career root
is authored by direct state edits. No old P3 is invented. A failed admission,
public command or comparison stops the capture without a substitute route.

## Exact immutable inputs

Paths below are relative to `tests/fixtures/p14/`. Each raw identity is measured
after gzip decompression. The future producer must independently check both
identities and the corresponding frozen manifest before importing any state.

| Input | Gzip bytes / SHA256 | Raw bytes / SHA256 |
| --- | --- | --- |
| `genuine-v37-c3-corpus/genuine-v37-c3-preretirement-week207.json.gz` | 174,595 / `926de1b20fa0cba9b822c05f542f0a3949c7e4b21560c2fa508b6fa3168af5a0` | 1,687,696 / `d6ad88d432b3ec75fbf6a2843493240d4007892c8230aea1f9a2350adc8c1045` |
| `genuine-v31-pre-b7/genuine-v31-bound-open-p2-lead.json.gz` | 88,896 / `fcf9beaec5cf8e266d8018a979c1a9aa555976b54075e436fc9b9feafbd65018` | 750,349 / `9b01ca9a91aea1a8022827e9cf748c04b64f25666f407b955d2f59fddbb6b495` |
| `genuine-v31-pre-b7/genuine-v31-kept-and-broken.json.gz` | 97,081 / `57362b7e282d8ba85f377b558fea50397ac134531e02de8159541775f0172841` | 821,651 / `734f671b4617ffb2899ef2326ac8dff00358878be8adbc77f2a2b28d99f010d1` |
| `genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz` | 119,037 / `56f629994f48ea5949a5dad5da44af5bba8ee2943451a05badd3bc4d98793daa` | 1,007,365 / `ccd30fdf7bd2f379bf44d150e03529b1c83f02086d79812800f4a255c766ea6d` |

Required manifest identities:

| Manifest | Bytes / SHA256 |
| --- | --- |
| `genuine-v37-c3-corpus/MANIFEST.json` | 32,532 / `b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294` |
| `genuine-v31-pre-b7/MANIFEST.json` | 57,343 / `e48480c30d4dab1775e1728f5e254443dc4343727efb4130ca17cce9166284c7` |
| `genuine-v32-pre-b8/MANIFEST.json` | 4,257 / `75977bce35eeb14558c1a2ddb153599e3f8109931c385e98c725b641b7dead14` |

Also pin the three historical provenance records beside their saves:

- `genuine-v31-bound-open-p2-lead.provenance.json`: 7,977 bytes /
  `2d7da970a321d877c87862c156026956b6990811e17c08b77b11c976609a28b8`.
- `genuine-v31-kept-and-broken.provenance.json`: 8,386 bytes /
  `f5136cfedc68ee79944af5045de88139b4cc4d3f9072dc05d0ba439aab2da3c5`.
- `genuine-v32-owes-two-p1.provenance.json`: 6,192 bytes /
  `e09dd2add10332117738b39aaadcb9117975ea8d47e873d75eb94eda765f8b24`.

These are lineage inputs, not outputs to overwrite. The existing projection-49
runtime was considered but is not selected: its actual saved/current week-45
slots contain two unbound P1 rows and no waiver link. B.7 provenance alone would
not justify claiming a preserved waiver. The genuine PRE207 input contains 59
count-only P1 rows, all open at capture, 85 first takes, three cohort records and
two profession-retirement records; it has no P2 or waiver. Its old development
mode and recorded historical parity defect remain exactly as disclosed by its
original manifest.

## Admission and zero-tick historical coverage

Use public `validateSaveV37`, `validateSaveV31` or `validateSaveV32` for each
original envelope, require its exact week and raw re-export, then use actual
`migrateToLive(importSave(raw))`. Current serialization is
`exportSave(makeSave(state))`; admit it through `validateSaveV38` before any
positive action and at each finalized output boundary. Use actual imports and
readers from `src/core/save.ts`; no Vitest fixture/helper import or cast of an
old state to `GameState` replaces migration.

For PRE207, require actual C.3 boundary 207, existing profession anchors and the
two announced Actor records. Before continuing, the genuine guarded
`convertV38ToV37` re-export must recover the original Save 37 bytes. The migrated
P2 and P1 historical inputs have real existing-person anchors at their own
opening weeks; no transition event is invented during their zero-tick lift.

The immutable P2 save at 52 has one bound `promise-0`, version 4, with exact
`{ kind: 'castRoleCount', count: 1, seatClass: 'lead' }`, window `[52,92)`,
20 first takes and three market receipts. Preserve that root, its exact
feasibility receipt and contract identity. The immutable week-61 save has two
P1 roots: `promise-0` SATISFIED at 61 with progress 1 and
`first-take-event-24`; `promise-1` BROKEN at 61 with progress 0 and no evidence.
It has 25 first takes and eight market receipts. Preserve both outcome-event
joins, all ordered receipts and unrelated history.

V31 -> current adds the already-governed nullable `supersededByPromiseId` field.
Compare all original promise fields and ordered historical roots exactly, while
independently asserting the real additive migration fields. Do not claim that a
whole V31 state equals a V38 state or strip current authority to manufacture
equality. No migration may recompute stored numeric rules versions, receipt
digests, progress, evidence or outcomes.

## Actual saved/current runtime and two-call continuation

Use `BridgeSession`, `createBridgeRuntimeCoordinator` and the real runtime codec
with an injected in-memory `BridgeCheckpointStore`; omit campaign-library
options for this small raw-checkpoint capture. This preserves actual durable
coordinator writes without repeating the larger Save As scenario from 1076.
It is not real-disk, native or latency evidence.

1. Create the coordinator with a fresh session from the admitted migrated 207
   state. Pass through the coordinator-supplied default checkpoint limits and
   require exactly one fresh-session factory call across startup and restart.
   Read the current session ID and revision through `runtime.read`.
2. Invoke `runtime.dispatch('save', controlEnvelope)` once. Require accepted,
   week 207 in both decoded slots, exact save bytes and the real `save` journal
   entry. This is an actual SAVE, not a hand-built saved slot or a relabelled
   imported checkpoint.
3. Read the actual emitted `advanceWeek` intent. Reserve the first tick before
   invoking `runtime.dispatch('command', submitIntentEnvelope)` once. Require
   acceptance, current week 208 and saved week 207. Decode the store's exact
   contents; require whole V38 admission of both distinct slots. Require the
   real SAVE and advance entries, their exact request/response identities,
   current/saved digest values and journal digest. The default journal limits
   remain 512 entries / 64 MiB and checkpoint limit remains 192 MiB.
4. The returned 208 state must contain actual choices from Actor to Director for
   `authored-0000` and Actor to Writer for `authored-0001`, each dated 208, with
   actual matching evaluations and retained acting retirement/history. This is
   a current-source continuation of the genuine old input, not historical C.3
   authority inserted into the old Save 37 fixture. Recount actual promise and
   receipt facts after the real settlement; do not freeze their 207 counts across
   a tick that may legitimately settle or append them.
5. Independently migrate the same raw PRE207 input again, admit whole V38 and
   reserve the second tick before `tick(state, { develop: true })`. Serialize
   its actual 208 result and require complete canonical Save 38 equality with
   the coordinator's current slot. No third call, retry, normalization or manual
   state repair may rescue a mismatch. This outgoing comparison does not erase
   the original outgoing-37 twelve-digest parity FAIL.
6. Close the actual coordinator/store, reopen a new store holding exactly those
   bytes and restart through `createBridgeRuntimeCoordinator`. Require no fresh
   fallback, exact current/saved slots and journal. Replay the exact original
   advance request: same stored response JSON, `firstSeen: false`, unchanged
   revision/save bytes/journal and no new store write. This duplicate call must
   not reserve or complete a third tick. Always close the final coordinator.

Use `decodeBridgeRuntimeCheckpoint`, `encodeBridgeRuntimeCheckpoint`,
`loadBridgeRuntimeCheckpoint` and `BridgeSession.fromRuntimeCheckpoint` for
current codec roundtrip checks as appropriate. Require current projection 53,
protocol 4, Save 38 and actual schema
`sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d`.
The current load's migration-factory callback must not run. Pin actual serialized
responses for replay; do not compare independently rebuilt timing metrics or
invent deterministic wall-clock/session identifiers.

## A new genuine waiver at the capture source, with zero ticks

Start only from the admitted, actually migrated `owes-two` input. At week 104
it has one bound, player-issued `promise-0`: P1 count 2, progress 0, no evidence,
no successor, window `[104,194)` and the actual employment contract
`studio-aca408ec-player:contract:t-act-09:104:player-30`.

Create a separate current `BridgeSession` with unchanged default limits and
invoke its actual `save(controlEnvelope)` once to preserve the pre-waiver slot.
Admit and capture that complete V38 state. Submit one `quoteWaivePromise` with
the exact wire draft:

```json
{"promiseId":"promise-0","substitute":{"family":"APPEARANCE_COUNT","count":2,"windowStartWeek":105,"dueWeekExclusive":165}}
```

Require an accepted quote with `ok: true`, null refusal and its real returned
intent. The quote must preserve the whole authoritative save. Invoke
`session.command` once with `type: 'submitIntent'` and that intent ID; require
acceptance and whole V38 admission. Require exactly one new bound successor
`promise-1`, the same contract, progress 0 and no evidence; original `promise-0`
must be WAIVED at 104 with its durable successor link and actual outcome-receipt
join. Retain original progress/evidence, all first takes and unrelated receipts.

Export the actual runtime checkpoint: both slots remain at week 104, but their
complete bytes must differ because the saved slot predates the waiver and the
current slot contains the real command result. Require its actual SAVE and
waiver journal entries. Reopen through the current codec/session API and replay
the same waiver request; require the original response, unchanged authority and
exactly one successor. Do not submit a second new waiver or advance this branch.

The link is **newly created by one current public command from genuine V32
ancestry**. It is neither an already-existing historical link nor an originally
captured V38 world. Count 2 / progress 0 preserves a genuine link but does not
prove a partly served waiver discriminator; that later P3 obligation remains in
1112's test matrix.

## Fixed outputs, counters and publication

The proposed exclusive destination is
`tests/fixtures/p14/genuine-v38-pre-p3/`. It must not already exist. Prepare only
these eight gzip payloads and one manifest after every premise, codec, replay,
cleanup and source/input guard has succeeded:

```text
genuine-v38-p3-migrated-week207.json.gz
genuine-v38-p3-natural-week208.json.gz
runtime53-current208-saved207.json.gz
genuine-v38-p3-bound-p2-lead-week52.json.gz
genuine-v38-p3-kept-broken-week61.json.gz
genuine-v38-p3-before-waiver-week104.json.gz
genuine-v38-p3-after-waiver-week104.json.gz
runtime53-waiver-current104-saved104.json.gz
MANIFEST.json
```

The future standalone producer should import public APIs directly and use Node
assertions plus a local pinned gzip reader. Count before every real tick/advance
and mutation-route invocation; record reserved and completed counts separately.
The exact successful bounds are two tick calls, six mutation-route calls (SAVE,
advance, advance replay; SAVE, waiver, waiver replay), one quote, two coordinator
creations, one coordinator fresh factory call and two real closes. Codec-only
reopens do not count as coordinator creations or gameplay. No loop may search
for another premise, and no branch continues after a failed positive.

As artifact-writing bounds, propose at most 16 MiB per uncompressed payload,
64 MiB aggregate uncompressed payloads, 16 MiB aggregate gzip payloads and
1 MiB for the manifest. These are producer output refusal guards, not changes to
runtime limits or any test timeout. Build/compress and independently gunzip-check
all payloads in memory before writing exclusive files. Record exact declared
output inventory; do not clean up or overwrite any old artifact on failure.

The manifest must pin every old input above, actual final C.3 qualification and
published source HEAD, tracked-source inventory/diff/index, producer hash,
protocol/save/projection/schema identities, default limits, raw/gzip hashes and
bytes, distinct slot hashes/weeks, real command IDs/request/response hashes,
journal records, duplicate/no-write facts, actual C.3 rows, historic promise
invariants, counters, environment and cleanup. New output hashes are measured,
never copied from a failure or guessed now. Label each output's old ancestry,
actual migration and subsequent actions separately.

Freeze and independently review that future producer before execution. The
parent alone supplies the actual then-current HEAD and owns the sole heavy lane.
Existing-source guards must remain exact; a mint recorder separately admits only
the nine declared new outputs rather than claiming an empty whole-source delta.
Publish the complete genuine outgoing corpus and its evidence before any P3
writer. Later projection 54 may register this measured outgoing 53 identity,
migrate the two slots independently and reset old journal/session authority;
none of that is activated or claimed by this preservation plan.
