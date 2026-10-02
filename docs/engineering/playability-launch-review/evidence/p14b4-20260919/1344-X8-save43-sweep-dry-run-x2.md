# 1344-X8: parent dry run x2 of the merged Save43 sweep (r1), with attribution

## Run identity

- **Tree.** Scratch merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` at a318722. Its base 6c54d5e is
  an archive of repo 3a606df4 with links to `docs`, `node_modules`, `art`, `tools` and `tests/fixtures`. On top of it
  sit the seven group patches of 1344-C5 (helpers, g1-g6) and two parent commits:
  - f8c48ec: the 24 `saveApi('validateSaveV42')` callers follow the helper's renamed live key;
  - becafce: the eight UI sites of 1344-M2.
- **Runner.** `run-dry-run.sh x2`, detached: three type gates, the 433-file core list (1344-M's 429 plus the four
  P15B and P15C files) with `.venv` on PATH, then the UI project. Not a recorded run.
- **Durations.** The Mac slept twice during the core stage: from 15:11 EDT on 2026-09-30, and from 08:34 to 15:51 CDT
  on 2026-10-01. Durations are meaningless. A timeout row is environment until re-run alone.
- **Raw output** (kept in scratch): `x2-core.txt` (23,438,548 bytes, sha256 3db3953dd46ff97a…) and `x2-ui.txt` (184,274
  bytes, sha256 20e2fbe63f6cdc58…).
- **Evidence here:**
  - extract [1344-X8-core-extract.txt](1344-X8-core-extract.txt);
  - parser outputs [core](1344-X8-core-failures.json) and [UI](1344-X8-ui-failures.json);
  - comparisons [core vs 1338](1344-X8-core-vs1338.json) and [UI vs 1343](1344-X8-ui-vs1343.json);
  - [type gates](1344-X8-tsc.txt) and [run log](1344-X8-x2.meta.txt).

## Results

| Stage | Result |
|---|---|
| Type gates (root, UI, Bridge) | exit 0, 0 errors (1352-L and 1353-L recorded 19, 2, 2) |
| Core, 433 files | **123 failed**, 4,822 passed, 3 skipped, 11 todo (4,959); 40 files failed. 1344-M had 848 failed |
| UI, 204 files | **3 failed**, 2,689 passed, 5 skipped (2,697); 1 file failed |

## Attribution

The archived parsers ran unchanged: [1321-I-attribution.py](1321-I-attribution.py) for core,
[1317-I-attribution.py](1317-I-attribution.py) for UI. [1344-I-compare.py](1344-I-compare.py) did the comparisons.

**Core vs 1338: SAME 67, CHANGED 11, NEW 45, GONE 1.** SAME plus CHANGED is 78, which is 1338's 79 minus the GONE
exporter row. 1344-N expects exactly that.

- **CHANGED 11.**
  - 4 S10 rows: family 12 ×3 and seating seed-b. 1344-F4 ruling 1 attributes them and the probes test the attribution.
  - The C20 row `p14c3-save-v38`: its retained message embeds the live version, now 43.
  - 6 C17 ENOENT rows that carry the scratch path instead of the repo path. They are scratch artifacts, as in 1320-X.
- **NEW 45.**
  - 9 environment or scratch rows: `bridge-supervisor` "Fake Unity" ×7 (the 1320-X scratch artifact), `hygiene:45`
    (scratch links) and a 20 s timeout in `bridge-p13b-s3-save-as` from the sleep.
    **Erratum ([1344-X9](1344-X9-save43-sweep-dry-run-x3.md)):** `hygiene:45` is not a scratch row. x2-core.txt
    names its two offenders: comments at `tests/p14d1-rival-shelving-natural.test.ts:120` (from 9260baf4) and
    `tests/p15b1-corporate-condition.test.ts:742` (from 5bb8d559). Both files sit in the sweep base and at repo HEAD,
    so the row fails in the repo too. Separately, `1344-X8-core-extract.txt` lacks the first failure block
    (`bridge-p13-campaign-isolation`, the 60 s timeout). The parser output `1344-X8-core-failures.json` has it, and the
    counts above come from the parser. The four `p14c3-queued-writing-proof` rows listed below as Q1 are Q1 ×2 (:56)
    and Q3 ×2 (:154).
  - 7 rows already ruled in 1344-F4: ORACLE `p14b1-trust-chooser:683` ×2 and `p14b4-cast-class-policy:485`, row 5
    `p14b5-relationships:596`, and row 6 `p14b5-relationships:372` ×3.
  - 9 S9 rows: `migrateToV42` now refuses first, through the V43 to V42 guard. They are in `p14b5-relationships:1136`,
    `p14c3-cohort-transition:281`, `p14c3-dual-extensions:172` ×2, `p14c3-offmenu-extensions:229` ×2 and
    `p14c3-profession-history:112` ×3.
  - 8 S5 rows: the migrated comparison now carries the empty `screenplayShelving` on each rival business. They are in
    `bridge-p14b2-checkpoint:81`, `bridge-p14p3-directing-promises:126` ×2 and `:361`,
    `p14c2rm-writer-continuation:257`, `p14p4p5-cross-owner:94`, `p14p4p5-opportunities:360` and
    `p14p3-directing-promises:396`.
  - 4 S1, S2 and S3 leftovers: `c2a-m2-sets-save:230,286`, `contracts/v14-boundary-guards:320` (S3) and
    `p14p4p5-delayed-retirement:98`.
  - 4 `p14c3-queued-writing-proof` Q1 rows: the frozen V37 chain refuses a live envelope (g5's flagged anomaly, now
    measured).
  - 4 promise rows a helper masked until the sweep: `p14c2c-rival-promises:25` ×3 and `p14c3-admission-boundaries:141`.
    The rival promise now reads SATISFIED, progress 1, where 1338 read null and 0. These are S10-style; their
    attribution is declared before any value moves.
- **GONE 1.** The exporter row `world-first-scenery-load-in-provenance`, as 1344-N expects.

**UI vs 1343: CHANGED 3, GONE 7, NEW 0.**
- The 3 changed rows are the numpy-missing `authored-rgba-export` tool-contract rows 6-8, from the 1345-E environment.
- The 7 gone rows are the Pillow rows, which pass under the 1345-E `.venv`.
- 1344-M2's 11 Save43 pins and its four intermittent rows do not fail.

## Next

- Revision r2 in a shared clone:
  - r2a: the S9 rows and the row 5 strip;
  - r2b: the S5 rows, the S1-S3 leftovers and the queued-writing rows;
  - r2c: the ORACLE rows;
  - r2d: declarations for the four promise rows.
- The S10 probes run first, on a318722 unchanged.
- Then r2 is applied to the merge tree, and dry run x3 (1344-X9) runs.
