# PROJECT: STUDIO — SUCCESS BLUEPRINT

**The canonical answer to one question: what must Project: Studio ultimately become for the
Owner to consider the modern successor to *The Movies* successful?**

> Recorded 2026-08-18. Base: canonical `main` @ `1e6b422`
> (*"docs(pf1): FREEZE — Owner rulings applied; commercial red-team reconciled; charter canonical"*).
> Branch: `docs/project-studio-success-blueprint`. **Documentation only.** No production code,
> test, schema, asset, tuning value or mechanic is changed, authorized, scheduled or scoped by
> this document.

---

## HOW TO USE THIS DOCUMENT

This Blueprint is the **destination**. It is not a plan, not a charter, and not a backlog.
It tells you what "finished" looks like so that the thing you are building this month can be
checked against it. Read it, then read past it — it deliberately does not tell you what to do next.

**A future PM should read, in this order:**

1. **This Blueprint** — to understand the destination: the fifteen pillars, their success tests,
   and how far each one currently is from being real.
2. **`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`** (and the sections this document cites) — to
   understand the **historical floor**. The original game's major systems are the design floor,
   not the ceiling. Do not design an original-derived mechanic without reading its section first.
3. **Current Owner rulings and `THE-MOVIES-PARITY-MASTER-PLAN.md`** — to understand **sequencing**.
   The Master Plan decides order. This Blueprint decides destination. Where they appear to
   disagree about *when*, the Master Plan and the newest Owner ruling win.
4. **The active Campaign Charter** — to understand **what may be implemented right now**.
   A pillar appearing in this document authorizes nothing. Only a charter does.
5. **Existing Project: Studio code, recovered *The Movies* schemas, and mature
   license-compatible open-source implementations** — before inventing a new subsystem.
   See the two Permanent Development Laws below.

**What this document must never be used for.** Naming a pillar does not authorize it. Naming a
campaign does not schedule it. A "FUTURE" classification is a statement about product direction,
not a commitment, a date, or a licence to start. If you find yourself citing this Blueprint as
permission to build something, you have misread it — go find the charter.

---

## THE OWNER NORTH STAR

Project: Studio should cause a veteran player to think:

> ### "This is *The Movies*."
>
> ### …followed immediately by: "Holy shit, this is what *The Movies* should be today."

Both halves are load-bearing. The first half fails if a veteran cannot recognize the major
systems — this is not a loose spiritual successor. The second half fails if we ship a prettier
version of the original's chores.

**The horizon.** The game begins in **1920**. There is **no hard calendar game-over**. Authored
progression intentionally supports play through **at least 2040**, and the simulation may continue
beyond it.

**The philosophy.**

> ### USE REAL CINEMA HISTORY. CREATE OUR OWN LEGENDS.

The eras, the technologies, the economics and the cultural weather are drawn from real cinema
history. The people and the studios are **fictional**, and they are ours. Every save should
generate its own alternate history of Hollywood — its own stars, its own dynasties, its own
studios that rose and fell — against a real historical backdrop. We do not license real names.
We build a world in which invented names become as familiar as real ones.

---

## THE BAR, AND THE THREE THINGS "TEDIUM" ACTUALLY MEANS

### The bar

> *The 2005 game shipped once, on a disc, unpatched, and still won a BAFTA and produced
> **The French Democracy**. That is the bar.*

Every pillar in this document is graded against a simple question before it earns credit for doing
anything modern: **does it clear what a single-release, never-patched, twenty-year-old game already
proved was possible?** The Magic 15 is the floor. The tedium record is the ceiling on how much of
that magic is allowed to cost the player.

### The structural finding that should shape every campaign

The original's complaints are **not** distributed evenly across its design. Four of the five
structural P0/P1 pillars — the living lot, the drag-and-object pipeline, the player-built
construction, and the scoring mechanism itself — carry **no recorded player complaint at all.** The
Bible's own phrasing is that criticism "clusters on the life-sim layer riding on top of it, not the
drag-to-assemble core."

Every documented complaint attaches to one of four places: the **life-sim layer** on top of the
core, the **legibility layer**, the **authoring mode**, or the **expansion**. The core loop was
never the problem. That is the most actionable structural conclusion in the entire historical
record, and it means the successor's risk is not in the parts we have already built well.

### "Remove the tedium" is three different instructions

A document like this one can do real damage by treating them as one. They are:

1. **Workload tedium** — the same action repeated with no new decision content: venue-dragging,
   dragging a star back to set, per-star nannying multiplying with studio size, a second stat-block
   role bolted on, and an always-on stress bar the player is expected to monitor **even when nothing
   is wrong.** *The fix is fewer repetitions and a surfacing threshold* — a deterministic path from
   state to reason code to explanation to an aggregated signal, always drillable back to real
   entities, **never one alert per person per tick.**
2. **Legibility tedium** — not workload at all. An undisclosed quality formula meant a player could
   grind the *wrong lever* forever. In the Bible's words: *"more repetition would never have fixed
   that, only clearer feedback would."* **The fix is diagnostics, not streamlining.**
3. **Capability and balance tedium** — a hiring queue too slow to be a decision, costume persistence
   confusion, an export pipeline weak enough to push creators out of the product. *The fix is giving
   the player a lever they did not have.*

**Applying the wrong fix to the wrong class is the failure mode.** Streamlining a legibility problem
removes information the player needed; adding diagnostics to a workload problem explains a chore
without removing it.

### One frame that contains the whole design problem

A single Owner screenshot — a night horror shoot — is cited by the Bible **twice**, for opposite
reasons. It is evidence of the **most-loved** thing in the game: a named character standing on set
with a bubble reading *"Wanting a chat,"* the emergent soap opera players still talk about twenty
years later. It is also evidence of the **most-criticized**: the floating Work/Stress bar hovering
over the crew, always on, demanding monitoring even though nothing is going wrong.

**One frame, both verdicts.** The same surface carries the magic and the tax. Separating them —
keeping the character who wants a chat, removing the bar that must be watched — is, in a sentence,
what this entire Blueprint is asking for.

---

## AUTHORITY HIERARCHY

This hierarchy is explicit and ordered. When two sources conflict, the higher number does not win —
the **lower** number establishes what *was*, and the higher number establishes what we *do about it*.

### 1. HISTORICAL AUTHORITY — what *The Movies* actually did

`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` ("THE MOVIES 2005 — ORIGINAL-GAME RECONSTRUCTION
BASELINE v1.0"), specifically:

- **Owner Product Authority** (17 Aug 2026) — the ruling that historical milestone non-goals are
  not permanent product cuts unless explicitly reaffirmed as such.
- **Fable PM Front Door** — the compressed original fantasy, core loop and Lot Law.
- **The Magic 15** — the ranked list of what the original got right.
- **§§1–37** — the historical reconstruction, with per-section `A. ORIGINAL GAME RECONSTRUCTION`
  (history) and `B. PROJECT: STUDIO SUCCESSOR RULING` (direction) subsections.
- **§38** — the 35-row parity matrix.
- **§39** — PRESERVE / MODERNIZE / DEEPEN / REPLACE / CUT rulings.
- **§40** — The Modern *The Movies* Successor.
- **§41** — the production backlog and the Deferred Major-Parity Pillars.

**Historical sections establish what the original actually did. Do not rewrite history to match
successor design.** If a successor decision departs from the floor, say so out loud and record it
as a departure — never by quietly amending the historical account.

### 2. TECHNICAL HISTORICAL EVIDENCE — recovered engine schemas

`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md` — evidence about *The Movies* itself, recovered
from community mod packages. Useful for original-engine schemas and patterns.

**Respect its two-confidence model absolutely.** *Schema confidence* (does this field exist, in
this shape?) is entirely separate from *vanilla-value confidence* (was this the value the retail
game shipped?). A mod whose stated purpose is to change staffing numbers is strong evidence that a
staffing field exists and worthless evidence about what that field contained in 1920. Never promote
a modded value to a historical fact.

### 3. CURRENT OWNER AUTHORITY — newer rulings that supersede older exclusions

Newer explicit Owner rulings supersede historical milestone exclusions where they conflict.
The rulings currently in force that this Blueprint is built on include the 1920 start with no hard
calendar game-over and a ≥2040 authored horizon; the ruling that the present 30-concept film pool
is not a lifetime product cap and that existing concept identities are permanently immutable;
the ruling that no-hard-bankruptcy applies to the **player's** studio and does not forbid future
**rival** distress; and the ruling that rival studios, multi-studio awards, film-library economics,
dynasties and acquisitions are legitimate long-term product directions that are **not currently
authorized scope**.

The governing framing for every such item is now:

> **Not current scope unless explicitly authorized by the Owner or the current campaign.**

This **replaces** any framing that presented these as permanent, non-negotiable product exclusions.
Non-goals are not erased — they are reframed. Whether any given item is *permanently* excluded
remains an Owner call that this document does not make.

### 4. MASTER PLAN / CAMPAIGN CHARTERS — sequencing and implementable scope

`THE-MOVIES-PARITY-MASTER-PLAN.md` and the active campaign charter determine order and what may be
built now. **The Success Blueprint does not replace them and cannot override them.** This document
says where we are going. They say what we are doing.

---

## THE TWO PERMANENT DEVELOPMENT LAWS

These are not campaign rules. They apply to every campaign, forever.

> **They are lettered, not numbered, on purpose.** `docs/SHIFT-OPERATIONAL-LAWS.md` already owns the
> integers 1 through 28. Publishing a "Law 1" and a "Law 2" here would collide with operational law
> 1 (*engine owns law*) and law 2 (*animation may acknowledge a command, never complete one*) for
> any agent briefed on both documents. **These are LAW A and LAW B and should stay that way.**
>
> Neither law duplicates an existing operational law. Both have **precedent** there, and the
> precedents are worth citing rather than restating: law 28 already forbids filling a contract gap
> with a guess; law 27 records known refutations that must not be re-attempted; law 22 enforces a
> single capacity union rather than a parallel second one; and **law 23 is LAW B's real enforcement
> mechanism** — zero `Math.random`, verified by a hygiene test that scans for the literal string.

### LAW A — SOURCE-FIRST DESIGN

> **Before designing or modifying any mechanic derived from the original game, consult the
> relevant Mechanics Bible section and supporting research first.**

The original game's major systems are the **design floor**. A mechanic designed without reading
what the original did is not a modernization — it is a reinvention that happens to share a name,
and it will drift from the recognizability the North Star depends on.

Newer explicit Owner rulings control **how** Project: Studio modernizes, deepens, streamlines,
rebalances or expands a floor mechanic. They do not license skipping the reading.

**In practice:** if you are about to write a design note that contains the words "script office",
"casting", "awards", "prestige", "rank", "set", "relationship", "genre" or "era", the Bible has a
section about it. Open it first.

And if the Bible is **silent**, that silence is itself a finding. The project already says this
better than this document can, and it is quoted here rather than paraphrased because it is the
posture LAW A wants toward the historical record:

> *"If anything in it is undefined, contradictory, or unimplementable: stop and report it. Do not
> resolve it yourself. Do not fill the gap with a reasonable guess. **A silently filled gap is a gap
> nobody can find later.**"*

The same instruction adds the other half of the posture: *"When the contract and your instinct
disagree, the contract wins — and say so out loud."* Read "the contract" as whichever authority
governs — the Bible for history, the newest Owner ruling for direction, the charter for scope.
Operational law 28 already carries the same prohibition for contract gaps; LAW A extends it to the
historical record.

### LAW B — RESEARCH FIRST. REUSE FIRST. INVENT LAST.

> **Before implementing a substantial technical subsystem, look for it before you build it.**

In order:

1. **Inspect existing Project: Studio code.** The most common failure is building a second version
   of something the engine already does. Placement legality, reservation machinery, the deterministic
   RNG discipline, the save/migration architecture and the presence projection are all real,
   proven substrate — extend them rather than paralleling them.
2. **Inspect the recovered *The Movies* mechanics and schemas.** The original engine's own data
   architecture is evidence, not decoration. Where it solved a problem well, that solution is
   already validated against this exact genre.
3. **Inspect mature, license-compatible open-source implementations and established algorithms.**
   For genuinely general problems — pathfinding, spatial indexing, scheduling, layout, text
   generation grammars, compression, serialization — a well-maintained solution usually beats a
   bespoke one.
4. **Write bespoke code only when reuse would produce worse architecture, determinism, licensing,
   security, maintainability or product fit.**

**Do not force reuse.** A dependency dragged in to satisfy a rule is worse than fifty lines of
native code. The law asks you to *look* before you build, and to be able to say why you chose what
you chose. It does not ask you to prefer the third-party option.

**Determinism is the hard gate, and it is already enforced.** Any candidate that introduces unseeded
randomness, wall-clock dependence, or floating-point instability across platforms fails the fit test
regardless of how mature it is — and operational **law 23** will catch the first of those
mechanically, since a hygiene test scans `src/` and `tests/` for the literal string `Math.random`.
Treat law 23 as this law's teeth. Step 1 also has existing precedent worth honouring: operational
law 22 exists precisely because capacity was at risk of being modelled twice, and law 27 records
approaches already tried and refuted here — reading it is step 1 applied to the project's own
history rather than its code.

---

## THE FIFTEEN SUCCESS PILLARS

Each pillar records the original fantasy, the successor target, what we explicitly improve, the
tedium we reject, current status, the campaign expected to close it, and one plain-English
**SUCCESS TEST**.

### Status classification

| Status | Meaning |
|---|---|
| **PROVEN** | Accepted implementation **and** playtest/closure evidence supports the player-facing success test. |
| **IN PROGRESS** | Authorized and actively being built or planned by a named, live campaign. |
| **PLANNED** | Owned by a named campaign in the current sequence, not yet started. |
| **FUTURE** | A legitimate long-term product direction with no position in the current frozen sequence. |
| **OWNER RULING REQUIRED** | Blocked on a decision only the Owner can make. |

**The bar for PROVEN is deliberately high.** Architecture existing is not proof. A passing unit
test is not proof of a player-facing outcome. A document claiming completion is not proof. A pillar
is PROVEN only when real implementation plus accepted playtest evidence supports the success test
as a player would experience it.

### Where the fifteen pillars stand today

| # | Pillar | Status | Owner |
|---|---|---|---|
| 1 | The lot is the game | **IN PROGRESS** | C2 + C3 |
| 2 | The studio lives without the player | **IN PROGRESS** | C2 |
| 3 | Writers create movies | **IN PROGRESS** | C2 → C4 |
| 4 | Screenplays become physical productions | **IN PROGRESS** | C2 |
| 5 | Quality is not success | **IN PROGRESS** | distributed; calibration at C6 |
| 6 | People become legends | **IN PROGRESS** | C5 *(tentative)* |
| 7 | The lot has a social history | **PLANNED** | C5 *(tentative)* |
| 8 | Live through cinema history | **PLANNED** | C4 |
| 9 | Progression feels like a career | **PLANNED** | C3 |
| 10 | Awards create history | **PLANNED** | C3 |
| 11 | Hollywood exists outside the gate | **FUTURE** | none — not sequenced |
| 12 | Movies become history and assets | **FUTURE** | none — not sequenced |
| 13 | Build a studio empire | **FUTURE** | none — not sequenced |
| 14 | Creative authorship | **OWNER RULING REQUIRED** | conditional on a scope ruling |
| 15 | Sandbox / player freedom | **PLANNED** | late; timing itself unruled |

**Not one pillar is PROVEN, and that is the correct reading.** Several have genuinely proven
*halves* — the world-native grammar and the sealed lot catalog under Pillar 1, the deterministic
engine authority under Pillar 2, tiered script offices under Pillar 3, validated persistent careers
under Pillar 6, the durable film record under Pillar 12. Each of those is named where it occurs.
But no pillar's full player-facing success test is yet supported by accepted evidence, and this
document will not round any of them up.

The Master Plan says the same thing in one sentence, and it is the most useful summary of the
project's current position anywhere in the corpus:

> ### *"The first film is now excellent; the tenth film does not exist."*

That is precisely the shape of this table. The film-making chain is strong and genuinely proven in
parts. **The long game — the careers, the eras, the ladder, the rivals, the library — is almost
entirely ahead.** Every pillar that is FUTURE or PLANNED is a piece of the tenth film.

*(Note on reading the table: at this commit there is **no live implementing campaign** — Campaign 1
is sealed, PF1 is chartered, C2's charter has since frozen. Several pillars therefore sit between
the definitions of IN PROGRESS and PLANNED. Where a pillar has substantial accepted implementation
but an unmet player-facing test, it is marked IN PROGRESS with the specific gap named in its
section.)*

### THINGS THE ORIGINAL DID NOT HAVE — do not cite these as parity

Every item below was checked by full-text search against the Mechanics Bible and returned **zero
occurrences**, or exists only in a form materially weaker than it is usually remembered. They appear
in this Blueprint as **successor targets**, which is legitimate — but a later reader must never
re-read them as recovering something the original had. That re-reading is the specific failure mode
this section exists to prevent, because it converts an invention into an unexamined obligation.

| Claim to watch | The verified position |
|---|---|
| Sequels, remakes, franchises, reissues, licensing, library valuation, back-catalogue revenue, IP ownership | **Zero occurrences.** The Production Office's *Archive* room is confirmed to **exist** but its function is documented nowhere — cite it as "no evidence," never as evidence of a library. |
| Acquisitions, mergers, subsidiaries, labels, co-productions | **Zero occurrences.** "Empire" appears only as retrospective player language about crew shortages limiting expansion. |
| Mentorship, lineage, dynasties, succession | **Zero evidence of any kind.** The only documented star-making pipeline is Extra → Star. Directors are not even a mechanically separate class from Actors — one applicant queue, one stat block, one lifecycle. |
| Rivalries, feuds, gossip, soured pairings | The **Nemeses** (0–10%) and **Enemies** (11–30%) ladder bands are real — but no source documents a negative *state*, a gossip mechanic, or any player-triggerable conflict. Those bands read as unbuilt or decayed rapport on the same single scalar. **"The original had Nemeses" must never become "the original had rivalries."** |
| A production queue or scheduler | **The original had neither.** A role could sit unfilled indefinitely, and hard blocks stalled a production rather than scheduling around it. Our "queue, don't magically forbid" is an **improvement on the floor**, not a recovery of it. |
| Television, widescreen, home video, blockbuster economics, streaming, digital/VFX | **No historical floor.** "CGI" appears once, as a single item inside the research track's own description. *Specific trap:* a `televisionCompetition` field exists in **our** code — a later reader can mistake a typed field for a historical mechanic. It is ours. |
| Real-time speed values | Only the **existence** of a pause/play/fast-forward cluster is documented. No tick rate, no seconds-per-week, no multiplier exists anywhere. Every numeric speed in the successor is authored invention. |
| Named, player-visible quality stages | The five-stage architecture is single-source and uncorroborated, and the original **never showed the stages to players at all**. Surfacing them is a good idea and an invention — not parity. |
| An awards competitiveness forecast | No nominee list, no rival nominee, and no competitor presentation exists anywhere in the record. A "competitiveness" readout presumes visible rivals that have **no historical model** and are **not currently authorized scope** — it quietly drags rival modelling into an authorized campaign. Re-base it on the player's own absolute achievement. |

---

## PILLAR 1 — THE LOT IS THE GAME

**Status: IN PROGRESS** · **Expected to close: C2 (Sets, Stages & Throughput) + C3 (Land, Prestige) — FROZEN sequence**

**The original fantasy.** You did not administer a studio through menus; you **stood in it**.
The lot *was* the interface — a person, a script and a finished film were the same kind of object,
picked up in your hand and dropped onto a target (Fable PM Front Door: "The Original Fantasy").
There was no menu screen sitting above the lot. Buildings were UI (§2, "How buildings function as
UI"; BUILDINGS-AS-UI ANALYSIS). Layout was **mechanical, not aesthetic**: the manual states
directly that buildings placed far apart force cast and crew to physically commute, which *extends
production time and adds to cost* (THE LOT LAW; §2). The lot doubled as the studio's status
display — decay showed as scaffolding, litter as a floating warning over the actual trash object
(§26, §27). The player built the place themselves from a long facility catalog with ghost
placement, scaffolded construction, and decay/repair (§25; Magic 15 #4).

**The successor target.** The lot remains the primary game surface and the default decision
surface: `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME LIVE WORLD`. Every
feature must justify itself as world-native before it earns a modal screen. Growth is physical —
the player builds the catalog out, and eventually acquires adjacent land — and **layout carries
real mechanical weight** rather than being decoration.

**What we explicitly improve.**
- The no-menu-ejection grammar is enforced **project-wide** rather than being the original's
  partial achievement — the original still ejected players to separate screens for Charts, Reviews,
  Research and the Movie-Maker (§28, "Opened a separate screen").
- The construction machinery is more rigorous than the original's: per-cell placement legality,
  a yellow/red ghost preview, cost and build-week quoting, a counting-down construction site, and
  a capacity flip on completion (§38 DONE rows; §40 "Add What A 2026 Game Can Do").
- The tycoon camera is more rigorous than anything confirmable about the original's own base-game
  lot camera (§40; §29 records that even the original's own documentation disagreed with itself
  about the building-interaction model).
- The lot's feedback should be **ambient** — the problem visible while panning, not requiring an
  inspector to be opened first (§41, Alerts row).

**What we reject.** The original's maintenance loop — manually dragging janitors and builders
around to keep prestige up — is exactly the repetition-not-decision pattern the tedium findings
single out (DO NOT CLONE THE TEDIUM, item 3; §36.3). Lot upkeep stays automatic or light.
Growth must mean *more places to check occasionally*, never more identical clicks per unit of size.

**Where it stands.** This has the strongest evidence base of any pillar. Twenty-nine accepted
closure records exist, eighteen of them world-native player-facing proofs. Campaign 1 sealed KEEP at
`f294077` and was ratified, widening the catalog from one blueprint to five, with Move & Demolish
and an expandable-property architecture. The C1-M8 PM playtest ran on a virgin seed and returned a
verdict worth quoting, because it is the closest thing this pillar has to proof:

> *"'This is just a menu of sprites' does not describe this screen. 'I built this place' does. PASS."*

But the pillar is not closed, and two things specifically are not yet true.

**The player builds additions, not the studio.** The nine core buildings remain fixed "transitional
architecture," and the Founding Flip — a fresh studio starting from a gate, an administration
building and vacant parcels — is a C2 capstone that is neither authorized nor started. Five
blueprints stand against the original's roughly twenty-eight-facility catalog. Two casual-eject
seams also remain open against the pillar's own doctrine, both recorded and routed rather than
hidden. And the pillar's headline claim is **explicitly unmeasured**: a measured
several-minutes-on-lot audit is still the top unstarted investigation on the project's own list.

The second thing that is **not** yet true is the half of the pillar that makes layout *mechanical* — and this is the
one place where the current build sits **below the historical floor**, so it is worth stating
without softening. The original's manual is explicit that distance between buildings extends
production time and adds cost. In the current build, travel is a **fixed one-beat allocation
regardless of distance**: where a building sits on the lot has no effect on how quickly work gets
done. The audit is candid about this, and it is not a gap that closes by itself — Sets do not exist
as a subsystem, so there is nothing yet for layout to constrain, and there is no aggregate
lot-prestige or landscaping layer connecting the physical lot to standing. **Whether layout should
again affect throughput is a decision the Magic 15 asks be made on purpose rather than left as an
unexamined omission.**

> ### SUCCESS TEST
> **Success means** a player can run their studio for an hour without ever feeling ejected from
> the lot, can point at buildings they chose to put there, and can explain how the way they laid
> the place out changed what their studio was able to make.

---

## PILLAR 2 — THE STUDIO LIVES WITHOUT THE PLAYER

**Status: IN PROGRESS** — C2 is authorized and owns this pillar; the *requirement* is ruled, and the *time-model architecture* (D3b) is an open Owner decision **inside** C2's scope rather than a gate in front of it · **Expected to close: C2 — FROZEN**

**The original fantasy.** One continuous timeline from 1920 onward — no missions, no scenarios
(§31: "a single continuous open-ended timeline… No 'scenario' or 'mission select' terminology
appears anywhere"). Time simply ran. The Timeline strip along the top of the HUD showed the
passage of time and cued upcoming events — new sets and facilities, award ceremonies, changes in
public taste, research completion (§24; manual p.5). People physically walked the lot while the
clock ran; production advanced whether or not the player was looking at it.

**The successor target.** Time flows while the game is unpaused. **Pause / normal / faster**
speeds are the fundamental controls. "Advance Week" or "Advance to Event" may remain as
convenience controls, but they must not be the **heartbeat** — the player should be able to sit
still and watch their studio operate.

**One precision worth keeping.** The original had **no Advance-Week analogue at all** — nothing in
the control catalog, the timeline description or the core loop describes a discrete turn advance.
So an advance control can only ever be justified as a **modern convenience layered over running
time**. It can never be defended as parity, and a design that treats it as the floor has the
history backwards.

The **deterministic engine remains authoritative**. The renderer and the frame rate never own
truth: presentation reacts to authoritative state, and never creates or persists it.

**What we explicitly improve.** The original never had to guarantee its simulation was
reproducible; ours does. Seeded, purpose-keyed deterministic streams mean a living clock does not
cost us replayability or testability — a living world and a provably deterministic one are not in
tension here, and the architecture must keep them separable.

**What we reject.** A world that moves for the sake of movement. Visible activity must answer
"why is that person there?" with a real authoritative reason — ambient motion that is decorative
screensaver traffic is rejected. And we reject a renderer that quietly becomes a second simulation.

**Where it stands — half proven, half not yet buildable.**

The **authority half is genuinely proven**: the engine owns truth. The simulation is deterministic
and seeded-only, the engine-owns-truth boundary is a recorded accepted authority, the save format
is versioned with real migrations, and byte-identical replay is proven in multiple closure records.
That is the harder half, and it is done.

The **living half does not exist at all.** The shipped model is discrete weeks advanced by an
explicit player action; there is no unpaused time and no speed control anywhere in the engine. The
accepted batch boundary is one engine call producing one final state, and the project's own rules
forbid claiming any intermediate week was ever watched.

**Why this is classified IN PROGRESS.** Living time is already ruled as a **requirement** — the
docket answers *how*, not *whether* — and **C2 is authorized and owns this pillar**, which is
exactly the bar this document sets for IN PROGRESS: authorized and actively being built or planned
by a named, live campaign.

*(Status corrected at the pre-C2 governance reconciliation, 2026-08-18. This section previously read
**OWNER RULING REQUIRED**, on the reasoning that the architecture ruling gated all work. That was
written before C2 was authorized. The reclassification changes the **status label only** — it
settles none of the design questions below, and it is not evidence that the living half exists.)*

**What is still genuinely unruled, and it is not a presentation detail.** The *how* remains a
simulation-design decision reserved to the Owner, and it is on the Master Plan's own still-required
list: what an action at "week 12.4" means, when money accrues, when random draws happen, whether
time runs while a decision panel is open, whether a player can miss a decision, whether a blocker
pauses time. The Master Plan explicitly forbids bolting real-time onto the weekly engine "merely
because the genre commonly has it." **The living half cannot be proven until D3b lands** — the
change here is that the decision now sits inside an authorized campaign's scope, with a named owner,
instead of blocking in front of one. The evidence distinction above stands unchanged: authority half
proven, living half does not exist yet.

> ### SUCCESS TEST
> **Success means** a player can take their hands off the controls, watch their studio keep
> working, and say "the world continues operating unless I pause it" — while the same seed still
> produces the same studio.

---

## PILLAR 3 — WRITERS CREATE MOVIES

**Status: IN PROGRESS** (Renewable Screenplay Generation V1 is new C2 scope) · **Expected to close: C2 (V1) → C4 (deep version) — FROZEN**

**The original fantasy.** A writer went to work in a building you built, and eventually handed you
a movie. The Script Office was a real facility with **four quality tiers** — Basic ($6,000, 1-star
ceiling), Intermediate, Proficient ($33,333, 3-star), First Class ($66,666, 4-star nominal) — and
the tier was a **hard ceiling** on achievable script quality, making it a genuine early-game
facility investment (§5.2). A **single** Script Office served all five genres: genre was chosen by
which of the **five genre rooms** inside the office a writer was dropped into (§5.1). **Writer
pooling** was real — up to five writers could collaborate on one script, and adding writers
*shortened the wait* (§5.4). Crucially, **each Script Office building worked on one script at a
time, so a studio with multiple offices could write multiple scripts simultaneously** (§5.4,
Prima). Writer experience affected **speed only, not quality** (§5.4, Prima — explicitly
contradicted by GameSpot; the contradiction is preserved, not resolved). Scripts were written from
per-genre **Hollywood Scriptwriting Templates** — seven-beat story structures such as Horror's
Intro → Shock → Pursuit → Encounter → Preparation → Big Fight → Resolution (§5, manual pp.28–30) —
and a script specified the roles, scenes and **Sets it required** before it could shoot (§4, §5).
Script quality itself had a documented multi-factor scoring model (§5.7). There was **no lifetime
cap on screenplays**: writing was a renewable industrial process, and surplus scripts could even be
sold for cash (§5.4).

**The successor target.** The current finite 30-concept pool is **transitional**. Long term:

- a **Script Office** as a real, physical, tiered facility;
- **writer assignment** — a named writer goes to work there and occupies it;
- **renewable screenplay creation** consuming simulated time and physical capacity;
- a **generated working title** on completion;
- **player rename without identity mutation** — the player may retitle freely; the underlying
  screenplay identity never changes;
- **stable, permanent screenplay and film identity**, so a film released decades ago still
  resolves correctly;
- **no lifetime screenplay cap**;
- **writer and office throughput** — more writers and more offices mean more pictures;
- **multiple simultaneous writing facilities** where the player's built capacity permits.

**What we explicitly improve.** The original's script quality was an unexplained black box to the
player; ours should show its working. The original's office tiers were a ceiling with no visible
explanation; ours should make the investment legible. And the original's title was fixed at
authoring — ours separates the *name* from the *identity*, so renaming is free and history stays
intact.

**What we reject.** Script quality as a silent number the player must reverse-engineer from
outcomes — the legibility failure the tedium record calls out directly (DO NOT CLONE THE TEDIUM,
item 5; §36.9: the complaint was "control and legibility, not just workload").

**Where it stands — three of the four clauses are real; the fourth is falsified by the code.**

**Already true, and better than expected.** Tiered development offices with **real quality-ceiling
effects** shipped in Campaign 1 — the office tier is a genuine facility investment again, exactly
as it was in 1920. The commission → draft → review → rewrite → ready loop is closed, persistent and
reviewable from the world. And the engine deliberately implements the original's own documented
law: **office tier moves quality, staffing moves speed** — the source states outright that speed is
untouched by tiers. The C1-M8 playtest commissioned a picture under the office's uplift line and
drafted it to a legible strength score; the golden-path spec proves a second picture commissioned
in the same session with the uplift correctly absent.

**Falsified by the code:** *"renewable, no lifetime cap."* The world configuration sets a concept
count of **30**, generated once per seed; a commission is refused if any project already owns that
concept; and the project list is append-only, with produced projects never removed. **A save
therefore has a hard lifetime ceiling of thirty screenplays, ever.** The Owner has ruled that this
is not a lifetime product cap, but that is a statement of direction — Renewable Screenplay
Generation V1 is now explicit C2 scope, and C4 owns the deep era-sensitive version.

A second gap is recorded and routed: a second screenplay cannot currently be commissioned from the
world while the first awaits packaging, which ejects the player to a full-screen room and
contradicts Pillar 1's own doctrine. It is assigned to C2's concurrency ruling.

**Evidence caveat on titles and renaming — corrected against the source, and the correction
matters.** A widely-repeated summary of this evidence has the two pipelines the wrong way round.
What the Bible actually supports, in three separate tiers:

- **Player naming is confirmed in the Advanced Movie-Maker, not generation.** The AMM authoring
  flow *begins* with the player choosing "the movie's name, genre, and structure"
  [OFFICIAL, manual pp.24–25, §5.5 step 1], and the player names the project again at the export
  stage (§32). The AMM is where **player naming** is documented.
- **Auto-generated titles belong to the standard pipeline, and only indirectly.** "Scripts are
  auto-generated by hired writers" is OFFICIAL (§7.0), and three movie cards are
  DIRECTLY OBSERVED IN GAMEPLAY carrying titles the player never authored — *Atomic Ray Versus The
  Spidrons Of Doom* (Sci-Fi), *The Baggage Boy* (Comedy), *Wake Up And Die Again* (Horror). That
  these titles are **genre-consonant is an inference from a sample of three.** No source describes
  a title generator, a title table, or genre-conditioned naming.
- **Standard-pipeline renaming: NO EVIDENCE.** Not "weak evidence" and not "contested evidence" —
  silence. No Bible section describes renaming a movie or script in the standard pipeline; the
  movie-card interaction grammar is left-click select/move and right-click info bubble only
  (§27, §28); and no entry for titles or renaming exists in the unresolved-questions register.
  **Owner firsthand memory is the sole support, with no competing evidence in either direction.**

**None of this changes the successor design**, which is already ruled: a generated working title,
and player rename that never mutates identity. It changes the **label on the evidence**, and the
label is what a future PM will follow. Recorded here so nobody cites the Advanced Movie-Maker as
proof of title generation, or treats standard-pipeline renaming as a reconstructed original
mechanic. It is an Owner-memory claim, and it should be logged as one.

> ### SUCCESS TEST
> **Success means** a player can build a second writing office, put writers in it, and watch new
> screenplays keep arriving with their own titles for as long as they want to keep making movies —
> and can rename any of them without breaking a single film in their history.

---

## PILLAR 4 — SCREENPLAYS BECOME PHYSICAL PRODUCTIONS

**Status: IN PROGRESS** (Sets/Stages is the core of C2) · **Expected to close: C2 — FROZEN**

**The original fantasy.** A script was not an abstraction that turned into a number. It named the
**Sets it required**, and those Sets were real, placeable, fully-modelled structures on your lot —
there was no generic "soundstage" hosting interchangeable dressing (§4). Cast and crew physically
assembled on the set geometry and shot the picture there (§4; manual p.12: "once construction is
complete your cast and crew will assemble on set and begin shooting"). Sets decayed and needed
repair exactly like buildings, and could be used off-shoot for rehearsal — an actor practising on a
spaceship set raised their sci-fi proficiency (§4; manual p.20). The production pipeline was a
visible sequence on the building itself: **Director → Lead Roles → Begin Casting → Crew (n/m) →
Extras (n/m) → Shoot It**, with the quotas visibly unmet until filled (§4, directly observed;
§7). Sets carried weighted, prioritized genre association in the engine's own schema, not a binary
flag (Technical Artifact Register §12 — *schema* confidence very high; whether stock vanilla sets
actually used multiple non-zero weights remains open at the vanilla-content level).

**The successor target.** The full chain is physical and legible: genre and story structure produce
scenes and roles; scenes and roles determine the **required Sets and resources**; those drive
casting, rehearsal, shooting and wrap. **Sets and stages are physical, constrained resources** that
the player built and can run out of.

And the governing rule when they run out: **queue, don't magically forbid.** Contention produces a
visible queue with a stated reason and a remedy — never a silent refusal, and never an invisible
global cap standing in for real physical capacity.

**What we explicitly improve.** This is a direct, evidenced improvement on the floor. The original
**forbade**: when a script's required set was unavailable, the movie card flagged it red because
"either it's in need of repair, you don't own it yet or another film is already shooting on it"
(§4, manual p.12) — and there it stopped. Project: Studio queues instead, and says why. Throughput
emerges from what the player actually built — usable Sets, stages, casting and development
capacity, crew and talent availability, lot travel — rather than from an arbitrary global cap.

**What we reject.** A production that stalls with a red flag and no route forward. And any design
that replaces the original's honest physical constraint with a different arbitrary number.

**Where it stands.** The phase machinery is real: Development → Pre-production → Rehearsal →
Shooting → Post-production → Release Ready, with authoritative facility reservations and company
members physically relocating between facilities as phases advance. What is missing is the
constraint itself — Sets do not exist as a subsystem, and productions reserve fixed soundstages
rather than contending for scenery the player built. That is the core of C2.

> ### SUCCESS TEST
> **Success means** a player watches two of their own productions want the same set they built,
> sees the second one queue with a reason they understand, and fixes it by building more studio.

---

## PILLAR 5 — QUALITY IS NOT SUCCESS

**Status: IN PROGRESS** · **Expected to close: incrementally — post-release attribution at C3 (frozen); economy calibration at C6 (tentative). Distributed ownership; no single campaign closes it.**

**The original fantasy — and it is more sophisticated than it is usually remembered.** The
developer-reviewed Prima guide describes the film side as a **five-stage pipeline**:

> **Script Quality → Production Quality → Movie Quality → Success → Final Movie Rating**

with **Movie Quality weighted more heavily than Success** in the final blend (§8.0). Critically,
**PR & Marketing sits in the *Success* stage — not in Movie Quality** (§8.0, §8.1). The manual's
own advice was to *match* the marketing budget to a film's quality and cost, implying marketing
tracks quality rather than creating it (§8.1). The original also kept **Star rating** (a performer
metric), **movie quality rating** (a film metric) and **chart position** (rating plus non-quality
factors like PR and relationships) as three genuinely separate things that sources routinely
conflate (§8.0).

**Note the source status honestly:** the five-stage architecture is **Prima's own claim**, not
settled cross-source consensus. GameSpot gives a flat multi-factor list with no named stages; a
GameFAQs synthesis gives a different two-stage model. All sources agree film quality is
multi-factor and multi-stage; they disagree on the boundaries (§8.0). Prima carries the highest
precedence, but the architecture is single-tier evidence and should be treated as a strong design
target, not a proven historical formula.

**The successor target.** Preserve and deepen the separation between Script Quality, Production
Quality, Movie Quality, market/commercial Success, and the Final result. **Marketing may amplify
reach and success but must never manufacture Movie Quality.** And every one of these must be
**legible and explainable to the player** at the moment of decision and again in the post-mortem.

**What we explicitly improve.** This is where Project: Studio has the single largest structural
advantage over the original, and it is worth stating plainly: the original's formula was compiled
onto a disc that could never be patched or instrumented. Ours is real, typed code over real state.
The same math that computes a forecast can render its own breakdown, live, in the same overlay
where the decision is made. The original had the sophisticated five-stage model **and never showed
it to the player** — the Bible flags exactly this: no in-game panel is documented that names the
stages or the weighting, so the model was simulation-internal (§8.4). Closing that gap is the
improvement.

**What we reject.** An undisclosed quality formula with no in-game breakdown of what moved the
score — the original's single most-cited complaint, described by players as "an obtuse system…
confusion regarding why some things work the way they do" (DO NOT CLONE THE TEDIUM, item 5). We
also reject the inverse failure: a marketing lever with no downside, which turns a dual-edged
mechanic into a one-way button (§40, Magic Rank 10).

**Where it stands.** The separation is **real in the model**, and materially legible **before**
release: script assessment and expected-strength ranges, casting fit shown on slate cards with
strengths and concerns, force vectors and an expected critic score, a six-week theatrical loop with
a newspaper/result/autopsy chain, and an autopsy compare view. Publicity exists as a three-tier
campaign system.

**The acknowledged gap is post-release attribution** — telling the player *afterwards* which inputs
actually moved the outcome. The governing plan still scores this PARTIAL in its own words and
routes the remaining work to C3. So the honest reading is: the player can increasingly see what
they are betting on, and still cannot fully see why they won or lost.

**One thing no amount of research will settle.** The exact weighting between Movie Quality and
Success has **no historical answer at any source tier** — the original never published it, and the
Bible carries the gap as an open question. Whoever tunes this must **choose a ratio and own it as a
design decision**, not present it as a reconstruction. The same applies to a decision this pillar
cannot dodge: **which single number is shown to the player as "the movie's rating"** — the
marketing-proof pre-release quality figure, or the marketing-influenced final one. The original
showed a blend and named neither.

> ### SUCCESS TEST
> **Success means** a player can look at a film that made money and say "that was a mediocre
> picture that I sold well," look at one that lost money and say "that was a good picture nobody
> came to," and be right both times because the game showed them why.

---

## PILLAR 6 — PEOPLE BECOME LEGENDS

**Status: IN PROGRESS** — persistent careers are real and validated; "legend" is not · **Expected to close: C5 (Stars Become People) — TENTATIVE position**

**The original fantasy.** Stars and Directors were individually named, individually statted people,
not interchangeable resources (Magic 15 #3) — and directors were mechanically *instances of the
same object* as actors, carrying the same block of genre experience bars, work/stress bars,
addiction bars, a relationships list, and looks/physique/fashion (§8.3, directly observed; §11).
Genre experience was real and accumulated: "the more experience in a genre, the better their
performance" (§8.1), built by appearing in films of that genre or by practising on a genre-flagged
set (§16). Extras could become Stars through a real pipeline (§16). Star rating was a composite of
image, talent, salary, trailer, entourage and the quality and success of their films (§8.0). The
crucial scoping finding: **needs simulation was scoped to Stars, not the general population**
(§14.1) — the game deliberately did not simulate everybody.

**Report the floor honestly.** The original's people did not visibly **age**, and no career arc of
rise/decline/retirement is documented in the reconstruction — §14.5 records what was *not*
simulated. Long-horizon career progression is therefore largely **beyond the historical floor**,
not a parity recovery, and should be labelled as such.

**The successor target.** Actors and Directors receive the **deepest persistent career simulation**
in the game. Writers and other major creative heads carry lighter but genuinely **persistent
professional histories**. Ordinary staff stay deliberately light — the original's own scoping
instinct was correct and we keep it.

Long term, consider: aging; development; decline; retirement; filmographies; Awards; collaborations;
repeat partnerships; and mentorship or dynasties.

**Label the last one honestly.** Mentorship, lineage, dynasties and succession have **zero evidence
of any kind** in the historical record — not weak evidence, none. The only documented star-making
pipeline is Extra → Star, and Directors are not even a mechanically separate class from Actors: one
applicant queue, one stat block, one lifecycle. A dynasty system is therefore a **double
authorization** — new invention *and* new scope — and should never be presented as recovering
something the original had.

**What we explicitly improve.** The original gave you numbers on a person. We should give you a
**career** — a person whose filmography you can read, whose best decade you can name, and whose
retirement you notice. The engine already carries a typed credit graph, which is precisely the data
the original never had a reason to model.

**What we reject.** The original's repetitive **nannying**: stress and addiction forcing a Star off
an active shoot, with the only documented remedy being to manually drag them back — an action the
game itself framed as a degraded workaround (DO NOT CLONE THE TEDIUM, item 2). Consequence with
teeth stays; the recurring fire the player must keep manually extinguishing does not. And per the
tedium record's most important standing test: **as the studio grows, this must never multiply**
(item 3).

**Where it stands — persistent careers are genuinely real; legends are not.**

This pillar has better evidence than its status suggests. Talent Career Impact closed with Owner
approval, delivering a deterministic star-power resolver, a frozen career-event record, a
release-time lifecycle hook and a save migration — and, unusually, it was **validated against a real
long save** rather than a synthetic fixture. At week 86 on the Owner's own studio: nine released
films, six recurring contributors, fifty-four unique career-event records with no duplicates,
persistent craft progression including a homegrown lead, and — the detail that shows the design is
honest — several zero-event films where the picture was commercially invisible, so no fame was
farmed. A named-person work and career inspector is closed on top of it, opening a real talent
profile over the live world.

**What is missing is the legend, not the career.** Nothing confers status or public memory: no
awards, no honours, no hall of fame, no press. The engine currently ships the literal string
*"Awards are not part of the game yet."* There is no aging, no retirement and no life arc. And
because a save holds at most thirty screenplays (Pillar 3), **the career horizon over which a
legend could form is itself capped** — this pillar is quietly gated on Pillar 3's fix.

Awards are C3. Star life and relationships are C5, whose position awaits Owner ratification.

> ### SUCCESS TEST
> **Success means** a player can name three people who worked at their studio, say what happened to
> each of their careers, and be sad when one of them retires.

---

## PILLAR 7 — THE LOT HAS A SOCIAL HISTORY

**Status: PLANNED** · **Expected to close: C5 (Stars Become People + Relationships V1) — TENTATIVE position**

**The original fantasy.** One social bond per pair, a single 0–100% scalar climbing through named
tiers — Nemeses, Enemies, Acquaintances, Friends, and above 70% a ladder that split by pairing
(§15). Chemistry fed production quality directly: "the level of the relationships between each
actor and the director and between each pair of actors adds to the movie's overall chemistry," and
**actor-director pairs counted double weight** (§15; §8.1, Prima).

**This is the best-evidenced *loved* thing in the whole corpus**, and unusually it rests on Owner
firsthand observation rather than review synthesis: named characters idling on the lot with floating
dialogue — *"I feel quite comfortable here with him."* / *"She's a good sort to spend time with
here."* — linked by a **"Best Friends"** tag; and staff asking for a purely social chat mid-shoot,
unrelated to any production task (§35.4, directly observed). That is the soap opera. That is what
Pillar 7 exists to recover.

**The recovered evidence that changes the design.** The original engine's own relationship schema
exposes the six documented social venues (LOT, BARNORMAL, BARVIP, CANTEENNORMAL, CANTEENVIP,
TRAILER) **plus three contexts never documented before: REHEARSE, FILM and CASTING** — meaning
relationships built **during production work itself**, not only during off-hours socializing
(Technical Artifact Register §7, §11; Bible §15). This is the single most materially new finding of
the technical pass, and it is plausibly the real mechanism behind the documented "actor-director
relationship counts double" rule.

**Hold the confidence line.** This is **schema confidence: very high** — the format comment in the
engine data names these contexts explicitly. The source package is a **relationship-gain cheat
mod**, so its *gain-rate values* are known-modified and are **not** vanilla data. The finding is
"these contexts exist in the engine's relationship schema," not "here is how fast relationships
grew during filming."

**And one trap specific to this pillar.** The ladder's bottom bands — **Nemeses** (0–10%) and
**Enemies** (11–30%) — are real and officially sourced. They are *not* evidence of a rivalry system.
No source of any tier documents a negative relationship *state*, a gossip mechanic, a feud, or any
player-triggerable conflict; those bands read as **unbuilt or decayed rapport on the same single
0–100% scalar.** *"The original had Nemeses"* must never be allowed to become *"the original had
rivalries."* If Project: Studio wants friction, soured pairings or a refused re-teaming, those are
successor inventions and must be labelled as such.

**The successor target.** Relationships and chemistry matter mechanically. **Work itself builds
relationships** — the REHEARSE/FILM/CASTING evidence is the design lead, and it is a more elegant
mechanism than the original's shipped one. Repeat collaborators, a director who keeps casting the
same lead, a pair whose third picture together lands better: these should be legible without the
player ever running a social errand.

**What we explicitly improve.** We take the original's *own better idea* — the one buried in its
schema — and make it the mechanism, instead of the venue grind it actually shipped. Chemistry
becomes a consequence of the choices the player already makes, derived from a credit history the
engine already carries.

**What we reject.** **Venue-dragging.** The original required the player to manually drag two
Stars into proximity, wait, and repeat the identical action many times while escalating through a
fixed venue sequence, with mismatched venue-to-tier placement stalling progress entirely — "no new
decision content added as the relationship deepens" (DO NOT CLONE THE TEDIUM, item 1; §36.1). This
is rejected outright and permanently. There is no socialize-to-build meter.

**Where it stands.** No relationship or chemistry system exists in the sim core. A deterministic,
read-only presence projection exists and already carries the credit-history data a derived signal
would be built from, but no derived collaboration signal is surfaced anywhere.

> ### SUCCESS TEST
> **Success means** a player notices that two people who keep working together have become a
> partnership, and never once had to walk them to a bar to make it happen.

---

## PILLAR 8 — LIVE THROUGH CINEMA HISTORY

**Status: PLANNED** · **Expected to close: C4 (Genre Depth, Research & the Opening of Time) — FROZEN**

**The original fantasy.** The game started in **1920** and the Timeline ran "from present day into
the future, with each segment representing a year" (§24, manual p.5). Era change was **mechanical,
not cosmetic**: a Laboratory with hired Scientists drove four research tracks — Movie-Making
("sound, color and CGI"), Cult-Packs (sci-fi/horror sets, props, costumes), Mainstream Packs, and
Stars & Studio — and being first to a technology was explicitly rewarded: "having access to these
features early increases the quality of your movies" (§24, manual pp.22–23). Audience taste moved
with world events: right-clicking a Script Office told you how audiences felt about each genre, and
"their tastes change over time" (§24, manual p.39); players describe moon landings boosting sci-fi
and royal weddings boosting romance (§5.3). Horror and sci-fi content was **gated behind research**
rather than being available from 1920 (§24).

**On the original's endpoint — and why our horizon is an extension, not a contradiction.** The
original's *simulation* ran indefinitely; it was the *authored content and reward window* that
tailed off, with an official 1 January 2005 endpoint for reward progression and conflicting
secondary claims of 2000, 2005 and 2020 (§24, §31 — the true upper bound is recorded as
UNRESOLVED). Project: Studio's "1920 → at least 2040, no hard game-over, simulation may continue
beyond" is therefore a **strict extension of the original's own design intent**, not a departure
from it. The original also had no hard fail state in either mode (§31, "Failure conditions").

**The successor target.** 1920 through at least 2040, with historical change affecting
**mechanics**, not merely art. Candidate eras and shifts include sound, colour, television,
widescreen, blockbuster economics, home video, digital and VFX, streaming, and a plausible
alternate future beyond the present day. **Do not design all of this content now.** The pillar's
requirement is that the architecture does not foreclose it and that the eras, when they arrive,
change what it is smart to do — not just what things look like.

**What we explicitly improve.** The original's era progression was principally an *unlock* system.
Ours should also change the **shape of the strategic problem**: what a picture costs, what an
audience wants, what a studio is for. And where the original ran out of authored content, we keep
going.

**What we reject.** Era as a costume change. A decade that only alters the palette is a failure of
this pillar.

**Where it stands.** A single static era configuration exists; the timeline does not open. C4 owns
research as the unlock engine and the point at which era configuration begins to vary, using the
original's own proven dual-route pattern (research early **or** a calendar fallback).

> ### SUCCESS TEST
> **Success means** a player who has run a studio from 1920 into the 1960s says the kinds of movies
> worth making changed underneath them, and can explain what changed and when.

---

## PILLAR 9 — PROGRESSION FEELS LIKE A CAREER

**Status: PLANNED** · **Expected to close: C3 (Progression, Prestige & Awards + Land Acquisition V1) — FROZEN**

**The original fantasy — two parallel tracks, routinely conflated.** §23 separates them explicitly:

- **Track 1 — Studio Ranking**, a competitive chart position against other studios, scored from
  five weighted components: **Capital 24%, Movies 24%, Stars 24%, Lot Prestige 14%, Awards 14%**
  (Prima). Capital ran on a deliberately nonlinear curve with diminishing returns above roughly
  $300,000 — wealth mattered, but stopped mattering.
- **Track 2 — the Movie Mogul ladder**, a fixed ladder of named studio-owner titles starting at
  **Greenhorn**, each gated behind a **checklist** of thresholds and each unlocking specific
  facilities and sets on completion (§23, manual p.22). The rungs are documented — Wannabe Big
  Cheese, Junior Studio Manager, Promising Studio Manager, Respected Studio Head, Celebrated Studio
  Head, Highflying Moviemaker, Big Fish, Movie Mogul, Movie-Making Legend — with concrete rewards
  such as the Custom Script Office, the Publicity Office, the Palatial Trailer and named Sets.

**Preserve the source disagreements.** The ladder's **order** is a genuine, unresolved three-way
contradiction across sources, and the **count** (nine versus ten, depending on whether
Movie-Making Legend belongs to the same ladder) is narrowed but not closed (§23). Do not design as
if either were settled.

**The successor target.** Studio prestige and rank, unlocks, physical expansion and Awards combine
into long-horizon goals. Preserve the genuinely useful fantasy underneath the original's
Movie Mogul and Achievement progression — a checklist you can read, a named rank you can claim, and
a reward you actually wanted — while modernizing the grind.

**What we explicitly improve.** The original's ladder produced real anticipation but also
attrition: the Lifetime Honors gate required, for one category alone, winning at nearly every
ceremony for seventy-five years (§31). We keep the step-function pacing — play toward a checklist,
receive a verdict, gain unlocks — and reject targets that are satisfied by endurance rather than
by play. Prestige should also reconnect to the **physical lot**, which the original did through
maintenance, paving and ornamentation, and which our continuous standing metric currently does not.

**What we reject.** Progression measured by attrition. Any milestone whose only real requirement is
that the player did not stop.

**Where it stands.** The *substrate* shipped in Campaign 1 and the *progression* is entirely absent.
A declarative unlock schema exists with typed requirement kinds already naming rank, certificate,
award, research and land zone, alongside a proven expandable-property architecture. But those gates
are **deliberately inert** — they evaluate as unmet and say so in words, and only cash availability
is active. The engine's own copy for the award gate reads *"Awards are not part of the game yet."*

Prestige is a single clamped scalar with no connection to the physical lot. Against the original's
two interlocking tracks — a weighted competitive rating, nine ordered certificates, thirteen award
categories and Lifetime Honors — we have continuous numbers, nothing discrete, and nothing earned.

**A schema that renders "not part of the game yet" is architecture, not progression.** C3 owns the
ladder, the prestige reconnection and the earned property expansion, and is not started.

> ### SUCCESS TEST
> **Success means** a player can name their current rank, name the next one, list what they still
> need for it, and want it.

---

## PILLAR 10 — AWARDS CREATE HISTORY

**Status: PLANNED** · **Expected to close: C3 (Progression, Prestige & Awards) — FROZEN**

**The original fantasy.** The **Lionhead Motion Picture Awards**, confirmed by name in the manual,
in an in-game requirements popup, and rendered as an in-fiction TV broadcast with a title card
reading "KMVS: The Lionhead Motion Picture Awards" (§22). The cadence is officially documented:
**"Every five years an awards ceremony takes place where you can be awarded for your movies, Stars
and studio achievements"** (manual p.22) — the five-year rhythm is a confirmed original mechanic,
not a design assumption. **Thirteen categories** were introduced incrementally, three at the first
1925 ceremony and one more every five years through 1975, spanning Movies, Stars, Directors and
Studios: Highest Charting Star/Studio/Movie, Most Prestigious Studio Lot, Highest Climbing Studio,
Most Prolific Star, Best Employer, **Best Direction**, Highest Charting Newcomer, Most Prolific
Studio, **Best Acting Performance**, Highest Climbing Star, and Movie Quality Output (§22, Prima).

Each win activated a **named, quantified, studio-wide bonus lasting exactly until the next
ceremony** — Trend Setter, Half Price, Perfect Fit, Midas Touch, Age of Discovery and the rest —
stackable without limit within a single ceremony, and lost unless re-earned (§22). Awards were also
**structurally separate** from the rank ladder, interacting only in that some rank requirements
counted cumulative award wins (§22).

**The successor target.** Preserve the five-year strategic rhythm and the career-recognition
function; modernize the ceremony presentation. Awards should recognize **Movies, Stars, Directors,
creative crafts and Studios** meaningfully. Long term — and explicitly only once rivals exist — the
successor direction may include **richer annual Awards and multi-studio nominees**.

**Note the honest dependency:** several of the original's own categories (Highest Charting Studio,
Highest Climbing Studio, Most Prolific Studio) are inherently **comparative**. They presuppose other
studios to be measured against. A faithful awards system and Pillar 11 are therefore coupled, and
this document records that coupling rather than pretending awards can reach full parity alone.

**A live scoping hazard that follows directly from that coupling.** An "Awards competitiveness
forecast" appears as an acceptance criterion in the progression campaign's own notes — and it
presumes **visible competitors**. The record contains no nominee list, no rival shown as a nominee,
and no competitor presentation of any kind; only the player's own wins were ever tallied. So that
criterion (a) has no historical model to build from and (b) quietly imports rival modelling, which
is **explicitly not currently authorized scope**, into an authorized campaign. **Re-base it on the
player's own absolute achievement**, or hold it until Pillar 11 is authorized — but do not let it
ride in unexamined.

**What we explicitly improve.** The original's bonuses were real and interesting but some were
period busywork; which named effects survive as systems and which retire is a design decision the
Bible explicitly hands to the progression campaign rather than pre-deciding. And the original never
made the *verdict* legible — a modern ceremony should follow visibly from numbers the player
already understands.

**What we reject.** Ceremony pageantry that does not follow from legible numbers, and a standalone
awards ceremony built ahead of the rank ladder it is meant to feed.

**Where it stands.** No awards system exists. C3 owns it, explicitly as evaluation content within
the rank ladder rather than a separately-built ceremony.

> ### SUCCESS TEST
> **Success means** a player remembers the year their studio finally won something, and can say
> what it changed.

---

## PILLAR 11 — HOLLYWOOD EXISTS OUTSIDE THE GATE

**Status: FUTURE** — legitimate long-term direction, **not currently authorized scope**, no campaign owns it · **Sequencing: NOT SEQUENCED**

**This pillar is parity recovery, not invention — and that is a correction worth stating plainly.**
The original **did** have rival studios. §31 records, from the developer-reviewed Prima guide, that
the player's studio "competes against rival, AI-controlled studios on ranked 'Studio Charts' across
multiple leaderboard categories," and — strikingly — that **rival Stars could appear as walk-in
applicants in your own Stage School queue, and your Stars could defect to a more successful
studio.** The manual frames the ranking as being "up against the other big guns in Tinseltown" and
research as letting you "make better films than your rivals" (§23, §24). Roughly a quarter of the
original's own award categories were comparative.

**The successor target.** Persistent fictional rival studios with their own identities; rival
movies; genuine talent competition; rival success and decline; rankings; and poaching and
defection. Under the philosophy — **USE REAL CINEMA HISTORY, CREATE OUR OWN LEGENDS** — these
studios are invented, and the rivalries a player remembers are the ones their own save produced.

**What we explicitly improve.** The original's rivals were a scoring abstraction with one vivid
consequence (defection). Ours should be studios with names, catalogues and trajectories that a
player recognizes across decades.

**What we reject.** Rivals as difficulty tax. A competitor that exists only to make numbers harder
adds pressure without adding story.

**One thing worth fixing long before this pillar is authorized.** A live invariant violation already
exists in the code: founding a studio re-prices the **world-level** concept pool as a side effect —
harmless with one studio, and wrong the instant a second exists, because one studio's founding would
re-price the shared script market for everyone. There is an in-code comment already acknowledging
the boundary. It costs almost nothing to fix now and a great deal to fix after rivals exist. The
same applies to studio identity: the player's studio has **no persisted id or name today**, and a
competitor chart is not expressible without one.

**Where it stands, and the scope position — stated carefully.** No rival system exists.
Historically this was framed as a **permanent** product exclusion — §40 lists rival-studio
competition among Owner-confirmed non-goals treated as "a considered, permanent decision," and it
is an explicit non-goal of the current C2 charter. **The current Owner ruling supersedes the
permanence, not the exclusion**: rival studios are now a legitimate long-term product direction
under the framing *not current scope unless explicitly authorized*. Nothing here schedules or
authorizes any of it, and this document does not propose that it should be.

> ### SUCCESS TEST
> **Success means** a player can name a rival studio they have been fighting for thirty years, and
> the star they lost to it.

---

## PILLAR 12 — MOVIES BECOME HISTORY AND ASSETS

**Status: FUTURE** (persistence is real; the asset economy is not) · **Sequencing: NOT SEQUENCED**

**The original fantasy — and the honest limits of it.** Films persisted as history: chart positions,
a "Best Movie Released So Far" record, and cumulative quality counts feeding rank requirements
(§22, §23). A studio's long-view record — best star, awards received, movies above four stars —
was genuinely tracked across a career. But the reconstruction records **no film library economics,
no reissues, no sequels, remakes, franchises or licensing** as original mechanics. Films earned on
a decaying box-office stream and then became history. Beyond that, **this pillar has no historical
floor** and is honestly labelled successor invention.

**The successor target.** Released films persist as first-class objects. Long term: a film library;
classics that keep mattering; reissues; sequels, remakes and franchises; licensing; library value;
and career and studio legacy.

**What we explicitly improve.** This is net-new depth: turning a released picture from a settled
score into an **asset with a future**. It is also the mechanism by which a 120-year save accumulates
identity rather than merely accumulating cash.

**What we reject.** A library that is only a number. If a classic's value never shows up in a
decision, it is a trophy case, not a mechanic.

**The design conflict this pillar must settle before it can be built.** The original **taxed
repetition**: novelty was an input to a film's commercial success, and sets and actors accumulated
public boredom with reuse. A sequels-and-franchises system **rewards exactly what those mechanics
penalized.** No document reconciles the two, and it is not a detail — it decides whether a
franchise is a smart play or a slow poisoning of your own audience. (There is a real design in
there: a franchise that pays well and *costs novelty* is more interesting than one that only pays.)
Separately, the six-week theatrical loop is ruled PRESERVE — "leave as-is" — which a reissue or a
second revenue episode would necessarily reopen.

**Where it stands — the history half is genuinely closed; the asset half does not exist.**

**Proven:** Film Chronicle V1 is closed and validated. Every participant-bearing released film has a
durable chronicle record — distinct from its newspaper clipping and from the session-only autopsy —
carrying title, genre, locked shape, audience promise, frozen director and lead, production
chronology, strongest and weakest package fit, and reception. The closure is explicit that it adds
no plot generator, no economy rule and no career rule: it is a record, and it is a real one.

Film identity is also architecturally protected — a released film resolves its own title and genre
through its concept identity, which is exactly why the immutability of existing concept identities
is a load-bearing Owner ruling rather than a housekeeping preference.

**Absent:** no sequel, no franchise, no library value, no catalogue revenue, no re-release, no
classics tier — and no campaign in the current sequence owns any of it. The thirty-screenplay
ceiling also bounds how large any library could ever become, so this pillar is gated on Pillar 3
twice over.

**Classified FUTURE** because the clauses that define it — assets, sequels, franchises, library
value — are unsequenced, while recording plainly that the film-as-durable-artifact clause is done.

> ### SUCCESS TEST
> **Success means** a movie a player made forty years ago still changes a decision they make today.

---

## PILLAR 13 — BUILD A STUDIO EMPIRE

**Status: FUTURE** · **Sequencing: NOT SEQUENCED**

**The historical floor — one real piece, and one absence.** The absence first: the original had
**no acquisitions, mergers, subsidiaries or co-productions**. This pillar is overwhelmingly
successor invention and should never be presented as parity.

The real piece is the **failure model**, and it matters: the reconstruction found **no hard
game-over, bankruptcy, or receivership condition anywhere, in either mode** (§31, "Failure
conditions"). The only economic consequence of running out of money was that most facilities could
not be purchased while in debt — with a named exception list (Casting Office, Crew Facility,
Production Office, Basic Script Office, Stage School, Stage Set, Star & Script Selling) that kept a
minimum viable studio buildable even when broke. The recovered engine data independently corroborates
this: an `availableindebt` flag appears on exactly the core-loop-critical facilities (Technical
Artifact Register §7). Project: Studio's no-bankruptcy position is therefore **consistent with the
original's own design**, not a modern softening.

*One caveat, kept because the Bible keeps it:* "no hard fail state" is an **absence-of-evidence**
finding across every source tier and is marked INFERRED, and the parallel drawn to this project's
own receivership exclusion is explicitly flagged as speculative and unconfirmed by any developer
statement. It is a strong reading, not a proven one — do not upgrade it in retelling.

**The successor target.** Long term: acquisitions; distressed rivals; mergers; subsidiaries and
labels; co-productions; and asset or library purchases.

**The failure asymmetry, recorded exactly.** The player's studio has **no mandatory bankruptcy
game-over**, and the standing prohibition on financing, loans, bailouts, restructuring, hard
bankruptcy, failure ladders and arbitrary cash sinks remains in force **for the player's studio**.
That prohibition does **not** extend to future **rival** studios, which may experience distress,
bankruptcy, receivership, sale, merger or acquisition if and when the Hollywood ecosystem is ever
authorized. This asymmetry is deliberate: the player's studio is the thing the fantasy is made of,
and rival failure is the thing that makes the world feel real.

**What we reject.** A punitive economy. Losing money should narrow options, never end the game.

**An unanswered question the asymmetry leaves open.** The ruling forbids hard bankruptcy *for the
player* but is silent on **player-initiated exit** — whether a player may ever sell, merge, or
deliberately hand over their own studio. "You cannot be forced out" and "you may never leave" are
different statements, and only the first has been ruled. Worth settling before an empire system is
designed, not during.

**Where it stands.** Nothing exists, and nothing is scoped. Acquisitions and subsidiaries are
explicit non-goals of the current campaign. This pillar depends entirely on Pillar 11 existing
first, and Pillar 11 is itself unsequenced.

> ### SUCCESS TEST
> **Success means** a player can change who owns what in their Hollywood — and never loses the game
> for trying.

---

## PILLAR 14 — CREATIVE AUTHORSHIP

**Status: OWNER RULING REQUIRED** — a dedicated Owner scope ruling on investment level is required before this can be sequenced at all

**The original fantasy.** The **Advanced Movie-Maker**, reached through the Custom Scriptwriting
Office, gave the player direct authorship: choose the movie's name, genre and story structure;
assign Stars to lead roles; pick a set and then a scene from potentially hundreds; assign actors to
scene roles; modify each scene's set dressing, props, weather, lighting, backdrop and
genre-specific tone sliders; set costumes per actor per scene; and reorder, split or delete scenes
on a storyline (§5.5, manual pp.24–25). It shot, then went to Post Production for music, sound
effects, subtitles, speech and lip-sync, then exported. It was gated behind the Wannabe Big Cheese
achievement, and — importantly — its quality ceiling was still capped by the best conventional
Script Office on the lot, so it was not an escape hatch from the tier system (§5.5).

This tool produced ***The French Democracy*** and a genuine machinima cultural moment (§35.3,
§35.5). It is one of the most historically significant legacies of the original game.

**The successor target.** Advanced Movie-Maker / machinima authoring remains an important
**deferred parity pillar**. **Do not scope implementation now.** Preserve the creative fantasy —
and preserve, specifically, the *authorship* of it: the player deciding what the film is, not just
who is in it.

**What we explicitly improve — the one structural lesson to carry regardless of timing.** The
original made this a genuinely separate mode that pulled the player away from the running clock,
and even positive coverage noted it "requires significant time investment that disrupts the main
gameplay flow" (DO NOT CLONE THE TEDIUM, item 7; §36.6). Whenever it is scoped, it should be an
**overlay over the still-live lot**, following the pattern already established for the commission,
casting and greenlight workflows — never a separate screen that ejects or pauses the player.
The original's weak native export also pushed serious creators out of the product entirely
(§36.7); a modern equivalent should not require leaving to finish.

**What we reject.** The mode-switch tax. A creative-depth feature that competes with the live world
for the player's attention, rather than living inside it.

**Where it stands.** Nothing exists and nothing is designed. This is the one pillar explicitly
blocked on an Owner decision about **investment level** — building an authoring tool is a major
separate investment, and the Bible is unambiguous that a future Owner ruling should set scope and
timing.

**Two things the eventual ruling will have to cover, because nothing currently does.**

- **Camera and cinematography authoring has no home.** The Bible records an explicit *ruling gap*:
  camera-path authoring — freecam, keyframed moves, overlays — "does not map cleanly onto Buildings,
  Sets, Crew, Era, or Machinima," and is flagged for its own future Owner ruling rather than folded
  into one of those. It is not covered by the machinima decision by default.
- **An authoring tool necessarily touches scene composition and visual output**, both of which sit
  on the project's stale "Do not build" list that the newer rulings never addressed. This pillar is
  therefore a concrete instance of the governance conflict in **D1** — it cannot be scoped while
  that list still reads as binding.

> ### SUCCESS TEST
> **Success means** a player can author a film they are proud of without ever leaving the studio
> they built it in.

---

## PILLAR 15 — SANDBOX / PLAYER FREEDOM

**Status: PLANNED** — holds a named position in the sequence; explicitly **not** a permanent exclusion · **Sequencing: TENTATIVE — and its timing is itself a recorded Owner ruling pending**

**The original fantasy.** Sandbox was a real selectable mode whose stated purpose was to let players
"focus less on the game's studio simulation and more on movie-making" (§31, Prima). It let the
player choose a starting year and starting cash, and exposed genuine toggles: instant construction,
buildings that never decay, Stars who always comply, and a switch for whether films shot instantly
or over normal time — one documented player deliberately left that last one off **in order to watch
movies being shot** (§31). Crucially, Sandbox **inherited unlocks from campaign progress**: anything
unlocked in any saved campaign became available, and the full content library required a campaign
played to 2005 with the Platinum Lifetime Honor earned. Sandbox was explicitly not
everything-unlocked-by-default; it was a reward for playing the real game.

**The successor target.** Sandbox remains **later parity, not permanent exclusion**. Preserve the
option for lower-pressure creative play **without weakening the main tycoon campaign**. The
original's inheritance model is the design lead worth keeping: freedom as something the campaign
earns you, not a bypass that makes the campaign pointless.

**What we explicitly improve.** The original's Sandbox purpose was largely "get to the Movie-Maker
faster," which coupled it tightly to Pillar 14. A modern low-pressure mode can stand on its own as
a way to play the studio game without the ladder.

**What we reject.** A sandbox that hollows out the campaign. If everything is free from the first
minute, the tycoon game has nothing to give.

**Where it stands.** No sandbox mode, flag or free-play path exists anywhere in the engine or the
UI. It holds a named position eighth of nine in the sequence — behind a campaign that has not yet
received its GO — and it is the one pillar in the sequence carrying an **explicit open timing
ruling** of its own. No date exists and none is invented here.

**An open design question worth recording now, because it shapes the whole mode.** The original's
Sandbox inherited unlocks from campaign saves, and its full content library was gated behind a
completed campaign. Our world is per-save and seeded, with a strict save-migration discipline —
so cross-save inheritance is not a free choice, and whatever replaces that gate has to come from
somewhere. It is also unresolved whether sandbox play should count toward career records and any
future recognition at all.

> ### SUCCESS TEST
> **Success means** a player who wants to make movies without the pressure has somewhere to go, and
> the player who wants the pressure never notices it was an option.

---

## THE SUCCESS LADDER

This is the roadmap expressed as **player experience**, not as a feature list. Each rung is a
sentence the player should be able to say when that stage is genuinely finished.

**How to read the sequencing column.** *SEALED* = shipped and ratified. *FROZEN* = charter frozen
by Owner authority. *IN PLANNING* = under active advance planning, charter not final. *SEQUENCED* =
holds a frozen position in the Master Plan's order, no charter written. *TENTATIVE* = a PM
recommendation the Owner has **not yet ratified**. *NOT SEQUENCED* = a legitimate product direction
with no position in the current order.

**No delivery date exists for any campaign anywhere in the corpus** — not a date, a sprint, a
quarter or a duration. Every forward statement in the plan is about **order and conditionality**,
never timing. **None is invented here.**

| # | Rung | The player says… | Sequencing |
|---|---|---|---|
| 0 | **Foundation / First Movie** | *"I understand how to make a movie."* | **SEALED** |
| 1 | **Campaign 1 — Lot Content** | *"I built this place."* | **SEALED** — KEEP at `f294077`, ratified |
| 1a | **PF1 — Professional Floor** | *"This feels like real game software."* | **SEALED** — KEEP + PROMOTE at `d95d6a6`, promoted to `main` (see below) |
| 2 | **C2 — Living Studio / Production Throughput** | *"I built this movie studio, it operates while I watch, my writers create pictures, and I can physically watch multiple films compete for real production resources."* | **CHARTER FROZEN (r3.1)** — see the note below; still does **not** start automatically, and needs its own Owner authorization |
| 3 | **C3 — Progression / Prestige / Awards / Land** | *"My studio has status, goals, recognition and things I desperately want to unlock."* | **SEQUENCED** — position frozen, uncharted |
| 4 | **C4 — Era / Genre / Research** | *"I am living through film history and the kinds of movies worth making change with the world."* | **SEQUENCED** — position frozen, uncharted |
| 5 | **Stars / Relationships** | *"I know these people and remember their careers."* | **TENTATIVE** — the C5-before-C6 reorder is an unratified PM recommendation |
| 6 | **Economy Closure** | *"Success makes the strategic game richer rather than trivial."* | **TENTATIVE** — same unratified reorder |
| 7 | **Hollywood Ecosystem** | *"I recognize rival studios, people and movies from the history of my save."* | **NOT SEQUENCED** |
| 8 | **Studio Legacy / IP** | *"Movies I made decades ago still matter."* | **NOT SEQUENCED** |
| 9 | **Studio Empire** | *"I can shape the ownership and structure of Hollywood itself."* | **NOT SEQUENCED** |
| ∞ | **2040 Endurance Target** | *"I can look back over 120 years and understand how my tiny 1920 studio became this institution."* | **STANDING TARGET** — not a campaign |

**Three campaigns hold positions in the Master Plan but no rung on this ladder**, because the Owner
expressed the ladder in player outcomes and these were not among them: **Addiction/Rehab deepening**
(TENTATIVE, sequenced after Star life), **Sandbox** (TENTATIVE; its timing is itself recorded as an
Owner ruling pending), and **Machinima / Advanced Movie-Maker** (occupies a slot, not a schedule —
it may only proceed after its own dedicated Owner scope ruling). They are named here so the ladder
is not mistaken for the complete plan. **"Decision Legibility" is not among them: it was retired as
a standalone campaign and should not be listed as pending work.**

### What each rung actually means

**0 — Foundation / First Movie.** The player can complete the loop once and understand what they
did. This is the rung everything else is layered on, and it is done.

**1 — Lot Content.** The lot stopped being a demonstration of placement machinery and became a
place the player chose the shape of. Sealed and ratified.

**1a — Professional Floor.** A bridge, not a polish program: the studio makes sound, important
moments land, refusals are communicated, the browser never speaks in its own voice, and there is a
real front door. The standing law it establishes is permanent — **presentation reacts to truth;
presentation never creates or persists game truth.** Explicitly one short campaign; there is no
PF2 without fresh Owner authorization. It also establishes the editorial voice — confident
20th-century Hollywood trade language — which is then reused everywhere.

*Recorded honestly, then overtaken:* two documents of the same date disagreed about PF1's start. The
Master Plan listed "PF1 GO" among decisions **still required from the Owner**, while the C2 planning
brief stated PF1 **was being implemented now** on its own branch. Neither superseded the other on its
face, and this Blueprint's base text therefore described PF1 as charter frozen and in flight,
asserting neither that the GO was outstanding nor that PF1 was complete.

> **Status corrected at the pre-C2 governance reconciliation, 2026-08-18.** That ambiguity is closed
> by the record: PF1 is **sealed and promoted**. Owner review returned **KEEP + PROMOTE** (`4aef763`),
> the seal HEAD was corrected to `d95d6a6` with the decisive gates re-run green at it (`2b75e3d`), and
> that work is in `main` — it is the base this document is being added onto. The dispute account above
> is retained as provenance, not as current status. Two distinctions survive it and are **not** rounded
> up: PF1 was a bridge campaign, not proof of any pillar, and the Owner review recorded playtest
> findings as **post-PF1 inherited residuals** rather than as PF1 defects.

**2 — Living Studio.** The largest single jump on the ladder, and the first rung where the game
becomes the thing the North Star describes. It combines the time model, renewable screenplay
generation, Sets and Stages as real contended resources, the visible queue, premiere night, and
the Founding Flip. This is where Pillars 2, 3 and 4 land together, because they are one experience.

> **Update, later the same day as this Blueprint's base.** The C2 charter has since **frozen at
> revision 3.1**, with Renewable Screenplay Generation V1 incorporated and given concrete mechanics,
> the Theater ruling applied, and set types authored. This is recorded as a **fact about
> sequencing**, not a summary of C2's design, and this document does not restate or interpret that
> charter — read it directly.
>
> It also **settles decision D3**, which this document originally recorded as open: **C2 owns
> Renewable Screenplay Generation V1; C4 owns the era-sensitive deepening.** C2's charter firmly owns
> RSG V1, and the horizon ruling's naming of C4 for concept supply is the *deep* version, not a
> competing claim on V1. Recorded as ruled at the pre-C2 governance reconciliation, 2026-08-18 — see
> D3 below for the evidence trail that made this look contested.

**3 — Progression / Prestige / Awards / Land.** The rung that converts accumulation into ambition.
Pillars 9 and 10, plus prestige reconnected to the physical lot and the first earned expansion of
the property itself.

**4 — Era / Genre / Research.** Time starts to mean something. Pillar 8, plus the depth Pillar 3's
screenplay system needs to become era-sensitive rather than merely renewable.

**5 — Stars / Relationships.** *(Position unratified — see below.)* Pillars 6 and 7, deliberately
as **one** campaign rather than two: stress/mood and relationships share the same substrate — a
bounded per-Star state layer over people the engine already treats as individuals — and building
that layer twice would be a mistake. It is sequenced here on purpose: after C2 the work is
physical, and after C3/C4 careers have real stakes, so chemistry derived from visible shared work
has something to be about.

**6 — Economy Closure.** *(Position unratified — see below.)* Calibration, sequenced late on
purpose. Closing the cash-runaway residual before star salaries, amenity costs, land purchases and
landscaping exist would only mean recalibrating after they arrive. The honest risk, recorded rather
than hidden: the residual persists through several campaigns of long-horizon playtesting and can
distort tuning judgment along the way.

**The rungs 5 and 6 caveat.** Putting Stars/Relationships ahead of Economy Closure is a **PM
recommendation the Owner has not yet ratified** — the Master Plan carries it in its own
"still required from the Owner" list. The reasoning for it is strong and is recorded above. But
until it is ratified, **the order of rungs 5 and 6 is not settled**, and this Blueprint does not
present it as if it were.

**7, 8, 9 — Hollywood Ecosystem, Studio Legacy, Studio Empire.** These are the pillars that turn a
studio simulator into a **history**. They are legitimate long-term product directions and they are
**not currently authorized scope**. They also depend on each other in a fixed order: a film library
that can be traded needs someone to trade with, and an empire needs rivals to acquire. **This
Blueprint invents no dates and no sequence for them.**

**∞ — The 2040 Endurance Target.** Not a campaign and not a rung anyone builds. It is the standing
test every campaign is measured against: does this still work at week 6,240? A system that is
elegant at week 50 and unusable at week 6,000 has failed this target, and the failure will not
show up in any test written for the campaign that shipped it.

### Two honest gaps in this ladder

These are recorded because a roadmap that hides its seams is worse than one that shows them.

**The ladder and the Master Plan diverge after Economy Closure.** The Master Plan's current
sequence continues past Economy Closure with **Addiction/Rehab deepening**, **Sandbox**, and
**Machinima / Advanced Movie-Maker**. None of those three appears on this ladder. Conversely, the
ladder's last three rungs — Hollywood Ecosystem, Studio Legacy/IP, Studio Empire — hold no position
in the Master Plan at all. This is not a contradiction: the ladder describes *player outcomes* and
the Master Plan sequences *campaigns*, and the two were written for different purposes. But it does
mean **the order of everything after Economy Closure is genuinely undecided**, and nobody should
read either document as having settled it.

**"Foundation / First Movie" is a rung, not a campaign.** It does not correspond to a charter and
has no closure record of its own; it names the state the project was already in when Campaign 1
opened. It is listed for the player's sake, not the planner's.

---

## CONTRADICTIONS BETWEEN BIBLE EVIDENCE AND NEWER OWNER DIRECTION

**Twelve are recorded, two of them blocking.**

**What counts as a contradiction here.** The Bible describing what the original did, while the Owner
wants something different, is the **normal and expected** relationship between history and intent —
that is not a contradiction, and none of those are listed. What follows are cases where two things
cannot both stand as written, or where a claim is pointed at the wrong evidence. Each was verified
against source by an adversarial pass instructed to refute rather than confirm.

### 1. The project's own `CLAUDE.md` contradicts current Owner authority — and is actively blocking

**Severity: blocking.** The repository's `CLAUDE.md` still carries a "Do not build" list naming,
among others: chemistry, readable memories, **the lot**, rival studios as agents, awards season,
aging and career progression, competition modelling, library economics, receivership, the studio
economy, cultural drift, accessibility, onboarding and tutorial. It also still instructs agents to
**stop before phase 5**.

Several of those are now **shipped, sealed, or scheduled**: the lot is the project's headline
achievement and Campaign 1 is sealed and ratified; awards and progression are C3's scope;
relationships are C5's. The 17 Aug 2026 Owner Product Authority and the Hollywood-horizon rulings
both supersede the permanent-exclusion framing.

**And the file already contradicts itself**, which is worse than being merely stale. Its own opening
banner states that "UI, the Studio Lot, accessibility, economy, operations, careers, and visual
output **now exist by explicit later authority**" and instructs agents not to roll them back — while
the body beneath it still forbids building them. A reader can take either half in good faith.

**Accessibility is the clearest illustration: four documents, three positions, one shipped
implementation.** `CLAUDE.md`'s body forbids it. `CLAUDE.md`'s own banner says it exists by later
authority. Operational law 26 is a full accessibility law with a live verification matrix. And Bible
§40 still lists accessibility among "confirmed non-goal[s]… a considered, permanent decision, not an
oversight to quietly reopen." It is built and verified regardless.

The future-proofing scout states the consequence plainly: **an agent reading `CLAUDE.md` as binding
today would refuse authorized work.** This is not a philosophical inconsistency — it is a live
operational hazard, it is the single most consequential contradiction in the corpus, and every other
pillar in this document trips over it.

### 2. The title / rename evidence has been cited against the wrong pipeline

**Severity: material.** A widely-repeated framing holds that genre-sensitive random titles are
*directly confirmed in the Advanced Movie-Maker*, and that standard-pipeline *renaming* rests on
Owner memory "unless stronger evidence is found." **The Bible supports close to the reverse**, and
Pillar 3 records the corrected position in full.

In short: the AMM is where **player naming** is OFFICIAL; **auto-generated titles** are a
**standard-pipeline** observation (three directly-observed movie cards, with genre-consonance an
inference from n=3, and no source describing a title generator at all); and standard-pipeline
**renaming has no evidence whatsoever** — not weak evidence, silence.

The successor design is unaffected and already ruled. What is affected is where a future PM would
go looking, and what confidence they would attach to what they found. Notably, the C2 planning
ruling states this correctly — it is the summarized framing, not the project's own record, that
inverted it.

### 3. Three Bible passages still describe superseded exclusions as permanent

**Severity: material.** §40 states that rival-studio competition and cultural drift are "a confirmed
non-goal for this project… treated here as a considered, permanent decision, not an oversight to
quietly reopen." §38's Sandbox row and §41's studio-rank row repeat "rival-studio competition /
chart-ranking remain out of scope" as settled, and §41 scopes the rank ladder as "deliberately
excluding rival-studio competition."

The Hollywood-horizon ruling replaces exactly that framing: these are legitimate long-term
directions, governed by *not current scope unless explicitly authorized*. **The newer ruling wins on
framing; the exclusion from *current* scope still stands.** The Bible's own front matter already
carries the correction, so the document disagrees with itself in places — the front matter and the
newer ruling are the operative text.

### 4. Two places where the current build sits *below* the historical floor

**Severity: material — and these are the most important entries in this list**, because they are the
only ones where we are further from the North Star than the 2005 game was.

- **Screenplay supply.** The original had **no cap on screenplays** — writing was a renewable
  industrial process, and surplus scripts could even be sold. The current build fixes a pool of 30
  concepts at world generation, claimed permanently, with exhaustion raising a terminal blocker
  whose only stated remedy is to continue with an existing project. Against a 1920–2040 horizon that
  is a stop roughly a decade in. This is a **regression against the floor, not a design choice** —
  already ruled, and owned by C2 (foundation) and C4 (depth).
- **Lot layout.** The original's manual states directly that distance between buildings extends
  production time and adds cost. In the current build travel is a **fixed one-beat allocation
  regardless of distance**, so where a building sits has no effect on throughput. The Lot Law is
  currently not implemented.

### 5. A standing Owner ruling is contradicted by shipped behaviour: the save-size ceiling

**Severity: blocking for the 2040 target.** The horizon ruling states there is **no hard calendar
game-over**. But the whole save serializes to browser local storage with the quota failure swallowed
in an empty `catch`, against an estimated 8–14 MB save at week 6,240 versus a roughly 5 MB quota.
That is **an effective storage game-over arriving at almost exactly the horizon the ruling names**,
and it fails silently rather than telling anyone.

Nothing about the no-game-over ruling is wrong. The contradiction is between the ruling and the
shipped persistence strategy, and it will not surface in any test written for the campaign that
ships it.

### 6. `Standing` is a frozen three-key leaf, and C3 will want a fourth channel

**Severity: material — a one-way door.** The rulings direct that rank, prestige and awards build on
the existing continuous standing metrics. But `Standing` is exactly three keys, reachable from every
save version, so adding a fourth channel retroactively changes V1 through V13 at once. C3 is
explicitly the campaign that will want one. This needs deciding **before** C3 designs against it,
not during.

### 7. Renewable screenplay ownership is stated two ways, on the same day

**Severity: material.** The horizon ruling names **C4** as "the current intended owning campaign"
for renewable concept supply. The C2 consolidated ruling makes Renewable Screenplay Generation V1
**new C2 scope** that "may NOT be dropped to protect milestone size," with "C4 owns the deep
version."

These are reconcilable — foundation at C2, depth at C4, which is how this Blueprint reads them — but
**they are not reconciled in writing anywhere, neither cites the other, and both carry the same
date with no finer timestamp**, so no supersession order can be established from the documents. It
should be reconciled explicitly rather than left to each reader to infer.

Relatedly: **C2's authorized scope is now larger than the Master Plan records.** The Master Plan's
C2 entry does not mention screenplay generation at all.

### 8. The time-model docket framing is stale in two frozen documents

**Severity: material.** The Master Plan's docket section, and the PF1 charter that quotes it, both
frame the living-turn model as "a starting hypothesis, not a ruling," with "the comparison remains
genuine and evidence may defeat B." The newer C2 rulings supersede that: living time is a
**requirement**, and the docket now answers **how** to deliver it, **not whether**. Two frozen
documents still carry the older framing.

### 9. Two internal inconsistencies inside the Bible itself

**Severity: minor, but worth knowing before you cite either.**

- The Magic 15's era entry summarizes the original as starting in 1920 and progressing
  *indefinitely*, which overstates §31's more precisely sourced finding of a hard 1 January 2005
  reward end-point with nothing new unlocking afterwards. §31 is the better-sourced claim.
- §22's rank-progression evidence carries a preserved, unresolved tension about whether rank rewards
  were granted **at** a scheduled ceremony or **the instant** requirements were met. Both readings
  are in the corpus; the Bible deliberately resolves neither, and states Project: Studio is not bound
  to reproduce whichever the original did.
- §31's own table calls the award categories **"yearly"** one row after calling the ceremony
  **"quinquennial."** A wording slip in a single table header, not counter-evidence: every
  substantive statement elsewhere — the manual, Prima, and a directly-observed in-game ceremony date
  — says five years. Read "five-year" and move on.

**And one in the Master Plan.** It lists *"sandbox timing"* as an outstanding Owner ruling in one
section while omitting it from the section that registers outstanding rulings — which is the list
an Owner would actually work from, so the item would simply never surface. Cheap to reconcile in
either direction.

### 10. "Campaign 4" and "Campaign 5" each name two different campaigns

**Severity: material.** This is not one stale number, it is a **two-way collision across two live
numbering generations**, and nothing reconciles it:

| Label | Means, in the Bible's five-campaign order | Means, in the Master Plan's current order |
|---|---|---|
| **Campaign 4** | Progression & Prestige Ladder — *and* Awards | Genre Depth, Research & the Opening of Time |
| **Campaign 5** | Genre Depth & Economy Closure | Stars Become People + Relationships |

Both documents are current authority for different things — the Bible for rulings, the Master Plan
for sequencing — so both senses are in circulation simultaneously. A ruling that says "Awards land
in Campaign 4" and a plan that says "Campaign 4 opens time" are describing **different campaigns**,
and an agent briefed on both will route work to the wrong one without ever noticing the ambiguity.

**Recommendation:** stop using bare "Campaign N" in rulings. Name the campaign
(*"Progression, Prestige & Awards"*) or use the Master Plan's own C-prefixed identifiers. This
document uses C1/PF1/C2…C9 throughout and names the campaign on first use for exactly this reason.

### 11. Two further one-way doors verified in the schema

**Severity: material.** Alongside the `Standing` leaf in item 6, two more constraints point the
opposite way from the guidance written against them:

- **`EraConfig.censorship` is a closed union** (`'none' | 'code' | 'ratings'`), validated as an enum
  reachable from save versions V8 through V13. The instruction to "let `EraConfig` vary and unlock
  over calendar time" is sound as intent, but the naive implementation of it **breaks every existing
  save**. Era work has to land on a new root, and C4 must be able to *move* cultural-force and
  segment values without *adding members*.
- **`beginFounding` rewrites a world-level root.** It returns re-priced world `concepts` as a
  consequence of one studio's founding — with an in-code comment already acknowledging the boundary.
  This is harmless with one studio and **breaks the moment a second exists**: one studio's founding
  would re-price the shared script market for everyone. It is a live violation of the invariant the
  entire Hollywood-ecosystem pillar depends on, sitting in the code today, costing nothing to fix
  now and a great deal to fix after rivals exist.

### 12. A design conflict nobody has resolved: franchises versus novelty

**Severity: material, for a pillar that is not yet scoped.** The original **taxed repetition**:
novelty was a Success-stage input, sets and actors accumulated public boredom, and reuse was
penalized. A sequels/remakes/franchise/library-IP system **rewards precisely what those mechanics
taxed**. No document reconciles the two. Similarly, the six-week theatrical loop is ruled PRESERVE
("leave as-is"), while a reissue or a second revenue episode would necessarily reopen it. Pillar 12
cannot be designed without settling both.

### Not contradictions — recorded so nobody re-files them as such

- **The 2040 horizon versus the original's ~2005 content endpoint.** The original's *simulation* ran
  indefinitely; only its *authored content* stopped. Our horizon is an extension of the original's
  own intent, not a departure from it.
- **No hard bankruptcy.** The original had no hard fail state either — this is parity, though the
  Bible marks its own conclusion INFERRED.
- **Awards at "Campaign 4" versus C3.** These are the same campaign under two numbering generations:
  the Bible's five-campaign order numbered Progression as 4; the Master Plan's current order numbers
  it 3. Not a disagreement about content — but see the collision immediately below, which *is* worse
  than a routing hazard.
- **Stale routing documents.** `ROADMAP.md`, `DECISIONS.md`, `PLAYTEST.md`, `START-HERE.md`,
  `NEXT-HIGHEST-LEVERAGE.md` and `CURRENT-BEST.md` all describe superseded eras, and several record
  the save format as V11 when the live format is V13. They are out of date, not in conflict — but
  none is current sequencing authority.

  **One of them deserves a specific warning.** `CURRENT-BEST.md` names an accepted milestone that
  two whole campaigns have since superseded, and its several hundred lines of world-first prose read
  as a far more finished product than the parity assessment supports. **Anyone auditing status from
  `CURRENT-BEST.md` alone will overstate the build.** Cite the Master Plan and the 2026-08-18
  rulings instead.

  And the Master Plan itself is **internally stale in the sections its last revision did not
  amend** — its current-state assessment still describes the facility catalog as a single blueprint
  and ranks it as the number-one gap, which Campaign 1 closed. Where the plan's unamended prose and
  the post-C1 code disagree, the code and the C1 closure record are the current facts.

---

## OWNER DECISIONS NEEDED NOW

**The filter applied here is deliberately hard.** "Needed now" means the decision either **blocks
work that is happening this month** or **guards a one-way door** — an irreversible choice about
data, identity or save compatibility that gets more expensive with every week it waits. Everything
that would merely be *useful to settle eventually* has been left off, and there is a short list of
those at the end for completeness.

Six decisions meet that bar.

### D1 — Reconcile `CLAUDE.md` with current Owner authority

**Why now:** it is blocking today. `CLAUDE.md` is the file every agent reads first. It currently
forbids work that is sealed, scheduled, or in flight, and instructs agents to stop before a phase
the project passed long ago. An agent obeying it will refuse authorized work; an agent ignoring it
has learned that the project's own instructions are advisory, which is worse.

**Options:**
1. **Reframe in place** — convert the "Do not build" list to "not current scope unless explicitly
   authorized," matching the horizon ruling's language, and update the phase instruction. *(This is
   what the horizon-governance branch already drafted.)*
2. **Replace with a pointer** — reduce `CLAUDE.md` to routing (read the Master Plan, then the active
   charter) and let charters carry all scope statements.
3. **Reaffirm specific items as genuinely permanent** — if any exclusion on that list *is* meant to
   be permanent, say so explicitly, since the 17 Aug 2026 authority requires explicit reaffirmation
   for permanence.

**Recommendation:** option 1, with option 3 applied to anything the Owner actually wants kept shut.

### D2 — Settle PF1's GO status — **OVERTAKEN BY EVENTS**

> **Closed by the record, not by a ruling.** This docket item was written when PF1's authorization was
> ambiguous. It is moot at this document's own base: PF1 was sealed, Owner-reviewed **KEEP + PROMOTE**,
> and promoted into `main` — `4aef763` ("Owner review — KEEP + PROMOTE"), sealed HEAD `d95d6a6`,
> recorded at `2b75e3d`. Option (a) is what happened. Retained for provenance.

**Why it was raised:** two same-dated documents disagreed about whether implementation was authorized,
and work appeared to be in flight on a branch. This was a one-sentence ruling that would remove
ambiguity about whether current activity was sanctioned.

**Options:** (a) confirm GO was given and clear the "still required" item; (b) confirm GO is
outstanding and that branch work is preparatory only.

### D3 — Who owns renewable screenplay supply: C2 or C4 — **RULED**

> **RULED at the pre-C2 governance reconciliation, 2026-08-18: option 1. C2 owns Renewable
> Screenplay Generation V1 — the foundational fantasy, "a writer goes to work and eventually hands
> me a new movie." C4 owns the era-sensitive deep version.** The thirty-screenplay ceiling therefore
> has a named owner: **C2**. It is no longer an unowned blocker.
>
> The record below is retained unchanged as the evidence trail — it explains why the ownership looked
> contested to anyone auditing by the book, and that diagnosis was correct at the time.

**Why this was raised:** C2 was being chartered, and its scope depended on the answer. Two rulings
of the same date pointed at different campaigns with no way to establish which was later.

**And the gap has a measurable consequence already.** An independent status audit of this
repository — reading the Master Plan as the sequencing authority, which is correct practice —
concluded that the thirty-screenplay ceiling is an **unowned blocker with no campaign responsible
for lifting it**, and recommended raising it to the Owner as such. That conclusion is reasonable
from the Master Plan alone, because the Master Plan's C2 entry does not mention screenplay
generation. It is only wrong because a separate ruling assigned it to C2 without the plan being
updated. **A hard cap that bounds four pillars currently looks ownerless to anyone auditing by the
book.** Writing the reconciliation down fixes that in one line.

**Options:**
1. **Ratify the split as this Blueprint reads it** — C2 owns the foundational fantasy ("a writer
   goes to work and eventually hands me a new movie"); C4 owns the era-sensitive deep version.
2. **Give the whole thing to C4** and remove it from C2's scope — which would leave the 30-concept
   wall standing through two more campaigns.
3. **Give the whole thing to C2.**

**Recommendation:** option 1 — it is what both rulings appear to mean, and it only needs writing down.

**Update:** the C2 charter has since frozen at revision 3.1 with RSG V1 incorporated and given
concrete mechanics. In practice option 1 is now the operating assumption. That makes writing the
reconciliation down **more** urgent, not less: a frozen charter and a standing Owner ruling now name
different owners for the same system, and the Master Plan records neither.

**Resolution (2026-08-18, pre-C2 governance reconciliation): option 1 is ratified — RSG ownership is
C2 (V1) → C4 (deepening).** Pillar 3 and the pillar table already read that way; this closes the gap
between them and this docket. **The Master Plan now records it too**, by Owner order:
`THE-MOVIES-PARITY-MASTER-PLAN.md` §8 item 2 names RSG V1 as C2 scope, names C4 as owner of the
era/genre deepening, and names the 30-concept ceiling explicitly. The "ownerless blocker" conclusion
described above is therefore no longer reachable from any of the three authorities — it was correct
when it was drawn, and it is now closed.

**Ratify the identity law at the same time, in the same breath.** Existing `FilmConcept.id` values
are permanent: concepts may be appended with fresh IDs, and an existing ID may never be removed,
reassigned or re-minted. This is currently recorded in a governance document on an unmerged branch.
It deserves to be a **numbered operational law**, because it is the clause that protects every film
already in a player's history — a regenerated pool that re-minted an existing ID would silently
rewrite the identity of films that have already been released. Generation is the interesting
problem; **the identity rule is the one that is unforgiving**, and it should not live somewhere a
future implementer might not read.

### D3b — Rule the time model, and rule separately on Advance Week

**Why now:** it is on the Master Plan's own still-required list, positioned at C2 planning — and
C2 is next. **Half of Pillar 2 cannot be built or proven until it lands.** The Master Plan also
forbids bolting real-time onto the weekly engine "merely because the genre commonly has it," so
there is no default path that gets taken while the decision waits.

The living-time *requirement* is already ruled. What is not ruled is the architecture, and the open
questions are simulation-design decisions with real consequences: what an action at "week 12.4"
means, when money accrues, when random draws happen, whether time runs while a decision panel is
open, whether a player can miss a decision, whether a blocker pauses time.

**Options:** (a) the current discrete week model; (b) a living-turn model — the world stays visibly
and audibly alive while authoritative progress advances through deterministic boundaries; (c)
finer-grained continuous simulation with explicit mid-period semantics. **B is the Owner's stated
preferred hypothesis to investigate first, explicitly not a ruling**, and evidence is permitted to
defeat it.

**A separate sub-ruling, easily missed:** does **Advance Week** survive as a permanent convenience
once time runs on its own, or retire? It has **no original analogue** — it can never be defended as
parity — so it lives or dies purely as a modern convenience, and that is a product call.

### D4 — Rule on the `Standing` fourth channel before C3 designs against it

**Why now:** **a pure one-way door, and the corpus currently points the wrong way through it.**
`Standing` is a frozen three-key leaf reachable from every save version; adding a channel
retroactively changes V1 through V13 at once. C3 — progression, prestige and awards — is explicitly
the campaign that will want one. Deciding after C3 has designed against the wrong assumption means
either a migration nobody planned or a design compromise nobody wanted.

**The same ruling should cover era work**, because it is the identical hazard one campaign later:
`EraConfig.censorship` is a closed union validated across V8–V13, so "let `EraConfig` vary over
time" cannot be implemented literally without breaking saves. C4 must be able to **move**
cultural-force and segment values without **adding members**.

**Options:**
1. **New root** — awards, prestige and era facts land on new state roots, leaving `Standing` and
   `EraConfig` frozen as they are.
2. **Widen the existing leaves** and accept a migration touching every prior save version.
3. **Derived read model only** — no new persisted channel at all; compute prestige from existing
   state.

**Recommendation:** option 1 or 3. Option 2 is the one that should not be chosen by accident — and
right now it is the one the written guidance points at.

### D5 — Rule on whether the save-size ceiling is blocking

**Why now:** it silently contradicts a standing Owner ruling, and every campaign that adds persisted
state makes it arrive sooner. It is also currently invisible — the failure is swallowed, so the
first person to discover it will be a player losing a long campaign, not a test.

This is partly an engineering matter, but the **Owner call** is whether a storage ceiling counts as
the "hard game-over" the horizon ruling forbids. If it does, it is a blocker with a deadline; if it
does not, it needs saying so that nobody treats it as one.

**There is a second half to this decision that is easy to miss.** The fix lives in `ui/`, which
**PF1 has frozen**. So ruling that the ceiling is blocking is not sufficient on its own — it also
requires **explicitly authorizing someone to touch `ui/`**, or consciously routing the work to a
later campaign and accepting the exposure until then.

**Options:** (a) declare it blocking, authorize the persistence work, and require a strategy before
the 2040 target is claimed anywhere; (b) declare it non-blocking for now, but require at minimum
that the silent failure becomes a loud one; (c) accept it as a known limitation of the browser
build and record it as such.

**Recommendation:** at minimum (b). A silent, unrecoverable failure is not an acceptable state
regardless of how the larger question is answered — a player should never be the first thing that
discovers it.

### Pending, but explicitly *not* needed now

Recorded so they are not lost, and so nobody mistakes them for urgent:

- **Ratify or reject the Stars-before-Economy reorder** (rungs 5 and 6). On the Master Plan's own
  still-required list; four campaigns out.
- **The machinima investment-level ruling.** Required before Pillar 14 can be sequenced at all, but
  nothing currently waits on it.
- **Sandbox timing.**
- **Concept-identity namespacing before a second studio identity exists.** Irreversible once records
  exist — but no second studio is sequenced, so the door is not yet closing.
- **Whether lot layout should again affect production throughput.** The Magic 15 asks that this be
  decided on purpose rather than left as an unexamined omission; C2 is the natural moment.
- **Overlay-versus-drag as the permanent house style.** Recorded as "an accident, not a decision" —
  and an unexamined default is the one thing the Bible says is not allowed here.

---

## DOCUMENT BOUNDARIES

This Blueprint deliberately does **not**:

- duplicate the Mechanics Bible's evidence — it **cites** sections rather than copying them;
- alter, soften or extend any historical claim about what *The Movies* did;
- contain implementation-level class, file, schema or API designs;
- restate or replace the C2 charter, the PF1 charter, or any campaign plan;
- lock speculative tuning values for systems that do not exist;
- fabricate an original-game mechanic that no source supports;
- authorize a future campaign merely by naming it.

Where this document names a system that does not exist, that is a statement of product direction
under the current Owner framing — *not current scope unless explicitly authorized*. Where it names
a campaign for an unsequenced pillar, that attribution is marked **TENTATIVE** and invents no date.

---

## PROVENANCE

**Base.** Canonical `main` @ `1e6b422`, verified against the remote at time of writing. Branch
`docs/project-studio-success-blueprint`, created from that commit in an isolated worktree. The PF1
and C2 worktrees were **not touched**; C2's Owner-ruling records were read, read-only, to establish
which pillars C2 owns. No shared file was modified. This pass adds exactly one file.

**A moving target, noted honestly.** The C2 planning stream advanced *while this document was being
written* — its charter froze at revision 3.1 after this Blueprint's base commit. The affected
statements have been updated and marked. Anything here about sequencing is true as of `1e6b422`
plus that one observed change; **the charters remain the authority on their own scope**, and a
reader should check them rather than trusting this document's snapshot.

**Sources read directly** (not summarized from other summaries): the Mechanics Bible's front matter,
Owner Product Authority, Magic 15, DO NOT CLONE THE TEDIUM, and §§4, 5, 7, 8, 15, 22, 23, 24, 31,
32, 35, 36, 38, 39, 40, 41; the Technical Artifact Register in full; the Hollywood-horizon Owner
rulings and the future-proofing scout; the Parity Master Plan's sequencing sections; the frozen PF1
charter; the C2 consolidated Owner rulings; the operational-laws register; and the shipped source
tree at this commit.

**A note on what "verified" means in this document.** Status classifications were derived from
closure records, playtest logs and the code itself — not from documents claiming completion. Where a
routing document and the code disagreed, the code won and the disagreement is recorded. Where the
Bible's own sources disagree with each other, both readings are preserved rather than averaged; this
document resolves no historical dispute that the Bible left open.

**One correction this pass made to received framing**, recorded here because it is the kind of thing
that otherwise propagates silently: the title/rename evidence for Pillar 3 had been summarized with
the two pipelines reversed. The corrected position is stated in Pillar 3 and in contradiction 2. The
project's own C2 ruling states it correctly; only the summary had drifted.

**Method.** Evidence was gathered by parallel readers over the Bible's pillar-relevant sections, an
independent status audit against closure records and the shipped code, an independent sequencing
read of the plan and charters, and a final **adversarial cross-check** instructed to refute rather
than confirm — to verify claims against source, to reject history-versus-intent differences as
non-contradictions, and to hunt specifically for invented original-game mechanics. Its verified
findings are incorporated: the fabrication guard table, the campaign-numbering collision, the two
additional schema one-way doors, the Nemeses and awards-competitiveness traps, and the time-model
ruling as a sixth decision needed now. Where it disagreed with an earlier draft, the source was
re-read and the source won.

---

*End of Success Blueprint.*
