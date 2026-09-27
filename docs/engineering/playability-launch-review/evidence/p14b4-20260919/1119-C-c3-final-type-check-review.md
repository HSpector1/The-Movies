# 1119-C — independent final type and generated-check review

Disposition: **KEEP** for the five closed 1095–1099 checks and the explicit Bridge documentation-input guard. This review uses source reads, Git reads and stdlib-only hashing/data comparisons; it executes no compiler, generator, test or project module. Full core/UI results remain separate and are not inferred here.

## Exact candidate and commands

All five records ran on `d8552a0b7caa9a02da17320a203a923134e093b8`, with the same end HEAD, child exit 0, `fixedSource: true`, no signal/error and no untracked consumed source. Every before/after diff hash is the empty SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; all five recorded patches are zero bytes. Independent raw-log inspection found no diagnostics for the three compiler runs and the expected verification lines for both generators.

The literal command arrays agree with frozen `1103-A-c3-final-verification-sequence.md` (16,419 bytes; SHA256 `599a26f832398554be64708132cb5e1d6d4eb5761a636a8917f97462020590d9`). They use unchanged compiler configuration and generator `--check` modes.

| Record | Exact command | UTC start → end, 2026-09-27 | Recorder wall time |
| --- | --- | --- | ---: |
| 1095 root types | `node_modules/.bin/tsc --noEmit` | 08:24:46.095 → 08:25:18.806 | 32.711 s |
| 1096 UI types | `node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 08:25:23.093 → 08:26:06.144 | 43.051 s |
| 1097 Bridge types | `node_modules/.bin/tsc -p tsconfig.bridge.json` | 08:26:42.305 → 08:27:10.853 | 28.548 s |
| 1098 contract check | `node_modules/.bin/vite-node scripts/generate-bridge-contract.ts --check` | 08:27:39.458 → 08:27:40.626 | 1.168 s |
| 1099 fixture check | `node_modules/.bin/vite-node scripts/generate-bridge-contract-fixtures.ts --check` | 08:28:04.272 → 08:28:05.116 | 0.844 s |

`tsconfig.bridge.json` itself sets `noEmit: true`; the shorter Bridge argv does not imply emission. Its include set contains `bridge/**/*.ts`, whose observer imports types from the original 1052 documentation driver. The successful Bridge command therefore includes that actual dependency through normal type resolution. It does not establish that every unimported evidence producer has been compiled; separate producer gates retain their own scope.

The subsequent published checkpoint `6e63f4c82a286dc67271cce0d53a0e586a6b523b` has no consumed-path difference from d8552a0b. Independent Git comparisons show that every changed path between these commits is documentation/evidence, and the live consumed working-tree diff is empty. Thus the current complete-suite source is the same source accepted by these five checks; the recorded checks remain honestly attributed to their actual d8552a0b HEAD.

## Explicit Bridge dependency guard

The independently rehashed before record `1118-c3-final-bridge-doc-guard.started.json` is 459 bytes, SHA256 `017b58c82469551e150ab4ec19ff0035e50ca3c3276c0eae7864233decb8ffa1`. It was written at `08:26:42.057893Z`, before the actual 1097 start, and pins both that exact command and d8552a0b.

The after record `1118-c3-final-bridge-doc-guard.json` is 739 bytes, SHA256 `6ef8be57d9ec13e5573977917c0194f3990082334f8d012ea8517787504f559c`. Its `08:27:34.824281Z` timestamp follows the compiler closure. It binds the exact before-record bytes and exact successful 625-byte 1097 record, retains the same HEAD and records PASS.

Both sides require `1052-c3-active-endurance-driver.ts` to be exactly 66,372 bytes, SHA256 `f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d`. Independent hashing of the actual live file and the d8552a0b Git object reproduces that identity. This is a specific imported documentation-source guard outside the recorder’s ordinary source path set; merely calling the checkpoint documentation-only would not have supplied that proof.

## Recorded artifacts and generated outputs

| Record | JSON bytes / SHA256 | Raw bytes / SHA256 |
| --- | --- | --- |
| 1095 | 603 / `f45dc3d145b51dea07e829a64e3d57cdfc704abaab6180719fe9d817426fd7c8` | 319 / `99f797bee521274a6948f24a6d9d383bf597e7c1f301320f34551fda8a9ed3b2` |
| 1096 | 637 / `34b7acdaaa3cdfa8503eb92d16b8bbf72358ce2e4682ab5e6824d6a97dec5945` | 343 / `5d35a3a3fd813efdc271cb9e1103be941d715c5ed881a577786acb288b4e44ee` |
| 1097 | 625 / `a5f8d892ee65a7fb2735db97cfe7671a15ba54501a2a4806d9f8f40855e08dda` | 336 / `7fb8866427f965e864c08760ba99cc6bd76709cf8c922b6ae725fe133379ae04` |
| 1098 | 651 / `711a725f83646f71740b8bbfa32e3095d479a066d4a6947d6a0b6b7d844ab0b3` | 694 / `543391f02c221f105e22924b6496375efa1ebfab0560f678303e274fa14149c2` |
| 1099 | 660 / `307e307a2511d59e87e344635be5b85f6e7de0c0bdbe3a4f8f467d3dc9552630` | 491 / `3417a8977f05081b1f6475e341b4189f633e27c4069eca6625671794af3d21fd` |

The contract raw log explicitly verifies the checked-in JSON schema, generated C# DTO and manifest. The fixture raw log verifies the generated C# union fixtures. Independent file hashes are:

| Actual checked file | Bytes | Raw-file SHA256 |
| --- | ---: | --- |
| `bridge/schema/project-studio-bridge.schema.json` | 393,733 | `31d58dbbbf09992703dc221d7a3c3d235cb0e9b185e0212599e334d8c7219fde` |
| `generated/unity/StudioBridgeDtos.Generated.cs` | 860,452 | `c727219216f5f71cb35e9b6116b7288da0d0343810e9cee447c5216988ce48b7` |
| `generated/unity/project-studio-bridge.contract-manifest.json` | 820 | `2fd375c17b183e12c714f0f6a4ee438c4cd4c890084ca33207d0c56582f4321e` |
| `generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs` | 44,592 | `be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6` |

These raw file identities are distinct from the semantic bridge schema ID. No output was regenerated by either `--check` command. No Unity/native compiler or project was accessed; generated C# consistency is the measured scope.

The parent’s 1118-C checkpoint description agrees with these actual records. No corrective source change is indicated. Full core and UI results and their case-level attribution remain the responsibility of the separate 1119-A/B completion record; the current unfinished complete-suite run has not been reviewed or qualified here.
