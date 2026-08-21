# ADR 0008: Supervise the local product lifecycle

- Status: Accepted
- Date: 2026-08-21

## Context

The Unity client and authoritative TypeScript engine are one local product but
separate processes. Manual fixed-port launch commands left capability creation,
durable profile selection, startup ordering, restart, logging, and cleanup to an
operator. A disposable runtime directory would survive one engine replacement
but lose the studio across full product launches; a persisted capability would
create an unnecessary reusable secret.

## Decision

Use one TypeScript supervisor as the development product entry point. It owns a
stable, current-user-private profile containing the separate bridge runtime
checkpoint. Each full product launch gets a fresh in-memory capability and a
separate bounded log directory. The first engine asks the OS for a loopback
port; authenticated health establishes readiness, and replacements reuse that
port, profile, and launch capability while the same Unity process reconnects.

Spawn the engine and Unity directly with `shell:false`, minimal environments,
no capability-bearing arguments, exact PID/incarnation/process-group leases,
and fail-closed cleanup. Rotate the capability on the next full launch without
rotating or deleting the profile. Keep `GameState` and V14 unaware of process,
transport, lease, capability, and replay lifecycle.

## Consequences

- `npm run studio` is the one-command native development path.
- Engine replacement and full app relaunch preserve authoritative TypeScript
  state while capabilities remain short-lived.
- Logs and stale-child recovery are supervisor responsibilities rather than
  Unity gameplay or bridge protocol concerns.
- The current supervisor still uses the pinned development `vite-node` graph;
  production packaging and runtime dependency auditing remain separate work.

## Revisit when

Revisit the process topology when an installer or platform launcher replaces
the development entry point. Preserve the stable-profile/per-launch-capability
boundary unless a reviewed security and migration design supersedes it.
