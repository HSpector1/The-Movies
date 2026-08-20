# ADR 0007: Separate durable bridge runtime checkpoint

- Status: Accepted
- Date: 2026-08-21

## Context

The Unity client submits retryable command, save, and load envelopes to the
authoritative TypeScript engine. Process-memory deduplication cannot replay the
same accepted response after an engine crash. Adding session IDs, revisions, or
response history to `GameState` or V14 would contaminate deterministic gameplay
truth, widen the closed save contract, and couple operational transport state to
forward-only save migration.

The runtime also cannot acknowledge an authoritative mutation before its replay
record is durable. A crash in that gap would leave Unity unable to distinguish a
lost command from a committed command whose response was lost.

## Decision

Persist bridge lifecycle in a strict, versioned `BridgeRuntimeCheckpointV1`
that is separate from `GameState` and every gameplay save version. It embeds the
untouched canonical current V14 export, the untouched last explicit V14 save,
logical session/revision, and a bounded canonical request/full-response journal.
Bind current and saved bytes, journal bytes, and terminal revision with digests
and validation invariants.

Serialize state-dependent reads and mutations through one coordinator. For a
first-seen command, save, or load, validate the complete prospective checkpoint
and atomically commit it before exposing the response. Replay the stored response
bytes exactly after restart. Fail closed on malformed, corrupt, ambiguous, or
unwritable runtime state.

Use one private, app-owned runtime directory with a process-incarnation lock and
same-directory atomic replacement. Never store a launch capability in this
checkpoint. Never silently evict command IDs within one logical session. A full
history may roll to a new logical session only after proving the next entry can
fit an empty journal and preserving both V14 authority slots.

## Consequences

- TypeScript remains the only simulation and save authority.
- A killed engine can restore its logical session and replay prior wire responses
  without mutating state twice.
- The checkpoint is larger than a gameplay save because it retains exact response
  bodies, so explicit byte/count limits and controlled rollover are required.
- Persistence failures become fatal rather than risking memory/disk divergence.
- A product launcher is still required to create the private directory, pass a
  non-persisted capability, choose the port, supervise the child, and coordinate
  Unity reconnect.

## Revisit when

Revisit the checkpoint format only when measured response history or packaged
runtime constraints require a new version. Do not revise V14 or `GameState` to
avoid a runtime-checkpoint migration.
