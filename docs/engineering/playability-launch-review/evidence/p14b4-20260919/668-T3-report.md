# 668-T3 — live-version sweep, one class: a frozen validator/route handed a LIVE state carrying `relationships`

ROLE test-author. WORKTREE /Users/zacheryspector/The-Movies-headless-program, HEAD 8e03ff97 (clean at start).
Writes: `tests/**` only, the five files named in the assignment. Nothing under `src/`, `bridge/`, `ui/src/`.
Patch: `668-T3.patch` (`git diff HEAD --binary -- tests`), 7758 bytes,
sha256 `bfa345b88a3dec1df41a8426913cdb83d90d2348ad6c691b6981c81fc28ff47e`.

STATUS: DONE. 8/8 failures of the class re-expressed; no assertion weakened, no case deleted,
no fixture touched (`tests/fixtures/**` untouched), no tuning altered.

## The class

`GameState = GameStateV31` (src/core/types.ts:2284) now carries the top-level
`relationships: readonly RelationshipEdge[]` root. Every frozen validator below V31 walks an
exact-keys allowlist (`v12ExactKeys`), so any test that hands a LIVE state to a frozen validator,
a frozen reconstruction, or a deep-equality over a migrated state now trips on the new key.
V30 did not break these because V30's change (the tagged promise predicate) lives INSIDE
`promises`, which the V29 strip already removes; V31 is the first top-level root since V29.

## Per-failure table

| file:line (post-edit) | what it MEANS to assert | premise that moved | device | why the meaning is preserved |
|---|---|---|---|---|
| tests/facility-move-demolish.test.ts:838-839 (the guard under test is now :841) | an OLDER (V11) validator refuses the V13 demolition refund row outright — law 19, the refund must not survive into a historical save format | the forgery is built from the LIVE save and stripped of every root V11 never had so the refund row is the FIRST violation; the live save now carries one more such root | forged-older-version construction: assert `relationships` is `[]`, then `delete` it — byte-identical to the file's own V14/P06A/P08A/P09/R05/P13B-S3/P14A.1/P14B.1 strip chain | the guard under test is unchanged and still the first violation reached; the `toEqual([])` gate proves nothing was discarded (this world films no take, so it holds no bond). Empty-root removal is the exact inverse of the V30→V31 empty lift. |
| tests/p13b-r07-save-v25.test.ts:175-176 (`asV25Envelope`, the helper behind :211 and :221) | a reconstructed V25 envelope with a REAL nonempty workflow validates and lifts `setup: null`; and V24..V20 refuse a V25 save | same: the helper rebuilds a genuine-shaped V25 envelope from a live world, and the live world gained a root V25 never had | same forged-older-version device, in the helper, beside its `talentMarket` / `firstTakes` / `promises` lines | both cases keep their own assertions verbatim; the helper's honesty gate is preserved and extended (`expect(stripped.relationships).toEqual([])` — the rehearsing world completes no take) |
| tests/p14b1-first-take.test.ts:288-290 (was :286) | the first-take receipt is BYTE-STABLE across a real save/load | the envelope was pinned at 29 because 29 was live when written; the live writer now stamps 31 | validate at the LIVE version: `saveVersion: 31` + `save.validateSaveV31` (R-VERSION movement). Downgrade is NOT available: the take asserted above mints edges, and `convertV31ToV30` REFUSES any world holding an edge (src/core/save.ts:8808-8821). A new premise line `expect(afterFirstWeek.relationships.length).toBeGreaterThan(0)` (:288) records that fact at runtime rather than in prose — it PASSED. | the claim (one receipt, filtered by productionId, byte-equal after the round trip) is untouched; the round trip now runs through the validator the live writer's own version uses, the same device as tests/p14b4-cast-class-outcomes.test.ts:355 and tests/p14b1-promises.test.ts:503. The V29-specific pin in this file's sibling case ("absent on the raw V28 fixture", `parsed.saveVersion === 28`) is unchanged. |
| tests/p14b1-first-take.test.ts:102-107 (removed) | — | dead scaffolding: the `SaveModuleWithV29`/`Envelope` shim existed because `validateSaveV29` did not exist at RED time; it is now unused and `noUnusedLocals: true` would fail the typecheck | removed the 6-line shim only; `import * as save` stays used via `save.validateSaveV31` | no assertion, no case and no test-visible behaviour lived in those lines |
| tests/bridge-owner-ux-projection20-migration.test.ts:120 and :133 | a real projection-20 predecessor checkpoint migrates forward adding ONLY the governed roots, each at its empty value, and changing NO old root (the `oldRoots` deep equality) | the migrated state is now 31 keys vs the 30 the destructure accounted for | account for the new key the way the V28 and V29 roots were accounted at their cutovers: destructure `relationships` out of `after.state` AND pin its value `expect(relationships).toEqual([])` | strictly stronger than before: the deep equality over every remaining old root is unchanged, and the new root gains its own exact-value pin naming the V31 law (opened EMPTY on lift, nothing recomputed — no bond invented for work the predecessor slots already recorded) |
| tests/bridge-p13b-r07-setup.test.ts:587 | the bridge's save/load "converted" report is measured against the CURRENT live save version, not a stale literal | plain sweep miss: the literal `30` with the comment "the CURRENT live version" | R-VERSION value sweep 30 → 31; kept as a LITERAL (using `LIVE_SAVE_VERSION` here would make the pin tautological and hide the next bump from the sweep) | the surrounding claim (`converted: false`, "Authoritative TypeScript save loaded.") is unchanged |

## Writer defects

None. All eight failures are moved premises in tests, not production defects. The V31 law behaved
exactly as the expansion states in every case: the root is opened EMPTY on lift (the projection20
migration now pins `[]`), the downgrade refuses a world that formed a bond (which is why
p14b1-first-take had to move UP rather than project DOWN), and a live world that filmed a take
does hold edges (the new premise line passed).

## Checks actually run (core project, `node_modules/.bin/vitest run --project core`, node v20.20.2)

| check | result | log |
|---|---|---|
| the five touched files, one command | 5 files / **64 passed**, 0 failed | 668-T3-five-files.log |
| p14b5-relationships + p14b5-save-v31 + bridge-p14b5-relationships | 3 files / **118 passed** | 668-T3-red-trio.log |
| p14b1-promises | **15 passed** | 668-T3-promises.log |
| p14b4-cast-class-outcomes | **23 passed** | 668-T3-outcomes.log |
| `npm run typecheck` (tsc --noEmit + ui) | **EXIT 0** | 668-T3-typecheck.log |
| `npm run typecheck:bridge` | **EXIT 0** | 668-T3-typecheck-bridge.log |
| p14b1-first-take re-run after a comment-only correction | **3 passed** | 668-T3-first-take-recheck.log |

All logs in this scratchpad directory. Edit script: `668-T3-edit.py` (assert-then-write, one
occurrence per replacement, verified).

## Evidence limits

- The full core suite was NOT re-run (parent owns it). Expected residue after this patch is the
  NINE baseline files of record 636 (bridge-p12-campaign-library 11, bridge-p13-campaign-isolation 1
  — a 60s timeout, p13a-scientist-foundation 3, r3n1 x3 files 2 each, world-first-scenery 1,
  p14b4-cast-class-capacity-evaluator5 1 designated, p14b4-ready-replay-stale-target 1 designated):
  24 failures, unchanged by this work and untouched by it.
- The UI project was not run. Evidence 667 contains ZERO occurrences of the
  `unknown field "relationships"` message and its failing set is the same nine files as the 643
  baseline, so this class does not appear there.
- Record 665 (natural-chain controls) carried exactly one failure, the p14b1-first-take case fixed
  here; the other 23 control files were green and were not re-run.
- No other file of this class exists in core: run 666 executed every core test file, and its five
  new failing files are the five edited here.
