# World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 Contract

Status: **FROZEN BEFORE IMPLEMENTATION**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Parent authority: `72c13e32a421cc57dba267984e5faa938a6e6eac`

Implementation baseline: `e14633b578834f5a2f625049762c45506e6b1ee2`

## 1. Authority base

This contract is governed by:

- the Owner's world-first product-direction ruling: **THE STUDIO LOT IS THE PRIMARY GAME
  SURFACE. MANAGEMENT UI SUPPORTS THE WORLD**;
- accepted D-17B and every still-open macroeconomy residual recorded in section 21;
- Production Operations V1 contract `1c7a33a0e6ecb680e8c822a44f5baea7d450b716`,
  implementation `0ba1775`, and closure `28cb711b620ee59cfec7e84b506489de0e9979ac`;
- the accepted Operation Hollywood bridge `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`
  and marathon integration `4432a9befef578ac3549896c2796bf0a22950ec0`;
- World-First Soundstage Intervention V1 contract `001c692` and closure `6419452`;
- World-First Studio Home V1 closure `5a20a24`;
- World-First Operational Annex Work Presence V1 contract `e2fd6df`, implementation
  `e14633b578834f5a2f625049762c45506e6b1ee2`, and closure
  `72c13e32a421cc57dba267984e5faa938a6e6eac`; and
- the Soundstage 12 art no-go at `e9a80cd`, which remains binding and is not reopened here.

This is a frozen forward implementation contract. It does not rewrite the honest limits or results
of any earlier milestone.

## 2. Purpose and measured gap

The existing Stage 7 loop is already real world-first play. From the living Lot, the player can
select physical Soundstage 7, inspect the exact film, phase, facility, status and blocker, dispatch
the named Director, watch the accepted travel acknowledgement, clear scenery load-in, schedule the
take, advance authoritative time, and see current Engine truth repaint.

One bounded continuity gap remains. After explicit physical Stage 7 inspection, the player cannot
optionally open that exact film's complete existing Production Board card and then return to a
freshly revalidated Stage 7 context. Generic Dashboard entry loses the inspected production, while
default Studio Desk auto-orientation can display a production without proving that the player
selected it in the world.

V1 repairs only that supporting handoff and return. It does not move a command out of the Lot,
create a new production screen, add a production mechanic, or make Dashboard the discovery surface.

## 3. Binding world-first loop

The accepted loop is:

```text
EXPLICIT PHYSICAL STAGE 7 / STATUS / WORLD PROBLEM / NATIVE STAGE A INSPECTION
→ EXACT CURRENT STAGE 7 PRODUCTION CONTEXT
→ EXISTING WORLD COMMAND REMAINS PRIMARY
→ OPEN PRODUCTION BOARD DETAILS · <EXACT TITLE>
→ FOCUS THE EXACT UNIQUE CURRENT PRODUCTION BOARD CARD
→ OPTIONAL EXISTING BOARD COMMAND
→ BACK TO STUDIO LOT
→ FRESH EXACT STAGE 7 CONTEXT OR NEUTRAL LOT HEADING
```

The Board is a deep management surface used after the world has established identity and need. A
global Dashboard shortcut, a generic production rail, or a default auto-selected Studio Desk row
must not masquerade as physical inspection.

The direct return means the same authoritative studio and explicit Studio Lot root. The current
architecture unmounts the Lot for the non-modal Dashboard and remounts one Phaser view on return.
V1 does not promise the same Phaser instance, camera transform, person selection, animation frame,
or renderer object identity.

## 4. Existing authority and identity-only scene event

`StudioLotSnapshot` remains the only data boundary presented to the Lot. The existing scene event
remains unchanged:

```ts
export type HollywoodProductionSelection = {
  productionId: string
  locationBuildingId: 'stage-a'
}
```

It carries identity only. It does not carry `GameState`, a Board card, a cached blocker, a command,
a route, a return destination, a mutation, or a random result. Phaser remains a presentation and
input surface; it does not navigate to Dashboard or decide that a production is still current.

V1 must not widen the generic `LotRoute` union merely to pass this identity. The Lot host receives
one dedicated optional Stage 7 detail callback, parallel in architectural role to the existing
bounded publicity and Annex handoffs. App remains the sole screen-navigation owner.

## 5. One shared strict Stage 7 detail selector

Implementation must add one pure shared selector, named
`stage7ProductionDetailContext(snapshot)`, and use it in both Phaser-facing and React-facing Stage
7 selection paths. The current first-match seams in `HollywoodScene` and `StudioLotScreen` must not
survive as independent authorities.

The selector returns either:

```ts
type Stage7ProductionDetailContext = {
  operation: ProductionOperationsState
  ownerIntent: {
    productionId: string
    locationBuildingId: 'stage-a'
  }
}
```

or `null`.

It returns a context only when all of the following are true:

1. `operationsMode === 'managed'`;
2. `stageAssignmentAuthority === 'engine'`;
3. `productionOperations` is present as an array;
4. exactly one operation has `locationBuildingId === 'stage-a'`;
5. the selected production ID is unique across the complete operations array;
6. the selected phase is exactly `rehearsal` or `shooting`;
7. production ID, title, phase label, facility label, Director ID, Director name and status label
   are non-empty strings;
8. `weeksRemaining` is a safe non-negative integer;
9. `progress01` is finite and within `[0, 1]`;
10. task status, attention, blocker and command discriminants belong to their existing closed
    unions;
11. every present blocker has non-empty headline and detail;
12. every present command has a non-empty label and exactly the selected production ID; and
13. an `assignShootingDirector` command also carries exactly the selected operation's Director ID.

Optional Lead identity is either wholly absent or a non-empty exact ID/name pair. A half-present or
empty pair fails closed.

The selector structurally validates existing projected truth. It must not recompute command
legality, infer a blocker from task status, call Core or Production Board, read raw workflows or
facilities, mutate input, consume RNG, select by title/person/array position, choose a replacement,
or navigate.

Array order, same-title productions, prior UI selection, and a Stage 12 operation cannot alter the
result. Missing, duplicate, Legacy, presentation-assigned, malformed, relocated, or contradictory
authority returns `null` rather than the first plausible row.

## 6. Explicit world-selection provenance

Deep-detail eligibility is separate from the production the Studio Desk happens to render. The Lot
must retain one transient exact Stage 7 world context only after one of these explicit entries:

- the physical Stage 7 polygon;
- its physical status/problem affordance;
- the exact world blocker attached to the Stage 7 production;
- the native semantic Stage A companion, which is the renderer-independent equivalent world
  control;
- the existing exact same-production Scenery & Service Yard continuation after it returns to
  Stage 7 context; or
- a direct typed Stage 7 production return from the Board.

Eligibility is not granted by:

- the default Studio Desk orientation or its automatic first/only-production fallback;
- the generic production rail/list;
- a generic building navigation control that did not enter exact Stage 7 production context;
- a selected person, even when that person belongs to the film;
- a Stage 12 production;
- global Dashboard entry; or
- a stale production ID retained from an earlier snapshot or studio.

The transient context records the exact production ID and Stage 7 identity separately from
`hollywoodProductionId`. Selecting another person, building, place, production, publicity office,
Annex, scenery context for another film, or generic navigation clears it. Authority loss,
relocation, removal, release, completion out of the Stage 7 occupancy, duplicate identity, or
malformed replacement also clears it without substitution.

An explicit world entry may still show the existing operation inspector when no host deep owner is
provided. It simply omits or disables no essential world command; the secondary detail action is
absent.

## 7. In-world inspector and action priority

The current Stage 7 inspector remains the primary interaction owner. It continues to show fresh
title, phase, facility, Director, task status, blocker, countdown/progress and the exact existing
`currentCommand` where one is legal.

Only while the exact explicit world context in section 6 still equals the current shared selector
may it add this secondary native button:

```text
Open Production Board details · <exact current title>
```

The existing world command appears before the deep-detail button in visual, DOM and keyboard order.
The Board action must not displace, duplicate, hide, rename, or become a prerequisite for
`assignShootingDirector`, `clearSceneryLoadIn`, or `scheduleShootingTake`.

When there is no current command, the existing status remains the primary current-work result and
the detail action remains optional supporting infrastructure. No tooltip-only, canvas-only, or
generic **Open Dashboard** label satisfies this contract.

## 8. Rendered-token and latest-snapshot handoff

The detail button is a stale-sensitive navigation action. On pointer or keyboard activation,
`StudioLotScreen` must capture the exact context that rendered the button and compare it field for
field with a newly selected context from `latestSnapshotRef.current` before invoking App.

The comparison includes:

- production and Stage 7 identity;
- title, phase and phase label;
- weeks remaining and normalized progress;
- facility label;
- Director and optional Lead identity;
- task status, status label and attention;
- complete blocker kind/headline/detail; and
- complete command kind, production ID, Director ID where applicable, and label.

If any field changed, the Lot performs no navigation, clears the stale deep-return eligibility,
announces that current Stage 7 details changed, and moves focus to the fresh Stage 7 context heading
when one exists or the neutral Lot heading when it does not. It must not quietly navigate using the
same ID with obsolete visible facts.

After the Lot check passes, it emits only `{ productionId, locationBuildingId: 'stage-a' }` through
the dedicated callback. App then independently re-reads `latestStateRef.current`, builds the latest
managed Engine-authority Lot snapshot, calls the same shared selector, and requires exact ID and
location equality before opening the existing Dashboard with `focusProductionId`.

If App cannot prove the exact current context, it returns `false`; the Lot remains mounted, applies
no mutation, announces the unavailable handoff, and focuses fresh world truth. Navigation itself
must leave every `GameState` byte, SaveFile byte, RNG state, week, cash, ledger, workflow,
reservation and task unchanged.

## 9. Existing Production Board is the deep owner

V1 creates no new production-details panel. The existing Dashboard Production Board receives the
exact `focusProductionId` and continues to render only its existing adapter-owned cards and legal
commands.

Production Board focus must be hardened from first-match behavior to exact unique identity:

- filter the current cards by the requested production ID;
- exactly one match focuses that card's current command when present, otherwise its persistent
  status;
- zero or more than one match focuses the stable **Production Board** heading;
- a removed/released production never focuses a different card; and
- array order and same-title cards never influence the result.

The focus request is presentation-only and consumed once. Subsequent existing Board commands keep
their current successor-focus behavior: one accepted command focuses its next exact legal command
or status from fresh Board truth. Rejection remains loud and byte-identical. No Board command,
recommendation, legality rule, card field, or production ordering law changes.

## 10. Typed exact-production return intent

The Dashboard handoff carries one transient, discriminated Lot return arm equivalent to:

```ts
{
  kind: 'lot'
  focus: 'stage-7-production'
  productionId: string
  suppressOperationalAnnouncement: false
}
```

The production ID is mandatory only for this arm. It is UI session/navigation state, not
`GameState`, a save field, or a persisted production assignment.

Direct **Back to Studio Lot** consumes that exact arm, remounts one Lot against current App-owned
state, and reruns `stage7ProductionDetailContext`. If the same production ID remains the unique
current Stage 7 production, return must:

1. restore exact production inspector context from fresh fields;
2. restore the physical Stage 7 outline as soon as the current renderer is ready;
3. retain the semantic Stage A context immediately even if the renderer is delayed or unavailable;
4. focus the stable Stage 7 context heading without scrolling; and
5. avoid replaying Director travel, scenery movement, take ceremony, or any prior announcement.

The return does not cache the pre-navigation operation. Board commands, weekly progression or
other current-state changes may legitimately change the title-adjacent status, blocker, command,
progress or countdown shown on return.

## 11. Fresh-return fallback and navigation ownership

If the exact production is absent, released, completed beyond Stage 7, relocated, replaced by
another occupant, duplicated, malformed, Legacy, presentation-assigned, or no longer uniquely on
`stage-a`, direct return lands on the neutral Studio Lot heading. It must not select the new Stage 7
occupant, fall back to the first production, preserve an old outline, or reopen Dashboard.

The same neutral fallback applies after accepted new/load studio replacement. A production ID that
happens to collide across two studios cannot inherit the prior studio's return context.

Navigation from the focused Dashboard into any unrelated Dashboard child demotes the transient
Stage 7 arm to ordinary `studio-home` return. It must not demote to `selected-building`, because the
existing Stage 7 interaction does not persist a generic selected-building session fact. The direct
Dashboard root Back action alone owns exact Stage 7 return. Ordinary Dashboard-origin navigation
and every existing publicity, Annex, selected-building, week-advance and Dashboard return path
remain unchanged.

## 12. Exact-once input and modal law

- Pointer, click, double-click, Enter and Space activate at most one navigation call.
- Held Enter/Space generation cannot open repeated Dashboard instances or leak through remount.
- The rendered context is latched at the gesture's accepted activation boundary; a later render
  cannot retarget that same gesture.
- Pending navigation blocks a second gesture until App accepts/rejects or the context is cleared.
- Every over-canvas control contains pointerdown, mousedown and touchstart before the global Phaser
  input path can change selection.
- World down-events independently accept only the actual game canvas as their native target.
- The App-owned Talent Profile or any other active modal suspends physical, semantic, inspector and
  detail controls. No held key may cross the modal boundary.
- Hidden-tab resume, renderer recreation, delayed readiness and context loss clear pending gesture
  state and cannot reopen a deep screen.

There is no gameplay `ActionOutcome` for this navigation. A successful handoff returns only a
boolean navigation acknowledgement; it does not pretend that opening the Board changed the studio.

## 13. Renderer failure, accessibility and responsive layout

The canvas remains `aria-hidden`; the native Stage A companion is the complete semantic equivalent
entry. Manifest load failure, scene boot/create failure, renderer context loss, dynamic import
failure or delayed readiness must preserve:

```text
NATIVE STAGE A
→ EXACT STAGE 7 INSPECTOR
→ OPEN PRODUCTION BOARD DETAILS · <TITLE>
→ EXACT BOARD CARD
→ BACK
→ FRESH SEMANTIC STAGE 7 CONTEXT OR NEUTRAL LOT HEADING
```

The deep-detail action must:

- be a native button with the exact production title in its accessible name;
- provide a target of at least 44×44 CSS pixels;
- have a visible, unclipped focus indicator;
- expose stale/unavailable handoff feedback through the existing polite live region as a distinct
  event even when repeated;
- retain title, phase, status, blocker and action meaning without color alone;
- remain operable with keyboard only, screen readers, forced colors, grayscale and reduced motion;
  and
- preserve logical heading/action order at 200% page zoom.

The complete world context and action must remain reachable at 1920×1080, 1366×768, 1024×768 and
the governed 960×540 stress viewport, at actual maximum world zoom and at 200% browser zoom. Compact
layouts may scroll the inspector but may not replace the Lot with a screen-first list or hide every
world-selection affordance.

## 14. Frozen simulation, navigation and content boundary

V1 authorizes presentation identity, focus and navigation continuity only. It changes no:

- Core Engine or `GameState` behavior;
- SaveFileV11 schema, migration, import/export, persistence or compatibility law;
- production phase, task, blocker, command, duration, clock, reservation, facility, occupancy,
  allocation, queue, staffing, workload, redirect, cancellation or release law;
- action dispatch, command legality, rejection, weekly progression or deterministic RNG result;
- economy, publicity, awareness/reach, marketing, cash, ledger, facility or construction tuning;
- Production Board read-model field, forecast, recommendation or business rule;
- Annex behavior or evidence;
- district manifest, exporter, authored/generated art, texture, atlas, polygon, place, anchor,
  route, actor, vehicle, animation, pathfinding, display object or renderer draw; or
- Soundstage 12 content or the killed art ruling.

V1 must not add a global Dashboard shortcut, a Board-only production command, a cached Board card,
a second production-details screen, a persistent duplicate App/Lot tree, or a same-camera promise.

The likely implementation surface is bounded to one pure selector and its tests; Stage 7 selection
reuse in `HollywoodScene`; explicit provenance, inspector action and focus handling in
`StudioLotScreen`; one dedicated App callback and typed return arm; exact unique focus in
`ProductionBoard`; supporting CSS; and focused React/Chromium proof. Core, adapter authority,
snapshot schema, manifest, exporter and art must remain untouched.

## 15. Frozen asset and performance boundary

This slice adds zero renderer cost. The governed one-production reference tuple remains exactly:

```text
display objects:         34
dynamic actors:          15
decoded texture bytes:   11,096,896
renderer draws:          1
encoded texture bytes:   +0
routes:                  +0
```

The tuple is a frozen one-production reference, not a universal population cap. The recently
accepted Annex native script-Working scene honestly measured 30 objects / 13 actors while retaining
the same texture and draw totals.

The existing 1920×1080 fresh 240-frame wall-clock gates remain unchanged:

- average FPS `>= 50`;
- 1%-low FPS `>= 30`;
- p99 raw frame time `<= 33.4 ms`; and
- worst sampled raw frame time `<= 33.4 ms`.

Default headless wall-clock runs were compositor-contended during the Annex closure and did not
clear every absolute gate. V1 must not conceal that result, claim a new absolute pass without a
valid sample, smooth the raw clock, relax a threshold, or substitute the structural tuple for a
wall-clock certification. The existing opt-in absolute gate and structural checks remain intact.

## 16. Evidence boundary

No new production or economy corpus is required. Reuse the deterministic native SaveFileV11
Stage 7 and two-production evidence already governing Soundstage Intervention, Scenery Load-In and
Live Week Advance, including blocked, ready and scheduled states where applicable.

All reused saves must remain byte-identical on import/export. Test-only malformed/duplicate rows
may be built in memory at the snapshot/read-model boundary; they must never be represented as
native save authority.

Navigation-neutrality proof compares exact pre/post state and serialized bytes around the handoff,
Board focus and direct Back. Where an existing Board command is deliberately exercised, compare its
successor to the identical command dispatched from the already accepted owner path; only that one
authoritative successor may differ from the prestate.

## 17. Required automated proof

At minimum prove:

1. the selector accepts one exact managed/Engine-authority Rehearsal Stage 7 operation;
2. it accepts exact Shooting unassigned, blocked, ready, scheduled and completed task projections;
3. it is independent of operations-array order and same-title Stage 12 rows;
4. Legacy, presentation authority, missing array, zero Stage 7 and duplicate Stage 7 return null;
5. duplicate production ID, Stage 12-only, wrong phase, empty identity/copy, unsafe countdown,
   non-finite/out-of-range progress, invalid attention/task/blocker/command and half-present Lead
   identity return null;
6. blocker headline/detail and command label/production identity are exact, and Director-command
   identity cannot drift;
7. selector input and all nested operation fields remain unmutated;
8. `HollywoodScene` and `StudioLotScreen` consume the same selector and contain no first-match Stage
   7 authority;
9. physical polygon, physical status/problem, exact world blocker and semantic Stage A each enter
   the same eligible exact context;
10. same-production scenery continuation retains eligibility, while another production clears it;
11. default Studio Desk auto-selection, generic rail, person selection, Stage 12 and global
    Dashboard do not expose the detail action;
12. unrelated world selection, relocation, removal, release, duplicate/malformed replacement and
    authority loss clear eligibility without substitution;
13. exact accessible button copy names the current title and follows the existing world command;
14. field-exact latest-context comparison accepts a current render and rejects every independently
    changed field;
15. a stale Lot activation performs zero App navigation and focuses fresh context/neutral heading;
16. App independently re-reads current state, accepts only exact unique Stage 7 identity and opens
    Dashboard with the exact `focusProductionId`;
17. App rejection leaves the Lot mounted and every Engine/save byte unchanged;
18. Production Board focuses the unique target's command or status and falls back to its heading on
    missing or duplicate identity;
19. Board focus is array-order/title independent and does not alter command successor behavior;
20. direct Back with the same exact Stage 7 production restores fresh inspector data, semantic
    context, stable heading focus and delayed physical outline;
21. return after a Board command shows its fresh blocker/status/command successor, never cached
    pre-navigation facts;
22. removed, released, completed-away, relocated, replaced, duplicate, malformed and cross-studio
    return states land at the neutral Lot heading without selecting another production;
23. unrelated Dashboard child navigation demotes to `studio-home`; every other existing return path
    remains unchanged;
24. renderer/manifest/import failure retains complete semantic Stage A → Board → fresh-return
    parity;
25. delayed renderer ready, recreation, context loss, hidden-tab resume, reduced motion and modal
    suspension cannot restore stale identity or dispatch navigation;
26. pointer, double-click, Enter, Space, held-key and mixed input invoke App at most once and contain
    world down-events;
27. visible focus, live announcement, 44×44 target, forced-color and 200%-zoom behavior remain
    accessible;
28. 1920×1080, 1366×768, 1024×768, 960×540 and maximum-world-zoom layouts preserve the world-first
    action order;
29. handoff/Board/Back navigation is exact byte-neutral, while one intentionally accepted existing
    Board command yields its byte-identical established successor; and
30. no Core, GameState, SaveFile, schema, migration, adapter law, tuning, manifest, exporter, art,
    object, actor, texture, route, animation, draw or RNG behavior changes.

## 18. Ordinary-player browser acceptance

Using existing deterministic native Stage 7 and two-production authority:

1. enter the default Studio Lot without opening Dashboard;
2. select the physical Stage 7 production while Stage 12 or another operation also exists;
3. confirm the inspector names only the exact Stage 7 film and keeps its existing world command
   first;
4. invoke **Open Production Board details · <exact title>**;
5. confirm the exact unique Board card receives focus, not the first card or a same-title card;
6. optionally execute one existing Board command and observe only its authoritative successor;
7. use direct Back and recover the same production's fresh physical/semantic Stage 7 context;
8. repeat with no current command so status, not a missing control, owns Board focus;
9. repeat one return after the target leaves Stage 7 and require the neutral Lot heading with no
   replacement selection;
10. prove default desk and generic rail never expose the world-provenance-only action;
11. repeat the semantic path under renderer failure and with keyboard/reduced motion; and
12. inspect 960×540, maximum world zoom and 200% browser zoom with clean diagnostics and unchanged
    structural budgets.

The acceptance path must begin with world inspection. Opening Dashboard first, selecting a card,
and then returning to a highlighted stage does not satisfy this contract.

## 19. Proportional final verification

- both TypeScript projects;
- focused selector, Scene/View, StudioLotScreen, App return-context, Dashboard and Production Board
  tests;
- existing Soundstage Intervention, Scenery Load-In, Studio Home, publicity and Annex regression
  tests affected by shared focus/navigation paths;
- complete repository Vitest suite;
- governed D-16/D-17 suite;
- production build;
- focused Stage 7 handoff Chromium and complete Lot Chromium;
- byte-identical existing native fixture replay;
- exact manifest/exporter/art non-change hashes;
- structural renderer counters and the unchanged opt-in wall-clock gate; and
- independent strict authority/focus review plus visual review at the governed viewports.

No new full economy, facilities, construction or Week-208 corpus is proportional to this
presentation/navigation repair.

## 20. Keep / Kill boundary

Keep only if an ordinary player can explicitly inspect physical/semantic Stage 7, retain the
existing in-world command as the primary action, optionally open the exact unique current Board
card, and return to freshly revalidated exact Stage 7 truth without selecting a replacement or
changing simulation behavior.

Kill or narrow if implementation requires:

- exposing the link from default auto-selection, a generic production list or global Dashboard;
- moving an existing Stage 7 command into the Board or making the Board mandatory;
- matching by title, person, array position or first Stage 7 row;
- caching an operation/Board card across navigation instead of rebuilding fresh truth;
- restoring a replacement film when the exact ID leaves Stage 7;
- preserving a cross-studio ID collision;
- a new Core action, production rule, save field, adapter business law or UI-owned scheduler;
- a queue, staffing, redirect, cancellation, workload, facility-choice or pathfinding fiction;
- a new Lot route that weakens dedicated identity revalidation;
- a second mounted application/Lot tree or promise of same Phaser/camera persistence;
- Stage 12 art/content or any manifest/exporter/art/runtime-render change;
- any object, actor, texture, route, draw or decoded-memory increase; or
- relaxed accessibility, responsive, deterministic, exact-once or performance gates.

## 21. Governing economic residuals

This navigation/continuity repair changes no economic classification. The governing status remains
exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

The following remain explicitly open and are neither concealed nor reclassified:

- cash runaway;
- top-studio economic immortality;
- week-208 synchronized roster wall;
- P5 dominance;
- world-led variance;
- cheap-film purpose;
- premium-film purpose;
- remaining menu breadth; and
- formal G12 timing.

No financing, loans, bailouts, restructuring, failure ladder, arbitrary cash sink, facility tuning,
construction tuning, new facility candidate or macroeconomic certification follows from this
contract.
