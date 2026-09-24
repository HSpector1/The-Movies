# 763 — the V32 → V33 sweep inventory, keyed on the VALUE

Measured at `28104ed0`, before the writer starts. B.8's inventory keyed on the SYMBOL
`PROJECTION_VERSION`, missed four other spellings of the same fact, and the writer then found three
more classes the corrected inventory still lacked. The generalisation that cost bought is on the
record: **grep the value, and the split between frozen and live is per LINE, not per file.** This
inventory is built that way.

Two owners. The writer takes `src/`, `bridge/`, `ui/`, `scripts/` and any regeneration. The test
author takes everything under `tests/`, including the shared helper at R12. Neither crosses.

## The classes

| | class | where | count | rule |
| --- | --- | --- | --- | --- |
| R1 | the live constant | `src/core/save.ts:6422` | 1 | 32 → **33** |
| R2 | the dispatch ceiling | `save.ts:5308-5310` | 2 | add a `=== 33` arm; the message reads "1 through 33" |
| R3 | the type surface | `save.ts:521-561`, `:6426-6430` | 4 | `SaveFileV33`, `GameStateV33`, the `SaveFile` union, `makeSave`'s return type |
| R4 | the downgrade guards | `save.ts:7343…8967` | **18** | each `=== 32) throw` arm gains a `=== 33` sibling; the message names the provenance root, not the waived-promise link |
| R5 | the conversion arms | `save.ts:8400, 8553, 8636, 8736, 8783, 8859, 8945` | **7** | each `=== 32) return` arm gains a `=== 33` sibling routing through `convertV33ToV32` |
| R6 | the new root machinery | `save.ts` | new | `validateSaveV33`, `stripV33Root`, `convertV32ToV33`, `convertV33ToV32`, `migrateToV33`, `validateTalentProvenanceRoot` |
| R7 | **`migrateToV32` call sites** | 47 files outside `save.ts` | **132** | **per line.** "lift to what the live writer stamps" → `migrateToV33`. "lift to exactly V32" → stays, with a comment saying so |
| R8 | test literals `32` as the LIVE value | `tests/` | **92** | **per line.** A `validateSaveV32` call on a V32 fixture STAYS. An assertion that the live writer stamps 32 MOVES |
| R9 | the bridge checkpoint | `bridge/runtime-checkpoint.ts:461, 476-477, 479-481` | 4 | the `SaveFileV32` alias, the `!== 32` gate, its `must be a current V32 save` message, the canonical bytes |
| R10 | the bridge session | `bridge/session.ts:41, 133, 139` | 3 | the import moves; **`:139` compares to `LIVE_SAVE_VERSION` and survives untouched** |
| R11 | the campaign library | `bridge/runtime/campaign-library.ts:5, 48, 127` | 3 | live route, all three move |
| R12 | the UI adapter | `ui/src/engine/adapter.ts:111-112, 3796, 3808, 3822` | 4 | live route, all four move |
| R13 | **the shared historical helper** | `tests/_historicalCurrent.ts:1, 11` and `liftHistoricalState` | 2+ | hand-builds a live envelope with `saveVersion:32` AND must add the new root to the lifted state. Consumed by many suites |
| R14 | the type comment and the root | `src/core/types.ts:2294`, plus `GameState` | 2 | the comment states the live version; `GameState` gains `talentProvenance` |
| R15 | the core barrel | `src/core/index.ts` | 9 | re-exports, plus the new `aging.ts` surface |

## Two classes that are NOT sweep sites, named so nobody edits them

**The C# DTOs carry no save version.** Measured: `grep -rIn 'SaveVersion\|saveVersion' generated/unity`
returns nothing. Unlike a projection bump, a save bump regenerates nothing under `generated/`. This
is the opposite of B.8, and stating it saves a writer the search.

**`scripts/p13a/performance-library32-*.mjs` is a FALSE POSITIVE.** Its `32` is a count of library
records (`records.length === 32`), not a save version. It matched the value grep and must not move.
This is the class that makes value-keyed grepping dangerous on its own: the value is right, the
meaning is not.

## The judgement R7 and R8 turn on

B.7 already ran this exact split once, and its residue is the template. `tests/p14b5-save-v31.test.ts`
carries lines like:

> `expect(migrateToV31(loaded).saveVersion).toBe(31) // … migrateToV31 lifts them exactly to V31 (frozen; not LIVE_SAVE_VERSION since P14B.7)`

That is the shape a correctly-decided line takes: the value is pinned AND the line says why it did
not move. A line that moves without a reason and a line that stays without a reason are equally
suspect at review.

## The falsifier this inventory accepts in advance

**Static enumeration will not find every site.** B.8 found 42 of 45 version sites and 3 of 4 row-shape
sites by grep, and the remainder surfaced only when the tests RAN. The standing generalisation
applies unchanged: **a version sweep is not finished until every test touching the bumped surface has
run.** This inventory is the starting list, not the completion criterion.
