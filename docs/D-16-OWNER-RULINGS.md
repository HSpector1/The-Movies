# D-16 — Owner Rulings and Closure Record

**Status:** D-16 is CLOSED by Owner / Engine PM ruling, 2026-08-12.
**Analysis base:** `main @ 33eb33ae307904aa3f00db20bc695e40bf46d1e4` (local == remote at study start
*and* at closure — main did not advance during the study).
**Lab branch:** `audit-d16-economy-recovery-decision-lab`; pre-closure HEAD
`2b6dac5b3e769fff79f22630b255af3db15f813f` (analysis + report + source matrix + draft lessons; this
closure commit adds only governance documents).
**Verified at closure (re-run live, not copied):** full suite 1125/1125; d16 harness 102/102; core
696/696; root + UI `tsc --noEmit` clean; `src/core/**` byte-unchanged vs the analysis base; tracked
tree clean.
**Report:** `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` (recommendation **D** — accepted).
**Companion:** `docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md`.
**Raw evidence:** `out/d16-economy-lab/` — deliberately **not tracked and not pushed**; it is
generated/reproducible evidence (Owner ruling R11).

This document is the authoritative disposition of the 12 unresolved Owner decisions consolidated in
report §15, plus the Engine PM sequencing rulings that govern the next Engine program. Where this
document and the report differ anywhere — including the report's §10/§14 rejection wording (e.g. the
unqualified 0.35 rejection), §11–§12 sequencing/packaging language, and §15's three-constant D-13
list — **this document wins** (the report is the evidence record; this is the ruling record).

---

## 1. High-level verdict

- **Recommendation D is ACCEPTED:** both balance correction and player-agency / recovery
  improvement are required.
- **Recommendation E is REJECTED:** no fundamental redesign. Preserve and improve the existing
  Engine architecture (pure core, true forecast, signed ledger, determinism).
- **Sequencing override (supersedes report §12's packaging posture):** the report's MINIMAL package
  is **not** shippable as a standalone accepted economy state. Its Tier-1 pair fixes the
  death-spiral tail while roughly doubling the runaway tail; both tails arise from the same
  equilibrium-free awareness stock. Fixing one tail by worsening the other is evidence, not repair
  (Lesson BK, draft). The next program is **D-17 — Economy Truth & Equilibrium Foundation**: two
  internally separable slices (D-17A, D-17B), **one governed economy program**; neither slice alone
  may be represented as the final accepted economy.

## 2. Disposition of the 12 consolidated decisions (report §15)

| §15 | Decision | Ruling |
|---|---|---|
| 1 | G1–G12 gate set | **R1 — Accepted as the working D-17 evaluation framework** (A18 operationalizations included). G12 is PROSPECTIVE. Not promoted to immutable permanent law until D-17 closes. |
| 2 | Engagement-cliff closure shape | **R2 — PERSIST AT FOUNDING.** Engagement becomes an explicit, persisted, monotonic gameplay fact; never derive enduring regime membership solely from mutable current collections. SaveFileV6 authorized **if required**, under the migration safeguard in §3. |
| 3 | `releaseTalent` | **R3 — KEEP UNGATED.** Amend D-12.11's governing language to make the exception explicit: termination may intentionally drive current cash below zero because the action removes a future obligation. Add a regression test proving this is intended behavior. |
| 4 | D-6 narrow lift | **R4 — GRANTED.** D-17B may change `AWARENESS_REACH_NEUTRAL` and may introduce the specifically authorized awareness counter-flow. D-6 channel meanings remain protected (awareness = reach; prestige distinct; confidence distinct). **Correction to the report's rejection wording:** record `AWARENESS_REACH_NEUTRAL = 0.35` as **REJECTED UNDER THE D-16 BASELINE regime**, not as never-legal; once the feedback system changes, old counterfactual results do not become eternal law. |
| 5 | D-13 constants | **R5 — REOPEN THE SHAPE/CALIBRATION FAMILY ONLY:** `DISC_FLOOR`, `DISC_SUPPORT_EXP`, `DISC_SUPPORT_THRESHOLD`, `DISC_SPREAD`. Preserve the discoverability mechanic, deterministic architecture, stream isolation, and the concept of opening-reach uncertainty. Final constants are NOT selected; D-17B must jointly recalibrate them against the new awareness cycle. |
| 6 | Marketing grid | **R6 — REPLACEMENT AUTHORIZED;** the current grid may not remain the accepted final grid. **D-17A owns** truthful marketing copy, truthful read-models, and removal of misleading steering language. **D-17B owns** the actual grid constants and calibration. `{200k, 700k, 2M}` is the leading candidate, `{300k, 850k, 2.5M}` remains valid; a bounded neighborhood study is permitted; the final triple is selected by D-17B evidence against the complete economy gates — never merely because it improves median cash. |
| 7 | Break-even convention | **R7 — Player-facing HEADLINE: cycle-inclusive / studio-economic break-even.** Detailed diagnostics may retain Film Contribution / direct film economics. There must not be multiple competing headline meanings of "profit." **Accounting safeguard:** the fixed-cost allocation must not double-count across concurrent productions and must reconcile to the authoritative ledger over overlapping periods; if a selector cannot satisfy reconciliation, STOP and report — do not invent an accounting convention to make the UI cleaner. |
| 8 | Standing channels | **R8 — RELABEL NOW.** Do not tell the player financiers respond to Commercial Confidence when no such mechanic exists. No prestige/confidence mechanical teeth during D-17 (deferred). |
| 9 | Tier-2 pair | **R9 — AUTHORIZED as D-17B's core new-mechanic family:** weekly awareness counter-flow/decay + one player-controlled publicity action. The Engine owns a publicity **mechanic/action**; no physical "Publicity Office" facility is required or implied — physical representation is a future Art/Studio-Lot decision. Must avoid: maintenance spam, mandatory weekly clicking, guaranteed recovery, free passive growth, permanent snowball, permanent death spiral. Must be: costly, bounded, diminishing-return, strategically timed, optional in healthy states, useful but not sufficient in distress. Exact constants, cooldown, cost curve, response curve = D-17B design questions. |
| 10 | A14 failure rulings + co-financing question | **R10 — ALL DEFERRED.** Standing philosophy: **KEEP THE STUDIO, LOSE CONTROL.** No D-17 implementation of loans, credit lines, co-financing, distribution advances, deferred-compensation financing, investors, bailouts, passive/library revenue, hard bankruptcy, or a forced restructuring ladder. |
| 11 | G12 wording | **R1 (part) — PROSPECTIVE.** |
| 12 | Branch publication | **R11 — AUTHORIZED:** push `audit-d16-economy-recovery-decision-lab` to `hspector-github`. Do NOT commit or push `out/d16-economy-lab/` — raw corpus evidence remains generated/reproducible. |

## 3. R2 migration safeguard (binding on D-17A)

Do **not** assume `contracts.length > 0 || founding !== null` perfectly reconstructs HISTORICAL
engagement for every existing V5 save. Before writing the converter, **prove from the V5 schema**
whether historical engagement can be reconstructed correctly (engaged-only ledger kinds, run
`economyModelVersion`/`studioShare` provenance, founding state). If it cannot: STOP that portion and
return explicit migration alternatives. **Do not fabricate historical state.**

## 4. R12 — canonical D1-B status wording

Future governance language must not state simply "D1-B is unstarted." Canonical distinction: **a
bounded D1-B-related Soundstage Composer Proof completed and selective adoption reached production;
the broader D1-B production program remains unauthorized and unstarted.** Nothing in this Engine
milestone authorizes broader D1-B work.

## 5. Program authorization

- **D-17A — DECISION TRUTH & DEFECT CLOSURE: implementation AUTHORIZED** (scope: one runway
  definition; one studio-economic profit/break-even headline convention, cycle-inclusive with
  concurrency-safe ledger-reconciling attribution; Film Contribution retained as labelled
  direct-cost detail; prospective affordability / capital-after-greenlight /
  runway-after-greenlight / contract-obligation-at-signing truth; quantified discoverability
  exposure from player-visible information only; truthful marketing copy/read-models; honest
  standing copy; legibility of forecast-positive capital discipline without hidden information and
  without an "optimal choice" button; engagement-cliff closure per R2; SaveFileV6 if proven sound;
  `releaseTalent` text/test closure per R3; stale economy-certification re-runs and status
  corrections; D-15 recap consistency updates). **No macroeconomic tuning in D-17A** — no change to
  `AWARENESS_REACH_NEUTRAL`, `DISC_*`, marketing grid constants, awareness dynamics, publicity,
  film revenue, studio share, payroll, overhead, salary curves, production costs, talent
  mechanics, standing formulas, reception, forecast formulas, RNG, or production cadence.
- **D-17B — AWARENESS BUSINESS CYCLE & REACH REPAIR: NOT YET AUTHORIZED for implementation.**
  Design direction is set by R4/R5/R6/R9 above.
- **Acceptance posture:** after D-17A and D-17B are integrated on a candidate branch, the complete
  D-16 evaluation (d16 corpus, G1–G12 with A18's operationalizations, the D-12 gate suite, D-13
  closure distributions, M0A byte-identity, replay determinism) is re-run. Success is judged
  against strategy diversity, capital pressure, controllable influence vs variance, tier
  viability (cheap/standard/premium), star and roster/payroll economics, marketing choice,
  distress frequency, durable recovery, terminal decline, runaway, long-horizon equilibrium,
  prospective information truth, and failure legibility — **not** median cash alone.
- **Next program lineage:** D-17 is developed on branch **`d17-economy-truth-equilibrium`**
  (worktree `/Users/bruce/The Movies - D17 Economy`), created **from the final D-16 HEAD** (so the
  strategic harness and governing analysis travel with the implementation) and reconciled with
  current `main` at its governed integration gate. **The D-16 branch is not merged to `main` at
  closure.** The D-16 harness is standing strategic regression infrastructure; every
  engine-touching milestone re-runs it (Lesson BC).

## 6. Lessons disposition (recorded in `docs/LESSONS-LEARNED.md` in this commit)

- **Finalized:** BC, BD, BF, BG, BH, BI.
- **BJ:** remains DRAFT; finalize only after R2's persist-at-founding correction is implemented and
  proven (D-17A closure).
- **BE:** remains DRAFT through D-17B; its prescribed counter-flow still needs empirical
  validation.
- **BK:** added as DRAFT, cross-referencing BE and AT — *a one-tail fix on a shared unstable stock
  is not a complete repair; when both tails arise from the same unstable feedback stock, a
  counterfactual that improves one tail by worsening the other is evidence, not an acceptable
  standalone balance state.*
