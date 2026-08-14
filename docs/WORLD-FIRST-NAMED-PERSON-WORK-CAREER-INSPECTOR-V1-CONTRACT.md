# World-First Named Person Work & Career Inspector V1 Contract

Status: **FROZEN AUTONOMOUS-MARATHON IMPLEMENTATION CONTRACT**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Authority base:

- Owner world-first product-direction ruling: **THE STUDIO LOT IS THE PRIMARY GAME SURFACE**;
- accepted D-17B and every still-open macroeconomy residual;
- accepted Operation Hollywood bridge `623b8b2` and marathon integration `4432a9b`;
- Dynamic People Role Atlas V1 implementation `66f856c` and closure `5146490`;
- World-First Soundstage Intervention V1 closure `6419452`;
- World-First Live Week Advance V1 closure `a9be116`;
- World-First Annex Construction Interaction V1 closure `933d074`;
- World-First Scenery Load-In V1 closure `ae64b41`;
- World-First Studio Home V1 contract `8d5f8dd`, implementation `0c4bd9d`, and closure
  `5a20a24`; and
- the person, production-operations, Talent Profile, career-history, App-overlay, and Lot input
  code at this contract's parent `5a20a24`.

## Purpose

Make one exact named studio inhabitant understandable at the point of observation. Selecting a
visible named Director or Lead actor in the Hollywood Lot must open a bounded in-world inspector
that explains the person's existing authoritative production involvement and public career state.
When more detail is useful, the same inspector opens the existing canonical Talent Profile as a
modal over the still-mounted Lot and returns focus to the same selected-person control when closed.

This is a read-only world-inspection and modal-continuity slice. It does not add a people
simulation, assign new work, create a second profile, change production law, or persist any UI
state. Engine/GameState remains the sole owner of production participation, workflows, tasks,
facilities, availability, career history, time, and outcomes.

## Measured pre-contract state

The repository, not an assumed design, establishes these current facts:

1. `studioLotSnapshot()` projects the real Director and Lead actor of each active managed
   production as named `LotPersonState` inhabitants. Legacy mode projects participants from only
   its two depicted productions and may add a real contracted Director/Actor roster fallback.
   Empty managed studios remain honestly empty.
2. Every physical Role Atlas person and every semantic person button emits or selects the same
   stable person ID. Person homes, routes, directions, movement speeds, animation elapsed time,
   and screen coordinates are renderer-owned presentation only.
3. The current Hollywood inspector shows only name, coarse Director/Talent role, and an attached
   production title. Selecting a person pins the matching production context, and existing
   two-film tests prove commands do not drift to array order.
4. `ProductionOperationsState` already exposes production ID/title, phase, production countdown,
   exact managed facility/location, Director identity, shooting-task status, blocker, and current
   command. These are production facts. The projection does not identify the Lead actor, so an
   exact Lead-to-operation join cannot currently be independently checked at the Lot boundary.
5. Managed production location is authoritative: Development maps to Development, Pre-production
   to Casting, Rehearsal/Shooting to the exact reserved soundstage, Post-production to Post, and
   Release Ready to the Theater/release desk. The production's facility is not automatically a
   person's current room or destination.
6. Only a managed Shooting Director has a personal task with a soundstage destination. Leads have
   no personal call, reservation, destination, or facility-occupancy record. `remainingTicks` is
   the picture's countdown, not a guaranteed personal completion date.
7. Legacy production locations are stable presentation assignments, not Engine workplace truth.
   Older hand-authored legacy snapshots may omit operation projections entirely.
8. The existing `TalentProfile` is the canonical public, perceived-only person read model. It owns
   assignment availability, named engagement, role proficiencies, star power, work ethic,
   temperament, credited career identity, and career history without exposing hidden actual skill,
   ceilings, or development rates.
9. App already owns one reusable `TalentProfileDrawer` above every screen. It traps focus, closes
   on Escape/scrim activation, and restores focus to its opener. The Lot currently has no route to
   it.
10. Opening that drawer does not require a screen transition. If App retains Lot screen identity,
    the same `StudioLotScreen`, lazy view, Phaser game, canvas element, camera, person
    selection, and production context can remain mounted.
11. The drawer's current scrim contains only `click`. Phaser observes pointer families and, in the
    legacy scene, global camera keys. A Lot-open modal therefore needs an explicit input boundary;
    focus trapping alone is not proof that the world cannot move behind it.
12. Public actions reject using one person across concurrent work, but accepted save validation
    does not independently enforce cross-production participant exclusivity. Existing assignment
    and person maps are last-write-wins in such a hostile state. The new Lot join must not repeat
    that behavior.

## Product interaction law

The retained ordinary loop is:

```text
SEE A NAMED PERSON IN THE LIVE STUDIO
→ SELECT THAT EXACT PERSON PHYSICALLY OR SEMANTICALLY
→ READ THEIR CURRENT WORK AND PUBLIC CAREER CONTEXT IN WORLD
→ OPEN THE CANONICAL TALENT PROFILE IF NEEDED
→ CLOSE IT
→ RETURN TO THE SAME MOUNTED LOT, PERSON SELECTION, CAMERA, AND OPENER
```

The compact Lot inspector is the first point of understanding. The Talent Profile is supporting
depth, not a replacement home and not a navigation destination. Opening it must not change the
App screen, URL, studio state, or world identity.

## Exact person-work projection

Add only the missing public participant identity needed to verify the existing join: each adapter-
created `ProductionOperationsState` carries the exact Lead actor ID and name alongside its existing
Director ID and name. Compatibility fixtures may omit the new Lead fields; omission must fail Lead
work detail closed rather than guess.

Define one pure Lot selector equivalent to `lotPersonWorkContext(snapshot, personId)`. It reads only
`StudioLotSnapshot`, never `GameState`, Phaser objects, array position, sprite role, or screen copy.
It returns one of these bounded states:

- **managed production** — exact person, exact Director/Lead role on the picture, exact production
  identity, phase, picture facility/location, production status, production weeks remaining, and
  the existing Director task status where applicable;
- **legacy production** — exact person/role, production identity, `Legacy production schedule`,
  status, and production weeks remaining, with no authoritative workplace;
- **roster / no visible production** — exact person identity and an honest statement that no
  production assignment is represented in this Lot snapshot; or
- **unavailable** — identity remains selectable, but current-work detail is withheld because the
  projection is missing, stale, contradictory, or ambiguous.

The selector must collect all operation participant matches for the selected ID and accept a
production join only when exactly one role on exactly one operation matches. It must additionally
require:

- exactly one person row with the selected ID;
- person ID and name equal the operation participant ID and name;
- Director Lot role joins only the operation Director;
- Talent Lot role joins only the operation Lead;
- person production ID/title equal operation production ID/title;
- managed mode carries `stageAssignmentAuthority: 'engine'`;
- legacy mode never upgrades a presentation stage into a workplace; and
- the selected person's role/production does not also occur on another operation.

Duplicate IDs, duplicated operations, one person in multiple productions, one person in both
Director and Lead roles, missing Lead projection, stale production identity, title/name mismatch,
unknown `district-managed` provenance, or missing legacy operations all return **unavailable**.
They must never silently take the first or last match.

The selector is presentation-only and deterministic. It does not repair, normalize, or mutate a
hostile save.

## Inspector facts and language

For an exact managed production participant, the in-world inspector shows:

- the exact name;
- `Director` or `Lead actor` as the person's role on the picture;
- the exact picture title;
- the exact production phase;
- `Picture location`, using the existing production facility label;
- the exact production status;
- `N production weeks remaining`, explicitly labelled as a production countdown; and
- for the Director only, the existing shooting-task status when one exists.

The inspector must not say that a Lead is personally at, travelling to, reserved into, or occupying
the picture's facility. For non-shooting phases it must not turn the production's phase into an
individual action verb. For a legacy participant it must say `Legacy production schedule` and
`Workplace not recorded`; it must not display the presentation-assigned stage as authoritative.

For a roster person, show only exact canonical Talent Profile assignment state: available, engaged
on a named production, or assigned to a named screenplay. Do not infer employment from Lot
provenance. When the work join is unavailable, show an explicit unavailable statement and no
production/facility/task claim.

For every selected person whose exact public Talent Profile matches ID, name, and role, show one
compact career line from the existing public career-identity selector:

- established credited identity labels when present; or
- the primary discipline plus `not yet proven` when no credited identity exists.

Do not recompute credits, OVR, tier, work history, availability, or career identity in React. The
canonical drawer remains the owner of detailed proficiencies, star power, work ethic, temperament,
assignment status, and career-history cards.

## Canonical profile overlay and live-world continuity

`StudioLotScreen` emits only the selected exact person ID through an `onOpenTalentProfile` intent.
App resolves the existing `talentProfile(state, id)` and mounts the one existing
`TalentProfileDrawer`. No Lot-specific profile component or copy of profile data is introduced.

While the drawer is open:

- `screen.kind` remains `lot`;
- the same `StudioLotScreen`, `StudioLotView`, Phaser game, and canvas DOM node remain mounted;
- the same selected person, selected production, selected place ownership, camera framing, week,
  cash, state, save bytes, RNG, ledger, and URL remain unchanged;
- modal pointer, mouse, touch, wheel, and keyboard input cannot reach the world behind it;
- the renderer must not be destroyed or recreated; and
- no Engine action, autosave, week advance, camera move, or world selection may be caused by
  opening, using, or closing the profile.

Input suspension is a presentation concern. It may disable the existing Phaser input plugins while
leaving the mounted renderer alive; it must reset held camera keys so a key pressed before modal
entry cannot continue panning. It must compose with document-visibility pause/resume and delayed
lazy-renderer readiness rather than accidentally waking a hidden tab. The scrim also contains all
down-event families as a defensive DOM boundary.

Close through the drawer button, Escape, or scrim activation. Focus returns to the exact `Open
talent profile` button that opened the drawer. The person remains selected and the button remains
in the same inspector. If the authoritative person disappears while open, the existing profile is
closed or withheld safely; it must never transfer to another person.

## Semantic, physical, and failure parity

Physical Role Atlas selection and the semantic named-person controls must enter the same exact
selector and inspector. Neither path may use sprite order or a role-only lookup. Keyboard Enter
and Space on the semantic person button must work once through native button behavior.

If Phaser construction or its lazy module fails, the complete named-person list, exact inspector,
and Talent Profile handoff remain available through the semantic companion. Reduced motion changes
only presentation motion. It does not alter identities, facts, selection, modal behavior, or
profile content.

Stage 12 remains exact even though the current authored district plate depicts Soundstage 7. The
inspector may report the authoritative picture facility and preserve the existing Stage 12
fallback copy, but it must not invent a visible Stage 12 person destination or coordinates.

## Explicit exclusions

V1 does not add or claim:

- personal coordinates, current room, route, path, ETA, speed, distance, direction, or arrival
  authority;
- Lead call status, personal facility reservation, destination, occupancy, or task;
- personal workload percentage, hours, task count, completion date, queue position, or blocker
  ownership;
- stress, fatigue, needs, mood, relationships, memories, autonomy, or character control;
- unrestricted Sims behavior or per-frame Engine positions;
- named identities for anonymous grips, stagehands, publicity figures, or ambient sprites;
- hidden actual persona, actual skills, true ceilings, development rates, or fabricated credits;
- new assignment, reassignment, cancellation, travel, career progression, or production commands;
- a new profile screen, router, modal framework, persistent shell, or second mounted Lot;
- any `GameState`, SaveFileV1–V11, RNG, ledger, economy, clock, production, task, facility,
  construction, publicity, or career-history mutation; or
- deep-screen camera/person persistence beyond Studio Home V1. This profile is an overlay and
  deliberately does not exercise a deep-screen remount.

## Automated acceptance

### Pure authority and adapter

Tests must prove:

1. exact Director and Lead identity on an ordinary managed production;
2. exact Development, Pre-production, Stage 7/Stage 12 Rehearsal/Shooting, Post-production, and
   Release Ready production facts without person-location inference;
3. two concurrent productions remain isolated after production and operation array reversal;
4. same-title productions do not merge by title;
5. duplicate person IDs, duplicate operations, cross-production reuse, dual Director/Lead role,
   stale ID/title/name, missing Lead fields, and unknown provenance fail closed;
6. managed empty, legacy empty/one/two, roster fallback, and omitted legacy-operation compatibility;
7. legacy workplace remains unavailable even when the presentation stage is stable; and
8. the public projection contains no hidden actual talent, route, coordinate, workload, need, or
   relationship field.

### React host and modal

Focused component/App tests must prove:

1. physical and semantic selection of the same ID render byte-for-byte-equivalent fact text;
2. Director and Lead show the correct distinct role language and exact picture context;
3. Film A/Film B switching never drifts a person, command, or facility across productions;
4. person, place, production, Scenery, and Annex context ownership still clears only the correct
   prior context;
5. `Open talent profile` opens the exact canonical profile for the selected ID;
6. close button, Escape, and scrim close restore focus to that exact opener;
7. one identical canvas DOM node and one view instance survive open/close, with person selection
   and camera framing retained;
8. modal pointer/down families and camera keys cannot select, pan, zoom, command, or advance the
   world behind it, including a key held across modal entry;
9. delayed renderer readiness and document visibility do not defeat input suspension;
10. full SaveFileV11 export bytes, RNG, ledger, week, cash, production, tasks, and people are
    unchanged by select/open/inspect/close; and
11. renderer failure, reduced motion, direct load, and supported responsive sizes retain the full
    semantic path without horizontal overflow.

### Browser and live play

Use a deterministic, public-action-derived native SaveFileV11 fixture with an exact managed
production and real Director/Lead identities. The bounded real-browser proof must:

1. enter the Hollywood Lot under ordinary default gates;
2. select the exact Director and Lead from the living world/semantic companion;
3. verify their distinct exact role, picture, phase, facility language, status, countdown, and
   career summary;
4. open each exact canonical Talent Profile and inspect assignment/career truth;
5. prove modal keyboard/pointer containment and same canvas identity;
6. close to the same selected person and focus;
7. compare pre/post native SaveFileV11 bytes and authoritative state sentinels; and
8. repeat the essential semantic path under renderer rejection and reduced motion, plus lightweight
   reachability/overflow checks at the governed responsive bounds including 960×540.

A compact managed two-production fixture is required only if existing public-action builders cannot
prove Stage 7/Stage 12 person isolation proportionally. Do not run the long two-release Autopsy
journey merely to manufacture inspector evidence.

## Keep / kill rule

Keep V1 only if a player can select a real named inhabitant, understand exactly what picture they
are involved in and what that picture is doing, inspect their real public career detail, and return
to the same live world context without any invented person truth or state change.

Kill or narrow any part that requires inferred personal location, UI-authored availability,
duplicate profile logic, renderer authority, ambiguous last-write-wins joins, a second simulation,
or world remounting for the profile.

## Economic boundary

This milestone is presentation/read-model work only. It does not alter or reclassify D-17B.

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open. No financing, loans, bailouts, restructuring, failure ladder, or arbitrary cash
sink is authorized.
