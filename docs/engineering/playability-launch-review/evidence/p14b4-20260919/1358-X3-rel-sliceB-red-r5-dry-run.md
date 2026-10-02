# 1358-X3: parent dry run of the slice B RED r5 at HEAD, with the producer capture in place

[1358-F4](1358-F4-parent-rulings-on-1358-D.md) Next 2 ordered this run on r5
([1358-C5](1358-C5-rel-sliceB-red-r5-handback.md)). **The RED equals 1358-C5's declaration:** 86 failed and 59
passed of 145, with each file's split as declared. 96 of the 97 classified leaves match their declared outcome and
first message exactly, and the 97th differs only in how Vitest prints the same array. The root type gate gives
exactly the 17 declared errors at r5's positions.

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1358-x3/run-1358-X3.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK`, on 2026-10-02 from 00:15:34 to 00:19:27 CDT, Node v20.20.2.
- **Tree.** An archive of HEAD 85ffc6bc, whose `src` equals b0809602's.
  - The staged [1358-rel-sliceB-red-r5.patch](1358-stage/1358-rel-sliceB-red-r5.patch) (sha256 3ca4e3bc…) went in
    with `--include='tests/*'`: six test files, 1,872 insertions and 1 deletion.
  - `git status` read empty afterwards.
- **The capture in place.** The GENUINE leaves read `tests/fixtures/p14/genuine-v43-pre-romance/`, and the mint comes
  before the recorded RED (1358-F4 item 5). The tree's `tests/fixtures` is therefore a real directory:
  - links to the repository's entries, except `p14`;
  - `p14` itself a real directory of links to the repository's `p14` entries;
  - a real `genuine-v43-pre-romance/` holding the dry-run capture of
    [1358-X2](1358-X2-rel-sliceB-red-r4-dry-run.md), copied.

  Nothing was written under a link.
- **Producer.** r5 carries r4's producer hunk against HEAD's r3 copy, so the script ran the producer again in its own
  tree. It exited 0. Its output and its capture (gzip sha256 a731677f…) are byte-identical to X2's.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1358-x3/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x3-red-sliceB.txt` | 113,925 | 60f940953afb6df3 |
| `x3-red-sliceB.json` | 185,767 | 1cec9ed79a2bcd79 |
| `x3-red-sliceB-tsc.txt` | 2,659 | b1a54de50c79cfb8 |
| `x3.log` | 981 | 326d84d749de1012 |

## The RED

| File | X3 | 1358-C5 |
|---|---|---|
| `p14b10-romance` | 32 failed, 5 passed (37) | 32, 5 |
| `bridge-p14b10-relationship-labels` | 11 failed, 3 passed (14) | 11, 3 |
| `p14b10-competitions-log` | 5 failed, 2 passed (7) | 5, 2 |
| `p14b10-labels` | 12 failed (12) | 12, 0 |
| `p14b10-save-v44` | 22 failed (22) | 22, 0 |
| `p14b5-relationships` | 4 failed, 49 passed (53) | 4, 49: the three 1344-F6 row 6 exceptions and the new Partners-at-Friends leaf |
| Total | **86 failed, 59 passed (145)**, 65.48 s | 86, 59 |

- **Checker.** `check-x3.py` (in the scratch folder) compared every classified leaf, matched by file and full name,
  with the classification:
  - 97 rows;
  - 0 missing;
  - 0 outcome mismatches;
  - 1 first-message difference.
- **The one difference.** The re-formation leaf ("a re-formation (after an ended bond) appends…"):
  - declared: `expected [ Array(1) ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]`;
  - observed: `expected [ { formedWeek: 100, endedWeek: 300 } ] to deeply equal [ { formedWeek: 100, …(1) }, …(1) ]`.

  It is the same assertion on the same values: Vitest printed the one-element array in full.
- **The GENUINE leaves.** With the capture in place, they pass their premises and fail on the missing Save44 law, as
  F4 item 5 intends.

## Type gates

- **Root: exit 2, with exactly the 17 errors 1358-C5 declares.**
  - TS2305 ×10: labels (47,10) and (48,10); romance (91,3), (91,24), (91,48), (91,77), (92,3), (92,27), (93,47) and
    (93,81).
  - TS2353 ×5: romance (618,90), (636,90), (655,92), (656,91) and (667,126).
  - TS2578 ×2: romance (676,7) and (678,7).
- **UI and Bridge:** each exits 0.

## Next

- r6 changes two leaves (1358-C5's uncertain items):
  - the week staged at save-v44 :273;
  - the own-picture Mentor variant, restaged as a real in-production picture.
- A short run measures r6's changed leaves, then the confirmation review 1358-D2 checks r6 against 1358-F4.
