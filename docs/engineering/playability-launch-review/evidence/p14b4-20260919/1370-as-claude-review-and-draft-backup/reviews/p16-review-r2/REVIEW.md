# Independent P16 type-repair R2 review

Decision: **ACCEPT_BOUNDED_P16_TYPE_REPAIR_SOURCE_ONLY**.

Concrete findings: none remaining within this four-file repair. R1's migration-behavior finding is resolved by the exact authorized successor. This accepts source repair only; `executionAuthorization: false`, `testsExecuted: false`, `compilerExecuted: false`, `fullTypecheckAccepted: false`. Whole P16 qualification, other compiler errors, producer integration and actual save-era assignment remain open.

## R1 correction verified

The complete R1→R2 executable-source delta changes only `src/core/save.ts`: the two-line misleading comment becomes an explicit three-line historical-table explanation, and exactly `rightsConsideration`, `dueDiligenceFee`, and `acquisitionOutlay` change true→false. Independently reconstructed the expected one-occurrence literal substitution and compared the entire final file. No validator, gameplay gate, type union, transaction producer, numeric amount/sign, schema/version or test assertion changes occur in this delta.

The prior map lookup for each absent modern kind returned undefined. The only inspected use is the `.some(ledgerKindProvesEngagement)` condition in `convertV5ToV6`: explicit false preserves that falsy condition rather than newly proving engagement. Frozen `validateSaveV5` at1055–1070 remains tolerant; `checkEnvelope` at767–796 does not check ledger kinds. Neither the new source comment nor corrected REPORT.md claims these kinds are rejected/unreachable under that validator. The report explicitly withdraws both the original producer-engagement inference and the initially considered unreachability hypothesis. No new migration admission rule is introduced.

The corrected comment accurately limits these entries to current-union exhaustiveness in a historical reconstruction. It neither grants current P16 transaction authority nor claims an entered/founded studio proves the separate persisted `economyEngagedEver` fact.

## Preserved accepted changes

All three other files equal their retained R1 after copies byte-for-byte: finance labels correspond to existing P16 money kinds; three invalid-save source replacements retain prior-holder/future/closed-estate assertions; two pure valuation fixtures now use the already-existing manual fold source. Their semantic review is carried from R1 without claiming tests passed. The existing persisted-source validator still refuses manual sale events; no production union was broadened. The R1 review's narrow caveat about the unknown-prior-holder fixture not separately proving the later known-holder continuity branch remains a coverage limit, not an R2 defect.

## Authentication and restoration

Authenticated all18 R2 manifest payloads by actual byte length/SHA256, the preserved R1 manifest, original backups and actual current clone final bytes. R2 Claude-original copies equal the R1 original snapshots. All four actual clone files equal R2 after copies at review time. Verified R1→R2 and reverse, and full original→final and reverse: ten complete in-memory patch applications, each with exact context and complete file equality. Regenerated every unified diff byte-for-byte; no patch was executed against source. The original R1 package and rejected R1 review remain preserved.

| File | Final bytes | Final SHA256 |
| --- | ---: | --- |
| src/core/financeReport.ts | 18348 | `0b968869d10515b24959b7b531d7ecf33743fc04564e5c0a37134bea466c0ad6` |
| src/core/save.ts | 528188 | `980f5cc6e400de29f7a07f453dffb632a0e967780ab3ac288e49d951994fe060` |
| tests/p16a-save-v46.test.ts | 13960 | `fddd223732a049140a2c47e87a71a9f4d9183b84166e016b2c6bce3d56c12a15` |
| tests/p16a-valuation.test.ts | 20928 | `8bd6c6f39d4bdf75ed282a586e2545a5b5aae13431c707bdc34a3c0a99bc4a23` |

## Exact review inputs

| Role | Path | Bytes | SHA256 |
| --- | --- | ---: | --- |
| R2 source manifest | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/SOURCE-PINS.json | 4860 | `68e36e63e31f83e51d07045632617788223e75ab2f06725341f5109b431427e0` |
| R2 report | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/REPORT.md | 3539 | `9cc7c100382f76d76136a5130634044534bc070c066dcc5bcfa2f70e6352a7a5` |
| R2 changed files | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/CHANGED-FILES.json | 6902 | `8f13fe856c83409809987c723b8a89a9cd0b1de0a3a9225dc88358e1ade4c543` |
| R1→R2 patch | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/R1-TO-R2.patch | 941 | `1ae3090d668d0c0196ec06a21928ab110b21e6bb7d8b05539ddff330a2ec71db` |
| R2→R1 patch | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/R2-TO-R1.patch | 941 | `1d9d12bff487a7f381dc634d6c1a22b2e6292e9eb68ce3feeffddbe89c97b762` |
| Complete final patch | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/FINAL-FOUR-FILE-REPAIR.patch | 5191 | `cac7b8424c9de278e6139115429c74d18f539b55f8388adfc35558de33fe780c` |
| Complete final inverse | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r2/FINAL-FOUR-FILE-REVERSE.patch | 5191 | `7e7c64fe9a4e30172a5b22e00eed391f4fa2a25e55da68c3975ddc59c2b1d400` |
| Preserved R1 manifest | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/SOURCE-PINS.json | 4777 | `a2d6ca6074a584df55d6c9e401da29a13fe24c30decd6e3efa5c413be9308b33` |
| Preserved R1 independent STOP | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-independent-review-20261010-r1/REVIEW.md | 8816 | `67ec5fa369e2e7a7cffa39dab0aef618d2469b3256fabdc91fc2e3a4413a084f` |

Only named retained/public source and metadata were read. No compiler, tests, candidate imports, Git operations, protected/fixture/dependency traversal or source edits occurred. The review document is the sole reviewer write. This point-in-time check does not establish that an active specialist clone has no unrelated changes.
