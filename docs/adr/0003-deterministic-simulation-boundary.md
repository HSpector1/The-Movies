# ADR 0003: Deterministic simulation boundary

- Status: Accepted
- Date: 2026-08-20

## Context

Replays, saves, migrations, tests, and cross-client projections require the same
authoritative inputs to produce the same game truth. A blanket randomness ban,
however, would unnecessarily constrain harmless visual variation.

## Decision

Authoritative simulation uses explicit deterministic RNG streams and stable
ordering. Renderer timing, process timing, locale ordering, wall-clock time,
unseeded randomness, animation sampling, and frame rate may not affect gameplay
state, legality, identities, saves, or outcomes.

Unity and Three.js may use cosmetic variation for particles, animation offsets,
ambient motion, or similar presentation when that variation is not persisted as
game truth, does not select authoritative work, and cannot influence an intent's
meaning.

Session UUIDs, command processing measurements, logs, and transport timings are
operational metadata rather than simulation RNG. They must not feed gameplay.

## Consequences

- Export/import/export and identical-seed runs remain byte- or state-stable as
  defined by their tests.
- CI guards target authoritative code paths and deterministic evidence rather
  than banning every presentation-side randomness API.
- Cosmetic diversity remains available to the production client.

## Revisit when

A presentation choice begins to affect an authoritative intent or save, or a
new simulation subsystem needs a named RNG stream.
