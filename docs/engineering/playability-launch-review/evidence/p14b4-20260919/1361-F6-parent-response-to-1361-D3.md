# 1361-F6: parent response to 1361-D3, the review of P15C's production

[1361-D3](1361-D3-p15c-review.md) reviewed P15C's three commits on `p15a1-b-r2`, read against
[1361-X4](1361-X4-p15c-dry-run.md):

| Tag | Commit |
|---|---|
| `p15c-a-r1` | 2592aea |
| `p15c-b-r1` | 5a3a532 |
| `p15c-c-r1` | f4612bf |

**Verdict: PROCEED, with no change required.**

**What it confirmed:**
- **The step:**
  - R1's literal, the sequenced roots, and the Legacy last in the one refusal;
  - every root validator before the one allocator check.
- **Generic cover:** the frozen builders and the live-proof strip cover the Legacy with no branch of its own.
- **Migration:** up and down.
- **The validator,** including its replay under the stored definition.
- **The freeze,** as the outermost last step of the tick.
- **The v2 values**, which equal r4's file byte for byte.
- **The historical hash,** by reading.

## Rulings

1. **E3's split stands** (O1).
   - **The one state it creates.** Only one kind of state passes at (a) or (b) and is refused at (c): an industry save
     at or past week 6240 with an unfrozen root (law:1217).
   - **Why that is safe.** Only an (a) or (b) build can write such a save, and no intermediate commit is played,
     because the productions, the sibling test and the sweep land in one push.
   - **The reverse case.** Nothing passes at (c) that (a) or (b) would refuse.
2. **The replay's inputs are frozen by rule** (finding F1).
   - **The risk.** The replay reads the live `TECHNOLOGY_CATALOGUE` and the live archetype evaluators (law:1089, :1139,
     :1375, :653-661). The catalogue is kept in ascending id order, not append order (`technologyCatalogue.ts:41-45`).
     A frozen 2040 Legacy written under today's code would then fail to save or load if a later change:
     - adds a technology whose id sorts before `synchronized-sound`;
     - adds one that becomes commercial before 2040;
     - edits a commercial week;
     - edits an archetype evaluator.

     The Bridge would refuse those saves too.
   - **The production is not at fault.** It follows the charter (1359-A:78, :174-175). The risk is the charter's.
   - **The rule.** Any change to the technology catalogue or to an archetype evaluator is a Legacy definition change.
     Before it lands, it takes one of two forms:
     - (i) a new definition version whose evaluator reads a frozen copy of the catalogue and of the evaluators;
     - (ii) an append-only catalogue with id-based positions, adopted by its own record.
   - **The guard, required before any such change can land.** P15C's closure adds two leaves:
     - a pin of the catalogue's `(id, commercialWeek)` sequence, whose failure message cites this ruling;
     - a capture of a save holding a frozen v2 Legacy, minted at the landed commit, with a leaf that loads and
       validates it under the current code.

     Until both leaves exist, no change to `technologyCatalogue.ts` or to `campaignLegacy.ts`'s evaluators may land.
     HANDOFF carries this as a blocker.
3. **The cost after 2040 is measured at G-L** (finding F2).
   - **The gap.** The Bridge computes each new state's digest through `makeSave` (`bridge/session.ts:356-358`). After
     2040 every Bridge state therefore runs the replay, which 1359-F's "not every tick" premise does not cover.
   - **What G-L measures.** P15C's closure gate (1359-A:282) times `makeSave` with `validateSaveV45`:
     - on seed-b at week 6240;
     - at week 8,791;
     - after a post-2040 player release.

     A cost that puts the harness or a Bridge step past its ceiling is a finding.
4. **The optional fixes wait for an r2 or the closure** (findings F3 and F5).
   - **F3.** A null lens throws an unlabelled `TypeError` instead of a named refusal (law:1312-1314). The save still
     refuses, so the failure stays loud; it lacks only its name.
   - **F5.** Four stale comments: law:817-821 and :1180-1181, and save.ts:10870 and :10889-10890.
   - **Where they go.** If another reason forces a P15C r2 before the landing, the one-line guard and the comments ride
     with it. Otherwise they join the closure's text and quality items.
5. **The rest go to their owners.**
   - **F4** goes to the sweep plan `1361-N`: at the 6240 tick, a hand-built industry state without the root throws a
     `TypeError` (law:1165-1166). This sits beside 1361-D2 F7's first-tick refusal without `sharedMarket`.
   - **F6** goes to Wave 3's RED, which settles the resolver's public shape. Today that shape uses week -1 for an
     authored film and null for an adoption never operational.
   - **F7:** the 33, 4 and 9 test type-error sites are sweep fallout under 1361-F ruling 3. 1361-M2 measures them.
6. **The disclosures stand.**
   - **What the reviewer ran:**
     - `git hash-object` without `-w` in the repository;
     - `python3`, to read X4's JSON;
     - `git log --format`, `ls-tree` and `diff --stat` in the writer's tree.
   - **Why that stands.** Each only reads, and nothing was written.
