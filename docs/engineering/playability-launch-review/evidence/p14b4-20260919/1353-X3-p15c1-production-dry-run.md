# 1353-X3: parent dry run of P15C Wave 1 production step 3 over RED r4, at HEAD 9d0d8a04

Scratch tree from HEAD 9d0d8a04 (script: git archive plus `ln -sfn` links). RED r4
[1353-p15c-red-r4.patch](1353-stage/1353-p15c-red-r4.patch) (sha256 5b628ccf…) applied with `git apply --index`,
blobs `975a94fd` (campaign legacy) and `1f3e963a` (Wave R), equal to 1353-C4. Production
[1353-p15c1-production.patch](1353-stage/1353-p15c1-production.patch) (sha256 65b05bbe…) applied cleanly on top:
`src/core/campaignLegacy.ts` +805, `src/core/tuning.ts` +22, nothing else.

| Run | Result |
|---|---|
| r4, `tests/p15c1-campaign-legacy.test.ts`, before production | **72 failed (72)**: 71 on the missing module, the TUNING leaf on `undefined` ([red-r4](1353-X3-red-r4.txt)) |
| Part A, Wave R retention, over r4 before production | **6 passed (6)** ([partA-r4](1353-X3-partA-r4.txt)) |
| both files over production, verbose | **78 passed (78)** ([green](1353-X3-green.txt)) |
| root `tsc --noEmit` over production | 19 errors, exit 2, the same 19 `SaveFileV42`/`SaveFileV43` lines as [1348-X5](1348-X5-step3-tsc-root.txt); none names a P15C or TUNING path ([tsc-root](1353-X3-tsc-root.txt)) |
| `tsc -p tsconfig.src.json` | exit 0 |

Review [1353-J](1353-J-p15c1-implementation-review.md) is KEEP. Next: landing, in order: RED r4 commit, recorded RED,
production commit, recorded GREEN, each run preceded by a push so `pre` sees remote == HEAD.
