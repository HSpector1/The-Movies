# ADR 0002: TypeScript simulation authority

- Status: Accepted
- Date: 2026-08-20

## Context

The production client decision established a TypeScript authoritative engine
and Unity production client. The boundary must remain explicit as client
capabilities grow.

## Decision

TypeScript is the sole authority for `GameState`, legality, economy, time, RNG,
saves, migrations, production and construction rules, identities, outcomes,
progression, and historical truth.

Unity gathers intents and owns rendering, animation, cameras, interaction
affordances, audio/VFX presentation, UI presentation, and disposable local
presentation caches. TypeScript accepts or rejects each intent and publishes a
new authoritative projection. Unity must not mirror gameplay formulas or
mutate projected truth.

Three.js remains a working reference client, regression oracle, visual donor,
and fallback. It is not deleted and is not the destination for primary
production-art investment.

## Consequences

- Both clients can be replaced or restarted without creating divergent game
  rules.
- Missing client facts are added to the smallest truthful TypeScript projection,
  not inferred in C#.
- Presentation can be rich and locally responsive while authoritative mutations
  remain command/revision controlled.

## Revisit when

Only an explicit Owner ruling may move simulation authority out of TypeScript.
