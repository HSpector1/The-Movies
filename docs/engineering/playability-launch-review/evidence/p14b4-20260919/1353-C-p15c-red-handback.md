<!-- 1353-C: independent test-engineer handback, saved verbatim by the parent from the agent's final text -->

# 1353-C: P15C Wave R retention guards + Wave 1 RED

Role: independent test engineer (test-author). BASE = `37d701705346e0d94e5de27c063cd4f5d79201ae` (verified
identical to real-repo HEAD at start). Real-repo HEAD moved to `3bfaf1d9d41add6ad780e054ff1305fad54bf6f3` during
this pass (parent landed unrelated P14/P15B/P16 docs-and-evidence records — `1344-*`, `1348-*`, `1352-C2/C3/D/D2/X/X2`,
`1354-P/Q/W0`; `git diff --stat 37d70170 3bfaf1d9 -- src tests` is empty, so nothing in scope moved). Neither
`src/core/campaignLegacy.ts` nor my test files were touched by anyone else. In the real repo I wrote only the three
handback files below; all test authoring and every source edit (injected and reverted) happened in the scratch tree.

## Method

Scratch tree built exactly per the brief's METHOD block (1327-C precedent) at
`/private/tmp/claude-501/.../scratchpad/1353-work/tree`, `git init`'d and committed as `base` (`2d7078e`). All test
authoring, all six Wave R injection proofs, and every test run happened only in that scratch tree; the real repo
was never used to execute code. Ran `node_modules/.bin/vitest run <file>` (project `core`) and, for Part A's six
injection proofs, `-t "<leaf name>"` to isolate one guard per run. Root type gate: `node_modules/.bin/tsc --noEmit`
(root `tsconfig.json`, matching the first half of `npm run typecheck`; the UI half was not run — no UI files are
touched). No broad suite was run.

## Files

- `tests/p15c-wave-r-retention.test.ts` (Part A, 6 leaves)
- `tests/p15c1-campaign-legacy.test.ts` (Part B, 50 leaves)
- Handback: `$E/1353-C-p15c-red-handback.md` (this file)
- Patch: `$E/1353-stage/1353-p15c-red.patch` (tests only, full diff vs BASE, both files above)
- Classification: `$E/1353-stage/1353-p15c-red-classification.json` (56 rows: 6 `control-passes` + 50 `fails`)

`$E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## RED summary

**Part A (6 leaves, classify `control-passes` by design):** these guard EXISTING, already-shipped production roots
(`studio.releasedFilms`, `hollywood.films`, both career-event roots, `theatricalRuns`, `technology.adoptions`), not
the not-yet-built Legacy law. All 6 pass against the unmodified baseline source (final confirmed run: `6 passed
(6)`, `Duration 90.40s`, all in one file). Each is proven by an injected defect in the scratch tree — see the
Wave R injection log below. None of the injected edits are in the patch (`git status --short` in the scratch tree
showed only the two new test files before commit; all three touched production files — `src/core/tick.ts`,
`src/core/hollywoodTick.ts`, `src/core/technologyRival.ts` — were confirmed hash-identical to the scratch tree's
own baseline after every revert).

**Part B (50 leaves, all `fails`):** `src/core/campaignLegacy.ts` does not exist. Every leaf dynamic-imports the
module first (`loadCampaignLegacy()` + `requireFn`/`requireValue`), so every leaf fails RED for the MODULE-MISSING
reason before its own fixture-specific assertions run, e.g.:

```
Error: Failed to load url ../src/core/campaignLegacy.js (resolved id: ../src/core/campaignLegacy.js) in
.../tests/p15c1-campaign-legacy.test.ts. Does the file exist?
 ❯ loadAndTransform .../vite/dist/node/chunks/dep-BK3b2jBa.js:51969:17
```

The one exception is `tuning-legacy-bounded-terms` (RED 17), which imports the REAL, already-existing
`src/core/tuning.ts` and fails on a genuine value mismatch instead:

```
AssertionError: expected undefined to be 70 // Object.is equality
 ❯ tests/p15c1-campaign-legacy.test.ts:1353:41
    expect(t.LEGACY_CRITIC_ACCLAIM_MIN).toBe(70)
```

— exactly mirroring 1351-C's `POWER_RANKING_*` TUNING leaf. Full per-leaf detail is in the classification JSON.
Two leaves that do not themselves call the module in their own check body (`legacy-owner-swap-no-role-field-
structural`, `legacy-public-facts-only-structural-no-cash-cost-revenue-key`) were caught in an early sanity pass
PASSING VACUOUSLY (0 failures on a first draft run) and fixed by adding an explicit `requireFn(mod,
'buildLegacyManifest')` call at the top of each, per the file header's RED-by-design requirement; the fix is
already in the patch. Final full-suite run (both files, one invocation) confirms: `Test Files 1 failed | 1
passed (2)`, `Tests 50 failed | 6 passed (56)`, `Duration 102.90s`. `grep -c "^ ✓"` over a standalone Part B run
returns `0` — no vacuous passes remain.

## Type gate

`tsc --noEmit` (root tsconfig) on the final scratch tree:

```
tests/p15c1-campaign-legacy.test.ts(46,24): error TS2307: Cannot find module '../src/core/campaignLegacy.js' or
its corresponding type declarations.
```

That is the only remaining diagnostic — expected and correct (the module genuinely doesn't exist; a RED-by-design
artifact of the type gate itself, not a defect in these tests). Earlier passes surfaced and I fixed: two unused-
import/unused-variable diagnostics (an unused `FilmResult` type import in Part A; an unused loop index `i` in
`buildAllStarFacts`), eight `declared but its value is never read` diagnostics on the locally-restated §5.5 TUNING
constants (fixed by wiring each into real fixture arithmetic — e.g. the share-exactly-at-threshold leaf's padding
count is now DERIVED from `LEGACY_MIN_SHARE_PERCENT` rather than hand-computed twice — or, for
`LEGACY_FOUNDRY_SETTLE_WEEKS`, by adding the one leaf the original RED list actually specifies but I had not yet
written: `legacy-archetype-edges-talent-foundry-one-credit-contrary-settle-weeks`, the talent-foundry contrary
clause's "one credit, first credited before B−260" case), and one `Object literal may only specify known
properties ('rivalCash')` diagnostic on the deliberate public-facts-leak probe (fixed with an explicit `as any`,
since smuggling an untyped field past the type system is the whole point of that leaf).

## Durations

- Part A, full file, unmodified baseline: `90.40s` total; first guard (which pays the one-time campaign-build
  cost) `84.7s`–`85.8s` across repeated runs; the other five are near-instant (shared memoized campaign).
- Each of the six isolated injection-proof runs (`-t "<leaf>"`): `82.6s`–`189.9s` (two runs, described below,
  needed a second attempt after a first injection design was silently defeated; see the injection log).
- Part B, full file: `~1.6s`–`2.6s` (pure functions, no ticking; 50 leaves fail fast on module-load).
- Combined final run (both files, one invocation): `102.90s`.
- `tsc --noEmit`: a few seconds.

All six Part A guards carry an explicit `120_000 ms` timeout (over the core 5s default), justified in the file's
own header comment: whichever guard runs first inside a given process pays the one-time ~85-90s campaign-build
cost (a memoized, module-level cached `Promise`, exactly mirroring `tests/p15a2-power-ranking-harness.test.ts`'s
own `cachedRows` pattern for an analogous reason).

## Part A method detail: how the six roots were filled

`generateWorld(seed)` → `initializeHollywood(state, 'fresh')` (the exact activation already used by
`src/harness/p13a/fixtures.ts`'s `p13aGeneratedStudio`) → the existing `src/harness/roster-wall/campaign.ts`
weekly driver (`foundRosterWallStudio('1353-wave-r-seed-01', 'direct-package')` then a loop of
`runRosterWallOperatingWeek({state, operatingPolicyId})`), which runs a REAL casting/greenlight/release policy over
real ticks. That harness calls the engine's own `tick()` internally with no options (`develop` defaults to
`false`), so player career events never populate through it alone — this file instead consumes its public
`stateAfterActions` field and calls `tick(state, {develop: true})` itself, the documented `TickOptions.develop`
flag (tick.ts) that gates the player's own release-career growth pass (the same "engaged games" semantics that
already gate `FilmResult.participants`/`TalentCareerEvent` under D-11.A/D-14). No source file is modified for the
base run; every function used is consumed exactly as published.

W1 = week 300, W2 = week 450, chosen so all six roots hold rows at W1 (measured directly against this exact
scratch tree: `studio.releasedFilms` 16, `hollywood.films` ~135, `theatricalRuns` 16, player `careerEvents` 96,
`hollywood.careerEvents` ~762, `technology.adoptions` 1) and `technology.adoptions` — the slowest-to-fill root
(first row at week 277; a second rival adoption does not appear until well after week 400) — gets at least one
more push before W2, so its injection is actually exercised, not vacuous.

## Wave R injection proofs (mandatory per-root defect proof)

Every injection was applied in the scratch tree only, run in isolation (`-t "<leaf>"`), captured, reverted with
`git checkout --`, and hash-confirmed (`shasum -a 256`) against the pre-injection baseline. None of the six edits
below are in the patch.

**Finding (important, reused across roots 2-6): a module-level "already fired" one-shot flag is UNSAFE here.**
The first attempt at root 2 (`hollywood.films`) used `let hollywoodFilmsInjectedOnce = false` at module scope in
`hollywoodTick.ts`, armed on the first push after week 300. That run PASSED even though the debug print confirmed
the mutation fired (`INJECTED-DEBUG firing at week 303 target filmId ... from comedy to drama`) — because
`runRosterWallOperatingWeek` calls `tick()` internally on the SAME pre-tick state I also tick myself (I use its
`stateAfterActions`, never its `stateAfterTick`), so there are always TWO independent, pure `advanceHollywoodWeek`
computations per week — one real (mine, kept), one wasted (the harness's own, discarded). The shared module-level
flag was consumed by the DISCARDED computation first, so my kept trajectory silently skipped the injection. Fix:
every injection below uses a STATELESS condition (an exact or inequality check on `week`/`currentTick` alone,
never a mutable "already applied" flag), and where idempotent field-rewrites are used, the same sentinel value is
written on every qualifying call so repeated firing across the two independent computations is harmless.

1. **studio.releasedFilms** (`src/core/tick.ts`, the `releasedFilms` copy step inside `tick()`). Baseline hash
   `cd487a1b...30dcb9`. Edit: at `currentTick===350`, rewrite row 0's `criticScore` by `+5` instead of the plain
   copy. Run: `wave-r-retention-studio-released-films` (isolated). Failure: `AssertionError: expected
   42.582534436007144 to be 37.582534436007144 // Object.is equality` at `tests/p15c-wave-r-retention.test.ts:123`
   (`expect(later.criticScore).toBe(row.criticScore)`). Duration `59.4s`. Reverted via `git checkout --
   src/core/tick.ts`; hash confirmed `cd487a1b...30dcb9` (baseline). A first attempt using a one-shot DROP of the
   oldest row (not a field rewrite) instead failed with an UNRELATED engine invariant
   (`script development invariant: project "script-0000" does not link a released film`,
   `scriptDevelopment.ts:811`) before the guard's own comparison ever ran — a real, reproducible, and separately
   interesting finding (removing ANY released film from this array is already caught elsewhere in production,
   independent of Wave R), recorded here but not used as the accepted proof since it doesn't exercise the guard's
   own comparison logic.
2. **hollywood.films** (`src/core/hollywoodTick.ts`, the live-film push step inside `decide()`). Baseline hash
   `922ce61a...174855e`. Edit: on the push occurring at exactly `week===303` (the first push naturally reached
   after week 300 in this campaign), rewrite row 0's `genre` to the sentinel `'INJECTED-DEFECT'`. Run:
   `wave-r-retention-hollywood-films` (isolated). Failure: `AssertionError: expected 'INJECTED-DEFECT' to be
   'comedy' // Object.is equality` at `tests/p15c-wave-r-retention.test.ts:161`
   (`expect(later.genre).toBe(row.genre)`). Duration `85.3s`. Reverted; hash confirmed `922ce61a...174855e`.
3. **player careerEvents** and 4. **hollywood.careerEvents** (`src/core/tick.ts`, both career-event concat lines,
   injected together since they sit on adjacent lines and are independent). Baseline hash `cd487a1b...30dcb9`.
   Edit: at `currentTick===350`, drop the oldest row of each (`state.careerEvents.slice(1)` /
   `industry.hollywood.careerEvents.slice(1)`) regardless of whether new events are added that tick (unconditional
   at that one tick, since player releases had already plateaued by week 300 in this campaign and a
   still-conditional drop would never fire). Run: both leaves matched by `-t "career-events"` in one invocation.
   Failures: `Error: RED: player careerEvents row prod-0001:t-wri-06 present at W1=300 is gone at W2=450` (line
   210) and `Error: RED: hollywood.careerEvents row
   studio-f53aa995-r01:film:0:person-studio-f53aa995-r01-0 present at W1=300 is gone at W2=450` (line 235).
   Duration `112.0s`/`121.0s` total. Reverted; hash confirmed `cd487a1b...30dcb9`.
5. **theatricalRuns** (`src/core/tick.ts`, the `theatricalRuns` copy step). Baseline hash `cd487a1b...30dcb9`.
   Edit: at `currentTick===350`, rewrite row 0's `totalWeeks` to `-999`. Run:
   `wave-r-retention-theatrical-runs` (isolated). Failure: `AssertionError: expected -999 to be 6 // Object.is
   equality` at `tests/p15c-wave-r-retention.test.ts:271` (`expect(later.totalWeeks).toBe(row.totalWeeks)`).
   Duration `104.1s`. Reverted; hash confirmed `cd487a1b...30dcb9`.
6. **technology.adoptions** (`src/core/technologyRival.ts`, `considerRivalAdoption`'s adoption-push step).
   Baseline hash `69c8fa5a...07803520` (see note below). Edit: on every push at `week>=350` (idempotent —
   overwrites the same sentinel repeatedly, safe under the two-independent-computations finding above), rewrite
   row 0's `operationalWeek` to `-999`. Run: `wave-r-retention-technology-adoptions` (isolated). Failure:
   `AssertionError: expected -999 to be 288 // Object.is equality` at `tests/p15c-wave-r-retention.test.ts:305`
   (`expect(later.operationalWeek).toBe(row.operationalWeek)`). Duration `86.0s`. Reverted; hash confirmed
   `69c8fa5a...07803520` (`shasum -a 256` full value:
   `69c8fa5ab2446b0cb3c74678538bd4b308917e0c8021e71355e5c54d07803520`).

Final post-revert confirmation: `git status --short` in the scratch tree showed only the two new test files
(zero modified production files) before committing the tests-only patch; `shasum -a 256` on all three touched
files matched their baseline values one more time immediately before the commit.

## Proposed LegacyFacts

`LegacyFacts` is NOT a parent decision — the brief explicitly delegates it to this file. Derived strictly from
1353-A §5.1-§5.4 as amended by 1353-F; public facts only (no rival cash, cost or revenue field anywhere, checked
structurally by RED 14). The shape actually used in the test file (`tests/p15c1-campaign-legacy.test.ts`,
lines ~85-155):

```ts
type Genre = 'comedy' | 'drama' | 'crime' | 'romance' | 'horror' | 'adventure'
type Standing = { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }
type LegacyCredit = { talentId: string; role: string }

type LegacyFilmFact = {
  filmId: string; studioId: string
  provenance: 'campaign' | 'authored'
  releaseWeek: number | null            // null only for 'authored' (pre-1920, no absolute week)
  genre: Genre                          // fallback: authored film's own genre; campaign film's concept genre
  criticScore: number
  audienceScore: number | null          // authored only; campaign films' score comes from careerEvents
  status: 'settled' | 'inRun'
  settledWeek: number | null
  grossSettled: number | null           // null while inRun; never a mid-run running total
  credits: LegacyCredit[]               // authored: direct; campaign: [] (credits live on careerEvents)
}

type LegacyCareerEventFact = {
  eventId: string; filmId: string; talentId: string; role: string
  releaseWeek: number; genre: Genre; audienceScore: number
}

type LegacyAdoptionFact = {
  adoptionId: string; studioId: string; technologyId: string
  operationalWeek: number | null; cancelledWeek: number | null
}

type LegacyTechnologyFact = { technologyId: string; commercialWeek: number }
type LegacyConditionEventFact = { eventId: string; studioId: string; week: number; from: string; to: string }
type LegacyRankingSnapshotFact = { week: number; studioId: string; rank: number | null; band: string }
type LegacyMarketAssessmentFact = { assessmentId: string; studioId: string; assessed: boolean; underPressure: boolean }
type LegacyDomainFact = { domainId: string; highWatermark: number; recordedFromWeek: number | null }
type LegacyStudioFact = { studioId: string; row: number; enteredWeek: number | null; closedWeek: number | null; standing: Standing }

type LegacyFacts = {
  boundaryWeek: number
  studios: LegacyStudioFact[]; films: LegacyFilmFact[]; careerEvents: LegacyCareerEventFact[]
  adoptions: LegacyAdoptionFact[]; technologies: LegacyTechnologyFact[]; domains: LegacyDomainFact[]
  conditionEvents?: LegacyConditionEventFact[]      // absent = P15B not yet chartered -> notRecorded
  rankingSnapshots?: LegacyRankingSnapshotFact[]    // absent = P15A.2 archive not migrated yet -> notRecorded
  marketAssessments?: LegacyMarketAssessmentFact[]  // absent = P15A.1 root not landed yet -> notRecorded
}
```

Design rationale, by field:

- **`boundaryWeek` lives on facts, not as a separate parameter.** RED 2/11 require the pure law to receive facts
  EXTENDING past B and do its own cut; if the adapter pre-filtered, those leaves couldn't exist. `buildLegacyManifest`
  reads `facts.boundaryWeek` for every "is this before B" decision.
- **`LegacyFilmFact.genre` is a FALLBACK, not the primary source.** The §5.3 common rule ("Genre comes from the
  film's career events, else its concept") is implemented inside the pure law itself, reading
  `LegacyCareerEventFact.genre` first and falling back to the film fact's own `genre` only when no career event
  exists for that film. Symmetric treatment for `audienceScore`: campaign films carry `audienceScore: null` on the
  film fact itself (deliberately, to avoid a second source of truth) and the law reads it exclusively off career
  events, enforcing agreement (RED 15).
- **`credits` is only populated for authored films.** For campaign films, "credits" are exactly the set of
  `careerEvents` filtered by `filmId` (each already carrying `role`); duplicating them on the film fact would be a
  second source of truth with no upside. Authored films predate the career-event system entirely (no post-
  development/star-power pass ever ran for them), so they need their own direct `credits` list — this is the ONLY
  way `talent-foundry`'s "authored films come first" disqualification rule (a person's first-ever credit ever
  being on an authored film) can be evaluated at all.
- **`domains` is a flat array of `{domainId, highWatermark, recordedFromWeek}`**, one entry per KNOWN v1 domain
  (of the 11 named in §5.2; `awards` is never present — it is always synthesized as `notRecorded`). A 17th entry
  is invalid input (RED 9); an entry's `recordedFromWeek` gates every row dated before it (RED 13).
- **Optional `conditionEvents`/`rankingSnapshots`/`marketAssessments`** model exactly the "an absent root reads
  notRecorded" rule for the three domains that depend on siblings not yet chartered/landed (P15B, P15A.2 archive,
  P15A.1 root respectively) — `undefined` (not an empty array) is the "the domain doesn't exist yet" signal; an
  empty array is "the domain exists, this studio simply has no rows in it" (both are exercised: RED 5's
  `resilient-survivor` notRecorded leaf uses `undefined`; the "no winner" NONE fixture uses a real, non-empty
  array with only a `stable->warning` transition to get a genuine `notHeld`, not `notRecorded`).
- **No `role`/`isPlayer`/`rival` field anywhere** (RED 7): the pure law reads only "one studio's own facts plus
  shared public facts" per the charter's own common rule, and a fact set is fully portable across a studioId
  relabelling (proven behaviourally, not just structurally, by `legacy-owner-swap-same-facts-relabelled-give-
  swapped-results`).

**Not yet resolved — flagged for the parent to adopt or amend before Wave 2 production:**

1. **Ref domain-id taxonomy.** `LegacyRef.domainId` values used in my fixtures/assertions (e.g. `'powerRanking'`
   for ranking-lens refs) are MY OWN reasonable naming, not confirmed against any existing string constant. RED
   10's own leaf (`legacy-refs-resolve-every-ref-is-a-real-id-below-boundary`) deliberately does not pin exact
   `domainId` strings for this reason — it only asserts every ref's `id` is a genuinely known fact ID and its
   underlying week is below B, which is the substantive content of the RED item without over-specifying a naming
   scheme that is Wave 2/the state-to-facts adapter's job, not Wave 1's.
2. **`LensSummary.counts` key names** (e.g. what the `ranking`/`catalog`/`resilience` lenses call their numeric
   fields) are similarly undecided; no RED leaf pins an exact key name for these, only their existence/shape where
   directly relevant (e.g. the boundary-cut leaf checks `refs`, not `counts`).
3. **RED 9's "a ninth archetype [refuses]" / 1353-F's 13th-lens addition — genuine interpretation gap, not just an
   unpinned name.** The parent-decided API (`buildLegacyManifest(facts, kind)`) gives the CALLER no channel to
   supply archetype or lens IDENTITY at all — `LEGACY_ARCHETYPE_IDS` (exactly 8) and `LEGACY_LENS_IDS` (v1 ships 8
   of a 12-slot annex bound) are fixed exported constants, never derived from `facts`. A 9th archetype or 13th
   lens summary therefore CANNOT be dynamically constructed through this surface, and "refuses" cannot be tested
   as a runtime call that throws. I authored `legacy-bounds-ninth-archetype-thirteenth-lens-structurally-
   impossible` as a STATIC invariant on the two exported constants instead (`LEGACY_ARCHETYPE_IDS.length ===
   LEGACY_BOUNDS.archetypes`, `LEGACY_LENS_IDS.length <= LEGACY_BOUNDS.lenses`) and flagged it in both the leaf's
   own comment and the classification JSON. If the parent intended a genuinely dynamic refusal (e.g. a future,
   separately-exported low-level validator function outside today's PARENT API DECISIONS list), that function
   doesn't exist yet either and this leaf would need rewriting once it's named.
4. **RED 13's "a domain recorded from ≥ B never freezes"** — I read this as: such a domain can only ever reach
   `status: 'limited'` with effectively zero usable rows for THIS official manifest, never `'complete'`; I did not
   write a leaf pinning this exact reading (only the more basic `recordedFromWeek`-gates-a-row-below-it case,
   RED 13's clearer half) because "never freezes" could also plausibly mean something about the ROOT's own future
   freeze eligibility (a Wave 2 concern, since Wave 1 has no root/save step at all). Flagged, not resolved.
5. **"A film without events... marks limited" (RED 15)** — I chose the narrower reading (the FILM itself is simply
   excluded from decade/score counting, observable via decade classification) over a broader one (the whole
   per-studio `ArchetypeResult.limitedBy` gets marked for a domain that is otherwise fully `'complete'`). My leaf
   (`legacy-audience-score-no-events-excludes-film-from-decade-counting`) tests only the narrower reading;
   flagged as an authoring decision, not confirmed against the charter text beyond its own literal wording.

## Hand derivations (representative; full detail is in the test file's own per-leaf comments)

Every fixture's expected outcome is derived in-line as a comment at its call site in `tests/p15c1-campaign-
legacy.test.ts`, never copied from a production implementation (none exists). Representative examples:

- **`legacy-boundary-cut-film-before-and-at-b`**: two films, both critic `LEGACY_CRITIC_ACCLAIM_MIN+10=80`
  (acclaimed either way), one at week 6239 (B−1, inside), one at 6240 (B, outside). If the cut is correct,
  artistic-voice's `qualifyingCount` is exactly 1 (only F-IN); a broken cut would report 2.
- **`legacy-archetype-edges-artistic-voice-share-exactly-at-threshold`**: `n = 100×LEGACY_MIN_FILMS /
  LEGACY_MIN_SHARE_PERCENT = 100×5/25 = 20` derived from the tuning constants themselves (not hand-picked), giving
  `100×5 = 500 = 25×20 = 500` (exact equality, S-EXACT: held) vs `n=21`: `500 < 525` (S-BELOW: notHeld).
- **`legacy-archetype-edges-technology-pioneer-plus52-qualifies-plus53-does-not`**: `commercialWeek(synchronized-
  sound)=416`; `416+LEGACY_PIONEER_WEEKS(52)=468` operational qualifies (inclusive "by"); `469` does not, and
  is nowhere near the late threshold (`416+260=676`) either — a genuine "middle" adopter that is neither pioneer
  nor laggard, asserted via `contraryCount===0` alongside `qualifyingCount===0`.
- **`amendment-1-audience-institution-exactly-half-liked-qualifies`**: decade A has 2 scored releases, one at
  exactly `LEGACY_AUDIENCE_LIKED_MIN=57` (liked) and one at `56` (not liked): `liked=1, scored=2, 2×1=2>=2` →
  an audience decade, asserted via the decade's best film appearing in `qualifying`. Decade B: both releases at
  `56` (`liked=0, scored=2, 0<2`) → not an audience decade, its worst film appears in `contrary` instead.
- **`legacy-coexist-every-evaluated-archetype-held`**: a single "ALLSTAR" studio fixture (10 films spread across
  exactly `LEGACY_AUDIENCE_MIN_DECADES=4` calendar decades, all acclaimed+hits, 8/10 one genre for a genre-
  specialist majority, one on-time technology adoption, three people each credited on all 10 films for talent-
  foundry, and a distress→recovery→stable condition sequence) is hand-derived to satisfy all 7 evaluated
  archetypes simultaneously; the leaf sanity-checks the fixture's own decade/people counts against the real §5.5
  constants before asserting anything about the (not-yet-existing) production output.
- **`amendment-4-pioneer-contrary-uses-own-earliest-adoption-not-industrys-first`**: studio Y has a cancelled
  early adoption (excluded per amendment 4's "non-cancelled" clause) and one genuinely late operational adoption
  (`716 > 416+260=676`); the leaf asserts Y's contrary ref is exactly `['Y-LATE']` — never the industry-first
  adoption (belonging to a different studio X) and never the cancelled one.

## Findings

1. **Module-level "already fired" injection flags are unsafe under `src/harness/roster-wall/campaign.ts`'s own
   redundant internal `tick()` call.** Documented in full above (Wave R injection log, root 2). Any future test
   author reusing this harness for a similar defect-injection proof should use a stateless condition on
   `week`/`currentTick` instead.
2. **Dropping any row of `studio.releasedFilms` — even far in the past, even just once — is already caught by an
   UNRELATED engine invariant** (`scriptDevelopment.ts:811`, "project does not link a released film"),
   independent of anything Wave R adds. This is a genuine, reproducible, second line of defense for that specific
   root that the charter/Wave R didn't ask me to find, but is worth the parent knowing about.
3. **RED 9's "a ninth archetype... refuses" and 1353-F's 13th-lens addition cannot be constructed through the
   parent-decided `buildLegacyManifest(facts, kind)` surface** — see "Proposed LegacyFacts" item 3 above. This is
   the one place my RED authoring had to substitute a static invariant for a dynamic "refuses" call; flagged for
   confirmation, not resolved unilaterally.
4. **`RivalRunFilmFact`/rival-gross fields (`directCommitment`, `studioRevenueReceived`) are correctly excluded
   from Wave R's asserted field list** per 1353-A §5.1's explicit "Rival cash, costs, studio revenue — Never
   read" row; documented in the Part A file's own header comments per-root, not merely asserted in code.
5. **No regression found and none introduced.** Nothing in `src/core` changed as a result of this record; the
   scratch tree's three touched production files are all hash-identical to baseline after every revert (confirmed
   twice: immediately after each individual revert, and again immediately before committing the tests-only patch).

## Apply check

Temporary-index check (`GIT_INDEX_FILE` scoped to a scratch file only; the real repo's actual index/working tree
were never touched) against the real repo's CURRENT HEAD (`3bfaf1d9d41add6ad780e054ff1305fad54bf6f3`, not BASE,
since the parent landed other records meanwhile — see "Method" above for confirmation that nothing in `src`/`tests`
scope moved):

```
$ git read-tree 3bfaf1d9d41add6ad780e054ff1305fad54bf6f3
$ git apply --check --index docs/.../1353-stage/1353-p15c-red.patch
APPLY-CHECK-OK vs 3bfaf1d9
```

## Return to Fable

**DONE** for the assigned scope (Part A: 6 Wave R retention guards with mandatory injected-defect proofs; Part B:
50 Wave 1 RED leaves covering 1353-A §8 items 1-17, 1353-F's 13th-lens addition and `legacy-closed-before-
boundary`, and one dedicated leaf per §5.3 amendment 1-4 edge). Covered requirements: 1353-A §4 row R (Part A);
1353-A §5, §8 items 1-17 and 1353-F's confirmed amendments/additions (Part B). Exact paths above. What changed:
two new test files only (patch attached); zero production files changed in the delivered state (all six injected
defects were reverted and hash-confirmed). Checks actually run: `vitest run` per file and per isolated leaf (all
output captured above and in the classification JSON), `tsc --noEmit` (root tsconfig only — the UI half of
`npm run typecheck` was not run, out of scope), a temporary-index apply check against current HEAD. Remaining
defects/evidence limits: the five "Proposed LegacyFacts — not yet resolved" items above are genuine open
interpretation questions for the parent, not defects in this record; RED 9's ninth-archetype/13th-lens leaf is a
static substitute for a dynamic check the current API can't express. Next concrete action: parent review of this
handback and the Proposed LegacyFacts section, adoption or amendment of the fact-type proposal, then Wave 1
production (`src/core/campaignLegacy.ts`) queued behind that adoption per 1353-A §10's stated order.
