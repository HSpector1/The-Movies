# 1344-D9: confirmation of r2d revision 3 (the D8 fix)

Read-only, nothing run, merge tree unopened. Staged files equal the scratch copies.

**Verdict: CONFIRMED.** The parent may run RUNBOOK-r3.

## The two searches against D8

- Rows 8-10 (`s10VoidsThisTick`, block `:113-133`): rival promises VOIDED by the tick into Wc, 2601-2696, checks 1-4
  on the Wc − 1 state, no actor check.
- Row 11 (`s10OpenAtCutoff`, `:140-159`): open, bound, progress-0 rival promises whose announced record gives
  effectiveWeek − 8 = w + 1, VOIDED or not, checks 4 and 5. It covers states 2600-2694 (`:204`) and `final`, 2695
  (`:352`).
- Both use `s10RuleOrder` and `s10Pick` (`:163-175`). The log line (`:422-423`) and RUNBOOK-r3 step 4 report both.

## Check 4 for rows 8-10

That reading is what D8 meant: "checks 1-4" used revision 2's numbering, where check 4 is
`issuerHasNoProductionAtWcMinus1`. It hides no lawful witness. `beforeRivalCutoff` asserts the issuer's empty
`productions` (`:26-27`) on the last-admission state before R1, R2 or R3 continues, so a promise whose issuer holds a
production at Wc − 1 fails all three. Check 4 reads that field on that state.

## Other conditions

- Chain-created promises: both searches read every promise of the state they examine (`:116`, `:143`).
- Never gating: outside `gates` and both `expect` calls (`:416`, `:425`, `:475`).
- Own ERROR: separate try/catch blocks and error lists (`:197`, `:203-204`, `:351-352`); `s10Pick` sets ERROR from its
  own list (`:171`).
- Writes: only through `s10Out` (`:417-418`, `:470-471`).
- RUNBOOK-r3: the step commands are RUNBOOK-r2's apart from the probe path and a read-only step 4 grep. Steps 1, 2, 3
  and 5 end in `clean`.

## Note, non-blocking

Neither search evaluates later leaf lines (R1 `:43-46`, N10 `:149-151`), so a reported witness still needs its own
declaration (F5 A2), as step 4 says.
