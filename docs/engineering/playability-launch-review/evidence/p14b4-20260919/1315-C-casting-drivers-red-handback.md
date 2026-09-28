# 1315-C: independent test-engineer RED staging for the casting-competition drivers slice

Mode STAGE RED (test source only), repo `/Users/zacheryspector/The-Movies-headless-program` at HEAD
`75233cc2260353c8cbbf8426fdf9d7559d0199df`, branch `wip/headless-program-20260916-ts`. No production code,
fixture or config was touched; no `vitest`/`tsc`/`vite-node`/`node` was run by this author (hard limit).
Read-only `git`/`python3 -c "hashlib..."` (fixture-byte verification only) were used. Everything below is
staged under `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage/tests/`, with
import paths written for the files' intended destination `tests/*.test.ts` — the same staging convention
`tests/p14r3-save-v41.test.ts` documents in its own header. **None of these files has been executed,
type-checked, or moved from the stage directory by this author.**

Law read in full before writing anything: `1313-A-casting-drivers-expansion.md`,
`1313-B-casting-drivers-review.md`, `1313-F-parent-casting-drivers-adoption.md`, plus the cited source
(`src/core/relationships.ts`, `src/core/actions.ts` §287-625/1626-2410, `src/core/castingSessions.ts`,
`src/core/productionAdmission.ts:98-148`, `src/core/productionQueue.ts`, `src/core/queueAdmission.ts`,
`src/core/employment.ts`, `bridge/finance-upcoming.ts`, `bridge/relationships.ts`, `src/core/save.ts`
§10460-10510 and its dispatcher/type sections) and the 1314-P/1314-K/producer-r2 measured route and its
two genuine Save41 fixtures. I pinned both fixtures' gzip **and** decoded sha256 directly against the
checked-in bytes myself (`python3 -c "hashlib.sha256(...)"`), not copied from any prose table, and did not
decompress any fixture beyond the two authorized ones.

## Files and leaves

| File | Leaf(s) covered |
|---|---|
| `tests/p14b9-casting-competition.test.ts` (436 lines) | Leaf 1 (drivers on a generated world) + Leaf 2 (no rival edge) |
| `tests/p14b9-casting-expiry.test.ts` (179 lines) | Leaf 3 (Inseparable expiry note) |
| `tests/p14b9-casting-copy.test.ts` (141 lines) | Leaf 4 (dormancy copy + DRIVER_COPY) |
| `tests/p14b9-save-v42.test.ts` (237 lines) | Leaf 5 (Save42) |
| `tests/p14b9-casting-readers.test.ts` (189 lines) | Leaf 6 (readers) |

All five files use the exact fixed sha256 pin values below (from `tests/fixtures/p14/genuine-v41-pre-casting-drivers/`, computed directly against the checked-in files):

- `MANIFEST.json`: 2677 bytes, `a605cfa0149b2bf3dcf7968ea3c5a0f5cce1e7e2317eced6c2c2037767e45d4e`
- `genuine-v41-casting-acknowledged.json.gz`: 57181 bytes, `3e9da8307dfaf6f8a54698c403648e658033cc05e616a2cb2540073f38049ff6`; decoded 462047 bytes, `6fc0e0768c87d86702df77a5978fe5031bdd313c867e07e8ad476d2c0aba6469`
- `genuine-v41-casting-released.json.gz`: 67977 bytes, `1890a473e76314c449ce98dfabb0cc1cce393adbdc80896dc982aeba28681670`; decoded 535978 bytes, `dd3da574a9d65c9a5bc411925ca7dac70f71ef86b43f3fc792dabdd222dd220a`

## Predicted RED per leaf

**Leaf 1 (`p14b9-casting-competition.test.ts`, first describe block).** Every route builds successfully on
the unchanged engine (all actions used are already legal today; the route itself does not throw). The
first `it` ("the named law constants bind to real numbers") is the anchor RED: `RELATIONSHIP_COMPETITION_DELTA`
and `RELATIONSHIP_COMPETITION_REPEAT_CAP` are absent from `src/core/relationships.ts` at HEAD 75233cc2, so
vite binds them to `undefined`; `typeof undefined === 'number'` is false — predicted failure:
`expected 'undefined' to be 'number'`. Every other `it` in that block either (a) reads a
`sharedCompetitions` field that does not exist on `RelationshipEdge` (predicted: `undefined` !== `1`/`2`,
or the whole edge is `undefined` because nothing mints it yet — `TypeError: Cannot read properties of
undefined`), or (b) filters `edge.recent` for a `castingCompetitionLost`/`repeatedCompetition` kind that is
never written, yielding an empty array where length 1/2 is expected (`expected [] to have length 1`). The
queue-admission describe block fails the same way (its `leadDriver` assertion). The rngState and "no rival
edge" describe blocks are **not** predicted to RED — see "already-true assertions" below.

**Leaf 2 (same file, third describe block).** Already-true today (see below); not a RED.

**Leaf 3 (`p14b9-casting-expiry.test.ts`).** `bridge/finance-upcoming.ts`'s `contractExpiry` row (lines
43-46 at HEAD) builds `detail` only from `weeklySalary`/`endWeekExclusive`; it reads neither
`state.relationships` nor `state.hollywood.employment`. Predicted failure: `expected '...ends on arrival in
Week 52. No replacement contract is assumed.' to contain '<director's name>'` (a plain string-`toContain`
failure, not a missing-import RED — this leaf adds no new named export).

**Leaf 4 (`p14b9-casting-copy.test.ts`).** The route depends on `RELATIONSHIP_COMPETITION_DELTA` (same
absence as Leaf 1), so it throws before minting; both `it`s then read `pairChemistry(...).reasons` from a
world with no competition edge — predicted failure is the same `TypeError`/build failure propagating from
the shared route helper, OR (if the parent's eventual fix lands the delta but not yet the copy strings)
`expected [] to contain 'they have never worked together'` / `'competed for the same role'` /
`'competed again'`.

**Leaf 5 (`p14b9-save-v42.test.ts`).** `validateSaveV42`, `convertV41ToV42`, `convertV42ToV41`,
`migrateToV42` are absent from `src/core/save.ts`; every describe block except the last two calls one of
these directly — predicted failure: `TypeError: (0 , saveModule.convertV41ToV42) is not a function` (or
the equivalent `mods.convertV41ToV42 is not a function`, since I look them up through a cast namespace
object — same underlying cause, matching `tests/p14r3-save-v41.test.ts`'s own precedent for the identical
situation one version earlier). `LIVE_SAVE_VERSION is 42` and the dispatcher-message test are real REDs
too (currently 41 / "...1 through 41 only"). The last two describe blocks ("frozen five-kind catalogue" /
"every frozen reader V1..41") are already-true today — see below.

**Leaf 6 (`p14b9-casting-readers.test.ts`).** The grep-pin describe block is already-true (documentation
check, not a RED). The two behavior-pin describe blocks depend on the SAME route as Leaf 4 (pair (a,d)
losing twice) and on `pairChemistry`'s copy strings, so they RED for the identical underlying reason as
Leaf 4 — `row` is `undefined` (no disclosed tie forms without a competition edge) or `drivers` is missing
the two new copy strings.

## Already-true assertions (not RED; included because the task requires them; each labelled in its own file)

- Leaf 1's rngState-unchanged check: `driverGain` is already an identity function and no RNG stream is
  touched by `applyGreenlight` today, so this is vacuously true before the law lands. Kept as a forward
  regression guard against a naive implementation that consumes RNG.
- Leaf 2's "no rival edge carries either new kind": vacuously true today (the two kinds do not exist
  anywhere yet). Matches the `tests/p14r3-save-v41.test.ts` "frozen readers unchanged (regression pin —
  already true...)" precedent naming, which I copied the label style from.
- Leaf 5's "a V41 envelope carrying sharedCompetitions or a new-kind driver is refused" and "the era-31
  check uses a frozen five-kind catalogue": `validateSaveV41`'s existing `EDGE_KEYS` exact-key check and
  `RELATIONSHIP_DRIVER_KINDS` catalogue check (`src/core/relationships.ts:383-479`, unchanged) already
  refuse an unrecognized extra field or an unrecognized driver kind under a V41 envelope, since
  `RELATIONSHIP_DRIVER_KINDS` today **is** exactly the five-kind catalogue. This is genuinely the only
  black-box-observable way to test "frozen catalogue, not a live subset test" before
  `RELATIONSHIP_DRIVER_KINDS` actually widens; I could not find an observable difference between "checks a
  separate frozen constant" and "subset-tests the live constant" until the live constant actually grows to
  seven kinds. Re-run this describe block after GREEN — it is the one that would catch note 8's named
  regression (a wrongly-implemented subset test silently admitting a new-kind driver under a V41 envelope
  once the live constant is seven kinds).
- Leaf 5's "every frozen reader V1..V41 admits its own version": restricted to v=4..41 —
  `migrateToV1`/`migrateToV2`/`migrateToV3` do not exist in this codebase (confirmed by direct grep of
  `^export function migrateToV` in `src/core/save.ts`; the chain starts at `migrateToV4`). This is a
  regression pin over the existing, unaffected chain.
- Leaf 6's grep-pin describe block: documents the actual grep result (11 total occurrences of
  `RELATIONSHIP_DRIVER_KINDS`/`RelationshipDriverKind` in `src/core/relationships.ts`, none in
  `bridge/relationships.ts`) as a `toBeGreaterThanOrEqual` floor, robust to GREEN adding more occurrences.

## Numeric-hypothesis handling (not a contradiction, a disclosed methodology choice)

1313-A calls both new constants "named hypotheses" (never gives `RELATIONSHIP_COMPETITION_DELTA` an exact
number in the document text; `RELATIONSHIP_COMPETITION_REPEAT_CAP` likewise, referenced only as
"hypothesis 2"). The task prompt's own paraphrase states `RELATIONSHIP_COMPETITION_DELTA (3)` and
`RELATIONSHIP_COMPETITION_REPEAT_CAP=2` — I could not independently re-derive the REPEAT_CAP value from
1313-A's own worked arithmetic ("47 - 3 - 1 = 43" is insensitive to any CAP ≥ 1, since
`min(2-1, CAP) = min(1, CAP) = 1` for every CAP ≥ 1), so I did not treat "=2" as confirmed by the source
documents I was authorized to read start-to-finish. Every arithmetic assertion in my files imports and
uses the two constants **symbolically** (`RELATIONSHIP_BASELINE - RELATIONSHIP_COMPETITION_DELTA - ...`,
`Math.min(1, RELATIONSHIP_COMPETITION_REPEAT_CAP)`), never a bare literal `3` or `2`, per the task's own
"do not assert on numbers the law does not fix" rule. The one place a literal `-3` appears
(`p14b9-save-v42.test.ts`, the tamper test constructing a malformed driver) is an arbitrary tamper value
unrelated to the real constant — noted so it is not mistaken for a hardcoded law assertion.

One consequence: leaf 1's "reaches Strained, never Enemies" test asserts `currentTier(edge, week) ===
'Strained'` using the **computed** closeness (from whatever the real constants turn out to be), so if the
eventual implementation picks values that don't land in the Strained band, this specific assertion will
correctly flag that departure from 1313-A's own stated example — that is the intended behavior, not a bug.

## Route premises I could not settle without execution (the parent will need to measure these)

1. **The entire multi-production chain in `p14b9-casting-competition.test.ts`'s `castingCompetitionWorld()`**
   (5 productions: off-slate/never-seated P1, repeat P2, same-pair-two-slots P-dedup, cancel/re-greenlight
   P3, no-session P-no-session) is my own extension of the 1314-P measured route, not itself measured.
   Every individual action used is legal on the unchanged engine per my source reading, and I traced
   `assertCastingSlateLaw`/`assertCastingSlateEligibility`/`resolveGreenlightStaffing`/
   `activeProductionCompanyTalentIds` to convince myself the sequential cancel-before-next-commission
   design avoids both talent-busy and Development-&-Casting-slot contention — but I never ran it. If any
   single step throws for a reason I did not anticipate, every later `it()` that reads
   `castingCompetitionWorld()` fails together (the memo cache re-throws on first build).
2. **Signing a fourth actor beyond 1314-P's measured three** (needed so a benched actor can lose every
   slot without ever being seated) is untested — I found no code path that would object to it, but it was
   never measured.
3. **The queue-admission leaf** (`p14b9-casting-competition.test.ts`, second describe block) deliberately
   does **not** attempt genuine front-door capacity contention: this seed's week-0 market measures exactly
   one director and one craft, and a seat holds from greenlight through release
   (`src/core/employment.ts:132-134`), so two concurrently-active productions cannot be staffed at all with
   this roster. I could not verify without execution whether, or after how many 13-week
   `HIRING_MARKET_ROTATION_WEEKS` epochs, the signable universe ever offers a second director/craft.
   Instead I drive `commitQueuedIntent`'s code path directly: a legally-shaped `ProductionQueueEntry`,
   built with the exported `queueGreenlightScriptProject` payload-builder, is inserted into
   `state.productionQueue` outside `applyActions` (the `withPromiseVariant` precedent's technique —
   `tests/helpers/p14c2c-fixtures.ts:109-117`), then `tick()` runs the real `admitQueuedIntents` step and
   grants it because the slot is genuinely free. This is a **substitute** for genuine contention, not
   genuine contention itself — flagging explicitly in case the parent judges it insufficiently
   "public-action-only" and wants the genuine-contention route measured instead (or wants both).
4. **`state.hollywood === null` with a managed casting session** (the last bullet of leaf 1): I did not
   find a lawful route within my read-only search. `p13aGeneratedStudio`
   (`src/harness/p13a/fixtures.ts:9-11`) unconditionally calls `initializeHollywood(...,'fresh')`, and I
   found no alternative harness this task authorizes that both activates managed casting sessions and
   never initializes Hollywood. I left this **unstaged** (`it.skip` with an explanatory comment in
   `p14b9-casting-competition.test.ts`'s last describe block) rather than guess at a fabricated state,
   consistent with the task's "only if a lawful route exists; otherwise say so."
5. **Leaf 3's shared-take route** (plain, unmanaged `greenlight` + `assignShootingDirector` +
   `scheduleShootingTake` + tick-until-first-take) reuses 1314-P's exact bounded-loop shoot-assignment
   pattern, swapped onto the unmanaged path — untested in that combination.
6. **"Roster order" in leaf 3** is read as `state.hollywood.employment`'s append/iteration order (an
   interpretation, not settled by 1313-F, disclosed in the file's own header) and exercised by a
   deliberate signing order (director before support). If the real implementation sorts some other way
   (e.g., alphabetically by name), the ordering half of that leaf's assertion will fail for that reason
   specifically, not for the missing-sentence reason.
7. **Leaf 3/4's synthetic-Inseparable-edge technique** (vary only `closeness`/`peakTier`/`peakTierWeek` on
   a real edge, validate whole via `makeSave` + `validateSaveV41`) is modeled directly on the
   `withPromiseVariant` precedent but has not itself been run through the live validator by me.
8. **Leaf 5's greenlight-under-V42-law test** assumes the real writer/director/craft ids from 1314-P's
   measured probe (t-wri-05/t-dir-04/t-cra-09) are still contracted and idle in the acknowledged fixture's
   own state (they should be, per that fixture's own facts — `production: 'none'` — but I did not
   independently trace `busyTalentIds` against the fixture's raw state beyond reading its provenance
   facts).

## Findings in 1313-A/1313-B/1313-F: none I judged undefined or contradictory enough to block staging

1313-B's four required changes are each cleanly resolved by 1313-F's four amendments (seam location →
Amendment 1; precedent citation → Amendment 1's own citation; same-pair-two-slots idempotence → Amendment
2's "de-duplicates... before any write"; `tiersOnRoster` mechanism → Amendment 4). I found one genuine,
disclosed **ambiguity**, not a contradiction: 1313-F Amendment 4 does not fix an iteration order for
multiple Inseparable counterparts ("roster order" is stated but not defined further) — handled as a named
interpretation in `p14b9-casting-expiry.test.ts`'s header rather than a blocking stop, per the task's own
list of interpretations-to-name pattern (matching `tests/p14r3-save-v41.test.ts`'s own "INTERPRETATIONS
NAMED" convention). I also note, without treating it as blocking, that neither 1313-A nor 1313-F states
whether `validateRelationshipsRoot` literally gains an `era` **parameter** on the existing exported
function versus two separate functions — this is not observable from black-box RED testing either way, so
I tested the one thing that **is** observable (frozen `validateSaveV41` still refuses a malformed V41
envelope) and flagged it as a regression pin above rather than asserting on the internal mechanism.

## Summary

DONE for the assigned scope: five RED-staged files under
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage/tests/`, covering all six
required leaves of task 1315-C, plus this handback. Every fixture byte and sha256 used was verified by me
directly against the checked-in files before use. No production code, test, fixture or the concurrently-
reviewed `E/1309-stage` patch was touched. The parent's dry run is the next step — see "route premises I
could not settle without execution" above for exactly which parts of the route need that measurement most.
