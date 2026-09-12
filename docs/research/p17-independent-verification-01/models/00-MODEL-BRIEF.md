> **STATUS: HISTORICAL INPUT (revision 02, 2026-09-12).** Unmodified research input below this line. Where it differs from the canonical specification — report [`../P17-INDEPENDENT-VERIFICATION-REPORT.md`](../P17-INDEPENDENT-VERIFICATION-REPORT.md) §5 (index §5.7, with §8/§9/§10), canonical calculator [`../redteam/R3-reviewer-corrections-calc.py`](../redteam/R3-reviewer-corrections-calc.py), committed output [`../redteam/R3-output.txt`](../redteam/R3-output.txt) — **the report governs.** Superseded here: the brief's per-branch Fatigue framing (Fatigue is one scalar per StoryProperty in the canonical rule); every constant it names is a starting point.

# P17 model-phase brief (read after CONTEXT.md)

You are designing PAPER MODELS for the report — no production code, no repo edits. You may run a throwaway numeric script ONLY inside the scratchpad p17/models/ folder (python3) to compute paper-history tables; never touch the repository.

EVIDENCE FILES (read the ones your task names; all under scratchpad/p17/evidence/):
- 01-ORIGINAL-THE-MOVIES-RECONCILED.md (if present) else 01a-original-the-movies-CORPUS.md + 01b-original-the-movies-WEB.md — what the 2005 game shipped (no sequel mechanic; per-actor Novelty; Genre Interest saturation; Star Rating recency; 3-lead cap; extras zero fame value).
- 02-project-studio-architecture-READONLY.md — engine facts with file:line locators (FilmResult permanence, 3 fixed cast slots, fame→starDraw/starAttention/salaryCurve, forecast lock, awareness producers, rival decide(), save V19 additive-root law, size limits, governance quotes, §h assumptions table). TREAT ITS LOCATORS AS AUTHORITATIVE; cite them.
- 03a..03e comparator atlases (Hollywood Animal, Mad Games Tycoon, GDT/GDS, film/media games, other IP tycoons + academic film-market studies in 03e §11-13).
- 04a/04b real-franchise case studies (design questions A-I with dated data; summary tables at the end of each).
- 05-cast-scale-and-cameo-design-evidence.md — cast-slot shapes A-D and the FAME VALUE vs PERFORMANCE VALUE cameo split.
- 00-EVIDENCE-COMPLETENESS-CRITIC.md (if present) — known gaps.

NON-NEGOTIABLE DESIGN LAWS (from CONTEXT.md; apply to every model):
1. Three separate factors R (Recognition, slow/durable), M (Momentum, fast, decays to neutral), F (Fatigue/overexposure, rises faster for mediocre similar output, recovers with rest). Never one FranchiseScore. No fixed cooldown; timing acts continuously through M and F only.
2. P17 reads public P07 results (FilmResult: criticScore, boxOffice, segmentScores, audience score) and P16 rights; it never computes box office, never mints cash, never changes salary, never adds a Standing channel (Standing is a frozen 3-key leaf). Inherited awareness/expectations enter P07/P11 through OPTIONAL INPUT seams (the setUplift/setNovelty precedent in reception.ts:87-103; preMarketingAwarenessOf; forecast expectedTotal) — no duplicate formulas.
3. Franchise state is keyed to an exact P16 StoryProperty ID; lineage is a P17 root of id-keyed edges (never fields on FilmResult/FilmConcept). Any P17 root = SaveFileV20, compact (scalars + id lists), joins persistedProductionIds/persistedConceptIds.
4. Rivals obey the same law through the same P07 chain; rival decisions are a compact policy branch in hollywoodTick decide() (policy.version 2).
5. Every recommended rule must be player-legible (a descriptor band + a forecast the player can read), and every constant you propose is a STARTING POINT, labelled as such.
6. Do NOT reopen Owner-selected directions A-U. Where a direction creates a serious structural problem, name the problem precisely and give the SMALLEST correction.

OUTPUT: write your full model to the file named in your task (Markdown, with formulas, worked numbers, tables, ownership per element, exploits considered, open questions), then return the structured summary.
