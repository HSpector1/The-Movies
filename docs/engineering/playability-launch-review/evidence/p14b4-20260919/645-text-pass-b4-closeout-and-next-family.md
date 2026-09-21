# Record 645 — text pass landed; B4 logic families closed out; UI baseline; next family scoped

Status: engineering record (not Owner acceptance). Authority: Owner ruling record 600 step 7;
record 637 NEXT637 (c); plan :386-430 (ordered execution and continuation); P14 plan :407-414
(slice order and preconditions).

## 1. NEXT637 (c) DELIVERED — the stale-title text pass and the 574-R doc fix

- `651fea8b` 638-W (sim-core, comment-only): `promiseCapacityOwners.ts:8-18` header states the
  current division of labour (enumerator slice, replay bills 583/597, 4-arity default still
  'incomplete', no live importer, no receipt fields — 574-R item 1 closed); `promises.ts:449-458`
  `reclassifyPromise` doc: no production caller since record 630, export kept for index.ts and the
  RED premises. `promises.ts:90` refusal string untouched (a thrown string; record-only).
- `0e330da0` 638-T/638-T2 (test-author, titles/comments only, seven files): LIVE_SAVE_VERSION /
  projection titles say 30 / 47; cut-over comments in past tense; DRAFT ONLY headers say
  installed-and-run; `p14b1-promises:578/:780/:819` describe the landed target-specific cancel
  proof with the pre-cancel quote labeled PREMISE; the cancel-causal RED's promises.ts citations
  re-verified after the +6 shift (13 cites; the `:737` describe-title cite parent-applied, one
  token). Verified: the only non-comment changed lines are six `it()` titles; no assertion,
  expectation, string or fixture change.
- Evidence: 639 typecheck EXIT 0; 640 the seven touched files 79 passed / 79 (on `0e330da0`).
- Left as accurate (638-T): `p14bf2:4` slice-scope history; the generator comment chain
  `:655-662`; `d11-cycle2:227` 'expected V28' thrown string (code-side, flagged);
  `bridge-p14b1-promises:467/:470` "converts to V29" borderline (the bridge lands on V30 through
  the V29 step).

## 2. B4 logic families — closeout status against record 600 §3 step 8

| Family | Record | State |
|---|---|---|
| Coordinated core/save/runtime/wire cutover (evaluator 4, V30, projection 47) | 616 | qualified checkpoint |
| Rival P2 authoring outcomes on a recorded seed | 618 | executed natural evidence (nine rival outcome cases run) |
| Final seating preference | 628 | qualified; three Owner expansion-review questions open (R5, G-1(A), G-2) |
| `breakPromisesOnCancel` causal-coupling correction | 637 | qualified; cancel-attribution note for the Owner |
| Stale-title text pass + 574-R doc fix | this record | landed |
| Evaluator 5 (joint certificate; UNCERTIFIED → FRAGILE) | — | later design (D2 (i-c)); designated failing case `p14b4-cast-class-capacity-evaluator5` stays RED |

Current-source verification on `0e330da0`/`40451858`: 641 `check:bridge-contract` clean; 642
bridge fixtures clean; 636 (on `61833f0d` + comment-only changes since) full core 9 files / 24
failed = 22 inherited + 2 designated; never cited as all-green.

## 3. First full UI-project run (643) — recorded as the UI baseline with caveats

643 (`npm run test:ui` on `0e330da0`): 9 failed files / 28 failed / 2657 passed / 5 skipped, plus
one unhandled error; no earlier full-UI run exists in this program (614/615 were five files).
643-C (contract-auditor, `643-C-ui-failure-classification.md`) classified all 28: 10 ENVIRONMENTAL
(`No module named 'PIL'`, authored-rgba-export / authored-stage-a; the same class since
`headless-baseline-20260916`); 2 ASSERTION on an unmigrated V16 oracle fixture
(`p05a-w2-closed-production.contract`: `studioLotSnapshot: invalid or ambiguous Gate Hiring
authority`, inherited from P14A.1, not reachable by any P14B.4 subject); 7 TIMEOUT (5000 ms) + 8
CASCADE (DOM leak from a timed-out sibling, "Found multiple elements") + 1 lazy-chunk findBy; the
unhandled `hollywoodPerformance is not a function` (`StudioLotScreen.tsx:4854`, a test-double gap in
`StudioLotIdentityReview.test.tsx`) alone forces exit 1. 644 (single-worker rerun of the six
timeout files on `40451858`): five files fully green (NextEventApp, CastingReviewApp,
CastingReviewAppAuthority, livingTurn.scheduler, livingTurn.parity → load-attributed);
`WorldFirstWorldInspectorDefault` 5 failed = the 27-mount canonical-order sweep (`:609-629`)
over its 5000 ms budget single-worker too + four cascades. `ui/src/engine/adapter.ts` imports
nothing from `promises`/`talentMarket`; no ui file does; the mount loop never ticks — the P14B.4
subjects are unreachable from it. Evidence limit: no pre-cutover UI run exists to prove the
27-mount sweep was over budget before; a throwaway-worktree measurement was not made (the takeover
packet excludes checkout/clone). Baseline for the next full-UI comparison: the deterministic set
(10 PIL + 2 V16-fixture + the unhandled error) by name; the timeout class by file, not by name;
exit code is not a comparator while the unhandled error exists. UI fixes (the oracle fixture's
migration route, the `?.()` at `StudioLotScreen.tsx:4854/4867`) are ui/ writes outside this
program's authorization; carried to the backlog.

## 4. Next family — scoping (645-A, sim-core READ-ONLY; `645-A-next-family-scoping-note.md`)

Recommended: **P14B.5 "First Shared-Work Bond Core"** — the relationship model (companion §5)
bounded to edges minted from shared first takes + release success/failure + cancel drivers,
drift-on-read tiers, D5 live in the chooser and the `nemesisOnRoster` reservation drop
(enumerated, unreachable), a read-only `pairChemistry` export with no consumer; Save V31 (new
top-level `relationships` root; `convertV30ToV31` opens it EMPTY; `convertV31ToV30` refuses when
any edge exists); projection 47 → 48 forced by the closed `priorityOrder` wire enum
(`bridge-schema.ts:2320-2324`), thin surface only (enum widening + the D5 settlement reason);
romance track, casting-competition driver, chemistry consumption, casting warning and every read
model deferred to B.6; the waiver (substitute-only branch) as the following slice. Why first: it is
on P14C's dependency path (§6.3), the one selected P14B experience with zero engine surface, and
the plan's stated order (:407-409).

Product decisions carried on the companion's own "recommended first behavior, not an approval"
footing (register §7.3; the B.1 precedent, plan :514), isolated in the expansion's OPEN section
and reversible later — the Owner may object at any time: Q2 :621 compatibility prior vs base rate
(first slice: base rate); Q3 :622 migration backfill (none; edges only from takes ≥
`recordingStartedWeek`); Q4 :623 Nemeses seating refusal vs warning (warning + disclosed
consequence; no greenlight guard). Hard Owner blocks on the slice: none. Items gating OTHER
families: the 628 seating questions (relationship-driven rival seating waits on them); D2 (the
cap/metric revisit waits on an actual evaluator-5 design). Plan-level: `PROMISE_RULES_VERSION 5`
is plan-named for the joint certificate; B.5 does not touch the evaluator.

Source facts: no genuine outgoing V30 save fixture and no genuine projection-47 runtime checkpoint
exist under `tests/fixtures/p14/` (registry last entry `projection-v46`); T0 minting at HEAD (final
V30 behavioural writer `61833f0d`; `651fea8b`/`0e330da0` are text-only) precedes any source change.
A waiver acceptance rule exists only as the §4.4 :379 hypothesis, nowhere in source.

## Next (bounded)

NEXT645: (1) T0 for B.5 — mint the genuine outgoing V30 corpus (empty root; bound open P1; tagged
P2; kept-and-broken; rival current P1; first-take world at `remainingTicks === 5`) and a genuine
projection-47 runtime checkpoint at HEAD, with sha256 provenance and independent KEEP (the B4 T0
pattern, records 01–09); (2) the B.5 expansion draft (sim-core READ-ONLY, the B.1 pattern, OPEN
section carrying Q2/Q3/Q4) and its contract-auditor read-only audit; (3) then T1 RED against the
absent `src/core/relationships.ts` and the V31/48 allocation at execution. Evaluator 5 later.
Owner items open: 628 R5 / G-1(A) / G-2; 637 cancel attribution; Q2/Q3/Q4 footing. No native
work; Unity/native deferred.
