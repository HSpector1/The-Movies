# 1324-C — retained-defect repair R1 (clusters C6, C7, C20): handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `4ea90ac4b7ef88b4fc321428a983687d7722a5d7`.
Contract: `E/1324-A-retained-defect-repair-r1-plan.md`. Tests only; no production code, fixture
payload, `tsconfig` or `vitest.config` change — verified by `git diff --stat` below (7 files, all
under `tests/`).

**HEAD drift noticed during verification.** By the time I ran the final `git apply --check`, the
real repository's `HEAD` had advanced to `a5d30d686aff2f4da8a89f11adc8fcfcf08c6a23` — one docs-only
commit ("handoff CURRENT block…") touching five markdown files under
`docs/engineering/playability-launch-review/`, landed after this task was assigned. `git show
--stat a5d30d68` confirms zero overlap with any file this task touches. Per the task's explicit
instruction the patch is verified against the **pinned** `4ea90ac4`, not the moving branch tip
(commands and exit codes below). This is reported as a fact for the parent, not treated as
authorization to rebase onto the newer tip.

## Method actually used

Scratch tree built exactly per the task's Method section:
```
git archive HEAD src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C <tree>
git archive HEAD tests | tar -x -C <tree> --exclude='tests/fixtures*'
ln -s <repo>/tests/fixtures <tree>/tests/fixtures   # read-only
ln -s <repo>/docs <tree>/docs                        # read-only
ln -s <repo>/node_modules <tree>/node_modules        # read-only
cd <tree> && git init -q && git add -A && git commit -q -m "1324-C scratch base at HEAD 4ea90ac4"
```
Base commit in the scratch tree: `5527f58` ("1324-C scratch base at HEAD 4ea90ac4"). One tree only,
all edits made there with the `Edit`/`Read` tools; the real repository's `tests/`/`ui/` trees were
never touched. Tree removed at the end of this task (see Cleanup).

## Rows covered

`E/1321-I-failures.json` filtered to `cluster_1302` in the three named clusters: **57 rows**, exactly
matching the plan's table (C6 25, C7 23, C20 9). Extracted to
`/private/tmp/.../scratchpad/1321-target-rows.json` during the session (session-scratch, not
repo-committed).

## Changes by cluster (28 classification rows: 27 edit hunks + 1 documented no-edit row for the Rule-4 leaf)

| Cluster | Files touched | Edit hunks | Target rows now passing | Target rows left failing (Rule 4) |
| --- | --- | --- | --- | --- |
| C6 `v13TwinOf` | `tests/contracts/_v14Contract.ts` | 1 | 25 | 0 |
| C7 `firstTakeSubjects` guard | `tests/p14b5-t-failure-tuning.test.ts` (11), `tests/p14c1-materialized-aging.test.ts` (7) | 18 | 23 | 0 |
| C20 migration purity | `tests/p14c3-save-v38.test.ts` (2), `tests/bridge-p14c2rm-runtime.test.ts` (2), `tests/bridge-p14c3-promise-digest-continuity.test.ts` (2), `tests/p14p3-directing-promises.test.ts` (2) | 8 | 8 | 1 |
| **Total** | **7 files** | **27** | **56** | **1** |

25 + 23 + 8 + 1(unfixed) = 57, matching the assigned row count exactly.

### C6 — `tests/contracts/_v14Contract.ts`

`projectToV13State` (the `v13TwinOf` builder) stripped `sets`/`nextSetId`/`productionQueue`/
`originalScreenplays`/`studioEvents`/`releaseAuthority`/`studioHistory`/`hollywood`/`foundingRegime`/
`technology`/`physicalPlans`/`talentMarket`/`firstTakes`/`promises`/`relationships`/
`talentProvenance`/`careerLifecycle` — every root known when the function was written — but never
`firstTakeSubjects` (added at V40 by commit `ef38cf9a`, after this function's `firstTakes`/`promises`
block). A genuine carrier (no V14 authority) still carries a live `firstTakeSubjects` root, so
`validateSaveV13` refused it with `state has unknown field "firstTakeSubjects"`, masking the actual
C2a-M1 §8.3 boundary assertion every T9 leaf in `tests/v14-migration.contract.test.ts` depends on.
**Fix**: one more guard+strip block, same shape and same-family comment as the existing
`firstTakes`/`promises` block immediately above it (`if ((state.firstTakeSubjects?.facts ?? []).length
> 0) throw …; delete raw.firstTakeSubjects`) — real authority in the root is never silently
discarded, exactly like every other guarded root in this function.

### C7 — `tests/p14b5-t-failure-tuning.test.ts` and `tests/p14c1-materialized-aging.test.ts`

Both files call the real `appendFirstTakes` (directly or via `tick()`), which since commit
`ef38cf9a` throws `"promises: migrate to Save40 before recording a first take"` on any state whose
`firstTakeSubjects` root is `undefined`.

- **`p14b5-t-failure-tuning.test.ts`**: the CONSTRUCTED groups 1–4 fixture (`stagedWorld()`) is a
  hand-built partial `GameState`; groups 5–6 drive the same chain over a REAL full `GameState`
  (`p13aGeneratedStudio`/`advanceTo`). Adding only `firstTakeSubjects` to `stagedWorld()` was
  **measured, not assumed, insufficient**: it unblocks the guard but then crashes with `TypeError:
  Cannot read properties of undefined (reading 'activeProductions')`, because `subjectForNewTake`
  unconditionally dereferences `concepts`/`scriptDevelopment`/`state.studio.activeProductions` for
  the player studio (`src/core/firstTakeSubjects.ts:7-15`) once the guard clears. The complete,
  measured fix: `stagedWorld()` also gets minimal legacy-mode `concepts`/`scriptDevelopment`/`studio`
  roots, and the constructed `Production` objects (`shot()`) gain a real `conceptId` threaded through
  `shoot()`/`driveChain()`/`carrier()`/`carrierChain()`, defaulting to the staged fixture's own
  concept for groups 1–4 and using the carrier's genuine worldgen-minted concept
  (`state.concepts[0]`) for groups 5–6 — never an invented id, matching Rule 2. The file's own header
  comment ("every populated field is named in the header") is updated to still be true.
- **`p14c1-materialized-aging.test.ts`**: `liftForTick()` lifted a migrated state only to V38
  (established one-governed-step-per-new-requirement pattern: P14C.2a → V34, P14C.4 → V35/V36, C.3 →
  V37/V38). Extended by the same pattern through `convertV38ToV39`/`convertV39ToV40`
  (`firstTakeSubjects`, closing the C7 guard) and, **measured** after the first extension exposed a
  second defect, `convertV40ToV41`/`convertV41ToV42` (`termination`/`sharedCompetitions`) — four
  leaves in section 8/11 explicitly tag their own envelope `saveVersion: LIVE_SAVE_VERSION` and then
  validated it with the frozen, version-pinned `validateSaveV38`, which throws `validateSaveV38:
  expected version 38` against a genuinely-42-tagged envelope once the state actually reaches that
  shape. The leaves' own titles state the intended law explicitly ("the round trip is through
  whatever the live writer stamps, not pinned to V33"); the call sites had simply never been updated
  as the live version moved past 38. Fixed by importing and calling the generic `validateSave`
  dispatcher (`src/core/save.ts:5383`, "dispatches on version… loudly rejects unknown versions")
  instead, and removing the now-unused `validateSaveV38` alias (`noUnusedLocals`).

### C20 — `tests/p14c3-save-v38.test.ts`, `tests/bridge-p14c2rm-runtime.test.ts`, `tests/bridge-p14c3-promise-digest-continuity.test.ts`, `tests/p14p3-directing-promises.test.ts`

`migrateToLive` (`= migrateToV42`) genuinely adds three roots a Save37/38 `old.state` never carried:
`firstTakeSubjects` (V40), a `termination` movement on every rival finance period (V41, 1309-X3
ruling 4), and `sharedCompetitions` on every relationship edge (V42, 1320-A S5). `p14c3-save-v38.test.ts`
already carried `withRivalTermination`/`withSharedCompetitions` wrappers for the last two; none of
the four files carried the `firstTakeSubjects` one. **Fix, in all four files**: add
`withFirstTakeSubjects` (built from `convertV39ToV40`'s own rule — `{version:1, cutoverOrdinal:
old.state.firstTakes.length, facts:[]}` — never a literal), and for the two `bridge-*` files and
`p14p3-directing-promises.test.ts` (which never had the termination/sharedCompetitions wrappers
either) add local copies of `withRivalTermination`/`withSharedCompetitions` too, then wrap `old.state`
(or `old.save.state`) in all three before every `canonicalJson`/`stableStringify` comparison against
`current.state`. Measured directly (not assumed) via a disposable scratch probe against the real
`bridge-p14c2rm-runtime.test.ts` fixture before writing the fix: `old.hollywood !== null`,
`old.relationships.length === 33`, `DIFF at key hollywood` (847067→847947 bytes) and `DIFF at key
relationships` (30617→31376 bytes) alongside `current keys not in old: ['firstTakeSubjects']` — all
three roots, not just the one the 1302-I field-evidence note named for this file.

**One leaf explicitly left failing — Rule 4.** `tests/p14c3-save-v38.test.ts`, "exposes matching
strict38 conversion, validation and current migration over a genuine37 save" (current line 93; was
line 85 at the assigned base — the file gained 8 lines above it from the `withFirstTakeSubjects`
helper). `expect(stableStringify(migrateToLive(old))).toBe(stableStringify(converted))` compares a
**permanently V38-pinned** `converted = saveApi('convertV37ToV38')(old)` against `migrateToLive(old)`,
which **always tracks the live version** (currently 42). This has been structurally broken since V39
shipped: 1320-C's own "Unresolved items" #2 already documented this exact class of mismatch with
`…41…` in place of today's `…42…`, and I re-measured it directly on this build: `Received
saveVersion: 42` vs `Expected saveVersion: 38`, with the rest of both canonicalized state bodies
otherwise structurally parallel (same field families, same shapes). No `with*()` root-addition and no
version-literal pin move can make a fixed-V38 comparator agree with a moving live comparator without
changing what the assertion means — exactly the case the plan's Rule 4 names this leaf for by line
number. **Not edited.** Reported here with its title and history per Rule 4 instead.

## Commands actually run, with actual outputs

Reproduction (baseline, before any edit — all run from the scratch tree):
```
npx vitest run tests/v14-migration.contract.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 25 failed | 5 passed (30)
npx vitest run tests/p14b5-t-failure-tuning.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 11 failed | 1 passed (12)
npx vitest run tests/p14c1-materialized-aging.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 12 failed | 34 passed (46)
npx vitest run tests/p14c3-save-v38.test.ts tests/bridge-p14c2rm-runtime.test.ts \
  tests/bridge-p14c3-promise-digest-continuity.test.ts tests/p14p3-directing-promises.test.ts \
  --reporter=verbose
  → Test Files 4 failed (4) / Tests 11 failed | 66 passed (77)
  (11 = the 9 target C20 rows in these files + D07/D18, pre-existing RETAINED-SAME defects
  confirmed out of scope by 1320-C's own "Unresolved items" #4 — never masked by Save42, not in
  the 1321-I cluster_1302 target-row list)
```

Regression check on `_v14Contract.ts`'s other consumers, run once after the C6 fix alone (before any
C7/C20 edit), to confirm the shared-file edit didn't move anything else:
```
npx vitest run tests/c2a-m2-sets-save.test.ts tests/contracts/studio-events.contract.test.ts \
  tests/contracts/v14-boundary-guards.contract.test.ts tests/contracts/v14-byte-parity.contract.test.ts \
  tests/save.test.ts --reporter=verbose
  → Test Files 5 passed (5) / Tests 81 passed (81)
  (tests/c2a-m2-sets-save.test.ts's 2 leaves pass here too — 1320-C had already flagged them as
  "resumed-correctly, masked behind a Save42 sentinel, needing no direct edit of their own"; this
  confirms they resume correctly again once _v14Contract.ts's v13TwinOf mask clears)
```

After every edit, final consolidated run of all 7 touched files together (one process):
```
npx vitest run tests/contracts/_v14Contract.ts tests/v14-migration.contract.test.ts \
  tests/p14b5-t-failure-tuning.test.ts tests/p14c1-materialized-aging.test.ts \
  tests/p14c3-save-v38.test.ts tests/bridge-p14c2rm-runtime.test.ts \
  tests/bridge-p14c3-promise-digest-continuity.test.ts tests/p14p3-directing-promises.test.ts \
  --reporter=verbose
  → Test Files 2 failed | 5 passed (7) / Tests 3 failed | 162 passed (165)
```
The 3 failures, individually confirmed: `p14c3-save-v38.test.ts` "exposes matching strict38…" (Rule 4,
above); `p14p3-directing-promises.test.ts` D07 and D18 (pre-existing, out of scope, confirmed
unmodified by this task's diff — `rivalWinner208()` inside `tests/helpers/p14p3-fixtures.ts` was never
touched).

Per-file breakdown, all individually re-run and green (or matching the documented exceptions) after
every edit landed:
```
tests/v14-migration.contract.test.ts                         30 passed (30)
tests/p14b5-t-failure-tuning.test.ts                          12 passed (12)
tests/p14c1-materialized-aging.test.ts                        46 passed (46)
tests/p14c3-save-v38.test.ts                                  46 passed | 1 failed (47)  — Rule 4
tests/bridge-p14c2rm-runtime.test.ts                          8 passed (8)
tests/bridge-p14c3-promise-digest-continuity.test.ts          2 passed (2)
tests/p14p3-directing-promises.test.ts                        18 passed | 2 failed (20)  — pre-existing
```

Type gates (from the scratch tree root, after the last edit):
```
npx tsc -p tsconfig.json --noEmit        → exit 0, empty output
npx tsc -p tsconfig.bridge.json --noEmit → exit 0, empty output
npx tsc -p tsconfig.src.json --noEmit    → exit 0, empty output
```

Patch verification (from the real repository root, against the assigned base commit, not the
current — drifted — branch tip):
```
TMPIDX=$(mktemp)
git read-tree 4ea90ac4                                              → exit 0
git apply --check --cached docs/.../1324-stage/1324-retained-r1.patch → exit 0
```

## Per-leaf pass reason (Rule 5)

- **C6, all 25 rows in `tests/v14-migration.contract.test.ts`** (T9 A/B/C/D): each now reaches its
  own stated assertion (byte-identical V13 twin parity, phase×blocker migration, derived house sets,
  grandfathered bindings) because `v13TwinOf` no longer refuses the twin at the V13 boundary —
  `firstTakeSubjects` is stripped by the new guard exactly like every other post-V13 root, so
  `validateSaveV13` sees a genuine, legal V13 envelope and the leaf's real C2a-M1 §8.3 assertion runs
  for the first time.
- **C7, `p14b5-t-failure-tuning.test.ts`, groups 1–4 (7 rows)**: each `shoot()` call inside
  `driveChain()` now succeeds because `stagedWorld()` carries a real `firstTakeSubjects` root and a
  real, matching `conceptId`; every group's own arithmetic/idempotency/drift assertion (already
  correctly written) now actually executes against the real write path instead of throwing before
  reaching it.
- **C7, `p14b5-t-failure-tuning.test.ts`, groups 5–6 (4 rows)**: same mechanism, plus the genuine
  carrier concept id resolves `subjectForNewTake` without inventing authority; the replay/idempotency
  and save-round-trip assertions (byte-identical root on replay, `validateSaveV42` acceptance,
  historical-delta preservation) now run against a real minted `firstTakeSubjects` fact.
- **C7, `p14c1-materialized-aging.test.ts`, 8 of 12 rows** (calendar advance, market-decision
  crossing, scientists age, zero-RNG, idempotence): each reaches its stated aging/pricing/idempotency
  assertion because `liftForTick`'s extended chain gives `tick()` a state `appendFirstTakes` accepts,
  so the real tick completes and the age-materialization evidence the leaf was written to check is
  what actually runs.
- **C7, `p14c1-materialized-aging.test.ts`, remaining 4 rows** (week-12/13 round trip ×2, the
  "bonus" `exportSave`/`importSave`/`loadSave` dispatcher check, the four-tamper-message refusal
  test): each reaches its own stated assertion (age preserved through the live validator; the
  generic dispatcher accepts a live envelope; each tamper's own distinguishable message survives)
  because the envelope's `saveVersion: LIVE_SAVE_VERSION` tag is now checked by the generic
  `validateSave` dispatcher — the same validator the tag actually names — instead of the frozen,
  stale `validateSaveV38`.
- **C20, `p14c3-save-v38.test.ts`, 4 `it.each` rows**: "every old field, receipt, clock and RNG value
  survives migration" now runs for real because the expected side is built with all three roots
  `migrateToLive` genuinely adds, so the comparison's only remaining differences are the ones the
  leaf actually intends to prove absent.
- **C20, `bridge-p14c2rm-runtime.test.ts`, 2 rows**: `currentSlot()`'s "resets old journal/revision/
  session authority" and "rejects the old command identity…" assertions now run because the
  byte-purity check inside `currentSlot()` compares like with like (both sides carrying the three new
  roots), so the ACTUAL assertions about journal/session/command-identity reset are what the leaf
  exercises, not an unrelated root-shape mismatch.
- **C20, `bridge-p14c3-promise-digest-continuity.test.ts`, 1 row**: "preserves the current52
  historical command journal and exact duplicate response without replaying gameplay" — same
  mechanism, both loop iterations (`currentSaveJson`/`savedSaveJson`) now reach the journal/session
  assertions the leaf is titled for.
- **C20, `p14p3-directing-promises.test.ts`, D14**: "preserves old meaning and refuses lossy reverse
  conversion" now runs its real body (promise/firstTakes/careerLifecycle/rngState equality, the
  `convertV39ToV38` round trip, the scalar-restamping refusal) because `oldState` is built with the
  same three roots `migrateToLive` adds, so the leaf's actual lossless-preservation claim is what
  gets checked.

## Leaves left, and why

1. `tests/p14c3-save-v38.test.ts` "exposes matching strict38 conversion, validation and current
   migration over a genuine37 save" — Rule 4, detailed above. Not edited.
2. `tests/p14p3-directing-promises.test.ts` D07 ("authors and fulfills a real rival promise to a
   credited primary Actor") and D18 ("uses the declared rival strategy and legal distinct staffing")
   — pre-existing, `RETAINED-SAME` per `1321-I-failures.json`, confirmed by 1320-C's own "Unresolved
   items" #4 as never masked by Save42 and unrelated to `rivalWinner208()`'s own logic (only the
   sibling `futureSave()` function in the same helper file was ever touched by that sweep). Not in
   the assigned 57-row `cluster_1302` list for C6/C7/C20. Not edited; still failing after this task,
   same as before it — a real, pre-existing, out-of-scope defect the parent already has on record.

## Not run (explicitly reserved to the parent per the task contract)

The full core suite. Only the seven touched files plus the six other `_v14Contract.ts` consumers were
run, per the task's own Method section ("vitest on the touched files only… Run the three tsc projects
… at the end").

## Deliverables

- `E/1324-stage/1324-retained-r1.patch` — cumulative diff against `4ea90ac4`, 7 files, 154
  insertions / 28 deletions. Verified as above (`read-tree 4ea90ac4` exit 0, `apply --check --cached`
  exit 0).
- `E/1324-stage/1324-retained-r1-classification.json` — 28 rows (`file, line, old_text, new_text,
  cluster, cause`): 27 real edits + 1 row documenting the Rule-4 leaf left intentionally unchanged.
- This file.

## Cleanup

Scratch tree at `/private/tmp/claude-501/.../scratchpad/1324-work/tree` removed at the end of this
task per the method's disk-limit instruction, after the patch and classification JSON were copied
into the repository's evidence directory and independently re-verified against the assigned base
commit from the real repository root.
