# Reconciliation 02 — bounded read-only check (2026-09-12)

**Checker:** one read-only Sonnet agent, bounded to the four checks named in [`../P16-RECONCILIATION-02.md`](../P16-RECONCILIATION-02.md) §9. It edited nothing. **Verdict as returned: PASS WITH NOTES.** Every finding was dispositioned before commit as recorded below.

## A. Arithmetic — no errors found

The checker re-derived every figure in Reconciliation 02 §5.3–§5.6 from the inputs stated in the prose (not by re-running the script) and compared them with the tables and with [`../calculations/reconciliation-02-ledger.OUTPUT.txt`](../calculations/reconciliation-02-ledger.OUTPUT.txt): star weekly $38,462, guarantee $4,000,048, capped charge $1,000,012, arbitrage gains $3,000,036 / $2,000,024 (§5.3); Σ guarantees $5,200,048, Σ charges $1,520,012, book $5,350,000, operating range $4.7M–$7.4M, all five K0–K4 columns and the old-rule row ($1,299,952 → $2,819,964 → Δ −$1,680,036) (§5.4); Ridgeline FRP $700,000, lot reserve $1,740,000, claims $1,520,000, surplus $280,000, net outlay $300,000 (§5.5); Scenario E deal 1/2 exits, transfers, outlays and reserve tests including the $1,434,000 shortfall and the $366,000 margin (§5.6) — all matched exactly. It confirmed no guarantee is counted twice in any §5.4 column and that book, liquidation, operating value and transaction price are four separately defined quantities in §5.1.

## B. Requirement coverage

Requirements 1, 3 and 4 found fully satisfied with no missing sub-item (§2; §4.1's dedicated rows for retention / refusal / residual work / unretained people / guarantees / free agency / no second studio or label; §5.1–§5.7 with the explicit $4M / $1M case and the explicit "does not" list). Requirements 2 and 5 satisfied at the reconciliation and register level; two leftovers in the report body (findings 1–2 below) undermined them until fixed. The register asks no "is loans / failure wanted" question.

## C–D. Findings and disposition

| # | Severity | Finding (checker's locator) | Disposition |
|---|---|---|---|
| 1 | MAJOR | Report §18 "What goes to P16D or later" still said "debt/equity instruments (a separate, currently `OWNER-BLOCKED` P11 gate, `P11-REQ-041/042`)"; §19's "debt transfers" row repeated "P11-REQ-041/042 OWNER-BLOCKED" | **Fixed:** both passages re-marked `[R02]`; loans stated as OWNER-SELECTED PRODUCT DIRECTION F / NOT YET IMPLEMENTED; investors, external financing, bailouts and acquisition financing beyond the P15 loan law named as outside the direction |
| 2 | MAJOR | The same §18 paragraph still called the orphan-IP backlog "a genuine new Owner decision … not resolved here", contradicting register C-9 | **Fixed:** replaced with the C-9 default (archived estates' rights stay unowned history; a later claim mechanism is optional) |
| 3 | MINOR | Reconciliation §8's supersession log omitted findings 11, 13, 20, §12, closing-table row L and Appendix B row R28, all of which carry `[R02]` | **Fixed:** §8 log completed (and the §13/§14/§18/§19 sub-items it had summarized are now itemized) |
| 4 | MINOR | Review index said "71 bounded `[R02]` edits"; the literal tag count differed | **Fixed:** the index now states the literal marker count after all fixes |
| 5 | NOTE | Scenario E's "old" column in §5.6 reproduces `scenarios/SCENARIOS-EF.md` (lines 48–70, 85–104) exactly but cannot be re-derived from §5.2's formula alone | **Accepted as is:** the column is labelled "old" and the archived file is the derivation; the corrected column is derivable from §5.2 |

Links: every package-relative link in the reconciliation, the register and the review index resolved (this file was the one expected gap and now exists); register IDs C-1, C-9, C-10, C-11, §4 and §6 exist; the annex header block and the three scenario banners match reconciliation §2/§7.

**Limits:** the check did not re-read the evidence dossiers, did not verify code locators (the author re-verified `calendar.ts:3`, `hollywoodTick.ts:165/169`, `actions.ts:16-18`, `employment.ts:167-179`, `tuning.ts:387/391` and `hollywoodValidation.ts:163/331` against the accepted tree at `13370d42` directly), and did not run any build or game.
