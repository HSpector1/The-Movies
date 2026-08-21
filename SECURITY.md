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
boundary. The bridge therefore requires a random 32-byte capability for every
request, accepts only its exact `127.0.0.1:<port>` Host, rejects every Origin,
requires JSON content type on POSTs, and applies bounded headers, requests,
requests per socket, and timeouts. Unity accepts the capability only through its
environment after validating the exact loopback endpoint, disables redirects,
and attaches it through one request factory. The capability is process-launch
infrastructure: it must not enter argv, logs, reports, saves, checkpoints, or
repository files.

These controls defend the browser/DNS-rebinding boundary and accidental
cross-process access; they do not make the bridge suitable for non-loopback or
hostile multi-user deployment. The `npm run studio` supervisor generates the
capability in memory, passes the same value privately to the engine and Unity,
reuses it only for engine restarts within that product launch, and rotates it
for the next launch. It selects an ephemeral loopback port for the first engine,
pins that port for replacements, and launches both children without a shell or
capability-bearing command-line argument.

The supervisor persists current and explicitly saved V14 bytes, logical
session/revision, and exact request/response replay history in a strict atomic
checkpoint under one stable, private profile. It uses process-incarnation locks,
rejects symlinks and corrupt or oversized input, bounds and redacts per-launch
logs, and fails closed on persistence or child-ownership errors. A dead engine
is restarted against the same profile, port, and launch capability; a new full
product launch retains the profile but rotates the capability. The lower-level
`npm run bridge` command intentionally remains memory-only unless an operator
supplies a durable runtime directory.

Treat packaged runtime dependency auditing, installer/update behavior, profile
backup/recovery UX, and hostile multi-user isolation as unfinished product work,
not as security guarantees. The checkpoint and logs must never contain a launch
capability, and operational persistence must never expand the V14 gameplay save
format.

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
