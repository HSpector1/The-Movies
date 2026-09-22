# 699-W — P14B.6 relationship read models: writer handback

Authority: parent brief `699-W-b6-writer-brief.md` and its four binding decisions; RED handback
`698-T1-report.md`; scope record 687; Owner ruling 4 of record 683. Source: worktree
`/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`,
HEAD `43817117`. Sole production writer.

**I changed no test, no fixture and no helper. I made no git change: no add, no commit, no checkout,
no stash. The working tree carries the cumulative S4 state, uncommitted.**

`tests/bridge-p14b6-relationship-read-models.test.ts` still hashes
`4c3f86c0769284d9ee60e6a304f0bdcfc181755fb8a936cd735557e6e7edcbf0`, the value 698-T1 recorded.

## Result

`npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=verbose` reports
**24 tests, 24 passed**, 10.69 s. Every family is green, including family 0, the green control.

## The four step patches

Each is cumulative `git diff HEAD --binary` for the tracked files, with the new-file diff for the
untracked `bridge/relationships.ts` appended (`git diff --no-index --binary -- /dev/null
bridge/relationships.ts`, which touches neither the index nor a ref). Apply in order.

| step | path | sha256 |
|---|---|---|
| S1 schema | `out/p14b6-patches/S1-schema.patch` | `f359be1dc838d7c3e66483ae2ffd0945ff0370f50c7dca8903f58b15dd581971` |
| S2 projector + people | `out/p14b6-patches/S2-projector-and-people.patch` | `80e27e8f5e69857cf3cc4b436953a6265b77f6ade0d048b64af6d93049a48b03` |
| S3 casting rows + warning | `out/p14b6-patches/S3-casting-rows-and-warning.patch` | `318c918f4c7dc0e1e3cbaa065158b494d30f147567b76c07ec597007551742b1` |
| S4 wire | `out/p14b6-patches/S4-wire-projection49.patch` | `6a59c2f768b72fbf488419cf0be75f5f92a96dd2519d824dab99db0ff49bb9f1` |

`out/` is gitignored (`.gitignore:4`) and survives the session; the same four files also sit in the
session scratchpad at
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/patches/`.

**One deviation from the suggested step split, for bisectability.** The brief suggested S1 = all
schema. Adding `chemistry` and `chemistryWarning` to `StudioCastingQuoteSnapshot` makes the
schema-inferred `BridgeCastingQuoteSnapshot` gain two required fields, so `bridge/casting.ts` stops
compiling until its three quote builders supply them. S1 therefore lands the two profile `$defs`,
the `collaborators` carrier and the standalone `StudioCastingChemistryRow` `$def`; S3 lands the two
quote carrier fields together with the `casting.ts` producers. Every step typechecks on its own:
S1 `npm run typecheck:bridge` reported only the RED's own pre-existing
`TS2307: Cannot find module '../bridge/relationships.js'`, and S2, S3 and S4 reported nothing.

## Files changed

| file | step | what |
|---|---|---|
| `bridge/schema/bridge-schema.ts` | S1, S3, S4 | `StudioCastingChemistryRow`, `StudioRelationshipRow`, `StudioRelationshipBlock`; `collaborators` on `StudioPersonProfileSnapshot`; `chemistry` + `chemistryWarning` on `StudioCastingQuoteSnapshot`; three `definitions` entries and three exported types; `PROJECTION_VERSION` 48 to 49 with its era comment |
| `bridge/relationships.ts` | S2 (new) | the projector: `relationshipBlockFor`, `castingChemistryRows`, `castingChemistryWarning`, `sharedPictureCount`, `CASTING_CHEMISTRY_WARNING`, `ChemistrySeats` |
| `bridge/people.ts` | S2 | `collaborators` on the profile type and on the built profile, beside `trust` |
| `bridge/casting.ts` | S3 | the greenlight quote carries the six rows and the warning; the screen-test and sign-contract quotes carry `null` for both |
| `bridge/runtime-checkpoint.ts` | S4 | `sha256:00c0075b…` registered as `projection-v48` |
| `bridge/schema/project-studio-bridge.schema.json` | S4 | generator output |
| `generated/unity/StudioBridgeDtos.Generated.cs` | S4 | generator output |
| `generated/unity/project-studio-bridge.contract-manifest.json` | S4 | generator output |

The running schema identity moves from `sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec`
to `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b`. `LIVE_SAVE_VERSION`
stays 31: no root, no validator, no migration, no save step.

## How each decision landed

**D1.** The DTO key is `collaborators`. The `$def` keeps the name `StudioRelationshipBlock`. The
landed leak law stays green and unamended on its own probe.

**D2.** Both `chemistry` and `chemistryWarning` hang on `StudioCastingQuoteSnapshot`. The board
project snapshot is untouched. A screen test proposes slates and a signing proposes no seating, so
both read `null` there rather than an empty array, which would claim a seating exists.

**D3.** The block carries a `line` and `rows`. No `scope` field.

**D4.** `relationshipBlockFor`, `castingChemistryRows` and `castingChemistryWarning` read
`state.relationships` through one guard, `chemistryOf`, which returns `pairChemistry`'s own no-edge
answer (`{ tier: null, sign: 0, reasons: [] }`) when the root is absent and never calls
`pairChemistry` on that state. `requireRelationshipsRoot` is untouched and nothing catches its
throw. Counts still publish, so the rootless display is ruling 3 (ii)'s counts-and-no-tiers form.
See the finding below on whether that branch is reachable.

## The disclosure rule as implemented

A row exists for exactly the counterparts on the viewer's roster at W, subject excluded, that the
person either holds an edge with or shares a credit with. Rows sort by `counterpartId`, so the block
never depends on root or Map order. A rival-internal pair reaches no DTO on any profile, including
its own participants'. When ties exist whose counterpart the player cannot see, the block's `line`
says so without a count and without an identity, and that sentence differs from the sentence a
person with nothing recorded receives.

## Findings for the parent

**1. D4 answer: no live projection path can deliver a rootless state. The branch is defensive only.**
The bridge holds exactly two producers of a `GameState`. `bridge/session.ts:297` and `:1371` call
`newGame(seed)`, which is `beginFounding(generateWorld(seed))` (`ui/src/engine/adapter.ts:609`), and
`src/core/worldgen.ts:787` mints `relationships: []` on every fresh world, so the founding-draft
route carries the root. Every load route runs `migrateToV31(importSave(json))`
(`bridge/session.ts:136`, `bridge/runtime-checkpoint.ts:860`), and `convertV30ToV31`
(`src/core/save.ts:8797`) adds `relationships: []`, so the legacy-v28 route arrives rooted as well.
The one unmigrated `importSave` in the bridge, `bridge/runtime-checkpoint.ts:464`, refuses anything
that is not already V31 at `:468`. The rootless shape is reachable only in a test, by projecting a
`validateSaveV30(...).state` directly, which the RED's family 8 does.

**2. The roster-at-W predicate is restated, not reused, and the brief and the boundary conflict
here.** `talentMarket.ts`'s `rosterAt` at `:794-801` is a module-private function. The brief asks
for "the SAME helper `talentMarket.ts` uses for D5, not a new one", while the parent's absolute
boundary forbids modifying any file under `src/core/`. Exporting it is a one-word change
(`function rosterAt` to `export function rosterAt` at `src/core/talentMarket.ts:794`), so I did not
make it. `bridge/relationships.ts` restates the predicate verbatim with a comment naming
`talentMarket.ts :794-801` as its authority and requiring any change there to be mirrored. The RED
does the same thing at its own `:174-181`. This is a duplication the parent may want to close later
in a slice that owns `src/core/`.

**3. `pairChemistry` is the only engine read used.** The brief named `currentTier` and
`tiersOnRoster` as well. `pairChemistry` already returns the tier `currentTier` computes, and
`tiersOnRoster` returns tiers without the counterpart identity the rows need, so neither adds
anything a row could carry. No behaviour differs.

**4. The tier vocabulary is restated in the schema module.** `bridge/schema/bridge-schema.ts`
imports no engine source (`TRUST_LABELS` at `:1754` is the precedent), so
`RELATIONSHIP_TIER_LABELS` restates the eight rungs of `RELATIONSHIP_TIERS`
(`src/core/relationships.ts:45`). A rung added there and not here fails loudly at the wire parse
rather than silently widening.

## Assertions that moved, reported and NOT repaired

Both belong to the wire owner's R-VERSION class, both are the outcome 687 (7) and 698-T1 predicted,
and neither touches the leak law.

| file:line | assertion | expected | actual |
|---|---|---|---|
| `tests/bridge-p14b5-relationships.test.ts:286` | `expect(PROJECTION_VERSION).toBe(48)` | 48 | 49 |
| `tests/bridge-p14b5-relationships.test.ts:339` | `expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([...EXPECTED_35_PRIOR_IDS, OUTGOING_47].sort())` | 36 ids | 37 ids |

`:292` in the same file carries the identical 36-id roster assertion and did not report, because
`:286` fails first inside the same case and stops it. It will report once `:286` moves.

Predicted from a source read, not run (not an authorized check for this task):
`tests/bridge-p14b4-runtime47-compatibility.test.ts:173` pins `EXPECTED_PRIOR_IDS`, the 36-member
literal at `:40-80`. It must take `sha256:00c0075b…` in sorted position and go 36 to 37.

## Commands actually run, with their output

**1. The B.6 RED.** `npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=verbose`

```
 Test Files  1 passed (1)
      Tests  24 passed (24)
   Duration  10.69s
```

All nine families green: family 0 (5), 1 (2), 2 (4), 3 (2), 4 (1), 5 (1), 6 (3), 7 (1), 8 (3), 9 (2).

**2. The landed B.5 and B.5-T suites.**
`npx vitest run tests/bridge-p14b5-relationships.test.ts tests/p14b5-relationships.test.ts tests/p14b5-t-failure-tuning.test.ts --reporter=basic`

```
 Test Files  1 failed | 2 passed (3)
      Tests  2 failed | 71 passed (73)
   Duration  45.11s
```

`tests/p14b5-relationships.test.ts` and `tests/p14b5-t-failure-tuning.test.ts` pass whole. The two
failures are the `bridge-p14b5-relationships.test.ts` version pins tabled above. Its leak-law case,
`the D5 settlement sentence reaches settlementReasons VERBATIM on the family-6 world, and no
closeness, edge or driver leaks onto any serialized DTO` at `:379`, which contains the `:404-408`
probe list, is GREEN and UNAMENDED.

**3. `npm run typecheck`** — EXIT 0, no diagnostics.

**4. `npm run typecheck:bridge`** — EXIT 0, no diagnostics.

**5. `npm run check:bridge-contract`** — EXIT 0.

```
verified bridge/schema/project-studio-bridge.schema.json
verified generated/unity/StudioBridgeDtos.Generated.cs
verified generated/unity/project-studio-bridge.contract-manifest.json
```

**6. `npm run check:bridge-contract:fixtures`** — EXIT 0.

```
verified generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs
```

`npm run generate:bridge-contract` ran ONCE, in S4, before those two checks.

## What this work does not establish

- The full core and the full UI are the parent's, on fixed source. I ran neither.
- `tests/bridge-p14b4-runtime47-compatibility.test.ts` was not run; its predicted movement above
  comes from reading the file, not from executing it.
- The natural route to the casting warning stays untested, exactly as 698-T1 recorded. No fixture in
  this repository releases a player picture, so no player-castable pair reaches a `sharedFailure`,
  and the negative branch is exercised only through the RED's staged S2 edge. I invented no fixture
  to close this.
- The in-flight production's `activeSlate` is a second lawful chemistry carrier and stays out of
  B.6 by D2.
- No drifted tier is exercised anywhere: record 679 measured that only one of four standard seeds
  drifts at all and none completes a return.
- Nothing here is a native playtest. The DTO carries the readout; no Unity screen reads it yet.
