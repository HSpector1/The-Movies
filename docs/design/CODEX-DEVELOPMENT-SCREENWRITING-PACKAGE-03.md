# CODEX DESIGN PACKAGE 03 — DEVELOPMENT / SCREENWRITING

Status: **DECISION-READY RESEARCH RULING — OWNER REVIEW REQUIRED**

Scope: Development and screenplay commissioning, drafting, review, one final rewrite, acceptance,
and the minimum handoff to Casting

Production-code changes: **NONE**

Research branch: `codex/development-screenwriting-research-03`

Research baseline: canonical `main` at
`c902a704eb948cc576083d0973c8c23e59937dc1`

Owner-supplied sealed comparison points: TypeScript `44615e5`; Unity
`911e87e6aeed6e185ccf6a8d77aff9ec455b404f`

Binding interaction grammar: Package 02 at
`a4795ff72a9a790e1cbda06deefd4b76a91df2b0`, with builder annex tip
`f571a1d867b608a4a841773fc78eb6ed11696bb6`

The research baseline and the Owner-supplied TypeScript CP9 comparison point are separate Git
histories; this report does not claim that `44615e5` is an ancestor of the recorded `main` baseline.
The sealed Unity repository was inspected read-only at
`/Users/bruce/Project Studio - Unity Production Convergence 80H`.

Until Owner acceptance, this document is research rather than a replacement for frozen historical
implementation contracts. If accepted, it prospectively supersedes only their Package 03
presentation rulings—most notably the generic tiny screenplay-review presentation—while preserving
their existing Core action, strict-selector, freshness, and exact-dispatch laws.

## Evidence notation

- **FACT — PRIMARY**: directly supported by an official manual, developer material, or current
  authoritative Project: Studio code/read model.
- **FACT — SECONDARY**: supported by a contemporary guide, review, or later retrospective.
- **OBSERVATION**: visible in a cited screen, current browser implementation, or inspected build.
- **INFERENCE**: the most likely design purpose or translation, not a historical claim.
- **RULING**: the bounded Project: Studio implementation contract proposed for Owner acceptance.

Historical sources are cited as `[TM-MAN]`, `[TM-PRIMA]`, `[TM-SE-MAN]`, and `[TM-MAC]`; modern
sources as `[GDT]`, `[SI]`, and `[FM]`. The source register is in section 19. Exact look-here links
and visual instructions are repeated in the Builder Annex rather than buried here.

---

# 1. Executive decision

## 1.1 The answer

Screenplay development should feel like **running a visible creative department**, not operating a
memo and not hand-authoring screenplay prose.

The approved loop is:

```text
NOTICE DEVELOPMENT IN THE LOT
→ HOVER / SELECT DEVELOPMENT
→ UNDERSTAND ITS CURRENT PROJECT, PEOPLE, CAPACITY, AND ATTENTION LOCALLY
→ OPEN A RETAINED COMMISSION WORKSPACE FOR A REAL BRIEF
→ WATCH THE NAMED WRITER AND PROJECT WORK THROUGH AUTHORITATIVE WEEKLY TIME
→ AUTO-PAUSE WHEN A DRAFT NEEDS REVIEW
→ OPEN A LEGIBLE RETAINED REVIEW WORKSPACE
→ COMPARE ACCEPT NOW WITH THE ONE FINAL REWRITE
→ COMMIT ONE AUTHORITATIVE ACTION
→ RETURN TO THE SAME LOT CONTEXT
→ HAND THE ACCEPTED SCREENPLAY TO CASTING WITHOUT AN AUTOMATIC CAMERA MOVE
```

This preserves the best idea in *The Movies*: the Script Office made writing physical, staff-driven,
and visibly upstream of casting. It rejects the aged parts: dragging people as the normal command
grammar, hidden quality causality, repetitive script farming, and reliance on tiny information
bubbles.

## 1.2 The critical Accept-versus-Rewrite ruling

The current Project: Studio simulation already has a bounded decision; the current presentation
does not explain it well enough.

| Choice | Current authoritative result | What the player must see before choosing |
|---|---|---|
| **Accept now** | Immediate `review → ready`; consumes no week, cash, capacity, or RNG | `Ready to package now`; current `Est.` assessment is locked for the next stage |
| **Request final rewrite** | Available only at first review; reserves the attributed writer and one Development & Casting slot for exactly one week; payroll and overhead continue; returns to review; rewrite count becomes one | Named writer, named/available resource commitment, due week, one-week operating consequence, and a TypeScript-owned **projected player-perceived assessment** |

The rewrite is not inherently an improvement. Current Core computes a rewrite delta from current
strength and the writer's rewriting skill and bounds the result from a possible decline through a
possible gain (`scriptRewriteDelta` in `src/core/scriptDevelopment.ts`). The displayed perceived
projection is deterministic under current rules; the hidden actual result can differ and is not
guaranteed by that projection. The UI must therefore say **final rewrite**, never **improve
screenplay**, and must not promise an actual gain.

**REQUIRED NEXT presentation extension:** TypeScript must publish the player-safe comparison that
it can derive from the current perceived assessment and the writer's perceived rewriting skill,
for example `Est. 62 → projected Est. 65`, `Est. 62 → projected unchanged`, or
`Est. 62 → projected Est. 60`. Unity must never compute this. This is a read-model/bridge extension,
not a new outcome rule and not disclosure of `actualStrength` or actual skill.

Without that preview, the player still has only “hopefully it is better.” The extra week and scarce
resources explain why Accept can be right; the projected assessment explains what the writer is
expected to achieve. If TypeScript cannot publish the preview, the rewrite action may remain in the
deep existing screen for compatibility but is **not ready for the new primary review workspace**.

## 1.3 One bounded next checkpoint

**Development-from-the-Lot V1** is the single recommended checkpoint:

> Select the authoritative `writers`/Development building → read current department state → open
> retained commissioning → commission one current legal screenplay → witness its named writer,
> phase, capacity use, and due week → advance authoritative time → auto-pause on review → compare
> Accept now with the one final rewrite using a TypeScript-owned consequence preview → choose →
> witness exact successor state → reach `Ready to package` and the existing Casting boundary → Back
> returns to the same world context.

It proves the complete grammar while stopping before audition or package implementation. It must
start only after CP10A's shared selection/Focus/inspector spine is accepted; it must reuse that spine
and must not modify CP10A's Gate or Administration lane.

The end-to-end vertical slice owns one started screenplay and one review decision. Existing queue,
multi-project, save/load, stale-action, and accessibility laws still require safe projection or
fixture-level proof, but P03A does not build a new portfolio optimizer, history browser, queue
simulation, or controller framework.

---

# 2. Original *The Movies* reconstruction

## 2.1 Normal generated-script workflow

| Moment | What the player physically did | What was visible | Purpose | Confidence / source | Survival ruling |
|---|---|---|---|---|---|
| Get the first script | In the tutorial, collect the pre-supplied script at the studio gate | The tutorial places that script at the Gate and points toward the next production step | **INFERENCE:** let the tutorial introduce casting before normal commissioning | **FACT — PRIMARY, high.** `[TM-MAN]`, PDF p. 6 / printed p. 12 | **ADAPT.** Project: Studio's First Film Journey may guide to Development, but normal campaign play commissions there |
| Create writing capacity | Build a Script Office; later build better Script Offices | The lot contains a dedicated building; later tiers visibly represent investment | Make screenplay development a physical department and a studio-capital decision | **FACT — PRIMARY, high.** `[TM-MAN]`, printed pp. 12 and 16; `[TM-PRIMA]`, printed pp. 18–19 | **ADOPT principle, ADAPT implementation** |
| Choose a genre | Drag a queued writer into one of the office's five genre rooms | Genre rooms embody Action, Comedy, Horror, Romance, and Sci-Fi; right-clicking the office reports current audience taste | Bind genre choice to place and public demand | **FACT — PRIMARY, high.** `[TM-MAN]`, printed pp. 12 and 39 | **ADAPT.** Keep genre as an explicit brief choice and show demand only if authoritative; do not require room-target dragging |
| Hire/assign a writer | Drag the applicant from the queue into the chosen genre room | The person moves into the Script Pool and visibly works | Make the writer a person, not a dropdown row | **FACT — PRIMARY, high.** `[TM-MAN]`, printed p. 12 | **ADAPT.** Select from an authoritative writer list; show the assignment in-world; proximity never assigns |
| Accelerate writing | Drag additional writers into the same Script Pool | Up to five writers can work on one script; more writers reduce time, not quality | Turn staff capacity into throughput | **FACT — PRIMARY, high.** `[TM-MAN]`, printed p. 12; `[TM-PRIMA]`, printed p. 12 | **ADAPT.** Current Project: Studio already supports a bounded writer pool during drafting; retain it in deeper Development management |
| Wait for writing | Let studio time run while writers worked at desks | The movie card used a script state; office activity remained visible | Let screenplay development happen alongside other studio work | **FACT — PRIMARY, high.** `[TM-MAN]`, printed pp. 6–7; `[TM-PRIMA]`, printed p. 12 | **ADOPT principle.** Use discrete due weeks and visible activity, not a fake smooth timer |
| Recognize completion | Observe the movie-card state change to script complete / ready for casting | The persistent card's icon changed; right-click revealed required Stars and crew | Make the screenplay a pipeline artifact with a next destination | **FACT — PRIMARY, high.** `[TM-MAN]`, printed pp. 6–7 and 12 | **ADAPT.** Use Development attention, project state, and an explicit next action; no draggable card required |
| Start casting | Drag the finished movie/script card into the Casting Office's `Begin Casting` room | Clicking the Casting Office lowered walls and exposed functional rooms; completed casting generated a prompt | Make departmental handoff physical and legible | **FACT — PRIMARY, high.** `[TM-MAN]`, printed p. 12 | **ADOPT the spatial handoff; REJECT literal floor-room dragging** |

## 2.2 What controlled speed and quality

**FACT — PRIMARY, high:** office advancement controlled the generated script's achievable quality;
writer experience controlled completion speed. Prima explicitly states that writer experience did
not increase script quality. Additional writers accelerated one script; one Script Office handled
one script at a time, while multiple offices allowed parallel projects. `[TM-MAN]`, printed p. 16;
`[TM-PRIMA]`, printed pp. 12 and 18–19.

This matters because the strongest original fantasy was not “hire a genius and watch a score rise.”
It was “build a better writing department and staff it efficiently.” Current Project: Studio has
already adopted that rule: a first draft is concept foundation plus Development Office uplift;
writer and pool affect the original-screenplay clock; the writer's rewriting skill matters only to
the separate final rewrite.

The following historical numeric questions remain irrelevant to Package 03 and are not treated as
implementation authority: the Intermediate office's disputed price, the exact top-tier star ceiling,
and guide disagreement over typical generated-script output.

No verified normal generated-script step offered a formal pre-casting assessment, Accept choice,
or targeted/general rewrite. Completion meant ready for casting. The office ceiling could limit the
result, but the sources do not establish a player decision that improved or damaged that completed
script before casting. Advanced Movie Maker editing was a separate authoring lane, not such a
review. **RULING:** Project: Studio's review/rewrite loop is a successor innovation and must be
justified by its own visible tradeoff, not attributed to *The Movies*.

## 2.3 Information and opacity

The original exposed the current genre, script/movie lifecycle, writer activity, and eventual
destination. It did **not** provide a modern pre-decision explanation of why one script was strong,
what a revision would change, or how much confidence to place in an assessment. The office tier was
a powerful quality cause, but the player mostly learned its effect by upgrading and observing later
outcomes.

**INFERENCE:** this served the accessible studio-playset fantasy and kept the lot readable, but it
made important causal law reverse-engineering work. That opacity should not survive.

## 2.4 Automation, tedium, and exploits

- **FACT — PRIMARY:** once assigned, writers continued working without scene-by-scene input.
- **FACT — PRIMARY:** completed scripts could be sold through the Star & Script Selling facility;
  `[TM-MAN]`, printed p. 17. **FACT — SECONDARY:** a contemporary advanced-play guide encouraged
  keeping writers producing constantly even without an intended film; Owner Mechanics Bible §12,
  tracing the player guide and corroborating the sale mechanic against the manual.
- **INFERENCE:** the original turned a vivid department into an inventory/experience treadmill.
- **RULING — REJECT:** no “always be writing” maintenance chore, no surplus-script farming loop,
  and no busywork event inserted merely to interrupt the drafting clock.

## 2.5 Tutorial, normal campaign, and Advanced Movie Maker boundaries

| Layer | Historical behavior | Package 03 treatment |
|---|---|---|
| Tutorial | A script could be waiting at the Gate so the player learned casting first | Historical only; do not infer that normal commissioning belongs at the Gate or memo |
| Normal campaign | Writer + genre room + Script Pool produced a generated screenplay for casting | Historical heart of this package |
| Custom Script Office / Advanced Movie Maker | Separate authoring tool: title, genre, template/freeform structure, up to three leads, sets, scenes, props, weather, lighting, costumes, and scene parameters | **LATER / separate product lane.** It is not the deep version of the tycoon commission workspace |
| Post Production | Separate timeline/editor for finished/custom movie material | Outside Package 03 |

Conflating Advanced Movie Maker with Development would turn a strategic brief into manual content
authoring, vastly expand scope, and undermine the TypeScript screenplay model. Package 03 governs
the studio-management lane only.

## 2.6 What remains excellent, what aged poorly

### Still excellent

- Writing begins at a recognizable department in the lot.
- A named writer visibly does the work.
- Genre is chosen before writing.
- Multiple writers and better facilities create throughput/capacity decisions.
- A finished script has an explicit physical next destination.
- Work proceeds in the background while the player runs the studio.

### Good principle, dated implementation

- Direct manipulation made assignments tangible, but drag/drop is imprecise and inaccessible.
- Genre rooms made choice spatial, but a modern retained brief can be clearer and scale to more
  projects.
- Movie cards maintained pipeline awareness, but a permanent card per project does not scale.
- Lowered building interiors made functions visible, but should not be the universal control system.

### Weak even in 2005

- Quality causality was opaque.
- Continuous script farming rewarded repetition rather than judgment.
- Important information was split across bubbles, cards, and later outcomes.
- Writer/office effects were easy to misunderstand.

### Incompatible with Project: Studio

- Physical proximity or dropping a person cannot be authoritative assignment.
- A rendered office cannot decide legality, quality, due dates, capacity, cost, or RNG.
- A tiny floating memo cannot contain commissioning or screenplay review.
- A rewrite cannot be presented as a guaranteed free improvement.

---

# 3. *Stunts & Effects* / Superstar-era findings

## 3.1 *Stunts & Effects*

The expansion did not replace the base Script Office workflow. It added a stunt-script affordance
to genre rooms, identified stunt scenes on the completed script, and connected those demands to
casting, stunt doubles, performer ability, difficulty, condition, success, and injury. The Custom
Script Office also gained labelled/filterable stunt scenes and global or scene-level double
assignment. **FACT — PRIMARY, high:** `[TM-SE-MAN]`, pp. 2–5.

The useful lesson is **demand legibility before downstream staffing**. A script that creates special
production demands should declare them before the player commits to casting or shooting. Current
Project: Studio already exposes required set demand later in package planning; Package 03 may show
a plain “production implications available at Casting” route, but must not invent stunt risk.

**REJECT:** condition/injury micromanagement, a second stunt-attribute treadmill, and stunt script
buttons in V1. The current simulation has no authoritative stunt screenplay dimension.

## 3.2 Mac Superstar Edition evidence

The Mac Superstar Edition review describes the complete later package as the base game plus
*Stunts & Effects*. It still presents screenplay creation as writer-in-genre-office → casting →
shooting → release, with custom authoring and post-production as the advanced parallel path.
`[TM-MAC]`, sections “Alles dreht sich um den Film” and “Mikromanagement, das auch mal nervt.”

The review's positive evidence is important: drag/drop, icons, right-click information, and a game
flow requiring few conventional tables made the studio feel direct and spatial. Its criticism is
equally important: repeated manual care and archiving became tiresome; unlock pacing could exceed
available resources; and the causes of ratings, awards, and custom-script results were insufficiently
explained.

## 3.3 Four-layer historical ruling

| System | Original *The Movies* | Stunts / Superstar-era evidence | Best modern comparator | Project: Studio ruling |
|---|---|---|---|---|
| Start a screenplay | Drag writer into genre room | Preserved; each genre room gains a stunt-script affordance | Game Dev Tycoon frames a project in one compact initiation surface | **ADAPT:** Development building opens a retained authoritative brief |
| Writer matters | Visible pool work; experience speeds | More downstream demand/performer coupling | Software Inc keeps assigned team beside project phase | **ADOPT principle:** named, visible, assignment-derived writer |
| Work underway | Movie card + people working | Building-driven flow still praised | Software Inc phase/progress/team card | **ADAPT:** discrete week progress, capacity, local activity, no busywork |
| Quality understanding | Office tier matters; little factor explanation | Later review criticizes opaque ratings, awards, and custom-script causality more broadly | Football Manager uses estimated evidence/status rather than naked certainty | **REJECT opacity:** `Est.` assessment plus honest drivers and implications |
| Iteration | No normal Accept/Rewrite review analogous to Project: Studio | Custom authoring can inflate time/cost but is a different lane | Software Inc makes phase promotion/delay an explicit trade | **ADAPT:** one final rewrite with time/resource/forecast comparison |
| Handoff | Drag completed card to Casting Office | Preserved | Software Inc explicit phase promotion | **ADOPT spatial destination, ADAPT command:** named Casting route, no drag |

The later package mostly **preserved** the building-driven strength and **exposed** the original's
opacity and repetitive micromanagement. It did not solve screenplay evaluation.

---

# 4. Modern comparator findings

Comparators are selected per subproblem; this is not a genre survey.

| Design problem | Best comparator | Concrete observation | Useful principle | Boundary / do not copy | Project: Studio translation |
|---|---|---|---|---|---|
| Project initiation | **Game Dev Tycoon** `[GDT]` | Its official Development Stage screens collect a small set of identity/scope and development choices, optional features/cost, and an explicit confirmation in one surface | Frame the project before time starts; keep current consequences beside choices | Hidden topic/genre compatibility tables, tiny nested modals, and slider puzzles | Three-section retained commission workspace: source/identity, existing creative brief, authoritative commitment summary |
| Work in progress | **Software Inc** `[SI]`, “Development cycle” | A project work box shows current phase progress and assigned team; design, alpha, delay, beta, and support have named purposes | Phase + people + next gate are more meaningful than a timer alone | Dense movable window stacks and continuous micro-allocation | Development inspector shows phase, named writer(s), discrete due week, capacity, and next decision |
| Iteration | **Software Inc** `[SI]`, “Development cycle” | The player deliberately promotes or skips phases; delay can be skipped but creates later defects | Iteration is a choice only when the cost of more work and the consequence of stopping are explicit | Software-development bugs and phase count | Accept now versus one final rewrite, side by side, with current projected assessment and resources |
| Opportunity cost | **Software Inc** `[SI]`, “Contract work” | Contracts state time/quality requirements, up-front payment, final reward, and failure consequences before acceptance | Put time/resource consequences before the commit | Do not invent screenplay contracts, fees, penalties, or deadlines | Show the one-week writer/slot/payroll/overhead consequence that already exists |
| Evaluation and uncertainty | **Football Manager** `[FM]`, “Scouting Enhancement” | Reports distinguish knowledge levels and ongoing/stopped/completed/needs-updating status; evidence confidence is not the same as hidden truth | Label estimates and provenance; do not pretend every score is certain | Scouting chores, knowledge meters, or football semantics | Retain `Est.`; expose player-perceived drivers and current forecast; keep `actualStrength` hidden |
| Creative identity | **Game Dev Tycoon** plus current Project: Studio | Project identity is visible throughout development instead of becoming an anonymous progress bar | Keep the brief attached to the project | GDT's three allocation sliders or generic “fun/tech” counters | Show title/source, genre, writer, shape, and audience promise; do not claim unmodeled commercial/originality scores |
| Physical department | **The Movies**, not a modern comparator | The writer works in the building that created the script, then the artifact travels to Casting | The lot is the pipeline map | 2005 drag/drop and room targets | Development is the world owner; retained workspace handles complexity; Casting is the next spatial destination |

## 4.1 Game Dev Tycoon: useful frame, dangerous iteration pattern

Official screenshots show a clear staged initiation modal, visible project identity, development
choices, feature cost, and a deliberate completion/release gate. This is valuable **information grouping**,
not a mechanic template.

Its community-documented “remove remaining bugs before release” pattern is also the anti-pattern
for Package 03 (**FACT — SECONDARY**, `[GDT-COMMUNITY]`; see Builder Annex A13):
if waiting predicts a visible improvement and the only cost is a little time, polishing is usually
the obvious move. Project: Studio must not label its final rewrite as guaranteed improvement.

## 4.2 Software Inc: strongest project-state comparator

The developer's own explanation separates design, alpha, optional delay, beta, release, and support.
The project window keeps assigned team and phase progress together. The important lesson is not the
number of phases; it is that each phase has a reason to continue or move on.

Project: Studio has only the authoritative phases it already models:

```text
Drafting → First review → [Accept OR one Final rewrite] → Final review → Accept → Ready
```

No design/alpha/beta vocabulary should be imported.

## 4.3 Football Manager: strongest assessment-language comparator

Football Manager separates a report's status and knowledge from the hidden player. That supports
Project: Studio's existing actual/perceived split and the required `Est.` marker. It does **not**
justify a new scouting subsystem. The translation is narrow: explain what the studio currently
believes, where that belief comes from, and what the next action is expected to do.

---

# 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Binding translation |
|---|---|---|
| Screenplay work belongs to a physical department | **ADOPT** | Stable world target `writers`, labelled Development |
| Named writer visibly works on the script | **ADOPT** | Presence and activity only from authoritative assignment/reservation |
| Genre chosen before writing | **ADOPT** | Existing concept/direction and `Promise.genre` in retained commission workspace |
| Writer experience improves speed, not first-draft quality | **ADOPT** | Preserve current Core law; never imply writer OVR raises first draft |
| Multiple writers speed a draft | **ADAPT** | Preserve current bounded pool in deeper Development; do not require drag/drop |
| Better Script Office improves first draft | **ADAPT** | Surface existing Development Office `Est.` uplift and richness/time consequence |
| Genre rooms as direct drop targets | **REJECT** | UI choice plus world response; no precision dragging or physical assignment law |
| Persistent movie/script card as draggable token | **REJECT** | Project inspector, attention, and exact route replace inventory-card dragging |
| Building interior as universal command UI | **REJECT** | Compact selected inspector plus retained workspace |
| Background work while managing elsewhere | **ADOPT** | Authoritative weeks progress; no screenplay micro-events without simulation truth |
| Completion calls for attention | **ADOPT** | `scriptReview` is a pause-class event; Development gains decision-required treatment |
| Naked `Quality = N` | **REJECT** | `Est.` band, player-safe basis, strengths/concerns, production identity, consequence |
| Rewrite as “improve again” | **REJECT** | “Request final rewrite”; show possible projected decline/hold/gain and opportunity cost |
| One bounded final rewrite | **ADOPT** | Existing `rewriteCount: 0 | 1`; no repeat loop |
| Targeted rewrite types | **LATER** | No UI types until authoritative screenplay dimensions and outcome laws exist |
| Advanced Movie Maker inside Development | **REJECT** | Separate future authoring lane |
| Explicit Casting handoff | **ADOPT** | Ready state points to exact existing Casting action/route without moving camera |
| Current tiny in-lot review card as final visual form | **REPLACE PRESENTATION** | Reuse its strict selector/action safety; move the decision hierarchy into retained workspace |
| Current generic Unity workflow memo as screenplay owner | **REJECT** | It may announce; Development inspector/workspaces own the interaction |

---

# 6. Project: Studio Development doctrine

1. **Development is a place and a department.** The selected building answers what it is, what is
   happening, who is working, what is blocked, and what can be done.
2. **The lot remains home.** Commission and review use retained workspaces over the live, inert lot;
   Back restores exact world context under Package 02.
3. **One authority.** TypeScript owns project state, assessment, genre, assignments, time, costs,
   capacity, RNG, legality, actions, and saves. Unity renders projections and submits only current
   TypeScript-authorized intent.
4. **A writer is a person.** Name, phase, project, due week, workload, and location are selectable.
   A person standing nearby is not assigned unless authority says so.
5. **A screenplay is a distinct creative project.** Title/source, genre, writer, shape, audience
   promise, phase, and assessment stay attached throughout its lifecycle.
6. **Time passing is gameplay, not content.** The draft proceeds while the player runs the studio;
   Development communicates state without demanding artificial clicks.
7. **Attention is reserved for decisions and blockers.** Draft progress does not interrupt. Review
   ready auto-pauses because the engine requires a decision.
8. **Important scores explain their basis and one response.** `Est.` is never the whole answer.
   Genre fit, commercial appeal, originality, and deadline pressure cannot be fabricated if Core
   does not model them.
9. **Every action previews consequences.** The commit surface says what changes now, what resource
   is held, when the next decision arrives, and what remains uncertain.
10. **No camera surprise.** Selecting, opening a workspace, project completion, receipts, and
    acceptance do not move the camera. Focus/Locate remain explicit Package 02 commands.

## 6.1 Canonical vocabulary

| Player term | Existing technical owner | Meaning |
|---|---|---|
| **Development** | lot building ID `writers` | Physical/semantic world owner of screenplays |
| **Writers' Room** | `ui/src/screens/WritersRoom.tsx` | Deep screenplay portfolio/project owner |
| **Development & Casting** | facility IDs and shared capacity read model | Rooms/slots used by screenplays, auditions, and early production |
| **Development Office II/III** | construction/facility effects | Current legacy/Core tier names for office investment affecting first-draft `Est.` uplift and original-screenplay richness/time; presentation uses the published facility label, never a hard-coded era name |
| **Studio Development** | `ui/src/screens/StudioDevelopment.tsx` | Construction/catalog owner; **not screenplay Development** |
| **ScriptProject** | `src/core/types.ts` / `scriptDevelopment.ts` | Authoritative screenplay lifecycle entity |

This vocabulary is binding. Do not route `writers` to `StudioDevelopment.tsx` and do not label the
screenplay department “Studio Development.”

---

# 7. Commissioning flow

## 7.1 Entry

- First Film Journey or a world attention cue may identify Development; it may not open the
  workspace or move the camera automatically.
- Hover: `Development` + highest-priority current state, using Package 02's two-line label.
- Single select: persistent building selection and compact Development inspector; no action.
- The inspector shows `Commission a screenplay` only when the current TypeScript read model offers
  a commission route. If capacity means the request will queue, the action remains available and is
  labelled/consequenced as queued. Hard blockers replace the action with a reason and remedy.
- Activating Commission opens the retained workspace over the same camera pose and selection.

## 7.2 Workspace sequence

### A. Picture source and identity

The top section contains only current authoritative choices:

- **Adapt a market premise** or **Commission an original screenplay** when each door is open;
- market premise title + genre, or original creative direction/genre;
- contracted writer, name/role, `Est.` writing score, availability, and current assignment;
- screenplay working identity/provenance wording.

Unavailable writers remain readable with the exact current assignment; they are not silently
removed. The default may prefer the best available primary-role writer, matching the existing form,
but the selected default must be visible and revisable before confirmation.

### B. Creative brief

Expose every meaningful field the current simulation already locks:

- opening;
- midpoint;
- ending;
- intended audience segments;
- intimacy;
- tonal weight;
- kinetic energy.

These are the project's creative identity and later production inputs. They are **not** presented as
screenplay-quality drivers unless TypeScript explicitly says so. Do not add tone, scale, budget,
deadline, originality/risk, franchise/IP, commercial appeal, or creative ambition fields in V1.

The section may use concise defaults and progressive disclosure, but a defaulted brief must remain
visible in the final commitment summary. It may not hide existing depth behind an “Advanced” label
that most players never open.

### C. Commitment summary

Before the primary button, show:

- starts now or joins the Development & Casting queue;
- named writer;
- estimated draft duration for an original, when published;
- commissioned/current week and expected review week if the authority can quote it;
- facility/capacity state;
- Development Office uplift and richness/time consequence when present;
- no separate acquisition fee under current law;
- payroll and overhead continue while time passes;
- exact next state: Drafting, or Queued. A queued request persists the selected writer/brief—and
  the market premise when adapting—but creates no writer assignment, `ScriptProject`, room/slot
  reservation, cash effect, or original concept mint until authoritative admission.

The primary label is exact: `Commission screenplay`, `Commission an original screenplay`, or the
corresponding `Queue …` label. Commissioning never happens merely by selecting Development.

## 7.3 What is automatic

- title generation for an original, where current Core owns it;
- deterministic project/facility/slot identity;
- due-week calculation;
- queue admission/revalidation;
- first-draft assessment at completion;
- release of writer/slot when review begins;
- auto-pause on review.

Unity must not duplicate any of these.

---

# 8. Writer/person role

## 8.1 World presence law

The assigned writer should visibly work at Development when the authoritative presence projection
supplies that engagement and a current world anchor. The world may animate arrival, desk work,
consultation, or departure as presentation variation; none of those animations changes assignment,
speed, quality, or completion.

If the screenplay uses the Annex, presence belongs at the Annex only when the exact reservation and
presence projection agree. A base Development reservation cannot be visually borrowed by the Annex.

If no physical anchor is currently available, keep the named writer and assignment in the inspector
and say the known semantic location. Do not invent a person, desk, or last-known position.

## 8.2 Person inspector allocation

Selecting an assigned writer follows Package 02's person anatomy:

1. name and `Writer` role;
2. current status (`Drafting`, `Final rewrite`, `Available`, or exact other assignment);
3. current screenplay title;
4. phase and due week / weeks remaining;
5. assigned Development & Casting facility when published;
6. availability after current work;
7. common `Focus` and eligible `Follow` controls;
8. `Open Development`—the Writers' Room focused on this exact project—and `Open Profile` routes.

The building inspector answers department questions; the person inspector answers who this writer
is and what they are doing. Deep profile owns full skills, career, contract, and workload. The
screenplay workspace owns the full brief and review decision.

## 8.3 Multiple writers and projects

Current Core permits up to five writers on a drafting project and multiple concurrent projects when
capacity exists. V1 must therefore render a list/count, not hard-code one writer or one active
screenplay into the component schema. The attributed writer remains first; pool writers follow.

Adding a pool writer is an existing drafting-only management action. It belongs in the retained
Development/Writers' Room project detail, with exact weeks saved and new due week, not as a world
drag gesture and not as a local building button.

---

# 9. Writing-in-progress experience

## 9.1 Always visible locally

- Development's world state: Available, Drafting, Final rewrite, Review required, Ready, or
  Blocked/Constrained;
- restrained state/severity treatment, not a constant glow;
- named active project at medium/close scale;
- writer presence/activity only when authoritative;
- decision-required alert when review is ready.

At management zoom, show only department state and serious attention. At medium zoom, add project
title, writer movement, and capacity pressure. At close zoom, individual writer identity and local
activity may appear. Package 02's semantic zoom/hysteresis remains binding.

## 9.2 When Development is selected

Show, in order:

1. **Development** and status;
2. top-priority current screenplay title and phase;
3. named writer(s);
4. due week and discrete weeks remaining;
5. shared capacity `occupied / total`, including non-script occupants truthfully;
6. blocker + smallest remedy, when any;
7. `Commission`, `Review screenplay`, or `Open Development` as current legal/canonical routes;
8. common Focus/Close.

Do not show a smooth percentage unless TypeScript publishes one with defined semantics. Current
screenplay time is weekly; use week segments or `2 weeks until review`, not a decorative 63% bar.

## 9.3 Attention-worthy versus blocking

| State | Treatment |
|---|---|
| Ordinary drafting/rewrite | Active but non-interrupting; no alert |
| One week remaining | Local status update only; no pause |
| Review ready | Decision-required; auto-pause under existing `scriptReview` stop law |
| Writer/slot unavailable before rewrite | Blocker on review comparison; Accept stays available |
| Capacity full but commission queue legal | Constrained state; explain queue, do not call action illegal |
| Hard commission blocker | Blocked state with headline, detail, remedy; no guessed button |
| Accepted/ready | Positive handoff state; no pause or camera movement |

## 9.4 No artificial busywork

Do not add random notes, dialogue approvals, progress clicks, mandatory meetings, or “motivate
writer” buttons without authoritative simulation. The player stays engaged by running the rest of
the studio, inspecting the visible work, comparing opportunity cost, and responding at milestones.

---

# 10. Screenplay review

## 10.1 Review opening

Completion auto-pauses time and raises Development to `Decision required`. It does not move the
camera or open a modal. Selecting Development locally explains that a first/final draft is ready.
`Review screenplay` opens the retained review workspace over the same lot context.

The current browser `LotScriptReviewPanel` is the safety and content oracle, not the final visual
shape. Its strict current-state revalidation, exact action dispatch, input-tail protection, stale
failure, successor verification, and autosave behavior should survive. Its roughly 350 px in-world
host and 11 px evidence copy should not.

## 10.2 Information hierarchy

### Header — what arrived

- `FIRST DRAFT` or `FINAL DRAFT`;
- screenplay title;
- genre and source/provenance;
- `Written by / delivered by <name>`;
- commissioned week and current week where published;
- current state `Needs review`.

### Assessment — what the studio believes

- dominant band: `Promising`, `Workable`, etc.;
- subordinate `Est. <score>` with `Est.` inseparable from the number;
- 2–4 concise player-safe strengths/concerns;
- **Why this estimate:** player-safe basis published by TypeScript;
- creative brief summary in a separate block, never falsely labelled a quality driver.

Current `estimatedScriptAssessment` emits generic band copy only. Package 03 requires a bounded
read-model extension. At first review, TypeScript publishes a short, player-safe qualitative basis,
such as a premise-foundation band and confirmation that the current Development Office contribution
is included. It must not publish raw `baselineStrength`, `actualStrength`, hidden skill, the formula,
or a numeric factor decomposition that reconstructs them. Unity receives authored labels/copy and
does not threshold or calculate. At final review, TypeScript may state that the final rewrite is
included; it must not invent a historical delta if the save does not retain one.

### Production identity — what kind of film this is

- genre;
- opening / midpoint / ending;
- intended audiences;
- intimacy / tonal weight / kinetic energy in plain language;
- current known set/production implications only if an existing player-safe projection supplies
  them.

Do not add separate screenplay “genre fit,” “commercial appeal,” “originality,” “character,” or
“dialogue” scores. Current Core does not evaluate those dimensions.

### Decision — what each action does

At first review on desktop, two equal-width comparison cards: **Accept now** and **Request final
rewrite**.
At final review, one Accept card plus a short “Final rewrite complete; no further rewrite is
available” explanation. Buttons sit immediately below their consequence summaries; no choice is
hidden in prose or a tooltip.

## 10.3 Typography and allocation

- Reuse the existing dark green/gold Project: Studio identity and accepted dossier hierarchy; do
  not create a white-page memo or a new screenplay art style.
- Reuse the retained workspace envelope: desktop `min(760px, 72vw)` and up to `88dvh`; narrow
  layouts become a full-height sheet.
- At 100% scale: workspace title 26–32 px; assessment band 30–40 px; section headings 18–20 px;
  body/consequence 16 px minimum; supporting metadata 14 px minimum; buttons 44 px minimum height.
- Approximate vertical allocation: header 15%; assessment and creative evidence 45%; decision
  comparison 30%; persistent action/footer 10%. The inner body owns one vertical scroll region.
- At 200% text scale, identity and decision actions remain visible/reachable through scrolling;
  columns collapse to one; no horizontal scroll is required. Accept stays first, Rewrite second,
  and each full consequence summary remains adjacent to its button.

---

# 11. Accept versus Rewrite decision model

## 11.1 Already modeled — present immediately

| Fact | Existing authority | Player-facing consequence |
|---|---|---|
| Accept is immediate | `acceptScriptProject` | `Ready to package now`; no time/cash/capacity/RNG |
| One final rewrite only | `rewriteCount: 0 | 1`; `requestScriptRewrite` | Rewrite appears only at first review |
| Rewrite uses the attributed writer | project `writerId` | Name the writer and their opportunity cost |
| Rewrite occupies one shared slot | project reservation | Show named/available facility and one slot |
| Rewrite takes one week | `dueWeek = currentWeek + 1` | Show exact due week |
| Payroll/overhead continue | published consequence string | Show operating-cost consequence without inventing a fee |
| Rewrite can decline, hold, or improve | `scriptRewriteDelta`; actual/perceived rewriting skill | Never promise improvement |
| Actual and perceived can diverge after rewrite | `rewriteAssessment` | Keep `actualStrength` hidden; show only projected/current perceived estimate |
| Writer/slot may make rewrite illegal | read-model blockers/legal actions | Keep Accept available; name blocker/remedy |
| Review releases writer/slot | completion sets reservation null | Explain that accepting now does not consume those resources |

## 11.2 Small authoritative extension — REQUIRED NEXT

TypeScript should publish one player-safe `RewriteDecisionPreview` (name is illustrative, not an
implementation mandate) for first-review projects containing only:

- current perceived `Est.` score/band;
- projected perceived post-rewrite score/band or qualitative direction, derived by TypeScript;
- explicit uncertainty/provenance label;
- attributed writer identity;
- exact one-week due result if committed now;
- exact resource/capacity consequence;
- exact current legal action reference or blockers;
- Accept-now consequence.

The assessment explanation is a separate player-safe collection of TypeScript-authored qualitative
factor labels/findings. It may classify the premise foundation and say that the published office
effect is included; it contains no raw premise value, actual score, hidden skill, formula, or numeric
factor breakdown. Existing commission UI may continue to disclose an explicitly published office
effect, but Review must not use it to reconstruct hidden inputs.

The recommended fidelity is an exact **projected perceived score**, because current TypeScript uses
a deterministic perceived rewrite calculation and already exposes the current perceived score.
This does not reveal actual skill or actual result. If the authoritative projection can only promise
a qualitative direction under future rules, the UI must degrade honestly rather than compute.

Also extend the player-safe assessment explanation enough to replace generic band paraphrases with
qualitative current causes. This remains a read-model concern; no save or outcome law changes in
the bounded checkpoint.

## 11.3 Future design — not Package 03 implementation

- external deadlines or release windows;
- explicit screenplay development fees;
- market-demand change during the rewrite week as a screenplay decision factor;
- writer fatigue/morale/workload effects;
- experience improving assessment confidence;
- multiple revision rounds;
- abandonment/sale/turnaround;
- franchise/IP context;
- targeted rewrite goals tied to real screenplay dimensions.

Each requires an authoritative simulation campaign, tuning, saves, and evaluation. Presentation
must not imply any of it now.

## 11.4 Reject

- a free `Improve` button;
- guaranteed green delta;
- fake percentage chance of improvement;
- a cash cost invented only to balance the UI;
- a confirmation dialog that merely repeats the button;
- mandatory rewrite because final is linguistically better than first;
- repeated rewrite loops;
- hiding the opportunity cost in a tooltip;
- using current market/genre conditions as a stated consequence when the screenplay action does not
  read them.

## 11.5 Honest limitation

Even with the current preview, a high projected gain can be the locally dominant choice when the
writer and slot have no competing use. Package 03 should not manufacture a downside to prevent
that. The design goal is not to force a 50/50 choice; it is to make the choice deliberate and
understood. Richer strategic pressure belongs to future deadlines, opportunities, and slate systems.

---

# 12. Rewrite-type ruling

| Question | Finding |
|---|---|
| Did *The Movies* have targeted normal rewrites? | No verified analogue. Advanced Movie Maker was direct scene authoring, not a revision-intent system |
| Do targeted intents create agency in principle? | Yes, only when the simulation has separate dimensions and tradeoffs that the intent actually changes |
| Does current Project: Studio support them honestly? | No. `ScriptAssessment` is one actual/perceived strength pair; the rewrite law uses one rewriting skill and one bounded delta |
| Would dialogue/structure/comedy/commercial rewrite buttons be honest now? | No. They would imply precision and causality that do not exist |

**RULING: LATER.** Keep the single existing **Final rewrite** in V1. A future targeted-rewrite
campaign must first define authoritative screenplay dimensions, writer specialties, cross-dimension
tradeoffs, player-safe forecasts, tuning, and saved history. Until then, targeted labels are
presentation fraud.

---

# 13. Uncertainty / assessment ruling

1. `actualStrength` never crosses the player read boundary.
2. Every displayed numeric screenplay assessment remains inseparable from `Est.`.
3. First-draft actual/perceived values currently coincide because the Owner-ratified writer-quality
   term was removed. The UI still uses `Est.` to preserve the stable assessment contract and future
   actual/perceived separation.
4. A rewrite uses separate actual and perceived rewriting skill and can create divergence.
5. A TypeScript-owned projected perceived result is allowed and required for the rewrite choice;
   it is deterministic under current perceived rules and labelled a projection, not a guarantee of
   the hidden actual result.
6. Do not add confidence intervals, scout-knowledge bars, evaluator skill, or random fog. Football
   Manager is a language/provenance comparator, not authority for a new assessment system.
7. If Project: Studio later wants assessment expertise or deliberately noisy estimates, that is a
   simulation decision with save, progression, and tuning consequences, not a Unity styling trick.

---

# 14. Development building states

The inspector must support multiple projects from its first schema. When several states coexist,
its headline priority is:

```text
review required
→ hard blocker affecting the next requested action
→ active rewrite
→ active drafting
→ ready to package
→ queue/capacity constraint
→ commission ready / idle
```

Counts and deep routing preserve the rest; do not pretend the top project is the only project.

| State | World treatment | Selected inspector | Primary route/action | Never say/do |
|---|---|---|---|---|
| Idle / available | Normal building; `Available` at medium/close | Role, `No screenplay in development`, capacity, available writers | `Commission a screenplay`; `Open Development` | Do not call the whole shared facility idle if Casting/production occupies it |
| Commission-ready | Subtle actionable state, not alert glow | Current supplies, capacity, writer availability, starts-now/queue note | `Commission…` | Do not auto-open workspace |
| Drafting | Active state; named project at medium/close; writer activity if authoritative | Project, `Drafting`, writers, due week/weeks remaining, slot/capacity | `Open Development`; optional exact person/project route | No smooth fake percentage; no progress clicks |
| Rewrite underway | Active distinct text/icon; no urgency until due | Project, `Final rewrite`, attributed writer, due week, slot | `Open Development` | Do not call it guaranteed improvement |
| Review ready | Decision shape + text; pause-class attention | First/final draft, assessment summary, writer, `Review screenplay` | Open retained review workspace | Do not squeeze Accept/Rewrite into a tiny memo; no camera movement |
| Accepted / Ready | Positive handoff state | `Ready to package`, assessment summary, writer released, next exact Casting step | Exact `Plan auditions` / `Open package` / `Open Casting` when authority emits it | Do not greenlight or move camera automatically |
| Blocked | Warning shape + text | Blocker headline, detail, smallest remedy; unaffected facts remain visible | Exact remedy/deep route if published | Do not guess a disabled action or substitute a generic error |
| Capacity full, queue legal | Constrained, not hard-blocked | `X/X occupied`, named occupants, queued consequence | `Queue screenplay commission` | Do not say “cannot commission” |
| Writer unavailable | Warning only when it blocks current intent | Named writer/assignment, alternative available writers, exact remedy | Select available writer or open profile/assignment owner | Do not silently choose another writer |
| Multiple projects | Highest-priority state plus count | Top project + `N more`; aggregate occupancy; no hidden decisions | `Open Development` focused on priority project | Do not hard-code one current screenplay |
| Target absent/destroyed | No world treatment | If identity remains, management route explains unavailable world anchor; otherwise clear selection | Open canonical historical/deep record if it exists | No last-position jump or replacement building |

---

# 15. World versus retained-workspace allocation

| Surface | Owns | Does not own |
|---|---|---|
| World hover label | `Development` + one current state/severity | Assessment, choices, actions, paragraphs |
| Compact Development inspector | Identity, current project/phase, writers, due week, capacity, blocker, one current route/action | Full commission brief; Accept/Rewrite analysis; portfolio history |
| Person inspector | Writer identity, current screenplay/phase/due/availability/location, Focus/Follow/Profile | Assignment legality, screenplay result, full skills |
| Retained commission workspace | Source, concept/genre, writer, existing shape/promise, authoritative consequence, confirmation | Simulation math or scene authoring |
| Retained review workspace | Assessment, basis, creative brief, side-by-side Accept/Rewrite, blockers, exact actions | Production packaging/casting details beyond the next boundary |
| Deep Writers' Room | Capacity portfolio, multiple project sections, writer pool, project history, focused exact project | World camera/selection authority |
| Alert/First Film Journey | What happened, why it matters, Development target, `Locate`/Review route | Material action hidden in tiny prose; forced camera |

## 15.1 Navigation behavior

- Opening either retained workspace pushes the Package 02 origin: camera pose, zoom band, exact
  `writers` selection, inspector, route, scroll, and invoking control focus.
- World input and time controls are inert while a blocking retained decision surface is open.
- Escape/Back closes one layer. An uncommitted commission is discarded; no simulation mutation.
- A committed action shows only successor facts verified by authority, then returns to the same
  selected Development context.
- `Open Writers' Room details` carries exact `projectId` and focuses that project.
- `Locate in world` from Writers' Room revalidates `writers` or the exact writer anchor, then uses
  Package 02 Locate; Back restores list/tab/filter/scroll/focus.
- No deep open or close changes camera pose.

---

# 16. Transition to Casting

Accepting a screenplay changes it to `Ready to package`. That is the Package 03 terminal boundary.

The immediate response is:

1. exact success receipt: screenplay title, `Ready to package`, current `Est.` assessment retained;
2. Development inspector repaints to Ready/available truth;
3. First Film Journey points to the current exact Casting step;
4. the writer is no longer described as occupying screenplay work;
5. camera and selection remain where the player left them;
6. the player may explicitly Locate/select Casting or stay in Development.

Package 03 does not implement auditions, package assembly, greenlight, casting recommendations, or
Casting UI. It reuses the existing `planAuditions` / `openPackage` / Casting route when current
authority publishes it and proves only that the accepted screenplay reaches the existing boundary.

---

# 17. Era-safety notes

Project: Studio's authored campaign spans **1920 → 2040**. The sealed Unity slice is a 1948 visual
proof, not universal product truth.

Architecture-relevant constraints now:

- Use semantic role and state tokens (`Development`, `Writer`, `Drafting`, `Review`) independent of
  furniture, paper stock, typewriter, computer, or display technology.
- Keep building identity (`writers`) separate from era-specific model/prefab/skin.
- Keep workspace components in the current Project: Studio UI identity; an era theme may supply
  decorative materials later but cannot alter hierarchy, actions, or legality.
- Do not hard-code “1948 Hollywood,” sepia, typewriter keys, paper scripts, fax/email delivery, or a
  fixed office layout into screenplay DTOs, copy contracts, or tests.
- Writer activity uses semantic animation roles (`writing`, `consulting`, `delivering`) whose era
  realization may change.
- Title/source/genre/brief/state/due/assessment/capacity remain era-neutral.
- Do not design the era-progression system in Package 03.

---

# 18. Implementation classification

## REQUIRED NEXT

- Development-from-the-Lot V1 checkpoint in section 1.3.
- Author the world body/selectable for the existing authoritative `writers` identity in sealed
  Unity; do not mint a second building identity.
- Extend the TypeScript-owned bridge projection with the existing Development commission board,
  project state, capacity, review context, and player-safe decision preview required by the Unity
  presentation.
- Provide a TypeScript-owned path from the player's current commission selections to a fresh opaque,
  revalidated commit intent. Unity must not manufacture `CommissionScriptPayload` or legality.
- Reuse CP10A/Package 02 selection, Focus, inspector, Back, retained origin, and stale-target laws.
- Replace the generic memo as the primary screenplay path with Development inspector + retained
  commission/review workspaces.
- Extend player-safe assessment/rewrite projections as specified; retain `Est.` and hidden truth.
- Prove all golden journeys in the Builder Annex.

## FOLLOW-UP

- Bring current drafting-only multi-writer pooling into the retained Development project detail,
  with TypeScript-owned weeks-saved consequence.
- Add management-list `Locate in world` for screenplay, Development, and assigned writer using exact
  Package 02 origins.
- Improve first-review assessment-driver copy after the bounded preview lands, without adding new
  simulation dimensions.
- Support multiple simultaneous project cards and priority routing in the Unity deep workspace.

## LATER

- targeted rewrite types backed by real screenplay dimensions;
- assessment expertise/confidence progression;
- deadlines, release windows, development budgets/fees, optioned IP, franchises;
- screenplay abandonment/sale/turnaround;
- Advanced Movie Maker / manual scene authoring;
- era-specific Development interiors/equipment progression;
- full stunt/demand system.

## DO NOT DO

- Move screenplay truth, formulas, costs, time, RNG, capacity, assignment, or save state into Unity.
- Treat the current bridge's one preselected `commissionScreenplay` memo option as the future
  commissioning UX.
- Compute a rewrite score or legality in C#.
- Route screenplay Development to `StudioDevelopment.tsx`.
- Add dialogue/structure/commercial rewrite buttons over a scalar assessment.
- Show `actualStrength`, actual hidden writing skills, internal formulas, or false certainty.
- Add a free/guaranteed improvement button, repeatable rewrite, or artificial busywork.
- Move the camera on selection, completion, workspace open, Accept, Rewrite, or receipt.
- Reuse the current 11 px in-lot review presentation as the elite review surface.
- Lock UI copy/art/DTOs to 1948, paper, typewriters, or sepia.

---

# 19. Source register

## Historical primary and developer-reviewed sources

- **[TM-MAN]** Lionhead Studios, *The Movies* official English manual, especially printed pp. 6–8,
  10–12, 16, 20–25, 38–39:
  <https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040>
- **[TM-PRIMA]** *The Movies: Prima Official Game Guide*, local ingested copy, especially printed
  p. 12 (“There's No People Like Show People”) and pp. 18–19 (“Buildings and Ornaments”):
  `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf`
- **[TM-SE-MAN]** *The Movies: Stunts & Effects* official manual, especially pp. 2–5:
  <https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041>
- Owner reconstruction corpus, read-only:
  `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` and
  `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-SOURCE-REGISTER.md`.

## Later-edition secondary source

- **[TM-MAC]** Macinplay, *The Movies: Superstar Edition*, especially “Alles dreht sich um den
  Film” and “Mikromanagement, das auch mal nervt”:
  <https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/>

## Modern comparator sources

- **[GDT]** Greenheart Games, official *Game Dev Tycoon* Steam page and publisher screenshots,
  especially “Development Stage 1,” “Development Stage 2,” the in-progress studio, and completion
  gate: <https://store.steampowered.com/app/239820/Game_Dev_Tycoon/>
- **[GDT-COMMUNITY]** community-maintained mechanics reference, “Bugs,” section “Finishing stage”;
  used only for the documented anti-pattern, not as primary authority:
  <https://gamedevtycoon.fandom.com/wiki/Bugs>
- **[SI]** Coredumping, “Fifth update: GUI and game mechanic details,” sections “Development cycle,”
  “Creating products,” and “Contract work”:
  <https://softwareinc.coredumping.com/fifth-update-gui-and-game-mechanic-details/>
- **[FM]** Sports Interactive, “Recruitment Revamp,” sections “Squad Planner” and “Scouting
  Enhancement”: <https://www.footballmanager.com/features/recruitment-revamp>. The page describes
  FM23-era features even though the current site shell may carry a later product title.

## Project: Studio authority inspected

- Current core/read-model/browser paths are enumerated in the Builder Annex.
- Governing reconstruction and parity context: `THE-MOVIES-PARITY-MASTER-PLAN.md`, the Owner
  Mechanics Bible and Source Register above, and `docs/c2-planning/14-renewable-screenplay-archaeology.md`.
- Existing screenplay/lot contracts and evidence:
  `docs/WORLD-FIRST-LOT-RETAINED-SCREENPLAY-COMMISSION-WORKSPACE-V1-CONTRACT.md`,
  `docs/WORLD-FIRST-LOT-NATIVE-SCREENPLAY-REVIEW-INTERVENTION-V1-CONTRACT.md`, their evidence and
  closure records, and `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md`.
- Relevant Owner law: `docs/c2-planning/00E-OWNER-FINAL-PRE-GO-ADJUDICATION-2026-08-18.md` and
  `docs/c2-planning/17-m3-records.md`.
- Package 02 design source:
  <https://github.com/HSpector1/The-Movies/blob/a4795ff72a9a790e1cbda06deefd4b76a91df2b0/docs/design/CODEX-WORLD-INTERACTION-PACKAGE-02.md>
- Package 02 builder annex:
  <https://github.com/HSpector1/The-Movies/blob/f571a1d867b608a4a841773fc78eb6ed11696bb6/docs/design/CODEX-WORLD-INTERACTION-PACKAGE-02-BUILDER-ANNEX.md>

Research/source retrieval and repository inspection date: **2026-08-24**.
