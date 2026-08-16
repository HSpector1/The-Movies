# World-First Lot-Retained Audition Planning Workspace V1 — Evidence

Date: 2026-08-16

Branch: `operation-hollywood-autonomous-marathon`

Frozen contract: `d94dd4714ab6ee8e0666afba3aae9a714c578db4`

Accepted implementation: `e6426fcff8fec0744f9ce1bc9fe88f8d09d94ff9`

Ruling: **KEEP — BOUNDED WORLD-FIRST WORKSPACE**

## Proven player loop

```text
LIVE STUDIO LOT
→ SELECT SEMANTIC CASTING
→ PLAN ONE UNIQUELY ELIGIBLE READY SCREENPLAY
→ EDIT SIX CANONICAL LEAD / ANTAGONIST / SUPPORT READS
→ START CAMERA TESTS
→ AUTOSAVE
→ RETURN TO THE SAME MOUNTED LOT
→ SEE CAMERA TESTS UNDERWAY + DUE / FACILITY / SLOT / SIX READS
→ ADVANCE TO THE EXISTING SIX-ROW CASTING REVIEW
```

The full Casting Room remains the explicit supporting owner for details and for every zero,
multiple, blocked, active, review, history, legacy, Operation-Hollywood-off, or non-Lot case.

## Authority and lifecycle proof

- One shared `CastingSlatePlanner` owns the canonical planner UI in retained and standalone hosts.
- `currentLotAuditionPlanningContext` is a strict closed selector over the complete adapter/Core
  board, raw empty session history, exactly one Ready/legal project, exact candidates/capacity, and
  the first free shared slot.
- App owns exact rendered GameState, Lot Screen, presentation token, workspace identity, Casting
  opener, complete slate draft, and monotonic revision.
- Unchanged or stale draft callbacks preserve current rejection and revision. Only a genuine
  candidate toggle increments the revision. Older submit, cancel, or details callbacks are inert.
- Submission must field-equal the current App-owned draft before the existing
  `startCastingSessionAction` can run once.
- Any current next-event, review, Package, or other transition owner blocks planner entry.
- Cancel preserves GameState and SaveFileV11 bytes. Engine rejection preserves state, bytes,
  component, all six choices, exact error, and legal revised retry.
- Accepted state is claimed synchronously, committed through the existing Engine action, observed
  by established autosave, and only then closed. Optional witness failure cannot roll back or
  redispatch valid Engine truth.
- A strict receipt proves the exact appended Auditioning session and reservation before one live
  **CAMERA TESTS UNDERWAY** witness is shown. It names no winner and claims no hire, hold, payment,
  assignment, movement, occupancy, queue, or performed audition.

## Same-world and accessibility proof

Open, cancel, rejection, accepted commit, autosave, close, and witness preserve the exact Lot
component, App authority tree, Screen object, presentation token, Phaser view, canvas DOM node,
camera, and local Lot memory. World/recovery input is inert while the workspace is active, but the
renderer remains visibly mounted behind it.

The shared workspace starts focus on the visible 44px Return-to-Lot control. Focus trap wrapping
scrolls its bounded owner so the target remains visible. Desktop, 960×540, actual CDP page scale
200%, forced colors, reduced motion, and 480×270/DSF2 passed with all six choices, submit, cancel,
and deep details reachable and no page-level horizontal overflow.

At CDP page scale 200%, Chromium's locator coordinate conversion is not visual-viewport-relative.
Acceptance therefore proves the target center with `elementFromPoint` and dispatches the real
pointer through `page.mouse` at the visual-viewport-relative center. This distinguishes a harness
coordinate mismatch from product hit geometry; it does not replace the real activation.

## Proportional verification

- Focused authority/workspace/Lot/selector: **5 files, 39/39 tests passed**.
- UI suite: **117/117 files, 1,458/1,458 tests passed**.
- Repository suite: **204/204 files, 2,688/2,688 tests passed**.
- Governed D-16/D-17 suite: **10/10 files, 176/176 tests passed**.
- Audition Chromium: **4/4 passed**, with no console error, page error, or failed request.
- Adjacent retained-Commission and formation Chromium: **14 passed / one explicit pre-existing
  GPU-only skip**.
- Root and UI TypeScript: **passed**.
- Production build: **passed, 155 modules**; the existing large-chunk advisory remains.
- Direct Engine action and SaveFileV11 replay: **byte-identical**.
- Minimal founded fixture across planner lifecycle: **30 display objects / 13 actors /
  11,096,896 decoded bytes / one draw**.
- `git diff --check`, protected-path/ref checks, manual screenshot review, and independent
  authority/accessibility audits: **passed**.

The frozen `*current-break-audit.spec.ts` is historical pre-implementation evidence and is ignored
by the default accepted post-repair Playwright suite. Replay it at contract commit `d94dd47` when
the superseded Lot-unmount defect itself must be demonstrated.

## Current screenshots

Generated, visually inspected, and intentionally kept in ignored evidence output:

- `out/world-first-lot-retained-audition-planning-v1/01-desktop-planner-over-live-lot.png`
- `out/world-first-lot-retained-audition-planning-v1/02-explicit-full-casting-details.png`
- `out/world-first-lot-retained-audition-planning-v1/03-complete-six-read-slate.png`
- `out/world-first-lot-retained-audition-planning-v1/04-camera-tests-underway-same-lot.png`
- `out/world-first-lot-retained-audition-planning-v1/05-next-event-six-row-casting-review.png`
- `out/world-first-lot-retained-audition-planning-v1/06-960x540-page-scale-200-forced-reduced.png`
- `out/world-first-lot-retained-audition-planning-v1/07-480x270-dsf2-complete-planner.png`

Regenerate them with:

```bash
npx playwright test --config ui/playwright.config.ts \
  ui/e2e/lot-retained-audition-planning-v1.spec.ts --project=chromium
```

## Boundaries preserved

No Core, GameState, SaveFileV1–V11, schema, migration, import/export, Casting result, screenplay,
candidate, capacity, reservation, facility, production, construction, publicity, employment,
economy, RNG, ledger, manifest/exporter, authored-art, renderer structure/draw, travel, occupancy,
queue, workload, autonomy, or pathfinding behavior changed.

Hollywood Casting remains semantic. Structural parity is proven; no GPU wall-clock certification
is claimed.

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open. No financing, loans, bailouts, restructuring, failure ladder,
hard bankruptcy, or arbitrary cash sink is authorized.
