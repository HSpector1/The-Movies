# 1305-B — independent R3 rival release plan review

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of
[1305-A](1305-A-rival-release-proposal.md), persisted verbatim by the parent.

**REFINE**

1305-A is a careful, well-evidenced paper plan and mostly reuses existing generic machinery correctly. But two load-bearing implementation gaps must be resolved before the parent writes production, and one test-mechanism ambiguity should be closed. None of these require an Owner decision; both are correctness/design gaps inside an already-approved (§3.6, R3) implementation recommendation.

## Required amendments

1. **Specify the effect-propagation channel.** `staff()` (`src/core/hollywoodTick.ts:93-174`) receives `state: GameState` read-only and mutates only the local `h: HollywoodState` / `b: RivalBusiness` clones. It has no path to write `state.freeAgents`, `state.technology`, or `state.promises`. `advanceHollywoodWeek`'s return type (`hollywoodTick.ts:267-275`) already threads `firstTakes`, `greenlights` and `suppliedTalent` back to `tick.ts` for exactly this reason; a rival release needs the same kind of channel (e.g. `released: {talentId,studioId,week}[]`). `finishHollywoodWeek`'s own free-agent computation (`hollywoodTick.ts:374,392`) only unions people whose `terms.endWeekExclusive<=week` — a person released early via `staff()` (endedWeek=week, endWeekExclusive still future, already dropped from `activeEmploymentOrdinals` per Law item 2) will **not** be picked up there. As written, "the person joins `state.freeAgents` that week" (Law item 3) has no mechanism. Compare `applyReleaseTalent` (`src/core/actions.ts:2685-2692`), which can do this in one step only because it runs at full `GameState` scope, not inside a nested business loop. This is MISSING, not merely underspecified — a genuine architecture question the plan's "Placement" question (task Q3) asks and the document doesn't answer.

2. **Fix the surplus-detection premise for the scientist role.** `RIVAL_TEAM_ROLES` (`src/core/hollywoodStartingData.ts:46`) is `['writer','director','actor','actor','actor','craft']` — no `'scientist'`. Scientist slots come only from `extraRoles`, sized by `rivalScientistDemand` (`src/core/rivalResearch.ts:113-123`), which returns `Math.max(0, Math.min(capacity,demanded)-employed)` — the **deficit only**. Whenever a studio is exactly staffed or overstaffed on Scientists, this is 0, so `[...RIVAL_TEAM_ROLES,...extraRoles]` never contains `'scientist'` and the slot loop (`hollywoodTick.ts:138-172`) never adds any currently-employed scientist to `filled`. Under the proposal's rule ("each own active employee not retained [not in `filled`] is surplus"), **every** employed scientist would read as surplus in that week, not only a genuine excess — unless individually protected by the seat-exclusion condition. A scientist who is employed to satisfy real demand but momentarily holds no active project seat (between assignments) is not protected and would be wrongly released and re-hired, contradicting the plan's own claim that the strategy is "stricter than R2" and needs no research-release handling. This is DEVIATES from the stated premise, cited exactly. `rivalResearch.ts:160`'s seat count (cited by 1305-A) is a laboratory-admission tally across all seats, not a per-talent membership check, so it does not by itself close this gap.

3. **Name the synthetic-surplus mechanism explicitly, and avoid the scientist path.** Given finding 2, the falling-`rivalScientistDemand` route is not a safe synthetic fixture until the `staff()`/`rivalScientistDemand` interaction is fixed — using it now would either mask the bug or make the RED test non-deterministic about *why* the person is surplus. The profession-transition route (rewriting a `RIVAL_TEAM_ROLES`-eligible employee's `Talent.role` off the fixed list, per C.3) is the sound one and should be named as the required mechanism.

## Question-by-question findings

**Q1 — law fidelity.** Charge/effective-end/receipt/freeAgents/R2/R1 text matches accepted symmetric primitives: `terminationCost` (`employment.ts:197-200`), `releaseFloor` (`talentMarket.ts:209-234`, already releasing-studio-generic), `breakPromisesOnTermination` (`promises.ts:1076-1089`, issuer-agnostic). Player-only gate confirmed at `hollywoodValidation.ts:444-445` and `:512-513`. Case-invalidation and promise/trust omissions are correctly proven unreachable: condition "(more than 26 weeks remain)" is a strict superset of "outside the 12-week renewal window," so a release-eligible person is never a case subject — MET WITH EVIDENCE, not merely asserted.

**Q2 — strategy.** Deterministic, no RNG, no new tuning: MET, except for the scientist defect above. Promise beneficiaries and research-seat holders excluded consistent with "symmetric in law, reserve-bounded as strategy" (§3.6). The 26-week test is sound (matches `terminationCost`'s own cap). "Surplus really arises" is true for the profession-transition source; the scientist-demand source is not safe as stated (finding 2).

**Q3 — placement.** Ordering relative to renewal loop, case exclusion, `decide()`, research admission and `finishHollywoodWeek` is plausible, but the freeAgents/effect-wiring mechanism is MISSING (finding 1).

**Q4 — persistence.** Save41 shape, `periodOf` reuse, frozen V≤40 keeping the old keyset/player-only rule, and the lossless-only-when-zero downgrade idiom all match established precedent (`hollywoodValidation.ts:238-283`; downgrade idiom at `save.ts:536-567`). `LIVE_SAVE_VERSION` confirmed at 40 (`save.ts:6538`), consistent with the 41 bump. No other `RIVAL_MONEY_KINDS` enumerator found in the files reviewed; not exhaustively swept.

**Q5 — projection.** Confirmed: `bridge/industry.ts:116` and `:350` render every end receipt as "Contract ended" regardless of reason; `bridge-schema.ts:2679`'s `transition` enum covers only start reasons. MET WITH EVIDENCE.

**Q6 — tests.** RED scope and "LOGIC VERIFIED / natural reachability OPEN" framing is consistent with prior project practice. Mechanism needs naming per amendment 3.

**Q7 — Owner decision.** None found; everything here sits inside the already-classified R3 IMPLEMENTATION RECOMMENDATION (companion §7.2).

## Not verified
`src/core/industryEmployment.ts` and `src/core/hollywoodValidation.ts:505-520` full text not read in this pass; no exhaustive grep for every Bridge/finance-report reader of `RIVAL_MONEY_KINDS`; 1304-C/1304-stage staged files and the 1302 broad gate ignored per instructions and not reviewed. No code was run; this is a source-only read.
