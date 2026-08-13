# Casting Sessions V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-13

Branch: `operation-hollywood-autonomous-marathon`

Implementation candidate: `49d9ae1dbead2c4f7e8a3db86993d39ad53b44d7`

## Result

Casting Sessions V1 adds the smallest authoritative, optional camera-test loop between an accepted
screenplay and package assembly:

`Plan slate → Audition (1 week) → Review evidence → Complete → Assemble package`

The player chooses exact role pairs, spends one real week and one shared Development & Casting
slot, reviews persisted imperfect evidence, and retains final casting authority in a blank package.
The session never selects, signs, pays, reserves, or holds an actor.

This is a successful casting-room foundation. It is not a negotiation, callback, chemistry,
scheduling, or talent-relationship system, and it is not certification that auditions are always
economically optimal or that the D-17B macroeconomic residuals are solved.

## Authority and committed lineage

| Purpose | Commit |
| --- | --- |
| Accepted D-17B + Operation Hollywood history integration | `4432a9befef578ac3549896c2796bf0a22950ec0` |
| Production Operations V1 closure | `28cb711b620ee59cfec7e84b506489de0e9979ac` |
| Script Projects V1 closure | `622749d4116ef15dbf858f9d0f527d92563ee271` |
| Frozen Casting Sessions V1 contract | `efac91f304b433b7d703eb82b28c7564b38522fc` |
| Engine, SaveFileV10, player UI, hardening, and regressions | `49d9ae1dbead2c4f7e8a3db86993d39ad53b44d7` |

The implementation follows `docs/CASTING-SESSIONS-V1-CONTRACT.md`; that contract remains unchanged
at closure.

## Engine law delivered

- New player studios activate managed Casting Sessions with managed Production Operations and
  Script Development at the governed post-founding boundary. Migrated studios remain explicitly
  legacy until forward-only activation; no audition history is inferred.
- Sessions are append-only, canonically identified studio history. One managed screenplay owns at
  most one session, with exact Auditioning, Review, and Complete lifecycle correlations.
- Every slate contains exactly two distinct primary Actors for Lead, Antagonist, and Support and at
  least three different people overall. The final rule is the exact Hall guard for a possible
  three-person legal cast across those pairs.
- Start rechecks the current contract/freelancer market, production and screenplay busy truth,
  primary-role eligibility, locked-writer exclusion, slate law, and capacity atomically.
- A session occupies exactly one deterministic Development & Casting slot for one calendar week.
  It adds no fee, hold, contract, candidate reservation, busy assignment, or ledger entry.
- Due screenplay work completes first, due auditions complete second, and managed production
  allocation follows from the remaining three-owner capacity union in the same visible tick.
- Camera-test evidence uses the shared authoritative cast-slot execution primitive plus an isolated
  derived `casting-v1` stream. Completion never advances the simulation RNG.
- Review acknowledgement is immediate and always legal. A changed downstream staffing condition
  can block package assembly but cannot trap the studio-decision stop.
- Managed greenlight is blocked only while that project's session is Auditioning or awaiting
  Review. Complete evidence survives cancellation, re-greenlight, and release as screenplay-bound
  history.
- The canonical studio-decision order is screenplay review, casting review, then production
  command, with authoritative IDs deciding order inside each class.

## Observation and information result

Each slate entry persists only `{ talentId, estimate, low, high }`. The estimate is the rounded
actual slot execution plus deterministic sigma-3 noise, clamped to 0–100; the displayed band is the
exact estimate ±6 with clamped endpoints. Hidden execution, actual skills, ceilings, persona
values, seed, and RNG state do not enter the Casting Room read model or DOM.

The contract's 42,000-observation calibration found 95.562% truth coverage inside the ±6 band. At
the realistic top-two decision point, Project Fit alone selected the actual-best candidate 82.267%
of the time, audition evidence alone 84.767%, and their same-scale arithmetic mean 86.467%. That
mean remains calibration evidence only: the product displays Fit and audition evidence adjacent,
never a combined score or automatic recommendation.

Evidence is persisted once. Later availability, talent development, tuning, or presentation
changes cannot rewrite the historical camera test. Current package legality is deliberately shown
beside that stale-capable evidence and still controls who may actually be cast.

## Shared capacity and economy integration

Production development, screenplay Draft/Rewrite, and Auditioning now use one exact
`(facilityId, slot)` collision set. Actions, invariants, the Writers Room, Casting Room, Dashboard,
tick allocation, and Studio Lot all consume that three-owner truth. A completed audition releases
its slot before production allocation in that same week.

The bounded economic consequence is opportunity cost: one week of existing payroll and overhead
passes while a shared facility slot is occupied. No casting fee, signing charge, new ledger kind,
financing mechanic, or arbitrary cash sink was introduced. The long-run cost-benefit of choosing
auditions remains explicitly un-certified.

Auditions do not alter screenplay assessment, production forecast, reception, development, fame,
standing, marketing, discoverability, contracts, or box office. Extracting `castSlotExecution`
made forecast, reception, and auditions share one primitive while full-suite and D-16 verification
proved the pre-existing forecast/reception behavior and legacy path remain intact.

## Save and compatibility result

SaveFileV1 through SaveFileV9 remain frozen. SaveFileV10 adds exactly the Casting Sessions root and
strictly validates exact keys, canonical IDs/order, one-session-per-project identity, lifecycle
timing, screenplay/talent/facility references, primary-Actor and writer-exclusion facts, slate and
Hall law, result/slate ordering, exact estimate bands, and all three facility owners.

V9-to-V10 migration adds a fresh legacy-empty casting state, preserves RNG bytes, mutates no input,
and invents no session or evidence. V10 passes by identity. Historical V8/V9 writers use positive
root projections, and historical migration boundaries reject a V10 downgrade rather than silently
discarding casting history. Export/import and replay cover Auditioning, Review, and Complete state.

## Player delivery

- The Casting Room shows exact shared capacity, Ready projects, active sessions, Needs Review, and
  history, with due timing, blockers, consequences, and only currently legal actions.
- The role planner exposes exactly two choices per role, selected counts, the three-person guard,
  current availability, and the exact one-week/one-slot/no-fee/no-hold consequence before Start.
- Writers Room retains both direct package navigation and optional Plan auditions when the latter
  is actually legal. An illegal or stale deep link cannot open a false planner.
- A prepared slate remains visible if capacity or candidate availability changes, but Start disables
  until every selected ID is again legal; the core still performs the atomic final check.
- Sim-to-event stops once for actionable Review and routes to Casting Room. Capacity unavailability
  and completed history never masquerade as decisions.
- Dashboard and the Casting / Talent lot destination expose the real Casting Room. Casting attention
  yields to an active production operation when no legal casting cue exists.
- Review evidence is labelled `Est.`, carries textual ranges, strengths/concerns, and current
  availability, and never preselects a candidate.
- A clear acknowledgement routes to a blank Assembly at Cast & crew, persists the evidence there,
  announces the handoff, and focuses the described heading. If ordinary package gates are blocked,
  acknowledgement completes anyway and focuses the durable completed status with the blocker.

## Red-team repairs incorporated

Independent review found and the implementation corrected these boundary defects before closure:

1. strict V10 could accept Review or Complete before the required audition week had elapsed;
2. the Casting Room sorted review cards by screenplay ID while the canonical decision selector
   used session order;
3. Writers Room and deep links could advertise a planner without a free slot or three eligible
   primary Actors;
4. a successful Take results to Package navigation could lose its announcement and focus target
   when Casting Room unmounted;
5. an empty managed casting cue could hide an active pre-production operation at the same lot
   building;
6. an exported shared-capacity helper omitted externally occupied casting slots and its player copy
   omitted the casting owner;
7. a prepared slate could retain a newly unavailable selected actor and leave Start apparently
   enabled until core rejection; and
8. an Actor-blocked Ready screenplay could paint a false `auditions optional` lot cue and suppress
   real production activity.

The final independent core/save/action/UI/lot re-review reported **PASS**, all eight findings fixed,
and no remaining actionable P1–P3 finding.

## Verification at the implementation candidate

| Gate | Result |
| --- | --- |
| `npm test -- --reporter=dot` | **PASS — 133/133 files, 1,648/1,648 tests** |
| `npx vitest run --config src/harness/d16/vitest.d16.config.ts --reporter=dot` | **PASS — 10/10 files, 176/176 tests** |
| `npm run typecheck` | **PASS — root and UI TypeScript clean** |
| `npm run build` | **PASS — 124 modules transformed** |
| `git diff --check` | **PASS** |

The production build retains the pre-existing large-chunk advisory; it is not a build failure and
was not introduced as a casting correctness issue.

## Live acceptance

A visible in-app browser session recovered the managed `studio-001` studio at Week 2 with *A Season
of Archipelago* already occupying one of two Development & Casting slots. Casting Sessions were
explicitly activated without inferred history. The player commissioned and accepted *A Season of
Escapement* by Rex Petrov, then planned a legal six-entry slate using Myrna Emerson, Blanche Petrov,
and Lauren Reyes. Start consumed the second shared slot, charged no fee, created no hold, and
promised results exactly one week later.

At Week 4, Sim stopped for the casting review. The Casting Room displayed persisted `Est.` values
and ±6 bands for all six role entries, including Lead 37/50, Antagonist 45/47, and Support 45/31,
with no winner or preselection. Because the Production/Craft Lead pool was then empty,
acknowledgement still completed and focused the durable status while naming the ordinary package
blocker.

The Saves UI exported a 224,101-character SaveFileV10 containing the Complete session. Pasting it
into the real Import control and loading restored Week 4 and the exact historical evidence. After
the player created and signed Harper Bell as a Craft professional, the now-legal Open package route
opened blank Assembly, kept every camera-test card visible, announced that auditions selected no
one, and focused the Cast & crew heading through its `aria-describedby` handoff. Final reload
restored the dashboard and Week 4; browser console warnings and errors were empty.

## Explicitly open

- casting directors, assistants, offices, departments, casting budgets, and studio relationships;
- callbacks, chemistry reads, screen tests with scenes, ensembles, supporting-role breadth,
  attachments, holds, exclusivity, negotiations, offers, agents, and contract terms;
- audition discovery for cross-discipline performers outside the primary-Actor planner pool;
- reruns, canceled sessions, replacements, automatic recommendations, and audition development;
- actor schedule planning, production calendars, manual facility scheduling, and prioritization;
- facility construction, upgrades, quality, maintenance, operating costs, and the believable
  size-scaling capital sink;
- formal casting-session cost-benefit and long-run strategic-value certification;
- D-17B residuals: cash runaway, top-studio economic immortality, the Week-208 synchronized roster
  wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu
  breadth, and formal G12 timing.

No financing, loans, bailouts, restructuring, arbitrary cash sink, hard bankruptcy, or failure
ladder was introduced.

## Git and publication boundary

The implementation and this closure live only on `operation-hollywood-autonomous-marathon`. Main,
the accepted D-17B worktree/branch, and the Operation Hollywood integration worktree/branch remain
untouched. Nothing was pushed. No milestone tag is created: repository tags mark Owner-accepted or
merged milestones, and this autonomous branch has not crossed that gate.

The closure commit is documentation-only. Its exact documents are:

- `docs/CASTING-SESSIONS-V1-CLOSURE.md`;
- `docs/LESSONS-LEARNED.md`;
- `docs/art/OPERATION-HOLLYWOOD-ENGINE-BRIDGE.md`.

## Next authorized marathon move

Freeze a separate Studio Calendar & Capacity Board V1 contract before implementation. It should
compose the now-authoritative screenplay, casting, production, theatrical-run, and contract clocks
into one read-only operating view; distinguish committed facts from conditional on-schedule dates;
and instrument utilization, holds, pipeline lead time, and Week-208 expiry clustering before any
facility price, operating cost, or size-scaling sink is proposed.
