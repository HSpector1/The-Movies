# P15 Targeted Independent Verification — package index

**Assignment:** independent second review of Package 15 (Corporate Hollywood, Shared Market & Studio Legacy) for Future Ops, against the Owner-selected P15 direction of 2026-09-11.
**Status:** DOCUMENTATION ONLY · NO PRODUCTION AUTHORIZATION · RESEARCH, NOT OWNER AUTHORITY. Nothing here amends an approved ruling, authorizes gameplay implementation, or accepts a recommendation. Future Ops review required.
**Branch:** `docs/p15-independent-verification-01` · **documentation parent:** `13370d428f0693f3279732f6f4cc360a7fcaa4df` (P12 R05 Owner-acceptance closeout, which descends from the accepted TypeScript runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`). Publication commits: `e2bccb3eb401b2e2754095176b7b7f3b6a2e55bf` (package) and `d7a82cde275a3b7c7ce291763c19074db590a24a` (this index).
**Dates:** research 2026-09-11, resumed and completed 2026-09-12 (the run was interrupted once by a session limit; no work was repeated).

## Entry point

Read **[P15-INDEPENDENT-VERIFICATION-REPORT.md](P15-INDEPENDENT-VERIFICATION-REPORT.md)** — the complete report (16 sections + summary table). Its opening "Reading guide" distinguishes verified evidence, accepted implementation facts, Owner direction, researcher recommendations, provisional tuning, and unresolved dependencies, and records the **Owner addendum of 2026-09-12 (full absorption is the selected initial acquisition model)** with the qualifications it forces on the report's label/subsidiary material.

## Contents

| Path | What it is | Read it for |
|---|---|---|
| `P15-INDEPENDENT-VERIFICATION-REPORT.md` | The report: 1 executive findings · 2 original *The Movies* reconstruction · 3 shared-market window · 4 Power Ranking vs Net Worth vs Valuation · 5 rival failure · 6 player failure · 7 loans/debt · 8 talent settlement · 9 auction & M&A · 10 consolidation · 11 finale & Endless Sandbox · 12 comparator lessons · 13 package boundaries · 14 corrections to prior P15 research · 15 remaining Owner decisions / provisional tuning / dependencies · 16 uncertainties · summary table | the synthesis; the only text that carries the researcher's reconciled recommendations |
| `evidence/phase1/` (12 files) | Independent evidence reads: `orig-economy`, `orig-rivals`, `orig-ending` (original game, page-exact); `code-finance`, `code-hollywood`, `code-standing-history-save` (accepted code at 592e926, `file:line`); `comp-bankruptcy-loans`, `comp-ma`, `comp-ranking`, `comp-finale` (comparators, URL-cited); `finance-logic` (book vs enterprise value, insolvency tests, loan math tables, covenants); `prior-claims` (160-row register of the prior P15 research's claims) | source locators, quotations (short), the weekly loan tables, the claim register |
| `verification/phase1/` (24 memos + `_DIGEST.md`) | Two adversarial verifications of every evidence read (source fidelity; completeness/overclaim). `_DIGEST.md` lists every refuted or weak claim and every missing item; **its corrections are binding on the report** (e.g., the accepted code *does* contain the rival ecosystem; Capitalism Lab's continuation-after-loss is unshipped; FM24's official page documents a staged distress ladder; Prima page corrections) | why a claim in an evidence file was downgraded or corrected |
| `analysis/phase2/` (11 files + `_phase2-task-prompts.js`) | Design analyses and paper scenarios: `market-window`, `ranking-vs-value`, `net-worth`, `rival-failure` (8 bankruptcy scenarios + survivorship math), `player-failure`, `loans` (loan scenarios A–D), `talent-settlement-events`, `ma-auction` (scenarios A–C, six ownership shapes), `consolidation`, `finale-endless`, `boundaries-corrections` (ownership map, 55-row corrections table). The `.js` file preserves the exact task prompts and the Owner-direction text each analyst was given | the full paper scenarios and their arithmetic; the reasoning behind each recommendation |
| `verification/phase2/` (22 memos + `_DIGEST2.md` + `_COMPLETENESS-CRITIC.md`) | Two adversarial verifications of every analysis (authority/direction consistency; break-it) plus the completeness critic. Their findings are folded into the report's §§3–11 and §15 (e.g., the debt-free escalation path, rolling-window stage tests, instalment capitalization, the `advanceHollywoodWeek` gate, the engine-level finale freeze) | the exploits and contradictions found in the analyses and how the report resolves them |
| `calculations/reproduce.py` → `calculations/OUTPUT.md` | Pure-Python reproduction of the report's arithmetic: weekly amortization tables, leverage-vs-coverage, release-window probabilities against the authored roster, rival survivorship under a constant hazard, net-worth worked examples, a 40-person fixed-cost sketch, disposal scenario B | reproducible numbers (all PROVISIONAL except cited code constants) |

Two internal path conventions used inside the evidence/analysis files: `<scratchpad>/accepted-592e926/…` means the file at that path **in commit `592e926`** of this repository; `<scratchpad>/authority/…` means the six authority documents listed below at their pinned commits; `<scratchpad>/out/phase1|phase2/…` and `out/phase1-verify/…` map to `evidence/phase1/`, `analysis/phase2/`, `verification/phase1/` here. `~/Desktop/big swing art/…` locators name the local original-game evidence set the prior P15 package also cites (manual, Prima eGuide, GameFAQs/gamepressure guides, the compiled mechanics bible and CSV registers); they are pointers, not authority, and are not republished here.

## Authorities read (pinned)

| Authority | Commit | Path |
|---|---|---|
| Approved long-range P15 research | `2a7ff0d973391f9433d19ec2cb7f6c5582d1e44f` | `docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md`, `…-BUILDER-ANNEX.md` |
| Durable roadmap / Owner rulings | `137ab603e37620ce647cd728b3a57154b8e3c3fb` | `docs/design/CODEX-P13-P15-OWNER-RULINGS.md`, `docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` |
| Accepted P12 closeout | `13370d428f0693f3279732f6f4cc360a7fcaa4df` | `docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md`, `docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md` |
| Accepted current code | `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` | `src/`, `bridge/`, `docs/` (inner save V19) |
| Still-written rulings the direction collides with | at the parent | `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3; `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md` REQ-041/042; `docs/D-16-OWNER-RULINGS.md` R10; `docs/D-17B-OWNER-AUTHORIZATION.md` §4 |

## External source index (main)

- Original game: official manual (Steam CDN PDF; printed pp. 4, 6, 12–15, 17, 21–23); Prima Official eGuide (archive.org; printed pp. 8, 14, 16, 20–21, 44–47, 51, 57–58, 60–61, 77–85, 98; page = PDF − 1); *Stunts & Effects* manual p. 10; GameFAQs FAQs (Maxx 45308; Mark_E_1990 41120); gamepressure "Improving the Studio"; contemporary reviews (GameSpot 2005-11-09, IGN 2005-11-09, Eurogamer 2005-11-16, GameSpy 2005-11-08); pre-release previews via Wayback (GameSpot E3 2002 First Look, 2004-02-23 preview, 2005-08-19 impressions; Lionhead FAQ 2005). Exact locators are in `evidence/phase1/orig-*.md`.
- Comparators (official manuals/wikis/source/dev statements where available): OpenTTD (source at `96651d3`, PRs #10709/#10914, issue #8625, wiki), OpenRCT2 (source), Simutrans (source), GearCity (developer wiki, Steam dev replies), Capitalism Lab (official site), Hollywood Animal (Steam news/Q&A, Early Access), Blockbuster Inc. (Steam patch notes 1.9.0), Mad Games Tycoon 2, Software Inc., Game Dev Tycoon, Two Point Hospital, Prison Architect (Paradox wiki), Cities: Skylines 1/2 (Paradox wikis), Planet Zoo (Frontier guide), Railroad Tycoon II/3, Railway Empire, Offworld Trading Company (Designer Notes #17), Football Manager 24 (official feature page), Civilization IV/V manuals, Civilization VI Civilopedia, Civilization VII patch notes (1.2.0, 1.4.0) and dev diaries, EU4/CK2/CK3/Stellaris Paradox wikis, Frostpunk 1.3.0 notes, Dwarf Fortress wiki. Exact URLs are in `evidence/phase1/comp-*.md`; community sources are labelled as such and used only for player-experience criticism.
- Finance: Investopedia/CFI definitions, 11 U.S.C. §§ 365, 502, 506, 507, 524; UK Insolvency Act 1986 Sch B1 and ss. 123/175/176A; OCC Bulletin 2013-9a (leveraged lending, 6× reference) — see `evidence/phase1/finance-logic.md`.

## What this package is not

- Not original-game parity for anything in Owner directions D–K (rival/player failure, loans, valuation, acquisition, finale, Endless): all are successor design; the report says so wherever it matters.
- Not a ruling: the 2026-09-11 direction and the 2026-09-12 addendum are quoted as received; the written rulings they collide with remain in force until the Owner records a superseding ruling.
- Not implementation guidance: package-ownership rows and seam notes are recommendations for a later reconnaissance, not execution instructions.
- Not tuning: every number is PROVISIONAL.
