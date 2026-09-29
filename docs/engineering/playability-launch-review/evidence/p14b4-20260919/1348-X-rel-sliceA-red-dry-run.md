# 1348-X: parent dry run of the relationship slice A RED

The parent built a scratch tree at HEAD e374f4c8 (1327-C method) and applied
[1348-rel-sliceA-red.patch](1348-stage/1348-rel-sliceA-red.patch) (sha256 42565aca…; 3 files, 614 insertions, 2
deletions). The author's base f5b2ab92 differs from e374f4c8 only in records, the minted Save42 inputs and U3's
three-line test-double fix. No file the patch touches changed.

[Run](1348-X-red-run.txt) of the three files: exit 1, **14 failed, 52 passed**.

| File | Result | 1348-C classification |
|---|---|---|
| `tests/p14b10-conflict-evidence.test.ts` | 20 leaves: 12 fail, 8 pass | 12 fails, 8 control-passes: matches |
| `tests/p14b5-relationships.test.ts` | 46 leaves: 2 fail (the two `RELATIONSHIP_RULES_VERSION` pins now expect 2), 44 pass | 2 fails: matches |
| `tests/p14b10-mentor-label.test.ts` | **0 leaves collected**: the file fails to load ("Failed to load url ../src/core/relationshipLabels.js") | 9 fails |

Root type gate ([tsc](1348-X-tsc.txt)): exit 2, exactly three errors: `RELATIONSHIP_CONFLICT_COMPETITIONS` and
`hasConflictEvidence` missing from `relationships.ts`, and `relationshipLabels.ts` missing. This matches the handback.

## Finding

The Mentor file imports the missing module statically, so no leaf in it runs at RED. The file fails loudly, so no leaf
passes vacuously. But the nine per-leaf RED reasons in the classification were never observed as leaf results.
1346-C avoided this with a per-leaf dynamic import. The parent asks for the same here, so that each Mentor leaf shows
its own RED reason. The review (1348-D) is asked to judge this together with the D5 method 1348-C disclosed.
