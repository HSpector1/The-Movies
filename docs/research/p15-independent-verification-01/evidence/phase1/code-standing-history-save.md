# P15 Phase-1 Evidence Report — Current Accepted Code (592e926): Standing, History, Awards, Player Failure, Newspaper/Industry Pulse, Save/Migration

**Reader:** independent code-reconnaissance reader (read-only)
**Snapshot inspected:** TypeScript runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` (Owner-accepted P12 R05, 2026-09-11), extracted at `scratchpad/accepted-592e926/` (`src/`, `bridge/`, `docs/`, `ui/src/engine/`). All `file:line` citations below are relative to that root.
**Method:** direct file reads and greps of the accepted snapshot; authority docs read for the claims being checked; original-game plain-text extractions grepped and two Prima PDF pages opened only to confirm page numbers. No git operations, no builds, no test runs, no player data touched.

Confidence legend: **HIGH** = read directly in the cited lines; **MEDIUM** = inferred from more than one location or from absence after a targeted search; **LOW** = plausible inference not pinned by a single citation.

---

## 0. Headline summary

| Question | Answer at 592e926 | Confidence |
|---|---|---|
| Standing channels | Exactly three: `audienceAwareness`, `industryPrestige`, `commercialConfidence`, each clamped 0..100, initial 40/40/50. No composite. | HIGH |
| Rival Standing | Per-studio: `RivalBusiness.standing: Standing`; rivals run the **same** `updateStanding` on release and the same awareness drift. | HIGH |
| Awards | **None simulated.** Only a blueprint-requirement stub that always evaluates UNMET ("Awards are not part of the game yet."). | HIGH |
| Durable history | Player: `studioHistory` (forward-recorded, sparse), `studio.releasedFilms`, `theatricalRuns`, `careerEvents`, `ledger`, `studioEvents` Tier-D. Industry: `hollywood.films/receipts/employment/careerEvents`, plus two quarterly `chart` snapshots. | HIGH |
| Player failure | No game-over, no bankruptcy, no tick refusal on negative cash. Only voluntary commitments are solvency-gated (`canAfford`). Recap classifier (`healthy/constrained/severe/noNormalProduction/incomplete`) is a browser-UI read-model, not on the Unity bridge. | HIGH |
| Newspaper | Single-film press clipping for the **player's own** release (browser UI only). No industry-wide headline. The industry-wide seam is the bridge `Industry Pulse` view over `hollywood.receipts`. | HIGH |
| Save | Inner save **V19** (`hollywood` root added by `convertV18ToV19` → `initializeHollywood(state,'migration')`). Additive-root pattern is uniform V16→V19. | HIGH |
| Save As | Branches the complete world (seed/RNG/IDs) under a new storage UUID; original record preserved; no read-only/frozen record flag exists. | HIGH |

---

## 1. Standing (`src/core/standing.ts`)

### 1.1 Channels, ranges, initial values

- Type: `Standing = { audienceAwareness: number /* 0..100 */; industryPrestige: number; commercialConfidence: number }` — `src/core/types.ts:267-271`. **HIGH**
- Initial values: `INITIAL_STANDING = { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }` — `src/core/tuning.ts:1698-1702`. **HIGH**
- Per-release output clamps each channel to `[0,100]` — `standing.ts:202-206`. **HIGH**
- Formula identity frozen onto receipts: `STANDING_FORMULA_VERSION = 'standing/d6-2026-07-26+d17b-e1'` — `standing.ts:99`. **HIGH**

### 1.2 Update rules (owner ruling D-6, `standing.ts:1-38` header)

`updateStanding(standing, r: FilmResult, _b: ReleaseBenchmarks /*dormant*/, ctx: StandingContext): Standing` — `standing.ts:143-207`.

| Channel | Sole drivers (paraphrased from `standing.ts:14-31`) | Formula (`standing.ts`) | Tuning (`tuning.ts`) |
|---|---|---|---|
| Audience Awareness | absolute audience reach (box office ÷ base market value) + secondary star attention; NOT forecast surprise | `Δ = clamp(7·(reach − reachNeutral) + 1.2·starAttention, ±6)`; `reach = clamp(total/max(baseMarketValue,1)/0.9, 0,1)`; pivot 0.45 when `ctx.engaged`, else 0.58 (`:153-175`) | `AWARENESS_REACH_SCALE 0.9`, `_NEUTRAL 0.58`, `_NEUTRAL_ENGAGED 0.45`, `_REACH_WEIGHT 7`, `_STAR_WEIGHT 1.2`, `_DELTA_CAP 6` (`:89-110`) |
| Industry Prestige | absolute critical achievement only | `Δ = clamp((criticScore − 45)/1.2, ±10)` (`:182-186`) | `PRESTIGE_CRITIC_BENCHMARK 45`, `_SCALE 1.2`, `_DELTA_CAP 10` (`:167-169`) |
| Commercial Confidence | realized ROI on committed cost, minus budget-discipline penalty | `roi = (total − cost)/max(cost, 500k)`; `Δ = clamp(4·clamp(roi/5,±1) − 4·overrun01, ±5)` (`:192-200`) | `CONFIDENCE_ROI_SCALE 5`, `_ROI_WEIGHT 4`, `_DISCIPLINE_WEIGHT 4`, `_COST_FLOOR 500_000`, `_DELTA_CAP 5` (`:178-182`) |

Weekly counter-flow (D-17B §1, engaged only): `awareness' = awareness − 0.04·max(0, awareness − 35)` — `tick.ts:825-856`; `AWARENESS_DRIFT_RATE 0.04`, `AWARENESS_DRIFT_ANCHOR 35` (`tuning.ts:120-121`). Pull-down only; inert at/below the anchor. **HIGH**

The three player mutation sites, each of which appends a `standingChanged` receipt to `studioHistory`: (1) release, `tick.ts:777-803`; (2) awareness drift, `tick.ts:857-878`; (3) paid publicity campaign, `actions.ts:2821-2845`. **HIGH**

### 1.3 Rival Standing is per-studio and symmetric

- `RivalBusiness.standing: Standing` — `src/core/hollywoodTypes.ts:79-83`. **HIGH**
- On each rival release, `hollywoodTick.ts:249-253` calls the **same** `updateStanding(before, filmResult, p.forecastSnapshot, {...castFames, actualNegative, requiredNegative, baseMarketValue: state.market.baseMarketValue, marketing, salaries, engaged: true})`, then `appendReceipt(h, {week, studioId, kind:'filmReleased', productionId, conceptId, before, after})`. Note `engaged:true` is hard-coded for rivals (players use the persisted `economyEngagedEver`). **HIGH**
- Rivals receive the same weekly awareness drift: `hollywoodTick.ts:277-278`. **HIGH**
- Rival standing validated 0..100 at save boundaries: `hollywoodValidation.ts:34-37, :206, :374, :422`. **HIGH**

### 1.4 No composite score exists — proven

- Searched `src/core`, `bridge`, `ui/src/engine/adapter.ts` for `composite|overallStanding|studioRating|powerRank|blended` — the only hits are the stage+set "composite" (unrelated) and `STUDIO_RENTAL_BLENDED` (a revenue share). **MEDIUM (absence after targeted search)**
- The Industry projection states it in the wire: `notice: 'Public facts only. Standing channels and film measures have separate meanings; there is no combined Power score.'` — `bridge/industry.ts:117`. **HIGH**
- Studio Charts expose four **separate** lanes (`audienceAwareness`, `industryPrestige`, `commercialConfidence`, `output`), each ranked independently as `1 + count(rows with strictly greater value)` — `bridge/industry.ts:68-72, :79-86`. **HIGH**
- Quarterly comparative snapshots: `HollywoodChartSnapshot = { week; rows: {studioId; standing; output}[] }`, written every 13 weeks (`week%13===0 || chart===null`) and retained only as `chart`/`previousChart` — `hollywoodTypes.ts:104, :122-123`; `hollywoodTick.ts:306-313`. This is the existing comparative-snapshot seam (two snapshots, no archive). **HIGH**

---

## 2. Durable history and the absence of Awards

### 2.1 `studioHistory` (`src/core/studioHistory.ts`, types at `types.ts:1547-1665`)

- Root: `StudioHistoryState = { recordingStartedWeek; nextEventId; rows }` — `types.ts:1657-1664`. Fresh world records from week 0 (`studioHistory.ts:50-52`); a migrated pre-P08 save records from the migration week and **nothing earlier is reconstructed** (`:58-60`, pin 4 at `:18-19`). **HIGH**
- Gate: recording only when `economyEngaged(state)` (`:380-382`). **HIGH**
- Event kinds (`types.ts:1604-1653`): `studioFounded`, `standingChanged` (with `source: releaseResult|publicity|awarenessDrift`, `before/after/deltas`, `formulaVersion`, `facts`), `standingDriftFolded`, `filmReleased` (`productionId, conceptId, title frozen at release, firstRelease`), `theatricalRunCompleted`, `facilityCommitted|Completed|Demolished|Moved`, `careerMilestone`. **HIGH**
- Significance classes decided in-engine (`studioHistory.ts:139-168`): `landmark` (founding, first release), `major` (later release, |Δstanding| ≥ 3, facility completed), `standard`, `routine` (weekly drift; folded after 52 weeks, `:44, :260-311`). **HIGH**
- Producers actually present: `studioFounded` (`actions.ts:1308`), `filmReleased` (`tick.ts:610-621`), `theatricalRunCompleted` (`tick.ts:760`), `standingChanged` (three sites above), `facilityCompleted` (`tick.ts:1057`), `facilityCommitted/Demolished/Moved` (`actions.ts:1446`). **HIGH**
- **`careerMilestone` has no producer.** The kind is typed (`types.ts:1642-1651`, comment "No row exists until P10 emits it") and rendered by `bridge/history.ts:367`, but no `kind: 'careerMilestone'` draft is appended anywhere in `tick.ts`, `actions.ts`, `releaseCareers.ts`, `industryCareer.ts`, or `hollywoodTick.ts`. **MEDIUM (absence after targeted search)**
- Invariants fail closed at tick entry and save boundaries (`studioHistory.ts:322-355`; `tick.ts:191`). **HIGH**

### 2.2 Other durable roots a 2040 Legacy dossier could cite

| Root | What it holds | Cite |
|---|---|---|
| `studio.releasedFilms: FilmResult[]` | every player film: `criticScore`, `boxOffice{opening,total}`, `segmentScores`, `cohesion`, `conceptId`, `directorId`, optional frozen `participants` + `forecast` | `types.ts:241-263` |
| `theatricalRuns` | weekly gross/paid, `studioShare`, status | used by `bridge/industry.ts:45-52` |
| `careerEvents: TalentCareerEvent[]` | one frozen record per (film, participant): OVR/skills/genreExp/starPower before→after, realized opening/total, `reasonCodes` | `types.ts:1708-1736`; producer `releaseCareers.ts:12-87` |
| `ledger` | permanent cash history, never pruned | `studioEvents.ts:43-44`; `types.ts:1220` |
| `studioEvents` Tier-D | permanent `wrapped`, `premiere`, `releaseCommitted`, `constructionCompleted`, `setBuilt`, `setRetired`; Tier-W windowed 26 weeks | `studioEvents.ts:64-71`; `tuning.ts:647` |
| `hollywood.films: IndustryFilm[]` | authored pre-1920 films (`provenance:'authored-start/v1'`) and live rival films (`'simulation/v1'` with full `FilmResult`, `directCommitment`, `studioRevenueReceived`, `settledWeek`) | `hollywoodTypes.ts:28-46` |
| `hollywood.receipts: IndustryReceipt[]` | `studioEntered`, `employment`, `filmAnnounced`, `filmReleased` (with before/after Standing), `filmSettled` | `hollywoodTypes.ts:96-103` |
| `hollywood.employment`, `careerEvents`, `RivalAccount.periods` (annual, private) | employer intervals; rival career events; rival yearly finance periods | `hollywoodTypes.ts:49-68, :117-119` |
| `hollywood.identities[].founding / enteredWeek / recordedFromWeek` | founding fact, entry week, recording boundary; **no status field** (no dormant/closed) | `hollywoodTypes.ts:6-17` |

### 2.3 Awards — exactly what exists

- Search of `src/core`, `bridge`, `ui/src/engine/adapter.ts` for `award|ceremon|honor|nominat|trophy|oscar|academy`: the only functional hits are the blueprint-requirement kind `{ kind: 'award'; awardId }` (`types.ts:918-919`, comment "Awards land in C3") and its evaluator, which always returns UNMET with the copy `'Awards are not part of the game yet.'` (`blueprintRequirements.ts:62-66, :117-118`). `bridge/people.ts:269` says Star Power is "Separate from craft (OVR) and from awards." **HIGH**
- Therefore no award field, ceremony, nominee, winner, honor tally, or award-driven Standing change exists; the P12 handoff sentence "acceptance does not deliver unimplemented Awards simulation" (`authority/P12-TO-P13-PRODUCER-HANDOFF.md:29`) is exact. The P08–P10 register keeps P08-REQ-022..029 OWNER-/DEPENDENCY-BLOCKED (see §6). **HIGH**
- Records (e.g., "best opening ever") — no producer found (`highestGross|bestOpening|all-time|record-setting`: no hits). **MEDIUM**

---

## 3. Player failure / distress today

### 3.1 `studioRunRecap.ts` — `classifyRecovery` (exact predicates)

`RecoveryPosition = 'healthy' | 'constrained' | 'severe' | 'noNormalProduction' | 'incomplete'` — `studioRunRecap.ts:79-84`. The classifier at `:962-1007` reads:

| Verdict | Predicate (verbatim logic) | Cite |
|---|---|---|
| `incomplete` | `!inp.films.length || inp.cheapest == null` — no released film or no greenlightable package quote | `:974-978` |
| `noNormalProduction` | `!cheapestOk` — the bare-minimum greenlightable package (cheapest concept, lowest budget, minimum marketing) fails `canAfford` | `:985-989` |
| `healthy` | `standardOk && typicalOk && waitingHelps` — a standard-budget film AND a film at recent-typical commitment are affordable AND `netWeeklyCash >= 0` | `:990-993` |
| `severe` | `!standardOk && !hasActiveRevenue && !waitingHelps && runwayWeeks != null` | `:1005-1006` |
| `constrained` | otherwise (cheapest affordable but standard/typical not, or cash shrinking) | `:1006` |

Inputs: `cheapest/standard/typicalRecent` each come from `affordabilityOf(state, amount)` → `commitmentPreview` → `canAfford` (`:953-960`); `hasActiveRevenue` = active run with `expectedWeeklyRunRevenue > 0` (`:884`); `runwayWeeks` from `economyView.runway` (`economyView.ts:134-136`: `⌊cash / max(ε, burn − activeRunRevenue)⌋`, `null` when net-positive). One reason string is load-bearing for P15: `'… No recovery mechanic (loans/financing) exists in the current rules.'` — `:1003`. **HIGH**

### 3.2 Is any of it surfaced to the player?

- Browser UI: `studioRunRecap` and `RecoveryPosition` are re-exported through `ui/src/engine/adapter.ts:7941-7962` for the React recap screen (screen source not in the extracted snapshot). **HIGH** that it is exported; **LOW** on what the screen shows.
- Unity bridge: **no** consumer of `studioRunRecap`/`classifyRecovery` in `bridge/` (grep: none). The bridge finance surface instead exposes `runwayState: 'inRed'|'positive'|'steady'|'finite'|'unavailable'` from `financeReport.ts:274-281` (`inRed` iff `cash <= 0`) and an attention line `'Cash is in the red. Current receipts and existing obligations remain visible; voluntary decisions follow their own affordability rules.'` — `bridge/finance.ts:83`; schema `bridge-schema.ts:2177-2178`. **HIGH**

### 3.3 Nothing stops the game or blocks the tick on negative cash — proven

- `tick()` entry validates release authority, history, placement and sets (`tick.ts:182-215`); there is **no** cash predicate. The only `throw`s in `tick.ts` are identity/reference guards (`:143, :475, :506`). **HIGH**
- Unavoidable weekly debits run regardless of sign: payroll `tick.ts:915-921`, overhead `:925-932`, facility opex `:942-952` (`cash -= …`, no floor). **HIGH**
- Voluntary commitments are the only cash-gated actions, via `canAfford` (rule: `cash − amount ≥ 0`, `employment.ts:70-86`): greenlight `actions.ts:572-575`, construction quote `:1421-1424`, set build/repair `:1607, :1625`, sign `:2629-2631`, renew `:2674-2676`, publicity `:2790-2792`. `releaseTalent` (early termination) is **not** gated and may drive cash negative (`actions.ts:2710-2725`, header `:17-18` "Cash may go negative with no mechanical consequence"). **HIGH**
- Search of `src/core`, `bridge`, `ui/src/engine/adapter.ts` for `game ?over|gameEnded|campaignEnded|terminal state|bankrupt|insolv|liquidat|foreclos|dormant|closure`: no state, action, or rejection code of that kind (hits are unrelated words). `calendar.ts` has no end week; `campaignDate()` accepts any nonnegative safe integer (`calendar.ts:13-21`). The P12A register GOV-005 records "No campaign ending." **HIGH**
- Rivals: `moveRivalMoney` has no floor (`hollywood.ts:31-41`); rivals stop new commitments below their operating reserve (`hollywoodTick.ts:98, :126, :176`) but keep paying payroll/overhead/opex (`:280-282`). A rival can therefore run negative indefinitely with no transition — consistent with `StudioIdentity` having no status field. **HIGH**

### 3.4 Original-game cross-check (context only)

RETAIL SHIPPED MECHANIC: the manual states the balance "can go into the red" and that in debt you cannot build new sets or certain facilities/ornaments — `original-text/manual.txt:129-130` (manual pp. 6–7 spread, qxp header "Page 6" at `:105`). PRIMA: "Building in Debt … Most facilities and sets can't be built when your studio is in debt" with listed exceptions — Prima printed p.14 (PDF page 15), `prima.txt:769-775`. COMMUNITY: GameFAQs (Maxx) repeats it (`gamefaqs-maxx.txt:659`). No inspected retail source establishes a bankruptcy game-over. The accepted code's "negative cash allowed, voluntary spend gated" is structurally the same family of rule, stricter in that it gates all voluntary commitments, not just building. **HIGH** for the sources; the analogy is the reader's.

---

## 4. Newspaper and the Industry Pulse seam

### 4.1 `src/core/newspaper.ts`

- What it is: "The emotional headline layer shown once at a film's release," derived entirely from the film's persisted `FilmResult` + committed cost + concept title + segment shares, deterministic, no RNG — `newspaper.ts:1-10`. Masthead `'The Silver Screen Gazette'` (`:30`). **HIGH**
- Renders: one `NewspaperView` per **player** film — `headline/subheadline` from priority-ordered threshold rules (`makeHeadline`, `:432-499`: critics-vs-audience splits, surprise hit ≥ $5M projected profit, smash ≥ $8M, expensive flop, …), `critic`, `audience`, `financial{openingGross, studioRevenueThisWeek, projected…, disclosure}`, `forecast` deltas, up to three `callouts` (`:501-546`), `participants`, and the Film Chronicle (`:352-372`). **HIGH**
- DISCLOSURE rule (verbatim constant, `:401-402`): "Only the opening week is banked so far. Full-run figures are PROJECTIONS. Studio Revenue is the studio's blended rental share of box office, paid weekly across the theatrical run; distributor and exhibitor economics are abstracted into that share." D-17A label-truthfulness comments (`:409-418`, `:534-545`) require projected-vs-banked wording. **HIGH**
- Event kinds: it is not an event renderer; it consumes exactly one `FilmResult`. It returns `null` for a film without frozen `participants` (`:553-555`). **HIGH**
- Industry-wide headline: **none.** No rule reads rival films, studio entry, or `hollywood.*`. The builder is called only from `ui/src/engine/adapter.ts:5965-5990` (`releaseNewspaper(state, film)` over `state.ledger`, `scriptDevelopment`, `theatricalRuns`) — i.e., browser UI only; `bridge/` has no newspaper/gazette/clipping exposure (grep: none). **HIGH**
- Radio/Broadcast (`broadcast.ts`): release-topic only; talent/studio/cultural branches are "UNREACHABLE here" (`broadcast.ts:13-16`); `BroadcastItem.topic` union exists (`types.ts:1929-1936`) but only `'release'` is produced (`broadcast.ts:331`). No bridge exposure of `broadcastItems` (grep: none). **HIGH**

### 4.2 The actual industry-wide notice seam: bridge `Industry Pulse`

- `industryQuery.view` includes `'pulse'` (`bridge/schema/industry-schema.ts:16-17`). The handler (`bridge/industry.ts:183-186`) titles the page `'Industry Pulse'`, notice "Grouped material activity for the last 13 campaign weeks. Routine phase changes and ordinary renewals are omitted," and pages `activities` filtered to `week >= tick − 12`, ordered releases → people → studios → announcements. **HIGH**
- Activities are derived from `hollywood.receipts` (`bridge/industry.ts:90-98`): `studioEntered` → "`<Studio>` joins Hollywood"; `filmReleased` → "`<Studio>` releases `<Title>`" with the three separate Standing before→after values; `filmSettled`; `filmAnnounced` → "announces a film … No release date is promised"; `employment` only for non-routine reasons. **HIGH**
- Disclosure law on that seam: only `announcedWeek !== null` projects are public (`:150`, `:162`); private rival cash/salaries/policy never leave `hollywood` (`bridge/industry.ts:1` header; register UX-011/SAF-014). **HIGH**
- Player-history rows enter the same activity shape via `historyProjection(state).timeline` for the player's own studio page (`bridge/industry.ts:141-143`). **HIGH**

Implication for P15: a "large high-visibility industry notice" (e.g., a Power Ranking publication or a rival distress/closure fact) has an existing typed receipt → activity → Pulse path; it would need a new `IndustryReceipt` kind (or a new P15 receipt root) plus an activity renderer, not a newspaper change.

---

## 5. Save / migration (`src/core/save.ts`) and Save As (`bridge/runtime/campaign-library.ts`)

### 5.1 Current version and the chain

- Live envelope `SaveFileV19 = { saveVersion: 19; seed; state: GameStateV19; broadcastCache }` — `save.ts:363-368`; `GameStateV19 = GameStateV18 & { hollywood: HollywoodState | null }`, `GameState = GameStateV19` — `types.ts:1689-1690`. Receipt identities "protocol 4 / projection 29 / inner V19 / outer checkpoint 1" confirmed at `bridge/schema/bridge-schema.ts:19, :36` and `bridge/runtime-checkpoint.ts:26`. **HIGH**
- `validateSave` dispatches 1..19 (`save.ts:4993-5020`). Load-to-play entry is `migrateToV19` (`save.ts:7254-7257`), used by `bridge/session.ts:121`, `bridge/runtime-checkpoint.ts:829`, `campaign-library.ts:48, :127`. **HIGH**

### 5.2 The additive-root pattern, step by step (V18→V19 as the template)

1. **Type:** one new root on the frozen prior state — `GameStateV19 = GameStateV18 & { hollywood: … | null }` (`types.ts:1689`). Prior roots followed the same one-root rule: V16 `releaseAuthority`, V17 `studioHistory`, V18 `foundingRegime` (`save.ts:335-361`).
2. **Validator peels the root and delegates:** `validateSaveV19` requires `state.hollywood` present, destructures `{hollywood, ...legacy}`, calls `validateSaveV18({saveVersion:18, …, state: legacy})`, then `validateHollywood(hollywood, frozen.state, …)` — `save.ts:7228-7249`. Same shape as `validateSaveV18` peeling `foundingRegime` (`:4936-4960`). Because every validator uses exact-key checks, an unknown extra root is rejected — an additive P15 root **must** be peeled at its own version.
3. **Builder:** `makeSave` projects the frozen V18 roots positively (`projectStateV18`, `:5998-6003`) and attaches a detached plain-JSON copy of the new root — `save.ts:6048-6051`. Frozen builders refuse to drop it: `assertFrozenBuilderRetainsHollywood` (`:5675-5679`) is called by every `makeSaveV1..V18`.
4. **Conversion at the boundary, no backfill:** `convertV18ToV19(save) = makeSave(initializeHollywood(save.state,'migration'))` — `save.ts:7250-7253`; `initializeHollywood` sets `origin:'migration'`, `originWeek: state.market.tick`, player `recordedFromWeek = studioHistory.recordingStartedWeek`, rival `founding: null`, and enters only rivals already due (`hollywood.ts:111-136`). Compare V16→V17: `studioHistory: migratedStudioHistory(oldState.market.tick)` (`:7112-7120`).
5. **Migration entry + downgrade refusals:** `migrateToV19` passes V19 through validation, else `convertV18ToV19(migrateToV18(save))` (`:7254-7257`); every older `migrateToVn` gained `if (save.saveVersion === 19) throw … "cannot downgrade SaveFileV19 or discard Hollywood"` (`:7072, :7139, :7147, :7160, :7176, :7202`).
6. **Consumers:** bridge `PROJECTION_VERSION`/schema, `campaign-library`, `runtime-checkpoint` and `session` repoint to the new `migrateToVn`.

What an additive P15 root would therefore need (mirroring `hollywood`): `GameStateV20 = GameStateV19 & { <p15root>: … }`; `SaveFileV20`; `validateSaveV20` peeling the root then delegating to `validateSaveV19`; `makeSave` → V20 with `makeSaveV19` frozen plus an `assertFrozenBuilderRetains<P15Root>` guard; `convertV19ToV20` that initializes the root at the migrated state's own week with `recordedFromWeek`/completeness facts and **no** invented market/rank/distress history; `migrateToV20` plus V20-downgrade refusals in every older `migrateToVn`; `validateSave` dispatch 20; consumer repoints. **HIGH** for the pattern; the naming is the reader's projection.

Note `hollywood` may be `null` ("historical control"); the campaign library refuses to open such saves as native campaigns (`campaign-library.ts:40, :62`). **HIGH**

### 5.3 Save As branching semantics (`bridge/runtime/campaign-library.ts`)

- Library: `format 'project-studio-campaign-library'`, `libraryVersion 1`, max **32 records**, **256 MiB** encoded, gzip level-1 storage format 2 (`:14-16`; codec `campaign-storage-codec.ts:6-15`). A record is `{id (UUID), label, revision, checkpointJson}` (`:18`) — **no read-only/frozen/finale flag**. **HIGH**
- `saveAs`: `prospective = BridgeSession.fromSaveJson(session.exportRuntimeCheckpoint().currentSaveJson, …)`, comment "Current complete state, seed, RNG and identities; only session/storage scopes are new"; new record gets a fresh UUID (or an explicitly confirmed overwrite target) and becomes active — `:229-235`. Overwriting the **active** record via Save As is rejected: "Save As must preserve the original record." — `:181`. Label collisions rejected (`:179-180`). **HIGH**
- `load` re-hydrates the record and rolls the runtime over (`:236-240`); `delete` of the active record leaves an unnamed draft (`:244-248`); `campaignDirty` compares the active record's `currentStateDigest` with the live digest (`:140-145`). **HIGH**
- Relevance to "Endless Sandbox must not rewrite the official 1920–2040 Legacy": Save As already yields a frozen-by-copy branch (same world/IDs/RNG, distinct storage ID), and the original record is never modified by the copy. But nothing prevents the player from later loading the original and advancing it; a "frozen finale" would need a new record attribute (or library format bump — `loadCampaignLibrary` uses exact-key checks at `:92, :104`) plus a runtime refusal to advance, or an Owner-approved convention that the finale snapshot is a distinct, non-advancing record. **HIGH** for what exists; **LOW** for the design suggestion.

---

## 6. Register rows on loans, bankruptcy, distress, net worth, valuation, acquisition, Power Ranking, finale, endless mode, minimum rivals

### 6.1 `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`

| Row | Requirement (short) | Disposition (verbatim) | Line |
|---|---|---|---|
| P08-REQ-003 | no overall Studio Rating / five-star composite / universal quality score | REJECTED BY OWNER … "No implementation; guard remains" | `:12` |
| P08-REQ-022 | Awards are periodic immutable recognition, separate from Standing, cash, progression | OWNER-BLOCKED … gate P08B | `:13` |
| P08-REQ-023 | define award field/eligibility/categories/cadence/tie law first | OWNER-BLOCKED … "P12 rivals or governed generated field" | `:14` |
| P08-REQ-024/025/026 | persist nominations/winners; ceremony non-blocking; honor tallies inspectable | DEPENDENCY-BLOCKED … P08B | `:15-17` |
| P08-REQ-027 | publish eligibility/drivers/consequences | OWNER-BLOCKED | `:18` |
| P08-REQ-028 | no universal five-year buffs | REJECTED BY OWNER | `:19` |
| P08-REQ-029 | award categories evolve with era | DEPENDENCY-BLOCKED … P08B/P13 | `:20` |
| P09-REQ-035 | land acquisition/property expansion | DEFERRED TO NAMED PACKAGE … "P09-LATER-LAND" | `:26` |
| P10-REQ-039 | Talent/Studio Power Rankings "require a full cohort, cadence, prior rank, movement, and reason facts" | DEFERRED TO NAMED PACKAGE … "P10-LATER-RANK" … "Owner later" | `:40` |

No rows mention loans, bankruptcy, distress, net worth, valuation, finale, endless mode, or a minimum-rival floor (grep: none). **HIGH**

### 6.2 `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md`

| Row | Short text | Disposition (verbatim fragments) | Line |
|---|---|---|---|
| GOV-005 | "primary authored campaign is 1920–2040 … ~6,240 authoritative weeks" | "…6,240 additional advances pass. No campaign ending." | `:74` |
| GOV-006 | "Keep post-2040 Endless continuation separate … do not present it as guaranteed or approved." | "Owner-blocked future mode, irrelevant to P12A acceptance" | `:75` |
| ID-011 | "Keep active/dormant/closed/historical vocabulary without implementing churn in P12A." | "Core identity fact; dormant/closed later" | `:93` |
| SIM-006 | rivals get conserved finance "…and later distress" | "Compact conserved account; P12A core; distress later" | `:105` |
| HIS-013 | closure settlement/archive law | "Vocabulary/seam ready; behavior re-homed P15B" | `:166` |
| INT-009 | "P15A.2 … owns Power Ranking … quarterly current/prior snapshots and annual summaries" | "Re-homed to P15A.2/equivalent … At least two comparable snapshots; permutation ties; reasons trace; no view-time recompute" | `:196` |
| INT-010 | "P15B … owns corporate continuity: distress, recovery, closure, replacement entrants, active-floor/cap, settlement, archives, and corporate fate." | "Implemented only initial nine-studio fixed arrivals/atomic entry. Bankruptcy, recovery, closure/replacement/churn remain P15B." | `:197` |
| SAF-004 | "Do not ship Power Ranking in P12A or tease it" | "Active P12A prohibition; P15A.2 future" | `:228` |
| SAF-008 | "Do not implement distress, recovery, closure, or post-initial entrants in P12A; … resurrect firms with top-ups." | "Corporate churn, distress/recovery/closure/replacement and rescue top-ups remain excluded." | `:232` |
| SAF-009 | no P16 acquisitions/mergers/valuation/… in P12A | (prohibition) | `:233` |
| SAF-016 | no backfill of migrated rival "…awards, rankings, market pressure, … distress" | "Implemented genuine legacy migration without fabricated earlier history" | `:240` |

"Minimum rivals": the only related phrase is INT-010's "active-floor/cap" owned by P15B; no numeric floor exists in code or register. **HIGH**

### 6.3 `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md`

| Row | Short text | Disposition (verbatim) | Line |
|---|---|---|---|
| P11-REQ-023 | "Preserve recoverable negative Cash; do not invent bankruptcy" | IMPLEMENT IN CORE … PROVEN … "no bankruptcy law; `releaseTalent` may take cash negative — REUSED law" | `:122` |
| P11-REQ-041 | "Loans/investors/external financing require separate Owner gate" | OWNER-BLOCKED … "No fake disabled tabs" … DEFERRED | `:140` |
| P11-REQ-042 | "Bankruptcy/failure or structured recovery requires separate Owner gate" | OWNER-BLOCKED … "P15 corporate fate / future finance law" … "No implicit terminal state" … DEFERRED | `:141` |
| §4.E | later decisions not blocking P11A: "2. External financing, loans, investors… 3. Bankruptcy, failure, receivership or structured recovery. 4. Semantic financial-health/risk classifier." | (list) | `:189-193` |

No rows on net worth, valuation, acquisition, Power Ranking, finale, endless mode. **HIGH**

---

## 7. Corrections to prior P15 research (package + annex written against 7811377 / V15)

| Prior claim | Verdict | Evidence at 592e926 |
|---|---|---|
| "accepted save generation is V15" (`P15-PACKAGE.md:362`) | **CORRECTED** — live inner save is V19; V16 `releaseAuthority`, V17 `studioHistory`, V18 `foundingRegime`, V19 `hollywood` were added since. | `save.ts:335-368`, `:7248-7255` |
| "rival studios/projects: absent at accepted base; designed by P12" (`:359`) | **CORRECTED** — present: `hollywood` root with nine reserved rival identities, businesses, projects, releases, receipts. | `hollywoodTypes.ts:105-124`; `hollywood.ts:111-136` |
| "three Standing channels … P12 must generalize per studio" (`:355`) | **CONFIRMED and now satisfied** — `RivalBusiness.standing` uses the same `updateStanding`. | `hollywoodTick.ts:249-253` |
| Seam paths `src/core/ledger.ts`, `src/core/theatrical.ts`, `src/core/events.ts` (`:352, :356, :358`; annex `:607, :610`) | **CORRECTED** — none of these files exists; the ledger is `state.ledger` (`types.ts:1220`) with helpers in `economyView.ts`/`financeReport.ts`; theatrical runs live in `types.ts`/`tick.ts`; event roots are `studioEvents.ts` and `studioHistory.ts`. | file listing of `src/core/` |
| "current `competingSlate` is not shared-market authority; competition factor currently neutral" (`:353-354`) | **CONFIRMED** — `competingSlate: []` at worldgen; `competitionFactor = 1.0`. | `worldgen.ts:645`; `reception.ts:679` |
| "current accepted code has no authoritative rival market, Power Ranking, corporate-state, acquisition, co-production, or 2040 finale model" (`:376-377`) | **QUALIFIED** — still true for Power Ranking/corporate state/acquisition/finale; but a rival market **producer** now exists (rival releases with real `FilmResult`s, runs, revenue), and a four-lane comparative Studio Charts read (per-lane rank, quarterly snapshots) exists. Neither is a shared-market penalty nor a composite rank. | `bridge/industry.ts:66-86, :117`; `hollywoodTick.ts:306-313` |
| "P08 Awards / Standing / History … consumes awards" (`:41, :142`) | **QUALIFIED** — Standing and History are implemented; Awards are not (stub only). | `blueprintRequirements.ts:62-66` |
| "Negative cash is not bankruptcy … no mandatory hard-bankruptcy game-over" (`:94, :393, :625`) | **CONFIRMED** — no game-over/terminal state; only `canAfford` on voluntary commitments. | §3 above |
| Handoff: "Current `StudioIdentity` has no dormant/closed status field" (`P12-TO-P13-PRODUCER-HANDOFF.md:27`) | **CONFIRMED** | `hollywoodTypes.ts:6-17` |
| Annex "Industry pulse … at management zoom" as a *future* P15 surface (`P15-BUILDER-ANNEX.md:885-894`) | **QUALIFIED** — an `Industry Pulse` view already exists on the bridge (13-week receipt activity feed); P15 would extend, not create, it. | `bridge/industry.ts:183-186` |
| Annex error row `negativeCashOnly` → "Negative cash does not by itself close a studio." (`:1030`) | **CONFIRMED consistent** with current bridge copy "Cash is in the red …" | `bridge/finance.ts:83` |

---

## 8. Open uncertainties

1. The React recap screen itself (`ui/src/...` beyond `engine/`) is not in the extracted snapshot, so exactly how `RecoveryPosition` is worded to the player in the browser build is unverified.
2. `careerMilestone` producer absence is by targeted grep; a differently spelled emitter (e.g., via a helper that builds the kind dynamically) was not found but cannot be excluded without a build.
3. `chart`/`previousChart` retain only two quarterly snapshots; whether the receipts (`filmReleased` before/after Standing) are sufficient to reconstruct a full ranking series for P15A.2 "annual summaries" is a design question, not a code fact.
4. Save-size interaction with Save As branching: with the recorded large-world Hollywood storage of ~37.8 MB per save (acceptance receipt), a 32-record / 256 MiB library could hold only a handful of late-campaign branches even with gzip; not measured here.
5. Rival `engaged:true` hard-coding vs. the player's persisted `economyEngagedEver` is a documented asymmetry in pivot selection only; whether any P15 symmetry proof must account for it is open.

---

## 9. Sources

- Accepted snapshot files (all under `scratchpad/accepted-592e926/`): `src/core/standing.ts`, `tuning.ts`, `types.ts`, `tick.ts`, `actions.ts`, `hollywoodTypes.ts`, `hollywoodTick.ts`, `hollywood.ts`, `hollywoodValidation.ts`, `studioHistory.ts`, `studioEvents.ts`, `releaseCareers.ts`, `studioRunRecap.ts`, `economyView.ts`, `employment.ts`, `financeReport.ts`, `newspaper.ts`, `broadcast.ts`, `blueprintRequirements.ts`, `calendar.ts`, `save.ts`, `worldgen.ts`, `reception.ts`; `bridge/industry.ts`, `bridge/history.ts`, `bridge/finance.ts`, `bridge/session.ts`, `bridge/schema/bridge-schema.ts`, `bridge/schema/industry-schema.ts`, `bridge/runtime-checkpoint.ts`, `bridge/runtime/campaign-library.ts`, `bridge/runtime/campaign-storage-codec.ts`; `ui/src/engine/adapter.ts`.
- Registers: `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`; `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md`; `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md`.
- Authority: `scratchpad/authority/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md`, `P12-TO-P13-PRODUCER-HANDOFF.md`, `P13-P15-OWNER-RULINGS.md`, `P15-PACKAGE.md` (§9 seam table), `P15-BUILDER-ANNEX.md` (§H, §M.1, error table).
- Original game: `scratchpad/original-text/manual.txt:129-130` (manual pp. 6–7); Prima Official eGuide printed p.14 / PDF page 15 ("Building in Debt"), `prima.txt:769-775`; `gamefaqs-maxx.txt:659` (community).
