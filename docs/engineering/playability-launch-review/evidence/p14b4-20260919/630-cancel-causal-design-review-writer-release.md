# Record 630 — breakPromisesOnCancel causal-coupling correction: design review and writer release

Status: WRITER RELEASED WITH CONDITIONS (629-B). Source at release: HEAD `def4ace1` (RED committed
`6c9e7d47`, its logs `af3449a`, the publication correction `def4ace1`). Authority: Owner ruling record
600 step 7 (continue the authorized logic-first program); record 628 NEXT628 (b); record 26 §2 :73-82;
plan :237-258, :331-336, :336-355.

## Inputs

- 629-T (test-author) RED `tests/p14b4-cancel-causal-proof.test.ts` (592 lines, sha256 `c3fdbf56…`),
  report `629-T-report.md`, logs `629-T-probe-logs/`. Baseline record-check 629 on unchanged source
  `cb13a457`: 7 failed / 9 passed (16), testedDiffSha256 `104739c5…`, fixedSource true. Every RED
  failure stops at `untouched()` (:267); every RED premise passed: the current coupling returned
  IMPOSSIBLE with exactly the non-target-specific bottleneck each case isolates (joint reservation
  `promises already made to this person exhaust the window`; the classless-P2 fresh-offer refusal; `a
  directing promise is not offered in this slice`; the physical sentence with the ORIGINAL count).
  629-T finding 1 witnessed the forbidden shape on the current source: case 1 breaks the first root in
  array order on the JOINT bottleneck and the second survives because the broken root stops reserving.
- 629-A (sim-core, READ-ONLY) design note `629-A-design-note.md`: the separate proof
  `targetSpecificImpossibility`, the mask-seat relevance filter, the corrected body, the cadence gap
  (A: the quote's `SEAT_CYCLE_WEEKS` loop; B: `t0 + 5k`), paper effect on every existing pin, eight
  open questions.
- 629-B (contract-auditor, READ-ONLY) `629-B-review.md`: verdict RELEASE WITH CONDITIONS C1–C6;
  DEMONSTRATED on paper D1 (window-start clamp) and D2 (alternative A writes a false permanent BROKEN
  for remaining ≥ 2: greenlight w → take w+5 → cancel w+5 (immune) → greenlight w+5 → take w+10; A's
  k = 1 event is w+13).

## Rulings adopted (binding on 629-W)

R1 Cadence B with the D1 clamp. `remaining = max(0, count − |qualifyingTakes(state, promise)|)`; zero
   → not judged (`null`). `t0 = max(windowStartWeek, expectedFirstTakeWeek(state, promise, week, 0))`
   (the physical clock runs from `week`; the window start is a floor because a picture can be held at
   ticks 5). `nMax = t0 < dueWeekExclusive ? ceil((dueWeekExclusive − t0) / WEEKS_TO_FIRST_TAKE) : 0`.
   BROKEN iff `remaining > nMax`. No `SEAT_CYCLE_WEEKS`, no loop, no reservation / family / class /
   buffer / slack term, no receipt. The bound presumes M16 one-seat exclusivity
   (`assertGreenlightStaffingIdle`) and fixed cast (no recast verb); it is a floor on take weeks, hence
   a ceiling on the count, and is deliberately looser than the quote law. A and B coincide for
   remaining = 1 (every existing pin and every live-authored count).
R2 Relevance: evaluable ∧ same issuer ∧ `promiseCastSlots(promise).some(slot => cancelled.cast[slot]
   === beneficiaryPersonId)`. No take-inside-window precondition (the proof is a hard bound, so the
   filter decides only attribution; the committed pin p14b1 :780-838 and companion §4.4 credit the
   cancel). The cancel-attribution question (a cancel credited with a pre-existing impossibility) is
   RECORD-ONLY for the Owner, not a defect.
R3 Immunity :747 verbatim; the proof is called on `state`, not `next`; the cause and reason strings
   :756/:758 byte-identical; `reclassifyPromise`, `promiseFeasibility`, `advancePromisesWeek`,
   `breakPromisesOnTermination`, `settle` and the validators untouched (C5: no hunk in :383-460,
   :673-733).
R4 `expectedFirstTakeWeek` :352 parameter narrowed to `Pick<PromiseDraft, 'issuerStudioId' |
   'beneficiaryPersonId' | 'predicate'>` (type-only; ruled over a synthesised draft).
R5 The helper is a module export of promises.ts; no index.ts re-export.
R6 C6 resolved by explicit authorization: the stale comment `src/core/actions.ts:591-595` ("only when
   the re-run feasibility says IMPOSSIBLE") is corrected by a COMMENT-ONLY hunk as a separate second
   step (S2) so it bisects alone; no code change in actions.ts.
R7 No version literal moves (PROMISE_RULES_VERSION 4, LIVE_SAVE_VERSION 30, PROJECTION_VERSION 47);
   no wire, save, receipt or RNG change; Unity/native deferred.

Writable for 629-W: `src/core/promises.ts` (helper after :634; :735-761; :352) and the S2 comment hunk
in `src/core/actions.ts:591-595`. Frozen: everything else, including index.ts, tests, fixtures.

## 629-T2 follow-ups (after the writer, test-author)

1. Case-5 negative: P in SUPPORT on A (take recorded), tagged lead count 2, cancel B with P lead →
   BROKEN at the cancel (remaining 2 > nMax 1).
2. A/B separator: count-2 tagged lead, P lead on the greenlit-this-week picture, window [w, w+12)
   → untouched under B (A would break at w); pre-cancel premise IMPOSSIBLE with the physical sentence.
3. D1 clamp: count-1 tagged lead, P lead on the greenlit-this-week picture, windowStart w+2, due w+7,
   cancel at w → untouched; due-week BROKEN at w+7.
4. Relabel `nMaxAfterCancel`/header (:31-40, :74) as the quote-law estimate or add `ceil((due −
   t0)/5)`; fix ":755" → ":756" (:42).
5. Optional direct pins on the exported helper (t0 ≥ due → 0; due = t0 + 5 → 1; due = t0 + 6 → 2).
The tails of cases 1 and 4 (post-`untouched` due-week assertions) have never executed; a first
failure there is attributed (premise vs law) before the writer is blamed.

## Record-only

- Publication correction `def4ace1`: 52 probe logs named as archived by records 616/618/628
  (`600-T2-probe-logs`, `600-T4-probe-logs`, `619-W-probe-logs`, `619-T2-probe-logs`) had been on disk
  but excluded from every commit by `.gitignore:10` (`*.log`); force-added unchanged. Log directories
  are now verified with `git ls-files` before a record calls them archived.
- 26 §2 line drift (:656/:321/:739-746 → :744/:286/:567-600); a bound DIRECTING_COUNT root is
  validator-lawful and judged over generic cast (P3's director-of-record semantic is unmodelled,
  companion :321); the labeled `bind` fixtures carry a FRAGILE placeholder receipt on a bound root (not
  live-mintable, validator-lawful, unread by owners); synthetic double-seat and `from ≥ due` states
  lie outside the lawful contract; the greenlight seam needs no integration (a non-mask hold is
  reversible by the same studio's cancel).

## Next

629-W (sim-core, ONE writer, two cumulative patches S1/S2) → record-checks (RED post-writer,
typecheck, p14b1-promises + outcomes controls, live-P2 set, full core) → 629-T2 → 629-R review →
qualified-checkpoint record → headers.
