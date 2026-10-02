# 1359-F3: parent response to the P15C reference run (1359-X)

[1359-X](1359-X-p15c-wave2-reference-run.md) found two defects outside the declaration: route L is unlawful under the
repo's law (F-1), and the reference's ranking law contradicts its adapter (F-2). The test author revises the RED as
r4 and the reference as r3.

## Required in RED r4: a lawful route L

- **The law today.** A public founding draft opened after week 0 inside a live industry yields no lawful save.
  - With the draft open, rival method locks break the technology rule (`src/core/technology.ts:897`).
  - With the draft closed, each draft signing lacks its ledger payment (1356-F4).
  - Route L must not depend on either.
- **The author picks a lawful construction**, declares it and says why it serves the leaves. Candidates:
  - the migration-origin pattern 1356-F4 accepted (H8 in `tests/p14c3-profession-history.test.ts:216-218`; 1356-C3's
    `foundMidGame`): a historical-control draft, `foundStudio`, then `initializeHollywood(…, 'migration')` at the
    founding week;
  - a week-0 founding run to the boundary;
  - another construction the law accepts.
- **What the handback states.** For each leaf on route L, what it needs from the route, especially any industry
  history before the founding, and why the chosen construction still provides it. If a leaf needs a founding inside
  a long-running industry, the handback says so. The parent then decides between a narrower leaf and waiting for a law
  repair (the 1356-X F-2 Owner item).
- **The control** `legacy-control-late-founding-route-lawful` must pass at RED and at GREEN. Its name may change with
  the route. The producer 1359-P follows the route, and r4 updates it if the route changes.
- **Measure before review.** The author may run single test files in its own scratch tree, one vitest process at a
  time, to show the control passing. The parent re-runs the reference (1359-X2) before the confirmation review.

## Required in reference r3

The Legacy law keys `rankingSnapshots` uniqueness on (`recordId`, `studioId`). One record may hold one row per studio,
which is the shape the adapter writes and the RED expects. A repeated (`recordId`, `studioId`) pair still refuses by
name. No other reference change.

## Budgets

The Wave R guard budget stays at 300 s (1359-X measured 67-74 s). The route and extension budgets are set from
1359-X2, once route L is lawful.

## Unchanged

The leaves and their RED reasons, the sibling patch, the B7 note, 1355-F5's lookup rule, and the F1 relaxation for
authored films.
