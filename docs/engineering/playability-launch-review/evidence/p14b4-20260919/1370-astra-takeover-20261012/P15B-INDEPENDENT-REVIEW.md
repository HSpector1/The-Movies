# P15B preserved-draft independent review

Reviewer: GPT-6.1 Sol, Codex-native specialist `founding_review_sol`, 2026-10-12.

PARTIAL — retain the repairs; this is not integrated approval. Reviewed clone `/Users/zacheryspector/studio-specialists/p15b`, HEAD/base `8cecf5aa8a7073fdad8a02534fe40d67ba54558e`, with the recovered uncommitted draft bytes. HEAD independently read with safe Git flags. Current draft preservation is identified by the parent at `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-astra-takeover-20261012/drafts/p15b/SOURCE.patch`, manifest and base bundle. This review did not independently hash that preserved patch against the clone. The old package REPORT/MANIFEST are not an inventory of all recovered late edits.

Read-only source and supplied-artifact review. No edits, tests, compilation, heavy scans or delegation were performed during review. This report was subsequently written at the parent's explicit request, in the assigned scratch directory only. No production/HANDOFF/package input was edited. No private saves were browsed; source references to established fixtures and existing test evidence were read. Findings distinguish inspected source from measurements supplied by prior runs. Source remains provisional until deliberate adaptation to the actual landed founding predecessor.

## Consolidated actionable findings

1. **Lot exposure remains incomplete; C3 is only partially fixed.** `ui/src/engine/adapter.ts:2491,2495,2994` defers actual player closure, while rivals still borrow and close. The Lot has no player loan/notices/closed-run presentation; its import rejects an actually closed player (`:3807-3811`). This fixes the immediate player soft-lock, but does not satisfy `1357-A §7`'s separate requirement that a playable build not carry rival borrowing without the player's Wave5 command. `REPORT.md:203,290-295` declares that gap; declaration is not completion. Action: complete the Lot Wave5 route, or record and review a gate/amendment that also resolves asymmetric loan access before claiming playable P15B.

2. **Actual recovery remains unproved.** Atomic O6 reset exists at `corporateConditionLive.ts:171-176`; tests `p15b2-corporate-condition-live.test.ts:364-396` distinguish principal reset and resumed staffing. However, `evidence/r3/balance-r3.txt` and `REPORT.md:256-266` show borrowers re-enter cutting at their next decision and no borrower resumes greenlighting. The implementation satisfies the reset seam, not the intended demonstrated loan-restart outcome. Action: after adaptation, obtain the authorized lawful recovery witness measuring costs, protected/non-core plant, cash and resumed production. Do not inject funds, weaken reserve laws or infer new tuning authority. O1's disposal safeguards remain present in `rivalResearch.ts:339-407`, but integrated recovery qualification is NOT VERIFIED. This is not a claim that every borrower must survive or immediately greenlight.

3. **T17 masked downgrade coverage remains open.** The frozen builder now appends predecessor reasons (`save.ts:6271`), fixing the reported source masking defect. Nevertheless, the affected test leaves still pin the P15B head: `p13b-s3-save-v23.test.ts:120`, `p13b-s8-save-v27.test.ts:198,215`, `p14b5-relationships.test.ts:1450`. `REPORT.md:252` explicitly says coverage was not restored. Action: preserve the new head refusal and recover independently admitted predecessor-era witnesses for the displaced assertions. A first refusal does not test later guards.

4. **C12/C13/C16/C17 are residual work, not repaired implementation.**
   - C12: `powerRankingArchive.ts:27-39` implements prospective cohorts and corrects the old comment, but expressly lacks the cross-definition movement consumer required by closure contract `:38,102`. Boundary coverage exists; movement coverage remains PARTIAL.
   - C13: `bridge/industry.ts:111` exposes the stage only; no adjacent financial-strength band. Keep the declared ranking-slice dependency visible.
   - C16: `studioClosure.ts:375-379` creates title-only R2 lots. P16 must demonstrate the actual-run/estate-event join enforcing active-run encumbrances before sales become live.
   - C17: `bridge/session.ts:1196-1211` offers only maximum principal. Core lawful principal choices remain broader. This is the declared presentation limitation, not a changed loan law.

5. **Week900 nonleak failure needs premise admission before an engine repair.** Saved `evidence/r3/gate-final/batch-4.json` reports a missing disposition for `research:studio-93532614-r01:research:lighting-control-01`. The fixture selects row1 unconditionally (`p13b-s8-nonleak.test.ts:52-56`), then injects employment, laboratory and active research at week780 (`:60-96,103-105`). It checks neither operating status nor live-save admission before advancing. Action: measure that studio's actual closure week and validate the constructed input. If already closed, use a genuinely operating rival while preserving the forecast/announcement assertion. If research existed lawfully before closure, repair and verify the real disposition producer. Current evidence does not establish an engine defect.

6. **Evidence identity must follow recovered bytes and the eventual predecessor.** The recovered source includes late edits absent from the old package inventory; report placeholders and historical classifications cannot qualify those bytes. The advertised final25-file UI run has no recovered output, per `P15B-RECOVERY.md`. Action: use the preserved recovery patch/manifest as draft identity, deliberately adapt to landed founding, then cut a fresh package and run the required focused/integration checks. Preserve old failures and compare messages, not merely identity overlap.

## Repair disposition

| Item | Source-review disposition |
|---|---|
| C1/O6 atomic principal reset | MET WITH source evidence; actual production restart unverified |
| C2 lawful same-week rival/player loan order | MET WITH source evidence, `corporateConditionLive.ts:505-515` |
| C4 private countdown leak | MET WITH source evidence, stage-only labels at `corporateNotices.ts:109-118` |
| C5 rival staff free agency | MET WITH source evidence, deterministic deduplicated append at `studioClosure.ts:273-274` |
| C6 reachable closure obligations | Source repairs present: market withdrawal/invalidation `:280-289`, retained research/adoptions and terminal filtering; final adapted lawful-route evidence required |
| Claim conservation / estate events | Source repairs present, replayed priority/caps and cash reconciliation `studioClosure.ts:715-745`; sequenced estate events `:428-450`; unowned payments refused `:826-834` |
| C10/T19 operating-loop leaks | Source repairs present: shared actual-closure map in `operatingState.ts:10-15`, consumed by market, busy-set, research and deployment loops. P12 ownership interpretation still needs explicit integration disposition; no gameplay exception is implied |
| C12/C13/C16/C17/T17 | PARTIAL, as detailed above |
| Final integrated P15B acceptance | NOT VERIFIED |

The source-review dispositions above do not assert a fresh test pass. This was a bounded preparatory review, not exhaustive verification of every r2 item or every closure writer. Supplied historical run evidence must be reconciled with exact recovered and adapted inputs before qualifying the integrated candidate.

Next action: finish founding, adapt this exact preserved draft, then repair the concrete exposure/coverage gaps and qualify lawful recovery and closure against actual upstream producers.
