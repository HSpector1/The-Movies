# CODEX Post-Production & Release Preparation — Package 06

## Decision-ready design research

- **Status:** Owner-review candidate; documentation only
- **Research branch:** `codex/post-release-research-06`
- **Canonical baseline:** `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`)
- **Sealed Unity reference:** `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`
- **Research date:** 24 August 2026
- **Binding predecessors:** Package 02 world interaction; Package 03 Development; Package 04
  Casting/Greenlight; Package 05 Production/Shooting
- **Production code authorized:** none

Package 06 begins when the authoritative picture wraps and releases its Stage, Set and scenery. It
ends when the player explicitly commits a release-ready picture. It does not redesign reception,
reviews, box office, theatrical-run economics, awards, IP/library economics, or creator tools.

### Evidence notation

- **Verified fact** means a primary source or repository authority directly establishes the claim.
- **Comparator observation** means the cited shipped game/source documents the pattern. Adjacent
  release-governance products are labeled as such and are not represented as games.
- **Inference** means the evidence supports the reading but does not state the purpose.
- **Ruling** means the Project: Studio recommendation.
- Historical confidence is **Very high / High / Moderate / Low**. Conflicts and absences remain
  visible.

---

# 1. Executive decision

Post should feel like a **real department finishing a named picture**, not a second movie editor and
not a hidden interval before a generic button. Routine finishing is autonomous. The lot tells the
player that ownership moved from Production to Post, who and what capacity are occupied, how long
the current authoritative phase has left, and whether the picture is waiting or ready. A retained
Release Review earns the space to explain what is known, what was already committed, what remains
unknown, and what an explicit release will do.

The core grammar is:

> **Wrap frees the Stage → the same stable picture identity transfers automatically to Production /
> Post → Post capacity and named attendance become visible → finishing advances on the one
> authoritative clock → Release Ready asks for deliberate review → `Commit <title> to Release` is a
> stale-safe authoritative commitment → the lot acknowledges dispatch → the next authoritative
> week resolves every committed picture through the existing ordered release pipeline.**

Current Project: Studio already supplies almost all of the simulation truth for that experience:
two authoritative Post weeks, exact Post capacity, capacity blockers, Director/craft presence,
release readiness, frozen Greenlight forecast, costs, release resolution, theatrical runs, durable
film history, saves and reconnect. It lacks one essential product boundary: `releaseReady`
currently auto-releases on the next tick. Package 06 therefore recommends a bounded state-machine
extension: an uncommitted ready picture holds at remaining tick 1; an explicit persisted Release
commit authorizes the existing next-week, ID-sorted release batch. No editing mechanics are added.

## 1.1 Ten governing rulings

1. **Post is mandatory autonomous operations in Project: Studio, even though ordinary Post in *The
   Movies* was optional creative editing.** This is an intentional successor adaptation, not a
   parity claim.
2. **Wrap → Post is automatic.** The player never drags or manually “sends” a finished shoot. The
   Stage, Set and scenery are already released before Post allocation is attempted.
3. **Production / Post is the local world owner through Release Ready.** The Theater becomes the
   post-release public destination; it is not a substitute Release desk for an unreleased picture.
4. **Post shows only honest state:** phase, exact picture, exact facility/capacity, people present,
   authoritative weeks remaining and next milestone. No editorial/sound/VFX subphases or percent
   complete unless TypeScript later models them.
5. **Routine Post contains no fake creative buttons.** Time and capacity planning are the play. A
   real blocker or decision appears only when authority publishes one.
6. **Release Ready must hold until `Commit <title> to Release`.** The commit itself advances no
   time. The next studio week resolves committed ready pictures in existing ID order; uncommitted
   pictures stay ready.
7. **The Release Review uses the stored forecast only as `Greenlight outlook`.** It is not renamed
   “final quality,” refreshed in Unity, or presented as hidden outcome truth.
8. **Marketing remains the package commitment made at Greenlight.** Current publicity remains a
   separate, studio-wide Administration action. Post gets read-only context and a reversible route,
   not a duplicate slider.
9. **Archive is automatic history, not clerical work.** Release appends durable `FilmResult`
   history; Film Chronicle renders the frozen record when available. There is no Archive click or
   invented library/IP economy.
10. **P06A stops at accepted Release commitment and dispatch acknowledgment.** The next-week result,
    reviews, audience response, box office, awards and interpretation belong to Package 07.

---

# 2. Original *The Movies* reconstruction

## 2.1 Ordinary campaign chain

The recovered ordinary chain is:

> `shoot complete → Production Office yard → optional Publicity and/or optional creative Post →
> Production Office Release/Release Budget → earnings and Reviews → manual Archive`

| Step | What the player physically did | Visible/automatic behavior | Source and confidence | Purpose | Project: Studio ruling |
| --- | --- | --- | --- | --- | --- |
| Wrap | Nothing. When every scene finished, the movie icon moved automatically to the Production Office yard. | The movie stopped visiting sets and became a finished film can/card at a new department. | Prima printed p. 43. **Very high.** | Punctuate completion and transfer ownership physically. | **ADOPT principle.** Automatic handoff and visible owner change; no camera hijack. |
| Inspect/preview | The player could put a finished film into the Movie Player room before release. | The produced movie could be watched; this was not itself Release. | Official manual printed p. 12; Production Office description p. 16. **Very high.** | Let the artifact feel like a movie, not only statistics. | **ADAPT/LATER.** A non-authoring preview may exist later; it is not required to operate P06A. |
| Publicity | The player took a script or finished movie to the separate Publicity Office; Stars could also perform publicity. | Public awareness rose. If the Star was attached to an unreleased picture, benefit could be shared. | Official manual p. 12; Prima pp. 18, 43. **Very high.** | Let promotion happen physically before release. | **ADAPT.** Keep publicity distinct from Post and film marketing; current Project: Studio action is studio-wide Administration truth. |
| Creative Post | The player optionally took an ordinary film into Post and manually changed audio, dialogue, music, subtitles, fades, titles and scene order/cuts. | Timeline-style editing changed the exported/viewed movie but Prima states it did not change Movie Quality, Success or Final Movie Rating. | Official manual pp. 26–28; Prima pp. 17, 117. **Very high.** | Player expression and shareable movie authorship. | **REJECT for ordinary tycoon Post; LATER optional creator mode.** |
| Release | The player took the completed movie to the Production Office Release room. If Publicity existed, this became Release Budget and exposed a spend choice. | Release screens showed cost and effects on Stars; Review results followed; earnings began. | Official manual pp. 12, 16; Prima pp. 17, 44–45. **Very high.** | Make publication explicit and consequential. | **ADAPT.** Explicit title-bearing Release Review; no token drag or copied budget values. |
| Hold | A finished film could remain unreleased. Prima describes timing against genre demand or awards as potentially useful. | The picture stayed available at the Production Office rather than releasing automatically. | Prima pp. 44–45. **High.** | Create timing agency. | **ADAPT only to supported current consequences.** V1 holding costs time/opportunity and can permit studio publicity; it has no current release-calendar metagame. |
| Earnings/Reviews | Release put the movie into charts/earnings and generated Reviews. | The player learned commercial/critical result after commitment. | Official manual p. 12; Prima pp. 17, 44–45. **Very high.** | Separate risky commitment from result reveal. | **ADOPT separation; Package 07 owns interpretation.** |
| Archive | After earnings ended, the player manually moved the film into Archive. Prima says this removed it from the lot/card list and it could not return. | The active release area was cleared, but the step was clerical and permanent. | Prima pp. 17, 45. **Very high.** | Control active-card clutter and retain history. | **REJECT manual chore; ADOPT automatic durable history.** |

## 2.2 Production Office ownership

**Verified fact, Very high:** the Production Office was the financial and terminal film department.
Prima enumerates Finance, Reviews, Archive, Movie Player and Release/Release Budget; the manual
supports Movie Player, marketing/release and the building's financial role. Post Production and
Publicity were separate buildings. Sources: Prima printed p. 17; official manual pp. 12, 16.

The building worked as a spatial menu: the film can was a manipulable token and each interior room
was a command target. That made the lot meaningful, but it required the player to remember room
semantics, carry a small object and infer which action was safe.

**Ruling:** preserve one named physical owner and explicit destination, not six room hit targets.
Project: Studio already authors `Production / Post` as a combined world place. Selecting it should
explain the department locally; the retained workspace owns dense review. Do not add a second
Production Office merely to copy the 2005 footprint.

## 2.3 Publicity and release budget

**Verified fact, Very high:** building the Publicity Office changed the Production Office's Release
room into Release Budget. Prima documents five historical spend choices—$0, $50,000, $100,000,
$150,000 and $200,000—and describes marketing/publicity as a Success-stage influence, not an
improvement to underlying Movie Quality (printed pp. 18, 43–45).

The exact formula and weight are not recovered. It is therefore accurate to say marketing could
affect Success/Final Movie Rating and inaccurate to claim it improved Movie Quality or to reproduce
a hidden formula.

**Ruling:** keep “make the film” separate from “make people aware of the film.” Project: Studio has
already moved film marketing into the Greenlight commitment and made publicity a separate
studio-level action. Package 06 shows those facts read-only; it does not resurrect the historical
Release Budget room or duplicate spending.

## 2.4 Ordinary Post versus Advanced Movie Maker

The original manual's Advanced Movie-Making sequence was separate and explicit:

1. choose a title, genre and overall structure;
2. select sets/scenes, roles, costumes, props, weather, lighting and scene variants;
3. cast and shoot the authored material;
4. use Post to reorder/delete/split scenes and add dialogue, music, sound effects, subtitles, fades
   and titles; and
5. export the final movie, documented as `.wmv` in the base manual.

Sources: official manual printed pp. 23–28; Prima pp. 98–99 and 116–117. **Very high confidence.**
The sources establish AMM Post → Export and ordinary Production Office → Release, but do not cleanly
establish the exact join between exported AMM films and campaign release. That ambiguity must not be
filled with invention.

**Design conclusion:** “Post lets you edit the movie” is historically true but dangerously
incomplete. It was optional creative authorship and did not improve ordinary simulation scores.
Project: Studio's current two-week `postProduction` phase is instead operational capacity. The two
can coexist only as explicitly separate modes.

## 2.5 Reviews and pre-release information

The manual describes Reviews after release. It also says a finished film can be placed in the
Reviews room before release for a “sneak peak,” with the advice useful when choosing marketing
(printed p. 39); Prima says scripts/finished movies can be sampled there. The available evidence
still does not prove a precise numeric forecast or reliable predictive law. **Very high confidence
that pre-release review exists; Moderate in its exact predictive mechanics.**

**Ruling:** do not use historical Reviews to justify a perfectly accurate final-cut score. Project:
Studio may later create a perceived final-cut assessment, but that is a TypeScript simulation choice
with provenance and uncertainty—not a Unity label over hidden result data.

## 2.6 Movie cards, labels and navigation

The original right-side movie card persisted through script, filming, ready-to-release, release and
earning. Archiving removed the earned-out film from the Production Office and the movie-card list.
Cards made the picture addressable; dragging routed it to rooms and right-clicking exposed its
information. The
Production Office and Post also had keyboard navigation. Official manual printed pp. 6–12 and 36.

**Underlying purpose:** the named project survived every department and could always be found.

**Ruling:** adopt stable picture identity, compact portfolio status and exact Locate. Reject
draggable tokens, tiny icon-only phase law and manual archive cleanup.

## 2.7 What remains excellent, what aged poorly

### Still excellent

- A finished shoot visibly leaves one physical department and appears at another.
- The movie remains one named object from script through history.
- Preview, publicity, release and result are conceptually distinct.
- Release is an explicit act rather than an incidental timer completion.
- A separate creator tool can serve self-expression without forcing it into normal management.

### Good principle, dated implementation

- Building-owned commands: keep physical ownership; replace room/token manipulation with local
  inspector and retained workspace.
- Persistent movie cards: keep identity/Locate; replace tiny card clutter with scalable portfolio
  hierarchy.
- Marketing at release: keep legible commitment; Project: Studio has already moved that choice to
  Greenlight and should not duplicate it.

### Weak even in 2005

- Manual archiving is a cleanup click, not strategy.
- Post's rich manual tools being disconnected from the tycoon score makes its purpose unclear.
- Evaluation and final-rating drivers were opaque enough to require guide knowledge.
- Repeated physical dragging makes safe inspection and material action too easy to conflate.

## 2.8 Historical ambiguity register

| Question | Best supported answer | Guardrail |
| --- | --- | --- |
| Did ordinary Post improve rating? | Prima says no, twice. GameSpot hedges “none or little”; lower-tier guide rumor differs. | Use Prima: no simulation-rating effect; retain dissent as lower confidence, do not clone rumor. |
| Did marketing improve Movie Quality? | No. It affected Success/Final Movie Rating; exact weighting is unpublished. | Never label promotion as creative quality. |
| Was there a guaranteed pre-release review forecast? | Sources establish review sampling but not a dependable numeric forecast law. | Do not infer a modern forecast model. |
| Did AMM Export replace campaign Release? | Sources establish both paths but not their exact join. | Keep creator export and tycoon release separate until designed. |
| Did Superstar change base Post/Release law? | No replacement workflow is documented; the expansion manual says the basic game remains intact and Superstar packages base + *Stunts & Effects*. | **High confidence:** treat it as later usability evidence, not a third ruleset. |

---

# 3. *Stunts & Effects* / Superstar findings

## 3.1 *Stunts & Effects*

The [official expansion manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041)
documents stunt performers/doubles, stunt difficulty, likeness, skill, condition, injury, success
and failure, plus separate FreeCam/effects controls for authored movies (PDF pp. 3–6 / printed pp.
4–11). The stunt system affects production and the released film's overall rating; FreeCam/effects
are AMM authoring controls, not documented scoring inputs. The manual says the basic game remains
intact (printed p. 2), and neither it nor the Superstar review documents a replacement ordinary
Post, publicity or Release Office workflow. **Very high confidence for stunt/AMM features; High for
the absence of a replacement ordinary flow.**

| Expansion evidence | Package 06 ruling |
| --- | --- |
| Stunt results can contribute to the released picture | **LATER:** a future final-cut assessment may explain authoritative production contributors, but P06A has no stunt authority. |
| FreeCam/effects authoring controls | **OPTIONAL CREATOR MODE:** do not imply rating effect from these controls. |
| FreeCam/effects/editing expands authored control | **OPTIONAL CREATOR MODE:** valuable, explicitly separate. |
| Injury/risk may survive into completion | **PACKAGE 05/future production:** do not invent a Post repair button. |
| No documented replacement ordinary release flow | **LEAVE ALONE:** Package 06 release doctrine stands. |

## 3.2 Superstar Edition

The required [Macinplay review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/)
is secondary evidence. In **Alles dreht sich um den Film**, it distinguishes the regular generated
film process from manual creation and later recutting/dubbing/subtitling. In **Mikromanagement, das
auch mal nervt**, it criticizes repetitive character care, manual archiving and opaque scoring. Its
**Fazit** identifies Superstar as the base game plus *Stunts & Effects*.

**Later-edition verdict:** the complete package preserved the joy of making/watchable movies and the
value of creative tools, but exposed that clerical lifecycle work and unexplained ratings had aged
poorly. Project: Studio should automate routine finishing/archive and spend UI space explaining
known evidence and commitment.

---

# 4. Modern comparator findings

No shipped comparator combines a physical film lot, autonomous Post, player-safe assessment and an
explicit release gate better than this package must. The recommended grammar is therefore a
composite, with each source used only for the problem it actually solves.

| Problem | Strongest reference | Concrete lesson | Project: Studio ruling |
| --- | --- | --- | --- |
| Physical terminal department | *The Movies* | Film can moves from sets to Production Office; Release is a named room/action | **ADOPT physical ownership; ADAPT controls** |
| Autonomous creative/project finishing | *Software Inc.* first-party historical developer post | Leaders can autonomously progress/release projects under bounded policy | **ADAPT autonomy, but retain explicit player Release for hero films** |
| Readiness versus public release | Steamworks release-state documentation (adjacent governance reference) | Review/ready/coming-soon/full-release are distinct states | **ADOPT state separation; do not copy storefront workflow** |
| Explicit final commitment | Apple App Store Connect and Google Play Console documentation (adjacent governance references) | A ready object remains held until a title-bearing/manual publish action and confirmation | **ADOPT explicit current-state commit and stale-safe confirmation** |
| Pre-release identity versus post-release learning | *Game Dev Tycoon* official feature description | The official post separately lists a rebalanced review system and post-release reports/expertise intended to improve feedback; using that as a before/after learning split is a Project: Studio inference | **ADAPT:** Package 06 review is decision evidence; Package 07 owns result learning |
| Operational department state | *Planet Zoo* / *Two Point* family | Local place shows work, capacity and narrow remedy; routine staff act autonomously | **ADAPT to Post inspector; no fake edit tasks** |

## 4.1 What modern expectations change

- Selection must be safe; opening Release Review cannot itself release.
- Readiness, commitment and result are distinct states with explicit language.
- A forecast must state when it was formed and what remains uncertain.
- Holding must explain actual opportunity cost rather than imply an unsupported optimal date.
- Long-running departments need local state and portfolio scaling, not one tiny memo.
- Back, Locate, accessibility and stale-state behavior are part of the implementation contract.
- Autonomous work should be visually acknowledged, while intervention is reserved for real
  exceptions and strategy.

---

# 5. Adopt / Adapt / Reject matrix

| Pattern | Ruling | Contract |
| --- | --- | --- |
| Automatic wrap handoff | **ADOPT** | Preserve picture ID; release Stage/Set/scenery; Post gains attention; camera stays put. |
| Production Office as physical terminal owner | **ADAPT** | Use existing `Production / Post`; no duplicate historical building. |
| Dragging film cans into rooms | **REJECT** | Select/inspect safely; actions are named and current-state-bound. |
| Mandatory autonomous Post phase | **ADOPT Project: Studio authority** | Two honest Post weeks and capacity; no invented subphases. |
| Original optional unscored manual Post | **LATER creator mode** | Never required for ordinary play; no hidden quality buff. |
| Local Post inspector | **ADOPT** | Picture, state, activity, people/capacity, ETA, blocker, next route. |
| Persistent production/movie card | **ADAPT** | Scalable portfolio rail with exact IDs and Locate, not permanent HUD clutter. |
| Generic Release button in memo | **REJECT** | `Commit <title> to Release` lives in retained review after consequence summary. |
| Unconditional auto-release on next tick | **REPLACE** | Uncommitted ready pictures hold; committed ready pictures use the existing next-week release batch. |
| Final numeric quality reveal | **REJECT now** | Show locked Greenlight outlook and known conditions; hidden result remains hidden. |
| Post-specific quality improvement buttons | **REJECT now** | No authority supports them. |
| Marketing slider at Release | **REJECT now** | Current marketing was selected/debited at Greenlight. |
| Publicity inside Post | **REJECT** | Keep studio-wide Administration truth and optional reversible route. |
| Hold for a better date | **ADAPT narrowly** | Explain payroll/overhead, talent opportunity and publicity/cash options; no fake calendar advantage. |
| Release confirmation | **ADOPT** | Title, irreversible boundary, current-state token, exact receipt. |
| Manual Archive | **REJECT** | `FilmResult` history is automatic; Film Chronicle uses the frozen subset when available. |
| Movie Player/preview | **LATER** | Useful spectacle, not required for operational V1. |
| World acknowledgment on active/ready/released | **ADOPT** | Authority-derived, era-profiled and event-deduplicated. |
| Full result reveal in Package 06 | **REJECT** | Package 07 owns reception and commercial interpretation. |

---

# 6. Project: Studio Post doctrine

## 6.1 The lot is the pipeline map

The same title must remain traceable across Development, Casting, Production, Post, Release and
history. Department attention names the title; the picture workspace names the department. Neither
side resolves identity by title text or “first active project.”

## 6.2 Routine work is autonomous

Post does not ask for weekly approval. The player may inspect it, plan around capacity, advance the
one clock, or work elsewhere. A legal decision appears only at Release Ready or if a future
authoritative blocker is introduced.

## 6.3 A department state is not a quality judgment

“Finishing” means the picture occupies Post for an authoritative interval. It does not mean quality
is increasing per UI animation. “Release Ready” means the workflow is legally at its commitment
boundary. It does not reveal the critic score.

## 6.4 Important evidence names its provenance

The stored `forecastSnapshot` was formed at Greenlight. It remains useful as the studio's committed
outlook, but it is not an updated final-cut appraisal. Known production facts—participants, set,
budget, schedule/holds and current awareness—remain separate from forecasts and hidden outcomes.

## 6.5 Release is an explicit irreversible boundary

The player can inspect, cancel review and navigate without mutation. Only the title-bearing Release
intent commits. TypeScript revalidates exact current state, persists that authorization, and does
not advance time. On the next authoritative week, committed ready pictures alone enter the existing
ID-sorted release batch; uncommitted pictures hold. A stale or duplicate command fails closed and
never creates a second commitment, film result, RNG draw, ledger entry or theatrical run.

---

# 7. Wrap → Post handoff

## 7.1 Authoritative current behavior

`src/core/operations.ts` releases the completed Shooting phase's Stage, Set/scenery reservations
and shooting task before attempting to allocate Post. It emits a permanent `wrapped` event and
applies set wear. If no Post slot is available, the workflow remains technically on its prior phase
with a `facility-capacity(post)` blocker while holding no Stage. On success it enters
`postProduction`; `src/core/productionPhases.ts` requires exactly one `post` capability.

This produces a subtle but binding truth:

> A picture waiting for Post has wrapped. It is not still shooting merely because its workflow's
> persisted phase has not advanced.

## 7.2 Player experience contract

1. Wrap completes automatically on the authoritative week.
2. The exact Stage visibly winds down; its reservation/production treatment clears.
3. A concise wrap receipt names picture, Stage and week. No camera movement occurs.
4. Production / Post gains title-bearing attention.
5. If capacity is free, the picture enters Post and the department becomes active.
6. If full, the picture appears in a `Waiting for Post` queue. Copy states that the Stage is free,
   names the required Post capability, identifies the occupying picture/facility when projected,
   and gives the narrowest current remedy: wait, inspect holder, or build capacity if legal.
7. `Locate Post` is explicit. Back restores the exact Stage selection/camera/origin.

The player does **not** approve wrap, drag a film can, select a Post room, or reassign the company.

## 7.3 Company handoff

Current `src/core/presence.ts` sends the Director and craft lead to Post; cast are no longer required
there. The inspector may therefore say `Director + craft finishing` using exact identities. It must
not display the entire cast as physically editing, and Unity must not infer Post assignment from
nearby bodies.

## 7.4 Facility versus world-body trap

Core Post facilities are capacity instances and can scale; the browser currently maps every
`postProduction` workflow to the one fixed world body `post`. P06A must either project an exact
facility → placed-building mapping or formally scope its visual proof to the founding Production /
Post body while labeling the exact facility separately. It may never locate by first Post facility,
first production, title match or nearest geometry. This is presentation identity law, not a reason
to collapse facility IDs into the world building ID.

---

# 8. Ordinary Post versus creator mode

| Candidate activity | Classification | Package 06 law |
| --- | --- | --- |
| Allocate exact Post capacity | **ROUTINE AUTONOMOUS** | Current operations authority; queue only when full. |
| Director/craft attend finishing | **ROUTINE AUTONOMOUS / WORLD-VISIBLE** | Use exact presence; decorative specialists may imply ambience but never headcount. |
| Time advances through two Post ticks | **ROUTINE AUTONOMOUS** | One TypeScript clock; no weekly Continue Editing. |
| Inspect picture/state/ETA | **WORLD-NATIVE** | Local Post inspector. |
| Inspect full picture/company/forecast/commitment | **RETAINED WORKSPACE** | Release Readiness Review. |
| Hold or Release | **RETAINED WORKSPACE DECISION** | Explicit release gate; hold closes review without mutation. |
| Run studio publicity | **SEPARATE MANAGEMENT ROUTE** | Administration owns current studio-wide action. |
| Choose edit, score, sound, VFX or cut | **REJECT now** | No authoritative choices or outcomes. |
| Repair a diagnosed final-cut concern | **FUTURE DESIGN** | Requires perceived assessment, cost/time/change law. |
| Reorder scenes/add audio/subtitles/free camera | **OPTIONAL CREATOR MODE** | Separate future mode; never required to release a normal picture. |

Creator mode must have an explicit entry and exit, separate save/authority decisions, and honest
rules for whether authored output affects campaign simulation. Package 06 authorizes none of it.

---

# 9. Post states/phases

Current authority has one real Post phase, not editorial/sound/VFX subphases.

| Player-facing state | Authoritative basis | World presentation | Selected inspector | Attention/action |
| --- | --- | --- | --- | --- |
| Idle | No exact `post` reservation or waiting owner | Baseline era-neutral department activity | `Production / Post`; capacity free; no active picture | No alert; portfolio/history route only |
| Wrapped / waiting for Post | Wrapped workflow, no Stage reservation, `facility-capacity(post)` blocker | Department queue marker; no false finishing activity for waiter | Title; `Waiting for Post`; cause, holder/capacity, Stage released, automatic retry | Attention; `Inspect holder`, `Open capacity`, `Locate Post` as legal |
| Active finishing | `postProduction`, exact Post reservation, remainingTicks 3 or 2 | Era-profiled interior light/activity; exact Director/craft presence | Title; `Post-production`; current activity `Finishing`; exact Post; honest weeks; next `Release Ready` | Informational; `Open picture`, Focus/Locate |
| Release Ready | `releaseReady`, no facility reservation, remainingTicks 1, no Release commitment | Positive ready cue at Production / Post; Post slot shown free; no one presented at Post | Title; `Release Ready`; no work-in-progress claim; locked outlook label | Decision attention; `Review release` |
| Release committed | Proposed persisted commitment on the same ready picture; remainingTicks 1; no reservation/presence | One dispatch acknowledgment, then settled `COMMITTED TO RELEASE` state at Production / Post | Exact title; `Releases on the next studio week`; participant availability consequence; no result | Irreversible informational state; Advance Week uses existing release batch |
| Released / history | Next authoritative week appends `FilmResult`, removes production, may open theatrical run | Theater may show released/now showing; downstream release cue owns result | Not an active Post item; history link when supported | Package 07/result route; Film Chronicle only when frozen record exists |

### Prohibited state labels

- `Editing`, `Sound mix`, `VFX`, `Final cut 73%`, `Scene 14/23` without TypeScript fields.
- `Still shooting` for a wrapped picture waiting on Post.
- `Cast in Post` when only Director/craft presence is authoritative.
- `Quality improved` because a Post tick elapsed.
- `Release cost` when the current action has no release-time debit.
- `Now showing` or a critic/audience result at Release commitment time.

---

# 10. What the player does during Post

## 10.1 Always available

- select Production / Post safely;
- read active/waiting/release-ready pictures;
- Focus the building explicitly;
- open the exact picture workspace;
- Locate an exact present Director/craft lead;
- inspect current Post capacity/queue;
- leave and manage another department while time runs.

## 10.2 Attention-worthy, not a decision

- wrap completed;
- picture entered Post;
- one Post week remains;
- another picture is waiting;
- Release Ready.

Only uncommitted Release Ready is a decision stop in P06A. Capacity waiting is a hard operational
hold but may resolve automatically; it offers management routes, not a ceremonial acknowledgment
button. A committed picture is no longer a decision and resolves on the next authoritative week.

## 10.3 Genuine player decision

- `Commit <title> to Release` for the next authoritative studio week; or
- close/hold, accepting the current costs/opportunity and returning later.

If a legal Administration publicity action exists, the player may leave the review, take that
separate action, and return. This is not a film-specific Post command.

## 10.4 Rejected busywork

- weekly edit approvals;
- assigning each editor/sound worker;
- clicking progress beats;
- choosing arbitrary quality boosts;
- manually moving the picture between internal Post rooms;
- manually archiving after release.

---

# 11. Final-cut / quality presentation

## 11.1 What exists now

### Player-safe and already modeled

- title, genre/concept and stable production identity;
- frozen writer/director/cast/craft participant record;
- committed production and marketing budget;
- exact Post state/facility/remaining time;
- stored `forecastSnapshot` created at Greenlight, including expected critic/opening/total,
  segment estimates/ranges, per-segment confidence and causal/uncertainty factors;
- known production path and locked Set contribution retained on workflow bindings;
- current studio cash/standing/awareness and release legality where projected.

### Hidden or not yet modeled

- final critic/audience/commercial result before Release;
- a Post-updated perceived quality score;
- editorial, sound, VFX or final-cut attributes;
- a test-screening result;
- a player-addressable final-cut defect;
- a reliable release-calendar advantage.

## 11.2 Information hierarchy

The retained review must not call itself a factual “Final Cut Score.” Its top assessment block is:

1. **RELEASE READY** — authoritative state.
2. **`<Title>` + genre + picture identity.**
3. **Studio outlook — locked at Greenlight** — expected critic/opening/total estimates plus stored
   segment ranges, per-segment confidence and provenance.
4. **Known strengths** — at most three safe causal factors from the stored forecast/package.
5. **Known concerns / uncertainty** — at most three safe factors; never hidden actual result.
6. **What changed operationally** — Post complete, facility released, relevant holds/conditions.
7. **What remains unknown** — audience, critics and theatrical performance resolve after Release.

The standing law—important scores expose drivers and one actionable response—applies without
manufacturing a response. Here the actionable response is `Release` or `Hold`; there is no supported
creative fix. If the locked outlook is weak, the UI says the current simulation has no further
creative intervention at this stage rather than inventing `Polish`.

## 11.3 Future assessment ruling

A true perceived final-cut assessment is **FUTURE HIGH VALUE**, not a Unity presentation trick. It
would require TypeScript to define:

- which truth is perceived versus hidden;
- when assessment is sampled;
- confidence and evaluator skill if any;
- driver provenance;
- whether a concern has a legal time/cost remedy; and
- save/RNG/stale-action behavior.

Do not block P06A on that campaign. The honest Greenlight outlook is sufficient for V1 if labeled.

---

# 12. Marketing / Publicity ruling

## 12.1 Current authority

- Film marketing is chosen in the package/Greenlight flow (`src/core/marketingMenu.ts`,
  `src/core/actions.ts`) and is debited with production commitment. It is frozen in
  `Production.budget.marketing`.
- Publicity (`src/core/publicity.ts`, `applyPublicity` in `src/core/actions.ts`) is an immediate,
  paid, cooldown-bound **studio audience-awareness** action. It is not bound to one picture.
- Release uses current authoritative reception/economy law. Unity owns no spend, reach or forecast
  math.

## 12.2 Surface allocation

| Information/action | Owner |
| --- | --- |
| `Marketing committed at Greenlight` amount and existing effect explanation | Read-only Release Review row |
| Current studio awareness and publicity availability | Optional read-only Release Review context, only from exact projection |
| `Open Administration / Publicity` | Reversible management route; not primary release action |
| Choose/alter film marketing | Greenlight/package only |
| Execute publicity | Administration/Publicity only |
| Audience response to promotion | Package 07/result systems |

**DO NOT** add a Post marketing slider, silently transfer studio publicity to the movie, imply that
publicity repairs quality, or recompute a “live” forecast in Unity.

---

# 13. Release decision

## 13.1 What the player must understand

Before committing, the Release Review answers:

1. **What:** exact title/genre/production identity.
2. **State:** Post complete; Release Ready; Post capacity already free.
3. **Known package:** named participants, production commitment and marketing already paid.
4. **Outlook:** frozen Greenlight estimates, segment confidence, strengths and uncertainty.
5. **Current context:** cash, studio awareness and any legal publicity route, if projected.
6. **Hold consequences:** if time advances under the proposed hold law, exact projected/economy-
   gated studio exposure continues; active-production participants remain busy for assignment/
   availability, but `releaseReady` projects no one at Post and holds no Post reservation. There is
   no guaranteed quality increase or calendar advantage.
7. **Commitment timing:** acceptance authorizes Release without advancing time. The picture remains
   ready, shows `Committed to Release`, and enters the existing ordered release batch on the next
   authoritative studio week.
8. **Irreversibility:** after commitment, casting, budget and package cannot be edited and the
   commitment cannot be withdrawn in P06A.
9. **Unknowns:** critic, audience and commercial result are not revealed before commitment.

Current release has no new release-time spend. Therefore P06A has no insufficient-funds Release
gate. If later authority adds distribution or release spend, it must publish the exact debit,
post-action cash and refusal before the button enables.

## 13.2 Exact command law

- Primary button: **`Commit <title> to Release`**.
- Secondary: **`Hold for now`** or Back; it mutates nothing.
- Selecting/opening/closing never commits.
- Confirmation repeats title, `releases on the next studio week`, irreversible boundary and any
  immediate authoritative debit (none in current V1).
- The submitted intent binds exact production ID plus current-state/version evidence. TypeScript
  revalidates `releaseReady`.
- Accepted commitment persists a current authoritative authorization and advances no time. The
  workflow remains at remaining tick 1 with no Post reservation; generic weekly advancement must
  hold an uncommitted ready picture and admit only committed ready pictures to release.
- On the next authoritative week, every committed ready picture enters the existing ID-ascending
  release batch. The batch retains its current shared start-of-tick market/standing basis, critic
  RNG order, standing/broadcast/development order, theatrical-run/payment order, payroll/overhead,
  event and serialization semantics. Click order never changes release math.
- The accepted commitment receipt identifies the exact picture and `Committed to Release` state.
  P06A shows one restrained dispatch acknowledgment and stops; the next-week release/result remains
  the Package 07 boundary. Current downstream/browser surfaces may receive outcome data after that
  week, but P06 Unity does not interpret it.
- Duplicate/stale submission returns one concise refusal and fresh state. No automatic retry.

The exact storage leaf is a TypeScript implementation decision, but it is a real state-machine and
save migration: release commitment must round-trip; old/current `releaseReady` saves migrate to
**uncommitted**; and the operations sweep must produce remaining tick zero only from a committed
ready picture. `src/core/tick.ts` can then retain its existing zero-tick collector unchanged. This
deliberately preserves the current weekly release resolver instead of extracting a second release
transaction.

## 13.3 Why release now versus hold?

### Already modeled inputs

- economy-gated weekly payroll/overhead and placed-facility exposure when the clock advances;
- talent opportunity cost because current active-production participants remain busy for
  assignment/availability until release; ready state has no Post presence;
- Post capacity is already free at Release Ready, so holding does **not** block Post;
- the possibility of taking a separate legal publicity action before release;
- current cash/standing context.

### Small authoritative extension

- persisted uncommitted/committed Release Ready state, strict commit intent and save migration;
- phase/operation sweep and tick collection gates that preserve the existing ordered next-week
  batch;
- exact hold-consequence read model (busy-for-availability identities and economy-gated exposure),
  derived by TypeScript rather than prose inference.

### Future design

- evolving release calendar/genre demand;
- distribution offers, screen counts, revenue splits;
- film-bound campaign timing;
- test screenings and fixes;
- release windows and awards strategy.

### Reject

- arbitrary freshness decay while waiting;
- automatic quality gain from holding;
- a fake “best week” indicator over a static market;
- a release fee added only to make the button feel weighty.

---

# 14. Release timing ruling

*The Movies* offered timing considerations through genre demand/awards. Current Project: Studio's
market does not evolve into a meaningful release calendar during the ordinary tick path. Under the
proposed P06 hold law, advancing time can still incur exact economy-gated operating exposure, keep
talent unavailable, permit cash to change and allow studio publicity, but it cannot honestly
promise a better date.

| Timing concept | Ruling |
| --- | --- |
| Hold a ready picture | **SMALL AUTHORITATIVE EXTENSION:** gate current ready state; reuse existing cost/availability inputs |
| Show payroll/overhead/talent opportunity | **REQUIRED NEXT**, TypeScript-derived |
| Wait for separate publicity availability/cash | **ALREADY MODELED context**, not film-specific |
| Genre-season/competition calendar | **FUTURE HIGH VALUE** |
| Predicted optimal release week | **REJECT until authority exists** |
| Real-time/date picker in P06A | **REJECT** |

The button is `Hold for now`, not `Choose release date`.

---

# 15. Archive / library ruling

The current engine automatically appends a durable `FilmResult`. The browser can render a Film
Chronicle when the required frozen participant/newspaper record exists and otherwise exposes a safe
unavailable/legacy subset. This automatic history is the correct successor to manual Archive.

1. Release automatically appends `FilmResult` history.
2. The picture leaves the active Post/production list.
3. A theatrical run and recent-release presentation are separate from permanent history.
4. Film Chronicle remains accessible after active earning ends when its frozen record is available;
   legacy records fail safely rather than being reconstructed.
5. No “Archive this film” action is required.
6. No back-catalogue royalties, remaster, remake, sequel/IP or library valuation are implied.

The label **Archive** may appear as presentation/history language, but it is not a current core
phase and must not be written into workflow law.

---

# 16. Multiple-film scaling

The local building and retained workspace solve different scales.

## 16.1 Production / Post inspector

- capacity summary: occupied / total exact slots;
- attention-first but stable ordered rows for waiting, active and release-ready pictures;
- each row: title, state, facility/ETA or blocker, and one route;
- a selected picture remains pinned when fresh state arrives; attention does not reshuffle under the
  pointer.

## 16.2 Retained Post workspace

- left rail lists exact waiting/active/release-ready pictures;
- center shows selected picture/state/people/progress;
- right/action region becomes Release Review only for uncommitted Release Ready;
- filters, scroll, selection and origin survive Locate/Profile round trips;
- committed pictures remain pinned as `Committed to Release` until the next studio week; released
  pictures then disappear from the active rail by exact ID and become history, never “next row.”

## 16.3 Future studio portfolio

A later portfolio may unify Development, Casting, Production, Post and theatrical runs. P06A should
project list-capable records and exact IDs but must not build the whole portfolio. It must prove at
least two pictures contending for one Post slot and two same-week ready pictures committed in either
click order. The next weekly batch releases the committed set in existing ID order from one shared
start-of-tick basis; uncommitted ready pictures remain active.

---

# 17. World versus workspace allocation

Package 02 remains binding:

> **Notice → Hover → Select → Understand locally → open deeper work if needed → commit → see
> consequence → return exactly.**

| Surface | Owns | Must not own |
| --- | --- | --- |
| Management-scale label | `POST: 1 active`, waiting/ready attention, major blocker | Detailed forecast, participant list, actions |
| Medium/close hover | `Production / Post` + top state/title, max two lines after standard delay | Buttons, paragraphs, quality score |
| Selected local inspector | department state, exact pictures, capacity, ETA/blocker, `Open picture`, Focus | Release commitment compressed into memo; invented Post tasks |
| Retained Post workspace | multi-picture rail, exact picture details, company, progress, capacity/history routes | Creator timeline, reception result interpretation |
| Release Review layer | evidence/provenance, commitments, hold consequences, explicit Release commitment | Box-office/review reveal, marketing slider |
| Future creator mode | authored scenes/audio/edit/export | Mandatory ordinary campaign progression |

### Navigation law

- Opening Post workspace retains building selection and camera.
- Opening Release Review pushes one layer; Back returns to the same picture/rail/scroll.
- `Locate Production / Post` explicitly selects/focuses the exact facility and opens its inspector.
- `Locate Director/Craft` works only with a current exact world anchor; failure stays in workspace and
  explains why.
- Back from Locate restores exact workspace tab/picture/scroll/focus.
- Wrap, Post entry, Post completion, Release Ready, commitment and next-week release never move the
  camera.
- Release removes a now-invalid active picture selection gracefully but preserves the building and
  route origin; it never substitutes another picture.

---

# 18. Post spectacle

Post is visually quieter than shooting, but it cannot be a dark box plus a timer.

## 18.1 Minimum world acknowledgment contract

| State | Diegetic cue | UI cue | Forbidden implication |
| --- | --- | --- | --- |
| Idle | Baseline exterior/interior; no hero activity | `Available` only when selected/locally relevant | Empty building is “broken” |
| Waiting/capacity block | Queue/arrival marker at service edge; no fake work for waiting picture | Shaped attention marker; title + cause | Picture still occupies Stage or is being edited |
| Active finishing | Era-profiled occupied windows/interior light; exact Director/craft arrival/presence; one restrained finishing vignette | `POST — <title> · N weeks` | Reels/workstations as universal era; animation adds quality |
| Release Ready | Positive non-urgent ready lamp; Post activity for that picture stops | Color-independent `READY` shape/text | It has committed or released |
| Release committed | One short deduplicated dispatch cue, then a settled no-flash state | `COMMITTED · releases next studio week` | Theater/now-showing or outcome data |
| Released | Theater/recent-release state may update on the next authoritative week | Downstream receipt with exact title | Replay after load/reconnect; Package 06 audience interpretation |

V1 can deliver this with lights, doors, exact people and a bounded neutral activity loop. It does
not need a screening-room cinematic, rendered footage, a complete editor animation set or a huge
audio campaign.

## 18.2 Sound cues

- active: restrained department ambience appropriate to era profile;
- ready: one short completion punctuation, not a looping alarm;
- blocked: UI attention sound only on newly authoritative attention, deduplicated;
- release committed: one dispatch punctuation from the accepted commitment receipt;
- released next week: existing downstream punctuation; Package 06 does not reinterpret it.

Sound follows authoritative state/event sequence and never creates a phase.

---

# 19. Era safety — 1920 → 2040

The interaction law is stable; presentation can vary by era.

### Stable law

- named picture and department;
- capacity, current work, people, ETA, blocker, readiness;
- retained review and explicit release;
- exact IDs, Back, Locate and authority boundary.

### Era-profiled presentation

- room dressing and work surfaces;
- media movement (film cans, tape, digital storage, future forms);
- projection/screening/editing equipment;
- specialist silhouettes and ambience;
- copy nouns where governance supplies era language.

### Architectural prohibitions

- no `filmReel` requirement as the semantic anchor;
- no hard-coded 1948 “editing bay” copy in state logic;
- no assumption that Post always means physical cutting or one machine;
- no sepia/white-paper dependency for readability;
- no workflow state named after one era's technology.

P06A uses an era-neutral fallback until a governing era visual profile exists. It does not design
the era progression system.

---

# 20. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

## REQUIRED NEXT — P06A Post-from-the-Lot V1

Prove one end-to-end authoritative grammar:

> wrap → exact Post owner/attention → active autonomous finishing → capacity waiting where
> applicable → Release Ready → retained Release Review with honest provenance/consequences →
> explicit stale-safe `Commit <title> to Release` → accepted dispatch acknowledgment → stop before
> the next-week reception/result boundary.

P06A includes:

1. an exact bridge/read projection for Post waiting, occupancy, facility, people, remaining weeks,
   Release Ready and safe release-review facts;
2. Production / Post hover, selection and stateful inspector;
3. minimum idle/active/waiting/ready/committed world acknowledgment;
4. list-capable retained Post workspace and Release Review;
5. the bounded TypeScript Release Ready hold + persisted commitment + phase/tick gates preserving
   the existing ID-sorted next-week release batch;
6. exact Back/Locate/stale/save/reconnect behavior; and
7. exact facility→placed-body identity (or an explicit founding-body-only P06A scope) with no first-
   match lookup; and
8. two-picture Post-capacity, two-ready batch-order and identity-isolation proof.

## FOLLOW-UP

- richer Post-specific world vignettes and era profiles;
- TypeScript-owned perceived final-cut assessment with driver provenance, if separately approved;
- fuller cross-department production portfolio;
- current-awareness/publicity context link in Release Review after projection is proven;
- optional non-authoring movie preview / screening-room presentation;
- explicit talent-release timing review if holding at Release Ready makes staff retention undesirable.

## LATER

- strategic release calendar/distribution negotiation;
- test screenings and legitimate time/cost fixes;
- film-bound publicity campaigns;
- catalog/IP/library economics;
- creator mode / Advanced Movie Maker successor;
- historical Post technology progression;
- Package 07 reviews, audiences, box office, awards and franchise consequences.

## DO NOT DO

- move quality, forecast, Post progression, release legality, release outcome, RNG, costs or saves to
  Unity;
- release an **uncommitted** ready picture from `Advance Week` after the gate is introduced;
- invent editorial/sound/VFX subphases, scene counts, percentages or quality gains;
- duplicate marketing at Release or present studio publicity as film-bound;
- call the Greenlight forecast a final-cut score;
- force creator tools into ordinary play;
- manually archive films;
- place release-ready pictures at Theater before release;
- infer attendance from position or use first-match Post/production identity;
- move the camera on wrap, completion, workspace open, Release Ready, commitment or release.

## 20.1 Owner decisions required

**None before P06A.** The mission already requires deliberate Release; current authority establishes
the rest of the bounded slice. A future campaign for perceived final-cut assessment, release
calendar/distribution, film-bound publicity or creator mode requires separate Owner authorization.

---

# Source register

## Primary historical sources

- `[TM-MAN]` [*The Movies* official English manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf?t=1447351040), especially printed pp. 12, 16, 23–28 and 39; local research copy
  `/Users/bruce/Desktop/big swing art/movies manual_english.pdf`.
- `[TM-PRIMA]` *The Movies: Prima Official eGuide*, especially printed pp. 17–18, 43–45,
  98–99 and 116–117; [Internet Archive record](https://archive.org/details/The_Movies_Prima_Official_eGuide);
  local research copy `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf`.
- `[TM-SE]` [official *Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), PDF pp. 3–6 / printed pp. 4–11; printed p. 2 for base-game continuity.

## Required secondary source

- `[SUPERSTAR]` [Macinplay, *The Movies: Superstar Edition* review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), sections **Alles dreht sich um den Film**, **Mikromanagement, das auch mal nervt**, **Steuerung und Handling**, **Fazit**.

## Targeted comparator / adjacent references

- `[SI]` [Software Inc., “Thirteenth update – Demo update”](https://softwareinc.coredumping.com/thirteenth-update-demo-update/), paragraph beginning “One of the abilities is for leaders…”. Historical first-party post; direct automated retrieval may be restricted; no current-UI claim is made.
- `[GDT]` [Greenheart Games, “Game Dev Tycoon is coming to Steam…”](https://www.greenheartgames.com/2013/08/22/game-dev-tycoon-is-coming-to-steam-on-august-29th/), feature bullets on review changes, post-release reports and renaming before release.
- `[STEAM]` [Steamworks, Release Options](https://partner.steamgames.com/doc/store/types), sections **Review**, **Coming Soon**, **Full Release**, **Pre-Purchase**. Adjacent release-governance reference.
- `[APPLE]` [App Store Connect, Select an app version release option](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/), **Manually release a version**. Adjacent release-governance reference.
- `[GOOGLE]` [Google Play Console, Control when app changes are published](https://support.google.com/googleplay/android-developer/answer/9859654?hl=en), sections **See an overview of your changes**, **Send changes for review**, **Use managed publishing**, **Publish your app update**. Adjacent release-governance reference.
- `[GOOGLE-HISTORY]` [Google Play Console, About your submission activity](https://support.google.com/googleplay/android-developer/answer/17118609?hl=en), sections **Track your submission status** and **Review submission details**. Adjacent history reference.

## Project: Studio authority inspected

- Core: `src/core/productionPhases.ts`, `src/core/operations.ts`, `src/core/tick.ts`,
  `src/core/types.ts`, `src/core/presence.ts`, `src/core/reception.ts`,
  `src/core/marketingMenu.ts`, `src/core/publicity.ts`, `src/core/employment.ts`,
  `src/core/firstFilmJourney.ts`, `src/core/productionIdentity.ts`, `src/core/save.ts`.
- Browser/read models: `ui/src/engine/adapter.ts`, `ui/src/components/ProductionBoard.tsx`,
  `ui/src/lot/buildingInspector.ts`, `ui/src/lot/navigation.ts`,
  `ui/src/lot/snapshot/StudioLotSnapshot.ts`, `ui/src/screens/ReleaseResult.tsx`,
  `ui/src/screens/FilmRecord.tsx`, `ui/src/screens/NewspaperReveal.tsx`.
- Bridge: `bridge/session.ts`, `bridge/runtime-checkpoint.ts`,
  `bridge/schema/bridge-schema.ts`, `bridge/schema/project-studio-bridge.schema.json`,
  `generated/unity/StudioBridgeDtos.Generated.cs`.
- Sealed Unity `911e87e`: `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`,
  `Assets/Studio/Runtime/Presentation/StudioLotLifePresentation.cs`,
  `StudioBridgePresentation.cs`, `SelectableEntity.cs`, `StudioSelectionManager.cs`,
  `StudioCameraDirector.cs`, `StudioHud.cs`, and generated bridge DTOs.
