# 1358-C: P14B relationship rulings SLICE B — RED handback

Role: independent test engineer (test-author). Task: record 1358-C, the RED for P14B relationship
slice B (the `competitions` log, romance D-1312-2, the Professional Rivals label, Save44, projection
57), per `1358-sliceB-red.md`. Branch `wip/headless-program-20260916-ts`.

## Base check

- Real repo HEAD at start (and throughout this record — verified unchanged at the end):
  `c614b7e9ed62dcb889118ba1eadb8a2bafa7934a` ("shelving landed: recorded GREEN 51/51 at a988108b;
  Save43 sweep fallout measurement next (1344-L)"). Slice A (rules v2, D5 comment, Mentor, no save
  step) has **not** landed in the real repo — `src/core/relationshipLabels.ts` does not exist there.
- Scratch tree built by the 1327-C method at
  `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1358-work/tree`:
  commit `d447877` = `base` (the archive of real HEAD `c614b7e9`). Slice A's RED r5 patch
  (`1348-stage/1348-rel-sliceA-red-r5.patch`) and production step3 patch
  (`1348-stage/1348-rel-sliceA-production-step3.patch`) applied cleanly and committed as `e95c211` =
  `slice-a`. My patch is the diff `slice-a..working-tree`, tests only.
- I wrote only handback/staging files in the real repo (this record and everything under
  `1358-stage/`) and edits inside the scratch tree. No production source was touched anywhere.

## Files

- `1358-stage/1358-rel-sliceB-red.patch` — tests-only diff vs `slice-a`; 95,446 bytes; sha256
  `5d7a3591ba4c6f5ecf05eb1ddbf5df2258324f2ac2b7f292fba577acc6da4dca`. Five files: four NEW
  (`tests/p14b10-competitions-log.test.ts`, `tests/p14b10-labels.test.ts`,
  `tests/p14b10-save-v44.test.ts`, `tests/bridge-p14b10-relationship-labels.test.ts`) and one
  modified (`tests/p14b5-relationships.test.ts`, the title-only rename below).
- `1358-stage/1358-P-save43-producer.ts` — the genuine-V43 fixture producer. 12,738 bytes; sha256
  `bd49373d579de61604abf1a8238788daece4c94b3c15038184ef980e4ab9f713`. **Not run** (per the brief:
  "the parent runs it as a recorded mint after the measurement ends").
- `1358-stage/1358-rel-sliceB-red-classification.json` — 81 rows (one per leaf, plus the three
  title-renamed leaves), 56,838 bytes; sha256
  `120818a17ae8cf423b772e7a648e0ff235944474bdd91a06ce23ca6d20ba254a`. 61 `fails`, 12 `not executed`,
  8 `control-passes`.
- This file.

## Title-only rename (parent addendum, ruling 1348-F5 item 3 / slice A review 1348-J KEEP)

`tests/p14b5-relationships.test.ts`'s `family 4` describe block's title still read "TIER RULE under
RELATIONSHIP_RULES_VERSION 1" after r5 already moved the leaf's own asserted value to 2 (line ~760).
Fixed: `1` → `2` in the describe title only. No assertion in any of the three leaves under it changed.
Measured, isolated, before AND after the rename (`vitest run --project core
tests/p14b5-relationships.test.ts -t "family 4"`): **3 passed | 48 skipped (51)** both times, with the
identical three leaves passing both times. Recorded in the classification JSON as a rename
(`renameOldIdentity`/`renameNewIdentity` fields), `redStatus: control-passes`, unchanged.

## RED runs (all on the scratch tree, slice-a base, no production code touched)

Machine-load discipline: a recorded measurement (`run-bounded-source-c2.mjs 1344-save43-broad-core`)
was running on this machine for the whole session (confirmed still running at handback time via
`ps`). Every run below is one file at a time, per the brief; the two Bridge-file runs before the
coordinator's mid-task machine-load note were already in flight when the note arrived and were
allowed to finish ("let your current bridge run finish"); every run after the note is under ~40s.

| File | Result | Duration | Command |
|---|---|---|---|
| `tests/p14b10-competitions-log.test.ts` | 4 failed, 2 passed (6) | 4.5s | `vitest run --project core tests/p14b10-competitions-log.test.ts` |
| `tests/p14b10-labels.test.ts` | 12 failed (12) | 0.3s | `vitest run --project core tests/p14b10-labels.test.ts` |
| `tests/p14b10-save-v44.test.ts` | 20 failed (20) | 17.2s | `vitest run --project core tests/p14b10-save-v44.test.ts` |
| `tests/bridge-p14b10-relationship-labels.test.ts`, non-Mentor | 7 failed, 3 passed, 2 skipped (12) | 13.5s | `... -t "(P14B10 T1\|Professional Rivals\|Romance\|No magnitudes)"` |
| `tests/bridge-p14b10-relationship-labels.test.ts`, Mentor only | 2 failed, 10 skipped (12) | 26.8s | `... -t "Mentor"` |
| `tests/p14b10-romance.test.ts`, bindings+pure reads | 14 failed, 14 skipped (28) | 0.2s | `... -t "(P14B10 T1\|currentRomanceValue\|romanceStatus)"` |
| `tests/p14b10-romance.test.ts`, drift exemption | 2 failed, 26 skipped (28) | 24ms | `... -t "drift exemption and resumption"` |
| `tests/p14b10-romance.test.ts`, growth/formation/ending (12 leaves) | **NOT RUN** | — | withheld under the machine-load hold — see Findings |

**Totals, verified against the classification JSON (81 rows):** 61 `fails` (genuine, measured RED,
one per file: competitions-log 4, labels 12, save-v44 20, bridge 9, romance 16) + 12 `not executed`
(the romance growth/formation/ending leaves, see Finding F4) + 8 `control-passes` (3 title-rename
rows in `p14b5-relationships.test.ts`, 2 in competitions-log — "no RNG draw" and the conflict-
evidence cross-check — and 3 in the bridge file — the two undisclosed-counterpart controls and the
leak-law serialization check). **69 of 81 leaves were actually executed** before handback; see the
classification JSON for the exhaustive per-leaf list, this is a summary only.

## Type gate

Root gate on the final scratch tree (all fixes applied):
```
node_modules/.bin/tsc --noEmit -p tsconfig.json
```
Exit **2**, 29 errors: **10 are the expected, RED-at-type-level mirror** of the missing exports (the
1348-C5 convention — "a test written against a signature that does not exist on this tree yet, by
design"):
```
tests/p14b10-labels.test.ts(47,10): error TS2305: ... no exported member 'RIVALS_SAME_SLOT_COMPETITIONS'.
tests/p14b10-labels.test.ts(48,10): error TS2305: ... no exported member 'professionalRivalsEvidence'.
tests/p14b10-romance.test.ts(82-84): error TS2305 x8 (ROMANCE_DECAY_WEEKS, ROMANCE_EXIT_THRESHOLD,
  ROMANCE_FORMATION_THRESHOLD, ROMANCE_GRACE_WEEKS, ROMANCE_PROXIMITY_GAIN, ROMANCE_SUCCESS_GAIN,
  currentRomanceValue, romanceStatus)
```
The other **19 are PRE-EXISTING, entirely unrelated to slice A or slice B** — see Finding F1.
`tests/p14b10-competitions-log.test.ts` and `tests/p14b10-save-v44.test.ts` and
`tests/bridge-p14b10-relationship-labels.test.ts` contribute **zero** type errors of their own (every
symbol they import already exists on the module; their RED is entirely at the value/behavior level).

## Hand derivations (romance arithmetic, per the pitfall "hand-derive every expected romance value")

- **Grace/decay formula** (this author's inferred contract, stated as such in the file header — see
  "Proposed API" below): `currentRomanceValue(romance, week)`, dormant = `week - anchorWeek`; if
  `dormant <= ROMANCE_GRACE_WEEKS` return `value` unchanged; else `span = min(dormant -
  ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS)`, return `value - trunc(value * span / ROMANCE_DECAY_WEEKS)`
  — the `currentCloseness` shape with target 0 instead of the baseline.
- **Halfway-decay leaf**: value 80, `span = floor(260/2) = 130`. Expected `80 - trunc(80*130/260) =
  80 - trunc(40) = 80 - 40 = 40`. Computed in the test itself from the law's own formula (never
  copied from any implementation), independent of the constant's numeric value at test-authoring time.
- **229-week note** (1347-A §3 rationale: "A bond at 75 ends about 229 weeks after the last shared
  picture"): rather than trust the prose "about 229", the test hand-derives the EXACT crossing week
  by direct enumeration of the law's own formula from `value = ROMANCE_FORMATION_THRESHOLD = 75`,
  asserting only that a crossing exists strictly between week 0 and `GRACE+DECAY = 364`, and that
  the value one week before the crossing is still `>= EXIT_THRESHOLD` while the crossing week itself
  is `< EXIT_THRESHOLD` — a boundary proof, not a copied number.
- **Formation math**: a pair one gain below threshold (`75 - 10 = 65`) crosses to exactly 75 on the
  next `ROMANCE_PROXIMITY_GAIN` (10) gain — hand-arithmetic, not a magic literal.
- Every growth/formation/ending leaf's expected numeric value is stated as an arithmetic expression
  over the named constants (`ROMANCE_FORMATION_THRESHOLD - ROMANCE_PROXIMITY_GAIN`, etc.), never a
  bare literal that would silently go stale if a constant's value changed.

## Proposed API (gaps the brief's Parent API section does not name)

The brief's Parent API list names `RelationshipEdge.romance`, the six `ROMANCE_*` constants, and the
two PURE READS `currentRomanceValue`/`romanceStatus` — it does not name a WRITE entry point for
growth/formation/ending, nor does it widen `currentCloseness`'s signature for the drift exemption.
Both gaps are stated in `tests/p14b10-romance.test.ts`'s own file header, not resolved silently:

1. **Growth/formation/ending write seam.** 1347-A §2.3 says growth applies "at the tick seam, from
   the week's changes only" — the only existing, unchanged-signature function matching that
   description is `advanceRelationshipsWeek(state, delta, week)` (already exported,
   `src/core/relationships.ts:310`), which already processes exactly `delta.takes`/`delta.releases`
   for the existing closeness drivers. Every growth/formation/ending leaf calls THIS function,
   extended (by inference) to also thread romance. **If production instead adds a separate,
   differently-named write entry point, the 12 growth/formation/ending leaves will need
   retargeting.** This is the single biggest risk to this record's leaves actually landing as
   written; it is unavoidable given the brief names no signature for this half of the law.
2. **Drift-exemption read site.** 1347-A §2.3 "Drift exemption" requires `currentCloseness` to
   somehow know about an open bond, but its brief-given signature
   (`Pick<RelationshipEdge, 'closeness'|'lastEventWeek'>`) is unchanged. The two drift leaves call
   `currentCloseness` with a FULL `RelationshipEdge` (including a populated `romance` field) — legal
   today under the narrow Pick type (a wider object always satisfies a narrower Pick), and this
   author's best-supported guess at the read site, but **not a decided signature**. If production
   instead computes the exemption at the tick seam only (never letting `currentCloseness` itself
   read `romance`), these two leaves will need retargeting.

Both gaps are also independently confirmed as REAL RED right now (production genuinely doesn't do
either thing yet): the two drift leaves measured `"expected 50 to be 70"` — `currentCloseness`
literally cannot see `romance` today, so a Partners pair drifts normally, which is the correct RED
regardless of which exact seam production eventually chooses to fix it at.

## The disputed reading (named, not resolved, per the brief's explicit instruction)

1347-F's non-blocking note says growth AND formation both require "Friends or above" and "no open
bond with anyone." For a pair that is **already partners** (holding an open bond WITH EACH OTHER),
does "an open bond with anyone" include their own current bond (freezing their own further growth)
or does "anyone" implicitly exclude the current partner (so a formed pair keeps accumulating/decaying
normally)? **Not asserted anywhere in this record.** The one eligibility leaf staged
(`growth is blocked by a THIRD PARTY's open bond`) is the reading BOTH candidates agree on: a
completely different person's open bond blocks growth. Two readings for the parent:
- **Reading A** ("anyone" is literal): an already-partnered pair's OWN bond blocks their own further
  growth; `romance.value` freezes at whatever it was at formation (only decay ever moves it again).
- **Reading B** ("anyone" excludes the current partner): growth continues normally for an
  already-partnered pair exactly as it did before formation.

## Existing pins that move by ruling (named, NOT edited — a separate version sweep)

**`LIVE_SAVE_VERSION` (43 → 44, this ruling).** Grepped `tests/*.ts` for literal `43` pins tied to
`LIVE_SAVE_VERSION`/`saveVersion`: only
`tests/p14d1-rival-shelving-save-v43.test.ts:46` (`expect(saveModule.LIVE_SAVE_VERSION).toBe(43)`),
`tests/p14d1-rival-shelving.test.ts:187` (same), and
`tests/p14d1-rival-shelving-save-v43.test.ts:57,85` (`saveVersion` pinned to `43` on converted
envelopes). These four lines move under this ruling. (Separately, dozens of files still pin
`LIVE_SAVE_VERSION` to **42** — e.g. `tests/p14b9-save-v42.test.ts:208` — which is the PRIOR,
already-landed 42→43 shelving bump's own unswept debt, explicitly out of scope here: the coordinator's
own commit log names it "Save43 sweep fallout measurement next (1344-L)". Not this record's ruling,
not touched, named for completeness.)

**`PROJECTION_VERSION` (56 → 57, this ruling).** Grepped every `.toBe(56)` tied to
`PROJECTION_VERSION`/`snapshotVersion`/`projectionVersion`: **51 lines across 34 files.** Full list
(mechanical grep, not individually hand-verified — matching the scale 1347-F's own Addendum warns
of: "the 49→50 sweep found 42 pins in 27 files"):
```
tests/bridge-operations-events.test.ts:333
tests/bridge-owner-ux-projection21-schema.test.ts:18
tests/bridge-p10a-w0-people-projection.test.ts:321
tests/bridge-p11-capital-contributors.test.ts:24
tests/bridge-p11-ready.test.ts:52
tests/bridge-p13b-r07-setup.test.ts:320,322
tests/bridge-p13b-s1b-seats.test.ts:76,102
tests/bridge-p13b-s2-labs.test.ts:115,126
tests/bridge-p13b-s3-plans.test.ts:202,214
tests/bridge-p13b-s4-office.test.ts:224,235
tests/bridge-p13b-s5-adoption.test.ts:250,252
tests/bridge-p13b-s6-cancellation.test.ts:270,272
tests/bridge-p13b-s7-disclosure.test.ts:270,272
tests/bridge-p13b-s8-rivals.test.ts:223,225 (line 223 carries a stale inline comment, "RED: today PROJECTION_VERSION is 40" — leftover from an earlier round, not this one)
tests/bridge-p14a1-market.test.ts:152,154
tests/bridge-p14a1-release-busy-set.test.ts:215,217
tests/bridge-p14a2-market.test.ts:217,219
tests/bridge-p14a3-world.test.ts:229,231
tests/bridge-p14b1-promises.test.ts:208,210
tests/bridge-p14b2-trust.test.ts:140,143
tests/bridge-p14b3-promise-command.test.ts:510
tests/bridge-p14b4-runtime47-compatibility.test.ts:197
tests/bridge-p14b5-relationships.test.ts:367
tests/bridge-p14b7-promise-waiver.test.ts:137
tests/bridge-p14b8-waiver-surface.test.ts:776,778
tests/bridge-p14c2rm-runtime.test.ts:87
tests/bridge-p14c2s-scientist-runtime.test.ts:100
tests/bridge-p14c3-promise-digest-continuity.test.ts:112
tests/bridge-p14c3-runtime.test.ts:160
tests/bridge-p14p3-directing-promises.test.ts:350
tests/bridge-p14p4p5-opportunities.test.ts:478
tests/bridge-p14r2r3-prior55.test.ts:144
tests/bridge-r3n4-read-model-deltas.test.ts:144,351
tests/bridge-schema.test.ts:340
```
`tests/bridge-owner-ux-projection20-migration.test.ts:65` pins `PROJECTION_VERSION` to **53** — a
historical-migration control (a frozen prior-schema check), deliberately not moving; excluded above.

**`RELATIONSHIP_RULES_VERSION`.** Does **not** move under slice B (slice A already moved it 1→2;
nothing in 1347-A/1347-F/the brief moves it again for romance/Rivals/Save44). The two existing pins
(`tests/p14b10-conflict-evidence.test.ts` and `tests/p14b5-relationships.test.ts`, both already
correctly at `2` per slice A) are unaffected and not listed as moving.

## Findings

**F1 (major — a standing, pre-existing regression, independent of slice A or slice B).** The root
type gate does **not** exit cleanly on the real repo's current HEAD (`c614b7e9`) even before any
slice A or slice B change. Verified by archiving `c614b7e9` alone into an isolated tree (no slice A,
no slice B) and running `tsc --noEmit -p tsconfig.json`: **exit 2, the identical 19 errors**, byte-
for-byte the same file/line/message set as the 19 non-`p14b10` errors on my full slice-a+slice-b
tree (confirmed by diffing the two error lists — identical). All 19 are the same shape:
`Argument/Type of type 'SaveFileV43' is not assignable to parameter/type of type 'SaveFileV42'`, in
17 files (`tests/contracts/v14-boundary-guards.contract.test.ts`,
`tests/helpers/p14c2b-fixtures.ts`, `tests/helpers/p14c3-canonical-rival-fixtures.ts`,
`tests/helpers/p14c4-fixtures.ts`, `tests/p06a-w1-release-authority.test.ts`,
`tests/p12-starting-world.test.ts`, `tests/p14b4-material-evidence-core.test.ts`,
`tests/p14c2rm-writer-continuation.test.ts`, `tests/p14c3-cohort-transition.test.ts`,
`tests/p14c3-dual-extensions.test.ts`, `tests/p14c3-offmenu-extensions.test.ts`,
`tests/p14c3-profession-history.test.ts`, `tests/p14c3-promise-digest-continuity.test.ts`,
`tests/p14p3-directing-promises.test.ts` x2, `tests/p14p4p5-opportunities.test.ts`,
`tests/p14p4p5-screenplay-status.test.ts`, `tests/save.test.ts` x2). This is a type-level instance of
the SAME "Save43 sweep fallout" the coordinator's own commit log already names as tracked
(`1344-L`). **This is a regression that remains even when my requested slice-B RED runs pass** — not
a slice-B defect, not something I fixed (out of my assigned scope), reported as instructed.

**F2 (major — a runtime instance of the same regression, discovered independently, blocking 2 of my
leaves).** `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17` hardcodes
`expect(saved.saveVersion).toBe(42)` inside `acceptedEvidence()`. `tests/helpers/
p14c3-cohort-transition-fixtures.ts`'s `cohortThreeFilms()` calls it (via `cohortSetup()`), and my
Bridge file's two Mentor leaves call `cohortThreeFilms()` — the SAME fixture slice A's own
`tests/p14b10-mentor-label.test.ts` already depends on. On the real repo's current HEAD (post-
shelving, `LIVE_SAVE_VERSION = 43`), `makeSave(state).saveVersion` is genuinely `43`, so this
hardcoded `42` pin throws before either of my Mentor leaves reaches its own Bridge-level assertion.
Verified this is pre-existing and unrelated to slice A: `git diff d447877 e95c211 -- tests/helpers/
p14c3-genuine-evidence-fixtures.ts tests/helpers/p14c3-cohort-transition-fixtures.ts` is empty (slice
A's patches never touch either file). **Consequence: slice A's own `tests/p14b10-mentor-label.test.ts`
would ALSO fail this way if re-run against the current real HEAD + slice A patches (rather than
slice A's own original, older BASE) — a standing regression outside this record's scope, reported
per the role's "state regressions that remain even when the requested test set passes" instruction.**
My two Mentor leaves' intended slice-B assertion (the Bridge-level "public" gate, 1347-A §6 item 8)
is UNEXERCISED as a result — classified `fails` with this exact cause named, not silently routed
around by forking a parallel fixture.

**F3 (fixture bugs found and fixed in this author's own new files, before handback).**
1. `tests/bridge-p14b10-relationship-labels.test.ts`'s `rosterWorld()` originally signed contracts
   for `termWeeks: 400`/advanced to week 400 — but `signContract`'s `termWeeks` is silently clamped
   to `TUNING.CONTRACT_MAX_WEEKS` (measured **208**) regardless of the requested value, so the
   contract had already naturally expired by week 400 and the "disclosed" counterpart was not
   actually on the roster. Found via a throwaway debug test (`tests/zzz-debug-roster.test.ts`,
   written, run, and deleted — never left in the patch) that printed the real employment record:
   `"termWeeks":208,"endedWeek":208` even though `1000` was requested. Fixed: advance to week 150
   (safely under 208) instead; narrowed the "closed bond" romance leaf's calendar offsets from
   `week-300/week-50` to `week-100/week-30` to fit under the new ceiling (immaterial to what that
   leaf tests — hand-staged calendar labels, not derived decay arithmetic).
2. Same file: `rosterWorld()` was un-memoized, so each of 12 leaves independently re-founded and
   re-advanced a fresh world — measured at **25-32s per leaf, ~275s for the whole file** in the
   first full run. Memoized (the `baseWorld`/`castingCompetitionWorld` house convention already used
   throughout this suite), bringing the non-Mentor leaves to **13.5s total**.
3. `tests/p14b10-romance.test.ts`'s "229-week note" leaf originally had no guard: with
   `ROMANCE_GRACE_WEEKS`/`ROMANCE_DECAY_WEEKS` both `undefined` at RED, the loop bound
   `undefined + undefined` is `NaN`, and `week <= NaN` is `false` from the first iteration — the
   loop body (and `currentRomanceValue`) never ran at all, producing a confusing
   `"expected -1 to be greater than 0"` instead of naming the real cause (a pitfall the brief warns
   against: "a test that fails at RED must fail on the requirement"). Fixed: added an explicit
   `typeof ROMANCE_GRACE_WEEKS === 'number'` guard before the loop; re-measured, now fails cleanly
   with `"expected 'undefined' to be 'number'"`.
4. Two unused-variable/import lint-level type errors (`tests/p14b10-competitions-log.test.ts:220`,
   `tests/p14b10-romance.test.ts` unused `CastSlot` import, `tests/p14b10-save-v44.test.ts` unused
   `GameState`/`RIVAL_R01` imports) — fixed so the root type gate's 29 remaining errors are exactly
   the 19 pre-existing (F1) plus the 10 intended RED-at-type-level ones, nothing else.

**F4 (evidence limit — 12 leaves genuinely not executed).** The 12 growth/formation/ending
romance leaves (`tests/p14b10-romance.test.ts`, describe blocks "growth ... eligibility", "growth ...
the eligible case", "formation", "ending") were **not run** before this handback, under the
coordinator's mid-task machine-load hold ("hold any further test run that takes more than about a
minute ... until the measurement ended"). Each of these leaves calls `baseWorld()`, whose one-time
`advanceTo(state, 400)` cost was not measured and could plausibly exceed the hold's threshold (the
Bridge file's OWN, now-fixed roster-advance cost, before memoization, measured 25-32s per call at
week 400 — a comparable order of magnitude). They are code-reviewed for correctness (the hand-
derivation section above; the fixture premises follow the same staged-edge/synthetic-production
convention already validated to work in the competitions-log and romance-pure-reads leaves) but
**reported honestly as NOT EXECUTED**, not claimed as RED. The two drift-exemption leaves in the
SAME file (which do not call `baseWorld()`) WERE run (24ms total) and are genuine, measured RED.

## Summary

DONE for the assigned RED, with two evidence limits named plainly: (1) the genuine-V43 migration
leaf cannot exercise `validateSaveV44`/`convertV43ToV44` until the parent runs the producer (its own
missing-fixture failure is the intended, explicit RED for that one leaf); (2) 12 growth/formation/
ending romance leaves are written and reviewed but not executed, under the machine-load hold. Every
other leaf (69 of 81) is measured, RED for its own attributable reason, with two pre-existing,
out-of-scope regressions (F1, F2) discovered and reported rather than routed around. Two structural
gaps in the Parent API (the write seam for romance growth/formation/ending, and the drift-exemption
read site) are named explicitly as this author's proposed, undecided inferences. The disputed
"does a partner's own bond block their own further growth" reading is named for the parent, not
resolved. No production code was touched; the real repo HEAD is unchanged
(`c614b7e9ed62dcb889118ba1eadb8a2bafa7934a`) at handback.

## Next action

The parent: (1) decides the disputed romance-eligibility reading and confirms or redirects the two
Proposed-API seams named above; (2) runs `1358-P-save43-producer.ts` once under the recorded-mint
discipline once the current machine-load measurement clears; (3) runs the 12 not-executed romance
leaves once a runtime budget for `baseWorld()`'s `advanceTo(400)` cost is available, and reports
their actual RED status; (4) separately tracks F1/F2 (both already partially covered by the existing
`1344-L` action item) — neither blocks this record's own RED, but both remain true regardless of
this record's outcome.
