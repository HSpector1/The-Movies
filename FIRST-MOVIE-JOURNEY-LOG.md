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

### Wave 2 — RULED KEEP (after two bounces; root cause was a shift-old latent bug)

Final resolution of the plan-auditions defect: the strict retained-planner context
(`auditionPlanning.ts`) proved projected names with a GLOBAL-uniqueness helper —
any studio holding a duplicate talent name anywhere was rejected, and generated name
pools make duplicates ordinary (seed `studio-001` holds two actors named Rex Petrov).
So the retained audition planner had been unreachable in real sessions for the
feature's whole life; every e2e used author-chosen fixture rosters that never
collided. Fix `756b374`: `recordedName`/`recordedTitle` keep every faithfulness proof
and drop only the no-other-record-shares-this-string clause for people/concepts
(facilities keep uniqueness — the engine owns that name set); matches the house
pattern of every sibling strict selector. New e2e `lot-founded-audition-path-v1`
founds a studio through the real UI on the shipped grid origin and asserts the
name collision is present, so the spec cannot quietly stop covering the defect.
Falsification: restoring the old predicate fails both new tests (2/2).

Verified live by me after the fix: clicking the Casting building lands the retained
in-world planner directly (world visible behind); slate → "Start one-week auditions"
completes in-world with the six-reads receipt; the intermediate inspector-origin
commit (`8bef20a`) stands on its own merits (a verb must prove itself, not a control
the player never pressed). Gates verified by my runs: both tsc clean; full vitest 226
files / 3,091 green twice consecutively (one unreproduced single-test flake on the
first run, not seen again); writer's full Playwright at HEAD: 189 passed / 4 env
skips. Process lesson recorded: vitest-level falsification did not capture a
live-only condition — real-browser proof is now the bar for world-first seams.

Verified live by Fable (fresh studio, building-driven, guidance card ignored where
possible): Development inspector now answers in the Owner's exact order — what it is →
what's happening → **"Commission a screenplay"** (gold primary, opens the retained
workspace over the world) → capacity → "Open Development details" (renamed from
"Assembly"). Casting sign reads "ready for auditions" (was "auditions optional");
Casting inspector carries "Plan auditions for A Season of Archipelago"; the review
surface header reads "Adventure · Writer Lauren Ravel" (internal ids gone); starting
auditions from the legacy Casting Room now returns the player to the studio
(de-strand verified). Gates verified by my own runs: both tsc clean, 226 files /
3,088 tests green (writer's full Playwright run: 187 passed / 4 env skips).

**Defect bounced to the writer (live repro + root cause):** the Casting inspector's
plan-auditions verb ejects to the full-screen Casting Room when the companion rail is
closed — `currentAuditionPlanningOrigin` proves origin via the companion-rail DOM
button only, so the inspector entry falls back. Fix charter: accept the inspector
primary button as a first-class origin with the same closed-shape proofs (narrow App
remit extension granted for the origin validation), falsification-proven by a test
that clicks the verb with the rail closed and asserts the retained workspace opens.

**Second bounce (live-only failure).** The origin fix (`8bef20a`) passed its
falsification tests but STILL ejected live — verified by me on a hard-reloaded,
cache-busted page with every documented origin condition probed true in the DOM
immediately before the click (unique panel, matching attention, enabled contained
button, rail provable too). Conclusion: the App-side acceptance or the strict planner
context refuses REAL browser states in a way vitest states don't reproduce — and the
retained audition planner has not mounted in ANY live session this shift (the
activate-casting auto-open also always fell through), so the refusal predates Wave 2;
the new verb merely surfaced it. Writer re-dispatched with real-browser reproduction,
temporary instrumentation of the refusal chain, a root-cause fix at the honest layer,
and a Playwright (not vitest) falsification spec; also chartered to close the e2e
coverage gap if no spec drives the retained audition planner.

Wave-2 deviations accepted and recorded: TalentPicker a11y fix landed in
`ui/src/components/TalentPicker.tsx` (outside declared surface, aria-only, named in
commits); no world-mounted package re-entry exists (the retained Package workspace
opens only from the casting-review handoff — "Open the picture's package" uses the
deep path; recorded as a next-hills item); the greenlight-formation two-picture
structural tuple re-pinned 64/30 → 62/29 with byte-identical decoded bytes (delta =
one more employee claimed by a company under the writer-default fix); Casting Room
auto-return loses its live-region announcement (law-26 flag; the legacy path only).

### Wave 3 — RULED KEEP (Fable playtest 2026-08-17)

The world now points at the next step: a soft warm pool of light (marquee tones,
brass rim, ~2.6s alpha breath; static under reduced-motion) on the ONE building the
journey names. Verified live by me with the state-diff method: apron present around
Development at Week 0 (`data-guidance-target="writers"`), gone during drafting
(`none`), moved to Casting after accept (`casting`), and SUPPRESSED whenever the red
decision badge owns the target (review-required states read `none` — one attention
system per building, falsification-proven at both host and renderer layers by the
writer). Copy fixes verified live: single quiet waiting line ("The camera tests
finish in Week 2 — advance the week."), audition-review detail leads with results
("The camera tests are in — 6 reads are waiting at Casting"). Tuple re-pins: +1
display object (the one shared marker layer) on four grid fixtures, all plate
fixtures byte-identical, dynamic actors/decoded bytes/draw calls unchanged
everywhere; commission-workspace open/close equality intact. Gates verified by my
runs: both tsc clean, 226 files / 3,104 tests green; writer's full Playwright at
HEAD: 192 passed / 4 env-gated GPU skips. Taste rulings on reported deviations:
amber `warning` does NOT suppress the marker (correct — they signal different
things); institution-band-unreachable-at-small-windows is a pre-existing camera
fact; no marker on the retained plate (correct — rollback path has no property).
A11y note carried to backlog: audition slate cards expose names but not selected
state (no aria-pressed).

### Wave 4 — Owner-style 15-minute playtest: PASS (Fable, 2026-08-17)

Fresh studio (seed `studio-001`), natural pace, no repository knowledge used. Full
first-film loop in ~11 minutes: found → guidance card "No picture yet / Commission a
screenplay at Development" → commission (retained workspace, best-writer default) →
draft → in-world review → accept → "Plan auditions at Casting" → retained planner →
six-reads receipt → results review → "Take results to Package" → package (named
select buttons) → budget → greenlight Week 2 → PICTURE FORMED → three shooting
interventions, each resolvable from the next-event rail, the desk panel, AND the
guidance card's own verb → post → **RELEASED Week 10**: period poster, The Silver
Screen Gazette (2.5/5 critics · 60/100 audiences · $7.78M opening · projected
$5.5M profit), forecast-vs-result table, standing changes, per-person career impact
with "why it changed" — then Back to studio, where the card reads **YOUR NEXT
PICTURE / In release / The next picture starts with a screenplay / [Commission a
screenplay at Development]** and the marker lights Development again: film #2's
first lesson is exactly the step the golden path deferred.

The 15-minute test v2, item by item: no menu hunting ✓ (the deep Casting Room never
opened this run); no confusion starting a film ✓; no confusion about the current
film ✓ (one identity from card to poster); no confusion about what is waiting ✓;
no confusion about the next decision ✓; ordinary actions from the studio ✓; the
physical studio visible and relevant throughout ✓. "I know where this is because I
built it" moments: none on the ordinary chain.

### Wave 4 — red-team verdict: VERIFIED WITH CAVEATS

Independent red-team at HEAD `6d7d284`, all gates reproduced (root+ui tsc clean;
vitest 226 files / 3,104; Playwright FULL 193 passed / 4 env-gated GPU skips / 0
failed; determinism, reduced-motion, camera law, focus traps, byte-neutral Escape
cancels all verified). The first film held on two seeds the PM never played
(`redteam-7`, `gazette-3`): guidance-first to Week-2 greenlight, zero console
errors, copy/marker/verbs agreeing at every stage; trap default dead on both;
rewrite path fully truthful; two-simultaneous-READY-screenplays impossible (the
card-names-A-button-acts-on-B ambiguity cannot arise).

Findings ruled into the FINAL FIX WAVE (bounded, before seal):
- **P0-1** Retained audition planner worked exactly once per studio —
  `auditionPlanning.ts:674` requires `sessions.length === 0` (append-only array), the
  same over-strict world-rejection family as the Wave-2 duplicate-name bug; every
  picture after the first ejected to the Casting Room while guidance pointed there.
- **P0-2** Ready-to-package card advertised "or go straight to the picture's
  package" — a step the world does not offer at that state. Untrue sentence, cut.
- **P2-7** Scenery guidance said "at the soundstage" while the world flags Scenery &
  Service. **P1-5** Development withheld the commission verb with no in-world
  explanation while a screenplay occupies the room. **P2-10** stage attr said
  `drafting` during rewriting.

Findings DEFERRED on the record (next-hills; no code touched):
- **P0-3** Escape from the package workspace leaves guidance pointing at
  "Assemble the picture's package at Casting" whose only path is the full-screen
  Casting Room — the world-mounted package re-entry does not exist (already
  next-hills #1; this is its sharpest motivation).
- **P1-4** With one production active, the desk renders the production card and the
  guidance card never appears for a concurrent second picture's pre-greenlight
  journey (the red-badge + blocked-sim grammar carries it; desk ownership with two
  pictures is an Owner design decision).
- **P2-8** A staffing-blocked package still shows an enabled next + marker (tied to
  the recorded Owner design finding on commissioning stripping roles).
- **P2-9** At ready-to-package, activating Casting auto-opens the planner, so the
  Wave-2 inspector verb is bypassed in ordinary first-picture play (PM taste ruling:
  auto-open is the better grammar there; the verb is load-bearing when the planner
  refuses — e.g. sessions pending — and from picture #2 after Fix 1).

Log corrections (Fable's own overclaims, per red-team):
- Wave-4 playtest said all three shooting interventions carried the guidance card's
  own verb — in truth the card owns the desk only when the production card stands
  down (scenery block); the director-call and take-ready blocks are resolved from
  the flagged building, the desk panel, or the next-event rail. The interventions
  are all world-resolvable; the card claim was too broad.
- "Released Week 10" reproduces only with my exact package staffing; first-eligible
  staffing released Week 13 from the same Week-2 greenlight. Release week is
  staffing-dependent; recorded as drift, not a defect.

### Final fix wave — RULED KEEP; SHIFT SEALED (2026-08-17)

All five chartered fixes landed (commits `3c53c64`…`b7cec9a`, 919 insertions /
13 files): the retained audition planner plans every picture (strict-context
emptiness clauses removed, faithfulness proofs kept, real-browser falsification
extended in `lot-founded-audition-path-v1`); the untrue package sentence cut; the
scenery step names the flagged place; Development explains a closed commission;
the rewriting attr documented. Verified by the PM on the final tree: both tsc
clean; vitest 226 files / **3,110** tests green; Playwright FULL **194 passed /
4 env-gated GPU skips / 0 failed** (14.8m, exit 0); and a LIVE film-#2 probe —
post-release, "Plan auditions at Casting" for "A Season of Escapement" mounted
the retained planner over the live lot (`lot-audition-workspace: 1, Casting Room
screen: 0, lot mounted`), with the corrected ready-to-package copy visible.

The shift is sealed per the Owner stop condition. No successor campaign begun.
Next: Owner's fresh PM planning pass with The Movies Mechanics Bible + screenshot
corpus. Deferred defects and next hills recorded in
`FIRST-MOVIE-JOURNEY-HANDOFF.md`.

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
