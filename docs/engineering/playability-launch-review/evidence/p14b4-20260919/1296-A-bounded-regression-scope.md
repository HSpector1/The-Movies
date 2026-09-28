# 1296-A — Bounded regression collection exclusions

Source-only audit for the current **no Owner-campaign access** and external-native exclusion. Observed HEAD: `46c356bb71c8220232deb634489e5f5c3a8d5d0e`. This records six files to exclude from any forthcoming broad runtime collection; it does not authorize, select or execute that batch. The historical1100 unfiltered core command supplies no current authorization.

| Runnable file to exclude | Distinct reason and source evidence |
| --- | --- |
| `tests/bridge-p05a1-owner-greenlight.test.ts` | Comments explicitly identify the Owner's real durable checkpoint. Lines29–32 read `fixtures/p05a1-owner-profile-rev2.save.json` at module scope. Confirmed Owner-derived input consumer. |
| `tests/bridge-p05a3-roster-liveness.test.ts` | Comments explicitly identify the Owner's real durable checkpoint. Lines36–39 read `fixtures/p05a3-owner-profile-rev10.save.json` at module scope. Confirmed Owner-derived input consumer. |
| `tests/bridge-contract-consumer-lock.test.ts` | Explicit parent exclusion for consumer-lock/native verification. Lines42–43 import the consumer-lock and verifier modules. Its test fixtures construct temporary TypeScript/Unity repository pairs; this audit does **not** claim the test necessarily opens the actual external Unity project. The explicit exclusion still governs. |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | Lines25–30 load `p20-before-hire.checkpoint.json.gz` and `p20-after-hire.checkpoint.json.gz` at module scope. Source describes genuine Week105/Week106 Owner UX captures. Hold outside collection under the current access boundary; no payload inspection was used to extend or establish their provenance. |
| `tests/bridge-p06-checkpoint-recovery.test.ts` | Top-level reads of `ui/e2e/p06-visual-oracle-v1/s4-release-ready.checkpoint.json` and `tests/fixtures/p06-recovery.checkpoint.json.gz`. Source identifies a historical one-off Bridge producer, but the bounded source read did not establish the original state's generated origin. Parent adopts conservative exclusion pending adequate source provenance; this is **not** a finding that the payload is Owner-derived. |
| `tests/bridge-p12-campaign-library.test.ts` | Lines196 and216 read the same `p06-recovery.checkpoint.json.gz` within tests. It inherits that unresolved provenance hold. Exclude the file for the proposed broad batch rather than assume authorization from an unrelated generated-state test in the same module. |

`vitest.workspace.ts` includes `tests/**/*.test.ts` in project `core`, including Bridge files, and `ui/**/*.test.{ts,tsx}` in project `ui`. Unfiltered core therefore includes these six. Exclude files before collection, using a reviewed file allowlist or explicit file exclusion globs. A test-name `-t` filter alone cannot protect against the module-scope reads above. TypeScript source inspection/type analysis and runtime module execution are distinct; this report addresses runtime collection and imports.

The bounded searches used `rg` literal fixture basenames, test-module references, imports and filesystem/native path declarations in `.ts`, `.tsx`, `.js` and `.mjs` source, followed by relevant source excerpts. Fixture directories, JSON/gzip contents, private paths and external native paths were excluded from the corrected searches. Literal references to the named P05, p20 and p06 inputs in current test/UI source occurred in the five fixture-consuming files listed above. No additional runnable importer of the two P05 test modules was found. This establishes the known-path exclusions, not a theorem about every computed path, environment-dependent import or future source change.

The pure `src/harness/roster-wall/historical-control.ts` adapter mentions the P05 test names in a comment but opens no Owner payload; its consumers are not excluded merely for using that adapter. Similarly, the P04A.2 writer fixture source constructs its world through public actions and a named seed despite referring to an Owner-reported failure. Generic code-owner words, `Native` in web presentation names and repository-generated C# declarations are not evidence of access to an external native project.

`tests/bridge-supervisor.test.ts` uses a temporary root for the native-shaped project, fake executable and HOME in its launch test; its spawned supervisor receives an explicit repository-local fake-Unity entry and temporary profile root. Those inspected paths do not establish real Owner/native access. Its packaged test does invoke the repository build/audit scripts and writes build output, so a later regression plan must account for those operational effects separately. This audit neither adds it to the six access exclusions nor authorizes that work.

**Method correction:** the initial search pattern was too broad and unintentionally returned oversized repository-local UI/e2e generated checkpoint text. That pattern was stopped and replaced with source-extension/literal-path searches. No finding relies on the incidental text. No named Owner fixture, private campaign or external native payload was opened or decoded. No fixture payload was inspected to resolve the p20/p06 holds. No project imports, tests, compiler, engine, scripts or new producers were evaluated during this audit.

Source identities measured without opening their referenced payloads:

| Source | Bytes | SHA256 |
| --- | ---: | --- |
| `vitest.workspace.ts` | 1,228 | `2bb01ef4b7f9f02877e42b425e43f40e3905be769cd6f091cf61a3275563b446` |
| P05A.1 test | 11,261 | `7a3390e8026114dc140421e4c7a06dd7c6d1ff229c4dad6f5eefa00f65b7f4e5` |
| P05A.3 test | 14,670 | `c81b32130d219bc6b48962f9b1324568b3329c5d8f3e49737a7b5eaa7c64e0b4` |
| Consumer-lock test | 39,209 | `fb067514ff919805dd6ec9bb503884a7c8763dfd30989fc2496edb1ec705acd0` |
| Projection20 migration test | 16,460 | `50ed0ac058fc563c2b182d3840ec3a4e4d80575bd1d2c3c0ba26256ca544efed` |
| P06 recovery test | 15,658 | `b2d3c703b5c4155a557753f9cb3de79f597efb325a0d7f600b6e3581e08bb996` |
| P12 campaign-library test | 21,193 | `eb859a672a5f031af22814888cf1d8b530deab326ad98b3a5db127e1e0ced711` |

Q24 source review and its separately authorized historical input are independent of this collection audit. Any broader core/Bridge/UI result must identify its exact selected files and these exclusions, retain unresolved provenance and native limits, and avoid an unrestricted full-suite claim.
