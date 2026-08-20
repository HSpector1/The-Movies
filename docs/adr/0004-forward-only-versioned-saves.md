# ADR 0004: Forward-only versioned saves

- Status: Accepted
- Date: 2026-08-20

## Context

Project: Studio currently writes V14 saves and retains supported historical
readers and migrations. Save doctrine must survive future versions without
freezing policy to V13 or duplicating migration logic in clients.

## Decision

The TypeScript engine owns save serialization, validation, and migration. It
writes exactly one current version and imports supported older versions through
pure, ordered, forward-only migrations. Historical schemas and fixtures are
frozen compatibility authorities.

Migration must preserve permanent IDs, deterministic RNG state, rules-relevant
history, and all facts required for equivalent continuation. Unsupported future
versions, malformed input, and downgrade attempts fail loudly. Unity receives
opaque save JSON through the bridge and never interprets or migrates gameplay
state.

Each new save version requires deterministic migration coverage, current-format
round-trip coverage, and evidence that a migrated continuation matches the
defined gameplay invariants.

## Consequences

- Old supported saves converge on one current in-memory model.
- Clients cannot silently create competing save authorities.
- Historical migration behavior remains reviewable and reproducible.

## Revisit when

A new save version is introduced, support for a historical version is formally
retired, or durable Phase B storage changes the persistence envelope.
