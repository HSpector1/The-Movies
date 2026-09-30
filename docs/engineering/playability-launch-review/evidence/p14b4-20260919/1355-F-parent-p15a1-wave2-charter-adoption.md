# 1355-F: parent adoption of the P15A.1 Wave 2 charter

[1355-A](1355-A-p15a1-wave2-charter.md) stays byte-frozen. Review [1355-B](1355-B-p15a1-wave2-charter-review.md) returned
REFINE with no blocking defect: one required citation and one wording note. The parent adopts 1355-A with the
amendments below, which govern where they differ.

## Amendment 1: fact 8 names its closing evidence (1355-B, required)

Fact 8 ("a rival's week-W release set is fixed when the week starts") also rests on these source facts, which the
parent re-read at c614b7e9:

- **Scheduled rival entry runs after the week's industry step.** The loop at `tick.ts:1118-1122` calls `enterRival`
  on `finalized`, after `advanceHollywoodWeek` (`tick.ts:935`). `enterRival` builds the business with
  `productions: []` (`hollywood.ts:201-202`). A new rival cannot join the batch of its entry week, nor any week before
  its first greenlight completes eight ticks.
- **Commitment reads the pre-decrement counter.** The commitment loop (`hollywoodTick.ts:371-373`) runs before
  `advanceManagedProductions` moves `remainingTicks` (`hollywoodTick.ts:376`). A picture at 2 reaches 1 this week and
  releases next week.
- **No other writer.** Besides the two greenlights, which set `PRODUCTION_TICKS` (rival `hollywoodTick.ts:246`, player
  `actions.ts:366`), every write is a one-step move inside the weekly advance: `operations.ts:1431`, `:1614`, `:1782`
  (minus one), `:1684` (5 to 4 at the first take) and `:1764` (1 to 0 for a committed release). The parent's grep at
  c614b7e9 found no other write outside `save.ts` readers and the detached replay
  `promiseCapacityOwnerReplay.ts:2589` (no save mutation, per its header at `:1-5`). Shelving touches only screenplay
  ordinals. The player HOLD (`operations.ts:1754-1762`) parks a picture at 1 and deletes nothing.

## Amendment 2: the all-or-none claim rests on the in-repo pattern

§3.1 and §3.3 cite "the 1352-A §7 precedent". 1352-A §7 is a proposal carried to P15B Wave 4 and not yet reviewed. The
claim stands on the existing pattern: `tick()` returns one state or throws, and the P06A witness already fails a week
closed that way (`tick.ts:506-520`). Read each "1352-A §7 precedent" as "the same reasoning as 1352-A §7's proposal".

## Amendment 3: the old-save leaf reads a genuine capture of the version below the step

RED 16 names Save43. By production, the live version below the P15A.1 step will be at least Save44 (relationship slice
B). RED 16 reads a genuine capture written by the last writer of the version immediately below the step, minted before
that writer moves, with sha256 provenance. The same capture serves every root that shares the step.

## Amendment 4: save allocation

The parent may put the P15A.1 root, the P15A.2 archive and the P15B condition root in one save step when their
productions are ready together, so one version sweep serves all three. Each root keeps its own validator, migration
and downgrade refusal, and its own RED leaves.

## Answers to the review questions

R1-R5 are adopted as 1355-B answered them: the due-set-first batch with no loop split, the assessments-only root with
no manifest, phase identity as a documented constant, a save step shared by choice (Amendment 4), and the §5
thresholds.

## Status and order

Charter adopted. The Owner's order stands (1340-O execution order; 1342-O): production waits for shelving's closure
and Wave 1's broad gates. RED staging and G1 are independent work and follow the running Save43 measurement, one heavy
process at a time. Owner questions: none.
