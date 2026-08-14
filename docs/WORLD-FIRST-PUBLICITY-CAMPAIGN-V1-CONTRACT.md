# World-First Publicity Campaign V1 Contract

Status: **FROZEN BEFORE IMPLEMENTATION**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Pre-contract HEAD: `e9a80cd2730dd2db0e42f8ec7f98e13931376100`

## 1. Product ruling

The Studio Lot is the primary game surface. The accepted D-17B publicity action therefore becomes
a truthful physical Administration & Publicity interaction instead of an always-visible Whisper
button attached to whatever the player happens to be inspecting.

The exact V1 loop is:

```text
PHYSICAL ADMINISTRATION & PUBLICITY
→ INSPECT ALL THREE CURRENT ENGINE OFFERS
→ CHOOSE ONE EXACT TIER
→ APP/ENGINE ACCEPTS OR REJECTS ONCE
→ FRESH CASH / AWARENESS / LEDGER / COOLDOWN TRUTH
→ BOUNDED PHOTOCALL ACKNOWLEDGEMENT
→ REMAIN ON THE SAME LIVE STUDIO LOT
```

The canonical physical building is the normal entry point. Its native semantic companion supplies
keyboard/accessibility parity and the complete renderer-failure path. The existing Dashboard
publicity panel remains the deeper explanatory surface and exact parity owner; it is not deleted,
diminished, or silently changed.

This is a **studio-level campaign purchase spatially anchored at Administration & Publicity**. It
is not a Publicity Office facility and not a film-specific production phase. The world makes an
existing decision playable and visible; it creates no new simulation.

## 2. Frozen authority

Engine/GameState already owns the complete result:

- `PUBLICITY_TIER_ORDER == [whisper, push, blitz]`;
- exact cost, maximum lift, current expected lift, price per point, tier cooldown, global cooldown,
  current availability, available week, and named rejection reason;
- exact diminishing-return lift at current Audience Awareness;
- engaged-economy, founding, global-cooldown, per-tier-cooldown, and solvency gates;
- immediate whole-dollar cash debit;
- immediate round-free Awareness lift with the existing clamp;
- one exact `publicity` ledger row with no `productionId`;
- `publicity.lastUsedWeek` and only the purchased tier's `byTier` clock;
- deterministic SaveFileV11 persistence; and
- no RNG draw, time advancement, campaign duration, production identity, facility reservation, or
  worker assignment.

The only legal read and write paths remain:

```text
publicityDecision(state) → PublicityOffer[3]
→ studioLotSnapshot(state).publicityOffers (field-exact leaf projection)
runPublicity(state, tier) → applyActions([{ kind: publicity, tier }])
```

React and Phaser may select, present, focus, acknowledge, and render fresh results. They may not
recompute a cost, lift, price-per-point, cooldown, affordability rule, or legal action.

The accepted Owner/economic classification remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

This milestone does not certify publicity ROI, recommend a tier, or change D-17B tuning.

## 3. Canonical physical identity

The deliberately divergent accepted runtime manifest—not the stale source exporter output—owns the
physical V1 geometry. Do not run an exporter, regenerate either manifest, or copy source geometry
over runtime geometry.

Frozen manifest hashes at this contract:

```text
art/hollywood/district-manifest.source.json
  5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889
ui/public/lot/hollywood/district-manifest.json
  23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92
```

One canonical runtime place must satisfy all of:

```text
id          == publicity
buildingId  == admin
label       == Administration & Publicity
affordances == [work, meeting, publicity]
selectionPolygon == [
  [946,174], [1586,122], [1586,510], [1050,500], [920,360]
]
anchors.entry     == [1338,421]
anchors.photocall == [1120,481]
anchors.queue     == [930,338]
```

One canonical runtime activity must satisfy all of:

```text
id                   == publicity
label                == Publicity call
place                == publicity
requiredAffordances  == [publicity]
requiredRoles        == [talent, publicist, photographer]
visualStates         == [queue-forming, flash, press-moving]
```

The scene must fail closed unless each identity is unique, arrays and coordinates are exact, the
polygon is finite/non-self-intersecting, the photocall anchor lies inside the canonical place, and
the activity resolves back to that exact place. No `find()` first-match acceptance of duplicates.

A malformed, absent, duplicated, or contradictory publicity place/activity creates no physical
publicity hotspot, outline, focus target, or flash. Stage 7 and every unrelated Lot destination
remain usable. The native semantic campaign path remains complete and states honestly that the
physical office is unavailable.

## 4. Exact snapshot projection and world-context selector

`StudioLotSnapshot` receives one exact leaf projection:

```ts
type LotPublicityOffer = {
  tier: 'whisper' | 'push' | 'blitz'
  cost: number
  maxLift: number
  expectedLift: number
  pricePerPoint: number | null
  cooldownWeeks: number
  globalCooldownWeeks: number
  available: boolean
  availableWeek: number | null
  reason: string | null
}

publicityOffers: LotPublicityOffer[]
```

`studioLotSnapshot(state)` copies every public field of every `publicityDecision(state)` offer
without formula, sorting, defaulting, recommendation, or inference. This is a leaf projection only;
it does not make the Lot snapshot authoritative over the action.

One pure `publicityCampaignContext(snapshot)` selector keeps the exact current offers separate from
Phaser. It must:

1. require exactly one `admin` building fact;
2. require exactly three offers, exactly one per known tier, with no unknown, missing, or duplicate
   tier;
3. resolve canonical display order by tier identity `whisper / push / blitz`, never input position;
4. require a positive whole-dollar cost;
5. require finite positive `maxLift` and finite `expectedLift` in the closed range
   `0..maxLift`;
6. require `pricePerPoint` to be finite and positive, or exactly null when `expectedLift === 0`;
7. require non-negative integer tier/global cooldowns and one identical shared global-cooldown
   value across all three offers;
8. require an available offer to have `reason === null` and `availableWeek === snapshot.week`;
9. require an unavailable offer to have a non-empty reason and an available week that is either
   null or an integer greater than or equal to `snapshot.week`; and
10. preserve the legal zero-lift/null-price offer instead of inventing an economic rejection.

It returns the exact three offer records plus availability count, or unavailable. It does not call
`publicityDecision`, call `runPublicity`, mutate state, inspect a film, infer a recommended tier, or
see Phaser objects.

The host separately owns presentation-only physical availability as exact `pending`, `available`,
or `unavailable` state derived from Scene/View readiness and canonical physical-place validation.
It is never inferred from the Lot snapshot. A pending or unavailable renderer cannot block the
complete semantic campaign path.

The canonical physical seam reuses the existing place-event arm and carries identity only:

```ts
{
  type: 'place',
  place: {
    id: 'publicity',
    buildingId: 'admin',
    label: 'Administration & Publicity',
    affordances: ['work', 'meeting', 'publicity'],
  },
}
```

It carries no offer, tier choice, cost, lift, GameState, command, facility, person, clock, money, or
result. React rebuilds the context from the latest exact offers.

## 5. World and semantic entry parity

The following entry paths must reach the same campaign context:

- pointer activation of the canonical physical polygon;
- pointer activation of a visible physical publicity affordance if one is added;
- native Enter/Space activation of the existing Administration companion; and
- that same native companion after renderer rejection or canonical manifest failure.

Under Operation Hollywood, activating the Administration companion selects/frames the physical
building and opens the campaign context before any deep navigation. It no longer immediately exits
to Dashboard. The campaign context retains an explicit **Open Dashboard details** action so the
accepted deep management surface stays one decision away.

Returning from that explicit Dashboard handoff restores the same Administration campaign context,
rebuilds fresh offers, re-focuses the canonical place when available, and focuses the stable
campaign heading. A Dashboard purchase may change the returned offer truth but must not replay a
Lot success flash. This continuity applies only to the explicit campaign handoff; ordinary
Dashboard navigation remains unchanged.

Local Lot context still dies on unmount. App may carry one typed, consume-on-return
`publicity-campaign` entry intent only for this explicit Dashboard-details handoff and only for the
same loaded studio. Starting/loading/replacing a studio, any unrelated navigation, or an ordinary
Dashboard entry clears that intent; no offer, pending state, success receipt, or announcement
crosses the boundary.

The procedural/rollback Lot keeps its existing Administration behavior. Dashboard entry from any
other accepted path remains unchanged.

Physical and semantic activation must:

- clear incompatible person, production, scenery, Annex, and generic-place contexts;
- retain the same mounted Phaser canvas, camera world, URL, week, and GameState;
- outline the canonical physical place when available;
- focus the canonical place through the existing camera system when available;
- set the selected building to `admin` without changing Engine state; and
- expose the same exact offers and action buttons.

Selecting a person, production, Stage 7, Scenery & Service, Annex, another place, or another
building closes the campaign context. It never remains invisibly armed under another inspector.

## 6. Campaign panel

The current globally rendered Whisper-only shortcut is removed. Campaign controls appear only in
the selected Administration & Publicity context.

The panel shows all three exact offers in canonical order. For each tier it exposes:

- campaign label;
- exact whole-dollar cost;
- exact current immediate Awareness lift to two decimals;
- exact current price per immediate point, or an honest em dash when null;
- exact tier cooldown;
- exact shared global cooldown;
- exact available week where the public offer supplies one;
- exact named unavailability reason; and
- one native button enabled only when the exact offer is available and an action owner exists.

The panel also shows current Audience Awareness and bounded copy consistent with Dashboard: values
are decision inputs, not a recommendation or promised business outcome. It must not call any tier
“best,” “optimal,” “safe,” “profitable,” “required,” or a rescue.

After an accepted campaign the same context remains open and immediately repaints all three fresh
offers. The shared cooldown must make every tier unavailable when Engine truth says so. Loaded
cooldown truth paints directly; no historical flash or success announcement replays on mount.

## 7. Exact action and stale-state law

One user activation may call the existing publicity action owner at most once.

Immediately before dispatch React must:

1. prove the campaign context is still selected;
2. re-run `publicityCampaignContext(latestSnapshotRef.current)`;
3. find exactly one current offer for the rendered tier;
4. compare every own field of the rendered and latest offer;
5. require latest `available === true`;
6. require no publicity command is already pending; and
7. reject the second click of one native double-click gesture.

Any mismatch fails closed without calling `runPublicity`. The panel refreshes from current truth,
announces that the offer changed, and retains context. No stale cost/lift copy may authorize a fresh
tier merely because its tier string still matches.

A synchronous pending latch is set before calling the action owner. Pointer double-click,
Enter/Space repeat, held key, event replay, slow parent replacement, and rapid cross-tier activation
cannot produce two owner calls. The latch clears on a real rejection or after a validated success
receipt and a fresh snapshot replaces the rendered available offer with exact unavailable cooldown
truth. It cannot become a second campaign scheduler or infer a clock.

The Lot supplies only the selected tier and receives no successor state across this frozen boundary:

```ts
type LotPublicityResult =
  | { ok: true; tier: 'whisper' | 'push' | 'blitz'; acceptedWeek: number }
  | { ok: false; error: string }
StudioLotScreen onRunPublicity(tier) → LotPublicityResult
```

App owns that callback, reads its latest `GameState`, invokes `runPublicity` exactly once, replaces
the root state only after the internal successor proves both `publicity.lastUsedWeek` and the
selected `publicity.byTier[tier]` equal the accepted prestate week, and reduces the internal
`ActionOutcome` to the exact Lot-safe receipt above. The callback may not return the successor
`GameState`. The Lot may revalidate a projected offer and present the result; it may not call
`runPublicity`, replace a `GameState`, or own an unrestricted state mutator.
`StudioLotScreen` therefore removes its direct `runPublicity` / `publicityDecision` imports and its
current `onStateChange` prop.

Dashboard wraps the same App-owned action boundary for its existing alert behavior. The Lot uses a
separate no-alert wrapper so React owns exactly one in-context campaign announcement and the scene
visual cannot duplicate it.

Accepted success is the exact Engine successor. Relative to the prestate, only existing publicity
law may change:

- `studio.cash -= exact offer cost`;
- `studio.standing.audienceAwareness` receives the exact Engine lift/clamp;
- ledger appends exactly one current-week `publicity` row with exact amount/note and no production
  ID;
- `publicity.lastUsedWeek` becomes the current week; and
- only the purchased tier clock becomes the current week.

Week, RNG, concepts, people, contracts, productions, workflows, tasks, reservations, facilities,
construction, theatrical runs, career state, and all other standing channels remain byte-identical.

An Engine rejection changes nothing. It produces one named campaign announcement, retains the
selected context, and restores focus to the same tier action when it remains focusable or the stable
campaign status otherwise. Error cleaning may remove only the known adapter prefix/suffix; it may
not paraphrase away the authoritative reason.

## 8. Visual acknowledgement boundary

An accepted campaign may produce one bounded photocall acknowledgement at the canonical
`photocall` anchor. It is evidence of the already-accepted result, never the result itself.

The current shared `activityGraphics` object is not a legal implementation. Publicity currently
clears/reuses the same graphics object that paints Stage 7 shooting truth. V1 must isolate
publicity presentation from persistent shooting presentation so a campaign can neither erase,
replace, inherit, nor leave stale Stage 7 state.

The retained treatment may add at most one draw-only Graphics object, zero texture bytes, zero
actors, zero routes, and zero authoritative positions. It may reuse the existing photocall flash
rectangle. The acknowledgement must clear itself after its bounded presentation and on scene
shutdown/recreation.

The cue remains local to the canonical photocall anchor, is never screen-wide, and produces no more
than three flashes in any one-second interval. Campaign focus must leave the selected office
façade/outline, photocall cue, and Stage 7 status simultaneously discoverable; the semantic panel may
not cover both the selected building and the Stage 7 truth at once.

Reduced motion suppresses the animated flash/tween. The accepted state, exact panel repaint,
announcement, controls, and focus remain. A rejected, unavailable, stale, direct-load, or restored
cooldown state produces no success flash.

The existing ambient publicity people remain presentation-only. V1 may not claim they are the
campaign's staff, a queue, assigned talent, occupied workers, or a production result.

## 9. Explicit truth boundary

V1 does **not** create or imply:

- a Publicity Office facility;
- facility capacity, occupancy, reservation, queue, blocker, or bottleneck;
- named-publicist employment or talent assignment;
- person travel, destination, ETA, workload, fatigue, stress, or relationship effects;
- a film-specific campaign, release tie, production owner, or production progress;
- preparation, duration, scheduled legs, weekly delivery, cancellation, or refund;
- a new awareness formula, marketing menu, pricing tier, cooldown, or recommendation;
- a cash sink beyond the accepted exact purchase;
- financing, bailout, restructuring, or failure-ladder behavior; or
- renderer authority over cash, awareness, legality, time, or persistence.

The manifest's `queue` anchor and required roles are authored presentation vocabulary. They do not
prove a simulated queue, roster assignment, or occupied facility and must not be copied as such.

## 10. Invalidation, replacement, and failure parity

The campaign context must clear without transfer when:

- another world/semantic context is selected;
- the physical event identity is incomplete or contradictory;
- offer projection is missing, duplicated, unknown, non-finite, or contradictory;
- the mounted studio is replaced or the Lot unmounts, except for the narrow typed return intent in
  section 5; or
- an accepted callback lacks its exact tier/week receipt or a fresh snapshot fails to replace the
  formerly available rendered offer with authoritative unavailable cooldown truth.

Restoring an old state later must not automatically reopen a stale campaign drawer after it was
explicitly closed by another context.

Renderer rejection, delayed renderer import, malformed/absent publicity manifest identity,
hidden-tab resume, view recreation, and reduced motion retain the complete native semantic offer
and action path. Physical-unavailable copy must be explicit. No invisible hotspot or false outline
survives.

The existing person-profile modal suspends all world and campaign input. Closing it restores focus
according to its current contract; no held publicity activation may cross the modal boundary.

## 11. Accessibility and input ownership

- All three tier actions are native buttons.
- The campaign region has a stable programmatic heading and status target.
- Pointer, Enter, and Space activate a tier exactly once.
- Visible labels expose tier, cost, lift, cooldown, and availability without color alone.
- Disabled buttons retain their exact reason in associated text.
- Success, rejection, and stale-offer messages use one existing live-region owner and one event per
  real outcome.
- After success focus moves to the stable campaign status because the purchased button may become
  disabled.
- After stale mismatch or rejection focus remains in the campaign region.
- Campaign and companion overlays contain pointer/mouse/touch down events so they cannot also drag
  the world or select geometry underneath.
- Phaser canvas activation accepts only a native canvas target.
- Browser zoom, 200% zoom, keyboard-only use, and screen-reader order retain access to all three
  offers and the Dashboard handoff.
- Normal text meets at least 4.5:1 contrast; controls, focus boundaries, and non-text state cues meet
  at least 3:1 contrast.
- Every tier target is at least 44 x 44 CSS pixels and has a visible, unclipped focus indicator.
- Grayscale and forced-colors checks preserve tier identity, selection, availability, reasons, and
  focus without relying on hue alone.

The scene visual method must not echo a second live announcement already owned by React.

## 12. Performance and responsive boundary

No new image, atlas frame, actor, route, persistent campaign-timer state, or dynamic simulation is
authorized. One bounded presentation-only tween/clear completion for the local acknowledgement is
allowed by section 8 and owns no campaign truth.
The retained maximum delta is:

```text
renderer draws:        exactly 1 total
encoded texture bytes: +0
decoded texture bytes: +0
dynamic actors:        +0
routes:                +0
display objects:       <= +1 draw-only Graphics
```

The governed Hollywood/Scenery baseline is 34 display objects, 15 dynamic actors, and 11,096,896
decoded texture bytes. The absolute candidate ceilings are therefore 35 display objects, 15
dynamic actors, 11,096,896 decoded texture bytes, and one renderer draw. Reusing/removing the
existing publicity paint path and remaining at 34 objects is preferred when it preserves the
Stage 7 separation law.

The existing governed 1920 x 1080 target remains:

- average FPS `>= 50`;
- one-percent-low FPS `>= 30`;
- p99 frame time `<= 33.4 ms`;
- worst sampled raw frame time `<= 33.4 ms` over the existing post-warm-up 240-frame window; and
- no second draw loop or resize loop.

The selected campaign panel must remain usable at 1920 x 1080, 1366 x 768, 1024 x 768, and the
governed 960 x 540 stress viewport, including maximum camera zoom and 200% browser zoom. Compact
layout may scroll within the semantic panel; it may not cover the entire Lot or make all offers
unreachable.

## 13. Deterministic evidence fixture

Use the already-governed public-action native SaveFileV11 fixture:

```text
ui/e2e/world-first-scenery-load-in-v1/
  week-30-nights-of-watchtower-stage-7-blocked.save.json
sha256 7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc
```

Its frozen input facts include Week 30, `$11,160,898.29` cash, `36.46928821615352` Audience
Awareness, null global/per-tier publicity clocks, and 62 ledger rows. It also retains a real Stage 7
shooting blocker, so one live journey can prove that publicity graphics do not erase production
truth.

Do not mutate or regenerate this accepted scenery fixture. Publicity successors remain in-memory or
browser-local evidence unless a separate native fixture is proven necessary. The input and every
accepted Lot/Dashboard successor must import/export byte-identically through SaveFileV11.

## 14. Required automated proof

At minimum prove:

1. exact canonical runtime publicity place/activity acceptance;
2. missing, malformed, duplicate, wrong-label/building/affordance/polygon/anchor/activity rejection;
3. malformed publicity geometry creates no physical hotspot or flash;
4. field-exact snapshot passthrough with no publicity formula, sorting, defaulting, or inference;
5. exact three-tier output order and all public offer fields, including canonicalization of a
   reordered hostile selector input by tier identity;
6. missing, duplicate, unknown, non-finite, or internally contradictory offer rejection;
7. App owns the single `runPublicity` / exact successor-clock validation / successful root-state
   replacement boundary while the Lot has neither a direct action import, successor-state result,
   nor unrestricted `onStateChange`;
8. physical polygon and Administration companion enter the same context;
9. unrelated selections clear campaign context;
10. campaign controls are absent from unrelated person/place/production/Annex/scenery contexts;
11. Dashboard details remain reachable, Dashboard publicity behavior remains unchanged, and the
    explicit return restores fresh same-Lot campaign context without replaying a flash;
12. Whisper, Push, and Blitz success from independent identical prestates;
13. exact cash, Awareness, ledger, clocks, no-production-ID, and byte/state neutrality for each;
14. exact Lot/Dashboard successor parity for every tier;
15. cash, global-cooldown, tier-cooldown, founding, and disengaged rejection truth;
16. stale same-tier field mismatch, tier replacement, and selected-context loss before dispatch;
17. pointer double-click, rapid cross-tier click, Enter/Space repeat, and pending rerender exact-once;
18. success focus, rejection focus, stale focus, and one live announcement;
19. renderer rejection and manifest failure retain complete semantic action parity;
20. publicity flash never clears, borrows, or changes Stage 7 shooting graphics/status;
21. direct loaded cooldown and scene recreation do not replay success ceremony;
22. reduced motion, hidden-tab, delayed import, modal suspension, and input containment;
23. local flash frequency, simultaneous office/photocall/Stage 7 visibility, contrast, 44 x 44
    targets, focus clipping, grayscale, and forced-colors boundaries;
24. no `src/core`, save, tuning, manifest, generated art, or economy behavior change; and
25. performance/display-object/texture/actor/route and one-renderer-draw budgets.

Hostile tests must vary offer array order, duplicate tiers, null/non-null available week,
availability/reason contradictions, mismatched shared cooldowns, lift above maximum, past available
week, same-tier stale lift after awareness change, stale affordability after cash change, duplicate
physical places/activities, wrong runtime/source anchors, and a Stage 7 recording visual active at
the exact campaign moment.

## 15. Ordinary-player browser acceptance

Against the exact governed fixture:

1. load the native SaveFileV11 and enter the persistent Studio Lot;
2. confirm the real Stage 7 blocker/status remains visible;
3. click the physical Administration & Publicity building;
4. inspect Whisper, Push, and Blitz with exact current costs/lifts/cooldowns/reasons;
5. purchase one available tier once;
6. observe one bounded photocall acknowledgement without losing Stage 7 truth;
7. confirm fresh cash, Awareness, ledger, and all-tier shared cooldown truth in the same context;
8. attempt a now-unavailable tier and prove no second owner call/state change;
9. open Dashboard details, verify exact parity, and return to the Lot;
10. repeat proportional keyboard, reduced-motion, renderer-failure, 960 x 540, maximum camera zoom,
    and 200% browser-zoom checks.

The URL and mounted Lot remain unchanged through the purchase. The Dashboard check is an explicit
deep handoff after the world action, not the action's primary location.

## 16. Proportional final verification

- both TypeScript projects;
- focused campaign selector, Scene, View, React host, and existing D-17B truth-surface tests;
- full repository Vitest suite;
- governed D-16/D-17 suites;
- production build;
- focused and full Lot Chromium suites;
- deterministic SaveFile import/export and Lot/Dashboard successor parity;
- exact manifest/art/source non-change hashes;
- live ordinary-player play and responsive/performance evidence; and
- independent strict authority, runtime, accessibility, and visual review.

## 17. Keep / Kill boundary

Keep only if the player can physically enter Administration & Publicity, understand all three exact
choices, buy one, see fresh authoritative consequences, and remain in the living Lot without any
production or staffing fiction.

Kill or narrow if implementation requires:

- new publicity simulation law or a Publicity facility;
- a film/person/queue/occupancy claim not owned by GameState;
- changing prices, lift, cooldowns, affordability, or D-17B copy;
- changing/regenerating the accepted runtime manifest or plate;
- a globally available campaign button outside the selected physical/semantic context;
- a screen route as the primary purchase path;
- a second owner call under rapid input;
- publicity visuals that erase or borrow Stage 7 truth;
- new art, texture, actor, route, or more than one draw-only object;
- inaccessible offer/reason/focus behavior; or
- a missed governed performance threshold.

## 18. Governing residuals

This world-first interaction changes no macroeconomic classification. The following remain
explicitly open:

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
construction tuning, publicity tuning, or economic certification follows.
