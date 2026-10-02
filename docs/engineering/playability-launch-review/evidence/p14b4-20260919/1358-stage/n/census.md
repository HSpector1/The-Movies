# 1358-N census: Save44 and projection-57 pin sites

Read on 2026-10-02 at HEAD `5245072a` (branch wip/headless-program-20260916-ts). `src` equals b0809602: Save43, projection 56.
Repo HEAD is now `2ff1bf89`; it differs from 5245072a only under `docs` (`git diff --quiet` over src, bridge, generated, scripts, ui, tests and the configs).
The post-image is the scratch tree `/Users/zacheryspector/studio-scratch/1358-n/tree`, tag `step4`: 5245072a without `tests/fixtures` plus
`1358-rel-sliceB-production-step4-r2.patch` (sha256 `2004b500b8d4be50…`). All 13 post-image blobs equal 1358-E2's table.

No test, type gate or node process ran. Every row comes from reading. `certain` marks a literal or shape that must move; `measure` marks a site that
1358-M2 or a sweep dry run must confirm. A line that needs two kinds of edit has two rows. `census.json` holds the same rows with the
full current text, the reason and the source (pins.txt category, 1358-J item, or `scan`), plus the examined sites that need no edit.

## Counts by class

| Class | Rows | certain | measure |
|---|---:|---:|---:|
| S1 | 286 | 286 | 0 |
| S2 | 136 | 136 | 0 |
| S3 | 30 | 30 | 0 |
| S4 | 45 | 45 | 0 |
| S5 | 19 | 2 | 17 |
| S6 | 15 | 15 | 0 |
| S7 | 1 | 1 | 0 |
| S8 | 5 | 0 | 5 |
| S9 | 32 | 0 | 32 |
| S10 | 6 | 0 | 6 |
| P1 | 75 | 75 | 0 |
| P2 | 15 | 15 | 0 |
| P3 | 1 | 1 | 0 |
| P4 | 2 | 2 | 0 |
| P5 | 17 | 17 | 0 |
| **all** | **685** | **625** | **60** |

Files with at least one row: 156. 20 rows plan no edit and name what the sweep must confirm there. Rows with an X5 measurement: 31.
Examined sites that need no edit: 123 (in `census.json`, `noEdit`). Out of scope: 2.

## Counts by group

| Group | Files | Rows | Classes | Scope |
|---|---:|---:|---|---|
| H | 15 | 62 | S1 42, S2 7, S4 9, S5 1, S9 2, S10 1 | helpers and acceptedEvidence (first, serial): the 11 shared helpers and the four saveApi callers of the renamed key |
| G1 | 13 | 84 | S1 27, S2 13, S3 1, S4 2, S5 3, S6 15, S7 1, S8 1, S9 5, S10 3, P1 2, P2 5, P3 1, P5 5 | relationship shapes: the p14b5 Edge type, staged and minted edges, hand-lifted states, Save42/43 tests |
| G2 | 20 | 60 | S2 14, P1 40, P2 4, P4 2 | Bridge A: projection 57 pins, the roster list, the generator test (F10/F11 after the recorded producer run) |
| G3 | 19 | 111 | S1 28, S2 35, S5 8, P1 33, P2 6, P5 1 | Bridge B: bridge-p14* projection, roster and live-save pins, and their S5 comparisons |
| G4 | 37 | 124 | S1 51, S2 34, S3 25, S9 3, S10 1, P5 10 | versions and UI: the eight UI pins, sentinels, the save-vNN files and the remaining S1/S2 files of that family |
| G5 | 18 | 137 | S1 57, S2 14, S3 4, S4 33, S5 2, S8 4, S9 22, P5 1 | chains and masking: live-to-older chains, first-guard leaves and the vacuous passes |
| G6 | 34 | 107 | S1 81, S2 19, S4 1, S5 5, S10 1 | the remaining core S1/S2/S5 files (p14b1-p14b4, p14p4p5, c2a, contracts, construction) |

## H: helpers and acceptedEvidence (first, serial): the 11 shared helpers and the four saveApi callers of the renamed key

### `tests/helpers/p14b2-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0001 | 7 | S1 | certain | `import { makeSave, validateSaveV43 } from '../../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0002 | 122 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(state))))` | validateSaveV43( -> validateSaveV44( |
| N-0003 | 244 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(outcome))))` | validateSaveV43( -> validateSaveV44( |
| N-0004 | 259 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(state))))` | validateSaveV43( -> validateSaveV44( |

### `tests/helpers/p14c2b-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0005 | 23 | S4 | certain | `import { convertV37ToV36, convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41To…` | add convertV44ToV43 to the import |
| N-0006 | 69 | S4 | certain | `return convertV37ToV36(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(co…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345, UI TS2345, Bridge TS2345 |
| N-0007 | 69 | S9 | measure | `return convertV37ToV36(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(co…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |

### `tests/helpers/p14c2c-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0008 | 8 | S1 | certain | `import { makeSave, validateSaveV43 } from '../../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0009 | 29 | S1 | certain | `return validateSaveV43(JSON.parse(JSON.stringify(written))).state` | validateSaveV43( -> validateSaveV44( |

### `tests/helpers/p14c2rm-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0010 | 6 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, validateSaveV37, validateSaveV4…` | import validateSaveV44 in place of validateSaveV43 |
| N-0011 | 24 | S1 | certain | `return validateSaveV43(JSON.parse(bytes(state))).state` | validateSaveV43( -> validateSaveV44( |

### `tests/helpers/p14c3-canonical-rival-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0012 | 8 | S4 | certain | `import { LIVE_SAVE_VERSION, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42…` | add convertV44ToV43 to the import |
| N-0013 | 198 | S4 | certain | `const v38 = convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(convertV43ToV…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |

### `tests/helpers/p14c3-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0014 | 64 | S1 | certain | `validateSaveV43: (input: unknown) => Save38 }` | rename the SaveAPI key validateSaveV43 -> validateSaveV44 (the 1309-X3 ruling 1 live-name key); every saveApi('validateSaveV43') caller follows in the same unit |
| N-0015 | 134 | S2 | certain | `expect(result.saveVersion, 'existing live writer moves coherently to38').toBe(43)` | toBe(43) -> toBe(44) |

### `tests/helpers/p14c3-genuine-evidence-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0016 | 8 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV4…` | import validateSaveV44 in place of validateSaveV43 |
| N-0017 | 17 | S2 | certain | `expect(saved.saveVersion).toBe(43)` | toBe(43) -> toBe(44); measured: X5 step 4: rows 59-61 fail at :17:29 "expected 44 to be 43" |
| N-0018 | 18 | S1 | certain | `expect(validateSaveV43(saved)).toBe(saved)` | validateSaveV43(saved) -> validateSaveV44(saved) |

### `tests/helpers/p14c3-history-boundary-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0019 | 6 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV4…` | import validateSaveV44 in place of validateSaveV43 |
| N-0020 | 26 | S2 | certain | `expect(saved.saveVersion).toBe(43)` | toBe(43) -> toBe(44) |
| N-0021 | 27 | S1 | certain | `expect(validateSaveV43(saved)).toBe(saved)` | validateSaveV43(saved) -> validateSaveV44(saved) |

### `tests/helpers/p14c3-second-episode-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0022 | 8 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV4…` | import validateSaveV44 in place of validateSaveV43 |
| N-0023 | 27 | S2 | certain | `expect(save.saveVersion).toBe(43)` | toBe(43) -> toBe(44) |
| N-0024 | 28 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43(saved) -> validateSaveV44(saved) |

### `tests/helpers/p14c4-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0025 | 12 | S4 | certain | `convertV35ToV36, convertV36ToV37, convertV36ToV35, convertV37ToV36, convertV38ToV37, conv…` | add convertV44ToV43 to the import |
| N-0026 | 71 | S4 | certain | `const historical38 = convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(conv…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345, UI TS2345, Bridge TS2345 |
| N-0027 | 71 | S9 | measure | `const historical38 = convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42ToV41(conv…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |

### `tests/helpers/p14p3-fixtures.ts` (helper)

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0028 | 78 | S1 | certain | `validateSaveV43: (input: unknown) => unknown` | rename the typed member to validateSaveV44 |
| N-0029 | 82 | S4 | certain | `convertV43ToV42: (input: unknown) => unknown` | add `convertV44ToV43: (input: unknown) => unknown` to the steps type |
| N-0030 | 88 | S1 | certain | `assert.equal(typeof candidate.validateSaveV43, 'function', 'public index exposes the live…` | rename to validateSaveV44 with its typed member (the helper names the live validator) |
| N-0031 | 92 | S4 | certain | `assert.equal(typeof candidate.convertV43ToV42, 'function', 'public index exposes the V43-…` | add an existence assertion for steps.convertV44ToV43 beside this one |
| N-0032 | 109 | S1 | certain | `validateSaveV39: (input: unknown) => steps.validateSaveV43(input),` | validateSaveV43( -> validateSaveV44( |
| N-0033 | 110 | S4 | certain | `convertV39ToV38: (input: unknown) => steps.convertV39ToV38(steps.convertV40ToV39(steps.co…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |

### `tests/p14c3-admission-boundaries.test.ts`; 1 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0034 | 23 | S1 | certain | `expect(saveApi('validateSaveV43')(saved)).toBe(saved)` | 'validateSaveV43' -> 'validateSaveV44' |

### `tests/p14c3-profession-episodes.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0035 | 59 | S1 | certain | `expect(saveApi('validateSaveV43')(saved)).toBe(saved)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0036 | 65 | S1 | certain | `expect(saveApi('validateSaveV43')(allowedSave)).toBe(allowedSave)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0037 | 143 | S1 | certain | `expect(saveApi('validateSaveV43')(saved)).toBe(saved)` | 'validateSaveV43' -> 'validateSaveV44' |

### `tests/p14c3-save-v38.test.ts`; 1 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0038 | 53 | S2 | certain | `expect(saved.saveVersion, 'existing makeSave must write the governed new envelope').toBe(…` | 43 -> 44 |
| N-0039 | 54 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0040 | 72 | S2 | certain | `expect(upgraded.saveVersion, 'actual migration must change the current envelope').toBe(43)` | 43 -> 44 |
| N-0041 | 87 | S5 | measure | `expect(stableStringify(stripped), 'every old field, receipt, clock and RNG value survives…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0042 | 100 | S10 | measure | `expect(stableStringify(migrateToLive(old))).toBe(stableStringify(converted))` | no edit: retained identity; attribute the CHANGED primary in the gate compare |
| N-0043 | 111 | S1 | certain | `const validate = saveApi('validateSaveV43'), immutable = stableStringify(control)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0044 | 321 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0045 | 336 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0046 | 356 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0047 | 367 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0048 | 370 | S1 | certain | `expect(() => saveApi('validateSaveV43')(malformed)).toThrow(/straddles a retained product…` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0049 | 400 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0050 | 405 | S1 | certain | `expect(() => saveApi('validateSaveV43')(malformed)).toThrow(/straddles a retained complet…` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0051 | 410 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0052 | 416 | S1 | certain | `expect(() => saveApi('validateSaveV43')(malformed)).toThrow(/straddles a retained product…` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0053 | 424 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0054 | 429 | S1 | certain | `expect(() => saveApi('validateSaveV43')(malformed)).toThrow(/straddles a retained origina…` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0055 | 434 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0056 | 445 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0057 | 454 | S1 | certain | `expect(saveApi('validateSaveV43')(current)).toBe(current)` | 'validateSaveV43' -> 'validateSaveV44' |

### `tests/p14c3-transition-evidence.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0058 | 34 | S1 | certain | `expect(saveApi('validateSaveV43')(actual)).toBe(actual)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0059 | 41 | S1 | certain | `expect(saveApi('validateSaveV43')(reencoded)).toBe(reencoded)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0060 | 50 | S1 | certain | `expect(saveApi('validateSaveV43')(original)).toBe(original)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0061 | 61 | S1 | certain | `expect(() => saveApi('validateSaveV43')(malformed)).toThrow(cause)` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0062 | 107 | S1 | certain | `expect(saveApi('validateSaveV43')(saved)).toBe(saved)` | 'validateSaveV43' -> 'validateSaveV44' |

## G1: relationship shapes: the p14b5 Edge type, staged and minted edges, hand-lifted states, Save42/43 tests

### `tests/bridge-p14b5-relationships.test.ts`; 5 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0063 | 227 | S6 | certain | `type Edge = { edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: n…` | add `competitions` and `romance` to the local Edge type (typed from RelationshipEdge, so the strict Picks of step 3 accept it) |
| N-0064 | 377 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0065 | 381 | P2 | certain | `expect(SCHEMA_ID).toBe('sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566…` | SCHEMA_ID 349b2d3e… -> sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253 |
| N-0066 | 383 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0067 | 384 | P2 | certain | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_35_…` | append the outgoing56 id sha256:349b2d3ec0614f2c… (a named OUTGOING_56 constant) to the full prior-roster key list |
| N-0068 | 433 | P2 | certain | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_35_…` | append the outgoing56 id sha256:349b2d3ec0614f2c… (a named OUTGOING_56 constant) to the full prior-roster key list |
| N-0069 | 493 | S6 | certain | `sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, shar…` | add `competitions: []` and `romance: null` to the literal |
| N-0070 | 540 | S10 | measure | `expect(rows.filter((r) => r.kind === 'settled')).toHaveLength(control.settled)` | no edit: retained identity; attribute the CHANGED primary in the gate compare |
| N-0071 | 560 | S10 | measure | `expect(settlementDigest(state)).toBe(control.settlement)` | no edit: retained identity; attribute the CHANGED primary in the gate compare |

### `tests/bridge-p14b6-d2-withheld-employment-claim.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0072 | 61 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0073 | 70 | S6 | certain | `type Edge = {` | add `competitions` and `romance` to the local Edge type (typed from RelationshipEdge, so the strict Picks of step 3 accept it) |
| N-0074 | 84 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(save)))` | validateSaveV43( -> validateSaveV44( |
| N-0075 | 92 | S6 | certain | `sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, shar…` | add `competitions: []` and `romance: null` to the literal in stagedEdge() |

### `tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0076 | 52 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0077 | 95 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(save)))` | validateSaveV43( -> validateSaveV44( |

### `tests/bridge-p14b6-relationship-read-models.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0078 | 79 | S1 | certain | `import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, validateSave…` | import validateSaveV44 in place of validateSaveV43 |
| N-0079 | 103 | P1 | certain | `const INCOMING_PROJECTION = 56` | INCOMING_PROJECTION = 56 -> 57 (read at :777, :782, :802, :803) |
| N-0080 | 148 | S6 | certain | `type Edge = {` | add `competitions` and `romance` to the local Edge type (typed from RelationshipEdge, so the strict Picks of step 3 accept it) |
| N-0081 | 229 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(save)))` | validateSaveV43( -> validateSaveV44( |
| N-0082 | 288 | S6 | certain | `sharedCancellations: 0, sharedCompetitions: 0, peakTier: tier, peakTierWeek: week,` | add `competitions: []` and `romance: null` to the literal in stageEdge() |
| N-0083 | 402 | P3 | certain | `expect(Object.keys(row).sort()).toEqual(['counterpartId', 'counterpartName', 'drivers', '…` | ['counterpartId', 'counterpartName', 'drivers', 'labels', 'romance', 'sharedPictures', 'sign', 'tierLabel'] |
| N-0084 | 779 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43) // B.6 has NO save step` | 43 -> 44 |
| N-0085 | 791 | P2 | certain | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_36_…` | append the outgoing56 id sha256:349b2d3ec0614f2c… (a named OUTGOING_56 constant) to the full prior-roster key list |
| N-0086 | 794 | P2 | certain | `expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size).toBe(44)` | roster size toBe(44) -> toBe(45) |

### `tests/p14b10-conflict-evidence.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0087 | 110 | S6 | certain | `sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, shar…` | add `competitions: []` and `romance: null` to the literal before `...extra` in stagedEdge(); measured: X5 step 4: root TS2322 at :108 |

### `tests/p14b5-relationships.test.ts`; 3 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0088 | 74 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, migrateToLive, migrateToV25, migrateToV26, migrateT…` | import validateSaveV44 in place of validateSaveV43 |
| N-0089 | 93 | S6 | certain | `type Edge = {` | add `competitions` and `romance` to the local Edge type (typed from RelationshipEdge, so the strict Picks of step 3 accept it); measured: X5 step 4: 24 root TS2345 strict-Pick errors at :590, :709, :710, :720, :726, :729, :730, :741, :796, :798, :801, :802, :832, :834, :837, :981, :982, :1025, :1091, :1103, :1137, :1147, :1… |
| N-0090 | 220 | S6 | certain | `function mintedEdge(index: number, x: string, y: string, weight: number, week: number, re…` | add `competitions: []` and `romance: null` to the literal in mintedEdge(); measured: X5 step 4: family 1 minted oracle fails (16 keys against 14) |
| N-0091 | 228 | S6 | certain | `function stagedEdge(state: GameState, x: string, y: string, closeness: number, lastEventW…` | add `competitions: []` and `romance: null` to the literal in stagedEdge(); stage() then passes the Save44 validator; measured: X5 step 4: families 6, 6b, 8 and both D5 sentence branches fail "validateSaveV44: state.relationships[N].competitions is missing" |
| N-0092 | 236 | S10 | measure | `// 735-T (P14B.7): strips `relationships` (this file's own root under test) AND` | none expected: bytes() strips the whole relationships root before the frozen postTakeDigestStripped pin |
| N-0093 | 582 | S6 | certain | `const expected = seatPairs(take).map((p, i) => mintedEdge(i, p.x, p.y, weightOf[p.weight]…` | no edit: mintedEdge() carries the fields after the :220 edit |
| N-0094 | 660 | S6 | certain | `const expected = seatPairs(take).map((p, i) => mintedEdge(i, p.x, p.y, weightOf[p.weight]…` | no edit: mintedEdge() carries the fields after the :220 edit |
| N-0095 | 1297 | S1 | certain | `expect(() => validateSaveV43(save)).toThrow(pattern)` | validateSaveV43( -> validateSaveV44(; measured: X5 step 4: family 10 leaves fail "validateSaveV43: expected version 43" |
| N-0096 | 1297 | S8 | measure | `expect(() => validateSaveV43(save)).toThrow(pattern)` | none expected: the family-10 patterns name the tampered field; confirm each refusal still matches at era 44 (validateSaveV44 checks the root at save.ts:10768, …; measured: X5 step 4: family 10 leaves fail "validateSaveV43: expected version 43" |
| N-0097 | 1301 | S1 | certain | `expect(() => validateRelationshipsRoot(save.state, 42)).toThrow(pattern)` | validateRelationshipsRoot(<live>, 42) -> (<live>, 44) |
| N-0098 | 1311 | S1 | certain | `expect(validateSaveV43(save)).toEqual(save)` | validateSaveV43( -> validateSaveV44(; measured: X5 step 4: family 10 fails "validateSaveV43: expected version 43" |
| N-0099 | 1317 | S1 | certain | `expect(() => validateSaveV43(save)).toThrow(/relationships/)` | validateSaveV43( -> validateSaveV44(; measured: X5 step 4: "expected ... to throw error matching /relationships/ but got validateSaveV43: expected version 43" |
| N-0100 | 1359 | S1 | certain | `const admitted = validateSaveV43(one)` | validateSaveV43( -> validateSaveV44(; measured: X5 step 4: the one-edge downgrade leaf fails "validateSaveV43: expected version 43" |
| N-0101 | 1394 | S9 | measure | `expect(() => migrateToV30(admitted)).toThrow(/^migrateToV42: cannot downgrade or discard …` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0102 | 1411 | S9 | measure | `expect(() => older(admitted as never)).toThrow(/^migrateToV42: cannot downgrade or discar…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0103 | 1426 | S9 | measure | `expect(() => migrateToV25(admitted as never)).toThrow(/^migrateToV42: cannot downgrade or…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0104 | 1439 | S1 | certain | `const empty = validateSaveV43({ ...save, state: { ...save.state, relationships: [] } })` | validateSaveV43( -> validateSaveV44( |
| N-0105 | 1447 | S9 | measure | `expect(() => migrateToV30(empty)).toThrow(/^migrateToV42: cannot downgrade or discard a s…` | none expected (no edge, no log, no romance); confirm in M2 |

### `tests/p14b5-t-failure-tuning.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0106 | 57 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, migrateToLive, validateSaveV43 } from '../src/core/…` | import validateSaveV44 in place of validateSaveV43 |
| N-0107 | 117 | S1 | certain | `validateRelationshipsRoot(written, 42)` | validateRelationshipsRoot(<live>, 42) -> (<live>, 44) |
| N-0108 | 123 | S1 | certain | `validateRelationshipsRoot(written, 42)` | validateRelationshipsRoot(<live>, 42) -> (<live>, 44) |
| N-0109 | 295 | S6 | certain | `rows.find((r) => currentTier({ closeness: r.closeness, lastEventWeek: r.week, sharedCompe…` | add `romance: null` to the currentTier Pick literal; measured: X5 step 4: root TS2345 |
| N-0110 | 373 | S6 | certain | `.toEqual({ productions: 2, failures: 2, first: STAGED_FIRST_WEEK, peak: currentTier({ clo…` | add `romance: null` to the currentTier Pick literal; measured: X5 step 4: root TS2345 |
| N-0111 | 413 | S1 | certain | `expect(validateSaveV43(save)).toEqual(save)` | validateSaveV43( -> validateSaveV44( |
| N-0112 | 433 | S1 | certain | `expect(() => { validateRelationshipsRoot(historical, 42) }).not.toThrow()` | validateRelationshipsRoot(<live>, 42) -> (<live>, 44) |
| N-0113 | 438 | S1 | certain | `const migrated = migrateToLive(validateSaveV43(save))` | validateSaveV43( -> validateSaveV44( |
| N-0114 | 489 | S1 | certain | `validateRelationshipsRoot(state, 42)` | validateRelationshipsRoot(<live>, 42) -> (<live>, 44) |

### `tests/p14b9-save-v42.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0115 | 71 | S1 | certain | `import type { SaveFile, SaveFileV42, SaveFileV43 } from '../src/core/save.js'` | add SaveFileV44 to the type import for the renamed member at :175 (SaveFileV43 stays for :174) |
| N-0116 | 175 | S1 | certain | `validateSaveV43: (s: unknown) => SaveFileV43` | rename the typed member to validateSaveV44 |
| N-0117 | 176 | S4 | certain | `convertV43ToV42: (s: unknown) => unknown` | add convertV44ToV43 (and convertV43ToV44 for :183) to the mods type |
| N-0118 | 183 | S5 | certain | `const state = mods.convertV42ToV43(v42).state as unknown as GameState` | lift through convertV43ToV44 as well: mods.convertV43ToV44(mods.convertV42ToV43(v42)).state; add the member to the mods type (:172-178) |
| N-0119 | 205 | S2 | certain | `expect(newSave.saveVersion).toBe(43) // LIVE_SAVE_VERSION 43 (was 42 at 1313-A §3)` | 43 -> 44 |
| N-0120 | 206 | S1 | certain | `expect(() => mods.validateSaveV43(newSave)).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0121 | 207 | S4 | certain | `expect(() => mods.convertV42ToV41(mods.convertV43ToV42(newSave))).toThrow()` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0122 | 207 | S9 | measure | `expect(() => mods.convertV42ToV41(mods.convertV43ToV42(newSave))).toThrow()` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0123 | 212 | P5 | certain | `it('LIVE_SAVE_VERSION is 43', () => {` | rename the title to 'LIVE_SAVE_VERSION is 44'; record old -> new identity in the handback |
| N-0124 | 213 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0125 | 216 | P5 | certain | `it('validateSave names the new ceiling in its unknown-version message ("1 through 43")', …` | rename the title to '... unknown-version message ("1 through 44")'; record old -> new identity in the handback |
| N-0126 | 217 | S3 | certain | `expect(() => validateSave({ saveVersion: 999 })).toThrow(/1 through 43/)` | "1 through 43" -> "1 through 44" |

### `tests/p14c1-materialized-aging.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0127 | 175 | S5 | certain | `const live = SaveModule.convertV42ToV43(SaveModule.convertV41ToV42(SaveModule.convertV40T…` | append convertV43ToV44(...) to the V40 -> V43 lift so `live` is a Save44 envelope |
| N-0128 | 1030 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/p14c2s-scientist-retirement.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0129 | 255 | S2 | certain | `expect(live.saveVersion).toBe(43)` | 43 -> 44 |
| N-0130 | 266 | S2 | certain | `expect(lifted.saveVersion).toBe(43)` | 43 -> 44 |
| N-0131 | 276 | S2 | certain | `expect(live.saveVersion).toBe(43)` | 43 -> 44 |
| N-0132 | 300 | S7 | certain | `for (const edge of envelope.state.relationships) delete (edge as { sharedCompetitions?: u…` | also delete `competitions` and `romance` from every edge in the reader-only V34-V36 relabel (beside sharedCompetitions) |
| N-0133 | 338 | S2 | certain | `expect(live.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/p14d1-rival-shelving-save-v43.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0134 | 45 | P5 | certain | `it('validateSaveV43 / convertV42ToV43 / convertV43ToV42 exist as functions; LIVE_SAVE_VER…` | rename the title to '... exist as functions; LIVE_SAVE_VERSION is 44'; record old -> new identity in the handback |
| N-0135 | 46 | S2 | certain | `expect(saveModule.LIVE_SAVE_VERSION).toBe(43)` | toBe(43) -> toBe(44) |
| N-0136 | 82 | P5 | certain | `it('migrateToLive carries a genuine V42 save to V43 (LIVE_SAVE_VERSION)', () => {` | rename the title to 'migrateToLive carries a genuine V42 save to V44 (LIVE_SAVE_VERSION)'; record old -> new identity in the handback |
| N-0137 | 85 | S2 | certain | `expect((live as unknown as { saveVersion: number }).saveVersion).toBe(43)` | toBe(43) -> toBe(44) |

### `tests/p14d1-rival-shelving.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0138 | 186 | P5 | certain | `it('save.ts LIVE_SAVE_VERSION is 43, and validateSaveV43/convertV42ToV43/convertV43ToV42 …` | rename the title to 'save.ts LIVE_SAVE_VERSION is 44, and validateSaveV43/convertV42ToV43/convertV43ToV42 exist'; record old -> new identity in the handback |
| N-0139 | 187 | S2 | certain | `expect(saveModule.LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0140 | 561 | S5 | measure | `const genuineV43 = mods.convertV42ToV43(genuineV42Week93())` | lift genuineV43 through convertV43ToV44 before the canonical comparison with the week-93 live state |
| N-0141 | 980 | S1 | certain | `const mods = saveModule as unknown as { validateSaveV43: (s: unknown) => unknown }` | rename the typed member to validateSaveV44 |
| N-0142 | 981 | S1 | certain | `expect(() => mods.validateSaveV43(saveModule.makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-post-capacity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0143 | 71 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0144 | 71 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0145 | 72 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |
| N-0146 | 347 | S6 | certain | `expect(edge).toEqual({ edgeId: edge.edgeId, a: pair.a, b: pair.b, closeness: 50 + pair.we…` | add `competitions: [], romance: null` to the expected edge |

## G2: Bridge A: projection 57 pins, the roster list, the generator test (F10/F11 after the recorded producer run)

### `tests/bridge-contract-generator.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0147 | 567 | P1 | certain | `const generated = generateCsharpContract({ schema, protocolVersion: 4, projectionVersion:…` | generateCsharpContract({..., projectionVersion: 56}) -> 57 |
| N-0148 | 569 | P2 | certain | `'// Schema identity: sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfc…` | schema identity 349b2d3e… -> sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253 (the step-4 manifest schemaId; confirm with generate:bridg… |
| N-0149 | 572 | P2 | certain | `'sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1',` | schemaIdentity(schema) 349b2d3e… -> sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253 |
| N-0150 | 724 | P4 | certain | `F10_CURRENT_QUOTE_UNIONS: 'a0f316eb5b4be929f82102246b415414e0720000e6dd4a62b22980192abaf8…` | F10 a0f316eb… -> the value of a recorded producer run on the step-4 source (cross-check 1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4, 420,3… |
| N-0151 | 725 | P4 | certain | `F11_CURRENT_COMMAND_UNION: 'a0f316eb5b4be929f82102246b415414e0720000e6dd4a62b22980192abaf…` | F11: same value and provenance as F10 |

### `tests/bridge-operations-events.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0152 | 333 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |

### `tests/bridge-owner-ux-projection21-schema.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0153 | 18 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0154 | 19 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |

### `tests/bridge-p10a-w0-people-projection.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0155 | 321 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0156 | 322 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |

### `tests/bridge-p11-capital-contributors.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0157 | 24 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |

### `tests/bridge-p11-ready.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0158 | 52 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-r07-setup.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0159 | 320 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0160 | 321 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toContain('projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0161 | 322 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0162 | 587 | S2 | certain | `expect(parsedSaveVersion).toBe(43) // the CURRENT live version — confirms this is not gen…` | 43 -> 44 |

### `tests/bridge-p13b-s1b-seats.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0163 | 76 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0164 | 102 | P1 | certain | `expect(page.snapshotVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s2-labs.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0165 | 115 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0166 | 126 | P1 | certain | `expect(response.snapshotVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s3-plans.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0167 | 202 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0168 | 214 | P1 | certain | `expect(plans.snapshotVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s4-office.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0169 | 224 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0170 | 235 | P1 | certain | `expect(response.snapshotVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s5-adoption.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0171 | 250 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0172 | 251 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toContain('projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0173 | 252 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s6-cancellation.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0174 | 270 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0175 | 271 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toContain('projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0176 | 272 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s7-disclosure.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0177 | 270 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0178 | 271 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toContain('projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0179 | 272 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p13b-s8-rivals.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0180 | 223 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56) // RED: today PROJECTION_VERSION is 40` | 56 -> 57 |
| N-0181 | 224 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toContain('projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0182 | 225 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0183 | 233 | S2 | certain | `expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |
| N-0184 | 404 | S2 | certain | `expect((JSON.parse(savedBefore.saveJson) as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-process-restart.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0185 | 797 | S2 | certain | `expect(hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0186 | 799 | S2 | certain | `expect(hydrated.savedSave?.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-r3n4-read-model-deltas.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0187 | 144 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0188 | 145 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0189 | 351 | P1 | certain | `expect(response.snapshotVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-runtime-checkpoint.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0190 | 232 | S2 | certain | `expect(loaded.hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0191 | 233 | S2 | certain | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(43)` | 43 -> 44 |
| N-0192 | 269 | S2 | certain | `expect(loaded.hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0193 | 270 | S2 | certain | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(43)` | 43 -> 44 |
| N-0194 | 331 | S2 | certain | `expect(hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0195 | 332 | S2 | certain | `expect(hydrated.savedSave?.saveVersion).toBe(43)` | 43 -> 44 |
| N-0196 | 726 | S2 | certain | `expect(loaded.hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0197 | 754 | S2 | certain | `expect(loaded.hydrated.savedSave?.saveVersion).toBe(43)` | 43 -> 44 |
| N-0198 | 763 | P2 | certain | `it.each(Array.from(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries()))(` | no edit: the it.each gains a projection-v56 case, a new test identity |
| N-0199 | 782 | S2 | certain | `expect(loaded.hydrated.currentSave.saveVersion).toBe(43)` | 43 -> 44 |
| N-0200 | 977 | P2 | certain | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([` | insert 'sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1' in sorted position (after 2c377b6f…) with its provenance comment |

### `tests/bridge-schema.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0201 | 81 | P1 | certain | `projectionVersion: 56,` | 56 -> 57 |
| N-0202 | 84 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0203 | 340 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0204 | 341 | P1 | certain | `expect(() => parseWireValue(definition, oldProjection)).toThrow(/expected literal 56/)` | /expected literal 56/ -> /expected literal 57/ |
| N-0205 | 576 | P1 | certain | `expect(generatedCsharp).toContain('public const int ProjectionVersion = 56;')` | 'public const int ProjectionVersion = 56;' -> 57 |

### `tests/bridge.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0206 | 167 | P1 | certain | `expect(SNAPSHOT_VERSION).toBe(56)` | 56 -> 57 |

## G3: Bridge B: bridge-p14* projection, roster and live-save pins, and their S5 comparisons

### `tests/bridge-p14a1-market.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0207 | 152 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0208 | 153 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0209 | 154 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0210 | 408 | S2 | certain | `expect(parsed.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14a1-release-busy-set.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0211 | 214 | P5 | certain | `it('schema leaf: PROJECTION_VERSION is 56, the schema $id and x-project-studio.projection…` | rename the title to 'schema leaf: PROJECTION_VERSION is 57, ...'; record old -> new identity in the handback |
| N-0212 | 215 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0213 | 216 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0214 | 217 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |

### `tests/bridge-p14a2-market.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0215 | 217 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0216 | 218 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0217 | 219 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0218 | 232 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0219 | 739 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0220 | 772 | S2 | certain | `if (reSavedOpen.accepted) expect((JSON.parse(reSavedOpen.saveJson) as { saveVersion: numb…` | 43 -> 44 |
| N-0221 | 784 | S2 | certain | `if (reSavedSettled.accepted) expect((JSON.parse(reSavedSettled.saveJson) as { saveVersion…` | 43 -> 44 |
| N-0222 | 794 | S2 | certain | `if (reSavedLegacy.accepted) expect((JSON.parse(reSavedLegacy.saveJson) as { saveVersion: …` | 43 -> 44 |
| N-0223 | 809 | S2 | certain | `expect(parsed.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14a3-world.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0224 | 229 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0225 | 230 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0226 | 231 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0227 | 245 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0228 | 575 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0229 | 600 | S2 | certain | `expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |
| N-0230 | 622 | S2 | certain | `expect(parsed.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14b1-promises.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0231 | 207 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0232 | 208 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0233 | 209 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0234 | 210 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0235 | 504 | S2 | certain | `if (reSaved.accepted) expect((JSON.parse(reSaved.saveJson) as { saveVersion: number }).sa…` | 43 -> 44 |
| N-0236 | 520 | S2 | certain | `expect(parsed.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14b2-checkpoint.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0237 | 61 | S2 | certain | `expect(governed.saveVersion).toBe(43)` | 43 -> 44 |
| N-0238 | 92 | S2 | certain | `expect(JSON.parse(exportSave(governed))).toEqual({ ...source, saveVersion: 43, state: wit…` | saveVersion: 43 -> 44 in the expected export |

### `tests/bridge-p14b2-trust.test.ts`; 8 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0239 | 24 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0240 | 140 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0241 | 141 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0242 | 142 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${PROTOCOL_VERSION}:pr…` | projection-56 -> projection-57 in the schema $id |
| N-0243 | 143 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0244 | 287 | S1 | certain | `expect(() => validateSaveV43(JSON.parse(JSON.stringify(makeSave(next))))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0245 | 424 | S1 | certain | `expect(() => validateSaveV43(JSON.parse(JSON.stringify(makeSave(variant))))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0246 | 468 | S1 | certain | `const validated = validateSaveV43(JSON.parse(saved.saveJson))` | validateSaveV43( -> validateSaveV44( |
| N-0247 | 469 | S2 | certain | `expect(validated.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14b3-promise-command.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0248 | 19 | S1 | certain | `import { LIVE_SAVE_VERSION, makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0249 | 38 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(state))))` | validateSaveV43( -> validateSaveV44( |
| N-0250 | 86 | S1 | certain | `validateSaveV43(JSON.parse(result.saveJson))` | validateSaveV43( -> validateSaveV44( |
| N-0251 | 136 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(session.gameState))))` | validateSaveV43( -> validateSaveV44( |
| N-0252 | 363 | S1 | certain | `expect(validateSaveV43(JSON.parse(saved)).state.promises).toEqual(session.gameState.promi…` | validateSaveV43( -> validateSaveV44( |
| N-0253 | 508 | S1 | certain | `const validated = validateSaveV43(JSON.parse(saved))` | validateSaveV43( -> validateSaveV44( |
| N-0254 | 509 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0255 | 510 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0256 | 511 | S2 | certain | `expect(validated.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14b4-cast-class.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0257 | 25 | S1 | certain | `import { convertV31ToV32, convertV32ToV33, convertV33ToV34, convertV34ToV35, convertV35To…` | import validateSaveV44 in place of validateSaveV43 |
| N-0258 | 127 | S1 | certain | `validateSaveV43({ ...live, state, broadcastCache: state.broadcastItems })` | validateSaveV43( -> validateSaveV44( |
| N-0259 | 456 | S1 | certain | `validateSaveV43({ ...live, state }) // disclosed synthetic pure-read age input, no fake c…` | validateSaveV43( -> validateSaveV44( |
| N-0260 | 514 | S1 | certain | `expect(validateSaveV43(JSON.parse(saved.saveJson)).state.promises).toEqual(brokenState.pr…` | validateSaveV43( -> validateSaveV44( |

### `tests/bridge-p14b4-runtime47-compatibility.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0261 | 207 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0262 | 208 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0263 | 211 | P2 | certain | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_PRI…` | append the outgoing56 id sha256:349b2d3ec0614f2c… (a named OUTGOING_56 constant) to the full prior-roster key list |

### `tests/bridge-p14b7-promise-waiver.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0264 | 137 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |

### `tests/bridge-p14b8-waiver-surface.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0265 | 776 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0266 | 777 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERS…` | projection-56 -> projection-57 in the schema $id |
| N-0267 | 778 | P1 | certain | `expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)` | 56 -> 57 |
| N-0268 | 788 | P2 | certain | `expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size, 'P3 adds the genuine outgoing53 identi…` | roster size toBe(44) -> toBe(45) |
| N-0269 | 817 | S2 | certain | `expect(hydrated.currentSave.saveVersion, 'P3: each historical slot reaches actual live Sa…` | 43 -> 44 |
| N-0270 | 818 | S2 | certain | `expect(hydrated.savedSave.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14c2rm-runtime.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0271 | 53 | S2 | certain | `expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0272 | 56 | S5 | measure | `const expectedOld = withEmptyScreenplayShelving(withFirstTakeSubjects(withRivalTerminatio…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0273 | 94 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0274 | 96 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14c2s-scientist-runtime.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0275 | 12 | S1 | certain | `import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, validateSave…` | import validateSaveV44 in place of validateSaveV43 |
| N-0276 | 107 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0277 | 108 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0278 | 124 | S1 | certain | `const actual = validateSaveV43(importSave(actualJson!))` | validateSaveV43( -> validateSaveV44( |
| N-0279 | 125 | S2 | certain | `expect(actual.saveVersion).toBe(43)` | 43 -> 44 |
| N-0280 | 136 | S5 | measure | `expect(canonicalJson({ ...restState, careerLifecycle: oldLifecycle })).toBe(canonicalJson…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/bridge-p14c3-promise-digest-continuity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0281 | 119 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0282 | 158 | S5 | measure | `const expectedOld = withEmptyScreenplayShelving(withFirstTakeSubjects(withRivalTerminatio…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0283 | 168 | S2 | certain | `expect(current.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/bridge-p14c3-runtime.test.ts`; 1 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0284 | 17 | S1 | certain | `import { convertV38ToV37, exportSave, LIVE_SAVE_VERSION, makeSave, migrateToV38, validate…` | import validateSaveV44 in place of validateSaveV43 |
| N-0285 | 160 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56); expect(PROTOCOL_VERSION).toBe(4); expect(LIVE_SAVE_V…` | 56 -> 57 |
| N-0286 | 160 | S2 | certain | `expect(PROJECTION_VERSION).toBe(56); expect(PROTOCOL_VERSION).toBe(4); expect(LIVE_SAVE_V…` | 43 -> 44 |
| N-0287 | 168 | S1 | certain | `const saved = validateSaveV43(JSON.parse(current[slot]!))` | validateSaveV43( -> validateSaveV44( |

### `tests/bridge-p14p3-directing-promises.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0288 | 27 | S1 | certain | `validateSaveV38, validateSaveV39, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0289 | 75 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0290 | 75 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0291 | 132 | S2 | certain | `expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0292 | 134 | S5 | measure | `expect(current.state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withS…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0293 | 283 | S2 | certain | `const current = migrateToLive(variant); expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0294 | 358 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56); expect(PROTOCOL_VERSION).toBe(4)` | 56 -> 57 |
| N-0295 | 368 | S1 | certain | `const now = validateSaveV43(JSON.parse(current[slot]!))` | validateSaveV43( -> validateSaveV44( |
| N-0296 | 370 | S5 | measure | `expect(now.state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withShare…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/bridge-p14p4p5-opportunities.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0297 | 20 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV3…` | import validateSaveV44 in place of validateSaveV43 |
| N-0298 | 66 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0299 | 66 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0300 | 92 | S2 | certain | `const current = migrateToLive(old); expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0301 | 93 | S5 | measure | `expect(current.state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withS…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0302 | 487 | P1 | certain | `expect(PROTOCOL_VERSION).toBe(4); expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0303 | 488 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0304 | 503 | P2 | certain | `expect(older).toHaveLength(43)` | older roster length toHaveLength(43) -> 44 |
| N-0305 | 504 | P2 | certain | `expect(sha(canonicalJson(older))).toBe('f62253f540a1b498e953cfb22b9558ca70131a14ef4754352…` | older roster digest f62253f5… -> afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58 (py/roster.py; reproduces the base pin) |
| N-0306 | 510 | S1 | certain | `const previous = validateSaveV39(JSON.parse(old.value[slot])), now = validateSaveV43(JSON…` | validateSaveV43( -> validateSaveV44( |
| N-0307 | 511 | S5 | measure | `expect(now.state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withShare…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0308 | 515 | S1 | certain | `const currentState = validateSaveV43(JSON.parse(current.currentSaveJson)).state` | validateSaveV43( -> validateSaveV44( |
| N-0309 | 516 | S1 | certain | `const savedState = validateSaveV43(JSON.parse(current.savedSaveJson!)).state` | validateSaveV43( -> validateSaveV44( |

### `tests/bridge-p14r2r3-prior55.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0310 | 67 | S1 | certain | `import { exportSave, migrateToLive, validateSaveV40, validateSaveV43 } from '../src/core/…` | import validateSaveV44 in place of validateSaveV43 |
| N-0311 | 154 | P1 | certain | `expect(PROJECTION_VERSION).toBe(56)` | 56 -> 57 |
| N-0312 | 155 | P1 | certain | `expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')` | projection-56 -> projection-57 in the schema $id |
| N-0313 | 171 | P2 | certain | `expect(older).toHaveLength(43)` | older roster length toHaveLength(43) -> 44 |
| N-0314 | 172 | P2 | certain | `expect(sha(canonicalJson(older))).toBe('11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c…` | older roster digest 11ec9999… -> d25c64254ac090a8470cc43b2f02740e149b6f29f75966ba4d2d1684b26654a6 (recomputed from the step-4 map by py/roster.py, which reprod… |
| N-0315 | 185 | S1 | certain | `const now = validateSaveV43(JSON.parse(nextRaw!))` | validateSaveV43( -> validateSaveV44( |
| N-0316 | 186 | S2 | certain | `expect(now.saveVersion).toBe(43)` | 43 -> 44 |
| N-0317 | 190 | S5 | measure | `expect(now.state).toEqual(withEmptyScreenplayShelving(withSharedCompetitionsZero(withTerm…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

## G4: versions and UI: the eight UI pins, sentinels, the save-vNN files and the remaining S1/S2 files of that family

### `tests/cash-ledger-checkpoint-v11.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0318 | 48 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0319 | 225 | S1 | certain | `expect(validateSaveV43(native)).toBe(native);` | validateSaveV43( -> validateSaveV44( |
| N-0320 | 235 | S1 | certain | `expect(validateSaveV43(reconciled)).toBe(reconciled);` | validateSaveV43( -> validateSaveV44( |
| N-0321 | 287 | S1 | certain | `expect(() => validateSaveV43(redundant)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0322 | 364 | S1 | certain | `const current = validateSaveV43(makeSave(generateWorld("checkpoint-frozen-redundant")));` | validateSaveV43( -> validateSaveV44( |
| N-0323 | 461 | S1 | certain | `expect(() => validateSaveV43(changedAnchor)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0324 | 467 | S1 | certain | `expect(() => validateSaveV43(changedCash)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0325 | 473 | S1 | certain | `expect(() => validateSaveV43(movedBoundary)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0326 | 479 | S1 | certain | `expect(() => validateSaveV43(changedSuffix)).toThrow(` | validateSaveV43( -> validateSaveV44( |

### `tests/construction-save-v11.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0327 | 50 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0328 | 189 | S2 | certain | `expect(save.saveVersion).toBe(43);` | 43 -> 44 |
| N-0329 | 191 | S1 | certain | `expect(validateSaveV43(save)).toBe(save);` | validateSaveV43( -> validateSaveV44( |
| N-0330 | 514 | S1 | certain | `expect(() => validateSaveV43(forgedV13)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0331 | 553 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(` | sentinel saveVersion 44 -> 45 |
| N-0332 | 554 | S3 | certain | `/unknown saveVersion 44.*versions 1 through 43 only/,` | "unknown saveVersion 44" -> 45; "1 through 43" -> "1 through 44" |

### `tests/contracts/v14-byte-parity.contract.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0333 | 201 | S1 | certain | `'validateSaveV43',` | 'validateSaveV43' -> 'validateSaveV44' |
| N-0334 | 205 | S2 | certain | `expect(save.saveVersion).toBe(43) // P14C.2b: the live version (was 35)` | 43 -> 44 |

### `tests/d11-employment.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0335 | 551 | S2 | certain | `expect(save.saveVersion).toBe(43) // P13B-S8: new games save as V27.` | 43 -> 44 |

### `tests/d17-engagement-persistence.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0336 | 466 | S2 | certain | `expect(save.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/d17a-adv-migration.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0337 | 274 | S3 | certain | `expect(() => validateSave({ ...v6, saveVersion: 44 })).toThrow(/unknown saveVersion 44/)` | sentinel saveVersion 44 -> 45; "unknown saveVersion 44" -> 45 |

### `tests/d17a-adv-reconciliation.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0338 | 337 | S2 | certain | `expect(reloaded.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/d17b-save-v7.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0339 | 163 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(/unknown saveVersion 44/)` | sentinel saveVersion 44 -> 45; "unknown saveVersion 44" -> 45 |

### `tests/film-chronicle.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0340 | 911 | S2 | certain | `expect(envelope.saveVersion).toBe(43);` | 43 -> 44 |
| N-0341 | 922 | S2 | certain | `expect(restored.saveVersion).toBe(43);` | 43 -> 44 |
| N-0342 | 923 | S2 | certain | `if (restored.saveVersion !== 43) return;` | 43 -> 44 |

### `tests/p04a2-writer-credit-law.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0343 | 773 | S2 | certain | `expect(save.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/p09a-w0-founding-regime.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0344 | 57 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0345 | 137 | S2 | certain | `expect(save.saveVersion).toBe(43)` | 43 -> 44 |
| N-0346 | 145 | S1 | certain | `expect(() => validateSaveV43({ ...raw, state: { ...raw.state, foundingRegime: 'sandbox' }…` | validateSaveV43( -> validateSaveV44( |
| N-0347 | 147 | S1 | certain | `expect(() => validateSaveV43({ ...raw, state: missing })).toThrow(/foundingRegime is miss…` | validateSaveV43( -> validateSaveV44( |
| N-0348 | 149 | S1 | certain | `expect(() => validateSaveV43({ ...raw, state: { ...raw.state, foundingRegime: 'bare-lot' …` | validateSaveV43( -> validateSaveV44( |
| N-0349 | 151 | S1 | certain | `expect(() => validateSaveV43({ ...bare, state: { ...bare.state, foundingRegime: 'endowed'…` | validateSaveV43( -> validateSaveV44( |
| N-0350 | 214 | S1 | certain | `expect(() => validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/p13a-causal-core.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0351 | 4 | S1 | certain | `import { exportCurrentState, importSave, migrateToLive, validateSaveV43, makeSave } from …` | import validateSaveV44 in place of validateSaveV43 |
| N-0352 | 49 | S1 | certain | `expect(()=>validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0353 | 91 | S1 | certain | `expect(()=>validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/p13a-scientist-foundation.test.ts`; 3 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0354 | 32 | S10 | measure | `expect(createHash('sha256').update(JSON.stringify(data)).digest('hex')).toBe(digest)` | no edit: retained identity; attribute the CHANGED primary in the gate compare |

### `tests/p13a-technology-milestones.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0355 | 6 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToV25, migrateToLive, validateSaveV19, …` | import validateSaveV44 in place of validateSaveV43 |
| N-0356 | 74 | S1 | certain | `expect(() => validateSaveV43(forged)).toThrow(/technology milestone/)` | validateSaveV43( -> validateSaveV44( |
| N-0357 | 79 | S1 | certain | `expect(() => validateSaveV43(duplicated)).toThrow(/duplicate technology milestone/)` | validateSaveV43( -> validateSaveV44( |
| N-0358 | 82 | S1 | certain | `expect(() => validateSaveV43(preRecorded)).toThrow(/invented technology history/)` | validateSaveV43( -> validateSaveV44( |

### `tests/p13b-r07-save-v25.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0359 | 273 | P5 | certain | `it('an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (B…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0360 | 274 | S3 | certain | `const forged = { ...save.makeSave(legacyRehearsingWorld('r07-save-v25-unknown-version')),…` | sentinel saveVersion 44 -> 45 |
| N-0361 | 275 | S3 | certain | `expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p13b-s2-access-identity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0362 | 4 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, validateSaveV43 } from '../src/…` | import validateSaveV44 in place of validateSaveV43 |
| N-0363 | 196 | S1 | certain | `expect(() => validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/p13b-s2-save-v22.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0364 | 208 | S2 | certain | `expect(makeSave(live(migrated)).saveVersion).toBe(43)` | 43 -> 44 |
| N-0365 | 211 | P5 | certain | `it('refuses an unknown saveVersion 43 with the updated range (stale number corrected post…` | rename the title to 'refuses an unknown saveVersion 45 with the updated range (...)'; record old -> new identity in the handback |
| N-0366 | 214 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(/versions 1 through 43 o…` | sentinel saveVersion 44 -> 45; "1 through 43" -> "1 through 44" |

### `tests/p13b-s3-save-v23.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0367 | 115 | S9 | measure | `expect(() => migrateToV22(live)).toThrow(/^migrateToV39: cannot downgrade or discard an o…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0368 | 116 | S9 | measure | `expect(() => migrateToV21(live)).toThrow(/^migrateToV39: cannot downgrade or discard an o…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0369 | 117 | S9 | measure | `expect(() => migrateToV20(live)).toThrow(/^migrateToV39: cannot downgrade or discard an o…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0370 | 121 | S2 | certain | `expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(43)` | 43 -> 44 |
| N-0371 | 124 | P5 | certain | `it('an unknown saveVersion 43 is refused, naming the handled range (stale number correcte…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range (...)'; record old -> new identity in the handback |
| N-0372 | 125 | S3 | certain | `const forged = { ...makeSave(p13aLaboratorySlice()), saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0373 | 126 | S3 | certain | `expect(() => validateSave(forged)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p13b-s3-validation.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0374 | 2 | S1 | certain | `import { exportSave, makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0375 | 159 | S1 | certain | `expect(() => validateSaveV43(JSON.parse(json))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/p13b-s5-save-v24.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0376 | 210 | S2 | certain | `expect(makeSave(p13aLaboratorySlice()).saveVersion).toBe(43)` | 43 -> 44 |
| N-0377 | 213 | P5 | certain | `it('an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (s…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0378 | 214 | S3 | certain | `const forged = { ...makeSave(p13aLaboratorySlice()), saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0379 | 215 | S3 | certain | `expect(() => validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p13b-s6-save-v26.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0380 | 221 | P5 | certain | `it('an unknown saveVersion 44 is refused, naming the handled range "1 through 43 only" (B…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0381 | 224 | S3 | certain | `const forged = { ...v26, saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0382 | 225 | S3 | certain | `expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |
| N-0383 | 254 | S2 | certain | `expect((reimported as { saveVersion: number }).saveVersion).toBe(43) // did NOT throw (at…` | 43 -> 44 |

### `tests/p13b-s7-announcements.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0384 | 86 | P5 | certain | `it('LIVE_SAVE_VERSION is 43 (stale title corrected post-C.4 and again for Save43; P13B-S8…` | rename the title to 'LIVE_SAVE_VERSION is 44 (...)'; record old -> new identity in the handback |
| N-0385 | 87 | S2 | certain | `expect(save.LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0386 | 135 | S2 | certain | `expect(reimported.saveVersion).toBe(43) // S7 added no save root; the live version is S8's` | 43 -> 44 |

### `tests/p13b-s8-save-v27.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0387 | 187 | S2 | certain | `expect(envelope.saveVersion).toBe(43)` | 43 -> 44 |
| N-0388 | 211 | P5 | certain | `it('an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (B…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0389 | 214 | S3 | certain | `const forged = { ...v27, saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0390 | 215 | S3 | certain | `expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p14a1-save-v28.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0391 | 252 | P5 | certain | `it('an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (s…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0392 | 255 | S3 | certain | `const forged = { ...lifted, saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0393 | 256 | S3 | certain | `expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p14b1-save-v29.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0394 | 110 | S2 | certain | `expect(save.LIVE_SAVE_VERSION as number).toBe(43)` | 43 -> 44 |
| N-0395 | 202 | P5 | certain | `it('an unknown saveVersion 43 is refused, naming the handled range "1 through 42 only" (s…` | rename the title to 'an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)'; record old -> new identity in the handback |
| N-0396 | 205 | S3 | certain | `const forged = { ...lifted, saveVersion: 44 }` | sentinel saveVersion 44 -> 45 |
| N-0397 | 206 | S3 | certain | `expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 43 only/)` | "1 through 43" -> "1 through 44" |

### `tests/p14b4-save-v30-compatibility.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0398 | 252 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/p14b5-save-v31.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0399 | 195 | P5 | certain | `it('LIVE_SAVE_VERSION is the literal 43 the live writer stamps (stale title corrected pos…` | rename the title to 'LIVE_SAVE_VERSION is the literal 44 the live writer stamps (...)'; record old -> new identity in the handback |
| N-0400 | 196 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/p14c2b-save-v36.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0401 | 29 | S1 | certain | `import { LIVE_SAVE_VERSION, convertV35ToV36, convertV36ToV35, makeSave, validateSaveV43 }…` | import validateSaveV44 in place of validateSaveV43 |
| N-0402 | 113 | S1 | certain | `expect(() => validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0403 | 121 | S1 | certain | `expect(() => validateSaveV43(makeSave(tampered))).toThrow(/at most one\|second retirement…` | validateSaveV43( -> validateSaveV44( |
| N-0404 | 130 | S1 | certain | `expect(() => validateSaveV43(makeSave(tampered))).toThrow(/settled retirementExtension ca…` | validateSaveV43( -> validateSaveV44( |
| N-0405 | 142 | S1 | certain | `expect(() => validateSaveV43(makeSave(tampered))).toThrow(/weeks before its effective wee…` | validateSaveV43( -> validateSaveV44( |
| N-0406 | 155 | S1 | certain | `expect(() => validateSaveV43(makeSave(tampered))).toThrow(/exactly one must/i)` | validateSaveV43( -> validateSaveV44( |
| N-0407 | 161 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0408 | 167 | S2 | certain | `expect((saved as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |

### `tests/p14c4-save-v35.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0409 | 33 | S1 | certain | `LIVE_SAVE_VERSION, convertV34ToV35, convertV35ToV34, makeSave, migrateToV35, validateSave…` | import validateSaveV44 in place of validateSaveV43 |
| N-0410 | 57 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0411 | 63 | S2 | certain | `expect((saved as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |
| N-0412 | 277 | S1 | certain | `const savedLive = validateSaveV43({ saveVersion: LIVE_SAVE_VERSION, seed: state.seed, sta…` | validateSaveV43( -> validateSaveV44( |
| N-0413 | 278 | S1 | certain | `const reloaded = validateSaveV43(JSON.parse(JSON.stringify(savedLive)))` | validateSaveV43( -> validateSaveV44( |

### `tests/placement-save-v12.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0414 | 53 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0415 | 412 | S1 | certain | `expect(validateSaveV43(valid)).toBe(valid)` | validateSaveV43( -> validateSaveV44( |
| N-0416 | 418 | S1 | certain | `expect(() => validateSaveV43(overlapped)).toThrow(/overlaps placed facility 1/)` | validateSaveV43( -> validateSaveV44( |
| N-0417 | 430 | S1 | certain | `expect(() => validateSaveV43(tooClose)).toThrow(/violates its clearance ring/)` | validateSaveV43( -> validateSaveV44( |
| N-0418 | 436 | S1 | certain | `expect(validateSaveV43(valid)).toBe(valid)` | validateSaveV43( -> validateSaveV44( |
| N-0419 | 443 | S1 | certain | `expect(() => validateSaveV43(doubled)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0420 | 450 | S1 | certain | `expect(() => validateSaveV43(early)).toThrow(` | validateSaveV43( -> validateSaveV44( |

### `tests/property-state-v13.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0421 | 65 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0422 | 533 | S2 | certain | `expect(reloaded.saveVersion).toBe(43)` | 43 -> 44 |
| N-0423 | 700 | S2 | certain | `expect(save.saveVersion).toBe(43)` | 43 -> 44 |
| N-0424 | 702 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0425 | 799 | S1 | certain | `expect(() => validateSaveV43(bad)).toThrow(expected)` | validateSaveV43( -> validateSaveV44( |
| N-0426 | 868 | S1 | certain | `expect(() => validateSaveV43(bad)).toThrow(expected)` | validateSaveV43( -> validateSaveV44( |
| N-0427 | 880 | S1 | certain | `expect(() => validateSaveV43(forged)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0428 | 943 | S3 | certain | `expect(() => validateSave({ ...live, saveVersion: 44 })).toThrow(` | sentinel saveVersion 44 -> 45 |
| N-0429 | 944 | S3 | certain | `/unknown saveVersion 44.*versions 1 through 43 only/,` | "unknown saveVersion 44" -> 45; "1 through 43" -> "1 through 44" |

### `tests/script-projects-save-v9.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0430 | 415 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(` | sentinel saveVersion 44 -> 45 |
| N-0431 | 416 | S3 | certain | `/unknown saveVersion 44/,` | "unknown saveVersion 44" -> 45 |
| N-0432 | 418 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(` | sentinel saveVersion 44 -> 45 |
| N-0433 | 419 | S3 | certain | `/versions 1 through 43 only/,` | "1 through 43" -> "1 through 44" |

### `ui/src/engine/d17-save-migration.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0434 | 131 | S2 | certain | `expect(JSON.parse(json).saveVersion).toBe(43) // Current C.3 writer: SaveFileV38.` | 43 -> 44 |
| N-0435 | 155 | S2 | certain | `expect(JSON.parse(exportSaveJson(r.state)).saveVersion).toBe(43) // current C.3 writer: S…` | 43 -> 44 |

### `ui/src/engine/film-chronicle-adapter.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0436 | 289 | S2 | certain | `expect((JSON.parse(json) as { saveVersion: number }).saveVersion).toBe(43) // current C.3…` | 43 -> 44 |

### `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0437 | 46 | S2 | certain | `expect(JSON.parse(json).saveVersion).toBe(43) // current C.3 writer: SaveFileV38.` | 43 -> 44 |

### `ui/src/saves.test.tsx`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0438 | 126 | S2 | certain | `expect(JSON.parse(json).saveVersion).toBe(43) // current C.3 writer: SaveFileV38.` | 43 -> 44 |

### `ui/src/session.test.tsx`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0439 | 332 | S2 | certain | `expect(JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY)!).saveVersion).toBe(43) // C.3…` | 43 -> 44 |
| N-0440 | 360 | S2 | certain | `expect(JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY)!).saveVersion).toBe(43) // C.3…` | 43 -> 44 |
| N-0441 | 387 | S2 | certain | `expect(parsedV11.saveVersion).toBe(43) // C.3: live saves are SaveFileV38.` | 43 -> 44 |

## G5: chains and masking: live-to-older chains, first-guard leaves and the vacuous passes

### `tests/contracts/v14-boundary-guards.contract.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0442 | 34 | S4 | certain | `import { applyActions, convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40…` | add convertV44ToV43 to the import |
| N-0443 | 63 | S4 | certain | `const admitted = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0444 | 63 | S9 | measure | `const admitted = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0445 | 322 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(/unknown saveVersion 44/)` | sentinel saveVersion 44 -> 45; "unknown saveVersion 44" -> 45 |

### `tests/p06a-w1-release-authority.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0446 | 32 | S4 | certain | `convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, convertV43ToV42,` | add convertV44ToV43 to the import |
| N-0447 | 38 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0448 | 406 | S4 | certain | `const admitted37 = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0449 | 406 | S9 | measure | `const admitted37 = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0450 | 447 | S9 | measure | `expect(() => migrateToV15(save)).toThrow(/^migrateToV39: cannot downgrade or discard an o…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0451 | 459 | S1 | certain | `expect(() => validateSaveV43(orphan)).toThrow(/foreign identity\|orphan/)` | validateSaveV43( -> validateSaveV44( |
| N-0452 | 465 | S1 | certain | `expect(() => validateSaveV43(extraKey)).toThrow(/unknown field .surprise./)` | validateSaveV43( -> validateSaveV44( |

### `tests/p08a-w0-studio-history.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0453 | 53 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0454 | 398 | S9 | measure | `expect(() => migrateToV16(live)).toThrow(/cannot downgrade SaveFileV18/)` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0455 | 399 | S9 | measure | `expect(() => migrateToV15(live)).toThrow(/cannot downgrade SaveFileV18/)` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0456 | 441 | S1 | certain | `expect(validateSaveV43(clone(legal))).toBeTruthy()` | validateSaveV43( -> validateSaveV44( |
| N-0457 | 450 | S1 | certain | `expect(() => validateSaveV43(swapped)).toThrow(/ascending eventId/)` | validateSaveV43( -> validateSaveV44( |
| N-0458 | 459 | S1 | certain | `expect(() => validateSaveV43(early)).toThrow(/recording boundary/)` | validateSaveV43( -> validateSaveV44( |
| N-0459 | 465 | S1 | certain | `expect(() => validateSaveV43(lying)).toThrow(/after − before/)` | validateSaveV43( -> validateSaveV44( |
| N-0460 | 477 | S1 | certain | `expect(() => validateSaveV43(unknown)).toThrow(/not a known history kind/)` | validateSaveV43( -> validateSaveV44( |

### `tests/p12-starting-world.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0461 | 2 | S4 | certain | `import { beginFounding, generateWorld, makeSave, exportSave, importSave, migrateToV25, mi…` | add convertV44ToV43 to the import |
| N-0462 | 52 | S4 | certain | `expect(()=>makeSaveV18(convertV41ToV40(convertV42ToV41(convertV43ToV42(makeSave(state))))…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0463 | 52 | S9 | measure | `expect(()=>makeSaveV18(convertV41ToV40(convertV42ToV41(convertV43ToV42(makeSave(state))))…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14c2rm-writer-continuation.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0464 | 12 | S4 | certain | `import { convertV37ToV36, convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41To…` | add convertV44ToV43 to the import |
| N-0465 | 13 | S1 | certain | `validateSaveV36, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0466 | 81 | S1 | certain | `expect(validateSaveV43(envelope(reopened)).state).toBe(reopened)` | validateSaveV43( -> validateSaveV44( |
| N-0467 | 218 | S1 | certain | `expect(() => validateSaveV43(input)).toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0468 | 218 | S8 | measure | `expect(() => validateSaveV43(input)).toThrow()` | after the S1 rename, pin the refusal the live validator gives for the tamper (measured, cited by source line) in place of the bare .toThrow() |
| N-0469 | 232 | S1 | certain | `expect(() => validateSaveV43(envelope(illegal))).toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0470 | 232 | S8 | measure | `expect(() => validateSaveV43(envelope(illegal))).toThrow()` | after the S1 rename, pin the refusal the live validator gives for the tamper (measured, cited by source line) in place of the bare .toThrow() |
| N-0471 | 241 | S1 | certain | `expect(() => validateSaveV43(input)).toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0472 | 241 | S8 | measure | `expect(() => validateSaveV43(input)).toThrow()` | after the S1 rename, pin the refusal the live validator gives for the tamper (measured, cited by source line) in place of the bare .toThrow() |
| N-0473 | 242 | S1 | certain | `expect(() => validateSaveV43({ ...envelope(f.finishing), retirementBypass: true })).toThr…` | validateSaveV43( -> validateSaveV44( |
| N-0474 | 242 | S8 | measure | `expect(() => validateSaveV43({ ...envelope(f.finishing), retirementBypass: true })).toThr…` | after the S1 rename, pin the refusal the live validator gives for the tamper (measured, cited by source line) in place of the bare .toThrow() |
| N-0475 | 254 | S4 | certain | `expect(() => convertV37ToV36(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0476 | 254 | S9 | measure | `expect(() => convertV37ToV36(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0477 | 278 | S1 | certain | `expect(() => validateSaveV43(legal)).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0478 | 279 | S1 | certain | `expect(() => validateSaveV43(illegal)).toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0479 | 345 | S1 | certain | `expect(() => validateSaveV43(envelope(invalid)), 'existing full-save refusal is a control…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14c3-canonical-rival-history.test.ts`; 2 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0480 | 10 | S1 | certain | `import { exportSave, makeSave, stableStringify, validateSaveV37, validateSaveV43 } from '…` | import validateSaveV44 in place of validateSaveV43 |
| N-0481 | 233 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0482 | 245 | S1 | certain | `expect(() => validateSaveV43(mutant)).toThrow(cause)` | validateSaveV43( -> validateSaveV44( |
| N-0483 | 255 | S1 | certain | `expect(() => validateSaveV43(missing)).toThrow(/current profession changed without its an…` | validateSaveV43( -> validateSaveV44( |
| N-0484 | 256 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14c3-cohort-transition.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0485 | 9 | S4 | certain | `import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42To…` | add convertV44ToV43 to the import |
| N-0486 | 273 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0487 | 278 | S1 | certain | `expect(() => validateSaveV43(malformed)).toThrow(/cohort receipt.*week 832.*as a director…` | validateSaveV43( -> validateSaveV44( |
| N-0488 | 280 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0489 | 287 | S4 | certain | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0490 | 287 | S9 | measure | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14c3-dual-extensions.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0491 | 8 | S4 | certain | `import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42To…` | add convertV44ToV43 to the import |
| N-0492 | 178 | S4 | certain | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0493 | 178 | S9 | measure | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14c3-offmenu-extensions.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0494 | 10 | S4 | certain | `import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42To…` | add convertV44ToV43 to the import |
| N-0495 | 235 | S4 | certain | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0496 | 235 | S9 | measure | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14c3-profession-history.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0497 | 119 | S4 | certain | `expect(() => save.convertV38ToV37(save.convertV39ToV38(save.convertV40ToV39(save.convertV…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0498 | 119 | S9 | measure | `expect(() => save.convertV38ToV37(save.convertV39ToV38(save.convertV40ToV39(save.convertV…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0499 | 276 | S1 | certain | `expect(save.validateSaveV43(current)).toBe(current); expect(save.validateSaveV37(old)).to…` | validateSaveV43( -> validateSaveV44( |
| N-0500 | 280 | S1 | certain | `expect(save.validateSaveV43(current)).toBe(current)` | validateSaveV43( -> validateSaveV44( |
| N-0501 | 301 | S1 | certain | `for (const input of [a, b, a]) expect(save.validateSaveV43(input)).toBe(input)` | validateSaveV43( -> validateSaveV44( |
| N-0502 | 305 | S1 | certain | `try { expect(save.validateSaveV43(detached)).toBe(detached) } finally { spy.mockRestore()…` | validateSaveV43( -> validateSaveV44( |
| N-0503 | 320 | S1 | certain | `expect(() => save.validateSaveV43(forgedB)).toThrow(/current profession changed without i…` | validateSaveV43( -> validateSaveV44( |
| N-0504 | 326 | S1 | certain | `expect(save.validateSaveV43(a)).toBe(a); expect(save.validateSaveV43(b)).toBe(b)` | validateSaveV43( -> validateSaveV44( |
| N-0505 | 332 | S1 | certain | `expect(save.validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0506 | 340 | S1 | certain | `expect(() => save.validateSaveV43(malformed)).toThrow(/future entrant in its recorded tal…` | validateSaveV43( -> validateSaveV44( |
| N-0507 | 342 | S1 | certain | `expect(save.validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0508 | 347 | S1 | certain | `expect(save.validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0509 | 354 | S1 | certain | `expect(() => save.validateSaveV43(malformed)).toThrow(/precedes this person's actual crea…` | validateSaveV43( -> validateSaveV44( |
| N-0510 | 356 | S1 | certain | `expect(save.validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0511 | 361 | S1 | certain | `expect(save.validateSaveV37(old)).toBe(old); expect(save.validateSaveV43(current)).toBe(c…` | validateSaveV43( -> validateSaveV44( |
| N-0512 | 376 | S1 | certain | `expect(save.validateSaveV43(current)).toBe(current)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14c3-promise-digest-continuity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0513 | 14 | S4 | certain | `import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42To…` | add convertV44ToV43 to the import |
| N-0514 | 279 | S4 | certain | `expect(exportSave(convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convert…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |

### `tests/p14c3-queued-writing-proof.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0515 | 11 | S1 | certain | `import { stableStringify, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0516 | 27 | S2 | certain | `const envelope = (state: GameState) => ({ saveVersion: 43, seed: state.seed, state, broad…` | 43 -> 44 |
| N-0517 | 61 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |
| N-0518 | 134 | S1 | certain | `expect(() => validateSaveV43(envelope(malformed))).toThrow(/intentRulesVersion must be 1/)` | validateSaveV43( -> validateSaveV44( |
| N-0519 | 159 | S1 | certain | `expect(validateSaveV43(control)).toBe(control)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14c3-transitions.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0520 | 8 | S4 | certain | `import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42To…` | add convertV44ToV43 to the import |
| N-0521 | 175 | S4 | certain | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0522 | 175 | S9 | measure | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0523 | 207 | S4 | certain | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0524 | 207 | S9 | measure | `expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(convertV42To…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14p3-directing-promises.test.ts`; 2 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0525 | 350 | S2 | certain | `const save = saves.makeSave(state); expect(save.saveVersion).toBe(43)` | 43 -> 44 |
| N-0526 | 387 | S4 | certain | `const projectedA = saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(save…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0527 | 387 | S9 | measure | `const projectedA = saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(save…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0528 | 402 | S5 | measure | `const oldState = saves.stableStringify(withEmptyScreenplayShelving(withFirstTakeSubjects(…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0529 | 405 | S2 | certain | `expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0530 | 430 | S2 | certain | `expect(current.saveVersion).toBe(43)` | 43 -> 44 |
| N-0531 | 689 | S9 | measure | `expect(() => futureSave().convertV39ToV38(save)).toThrow(/director\|predicate\|promise/i)` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0532 | 693 | S4 | certain | `const projected = saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(save)…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0533 | 693 | S9 | measure | `const projected = saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43ToV42(save)…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0534 | 1093 | S2 | certain | `expect(saves.makeSave(input.state).saveVersion).toBe(43)` | 43 -> 44 |
| N-0535 | 1133 | S2 | certain | `expect(saves.makeSave(occupied).saveVersion).toBe(43)` | 43 -> 44 |

### `tests/p14p4p5-opportunities.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0536 | 34 | S1 | certain | `validateSaveV43(input: unknown): unknown` | rename the typed member to validateSaveV44 |
| N-0537 | 37 | S4 | certain | `convertV43ToV42(input: unknown): unknown` | add `convertV44ToV43(input: unknown): unknown` to the api type |
| N-0538 | 83 | S1 | certain | `assert.equal(typeof api.validateSaveV43, 'function', 'new public strict42 reader after ac…` | rename to validateSaveV44 with its typed member (the helper names the live validator) |
| N-0539 | 321 | S2 | certain | `expect((valid as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |
| N-0540 | 322 | S1 | certain | `const api = futureAPI(); expect(api.validateSaveV43(valid)).toBe(valid)` | validateSaveV43( -> validateSaveV44( |
| N-0541 | 326 | S4 | certain | `const oneDown = api.convertV41ToV40(api.convertV42ToV41(api.convertV43ToV42(valid)))` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0542 | 326 | S9 | measure | `const oneDown = api.convertV41ToV40(api.convertV42ToV41(api.convertV43ToV42(valid)))` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0543 | 335 | S1 | certain | `expect(() => api.validateSaveV43(bad)).toThrow(/predicate\|family\|genre\|project\|class\…` | validateSaveV43( -> validateSaveV44( |
| N-0544 | 341 | S2 | certain | `expect(saves.LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0545 | 362 | S1 | certain | `expect(current.saveVersion).toBe(43); expect(api.validateSaveV43(current)).toBe(current)` | validateSaveV43( -> validateSaveV44( |
| N-0546 | 362 | S2 | certain | `expect(current.saveVersion).toBe(43); expect(api.validateSaveV43(current)).toBe(current)` | toBe(43) -> toBe(44) |
| N-0547 | 370 | S5 | measure | `expect(added.facts).toEqual([]); expect(stable(unchanged)).toBe(stable(withEmptyScreenpla…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |
| N-0548 | 374 | S4 | certain | `expect(saves.exportSave(api.convertV40ToV39(api.convertV41ToV40(api.convertV42ToV41(api.c…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0549 | 379 | S1 | certain | `expect(api.validateSaveV43(positive)).toBe(positive)` | validateSaveV43( -> validateSaveV44( |
| N-0550 | 393 | S1 | certain | `expect(() => api.validateSaveV43(bad)).toThrow(/first.?take\|subject\|suffix\|cutover/i)` | validateSaveV43( -> validateSaveV44( |
| N-0551 | 394 | S4 | certain | `expect(() => api.convertV41ToV40(api.convertV42ToV41(api.convertV43ToV42(bad)))).toThrow(…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0552 | 732 | S1 | certain | `expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0553 | 740 | S1 | certain | `try { saves.validateSaveV43(bad) } catch (caught) { error = caught }` | validateSaveV43( -> validateSaveV44( |
| N-0554 | 810 | S4 | certain | `expect(() => saves.convertV40ToV39(saves.convertV41ToV40(saves.convertV42ToV41(saves.conv…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0555 | 810 | S9 | measure | `expect(() => saves.convertV40ToV39(saves.convertV41ToV40(saves.convertV42ToV41(saves.conv…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |
| N-0556 | 957 | S1 | certain | `try { saves.validateSaveV43(bad) } catch (caught) { error = caught }` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-screenplay-status.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0557 | 65 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0558 | 65 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0559 | 320 | S4 | certain | `try { saves.convertV40ToV39(saves.convertV41ToV40(saves.convertV42ToV41(saves.convertV43T…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0560 | 324 | S9 | measure | `expect(message).toBe('migrateToV39: cannot downgrade or discard an opportunity predicate …` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/p14r3-save-v41.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0561 | 122 | S4 | certain | `validateSaveV41, validateSaveV43, convertV40ToV41, convertV41ToV40, convertV42ToV41, conv…` | add convertV44ToV43 to the import |
| N-0562 | 211 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |
| N-0563 | 216 | S2 | certain | `expect((saved as { saveVersion: number }).saveVersion).toBe(43)` | 43 -> 44 |
| N-0564 | 224 | S1 | certain | `const revalidated = validateSaveV43(JSON.parse(JSON.stringify(saved)))` | validateSaveV43( -> validateSaveV44( |
| N-0565 | 225 | S2 | certain | `expect(revalidated.saveVersion).toBe(43)` | 43 -> 44 |
| N-0566 | 342 | S1 | certain | `const validated = validateSaveV43(save as never)` | validateSaveV43( -> validateSaveV44( |
| N-0567 | 343 | S2 | certain | `expect(validated.saveVersion).toBe(43)` | 43 -> 44 |
| N-0568 | 374 | S4 | certain | `expect(() => convertV41ToV40(convertV42ToV41(convertV43ToV42(save as never)))).toThrow(/t…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)) |
| N-0569 | 374 | S9 | measure | `expect(() => convertV41ToV40(convertV42ToV41(convertV43ToV42(save as never)))).toThrow(/t…` | after the S4 insert, pin the measured first guard; if it is convertV44ToV43 ("migrateToV43: cannot downgrade or discard the competitions log\|romance of <edgeI… |

### `tests/save.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0570 | 35 | S4 | certain | `convertV39ToV38, convertV40ToV39, convertV41ToV40, convertV42ToV41, convertV43ToV42,` | add convertV44ToV43 to the import |
| N-0571 | 288 | S3 | certain | `const bad = { ...save, saveVersion: 44 } as unknown as SaveFileV14;` | sentinel saveVersion 44 -> 45 |
| N-0572 | 370 | S4 | certain | `const historical = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0573 | 370 | S9 | measure | `const historical = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0574 | 419 | S4 | certain | `const historical = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | insert convertV44ToV43(...) innermost: convertV43ToV42(convertV44ToV43(<live>)); measured: X5 step 4: root TS2345 |
| N-0575 | 419 | S9 | measure | `const historical = convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(conver…` | none while every log is empty and every romance null: this chain must succeed. x2 measures it after the S4 insert; if convertV44ToV43 refuses, stop and report … |
| N-0576 | 453 | P5 | certain | `it("rejects an unknown saveVersion 43 with the updated range, and rejects downgrading V15…` | rename the title to 'rejects an unknown saveVersion 45 with the updated range, ...'; record old -> new identity in the handback |
| N-0577 | 455 | S3 | certain | `expect(() => validateSave({ ...save, saveVersion: 44 })).toThrow(` | sentinel saveVersion 44 -> 45 |
| N-0578 | 456 | S3 | certain | `/versions 1 through 43 only/,` | "1 through 43" -> "1 through 44" |

## G6: the remaining core S1/S2/S5 files (p14b1-p14b4, p14p4p5, c2a, contracts, construction)

### `tests/c2a-m2-sets-save.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0579 | 32 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0580 | 52 | S1 | certain | `expect(() => validateSaveV43(makeSave(generated))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0581 | 172 | S1 | certain | `expect(() => validateSaveV43(envelope)).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0582 | 182 | S1 | certain | `validateSaveV43(` | validateSaveV43( -> validateSaveV44( |
| N-0583 | 191 | S1 | certain | `validateSaveV43(` | validateSaveV43( -> validateSaveV44( |
| N-0584 | 200 | S1 | certain | `validateSaveV43(` | validateSaveV43( -> validateSaveV44( |
| N-0585 | 231 | S1 | certain | `expect(() => validateSaveV43(makeSave(native))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0586 | 250 | S1 | certain | `expect(() => validateSaveV43(makeSave(liveMigrated))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0587 | 280 | S1 | certain | `expect(() => validateSaveV43(JSON.parse(exportSave(makeSave(played))))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0588 | 289 | S1 | certain | `expect(() => validateSaveV43(makeSave(native))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0589 | 295 | S1 | certain | `expect(() => validateSaveV43(makeSave(liveMigrated))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/c2a-m3-rename-and-pooling.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0590 | 214 | S2 | certain | `expect(makeSave(state).saveVersion).toBe(43)` | 43 -> 44 |
| N-0591 | 363 | S2 | certain | `expect(makeSave(state).saveVersion).toBe(43)` | 43 -> 44 |

### `tests/c2a-m3-screenplay-mint.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0592 | 356 | S2 | certain | `expect(save.saveVersion).toBe(43)` | 43 -> 44 |

### `tests/construction-core.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0593 | 19 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0594 | 497 | S1 | certain | `expect(() => validateSaveV43(forgedSave)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0595 | 505 | S1 | certain | `expect(() => validateSaveV43(makeSave(laundered))).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0596 | 566 | S1 | certain | `expect(() => validateSaveV43(forgedSave)).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0597 | 664 | S1 | certain | `expect(() => validateSaveV43(makeSave(state))).not.toThrow()` | validateSaveV43( -> validateSaveV44( |

### `tests/contracts/cross-owner-refusal.contract.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0598 | 24 | S1 | certain | `import { applyActions, exportSave, importSave, makeSave, stableStringify, tick, validateS…` | import validateSaveV44 in place of validateSaveV43 |
| N-0599 | 72 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0600 | 100 | S1 | certain | `validateSaveV43(forged)` | validateSaveV43( -> validateSaveV44( |
| N-0601 | 118 | S1 | certain | `expect(validateSaveV43(forged as LiveSaveFile)).toBe(forged)` | validateSaveV43( -> validateSaveV44( |

### `tests/contracts/phase-table-agreement.contract.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0602 | 28 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0603 | 104 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0604 | 224 | S1 | certain | `expect(() => validateSaveV43(forged), `${snapshot.phase} forged`).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0605 | 230 | S1 | certain | `expect(validateSaveV43(legal)).toBe(legal)` | validateSaveV43( -> validateSaveV44( |
| N-0606 | 246 | S1 | certain | `expect(() => validateSaveV43(forged), `${snapshot.phase} → ${wrongTarget}`).toThrow(` | validateSaveV43( -> validateSaveV44( |
| N-0607 | 266 | S1 | certain | `expect(() => validateSaveV43(forged)).toThrow(` | validateSaveV43( -> validateSaveV44( |

### `tests/contracts/studio-events.contract.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0608 | 129 | S1 | certain | `const validateLive = requireFunction(requireCore(), 'validateSaveV43', 'P09 live boundary…` | 'validateSaveV43' -> 'validateSaveV44' |

### `tests/facility-move-demolish.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0609 | 52 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0610 | 781 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |

### `tests/legacy-parcel-ground.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0611 | 49 | S1 | certain | `validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0612 | 365 | S1 | certain | `expect(() => validateSaveV43(save)).toThrow(named)` | validateSaveV43( -> validateSaveV44( |
| N-0613 | 376 | S1 | certain | `expect(validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0614 | 404 | S1 | certain | `expect(() => validateSaveV43(save), blueprint.id).toThrow(/reserved for the studio's Anne…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b1-first-take.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0615 | 294 | S1 | certain | `const roundTripped = save.validateSaveV43(JSON.parse(JSON.stringify(envelope)))` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b1-promises.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0616 | 503 | S1 | certain | `save.validateSaveV43(save.makeSave(withActivePromise))` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b1-t4-regressions.test.ts`; 15 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0617 | 12 | S1 | certain | `import { LIVE_SAVE_VERSION, migrateToLive, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0618 | 84 | S1 | certain | `expect(() => validateSaveV43(valid)).not.toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0619 | 86 | S1 | certain | `expect(() => validateSaveV43(valid)).toThrow()` | validateSaveV43( -> validateSaveV44( |
| N-0620 | 166 | S1 | certain | `const loaded = validateSaveV43(JSON.parse(json))` | validateSaveV43( -> validateSaveV44( |
| N-0621 | 306 | S1 | certain | `expect(JSON.stringify(validateSaveV43(JSON.parse(json)))).toBe(json)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b2-setup-wrap-regressions.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0622 | 7 | S1 | certain | `import { makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0623 | 27 | S1 | certain | `expect(validateSaveV43(JSON.parse(JSON.stringify(saved)))).toEqual(saved)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b3-reservations.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0624 | 12 | S1 | certain | `import { makeSave, validateSaveV43 } from '../src/core/save.js'` | import validateSaveV44 in place of validateSaveV43 |
| N-0625 | 94 | S1 | certain | `const reloaded = validateSaveV43(JSON.parse(JSON.stringify(makeSave(next)))).state` | validateSaveV43( -> validateSaveV44( |
| N-0626 | 134 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(settled))))` | validateSaveV43( -> validateSaveV44( |
| N-0627 | 177 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(released))))` | validateSaveV43( -> validateSaveV44( |
| N-0628 | 201 | S1 | certain | `validateSaveV43(JSON.parse(JSON.stringify(makeSave(settled))))` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b3-rule-revision.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0629 | 13 | S1 | certain | `import { exportSave, importSave, LIVE_SAVE_VERSION, loadSave, makeSave, migrateToV29, mig…` | import validateSaveV44 in place of validateSaveV43 |
| N-0630 | 235 | S1 | certain | `const reloaded = validateSaveV43(importSave(exportSave(makeSave(attached)))).state` | validateSaveV43( -> validateSaveV44( |
| N-0631 | 277 | S1 | certain | `const reloaded = validateSaveV43(importSave(exportSave(makeSave(settled)))).state` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b4-cancel-causal-proof.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0632 | 271 | S2 | certain | `expect(makeSave(state).saveVersion).toBe(43)` | 43 -> 44 |

### `tests/p14b4-cast-class-outcomes.test.ts`; 9 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0633 | 20 | S1 | certain | `import { exportSave, importSave, makeSave, migrateToLive, validateSaveV29, validateSaveV4…` | import validateSaveV44 in place of validateSaveV43 |
| N-0634 | 79 | S2 | certain | `expect(validated.saveVersion).toBe(43)` | 43 -> 44 |
| N-0635 | 355 | S1 | certain | `const reloaded = validateSaveV43(importSave(exportSave(makeSave(after.state))))` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b4-material-evidence-core.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0636 | 17 | S1 | certain | `import { convertV31ToV32, convertV32ToV33, convertV33ToV34, convertV34ToV35, convertV35To…` | import validateSaveV44 in place of validateSaveV43 |
| N-0637 | 40 | S4 | certain | `type EnvelopeV33 = ReturnType<typeof validateSaveV43>` | type EnvelopeV33 = ReturnType<typeof validateSaveV44> (or LiveSaveFile); measured: X5 step 4: root TS2322 at :293 |
| N-0638 | 109 | S1 | certain | `return validateSaveV43({ ...carrier, state, broadcastCache: state.broadcastItems })` | validateSaveV43( -> validateSaveV44( |
| N-0639 | 362 | S1 | certain | `validateSaveV43(input)` | validateSaveV43( -> validateSaveV44( |

### `tests/p14b4-rival-seating-preference.test.ts`; 17 retained 1348-I identities in this file

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0640 | 498 | S10 | measure | `expect(digest).toBe(CHAIN_DIGESTS[seed as keyof typeof CHAIN_DIGESTS])` | no edit: retained identity; attribute the CHANGED primary in the gate compare |

### `tests/p14b7-promise-waiver.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0641 | 651 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/p14bf2-acting-discipline.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0642 | 20 | S1 | certain | `import { exportSave, importSave, LIVE_SAVE_VERSION, loadSave, makeSave, migrateToV29, mig…` | import validateSaveV44 in place of validateSaveV43 |
| N-0643 | 97 | S1 | certain | `validateSaveV43(makeSave(state))` | validateSaveV43( -> validateSaveV44( |
| N-0644 | 137 | S1 | certain | `validateSaveV43(makeSave(legal))` | validateSaveV43( -> validateSaveV44( |
| N-0645 | 269 | S1 | certain | `const loaded = validateSaveV43(importSave(exportSave(makeSave(state)))).state` | validateSaveV43( -> validateSaveV44( |
| N-0646 | 418 | S1 | certain | `expect(validateSaveV43(importSave(exportSave(makeSave(attached)))).state.promises).toEqua…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14c2a-save-and-settlement.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0647 | 28 | S1 | certain | `validateSaveV37, validateSaveV43,` | import validateSaveV44 in place of validateSaveV43 |
| N-0648 | 346 | S1 | certain | `const reloaded = validateSaveV43(JSON.parse(JSON.stringify(makeSave(state)))).state` | validateSaveV43( -> validateSaveV44( |
| N-0649 | 353 | S2 | certain | `expect(LIVE_SAVE_VERSION).toBe(43)` | 43 -> 44 |

### `tests/p14p4p5-casting-reservation.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0650 | 81 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0651 | 81 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0652 | 204 | S5 | measure | `expect(state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withSharedCom…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/p14p4p5-cross-owner.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0653 | 75 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0654 | 75 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0655 | 76 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |
| N-0656 | 102 | S5 | measure | `expect(retained).toEqual(withEmptyScreenplayShelving(withRivalTermination(withSharedCompe…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/p14p4p5-delayed-retirement.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0657 | 100 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0658 | 100 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0659 | 182 | S5 | measure | `expect(stable(old)).toBe(frozen); expect(state).toEqual({ ...withEmptyScreenplayShelving(…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/p14p4p5-finishing-material.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0660 | 64 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0661 | 64 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0662 | 65 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-grouped-witness.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0663 | 70 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0664 | 70 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0665 | 71 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-queued-project-outcome.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0666 | 99 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0667 | 99 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0668 | 181 | S5 | measure | `expect(stable(old)).toBe(frozen); expect(state).toEqual({ ...withEmptyScreenplayShelving(…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/p14p4p5-receipt-freeze.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0669 | 65 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0670 | 65 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0671 | 361 | S1 | certain | `const raw = bytes(state), imported = saves.importSave(raw), round = saves.validateSaveV43…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-retired-acting.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0672 | 47 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0673 | 47 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0674 | 48 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-scenery-capacity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0675 | 81 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0676 | 81 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0677 | 197 | S5 | measure | `expect(state).toEqual({ ...withEmptyScreenplayShelving(withRivalTermination(withSharedCom…` | apply the file's one new helper withEmptyCompetitionsAndRomance (every edge gains `competitions: []` and `romance: null`, built from the old state, never liter… |

### `tests/p14p4p5-soundstage-capacity.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0678 | 55 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0679 | 55 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0680 | 56 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-stock-subject.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0681 | 66 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0682 | 66 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |
| N-0683 | 67 | S1 | certain | `const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.val…` | validateSaveV43( -> validateSaveV44( |

### `tests/p14p4p5-writer-resources.test.ts`

| Id | Line | Class | Status | Current text | Planned edit |
|---|---:|---|---|---|---|
| N-0684 | 50 | S1 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | validateSaveV43( -> validateSaveV44( |
| N-0685 | 50 | S2 | certain | `expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)` | toBe(43) -> toBe(44) |

## Out of scope

- `bridge/testing/c3-active-endurance-observer.ts:41`: asserts PROJECTION_VERSION 53, stale at HEAD 56 (1358-E; 1358-J item 5)
- `tests/bridge-owner-ux-projection20-migration.test.ts:65`: asserts PROJECTION_VERSION 53, stale at HEAD; the file is outside the 440-file gate (1296-A Owner-input hold)

## Examined, no edit

| File | Line | Reason |
|---|---:|---|
| `tests/bridge-contract-generator.test.ts` | 726 | 1358-J finding 10 |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | 12 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | 67 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | 68 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-p06-checkpoint-recovery.test.ts` | 8 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-p06-checkpoint-recovery.test.ts` | 177 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-p06-checkpoint-recovery.test.ts` | 178 | outside the 440-file gate (1296-A Owner-input hold); reads a historical roster entry |
| `tests/bridge-p10a-w0-people-projection.test.ts` | 35 | import of an unchanged name |
| `tests/bridge-p10a-w0-people-projection.test.ts` | 330 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p10a-w0-people-projection.test.ts` | 331 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p11-capital-contributors.test.ts` | 6 | import of an unchanged name |
| `tests/bridge-p11-capital-contributors.test.ts` | 26 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p11-production-location.test.ts` | 4 | import of an unchanged name |
| `tests/bridge-p11-production-location.test.ts` | 35 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p11-ready.test.ts` | 4 | import of an unchanged name |
| `tests/bridge-p11-ready.test.ts` | 53 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b2-checkpoint.test.ts` | 6 | import of an unchanged name |
| `tests/bridge-p14b2-checkpoint.test.ts` | 33 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 18 | import of an unchanged name |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 210 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 212 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 213 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 214 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 215 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 221 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | 257 | S5 candidate that needs no edit: compares .hollywood only |
| `tests/bridge-p14b5-relationships.test.ts` | 44 | import of an unchanged name |
| `tests/bridge-p14b5-relationships.test.ts` | 385 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 386 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 387 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 388 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 431 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 432 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b5-relationships.test.ts` | 470 | S5 candidate that needs no edit: compares .hollywood only |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 72 | import of an unchanged name |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 786 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 787 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 788 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 789 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 792 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 793 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 57 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 105 | import of an unchanged name |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 784 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 785 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 786 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14b8-waiver-surface.test.ts` | 787 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c2rm-runtime.test.ts` | 7 | import of an unchanged name |
| `tests/bridge-p14c2rm-runtime.test.ts` | 98 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c2rm-runtime.test.ts` | 99 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c2s-scientist-runtime.test.ts` | 10 | import of an unchanged name |
| `tests/bridge-p14c2s-scientist-runtime.test.ts` | 110 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c2s-scientist-runtime.test.ts` | 111 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | 15 | import of an unchanged name |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | 121 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | 122 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14c3-runtime.test.ts` | 10 | import of an unchanged name |
| `tests/bridge-p14c3-runtime.test.ts` | 161 | filters one named historical entry; unchanged |
| `tests/bridge-p14c3-runtime.test.ts` | 162 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14p3-directing-promises.test.ts` | 18 | import of an unchanged name |
| `tests/bridge-p14p3-directing-promises.test.ts` | 359 | filters one named historical entry; unchanged |
| `tests/bridge-p14p3-directing-promises.test.ts` | 360 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 16 | import of an unchanged name |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 489 | filters one named historical entry; unchanged |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 490 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 491 | filters one named historical entry; unchanged |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 493 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 496 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14r2r3-prior55.test.ts` | 14 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14r2r3-prior55.test.ts` | 15 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14r2r3-prior55.test.ts` | 50 | comment; no runtime effect (update only if the author touches the block) |
| `tests/bridge-p14r2r3-prior55.test.ts` | 65 | import of an unchanged name |
| `tests/bridge-p14r2r3-prior55.test.ts` | 156 | filters one named historical entry; unchanged |
| `tests/bridge-p14r2r3-prior55.test.ts` | 157 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-p14r2r3-prior55.test.ts` | 169 | filters one named historical entry; unchanged |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | 44 | import of an unchanged name |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | 148 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | 149 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/bridge-runtime-checkpoint.test.ts` | 15 | import of an unchanged name |
| `tests/bridge-runtime-checkpoint.test.ts` | 946 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/contracts/v14-boundary-guards.contract.test.ts` | 321 | comment; no runtime effect (update only if the author touches the block) |
| `tests/d17a-adv-cliff.test.ts` | 192 | pins.txt false positive: releaseTick 56, not a projection |
| `tests/p14b3-rule-revision.test.ts` | 174 | S5 candidate that needs no edit: V29 input: the expectation states `relationships: []`; LIVE_SAVE_VERSION is dynamic |
| `tests/p14b4-save-v30-compatibility.test.ts` | 216 | S5 candidate that needs no edit: V30 input: the expectation states `relationships: []` |
| `tests/p14b9-casting-competition.test.ts` | 339 | pins.txt false positive: 1358-J finding 15: edgeOf returns a state RelationshipEdge |
| `tests/p14b9-save-v42.test.ts` | 174 | convertV42ToV43 signature; 1358-J finding 15 false positive |
| `tests/p14bf2-acting-discipline.test.ts` | 366 | S5 candidate that needs no edit: V29 input: the expectation states `relationships: []`; LIVE_SAVE_VERSION is dynamic |
| `tests/p14c2rm-writer-continuation.test.ts` | 265 | S5 candidate that needs no edit: compares .hollywood only |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 35 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 36 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 37 | Save43 test: the V43 API |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 47 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 49 | Save43 test: existence |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 57 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 58 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 76 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 124 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 139 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 147 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 156 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 165 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 180 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 191 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 199 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 211 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 216 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 223 | Save43 test: a V43 envelope |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 229 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 235 | Save43 test: a V43 envelope |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 243 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 251 | Save43 test: a V43 envelope |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 257 | Save43 test: a V43 envelope, the V43 API, or its V43 output |
| `tests/p14d1-rival-shelving-save-v43.test.ts` | 263 | Save43 test: a V43 envelope |
| `tests/p14d1-rival-shelving.test.ts` | 189 | existence check of the frozen V43 function |
| `tests/p14d1-rival-shelving.test.ts` | 191 | existence check of the frozen V43 step |
| `tests/p14p4p5-opportunities.test.ts` | 84 | existence check of the V43 -> V42 step, still public |
| `tests/p15a2-power-ranking.test.ts` | 365 | pins.txt false positive: a Power Ranking score of 56 |
| `tests/p15a2-power-ranking.test.ts` | 416 | pins.txt false positive: a Power Ranking score of 56 |
| `tests/p15a2-power-ranking.test.ts` | 421 | pins.txt false positive: a Power Ranking score of 56 |
| `tests/r3n1-stale-schedule-take-02.test.ts` | 46 | import of an unchanged name |
| `tests/r3n1-stale-schedule-take-02.test.ts` | 108 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
| `tests/r3n1-stale-schedule-take-02p31.test.ts` | 43 | import of an unchanged name |
| `tests/r3n1-stale-schedule-take-02p31.test.ts` | 115 | reads one historical roster entry or asserts the running id is absent; unchanged by step 4 |
