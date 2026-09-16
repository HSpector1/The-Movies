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

- [x] **T1 Types + candidate pool (RED→GREEN):** test 1; add `researchCandidates(state)` in
      `technology.ts`; extend `recruitScientist`.
- [x] **T2 Seat commands:** test 2; `assignResearchScientist` creates/extends the project with a seat;
      `releaseResearchSeat`; refusals.
- [x] **T3 Scheduler + receipts:** tests 3, 5, 7; `researchWeekQuote` over eligible seats;
      `advanceResearchWeek` writes receipts and caps the final week.
- [x] **T4 Expiry/rehire/pause:** test 4; eligibility, auto-pause, `releaseTalent` seat-aware pause,
      `busyTalentIds`.
- [x] **T5 Validator v2:** test 9; rewrite `validateTechnology`; keep `validateTechnologyV1` for V20.
- [x] **T6 Save V21 + migration:** test 8, 10; save owner changes; legacy fixtures; downgrade refusals.
- [x] **T7 Consumers:** occupancy/presence/adapter/bridge seat-aware; bridge P13 tests updated; test 6.
- [x] **T8 Affected suites (2026-09-16 14:55–15:44, quiet host, `d74426a`, baseline-matched flags; evidence 06–13: core 217/225 files, bridge 53/55, failing set = inherited + one stale expectation fixed and re-proved):** `p13a-*`, `bridge-p13-*`, `tick`, `save`, `replay`, occupancy tests; then a
      bounded full core pass; record results and inherited failures.
- [x] **T9 Checkpoint (2026-09-16 ≈16:05; S1 LOGIC VERIFIED · UNITY NOT VERIFIED):** progress/backlog/continuation records, commit, push.

Task evidence (2026-09-16): T1/T2 `tests/p13b-s1-staffing.test.ts` 5/5 (RED 13:02 → GREEN 13:50); T3/T4/T7 `tests/p13b-s1-scheduler.test.ts` 13/13 + `tests/bridge-p13b-s1-identity.test.ts` 1/1; T5 `tests/p13b-s1-validation.test.ts` 7/7 (+ P13A validation 9/9 after the duplicate-charge pre-pass); T6 `tests/p13b-s1-save-v21.test.ts` 8/8 on the three frozen V20 fixtures + accepted V19; commits `b5b2412`, `5a52e1e`, `d74426a`; read-only audit at b5b2412 (no false refusals; 3 findings fixed in d74426a). Each task ends with a commit on this branch. Commands: `npx vitest run --project core --minWorkers=1
--maxWorkers=2 <files>`; `npx tsc --noEmit -p tsconfig.bridge.json`.

---

## S1b — Bridge read model for seats (projection 33) — task expansion (amendment 2026-09-16)

**Scope.** Publish the S1 facts the Unity consumer will need as data, not labels: `StudioLaboratoryPage.seats[]`
(`talentId`, `name`, `assignedWeek`, `releasedWeek`, `employed`), `receipts` (the last eight
`{week, seatTalentIds, spend, units}`), and numeric `weekly` (`ceiling`, `usable`, `seats`, `output`)
beside the existing labels (labels stay for the paused client). Projection 32 → 33; protocol 4 unchanged.
Delegated implementation decision: additive fields only; nothing existing renamed. Allowance: 2 h / 1 h.

- [ ] **S1b-T1 Schema + generator (RED→GREEN):** bridge schema test asserts the new members and projection 33;
      `npm run generate:bridge-contract` + `generate:bridge-contract:fixtures`; manifest hash recorded here and in the backlog.
- [ ] **S1b-T2 Page:** `bridge/laboratory.ts` fills the members from `occupiedSeats`/`project.weeks`/`researchWeekQuote`;
      `tests/bridge-p13b-s1b-seats.test.ts` proves seats by id (same-name pair), receipts order, and no private rival data.
- [ ] **S1b-T3 Records:** backlog (C# binding change: `StudioLaboratoryPage` DTO + fixture regeneration + paired Unity adoption), progress row, commit, push.

## S2 — Multiple Labs, cooperation and splitting (Ready row 2) — task expansion (amendment 2026-09-16)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §4 (candidate briefs, multiple-Labs
recommendation, unequal-team rule), `03-PAPER-ECONOMICS.md` (formula/clock, 64-unit staffing table, [780,832)
allocation fixtures) and `06-CURRENT-OPS-CORRECTION-AND-DISPOSITION.md` (Post-onset correction; +$12,000 rows), all at
`673f49835404e262ea651b4fcb8fda5e259d80a6` (SHA-verified copies in the Owner packet materialization).

**Scope.** Research side only: the second catalogue entry, Lab discipline modules and bench claims, seats across two
Labs per project, the cooperation output rule and proportional funding, per-Lab receipts, document 03 dates reproduced
through the real scheduler. Lighting **deployment** (access/equipment/site/installation components, +$1k weekly) is S5;
its cancellation is S6. The **production consumer** of R07 (demanding lighting setup 4→2 setup units, Set size classes)
stays DESIGN BLOCKED on the named pre-execution clarification (Future Ops R2 exact recipe) and is not coded here.

**Authoritative choices.**
- Owner selected: all eight rows retained; direct conversion selected (S4); money scale OPEN-5 stays the Owner's.
- Delegated implementation decisions: catalogue entry `lighting-control-01` (researchable 780, commercial 936, 64 units,
  P2) on a Lab `electrical-control-instruments` module ($350k / 5 weeks / +$2k weekly, P09 installation on a Laboratory);
  `stageInstallationId` for lighting is a P09 installation blueprint `lighting-control-stage` recorded at the whole-package
  quote ($100k / 4 weeks / +$1k weekly) so catalogue reachability holds — S5 decomposes it into site $50k/2w + install
  $50k/2w components; `postInstallationId` becomes nullable (lighting has no Post component); **work numerator rebased to
  1/160,000 (WORK_UNIT × 8) in Save V22** so `a + 0.625·b` is exact in integers (V21→V22 multiplies every stored numerator
  by 8, byte-identical otherwise); per-Lab receipt rows `{laboratoryFacilityId, seatTalentIds, spend, rawUnits}` under each
  week receipt with the project credit `units`; project `laboratoryFacilityId` stays the home Lab (first seat), seats carry
  their own Lab; a person holds one seat across all projects; two operational Labs per studio, third refused.
- Provisional tuning (companion §4, not Owner-approved balance): 0.625 second-Lab factor (equal full Labs → 13/16 → 9.75),
  proportional per-Lab funding with whole-dollar remainder to the lowest stable Lab id, $10k usable per seat, 4 seats/Lab.
- Proposed product choices left uncoded: exact R07 production/Set recipe (Future Ops R2); large-stage body (K4); R02.

**Tests (requirement-derived; each fails before its implementation).**
1. Catalogue: two entries, stable order, acyclic prerequisites, reachable physical targets (module blueprint on a Lab,
   stage installation, nullable Post); `knownTechnology` accepts both; one project per (studio, technology).
2. Module/bench law: lighting research refused in a Lab without an operational electrical/control module (and while its
   installation runs); sound and lighting active in one Lab on different benches within four seats total; the bench claim
   is released on pause/cancel and rechecked on resume; a seat on a Lab lacking the discipline module is refused.
3. Two Labs per project: seats on a second operational Lab accepted (S1's refusal retired), third Lab refused, four per
   Lab, one seat per person across projects; per-seat Lab identity on the wire of the receipt.
4. Cooperation arithmetic: equal full Labs at $80k → 9.75/week, 7 funded weeks, R&D 560,000; $40k over 8 seats → spend
   40,000 split 20,000/20,000 → 8.125/week; 4 + 2 seats at $60k → spend 60,000 split 40,000/20,000, output 6 + 0.625·3;
   remainder by stable Lab id for an odd split; fixed-point exactness at every receipt (no float drift).
5. Document 03 [780,832): two Labs with both modules operational at 780, eight people on 208-week contracts hired at
   780 — cooperate sound then light (knowledge 787 / 794, R&D 1,120,000), split (791 / 791, 880,000), residual light
   (52 units done) cooperate (787 / 789, 720,000) and split (791 / 782, 520,000); idle person-weeks as stated; payroll,
   employment overhead and Lab/instrument operating charges reconcile to the ledger by kind.
6. Expiry/rehire across Labs: a lapsed seat on the second Lab drops b only; the home Lab is unaffected.
7. Conservation, determinism, save/reload, campaign isolation and validator refusals for the new facts (forged per-Lab
   split, receipt naming a Lab without the module, third Lab, fifth seat on one Lab, units not matching `a + 0.625·b`).
8. V21→V22: every S1 fixture and the three legacy V20 fixtures migrate (×8 numerators, empty per-Lab rows for legacy
   receipts is NOT allowed — S1 receipts gain their single-Lab row from the seat's Lab); `migrateToV21` refuses V22.

**Allowance (plan):** 10 h capability, 3 h verification.

### S2 tasks

- [ ] **S2-T1 Catalogue + parameters:** test 1; `TECHNOLOGY_CATALOGUE` two entries; per-technology work/dates/costs read
      from the entry (retire hard-coded `SYNCHRONIZED_SOUND.*` reads in the scheduler/validator where the project's
      technology decides); new blueprints in `tuning.ts`.
- [ ] **S2-T2 Modules/benches:** test 2; `laboratoryRefusal` per discipline; bench claims in occupancy/presence.
- [ ] **S2-T3 Two-Lab seats:** test 3; command + validator bounds.
- [ ] **S2-T4 Cooperation scheduler + V22:** tests 4, 6, 7, 8; per-Lab allocation, exact fixed point, receipts, migration.
- [ ] **S2-T5 Document 03 fixtures:** test 5 through `src/harness/p13b/fixtures.ts` (generated two-Lab world at 780).
- [ ] **S2-T6 Bridge (text only):** per-Lab seat/contribution lines on the Laboratory page; second-brief assign rows.
- [ ] **S2-T7 Affected suites, records, commit, push.**

## S2 — original scope record (superseded by the expansion above; kept verbatim)

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
