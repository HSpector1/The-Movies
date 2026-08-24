# CODEX World-First Interaction Blueprint 01

**Status:** decision-ready design research; no implementation authority

**Research base:** canonical `main` at `c902a704eb948cc576083d0973c8c23e59937dc1`

**Evidence branch:** `codex/world-first-interaction-research-01`

**Recommended next slice:** **CP9 — Gate-to-Founding World Interaction V1**

## Decision

The Owner's finding is correct and must be treated as an interaction-architecture failure, not a
polish issue:

> **The white memo is currently the game. The professional-looking lot is scenery behind it.**

Project: Studio should make the lot the default place where the player discovers demand, selects a
person or facility, begins a simple action, and sees its consequence. It should keep proper
workspaces for comparisons, finance, casting packages, portfolios, and other high-dimensional
decisions. The target is **world-first, not world-only**.

The immediate answer is not to rebuild every system or imitate the original game's literal
drag-and-drop. CP9 should prove one complete grammar at the opening boundary:

```text
SEE APPLICANTS AT THE GATE
→ CLICK A PERSON
→ REVIEW A COMPACT OFFER
→ DELIBERATELY SIGN
→ SEE THEM ENTER THE STUDIO
→ CLICK ADMINISTRATION
→ FOUND THE STUDIO
```

The same grammar can then extend to Development, Casting, stages, and Production in later slices.

### Why the current memo became dominant

This is partly a protocol-shape problem. Current bridge founding options expose an opaque
`intentId`, `kind`, `label`, and prose `detail`; the server keeps the actual `talentId` inside the
state-bound action (`bridge/schema/bridge-schema.ts:499-511`, `bridge/session.ts:348-435`). One
candidate's detail is a paragraph containing OVR, potential, work ethic, strengths, concern,
salary, bonus, obligation, payroll, fund, and runway. Unity can safely display that paragraph, but
cannot safely bind it to a visible person without a TypeScript-produced presentation join. CP9
therefore needs a **structured, read-only founding-arrival projection keyed to the existing opaque
intent**, not Unity-side parsing or a second hiring simulation.

There is also a product-flow leak to remove: Core founding closes at 3 Actors / 1 Director / 1
Writer / 1 Production-Craft Lead, but the current bridge withholds `foundStudio` until a **fourth
Actor** is signed solely to make its automated two-picture proof convenient
(`bridge/session.ts:381-425`). A proof-harness reserve is not a player-facing founding law. CP9
should expose founding at the Core minimum; automation can deliberately sign its extra Actor.

## A. Original *The Movies* interaction reconstruction

The reconstruction below separates verified behavior from inference. Source codes are listed at
the end.

| Original behavior | Reconstruction | Confidence |
|---|---|---|
| Opening lot | Standard January 1920 play starts on an otherwise sparse/vacant lot with the **Staff Office already built beside the gate**. Core production buildings and sets are built by the player. A separate ready-built-lot option existed, so screenshots of developed starts do not overturn the standard tutorial evidence. | **High** — `[TM-MAN]` pp. 4-6; `[TM-PRIMA]`; `[TM-BIBLE]` §30 |
| First lesson | A physical queue forms outside the Staff Office. The tutorial teaches click-hold applicant → drop into the building → choose Builder/Janitor. Builders then visibly construct the next facilities. | **High** — `[TM-MAN]` pp. 5-6; Owner Jan 1920 capture in `[TM-SR]` |
| Talent hiring | After the player builds a Stage School, actors, directors, and extras queue outside it. Applicants can be inspected before hire; the Stage School exposes unusually rich genre, appearance, and personality information. | **High** — `[TM-MAN]` pp. 5, 18; `[TM-PRIMA]`; Owner capture |
| Writers and crew | In ordinary play, writers queue at a built Script Office and are dropped into a genre room; that single action hires the writer and starts/accelerates a script. Crew are hired through a built Crew Facility. The tutorial itself can provide book-shaped scripts at the gate, so “tutorial script” and “ordinary Script Office supply” must not be conflated. | **High** — `[TM-MAN]` pp. 6, 16-18; `[TM-PRIMA]` |
| Buildings as controls | Clicking a facility revealed its operational anchors: Staff Office roles; Script Office genre rooms; Casting Office's Begin Casting/Director/Lead Roles/Crew/Extras/Shoot It; Production Office's Finance/Reviews/Archive/Movie Player/Release. | **High on functions** — `[TM-MAN]` pp. 10-12, 16-17; `[TM-PRIMA]` |
| Floorplan versus radial | The manual says walls lower to reveal rooms. Owner captures show radial-like wedges over the footprint with the same room names. They are clearly world-anchored controls, but whether these were two views of one system is unresolved. | **Medium on equivalence** — `[TM-BIBLE]` §2 |
| Script → casting → shoot | The player moves a finished script to Begin Casting, assigns director and leads, then commits Shoot It. Cast and crew physically travel to required sets, where filming is visible. Unavailable, occupied, or damaged sets block the route. | **High** — `[TM-MAN]` pp. 6, 12; `[TM-PRIMA]` |
| Crew/extras | Manual text permits explicit placement, while contemporary guides and tutorial evidence say available Crew auto-fill; Extras evidence is mixed. The safest reconstruction is automatic fill with visible quotas and optional replacement. | **Medium / discrepancy recorded** — `[TM-MAN]`; `[TM-PRIMA]`; `[TM-GS]` |
| Release | A finished movie travels to the Production Office; the player drops it into Release and sets marketing where applicable. Detailed reports, charts, editing, and authoring can leave the lot. | **High** — `[TM-MAN]` pp. 6, 12, 23-28 |
| Construction and growth | Facilities, sets, paths, and landscaping are placed in the world. A ghost is yellow when legal and red when blocked; builders, scaffolding, repair, and travel distance make studio growth physically legible and mechanically relevant. | **High** — `[TM-MAN]` pp. 11, 20; `[TM-BIBLE]` §§25-26 |
| HUD and time | The live lot carries a prominent timeline/date and Pause/Play/Fast Forward, people cards on the left, movie cards on the right, cash and studio rank, local warnings, and optional guidance trails toward sensible destinations. | **High** — `[TM-MAN]` pp. 5-10; `[TM-BIBLE]` §§27-30 |

The historical lesson is not “restore dragging.” It is **teach one spatial grammar once, then reuse
it**. The original began with a low-risk physical hire and reapplied the same idea to writing,
casting, shooting, and release. It did not frontload a modern contract spreadsheet. Project:
Studio's richer economy can remain, but that depth should follow selection rather than precede it.

## B. Modern tycoon lessons

| Observation | Adopt for Project: Studio | Do not copy |
|---|---|---|
| *Planet Coaster 2* combines direct park objects with one top-level Park Management hub for staff, finances, objectives, notifications, and research; it adds severity-aware notifications and world heatmaps. `[PC2]` | One stable management hub; severity-ranked attention; aggregate facts drill down to real lot entities; later diagnostic overlays. | A hub that becomes another universal cockpit or duplicates every local action. |
| *Planet Zoo* hires in a management surface, then attaches the selected worker to the cursor for deployment; object panels and global staff/work-zone views coexist. `[PZ]` | Bidirectional links: **Locate in world** from lists and **View in management** from people/buildings. Preserve autonomy by default. | Requiring manual placement/patrol work for every ordinary employee. |
| *Two Point Campus* begins at a deliberately forgiving campus and unlocks facilities/courses as reputation grows. Its hiring UI separates summary applicant facts from deeper qualifications, traits, fee, and salary. `[TPC]` `[TPC-HIRE]` | A low-pressure first studio; staged systems; standardized candidate comparison; inspect without committing or dismissing. | Applicant expiry pressure during founding, one-click hiring, or exposing the whole management tree at launch. |
| *Parkitect* makes backstage routing and supply operations spatial, not decorative. `[PARK]` | Let visible movement and facility occupancy explain production logistics. | Turning every backstage task into manual hauling. |
| *Game Dev Tycoon* starts with one person in a garage, then unlocks offices, staff, training, and labs after successful releases. `[GDT]` | Physical and mechanical growth should arrive in comprehensible layers. | Its screen-first production interaction as the model for a 3D studio lot. |

The existing comparative register already approved two directly relevant rules: important scores
must expose drivers and an actionable response, and aggregate warnings must resolve back to the
people/productions/facilities that caused them (`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md`,
`RCT3-DIAGNOSTICS-001` and `RCT3-ATTENTION-002`).

### Surface allocation

**World-native:** selecting/navigating; meeting an applicant; opening a building; viewing current
work, occupancy, queue, or blocker; accepting one simple local remedy; placing construction;
following a person; choosing a clearly ready next step.

**Complexity-earned workspace:** comparing many candidates; detailed contract negotiation; full
finance history and forecasts; roster-wide management; multi-role casting; package/greenlight;
production portfolio and scheduling; build catalog; film autopsy. These surfaces open from a world
anchor when one exists, retain the lot behind them where practical, and always offer Locate/Return.

## C. Project: Studio interaction doctrine

1. **The lot is home.** Launch, ordinary return, and resolved decisions land in the same studio
   world; a panel never becomes the default place to wait.
2. **Place starts the verb.** A simple action begins by selecting the person, building, stage, set,
   or parcel it concerns.
3. **Complexity earns space.** Comparison and strategy receive proper workspaces; their world
   origin and return context remain explicit.
4. **Reuse one grammar.** `Select → read a compact consequence → confirm → see the world change` is
   taught at the Gate and reused throughout production.
5. **TypeScript authors truth and legality.** Unity renders structured read models and dispatches
   current opaque intents. It never parses prose into rules, prices an offer, rolls potential,
   advances the clock, or decides legality.
6. **Status lives where work lives.** Occupancy, progress, queues, blockers, arrivals, and readiness
   belong on the relevant building/person first; the HUD only aggregates attention.
7. **Selection is not commitment.** Hiring, founding, greenlight, release spend, demolition, and
   other material actions show consequences and require an explicit commit.
8. **Show the first useful facts first.** Identity, role, fit, cost, and one risk precede deep
   attributes, formulas, and forecasts.
9. **Uncertainty looks uncertain.** Estimated potential and forecasts use ranges/confidence and
   `Est.` labels; hidden truth is not exposed as false precision.
10. **World and management are two views of one state.** Every list can locate its entity; every
    entity can open the relevant deep record.
11. **Growth reduces repetition, not consequence.** Routine staff work auto-runs; repeated or severe
    problems aggregate into decisions instead of generating one alert per person.
12. **The player builds the story of the lot.** The mature start is sparse, expansion is visible,
    and an inherited fully built studio is not the long-term default fantasy.

## D. First 20-minute player journey

This is the near-term journey on the current V1 lot. The later Founding Flip inserts construction
without changing the Gate → Admin → Development → Casting grammar.

| Time | Player experience | Teaching purpose |
|---|---|---|
| 0:00-1:00 | New Studio resolves to a close view of the **Gate and Administration**, paused. A short camera reveal names those two anchors; the HUD already shows `JAN 1920 · WK 0`, cash, and time controls. One objective reads: **Meet the applicants at the gate.** | Establish place, time, and the world as home before showing numbers. |
| 1:00-3:00 | Three role-relevant applicants stand at marked arrival pads. Clicking a person focuses them and opens a compact card. The first `Review offer` is guided; `More Details` is optional. | Teach select/inspect without commitment. |
| 3:00-7:00 | The player signs the founding minimum (3 Actors, 1 Director, 1 Writer, 1 Production/Craft Lead) in role waves. At most three candidates are staged at once; a signed person visibly crosses the gate and the next authoritative arrival replaces them. | Make six choices manageable while preserving real cost and role coverage. |
| 7:00-8:30 | Administration gains an attention marker. Clicking it shows coverage, payroll, weekly burn, and runway, then `Review founding`. The final confirmation dispatches `foundStudio`; a sign/lamp/state change marks the studio as open. | Founding is an act at the company office, not a menu button floating over scenery. |
| 8:30-11:00 | The camera returns to the lot and highlights Development/Script Office. Its local card shows the signed writer, available capacity, and `Commission screenplay`. A retained workspace presents three useful choices first; shape/audience depth sits under Advanced. | Introduce a complexity-earned overlay from a physical building. |
| 11:00-14:00 | The studio unpauses at 1×. The writer appears bound for/at Development; the building shows drafting and due status. The player tries 2×/4× or inspects people while work proceeds. | Time and visible work replace “press a memo button and wait.” |
| 14:00-16:00 | A screenplay-ready marker appears on Development. Clicking it shows title, assessment, one key strength/risk, and Accept/Rewrite; detailed assessment remains optional. Blocking decisions may auto-pause under an explicit rule. | Keep the first review local and legible. |
| 16:00-19:00 | Casting Office becomes the next anchor. Clicking it opens role slots over the retained lot; a dedicated comparison workspace handles auditions and multi-role fit. Each selected candidate can be located on the lot. | Admit that casting is genuinely complex while preserving physical origin. |
| 19:00-20:00 | `Review greenlight` states company, cash, recurring commitments, stage/set readiness, and risks. Confirming starts the picture; people move toward the assigned work and the soundstage visibly changes to active/preparing. The memo is not involved. | End onboarding with the lot visibly becoming the game. |

Onboarding guidance is state-derived and dismissible. It does not invent a tutorial state machine,
and experienced players can skip camera choreography while retaining the same legal actions.
Twenty minutes is an experience budget, not permission for Unity to accelerate simulation or mint
results. If authoritative timing cannot support it at 1×-4×, pacing/tuning needs a separate
TypeScript decision.

## E. World interaction map

`Existing` below names current bridge intent kinds where available. A future action must first exist
in TypeScript before Unity can surface it.

| Lot entity | Click target and immediate result | Deeper surface | Authoritative intent / boundary |
|---|---|---|---|
| Studio Gate | Gate selects Arrival status; clicking a visible applicant selects that exact candidate and opens the compact offer card. | Compare available applicants / full Hiring workspace. | **Existing:** `signFoundingContract`, joined by a new read-only TypeScript arrival view keyed to its opaque `intentId`. Unity positions presentation actors only. |
| Administration / Staff Office | Shows studio identity, founding coverage, current payroll/burn, and the next company-level action. | Founding review; later roster/finance/company policies. | **Existing:** `foundStudio`. No Unity-side coverage or affordability calculation. |
| Stage School (future buildable) | Shows actor/director/extra queue, training status, and three visible arrivals; click person to inspect. | Talent market, comparison, training plan. | Future TypeScript hire/train intents. Post-founding actor/director/extra applicants belong here; targeted/scouted appointments may still arrive at the Gate. |
| Crew Facility (future buildable) | Shows available crew/craft, current deployment, shortage, and local hire action. | Workforce/schedule/department workspace. | Future TypeScript hire/assignment intents; existing Crew auto-fill remains simulation law. |
| Script / Development Office | Shows writer, capacity, current project, due state, and Commission/Review when legal. | Retained commission workspace; Writers' Room. | **Existing:** `commissionScreenplay`, `acceptScreenplay`, `requestRewrite`. |
| Casting Office | Shows ready screenplay/session, role coverage, camera-test status, and the next legal action. Visible roster people can be selected into comparison context. | Audition comparison, casting/package, greenlight. | **Existing:** `startAuditions`, `acknowledgeAuditions`, `greenlightPicture`. Fit and legality stay TypeScript-owned. |
| Soundstage / set | Shows assigned picture, phase, people present/bound, countdown, set condition, and one exact blocker/remedy. | Production detail / schedule. | **Existing where emitted:** `resolveProductionBlocker`; phase, reservation, capacity, and result remain TypeScript truth. |
| Production / Post Office | Shows pictures in Post/release-ready/released states and local distribution readiness. | Production portfolio, release/marketing, reviews/autopsy. | Read-only until TypeScript emits the relevant release/marketing intent; Unity must not manufacture one. |
| Named employee / Star | Shows name, profession, current picture/task/destination, availability, and one material status. `Follow` and `Open profile` are always safe. | Career/profile/contract/relationships as systems exist. | Selection/follow is presentation. Assignment, contract, dismissal, or remedy requires a current TypeScript intent. |
| Vacant parcel / construction site | Shows `Build here`, legality, cost, duration, construction progress, and blockers at that ground. | Anchored build catalog / placement preview. | **Existing bounded route:** `startConstruction`; all placement/cost/timing legality remains TypeScript-owned. |
| HUD alert | Selects the highest-priority real person/building/production and moves/focuses the camera; no mutation. | Grouped attention list with contributing entities. | Read-only TypeScript attention projection; an action appears only if an emitted intent exists. |

### Lot navigation grammar

- Single select opens context; double-select or `Focus` frames the target; `Follow` tracks a person.
- Building geometry, roof/nameplate, and alert marker share one selection target so small art is not a
  precision test.
- Camera pan/orbit/zoom remain available while no modal commit is open. `Home`/Gate and `Focus
  selected` provide recovery anchors; alerts and panels can Locate in world.
- Management-scale labels show building role/status; close zoom reveals people and local stories.
  Zoom changes discovery, not whether core controls remain usable.
- Global roster, hiring, finance, and production rows always carry `Locate`; returning restores the
  exact lot and selection when still valid.

## F. Hiring redesign

### Where applicants appear

1. **Founding:** at the Gate, because Gate + Administration are the only required permanent opening
   anchors. Candidates arrive in the next unmet profession's wave.
2. **After founding:** actors/directors/extras at Stage School; writers at Script/Development;
   crew/craft at Crew Facility. These buildings turn recruitment investment into visible supply.
3. **Special channels:** scouted, agency, returning, or event candidates can arrive at the Gate by
   appointment, clearly labelled as such.

Only **three candidates are physically staged at once**. They are a window onto the authoritative
pool, not a new pool. Stable Next/Previous arrivals or the full comparison workspace expose the
rest without rerolling, consuming RNG, or silently expiring anyone.

### Information hierarchy

**World marker (before selection)**

```text
RAMON ASHLEY
Actor · OVR 52
```

**Compact selected card (the first useful decision)**

```text
Ramon Ashley — Actor
OVR 52 · Developing
Best signal: Comedy ↑
Reliable work ethic
$6,912/wk + $96k signing
[Review offer]  [More Details]
```

The exact labels are authored from TypeScript data. Role identity is text plus icon, never color
alone:

- Actor: performance/genre signal;
- Director: direction/genre/leadership signal;
- Writer: genre/voice/delivery signal;
- Production/Craft: department/reliability/throughput signal.

**More Details / compare**

- relevant attribute breakdown and why OVR/fit reads that way;
- genre/discipline experience, secondary discipline, Star Power, age where material;
- top strengths and one primary concern;
- `Est.` potential **band** plus scouting confidence and currently unknown areas;
- work ethic/reliability and any consequential trait;
- contract choices: weekly/annual salary, signing bonus, guaranteed pay, total obligation;
- before → after recruitment fund, weekly payroll/burn, and runway;
- availability/expiry only if a real TypeScript rule exists;
- pin for comparison and Locate at Gate.

Potential is not `OVR ≤ exact hidden ceiling` in the first card. Use, for example,
`Promising · estimated 58-70 · low confidence`. As scouting or work evidence improves, TypeScript
narrows the range; Unity never reveals or rolls the hidden value.

### Accidental-hire prevention

1. Clicking a person **selects only**.
2. `Review offer` opens a contract sheet anchored to that person.
3. The final button says `Sign 2-year contract`, not `Hire`, and restates: **today's bonus, weekly
   payroll delta, guaranteed obligation, and runway change**.
4. Cancel/back is harmless and visually primary enough to find; no card-level one-click commit.
5. Final dispatch uses the refreshed opaque `intentId`. A stale/refused offer returns to the same
   person and explains the authoritative reason; it never signs a substitute.
6. Success is acknowledged in the world: contract stamp/receipt, Signed state, and the person
   entering the gate. The authoritative state changes first; animation celebrates it.

## G. Persistent HUD

The permanent HUD should answer **when, how fast, how solvent, and what needs me** without a
paragraph:

```text
JAN 1920 · WK 0     [PAUSE] [1×] [2×] [4×]     $19.84m   ▼ $43k/wk   ! 2 decisions
```

- **Date:** month/year plus week, always visible. The current speed state is visually unmistakable;
  keyboard/controller shortcuts mirror the controls.
- **Time:** Pause/1×/2×/4× are a persistent cluster. The active speed is filled, not inferred from
  animation. A blocking decision may pause only under one explicit, consistent rule.
- **Cash:** current operating cash. Selecting it opens Finance.
- **Direction:** authoritative current/forecast weekly net, labelled gain/burn with arrow and sign;
  never color alone. Show runway beside it only when risk is material or during a spend preview.
- **Standing/prestige:** show one compact authoritative Studio Standing/rank only after it becomes
  meaningful. During founding, omit the empty badge. Selecting it opens its driver breakdown.
- **Attention:** separate `DECISION` from `INFO`; show the urgent count, group duplicates, and focus
  the relevant world entity. Routine local facts stay local.

The full Finance workspace still owns cash-flow history, fixed versus variable cost, contract and
production commitments, next-eight-week forecast, and runway assumptions. The HUD is a pulse, not
a ledger.

## H. Memo-panel disposition

The current universal memo cockpit **ends**.

**Keep, but shrink and contextualize:**

- one dismissible onboarding sentence;
- the selected object's short context only when no better world anchor exists;
- a blocking decision prompt linked to a real person/building/production;
- a brief success/refusal receipt;
- narrative memos or studio correspondence when they are genuinely content.

**Move elsewhere:**

- time/date/cash/burn/alert count → persistent HUD;
- applicant list → visible arrivals + Hiring workspace;
- role coverage/founding → Administration;
- commission/review → Script Office;
- casting/greenlight → Casting Office + retained workspace;
- production status/blockers → stages, people, Production Office, and portfolio;
- detailed finance → Finance workspace.

**Disappear:**

- long stacks of legal action buttons;
- repeated OVR/salary/bonus/runway paragraphs;
- “next” buttons that bypass a visible building/person;
- empty-state white acreage covering the world.

Default state is collapsed/absent. Closing it never hides the HUD or makes the game unplayable.

## I. Studio-growth recommendation

### Immediate V1

Do **not** block CP9 on a lot-layout rewrite. Start the camera tightly at Gate/Admin, reveal systems
as they become relevant, and make current buildings honest interaction anchors. Do not fake an
empty lot, invent locked buildings, or hide authoritative state behind fog. The immediate win is
turning existing world art into control and feedback.

### Later campaign progression

Execute the already-settled Founding Flip law: a fresh studio starts with **Gate + Administration /
Staff Office + frontage road/minimal utilities + vacant parcels**. Stage School, Script Office,
Crew Facility, Casting Office, Production/Post, soundstages, and sets are player-built. Existing
saves keep their founding placements; `INITIAL_PROPERTY` remains immutable migration authority
(`THE-MOVIES-PARITY-MASTER-PLAN.md:224-287`; `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:82-96`).

The future opening should physically unfold:

```text
Gate/Admin → recruit builders/core team → place Development → writer starts work
→ place Casting/Crew → build first stage/set → first picture → reinvest → expand
```

This is not cosmetic. Construction order, capacity, travel, queue pressure, operating cost, and
visible work must come from TypeScript truth. A prebuilt/creative start may remain an explicit
option later, not the default fantasy.

## J. CP9 recommendation

### REQUIRED NOW — CP9: Gate-to-Founding World Interaction V1

Bound CP9 to the opening Gate/Admin loop. It changes no GameState, save, economy, contract,
founding-minimum, RNG, or time law.

This is one vertical slice behind one integration gate: existing founding intents, one new
read-only projection, Gate people, Administration founding, and the minimum HUD/memo change needed
to make those actions playable without the white cockpit. Script, casting, production,
construction progression, and the mature lot layout remain unchanged. The HUD and memo cut are
co-requisite acceptance work: without them, a world-native hire still returns the player to the
old universal panel.

1. Align Unity's bridge front door with the existing Core founding minimum (3/1/1/1). Remove the
   bridge-only mandatory reserve Actor from product onboarding; keep it as an explicit proof-harness
   step if the two-picture proof still needs one.
2. Add a TypeScript-produced, read-only **Founding Arrival View** with stable candidate/world refs,
   compact typed display fields, consequence preview, and the matching existing opaque `intentId`.
   Do not expose action payloads or ask Unity to parse `detail`.
3. Stage at most three generic existing person presentations on clearly readable Gate arrival pads.
   Positions/animation are presentation only; presence never implies authoritative employment.
4. World selection opens the compact candidate card; `More Details` opens the structured comparison
   view; `Review offer → Sign contract` is the only commit route.
5. On accepted `signFoundingContract`, repaint from the fresh snapshot, mark Signed, play the
   bounded entrance acknowledgement, retain camera/selection where valid, and surface the next role
   wave.
6. Administration owns founding coverage and the deliberate `foundStudio` confirmation.
7. Install the concise persistent date/time/cash/net/attention HUD and collapse the memo by default.
8. Version the bridge projection deliberately, regenerate/check Unity contract models, and prove
   schema drift; this is a protocol/read-model change, not a SaveFile migration.

**CP9 acceptance proof**

- A fresh session reaches the first offer by clicking a visible person, with the memo closed.
- No single click can sign a contract; cancel is byte-neutral.
- Every displayed candidate/cost/forecast field equals the TypeScript view; Unity performs no
  pricing, sorting-as-law, potential roll, runway math, or eligibility logic.
- The exact selected intent commits or fails closed; stale state cannot sign another candidate.
- All required founding roles can be completed from Gate people, and the studio can be founded only
  from Administration; no proof-only reserve hire blocks it.
- Accepted hires and founding produce visible world changes driven by the fresh authoritative
  snapshot.
- Pause/1×/2×/4×, date/week, cash, weekly direction, and decision attention remain readable at the
  target desktop and controller layouts.
- Owner playtest criterion: the first five minutes are completable while watching and clicking the
  lot; the white panel is never the primary action list.

### NEXT

- Script Office commission/review world entry using the same select → preview → commit grammar.
- Casting Office role-slot context plus Locate-in-world from the existing audition/package
  workspaces; keep multi-candidate comparison in the workspace.
- Clickable person summaries for current job/picture/destination and bidirectional Roster links.
- Structured TypeScript attention aggregation behind alerts; no prose parsing.
- Finance workspace visual hierarchy: cash, weekly net, commitments, runway assumptions, trend.

### LATER

- Founding Flip / sparse physical start and player-built Stage School, Crew, Script, Casting,
  Production/Post, stages, and sets.
- Full production portfolio, staff departments/work zones, heatmaps, scouting progression, advanced
  contract negotiation, studio rank/prestige, research, and land expansion.
- Controller-quality radial/context alternatives and richer close-camera interaction after the
  selection grammar proves itself.

### DO NOT DO

- Do not move hiring, economy, time, RNG, legality, pathing, or outcomes into Unity.
- Do not merely restyle or relocate the same universal memo.
- Do not make every action a drag-and-drop gimmick or force the player to hunt tiny 3D targets.
- Do not replace the founding list with an uninspectable random three-person pool.
- Do not add one-click hiring, fake applicant expiry, confirmation spam for harmless actions, or
  false-precision potential.
- Do not invent Stage School/Crew occupancy, applicant supply, person travel, or building functions
  before TypeScript exposes the underlying truth.
- Do not bundle the sparse-lot Founding Flip, construction economy, full hiring market, casting
  overhaul, production portfolio, and HUD into CP9.

## Sources

- `[TM-MAN]` Lionhead/Activision, *The Movies* official PC manual, especially pp. 4-12 and 16-21:
  <https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf>
- `[TM-PRIMA]` Greg Kramer, *The Movies: Prima Official Game Guide* (developer-reviewed), especially
  onboarding, facilities, casting, and production chapters:
  <https://archive.org/details/The_Movies_Prima_Official_eGuide>
- `[TM-BIBLE]` local ingested corpus, `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`, especially §§1-6,
  25, 27-30, and “First Movie — Original vs Project: Studio.”
- `[TM-SR]` local `THE-MOVIES-2005-SOURCE-REGISTER.md`; evidence taxonomy and per-claim provenance.
- `[TM-GS]` GameSpot, *The Movies Walkthrough* (contemporary secondary source):
  <https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/>
- `[PC2]` Frontier, *Planet Coaster 2 — Deep Dive: Mastering Management*:
  <https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management>
- `[PZ]` Frontier, *Planet Zoo — Staff & Guests* player guide:
  <https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests>
- `[TPC]` Sega/PlayStation, *Two Point Campus* overview (progressive first campus and unlocks):
  <https://blog.playstation.com/2022/08/30/20220830-tpc/>
- `[TPC-HIRE]` GamePressure, *Two Point Campus: Staff and employment* (secondary observation of the
  shipped candidate hierarchy):
  <https://www.gamepressure.com/two-point-campus/staff-and-employment/z61013a>
- `[PARK]` Texel Raptor, *Parkitect* official Steam description:
  <https://store.steampowered.com/app/453090/Parkit/>
- `[GDT]` Greenheart Games, *Game Dev Tycoon* official overview:
  <https://www.greenheartgames.com/>

Historical behavior, comparator observations, and Project: Studio recommendations are intentionally
kept separate above. A recommendation is not a claim that the original game did it.
