# 1309-X3: full scratch core run of the r3 pin sweep, and the rulings for r4

Scratch only. Tree: an archive of HEAD c2f344d3 with `tests/fixtures` and `docs` linked read-only, the r3 patch
([1309-stage3](1309-stage3/1309-pin-sweep-r3.patch), 140 files) and the 1308 neighbor change.

## Type gates

Root `tsc`: 5 errors; Bridge `tsc`: 4 errors; UI: 0. All nine are one defect: the ruling-1 helper
`withRivalTermination(state: GameState): GameState` receives `GameStateV38`/`GameStateV39` states and fails under
`exactOptionalPropertyTypes` (`p14p4p5-casting-reservation:187`, `-cross-owner:84`, `-delayed-retirement:161`,
`-queued-project-outcome:164`, `-scenery-capacity:179`, `bridge-p14p3-directing-promises:110,345`,
`bridge-p14p4p5-opportunities:74,483`).

## Runs

- Targeted (24 files): 38 failed, 176 passed ([extract](1309-X3-sweep-r3-targets-extract.txt)).
- Full core, the 417-file allowlist with `--project core` (the 1302 command): **60 failed files, 272 failed tests,
  4375 passed, 2 skipped, 11 todo**, 79 minutes ([extract](1309-X3-fullcore-extract.txt), every failing identity with
  its 1302 cluster in [rows](1309-X3-fullcore-rows.json)). The 1302 baseline was 96 files and 498 tests.

By 1302 identity: C2 74, C8 42, C6 25, C7 23, NEW 19, UNRESOLVED 14, C1 11, RETAINED 9 (+1 benign), C20 9, C3 8, C15 7,
C17 6, C16 5, C5 5, C9 4, C4 4, C12 2, C14 2, C16b 2. Out of 1309 scope and retained with their 1302 causes: C6, C7, C8,
C15, C16, C16b, C17, C20, the RETAINED rows, C12 (the parent re-measures generator pins after the contract settles),
the masked `c2a-m2-sets-save` and `p14c3-canonical-rival-history` leaves that now reach their documented 1100/1119-A
causes, `bridge-p14c3-runtime` R8 (5000 ms timeout once unmasked), and the UNRESOLVED rows not named below. Scratch
artifacts: `world-first-scenery-load-in-provenance` (ENOENT on `art/`, not archived) and `bridge-supervisor` (7, fake
Unity child processes under the scratch tree); the recorded gate settles both.

## Rulings for r4 (each a measured cause)

1. **Live validator selection, completed.** 74 C2 and 5 C5 rows fail with "validateSaveV38: expected version 38" in
   `p14c3-admission-boundaries` (`:158`), `-profession-episodes`, `-save-v38`, `-transition-evidence`,
   `-profession-history` (`:269`) and `-queued-writing-proof` (`:54`, via the frozen chain). The helper literal the
   first sweep fixed was masking a live `validateSaveV38` selection. The author greps `tests/` for every call of
   `validateSaveV38(`, `validateSaveV39(` and `validateSaveV40(`, classifies each site live or historical with a row,
   and moves every live site to `validateSaveV41`. `p14c2b-save-v36` builds its baseline with
   `validateSaveV36(liveEnvelopeV36(state))`, which downgrades a live state and is refused by the V39 guard (ruling 2);
   its tamper cases that expect a throw now pass for that wrong reason. The baseline and every tamper case validate the
   live envelope with the live validator.
2. **The first downgrade guard for a live save.** Any live save that holds a recorded first-take subject meets
   `convertV40ToV39` first: "migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take
   subject". 1309-C item 6 called the C14 regexes unchanged; the run refutes that. Expected messages name this measured
   first guard at `p06a-w1-release-authority:447`, `p13b-s3-save-v23` (the three migrators), `p14b5-relationships:1071`,
   `p14c3-cohort-transition:281`, `p14c3-dual-extensions:172` and `p14c3-offmenu-extensions`. Where a leaf's title names an
   older guard (the V33 aging guard, the V38 profession guard), its comment records that the V39 subject guard masks it for
   any save with a recorded take and names the test that still covers that guard on its own era's genuine input, or
   records the reduction.
3. **Frozen builders fed a live state.** `makeSaveV1..V38` on a live state now stop at the V25 Hollywood exact-key check,
   on the Save41 rival `termination` movement ("Hollywood save: exact keys required: …"), before the cause each leaf
   names (`p14p3-directing-promises` D13 `:347` and D12, `p12-starting-world:49`). The builders receive the lawful V40
   projection (`convertV41ToV40(makeSave(state)).state`). If an older-era root still masks the named cause, the leaf
   asserts the measured first refusal and records the mask.
4. **Save41 fallout in migration comparisons, continued.** Add the zero `termination` movements (built from the old
   state) at `bridge-p14b4-runtime47-compatibility:234`, `p14c2rm-writer-continuation`,
   `bridge-p14c2s-scientist-runtime:106`, `p14p4p5-opportunities` Q04 (`:326`) and any site the ruling-1 grep of r3 missed.
   Fix `withRivalTermination`'s signature so all three `tsc` projects are clean (generic over the state it receives).
5. **Live pins still missed.** Projection 56 at `bridge-p13b-s1b-seats:102`, `bridge-p13b-s2-labs`, `bridge-p13b-s3-plans`
   and `bridge.test` (received 56). `bridge-p14b5-relationships:354` pins the live `SCHEMA_ID` to projection 53's
   identity; it states the current identity
   (`sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1`, the value received).
   `bridge-p14p4p5-opportunities:474` counts the older prior ids: 43 with the registered outgoing55, and its sha pin is
   recomputed from that literal list, never from a run.
6. **`qualifyingRole` rows still missed:** `bridge-p14b2-trust:225` and `:245` gain `qualifyingRole: 'cast'`.
7. **`p14p4p5-opportunities` FutureAPI semantics.** Q03 (`:286`): the live-to-one-below conversion now reaches V40, which
   holds opportunity material, so it no longer refuses; the leaf's purpose is the first downgrade that cannot hold the
   material, `convertV40ToV39(convertV41ToV40(valid))`, expecting the V39 refusal. Q09 (`:951`): production still words
   this refusal "validateSaveV40: opportunity waiver …" (`validateOpportunityWaiverLinks` is era-named), so the regex
   keeps V40.
8. **Wire grammar since P4/P5.** `bridge-p14b4-cast-class:203` asserts a count-only draft is wire-legal for
   `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT`; the wire schema (`bridge/schema/bridge-schema.ts:1842-1856`)
   requires `seatClass` and `genre`/`scriptProjectId` for those families. The leaf asserts wire legality for the families
   the schema admits count-only and refusal for the two opportunity families, citing the schema.
9. **Trust-chooser test 7b (`:822`).** The chronologically first actor's first read is FRAGILE; the census has 24 of 36
   actor authorings starting FRAGILE. Per 1309-F ruling 8 the "first actor positive" witness is located by scan: the first
   actor authoring whose first read is REASONABLY_ACHIEVABLE. The per-read law checks stay.
10. **Cast-class-policy witnesses (`:642`).** The measured set across the default and seed-b scans is `DIRECTING_COUNT`,
    `neither`, `provenP1`; `P1fallback` and `flexibleP2` do not occur. The required list is the measured set; the two
    unproven witnesses are the open coverage finding ruling 6 of 1309-X2 names.

## Process

1309-C3 validated its patch with a temporary index file and no worktree, as asked. The next revision (r4) goes to one
independent review (1309-D2) after its dry run.
