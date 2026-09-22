# Record 679 — P14B.5: the §8 :645 week-260 relationship measurement

Status: measurement record. Not Owner acceptance, not a balance judgement, not a century-scale,
native or performance result. Authority: record 675 "Next (bounded)" NEXT675 (1); P14 plan B.5
expansion scope (9) ("the measured edge and driver counts on the standard seeds at week 260 … are T4
evidence items"); companion §8 :645; the Owner packet of 2026-09-22. Independent review:
`678-C-week260-review.md`, verdict QUALIFIED WITH RECORD-ONLY ITEMS, D1–D5 and REFINE 1–5 applied
here and in `676-P` revision 2.

## Identity

- Source: `ddf58e87` (= remote `ddf58e873d72b01cc91b00e910d9cfe8a8e03ba8`), tree clean at start.
- Harness: `676-b5-week260-probe.ts`, authored by test-author under `676-T-week260-probe-brief.md`;
  handback `676-T-report.md`. Run 677 executed sha256 `4e7438d4…`. After 678-C D2/D5 two FALSE
  COMMENTS in that file were corrected (comments only, 7 removed / 17 added, all inside comment
  blocks; reversing them reproduces `4e7438d4…` byte for byte), giving sha256 `198337d7…`, which run
  682 executed. **682 reproduces every measured line of 677 exactly**; only the printed self-sha and
  the elapsed milliseconds differ. Both runs stand; 682 is the authoritative one because its harness
  text is true.
- Runs: `677-week260-measurement.*` and `682-week260-corrected-harness.*`, both exit 0,
  `fixedSource: true`, `testedDiffSha256` = the empty-diff hash `e3b0c442…` with `untrackedSource: []`
  at both ends. The harness lives under `docs/`, so no file under `src/`, `bridge/`, `tests/`,
  `generated/`, `ui/`, `scripts/` or any config was touched or added for either run.
- Witness: `681-b5-closeness-floor-witness.ts`, sha256 `1cc77f71…`, run
  `681-closeness-floor-witness.*`, exit 0, `fixedSource: true`. A CONSTRUCTED WORST CASE with no seed
  and no campaign, staging disclosed in its own header.
- Environment: node v20.20.2, darwin x64. 17.2 s for the four seeds; the witness is sub-second.
- Worlds: the four recorded standard seeds of `654-T-ledger.md` §B, each built by
  `p13aGeneratedStudio(seed)` and advanced by `tick` ONE WEEK AT A TIME to 260. No player action
  DURING the 260 ticks; the fixture bootstrap is named (678-C D5): `generateWorld(seed)`,
  `economyEngagedEver: true`, one `activateStudioOperations`, `initializeHollywood(…, 'fresh')`
  (`src/harness/p13a/fixtures.ts:9-12`). No staged edge, no fixture load, no save read. Every tier
  read goes through the real `currentTier`; the probe re-implements no band or drift arithmetic.
- **Drift coverage is PARTIAL (678-C D2).** A completed return needs
  `RELATIONSHIP_DRIFT_GRACE_WEEKS + RELATIONSHIP_DRIFT_RETURN_WEEKS` = 312 dormant weeks. The first
  edge mints at week 8 or 9, so the most any edge reaches by week 260 is `span = min(252−52, 260)`
  = 200, about 77% of one return. No campaign in this run completed a drift return. An earlier draft
  of this record and of the harness claimed the whole drift window sat inside the run; that was false
  and is corrected here and in the harness.
- Lawfulness of the measured worlds: `requireRelationshipsRoot`, `validateRelationshipsRoot` and
  `makeSave` all succeed on all four final states. Proven lawful, not assumed lawful.

## Measured (weeks 1..260 observed on every seed; 677 and 682 agree exactly)

| seed | edges@260 | drivers derived / observed / distinct keys | retained | folded | P / S / F / C | max P on one edge |
|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 27 | 675 / 675 / 675 | 195 | 480 | 300 / 18 / 84 / 0 | 17 |
| seed-b | 27 | 1341 / 1341 / 1341 | 195 | 1146 | 588 / 24 / 168 / 0 | 27 |
| p13b-s8-bridge-probe-01 | 36 | 1452 / 1452 / 1452 | 246 | 1206 | 672 / 72 / 72 / 0 | 28 |
| p13-public-commercial-adoption | 24 | 1080 / 1080 / 1080 | 192 | 888 | 516 / 30 / 42 / 0 | 28 |

P/S/F/C = `sharedProductions` / `sharedSuccesses` / `sharedFailures` / `sharedCancellations`.
Derived = Σ `sharedProductions + max(0, sharedProductions − 1) + successes + failures + cancels`
(`repeatedCollaboration` carries no counter but fires exactly once per take from the second onward).
Observed = the independent week-by-week count of `recent` entries stamped that week. The two agree on
every seed, and 678-C recomputed all four. Distinct `edgeId|kind|ref` mint keys equal the totals on
every seed, so idempotency held for 4,548 drivers across 1,040 advanced weeks. No edge took
`RELATIONSHIP_RECENT_CAP` drivers inside one week, so the observed count is not a fold undercount.
Retained decomposes exactly against the cap (678-C Q3): 24·8+3, 24·8+3, 30·8+6, 24·8.

| seed | tiers @260 (drift-aware) | first edge | first Inseparable read | Strained ever | min closeness ever |
|---|---|---|---|---|---|
| p13a-core-causal-01 | Acq 3, Fri 1, CF 12, Ins 11 | w8 | w40 | **no** | 48 @ w13 |
| seed-b | Acq 2, Col 1, Ins 24 | w9 | w45 | **no** | 48 @ w13 |
| p13b-s8-bridge-probe-01 | Acq 4, Col 2, Fri 1, CF 2, Ins 27 | w9 | w36 | **no** | 48 @ w220 |
| p13-public-commercial-adoption | Ins 24 | w9 | w45 | **no** | 52 @ w9 |

Tiers ever read, on all four seeds: Acquaintances, Colleagues, Friends, CloseFriends, Inseparable.
Never read anywhere: Strained, Enemies, Nemeses. Partial drift changes the reading on ONE seed of
four: p13a-core-causal-01 reads 13 of 24 stored-Inseparable edges down to CloseFriends or Friends at
260; on the other three every edge had an event inside the 52-week grace window and the drifted and
stored histograms are identical.

| seed | root bytes | save bytes | save with root emptied | root marginal | gzip-9 save | gzip-9 root marginal |
|---|---|---|---|---|---|---|
| p13a-core-causal-01 | 24,900 | 1,211,649 | 1,186,751 | 24,898 | 126,359 | 985 |
| seed-b | 25,080 | 1,869,955 | 1,844,877 | 25,078 | 185,492 | 957 |
| p13b-s8-bridge-probe-01 | 32,206 | 2,088,864 | 2,056,660 | 32,204 | 212,069 | 1,266 |
| p13-public-commercial-adoption | 23,847 | 1,715,875 | 1,692,030 | 23,845 | 173,494 | 823 |

895 to 994 uncompressed bytes per edge; the root is 1.34–2.06% of the uncompressed save and
0.47–0.78% of the gzip-9 save at week 260. The last column is the MARGINAL gzip cost (the difference
of two gzip sizes), not the root compressed alone. Per-edge size is bounded by construction (fixed
fields plus at most `RELATIONSHIP_RECENT_CAP` drivers), so the root grows with EDGE COUNT alone.
Nothing here clears the §8 R25 bounds: those are measured on the endurance fixture against the
journal, checkpoint and library limits, and that run has not happened. 260 weeks is not 6,240.

## Reconciliation of the release drivers (arithmetic, not a measurement)

`seatPairs` always returns six pairs and every pair of a take takes the `sharedProduction` credit, so
each counter is six times a production count. Every counter on every seed divides by six.

| seed | shared takes | hits (≥60) | flops (<40) | minted no release driver |
|---|---|---|---|---|
| p13a-core-causal-01 | 50 | 3 | 14 | 33 |
| seed-b | 98 | 4 | 28 | 66 |
| p13b-s8-bridge-probe-01 | 112 | 12 | 12 | 88 |
| p13-public-commercial-adoption | 86 | 5 | 7 | 74 |

Two thirds to four fifths of shared pictures mint no release driver at all. The probe reads no
`criticScore`, so this is a bound, not an attribution (678-C REFINE 2): the ready-project loop opened
at `hollywoodTick.ts:160` breaks at `:161` while `b.productions.length !== 0`, so a rival holds at
most one picture in flight and at most four are in flight at week 260 on these seeds. At least 29 of
p13a's 33 therefore landed in the neutral critic band [40, 60), which mints nothing by design (plan
scope (2b), :440-441 "above a threshold"). Both arms of the release delta are wired
(`tick.ts:1117-1120` feeds the player's `records` and every rival's `industry.growth`); whether
`industry.growth` enumerates every rival release is `hollywoodTick.ts`'s own invariant and was not
re-derived here.

## Findings

1. **Strained never occurred, and the floor is 45 — measured.** 4,548 drivers including 366 flop
   drivers across four campaigns, and the lowest closeness ever read was 48. `681` drives the real
   `advanceRelationshipsWeek` over a constructed worst case and lands **45** (52 mint → 50 after a
   completed 313-week return → 46 → 49 → 45), with `currentTier` reading `Acquaintances` because 45
   IS `RELATIONSHIP_TIER_FLOOR.Acquaintances`. Six further cycles show 45 is a fixed point. The floor
   sits exactly on the band boundary, one point above the Strained ceiling of 44.
   `676-P-reachability-analysis.md` revision 2 argues from source why nothing goes lower: drift never
   passes the baseline; every driver materializes drift first; a negative driver only lands on an edge
   that production already credited; the greenlight refuses busy talent and recomputes `busy` on every
   call including queue admissions (`actions.ts:284-286,:337-339`); and a shelved ready picture keeps
   its quartet busy, so no edge carries two pending penalties across a drift window. 678-C Q5 attacked
   that bound independently and found no route past it. It remains an argument plus one attainability
   witness, not a proof that 45 is the global minimum of every lawful sequence.
2. **Record 675 item 1 and 672-R finding 1 reached the right conclusion by an incomplete route, and
   so did this record's first draft.** 675 derives the floor from the flop trajectory alone and omits
   drift; its 47 is correct only for a release inside the grace window. The first draft of `676-P`
   then said 46, which 678-C D1 demonstrated was also wrong. The floor is **45** and the margin to the
   Strained band is **one** point. The conclusion is unchanged throughout.
3. **The dial is one step away.** Once the repeat accelerator caps, one production cycle nets
   `RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP − RELATIONSHIP_FAILURE_DELTA` = `5 − F`.
   `681` step 7, labelled HYPOTHETICAL ARITHMETIC with no `src/` constant changed: F=4 (shipped)
   reaches 45 and never enters Strained; F=5 reaches 42; F=6 reaches 34; F=7 reaches 26. At F=5 the
   cycle breaks even, at F≥6 a repeatedly failing pair declines without bound. The landed value sits
   one step below the threshold.
4. **The upper half saturates, and the cause is repetition on a near-fixed roster.**
   `hollywoodStartingData.ts:46` gives a rival one director, three actors and one craft worker, and
   `hollywoodTick.ts:160-169` picks `employees.find(director)` with the first three idle actors, so
   WHILE A ROSTER IS UNCHANGED its pictures re-seat the same quartet. The stronger claim that every
   rival picture EVER seats the identical quartet is refuted by this run (678-C D3): edge counts are
   27, 27, 36, 24 rather than a fixed 24, because `hollywoodTick.ts:129-138` replaces an unavailable
   role-holder, `:167-170` puts promised people into the triple first, and `:182` takes
   `candidate.cast` from the package chooser. `maxSharedProductionsOnOneEdge` of 17 to 28 and
   `p13-public-commercial-adoption` reading 24 of 24 edges Inseparable at 260 carry the supported
   claim. This confirms 658-W's week-207 observation at the full horizon and gives it a cause.
5. **Edge count grows only with roster churn.** The excess over the six-pairs-per-quartet base is
   cross-studio pairs such as `…-r03-4` with `…-r04-1`, which appear when the talent market moves
   someone between rival rosters. That 24 is four producing rivals × six pairs is an INFERENCE: the
   probe reports no rival count (678-C REFINE 1).
6. **Idempotency held, including past the fold.** `advanceRelationshipsWeek` documents idempotency by
   `(edgeId, kind, ref)` but enforces it by scanning `recent`, which holds at most 8 entries. The
   probe keeps an unbounded mint-key set precisely to catch a driver re-minted after its entry folded
   out; zero duplicates on all four seeds. This found no counterexample to record 675 item 3's
   "unreachable today", for this horizon and this seed set.
7. **Drift is exercised on one seed of four, and never to completion.** Any B.6 consumer tested only
   on the busy seeds will never exercise the drift path. `p13a-core-causal-01` is the seed that does.

## Limits

The probe cannot establish impossibility; four seeded campaigns are a sample of the reachable world.
`sharedCancellations` is 0 on every seed necessarily: the cancel driver is reachable only through the
player cancel verb and the brief forbade player action, so it is UNMEASURED, not measured-as-zero.
Nemeses and Enemies cannot be READ at all today under RULES 1 whatever the value, because B.5 mints
no conflict record (`relationships.ts:131-134`). `681` is a constructed worst case using a partial
object cast to `GameState` carrying the fields the seam reads plus `talent`, `market.tick` and
`studioHistory.recordingStartedWeek`; its header says so, and it shows 45 is ATTAINABLE, not that it
is the global minimum. The plan's endurance scenario is not covered. No test suite ran; a green probe
is not acceptance, and nothing here is native, visual or a performance result.

## Corrections this record makes

- Record 675 item 1 / 672-R finding 1: the floor is 45, not 47 (finding 2). The conclusion is
  unchanged.
- This record's own first draft and `676-P` revision 1: the floor is 45, not 46; the drift window is
  NOT fully inside the 260-week run; and the rival-quartet claim is weakened to "while a roster is
  unchanged". Two citations are corrected: the rival production cap is `hollywoodTick.ts:161` (a
  `break` in the loop opened at `:160`), and `activeProductionCompanyTalentIds`
  (`employment.ts:125-127`) takes the state, delegating to `productionCompanyTalentIds`
  (`productionPeople.ts:4-14`).
- The fixture bootstrap is now named rather than described as "no player action of any kind".
- Record 675 item 2 (the §8 :645 measurement outstanding) is DISCHARGED by 677/682 for the standard
  seed set at week 260. The endurance-scenario half of plan scope (9) remains outstanding.
