# Bounded P16 type repair

Changed only the isolated P16 draft at `/Users/zacheryspector/studio-specialists/p16`. Four target originals were copied byte-for-byte and SHA-pinned in `BEFORE.json` before editing. `CHANGED-FILES.json` pins retained originals, current results, copied results and both patches. Complete literal projections and forward/inverse whole-source restoration were checked using Python stdlib only. No tests, compiler, candidate imports, Git mutations, main-repository changes or Claude log/progress edits occurred.

## Exact change and source rationale

- `src/core/financeReport.ts`: add the three missing exhaustive ledger labels. `rightsConsideration` remains signed sale proceeds/purchases/licence fees; `dueDiligenceFee` remains its own fee; `acquisitionOutlay` remains acquisition consideration net of the target cash. This reflects existing `types.ts:407-412`, `hollywoodTypes.ts:59-66` and `rights.ts:601-609`; it does not recategorize transactions or change signs/amounts.
- `src/core/save.ts`: add explicit `true` engagement entries for those three kinds. Existing P16 transaction rules require an entered, operating studio, including completed player founding (`rightsFinance.ts:41-56`). Actual player cash is ledger-backed; rival cash is account-backed (`rightsFinance.ts:96-111`). These are managed-operation transactions rather than the deliberately unengaged `production`/`boxOffice` kinds. The exhaustive `satisfies Record<LedgerKind, boolean>` constraint remains. Frozen validation policies, version numbers, migrations and transaction producers are unchanged; historical versions still cannot contain P16 kinds.
- `tests/p16a-save-v46.test.ts`: replace the two sale-fixture sources with the admitted `transaction` form and an explicitly missing transaction placeholder, and the archive-fixture source with its matching `estate` form. These remain deliberately invalid saves targeting prior-holder, future-date and absent closed-estate checks. Existing `rights.ts:714-755` performs those checks before transaction/estate source reconciliation. No real transaction or closed estate is fabricated, and assertions remain byte-unchanged.
- `tests/p16a-valuation.test.ts`: replace two invented `test` sources with `manual`, the existing pure fold-fixture source admitted by `recordTitleEventForTest` (`rights.ts:545-547`) and explicitly refused for persisted saves by the existing title-source validator. The valuation fixtures do not become purported executable transactions. No production type union or validator was broadened.

## Prior RED and current verification limit

The original independently authored compiler result is `/Users/zacheryspector/studio-scratch/1370-ar-p16-rights-estate-implementation-20261010-r1/evidence/tsc-run1.txt` (18,315 bytes, SHA256 `a049c1c4aa3f6aa08263eeeb11fca6a29737f0891d607432a0d324f6b5399239`). The exact log is also copied under `prior-evidence/`; `PRIOR-TARGET-DIAGNOSTICS.json` records its eight target headings with retained log line numbers:

- log line 12: `financeReport.ts(6,14)` TS2739, missing three `Record<LedgerKind,string>` entries.
- log line 27: `save.ts(7052,12)` TS1360, missing three exhaustive boolean entries; log line 29: `save.ts(7055,10)` TS7053, indexing that incomplete map.
- log lines 128-132: five TS2322 discriminants at save-test lines 154/159/187 and valuation-test lines 201/273.

This is a source repair, not a successful compiler result. Other recorded diagnostics (rights narrowing, current-rights-root/historical-save assumptions and bridge extension imports) remain outside scope. Root owns bounded checks and a separate reviewer owns independent patch review. No full P16 or integrated save-era acceptance is claimed.

## Writer/concurrency boundary

The process check found no argv referencing the clone. Earlier observed Claude PIDs 80155 and 81602 had cwd `/Users/zacheryspector`, and no P16 compiler/test worker was observed. This does not establish that an idle editor cannot later write. Each original was stable while copied; final actual bytes equal only the authorized literal projections of those retained originals, so an unexpected concurrent change to any target would have stopped package completion. The final package is a point-in-time source record. All other Claude drafts and progress/log files were preserved.
