# 1309-X2: parent scratch dry run of the r2 pin sweep, and rulings for r3

Scratch only. Tree: an archive of HEAD d8e90042 (`src`, `bridge`, `ui`, `generated`, `scripts`, configs, `tests/`
without fixture payloads), with `tests/fixtures` and `docs` linked read-only to the repository, then
[1309-pin-sweep-r2.patch](1309-stage2/1309-pin-sweep-r2.patch) (139 files, `git apply --check` clean at d8e90042)
and the 1308 neighbor change (`bridge-p14b6-relationship-read-models.test.ts`, one cancel before the release; applies
over the sweep at offset 3).

## Type gates

Root `tsc --noEmit`, `tsc -p tsconfig.bridge.json` and `tsc -p ui/tsconfig.json --noEmit`: 0 errors each. The three
Bridge errors of 1309-X are resolved.

## Targeted run

The 29 test files carrying a 1309-F row plus `p14p3-directing-promises` and the neighbor file. First run without
`docs` linked: 21 failed files, 49 failed tests ([extract](1309-X2-sweep-r2-targets-run-extract.txt)); several p14p4p5
loaders read evidence captures under `docs/`, a scratch artifact. Rerun of the 21 files with `docs` linked: 16 failed
files, 43 failed tests, 103 passed ([extract](1309-X2-sweep-r2-rerun-with-docs-extract.txt)). The neighbor file passes
(24 tests). Attribution against 1302-I by identity:

| Group | Tests | Cause |
| --- | --- | --- |
| Retained, out of 1309 scope | 20 | `p14b1-t4-regressions` 15 (C8 natural-search exhaustion); `p14b1-trust-chooser` test 6 (inherited from 1100); `p14p3-directing-promises` D14 (C20), D07 and D18 (C16b); `bridge-p14c3-runtime` R8 now reaches a 5000 ms timeout once its masking C3 literal is fixed |
| Save41 fallout, first seen here | 9 | `convertV40ToV41` adds `termination: 0` to every rival finance period; tests that deep-compare a migrated genuine state to the old state plus the known new roots now differ by exactly those zeros: `p14p4p5-casting-reservation` Q20 (`:176`), `-cross-owner` Q17 (`:195`), `-delayed-retirement` Q21 (`:150`), `-queued-project-outcome` Q23 (`:153`), `-scenery-capacity` Q24 (`:168`), `p14b3-rule-revision` (3 leaves, `:152`), `p14bf2-acting-discipline` (`:347`). The 1311 GREEN gate ran six files and could not see these. |
| Sweep rows still wrong | 14 | below |

## Rulings for r3

1. **Save41 fallout.** Each expected migrated state gains `termination: 0` on every rival period
   (`src/core/save.ts` `convertV40ToV41`), built from the old state, not a literal. The author also greps `tests/` for
   the same construction (a migrated or `migrateToLive` state compared with `toEqual` to an old state spread) and
   applies it wherever a V40-or-older genuine input is compared; every site gets a classification row.
2. **Live pins missed so far** (1309-C2's own discovered list, confirmed failing): `bridge-p14b3-promise-command.test.ts:509`
   (41), `bridge-p14p3-directing-promises.test.ts:98` (41) and `:568` (56), `bridge-p14p4p5-opportunities.test.ts:62`
   (41) and `:457` (56), and the D15/B55-1 leaves that fail behind the same memoized loaders. A pin that states the live
   save or projection moves to `LIVE_SAVE_VERSION`/`PROJECTION_VERSION` values 41/56; a pin that names a genuine
   historical capture keeps its number.
3. **`futureSave()` chain reversed for validation.** The chain 1309-D recommended and 1309-F adopted is refused by the
   law for live saves: `migrateToV39` refuses any envelope that holds a recorded first-take subject (measured at
   `p14p3-directing-promises.test.ts:322`, `:614` via `malformed()`, `:851`). `futureSave().validateSaveV39` validates
   the live envelope with the live validator (`validateSaveV41`), the name kept under the file's own "name stays, value
   tracks live" convention; `convertV39ToV38` keeps the chain (its callers are the retained C20 leaf).
4. **C18 row missed:** `bridge-p14b1-promises.test.ts:321`'s expected promise-history rows gain
   `qualifyingRole: 'cast'` (`src/core/talentMarket.ts:524`; the received row shows it).
5. **Item 9, trust-chooser derivation.** The spy fails at the first mismatching read because the test derives `proven`
   from `publicPreferredOpportunity(...) === 'anyCastAppearance'`, which returns `'directingOpportunity'` for every
   director (`src/core/talentMarket.ts:797-800`), while `authorRivalPromise` uses `isProven` (`:756-759`:
   identity disciplines, or age ≥ 30). Measured case: the director `person-studio-aca408ec-r01-1`, issuer r02, week
   208, reads `DIRECTING_COUNT` then `APPEARANCE_COUNT` where the test expected the flexible read second. The test
   restates `isProven` with `careerIdentity` (`src/core/talentSummary.ts:542`), as `p14b4-cast-class-policy`'s
   `realProven` already does.
6. **Item 9, witness coverage.** Census [1309-Q2](1309-Q2-rival-authoring-census.txt) of every rival authoring on the
   default chain over 220 weeks: 72 authorings, every subject proven under `isProven` (actors 36, craft 12, directors
   12, writers 12); first reads and choices follow the law in every row. No unproven subject is authored in that
   window, so the unproven witnesses (flexible P2, unproven "neither", P1 fallback) cannot occur on this chain. This is
   not a production defect. The leaves keep every per-read law check; each required-witness list becomes the witnesses
   the measured stream contains on the default seed (`p14b4-cast-class-policy`: `DIRECTING_COUNT`, `provenP1` and, if
   labelled, the proven zero-attachment case; trust-chooser test 7: the proven branches); the scan bound stays 220.
   Unproven coverage stays with any existing other-seed scan in the same files that the author can show carries it by
   source; if none does, the header records "unproven rival authoring has no natural witness on the chains these files
   scan" and the handoff carries it as an open coverage finding.

## Also recorded

1309-C2 built its patch in a detached `git worktree` under the scratchpad and removed it afterwards; the repository's
own tree was not written. It is disclosed here as a process deviation from the no-extra-worktree practice, without
effect on the patch.
