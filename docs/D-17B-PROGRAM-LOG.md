# D-17B — Awareness Business Cycle & Reach Repair — Program Log

**D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Final Owner / Engine PM ruling: `docs/D-17B-OWNER-RULINGS.md` (2026-08-13).

Running record of phase gates and PM rulings. Authority: `docs/D-16-OWNER-RULINGS.md` + the Owner's
D-17B authorization (D-17A accepted at tag `d17a-decision-truth` = `79a9ab3`; analysis base
`52c5f0c`). Research-first: no production formula changes before the D-17B Candidate Design
Contract passes independent review.

## Phase A — stock modeled before tuning (gate passed 2026-08-12)

Five research lenses (A1 stock/flow, A2 discoverability shape, A3 marketing analytics, A4 lab
architecture, A5 long-horizon/distress/runaway baselines), all measured at `52c5f0c`. Headlines:

- **A1:** competent play's awareness delta is negative at every level in 9/10 worlds (median −2.25
  per release at A=40); the neutral gross `N×S = 0.522×bMV` is arithmetically unreachable at ANY
  awareness for 3 of 4 decomposed worlds; the ±6 delta cap never binds (raw range [−4.06, +4.14]);
  `bMV` cancels out of the loop entirely. A stable interior band requires a counter-flow whose
  inflow is largest at low awareness — which is exactly R9's paid-publicity + decay pair
  (mean-reversion decomposed into a paid inflow and a passive loss). Sizing: decay slope
  ≥ ~0.9%/week to bound optimal play; publicity must deliver >3.2 awareness pts per 9-week cycle at
  N=0.58 (≈1.3–1.8 at N=0.45) for recovery from 0 to exist.
- **A2:** the "0.2×/1.8× coin flip" corner never occurs in real play (0 of 55,698 engaged releases
  at shortfall 1; realized draws 82.9% interior). The real defects: EXPOSURE (89.1% of 3.0M
  affordable packages; 82–88.6% of states have no immune option) and knife-edge ROI (median 4.1%
  at z0 — the draw decides the profit sign of 47.9% of films). A floor raise alone is ~96% inert
  for survivability. Pareto family: `THRESHOLD 0.375 / SPREAD 2.5 / EXP 1.5–2.0`, floor free for
  loss-truncation. **THRESHOLD must be calibrated against the POST-repair awareness distribution.**
  RNG: keep `discovery-v1` for the whole R5 constant family (bump only for functional-form change).
- **A3:** the optimal marketing spend tracks **1.3–2.5× the awareness-conditioned capacity**, which
  swings 8.3× — no fixed dollar triple passes the ≤~35% max-optimal gate (best neighborhood triple
  `{300k,700k,1.5M}` at 40.8%; candidate `{300k,850k,2.5M}` refuted for distressed play: top rung
  dominated in 99.1% of low-awareness cells). Grid selection must be joint with the counter-flow;
  a capacity-anchored menu is a legitimate Stage-3 design option. `studioRunRecap.ts:64` hardcodes
  `STANDARD_MARKETING = 400_000` — a Lesson-BL desync hazard for any grid change.
- **A4:** lab architecture proven by prototype: post-tick counter-flow shim reproduces `runOne`
  float-for-float when off; publicity rides a `termination`-kind ledger entry with note prefix
  `d17b-publicity:` (0 allocator fields moved; recap only pure-cash fields); 23 TUNING keys
  measured use-time (none worldgen-baked). **Measured family screen (5 seeds, P3): pure decay
  families make the economy WORSE (a tax on a stock falling in 1472/1472 measured steps); only
  two-sided/loss-damping families (mean-revert, asymmetric loss-damp, endogenous pivot) create
  recovery.** Neutral-arm invariant: rows.jsonl SHA-256 `6692662642906b91…c45c` (= d17a-final).
- **A5:** durable recovery @+103wk is **0.0% for 9 of 14 player policies** (best player 13.0%,
  oracle 13.8% — all below G8's 25%); insolvency weekly self-transition 99.79% (only exit:
  noProduction); awareness is bimodal-absorbing (median 0 by week 156 in 7/14 arms;
  weeks-above-60 median 0 for ALL 16 policies); runaway is world-selected (55% of worlds never)
  and decided by ~week 72–100. 180 verified distress states harvested for Stage 5. Week-86
  baseline: least-bad legal continuation loses $2.04M/52wk, noProduction by wk 112, insolvent
  ~wk 158; producing the one affordable film accelerates decline and cuts awareness 12.31→8.51.
  **Finding 0 (instrument):** `driver.ts` flags "cliff" via the retired `employmentEngaged`
  predicate and the runner excludes those rows — at 312wk that discards 43.1% of runs that are
  actually a NEW failure mode: the **week-208 roster wall** (all founding contracts expire
  together; insolvent studios cannot afford renewal bonuses; 1380/1380 wall events had negative
  cash; the studio then bleeds `OVERHEAD_BASE` forever with zero decision surface).

## Phase-A gate rulings (PM)

1. **Lab build authorized** per the A4 file plan (harness-only; authorized surface H), with:
   `--slice-weeks` support; the cliff/roster-wall instrument split (`engagementCliffHit` reads the
   persisted regime — structurally false post-R2; new optional `rosterWallHit` stamp, absent when
   false, NOT excluded from distributions); durable-recovery@N (G8 form + strict) computed in the
   runner; the 23-key allowlist extension (the three awareness-delta keys are allowlisted FOR LAB
   SWEEPS ONLY — production changes to `AWARENESS_REACH_WEIGHT/STAR_WEIGHT/DELTA_CAP` are NOT
   authorized by R4 and would need an Owner extension); `withMarketingGrid` + support for
   capacity-anchored menu arms; publicity ledger carrier `termination` + note prefix — BLESSED.
2. **Family taxonomy for Stage 1:** implementation-eligible arms are the AUTHORIZED composites —
   one-sided decay families (linear-above-floor; decay-toward-a-floor i.e. one-sided
   mean-reversion; event-responsive idle decay) × `AWARENESS_REACH_NEUTRAL` × paid publicity.
   The stronger unauthorized families (two-sided mean-reversion with free pull-up; loss-leg
   damping; endogenous EMA pivot) run as LABELLED REFERENCE ARMS for honest §27 reporting only.
3. **Sequencing (per A2/A3 coupling):** Stages 1–2 select counter-flow + publicity + N; Stage 3
   calibrates the D-13 shape family and the marketing grid JOINTLY against the post-repair
   awareness distribution.
4. **Neutral-arm invariant** is the lab's acceptance gate: rows.jsonl SHA-256 equality with
   `d17a-final-300x208`; summary.json equal on all pre-existing fields (new fields additive only).
5. The week-208 roster wall is recorded as a structural defect for the final return (§34); its
   repair (staggered terms / renewal mechanics) is OUTSIDE the authorized lever family and will be
   reported, not smuggled in.

## Candidate contract and provider interruption (2026-08-13)

The lab program produced Candidate Design Contract rev. 1, then an independent contract attack
produced rev. 2 with all 24 review amendments. The first full-stack publicity corpus was found to
have `saturation: 1` on a 0–100 awareness scale. Its publicity rows were rejected; the apparatus
was pinned and re-run with `saturation: 100`; rev. 3 records the corrected candidate and the
identity/validation requirements created by the incident.

The originating implementation agent then stopped during Phase E with status exactly:

**BLOCKED/INTERRUPTED BY PROVIDER WEEKLY LIMIT**

No failure was disguised as a clean handoff. Codex takeover began at `b3881678fc05eb5f61c7fae3c3b6f908f654e383`.
The forensic inventory, classification of every partial change, process check, source/evidence
salvage decision, and Git topology are in `docs/D-17B-RECOVERY-REPORT.md`. No reset, clean, stash,
rebase, checkout-away, or history rewrite occurred.

## Phase E — production engine core (gate passed 2026-08-13)

Recovered and completed the authorized engine stack:

- engaged reach-neutral split `.45` / disengaged legacy `.58`;
- engaged pull-down-only counter-flow `κ=.04`, anchor `35`, at tick step 5.5;
- DISC tuple `.375 / 4 / 1.5 / .30 / 1.8`, retaining `discovery-v1`;
- engaged capacity-anchored marketing menu `{1.3×,2.4×,3.7×}`, with exact per-package dollars and
  legacy disengaged menu;
- publicity action with Whisper `$1.2M/18/8wk`, Push `$3.6M/30/12wk`, Blitz `$8M/42/20wk`,
  saturation `100`, exponent `6`, global cooldown `6`, affordability and engaged gates;
- explicit `publicity` ledger kind and SaveFileV7 (`publicity.lastUsedWeek` + per-tier history),
  deterministic V6→V7 migration.

The recovered pre-interruption commits were preserved. The remaining Phase-E completion landed in
`f7e81d9`; no valid partial source was rejected.

## Phase H — harness/production convergence (gate passed 2026-08-13)

Commit `393eee0` added production execution modes to the D-16 corpus, continuation and Week-86
runners; exact production identity; source provenance; logical marketing-rung instrumentation;
and the production/reference comparator. Independent harness review found five evidence defects:
the frozen reference's P15 used the retired predicate, its publicity key omitted saturation, its
stored dollar marketing values could not identify logical rungs, its stored tournament contained
only P1–P3, and initial runner modes still used lab shims. Commits `bb8b17f`, `d3e7671`, and
`a48862b` fixed production execution and comparison. Frozen rows were not rewritten and production
was never tuned to make a defective reference agree.

Final governed artifacts:

- production corpus `out/d16-economy-lab/corpus/d17b-final-production-reviewed` — 300×208×24,
  `CURRENT`, `execution: production`, exact candidate key, source `bb8b17f`, clean tree;
- agreement `out/d16-economy-lab/d17b/agreement/d17b-final-production-agreement` — 23/23 comparable
  policies pass every median/rate tolerance; P15 `NOT_COMPARABLE`; overall `REVIEW_REQUIRED`
  because Q6's governed 208-week boundary verdict moves from 49.67% FAIL to 50.33% PASS;
- Week-86 replay `out/d16-economy-lab/d17b/week86/d17b-final-production`;
- 180-state continuation `out/d16-economy-lab/d17b/continuation/d17b-final-production`.

## Phase U — player truth surfaces (gate passed 2026-08-13)

Commit `37f0683` exposed the action without turning it into an optimizer: current awareness and
practical band; campaign cost, immediate estimated lift, exact post-action awareness and cash;
tier/global cooldowns; the below-~30 maintenance boundary; shared cooldown state; capacity-derived
marketing dollars/multiples; new DISC band; and publicity ledger lines in Dashboard, Assembly,
Weekly Summary, and Studio Run Recap. Independent UI review found stale D-17A evidence, an omitted
global-cooldown display, ambiguous Whisper break-even wording, rounded action amounts, and duplicated
UI constants. The product findings were fixed in `bb8b17f`; D-17A evidence remeasurement is part of
the closure documentation. `docs/HANDOFF.md` is a NOT-FOR-BUILD document and was deliberately not
opened or modified during Codex recovery; its pre-takeover D-17B change remains preserved in history.

## Independent final review and gate disposition (2026-08-13)

Three independent reviewers attacked the frozen contract rather than the implementation:

1. engine/save/ledger/action parity and scope;
2. UI information integrity and D-17A regressions;
3. harness provenance, statistical agreement and management-game red team.

All implementation blockers/majors were fixed. At this pre-ruling checkpoint, the unresolved
results were design/governance facts rather than hidden defects: E1–E5 required Owner rulings; the
Q6 reference/production 50% knife-edge needed an Owner boundary decision; cash runaway worsened
although awareness was bounded; G1/G3/G5/G6 and the week-208 wall remained structural. The
candidate therefore entered Owner review as **implementation complete, Owner / Engine PM review
required**, not as a clean balance certification. The final disposition immediately below
supersedes that checkpoint status.

## Final Owner ruling — accepted bounded closure (2026-08-13)

Owner review accepted E1, E2, E4 and E5 exactly as implemented; accepted E3 specifically as a
bounded D-17B repair rather than complete macroeconomic certification; accepted the production Q6
`151/300` result with the Rev. 3 break-even-tuned A≈30 verification as boundary-sensitive
maintenance evidence; and accepted the honest **2 PASS / 5 PARTIAL or mixed / 5 FAIL** G1–G12
closure. No tuning to the frozen `149/300` label and no additional D-17B corpus are required.

The following remain explicitly open and may not be concealed or reclassified: cash runaway;
top-studio economic immortality; week-208 synchronized roster wall; P5 dominance; world-led
variance; cheap-film purpose; premium-film purpose; remaining menu breadth; formal G12 timing.

Future investigation of the roster wall and a believable size-scaling cash sink is authorized, but
instrumentation and research come first. No financing, loans, bailouts, restructuring or failure
ladder may be introduced, and no arbitrary sink may precede understanding of the authoritative
facility/capacity/construction systems that may naturally supply those capital and operating costs.

Final operative text: `docs/D-17B-OWNER-RULINGS.md`.
