# 1309-A: the combined Save41 / projection56 pin sweep

Parent plan, source-only. The R2/R3 increment (1304-F, 1305-F, 1308) moves `LIVE_SAVE_VERSION` 40→41 and
`PROJECTION_VERSION` 55→56 and adds one prior schema id. 1304-F adopted one reviewed sweep after it, reusing the
1301 rows and adding every row the broad gates attributed as stale test infrastructure. This plan names that sweep.
It lands after the R2/R3 GREEN gate and before one broad core and UI rerun, attributed by identity against 1302-I
and 1303-I.

## In scope (test and test-helper edits only; no production change)

1. **1301 rows.** Every row 1301-E applied (74 files, 188 lines): live save pin 40→41, live projection pin 55→56,
   "versions 1 through 40"→"1 through 41", first unknown future version 41→42. Rows 1301 kept as historical stay kept.
2. **Helper literals missed by 1301** (1302-I C2–C5, 1303-I C8): `tests/helpers/p14c3-fixtures.ts:126`,
   `p14c3-genuine-evidence-fixtures.ts:17`, `p14c3-second-episode-fixtures.ts:27`,
   `p14c3-history-boundary-fixtures.ts:26` assert the live writer's version; they pin 41.
3. **Validator selection** (1302-I C1, 33 files): a test that feeds `makeSave` output, or a live state, to a
   numbered validator named for an earlier live version (`validateSaveV38`/`V39`/`V40`) calls the live validator
   `validateSaveV41`. A call on a genuinely historical envelope keeps its numbered validator.
4. **Projection and live-version pin forms missed by 1301** (C9, C10): `snapshotVersion`/`INCOMING_PROJECTION`
   literals → 56; namespaced `save.LIVE_SAVE_VERSION` pins (including `tests/p13b-s7-announcements.test.ts:87`,
   1305-D change 3) → 41.
5. **Hand-maintained prior-schema rosters** (C13, 5 files): add the missing prior ids from
   `bridge/runtime-checkpoint.ts` (outgoing53, outgoing54 and the new outgoing55 `sha256:2c377b6f…`), keeping each
   literal's own order convention; any length or hash pin is recomputed from those literals, never from a run.
6. **Downgrade-guard regexes** (C14): each expected message names the first guard that refuses that fixture on the
   Save41 chain (`convertV41ToV40` → `convertV40ToV39` → …), derived from the fixture's own content.
7. **New promise-history field** (C18): expected rows gain `qualifyingRole` with the value the P3 law assigns
   (`src/core/talentMarket.ts:493,513`).
8. **Stale refusal premise** (1302-J 3c): `bridge-p14b1-promises.test.ts:400` and `bridge-p14b3-promise-command.test.ts:180`
   chose `DIRECTING_COUNT` as the always-refused family; since P3 it is offerable with `directorCount`. Each leaf
   uses a family still refused on that path (`src/core/promises.ts:236-239`), or is re-titled to its current law.
9. **Widened rival authoring** (1302-K): `tests/p14b1-trust-chooser.test.ts` test 7 spy sequence and
   `tests/p14b4-cast-class-policy.test.ts` natural rival policy expected candidates follow the current
   `authorRivalPromise` law (`src/core/talentMarket.ts` docstring: directing-first people try `DIRECTING_COUNT` then
   the cast list, others the cast list then `DIRECTING_COUNT`, then up to two `SPECIFIC_PROJECT` and two
   `PREFERRED_GENRE_OPPORTUNITY` candidates in the stated order; the first REASONABLY_ACHIEVABLE read attaches).
   These updated leaves are the RED witness for that law: if they fail after the sweep, the failure is a defect.
10. **Deliberate historical pin** (C11, `tests/p14b8-waiver-surface-oracle.test.ts:177`): its claim is "B.8 moved no
    save law". Re-anchor it to a fact B.8's own era fixes, or state the plan-amendment ruling it records; never
    re-pin it to the live number.

## Out of scope (next increment, after the broad rerun re-attributes them)

C6 `v13TwinOf`, C7 `firstTakeSubjects` guard, C8 natural-search exhaustion, C15 frozen-chain boundaries, C16/C16b
fixture premises, C17 missing generated evidence, C20 migration purity, C12 generator hash pins (re-measured by the
parent from the regenerated contract after R2/R3), the retained UI clusters, and the 20 unresolved rows.

## Ownership and gates

Test-author stages one patch against the Save41 tree target plus a classification JSON (one row per edited line:
path, line, cluster, old text, new text, source of the new value). Contract-auditor reviews (1309-D). Parent applies
(1309-E) after the R2/R3 GREEN gate, then runs the broad core and UI gates. No production change, no Owner data,
no execution by the author.
