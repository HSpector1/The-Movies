# P17 Targeted Independent Verification — Franchises, Sequels & Continuations

**Entry point for the complete package.** Research and analysis only; nothing here is implemented, accepted, or an Owner ruling.

| | |
|---|---|
| Assignment | Future Ops → independent second reviewer, P17 (Franchises / Continuations) |
| Publication | Documentation-only branch `docs/p17-independent-verification-01`, parented on the accepted P12 R05 closeout commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` (docs-only lineage; no runtime or Unity change) |
| Date | 2026-09-11 → 2026-09-12 |
| Revision | **02 — canonical-specification reconciliation** requested by Future Ops after reviewing revision 01 (`38ca0068703740cd98e95fb13b264b0244a42ed4`); what changed is listed in the report's §0 and in the revision log below |
| Status | **P17 RESEARCH PUBLISHED — REVISION 02 — FUTURE OPS REVIEW REQUIRED.** No gameplay implementation, no branch other than this one, no build/runtime/test, no campaign or profile access, no PR, no merge, no main promotion. |

## Read this first

**[P17-INDEPENDENT-VERIFICATION-REPORT.md](P17-INDEPENDENT-VERIFICATION-REPORT.md)** — the single report (§0 revision note, 20 sections, closing table). Its §1 executive findings are the summary; every section links to the evidence and model files below for locators and reproducible calculations.

## The current specification (the only active version)

| What | Where | Note |
|---|---|---|
| **Specification** | Report **§5** (Recognition / Momentum / Fatigue, seam, paper histories, exploits), with **§8** (remake vs reboot), **§9** (SubProperties), **§10** (Franchise root, continuity cap, bands, legality); **§5.7** indexes every rule, its calculator symbol and the variants it supersedes | Researcher recommendation with provisional constants — not an Owner ruling, not an implementation charter |
| **Calculator** | [redteam/R3-reviewer-corrections-calc.py](redteam/R3-reviewer-corrections-calc.py) (revision 2; Python 3, standard library; run from `redteam/`) | Cases A–G, R, R2 and Probes 1–6 |
| **Output** | [redteam/R3-output.txt](redteam/R3-output.txt) | Every number in the report's §5, §8, §10 and §16 is this file; regenerate with `python3 R3-reviewer-corrections-calc.py > R3-output.txt` and diff |
| **What remains for the Owner** | Report **§19.2** (five product choices) — §19.3 are recommendations, §19.4 optional features, §19.5 other charters' dependencies | |

Everything under `models/` and `redteam/R1*` is a **historical input**: each file carries a status banner naming what supersedes it and is otherwise unmodified. Revision 01's calculator output is preserved in git history at `38ca0068`.

## Contents

### Evidence (read-only research; every major claim carries source · locator · what it proves · confidence · tier)

| File | What it is |
|---|---|
| [evidence/00-SHARED-CONTEXT-AND-OWNER-DIRECTION.md](evidence/00-SHARED-CONTEXT-AND-OWNER-DIRECTION.md) | The brief every research agent worked from: hard rules, the Owner-selected directions A–U verbatim, package ownership, architecture facts |
| [evidence/00-EVIDENCE-COMPLETENESS-CRITIC.md](evidence/00-EVIDENCE-COMPLETENESS-CRITIC.md) | Completeness/locator spot-check over the evidence set (10 locators re-opened; contradictions; follow-ups) |
| [evidence/01-ORIGINAL-THE-MOVIES-RECONCILED.md](evidence/01-ORIGINAL-THE-MOVIES-RECONCILED.md) | Original *The Movies* (2005) + *Stunts & Effects* reconstruction — reconciled from the two readers below (five greps and three URLs re-verified) |
| [evidence/01a-original-the-movies-CORPUS.md](evidence/01a-original-the-movies-CORPUS.md) | Local corpus reader: official manual, developer-reviewed Prima guide, GameFAQs guides, structured data, mod-extracted engine schema — exact line locators |
| [evidence/01b-original-the-movies-WEB.md](evidence/01b-original-the-movies-WEB.md) | Web reader: contemporary previews/reviews, Kotaku 2014 (Gary Carr on the unshipped sequel feature), fan wiki, community |
| [evidence/02-project-studio-architecture-READONLY.md](evidence/02-project-studio-architecture-READONLY.md) | Project: Studio architecture fact sheet at commit `13370d42` — `file:line` locators for film identity, the three cast seats, fame/salary/forecast/awareness seams, rivals, save law, governance quotes, and the §h table of Future Ops assumptions |
| [evidence/03a-comparators-hollywood-animal.md](evidence/03a-comparators-hollywood-animal.md) | Hollywood Animal (closest comparator) |
| [evidence/03b-comparators-mad-games-tycoon.md](evidence/03b-comparators-mad-games-tycoon.md) | Mad Games Tycoon 1 / 2 |
| [evidence/03c-comparators-game-dev-tycoon-story.md](evidence/03c-comparators-game-dev-tycoon-story.md) | Game Dev Tycoon / Game Dev Story |
| [evidence/03d-comparators-film-media-management.md](evidence/03d-comparators-film-media-management.md) | Software Inc., Moviehouse, Blockbuster Inc., The Executive, Hollywood Mogul 4, Movies Tycoon, others |
| [evidence/03e-comparators-other-ip-sequel-tycoons.md](evidence/03e-comparators-other-ip-sequel-tycoons.md) | Other IP tycoons, grand-strategy model shapes (FM, CK3, Civ VI), academic film-market studies (Hennig-Thurau 2009 read in full) |
| [evidence/04a-real-franchises-set-A.md](evidence/04a-real-franchises-set-A.md) | Star Wars, MCU, Fast & Furious, Batman, Bond — design questions A–I |
| [evidence/04b-real-franchises-set-B.md](evidence/04b-real-franchises-set-B.md) | Planet of the Apes, Rocky/Creed, Mad Max, Terminator, Ghostbusters, Jurassic; celebrity-cameo and ensemble cases |
| [evidence/05-cast-scale-and-cameo-design-evidence.md](evidence/05-cast-scale-and-cameo-design-evidence.md) | Cast-slot expansion cost analysis and the FAME VALUE / PERFORMANCE VALUE cameo split |

### Paper models — HISTORICAL inputs to the specification (no production code; superseded wherever they differ from report §5; each file carries a banner naming what is superseded)

| File | What it is |
|---|---|
| [models/00-MODEL-BRIEF.md](models/00-MODEL-BRIEF.md) | The design laws every modeller obeyed |
| [models/M1a-rmf-three-meters.md](models/M1a-rmf-three-meters.md) · [M1b-rmf-derived-kernels.md](models/M1b-rmf-derived-kernels.md) · [M1c-rmf-debt-ledger.md](models/M1c-rmf-debt-ledger.md) | Three independent Recognition/Momentum/Fatigue candidates, each with the seven paper histories (`m1a_three_meters.py`, `m1b_derived_kernels.py`, `m1c_rmf_sim.py`) |
| [models/M1j-judge-legibility.md](models/M1j-judge-legibility.md) · [M1k-judge-systems.md](models/M1k-judge-systems.md) | Two adversarial judges (split verdict, hand re-runs) |
| [models/M1-RMF-SYNTHESIS.md](models/M1-RMF-SYNTHESIS.md) | The R/M/F synthesis the red team attacked — O(1) reformulation, grafts, all seven cases + remake case + spam probe (`M1-final-synthesis-calc.py`). **Superseded** by report §5 (ungated Recognition, forecast-only Fatigue, F = 0 reboot, expectation multiplier, per-branch Fatigue, 0.6 remake weight) |
| [models/M2-expectations-model.md](models/M2-expectations-model.md) | Expectations seams and double-counting audit (`verify_m2.py`) |
| [models/M3-franchise-object-branches-remake-reboot-rights.md](models/M3-franchise-object-branches-remake-reboot-rights.md) | Franchise root, bounded branches, remake vs reboot, rights transfer, lifecycle bands, early greenlight, legality matrix (`m3_worked_numbers.py`). **Superseded** in part: linear remake term, reboot Fatigue seed, lifetime branch cap 8, 104/260-week bands (report §8, §10) |
| [models/M4-subproperty-spinoff-crossover.md](models/M4-subproperty-spinoff-crossover.md) | SubProperty / spin-off and later-scope crossover (`m4_worked_numbers.py`) |
| [models/M5-cast-continuity-recasting-rivals-early-greenlight.md](models/M5-cast-continuity-recasting-rivals-early-greenlight.md) | Role-importance associations, recasting, rival policy, information law (`p17_m5_calc.py`) |
| [models/M6-cast-slots-cameo-recommendation.md](models/M6-cast-slots-cameo-recommendation.md) | Cast-slot shapes A–D and the cameo mechanic (`m6_arithmetic_check.py`) |
| [models/M7-package-boundary-and-interfaces.md](models/M7-package-boundary-and-interfaces.md) | Package boundary / interface / duplicate-formula review across all models |

### Adversarial review and the canonical calculator

| File | What it is |
|---|---|
| [redteam/R1-minmaxer-attack.md](redteam/R1-minmaxer-attack.md) | HISTORICAL — dominant-strategy attack on the pre-correction synthesis (economic min-maxer lens) with computed play sequences (`R1_verify.py` drives the historical synthesis calculator) |
| [redteam/R2-systems-ux-attack.md](redteam/R2-systems-ux-attack.md) | HISTORICAL — state-rot / double-counting / information-law / legibility / contradiction attack on the pre-correction synthesis |
| [redteam/R3-reviewer-corrections-calc.py](redteam/R3-reviewer-corrections-calc.py) | **CANONICAL calculator (revision 2)** — corrections C1–C7 (C3 revised: property-wide Fatigue), the reboot partial comparison (Case R2), Probe 6 (branch limits and fatigue laundering) |
| [redteam/R3-output.txt](redteam/R3-output.txt) | **CANONICAL output** — the numbers the report cites |

## Reproducing the calculations

The report's R/M/F, remake/reboot, branch-limit and dominant-strategy numbers come from **one** script: `cd redteam && python3 R3-reviewer-corrections-calc.py > R3-output.txt` (standard library only). The historical `models/*.py` scripts reproduce the arithmetic of the model file each sits beside (SubProperty transfer, continuity credit, cameo pool, byte estimates) and the pre-correction behaviour the red team attacked; all run from their own folder. They are paper-model calculators, not engine code, and touch nothing in `src/`.

## Source index and provenance notes

- **Original-game corpus.** The official manual, the Prima Official eGuide, two GameFAQs guides and a gamepressure page were read as plain-text extractions; the structured data (`THE-MOVIES-2005-ORIGINAL-DATA/*.csv|json`, `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/*.csv`) and the community-compiled Mechanics Bible were treated as secondary. Locators of the form `Prima txt:NNNN (p.NN)` give the extraction line and the printed page. The corpus itself is copyrighted and is **not** included; every essential passage is quoted inline in `evidence/01a`, so no Desktop path is needed to read the report. Locators of the form `/private/tmp/.../scratchpad/...` refer to the researcher's working cache of fetched pages (not published) — the quoted text is inline.
- **Project: Studio code and governance** are cited as `file:line` at the accepted P12 closeout commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` (or the named remote ref for roadmap docs). Read them with `git show 13370d428f0693f3279732f6f4cc360a7fcaa4df:<path>`.
- **Comparators** cite developer/official sources first (patch notes, dev diaries, roadmap images, store copy), then Steam Discussions/reviews and wikis for player experience; TV Tropes and Reddit were blocked for every comparator and are recorded as gaps, not filled.
- **Real franchises** cite The Numbers / Box Office Mojo / Wikipedia / trade press with dates; observed history is separated from design inference throughout.
- **Tiers used:** SHIPPED RETAIL · OFFICIAL MANUAL · DEVELOPER-REVIEWED PRIMA · CONTEMPORARY PROFESSIONAL SOURCE · PRE-RELEASE PROMISE · COMMUNITY INFERENCE · DEVELOPER/OFFICIAL (comparators, repo) · OBSERVED HISTORY · DESIGN INFERENCE. **Status vocabulary** for Future Ops assumptions: CONFIRMED · QUALIFIED · CORRECTED · OWNER-DIRECTION SUCCESSOR DESIGN.

## Revision log

| Revision | Commit | What |
|---|---|---|
| 01 | `38ca0068703740cd98e95fb13b264b0244a42ed4` (parent `13370d42…` = accepted P12 R05 closeout) | Full package published: report, 14 evidence files, 12 models + 9 calculators, R1/R2 attacks, R3 corrected calculator |
| 02 | this commit (see the branch head) | Future Ops reconciliation: one authoritative specification (§5/§5.7) and one canonical calculator/output; remake rule reconciled (0.5·q_ref·2^(−age/260 wk) as an awareness discount; M3's linear form historical); Case B table corrected to the output (spin-off 0.64); Fatigue made property-wide after Probe 6 found rotation laundering under every per-continuity read (revision-01 lifetime-cap regime included); lifetime branch cap 8 replaced by an active-continuity cap (≤3 open, unbounded lifetime, history collapsed) with the ninth-request and post-2040 behaviour shown; evidence claim bounded (§16); "SaveFileV20" replaced by the next governed save version; §19 reclassified into settled direction / product choices / recommendations / optional features / dependencies; salary premium and lifecycle/mortality kept out of Direction R and out of the dependencies; historical banners on every model/calculator file. Numeric deltas vs revision 01 are listed in report §20 item 16. |

## What this package is not

- Not an Owner ruling: Owner-selected directions A–U are reproduced verbatim in `evidence/00-SHARED-CONTEXT-AND-OWNER-DIRECTION.md` and are **not reopened**; where a direction creates a structural problem the report names it and recommends the smallest correction (§18) or lists a genuine product choice (§19.2).
- Not an implementation charter: recommended rules, interfaces and constants are researcher recommendations and provisional tuning, gated on P16 (StoryProperty/rights, including rival rights) and separate Owner authorization. The P16+ parking-lot status of "sequel/franchise/IP strategy" is unchanged.
- Not a change to any accepted ruling: later Owner addenda take precedence; in particular the selected initial acquisition model (full absorption, not an autonomous subsidiary or retained operating label) is unaffected by anything here — this report's rights-transfer material (§10) concerns StoryProperty ownership under P16, not studio acquisition structure.
