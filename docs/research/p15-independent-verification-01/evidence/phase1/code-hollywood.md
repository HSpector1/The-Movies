# P15 Phase-1 Evidence — Current Accepted Code (592e926): Studio Identity, Rivals, Employment, Release History, Chart, Industry Projection, Calendar

**Scope:** read-only reconnaissance of the Owner-accepted P12 R05 TypeScript runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` (extracted copy at `scratchpad/accepted-592e926/`). All `file:line` citations below are into that extraction. Design/register documents are cited separately and are **not** code truth. Nothing was modified; no build, test, or game launch was run.

**Save generation of this snapshot:** `GameState = GameStateV19 = GameStateV18 & { hollywood: HollywoodState | null }` (`src/core/types.ts:1689-1690`); `makeSave()` emits `SaveFileV19` (`src/core/save.ts:6046-6048`). The P15 package/annex were written against `7811377` / save V15 and describe a pre-P12 world ("rival studios/projects — absent at accepted base", P15-PACKAGE §9). That is no longer true; see the corrections section at the end.

Confidence tags: **HIGH** = read directly in code; **MEDIUM** = inferred from code paths without executing; **LOW** = not established by inspected sources.

---

## 1. StudioIdentity, minting, arrival schedule, reserved IDs, and the (absent) failure/floor logic

### 1.1 The `StudioIdentity` record — fields (HIGH)

`src/core/hollywoodTypes.ts:6-17`:

| Field | Type | Notes |
|---|---|---|
| `studioId` | string | immutable; minted via `uniqueIdentity()` against a taken-set (`hollywood.ts:18-23`, `:116`, `:121`) |
| `role` | `'player' \| 'rival'` | |
| `row` | number | 0 = player, 1..9 = rivals; validator pins `row === index` (`hollywoodValidation.ts:85`) |
| `name`, `mark`, `color` | string | display identity; rivals must equal the starting manifest (`hollywoodValidation.ts:80-83`) |
| `founding` | `HistoricalDate \| {kind:'campaign';week} \| null` | authored pre-1920 year for fresh incumbents, campaign week for scheduled entrants, `null` when unknown (migration) |
| `eligibleWeek` | number | fixed arrival week |
| `enteredWeek` | `number \| null` | `null` = reserved, not yet present |
| `recordedFromWeek` | `number \| null` | history-recording boundary |

**There is NO `status` / operational-state field (active / dormant / closed).** The type has exactly the ten fields above, and the save validator enforces *exact keys* on every identity: `exact(s,['studioId','role','row','name','mark','color','founding','eligibleWeek','enteredWeek','recordedFromWeek'])` (`hollywoodValidation.ts:75`). Adding a status field therefore is not a silent additive change; it changes the V19 exact-key contract. The P12→P13 producer handoff says the same in words: "Current `StudioIdentity` has no dormant/closed status field; the older contract's vocabulary is a future seam, not implemented corporate transitions" (`authority/P12-TO-P13-PRODUCER-HANDOFF.md:27`). **HIGH.**

The only "presence" signal in code is `enteredWeek !== null` (used by `industrySummary().activeStudioCount`, `bridge/industry.ts:23`, and by every cohort filter, e.g. `hollywoodTick.ts:307`, `bridge/industry.ts:73`).

### 1.2 How identities are minted (HIGH)

`initializeHollywood()` (`src/core/hollywood.ts:111-136`):

- computes a per-seed world key `hollywoodWorldKey(seed)` (`:107-109`, derived RNG stream `'hollywood-v1'/'identity'`);
- mints the player id `studio-${key}-player` (`:116`) and pushes the player identity with `row:0`, name `'Your Studio'`, mark `'YOU'`, `eligibleWeek:0`, `enteredWeek = state.market.tick` (`:117-119`);
- for each of the nine `HOLLYWOOD_STARTING_MANIFEST.studios` templates pushes a rival identity `studio-${key}-rNN` with `role:'rival'`, `row:index+1`, `eligibleWeek: RIVAL_ARRIVAL_WEEKS[index]`, `enteredWeek:null`, `recordedFromWeek:null` (`:120-125`);
- creates the `HollywoodState` root with empty `businesses/employment/films/receipts`, `chart:null`, `previousChart:null` (`:126-129`);
- immediately enters any rival whose `eligibleWeek <= market.tick` (`:132-134`) and mirrors the player's existing contracts into the industry ledger (`:135`).

The nine templates are authored fiction (`src/core/hollywoodStartingData.ts:3-7` says so explicitly): Bellwether Pictures, Rose Lantern Films, Night Orchard Productions, Silver Current Pictures (with `founded`, authored `standing`, `names`, and two authored `films` each), then Marigold Motion Pictures, Blackthorn Screenworks, Trailhead Pictures, Copper Kite Films, Bright Meridian Studios (capital, anchors, policy only) (`:11-36`).

### 1.3 `RIVAL_ARRIVAL_WEEKS` and the campaign-year mapping (HIGH)

`src/core/calendar.ts:3`: `RIVAL_ARRIVAL_WEEKS = [0, 0, 0, 0, 520, 988, 1560, 1872, 2548]`.
`campaignDate()` (`calendar.ts:13-21`): `year = 1920 + floor(w/52)`, `weekOfYear = 1 + w % 52`.

| Row | Studio | eligibleWeek | Campaign date | Cohort |
|---|---|---:|---|---|
| 1 | Bellwether Pictures | 0 | 1920 · Week 1 | opening incumbent (authored) |
| 2 | Rose Lantern Films | 0 | 1920 · Week 1 | opening incumbent (authored) |
| 3 | Night Orchard Productions | 0 | 1920 · Week 1 | opening incumbent (authored) |
| 4 | Silver Current Pictures | 0 | 1920 · Week 1 | opening incumbent (authored) |
| 5 | Marigold Motion Pictures | 520 | 1930 · Week 1 | scheduled entrant |
| 6 | Blackthorn Screenworks | 988 | 1939 · Week 1 | scheduled entrant |
| 7 | Trailhead Pictures | 1560 | 1950 · Week 1 | scheduled entrant |
| 8 | Copper Kite Films | 1872 | 1956 · Week 1 | scheduled entrant |
| 9 | Bright Meridian Studios | 2548 | 1969 · Week 1 | scheduled entrant |

So: **four opening rivals, five later entrants, nine total, plus the player = ten identities.** This matches the R05 Owner decision table (`docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md:65-72`), which also states the five years are "our fixed choices inside the original guide's documented windows, not recovered exact original dates" (`:74`). Scheduled entry is executed by the outer tick after the week is finalized (`src/core/tick.ts:1038-1042`: any rival with `enteredWeek===null && eligibleWeek<=market.tick` is entered with origin `'scheduled'`), and `enterRival()` is idempotent (`hollywood.ts:144`).

### 1.4 The reserved-ID rule (HIGH)

`hollywoodValidation.ts:72`: `requireFact(studios.size === 10 && h.identities.length === 10,'exactly player plus nine reserved studios')`. Related pins: id shape per row (`:77-78`), fixed arrival policy `s.eligibleWeek === RIVAL_ARRIVAL_WEEKS[index-1]` (`:86`), a never-entered identity must have no business and must not be overdue (`:91-93`), and an entered rival's `enteredWeek === max(eligibleWeek, originWeek)` (`:98`). The count of businesses must equal the count of entered rivals (`:331`). A reserved future identity is therefore not an employer, not chart-visible, and holds no money.

### 1.5 Minimum active-rival floor / replacement logic — **does not exist in code** (HIGH)

Searches for `floor`, `minimum`, `replace`, `entrant`, `dormant`, `closed`, `bankrupt`, `insolven`, `liquidat`, `auction` across `src/core/hollywood*.ts`, `industry*.ts`, `calendar.ts`, `bridge/industry.ts` return only: the employment reason literal `'replacement'` (a *replacement hire*, `hollywoodTypes.ts:67,99`; `hollywoodTick.ts:87,128`), one validator message about "replacement renewal" (`hollywoodValidation.ts:399`), and one comment "future entrants are attached by the outer tick" (`hollywoodTick.ts:292`). No code path removes, suspends, closes, replaces, or re-schedules a studio. `Math.floor` hits are arithmetic.

**What happens to a rival that runs out of money (MEDIUM, inferred from code paths):** `moveRivalMoney()` has no lower bound (`hollywood.ts:31-42`) and the validator only requires `number(b.account.cash)` with no minimum (`hollywoodValidation.ts:212`). Each week the business unconditionally pays payroll, overhead (`OVERHEAD_BASE` 15,000 + 1,500/employee) and facility Opex (23,500/week for the fixed four facilities) (`hollywoodTick.ts:279-282`; `tuning.ts:419-420, 686, 699, 710, 731`). Hiring and commissioning are reserve-gated (`hollywoodTick.ts:98, 126, 176`), so a cash-starved rival stops renewing/commissioning, its 208-week contracts expire into `freeAgents`, and it keeps burning overhead indefinitely — a de facto "dormancy" with **no status, no event, no exit, and no floor**. This is exactly the "Negative cash alone is not bankruptcy" boundary the handoff states (`P12-TO-P13-PRODUCER-HANDOFF.md:15`).

### 1.6 What the P12 design/register documents SAY (design, not code)

| Source | Location | What it says (paraphrase / short quote) |
|---|---|---|
| P12 package | `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:167` | "OPEN QUESTION — Closure. No reliable inspected source establishes retail rival bankruptcy, disappearance, or acquisition." |
| P12 package | `:486` (identity table) | active/historical state: "active, dormant/closed later; never delete identity" |
| P12 package §30 | `:869` | "Rival failure is allowed even though the player has no mandatory hard-bankruptcy game-over." |
| P12 package §30 | `:874-879` | conceptual lifecycle "operating; constrained; distressed; dormant/restructuring; recovered or closed" |
| P12 package §30 | `:885` | envelope **6–10 active AI rivals**, stress cap **12**, entrants "maintaining a minimum of **3 active AI rivals** after the early game. These are design/benchmark bounds, not final balance." |
| P12 package §31 | `:903` | "The original demonstrates staggered entry but not failure/replacement." |
| P12A register | `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md:93` (ID-011) | "Keep active/dormant/closed/historical vocabulary without implementing churn in P12A" — disposition: dormant/closed → P15B |
| P12A register | `:114` (SIM-015) | implemented "four fresh incumbents and fixed 520/988/1560/1872/2548 arrivals, nine plus player… later P15B mass-failure floor proof remains deferred" |
| P12A register | `:166` (HIS-013) | closure law "Vocabulary/seam ready; behavior re-homed P15B" |
| P12A register | `:197` (INT-010) | "Bankruptcy, recovery, closure/replacement/churn remain P15B." |
| P12A register | `:232` (SAF-008) | "Do not implement distress, recovery, closure, or post-initial entrants in P12A… no distress/recovery/dormancy/closure/replacement/churn transitions or resurrection top-ups" |
| R05 Owner decisions | `docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md:35` | "Transfer only this initial nine-studio rollout's scheduling/atomic entry into P12. Other corporate fate/churn remains P15B." |
| R05 Owner decisions | `:118` | "Businesses can succeed or struggle financially without this checkpoint claiming to implement bankruptcy/acquisition systems." |
| Consumer contract | `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:209` | `StudioOperationalState` "Canonical active/dormant/closed vocabulary and state commit; P12A need only activate the lawful subset" |
| Consumer contract | `:256-260` | `RivalStudioBecameDormant / Recovered / Closed` = "P15B PRODUCER / P12 STATE COMMIT… Not P12A"; replacement entrants = "P15B PRODUCER" |
| Consumer contract | `:346` | "Negative cash alone is not bankruptcy, and current-pace runway is not a new P15B distress threshold." |
| Horizon ruling | `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:56-62` | player no-hard-bankruptcy ruling; does not prohibit future rival distress/bankruptcy/receivership/sale/merger "when and if the Hollywood Ecosystem is authorized… This ruling adds no rival mechanics now." |
| Roadmap | `authority/P13-P15-LONG-RANGE-ROADMAP.md:679` | later entrants: "deterministic bounded P15B eligibility with P12's minimum three active AI rivals" |

Net: the "minimum three active AI rivals" is a **design recommendation/benchmark** (P12 §30) carried forward by the roadmap; it has **no code representation**. The `StudioOperationalState` vocabulary named by the consumer contract was never materialised as a type in 592e926.

---

## 2. `RivalBusiness` — resources, decision, project→release, conservation

### 2.1 Resources (HIGH) — `hollywoodTypes.ts:79-95`

`account: RivalAccount` (`openingBalance`, `openingBasis:'before-capacity-and-signing'`, `cash`, `periods[]` of `RivalFinancePeriod` with per-kind `movements`; kinds = capacity, signing, payroll, overhead, facilityOpex, development, production, marketing, studioRevenue — `:47-61`, `hollywood.ts:15-16`), `standing: Standing` (three channels), `operations: StudioOperations` (fixed four facilities: Development & Casting cap 2, one Production Stage, Scenery Shop cap 2, Post Building cap 2 — `hollywood.ts:98-105`), `development: ScriptDevelopment`, `productions[]`, `activeScriptOrdinals[]`, `activeRunFilmOrdinals[]`, `releaseAuthority`, `runs: TheatricalRun[]`, `projects: RivalProjectCosts[]`, `nextDecisionWeek`, and `policy {version:1, affinities per genre (5 for anchors, else 1), negativeScale, marketingRatio, reserveWeeks}` (`hollywood.ts:156-157`). Entry pays capex once (2.4M + 1.15M + 0.85M + 1.5M = 5.9M; `hollywood.ts:158-160`, `tuning.ts:684,697,708,729`) and signs six people on 208-week contracts (`hollywood.ts:167-187`), and throws if the endowment cannot cover it (`:188`).

### 2.2 How a rival decides (HIGH) — `hollywoodPolicy.ts` and `hollywoodTick.ts:139-210`

- Cadence: `HOLLYWOOD_DECISION_WEEKS = 1` (`tuning.ts:27`), so `decide()` runs weekly (`hollywoodTick.ts:140-141`).
- Greenlight: only when it has **zero** productions in flight (`:146`), a free director, three free actors, one craft (`:147-150`), and `chooseIndustryPackage(...lockScreenplay:true)` returns a candidate whose expected operating margin beats holding (`hollywoodPolicy.ts:60`). Cash available is `cash − reserveWeeks × weekly operating cost` (`hollywoodTick.ts:156`).
- Commission: at most two active screenplays (`:176`, validator `:259`), only with cash ≥ reserve, a free writer, and full company; genre drawn from policy affinities on a derived stream (`:180-182`); shape/promise/budget picked by `chooseIndustryPackage(lockScreenplay:false)`.
- The chooser is a bounded menu (6 shapes × 6 billings × 3 negative scales × marketing menu) scored on *perceived* inputs only — hidden actual persona/strength "never become AI information" (`hollywoodPolicy.ts:19-28, 31`). Scoring uses `STUDIO_RENTAL_BLENDED` (0.52) share of expected gross minus spend, minus a small preference cost for departing from the authored marketing ratio (`:53-59`).
- Staffing (`staff()`, `:85-137`): renew own people inside the same 12-week renewal window the player uses (`employment.ts:201-204`), fill only role deficits, prefer its own expired people, otherwise any unemployed talent, otherwise **mint a new person** (`:121-124`); every hire is reserve-gated. Player contracts and founding applicants are in the `unavailable` set (`:109`): no poaching.

### 2.3 Projects → releases (HIGH) — `advanceHollywoodWeek()` `hollywoodTick.ts:213-290`

Per business, per week: staff → decide → `operateStage()` (assign director, clear scenery load-in, schedule take — `:69-82`) → release commitment when lawful (`:225-227`) → `advanceManagedProductions()` (the same operations engine the player uses) → for each production reaching `remainingTicks===0`: `resolveReception()` on derived streams (`:238`), `buildFilmResult`, append a `LiveIndustryFilm` to `h.films` (`:242-247`), open a `TheatricalRun` (`:248`), `updateStanding()` (`:250-252`), emit `filmReleased` receipt (`:253`), push a growth record so shared career law updates the people (`:254-256`), mark the script produced (`:257`). Then runs pay weekly `studioRevenue` and settle after `totalWeeks` with a `filmSettled` receipt (`:262-276`); awareness drifts toward the anchor (`:277-278`); payroll/overhead/opex are debited (`:279-282`); due script work completes and reviews auto-accept (`:283-287`). Ordering relative to the outer tick: `advanceHollywoodWeek` runs at `currentTick` (`tick.ts:893`) and `finishHollywoodWeek` runs after `market.tick` becomes `currentTick+1` (`tick.ts:999, 1043`).

### 2.4 What `hollywoodValidation.ts` conserves — the invariant list (HIGH)

Root/identity: exact 18 root keys (`:59-60`), version/policy/manifest (`:61-62`), origin ∈ {fresh, migration}, fresh ⇒ originWeek 0 (`:63-65`), worldId = seed-derived (`:70`), exactly 10 identities (`:72`), id shape, manifest display identity, stable row/role, fixed arrival, founding shape, entered/not-entered chronology (`:74-101`), player identity first (`:102`).

Films: authored films only in fresh worlds, only rows 1–4, byte-equal to manifest, credits match the entry contracts (`:113-129`); live films have exact keys, result identity, chronology ≥ owner entry (`:131-138`); owner entered (`:141`); unique ids (`:142`); six complete canonical credits with exact names (`:143-150`).

Employment: exact keys, unique contractId, owner entered (`:158-160`), contract id encodes studio/talent/startWeek (`:163`), chronology (`:164`), **reason vocabulary** — player: renewal / player-contract / existing-player-contract; rival: entry / renewal / replacement (`:165`), endedWeek bounds (`:167`), **no overlapping employers per person** (`:168-171`), **no double employer vs. player contracts, no rival holds a founding applicant** (`:172-175`), player rows mirror actual `state.contracts` (`:176`), `activeEmploymentOrdinals` = exactly the open intervals (`:178-180`).

Business: exact keys, unique/entered/rival owner (`:204-205`), decision boundary cadence (`:207`), policy bounds (`:208-211`), **money reconciliation**: periods chain opening→closing, per-kind sign constraints, closing = cash (`:212-224`), opening balance = template capital (`:226`), **capacity paid exactly once** (`:228-229`), signing = Σ signing bonuses (`:236`), payroll = Σ person-weeks × weekly salary (`:237-238`), overhead = elapsed × base + person-weeks × per-employee (`:240`), facility Opex = elapsed × capacity opex (`:241`), dev/production/marketing = Σ project costs (`:242`), studioRevenue = Σ film revenue received (`:245`); productions have frozen participants, unique ids, historical employer authority for every seat (`:247-256`); no person holds two simultaneous assignments across player and every rival (`:183-202, 257`); ≤2 active screenplays (`:259`); facilities equal the costed configuration (`:266-269`); operations/development invariants (`:270-275`); release commitments only for tick-1 productions (`:276-280`); project cost rows match scripts/concepts/announcements (`:281-292`); runs equal the canonical schedule prefix (`:301-309`); settled films match canonical totals and dates (`:310-322`); credits = frozen participants (`:323-328`).

Cross-cutting: businesses = entered rivals (`:331`), every concept has one costed owner (`:332`), career events = 6 × live films, each matching its film (`:334-339`), receipts: exact keys per kind, monotone weeks, entered owner, contiguous `industry-event-N` ids with `nextReceipt === receipts.length` (no erasure, no gaps) (`:345-381`), one entry receipt per business (`:382-389`), each employment interval has exactly one start receipt and exactly one end receipt iff it ended (`:390-400`), termination receipts only for the player and backed by a ledger `termination` row (`:394-395`), announcements/releases/settlements match (`:402-411`), chart cadence and cohort (`:412-428`), player history references resolve (`:429-446`).

---

## 3. Employment

### 3.1 Types and indexes (HIGH)

`IndustryEmployment` = `{contractId, studioId, terms: Contract, endedWeek, reason}` (`hollywoodTypes.ts:62-68`); `Contract` = talentId, annualSalary, signingBonus, startWeek, endWeekExclusive, termWeeks 52..208 (`types.ts:336-343`). `activeEmploymentOrdinals` is the index of open intervals (`hollywoodTypes.ts:116`) and the validator forces it to equal `{i | endedWeek===null && endWeekExclusive > tick}` (`hollywoodValidation.ts:180`).

### 3.2 Transitions (HIGH)

- **Player mirror:** `recordPlayerEmployment()` (`industryEmployment.ts:10-35`) diffs `state.contracts` against the player's active industry rows after **every** action (`actions.ts:3019`) and at initialization (`hollywood.ts:135`). It closes vanished rows with `endedWeek = week` and emits `expiry` if `week === endWeekExclusive`, else **`termination`** (`:25`); it opens new rows as `player-contract`, `renewal` (same talent ending and starting), or `existing-player-contract` (migration observation) (`:27-33`).
- **Rival renewal/replacement:** `staff()` (`hollywoodTick.ts:85-137`) — renewal closes the old interval early (`endedWeek=week`) and opens a new one with reason `'renewal'` (`:99-106`); deficits are filled with reason `'renewal'` if the same expired person returns, else `'replacement'` (`:128-133`).
- **Expiry → freeAgents:** `finishHollywoodWeek()` (`hollywoodTick.ts:293-316`) closes every open interval with `endWeekExclusive <= week`, emits `expiry` receipts (`:296-305`), and unions the expired talent into `state.freeAgents` (`:314`). Player contracts expire separately in the tick (`tick.ts:961-970`).
- **One-employer exclusivity:** enforced at hire time (`unavailable` set, `hollywoodTick.ts:109-110`; player-side `signableUniverse`/`hiringMarketIds` exclude `rivalEmployment()` holders, `employment.ts:312-315, 349-357`) and at validation (`hollywoodValidation.ts:168-175`). `studioEmployerId()` resolves the current employer, player first (`hollywood.ts:60-65`).

### 3.3 Termination today — who can call it (HIGH)

The only termination path is the **player action `releaseTalent`** (`actions.ts:2694-2727`): it pays `terminationCost = 0.5 × remaining guaranteed salary` (`employment.ts:178-180`; `tuning.ts:391`), removes the contract, adds the person to `freeAgents`, and the post-action mirror then records the industry `termination` receipt. The validator forbids `termination` for any non-player studio (`hollywoodValidation.ts:357-358`) and requires the matching ledger row (`:394-395`); rival interval reasons are limited to entry/renewal/replacement (`:165`) and any early-ended rival interval must be explained by a same-week renewal (`:399`). **Rivals cannot terminate anyone, and nothing can terminate a rival's contracts on the rival's behalf.**

### 3.4 `PersonId` immutability (HIGH)

`Talent.id` is a plain string minted once (`types.ts:107-108`); credits, career events (`eventId = filmId:talentId`, `types.ts` TalentCareerEvent), employment rows, and history all join by exact id; the validator requires every credit/interval/event to resolve to an existing `state.talent` id (`hollywoodValidation.ts:146-147, 164, 336`). Supplied industry people are appended to `state.talent` and never removed (`hollywood.ts:176`, `hollywoodTick.ts:127`). No code renames or re-mints ids.

### 3.5 A talent whose employer disappears — **no such state exists** (HIGH)

A business can only be created by `enterRival` and is never removed; the validator requires `businesses.size === entered rivals` (`:331`) and every contract's owner to be entered (`:160`). There is no orphan-handling code because there is no orphaning transition. If a P15B closure were to end rival contracts early, the current validator would reject the save at three points (`:165` reason vocabulary, `:357-358` end-receipt reasons, `:399` early-end-needs-renewal).

---

## 4. Release history and the industry event root

### 4.1 Films (HIGH)

`IndustryFilm = AuthoredFilm | LiveIndustryFilm` (`hollywoodTypes.ts:19-46`). Authored films (`provenance:'authored-start/v1'`) carry a pre-1920 `released` year and settled scores/grosses, exist only for rows 1–4 in fresh worlds, and are byte-pinned to the manifest. Live films (`'simulation/v1'`) carry the frozen `FilmResult`, `directCommitment`, `studioRevenueReceived`, `settledWeek`, `releaseCommitmentId`. Runs live on the business (`runs[]` + `activeRunFilmOrdinals[]`) and are pruned at settlement (`hollywoodTick.ts:260-276`). Player films remain in `state.studio.releasedFilms`; the bridge merges them as `provenance:'player-record'` (`bridge/industry.ts:53-57`).

### 4.2 `IndustryReceipt` kinds (HIGH) — `hollywoodTypes.ts:96-103`

| kind | payload | producer |
|---|---|---|
| `studioEntered` | entryKey, origin fresh/migration/scheduled | `enterRival` (`hollywood.ts:194`) |
| `employment` | talentId, from/to studio, contractId, reason entry/renewal/replacement/expiry/termination/player-contract/existing-player-contract | `enterRival`, `staff`, `finishHollywoodWeek`, `recordPlayerEmployment` |
| `filmAnnounced` | productionId, conceptId | `decide` (`hollywoodTick.ts:171`) |
| `filmReleased` | productionId, conceptId, Standing before/after | release loop (`:253`) |
| `filmSettled` | productionId | run loop (`:273`) |

Every receipt is `{eventId:'industry-event-N', week, studioId}`; N is contiguous and equals array position (`hollywoodValidation.ts:353, 380-381`). This is a real, typed, append-only **industry event root** — the design's `IndustryEventReceipt` (`P11-TO-P12…CONTRACT.md:214`).

### 4.3 Suitability for BANKRUPTCY / AUCTION / DORMANT / CLOSED events — what must be additive (HIGH for the constraints, MEDIUM for the recommendation)

The root is suitable in shape (typed, id-stable, studio-keyed, monotone). But the union is **closed** and enforced: the validator has a fixed per-kind key table and throws `'unknown receipt kind'` for anything else (`hollywoodValidation.ts:347-348`); the bridge's activity projection silently drops unknown kinds (`bridge/industry.ts:90-98`), and the wire `group` enumeration is fixed to releases/people/studios/announcements (`bridge/schema/industry-schema.ts:11`). Adding corporate-fate kinds therefore needs, at minimum: (a) new union members in `hollywoodTypes.ts:96-103`; (b) validator table + per-kind cross-checks (`:347, :354-376`); (c) projection branches and probably a new `group` (schema/DTO hash change); (d) because `HollywoodState` itself is exact-keyed (`:59-60`) and `StudioIdentity` is exact-keyed (`:75`), any new status field or new sub-root is a **V19→V20 (or HollywoodState version 2) migration**, not a silent additive. The P12 design's own rule is "Use new versioned roots" (`CODEX-…PACKAGE-12.md:475`; annex "Frozen-leaf warning", `…BUILDER-ANNEX.md:192-198`). No inspected code models an auction, a sale, or a transfer of any film/people/facility between studios; the P13–P15 Owner ruling explicitly parks acquisitions/mergers/ownership in P16+ (`authority/P13-P15-OWNER-RULINGS.md` §4.2, §5).

---

## 5. Chart — `HollywoodChartSnapshot`, `chart`, `previousChart`

### 5.1 What is computed, when (HIGH) — `hollywoodTick.ts:306-313`

At `finishHollywoodWeek` (i.e., after `market.tick` has advanced), when `week % 13 === 0` **or** `chart === null` (so the first snapshot lands at `originWeek + 1`, then every 13 weeks; validator `:412-415`): `previousChart ← chart`, `chart ← { week, rows }` where `rows` = every identity with `enteredWeek !== null`, **in identity order (player row 0 first, then rivals by row)**, each `{ studioId, standing: copy of the business/player Standing, output }`. `output` for a rival = produced-script count (+2 authored for fresh rows 1–4); for the player = `releasedFilms.length`. The validator independently defines `output` as the number of that studio's films released **before** the snapshot week (authored count as released) (`hollywoodValidation.ts:424-426`); the two agree only because releases happen at `currentTick` and the snapshot at `currentTick+1`.

**The snapshot is not a ranking.** It stores raw values, unsorted, with no rank/movement/formula field (`hollywoodTypes.ts:104`). Cohort = studios entered at or before the snapshot week (`:419-420`).

### 5.2 How it is presented (HIGH) — `bridge/industry.ts`

The bridge, not the core, produces the ordered comparison:
- lanes `INDUSTRY_LANES = ['audienceAwareness','industryPrestige','commercialConfidence','output']` (`industry-schema.ts:3`);
- per lane, rank = `1 + (number of rows with strictly greater value)` (competition ranking; ties share rank) (`bridge/industry.ts:68-72`);
- movement vs `previousChart` only when the cohorts are identical, else `'unavailable'`; a studio absent from the prior snapshot is `'new'` (`:67, :78-83`);
- the `studios` view sorts rows by the selected lane's rank, then `studioId` (`:129`); for `output` + period `recent` it recomputes a trailing-52-week release count and re-ranks live (`:115-128`);
- the page notice is explicit: "Public facts only. Standing channels and film measures have separate meanings; **there is no combined Power score.**" (`:110`).

So a **per-lane quarterly ranking with movement already exists**, but not a Power Ranking: no composite, no formula version, no reasons, no annual peak/finish, no rank-snapshot event, no archive beyond current+previous. The P12 annex's Power Ranking anatomy lists all of those as "Later-wave contract, deliberately absent from P12A" (`…BUILDER-ANNEX.md:319-350`); R05 excluded "Power Ranking" by name (`P12A-R05-OWNER-DECISIONS…md:118`); the roadmap keeps cadence/formula as an open Owner decision and places it in P15A.2 (`ROADMAP.md:681`; `OWNER-RULINGS §4.3`).

`ui/src/engine/adapter.ts` contains **no** Industry/chart presentation (grep for industry/hollywood/chart yields only Standing-channel copy and unrelated "charter" comments). Industry is served to the Unity client through `POST /industry` (`bridge/server.ts:136`; `bridge/session.ts:1312-1315`) and the `industry` summary rides the snapshot bundle (`session.ts:1413`; `snapshot-build-context.ts:116`). Only `ui/src/engine` was extracted, so any browser Industry component outside it is unverified here (**LOW**).

---

## 6. Industry projection — public vs hidden

### 6.1 Exposed (HIGH) — `bridge/industry.ts` + `industry-schema.ts:5-17`

Per studio: id, name, mark, color, player flag, founding label (or "Founding date not recorded"), "Present since …", recording notice, film counts (authored/live), the four lanes with value/rank/priorRank/movement/snapshot labels. Per film: title, genre, date, provenance, critic score, audience score, opening and total gross (gross-to-date while in run), run status, a business notice. Per person: name, role label, **current employer** (from open industry intervals or player contracts), credit count, on-player-lot flag. Credits with employer. Activities from receipts: entries, material employment moves (renewal/entry/existing observations are omitted, `:93`), announcements, releases (with Standing before→after), settlements. Announced in-production projects (`:150-151`). Observed tendencies (leading genre and release pace over the last 156 weeks, with sample counts and a "this is observation, not a strategy forecast" basis; `:152-157`). Recorded-employment timeline per person (`:170-176`). `industrySummary`: calendar, availability, playerStudioId, `activeStudioCount` (= entered), notice (`:21-25`).

### 6.2 Hidden — never crosses the bridge (HIGH)

Rival `account`/cash/periods, contract terms and salaries ("Contract terms remain private", `:93`, `:176`), policy weights, forecasts, `nextDecisionWeek`, unannounced scripts/concepts, capacity/operations detail, `directCommitment`/`studioRevenueReceived` (no DTO field; film notices say studio revenue "remain[s] private", `:50`), RNG. This matches register rows UX-011/SAF-014 (`P12A-DECISION…REGISTER.md:144, 238`).

### 6.3 The `newspaper.ts` / Industry Pulse seam (HIGH)

`src/core/newspaper.ts` (masthead "The Silver Screen Gazette", `:31`) is the **player film release-reveal** and Film Chronicle derivation; it has zero references to `hollywood`, rivals, or receipts. "Industry Pulse" is only the default branch of `industryPage()` (`bridge/industry.ts:184-186`): receipts of the last 13 weeks grouped releases → people → studios → announcements. There is **no code seam** joining the two; the register's INT-005 describes the Wire as "downstream only" and lists dormant/recovered/closed/entrant facts as future P15B receipt families (`P12A-DECISION…REGISTER.md:192`).

---

## 7. Calendar and end-of-campaign

- `campaignDate(w)`: `year = 1920 + floor(w/52)`, `weekOfYear = 1 + w%52`, label `"${year} · Week ${weekOfYear}"`; throws on negative/unsafe input (`calendar.ts:13-21`). Policy id `'campaign-calendar-1920-52/v1'` (`:2`).
- **2040 Week 1 = absolute week 6240** (120 × 52); 2040 Week 52 = week 6291; 2041 Week 1 = week 6292. (HIGH, arithmetic on `:17-18`.)
- **No end-of-campaign logic exists.** Searches for `2040`, `finale`, `endWeek`, `campaignEnd`, `endOfCampaign`, `lastWeek`, `6240`, `maxWeek`, `FINAL_WEEK`, `CAMPAIGN_LENGTH` across `src/core`, `bridge`, `ui/src/engine` find only prose comments about the "1920→2040+ timeline law" (`rng.ts:61`, `productionIdentity.ts:49`, `screenplay.ts:11`, `data/screenplay.ts:196`, `tuning.ts:1236`) and unrelated local variables named `lastWeek` (finance/history windows). `market.tick` is unbounded; the Horizon ruling records "no hard calendar game-over" and continuation beyond 2040 permitted (`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:16-27`). R05 explicitly authorised "the calendar, date display and rollout only. No aging, era effects, technology unlocks, campaign ending" (`P12A-R05…md:76`). (HIGH)
- **Player hard bankruptcy:** none in code. `canAfford` refuses new commitments that would take cash below zero but its own comment says unavoidable payroll/overhead "may still push cash below zero" (`employment.ts:74-86`); `studio.cash` is validated as a plain number (`save.ts:2242`); there is no `bankrupt`/`gameOver`/`receivership` symbol anywhere in `src/`, `bridge/`, or `ui/src/engine`. (HIGH)

---

## 8. Original-game context touched (for labelling only)

Prima Official eGuide, PDF p. 52 ("Rival Studios"): rivals "arrive on the scene" over windows that "can vary over a four-year period"; "The Studio Charts get longer and longer as more studios enter"; pre-1920 studios are "already well established". The page contains no closure/bankruptcy language (**PRIMA EVIDENCE**, HIGH for what it says; absence ≠ proof). The P12 package's "no reliable inspected source establishes retail rival bankruptcy" (`…PACKAGE-12.md:167`) is consistent with this. The R05 schedule is an authored choice "inside the original guide's documented windows" (`P12A-R05…md:74`), not a retail-parity claim.

---

## 9. Summary table — what exists vs. what P15 would need

| P15 concern | In 592e926 today | Code location | Gap for P15 |
|---|---|---|---|
| Studio operating status | none; only `enteredWeek` | `hollywoodTypes.ts:6-17` | new field/root ⇒ exact-key validator + save version |
| Rival distress/dormancy/closure | none; cash unbounded below zero; no event | `hollywood.ts:31-42`, `hollywoodValidation.ts:212` | condition/remedy law, receipts, settlement of contracts (validator `:165, :357-358, :399`) |
| Active-rival floor / replacement entrants | none; exactly 10 identities, 9 fixed arrivals | `calendar.ts:3`, `hollywoodValidation.ts:72, 86, 331` | registry law change; identity count invariant |
| Contract termination by a rival | impossible | `hollywoodValidation.ts:165, 357-358` | new reason vocabulary |
| Industry event root | typed, append-only, 5 kinds | `hollywoodTypes.ts:96-103` | closed union; add kinds + validator + DTO group |
| Quarterly comparison | 13-week snapshot of Standing + output, current+previous; per-lane rank/movement in bridge | `hollywoodTick.ts:306-313`, `bridge/industry.ts:66-88, 129` | no composite/formula/reasons/archive; P15A.2 open Owner decision |
| Public rival cash | never exposed | `bridge/industry.ts`, `industry-schema.ts` | disclosure law if ever needed |
| 2040 finale / campaign end | none | (absent) | P15C entirely new |
| Player hard bankruptcy | none, by Owner law | `employment.ts:74-86` | unchanged |
