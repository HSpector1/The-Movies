# Integrator ruling R-E: the bar for the founding reader (2026-10-11 17:05 CDT)

The Owner order waives Owner approval. Rulings R-A to R-D stay in force.

1. The Save47 reader enforces lawful-history invariants on the founding roots: the founding draft, the recorded fund, the landmark list, the employment register, and the signing, payroll and overhead ledger rows. The reader is not an authenticator. If a save satisfies every lawful-history invariant and some lawful history could write it, the reader treats it as a lawful save.

2. r7 implements the invariants the r6 verification named. They bind only campaigns that hold a recorded fund or an open draft, so saves with neither load exactly as before.
   - I1. A closed fund has `closedWeek === recordedFromWeek`. An open fund exists only at `market.tick === recordedFromWeek`. Together these date every allocation to `recordedFromWeek`.
   - I2. Under `opened` provenance, no player employment row precedes the fund's first allocation.
   - I3. Every employment row in `[openingEmploymentCount, closingEmploymentCount)` is a player `player-contract` row that the fund allocates. While the fund is open, the range runs to the end of the register. This pins `openingEmploymentCount`.
   - I4. No payroll or overhead row is dated at or after `market.tick`, and no charge repeats where the writer (`src/core/tick.ts`) writes it once a week.
   - For I4, read the writer first. Implement only the parts that hold in every lawful history. Report any part that does not hold instead of implementing it.

3. Every invariant needs three things in REPORT:
   - the writer that guarantees it, cited by file:line;
   - a refusal leaf;
   - a statement that no fixture or test save violates it.

   The production landing gate's full core and UI runs prove the last point. Add leaves for every r6 forgery form: probe-c's week-40 refill, D1's relabelled cash signing, D2's legacy re-open, and probe-e and probe-f's two-edit forms on the genuine V15 owner saves (p05a1, p05a3).

4. Correct r6.b. The overhead amount (`tick.ts:993`) does separate the populations, and REPORT must say so. The over-refusal that R-D declared stays, on unreachability alone: no supported surface reaches the never-founded-with-signing campaign (`ui/src/engine/adapter.ts:609`, `bridge/session.ts:311` and `:1389`). The overhead amount is a derived value that a forger can edit, and a rule built on it would serve only that unreachable population. R-D's "no genuine fact separates" condition is amended to match.

5. After r7, the verification blocks landing only on these:
   - (a) any r6 upheld or minor item left unfixed;
   - (b) an invariant I1 to I4 implemented wrongly, meaning a save that violates it is accepted or a lawful history violates it;
   - (c) a regression, or a new over-refusal on a supported surface;
   - (d) a defect in determinism, in conservation under lawful play, in refusal purity, or in liveness.

   A new forgery class that violates none of the invariants r7 REPORT lists becomes a residual minor with a follow-up item. It does not block landing. An unauthenticated save cannot be closed against every multi-root rewrite.
