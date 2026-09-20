# 278 — explicit CastingSlate typing after actual271

2026-09-20. FROZEN inert corrected copy, two cases / 247 lines. Intended live
target remains `tests/p14b4-ready-replay-background.test.ts`; NOT installed here.

Draft: `278-ready-background-corrected.test-draft.ts`

SHA256: `e1447d8b0834ccdd8000ed05de6dbd4f85d80e31e0ab8738c8f36b2d971c2978`.

Original268 remains unchanged, rehashed as
`ac14a1899e3172cf8d733fb9656784936a6192fe662d033e2bb0940ce6ed20b3`.
Its assertions, fixture recipe, accounting evidence limits and provenance apply.

## Actual diagnostic and exact correction

Read the complete271 raw text and metadata. `npm run typecheck` on source
`41bc14db9efb2bf52ab263a7d5ea3db4a91b65ad`, tested patch
`410620a24d7c522f2d54fb12cbc14ba0a9365aad8197e5536f32651797853873`,
ran2026-09-20T06:15:05.596Z–06:15:36.785Z and exited2, fixedSource:true.
Root compilation reported only live test155:100 TS2322: inferred slate fields
were string[] rather than the required two-element tuples. UI compilation was
not reached because the script chains it with && after root tsc.

The actual exported CastingSlate is Record<CastSlot,[string,string]>.
This corrected copy changes ONLY:

- The existing types import adds `CastingSlate`.
- The existing slate declaration becomes `const slate: CastingSlate = ...`.

No cast, asserted bypass, tuple value, action, assertion, fixture guard, cap,
timeout or executable behavior changes. Plain diff confirms precisely those two
line substitutions; its exit1 is the expected difference result. All historical
268 labels intentionally remain inside the copied draft.

No runtime/typecheck was executed for278; no corrected compilation or behavior
result is claimed. No live/source/config/fixture edits, Git/network or delegation.
Parent installs only after every271–275 runner is closed, then verifies serially.
Frozen276 first-take draft and277 review remain unaffected.
