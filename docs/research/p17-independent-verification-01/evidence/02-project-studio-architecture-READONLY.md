# Project: Studio — ARCHITECTURE FACT SHEET for P17 (read-only reconnaissance)

**Commit read:** `13370d428f0693f3279732f6f4cc360a7fcaa4df` ("Record P12 R05 Owner acceptance and P13 producer handoff", 2026-09-11). Every `file:line` below is at that commit unless a different ref is named. Method: `git -C "/Users/bruce/The Movies" show ${C}:<path>` and `git grep <pattern> ${C}` only. No checkout, no build, no tests, no runtime, no edits, nothing under `~/Library` or the player profile touched.

**Source-tier labels used.** `DEVELOPER/OFFICIAL (repo code @13370d42)` = the accepted engine source; `DEVELOPER/OFFICIAL (governance doc @<ref>)` = owner-accepted contract/register/ruling text; `DESIGN INFERENCE` = my reading of where a P17 seam would plug in. Nothing in this sheet is original-game evidence; that corpus belongs to other agents.

**Persistence identity at closeout:** protocol **4** / projection **29** / inner Save **V19** / outer checkpoint **1** (`bridge/schema/bridge-schema.ts:19,36`; `src/core/save.ts:363-368`; `docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md:27`).

---

## 0. Ten load-bearing facts (the rest of the sheet is the evidence)

1. A released film's identity is `FilmResult.productionId`; its title/genre are resolved *live* through `conceptId → state.concepts[].title` (FilmResult carries no title). Only `studioHistory.filmReleased.title`, `TalentCareerEvent.filmTitle` and rival `IndustryFilm.title` are frozen at release.
2. Exactly three principal acting seats exist (`CastSlot = 'lead'|'antagonist'|'support'`), and *every* code path that builds or consumes a cast requires all three (types, greenlight validator, casting slate law, reception, forecast, standing, participants, rival packaging, save validators). `FilmConcept.requiredSlots` exists but is read by ONE display function only; it cannot make a two-character film legal today.
3. Fame (`Talent.fame`, 0..100 Star Power) reaches box office through exactly two formula sites: `starDraw` (CAST_WEIGHT-weighted, 0.25 weight in segment appeal, Hill-saturated on opening reach when engaged) and `starAttention` (unweighted mean of the three cast fames → secondary Standing awareness term). It reaches money through `salaryCurve` (fame-dominant quadratic) at *quote time* (contract offers, freelancer fees), never by re-stamping `Talent.salary`.
4. Fame is updated by `computeStarPowerDelta` at release for player AND rival films through the same `applyReleaseCareers` producer; inputs are realized total gross, frozen role, audience score, locked forecast comparator, current fame. Deterministic; no RNG.
5. The greenlight forecast is locked onto `Production.forecastSnapshot` and copied (three scalars) onto `FilmResult.forecast`; expectations are consumed later by `computeStarPowerDelta` (forecastComparator), the newspaper (boxDelta), and broadcast (band comparison). Standing's `ReleaseBenchmarks` parameter is *dormant* under D-6.
6. Awareness has three producers only: release reach+star (standing.ts), publicity campaign lift (publicity.ts), and weekly drift (tick step 5.5). Marketing efficiency is a pure function of `preMarketingAwarenessOf(audienceAwareness, appealReach)` → `efficientMarketingCapacity`. These are the seams for "inherited awareness" and "franchise expectations" — both are pure helpers with explicit signatures; nothing needs a duplicate formula.
7. Rivals (P12) resolve releases through the *same* `resolveReception`/`buildFilmResult`/`updateStanding`/`applyReleaseCareers` chain as the player; rival choice is `chooseIndustryPackage` (bounded shape×billing×negative×marketing grid scored by expected operating margin) over a `policy = {version:1, affinities, negativeScale, marketingRatio, reserveWeeks}` whose keys are exact-validated. There is **no** franchise/sequel/StoryProperty identifier anywhere in `src/` (grep: zero hits).
8. Saves are forward-only, root-additive: each new version strips its new root(s), validates the frozen prior shape byte-for-byte, then validates the new root (V19 does exactly this with `hollywood`). Root keys are exact-checked (`V8_STATE_KEYS`…`V13_STATE_KEYS` + later per-version strips), so a `franchises` root means **SaveFileV20**, a new validator/converter, downgrade guards, and an entry in the `persistedProductionIds`/`persistedConceptIds` identity walks.
9. Save size is already a qualified miss: Hollywood storage 37.8 MB vs 8 MB target, average film 3,146 B vs 1.5 KB target, complete Save p95 **9.58 s**. Any P17 root must be compact and bounded.
10. Governance: P17 is keyed to an exact P16 `StoryProperty` ID, may not infer property from title/genre/cast/release order/studio/concept/presentation, may not mint rights; the P16+ parking lot and P13 branch docs carry **no** further P17 mechanics direction beyond the vocabulary already in contract §15 and register rows INT-012/HIS-014/SIM-009.

---

## (a) Film identity & permanence

### a.1 The permanent film record is `FilmResult` keyed by `productionId`; title is NOT on it

```ts
export type FilmResult = {
  productionId: string
  releaseTick: number
  delivered: Expression; cohesion: number; craft: number
  criticMean/criticSigma/criticScore/reviewVariance: number
  segmentScores: Record<SegmentId, number>
  boxOffice: { opening: number; total: number }
  conceptId: string        // B12: keeps released films attributable after the Production is gone
  directorId: string
  participants?: FilmParticipants   // D-11.A immutable participant record (engaged greenlights only)
  forecast?: { expectedCriticScore; expectedTotal; expectedOpening }  // D-11.C locked greenlight forecast
}
```
- source: `src/core/types.ts:241-264`; proves FilmResult has no `title`/`studioId`/rights field, only `conceptId`+`directorId`+optional frozen participants/forecast; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).
- `Studio.releasedFilms: FilmResult[]` (`types.ts:291-296`) is the player library; `buildFilmResult(r, meta)` assembles it (`src/core/reception.ts:833-852`); tick appends at `src/core/tick.ts:594-606`.

### a.2 Production (in flight) → FilmResult (permanent) joins

- `Production = { id, conceptId, shape, promise, writerId, directorId, craftIds, cast: Record<CastSlot,string>, budget, startTick, remainingTicks, forecastSnapshot: Forecast, participants? }` — `types.ts:225-239`. `Production.id` becomes `FilmResult.productionId` (`tick.ts:585-590`).
- `TheatricalRun = { productionId, conceptId, releaseTick, totalWeeks, weekIndex, weeklyGross[], studioShare, cumulativeGrossPaid, cumulativeStudioRevenuePaid, economyModelVersion, status }` — `types.ts:303-316`; "Kept as a HISTORY (never deleted)" (`types.ts:300`).
- Script project → production link: `ScriptProject.productionId: string|null` (`types.ts:699`); `MovieBlueprint.conceptId/projectId/writerId/generatedTitle/renamedWeek` (`types.ts:1416-1431`).
- source: as cited; proves the concept→script→production→film→run chain is joined by exact ids only; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### a.3 Title resolution is LIVE via conceptId; three frozen copies exist

- FilmResult has no title. Bridge industry projection resolves a player film's title as `concept?.title ?? f.productionId` at read time (`bridge/industry.ts:52-56`).
- `renameScreenplay` mutates `state.concepts[].title` in place and stamps `blueprint.renamedWeek`; the refusal law (`src/core/screenplay.ts:465-491`) checks only origin/length/control chars — **it does not refuse a rename after the film is released**, so a player original's live title can change post-release while frozen copies keep the release-time title.
- Frozen copies: `studioHistory` row `filmReleased.title` "display title frozen AT RELEASE (identity is productionId)" (`types.ts:1625-1631`, written at `tick.ts:610-620`); `TalentCareerEvent.filmTitle` "concept title, snapshotted at release" (`types.ts:1712`); rival `LiveIndustryFilm.title` captured at release (`src/core/hollywoodTick.ts:242`).
- source: as cited; proves P17 must key on `productionId`/`conceptId`, never on title (also mandated by contract §15); HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### a.4 FilmParticipants: the frozen cast/crew of ONE film

```ts
export type FilmParticipantRole = 'writer'|'director'|'lead'|'antagonist'|'support'|'craft'
export type FilmParticipant = { talentId; name /*AT GREENLIGHT*/; role; discipline; greenlightOVR; greenlightFit; greenlightEP; freelancer }
export type FilmParticipants = { writer; director; cast: Record<CastSlot, FilmParticipant>; craft: FilmParticipant[] }
```
- source: `types.ts:200-222`; captured at greenlight by `buildFilmParticipants(contracted, {writer,director,cast,craftHires}, concept, shapeEffects, promise, shape)` (`src/core/filmParticipants.ts:33-45`, called at `src/core/actions.ts:602-611` for engaged games and `hollywoodTick.ts:165` for rivals); frozen onto FilmResult at `tick.ts:594-604`. Proves per-film role association (lead/antagonist/support/director/writer/craft) already exists as immutable history — the natural input for P17's "franchise-role association" (direction F) without new person state; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).
- `flattenParticipants(p)` fixed order writer, director, lead, antagonist, support, craft… (`src/core/starPower.ts:37-39`).

### a.5 Release authority and studio history (P06A / P08A)

- `ReleaseCommitment = { productionId, commitmentId: 'release-commitment-<productionId>', committedAtWeek }`; `StudioReleaseAuthority = { commitments }`; "ABSENCE MEANS UNCOMMITTED … durable history lives in `studioEvents` ('releaseCommitted') and `releasedFilms`" (`types.ts:1523-1545`). Public functions: `releaseCommitmentRefusal`, `commitPictureToReleaseRefusal(state, productionId)`, `withReleaseCommitment`, `pruneReleasedCommitments`, `committedReleaseIds` (`src/core/releaseAuthority.ts:28-131`).
- `StudioHistoryEvent` union: `studioFounded | standingChanged{source,before,after,deltas,formulaVersion,facts} | standingDriftFolded | filmReleased{productionId,conceptId,title,firstRelease} | theatricalRunCompleted | facility* | careerMilestone{talentId,careerEventId,filmId,personName}`; subjects `studio|film{productionId}|person{talentId}|facility` (`types.ts:1566-1664`). Laws: monotonic eventId, exact source ids never titles, frozen minimal display facts, no seen/read state (`types.ts:1556-1565`).
- source: as cited; proves there is a forward-recording, subject-keyed history root whose `film{productionId}` subject is the existing hook for "franchise milestones" without a new event bus; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### a.6 Identity walks that a Franchise root MUST join (law 20)

- `persistedProductionIds(state)` walks every root that can carry a production id: activeProductions, releasedFilms, theatricalRuns, ledger, careerEvents, broadcastItems, coverageContexts, operations, scriptDevelopment, releaseAuthority, studioEvents, productionQueue, studioHistory, and all Hollywood films/careerEvents/businesses/receipts (`src/core/productionIdentity.ts:9-101`). Comment: "every new root that can carry a production identity joins this walk in BOTH directions the week it lands" (`productionIdentity.ts:44-45`).
- `persistedConceptIds` = `state.concepts` + activeProductions + releasedFilms + theatricalRuns + scriptDevelopment (`productionIdentity.ts:103-117`), extended for hollywood concepts (used at `hollywoodTick.ts:183`).
- source: as cited; proves a P17 root referencing `productionId`/`conceptId` must be added to both allocators or a re-mint becomes possible; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

---

## (b) Concept / screenplay identity; requiredSlots

### b.1 FilmConcept — eight fields, no lineage

```ts
export type RoleRequirement = { target: Persona; tolerance: number }
export type FilmConcept = { id; title; genre; baselineStrength /*0..100*/; originalityRaw /*0..100*/; baseNegativeCost; requiredSlots: CastSlot[]; roleRequirements: Record<CastSlot, RoleRequirement> }
```
- source: `types.ts:152-163`; proves the concept carries hidden strength/originality plus per-slot persona targets; no parent/sequel/property field; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).
- Minting: worldgen pool `c-NN` (`src/core/worldgen.ts:552-619`; `requiredSlots: [...SLOT_ORDER]` at `:614`) and original screenplays `concept-orig-NNNN` via `mintOriginalConcept(seed, conceptId, genre)` (`src/core/screenplay.ts:155-197`; `requiredSlots: [...SLOT_ORDER]` at `:194`; "EIGHT FIELDS … not one more (law 2)" `:151-152`). Rival concepts use the same mint (`hollywoodTick.ts:184`) and live in `HollywoodState.concepts` (`hollywoodTypes.ts:117`).
- Title: `generateScreenplayTitle(seed, conceptId, genre)` (`screenplay.ts:142-144`); rename law §a.3.
- Originality enters critic score only: `originalityRaw = clamp(concept.originalityRaw + shapeEffects.originalityMod, 0, 100)`; `originalityContribution = remap(max(0, o−50),0,50,0,ORIGINALITY_MAX_BONUS)·lerp(0.55,1,cohesion) − remap(max(0,50−o),0,50,0,DERIVATIVENESS_MAX_PENALTY)` (`src/core/reception.ts:410-418`; mirrored in forecast `src/core/forecast.ts:232-238`). **This is the one existing "derivativeness" lever** — a concept below 50 originality is penalized at the critic; there is no audience-side novelty/fatigue term anywhere.
- baselineStrength enters `scriptStrength = override ?? 0.6·baselineStrength + 0.4·effectiveSkill(writer)` (`reception.ts:208-221`) and the engaged-only `scriptPotentialAppealDelta(baselineStrength, craft, engaged)` audience-ceiling term (`reception.ts:461-468,510`).
- Concept claim: a concept is claimed permanently by any script project (`src/core/scriptReadModel.ts:618-631`); future-proofing scout: "a `FilmConcept.id` is a permanent identity. It may never be removed, reassigned, or re-minted" (`docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:137-138`).

### b.2 Could `requiredSlots` express a two-character film today? **NO** — enforcement is elsewhere

- `requiredSlots` is READ at exactly one site: `src/core/filmPackage.ts:286` inside `packageFit`, and only to decide whether an *undefined* UI-draft actor should be listed under `unfilled` ("A cast slot may be legitimately unfilled in a UI draft; report it, don't invent" `:284-288`). It is a display roll-up, never a validator.
- Everything else requires all three seats unconditionally:
  - `CastSlot = 'lead'|'antagonist'|'support'` (`types.ts:19`); `Production.cast: Record<CastSlot,string>` (`types.ts:233`); `GreenlightScriptProjectPayload.cast: Record<CastSlot,string>` (`types.ts:720`); `CastingSlate = Record<CastSlot,[string,string]>` (`types.ts:761`).
  - Greenlight validator: `for (const slot of CAST_SLOTS) { requireTalent(state.talent, p.cast[slot], …) }` — an absent id throws (`actions.ts:391-397`); three ids must be distinct (`:405-411`); whole-production single-role uniqueness writer/director/craft/cast (`:413-431`).
  - Casting slate law: each of the three slots must contain exactly `CASTING_CANDIDATES_PER_ROLE = 2` candidates and the slate ≥ `CASTING_MIN_UNIQUE_CANDIDATES = 3` distinct people (`src/core/castingSessions.ts:121-140`; constants `src/core/tuning.ts:1662-1663`).
  - Reception iterates `CAST_SLOTS` for castExecution, contributions, starDraw (`reception.ts:42, 236-251, 320-327, 496-507`); ROLE_WEIGHT and SLOT_TRANSFORM are keyed on all three (`tuning.ts:1671-1685`).
  - Standing `starAttention = mean(lead, antagonist, support)` (`src/core/standing.ts:77-79`); tick builds `castFames` for all three (`tick.ts:655-659`).
  - Rival packaging fixes `actors.slice(0,3)` and requires `actors.length===3` (`hollywoodTick.ts:148-150, 192-194`); billing permutations are over exactly three (`src/core/hollywoodPolicy.ts:18`).
  - Save validators enumerate `requiredSlots` against `CAST_SLOTS` and validate `Production.cast` per slot (`src/core/save.ts:1587-1601`, `v8Production`).
- source: as cited; proves "A two-character drama must remain legal in 1995" (direction T) is **not** satisfiable by data today — it needs a schema/validator change in every layer above, and the SLOT_ORDER/CAST_WEIGHT denominators (`Σ CAST_WEIGHT`) would need a "slot absent" rule; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42). Owner-direction note: T says "More slots = capacity, not requirement" — today's engine is the opposite (three seats = requirement).
- Who may fill a seat: `requireRole` is a has-discipline check that every Talent passes ("Cross-discipline eligibility (OQ-1) makes any talent legal for any assignment", `actions.ts:299-307, 416-417`); `CreativeRole = 'writer'|'director'|'actor'|'craft'` is a primary profession only (`types.ts:18,110`). There is no "musician/athlete/TV personality" talent kind — direction U's famous non-actor cameo has no talent type today; DESIGN INFERENCE from those locators.

---

## (c) Casting architecture and how fame drives salary

### c.1 Weights

- `CAST_WEIGHT = { lead: 1.0, antagonist: 0.6, support: 0.35 }` (`tuning.ts:1657`) — used for castExecution and starDraw.
- `ROLE_WEIGHT = { writer 1.0, director 1.6, lead 1.4, antagonist 0.8, support 0.5, shape 1.2 }` (`tuning.ts:1678-1685`) — expressive centroid.
- `SLOT_TRANSFORM` antagonist flips intimacy (`tuning.ts:1671-1675`).
- `STAR_POWER_ROLE_WEIGHTS = { lead 1.0, antagonist 0.7, director 0.55, support 0.45, writer 0.35, craft 0.2 }` (`tuning.ts:571-578`) — fame gain/loss visibility per frozen role.
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### c.2 Fame → reception (exactly two sites)

- `starDraw = 100·clamp(Σ CAST_WEIGHT[slot]·fame/100 / Σ CAST_WEIGHT, 0, 1)` (`reception.ts:493-500`); engaged opening variant substitutes `fameReach(fame) = f/(f+FAME_REACH_HALF_SAT=50)` (`src/core/economy.ts:17-20`, `tuning.ts:418`) → `starDrawOpening` (`reception.ts:501-507`).
- `segmentAppeal = clamp(0.35·craft + 0.25·starDraw + 0.25·fit + 0.15·(timeliness·5) + segmentAffinity − mismatchPenalty + potentialDelta, 0, 100)` (`reception.ts:518-528`); opening copy uses `starDrawOpening` (`:530-542`). Legs/audience score keep linear starDraw (`:685-689`).
- Discoverability support: `reachSupport = 0.55·awarenessFactor + 0.45·starDraw/100` gates the D-13 opening variance (`reception.ts:737-750`; `tuning.ts:476-489`).
- source: as cited; proves fame is a modest additive appeal term plus a reach-support term, never a gross multiplier; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### c.3 Fame → forecast

- Causal factor `castFame` fires when `centers.starDraw >= 60` (first in precedence) (`forecast.ts:362-363`); uncertainty `unknownLead` fires when `!(lead.fame >= 60)` (`knownLeadTrackRecord`, `forecast.ts:299-300, 342`); confidence points also from `knownDirectorGenreRecord` (any prior credit this run OR cross-studio `directorCredits`), `establishedSegmentHistory` (owner's own releases only), `promiseIsSpecific` (`forecast.ts:302-336`). `forecastHistoryForOwner` supplies per-owner releasedFilms/concepts and cross-company director credits: "A person's released credits follow them; company segment history stays with its owner" (`src/core/industryCareer.ts:4-23`).
- `ForecastFactorKey` union (`types.ts:1881-1892`) is a closed enum — a `franchiseExpectation` causal/uncertainty key would widen it (validated? it is on `SegmentForecast` inside `Production.forecastSnapshot`, a persisted leaf; DESIGN INFERENCE: treat as frozen-leaf risk, prefer a separate P17 read model).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### c.4 Fame → Standing

- `starAttention(ctx) = clamp(mean(lead,antagonist,support fame)/100, 0, 1)`; `awarenessDelta = clamp(7·(reach − reachNeutral) + 1.2·starAttention, ±6)` with `reachNeutral` 0.45 engaged / 0.58 legacy (`standing.ts:75-79, 153-175`; `tuning.ts:89-110`). Prestige reads critic only; confidence reads ROI and budget overrun only (`standing.ts:177-200`). `STANDING_FORMULA_VERSION = 'standing/d6-2026-07-26+d17b-e1'` (`standing.ts:99`); receipts freeze `StandingChangeFacts.releaseResult{reach01, reachNeutral, starAttention01, criticScore, prestigeBenchmark, roi, budgetOverrun01}` (`types.ts:1575-1587`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### c.5 Fame updates after release (player and rival, one producer)

- `computeStarPowerDelta({fameBefore, role, realizedTotal, audienceScore, expectedTotal})`: `reach01 = total/(total+10M)`; `audGain = clamp((aud−40)/(65−40), 0, 1.2)`; `fcMult = clamp(1+0.3·(total/expectedTotal − 1), 0.85, 1.15)`; `room = ((100−fame)/100)^1.6`; `gain = 9·roleWeight·reach01·audGain·fcMult·room`; `loss = 16·roleWeight·reach01·clamp((45−aud)/45,0,1)·(fame/100)^1.5`; `delta = clamp(gain−loss, −4, +10)` (`starPower.ts:67-120`; constants `tuning.ts:552-568`). Reason codes incl. `exceededCommercialExpectations` (≥1.15) / `missedCommercialExpectations` (≤0.85) (`starPower.ts:141-142`).
- Applied by `applyReleaseCareers(seed, talent, records)` to post-development talent, one frozen `TalentCareerEvent` per participant (`src/core/releaseCareers.ts:12-80`); the tick merges player and rival growth records in canonical film-id order and applies once (`tick.ts:893-908`); rival growth records are produced at `hollywoodTick.ts:254-256`.
- `TalentCareerEvent` = `{ eventId '${filmId}:${talentId}', talentId, filmId, filmTitle, releaseWeek, genre, role, billingWeight, discipline, ovrBefore/After, skills*, genreExp*, workHistory*, starPowerBefore/After/Delta, realizedOpening/Total, audienceScore, criticScore, forecastComparator, reasonCodes }` (`types.ts:1708-1736`) — player rows in `state.careerEvents`, rival rows in `hollywood.careerEvents` (`tick.ts:902-908`).
- source: as cited; proves P14-owned fame already reacts to "expectations" through the locked forecast comparator — P17's "higher expectations / bigger reputational downside" (direction B) can be expressed by what P17 feeds into `expectedTotal`, not by a second fame formula; HIGH (code) / DESIGN INFERENCE (last clause); DEVELOPER/OFFICIAL (repo code @13370d42).

### c.6 Salary: exactly how fame drives it today

- `salaryCurve(talent) = SALARY_BASE + SALARY_SKILL_COEF·(primaryOVR/100)² + SALARY_FAME_COEF·(fame/100)²` = `25,000 + 150,000·s² + 600,000·f²` (`worldgen.ts:152-167`; `tuning.ts:71-73`). Fame coefficient is 4× the skill coefficient — "convex/fame-dominant" (`worldgen.ts:154`). At fame 100 the fame term alone is $600k per production; at fame 50 it is $150k.
- `Talent.salary` is stamped **only** at generation/creation (`worldgen.ts:536`, `actions.ts:883,1032,1220`) and explicitly preserved on load (`save.ts:6275` "unchanged … no ledger drift on load"). No release path re-stamps it (grep for `.salary =` in `src/core`: creation sites only). The legacy Standing committed-cost uses this stale `talent.salary` (`tick.ts:653-664`).
- Live pricing calls `salaryCurve` at quote time: `offerForTalent(seed, talent, termWeeks, week)`: `annual = round(salaryCurve × CONTRACT_ANNUAL_MULT(3.0) × lengthFactor × ageFactor × jitter)`, signing bonus a fraction (`src/core/employment.ts:206-250`; `tuning.ts:378-394`); `freelancerFee(state, talent) = round(salaryCurve × FREELANCER_FEE_PREMIUM(1.5) × annexMultiplier)` (`employment.ts:287-291`). Harness note confirms: "salaryCurve is ALSO called at use time by offerForTalent/freelancerFee, so a mid-run change moves contract and fee quotes but not talent.salary" (`src/harness/d16/experiment.ts:59`).
- Rivals price with the same `offerForTalent` (`hollywoodTick.ts:97,125`; `hollywood.ts:179`).
- source: as cited; proves "fame → salary" is one pure function of the person, with no film/franchise context; direction R ("P17 changes no salary") is satisfiable by leaving `salaryCurve` untouched and letting P14/P17 express "talent interest/salary expectations" only through the existing offer path if P14 later adds a context multiplier; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42). Note: no "escalating sequel salary demand" exists today — the only escalator is fame growth through `computeStarPowerDelta`.

### c.7 Casting sessions / candidates (for completeness)

- Casting Sessions V1: `CastingSession = { id, projectId, status 'auditioning'|'review'|'complete', slate, startedWeek, dueWeek, reservation, results: CastingResults|null }`; audition evidence "deliberately excludes hidden execution truth, talent attributes, RNG state" (`types.ts:750-798`). Greenlight of a managed project requires the session `complete` (`actions.ts:342-353`).
- Headless candidate grid `generateCandidates(state, tick)` drops double-cast packages (M16) (`src/core/candidates.ts:1-26,157`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

---

## (d) Awareness, expectations, marketing — the exact seams

### d.1 The three producers of `audienceAwareness` (P08 owns the channel; P17 must not add a fourth formula)

| Producer | Signature | Where |
|---|---|---|
| Release result | `updateStanding(standing, r: FilmResult, _b: ReleaseBenchmarks /*dormant*/, ctx: StandingContext): Standing` with `StandingContext = { castFames, actualNegative, requiredNegative, baseMarketValue, marketing, salaries, engaged }` | `standing.ts:143-207`, `:61-73`; called at `tick.ts:783` (player) and `hollywoodTick.ts:250-252` (rival) |
| Publicity campaign | `publicityLiftAt(tier, awareness) = maxLift·(1−awareness/100)^6`; `publicityOffer(state, tier)`; tiers whisper/push/blitz $1.2M/$3.6M/$8M, maxLift 18/30/42, cooldowns | `src/core/publicity.ts:26-32,35`; `tuning.ts:137-143`; `StandingChangeSource.publicity` `types.ts:1571` |
| Weekly drift | `awareness' = awareness − 0.04·max(0, awareness − 35)` engaged only | `tick.ts:825-853`; `hollywoodTick.ts:277-278`; `tuning.ts:120-121` |

- `StandingChangeSource` is a closed union of exactly those three (`types.ts:1568-1572`); `Standing` itself is a frozen three-key leaf reachable from GameStateV2 — "a fourth channel retro-changes V1–V13 at once" (`docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:117-119`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### d.2 Marketing efficiency chain (pure helpers, no state)

- `appealReachSum(segments, openingSegmentAppeal) = Σ share·(appeal/100)^1.8` (`reception.ts:556-565`).
- `preMarketingAwarenessOf(audienceAwareness, appealReach) = clamp(0.7·A/100 + 0.3·appealReach, 0, 1)` (`reception.ts:571-578`; `MARKETING_AWARENESS_STANDING_WEIGHT` `tuning.ts:447`).
- `efficientMarketingCapacity(preMarketingAwareness, engaged) = 15,000 + (1,800,000 − 15,000)·pma^1.3` (`reception.ts:586-592`; `tuning.ts:445-448`).
- In `computeBoxOffice(...)`: `marketingQuality = m/(m+capacity)`; `marketingReachCeiling = 0.1 + 0.45·pma`; `effectiveMarketing = ceiling·quality`; `baseAwareness = clamp(0.52·A/100 + effectiveMarketing)`; `awarenessFactor = clamp(baseAwareness·(1 + specificity·effectiveMarketing·PROMISE_MAX_BONUS/100))`; opening = `baseMarketValue·Σ share·awarenessFactor·appeal^1.8 · openingReachMult · economyScale · setNoveltyFactor`; overexposure (spend ÷ capacity > 1.3) shrinks legs when delivery is weak (`reception.ts:597-768`).
- Menu: `marketingCapacityFor(state, pkgInputs)` / `marketingCapacityForInputs(pkgInputs, engaged)` → `marketingMenuFromCapacity(capacity) = [round(1.3c), round(2.4c), round(3.7c)]` (`src/core/marketingMenu.ts:75-116`) — "Reproduced here through the extracted reception helpers rather than a duplicated formula, so the two can never drift" (`:68-69`). Rivals use the same menu (`hollywoodPolicy.ts:49`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### d.3 Forecast lock vs realized

- Lock: `forecastSnapshot = computeForecast(inp, ctx, engaged, engaged)` at greenlight, stored on `Production` (`actions.ts:504-520, 613-627`); rival equivalent `hollywoodTick.ts:162-164`. Engaged central estimate = deterministic center (offset dropped), band ± `CONFIDENCE_INTERVAL_WIDTH[confidence]` + engaged `FORECAST_DOWNSIDE_WIDEN` low-side only (`forecast.ts:406-465`).
- Copy to result: `FilmResult.forecast = { expectedCriticScore, expectedTotal, expectedOpening }` (`tick.ts:594-604`; rival `hollywoodTick.ts:240`).
- Consumers of the locked expectation: `computeStarPowerDelta.expectedTotal` (fame, §c.5); newspaper `boxDelta = deltaOf(boxOffice, expectedTotal, 10% band)` / `criticDelta` (`src/core/newspaper.ts:571-574`); broadcast `forecastBand = band(Σ share·estimate)` vs `realizedBand = band(weightedAudienceScore)` → `direction` (`src/core/broadcast.ts:85-112`; `BroadcastFacts` `types.ts:1920-1927`). Standing's `ReleaseBenchmarks` is "RETAINED … DORMANT under D-6" (`standing.ts:44-51, 146`).
- `receptionVerdict.ts` supplies display tiers only: `criticBand` flop/mixed/hit/smash at 40/60/80, `criticTier`, `audienceTier`, `aggregateAudienceScore`, `filmAudienceScore(state, film)`, `filmCommittedCost(state, productionId)` (`src/core/receptionVerdict.ts:21-117`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### d.4 Where "franchise expectations" and "inherited awareness" plug in (DESIGN INFERENCE, seams named exactly)

| P17 concept | Cleanest seam (no duplicated formula) | Owner of the seam |
|---|---|---|
| Inherited awareness / marketing leverage of a continuation | Feed a P17-derived `appealReach`-like term or a bounded awareness *input* into `preMarketingAwarenessOf(audienceAwareness, appealReach)` at the call sites `reception.ts:649-652` and `marketingMenu.ts:87-96` — i.e. add an optional `ReceptionInputs` field (like `setUplift`/`setNovelty`, `reception.ts:102-103`, which are the house precedent for an "absent = bit-exact no-op" optional input) that P17 populates for continuations; P07 keeps the formula | P07 reception (formula) ← P17 (input value) |
| Fan attention on opening | Same optional-input pattern into `reachSupport`/`awarenessFactor` (`reception.ts:666-676, 737-741`) — additive to `baseAwareness`, clamped, engaged-only | P07 |
| Higher expectations (direction B) | `Production.forecastSnapshot` is the locked expectation; a continuation's expectation can be raised by what the forecast *reads* (the same optional input), so `FilmResult.forecast.expectedTotal` is higher → `computeStarPowerDelta.fcMult` and newspaper `boxDelta` judge against it with **no new formula** | P11 forecast / P14 fame consume; P17 supplies input |
| Reputational downside for the property | P17-owned: Recognition/Momentum/Fatigue updated from the *public* `FilmResult` (criticScore, boxOffice, segmentScores) and `filmAudienceScore` — reading, never writing, P07/P08 results | P17 |
| Studio-level awareness change | Do NOT add a `StandingChangeSource`; awareness already moves through `updateStanding` from reach+star. P17 reach effects arrive through the film's box office (§d.1) | P08 |
| Marketing efficiency of a known property | Falls out of the awareness input above (capacity ∝ pma^1.3), no separate multiplier | P07/P11 |
| Rival parity | `chooseIndustryPackage` already runs `computeForecast`/`marketingCapacityForInputs` over `ReceptionInputs` — any optional-input seam is automatically available to rival packaging (`hollywoodPolicy.ts:41-52`) | P12 |

- Rationale for the optional-`ReceptionInputs`-field pattern: C2a-M2 added `setUplift?`/`setNovelty?` exactly this way with the stated law "ABSENT is the whole legacy world … a bit-exact IEEE no-op … keeps every pre-C2a path byte-identical" (`reception.ts:87-103`) and the multiplier is applied "at exactly the point `economyScale` is applied" (`reception.ts:619-629`). Confidence MEDIUM (it is a recommendation, not code); DESIGN INFERENCE.

---

## (e) Rivals (P12): how projects are chosen, resolved, and what a franchise decision would attach to

### e.1 Data model

- `RivalBusiness = { studioId, entryKey, account: RivalAccount, standing: Standing, operations: StudioOperations, development: ScriptDevelopment, productions: Production[], activeScriptOrdinals, activeRunFilmOrdinals, releaseAuthority, runs: TheatricalRun[], projects: RivalProjectCosts[], nextDecisionWeek, policy: { version: 1; affinities: Record<Genre, number>; negativeScale; marketingRatio; reserveWeeks } }` (`src/core/hollywoodTypes.ts:79-95`).
- `IndustryFilm = AuthoredFilm | LiveIndustryFilm`; `LiveIndustryFilm = FilmIdentity{filmId, studioId, conceptId, title, genre, credits[]} & { provenance 'simulation/v1', scriptProjectId, result: FilmResult, directCommitment, studioRevenueReceived, settledWeek, releaseCommitmentId }` (`hollywoodTypes.ts:19-46`).
- `HollywoodState = { version: 1, …, identities: StudioIdentity[], businesses, employment, concepts: FilmConcept[], films: IndustryFilm[], careerEvents, receipts: IndustryReceipt[], chart, previousChart }` (`hollywoodTypes.ts:105-124`); `IndustryReceipt` kinds `studioEntered | employment | filmAnnounced | filmReleased{before,after Standing} | filmSettled` (`:96-103`).
- Validator: `exact(b.policy,['version','affinities','negativeScale','marketingRatio','reserveWeeks'])`, `policy.version === 1`, affinities 0..10, negativeScale .5..2, marketingRatio 0..1 (`src/core/hollywoodValidation.ts:204-211`); business keys exact (`:204`).
- source: as cited; proves rival films reuse `FilmResult` verbatim (same P07 law) and that the policy shape is closed — a franchise dimension needs `policy.version: 2` (or a sibling root) plus validator/migration; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### e.2 Seeding of policy weights

- `policy = { version:1, affinities: genre ∈ template.anchors ? 5 : 1, negativeScale, marketingRatio, reserveWeeks }` from the authored manifest (`src/core/hollywood.ts:156-157`); manifest rows e.g. Bellwether `anchors:['comedy'], negativeScale 1.0, marketingRatio .18, reserveWeeks 13` … nine studios (`src/core/hollywoodStartingData.ts:8-38`); "Live popularity is unavailable: policy uses genre affinity only" (`:6`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### e.3 How rival projects are chosen (`decide`)

1. Every `HOLLYWOOD_DECISION_WEEKS = 1` week (`tuning.ts:27`), if a `ready` script exists and no production is active, assemble director + first three free actors + craft, and call `chooseIndustryPackage(inputs, policy, { seed, key, cashAvailable, weeklyCost, lockScreenplay: true })` (`hollywoodTick.ts:139-173`).
2. Else, if fewer than 2 active scripts and cash ≥ operating reserve, draw a genre by `policy.affinities` roulette from `stream(seed,'hollywood-v1', '<studio>:package:<ordinal>')`, mint a concept, pick a shape/promise by genre defaults, and run `chooseIndustryPackage(..., lockScreenplay:false)` to commission (`hollywoodTick.ts:175-209`).
- `chooseIndustryPackage` enumerates `SHAPES(6) × BILLINGS(6) × HOLLYWOOD_NEGATIVE_CHOICES[0.65,0.85,1.05]×negativeScale × marketingMenuFromCapacity(3)` on *perceived* inputs (`perceivedPlanningInputs`: hidden persona/strength/originality replaced by perceived or `HOLLYWOOD_UNASSESSED_ESTIMATE=50`), scores `expectedOperatingMargin − |marketing/negative − marketingRatio|·HOLLYWOOD_POLICY_PREFERENCE_COST(25,000)`, picks the max; "Bounded legal menu, never a winning-film oracle" (`hollywoodPolicy.ts:19-66`; `tuning.ts:27-32`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### e.4 How rival releases resolve (same law)

- `resolveReception(inp, stream(seed,'hollywood-v1', '<prodId>:reception'), true, true, discoveryZ)` → `buildFilmResult` → `{...base, participants, forecast}` → `openTheatricalRun` → `updateStanding(before, filmResult, forecastSnapshot, {castFames, …, engaged:true})` → receipt `filmReleased{before,after}` → growth record for `applyReleaseCareers` (`hollywoodTick.ts:235-258`). Weekly run payments and settlement (`:260-276`), awareness drift (`:277-278`), payroll/overhead/opex (`:279-282`).
- Rival forecast uses `forecastHistoryForOwner(state, studioId)` — own releases + cross-studio director credits (`hollywoodTick.ts:162-163`; `industryCareer.ts:17-22`).
- source: as cited; proves "outcome legality not player-only" (direction K) is already the architecture for reception/standing/fame; HIGH; DEVELOPER/OFFICIAL (repo code @13370d42).

### e.5 What a compact rival franchise decision would attach to (DESIGN INFERENCE)

- The decision point is `decide()` step 2 (commission) at `hollywoodTick.ts:175-184`: today the only creative choice is a genre roulette over `policy.affinities`. A continuation choice would be one more bounded branch there ("commission continuation of property X" vs "original"), scored by the *same* `chooseIndustryPackage` over inputs carrying the P17 optional field from §d.4 — no second forecast. It attaches to `RivalProjectCosts` (needs a P17 continuation reference, id-keyed) and to the P17 root, never to `FilmResult`.
- The weight lives in `policy` — register SIM-009 calls the later "technology/franchise/recovery choices" a *dormant* policy dimension (see §g). Adding it requires `policy.version: 2` and `hollywoodValidation.ts:208-211` widening; MEDIUM; DESIGN INFERENCE.
- Rights symmetry: rivals have no rights model at all (nothing in `src/` mentions rights/property); P16 must give rivals the same `StoryProperty` ownership before P17 can let them continue anything (direction K + L); HIGH that it is absent; DEVELOPER/OFFICIAL (repo code @13370d42).

---

## (f) Persistence & size

### f.1 Version chain and the additive-root law

- `SaveFileV19 = { saveVersion: 19; seed; state: GameStateV19; broadcastCache }` (`save.ts:363-368`); `GameStateV19 = GameStateV18 & { hollywood: HollywoodState | null }`; `GameState = GameStateV19` (`types.ts:1689-1690`).
- Pattern (V19): `validateSaveV19` requires the `hollywood` key, strips it, validates the remainder as a frozen V18 save, then validates `hollywood` with per-leaf validators (`save.ts:7228-7248`); `convertV18ToV19 = makeSave(initializeHollywood(state,'migration'))` (`:7250-7253`); every older `migrateToVn` refuses to downgrade a V19 (`:7072, 7139, 7147, 7160, 7176, 7202`). Same shape at V18 (`foundingRegime` strip → `validateSaveV17`, `save.ts:4936-4987`).
- Root keys are exact-checked: `V8_STATE_KEYS` … `V13_STATE_KEYS` (`save.ts:896, 2992, 3316, 3550, 3796, 3943, 3992`), later versions by strip-then-validate. So an unknown `franchises` key fails validation today → **any P17 root = SaveFileV20**.
- Governing doctrine: ADR-0004 "writes exactly one current version and imports supported older versions through pure, ordered, forward-only migrations … Migration must preserve permanent IDs, deterministic RNG state, rules-relevant history … Unsupported future versions, malformed input, and downgrade attempts fail loudly … Each new save version requires deterministic migration coverage, current-format round-trip coverage, and evidence that a migrated continuation matches the defined gameplay invariants" (`docs/adr/0004-forward-only-versioned-saves.md:14-27`).
- Frozen-leaf rule: "era timelines, rank, prestige and award weight land on a NEW root (the V12→V13 `property` template) or as a derived read model. Frozen leaf shapes — `EraConfig`, `Standing`, `CulturalForce`, `SegmentId` — are never widened in place" (`docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:123-126`); P12 design: "Do not add speculative nullable fields to frozen leaves simply to 'future-proof' them. Record the relationships the later implementation must be able to add through new versioned roots" (`docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:927`).
- Roadmap §8/§10 (p13-p15 branch): "`ownershipEvents` / ownership relations | P16+ only | Acquisition, merger, library/IP transfer, co-production rights, and ownership transactions never enter a P15 root" and "One package owns one explicit save-version step at a time … no P15 root may be pre-created as a misleading 'empty future slot'" (`hspector-github/codex/p13-p15-long-range-research-01:docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md:260, 289`).
- Bridge: "P12 must register authentic outgoing27 when its implementation changes the schema and extend both slot migrations for justified new roots" (`docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:441`) — i.e. a P17 DTO change bumps `PROJECTION_VERSION` (29) and the runtime checkpoint migrations.
- source: as cited; HIGH; DEVELOPER/OFFICIAL (repo code + governance docs @13370d42 / p13-p15 branch @137ab603).

### f.2 What a Franchise root would cost — the pattern it must follow

- Must: (1) be a new top-level root (`franchises`/`storyProperties` — P16 first) on `GameStateV20`, absent-safe on every pre-V20 fragment (the `(state as Partial<GameState>).releaseAuthority ?? []` defensive read at `productionIdentity.ts:42-43` is the precedent); (2) carry only exact ids (`productionId`, `conceptId`, `talentId`, `studioId`) — never titles; (3) join `persistedProductionIds`/`persistedConceptIds` (§a.6); (4) be validated leaf-exact in `save.ts` and, if projected, in `bridge/schema` with a projection bump; (5) migrate from V19 by seeding an **empty** root (no inference of past franchises — contract §15 and INT-012 forbid inferring property from history).
- Size: PERF-009 budgets "active rival ≤100 KB; film ≤1.5 KB; … P12 save ≤8 MB full/≤10 MB stress" are already **missed**: "Hollywood 37,829,874 B / film 3,146.43 B exceed size targets" (`docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md:183, 320-322`); "Large-world complete Save p95 remains 9.58 seconds (9,577.75375 ms; 20 measured samples after three excluded warmups). Native Save response remains 10.54 seconds" (`docs/campaigns/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md:38-40`); retained as an open qualification by the P12→P13 handoff (`docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md:35`). Direction M's "lightweight persistent Franchise identity" should therefore be a handful of scalars + id lists per franchise (Recognition/Momentum/Fatigue, installments[], branches[], subProperties[], rightsOwnerRef, recentActivity, keyAssociations[], milestones[]) — never a copy of film results or participants; DESIGN INFERENCE, MEDIUM.
- Public projection: `bridge/industry.ts` builds an immutable per-state index of studios/films/people/credits/activities from `hollywood.*` + `studio.releasedFilms` ("Public facts only … there is no combined Power score", `bridge/industry.ts:110`); films carry `filmId, studioId, conceptId→title, genre, provenance, criticScore, audienceScore, openingGross, totalGross, runStatus` (`:40-56`). A P17 public projection (franchise page) would be a sibling lane on this index, not a new authority; DESIGN INFERENCE.

---

## (g) Governance text — verbatim quotes

### g.1 `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` §15 (lines 348-405)

> ## 15. P12 → P16, P17, and P18
>
> The durable Owner ruling parks these future systems collectively in **P16+**. This Revision 02 clarification makes their documentation ownership boundary exact: `P16 Library/Rights → P17 Franchises/Continuations → P18 Television/Cross-Media`. The allocation is not implementation approval or a promise that any system ships; every package remains separately gated. *(:350-353)*
>
> ### P16 — Library/Rights and future ownership transactions
>
> P12 preserves:
> - immutable studio, film, project, person, and credit identities after closure or ownership change;
> - the exact original creating studio for every work;
> - durable filmography, release, credit, and archival studio facts; and
> - additive source-reference seams without claiming a property, right, owner, or continuation.
>
> P16 establishes the durable `StoryProperty` and Film Library identities behind one or more exact works. P16 owns origin-work relationships, chain of title, rights ownership, rights licensing, restoration and reissue authority, dated ownership history, and ownership transactions and acquisitions where later authorized. It may also later own mergers, valuation, stakes, labels/subsidiaries, co-productions, contract assumption/consent, and multi-party rights/finance shares under a separate Owner charter. P12A creates none of those identities, relationships, rights, or behaviors.
>
> A P12 concept, project, film, title, studio association, credit, or archive entry is not itself a `StoryProperty`, Film Library, origin-work relationship, or rights fact. Under later separate authority, P16 must create each property/library identity and origin-work relationship explicitly by exact ID; it may not infer or bulk-mint them from resemblance or presentation data. *(:355-375)*
>
> ### P17 — Franchises/Continuations
>
> P17 consumes exact P16 `StoryProperty`, Film Library, chain-of-title, rights, and licensing authority plus P12's exact work history. P17 owns continuation proposals; direct sequels, prequels, remakes, reboots, legacy sequels, and spinoffs; explicit parent/child continuation-work lineage; continuity branches; franchise condition and development behavior; franchise trust, heat, fatigue, identity, reach, and related later-approved franchise state; Story DNA expansion; crossovers; and shared-universe behavior.
>
> Any P17 franchise identity is an operational aggregate keyed to an exact P16 `StoryProperty` ID, never a second property or rights identity.
>
> P17 may not create or infer a `StoryProperty` from title, genre, cast, release order, current studio, similar concepts, presentation copy, or array position. It may not create a right or licensing authority merely because a franchise behavior wants to use one. Rights licensing remains P16 authority; P17 governs only authorized franchise use of owned or licensed rights. *(:377-392)*
>
> ### P18 — Television/Cross-Media
>
> P12 preserves studio/person/project identity, employer/availability, credits, abstract capability/capacity, public-event, and finance-link seams. P18 may later consume P10/P14 availability for writers, directors, performers, and showrunners plus P13 technology, P15 market facts, and exact P16 rights/licenses. P18 owns television; limited and ongoing series; seasons; renewals and cancellations; streaming; cross-media operations; platform/distribution behavior; and television/platform licensing and production where applicable. The latter is a domain workflow under exact P16 grants: P16 remains the sole author of the underlying legal right/license, parties, scope/media, territory, term, exclusivity, and consideration. P18 may not infer availability from an old credit, duplicate P16's rights authority, or invent television/streaming facts before its own charter. *(:394-405)*

Consumer-matrix row (`:418`): "| P17 | exact P16 `StoryProperty`/rights plus P12 work history | continuation proposals and explicit parent/child continuation-work lineage; sequels/prequels/remakes/reboots/legacy sequels/spinoffs; franchise state/behavior keyed to P16 property ID; Story DNA; crossovers/shared universes | property, ownership, or rights by title/genre/cast/release/studio/concept/presentation/list inference |".

- source: as cited; HIGH; DEVELOPER/OFFICIAL (governance doc @13370d42).

### g.2 `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` rows (column order per header at `:70`: ID | Original normalized obligation | Source section | Original disposition | Current disposition | Original C/E/Q/D/O/F/X | Producer → consumer | Proof needed | Refresh trigger | Superseding authority / refresh)

- **SIM-009** (`:110`): "Represent rival personalities as bounded seeded policy weights affecting genre preference, scale/portfolio, prestige/commercial appetite, cadence/reserves, talent continuity/freelancing, risk/wait/cancel behavior, and later technology/franchise/recovery choices. | DES §§17–19,31; ANN §§C,D,R; MISSION §15 | Adopt/adapt weighted strategy recommendation | Bounded policy remains core; favor genre anchors/trend-read responsiveness. Budget/scale/prestige/reserve dimensions are explicit proposed successor enhancements, not historical classes or guarantees; later-authority dimensions dormant | Y/Y/Y/market/tech/churn dependencies/—/P13,P14,P15,P17/— | Registry/policy authority → decision model/observed profile | Multiple policies choose different legal actions under same state; no guaranteed outcome | P13/P14/P15/P17 integrations | LH original-game evidence delta |"
- **HIS-014** (`:169`): "Preserve Legacy-ready 1920–2040 facts: longest-lived/greatest rival only under authored definitions, peak/final Standing, durable films/records/awards/milestones, dated studio arcs/ownership, cross-studio careers, real market overlaps, later Power summaries, P16 StoryProperty/library/rights/ownership history, and P17 explicit parent/child continuation-work and franchise lineage. Never persist "archenemy," "greatest rivalry," or head-to-head labels without definitions. | DES §37; ANN §§M,N,R; BLUE Pillars 11–13 | Accepted 2040 seam; later integrations | P12 core facts plus named future producers; narrative labels prohibited until authored | Y/Y/Y/P08,P14,P15/—/Legacy,P14,P15,P16,P17/— | P12/future typed facts → Studio Legacy | 2040 referential-integrity and definition/provenance audit | Each future package and Legacy charter | ACC availability refresh; original product scope unchanged |"
- **INT-011** (`:200`): "P12 preserves immutable studio, film, project, person, credit, and original creating-studio identities. P16 later establishes durable `StoryProperty` and Film Library identity, origin-work relationships, chain of title, rights ownership and licensing authority, restoration/reissue authority, dated ownership history, and ownership transactions/acquisitions where authorized; P12A never adds speculative fields to frozen leaves or creates that authority. A P12 concept, work, title, association, credit, or archive entry is not automatically a property/library/right fact; P16 must establish each one explicitly by exact ID without similarity or presentation inference. | DES §§10,32,37–38; ANN §§C,I,J,K,M,R,S; RUL §4; MISSION §21 | Later Studio Empire/acquisition and film-library/IP direction | Named future owner P16; identity/rights/ownership authority later, source-work seam only now | —/Y/Y/P16 and explicit authorization/Possible owner decisions in P16/P16/— | P12 exact works/creating-studio facts → P16 StoryProperty/library/rights/ownership → History/Legacy/P17/P18 | StoryProperty and origin-work IDs resolve exactly; ownership change never remints a work or erases creator/history; dated chain of title resolves; rights licensing has one P16 authority; inference/bulk-mint fixtures fail | Final P16 charter | ACC availability refresh; original product scope unchanged |"
- **INT-012** (`:201`): "P17 consumes exact P16 `StoryProperty`, Film Library, chain-of-title, rights, and licensing authority plus P12 work history. P17 later owns continuation proposals; direct sequels, prequels, remakes, reboots, legacy sequels, and spinoffs; explicit parent/child continuation-work lineage and continuity branches; franchise condition/development/trust/heat/fatigue/identity/reach keyed to exact P16 property identity; Story DNA expansion; crossovers; and shared universes. P17 may not mint or infer a `StoryProperty` from title, genre, cast, release order, current studio, similar concepts, presentation copy, or array position. | DES §§32,35,37–38; ANN §R; BLUE Pillar 12/contradiction 12; MISSION §21 | Later continuation/franchise direction; earlier combined film-library/IP wording clarified | Named future owner P17 for continuation/franchise behavior; P16 remains property/rights producer | —/Y/Y/P16 rights + P17/Possible P17 product rulings/P17/— | P12 exact works + P16 StoryProperty/rights → P17 continuations/franchise state → Legacy/Wire | Explicit P16 property/right reference on every authorized continuation; parent/child lineage adds edges without changing work IDs; franchise aggregate cannot become a second property identity; inference-negative fixtures; novelty/franchise conflict resolved | Final P16 authority plus P17 charter/Owner rulings | ACC availability refresh; original product scope unchanged |"
- **INT-013** (`:202`): "P18 consumes exact P16 rights/licenses plus P12/P10/P13/P14/P15 studio, work, people/credit, capability, technology, market, availability, and history facts. P18 later owns television; limited and ongoing series; seasons; renewals/cancellations; streaming; cross-media operations; platform/distribution behavior; and television/platform licensing and production workflows where applicable under exact P16 grants. P16 remains the sole author of the underlying legal right/license; P12A adds no television/streaming mechanic and does not treat `televisionCompetition` as evidence or authority. | DES §§8,13,38; ANN §§B,E,S; BLUE fabrication guard; MISSION §21 | Future/not authorized | Named future owner P18; cross-media scope unchanged | —/Y/Y/P13/P15/P16 predecessors/—/P18/Y | P12/P10/P13/P14/P15 facts + P16 rights/licenses → P18 operations → History/Wire/Legacy | No P12A consumer of inert field; no duplicate rights/license owner; future exact producer/consumer contract | Final P16 rights authority and P18 charter | ACC availability refresh; original product scope unchanged |"
- **SAF-009** (`:235`): "Do not implement P16 acquisitions, mergers, labels/subsidiaries, StoryProperty/Film Library identity, chain of title, rights/licensing, library valuation/trading, co-production negotiation/shares, stocks, restoration/reissue, or ownership finance in P12A. Do not implement P17 continuations, parent/child continuation-work lineage, franchise/Story DNA/crossover/shared-universe behavior, or P18 television/streaming/cross-media behavior. P17 may never infer or mint P16 property authority from film or presentation similarities; P17/P18 may never duplicate a P16 legal right/license. | DES §§10,32,38; ANN §§E,I,R,S; RUL §4 | Later, not P12A | Active prohibition; P16/P17/P18/later | —/Y/Y/—/—/P16,P17,P18,later/Y | P12 exact source identities → future packages | Scope/path/schema scan; no speculative frozen-leaf fields, duplicate authority, or inference joins | Explicit future package charters | ACC availability refresh; original product scope unchanged |"
- Summary row (`:278`): "| Final P16/P17/P18/Legacy | HIS-014; INT-011–013; P16 consumes P12 source-work seams and establishes StoryProperty/library/rights/licensing/ownership authority; P17 consumes exact P16 authority for continuation/franchise/Story DNA/shared-universe behavior; P18 retains television/streaming/cross-media and platform/distribution behavior under exact P16 rights grants |"
- source: as cited; HIGH; DEVELOPER/OFFICIAL (governance doc @13370d42). Note INT-012's proof column names "novelty/franchise conflict resolved" — the same conflict the Success Blueprint flags (§h.9).

### g.3 P16+ parking lot — roadmap §20 and owner rulings §5 (branch `hspector-github/codex/p13-p15-long-range-research-01` @137ab603)

`docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md:689-725`:
> ## 20. P16+ parking lot
> The following are not hidden P15 scope:
> ### P16 candidate — Studio Empire & Ownership Transactions
> - acquisition; - merger; - labels and subsidiaries; - ownership stakes; - studio valuation; - library/IP ownership transfer; - contract assumption and consent; - debt/investor/equity integration if separately approved; - antitrust or regulatory policy only if explicitly designed; - ownership-aware legacy presentation.
> ### Other deferred candidates
> - **P14D / Advanced Labor & Contract Mobility:** … P16+ parking and cannot enter P14B/C;
> - separately governed P13L/P16+ technology rights: …;
> - co-productions and split finance/credits/rights; - distribution territories and exhibitors; - home media, television, streaming, and later revenue channels; - **sequel/franchise/IP strategy**; - physical rival lots; - sabotage, which remains rejected as default competition; - mortality, illness, family, and daily human-needs simulation; - full stunt/injury/condition system; - international labor or multi-market regulatory simulation; - cross-campaign meta progression; - post-2040 content generation.
> Every parked item needs a new Owner decision and research boundary. None is approved merely because its identity seam is future-proofed now.

`docs/design/CODEX-P13-P15-OWNER-RULINGS.md:147-163`:
> ## 5. Approved P16+ parking lot
> The following remain outside P13–P15:
> - acquisitions, mergers, subsidiaries, ownership stakes, valuation, library/IP transfer, and co-productions; - advanced mobility and buyouts; - technology licensing, patents, and royalties; - distribution territories, home media, television, and streaming; - **franchise/IP strategy**; - physical rival lots; - stunt and injury systems; - mortality, family, and needs systems; and - post-2040 generated content.
> P16+ is a parking designation, not implementation approval and not a promise that every parked system will ship. Sabotage remains rejected as the default form of competition.

Also §7 (`:183-198`): "NO PRODUCTION AUTHORIZATION … Before coding any package, its future launch authority must at minimum: 1. identify the then-current Owner-accepted TypeScript and Unity commits; 2. complete the required post-upstream changed-path refresh; 3. perform implementation reconnaissance against actual current code and frozen seams; 4. preserve P08, P10, P11, P12, and other accepted upstream ownership; 5. expose every still-open Owner decision rather than resolve it implicitly; and 6. obtain separate Owner implementation authorization." and §8: "If later exploratory prose conflicts with this record, the approved boundaries, deferrals, open decisions, and implementation prohibition here govern unless the Owner issues a newer explicit ruling" (`:202-206`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (governance doc @137ab603). Note: the rulings' P16+ list parks "television and streaming" in P16+ and the P13 catalogue corrects "No P18 exists in the approved roadmap" (see §g.5) — while the later P12 contract §15 (2026-09) names P18 explicitly. The contract §15 is the newer text; the rulings doc predates it (2026-08-31). Flagged as a documentation-lineage inconsistency, not a mechanics direction.

### g.4 Top-level docs at 13370d42

- `docs/HANDOFF.md`: no P16/P17/P18 mention; only fame facts (D-3 `knownLeadTrackRecord = lead.fame ≥ 60`, `:1461-1466`) and Talent Fit per cast slot (`:1310`).
- `START-HERE.md`, `CURRENT-BEST.md`, `README.md`: no P16/P17/franchise/sequel mention.
- `ROADMAP.md` (historical M0A-era): "Not in V1 … rival studios resolving their own films … library economics …" (`:64-68`); M0B internal order "craft progression and age → fame and prestige → retirement and intake → contracts and rival ownership → two-way poaching" (`:49-51`). Header says it is superseded by newer Owner rulings (`:3-8`).
- `docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md:28`: "**P16 → P17 → P18:** Library/Rights/ownership → Franchises/Continuations → Television/Cross-Media. P12 films/projects/credits do not imply StoryProperty, rights/license or continuation authority; P17/P18 cannot mint or duplicate P16 rights."
- `docs/operations/PROJECT-STUDIO-FUTURE-OPS-CONTROL-BOARD.md:102-104`: "### P16–P18 — Long-range sequence remains Library/Rights → Franchises/Continuations → Television/Cross-Media. It is not part of this stack." `docs/operations/PROJECT-STUDIO-FUTURE-PACKAGE-DEPENDENCY-MAP.md:115-117`: "→ P16 Library/Rights → P17 Franchises/Continuations → P18 Television/Cross-Media".
- `docs/engineering/P10-FUTURE-CONSUMER-CONTRACT.md:62-64`: "### P16/P17/P18 rights, franchises, and television — May request returning writers, directors, performers, showrunners, options, or availability through P10/P14 contracts. It cannot overwrite historical credits or assume a person remains available because they appeared in an earlier film."
- `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:67-80` §4: "Rival studios, rival films, multi-studio awards, film-library / IP economics, creative dynasties, acquisitions / subsidiaries and related competition are **legitimate long-term product directions**. They are **NOT currently authorized implementation scope.** … Not current scope unless explicitly authorized by the Owner or the current campaign."
- source: as cited; HIGH; DEVELOPER/OFFICIAL (governance docs @13370d42).

### g.5 The p13 branches — anything touching cast slots, fame, franchise, StoryProperty, library or rights

Branches exist: `hspector-github/docs/p13-catalogue-definition-01` (@e48541b5, 2026-09-11), `hspector-github/docs/p13-owner-direction-rnd-01` (@5230f3de, 2026-09-10), `hspector-github/docs/p13-post-p12-launch-preparation-01` (@4734e409, 2026-09-11). **`hspector-github/docs/p14-post-p12-preparation-01` does not exist** (`git rev-parse` → "Needed a single revision"; `git branch -r | grep p14` → none). Directions found (quoted; nothing else in these branches touches the P17 topics):

- `hspector-github/docs/p13-catalogue-definition-01:docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md:318` — "| **CAT-051** | the P16+ library and rights system | A controlled archive provides physical preservation and storage capacity for a governed library business. | A titled work the studio owns occupies archive capacity and reloads identically, and a full archive refuses new storage without deleting any history. | Rulings park library and IP transfer in P16+. Nothing may delete game history because a vault fills or a save is loaded. | K3, new body | B2+ |"
- same file `:319` — "| **CAT-052** | the same P16+ rights owner | An archive or Post provider gains restoration and reissue preparation for exactly the works the studio owns or has licensed. | A work the studio owns or has licensed is restored and reissued, an unowned work is refused, and no restored work re-enters production past the first-filming lock. | No invented ownership and no automatic revenue. Retrospective restoration is a rights workflow, never a way around the first-filming lock. | K3 | B4+ |"
- same file `:321` — "| **CAT-054** | P14 talent and the talent-development owner | Training rooms support costed coaching or role preparation. | A named performer completes costed coaching, the effect appears only where P14 permits, and no credit or fame is created by the room. | Rehearsing manufactures no credits and no fame, and on-set rehearsal still needs its real stage. | K2 | B2+ |"
- same file `:323` — "| **CAT-056** | **P16+, not "P18"** | A compatible stage and workflow support episodic or multicamera work. | An episodic production occupies the compatible stage and completes its workflow, and the studio gains no channel, rights or distribution from owning it. | **Correction:** the proposal cites a "P18 series/platform workflow". No P18 exists in the approved roadmap, which runs P13, P14, P15 and then a P16+ parking lot. The rulings park **television and streaming in P16+**, so this entry is re-pointed there. It grants no channel, rights or distribution. | K3 | B3+ |"
- same file `:879-881, 887` — "Licensing, patents, royalties, technology-rights transfers, advanced mobility/buyouts, corporate ownership transactions, co-productions, library/IP transfers, and every other item in the approved P16+ parking lot remain deferred … This approval authorizes no implementation, Unity work, schema, … or library/IP-transfer authority."
- `hspector-github/docs/p13-owner-direction-rnd-01:docs/design/CODEX-P13-P15-OWNER-RULINGS.md:60-63` — "**NOT APPROVED FOR P13 IMPLEMENTATION:** licensing, patents, royalties, technology-rights transfers, and an exact alternate-history acceleration law. *(Amended 2026-09-10, §2.4.)* Patents remain parked in P16+. Supplier … Owner-desired later scope: its terms and package placement are undecided, P16+ remains the default placement". Annex sketches `TechnologyRightsRecord { rightsId, provenanceId, holderStudioId, rightsKind }` / `SupplierCommercializationAgreement {…}` (`…PACKAGE-13-BUILDER-ANNEX.md:737-741`) — technology rights only, explicitly "no P13A license object"; not story rights.
- P13 design `…PACKAGE-13.md:389` — "| market competition | `MarketState.competingSlate` is empty at generation; `src/core/reception.ts` uses `competitionFactor = 1.0` | **DO NOT TOUCH** | P15 market law, not P13 |".
- **No** p13-branch document mentions cast slots, acting-slot expansion by era, cameo classes, StoryProperty, sequels, or franchise mechanics beyond the parking-lot line "franchise/IP strategy" (rulings `:226` on those branches; roadmap `:716`).
- source: as cited; HIGH; DEVELOPER/OFFICIAL (governance docs on the named branches).

---

## (h) Current Future Ops assumptions about P17 — sentences that presuppose how P17 works

Each row: the sentence (verbatim or tight quote), locator, and my CONFIRM/QUALIFY/CORRECT against the code facts above and the owner-selected direction (A–U). Verdict tier: DESIGN INFERENCE unless a code locator makes it HIGH.

| # | Sentence | Locator | Verdict |
|---|---|---|---|
| h.1 | "P17 owns … franchise trust, heat, fatigue, identity, reach, and related later-approved franchise state" | contract §15 `:382-383`; INT-012 `:201` ("franchise condition/development/trust/heat/fatigue/identity/reach") | **QUALIFY.** The owner-selected direction C names three factors — RECOGNITION (slow, durable), MOMENTUM (fast, decays), FATIGUE/OVEREXPOSURE — and rejects one FranchiseScore. "trust/heat/identity/reach" is vocabulary, not approved state; "heat" ≈ Momentum, "trust" has no selected counterpart (expectations already live in the locked forecast, §d.3), "reach" must not become a fourth Standing channel (§d.1, frozen leaf) and is already the film-level `reach01` fact. Recommend the P17 charter map its vocabulary to C explicitly. |
| h.2 | "direct sequels, prequels, remakes, reboots, legacy sequels, and spinoffs" | contract §15 `:380-381`; INT-012; matrix `:418` | **QUALIFY.** Direction A lists DIRECT SEQUEL, PREQUEL, FILM SPIN-OFF, REMAKE, REBOOT and assigns TV/cross-media spin-offs to P18. "Legacy sequel" is not in A; treat as a *timing/dormancy* case of DIRECT SEQUEL under H/P (REVIVAL CANDIDATE), not a sixth type, unless the Owner adds it. |
| h.3 | "Story DNA expansion" | contract §15 `:383`; INT-012; matrix `:418`; register summary `:278` | **CORRECT (scope).** Nothing in the selected direction A–U mentions Story DNA. Today the only "DNA" a concept has is `{genre, baselineStrength, originalityRaw, roleRequirements}` plus `FilmShape`/`Promise` (§b.1); a continuation *reusing* these is a P17 read, not an expansion system. Recommend dropping "Story DNA expansion" from the first P17 checkpoint and treating SubProperties (direction J) as the bounded replacement. |
| h.4 | "crossovers; and shared-universe behavior" | contract §15 `:383-384`; INT-012; SAF-009 `:235` | **CONFIRM with timing.** Direction O: crossovers are LATER P17 scope, not a first-checkpoint dependency. Direction N bounds branching (main + reboot + few spin-offs). Keep the words; sequence them last. |
| h.5 | "Any P17 franchise identity is an operational aggregate keyed to an exact P16 `StoryProperty` ID, never a second property or rights identity." | contract §15 `:386-387`; INT-012 proof "franchise aggregate cannot become a second property identity" | **CONFIRM.** Matches direction M (FranchiseId + StoryPropertyId) and the code fact that no property/rights identifier exists in `src/` (grep zero hits). P16 must land first. |
| h.6 | "P17 may not create or infer a `StoryProperty` from title, genre, cast, release order, current studio, similar concepts, presentation copy, or array position." | contract §15 `:389-390`; INT-012; SAF-009 | **CONFIRM, and strengthen with a code fact:** titles are mutable after release (rename law §a.3) and FilmResult carries no title (§a.1), so title-based inference would also be *unstable*, not merely forbidden. |
| h.7 | "explicit parent/child continuation-work lineage" (edges add without changing work IDs) | contract §15 `:381`; INT-012 proof; HIS-014 "P17 explicit parent/child continuation-work and franchise lineage" | **CONFIRM.** Fits the additive-root law (§f.1) and `FilmResult` immutability; lineage must be a P17 root of `(childProductionId → parentProductionId | parentFilmId, type)` edges, never a field on `FilmResult`/`FilmConcept` (frozen-leaf rule). |
| h.8 | SIM-009: rival policy weights "affecting … talent continuity/freelancing … and later technology/franchise/recovery choices … later-authority dimensions dormant" | register `:110` | **CONFIRM with cost.** No such dimension exists in code (`policy` has five exact keys, `hollywoodValidation.ts:208`); "dormant" means *not present*, not "present but unused". Adding it = `policy.version 2` + validator + migration (§e.1/e.5). Direction K (compact rival decisions) is compatible. |
| h.9 | Success Blueprint: "A sequels-and-franchises system **rewards exactly what those mechanics penalized** … a franchise that pays well and *costs novelty* is more interesting than one that only pays." and "the six-week theatrical loop is ruled PRESERVE … which a reissue or a second revenue episode would necessarily reopen" | `PROJECT-STUDIO-SUCCESS-BLUEPRINT.md:1097-1104, 1609-1616`; INT-012 proof "novelty/franchise conflict resolved" | **CONFIRM the conflict; CORRECT the framing.** Direction C/D already answer it: Fatigue rises faster for mediocre repetition than excellent repetition; timing alone is not bad. In code the only novelty tax is critic-side `originalityRaw` (§b.1) and per-set `novelty` (`types.ts:1350-1351`); there is no audience "boredom" term to reconcile — P17's Fatigue would be new, not a duplicate. Reissues/second revenue episodes are P16 (contract §15 "restoration and reissue authority"), not P17, so the theatrical-loop PRESERVE ruling is not reopened by P17. |
| h.10 | "P16/P17/P18 … May request returning writers, directors, performers, showrunners, options, or availability through P10/P14 contracts. It cannot overwrite historical credits or assume a person remains available because they appeared in an earlier film." | `docs/engineering/P10-FUTURE-CONSUMER-CONTRACT.md:62-64` | **CONFIRM.** Matches direction F (recasting lawful; P14 owns person/contract) and the code: `FilmParticipants` is the only association record and it is frozen history (§a.4); availability is `busyTalentIds`/employment (§e.3). "Options" are not in the selected direction — flag as P14/P16 vocabulary, not P17. |
| h.11 | P16+ parking-lot line "sequel/franchise/IP strategy" | roadmap §20 `:716`; rulings §5 `:156` (@137ab603) and the same lines on the three p13 branches | **CONFIRM (status).** Still parked; the owner-selected P17 direction in CONTEXT.md is the newer authority for *design research*, not implementation (rulings §7/§8). |
| h.12 | Future-proofing scout: "Film library, IP lineage, sequels/remakes/franchises, reissues, licensing. Films are permanent, never pruned, keyed by a stable id. Lineage edges and second revenue episodes are additive." | `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md:210-211`; also `:132`, `:274` | **CONFIRM** (verified: `Studio.releasedFilms` never pruned; `TheatricalRun` "never deleted"; `persistedProductionIds` walk). QUALIFY: "additive" is true only via a **new root at a new save version** (§f.1), not via fields on `FilmResult`. |
| h.13 | P12 design §32: "room for one film to have multiple future ownership/finance shares without changing its identity" / "current owner and original creator as distinguishable relationships when ownership is later introduced; dated ownership history rather than destructive reassignment" | `docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:911-916` | **CONFIRM** — matches direction L (historical films stay attributed; current rights owner controls continuations). Code today: player ownership is by containment (`studio.releasedFilms`), rival ownership by `IndustryFilm.studioId` (`hollywoodTypes.ts:22`); neither is a rights fact. |
| h.14 | `CAT-054` "no credit or fame is created by the room. Rehearsing manufactures no credits and no fame" | p13-catalogue branch `STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md:321` | **CONFIRM** — consistent with the single fame producer (`applyReleaseCareers`, §c.5) and direction U "fame ≠ acting skill". |
| h.15 | `CAT-056` "No P18 exists in the approved roadmap … The rulings park television and streaming in P16+" | same file `:323` | **CORRECT (lineage).** The later P12 future-consumer contract §15 (@13370d42) does name P18 and assigns TV/cross-media to it; direction A also sends TV/cross-media spin-offs to P18. The P13 catalogue note is stale relative to the P12 contract. |
| h.16 | Register PERF-009 / receipt: save size and Save p95 remain qualified misses | `P12A-DECISION-AND-REQUIREMENT-REGISTER.md:183, 320-322`; receipt `:38-40` | **CONFIRM** — a hard constraint on direction M ("lightweight"). |
| h.17 | Success Blueprint: "The thirty-screenplay ceiling also bounds how large any library could ever become, so this pillar is gated on Pillar 3 twice over." | `PROJECT-STUDIO-SUCCESS-BLUEPRINT.md:1119-1121` | **CORRECT (stale).** Original screenplays are minted without limit (`commissionOriginalScreenplay`, `mintOriginalConcept`, `nextOrdinal`, `types.ts:1359-1364, 1433-1436`; C2a-M3; no cap constant exists in `tuning.ts`/`screenplay.ts`) and rivals mint their own concepts (`hollywoodTick.ts:183-184`); the 30-premise pool is only the market pool. `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:46-50` records the old 30-commission ceiling as the *reason* for the append-only ruling ("a de facto stop roughly a decade into a 120-year design horizon"), and `:40-41` "Concepts may be appended with fresh IDs. An existing ID may never be removed, reassigned or re-minted." Library size is not concept-bounded any more. |
| h.18 | ROADMAP.md "Not in V1 … library economics" and c2 rulings "Explicit non-goals … sequels/franchises/remakes" | `ROADMAP.md:64-68`; `docs/c2-planning/00C-…:80-84`; `CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md:1609-1614` | **QUALIFY.** Superseded as *permanent exclusions* by OWNER-RULINGS-HOLLYWOOD-HORIZON §4 (`:74-80` "Not current scope unless explicitly authorized"); still true that nothing is authorized for implementation. |

---

## Open gaps (what I could not establish, and why)

1. `hspector-github/docs/p14-post-p12-preparation-01` does not exist on the remote (`git rev-parse` fails; no remote branch matches `p14`). No P14 direction touching fame/cast/franchise could be quoted from it.
2. No P16 charter exists anywhere in the repo or the named branches; `StoryProperty` appears only in governance prose (contract §15, register rows, handoffs). Every P17 identity claim therefore rests on a producer that has not been designed.
3. I did not open `ui/` or `Assets/` (Unity) beyond `bridge/industry.ts`; whether the client renders titles from `conceptId` live (and would therefore show a post-release rename) was inferred from the bridge projection only.
4. Register row column semantics (`Original C/E/Q/D/O/F/X`) are quoted verbatim but not decoded; the header at `:70` names the columns, the flag legend was not read.
5. The "Save p95 9.58 s" figure is quoted from the receipt/register; the underlying attestation (`evidence/p12a/final-native-20260911/performance-attestation.md`) was not opened (binary/evidence tree; rule against depending on mutable implementation work).
6. Whether any UI path allows greenlight with an undefined cast slot was checked only in `src/core/actions.ts` (throws) and `filmPackage.ts` (display); `castingPackageReadModel.ts`/`castingReadModel.ts` were not read line-by-line — they cannot bypass the validator, so the conclusion in §b.2 stands.
7. The contract §15 vs rulings §5 "P18 exists / does not exist" inconsistency is documented (h.15) but which text the Owner currently treats as governing for TV spin-offs was not established from the repo; direction A in CONTEXT.md resolves it for P17 purposes (TV spin-offs → P18).
