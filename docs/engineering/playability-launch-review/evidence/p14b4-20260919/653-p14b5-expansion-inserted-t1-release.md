# Record 653 — P14B.5 expansion audited and inserted; T1 RED released

Status: engineering record (not Owner acceptance). Authority: record 645 NEXT645 (2)–(3); P14 plan
:407-414 ("expansion written before it begins … audit before it begins … RED-before-implementation");
Owner ruling record 600 step 7.

## What is inserted

`docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md` gains the section
"## P14B.5 — First Shared-Work Bond Core — task expansion (draft 2026-09-21, audited 647-B
2026-09-22; audit applied)" — the 647-A draft (sim-core, READ-ONLY; `647-A-p14b5-expansion-draft.md`)
with every 647-B disposition applied by 647-A2 (`647-A2-p14b5-expansion-final.md`, change log
`647-A2-change-log.md`: 36 applied / 0 refused / 0 source disagreements), followed by the parent's
rulings on the drafter's notes.

## 647-B (contract-auditor, READ-ONLY; `647-B-p14b5-expansion-audit.md`) — INSERT WITH DISPOSITIONS

DEMONSTRATED on paper and applied: D1 the roster-at-W predicate — `finishHollywoodWeek` closes rows
with `endWeekExclusive <= W` at the tail and a same-pass commit writes `startWeek === W`, so a
`startWeek <= W` roster is array-order dependent at the synchronized churn (208/404); ruled to
`startWeek < W && (endedWeek === null || W < endedWeek)`, subject excluded, shared by D5 and
`nemesisOnRoster`; consequence: the churn receipts are NOT the exposed natural-chain set, off-cycle
rows are, and the test-author measures instead of assuming. D2 OPEN 5 (negative reachability) ruled
(ii): `RELATIONSHIP_FAILURE_DELTA > RELATIONSHIP_PROXIMITY_LOW` so the release-failure driver can
net negative — Strained and `pairChemistry.sign = −1` are reachable; Enemies/Nemeses,
`enemies here` and `nemesisOnRoster` stay unreachable BY RULE (no conflict record is minted; the
conflict driver is deferred on S25) and are pinned so; family 4's baseline pin replaced. D3 the sweep
sites gain `tests/p14b4-cast-class-policy.test.ts:30-31/:52` and the natural-chain inventory gains
the `p14b2-fixtures` consumers with `poachingFixture` (:145-211; reasons pin :200-201) pre-declared.
REFINE applied: R1 tail-week stamping (`state.market.tick`) for every tail-minted driver; R2 the
R-D5-SETTLE receipt facts restated for ≥ 3 survivors (bands recomputed at W; the D5 sentence iff the
winner's band exceeds every other survivor's); R3 mint from the advance's delta; R4 synthetic
validator refusals in the synthetic file; R5 T2 only after T1's RED is recorded, sweep ownership
split (test pins → test-author; src/bridge/adapter pins → writer); R6 exclusion-list additions
(tier-transition permanence, hot/cold index split, per-driver decay, the writer seat); R7 family 1's
headless source named, family 6 constructed under D1. OPEN rulings folded with "(647-B ruling)"
markers: 4 scale (integer 0–100, baseline 50, named tier edges), 6 fold-by-count, 7 the roster
predicate, 8 eight-member friendship ladder, 9 `criticScore`, 10 tail seam, 12
`studioHistory.recordingStartedWeek`; 13 moved to EXCLUDED; 14(a) a T2 comment edit; 16 constants as
named hypotheses. STAYS OPEN: 1 Q2 base rate, 2 Q3 no backfill, 3 Q4 warning not refusal (the
companion's own "recommended first behavior, not an approval" footing; B.1 precedent plan :518),
11 D5 precedence (unreachable), 15 the waiver's V31 field. Nothing is Owner-approved.

## Parent rulings on the drafter's notes (647-A2)

(2) `poachingFixture` is the export name — accepted. (4) Family 9's one-edge migration-refusal case
stays in the synthetic file with family 10 (the B4 plan :391-393 rule applies to every
reader-admitted synthetic variant). (5) Inserted at HEAD after `107db93e`; no source file changed
since `d6c11b9b` (T0 producer bytes; `651fea8b` comment-only since `61833f0d`).

## T1 RED — released to the test-author (one specialist; owns the test process)

Three files per the expansion's Tests paragraph: the synthetic/engine RED (families 1–8 and 10, plus
the family-9 one-edge refusal), the frozen-save/migration RED (family 9 on the genuine V30 corpus
and the V29/V28 corpora), and the bridge RED (families 11–12, RED-by-value on the closed
`priorityOrder` enum and the D5 reason). Imports from the absent `src/core/relationships.ts` (the
memory rule: vite binds missing named exports to undefined — every case asserts the export exists
first or fails at import, never passes spuriously). The R-D5 pre-declaration with the churn/off-cycle
prediction, `poachingFixture` and its consumers, and the D3 controlled case are the test-author's
measured ledger, not the drafter's paper. V31/48 literals are NOT allocated by the RED (allocation at
T2 execution); the RED pins the OUTGOING identities (V30, projection 47, `sha256:6f6b4880…`, the 35
prior ids) as the frozen side. No production file, fixture, cap, tariff or timeout is touched.

## Next

NEXT653: T1 RED (test-author) → record-check baseline on unchanged source → 653-B review of the RED
against the inserted expansion → T2 (ONE sim-core writer, S1 core → S2 chooser → S3 Save V31 → S4
load/runtime → S5 projection 48; then the split values-only sweep) → T3/T4 per the checklist.
Owner items open: 628 R5 / G-1(A) / G-2; 637 cancel attribution; B.5 OPEN 1–3 (Q2/Q3/Q4), 11, 15.
Unity/native deferred (backlog: the `priorityOrder` enum widening; new save/projection identities).
