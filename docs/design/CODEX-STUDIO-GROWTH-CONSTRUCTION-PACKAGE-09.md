# PROJECT: STUDIO — PACKAGE 09

# Studio Growth, Construction & the Founding Flip

Status: **decision-ready design research; documentation only**
Research branch: `codex/studio-growth-construction-research-09`
Canonical baseline: `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`)
Relevant sealed/runtime evidence inspected read-only: TypeScript `44615e5`; Unity sealed CP9 `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`; latest relevant Unity presentation branch `f9e4ec40f1f729c67101e173d0e7bde418175f60`
Authority date: 25 August 2026

This package changes no production code, schema, tuning, save, test, dependency, or Unity asset. It defines the product contract that a later implementation may satisfy.

## Evidence notation

- **[FACT — PRIMARY]** directly verified in an official manual or shipped-game data.
- **[FACT — SECONDARY]** directly observed in a contemporary/retrospective source, not used alone for hidden mechanics.
- **[CODE]** verified in the named Project: Studio source at the baseline above.
- **[GOVERNANCE]** an accepted Owner/master-plan ruling, even when implementation has not caught up.
- **[INFERENCE]** the narrowest interpretation supported by several facts.
- **[RULING]** the Project: Studio design decision made by this package.

Historical page references use printed page numbers where the PDF carries them. “Current” always means the recorded baseline, not an aspiration in an older planning document.

---

# 1. Executive decision

Project: Studio should perform the **Founding Flip**. A new authored 1920 campaign begins on a finite, sparse property containing only:

1. the permanent Studio Gate;
2. the permanent Administration / Staff Office;
3. the authored frontage road and the minimum circulation needed to reach those landmarks;
4. an explicit starting-property boundary and owned vacant parcels; and
5. visually plausible minimal utility connections that carry **no gameplay claim** until a utility system exists.

It does **not** seed Development, Casting, a talent school, Crew, Scenery, a Soundstage, a Set, Post, an Annex, or a Theater. The Theater remains on historical/endowed lots and may return later as optional prestige or screening infrastructure; it is not a first-film dependency. This is settled Owner law, not a new proposal.

The first physical need after founding is the current authoritative **Development & Casting Office**. The lot and First Film Journey must say why: the studio owns no Development & Casting capacity, so no screenplay can enter active development and no auditions can operate there. Current queue law still permits a deliberate screenplay commission request to wait for capacity; Build is the primary remedy, not a fabricated prohibition. The player enters Build through either the global creation toolbar or a vacant parcel’s **Build here** action, chooses the office, previews its exact footprint, sees authoritative legality/cost/duration/capacity, commits deliberately, watches a persistent construction site, and sees the completed building become operational. That one loop is the bounded next proof.

The professional construction grammar is:

> **Need → Build catalog → Preview → Explain validity → Commit once → Watch authoritative time → Operate the completed facility.**

The core laws are:

- TypeScript alone owns property, catalog availability, placement legality, price, duration, identity, completion, capacity, move/demolish legality, and migration.
- Unity may render a ghost and site only from those projections and may submit exact current intents. It may never infer gameplay legality from colliders.
- Selection is safe. Buildings do not move because they were clicked or dragged in Inspect mode.
- A preview is reversible and save-neutral. Commit is the material boundary and is revalidated.
- Invalid placement states name a reason in text and geometry. Red alone is never the answer.
- Construction is real time on the one authoritative weekly clock. There is no Unity timer.
- Current Project: Studio has no Builder profession or construction-capacity law. The non-sealing P09A uses anonymous, presentation-only site workers. Full Founding Flip acceptance must later satisfy the binding Owner directive for real Builders affecting speed through TypeScript; manual builder dragging remains rejected.
- Current facility blueprints have fixed axis-aligned footprints. P09A does not offer cosmetic rotation. A later 90-degree rotation feature requires a TypeScript/save/query extension.
- Construction completion is a **non-pausing** event: the model swaps atomically, a restrained completion cue appears, and the camera does not move or open a workspace.
- Current facilities do not decay. Routine building maintenance is rejected. The separate authoritative Set repair law remains untouched.
- Existing saves are never reinterpreted. `INITIAL_PROPERTY` remains immutable historical migration authority. A sparse new game needs a separate named property template and an explicit persisted founding regime.

The strongest parts already exist. The TypeScript placement engine has ordered rejection reasons, authoritative quote/commit revalidation, monotonic numeric placement IDs, collision-checked derived facility/project IDs, construction time, completion, accounting, move/demolish guards, and multi-site support. The browser already demonstrates a strong build catalog, world ghost, per-cell verdicts, refusal retention, construction spectacle, move, and consequential demolition. The main missing implementation seams are the new founding regime/property, the First Film Journey’s pre-Development stages, a versioned **parameterized** placement quote and mutation bridge contract, and projection-driven multi-site Unity presentation.

## One bounded next checkpoint

**P09A — Founding Flip + First Construction V1 (non-sealing vertical slice)**

> New Studio → sparse 1920 property → found through Gate/Administration → the world identifies missing Development & Casting capacity → open Build → choose the baseline office → preview valid and invalid ground → explicitly commit current authoritative cost/time → see and inspect construction → advance Living Time → completion becomes non-pausing attention → use the exact completed facility to enter authoritative screenplay development.

P09A stops there. It proves the new-game regime and one complete construction loop; it is **not** the accepted C2b/full Founding Flip gate. That later gate still must prove the ruled overlap—screenplay work while later core facilities rise—and the existing bare lot → build core → first film Greenlit → wrap journey. P09A does not implement a full catalog art campaign, Sets, land acquisition, Builder staffing, path editing, maintenance, or every first-film building.

---

# 2. Original *The Movies* reconstruction

## 2.1 Normal campaign, tutorial, ready-built, and Sandbox are different evidence

The exact standard starter inventory, cash, month, and day are **not established with high confidence** by the recovered primary corpus. The base manual places play in the **1920s** and offers a separate **Start with a Ready Built Studio Lot** option; the *Stunts & Effects* manual explicitly says its New Game begins in **1920**. The base manual's Quick Start is a tutorial. It would be an evidence error to turn that tutorial lot—or the expansion's year statement—into a universal base-campaign January 1920 fixture.

What is securely known is the interaction grammar and tutorial teaching order.

| Topic | Reconstructed behavior | Source / confidence | Design purpose | Project: Studio disposition |
|---|---|---|---|---|
| Historical campaign opening | Base play is situated in the 1920s; the expansion manual says New Game begins in 1920. The recovered primary material does not establish a universal base-game month/day, inventory, or cash value. | Base manual New Game/timeline; *Stunts & Effects* manual New Game. **High for era; medium for exact base year** | Start a decades-long studio career. | **ADAPT.** Use settled Project: Studio 1920 sparse-start law; do not pretend its exact fixture is an original-game copy. |
| Ready-built option | New Game offered **Start with a Ready Built Studio Lot**. Exact plant/layout is not stated there. | Official manual, printed p. 4. **High** | Let players skip the early construction fantasy. | **LATER.** A future accessibility/custom-start option may use an endowed start, but migrated saves are not that option. |
| Sandbox | Starting decade and money were configurable; instant movie-making, instantly constructed buildings, and no decay were optional. Some content depended on campaign unlocks. | Official manual, printed p. 4; Prima Sandbox section. **High** | Creative freedom and lower pressure. | **LATER.** Keep campaign construction law clean; do not smuggle Sandbox toggles into P09A. |
| Staff Office | Quick Start begins with a Staff Office to the left of the Studio Gate and a queue of applicants. | Official manual, printed p. 10. **High, tutorial-specific** | Give construction and staffing a physical owner. | **ADOPT principle.** Administration/Staff Office is the permanent founding landmark. |
| Hire Builders | Player picked applicants up and dropped them into the Staff Office’s Create Builder room. More Builders accelerated construction. | Official manual, printed p. 10; Prima “Builders.” **High** | Make growth a visible workforce activity. | **ADAPT.** Preserve visible labor and future capacity potential; reject per-worker dragging now. |
| Tutorial construction chain | Build → Facilities → Stage School, then Crew Facility and Casting Office as the tutorial advances. The tutorial gives the player a script at the Gate; the manual tells players who skip the tutorial to build a Script Office. | Official manual, printed pp. 10–12. **High, tutorial-specific** | Teach a facility, use it, then reveal the next need while avoiding a tutorial dead end. | **ADAPT.** Use need-driven progressive disclosure, but do not misstate the Script Office as a tutorial prerequisite or build anything unsupported by current authority. |
| Build catalog | One Build icon opened Facilities, Sets, Landscaping, and Ornaments. Facility rows showed what was currently available, cost, and owned count. | Official manual, printed p. 10. **High** | Put creation in one predictable place. | **ADAPT.** Global Build remains; add readable effect, duration, capacity, requirements, and text blockers. |
| Placement ghost | Selected building became a flat world preview. Yellow meant legal; red meant obstructed. | Official manual, printed p. 10. **High** | Let players understand ground before spending. | **ADOPT principle / modernize.** Exact footprint plus status shape, icon, reason text, and authoritative revalidation. |
| Physical construction | After placement, Builders traveled to the site and built it. More Builders made it faster. | Official manual, printed p. 10; Prima “Builders.” **High behavior; low exact timing formula** | Turn a purchase into visible studio growth. | **ADOPT spectacle; REJECT unmodeled speed law.** Fixed current duration plus anonymous site activity. |
| Completion | Completing Stage School caused the talent queue/capability to appear in the world. | Official manual, printed p. 10. **High** | Make construction’s benefit tangible. | **ADOPT.** Operational body and capability flip atomically; no generic “Done” detached from the lot. |
| Paths | Player placed paths; paths connected buildings and accelerated staff travel. Layout also contributed to prestige. | Official manual, printed pp. 10, 20–21; Prima lot/prestige sections. **High** | Give layout operational and aesthetic meaning. | **ADAPT/LATER.** Retain current road-access and scenery-distance laws; do not fake general travel. |
| Move | Prima describes directing a Builder to a Move Building command. | Prima “Builders.” **High for existence, secondary to manual** | Correct layout without destroying the studio. | **ADAPT.** Explicit selected-building Move with authoritative ghost; no Builder pickup and no ordinary drag. |
| Sell/demolish | Prima describes Sell Building/demolition and a depreciated return; cleared ground needed cleanup. Exact universal refund is not safely recovered. | Prima “Builders” / “Buildings and Ornaments.” **Medium-high** | Let old plant make way for growth, with consequence. | **ADAPT.** Use Project: Studio’s exact 50% facility refund and engagement blockers, not the original’s unknown value. |
| Repair/decay | Builders maintained facilities and Sets; disrepair could make them unusable. Janitors handled litter/grounds. | Official manual, printed p. 17; Prima “Builders.” **High** | Make the lot feel materially operated. | **REJECT for ordinary facilities.** Preserve exceptional Set repair; no recurring facility-click chore. |
| Tier progression | Facilities and Sets became available by time, research, certificates/honors, and progression. Script Office tiers were new buildings, not a universal “upgrade +1” verb. | Official manual, printed pp. 22–23; Prima technology/facility sections. **High principle** | Make decades change what the studio can build. | **ADAPT/LATER.** Explain real requirements; use additional stable facilities until an explicit upgrade law exists. |
| Sets | Sets were purchased/placeable filmmaking locations; a required Set could be absent, damaged, or occupied. The original did not expose Project: Studio’s modern Stage-capacity/Set-content separation. | Official manual, printed pp. 12, 20; local mechanics corpus. **High** | Make films physically demand backlot infrastructure. | **ADAPT.** Keep Stage and Set as separate authoritative identities. |
| Lot beautification | Landscape surfaces and ornaments affected attractiveness/prestige and gave broad creative control. | Official manual, printed pp. 20–21; Prima. **High** | Let the studio become “mine.” | **LATER.** Valuable, but not part of the first construction proof. |

## 2.2 What the player physically did

The high-confidence Quick Start sequence was:

1. Center on the Gate and inspect the Staff Office applicant queue.
2. Pick up an applicant and drop them into **Create Builder**.
3. Open the bottom-left **Build** icon, then **Facilities**.
4. Select Stage School from a catalog showing cost and owned count.
5. move its flat preview across the lot;
6. use yellow/red outline feedback to find legal ground;
7. click to place;
8. watch Builders travel to the exact site and construct it;
9. optionally pave useful paths as the tutorial recommends;
10. use the completed building’s new world queue/capability;
11. continue through Crew Facility and Casting Office; if not using the tutorial-supplied script path, build a Script Office as the manual separately directs.

That is the historical heart worth preserving: **a facility is a business capability embodied in a place, and its construction is witnessed.** The outdated pieces are manual worker carrying, color-only legality, weak blocker explanation, routine decay labor, and high-frequency repair/cleaning chores.

## 2.3 Historical unknowns and non-claims

- This report does not claim an exact standard-campaign Day-1 inventory or cash value for *The Movies*.
- It does not infer normal campaign law from tutorial staging.
- It does not infer exact original Builder speed, depreciation, build-duration, path-speed, or maintenance formulas where the source corpus does not establish them.
- It does not retroactively describe original Sets as Project: Studio soundstage-mounted entities.
- It does not treat Sandbox instant construction/no decay as campaign behavior.

---

# 3. Stunts & Effects / Superstar findings

## 3.1 *Stunts & Effects*

The official expansion manual cleanly separates three starts:

- **New Game:** begins in 1920 like the base game; stunt content becomes available from 1960.
- **Quick Start — Pre-Built Studio Lot:** begins in 1960 with several basic facilities, employees, and Stars.
- **Quick Start — Empty Studio Lot:** also begins in 1960 with some employees/Stars and money, but a bare plot on which to build.

That is high-confidence evidence that Lionhead considered “built-out convenience” and “build the lot yourself” legitimate expansion Quick Start variants rather than one universal start. It is not evidence for the base campaign's exact 1920 inventory or for its month/day.

The expansion explicitly added three Stunt Training facilities, a Hospital, and more than a dozen Sets including blue-/green-screen and miniature-city Sets. The manual says the basic game remains intact, but it does **not** document enough placement interaction to prove whether those additions changed any construction detail. The safe inference is narrower: they are named additions to the physical facility/Set catalog, and there is no primary evidence here for a replacement build grammar.

**Ruling:** preserve extension points for specialized facility/Set catalogs, but do not introduce stunt training, hospitals, safety, or specialist construction into P09A.

## 3.2 Superstar Edition as a later-package lens

The Mac Superstar review covers the later Mac **bundle**, including *Stunts & Effects*. It is secondary reviewer-UX evidence, not hidden-mechanics authority and not a way to isolate base versus expansion law. It praises the large, lovingly made collection of buildings and Sets and the pleasure of beautifying the studio; it also describes needing to demolish old plant to make room for newer facilities. Crucially, its section **“Mikromanagement, das auch mal nervt”** criticizes work that should have been automated, while the maintenance section describes an army of janitors/repair staff.

The later package therefore:

- **preserved** the satisfying physical growth and unlock fantasy;
- **preserved** the world’s lively worker presence;
- **exposed** the scaling cost of manual repair, cleaning, staff carrying, and repetitive upkeep; and
- **did not solve** the causal opacity of several progression systems.

Project: Studio should copy the **visible studio growing**, not the **quantity of clicks required to keep it from decaying**.

---

# 4. Modern comparator findings

The detailed look-here atlas is in the Builder Annex. These are the problem-specific decisions.

| Problem | Best reference | Concrete lesson | Project: Studio translation |
|---|---|---|---|
| Build entry and creation hierarchy | *The Movies*; *RollerCoaster Tycoon* manual tutorial | One global creation route starts a staged world transaction. | Global **Build** plus parcel **Build here**, both entering the same catalog/draft owner. |
| Sparse-start growth | *Game Dev Tycoon* official product progression | Start visibly small; expansions change capabilities, not just cosmetics. | Gate/Admin/property first; every core facility must explain the filmmaking bottleneck it resolves. |
| Catalog legibility | *Planet Coaster* browser improvements; *Cities: Skylines* unlock manual | Categories/search are navigation; unavailable items explain requirements. | `Needed now` is contextual sorting, never a fake unlock. Cards show effect, capex, duration, opex, footprint, requirement. |
| Placement preview | *The Movies*; *RCT*; *Cities: Skylines* | Preview, orientation, commit, and cancel are distinct states. | Exact cell ghost; fixed current orientation; explicit confirm; Escape/right-click cancel with no mutation. |
| Legal/illegal reason | *Planet Zoo* support; *Parkitect* devlogs | A failure names the concrete dependency/recovery, not just a color. | TypeScript rejection code → concise reason + affected geometry + smallest correction. |
| Rotation/manipulation | *Two Point Hospital* official controls | Spatial manipulation needs pointer and keyboard parity. | No rotation until authoritative; later use explicit 90° commands with controller equivalents. Never contextless right-click sell. |
| Construction becoming operational | *RCT* tutorial | A build has prerequisites and a visible closed→operational boundary. | Under-construction site remains inspectable; completion swaps to facility and published capacity. |
| Layout as strategy | *Planet Zoo* facility/path guidance; *Parkitect* backstage precedent | Spatial choice matters when a visible flow or dependency follows from it. | Surface road access and scenery load-in distance only; defer general person/path optimization. |
| Move/demolish | *RCT* removal; *Two Point* manipulation | Destructive changes are contextual and consequences depend on state. | Exact selected facility, refund, lost capacity, holders/blockers, explicit named confirmation. |
| Attention/completion | *Planet Coaster* fanfare feed option; Package 02 | Nonessential notification must not seize play. | Reuse the current notify-class event, but adapt the present occluding browser notice into queued, non-occluding attention; no camera/workspace hijack. |
| Controller architecture | *Planet Coaster* customizable controller camera; *Two Point* keyboard manipulation | Every spatial verb has a named non-hover route. | Focusable catalog, reticle placement, nudge, confirm, cancel; color-independent status. |

## 4.1 What not to import

- *Planet Coaster*’s collision-off bypass would violate authoritative lot law.
- *Planet Zoo*’s path/work-zone/power simulation is not evidence that Project: Studio currently has those mechanics.
- *Parkitect*’s depot/crate/task routing would turn filmmaking into hauling.
- *Two Point*’s easy click-hold movement/right-click sale is unsafe under Package 02 Inspect mode.
- *Cities: Skylines* zoning, utilities, and automatic building levels are outside current authority.
- *RCT*’s freeform track construction is a different creation problem.

---

# 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Binding consequence |
|---|---|---|
| Sparse authored starting property | **ADOPT** | New campaigns use Gate + Administration + road + owned vacant parcels; no mature plant. |
| Ready-built alternative | **LATER** | Could be a player-selected start; never conflate with migrated saves. |
| Global Build toolbar | **ADOPT** | Creation is discoverable without first pixel-hunting vacant ground. |
| Vacant parcel **Build here** | **ADOPT** | World-native route opens the same catalog with origin context. |
| Yellow/red placement ghost | **ADAPT** | Keep immediate preview; add shape/icon/text and exact TypeScript reason. |
| One-click material placement | **ADAPT** | Catalog selection begins preview; a separate named `Build <facility>` commits after consequence review. |
| Local collider legality | **REJECT** | Unity collision may aid rendering/pointer feedback, never gameplay truth. |
| Arbitrary/free rotation | **REJECT NOW** | Current authority has fixed orientation. Add only with a save/query/schema extension. |
| Physical construction site | **ADOPT** | Site has stable identity, progress, due week, inspector, and state-derived activity. |
| Builder dragging | **REJECT** | No individual construction assignment or visual-worker-derived speed. |
| Builder capacity/workforce | **ADAPT / FULL-FLIP REQUIRED** | Owner direction already requires real Builders to construct visibly and affect speed. Current authority has no such system, so P09A may prove fixed-duration construction only as a non-sealing slice; full Flip needs a bounded TypeScript workforce extension, never client-inferred labor. |
| Routine facilities auto-build instantly | **REJECT** | Current authoritative build weeks remain meaningful. Sandbox may differ later. |
| Construction auto-pauses | **REJECT** | Completion is notify-class; decisions, not ordinary completions, pause. |
| Camera moves/open panel on completion | **REJECT** | Attention and explicit Locate follow Package 02. |
| Facility capacity/effect on catalog card | **ADOPT** | Every current blueprint already publishes an honest effect summary. |
| Generic ROI forecast | **REJECT** | No current authority supports it. Show exact cost/opex/capability, not invented payback. |
| In-place generic upgrade | **REJECT NOW** | Current tiers are separately placed facilities; highest effect tier wins. |
| Explicit Move | **ADOPT** | Reuse placement quote; original remains until successful commit; no ordinary drag. |
| Consequential Demolish | **ADOPT** | Use engagement authority, exact refund/lost capacity, protected landmarks, named confirmation. |
| Recurring facility decay/repair | **REJECT** | It scales clicks, not decisions. Leave current facilities decay-free. |
| Set condition/repair | **ADOPT current law** | Sets are separate resources with authoritative condition/repair. Do not generalize it. |
| General path editor/travel optimization | **LATER** | Preserve road/property seams; current general travel is not mechanical. |
| Road frontage / lot-severance legality | **ADOPT current law** | Surface exact rejections; do not let UI reinterpret them. |
| Scenery supplier→stage distance | **ADOPT current law** | It is the one current ground→time consequence; explain it in Stage/Set logistics, not every facility card. |
| Decorative-only blueprint flood | **REJECT NOW** | Current catalog law requires a real visible effect. Ornament/landscape authoring is a later lane. |
| Era/research/progression unlocks | **ADAPT/LATER** | Show only current requirements; build an authoritative progression campaign before broad locks. |
| Land market | **LATER** | Finite property and stable parcel IDs now; acquisition belongs after P09A. |

---

# 6. Founding Flip doctrine

## 6.1 Growth is filmmaking capacity made physical

The player does not build because a checklist says “place three buildings.” Each build answers a current studio problem:

- no Development & Casting capacity → build the baseline office;
- no place to shoot → build a Soundstage;
- no scenery throughput → build a Scenery Shop;
- no set that satisfies a picture → commission a Set on a Stage;
- wrapped pictures cannot finish → build Post capacity;
- too many simultaneous scripts/auditions → add shared Development & Casting capacity;
- first drafts need a stronger office standard → add the appropriate Development tier.

The selected need should point to **Open Build**, preselect or filter the appropriate category, and explain the effect. It must not place, purchase, or Focus automatically.

## 6.2 Founding regimes are explicit history

There are two legitimate studio origins:

- **Inherited/endowed:** every historical or migrated existing save keeps the mature plant and exact structure/facility/Set IDs it already owns.
- **Bare-lot:** only a genuinely new post-Flip campaign receives the sparse property and builds its core.

The mode must be explicit and persisted. “No soundstage exists” cannot mean “bare-lot,” because an inherited studio might later demolish its player-built plant. No presentation heuristic may select a migration regime.

## 6.3 Current implementation versus binding target

At baseline, `initialProperty()` still seeds the inherited mature lot; `activateStudioOperations()` still installs the inherited five-capability plant and endowed Sets; Save V14 has no founding discriminator. This is **current code**, not the mature product ruling.

The future implementation must add a new named sparse property definition and a versioned founding-regime path. It must leave `INITIAL_PROPERTY`, old validators/builders, inherited activation, and frozen migration equivalence untouched.

## 6.4 One combined office in V1

The accepted Campaign 2 charter rules that Casting remains merged with Development in V1 and that the from-scratch path uses one **Development & Casting Office** blueprint. On endowed lots, Package 03 and Package 04 can still address historical `writers` and `casting` bodies. On a sparse new lot, the completed placed facility’s exact stable ID is the world entity. It may expose Development and Casting context/actions according to current project state, but Unity must not invent duplicate `writers` or `casting` identities.

A future separate Casting capability/building is a deliberate simulation and migration decision, not a P09A presentation trick.

---

# 7. Day-1 property

## 7.1 Exact sparse-start contract

| Element | Day-1 state | Gameplay claim |
|---|---|---|
| Campaign time | Authored 1920 start under the existing campaign clock | No separate construction clock |
| Studio Gate | Present, permanent, selectable, unmoved, undemolishable | Applicant/arrival and Studio Home landmark per Package 02 |
| Administration / Staff Office | Present, permanent, selectable, unmoved, undemolishable | Founding/administrative owner; not a generic capacity facility |
| Frontage road | Present as authored property circulation | Placement road-frontage authority; no player road editor in P09A |
| Minimal access inside property | Only what the authored sparse property definition includes | Must not imply a generalized path-speed simulation |
| Property boundary | Visible at management/build scale | TypeScript-owned finite bounds |
| Vacant parcels | Owned, addressable, stable IDs, buildable/unbuildable state explicit | Candidate sites for authoritative placement queries |
| Minimal utilities | Visual boundary/service connections only | No power/water cost, capacity, outage, or placement rule |
| Cash/founding resources | Exact TypeScript-authored new-game value | Value must be measured and Owner-approved; this report invents none |
| Core operating facilities | None | No hidden endowed capacity |
| Sets | None | No endowed house Sets in bare-lot regime |
| Theater | None | Release remains venue-independent; optional facility later |

The initial camera uses the Package 02 Studio Home pose at the Gate, composed so the Administration landmark and enough vacant property are readable. It does not perform an automatic cinematic tour.

The bare property must not reuse the historical parcel ID `expansion`. That ID owns the legacy Annex ground reservation. P09A uses a new `front-lot` identity for the same measured rectangle if it carries the current geometry forward; inherited saves retain `expansion` and its contract. New history must not accidentally inherit a compatibility reservation.

## 7.2 Pre-founding and post-founding

The Gate/Admin founding experience stays authoritative. Before founding, Build is either unavailable with the exact reason **Found the studio first**, or absent if current read models cannot truthfully quote construction. After founding, the studio does not receive a mature plant; it receives the first operational need:

> **No Development & Casting capacity**
> Active development and auditions need an operational Development & Casting Office.
> `[Open Build]`

That is a blocker explanation, not a tutorial modal and not a purchase.

It also does not repeal the existing queue law. If the player deliberately opens screenplay commissioning before capacity exists, the legal action is **Queue for Development**, with the consequence **Waits until Development & Casting capacity is operational**. No cash, writer lock, screenplay project, or concept is committed while waiting under current authority. Because queue admission runs before placement completion in the weekly pipeline, an office completing on Week N can admit that queued request only on the next authoritative advance, not retroactively during Week N. P09A makes Build the primary next step while preserving that honest alternative.

---

# 8. Player-built versus prebuilt classification

| Function | Classification | Package 09 ruling |
|---|---|---|
| Gate | **PERMANENT LANDMARK / PREBUILT** | Stable Studio Home and arrival identity; never move/demolish. |
| Administration / Staff Office | **PERMANENT LANDMARK / PREBUILT** | Founding and company administration; never move/demolish. |
| Frontage road / starting boundary | **PREBUILT PROPERTY** | Required to make a coherent finite property; no player road construction now. |
| Development & Casting Office | **PLAYER-BUILT CORE** | First P09A facility; current merged V1 capability. |
| Development Annex/Hall and Office II/III | **PLAYER-BUILT EXPANSION/TIERS** | Additional capacity/effects after baseline; separately placed. |
| Talent/Stage School | **FUTURE SPECIALIZED** | Historical value, but no current authoritative talent-supply facility effect. Do not fabricate. |
| Crew Facility | **FUTURE SPECIALIZED** | Ordinary crew capacity/building system is deferred; no fake building. |
| Scenery Shop | **PLAYER-BUILT CORE** | Required for Set construction/repair/load-in capacity in a full bare-start movie path. |
| Soundstage | **PLAYER-BUILT CORE** | Production capacity and Set mount; not seeded. |
| Sets | **PLAYER-COMMISSIONED CORE CONTENT** | First-class Stage-mounted entities through the Set catalog, not ordinary facility placements. |
| Post Building | **PLAYER-BUILT CORE** | Finishing capacity; not seeded. |
| Craft Services Annex | **PLAYER-BUILT OPTIONAL** | Real freelancer-fee effect; not a required first-film building. |
| Screening/Premiere Theater | **ERA/PROGRESSION LATER** | Optional prestige/test/festival concept; not required or seeded. |
| Publicity | **FUTURE SPECIALIZED** | Build only when an authoritative publicity facility effect exists. |
| Research/technology | **FUTURE SPECIALIZED** | Requires an era/progression system; no decorative laboratory now. |
| Amenities / trailers / support | **FUTURE SPECIALIZED OR OPTIONAL** | Only when person/lot/economy laws support a consequence. |
| Annex | **PLAYER-BUILT EXPANSION** | Current proven capacity blueprint; not an initial structure. |
| Storage/logistics/utilities | **FUTURE SYSTEM** | Preserve ground/access seams; do not create manual hauling or fake utility law. |

---

# 9. Build-mode entry

Package 02’s rule is binding: **toolbar for creation; world for operation**.

## 9.1 Global route

- A persistent top-level **Build** command is available after the regime permits construction.
- Default rebindable keyboard command: `B` (final binding remains input-system owned).
- Controller: a named toolbar/command-wheel entry, not a cursor-only shortcut.
- Opening Build does not move the camera, clear valid selection, pause time, or select a blueprint automatically.
- In P09A it opens a same-lot **parcel chooser**, then the one retained catalog owner after a parcel is chosen. It never deep-unmounts the lot or invents a second free-roaming draft.
- The catalog opens with **Needed now** first when an authoritative journey/blocker identifies a need; otherwise its current allowed manifest.

## 9.2 World-native route

- At management/medium scale, a vacant parcel is a semantic target.
- Single-select opens its parcel inspector: ownership, buildability, known reservation, road-access summary, and **Build here**.
- **Build here** opens the exact same catalog and stores the parcel/world origin. In P09A the preview remains within that chosen parcel, matching the current browser authority/host; changing parcel means Back to the chooser or selecting another parcel, not silently roaming across ownership context.
- A blocker’s **Open Build** may preselect a category or blueprint, but it never commits.

## 9.3 Exit law

Escape/Back stays inside the same lot host and obeys Package 02:

1. close a destructive confirmation;
2. cancel the active placement/move draft, restoring the prior selection/camera;
3. close the catalog to the invoking parcel inspector/parcel chooser;
4. close that chooser/inspector to the exact prior lot selection/focus;
5. only then continue ordinary world Back behavior.

No Escape both cancels Build and opens Pause. Right-click may be a pointer Cancel in placement mode; it never demolishes or sells by itself.

---

# 10. Build catalog

## 10.1 Information architecture

The initial catalog is a 28–34% desktop side dock or a 40–48% narrow-viewport bottom sheet, with the lot continuously visible. It uses current Project: Studio identity and applicant-dossier readability, not a paper-white memo.

Order:

1. **Need / context header:** e.g. `FIRST PICTURE · Development capacity required`.
2. **Categories:** `Needed now`, `Development`, `Production`, `Post & Support`, `All facilities`; `Sets` is a separate Stage-aware catalog route.
3. **Search/filter:** only once catalog size warrants it; keyboard focus path reserved now.
4. **Cards:** one readable column in a narrow dock, two at wider retained-workspace width.
5. **Selected item detail:** expands in place; entering preview is explicit.

`Needed now` is a sorting/filter projection over genuinely available catalog entries. It must never create unlocks. The general product retains an **All facilities** route; the bounded P09A manifest below may show future rows locked but never hides a currently legal action by client heuristic.

## 10.2 Every facility card

Above the fold:

- facility name;
- one-sentence `effectSummary` from authority;
- status: `Available`, `Building`, `Owned N`, `Requirement unmet`, or `Instance limit reached`;
- capital cost;
- construction duration and completion week when a valid origin is known;
- weekly operating cost;
- footprint (`3 × 2`, etc.) and `Road access required` where true;
- capacity/effect in player language;
- one exact prerequisite or the highest-priority unmet requirement;
- primary action: **Preview** or disabled **Unavailable** with reason.

Under **Details**:

- full requirement list;
- current owned/building count and maximum if one exists;
- capability explanation;
- relationship to a tier/predecessor;
- all current authoritative effect copy.

Do not show hidden formulas, fake prestige, projected ROI, invented utility use, generic “quality,” or era labels not authored by TypeScript.

## 10.3 Current catalog truth

At baseline, `FACILITY_BLUEPRINTS` contains nine real entries: Development & Casting Annex; Hall; Office II; Office III; Craft Services Annex; Soundstage; Post Building; Scenery Shop; and baseline Development & Casting Office. The first five are expansion/effect entries; the last four close the from-scratch capability path. Office III currently requires Office II; other catalog availability is intentionally broad.

That broad current truth would let a sparse P09A client spend on a later facility before proving the founding office. The bounded manifest is therefore an **authoritative TypeScript extension**, not a Unity filter:

- before the first office is committed, `development-casting-office` is the only selectable row and is tagged **Needed now**;
- after it is committed but before operation, that row reads **Building** and does not offer a second founding-office purchase in P09A;
- the other eight current rows may remain visible under **Later facilities**, but are unavailable with the exact engine-published reason **Complete the founding Development & Casting Office**;
- once the office is operational, the founding phase is satisfied and the wider full-Flip catalog may use its real blueprint requirements.

The bridge must publish these availability/unmet facts. Unity may prioritize and render them; it may not fabricate this gate or hide a legal row locally.

---

# 11. Placement UX

## 11.1 Placement state machine

`Catalog → Previewing → Valid/Invalid → Commit pending → Accepted site OR Refused preview retained → Cancel`

Selecting a card enters preview; it does not spend. The preview is transient presentation state and never enters a save.

## 11.2 Ghost and footprint

- Render the facility’s authored footprint and clearance envelope at the current authoritative origin.
- Legal occupied cells use a neutral high-contrast outline plus check icon and `VALID SITE` text.
- Invalid cells use hatched/crossed geometry, an error icon, and exact reason; hue is supplementary.
- The future building may appear as a restrained translucent mass, but its exact cell footprint remains visible through it.
- Reserved roads, protected structures, property boundary, and conflicting placement cells receive localized emphasis only while relevant.
- Show one primary reason beside the ghost and all ordered reasons under **Why not here?**.
- Do not glow every building or show every parcel label simultaneously.

## 11.3 Movement, snapping, and rotation

- Pointer moves the origin on the TypeScript property grid.
- Keyboard/controller nudges one grid cell in four directions; holding may repeat at an accessible rate.
- Camera pan/orbit/zoom remains available through gestures/buttons that cannot be mistaken for a placement click.
- Current footprints are axis-aligned and carry no orientation. P09A displays `Fixed orientation`; there is no `Rotate` affordance.
- A later rotation feature is limited to authored 90° states and must be represented in the placement request, quote, persisted facility, migration, bridge schema, and Unity DTO. Renderer-only rotation is forbidden.

## 11.4 Quote and consequence strip

While previewing, the retained strip shows:

- exact facility;
- `Valid site` or the primary invalid reason;
- capital cost;
- authoritative completion week / duration;
- weekly operating cost once operational;
- capacity/effect gained;
- `Build <facility>` only when the latest quote is valid;
- **Cancel** always.

The cash display may show `Cash after build` only if a player-safe TypeScript projection supplies it. Unity does not subtract locally and call that affordability truth.

## 11.5 Commit and stale refusal

- Confirm submits blueprint ID plus exact origin through the current authoritative intent.
- TypeScript re-runs every placement rule and affordability check.
- Success creates one site with its committed identity, debit, placed week, and due week.
- Refusal mutates nothing, keeps the draft and camera, repaints current quote/reasons, and focuses the reason text.
- Never silently choose a nearby valid cell, smaller blueprint, same-name parcel, or fallback facility.

## 11.6 Ordered legality

The current authority evaluates: unknown blueprint; off lot; not owned; unbuildable terrain; reserved ground; occupied; clearance ring; no road access; severs lot; requirements unmet; instance limit; insufficient funds. Geometry/domain reasons outrank money. Presentation must preserve that order; it may not lead with affordability when the chosen site is illegal.

---

# 12. Construction time and Builders

## 12.1 Current truth

- Every committed facility records `placedWeek` and `completesWeek`.
- All due placements complete from the authoritative tick; no separate construction clock exists.
- There is no global construction slot, queue, named Builder profession, workforce allocation, or speed-up action.
- All valid construction projects can currently proceed concurrently.
- Capital is charged at commit.
- Weekly facility operating cost starts only after the facility is operational under the current tick ordering.

The UI must say only those things.

## 12.2 Builder ruling

For **P09A only**, the original’s Builder fantasy survives as presentation:

- a small anonymous construction crew may appear at each active site;
- one service/delivery vehicle may acknowledge a site where current world presentation supports it;
- crew count and animation state do not affect completion;
- workers are not selectable managed people and have no fabricated identity, assignment, wage, or availability;
- their absence due to LOD/presentation never means the build is blocked.

That is not the final Founding Flip law. The existing Owner directive requires real Builders physically constructing the studio and affecting build speed. The full Flip therefore needs a bounded authoritative extension after P09A:

- Builders are real managed employees hired through the normal Gate/Administration employment law.
- TypeScript owns their profession, availability, site assignment, weekly work contribution, cost, completion forecast, and persistence.
- Active sites receive Builders autonomously by a deterministic default policy; the player manages **site priority or an explicit team assignment**, not repeated drag-and-drop carrying.
- A selected site shows assigned/available Builder capacity and the resulting authoritative forecast. Zero effective labor becomes an explicit `No Builders assigned` blocker only after that law exists.
- Unity places only the named Builders that authority assigns/publishes; animation, distance, and LOD never calculate progress.
- Completing/cancelling/demolishing a site releases its assignments authoritatively; multiple sites expose the opportunity cost rather than inventing a hidden queue.

The exact speed formula and staffing numbers are tuning work, not Package 09 fiction. “Drag five builders here” remains rejected. Until the extension lands, fixed current durations and anonymous visual workers are the only honest behavior—and the build cannot be called the complete Founding Flip.

## 12.3 Progress

Show:

- `Under construction`;
- elapsed and remaining authoritative weeks;
- due week;
- a progress bar only as an honest interpolation of `(currentWeek - placedWeek) / (completesWeek - placedWeek)`;
- no invented excavation/frame/fit-out simulation phase.

Presentation may use three visual bands (foundation, frame, enclosure) derived deterministically from that ratio, labelled only as construction progress—not gameplay phases.

---

# 13. Construction spectacle

## Required V1 world contract

Immediately after accepted commit:

- vacant ground becomes a graded/marked site at the exact footprint;
- the transient draft becomes selection of that exact numeric placement/site; the camera does not move or Focus;
- boundary fencing/hoarding and a readable project board appear;
- construction materials and scaffolding provide scale;
- anonymous activity makes the site visibly non-idle;
- the future mass rises or encloses over time from the projected progress ratio;
- the selected site inspector names the future facility and due week;
- management zoom shows a site boundary/status token without requiring close inspection.

At completion:

- site dressing retires;
- the operational facility body replaces it at the same exact identity/footprint;
- its operational light/activity state becomes available;
- one restrained completion cue and attention entry appear.

## Follow-up polish

- more varied worker loops;
- delivery punctuation;
- era-specific scaffolding, vehicles, materials, and hoardings;
- localized sound layers.

## Do not do

- procedural construction simulation;
- physics-derived completion;
- fake stalls because no worker is visible;
- massive celebration for every completion;
- one 1948 construction kit across 1920–2040.

---

# 14. Building completion

Construction completion is an existing `constructionCompleted` authoritative event and a **Living Turn notify-class** event. It does not auto-pause. That law survives.

Exact response:

1. On the first current snapshot where status is operational, replace site presentation atomically.
2. Preserve stable selection: if the site was selected, the same placement/facility context becomes the completed facility inspector; do not clear it and force re-selection.
3. Update the catalog’s owned/building counts and published capacity/effect from the same snapshot.
4. Add a non-blocking attention line: `<Facility> is operational.`
5. Play at most the existing restrained completion punctuation, respecting reduced motion/audio settings.
6. Do not move the camera, Focus, open a workspace, pause time, or auto-start work.
7. Offer explicit **Focus**/**Open <department>** where applicable.

If completion occurred while another workspace was open, queue the attention item; do not cover or eject the current work.

---

# 15. Capacity and “why build this?”

Every blueprint must answer its business effect in the catalog and completed inspector. Current truthful examples are already authored:

| Facility | Honest reason to build |
|---|---|
| Development & Casting Office | Adds two shared slots; enables first screenplay/audition capability on a bare lot. |
| Development & Casting Annex | Adds one more shared screenplay/audition slot. |
| Development & Casting Hall | Adds two more shared screenplay/audition slots. |
| Development Office II | Raises first-draft estimated strength by 4; richer original scripts take one additional week. |
| Development Office III | Replaces Office II’s effect with +9; richer original scripts take two additional weeks. |
| Craft Services Annex | Reduces one-film freelancer fees by 15%. |
| Soundstage | Adds one simultaneous shooting location; a Set must stand on it. |
| Scenery Shop | Adds two scenery crews for Set construction, repair, or load-in. |
| Post Building | Adds two cutting-room/Post slots. |

The interface may add a current bottleneck sentence only from a TypeScript-safe read model, such as `1 picture waiting for Post`. It cannot infer utilization from nearby people or invent a throughput forecast.

---

# 16. Facility tiers and upgrades

Current Project: Studio uses **additional placed facilities**, not a universal in-place upgrade verb.

- Development Office II and III are separate stable buildings.
- Office III requires an operational Office II.
- The highest office effect wins; +9 replaces +4 rather than stacking to +13.
- The lower-tier body and its weekly operating cost remain unless the player later moves or demolishes it legally.
- Capacity Annex/Hall buildings stack because their effects genuinely stack.
- Soundstage, Post, and Scenery expand through additional instances.

Therefore:

- The catalog uses **Requires Development Office II** and `Replaces its +4 office effect with +9`; it does not say `Upgrade existing building`.
- A future in-place renovation needs its own authoritative downtime, cost, identity, reservation, migration, and cancellation law. It is not a visual shortcut.
- Existing facility IDs remain immutable across presentation skins/era changes.

---

# 17. Move

Move is an explicit selected-facility tool, never ordinary dragging.

1. Select a player-built placement.
2. Inspector shows **Move** only when the TypeScript mutation read model allows it.
3. Opening Move preserves the original building and its current status/timing at the original footprint.
4. A second ghost uses the same authoritative placement query, excluding only the mover’s own footprint.
5. The consequence strip states current move cost (currently zero), no new capacity, and unchanged due/operational status.
6. Confirm revalidates. Success changes location while preserving placement ID, facility ID, project ID, construction status, and clock.
7. Refusal leaves the original untouched and retains the preview with exact reason.
8. Cancel returns to the original inspector/camera with no mutation.

An engaged facility fails closed and names every current holder supplied by the shared engagement authority. There is no override.

---

# 18. Demolish

Demolish is materially destructive and requires a consequence sheet.

Header: `Demolish <exact facility name>?`

Above the confirm action:

- exact stable facility and footprint;
- operational or under-construction state;
- authoritative refund (current facility law: 50% of committed capex);
- lost capacity/effect;
- any construction weeks already spent and written off;
- all current holders/blockers, with project/person names where safe read models supply them;
- protected/founding status;
- statement that the placement/facility is removed and its numeric placement ID is never reused; derived string IDs continue to follow the existing taken-ID/collision law rather than a broader UI promise.

Buttons:

- destructive: `Demolish <name> · refund <amount>`;
- safe: `Keep <name>`.

Gate, Administration, historical/founding structures, and otherwise protected placements have no material confirm button. Engaged facilities are refused without an override. Under current law, removing an under-construction site is still **Demolish construction site**, not a separate free `Cancel`; it uses the same refund/write-off rules.

---

# 19. Repair and maintenance

## Current authoritative split

- Generic facilities have no condition, decay, maintenance job, or repair action.
- Sets have authoritative condition, wear, unusable threshold, repair cost/time, and Set-specific intents.

## Ruling

- **REJECT** routine facility decay and manual maintenance in P09A.
- **LEAVE ALONE** `src/core/sets.ts` Set repair; surface it from the selected Set/Stage under the accepted Package 05 contract.
- **LATER** consider policy/budget-based routine maintenance or rare material facility failures only if they produce strategic tradeoffs.
- Never add animated damage, a Repair button, or a Builder task that implies nonexistent authority.

The Superstar-era evidence is decisive: the world should look maintained, but scale should reduce repetition rather than multiply repair clicks.

---

# 20. Paths, roads, and lot layout

## Currently mechanical

- finite property bounds and parcel ownership;
- buildable/unbuildable terrain;
- authored road rectangles;
- required road frontage for current blueprints;
- occupied/clearance/reserved-ground checks;
- a lot-severance rule;
- scenery supplier→Stage Manhattan distance affecting authoritative load-in time (bounded 1–5 weeks).

## Presentation-only today

- ordinary named-person walking distance and visual paths;
- most staff/building adjacency;
- decorative service traffic;
- minimal utility connections;
- prestige frontage/noise/privacy.

## High-value future

- authored path/road placement tied to real navigation and access;
- stage service lanes and congestion;
- staff travel consequence where the simulation publishes travel time;
- storage/logistics distance beyond the current scenery seam;
- public-front/backstage separation.

## Rejected complexity

- manual truck driving;
- individual crate/equipment routing;
- pixel-perfect path paving as a prerequisite for every employee action;
- hidden adjacency bonuses;
- utility networks that exist only in Unity.

P09A keeps the starting roads authored and deliberately uses the current parcel-level `roadFrontage` projection: the selected parcel/quote shows **Road served** or **No road access**, while the footprint remains exact. Unity does not reconstruct road rectangles from art or claim which frontage cell satisfied the rule. Exact road-geometry projection belongs with a later road/property visualization need. P09A does not let the player edit the road network.

---

# 21. Sets

Sets use a separate authoritative model and must remain separate from facility placement.

- A Soundstage is a physical capacity facility.
- A Set is a first-class named entity mounted on a specific Stage.
- The current Set catalog has 12 blueprints with capital cost, construction duration band, quality, novelty, condition, set type, and genre data.
- Set construction/repair consumes Scenery Shop capacity; standing Sets occupy Stage mounts.
- A production needs both Stage and Set truth.

Design allocation:

- Global Build may include a visible **Sets** category that explains `Select a Soundstage to mount a Set`.
- The primary route is selected Stage → **Commission Set** → dedicated Set catalog filtered to legal mounts.
- Set preview highlights the chosen Stage/mount, not arbitrary free lot ground.
- `Strike Set` is the Set’s own destructive verb with its own refund/engagement law.

P09A does not build this UI. It preserves the distinction so the first facility slice cannot hard-code every buildable object as a `PlacedFacility`.

---

# 22. Soundstages

A Soundstage card/preview must expose only current facts:

- footprint: 4×4;
- road access and clearance requirement;
- capital cost and 16-week current build duration;
- weekly operating cost;
- `+1 simultaneous picture shooting capacity`;
- `A Set must be mounted before filming can occur`;
- numbered instance identity assigned by authority after commit.

The selected completed Stage links to its mounted Set, occupying production, reservations, readiness, and the accepted Package 05 inspector contract over `operations.ts` / `sets.ts`. A Stage is not a Set and not a Production. Future Stage classes may add different authored footprints/capabilities; P09A must not bake one prefab/size into generic construction law.

---

# 23. Progression and unlocks

The current schema can represent requirements for date, facility, structure, rank, certificate, award, research, and land zone. At baseline only a small subset is genuinely attainable/used; notably Office III requires Office II, while the four from-scratch core entries have empty requirements. Unimplemented requirement kinds fail closed.

The V1 law is:

- show all genuinely available entries;
- prioritize the current need;
- show locked entries only when the authoritative catalog publishes the exact requirement and a meaningful route exists;
- never invent a year, Standing, research, or award lock in Unity;
- never treat Package 08 Studio Standing as Studio Progression without a separate ruling;
- never reveal the whole future 2040 art catalog merely because a presentation asset exists.

Era/research progression is high-value follow-up. It should add declarative TypeScript requirements and era-authored blueprint/presentation variants while preserving the same build grammar.

---

# 24. First-hour physical growth

This is a **milestone budget**, not a tuning promise in minutes.

| Beat | Player understanding | World response | Scope |
|---|---|---|---|
| 1. Arrive/found | `This is my property; Gate/Admin are my only institutions.` | Sparse land, property boundary, Gate applicants, Administration founding | Existing interaction spine + Flip |
| 2. First bottleneck | `We cannot develop a movie without Development & Casting capacity.` | Administration/journey attention names missing capability; no memo purchase | P09A |
| 3. First capital decision | `This office costs cash/time/opex and enables two slots.` | Build catalog and exact preview | P09A |
| 4. Construction | `The studio is becoming capable while time passes.` | Persistent site, activity, due week, ordinary lot remains playable | P09A |
| 5. First capability | `Development is operational; I can commission a script.` | Completion notice, operational body, authoritative screenplay commission route | P09A end |
| 6. Parallel preparation | `The screenplay can be written while later infrastructure rises.` | Later Build needs: Scenery, Stage, Set, Post | **Required full-Flip acceptance after P09A** |
| 7. Casting | `The same V1 department now owns auditions.` | Authoritative casting-session context on the exact combined office | Required full-Flip acceptance after P09A |
| 8. Production core | `A Stage is capacity; a Set is what we shoot on; Scenery supplies it.` | Construction and Set commissioning | Required full-Flip acceptance after P09A |
| 9. Finish | `Post capacity completes the first-film chain.` | Authoritative operations/Post owner becomes available | Required full-Flip acceptance after P09A |

The tutorial reveals one real problem, lets the player use the resulting capability, then reveals the next. It never asks for a building that current simulation does not use.

---

# 25. Financial consequence presentation

Before commit, the player must see in one place:

- current cash;
- capital paid now;
- cash after commitment if TypeScript publishes it;
- construction duration and completion week;
- weekly operating cost after operation;
- exact capacity/effect gained;
- current need/bottleneck it addresses;
- affordability refusal if present.

Do not display:

- fabricated ROI/payback period;
- projected film revenue;
- “safe to spend” advice not supported by runway truth;
- operating cost hidden in a tooltip;
- costs split across three screens.

Current `INITIAL_CASH` is $20M, but the Founding Flip’s opening balance is deliberately unresolved. Existing economy work warns that core capex, payroll/overhead dead burn, facility opex, and first-picture exposure interact materially. P09A requires measurement and Owner approval of the starting-funding/build-pacing envelope; this report does not turn a current compatibility constant into mature balance law.

---

# 26. Construction blockers

## 26.1 Placement blockers

| Authoritative code | Player-facing headline | Smallest useful response |
|---|---|---|
| `unknownBlueprint` | `This facility is no longer available.` | Return to refreshed catalog; never substitute. |
| `offLot` | `Outside the studio property.` | Move the full footprint inside the visible boundary. |
| `notOwned` | `This ground is not owned.` | Move to owned ground; land purchase is Later. |
| `terrainUnbuildable` | `This parcel cannot support construction.` | Use buildable ground. |
| `groundReserved` | `Reserved ground: <authoritative purpose>.` | Locate/show reserved cells; choose another site. |
| `occupied` | `Overlaps <named structure/facility when published>.` | Highlight overlap and reposition. |
| `clearanceRing` | `Needs clearance from a neighboring facility.` | Show required envelope and reposition. |
| `noRoadAccess` | `Construction needs road access.` | Highlight frontage requirement and road-served parcels. No fake road-build remedy. |
| `seversLot` | `This site would cut off lot circulation.` | Highlight severed route/perimeter and reposition. |
| `requirementsUnmet` | `Requirement not met: <exact requirement>.` | Show all unmet requirements and an exact route only if one exists. |
| `instanceLimit` | `The studio already owns the allowed number.` | Locate existing instance(s); no override. |
| `insufficientFunds` | `The studio cannot cover <cost> this week.` | Show current cash/cost; return to catalog/finance route. |

## 26.2 Construction underway

Current generic facility construction does not stall for missing workers, materials, later cash, or a second queue slot. A site therefore shows **Under construction**, not **Blocked**, unless future TypeScript adds a blocker. UI must not infer a stall from animations.

## 26.3 Move/demolish blockers

Use the one `facilityEngagements()` authority. Possible holders include a production, shooting task, screenplay, casting session, Set, or defensive legacy project. The consequence surface names subject, activity, and holder and offers **Open/Locate** where a current anchor exists. There is never `Demolish anyway`.

---

# 27. Multiple construction projects

Current TypeScript supports multiple simultaneous placements and no global construction cap. The presentation must therefore be N-site from its first generic implementation even if P09A’s test journey builds one facility.

- each site has a stable placement/facility/project identity;
- each renders and progresses independently;
- management zoom shows one compact label per selected/alerted site and an aggregate `N builds active` HUD pulse;
- a future Construction portfolio is earned only when multiple sites create navigation cost;
- completion notices group same-week completions without losing exact links;
- no single Unity `constructionRoot` may stand in for the whole system;
- P09A implies no queue order or Builder allocation; full-Flip presentation consumes the later authoritative assignment/priority projection without changing the N-site identity law.

---

# 28. Land-expansion boundary

Land acquisition is **LATER (Package 10 or a dedicated follow-up)**.

Architecture requirements now:

- starting property is finite and visibly bounded;
- parcels have stable immutable IDs;
- placement reads property state rather than hard-coded scene bounds;
- Unity renders ownership/bounds from projection;
- construction IDs do not depend on fixed coordinates;
- future parcels/roads can enlarge `PropertyState` without rewriting placement semantics;
- no current card promises purchase price, zoning, or expansion unlock.

P09A proves building on owned starting ground only.

---

# 29. Save and migration law

This is the highest-risk part of the Founding Flip.

## 29.1 Immutable anchor

`INITIAL_PROPERTY` is V12→V13 historical migration authority. It must not be edited, renamed into the bare lot, or reused conditionally. The live V1→V14 path preserves or reconstructs the inherited plant at its historical boundaries; specifically, V12→V13 synthesizes the property, while V13→V14 adds V14 roots and two endowed house Sets for managed saves. Those facts remain true forever for that history.

## 29.2 SaveFileV15 regime contract

Use the accepted Campaign 2 vocabulary exactly:

```text
foundingRegime: 'endowed' | 'bare-lot'
```

This is one top-level immutable `GameStateV15` / `SaveFileV15` root, written once and never re-derived. `convertV14ToV15` validates V14, appends `foundingRegime: 'endowed'`, and changes nothing else: no property rewrite, plant, Set, capex, ID, event, RNG draw, or replay. Every V1–V13 save traverses its frozen historical migrations through V14 and receives the same `endowed` label only at V15.

New post-Flip worlds write `bare-lot` at creation and use a separate sparse property constant. Every V1–V14 validator rejects the V15-only key. The V15 validator exact-key-checks the enum and threads it into property/operations/construction/placement/Set invariants. A `bare-lot` save fails closed if projected/downgraded to V14 even when its current collections happen to look empty; older schemas cannot represent that history. An `endowed` downgrade is permitted only when every existing frozen projection guard also passes.

Do not infer regime from property emptiness, facility count, absence of a Stage, current art, or whether the player later demolished something.

## 29.3 Exact bare-lot activation fixture

Before founding, retain the current legacy-empty operational roots and the new sparse property. The accepted founding action still closes the roster draft and activates the studio atomically, but branches on `foundingRegime`. Its `bare-lot` result is:

```text
operations         = { mode:'managed', facilities:[], workflows:[] }
construction       = { mode:'managed', parcels:[], projects:[] }
placement          = { mode:'managed', nextPlacementId:1, facilities:[] }
scriptDevelopment  = { mode:'managed', projects:[] }
castingSessions    = { mode:'managed', sessions:[] }
sets               = []
nextSetId           = 0
productionQueue    = []
originalScreenplays= { nextOrdinal:0, blueprints:[] }
studioEvents       = { nextSeq:0, rows:[] }
property            = a deep copy of the separately authored sparse property
```

No hidden operation, capacity, legacy Annex parcel/project, placement, Set, capex, reservation, workflow, screenplay, casting session, or history row is minted. Bare-lot invariant policy derives operations only from operational placements and permits zero of the four core capabilities. The existing endowed activation arm and historical `placement-v12`/construction policies remain unchanged.

The first generic placement begins at `nextPlacementId: 1`. Commit reserves against existing operation/placement/ledger/construction/production identities, derives facility/project IDs through the current collision law, then increments. Demolition never rewinds the counter and migration never renames an identity.

## 29.4 Existing-save contract

- Existing current saves keep exact property structures, placement IDs, facility IDs, Set IDs, ledger entries, reservations, construction clocks, moved coordinates, and demolitions.
- A currently under-construction site resumes from its persisted weeks; it does not replay commit or restart completion animation as a new event.
- The legacy `expansion` parcel/reservation remains historical. A bare property uses its own parcel identity and receives no implicit Annex-only ground.
- `nextPlacementId` never rewinds after demolition.
- Migrated pre-property saves continue to receive the historical `INITIAL_PROPERTY` result.
- Founding structures and grandfathered plant do not silently become ordinary player-built demolition targets.
- Sparse new saves never receive endowed house Sets or hidden capacity.

The Annex contains the explicit compatibility matrix and hostile journeys.

---

# 30. Era safety: 1920 → 2040

The interaction law remains stable while presentation evolves.

Keep stable:

- catalog/preview/commit/cancel grammar;
- exact property/facility identity;
- cost/time/capacity hierarchy;
- selection and inspector contract;
- construction progress/state labels;
- migration and authority boundary.

Make era-governed later:

- blueprint availability and technology requirements;
- facility names where localization/history calls for it;
- building skins/façades/equipment;
- site materials, tools, vehicles, clothing, and sound;
- Stage/Post/Scenery visual technology;
- iconography that depicts media/equipment.

Do not hard-code film reels, one camera rig, 1948 copy, one architectural style, or a permanent construction truck into semantic UI. A 1920 office and a 2035 virtual-production building may share the same placement contract without sharing an asset.

---

# 31. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

## REQUIRED NEXT — P09A only

- New explicit sparse-start founding regime and separate property definition, preserving `INITIAL_PROPERTY`.
- Gate/Admin/frontage road/owned vacant parcel Day-1 world.
- First Film Journey state: missing Development & Casting capacity → Open Build.
- Versioned parameterized placement quote request/response and `place facility` mutation command for the current baseline Development & Casting Office; both revision-checked, with server-side `queryPlacement` revalidation on commit.
- One retained catalog and one placement draft owner.
- Exact authoritative ghost, ordered refusal copy, explicit commit/cancel, stale refusal retention.
- Projection-driven construction site and completed-facility handoff for arbitrary stable placement identity.
- Existing Living Turn notify-class completion event and data, adapted from the current occluding overlay into non-occluding queued attention; Package 02 camera/Back laws.
- New sparse, existing current, and historical migrated save regression fixtures.
- Owner-approved measured starting-cash/build-pacing envelope.

## FOLLOW-UP

- Authoritative Builder workforce/capacity required for the full-Flip seal: managed people, site assignment/priority, weekly work contribution, blocker/forecast, persistence, and world projection.
- Full first-film infrastructure curve: Scenery Shop, Soundstage, first Set, Post.
- Generic Unity move/demolish and multi-site management presentation.
- Set catalog/Stage mount construction surface.
- Catalog search/favorites only after measured catalog size justifies them.
- 90-degree rotation as a TypeScript/save/schema feature if placement variety needs it.
- Additional era-aware facility art and site spectacle.
- Honest current-bottleneck projection and construction portfolio for multiple sites.

## LATER

- Land acquisition/property expansion.
- Era/research/Studio Progression unlock campaign.
- Optional Screening Theater/Premiere House.
- Talent school, Crew facility, Publicity, Research, amenities, storage/logistics only with real systems.
- Renovation/in-place upgrade, road/path editor, and general travel consequence.
- Landscaping/ornaments/lot prestige and optional ready-built/Sandbox starts.
- Rare strategic facility failures/policy maintenance, if ever justified.

## DO NOT DO

- Edit `INITIAL_PROPERTY` into the sparse template.
- Reinterpret existing/migrated saves as sparse.
- Remove mature structures without removing/reconciling their facility/Set authority.
- Rebuild placement legality, price, duration, completion, capacity, or migration in Unity.
- Hand-edit generated C# bridge DTOs.
- Treat the legacy `startConstruction` Annex intent as generic build.
- Ship a singular fixed Unity construction site as the generic system.
- Invent Builder speed, assignments, construction queues, stalls, rotation, utilities, path travel, maintenance, or unlocks in Unity or before the authoritative Builder extension exists.
- Auto-move the camera, auto-open a workspace, or auto-start department work on completion.
- Make selection/drag move a facility in Inspect mode.
- Offer contextless right-click demolition or `Demolish anyway`.
- Collapse Stage, Set, and Production into one identity.
- Build a decorative facility with no truthful effect merely to fill the lot.

---

# Source register

## Primary historical

- [*The Movies* official manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), especially printed pp. 4, 8, 10–12, 17, 20–23.
- *The Movies: Prima Official eGuide*, local developer-reviewed copy; Internet Archive record: [The Movies Prima Official eGuide](https://archive.org/details/The_Movies_Prima_Official_eGuide), especially “Builders,” “Buildings and Ornaments,” “Sets and Movie Production,” “Technology and Research Packs,” and “Sandbox Mode.”
- [*The Movies: Stunts & Effects* official manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041).

## Secondary historical

- [Macinplay — *The Movies: Superstar Edition*](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), especially the facilities/maintenance discussion and “Mikromanagement, das auch mal nervt.”

## Modern comparator sources

- [RollerCoaster Tycoon official manual](https://cdn.akamai.steamstatic.com/steam/apps/285310/manuals/rollercoaster_tycoon.pdf), printed pp. 8–16.
- [Cities: Skylines official user manual](https://cdn.akamai.steamstatic.com/steam/apps/255710/manuals/CitiesSkylines-UserManual_EN.pdf), “Building your City / Roads,” “Milestones and unlocking,” and “Upgrading Buildings.”
- [Planet Coaster Spring Update 1.2 changelog](https://store.steampowered.com/news/posts/?appids=493340&enddate=1492011132), “No Collision Toggle,” controller camera, feed, and browser improvements.
- [Planet Zoo support — unavailable Workshop blueprint prerequisite](https://customersupport.frontier.co.uk/hc/en-us/articles/360011880360-I-cannot-place-a-Blueprint-that-I-downloaded-from-from-the-Steam-Workshop).
- [Planet Zoo official Beginner’s Guide — Building Your Zoo](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo), especially Paths, Power, and Keeper Hut capacity/distance.
- [Parkitect developer log archive](https://www.texelraptor.com/Blog/page:68), Updates 1–3.
- [Two Point Hospital — Getting Started](https://support.sega.com/hc/en-gb/articles/360000328457-Getting-Started), “Hot tips for Hogsport” spatial controls.
- [Game Dev Tycoon official overview](https://www.greenheartgames.com/app/game-dev-tycoon/), sparse start and company expansion.

## Project: Studio authority

- `THE-MOVIES-PARITY-MASTER-PLAN.md`, especially §6.
- `CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md`, especially §§3.4, 18, and 20.
- `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md`.
- `docs/c2-planning/00C-OWNER-CONSOLIDATED-RULINGS-2026-08-18.md`.
- `docs/c2-planning/04-founding-flip-audit.md`.
- `docs/c2-planning/05-save-migration.md` (planning evidence, not shipping V14 law).
- `docs/c2-planning/10-economy-remeasure.md`.
- Current TypeScript, browser, bridge, and Unity paths enumerated in the Builder Annex.

---

# Final Project: Studio ruling

**ADOPT the original fantasy, ADAPT its construction grammar, REJECT its labor chores.** The player begins with a real piece of land and two institutions, builds the first capability because filmmaking demands it, sees every capital decision occupy ground and time, and can operate the result directly from the lot. The sparse start is new authored history; the mature lot remains valid historical history. The next proof is one office, one construction site, one capability handoff—not a construction megacampaign—and it is explicitly a non-sealing step toward, not a substitute for, the full Founding Flip gate.
