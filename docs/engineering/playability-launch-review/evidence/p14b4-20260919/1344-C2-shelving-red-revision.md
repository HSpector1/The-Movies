# 1344-C2: revision of the rival-shelving RED suite, addressing 1344-D's two blocking defects

Role: independent test engineer (test-author). Same scratch tree as 1344-C
(`/private/tmp/claude-501/.../scratchpad/1344-work/tree`, edited in place, never re-created).
Authority for this revision: [1344-D](1344-D-shelving-red-review.md) (REFINE, two blocking
defects, several non-blocking notes) and [1344-F2](1344-F2-parent-response-to-1344-D.md) (parent
adoption of both blocking items plus three non-blocking notes). 1344-A/1344-F still govern the 43
leaves from 1344-C, which stay as they were except where 1344-F2 explicitly authorized a change.

## Base / HEAD check

- BASE (unchanged since 1344-C): `c214094478f47c3e861d757ef568a124cbf3bd71`.
- Real repo HEAD at the start of this revision: `3381f6e3bdf3a75947e327e2d21779a1286868e6`.
- Real repo HEAD at the end of this revision: `e8caeb9009553f67be3a239277820d82082f6151`.
- `git diff --name-only c214094478 e8caeb9009 -- src/ bridge/ ui/ tests/` returns exactly one path,
  unchanged from 1344-C's own check: `ui/src/lot/StudioLotIdentityReview.test.tsx`, still
  attributable to the unrelated, already-recorded task 1349-E. Nothing under `src/` changed, matching
  the coordinator's own statement. I did not touch the real working tree except to write the four
  handback files listed below.

## What changed (additive only; the 43 leaves from 1344-C are preserved)

**1344-D Blocking 1 — `searchIndustryPackages` counts contract, tested directly** (`tests/p14d1-rival-shelving.test.ts`, new `describe('searchIndustryPackages counts contract (1344-D Blocking 1)')`, 2 new leaves):
- Uses the spy technique 1344-D pointed at (`tests/helpers/p14p3-fixtures.ts`'s `rivalStep`
  `packageSpy`/`originalPackage`, `:833,:887-896`): `vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage')`
  around a real `tick()` over the genuine week-130 fixture, filtering captured calls to
  `options.lockScreenplay===true && options.key.startsWith('studio-aca408ec-r01:package:')` — the
  real `(input, policy, options)` triple `decide()` builds, no reimplementation of the private
  `inputsFor()`.
- Leaf 1 asserts, on the first captured call (ordinal 6, evaluated first): `searchIndustryPackages(...).choice`
  deep-equals `chooseIndustryPackage(...)`; `affordable + unaffordable` equals an **independently
  derived** candidate count (1 locked shape x 6 generated permutations of the 3 cast slots x
  `TUNING.HOLLYWOOD_NEGATIVE_CHOICES.length` x `marketingMenuFromCapacity(marketingCapacityForInputs(call.input, true)).length`
  — never the literal `54`); `viable <= affordable`; `(choice === null) === (viable === 0)`.
- Leaf 2 is the decide-level partial-cashBlocked case 1344-F2 required: cash strictly between the
  real cheapest and dearest of the 54 candidates. `candidateCosts()` replicates
  `chooseIndustryPackage`'s own cost formula (`perceivedPlanningInputs` -> the same 6 generated
  billings -> `HOLLYWOOD_NEGATIVE_CHOICES` -> `marketingMenuFromCapacity`) over the REAL captured
  `(input, policy)`, and the test shows the derivation: `minCost`/`maxCost` from the 54 real costs,
  `cashBetween = floor((min+max)/2)`, and `cash = reserve + cashBetween` using the real
  `rivalWeeklyOperatingCost(...)*reserveWeeks` reserve formula. "No affordable candidate is viable"
  is established **logically**, not by replicating the forecast/score formula: `call.result===null`
  (read directly off `chooseIndustryPackage`'s own real return value) proves all 54 candidates are
  non-viable at real/unlimited cash, so any smaller cash's affordable subset — of those same 54 — is
  non-viable too.

**1344-D Blocking 2 — `rivalPromiseProjectCandidates`, tested directly** (1344-X2 parent API
decision; `tests/p14d1-rival-shelving.test.ts`, new `describe('rivalPromiseProjectCandidates ...')`,
2 new leaves, plus one new API-existence leaf):
- `talentMarket.rivalPromiseProjectCandidates(state, studioId): ScriptProject[]` — production's new
  export (issuer's non-produced, non-shelved screenplays, sorted by id, first two);
  `authorRivalPromise` uses it. Covers §6 item 7(c) without needing the private
  negotiation-trigger path 1344-C's own exploration showed was unreliable (0 rival
  `SPECIFIC_PROJECT` promises in 80 genesis weeks; 0 in the week 130-230 r01 renewal window — both
  facts restated, not silently dropped, in the updated file-1 comment header for §7).
- Leaf 1: mark ordinal 6 shelved (the file's existing `markShelved` construction, now relocated to
  file scope — see below) and confirm the shelved screenplay's id is absent from the result.
- Leaf 2: with nothing shelved, the result equals the first two non-produced screenplays by id
  (route premise `['script-0006','script-0011']` asserted explicitly first).
- `markShelved` (previously a closure local to the `shelving-retry` describe block) is relocated to
  file scope so both `shelving-retry`'s five existing leaves and the two new
  `rivalPromiseProjectCandidates` leaves share one definition. **Non-behavioral**: same body, same
  call sites, verified by re-running all five `shelving-retry` leaves (below) with identical results
  to 1344-C's own run.

**1344-F2 non-blocking note 1 — test 3's second case asserts its own premise** (`shelving-viable-control`, existing leaf, revised):
The naive fix (assert "no studio had a ready screenplay persist un-greenlit" across the ORIGINAL
20-week window) was written first and immediately caught a real problem: it failed with
`stuckReadyByStudio.get(...) === true` even for the first-greenlighting studio. A direct trace
(reproduced below) showed why — the 20-week window itself was unsound for this claim, not the
check. **Fix**: narrow the window to 5 weeks (matching 1344-D's own non-blocking suggestion, "narrow
the window to right after the observed greenlight") and search across every studio that both
greenlit and stayed clean in that shorter window, not just the first to greenlight. See "Trace and
derivation" below for the full reasoning and the reproducible trace data.

**1344-F2 non-blocking note 2 — three new Save43 validator leaves** (`tests/p14d1-rival-shelving-save-v43.test.ts`, in the existing `'the validator rejects each inconsistent state'` block):
a rejection entry with `count: 0`; a rejection entry naming a non-active/non-ready ordinal (ordinal
0, `status: 'produced'`); a shelved entry with `retryWeek <= week`. Same non-vacuous
`.toThrow(/pattern/i)` technique as the five existing validator-rejection leaves in that block (a
bare `.toThrow()` against a not-yet-existing function is vacuous; a content-specific pattern that
the generic "is not a function" TypeError does not match is not).

**No change**: the makeSave-stamps-43 confirmation (1344-X2 decision 5) and the control-week
interpretation (1344-X2 decision 3) needed no test change, only documentation, already present in
1344-C's handback.

## Trace and derivation backing the test-3 revision

Reproducible probe (unmodified BASE `tick()`, genesis, `p13a-core-causal-01`, first 20 weeks,
per-studio ready/greenlight transitions):

```
week 3  r01 ready=[0] -> inProduction (filmAnnounced)   week 3  r03 ready=[0] -> inProduction
week 4  r02 ready=[0] -> inProduction                    week 4  r04 ready=[0] -> inProduction
week 5  r03 ready=[1] -> STILL ready                     week 6  r01 ready=[1] -> STILL ready
week 6  r03 ready=[1] -> STILL ready                     week 7  r01,r02,r03,r04 ready=[1] -> STILL ready
week 8-11  r01,r02,r03,r04 ready=[1] -> STILL ready, every week
week 12 r01 ready=[1] -> inProduction   r03 ready=[1] -> inProduction   (r02,r04 still ready)
week 13 r02,r04 ready=[1] -> inProduction
week 14+  every studio's THIRD screenplay begins the same pattern (still ready at week 19)
```

Every rival's **first** screenplay greenlights immediately (zero gap, same week it becomes ready).
Every rival's **second** screenplay goes ready around week 5-6 and then stays ready-and-unevaluated
for 6-8 REAL consecutive weeks before greenlighting — a genuine, sustained rejection sequence (the
early-game echo of the charter's own 1329-A stall pattern), not a `nextDecisionWeek` cadence
artifact (a cadence gap would be at most 1 week, not 6-8). By week 19, every studio's THIRD
screenplay is in the same state. **Conclusion**: no rival has a genuinely rejection-free run inside
a 20-week window on this seed — the original leaf's implicit premise was unachievable as scoped, a
finding 1344-D's own non-blocking note 3 anticipated. The revised 5-week window covers only the
clean first-greenlight phase (weeks 0-4), before any second screenplay ever reaches 'ready'; the
leaf's premise check now genuinely passes there, isolating its one real (RED) failure to the
intended `shelving(b)` assertion, confirmed by the run below.

## RED summary (this revision)

| File | Leaves (was) | Failed | Control-pass | Duration |
|---|---:|---:|---:|---:|
| `tests/p14d1-rival-shelving.test.ts` | 28 (23) | 24 (19) | 4 (4) | 17.65s |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 18 (15) | 18 (15) | 0 (0) | 9.80s |
| `tests/p14d1-rival-shelving-natural.test.ts` | 5 (5, unchanged) | 4 (4) | 1 (1) | 25.89s |
| **Total** | **51 (43)** | **46 (38)** | **5 (5)** | |

**+8 new leaves, all failing for a real, documented reason** (full detail, exact requirement
citation and exact failure text per leaf in `1344-shelving-red-r2-classification.json`):

```
searchIndustryPackages counts contract > on a captured genuine economic-rejection call: ...
TypeError: mods.searchIndustryPackages is not a function
(reached only after: options.lockScreenplay===true confirmed; call.result===null confirmed
 law-independently; expectedCandidateCount self-checks to 54 from first principles)

searchIndustryPackages counts contract > decide-level: a partly cash-constrained week ...
TypeError: Cannot read properties of undefined (reading 'rejections')
(reached only after: candidateCosts() returns exactly 54 real costs; minCost<maxCost confirmed;
 cashBetween derived and shown strictly between them)

API decisions ... > talentMarket.rivalPromiseProjectCandidates exists as a function (1344-X2)
AssertionError: expected 'undefined' to be 'function'

rivalPromiseProjectCandidates > a shelved screenplay is absent from the candidates
TypeError: candidatesOf(...) is not a function

rivalPromiseProjectCandidates > with nothing shelved, the result equals the first two ...
TypeError: candidatesOf(...) is not a function

save-v43-shelving: validator rejects ... > rejects a rejection entry with count 0 ...
AssertionError: expected [Function] to throw error matching /shelv|reject/i but got
'mods(...).validateSaveV43 is not a function'

save-v43-shelving: validator rejects ... > rejects a rejection entry naming an ordinal that is
not active/ready (produced)
AssertionError: expected [Function] to throw error matching /shelv|reject|active|ready/i but got
'mods(...).validateSaveV43 is not a function'

save-v43-shelving: validator rejects ... > rejects a shelved entry with retryWeek <= week
AssertionError: expected [Function] to throw error matching /shelv|retry/i but got
'mods(...).validateSaveV43 is not a function'
```

**The 5 control-passing leaves are unchanged from 1344-C** (same names, same reasons):
`shelving-retry > no retry before retryWeek`, `> no retry without a free slot`, `> at most one retry
per decision`, `shelving-player-symmetry`, `determinism`. Re-run and confirmed identical in this
revision.

**The one revised leaf** (`shelving-viable-control`'s second case) still fails, now for exactly its
intended reason (`shelving(b)` is `undefined`, not the empty-state object) — its own premise check
passes cleanly at RED (see trace above), so it is no longer at risk of failing at GREEN for an
unrelated route reason, per 1344-D's own concern.

## Type gate

`node_modules/.bin/tsc --noEmit -p tsconfig.json` — **exit 0, zero errors** (whole project),
re-confirmed after every edit in this revision, including the final one. Same technique as 1344-C
(future-shape local types + `as unknown as` casts at each read/write boundary); the two new spy-based
leaves needed no new casts beyond what 1344-C already established, since `chooseIndustryPackage` and
`talentMarket`'s other exports already exist — only `searchIndustryPackages` and
`rivalPromiseProjectCandidates` are cast through `Record<string, unknown>`/explicit local interface
shapes, exactly like `validateSaveV43` etc. already were.

## Apply check (temporary index only, real working tree untouched)

```
BASE=c214094478f47c3e861d757ef568a124cbf3bd71
CURRENT_HEAD=e8caeb9009553f67be3a239277820d82082f6151
PATCH=$E/1344-stage/1344-shelving-red-r2.patch    # sha256 3575ee67...d3d7f63b, 1385 lines

GIT_INDEX_FILE=<tmp> git read-tree $BASE;         git apply --check "$PATCH"  # -> OK
GIT_INDEX_FILE=<tmp> git read-tree $BASE;         git apply --cached "$PATCH" # -> OK, blobs:
  tests/p14d1-rival-shelving-fixtures.ts       9af3467c... (unchanged from 1344-C)
  tests/p14d1-rival-shelving-natural.test.ts   2ce70fd7... (unchanged from 1344-C)
  tests/p14d1-rival-shelving-save-v43.test.ts  cfa5c4ce... (was 5f40e092...)
  tests/p14d1-rival-shelving.test.ts           d786f73e... (was c6864558...)
GIT_INDEX_FILE=<tmp2> git read-tree $CURRENT_HEAD; git apply --check "$PATCH"  # -> OK
```
The r2 patch is a **full diff against BASE** (1361 total lines across the 4 files, was 1124 in
1344-C's r1 patch), as instructed, and applies cleanly against both BASE and the current real repo
HEAD (confirming the coordinator's "nothing under src/ changed" — the two fixture-adjacent files
are byte-identical to 1344-C's r1, only the two test files with new/revised leaves changed blob
hashes). `git status --short` on the real working tree before and after this check shows only my own
new evidence files, never a change under `src/`, `bridge/`, `ui/` or `tests/`.

## Handback files (written only in the real repo)

- `$E/1344-stage/1344-shelving-red-r2.patch` (full diff vs `c2140944`, tests only, 1385 lines)
- `$E/1344-stage/1344-shelving-red-r2-classification.json` (51 rows: 41 unchanged from 1344-C, 1
  revised, 1 non-behaviorally-relocated helper noted, 8 new — each row carries a `revision` field
  naming which)
- `$E/1344-C2-shelving-red-revision.md` (this file)

## Summary

+8 new leaves (2 `searchIndustryPackages` direct-contract tests addressing 1344-D Blocking 1; 1
existence guard + 2 `rivalPromiseProjectCandidates` tests addressing 1344-D Blocking 2; 3 new Save43
validator-rejection tests per 1344-F2 non-blocking note 2), all failing for a real, non-vacuous,
documented reason. 1 existing leaf revised (test 3's second case: window narrowed from 20 to 5
weeks and its own premise now asserted, per 1344-F2 non-blocking note 1) after a direct trace showed
the original window was unachievable on this seed — reported and fixed, not silently patched over.
The other 41 leaves (including all 5 control-passing ones) are unchanged and re-verified identical.
Total: 51 leaves, 46 fail, 5 control-pass, 0 vacuous passes. Type gate: 0 errors. No production file
touched; no broad suite run.
