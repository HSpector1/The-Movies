# World-First Soundstage Intervention V1 Contract

Status: **FROZEN AUTONOMOUS-MARATHON IMPLEMENTATION CONTRACT**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Authority base:

- Owner world-first product-direction ruling;
- accepted D-17B and its still-open macroeconomy residuals;
- Production Operations V1 contract `1c7a33a` and implementation `0ba1775`;
- accepted Operation Hollywood bridge `623b8b2` and marathon integration `4432a9b`;
- Development & Casting Annex compatibility authority `8b7e95e`;
- Dynamic People Role Atlas V1 runtime `66f856c` and closure `5146490`; and
- Week-208 research closure `21a3b85`, which authorizes no production repair.

## Purpose

Close the smallest proven break in the Owner's world-first critical experience test. A player who
sees a real Soundstage 7 production problem in the living lot must be able to click the physical
stage/problem, enter the exact existing Studio Desk command context, act, watch the named director
travel, and continue the same authoritative command chain until the stage visibly records.

The authoritative Production Operations chain already exists in the lot inspector. This slice does
not invent commands, a scheduler, or a second workflow. It gives the visible Stage 7 state spatial
identity and reuses the existing host dispatcher.

## Product interaction law

The bounded ordinary-player loop is:

```text
VISIBLE STAGE 7 PROBLEM
→ CLICK THE PHYSICAL STAGE / STATUS
→ EXACT PRODUCTION CONTEXT
→ EXISTING LEGAL COMMAND
→ NAMED DIRECTOR TRAVEL ACKNOWLEDGEMENT
→ FRESH ENGINE BLOCKER / READY / SCHEDULED TRUTH
→ CONTINUE ON THE SAME LIVE LOT
```

The Stage 7 building polygon, its visible state label/lamp, and a semantic DOM problem affordance
must all reach the same exact production context. When no managed production authoritatively owns
Soundstage 7, the physical building retains its existing place-inspection behavior and must not
invent a production.

The canvas is the primary visual pointer surface. It remains `aria-hidden` because a Phaser canvas
does not expose a reliable accessibility tree; this is not a claim that the world is decorative.
The React layer must provide an equivalent named, keyboard-operable action and remain the complete
renderer-failure path.

## Exact authority boundary

`StudioLotSnapshot` remains the only input to the scene. The scene may derive one selectable world
operation only by this exact predicate:

```text
snapshot.operationsMode === "managed"
&& snapshot.stageAssignmentAuthority === "engine"
&& operation.locationBuildingId === "stage-a"
```

It must use the same `authoritativeStage7Operation(snapshot)` result that already paints the stage
and routes the director. It may not select `productionOperations[0]`, fall back to another
production, infer from a person, borrow Soundstage 12, or retain a stale operation after a new
snapshot.

The narrow presentation event is:

```ts
export type HollywoodProductionSelection = {
  productionId: string
  locationBuildingId: 'stage-a'
}

export type HollywoodEvent =
  // existing event arms remain unchanged
  | { type: 'production'; production: HollywoodProductionSelection }

// StudioLotViewOptions forwards that arm without widening it:
onHollywoodProduction?: (production: HollywoodProductionSelection) => void
```

The event carries identity only. It carries no mutable `GameState`, command, blocker resolution,
task transition, clock, reservation mutation, or random result. The React host must revalidate the
full managed-mode + engine-authority + exact production-ID + Stage 7 predicate against its latest
snapshot before changing inspector context. A stale, legacy/presentation-authority, or otherwise
mismatched event is ignored.

Managed snapshots already pair `operationsMode: 'managed'` with
`stageAssignmentAuthority: 'engine'`; the explicit runtime predicate is retained as a fail-closed
guard. The adapter's exhaustive mapping of `facility-soundstage-07 → stage-a` and
`facility-soundstage-12 → stage-b` remains the upstream facility-identity authority. No raw
facility, slot, or workflow object widens the scene snapshot.

## Existing command chain — reuse, do not duplicate

The host continues to dispatch only `ProductionOperationsState.currentCommand` through the
existing `onProductionCommand` / `runProductionCommand` path. The exact sequence remains:

1. `assignShootingDirector` — Engine changes `unassigned → blocked`;
2. `clearSceneryLoadIn` — Engine changes `blocked → ready`;
3. `scheduleShootingTake` — Engine changes `ready → scheduled`; and
4. the existing weekly core tick, not animation, changes `scheduled → completed` and advances work.

Every accepted command replaces state through the existing host owner, yields a fresh snapshot,
and repaints the world. Illegal, rejected, or stale commands retain the established loud rejection
and byte-identical-state law. This slice adds no direct core-action call inside Phaser and no UI
shadow task.

For this lot path, the existing App command owner must return its current `ActionOutcome` (or
`undefined` when no state exists) after invoking `runProductionCommand`. `StudioLotScreen` calls it
exactly once. Success retains pending focus until the fresh successor snapshot; rejection clears
pending focus immediately, retains the current production selection, and exposes the exact error in
the existing live status surface. It must not retry or execute the command a second time.

Selecting the world problem must:

- clear unrelated person and generic-place inspector context;
- select the exact current Stage 7 production;
- expose its current task, blocker, status, and exact projected command;
- move keyboard focus to that command, or to persistent status when no command remains; and
- preserve the camera, lot mount, ambient life, and current simulation week.

The semantic DOM affordance invokes the same host context-selection function. It does not dispatch
a command merely because the problem was selected.

## Travel and visible-state law

The existing exact director route remains presentation acknowledgement of only an accepted
`unassigned → blocked` Engine transition. Route start, intermediate coordinates, facing, arrival,
and reduced-motion resolution cannot clear scenery, make a task ready, schedule a take, tick time,
reserve a facility, spend cash, or consume RNG.

Arrival copy must continue to say that Engine status is unchanged. A loaded `blocked`, `ready`,
`scheduled`, or `completed` snapshot paints directly without replaying travel. Only `scheduled`
may paint Hollywood's established `take-in-progress` visual. This does not change the generic
`LotScene` law, where its existing REC cue remains valid for scheduled or completed shooting.

This slice adds no Phaser display object, actor, texture, draw, or decoded texture cost. It makes
the existing Stage 7 polygon, lamp, and label interactive and may change the existing blocker
element from static copy to a semantic control.

That semantic problem control exists only when the current host snapshot passes the same managed +
engine-authority + exact `stage-a` predicate. A selected Stage 12 blocker remains truthful copy and
must never invoke, label itself as, or focus a Stage 7 selection.

## Identity and multi-production law

- With simultaneous Stage 7 and Stage 12 operations, the physical Stage 7 affordance always
  selects the production whose `locationBuildingId` is exactly `stage-a`, regardless of array order
  or prior UI selection.
- A Stage 12 production remains truthful in the Studio Desk/deep inspector, but the current district
  does not fabricate a Stage 12 cell, Stage 7 route, Stage 7 outline, or Stage 7 click target for it.
- Selecting a named person may select that person's real production, as already shipped, but never
  rewrites the physical Stage 7 identity.
- Snapshot replacement that removes or relocates the selected operation cannot leave its command
  under another film, person, or place.

The inspector distinguishes initial default context from an explicit selection. With no explicit
selection it prefers exact Stage 7; a single Stage 12 operation may remain honestly visible through
the existing fallback. Once an explicit production ID exists, failure to find that exact ID fails
closed: it clears pending focus and shows no other production by array fallback.

## Compatibility and non-regression boundary

This is a presentation/interaction slice. It changes no:

- core action, task transition, production phase, reservation, facility, capacity, or processing
  order;
- GameState or SaveFileV1–V11 schema, serialization, migration, or validation;
- D-17B publicity, awareness/reach, marketing, discoverability, economy, ledger, or reception rule;
- random draw, clock, weekly tick, or release result;
- Role Atlas asset, actor pool, route geometry, direction law, reduced-motion law, or fallback; or
- Annex construction lifecycle.

No new feature flag is introduced. The interaction exists whenever the already-governed Operation
Hollywood district exists. Legacy lot and legacy operations behavior remain intact.

## Required automated proof

At minimum, tests must prove:

1. the real Stage 7 building pointer path emits the exact identity-only production event;
2. the visible Stage 7 status affordance uses the same selection method;
3. absence of a managed Stage 7 operation preserves normal place behavior and invents no
   production;
4. Stage 12 alone emits no Stage 7 production event;
5. two productions in reversed order still select exact Stage 7 identity;
6. the host revalidates and ignores stale or mismatched selection events;
7. world selection clears unrelated person/place context and exposes/focuses the exact command;
8. the keyboard-operable DOM problem affordance reaches the same result;
9. the full existing `assignShootingDirector → clearSceneryLoadIn → scheduleShootingTake` chain
   still dispatches exact projected commands and announces scheduled status;
10. route arrival and reduced motion leave Engine task status unchanged;
11. loaded blocked/ready/scheduled/completed snapshots paint directly;
12. Stage 12 never borrows Stage 7 selection, route, or visual state; and
13. from an identical pre-state, the world-selected command is field-exact to snapshot
    `currentCommand` and produces a byte-identical `runProductionCommand` result to the Production
    Board path;
14. selection, camera, DOM-equivalent activation, and reduced motion preserve complete SaveFileV11
    and RNG bytes;
15. a successor command is legal and visible while the cosmetic route is still moving—arrival is
    never a legality gate and acting before arrival yields the same core result; and
16. rejection calls the command owner once, clears pending focus, surfaces the exact error, retains
    exact selection, and leaves the authoritative state byte-identical;
17. a same-ID event is ignored when the latest snapshot is legacy or uses presentation stage
    authority, and a Stage 12 blocker never invokes Stage 7 selection; and
18. focused tests, the complete repository suite, both TypeScript projects, production build, and
    the governed D-16/D-17 harness pass.

## Required live acceptance

Use an ordinary-player Hollywood session with a real managed production at Soundstage 7:

1. start from a visible `unassigned` Stage 7 problem;
2. click the physical stage/status, not a detached screen-first production selector;
3. verify the exact film, director, blocker, and `assignShootingDirector` command;
4. run it and visibly observe the named director route while the Engine task remains `blocked`;
5. click `clearSceneryLoadIn`, then `scheduleShootingTake` from the same live lot;
6. verify the stage paints scheduled/take-in-progress only after the Engine accepts that command;
7. reload the scheduled SaveFileV11 state and verify direct truthful repaint;
8. repeat selection in reduced motion, where travel resolves cosmetically and controls remain;
9. in a two-production fixture, select Stage 12 first, click physical Stage 7, and prove the exact
   Stage 7 film/command is selected while Stage 12 stays unchanged and never borrows the route;
10. run the successor clear command while the director is still travelling and prove route arrival
    was not a legality gate;
11. exercise the semantic keyboard affordance and renderer-failure companion path; and
12. inspect at 1280×720, 1366×768, 1440×900, 1920×1080, maximum zoom, and the 125%-equivalent
    compact viewport with zero console errors, zero console warnings, zero failed requests, and no
    unreachable control. A forced renderer boot/import rejection must retain semantic Stage 7
    selection and the exact Studio Desk command path.

Re-measure the existing 240-frame raw post-warm-up Hollywood telemetry at 1920×1080. Keep requires
average FPS ≥50, 1%-low FPS ≥30, p99 frame ≤33.4 ms, worst sampled frame ≤33.4 ms, one renderer
draw, 33 display objects, 15 dynamic actors, and the unchanged 11,096,896-byte decoded texture
total.

## Keep / kill gate

Keep only if a player can begin from the visible Stage 7 problem, reach the exact existing legal
chain, observe travel without confusing it for task authority, and see fresh Engine truth resume
work while remaining on the live lot. Kill or revise if the implementation selects by array order,
borrows Stage 12, embeds a command in a scene event, advances work from animation, obscures keyboard
equivalence, fabricates state, or materially damages the accepted district performance/readability.

## Explicitly outside V1

- making the Studio Lot the default startup/load/restore route;
- keeping Phaser mounted behind every deep management surface;
- persistent camera/selection across every deep-panel handoff;
- an authored Soundstage 12 district cell or route;
- new production tasks, manual calendars, priority scheduling, or people autonomy;
- unrestricted building interiors, character control, needs, relationships, or pathfinding;
- construction placement/catalogues, upgrades, maintenance, or new operating costs; and
- any repair to cash runaway, top-studio immortality, Week-208 roster synchronization, or another
  accepted D-17B residual.

Those remain forward world-first milestones. They are not grounds to inflate or block this exact
Stage 7 intervention slice.
