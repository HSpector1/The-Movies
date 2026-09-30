# 1353-L: P15C Wave 1 landed (pure law `campaign-legacy/v1`)

Status: **IN PROGRESS**. The broad gates that follow the Save43 sweep serve as this wave's broad gates.

## Commits

| Commit | Content |
|---|---|
| c7f3cb76 | RED r4 tests: `tests/p15c1-campaign-legacy.test.ts`, `tests/p15c-wave-r-retention.test.ts` (78 leaves) |
| 91c09aea | recorded RED `1353-p15c1-red-recorded` |
| 321a4378 | production: `src/core/campaignLegacy.ts`, fifteen `LEGACY_*` TUNING keys |

Both patches were applied with `git apply --index` from the reviewed staging files. Their sha256 values equal the ones
1353-X3 recorded: [1353-p15c-red-r4.patch](1353-stage/1353-p15c-red-r4.patch) `5b628ccf…` and
[1353-p15c1-production.patch](1353-stage/1353-p15c1-production.patch) `65b05bbe…`. No source path changed between the
dry-run base 9d0d8a04 and c7f3cb76. All four landed blobs equal the 1353-X3 dry-run tree:
`campaignLegacy.ts` 4bd9e8ed, `tuning.ts` 521d06c6, campaign legacy test 975a94fd, Wave R test 1f3e963a.

## Recorded runs (HEAD equal to remote at each)

- **RED** `1353-p15c1-red-recorded` at c7f3cb76: **72 failed, 6 passed of 78**. 71 leaves fail on the missing module
  `src/core/campaignLegacy.ts`, and the TUNING leaf reads `undefined` where it expects 70. The 6 Wave R retention leaves
  pass, as in 1353-X3 Part A. `fixedSource: true`, every guard exact.
- **GREEN** `1353-p15c1-green-recorded` at 321a4378: **78 passed of 78** in 47.73 s. `fixedSource: true`, every guard
  exact.

These runs close 1353-J note 3: the reviewer had no shell and rested on the writer's runs. The parent has now executed
both files at the landed commits.

A `SessionEnd` hook from an unrelated session rewrote the `HANDOFF.md` AUTO block during the RED run. `HANDOFF.md`
lies outside the guarded source paths, and the postflight index and stage guards held exact.

## Type gates ([1353-L-type-gates.txt](1353-L-type-gates.txt))

Root, UI and Bridge each exit 2, with 19, 2 and 2 errors. The sorted error lines equal
[1352-L-type-gates.txt](1352-L-type-gates.txt) line for line: every error is the known `SaveFileV42`/`SaveFileV43`
fallout in a test file. No error names a P15C or TUNING path. The landing adds no type error.

## Carried

- Into Wave 2 staging (1359-F): 1353-J note 2. `CAMPAIGN_LEGACY_DEFINITION` versioning rests on a comment, and the
  1359-F Amendment 1 validator must prove it with an old-law fixture.
- Into the Wave 4 dossier copy: 1353-J note 1, the pioneer quirk that 1353-F5 ratified.
- Nothing imports `campaignLegacy.ts` yet. Wave 2 wires it in.
