# Project: Studio — P05A Readiness Gate 00

**Revision:** `P05A-READINESS-GATE-00-r2-FINAL`
**State:** `READY`
**Scope:** Final pre-P05 readiness judgment after the Owner-accepted P04 closeout and `P05A-STATIC-CONTRACT-GATE-01`
**Implementation authority:** None. P05 implementation still requires explicit Owner authorization.

## 1. Final judgment

P05A is ready for Owner authorization.

The two mandatory pre-P05 findings are closed:

- `CF-08` — **PASS**. Union-to-C# generation is sound for the approved nullable, compatible-object, and closed-discriminator representations, deterministic under member order, and fail-closed for unsupported or incompatible unions.
- `CF-09` — **PASS**. Contract verification binds immutable committed blobs in the canonical TypeScript and Unity repositories, rejects working-tree and repository/path substitution, and proves the exact Unity consumer that compiled and passed EditMode.

There is no remaining mandatory pre-P05 maintenance. Static-audit findings not named above remain evidence for later scoped work; they are not authorization for broad cleanup. No P05 Production or gameplay implementation occurred during this gate or refresh.

## 2. Final authority ledger

| Authority | Exact identity |
| --- | --- |
| Owner-accepted P04 TypeScript product | `71521efed5dd113a3911c85410d0729eab13918f` |
| P04 documentation-inclusive TypeScript closeout | `4ddb58a38235067e3741a43905e3fc25f414ea0c` |
| Owner-accepted P04 Unity product | `5076af43fcd6a279f26e15a46a8389689b69db74` |
| Final contract-gate TypeScript generator/product | `56e170a8590e18f0d56a494d8bffb413f2d10924` |
| Final contract-gate Unity consumer/test | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |
| Later TypeScript attestation/documentation | `7811377cea1c1b9ddca2c17c626879504b23ed4e` |
| Final post-gate TypeScript campaign | `7811377cea1c1b9ddca2c17c626879504b23ed4e` |
| Final post-gate Unity campaign | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |
| P05 launch package | `044a3d6a16bd4cb90dd55aec5eecd6bedeedf28d` |
| Package 05 design and Builder Annex | `d5653327c17709daea5e17ba00ce164678b9ad43` |
| Visual Direction Package | branch `docs/visual-direction-package-01`; `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md`, Builder Annex, and four `docs/design/mockups/visual-direction-01/*.svg` files at `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |

The final campaign pair includes the non-self-referential TypeScript attestation commit. The exact source pair bound by that attestation is TypeScript `56e170a8590e18f0d56a494d8bffb413f2d10924` and Unity `29aea89a706a7f0961f5a460afc5bdb4d38d8395`.

## 3. Contract identities

The canonical wire schema bytes did not change during the generator hardening, so no version was bumped.

| Identity | Final value |
| --- | --- |
| Schema ID | `sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e` |
| Protocol | `4` |
| Projection | `11` |
| Save | `15` |
| Generated C# SHA-256 | `014a6b128a23b634a33b17643064d992f230295760faa96d790ec03d9256a1b7` |
| Generated C# Git blob, both repositories | `876a6c89b11feae49616ab14476cd4965fe49c2d` |
| Generated fixture SHA-256 | `be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6` |
| Generator source SHA-256 | `974699765b17a809255dc28f1bc0a194ee2055b8e774ced946a9a43129076468` |
| Exact-consumer verifier source SHA-256 | `3d1fc906ffe66f8a25969d95b6379635cffff364daba65ef26d6a405dd0ea5ab` |

The generated output delta is an encoding correction, not a wire change: supported discriminated unions now retain discriminator and member-specific fields through explicit abstract bases, sealed member classes, and fail-closed converters. Current consumers were adapted to those generated types. No generated file was hand-edited.

## 4. CF-08 final proof

### 4.1 Supported laws

- A nullable primitive preserves its non-null primitive type and receives the correct C# nullable form.
- A nullable object preserves the referenced/object representation and nullable semantics.
- Compatible object members merge only after equality checks for property names and types, requiredness, nullability, nested shape, `additionalProperties`, and discriminator law.
- A supported discriminated object union becomes an abstract union base plus sealed member DTOs and a dedicated JSON converter. The converter selects by the closed discriminator, retains member fields, rejects missing, unknown, duplicate, and cross-member combinations, and serializes the concrete member without erasure.
- Conflicting property types, incompatible requiredness, incompatible nested members, mixed object/primitive members, and unsupported array-item unions fail closed with the exact schema path and remediation-oriented diagnostic.
- Union-wide generated order is canonicalized by generated definition name. Reversing schema member order does not change generated output; order inside a member remains schema-authored.

### 4.2 Fixture corpus and mutations

The generator corpus passed `31 / 31`. It covers:

- `string | null`;
- `object | null`;
- two structurally compatible objects;
- a valid discriminated object union;
- conflicting same-name property types;
- required in one member and absent or incompatible in another;
- object versus primitive;
- nested incompatible union;
- array-item union;
- the current quote-request union;
- the current quote-response union;
- the current command union;
- a representative future P05 Production-state union;
- discriminator retention, member-field retention, invalid-combination rejection, containment, round trip, nullability, determinism, and member-order invariance.

Restoring first-member-wins causes `5 / 31` generator tests to fail. Restoring loosest-wins causes `3 / 31` to fail. Reversing members for the discriminated fixture, quote request, quote response, command, and P05 Production fixture produces byte-identical output at the final commit. The pre-fix discriminated fixture hashes differed (`d878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b` versus `7d83ddc83d5ec1f81c304919ef81518a2fedb83e6615b5395fb7b68093106360`), so the order guard is a demonstrated red-to-green correction rather than an assertion-only claim.

## 5. CF-09 final proof

The exact-consumer checker passed `75 / 75`. It binds and verifies:

- canonical TypeScript root `/Users/bruce/The Movies - P05A Static Contract Gate 01 TS` and repository identity `HSpector1/The-Movies`;
- immutable TypeScript commit `56e170a8590e18f0d56a494d8bffb413f2d10924`;
- committed TypeScript path `generated/unity/StudioBridgeDtos.Generated.cs` and blob `876a6c89b11feae49616ab14476cd4965fe49c2d`;
- canonical Unity root `/Users/bruce/Project Studio - P05A Static Contract Gate 01 Client` and repository identity `HSpector1/project-studio-unity-visual-spike`;
- immutable Unity commit `29aea89a706a7f0961f5a460afc5bdb4d38d8395`;
- committed Unity path `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` and the same blob;
- schema, protocol, projection, generated SHA-256, manifest, committed tree, and clean working-tree evidence.

The checker uses `git cat-file`/committed-object semantics for the attested comparison. A matching TypeScript-local copy cannot substitute for the Unity path. The failure matrix rejects wrong repository, wrong root, wrong generated path, wrong branch, stale consumer, one-byte drift, schema/protocol/projection mismatch, dirty TypeScript or Unity tree, missing consumer, nonexistent commit, manifest/blob mismatch, symlink or path escape, and a coincidentally matching filename in another repository.

The TypeScript generator/product tree was clean when `56e170a8590e18f0d56a494d8bffb413f2d10924` was attested; the Unity consumer/test tree was clean at `29aea89a706a7f0961f5a460afc5bdb4d38d8395`; the later TypeScript attestation tree was clean at `7811377cea1c1b9ddca2c17c626879504b23ed4e`. After fast-forward integration, both campaign branches were clean and their local tips equaled their pushed remote tips at `7811377…` and `29aea89…` respectively.

## 6. Unity validation and corrected legacy boundary

The final authorized non-interactive Unity EditMode pass ran against the exact final Unity commit and final generated consumer:

| Item | Evidence |
| --- | --- |
| Unity commit | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |
| Unity version | `6000.3.22f1`, revision `1c726e1fb402` |
| Start / end UTC | `2026-08-30T13:05:33Z` / `2026-08-30T13:06:00Z` |
| Result | `585 / 585` passed; `0` failed; `0` skipped; `0` C# compile errors |
| Generated-union subset | `12 / 12` passed |
| Evidence directory | `/Users/bruce/P05A-Static-Contract-Gate-01-Evidence/attempt-04-final-56e170a-29aea89` |
| XML | `contract-gate-editmode.xml`, SHA-256 `5a228e126629346617b962a605803a474643089772bca15e0a08f377abaafb79` |
| Unity log | `contract-gate-editmode.log`, SHA-256 `39567aa2264da2da342929de8d7ed4897c095b5c63452cce923fa988b0016796` |
| Run metadata | `run-metadata.json`, SHA-256 `a2b3b26e121fa4b3a223a3436c071a8be0f5fb4d530efd8e97b4dcf6ca115a79` |
| Exact-pair verification | `verification-report.json`, SHA-256 `3832378d44d93cf45ff67027940afd23232cf1698f85c0b5c94f7267b3e0dd48` |

The diff from Unity generated-consumer commit `9986f4885c8decc9c12ae9fea80a69bf4bcab42c` to the first correction commit `249f29192d27c5a702dbd685d9593fb09c85737c` was test-only. `StudioBridgeProtocolTests.SnapshotApplication_DoesNotMutateAuthoritativeDto` now takes its before/after comparison at the wire boundary required by the sound generated union representation; it does not weaken the invariant or remove an assertion. Directly mutating `productionOperations[0].statusLabel` to `MUTATED-BY-DIRECT-PROOF`, or mutating it through the store alias to `MUTATED-BY-CACHE-ALIAS-PROOF`, changes the authoritative JSON at byte offset `1436` and fails the same equality assertion. Production behavior and generator-owned DTOs were not edited by that correction.

## 7. Final TypeScript/static floor

All results bind TypeScript `56e170a8590e18f0d56a494d8bffb413f2d10924` and Unity `29aea89a706a7f0961f5a460afc5bdb4d38d8395`.

| Gate | Final result |
| --- | --- |
| `typecheck` | PASS |
| `typecheck:bridge` | PASS |
| generator fixtures | `31 / 31` passed |
| exact-consumer checker | `75 / 75` passed |
| schema tests | `22 / 22` passed |
| relevant bridge tests | `270 / 270` passed across `17` files |
| full `npm test` | `4,775` passed, `5` skipped, `4,780` total, `0` failed across `347` files |
| `check:bridge-contract` | PASS against the exact committed Unity consumer |
| `audit:repo-hygiene` | `1,068` tracked paths checked, PASS |
| `audit:browser-deps` | `0` vulnerabilities, PASS |
| `audit:3d-assets` | `26` assets, `0` violations |
| `build` | `233` modules, PASS |
| `build:studio` | PASS; studio hash `5ee992c8586d5f3e042d90ad5fc82a6437b8f190d6fa1aaf5a56d7e05a743611`; engine hash `e485a54a17054ae6f146039195fd4fab82b80f471f72cd57c3b291c3caf3c069` |
| `audit:studio-packaged` | `82` inputs, PASS |

No baseline failure was waived.

## 8. Attestation and hostile review

The non-self-referential attestation is committed at `docs/engineering/attestations/P05A-STATIC-CONTRACT-GATE-01.json` in later TypeScript commit `7811377cea1c1b9ddca2c17c626879504b23ed4e`. Its SHA-256 is `180ce7df884e142116bfa2c555fa5ed581a2bc876bb3cfd787e2717ace5cf12c`, identical to the external immutable copy in the final evidence directory. It references only already-existing TypeScript `56e170a…` and Unity `29aea89…` commits and was verified without modifying either.

The single fresh hostile reviewer first rejected member-order-dependent discriminated output. The defect was accepted, fixed at its source, regenerated into both repositories, and all affected floors were rerun. The same reviewer then returned **ACCEPT**, with the original blocker closed and no residual CF-08, CF-09, boundary-test, versioning, or P05-scope blocker.

## 9. Changed-path reconciliation

The final refresh examined only:

- the P04 closeout delta `71521ef…4ddb58a` and accepted Unity authority `5076af4`;
- the contract-gate deltas `4ddb58a…7811377` and `5076af4…29aea89`;
- Visual Direction Package ownership and presentation rulings at `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`.

It did not restart comparative research or authorize historical maintenance. The final reconnaissance and charter resolve all previously provisional P04/P05 dependencies against this boundary.

## 10. Entry decision

The engineering gate is `READY`, but P05 code remains unauthorized. The builder may begin only after the Owner reviews the final implementation charter and explicitly authorizes P05 implementation.

Until that authorization:

- do not create Production gameplay code;
- do not merge the final-refresh documentation branch;
- do not treat technical `KEEP`, green automation, or this readiness state as Owner acceptance;
- do not use packaged-player, HID, visual, or Owner proof from another checkpoint as a substitute for the future P05 proof layers.
