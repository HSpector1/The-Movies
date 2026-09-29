# 1346-L: P15A.1 Wave 1 landed (pure shared-market law `p15a1-market-v1`)

| Step | Commit | Evidence |
|---|---|---|
| RED r4 tests ([1346-C4](1346-C4-p15a1-red-floor-seam-percode.md); `cmp` equal to the reviewed scratch files) | 58d485a1 | — |
| Recorded RED run at 58d485a1 (published first) | — | [txt](1346-p15a1-red-recorded.txt), [json](1346-p15a1-red-recorded.json), [patch](1346-p15a1-red-recorded.patch), pre/postflight: **35 of 35 fail**, `fixedSource` true, `allGuardsExact` true |
| Production r2 ([1346-E2](1346-E2-p15a1-production-revision.md), sha256 3924b0b1…; `cmp` equal to the dry-run tree) | 874247eb | [1346-X6](1346-X6-production-r2-dry-run.md) |
| TUNING comment states the tested range [0.75, 1] (the one blocking note of [1346-J2](1346-J2-p15a1-production-r2-review.md)) | 3b6cd98c | — |
| Recorded GREEN run at 3b6cd98c | — | [txt](1346-p15a1-green-recorded.txt), [json](1346-p15a1-green-recorded.json), [patch](1346-p15a1-green-recorded.patch), pre/postflight: **35 of 35 pass** in 3.36 s, `fixedSource` true, `allGuardsExact` true |

The implementation reviews are [1346-J](1346-J-p15a1-implementation-review.md) (KEEP) and
[1346-J2](1346-J2-p15a1-production-r2-review.md) (KEEP, one comment fix, applied above).

## Status: IN PROGRESS. Wave 1 is not closed.

The broad recorded core and UI gates still have to run over the new module and its TUNING keys. They run once for
both pure slices (P15A.1 and P15A.2) after P15A.2 lands, then attribution, review and closure.

Out of Wave 1's scope:
- no save, projection or tick integration;
- no live market pressure, which waits for the rival-shelving verification (1340-O execution order);
- Wave 2 has its own charter.
