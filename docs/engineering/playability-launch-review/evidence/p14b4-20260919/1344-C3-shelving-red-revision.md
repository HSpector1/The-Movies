# 1344-C3: revision of the rival-shelving RED suite, correcting the seven defects named in 1344-E

Role: independent test engineer (test-author). Same scratch tree as 1344-C/1344-C2
(`/private/tmp/claude-501/.../scratchpad/1344-work/tree`, edited in place, never re-created), BASE
unchanged: `c214094478f47c3e861d757ef568a124cbf3bd71`. Authority for this revision:
[1344-E](1344-E-shelving-production-handback.md) (production handback, PARTIAL 44/51, names seven
test defects with probe evidence) and [1344-F3](1344-F3-parent-rulings-on-1344-E.md) (parent's
independent verification and rulings on all seven corrections, plus the new genuine week-93 input —
**this governs**). 1344-A/1344-F/1344-D/1344-F2 still govern the 44 leaves this revision does not
touch.

## Base / HEAD check

- BASE (unchanged since 1344-C): `c214094478f47c3e861d757ef568a124cbf3bd71`.
- Real repo HEAD at the coordinator's assignment: `78af275408027cd2e110aa59659602eb0427841a`.
- Real repo HEAD at the end of this revision: `abfcd58058526005b43f5f72c3d589e153fbfa64` (the branch
  moved twice more under parallel, unrelated work — P15B/P16 records and an in-progress
  relationship-slice production — while this revision was in progress; none of it touches this
  task's files).
- `git diff --stat <ref> abfcd58058526005b43f5f72c3d589e153fbfa64 -- src/ bridge/ ui/` is empty for
  every ref from `78af2754` onward, and for BASE itself shows exactly four unrelated files:
  `src/core/powerRanking.ts`, `src/core/sharedMarket.ts`, `src/core/tuning.ts` (P15A/P15B additions),
  `ui/src/lot/StudioLotIdentityReview.test.tsx`. None of these are hollywood/shelving code, so the
  scratch tree (still built from BASE, src/ untouched) remains representative of "unchanged HEAD"
  for this task's RED verification throughout. `git status --short` on the real repo at the end shows
  only this revision's own new evidence files (see below); no production writes.
- The new fixture directory `tests/fixtures/p14/genuine-v42-pre-shelving-week93/` was already
  visible through the scratch tree's existing `tests/fixtures` symlink (a real symlink to the real
  repo's `tests/fixtures`, established in 1344-C) — no re-link was needed.

## The seven corrections (1344-E / 1344-F3), applied additively to the 51 leaves from 1344-C2

All seven are inside `tests/p14d1-rival-shelving.test.ts`; the 44 leaves 1344-E did not name are
unchanged. Every corrected leaf's assertion strength is kept or increased, never weakened.

1. **Stalled route** (`shelving-stalled-route`, formerly `:347`): "exactly one receipt this week for
   this screenplay" filtered by `scriptProjectId` alone. `canonicalScriptProjectId(ordinal)` repeats
   across rival studios, so another studio's same-ordinal receipt the same week could mask a real
   over-count at r01. Now filters by `studioId === receipt.studioId && scriptProjectId === receipt.scriptProjectId`.

2. and 3. **Staffing-blocked weeks** (`staffingBlocked...` and the mixed-sequence leaf, formerly
   `:410`/`:479`): ending one actor's employment does not reproduce `staffingBlocked`, because
   `staff()` runs before `decide()` within one weekly pass (`hollywoodTick.ts` `advanceHollywoodWeek`)
   and re-hires into the vacant slot before `decide()` ever reads the roster. Both leaves now also
   drive r01's cash to the **pre-hire reserve + 1** (`rivalWeeklyOperatingCost(b, h, week) *
   b.policy.reserveWeeks`), which fails the re-hire's own affordability gate
   (`cash - signingBonus < reserveAfterOffer(terms)`, `hollywoodTick.ts` `staff()`, since hiring one
   more person can only raise, never lower, the weekly operating cost the reserve is priced from).
   Both leaves add a `vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage')` around the real `tick()`
   calls and assert **through the real tick** that no call is made for r01
   (`options.key.startsWith('${RIVAL}:package:')`) across the blocked weeks, in addition to the
   existing rejection-count-holds-flat assertion. The mixed-sequence leaf restores both employment
   and cash before its economic-rejection phase (previously only employment), so that phase still
   evaluates at real, effectively-unlimited cash as its own premise requires. Also independently
   tightened, same cause as correction 1 (not one of the seven named, but the identical defect in
   the same file): the post-restoration shelved-receipt filter (originally `scriptProjectId` alone)
   now also filters by `studioId === RIVAL`.

4. **Viable control** (`shelving-viable-control`, first sub-leaf, formerly `:519`, 1344-F Amendment
   2): compared genesis-to-week-100 against the old genuine week-100 fixture. On this route the
   candidate's own first shelving is the 13th evaluated economic rejection at week 93 (r01's
   `script-0006`), with the `screenplayShelved` receipt appearing in the tick after — week 100 was
   already past that boundary, so the old comparison was unsound by construction, not merely
   unlucky. Now:
   - Compares genesis-to-week-93 against the **new genuine week-93 input** minted at the last
     Save42 writer (record 1344-P2, execution HEAD `e62c944fef2966ea2ba4b5d28594dd061bc33a94`),
     loaded via new fixture-loader code in `tests/p14d1-rival-shelving-fixtures.ts`
     (`manifestPin93()`, `week93Raw()`, `genuineV42Week93()`) with byte/sha256 pins **independently
     recomputed** against the checked-in files (`shasum -a 256`, `node -e zlib.gunzipSync(...)`),
     not copied from the fixture's own provenance JSON: MANIFEST.json 625 bytes /
     `da69c240bd6b689c6d2d11d5747ff1768095b241e9356f2d50881fa4843aed4a`; gzip 109886 bytes /
     `14c41c2cf3a570e59bdb5ef97da04576499528039f76389904a057ea5ae4048e`; decoded 985487 bytes /
     `c13fb767b369c5c0e7c4d2e80260af9846f0bc5a850f9342036a3e46697a0e86` — these match the fixture's
     own MANIFEST.json and 1344-F3's stated gzip prefix, confirmed independently rather than trusted.
   - Asserts its own premise **from the candidate's own receipts**, never a hard-coded week: zero
     `screenplayShelved` receipts have accumulated through the week-93 state (`shelvedReceiptsOf`
     directly, plus the receipts-equality check against the genuine input), then at least one
     appears within a bounded 16-tick search continuing forward from that exact compared state.
   - **Self-found defect, corrected within this same leaf during this revision's own GREEN dry run**
     (not one of the seven named corrections — see "Additional finding" below): the strict `toEqual`
     comparison of the two (stripped) states failed on the throwaway GREEN copy for a reason
     unrelated to the shelving law. Root-caused, then fixed by switching to a canonical
     (recursively key-sorted) JSON-string comparison — see below for the full finding and why this
     is a test-fidelity correction, not a loosened assertion.
   - Per 1344-F3 ("keep test 3's second case as reviewed"), the leaf's second sub-leaf (the 5-week
     clean-greenlight window, from 1344-C2) is untouched.

5. **Promise guard** (`shelving-promise-guard`, formerly `:738`/`:746`): three shelved-receipt checks
   were unfiltered or filtered by `scriptProjectId` alone. Other screenplays (r01's other one, or
   another rival's) can lawfully shelve the same week, which could break the two "held, no receipt"
   checks or falsely satisfy the final "exactly one receipt" check. All three now filter by
   `studioId === RIVAL_R01 && scriptProjectId === scriptProjectId` (the specific named screenplay).

6. **Opportunity paths** (`shelving-feasibility-readers`, second leaf, formerly `:830`): the leaf
   named ordinal 6 as `shelvedProjectId` without ever calling the file's own `markShelved` helper, so
   it quoted `promiseFeasibility` against an unmodified, still-active/ready project — a weak RED that
   happened to fail for a plausible-looking but wrong reason. Now calls
   `markShelved(state, RIVAL_R01, 6, week, week + 26)` first (the file's existing helper, which
   builds a validator-lawful shelved state per 1344-D2 §5), asserts the route premise that ordinal 6
   actually left `activeScriptOrdinals`, and only then quotes `promiseFeasibility`. At RED this is now
   a stronger, more meaningful failure: `promiseFeasibility` still returns `REASONABLY_ACHIEVABLE` on
   a project that genuinely is shelved, proving the *reader* (not merely the missing
   `screenplayShelving` field) has no shelving awareness yet — not just that the field is absent.

7. **Chart output** (`shelving-chart-output`, formerly `:856`): expected output was
   `development.projects[*].status === 'produced'` count alone. `hollywoodValidation.ts`'s own
   chart-output law for a non-player studio counts `h.films` where `provenance ===
   'authored-start/v1'` (unconditionally) **or** `provenance === 'simulation/v1'` with
   `result.releaseTick` before the observation week — the two authored canonical starting films
   (r01 always has exactly two, per the same validator's origin-week check) are never in
   `development.projects` at all, so the old expected value silently omitted them. Now derives
   `authoredCount` and `releasedSimulationCount` directly from `state.hollywood.films` by that same
   predicate, asserts the premise `authoredCount === 2`, and expects `releasedSimulationCount +
   authoredCount`.

## Additional finding made during this revision (not one of the seven named corrections)

While verifying correction 4 GREEN over the production step5 throwaway copy, the byte-for-byte state
comparison (`toEqual`) failed with the whole ~50-business/multi-thousand-line state tree printed, but
the diff contained **exactly six leaf-value pairs** across the entire structure (no other key, shape,
count, or value differed): `genreExpBefore` (×2) and `perceived` (×4), each `0` on the genuine side and
`-0` on the candidate side — a mathematically-null IEEE754 sign-of-zero difference, in audience-
perception/genre-experience fields wholly unrelated to screenplay shelving.

Root cause, confirmed by direct inspection: the genuine week-93 fixture's mint HEAD
(`e62c944fef2966ea2ba4b5d28594dd061bc33a94`) carries unrelated, out-of-scope commits —
`src/core/sharedMarket.ts` (401 lines), `src/core/powerRanking.ts` (178 lines), and 24 lines of
associated `tuning.ts` additions (P15A.1/P15A.2 laws, an entirely separate, parallel track) — none of
which exist in this candidate's BASE tree or are touched by the shelving production patch
(`git diff --stat` BASE→e62c944f shows exactly those four files, none hollywood-related). On this one
seed/route the only observable numeric effect of that unrelated code being present is the sign-of-zero
flip in six leaves; nothing else in the entire compared state differs.

Since `JSON.stringify(-0) === "0"` in this runtime (verified directly:
`node -e 'console.log(JSON.stringify(-0))'` prints `0`), a serialized/byte-level comparison already
normalizes exactly this null difference and nothing else — matching the contract's own literal wording
("must match byte for byte", 1344-F3) and this file's own established byte-identity convention for
genuine fixtures elsewhere (`exportSave` round-trip / string equality), rather than JS
`Object.is`-based `toEqual`, which is stricter than "byte for byte" in this one IEEE754 edge case. A
first attempt at a plain `JSON.stringify` comparison introduced a *second*, unrelated false failure
(the candidate and the migrated-genuine object insert keys in different orders — `state` is built by
spreading a freshly-ticked `GameState`, `genuineState` is rebuilt by `convertV42ToV43` — so raw
`JSON.stringify` text differed on key order alone, with no semantic content). The leaf now compares via
a small local canonical (recursively key-sorted, order-preserving-for-arrays) JSON serialization, which
removes both artifacts without hiding a real one: any actual value, kind, count, or shape difference
still fails the check exactly as `toEqual` would have.

This is judged a **test-fidelity correction** (the comparison method did not match the contract's own
"byte for byte" wording), not a loosened expectation and not a shelving-law defect — determination:
(a) the divergence is mathematically null and vanishes under any standard byte-level serialization,
(b) it is fully attributable to unrelated, out-of-scope P15A code baked into the fixture's mint commit,
not to the shelving production patch (which does not touch `sharedMarket.ts`/`powerRanking.ts`), and
(c) it is exhaustively narrow — six leaves, one flavor of difference, confirmed via `toEqual`'s own
diff printer before any fix was applied. Flagged here for the coordinator/parent's awareness as a
**cross-track observation, not a defect in this task**: a genuine-fixture mint HEAD that is meant to
serve as a "just the feature under test, nothing else" baseline ideally should not carry unrelated
in-flight commits from a parallel track, since it otherwise requires exactly this kind of forensic
narrowing to confirm a later byte-comparison failure is benign.

## Runs

**RED, scratch tree (BASE `c214094478f47c3e861d757ef568a124cbf3bd71`, src/ unchanged, representative
of real HEAD `78af2754`→`abfcd580` per the check above) — all three files:**
`npx vitest run tests/p14d1-rival-shelving.test.ts tests/p14d1-rival-shelving-save-v43.test.ts tests/p14d1-rival-shelving-natural.test.ts --reporter=verbose`
→ **46 failed | 5 passed (51)**, wall time 49.3s (`real 0m49.341s`). Full output:
[1344-X5-red-r3-run.txt](1344-X5-red-r3-run.txt).

Each of the seven corrected leaves re-confirmed failing on unchanged HEAD for the right reason:

| Leaf | RED failure |
|---|---|
| stalled-route | `route/RED premise: studio-aca408ec-r01 shelves within 16 weeks of week 130: expected null not to be null` (unaffected by the fix — not reached) |
| staffingBlocked | `TypeError: Cannot read properties of undefined (reading 'rejections')` (unaffected — fails at the same earlier warm-up read) |
| mixed sequence | same TypeError, same reason |
| viable control (week 93) | `TypeError: mods.convertV42ToV43 is not a function` (unaffected — fails before the comparison line) |
| promise guard | same TypeError as staffingBlocked, at its own 12-tick warm-up |
| opportunity paths | `AssertionError: expected 'REASONABLY_ACHIEVABLE' to be 'IMPOSSIBLE'` — now genuinely exercises the corrected construction (project is actually shelved first) and shows the *reader* has no shelving awareness, not just the missing field |
| chart output | `route/RED premise: a shelving occurred before the next chart week: expected false to be true` (unaffected — not reached) |

The 5 control-passing leaves are the same ones classified since 1344-C/1344-C2 (unaffected by this
revision): the three `shelving-retry` leaves not gated on a hand-built shelved entry, `shelving-
player-symmetry`, and the natural-route `determinism` leaf.

**GREEN, separate throwaway copy** (fresh `git archive` of BASE into a scratch dir, `node_modules`
and `tests/fixtures` symlinked to the real repo, production
[step5 patch](1344-stage/1344-shelving-production-step5.patch) applied to `src/` — sha256
`567ccec3cbb1290b7b3f4b136e075dd767af4c3037f670d2bf2b429d6cbb4ea0`, matching 1344-F3's citation —
then this revision's four test/fixture files copied in verbatim; the persistent scratch tree itself
was never modified with production code) — all three files:
`npx vitest run tests/p14d1-rival-shelving.test.ts tests/p14d1-rival-shelving-save-v43.test.ts tests/p14d1-rival-shelving-natural.test.ts --reporter=verbose`
→ **51 passed (51)**, wall time 61.2s (`real 0m1m1.168s`, second/final run; an intermediate run before
the canonical-JSON fix was 50/51 with the -0/key-order issue documented above). Full output:
[1344-X5-green-r3-over-step5.txt](1344-X5-green-r3-over-step5.txt). The throwaway copy is discarded;
no artifact from it is part of the tests-only patch below.

**Root type gate**, scratch tree, after all seven corrections and the additional finding's fix:
`npx tsc --noEmit -p tsconfig.json` → **exit 0**, 1m42.015s (`real 1m42.015s`). Zero errors.

**Scratch apply check (`GIT_INDEX_FILE`, never touches the real working tree):**
```
TMPIDX=$(mktemp ...)
GIT_INDEX_FILE="$TMPIDX" git read-tree c214094478f47c3e861d757ef568a124cbf3bd71
GIT_INDEX_FILE="$TMPIDX" git apply --check 1344-shelving-red-r3.patch   # OK
GIT_INDEX_FILE="$TMPIDX" git apply --cached 1344-shelving-red-r3.patch # OK
```
Confirmed against BASE from both `/tmp` and the staged evidence copy. `git status --short` on the
real repo afterward shows only this revision's four new evidence files (the patch, the classification
JSON, and the two run logs) plus other agents' unrelated untracked work; no production or test file in
the real working tree was modified.

## Deliverables

- [1344-stage/1344-shelving-red-r3.patch](1344-stage/1344-shelving-red-r3.patch) — full diff vs BASE
  (tests-only: `tests/p14d1-rival-shelving.test.ts`, `tests/p14d1-rival-shelving-fixtures.ts`,
  `tests/p14d1-rival-shelving-save-v43.test.ts`, `tests/p14d1-rival-shelving-natural.test.ts`), not
  incremental against r2. sha256 `5450bf08400f4de1bf683d5a1c994bc6445edf78607dbc91a219779cfcb9fe72`.
- [1344-stage/1344-shelving-red-r3-classification.json](1344-stage/1344-shelving-red-r3-classification.json)
  — 51 rows (same schema as r2), the 7 affected rows' `leaf`/`redReason`/`revision` updated to this
  revision, the other 44 rows carried forward unchanged and re-confirmed by the RED run above.
- This file.

## What this revision does not cover

- The 1344-D3 re-review of the r3 producer/fixture change, and any further Owner/parent ruling on the
  cross-track fixture-mint-HEAD observation above, are for the coordinator/parent, not this role.
- Native/runtime verification, UI, and anything outside these four test/fixture files remain out of
  scope, per the original 1344-A/1344-F charter.
