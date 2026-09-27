# 1057-B — Independent fixed initial funding correction review

**KEEP1057-A as one fresh, fixed60M/+79M scenario.** Independently read and
hashed the frozen proposal
`3ef81dffe0be8acdf0bdee79b117188bd3eacd611bb7db1f434e4e563f898741`.
The original30M attempt is preserved in1028/1053/1054/1058 and published
checkpoint`a3c50a384dd0f686eee4d1e3ae6c78f8e82351c2`. This review changes
no gameplay law and establishes no successful continuation. No simulation,
compiler, producer, test/source edit or new input generation was executed.

## Independent cost check

The plan distinguishes actual3016 cash from the rounded3212 refusal correctly.
`employment.ts:80–85` rounds the displayed amount/postcommit balance. The
approximately−2.240M precommit balance therefore remains an approximation.
Adding30M to that failed scenario gives approximately27.760M at3212 **only if
the earlier accepted history repeats**. All nine leaves must establish that
history again under the new initial cash.

The remaining bound is supported by these inspected source facts:

- `worldgen.ts:168–174` and `tuning.ts:73–75` give salary base25,000,
  OVR coefficient150,000 and fame coefficient600,000. OVR100/fame100 is a
  conservative focus ceiling. `employment.ts:264–289` bounds the age factor
  by1 and applies annual3,52-week length1.08 and scarcity at most1.08.
  This yields maximum plain annual2,711,880 and1.25-premium annual3,389,850.
  The five actual new crew are signed immediately with fixed fame25, giving
  maximum plain annual743,580 each. Their contracted salaries do not grow
  when skills/fame subsequently change.
- `talentMarket.ts:207–254` can add a prior-termination salary floor, but
  this exact subject begins with no employment and the retained route expires
  its contracts naturally. The newly created crew have no earlier contracts.
  This route therefore does not hide an unbounded release floor above the
  offer envelope. No termination or compensating payment is introduced.
- `employment.ts:228` sums rounded annual/52 salaries; `tick.ts:953–977`
  charges the week being advanced, then expiry occurs. The phases are
 12+52+7+46=117 weeks. The table's maximum weekly payrolls65,189,52,152
  and14,300 respect that rounding. Existing702,780 gives13,515 weekly;
  base overhead15,000 and per employee1,500 are the published constants.
- Grand Ballroom costs880,000 (`tuning.ts:1788`). The explicit new legacy
  picture uses an unchanged original concept and its base negative budget;
  generated concept cost is capped at9M (`worldgen.ts:625`,
  `tuning.ts:2046`). The plan's inspected input cost is below this ceiling,
  so its smaller3.144M figure is not needed for the bound. With every named
  participant actually contracted, `actions.ts:415–457` charges the negative
  budget and zero marketing without an extra freelance salary. The source's
  Full Custom creation has no separate charge (`actions.ts:943–974`).
- The unchanged route builds no placed facility. The plan's inspected empty
  initial placement means no operational-facility charge under
  `placement.ts:401`/`tick.ts:984`. Standing set wear does not introduce a
  separate weekly payment. Neither set-strike refund nor future film revenue
  is credited to the envelope.

Independent arithmetic confirms the eight rows:
360,180 +610,173 +4,247,828 +105,000 +1,157,358 +6,791,992 +880,000
+9,000,000 = **23,152,531**. Against the conditional, rounded27,760,247
at3212 this leaves approximately **4,607,716**, consistent with the stated
4.608M margin. The estimate deliberately holds all six later hires for the
full46 weeks through3329. The public submission affordability check does not
itself debit the proposed bonus, so the later actual renewal bonus is counted
once rather than charged again at3212.

## Required correction boundary

The narrow change is acceptable: recreate the same strict historical input,
perform the same current migration, and replace only the original initial
cash/one ledger suffix with60M/+79M at2600. Preserve canonical equality of the
rest of the input and actual whole38 acceptance. Change the corresponding J1
title, explicit financial literals and metadata/comment truthfully. Record new
canonical hashes and source hashes; retain every original run and hash.

Keep all nine behavioral requirements, subject/crew inputs, timings, offers,
settlement price joins, old cohort negative, actual Director work and final
cohort/reload assertions unchanged. Run the complete nine-leaf scenario fresh,
with the same absolute729-call budget and failure caching. The four original
passes cannot be relabelled as passes for this newly funded scenario. Neither
this cost calculation nor KEEP promises a particular market winner, notice,
capability, current validation result or release date. A future failure remains
a failure; this proposal authorizes no adaptive increase, midway top-up,
restoration of the failed3212 state, rescue action or production edit.

This is ready for the parent's bounded source release and independent final
diff review. Actual corrected source, execution and qualification remain
pending.

## Frozen correction source — KEEP

Independently read the complete two-file Git diff and measured the actual
source file hashes at exact
HEAD`a3c50a384dd0f686eee4d1e3ae6c78f8e82351c2`:

- `tests/helpers/p14c3-cohort-transition-fixtures.ts`:
  `d725ef1e9f64968799f6dbca639e120021856f8da7dfd0e38ec83d5e9be74070`.
- `tests/p14c3-cohort-transition.test.ts`:
  `6eb360074eeda2af33ee59a68ff724b421f493468c9e56dc8fbfbec2653c17f5`.
- Author/parent incremental patch:
  `4c97ceb120f6e381269cf257b79350fa78d1a8cee6e690f616cb93b1086a4516`,
  3,642 bytes. This reviewer measured the consumed file hashes and read the
  full diff; no separate patch was regenerated.

Only the single initial cash60M, matching ledger+79M, captured metadata,
corresponding J1 financial literals/title, and one comment preserving the
original failure changed. The disclosed bootstrap ledger wording remains
explicitly unearned and initial-only. Complete nonfinancial canonical equality,
whole38 acceptance, all later assertions/controls, participant inputs, dates,
offers, cache behavior and absolute729-call ceiling remain unchanged.

**KEEP for the fresh all-nine observation.** No gameplay or compiler was run
by this reviewer. The future1030 result remains pending, and the original1028
failure and1029 root type result continue to describe their original source.

## 1030 actual fresh scenario — final bounded KEEP

Read the complete1030 raw log and JSON recorder. The fresh all-nine run passed
with child0, `fixedSource:true`, exact
HEAD`a3c50a384dd0f686eee4d1e3ae6c78f8e82351c2` and incremental patch
`4c97ceb120f6e381269cf257b79350fa78d1a8cee6e690f616cb93b1086a4516`
unchanged at start/end. Recorded time was2026-09-27T00:34:28.252Z→
00:36:07.733Z, **99.481 seconds**. Every J1–J9 leaf passed in this fresh
scenario, using exactly729 counted normal ticks to3329.

| Actually reached boundary | Recorded result and passed proof |
| --- | --- |
| Initial input | Original untouched canonical hash remains`24b0919406932bde690558b775d568a20eb477d51604984bde5915f829994d92`; new funded hash is`4df53fcc8db61efbc9f7a11e9c5891ca150c18b48632e7cca94b6694418c18d2`. Actual−19M→60M/+79M initial-only arrangement and unchanged nonfinancial state passed J1 again. |
| Three real Actor pictures | Takes2613/2622/2631, releases2616/2625/2634, returned states2617/2626/2635. Each used nine release-loop calls. Actual public work, Writer/Director context and independent P10/witness recount passed. |
| All three ordinary renewals | Actual2808 and3016 contracts each annual702,780/bonus126,500; resulting cash40,012,806.848364264 and33,643,186.848364264. Actual3224 contract annual843,336/bonus151,800, end3276; resulting cash27,248,266.848364264. All nine-run decision-week price, employment, payment, case and retained-history oracles passed. |
| Notice and unoffered extension | Actual hard70 announcement3231, E3283, case3271/D3276, and unchanged public59-week draft were proved. No proposal was submitted; actual case/contract expiry3276 and the seven-week cap refusal passed. This remains an unoffered descriptor witness, not a settled59-week extension. |
| Cohort-born profession change | Actual3283 Actor retirement and Director choice at71 after683 calls. J7 passed whole38, exact inputs/evaluation/change link, original832 Actor receipt preservation, inclusive dated profession, the detached original-profession mismatch negative, and strict genuine35/37 controls. |
| New profession work | Actual reopened3283 became the continued branch; new contemporaries were publicly created/hired. Focus Director picture`prod-3291` took3296, released3299 and returned3300 with real Writer`authored-0005`, within the32-call limit. J8 passed old Actor admission refusal, one new directing work/event/proven record and preserved acting/choice facts. |
| Current cohort and final reload | Actual3328 requested Actor0/Director1/Writer0/Craft0, clipped0, one entrant. Independent active counts were41/16/18/14; focus contributed exactly one Director and zero Actors. The next-year youth floor can request one despite the raw Director count exceeding14. Actual prefix/entrant proof and3328 reload→3329 continuation passed; final729 calls include every phase and reload continuation. |

**Final KEEP for this bounded, explicitly funded cohort-born player transition
and later work witness.** No production correction was needed; the only source
change was the separately disclosed initial funding scenario. The complete
fresh pass does not erase1028's original underfunded four-PASS/five-cached-FAIL
result, its612 calls, or the unchanged1029 type record. No new typecheck is
claimed for the literal/comment-only correction; its full final-candidate type
gate remains part of the parent's later verification sequence.

This run does not prove a post-cutover-born person's later transition,
canonical starting-rival authored-history continuation, rival new-role work,
dormant-retired compatibility, projection53, current runtime storage or full
C.3 completion. Those remaining obligations are separate from this KEEP.
