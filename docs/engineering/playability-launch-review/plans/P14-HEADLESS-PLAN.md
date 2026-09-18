# P14 — Contested Talent Market, Bonds and Promises, Career Lifecycle — headless plan (logic-first)

**Status (2026-09-18).** DRAFT v1, written after P13B S8's engine and bridge landed and before its matched pass closed; refined and audited
(contract-auditor, read-only) before P14A.1 begins. Engine implementation and verification only; Unity/rendered UI/native/visual acceptance
deferred and never claimed verified; every engine change creating client work is recorded in `../UNITY-INTEGRATION-BACKLOG.md`.

## 1. Authority and inputs

- Owner directive `OWNER-HEADLESS-PROGRAM-20260916-01` (logic-first): headless P13B → **P14** → P15 → P16 engine work proceeds now; later
  corrections override older research. The three-week autonomous directive (2026-09-15) names the P14 preparation index at
  `The-Movies@8ef5246a docs/engineering/P14-PREPARATION-REVIEW-INDEX.md`.
- The P14 preparation package, retained verbatim in `../../p14-preparation-8ef5246a/` (README states provenance): the review index, the
  post-P12 reconciliation (REUSED 57 · SHARED GENERALIZATION 19 · NEW P14 WORK 17 · POST-P13 REFRESH REQUIRED 14), the preparation
  companion (P14A/B/C design, firing note, promise catalogue, relationship model, lifecycle model, decision register §7), the launch-review
  skeleton, and the Owner rulings record §3.4 (fourteen OWNER-SELECTED PRODUCT DIRECTIONS, superseded statements).
- The package's own status ("PREPARATION READY — POST-P13 ACCEPTANCE REFRESH REQUIRED · IMPLEMENTATION NOT AUTHORIZED") predates the
  2026-09-16 directive; this plan performs the post-P13 refresh (§2) against the actual P13B closeout and proceeds under the directive.
- Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` / `03-PAPER-ECONOMICS.md` remain off disk (recorded in `CONTINUATION-STATE.md`); P14's
  acceptance wording is drafted from the package and must be re-checked when the Owner side re-supplies it.

## 2. Post-P13 refresh (reconciliation §3), against the P13B closeout

| P13 seam | P13B fact now in force (branch `wip/headless-program-20260916-ts`) | Consequence for P14 |
|---|---|---|
| Era / timeline facts | `campaignDate(week)` (`src/core/calendar.ts`) is the only public era/date law; technology milestones are catalogue data (`researchableWeek`, `commercialWeek`, S7 `publicWindow`); no era root was added | P14 reads `campaignDate` for cohort ages and profile copy; no era symbol to refresh |
| First-filming seam | S5-R07: a production enters Shooting when its setup units are credited (`ProductionWorkflow.setup`, `setupAdmitted`/`setupCompleted` events); the first take is the first `ShootingTask` after entry | the promise qualifying event and the relationship shared-work boundary read the S5-R07 Shooting entry, not `phaseEntered` alone |
| Stage durations and capacity | `FACILITY_BLUEPRINTS` (20 entries incl. `restoration-*`, `office-conversion-*`, technology installations); Laboratory capability with 4 seats; installations and cancellations (S6) take bodies offline | the feasibility service (P14B) reads live capability/offline state through `occupancy.ts`; durations from the blueprint table |
| Professions | `CreativeRole = FilmCreativeRole | 'scientist'`, `Discipline = FilmDiscipline | 'research'`; Scientists employ through the shared contract law (P13A), rivals hire them through `staff()`'s scientist slots (S8) | the Scientist joins market eligibility, aging and retirement; its retirement window and market rule are OPEN (companion §7.3-adjacent; no Owner text) |
| Rival movements | `RivalMoneyKind` = 14 kinds (P13A `technologyAdoption`; S8 `researchSpend`, `researchCapacity`, `technologyRestoration`, `technologyRefund`); period exact-key validation | P14's `termination` rival kind lands in its own governed save step, as the package foresaw |
| Persistence | live save **V27** (`LIVE_SAVE_VERSION`), bridge projection **41**, schema `sha256:16b84322…`; frozen chain V12–V26 with positive projections (`projectPlacementPreV26`, `projectHollywoodPreV27`) and policy threading | P14A.1 allocates **V28 / projection 42** at execution; genuine V27 fixtures are minted at the final V27 writer before any P14 source change |
| Identities | the S8 closeout commit and its matched-pass attribution (P13B progress table) | cited by the P14A.1 records; no Owner acceptance of P13B exists (LOGIC VERIFIED · UNITY NOT VERIFIED only) |
| Process-global caches | one pre-existing module-level memo in `src/core/hollywood.ts:50` — `employmentByPerson`, a `WeakMap` keyed by the employment ARRAY instance (object identity, GC-safe), not by seed, `worldId`, `PersonId`, `caseId`, `contractId`, receipt id, `campaignId` or `sessionId`; no other module-level `Map`/cache binding in `src/core` (grep 2026-09-18); every P13B reducer is copy-on-write | admissible under the reconciliation's rule (identity-keyed, not id-keyed); P14 adds no seed/id-keyed module state and does not extend this memo |

## 3. Slice order

P14A.1 **One Contested Expiry Core** (companion §2.1.10) → P14A.2 workspace read models → P14A.3 world route facts → P14B promises/relationships
→ P14C lifecycle. Each slice: expansion written before it begins; genuine fixtures of the outgoing save version minted at its final writer
before any source change; the next governed save/projection versions allocated at execution; RED-before-implementation; specialists
(sim-core, test-author, contract-auditor read-only), max two concurrently; matched pass, attribution against the inherited set, LOGIC
VERIFIED · UNITY NOT VERIFIED label; backlog entry.

## P14A.1 — One Contested Expiry Core — task expansion (draft; audit before it begins)

**Settled law (rulings §3.4.1, by number; not re-asked):** 1–4 (firing as recalibration; the 26-week-capped charge; anti-exploit guard;
market eligibility: free agents and the renewal window only, no in-term poaching, no buyouts), 8 (no agent), 14 (upstream ownership: P10
person/contract truth, P12 employer/exclusivity/intervals, P11 money).

**Engine today (verify at T1).** `signContract {talentId, termWeeks}`, `renewContract {talentId, termWeeks}` (immediate replacement inside the
window), `releaseTalent {talentId}` (D-11.9 charge, `termination` ledger kind); `renewalWindowOpen(terms, week)` with
`TUNING.HIRING_RENEWAL_WINDOW_WEEKS = 12`; rivals renew their own people on the window's first week and never propose (`staff()`); the salary is
the person's ask (`offerForTalent`), no player money lever; contract terms of rival-employed people are private on the wire.

**Scope (companion §2.1.10).** One immutable `PersonId`, two entered studios (player + one rival present at week 0), one market case per
eligible expiry (`discovered → proposals_open → decision_pending → settled | declined | expired | invalidated`), at most one current proposal
per studio, the symmetric premium tier on both proposals (bounded; CANDIDATE tiers), P10 draft references with version invalidation, the rival
proposal trigger inside `nextDecisionWeek`, case-aware admission (the incumbent's renewal becomes a proposal while a case is open), the
terminal atomic settlement at the subject's `endWeekExclusive` (derived on read), the disclosure table (§2.1.5: existence/subject/decision
week/competing term public; premium/salary/bonus UNKNOWN; ranking reasons order-only after settlement), receipts for discovery, proposal,
withdrawal, settlement, invalidation; free agents stay instant-sign.
- Persisted facts: a `talentMarket` root (cases, proposals, receipts) — **Save V28**; a `termination` rival money kind if rival firing is
  reached (deferred: companion §4 "Rival early termination — Ready"), else not in this slice.
- Bridge (projection 42, text only): profile case block (case status, decision week label, own proposal, competing proposal's known terms
  and UNKNOWN markers, settlement receipt reasons), intent kinds for propose/withdraw, attention rows for the five interrupt causes.
- OPEN (recorded, not resolved): premium tier bounds and the rival's trigger policy numbers; the anti-exploit guard's exact form (§3.5
  recommendation); Q1–Q4 of companion §7.3 (none blocks A.1); the Scientist's retirement window and market rule; acceptance wording.

**Tests (RED-first, against `src/core/talentMarket.ts`).** 1 eligibility table (six states; reserved rivals cannot propose; in-term
approaches refused). 2 case lifecycle and derived decision week; invalidation triggers. 3 proposals: one current per studio, premium tier
bounds, draft reference invalidation, affordability gates (`canAfford` for the player; the rival's reserve). 4 rival trigger inside
`nextDecisionWeek` (pure policy, receipt-backed). 5 atomic settlement: deterministic ranking, exactly once, receipts, incumbent renewal as a
proposal, order-only reasons. 6 disclosure (UNKNOWN markers; nothing private leaks). 7 firing: the 26-week cap and the anti-exploit guard.
8 Save V28 with genuine V27 fixtures; validator refusals. 9 bridge projection 42.

### P14A.1 tasks
- [ ] **T0 Genuine V27 fixtures** at the final V27 writer (S8's closeout commit) — `src/harness/p13b/legacy-v27-fixtures.ts`; provenance.
- [ ] **T1 Tests 1–8 RED-first** (test-author). - [ ] **T2 Engine increment** (sim-core; V28; sweep 27→28 incl. rosters/bounds).
- [ ] **T3 Bridge projection 42** (test 9 RED-first, then sim-core). - [ ] **T4 Matched pass, attribution, label, records, commit, push.**
