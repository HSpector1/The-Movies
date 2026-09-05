# Project: Studio

Project: Studio is an in-development studio-management simulation and a modern successor to *The Movies* (2005). The Studio Lot is the primary game surface. TypeScript owns gameplay law and durable state; Unity and the browser client present that authority.

## Repository status — 2026-09-05 snapshot

| Classification | What it means now |
| --- | --- |
| **ACCEPTED PRODUCT** | Public TypeScript repository `HSpector1/The-Movies`, discovery branch `campaign/living-lot-ts`: runtime/product `da848225516fe3ced9a421548d0f5e7cbc8b5b88`, documentation-inclusive accepted campaign `2753e18ba8fb5f65b936c22cde9531646fecc6cd`. Private Unity repository `HSpector1/project-studio-unity-visual-spike`, discovery branch `campaign/living-lot-client`: product/campaign `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`. P06 and P07 are Owner accepted, KEEP, and closed. |
| **ACTIVE IMPLEMENTATION** | `OPS-P08P10-20260905-01` governs public TS branch `wip/p08-p10-autonomous-stack-01-ts` and private Unity branch `wip/p08-p10-autonomous-stack-01-client`. The dated snapshots are TS `9bc01ea3682e597ec65acfc624afc41e4f48004a` and Unity `26a543a1604eb519df11a81c0b6f894179b2349a`. This work is unsealed and not Owner accepted. A branch pointer is discovery information, **not permission to edit it**. |
| **FUTURE PLANNING** | Public branches `docs/p11a-launch-package-01`, `docs/p12a-pre-readiness-01`, and `codex/p13-p15-long-range-research-01` preserve P11A Revision 02, corrected P12 pre-readiness, and P13–P15 direction. These are planning sources, not implementation grants. See the package index. |
| **HISTORICAL REFERENCE** | `main` at the snapshot (`c902a704eb948cc576083d0973c8c23e59937dc1`), old campaign ledgers, milestone contracts, and preserved agent instructions remain evidence. They do not override an applicable current task authorization. |

The single identity and authority register is [Project Studio source register — 2026-09-05](docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md). The cross-branch design and package map is [docs/PACKAGES.md](docs/PACKAGES.md).

## Start correctly

1. Read [START-HERE.md](START-HERE.md).
2. Locate the issued task authorization named there. If no current authorization names your scope, base, branch, and mutation boundary, remain read-only.
3. Confirm repository identity and immutable commits from the source register. Treat discovery branches as movable pointers only.
4. Use an owned branch and isolated worktree. Never switch, clean, reset, or write into an active shared checkout unless the task explicitly assigns it.

Planning, research, pre-readiness, technical KEEP, and a passing foundation slice do not by themselves authorize implementation or establish Owner acceptance.

## Product and engineering laws

- The Studio Lot is the primary game surface; deep management views support it.
- TypeScript is the only authority for gameplay state, time, legality, finance, identities, persistence, and deterministic random draws.
- Presentation renders truth and submits intent. It does not create a parallel simulation.
- Use stable exact IDs, seeded deterministic paths, and explicit save migrations.
- Reuse existing Project: Studio systems and source evidence before adding parallel machinery.
- Never claim a test, private-source inspection, build, playtest, or acceptance that did not occur.

## Development entry points

Install the pinned dependencies in the checkout assigned by the task:

```bash
npm ci
```

The Three.js browser application is the reference/debug surface, not the native production player:

```bash
npm run dev -- --host 127.0.0.1
```

Run it only when runtime use is within the issued task. Native Unity launch has separate private-repository, build, process, and disposable-profile prerequisites in [START-HERE.md](START-HERE.md); it is not the cold-start onboarding test.

Common validation routes are documented in [START-HERE.md](START-HERE.md). The broad TypeScript checks remain:

```bash
npm test
npm run typecheck
npm run build
```

## Durable references

- [PROJECT-STUDIO-SUCCESS-BLUEPRINT.md](PROJECT-STUDIO-SUCCESS-BLUEPRINT.md) — destination and permanent product laws.
- [THE-MOVIES-PARITY-MASTER-PLAN.md](THE-MOVIES-PARITY-MASTER-PLAN.md) — sequence and parity framing; not a task authorization.
- [CURRENT-BEST.md at the accepted campaign](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/CURRENT-BEST.md) — accepted-product record, not the live WIP ledger.
- [CLAUDE.md](CLAUDE.md) — concise repository agent rules.
- [Shared authority guide](docs/agent/SHARED-AUTHORITY-GUIDE.md) — common instructions consumed by repository subagents.

For original-derived mechanics, consult the canonical Mechanics Bible in the authorized project research corpus before changing behavior. It is not committed in either product repository; the [source register records the access boundary](docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md#external-research-source-limitation). If it is inaccessible, record the limitation and do not reconstruct it from memory.
