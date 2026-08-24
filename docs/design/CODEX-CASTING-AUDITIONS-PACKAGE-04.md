# CODEX DESIGN PACKAGE 04 — CASTING, AUDITIONS, PACKAGE & GREENLIGHT

Status: **DECISION-READY RESEARCH RULING — OWNER REVIEW REQUIRED**

Scope: accepted screenplay handoff, Casting Office, optional camera tests, role-aware candidate
comparison, reversible package drafting, Greenlight review, and the minimum handoff to Production

Production-code changes: **NONE**

Research branch: `codex/casting-auditions-research-04`

Research baseline: canonical `main` at
`c902a704eb948cc576083d0973c8c23e59937dc1`

Owner-supplied sealed comparison points: TypeScript `44615e5`; Unity
`911e87e6aeed6e185ccf6a8d77aff9ec455b404f`

Predecessor design authority:

- Package 01, `docs/design/CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md`, at
  `e3f51086f070fa06447be11a17e0673f2cbb11ac`;
- Package 02 and Builder Annex at
  `a4795ff72a9a790e1cbda06deefd4b76a91df2b0` and
  `f571a1d867b608a4a841773fc78eb6ed11696bb6`; and
- Package 03 and Builder Annex at
  `2d285e51116cbdce22c115928fe0d2b6af6cf650`.

The predecessor design documents are not present on this branch's `main` baseline; the exact
accepted commits above were inspected read-only. The sealed Unity repository was inspected read-only at
`/Users/bruce/Project Studio - Unity Production Convergence 80H`, using the exact sealed commit.
That Unity worktree also contains later uncommitted CP10A work; no claim in this report treats
those worktree changes as sealed behavior, and this research did not modify them.

Until Owner acceptance, this document is a research proposal. If accepted, it prospectively
replaces incompatible Casting presentation guidance while preserving every current TypeScript
authority, strict-selector, stale-intent, exact-dispatch, save, time, and world-return law.

## Evidence notation

- **FACT — PRIMARY:** official manual/developer material or current authoritative Project: Studio
  code/read model.
- **FACT — SECONDARY:** a contemporary guide, review, or developer-reviewed guide.
- **OBSERVATION:** directly visible in a cited capture or current presentation.
- **INFERENCE:** a likely purpose or translation, not a historical fact.
- **RULING:** the proposed Project: Studio implementation contract.

Historical references are abbreviated `[TM-MAN]`, `[TM-PRIMA]`, `[TM-SE]`, and `[TM-MAC]`.
Modern references are `[FM]`, `[M19]`, `[M26]`, `[SI]`, and `[PZ]`. Exact look-here links and
inspection instructions are in the Builder Annex.

## Non-negotiable authority boundary

TypeScript remains the sole authority for identity, role requirements, audition slates/results,
Fit, perceived or hidden talent, availability, employment/contracts, assignments, costs, package
state, legality, Greenlight, production formation, time, RNG, queues, and saves. Unity may own
layout, world highlighting, portraits, input, camera, animation, responsive presentation, local
uncommitted UI draft state, and submission of current TypeScript-authorized intents.

Unity must not calculate Fit, combine Fit with audition evidence, choose a winner, infer a hold,
parse prose into legality, construct a production, advance time, or promise an outcome.

---

# 1. Executive decision

## 1.1 The answer

Casting should feel like **assembling a company around a screenplay in a visible Casting Office**.
The lot announces and embodies the work; a large retained workspace earns the comparison density;
Greenlight is the explicit point at which a reversible package draft becomes a real production.

The approved interaction loop is:

```text
SCREENPLAY BECOMES READY TO PACKAGE
→ CASTING OFFICE CALLS FOR ATTENTION; CAMERA DOES NOT MOVE
→ HOVER / SINGLE-SELECT CASTING
→ UNDERSTAND PROJECT, SESSION, CAPACITY, OPEN ROLES, AND NEXT LEGAL STEP LOCALLY
→ OPTIONALLY PLAN A ONE-WEEK CAMERA-TEST SLATE
→ SEE THE NAMED CANDIDATES ATTEND CASTING WHILE AUTHORITATIVE TIME RUNS
→ AUTO-PAUSE WHEN RESULTS REQUIRE REVIEW
→ READ ROLE-SPECIFIC EVIDENCE; NO WINNER IS ASSIGNED
→ OPEN THE RETAINED CASTING WORKSPACE
→ FILL DIRECTOR, LEAD, ANTAGONIST, SUPPORT, AND PRODUCTION/CRAFT LEAD AS A SAFE DRAFT
→ COMPARE 2–4 CANDIDATES IN THE SELECTED ROLE'S CONTEXT
→ REVIEW PACKAGE STRENGTHS, RISKS, COST, CAPACITY, AND CURRENT BLOCKERS
→ GREENLIGHT EXPLICITLY
→ TYPESCRIPT FORMS THE PRODUCTION AND THE LOT SHOWS THE COMPANY RESPONSE
→ STOP AT THE PRODUCTION BOUNDARY
```

This preserves the best of *The Movies*: a script physically arrived at Casting; named people
occupied named roles; rehearsal made the company feel assembled; and `Shoot It` created a memorable
commit boundary. It rejects the aged parts: dragging tiny cards into rooms, concealed causal math,
manually wrangling ordinary workers, and learning suitability mainly through guides.

## 1.2 The audition ruling

Project: Studio camera tests are **optional, authoritative evidence**, not a minigame, talent reroll,
contract, hold, or automatic recommendation.

Current Core already defines the complete V1 consequence:

| Before commitment | Authoritative result after commitment |
|---|---|
| Choose exactly two primary Actors for each of Lead, Antagonist, and Support; at least three unique people overall | One `CastingSession` reserves one shared Development & Casting slot for one week |
| Candidate must be currently legal at start | The session pays/signs/holds nobody and marks no candidate busy |
| No audition fee | Normal payroll and studio overhead continue while the week passes |
| Fit is already visible | Completion stores a noisy role-specific `Est.` and range once; it does not rewrite talent |
| Slate is not a cast | Results remain advisory and select nobody |

Auditions must therefore answer a concrete question: **“What additional role-specific evidence is
worth one week and scarce shared capacity?”** A player may instead open the Package directly. The
first-film guidance may recommend camera tests, but presentation must never claim they are legally
mandatory.

## 1.3 The Greenlight ruling

Everything before Greenlight is a **Package draft — not committed**. Inspecting, selecting,
comparing, replacing, or removing a person changes no authoritative assignment. Greenlight is the
only commit and must preview:

- exact movie, writer, Director, three actor roles, and Production/Craft Lead;
- role-by-role Fit and one named weak assignment rather than one magic package score;
- current camera-test evidence where it exists;
- immediate Production Budget, Marketing, and applicable one-film freelancer fees;
- cash after commitment, runway, capital exposure, and forecast ranges as estimates;
- shared Development & Casting start/queue consequence;
- current hard blockers and smallest remedy;
- required sets/locations as downstream demand, not a false pre-Greenlight gate; and
- the immediate result: TypeScript forms/queues one production and commits the company only on an
  accepted action.

The call to action is `Greenlight <title>` or, when capacity is the only current blocker and the
authoritative action queues, `Queue greenlight`. A generic `Continue` is not sufficient.

## 1.4 The answer to “Why not always pick the highest Fit?”

The UI must not manufacture a counterweight. It must expose the ones already in the game:

- Fit for this exact role versus role OVR and expected-performance band;
- camera-test evidence, which is complementary and noisy rather than a replacement for Fit;
- Star Power as a separate commercial signal, not a hidden Fit ingredient;
- perceived genre experience and assignment-relevant strengths/concerns;
- in P04A's managed/economy-engaged path, studio-payroll availability versus an applicable
  one-film freelancer fee;
- current work conflicts and the opportunity cost of using scarce talent;
- the strongest/weakest attached role and any severe mismatch in the package; and
- immediate capital commitment and forecast uncertainty.

If two people have the same availability and cost and one is genuinely superior on every
authoritative dimension, choosing that person should be rational. The design must create legible
tradeoffs, not arbitrary anti-optimal friction.

## 1.5 One bounded next checkpoint

**P04A — Casting-from-the-Lot V1** is the one recommended checkpoint:

> An accepted screenplay makes the authoritative Casting Office request attention → the selected
> building explains the exact project and offers optional camera tests or direct package assembly →
> the player plans one current six-read slate → sees authoritative auditionee presence and advances
> one week → auto-pauses and reviews evidence → enters one retained package workspace → compares
> current legal candidates → drafts the one current Director, Lead, Antagonist, Support, and
> Production/Craft Lead → reviews exact authoritative package consequences → Greenlights → sees the
> exact production-formation response in the still-mounted lot → stops before Production controls.

P04A follows accepted CP10A and P03A. It does not implement Production/Shooting, new contracts,
negotiation, chemistry, callbacks, persistent provisional casting, ordinary Crew/Extras, or a new
forecast model.

---

# 2. Original *The Movies* reconstruction

## 2.1 Ordinary campaign workflow

| Moment | What the player physically did | What was visible | Design purpose | Confidence / source | Project: Studio survival |
|---|---|---|---|---|---|
| Recognize a castable script | Watch the persistent movie card change from writing to complete/ready for Casting | Card state; right-click information bubble; required Stars and crew | Turn a screenplay into a pipeline artifact with a destination | **FACT — PRIMARY, high.** `[TM-MAN]`, printed pp. 6–7, 11–12 | **ADAPT:** Casting attention and exact project state; no draggable inventory card |
| Enter Casting | Left-click the Casting Office to lower its walls | Functional floorplan for casting roles | Make a building, not a detached menu, own the action | **FACT — PRIMARY, high.** `[TM-MAN]`, printed p. 12 | **ADOPT principle; ADAPT presentation** |
| Start casting | Drag the movie card from the right HUD into `Begin Casting` | The script/movie now occupied the building; a radial/floorplan exposed six functions | Make the departmental handoff tactile | **FACT — PRIMARY, high.** `[TM-MAN]`, printed p. 12; `[TM-PRIMA]`, p. 15; local capture | **ADAPT:** explicit current-project route, no precision drag |
| Staff ordinary roles | Available Crew and Extras populated their quotas automatically; shortage remained visible | Crew and Extras counts; the script could rehearse with a shortage but could not enter `Shoot It` | Preserve physical labor without repetitive allocation | **FACT — SECONDARY/developer-reviewed, high.** `[TM-PRIMA]`, pp. 15, 41–42; tutorial capture directly confirms Crew | **ADOPT automation principle; do not invent unsupported P04 systems** |
| Assign creative leads | Manually put one Director and up to three Stars into role rooms/slots | Director; color-coded lead/support roles; Star identity and current card information | Give creative responsibility to named people | **FACT — SECONDARY/developer-reviewed, high.** `[TM-PRIMA]`, pp. 41–42 | **ADAPT:** named authoritative slots and accessible candidate controls |
| Rehearse | Once required creative roles were present, rehearsal began automatically | `Rehearsing Script`; named company; Crew/Extras quotas; progress over time | Make the package feel assembled before shooting | **FACT — SECONDARY/developer-reviewed, high.** `[TM-PRIMA]`, p. 42; local captures | **ADAPT:** camera tests provide evidence; do not mislabel them as original rehearsal |
| Check readiness | Wait until rehearsal finished and resolve missing staff/sets | Required sets in the movie bubble; red meant unowned, damaged, or occupied; staffing shortages prevented launch | Expose immediate downstream dependencies | **FACT — PRIMARY, high.** `[TM-MAN]`, p. 12; `[TM-PRIMA]`, pp. 41–42 | **ADAPT:** Greenlight shows known demand and current blockers truthfully |
| Commit to shooting | Drag the movie to `Shoot It` | Explicit final room/button; assigned company proceeded to sets | Make launch deliberate and physically consequential | **FACT — PRIMARY, high.** `[TM-MAN]`, p. 12; `[TM-PRIMA]`, pp. 42–43 | **ADOPT explicit boundary; translate to Greenlight, then world response** |
| Shoot | Company traveled among required sets and filmed scenes in real time | People, sets, scene work; completion sent the movie to Production Office | Let staffing decisions become a visible studio event | **FACT — SECONDARY/developer-reviewed, high.** `[TM-PRIMA]`, pp. 42–43 | **ADOPT downstream principle; outside P04 implementation** |

The final row's survival-ruling cell intentionally means: **adopt the explicit boundary, translate
it to Greenlight, then show a world response**. It does not rename current Greenlight to `Shoot It`
or collapse pre-production into shooting.

## 2.2 What information was available before selection

**FACT — PRIMARY, high:** Star cards showed portrait, chart rank, mood, and current activity.
Information bubbles exposed Star rating and relevant experience; the manual says better genre
experience improves performance in that genre. Relationships—especially Director/cast—mood,
workload/stress, appearance/fit, and salary also mattered to the original wider simulation.
`[TM-MAN]`, printed pp. 6–7, 13–14, 38; `[TM-PRIMA]`, pp. 40, 55, 71.

**FACT — SECONDARY/developer-reviewed, high:** Prima describes production quality as involving
genre fit/experience, Star rating, Mood, relationships, crew experience, sets, and technology.
Star power brought upside but higher demands and fewer concurrent productions.

**INFERENCE:** the player could form a rich mental story about a Star, but important causal weight
was distributed among bubbles, people, and guide knowledge. The interface made people memorable;
it did not make role choice analytically legible.

## 2.3 Rehearsal was not an audition

No verified audition, screen-test, camera-test, candidate-shortlist, or role-specific test-result
mechanic was found in the inspected official base manual, Prima guide, or *Stunts & Effects*
manual. Prima's `Rehearsing Script` begins after the cast is assigned; it is pipeline preparation,
not pre-casting evaluation. Separately, idle Stars could practise genre experience on vacant sets.
Neither is Project: Studio's camera-test system.

**RULING:** never claim that Project: Studio auditions restore an original mechanic. They are a
modern successor addition that makes uncertainty and evaluation explicit.

## 2.4 Crew and Extras source conflict

The base manual's tutorial prose says the player can drop Stars, directors, Extras, and Crew into
corresponding rooms. Prima—reviewed with Lionhead involvement—states that `Begin Casting`
automatically adds available Crew and Extras, repeats that automatic fill in the detailed flow,
and explains the shortage gate. A tutorial capture explicitly says available Crew fill required
positions automatically.

**RULING:** treat automatic basic staffing with an explicit shortage as the controlling historical
pattern. Do not use the manual's simplified drag wording to justify mandatory person-by-person
Crew or Extra assignment.

## 2.5 Tutorial, ordinary campaign, and Advanced Movie Maker boundaries

| Layer | Historical behavior | Package 04 treatment |
|---|---|---|
| First tutorial | A script appeared at the Gate; the player learned Casting directly | Historical teaching shortcut only; Package 03 owns ordinary screenplay creation |
| Ordinary campaign | Ready card → Casting Office → Director/Stars + automatic pools → rehearsal → `Shoot It` | Historical heart of Package 04 |
| Advanced Movie Maker | Three lead mannequins and scene-level authoring; manual Star assignment could be carried into Casting, with remaining Director/Crew/Extras/set gates | Separate creator lane; not the “advanced” Casting workspace |
| Instant Movie-making / creator shortcuts | Instant Movie-making makes shooting instant, but movies still must be cast and staffed properly | Not evidence for automatic package choice or auditions |

## 2.6 What remains excellent, what aged poorly

### Still excellent

- Casting belongs to a recognizable building.
- The screenplay, people, and next destination form one physical chain.
- Creative leads are named individuals, not anonymous capacity.
- Ordinary staffing can fill automatically while a shortage remains consequential.
- One explicit launch action turns preparation into a moving production company.
- Candidate biography, genre history, fame, mood, and relationships make casting character-driven.

### Good principle, dated implementation

- Dragging makes assignment tactile, but is imprecise, hard to compare, and inaccessible.
- A six-room building is memorable, but too small for role-aware evidence and business review.
- Star cards create identity, but not a modern aligned comparison.
- Rehearsal makes the company visible, but occurs after decisions and does not help evaluate them.

### Weak even in 2005

- Important role-fit causes were scattered or learned through guides.
- “Best” could collapse into fame/genre/mood heuristics without a consequence preview.
- Repeated Star care and travel dragging became micromanagement.
- Tiny bubbles/radials did not scale to several projects or candidates.
- Basic Crew/Extra availability could block the player without a good staffing-management surface.

---

# 3. *Stunts & Effects* / Superstar-era findings

## 3.1 Stunts & Effects: a strong specialized-role precedent

The expansion preserved the base Casting chain and added a role-specific Stunt Double decision.
For a stunt-requiring lead/support role, Casting showed a Stunt Double icon. The player could let
the Star perform the stunt or assign a double for the movie; Advanced Movie Maker could go down to
scene level. The decision exposed Stunt Difficulty (1–5), performer Stunt Skill, likeness, injury
risk, condition/mood consequence, and potential movie-rating upside across the manual's stunt setup
and result guidance; the source does not establish one panel containing every factor. `[TM-SE]`,
printed pp. 6–10.

The important lesson is not “add stunt casting now.” It is:

> A role-specific choice is strategic when the surface joins visible suitability factors, risk, and
> downstream consequence beside the slot.

**ADOPT principle:** current role cards must explain the exact role, strongest public supporting
signals, concern,
and cost/availability consequence.

**DO NOT COPY:** injury/condition, stunt difficulty, likeness, doubles, scene-by-scene casting, or
recast behavior into P04A. None is current Package 04 authority.

## 3.2 Superstar Edition: preserved strength, exposed weakness

The later Mac bundle packaged the base game with *Stunts & Effects*. The review documents the
familiar finished screenplay → Casting building → actors and Director path; it does not identify an
ordinary-Casting redesign. It praises direct manipulation, icons, the absence of tables, immediate
right-click information, and the fun of handling the living lot. Its explicit friction includes
repeated Star micromanagement and campaign unlock work. Separately, it says some assessment criteria
are difficult to understand—especially awards and self-made screenplay ratings—but that is not
specific evidence about casting-score opacity. `[TM-MAC]`, “Alles dreht sich um den Film,”
“Steuerung und Handling,” and “Fazit.”

| Historical layer | What survived | What it exposed | Project: Studio ruling |
|---|---|---|---|
| Original | Physical building, people, role rooms, rehearsal, `Shoot It` | Dispersed information made important causal structure hard to read; precision handling | Preserve place/people/commit; replace interaction |
| *Stunts & Effects* | Same loop plus specialized role choice | Good role decisions need visible factors and risk | Use factor/consequence anatomy; defer stunt system |
| Superstar-era review | World-led, icon-led play remained delightful | Repeated Star micromanagement remained explicit friction; some award/script assessment criteria stayed opaque | Keep lot as home; automate routine labor; explain important scores through current authority |
| Modern successor | Retained workspace plus authoritative evidence | Risk of becoming a spreadsheet | Use role-first visual hierarchy, bounded comparison, exact world return |

No source supports the claim that the later edition added ordinary auditions or camera tests.

---

# 4. Modern comparator findings

This section chooses the strongest comparator per subproblem; it is not a genre survey.

| Subproblem | Best comparator | Concrete behavior | Project: Studio translation | Limitation |
|---|---|---|---|---|
| Role-first candidate planning | *Football Manager* Squad Planner `[FM]` | Formation graphic; up to three people per set role; selecting a role retargets the list; reorder/add/remove in an explicit safe space | Role slots organize Casting; selecting a slot retargets candidate list, evidence, comparison, and action; draft changes commit nothing | Not a side-by-side film audition screen; avoid its density/jargon |
| Evaluation under incomplete knowledge | *Football Manager* scouting `[FM]` | Knowledge progresses None → Minimal → Reasonable → Extensive; reports can need updating | Pre-audition public Fit and biography remain; a camera test adds dated, role-specific evidence without revealing hidden truth | Do not create a new knowledge-state simulation in P04A |
| Glanceable person hierarchy | *Madden NFL 19* Franchise/Players `[M19]` | The official manual identifies OVR, position, contract, and attribute contexts | Project: Studio translation supplies portrait/name/role → OVR → exact-role Fit → evidence → availability/cost; deeper profile remains one route away | The text manual does not prove portrait prominence or exact visual hierarchy; OVR must not replace Fit |
| Two-person numeric comparison | *Madden NFL 19* Compare Stats `[M19]` | Compare Stats documents comparing two people's game statistics | Use the two-identity/same-fact principle: pin two by default, up to four on wide screens, with aligned Casting rows | Competitive-stat comparison, not recruitment/candidate comparison; aligned role rows and four-column scaling are Project: Studio inferences |
| Authoritative slot taxonomy | *Madden NFL 26* depth-chart positions `[M26]` | Named primary/secondary positions affect downstream systems | Slots must be TypeScript-defined and legality-aware; never generic empty portrait wells | Does not authorize new film roles or multi-role casting |
| Project readiness and explicit transition | *Software Inc.* development cycle `[SI]` | Persistent project item shows phase/team/progress; player explicitly transitions stages; premature release carries named risk | Keep movie identity/readiness visible while staffing; Greenlight is explicit and consequence-bearing | Not a film Greenlight model; import no quality/release mechanics |
| World ↔ management continuity | *Planet Zoo* `[PZ]` | Locate targets meaningful entity and opens/retains its information panel; UI updates improved same-tab switching and readability | `Locate candidate` and `Locate Casting`; return restores project/slot/filter/comparison/scroll | Patch notes do not prove a complete Back stack; Package 02 supplies that law |
| Ordinary-worker scale | *Planet Zoo* staff multi-select `[PZ]` | Batch operations reduce repeated staff handling | If Crew/Extras exist later, default to capacity/auto-fill and manage exceptions, not one-by-one casting | Does not itself prove auto-fill; historical *The Movies* supplies that precedent |

## 4.1 Comparator synthesis

- *The Movies* supplies **place, people, and physical consequence**.
- *Football Manager* supplies **role-first planning and evidence confidence**.
- *Madden* supplies **named player-data fields and a two-person numeric-comparison precedent**;
  Project: Studio supplies the casting hierarchy and aligned role rows.
- *Software Inc.* supplies **persistent project readiness and explicit stage commitment**.
- *Planet Zoo* supplies **world locating and retained contextual management**.

No retained comparator justifies a theatrical audition minigame, a single predicted Package
Quality, a radar chart, or an automatic “best cast.” Those are rejected.

---

# 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Contract |
|---|---|---|
| Casting Office owns casting | **ADOPT** | World building `casting` is the discoverable owner; no memo-first route |
| Ready screenplay has a physical next department | **ADOPT** | Development and First Film Journey point to Casting; no automatic camera move |
| Script/card dragged into `Begin Casting` | **ADAPT** | Exact ready-project deep link or explicit project choice; no precision drag |
| Single click assigns a role | **REJECT** | Single click selects/inspects only; assignment requires an explicit candidate action in workspace |
| Six building rooms / radial wedges | **ADAPT** | Local inspector for state; retained workspace for role slots/comparison/package |
| Named Director and performers | **ADOPT** | One Director and current fixed Lead/Antagonist/Support slots remain first-class |
| Automatic Crew/Extras | **ADOPT principle** | Do not create individual ordinary-worker assignment; current P04A has no Crew/Extras system |
| Automatic rehearsal after assignment | **REJECT as audition model** | Camera tests occur before casting and produce evidence; no false original precedent |
| Optional camera tests | **ADOPT current authority** | One week, one shared slot, no fee/hold; direct Package remains legal |
| Physical candidates attend tests | **ADOPT** | Render only authoritative `auditionee` presence; animation adds no gameplay fact |
| Test produces winner | **REJECT** | Results are advisory evidence; player still selects |
| Re-roll/callback loop | **REJECT for P04A** | One append-only session per screenplay; no rerun/callback/cancel once active |
| FM role-first safe planner | **ADOPT** | Slot selection retargets the whole workspace; package draft is visibly uncommitted |
| Madden large OVR/person-card hierarchy | **ADAPT** | OVR is identity/capability; exact-role Fit and consequences own the decision |
| Aligned 2–4 comparison | **ADOPT** | Two default; up to four wide; text/delta, no color-only winner |
| Radar/spider chart | **REJECT** | Aligned labeled rows are more legible and accessible |
| One magic Package Quality | **REJECT** | Show dimensions, strongest/weakest role, known strengths/risks, and ranges |
| `Shoot It` explicit boundary | **ADAPT** | Greenlight is explicit authoritative commit; Production begins after it |
| Hidden set/staff blocker | **REJECT** | Name current blocker, consequence, and smallest remedy |
| Manual Star/Crew travel acceleration | **REJECT** | World travel communicates state; it is not repetitive player labor |
| Persistent provisional authoritative assignments | **LATER / not P04A** | Current draft is transient presentation state until Greenlight; do not pretend it is a hold |
| Era-specific casting desk/paper metaphor | **REJECT** | Interaction and state schema remain era-neutral; visuals may theme through governed assets |

---

# 6. Casting Office doctrine

The Casting Office is a **world landmark, attention source, local explainer, and gateway to a
retained decision workspace**. It is not the entire casting UI and it is not decorative scenery
behind a memo.

Every selected Casting Office must answer, above the fold:

1. **What is here?** `Casting Office` plus exact stable building identity.
2. **Which picture?** Exact title/genre and screenplay state, or `No screenplay ready`.
3. **What phase?** Ready, camera tests queued/underway/results ready, assembling package, or
   production formed.
4. **Who is involved?** Writer; auditionee count/names when active; filled role count when a local
   package draft is open only inside that workspace—not as authoritative lot state.
5. **What is constrained?** Shared slot, due week, candidate supply, current legal blocker.
6. **What should I do?** One primary current action, one optional/deep route, and a remedy when
   blocked.

The building must never claim that local physical proximity assigns anyone. It renders only the
authoritative presence/engagement projection. A person standing near Casting by ordinary routing is
not a candidate, auditionee, or cast member unless TypeScript says so.

The lot treatment follows Package 02: restrained state mark/signage, color-independent icon/shape,
single-select without camera movement, explicit Focus/Locate, and no glowing-building spam.

---

# 7. Script → Casting handoff

## 7.1 Accepted transition

When Package 03 accepts a screenplay:

1. TypeScript changes the project to `ready` / player-facing `Ready to package`.
2. Development shows the success receipt and next destination.
3. Casting gains `positive` attention for the exact ready project when a legal camera-test action
   exists, `warning` for an authoritative queue/capacity condition, or a named blocker otherwise.
4. The First Film Journey points to the authoritative `casting` site and exact project.
5. The camera, zoom, and selection do not change automatically.
6. `Locate Casting` explicitly focuses/selects the building and pushes an origin frame so Back
   returns to Development's exact camera/selection/workspace context.

There is no separate `Send screenplay` mutation in P04A. Acceptance makes the exact project
eligible to be opened at Casting; the explicit player choice is whether to Locate/open Casting,
then whether to buy camera-test evidence or assemble the Package directly.

## 7.2 Project choice

- An exact deep link from Development may pre-focus the same project in Casting presentation.
- Selecting the Casting Office does not mutate the project or start a session.
- With one ready project, the inspector may name it and open its workspace directly.
- With several ready projects, the retained Casting workspace opens a project rail and preserves
  the explicit project ID. Array order, title match, or “first ready” may never decide authority.
- The current browser's special first-session retained planner is intentionally narrower; Package
  04's architecture must permit multiple projects later without changing stable identities.

## 7.3 Local actions

| Current truth | Primary local action | Secondary action |
|---|---|---|
| Ready; testable | `Plan camera tests` | `Assemble package without tests` |
| Tests queued | `Review queue status` or `Cancel queued request` when published | `Open Casting` |
| Tests underway | `Inspect camera tests` | `Open Casting` |
| Results ready | `Review camera-test results` | none that bypasses required acknowledgement |
| Results complete / direct package legal | `Assemble package` | `Open Casting history` |
| Hard blocker | Remedy verb if currently legal | `Open Casting` |

The current browser lot cue publishes review, active, queued, and ready-to-plan attention. The
complete/direct-Package local state and any history route in this table are **P04A inspector/read-
model extensions**, not claims about the existing lot cue.

No local action performs an implicit cast or Greenlight.

---

# 8. Audition model

## 8.1 What camera tests are for

The camera test buys **one additional role-specific observation** where the ordinary public Fit
view is not perfect. It does not improve the person, reroll talent, negotiate employment, or predict
the finished film.

The player should understand this before starting:

```text
CAMERA TESTS FOR <TITLE>
Lead             Candidate A + Candidate B
Antagonist       Candidate C + Candidate D
Support          Candidate E + Candidate F

Commitment       1 week · 1 shared Development & Casting slot
Cash             No audition fee; ordinary payroll/overhead continue
Talent           No signing, reservation, hold, or busy state
Result           One stored Est. range per person/role; no winner is selected
```

## 8.2 Exact current slate law

P04A must preserve, not simplify, the current TypeScript rule:

- exactly two distinct candidate IDs in each fixed actor slot: `lead`, `antagonist`, `support`;
- at least three unique people over all six reads;
- one person may read for more than one role;
- every audition candidate is a primary Actor;
- every candidate is currently contracted or in the current freelancer market;
- every candidate is currently not busy and is not the screenplay's locked writer;
- submission revalidates the entire slate atomically; and
- candidate selection order is presentation, while persisted pair order remains authoritative.

The UI presents `2 of 2` per role and `N unique people`; it does not expose Hall-matching jargon.

Current camera-test planning has a hard primary-Actor rule, and ordinary browser Package discovery
uses primary-role pools. Direct Core Greenlight role checks are broader: they check that the
discipline skill object exists, and every current `Talent` has all four discipline skill objects,
so cross-primary-role talent can pass that layer. P04A does not widen discovery ad hoc in Unity: it
preserves the currently surfaced primary-role pools and lets Core revalidate. A broader
multi-hyphenate discovery policy is later work.

## 8.3 Lifecycle and time

| State | What is authoritative | What the player sees |
|---|---|---|
| Planning | Local UI draft only | Six explicit reads; incomplete/duplicate reason; exact consequence |
| Queued request | Queue entry; no session, reservation, hold, cash, or production identity yet | `Waiting for Development & Casting`; requested project/slate; revalidation warning |
| `auditioning` | Persisted `CastingSession`; one reservation; due week = start + 1 | Candidates attending; facility/slot; due Week N; no results yet |
| `review` | Reservation released; six persisted result observations; sim decision stop | `Results ready`; role-by-role Est. ranges; current availability |
| `complete` | Same immutable evidence; acknowledgement recorded | Evidence follows candidates into Package; no selection/assignment |

Opening the workspace consumes no time. Starting a session consumes no immediate week. The player
advances the one authoritative studio clock. When due work completes, Casting Review participates
in the existing decision-stop/auto-pause order; the workspace and camera do not open/move by
themselves.

## 8.4 What the result means

Current Core computes a role-specific observation from actual execution plus deterministic noise,
then stores `estimate`, `low`, and `high`. The visible label is `Est.`. The range is evidence, not
a guarantee, and must be shown beside—not arithmetically blended with—Fit.

The presentation order is:

1. candidate identity and tested role;
2. `Camera test · Est. N · N–N`;
3. current `Fit N` as a separate pre-existing assessment;
4. concise TypeScript-authored observation strength/concern;
5. current availability and cost context; and
6. `Tested Week N` / historical status where published.

Unity must never compute a combined “audition-adjusted Fit” or rank a winner. Current calibration
found evidence complementary, not dominant; that is a reason to show both signals, not a license
to create a new score.

## 8.5 Acknowledgement without busywork

The authoritative `acknowledgeCastingSession` action is immediate, always legal in `review`, and
changes only `review → complete`. Presentation should not create a meaningless “Acknowledge” step.

- The results surface is the review.
- The clear action reads `Continue to Casting` / existing `Take results to Package`.
- Activation first commits the exact acknowledgement once, receives the authoritative successor,
  then opens the same exact project's package only if the current package gate still permits it.
  Host persistence follows the host's existing save policy; Unity must not claim an autosave unless
  that behavior is actually added and proved.
- If the package is blocked, the action reads `Finish casting review`; after success, Casting
  remains selected and names the current blocker/remedy.
- No result is preselected into a role.

## 8.6 Cancellation and repeat policy

- Before submission, Back/cancel discards the local slate draft only.
- A queued camera-test request may be canceled only through the existing published queue command.
- An active `auditioning` session has no cancellation action.
- One screenplay owns at most one append-only session: no rerun, callback, replacement, or result
  deletion in P04A.

---

# 9. Physical audition presentation

## 9.1 Minimum viable spectacle

The world must acknowledge the event without becoming an animation campaign:

- unique candidates in the active slate use current authoritative presence with
  `engagement: casting`, `credit: auditionee`, exact session owner, facility, and slot;
- those people may travel to the Casting building, wait at a marked arrival/wait zone, and cycle
  through a neutral camera-test/rehearsal-room activity;
- the selected building shows `Camera tests underway · 6 reads / N people · due Week N`;
- selecting an authoritative auditionee says `Camera test for <title> · <role(s)>` in `Doing now`;
- a restrained camera/slate icon and visible queue activity carry the state at medium/close zoom;
  management scale uses one status marker, not six labels; and
- when results resolve, the activity ceases, attention changes to decision-required, and the
  player is not forced into a camera cut.

If no trustworthy world anchor/animation is available, withhold the body animation and keep the
building/session status. Never fabricate a candidate, test room, score, queue position, or winner.

## 9.2 What the animation must not imply

- Presence is not a contract or cast assignment.
- Test order does not indicate rank.
- Applause, failure takes, judges, or expressive performance cannot imply outcome unless driven by
  explicit TypeScript presentation facts; none exist in P04A.
- A person who later becomes busy may still have historical test evidence. Their world absence does
  not erase it.
- A nearby Actor who is not in the session is ordinary lot population, not an auditionee.

The correct fantasy is “the company is testing people here,” not “Unity is simulating an acting
minigame.”

---

# 10. Role-fit explanation

## 10.1 Current truth

Current Project: Studio already exposes several distinct signals:

| Signal | Current owner | Meaning | Must not be presented as |
|---|---|---|---|
| Role OVR | `assignmentCard` / talent summary | Perceived capability in the discipline | Suitability for this exact role |
| `Fit` | `projectFit` | Current exact assignment suitability for concept/slot/shape/promise | Pure audition result; purely perceived while the actor-persona implementation tension remains |
| Expected performance band | `expectedPerformance` / package assessment | Perceived execution outlook and uncertainty | Guaranteed performance |
| Genre experience | perceived talent history | Relevant experience for discipline/genre | Automatic winner |
| Camera-test `Est.` range | persisted `AuditionResult` | Noisy role-specific actual-execution observation | New talent value, Fit replacement, or guarantee |
| Star Power | `talent.fame` | Commercial/reception signal elsewhere in the simulation | Fit or audition input |
| Availability | employment/busy checks | Current legality and opportunity cost | Historical test validity |
| Cost | contract/freelancer/package law | Payroll context or one-film fee | Salary demand negotiation |

There is an important implementation caveat: the displayed actor `projectFit` path currently reads
an actual-persona factor while other inputs and surrounding language emphasize perceived
information. P04A must preserve the current authoritative value but must not label the whole score
`fully scouted`, `known truth`, or `perceived only`. Changing that simulation law is outside this
presentation package.

## 10.2 Required explanation structure

Every important Fit presentation follows:

```text
FIT 74 · LEAD
PUBLIC SIGNALS FOR THIS ROLE
  • <TypeScript-authored positive driver>
  • <TypeScript-authored positive driver>
Concern
  • <TypeScript-authored concern, or “No material concern published”>
What can change
  • <one current actionable response, when one exists>
Disclosure
  Public signals support this assessment; Fit also includes an undisclosed role-read component.
```

Above the fold: at most two positive supporting signals, one concern, one response. More Details may show the
current public discipline skills/genre history and existing reason collection. No raw hidden skill,
persona, formula coefficient, seed, or contribution value crosses the read boundary. These reasons
are non-exhaustive supporting evidence; they must never be labelled a full causal decomposition of
actor Fit while the current actual-persona contribution remains.

## 10.3 Required small authoritative extension

Current casting evidence prose is band-based (“promising,” “fragile”) and current assignment-card
reasons are richer but do not constitute a closed, player-safe public-signal contract. P04A requires
a TypeScript-owned structured explanation projection—whether added to `castingReadModel`, an
equivalent package read model, or a shared person-assignment view—with:

- exact project ID, role slot, talent ID, and source/freshness;
- 0–2 concise positive public reasons;
- 0–1 concern;
- 0–1 actionable response only when current rules support it;
- semantic kind in addition to color; and
- no formula reconstruction or hidden values.

This is a read-model/bridge extension, not a new Fit mechanic. If TypeScript cannot publish this
contract, Unity may show current Fit/OVR/genre/evidence facts but may not invent driver prose.

---

# 11. Candidate information hierarchy

The established applicant-dossier language evolves from “Should I hire this person?” to “Should I
cast this person in this exact role?” It remains the same person system, not a new art language.

## 11.1 Candidate row — one-glance scan

In order:

1. portrait/avatar and full name;
2. primary profession and contract badge (`Studio` / `Freelancer`);
3. large role OVR;
4. large exact-role `Fit`;
5. camera-test badge and `Est. range` for this role, or `Not tested`;
6. availability state with text/icon;
7. authoritative current project-cost label—in P04A's managed/economy-engaged path, the applicable
   one-film freelancer fee or `On studio payroll` rather than a fake contracted per-film cost;
8. one strongest relevant public reason; and
9. `Compare` and `Inspect` affordances.

The row never contains an assignment commit on mere selection. `Choose for <Role>` is a distinct,
explicit control after the row is selected/expanded.

## 11.2 Selected dossier

The selected candidate owns roughly the right 32–36% of a wide Casting workspace:

- portrait, name, profession, contract/availability;
- `OVR` and `<Role> Fit` as separate large values;
- expected-performance band and uncertainty label;
- camera-test observation for the selected role, including tested/not-tested/historical state;
- up to two public supporting signals, one concern, and the actor-Fit disclosure;
- relevant perceived genre experience;
- Star Power in a clearly titled `Commercial signal` block;
- current assignment/conflict and precise availability consequence;
- authoritative project-cost status; in P04A's managed/economy-engaged path, one-film freelancer
  fee or studio-payroll status;
- actions: `Choose for <Role>`, `Pin to compare`, `Locate in world` when present, and `Open Profile`;
  and
- More Details for the current public skills/history.

## 11.3 Information deliberately absent

No chemistry, Director compatibility, salary negotiation, role archetype, appearance/age Fit,
audition dialogue, hidden actual skill, guaranteed performance, predicted awards, or predicted box
office is shown unless a future TypeScript model explicitly publishes it.

---

# 12. Side-by-side comparison

## 12.1 Interaction contract

1. Select a role slot; that role becomes the comparison context.
2. Candidate rail sorts by current default Fit but labels sorting and never says `Best`.
3. `Pin to compare` adds a candidate without selecting/assigning them.
4. Two columns is the default comparison. Wide viewports may support three or four; narrow viewports
   show two at a time with an explicit pinned-candidate selector.
5. Every column repeats portrait, name, selected role, contract state, and availability so identity
   cannot be lost while scrolling.
6. Rows align exactly; the current higher/lower difference uses arrow/text and weight, never color
   alone.
7. `Choose <Name> for <Role>` is explicit at the candidate column and updates only the Package
   draft.
8. Replacing a draft choice is reversible; the former person remains available if current law
   permits.

## 12.2 Aligned rows

Display only current authoritative rows, in this order:

| Row | Why it is above the fold |
|---|---|
| Availability / current work | A great but unavailable candidate is not a choice |
| Exact-role Fit | Central suitability signal |
| Camera-test Est. + range | New evidence the player spent time to obtain |
| Role OVR | Separates broad capability from Fit |
| Expected performance band | Shows uncertainty and production outlook |
| Relevant genre experience | Explains creative history |
| Star Power | Separates commercial draw from creative Fit |
| Fee/payroll status | Makes business tradeoff explicit |
| Top strengths / concern | Explains causes in plain language |
| Current assignment/opportunity cost | Explains why using the person matters elsewhere |

More Details may expose public skills and work history. Radar charts, 20-column attribute tables,
color-only winners, and an auto-combined score are rejected.

## 12.3 Comparison limits

- A candidate may be compared even if now unavailable; their column is read-only and explains why.
- An auditioned candidate remains comparable even if not currently legal.
- A candidate may appear in several role pools, but comparison context is always one role at a
  time; evidence for Lead never appears as Support evidence.
- The same person cannot occupy more than one credit in the current film. Selecting a conflicting
  draft candidate names the occupied slot and offers `Move from <Role>` only if current presentation
  can perform the complete reversible draft edit; it never dispatches two partial authoritative
  actions.

---

# 13. Role-slot design

## 13.1 Current authoritative package

For an accepted screenplay, the workspace uses exactly the current package truth:

```text
Screenplay writer       locked from accepted ScriptProject; visible, not replaceable here
Director                required
Lead                    required actor slot
Antagonist              required actor slot
Support                 required actor slot
Production/Craft Lead   required on the engaged-economy path
```

The current TypeScript names are `lead`, `antagonist`, and `support`; do not generalize them into
unsupported `Lead 1/Lead 2` or invent screenplay role counts. The writer appears in the header and
company rail because they are part of the package, but Package assembly cannot replace the locked
credit.

## 13.2 Slot states

| Slot state | Treatment | Allowed action |
|---|---|---|
| Empty | Neutral portrait well, role name, `Unfilled`, concise requirement | Select role; browse candidates |
| Candidate inspected | Role selected; candidate dossier active; slot remains unfilled | Compare; choose explicitly |
| Draft-filled | Portrait/name, Fit, availability, fee status, `Package draft — not committed` | Inspect, replace, remove |
| Conflict | Warning icon/text, exact other credit or current work | Resolve draft conflict / choose another |
| Stale/unavailable | Keep identity, strike no history; show `Unavailable now` and reason | Replace/remove; profile/locate if valid |
| Greenlight-blocking | Role and blocker summarized in readiness rail | Select slot; take remedy |
| Committed | Only after accepted Greenlight; workspace closes to production response | No package edit in P04A |

The role rail remains visible throughout candidate browsing, comparison, and review. On narrow
screens it becomes a horizontal/paged slot strip above the current candidate; it does not collapse
into an unlabeled step counter.

---

# 14. Director selection

The Director is a distinct creative owner, not an actor candidate with a renamed heading.

Current P04A Director hierarchy:

1. portrait/name and `Director` profession;
2. directing OVR;
3. project Fit for directing;
4. expected-performance band;
5. perceived genre experience;
6. current availability/assignment;
7. studio-payroll or freelancer-fee consequence;
8. current public strengths and one concern;
9. Star Power only where the current package/reception presentation already makes it relevant; and
10. `Choose as Director`, Compare, Locate, Profile.

There is no Director audition result in current authority. Actor camera-test evidence must not be
reused, averaged, or presented as Director compatibility. The current browser-only `teamDirection`
preview reads hidden actual traits and is **REJECTED** for P04A. `creativeCohesion` in Core is a
different, talent-independent brief-shape/promise/audience measure; it must not be presented as
Director/cast chemistry or as a consequence of changing this slot. Candidate changes may show only
the safe TypeScript-published package-delta fields.

Director may be selected before or after actor roles. The workspace keeps role order—Director
first—without imposing a simulation gate that does not exist.

---

# 15. Crew / Extras ruling

## 15.1 Historical ruling

The original's strongest scalable pattern was automatic basic Crew/Extra fill with a clear shortage
gate. It preserved the fantasy that films need many workers without requiring the player to cast
every ordinary body.

## 15.2 Current Project: Studio truth

Current Package authority has one required **Production/Craft Lead** on the engaged-economy path.
There is no ordinary Crew pool, Extra pool, quota, individual Extra assignment, or Crew/Extra
shortage model. The current label `Crew / Craft` in legacy presentation must not be read as evidence
of such a system.

**P04A contract:**

- show and require the current Production/Craft Lead exactly;
- do not show fake `Crew 0/8`, `Extras 0/20`, anonymous headcount, or empty individual worker slots;
- do not create “auto-fill complete” prose for systems that do not exist; and
- Greenlight readiness must not claim a Crew/Extras blocker.

## 15.3 Future policy

If a future simulation introduces ordinary Crew/Extras, default handling should be pool/capacity
auto-fill or departmental allocation. The player intervenes only for shortages, unusual skill
requirements, named department heads, specialist roles, or deliberate overrides. Growth reduces
repetition, not consequence.

---

# 16. Package / Greenlight review

## 16.1 Package identity

The review is not a second candidate browser. It answers “What exactly are we committing?” in one
large readable surface.

Header, always visible:

- title, genre, screenplay provenance/assessment where currently published;
- locked writer;
- `Package draft — not committed`;
- `N of 5 required package roles filled` (Director + 3 actors + Craft Lead on the current engaged
  path); and
- current Greenlight status: `Incomplete`, `Blocked`, `Ready`, or `Will queue`.

## 16.2 Review hierarchy

1. **Attached company:** portrait/name/role for writer, Director, Lead, Antagonist, Support, and
   Production/Craft Lead. Missing/stale roles are unmistakable.
2. **Creative package:** per-assignment Fit; strongest and weakest assignment; severe mismatch if
   current authority publishes it; expected-performance uncertainty. Core's talent-independent
   brief cohesion may appear separately as screenplay/project context, never as team chemistry.
3. **Audition evidence:** small role-specific badge on tested actors and an expandable result; no
   duplicated result wall.
4. **Financial commitment:** Production Budget, Marketing, applicable P04A managed-path one-film
   freelancer fees, total immediate
   commitment, cash after, runway, exposure, and solvency.
5. **Commercial outlook:** current TypeScript forecast range and uncertainty framing; never hidden
   actual outcome or guaranteed box office.
6. **Physical demand:** required sets/locations and current published set plan; distinguish advisory
   downstream demand from a current hard gate.
7. **Capacity/timing:** starts now or joins authoritative Development & Casting queue; a queued
   package has no production identity, commitment, reservation, or cast lock until admission.
8. **Blockers/remedies:** exact current blocker, consequence, and smallest legal response.
9. **Commit action:** explicit title-bearing Greenlight/Queue Greenlight action.

There is no aggregate `Package Quality = 82`. Existing aggregate/supporting assessments may remain
as secondary summaries only when weakest role and supporting facts stay visible.

## 16.3 What happens after confirmation

On accepted immediate Greenlight, TypeScript atomically validates the full current package,
deducts current authorized commitments, locks participants, creates the managed production/workflow
and any authoritative current-phase reservations, links the screenplay, and returns the
authoritative successor. Stage/set reservations may arise later through phase allocation and must
not be implied at Greenlight. Unity shows the accepted receipt, closes only the package layer,
retains the lot/camera, and paints the exact new production/company state. External persistence is
the host's responsibility under its existing save policy.

On accepted queued Greenlight, the UI says `Greenlight queued`, explicitly states that no production
identity, budget, or talent commitment exists until admission/revalidation, and returns to the lot.

On rejection, no state/save changes. The workspace, role draft, selected slot, candidates, filters,
comparison pins, and scroll remain. The exact TypeScript error is translated into player language
without changing its meaning; the old intent cannot be replayed.

---

# 17. Why not always pick the highest Fit?

## 17.1 Already modeled — surface now

| Tradeoff | Existing truth | Required presentation |
|---|---|---|
| Exact role Fit vs general capability | Fit and OVR are distinct | Show side by side; never collapse |
| Fit vs observed camera test | Fit and noisy `Est.` are distinct signals | Show adjacent with range/source; never average in UI |
| Creative Fit vs commercial draw | Star Power is separate and affects downstream commercial/reception paths | Label `Commercial signal`; never call it Fit |
| Fit vs cost | In P04A's managed/economy-engaged path, studio talent has no new per-film fee and freelancers do | Show the exact authoritative cost label before choose/Greenlight; never universalize this to legacy regimes |
| Fit vs availability | Busy/current assignment law can remove a candidate | Name conflict and affected work; no silent disable |
| One role vs whole package | Full package assessment exposes per-assignment, strongest/weakest, severe mismatch, and forecast context | Show a safe TypeScript preview beside—not falsely attributed to—the narrower PackageDelta |
| Creative upside vs capital risk | Package budget/fees, cash after, runway, exposure, forecast range | Review before Greenlight |
| Camera tests vs speed/capacity | Tests cost one week and one shared slot | Consequence before test; no claim they are free |

Current `assessPackageDelta` is a useful but bounded source: it publishes per-assignment and overall
Fit changes, execution-confidence change, revenue/profit/break-even range changes, cast Star Power,
and `salaryDelta`. The comparison surface may place a separate TypeScript full-package preview
beside those fields—for example current strongest/weakest assignment, availability, and exact cost
breakdown—but must not claim those extra facts came from `assessPackageDelta`. Brief cohesion is
talent-independent and must not appear as a candidate-change delta. No surface declares a winner.

## 17.2 Small authoritative extension

P04A needs a structured TypeScript/bridge projection for:

- player-safe public Fit-supporting signals plus the required actor-Fit disclosure;
- exact candidate/card fields already available in the browser;
- role-specific audition evidence and source/freshness;
- package-draft assessment/delta for the exact proposed choices; and
- current opaque commit intent after TypeScript validates that exact draft.

This publishes existing laws; it does not add friction.

## 17.3 Future system — deliberate campaign only

- persistent provisional attachments/holds;
- contract negotiation and salary demands;
- Director/actor working relationships or chemistry;
- role archetypes/casting brief beyond current fixed slots;
- callbacks, chemistry reads, alternate scene tests, or casting-director staff;
- schedule-window/market timing beyond current availability/queue law;
- repeat-collaborator and ensemble effects;
- ordinary Crew/Extras pools and specialist downstream roles; and
- a fully perceived-only actor Fit model, if the Owner chooses to change current authority.

## 17.4 Reject

- random Fit penalties merely to stop optimization;
- fatigue, ego, appearance, age, chemistry, or delay claims absent from the current model;
- a “balanced cast” tax with no authoritative cause;
- hiding current useful information to manufacture suspense;
- a universal automatic “best cast” button;
- fake predicted awards/box office; and
- a test minigame whose animation decides the score.

---

# 18. Time / attention / auto-pause

## 18.1 One clock

Casting uses the existing weekly simulation only.

- Opening or closing an inspector, candidate dossier, comparison, or package review advances no
  time and does not itself change the authoritative pause reason. Time moves only through the one
  existing Living Time command; modal input law may make that command unavailable while a retained
  decision surface is on top.
- Starting camera tests creates/queues the authoritative action but does not advance the week.
- Active tests show due Week N and weeks remaining from TypeScript, never a Unity countdown.
- The player advances Living Time through the existing control.
- Due casting sessions resolve in the existing tick order and release their shared slot before later
  production allocation in that week.
- A casting-review decision triggers the existing sim-to-event stop/auto-pause. The time HUD names
  the reason.
- Closing the review/workspace does not resume automatically.
- Greenlight/package comparison itself advances no time.
- A queued Greenlight waits on the same authoritative time/capacity system; Unity never predicts
  admission.

## 18.2 Attention law

| State | Building attention | Interrupt? |
|---|---|---|
| Ready screenplay, legal tests | Positive invitation | No auto-pause |
| Ready but hard blocker | Warning with reason | No auto-pause unless existing global law says so |
| Auditions queued | Warning/waiting | No repeated notification spam |
| Auditions underway | Active | No interruption |
| Results ready | Decision-required | Existing auto-pause; one alert/receipt |
| Package draft incomplete | Workspace-local | No world alert; draft is not authoritative state |
| Greenlight queued | Waiting | No fake production attention |
| Production formed | Accepted receipt/world response | No automatic camera movement |

---

# 19. World vs retained-workspace allocation

Package 02 remains binding:

> Notice → Hover → Select → Understand locally → act locally or open deeper work → return to the
> exact context.

## 19.1 World-native / local inspector

- notice Casting state and attention;
- hover building/person;
- select without consequence;
- read exact project/session/phase/due/role-fill summary/blocker;
- Focus only on explicit Focus/double-select;
- Locate Casting or a currently present candidate;
- open the current camera-test/package workspace;
- advance/pause time using the existing HUD;
- inspect an auditionee's current task; and
- acknowledge a simple completed/queued receipt after the authoritative transition.

No candidate selection, role assignment, audition submission, or Greenlight occurs on world click.

## 19.2 Complexity-earned retained workspace

- choose exact screenplay when multiple;
- build the six-read audition slate;
- review six role-specific results;
- browse/filter candidates;
- inspect and compare 2–4 people;
- fill/replace/remove Package draft roles;
- inspect package deltas, costs, forecast, capacity, and blockers; and
- Greenlight explicitly.

At wide desktop sizes, use a right-anchored large workspace no wider than roughly
`min(1120px, 82vw)`, inset 24–32 px, maximum height around `88dvh`, with one internal scroll owner
and enough retained lot to preserve place. These are existing accepted retained-workspace geometry
envelopes, not a new art style. On compact screens it may become a bottom sheet/full-viewport sheet
while the same lot remains mounted behind it.

## 19.3 Back, Locate, and exact restoration

- `Back` from Profile returns to the same candidate/role/dossier scroll.
- `Back` from comparison returns to the same selected slot and candidate rail.
- `Back` from package review returns to package drafting, not the lot.
- `Back` from the root Casting workspace closes only that layer and restores the exact Casting
  selection, camera, zoom, focus, project, and opener.
- `Locate candidate` pushes workspace origin, closes/retains presentation per Package 02, selects
  the exact stable person ID, and focuses only on explicit Locate.
- Back from Locate restores the exact project, role slot, filters, comparison pins, and scroll.
- If the person has no world anchor, keep the dossier and disable Locate with `Not currently on the
  lot`; do not jump to Casting or another person.
- No state transition moves the camera automatically.

---

# 20. Era-safety notes

The architectural casting grammar must survive 1920–2040.

Era-neutral authority/presentation terms:

- `Casting Office`, `camera test` (presentation label may be era/localization governed),
  `candidate`, `role`, `package`, `Greenlight`, `available`, `current assignment`, `evidence`;
- stable person/project/role/session IDs;
- portrait asset slot rather than a permanently styled paper headshot;
- test-state animation hook rather than a fixed camera/equipment model;
- theme/token/icon layer rather than hard-coded sepia, paper folders, Polaroids, videotape, or
  digital tablets; and
- responsive workspace anatomy independent of furniture or media technology.

Do not hard-code 1948 copy, one wardrobe, one audition apparatus, typewriter forms, one room set,
or one headshot format into DTOs or interaction state. Era-specific set dressing and terminology
may be authored later through governed presentation data. P04 does not design that progression.

---

# 21. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

## REQUIRED NEXT — P04A only

1. Reuse the CP10A/Package 02 selection, Focus, inspector, origin-stack, and retained-workspace host
   for existing stable building ID `casting`.
2. Extend TypeScript-owned projections/bridge schema with exact Casting Office state, candidate
   cards, role-specific evidence, safe public Fit-supporting signals/disclosure,
   package-draft assessment, blockers,
   and current opaque intents.
3. Reuse current audition lifecycle/slate/capacity/presence/decision-stop/save laws unchanged.
4. Reuse current Assembly draft, candidate-card, package assessment, Greenlight, stale rejection,
   host save behavior where applicable, and production-formation receipt as behavior oracles;
   refactor presentation rather than duplicating authority.
5. Deliver one end-to-end screenplay-ready → optional camera test → result → role draft → compare →
   Greenlight → world-response journey for the current fixed package only.
6. Stop at authoritative Production formation.

## FOLLOW-UP

- polish multiple-ready-project Casting portfolio and history beyond P04A's first-film route;
- controller target cycling/comparison pin flows using the shared Package 02 navigation model;
- responsive/narrow-screen refinement and text-scaling proof;
- richer era-themed Casting Office activity using the same state hooks;
- package-draft autosave/persistence only if separately authorized; and
- measure whether optional camera tests produce enough economic value across mature studios.

## LATER

- persistent attachments/holds and negotiation;
- casting directors/assistants/departments;
- callbacks, chemistry reads, alternative tests, ensemble casting;
- ordinary Crew/Extras and specialist staffing;
- stunt performers/doubles;
- broader role taxonomies and multi-hyphenate discovery;
- Director/cast relationship simulation; and
- any change to perceived-versus-actual Fit authority.

## DO NOT DO

- do not move authority or calculations into Unity;
- do not start Casting from the generic memo as the primary path;
- do not make world selection perform an assignment;
- do not make camera tests mandatory or call them original *The Movies* behavior;
- do not preselect winners from audition results;
- do not expose hidden actual values or build a combined magic score;
- do not fake Crew/Extras, chemistry, age/appearance Fit, or stage gates;
- do not unmount the lot for the ordinary retained Casting flow;
- do not move the camera without explicit Focus/Locate/Follow/Home;
- do not promise a queued Greenlight has committed people, cash, capacity, or a production; and
- do not implement Production/Shooting in P04A.

## Owner decision status

No additional Owner decision is required to begin P04A **after the Owner accepts this Package 04
ruling**. The existing actor-Fit perceived/actual-persona tension and any desire for persistent
provisional attachments are genuine future simulation decisions, but neither blocks the bounded
presentation/read-model checkpoint.

---

# Source register

## Historical

- `[TM-MAN]` [*The Movies* official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), especially printed pp. 6–7, 11–16, 20, and 38. Local verified copy:
  `/Users/bruce/Desktop/big swing art/movies manual_english.pdf`.
- `[TM-PRIMA]` *The Movies: Prima Official Game Guide*, local verified copy
  `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf`; public record:
  [Internet Archive](https://archive.org/details/The_Movies_Prima_Official_eGuide), especially
  printed pp. 15, 40–43, 55, 71, 99, and 117.
- `[TM-SE]` [*The Movies: Stunts & Effects* official manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), especially printed pp. 4–10.
- `[TM-MAC]` [Macinplay, *The Movies: Superstar Edition* review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), secondary evidence.
- Owner-local direct captures (optional inspection artifacts; the public manual/Archive sources
  above are the reproducible fallbacks):
  `/Users/bruce/Desktop/big swing art/Screenshot 2026-08-17 at 11.37.40 AM.png`,
  `/Users/bruce/Desktop/big swing art/Screenshot 2026-08-17 at 11.38.00 AM.png`, and
  `/Users/bruce/Desktop/big swing art/Screenshot 2026-08-17 at 11.40.24 AM.png`.
- Local reconstruction corpus:
  `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` and
  `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-SOURCE-REGISTER.md`.

## Modern

- `[FM]` [Football Manager — Recruitment Revamp](https://www.footballmanager.com/features/recruitment-revamp), “Squad Planner and Experience Matrix” and “Scouting Enhancement.”
- `[M19]` [Madden NFL 19 official text manual](https://www.ea.com/able/resources/madden-nfl/madden-nfl-19/pc/manual), Franchise `Hub`, `Improving Your Team`, `Scouting`, `Lineup`, `Players`, `Compare Stats`, and `Depth Chart`.
- `[M26]` [Madden NFL 26 Gameplay Deep Dive](https://www.ea.com/games/madden-nfl/madden-nfl-26/news/madden-26-gridiron-notes-gameplay-deep-dive), “Depth Chart Positions.”
- `[SI]` [Software Inc. developer GUI/mechanics article](https://softwareinc.coredumping.com/fifth-update-gui-and-game-mechanic-details/), “Development cycle,” “Creating products,” and “Hiring staff”; and [official wiki Quickstart](https://softwareinc.coredumping.com/wiki/index.php?mobileaction=toggle_view_mobile&title=Quickstart_Guide).
- `[PZ]` [Planet Zoo official Update 1.2.1 notes](https://store.steampowered.com/news/posts/?appgroupname=Planet+Zoo&appids=703080&enddate=1592906478) and [Update 1.3.1 page](https://store.steampowered.com/news/posts/?appids=703080&enddate=1599123883&feed=steam_community_announcements), whose embedded `1.3.0 Update Notes` → `UI` section documents staff multi-select.

## Current Project: Studio authority inspected

- `docs/CASTING-SESSIONS-V1-CONTRACT.md` and closure;
- `docs/WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CONTRACT.md` and closure;
- `docs/WORLD-FIRST-LOT-NATIVE-CASTING-REVIEW-INTERVENTION-V1-CONTRACT.md` and closure;
- `docs/WORLD-FIRST-LOT-RETAINED-PACKAGE-GREENLIGHT-WORKSPACE-V1-CONTRACT.md` and closure;
- current Core/browser/bridge paths enumerated in the Builder Annex; and
- sealed Unity paths enumerated there from exact commit
  `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`.
