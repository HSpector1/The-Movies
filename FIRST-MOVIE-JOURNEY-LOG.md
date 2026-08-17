# First Movie Journey — Shift Log

Fable-led autonomous shift, opened 2026-08-17. Successor to the tycoon world conversion
(`tycoon-world-conversion-12h` @ `b58e6f8`, sealed, all gates green).

## Authority

- Branch: `first-movie-journey-v1` (remote `hspector-github`), cut from the accepted
  Tycoon World V1 candidate `b58e6f8a92c0022c613b5c1591f734ae6db3453f`.
- Two-key rule intact: this branch never self-merges to `main`. Never force-push.
- Prior-shift law remains binding: engine owns all truth; renderer never completes work;
  no unrestricted Sims autonomy; no financing/loans/bailouts/arbitrary cash sinks;
  seeded RNG only; `docs/SHIFT-OPERATIONAL-LAWS.md` (28 laws) applies to every writer.

## Owner ruling that opened this shift

Tycoon World architecture — **PASS** ("This is much better. The lot now allows me to
start driving the game, and being able to build out the lot is a great win. This feels
like a solid V1.")

First-movie discoverability — **FAIL** ("But I am still confused about how to get a
script made, how to make a movie, and what I am supposed to do next. It is not a
finished project.")

## Mission

Make the first movie impossible to get lost making — from the Lot, using real systems,
without a tutorial modal or a second workflow state machine. Then, once the journey is
proven intuitive, begin visible filmmaking theater ("I can watch my movie being made").

Controlling acceptance: a brand-new player reaches FIRST FILM GREENLIT without asking
"where do I go / which menu / what am I waiting for / what happens next / why can't I."
If Fable needs repository knowledge to progress, the UX is wrong.

Owner directive for this shift's opening move: research how The Movies (special
emphasis — we are building a better, modern version of it), Zoo Tycoon, and
RollerCoaster Tycoon made the Lot/Park drive the game, then match those dynamics.

## Milestones (from the shift order; frozen targets below as each is chartered)

- **A — First Film Guidance**: persistent, collapsible, state-derived "next production
  step" layer. Clicking guidance pans/selects in-world; never teleports to a screen.
- **B — Buildings tell the player what to do**: inspector hierarchy = what is this →
  what is happening → what can I do now → deep details last.
- **C — The film is a persistent world object**: one followable identity that moves
  through the studio (Development → Casting → Stage → Post).
- **D — World attention language**: tasteful tycoon affordances (signs, badges,
  building state, subtle HUD) so the player glances and knows where they're needed.
- **E — First film golden path**: the real systems, sequenced into one excellent
  first-film experience; then visible-filmmaking theater on top of presence.

## Research verdict (Phase 0, complete)

Five researchers (The Movies ×2, Zoo Tycoon, RCT, modern successors) + synthesis; full
reports in `docs/research/donor-game-research.json`, design map in
`docs/research/tycoon-lot-dynamics-synthesis.json`. The load-bearing conclusions:

1. **The Movies' core teaching device was ONE physical film token** (script page →
   camera → film can) carried through buildings-in-order, its HUD card and physical
   location always matching. Our exact missing piece pre-greenlight.
2. **Buildings were verb menus** (walls drop → named drop-rooms: Begin Casting, Shoot
   It, Release); the Casting Office floorplan doubled as the production checklist —
   every unfilled role a visibly empty room.
3. **Guiding Streams**: pick anything up and a sparkling, explicitly ignorable trail
   points to the most sensible target; Tab jumps to highest-priority pending action.
   Lionhead already answered Milestone A — suggestion, not automation.
4. **Imperative stage-completion copy** named building + verb ("Your script is complete
   and ready for casting in the Casting Office"), never a stat readout.
5. What The Movies got WRONG (we must beat): star-nannying micromanagement with no
   delegation ramp; bubble flooding at scale; an opaque nine-factor quality formula;
   no interesting failure; the machinima toolset taped on outside the economy.
6. Donor-wide anti-patterns adopted as law for this shift: no panel-completable action
   the lot can't show; every blocked state names its blocking dependency and is
   clickable; no unexplainable derived number; no auto-popping overlays; no scripted
   tutorial state divorced from engine state; pans, never teleports.

## Frozen milestone targets

### Wave 1 — M-A/C: the picture as guided world object (TWO writers, disjoint surfaces)

**Engine writer (src/core only).** New pure, save-neutral projection
`firstFilmJourney(state)` (presence.ts pattern) deriving the journey from existing read
models (`scriptProjectsReadModel`, `castingSessionsReadModel`, `nextStudioDecision`,
`state.studio.activeProductions`): stages no-picture → drafting → script-review →
ready-to-package → auditioning → audition-review → in-production → released, each with
pictureTitle, headline, detail, imperative next (label + targetBuildingId + kind),
waiting, blocker. Copy is engine-owned, plain Hollywood language. Plus two read-model
fixes: commission writer list sorted by writing estimate desc (scriptReadModel.ts:490,
kills the actor-default trap) and lotAttention "Writers Room idle" suppressed while a
picture occupies the facility. Unit tests for every stage + determinism.

**UI writer (ui/ only).** The idle "No active production" branch of the top-left card
becomes the persistent picture/guidance card driven by the projection (via adapter):
eyebrow YOUR FIRST PICTURE (later YOUR NEXT PICTURE), title, stage headline, detail,
one imperative next-step button. Clicking it PANS and selects the target building
(never a screen teleport; `panCentreIntoView` grammar). Collapsible (UI pref, not
save). Post-greenlight the existing production card continues to own the slot (it
already implements C for production). DOM-only — structural tuples must not move.

### Wave 2 — M-B: buildings answer "what can I do here right now" (ONE writer)

Extend `LotBuildingInspectorContext` with engine-derived `primaryActions`; render
between status and deep-details: Development → "Commission a screenplay" (opens the
existing retained commission workspace via the assembly interception) / Casting →
"Plan auditions for <title>" (calls the existing `openCurrentAuditionPlanning` retained
path — the full-screen Casting Room becomes deep-details only, fixing the eject/strand
seam). Inspector reorder to: what is this → what is happening → actions → capacity →
deep details. Copy wave rides along: deep labels to plain language ("Open Development
details"), "auditions optional" reframed to lead with the action, person-panel "Lot
snapshot" copy, internal IDs out of review headers, toast repositioned off the roster
chips, a11y names on package candidate cards.

### Wave 3 — M-D: the world points at the next step (ONE writer, TycoonScene)

Subtle world marker on the guidance target building (one at a time, ignorable — the
restrained Guiding Stream), sign vocabulary aligned with guidance strings. Structural
tuples re-pinned per fixture with named reasons (law 25).

### Wave 4 — M-E: golden path proven

e2e golden-path spec (fresh fixture → guidance-driven chain to greenlight, asserting
each stage's guidance + world state); Fable fresh-studio playtest as a new player;
red-team; fix wave; docs + handoff. NOT in scope this shift (recorded for next hills):
pre-delivered first screenplay, physical audition queues, premiere events, floorplan
verb-rooms, trade-paper ticker, morphing token icon — the research file holds the
designs.

## Shift record

### Wave 1 — RULED KEEP (Fable playtest 2026-08-17)

Fresh-studio playtest of the integrated wave: the Week-0 dead end is gone — the desk
card reads "YOUR FIRST PICTURE / No picture yet / Every picture starts with a
screenplay / [Commission a screenplay at Development]"; the button pans+selects (zoom
unchanged, no route). The picture becomes a named identity at commission; card states
observed live: no-picture → script-review ("The first draft is in / Review the
screenplay at Development" — one click lands the review surface) → ready-to-package
("Auditions show you who can carry the picture, or go straight to the picture's
package / [Plan auditions at Casting]"). Collapse chevron works and persists. The
commission form now defaults to Lauren Ravel — Est. 71 (the trap default is dead). The
toast sits clear of the roster chips. Gates verified by my own runs: root+ui tsc
clean; full vitest 226 files / 3,068 tests green. Remaining seam confirmed as designed:
building inspectors still lack the primary verbs the guidance names — Wave 2's charter.

Wave-1 delivery detail (both writers):

Engine writer delivered `src/core/firstFilmJourney.ts` (pure/save-neutral, presence.ts
discipline, frozen interface verbatim) + writer sort by writing estimate + lotAttention
production-occupant copy. Root tsc + ui tsc clean; core suite 95 files / 1,343 tests
green. Notable engineering: release-week off-by-one pinned by test (M1 skip-first
rule); read-model rejections degrade gracefully instead of killing the card (law 21);
blocker copy uses headline+remedy only because `detail` legitimately carries internal
ids. Two handoffs routed to the UI writer mid-flight (scriptCommission ordering guard
must assert the NEW canonical order; adapter 'writers' cue precedence for the empty
case). Narrow exceptions used and reported: two test files re-pinned (strengthened),
`src/core/index.ts` export block.

**Owner-facing design finding (recorded, not resolved):** with writers published
best-estimate-first, a thin roster whose best writing estimate belongs to the craft
lead can default the commission to the craft lead and strand `package-staffing`. On
the shipped founding pool the default is correct (the actual writer has the top
estimate). Wave 2 will make the form's default prefer primary-role writers; the deeper
"warn when commissioning strips a needed role" is an Owner design call, logged here.

Also recorded as pre-existing polish: `FilmResult.releaseTick` reads one week behind
in-hand week ("released 1 week ago" on release week, adapter.ts:6153).

### Phase 0 — Research + cold playtest (complete)

- Research workflow dispatched: The Movies (pipeline + lot/UI, two agents), Zoo Tycoon,
  RollerCoaster Tycoon, modern successors (Two Point Hospital / Planet Coaster /
  Parkitect), then a synthesis stage mapping donor dynamics onto milestones A–E.
- Fable cold playtest: fresh studio (seed `studio-001`, cleared localStorage), no
  developer knowledge, driven to FIRST FILM GREENLIT. Verdict and findings below.

#### Cold playtest verdict

A determined cold player CAN reach FIRST FILM GREENLIT (I did: found Week 0 →
commission W0 → script review W1 → auditions W1→2 → audition review W2 → package →
greenlight W2 → watched Dev→Pre-production W3–4). The chain physically exists, review
gates block "Sim to next event" with instructions, and the greenlit film gets a real
world card. **But at three seams the world goes silent and the player must gamble on
the only unexplained button.** The Owner's confusion is fully reproduced at those seams.

#### The three dead-end seams (P1s)

1. **Week 0 has no first verb.** Operations card reads "No active production. The
   studio lot is idle. Assemble a film to begin production." — "assemble" is the wrong
   verb (nothing can be assembled without a script), the card is not clickable, and
   nothing points at Development. This is the exact frame the Owner got lost in.
2. **Development inspector has no Commission verb.** It says "No screenplay is in
   development" but the only button is "Open Assembly details" — which actually opens
   the (good, world-mounted) Commission workspace. One mislabeled button hides the
   entire first step of the game.
3. **Casting has no Plan-auditions verb, and its deep screen strands you.** Inspector
   offers only "Open Casting Room details", which EJECTS to a full-screen legacy
   management screen (world gone — unlike Commission/Package which mount over the lot).
   Inside, the layout is inverted (capacity slots first, actions last) and the PRIMARY
   blue button on a ready screenplay is "Open package" — pushing a first-time player
   past auditions inside the casting building. After starting auditions the flow leaves
   you stranded on the screen; the advance-week control lives back on the lot HUD.

#### Systemic findings

- **No film identity before greenlight (Milestone C gap, structural).** Pre-greenlight
  progress lives in disconnected building signs; the operations card claims the studio
  is idle THROUGHOUT commissioning/auditions ("No active production" while a script
  drafts and auditions run). Post-greenlight a real film card appears (phase, status,
  weeks left, progress bar, director/lead) — but it is inert: not clickable, no verbs,
  no "where is my picture" pan.
- **Trap default:** Commission's "Contracted writer" dropdown lists the whole roster
  (actors, craft, director) and defaults to an ACTOR with writing Est. 15 while the
  roster's actual writer (Est. 71) sits last. A trusting player commissions a script
  from an actor.
- **"A Season of Archipelago — auditions optional"** — the sign invites skipping the
  system that teaches casting. (Auditions ARE engine-optional; the first-run framing
  should still lead with the action, not its skippability.)
- **Jargon leaks:** "Assembly", "package" unexplained at first contact; "No production
  assignment is represented for this person in the current Lot snapshot" (person
  panel); "Project script-0000 · Session casting-0000" internal IDs in the review
  header; identical boilerplate strengths/concerns on every audition candidate.
- **Sign contradiction:** Development reads "Writers Room idle" while the greenlit
  picture is in Development at that building.
- **Minor:** person-vs-building click ambiguity (clicking Casting hit an actor stood
  outside); package talent step has three stacked identical filter walls above the
  candidates; candidate select cards are unnamed buttons (a11y); toast covers roster
  chips; nested per-column scrolling is finicky.

#### Production-phase evidence (Weeks 6–8, shooting)

The shooting mini-loop is the strongest pattern in the game and the model for this whole
campaign: **world attention → click the flagged object → world verb → resolution →
watch the world change.** Week 6: "Director call required", Stage 7 sign "DECISION
REQUIRED", sim blocked with an explanation, and the verb ("Call Buster Underwood to
Soundstage 7") lives BOTH on the person panel and on the stage's Studio Desk panel —
verbs on the object the attention points at. Week 7: "Scenery load-in blocking camera",
Stage 7 "PRODUCTION HOLD", a scenery truck visibly drives a route across the lot,
"Clear scenery load-in". Week 8: "Take ready to schedule" → "Schedule the shooting
take" → sign "TAKE SCHEDULED". Each beat also updated the film card's status field.
The campaign's job is to make the PRE-greenlight chain feel exactly like this.
(Watch-item for later hills: three consecutive one-click interventions could read as
busywork once the player has learned them; variety belongs to the visible-filmmaking
hill, not this one.)

#### What already works (build on, don't rebuild)

Red badge + sign line + disabled "Sim to next event" with an instruction is a complete
attention grammar — every time it fired I moved without thinking. Script review and
audition review panels are excellent in-world decision surfaces with "what happens
next" explainers. "Take results to Package" chains the seam correctly. The package
stepper (Talent → Budget & Forecast → Review) mounts over the live lot and ends in a
real decision (readiness, team direction 41/100, improvement suggestion it does NOT
auto-apply). Post-greenlight, roster chips grow role captions and the film card ticks
phases while presence walks people across the lot.
