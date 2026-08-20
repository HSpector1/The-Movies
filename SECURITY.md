# Security Policy

## Reporting a vulnerability

Do not publish an exploitable vulnerability, credential, private save, or local
path in a public issue. Use GitHub's private vulnerability reporting for the
repository when available. If it is unavailable, open a public issue titled
`Security contact requested` with no exploit details or sensitive material so
the repository Owner can arrange a private channel. A private report should
include the affected commit, reproduction, impact, and whether the issue crosses
the TypeScript authority, localhost bridge, Unity client, Three.js client, save,
or asset pipeline boundary.

Do not include live tokens, credentials, or private save data in a report.

## Current runtime boundary

Project: Studio is a cooperating local product, not a browser-only application:

- TypeScript is the sole authoritative simulation, save, migration, legality,
  economy, time, RNG, identity, and outcome engine.
- Unity is the production visual and interaction client. It submits intents and
  consumes authoritative projections.
- Three.js remains a working reference client, regression oracle, and fallback.
- The development bridge is a Node HTTP process bound to `127.0.0.1`. It exposes
  health, contract, session, snapshot, command, save, and load operations.

The bridge is not approved for non-loopback binding or public deployment. It
must never expose arbitrary filesystem access or command execution.

## Existing controls

- Protocol, schema hash, projection version, session ID, command ID, expected
  revision, state revision, and digest are validated at the contract boundary.
- Commands are validated and deduplicated by the TypeScript authority. Unity
  does not calculate gameplay legality.
- Bridge request bodies are capped at 2 MB (2,000,000 bytes). This network-input
  limit is not an asset-size policy.
- Saves use the current V14 writer and pure forward migrations from supported
  historical formats. Unity does not parse or migrate gameplay save state.
- Adopted 3D assets are subject to provenance, duplicate, and format-aware size
  checks in `npm run audit:3d-assets`.
- CI has read-only repository permissions, persists no checkout credential, and
  references no project secrets beyond GitHub's scoped workflow token.
- Local credentials, signing material, builds, caches, logs, and evidence are
  ignored. `npm run audit:repo-hygiene` rejects common secret-like tracked paths
  and known credential markers.

## Known development boundary

Loopback binding alone is not a complete browser or local-process trust
boundary. The current bridge does not yet require a per-launch capability, nor
does it enforce an expected Host, reject browser Origin headers, or require an
exact JSON content type. Before Phase B produces a packaged runtime, add those
controls, request/header timeouts, safe token transfer from launcher to Unity,
and tests proving that the token is neither persisted nor logged.

Bridge save/session/replay state is currently process memory. Treat bridge
restart persistence, stale-process cleanup, and log lifecycle as unfinished
product work, not as a security guarantee.

## Dependency policy

`npm run audit:browser-deps` audits the browser runtime dependency set at high
severity. It is not a whole-product audit. The current development bridge
executes `vite-node`, which is an explicit development dependency and therefore
is not covered by that command. Phase B must compile/package the bridge or
otherwise define and audit its exact runtime dependency graph before production
packaging can be accepted.

Dependency updates require the same typecheck, test, bridge, build, and asset
gates as code changes. Do not use forced audit upgrades, auto-merge dependency
PRs, or suppress advisories merely to make a gate green.

## Repository and asset hygiene

- Never commit `.env` files, private keys, signing material, access tokens,
  private saves, local evidence, generated builds, caches, or logs.
- Never use ripped or legally unclear assets. Record creator, source, license,
  commercial-use status, modifications, and adoption decision.
- Use Git LFS prospectively for newly adopted large binary assets when
  appropriate. Do not rewrite history to retrofit existing assets during this
  campaign.
- Cosmetic presentation randomness is permitted when it cannot affect
  gameplay truth. Seeded authoritative simulation and save state may not depend
  on renderer randomness or wall-clock time.
