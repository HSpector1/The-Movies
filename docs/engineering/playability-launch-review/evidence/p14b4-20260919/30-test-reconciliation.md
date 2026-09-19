# B4 additive reader: bounded independent test reconciliation

2026-09-19 UTC / 2026-09-20 Europe/Berlin. Parent released this test-only lease
after the immutable actual data18/typecheck19 diagnostics and closed capacity22.
Native test-author changed exactly thirteen executable test files; no production,
configuration, fixture, harness, runtime, typecheck, Git or network operation.
These files are handed back FROZEN for parent verification. No GREEN claimed.

## Exact disposition

`tests/p14b4-cast-class-outcomes.test.ts`: add existing new validateSaveV30 import,
explicitly validate/narrow the exported/imported envelope into `reloaded`, and
retain exact equality of `reloaded.state.promises` and the actual outcome state's
promises. No cast, ignored error, broadened importSave return type, skipped
validation, alternate fixture or reduced assertion. This fixes the test's real
historical SaveFile-union typing defect; it does not hide remaining behavioral RED.

The twelve files below retain their historical validator/fixture/migration proof
and live writer29 pins. ONLY unsupported-current-version test cases now probe31
instead of recognized30 and expect the dispatch range1through30 rather than29.
Matching stale test labels/comments were corrected within those cases. The
p14b1 sentinel gets a brief additive-reader-vs-live-writer qualification.
Existing unsupported refusal assertion strengths, separate unknown-version and
range checks, and all older downgrade refusals are unchanged.

This is additive V30 reader recognition, NOT the future live writer cutover.
Actual18's old sentinel failure is preserved. A read-only narrow rg confirmed no
old30 sentinel/range29 expectation remained in these twelve cases, and showed
all existing live29 and SaveFileV29 downgrade pins retained. No broader sweep.

## Exact post-edit files

| File under tests/ | SHA256 |
| --- | --- |
| p14b4-cast-class-outcomes.test.ts | 5a959b0cbb1b156d4126c318434d8b94573b9a8a78fe5afa27d530a507a7721e |
| p14b1-save-v29.test.ts | 900e2509185c75b6ff1623ca5d7c011e8bfa965aa2d04eb4f91131b09c3e53ec |
| p14a1-save-v28.test.ts | 6583816054e4f4b9f8d2e59848da63b6ae23d1c428aec3e239f4fa5a41cdb7e3 |
| p13b-s8-save-v27.test.ts | 35a1ed125e6b6b0b6ce48fb313ef53606ca1b6e42764ff5acccb4c1365b87de8 |
| p13b-s6-save-v26.test.ts | 2047306311a881349a2e3712c74044d0fc6b8bb7c50f3f5bd1a6b559778509ba |
| p13b-r07-save-v25.test.ts | f3bc14e9c4c6b11791c2e0303a009e3ca955a16a02d4879587fe5af880f26008 |
| p13b-s5-save-v24.test.ts | 61ae6cae6ce7b6953868fc8516477539d7c1cec461c8750e4c327c858c278ca8 |
| p13b-s3-save-v23.test.ts | b8f923c65b0c3339e9e1b65bf02f8fc1b0fa4a1dd28985e5954fd6cd31867698 |
| p13b-s2-save-v22.test.ts | b657454a0fbdafd61825b5b6e073725196c294bd7e72e4cb00fcd044ab4533fd |
| construction-save-v11.test.ts | a4c754b187ba612e2020b8523e65211ce1130c04a0ad061df4101b6d8b3008b4 |
| property-state-v13.test.ts | b83b0935745bbda5057c21705fe54e2023e5224b3601cb6495f09e4213870fd4 |
| script-projects-save-v9.test.ts | 6c2e9cbdb882b47b5ddc1571403e359d9d0c29eb8201212da7d60fcbf0eab28c |
| save.test.ts | 57bac1e67ed07a89b8c46f6e6f694a753893bffdd6d69aa5ff52dd62a838f0a9 |

Parent owns full diff review/identity and serialized checks24/25/27/28 and
checkpoint29. This record is an authored disposition, not execution evidence.
No genuine historical artifact or archived producer recipe changed.
