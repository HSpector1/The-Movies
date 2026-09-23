# 751 — the projection 49 → 50 sweep inventory, enumerated by the parent

Source `25794023`. Every grep below was run by the parent, not by a sweep agent. This exists because
the V31 → V32 sweep reported "CANNOT-MOVE residue: none" and had missed four sites, which cost a
falsified prediction and a second 52-minute full run (record 737). The standing rule from that
failure: paste the classes verbatim into the brief, then run every grep yourself.

## The classes, and why these

| class | pattern | hits |
| --- | --- | --- |
| 1 | `PROJECTION_VERSION).toBe(49)` | 26 |
| 2 | `projection-49` (URN text, comments, test titles) | 23 |
| 3 | the outgoing schema id literal `sha256:60af24c5…` | 28 files |
| 4 | the INCOMING literal, `projection-50` / `toBe(50)` | 2, both unrelated |

Class 4 is the one a finder keyed on the outgoing version is structurally blind to, and it is the
class that cost record 737. Run: the only `toBe(50)` hits are
`tests/p14b5-relationships.test.ts:409` (`RELATIONSHIP_BASELINE`) and `tests/worldgen.test.ts:194`
(worldgen forces). Neither is a projection pin. **No collision.**

## THE SPLIT: what moves and what must not

This is the part a blanket `sed` destroys. The V31 → V32 sweep learned it on `validateSaveV31`,
where 1 of 29 references was the live boundary and the other 28 were frozen-era proofs.

### MUST NOT MOVE — 13 files of minted evidence

Every `provenance.json` and `MANIFEST.json` under `tests/fixtures/p14/`:

- `genuine-projection49-runtime/` (provenance 4 sites, MANIFEST 3)
- `genuine-v32-pre-b8/` (provenance 1, MANIFEST 1)
- `genuine-v31-pre-b7/` (MANIFEST 1, plus 9 per-fixture provenance files)

These record the identity each artifact was minted UNDER. They are immutable evidence and a sweep
that rewrites them destroys the provenance chain. A `grep -rl … | xargs sed` over the repo hits every
one of them.

### MUST NOT MOVE — 3 historical references in test files

- `tests/bridge-p14b4-runtime47-compatibility.test.ts:42` — a comment reading "before the
  projection-49 bump (ad49031f^)". Historical fact about a past commit.
- `tests/bridge-runtime-checkpoint.test.ts:974` — the same comment.
- `tests/bridge-p13b-s8-rivals.test.ts:223` — the trailing comment "RED: today PROJECTION_VERSION is
  40". Stale but historical; leave it.

### MOVES — source and generated

| site | change |
| --- | --- |
| `bridge/schema/bridge-schema.ts:258` | `PROJECTION_VERSION = 49` → `50` |
| `bridge/schema/project-studio-bridge.schema.json:16554` | `$id` URN, regenerated |
| `generated/unity/StudioBridgeDtos.Generated.cs` | 3 sites, regenerated |
| `generated/unity/project-studio-bridge.contract-manifest.json` | regenerated |
| `bridge/runtime-checkpoint.ts:59` | ADD `['sha256:60af24c5…', 'projection-v49']`, same commit as the bump |

### MOVES — the running-identity pins, 22 test files

`expect(PROJECTION_VERSION).toBe(49)` and the `BRIDGE_SCHEMA.$id` pins beside them:

`bridge-operations-events:323,333` · `bridge-owner-ux-projection20-migration:65` ·
`bridge-owner-ux-projection21-schema:18,19` · `bridge-p10a-w0-people-projection:321,322` ·
`bridge-p11-capital-contributors:24` · `bridge-p11-ready:52` · `bridge-p13b-r07-setup:320,321` ·
`bridge-p13b-s1b-seats:76` · `bridge-p13b-s2-labs:115` · `bridge-p13b-s3-plans:202` ·
`bridge-p13b-s4-office:224` · `bridge-p13b-s5-adoption:250,251` ·
`bridge-p13b-s6-cancellation:270,271` · `bridge-p13b-s7-disclosure:270,271` ·
`bridge-p13b-s8-rivals:223,224` · `bridge-p14a1-market:152,153` · `bridge-p14a2-market:217,218` ·
`bridge-p14a3-world:229,230` · `bridge-p14b1-promises:208,209` · `bridge-p14b2-trust:134,136` ·
`bridge-p14b3-promise-command:502` · `bridge-p14b4-runtime47-compatibility:173` ·
`bridge-p14b5-relationships:289,292` · `bridge-p14b7-promise-waiver:117` ·
`bridge-r3n4-read-model-deltas:144,145` · `bridge-schema:84,340`

### MOVES — the schema-id literal, 2 test files

- `tests/bridge-contract-generator.test.ts:564` and `:567` pin the C# header and the manifest
  schemaId to `sha256:60af24c5…`. Both move to the NEW identity.
- `tests/bridge-p14b5-relationships.test.ts:292` pins `SCHEMA_ID` to the same literal. It moves, and
  `60af24c5…` simultaneously becomes the OUTGOING constant in the prior-id assertions at `:295` and
  `:342`.

### The prior-roster arithmetic, read from both precedents

`bridge-p14b5-relationships` asserts `[...EXPECTED_35_PRIOR_IDS, OUTGOING_47, OUTGOING_48]` = 37.
`bridge-p14b6-relationship-read-models:760-767` asserts `EXPECTED_36_PRIOR_IDS` has length 36, plus
`OUTGOING_48` = 37, and `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size` is 37. After B.8 the roster is
**38**, and `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)` must stay `false` for the new
running identity.

### The symbolic precedent, worth copying

`tests/bridge-p14b6-relationship-read-models.test.ts` pins through `INCOMING_PROJECTION` and
`OUTGOING_PROJECTION` constants rather than bare literals, so its assertions survive the next bump
untouched. Most of the 22 files above use bare literals instead. B.8 does not refactor them; noted so
a later bump can.

## One defect found while enumerating

`tests/bridge-p14b6-relationship-read-models.test.ts:750` — the test TITLE reads
"projection 49, schema $id projection-49, **LIVE_SAVE_VERSION still 31**, and the outgoing 48
identity is retired". The assertion beneath it reads `expect(LIVE_SAVE_VERSION).toBe(32)`, correctly
updated by the B.7 sweep with the inline comment "B.6 has NO save step". The title was not updated
and now misdescribes what the test proves.

The test passes, so nothing is broken. It matters because a title is what a reader sees in a failure
report, and this one would send them looking for a save-version regression that is not there. B.8
corrects the title only, and touches no assertion. Recorded rather than fixed silently.

## Standing qualification

These are static enumerations at `25794023`. Which of the 22 files actually fail under the bump is
unknown until the bump runs, and no count here should be read as a prediction of the failure set.

---

## CORRECTION — this inventory was incomplete, and it failed the same way record 737 did

The RED author (record 750) found six sites this inventory does not reach. The parent re-ran the
greps and found a seventh. All confirmed by direct read.

**The root cause is mine and it is the record-737 failure one level up.** Record 737's sweep keyed a
finder on the outgoing VERSION and was structurally blind to files that never mention it. This
inventory keyed its classes on the SYMBOL `PROJECTION_VERSION` and was blind to every other spelling
of the same fact. The lesson generalises: **grep the VALUE, not the symbol.** A bare `toBe(49)`
finds 42 lines across 27 files; the symbol-keyed pattern found 26.

### The complete class list, seven not three

| # | pattern | hits | note |
| --- | --- | --- | --- |
| 1 | `PROJECTION_VERSION).toBe(49)` | 26 | the original class |
| 2 | `SNAPSHOT_VERSION).toBe(49)` | 1 | `tests/bridge.test.ts:167`. `SNAPSHOT_VERSION = PROJECTION_VERSION` (`bridge/protocol.ts:34`). This file appears in NO class of the original inventory: it has no URN string and no schema-id literal either, so it was invisible three times over. |
| 3 | `<response>.snapshotVersion).toBe(49)` | 5 | `bridge-p13b-s1b-seats:102`, `s2-labs:126`, `s3-plans:214`, `s4-office:235`, `r3n4-read-model-deltas:351`. Each is a SECOND line in a file the original listed at one line. |
| 4 | `BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(49)` | 10 | `bridge-p13b-r07-setup:322`, `s5-adoption:252`, `s6-cancellation:272`, `s7-disclosure:272`, `s8-rivals:225`, `bridge-p14a1-market:154`, `p14a2-market:219`, `p14a3-world:231`, `p14b1-promises:210`, `p14b2-trust:137`. A fourth spelling, missed entirely. |
| 5 | symbolic constants `= 49` | 2 | `bridge/schema/bridge-schema.ts:258` (the constant) and `tests/bridge-p14b6-relationship-read-models.test.ts:95` (`INCOMING_PROJECTION`). No `toBe` grep reaches a definition. |
| 6 | the C# constant as TEXT | 1 | `tests/bridge-schema.test.ts:576`: `expect(generatedCsharp).toContain('public const int ProjectionVersion = 49;')`. Parent-found on the re-run. Invisible to every other class, including the value-keyed one, because the number sits inside a quoted C# string. |
| 7 | `projection-49` URN text | 23 | as originally listed |

Class 8 remains the schema-id literal `60af24c5…` (28 files, 13 of them frozen evidence).

### Prior-roster assertions, each needing the new id

- `tests/bridge-p14b4-runtime47-compatibility.test.ts:177`, against the literal roster at `:40`. The
  original listed only `:173` in this file.
- `tests/bridge-p14b5-relationships.test.ts:295` and `:342`.
- `tests/bridge-runtime-checkpoint.test.ts:972`. **The original marked this file MUST NOT MOVE** for
  the historical comment at `:974`. That stands for the comment, and the assertion three lines above
  it must still gain the new id. A file can hold both a frozen line and a live one; the split is
  per-LINE, not per-file. This is the sharpest correction in this record.
- `tests/bridge-p14b6-relationship-read-models.test.ts:766` and `:767` (`size).toBe(37)` → 38). The
  original omitted this file from the MOVES list entirely.

### Row-shape pins that break on the two new members, reached by no version class

- `tests/bridge-p14b2-trust.test.ts:50`, the `expectedHistory` helper, consumed at `:219`, `:239`,
  `:250` and `:342`.
- `tests/bridge-p14b4-cast-class.test.ts:330-337`, an exact row `toEqual` plus a `parseWireValue`
  comparison. Author-reported; no projection class reaches it.
- `tests/bridge-p14b1-promises.test.ts:295`, `:301`, `:316`, `:319`. Author-reported.
- `tests/bridge-p14b2-trust.test.ts:141-145`, the exact 25-member `AVAILABLE_INTENT_KINDS` `toEqual`.
  Breaks by design when the new intent kind lands.
- `tests/bridge-p14b2-trust.test.ts:157` does NOT break: both sides come from the same function.

### What the original got right, kept

The SPLIT and its 13 files of minted evidence stand, and so do the three historical comments, with
the one correction above that `bridge-runtime-checkpoint.test.ts` is split per-line rather than
frozen whole.
