# 700-T2 — P14B.6 values-only test sweep (projection 48 -> 49)

Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`,
HEAD `ad49031f` (P14B.6 S4 wire). Test side only. No commit. `record-check.mjs` not invoked.

Running identities read independently of any test, from the checked-in artifacts:

| fact | value | source |
|---|---|---|
| `PROJECTION_VERSION` | 49 | `bridge/schema/bridge-schema.ts:251` |
| running `SCHEMA_ID` | `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b` | `generated/unity/project-studio-bridge.contract-manifest.json`, `generated/unity/StudioBridgeDtos.Generated.cs:3` |
| schema `$id` | `urn:project-studio:bridge:protocol-4:projection-49` | `bridge/schema/project-studio-bridge.schema.json` |
| outgoing prior | `sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec` -> `projection-v48` | `bridge/runtime-checkpoint.ts:65` |
| prior roster size | 37 (34 literal map entries + `PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID`, `ACCEPTED_P12_SCHEMA_ID`, `R05_NATIVE_FOUNDING_SCHEMA_ID`) | `bridge/runtime-checkpoint.ts:59-130` |
| `LIVE_SAVE_VERSION` | 31, unchanged | B.6 adds no save state |

Sorted-set delta verified mechanically: the live 37-key roster minus the 36-entry
`EXPECTED_PRIOR_IDS` literal in `tests/bridge-p14b4-runtime47-compatibility.test.ts` is exactly
`sha256:00c0075b…`, which sorts FIRST (before `sha256:01f15efc…`).

## By-class grep results

Every class was grepped across `tests/`, `ui/` and `scripts/`. Classes with zero live hits are
listed with that result, not omitted.

### Class A — version literals (`PROJECTION_VERSION` pins). 41 live hits, all swept.

- `expect(PROJECTION_VERSION).toBe(48)` -> `(49)` — 25 files.
- `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(48)` -> `(49)` — 10 files.
- response/page `snapshotVersion` pins `.toBe(48)` -> `(49)` — 5 files.
- `expect(SNAPSHOT_VERSION).toBe(48)` -> `(49)` — `tests/bridge.test.ts:167` (`bridge/protocol.ts:34` aliases `PROJECTION_VERSION`).

### Class B — `projection-48` `$id` strings. 15 live hits, all swept to `projection-49`.

Both the `toBe('urn:…:projection-48')` and `toContain('projection-48')` forms, plus the template
forms `…:projection-48\`` in the p14a/p14b files, plus one live test title
(`tests/bridge-operations-events.test.ts:323`, "the served projection-48 envelope").

Other 48-literals in the same class, all swept:
`tests/bridge-schema.test.ts:81` `projectionVersion: 48,`; `:341` `/expected literal 48/`;
`:576` `'public const int ProjectionVersion = 48;'`;
`tests/bridge-contract-generator.test.ts:562` `generateCsharpContract({ …, projectionVersion: 48 })`.

Deliberately NOT touched (not this class): `tests/bridge-p14b5-relationships.test.ts:115/119/123`
(`rows: 48, settled: 48` — ledger row counts), `tests/c2a-m3-screenplay-vocabulary.test.ts:139`,
`tests/property-state-v13.test.ts:488`, `ui/src/lot/**` geometry, and all
`tests/fixtures/p14/genuine-projection48-runtime/**` bytes.

### Class C — schema-identity literal. 3 live hits, all swept.

Old running `sha256:00c0075b…` -> new running `sha256:60af24c5…`:
- `tests/bridge-contract-generator.test.ts:565` (`'// Schema identity: …'` in generated C#)
- `tests/bridge-contract-generator.test.ts:568` (`schemaIdentity(schema)`)
- `tests/bridge-p14b5-relationships.test.ts:289` (`expect(SCHEMA_ID).toBe(…)`)

`00c0075b…` survives, correctly, as a PRIOR literal in the two rosters below and inside the
`genuine-projection48-runtime` fixture (untouched).

### Class D — prior-id rosters and exact-count pins. 3 live rosters.

- `tests/bridge-p14b4-runtime47-compatibility.test.ts` `EXPECTED_PRIOR_IDS`: 36 -> 37, the new
  literal inserted in SORTED position (first), with a provenance comment. Its exact-count pin
  at `:177` (`toEqual(EXPECTED_PRIOR_IDS)`) is unchanged in form; the case title
  `exact 36 prior IDs` -> `exact 37 prior IDs` and `literal projection48` -> `projection49`.
- `tests/bridge-runtime-checkpoint.test.ts:972` literal list ("contains exactly the independently
  pinned historical protocol-4 identities"): new literal inserted in sorted position (first) with
  a provenance comment.
- `tests/bridge-p14b5-relationships.test.ts` (two cases, `:292` and `:339`): new const
  `OUTGOING_48` added and both exact-set equalities extended to
  `[...EXPECTED_35_PRIOR_IDS, OUTGOING_47, OUTGOING_48].sort()`. Exactness (`toEqual` on a sorted
  key list) is preserved; no `toContain`, no size-only pin, no weakening.
- `tests/bridge-p14b6-relationship-read-models.test.ts` already carries `EXPECTED_36_PRIOR_IDS`,
  `OUTGOING_48` and `.size).toBe(37)`. NOT TOUCHED (B.6 RED).

### Class E — generated C#/manifest sentinels. 1 live hit.

`tests/bridge-schema.test.ts:576` `public const int ProjectionVersion = 48;` -> `49`. Swept.
`tests/bridge-p14b5-relationships.test.ts:307-313` reads the manifest and C# against
`SCHEMA_ID` / `PROJECTION_VERSION` symbolically — no literal to move.
The only literal artifact sha in tests, `tests/bridge-p14b4-runtime47-compatibility.test.ts:125`
(`generated/unity/StudioBridgeDtos.Generated.cs: 1b5c7e88…`), is the projection-46 FIXTURE's
recorded source-file hash, not the live artifact. Correctly left alone.

### Class F — UI pins. ZERO live occurrences.

`ui/src` and `ui/e2e` contain no `PROJECTION_VERSION`, no `projection-4x` `$id` and no schema-id
literal. The single hit, `ui/e2e/p11-core-v1/manifest.json:7` `"projectionVersion": 24`, is a frozen
P11 e2e fixture that no prior bump swept and that this sweep also leaves alone.

### Classes checked with ZERO live hits

- `PROTOCOL_VERSION` pins: still 4 everywhere; nothing stale.
- `LIVE_SAVE_VERSION` / `saveVersion` pins: still 31; B.6 moved no save version.
- Migration-name pins (`migrateToV31`): unchanged.
- `scripts/` : no version or schema-id literal.
- `.cs` / `.json` under `generated/`: production, out of scope, and verified by command 5.

## Files changed (28) — old -> new

All 28 are under `tests/`. No `src/`, `bridge/`, `generated/`, `ui/src` or config file was touched.
No fixture byte was touched. `tests/bridge-p14b6-relationship-read-models.test.ts` was not touched.

| file | change |
|---|---|
| `tests/bridge-contract-generator.test.ts` | `projectionVersion: 48`->`49`; `// Schema identity: sha256:00c0075b…`->`60af24c5…`; `schemaIdentity` literal `00c0075b…`->`60af24c5…` |
| `tests/bridge-operations-events.test.ts` | title `projection-48`->`projection-49`; `PROJECTION_VERSION` 48->49 |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | `PROJECTION_VERSION` 48->49 |
| `tests/bridge-owner-ux-projection21-schema.test.ts` | `PROJECTION_VERSION` 48->49; `$id` `projection-48`->`-49` |
| `tests/bridge-p10a-w0-people-projection.test.ts` | `PROJECTION_VERSION` 48->49; `$id` `projection-48`->`-49` |
| `tests/bridge-p11-capital-contributors.test.ts` | `PROJECTION_VERSION` 48->49 |
| `tests/bridge-p11-ready.test.ts` | `PROJECTION_VERSION` 48->49 |
| `tests/bridge-p13b-r07-setup.test.ts` | `PROJECTION_VERSION` 48->49; `$id` `toContain('projection-48')`->`-49`; `x-project-studio.projectionVersion` 48->49 |
| `tests/bridge-p13b-s1b-seats.test.ts` | `PROJECTION_VERSION` 48->49; `page.snapshotVersion` 48->49 |
| `tests/bridge-p13b-s2-labs.test.ts` | `PROJECTION_VERSION` 48->49; `response.snapshotVersion` 48->49 |
| `tests/bridge-p13b-s3-plans.test.ts` | `PROJECTION_VERSION` 48->49; `plans.snapshotVersion` 48->49 |
| `tests/bridge-p13b-s4-office.test.ts` | `PROJECTION_VERSION` 48->49; `response.snapshotVersion` 48->49 |
| `tests/bridge-p13b-s5-adoption.test.ts` | `PROJECTION_VERSION` 48->49; `$id` `projection-48`->`-49`; `x-project-studio.projectionVersion` 48->49 |
| `tests/bridge-p13b-s6-cancellation.test.ts` | same three |
| `tests/bridge-p13b-s7-disclosure.test.ts` | same three |
| `tests/bridge-p13b-s8-rivals.test.ts` | same three (the historical `// RED: today PROJECTION_VERSION is 40` comment left verbatim) |
| `tests/bridge-p14a1-market.test.ts` | same three |
| `tests/bridge-p14a2-market.test.ts` | same three |
| `tests/bridge-p14a3-world.test.ts` | same three |
| `tests/bridge-p14b1-promises.test.ts` | same three |
| `tests/bridge-p14b2-trust.test.ts` | same three |
| `tests/bridge-p14b3-promise-command.test.ts` | `PROJECTION_VERSION` 48->49 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | `EXPECTED_PRIOR_IDS` 36->37 (`00c0075b…` first, with provenance comment); roster header comment; title `projection48`/`36 prior IDs`->`projection49`/`37 prior IDs`; `PROJECTION_VERSION` 48->49 |
| `tests/bridge-p14b5-relationships.test.ts` | header FROZEN-SIDE block restated (48/`00c0075b…`/36 -> 49/`60af24c5…`/37); new `const OUTGOING_48`; cross-ref line range `:39-75`->`:41-83`; describe + two case titles restated; `PROJECTION_VERSION` 48->49; `SCHEMA_ID` `00c0075b…`->`60af24c5…`; manifest-commit comment `040651b4`->`ad49031f`; both exact-set equalities gain `OUTGOING_48` |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | `PROJECTION_VERSION` 48->49; `$id` `projection-48`->`-49`; `response.snapshotVersion` 48->49 |
| `tests/bridge-runtime-checkpoint.test.ts` | `00c0075b…` inserted in sorted position into the exact historical-identity list, with provenance comment (4 added lines, 0 removed) |
| `tests/bridge-schema.test.ts` | `projectionVersion: 48`->`49`; `$id` `projection-48`->`-49`; `PROJECTION_VERSION` 48->49; `/expected literal 48/`->`/49/`; `ProjectionVersion = 48;`->`49;` |
| `tests/bridge.test.ts` | `SNAPSHOT_VERSION` 48->49 |

### The landed leak law is GREEN and UNAMENDED

`tests/bridge-p14b5-relationships.test.ts` case "the D5 settlement sentence reaches
settlementReasons VERBATIM … and no closeness, edge or driver leaks onto any serialized DTO"
(now at `:382`, probe line `:411`) has ZERO diff lines. The seven-probe list
`['"closeness":', '"edgeId":', 'relationship-edge-', '"recent":', '"relationships":',
'"lastEventWeek":', '"peakTier":']` is byte-identical to HEAD. It passed in command 1.

## Commands actually run (all from the worktree root)

### 1. `npx vitest run tests/bridge-p14b5-relationships.test.ts tests/bridge-p14b4-runtime47-compatibility.test.ts --reporter=basic`

```
 ✓ |core| tests/bridge-p14b4-runtime47-compatibility.test.ts (6 tests) 11476ms
 ✓ |core| tests/bridge-p14b5-relationships.test.ts (15 tests) 41258ms
 Test Files  2 passed (2)
      Tests  21 passed (21)
   Duration  45.51s
```
Includes the leak-law case: `✓ … the D5 settlement sentence reaches settlementReasons VERBATIM
on the family-6 world, and no closeness, edge or driver leaks onto any serialized DTO 8771ms`.

### 2. `npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=basic`

```
 ✓ |core| tests/bridge-p14b6-relationship-read-models.test.ts (24 tests) 6862ms
 Test Files  1 passed (1)
      Tests  24 passed (24)
   Duration  10.61s
```
24/24, file unmodified.

### 3. `npx vitest run tests/p14b5-relationships.test.ts tests/p14b5-save-v31.test.ts tests/p14b5-t-failure-tuning.test.ts --reporter=basic`

```
 Test Files  3 passed (3)
      Tests  115 passed (115)
   Duration  36.54s
```

### 4. `npm run typecheck && npm run typecheck:bridge`

```
> tsc --noEmit && tsc -p ui/tsconfig.json --noEmit
(no output)

> tsc -p tsconfig.bridge.json
(no output)
```
Both clean.

### 5. `npm run check:bridge-contract && npm run check:bridge-contract:fixtures`

```
verified …/bridge/schema/project-studio-bridge.schema.json
verified …/generated/unity/StudioBridgeDtos.Generated.cs
verified …/generated/unity/project-studio-bridge.contract-manifest.json
verified …/generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs
```

### 6 (not requested, run on my own rationale: I edited 28 files and will not report an unrun edit)

`npx vitest run <all 28 changed files> --reporter=basic`

```
 Test Files  2 failed | 26 passed (28)
      Tests  2 failed | 434 passed | 2 todo (438)
   Duration  701.04s
```
Log: `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/tasks/bzsamgswr.output`

## NOT a pure value move — two pre-existing B.6 regressions this sweep does NOT fix

Both failures PRE-DATE the sweep. Proof: I restored `tests/bridge-contract-generator.test.ts` and
`tests/bridge-schema.test.ts` to their HEAD `ad49031f` bytes (`git checkout --`), ran them, and got
SIX failures; four were version-class and the sweep fixed those four. The two below are unchanged
by the sweep in either direction.

Pre-sweep (HEAD bytes, 6 failed / 47 passed):

```
 FAIL tests/bridge-contract-generator.test.ts > … > F10 emits sound request and response union shapes without changing schema identity
      expected '…' to contain '// Schema identity: sha256:00c0075bef…'            [VERSION-CLASS - fixed]
 FAIL tests/bridge-contract-generator.test.ts > … > pins exact positive output identities and deterministic rerendering
      F10_CURRENT_QUOTE_UNIONS: expected 'd54e9472…' to be '53058c23…'            [CONTENT-CLASS - REMAINS]
 FAIL tests/bridge-schema.test.ts > … > closes every declared object recursively and publishes explicit protocol metadata
      expected { …(5) } to match object { protocolVersion: 4, …(2) }              [VERSION-CLASS - fixed]
 FAIL tests/bridge-schema.test.ts > … > rejects missing, additional, wrong-enum, wrong-nullability, and old-projection data
      expected 49 to be 48                                                        [VERSION-CLASS - fixed]
 FAIL tests/bridge-schema.test.ts > … > keeps checked-in JSON and generated C# byte-derived from the canonical schema
      expected '…' to contain 'public const int ProjectionVersion = …'            [VERSION-CLASS - fixed]
 FAIL tests/bridge-schema.test.ts > … > P04A casting schema — closed union coverage > validates a commission AND a casting quote through the SAME StudioQuoteSnapshot union, closed with P11 finances confined to the shared envelope
      BridgeSchemaError: $: matched no allowed type ($.consequence: required property is missing;
      $.chemistry: required property is missing; $.blueprintId: …)                [CONTENT-CLASS - REMAINS]
```

### R1 — `tests/bridge-schema.test.ts:880`: `chemistry` / `chemistryWarning` are REQUIRED on the casting quote wire

`bridge/schema/project-studio-bridge.schema.json` `$defs.StudioCastingQuoteSnapshot.required`
now contains both `chemistry` and `chemistryWarning` (landed by `0e0c8a75`, P14B.6 S3). The
hand-built casting-quote envelope in this case carries neither, so it no longer matches ANY member
of the closed `StudioQuoteSnapshot` union and `parseWireValue` throws.

This is a real, breaking wire change, not a stale number: every producer of a
`StudioCastingQuoteSnapshot` — including any Unity-side or replay consumer that builds one — must
now emit `chemistry` and `chemistryWarning`. Fixing the test requires AUTHORING chemistry content
into a fixture envelope, which is a B.6 content decision, not a version value. I did not touch it.

Owner/PM question the sweep cannot answer: should `chemistry`/`chemistryWarning` be REQUIRED, or
nullable/optional with the pre-feature display form (B.6 ruling 3 (ii) already defines a
counts-only pre-feature form for the rootless case)? A required field forces every existing
serialized casting quote to be re-minted.

### R2 — `tests/bridge-contract-generator.test.ts:686`: the whole-schema C# declaration-body digest moved

`F10_CURRENT_QUOTE_UNIONS` and `F11_CURRENT_COMMAND_UNION` render the WHOLE running schema (the
file's own comment says so, and the two pinned digests are the same literal). B.6 S1/S3 added
`StudioRelationshipBlock`, `StudioRelationshipRow` and `StudioCastingChemistryRow` `$defs` plus the
`chemistry` / `chemistryWarning` members, so `generateCsharpTypeDeclarations` legitimately emits a
different body: `53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e`
-> `d54e94725f3a8b516493a7a7e1a65727bd3b6…` (the reporter truncates; the full value must be
re-derived by the generator, not by this test).

The loop `for (const [name, expectedHash] of Object.entries(expected))` throws on the first
mismatch, so `F11_CURRENT_COMMAND_UNION` is not yet reported but pins the same stale literal and
will also need re-derivation. `F12_P05_PRODUCTION_SENTINEL` is a frozen subset and should NOT move
— that is the guard which proves the change is confined.

This pin's stated discipline is "Value computed once by the generator on <commit>, not by this test
against itself" (662-T2 used `662-T2-gen-hash.log`). Re-deriving it is a generator measurement on
the B.6 content change, outside a version-value sweep, and doing it from the failure message would
be exactly the "copy the implementation output" move the role forbids. I did not touch it.
Whoever owns the B.6 content sweep must produce a `700-*-gen-hash.log` the way 662-T2 did.

## Evidence limits

- Nothing was committed. 28 modified files sit in the working tree.
- Beyond the 28 changed files and the five required commands, no other suite was run; a regression
  in an unedited, unrun suite would not appear here.
- `record-check.mjs` was not invoked (instructed).
- No native/Unity run, no browser prototype, no human play. TS source + vitest only.

---

# Addendum — R1 and R2 resolved (same pass, same worktree, still uncommitted)

The coordinator returned both blockers with evidence. I verified each claim at source before
editing; neither was taken on assertion.

## R1 RESOLVED — the keys were never optional; the pre-feature form is `null`, not an absent key

Verified independently at `bridge/schema/bridge-schema.ts:1912-1919`:

```ts
chemistry: nullable(array(reference('StudioCastingChemistryRow', StudioCastingChemistryRow))),
chemistryWarning: nullable(text()),
```

and in the emitted `bridge/schema/project-studio-bridge.schema.json`:

```
chemistry required: True          chemistry:        {"anyOf": [{"items": {"$ref": ".../StudioCastingChemistryRow"}, "type": "array"}, {"type": "null"}]}
chemistryWarning required: True   chemistryWarning: {"anyOf": [{"type": "string"}, {"type": "null"}]}
```

So `nullable` widens the VALUE and leaves the KEY required — which is the structural closure this
very case asserts twelve lines later with its `weeklyBurn` / `runwayWeeks` rejections. No Owner
ruling is needed and my R1 escalation was answerable from the contract. The landed precedent is the
same shape (`trust: reference('StudioTrustBlock', …)` at `:2637`, key-required and block-valued).

**Fix — `tests/bridge-schema.test.ts`, two hand-built envelopes, both keys added. Values chosen and why:**

- `screenTestQuote` (`kind: 'startAuditions'`) -> `chemistry: null`, `chemistryWarning: null`.
  A screen test proposes no four-seat package, so no seating exists to read. This is the writer's
  own stated law at `bridge-schema.ts:1912-1915` ("Both are null for a screen test and a contract
  signing, neither of which proposes a four-seat package"), not a convenience.
- `greenlightQuote` (`kind: 'greenlightPicture'`) -> one representative `StudioCastingChemistryRow`,
  `chemistryWarning: null`.
  This envelope DOES model a seating (it already carries `strongestAssignmentLine` "Director Some
  Director" and `weakestAssignmentLine` "Support Some Actor"), so per the coordinator's instruction
  it carries content rather than null and the closed union is exercised with a real row:

  ```
  { seatA: 'director', seatB: 'support', talentIdA: 't-dir-01', talentIdB: 't-act-01',
    tierLabel: 'Colleagues', sign: 1, drivers: ['Two pictures together.'],
    line: 'They have worked together before.' }
  ```

  Shape checked against the projector `castingChemistryRows` (`bridge/relationships.ts:162-179`):
  seat labels, talent ids, a tier label, an integer `sign`, a driver phrase list and one sentence.
  Labels, a sentence and an integer only — no closeness, no `edgeId`, no `recent`, no delta, so the
  row is inside the landed leak law. The strings are deliberately synthetic, matching every
  neighbouring value in this envelope ("Some Title", "Fit 80/100."); nothing here is copied from
  engine output or presented as engine copy.
  `chemistryWarning` is `null` because ruling 3 (iii) emits its one sentence only when a seated pair
  reads `-1`, and this row reads `+1`. A non-null warning beside a `+1` row would be an internally
  inconsistent DTO.

**Closure assertions NOT weakened.** The two `BridgeSchemaError` expectations that follow
(`{ ...greenlightQuote, weeklyBurn: 100 }` and `{ ...greenlightQuote, runwayWeeks: 10 }`) are
unchanged, and they now spread an envelope that is one member richer — strictly a stronger test of
`additionalProperties: false` than before.

## R2 RESOLVED — F10/F11 taken from the independent probe log, F12 NOT TOUCHED

I verified the archived evidence rather than trusting it:

- `shasum -a 256 docs/…/700-gen-hash-probe.ts` = `77983f7ef376b4d0c22a84bd47095fc386a6fa7d3b4676445d97654b568a0d81` — matches the claimed probe identity.
- Read the probe: it imports `generateCsharpTypeDeclarations` and the union fixtures, renders each
  fixture TWICE, `throw`s if the two renders differ, and `throw`s if F12 moves off
  `78d68a2d…`. It never reads a test failure message.
- `700-gen-hash.txt` record-check envelope: `exitCode: 0`, `fixedSource: true`,
  `sourceSha d749b3ea…` equal at start and end, `projectionVersion 49`, `node v20.20.2 darwin x64`,
  `deterministic: true` on all three.

Applied to `tests/bridge-contract-generator.test.ts:688-689`:

| fixture | old | new |
|---|---|---|
| `F10_CURRENT_QUOTE_UNIONS` | `53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e` | `d54e94725f3a8b516493a7a7e1a65727bd3b61019228763a63d8e9facfb9f139` (373576 bytes) |
| `F11_CURRENT_COMMAND_UNION` | `53058c23075427647bf9e24052128cd4f7ad0340fa54763e3e75df25aeea482e` | `d54e94725f3a8b516493a7a7e1a65727bd3b61019228763a63d8e9facfb9f139` (373576 bytes) |
| `F12_P05_PRODUCTION_SENTINEL` | `78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6` | **UNCHANGED — not touched** (15018 bytes) |

The comment above the literals follows the file's existing convention: it records that the value was
recomputed once by the generator for P14B.6 (projection 49) in `700-gen-hash.txt`, not by this test
against itself, and states WHY it moved (S1 added `StudioRelationshipBlock`,
`StudioRelationshipRow`, `StudioCastingChemistryRow`; S3 added the two quote members; F10/F11 render
the whole schema so the declaration body grew). It also records that F12 is the frozen P05 subset,
is independent of those `$defs`, must not move, and that its unchanged value is the evidence B.6
stayed inside its scope.

## Verification after R1 + R2 (each run separately, actual output)

### 1. `npx vitest run tests/bridge-schema.test.ts tests/bridge-contract-generator.test.ts --reporter=basic`

```
 ✓ |core| tests/bridge-contract-generator.test.ts (31 tests) 2929ms
 ✓ |core| tests/bridge-schema.test.ts (22 tests) 34075ms
 Test Files  2 passed (2)
      Tests  53 passed (53)
   Duration  38.77s
```
Both previously-failing cases now pass; the other 47 that already passed still do (6 failed / 47
passed at HEAD -> 0 failed / 53 passed).

### 2. `npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=basic`

```
 ✓ |core| tests/bridge-p14b6-relationship-read-models.test.ts (24 tests) 6713ms
 Test Files  1 passed (1)
      Tests  24 passed (24)
```
Still 24/24. `git status --short` on that path returns nothing — the B.6 RED was never modified.

### 3. `npx vitest run tests/bridge-p14b5-relationships.test.ts --reporter=basic`

```
 ✓ |core| tests/bridge-p14b5-relationships.test.ts (15 tests) 33136ms
 Test Files  1 passed (1)
      Tests  15 passed (15)
```
Leak-law probe list byte-compared against HEAD: the exact line
`for (const leak of ['"closeness":', '"edgeId":', 'relationship-edge-', '"recent":', '"relationships":', '"lastEventWeek":', '"peakTier":']) expect(dto).not.toContain(leak)`
occurs once in `git show HEAD:tests/bridge-p14b5-relationships.test.ts` and once in the working
copy. Identical.

### 4. `npx vitest run <all 28 changed files> --reporter=basic`

```
 Test Files  28 passed (28)
      Tests  436 passed | 2 todo (438)
   Duration  697.80s
```
Was `2 failed | 434 passed`; now zero failures. Log:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/tasks/bic0tqtsp.output`

### 5 (extra, mine): `npm run typecheck && npm run typecheck:bridge`

Both clean, no output. Run because R1 added object literals to a test file; a type error there is
exactly what a values edit can introduce.

## Standing limits, unchanged

- Nothing committed. 28 modified test files plus this untracked report.
- No `src/`, `bridge/`, `generated/`, `ui/src` or config file touched; no fixture byte touched;
  `tests/bridge-p14b6-relationship-read-models.test.ts` untouched.
- `record-check.mjs` not invoked by me (the R2 probe was run through it by the coordinator, and I
  read its archived envelope rather than re-running it).
- No native/Unity run, no browser prototype, no human play. A green suite is not usability.
