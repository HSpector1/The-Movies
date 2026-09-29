# 1351-L: P15A.2 Wave 1 landed (pure Power Ranking law `power-ranking/v1`)

| Step | Commit | Evidence |
|---|---|---|
| RED r5 tests ([1351-C5](1351-C5-p15a2-red-error-handling.md); `cmp` equal to the dry-run tree) | a9516d8d | [1351-X6](1351-X6-red-r5-dry-run.md) |
| Recorded RED run at a9516d8d (published first) | — | [txt](1351-p15a2-red-recorded.txt), [json](1351-p15a2-red-recorded.json), [patch](1351-p15a2-red-recorded.patch), pre/postflight: **47 fail, 1 control passes**, `fixedSource` true, `allGuardsExact` true |
| Production r2 ([1351-E2](1351-E2-p15a2-production-revision.md); `cmp` equal to the dry-run tree for `powerRanking.ts` and `tuning.ts`) | cea3c853 | [1351-X5](1351-X5-production-r2-dry-run.md), [1351-X6](1351-X6-red-r5-dry-run.md) |
| TUNING comments state the tested ranges ([1351-J](1351-J-p15a2-implementation-review.md) item 1; wording per [1351-J2](1351-J2-p15a2-revise-items-confirmation.md)) | 1c1639dd | — |
| Recorded GREEN run at 1c1639dd: P15A.2 and P15A.1 files together | — | [txt](1351-p15a2-green-recorded.txt), [json](1351-p15a2-green-recorded.json), [patch](1351-p15a2-green-recorded.patch), pre/postflight: **83 of 83 pass** (48 + 35) in 5.37 s, `fixedSource` true, `allGuardsExact` true |

The reviews: [1351-D](1351-D-p15a2-red-review.md) on the tests, [1351-J](1351-J-p15a2-implementation-review.md)
REVISE, and [1351-J2](1351-J2-p15a2-revise-items-confirmation.md) KEEP.

## Status: IN PROGRESS. Wave 1 is not closed.

The broad recorded core and UI gates over both pure slices come next, then attribution, review and closure (with
P15A.1, [1346-L](1346-L-p15a1-wave1-landing.md)).

Waiting for Wave 2:
- the quarterly archive root;
- the Bridge view, including the "no finished release in the window" sentence (1351-F2 item 4);
- the adapter that maps `AuthoredFilm` to `authoredPreCampaign`.
