# CAMPAIGN 2 — IMPLEMENTATION LOG & LIVE HANDOFF

> Standing purpose: any session (or any successor PM) can resume C2 from this file
> alone. Updated at every milestone checkpoint and every accomplishment once Owner
> usage nears its cap (Owner directive, 2026-08-18). Keep entries compact:
> state → evidence → next action.

## Authority chain (read in this order on resume)

1. `CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md` (r3.2, root of this branch) — the frozen law.
2. `docs/c2-planning/00A..00F-*.md` — Owner rulings (00E = all GO-sheet decisions RULED;
   00F = GO order: Movie #2 gate, professional tycoon floor, Builders directive).
3. `docs/c2-planning/01..16-*.md` — evidence lanes (15 = multi-role audit, 16 = placement sweep).
4. This log — what actually happened.

Branch: `c2a-implementation` (from canonical main `c0c9561`; PF1 sealed KEEP).
Worktree: `/Users/bruce/The Movies - C2 Planning` = planning (frozen);
`/Users/bruce/The Movies - C2 Implementation` = live implementation.
Owner acceptance (north-star): *"I built this movie studio, it operates while I
watch, my writers create pictures, and I can physically watch multiple films
compete for real production resources."* P0 seal gate: **Movie #2 without
guessing** (WHAT HAPPENED / WHY IT MATTERS / WHAT DO I DO NEXT at every stage).

## Operating lessons (bind future dispatches)

- **API burst failures are real**: three incidents on 2026-08-18 killed agents in
  same-second clusters (at spawn AND mid-run). Detection: transcript stops growing
  / ends on a malformed no-model-id message. Response: adopt-and-recover — attribute
  the dead lane's dirty files, spawn a recovery agent with the original scope + the
  adoption instruction + hard do-not-touch lists for live lanes' files.
- **Git discipline**: lanes stage explicit pathspecs ONLY (an M0 lane's `git add -A`
  swept three other lanes' files into its commits — content intact, packaging wrong).
- **Full vitest must run alone, unpiped, redirected to a file** (concurrent load
  produced 28 phantom failures at M0 integration).
- One writer per shared surface, serialized per milestone
  (`App.tsx`/`StudioLotScreen.tsx`/`adapter.ts` + whatever the wave assigns).

## M0 — ACCEPTED (Owner, 2026-08-18)

HEAD `f7e426b`. Landed: FOUNDING_* TUNING hoists; `src/core/productionPhases.ts`
(phase machinery single-sourced, blocker table derived); `src/core/occupancy.ts`
(`occupiedResourceSlots` union producer, all nine §3.2 traversals subsumed,
fail-closed cross-owner invariant, kind-qualified runtime keys); sticky
reservations for every capability (R-1 repair). Five contract suites (23 tests)
in `tests/contracts/`. E0 baseline: C1 economy figures reproduced byte-identically;
**D-17B verdict CONTAINED**. Doc repairs landed. Multi-role audit (00F): verdict
**NO duplication possible**, fifteen seat pairings pinned; residuals routed
(R3 audition payoff → M2 SCREENS; R4 refusal voice → pulled forward into M2a).
Floors at baseline: tsc×2 clean; vitest 269f/3,802+5; Playwright 209/4/0 (16.4m).
Final M0 vitest at `f7e426b`: expected 275f/3,852+5 — the last clean solo run's
log is `/tmp/c2a-m0-vitest-final.log`.

## M1+M2 — IN FLIGHT (wave `wf_66f46b6d-0b2` + two recovery agents)

Wave design: Phase 1 parallel [ENGINE-M1 complete V14+studioEvents+wrap event;
WORLD-M2a dynamic N-stage identity + stage bakes + plate fallback; SCREENS-M2a
audition payoff + refusal voice seam; TESTS-M1 T9 matrix + event pins; SWEEP-M2
placement sweep] → Phase 2 ENGINE-M2 (blueprint slate, SET_TYPES, sets machinery,
binding, wired stat block, ground per sweep) → Phase 3 [SCREENS-M2b package/
greenlight set surfaces; WORLD-M2b set world presence] → Phase 4 integrator
(floors solo, FMJ unmodified, migrated-save-greenlight gate, new legibility
Playwright spec, full Playwright kicked in background).
INCIDENT: tests-m1 + screens-m2a died 19:54 (burst); recovery agents adopted
their partial work (tests: `tests/contracts/_v14Contract.ts`,
`tests/v14-migration.contract.test.ts`; screens: TalentPicker/common/
LotCastingReviewPanel/Assembly + `ui/src/presentation/auditionEvidence.ts`,
`refusalVoice.ts`) on the original ownership sets.

NEXT after this wave: M3 (Renewable Screenplay Generation V1 — §3.5), M4
(throughput: cap deletion, queues, release law), M5 (Living Turn V1 + theater),
M6 (Premiere at the Gate), M7 (economy remeasure), M8 (seal + Owner playtest).
Budget posture: consolidate later milestones into fewer, larger sequential lanes;
gates are the verification (no separate verify workflows during implementation).
