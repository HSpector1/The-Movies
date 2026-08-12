# D-16 — Engine Economy Source Matrix

**Milestone:** D-16 Economy & Recovery Decision Lab (deliverable #2).
**Base SHA:** `33eb33ae` · branch `audit-d16-economy-recovery-decision-lab` (identical to production `main`;
`src/core/**` is byte-unchanged between `33eb33ae` and this branch's HEAD — the branch adds only
`src/harness/d16/**`).
**Status:** engineering reference produced by the D-16 analysis lab. It describes the **CURRENT ENGINE**
as of that SHA.

**This document changes nothing.** It records where every financial value in the engine comes from,
when it moves cash, who reads it, and where two live definitions of the same quantity disagree. It
contains **no recommendations** — those live in `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md`.

Every `file:line` below was read from source at this SHA. Backbone analyses:
`out/d16-economy-lab/analysis/{A1-governance-archaeology,A2-cashflow-accounting,A3-film-economics,A17-determinism-save-replay}.md`
(gitignored). Where an analysis line reference had drifted, this document carries the corrected one.

---

## 0. The shape of the money model

- **8 ledger kinds** (`types.ts:350-358`), one closed union. `LedgerEntry` = `{ week, kind, amount
  (SIGNED), talentId?, productionId?, note }` (`types.ts:360-367`).
- **9 cash-mutating statements** in `src/core` (exhaustive; `grep -E "cash [-+]?=|cash:"`):
  `actions.ts:441`, `:454`, `:1161`, `:1204`, `:1228`; `tick.ts:239`, `:330`, `:468`, `:479` — plus the
  world-generation initializer `worldgen.ts:617`. No other module touches cash: `development.ts`,
  `starPower.ts`, `standing.ts`, `broadcast.ts`, `newspaper.ts`, `reception.ts`, `forecast.ts` never do.
- **One revenue inflow when engaged**: weekly theatrical Studio Revenue (`tick.ts:325-343`).
- **Reconciliation invariant** (`types.ts:345-347`): `studio.cash === INITIAL_CASH + Σ ledger.amount`,
  with exactly one documented exception — founding recruitment-fund signing bonuses (`types.ts:348-349`).
  Accumulate in **ledger array order from `INITIAL_CASH`**; summing deltas first drifts ≈5e-9 by float
  associativity (`economyView.ts:13` already defines `EPS = 1e-9`).
- **No game-over.** Negative cash has no mechanical consequence (D-1 / D-11.5 / D-12.12,
  `D-12-economy-contract.md:163`); it only blocks gated voluntary spend.
- **No recovery mechanic exists**, stated in the engine itself: `studioRunRecap.ts:828`.

### Engine constants of record

| Constant | Value | Source |
|---|---|---|
| `INITIAL_CASH` | `20_000_000` | `tuning.ts:50` |
| `HIRING_FOUNDING_BUDGET` | `6_000_000` | `tuning.ts:283` |
| `TICKS_PER_YEAR` / `PRODUCTION_TICKS` / `MAX_CONCURRENT_PRODUCTIONS` | `52` / `8` / `2` | `tuning.ts:47-49` |
| `THEATRICAL_WEEKS` | `6` | `tuning.ts:326` |
| `STUDIO_RENTAL_BLENDED` | `0.52` | `tuning.ts:325` |
| `ECONOMY_MODEL_VERSION` | `1` | `tuning.ts:333` |
| `OVERHEAD_BASE` / `OVERHEAD_PER_EMPLOYEE` | `15_000` / `1_500` | `tuning.ts:331-332` |
| `SALARY_BASE` / `SALARY_SKILL_COEF` / `SALARY_FAME_COEF` | `25_000` / `150_000` / `600_000` | `tuning.ts:51-53` |
| `CONTRACT_TERM_OPTIONS` (weeks) | `[52, 104, 156, 208]` | `tuning.ts:288` |
| `CONTRACT_MIN_WEEKS` / `CONTRACT_MAX_WEEKS` | `52` / `208` | `tuning.ts:286-287` |
| `CONTRACT_ANNUAL_MULT` | `3.0` | `tuning.ts:293` |
| `CONTRACT_LENGTH_FACTOR` | `{52:1.08, 104:1.0, 156:0.95, 208:0.9}` | `tuning.ts:294` |
| `CONTRACT_SIGNING_BONUS_FRACTION` | `0.18` | `tuning.ts:299` |
| `HIRING_RENEWAL_WINDOW_WEEKS` | `12` | `tuning.ts:302` |
| `HIRING_TERMINATION_FRACTION` | `0.5` | `tuning.ts:303` |
| `FREELANCER_FEE_PREMIUM` | `1.5` | `tuning.ts:306` |
| `NEGATIVE_BUDGET_MULTIPLIERS` | `[0.75, 1.0, 1.25]` | `grid.ts:8` |
| `MARKETING_BUDGET_LEVELS` | `[100_000, 400_000, 1_000_000]` | `grid.ts:9` |
| `ECONOMY_BOX_OFFICE_SCALE` | `0.7` (engaged only) | `tuning.ts:346` |
| `ORGANIC_AWARENESS_FLOOR_WEIGHT` | `0.52` (engaged; M0A literal `0.6`) | `tuning.ts:376`, `reception.ts:569` |
| `SCRIPT_COST_POTENTIAL_CORRELATION` | `0.4` | `tuning.ts:436` |

### Salary → contract → payroll chain

```
salaryCurve(t)        = SALARY_BASE + SALARY_SKILL_COEF·(primaryOVR/100)² + SALARY_FAME_COEF·(fame/100)²
                        worldgen.ts:147-153   (primaryOVR is PERCEIVED, via roleOVR)
annualSalary          = iround(salaryCurve × 3.0 × lengthFactor[term] × ageFactor(age) × jitter)
                        employment.ts:181-183;  ageFactor employment.ts:162-166
jitter                = 1 ± CONTRACT_SCARCITY_JITTER, from stream(seed,'hiring',`offer-<id>`)
                        employment.ts:179-180 — stable per person, not per week/term
signingBonus          = iround(annualSalary × 0.18)                       employment.ts:184
weeklySalary          = iround(annualSalary / 52)                         employment.ts:110-112
weeklyPayroll(week)   = Σ weeklySalary over contracts with startWeek ≤ week < endWeekExclusive
                                                                          employment.ts:126-132
freelancerFee(t)      = iround(salaryCurve(t) × 1.5)                      employment.ts:219-221
terminationCost(c,wk) = iround(0.5 × weeklySalary × max(0, endWeekExclusive − wk))
                                                                          employment.ts:115-123
weeklyOverhead        = 15_000 + 1_500 × state.contracts.length           tick.ts:477
```

### Film money chain (engaged)

```
requiredNegative = concept.baseNegativeCost × shapeEffects.budgetDemandMultiplier × era.costScale
                                                                          reception.ts:220-221
budget.negative  = NEGATIVE_BUDGET_MULTIPLIERS[i] × requiredNegative       grid.ts:8
budget.marketing = MARKETING_BUDGET_LEVELS[j]                             grid.ts:9
opening          = baseMarketValue × reachSum × openingReachMult × competitionFactor × 0.7
                                                                          reception.ts:599-600
openingDiscovered= opening × discoverability                              reception.ts:643-647
gross (total)    = openingDiscovered × legs                               reception.ts:648
weeklyGross[6]   = theatricalSchedule(opening, legs), Σ ≡ opening × legs   economy.ts:28-48
StudioRevenue_w  = weeklyGross[weekIndex] × studioShare (0.52, locked)     tick.ts:328-330, economy.ts:67
contribution     = Σ StudioRevenue − (negative + marketing + freelancerFees)
                                                                          studioRunRecap.ts:416-418
```

---

## 1. THE MONEY TABLE

Columns — **Vol?** voluntary (v) / unavoidable (u) · **Gate?** D-12.11 solvency gate applies ·
**Fcst?** appears in the greenlight forecast the player sees · **D-15?** counted in per-film
contribution/ROI.

| # | Value / formula | Authoritative fn (file:line) | State field(s) | When cash moves | Ledger kind | Vol? | Gate? | Fcst? | D-15? | UI / read-model consumers |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Starting capital `$20,000,000`** | `generateWorld` `worldgen.ts:615-621`; `TUNING.INITIAL_CASH` `tuning.ts:50` | `studio.cash` | world generation | **none** — the invariant's base | — | — | — | — | `financeView.cash`; `recap.capital.openingBalance` (`studioRunRecap.ts:413,525`) |
| 2 | **Founding recruitment fund `$6,000,000`** (off-ledger) | `beginFounding` `employment.ts:389-393`; spent `actions.ts:1127-1138` | `founding.budget`, `founding.spentBonus` | at `beginFounding`; drawn down per founding signing | **NOT IN LEDGER — deliberate exception** (`types.ts:348-349`) | v | **no** — own budget check (`actions.ts:1127-1132`), never `canAfford` | n/a | no | `FoundingScreen.tsx`; `founding.spentBonus` |
| 3 | **Signing bonus (operating phase)** `iround(annual × 0.18)` | `offerForTalent` `employment.ts:184`; debited `actions.ts:1161` | `studio.cash`, `contracts[]` | at `signContract` when `founding === null` | `signingBonus` (`actions.ts:1152-1158`) | v | **yes** `actions.ts:1148-1151` | **no** | **no** | `HiringMarket`; `financeTotals.signingBonus` (`economyView.ts:228-235`) |
| 4 | **Renewal signing bonus** — same formula, fresh full bonus, no proration | `contractOffer` `employment.ts:195-206`; debited `actions.ts:1204` | `studio.cash`, `contracts[]` | at `renewContract` | `signingBonus` (`actions.ts:1195-1201`) | v | **yes** `actions.ts:1191-1194` | **no** | **no** | `StudioRoster.tsx` renew flow |
| 5 | **Weekly payroll** `Σ iround(annual/52)` over active contracts | `weeklyPayroll` `employment.ts:126-132`; debited `tick.ts:468` | `studio.cash` | **tick step 7**, once per tick; **skipped while `founding !== null`** (`tick.ts:465`) | `payroll` (`tick.ts:469`) | **u** | never | **no** | **no** (D-12 §8, `D-12-economy-contract.md:125`) | `financeView.weeklyPayroll`; `recap.capital.totalPayroll` |
| 6 | **Weekly overhead** `15,000 + 1,500 × contracts.length` | `tick.ts:477`; mirrored `weeklyOverhead` `economyView.ts:19-22` | `studio.cash` | **tick step 7.5**, gated on `engaged && founding === null` (`tick.ts:476`) | `overhead` (`tick.ts:480`) | **u** | never | **no** | **no** (D-12 §8) | `financeView.weeklyOverhead`; `recap.capital.totalOverhead` |
| 7 | **Freelancer one-film fee** `iround(salaryCurve × 1.5)` per non-contracted assignee | `freelancerFee` `employment.ts:219-221`; charged `actions.ts:417-434` | `studio.cash` | at `greenlight`, in full | `freelancerFee`, **one entry per talent** (`actions.ts:426-433`) | v | **yes** — inside the same `canAfford` amount (`actions.ts:437`) | yes, via `salarySum` → `assignmentProjectCost` (`adapter.ts:2239-2246`) | **yes** | `freelancerPool`; Assembly pickers |
| 8 | **Production commitment (negative)** `NEGATIVE_BUDGET_MULTIPLIERS[i] × requiredNegative` | `applyGreenlight` `actions.ts:399,441`; `requiredNegative` `reception.ts:220-221`; grid `grid.ts:8` | `studio.cash`, `activeProductions[].budget.negative` | at `greenlight`, in full | `production` — **merged with marketing** (`actions.ts:442-448`) | v | **yes** `actions.ts:437-440` | yes (as `committedCost`) | **yes** | `commitmentPreview`, `productionDemandView`, `Assembly.tsx:1020` |
| 9 | **Marketing commitment** `MARKETING_BUDGET_LEVELS[j]` | same entry as #8 — `actions.ts:399` `negative + marketing` | `activeProductions[].budget.marketing` | at `greenlight`, in full, **sunk** | `production` — **not separately itemised** | v | **yes** (same `canAfford`) | yes | **yes** | `Assembly.tsx:1021`; immutable post-greenlight (`D-12-economy-contract.md:122`) |
| 10 | **Termination / early release** `iround(0.5 × weeklySalary × remainingWeeks)` | `terminationCost` `employment.ts:121-123`; debited `actions.ts:1228` | `studio.cash`, `contracts[]`, `freeAgents[]` | at `releaseTalent` | `termination` (`actions.ts:1219-1225`) | v | **NO — ungated (§5.1)** | **no** | **no** | `StudioRoster.tsx:76` → `releaseTalentAction` (`adapter.ts:1858-1864`) |
| 11 | **Theatrical gross** `openingDiscovered × legs` | `reception.ts:647-648`; frozen onto `FilmResult.boxOffice.total` | `releasedFilms[].boxOffice`, `theatricalRuns[].weeklyGross` | **never a cash event when engaged** — gross is attendance, not money (D-12 principle 1) | **none** (deliberate, D-12.10) | — | — | forecast band is on gross, then × share | as the basis of #12 | Newspaper, Film Record, autopsy |
| 12 | **Weekly Studio Revenue** `weeklyGross[weekIndex] × studioShare (0.52)` | `openTheatricalRun` `economy.ts:53-73`; schedule `economy.ts:28-48`; credited `tick.ts:328-330` | `studio.cash`, `theatricalRuns[].{weekIndex,cumulative*}` | **tick step 3.5**, once per active run per week, 6 weeks; a run opened this tick is paid its week 1 here | `studioRevenue`, one per run per week (`tick.ts:335-341`) | — (inflow) | n/a | expected value only (`forecastProfitRange` `filmPackage.ts:557-563`) | **yes — the only revenue term** | `runView`/`activeRunViews`, `financeView`, `runProjection` (`adapter.ts:1751-1757`), `recap.films[].studioRevenue` |
| 13 | **Disengaged 100%-gross lump** `cash += boxOffice.total` | `tick.ts:238-247` | `studio.cash` | tick step 3, **only when `!economyEngaged`** | `boxOffice` (`tick.ts:240-246`) | — | n/a | n/a | **no** — recap counts only `totals.studioRevenue` (`studioRunRecap.ts:417-418`) | `financeTotals.boxOfficeLump`; recap `evidenceLimitations` (`studioRunRecap.ts:606-609`) |
| 14 | **Cancel a production** — 100% forfeiture | `applyCancel` `actions.ts:508-524` | `activeProductions[]` | never — "No refund (cash unchanged)" (`actions.ts:506-507`) | **no entry at all** | v | n/a | n/a | n/a | Assembly / production list |
| 15 | **Script / concept acquisition cost** | — | — | **DOES NOT EXIST** | — | — | — | — | — | `studioRunRecap.ts:151-152`: "There is no separate script-acquisition cost in the current rules." Concepts are never consumed (`selectConcepts` `adapter.ts:337-339`; `studioRunRecap.ts:315-316`) |
| 16 | **Any delayed / secondary revenue** (streaming, library, residuals, loans, debt, taxes) | — | — | **DOES NOT EXIST** | — | — | — | — | — | D-12 §24 non-goal (`D-12-economy-contract.md:237`); `studioRunRecap.ts:828` |

**Notes.**

1. **Ledger read-model.** `financeTotals` (`economyView.ts:216-235`) maps all 8 kinds 1:1 onto named
   fields via an **exhaustive** `Record<LedgerKind, keyof FinanceTotals>` — adding a kind is a compile
   error until `FinanceTotals`, `ZERO_TOTALS` and `KIND_FIELD` are extended. `periodSummary`
   (`economyView.ts:256-299`) buckets by week window and folds `signingBonus + freelancerFee +
   termination` into one `otherCash` field via a `default:` branch (`:290-291`) — a new kind lands
   there silently.
2. **The solvency gate.** `canAfford(state, amount)` (`employment.ts:69-76`): `cash − amount >= 0`,
   inclusive at the boundary. Only the **immediate** transaction is checked — never future payroll,
   overhead, or in-flight commitments. The UI mirrors it (never duplicates) through
   `economyView.affordability` / `commitmentPreview` (`economyView.ts:99-136`).
3. **Contract lifecycle.** `startWeek = market.tick` at signing; active while `startWeek ≤ week <
   endWeekExclusive` (`employment.ts:86-88`). Renewal window opens when `0 < (end − week) ≤ 12`
   (`employment.ts:144-147`); a renewal **replaces** the contract from the current week
   (`actions.ts:1182-1189`), discarding the unexpired remainder and charging a fresh full bonus.
   Expiry is tick step 8 (`tick.ts:489-498`): `endWeekExclusive <= currentTick + 1` → removed, talent
   appended to `freeAgents`, **no cash effect** (step 7 already paid the final active week).
4. **Throughput ceiling.** `MAX_CONCURRENT_PRODUCTIONS = 2` × `PRODUCTION_TICKS = 8` ⇒ at most one
   release per 4 weeks. A film greenlit at tick *t* releases at *t + 8*.
5. **Off-ledger capital.** The studio's true endowment is **$26M** ($20M cash + the $6M recruitment
   fund), while `recap.capital.openingBalance` reports **$20M** — correctly, since the fund never
   touches cash.
6. **Marketing is unrecoverable post-release.** One `production` entry covers `negative + marketing`
   and never itemises them; the `Production` object is dropped at release (`tick.ts:140` keeps only
   `stillActive`) and `FilmResult` carries no `budget` field. For any released film the
   negative-vs-marketing split is **permanently unreconstructible**; `Concentration.budget`
   (`studioRunRecap.ts:135-140`) is a blended figure only.

---

## 2. THE GATE TABLE — `economyEngaged` / `employmentEngaged`

```ts
// employment.ts:47-49
export function employmentEngaged(state: GameStateV3): boolean {
  return state.founding !== null || state.contracts.length > 0
}
// employment.ts:57-59
export function economyEngaged(state: GameStateV3): boolean {
  return employmentEngaged(state)
}
```

Derived from real state, explicitly **not** a `SimulationFlags` object (`employment.ts:44-46`,
`:51-56`). The headless M0A corpus never engages — that is the seam that keeps the frozen acceptance
corpus byte-identical (D-12.21, `D-12-economy-contract.md:198`).

| Site | Engaged | Not engaged (M0A / legacy) |
|---|---|---|
| `tick.ts:157` | `const engaged = economyEngaged(state)` — the single read per tick | — |
| `tick.ts:203-205` | D-13 discoverability draw `z ~ N(0,1)` from `'discovery-v1'` | `z = 0`, no draw |
| `tick.ts:206` | `resolveReception(inp, rng, true, true, z)` | `(…, false, false, 0)` |
| `tick.ts:234-237` | open a 6-week `TheatricalRun`; **no** cash at resolution | `tick.ts:238-247` D-1 lump `cash += boxOffice.total`, kind `boxOffice` |
| `tick.ts:325-343` (step 3.5) | weekly Studio Revenue credited, one entry per active run per week | **step skipped entirely** |
| `tick.ts:476-482` (step 7.5) | overhead debited (additionally gated on `founding === null`) | **step skipped** |
| `actions.ts:391-392` | `computeForecast(inp, ctx, true, true)`; engaged central estimate drops the noisy offset (`forecast.ts:394`) — the draw is still taken so the stream advances identically | legacy noisy point estimate |
| `actions.ts:403` | engaged greenlight branch | `actions.ts:449-462` D-1 branch |
| `actions.ts:405-409` | exactly one craft lead required (D-11.13) | **not enforced** |
| `actions.ts:414-423` | assignee must be contracted or an available freelancer (D-11.12) | **absent — any talent is assignable** |
| `actions.ts:417-434` | contracted talent free; freelancers charged a fee | `actions.ts:451-453` charges `talent.salary` for **every** assignee |
| `actions.ts:437-440` | **solvency gate enforced** | **absent** |
| `actions.ts:467-476` | freeze `FilmParticipants` (→ enables D-14 career events) | `undefined`; no autopsy, no Star Power |
| `tick.ts:384` + `:410-431` | D-14 Star Power progression + `TalentCareerEvent` append (inside the `develop`-gated block; requires frozen participants) | never fires |
| `reception.ts:147-149`, `:412-413`, `:426`, `:553-570`, `:599` | budget realization delta, script-potential appeal, fame→opening Hill saturation, awareness-conditioned marketing, `ECONOMY_BOX_OFFICE_SCALE 0.7`, organic-awareness weight `0.52` | all zero / legacy constants (`MARKETING_HALF_SATURATION`, weight `0.6`) |
| `economyView.ts:20`, `:36` | weekly / projected overhead non-zero | return `0` |
| `adapter.ts:488-491` | roster/availability enforced | `assemblyAvailability` returns `{ canAssemble: true }` unconditionally |
| `adapter.ts:2239-2246` | `assignmentProjectCost` = 0 (contracted) or freelancer fee | `talent.salary` |

### 2.1 The engagement cliff — **DEFECT-CANDIDATE, pending Owner ruling**

`economyEngaged` is derived from `contracts.length > 0`. When the last contract ends the entire D-12
economy switches off — **whether by deliberate release or by natural expiry with no player action at
all** (`tick.ts:489-498` removes expiring contracts every tick).

Observed consequences at `contracts.length → 0`:

| Behaviour | Before | After |
|---|---|---|
| Active theatrical runs | paid weekly (`tick.ts:325-343`) | **step 3.5 skipped — runs freeze at their current `weekIndex`, remaining revenue never paid, `status` stays `'active'` forever** |
| Overhead | charged (`tick.ts:476-482`) | **not charged** |
| Greenlight solvency gate | enforced (`actions.ts:437-440`) | **absent** — a greenlight can drive cash arbitrarily negative |
| Craft-lead + roster rules | enforced (`actions.ts:405-423`) | **not enforced** |
| New release payout | 6-week run at share `0.52` | **single lump at 100% of gross** (`tick.ts:238-247`) |
| Participants / D-14 events | captured | **not captured** |

**Accounting consequence.** Two incompatible revenue models can coexist in one save's ledger:
`studioRevenue` at `0.52` and `boxOffice` at `1.0`. `financeTotals` keeps them in separate fields
(`economyView.ts:192-201`); `studioRunRecap` counts **only** `totals.studioRevenue`
(`studioRunRecap.ts:417-418`) while still counting the film's `production` cost in `totalCommitments`
(`:416`) — so a post-disengagement film's income is omitted from the recap's capital story while its
cost is not.

**Governance status.** Nothing in the engine, the UI, or `docs/` acknowledges this state. D-12.21
(`employment.ts:51-56`) anticipates *adding* an economy-without-employment case, not *losing*
engagement. **Flagged as DEFECT-CANDIDATE. Not fixed in D-16 (analysis-only milestone).** The Owner
ruling and the options are in `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md`.

---

## 3. THE RNG TABLE

**One persisted stream.** `GameState.rngState` — the *sim stream*. Deserialized once at `tick.ts:125`,
re-serialized once at `tick.ts:509`. Its **only** consumer is the §5.3 critic gaussian inside
`resolveReception` (`tick.ts:206` → `reception.ts:378`). It advances **iff** at least one film releases
this tick, by exactly **2 uniforms per release** — `gaussian()` deliberately does not cache the spare
Box–Muller deviate (`rng.ts:100-109`), so the advance-per-draw is a fixed, auditable function of
release count. `applyActions` never touches it.

**Eight derived purposes** (`RngPurpose`, `rng.ts:34-45`). `stream(seed, purpose, key) =
RngStream.fromSeed(`${seed}::${purpose}::${key}`)` (`rng.ts:182-184`) — stateless, recomputed on
demand, **never persisted, never advances `rngState`**. That is the whole replay guarantee: seed +
action sequence reproduces a run exactly.

| Purpose | Key | Drawn by / at | Notes |
|---|---|---|---|
| `worldgen` | per-aspect literal (`'talent-persona'`, `'concept-cost'`, `'market'`, …) | `worldgen.ts:428-442`, `:532-537`, `:592` | one stream per aspect, walked once per entity in generation order. Also reused for authored/custom/balanced talent (`actions.ts:605`, `:767`, `:923`) and scouting noise (`talentSummary.ts:439`) |
| `candidates` | `tick` | `candidates.ts:154` | keyed by tick, **not** by agent |
| `agent` | `tick` | `agents.ts:74` | RandomAgent's package pick |
| `forecast` | `productionId` | `forecast.ts:383` | one film-level gaussian offset; **engaged drops the offset from the central estimate but still takes the draw** (`forecast.ts:394`) |
| `migrate` | `${oldId}-${field}` | `save.ts:427` | D-9.15 legacy V1→V2 talent conversion only |
| `develop` | `${productionId}:${talentId}` | `tick.ts:405` | D-9.8 development; inside the `develop` gate (`tick.ts:384`) |
| `hiring` | `offer-${talentId}` · `freelancers-${epoch}` · `market-${epoch}` · `draft-${role}` | `employment.ts:179`, `:256`, `:274`, `:381` | `epoch = floor(week / HIRING_MARKET_ROTATION_WEEKS)`, rotation 13 wk (`tuning.ts:311`) |
| `discovery-v1` | `productionId` | `tick.ts:204` | D-13; **engaged-only** (`z = 0` otherwise), **versioned** so a recalibration can re-key cleanly |

**Notes.** `truncatedNormal` uses rejection, not clamping (`rng.ts:165-177`), so it consumes a variable
number of uniforms — used only in worldgen, never on the sim stream. Derived streams keyed by
`productionId`/`tick` yield the **same** draw for two different films greenlit at the same week under
the same seed: a feature for matched-pair A/B, a trap for variance estimation. Production ids are
order-dependent (`actions.ts:105-118`), so within-week greenlight order changes which film gets which
draw. No `Math.random` anywhere in `src/` or `tests/` (hygiene test).

---

## 4. THE SAVE TABLE

All five envelopes share `{ saveVersion, seed, state, broadcastCache }` and differ only in the `state`
type (`save.ts:82-122`). Each `GameStateVn` is anchored to the **frozen predecessor**, not to the live
`GameState`, which is what keeps a later milestone's field out of an earlier shape.

| Version | `state` type | Adds | Written? | Citation |
|---|---|---|---|---|
| V1 | `GameStateV1` = `Omit<GameStateV2,'talent'> & { talent: TalentV1[] }` | legacy scalar `skill` talent | **read-only** — nothing writes V1 | `save.ts:64-87` |
| V2 | `GameStateV2` | D-9 multi-discipline `Talent` | read-only | `save.ts:89-96` |
| V3 | `GameStateV3` = V2 + `{ founding, contracts, ledger, freeAgents }` | D-11 employment surface | read-only | `save.ts:98-105` |
| V4 | `GameStateV4` = V3 + `{ theatricalRuns }` | D-12 economy | read-only (readable, no longer written) | `save.ts:107-114` |
| **V5** | `GameState` = V4 + `{ careerEvents }` | D-14 Star Power ledger | **CURRENT** — `makeSave === makeSaveV5` (`save.ts:382-384`) | `save.ts:116-122` |

| Converter | Behavior | RNG | Citation |
|---|---|---|---|
| `convertV1ToV2` | migrates each talent's new fields from `stream(seed,'migrate',…)`; never mutates input; idempotent under `stableStringify` | derived `'migrate'` only | `save.ts:613-627` |
| `convertV2ToV3` | adds an **empty** employment surface (`founding:null, contracts:[], ledger:[], freeAgents:[]`) → the gate stays inactive | none | `save.ts:653-670` |
| `convertV3ToV4` | each released film becomes a `legacyCompleted` run (`studioShare 1.0`, `economyModelVersion 0`, `cumulativeStudioRevenuePaid = full gross`) — **recorded, never repaid** | none | `save.ts:697-709`; builder `economy.ts:77-92` |
| `convertV4ToV5` | adds an **empty** `careerEvents`; synthesizes no fictional history | none | `save.ts:717-726` |
| `migrateToV4` / `migrateToV5` | bring any known version forward; idempotent; `migrateToV5` is the live load-to-play entry | none | `save.ts:746-760` |

**Every converter carries `rngState` through UNCHANGED** (`save.ts:623`, `:664`, `:704`, `:714`).
`checkEnvelope` (`save.ts:197-224`) enforces, for every version: `seed` is a string; `state.seed ===
envelope.seed`; `deepEqual(broadcastCache, state.broadcastItems)` (the M14 rule). `validateSave`
(`save.ts:305`) dispatches and **loudly rejects unknown versions**. `exportSave` (`save.ts:396`)
validates then `stableStringify`s (`save.ts:133-164`) — sorted keys at every level, array order
preserved, non-finite → `null`, throws on `bigint`/`symbol`. This is the only sanctioned identity
comparator.

**Persisted vs derived.** Persisted: `seed`, `rngState`, `market`, `era`, `studio`, `talent[]`,
`concepts[]`, `broadcastItems[]`, `coverageContexts[]`, `founding|null`, `contracts[]`, `ledger[]`,
`freeAgents[]`, `theatricalRuns[]`, `careerEvents[]`. Derived and never persisted: `employmentStatus`
(`employment.ts:285`), the hiring/freelancer market ids (`employment.ts:252-280`), the entire
`economyView` surface (`economyView.ts:1-7` — "display-only… The sim never reads any of these"), and
`studioRunRecap(state)` (D-15, `studioRunRecap.ts:410`). `ledger[]`, `theatricalRuns[]`,
`careerEvents[]`, `releasedFilms[]` and `broadcastItems[]` are **append-only, never pruned**.

**Precedent:** a new persisted `GameState` field has always minted a new `SaveFileVn` (V3, V4, V5 each
for one field group). A new `LedgerKind` alone does not — but it *is* a compile error until
`economyView.ts:192-225` is extended.

---

## 5. KNOWN DIVERGENCES & DUPLICATIONS

Every item here is **DOCUMENTED DEFECT/DIVERGENCE — NOT FIXED IN D-16** (analysis-only milestone).
No test currently fails on any of them; several are latent-only.

### 5.1 `releaseTalent` is ungated, contradicting D-12.11
`applyReleaseTalent` (`actions.ts:1211-1233`) debits `terminationCost` with **no `canAfford` call**, and
`releaseTalentAction` (`adapter.ts:1858-1864`) adds no guard. D-12.11 requires the gate for "contract
signing, renewal, freelancer engagement, production greenlight, marketing commitment, and any other
voluntary immediate expense" (`D-12-economy-contract.md:157`).
**Consequence:** a studio at `cash = 1000` can release a contract and land at large negative cash; the
contract text and the code disagree. (Counter-argument the ruling must weigh: terminating *reduces*
future obligation, so a naive gate would trap a studio that cannot afford to shed payroll.)

### 5.2 Two live "Studio Revenue for a film" definitions — plus a third copy
| Definition | Basis | Site | Rendered by |
|---|---|---|---|
| `run.cumulativeStudioRevenuePaid` | **cash to date** | `studioRunRecap.ts:432,436` | D-15 recap `films[].studioRevenue` / `contribution` / `roi` |
| `Σ weeklyGross × studioShare` | **full-run projected** | `studioRevenueForFilm` `adapter.ts:1170-1174` | `filmRecordView.profit` (`adapter.ts:3568,3577`), `releaseNewspaper` (`adapter.ts:3596-3604`), `runProjection` (`adapter.ts:1751-1757`) |
| `film.boxOffice.total × STUDIO_RENTAL_BLENDED` | **full-run projected, run-blind** | `releaseScorecard` `adapter.ts:1769` | release scorecard / result label |

**Consequence:** while a run is live, the Film Record and the newspaper show a **profit** the recap
shows as a smaller **contribution**; they converge only on completion. `runProjection` labels itself
"Projected"; `filmRecordView.profit` and `releaseNewspaper` carry no qualifier. The third copy
(`adapter.ts:1769`) is run-blind, so for a `legacyCompleted` run (share `1.0`) it reports `gross × 0.52`
rather than the full gross actually credited. The recap does disclose the to-date/projected split
(`studioRunRecap.ts:601-605`).

### 5.3 Two runway definitions in play (contract text vs code)
`D-12-economy-contract.md:172` defines `currentWeeklyBurn` as "existing payroll + existing overhead +
existing committed expenses (in-flight production commitments already made)". The code's
`weeklyBurn` (`economyView.ts:27-29`) is **payroll + overhead only**, with the deliberate rationale at
`economyView.ts:24-26` that a greenlight's negative + marketing are one-time debits already reflected
in cash.
**Consequence:** the shipped runway is the code's definition; the contract sentence reads as if
in-flight commitments recur weekly. A reader reconciling the two gets different numbers.

### 5.4 Break-even excludes the 14-week fixed-cost cycle
`breakEvenGross(committedCost) = committedCost / 0.52` (`economyView.ts:143-145`, duplicated at
`filmPackage.ts:623`) — displayed as "Break-even Theatrical Gross" (`Assembly.tsx:1223`, `:1285`).
Payroll and overhead are excluded from it, from `forecastProfitRange` (`filmPackage.ts:553-563`) and
from D-15 contribution — by design (D-12 §8, `D-12-economy-contract.md:125`).
**Consequence:** a film occupies `PRODUCTION_TICKS (8) + THEATRICAL_WEEKS (6) = 14` weeks of unallocated
fixed cost. At a `$39K/wk` drain that is `$546,000`, requiring `546,000 / 0.52 = $1,050,000` of gross
beyond the displayed break-even just for the studio to stand still. The only surface that hints at this
is "Post-Greenlight Runway" (`Assembly.tsx:1197` → `commitmentPreview.postRunway`), which is
conservative in a different direction: `expectedWeeklyRunRevenue` counts **already-active runs only**
(`economyView.ts:58-60`), so the film being greenlit contributes nothing to its own runway.

### 5.5 Four "committed cost" definitions coexist
| Consumer | Cost basis | Source |
|---|---|---|
| **actual cash at greenlight** (engaged) | `negative + marketing + Σ freelancerFee` (`$0` for contracted talent) | `actions.ts:399,424-441` |
| **player-facing profit range / break-even** | `negative + marketing + Σ talent.salary` (raw `salaryCurve`) | `filmPackage.ts:553`; `adapter.ts:2831-2834` |
| **D-6 confidence ROI** | `negative + marketing + writer+director+cast salaries` — **excludes craft** | `standing.ts:82-84`; ctx built `tick.ts:262-273` |
| **D-15 recap contribution** | `−Σ ledger[production, freelancerFee]` — the true cash | `studioRunRecap.ts:298-306`, `:416` |

**Consequence:** the player-facing break-even understates the real cash commitment for a freelance crew
and overstates it for a fully contracted crew (where the film costs no salary cash at all). Neither the
display nor D-6's ROI matches what the ledger records.

### 5.6 Confidence ROI uses full theatrical gross, not Studio Revenue
`standing.ts:126`: `roi = (r.boxOffice.total − committedCost(ctx)) / cost`. In the engaged economy the
studio never receives the gross — it receives `0.52` of it.
**Consequence:** `commercialConfidence` is systematically overstated by ≈`1/0.52 ≈ 1.92×` relative to
real profitability. It is display-only (read by `broadcast.ts` alone, never by `computeBoxOffice`), so
this is a truthfulness divergence, not a balance one — but the one channel nominally about "financiers
trusting you with money" rises while the studio's cash falls.

### 5.7 Five copies of `requiredNegative` (plus two structural variants)
`baseNegativeCost × budgetDemandMultiplier × era.costScale`, written out verbatim at
`reception.ts:221` (authoritative), `forecast.ts:124`, `filmPackage.ts:576`, `candidates.ts:267`,
`adapter.ts:539`. Two further variants compute the same product with different operands:
`studioRunRecap.ts:370` (min-demand shape) and `:382` (`STANDARD_DEMAND`).
**Consequence:** seven sites must be edited in lockstep for any change to how a film's required
negative is priced; none is guarded by a shared helper.

### 5.8 Six copies of the per-film committed-cost filter
`ledger.filter(e => e.productionId === id && (e.kind === 'production' || e.kind === 'freelancerFee'))` —
`studioRunRecap.ts:301`, `adapter.ts:1724`, `:1737`, `:3564`, `:3590`,
`src/harness/run-roster-balance-study.ts:237`.
**Consequence:** the exact failure shape of Lesson AC (`docs/LESSONS-LEARNED.md`) — a value computed by
a parallel formula that *could* diverge even though it currently does not.

Two smaller families: the overhead formula appears **3×** (`tick.ts:477`, `economyView.ts:21`, `:37`);
runway appears as **3 near-copies** (`economyView.ts:78-85`, `:90-94`, `:123-126`); break-even appears
**2×** (`economyView.ts:144`, `filmPackage.ts:623`); `filmAudienceScore` appears **2×**
(`studioRunRecap.ts:309`, `adapter.ts:1740`).

### 5.9 Comment drift in the read-model that claims to mirror the engine
`economyView.ts:17` says overhead "mirrors `tick.ts:403-404` EXACTLY" — the actual site is
`tick.ts:476-481`. `economyView.ts:43` says "Mirrors `tick.ts:311-312`" — the actual site is
`tick.ts:328-330`. `D-12-economy-contract.md:122` cites `reception.ts:437` for `marketingQuality` — the
actual site is `reception.ts:558`.
**Consequence:** the formulas are correct; only the pointers rotted. Since these comments are the
mechanism by which mirroring is *audited*, the rot erodes the audit path itself.

### 5.10 `weeklyBurn` is not founding-guarded on payroll
`tick` step 7 skips payroll entirely while `state.founding !== null` (`tick.ts:465`).
`economyView.weeklyOverhead` **is** founding-guarded (`economyView.ts:20`), but `weeklyBurn`
(`economyView.ts:27-29`) adds an unguarded `weeklyPayroll(state)`.
**Consequence:** during founding, `financeView.weeklyBurn` / `runway` report a payroll the engine is
not charging. Currently latent — the Founding screen uses `foundingRunwayPreview`
(`FoundingScreen.tsx:90`) — but any future surface calling `financeCard` mid-founding inherits it.

### 5.11 Recap `standardPackage` models an unbuildable shape and is not parity-tested
`STANDARD_DEMAND = 1.0` (`studioRunRecap.ts:62`), but no legal story shape has
`budgetDemandMultiplier === 1.0` (closest: `0.9975`). `standardPackage` also **rounds** its negative
(`:382`) while `cheapestPackage` deliberately does not (`:368-372`, to match the greenlight action
bit-for-bit). `ui/src/engine/recap-parity.test.ts` covers `cheapest` only.
**Consequence:** `position.standard` is a documented recap *convention* with ~0.25% modelling error and
no action-parity guard, unlike `position.cheapest`.

### 5.12 The engagement cliff
See §2.1 — the largest documented defect-candidate. **Not fixed in D-16.**

---

## 6. Cross-references

| Document | Relationship to this matrix |
|---|---|
| `docs/D-12-economy-contract.md` | The economy contract in force. §3/§8 define contribution and the payroll/overhead non-allocation (`:125`); D-12.6 the `0.52` share (`:95`); D-12.10 the two new ledger kinds (`:151`); D-12.11 the solvency gate (`:157`); D-12.12 no game-over (`:163`); §16 runway (`:172`); D-12.21 M0A byte identity + "no new sim-stream draws" (`:198`); §24 non-goals (`:237`). |
| `docs/D-13-capital-frontier-closure.md` | Authorized the script cost↔potential correlation, delivery-gated script potential, conditional opening discoverability (the `'discovery-v1'` derived stream), and restored marketing value — with **no** broad production-budget retune. |
| `docs/D-14-talent-career-impact-closure.md` | Star Power progression + `SaveFileV5`; its §"separate findings" is the origin of both D-15 and the D-16 economy question. |
| `docs/D-15-studio-run-recap-closure.md` | Read-only explainability milestone; `:142-145` preserves the non-goals ("no financing, debt, loans, bankruptcy, receivership, grants, emergency cash, or recovery mechanic"); defers economy & recovery balance to a separate owner ruling — the decision D-16 exists to inform. |
| `docs/D-15-studio-run-recap-phase1.md` | The D-15 source matrix this document follows in form; canonical definitions of theatrical gross, Studio Revenue, committed cost, contribution, weekly burn, and runway. |
| `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md` | The D-16 report: simulation evidence, the engagement-cliff ruling request, and every option and recommendation. **All decisions live there, not here.** |
| `out/d16-economy-lab/analysis/` (gitignored) | A1 governance archaeology · A2 cashflow accounting · A3 film economics · A17 determinism/save/replay — the audits this matrix is distilled and corrected from. |

---

*D-16 deliverable #2. Read-only engineering reference; documents behavior at `33eb33ae` and changes
nothing.*
