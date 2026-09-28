# 1301-D — Independent review of staged live-pin maintenance (1301-C + addendum 1301-C2)

Independent contract-auditor review (read-only tools: Read, Glob, Grep), persisted verbatim by the parent.

KEEP

## Summary

I read 1301-A/B/F (authority), both handbacks (C, C2), both classification JSONs in full (200 + 45 rows), and cross-checked 50+ individual rows against the actual live source at the cited file:line across every class (A-direct, B-projection-form, C-derived-saveVersion, 1c-future-version-refusal), both CHANGE and KEEP, spanning `tests/`, `tests/contracts/`, and `ui/src/`. I also read the governing source directly: `src/core/save.ts:5395-5418` (dispatcher, versions 1-40, message "...through 40 only"), `:6538` (`LIVE_SAVE_VERSION = 40`), `:10295-10310` (`validateSaveV38` requires `saveVersion === 38` exactly), `bridge/schema/bridge-schema.ts:21,281,3760` (`PROTOCOL_VERSION=4`, `PROJECTION_VERSION=55`, `$id` template), and `bridge/runtime-checkpoint.ts:880-886,911` (governed-prior-path calls `migrateToLive`).

Every sampled row matched its cited producing line, and every classification decision was correct given that line. I did not find a single wrongly-CHANGED or wrongly-KEPT pin. No rows to flip.

## Row-by-row confirmations (representative, not exhaustive)

- A-direct: `tests/bridge-p13b-s8-rivals.test.ts:223,225`, `tests/bridge-p14b8-waiver-surface.test.ts:776,778`, `tests/bridge-p14b6-relationship-read-models.test.ts:760` — all direct `PROJECTION_VERSION`/`LIVE_SAVE_VERSION` comparisons, correctly CHANGE.
- B-projection-form CHANGE: `tests/bridge-schema.test.ts:81,84,340,341` (`$id`, `projectionVersion:`, `.toThrow(/expected literal N/)`) all verified live-metadata forms, correctly 55/56.
- B-projection-form KEEP: `tests/bridge-contract-generator.test.ts:564` — verified `generated = generateCsharpContract({..., projectionVersion:54})` is compared against a checked-in sha256 hash (line 566); bumping the literal without regenerating would break a passing test. Correctly flagged for a dedicated re-measurement increment, not blind-edited. `tests/bridge-p14b6-relationship-read-models.test.ts:756-758` — confirmed the paired assertion compares `PROJECTION_VERSION` to a local constant `INCOMING_PROJECTION`, not a numeral; title correctly left as historical narration.
- C-derived CHANGE: verified writer provenance for `bridge-p13b-s8-rivals.test.ts:233/404` (`session.save()`), `bridge-runtime-checkpoint.test.ts` (`fixture()` at line 57 uses `createBridgeInitialState`, a fresh writer), `bridge-p14b8-waiver-surface.test.ts:817-818` (governed-prior-path load, confirmed calls `migrateToLive` per `runtime-checkpoint.ts:886`), `ui/src/session.test.tsx:332` and `ui/src/saves.test.tsx:126` — all genuinely current-writer output.
- C-derived KEEP: verified fixture-provenance MANIFEST.json reads (`bridge-p14c2rm-runtime.test.ts:45`, `bridge-p14c2s-scientist-runtime.test.ts:63`), frozen-validator required-input scaffolds (`p14b3-rule-revision.test.ts:161`, `validateSaveV38({saveVersion:38,...})` — required by the version guard at `save.ts:10297`), and downgrade-target forged probes (`p13b-r07-save-v25.test.ts:267`, `construction-save-v11.test.ts:553-554`).
- `tests/p14c3-save-v38.test.ts:1-70` — read in full. Confirmed 1301-F Amendment 3's "line 32" is indeed a prose typo; line 38 is the exact `migrateToLive` assertion, and line 63 (`convertV37ToV38`) is correctly excluded as a historical step-converter, matching the handback's own note.

## Finding 1 (masking check) — confirmed correct

`tests/bridge-p14c2s-scientist-runtime.test.ts:97-100`: read directly. `actualJson = loaded.hydrated.checkpoint[slot]` comes from `loadBridgeRuntimeCheckpoint`'s governed-prior path, which calls `migrateToLive` internally (confirmed at `bridge/runtime-checkpoint.ts:886`). `validateSaveV38(importSave(actualJson!))` at line 99 requires `saveVersion===38` exactly and throws first, before line 100's own `.toBe(38)` is ever reached. The KEEP is correct: this is a genuine pre-existing defect (validator selection, not a literal), correctly not masked by this patch.

## 1c expansion (review focus 3) — confirmed correct

Read all three added sites plus the four excluded sites directly. `d17a-adv-migration.test.ts:274`, `d17b-save-v7.test.ts:163`, `contracts/v14-boundary-guards.contract.test.ts:320` are the identical forge-live+1/dispatcher-refusal pattern (the contract test's own comment at lines 315-317 states the law explicitly). Correctly excluded: `bridge-p06-checkpoint-recovery.test.ts:288` (sentinel 99, not live+1), `migration.test.ts:118-121` (`validateSaveV2`, a version-specific validator, not the dispatcher), `p14p3-directing-promises.test.ts:324,635` (`validateSaveV38` frozen-reader call).

On the bare-`.toThrow()` leaf `tests/save.test.ts:288`: I traced `wellFormedSave()` (line 248-251, `makeSave(state)`, current V40 shape) forged to `saveVersion:39`. Since `validateSaveV39` now exists in the dispatcher, the OLD code would route through it and throw for a shape mismatch (V40-shaped data called V39), not for "unknown future version" — the leaf's actual intent per its describe title ("§17 — loud rejection of an unknown saveVersion"). The bare `.toThrow()` masks this drift either way (pass/fail unchanged), but the fix is not cosmetic: it restores which code path the test actually exercises. Correctly changed.

## Stage2 superset (review focus 6) — confirmed correct

Read `1301-stage2/tests/p13b-s2-save-v22.test.ts:205-219` against the live file. C's original edit (line 208, `toBe(38)`→`toBe(40)`) is preserved, and the addendum's two 1c edits (line 211 title, line 214 combined forged+regex) are correctly layered on top, matching the handback's claimed byte content exactly. 144 (C) + 44 (addendum) = 188 changed line pairs matches the parent's shell-measured total.

## Titles

C made zero title edits (disclosed, conservative). Addendum's semantic title rule verified correct on `property-state-v13.test.ts:941` (leaves "V37" alone, correctly not a rule-1c fact) and `d17b-save-v7.test.ts:161` (leaves "V7 through V36" alone, updates only "now 37"→"now 41").

## Minor, non-blocking observations (not defects)

- `tests/bridge-p13b-s8-rivals.test.ts:223` carries a very stale inline comment ("RED: today PROJECTION_VERSION is 40") and the describe title at line 221 references an old "40→41" bump; both are legitimately out of rule 1b/5 scope (comment/unrelated historical title, not the literal that changed) but are confusing for a future reader. Worth a follow-up note, not a patch defect.
- The three self-disclosed unaddressed pin forms (inline `expect(x,'message').toBe(N)` strings, title-prose "handled range" numbers without the word `saveVersion`, and the generator-dependent hash at `bridge-contract-generator.test.ts:564`) are honestly reported, not silently dropped.

## Could not verify

Did not execute vitest, tsc, or any generator (READ_ONLY, no shell). Did not independently re-derive the full 145+45 row set from scratch; verification was a large, class-weighted sample (50+ rows), not exhaustive of all 245 classification rows. Did not verify the SHA256/byte-count claims in the handbacks by hashing (no shell) — relied on cross-reading actual file content at cited lines instead. Did not check gate 1302/1303 readiness (out of this task's scope). Did not independently confirm the 1296-A exclusion list is still exhaustive at current HEAD.
