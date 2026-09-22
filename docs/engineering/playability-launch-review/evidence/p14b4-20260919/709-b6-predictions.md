# 709 — the two remaining runs, predicted BEFORE they are started

Registered at source `e63d6143`, clean tree, before `708-d2-bridge` reported and before the
full core and UI runs were started. Written so the runs can falsify it rather than be read
to fit it. Records 704 and 706 used the same device and it caught a real coupling twice.

## Full core (`vitest run --project core`), predicted

Basis: run 703 observed 11 files / 26 failed / 3967 passed / 8 todo (4001), of which the 24
baseline failures persisted byte-identically and TWO were new and attributed in record 706.
Both attributed causes are now removed: the CF-09 source-bundle mismatch was the uncommitted
D1 edit and the manifest has been regenerated and verified, and the prepared-reuse 20s
timeout did not reproduce on a quiet machine. D2 adds one file with two cases.

| quantity | predicted |
| --- | --- |
| test files | 9 failed / 343 passed (352) |
| cases | 24 failed / 3971 passed / 8 todo (4003) |
| exit code | 1 |
| `fixedSource` | true, and `testedDiffSha256` the empty-tree hash at both ends |

The failure IDENTITIES are predicted to be the 695 set exactly, with nothing new and nothing
vanished.

IF CF-09 FAILS AGAIN, the manifest regeneration did not settle it and record 704's account of
`GENERATOR_SOURCE_PATHS` is incomplete.
IF THE PREPARED-REUSE TIMEOUT RETURNS, record 706's attribution is wrong and it is a defect,
not weather. Record 706 already commits to reading it that way.
IF ANY OTHER FAILURE APPEARS, the D2 fix is not as bounded as its +12/-1 diff suggests.

## UI (`npm run test:ui`), predicted

Basis: the last UI run on record is 673 at source `df693294`, `fixedSource: true`, exit 1.
`df693294` is an ancestor of HEAD, 17 commits back, and `git diff df693294 HEAD -- ui/` is
EMPTY, so no UI source has moved. Exactly one UI file imports from `bridge/` at all
(`ui/src/screens/p07a-result-projection.test.tsx`), and it imports `schemaDefinition` from
`bridge/schema/runtime.ts`, not the relationship projector. The D1 edit was comment-only and
the regenerated schema JSON is byte-identical, so that import sees nothing new either.

Predicted: 673 reproduced exactly. 8 failed / 193 passed (201) files; 26 failed / 2659
passed / 5 skipped (2690) cases; exit 1.

ANY MOVEMENT AT ALL falsifies the claim that this slice is bridge-only, and would be the
more interesting result of the two.
