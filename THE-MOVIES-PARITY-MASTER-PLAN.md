# THE MOVIES → PROJECT: STUDIO — PARITY MASTER PLAN

Fable PM / Game Director reconciliation pass · 2026-08-17 · **v1.2**

**v1.2 (2026-08-18): Campaign 1 sealed and promoted (RATIFIED); PF1 inserted and its
charter selected.** Campaign 1 (Lot Content Expansion) sealed KEEP at `f294077` and was
fast-forwarded to canonical `main` this date; the Owner ratified the promotion the same
day (charter §11.5). The Owner also selected this branch's charter as the canonical PF1
charter and retired the parallel planning session (its `professional-floor-v1` branch is
read-only historical evidence, never merged). The Owner's 2026-08-18 launch order inserts **Professional Floor V1
(PF1)** — a short audio/feedback/product-shell bridge campaign — between C1 and C2, reserves
three design items for C2 (Premiere Night V1, the simulation-theater law, the Time Model
Ruling Docket — §8a), and directs that PF1 build no new simulation subsystem. PF1's charter:
`PROFESSIONAL-FLOOR-V1-CHARTER.md` (planning deliverable; implementation awaits Owner
authorization). Sections §7, §8, §8a, and §10 are amended below; all other sections stand
as v1.1 wrote them.
Evidence: `~/Desktop/Big Swing Art/` (Bible v1.0 + Source Register + Comparative Design
Register + Technical Artifact Register + ORIGINAL-DATA + TECHNICAL-ARTIFACTS + the
screenshot corpus, all read; both validators run clean this pass — original data
**74/74 checks passed**, technical artifacts **32/32 passed**, 0 warnings, 0 failures).
Current build: canonical `main` = `first-movie-journey-v1` @ `8464f3d` (tag
`seal/first-movie-journey-v1`), personally played this pass as a fresh studio from
founding through greenlight and into mid-shoot interventions.

**v1.1 (this revision): OWNER AMENDMENT incorporated** — six rulings (player-built
studio migration; hybrid original-faithful interaction law; move/demolish V1 in C1;
expandable property architecture; concurrency-from-capacity principle; declarative
unlock metadata) plus the Star-Life-vs-Economy reorder question, answered in §7.
Amendment reviewed against the current build; no new research performed; no
implementation performed.

**Status: PLAN ONLY. Campaign #1 is NOT authorized and NOT started.** Owner review
required before any implementation.

---

## 1. Current-state executive assessment

I played the promoted build cold, as a new studio (seed `studio-001`), before writing
a word of this plan. The finding, compressed:

**The first film is now excellent; the tenth film does not exist.** The sealed
First Movie Journey delivers a founding → commission → draft → review → auditions →
casting review → package → greenlight → shooting-interventions chain that is legible,
world-native, and honestly deeper than the original's equivalent decisions at every
single step. Camera-test slates carry FIT scores; casting review carries EST ranges
with strengths and concerns; the package workspace shows a Team Direction score with
most-compatible/most-opposed pairs *and a concrete recommendation* ("Replace Lead with
Gary Vasquez: 45 → 53"); the budget step enforces solvency and warns about marketing
overexposure with the exact product law the comparative research asked us to codify
already in shipped copy — "Marketing widens who shows up; it does not change how good
the film is"; the forecast panel shows expected opening/total/critic score with
per-segment expectation bands. The Bible's parity matrix (built against `b58e6f8`,
one campaign stale) still says casting math is "never shown to the player" — that row
is now materially wrong, and several others have moved with it (see §2).

What the build is *not*, and what the evidence package now makes vivid, is a **studio
you build and grow**. The 2005 game's mature lot holds ~40 structures a player chose,
placed, paved, decorated, repaired, and unlocked over decades (I studied the Apr 1956
whole-lot screenshot directly: a dense grid of dozens of path-connected buildings,
pools, a fairground, trailer rows). Our lot is nine fixed buildings, one buildable
blueprint, one vacant parcel, a permanent 1948, no landscaping, no research, no ranks,
no awards, and a stated identity of "a studio you run one film at a time" (up to two).
Every long-horizon system that made the original a *career* — the facility catalog,
Sets, the Laboratory, the Movie Mogul ladder, the ceremony cycle, era progression —
is PARTIAL-thin or MISSING, exactly as the Bible scored, and none of that changed at
the FMJ seal because none of it was that shift's job.

Per **Owner Ruling 1**, the nine fixed buildings are now formally *transitional
architecture, not sacred permanent geography*: the destination is a studio the player
builds from near-nothing. §6 defines the migration.

The machinery to close this is proven: placement/build-mode is real (legality, cost,
countdown, capacity flip), the save format migrates, the engine is deterministic and
heavily gated (226 files / 3,110 vitest; 194/4 Playwright at seal), and the evidence
package now supplies the original's actual catalog, formulas, and unlock architecture
at developer-reviewed confidence. The gap is content and progression poured into
proven systems — not architecture.

Personal screenshot-study verdict worth recording: the original's "building as menu"
is literally a **walls-lowered floorplan** — Staff Office, Casting Office, Stage
School, Laboratory, and Restaurant all render labeled interior rooms as world-scale
click/drop targets (the "radial menu" readings in earlier passes are crops of the same
idiom). Per **Owner Ruling 2**, this idiom is the north star for world-native simple
actions; retained overlays remain valid where complexity earns them (§5).

## 2. Original-vs-current parity matrix (corrected to the sealed build)

The Bible's 35-row matrix (§38) remains the base document; it is one campaign stale.
Rows below are restated only where the FMJ seal or this pass's direct play moved them.
Everything not listed stands exactly as the Bible scored it.

| Category | Bible said | Now (at `8464f3d`) | Movement |
|---|---|---|---|
| Core game loop | PARTIAL — "content thin" | PARTIAL — first-film chain complete, guidance-led, golden-path-proven; content breadth unchanged | Improved (journey), breadth unchanged |
| Casting | PARTIAL — "fit math never shown" | PARTIAL — FIT on slate cards, EST ranges/strengths/concerns in review, structure-aware coaching in package | Materially improved |
| Movie quality/ratings legibility | PARTIAL — "needs verification pass, expose breakdown" | PARTIAL — forecast (opening/total/critic), per-segment bands, Team Direction + named improvement, solvency/overexposure checks all shipped in Package; post-release attribution still thin | Materially improved pre-release; post-release attribution remains the gap |
| Alerts/world feedback | PARTIAL — "inspector-only, no ambient layer" | PARTIAL→GOOD — building signs carry live status lines, red decision badges, guidance marker (one warm pool of light), blocked-sim explanations on Sim button, chained blocker receipts ("Director call required" → "Scenery load-in blocking camera") | Materially improved |
| Tutorial/onboarding | MISSING (non-goal) | PARTIAL — the persistent state-derived guidance layer answers "what do I do now" for the whole first-film loop without being a tutorial; Owner's discoverability FAIL retired by playtest PASS | Improved (deliberately not a tutorial) |
| UI/interaction grammar | DONE | DONE — strengthened (inspector primary verbs, hierarchy reorder, de-strand fixes) | Confirmed |
| Instrumentation/harness | PARTIAL — "figures not re-executed" (OWNER RULING caveat) | RESOLVED — full suites executed repeatedly through FMJ; seal gates rerun by PM on final tree | Caveat closed |
| Buildings | PARTIAL — 1 blueprint | Unchanged (1 blueprint: Development & Casting Annex) | No movement — top gap |
| Sets/locations | MISSING | Unchanged | No movement — top gap |
| Studio rank/progression | MISSING (OWNER RULING) | Unchanged | No movement |
| Awards | MISSING | Unchanged | No movement |
| Era/technology | PARTIAL (static EraConfig) | Unchanged (fixed "Hollywood, 1948") | No movement |
| Landscaping/decoration | MISSING | Unchanged | No movement |
| Studio prestige | PARTIAL (disconnected number) | Unchanged | No movement |
| Economy | PARTIAL (cash-runaway residual) | Unchanged (D-17B residuals open; real opex/capex plumbing present) | No movement |
| Star life-sim / Relationships / Addiction | MISSING (deferred by Owner ruling) | Unchanged | Deferred as ruled |
| Genres | PARTIAL (typing only) | Unchanged mechanically; noted: current vocabulary is six genres (comedy/drama/crime/romance/horror/adventure) vs the original's five — a parity question for the genre campaign | No movement |

New current-state facts confirmed by this pass's play, for the record: founding =
full-screen roster-signing market (3 actors/1 director/1 writer/1 craft; $6M
recruitment fund, $20M operating cash; multi-year contract offers with commitment
math; "Create Custom Applicant" exists); freelancers exist per-film with fees;
concurrency cap two productions; weekly payroll/overhead deducted visibly; Sim to
next event stops with full period receipts.

## 3. Systems Project: Studio already exceeds the original

1. **World-native interaction grammar with no menu ejection** — enforced project-wide
   and now guidance-led end-to-end; the original's own UI language wasn't even
   internally settled (manual "lowered walls" vs observed renderings).
2. **Decision legibility at the moment of decision** — FIT/EST/Team-Direction/
   forecast/solvency/overexposure surfaced *before* commitment. The original showed
   almost none of its 8-factor script model, 9-factor star rating, or 5-stage rating
   pipeline in UI (Prima documents them as simulation-internal; Bible §8.4 flags this
   as the original's own gap). We already beat it; the original's most-cited complaint
   (opaque quality) is structurally answered pre-release.
3. **The talent market and contract economics** — OVR/star-power/age/potential/work
   ethic/percentile/value-per-$M candidates, multi-year offers with guaranteed-money
   math, recruitment fund vs operating cash. The original's walk-in queue showed six
   trait words and genre bars.
4. **Camera, placement machinery, versioned saves, deterministic harness** — as the
   Bible records (tycoon camera; queryPlacement/ghost/countdown/capacity-flip;
   SaveFileV13 with migrations; seeded RNG + massive suite). No 2005 equivalent.
5. **Six-week theatrical release loop** with Newspaper/ReleaseResult/Autopsy —
   a more rigorous release→reviews→decaying-box-office than the original's.
6. **Blocked-state discipline** — every stall names subject + place + problem with a
   one-click in-world remedy and a receipt; the original just let you discover stalls.

## 4. Systems below parity (the design floor we have not reached)

Ranked by how much of the original's identity they carry:

1. **Facility catalog / buildable lot** — original: ~28 costed, gated, multi-tier
   facilities (now fully datasheeted in `facility_catalog.csv` + the recovered engine
   schema). Ours: one blueprint. The core tycoon expansion fantasy is absent — and per
   Owner Ruling 1 the target is stronger than a catalog: the player builds the core
   studio itself.
2. **Sets as a subsystem** — original: ~39+ named sets with hidden Quality, weighted
   genre association (engine-schema-proven), novelty decay across films, decay/repair,
   throughput constraint, rehearsal surface. Ours: two fixed soundstages.
3. **Progression ladder + Awards** — original: two interlocking tracks (competitive
   Studio Rating 24/24/24/14/14; nine ordered Achievement Certificates with facility/
   set rewards; 13 award categories with named 5-year bonuses; Lifetime Honors).
   Ours: continuous Standing numbers, nothing discrete, nothing earned.
4. **Lot Prestige + landscaping** — original: 7-factor weighted score (35/17/14/10/
   10/10/4) with bounding-rectangle attractiveness, ornament overuse limits, star
   multipliers, live localized warnings. Ours: nothing physical; industryPrestige is
   a disconnected scalar.
5. **Era/technology/research** — original: 36 research packs in 4 chained tracks,
   dual-route unlocks (research early OR calendar fallback), 1920→2005 content arc.
   Ours: static 1948.
6. **Star life (deferred by ruling, not forgotten)** — stress/boredom point economy,
   relationship ladder with production-context building (REHEARSE/FILM/CASTING —
   the artifact pass's most elegant finding), addiction/rehab, press/photo events.
   Sequencing re-evaluated in §7 per the Owner's roadmap question.
7. **Concurrent-production bustle** — original: many films at once, auto-fill crew,
   a lot that reads busy. Ours: two max, and the second is roster-gated. Per Owner
   Ruling 5, throughput should ultimately emerge from what the player built.

## 5. Preserve / Modernize / Deepen rulings + the interaction law

The Bible §39 rulings stand; this pass re-affirms them against the sealed build with
these clarifications:

- **PRESERVE**: interaction grammar; tycoon camera; placement machinery; SaveFile
  versioning; six-week release loop; the FMJ guidance layer (now load-bearing);
  seeded determinism and the gate discipline.
- **DEEPEN** (right skeleton, pour content): buildings/catalog; sets; script system
  (office-tier ceilings are the best-documented facility mechanic in the whole
  corpus — writer experience affects speed only, never quality, per Prima, engine-
  corroborated); genres on FORCE_VECTORS; era via EraConfig-over-time; prestige onto
  the physical lot; economy closure on existing opex/capex plumbing.
- **MODERNIZE** (keep the shape, replace the execution): crew quota-gates without
  janitor-dragging; publicity's dual-edged tradeoff (partially verified — the
  overexposure/word-of-mouth cost is in shipped copy; the Star-mood side arrives with
  Star life); relationships as derived-from-work signal (the REHEARSE/FILM/CASTING
  schema finding says the original itself built chemistry during production — our
  co-occurrence approach is *more* faithful than venue-dragging); awards as
  modernized ceremony content inside the progression campaign.
- **CUT (reaffirmed)**: literal stunt/injury second stat-block; standalone wardrobe
  UI; per-worker patrol/needs micromanagement; benefactor/visitor sims; literal
  donor-game weights.
- **OWNER RULING pending**: machinima/Advanced Movie-Maker investment level (still
  the recorded deferred major-parity pillar); sandbox timing.

**THE HYBRID INTERACTION LAW (Owner Ruling 2 — RESOLVED, binding from Campaign 1).**
*World first for simple actions; overlay when complexity earns it; never eject the
player from the studio casually.*

- **World-native is the default for low-dimensional physical actions**: hiring,
  assigning, selecting a facility action, rehearsing, repair, moving/demolishing a
  building, choosing a Set, simple production routing. The original's lowered-wall /
  labeled-room building interaction is the north star — the player should feel they
  are *operating the building*, not launching an unrelated menu. Literal cloning is
  not mandatory; friction-free recognition is the bar.
- **Retained overlays remain valid for genuinely complex decisions**: audition
  analysis, detailed casting comparison, package assembly, budgeting, forecasting,
  deep reports. FMJ proved these work extremely well over the mounted Lot.
- **The former "ratify forms as permanent house style" recommendation is withdrawn.**
  No broad forms-forever declaration is made. Each new surface is classified at
  design time as world-native or complexity-earned-overlay, and the classification is
  recorded in its contract.

Cross-campaign law adopted from the comparative pass (acceptance criteria, not new
campaigns): every major number ships with its drivers and one actionable response
(RCT3-DIAGNOSTICS-001); suitability decomposes (ZT-SUITABILITY-002); amplifiers never
overwrite Movie Quality (ZT-CORE-HIERARCHY-001 — already in copy, keep it invariant);
aggregate warnings drill down to real entities (RCT3-ATTENTION-002).

## 6. Fixed buildings → player-built studio (Owner Ruling 1 migration strategy)

**Product law.** The fantasy is *"I started with almost nothing. I built this
studio."* — not *"I inherited nine permanent buildings and placed upgrades around
them."* Today's nine fixed buildings are transitional architecture. The migration is
staged so the sealed First Movie Journey never breaks along the way.

**Classification of today's nine (BuildingIds verified in
`StudioLotSnapshot.ts` this pass):**

| Building | Verdict | Rationale / timing |
|---|---|---|
| `gate` (Studio Gate) | **PERMANENT LANDMARK** | The entrance is company identity, the hiring/arrival stage, and the original's own gate was fixed non-buildable (corroborated: the recovered `facility_gatehouse.ini` candidate is $0, non-demolishable, non-moveable) |
| `admin` (Administration) | **PERMANENT LANDMARK** | The Staff Office analog — founding, company administration; the original's Staff Office was pre-built at start, never buildable |
| `theater` (Theater) | **LANDMARK (lean)** | Exhibition is the town's, not studio construction; the original never made cinemas buildable (its "Cinema" facility is confirmed dormant/debug content). Final call at the Founding Flip design review — an explicit open decision, not silently settled |
| `writers` (Development) | **CONVERT** → buildable tiered Development Office class | C1 introduces higher tiers as new construction; the base building becomes a founding placement in data now, buildable-from-scratch at the Flip |
| `casting` (Casting/Talent) | **CONVERT** → buildable Casting Office class | Founding placement in C1; buildable at the Flip |
| `stage-a` / `stage-b` (Stages 7/12) | **CONVERT** → buildable Soundstage class | Conversion lands in **Campaign 2** with Sets, where stage construction belongs |
| `post` (Production/Post) | **CONVERT** → buildable Production/Post class | Founding placement in C1; buildable at the Flip |
| `expansion` (Annex) | Already the placed-facility pattern | C1-M1 unifies everything on this exact identity model |

**Minimum starting lot of the eventual mature design:** Studio Gate, Administration/
Staff Office, frontage road + minimal utilities, and vacant parcels inside the
starting property boundary. Everything else — talent facility, script/development
offices, crew facility, casting office, production office, soundstages, Sets, and
later specialized facilities and amenities — is player-built.

**Staging (what happens when):**

- **Campaign 1 — representation conversion + new construction.** One unified
  first-class facility identity covers fixed and placed buildings alike; today's
  nine become **founding placements** in data with their BuildingIds preserved
  verbatim (the exact grandfathering pattern the Annex blueprint already uses —
  `facilityIdBase` carries the V11 identity so migrated saves keep every reservation
  and ledger row). Founding behavior is unchanged: a fresh studio still spawns all
  nine. The *new* catalog families are genuinely player-built, and Move & Demolish V1
  applies to player-built facilities only. **Gate: every sealed FMJ spec passes
  unmodified.**
- **Campaign 2 — buildable core + THE FOUNDING FLIP (capstone milestone).** Sets and
  Soundstages become buildable classes (C2's own subject matter); Development,
  Casting, and Production/Post gain buildable-from-scratch blueprints; then the
  fresh-start experience switches: a brand-new studio begins with Gate + Admin +
  road + vacant parcels, and the journey projection gains construction stages
  upstream of "Commission a screenplay" ("The studio has no development office —
  build one"). Starting cash/costs tuned so the core build-out is the opening act.
  *Contingency:* if C2 runs long, the Flip splits into its own bounded mini-campaign
  between C2 and C3 rather than shipping rushed.
- **Campaign 3 — land acquisition** (§7) completes the arc: build the core, earn the
  right to grow the property.

**How First Movie Journey survives (Owner requirement, engineering answer):**

1. C1 changes representation, not behavior: identical founding spawn, identical
   BuildingIds, identical journey site→building mapping. The FMJ golden-path spec
   and the founded-through-UI audition spec run unmodified as C1 acceptance gates.
2. The journey projection already speaks **semantic sites** (engine never names
   renderer buildings — sealed law 12); extending it upstream with construction
   stages at the Flip adds entries to an existing mapping instead of rewriting one.
3. At the Flip, the golden path *extends* — "bare lot → build core → FIRST FILM
   GREENLIT" — and the pre-Flip fixture (studio founded with buildings, i.e. every
   migrated save) is retained as a permanent regression suite. Migrated saves never
   experience the Flip retroactively; they simply own their founding placements.
4. Move & Demolish V1 excludes founding placements until the Flip, so no sealed
   journey state can have its buildings deleted out from under it in C1.

## 7. Recommended complete campaign sequence (revalidated; v1.1 order)

The prior five-campaign order was proposed against `b58e6f8`. Two things changed at
the seal (FMJ shipped most of "Decision Legibility" where it matters; the evidence
package turned C1–C2 into datasheets), and the Owner amendment changed two more
(migration strategy; Star-Life reorder question). Decision Legibility stays retired
as a standalone campaign; Progression stays third; **Stars Become People +
Relationships V1 moves ahead of Economy Closure** (recommendation below).

1. **Campaign 1 — Lot Content Expansion** (P0, no dependencies): the facility
   catalog on the proven placement engine, unified facility identity including
   founding placements, Move & Demolish V1, expandable-property architecture,
   declarative unlock schema. Fully scoped in §9. **SEALED: KEEP at `f294077`
   (2026-08-18), milestones M1–M8; fast-forwarded to canonical `main` the same date and
   RATIFIED by the Owner (charter §11.5).**

   **→ Inserted next, before Campaign 2 — item 1a. Professional Floor V1 (PF1): Audio,
   Feedback & Product Shell** (bridge campaign, Owner order 2026-08-18; charter:
   `PROFESSIONAL-FLOOR-V1-CHARTER.md`): the professional sensory floor before the next
   content campaign — one audio service + 1948 ambience + era-keyed music registry + UI
   sound families; restrained punctuation for existing authoritative events under the
   standing law **PRESENTATION REACTS TO TRUTH; PRESENTATION NEVER CREATES OR PERSISTS
   GAME TRUTH**; settings (volumes, motion preference), removal of every browser dialog,
   save-presentation cheap wins, a real front door, and the editorial voice (confident
   20th-century Hollywood trade language) established for reuse. **No new simulation
   subsystem — `src/core` untouched. Exactly one short campaign — a bridge into C2,
   never a polish program; no PF2 without fresh Owner authorization.**
2. **Campaign 2 — Sets, Stages & Production Throughput + the Founding Flip** (P0,
   depends on C1): Sets as placeable, decaying, genre-weighted, novelty-carrying,
   script-required entities; **Soundstages become buildable**; the explicit
   concurrency ruling lands here with the first real capacity contention and visible
   queue — under the standing principle (Owner Ruling 5) that throughput emerges
   from what the player built (usable Sets, stages, casting/development capacity,
   crew and talent availability, lot travel); shooting-week theater; **capstone: the
   Founding Flip** (§6). **Reserved additions per Owner order 2026-08-18: Premiere
   Night V1, the simulation-theater law, and the Time Model Ruling Docket (§8a) —
   C2 planning must explicitly own all three; PF1 does not touch them.**
3. **Campaign 3 — Progression, Prestige & Awards + Land Acquisition V1** (P1):
   discrete checklist-gated Studio Rank ladder over existing Standing; Lot Prestige
   reconnected to physical maintenance/decay/ornamentation (landscaping layer lands
   here); Awards as ceremony/evaluation cadence; post-release attribution in Autopsy;
   **and the earned property-expansion mechanic** — successful studios acquire
   adjacent land (candidate gates: cash purchase, Studio Rank, Prestige, Achievement
   Certificate, or combinations; exact tuning decided in C3 planning). This is where
   "become physically bigger" belongs, with progression context to earn it.
4. **Campaign 4 — Genre Depth, Research & the Opening of Time** (P1): genre depth on
   FORCE_VECTORS with bounded audience-taste movement (Owner decision, §10),
   Laboratory/research as the unlock engine using the proven dual-route pattern
   (research early OR calendar fallback), EraConfig begins to vary.
5. **Campaign 5 — Stars Become People + Relationships V1** (one bounded campaign —
   recommendation below): Star-tier stress/mood/limits with automated consequences
   (never per-second babysitting), plus relationships/chemistry as a derived signal
   with production-context accrual (CASTING/REHEARSE/FILM). Amenity-tier facilities
   (trailers, canteen) join the catalog here, where their effects finally exist.
6. **Campaign 6 — Economy Closure** (P1/P2): close cash-runaway/top-studio
   immortality against the real capex/opex of a fully populated studio — catalog,
   sets, land, landscaping, star salaries and amenities all existing first (D-17B
   charter); remeasure week-208 at true scale.
7. **Campaign 7 — Addiction/Rehab deepening** (modern, bounded dark-Hollywood
   flavor, sequenced after Star life per standing ruling).
8. **Campaign 8 — Sandbox.**
9. **Campaign 9 — Machinima / Advanced Movie-Maker** — only after its dedicated
   Owner scope ruling.

**PM recommendation — Star Life/Relationships ahead of Economy Closure (Owner
roadmap question): YES, adopt the order above.**

- *One campaign, not two.* Stress/mood and relationships share the same substrate —
  a bounded per-Star state layer over people the engine already treats as first-class
  individuals. Splitting them builds that layer twice; together, mood consequences
  and derived chemistry reinforce one another (a fraying co-star pair is both a
  mood story and a chemistry number).
- *The evidence argues for it.* The recovered engine schema shows the original built
  relationships during CASTING/REHEARSE/FILM — during the work itself, not only at
  bars. After C2 the work is physical (companies on stages and sets) and after C3/C4
  careers have stakes (ranks, awards, genre identity). Deriving chemistry from that
  visible shared work is the modernization the standing ruling asked for, with zero
  manual-socialization grind.
- *Economy Closure gets more meaningful later, not less.* Closure is calibration.
  Calibrating before star salaries, amenity opex, land purchases, and landscaping
  exist means recalibrating again after. D-17B's own language says instrument the
  authoritative facility/capacity/construction systems first — after C5, they all
  exist. No dependency was found that requires closure earlier.
- *Risk, honestly stated:* the cash-runaway residual persists through five campaigns
  of long-horizon playtesting and can distort tuning judgments. Mitigation: the
  per-campaign economy snapshots (C1-M6 onward) keep a measured record; C3's land
  and landscaping purchases add natural sinks that partially self-correct before
  formal closure; any campaign may take a bounded interim guard (e.g. visible
  runaway instrumentation) without invoking full closure.

## 8. Exact next three campaigns

1. **Professional Floor V1** — charter: `PROFESSIONAL-FLOOR-V1-CHARTER.md`. Headline
   acceptance (the Owner's four tests): a fresh studio sounds like a place that exists
   within 60 untouched seconds; 30 minutes of natural play acknowledges success,
   communicates refusal, rewards commitment and completion, and shows zero
   developer-tool UX; five minutes of UI and sound reads as "this is a game"; and a
   scripted parity run proves authoritative outcomes byte-identical with presentation
   on or off.
2. **Sets, Stages & Production Throughput + Founding Flip** — headline acceptance:
   a player builds a chosen stage and set, a script requires the set by name, a
   blocked set flags red with the reason, layout visibly affects cost/schedule, two
   productions contend for one desirable set, and — at the capstone — a brand-new
   studio starts from Gate + Admin and builds its own core. Requires the concurrency
   ruling (Owner decision, §10). **C2 planning additionally owns, by Owner order
   2026-08-18:**
   - **Premiere Night V1** — movie release staged as one of the game's largest events,
     in the world, as presentation of the existing authoritative release result only.
   - **The simulation-theater law** — visible world activity preferentially follows
     real authoritative work, never decorative screensaver motion.
   - **The Time Model Ruling Docket** (§8a).
   - *(PM recommendation from PF1 recon, not yet Owner-ruled):* the **event-model
     docket** — the engine currently emits no events (the UI diffs state); C2, which
     mints many new transitions, is where an authoritative event/observation model
     should be designed once, next to its consumers.
   - The **"principal photography wraps" beat** (deferred from PF1: no authoritative
     wrap transition exists today).
3. **Progression, Prestige & Awards + Land Acquisition V1** — headline acceptance:
   a fresh player can name their current rank, see the checklist to the next one,
   watch prestige move when the lot decays or gets dressed, read a ceremony verdict
   that follows from legible numbers, and — once earned — buy the adjacent parcel
   and build on it. Carries the **"first profitable picture" beat** (deferred from
   PF1: needs a cumulative-profit derivation and a projected-vs-final honesty ruling).

## 8a. Time Model Ruling Docket (C2 planning — Owner-ordered 2026-08-18)

Real-time simulation is **not** implemented in PF1, and is not to be bolted onto the weekly
deterministic engine merely because the genre commonly has it. The open questions are
simulation-design decisions, not presentation details: what an action at "week 12.4" means;
when money accrues; when RNG draws happen; whether time runs while decision UI is open;
whether a player can miss a decision; whether a blocker pauses time; whether actions execute
immediately or queue to a boundary.

C2 planning must compare, explicitly and in writing:

- **A. The current discrete event/week model** — the shipped baseline; receipts-and-stops
  semantics preserved.
- **B. A living-turn model** — the world remains visually and audibly alive while
  authoritative progress advances through discrete deterministic boundaries.
- **C. Finer-grained continuous simulation** — pause/speed controls with explicit semantics
  for mid-period actions.

The docket's output is a recommendation returned to the Owner at C2 planning; the Owner
rules. **Owner ruling 2026-08-18: Model B (living turn) is the preferred model to
investigate FIRST — a starting hypothesis, not a ruling; the comparison remains genuine
and evidence may defeat B.**

## 9. Campaign #1 — LOT CONTENT EXPANSION ("a studio you actually build")

**Objective.** Convert the fixed nine-building diorama plus one blueprint into the
*foundation* of a player-built studio: a real facility catalog on proven placement
machinery, one unified first-class identity for every building (fixed and placed
alike), the ability to move and demolish what you built, and an architecture that
already accommodates property growth and future declarative unlock gates — while the
sealed First Movie Journey keeps working unmodified.

**Player fantasy.** "I chose these buildings. My studio looks like my decisions —
and I can rearrange it when I've made better ones." The original's core expansion
loop: open the catalog, weigh cost against effect, place the ghost, watch
construction, get a building that changes what your studio can do.

**Original reference mechanics** (evidence, not spec): 28-facility costed catalog
(`facility_catalog.csv`); tiered Script Offices with hard quality ceilings ($6,000/1★
→ $66,666/4★; writer experience = speed only — Prima, engine-corroborated); unified
engine blueprint schema (purchasecost/annualcost, maxinstances, **requires as a
numbered list of typed requirement entries** — date and prerequisite-facility kinds
directly observed — availableindebt on exactly the core-loop facilities); N-Owned
counters and photographic-thumbnail catalog browsing (directly observed);
**depreciated demolition refunds** (Prima + 2 independent GameFAQs sources confirm
selling/demolishing recoups a depreciated portion, never full, never zero); negative
base attractiveness on facilities (buildings cost beauty; landscaping pays it back —
noted for C3).

**Modern design.**
- **Unified facility identity (Ruling 1 enabler).** One identity model for all
  buildings; today's nine become founding placements (verbatim IDs — §6); position
  is state, not identity (a facility keeps its ID when moved). This is both the
  migration foundation and the precondition for Move & Demolish.
- Catalog families, each with a real effect on day one (product rule: **no
  decorative blueprints** — every entry moves a number the player can already see):
  - *Development tiers* (2 entries above the current baseline): raise the screenplay
    EST ceiling band — the original's office-tier mechanic, our vocabulary. Visible
    in the commission form and review EST.
  - *Casting/Development capacity* (existing Annex stays; possibly a second-tier
    variant): +shared slots (already-proven pattern).
  - *Crew & Scenery expansion*: reduces shooting-week scenery/blocker friction or
    freelancer craft fees — ties into the existing intervention loop.
  - *Theater/Administration upgrades*: release-terms or campaign-tier effects
    (bounded; reuse existing publicity/release levers, no new economy law).
  - *Explicitly NOT in C1*: soundstages and Sets (C2, per §6); trailers/canteen/
    amenity tier (C5, where their effects exist); Rehab (C7); Laboratory (C4);
    ornaments/landscaping (C3).
- **Move & Demolish V1 (Ruling 3).** Scope: player-built facilities only; founding
  placements and landmarks excluded until the Flip. Deterministic and save-safe;
  demolition returns a **depreciated refund** (named TUNING constants; build+demolish
  cycles strictly lossy by construction — no refund farming); a facility holding
  active reservations or authoritative work cannot be moved/demolished unless the
  operation is safely permitted, and refusal states the reason in the standing
  blocked-state grammar ("Stage 7 is reserved by A SEASON OF ARCHIPELAGO —
  Shooting"); movement preserves identity, reservations, and ledger history.
  Interaction is world-native per the hybrid law: select the building in the world,
  act on it in place (move = re-enter the existing ghost-placement flow with the
  same legality preview; demolish = in-world confirm with the refund quoted).
  **Explicitly excluded:** demolition debris, janitor cleanup, construction
  accidents, or any upkeep theater — room is preserved for those systems later.
- **Declarative unlock metadata (Ruling 6).** The blueprint schema ships with a
  typed `requires` list supporting: minimum Studio Rank, Achievement Certificate,
  Award, research completion, era/date, prerequisite facility, land/property
  availability. **C1 activates cash-availability only** (plus at most
  prerequisite-facility if a tier chain wants it); C3/C4 activate rank/award/
  research gates by data/content change, and the catalog UI already knows how to
  render a locked entry with its named reason.
- **Expandable-property architecture (Ruling 4).** C1 removes every "eight parcels
  forever" assumption: parcels are data, not enums; placement queries take the
  property definition as input; world bounds derive from property state (today's
  28×26 becomes the *starting* property, not a constant baked into logic);
  snapshot/renderer iterate dynamic building sets; facility count is unbounded by
  type. The mature target — dozens of structures across acquired zones — must be
  reachable by data/content change. The land-acquisition *mechanic* is C3; C1 ships
  no player-facing land purchase.
- Pricing/opex rebalanced for our economy; original prices are reference flavor
  (the repdigit house style — $11,111/$44,444/$77,777 — is worth keeping as tone).
- Concurrency: C1 hard-codes nothing new around the two-production limit; the cap
  stays a single named config the C2 capacity model will subsume (Ruling 5).

**Engine requirements.** Unified facility identity (stable BuildingId for placed
facilities, founding-placement conversion, inspector/presence/receipt parity —
closes the tycoon handoff's #1 target); FACILITY_BLUEPRINTS widened (~6–9 entries)
with effect hooks (EST ceiling term, slot math, intervention friction) and the typed
`requires` schema; move/demolish actions with reservation guards and depreciated
refund ledger entries; property model refactor (parcels/bounds as state).

**World/renderer requirements.** Distinct sprites per family (art constraint);
placed buildings join snapshot/labels/attention; move/demolish world affordances on
the selected building; construction sites already render. Fold the deferred
**visual warmth pass** in here as a milestone (ochre shift, back-lot dressing) with
art review — this campaign is where the lot starts being looked at.

**UI grammar (per the hybrid law).** Placement, movement, demolition, and facility
actions are world-native. The Build Mode catalog remains a docked panel over the
live world (name, cost, weeks, opex, owned-count, one-line effect, locked-reason
rendering — the original's Facilities panel, our styling): browsing a catalog is a
complexity-earned surface; *placing* stays physical. Inspector hierarchy unchanged
(what is this → what's happening → who's here → actions → capacity → deep details).
Guidance card learns at most one new sentence family ("Your development office caps
scripts at ~X — a better office raises the ceiling").

**Content/data needs.** 6–9 blueprint definitions; sprite set per family; copy for
catalog cards, locked reasons, move/demolish confirms; TUNING entries including
refund depreciation (all named constants, no magic numbers).

**Save/schema implications.** SaveFileV13: unified facility identity (founding
placements + placed), catalog entries, typed requires, property definition,
move/demolish ledger events; V12→V13 migration + historical-boundary guards, per the
established pattern. Migrated saves' fixed buildings convert to founding placements
with identities preserved verbatim.

**Economy implications.** Each blueprint adds capex+opex against the $20M start;
demolition refunds are depreciated and ledgered; instrument runway effects (D-17B
residuals stay open; no new sinks invented here — closure is C6's charter).
Milestone M6 includes an economy remeasure snapshot at "fully built-out C1 lot"
scale as evidence for C6.

**Required screenshots/reference frames** (from the corpus, for the implementers):
`11.59.47 AM` + `12.01.45 PM` (Facilities panel + tooltip idiom), `11.39.30 AM`
(tutorial-era four-facility purchase moment), `12.00.20 PM` (construction
scaffolding), `12.00.04 PM` + `12.00.56 PM` (the original's building-move control:
roof-mounted directional grab inside a hazard-striped boundary — the direct
reference for Move V1's world-native gesture), `11.37.21 AM` (Apr 1956 whole-lot
density — the ten-year target, not the C1 target).

**Executable milestones.**
- **M1 (engine): Unified facility identity + property model.** One first-class
  identity for fixed and placed facilities; the nine become founding placements
  (verbatim IDs); position-as-state; parcels/bounds as data; V13 migration.
  Gate: every sealed FMJ spec passes unmodified; every existing building-interaction
  spec passes against a placed Annex exactly as against founding placements.
- **M2 (engine): Catalog widening + declarative unlock schema + effect hooks.**
  Blueprints with EST-ceiling / slot / friction effects; typed `requires` list
  (cash-only active); bounded-term unit tests per entry.
- **M3 (engine+world): Move & Demolish V1.** Reservation-guarded, depreciated,
  deterministic, world-native, player-built-only; refusal reasons in blocked-state
  grammar.
- **M4 (UI/world): Catalog UX + sprites + inspectors.** Docked catalog with
  locked-reason rendering; distinct visual identity; N-owned; ghost/quote flow
  unchanged; move/demolish affordances.
- **M5 (world): Visual warmth pass** (ochre shift, back-lot dressing, sprite
  variants) with art review — the standing deferred target, now in scope.
- **M6 (proof): Golden path + expandability + economy snapshot.** New e2e: fresh
  studio → build Development Office II → commission at it → ceiling visibly
  different → move a built facility → demolish one (refund correct) → second
  picture planned in the same session (regression-guarding the FMJ planner fix).
  **Expandability fixture proof:** a second buildable zone added purely by
  data/content change renders, accepts placement, and round-trips saves — no
  renderer or placement rearchitecture. Economy remeasure recorded.
- **M7 (seal): PM playtest, red-team, closure records, handoff.**

**Test gates.** Both tsc clean; full vitest (no deleted/weakened tests — standing
law); Playwright FULL on both origins, serialized (contended runs are invalid —
recorded FMJ lesson); structural tuple re-pins with named reasons (law 25);
determinism/save round-trip suites extended to placed, moved, and demolished
buildings; V12→V13 migration suite including founding-placement conversion.

**Red-team targets.** Placement legality abuse (overlap/out-of-parcel/insufficient
cash mid-quote); **move/demolish exploitation** (refund farming — must be strictly
lossy; demolish-during-construction; move-mid-tick; move/demolish under active
reservations; orphaned presence/journey references after demolition); save
round-trip and V12→V13 migration with multiple placed/moved buildings; receipts
fail-closed on malformed identity; strict-context predicates on generated worlds
(the recurring FMJ defect family — any new closed-shape selector must be proven
against duplicate-name and re-entry worlds in a real browser, not only vitest);
guidance/journey interaction with placed and demolished buildings; property-model
regressions at the old fixed bounds.

**Owner playtest script (15 min).** Found fresh studio → read the lot → open the
catalog, reject something as too expensive → build Development Office II →
commission and see the higher ceiling reflected → build one more facility of choice
→ decide the layout is wrong and **move it** → demolish something and read the
refund → advance through a production week → confirm the lot reads as *yours*.
Pass = "I made choices I can see, the numbers moved, and I could fix my mistakes";
fail = "a menu of sprites."

**Explicit non-goals for Campaign 1.** The Founding Flip and any change to founding
spawn (C2 capstone); soundstage/Set construction (C2); concurrency changes (C2,
after the ruling); the land-acquisition mechanic and any player-facing property
purchase (C3); rank/award/research gate *activation* (C3/C4 — schema only in C1);
landscaping/ornaments/prestige (C3); amenity/trailer tier (C5); demolition debris,
cleanup labor, or construction-accident systems (preserved for later); moving/
demolishing founding placements or landmarks; any needs, relationship, era, or
machinima work; any macroeconomy repair beyond instrumentation.

## 10. Owner decisions — resolved by amendment vs still required

**Resolved by the 2026-08-17 Owner Amendment (recorded, binding):**
1. ~~Overlay house style~~ → **Hybrid interaction law** (§5): world-first for simple
   actions, overlays where complexity earns them, no casual ejection, no broad
   forms-forever declaration.
2. ~~Demolition in or out~~ → **IN**: Move & Demolish V1 is C1 scope (§9), bounded,
   world-native, exploit-proof, no debris systems.
3. ~~Lot size~~ → **28×26 is the starting property, not the maximum**: C1 must ship
   expandable-property architecture; the earned land-acquisition mechanic lands in
   C3 with progression context.
4. ~~Unlock philosophy~~ → **cash-only availability in C1 over a declarative
   requirement schema** (rank/certificate/award/research/era/prerequisite/land
   kinds), activated by data in C3/C4.
5. ~~Fixed buildings~~ → **transitional**: migration strategy per §6 (founding
   placements in C1; buildable core + Founding Flip in C2; Gate/Admin permanent;
   Theater leaning landmark).
6. Concurrency **principle** → throughput ultimately emerges from built physical
   capacity; C1 hard-codes nothing around two productions.

**Resolved by the 2026-08-18 Owner launch order (recorded, binding):**
7. **PF1 inserted between C1 and C2** as one short bridge campaign — audio, punctuation,
   product shell; no new simulation subsystem; no PF2 without fresh authorization
   (§7 item 1a; charter `PROFESSIONAL-FLOOR-V1-CHARTER.md`).
8. **PRESENTATION REACTS TO TRUTH; PRESENTATION NEVER CREATES OR PERSISTS GAME TRUTH**
   adopted as standing law (recorded in the operational laws at PF1 implementation).
9. **Premiere Night V1, the simulation-theater law, and the Time Model Ruling Docket**
   reserved to C2's charter (§8/§8a); PF1 must not solve them.
10. **Voice acting deferred** — text register + stings suffice for PF1; recorded voice is
    a later production-value decision.
11. **Editorial voice direction** — confident 20th-century Hollywood trade language,
    restrained humor, period flavor; established in PF1 charter §3, reused by later
    campaigns.

**Resolved by the 2026-08-18 authorization-pass rulings (recorded, binding — charter §11):**
12. **This branch's charter is the canonical PF1 charter**; the parallel session is
    retired, its branch read-only, never merged.
13. **Futures shelf STRUCK from PF1** — `src/core` is never touched to tease future
    systems; anticipation returns at C3/C4 planning.
14. **Model B (living turn) = preferred investigation hypothesis** for the C2 §8a docket,
    not a ruling.
15. **Wrap → C2; first-profit / achievement-style beats → C3; PF1 manufactures no
    substitute events.** Existing authoritative FMJ events receive normal punctuation.
16. **C1 main promotion RATIFIED**; canonical `main` correct at `f294077`.
17. **Save shell: the cheap set is sufficient; no save-slot subsystem in PF1.**
18. **PF1-M4 ends SEAL → STOP FOR OWNER REVIEW**; C2 is the intended next campaign but
    requires its own authorization.

**Still required from the Owner:**
0. **PF1 GO** — rulings are recorded and the commercial red-team is reconciled (charter
   §0.7); implementation begins only on the Owner's explicit GO.
1. **Concurrency/capacity specifics — before C2 freeze** (the explicit ruling Owner
   Ruling 5 assigns to C2): target concurrent-production range at mature build-out,
   and which constraint should bind first (stages, sets, casting/development slots,
   crew, talent).
2. **Founding Flip ratification — at C2 planning**: confirm the Flip as C2's
   capstone (with the split-into-mini-campaign contingency), and make the Theater
   landmark-vs-buildable final call at that design review.
3. **Star-Life-before-Economy reorder — ratify §7's recommendation** (Campaigns 5/6
   as proposed).
4. **Audience-taste movement vs the "cultural drift" non-goal — before C4.**
5. **Genre vocabulary (six current vs five original) — C4 planning.** Flagged so
   nobody "fixes" it casually in C1/C2.
6. **Machinima scope ruling — unchanged, not blocking C1–C6.**
7. **Time model ruling — at C2 planning**, from the §8a docket (A vs B vs C); the PM
   recommends after dependency analysis, the Owner rules.

## 11. Historical uncertainties: blocking vs safe to design around

**Blocking Campaign 1: none.** Every open item in `ACTIVE-UNRESOLVED-QUESTIONS.csv`
(70 rows) was checked against this scope; original numeric values are evidence, not
spec, and we rebalance regardless. The catalog's *shape* (tiers, gating patterns,
effect classes, move/demolish-with-depreciation, requirement-list schema) is settled
at developer-reviewed or engine-schema confidence.

**Safe to design around (named, with the campaign they touch):**
- Intermediate Script Office cost $29k-vs-$33k (Q004) — flavor only; we price our own
  tiers. (C1)
- Exact original depreciation curve for demolition refunds — never documented beyond
  "a depreciated portion"; we set our own named constants. (C1)
- Movie Quality vs Success exact ratio (Q065) and the marketing-"raises the rating"
  ambiguity (Q011) — we define our own explicit split, already consistent with
  Prima's "quality outweighs success" and our shipped amplifier law. (C3 awards
  fairness, C6)
- Restaurant/Restroom capacity units 9-vs-180 / 1-5-2-vs-10-50-20 (Q007/Q008) —
  matters only when the amenity tier lands. (C5)
- Achievement-ladder order three-way contradiction (Q001) and Greenhorn 9-vs-10
  (Q002) — we design our own ladder; requirement *content* is cross-confirmed. (C3)
- Ceremony-continuation-past-2005, sandbox year bounds, capital-curve ceiling
  $1.6M-vs-$5M — our timeline and economy differ by design. (C3/C4/C6)
- Aging/decay of Looks-Physique before retirement (Q020, HIGH priority in the
  dataset) — flag to Campaign 5 planning.
- Everything Stunts & Effects-specific — CUT territory; no research needed.

---

*v1.1 — Owner Amendment incorporated, reviewed against the live build, and stopped
without implementation, per the mission's hard stop. Campaign 1 awaits Owner
authorization.*

*v1.2 — Campaign 1 sealed KEEP and fast-forwarded to canonical `main` (RATIFIED); PF1
inserted, chartered, its charter selected as canonical with Owner rulings applied, and
the commercial red-team reconciled; C2 reservations recorded; stopped without
implementation. PF1 awaits the Owner's explicit GO.*
