# 1344-D8: confirmation of r2d revision 2 (D7 change A1, row 11 f)

Read-only, nothing run, merge tree unopened. Staged files equal the scratch copies;
`build-old-tree.sh` changes only comments and two messages.

**Verdict: NOT CONFIRMED.** One fix. The fault is in D7's rule, which the author applied exactly.

## What holds

- Rule as written: rival-issued promises VOIDED with `outcomeWeek` equal to the tick's week (block `:99-102`), five
  checks read on the Wc − 1 state (`:103-114`), order r01, then Wc, then promise number (`:126-128`), first qualifying
  wins (`:304`).
- Chain-created promises: covered. The detector reads every promise of each tick's result (`:102`), plus the
  2695-to-2696 tick (`:302`).
- Never gating: outside `gates` and both `expect` calls (`:363`, `:374`, `:424`). `rewitness_is_NONE` is a prediction.
- ERROR on a throw: both detector calls are caught (`:155`, `:302`), and any recorded error sets the witness to ERROR
  (`:316`).
- Writes: `promises.rewitness.json` through `s10Out` (`:364`).
- Row 11 f: corrected (declaration `:341-345`). `openBoundForPerson` keeps open, bound promises from any issuer
  (`:339-340`).
- RUNBOOK-r2: steps 1, 2, 3 and 5 end in `clean`; steps 0 and 4 leave the merge tree untouched.

## The three conditions

D7 wrote all three into A1; the author added none.
- r01 first only orders candidates, and every candidate is recorded. Hides nothing.
- No issuer production: every leaf states it (R1-R3 through `:27`, N10 `:240`). Hides nothing.
- The actor call is N10's premise alone (`:148`, `:152`). One shared witness can therefore hide a rows 8-10
  witness: a DIRECTING_COUNT promise requests `'director'` (`promises.ts:953`) and fails check 5, though R1-R3 never ask
  for an actor.
- Conversely, VOIDED at Wc is a premise of R1 and R3 (`:40-41`, `:65`), never of N10. A rival promise whose
  capacity falls short stays open past its cutoff (`promises.ts:963-964`, the R2 path), meets N10's terms, and never
  enters the candidate list.

## Fix

Report one witness per file, same order and ERROR rule:
- rows 8-10: VOIDED by the tick into Wc, checks 1-4;
- row 11: every open, bound, progress-0 rival promise at post-tick w ≤ 2695 whose beneficiary's announced record gives
  effectiveWeek − 8 = w + 1, with checks 4 and 5, VOIDED or not.

The log line and RUNBOOK-r2 step 4 print both. Both predictions stay NONE: of the fixture's bound promises only
promise-148 has a cutoff by 2696, and it settles by 2695.
