<!-- 1359-D2: confirmation review of 1359-C2 r2 (contract-auditor, read-only) -->

# 1359-D2: confirmation of the P15C Wave 2 RED r2 (1359-C2)

**Verdict: NOT CONFIRMED.** Two small fixes.

Read at HEAD da6e73f6 (no `src` or `tests` drift). I ran nothing. The three patches equal their scratch diffs (888170c, c9a9425, 7a0e1dd), match the handback's sha256 and apply at HEAD. I = main test file; H = `tests/helpers/p15c2-legacy.ts`; P = producer; L = landed `campaignLegacy.ts`.

| Item | Status |
|---|---|
| F1 ruling | APPLIED DIFFERENTLY, sound. F2's `authoredPreCampaign: true` becomes `provenance: 'authored'` (no such field exists; L:115). Reference r2 changes only a comment. |
| 1, C11 literals | APPLIED (I:1018-1061). The fifteen values equal tuning.ts:1042-1056; the lists and bounds equal L:74-91. |
| 2, budgets | APPLIED. H:36-43 asserts each body's elapsed time, so a slow leaf fails. I:357 and I:771 assert the logged route and extension times. All seven Wave R guards self-time (:156-362). |
| 3, P15_ROOTS | APPLIED. The helper equals 1356-C r2's staged file except line 10 (`campaignLegacy`). The re-pin set is declared (I:47-65). |
| 4, C2 and B4b | APPLIED. C2 asserts a capture (I:812; H:243 also requires both names). B4b drops its outside half; the sibling file premises its inside half (:70-83). |
| 5, producer | APPLIED. Writes only the three stated files, `wx`, after every check (P:43, :76-90). Refuses a wrong HEAD, existing output or a fresh world with the root (P:51-57). Proves weeks, origin, originWeek, no root and a round trip (P:63-71). The route already ticked these byte-identical states through 6241, so C3 and C4's one tick is proven on this writer. |
| 6, B3 | APPLIED (I:37-40, :690-696). |
| 7, F1 leaf | APPLIED, but loose (fix 2). |
| Split | APPLIED. Five sibling leaves, each failing by name; B7 is a note for P15B. |
| Drop | APPLIED (C5 at I:879-880 checks only `campaignLegacy`). |

## Fixes

1. **B6 stays red at GREEN.** I:770 calls `route().ms`, but r2 renamed the memo to `routeL` (I:140) and missed this call. After its assertions pass, `legacy-ticks-after-freeze` throws a ReferenceError, so its budget line (I:771) never runs. The root type gate also gains TS2304. Use `routeL().ms`.
2. **The F1 refusal side cannot catch over-relaxation.** I:1189's pattern `films[0] (CAMPAIGN).settledWeek` also matches L:358 ("must not precede its release week"). Suppose a law accepts a null week on every settled film. It still refuses this campaign film at L:358, because `null < 100` is true, and the leaf passes. Match L:351's rule text ("must be a whole week once settled"), or give the film `releaseWeek: 0`, where `null < 0` is false.

## Notes (non-blocking)

- 1355-F5 item 1 binds the Legacy validator at production. Reference r2 :1167 still calls `p15PhaseMatches`, which closes over the module's own table.
- The Wave R header (:11, :53-54) still counts six guards.
- P could assert each capture's industry, which `captureAt` needs (H:258); the founded branch implies it.
