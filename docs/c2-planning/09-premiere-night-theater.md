# LANE 9 — PREMIERE NIGHT V1 & THEATER DISPOSITION

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **PLANNING ONLY.** No code, no tests, no files outside `docs/c2-planning/`.
>
> Owner law 7 (binding, launch order): **Premiere Night V1 belongs to C2. No movie
> footage yet.**
>
> Every load-bearing claim below carries `file:line` (code) or file+row/section
> (corpus/docs) and is tagged **[CODE]**, **[CORPUS]**, **[DOC]**, or **[PROPOSAL]**.
> Observation and proposal are never blurred. Contradictions are reported in §6, not
> resolved.

---

## 0. Executive summary (for the architect, not for prose)

1. **The release loop is authoritative, complete, and legible — and it is the one week
   of the game the player is *ejected from the world* to be told about.** A release
   week switches `Screen` to a full-page newspaper; the lot's own week playback is
   *only* started on a no-release lot week (`App.tsx:2525-2532` vs
   `StudioLotScreen.tsx:4395-4405`). **[CODE]** Premiere Night V1's core product move is
   therefore not "add spectacle" — it is "stop teleporting the player off the lot at the
   single most emotional moment the engine produces."

2. **Every fact a premiere needs already exists and is persisted.** `FilmResult`
   (title via concept, critic score, segment scores, opening + total box office, frozen
   `participants`, locked `forecast`) `types.ts:241-264`; `TheatricalRun` (six weeks of
   locked weekly gross, blended share, week index, status) `types.ts:304-316`; the
   Gazette derivation `newspaper.ts:590-676`; the calendar's `theatricalReceipt`
   commitments `studioCalendar.ts:86-93, 469-486`. **[CODE]** No new engine truth is
   required for V1.

3. **The Theater is already the semantic destination of a finishing picture.** A
   production in phase `releaseReady` is mapped to the `theater` building by
   `managedWorkflowLocation` (`adapter.ts:5517, 5550-5551`) — but `releaseReady` holds
   **no reservation and no attendance** (`operations.ts:90-91`, `presence.ts:128,
   197-198`), so the picture "arrives" at a building where, by engine truth, nobody is.
   **[CODE]** That is the exact seam Premiere Night fills, and filling it needs *presence*,
   not new capacity.

4. **The marquee that carries a film's title exists — on a rolled-back renderer.**
   `makeMarquee(scene, identity, title)` draws a Deco marquee face with the release title
   and a bulb strip (`signage.ts:151-233`), wired by `LotScene.refreshMarquee`
   (`LotScene.ts:674-691`) and given a `'positive'` attention badge on any release
   (`LotScene.ts:717`). But `LotScene` is the **legacy** procedural lot; the adopted
   default world is `TycoonScene` (`flags.ts:43-50, 154-157`; `StudioLotView.ts:186-208`),
   whose Theater has a marquee canopy **baked into the building texture** with no title
   and no dynamic bulbs (`assets.ts:845-866`). **[CODE]** The named-title marquee is
   therefore a *port*, not an invention — the cheapest high-value cell in the whole lane.

5. **The original had no premiere.** The 2005 release presentation was a movie card
   flipping to a film-can icon and then "a pulsing $ … archived in the Production Office
   once it stops earning" (Bible §7 pipeline table / icon sequence, offsets ~1057, 1063).
   **[CORPUS]** The original's "Cinema" facility is a **debug/dormant artifact**:
   `facility_cinema.ini`, cost `0`, `given=0` (the only facility in the set with
   `given=0`), mesh `p_debug12.msh` (`facility_candidates.csv` row `TECH-FAC-029`;
   `dormant_or_unconfirmed_fields.csv` row `TECH-DORMANT-001`, which explicitly says
   *"Do not conclude a 'Cinema' facility was ever player-accessible"*), and no cinema row
   exists in the 28-row `facility_catalog.csv`. **[CORPUS]** Premiere Night V1 is an
   **invention**, not parity recovery. It must be justified as product, and it must not
   be smuggled in as "restoring the original."

6. **Theater disposition recommendation: LANDMARK, confirmed, with a functional upgrade
   — not buildable.** Full evidence and the Owner's one-paragraph decision frame in §5.
   The decisive engine fact: `FacilityCapability` has exactly four members —
   `development-casting | soundstage | set-scenery | post` (`types.ts:524-528`), none of
   them exhibition, and the C1 red-team's **F2 seam** proved that a blueprint with
   capacity 0 is *structurally unengageable* (`LOT-CONTENT-EXPANSION-LOG.md:520-522`).
   A buildable Theater today would be a decorative blueprint, which is a named
   violation. **[CODE][DOC]**

7. **Premiere Night is the strongest single argument on the Time Model docket** and the
   coupling must be flagged to lane 8 / the architect *before* either is frozen. §3.7.

---

## 1. The release loop today, code-precise

### 1.1 Greenlight → phases → release (the engine's eight weeks)

`TUNING.PRODUCTION_TICKS: 8` (`tuning.ts:49`) **[CODE]**. A greenlit production carries
`remainingTicks`, and the phase is a pure function of that countdown
(`operations.ts:56-77`) **[CODE]**:

| `remainingTicks` | phase | capability reserved (`operations.ts:79-93`) |
|---|---|---|
| 8 | `development` | `development-casting` |
| 7 | `preProduction` | `development-casting` |
| 6 | `rehearsal` | `soundstage` |
| 5, 4 | `shooting` | `soundstage` + `set-scenery` |
| 3, 2 | `postProduction` | `post` |
| 1 | `releaseReady` | **(none)** |

Two facts matter for this lane:

- **`releaseReady` reserves nothing and nobody attends it.** `requirementsForPhase`
  returns `[]` (`operations.ts:90-91`) and `attendanceForPhase` returns an empty row set
  (`presence.ts:197-198`), documented in the attendance canon comment as
  *"releaseReady (nobody — the phase holds no reservation)"* (`presence.ts:128`).
  **[CODE]**
- **…yet the world already puts that picture at the Theater.**
  `managedWorkflowLocation(workflow)` returns `'theater'` for `case 'releaseReady'`
  (`adapter.ts:5517, 5550-5551`) **[CODE]**. So the lot's operations projection says the
  picture is at the Theater during its final week while presence says the building is
  empty. This is not a bug (presence is reservation-anchored by law), but it is the
  precise structural hole Premiere Night V1 occupies.

**There is no authoritative "wrap" transition** (shooting → post is a countdown step,
not an event). PF1 recorded this and routed it to C2 (`PROFESSIONAL-FLOOR-V1-CHARTER.md`
§4 "Two ordered events do NOT exist authoritatively"; §10.2 "Wrap. Define shooting → post
as an authoritative transition in C2"). **[DOC]**

### 1.2 Release resolution inside one tick

`tick.ts` §2/§3 (`tick.ts:243-249`, `268-444`) **[CODE]**:

1. `releasing = advanced.filter(p => p.remainingTicks === 0)`, sorted ascending by plain
   string id (`tick.ts:247-249`).
2. Per release, in that fixed order: reception resolves with exactly one §5.3 critic
   gaussian, the ONLY sim-stream advance (`tick.ts:318-328`).
3. `buildFilmResult(...)` stamps `releaseTick: currentTick` (`tick.ts:330-335`), then
   the frozen `participants` and the locked greenlight `forecast` are attached when they
   were captured at an engaged greenlight (`tick.ts:339-349`).
4. `releasedFilms.push(filmResult)` (`tick.ts:351`) — the append-only authoritative
   record.
5. **Economy-gated branch** (`tick.ts:356-369`): when `economyEngaged(state)`, a
   `TheatricalRun` opens (`openTheatricalRun`, `economy.ts:53-73`) and **no cash is
   credited at resolution**; when not engaged (M0A/legacy), the whole gross is credited
   as one lump with a `boxOffice` ledger row.
6. Step 3.5 (`tick.ts:457-480`) pays **every active run's current week, including a run
   opened this same tick**, so a release is paid exactly once and always through the run.
7. Standing (§4), broadcast (§5), awareness drift (§5.5) follow (`tick.ts:482-540`).
8. The week advances last: `market: { ...state.market, tick: currentTick + 1 }`
   (`tick.ts:703`).

**The week-stamp seam (the recorded `releaseTick` off-by-one copy defect).**
`releaseTick` and every ledger row are stamped with the **pre-increment** week, while
the post-tick world shows `currentTick + 1`. The adapter states this explicitly:
*"Ledger entries + releaseTick are stamped with the PRE-increment week, so the ticks
processed span weeks [fromWeek, toWeek − 1] (tick.ts:114/437)"* (`adapter.ts:2443-2445`).
The Gazette prints `week: film.releaseTick` (`adapter.ts:5268`;
`newspaper.ts:647`), so **the clipping is dated one week earlier than the week the topbar
shows when the player reads it.** **[CODE]** The brief lists this as a C1 seam routed to
C2 (`00-C2-PLANNING-BRIEF.md:67-68`) **[DOC]**. Premiere Night V1 *must* pick one
convention up front — see §3.0-R5 and §6-G1.

### 1.3 The six-week theatrical decay

`TUNING.THEATRICAL_WEEKS: 6` `[ICH]` (`tuning.ts:395`), with
`STUDIO_RENTAL_BLENDED: 0.52` (`:394`), `THEATRICAL_HOLD_BASE: 0.42` (`:396`),
`THEATRICAL_HOLD_LEGS_COEF: 0.09` (`:397`), `THEATRICAL_TAIL_FLOOR: 0.05` (`:398`),
`ECONOMY_MODEL_VERSION: 1` `[OWNER]` (`:402`). **[CODE]**

`theatricalSchedule(opening, legs)` (`economy.ts:28-48`) **[CODE]**:
- week 1 gross ≡ `opening` **exactly**;
- weeks 2..N distribute `opening × (legs − 1)` on a geometric hold
  `hold = THEATRICAL_HOLD_BASE + THEATRICAL_HOLD_LEGS_COEF × (legs − LEGS_MIN)`, floored
  at `THEATRICAL_TAIL_FLOOR × gross`, then renormalized so the tail sums exactly;
- therefore `Σ weeklyGross === opening × legs === FilmResult.boxOffice.total` — the run
  redistributes timing, it never re-rolls the total (`economy.ts:22-27` doc comment).

`TheatricalRun` (`types.ts:304-316`) carries `productionId`, `conceptId`, `releaseTick`,
`totalWeeks`, `weekIndex`, the locked `weeklyGross[]`, `studioShare`,
`cumulativeGrossPaid`, `cumulativeStudioRevenuePaid`, `economyModelVersion`, `status`.
Weekly payment, completion and the ledger row are `tick.ts:462-479`. A migrated V3
release becomes a `legacyCompleted` placeholder at share 1.0 / model 0
(`economy.ts:77-92`). **[CODE]**

The run's remaining weeks are already **committed calendar events**: `kind:
'theatricalReceipt'` with `productionId`, `title`, `studioRevenue`, `paymentOrdinal`,
`totalPayments` (`studioCalendar.ts:86-93`), emitted for `index` from `run.weekIndex` to
`run.totalWeeks` at `week: currentWeek + (index − run.weekIndex) + 1`
(`studioCalendar.ts:469-486`). **[CODE]** A premiere therefore has an authoritative
"here is what this picture is committed to earn, week by week" already in hand.

### 1.4 `newspaper.ts` — The Silver Screen Gazette

`NEWSPAPER_MASTHEAD = 'The Silver Screen Gazette'` (`newspaper.ts:24`) — *"Original
fictional entertainment-industry newspaper (not a real publication)"* (`:23`). **[CODE]**

Pure, deterministic, RNG-free, derived **entirely** from the film's persisted record plus
committed cost, concept title and segment shares, so the clipping reconstructs identically
after save/reload (`newspaper.ts:1-10`). **[CODE]** Components:

- `criticStars(criticScore)` — 0–5 in half-star steps (`:28-32`).
- `audienceTier(aggregate)` — `hated | disliked | divided | liked | loved` at thresholds
  30/45/57/72 (`:43-49`), with share-weighted aggregation (`:53-67`).
- `buildFilmChronicle(input)` — Film Chronicle V1, a durable released-film identity with
  four independently fail-closed sections (creative record, credits, production record,
  package fit) (`:253-370`). Returns `null` only for a pre-D-11.A film with no frozen
  participants (`:255-256`).
- `makeHeadline(dims)` — eight deterministic, priority-ordered rules whose conditions are
  real thresholds on recorded numbers (`:469-531`), so a headline can never contradict
  the figures.
- `makeCallouts(...)` — two to three truthful callouts from cohesion, package fit,
  critic-vs-audience divergence, forecast delta, projected profitability (`:538-587`).
- `buildNewspaper(input)` — assembles the `NewspaperView` (`:590-676`), including the
  D-12 β P3 truthfulness split: `openingGross`, `studioRevenueThisWeek`,
  `projectedTotalGross`, `projectedTotalStudioRevenue`, `studioRevenueStillToCome`,
  `totalCommitment`, `projectedContribution` + label, and a verbatim `disclosure`
  (`:398-410`, `:438-439`, `:653-663`).

The D-17A fix-pass comment at `:461-468` is a standing warning worth carrying into
Premiere Night copy: the subheadline **always** renders while callouts are conditional, so
every profit-flavoured sentence had to be relabelled "projected". **[CODE]** Any premiere
copy that says "a hit" on opening night inherits exactly this hazard.

The adapter binds the Gazette to state in `releaseNewspaper(state, film)`
(`adapter.ts:5230-5270`): committed cost from `production` + `freelancerFee` ledger rows,
segment shares from `market.segments`, projected Studio Revenue + `openingGross` +
`studioShare` from the film's run, and `week: film.releaseTick`. It returns `null` for a
legacy film with no participant record (`:5231`). **[CODE]**

### 1.5 `NewspaperReveal` → `ReleaseResult` → `Autopsy` (the UI chain)

- `NewspaperReveal.tsx` (345 lines) — *"A deterministic studio one-sheet beside the
  existing truthful release story. All claims arrive through NewspaperView /
  FilmChronicleView; this screen adds presentation and session-aware navigation only"*
  (`NewspaperReveal.tsx:1-4`). Star glyphs, a `ProfitFigure` with a
  projected-profit/loss label, primary story + `SecondaryStory` cards per co-released
  film with `Autopsy →` / `Chronicle →` buttons (`:41-92`). **[CODE]**
- `ReleaseResult.tsx` (213 lines) — *"An event panel (NOT a Broadcast feed) shown after
  a week that produced releases… clearly marked as RESULTS"* (`ReleaseResult.tsx:1-5`),
  topbar `THE WEEK'S RELEASES`, `Back to studio`, career impact, per-film
  `onOpenAutopsy` (`:52-60`). **[CODE]**
- `Autopsy.tsx` (856 lines) — the authoritative post-mortem the newspaper defers to
  (`newspaper.ts:7-8`: *"The detailed autopsy remains the authoritative analysis"*).
  **[CODE]**

**Routing law (binding, already contracted).** `App.tsx`:
- a lot-origin week with **no** release never changes screens; it sets a transient
  `lotCadenceFeedback` of `kind: 'week'` and returns (`App.tsx:2523-2532`);
- otherwise `newspaperReleases` = released films with a non-null Gazette view
  (`App.tsx:2539-2542`); if non-empty → `setScreen({ kind: 'newspaper', source:
  'release', … })` (`:2543-2555`), else → `setScreen({ kind: 'release', … })` (`:2556`).
  **[CODE]**
- The contract's matrix is explicit and binding
  (`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:94-115`): Gazette eligibility
  decides only whether Newspaper precedes ReleaseResult; `released.length` owns release
  truth; return destination comes from the explicit `returnContext`, never inferred from
  route, screen or newspaper presence. **[DOC]** `LESSONS-LEARNED.md:2540-2546` records
  the failure this law was written against. **[DOC]**
- The one-time `constructionCompletion` item is handed to the **first** post-tick surface
  and stripped from the next (`App.tsx:2551-2554`). **[CODE]** This is the existing
  precedent for the one-owner handoff Premiere Night needs (§4.2).

### 1.6 What the *world* does on a release week today: nothing

This is the finding that shapes the whole lane. **[CODE]**

- `advanceToNextEvent` gives `'release'` **first priority** among stop reasons
  (`adapter.ts:2365-2372`, with the comment at `:2392-2393`: *"Release keeps first
  priority because it owns the reveal/autopsy path"*).
- The lot's own next-event rail **excludes release entirely**:
  `export type LotNextEventStopReason = Exclude<SimStopReason, 'release' | 'limit'>`
  (`nextEvent.ts:24`).
- The lot's week playback (`playPresenceWeek`) is called only from the `kind: 'week'`
  cadence feedback (`StudioLotScreen.tsx:4395-4405`), which App only mints when
  `released.length === 0` (`App.tsx:2525-2531`).

**Net:** on the one week a film reaches audiences, the player is moved to a full-screen
newspaper and the lot renders no witnessed time at all. The *only* release-related world
signals that survive are steady-state, not event-state:
- the theater's attention cue — `'active' / 'Now showing'` while a run is active,
  `'recently-completed' / 'Recent release'` for `LOT_RECENT_RELEASE_WEEKS = 8`
  (`adapter.ts:5310`, `6594-6607`); **[CODE]**
- `releasePresence` (`'none' | 'released' | 'now-showing'`) and `latestReleaseTitle`,
  derived at `adapter.ts:6464-6477` and documented on the snapshot as
  *"Recent releases — drives the theater marquee"* / *"Latest relevant release title for
  the marquee"* (`StudioLotSnapshot.ts:720-726`); **[CODE]**
- the `run-completed` next-event target, which **does** anchor to
  `buildingId: 'theater'` (`nextEvent.ts:48-51`, built at `:643-650`). **[CODE]**

So the world already knows how to point at the Theater when a run **ends**, and refuses to
when a run **begins**. That asymmetry is the bug-shaped hole Premiere Night V1 fills.

### 1.7 What PF1 adds (the seed), verbatim

From the canonical frozen charter (`PROFESSIONAL-FLOOR-V1-CHARTER.md`, on
`professional-floor-v1-fresh`; read via `git show` — the PF1 worktree was never touched):

- **PF1-M2 tier 1** — *"movie release (sting + the existing NewspaperReveal, keyed on
  release source — archive clippings never sting)"* (§5, PF1-M2, tier table). **[DOC]**
- *"'World emphasis' is defined narrowly: reuse of the existing show-me/attention and
  signage-emphasis paths only — no new tween, no new display object, no new canvas-side
  effect (this is the fence against C2's reserved simulation theater)."* (§5, PF1-M2).
  **[DOC]**
- §9 non-goals: *"Premiere Night V1 → C2 charter (Owner-reserved) … release punctuation
  in PF1 is a sting + existing reveal, nothing staged in-world"*. **[DOC]**
- §10.3: *"**The seed of Premiere Night** exists in PF1 only as the release sting +
  NewspaperReveal handoff; C2 stages the rest."* **[DOC]**
- §2 standing law: *"PRESENTATION REACTS TO TRUTH. PRESENTATION NEVER CREATES OR PERSISTS
  GAME TRUTH"*; punctuation is *"exact-once and transient … never on load/hydration"*;
  *"Audio must not narrate skipped time (operational law 3): a multi-week batch is one
  stop and one punctuation, never per-week theater."* **[DOC]**
- §2 proof obligation: presentation-on vs presentation-off/muted must produce
  **byte-identical exported saves**. **[DOC]**
- §11.2: Time model — Model B ("living turn") is *"the Owner's preferred model to
  investigate first — a hypothesis, NOT a ruling"*; C2's docket compares A/B/C and
  *"evidence may defeat it"*. **[DOC]**

**Robustness if a PF1 milestone is KILLED.** PF1-M2 is where the sting and the cue
grammar live. If M2 is killed, Premiere Night V1 loses only its *audio* punctuation and
its `eventGrammar` seat; every proposal in §3 is otherwise self-sufficient because it
reads `SimResult`/`FilmResult`/`TheatricalRun`/`StudioLotSnapshot` directly. C2 must
**not** take a hard dependency on `ui/src/presentation/eventGrammar.ts` existing. **[PROPOSAL]**

---

## 2. The Theater building today

### 2.1 Engine

`INITIAL_PROPERTY_STRUCTURES` (`lot.ts:194-238`) **[CODE]**:

```
{ id: 'theater', label: 'Theater', role: 'landmark',
  origin: { gx: 3, gy: 16 }, footprint: { width: 3, depth: 2 },
  providesFacilityIds: [] }                        — lot.ts:213-219
```

The module doc is explicit: *"Three are landmarks with no engine capacity — the Gate,
Administration, and the Theater are civic bodies that occupy ground and nothing else"*
(`lot.ts:178-181`). `PropertyStructureRole`'s doc adds: *"A landmark is not a lesser kind
of thing: it is a structure that provides no facility, which is exactly
`providesFacilityIds` being empty. The role is retained because M1b's inspector and
**C2's Founding Flip** both need to know which bodies were authored as the studio's
founding plant"* (`types.ts:1140-1152`). **[CODE]**

Mechanically the Theater therefore:
- reserves nothing (`FacilityCapability` = `development-casting | soundstage |
  set-scenery | post`, `types.ts:524-528`);
- appears in no `requirementsForPhase` row (`operations.ts:79-93`);
- appears in no attendance row (`presence.ts:120-136, 156-198`);
- gates no action — nothing in `actions.ts` consults it;
- is not movable or demolishable: founding placements are excluded, surfaced as
  *"…is part of the studio's founding property and cannot be moved or taken down."*
  (`facilityMutation.ts:79-80`). **[CODE]**

### 2.2 UI / world

- **Inspector.** Title `'Released Films'` (`buildingInspector.ts:155`); blurb *"The
  studio theater — releases and what is playing"* (`:178`); facts = up to three recent
  releases with reception band + weeks-ago (`theaterFacts`, `:628-649`) plus exact
  `theatricalReceipt` calendar commitments (`:983-986`); status line is one of
  `Now showing: <title>` / *"The studio has released pictures; none is playing this
  week."* / *"The marquee is empty — the studio has released nothing yet."*
  (`:987-996`). **[CODE]**
- **Navigation.** `theater` → action `view-released-films` → route `{ kind: 'dashboard' }`
  (`navigation.ts:41-50, 56-58`), blurb *"Your releases and what is in theaters."*
  (`navigation.ts:69`). **[CODE]** The Theater is thus one of the few bodies whose primary
  verb **ejects the player to the Dashboard** — in tension with the hybrid interaction
  law's *"never eject the player from the studio casually"*
  (`THE-MOVIES-PARITY-MASTER-PLAN.md` §5). **[DOC]** Flagged in §6-G4.
- **World geometry.** `world.ts:255-267`: `placeId 'theater'`, label `'THEATER'`, texture
  `tw-theater`, surveyed at `{gx:3, gy:16}`, fallback footprint `3×2`, anchors
  `entry {4.5,18.6}`, `work {4.5,18.5}`, `wait {5.9,18.8}`. A **theater forecourt** is
  already dressed with a planter and a lamp (`world.ts:599-601`), and two authored paths
  serve it — `casting → theater` and `theater walk → courtyard` (`world.ts:483-484`).
  **[CODE]**
- **Art.** `bakeTheater` (`assets.ts:845-866`) draws a cream façade, a **marquee canopy
  with a 7-bulb brass strip**, a **vertical blade sign**, a `signField`, and a gable
  roof — all **baked into one texture**, so today's marquee is scenery, not a display
  surface. **[CODE]**
- **Chrome.** Every authored body carries a `label` + `badge` + `chip` stack painted from
  the snapshot (`TycoonScene.ts:1060-1100`, `2796-2836`, `setBadge` `:2840-2866`), and the
  label already composes occupancy (`"<name> • N here"`, `:2820-2823`). The Theater's badge
  is driven by the attention cue in `adapter.ts:6594-6607`. **[CODE]**
- **The marquee that names the film exists only on the legacy scene.**
  `makeMarquee(scene, manifest, title)` (`signage.ts:151-233`) draws a burgundy marquee
  face carrying `THEATER` and, when present, the release title, with bulbs exposed via
  `getData('bulbs')` for a reduced-motion-gated chase; `LotScene.refreshMarquee`
  (`LotScene.ts:674-691`) rebuilds it whenever
  `snap.releasePresence !== 'none' ? snap.latestReleaseTitle : null` changes, and
  `LotScene.ts:717` adds a `'positive'` badge to `theater` on any release. **[CODE]**
  `LotScene` boots only when both adopted world gates are rolled back
  (`StudioLotView.ts:171-208`; `flags.ts:43-50` — tycoon default ON, explicit `0` falls
  back to the Hollywood plate, `0` on both falls all the way back to the legacy
  procedural lot; `flags.ts:154-157`). **[CODE]**
- **Precedent for a scene-local flourish.** `TycoonScene.playPublicity(success)` —
  *"Local acknowledgement of an already-accepted App/Engine result. Emits no event."* —
  flashes a pre-created rectangle at the Administration building's **`photocall`** anchor,
  three times, 420 ms, and is a **no-op under reduced motion**
  (`TycoonScene.ts:3237-3254`, flash created at `:1334-1340`, cleared at `:3257-3261`,
  invoked via `StudioLotView.ts:533`). **[CODE]** This is the exact architectural shape a
  premiere flourish should copy: pre-created object, engine-accepted trigger, reduced-motion
  fence, no new event.
- **Presence playback** — the existing witnessed-time machinery:
  `playPresenceWeek(week)` refuses when the projection is absent, when the requested week
  is not the snapshot's week, or under reduced motion (`TycoonScene.ts:3175-3190`);
  playback runs beats 0…8 at `PLAYBACK_BEAT_MS = 1150` for `PLAYBACK_DURATION_MS ≈ 10.35 s`
  (`playback.ts:28-34`) and **settles exactly onto the static truth** (`playback.ts:8-23`);
  any snapshot that moves the studio off that week ends it, because *"a batch of weeks is
  not witnessed time"* (`TycoonScene.ts:2600-2604`). **[CODE]**

### 2.3 Landmark-lean classification (master plan §6)

Master plan v1.1 §6 classification table (`THE-MOVIES-PARITY-MASTER-PLAN.md` §6) **[DOC]**:

> | `theater` (Theater) | **LANDMARK (lean)** | Exhibition is the town's, not studio
> construction; the original never made cinemas buildable (its "Cinema" facility is
> confirmed dormant/debug content). **Final call at the Founding Flip design review — an
> explicit open decision, not silently settled** |

§10 "Still required from the Owner", item 2: *"Founding Flip ratification — at C2
planning: confirm the Flip as C2's capstone (with the split-into-mini-campaign
contingency), and **make the Theater landmark-vs-buildable final call at that design
review**."* **[DOC]** The Founding Flip itself is now **RATIFIED** by owner law 6
(`00-C2-PLANNING-BRIEF.md:34-37`), so the Theater call is the residual open item from
that same decision. **[DOC]**

§6's "minimum starting lot" for the eventual mature design lists **Studio Gate,
Administration/Staff Office, frontage road + minimal utilities, and vacant parcels** —
the Theater is **not** in it. **[DOC]** This is a live tension with "permanent landmark":
see §6-G2.

### 2.4 Corpus — the original's cinema is dormant/debug content [CORPUS], verified

Verified directly this pass, as instructed:

- `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/facility_candidates.csv`, row **`TECH-FAC-029`**:
  `"Cinema (unidentified, likely debug/unused)"`, `source_file = facility_cinema.ini`,
  `purchasecost = 0`, `capacity_or_key_fields = "mesh=p_debug12.msh; given=0 (the ONLY
  facility in this set with given=0)"`, `bible_current_value = "not documented anywhere in
  the Bible"`, `classification = DORMANT OR UNCONFIRMED`, `schema_confidence = MEDIUM`,
  `vanilla_value_confidence = NOT APPLICABLE`, notes: *"likely a debug/placeholder
  facility never exposed to players"*. **[CORPUS]**
- `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/dormant_or_unconfirmed_fields.csv`, row
  **`TECH-DORMANT-001`**: observed in `TECH-PKG-003 (employeemod)`,
  `confidence_this_shipped = LOW`, notes: *"given=0 strongly suggests this facility is
  excluded from the normal catalog; the debug-named mesh further suggests
  placeholder/test content, not a shipped player-facing building. **Do not conclude a
  'Cinema' facility was ever player-accessible.**"* **[CORPUS]**
- `THE-MOVIES-2005-ORIGINAL-DATA/facility_catalog.csv` — 28 documented facilities
  (29 lines incl. header); **no cinema/theater row**. Grep for `cinema|theat|premier`
  returns nothing. **[CORPUS]**
- The Bible has **no "premiere" mechanic anywhere**: the only hit for `premier` in
  `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` is a reviewer likening the Post
  Production editor to *"products such as Adobe Premier"* (line 2664). **[CORPUS]**
- What the original actually showed at release (Bible §7 pipeline row + icon sequence,
  ~lines 1057 and 1063): the film is dragged into the Production Office's **Release
  room**, a marketing budget is set, and *"movie card flips to a film-can icon and a
  pulsing $ appears while it earns"* → *"released state (pulsing $ while earning money;
  archived in the Production Office once it stops earning)"*. Reviews are a **separate
  full screen** (Bible §28 / line 581). **[CORPUS]**
- The parity matrix's own release row (Bible §38, line 3377) grades our chain
  **PARTIAL / PRESERVE**: *"box office arriving as a live, decaying per-film income
  stream (a pulsing $ icon) rather than a lump payout"* vs our *"six-week theatrical
  truth"*, ruling *"a legitimate, more rigorous modern take"*. **[CORPUS]**
- Register constraint that governs premiere copy:
  `PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87` —
  *"Marketing, publicity, Star power, lot beauty, **premieres**, awards campaigning, and
  distribution **may amplify** a strong production; **none may make a poorly developed and
  poorly produced film artistically good.**"* **[CORPUS]** This is the single most
  important constraint on Premiere Night: **a premiere may not be an input.**

**Conclusion (evidence, not decision):** there is **no original-game precedent** for a
premiere event, a buildable cinema, or crowd-at-the-theater content. Premiere Night V1 is
a **modernization/invention** under master plan §5's MODERNIZE/DEEPEN logic, and the
honest framing in the C2 charter must say so.

---

## 3. PREMIERE NIGHT V1 — design [PROPOSAL]

*Everything in §3 is proposal. Nothing here is observed behaviour.*

### 3.0 Design invariants (non-negotiable, each traced to an existing law)

| # | Invariant | Source |
|---|---|---|
| R1 | **A premiere is evidence, never an input.** It reads receipts; it never touches reception, box office, standing, awareness, cash, or RNG. | Owner law 5 (`BRIEF:31-32`); operational laws 1–2 (`SHIFT-OPERATIONAL-LAWS.md:6-11`); PF1 §2 **[DOC]**; corpus register line 87 **[CORPUS]** |
| R2 | **Zero RNG, zero `Math.random`.** Any variation derives from `sceneSeed` / stable authoritative data. | Law 23 (`SHIFT-OPERATIONAL-LAWS.md:52-55`); `StudioLotSnapshot.ts:734-737` **[CODE]** |
| R3 | **Exact-once, transient, never on load/hydration.** No persisted "premiered" marker. | PF1 §2 **[DOC]**; `App.tsx:2551-2554` co-tick precedent **[CODE]** |
| R4 | **Reduced motion + muted = today's game, exactly.** Every premiere beat must have a static equivalent that states the same facts. | PF1 §2/§13.4 **[DOC]**; `playPublicity` `TycoonScene.ts:3243` and `playPresenceWeek` `:3180-3185` precedents **[CODE]** |
| R5 | **One week convention, declared.** The premiere is dated `releaseTick` (the engine's stamp) or `releaseTick + 1` (the week the player is standing in) — pick once, apply to the marquee, the Gazette masthead date, and every premiere string, and fix the C1 seam in the same pass. | `adapter.ts:2443-2445, 5268`; `newspaper.ts:647` **[CODE]**; `BRIEF:67-68` **[DOC]** |
| R6 | **One owner per announcement.** A single release must not be announced by the sting, the premiere, the newspaper and an aria region. | PF1 §5-M2 "no double-announce"; law 26 (`SHIFT-OPERATIONAL-LAWS.md:76-83`) **[DOC]** |
| R7 | **`released.length` still owns release truth.** Premiere staging is orthogonal to Gazette eligibility; a legacy/participant-less film with no Gazette must still get its release surface. | `WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:110-115` **[DOC]**; `App.tsx:2539-2556` **[CODE]** |
| R8 | **Structural render pins are load-bearing.** Grid managed-idle Week 0 = `231 objects / 14 actors / 8,806,568 bytes / 6 draws`. Any premiere object must be pre-created (like `tier:publicity-flash`) and the pin **deliberately re-pinned with its fixture named**, never silently moved. | Law 25 (`SHIFT-OPERATIONAL-LAWS.md:67-75`) **[DOC]**; `TycoonScene.ts:1334-1340` **[CODE]** |
| R9 | **No new plate against the Stage 7 painting.** Premiere staging happens at the Theater forecourt (`world.ts:599-601`), which is grid ground, not plate. | Law 27a (`SHIFT-OPERATIONAL-LAWS.md:84-88`) **[DOC]** |
| R10 | **Copy is trade-paper, and literally true of the state.** No settled-profit language on opening night. | PF1 §3 voice rules 2/5 **[DOC]**; the D-17A label-truthfulness fix-pass `newspaper.ts:461-468, 574-585` **[CODE]** |

### 3.1 Option A — **THE MARQUEE LIGHTS AND THE COMPANY COMES** *(recommended)*

**One sentence:** on the week a picture opens, the lot does not disappear — the Theater's
marquee takes the film's name, the picture's own credited company walks to the Theater
forecourt while a crowd forms at the doors, and the Gazette is opened *from* that moment
rather than instead of it.

**What physically happens, in order (all presentation over authoritative state):**

1. **Before the tick even resolves** — nothing new. `releaseReady` already puts the
   picture at the Theater in the operations projection (`adapter.ts:5550-5551`), so the
   week *before* opening the Theater badge can read `THEATER · OPENS NEXT WEEK` from the
   existing badge channel (`TycoonScene.ts:2840-2866`). Zero new objects.
2. **The tick resolves with `released.length > 0`.** App does **not** immediately
   `setScreen`. Instead it mints a new cadence feedback `kind: 'premiere'` carrying
   `{ week, films: [{ productionId, title }], returnContext }` — structurally the twin of
   today's `kind: 'week'` (`App.tsx:2525-2531`), and the *deferred* newspaper payload.
3. **The marquee takes the name.** The Theater's baked canopy gains one pre-created
   `Phaser.GameObjects.Text` marquee face (`tier:theater-marquee`), set from
   `snapshot.latestReleaseTitle`. This is a **port of `makeMarquee`'s title behaviour**
   (`signage.ts:151-233`) into `TycoonScene`, not a new invention.
4. **Arrivals.** The film's credited company walks from their existing home/parking
   anchors along the already-authored `casting → theater` and `theater walk → courtyard`
   paths (`world.ts:483-484`) to the Theater `entry` anchor (`world.ts:262-266`), reusing
   the presence playback path machinery (`playback.ts`, `TycoonScene.ts:3175-3222`). The
   people are **exactly** `FilmResult.participants` (writer, director, lead, antagonist,
   support, craft — `types.ts:257-259`, cloned by `newspaper.ts:203-214`), because that
   record is frozen and immutable to later roster change.
5. **A crowd, as evidence of the *real* release event.** The crowd is a **read-out of a
   number the engine already computed**, not decoration: crowd body count is a bounded,
   deterministic function of the run's **opening-week gross** (`run.weeklyGross[0]`,
   `types.ts:310`) expressed against a declared TUNING scale, clamped to a small integer
   band (proposal: 0–12 bodies). Reduced motion / static equivalent: a printed line
   *"Opening week: $X"* on the Theater badge. **If the opening is small, the forecourt is
   nearly empty — that is the point** (owner law 8: no decorative screensaver population,
   `BRIEF:39-43`).
6. **The lamp and the bulbs.** The Theater's existing chip/lamp channel goes to the
   "now showing" colour; under full motion the bulb strip runs a chase; under reduced
   motion it is statically all-lit (the reduced-motion equivalent the identity manifest
   already declares — `manifest.ts:105`, `IdentityMarquee.reducedMotionMode = 'static'`).
7. **The Gazette moment is *earned*, not imposed.** The premiere beat resolves to a
   world-native receipt strip on the Theater: **`THE SILVER SCREEN GAZETTE — read the
   notices →`**. Clicking it opens the existing `NewspaperReveal` with the already-built
   `NewspaperView`; from there the existing `ReleaseResult → Autopsy` chain is untouched
   and `returnContext` brings the player back to the same live lot
   (`WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:104-115`).
8. **Skippable, always.** Any input (or the existing `skipPresencePlayback` path,
   `TycoonScene.ts:3194-3200`) settles the premiere instantly onto its static truth and
   the receipt strip remains. Reduced motion goes straight to step 8.

**Engine state it reads (all authoritative, all already persisted):**

| Fact | Source |
|---|---|
| that a release happened, and which films | `SimResult.released` (`adapter.ts:2228`), from `studio.releasedFilms` diff (`:2365`) |
| title, genre | `state.concepts` via `findConcept` (`adapter.ts:5232, 5245`) |
| credited company (names, roles, greenlight OVR/fit/EP) | `FilmResult.participants` (`types.ts:257-259`) |
| critic score, segment scores, cohesion | `FilmResult` (`types.ts:247-251`) |
| opening + total gross | `FilmResult.boxOffice` (`types.ts:252`) |
| the six-week schedule, share, week index, status | `TheatricalRun` (`types.ts:304-316`) |
| what is committed to be paid, week by week | `theatricalReceipt` commitments (`studioCalendar.ts:86-93, 469-486`) |
| the whole clipping | `releaseNewspaper(state, film)` → `buildNewspaper` (`adapter.ts:5230-5270`; `newspaper.ts:590-676`) |
| coarse world presence + marquee title | `releasePresence`, `latestReleaseTitle` (`adapter.ts:6464-6477`) |
| the week | `market.tick` / `film.releaseTick` — **subject to R5** |

**New state required: NONE in `GameState`.** Everything above is persisted today. The
premiere adds **presentation-only session state** (a transient cadence feedback object,
already the established pattern at `App.tsx:2525-2531`) and **at most** two new
`StudioLotSnapshot` projection fields (a premiere descriptor and a crowd magnitude),
which are derived read-model values, not truth. **No `SaveFileV14` pressure. No new
`SimStopReason` member.** This is the single biggest reason to rank Option A first.

**Cost / risk profile:** medium. New display objects at the Theater (marquee text, crowd
bodies) move the structural pins (R8) and must be re-pinned deliberately. The arrivals
walk reuses proven path machinery. The Gazette deferral is the only routing change, and
it is a *narrowing* of an existing contract, not a rewrite.

---

### 3.2 Option B — **THE MARQUEE ONLY** *(minimal; the safe floor)*

**One sentence:** the world never takes the player's screen, but the Theater visibly
becomes the picture's home — name on the marquee, lamp lit, badge reading `NOW SHOWING`
with the opening figure — and the newspaper opens exactly as it does today.

- **What happens:** port `makeMarquee`'s title behaviour into `TycoonScene` (one
  pre-created text object); set the Theater badge to `THEATER · NOW SHOWING · <TITLE>`
  from the existing badge channel; light the chip; PF1's tier-1 sting fires; the newspaper
  opens as today.
- **No arrivals. No crowd. No new walk. No routing change.**
- **State read:** `releasePresence`, `latestReleaseTitle`, `run.weeklyGross[0]`
  (`adapter.ts:6464-6477`; `types.ts:310`).
- **New state:** none, in either `GameState` **or** the snapshot — both fields already
  exist and are documented as *"drives the theater marquee"*
  (`StudioLotSnapshot.ts:720-726`).
- **Cost:** very low. Pin movement is one text object.
- **Why it is not the recommendation:** it does not answer the player-feeling target. The
  player still gets teleported off the lot the moment the picture opens; the marquee is a
  *state* readout, not a *moment*. It is, however, the correct **fallback** if C2 runs
  long — and it is the honest floor to promise the Owner.

---

### 3.3 Option C — **PREMIERE AS A SCHEDULED EVENT** *(most ambitious; recommend DEFER)*

**One sentence:** the studio *books* a premiere — a player decision made in the
`releaseReady` week that spends money and time and converts the Theater into a real
occupancy for one week, with the premiere night itself as the payoff.

- **What happens:** in `releaseReady`, the Theater offers a verb ("Book the premiere"),
  priced from a new TUNING constant; booking creates an authoritative reservation the
  Theater actually holds; premiere night then plays as Option A plus a red-carpet
  arrival order.
- **Why it is ranked last, on evidence:**
  1. It requires a **fifth `FacilityCapability`** (`types.ts:524-528`) and therefore
     touches the capacity union — and law 22 says capacity/occupancy is **ONE union at
     every boundary** consumed by actions, invariants, tick and read models
     (`SHIFT-OPERATIONAL-LAWS.md:48-51`). That is a C2-throughput-sized change landing in
     a presentation lane. **[DOC]**
  2. It is the shortest path to violating the corpus register's amplifier law: a booked,
     paid premiere that does nothing mechanical is decoration; one that *does* something
     mechanical is an amplifier that risks making a bad picture look good
     (`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87`). **[CORPUS]**
  3. It duplicates a system that already exists and is already tiered — the three-tier
     publicity campaign (`publicity.ts:10-60`; `TUNING.PUBLICITY_TIERS`). A premiere
     spend and a publicity spend competing for the same player intent is a design
     collision, not depth. **[CODE]**
- **Recommendation:** hold for **C3 (Progression, Prestige & Awards)**, where a ceremony
  cadence and prestige-from-the-physical-lot already exist to give it meaning
  (`THE-MOVIES-PARITY-MASTER-PLAN.md` §7.3). **[PROPOSAL]**

---

### 3.4 Ranking, and what V1 is explicitly NOT

**Ranked: A > B > C.** A is the design; B is the guaranteed floor and the de-scope path;
C is deferred to C3 with reasons on the record.

**Explicitly NOT in Premiere Night V1** (owner law 7 + scope discipline):

- **No movie footage.** No clip, no playback surface, no "watch the picture", no
  screen-within-the-screen. (Owner law 7, `BRIEF:38`.) **[DOC]**
- **No awards, no ceremony, no rank, no certificate** — C3, and the engine declares those
  requirement kinds not-yet-attainable (PF1 §4/§9). **[DOC]**
- **No red-carpet simulation**: no photographers as agents, no interview beats, no
  star-mood consequence, no relationship accrual, no fan entities with needs. Crowd
  bodies are a *read-out of opening gross*, nothing more.
- **No new economic effect.** The premiere changes no number. Not box office, not
  awareness, not prestige, not cash. (R1.)
- **No persisted premiere record.** No "films premiered" list, no seen-marker, no V14.
  History remains the clippings/Chronicle (PF1 §9 "Notification journal … deferred").
  **[DOC]**
- **No rival-studio premieres, no competing-slate theater.** Non-goal.
- **No buildable/second theater** — see §5.
- **No wrap beat.** Wrap is a separate C2 item (PF1 §10.2) and must not be quietly
  absorbed into this lane. **[DOC]**
- **No new `SimStopReason` member.** Release already stops the sim with first priority
  (`adapter.ts:2365-2372`). **[CODE]**

### 3.5 Interaction classification (required by the hybrid law)

Master plan §5 requires each new surface to be classified at design time and the
classification recorded in its contract. **[DOC]**

**Premiere Night V1 is WORLD-NATIVE.** It is a low-dimensional physical moment on the
lot. The Gazette/ReleaseResult/Autopsy chain it hands to remains a
**complexity-earned overlay** and is untouched. **[PROPOSAL]**

### 3.6 The one routing change, stated precisely

Today: `released.length > 0` ⇒ `setScreen(newspaper | release)` unconditionally
(`App.tsx:2539-2556`). **[CODE]**

Proposed (Option A): when **and only when** `returnContext.kind === 'lot'` **and** the lot
is mounted **and** reduced motion is off, the release surface is **deferred** behind a
world receipt; every other origin (Dashboard, sim-to-event from Dashboard, historic
clipping, reduced motion, renderer failed/unavailable) keeps today's behaviour byte-for-byte.
The routing matrix gains **one row**, not a rewrite:

| Origin and result | First post-tick surface | Continue destination |
|---|---|---|
| **Lot, release, premiere staged** | **Live lot + premiere + Gazette receipt** → Newspaper on demand → ReleaseResult | Studio Lot |

Failure-closed rule: if the premiere cannot stage for **any** reason (renderer failed,
snapshot projection incomplete, reduced motion, `latestReleaseTitle` null), App falls
through to today's exact `setScreen` path. **A release must never be silently swallowed
by a presentation failure** — the direct lesson of `LESSONS-LEARNED.md:2540-2546` and law 5
(`SHIFT-OPERATIONAL-LAWS.md:16-17`). **[PROPOSAL]**

### 3.7 Time Model coupling — **flag for lane 8 / the architect**

**A premiere is the strongest argument for a witnessed-time moment in the game, and it is
also the strongest argument against making witnessed time mandatory.** Both, for reasons
already in the code.

Facts:
- Operational **law 3**: *"Never present a synchronous Engine batch as witnessed time."*
  (`SHIFT-OPERATIONAL-LAWS.md:10-11`). **[DOC]**
- PF1 §2: *"Audio must not narrate skipped time … a multi-week batch is one stop and one
  punctuation, never per-week theater."* **[DOC]**
- The engine already decomposes a week into **ten beats** and playback runs beats 0…8 in
  ~10.35 s, settling exactly onto static truth (`playback.ts:8-34`;
  `TycoonScene.ts:3175-3190`). Playback **refuses** when the snapshot's week ≠ the
  requested week (`:3178`) and is torn down when a snapshot moves the studio off that week
  (`:2600-2604`). **[CODE]**
- `advanceToNextEvent` can process **up to 520 weeks** in one synchronous call
  (`SIM_CAP = 520`, `adapter.ts:2247`) and stops on release with first priority
  (`:2365-2372`). **[CODE]**

The coupling, stated as questions for lane 8 — **not resolved here**:

1. **Does a release inside a multi-week sim get a premiere?** If yes, the premiere becomes
   the *first* witnessed-time moment inside a batch, which is exactly what law 3 forbids
   narrating. If no, the premiere exists only on single-week advances — which is
   defensible (release always *ends* the batch, so the premiere is the batch's terminal
   frame, not a narration of skipped weeks) and is this lane's **[PROPOSAL]**: the
   premiere plays on the stopping tick only, once, regardless of how many weeks were
   skipped to reach it.
2. **Under Model B ("living turn" — the Owner's preferred hypothesis to investigate first,
   PF1 §11.2 **[DOC]**), is the premiere a *pause point*?** A living turn that keeps
   running through opening night makes the premiere ambient; a living turn that halts on
   it makes the premiere the model's showcase. Lane 8 must state which, because the two
   produce different acceptance criteria for this lane.
3. **Does the premiere's ~10 s window set a floor on the living turn's week duration?**
   Today's presence playback already implies a ~10.35 s week. If Model B chooses a
   materially shorter week, the premiere either compresses (and stops being a moment) or
   overruns the week boundary (and violates the "settles onto static truth" law).
   **This is a hard constraint lane 8 should receive as input, not discover later.**
4. **Event-model docket interaction.** PF1 §10.1 recommends C2 pick ONE model (persisted
   ledger vs transient emission) **[DOC]**. Option A works on **transient emission** (it
   needs no history), so this lane does **not** force a persisted ledger. If the architect
   picks a persisted ledger for other reasons, the premiere should consume it rather than
   keep its own detector — but it must not be the *justification* for V14.

---

## 4. Acceptance sketch

### 4.1 The observable moments a playtest verifies

A single-session script (fresh studio → commission → cast → greenlight → advance to
release), checked by a person, not a model:

| # | Moment | Pass condition | Fails if |
|---|---|---|---|
| P1 | The week before opening | The Theater says the picture opens next week, by name | The Theater is silent while the picture is `releaseReady` |
| P2 | The opening week resolves | **The player is still on the lot.** The camera does not cut away; no full-screen surface appears unbidden | The screen switches before the player asked |
| P3 | The marquee | The Theater's marquee carries **this film's title**, spelled exactly as the concept title | Generic "NOW SHOWING", wrong film, or stale title |
| P4 | Arrivals | The people who walk to the Theater are the film's **credited** company — checkable against the Chronicle credits | Anyone uncredited walks; a fired/expired talent still walks (must, per frozen `participants`) or must not — decide and pin |
| P5 | The crowd | Crowd size visibly differs between a big opening and a small one, in the same session | Crowd is constant regardless of opening gross |
| P6 | Empty-house honesty | A genuinely weak opening produces a visibly thin forecourt | The lot flatters a flop |
| P7 | The Gazette moment | The clipping opens **because the player chose it**, from the Theater, and returns to the same live lot | Auto-opening; or returning to the Dashboard |
| P8 | Reduced motion | With reduced motion on, every fact above is present as static text/state and nothing animates | A fact is only available via animation |
| P9 | Mute | With audio off, nothing is lost except sound | Copy or state depends on the sting |
| P10 | Skip | Any input settles the premiere instantly; the receipt survives | Input is swallowed or the receipt disappears |
| P11 | Reload | Reloading the save at the release week replays **no** premiere | A premiere fires on hydration |
| P12 | Two films, one week | Two same-week releases produce **one** premiere sequence naming both, and the existing multi-film newspaper/secondary-story path (`NewspaperReveal.tsx:41-92`) is intact | Two overlapping premieres; or one film silently dropped |
| P13 | Legacy/no-Gazette release | A participant-less film still gets its release surface (`ReleaseResult`) — premiere may degrade to Option B's marquee-only | The release is swallowed because the Gazette was null |
| P14 | Dashboard origin | Releasing from the Dashboard behaves exactly as it does today | Dashboard behaviour changed |
| P15 | Byte parity | Same seeded script, premiere on vs off → **byte-identical exported saves** | Any diff (a premiere wrote truth) |

### 4.2 Handing off from PF1's tier-1 sting without double-announcing (one-owner law)

PF1 ships: *"movie release (sting + the existing NewspaperReveal, keyed on release source
— archive clippings never sting)"* (§5-M2) **[DOC]**. The one-owner law and the
no-double-announce proof already exist in PF1's gate. The handoff proposal:

1. **The sting keeps its trigger and loses nothing.** It fires on the same authoritative
   receipt (`SimResult.stopReason === 'release'` with `released.length > 0`), keyed on
   release **source** so archive clippings stay silent. Premiere Night does **not** add a
   second audio event for the same release.
2. **The sting becomes the premiere's downbeat, not a separate announcement.** In the
   lot-origin premiere path, the sting is the *opening frame* of the sequence (beat 0),
   not a herald for a screen change that no longer happens immediately. Cue tier is
   unchanged (tier 1, `held-beat`). No new cue id for the visual staging.
3. **The single announcement owner is the Theater receipt strip.** Exactly one
   aria-live announcement fires for the release, from the premiere receipt, carrying the
   composed copy verbatim. `NewspaperReveal` mounting later is a *navigation*, not a new
   announcement — the same discipline PF1 applies to promoted announcements ("REPLACES
   nothing accessible … no double-announce", §5-M2). **[DOC]**
4. **Co-tick items keep their existing exact-once law.** If `constructionCompletion`
   shares the release tick, primary keeps priority and the completion punctuates exactly
   once — the premiere becomes the "first post-tick player surface" that owns it, and it
   is stripped before the newspaper, exactly as App does today
   (`App.tsx:2551-2554`). **[CODE]**
5. **A KILLED PF1-M2 changes nothing structural.** Without the sting the premiere is
   silent; the visual sequence, the receipt and the routing are unaffected (§1.7).

### 4.3 Test surfaces this lane will need (named now, so nobody invents them late)

- Determinism: same seed + same script ⇒ identical premiere descriptor and identical crowd
  count (extends the existing `ui/src/determinism.test.tsx` discipline). **[PROPOSAL]**
- Routing: the existing matrix suites
  (`WorldFirstLiveWeekAdvance.test.tsx:276, 420` — Gazette / no-Gazette / autopsy return;
  `ui/e2e/lot-native-next-event-v1.spec.ts:1673` — Gazette/co-event chains) must pass
  **unmodified** for every non-lot origin. **[CODE]** Weakening one of these is the
  defect, not the fix (law 28). **[DOC]**
- Structural pins: re-pinned deliberately, fixture named, compared across independent
  fresh windows over byte-identical saves (law 25). **[DOC]**
- Byte parity: the PF1 parity harness, extended to premiere-on vs premiere-off. **[DOC]**

---

## 5. Theater disposition — the evidence, laid out for a one-paragraph Owner call

**This is a named Owner decision (master plan §10 "Still required", item 2). It is
presented, not decided.**

### The question
Is the Theater a **permanent landmark**, or does it become a **player-built/buildable**
class at the Founding Flip?

### Evidence FOR permanent landmark

| # | Evidence | Tag |
|---|---|---|
| L1 | The engine already models it as a landmark with **no capacity**: `role: 'landmark'`, `providesFacilityIds: []` (`lot.ts:213-219`), documented as *"civic bodies that occupy ground and nothing else"* (`lot.ts:179-181`) | **[CODE]** |
| L2 | There is **no exhibition capability to give it**. `FacilityCapability` has four members, none of them exhibition (`types.ts:524-528`); adding a fifth touches the ONE capacity union at every boundary (law 22) | **[CODE][DOC]** |
| L3 | The **F2 seam** proves a capacity-0 blueprint is *structurally unengageable* — "no reservation can name them" — and the C1 red-team recorded it as a real economic defect (`LOT-CONTENT-EXPANSION-LOG.md:520-522`). A buildable Theater today lands squarely in F2 | **[DOC]** |
| L4 | Every `FacilityBlueprint` must carry an `effectSummary` — *"an entry that does nothing has nothing to say"* — the explicit anti-decorative-blueprint law (`types.ts:904-917`); reinforced by PF1 §11.1 striking the futures shelf for exactly this reason | **[CODE][DOC]** |
| L5 | The original **never shipped a buildable cinema**: `facility_cinema.ini` is cost 0, `given=0`, `p_debug12.msh`, and the corpus explicitly instructs *"Do not conclude a 'Cinema' facility was ever player-accessible"* (`facility_candidates.csv` `TECH-FAC-029`; `dormant_or_unconfirmed_fields.csv` `TECH-DORMANT-001`); no cinema row in the 28-row `facility_catalog.csv` | **[CORPUS]** |
| L6 | In the original, **release lived in the Production Office**, not a theater — the Release / Movie Player / Reviews rooms (Bible §5 facility table line 613; §7 pipeline line 1057). Exhibition was off-lot by design | **[CORPUS]** |
| L7 | Master plan §6 already leans this way and gives the rationale: *"Exhibition is the town's, not studio construction"* | **[DOC]** |
| L8 | Landmark status is what makes Premiere Night **cheap and safe**: a fixed, always-present, un-demolishable body means the premiere always has a stage, needs no "what if the player has no theater / three theaters" branch, and needs no new capacity | **[PROPOSAL]** |

### Evidence FOR buildable (stated at full strength, not strawmanned)

| # | Evidence | Tag |
|---|---|---|
| B1 | The product law of C2's capstone is *"I started with almost nothing. I built this studio"* — and §6's **minimum starting lot is Gate + Admin + road + vacant parcels**. The Theater is **not** in that list, which reads as "the Theater is not part of the founding minimum" (`THE-MOVIES-PARITY-MASTER-PLAN.md` §6) | **[DOC]** |
| B2 | After the Founding Flip a fresh studio starting with a *free, un-earned* Theater is an odd exception beside a player who must build their own Development Office | **[PROPOSAL]** |
| B3 | The Theater is today the one body whose primary verb **ejects to the Dashboard** (`navigation.ts:41-50, 56-58, 69`), i.e. it is the least "operated" building on the lot — arguably evidence it is under-designed rather than correctly civic | **[CODE]** |
| B4 | C3 adds Lot Prestige tied to physical maintenance/ornamentation (`THE-MOVIES-PARITY-MASTER-PLAN.md` §7.3); a studio theater is a natural prestige object, and prestige is a real (non-decorative) effect class that could legitimately carry a blueprint | **[DOC]** |

### The three dispositions actually available

- **D1 — PERMANENT LANDMARK, upgraded (recommended).** The Theater stays fixed,
  un-demolishable and always present, and Premiere Night V1 gives it the function it has
  been missing. It becomes the release moment's stage and the studio's memory wall
  (Chronicle/clippings), not a capacity building. Cost: none beyond this lane.
- **D2 — LANDMARK NOW, REVISIT AT C3.** Identical to D1 for C2, with the buildable/
  prestige question formally deferred to C3 where prestige effects exist. Costs one
  recorded deferral; costs nothing structurally.
- **D3 — BUILDABLE AT THE FLIP.** Requires: a fifth `FacilityCapability` **or** an
  accepted effect-class blueprint that does not hit F2; a `requires`/`maxInstances`
  policy; a "no theater yet" state for every release path (marquee, badge, premiere,
  inspector, journey copy); and a decision about what happens to a studio that demolishes
  its theater mid-run. This is a genuine sub-milestone, not a flag flip.

### Recommendation (PM-level, for the Owner to accept or overturn)

**D1, with D2 as the conservative variant.** The decisive asymmetry is that D1/D2 cost
nothing and unlock this lane, while D3 requires new capacity-model surface area inside the
campaign that is *already* spending its capacity budget on Sets, Stages and throughput —
and its strongest argument (B1/B4) is about **prestige**, which is C3's subject, not C2's.
Deferring to C3 loses nothing: the Theater being a landmark in C2 does not prevent C3 from
making theaters buildable later, whereas making it buildable now forces a capability
decision before Premiere Night has taught anyone what the building is for.

### The Owner's decision, in one paragraph

> *The Theater is a permanent landmark. It is never bought, moved, or demolished; it has
> no engine capacity and gates no action. What it gains in C2 is a job: it is where a
> picture opens — the marquee takes the film's name, the credited company arrives, and the
> Gazette is read from the Theater steps rather than instead of them. Whether a studio may
> one day build a second, grander theater as a prestige object is a Campaign 3 question and
> is deferred there explicitly, not silently.*

*(If the Owner prefers buildable, the decision paragraph must additionally name which
capability the Theater carries and what a theater-less studio does at release — those two
answers are the whole cost of D3.)*

---

## 6. Risks, gaps, and contradictions (loud, unresolved)

**G1 — The `releaseTick` week-stamp contradiction is now load-bearing.** The engine
stamps `releaseTick` pre-increment (`tick.ts:332, 703`; `adapter.ts:2443-2445`), the
Gazette prints that number as its date (`adapter.ts:5268`; `newspaper.ts:647`), and the
player is standing in `releaseTick + 1` when they read it. Today this is a copy seam
routed to C2 (`BRIEF:67-68`). **A premiere makes it visible in the world**: the marquee,
the badge and the premiere copy will all have to say a week number out loud, standing next
to the topbar. **This must be resolved before Premiere Night's copy is written**, not
after. **[CODE][DOC]**

**G2 — Master plan §6 contradicts itself on the Theater, mildly but materially.** The
classification table calls `theater` a **LANDMARK (lean)** with a final call pending, while
the same section's "minimum starting lot of the eventual mature design" lists only
Gate, Administration, road and vacant parcels — i.e. *not* the Theater. A fresh studio at
the Flip therefore either starts with a Theater (contradicting the minimum-lot sentence) or
without one (contradicting "permanent landmark"). **Reported, not resolved.** The Founding
Flip lane and this lane must agree on the answer, and the Owner's §5 call settles it.
**[DOC]**

**G3 — `releaseReady` says the picture is at the Theater; presence says nobody is there.**
`managedWorkflowLocation` returns `'theater'` (`adapter.ts:5550-5551`) while
`requirementsForPhase('releaseReady')` returns `[]` (`operations.ts:90-91`) and
`attendanceForPhase` returns no rows (`presence.ts:197-198`). Neither is wrong under its
own law, but a premiere that puts people at the Theater is *presentation asserting
attendance the engine does not model*. **Two honest resolutions exist and this lane does
not pick one:** (a) the premiere's people are read from `FilmResult.participants` and are
explicitly framed as *attending an event*, not *working a reservation* — presentation-only,
no engine change; or (b) C2 gives `releaseReady` a real premiere reservation (Option C
territory, and law 22 applies). **[CODE]**

**G4 — The Theater's primary verb ejects to the Dashboard.** `navigation.ts:46` routes
`view-released-films` to `{ kind: 'dashboard' }`, in tension with the hybrid interaction
law's *"never eject the player from the studio casually"*
(`THE-MOVIES-PARITY-MASTER-PLAN.md` §5). Premiere Night will make the Theater a place
players go on purpose, which raises the cost of that ejection. Not this lane's to fix, but
it will be felt here. **[CODE][DOC]**

**G5 — The named-title marquee already exists on a rolled-back renderer.** `makeMarquee`
+ `refreshMarquee` (`signage.ts:151-233`; `LotScene.ts:674-691, 717`) run only in the
legacy `LotScene`, which boots only when both adopted world gates are rolled back
(`flags.ts:43-50, 154-157`; `StudioLotView.ts:171-208`). **Risk:** an implementer reads
"the marquee already works" from a passing test (`draw.test.ts:121-132`) and does not
notice ordinary players have never seen it. **Any C2 charter text must say the port is
required.** **[CODE]**

**G6 — Structural pins will move, and that is a *decision*, not a side effect.** Grid
managed-idle Week 0 is pinned at `231/14/8,806,568/6` (`SHIFT-OPERATIONAL-LAWS.md:67-75`).
Marquee text + crowd bodies move objects and actors. Law 25 requires the fixture be named
and the comparison run across independent fresh windows over byte-identical saves. Note
that the crowd is *release-conditional*, so the **Week 0 idle pin should be unaffected** —
but the release-week fixture will need its own pin. **[DOC]**

**G7 — Crowd size is a new derived number and therefore needs a TUNING home.** Owner law 8
forbids decorative population (`BRIEF:39-43`); the project forbids inlining a magic number
that has a name (`CLAUDE.md` Conventions). A crowd derived from `run.weeklyGross[0]`
needs a named constant (e.g. a gross-per-body scale and a body cap) in `TUNING`. **But
`TUNING` lives in `src/core`**, and a *presentation-only* constant in the engine's tuning
table is itself questionable. **Unresolved: where does a presentation scale constant
live?** This is a small but real architectural question the architect should rule on,
because the same question will recur for every simulation-theater number in C2. **[CODE]**

**G8 — `simStopMessage`'s release case computes titles and then does not use them.**
`const titles = ctx.released.map((f) => f.conceptId)` is dead — the returned string is
`"Stopped at Week N: a film released."` with no title (`adapter.ts:2491-2494`), and the
comment on that line admits titles are *"resolved by the caller's concept lookup where
shown"*. PF1 displays `stopMessage` **verbatim** (§2). So the release stop message names
no picture. Not a defect in output, but premiere copy must not assume the stop message
carries the title. **[CODE][DOC]**

**G9 — Premiere Night has no original-game precedent, and the charter must say so.** The
Bible documents no premiere; the corpus documents an inert debug cinema; the original's
release presentation was an icon and a pulsing `$` (§2.4). Presenting Premiere Night as
"parity" would be false. Presenting it as an **invention justified by our own product
target** is honest and is what §11 of the master plan permits (original numeric values are
evidence, not spec; shapes are the recoverable truth). **[CORPUS][DOC]**

**G10 — The corpus's amplifier law is the sharpest constraint and is easy to erode later.**
*"…premieres … may amplify a strong production; none may make a poorly developed and
poorly produced film artistically good"*
(`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87`). V1 complies trivially by changing no
number. **The risk is V2**: the first person to ask "shouldn't a great premiere help the
opening?" is asking to violate a recorded design invariant. Record it in the charter now.
**[CORPUS]**

**G11 — Multi-release weeks are under-specified in the world.** The engine happily
releases several productions in one tick, ordered ascending by id (`tick.ts:247-249`), and
the newspaper already handles secondaries (`NewspaperReveal.tsx:41-92`). **What does the
lot do with two premieres on one night?** This lane's proposal is one sequence naming both
(P12), but the crowd/marquee arbitration is genuinely undesigned. Flagged. **[CODE]**

**G12 — No contradiction found between the brief, the PF1 charter and the master plan on
this lane's core claims.** PF1 §9/§10.3 and owner law 7 agree that Premiere Night is C2's;
PF1's narrow "world emphasis" fence (§5-M2) is consistent with C2 owning the staged
version. The one *near*-contradiction — PF1's fence says "no new display object" — applies
to **PF1**, not C2, and PF1 says so explicitly (*"this is the fence against C2's reserved
simulation theater"*). Recorded so nobody mistakes PF1's fence for a C2 constraint.
**[DOC]**

---

## 7. Citation index (load-bearing lines only)

**Engine — `src/core/`**
`tuning.ts:49` PRODUCTION_TICKS · `:390-402` D-12 theatrical block (`:394` share, `:395`
THEATRICAL_WEEKS 6, `:396-398` hold/floor, `:402` model version) · `:748-754`
FACILITY_BLUEPRINTS
`types.ts:241-264` FilmResult · `:252` boxOffice · `:257-263` participants/forecast ·
`:303-316` TheatricalRun · `:524-528` FacilityCapability · `:886-931` FacilityBlueprint
(`:904-917` effectSummary law) · `:1140-1152` PropertyStructureRole
`tick.ts:243-249` release collection · `:268-444` per-release resolution · `:332`
releaseTick stamp · `:351` releasedFilms append · `:356-369` engaged/lump branch · `:359`
openTheatricalRun · `:457-480` weekly theatrical revenue · `:703` week increment
`economy.ts:22-48` theatricalSchedule · `:53-73` openTheatricalRun · `:77-92`
legacyTheatricalRun
`newspaper.ts:23-24` masthead · `:28-32` criticStars · `:43-49` audienceTier · `:53-67`
aggregate · `:253-370` buildFilmChronicle · `:390-415` NewspaperView · `:438-439`
disclosure · `:461-468` D-17A truthfulness note · `:469-531` makeHeadline · `:538-587`
makeCallouts · `:590-676` buildNewspaper
`operations.ts:56-77` phase-by-countdown · `:79-93` requirementsForPhase (`:90-91`
releaseReady empty)
`presence.ts:120-136` attendance canon (`:128` releaseReady nobody) · `:156-198`
attendanceForPhase (`:197-198`)
`lot.ts:178-181` landmark doc · `:194` INITIAL_PROPERTY_STRUCTURES · `:213-219` theater
structure
`studioCalendar.ts:86-93` theatricalReceipt commitment · `:469-486` emission
`publicity.ts:10-60` publicity tiers
`firstFilmJourney.ts:75-86` journey stages · `:97` JourneySite (no theater) · `:380-397`
"In release"

**UI — `ui/src/`**
`App.tsx:2523-2532` no-release lot return · `:2539-2556` newspaper/release routing ·
`:2551-2554` co-tick one-owner strip
`engine/adapter.ts:2213-2223` SimStopReason · `:2224-2246` SimResult · `:2247`
SIM_CAP · `:2365-2372` release stop first priority · `:2443-2445` pre-increment stamp ·
`:2476-2529` simStopMessage (`:2491-2494` release case) · `:5230-5270` releaseNewspaper ·
`:5310` LOT_RECENT_RELEASE_WEEKS · `:5517-5552` managedWorkflowLocation (`:5550-5551`
releaseReady→theater) · `:6464-6477` releasePresence/latestReleaseTitle · `:6594-6607`
theater attention cue
`screens/NewspaperReveal.tsx:1-4, 41-92` · `screens/ReleaseResult.tsx:1-5, 22-60` ·
`screens/Autopsy.tsx` (856 lines)
`lot/navigation.ts:41-50, 56-58, 69` theater route/blurb
`lot/buildingInspector.ts:155, 178, 628-649, 983-996` theater inspector
`lot/facilityMutation.ts:79-80` founding-placement refusal
`lot/snapshot/StudioLotSnapshot.ts:209, 718-726, 734-737` released cards / marquee fields /
sceneSeed
`lot/snapshot/nextEvent.ts:24` release exclusion · `:48-51, 643-650` run-completed →
theater
`lot/identity/signage.ts:151-233` makeMarquee · `lot/identity/manifest.ts:49-50, 105`
marquee treatment + static reduced-motion
`lot/scene/LotScene.ts:674-691` refreshMarquee · `:717` theater positive badge
`lot/tycoon/TycoonScene.ts:1060-1100` label/badge/chip · `:1334-1340` pre-created flash ·
`:2596-2604` playback teardown law · `:2796-2836` paintBuildingStates · `:2840-2866`
setBadge · `:3175-3190` playPresenceWeek · `:3194-3200` skipPresencePlayback ·
`:3237-3261` playPublicity/clear · `:3452-3461` applyCameraPreset
`lot/tycoon/world.ts:255-267` theater anchors · `:483-484` theater paths · `:599-601`
theater forecourt props
`lot/tycoon/assets.ts:845-866` bakeTheater (baked marquee + blade sign)
`lot/tycoon/playback.ts:8-34` played window / beat timing
`lot/StudioLotView.ts:171-208` scene selection · `:533` playPublicity bridge · `:606-608`
playPresenceWeek bridge
`lot/StudioLotScreen.tsx:4395-4405` playback call site
`flags.ts:43-50, 154-157` tycoon world default ON

**Docs (repo)**
`docs/SHIFT-OPERATIONAL-LAWS.md:6-11` (laws 1-3) · `:16-17` (law 5) · `:48-51` (law 22) ·
`:52-55` (law 23) · `:67-75` (law 25 pins) · `:76-83` (law 26) · `:84-88` (law 27a) ·
`:89-95` (law 28)
`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:94-115` routing matrix
`docs/LESSONS-LEARNED.md:2540-2546` release-routing failure family
`THE-MOVIES-PARITY-MASTER-PLAN.md` §5 hybrid interaction law · §6 classification table +
minimum starting lot + staging · §7.2 C2 scope · §8.2 headline acceptance · §10 owner
decisions · §11 evidence-not-spec
`LOT-CONTENT-EXPANSION-LOG.md:508-530` C1 red-team seams F2/F3/F4
`docs/c2-planning/00-C2-PLANNING-BRIEF.md:19-47` owner laws · `:60-68` PF1 routing to C2

**PF1 charter** (`PROFESSIONAL-FLOOR-V1-CHARTER.md`, branch
`hspector-github/professional-floor-v1-fresh`, read via `git show` — the PF1 worktree was
never opened): §2 standing law · §3 editorial voice · §4 recon (no wrap, aria audit,
structural pins) · §5 PF1-M2 tier table + world-emphasis fence · §9 non-goals (Premiere
Night → C2) · §10.1-10.3 findings routed to C2 · §11.2 Model B hypothesis · §13 DONE

**Corpus** (`/Users/bruce/Desktop/Big Swing Art/`, read-only)
`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/facility_candidates.csv` row `TECH-FAC-029` ·
`.../dormant_or_unconfirmed_fields.csv` row `TECH-DORMANT-001` ·
`THE-MOVIES-2005-ORIGINAL-DATA/facility_catalog.csv` (28 rows, no cinema) ·
`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` line 613 (Production Office), 1057
(release row), 1063 (icon sequence / pulsing $), 581 (separate screens), 2664 (only
"Premier" hit), 3377 + 3523 + 3559 (parity matrix release rows) ·
`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87` (amplifier law)

---

*Lane 9 complete. Two Owner items are raised and deliberately not decided: the Theater
disposition (§5) and the week-convention/`releaseTick` seam (§6-G1). The Time Model
coupling (§3.7) is handed to lane 8 as input, not as a conclusion.*
