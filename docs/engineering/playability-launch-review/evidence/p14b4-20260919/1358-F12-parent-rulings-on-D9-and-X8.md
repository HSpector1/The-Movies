# 1358-F12: parent rulings on the sweep review 1358-D9 and the dry run 1358-X8

[1358-D9](1358-D9-sweep-r2-review.md) found no weakened assertion, no stripped chain, and every pin, digest and schema
id matching source or a probe. It returned REFINE with four required items (R1 to R4) and five recommendations (N1 to
N5). [1358-X8](1358-X8-sweep-r2-dry-run.md) measured r2 in full.

Revision r3 sits on scratch branch `sweep-r3` (7e7a065) in `/Users/zacheryspector/studio-scratch/1358-sweep/merge`.
Its patch (sha256 d2e89b46…) covers 154 test files, +1,057/-679, and these rulings are folded into it.

## Rulings

1. **R1: classification.** The landing handback carries classification rows for every edit no unit classified:
   - G3's S5 draft: 8 call sites and 6 helpers;
   - G6's S5 draft: 5 call sites and 5 helpers;
   - the week-93 lift and its r3 follow-up;
   - the parent's comment edit;
   - every r3 edit.

   The 14 census rows behind the drafts close there.
2. **R2: `p14c2rm-writer-continuation:312` pins N-0468 case 1's measured refusal.** Its `illegal` envelope is that
   case's input exactly: "validateSaveV36: talentMarket.cases[25] is a retirementExtension case for authored-0000, who
   holds no retirement record" (`src/core/save.ts:10295`).
3. **R3: the remaining S8 rows are measured, with no pin.** They are H-new-1 (102 cases), G5-new-7 (32), G6-new-4 (15)
   and G6-new-5 (24).
   - 1358-X6's probe logged all 173 cases, and each reaches its own field's guard, never a version check.
   - These bare `.toThrow()` leaves were bare before Save44, and the sweep restores them; it adds no new pins to them.
   - The four finding-17 leaves keep the pins 1358-N planned for them.
4. **R4: the `screenplayShelved` receipt cover** (`p14d1-rival-shelving-save-v43:247`) writes the engine's own values
   (`src/core/hollywoodTick.ts:279-280`). Through `TUNING`, `retryWeek` is 130 + 26 = 156 and `commissionHoldUntilWeek`
   is 130 + 13 = 143.
5. **N1 to N3: done in r3.**
   - The V41 staging comment says the staging applies the release law's seat, cap, Scientist and promise tests and
     skips its slot-retention and reserve tests. The guard refuses on the receipt alone.
   - Seven comments cite Q03 at :336.
   - The four F11 citations use the published numbers.
   - The V27 masking comment names the covered receipt arm (`save.ts:8833`) and the finance arm (:8848), which cannot
     fire.
6. **N4 and N5: to the closure.** The duplicate-receipt leaf (`p14d1-rival-shelving-save-v43:168-181`) passes on the
   concept check before its own rule. That predates the sweep and becomes a closure finding. The landing handback
   carries one disposition table for the 27 no-edit census rows.
7. **The week-93 control (1358-F10 ruling 9) keeps its comparison, with slice B's edge roots taken out of the
   candidate.**
   - Probe 4 counted 15 romance tracks and no log row in the candidate's week-93 state, and equality once both sides
     carry empty roots.
   - The leaf's purpose is Save43's shelving: it shows that shelving changed nothing before the first shelving at week
     93, and it already takes Save43's own root out. It now takes slice B's two edge roots out of the candidate the same
     way. It asserts the log is still empty at week 93 and sets each track to the lift's null. Everything else must
     match byte for byte.
   - 1358-F9 ruling 2 forbids stripping to make a downgrade chain pass or to hide the new law. Neither happens here:
     slice B's tracks are measured by slice B's own romance and labels tests and by 1358-M2's route comparison.
8. **The F10 generator leaf in X8 is a scratch-tree artifact.**
   - The cause: `tests/fixtures/bridge-contract-union-fixtures.ts` imports `BRIDGE_SCHEMA` by a path relative to
     itself. Linked into a scratch tree, it resolved to the repository's pre-step-4 schema.
   - Later dry runs use script v2 (`run-1358-sweep-dry-v2.sh`): `tests/fixtures` is a real directory of links, and
     this one module is a real copy.
   - In the repository G2's identity pin holds, and F10 and F11 move as 1358-J finding 10 states. Their values come
     from the recorded producer run at the landing (1358-F9, P4), never from a failure message.
   - X8's passing P4 leaf proves nothing for the same reason.

## Next

1. **1358-X9t:** r3's twelve changed files and the generator test, on script v2.
2. **The landing (1358-L):**
   - production steps 1 to 4 as four commits;
   - the r3 sweep commit;
   - the p57 source manifest and the recorded producer run;
   - the F10 and F11 commit;
   - the recorded GREEN, broad core and UI gates.
