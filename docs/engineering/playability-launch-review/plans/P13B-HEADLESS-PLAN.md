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
  **Resolved 2026-09-16 (OPS-P13B-R07-DISPOSITION-20260916-01 §4):** "exactly one restart" means one resumed instance of the same project, not a lifetime quota; repeated cancel → restart cycles are lawful (identities, work, spend and receipts retained; eligibility rechecked; no cloned work, refunded research or repeated entitlement). Not a product choice any more; S2-T8/S3 acceptance performs two cycles with save/reload.
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

- [x] **S1b-T1 Schema + generator (RED→GREEN; RED 8/8 at aa0ccce, GREEN 8/8; new schemaId `sha256:9ee4bcff04e06d47fa672f6091d3f9eac98c3a19829260fd9587ab22d06d55f6`):** bridge schema test asserts the new members and projection 33;
      `npm run generate:bridge-contract` + `generate:bridge-contract:fixtures`; manifest hash recorded here and in the backlog.
- [x] **S1b-T2 Page (`tests/bridge-p13b-s1b-seats.test.ts`, test-author; scenarios a–f + player-safe):** `bridge/laboratory.ts` fills the members from `occupiedSeats`/`project.weeks`/`researchWeekQuote`;
      `tests/bridge-p13b-s1b-seats.test.ts` proves seats by id (same-name pair), receipts order, and no private rival data.
- [x] **S1b-T3 Records (2026-09-16 ≈16:40):** backlog (C# binding change: `StudioLaboratoryPage` DTO + fixture regeneration + paired Unity adoption), progress row, commit, push.

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
  **Amended 2026-09-16:** the R07 recipe is ADOPTED by Current Ops (OPS-P13B-R07-DISPOSITION-20260916-01, adopting Future Ops `P13B-R07-PRODUCTION-CLARIFICATION.md` at `e529c10f`, blob `77cf8211`) as the bounded **S5-R07 consumer task** below; the large-stage body (K4), CAT-011 oversized Sets and companion A12 stay OPEN with their own owners; R02 unchanged.

**Tests (requirement-derived; each fails before its implementation).**
1. Catalogue: two entries, stable order, acyclic prerequisites, reachable physical targets (module blueprint on a Lab,
   stage installation, nullable Post); `knownTechnology` accepts both; one project per (studio, technology).
2. Module/bench law: lighting research refused in a Lab without an operational electrical/control module (and while its
   installation runs); sound and lighting active in one Lab on different benches within four seats total; the bench claim
   is released on pause/cancel and rechecked on resume. Seating itself does NOT require the module (retained P13A law,
   `tests/p13a-research-identity.test.ts`: seats may be assigned before instruments exist; the project stays paused);
   begin/resume/weekly eligibility do. Seat slots are numbered per Lab across ALL active projects (stable project-id
   order), so two technologies in one Lab never double-book a slot and the four-seat cap counts every project's seats.
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

**Corrections and additions (Current Ops R07 disposition, 2026-09-16 — `OPS-P13B-R07-DISPOSITION-20260916-01`, packet SHA256-verified; adopts Future Ops clarification §§2–6).**
- Residual comparison horizon is **[789,841)**: lawful prehistory eight funded four-person weeks (48 units, $320,000) plus one zero-ceiling week
  (4 units) = 52 verified at 789; residual knowledge sound/light **796/798** (cooperate then lighting) and **800/791** (split); within-horizon
  R&D **$720,000 / $520,000**, difference $200,000 preserved; prior signing and prehistory costs are sunk and never charged in that window.
  Full-project horizon stays [780,832); the Post-onset +$12,000 correction stays separate; the $209,000 / $253,000 all-in figures remain
  conditional paper results (S5 deployment assumptions), not runtime totals proved by S2. `tests/p13b-s2-doc03.test.ts` already asserts the
  corrected dates and spends (finding recorded at T5).
- **Material S2 finding — access identity (disposition §5):** `advanceResearchWeek`'s completion guard `access.some(a => a.studioId === p.studioId
  && a.acquiredWeek !== null)` and pending selector `access.findIndex(a => a.studioId === p.studioId)` omit `technologyId` (source-confirmed at
  877aad5; unchanged by T4–T6). Acquired access to one technology suppresses the other's grant and can remove an unrelated pending row. S2 is
  **not** labelled verified while this defect stands; the matched pass on 877aad5 keeps its applicability as evidence of everything else.
- **Repeated cancel/restart** is lawful (one resumed instance, no lifetime quota) — see the S1 note above.
- S5 must generalize `finishTechnologyWeek` and the shared adoption validation per technology (target identity, prototype accounting); lighting
  never satisfies synchronized-sound requirements and needs no Post; not S2's.

### S2 tasks

- [x] **S2-T1 Catalogue + parameters:** test 1; `TECHNOLOGY_CATALOGUE` two entries; per-technology work/dates/costs read
      from the entry (retire hard-coded `SYNCHRONIZED_SOUND.*` reads in the scheduler/validator where the project's
      technology decides); new blueprints in `tuning.ts`.
- [x] **S2-T2 Modules/benches:** test 2; `laboratoryRefusal` per discipline; bench claims in occupancy/presence.
- [x] **S2-T3 Two-Lab seats:** test 3; command + validator bounds.
- [x] **S2-T4 Cooperation scheduler + V22 (2026-09-16 ≈18:40, commit `5564542`):** tests 4, 6, 7, 8 GREEN (5/5, 3/3, 15/15, 12/12); per-Lab
      funding split (floor, remainder to the lowest stable Lab id), `units = 8·raw_a + 5·raw_b` over 1/160,000 with one code path shared by
      scheduler and validator, receipt `labs` rows, technology root v3 + `cooperationFromWeek`, frozen `validateTechnologyV2`, honest
      `liftTechnologyV2` (single-Lab receipts derive their one row; a two-Lab single-pool receipt lifts to `labs: null`, valid only before
      `cooperationFromWeek`), Save V22 + downgrade guards; three genuine V21 fixtures minted at the last V21 writer `e68de38` (`e24c860`).
      RED evidence: cooperation `evidence/p13b-s2-20260916/04-t4-red-confirm`; tests 5–8 at e24c860 before T4 `09` (35 failed | 12 passed of 47 —
      the 12 are determinism / isolation-by-construction / provenance checks that hold under either law). Law detail resolved in-contract:
      `cooperationFromWeek` bounded `[0, market.tick]`, decoupled from `recordingStartedWeek` so each forgery keeps its own refusal.
- [x] **S2-T5 Document 03 fixtures (delivered inside tests 5–8, same commit):** test 5 `tests/p13b-s2-doc03.test.ts` 17/17 through the
      existing `p13bTwoLabWorld()` plus the additive `p13bTwoLabWorldWithEarlyHire(earlyWeek)`. Test-author findings recorded in the file and
      here: (a) the residual fixture runs its lawful nine-week prehistory from 780 (lighting opens 780), every date = document + 9, every
      route-to-route difference unchanged (R&D deltas 240,000 full / 200,000 residual; idle person-weeks 304/328/344/364 exact); (b)
      `overhead` and `facilityOpex` are whole-studio ledger rows (`src/core/tick.ts`) and the generated world carries other staff and
      facilities, so 624,000 / 728,000 are proved as paper arithmetic against the real TUNING/blueprint constants plus a lower bound on the
      ledger, not as an isolated ledger sum; (c) test 6 case B: a lapsed seat on a still-active multi-seat project rehires under S1's
      existing law (no new seat row, no resume needed) — only a sole-seat lapse auto-pauses; the brief's wording was corrected to the tested
      law; (d) `weeklyResearchPayroll(state, pastWeek)` cannot answer once the expired contract row is gone — tests read the permanent
      `researchPayroll` ledger row instead (finding, not a defect); (e) no public action creates a rival research project, so isolation is
      proved by construction plus a structurally injected rival row (same technique as `p13b-s2-labs`).
- [x] **S2-T6 Bridge (projection 34; 2026-09-16 ≈19:40):** `StudioLaboratoryPage.projects[]` (`StudioLaboratoryProject` with per-project seats
      carrying `laboratoryFacilityId`, receipts with `labs` rows or honest `null`, weekly quote with per-Lab shares and `units`,
      `cooperationLabel`), assign rows `assign-<lab>-<person>-<technologyId>` with `technologyId` in the intent, per-project
      begin/resume/pause/cancel/budget rows with catalogue names, budget presets extended to 60,000 / 80,000 (gap found by the bridge test:
      no published row could fund a two-Lab project at its usable ceiling), top-level S1b members retained (superseded for the binding).
      schemaId `sha256:eeebeede…`, contract sha `9ef5d064…`, checks verified. Coordinator correction to its own T6 contract: the
      researchable-week gate on assign rows broke the retained P13A law (`bridge-p13-laboratory` seats at week 12 for sound, opening 260);
      the engine has no such gate (only `researchPrerequisiteRefusal` on begin/weekly), so the page now publishes every open brief, enabled as
      the engine's dry run decides, and dates the wait on the row ("Research opens <date>; the seat waits until then."). Test
      `tests/bridge-p13b-s2-labs.test.ts` 10/10 (RED baseline not capturable for this file — T6 landed mid-authoring; its earlier two failures
      were the author's regex formatting), `bridge-p13b-s1b-seats` 8/8 with real values for the new members, `bridge-p13-laboratory` 7/7 after
      the gate removal; projection pins moved 33 → 34 in eleven files. Evidence `10-t6-*`, `11-t6-*`, `12-*`, `13-*`.
- [x] **S2-T7 Affected suites, records, commit, push (closed 2026-09-16 ≈21:20 with T8):** matched full pass on `877aad5` (`evidence/p13b-s2-20260916/14-RUN`, `14-test-core-877aad5`
      core 227/234 files · 2716/2738 tests, 42.5 min; `15-test-bridge-877aad5` 54/57 · 560/573, 20.2 min; contract checks verified). Failing
      set = the inherited set (campaign-library 11 × 5/20 s budgets, campaign-isolation 60 s inline budget vs 72.1 s body, `p13a-scientist-
      foundation` 3 digests byte-identical to the pin, r3n1 ENOENT 6, scenery Pillow 1) **plus one pre-existing nondeterministic test**:
      `bridge-founding` "emits the exact founding action at Core coverage" asserts a fixed role sequence on a runtime created with a random seed
      (`BridgeSession.createRuntime()` defaults to `randomUUID()`), received 'actor' for 'director' once; 6/6 solo on the identical source and
      green in both earlier matched runs — disposition owed to the bridge test owner (seed it), not S2's. Closeout label withheld pending S2-T8.
- [x] **S2-T8 Access identity (disposition §5; RED `cfa6f71` 7 failed | 1 passed → GREEN `c8ef3b2` 8/8; negative cases `20-t8-access-identity-negative` 14/14 — four forged states refused with `completed research without its access grant`, purchase-row control accepted):** test-author adds `tests/p13b-s2-access-identity.test.ts` RED on the unchanged candidate (sound→
      lighting, lighting→sound, simultaneous completion order-independent, unrelated pending/completed access survives, save/reload and later
      ticks, idempotence, retained same-technology rules, exact provenance); sim-core fixes the shared identity to the exact `(studioId,
      technologyId)` pair and checks related consumers; targeted verification = S2/access/save/P13A boundary suites + the bridge Laboratory
      files; before/fix/after evidence; then the S2 closeout label and the records.

## S2 — original scope record (superseded by the expansion above; kept verbatim)

Add the second catalogue entry `lighting-control-01` (researchable 780, commercial 936, 64 units, P2,
electrical/control module blueprint $350k/5 weeks/+$2k weekly, provisional tuning), Lab module claims (one
active project per discipline bench per Lab), seats across two Labs per project, the unequal-team output
rule `a + 0.625·b` (equal full Labs → 9.75), proportional per-Lab funding with whole-dollar remainder by
stable Lab id, document 03 allocation fixtures reproduced through the real scheduler. Requires S1.
Allowance: 10 h capability, 3 h verification. Product choice recorded, not coded: the exact R07 demanding
lighting-setup production recipe (Current Ops named pre-execution clarification).

## S3 — Persistent physical plans, dependencies and admission (Ready row 3) — task expansion (amendment 2026-09-16)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §6 (queue policy: persistent ordered plans with exact
campaign/studio/target/project ids, dependencies, approved maximum debit, scope/components, earliest start, admission mode; default
**review changed quote**; a queued plan reserves nothing; cycles / missing targets / impossible prerequisites refuse admission; a cancelled
prerequisite blocks dependents and never counts as completion; reordering revalidates; Save As preserves plan/entity ids inside its own
independent authority; exact quote fingerprint/revision and at-most-once commit receipt survive retry; no global cache keyed only by entity
id), §5 row 3 + acceptance A4/A11, REF-F/REF-W/REF-B, and the weekly ordering "commit reviewed actions → admit queues in stable order while
decrementing the actual cash/resource envelope → accrue research/recurring → complete P09 work on arrival → capability → receipts; newly
completed research may enable a queue only at the next admission boundary, never spend twice within the prior tick" (all at
`673f49835404e262ea651b4fcb8fda5e259d80a6`). Precedent in this engine: the C2a-M4 production queue (`src/core/queueAdmission.ts`,
`actions.ts` `queueAdmitted`/`queueIntentExpired`): a queued intent is revalidated at dequeue, nothing is held while queued.

**Scope.** P09 physical work only: body placements (`quoteForBlueprint`/`commitPlacement`) and facility installations
(`queryFacilityInstallation`/`commitFacilityInstallation`) — Laboratory bodies, `acoustic-instruments`, `electrical-control-instruments`,
`synchronized-sound-stage`/`-post`, `lighting-control-stage`. Research projects are never queued (S1/S2 explicit-action law). Office
conversion routes are S4; component receipts/restoration are S5/S6. Plans are per studio and symmetric (rivals get the same root; S8 uses it).

**Delegated implementation decisions (recorded here, not Owner product choices).**
- New root `state.physicalPlans = {version: 1, nextPlanId, plans: PhysicalPlan[]}` in **Save V23** (V22→V23 adds the empty root; nothing
  invented; `migrateToV≤22` refuse V23; `validateSaveV22` frozen as the V21 pattern). Genuine V22 fixtures are minted at the last V22 writer
  BEFORE any S3 source change (S2 lesson).
- `PhysicalPlan = {id: '<studioId>:plan:<n>', studioId, ordinal, queuedWeek, work, dependsOn: string[], approvedMaximumDebit, earliestStartWeek,
  admission: 'reviewChangedQuote' | 'automatic', approvedQuote: PlanQuoteSnapshot, pendingQuote: PlanQuoteSnapshot | null, status: 'queued' |
  'held' | 'blocked' | 'started' | 'cancelled', statusWeek, reason: string | null, startedPlacementId: number | null, commitReceipt: {week,
  fingerprint, cost} | null}` with `work = {kind:'placement', blueprintId, origin: LotCell} | {kind:'installation', blueprintId, target:
  {facilityId} | {planId}}` (an installation on a queued body names the body's PLAN id; the facility id is resolved and recorded at start).
- `PlanQuoteSnapshot = {fingerprint, cost, buildWeeks, weeklyOperatingCost, components: {label, cost, weeks}[]}`; the **quote fingerprint** is a
  pure deterministic digest (existing core digest helper, no new dependency) over blueprint id, exact target, cost, buildWeeks,
  weeklyOperatingCost and the component list — the completion week is excluded (it moves every week and is not a scope or price change).
  Exported from `placement.ts` as the P09 quote fingerprint the Ready row names.
- Admission runs once per tick at the admission boundary: after the week's reviewed actions, BEFORE `advanceResearchWeek` and before P09
  completions of that tick, in stable (ordinal) order, against a running cash envelope decremented by every admitted commit. A plan is admitted
  when: status `queued`, `earliestStartWeek ≤ tick`, every `dependsOn` plan is `started` with an operational placement, the fresh P09 quote
  has no rejection, cost ≤ `approvedMaximumDebit`, cash covers it, and — `reviewChangedQuote`: fresh fingerprint equals `approvedQuote.fingerprint`;
  `automatic`: blueprint, target and component labels unchanged and cost ≤ ceiling. Admission calls the SAME P09 commit the front door uses
  (identical placement record and ledger row as a hand commit that week) and writes `commitReceipt` exactly once. A changed quote under
  `reviewChangedQuote`, or a quote above the ceiling / with a live rejection under either mode, sets `held` with `pendingQuote` and a reason;
  insufficient cash leaves the plan `queued` (retried next boundary; the reason is a derived view, not persisted). A cancelled predecessor sets
  each dependent `blocked` naming it. Nothing is reserved before start: a queued plan changes no cash, burn, capacity, engagement or slot.
- Actions: `queuePhysicalPlan {work, dependsOn, approvedMaximumDebit, earliestStartWeek?, admission?}` (refuses unknown blueprint/target/plan
  ids, self/cyclic dependencies, dependencies on cancelled/blocked plans, incompatible target capability, negative or non-integer ceiling;
  snapshots the current quote as `approvedQuote` — a quote with a live but changeable rejection, e.g. `targetEngaged`, is still queueable);
  `reorderPhysicalPlans {planIds}` (full permutation of the studio's non-terminal plans; refused if any plan would precede one it depends on);
  `cancelPhysicalPlan {planId}` (queued/held/blocked only; dependents → blocked); `reviewPhysicalPlan {planId, approvedMaximumDebit}` (held →
  queued with `pendingQuote` promoted to `approvedQuote`); `setPhysicalPlanAdmission {planId, admission}`. History rows (studio history, existing
  mechanism): planQueued / planStarted / planHeld / planBlocked / planCancelled with week and reason.
- Validator: ids monotonic under `nextPlanId`, ordinals unique per studio, `dependsOn` in-studio and acyclic, lawful statuses and weeks, started
  plans reference an existing placement with the same blueprint and resolved target, one plan per started placement, `commitReceipt` present
  exactly for started plans, fingerprints well-formed, campaign isolation (a plan never names another studio's target or plan).
- Bridge (projection 35, text only): `view: 'plans'` industry page (`StudioPlansPage`: rows with status, reason, approved vs pending quote,
  dependencies, ordinal; intents queue/cancel/review/reorder/setAdmission; a "Review changed plan" row shows the old and new quote side by
  side) and `queue-<row>` companions beside the Laboratory page's immediate `instruments-<lab>` row and the electrical module route; Back
  preserves order (read model only; no reservation). Player-safe.

**Tests (requirement-derived; each fails before its implementation).**
1. Admission law: a queued acoustic installation starts at the next boundary through the existing P09 commit — placement record, cost,
   completesWeek and ledger row identical to a hand commit that week; `commitReceipt` once; `earliestStartWeek` in the future waits; cost above
   the ceiling holds with a reason naming both numbers; `automatic` within the ceiling starts.
2. No reservation: a queued plan changes no cash, `weeklyBurn`, capacity or engagement; two plans on one target/plot — the second starts only
   when the first no longer engages the target; cancelling a queued plan leaves the state byte-identical except the plan row and history.
3. Dependencies: an installation on a queued body resolves the facility id at start and waits for the body to be operational; self/cyclic/unknown
   dependency refused at queue time; dependency on a cancelled plan refused; cancelling a predecessor blocks dependents with an explanation and
   never counts as completion; reorder placing a dependent before its dependency refused; lawful reorder persists ordinals.
4. Changed quote: identical quotes give identical fingerprints across weeks (completion week excluded); a persisted `approvedQuote` that no longer
   matches the live quote (fixture with a forged snapshot — the honest way to produce drift in a constant-tuning engine, recorded as such) holds
   under `reviewChangedQuote` and starts under `automatic` only when scope is unchanged and cost ≤ ceiling; `reviewPhysicalPlan` re-approves.
5. Ordering and envelope: two plans with cash for one — the first starts, the second stays queued with no partial debit; research accrual in the
   same tick sees the post-admission cash (its "insufficient cash" bottleneck fires when the admission consumed the margin); a dependency
   completing in week w enables its dependent at w+1's boundary, never within w.
6. Conservation, determinism, replay, history: admitted commits reconcile to the ledger exactly as hand commits; same actions → same bytes;
   history rows with weeks and reasons; rival symmetry (a rival studio's plan list is validated by the same law).
7. Save V23 + Save As: genuine V22 fixtures migrate with an empty root (byte-identical otherwise); `migrateToV22` refuses V23; save/reload
   mid-queue continues identically; a campaign-library Save As copy keeps the same plan ids and advances independently (A11).
8. Validator refusals: forged cycle, unknown dependency, ordinal collision, started plan without placement, duplicate commit receipt, a plan
   naming another studio's target, non-integer ceiling.
9. Bridge (projection 35): plans page rows and intents through the session, "Review changed plan" old-vs-new quote, `queue-` companions on the
   Laboratory page, stale-revision refusal, player-safe.

**Allowance (plan):** 8 h capability, 3 h verification.

### S3 tasks

- [x] **S3-T0 Genuine V22 fixtures (2026-09-16, `e27f4af`):** `legacy-v22-staffed-4-seats-263`, `legacy-v22-two-labs-cooperating-782` minted at the
      final V22 writer (`d597e94`, engine `c8ef3b2`); provenance with sha256 beside them.
- [x] **S3 tests 1–8 RED (test-author, 2026-09-16 ≈22:30):** `tests/p13b-s3-admission|dependencies|save-v23|validation.test.ts` +
      `tests/bridge-p13b-s3-save-as.test.ts`, harness `src/harness/p13b/s3-fixtures.ts`; RED for one cause each (`evidence/p13b-s3-20260916/21-red-*`:
      four at module resolution of `src/core/physicalPlans.js`, the bridge one at `applyActions: unknown action kind queuePhysicalPlan`).
      Methodological finding recorded: vite binds a MISSING named export from an EXISTING module to `undefined` instead of failing the import, so a
      RED-first file must import from a not-yet-existing module (or call the missing binding) — the validation file's first run had one spurious
      pass from an unrelated "unknown field" message matching `/unknown/`; fixed before reporting. Contract gaps resolved as delegated decisions
      (in the sim-core brief): types in `src/core/types.ts`; `target:{planId}` implies the dependency (normalized into `dependsOn`); queue-time
      cycle refusal covers self-edges and unknown ids, the validator defends forged cycles; reasons use `money()`; cancel blocks dependents
      synchronously; admission is tick step 1.06 after the production-queue admission (1.05) and stamps the ARRIVED week (`currentTick + 1`)
      exactly as that precedent; `physicalPlans` is threaded through the exact-key validator chain as `technology` was.
- [x] **S3-T1/T2/T3 engine increment (sim-core, 2026-09-16 ≈23:10; committed ≈23:30 with the five S3 files 54/54 after the test amendments, `23-amended-*`, coordinator fresh run `25-*`):** `src/core/physicalPlans.ts`
      (root, quote snapshots, admission view, admission, validator, five action handlers), fingerprints in `placement.ts` (FNV-1a-64 over canonical
      JSON, no dependency), tick step 1.06 after the production-queue admission with the arrived-week stamp, history rows (five kinds, not on the
      wire until T4), Save V23 (`SaveFileV23`, `validateSaveV23`, `convertV22ToV23`, `migrateToV23`, ten downgrade guards, "1 through 23"),
      consumers to V23, live-version sweep 22 → 23 (57 test/ui files + 4 consumers; sentinel 24), `physicalPlans` threaded through the exact-key
      chain as `technology` was. Results: validation 12/12, save-v23 13/13, dependencies 11/11, admission 13/17, save-as 0/1 → the five failures
      adjudicated as test premises (`22-engine-conflict-probes`): a fixture's pre-existing capex row; the second plan on one target starts the
      boundary AFTER the first completes (admission before completions, plan law); direct `studio.cash` edits break the ledger invariant and the
      electrical module cannot target a Lab with active research; the Save As test ignored a refused `load` (`requireClean`); a baseline
      `statusWeek` ahead of its world. Test-author amends its own files (evidence `23-amended-*`); the engine law stands.
      **Delegated decisions resolved by sim-core (recorded, accepted):** no persisted `resolvedTargetFacilityId` (derived helper, 16-key row);
      `earliestStartWeek` strict against the arrived week (= the plan's `≤ currentTick`); held plans are re-evaluated every boundary and start
      without review only when the live quote again equals the approved quote and every condition holds (only reading under which a
      `targetEngaged` hold can ever clear); admission is player-only until S8 supplies rival physical-commit authority (rival rows validated by the
      same law); campaign isolation enforced at the plan identity (no per-studio facility root exists to check a target against — limitation);
      `migrateToV23` accepts a parsed envelope. **Coordinator correction:** sim-core had loosened `statusWeek`/`commitReceipt.week` to `≤ tick + 1`
      to accept the unlawful baseline; reverted to `≤ tick` (the validator runs at the save boundary, where the arrived-week stamp is `≤ tick`).
      Sweeps (`22-engine-*`): S2 87/87, S1 + bridge-P13B 52/52, P13A 62/65 (+3 inherited digests), bridge-P13 16/16, campaign-isolation solo 72.3 s,
      save sweep 78 + 180 + 83 + 109, placement/queue 153/153, owners 66/66, corpus/frozen 115/115 (M0A corpus byte-identical), bridge checkpoint
      91/91, projections 32/32, contract checks verified, consumer lock 77/77; coordinator recheck (`24-*`): S2 + save boundary 90/90, tsc root/ui clean.
- [x] **S3-T4 Bridge projection 35 (2026-09-17 ≈00:10):** `view: 'plans'` (request and response), `StudioPlansPage`/`StudioPlanRow`/`StudioPlanQuote`/
      `StudioPlanQuoteComponent`/`StudioPlanNext`/`StudioPlanCommitReceipt`, plan actions (`plan-cancel|review|admission|move-up|move-down-<planId>`),
      Laboratory `plan-queue-acoustic|electrical-<lab>` companions with a visibility rule (hidden once that module has a committed placement on
      the Lab in any status or a queued/held/started plan already targets it — coordinator addition after the bridge test's case 2), five
      history kinds on the wire, intent kind `physicalPlanAction` (honest wire kind; `researchAction` precedent). schemaId `sha256:889c83c6…`,
      contract sha `4ea3b9d0…`, checks verified. `tests/bridge-p13b-s3-plans.test.ts` RED 11/11 at 30836b0 (`28`) → 11/11 (`26-t4-*`, coordinator
      fresh `29`: plans + laboratory + s2-labs 28/28, tsc bridge/root clean); pins moved 34 → 35 in thirteen files; `bridge-p13-laboratory` case 1
      widened its page size by exactly the two new rows. Body-placement queueing has no bridge affordance yet (needs the lot/placement quote
      surface; recorded as future work, not S3's).
- [x] **S3-T5 Matched pass, records, commit, push (2026-09-17 ≈01:15):** matched full pass on `c18abe8` (`evidence/p13b-s3-20260916/30-RUN`,
      `30-test-core-c18abe8`: core 229/241 files · 2765/2805 tests, 32.8 min; `31-test-bridge-c18abe8`: 57/59 · 573/585, 19.9 min; contract checks
      verified). Failing set = the inherited set (campaign-library 11 × 5/20 s budgets, campaign-isolation 60 s inline budget, `p13a-scientist-
      foundation` 3 digests byte-identical to the pin, r3n1 ENOENT 6, scenery Pillow 1; `bridge-founding` green this time — random seed) **plus
      one S3-caused harness failure**: five `roster-wall-*` files (18 tests + 1 file-level) failed "SaveFileV18 replay changed entry state" because
      `historicalHashState` (the V18 observatory's hash projection) strips the `hollywood`/`technology` roots that later versions add but had not
      been taught the new `physicalPlans` root. Harness fix (guard + strip, mirroring the technology guard) on top of c18abe8; targeted rerun on
      the fixed source `32-*`: roster-wall 5 files 36/36, root tsc clean (S1 precedent: post-pass edits reverified by their affected suites). No
      engine law changed after the pass. Backlog S3 entry written; S3 row closed.

## S3 — original scope record (superseded by the expansion above; kept verbatim)

## S3 — Persistent queues/dependencies/admission (Ready row 3) — scope record

Ordered plans with exact ids, dependency graph, approved maximum debit, admission mode default "review
changed quote", no reservation before start, cycle/unknown/impossible refusals, cancelled-predecessor
blocking, save/reload and Save As independence. Requires S1 and the P09 quote fingerprint. Allowance: 8 h
capability, 3 h verification.

## S4 — Direct gap-aware Office conversion (Ready row 4) — task expansion (amendment 2026-09-17)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §6 (Office scope follows catalogue §8 without charging obsolete II
as a hidden component; one body has independent work capacity and development standard; I→II $500k/4 w, II→III $850k/8 w, I→III $1.25m/16 w
as candidate O1; placed body retains its baseline Opex while offline; standard increments $2.5k at II / $4k at III only while operational; old
separately purchased II/III bodies remain real with their charges and zero extra capacity; highest operational standard is the producer rule,
not a cumulative bonus; already assessed scripts do not change; ENG-2: new-III-without-II prerequisite removal and the 4/8/16 durations still
require disposition; the Hall extension stays a separate real body; a true in-place extension is unimplemented and must be labelled
unavailable), §5 row 4 + acceptance **A5** (never-owned-II I→III, II→III, new III, old purchased bodies, only high-standard body offline: no
obsolete charge, direct 16 vs 8 weeks, no invented capacity, plot/downtime disclosed, no historical screenplay change), D4, REF-F/REF-N;
`03-PAPER-ECONOMICS.md` "Office gap conversion, 52-week matched horizon" (direct $1,250,000 + 36×$4,000 + baseline $286,000 = $1,680,000;
staged $1,350,000 + 40×$4,000 + $286,000 = $1,796,000; new III on another plot $1,200,000 + $160,000 + old $286,000 = $1,646,000; direct
saves $116,000 and delays III four weeks). All at `673f49835404e262ea651b4fcb8fda5e259d80a6`.

**Engine today.** `development-office-2` ($600k/8 w/$2.5k, `maxInstances: 1`) and `development-office-3` ($1.2m/12 w/$4k, requires II
owned, `maxInstances: 1`) are effect-only bodies (`capacity: 0`); the founding `development-casting-office` ($1.5m/14 w/$5.5k, capacity 2)
is a real work body; `facilityEffects.ts` picks the highest OPERATIONAL tier (`developmentOfficeEstUplift`, `officeTierAtMint` audit trail on
minted screenplays). No conversion exists.

**Scope.** In-place conversion of an existing development body's STANDARD through P09's installation arm ("office source-target work",
REF-F): the body keeps its identity, plot, footprint, capacity and baseline Opex; the conversion is a P09 installation on that body that takes
the body OFFLINE for its build (downtime), charges the standard increment only once operational, and makes the body count in the
highest-operational-standard ladder. Nothing else in the estate changes.

**Delegated implementation decisions (recorded, not Owner product choices).**
- Two installation blueprints in `tuning.ts`, target capability `development-casting`, no cells: `office-conversion-ii` ($500,000 / 4 weeks /
  +$2,500 weekly; requires the target body's current standard to be I) and `office-conversion-iii` (source-dependent quote: from I $1,250,000 /
  16 weeks, from II $850,000 / 8 weeks; +$4,000 weekly; requires standard I or II). Candidate O1 tuning, flagged not Owner-approved.
- **Standard is derived, not persisted:** `developmentStandard(state, facilityId): 'I'|'II'|'III'` = III if an operational
  `office-conversion-iii` targets the body, II if an operational `office-conversion-ii` does, else the body's own tier (standalone II/III
  bodies are II/III; the founding office and annex are I). `highestOperationalDevelopmentStandard(state)` replaces the two
  `hasOperationalBlueprint` reads in `facilityEffects.ts` (standalone bodies still count; nothing stacks); `officeTierAtMint` keeps its
  vocabulary (`'development-office-3'` for III, `'development-office-2'` for II) so historical screenplays and their audit trail are unchanged.
  No new save fields ⇒ **Save V23 stays** (new blueprint ids only; the placement-core order pin moves 15 → 17). If any persisted fact turns out
  to be needed, mint V23 fixtures first (S<n>-T0 rule) and allocate V24 — never reuse.
- **Offline while converting (new P09 fact, blueprint-declared `takesTargetOffline: true`):** while a conversion placement on the body is under
  construction, the body's slots are removed from the allocatable capacity (its `StudioFacility.capacity` contributes 0 to the operations
  registry; work already occupying the body is not evicted — a conversion is refused while any slot is occupied, exactly as `targetEngaged`
  refuses today), its effect does not count in the standard ladder ("taking the sole high-standard provider offline" — the quote discloses
  `standardDuringWork`), its baseline Opex continues (weeklyPlacementOperatingCost unchanged), and the conversion's own weekly cost starts at
  completion (existing first-charge-on-next-advance law). Lab modules keep their existing online behaviour (`takesTargetOffline` false).
- Quotes never include an obsolete II purchase (`components` list the conversion only); a never-owned-II studio quotes I→III directly;
  standalone new III keeps its `requires: development-office-2` (ENG-2 removal is an OPEN product choice — not coded; refusal unchanged);
  Hall unchanged; "in-place extension" is not offered anywhere (no fake quote).
- Commands: no new action kind — conversions go through the existing installation quote/commit pair (`queryFacilityInstallation` /
  `commitFacilityInstallation`) and through S3 plans (`work: {kind:'installation', blueprintId:'office-conversion-iii', target:{facilityId}}`),
  including chained I→II→III plans with `dependsOn`. Cancellation/restoration of a running conversion is S6 (Option B), not S4.
- Bridge (projection 36, text only): conversion quote rows on the surface that publishes a building's installation decisions (the Laboratory
  page publishes `instruments-<lab>`; the T-bridge brief first locates the equivalent surface for an office body — if none exists, add
  `view: 'office'` mirroring the Laboratory page: `convert-<placementId>-ii|iii` rows with cost, weeks, downtime, `standardDuringWork` and
  `standardAfter`, plus `plan-queue-convert-<placementId>-ii|iii` companions; a read member `developmentStandard` and `offline` on the body's
  row; player-safe).

**Tests (requirement-derived; each fails before its implementation).**
1. Quotes: I→II $500,000/4 w; I→III $1,250,000/16 w on a never-owned-II studio with components naming the conversion only; II→III
   $850,000/8 w on a converted-II body; staged sum $1,350,000 vs direct $1,250,000; refusals: target not a development body (`incompatibleTarget`),
   standard already at/above (`alreadyInstalled`-class refusal named for conversions), occupied slots (`targetEngaged`), insufficient funds;
   standalone III still refused without II (unchanged wording).
2. Downtime and money (document 03, 52-week horizon through the real ledger): direct I→III — 16 weeks offline (capacity 0 for the body, a
   script/casting request that needs the slot waits in the production queue and resumes after completion), baseline $5,500 continues every
   week, no increment until operational, then $4,000 × 36 = $144,000; total $1,680,000; staged I→II→III $1,796,000 with no interim II
   operation when the second conversion is committed at the first's completion; new III on another plot $1,646,000 with no old-office downtime.
3. Standard law: highest operational standard wins and nothing stacks (converted III + purchased II → III; both charged); old purchased bodies
   keep charges and zero capacity; converting the sole II-standard body to III drops the ladder to I during the work and the quote says so;
   screenplays minted before, during and after keep their `officeTierAtMint` and estimated strength (no retroactive change).
4. P09/S3 integration: the conversion is a normal placement record (fingerprint, commit, completion, `constructionCapex` row, facility history);
   S3 plans queue a conversion, hold it on `targetEngaged` while a slot is occupied, and admit it at the next boundary once free; chained I→II
   then II→III plans via `dependsOn`; occupancy/presence unchanged (no cells).
5. Conservation, determinism, save/reload (V23 unchanged: a save mid-conversion reloads and completes identically), validator refusals for
   forged conversion facts (a conversion on a non-office body; two operational conversions of the same standard on one body; a conversion whose
   target has no body), campaign isolation.
6. Bridge (projection 36): conversion rows with the disclosed downtime and standards, plan companions, `developmentStandard`/`offline` members,
   stale-revision refusal, player-safe.

**Allowance (plan):** 6 h capability, 2 h verification.

### S4 tasks

- [x] **S4-T0 (confirmed 2026-09-17 ≈01:20):** no persisted fact is added by the contract (standard and offline state are derived from ordinary placement records; the two conversion blueprints are installation blueprints), so Save V23 stays and no fixtures are minted. If sim-core finds a persisted fact unavoidable it must stop, mint V23 fixtures at `731b2d5` first, and allocate V24. Test-author dispatched for tests 1–5 RED (`evidence/p13b-s4-20260917/00-red-*`).
- [~] **S4 tests 1–5 RED (test-author, 2026-09-17 ≈01:45, `066ae6d`; `evidence/p13b-s4-20260917/00-red-*`):** all four files fail at module resolution of
      `src/core/officeConversion.js`; harness `src/harness/p13b/s4-fixtures.ts` (`s4BareOfficeStudio`: a bare-lot studio with a genuinely PLACED
      `development-casting-office`, because the endowed founding office is a property structure that pays no weekly opex — companion §6's "no
      invented base placement charge"; document 03's $5,500 baseline is therefore reachable only on a placed office). Adjudicated gaps (delegated
      decisions, in the sim-core brief): (a) standard increments are charged only while the body is online and only for its CURRENT standard, so
      the staged route lands exactly $1,796,000 (no II increment during the II→III work, none after III supersedes it); (b) document 03's standalone
      "new III on another plot" $1,646,000 presumes ENG-2 (new III without owning II), an OPEN product choice the plan does not code — the lawful
      engine route needs an operational II whose $2,500/week is real, so the test asserts $1,776,000 with the +$130,000 delta named as the ENG-2
      consequence; (c) `office-conversion-iii` carries one constant component label with source-dependent cost/weeks, so a chained I→II→III plan
      admits under `automatic` within its ceiling and holds under `reviewChangedQuote` for review; (d) refusal member `standardAlreadyMet`.
- [x] **S4-T1/T2 engine increment (sim-core, 2026-09-17 ≈02:15, commit `dba78d0`):** `src/core/officeConversion.ts` (derived standard, offline,
      `conversionQuote`), the two conversion blueprints (O1-candidate constants, constant component label, `takesTargetOffline`), source-dependent
      quotes in `queryFacilityInstallation`, `standardAlreadyMet`, offline registry capacity, increment law (only while online, only the current
      standard — a superseded II charges nothing), conversion validator invariants, historical reconciliation; Save V23 unchanged. Results:
      quotes 8/9, downtime 7/7, plans 3/4, validation 7/7 — document 03's direct $1,680,000 and staged $1,796,000 exact through the ledger; the two
      reds are fixture premises (an origin finder that only returns lawful placements; a base world with no player studio id) proved in
      `02-engine-conflict-probes` and returned to the test-author. Coordinator addition: `standardAlreadyMet` joined the plans module's queue-time
      permanent refusals (S3 plan files 40/40 after, `04`). Sweeps `02-engine-*`: placement 84/84, facility/construction 83/83, S3 53/53, P09/queue
      46/46, screenplay office tier 24/24, save boundary 68/68, d12 29/29, operations/calendar 45/45, catalogue/P13A 76/76 + 16/16, bridge 18/18,
      corpus/replay 50/50, campaign-isolation solo 79.0 s (inherited budget), P13A 3 inherited digests, contract checks verified, tsc clean.
      Recorded law generalizations: conversion spans/capex pairs must be authored pairs; registry capacity 0 allowed only for offline bodies;
      `checkOperationsContext` floor `>= 0` only under the placement-aware policy (frozen projections unchanged). Rivals have no P09 lot, so no
      rival conversion exists until S8.
      **Fixture fixes landed `95a6811` (28/28).** **Gap found by the test-author (2026-09-17 ≈02:40), open:** an offline body has registry capacity 0,
      and `occupancy.ts`'s installation claims iterate `0..capacity`, so a RUNNING conversion no longer engages its own body — a second conversion
      on the same body is not refused `targetEngaged` (both admitted in one tick). Law: a `takesTargetOffline` installation under construction
      engages its body for its whole span independent of capacity. RED cases pinned at `0b836a8` (`07-red-engagement-*`: quotes 9/10 — a live II quote on the converting body returned `ok:true`; plans 5/6 — the second plan `started` in the same tick), fixed in `src/core/occupancy.ts` (one body-level claim for an under-construction `takesTargetOffline` installation, keyed on the blueprint flag not on capacity; `facilityEngagements` folds it into the one named engagement; `08-engagement-fix-*` 222/222 across S4 30/30, S3 + placement 64/64, claim consumers 44/44, presence + demolish 51/51, c2a-m4 33/33, tsc clean; coordinator fresh `09` 26/26).
- [~] **S4-T3 findings (test-author, `tests/bridge-p13b-s4-office.test.ts` 7/9 against the in-flight page; ≈03:10):** (A) the running conversion's own
      row read `alreadyInstalled` where the contract said `targetEngaged` — adjudicated: the row carries the ENGINE's primary rejection
      (`rejections[0]`) plus a new full `rejections` list; the contract was over-specified. (B) plan-companion hiding was scoped to one blueprint —
      adjudicated to a reachable-standard rule: hide a companion whose own blueprint is committed/planned on the body OR whose target standard is
      ≤ max(current standard, every committed-in-any-status conversion's and every queued/held/started plan's target) — ii hidden while iii runs,
      iii still offered while ii runs (chaining is lawful). (C) immediate `office-convert-*` rows publish the honest intent kind `installationAction`
      (the Laboratory instruments row keeps `researchAction`: its engine action is a TechnologyAction). Additions sent to sim-core; test amendments
      to the test-author; RED baseline for test 6 captured from the pre-T3 commit `c2d27d1` after the amendments.
- [x] **S4-T3 Bridge projection 36 (2026-09-17 ≈03:40):** `bridge/office.ts` (new), `view: 'office'` on request and response keyed by facility id,
      `StudioOfficePage` (nullable `blueprintId` — the endowed founding office is a property structure, publishing a purchased blueprint there would
      claim a building never bought; `offlineUntilWeek` nullable; live registry `capacity`), `StudioOfficeConversionRow` (both rows always
      published; `rejections` = the engine's list, `refusal` = its primary with one presentation rule: a COMPLETED record's own row yields to
      `standardAlreadyMet`, a running one keeps `alreadyInstalled` — finding D), rows `office-convert-<facilityId>-ii|iii` (intent kind
      `installationAction`, bridge-local descriptor composed of P09's own quote/commit, refusal raised not swallowed) and
      `plan-queue-office-convert-*` under the reachable-standard visibility rule; schemaId `sha256:c2247716…`, contract sha `e0d44f46…`, checks
      verified; pins 35 → 36 in fourteen files. Test 6 RED 11/11 at `c2d27d1` (`10`) → 11/11 (`05-t3-bridge-s4-office`, `06-t3-*`; coordinator
      fresh `11`: office + s3-plans + laboratory 29/29, tsc bridge/root clean, contract checks verified). Sweeps `05-t3-*`: generator/lock 108/108,
      bridge 18/18, P13 group 16/16, P13B S1/S2/S3 20/20, p10a/p11/owner-ux/r3n4/operations/history 85/85, core S3 + S4 83/83, campaign-isolation
      solo 70–74 s bodies (inherited 60 s budget; the office rows cost ≈0.1 s of it). Unproven: the `conversionStandards` fallback for an
      effect-only standalone II/III body (no registry row) — disclosed via `available:false` + the engine refusal.
- [x] **S4-T4 Matched pass on `8334a3f` (2026-09-17 01:39→02:38 UTC; `evidence/p13b-s4-20260917/12-RUN`, `12-test-core-8334a3f`, `13-test-bridge-8334a3f`, attribution `14`):** core 239/246 files · 2836/2858 tests, bridge 58/60 · 585/596, both contract checks OK; failing set = inherited only (campaign-library 11 core / 10 bridge, r3n1 ENOENT 6, campaign-isolation 1, scientist-foundation 3 digests, scenery Pillow 1); `bridge-founding` green this run; every S3/S4 file passed → **S4 LOGIC VERIFIED · UNITY NOT VERIFIED** (S4 only; not P13B completion, not Owner acceptance). Backlog entry landed at `c004b73`.

## S4 — original scope record (superseded by the expansion above; kept verbatim)

## S4 — Direct gap-aware conversion/purchase (Ready row 4) — scope record

Office I→III direct ($1.25m/16 weeks), II→III ($850k/8), I→II ($500k/4) as candidate O1 tuning; new III
without II prerequisite is a proposed product choice for disposition and is not coded until disposed;
retained body Opex, standard increments only while operational, existing assessments unchanged.
Allowance: 6 h capability, 2 h verification.

## S5 — Component inventor pricing and prototypes per technology (Ready row 7) — task expansion (amendment 2026-09-17)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §6 (P13 provenance decomposes access, equipment, site
adaptation, installation, compatible capture and Post; the first prototype covers one actual equipment set, no access charge waived twice, no
negative line; later inventor equipment at the existing 25 % concession — sound $225k, lighting $150k; physical work receives no inventor
discount; an existing sound Post is charged only if actually absent and later stages reuse compatible operational Post; entitlement scoped by
campaign, studio, technology and project; an actual retained equipment asset can be reused, never spawned repeatedly), §5 row 7 + acceptance
**A8** (first and subsequent inventor installations for sound and light, commercial direct buy, cancellation/reuse: components charged once,
no negative quote, existing compatible Post not rebilled), the §4 physical-deployment row (sound: first inventor $975k, later +$225k,
commercial access $200k + equipment $300k + physical $975k; lighting: access $100k commercial / $0 inventor; equipment $200k commercial / $0
first prototype / $150k later inventor; site $50k/2 w then install $50k/2 w; +$1k weekly at operation), REF-F/REF-W, and the R07 disposition
§5's S5 instruction (generalize `finishTechnologyWeek` and the shared adoption validation per technology — target identity and prototype
accounting together; never make Post optional everywhere or let a lighting adoption satisfy synchronized-sound requirements). `03-PAPER-
ECONOMICS.md` cancellation traces (A7) are S6's acceptance and are only PERSISTED-FOR here (component quantity/progress/cost).

**Engine today.** `adoptSynchronizedSound {stageFacilityId, postFacilityId}` (sound only): equipment = $0 first prototype / $225k later inventor /
$300k commercial, plus the stage and Post P09 installation quotes; `TechnologyAdoption {equipmentCost, installationCost, physicalProjectIds,
prototypeProjectId}`; `finishTechnologyWeek` marks the player's adoption operational when the sound stage AND Post installations are
operational (rival: `committedWeek + deploymentWeeks`); the validator reconciles `installationCost` to the placements' capex and hard-codes the
rival purchase at 300,000 / 975,000; `considerRivalSoundPurchase` is sound-only (S8 owns rival capacity). The catalogue already carries every
per-technology price and `lighting-control-stage` already lists its two physical components.

**Scope.** Per-technology adoption with explicit component provenance and durable equipment ownership: `adoptTechnology` for both briefs
(`adoptSynchronizedSound` stays as the lawful sound alias), component rows on every adoption, equipment assets that are minted once and
reused rather than re-credited, the per-technology operational law and operating charges, Save V24, and the wire. Cancellation, refunds and
restoration are S6 (this slice persists what S6 needs); rival lighting purchase/research is S8; the production consumer of lighting is S5-R07
(named below, after this chain lands).

**Delegated implementation decisions (recorded, not Owner product choices).**
- `TechnologyAction` gains `{kind:'adoptTechnology', technologyId, stageFacilityId, postFacilityId?: string}`; `adoptSynchronizedSound` is kept
  and means `adoptTechnology` for sound (P13A intents and tests stay lawful). Lighting refuses a `postFacilityId` (no Post component); sound
  requires one unless an operational sound Post already exists in the studio (then the component is `existing`, cost 0, no new installation).
- `TechnologyAdoption` gains `components: TechnologyAdoptionComponent[]` = `{kind: 'access'|'equipment'|'site'|'installation'|'capture'|'post',
  label, cost, weeks: number|null, source: 'commercial'|'first-prototype'|'later-inventor'|'existing'|'physical', placementId: number|null,
  equipmentAssetId: string|null}` and `equipmentAssetId: string|null`; the physical rows mirror the P09 blueprint's `installationComponents`
  one-to-one (lighting: site $50k/2 w + installation $50k/2 w; sound stage/Post: their authored components) so S6 can refund unused work per
  component from the placement's progress; `installationCost` = Σ physical rows, `equipmentCost` = the equipment row — both retained.
- Technology root v4 gains `equipment: TechnologyEquipmentAsset[]` = `{id: '<studioId>:equipment:<n>', studioId, technologyId, acquiredWeek,
  source: 'first-prototype'|'later-inventor'|'commercial', cost, holderAdoptionId: string|null}` with `nextEquipmentId`. An adoption's equipment
  row either mints a new asset (cost by route: first prototype $0 exactly once per (studio, technology, research project) — the entitlement —
  later inventor at the catalogue concession, commercial at the catalogue price) or reuses an UNHELD retained asset of that technology
  (`source: 'existing'`, cost 0). Assets are never deleted; S6 detaches the holder on cancellation. No negative line anywhere.
- Access: the commercial route's `accessCost` is charged once at `purchaseTechnology` (existing access row) and appears on the adoption as an
  `access` component with `source: 'existing'`, cost 0 (never charged twice); the inventor route's access row carries $0.
- Operational law (`finishTechnologyWeek`, per technology): the player's adoption is operational when every `physical` component's placement is
  operational and every `existing` component's facility is operational; rival: `committedWeek + deploymentWeeks` as today. Operating charges
  come from the installed blueprints' own weekly costs as today (lighting +$1,000 from the stage fit-out's completion; sound Post/stage as
  delivered). A lighting adoption never satisfies a sound requirement and vice versa (`technologyProduction.ts` keeps its sound-only method).
- Validator (live v4): components sum to the retained totals, exactly one equipment component per adoption, at most one first-prototype asset
  per (studio, technology, research project), an asset held by at most one adoption, every `physical` row names a placement of the entry's
  installation blueprint on the adoption's stage/Post, every `existing` row names an operational facility, no negative cost, no access charge
  on an inventor adoption, an adoption only with acquired access to that technology; the rival hard-coded 300,000/975,000 becomes the
  catalogue's values per technology (no behaviour change for sound). Frozen `validateTechnologyV3` + `liftTechnologyV3` for genuine V23 saves.
- **Save V24** (`SaveFileV24`, `validateSaveV24`, `convertV23ToV24`, `migrateToV24`, `makeSave` → 24, downgrade guards, "1 through 24"):
  the lift derives components honestly from the retained facts — equipment row from `equipmentCost` (`first-prototype` when
  `prototypeProjectId` is set and the cost is 0, `later-inventor`/`commercial` by route and price), one aggregated `installation` physical row
  per `physicalProjectIds` entry with the placement's own capex, an `access` row from the access record, and one minted asset per adoption
  (held) — nothing invented, byte-identical otherwise. **S5-T0 mints genuine V23 fixtures at the final V23 writer BEFORE any S5 source change**
  (incl. a state with an operational inventor sound adoption and a completed lighting project).
- Bridge (projection 37, text only): Laboratory page `adopt-` rows generalized per technology (`adopt-<technologyId>-<stageFacilityId>[-<postFacilityId>]`,
  intent `adoptTechnology`), a `StudioAdoptionQuote` per row (component list with kind/label/cost/source, total, the reuse of an existing Post
  or asset named, plus the S4 disclosure pattern: `rejections` = the engine's full refusal list and `refusal` = the engine-primary refusal,
  null when the row is actionable), `plan-queue-adopt-<technologyId>-<stageFacilityId>` companions beside each immediate row (S3/S4 precedent:
  the stage-installation blueprint queued through `queuePhysicalPlan`; visible under the same reachable rule as S4's companions; a queued
  plan never mints the adoption — the adoption is committed by the immediate row only, recorded as a delegated decision), and
  `adoptions: StudioAdoptionRow[]` on the page (technology, route, committedWeek, operationalWeek, components, equipmentAssetId); player-safe.
- Type change stated explicitly (audit note 4): `TechnologyAdoption.postFacilityId` becomes `string | null` (null for lighting rows; a sound
  row keeps its string, including when an existing operational Post is reused).

**Tests (requirement-derived; each fails before its implementation).**
1. Quotes and components per route: first inventor sound (access $0, equipment $0 first prototype, physical $975k = stage + Post components);
   second inventor sound installation on another stage while the first holds its asset (equipment $225k later inventor, existing operational
   Post reused at $0, stage physical only); commercial sound (access $200k charged once at purchase, equipment $300k, physical $975k); lighting
   inventor first (access $0, equipment $0, site $50k/2 w + install $50k/2 w), lighting later inventor ($150k + $100k), lighting commercial at
   936 ($100k + $200k + $100k); a lighting adoption with a `postFacilityId` refused; no negative line; the first-prototype entitlement fires
   exactly once per (studio, technology, project) and never for a different technology's project.
2. Operational law and charges: lighting operational at stage fit-out completion (+4 weeks) with +$1,000/week from then, no Post; sound needs
   stage + Post (or an existing operational Post); an existing Post is not re-billed and not re-installed; `technologyProduction` still locks
   sound only; charges reconcile to the ledger weekly.
3. Equipment assets: minted once per adoption, held by it, never duplicated; an unheld retained asset (structural fixture for S6's future
   detachment) is reused at $0 by a new adoption of the same technology and never by another technology; a held asset cannot be reused.
4. Save V24: genuine V23 fixtures (T0) and the V20/V21/V22 chains migrate with honest components and one held asset per adoption, byte-identical
   otherwise; `migrateToV≤23` refuse V24; save/reload mid-deployment continues identically; unknown 25 refused.
5. Validator refusals: forged component sums, a second first-prototype asset for one project, a negative component, an asset held by two
   adoptions, an adoption without acquired access, an `existing` Post row naming a non-operational facility, a lighting adoption with a Post row.
6. Conservation, determinism, campaign isolation (rival adoption rows untouched by player actions; the rival purchase reconciles per technology).
7. Bridge (projection 37): per-technology adopt rows with component quotes, `rejections`/`refusal` disclosure per row, `plan-queue-adopt-*`
   companions under the reachable rule (queueing never mints the adoption), adoption rows, stale revision, player-safe.

**Allowance (plan):** 6 h capability, 2 h verification (+ S5-R07 separately, ≈4 h + 2 h, expanded before it begins).

### S5 tasks

- [x] **S5-T0 Genuine V23 fixtures (2026-09-17 ≈04:40)** minted by `src/harness/p13b/legacy-v23-fixtures.ts` at `9a3e2da` (engine unchanged since `8334a3f`/`c2d27d1`, the final V23 writer) before any S5 source change: `legacy-v23-sound-operational-315` (sha `6f07b68b…`; inventor first-prototype sound adoption, equipmentCost 0, installationCost 975,000, two placements) and `legacy-v23-lighting-complete-plan-queued` (week 793, sha `f894c5f6…`; player lighting research completed 791 with inventor access, rival r05 commercial sound adoption at 520 with EMPTY `physicalProjectIds`, one queued plan waiting for 900); `evidence/p13b-s5-20260917/00`, provenance in `tests/fixtures/p13b/PROVENANCE.md`. Lift rule recorded from the fixture: a rival adoption has no placements → the V24 lift writes one aggregated `installation` row with `placementId: null` and cost = `installationCost`.
- [x] **S5-T1/T2/T3 Engine increment (sim-core, landed `2d41e85`, 2026-09-17 ≈06:10; closed ≈07:00 after the sweep):** `src/core/technologyAdoption.ts` (new; `adoptionQuote`, `equipmentAssets`, component/asset builders, per-technology chain checks), technology root v4 (`equipment`, `nextEquipmentId`; adoptions with `components`, `equipmentAssetId`, `postFacilityId: string | null`), `adoptTechnology` beside the retained `adoptSynchronizedSound` (ids unchanged), per-technology `finishTechnologyWeek`, validator v4 with frozen `validateTechnologyV3` + honest `liftTechnologyV3` (rival rows aggregated with `placementId: null`), rival purchase written as component rows from catalogue/blueprint values, `hasOperationalFacilityInstallation(null)` matches nothing (lighting never satisfies the sound lock; `technologyProduction.ts` untouched), **Save V24** with eleven downgrade guards and sentinel 25; consumers moved. S5 files 40/44 — the four remaining are two fixture-solvency premises measured by sim-core (two-Lab world insolvent by 936; sound research freezes at 46.5/64 once cash crosses zero) adjudicated as fixture amendments with the reconciled cash-move idiom; the mechanical live-version sweep 23→24 (36 failures in 23 core + 7 bridge test files, tsc errors only under tests/) is in flight with the test-author. **Closed:** test-author sweep 23→24 over 59 test files (live-version literals, `migrateToV24`, `validateSaveV24`/`SaveFileV24`, hand-built roots gain `version: 4, equipment: [], nextEquipmentId: 0`; frozen V21→V22 / V22→V23 proofs untouched) plus the two adjudicated solvency amendments with a ledger-written `fundTo` helper (lighting commercial at 936 funded to $1,000,000 before the purchase; the shared two-project fixture funded to $5,000,000 so sound completes at 823 with lighting at 791) and one test-side data fix (conservation case 1 read the player's rows positionally and picked up the rival's organic sound adoption; now keyed by (studioId, technologyId), assertions byte-identical). Evidence `07-sweep-01..07`: S5 six files 44/44, P13A 62/65 (+3 inherited digests), S2–S4 170/170, bridge named 40/40, every other edited file 620/620, `typecheck` + `typecheck:bridge` clean; coordinator confirmation `08` 44/44 (178 s). The coordinator applied the same one-line `migrateToV24` rename to `bridge-p12-campaign-library` and `bridge-p13-campaign-isolation` (excluded from the sweep by an over-broad instruction; the S3 sweep had moved them too) so their inherited failures stay timing failures, not downgrade refusals.
- [x] **S5 engine audit (contract-auditor, read-only, 2026-09-17 ≈06:40): KEEP** — every delegated decision met with evidence (`technologyAdoption.ts`, `technology.ts`, `technologyTypes.ts`, `save.ts` V24 wiring with the eleven downgrade guards counted, lift honesty from retained facts, rival rows aggregated, `hasOperationalFacilityInstallation(null)` matches nothing, `technologyProduction.ts` untouched, `hollywoodValidation.ts` still reconciles rival money to the retained totals); no over-building, no retained-law regression, tests genuine (no skip/tautology). Provenance the auditor could not run (read-only) closed by the coordinator: the engine commit touched only `tests/_historicalCurrent.ts` under tests/ (the enumerated consumer; `git diff 14bad35 2d41e85 --stat -- tests/`), the two follow-up commits are docs-only, and `evidence/p13b-s5-20260917/00`–`06` are committed (the auditor's Glob missed the directory).
- [x] **S5 tests 1–6 RED (test-author, 2026-09-17 ≈05:05; `evidence/p13b-s5-20260917/01`–`06`):** `tests/p13b-s5-{quotes,operational,equipment,save-v24,validation,conservation}.test.ts` (8 + 4 + 5 + 15 + 9 + 3 cases) all fail at module resolution of `src/core/technologyAdoption.ts` (one named cause). Test-author notes adopted as delegated decisions: the access component on every adoption is `existing` at cost 0 (access is acquired before adoption; never charged by it); `adoptionQuote` returns `{ok:true, components, total, reusedPostFacilityId, reusedEquipmentAssetId}` or `{ok:false, refusal, rejections}` (S4 disclosure pattern) and `adoptTechnology` throws the primary refusal; the full `setProductionTechnology` round-trip stays pinned by the retained `tests/p13a-production-technology.test.ts` (test 2 proves the discriminating stage-installation check only); validation gained case (h) — a lighting row with a non-null `postFacilityId` is refused.
- [x] **S5-T4 Bridge projection 37:** test 7 `tests/bridge-p13b-s5-adoption.test.ts` RED 10 failed / 1 passed at cf2a706 (2026-09-17 ≈07:45; `evidence/p13b-s5-20260917/10`; every failure a projection-37 fact absent from the projection-36 wire — the one pass is the vacuous pre-access lighting absence, flagged). Test-author interpretations adopted as delegated decisions: wire key `technologyId` on `StudioAdoptionRow`; the quote as a nullable `quote` member on `StudioLaboratoryAction` (adopt rows only); lighting rows access-gated for presence while sound rows keep P13A parity (visible + disabled with the engine refusal before access, used for the refusal-disclosure case); companions follow the Laboratory page's duplicate-hide rule (no standard ranking); `AVAILABLE_INTENT_KINDS` gains `adoptTechnology`. **Bridge landed `aba6761` (sim-core, ≈08:20):** projection 37, schema `sha256:2158ef1606497912f8589b5ae6496e55d4d73a2ee687e4b1867837c593af7aa8` (`urn:project-studio:bridge:protocol-4:projection-37`), union-fixture identity `dc94ab3b…`; `StudioAdoptionComponent`/`StudioAdoptionQuote`/`StudioAdoptionRow`, nullable `quote` on `StudioLaboratoryAction` (plans/office rows publish `quote: null`), `adoptions` on the Laboratory page, `bridge/session.ts` maps BOTH adoption verbs to the wire kind `adoptTechnology` (the sound engine action and its `sound-adoption` ids unchanged; delegated decision — one `adopt-*` family, one kind; the only retained-test consequence is `bridge-p13-no-laboratory-commercial`'s intent filter), generated DTOs + both contract checks verified; RED file 9/11, retained bridge P13 49/49, schema/generator/lock 130/130, fourteen 36→37 pin bumps 85/85, typechecks clean (`evidence/p13b-s5-20260917/11-t4-*`). Two premises adjudicated against measured engine law: (1) a pre-commit quote cannot carry commit-minted `placementId`/`equipmentAssetId` — the test compares scope/price with those ids projected out and asserts the committed ids are real; (2) after committing sound on a stage, the lighting row on that stage is PRESENT but disabled because P09 allows one installation per body (`targetEngaged`) — and this exposed an S5 engine gap: `adoptionRejections` has no engagement clause, so the quote said ok while the commit refused. Fix RED-first and CLOSED (`6bbaca2`, ≈09:25): engine cases in `p13b-s5-quotes` (engaged stage refused with the commit's sentence; cash-only obstacle reported with the commit's cash sentence; total-level shortfall refused while the bill stays published — RED `12`, `14`, `16`), then the engine: `adoptionRejections` gains the P09 installation clause for the PLAYER studio only (a rival's commercial purchase is a paper commitment with no P09 body — the first cut broke `p13a-rival-adoption` and `bridge-p13-laboratory`, caught by the retained sweep and narrowed), `installationRefusalSentence` classifies cash-only vs engaged for both layers, `adoptionQuote` refuses a total-level cash shortfall with components/total published; three solvency amendments (`fundTo`) in the tests. GREEN: quotes 11/11, bridge adoption 11/11, rival + laboratory + the other five S5 files 45/45 (`13`, `15`, `17`); typecheck root + bridge clean.
- [x] **S5 expansion audit (contract-auditor, read-only, 2026-09-17 ≈04:55):** figures and engine facts confirmed against code; two should-fix
      refinements adopted above (plan-queue companions per the S3/S4 precedent; `rejections`/`refusal` fields on the adopt rows) and the
      `postFacilityId: string | null` type change stated; the companion documents themselves are not in the engine tree (docs branch), so the
      audit verified the plan's paraphrase against code, not against the primary text.
- [~] **S5-T5 Matched pass, records (backlog entry), commit, push.** Running on `6bbaca2` (start 2026-09-17 ≈09:30 UTC; `evidence/p13b-s5-20260917/11-RUN`, `11-test-core-6bbaca2`, `12-test-bridge-6bbaca2`).
- [ ] **S5-R07 consumer task** — follows T5; its task expansion is written below ("## S5-R07 — Lighting production consumer", 2026-09-17) per the disposition.

## S5-R07 — Lighting production consumer: Ballroom-reveal setup units (Current Ops disposition) — task expansion (written 2026-09-17, before the task begins)

**Authority.** The S5-R07 consumer paragraph below (`OPS-P13B-R07-DISPOSITION-20260916-01` adopting `P13B-R07-PRODUCTION-CLARIFICATION.md`
§§2–6 as candidate tuning) and the retained boundaries: A12 / K4 / CAT-011 stay OPEN; S6 cancellation and S8 rival symmetry bind to this consumer
later; no take, quality, appeal, research or P14 change. Versions are allocated at execution (this expansion names them relative to S5's live
versions, never a reused number): **Save V25** if S5 lands V24, **projection 38** if S5 lands 37.

**Engine today (verified 2026-09-17).** `advanceManagedProductions` (`src/core/operations.ts:1452`) sweeps productions in order, counts
`remainingTicks` down from 8 (`PRODUCTION_TICKS`), maps 6 → rehearsal and 5/4 → shooting (`productionPhases.ts:39–41`), enters a phase through
`enterPhase` (stage + Set bound atomically into `WorkflowBindings {requiresSetBinding, stageFacilityId, setId, lockedNovelty, lockedUplift,
heldSinceWeek}`), completes the scheduled `ShootingTask` at 5 → 4, and consults a `ProductionAllocationPolicy` (`allowsFacility`,
`beforePhaseEntered`) that `technologyProduction.ts` uses for the sound lock at Shooting entry. Sets: `StudioSet {mountedOn, setType, status,
completesWeek, …}` with `setMountedOn`/`setIsUsable`; blueprint `set-grand-ballroom` (setType `grand-ballroom`) exists. History owner has
`phaseEntered`, `setBuilt`, `setRetired`. No setup substate, recipe, unit or plan-revision record exists anywhere.

**Scope.** A bounded setup subtask between rehearsal and Shooting for productions that explicitly select a setup recipe, with per-technology
provenance fixed at setup admission; the lighting route halves the Ballroom-reveal setup on the exact bound stage. Nothing else moves.

**Delegated implementation decisions (recorded; candidate tuning, not final balance).**
- Recipes as data (`src/core/productionSetup.ts`, new): `ballroom-reveal-lighting-01` ("Ballroom reveal — foreground, entrance and background
  lighting cues"; requires a usable standing `grand-ballroom` Set mounted on the production's reserved operational soundstage with the neutral
  standard size class; units 4 conventional / 2 lighting) and `ordinary-interior-01` (`generic-interior` / `apartment-interior`; 1 / 1).
  Legacy productions and productions that never select a recipe have `setup: null` and keep today's schedule exactly.
- Persisted record on the workflow (`ProductionWorkflow.setup: ProductionSetupRecord | null`): `{recipeId, planRevision, admittedWeek,
  route: 'conventional' | 'lighting', adoptionId: string | null, equipmentAssetId: string | null, stageFacilityId, setId, requiredUnits,
  creditedUnits, lastCreditedWeek: number | null, completedWeek: number | null, priorWork: ProductionSetupWork[]}` (prior work = retained
  history of an earlier binding: recipe, stage, Set, units credited, weeks). `planRevision` is the production-plan revision the recipe was
  reviewed against (the workflow's own monotonic counter, bumped by any binding change); the action carries `expectedPlanRevision`.
- Action `setProductionSetupRecipe {productionId, recipeId, expectedPlanRevision}` (reviewed; refused after Shooting entry, on a stale revision,
  for a Set of the wrong type/size, for an unusable or under-repair Set, for a production without a bound stage). Selecting a simpler recipe is
  a new revalidated plan (new record; prior work to `priorWork`); the same recipe cannot skip preparation by being called ordinary.
- Route and provenance fixed at setup admission (the sweep visit at which rehearsal work is done and the gate opens): `lighting` iff the same
  studio holds acquired `lighting-control-01` access AND an operational lighting adoption on the exact bound stage whose equipment asset is
  held AND a completed, non-cancelled `lighting-control-stage` placement on that stage; knowledge only, the Lab module, a different stage, an
  unfinished or cancelled installation, or a restoring/cancelled asset (S6) do not qualify. Lighting needs neither synchronized sound nor Post.
- Timeline: with a setup record, the 6 → 5 transition holds at `remainingTicks = 6` (rehearsal retained, stage + Set retained via
  `heldSinceWeek`) while `creditedUnits < requiredUnits`; exactly one unit is credited per eligible `[w, w+1)` after admission (admission at w
  earns its first unit at w+1; none on selection, queue, load, retry or a second sweep visit in the same week); when credited = required the
  production enters Shooting at the next boundary and `completedWeek` is stamped. Matched example: setup-ready 820 → Shooting entry 824
  (conventional) / 822 (lighting) / 821 (ordinary, both routes). No second scheduler, no surcharge, no duplicate payroll, no refund, no global
  multiplier, no retrofit discount on partly worked setup; the sound lock stays at actual Shooting entry; setup completes no take.
- History (production/history owner): `setupAdmitted`, `setupUnitCredited {creditedUnits, requiredUnits}`, `setupCompleted`, `setupRebound`
  (changed stage/Set/recipe; prior work preserved), each with production/recipe/planRevision/stage/Set ids, route and adoption reference or
  the explicit conventional route. Live witness: the operations read-model exposes the record verbatim.
- Save V25 (pattern as before; genuine V24 fixtures minted at the final V24 writer BEFORE any R07 source change; `setup: null` lift for every
  legacy workflow; validator: record ↔ workflow bindings consistent, units bounded, weeks ordered, route provenance re-derivable at admission
  week, no record on a legacy or post-Shooting workflow, priorWork never recycled into credit).
- Bridge (projection 38, text only): operations/production page publishes `setup` (recipe, route, credited/required, next unit week,
  completion forecast, provenance reference), recipe rows `setup-recipe-<productionId>-<recipeId>` with the `productionSetupAction` intent kind
  and engine-primary refusal + `rejections`; player-safe.

**Tests (RED-first; each fails before its implementation).** 1 recipe selection and refusals (wrong Set type/size, unusable Set, no bound stage,
after Shooting, stale revision, simpler recipe = new plan). 2 timeline through real ticks: 820 → 824 / 822 / 821; admission week earns no unit;
one unit per week; same-week retries and second sweep visits credit nothing; completed-task idempotence. 3 gate: knowledge-only, Lab-only,
wrong-stage, active-retrofit, cancelled-installation and unheld-asset cases take the conventional route; the exact-stage operational adoption
takes lighting. 4 controls: legacy timeline byte-identical; occupied-stage competition and stage-release law unchanged; changed pre-Shooting
sound choice independent of setup; different-binding restart preserves prior work without recycling credit; no filming/quality/research/P14
change; a forged operational flag is refused by the validator. 5 Save V25: genuine V24 fixtures + chains, mid-setup save/reload continues
identically, Save As worlds isolated, downgrade refusals. 6 Bridge projection 38.

**Allowance (plan):** 4 h capability, 2 h verification. **Backlog:** setup-recipe review flow, readable setup wait and forecast, history rows,
`productionSetupAction` intent, projection 38 DTOs, Save V25 (client-side load), plus the OPEN A12/K4/CAT-011 items with their owners.

### S5-R07 tasks
- [ ] **R07-T0 Genuine V24 fixtures** at the final V24 writer before any R07 source change.
- [ ] **R07-T1/T2 Engine increment** (sim-core; test-author tests 1–5 RED first): recipes, record, action, admission/credit law, history,
      validator, Save V25.
- [ ] **R07-T3 Bridge projection 38:** test 6.
- [ ] **R07-T4 Matched pass, records (backlog entry), commit, push.**

## S5 — original scope record (superseded by the expansion above; kept verbatim)

## S5 — Component inventor pricing/prototypes (Ready row 7) — scope record

Access/equipment/site/installation/capture/Post components per technology; first prototype covers one
equipment set; later inventor equipment at the 25% concession (sound $225k, lighting $150k); no negative
line; entitlement scoped by campaign/studio/technology/project. Requires S2. Allowance: 6 h / 2 h.

**S5-R07 consumer task (named 2026-09-16 by `OPS-P13B-R07-DISPOSITION-20260916-01`; sequenced AFTER S5 supplies the real per-technology
access/equipment/site/installation/operational chain; full task expansion — touched producer/consumer paths, migration/projection plan,
requirement tests, effort forecast, Unity backlog — is written before it begins, as the existing delegated expansion, not a new gate).**
- Adopted recipe (candidate tuning, not final balance): production-plan recipe `ballroom-reveal-lighting-01` ("Ballroom reveal — foreground,
  entrance and background lighting cues") selected through a reviewed production-plan action (semantic name `setProductionSetupRecipe`; final
  naming delegated) bound to an exact production and plan revision; requires a usable standing `grand-ballroom` Set mounted on the reserved
  operational soundstage with valid size fit. Setup units: Ballroom reveal **4 conventional / 2 with operational R07 on the exact bound stage**;
  ordinary single-zone interior (`generic-interior` / `apartment-interior`) **1 / 1**; legacy productions without a setup-plan record keep their
  existing schedule. One setup unit = one eligible production-work week (provisional). The same recipe cannot skip its preparation by being
  called ordinary; a simpler scene is a different, revalidated plan; no quality/appeal reward.
- Work owner: extend production operations (`advanceManagedProductions`, phase admission, exact stage/Set bindings) with a bounded setup subtask
  after normal rehearsal and before Shooting for new explicitly planned productions; `remainingTicks = 6` / rehearsal retained while the gate is
  open; the shared phase/validation owner recognizes the substate; at most one unit per eligible `[w,w+1)`, none on selection/queue/load/retry/
  second sweep visit; admission at w earns its first unit at w+1; preserve sweep order, stage-release law and the 8-tick table; no second job
  scheduler, surcharge, duplicate payroll, universal refund, global multiplier or instant retrofit discount on partly worked setup.
- Gate for the 2-unit route: the same studio's lawful `lighting-control-01` access + supplied equipment + completed non-cancelled P09
  `lighting-control-stage` fit-out on the exact bound stage + operational adoption. Knowledge alone, the Lab module, a different stage, unfinished
  installation and cancelled/restoring equipment do not qualify. Lighting needs neither synchronized sound nor Post. Recipe/workload/equipment
  provenance fixed at setup admission; the sound lock stays at actual Shooting entry; setup completes no take and satisfies no P14 promise;
  same-binding continuation retains work; a changed stage/Set/recipe needs a new physical setup with prior work preserved in history.
- Evidence and tests: bounded live + terminal witnesses through the production/history owner (production/recipe/version/stage/Set ids,
  adoption reference or explicit conventional route, work week, credited/cumulative units); matched example at setup-ready 820: completion
  **824 vs 822** (ordinary 821 both routes); controls: legacy timeline unchanged, wrong Set type/size refused, knowledge-only / Lab-only /
  wrong-stage / active-retrofit / cancelled-installation no discount, occupied-stage competition, changed pre-Shooting sound choice, save/reload,
  different-binding restart without recycled work, same-week retries, completed-task idempotence, Save As worlds, no filming/quality/research
  change; a forged operational flag is not proof. Versions: the next governed save/projection versions at execution — never S3's V23/35 or a
  reused number with different semantics; genuine earlier fixtures minted before the writer moves.
- Retained separately, OPEN with owners and return conditions: CAT-011 oversized Sets, the K4 large-stage body/footprint/pricing, companion A12
  refusal/acceptance; legacy bodies receive the neutral standard classification without invented setup history. S6 must exercise cancellation/
  restoration eligibility against this consumer; S8 must bind comparable rival behaviour through real rival producers before claiming symmetry.
  A standard-stage R07 pass cannot close A12 or all of P13B. Future recipe-review → setup → Shooting → take → result journey, client bindings,
  readable waits and art stay in `UNITY-INTEGRATION-BACKLOG.md`.

## S6 — Option-B installation cancellation with component receipts and restoration (Ready row 6) — task expansion (drafted 2026-09-17, after S5's engine landed; refined before S6 begins)

**Authority.** Companion §6 / A7 (cancellation traces in `03-PAPER-ECONOMICS.md`, outside this tree) as paraphrased by the S6 scope record below and
by S5's retained obligations: components charged once, no negative line, delivered equipment retained and reused never re-spawned, completed work
paid, unstarted work refundable once, restoration job ($25k/2 w sound, $10k/1 w lighting — candidate tuning), same-tick completion ordering,
cross-year refund bucket. The R07 disposition §4 (repeated cancel → restart lawful; no cloned work, no refunded research, no repeated entitlement)
applies to physical work by analogy and is recorded here as the rule, not a new product choice. Versions: the next governed save/projection
versions at execution, after S5-R07's (relative: Save V26 / projection 39 if R07 lands V25 / 38).

**Engine today (verified 2026-09-17).** A committed installation is a `PlacedFacility {projectId, blueprintId, facilityId, status
'underConstruction'…, placedWeek, completesWeek, installation: {targetFacilityId}}` paid in full at commit as one `constructionCapex` ledger
row keyed by `constructionProjectId`; completion is applied at the arrival boundary of `completesWeek` (`placement.ts:1042–1055`); there is no
per-component progress record and no cancel path for a started installation (`cancelPhysicalPlan` refuses `started`). S5 adoptions carry
`components` mirroring the blueprint's `installationComponents` (label, cost, weeks, placementId) and a held `equipmentAssetId`; assets are
never deleted. Calendar years are `1920 + floor(week/52)` (`calendar.ts:17`); finance reporting has no refund kind.

**Scope.** Cancel a running installation (any P09 installation with components, including an adoption's stage/Post work and S4's Office
conversion) with honest per-component receipts, a once-only refund of unworked components, retained equipment, a restoration job where site work
had begun, and the finance bucket for refunds; restart after restoration without recycled credit. Rival symmetry is S8; S5-R07's setup consumer
must see a cancelled/restoring stage as non-qualifying (its gate already names it).

**Delegated implementation decisions (recorded; candidate tuning where money is named).**
- Component progress is derived, never stored: components run in authored order from `placedWeek`; component k spans `[start_k, start_k +
  weeks_k)`; at cancel week w (action applied before the boundary to w+1) a component is `completed` (its end ≤ w), `inProgress` (start < w <
  end; worked = w − start whole weeks; paid = cost·worked/weeks rounded to whole money toward the studio's favour, remainder refunded) or
  `unstarted` (refunded in full). Zero-week components (capture package) are paid iff any physical component has completed or begun, else refunded.
- Action `cancelInstallation {projectId}` (and `cancelAdoption {adoptionId}` = cancel every remaining physical component of that adoption): refused
  when the placement is operational, already cancelled, or not the player's; writes ONE `constructionRefund` ledger row (`constructionProjectId`
  = the cancelled project, amount = Σ refunds, week w) and a `CancellationReceipt {projectId, week, components: [{label, cost, weeks, status,
  paid, refunded}], refund, restorationProjectId: string | null}` on the placement record (`status: 'cancelled'`); a second cancel is refused;
  a later restart of the same blueprint on the same target is a NEW placement quoted anew (no refund credit, no free components).
- Equipment: an adoption whose physical work is cancelled keeps its asset (`holderAdoptionId → null`, asset unheld); the adoption row gains
  `cancelledWeek`; the first-prototype entitlement is not restored (the asset exists and is reused at $0 by S5's unheld-asset rule on restart).
  Research is never refunded; access is never revoked.
- Restoration: if any site-adaptation component had begun, cancellation auto-commits a restoration installation on the same target
  (`restoration-sound-stage` $25,000/2 w, `restoration-lighting-stage` $10,000/1 w, `restoration-office` for S4 conversions at the II/III
  component's own site cost share — candidate) that takes the target offline like S4's conversions and returns it at completion; nothing to
  restore if no site work began. Restoration is itself cancellable? No — refused (it is the cost of the cancellation).
- Same-tick ordering: the boundary completion sweep runs before plan admission and before any action of week w+1; a cancel at week w never
  refunds a component whose end ≤ w and never pays a component whose start ≥ w. Save/reload between the action and the boundary changes nothing.
- Cross-year refund bucket: the finance report shows refunds as their own line in the calendar year of the refund week, never as a retroactive
  edit of the year the capex was paid; the report's yearly capex totals stay historical.
- Validator: receipt sums (Σ paid + Σ refunded = Σ component costs), refund row amount = receipt refund, no negative, one receipt per project,
  cancelled placement never operational, asset unheld iff its adoption is cancelled, restoration project present iff site work began.
- Save V(next): placement records gain `cancellation: CancellationReceipt | null`, adoptions `cancelledWeek: number | null`, ledger kind
  `constructionRefund`; honest lift (null / none); genuine fixtures of the prior version minted at its final writer before any S6 change.
- Bridge (projection next, text only): `cancel-<projectId>` rows on the Laboratory/Office/plans surfaces with the receipt quote (per component
  status/paid/refund, restoration cost/weeks, engine refusal + rejections), restoration rows, finance page refund line.

**Tests (RED-first).** 1 receipts by exact trace (lighting cancelled after site complete: paid 50,000 / refund 50,000 + restoration 10,000/1 w;
during installation week 1 of 2: paid 75,000 / refund 25,000; sound during site week 3 of 9: paid 150,000 / refund 300,000 + 150,000 + 75,000,
Post placement refunded in full if unstarted, restoration 25,000/2 w; S4 Office II cancelled mid-way with the office restored online). 2 once-only
refund; restart quoted anew; no cloned work. 3 asset retained and reused at $0 on the next adoption of the same technology; entitlement not
restored. 4 restoration: target offline until completion, opex law as S4, its own ledger row. 5 same-tick ordering with save/reload. 6 finance
year bucket. 7 Save V(next) + validator refusals. 8 bridge rows. **Allowance:** 8 h capability, 3 h verification.

## S6 — Option-B installation cancellation (Ready row 6) — scope record

Component quantity/progress/cost receipts; completed work paid, unstarted refundable once, delivered
equipment retained, restoration job ($25k/2 weeks sound, $10k/1 week lighting, candidate), same-tick
completion ordering, cross-year refund bucket. Requires S5. Allowance: 8 h / 3 h.

## S7 — Forecast/replacement disclosure (Ready row 5) — provisional task expansion (drafted 2026-09-17 from the plan's own record; VERIFY against the companion before S7 begins)

**Input limit (recorded, not resolved).** The companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` and `03-PAPER-ECONOMICS.md` are not on disk in
any of the three worktrees nor in any local git ref (searched 2026-09-17 ≈08:00); the R07 packet on disk is only the disposition zip. This
expansion is derived from the S7 scope record and the retained engine facts; its acceptance wording must be re-checked against the companion's
own text when it is re-supplied. Nothing here is a product decision; anything not derivable is flagged OPEN.

**Engine today.** The catalogue carries `researchableWeek` and `commercialWeek` per technology (lighting 780 / 936; sound 260 / 416) and the
Laboratory page already discloses the player's own research opening and commercial purchase dates verbatim. The industry page publishes
rival facts only from receipts (`filmAnnounced`, `technologyAdopted`) and refuses private schedules; rival research does not exist yet (S8).

**Scope.** Public, milestone-only disclosure of a technology's expected commercial availability and of what a commercial purchase replaces:
- Forecast: before any public announcement the wire publishes a DISTANT WINDOW for lighting (884..988, candidate) — never the exact commercial
  week; at week 884 a public announcement (a hollywood receipt `technologyAnnounced`, minted by the campaign clock, not by rival research)
  narrows the disclosure to the exact 936. Sound's history is retained as-is (its commercial week is already public in P13A). OPEN: whether the
  distant window and announcement week are catalogue data per technology (delegated: yes, as `publicWindow {from, to, announceWeek}` on the
  catalogue entry, with sound's window equal to its own commercial week so nothing changes for it).
- No private rival research exposure: the forecast never reads rival projects, seats, spend or receipts; only the campaign-clock announcement
  and the catalogue's public window. S8 must keep this invariant when rival research exists (validator: announcement receipts carry no studio
  authority).
- Replacement descriptors on purchase: the commercial purchase row and the access record disclose what the technology replaces (sound:
  synchronized dialogue replaces silent production method on the selected stage chain; lighting: controlled lighting replaces conventional
  setup on the fitted stage — S5-R07's 4 → 2 units) as text derived from catalogue data, not from private facts. OPEN: exact descriptor wording
  (companion text needed).
- Persisted facts: at most one `technologyAnnounced` receipt per technology (hollywood receipts, existing root); no new save root is expected —
  if one is needed the next governed version is allocated at execution.
- Bridge (projection next, text only): Laboratory page `forecast` per technology {windowFromLabel, windowToLabel | exactLabel, announcedWeek,
  basis}, `replacementLabel` on the purchase row and on access rows; industry page announcement row for the campaign announcement.

**Tests (RED-first).** 1 forecast text before 884 shows the window only, never 936; at/after 884 shows the exact date; sound unchanged. 2 the
forecast is independent of any rival state (two campaigns differing only in rival facts publish identical forecasts). 3 one announcement
receipt per technology, at the clock week, in Save As worlds too. 4 replacement descriptors on the purchase row and access rows for both
technologies. 5 bridge projection. **Allowance:** 4 h capability, 2 h verification.

## S7 — Forecast/replacement disclosure (Ready row 5) — scope record

Public milestone facts only; R07 distant window 884..988 narrowing on public announcement at 884 to 936;
no private rival research exposure; replacement descriptors on purchase. Requires S2. Allowance: 4 h / 2 h.

## S8 — Symmetric rival research and finance (Ready row 8) — provisional task expansion (drafted 2026-09-17; refined after S6/S7 land and once the companion is re-supplied)

**Authority.** The S8 scope record below; the R07 disposition (rival symmetry must be bound through real rival producers before any symmetry
claim; S8 binds comparable rival behaviour to the S5-R07 consumer); S3's symmetric `physicalPlans` root; S5's per-technology adoption and
equipment law; S6's cancellation receipts. Companion text not on disk (see S7's input limit). Versions: the next governed save/projection
versions at execution, after S6/S7's.

**Engine today (verified 2026-09-17).** Rivals are `RivalBusiness {account: RivalAccount, operations: StudioOperations, productions, projects,
policy {affinities, negativeScale, marketingRatio, reserveWeeks}, …}` advanced by `advanceHollywoodWeek`; their technology is a paper
commercial purchase (`considerRivalSoundPurchase`, sound only, S5 writes it as aggregated component rows with a held commercial asset) and a
sound production choice; rival ledger kinds are `development | production | marketing | studioRevenue | technologyAdoption`; rivals have no
Laboratories, Scientists, research projects, physical plans or installations; player-only admission in S3 and player-only P09 bodies in S5.

**Scope.** Rivals research and deploy under the same law as the player, through the same roots, with receipts for everything and typed finance:
- Rival Lab capacity: receipt-backed Laboratory construction and instrument installation on the rival's own operations (≤ 2 Labs × 4 seats),
  through the shared placement/installation law where the rival's lot exists, else through the S3 physical-plan root with rival admission
  (the `reserveWeeks` policy governs when a rival commits capital); no invented plant — every Lab and module has a placement or plan receipt.
- Rival research: the same `ResearchProject`/seat/receipt law (S1–S2) driven by a rival policy (technology interest, budget ceiling within
  `reserveWeeks`), Scientists employed through the shared employment law (S1 identity, contracts, expiry); cooperation/splitting as the player.
- Rival adoption per technology (S5): the P09 query clause applies to the rival's bodies once they exist; first-prototype entitlement, later
  inventor, commercial purchase — identical; the rival's commercial purchase keeps its current shape until its plant exists.
- Typed rival ledger kinds: `researchSpend`, `researchCapacity` (Lab/instrument capex), `technologyRestoration` (S6), `technologyRefund` (S6),
  beside the existing kinds; interval Opex for rival plant (weekly operating cost booked per interval, as the player's baseline opex); the
  migration basis frozen at the migration week (a rival that enters by migration carries its historical account as-is; legacy zero-Opex rivals
  grandfathered — no invented back-charges).
- Forecast invariant (S7): rival research never leaks; the announcement stays campaign-clock driven.
- S5-R07 symmetry: rival productions use the same setup recipe/unit law with their own provenance; no shortcut.
- Validator: rival roots hold the same invariants as the player's (access identity, component sums, asset holders, plan admission), plus
  "no rival authority without a receipt" for every Lab, seat, adoption and plan.
- Bridge (projection next, text only): industry page publishes rival technology facts only from receipts (adoption operational, announcement),
  never research state; rival finance exposed only through the existing public standings.

**Tests (RED-first).** 1 rival Lab/instrument receipts (≤ 2 × 4, reserveWeeks respected, no plant without receipt). 2 rival research under the
shared law (identical receipts for identical inputs vs a player run; expiry/renewal). 3 rival adoption per technology with the P09 clause on
rival bodies; commercial purchase unchanged where no plant exists. 4 typed ledger kinds and interval Opex reconcile; migration basis frozen;
legacy zero-Opex grandfathered. 5 S7 non-leak invariant with rival research present. 6 S5-R07 symmetry through a real rival production.
7 Save V(next) + validator refusals. 8 bridge. **Allowance:** 12 h capability, 4 h verification.

## S8 — Symmetric rival research and finance (Ready row 8) — scope record

Receipt-backed rival Lab construction/instruments (≤2 Labs × 4 seats), same law as players, reserveWeeks
policy, typed rival ledger kinds (`researchSpend`, `researchCapacity`, `technologyRestoration`,
`technologyRefund`), interval Opex, migration basis frozen at the migration week, legacy zero-Opex
grandfathered. Requires S2, S5, S6. Allowance: 12 h / 4 h.
