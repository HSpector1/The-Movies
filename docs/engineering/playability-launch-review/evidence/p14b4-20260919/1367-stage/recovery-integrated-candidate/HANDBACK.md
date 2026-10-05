# Integrated 1363 recovery production candidate

Status: scratch assembly complete, ready for independent static review and parent-controlled typechecking. No typecheck, Node, tests, runtime, fixture payload access, live source/index edit, commit, dependency installation or nested agent was performed. This is not measured RED/GREEN, landing approval or G-L closure.

## Source and reproducibility

Base is published `57aa8eeceee37c9b667f68098f2e9d1186a3de38`, source tree `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`. `base-source.tar` preserves that exact source plus package.json, package-lock.json, tsconfig.json and tsconfig.src.json. `base/` is the extracted unchanged copy; `candidate/` is the integrated tree. There are 188 source files and four root configuration/package files. No fixtures, tests, bridge, generated outputs, node_modules, git metadata or symlinks were copied. Existing baseline archives and completed G-L results were untouched. Parent may arrange dependencies separately before a later authorized typecheck; none was needed for this assembly.

The source identity still equals the original Save45 baseline. During preparation, the parent published `858cd9d24903da6fea1b59662bc154d6b9184480`, whose only source changes from this base are the exact reviewed F6 quality patch in campaignLegacy.ts and save.ts. `against-858cd9d2.patch` is an additional convenience delta against that immutable checkpoint and excludes its already-present quality changes. It is not a second patch to apply after integration.patch.

Authority read: adopted E/1367-I and E/1367-stage/recovery-preparation-manifest.json, every applicable production handback and independent review, and the F6 quality handback/review. All relevant published manifest patch, handback and review hashes were checked before assembly. Inputs are preserved byte-for-byte under `inputs/`; their source paths and hashes, exact per-file before/after hashes and all actual hunk positions are in APPLICATION-LOG.json.

## Assembly order

1. `/Users/zacheryspector/studio-scratch/1363-part-a-production-prep/part-a-production.patch` — `2b11a5c13259b69ddcea3476b826c6eba690b7ea82facfa11e2aff03352bd5d9`.
2. `/Users/zacheryspector/studio-scratch/1363-part-b-policy-production-prep/part-b-policy-production.patch` — `5c92dd24a8c7f9413259e7212a8570242b22c252ebbb9bd81b8307bba7b0efe4`.
3. `/Users/zacheryspector/studio-scratch/1363-part-b-tick-production-prep/part-b-tick-production.patch` — `e3016b96fa033e20959e6ac8802d4cbae49b30bfe7e938fee1dd2f5062c18e18`.
4. `/Users/zacheryspector/studio-scratch/1363-part-b-commitments-production-prep/production.patch` — `b4303c5670ccf3ad289102a7b3f6f949af6f84782290b888e2b8e08c6fb0642e`.
5. `/Users/zacheryspector/studio-scratch/1363-part-c-production-prep/part-c-disposal-production.patch` — `29d5ce1f31049c759702dac2d836fd052c01cd0722cb0c1aefce86d81f1a55b7`.
6. `/Users/zacheryspector/studio-scratch/1363-part-c-production-prep/part-c-tick-integration.patch` — `9247157072bd4969ca134bc3be653281807453d712e08c19f687f0a82d1e5500`.
7. `/Users/zacheryspector/studio-scratch/1363-save46-shape-production-prep/save46-shape-production.patch` — `de39b307c6d66521f22c615fed0845ba2a2faa7e001a9c46d36b924d695ed048`.
8. `/Users/zacheryspector/studio-scratch/1363-part-c-validation-production-prep/part-c-owner-validation.patch` — `65b014b55d9b018ccb889ff54e51004b6407f4e71783694ee967a16deab130d5`.
9. `/Users/zacheryspector/studio-scratch/1363-save46-envelope-production-prep/save46-envelope-production.patch` — `08a5e12ca3b57d7af3b3630cf03928fff06caea1f0cd39b866c0115ccbc2a3ec`.
10. `/Users/zacheryspector/studio-scratch/1363-save46-owner-integration-prep/save46-owner-integration.patch` — `5e2c150f2ff6d0e00a551f4f6c7296a9a99730234522bc21a80f2fffd09fc699`.
11. `/Users/zacheryspector/studio-scratch/1363-old-era-period-production-prep/old-era-period-production.patch` — `8527738dbee6a51f9e5230d5d297a5b375837b60971edfef3eea06bda6a932f0`.
12. `/Users/zacheryspector/studio-scratch/1361-quality-prep/production-quality.patch` — `7be9bbd6b99e828824679d12303e2f73bd56dc5490d72409bbbd9215e65e0a03`.
13. `parent-authorized additive public-index-exports.patch` — `30fab513646c3a3dd5b0c879fab23ffe7409d9a1054ab7b57b19a6ef51e6e61b`.

The first 12 patches applied additively with every old hunk's complete text matching exactly once in its evolving file. Only line offsets changed; there was no context trimming, fuzz, rejected hunk, conflict, manual code resolution or candidate-file replacement. `mechanical-resolutions.patch` is intentionally empty. The reviewed disposal, owner proof, envelope, owner integration and old-period layers retained their declared predecessor order.

The final index delta is newly authored under the parent's explicit follow-up authorization. It follows the existing Save45 export pattern and adds only validateSaveV46, convertV45ToV46, convertV46ToV45, migrateToV46, SaveFileV46 and GameStateV46. It does not change implementation or save law. The original reviewed 12-patch integration is preserved separately; this new delta still needs parent/static approval.

## Fixed outputs

- `reviewed-12-patch-integration.patch`: `9a68e816f5a3ea9edd8e1f429774d5756c69490e5df2b28a7d39e438f81d928f`.
- `public-index-exports.patch`: `30fab513646c3a3dd5b0c879fab23ffe7409d9a1054ab7b57b19a6ef51e6e61b`.
- `integration.patch`: `7f1a89d2b55f423e068b8a56254e736a1daeb056812e565538260cd7c1dbcf0d`.
- `against-858cd9d2.patch`: `45a0d62c6a19c173cc1d7b5ad989ac07a6f83a9f3883eaca26f2414bc5610045`.
- `FILE-INVENTORY.json`: `4c8897990b80a5f71a733aeb2a8e33cd70af54f1eefbbd1f379f2cc93c93436f`.
- `base-source.tar`: `5a28049ae9b722f34f5f5e591c823edad767651b248c80296a80b4d09a37e964`.

FILE-INVENTORY.json records every archived file's base and final hash. The final combined diff changes these 13 files:

- `src/core/campaignLegacy.ts` — `48e1d086deaaf82a82d05f0a8065bca9b7a7ea35bc68051ea06c33ceb3a0e8de`.
- `src/core/employment.ts` — `ad7f32db9f5a5ed6b5d11a26a25604ab71df07daba0e273214336e92d8c0f1bf`.
- `src/core/hollywood.ts` — `7e9e26ac92689a2db5ad9e239c90b6203b4f1084b1aca8f68064c9908569a441`.
- `src/core/hollywoodPolicy.ts` — `ea2994dbb980aa60ce70d1e53ecc6c2a0acf1365145f0e6aad148e5cd0a9bce1`.
- `src/core/hollywoodTick.ts` — `6da40c08e4aee457f01b6c1804acb2a79679d7a49f8b7db15b184ad0b1c7eaf0`.
- `src/core/hollywoodTypes.ts` — `65a54dc851cd1f61f8b97674ed825b343a8ec94ab7b8328ad113f12343a41a84`.
- `src/core/hollywoodValidation.ts` — `ec8cf7290a63389087750967fcbe456159eaf2840770341ce3c9cf7d9f75c214`.
- `src/core/index.ts` — `25b07f15ee0fe71484faab449b5c50aa407832cae1b4f4196b70c4944244de4b`.
- `src/core/rivalResearch.ts` — `e24566c984414a66fbfb896481dbc6d8f742bf7fa36702aec0a211b15d513d18`.
- `src/core/save.ts` — `cd4a1d42d02fee6280e2a658ba304448c0ab93c0e57fd8866ef5a65e0072c035`.
- `src/core/talentMarket.ts` — `feaf3ef75051583820addb8b3b00065925464e5a2ca265c3d328102c22aa5957`.
- `src/core/technologyRival.ts` — `fd9764c20f5a649be3b51e23533cd4208fd59c049b1b2a166d89a9bbb35c0336`.
- `src/core/types.ts` — `114efba3aece83977c63fc8c5f5f77e9ce966807fcaed9b89625e608d715f9ee`.

## Consequential seam inspection

- Part A remains an opt-in locked refusal re-search. The existing chooser/default path and cash-free scoring law are preserved; added unaffordable viability never enters the affordable choice. Part B's policy consumes actual tick facts. The staff adapter distinguishes renewal, film vacancy and Scientist vacancy cash refusals; scheduled decision early returns converge on one entry evaluation. Original non-cutting R3 and ordered termination arithmetic remain in place. Greenlight clears since; no additional commissioning pass was introduced.
- hollywoodTick.ts:407–422 retains purchase, staff, plan admission and research before decide, then calls the shared disposal pass once before operation/opex. It adopts account, operations, receipts and nextReceipt only. Research's active-work loop stays outside new-work suppression. The market owner at talentMarket.ts:1337–1347 withdraws actual cutting issuers before settlement and later suppresses new proposals including the extension path.
- rivalResearch.ts:202 exposes `admitRivalPlans(state, era: 'recovery' | 'pre-recovery' = 'recovery')`. Explicit pre-recovery is the validated V27 staging seam and forwards `research-v27` to the money owner; the internal weekly call remains strict live. The historical roster excludes both later termination and refund kinds at new-period creation. No missing-field era inference or post-booking repair was introduced.
- Save46's live alias, writer, dispatcher and LIVE_SAVE_VERSION agree at 46. The public index now exposes the matching APIs/types. Public historical validators retain false recovery flags; the two new flags reach Hollywood through the private chain. Public46 and direct live profession proof call the original-state disposal authority before any frozen lowering. The latter then strips only cutting and retains refund/tombstone/body absence with the explicit false/true pair. The full existing admission chain still follows. Public46 checks current proposals on the admitted original state after that chain, preserving authority hidden by V28 lowering.
- Persisted disposal proof remains independent of current since. Hollywood's exact new money/receipt laws and positive-refund exception are explicit-era only. Laboratory opex ends at disposal; tombstones retain operational authority. Downgrade checks all three facts in the adopted fixed order before any empty projection. All lower migration additions and frozen builder guards are retained from the reviewed envelope layer.
- The F6 quality patch is independent of recovery law: one malformed-lens object guard and four comment changes. Its two save.ts comment hunks matched exactly after the recovery changes. No catalogue/evaluator/pin change was introduced.
- Narrow bridge/generator inspection found no independent Save45 constant to edit: bridge/session.ts:139 and runtime-checkpoint.ts:501 consume exported LIVE_SAVE_VERSION. The bridge contract generator uses protocol/projection schema constants, currently 4/57, not the save era. The fixture generator imports its fixture-specific schema constants; no fixture payload was read. No bridge, generated contract or generator edits were made. This source-only scan does not establish bridge runtime compatibility or generated-output verification.

## Remaining integration and evidence requirements

The assembly is textually coherent, not compiled. Parent must typecheck the candidate, inspect actual diagnostics and authorize precise fixes before runtime. In particular, the new policy/employment import cycle and all widened historical aliases require real compiler/module initialization evidence; exact patch application cannot prove those properties. The old V44 comment saying no flag descends below it remains the prior nonblocking documentation finding; it should say no relationship flag. It was not silently edited in the exact patch assembly.

No RED/test/capture patch was included. The separate tests integrator owns historical caller selection (including lifting the old raw26 smoke through public27), the installed own-era call, version sentinel and actual new Save46 exports. I informed that author of the exact candidate API and hashes. All fresh, frozen, migration, invalid input, direct profession, C7 first-refusal, actual staff-adapter and positive work/disposal controls still require measured valid premises. Absent API, compile failures and missing route witnesses remain prerequisite failures rather than intended behavioral RED. The previously reviewed staged RED sequence remains authoritative; this assembled GREEN candidate alone does not retroactively establish RED.

The preserved genuine45, genuine old26 and A8 capture disposition stays with the parent. Part A landing conditions, independent review, appropriate fallout/performance/broad gates and the original Save45 G-L post2040 player-release cost requirement remain open until their governed evidence or explicit sequencing disposition. This scratch preparation neither waives the failed operating route nor changes its policy, money, contracts, horizon or archive. Later actual distress-loan principal exit belongs to the approved later loan producer; no fictional loan path was added here.
