# 1361-F3: parent response to 1361-D, the review of slice 2a production r1

[1361-D](1361-D-p15a2-r1-review.md) reviewed slice 2a r1 (1f2495a, tag `p15a2-r1`; [1361-E](1361-E-p15a2-production-handback.md);
[1361-X](1361-X-p15a2-production-r1-dry-run.md)).
- **Verdict:** PROCEED. P15A.1 may build on r1, and no finding blocks it.
- **What it confirmed:**
  - the 42 migrator lines, the dispatcher, `makeSave`, `migrateToLive` and the frozen builders;
  - the unchanged V44 names and the new exports;
  - both type fixes, with no hash moved;
  - the phase lookup.
- **No path** carries a V45 state to a V44-only validator.

The parent adopts four small fixes as slice 2a r2.

## Rulings

1. **Slice 2a r2 folds four fixes into the slice 2a commit** (findings 1, 3, 4 and 7). Each lands with slice 2a, before any
   sibling root.
   - **R1, the compile-time tie** (finding 1, medium):
     `P15_ROOT_KEYS = Object.keys({ p15Sequence: true, powerRanking: true } satisfies Record<keyof P15StepRoots, true>)`.
     - **Why.** A root missing from the key list then fails to compile. Today it fails loudly at save and load, but
       silently in `tick()`: the live proof refuses, and `prepareLiveWritingContext` swallows the refusal.
     - **How siblings extend it.** P15A.1 and P15C add their keys inside the same literal.
   - **R2, two `undefined` checks in the archive validator** (finding 3):
     - `phaseOrdinal` under a version with no table refuses (`powerRankingArchive.ts:234-235`);
     - `rank: undefined` no longer reads as `null` (`:184-185`, `:255`).
   - **R3, the allocator checks every sequence** (finding 4): each is a whole number of at least 1, in the one check
     (`save.ts:10906`, `:10927-10937`), and not only in each root's validator.
   - **R4, two comments** (finding 7):
     - `save.ts:10867` says the test helper lists four keys;
     - `:10896-10897` carries ruling 2's instruction for P15B, in place of "add `corporateCondition` to the Save45
       list".
2. **P15B's obligation at its later step** (finding 2; handback O1).
   - **Keep the condition root out.** `corporateCondition` stays out of both Save45 lists. The frozen `validateSaveV45`
     call skips the allocator, by an era flag on the Save43 pattern (`save.ts:10774`) or a roots parameter.
   - **Check all roots itself.** P15B's own step runs the one allocator check over every root.
   - **Refuse and strip.** It refuses a non-empty condition root on downgrade, and strips that root in the live proof
     (`save.ts:10552`) and in the frozen builders.
   - The P15B charter and production carry this.
3. **The pre-existing swallow is a finding, not part of this production** (finding 1).
   - **What it does.** `prepareLiveWritingContext` (`src/core/liveRetirementWriting.ts:21-26`) turns a refused live
     profession proof into `{ kind: 'rejected' }` with no record of why. It has done so since 4dbca155 (2026-09-26).
   - **Why it matters.** The project's rule is to fail loud. A refusal that a defect causes then looks the same as a
     lawful rejection.
   - **Why P15 leaves it.** R1 closes the P15 cause. The catch itself is older law that slice B's and earlier tests
     rely on, so changing it is not part of this production.
   - **Where it goes.** It joins the closure's open items, for a bounded review after the Save45 landing: is the
     catch's swallow lawful design, or a defect to make loud?
4. **The fallout run checks the live strip** (finding 5). The isolation leaf cannot detect a missing strip at
   `save.ts:10552`, because both of its campaigns carry the roots. The Save45 fallout run must show that the p14c3
   writing tests fail only on version pins (1361-F ruling 20).
5. **Harness runs record their Node version** (finding 6). 81,692 ms and the reference's 57,710 to 66,546 ms differ in
   three ways:
   - the Node version (v20.20.2 against v22.23.2);
   - slice B's tick code;
   - the machine's memory pressure.

   Ruling 15's run on the merged candidate records the Node version and the machine's state beside the time.
6. **The disclosures stand on the record.**
   - The reviewer ran `git status --porcelain` once in the writer's scratch tree, plus a few read-only git verbs
     outside its list.
   - No recorded run used that tree, and nothing was written.
   - The parent's dry runs check that the tree is clean at their tag before they start.

## For the writer

Fold R1 to R4 into the slice 2a commit as `p15a2-r2`, and keep the `p15a2-r1` tag on the old commit. Then rebase
P15A.1's (a), (b) and (c) onto it, extending R1's literal with `sharedMarket`, and hand back that stack. The parent
dry-runs the stack once.
