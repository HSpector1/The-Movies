# LANE 7 — SIMULATION THEATER & RENDERER CONSTRAINTS

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **Planning only.** Nothing in this file is implemented, scaffolded, or authorized.
>
> Claim tags used throughout: **[CODE]** = observed in this worktree at a cited
> `file:line`; **[DOC]** = stated in a governing document at a cited file+section;
> **[CORPUS]** = evidence corpus at `/Users/bruce/Desktop/Big Swing Art/`;
> **[PROPOSAL]** = my recommendation, not a fact and not a decision.
>
> Owner law under audit: **law 8 — visible activity must correspond to authoritative
> work; no decorative screensaver population.** Standing laws 1–3 (engine owns law;
> animation acknowledges but never completes; no synchronous batch presented as
> witnessed time) bound everything below.

---

## 0. Headline for the architect

**The theater C2 is asked for already exists in miniature, is already law-clean, and is
already load-bearing — and it has exactly two structural problems.**

1. **[CODE]** The shipped default world (the tycoon grid) already renders an
   engine-owned, save-neutral, RNG-neutral presence projection: named people commute
   along authored routes, stand at the facility their production actually reserved,
   queue outside a facility they are actually blocked from, and the building sign prints
   the engine's own occupant count. That is *precisely* the owner-law-8 shape. C2 does
   not need to invent simulation theater; it needs to **widen the subject matter**
   (stages, sets, load-in, crates, wrap) and **deepen the queue** — over machinery that
   already obeys laws 1–3.
2. **[CODE]** The two structural problems are (a) there is exactly **one** authoritative
   physical work-site family the theater can dramatise today — soundstage/scenery/post
   reservations of at most **two** productions — and (b) the only visible thing on the
   lot that is *not* engine-backed is **eight ambient patrol actors**
   (`ui/src/lot/tycoon/world.ts:1054-1067`, built at
   `ui/src/lot/tycoon/TycoonScene.ts:2457-2482`). Those eight are, on the plain text of
   owner law 8, decorative population. **C2 must rule on them explicitly.**
3. **[CODE]** Art capacity is *not* the constraint people assume it is. The shipped
   default world is **procedurally baked at runtime from Phaser Graphics**
   (`ui/src/lot/tycoon/assets.ts:1-22`), it already contains a parameterised
   `bakeStage()` (`assets.ts:871-894`), and an un-arted blueprint gets an **honest
   massing block**, never a borrowed body (`ui/src/lot/tycoon/world.ts:382-391`). The
   authored-plate pipeline and the Soundstage-12 NO-GO govern a **different world** —
   the retained Operation Hollywood plate, which is now the *rollback* path.

---

## 1. Inventory — today's presence / work-visibility machinery

### 1.1 There are TWO worlds, and only one is the shipped default

**[CODE]** `ui/src/flags.ts:154-157` — `tycoonWorldEnabled()` is an *adopted default-ON*
gate; explicit `0` rolls back. `ui/src/flags.ts:43-51` states it plainly: *"DEFAULT ON:
this is the adopted default world. An explicit rollback (`0`) selects the retained
Operation Hollywood painted district instead."*

**[CODE]** `ui/playwright.config.ts:24` and `:145-155` — the browser suite runs **two
origins**: port 5178 pinned to `VITE_TYCOON_WORLD: '0'` (the retained plate) and port
5179 serving the shipped default (grid). The config's own words: *"two origins, because
the product has two worlds."*

| | **Grid / tycoon world** (shipped default) | **Plate / Operation Hollywood** (retained rollback) |
|---|---|---|
| art source | procedural runtime bakes, Phaser Graphics [CODE `ui/src/lot/tycoon/assets.ts:1-22`] | offline-authored 1586×992 photoreal plate + district manifest [CODE `ui/public/lot/hollywood/district-base.png`, `district-manifest.json`] |
| people | role-atlas sprites at presence-derived stands [CODE `ui/src/lot/tycoon/presence.ts:249-303`] | role-atlas sprites at deterministic presentation homes [DOC company-presence contract §8] |
| beat playback | yes [CODE `ui/src/lot/tycoon/playback.ts`] | no (no `presence` consumption found in `HollywoodScene.ts`) |
| law 25 pins | 231 / 14 / 8,806,568 / 6 [CODE `ui/playwright.config.ts:92-96`] | 42/19, 46/21, 62/29, 63/30, 64/30 @ 11,096,896 bytes / 1 draw [CODE `ui/playwright.config.ts:66-81`] |

**This split is the single most important renderer fact for C2 planning.** Both worlds
consume the **same** `studioLotSnapshot`, so a shared-snapshot change moves **both**
pin families. That is not hypothetical — it already happened at C1-M1.5:

> **[CODE]** `ui/playwright.config.ts:59-64`: *"M1.5 `eebbefd` moved roster presence into
> `studioLotSnapshot`, which BOTH worlds consume, so every contracted employee the
> projected company does not already claim now stands on the plate too — one dynamic
> actor and two display objects each. Decoded bytes (11,096,896) and the single draw
> call are unchanged in every case, which is what proves the delta is people and not a
> renderer leak."*

### 1.2 The engine's own answer: `src/core/presence.ts`

**[CODE]** `src/core/presence.ts:1-40` — `studioPresence(state)` is the canonical,
**pure, save-neutral** projection of "who is where, doing what, this week". Its declared
properties, verbatim from the header: changes zero outcomes and persists nothing; alters
no tick step and is called by none; consumes **zero simulation RNG** (the cosmetic
departure stagger uses a derived stream keyed `(seed, 'presence-v1', talentId:week)`,
`state.rngState` never read); never throws — an ambiguity **withholds** the person with a
stated reason.

**[CODE]** Frozen presentation constants — `presence.ts:58-62`:

```
BEATS_PER_WEEK = 10          // indices 0…9
PRESENCE_DEPARTURE_WINDOW = 3 // a worker departs on beat 0, 1, or 2
PRESENCE_LAST_WORK_BEAT = 8   // beat 9 is always the return home
```

**[CODE]** Beat vocabulary — `presence.ts:64`: `'home' | 'travel' | 'at-site' | 'waiting'`.
The whole week is `home… → travel (exactly 1 beat) → at-site|waiting → home`
(`presence.ts:211-231`).

**[CODE]** The **attendance canon** (`presence.ts:118-147`) is the authoritative map from
production phase to bodies and sites, and every row is anchored to a reservation the
production *actually holds*:

| phase | who | site capability |
|---|---|---|
| development / preProduction | writer, director | `development-casting` |
| rehearsal | director + 3 cast | `soundstage` |
| shooting | director + 3 cast | `soundstage` |
| shooting | craft… | `set-scenery` |
| postProduction | director, craft… | `post` |
| releaseReady | — (phase holds no reservation) | — |

**[CODE]** Three **recorded truth gaps** (`presence.ts:26-40`) that C2 inherits verbatim:

1. A `facility-capacity` blocker carries **only** `{capability, targetPhase}` — it names
   **no** specific full facility, so "the full facility" does not exist as an
   authoritative id. The waiting rule is therefore downgraded: *the company waits at the
   site it actually holds*, not outside the site it wants.
2. Casting has **no modelled personnel** — the people at an auditioning session are its
   slate candidates; no casting director exists in state.
3. `releaseReady` holds **no reservation**, so its company is claimed by nobody.

**[CODE]** Occupancy is **one union** across production + script + casting reservations
(`presence.ts:355-381`), and a slot claimed twice withholds everyone resolving to it
(`presence.ts:390-396`) — law 22 enforced inside the projection itself.

### 1.3 Snapshot mirror

**[CODE]** `ui/src/engine/adapter.ts:5579-5638` and `:6225` build `LotPresenceProjection`
onto the shared snapshot. Type at `ui/src/lot/snapshot/StudioLotSnapshot.ts:483-493`:
`{week, beatsPerWeek, staticBeat, people[], withheldTalentIds[]}`.

**[CODE]** `StudioLotSnapshot.ts:495-504` — `LOT_PRESENCE_STATIC_BEAT = 5` is
**presentation law**: the one instant "this week" means, chosen so the canvas and the DOM
companion can never disagree. Beats 3…8 are the only ones where every claimed person is
provably at (or queued outside) their site.

**[CODE]** Each `LotPresencePerson` (`StudioLotSnapshot.ts:457-480`) carries
`facilityId`, `slot`, `beats[]`, `blockedReason` (the engine's queue reason **verbatim**),
plus three Calendar-joined strings (`facilityName`, `workTitle`, `activity`) that degrade
to `null` rather than being invented.

### 1.4 How people appear at buildings (the one translation)

**[CODE]** `ui/src/lot/tycoon/presence.ts:1-22` — this module is *"the only place that
translation happens"*; it owns no rule, decides no attendance, invents no location for an
unauthored facility (law 12), advances no beat, and holds no Phaser.

- **[CODE]** `presence.ts:57-64` — `PRESENCE_FACILITY_PLACE` maps the six founding engine
  facility ids to authored places. Two recorded rulings: one engine `development-casting`
  facility is drawn as two buildings and presence stands at **Development**;
  `facility-scenery-shop` and `facility-post-building` are both the Scenery & Post body.
- **[CODE]** `presence.ts:157-187` — a **placed** facility is a first-class world citizen
  (`placed-<placementId>`); its `work`/`wait` anchors come from its **blueprint's
  presentation template**, derived from the engine's own cell list, not arithmetic
  invented in the renderer.
- **[CODE]** `presence.ts:194-215` — `resolvePresenceSite` returns **null** when nothing
  authored answers for a facility. *"A facility whose body is not standing on this
  property claims no site at all."* Contradictory truth (two placements, one facility id)
  also returns null.
- **[CODE]** `presence.ts:249-303` — `presenceStands()` assigns co-location offsets in the
  engine's own talentId order, consuming **no RNG**.
- **[CODE]** `presence.ts:311-334` — `presenceOccupantCounts()` counts **presence, not
  sprites**: an uncontracted slate candidate is genuinely in the building even though the
  lot draws no body for them, *"and the count would be a lie if it said otherwise."*

### 1.5 Travel — what actually exists

**This directly contradicts the brief's inherited planning note. Flagged in §7.**

**[CODE]** `ui/src/lot/tycoon/world.ts:860-874` — `PRESENCE_ROUTES` is an **authored**
waypoint table: 2 home-zone roles × 9 places = twelve short hand-placed lists. The header
is explicit: *"They are AUTHORED, not searched… which is the honest way to get
road-following movement without inventing a pathfinder the milestone explicitly
excludes."* Every interior waypoint sits on real circulation and no segment crosses a
building footprint, both asserted in `world.test.ts`.

**[CODE]** `ui/src/lot/tycoon/playback.ts:1-22` — week playback is *"LAW 1/2/3, restated
as code."* Everything is a function of (a) the engine's beat array, (b) an authored path,
(c) a wall clock. *"Stop the clock at any instant and the world still says exactly what
`studioPresence` said; that is the whole point."*

- **[CODE]** `playback.ts:28-34`: `PLAYBACK_BEAT_MS = 1_150`, `PLAYBACK_LAST_BEAT = 8`,
  `PLAYBACK_DURATION_MS = 10,350` (inside an 8–12 s target).
- **[CODE]** `playback.ts:74-96` — `pointAlongPath` interpolates **by arc length**, so a
  long avenue leg and a short forecourt leg are crossed at the same speed.
- **[CODE]** `playback.ts:8-22` — a **recorded contradiction**, not papered over: the
  milestone brief asked both that the resting frame show everyone at their site *and*
  that playback "return at beat 9". Those cannot both be true of one settled frame. The
  played window is beats 0…8; beat 9's walk home is implemented and tested but not run.

**[CORPUS]** The Bible's own audit of this machinery is the sharpest statement of the
limit (`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:4092`): *"travel time is NOT
distance-derived… `PRESENCE_LAST_WORK_BEAT`/departure logic allocates travel exactly one
fixed beat regardless of how far a person's home is from their assigned facility… There
is no live pathfinder, no A*, no Floyd-Warshall travel-time matrix wired into outcomes
(despite CODE-MINING-LEDGER Entry 1 having designed exactly such a matrix as the intended
engine mechanism) — where a building sits on the lot has NO effect on how quickly work
gets done, unlike the original The Movies' layout-affects-throughput mechanic."*

So the precise state of travel is: **presentation travel over authored routes = SHIPPED
and law-clean. Pathfinding = greenfield. Distance-affects-outcome = greenfield and
engine-side.**

### 1.6 Signage, status lines, attention markers, occupancy chrome

All of the following are **[CODE]**, all in `ui/src/lot/tycoon/TycoonScene.ts` unless noted.

| surface | where | what it says |
|---|---|---|
| building sign (baked) | `assets.ts:891` `signField()`; scene letters it | permanent building name |
| **occupancy caption** | `:2819-2823` | `"<name> • N here"` — N is `presenceOccupantCounts`, engine truth. Rides the label LOD rule |
| stage lamp + chip + badge | `:2868-2905` | Stage 7: `"<SIGN> · <statusLabel>"` from `ProductionOperationsState.statusLabel`. Stage 12: `FILMING / IDLE / AVAILABLE` |
| **stage activity cue** | `:2907-2929` | crew-call / staged-gear / take-in-progress ellipse + boom + gear crate on the Stage 7 apron, keyed to `taskStatus` |
| **scenery load-in cue** | `:2931-2973` | yard→dock line, crate at source, check/circle at dock; **blocked** paints amber with a hazard lamp; a one-shot cosmetic crate **sweeps** the line |
| **waiting-queue cue** | `:2769-2794` | ONE shared `tier:presence-queue` Graphics layer: a pale pool + a chevron under each waiting person pointing at the door they cannot get through |
| attention badge | `:2840-2866` | `decision-required` / `opportunity` / `watch` colour + reason text from the snapshot |
| guidance marker | `:1276-1282`, `:3622-3627` | ONE breathing pool of light on the FMJ's next site |
| person nameplate | `:2431-2456` | hidden unless selected, or at `people` LOD band |
| person stance | `:2746-2757` | a **queued** person faces the door (`north`); a working one faces the camera (`south`) — *"Distinct stance, no new art and no new display object."* |

**[CODE]** Inspector prose is a separate pure projection —
`ui/src/lot/snapshot/presenceLines.ts:108-180`. It prints
`"Shooting <title> at <facility>, slot <n>"` or, when queued,
`"Waiting — <blockedReason>"` **verbatim**: *"The lot never rewords a blocker"*
(`presenceLines.ts:135`). A claimed site whose own beat does not put the person there
returns `null` rather than letting the canvas and the panel disagree
(`presenceLines.ts:149-154`).

### 1.7 The one thing that is NOT engine-backed

**[CODE]** `ui/src/lot/tycoon/world.ts:1053-1067` — `AMBIENT_ROUTES`: *"Deterministic
ambient patrols."* Eight of them: 2× grip, stagehand, electrician, camera, publicity,
security, extra. Built at `TycoonScene.ts:2457-2482` as sprites with an RNG phase and
speed, patrolling a fixed A↔B segment forever.

**[DOC]** The company-presence contract already ruled these cosmetic and forbade named
staff from wearing them: *"Writer and Craft must not be rendered as ambient Grip,
Stagehand, Electrician, Camera, Publicity, Security, or Extra. Those remain cosmetic
district actors and never become named staff."*
(`docs/WORLD-FIRST-ACTIVE-PRODUCTION-COMPANY-PRESENCE-PICTURE-SWITCHING-V1-CONTRACT.md:201-204`).

**Owner law 8 says "No decorative screensaver population." Eight patrolling bodies that
correspond to no authoritative work are, on the plain text, exactly that.** C2 must rule.
Options in §6.4.

---

## 2. What "physically watch it manufacture multiple movies" can legally mean TODAY

### 2.1 The current time model, stated exactly

**[CODE]** `src/core/operations.ts:56-77` — a managed production is an **8-tick
countdown**, and its phase is a pure function of `remainingTicks`:

```
8 → development      7 → preProduction     6 → rehearsal
5,4 → shooting       3,2 → postProduction  1 → releaseReady
```

So "a shooting week" is a real, discrete, twice-occurring thing. **[CODE]**
`src/core/tuning.ts:49` `PRODUCTION_TICKS: 8`; `:50` `MAX_CONCURRENT_PRODUCTIONS: 2`,
enforced at `src/core/actions.ts:332-337`.

**[CODE]** One week advance = exactly one engine tick, owned by
`ui/src/engine/adapter.ts::advanceWeek` [DOC `docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:55-77`].
**[CODE]** `ui/src/engine/adapter.ts:2250` `advanceToNextEvent()` is a synchronous
multi-week batch capped at `SIM_CAP = 520` (`adapter.ts:2247`).

**[CODE]** Law 3 is already correctly enforced at the theater boundary —
`ui/src/lot/StudioLotScreen.tsx:4382-4406`:

> *"Law 3: a synchronous Engine batch is not witnessed time. `advanceToNextEvent` may
> cross forty weeks in one call; none of those weeks was ever a moment the player was
> present for, so none of them is animated and the world simply lands on current truth.
> Only the single Advance-one-week arm — the one week the player asked for, one at a time
> — plays its beat timeline, and only when the App's own feedback for that advance names
> the exact week the renderer is now showing."*

Reinforced in the scene: `TycoonScene.ts:3175-3179` refuses playback when
`presence.week !== week`, and `:3180-3185` treats reduced motion as *"instant final
positions, not a shorter walk."*

**This is the precedent C2 must not weaken.** Any C2 theater element inherits the same
gate: it may play only for a week the player personally advanced, one at a time.

### 2.2 The taxonomy — what needs witnessed time and what does not

I split every candidate theater element into three classes.

**CLASS A — STATE PROJECTION.** True of the *settled* week. Renders identically on a
fresh load, after a 40-week batch, and mid-playback. Costs nothing from the Time Model
docket. **This is where C2's throughput legibility should live.**

| element | authoritative source today | verdict |
|---|---|---|
| companies standing on a stage during a shooting week | `presence.ts` attendance canon (`:118-147`) + soundstage reservation | **[CODE] already shipped** for 2 stages |
| stage occupied / reserved / recording / decision-required | `ui/src/lot/scene/productionStageState.ts:16-24` | **[CODE] already shipped** |
| "N here" occupancy on a building sign | `presenceOccupantCounts` (`tycoon/presence.ts:311-334`) | **[CODE] already shipped**, generalises to placed facilities free |
| scenery crates present at a stage during load-in | `sceneryLoadInContext` (`snapshot/sceneryLoadIn.ts:24-63`), states `blocked`/`ready` | **[CODE] shipped for Stage 7 only** — needs generalising, not new time |
| a queue visualized at a building | `blockedReason` + `waiting` beats; one shared Graphics layer (`TycoonScene.ts:2769-2794`) | **[CODE] shipped, but thin** — see §6 |
| set dressed / struck / decayed on a stage | **does not exist** — no Set entity in `src/core` | **[PROPOSAL] Class A once C2 adds Sets** |
| trucks/trailers parked at an active stage | **does not exist** | **[PROPOSAL] Class A — a placement, not a journey** |
| construction scaffolding on a build site | placement/construction state | **[CODE] shipped** (`tier:placement-sites`) |
| **wrap** (shooting → post) releasing a stage | **does not exist** — no wrap transition [DOC brief, PF1 §9/§10 routing] | **[PROPOSAL] Class A once C2 adds wrap** |

**CLASS B — WITNESSED TIME.** Only truthful as an acknowledgement of a week the player
personally advanced. Must inherit the `StudioLotScreen.tsx:4382-4406` gate, must settle
onto Class A truth, must be skippable and reduced-motion-instant.

| element | today | Time Model coupling |
|---|---|---|
| the commute (walk from home to site) | **[CODE] shipped**, 9 beats / 10.35 s | **HARD** — the whole beat window is a per-week presentation budget |
| arrival at a stage as shooting begins | **[CODE] shipped** as the same commute | **HARD** |
| the scenery crate sweeping yard → stage dock | **[CODE] shipped**, one-shot cosmetic (`TycoonScene.ts:2961-2972`, `:2975-2986`) | **HARD** |
| crew walking a set-strike at wrap | does not exist | **HARD** |
| a queued company *entering* when a stage frees | does not exist | **HARD**, and see the trap below |

**CLASS C — ILLEGAL TODAY, at any time model.** Elements that would require the renderer
to own a fact.

- Anything whose *duration on screen* determines an outcome (law 2).
- Anything animated across a `advanceToNextEvent` batch (law 3).
- A person shown moving between two sites **within** one week — the engine's week
  decomposition allows exactly **one** `travel` beat and **one** claimed site per person
  (`presence.ts:264-275`, `:222-231`). A second commute in one week is a renderer-invented
  fact.
- A named worker at a facility the engine has not reserved
  (`presence.ts:194-215` returns null; law 12).

### 2.3 The coupling to the Time Model docket (LANE 8's decision — flagged, not decided)

I am flagging four couplings. **I do not resolve any of them.**

**C-1 — The beat budget is a fixed 10-beat week, and it is presentation law, not engine
law.** `BEATS_PER_WEEK = 10` (`presence.ts:58`) with exactly one `travel` beat. If lane 8
rules for **(B) Living Turn**, the natural theater consequence is more beats and more
than one site-claim per week — but *every* number in `presence.ts:52-62` is documented as
*"frozen presentation law… so a renderer can rely on it"*, and `presenceLines.ts` +
`playback.ts` + `TycoonScene.ts` all read it. Changing it is a three-surface change.

**C-2 — The static beat is a chosen instant.** `LOT_PRESENCE_STATIC_BEAT = 5`
(`StudioLotSnapshot.ts:504`). Under a Living Turn where the player scrubs *within* a
week, "the settled frame" stops being a single instant and the canvas/DOM agreement
guarantee (`presenceLines.ts:149-154`) has to be re-derived.

**C-3 — The recorded beat-9 contradiction is unresolved and will resurface.**
`playback.ts:8-22`. Any time model that lets a player sit inside a week must decide what
the world looks like at beat 9.

**C-4 — "Layout visibly affects cost/schedule" is in the C2 scope sentence and it moves
travel from presentation to LAW.** [DOC] `THE-MOVIES-PARITY-MASTER-PLAN.md:283-296`
(C2 scope: *"…crew and talent availability, lot travel"*) and `:353-359` (headline
acceptance: *"layout visibly affects cost/schedule"*). [CORPUS] the original did exactly
this — Bible `:209` (*"layout efficiency (travel distance between Casting Office, Script
Office, and Sets) materially affects production speed and cost"*) and `:1070`
(*"long travel distance… 'extend[s] the production time of your movie, delaying its
completion and adding to the movie's cost'"* [OFFICIAL manual pp.15, 21, 37]).
**The moment distance affects a number, the authored `PRESENCE_ROUTES` table stops being
presentation and becomes a source of truth** — and law 1 says the engine must own it.
That is a Time Model / engine-architecture decision, not a renderer decision. **Lane 8
and the architect must rule on it before any theater work is scoped.**

### 2.4 The honest ceiling on "multiple movies" today

**[CODE]** With `MAX_CONCURRENT_PRODUCTIONS: 2` (`tuning.ts:50`) and two soundstages of
capacity 1 each (`src/core/operations.ts:30-31`), the maximum the theater can *truthfully*
depict is **two companies of 5–6 people on two stages**. There is no third stage, no
buildable soundstage blueprint (§4.4), and `set-scenery` capacity is 2 at one Scenery Shop
(`operations.ts:29`).

**[CODE]** The queue that owner law 2 demands ("QUEUE, DON'T MAGICALLY FORBID") is today
split into two *incompatible* halves:

- greenlight above the cap **throws** — `actions.ts:333-337` *"greenlight rejected —
  activeProductions at capacity (2/2)"*. That is the magic forbid.
- a *greenlit* production that cannot get a facility gets a `facility-capacity` blocker
  (`src/core/types.ts:562-567`) that names **only** `{capability, targetPhase}` — no
  facility, no position, no ETA, no waiter list.

**Therefore the physical queue C2 needs does not yet have engine state to project.** This
is the single largest engine-side prerequisite for lane 7's deliverable, and it is
recorded honestly in `presence.ts:26-33` truth gap 1.

---

## 3. Renderer / art constraints

### 3.1 Law 25 structural pins — the current live tuples

**[CODE]** `docs/SHIFT-OPERATIONAL-LAWS.md:63-76` (law 25) and the authoritative table in
`ui/playwright.config.ts:60-135`. Format: **displayObjects / dynamicActors / decodedBytes / drawCalls**.

**PLATE world (5178, retained rollback), re-measured at HEAD 2026-08-17:**

| fixture | objects / actors |
|---|---|
| commission-workspace managed idle (6 contracts, 0 pictures) | 42 / 19 |
| operational-annex script Working (8 contracts, 0 pictures) | 46 / 21 |
| governed Week-30 blocked (15 contracts, 1 picture) | 62 / 29 |
| …with a Gate visitor selected | 63 / 30 |
| greenlight two-picture formation (15 contracts, 2 pictures) | 64 / 30 |

Decoded bytes **11,096,896** and **1 draw call** in every plate row.

**GRID world (5179, shipped default), re-pinned at C1-M6:**

| fixture | tuple |
|---|---|
| build-mode "grid managed-idle", Week 0 | **231 / 14 / 8,806,568 / 6** |
| presence "grid presence", Week 0 | **231 / 14 / 8,807,528 / 6** |
| presence "grid presence greenlit", Week 0 and 1 | **231 / 14 / 8,807,528 / 6** |

**[CODE]** The historical figures 30/13, 34/15, 42/19, 54/25 quoted in
`SHIFT-OPERATIONAL-LAWS.md:65-76` are explicitly labelled **pre-M1.5 history**; 173/174
are pre-warmth history; the frozen 30/13/11,096,896/1 in
`ui/e2e/audition-planning-current-break-audit.spec.ts:144-242` is a `testIgnore`d
historical audit and is not re-measured.

**Three facts a C2 implementer must internalise:**

1. **[CODE]** Grid dynamic actors are **14 in every row, before and after the warmth
   pass, and identical across a whole Week-0 → Week-1 playback** — *"presence itself adds
   no object and no actor — it MOVES existing bodies"* (`ui/playwright.config.ts:120-125`).
   The 14 are 8 ambient patrols + 6 people. **Moving existing bodies is free. New bodies
   are not.**
2. **[CODE]** Draw calls are 6 because *"the counter sums the multi-texture pipeline's
   batch entries, and a new entry opens when its texture-unit set is exhausted"*
   (`ui/playwright.config.ts:110-113`). New textures can silently cost a draw.
3. **[CODE]** A shared-snapshot change moves BOTH worlds (`ui/playwright.config.ts:59-64`).

### 3.2 Law 27a — the Soundstage-12 adjacent-plate NO-GO, read exactly

**[DOC]** `docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-NO-GO.md`.

**What actually failed** (NO-GO §"Gate disposition", lines 222-236): the candidate
building PASSED premium 1948 soundstage identity, camera/light/materials/density/human
scale, no-baked-text, distinctness from Stage 7 and legacy Stage B, and open production
apron. It **FAILED** exactly two gates: *"Same-world road, curb, ground, sightline, and
mountain continuity"* and *"Manual pan without hard postcard seam."* Connector geometry
was **NOT ESTABLISHED** and the runtime texture/display-object/frame budget was
**NOT ENTERED** — runtime integration was prohibited before it was ever measured.

**Why it failed** (NO-GO lines 209-218): both draw orders were tested at Candidate-B
world origins x = 1400/1450/1500/1540. *"They fail because the visible world discontinuity
is inside the pixels, not because of a missing rectangle. Moving a rectangular seam only
changes which accepted or candidate pixels are hidden. An irregular hard mask cannot
create the absent road, curb, building, shadow, and horizon correspondence from the
retained pixels. A soft blend would be a prohibited fade."*

**What it forbids, precisely** (NO-GO lines 24-26, 244-248; law 27a at
`SHIFT-OPERATIONAL-LAWS.md:84-87`):

- **Forbidden:** butting a new authored plate against the Stage 7 painting; a third
  generation on that cell; a fade, blank curtain, detached camera postcard, or relabelling
  a background building; any runtime integration of Candidates A/B.
- **NOT forbidden, stated by the document itself** (NO-GO lines 244-248): *"The failure
  closes this one-cell attempt, not the product goal of a physical second soundstage. A
  future attempt requires separately frozen visual authority — such as a co-authored
  multi-cell campus extension or a source pipeline capable of solving both sides of the
  join together."*

**The load-bearing scope observation for C2 [CODE]:** the NO-GO is a constraint on the
**plate world's world-cell composition**. The shipped default world is the **grid**, whose
buildings are independent isometric sprites on a 28×26 tile field with **no plate seams at
all** (`ui/src/lot/tycoon/world.ts:44-45`, `assets.ts:1-22`). *A player-placed soundstage
in the grid world does not touch law 27a.* It would, however, still be governed by law
27b: **[CODE]** `SHIFT-OPERATIONAL-LAWS.md:87-89` — `district-manifest` authored source
diverges from accepted runtime, **consumption-only freeze, NEVER re-run the exporter**.

### 3.3 The authored-art pipeline — what a hero building actually costs

**[DOC]** `docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`. Status: **ACTIVE
STANDARD**, governs *future* authored environment buildings.

**[DOC]** `:11-13` — *"Not an Art Factory, not render automation, not a building
generator, not a Blender orchestration layer, and not an authorization to convert any
building. **Each authored building still needs its own Art Director authorization.**"*

**[DOC]** `:432-457` (§5A, canonical from Stage A onward) — an authored hero building's
source must live in the private `HSpector1/project-studio-art-source` repo with **seven
required artifacts**: the deterministic generator `blend/<building>.py` (*"the primary
artifact — it, not the PNG, is the thing that can be corrected"*), the `.blend`, raw
normal+worn renders, `calib/CAMERA-CONTRACT.json`, `MANIFEST.json`, `PROVENANCE.md`, and a
pushed per-building source commit.

**[DOC]** `:473-491` (§6) — a **ten-item acceptance checklist** per building: camera
contract; family-derived target ratio (§2, never inherited); rig input solved *per finish*;
§3A RGBA export with the command recorded; `rgba-verify --runs 3`; `measure` within
**±0.015** on the shipped asset with the four **per-building** measurement-window inputs
recorded (§4 — lit-face x-range, shadow-face x-range, wall band y-range, luma floor);
distinct-colour figures quoted with definitions; alpha invariants including **identical
clickable mask**; declared registration; **management-camera review first, signage masked,
asked "what kind of building is this?"**.

**[DOC]** `:449-457` records the counter-example that made §5A canonical: *"Stage B is
production-adopted and has **no durable authored source anywhere**… Its art cannot be
re-derived, re-measured or corrected; a change would mean re-authoring it."*

**Honest read for C2:** the authored path is a **per-building, Art-Director-gated,
multi-day pipeline with a private-repo source obligation**. It does **not** scale to "N
player-placed stages". Nobody should plan as if it does.

### 3.4 …but the shipped world does not use that pipeline

**[CODE]** `ui/src/lot/tycoon/assets.ts:1-22`:

> *"Every texture here is generated at runtime from Phaser Graphics: original geometry in
> the warm 1948 palette sampled from the plate… Two authored PNGs already in the repo
> (`/lot/b-stage-a-h2.png`, `/lot/b-stage-b.png`) are used for the soundstages when they
> load; the procedural stage below is the fallback so the property can never end up
> without a stage… Per LL 27(c) this procedural pass serves tycoon READABILITY. It is not,
> and is not claimed to be, premium authored art."*

**[CODE]** `assets.ts:871-894` — `bakeStage(scene, key)` already exists and is already
parameterised by texture key: 4×4 footprint, buff walls, pilasters, barrel roof, elephant
doors on the lit face, sign field. It is called twice at
`assets.ts:1571-1572` for `tw-stage-a` / `tw-stage-b`.

**[CODE]** `assets.ts:776-804` — `bakeBlueprintTexture()` bakes ONE placed-blueprint
texture **the first time the world actually needs it**. Idempotent, deterministic, and
explicitly law-25-aware: *"A studio that has built none of these pays nothing for them:
the founding bake is untouched, so the Week-0 texture figure is exactly what it has always
been (law 25 — a texture that MIGHT be needed later is not a reason to move a
decoded-bytes pin)."* Its `default:` branch returns false and *"A blueprint whose art has
not been authored gets the honest massing block the placement layer already draws — never
another building's body (shift law 12)."*

**[CODE]** `ui/src/lot/tycoon/world.ts:382-391` — `DEFAULT_BLUEPRINT_PRESENTATION` has
`texKey: ''` and the comment *"It is an HONEST default, not a borrowed one."*

**[CODE]** `world.ts:402-423` — five blueprints currently carry baked bodies:
`tw-annex`, `tw-office-2`, `tw-office-3`, `tw-hall`, `tw-craft`. C1-M5's stated reason
(`world.ts:396-401`): *"each of the four new blueprints its own baked body, so a studio's
property reads as a set of buildings the player CHOSE rather than one sprite repeated."*

**Answer to "is there an authored-asset path for N player-placed stages?" — [PROPOSAL]:**

- **Yes, for the shipped grid world**, via the C1-M5 pattern: one `bakeSoundstage()`
  variant per stage *class* (not per instance), registered in `bakeBlueprintTexture`,
  lazily baked, with a documented law-25 re-pin. N *instances* of a class cost **1 sprite
  each and 0 additional bytes**, because textures are keyed by class.
- **No, for the plate world**, and it should not be attempted: law 27a, and the plate is
  the rollback path.
- **[PROPOSAL] Stage CLASSES, not stage instances, is the art unit.** 2–3 classes
  (e.g. Standard / Large / Backlot Exterior) is a bounded, honest art ask. Anything
  per-instance is not.

### 3.5 People art — the hard ceiling nobody has written down

**[CODE]** `ui/src/lot/hollywood/roleAtlas.ts:1-26`: 9 roles × 4 directions = **36
frames**, 384×1152, `ROLE_ATLAS_DECODED_BYTES = 1,769,472`. `ROLE_ATLAS_DIRECTIONS` is
`['south','east','north','west']` — **four static stills per role and nothing else.**

**[CODE]** Source turnarounds exist for exactly those nine roles at
`art/hollywood/people/source/*-turnaround-chroma.png`.

**Consequence [PROPOSAL]:** there are **no walk cycles**. Today's "walking" is a static
sprite sliding along a path with a direction swap (`playback.ts:150-158` →
`TycoonScene.ts:3210-3219`). Any C2 request for "people who look like they are carrying a
flat / pushing a dolly / striking a set" is a **new art axis** (roles × directions ×
frames), not a code change. The existing 9-role atlas is the budget; a 10th role costs a
new atlas row and an atlas re-pin.

### 3.6 The frozen-budget precedent, quoted so C2 does not re-litigate it

**[DOC]** `docs/WORLD-FIRST-OPERATIONAL-ANNEX-WORK-PRESENCE-V1-CONTRACT.md:404-418` — §13
Performance and asset boundary. *"No image, texture, atlas frame, actor, route, display
object, dynamic simulation, or draw loop is authorized… The treatment must reuse existing
display objects. It may not add a texture, atlas frame, actor, route, worker, smoke loop,
vehicle, queue marker, or second renderer draw."* Frozen maxima: draws exactly 1, display
objects exactly 34, dynamic actors exactly 15, decoded bytes exactly 11,096,896.

**[DOC]** Same doc `:418-422` — the governed 1920×1080 wall-clock gates: **average FPS ≥
50, 1%-low FPS ≥ 30, p99 ≤ 33.4 ms, worst sampled raw frame ≤ 33.4 ms** over one fresh
240-frame window. *"No test may relax or smooth those thresholds."* These are the gates
any C2 theater must still pass.

---

## 4. PF1 interplay and the re-pin mechanism

### 4.1 What I could and could not verify

**[DOC — UNVERIFIED IN THIS WORKTREE]** The lane brief states PF1-M2 defines a narrow
"world emphasis" fence (no new tweens/display objects) *explicitly* as "the fence against
C2's reserved simulation theater". **I could not verify this text.** The PF1 charter lives
on `professional-floor-v1-fresh` in `/Users/bruce/The Movies - Professional Floor`, which
my hard rules forbid me from touching, and a repo-wide grep of this worktree for
`"world emphasis"`, `PF1`, and `Professional Floor` returns **only the C2 planning brief
itself**. Recorded as a gap in §7, not resolved.

What I *can* verify is that the fence's shape is not new — the same fence is already
written into two frozen C1-era contracts, and C2 will be opening **both**:

- **[DOC]** company-presence contract `:250-254`: *"V1 may add deterministic selection
  emphasis using existing sprite tint/alpha/scale only. It may not add a company building,
  Place, anchor, route, animation clock, texture, badge asset, worker, or renderer-owned
  result."*
- **[DOC]** annex work-presence contract `:244-248` (quoted in §3.6 above).

### 4.2 What C2's theater actually needs from the renderer

**[PROPOSAL]**, ordered cheapest-first. Each row states what it costs in law-25 terms.

| need | display objects | actors | textures | draws | verdict |
|---|---|---|---|---|---|
| generalise the occupancy caption to placed facilities | 0 | 0 | 0 | 0 | free — `presenceOccupantCounts` already returns `byPlacement` (`tycoon/presence.ts:315`) |
| generalise the queue chevron layer to any site | 0 | 0 | 0 | 0 | free — ONE shared `tier:presence-queue` layer already (`TycoonScene.ts:1270-1275`) |
| generalise stage lamp/status to N stages | 0 | 0 | 0 | 0 | free — `paintStageStatus` is already keyed by id (`:2868`) |
| generalise the scenery load-in cue to N stages | +1 Graphics layer (shared) | 0 | 0 | 0 | cheap — today it is one shared layer hard-wired to Stage 7 anchors (`:2931-2940`) |
| **a queue placard / waiting-count board** | +1–2 per waiting site | 0 | 0 | 0 | see §6 option A |
| **soundstage class art (2–3 classes)** | 0 | 0 | +2–3 baked | **risk +1** | §3.4; lazily baked, re-pin required |
| **set-dressing sprites on a stage apron** | +N per dressed stage | 0 | +K baked | risk | §6 option B |
| **parked trucks/trailers at an active stage** | +1–2 per active stage | 0 | +1 baked | risk | [CORPUS]-faithful, see §5 |
| **crew carrying/striking a set (new animation)** | +N | +N | **new atlas rows** | risk | **expensive** — §3.5. Recommend DEFER |
| **a second commute within one week** | — | — | — | — | **ILLEGAL** today (§2.2 class C) |

### 4.3 The re-pin mechanism — cite C1-M6 and do exactly that

**[DOC]** Law 25 permits re-pins; it does not permit silent ones
(`SHIFT-OPERATIONAL-LAWS.md:63-76`). **[DOC]** The C1-M6 warmth pass is the canonical
worked example — `LOT-CONTENT-EXPANSION-LOG.md:339-344`:

> *"Structural re-pins per law 25 with MEASURED reasons (231/14/8,806,568/6 and the
> presence variants; +57 objects verified by running `backlotDressing()`, byte delta
> identical across two different-seed studios proving world-art-not-people, draws 4→6
> verified in Phaser's batch source)."*

And the three reasons written out beside the constants (`ui/playwright.config.ts:100-113`):
objects 174→231 = +57 authored dressing props, one Image per placement; decoded bytes
+260,848 **identical in two different-seed studios**, which is *what proves it is world
art and not people*; draws 4→6 = twelve more textures exhausting a texture-unit set, *"No
new pass, no new pipeline."*

**[DOC]** `LOT-CONTENT-EXPANSION-LOG.md:91` states the gate as a rule: *"law 25 re-pin
only with named reasons."* And `:591`: *"the structural pins moved exactly once, for the
warmth pass"* across the entire C1 campaign.

**[PROPOSAL] — the C2 re-pin discipline this lane recommends the charter adopt verbatim:**

1. A C2 theater milestone may re-pin **once**, at its own checkpoint, never incrementally.
2. Every moved number carries a **measured** reason in the same three-part form C1-M6
   used: *what changed, how it was verified independently of the suite, and what it proves
   it is NOT* (the two-different-seed byte-delta trick is the strongest instrument in the
   repo — it separates world art from people).
3. **Actors are the tightest number.** Grid actors have been 14 through the warmth pass
   and a whole week playback. Any C2 change that moves actors is a change of *kind*, not
   of degree, and must be argued as such.
4. **Both worlds re-pin together or the change is not shared-snapshot-safe.** The M1.5
   precedent (`ui/playwright.config.ts:59-64`) is the proof.
5. Re-pinning the plate world while the plate is the *rollback* path is legitimate but
   must be stated as such, so a future reader does not think the plate was being developed.

---

## 5. Corpus evidence — what "watching it manufacture movies" meant in the original

All **[CORPUS]**, `/Users/bruce/Desktop/Big Swing Art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`.

- `:577` — *"Staff/Stars visibly walk the paved paths between buildings; **queues
  physically form outside the Staff Office and Stage School for hiring** [OFFICIAL p.11;
  DIRECTLY OBSERVED: Screenshot 2026-08-17 at 11.39.16 AM.png]; **cast/crew visibly walk
  to a Set once a shoot begins** [OFFICIAL p.12]; **parked vehicles (star trailers,
  production trucks/buses) cluster near active soundstages as a passive visual cue of
  ongoing work** [DIRECTLY OBSERVED: Screenshot 2026-08-17 at 11.37.10 AM.png,
  11.38.00 AM.png]."*
- `:568` — construction rendered physically: *"wood scaffolding, red/white hazard tape,
  small numbered tags, and visible Builder NPCs walking to and working the site."*
- `:570` — *"A floating 'Lot Prestige – Repair Level' label with a colored trend arrow
  hovers directly above a set that's damaged/under repair"* [observed: 11.34.52 AM.png red
  down-arrow in disrepair; 11.38.00 AM.png green up-arrow improving].
- `:519` and `:1052` — the Shoot-It gate: *"A built, undamaged, unoccupied Set matching the
  script's genre/requirements. Info bubbles list required sets in **red** if unavailable
  (in disrepair, not yet owned, or **already booked by another production**)."*
- `:1069` — hard blocks include *"required set not owned, in disrepair ('in red'), or
  **already occupied by a concurrent shoot**."*
- `:209`, `:1070` — layout efficiency materially affects production speed and cost
  (see C-4 in §2.3).
- `:211` — *"watching a studio physically grow from a single Staff Office into a full
  backlot is the core tycoon payoff the game is selling."*

**Reading for lane 7 [PROPOSAL]:** the original's theater was overwhelmingly **Class A
state projection** — a red set icon, a repair arrow, parked trucks, a standing hiring
queue. Its only Class B elements were walking and construction. **The corpus does not
argue for more witnessed time. It argues for more legible state.** That is the cheapest
possible reading and it is also the one that survives laws 2–3 untouched.

**[DOC]** Master plan §11 governs the numbers: *"Original numeric values are evidence, not
spec… the shapes (schemas, gating patterns, decay families) are the recoverable truth"*
(brief `:95-98`).

---

## 6. Queue physicality — three options

**Owner law 2:** *"When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID. The player
must know what is waiting, what it needs, what occupies it, and how to relieve the
bottleneck."*

**Engine prerequisite shared by all three options [PROPOSAL].** Every option below needs
the same thing, and none of them can be built without it: the `facility-capacity` blocker
must gain **the identity of what is waited FOR and the identity of what OCCUPIES it**.
Today it carries only `{capability, targetPhase}` (`src/core/types.ts:562-567`), which is
exactly why `presence.ts:26-33` had to downgrade the waiting rule to *"the company waits at
the site it actually holds."* **This is an engine/state decision for the throughput lane,
not a renderer decision — I flag it, I do not design it.** Whatever shape it takes, lane 7
needs it to answer four questions per waiter: *who is waiting, what do they need, who has
it, and when does that end.*

Each option below states its demand on engine state and its demand on art, and each is
scored against the frozen budgets in §3.1/§3.6.

---

### 6.1 OPTION A — "THE CALL BOARD" (cheapest; recommended floor) [PROPOSAL]

**The idea.** The queue lives **at the door of the facility that is full**, as a physical
placard plus the already-shipped people-and-chevrons. A waiting company stands at the
blocked facility's `wait` anchor (not, as today, at the site it happens to hold), under a
board that names the picture, the thing it needs, and what is in the way.

**What the player sees.** Two people and a director standing outside Stage 7 in a line
facing the doors, a chevron on the ground pointing at the doors, and a small board reading
`WAITING · "Devil's Bargain" · needs a soundstage · Stage 7 free in 2 weeks`.

**Engine state demanded.** The blocker must name the blocking facility and a
countdown-derived free-week. Given `productionPhaseForRemainingTicks`
(`src/core/operations.ts:56-77`) the occupying production's remaining shooting ticks are
already derivable, so "free in N weeks" is a projection, not a new clock.

**Art demanded: ZERO new textures.**
- Reuses `presenceQueueSlotOffset` (`world.ts:1043-1051`, `PRESENCE_QUEUE_RANK = 4`, a
  deliberate **line** rather than a knot: *"a queue outside a full building is the one
  thing on this lot that should look like a queue at a glance"* — `world.ts:1037-1042`).
- Reuses the shared `tier:presence-queue` Graphics layer (`TycoonScene.ts:1270-1275`).
- Reuses the existing north-facing stance (`TycoonScene.ts:2751-2753`).
- The board is a Phaser text object of the same family as the existing badge/chip
  (`TycoonScene.ts:2840-2866`).

**Law-25 cost.** +1 text object per *waiting site* (max 2 today). Actors **unchanged**.
Decoded bytes **unchanged**. Draws **unchanged**. This is the only option that plausibly
re-pins nothing but object count.

**Risks.** (i) It relocates people to a site they do **not** hold a reservation for —
which is *only* legal once the blocker names that facility, otherwise it is a
renderer-invented location (law 12). (ii) The board is text, and text disappears at
institution LOD (`world.ts:1091-1094`); the chevrons must carry the read at that zoom.

---

### 6.2 OPTION B — "THE BACKED-UP LOT" (mid; the most *physical* answer) [PROPOSAL]

**The idea.** A waiting production is legible because its **materiel** is physically
stacked where it cannot go. Scenery crates, flats, and a parked truck accumulate on the
apron of the stage the production is queued for; the pile grows one element per week
waited, capped. Wrap visibly clears it.

**What the player sees.** Stage 7's apron gets progressively more cluttered with crates
and a truck that never unloads, while Stage 12 is clean. Two productions queued behind one
stage = a visibly jammed apron. On wrap, the crates move and the apron clears.

**Engine state demanded.** Same blocker identity as option A, **plus** an authoritative
weeks-waited count (a monotonic integer on the workflow, incremented by the tick — not
derived by the renderer, which would be a renderer-owned fact and illegal under law 1).
Ideally also the C2 wrap transition, so "clears on wrap" is an authoritative event rather
than a phase-change guess.

**Art demanded.** 3–5 new baked props (crate stack, flat bundle, cable drum, truck),
following the existing `bakeProps`/`bakeBacklotProps` pattern
(`ui/src/lot/tycoon/assets.ts:958`, `:1264`). All procedural; **no authored pipeline, no
Art Director gate** — this is exactly the C1-M6 backlot-dressing class of work
(`LOT-CONTENT-EXPANSION-LOG.md:327-334`), which is precedent, not novelty.

**Law-25 cost.** Objects +N per waiting site (bounded by the cap). Decoded bytes **+K**
(one bake per prop class, lazily baked per `assets.ts:776-783`). **Draw-call risk: real** —
C1-M6 moved draws 4→6 by exhausting a texture-unit set with twelve new textures
(`ui/playwright.config.ts:110-113`). Budget for a possible +1 draw and measure it in
Phaser's batch source, exactly as C1-M6 did. Actors **unchanged**.

**Why it is the strongest option.** It is [CORPUS]-faithful (Bible `:577` parked vehicles
as *"a passive visual cue of ongoing work"*), it is pure Class A state projection (§2.2 —
no witnessed time, no Time Model coupling), it reads at **every** zoom band because it is
massing rather than text, and it makes the bottleneck's *magnitude* legible, not just its
existence.

**Risks.** (i) Clutter must yield to the placement/build-mode layers or it will fight the
ghost and the construction scaffold (the `yieldDressingToBodies()` precedent at
`TycoonScene.ts:2700-2702` is the mechanism). (ii) It is the option most likely to move a
draw call. (iii) It needs the wrap transition to clear honestly; without wrap, the pile has
no authoritative removal event.

---

### 6.3 OPTION C — "THE QUEUE IS A PLACE" (most expensive; recommend DEFER) [PROPOSAL]

**The idea.** The lot gains an authoritative **holding area** — a marshalling yard where
queued companies physically stand, with rank order, and from which they visibly *move* to
the stage when it frees.

**What the player sees.** A named piece of ground with three companies ranked on it; when
Stage 7 wraps, the head of the queue walks across the lot and takes the stage.

**Engine state demanded.** A real ordered queue with positions (not just a blocker), an
authoritative dequeue event, **and** a legal way to depict a person at two sites in one
week.

**Why I recommend deferring it.** Three independent blockers:

1. **[CODE]** The engine's week decomposition allows exactly **one** claimed site and
   **one** `travel` beat per person (`presence.ts:222-231`, `:264-275`). A company that
   waits *and then arrives* in the same week is not expressible. This is a **Time Model
   dependency**, not a renderer problem (§2.3 C-1).
2. **[DOC]** A holding area is a new physical **Place** with anchors and routes. The
   company-presence contract explicitly forbade exactly that shape — *"a company office,
   callboard building, stage, set, holding area, rehearsal room, Post room, or new
   physical production place"* (`…COMPANY-PRESENCE…CONTRACT.md:386`). C2 may lift it, but
   lifting it should be a deliberate, named charter decision, not a side effect.
3. **[CODE]** It costs new routes: `PRESENCE_ROUTES` is an authored 2×9 table
   (`world.ts:878-997`) and every new place multiplies it. That is authoring work with a
   test obligation (`world.test.ts` asserts every waypoint sits on real circulation and
   crosses no footprint).

**If the architect wants it anyway [PROPOSAL]:** take it **after** lane 8's time-model
ruling, and take it as its own milestone with its own re-pin, never bundled.

---

### 6.4 The ambient-actor ruling C2 cannot avoid [PROPOSAL]

**[CODE]** Eight decorative patrol actors exist (`world.ts:1054-1067`,
`TycoonScene.ts:2457-2482`) and they are **57% of the grid world's 14 dynamic actors**.
Owner law 8 says no decorative screensaver population. Three coherent dispositions:

- **(a) DELETE.** Cleanest against law 8. Costs a law-25 re-pin (actors 14 → 6) and makes
  the lot feel emptier at exactly the moment C2 wants it to feel busier.
- **(b) GROUND THEM.** Make each ambient actor conditional on an authoritative fact — a
  grip patrol exists only while a `set-scenery` reservation is held; security only at the
  gate; publicity only during an active campaign. They then *are* evidence of work and law
  8 is satisfied on its own terms. Costs no new art, moves objects/actors *conditionally*
  (which complicates fixture pinning — every fixture's actor count becomes a function of
  its state).
- **(c) RECLASSIFY.** Declare a small named ambient set legal as "the lot is a workplace"
  atmosphere, written into the C2 charter as an explicit, bounded exception with a cap.

**My recommendation is (b).** It is the only one that makes the world busier *and* more
truthful, it needs zero art, and it converts an existing law-8 violation into a law-8
exemplar. But it is an **owner decision**, and the charter must state which one is chosen
— silence would leave a known violation shipping under a law that names it.

---

## 7. Risks, gaps, and contradictions between sources

**R-1 — CONTRADICTION (loud): the operational-laws planning note says travel/pathfinding
are greenfield; the code says presentation travel is shipped.**
**[DOC]** `docs/SHIFT-OPERATIONAL-LAWS.md:98-99`: *"travel/occupancy/queue/workload/
pathfinding are greenfield (every prior closure asserts they never changed)."*
**[CODE]** `ui/src/lot/tycoon/world.ts:878-997` (authored routes), `playback.ts:132-167`
(walk interpolation), `TycoonScene.ts:3203-3233` (per-frame walk) are all shipped and
pinned. The precise reconciliation — *presentation travel over authored routes is shipped;
pathfinding and distance-affects-outcome are greenfield* — is stated only in the corpus
Bible (`:4092`), not in the laws doc. **The laws doc is stale on this point and should be
corrected by C2, not worked around.**

**R-2 — CONTRADICTION (already known, still open): the operational-laws trailer says
"Current save = V11".** **[DOC]** `SHIFT-OPERATIONAL-LAWS.md:99-101` vs the brief's
baseline *"Save = V13"* (brief `:56`). The brief notes PF1-M2 corrects the doc. Recorded
because §25's own current-value table is in the same trailer and a reader who distrusts
one may distrust the other.

**R-3 — GAP: I could not verify the PF1-M2 "world emphasis" fence text.** See §4.1. My
hard rules forbid reading the professional-floor worktree or branch, and no copy exists in
this worktree (grep for `PF1` / `world emphasis` / `Professional Floor` returns only the
C2 brief). **Everything I say about the PF1 fence in §4 is reasoning from the brief's
characterisation plus the two frozen C1 contracts that already state the same fence.** The
architect should have someone with legitimate access confirm the exact PF1-M2 wording
before the charter cites it.

**R-4 — RISK: law 8 is currently violated by eight ambient actors.** §6.4. Not a
contradiction between documents — a contradiction between an owner law and shipped code.

**R-5 — RISK: the engine has no queue to project.** §2.4. The `facility-capacity` blocker
names no facility (`src/core/types.ts:562-567`), and greenlight above the cap **throws**
(`actions.ts:333-337`), which is the "magically forbid" owner law 2 rejects. **No
renderer-side queue design can proceed until the throughput lane defines the state.** This
is the top cross-lane dependency for lane 7.

**R-6 — RISK: no `wrap` transition exists.** [DOC brief `:64-66`. Confirmed by absence in
`src/core/operations.ts` — phases are pure functions of `remainingTicks`
(`operations.ts:56-77`), with no discrete shooting→post event. Several theater elements
(clearing crates, releasing a stage, striking a set) have **no authoritative moment to fire
on** until wrap exists.

**R-7 — RISK: the beat-9 contradiction is recorded but unresolved.**
`ui/src/lot/tycoon/playback.ts:8-22`. It will resurface under any time-model change.

**R-8 — RISK: two worlds, one snapshot, two pin families.** §3.1. A C2 theater change made
"in the grid world" will move plate pins if it touches the snapshot. Budget for it.

**R-9 — RISK: the authored-art pipeline does not scale and the charter must say so.**
§3.3. **[DOC]** `AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md:11-13` — each authored building
needs its own Art Director authorization. Planning "buildable stages" as authored hero
buildings would be a capacity error. The grid world's procedural lane is the answer
(§3.4), and it is explicitly *not* premium-art-claiming
(`assets.ts:20-22`, law 27c at `SHIFT-OPERATIONAL-LAWS.md:89-91`).

**R-10 — RISK: no walk cycles exist.** §3.5. Any C2 acceptance criterion phrased as
"crew are seen carrying / building / striking" is a new-art request against a 36-frame
atlas, and should be priced as such or rewritten to Class A.

**R-11 — RISK: the district-manifest exporter must never be re-run.** **[DOC]** law 27b,
`SHIFT-OPERATIONAL-LAWS.md:87-89`. Any plate-world touch is one step from this.

**R-12 — OBSERVATION, not yet a contradiction: the C2 scope sentence promises "layout
visibly affects cost/schedule".** §2.3 C-4. Delivering it converts the renderer's authored
route table into an outcome input, which law 1 says the engine must own. Whether C2 takes
that on is a charter decision with a large blast radius (engine state, save version,
determinism, the whole presence projection). **Flagged, not decided.**

**R-13 — RISK: the grid world has no committed canvas digests.** **[DOC]**
`LOT-CONTENT-EXPANSION-LOG.md:343-345`: *"THE SUITE HAS NO COMMITTED CANVAS DIGESTS —
canvas is pinned structurally and relationally by design."* So a C2 theater change that
looks wrong but counts right will **not** be caught by the suite. Visual review remains a
human gate.

---

## 8. Decisions this lane needs from the architect / owner

1. **Ambient actors** — delete / ground in authoritative work / reclassify with a cap.
   §6.4. This is a law-8 compliance decision and it cannot be left silent.
2. **Queue physicality option** — A (call board), B (backed-up lot), or B-after-A. §6.
   My recommendation: **A as the floor, B as the target**, C deferred behind lane 8.
3. **Does C2 take "layout affects cost/schedule"?** §2.3 C-4, R-12. If yes, travel moves
   from presentation to engine law and lane 8's time model and lane 7's theater are no
   longer separable.
4. **Stage art unit** — confirm **stage CLASSES (2–3), procedurally baked, in the grid
   world only**, not per-instance authored plates. §3.4, R-9.
5. **Re-pin discipline for C2** — adopt the five-point rule in §4.3 (once per milestone,
   measured reasons, actors argued as a change of kind, both worlds together, rollback
   world stated as such).
6. **Confirm the PF1-M2 fence wording** through someone with legitimate access. §4.1, R-3.
7. **Sequence the engine prerequisites** — the blocker identity (R-5) and the wrap
   transition (R-6) both gate lane 7 deliverables and belong to other lanes.

---

## 9. Files read for this lane (all read-only)

Code: `src/core/presence.ts`, `src/core/operations.ts`, `src/core/types.ts`,
`src/core/tuning.ts`, `src/core/actions.ts`, `ui/src/flags.ts`, `ui/playwright.config.ts`,
`ui/src/lot/tycoon/{presence,playback,world,assets,TycoonScene}.ts`,
`ui/src/lot/hollywood/roleAtlas.ts`, `ui/src/lot/scene/productionStageState.ts`,
`ui/src/lot/snapshot/{presenceLines,sceneryLoadIn,StudioLotSnapshot}.ts`,
`ui/src/lot/StudioLotScreen.tsx`, `ui/src/engine/adapter.ts`.

Docs: `docs/SHIFT-OPERATIONAL-LAWS.md`,
`docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-NO-GO.md`,
`docs/WORLD-FIRST-OPERATIONAL-ANNEX-WORK-PRESENCE-V1-CONTRACT.md`,
`docs/WORLD-FIRST-ACTIVE-PRODUCTION-COMPANY-PRESENCE-PICTURE-SWITCHING-V1-CONTRACT.md`,
`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md`,
`docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`,
`THE-MOVIES-PARITY-MASTER-PLAN.md`, `LOT-CONTENT-EXPANSION-LOG.md`.

Corpus: `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`,
`THE-MOVIES-2005-ORIGINAL-DATA/{set_catalog,scene_catalog,facility_catalog}.csv`.

**Not read, deliberately:** anything under `/Users/bruce/The Movies - Professional Floor`
or any `professional-floor-v1*` branch (§4.1, R-3).
