# P16 Independent Verification 01 — Review Index: Studio Empire, Library & Ownership

**Status:** INDEPENDENT RESEARCH — DOCUMENTATION ONLY · **FUTURE OPS REVIEW REQUIRED** · **Revision 2 (Reconciliation 02, 2026-09-12)**
**Authorization:** none. Nothing in this package is Owner acceptance, an execution instruction, or gameplay scope. It approves no implementation, amends no ruling, and changes no code.
**Assignment:** Future Ops → existing researcher, "P16 targeted independent research — Studio Empire, Library & Ownership" (independent second reviewer). The brief is reproduced in [`ASSIGNMENT-BRIEF.md`](ASSIGNMENT-BRIEF.md).
**Research dates:** 2026-09-11 / 2026-09-12; Reconciliation 02 on 2026-09-12 (reviewed commit `5239dc7affa2537672ff4e4714a9891797621293`).
**Documentation parent:** `2e9bbd1888ad4230320859638a36c10bb0534af1` (`docs/p14-post-p12-preparation-01`, the newest documentation branch; it carries the 2026-09-10 P13 and 2026-09-11 P14 Owner amendments that this research relies on).
**Accepted code authority read:** `13370d428f0693f3279732f6f4cc360a7fcaa4df` (P12 R05 Owner-accepted closeout; `src/` identical to the accepted runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`). Code locators in this package are commit-pinned GitHub links to that commit; the docs branch itself does not carry the accepted runtime.
**Later addenda applied:** (1) Owner addendum relayed by Future Ops on 2026-09-12 — **full absorption is the selected initial acquisition model**; retained labels / autonomous subsidiaries are not selected and appear here only as researcher options; (2) P14 Owner-direction amendment of 2026-09-11 — the 26-week-capped early-termination charge; (3) **Reconciliation 02** (Future Ops owner-direction and transaction reconciliation, 2026-09-12) — read against the newer planning packages P14 [`8ef5246a`](https://github.com/HSpector1/The-Movies/tree/8ef5246aec115cc32d01d9fb8c916e3538342dca) and P15 [`81a4aedf`](https://github.com/HSpector1/The-Movies/tree/81a4aedf776840c6c90e80ecf8939cb89f2e5e7a) (planning sources, not runtime): the rival-population floor and replacement entrants are withdrawn (Owner direction G); loans and genuine studio failure are **OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED / PRODUCER CONTRACT AND EXECUTION AUTHORIZATION REQUIRED**; contracts end at closing with a priority retention window (no ownership of people, no second studio, no label); contract guarantees are never netted from a price (the earlier "full-value netting prevents immediate-fire arbitrage" claim was unsupported); automatic liquidation, excess-staff release, automatic project cancellation and player immunity are relabelled recommendations.

## Entry point

Read, in order: **[`P16-RECONCILIATION-02.md`](P16-RECONCILIATION-02.md)** (the corrections, the reconciled transfer/retention rules, the one-ledger economics re-test with the explicit $4M-guarantee / $1M-charge case, the authority-label corrections and the supersession log), then **[`P16-CORRECTED-DECISION-REGISTER.md`](P16-CORRECTED-DECISION-REGISTER.md)** (the concise register: what is Owner direction, what is recommendation, what is optional; no genuine product choice blocks a P16 slice), then [`P16-INDEPENDENT-VERIFICATION-REPORT.md`](P16-INDEPENDENT-VERIFICATION-REPORT.md) — the complete deliverable (21 sections, closing table, Appendices A–C), whose passages marked `[R02]` are the reconciliation's bounded edits and whose §0 defines the evidence-class labels. Where the report and Reconciliation 02 differ, Reconciliation 02 is the later, corrected statement; the pre-reconciliation package is archived verbatim at [`5239dc7a`](https://github.com/HSpector1/The-Movies/tree/5239dc7affa2537672ff4e4714a9891797621293/docs/research/p16-independent-verification-01).

## Package map

| File | What it is | Read it when |
|---|---|---|
| [`P16-RECONCILIATION-02.md`](P16-RECONCILIATION-02.md) | Reconciliation 02: the five required corrections, reconciled transfer/retention rules (R16′–R19′, R26′, R30′, R33; R29 withdrawn), the one-ledger economics re-test, label corrections, supersession log | Always — start here |
| [`P16-CORRECTED-DECISION-REGISTER.md`](P16-CORRECTED-DECISION-REGISTER.md) | The concise corrected decision register (classes A–E; disposition of the former §20 list) | Second |
| [`calculations/reconciliation-02-ledger.py`](calculations/reconciliation-02-ledger.py) → [`OUTPUT`](calculations/reconciliation-02-ledger.OUTPUT.txt) | Reproduces every figure in Reconciliation 02 §5 | You want to re-derive the ledgers |
| [`P16-INDEPENDENT-VERIFICATION-REPORT.md`](P16-INDEPENDENT-VERIFICATION-REPORT.md) | The full research report (≈26k words) with `[R02]`-marked bounded edits | Third |
| [`P16-RULESET-ANNEX.md`](P16-RULESET-ANNEX.md) | The repaired candidate ruleset (R01–R32) with its repair log and worked paper scenarios, verbatim from the design/refutation/repair pass — an archived record. Its header records where the full-absorption addendum (R10–R12) and Reconciliation 02 (R16–R19, R26, R29, R30; new R33) supersede its wording. | You need the exact rule text behind a report recommendation |
| [`scenarios/SCENARIOS-AB.md`](scenarios/SCENARIOS-AB.md), [`SCENARIOS-CD.md`](scenarios/SCENARIOS-CD.md), [`SCENARIOS-EF.md`](scenarios/SCENARIOS-EF.md) | Independent re-runs of paper scenarios A–F against the earlier ruleset text (archived; each carries a banner naming the figures Reconciliation 02 supersedes) | You want the archived numbers behind §12–§14, §17; the corrected ledgers are in Reconciliation 02 §5 |
| [`evidence/00-KEY-FINDINGS.md`](evidence/00-KEY-FINDINGS.md) | Structured digest of all eighteen evidence dossiers (claim / source / locator / proves / confidence / prior-prose status) | You want to trace a claim quickly |
| `evidence/01…18-*.md` | The eighteen evidence dossiers: original game (01), project corporate authority (02), project domain authority (03), accepted-code audit (04), tycoon comparators (05–07), real-world M&A (08), valuation/finance (09), rights law (10), and eight targeted gap-closure dossiers (11–18) | You need the underlying evidence and its exact locators |
| [`design-panel/`](design-panel/) | Process record: the three candidate rulesets (legibility / integrity / adversary lenses), the merged ruleset, the assembly check log, the citation spot-checks and [`RECONCILIATION-02-CHECK.md`](design-panel/RECONCILIATION-02-CHECK.md) (the bounded read-only check of Reconciliation 02) | You are auditing how the recommendations were produced |
| [`ASSIGNMENT-BRIEF.md`](ASSIGNMENT-BRIEF.md) | The Future Ops assignment text this package answers | You need the original question |

## Reading order for Future Ops review

1. [Reconciliation 02](P16-RECONCILIATION-02.md) §2–§6 (floor withdrawn; loans/failure reclassified; transfer and retention rules; the one-ledger re-test; label corrections) and the [register](P16-CORRECTED-DECISION-REGISTER.md).
2. Report §1 (executive findings; items 6–8, 11, 13, 15–20 carry `[R02]` restatements) and §20 (now a pointer to the register).
3. Report §5–§6 (operating model; the transfer bundle and the eight §2.F answers, Q2–Q4 corrected).
4. Report §13–§14 (bankruptcy shape through the P15 handoff record; the four numbers) — the corrected ledgers are Reconciliation 02 §5, the scenario files are archived runs.
5. Report §17–§19 (anti-snowball without a floor; package boundary; corrections to prior prose, three rows added).
6. Anything else via the report's Contents list and Appendix A/B.

## What this package is not

- Not original-game parity: the retail *The Movies* shipped no acquisition, merger, label, licensing, sequel, library-revenue or bankruptcy mechanic (report §2). Every P16 system is successor design.
- Not tuning: every number is a NUMERICAL/CONTENT HYPOTHESIS.
- Not an implementation of the Owner-selected direction it depends on (the H5 terminal-business state; the P15 settlement week and disposal handoff record; the P11 loan read models) — each OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED / PRODUCER CONTRACT AND EXECUTION AUTHORIZATION REQUIRED, never re-asked here.
- Not a questionnaire: after Reconciliation 02 no genuine unresolved product choice blocks a P16 slice; package ownership and the recording of existing Owner directions are planning tasks.

## Revision record

| Rev | Commit | What |
|---|---|---|
| 1 · 2026-09-12 | `f18634c8` → `5239dc7a` (review index added) | initial publication: report, annex, scenarios, evidence, design-panel record |
| 2 · 2026-09-12 | the branch tip that records this row | Reconciliation 02 applied: `P16-RECONCILIATION-02.md`, `P16-CORRECTED-DECISION-REGISTER.md`, `calculations/`, `design-panel/RECONCILIATION-02-CHECK.md` added; 79 `[R02]` markers on bounded edits in the report (every edit keeps its surrounding analysis); annex header block; scenario banners; this index. `evidence/`, `design-panel/` (existing files) and `ASSIGNMENT-BRIEF.md` untouched. |

## Publication notes

- Only files under `docs/research/p16-independent-verification-01/` were added or changed; no other path changed. No code, tests, saves, hooks, PR, merge or promotion. No other worker's branch or worktree was touched; `main` was not used as accepted runtime.
- Private paths and session identifiers were scrubbed from the evidence copies; over-long verbatim guide quotations were trimmed to short excerpts. No credentials, profiles or campaign data are included.
- Final reviewer edits before publication (after the automated assembly/consistency pass): fixed two citation placeholders; reworded the whole-entity bankruptcy path so it cannot be read as a continuing "reorganization" (full absorption applies there too); made the AI-bidder information rule consistent between §10 and §21 (symmetric due-diligence, no privileged engine read); replaced a docs-branch link to the Future Ops Control Board with a commit-pinned link (the file lives on the accepted-code branch); pointed the contractId locator at `hollywoodValidation.ts:163`; corrected the method record's model note.
- Known limits: the citation spot-check verified 77 of 135 sampled claims and found none wrong, with 58 left unverified for time — see [`design-panel/CITATION-SPOT-CHECKS.md`](design-panel/CITATION-SPOT-CHECKS.md); the reviewer separately verified the load-bearing code and documentation locators (`hollywoodValidation.ts:331`, `hollywoodTick.ts:221`, `hollywoodValidation.ts:163`, `scriptDevelopment.ts:64-73`, `hollywoodTypes.ts:6-27`, P15 §12.3 lines 474-475 and §16 line 619, P11 §33) directly against the pinned commits. GameSpot/IGN/Eurogamer/Reddit access was partly blocked; the report says so wherever it matters.
