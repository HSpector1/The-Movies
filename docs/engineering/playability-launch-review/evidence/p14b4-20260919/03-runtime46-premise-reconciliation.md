# Runtime46 minter: exact serialized-slot premise correction

2026-09-19. Native test-author, bounded parent-authorized correction only.
Operational file: `tests/bridge-p14b4-mint-projection46.test.ts`.
No producer, validator, fixture, original inert draft, configuration or harness
change; no rerun, typecheck, commit, delegation or generated output in this task.

## Observed failure, not a producer defect claim

`02-mint-runtime46.txt` records the actual one-shot command on source
`c06db6eae2a1350317c018c6f108d115dcba7b19`, exit 1, start
`2026-09-19T21:14:09.819Z`, end `2026-09-19T21:14:25.437Z`,
`fixedSource:true`. Its failed assertion was original line 117:
`assert.deepEqual(prior.state, state)`. The following current-state deep equality
was not reached; do not report it as a second observed failure.

Read the complete plus/minus mismatch lines, not only the abbreviated summary.
The full diagnostic contains exactly six differing leaf pairs, all parsed
received `0` versus expected in-memory `-0`:

- Lines 9246–9247: `genreExpBefore` for event
  `studio-aca408ec-r04:film:3:person-studio-aca408ec-r04-3`.
- Lines 18580–18581, 31427–31428, 33137–33138, 39962–39963,
  45122–45123: five `perceived` talent genre-experience values.

The raw log and executed minter archive remain unchanged. Original executed
minter SHA256 (also independently matched the operational file before editing):
`de0758b107f82fef55eff1f3e97f94c47859d216f3c9e50b85b0eb79cf3a50b6`.
Archive: `02-mint-runtime46.executed.ts.txt`.

## Source-backed serialization authority

- `src/core/save.ts:6388`: `makeSave` first calls strict `validateSaveV29`, then
  detaches with `JSON.parse(JSON.stringify(save))`. The existing JSON boundary
  does not preserve JavaScript signed zero; it is not a persisted distinction.
  Validation occurs BEFORE detachment, so non-JSON or invalid data is not silently
  repaired by this comparison.
- `save.ts:6405` and `:6411`: `exportSave` validates and uses `stableStringify`;
  `exportCurrentState` uses `stableStringify(makeSave(state))`. The primitive
  serialization owner at `save.ts:534` uses `String(v)` for finite numbers,
  which likewise serializes signed zero as `0`.
- `ui/src/engine/adapter.ts:3779` delegates `exportSaveJson` to that writer.
  `bridge/snapshot-build-context.ts:112` obtains its cached save JSON from the
  adapter, not a different serializer.
- `bridge/session.ts:1973` saves those canonical bytes from the then-current
  state; `:1411` exports current bytes from the current state and preserves the
  separately saved slot. `bridge/runtime-checkpoint.ts:440` strictly admits only
  canonical V29 inner saves and verifies their export bytes exactly.

The already-passed raw-slot validation/canonical checks do not prove that a slot
contains the correct intended state. Therefore the correction keeps those checks
AND compares each complete slot against its OWN expected state's governed writer
bytes. It does not compare the two slots with one another, drop fields, normalize
selected leaves, introduce tolerance, or bypass validation.

## Exact bounded change

Import `makeSave` from the existing save owner. Replace only the two impossible
in-memory deep-equality comparisons with:

```ts
assert.equal(checkpoint.savedSaveJson, exportSave(makeSave(state)))
assert.equal(checkpoint.currentSaveJson, exportSave(makeSave(session.gameState)))
```

A one-line comment explains the signed-zero boundary. This strengthens expected
slot identity to exact complete serialized envelopes (including seed and
broadcast cache), rather than a partial state-root comparison. All strict V29
validation, distinct-slot assertion, same-week assertion, promise/first-take/RNG
identity, protocol/schema/revision checks, two journal routes, canonical outer
roundtrip, retry replay, compression identity, pre/post producer gates and
no-overwrite checks remain unchanged. Timeout remains unchanged.

Corrected operational minter SHA256:
`58e3a9554026089616f96c309cc4dc1ad6b909c87936c9c129165fb77c96c5b6`.
Read-only `diff -u` against the immutable archive showed exactly two hunks:
the import and the two assertions/comment; exit 1 is the expected text-difference
status, not a test execution.

## Output and next action

Read-only `test ! -e tests/fixtures/p14/genuine-projection46-runtime` returned 0
before and after this correction: the output directory is absent. No output was
removed or recreated. The failed original minter did not reach its writes.

The correction is UNVERIFIED at runtime. Parent owns independent review and the
sole authorized fixed-source rerun. Do not label the earlier failed command as a
successful mint or claim a runtime46 artifact until the rerun actually publishes
and verifies its bytes.
