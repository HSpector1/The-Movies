# 1344-X9: parent dry run x3 of the merged Save43 sweep (r1 plus r2), with attribution

## Run identity

- **Tree.** Scratch merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` at 6935ea5: x2's a318722
  ([1344-X8](1344-X8-save43-sweep-dry-run-x2.md)) plus three r2 commits:
  - r2a 5c7f499: S9 and row 5 (12 classification rows);
  - r2b 1c2f9e8: S5 and the S1-S3 leftovers (28 rows);
  - r2c 6935ea5: ORACLE (2 rows).

  Base 6c54d5e is an archive of repo 3a606df4. Repo HEAD 32640b1e has no `src`, `tests` or `generated` drift since
  3a606df4.
- **Runner.** `run-dry-run.sh x3`, detached: three type gates, the 433-file core list with `.venv` on PATH, then the
  UI project. Not a recorded run. Started 17:19:35 CDT; type gates done 17:22:03; core exit 1 at 18:47:03; UI
  exit 1 at 19:01:00.
- **Durations are real.** `pmset -g log` shows no sleep after 15:51 CDT, and `caffeinate -is` held the run.
- **Dirty file.** The one untracked entry is `dist/`, which a core test writes (`dist/studio`, rewritten at 17:38).
- **Raw output** (kept in scratch): `x3-core.txt` (14,789,447 bytes, sha256 1cab51ca445eef22…) and
  `x3-ui.txt` (174,412 bytes, sha256 fd62e241741340f2…).
- **Evidence here:**
  - extract [1344-X9-core-extract.txt](1344-X9-core-extract.txt), cut by [1344-X9-extract.py](1344-X9-extract.py):
    the "Failed Tests" section, blank lines dropped, each failure block cut to 16 lines of at most 240 characters,
    then the run summary;
  - parser outputs [core](1344-X9-core-failures.json) and [UI](1344-X9-ui-failures.json);
  - comparisons [core vs 1338](1344-X9-core-vs1338.json) and [UI vs 1343](1344-X9-ui-vs1343.json);
  - [type gates](1344-X9-tsc.txt) and [run log](1344-X9-x3.meta.txt).

## Results

| Stage | Result |
|---|---|
| Type gates (root, UI, Bridge) | exit 0, 0 errors |
| Core, 433 files | **93 failed**, 4,852 passed, 3 skipped, 11 todo (4,959); 25 files failed. x2 had 123 |
| UI | **3 failed**, 2,689 passed, 5 skipped (2,697); 1 file failed. x2 had 3 |

## Attribution

The archived parsers ran unchanged: [1321-I-attribution.py](1321-I-attribution.py) for core and
[1317-I-attribution.py](1317-I-attribution.py) for UI. [1344-I-compare.py](1344-I-compare.py) did the comparisons.

**Core vs 1338: SAME 67, CHANGED 11, NEW 15, GONE 1.** SAME plus CHANGED is 78: 1338's 79 minus the GONE exporter row
`world-first-scenery-load-in-provenance`, as 1344-N expects. Against x2, the SAME and CHANGED sets are identical, no
retained row's primary moved, and every NEW identity was already NEW in x2.

- **CHANGED 11**, the same rows as X8:
  - 4 S10 rows (family 12 ×3, seating seed-b). [1344-X10](1344-X10-s10-probe-results.md) attributes them to shelving,
    and 1344-F4 ruling 1 keeps them failing as retained rows.
  - The C20 row `p14c3-save-v38`: its retained message embeds the live version, now 43.
  - 6 C17 ENOENT rows carrying the scratch path. They are scratch artifacts, as in 1320-X.
- **NEW 15.**
  - 7 `bridge-supervisor` "Fake Unity" rows: the scratch artifact of 1320-X (1320-X:12; the file passes in the repo).
  - 1 `hygiene:45` row. It is real; see the correction below.
  - 3 row 6 leaves in `p14b5-relationships` (family 2 ×2, family 5 ×1). Their frame moved from :372 to :397 because
    r2a added comment lines above it. X10 found a PREMISE_CONFLICT. The re-witness probe r3 is queued (1344-F5 A3).
  - 4 promise rows: `p14c2c-rival-promises:25` R1-R3 and `p14c3-admission-boundaries:141` N10. Their declarations
    predict a premise conflict ([1344-D9](1344-D9-promise-rows-r3-confirmation.md) confirmed the probe). The probe
    is queued.
- **Cleared since x2: 30 rows.**
  - ORACLE ×3: `p14b1-trust-chooser:683` ×2 and `p14b4-cast-class-policy:485`.
  - Row 5, `p14b5-relationships:596`. The stripped digest equals the pinned 9702aa68…, so the S7 strip holds, and so
    does row 5's attribution.
  - S9 ×9, S5 ×8, and the four S1-S3 leftovers.
  - The four `p14c3-queued-writing-proof` Q1 rows.
  - x2's 20 s timeout in `bridge-p13b-s3-save-as`, from the sleep.
- **The r2 deferrals, measured.**
  - `p14b4-cast-class-policy` :627 and :644, the pinned witness set: 7/7 pass, so the set holds under Save43.
  - `p14b1-trust-chooser` :768 and :809: both pass. The file's one failure is the retained 1338 row "opportunity
    changes the winner…" (SAME).
  - `p14b5-relationships` :1149, :1162 and :1180 (S9, derived): pass.
  - `p14c3-transitions` :169 and :198: 35/35 pass. Their guard order stays unmeasured, as r2a declared, and no
    identity depends on it.

**UI vs 1343: CHANGED 3, GONE 7, NEW 0**, the same three sets as x2.
- The 3 changed rows are the numpy-missing `authored-rgba-export` tool-contract rows 6-8, from the 1345-E environment.
- The 7 gone rows are the Pillow rows, which pass under the 1345-E `.venv`.

## Correction to 1344-X8

X8 filed `hygiene:45` as a scratch-link row. That was wrong. x2-core.txt names its two offenders, and x3 names the
same two:
- a comment at `tests/p14d1-rival-shelving-natural.test.ts:120` (from 9260baf4, the shelving RED r4);
- a comment at `tests/p15b1-corporate-condition.test.ts:742` (from 5bb8d559, the P15B Wave 1 RED r3).

Each holds the literal string the hygiene test bans. Both files sit in the sweep base and at repo HEAD, so the row
fails in the repo as well. The broad gates pending since 1344's production, 1352-L and 1353-L would have caught it.
X8 now carries an erratum.

**Fix.** A parent commit in the merge tree rewords both comments. It changes comment text only
(`/Users/zacheryspector/studio-scratch/1344-merge/hygiene-fix.sh`). It lands after the queue's two merge-tree probes
finish, rides in the sweep patch with class HYGIENE, and the recorded core gate runs `hygiene.test.ts` on it.

## Against the 1344-N success line (1344-N:80-82)

- Type gates clean: **yes**.
- Core identities equal 1338's 79 minus the exporter row, with the four S10 rows attributed: **yes**. The C20 primary
  differs only by the live version, and the C17 primaries only by the scratch path.
- UI equal to 1343's 10, environment-adjusted: **yes**. The `.venv` clears the 7 Pillow rows of 1343's 10. The 3
  numpy rows wait on the Owner (1345-E).
- No new identity: **not yet**. The 7 "Fake Unity" rows are scratch artifacts, and the hygiene fix removes 1 row. The
  other 7 (row 6 ×3, promise rows ×4) meet the line only as declared exceptions for the Owner, if the queued probes
  confirm them.

## Next

- Read the queue results. Record the row 6 and promise-row probes as 1344-X11. If neither finds a lawful re-witness,
  1344-F6 declares the 7 rows exceptions.
- Apply the hygiene commit, then stage the sweep for 1344-D4. No x4 runs: after x3, the only change is comment text,
  and the recorded gates measure the final tree.
