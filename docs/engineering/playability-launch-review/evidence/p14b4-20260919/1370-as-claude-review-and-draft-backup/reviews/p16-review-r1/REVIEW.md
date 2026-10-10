# Independent bounded P16 type-repair review

Decision: **STOP_R1_HISTORICAL_ENGAGEMENT_BEHAVIOR_CHANGE**. One concrete finding prevents acceptance of the four-file R1 repair as written. The finance labels and five test-source discriminant replacements are acceptable within the reviewed scope. No whole compile, focused test, current save-era, P16 integration or gameplay pass is claimed.

## Finding: true entries alter a tolerant historical migration

R1 adds `rightsConsideration: true`, `dueDiligenceFee: true`, and `acquisitionOutlay: true` to `LEDGER_KIND_PROVES_ENGAGEMENT` in retained `after/src/core/save.ts:7052–7056`. Its comment and REPORT.md state that these transaction rows prove engagement.

The inspected producers do not prove the persisted D-11 economy engagement fact: `rightsFinance.ts:41–56` checks entered identity, founding completion, estate absence, condition stage and loan; it never checks `economyEngagedEver`. Player rights actions at `actions.ts:3093–3109` use `requirePlayerStudioId` at lines2896–2899, which only requires an industry identity. Diligence and bids do use the permitted-bidder gate (`dueDiligence.ts:30`, `estate.ts:104`); bilateral buyer checks do too (`assetSale.ts:108,153`). Seller receipt eligibility is not the identical buyer gate (`assetSale.ts:110–111,183–184`). Absorption is gated and still a held closing prerequisite (`acquisition.ts:56–60,70`). Thus these facts cannot be silently equated with the separate persisted economy fact.

Crucially, the three lookups are not unreachable under the frozen V5 validator. `save.ts:1055–1070` calls `checkEnvelope` and only V11–V14 authority refusals. `checkEnvelope` at767–796 checks envelope/seed/broadcast fields, not the ledger-kind enum; the historical tolerance is explicit at799–802. The strict `v8LedgerEntry` enum list is not invoked by validateSaveV5. `convertV5ToV6` at7064 first admits through that tolerant validator, then reads this map at7069. Before R1, the missing modern-kind lookup produced undefined/falsy; R1 true can newly set `economyEngagedEver` for an admitted V5-tagged envelope containing one of those kinds. No candidate execution was needed to establish this control-flow difference. This is not a claim about a genuine historical V5 producer having authored such a row.

Smallest recommended correction: retain all three explicit entries as **false**, preserving their previous falsy behavior and the exhaustive `Record<LedgerKind, boolean>` type constraint. Explain that modern P16 kinds are included for current-union exhaustiveness but are not used as historical V5 engagement evidence. Do not change frozen validators or invent a new gameplay guard in this repair. Root and the repair writer were notified before acceptance. An initially considered “V5 rejects P16 kinds” explanation was withdrawn after the exact V5 path was inspected; it must not appear in an accepted successor.

## Four-file scope and independent restoration checks

Authenticated all18 SOURCE-PINS payload roles by actual byte length and SHA256, plus the manifest identity itself. The package names exactly four changed files. Current clone bytes at review matched each retained after copy. Regenerated complete unified forward/inverse diffs match REPAIR.patch and REVERSE.patch exactly. Independently parsed/applied both retained patches to full source in memory: four forward plus four inverse applications restored the named whole files exactly. No patch was applied to a clone or repository by this reviewer. This proves the admitted repair scope, not that an entire active specialist clone has no unrelated work.

| File | Before bytes/SHA256 | After bytes/SHA256 |
| --- | --- | --- |
| src/core/financeReport.ts | 18156 / `53667586cbeb4456a2b2f150b11bb1233c41ee7e9e36dcbe0952522eb3fc18ea` | 18348 / `0b968869d10515b24959b7b531d7ecf33743fc04564e5c0a37134bea466c0ad6` |
| src/core/save.ts | 527881 / `2f43c7e638398ab8dcfea6923962b653674b55b4070ffae656c097dadc3238f7` | 528119 / `496412f0a6eaa3c192e2a22d17a671199dc4d38f006d697088bd7e068ef3fbac` |
| tests/p16a-save-v46.test.ts | 13868 / `363e74e47d26bd0ac5e21ee8054561af624ecb6b46cf8132d1e37b6e4dc9c12f` | 13960 / `fddd223732a049140a2c47e87a71a9f4d9183b84166e016b2c6bce3d56c12a15` |
| tests/p16a-valuation.test.ts | 20924 / `afa081dc6a0c9cc9286996f54625685fec5a0a338845ab5d37d15a52a1f08d73` | 20928 / `8bd6c6f39d4bdf75ed282a586e2545a5b5aae13431c707bdc34a3c0a99bc4a23` |

## Other changes and test-boundary assessment

- Finance labels: three new text labels correspond to already-existing LedgerKind/money producers and reconciliation at `rights.ts:601–609,615–625`. No numerical category, sign, cash movement or finance formula changes.
- Save tests: two sale rows now use the existing transaction source with an intentionally absent transaction ID; archive uses the existing estate source with an absent closed estate. Assertions are byte-unchanged. Future date is checked at `rights.ts:723`, prior-holder identity/continuity at726/745, and absent closed estate at749, before transaction/estate source reconciliation at750–755. The pre-existing broken-holder fixture uses an unknown holder, so it can prove the priorHolder guard but should not be described as independent coverage of the later known-holder chain-continuity branch. This coverage limit was not introduced by the repair.
- Valuation tests: both replacements use `manual`, already part of `TitleSource` at `rights.ts:47–48` and the explicit pure fold helper at544–546. They still transfer R2 between the same studios at the same date and retain the bad-score refusal and as-of-value assertions. Persisted non-genesis sale source validation at752–755 still requires a matching transaction, so manual does not become a persisted production transaction.
- No production union, validator, transaction producer, migration version or test assertion is broadened in the recorded patch. The relevant existing source union was inspected; `test` was never a valid discriminant. The known other compiler diagnostics remain outside scope.

The original compiler log copied in this package is authenticated byte-for-byte (`a049c1c4aa3f6aa08263eeeb11fca6a29737f0891d607432a0d324f6b5399239`,18315 bytes). It is prior RED evidence, not a new check. Review performed only named public source reads and stdlib metadata/whole-text comparisons. No compiler/tests/candidate imports, Git mutations, dependency/fixture traversal, production source writes or Claude progress edits. `executionAuthorization: false`; `fullTypecheckAccepted: false`.

## Exact additional reviewed roles

| Role | Path | Bytes | SHA256 |
| --- | --- | ---: | --- |
| repair manifest | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/SOURCE-PINS.json | 4777 | `a2d6ca6074a584df55d6c9e401da29a13fe24c30decd6e3efa5c413be9308b33` |
| repair report | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/REPORT.md | 4343 | `f4973f33af3f7bde1813febdafc29d192cea553cb7dfa4c76e28308505f21d14` |
| changed-file record | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/CHANGED-FILES.json | 5635 | `688771e2cc5c256f6a494a0fe1747909a8b637e2c8061d763a6c607e3614512a` |
| forward patch | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/REPAIR.patch | 5085 | `a6e83db06b4611ab0cc8386a42bbba4b8bad4a587440c7e858248b42bd2b0e4b` |
| inverse patch | /Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1/REVERSE.patch | 5085 | `d6e5ed648fe456ca804cc79db33f0e0560a5db0a4541632d4c969d8e94b7eefa` |
| producer authority | /Users/zacheryspector/studio-specialists/p16/src/core/rightsFinance.ts | 6430 | `8ccd0868172679db203093bfac3501a9dd4113bf960c8e8c5b048a8ea72abfa8` |
| rights verbs | /Users/zacheryspector/studio-specialists/p16/src/core/actions.ts | 132570 | `cafba84230438cda93bacc224aa06671cff639c4b48dc051fe877231b54aa4dc` |
| bilateral cash producers | /Users/zacheryspector/studio-specialists/p16/src/core/assetSale.ts | 17453 | `af56af1c8cf259c123ff7d5c442bfd82b2790036ea046e84cde3e19ee11848a5` |
| diligence cash producer | /Users/zacheryspector/studio-specialists/p16/src/core/dueDiligence.ts | 7733 | `614bb4a0b5989114731db049a773bee572ebd23bc0e73d16cace1ee0b9ec1d37` |
| estate bid producer | /Users/zacheryspector/studio-specialists/p16/src/core/estate.ts | 13723 | `3528715d36f57d3f303c57625d15ec0192fcd72ca85078479c090cd88d97cf19` |
| acquisition gate | /Users/zacheryspector/studio-specialists/p16/src/core/acquisition.ts | 11668 | `771b1edf19aa19e5a5a6d1099e984beedf187a1dd192e1316d44e62668b74919` |
| existing title source and validator | /Users/zacheryspector/studio-specialists/p16/src/core/rights.ts | 58978 | `0eb0792b9c89d37d12c5d2ff33f8afbad066419839d29842c9f26f792c6a9298` |
