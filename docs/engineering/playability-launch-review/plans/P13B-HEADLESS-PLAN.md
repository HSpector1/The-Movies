# P13B headless engine plan — logic-first window (2026-09-16)

> **For agentic workers:** execute task-by-task with `superpowers:test-driven-development`; verify with
> `superpowers:verification-before-completion` before any status claim. Steps use `- [ ]` checkboxes.
> Project law outranks skill defaults: tests here are real scheduler/command/save tests (Owner task), not
> smoke checks; plans live in this `plans/` directory (execution boundaries), not `docs/superpowers/`.

**Goal:** implement and test the eight P13B Ready obligations as headless engine logic on
`wip/headless-program-20260916-ts`, in dependency order, without Unity changes.

**Architecture:** the technology root moves from the P13A single-Scientist shape (v1, Save V20) to a
seat/receipt shape (v2, Save V21) so named staffing, multi-Lab allocation, queues and rival capacity can be
recorded per week and reconciled. Every slice keeps `(state, actions) => state` purity, exact-key
validation, fixed-point work accounting and ledger reconciliation. Bridge read models are enriched without
changing the wire schema until a slice needs new fields; each schema change bumps the projection and is
recorded for the future Unity consumer in `UNITY-INTEGRATION-BACKLOG.md`.

**Tech stack:** TypeScript strict, vitest 2.1.9 (`--minWorkers=1 --maxWorkers=2` on this host), existing
generators (`scripts/generate-bridge-contract*.ts`). No new dependencies.

**Budget carried forward (Owner: caps are planning checkpoints, not a fresh clock):** whole-program
ledger at the paused record: capability remaining ≈ 38.3 h, reserve ≈ 5.9 h with the 6 h protection line
already crossed by 0.08 h. P13B planning allowance (companion §9, not accepted tuning): 84 h capability +
36 h reserve for all eight rows. This window charges actuals per slice in `HEADLESS-PROGRESS.md`; any hour
beyond the carried 38.3 h is reported as overrun, never hidden.

**Decision classes used below:** Owner selected / delegated implementation decision / provisional tuning /
proposed product choice (not coded).

---

## Slice order (dependency order from companion §3)

| Slice | Ready row | Scope | Prerequisite |
|---|---|---|---|
| S1 | 1 | Full named staffing on one Laboratory: candidate pool, seats, weekly allocation, receipts, V21 | none |
| S1b | 1 | Bridge read model for seats (projection bump) | S1 |
| S2 | 2 | Second technology entry (R07 lighting-control-01), multiple Labs, cooperation/splitting factor, module claims | S1 |
| S3 | 3 | Persistent queues/dependencies/admission | S1 (P09 quote envelope) |
| S4 | 4 | Office gap-aware conversion/direct purchase | P09 placement |
| S5 | 7 | Component inventor pricing/prototypes per technology | S2 |
| S6 | 6 | Option-B installation cancellation with component receipts/restoration | S5 |
| S7 | 5 | Forecast/replacement disclosure (public milestone facts) | S2 |
| S8 | 8 | Symmetric rival research with governed capacity and typed finance | S2, S5, S6 |

S2–S8 are recorded here at scope level and expanded into TDD tasks when their turn comes; each expansion is
a plan amendment on this file, not a new hierarchy.

---

## S1 — Full named research staffing (Ready row 1)

**Scope.** Replace the one-Scientist programme with named seats on one Laboratory: a deterministic
eight-person candidate pool per studio, up to four occupied seats per Lab, per-seat eligibility (employed
Scientist, unreleased seat), weekly spend `min(ceiling, 10,000 × n)` and output `n + spend/20,000`, per-week
receipts, retained work through expiry/rehire/pause/cancel, V20→V21 migration with a frozen legacy prefix.
Multi-Lab cooperation and the second brief stay in S2; S1 refuses seats on a second Lab explicitly.

**Authoritative choices.**
- Owner selected (P13A receipt, P13B index): research is real named work; payroll is separate from R&D;
  verified work is retained through pause/cancel/expiry; filming-phase lock unchanged; all eight rows retained.
- Delegated implementation decisions: technology root v2 (`seats`, `weeks`, `legacy`), Save V21 through the
  existing save owner, `releaseResearchSeat` command, auto-pause when no seat remains eligible (retains the
  P13A law), candidate pool via the existing `generateScientist(seed, id)` on ids `t-sci-00`…`t-sci-07`
  (Otto stays `t-sci-00`), one project per (studio, technology) with the unchanged id law.
- Provisional tuning (companion S1-A/B candidate, not Owner-approved balance): $10k usable per seat, 4 seats
  per Lab (`TUNING.RESEARCH_LABORATORY_CAPACITY`), 8 employed Scientists per studio, ceiling $0..$1m.
- Proposed product choices left uncoded: "exactly one restart after cancel" (companion §2 journey table);
  P13A restart law (retained work, repeatable) is preserved and the choice is recorded in the progress file.

**Current producer contracts consumed.** P10 employment (`contractOffer`, `applySignContract`, hiring market,
`activeContract`), P09 placement (Lab facility capacity, instrument installation, occupancy claims), P11 ledger
kinds (`researchSpend`, `researchPayroll`, `technologyAdoption`), P12 employment intervals
(`hollywood.employment`) for payroll reconciliation, P13A technology validator as the V20 frozen boundary.

**Tests (requirement-derived; each fails before its implementation).**
1. Candidate pool: eight distinct ids/names per seed, deterministic, no RNG advance; ninth recruit refused;
   recruit by explicit id; Otto remains first.
2. Seats: four distinct people on one Lab; fifth refused with the seat-cap reason; assigning a person
   already seated refused; seat on a second Lab refused in S1; release then re-seat keeps history.
3. Scheduler: 4 seats × $40k → spend 40,000 / output 6 / 11 funded weeks (paper table); 1 seat × $40k → 10,000
   / 1.5 / 43 weeks (P13A); 0 ceiling × 4 seats → 4 units/week, 16 weeks; 2 seats × $25k → 20,000 / 3.
4. Expiry: one of four contracts ends mid-project → that seat earns/charges nothing, n drops to 3, seat
   retained; rehire same id resumes it; all seats expired → project pauses; payroll/overhead continue while
   idle; a released (early) last seat pauses immediately.
5. Conservation: Σ receipt spend = expenditure = Σ ledger `researchSpend` rows; Σ receipt units = verified
   work × 20,000; cash delta reconciles across a funded interval.
6. Identity: two Scientists with the same name and different ids are seated, charged and reported by id.
7. Determinism/replay/interleaving: same seed + same actions → byte-identical export; seating mid-project
   changes n from the next boundary only; save/reload byte-identical at every state.
8. V20→V21: the three legacy fixtures (`tests/fixtures/p13b/*.json.gz`, minted at
   `e2e409e80eccb6a7fd49fa16aa0f750faeb51253`) migrate with the scientist mapped to one seat at the migration
   week, a legacy prefix carrying exact prior work/spend, empty receipts, byte-identical remaining roots;
   `migrateToV20` refuses V21; the V19 accepted fixture still migrates through V20 to V21.
9. Validator refusals on V21: forged receipt units, receipt for an unemployed seat, fifth seat, duplicate
   unreleased seat for one person, receipt/ledger mismatch, receipt count beyond the bounded growth limit.
10. Campaign isolation: two migrated copies are independent objects and a tick on one leaves the other exact.

**Capability/verification budget (planning allowance):** 6 h capability, 2.5 h verification. Actuals are
charged in `HEADLESS-PROGRESS.md`.

### File map

- Modify `src/core/technologyTypes.ts` — v2 root types (`ResearchSeat`, `ResearchWeekReceipt`,
  `ResearchLegacyPrefix`), `recruitScientist.scientistId?`, `releaseResearchSeat`.
- Modify `src/core/technology.ts` — candidate pool, seat law, quote/advance with receipts, v2 validator;
  keep the P13A validator as `validateTechnologyV1` (frozen V20 boundary).
- Modify `src/core/actions.ts` — recruit bound and explicit id; `releaseTalent` seat-aware pause.
- Modify `src/core/employment.ts` — `busyTalentIds` over eligible seats.
- Modify `src/core/occupancy.ts`, `src/core/presence.ts`, `ui/src/engine/adapter.ts` — seat-aware claims.
- Modify `src/core/save.ts` — `SaveFileV21`, `validateSaveV21`, `convertV20ToV21`, `migrateToV21`,
  `makeSave` → V21, downgrade guards.
- Modify `bridge/laboratory.ts` — seat-aware page and actions, schema unchanged (projection 32).
- Create `src/harness/p13b/fixtures.ts` — staffed-Lab generated fixtures.
- Create `tests/p13b-s1-staffing.test.ts`, `tests/p13b-s1-scheduler.test.ts`,
  `tests/p13b-s1-save-v21.test.ts`, `tests/p13b-s1-validation.test.ts`.
- Update existing P13A/bridge tests only where the shape or version changed (record each).

### Tasks

- [ ] **T1 Types + candidate pool (RED→GREEN):** test 1; add `researchCandidates(state)` in
      `technology.ts`; extend `recruitScientist`.
- [ ] **T2 Seat commands:** test 2; `assignResearchScientist` creates/extends the project with a seat;
      `releaseResearchSeat`; refusals.
- [ ] **T3 Scheduler + receipts:** tests 3, 5, 7; `researchWeekQuote` over eligible seats;
      `advanceResearchWeek` writes receipts and caps the final week.
- [ ] **T4 Expiry/rehire/pause:** test 4; eligibility, auto-pause, `releaseTalent` seat-aware pause,
      `busyTalentIds`.
- [ ] **T5 Validator v2:** test 9; rewrite `validateTechnology`; keep `validateTechnologyV1` for V20.
- [ ] **T6 Save V21 + migration:** test 8, 10; save owner changes; legacy fixtures; downgrade refusals.
- [ ] **T7 Consumers:** occupancy/presence/adapter/bridge seat-aware; bridge P13 tests updated; test 6.
- [ ] **T8 Affected suites:** `p13a-*`, `bridge-p13-*`, `tick`, `save`, `replay`, occupancy tests; then a
      bounded full core pass; record results and inherited failures.
- [ ] **T9 Checkpoint:** progress/backlog/continuation records, commit, push.

Each task ends with a commit on this branch. Commands: `npx vitest run --project core --minWorkers=1
--maxWorkers=2 <files>`; `npx tsc --noEmit -p tsconfig.bridge.json`.

---

## S2 — Multiple Labs, cooperation and splitting (Ready row 2) — scope record

Add the second catalogue entry `lighting-control-01` (researchable 780, commercial 936, 64 units, P2,
electrical/control module blueprint $350k/5 weeks/+$2k weekly, provisional tuning), Lab module claims (one
active project per discipline bench per Lab), seats across two Labs per project, the unequal-team output
rule `a + 0.625·b` (equal full Labs → 9.75), proportional per-Lab funding with whole-dollar remainder by
stable Lab id, document 03 allocation fixtures reproduced through the real scheduler. Requires S1.
Allowance: 10 h capability, 3 h verification. Product choice recorded, not coded: the exact R07 demanding
lighting-setup production recipe (Current Ops named pre-execution clarification).

## S3 — Persistent queues/dependencies/admission (Ready row 3) — scope record

Ordered plans with exact ids, dependency graph, approved maximum debit, admission mode default "review
changed quote", no reservation before start, cycle/unknown/impossible refusals, cancelled-predecessor
blocking, save/reload and Save As independence. Requires S1 and the P09 quote fingerprint. Allowance: 8 h
capability, 3 h verification.

## S4 — Direct gap-aware conversion/purchase (Ready row 4) — scope record

Office I→III direct ($1.25m/16 weeks), II→III ($850k/8), I→II ($500k/4) as candidate O1 tuning; new III
without II prerequisite is a proposed product choice for disposition and is not coded until disposed;
retained body Opex, standard increments only while operational, existing assessments unchanged.
Allowance: 6 h capability, 2 h verification.

## S5 — Component inventor pricing/prototypes (Ready row 7) — scope record

Access/equipment/site/installation/capture/Post components per technology; first prototype covers one
equipment set; later inventor equipment at the 25% concession (sound $225k, lighting $150k); no negative
line; entitlement scoped by campaign/studio/technology/project. Requires S2. Allowance: 6 h / 2 h.

## S6 — Option-B installation cancellation (Ready row 6) — scope record

Component quantity/progress/cost receipts; completed work paid, unstarted refundable once, delivered
equipment retained, restoration job ($25k/2 weeks sound, $10k/1 week lighting, candidate), same-tick
completion ordering, cross-year refund bucket. Requires S5. Allowance: 8 h / 3 h.

## S7 — Forecast/replacement disclosure (Ready row 5) — scope record

Public milestone facts only; R07 distant window 884..988 narrowing on public announcement at 884 to 936;
no private rival research exposure; replacement descriptors on purchase. Requires S2. Allowance: 4 h / 2 h.

## S8 — Symmetric rival research and finance (Ready row 8) — scope record

Receipt-backed rival Lab construction/instruments (≤2 Labs × 4 seats), same law as players, reserveWeeks
policy, typed rival ledger kinds (`researchSpend`, `researchCapacity`, `technologyRestoration`,
`technologyRefund`), interval Opex, migration basis frozen at the migration week, legacy zero-Opex
grandfathered. Requires S2, S5, S6. Allowance: 12 h / 4 h.
