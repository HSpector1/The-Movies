# World-First Studio Home V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `8d5f8dd95a64a6a863b5612cc44cf1a45cf0f599`

Implementation authority: `0c4bd9dade7ef866900dfd7d4557cb18fb69653f`

## Keep ruling

World-First Studio Home V1 passes its bounded Keep gate.

An ordinary founded, recovered, or loaded operating studio now enters the premium Hollywood Studio
Lot by default. Founding and Start remain the owners of an unfounded studio. Dashboard remains a
supported deep-management surface, but it no longer displaces the living world as the default
operating home. Explicit overview rollback still makes Dashboard the root, and explicit Hollywood
rollback still makes the legacy/procedural Lot the world home.

The retained ordinary loop is:

```text
START / RECOVER / LOAD
→ FOUNDING WHEN REQUIRED
→ LIVE HOLLYWOOD STUDIO LOT
→ SELECT A WORLD BUILDING
→ OPEN A SUPPORTING DEEP SURFACE
→ COMPLETE OR CANCEL THE REAL DECISION
→ RETURN TO THE SAME AUTHORITATIVE STUDIO / LOT CONTEXT
```

The App remains the only owner of the current `GameState` and screen decision. The Lot renders
authoritative state and emits identity/action intent; it does not become a router, clock, save
owner, or second simulation.

## Exact retained behavior

| Boundary | Retained result |
| --- | --- |
| Ordinary home | Successful Founding plus accepted founded recovery/import enter the Hollywood Lot without an intermediate Dashboard paint. |
| Unfounded state | No session, corrupt session, new game, restored founding draft, and accepted founding-draft import retain Start/Founding ownership. |
| Adopted gates | Overview and Hollywood are independently default ON. Neutral/absent input exercises the default; explicit env or localStorage `0`/`false` rollback wins. Existing positive overrides remain compatible. |
| Dashboard | Dashboard is retained as a supporting surface. Lot-origin Dashboard exposes `Back to Studio Lot`; overview-rollback Dashboard remains a true Dashboard root and exposes no false Lot return. |
| Root origin | One discriminated App-owned return context carries Dashboard or Lot origin through Writers Room, Casting Room, Assembly, Roster, Hiring/Talent Creator, Hub, Saves, Studio Development, Calendar, Recap, Chronicle, Clipping, Newspaper, ReleaseResult, and Autopsy branches. |
| Deep return | A Lot-launched building route records the exact building identity. Back/Cancel/completion returns to a newly mounted Lot with that building selected and focused, or the Lot heading when no valid building target exists. |
| Week results | Mounted-Lot no-release Advance retains the live mount. Lot-origin supporting-Dashboard Advance/Sim and real release/result chains return to Lot through their explicit context; Dashboard-root equivalents remain Dashboard-rooted. |
| Studio replacement | Accepted new/load boundaries clear selected-building, stable stage assignment, recovery disclosure, result snapshots, focus instruction, and other presentation memory belonging to the replaced studio. Rejected/declined replacement preserves the current studio. |
| Accessibility | The Lot owns one semantic level-one heading and deterministic focus targets. Lazy loading is a status; keyboard/pointer routes remain native and exact-once. |
| Renderer failure | Inner Lot-view failure leaves the semantic Studio Lot, its heading, navigation, recovery notice, and authoritative actions usable. Overview rollback does not fetch the lazy Lot module. |

No generic history stack, URL router, hidden second App, second Phaser view, or renderer-authored
navigation state was introduced.

## Honest same-world continuity boundary

The current architecture deliberately unmounts `StudioLotScreen` and destroys its Phaser view when
the player opens a deep screen. Returning constructs exactly one replacement view against the same
current authoritative `GameState`.

V1 proves and retains:

- the same authoritative studio, week, cash, RNG, ledger, production, people, facility,
  reservation, construction, publicity, and save truth;
- the same browser URL because navigation remains App-owned rather than URL-routed;
- stable in-session production-to-stage assignment where applicable;
- exact selected-building identity for a building-origin return;
- deterministic return focus; and
- at most one live canvas and one App tree.

V1 does **not** claim that a deep-screen round trip preserves:

- camera pan or zoom;
- selected person, production, place, Scenery, or Annex presentation context;
- a presentation-only route or acknowledgement;
- person movement that existed only in the destroyed renderer; or
- the same Phaser instance or object identity.

The browser phrase “return to the same Lot” therefore means the same authoritative studio and
world context after the governed remount. It does not mean persistent renderer identity. None of
the excluded presentation state is serialized into `GameState` or a save.

## Exact implementation surface

Implementation commit `0c4bd9dade7ef866900dfd7d4557cb18fb69653f` changes 44 files with
2,258 insertions and 411 deletions.

The six runtime/presentation files are:

- `ui/src/App.tsx`;
- `ui/src/flags.ts`;
- `ui/src/lot/StudioLotScreen.tsx`;
- `ui/src/lot/lot.css`;
- `ui/src/lot/snapshot/selectedBuildingSession.ts`; and
- `ui/src/screens/Dashboard.tsx`.

The remaining files are proof, browser-harness, compatibility-test, and deterministic-fixture
maintenance:

- `scripts/gen-recap-fixtures.mts`;
- `ui/e2e/authored-stage-proof.spec.ts`;
- `ui/e2e/cycle2-playtest.spec.ts`;
- `ui/e2e/cycle3-playtest.spec.ts`;
- `ui/e2e/cycle4-playtest.spec.ts`;
- `ui/e2e/d12-economy-journey.spec.ts`;
- `ui/e2e/d14-career.spec.ts`;
- `ui/e2e/d1b-soundstage-proof.spec.ts`;
- `ui/e2e/film-package-playtest.spec.ts`;
- `ui/e2e/helpers/managed-production.ts`;
- `ui/e2e/lot-identity-final.spec.ts`;
- `ui/e2e/lot-identity.spec.ts`;
- `ui/e2e/lot.spec.ts`;
- `ui/e2e/player-enablement.spec.ts`;
- `ui/e2e/recap.spec.ts`;
- `ui/e2e/session-recovery.spec.ts`;
- `ui/e2e/smoke.spec.ts`;
- `ui/e2e/stage-a-adoption.spec.ts`;
- `ui/e2e/studio-home-v1.spec.ts`;
- `ui/e2e/two-film-autopsy.spec.ts`;
- `ui/playwright.config.ts`;
- `ui/src/App.test.tsx`;
- `ui/src/determinism.test.tsx`;
- `ui/src/flags.test.ts`;
- `ui/src/lot/StudioLotScreen.test.tsx`;
- `ui/src/lot/WorldFirstAnnexConstruction.test.tsx`;
- `ui/src/lot/WorldFirstLiveWeekAdvance.test.tsx`;
- `ui/src/lot/WorldFirstStudioHome.test.tsx`;
- `ui/src/lot/authored-stage-a-wiring.test.tsx`;
- `ui/src/lot/d1b-assignment-lifecycle.test.tsx`;
- `ui/src/saves.test.tsx`;
- `ui/src/screens/Dashboard.navigation.test.tsx`;
- `ui/src/screens/casting-sessions-ui.test.tsx`;
- `ui/src/screens/script-projects-edge-ui.test.tsx`;
- `ui/src/screens/studio-calendar-ui.test.tsx`;
- `ui/src/screens/studio-development-ui.test.tsx`;
- `ui/src/session.test.tsx`; and
- `ui/src/simulation.test.tsx`.

No file under `src/core/` changed. No GameState, SaveFile, schema, migration, economy, publicity,
awareness/reach, production, facility, reservation, construction, RNG, ledger, or accounting owner
changed.

## Automated contract proof

The retained tests close the contract's entry, origin, reset, focus, failure, and neutrality
families:

- Start/corrupt/founding/current-save/converted-save/Start-import/Saves-import decisions use one
  App-owned canonical home boundary;
- overview and Hollywood default/rollback precedence is independently pinned, including unavailable
  storage and hostile inherited process variables;
- Lot-origin and Dashboard-origin deep routes remain distinct through nested screen and
  release/Chronicle paths;
- accepted replacement discards the old studio's presentation context while rejection preserves
  it;
- canonical and selected-building focus falls back only to the Lot heading, never a neighboring
  building;
- root navigation preserves exact SaveFileV11, RNG, and ledger bytes and adds no Engine action or
  extra authoritative state replacement;
- inner renderer failure, delayed lazy readiness, reduced motion, repeated navigation, and
  rollback retain semantic operation and one-canvas ownership; and
- migrated browser journeys explicitly establish Dashboard rollback when Dashboard itself is the
  subject, rather than weakening the new production default.

The recap browser fixture is regenerated through public Engine actions and validated as a native,
ledger-reconciled SaveFileV11 before use. The browser compatibility changes do not fabricate cash
or rewrite authoritative state to preserve an old screenshot narrative.

## Ordinary-player browser acceptance

### Fresh founding → managed production → world return

A clean browser session used the visible Start and Founding UI with deterministic seed
`studio-home-fresh-founding`. It signed the legal minimum of three actors, one director, one writer,
and one craft worker, then activated `Found the studio`.

The first operating surface was one Hollywood Studio Lot. A paint observer recorded no Dashboard,
both localStorage gate keys remained absent, the Lot heading owned focus, and exactly one canvas
was mounted.

Native keyboard activation of the Lot's semantic/companion Writers building control opened the
managed Writers Room, not legacy direct Assembly. Capacity read
`0 of 2 slots occupied · 2 available`. The player opened the real commission panel and commissioned
one screenplay through its ordinary controls. Capacity became
`1 of 2 slots occupied · 1 available`; the persisted SaveFile retained the deterministic seed,
managed script mode, Week 0, and exactly one authoritative script project.

`Back to studio` returned to the same authoritative studio/Lot context and URL with the exact
post-commission save bytes. The replacement Lot mounted one canvas and restored the Writers
building as both `aria-current` and keyboard focus. This is a governed deep-screen remount, not a
claim that the pre-Writers Phaser instance survived.

The live acceptance continued from that returned world with one native Lot week advance. The
authoritative studio reached the next week and repainted fresh script/work truth without a
Dashboard detour. The focused browser suite pins the founding/commission/return segment and the
supporting-Dashboard no-release week-return segment as separate bounded journeys so failures have a
single owner.

The acceptance ended with no product page errors, no product console errors, no development error
surface, one canvas on Lot, and no positive runtime gate override.

### Recovery, Dashboard support, and rollback

The same browser suite also proves:

- founded recovery opens Hollywood first with its exact recovery notice and no Dashboard paint;
- Lot → Dashboard → Lot preserves URL and exact save bytes and restores canonical Lot focus;
- building-origin deep return restores exact building selection/focus;
- Saves export matches the unchanged authoritative fixture bytes;
- repeated Lot/Dashboard cycles retain exactly one canvas;
- a no-release Advance from Lot-origin Dashboard returns to Lot with the world Advance action
  focused and one exact week update;
- overview rollback remains Dashboard-rooted and never requests the lazy Lot screen; and
- Hollywood rollback keeps the Lot home while selecting the legacy/procedural presentation.

### Default-path harness correction

The first complete Chromium run passed **114/114** before the final browser-harness correction,
but independent review correctly rejected its `VITE_*='1'` web-server values as proof of a shipped
default. Positive enable values could conceal a future default-OFF regression.

The final harness sets both child web-server values to the neutral empty string. This scrubs
hostile inherited shell rollback without positively enabling either feature, so absent
localStorage exercises the shipped default branch. The affected Studio Home suite then passed
**5/5** while the invoking environment deliberately supplied both inherited variables as `0`.
Explicit localStorage rollback tests continued to win. This correction changed harness authority,
comments, and proof quality; it did not change product runtime behavior.

Final independent review found no remaining P1–P3 issue. The same review also corrected stale
SaveFileV4 fixture labels to SaveFileV11 and a founding test-id comment from age to `termWeeks`.

## Final verification

| Gate | Result |
| --- | --- |
| Complete Vitest repository suite | **PASS — 165/165 files, 2,069/2,069 tests** |
| Governed D-16/D-17 harness | **PASS — 10/10 files, 176/176 tests** |
| Production build | **PASS — 134 modules transformed** |
| Complete Chromium suite before final neutral-env correction | **PASS — 114/114 tests in 7.5 minutes** |
| Affected Studio Home Chromium suite after correction, invoked under hostile inherited `0` env | **PASS — 5/5 tests** |
| Root and UI TypeScript | **PASS** |
| `git diff --check` | **PASS** |
| Independent final strict review | **PASS — no P1–P3 findings** |

The production build retains the existing large-chunk advisory: two minified JavaScript chunks
remain above 500 kB. It is not reclassified as a Studio Home authority or navigation failure.

Notable non-product diagnostics included Node reporting that `NO_COLOR` was ignored because
`FORCE_COLOR` was set and the truthful recap generator reporting one rejected film before writing
its four-film Week-56 fixture. There were no Playwright failures or failure artifacts.

## Authority neutrality and open boundaries

This milestone intentionally changes default navigation, typed return routing, focus,
cross-studio presentation reset, and supporting-Dashboard presentation. It changes no
Engine/GameState/SaveFile/schema/economy/RNG/ledger behavior. Existing player actions retain their
existing authoritative results; routing adds no second mutation.

Persistent Lot mounting behind deep screens, camera persistence, person/production/place context
persistence, a URL router, autoplay/speed controls, facility queues, new production tasks, and
unrestricted Sims autonomy remain outside this bounded close.

The governing status remains exactly:

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

This milestone is not broad macroeconomic certification. It introduces no financing, loans,
bailouts, restructuring, failure ladder, or arbitrary cash sink.
