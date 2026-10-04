# Independent review: explicit V27 finance-period correction

Reviewer: `/root/recovery_charter`, 2026-10-04. **PROCEED as a bounded production component for later coherent assembly.** No blocking static defect found in this exact two-file delta. This does not approve the unchanged owner-integration base, establish a measured RED/GREEN, or authorize exposure of a partial Save46 build.

## Fixed identity

Patch `old-era-period-production.patch`: `8527738dbee6a51f9e5230d5d297a5b375837b60971edfef3eea06bda6a932f0`.

Handback: `1faa3a3fce8dc879d53ca4b807e963e73d1e9e7880a24a500919cbe644f83f97`.

Independently checked every base/candidate manifest hash and reconstructed the complete two-file patch exactly. `hollywood.ts` is based on the shape proposal; `rivalResearch.ts` includes a separate owner integration still under another review. Only the assigned delta and its immediate callers were assessed here.

## Verified behavior by source inspection

- `RivalFinanceEra` explicitly distinguishes `live` from `research-v27`. Both `newFinancePeriod` and `moveRivalMoney` default to live, preserving the ordinary current money roster and every unchanged call. The historical roster removes exactly `termination` and `facilityDemolitionRefund` from the present live list while retaining all 14 V27 kinds, including all four research kinds. This is a trusted caller policy, not detection of missing fields in an input save.
- The existing money owner selects the roster when it opens a period because the charge's year differs from the last period's `fromWeek` year. It then performs the same cash, movement, closing and through-week update. No output-account repair, history rewrite or post-booking deletion is added. Existing same-year periods are not reconstructed.
- A historical attempt to book either later money kind throws before even period selection, so it cannot append a period or change cash/history first. Actual historical plan admission books only the existing `researchCapacity` debit. The patch changes no capex, quote, reserve, receipt, plan, refund or sign law.
- `admitFor` takes an explicit finance era, defaulting to live, and forwards it to its one real money call. Public explicit `pre-recovery` staging selects `research-v27`, documented narrowly as the existing V27 staging seam. The current public default and actual `admitRivalPlansInWeek` remain live and retain the already drafted cutting checks. No missing cutting key is used to infer historical permission.
- The public admission's existing working-business clone owns the period array and current movement map. The new-period append therefore changes that working account, not the caller. This patch introduces no alternate mutation path. Runtime input neutrality still requires the proposed tests.

## Scope and prerequisites

The narrow historical label is not permission to pass arbitrary V41–45 states through a V27 roster. Any future historical caller with a different roster needs an explicit supported era. Because the present historical roster filters the shared live list, a future added live kind must also update the historical selection or its exact-roster regression will fail; no future permissive widening is approved here.

The existing V26 direct-admission smoke leaf does not establish a valid saved output: it does not first add V27 research movements and only checks that a result exists. This delta does not fix or silently reinterpret that smoke. Existing own-era callers must explicitly choose their historical mode, and save-bearing controls must genuinely migrate V26→V27 first. Their broader caller updates remain with the parent/owner-integration review; a missing-field crash is not a re-pin.

The independently authored test patch is separately reviewed in `S/1363-old-era-period-prep/INDEPENDENT-REVIEW.md`. Its genuine week312 capture and affordable boundary premise remain absent/unmeasured. No observed period leak or corrected GREEN is claimed. Before acceptance: complete coherent owner/schema assembly, separately reviewed historical capture production, intended RED at the uncorrected period constructor, corrected GREEN, explicit live/default and scheduled-entry fallout, historical old-reader controls and type gates. The reviewed behavior-preserving delta cannot replace those measurements.

No Node, tests, typecheck, simulation, capture mint, fixture payload access, active recorded output, source/index edits or nested agents. Lightweight Python hash/diff checks only. This report is the only production-folder write.
