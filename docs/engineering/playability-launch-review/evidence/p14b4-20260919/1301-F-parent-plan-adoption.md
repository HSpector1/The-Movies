# 1301-F: parent adoption of the live-pin maintenance and broad regression plan

The parent read frozen [1301-A](1301-A-live-pin-broad-regression-plan.md) and independent
[1301-B](1301-B-live-pin-broad-regression-plan-review.md) (REFINE) in full. Adopt A with all four B amendments as
binding conditions on 1301-C. A stays byte-frozen as reviewed; this record carries the amendments.

## Amendment 1: extended inventory

[1301-live-pin-inventory.json](1301-live-pin-inventory.json) supersedes A's direct-only grep. It is a filename-scoped
parent grep over tracked `tests/**` and `ui/src/**` test files (no fixture reads) with three classes, each row carrying
path, line, text and a 1296-A exclusion flag:

| Class | Pattern | In scope | In a 1296-A file |
|---|---|---:|---:|
| A-direct | `expect(LIVE_SAVE_VERSION or PROJECTION_VERSION or BRIDGE_SCHEMA...projectionVersion).toBe(N)` with N not live | 56 | 1 |
| B-projection-form | `projection-50..54`, `projectionVersion: 50..54`, `expected literal 50..54` | 26 | 0 |
| C-derived-saveVersion | a `saveVersion` literal 38 or 39 on the line | 118 | 1 |

It contains all nine B-named sites and `tests/p14c3-save-v38.test.ts:19`. It is a candidate list, not a verdict:
class B and C rows include history (fixture provenance manifests recording `saveVersion: 37, projectionVersion: 51`,
`projection-50` comments, prior-schema checks). The test author classifies every in-scope row and may add rows the
patterns miss; the inventory is not proven exhaustive, and the broad run remains the authority (GN).

## Amendment 2: rule coverage for projection forms

Rule 1b, added to A's rules: a `BRIDGE_SCHEMA.$id` string or template literal, a `.toContain('projection-N')` on the
current `$id`, a `toMatchObject` or object literal that describes the current generated schema, and a
`.toThrow(/expected literal N/)` whose literal is the current projection the parser demands, are live metadata. Change
N to 55 and keep a literal. The same forms are historical, and stay unchanged, when they describe a fixture's recorded
provenance, a prior schema registered as a prior, a comment, or an old-projection input the test feeds in. Each
changed and each retained row cites the line that decides it.

## Amendment 3: `tests/p14c3-save-v38.test.ts`

Lines 18-20 call the current writer: `saved = makeSave(world)`, then assert
`saved.saveVersion` with the message "existing makeSave must write the governed new envelope", then
`LIVE_SAVE_VERSION`. Line 32 asserts the `migrateToLive` result with "actual migration must change the current
envelope". These leaves describe current writer and migration output; the describe title names the C.3 cutover that
introduced these roots and stays as history. Under rule 2 the three version literals (19, 20, 32) become 40.
`PROMISE_RULES_VERSION` stays 4 (live `src/core/promises.ts:52`). The remaining root assertions then execute in the
broad run and are attributed there, not pre-judged.

## Amendment 4: collection proof, before and after

Keep the explicit 411-path allowlist. Vitest 2.1.9 selects a file when its lowercased relative path contains a
lowercased filter (`node_modules/vitest/dist/chunks/cli-api.DqsSTaIi.js:10044-10057`, `filterFiles`). Before
gate 1302 the parent proves, filenames only, that no lowercased excluded path contains any lowercased allowlist entry,
that each allowlist entry matches exactly one tracked core test, and that no untracked `*.test.ts` exists under
`tests/` (the bounded pre also refuses untracked source). No tracked `*.test.ts` exists under `tests/fixtures/`. After
the run, the parent extracts the per-file result lines from the raw output and requires set equality with the 411
paths and none of the six; the Vitest file total must equal 411. A mismatch is recorded as a gate failure, not
repaired by rerun. `--exclude` is not adopted: its interaction with workspace projects in 2.1.9 is unverified here.

## Order and ownership

1301-C (test-author, staged under `1301-stage/`, per-row table, inverse proof, no live edit) → 1301-D
(contract-auditor) → 1301-E parent application and publication → 1302 core → 1303 UI, sequential, bounded pre/post,
`advanceCap` -1 as a disclosed label, no commit until both posts of a gate close → I/J/K. The 1299 I/J/K closure of
gate 1300 proceeds independently. No compiler run for literal-only test edits (A's reasoning); if 1301-C changes
anything but literals and titles, the parent reassesses. Unity/native and Owner campaigns stay deferred.
