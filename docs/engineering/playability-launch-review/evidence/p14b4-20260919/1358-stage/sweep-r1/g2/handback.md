# 1358-N G2 handback: Bridge A

G2 authored the Bridge A pins of the Save44 and projection-57 sweep (record 1358-N) in worktree
`S/1358-sweep/g2`, branch `sweep-g2`, from tag `step4` (8e02a44). S = `/Users/zacheryspector/studio-scratch`.
Counts and checks below were final at 03:48 CDT on 2026-10-02 (`date`).

## Deliverables

- `patch.diff`: `git -C S/1358-sweep/g2 diff step4 -- tests ui`. 28,525 bytes, sha256
  `5dd89ed6a304198d65a79bede29117b3529086395b711c4f1074e7d0a0db39cc`. 20 files, 64 insertions, 57 deletions.
- `classification.json`: 59 objects. `deferred.json`: 2 objects. `py/classify.py` builds both from the census rows
  and the worktree diff, and asserts that every `new` text sits at its post-image line.
- Commits on `sweep-g2`: dc78f96 (18 files, P1 and S2), 17929a8 (runtime checkpoint), 7c77890 (generator).
- Checks:
  - `git diff --stat step4 -- . ':!tests' ':!ui/src'` prints nothing.
  - `git apply --check --cached` passes on a temporary index read from `step4`.
  - All 20 files have the same blob at `base`, at `step4` and at repo HEAD b17e8ac2 (`git rev-parse <rev>:<path>`),
    so the patch applies to HEAD too.

## Counts by class

| Class | Census rows | Edited | Deferred | No edit | Classification objects |
|---|---:|---:|---:|---:|---:|
| P1 | 40 | 40 | 0 | 0 | 40 |
| P2 | 4 | 3 | 0 | 1 | 4 |
| P4 | 2 | 0 | 2 | 0 | 0 |
| S2 | 14 | 14 | 0 | 0 | 14 |
| S2, new row | 1 | 1 | 0 | 0 | 1 |
| Total | 61 | 58 | 2 | 1 | 59 |

- N-0200 (P2) takes two objects: the `OUTGOING_56` declaration (:210) and its list entry (:998).
- N-0198 (P2) needs no edit. Its it.each gains a case (see "New test identities").
- G2 has no `measure` row, and no stop condition fired.

## Values and their sources

- **New schema id** `sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253`, at
  `bridge-contract-generator` :571 (N-0148) and :574 (N-0149).
  - Read from step-4 `generated/unity/project-studio-bridge.contract-manifest.json:8` (`schemaId`). The pin's own
    comment names that manifest field as the source. The step-4 C# carries the same id at
    `generated/unity/StudioBridgeDtos.Generated.cs:3` and :20.
  - Method check: the same manifest line at `base` reads `349b2d3e…`, the current pin.
  - Cross-check: python recomputes `schemaIdentity` (`bridge/schema/canonical.ts:22`, sha256 of the sorted-key compact
    JSON) over the checked-in `bridge/schema/project-studio-bridge.schema.json`. It gives `349b2d3e…` at base and
    `74826ef4…1253` at step 4. The step-4 schema file is 403,927 bytes, sha256 `032d261c…`, as 1358-J finding 10
    states. 1358-X5:44 records `check:bridge-contract` exit 0 on the step-4 artifacts.
- **Outgoing56 id** `sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1` (N-0200).
  - Read from the base manifest :8 (blob `2d168e78`, the same blob at repo 5245072a and HEAD) and the base C# :3. The
    step-4 roster registers it at `bridge/runtime-checkpoint.ts:64` as `projection-v56`.
  - Roster check: parsing `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` gives 44 keys at base, which equal the test's list
    exactly, and 45 keys at step 4. The one added key is this id. No key leaves and no label changes. The post-image
    list holds 45 sorted keys equal to the step-4 roster, with `OUTGOING_56` after `2c377b6f…` and before
    `510f08e4…`.
  - Neither running id sits in its own roster, so the no-edit pins at `bridge-runtime-checkpoint:949` and
    `bridge-r3n4-read-model-deltas:149` still hold.
- **Projection 57** (P1): `PROJECTION_VERSION = 57` at `bridge/schema/bridge-schema.ts:286`. `SNAPSHOT_VERSION`
  aliases it (`bridge/protocol.ts:34`). The step-4 schema JSON reads `$id` `urn:project-studio:bridge:protocol-4:projection-57`
  and `x-project-studio.projectionVersion` 57. The step-4 C# reads `public const int ProjectionVersion = 57;` (:18).
  The literal guard throws `expected literal ${const}` (`bridge/schema/runtime.ts:114`).
- **Save44** (S2): `LIVE_SAVE_VERSION = 44` at `src/core/save.ts:6567`. Every S2 site reads a `session.save()` export
  or a hydrated checkpoint slot. The hydrator refuses any other version (`bridge/runtime-checkpoint.ts:501-503`).

## Census corrections and new rows

- No census row is wrong.
- N-0200: the census edit text inserts the literal, while 1358-N P2 and the brief ask for a named `OUTGOING_56`
  constant. The patch follows the plan: `const OUTGOING_56` at :210 under a two-line provenance comment, and
  `OUTGOING_56,` at :998 under a one-line comment that names the `349b2d3e…` prefix for the sort order.
- **G2-new-1**, S2, `tests/bridge-runtime-checkpoint.test.ts:439` (step 4 :436): `/canonical V43 save bytes exactly/`
  becomes `/canonical V44 save bytes exactly/`.
  - The guard at `bridge/runtime-checkpoint.ts:505` interpolates `LIVE_SAVE_VERSION`, so the unedited leaf fails at
    step 4 on the number alone. Its premise, a trailing LF on a live save, still reaches the same guard.
  - The census missed it because `detect.py`'s `lit43` pattern `(?<![\w.:-])43` rejects a 43 after the letter V, and
    no detector matches a bare `V43`. A grep of tests and ui/src for other `V43` or `version 43` message assertions
    outside the frozen API names found no second site.
  - Label: S2 under 1358-N. The Save43 sweep moved the same line V42 to V43 and labeled it S8 (1344 classification,
    g2). 1358-N's S8 covers the relationship-tamper prefix, which this leaf never reaches.

## New test identities

One. The it.each at `tests/bridge-runtime-checkpoint.test.ts:766` (N-0198, 1358-J 3m) gains a case. Identity,
verbatim:

```
P04A REOPEN — enumerated prior protocol-4 checkpoint import > accepts and migrates the enumerated sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1 (projection-v56) identity
```

The case runs first in Map order. The loader treats every enumerated id alike (`migrateToLive(importSave(json))` at
`bridge/runtime-checkpoint.ts:893`), so this case runs the same body as the other 44, including the S2 pin at :785.

## Renamed titles

None. No title in the 20 files states 56 as the projection or 43 as the live version. Older stale titles stay
(1358-F9 ruling 5), for example `bridge-p13b-r07-setup:319` ("PROJECTION_VERSION is 40") and `bridge:165`
("projection v32").

## Deferred

- N-0150 (F10, post-image :726) and N-0151 (F11, :727): P4, decided by the recorded producer run (1358-F9, "P4").
  Both keep `a0f316eb…`. The provenance comment (:718-724, census :716-722) and F12 (:728) stay untouched.
- Until the run lands, `pins exact positive output identities and deterministic rerendering` fails on this branch at
  F10.
- The cross-check value `1dadf88f…` (420,340 bytes) appears only in `deferred.json`, never in the patch.
- The two comment lines added at generator :567-568 move F10 and F11 two lines below the census's :724-725.

## Items for the parent

1. **Ruling: the label of G2-new-1.** I filed it S2 and certain, from the source. If the parent prefers the 1344 S8
   label, only the label changes.
2. **Disclosure: the repo object store.** My `git log -S <outgoing55 id> -- tests/` in the repo ran over a blob:none
   partial clone. Git fetched missing blobs from `origin` and started background `gc --auto`.
   - At 03:34 that wrote `.git/worktrees/The-Movies-headless-program/FETCH_HEAD`, added small promisor packs (34 packs
     now), and rewrote the common `packed-refs` at 03:34:36.
   - HEAD and the branch still read b17e8ac2. The index mtime (03:34:49) matches your commit b17e8ac2 (03:34:50), not
     my command.
   - After that I ran no history search in the repo. Later checks used `rev-parse <rev>:<path>`, which reads trees
     only. You may want `git count-objects -v` or a connectivity check at a quiet time.
3. **Not verified by reading: the F10 schema source.** The P2 pins at generator :571 and :574 assume
   `FIXTURES.F10_CURRENT_QUOTE_UNIONS.schema` is the whole current schema. That fixture lives in `tests/fixtures`,
   which I did not read. The test's P14B.2 comment (:667-670) and 1358-J finding 10 both say F10 renders the whole
   current schema. x2 settles it.
4. **Stale line citation kept.** The comment at `bridge-runtime-checkpoint:435` cites `bridge/runtime-checkpoint.ts:501`.
   After step 4 the guard sits at :505. I left the comment as written, as 1358-N's out-of-scope rule does for
   `save.ts` citations.

## Process

- No node, vitest, tsc, tsx, vite-node or npm process ran. I used git (read-only on the repo, commits only on
  `sweep-g2`), grep, sed, python3 (writes only under `out/g2`) and the editor on the 20 test files.
- I did not list, scan or read `tests/fixtures`, and I read no Owner save.
- The parent's x2 measures every edit: the three type gates, both generator checks, and core over these files.
