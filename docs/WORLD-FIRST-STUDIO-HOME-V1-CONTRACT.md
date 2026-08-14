# World-First Studio Home V1 Contract

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
- World-First Scenery Load-In V1 contract `b03bb10`, implementation `3a667e0`, and closure
  `ae64b41`; and
- the App/session/feature-gate/navigation code at this contract's parent `ae64b41`.

## Purpose

Make the persistent Studio Lot the ordinary home of an operating studio. Under ordinary adopted
defaults, a player who founds, recovers, or loads a studio enters the living world, not a
screen-first Dashboard. The explicit overview rollback retains Dashboard home. Dashboard and every
existing deep management surface remain supported destinations for information and decisions that
need them, then return to the root surface that opened them.

This is an App navigation and player-enablement slice. It does not change Engine truth, simulate a
second studio, keep two App trees alive, or make Phaser a router. It adopts already-integrated
world content, centralizes one presentation decision, carries exact root origin through bounded
deep routes, and closes a stale cross-studio selection leak.

## Measured pre-contract state

The repository, not an assumed product model, establishes these current facts:

1. `App.tsx` owns one authoritative `GameState` and one local discriminated `Screen` value. There
   is no URL router, browser-history stack, or external state store.
2. Active-session persistence saves only whole `GameState` through the existing validation and
   migration path. It does not save screen, root origin, camera, selection, focus, or renderer
   state.
3. No session enters Start; a state with `founding !== null` enters Founding.
4. Every founded recovery, Start import, founding completion, and accepted Saves import currently
   enters Dashboard.
5. `studioLotOverviewEnabled()` and `operationHollywoodEnabled()` are both default OFF. No
   repository `.env` enables either. A mere `setScreen({ kind: 'lot' })` change would therefore
   bypass the overview rollback and/or land ordinary players in the legacy D1 scene rather than
   the governed Hollywood home.
6. The Lot already contains several minutes of authoritative play: production/person selection,
   named-director assignment and travel, scenery blockage resolution, take scheduling, live week
   advance, and Annex construction.
7. Lot navigation emits identity-only routes. App maps them to existing React screens.
8. The visibly emitted Lot routes—Dashboard, Writers/Assembly, and Casting with nested
   Roster/Assembly—currently hard-return or fall through to Dashboard. Expansion is intercepted by
   its same-world Annex context and does not visibly dispatch Studio Development. App's additional
   latent LotRoute handler variants for Hiring, Saves, Hub, and Studio Development would lose
   origin if invoked.
9. Live Week Advance is the only typed origin-safe chain. Lot-origin Newspaper, ReleaseResult, and
   Autopsy return to Lot; Dashboard-origin equivalents return to Dashboard.
10. An archived Clipping's Newspaper → Film Chronicle handoff loses any new Lot-origin Dashboard
    context because `filmRecord` carries no return context and hard-returns Dashboard. A fresh
    release has a retained Autopsy snapshot and does not expose Chronicle from Newspaper.
11. A deep route unmounts `StudioLotScreen` and destroys its one Phaser view. The selected building
    and stable stage assignment survive within the page session; camera, person, production,
    place, Scenery, and Annex React context do not.
12. The module-level selected building is not reset on New Studio or accepted save replacement, so
    a different studio can inherit an old studio's highlighted building.

These facts define the repair boundary. No closure may claim that V1 keeps the renderer alive
behind every panel or restores transient camera/person context after a deep unmount.

## Product interaction law

The ordinary operating loop becomes:

```text
START / RECOVER / LOAD
→ FOUNDING IF THE STUDIO IS NOT YET FOUNDED
→ OTHERWISE ENTER THE LIVE HOLLYWOOD STUDIO LOT
→ INSPECT / ACT IN WORLD
→ OPEN A SUPPORTING MANAGEMENT SURFACE WHEN NEEDED
→ COMPLETE OR CANCEL THE DECISION
→ RETURN TO THE LOT ROOT THAT OPENED IT
```

Dashboard is not deleted, renamed, diminished, or hidden. It remains an explicit supporting
surface reachable from Administration, Gate, production/release destinations that presently
resolve there, and the visible `Open Dashboard` action. When Dashboard opens from Lot, it exposes
`Back to Studio Lot` and retains that Lot root through its children. Dashboard is a root only when
the session itself entered Dashboard under overview rollback or another Dashboard-rooted flow;
those Dashboard-origin children continue to return to Dashboard.

The application must never create:

```text
automatic Lot → automatic Dashboard → deep screen → guessed Lot
```

Root origin is explicit typed UI state established when the deep route is created.

## Adopted player gates and rollback law

The existing Studio Lot overview and Operation Hollywood integrations become adopted
ordinary-player content. No new feature flag is introduced.

### Studio Lot overview

`studioLotOverviewEnabled()` becomes default ON.

- absent env and absent localStorage key: ON;
- env `VITE_STUDIO_LOT_OVERVIEW=0` or `false`: OFF rollback;
- localStorage `project-studio.flags.studio-lot-overview = '0'`: OFF rollback;
- env/localStorage `1` or `true`: explicit ON compatibility; and
- unavailable storage with no env rollback: ON.

For conflicting sources, any explicit `0`/`false` rollback wins over any positive enable value;
otherwise any positive value enables; otherwise the adopted default is ON. This same precedence
law applies independently to both adopted gates.

Overview rollback is a complete compatibility path. An operating studio uses Dashboard as home,
the Dashboard exposes no Lot entry, existing management behavior remains usable, and no lazy Lot
module is fetched merely because the player has a founded studio.

### Operation Hollywood

`operationHollywoodEnabled()` becomes default ON independently of overview enablement.

- absent env and absent localStorage key: Hollywood ON;
- env `VITE_OPERATION_HOLLYWOOD=0` or `false`: legacy/procedural Lot rollback;
- localStorage `project-studio.flags.operation-hollywood = '0'`: legacy/procedural rollback;
- env/localStorage `1` or `true`: explicit Hollywood ON compatibility; and
- unavailable storage with no env rollback: Hollywood ON.

Hollywood rollback does not send an operating studio to Dashboard. It preserves the Lot as home
using the already-supported legacy/procedural world and complete native semantic companion.

The identity review, soundstage proof, and other development review gates remain default OFF.
Accepted identity, soundstage, authored-stage, and Role Atlas player content keeps its existing
default/rollback law. No review chrome becomes player-facing.

Existing set/QA helpers may retain their public names, but `false` must create an explicit `'0'`
rollback rather than remove a key whose absence now means ON. Tests must distinguish “explicit
rollback” from “clear override and use adopted default.”

## One App-owned home decision

Define one pure presentation decision equivalent to:

```ts
function operatingStudioHome(
  lotEnabled: boolean,
  entryFocus: 'studio-home' = 'studio-home',
): Screen {
  return lotEnabled
    ? { kind: 'lot', entryFocus }
    : { kind: 'dashboard', returnContext: { kind: 'dashboard' } }
}
```

App owns this decision. Engine, adapter, save migration, StartScreen, FoundingScreen, Saves,
StudioLotScreen, StudioLotView, and Phaser do not choose the root destination.

Use that one decision at exactly these authoritative boundaries:

1. first mount with a valid founded active session;
2. accepted founded import from Start;
3. successful completion of Founding;
4. accepted founded import from Saves; and
5. an explicit ordinary `goStudioHome()` action not already carrying a deep return context.

Typed deep returns do **not** call this canonical helper. They continue through
`returnToStudioContext(context)` so `studio-home`, `selected-building`, `advance-week`, and
completion-suppression instructions cannot be erased by canonical-home focus.

Do not use it for:

- no session or corrupt-session Start;
- an uncompleted founding draft;
- Founding → Talent Creator → Founding;
- explicit `Open Dashboard` from Lot, which creates a context-aware Dashboard supporting surface;
- a Lot building whose existing route deliberately opens Dashboard;
- Dashboard-origin Back/Cancel/complete actions;
- rejection paths that must retain the current screen; or
- tick-generated result chains, which retain their already-frozen explicit return context.

The entry matrix is binding:

| State / event | Overview default ON | Overview rollback OFF |
| --- | --- | --- |
| No session | Start | Start |
| Corrupt active session | Start + recovery-failed notice | Same |
| New game | Founding | Founding |
| Restored founding draft | Founding + recovery notice | Same |
| Start import with `founding !== null` | Founding | Founding |
| Saves import with `founding !== null` | Founding | Founding |
| Successful Founding | Studio Lot / Hollywood default | Dashboard |
| Restored founded current save | Studio Lot + recovery notice | Dashboard + notice |
| Restored founded converted save | Studio Lot + recovery/migration notices | Dashboard + notices |
| Start import, founded | Studio Lot | Dashboard |
| Saves import, founded | Studio Lot | Dashboard |
| Rejected import | Current surface and state unchanged | Same |
| New Studio declined | Current surface and state unchanged | Same |
| New Studio accepted | Start, prior active session cleared | Same |

There must be no intermediate Dashboard paint before Lot, no second App, and no second load or
autosave caused by presentation routing.

## Typed root origin

Extend the existing explicit return-context precedent rather than inventing a generic history
stack. A Lot context distinguishes three bounded focus destinations:

```ts
type StudioReturnContext =
  | { kind: 'dashboard' }
  | {
      kind: 'lot'
      focus: 'studio-home' | 'selected-building' | 'advance-week'
      suppressOperationalAnnouncement: boolean
    }
```

- `studio-home` is used by the topbar `Open Dashboard` action, which has no source building.
- `advance-week` remains the exact Live Week Advance release-chain return.
- `selected-building` is used by a supporting screen opened from a Lot building or companion
  control.
- `suppressOperationalAnnouncement` keeps its existing construction-completion ownership law.
- Dashboard origin remains the immutable `{ kind: 'dashboard' }` value.

The context is transient App presentation state. It is not added to `GameState`, SaveFileV1–V11,
the Engine adapter, `StudioLotSnapshot`, localStorage, URL, or Phaser.

Every supporting `Screen` variant reached from a Lot-emitted route or nested beneath one must carry
its root context. App's existing `LotRoute` union also contains typed latent routes that the current
nine-building companion does not visibly emit; the handler must preserve origin for those routes
without this contract inventing new world affordances. The minimum set is:

- Writers Room;
- Casting Room;
- Assembly;
- Roster;
- Hiring;
- Talent Creator when reached through Hiring or directly from a context-aware Dashboard;
- Talent Hub;
- Saves;
- Studio Development;
- Calendar and Recap when opened from a context-aware owner;
- Film Chronicle; and
- the already-contextual Newspaper, ReleaseResult, and Autopsy chain.

Dashboard carries a root return context like every other supporting surface. Dashboard entered
from Lot through Administration, Gate, production/release destinations, or `Open Dashboard` shows
one `Back to Studio Lot` action and gives its children the same Lot context. Dashboard entered as
the overview-rollback home carries Dashboard context, shows no misleading Back action, and gives
its children Dashboard context.

Dashboard Advance and Sim-to-next-event also receive that root context. The advance owner must
receive an explicit action source—`mounted-lot` or `supporting-dashboard`—rather than infer it from
the current screen. A no-release tick from the mounted Lot keeps that exact mount and button node.
A no-release tick from Lot-origin Dashboard remounts Lot with `advance-week` focus and the accepted
feedback; construction completion keeps its existing notice/focus precedence. Dashboard-root
advances retain existing Dashboard routing. A Lot-origin Sim release/summary/decision chain carries
Lot root; Sim uses `selected-building` or `studio-home` from the Dashboard context and sets
completion suppression when its exact result already owns that event. Dashboard-root Sim remains
exact.

## Deep and nested return matrix

The following behavior is binding:

| Origin / route | Completion, Cancel, or Back |
| --- | --- |
| Lot → Writers Room | Lot, selected building focused |
| Lot → Writers Room → Assembly | Lot after cancel or accepted greenlight |
| Lot → Writers Room → Casting Room | Lot after Back; origin survives further nesting |
| Lot → Casting Room → Assembly | Lot after cancel or accepted greenlight |
| Lot → Casting Room → Roster | Lot after Roster Back |
| Lot → Hiring → Talent Creator → Hiring | Hiring retains Lot origin; Hiring Back → Lot |
| Lot → Hub | Lot |
| Lot → Saves, rejected import | Stay in Saves with Lot origin intact |
| Lot → Saves, Back | Lot |
| Lot → Saves, accepted founded import | New studio's canonical home; old origin discarded |
| Latent LotRoute callback → Studio Development | Lot; no new Annex affordance in V1 |
| Lot → Dashboard destination | Dashboard supporting surface; Back → Lot |
| Lot → Dashboard → shared child | Child Back → Lot; root context is not guessed |
| Lot → Dashboard → Talent Creator | Create/Back → Lot; no contextless Dashboard reconstruction |
| Lot → Dashboard → Advance/Sim result | Result chain returns Lot; no-release Advance remounts Lot |
| Dashboard-root → any same supporting screen | Dashboard |
| Dashboard-root → Writers/Casting nested chain | Dashboard |
| Dashboard-root → Saves, Back | Dashboard |
| Dashboard-root → Advance/Sim result | Existing Dashboard-root routing |
| Lot-origin release → Newspaper → ReleaseResult → Continue | Lot, Advance focused |
| Lot-origin release → Autopsy → Back | Lot, Advance focused |
| Lot-origin Dashboard → archived Clipping → Film Chronicle → Back | Lot, current root context |
| Dashboard-root Newspaper/Chronicle/Autopsy/clipping | Dashboard |
| Lot-origin Dashboard → Chronicle/Autopsy/clipping | Lot; current root context, not film history, owns return |

Hiring, Hub, and Saves rows above bind the already-declared App `LotRoute` callback if invoked in
focused host proof; they do not require V1 to add decorative building buttons or a new quick menu.
Roster is already reachable by nesting through the visible Casting Room route.

Calendar routes that target a Dashboard production/theatrical row open Dashboard with Calendar's
existing root context; if that root is Lot, Dashboard retains `Back to Studio Lot`. Calendar routes
to Writers, Casting, Roster, or Studio Development carry the same root directly. No route may infer
origin from its label, current screen, newspaper source, selected film, or a module-global “last
page.”

Both companion-button and renderer `onAction` building routes record the exact emitted building ID
before dispatch. The renderer path may not rely on a prior `onSelect` event or array order; input
ordering must not turn a Gate, Administration, or Stage action into an unrelated remembered focus
target.

A state-replacement boundary—accepted Start import, accepted Saves import, New Studio, or a new
founding draft—discards every old root context. A generic previous-screen stack is forbidden
because it could resurrect an Assembly draft, Founding draft, or prior studio after authoritative
replacement.

## Same-world continuity boundary

Returning from a bounded supporting surface remounts one Studio Lot against the same current
authoritative `GameState`. The current architecture destroys Phaser on deep navigation; V1 does
not retain a hidden second renderer or mount a duplicate App.

V1 must truthfully preserve what the current presentation architecture can own:

- one current App/GameState owner;
- exact week, cash, RNG, ledger, productions, people, reservations, construction, publicity, and
  save bytes;
- the stable in-session production-to-stage assignment;
- the selected building identity for a Lot-launched building route; and
- an explicit return focus target.

V1 does not claim to preserve across a deep unmount:

- camera pan or zoom;
- selected person, production, Scenery context, Annex context, or generic place context;
- a moving presentation-only route or acknowledgement; or
- the same Phaser object identity.

No code may fake that continuity by serializing renderer state into GameState or by keeping two
authoritative views alive. A later application-shell milestone may keep the Lot mounted behind
panels after separately measuring memory, focus, input containment, pause/resume, responsive
layout, and renderer ownership.

## Cross-studio presentation reset

The selected-building session memory must move behind a pure, lazily safe presentation-session
module or equivalent reset boundary. App may not eagerly import `StudioLotScreen` or Phaser merely
to clear it.

At each authoritative studio replacement, reset both:

1. stable stage-assignment presentation memory; and
2. selected-building presentation memory.

App also clears transient state that belongs to the replaced studio: release snapshots, open
profile/drawer identity, Lot advance feedback, completion suppression, old root context, and the old
recovery notice. An accepted imported studio replaces migration disclosure with its own
`details.converted` result. A stale “Recovered Week <old>” message may never survive an accepted
Saves import into a different studio.

The boundaries are:

- accepted Start import or newly generated game;
- accepted Saves import; and
- accepted New Studio destruction.

Rejected import and declined New Studio do not reset any of those values or notices. Ordinary root
navigation and deep returns do not reset them. A new/loaded studio must never inherit another
studio's selected building, stage assignment, camera, focus instruction, completion suppression,
activity toast, profile, release snapshot, root context, or recovery notice.

## Focus, keyboard, and announcement law

The Lot needs a real page-level focus owner now that it is an automatic home.

- The visible studio name becomes or is paired with a semantic level-one heading, programmatically
  focusable with `tabIndex={-1}`.
- Canonical operating-studio entry, recovery, load, and an ordinary Dashboard-root → Lot navigation
  focus that heading once after the Lot host mounts.
- Context-aware `Back to Studio Lot` from a Lot-origin Dashboard is a deep return: it focuses the
  remembered source building only when the context says `selected-building`; topbar
  `studio-home` returns focus the heading. An invalid selected-building target also falls back to
  that heading.
- A supporting deep-screen return focuses the companion button for the remembered selected
  building. If that exact building is absent, malformed, or no longer selectable, focus falls back
  to the Lot heading; it never targets a neighbor by array position.
- Live Week Advance release return continues to focus `Advance one week`.
- A mounted-Lot no-release advance retains its existing node/focus without a forced move. A
  supporting-Dashboard no-release advance necessarily remounts Lot and focuses `Advance one week`.
- Construction completion retains its accepted focus precedence.
- Founding, Start, Dashboard, and each deep screen retain their existing headings/focus behavior
  unless a stale destination assertion is intentionally changed by this contract.
- The recovery and migration notices remain polite status regions and stay visible on automatic
  Lot entry.
- The lazy fallback text becomes an explicit status while loading. Renderer rejection still leaves
  the complete semantic Lot and focus path.
- Pointer, Enter, Space, and ordinary Tab navigation must reach every new/retained action once.

New Studio Home/root-origin and Lot-entry focus handling may not use autofocus, delayed arbitrary
timers, `document.activeElement` inference, or a global focus stack. It uses the typed entry
instruction and exact DOM refs. Existing unrelated focus-owner patterns, including the Talent
Profile drawer's opener restoration, are not rewritten by this prohibition.

## Engine, save, and autosave neutrality

Navigation and gate adoption alone may not change:

- `GameState` fields or validation;
- SaveFileV1–V11 schemas, migrations, conversion disclosure, or export bytes;
- the active-session storage key or quarantine behavior;
- RNG state, draw count, or ordering;
- ledger entries, cash, awareness/reach, publicity, marketing, discoverability, reception, or
  theatrical accounting;
- production, script, casting, facility, reservation, construction, task, countdown, or release
  rules;
- week advancement or Sim-to-next-event behavior;
- adapter action ownership or error text; or
- `StudioLotSnapshot` fields.

Accepted pre-existing actions in the required journeys—Founding, greenlight, production commands,
Advance, Sim, publicity, hiring, and construction—must produce their exact pre-contract
authoritative successor. Routing may add no second mutation before or after that successor.

React development Strict Mode may re-invoke initializers/effects, so this contract does not count
raw effect calls as player transactions. Merely choosing Lot instead of Dashboard cannot create an
additional state replacement or persistence write beyond the existing mount lifecycle. A current
save's canonical `exportSaveJson` SaveFileV11 bytes must be identical before and after automatic
entry. A converted save keeps the existing conversion write/notice behavior and no more.

## Renderer and failure boundary

The Lot remains lazy. Choosing it as home causes the existing dynamic chunk to load only after a
valid founded operating state exists.

- Start and Founding do not fetch or mount the Lot.
- Overview rollback does not fetch or mount the Lot.
- Hollywood default selects the existing accepted Hollywood renderer; it creates no second canvas.
- Hollywood rollback selects the existing legacy/procedural renderer in the same host.
- Rejection of the **inner** `import('./StudioLotView.ts')`, view-constructor rejection, malformed
  canonical place records in an otherwise loaded Hollywood manifest, authored asset fallback,
  synchronous WebGL construction failure, and reduced motion retain the complete native semantic
  companion already rendered by `StudioLotScreen`.
- An inner-view failure does not reroute to Dashboard, mutate the gate, clear the studio, or
  fabricate a load failure. Failure of App's outer `React.lazy` StudioLotScreen chunk remains the
  existing error-boundary condition. A total asynchronous district-manifest/network scene failure
  may retain the current Preparing status while semantic controls remain; recognizing that wider
  case requires a separate host/view error bridge. Building an eager duplicate semantic shell is
  outside V1.
- Deep navigation destroys the one view exactly once; return constructs exactly one replacement.
- Repeated Dashboard ↔ Lot and deep-screen cycles leave at most one live canvas and one App tree.

No renderer display-object, actor, route, texture, draw, or decoded-byte budget increase is
authorized by routing alone. The accepted warm Hollywood authority is 34 display objects, 15
actors, one draw, and exactly 11,096,896 decoded texture bytes.

## Required automated proof

At minimum, focused tests must prove these contract families:

1. no session → Start with no Lot import;
2. corrupt session → Start + safe notice with no Lot import;
3. new game → Founding, and Founding → Talent Creator → Founding remains exact;
4. restored founding draft → Founding with recovery notice;
5. successful Founding → default Hollywood Lot without Dashboard paint;
6. founded current-session recovery → Lot with exact recovery notice;
7. founded converted-session recovery → Lot with exact version-neutral migration notice;
8. accepted founded Start import → Lot;
9. accepted founding Start import → Founding;
10. accepted founded Saves import → new studio's canonical Lot home;
11. accepted founding Saves import → Founding;
12. rejected Start/Saves import retains exact state/surface and emits no success notice;
13. New Studio decline preserves current studio, root, selection, and autosave;
14. New Studio accept clears session/presentation memory and enters Start;
15. overview and Hollywood gates are independently default ON;
16. overview env/localStorage `'0'` gives Dashboard home, no Lot entry/import, and full management
    compatibility;
17. Hollywood env/localStorage `'0'` gives legacy Lot home and semantic compatibility;
18. existing positive `'1'` overrides remain compatible;
19. proof/review gates remain default OFF;
20. canonical entry focuses the exact Lot level-one heading once;
21. Lot → Writers → Back and Lot → Writers → Assembly/Casting → Back/Cancel/Greenlight return Lot;
22. Lot → Casting → Roster/Assembly retains Lot origin;
23. the already-declared latent LotRoute callback → Hiring → Talent Creator → Hiring preserves Lot
    origin without adding a new world affordance;
24. the already-declared latent Studio Development/Hub/Saves route callbacks preserve Lot origin
    without adding a new affordance;
25. rejected Saves import retains its Lot origin; accepted import discards the old origin;
26. Lot → Dashboard shows `Back to Studio Lot`, carries Lot root through Dashboard children, and
    returns to the exact source building or heading fallback when the topbar had no source;
27. Lot-origin Dashboard → direct Talent Creator, Saves reject/back, Calendar/Recap, Chronicle,
    Clipping, and Autopsy each preserve Lot root; the same callbacks from Dashboard-root preserve
    Dashboard root;
28. Dashboard-root → each shared deep screen remains Dashboard-compatible and shows no false Lot
    return;
29. explicit `mounted-lot` versus `supporting-dashboard` action source drives Advance/Sim: a
    Lot-origin Dashboard returns to Lot through no-release, release, summary, decision, and
    completion branches, while Dashboard-root Advance/Sim remains destination-compatible;
30. Calendar nested and Dashboard-row routes preserve Calendar's root origin;
31. Lot release with Gazette/no Gazette/Autopsy retains the accepted Advance return;
32. fresh Lot release → Newspaper → ReleaseResult and/or Autopsy returns Lot; separately,
    Lot-origin Dashboard → snapshot-absent archived Clipping → Film Chronicle → Back returns Lot,
    while Dashboard-root Chronicle/Autopsy/clipping returns Dashboard;
33. hard reload from Lot or any deep panel restores canonical Lot home from exact GameState rather
    than attempting to serialize the prior transient route;
34. selected-building focus returns only to the exact remembered building and fails to heading;
    companion and renderer action paths both record the emitted identity before routing;
35. accepted new/load resets selected-building and stage-assignment memory; rejected/declined paths
    do not;
36. accepted Saves replacement clears the old recovery notice and replaces migration disclosure
    from the new import result; rejected import and declined New Studio preserve current notices;
37. recovered/current SaveFileV11, RNG, ledger, week, cash, productions, people, reservations,
    construction, and publicity are byte-identical across navigation;
38. routing produces no Engine action, tick, RNG draw, ledger entry, schema change, or extra state
    replacement;
39. inner StudioLotView import/constructor rejection retains automatic Lot home and all semantic
    routes, while outer lazy-screen rejection remains the existing error-boundary path;
40. reduced motion changes no entry, origin, state, focus, or command truth;
41. repeated Lot/deep/Dashboard cycles leave one App and at most one canvas;
42. lazy import receives the latest authoritative state if recovery/import and renderer readiness
    race; and
43. focused tests, the complete repository suite, both TypeScript projects, production build,
    deterministic fixture replay, governed D-16/D-17 harness, and proportional browser suites pass.

Old tests whose subject is a Dashboard/deep-management workflow may establish the explicit
overview rollback or deliberately enter Dashboard from Lot. They may not silently change the
production default back to Dashboard in shared setup. At least one focused default-path suite must
run with clean storage and no positive enable flags.

## Required live acceptance

Use real Chromium, deterministic public-authority fixtures, and ordinary player defaults. Use
native SaveFileV11 for current-save/byte-identity proof and one deterministic legacy V5–V10 fixture
only where conversion and version-neutral migration-notice behavior must be exercised.

1. With clean feature storage, restore a founded active studio and verify the first operating
   surface is one premium Hollywood Lot with no Dashboard flash and no positive enable flag.
2. Verify exact week, cash, studio name, active production, named people, Scenery state, and Annex
   state match the imported fixture.
3. Confirm recovery and converted-save notices remain visible/dismissible on Lot without covering
   required world controls.
4. Complete a new founding flow and verify it lands on Lot; Founding itself remains intact.
5. From visible Lot affordances, open Writers/Assembly and Casting/Roster; cancel/back and verify
   each returns to Lot with the exact source building selected and focused. Prove latent Studio
   Development origin only through focused host wiring; add no Annex button in V1.
6. Enter Dashboard from Lot, verify `Back to Studio Lot`, open a shared child and verify it returns
   to Lot; verify Dashboard Advance/Sim result routing; then repeat from overview-rollback Dashboard
   and verify the same child/results return Dashboard with no false Lot action.
7. Run a fresh Lot-origin release through Newspaper, ReleaseResult, and Autopsy; then use a
   snapshot-absent archived Clipping from Lot-origin Dashboard to open Film Chronicle. Every real
   Back/Continue path returns to the correct root without losing Engine truth.
8. Hard reload while on Lot and while on a deep screen. Both restore canonical Lot home plus exact
   save bytes; neither claims prior camera/deep-screen persistence.
9. Accept a different studio save after selecting a building and verify the new Lot inherits no
   old building/stage selection.
10. Repeat with overview rollback (`'0'`) and prove Dashboard compatibility/no Lot import; repeat
    with Hollywood rollback (`'0'`) and prove the legacy Lot remains home.
11. Induce only the inner `StudioLotView.ts` dynamic-import failure and prove automatic home,
    heading focus, native companion navigation, Back/return, recovery notice, and exact GameState
    remain usable. Do not relabel an outer lazy-screen chunk rejection as this pass.
12. Repeat the bounded home/deep-return loop with reduced motion and keyboard-only input.
13. Inspect 1280×720, 1366×768, 1440×900, 1920×1080, 1536×864 at 125%-equivalent density,
    1024×768 compact, 960×540 stress, and actual maximum world zoom for overlap, clipping,
    unreachable controls, page overflow, focus visibility, and status noise.
14. At 1920×1080 after warm-up, retain average FPS ≥50, 1%-low FPS ≥30, p99/worst sampled frame
    ≤33.4 ms, exactly one renderer draw, 34 display objects, 15 actors, and exactly 11,096,896
    decoded texture bytes.

Record browser console errors/warnings, failed requests, canvas count, focus target, current URL,
scroll position, and localStorage bytes. Known headless-driver warnings must be classified, not
concealed as product silence.

## Keep / kill gate

Keep only if an ordinary founded/recovered/loaded studio enters the premium living Lot by default,
Founding and rollback remain exact, supporting screens return to their explicit root, the Chronicle
origin leak is closed, and cross-studio presentation state is reset. Navigation/gate changes must
be byte-neutral; accepted existing actions must match their exact pre-contract authoritative
successors with no additional routing mutation.

Kill or revise if the implementation:

- produces a Dashboard flash before Lot;
- bypasses overview rollback or lands default players in legacy D1;
- deletes/weakens Dashboard or a deep-management owner;
- guesses origin from current screen/URL or creates a generic stale route stack;
- resurrects a prior studio's screen/selection;
- double-mounts App or Phaser;
- serializes route/camera/focus into GameState;
- changes an Engine result, save byte, migration, tick, RNG, ledger, or economy rule;
- breaks renderer-failure/reduced-motion semantic operation; or
- claims persistent-world continuity that the remounting architecture does not provide.

## Explicitly outside V1

- keeping the Lot mounted and visibly alive behind every deep panel;
- a new overlay/shell/window manager, URL router, browser-history contract, or generic navigation
  stack;
- camera/pan/zoom persistence across deep unmount or hard reload;
- persistence of selected person, production, place, Scenery, Annex, or presentation animation;
- a new tutorial, post-founding ceremony, repeated welcome flow, or save-schema onboarding flag;
- deleting, compressing, or replacing Dashboard, Finance, Calendar, Production Board, Roster,
  Hiring, Assembly, Chronicle, or Autopsy;
- a second simulation clock, autoplay, speed controls, Phaser-owned navigation, worker autonomy,
  pathfinding, facility queues, or new production tasks;
- new buildings, construction catalogue, facility costs, maintenance, financing, loans, bailouts,
  restructuring, failure ladder, or arbitrary cash sink; and
- any claim that D-17B certified complete macroeconomic balance.

After retention, re-run the Owner's several-minutes-on-lot test from ordinary startup. The next
observed break may justify a persistent application shell, visible facility occupancy/queues,
parallel-production legibility, or richer named-person workload/story state. Choose it from live
play, not screen inventory.

The governing economic classification remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open. This home/navigation contract authorizes no financing, loan,
bailout, restructuring, failure ladder, arbitrary cash sink, or macroeconomic reclassification.
