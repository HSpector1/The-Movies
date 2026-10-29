# Round 8 estate acceptance mapping — wave3m

Evidence: lane-logs/wave3m.log and final wave3m-core.json. Focused result267 passed/20 failed; the overall gate is not passing. The estate file results below were observed in the complete-file log and confirmed in the final report. Independent read-only evidence inspection; tests authored by this reviewer are not represented as independently designed tests.

Core budget remains the original5000ms: vitest.workspace.ts core project has no timeout override; these three test declarations contain no custom timeout, and wave3m.sh supplies no timeout override. Vitest can print PASS for synchronous tests whose measured duration exceeds this budget. Reached assertions and original timing acceptance are reported separately.

| Complete file / witness | Measured outcome | Original law coverage and limits |
| --- | --- | --- |
| p16-r2-validator.test.ts | Vitest15/15; repaired early-bid/proceeds case3813ms, within5000ms | Authentic closure163, natural pre-D state, actual public sale. Valid baseline reached; forged bid before opensWeek refused by original named assertion; valid resolved root admitted; forged proceeds refused by original named assertion; public caller purity reached. This directly repairs ONE of the original15 synthetic-case failures, retaining its substantive assertions. |
| p16-estate-d-ceremony.test.ts | Vitest1/1; test6925ms, file6927ms. **OVER BUDGET by1925ms.** | Existing real13M film sale, intake/distribution/archive, original money/history/save/replay assertions reached. Added comparison with same ordinary tick without bid proves estate sale does not transfer employment, active employment ordinals, player contracts or free agents. Satisfies reached no-person-transfer witness, not timing-qualified acceptance. It does not replace original multi-lot ordering/disqualification/affordability cases. |
| p16-rebase-estate-licence-survival.test.ts | Vitest1/1; test7711ms, file7712ms. **OVER BUDGET by2711ms.** | Actual bilateral paid exclusive sequel licence at162; actual closure163 remains reached; authentic lot carries licence encumbrance; natural advance to175 and separate archive/sale176 successors. Licence authority survives closure, archive and sale; buyer lacks licensed sequel authority and holds unlicensed remake authority; expiry predicate and archive save/reload reached. Natural term-expiry tick is not claimed (as-of predicate only). Added employment comparisons reached. Does not replace pending-notOffered coverage; not timing-qualified acceptance. |

## What remains open

Fourteen original synthetic cases remain unmodified; do not call C03 fixed or all15 superseded. Licence/no-people laws now have reached executable evidence, but both new/extended witnesses exceed original timing budgets in this run. Preserve those timings and original failures.

- Genuine closure with active theatrical run and/or active production: exact R04 capture has no active runs; new witnesses do not supply that premise.
- Active-run/production pending disposition and later encumbrance disqualification remain uncovered by these additions.
- Explicit licensed property pending/notOffered law remains uncovered; the new property was in an offered lot.
- Multi-lot bid identity tie-break, rival disqualification, cash squeeze/fallback, all reservation and malformed-handoff branches are not superseded by one fixed successful sale.
- Obsolete default-unbound-reader assertions require precise replacement with explicit UNBOUND controls and actual default-binding behavior, not blanket deletion or source regression.
- Full C03 acceptance requires original timing qualification and named equivalent coverage for each retained law, not merely an increment in green test count.

## Records wording review

Replace stale blanket wording “licence survival and no-person transfer are untested” with “reached on real closure/sale routes in wave3m; original5000ms acceptance still open at7711ms/6925ms.” Keep “14 old synthetic cases remain red” distinct from “one old validator case repaired”; an added witness is not a removed failure.

Owner decision brief should present remaining coverage/timing gaps as engineering acceptance blockers. Existing authorization covers technical repairs; no new gameplay ruling is required to investigate them. Source fixes for money purity/cast ordering/C08 quote consistency do not close these estate acceptance gaps. C08 remains constructed quote proof, not natural close proof.

## Final individual complete-file verification, wave3n

All children exit 0; root/UI typecheck exit 0. Drafting171 3/3 (longest 2866ms), ceremony 1/1 (2966ms), licence survival 1/1 (3067ms), prior55 Bridge migration 1/1 (4622ms), each under its original 5000ms per-test budget. These solo results do not waive the broad-run overruns. One original estate failure repaired; fourteen remain. No source change after wave3m.
