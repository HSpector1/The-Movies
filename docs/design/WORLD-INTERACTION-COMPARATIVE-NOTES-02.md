# WORLD-INTERACTION COMPARATIVE NOTES 02 — operating the studio from the lot

**Status:** decision-ready design research. No implementation authority. Proposes **interaction surface only** — no simulation rule, legality, economy, RNG, or time-model change.

**Builds on (not repeated here):** `CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md` (branch `codex/world-first-interaction-research-01`) — The Movies onboarding reconstruction, the 12-point interaction doctrine, the world-interaction map, the hiring redesign, the CP9 recommendation. And `PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md` — approved patterns `RCT3-DIAGNOSTICS-001`, `RCT3-ATTENTION-002`, `ZT-CORE-HIERARCHY-001`, `ZT-SUITABILITY-002`, `ZT-RESEARCH-003`, `RCT3-OPERATIONS-003`, `RCT3-MIXMASTER-004`.

**Evidence classes:** `[V]` = a cited source states it. `[I]` = my inference, labelled. `[R]` = read directly from this repository at `de32b41` / Unity client `3003081` — the strongest class here, and the reason §0 exists.

---

## 0. The finding that changes the shape of the answer

Before any comparative lesson: **Project: Studio has already solved this problem once, in the browser client, and the Unity client has not adopted it.** `[R]`

The Owner's "box on the left" is `WorkflowPanelRect()` — `StudioBridgeClient.cs:1493`, `new Rect(18f, 18f, ≤400f, screen-36f)`. It renders the journey prose block (`headline` / `whatHappened` / `whyItMatters` / `detail`), then `NEXT STEPS`, then **every** entry in `availableIntents` as a stacked button, then Save/Load, then a stats line. `[R]`

CP9 already proved the extraction move on this exact panel: `StudioBridgeClient.cs:1267` — `if (PlayerIsFoundingOption(option)) continue;` with the comment *"founding actions belong to the world — the gate applicants and Administration — never to memo buttons."* `[R]` The memo did not need to be redesigned. **One class of intent was removed from it and given a world anchor.** That is the whole CP10 move, applied to the next class.

Meanwhile, `ui/src/lot/buildingInspector.ts` (1,152 lines) is a finished, tested, world-first building panel with: engine-published verbs on the building, a three-state verb law, an honesty note where a verb is withheld, a fixed reading order, a located-production command, and a single explicit ghost route to a deep screen. `[R]` Its own header records the history: *"M1.5 removes the last world-first violation: a physical building click used to fall through to `dispatchRoute(BUILDING_ACTION[id])`, ejecting the player out of the world… M-B adds the missing middle of that panel: the VERBS. A cold player could reach neither Commission nor Plan-auditions from the buildings."* `[R]`

So this memo's comparative work has a specific job: **not to invent a grammar, but to confirm, sharpen, and stress-test the one the project already owns — and to say precisely which slice of it the Unity client should adopt next.**

---

## 1. Per-game findings

### A. THE SIMS (1 / 2 / 3 / 4)

**The interaction grammar.** Left-click an object or another Sim → a **pie menu** of verbs opens at the cursor, generated per-target. Nested slices open sub-pies. `[V, HIGH]` The menu is not authored per object by hand: objects **advertise** their verbs to Sim AI (utility-based selection), and the pie slices are those advertised verbs surfaced to the player — *"it was natural for the verbs to be arranged in a radial menu about objects."* `[V, MED]`
– https://en.wikipedia.org/wiki/Pie_menu · https://donhopkins.medium.com/pie-menus-936fed383ff1

**Queue.** Chosen verbs stack into an **action queue** rendered as small icons near the Sim's portrait; roughly 8 max; click a queued icon to cancel it. `[V, MED — wiki is a stub]` — https://sims.fandom.com/wiki/Action_queue

**Three separate state channels — the single most transferable Sims idea.** `[V, HIGH]`
1. **Needs/motives = panel, quantitative, opt-in.** Bars in a tabbed panel (Sims 2 "Universal Control Panel"; Sims 4 bottom-right tab). Green→red. https://strategywiki.org/wiki/The_Sims_2/Needs · https://www.gamepressure.com/thesims4/needs/z468cc
2. **Thought balloons = momentary intent.** An object/action icon, not a bar. Sims 4 ships 205 distinct thought/speech bubble icons. https://simscommunity.info/2014/10/10/sims-4-205-thoughtspeech-bubble-icons/
3. **Plumbob = ambient status glyph, always visible, zero-click.** Sims 1: 3-colour mood. Sims 2: 5-step gradient, overloaded with aspiration state. Sims 3: back to 3 colours. Sims 4: decoupled from needs entirely — it encodes **current dominant emotion**, 10 base-game colours. https://snootysims.com/wiki/sims-2/trivia-time-amazing-plumbob-facts-from-start-to-sims-4/

**Attention.** Clicking a notification jumps the camera to that Sim or object. `[V, MED]` — https://sims.fandom.com/wiki/Notification

**Mode split.** Build/Buy is catalog-driven and **pauses the clock**; Live mode is the only mode in which time passes. Sims 4 merged Buy into Build and GameSpot's review treated the merge as a usability win. `[V, HIGH]` — https://sims.fandom.com/wiki/Build_mode · https://www.gamespot.com/reviews/the-sims-4-review/1900-6415867/

**ADOPT.**
- Verbs are **generated from the target's own published state**, never hand-authored per screen. This is exactly `buildingInspector.primaryActions` — *"every verb is a legality some read model already published, restated as a button."* `[R]` The parallel is close enough to be reassuring, not coincidental.
- The three-channel separation. Project: Studio already has the pieces: `attention` + `attentionReason` on `StudioBuildingSnapshot` (ambient glyph), the building card's status line (momentary), and deep facts in a workspace (quantitative). `[R]` Keep them apart.
- **Deliberately exempt high-stakes verbs from your own categorisation scheme.** In March 2023 Maxis reorganised the social pie menu into topic/characteristic buckets but kept *Become Best Friends*, *Divorce* and *Breakup* **uncategorised at the top level** — SimGuruNova's stated reason was to stop a Sim declining an action because it sat inside a category they disliked. Devs also predicted a *"learning curve"* for the reorganisation itself. `[V, HIGH — primary developer statement]` — https://simscommunity.info/2023/03/03/first-look-at-the-new-social-pie-menu-coming-to-base-game/

**DO NOT COPY.**
- **The pie menu itself, for money.** Nesting is a documented, sustained failure at content scale — EA forum threads titled *"We need to seriously discuss the pie menus"*, and a live mod ecosystem whose products are literally *Better Pie Menu* and *Smarter Pie Menu: Searchable Interactions*. `[V, MED — forum/mod evidence, not press]` — https://forums.ea.com/discussions/the-sims-4-feedback-en/we-need-to-seriously-discuss-the-pie-menus/12708052 · https://www.curseforge.com/sims4/mods/smarter-pie-menu-searchable-interactions
- **Emotion-gated verb visibility** — hiding an interaction until an invisible precondition is met. `[V, MED]` Project: Studio's rule is better and already written: a refused verb is **shown and disabled with its reason**, and a caller-state refusal produces **no verb at all** rather than a greyed control explaining nothing. `[R]`
- **A visible queue for spends.** Sims' queue is legible because everything in it is free and reversible. Signing, commissioning, greenlighting and releasing are none of those.

---

### B. ZOO TYCOON (2001) and ZOO TYCOON 2 (2004)

**ZT1.** Clicking an animal opens **Animal Info**: name, sex, age, a happiness bar and an environment/exhibit-suitability bar, colour-coded, plus a health indicator and an overall 0–100 suitability derived from needs met. `[V, HIGH]` Catalog buttons (Construction / Creatures / Structures & Scenery / Hire Staff / Research) sit along the upper-left and open purchase panels. `[V, MED]` Clicking a zookeeper or maintenance worker opens a staff-info screen; zookeepers are assigned to exhibits from an **assignment button inside it**. `[V, MED]`
– https://zootycoon.fandom.com/wiki/Animal_Needs · https://en.wikipedia.org/wiki/Zoo_Tycoon_(2001_video_game) · https://manualmachine.com/gamespc/zootycoon/1119165-user-manual/

**ZT2 — the one worth studying.**
- **Needs are tiered and colour-gated.** Basic = Biome, Hunger, Thirst, Sleep, Exercise. Advanced = Privacy, Hygiene, Social, Entertainment. Rendered as icon boxes under a heart tab; **no colour = satisfied, green = satisfied-but-imperfect, yellow = attention, red = unhappy.** The gating rule is stated plainly: *"if any of the basic needs are yellow or red then the animal is not happy… unhappy animals will create unhappy guests."* `[V, HIGH]` — https://gamefaqs.gamespot.com/pc/919850-zoo-tycoon-2/faqs/50886
- **The "Zookeeper recommendations" button.** A tab that auto-lists every biome / flora / food / fencing / item that *this specific animal* wants. `[V, HIGH — same source]` This converts a diagnosis into a shopping list in one click. It is the single best idea in either Zoo Tycoon.
- **Zookeeper Mode / Guest Mode.** First-person walkaround; the player can take over zookeeper jobs (raking, filling troughs, cleaning) and janitor work; a separate Photo Safari mode saves to an in-game album. Wikipedia records that Guest Mode was added **in direct response to fan requests to "get closer to the animals."** `[V, MED-HIGH]` — https://en.wikipedia.org/wiki/Zoo_Tycoon_2
- **Exhibit editing is direct-world.** Cliff / ditch / flatten tools alter terrain one unit per click; fencing locks terrain level at its attachment point; a Biome Brush paints ground cover. `[V, HIGH]`
- **Guest thoughts are click-to-inspect, not ambient.** To see why a guest is unhappy you must click them and open the **thought-bubble tab (furthest right)**. Once a guest decides to leave, *"there is no stopping them."* `[V, HIGH]`

**ADOPT.**
- The tiered, colour-gated need read with a **stated gating rule**. This is `ZT-SUITABILITY-002` with teeth: not just "decompose the score," but "publish the one sentence that says when it's a problem."
- **The recommendations button.** Its Project: Studio analogue is the already-implemented `primaryActionNote` (*"a missing button is only honest if the panel says why it is missing"*) `[R]`, upgraded from *why not* to *what would fix it* — when and only when TypeScript can state a fix truthfully.

**DO NOT COPY.**
- **Hiding the number behind an unlabelled meter.** ZT2 never shows the 0–100 suitability score; the meter's pass threshold varies silently by species (some settle at 70, some need 90+). `[V, MED]` — https://www.neoseeker.com/forums/1487/t28721-suitability-rating/ This is the top-cited opacity complaint across the franchise's whole lineage and it directly contradicts `RCT3-DIAGNOSTICS-001`.
- **Menu-step debt.** The 2013 Frontier reboot inherited the family fault: *"Editing objects is hard enough with the poorly configured menu interface, which forces players to go back and forth and take far too many steps to perform each task."* `[V, HIGH — direct quote]` — https://gamerant.com/zoo-tycoon-review/
- **Guest-thought-by-hunting.** Requiring a click on each entity to discover a problem does not scale. See RCT3 below for what happens when the aggregate goes missing.

---

### C. ROLLERCOASTER TYCOON 3 (and RCT1/2)

**The three-layer split, converged on independently three times.** `[V, HIGH]`
1. **Global / temporal** — RCT3's top **Dashboard**: objectives, day/night, game speed, cash, attendance, Park Rating, weather, date/time, and the **Game Message Console** (a pull-down of recent events with click-to-jump-to-source).
2. **Creation** — a left-edge button column expanding into toolboxes (rides, shops, scenery, paths, terrain, delete). IGN: *"kept to small buttons on the left side of the screen that eventually open up windows, most of which are kept in the bottom right corner."* `[V, HIGH]`
3. **Operation** — clicking any *placed* object opens **its own floating control panel**, which can be **pinned** to the screen edge and left open.
– RCT3 manual: http://cdn.akamai.steamstatic.com/steam/apps/2700/manuals/manual_english.pdf · https://www.ign.com/articles/2004/10/28/rollercoaster-tycoon-3-review

**The ride panel is the archetype "operating panel anchored to selection."** Manual-confirmed tabs: Graphs, Maintenance, Ride Details, Finances, Guest Opinions, Ride Vehicles, **Ride Status (Open / Test / Close)**, Test Results, Ride Operating Mode, Construction, Customers, Close, Close-up. Admission price, min/max waiting time, music assignment, inspection frequency, rename. `[V, HIGH]` Crucially, **RCT2 already had nearly this exact tab set** (View / Stats / Mechanics / Maintenance Record / Colour / Music / Financial Data / Guest Data) — RCT3 is evolutionary here, not novel. `[V, HIGH]` — https://oldgamesdownload.com/wp-content/uploads/Rollercoaster_Tycoon_2_Manual_Win_EN.pdf

**Peeps.** Clicking a guest opens a Peep Control Panel: close-up, rename, current activity, **Pick Up Peep** (*"Click to grab the peep, then move the mouse and click again to drop the peep"*), thoughts, ride history, pockets, status, cash, group. RCT2 had the same as button 1 "Move": *"helpful when you want to relocate someone who is lost."* `[V, HIGH]`

**Correction to a widespread assumption — thoughts are NOT world-space bubbles.** `[V, HIGH]` In RCT1/2/3 a thought surfaces through **three UI channels**, none of them a floating balloon over a sprite: (1) the peep's own "Recent Thoughts" tab; (2) a **sortable, filterable park-wide guest list** in thoughts mode; (3) the message console, **opt-in per peep** — RCT3 manual: *"Monitor Peep Thoughts – Click to send this peep's thoughts to the dashboard's message pull-down."* Exact strings cross-verified against OpenRCT2's language file and the wiki: *"I can't afford ⟨ride⟩"*, *"I'm lost!"*, *"I've been queuing for ⟨ride⟩ for ages."* — https://rct.fandom.com/wiki/Guest_Thoughts

**The load-bearing failure.** RCT3 shipped with the park-wide aggregate thought list broken or missing. **Two independent contemporaneous reviewers flagged the same specific regression.** IGN: *"there is no overall list of peep reactions to the park to sort through as there was in 1 and 2… unless you click on each of the peeps individually."* Eurogamer: *"the increased difficulty of gaining information about the general mood of the visitors to your park, with no simple poll functions."* `[V, HIGH — converging independent sources]` — https://www.eurogamer.net/r-rct3-pc

**Mr Jobsworth.** A free, unfireable Park Inspector who roams and reports into the **same message console guests use**, with player-configurable inspection scope (Check rides / Check shops / Check vista). `[V, HIGH]` A watchdog NPC replaces an audit-checklist screen.

**Anticipated clutter.** RCT2 shipped dedicated keybinds — **Backspace** = close topmost floating window, **Shift+Backspace** = close all floating windows. `[V, HIGH]` Multi-window debt was a named, mitigated design problem in 2002.

**ADOPT.**
- The three-layer split, exactly. Project: Studio's HUD is layer 1, the placement catalog is layer 2, the building card is layer 3. `[R]`
- **Aggregate legibility is load-bearing, not a nice-to-have.** This is `RCT3-ATTENTION-002` proven by its own absence. Any CP that moves actions onto buildings must not lose the one place a player can see *everything that wants them*.
- Mr Jobsworth as the model for a future Studio Operations role (`RCT3-OPERATIONS-003`) — reporting into the **existing** attention channel rather than adding one.

**DO NOT COPY.**
- **Unbounded stackable panels.** Even with close-all keybinds this is a 2002 desktop idiom, not a 1948-studio one, and Project: Studio has already ruled against it: the browser client's own rule is *"the verb landing the full-screen surface is the exact defect the retained workspace exists to prevent."* `[R]`
- **Shipping spectacle ahead of diagnostics.** RCT3 invested in CoasterCam, the Fireworks MixMaster timeline and VIPeeps while a core RCT1/2 diagnostic regressed at launch. `[V, HIGH]`
- MixMaster stays where the register put it — `RCT3-MIXMASTER-004`, future Advanced Movie-Maker reference only.

---

### D. THE MOVIES (2005) — gaps only

**Mid-game building click.** There is **no single wheel for every building.** Each facility is a small interior containing 1–5 labelled **rooms / drop-zones**; you deliver a person or object by dragging them onto a zone. Hovering a builder over the building itself raises floating icons (bomb = demolish, arrows = move). `[V, HIGH]` — https://www.ign.com/wikis/the-movies/The_Studio_Lot · https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/41120

Room inventories worth having on record: **Casting Office** — Director / Actors / Extras / Crew / *Shoot It*. **Production Office** — Release Movies / Movie-Player preview / Finance-Salaries / Reviews. **Stage School** — Create Actor / Create Director / Create Extra / Import Star. **Script Office** — one room per genre, plus a shared Script Pool. **Cosmetic Surgery** — separate Nip & Tuck / Liposuction / Implants rooms, two of them research-locked. **Laboratory** — four research rooms, right-click previews unlock contents. `[V, HIGH]`

One real consequence rule, worth noting because it is a *cost of re-entry*: **re-entering casting to swap actors or the director restarts the shoot from scene one; swapping crew or extras does not.** `[V, HIGH]`

**Star management by dragging — confirmed.** Drag the star (or their Star Card) and drop on a building/room; the star then **physically walks there** and the effect applies over in-game time, not instantly. A "stardust" particle trail points toward valid destinations — Eurogamer credited this with *mitigating, not solving,* the problem of a large lot requiring constant camera scrolling. `[V, HIGH]` — https://www.eurogamer.net/r-themovies-pc

Stress and boredom are the two core meters, read by right-clicking a Star Card. Over-stress makes a star blow off a shoot to binge; the player can drag them back onto the set **at the cost of a bad performance** — a legible, priced override. Rehab removes a star for roughly an in-game year. There is **no gym building** — weights are furniture objects a star uses idly or is dragged onto; there is **no costume department** — street wear comes from the Makeover Department, movie costumes are auto-assigned during casting. `[V, HIGH]` — https://www.ign.com/wikis/the-movies/Stars

**The alert system — and its documented hole.** Three channels: floating contextual **info bubbles** around the lot; small **icon bubbles pulsing above individual characters**; and an audio **"PA Assistance"** slider (Off / Low / Medium / High / Full) controlling how often an in-universe PA voice announces events. There is **no to-do list** — the closest thing is the top timeline ribbon, whose award icon reveals next unlock objectives on hover. `[V, HIGH / MED for the PA slider]`

**No click-through from alert to entity.** `[I — inference from absence across five detailed guides and two critical reviews]` IGN complained of exactly the gap this would fill: no right-click "go-to" as an alternative to dragging, and manual scrolling to find the right building. GameSpot: the screen *"can become totally cluttered with pop-up info bubbles."* `[V, HIGH]` — https://www.ign.com/articles/2005/11/09/the-movies · https://www.gamespot.com/reviews/the-movies-review/1900-6139475/

**Toolbar vs world — the real division of labour.** The bottom-left trowel opens the build menu (F1/F2/F3). F5 = finance graphs, F6 = salaries, F7 = charts. **Numeric keys 1–0 cycle the camera to specific building types** (1 = script office, 2 = casting, 3 = active set, 4 = production office…). The money counter is clickable through to Salaries. `[V, HIGH]` — https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/40166

The correction that matters: **almost every "screen" is a building.** Archive is a function inside the Production Office; "Movie Maker" is the Custom Scriptwriting Office building. `[I, well-supported]` The toolbar owned **construction, finance, charts, navigation and save** — and essentially nothing else. Everything operational was pushed into the world.

**Criticism, converging.** IGN: the interface *"can just get in the way."* GameSpot: *"constant micromanagement"* fatigue. Eurogamer: the relationship system's venue-tier busywork undercuts the human half. Rock Paper Shotgun in retrospect: the game splits time between *"the fantasy of heading a studio and the tedium of nannying people."* Independently: star portrait icons become illegible past ~10 entries; trailer upgrades require demolish-then-rebuild, angering the displaced star. `[V, HIGH / MED]` — https://en.wikipedia.org/wiki/The_Movies_(video_game)

**ADOPT.** Buildings own operational verbs; the toolbar owns construction, money, charts and navigation. Physical travel as feedback (the person walks; the effect lands later). Priced overrides instead of blocked ones.

**DO NOT COPY.** Drag as the *only* verb. Alert bubbles with no click-through. Per-person nannying as the growth curve. And note the tell: Sandbox mode exposes **"Stars Don't Misbehave"** as a literal checkbox `[V, MED]` — the game conceding its own nagging mechanic was optional.

---

## 2. THE PATTERN LIBRARY

Fourteen named patterns. Each: what proves it → what it solves → how it maps to Project: Studio's **existing** authoritative surfaces.

**P1 — Verb menu on the object.**
*Proof:* Sims pie menu; RCT ride/peep panels; The Movies rooms; Frostpunk building panels.
*Solves:* "Where do I do this?" has one answer — at the thing it concerns.
*Maps:* `commissionScreenplay` / `acceptScreenplay` / `requestRewrite` → building `writers` (Development). `startAuditions` / `acknowledgeAuditions` / `greenlightPicture` → `casting`. `resolveProductionBlocker` → `stage-a` / `stage-b` / `post`. `advanceWeek` → HUD, no building. `[R]` The engine already computes this: `firstFilmJourney.next.site ∈ {development, casting, stage, post, admin}` and is **`null` exactly for `advance-week`**. `[R]`

**P2 — Verbs are generated from published legality, never authored per screen.**
*Proof:* Sims objects advertise verbs to AI and the pie menu renders the advertisement.
*Solves:* Two surfaces drifting apart.
*Maps:* Already law here — *"every verb is a legality some read model already published, restated as a button."* `[R]` Unity must restate `availableIntents`, never derive one.

**P3 — Three verb states: offered / shown-and-disabled-with-reason / absent.**
*Proof:* The register's own `RCT3-DIAGNOSTICS-001`, plus the ZT2 anti-case.
*Solves:* Greyed buttons that teach nothing, and silently missing buttons that teach less.
*Maps:* Implemented and commented in `buildingInspector.ts`: legal → enabled; live work holds it → same verb disabled with the sentence naming what holds it; caller-state refusal → **no verb at all.** `[R]`

**P4 — A withheld verb owes a sentence, in the slot the button would have occupied.**
*Proof:* No comparator does this well; it is a Project: Studio invention and it is better than the field.
*Maps:* `primaryActionNote`, rendered exactly where the button would sit. `[R]` Currently only Development withholds a legal verb, so only Development carries a note.

**P5 — Status glyph above the entity (ambient, zero-click).**
*Proof:* Sims plumbob; Cities: Skylines problem icons — white → red *("still waiting!")* → black, hover for cause, click for panel, stacked as *"Multiple problems!"* `[V, HIGH]` https://skylines.fandom.com/wiki/Problem
*Maps:* `StudioBuildingSnapshot.attention` + `attentionReason` are already on the wire and already consumed by the browser's `ATTENTION_META` (icon + word + colour — never colour alone: `!` "Decision required", `⚠` "Warning", `▶` "Active", `○` "Available"). `[R]` **Honest caveat:** `decision-required` is contracted but the current selector *"never manufactures it, because phases 1–4 expose no per-production decision."* `[R]` Grounding it is a small, real TypeScript task.

**P6 — Operating panel anchored to the selection.**
*Proof:* RCT ride panel; Frostpunk building panel; ZT2 animal panel; OpenTTD station/vehicle window.
*Maps:* CP9 already built the anchor: `StudioFoundingCardHud.CardRect(receiptRect, height)` places the card **directly above the existing selection receipt**. `[R]` A site card is the same rect with different contents.

**P7 — Fixed reading order: what is this → what is happening → who is here → what can I do → how much room is left.**
*Proof:* Nobody in the survey states this; Project: Studio does, and its rationale is recorded — *"Capacity is management detail and belongs after the verb, not in front of it."* `[R]`
*Maps:* Role line → status line → attention line → occupants → verbs → withheld-note → facts → ghost route to the deep screen. Ship this order verbatim in Unity.

**P8 — Toolbar for CREATION and global state; world for OPERATION.**
*Proof:* RCT1/2/3's three-layer split; The Movies' trowel-plus-hotkeys toolbar; Sims' Build/Buy vs Live.
*Maps:* HUD keeps date, week, speed, cash, weekly direction, attention count, `advanceWeek`, Save/Load. The build catalog keeps `startConstruction`. Everything else moves to a building. `[R]`

**P9 — Complexity earns a retained workspace; the lot stays mounted behind it.**
*Proof:* Two Point Campus' hiring split; RCT's pinnable panels; the register's own doctrine.
*Maps:* Implemented — `LotRetainedWorkspace.tsx` (focus trap, escape containment, *"the authoritative Studio Lot remains mounted"*), with `LotCommissionWorkspace`, `LotAuditionWorkspace`, `LotPackageWorkspace`, `LotCastingReviewPanel`. `[R]` **The critical nuance:** the building verb is a **doorway**, not a commit. `takeBuildingInspectorPrimaryAction('commission')` opens the retained commission route; it does not spend. `[R]`

**P10 — Click-through from alert to entity.**
*Proof:* RimWorld's colonist bar (left-click jumps camera, right-click recenters) `[V, HIGH]` https://rimworldwiki.com/wiki/User_interface · Sims notifications · RCT3's message console. **Negative case:** The Movies, where reviewers explicitly wanted it.
*Maps:* Implemented in the browser as `LotNextEventWorldTarget`, which carries a **`buildingId`** for every kind — `script→writers`, `casting→casting`, `production→BuildingId`, `wrap→BuildingId`, `run-completed→theater`, `cash→admin`, `construction→BuildingId`, and honestly `contracts→null`. Nine exact stop reasons, compile-time-proved total. `[R]` Unity has none of it.

**P11 — Individual truth and aggregate truth must both exist; the aggregate is load-bearing.**
*Proof:* RCT1/2's sortable park-wide thought list, and RCT3's launch regression flagged independently by IGN and Eurogamer. Register pattern `RCT3-ATTENTION-002`.
*Maps:* If CP10 moves verbs onto buildings, the HUD attention count **must** stay and must resolve to the entity. Do not trade a memo for a scavenger hunt.

**P12 — Diagnosis → prescription in one control.**
*Proof:* ZT2's "Zookeeper recommendations" — the best single idea in the survey.
*Maps:* Where TypeScript can truthfully state the fix, `attentionReason` and `primaryActionNote` should name it, not merely name the problem. Only where it can state it truthfully — the strict-selector discipline already forbids guessing. `[R]`

**P13 — Reversibility sets the number of steps.**
*Proof:* Sims' free, cancellable queue vs. The Movies' priced override (drag a stressed star back on set, accept the bad performance).
*Maps:* Already two calibrated tiers in this codebase. A production unblock dispatches on a **single click** (`onClick → dispatchHollywoodProductionCommand`) because it is operational and cheap. A signing runs **Compact → Details → Review → armed commit**, with `CommitArmed` and a *"geometric law"* that the commit button never renders where the cursor that revealed it was resting. `[R]` CP10 must place each new verb in the correct tier — and `commissionScreenplay` is a spend.

**P14 — Info overlays as a reversible lens on the same world.**
*Proof:* Cities: Skylines' ~36 Info Views `[V, HIGH]` https://skylines.paradoxwikis.com/Info_views · SimCity's Query tool with modifier-key tiers `[V, MED]` https://simcity.fandom.com/wiki/Query · RCT3's MAPS panel and View Options.
*Maps:* **LATER, not CP10.** Recorded so it is not reinvented. Nothing in the current snapshot supports a truthful heatmap.

---

## 3. CP10 recommendation — *Development Operable From The Lot*

### The smallest coherent slice

**One building becomes operable: `writers` (Development).** It is the correct first choice for four reasons: it is the **first** post-founding decision the player meets; it carries the **fewest simultaneous intents** (`commissionScreenplay`, then `acceptScreenplay` / `requestRewrite`); it is the one place the engine **already withholds a legal verb and can explain why**; and it is the only site whose entire verb set is already proven in the browser client. `[R]`

### The one protocol change

`StudioBridgeIntentOption` carries `intentId`, `kind`, `label`, `detail`, `projectId`, `castingSessionId`, `productionId` — and **no site or building binding**. That single gap is why Unity can only render intents as a list. `[R]`

Add a TypeScript-authored, read-only **`site`** binding to each intent option, plus its `buildingId`, exactly as CP9 added the founding-arrival view keyed to the opaque `signFoundingContract` intent. TypeScript already computes the function-level site (`JourneySite`) and already owns the building ids (`src/core/lot.ts`: `gate`, `admin`, `theater`, `writers`, `casting`, `stage-a`, `stage-b`, `post`). `[R]` **TypeScript must author the binding**, because it is not mechanical: the comment on `SITE_PLACE` warns it *"names the studio function, not a renderer building instance"* `[R]`, and `casting`'s body holds **no facility** — the shared Development & Casting facility stands at `writers`. `[R]` Unity must never infer this.

### What the Development card contains

Anchored above the existing selection receipt, reusing `StudioFoundingCardHud`'s geometry and layer machine `[R]`, in the P7 order:

```
IN THE LOT · DEVELOPMENT
Development
Development — screenplays commissioned, drafted, and reviewed
Screenplay work is under way in the studio's development slots.
!  Decision required · <attentionReason>          ← only when grounded
WHO IS HERE
  <writer name>  ·  <activity>
WHAT CAN I DO HERE
  [ Commission a screenplay ]        → opens the RETAINED commission workspace
  [ Accept the screenplay ]          → armed two-step commit
  [ Request a rewrite ]              → armed two-step commit
  <withheld-verb sentence, in the slot the button would have occupied>
HOW MUCH ROOM IS LEFT
  Slot 1 · <script> due Week <n>
  Script due · Week <n>
[ Open Development details ]                       ← the only route to a deep screen
```

Every field is a TypeScript string. Unity performs no capacity, legality, pricing, due-date or eligibility computation.

### What the memo keeps

Exactly the CP9 move, one class further: `PlayerIsFoundingOption` gains a sibling that skips **any option whose `site` is `development`**. `[R]` Everything else stays on the memo, untouched. The memo continues to carry the journey narrative block, `advanceWeek`, `startAuditions` / `acknowledgeAuditions` / `greenlightPicture` (the multi-option cast choice — `session.ts` emits **one option per cast permutation** with long prose labels; that is a workspace, never a card `[R]`), `resolveProductionBlocker`, Save/Load, and rejection receipts.

### Acceptance proof

1. From a founded studio, a fresh session reaches Commission by clicking the Development building, with the memo closed.
2. No `commissionScreenplay`, `acceptScreenplay` or `requestRewrite` button appears in the memo while a Development card can show it — proved by the same test shape as CP9's founding-option exclusion.
3. Commission opens the retained workspace over a still-mounted lot; it does not commit and does not eject to a full-screen surface.
4. Accept / Rewrite commit only through the armed two-step; cancel is byte-neutral; a stale intent fails closed and never substitutes another.
5. Every displayed field equals the TypeScript view verbatim.
6. When the engine withholds Commission, the card states why in the slot the button would occupy.
7. HUD attention count and `advanceWeek` remain readable and functional throughout — P11 is a gate, not a nice-to-have.
8. Owner playtest: the first screenplay is commissioned and reviewed while watching and clicking the lot.

### NEXT (not CP10)

Casting card (with the audition/package comparison staying in the retained workspace, plus Locate-in-world). Stage / Post cards for `resolveProductionBlocker` — the join is *already on the wire and already consumed by Unity* via `productionOperations[].locationBuildingId` in `StudioStageProductionPresentation.cs`. `[R]` Then the attention rail: port `LotNextEventWorldTarget`'s click-through, and ground `decision-required` so P5 stops being a contract with no emitter.

---

## 4. DO-NOT-DO — failure modes specific to these games

1. **Do not build a pie/radial menu for high-stakes irreversible spends.** Sims' nesting failed at content scale, and every verb behind it was free and cancellable. Ours are not. `[V]`
2. **Do not bury a high-stakes verb inside a category.** Maxis had to pull Divorce and Breakup out of their own new scheme. Commission, Greenlight and Release stay at the card's top level, always. `[V]`
3. **Do not hide a verb until an invisible precondition is met** (Sims 4 emotion gating). Shown-and-disabled-with-reason, or absent — the existing three-state law. `[R]`
4. **Do not hide the number behind an unlabelled meter with a silently varying threshold** (ZT2 suitability). This contradicts `RCT3-DIAGNOSTICS-001`, and it is the single most-cited opacity complaint in that franchise's whole lineage. `[V]`
5. **Do not make the player click every entity to find a problem.** RCT3 lost the aggregate list at launch and two independent reviewers called it a regression against a five-year-old predecessor. Keep the HUD aggregate. `[V]`
6. **Do not open unbounded stackable panels.** RCT2 needed *Close all floating windows* on Shift+Backspace two games before RCT3's critics. One card at a time, one workspace at a time. `[V]`
7. **Do not add an alert channel without click-through.** The Movies' bubbles cluttered the screen (GameSpot) and IGN asked for the go-to that never came. An alert that cannot reach its entity is noise. `[V]`
8. **Do not make dragging the only verb.** The Movies' stardust trail *mitigated* rather than solved the "scroll the lot to find the building" problem (Eurogamer). Select → read → confirm is already the taught grammar; single-click selects, double-click focuses, ESC clears. `[R]`
9. **Do not grow the game by growing per-person chores.** IGN blamed hiring caps for busywork past ~12 stars; RPS's retrospective named the split between studio fantasy and *"the tedium of nannying people."* Growth must reduce repetition and preserve consequence (`RCT3-OPERATIONS-003`). `[V]`
10. **Do not let a card become a second memo.** The failure mode is a card that lists every intent with its `detail` paragraph — the memo, relocated. The reading order (P7) and the site binding (one card, one place's verbs) are what prevent it.
11. **Do not ship spectacle ahead of diagnostics.** RCT3's cautionary shape. CP10 buys legibility, not a new camera.
12. **Do not let Unity own any of it.** No site inference from labels, no prose parsing, no capacity or runway math, no pricing, no legality. TypeScript authors the site binding and every string; Unity places, selects and dispatches an opaque `intentId`.
13. **Do not bundle.** CP10 is Development only. Casting, stages, post, the attention rail, overlays, construction changes and the Founding Flip are each their own slice.

---

## 5. Sources

**Sims** — https://en.wikipedia.org/wiki/Pie_menu · https://donhopkins.medium.com/pie-menus-936fed383ff1 · https://sims.fandom.com/wiki/Action_queue · https://sims.fandom.com/wiki/Notification · https://sims.fandom.com/wiki/Build_mode · https://strategywiki.org/wiki/The_Sims_2/Needs · https://www.gamepressure.com/thesims4/needs/z468cc · https://simscommunity.info/2023/03/03/first-look-at-the-new-social-pie-menu-coming-to-base-game/ · https://snootysims.com/wiki/sims-2/trivia-time-amazing-plumbob-facts-from-start-to-sims-4/ · https://www.gamespot.com/reviews/the-sims-4-review/1900-6415867/ · https://forums.ea.com/discussions/the-sims-4-feedback-en/we-need-to-seriously-discuss-the-pie-menus/12708052

**Zoo Tycoon** — https://zootycoon.fandom.com/wiki/Animal_Needs · https://en.wikipedia.org/wiki/Zoo_Tycoon_(2001_video_game) · https://en.wikipedia.org/wiki/Zoo_Tycoon_2 · https://gamefaqs.gamespot.com/pc/919850-zoo-tycoon-2/faqs/50886 · https://www.neoseeker.com/forums/1487/t28721-suitability-rating/ · https://gamerant.com/zoo-tycoon-review/ · https://egmnow.com/the-evolution-of-animal-conservation-in-games-from-zoo-tycoon-to-planet-zoo/

**RCT** — http://cdn.akamai.steamstatic.com/steam/apps/2700/manuals/manual_english.pdf · https://oldgamesdownload.com/wp-content/uploads/Rollercoaster_Tycoon_2_Manual_Win_EN.pdf · https://rct.fandom.com/wiki/Guest_Thoughts · https://rct.fandom.com/wiki/Ride_Operation_Options · https://rct.fandom.com/wiki/Guests_and_Staff · https://www.ign.com/articles/2004/10/28/rollercoaster-tycoon-3-review · https://www.gamespot.com/reviews/rollercoaster-tycoon-3-review/1900-6112017/ · https://www.eurogamer.net/r-rct3-pc

**The Movies** — https://www.ign.com/wikis/the-movies/The_Studio_Lot · https://www.ign.com/wikis/the-movies/Stars · https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/41120 · https://gamefaqs.gamespot.com/pc/561567-the-movies/faqs/40166 · https://www.ign.com/articles/2005/11/09/the-movies · https://www.gamespot.com/reviews/the-movies-review/1900-6139475/ · https://www.eurogamer.net/r-themovies-pc · https://en.wikipedia.org/wiki/The_Movies_(video_game)

**Cross-cutting** — https://wiki.openttd.org/en/Manual/Vehicles · https://wiki.openttd.org/en/Manual/Stations · https://simcity.fandom.com/wiki/Query · https://skylines.paradoxwikis.com/Info_views · https://skylines.fandom.com/wiki/Problem · https://frostpunk.fandom.com/wiki/Buildings · https://frostpunk.fandom.com/wiki/Generator · https://store.steampowered.com/app/1331550/Big_Ambitions/ · https://software-inc.fandom.com/wiki/Teams · https://rimworldwiki.com/wiki/User_interface

**Repository evidence `[R]`** — TS `de32b41` (`campaign/living-lot-ts`): `bridge/schema/bridge-schema.ts`, `bridge/session.ts`, `src/core/firstFilmJourney.ts`, `src/core/lot.ts`, `ui/src/lot/buildingInspector.ts`, `ui/src/lot/StudioLotScreen.tsx`, `ui/src/lot/snapshot/nextEvent.ts`, `ui/src/lot/snapshot/StudioLotSnapshot.ts`, `ui/src/lot/LotRetainedWorkspace.tsx`. Unity `3003081`: `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`, `Assets/Studio/Runtime/Presentation/StudioHud.cs`, `StudioFoundingCardHud.cs`, `StudioBridgePresentation.cs`, `StudioStageProductionPresentation.cs`, `SelectableEntity.cs`.

**Access caveats, recorded honestly:** `sims.fandom.com` returned HTTP 402 to direct fetch throughout, so Sims wiki claims came via search synthesis and are labelled MEDIUM. No professional review text criticising Sims pie-menu depth was retrievable — that claim rests on EA forums and mod evidence only. The Movies' lack of alert click-through is inference from absence across five guides and two reviews, not a positive statement in any source. The RCT3 Prima Guide URL is a pointer whose interior was not re-verified this pass; the register's existing Prima citations remain the authority for its content.
