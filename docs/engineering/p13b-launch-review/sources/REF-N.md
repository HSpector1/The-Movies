# REF-N — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/tuning.ts`
Full source Git blob: `fe73c2b5639cab51306ed0c219631feb52f7b96d`
Full source SHA-256: `a38001dc57b964f338b13be3cc9175599586c42fa4a1bcb009b6215aa481576f`
Full source bytes: 121736

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/tuning.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 419–423

```text
  THEATRICAL_TAIL_FLOOR: 0.05, // [ICH] each modeled week earns ≥ this fraction of gross
  FAME_REACH_HALF_SAT: 50, // [OWNER surface/form; ICH value] Hill K for fame→opening-reach saturation
  OVERHEAD_BASE: 15_000, // [ICH] fixed weekly studio overhead
  OVERHEAD_PER_EMPLOYEE: 1_500, // [ICH] weekly overhead per contracted employee
  ECONOMY_MODEL_VERSION: 1, // [OWNER] 1 = D-12 blended-share theatrical run (0 = legacy full-gross)
```

## Original lines 967–1040

```text
export const DEVELOPMENT_OFFICE_2_BLUEPRINT = {
  id: 'development-office-2',
  name: 'Development Office II',
  capability: 'development-casting',
  capacity: 0,
  footprint: { width: 3, depth: 2 },
  clearanceRing: 1,
  requiresRoadAccess: true,
  buildWeeks: 8,
  capex: 600_000,
  weeklyOperatingCost: 2_500,
  facilityIdBase: 'facility-development-office-2',
  projectIdBase: 'construction-development-office-2',
  ledgerNote: 'Development Office II construction',
  effectSummary:
    'Raises every screenplay drafted here by 4 points of estimated strength. An original screenplay written to this standard is richer, and takes a week longer to write.',
  requires: [],
  maxInstances: 1,
} as const satisfies FacilityBlueprint

/**
 * Development Office III — the higher tier, and the catalog's first REAL use of a
 * facility requirement: it cannot be built until Development Office II is
 * operational. Highest tier wins rather than summing, so a studio holding both
 * gets +9, not +13.
 */
export const DEVELOPMENT_OFFICE_3_BLUEPRINT = {
  id: 'development-office-3',
  name: 'Development Office III',
  capability: 'development-casting',
  capacity: 0,
  footprint: { width: 3, depth: 2 },
  clearanceRing: 1,
  requiresRoadAccess: true,
  buildWeeks: 12,
  capex: 1_200_000,
  weeklyOperatingCost: 4_000,
  facilityIdBase: 'facility-development-office-3',
  projectIdBase: 'construction-development-office-3',
  ledgerNote: 'Development Office III construction',
  effectSummary:
    'Raises every screenplay drafted here by 9 points of estimated strength, replacing the second office\u2019s smaller gain. An original screenplay written to this standard takes two weeks longer to write.',
  requires: [{ kind: 'facility', blueprintId: 'development-office-2' }],
  maxInstances: 1,
} as const satisfies FacilityBlueprint

/**
 * Development & Casting Hall — the proven Annex pattern at twice the scale. Two
 * shared slots, so two more screenplays or auditions can run at once. Unlimited,
 * exactly as the Annex is: capacity genuinely stacks, which is why this one has
 * no instance limit while the office tiers do.
 */
export const DEVELOPMENT_CASTING_HALL_BLUEPRINT = {
  id: 'development-casting-hall',
  name: 'Development & Casting Hall',
  capability: 'development-casting',
  capacity: 2,
  footprint: { width: 4, depth: 3 },
  clearanceRing: 1,
  requiresRoadAccess: true,
  buildWeeks: 20,
  capex: 1_400_000,
  weeklyOperatingCost: 6_000,
  facilityIdBase: 'facility-development-casting-hall',
  projectIdBase: 'construction-development-casting-hall',
  ledgerNote: 'Development & Casting Hall construction',
  effectSummary:
    'Adds two shared Development & Casting slots, so two more screenplays or auditions can run at a time.',
  requires: [],
} as const satisfies FacilityBlueprint

/**
 * Craft Services Annex — the studio feeds its own crew, so hired crew stop
 * pricing it in. Every one-film freelancer fee falls by 15%.
```
