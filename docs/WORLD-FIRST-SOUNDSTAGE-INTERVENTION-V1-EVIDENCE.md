# World-First Soundstage Intervention V1 Evidence

Status: **FINAL AUTONOMOUS-MARATHON EVIDENCE**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `001c692936ced596d4df74c2414fd9d3a6bd28e1`

Implementation authority: `c48f8acd95eb7de5ba4114d92c8d8ef1ef1a949d`

## Result

The retained implementation closes the first bounded world-first production loop. A real managed
Soundstage 7 problem is now selectable from the physical stage polygon, its lamp/status, the visible
problem control, or the semantic Stage A companion. Every path resolves the exact latest
Engine-owned production identity and enters the existing Studio Desk command chain without leaving
or remounting the lot.

The scene emits identity only. `StudioLotScreen` revalidates managed mode, Engine stage authority,
exact production ID, and exact `stage-a` location against the latest snapshot. Commands remain the
existing `ProductionOperationsState.currentCommand` values and run once through the App-owned
`runProductionCommand` dispatcher. Phaser never owns task legality, completion, time, cash,
facilities, reservations, save state, or RNG.

## Exact implementation surface

The implementation commit changes exactly:

- `ui/src/App.tsx`;
- `ui/src/lot/StudioLotScreen.tsx`;
- `ui/src/lot/StudioLotView.ts`;
- `ui/src/lot/hollywood/HollywoodScene.ts`;
- `ui/src/lot/lot.css`;
- `ui/src/lot/StudioLotScreen.test.tsx`;
- `ui/src/lot/StudioLotView.hollywood.test.ts`; and
- `ui/src/lot/hollywood/HollywoodScene.test.ts`.

No core, action, tick, save, migration, economy, facility, reservation, reception, publicity,
construction, asset, or RNG source changed.

## Automated contract matrix

The final focused gate contains 55 tests across the three exact lot files. Existing tests in those
files remain part of the gate; the rows below identify the new or directly governing proof.

| Contract item | Proof |
| --- | --- |
| 1–2 | `HollywoodScene.test.ts` routes the Stage 7 polygon, lamp, and status through one exact identity-only selector. |
| 3–4 | Scene tests preserve ordinary place selection with no managed Stage 7 operation and refuse to borrow Stage 12. |
| 5 | Reversed Stage 12/Stage 7 order still selects exact Stage 7 from the latest snapshot. |
| 6 | `StudioLotScreen.test.tsx` rejects stale, legacy, presentation-authority, relocated, and removed identities. |
| 7–8 | World event, semantic problem button, and Stage A companion clear unrelated context, expose the exact command, and transfer focus. |
| 9 | The real Engine-backed command/focus test retains `assignShootingDirector → clearSceneryLoadIn → scheduleShootingTake → scheduled`. |
| 10–11 | Scene tests prove route arrival and reduced motion do not change task authority, and blocked/ready/scheduled/completed snapshots paint directly. |
| 12 | Scene and host tests keep Soundstage 12 truthful without a Stage 7 route, click target, outline, or borrowed state. |
| 13 | The world-selected command is field-exact to the Production Board command and produces byte-identical `runProductionCommand` output. |
| 14 | Camera, semantic selection, and reduced-motion controls preserve complete SaveFileV11 and RNG bytes. |
| 15 | A real Engine successor `clearSceneryLoadIn` command remains legal while the cosmetic route is moving and yields the same result without the scene. |
| 16 | A rejected command calls its owner once, preserves exact selection and state bytes, announces the exact error, and clears pending focus. |
| 17 | Same-ID events fail closed outside managed/Engine authority; a Stage 12 blocker remains static truthful copy. |
| 18 | Focused, full repository, D-16/D-17, TypeScript, production-build, and diff gates all pass. |

The renderer-construction rejection test retains the semantic Stage 7 problem, exact Studio Desk
command, and normal companion destinations. Input-containment tests cover `pointerdown`,
`mousedown`, and `touchstart`; the scene separately rejects any pointer whose native target is not
the actual Phaser canvas.

## Ordinary-player live acceptance

A recovered managed studio (`marathon-annex-play`) was played through the visible UI in Chromium:

1. *Nights of Watchtower* was greenlit in Week 26 with Estelle Delgado as director.
2. The lot visibly repainted Development, Rehearsal, and the Week-30 Soundstage 7 shooting problem.
3. Clicking the physical Stage 7 alert selected *Nights of Watchtower* and focused the exact
   `Call Estelle Delgado to Soundstage 7` command without opening a detached operations screen.
4. The accepted command changed the Engine task to `blocked` and visibly dispatched Estelle. Route
   motion did not gate the fresh `Clear scenery load-in` command.
5. The player cleared scenery, received `ready`, scheduled the take, and saw `TAKE SCHEDULED` plus
   the existing take equipment only after the Engine accepted `scheduleShootingTake`.
6. SaveFileV11 was copied from Export to Import with ordinary keyboard selection/copy/paste, loaded,
   and repainted the exact Week-30 scheduled state without replaying travel.
7. The next Engine week changed the task to `completed` and the lot reported `Shooting beat
   completed` in Week 31.

The first live pass also exposed a real browser defect: clicking the over-canvas Studio Desk command
could be seen by Phaser's window-level `mousedown` listener, selecting Administration beneath the
overlay before React received `click`. The retained repair contains all down-event families at every
Hollywood over-canvas surface changed by this slice and makes scene stage/place/person hits, wheel
handling, and drag start fail closed unless `pointer.event.target === game.canvas`. The same command
path was replayed successfully after the repair, and a clean recovered Week-31 tab selected Estelle
from the overlay without any underlying building activation.

### Viewport and performance matrix

| View | Sustained result |
| --- | --- |
| 1280×720 | 180 FPS average; 145 FPS 1%-low; 6.9 ms p99; 7 ms worst |
| 1366×768 | 180 FPS average; 145 FPS 1%-low; 6.9 ms p99/worst |
| 1440×900 | 180 FPS average; 143 FPS 1%-low; 7 ms p99/worst |
| 1920×1080 | 180 FPS average; 143 FPS 1%-low; 7 ms p99/worst |
| 1536×864, 125%-equivalent | Same governed pass; all world and desk controls reachable |
| Maximum zoom | Human-story view remained readable and controllable with the operating panels intact |

Every measured Hollywood frame retained 33 display objects, 15 dynamic actors, one renderer draw,
10.6 MB decoded textures, and the 281 KB role atlas. The exact decoded total remains 11,096,896
bytes. A one-frame resize transient was excluded by the contract's existing warm-up law; the raw
post-warm-up rolling window returned to 7 ms worst.

A fresh final-candidate browser tab recovered Week 31 and repeated all five governed viewports. Each
retained the film, named-person controls, Studio Desk, and return action with an empty browser
warning/error list. The page inventory observed 119 loaded resources; all five discovered image
assets re-fetched successfully with zero failures. No runtime asset/render fallback or failed
request surfaced in the clean matrix.

The same clean tab also exercised the keyboard-only semantic companion: focus was placed on
`Stage A Active: Nights of Watchtower — Shooting` and `Enter` activated it. The exact Week-31 film
and `Shooting beat completed` Engine status remained selected in the live lot, the Stage A control
became active, no navigation occurred, and the browser log remained free of warnings and errors.

### Live adversarial permutations

A second authentic SaveFileV11 fixture was built exclusively through public founding, signing,
managed-studio, greenlight, and weekly-advance actions. It carried two simultaneous Week-4 shooting
operations with disjoint talent:

- *The Wild Impresario* — Soundstage 7, Gloria Reyes, `unassigned`; and
- *The Hollow Escapement* — Soundstage 12, Franchot Sterling, `unassigned`.

The save was imported through the visible player UI into isolated live-browser sessions:

1. A browser-level reduced-motion preference produced the real `lot-reduced-motion` player path.
   Stage 12 was selected first; clicking the physical Stage 7 status then selected *The Wild
   Impresario*, focused Gloria's exact command, resolved only her cosmetic travel, retained the
   `blocked` Engine task, and exposed `Clear scenery load-in`. Controls and both productions stayed
   reachable; browser warnings/errors were empty.
2. In normal motion, the player called Gloria and invoked `Clear scenery load-in` 538 ms later,
   before any arrival copy appeared. The Engine accepted `ready`, exposed `Schedule the shooting
   take`, and cancelled the obsolete cosmetic route. Arrival was demonstrably not a legality gate;
   browser warnings/errors were empty.
3. An isolated Vite proof server intentionally rejected only the dynamic
   `StudioLotView.ts` renderer import with its development error overlay disabled. The player-facing
   fallback retained the exact Studio Desk, every semantic destination, and Stage A problem. The
   player activated Stage A and called Gloria; the real Engine task changed to `blocked` and the
   successor command remained available despite no canvas.

The intentional import rejection is the expected fault injected by item 3 and is not included in
the zero-failure clean viewport matrix. Together with the automated byte-neutrality and malformed-
authority tests, the live result proves the retained interaction does not depend on animation,
array order, renderer success, or a hidden second workflow.

## Final verification

| Gate | Result |
| --- | --- |
| Focused lot gate | **PASS — 3/3 files, 55/55 tests** |
| Complete repository suite | **PASS — 157/157 files, 1,897/1,897 tests** |
| Governed D-16/D-17 harness | **PASS — 10/10 files, 176/176 tests** |
| Root and UI TypeScript | **PASS** |
| Production build | **PASS — 132 modules transformed** |
| `git diff --check` | **PASS** |
| Independent strict review | **No P1–P3 findings** |

The production build retains the pre-existing large-chunk advisory. The lot remains lazy-loaded;
the advisory is not a Soundstage Intervention correctness failure.

## Neutrality and open boundaries

This slice intentionally changes presentation interaction: physical Stage 7 identity can now select
and act through the already-shipped command owner. It changes no authoritative result. Complete
SaveFileV1–V11 schemas and migration remain frozen. Selection, camera, reduced motion, route,
semantic activation, and renderer failure consume no RNG and write no GameState.

The accepted D-17B macroeconomy residuals remain open exactly as governed. No financing, loan,
bailout, restructuring, failure ladder, arbitrary cash sink, roster-wall repair, or economic
certification was introduced.
