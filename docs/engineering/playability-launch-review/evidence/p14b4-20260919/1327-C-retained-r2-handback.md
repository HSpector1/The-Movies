# 1327-C — retained-defect repair R2 (clusters C15, C3, C12): handback

Role: independent test engineer. Repo `/Users/zacheryspector/The-Movies-headless-program`, branch
`wip/headless-program-20260916-ts`, assigned base commit `b96a973a03f1e62fb63197c07e7752355ef4a5bb`
(verified equal to `git rev-parse HEAD` at task start — no drift). Contract:
`E/1327-A-retained-defect-repair-r2-plan.md` (rules 1-7), reviewed ACCEPT in
`E/1327-B-r2-plan-and-producer-review.md`. Precedent for method/rules/handback form:
`E/1324-A-retained-defect-repair-r1-plan.md`, `E/1324-C-retained-r1-handback.md`.

Tests only; no production code, fixture payload, `tsconfig` or `vitest.config` change — verified by
`git diff --stat` below (6 files, all under `tests/`).

## Method actually used

Scratch tree built exactly per the task's Method section, at
`/private/tmp/claude-501/.../scratchpad/1327-work/tree`:
```
git archive b96a973a src bridge ui generated scripts package.json package-lock.json tsconfig.json \
  tsconfig.bridge.json tsconfig.src.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md \
  | tar -x -C <tree>
git archive b96a973a tests ':!tests/fixtures' | tar -x -C <tree>
ln -s <repo>/tests/fixtures <tree>/tests/fixtures   # read-only
ln -s <repo>/docs <tree>/docs                        # read-only
ln -s <repo>/node_modules <tree>/node_modules        # read-only
ln -s <repo>/art <tree>/art                          # read-only
ln -s <repo>/tools <tree>/tools                      # read-only (present but unused)
cd <tree> && git init -q && git add -A && git commit -q -m "1327-C scratch base at b96a973a"
```
Base commit in the scratch tree: `56bac70`. One tree only, all edits made there with the
`Edit`/`Read` tools; the real repository's `tests/` tree was never touched (confirmed at the end —
`git status --short` on the real repo shows only the new `E/1327-stage/` directory, untracked, no
modified tracked file). One `vitest` process at a time throughout. Tree removed at the end of this
task (Cleanup, below).

## Rows covered

`E/1325-I-failures.json` filtered to `cluster_1302` in `C15-frozen-validator-chain-historical-boundary`,
`C3-acceptedEvidence-helper-literal` (excluding the `bridge-p14c3-runtime` R8 timeout row, out of
scope per the plan and 1327-B's own confirmation), and `C12-generator-hash-pin-needs-remeasurement`:
**15 rows**, exactly matching the plan's table (C15 7, C3 6, C12 2). Filter re-run directly against
the committed JSON in this session (`python3` one-liner over `1325-I-failures.json`), not copied from
the plan text.

## Changes by cluster

### C15 (7 rows: 5 fixed, 2 left per Rule 6)

All five frozen-validator-chain leaves share the same measured shape: a reconstruction or forged
envelope built from a live engine state keeps a root/field added after the reconstruction function
was written, so a frozen historical validator refuses it before the leaf's own assertion runs. Fixed
with the guard-and-strip shape each file already uses for its sibling roots.

1. **`tests/p13b-r07-save-v25.test.ts`** (`asV25Envelope`, line 201) — added a guard-and-strip block
   for `firstTakeSubjects` (V40), matching the five existing blocks in the same function
   (`talentMarket`/`firstTakes`/`promises`/`relationships`/`talentProvenance`/`careerLifecycle`).
   Measured before: `validateSaveV12: state has unknown field "firstTakeSubjects"`. Fixes 2 target
   rows ("validates a reconstructed V25 envelope…", "migrateToV24…refuse a V25 save").
2. **`tests/facility-move-demolish.test.ts`** (`forgedV11`, line 864) — same guard-and-strip block,
   same shape as the sibling `firstTakes`/`promises` blocks immediately above. Measured before:
   `validateSaveV11: state has unknown field "firstTakeSubjects"`. Fixes 1 target row.
3. **`tests/p14c2s-scientist-retirement.test.ts`** (S10 "frozen public34/35/36 readers…", line 297) —
   measured in three sequential layers (each fix re-run to expose the next masked layer): (a)
   `sharedCompetitions` (relationship edge field, V42) — `validateSaveV31: state.relationships[0].
   sharedCompetitions is not a field of this record`; (b) after (a), `firstTakeSubjects` (root, V40)
   — `validateSaveV12: state has unknown field "firstTakeSubjects"`; (c) after (b), `termination`
   (a `RivalMoneyKind` dictionary key added V41 on every `business.account.periods[].movements`) —
   `Hollywood save: exact keys required: capacity,signing,payroll,…` (`src/core/hollywoodValidation.ts:27`).
   All three stripped unconditionally, matching this block's own established convention for
   `extensionUsed`/`extendedFromWeek`/`variant` (the block is an explicitly reader-only shape control,
   "No such object is played/exported", not a fidelity-preserving reconstruction) — `firstTakeSubjects`
   was measured non-empty (real first-take history) on this world but stripped under that same
   reader-only-control precedent rather than the empty-guard precedent used in files 1-2 above. Fixes
   1 target row; both the "control" (negative, must-not-throw) and "envelope" (positive, must-throw
   `/Scientist record/`) assertions inside the same `for (const version of [34,35,36])` loop now run
   for their stated reason.
4. **`tests/bridge-runtime-checkpoint.test.ts`** (line 431) — measured: expected
   `/canonical V38 save bytes exactly/`, received `"checkpoint.currentSaveJson: must preserve the
   canonical V42 save bytes exactly"`. Source: `bridge/runtime-checkpoint.ts:501`,
   `` `must preserve the canonical V${LIVE_SAVE_VERSION} save bytes exactly` `` — a version-aware
   message, and `LIVE_SAVE_VERSION` is now 42 (`src/core/save.ts:6553`). The refused-non-canonical-
   bytes premise still holds; only the version number in the validator's own message moved. Updated
   the regex literal to `/canonical V42 save bytes exactly/` with a comment citing the source line
   (S8 form per `1320-A-save42-pin-sweep-plan.md`: "the expected message names what that validator
   says for the tampered field, measured, cited by source line"). Fixes 1 target row.
5. **`tests/helpers/p14c2rm-fixtures.ts:302` (Rule 6 — NOT EDITED).** Both remaining C15 leaves in
   `tests/bridge-p14c2rm-retirement.test.ts` (lines 334, 347) call the shared `frozenTies()` fixture,
   which fails at `tests/helpers/p14c2rm-fixtures.ts:302`:
   `expect(activeContract(state, f.directorId), 'freeze premise: counterpart stays lawfully
   disclosed').toMatchObject({endWeekExclusive: 416})` — received `undefined`, not a frozen-validator
   "unknown field" error. Measured with a disposable, non-committed probe (built outside `tests/`,
   deleted before handback; never staged) that replicates the fixture's own steps exactly
   (`submitProposal` at week 196, `termWeeks: 208`, `advanceTo(state, 208)`): the player studio's own
   proposal is genuinely `declined` at the decision week, with receipt reasons including
   `"Your Studio holds a record this person distrusts."` (`src/core/talentMarket.ts:1149`
   `issuerDistrusted`, gated by `trustDescriptor(state, talentId, issuerStudioId, week).label ===
   'Distrusted'` at `:1193`). This is a real natural-chain trust-mechanic consequence of the fixture's
   own earlier actions (two scheduled-then-cancelled takes with this same director), not a moved
   frozen-validator boundary. Per plan Rule 6, left untouched.

### C3 (6 rows: 3 fixed via the one authorized line, 3 reveal a separate, previously-masked defect — Rule 3, not edited)

**`tests/helpers/p14c3-canonical-rival-fixtures.ts:187`** — the single live-export assertion
(`expect(sha(exportSave(makeSave(state)))).toBe(CANONICAL_INITIAL_SHA)`) replaced with the Save38
down-projection (`convertV42ToV41 → convertV41ToV40 → convertV40ToV39 → convertV39ToV38`, all real
`src/core/save.ts` converters, never literals) compared with the unchanged `CANONICAL_INITIAL_SHA`
constant, plus a new assertion that the live envelope's `saveVersion` is `LIVE_SAVE_VERSION`.
`CANONICAL_INITIAL_SHA` kept unchanged per Rule 4. Re-measured directly in my own tree (not copied
from the parent's `1327-measure/c3-down-projection.json`, though it matches exactly): live v42 export
sha `a7d0034f7a44dc3163e0b85127531d6138b013dec077bafbc703091208e00514`, v38 down-projection export sha
`2f9ec0fa289a28a188428f9caa59ba969c50f6bcf0c7f93819bd0d17541c5353` (equals the constant). Consumer
sweep: `grep -rl "p14c3-canonical-rival-fixtures" tests/` finds exactly one consumer,
`tests/p14c3-canonical-rival-history.test.ts`, which was run (below).

**Result: 3 of 6 target rows now pass (K1, K2, K3). The other 3 (K4, L1, L2) do NOT pass** — they
were previously masked entirely by the shared `canonicalInitial()` memoization cache (a thrown error
inside `memo()` is cached and re-thrown for every subsequent call, so all 6 rows shared the identical
primary before this fix). Once unmasked, K4/L1/L2 reach two SEPARATE, previously-invisible defects
that this task's authorization (one named line in the helper file) does not cover:

- **K4** (`tests/p14c3-canonical-rival-history.test.ts:233`, NOT EDITED): `const control =
  makeSave(canonicalChosen().loaded); expect(validateSaveV38(control)).toBe(control)`. `makeSave`
  always returns the live `SaveFileV42` (`saveVersion: 42`); calling the version-frozen
  `validateSaveV38` on it throws `validateSaveV38: expected version 38` (`src/core/save.ts:10385`).
  This is the SAME "call site never updated as the live version moved past V38" class of bug as C15's
  `bridge-runtime-checkpoint.test.ts:431` above — but it lives in the TEST BODY of a different file
  (`tests/p14c3-canonical-rival-history.test.ts`), not inside the one line this task's C3 section
  authorizes (`tests/helpers/p14c3-canonical-rival-fixtures.ts:187` only).
- **L1/L2** (`tests/p14c3-canonical-rival-history.test.ts:259`/`:284`, NOT EDITED): both depend on
  `canonicalHired()`, which throws at `tests/helpers/p14c3-canonical-rival-fixtures.ts:290`
  (`refuseTerminalWithoutWork`): `AssertionError: L passive work premise ended without an obligation:
  {"personId":"person-studio-8c9ee794-r01-4",...,"cause":"noCatalogue",...}`. The canonical098 seed's
  simulated trajectory (run out to up to 156 `step('L', …)` calls) now reaches an industry-retirement
  finality with cause `noCatalogue` (`src/core/professionTransitions.ts:167`,
  `src/core/professionHistory.ts:225-270` — a real career-lifecycle/profession-transition-catalogue
  mechanic) before any Writer-hire vacancy ever appears for the canonical subject. This is a genuine
  natural-chain simulation-trajectory drift, structurally the same class of cause as the C15 Rule-6
  carve-out, not a save-format or frozen-validator issue.

Per plan Rule 3 ("If a leaf's stated premise cannot be reached lawfully, the author stops on that
leaf and reports the measured facts"), these three leaves are reported here, with receipt facts and
exact source lines, and left unedited rather than expanding beyond the one authorized helper line.

### C12 (2 rows, both fixed)

**`tests/bridge-contract-generator.test.ts:559-572`** (F10 leaf) — `projectionVersion` updated 54→56;
schema identity literal replaced with the checked-in
`generated/unity/project-studio-bridge.contract-manifest.json`'s own `schemaId` field, read
independently (`grep` of the tracked manifest file, not computed by the generator or the test):
`sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1`. Provenance comment extended
to name `1328-p56-declaration-measurement.ts` as the recorded producer, run on `b96a973a`'s parent
source `1a9fd5f0` (`git rev-parse b96a973a^` = `1a9fd5f06dcea222dfc8557f17352bc851b8e6c7`), citing the
prior `1196` measurement — matching the house form already used by every entry in the same comment
block.

**`tests/bridge-contract-generator.test.ts:715-725`** ("pins exact positive output identities" leaf) —
`F10_CURRENT_QUOTE_UNIONS`/`F11_CURRENT_COMMAND_UNION` updated to
`a0f316eb5b4be929f82102246b415414e0720000e6dd4a62b22980192abaf8aa`, taken from the RECORDED PRODUCER
output only (`E/1328-p56-declaration-measurement.txt`/`.json`,
`identities.F10_CURRENT_QUOTE_UNIONS.sha256` = `identities.F11_CURRENT_COMMAND_UNION.sha256`, 418871
bytes, exit 0, `fixedSource: true`) — never read off the 1325-I failure message (which happened to
show the same value as its "received", but the pin here is sourced from the recorded producer file
independently). `F12` and the other five fixed pins (F01-F04, F09) are byte-identical to 1193/1196 and
left unchanged, per the plan. Provenance comment block extended with the matching R2/projection56/1328
entry.

## Commands actually run, with actual outputs

Reproduction (baseline, before each file's own edit — all run from the scratch tree):
```
npx vitest run tests/p13b-r07-save-v25.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 2 failed | 6 passed (8)
  → both failures: validateSaveV12: state has unknown field "firstTakeSubjects"
    (frame tests/p13b-r07-save-v25.test.ts:241:30 and :251:25)

npx vitest run tests/facility-move-demolish.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 29 passed (30)
  → expected [Function] to throw /SaveFileV13 facility demolition authority.../
    but got 'validateSaveV11: state has unknown field "firstTakeSubjects"'
    (frame tests/facility-move-demolish.test.ts:870:43)

npx vitest run tests/p14c2s-scientist-retirement.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 14 passed (15)
  → V34 whole-envelope shape control: expected not to throw, received
    validateSaveV34: ... validateSaveV31: state.relationships[0].sharedCompetitions is not a field
    of this record   (frame tests/p14c2s-scientist-retirement.test.ts:308:105)
  → (after the sharedCompetitions strip alone, re-run) same assertion, now:
    ...validateSaveV12: state has unknown field "firstTakeSubjects"
  → (after + firstTakeSubjects strip, re-run) same assertion, now:
    Hollywood save: exact keys required: capacity,signing,payroll,overhead,facilityOpex,development,
    production,marketing,studioRevenue,technologyAdoption,researchSpend,researchCapacity,
    technologyRestoration,technologyRefund

npx vitest run tests/bridge-runtime-checkpoint.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 1 failed | 70 passed (71)
  → expected [Function] to throw /canonical V38 save bytes exactly/ but got
    'checkpoint.currentSaveJson: must preserve the canonical V42 save bytes exactly'
    (frame tests/bridge-runtime-checkpoint.test.ts:431:9)

npx vitest run tests/p14c3-canonical-rival-history.test.ts --reporter=verbose  (original file, restored
  temporarily from the scratch tree's own base commit for this one check, then the fix was restored —
  see "Baseline double-check" below)
  → Test Files 1 failed (1) / Tests 6 failed (6)
  → all six: AssertionError: expected 'a7d0034f7a44dc3163e0b85127531d6138b01...' to be
    '2f9ec0fa289a28a188428f9caa59ba969c50f...'

npx vitest run tests/bridge-contract-generator.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 2 failed | 29 passed (31)
  → F10 leaf: expected generated output to contain '// Schema identity: sha256:9c5bba3fcc...'
    but current generator output uses a different schema identity (frame :565)
  → pins leaf: F10_CURRENT_QUOTE_UNIONS: expected 'a0f316eb5b4be929f82102246b415414e0720...' to be
    'a9708ee36cb26c7a5fd48662c0bf705c364a4...' (frame :725)
```

Disposable probe for the C15 Rule-6 receipt facts (built outside `tests/`, never staged, deleted
before handback):
```
it('probe', ...)  // replicates frozenTies()'s own steps up to the failing assertion
  → case for director after submit: { status: 'discovered', decisionWeek: 208, openedWeek: 196 }
  → contracts for director at week 208: []
  → case for director at 208: { status: 'declined', decisionWeek: 208, openedWeek: 196 }
  → activeContract at 208: undefined
  → receipts tail: [...,{"kind":"declined","week":208,...,"reasons":[
      "Bellwether Pictures had no seat open for this person's role at the decision week.",
      "Rose Lantern Films had no seat open for this person's role at the decision week.",
      "Night Orchard Productions had no seat open for this person's role at the decision week.",
      "Silver Current Pictures had no seat open for this person's role at the decision week.",
      "Your Studio holds a record this person distrusts."],...}]
```

After every edit landed, per-file re-runs (all green except the documented exceptions):
```
npx vitest run tests/p13b-r07-save-v25.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 8 passed (8)

npx vitest run tests/facility-move-demolish.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 30 passed (30)

npx vitest run tests/p14c2s-scientist-retirement.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 15 passed (15)

npx vitest run tests/bridge-runtime-checkpoint.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 71 passed (71)

npx vitest run tests/p14c3-canonical-rival-history.test.ts --reporter=verbose
  → Test Files 1 failed (1) / Tests 3 failed | 3 passed (6)
  → K1/K2/K3 pass; K4/L1/L2 fail for the separate, previously-masked causes documented above
    (K4: validateSaveV38: expected version 38 — frame :233; L1/L2: "L passive work premise ended
    without an obligation" — frame tests/helpers/p14c3-canonical-rival-fixtures.ts:290, via
    tests/p14c3-canonical-rival-history.test.ts:260 and :284)

npx vitest run tests/bridge-contract-generator.test.ts --reporter=verbose
  → Test Files 1 passed (1) / Tests 31 passed (31)
```

**Baseline double-check (C3, for rigor matching the other clusters' baseline runs).** After
confirming the fix, I temporarily restored the ORIGINAL (pre-edit) `tests/helpers/
p14c3-canonical-rival-fixtures.ts` from the scratch tree's own base commit (`git show HEAD:...`,
where `HEAD` is the scratch tree's OWN base commit `56bac70`, matching the real repo's `b96a973a`),
re-ran the consumer test file, confirmed all 6 rows fail with the exact primary recorded in
`1325-I-failures.json` (`expected 'a7d0034f...' to be '2f9ec0fa...'`), then restored the fixed file
from a saved copy and re-ran to confirm the fix reproduces identically (3 passed | 3 failed, same as
above). `git -C <tree> diff --stat` after restoration matched the pre-restoration diff exactly
(`1 file changed, 14 insertions(+), 2 deletions(-)`), and a byte-for-byte `diff` of a freshly
regenerated `git diff` patch against the already-staged patch file showed no difference (exit 0).

Consolidated single-process run of all seven touched/consumer files together (one vitest process,
confirming no cross-file interference):
```
npx vitest run tests/p13b-r07-save-v25.test.ts tests/facility-move-demolish.test.ts \
  tests/p14c2s-scientist-retirement.test.ts tests/bridge-runtime-checkpoint.test.ts \
  tests/helpers/p14c3-canonical-rival-fixtures.ts tests/p14c3-canonical-rival-history.test.ts \
  tests/bridge-contract-generator.test.ts --reporter=verbose
  → Test Files 1 failed | 5 passed (6)   [the helper file carries no `it()` blocks of its own]
  → Tests 3 failed | 158 passed (161)
  → 8+30+15+71+31+3 = 158 passed; the 3 failures are exactly K4/L1/L2, documented above
```

Consumer sweep (Method: "every consumer of any touched helper"):
```
grep -rl "p14c3-canonical-rival-fixtures" tests/   → tests/p14c3-canonical-rival-history.test.ts (only; run above)
grep -rn "p13b-r07-save-v25|facility-move-demolish|p14c2s-scientist-retirement|bridge-runtime-checkpoint|bridge-contract-generator" tests/*.ts
  → matches found only in comment text or unrelated string-literal collisions (verified by reading
    each match: e.g. tests/p13b-s6-save-v26.test.ts:34 is a prose comment naming the file, not an
    import; tests/bridge-p14b5-relationships.test.ts:353 matches the runtime-checkpoint FORMAT STRING
    'project-studio-bridge-runtime-checkpoint', not the test file). No actual import-based consumer
    found for these five files; none touched or consumed elsewhere.
```

Type gates (from the scratch tree root, after the last edit):
```
npx tsc -p tsconfig.json --noEmit        → exit 0, empty output
npx tsc -p tsconfig.bridge.json --noEmit → exit 0, empty output
cd ui && npx tsc -p tsconfig.json --noEmit → exit 0, empty output
```

Patch verification (from the real repository root, against the assigned base commit
`b96a973a03f1e62fb63197c07e7752355ef4a5bb`, via a temporary index — the real index/worktree were
never touched):
```
TMPIDX=$(mktemp)
git read-tree b96a973a03f1e62fb63197c07e7752355ef4a5bb   → exit 0
git apply --check --cached docs/.../1327-stage/1327-retained-r2.patch → exit 0
git status --short   → only the new, untracked E/1327-stage/ directory; no modified tracked file
```
Run twice (once before the C3 baseline double-check, once after restoring the fix) with identical
results both times.

## Per-leaf pass reason (Rule 7)

- **C15, `p13b-r07-save-v25.test.ts` (2 rows)**: the reconstructed V25 envelope no longer carries a
  live `firstTakeSubjects` root, so `validateSaveV25`'s frozen chain accepts it as a genuine V25
  envelope and the leaves' own stated assertions (nonempty-workflow `setup: null` lift; downgrade
  refusal to V24-V20) run for the first time.
- **C15, `facility-move-demolish.test.ts` (1 row)**: `forgedV11` is now a genuine, exact-keys-legal
  V11 envelope, so `validateSave`'s exact-keys walk reaches the actual demolition-refund-row check
  the leaf is titled for, instead of stopping earlier on the unrelated `firstTakeSubjects`
  unknown-field refusal — confirmed by the green re-run that the leaf's own throw assertion
  (`/SaveFileV13 facility demolition authority|facilityDemolitionRefund/`) is what now fires.
- **C15, `p14c2s-scientist-retirement.test.ts` (1 row)**: both the negative control (`control`, must
  not throw) and positive control (`envelope`, must throw `/Scientist record/`) now reach the ACTUAL
  Scientist-law boundary check inside `importSave`'s V34/35/36 readers, instead of failing earlier on
  an unrelated shape mismatch (`sharedCompetitions`/`firstTakeSubjects`/`termination`) that these
  three frozen versions never had.
- **C15, `bridge-runtime-checkpoint.test.ts` (1 row)**: `createBridgeRuntimeCheckpoint` still refuses
  non-canonical `currentSaveJson` bytes for the SAME reason as before (byte-exactness against the
  live canonical export) — the assertion now matches the guard's actual, version-aware message
  instead of a stale V38 literal.
- **C15, `bridge-p14c2rm-retirement.test.ts` (2 rows, UNCHANGED, still failing)**: not fixed. Rule 6
  applies; reported with receipt facts above.
- **C3, `p14c3-canonical-rival-history.test.ts` K1/K2/K3 (3 rows)**: `canonicalInitial()` no longer
  throws inside the shared `memo()` cache (the down-projection now matches the constant), so every
  downstream leaf that depends on it reaches its own real assertions — K1's independent campaign/
  evidence counting, K2's exact write-set/authority check, K3's exact-byte reload-preservation check —
  which is what the green re-run confirms each now exercises.
- **C3, K4/L1/L2 (3 rows, UNCHANGED, still failing)**: not fixed — a separate, previously-masked
  defect each; reported with receipt facts and exact source lines above (Rule 3).
- **C12, `bridge-contract-generator.test.ts` (2 rows)**: F10's leaf now compares the generator's
  actual current output (projection 56) against the CURRENT schema identity, which is what "without
  changing schema identity" is actually testing; the pins leaf's `sha256(first) === expectedHash`
  check now runs against the recorded-producer pin instead of the stale projection-54 one, and the
  file's own `matchesPrior === false` / double-render-determinism assertions (untouched, already
  correct) continue to hold.

## Leaves left, and why

1. `tests/bridge-p14c2rm-retirement.test.ts` "natural retired tiers stay fixed across real drift…"
   (line 334) and "SYNTHETIC imported newer edge withholds unreconstructible retirement tier…"
   (line 347) — Rule 6, natural-chain cause measured and reported above. Not edited.
2. `tests/p14c3-canonical-rival-history.test.ts` K4 "refuses separate malformed canonical title,
   credit, entry cause and missing profession authority" (line 233) — Rule 3, separate stale-V38-call
   defect in the TEST BODY, outside the one authorized helper-file line. Not edited.
3. `tests/p14c3-canonical-rival-history.test.ts` L1 "observes an actual passive non-player Writer
   hire…" (line 259) and L2 "completes real rival screenplay review, production and released Writer
   credit…" (line 284) — Rule 3, a shared natural-chain simulation-trajectory drift in
   `canonicalHired()`, outside the one authorized helper-file line. Not edited.
4. `tests/bridge-p14c3-runtime.test.ts` R8 (5s timeout) — excluded from this task's 15-row scope by
   the plan itself and confirmed by 1327-B's own review (C1 time-budget family, not a SHA/assertion
   mismatch). Not evaluated further here.

## Deliverables

- `E/1327-stage/1327-retained-r2.patch` — cumulative diff against `b96a973a03f1e62fb63197c07e7752355ef4a5bb`,
  6 files, 65 insertions / 11 deletions. Verified twice as above (`read-tree` exit 0, `apply --check
  --cached` exit 0 both times, byte-identical patch content confirmed across a full baseline
  double-check round-trip). sha256:
  `c9a6d4213cead893e72af2d5c9cc4fb670f73efce1f3243faeb99d669c9aec30`
- `E/1327-stage/1327-retained-r2-classification.json` — 11 rows (`file, line, old_text, new_text,
  cluster, cause`, plus `target_rows_fixed` naming the exact leaf identities each edit closes): 8 real
  edit rows + 3 documented no-edit rows (1 for the two C15 Rule-6 leaves sharing one cause, 2 for the
  three C3 Rule-3 leaves — K4 has its own row; L1/L2 share one row/cause via `canonicalHired()`).
  sha256: `03f8042c110cf94884b518589c06f32d8d8f63aed4ed5c4265a591c56a283255`
- This file.

## Cleanup

Scratch tree at `/private/tmp/claude-501/.../scratchpad/1327-work/tree` (and its sibling files under
`.../scratchpad/1327-work/`) removed at the end of this task, after the patch and classification JSON
were copied into the repository's evidence directory and independently re-verified against the
assigned base commit from the real repository root (confirmed above, `ls` of the scratch directory no
longer shows `1327-work`). The real repository's `tests/`, `src/`, `ui/` and config files were never
modified — the only change to the real repository tree is the new, untracked
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1327-stage/` directory and this
handback file, per the task's writable-path grant. No commit was made; the parent is the only
committer.
