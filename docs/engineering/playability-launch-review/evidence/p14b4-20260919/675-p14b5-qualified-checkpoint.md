# Record 675 — P14B.5 First Shared-Work Bond Core: QUALIFIED WITH RECORD-ONLY ITEMS (672-R)

Status: engineering checkpoint, qualified by the independent contract-auditor review 672-R
(`672-R-b5-final-review.md`). Not Owner acceptance. LOGIC VERIFIED · UNITY NOT VERIFIED: nothing
native, nothing visual, no playtest. Authority: the inserted expansion P14 plan :725-781; records
653 (insertion + T1 release) and 657 (RED review + writer release); Owner ruling record 600 step 7.

## Identity

- Production candidate `040651b4` = five bisectable 658-W commits, each tree byte-equal to the
  writer's cumulative patch: `82c259a0` S1 core, `dc60dc99` S2 chooser, `f5310afb` S3 Save V31,
  `c3f916a7` S4 load/runtime, `040651b4` S5 projection 48.
- Test-side: `8e03ff97` (662-T2/662-T2b values-only sweep, 121 files) and `5f116403` (668-T3 strip
  class, 5 files). Final verified source: `5f116403`.
- New identities: `LIVE_SAVE_VERSION 31`; `PROJECTION_VERSION 48`; schema
  `sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec`; outgoing
  `sha256:6f6b4880…` registered as `projection-v47` (36 prior ids); `PROMISE_RULES_VERSION 4`
  unchanged.

## The landed law (672-R Q1, re-derived from source)

`src/core/relationships.ts`: the `relationships` root beside the other top-level roots; ONE tail
seam `advanceRelationshipsWeek` between `appendFirstTakes` and `advancePromisesWeek`, fed this
advance's take entries and `FilmResult`s (a true delta, never a root scan), stamping
`state.market.tick`, returning the same reference on an empty delta before the root guard; the
cancel seam beside `breakPromisesOnCancel`; the I2 precision — a release or cancel driver applies
only to an existing edge whose `firstSharedWeek <= take.week` and never creates one, so
`sharedSuccesses + sharedFailures <= sharedProductions` holds by construction and the validator
enforces it; drift-on-read on the ruled integer scale (baseline 50, named tier floors, never past
baseline); fold-by-count at 8 with counters and `peakTier`; `pairChemistry` exported with no
consumer; no RNG on any relationship path; the recording boundary and the century bound; the root
validator and `projectRelationshipsPreV31`. `src/core/talentMarket.ts`: the D5 descriptor fifth in
the order with the audited roster-at-W predicate (`startWeek < W && (endedWeek === null || W <
endedWeek)`, subject excluded) shared by the band and the reservation; exactly ONE new settlement
reason ("their roster holds this person's close ties") and ONE new drop sentence, neither carrying
a digit, person id or tier name; `nemesisOnRoster` enumerated and unreachable by rule.
`src/core/save.ts`: `stripV31Root` + `validateSaveV31` (validate own root, strip, delegate) exactly
symmetric with the V29/V30 precedent; `convertV30ToV31` opens the root EMPTY with nothing
recomputed; `convertV31ToV30` asks `projectRelationshipsPreV31` BEFORE validating and refuses any
world holding an edge; `migrateToV31` is the live load route everywhere. Wire (thin): the closed
`priorityOrder` enum gains `relationships` with its label; the `line` value cannot move; the
generator ran once. No OPEN item decided; nothing on the frozen (12) list touched.

## Evidence (record-check, serialized, fixedSource true throughout)

| # | On | Result |
|---|---|---|
| 655 / 656 | `8708d6a9` (unchanged source) | RED baseline 37 failed / 35 passed; typecheck EXIT 2 with exactly the 8 expected errors |
| 659 / 660 / 661 | `040651b4` | RED 12 failed / 106 passed (sweep-class + 3 RED-side amendments); typecheck EXIT 2, all 161 errors under `tests/`; generator checks EXIT 0 |
| 663 / 664 | `8e03ff97` | RED 118/118; typecheck + typecheck:bridge + check:bridge-contract + fixtures EXIT 0 |
| 665 / 666 / 667 | `8e03ff97` | controls 1 failed / 323 passed (the strip item); FULL CORE 14 files / 32 failed — five NEW files, 8 failures, all one class; FULL UI 9 files / 26 failed vs the 643 baseline's 28 |
| 669 / 670 / 671 | `5f116403` | FULL CORE 9 files / 24 failed / 3932 passed / 8 todo — the 636 baseline set EXACTLY (same nine files, same per-file counts: 22 inherited since `89b5ad2` + 2 designated); typechecks + generator EXIT 0; the 24 natural-chain controls 324 passed / 4 todo, none moved |
| 673 | final source | FULL UI 8 files / 26 failed / 2659 passed / 5 skipped — at or below the 643 baseline (28), the same failure family; `WorldInspectorDefault` 10 and `livingTurn.parity` absent this run (load-dependent per 643-C) |
| 674 | final source | `npm run test:bridge` (the literal command: both generator checks then every `tests/bridge*` file) EXIT 1 with exactly the two inherited files — `bridge-p12-campaign-library` 11, `bridge-p13-campaign-isolation` 1 = the 12 inherited timeouts; 812 passed / 2 todo |

Reconciliation (672-R Q4, corrected): 636 → 669 is **+119 passing** (3813 → 3932; totals 3845 →
3964) = 118 new RED tests + 1 `it.each` case from the 35 → 36 prior-id registry
(`tests/bridge-runtime-checkpoint.test.ts:758`). The "+141 passing" in commit `df693294`'s message
is WRONG and is corrected here; the commit's other figures stand. 666 → 669 reconciles exactly:
same 3964 total, 32 → 24 failures, no test added or removed by the strip-class repair.

## The two designated test-side classes (zero writer defects)

- 662-T2/662-T2b: the values-only 30→31 / 47→48 sweep over 121 files (live builder/route/version
  pins, the sentinel, the seven-member `priorityOrder` arrays, 36 prior ids, the schema identity,
  the eight UI pins), every frozen-corpus validator left on its own frozen reader, 19 boundary
  files re-expressed with their invariants kept. The first agent died mid-sweep (API 529); the
  parent hashed its working tree (`e2c8f631`) and the continuation audited the blanket sweep
  before finishing (final patch `8ed90a18`). Two measured RED-side premises corrected: B4 (the
  hiring-market epoch boundary at 208 — pick an actor listed at both 207 and 208) and B5 (the
  DECLINED control reads `caseDisclosure`'s own `settlementReasons`, which publishes from the
  latest SETTLED receipt only). Neither decides an OPEN item.
- 668-T3: the strip class — an older frozen validator handed a LIVE state that now carries the new
  root. Eight premises re-expressed, none weakened: the forged-older-version chain gains
  "assert empty, then delete" (facility-move-demolish, p13b-r07-save-v25); the projection20
  migration destructures the new root AND pins it empty (strictly stronger); bridge-p13b-r07-setup
  takes the plain 30→31 value; `p14b1-first-take` moves UP to the live validator because the take
  it asserts genuinely mints edges and `convertV31ToV30` lawfully refuses such a world (a runtime
  premise records that fact). 668-B and 672-R both re-derived the production chain as COMPLETE: no
  load, save or checkpoint route can hand a live state to a pre-V31 validator.

## Owner-visible behaviour (672-R Q5)

Offers from a studio whose roster already holds this person's close collaborators now rank higher
(the fifth descriptor), and when that band strictly beats every other survivor the settlement
receipt gains exactly one sentence. The save is V31 and the projection 48; the `priorityOrder` wire
array has seven members. Bonds are minted only from this week's shared first takes, release
success/failure and the player's cancel-after-take; they drift toward baseline on read; NO read
model shows them in B.5 (no profile block, no drivers text, no chemistry row, no warning).
Unchanged: every existing reason, drop and tie sentence; the published `preferences.line`; trust,
the promise law, the cancel proof, seating, the settlement order; `rngState`.

## Record-only and carried to the Owner (nothing adopted)

1. **Negative tiers have no natural producer under the landed constants** (672-R finding 1, paper
   arithmetic): a low-proximity edge starts at 52 and the flop trajectory bottoms at 47, while
   Strained needs < 45. The code implements the named hypotheses and the one pinned relation
   (`FAILURE_DELTA > PROXIMITY_LOW`) holds; the only Strained witness is the staged edge in the
   RED. With 658-W's measurement that rival fixed teams saturate at closeness 100 by ~week 207,
   the landed constants are asymmetric: positive saturates, negative cannot fire. A hypothesis-value
   question for the Owner/Fable, not a defect.
2. The §8 :645 measurement (week-260 edge/driver counts; is Strained ever read on the standard
   seeds) is outstanding and was not in this evidence.
3. Idempotency by `(edgeId, kind, ref)` is enforced over the `recent` window (≤ 8 drivers);
   unreachable today, degrades only if a driver folds out before a duplicate delta arrives.
4. Cost (PERF-010): per-week work is O(existing edges) on a non-empty delta, plus O(`firstTakes`)
   per release/cancel and O(edges) per proposal in `bandsFor`. No population or weekly pair scan.
5. OPEN 1–3 (Q2 base rate / Q3 no backfill / Q4 warning-not-refusal) and 11, 15 stay open on the
   companion's "recommended first behavior, not an approval" footing. OPEN 11's landed precedence
   is scope (5)'s literal sentence and its branch is unreachable.
6. Plan text corrected here: the churn reads "cases open at 404 and settle at 416". 657-B REFINE
   (a)/(b) are closed by 662-T2b. 668-B's frozen-builder PARTIAL is carried as recorded.
7. Owner items still open from earlier slices: 628 R5 / G-1(A) / G-2; 637 cancel attribution.

## Next (bounded)

NEXT675: (1) the §8 :645 measurement (test-author probe: week-260 edge/driver counts per seed, the
tier histogram, whether Strained is ever read) recorded beside this checkpoint; (2) the B.5 OPEN
items and the negative-tier asymmetry to the Owner as one expansion-review packet — nothing
adopted; (3) then P14B.6 read models (the companion §5 surfaces B.5 deliberately excluded: profile
block, drivers text, chemistry row, casting warning) or the waiver slice, whichever the Owner's
answer selects. Evaluator 5 later (D2 (i-c)). Unity/native deferred; the backlog entry for the
landed identities is written with this record.
