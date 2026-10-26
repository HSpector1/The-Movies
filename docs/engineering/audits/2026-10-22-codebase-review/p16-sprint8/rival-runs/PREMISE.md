# Rival buyer of an actual running film — bounded prerequisite

**Candidate supported by existing source/captures; current combined quote/close is unrun.** Reuse R02 buying R01, with explicit retention `[]`, at170 after R01's real film13 releases. This is the existing rival-buyer pair and existing active-run route joined at their real release boundary. It needs no seed search, cash edit, film/run construction, new employment or internal producer invocation. The intended current refusal is `absorption: rivalBuyerRunProducerRequired`. This note does not qualify that producer or claim natural campaign coverage.

## Exact inputs and provenance

Directory: `/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/p16-original48-closure-capture-r2-run` (existing `P16_ORIGINAL48_CAPTURE_ROOT`). Read and hash checks only:

| Existing file | Bytes | SHA256 |
|---|---:|---|
| `CAPTURE-MANIFEST.json` | — | `e7cf4625a1198ff229047460a5c25b82f50e70e5efa2523474abe2ade161a528` |
| `r04-actual163.save48.json` | 1,137,150 | `c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad` |
| `r04-pre162.save48.json` | 1,124,940 | `cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19` |
| `r04-archived176.save48.json` | 1,173,791 | `94fa74dfda8ee4df049e81d6ec0a1b3d61e3eddf8030c8fd623a0d44f6e493de` |

The original producer is HEAD `67077b722e3bd477f57a5b03220e63497dc9957a`, source tree `476b387d65a4c427dc0f6120724e946cf22d7969`. The manifest expressly identifies an existing drained-R04 transaction fixture, not a natural campaign. Keep that limitation. The unchanged R01/R02 facts are reused from that admitted capture; no constructor is rerun or altered.

The actual163 input contains:

- R01 target `studio-aca408ec-r01`: cash10,235,608.262935068; actual stable condition week163, no loan; one paid production `studio-aca408ec-r01:film:13`, start161/remaining7; no runs or unresolved promises; six employment intervals ending208.
- R02 buyer `studio-aca408ec-r02`: cash13,824,449.654646564; actual stable condition week163, no loan; existing own film14 remaining3. Its six employment terms match the original176 capture.
- The player has17,555,000, which is irrelevant to the rival's purchase and must remain outside its fee/outlay accounting.

## Fixed producer sequence and admissions

1. Load the original163 bytes, strict `validateSaveP15B`, then normal `convertV48ToV49`. Preserve raw, strict-old and migrated callers. This exact input/pair is already used by `tests/p16-rival-buyer-absorption163-baseline.test.ts:23–80`; its existing test proves a runless explicit-nonretention rival close at163. The Sprint3 records report that three-case file passed after the Owner-A whole-sum rounding correction; that result does not prove a170 run-bearing close.
2. Exactly seven ordinary `tick` calls reach170, each preserving its input. This follows the already-named film13 completion in `tests/p16-absorption-active-run.test.ts:22–44`, which starts the adjacent actual162 capture and takes eight ticks to the same boundary. Do not close at163, cancel the production or retime its run.
3. Require complete `makeSave` at170, actual stable/no-loan condition for both R02/R01 at170, R01 no active production, its one real film13 run, `weekIndex ===170-releaseTick`, and its original simulation film. The historical176 output independently records film13 release169, settlement174, critic58.249010416421235 and earned5,260,620.5447991565. Thus the historical run has six installments; at170 the opening was already paid and five future installments remain. These historical values are corroboration, not a substitute for the current tick's emitted locked schedule or quote.
4. Call the existing symmetric public core `requestDiligence` with recipientR02, targetR01 and scope `['rights','employment','liabilities']` at170. Require its exact50,000 fee from R02's real account, no player charge, and actual paid disclosure. `applyActions(absorbStudio)` deliberately forces the player and is **not** the rival interface; do not spoof `buyerId` through that Action. The adopted rival test uses `requestDiligence` → `quoteAbsorption` → `closeAbsorption` directly.
5. Use `{buyerId:R02,targetId:R01,retention:{kind:'explicit',contractIds:[]},disclosureId:actualReport.id}`. Compute one consideration using `absorptionAsk(libraryValuationV1(...).total, targetCash−sum(terminationCost(actualTerms,170)))`. Require complete available library value, target willingness, six real nonretained exits, no retained work, one quoted run and full post-transaction reserve. Carry the actual quote-age pair into `closeAbsorption` at170. No amount search, default retention, replacement target or condition reader injection.

The six target capped exits total1,305,330 under the same still-live terms (weekly payroll50,205, cap26). R02 fixed cost is91,732/week and the no-retention purchase reserve2,385,032, matching the existing163 rival quote. Historical163→176 R02 movements show only13 weeks of its fixed cost plus2,863,444.936892003 own-film revenue: no production, marketing, signing, capacity or research spending, and no changed employment. Consequently the historical170 cash is at least13,182,325.654646564 before its positive film installments. This is strong source/capture support for affordability, **not a computed current170 quote**. The draft must ask current `spendableCash`/`quoteAbsorption` and retain any earlier failure. Do not hard-code historical future balances or turn this bound into an injected fixture.

Nonempty title transition is available: R01's existing authored/simulation catalogue and the new released film have genuine subjects. Use `subjectsHeldBy(resolveTitles(state),...,R01,170)` before close and the current holder reader afterward. Film creator identity and original paid prefix remain R01; rights and future revenue beneficiary become R02 only at the actual close.

## Current refusal and accounting boundary

`acquisition.ts:421–422` first permits rival explicit-empty retention, then returns `rivalBuyerRunProducerRequired` when that real target has a run. `closeAbsorption` repeats the restriction at463, and the full absorption validator rejects rival records with runs/receipts at619–623. No partial close is admitted.

The restriction has real unimplemented consumers:

- `absorbedRuns.ts:14–20` returns a no-money path for rival buyers and independently requires a runless target. `validateAbsorbedRuns:62–64` refuses a rival owning any canonical run, handoff, installment or later release.
- The actual player producer emits `LedgerEntry(kind:'absorbedRunRevenue')` (`absorbedRuns.ts:29–35`), which `tick.ts:991` credits to player cash. Reusing that output for R02 would pay the wrong studio.
- `validateAbsorbedRunMoney:47–51` requires player ownership; installment proof at85–87 requires player ledger rows. Rival accounts instead use native period movements; `hollywoodValidation.ts:440` currently reconciles a rival's studioRevenue from its own creator films minus any sold future receipts. It does not yet account for an acquired film's incoming beneficiary receipts. Existing rival money kinds contain no acquired-run-specific category. These are implementation dependencies, not authority to invent a new test output schema.

This exact world is useful: buyer R02's own film14 released165 and settles170 in the historical route, so the first acquired installment input170 coexists with its ordinary final own-film installment. Correctness must reconcile actual R02 account movements without conflating those receipts, crediting the player, returning cash to terminal R01 or moving the film's creator. R01 film13 then settles once at174. Future proof should reuse the existing active-run paid-prefix/locked-schedule/settlement assertions, full save/replay and caller purity; no additional campaign is needed.

## Minimal next decision and limits

The next eligible diagnostic is this exact170 admission through public quote, followed by the named refusal with whole-caller purity. Current runtime is prohibited in this task, so no current170 reserve, quote, run output, close or timing result is asserted. No separate test patch is frozen here: the existing active-run test supplies the complete run sequence, the existing rival-buyer test supplies the exact account/quote interface, and the new rival cash receipt representation has not yet been specified. A sole-lane continuation can adapt one existing leaf once that producer boundary is declared; all setup must stay inside the unchanged5000ms budget. A timeout or preceding quote failure remains evidence, not permission to alter the premise.

The original176 capture contains **zero active runs** for R01/R02/R03, so it cannot be used directly as the desired positive input. It contains a different paid R01 production remaining3, but no alternate route is proposed; the established film13 route is sufficient for this bounded preparation. The R03 estate-run capture is already a closed target and cannot qualify healthy absorption. No broader capture search, runtime, source/test checkout edit or delegation occurred.

Source pins observed on HEAD9c91232d with the coordinator's current uncommitted obligation draft present:

- `tests/p16-absorption-active-run.test.ts`: `c8b0dec556f47d16a55b17ebd7a27e6b2d22cb4a7c6683531a7508e715ec4847`
- `tests/p16-rival-buyer-absorption163-baseline.test.ts`: `356c862cc6f4006a6cb0db8248216a9de14bc8d886a7d74053eec44b900b4c6a`
- `src/core/acquisition.ts`: `6b4539d5ba1e08f2e67c7742ceced117dfe0484827fb034a9b58c8ef1e2f2c3a`
- `src/core/absorbedRuns.ts`: `220ea2e7570a7f14a1f5c410b7c326fcab62c261b988a84e87e23338c9af83f6`
- `src/core/hollywoodTick.ts`: `12611c7c78db0b49b92d6213a0f67c92e89d7b3e86c8d375e18ed3ee5cca37c8`
- `src/core/hollywoodValidation.ts`: `659f0fb2cc3de35c95e3892d39483d1a8629bdb916e49be31da791d3e804c222`
