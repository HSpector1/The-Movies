# World-First Live Week Advance V1 Contract

> **PF1-M3 SUPERSESSION NOTE (2026-08-18):** the literal announcement copy pinned below
> ("Week <N>. Studio Lot updated.") is superseded by the PF1 editorial voice — the shipped
> string is now "Week <N> on the lot." (PROFESSIONAL-FLOOR-V1-CHARTER.md §3/§5-M2; the
> region was also promoted from visually-hidden to a visible notice at PF1-M2). The
> STRUCTURAL contract — exactly one status announcement per advance, same region, same
> role/aria-live/aria-atomic/testid — is unchanged and remains binding.

Status: **FROZEN AUTONOMOUS-MARATHON IMPLEMENTATION CONTRACT**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Authority base:

- Owner world-first product-direction ruling;
- accepted D-17B and its still-open macroeconomy residuals;
- Studio Calendar V1 closure `b7361b6`;
- Development & Casting Annex compatibility authority `8b7e95e`;
- accepted Operation Hollywood bridge `623b8b2` and marathon integration `4432a9b`;
- World-First Soundstage Intervention V1 contract `001c692`, implementation `c48f8ac`, and
  closure `6419452`; and
- the existing App-owned `advanceWeek` path and Engine tick authority at this contract's parent
  `6419452`.

## Purpose

Close the next observed break in the Owner's world-first critical experience. A player who has
prepared and scheduled a real Soundstage 7 take must not leave the living Studio Lot merely to
advance the one authoritative week that records it. The lot becomes a real simulation surface:
the player advances time there, watches fresh Engine truth repaint the same mounted world, and
continues acting without a screen-first detour when no release legitimately needs a deep result.

This slice reuses the existing one-week adapter and App result routing. It does not add another
clock, autoplay, a renderer tick, or a presentation-owned simulation.

## Product interaction law

The bounded ordinary-player loop is:

```text
SCHEDULED TAKE / LIVE STUDIO STATE
→ ADVANCE ONE WEEK FROM THE LOT
→ EXACTLY ONE EXISTING ENGINE TICK
→ FRESH WEEK / CASH / WORK / PEOPLE / FACILITY TRUTH
→ SAME MOUNTED LOT WHEN NO FILM RELEASES
→ LEGITIMATE RELEASE SURFACE WHEN A FILM RELEASES
→ RETURN TO THE LOT THAT INITIATED THE WEEK
```

The visible control is a native semantic button labelled `Advance one week` in the lot topbar.
It remains keyboard-operable and usable when Phaser fails to load. It emits one intent to App and
contains `pointerdown`, `mousedown`, and `touchstart` so the global renderer cannot interpret the
same physical input as a world selection.

Phaser receives no clock callback, imports no Engine action, and derives no week transition.
`GameState → studioLotSnapshot(state) → StudioLotView.setSnapshot(...)` remains the only repaint
path.

## One authoritative clock

`ui/src/engine/adapter.ts::advanceWeek(state)` remains the sole one-week owner. It already calls
the core tick once with development enabled and returns:

```ts
{
  preTick: GameState
  next: GameState
  released: FilmResult[]
  constructionCompletion: ConstructionCompletionSummary | null
}
```

One activation of the lot button invokes that adapter exactly once from the current App-owned
pre-state, replaces App state exactly once with `next`, and never re-ticks on render, focus, route,
animation, renderer readiness, or snapshot delivery. The resulting full state, RNG stream, ledger,
and SaveFileV11 bytes must be identical to calling the existing adapter once on the same pre-state.

The lot may deliberately advance while a production decision is pending. This matches the existing
Dashboard law: time, costs, and holds continue according to Engine authority. The control must not
invent a UI-only legality restriction.

## Exact origin and return context

Return origin is UI navigation state, never GameState or save data. Use an explicit discriminated
context carried by every tick-generated release-chain surface:

```ts
type StudioReturnContext =
  | { kind: 'dashboard' }
  | {
      kind: 'lot'
      focus: 'advance-week'
      suppressOperationalAnnouncement: boolean
    }
```

Do not infer origin from `newspaper.source`, the current route, a global boolean, a module-level
flag, or the presence of a Gazette view. Dashboard releases and lot releases both use
`source: 'release'`; only the explicit context distinguishes their final destination.

The `release` and `newspaper` Screen variants carry `returnContext`. Any `autopsy` opened from those
surfaces carries the same context. Dashboard-opened autopsies, chronicles, and historic clippings
carry `{ kind: 'dashboard' }`. A historic clipping remains a Dashboard-origin artifact even when
its film once released during a lot session.

The routing matrix is binding:

| Origin and result | First post-tick surface | Continue / Back destination |
| --- | --- | --- |
| Dashboard, no release | Existing ReleaseResult | Dashboard |
| Lot, no release | Same mounted Studio Lot | Already on lot |
| Dashboard, release with Gazette | Newspaper → ReleaseResult | Dashboard |
| Lot, release with Gazette | Newspaper → ReleaseResult | Studio Lot |
| Dashboard, release without Gazette | ReleaseResult | Dashboard |
| Lot, release without Gazette | ReleaseResult | Studio Lot |
| Lot release → Autopsy | Existing Autopsy | Studio Lot |
| Historic clipping | Existing Newspaper path | Dashboard |
| Sim to next event | Existing Dashboard-origin path | Existing destination |

The post-tick branch tests `released.length > 0` before considering a same-lot return. A real
release without an eligible newspaper must still open ReleaseResult. `newspaperReleases.length`
decides only whether Newspaper precedes ReleaseResult; it never decides whether a release occurred.

## Same-world continuity and transient feedback

For a lot-origin week with no release, App does not call `setScreen`: `screen.kind === 'lot'`
remains untouched while a separate App-owned transient feedback value is passed to the mounted
host. It is structurally equivalent to:

```ts
type LotAdvanceFeedback = {
  week: number
  constructionCompletion: ConstructionCompletionSummary | null
}
```

The `week` is the exact post-tick Engine week. The payload is UI-only, absent on ordinary lot entry,
replaced on each later lot advance, explicitly cleared whenever the lot is left or freshly entered,
and never serialized. React must keep the existing `StudioLotScreen` and `StudioLotView` instances
mounted for this non-release path. The view receives the fresh authoritative snapshot once through
the existing state effect; it is not destroyed/recreated to show a new week.

Mounted continuity includes the current camera, selected building, exact production/person/place
context where that identity remains present, reduced-motion mode, review mode, and renderer-failure
fallback. Existing fail-closed identity law still applies: an entity removed by the new snapshot
does not leave stale commands or borrow another production.

An ordinary no-release update exposes one polite atomic message:

```text
Week <N>. Studio Lot updated.
```

It appears only for a real lot-origin advance and is suppressed when a construction-completion
notice owns the announcement. Initial lot entry must not fabricate an advance message.

## Construction completion and announcement ownership

`ConstructionCompletionSummary` from the exact adapter result is the only completion event
authority. The lot must not infer a new completion from an already-operational building.

- Lot, no release, no completion: same lot + ordinary week update.
- Lot, no release, completion: same lot + the existing `ConstructionCompletionNotice` with exact
  copy and focus ownership.
- Any release with Newspaper: Newspaper owns the completion once; ReleaseResult receives `null`.
- A release without Newspaper: ReleaseResult owns the completion once.
- Continue/Back to the lot never repeats the completion item.

The existing hidden `lot-annex-operational-announcement` remains valid when a player newly opens an
already-operational lot. When the mounted lot itself receives the exact completion event, that
generic operational announcement yields for the rest of that mount so it cannot duplicate the
completion immediately or one week later.

If release surfaces unmount the lot during the same completion tick, App changes the lot return
context to `suppressOperationalAnnouncement: true` and carries it through every intervening release
and Autopsy surface. The immediate returned lot mount must therefore suppress the generic
Operational announcement for its whole mount as well. Only after the player later leaves that lot
and opens it through an ordinary fresh navigation, with no suppression context, may the accepted
persisted-state announcement run again.

## Focus and accessibility law

- On an ordinary no-release advance, the same native button node remains mounted and retains focus
  naturally. Do not force focus after every state update.
- On a no-release construction completion, `ConstructionCompletionNotice` owns focus.
- On a lot-origin release, Newspaper keeps its existing title focus. If no Newspaper is eligible,
  or when Newspaper continues to ReleaseResult, the first release heading receives focus; an exact
  construction completion still takes precedence.
- When a release/deep-result chain returns to a newly mounted lot, focus moves once to
  `Advance one week` via the explicit lot return context.
- Initial Dashboard → Lot navigation does not steal focus to the advance control.
- The week-update and completion live regions never announce simultaneously.
- Keyboard activation, pointer activation, reduced motion, and renderer failure all invoke the
  same App intent exactly once.

The button stays in the React host. It is not painted only on canvas, duplicated in a Phaser event,
or hidden behind development/review flags.

## Release and autopsy exactness

The current `handleAdvance` release work remains authoritative and order-preserving:

1. call `advanceWeek(preState)` once;
2. derive release development by comparing immutable `preTick` and `next`;
3. replace App state with `next` once;
4. retain one exact session snapshot for every released film;
5. derive eligible Newspaper views from the post-tick state;
6. give the first post-tick surface the one-time completion item; and
7. carry the explicit return context through Newspaper, ReleaseResult, and Autopsy.

Lot-origin routing may not lose or recompute the pre-release snapshot, standing, film ordering,
development result, Gazette eligibility, career impact, same-week release grouping, or session-only
autopsy availability. Opening and backing out of an Autopsy may leave the release chain just as the
existing Dashboard path does; its return destination changes, not its evidence.

## Compatibility and non-regression boundary

This is an App/React interaction slice. It changes no:

- core tick, development, production task, phase, release, theatrical, reservation, construction,
  facility, capacity, ledger, or processing rule;
- adapter result, random draw, clock cadence, or deterministic ordering;
- GameState or SaveFileV1–V11 schema, serialization, validation, or migration;
- D-17B publicity, awareness/reach, marketing, discoverability, economy, or reception rule;
- StudioLotSnapshot schema or authority;
- Phaser scene, actor, texture, route, camera, display-object, draw, or decoded-byte budget;
- Dashboard Advance or Sim-to-next-event behavior; or
- Development & Casting Annex start-action ownership.

No new feature flag is introduced. The lot control exists wherever the already-governed Studio Lot
exists. The generic lot, Hollywood lot, reduced-motion path, and renderer-failure companion all
retain it.

## Required automated proof

At minimum, tests must prove:

1. `Advance one week` is a native button and one click or keyboard activation emits one App intent;
2. the button contains pointer, mouse, and touch down families so none escapes to the world;
3. a real no-release lot activation advances the Engine week exactly one, replaces state once, and
   produces complete state/RNG/SaveFileV11 bytes identical to direct `advanceWeek(pre).next`;
4. the same renderer instance remains mounted, is not destroyed, and receives one fresh snapshot;
5. the same view instance records no destroy, reset, or camera-preset call while valid
   selection/production/person context persists; camera framing is compared before/after in live
   acceptance rather than widening the production debug API;
6. a scheduled Stage 7 task becomes completed/next-phase truth only after the authoritative tick;
7. ordinary button focus persists and exactly one `Week <N>. Studio Lot updated.` status appears;
8. construction progress repaints exact weekly progress and the exact completion appears once,
   owns focus, suppresses ordinary/generic duplicate announcements, and consumes no extra tick;
9. renderer construction/import failure retains and executes the same semantic advance action;
10. advancing while the renderer import is still pending is never lost: when the renderer becomes
    ready, its final painted snapshot is the latest post-tick state rather than constructor-time
    stale state;
11. reduced motion changes no state, RNG, route result, focus priority, or advance availability;
12. a lot-origin release with Newspaper follows Newspaper → ReleaseResult → lot;
13. a lot-origin release without Newspaper still follows ReleaseResult → lot;
14. lot-origin Newspaper and ReleaseResult Autopsy paths return to lot with exact session evidence;
15. release plus construction completion displays the item on only the first deep surface and never
    repeats it on ReleaseResult or the returned lot;
16. the immediate lot return from that completion tick suppresses the generic Operational live
    announcement, while a later ordinary fresh lot entry may announce persisted operational state;
17. two deliberate sequential activations consume the freshly rendered current state and produce
    exactly two sequential Engine ticks, never two copies of the same pre-state or an effect replay;
18. Dashboard Advance, Dashboard release/no-release routing, historic clippings, and Sim to next
    event remain byte- and destination-compatible;
19. no test observes a Phaser clock callback, a second tick per activation, a UI-authored state
    mutation, or a SaveFile schema change; and
20. focused tests, the complete repository suite, both TypeScript projects, production build, and
    the governed D-16/D-17 harness pass.

## Required live acceptance

Use ordinary-player browser sessions and real authoritative states. Before acceptance, commit a
reproducible SaveFileV11 fixture (or a deterministic public-authority generator plus its generated
fixture) for every exact pre-state that is reset and replayed. Record its seed/action recipe and
SHA-256; do not rely on browser storage or narrative evidence from an earlier session.

1. import the reproducible Week-30 scheduled *Nights of Watchtower* fixture, select Stage 7, and
   record the current camera/context;
2. activate `Advance one week` from the lot and verify Week 31 appears after exactly one tick;
3. verify `Shooting beat completed`/fresh successor truth in the same mounted lot without a
   Dashboard or empty ReleaseResult detour, with the button still focused;
4. restore the byte-identical Week-30 fixture, repeat by keyboard, and verify the same result and
   announcement;
5. advance active Annex construction on the lot and verify exact progress, then its completion
   notice, focus, and single-announcement law;
6. advance a real release from the lot, follow Newspaper/ReleaseResult, open Autopsy where
   available, and verify each governed Continue/Back path returns to the lot with focus on
   `Advance one week`;
7. in an isolated fault-injection browser session, use a temporary Vite rule that rejects only the
   dynamic `StudioLotView.ts` import and disables the development overlay; prove the semantic
   control still advances one week, then remove the temporary rule;
8. repeat the bounded control in reduced motion; and
9. inspect 1280×720, 1366×768, 1440×900, 1920×1080, maximum zoom, and 1536×864 as the
   125%-equivalent compact viewport with zero console errors, zero console warnings, zero failed
   requests, and no unreachable topbar action. At 1920×1080, retain average FPS ≥50, 1%-low FPS
   ≥30, p99 and worst sampled frame ≤33.4 ms, one renderer draw, 33 display objects, 15 dynamic
   actors, and the exact 11,096,896-byte decoded texture total.

The live proof must inspect actual week, cash, stage/task, construction, and release surfaces. A DOM
button existing without an authoritative transition is not acceptance.

## Keep / kill gate

Keep only if the player can record the scheduled take by advancing one authoritative week from the
lot, see fresh work truth in the same mounted world when no release occurs, and return to that lot
after a legitimate release surface. Kill or revise if the implementation double-ticks, recreates
the renderer on an ordinary week, hides a release, loses autopsy evidence, duplicates completion,
breaks Dashboard routing, makes Phaser authoritative, or turns the control into decorative UI.

## Explicitly outside V1

- autoplay, pause/speed controls, Sim to next event from the lot, or a second game clock;
- making the Studio Lot the default startup/load/restore route;
- keeping Phaser mounted behind Newspaper, ReleaseResult, Autopsy, or Chronicle;
- exact camera/person/place restoration after those legitimate deep-surface unmounts;
- origin-aware return wiring for every pre-existing lot destination;
- starting Annex construction, construction placement, catalogues, upgrades, maintenance, or new
  operating costs from the lot;
- new production tasks, facility queues, people autonomy, needs, relationships, or pathfinding; and
- any repair to cash runaway, top-studio immortality, Week-208 roster synchronization, P5 dominance,
  world-led variance, cheap/premium-film purpose, menu breadth, or formal G12 timing.

Those remain forward world-first or economic milestones. They are not grounds to inflate or block
this exact continuous-week slice.
