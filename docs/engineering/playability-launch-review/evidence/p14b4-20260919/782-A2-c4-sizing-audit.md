# 782-A2 — bounded contract review of 782 §7 (the sizing amendment) and record 792, summarized by the parent

Reviewer: the contract-auditor role contract run through a general-purpose agent (roles not registered in this
session), model Sonnet, read-only, at `ff7b9ac1`. Returned 2026-09-25 before 22:31:29 CEST (the parent's
`date` when it acted on the report).

**VERDICT: REFINE.** The rule is judged sound and within delegation; three gaps must close before RED.

- **Q1 authority, VERIFIED AT SOURCE.** "Deficit + youth floor" sits inside companion §6.5's delegation
  (`P14-PREPARATION-COMPANION.md:540`). It keeps the 32 clip with no carry-forward, so it is not emergency
  generation, and it conflicts with no Owner-selected rule. 40/14/16/14 is exact for fresh worlds: genesis
  12/10/28/10 plus 4 founding rivals × `RIVAL_TEAM_ROLES`. For migrated worlds the reviewer suggested a
  per-world founding population (INFERENCE).
- **Q2 re-derivation, VERIFIED AT SOURCE.** `state.talent` is append-only at its three growing writers
  (`tick.ts:1075` map, `hollywoodTick.ts:163`, `hollywood.ts:242`). `ageAt` over the immutable anchor reproduces
  the engine's age at any past week. Settlement writes `retiredWeek = w` before intent. Every same-tick append
  precedes the terminal lifecycle step. No lawful save is refused and no corrupted one accepted. The residual
  risk is a cohort step that does not append its block atomically.
- **Q3 traps.** A solvent rival's `staff()` can take an entrant on the next tick (`hollywoodTick.ts:142`). The
  listing places every free agent first (`employment.ts:404-409`). `freeAgents` is never pruned. The 104-week
  idle anchor cannot fire early for an entrant. Block contiguity depends on the cohort step.
- **Q4 demonstration.** §7.5 disclosed the youth clause's by-construction risk but missed the same risk on the
  listing clause. The paper model held per-seed pairs and reported only marginals. 792 §2's wording
  contradicted itself (a wording defect; the data is consistent).
- **Q5 defects:** (1) report the measured joint rate; (2) disclose the listing risk; (3) fix the F-792-1
  wording; (4) decide constant versus world-derived `accepted_p`; (5) add tests for the staff() take and the
  freeAgents growth, and state contiguity.

Disposition: all five acted on in 782 §8. Item 4 was considered and DECLINED with its reason recorded
(a per-world founding population is not reconstructible for migrated worlds, and the V35-boundary alternative
locks late worlds out of replenishment).

**Reviewer process notes, recorded as given.** The reviewer reported that Glob and Grep were unavailable in its
session. Its append-only finding therefore rests on the writers it located by reading, and it says so. The
parent's own grep at `ff7b9ac1` (794 context) found `talent` reassigned only by order-preserving `map`
projections in `save.ts` and the materialization in `tick.ts`. The T0 continuations (790/791) measure
append-only on real runs. The reviewer also did not locate `782-A-c4-contract-audit.md`, which exists; it
treated 782 §6 as the record of that review.
