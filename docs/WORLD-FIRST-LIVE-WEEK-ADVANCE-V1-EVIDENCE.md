# World-First Live Week Advance V1 Evidence

Status: **FINAL AUTONOMOUS-MARATHON EVIDENCE**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `3391528d7dedc45e24166599cf145a4358574a12`

Implementation authority: `621e7e139456ae21dd0dd420bf8fcaf16af1f454`

## Result

The retained implementation closes the next bounded break in continuous world play. A player can
now activate one native `Advance one week` action from the Studio Lot, invoke the existing
App-owned Engine advance exactly once, and see the fresh authoritative week, cash, production,
person, facility, construction, and event truth repaint the same mounted world when no film
releases.

A real release is not hidden to preserve the lot. Newspaper, ReleaseResult, and session Autopsy
remain the legitimate deep result surfaces, carry an explicit origin context, and return to the lot
that initiated the week. Dashboard-origin routes remain Dashboard-origin routes. Phaser receives
snapshots and emits no clock, tick, GameState mutation, or release decision.

This is a direct world-first gameplay change, not a second simulation. The ordinary loop is now:

```text
SCHEDULE A REAL TAKE ON THE LOT
→ ADVANCE ONE AUTHORITATIVE WEEK IN WORLD
→ WATCH FRESH ENGINE TRUTH REPAINT
→ KEEP THE SAME LIVE LOT WHEN NO RELEASE REQUIRES A DEEP RESULT
→ RETURN TO THE INITIATING LOT AFTER A LEGITIMATE RELEASE SURFACE
```

## Exact implementation surface

Implementation commit `621e7e1` changes exactly 18 files:

- `scripts/gen-live-week-advance-fixtures.mts`;
- `ui/e2e/live-week-advance-v1/manifest.json`;
- `ui/e2e/live-week-advance-v1/week-11-annex-progress-then-completion.save.json`;
- `ui/e2e/live-week-advance-v1/week-12-annex-completion-next.save.json`;
- `ui/e2e/live-week-advance-v1/week-12-release-annex-coevent-next.save.json`;
- `ui/e2e/live-week-advance-v1/week-30-nights-of-watchtower-stage-7-scheduled.save.json`;
- `ui/src/App.tsx`;
- `ui/src/lot/StudioLotIdentityReview.test.tsx`;
- `ui/src/lot/StudioLotScreen.import-race.test.tsx`;
- `ui/src/lot/StudioLotScreen.test.tsx`;
- `ui/src/lot/StudioLotScreen.tsx`;
- `ui/src/lot/WorldFirstLiveWeekAdvance.test.tsx`;
- `ui/src/lot/authored-stage-a-wiring.test.tsx`;
- `ui/src/lot/d1b-assignment-lifecycle.test.tsx`;
- `ui/src/lot/d1b-soundstage-wiring.test.tsx`;
- `ui/src/lot/lot.css`;
- `ui/src/screens/ReleaseResult.tsx`; and
- `ui/src/screens/studio-development-ui.test.tsx`.

The runtime source change is bounded to App/React routing, focus, transient feedback, responsive
layout, and the existing ReleaseResult presentation. No core tick, Engine action, adapter result,
GameState/SaveFileV1–V11 schema, migration, economy, publicity, awareness/reach, production,
facility, reservation, construction rule, RNG draw, Phaser scene, texture, actor, display object,
or renderer draw-budget source changed.

## Reproducible SaveFileV11 fixtures

The committed generator builds every live pre-state through public Engine actions and existing UI
adapter action boundaries. Every fixture imports as native SaveFileV11 with `converted: false`,
round-trips byte-identically through `exportSaveJson` / `importSaveJson`, and produces its declared
successor through one normal `advanceWeek` call.

| Fixture | Bytes | SHA-256 | Exact purpose |
| --- | ---: | --- | --- |
| Week 30 — *Nights of Watchtower*, Stage 7 scheduled | 227,429 | `e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b` | One tick to Week 31 completed successor truth. |
| Week 11 — Annex progress | 220,812 | `ffc443f9fb3a75ec9f79be967600bb94933c9dacdd0b4f0bee878c37cdbd03ac` | Week 12 remains Building at 12/13; Week 13 completes. |
| Week 12 — Annex completion next | 220,793 | `63669586ad8f0256ac165a5141b8dd770dadc68840c3e69a31f9abc8b72ab712` | Isolated one-tick completion and announcement replay. |
| Week 12 — *House of Cipher* release + Annex co-event | 224,835 | `c7f03299b75e9d1c0a99bb3a47abdccfa1d854f33b29f2c72902c74ed41d64f2` | Gazette, ReleaseResult, Autopsy, completion ownership, and return context. |

Generator: `scripts/gen-live-week-advance-fixtures.mts`

Replay command: `node_modules/.bin/vite-node scripts/gen-live-week-advance-fixtures.mts`

Manifest SHA-256:
`3f06eb81957c5f49fa5be3b8b0d3239e9c3305426b266be19ac5bf224b24905e`

The final replay reported all four fixtures and the manifest `unchanged` at the exact committed
byte lengths and hashes.

## Automated contract matrix

| Contract item | Proof |
| --- | --- |
| 1–3 | The native button contains pointer/mouse/touch down events; pointer and `Enter` activation each produce one App intent and field-/byte-exact parity with direct `advanceWeek(pre).next`, including RNG and SaveFileV11. |
| 4–6 | The no-release path retains one renderer/view instance, makes no destroy/reset/camera-preset call, delivers one fresh snapshot, preserves valid person/production selection, and records Stage 7 only after the Engine tick. |
| 7–8 | Ordinary focus and one atomic week status persist; exact Annex progress/completion uses one tick, one focus owner, and no ordinary or generic duplicate announcement. |
| 9–10 | Renderer construction/import rejection retains the semantic action; a delayed import constructs from the latest post-tick snapshot rather than stale mount-time state. |
| 11 | Reduced motion preserves exact state, RNG, route, focus priority, and action availability. |
| 12–16 | Gazette and non-Gazette releases route correctly; exact Newspaper/ReleaseResult/Autopsy evidence survives; completion appears only on the first deep surface; immediate lot return suppresses duplicate Operational copy; later fresh entry restores it. |
| 17 | Two deliberate activations consume the freshly rendered state and produce exactly two sequential ticks. |
| 18 | Dashboard Advance, Dashboard release/no-release routing, historic clippings, and Sim-to-next-event destinations remain compatible. |
| 19 | Architecture tests observe no Phaser clock callback, second tick, presentation-authored GameState mutation, or save-schema change. |
| 20 | Focused, complete-repository, governed D-16/D-17, TypeScript, production-build, deterministic-fixture, diff, and independent-review gates pass. |

## Ordinary-player live acceptance

### Scheduled Soundstage 7 take

The exact committed Week-30 `marathon-annex-play` fixture was loaded through the visible save UI at
1920×1080. The lot showed *Nights of Watchtower*, Estelle Delgado, Shooting, Soundstage 7 +
Scenery Shop, and `Take scheduled`.

Pointer activation of `Advance one week` produced Week 31, one
`Week 31. Studio Lot updated.` announcement, and fresh `Shooting beat completed` truth. The lot
kept the same camera, Stage A production context, renderer, and focused button. It opened neither
Dashboard nor an empty ReleaseResult. Named-person selection continuity is proven separately by the
exact automated host/App gate.

### Keyboard acceptance exception

The browser controller's keyboard primitive focused the native button but did not synthesize its
`Enter` activation in the live page. Required live item 4 is therefore recorded as a tooling
exception, not claimed as a physical-browser pass. The product path is covered by the same native
button semantics and the passing `userEvent.keyboard('{Enter}')` test, which proves one exact Engine
tick, complete state/RNG/SaveFileV11 parity, the same mounted view, and the same
focus/announcement result. No alternative programmatic click was misreported as keyboard evidence.

### Annex progress and completion

The committed Week-11 fixture began at 11/13 advances complete. The first lot tick reached Week 12,
repainted exact 12/13 Building progress, retained the same world, and showed no premature
completion. The second reached Week 13 and displayed the exact focused completion notice:

> Development & Casting Annex is Operational in Week 13. One shared Development & Casting slot
> is now available.

The ordinary week status and generic already-Operational live region yielded to that exact event.
The next deliberate tick reached Week 14, restored the ordinary update, removed the completion
card, and still did not repeat generic Operational copy during that mount.

### Release and deep-return chain

The committed Week-12 co-event fixture released *House of Cipher* while the Annex completed. The
lot correctly opened the Silver Screen Gazette rather than hiding the release; the exact completion
appeared once and owned focus. The visible result retained its real participants, credits, and
41/100 critic result.

All three governed paths were replayed from the exact fixture:

- Newspaper → Autopsy → lot;
- Newspaper → ReleaseResult → lot; and
- Newspaper → ReleaseResult → Autopsy → lot.

Every route returned to the Week-13 Studio Lot, focused `Advance one week`, retained the exact film
identity/evidence, omitted the consumed completion, and suppressed the generic Operational
announcement.

### Reduced motion and renderer fault

An isolated reduced-motion session installed a main-world media-query witness. Opening the real lot
changed the witness from `installed` to `matched`, proving the mounted product queried and received
`prefers-reduced-motion: reduce`. The same committed Week-30 pointer path reached Week 31,
`Shooting beat completed`, and the same focused action with an empty warning/error log. The
automated parity gate independently proves reduced motion changes no state, RNG, or route result.

An isolated fault session rejected only the dynamic `StudioLotView.ts` import and disabled the Vite
development overlay. The visible fallback retained `Advance one week`; activating it changed Week
30 to Week 31, exposed `Shooting beat completed`, retained the fallback and focused action, and
opened no release detour. The one logged import error was the intentional injected fault. The
temporary acceptance configuration was removed immediately afterward and is absent from Git.

### Viewport and performance matrix

| View | Live result |
| --- | --- |
| 1280×720 | Week, film/task truth, Advance, and Dashboard return visible, enabled, and reachable. |
| 1366×768 | Same governed pass. |
| 1440×900 | Same governed pass. |
| 1920×1080 | Same pass plus full warm performance measurement. |
| 1536×864, 125%-equivalent | Same governed pass with compact topbar wrapping. |
| Maximum in-world camera zoom at 1920×1080 | Twelve real upward wheel inputs drove the camera to its `fitZoom × 1.85` maximum; the human-story Stage 7 view, film/task truth, and both React topbar actions remained visible and reachable. |
| 960×540 compact viewport | Additional responsive stress pass; both topbar actions and live production truth remained reachable. This is not substituted for camera zoom. |

The exact completion state was also reviewed independently across width breakpoints 720, 721, 740,
760, 761, 800, 860, 980, 981, 1400, and 1401, plus full viewports 1280×720, 1366×768,
1440×900, 1536×864, and 1920×1080. There was no notice/panel overlap, Stage 7 clipping,
horizontal overflow, or unreachable inspector tail.

At 1920×1080 the warmed live scene measured 179 FPS average, 145 FPS 1%-low, 6.9 ms p99,
11.1–11.9 ms worst sampled frame, 0.02 ms update, one draw, 33 display objects, and 15 dynamic
actors. The UI rounds the decoded textures to 10.6 MB; the governed exact total remains 11,096,896
bytes, with the unchanged 281 KB role atlas.

The clean final-candidate matrix and independent responsive review ended with zero console warnings,
zero console errors, and zero failed requests; the reduced-motion session separately ended with an
empty warning/error log. The maximum-camera-zoom pass also ended with an empty warning/error log.
The intentional renderer-import rejection is isolated from those clean results.

## Final verification

| Gate | Result |
| --- | --- |
| Focused live-week gate | **PASS — 4/4 files, 66/66 tests** |
| Complete repository suite | **PASS — 159/159 files, 1,917/1,917 tests** |
| Governed D-16/D-17 harness | **PASS — 10/10 files, 176/176 tests** |
| Root and UI TypeScript | **PASS** |
| Production build | **PASS — 132 modules transformed** |
| Deterministic fixture replay | **PASS — every output unchanged** |
| Physical-browser `Enter` replay | **TOOLING EXCEPTION — focus observed; activation not synthesized; exact automated keyboard parity PASS** |
| `git diff --check` | **PASS** |
| Independent strict reviews | **No P1–P3 findings** |

The production build retains the pre-existing large-chunk advisory. The Studio Lot remains
lazy-loaded; that advisory is not a Live Week Advance correctness failure.

## Authority neutrality and open boundaries

This slice intentionally changes App/React interaction and origin-aware routing. It changes no
authoritative simulation result. GameState and SaveFileV1–V11 remain frozen, and transient lot
feedback/return context is never serialized. Camera, selection, reduced motion, renderer readiness,
fallback, focus, and route traversal consume no RNG.

The world-first doctrine remains incomplete. Startup/load still lands on Dashboard; most deep
surfaces still unmount the lot; existing lot destinations outside the release chain do not yet
restore exact camera/context; Annex start still belongs to Studio Development; autoplay/speed,
richer facility queues, workloads, person stories, construction placement/catalogues, and broader
physical production remain forward milestones.

The accepted D-17B macroeconomy residuals remain open exactly as governed. Cash runaway,
top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance, world-led
variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12 timing
remain open. No financing, loan, bailout, restructuring, failure ladder, arbitrary cash sink, or
macroeconomic certification was introduced.
