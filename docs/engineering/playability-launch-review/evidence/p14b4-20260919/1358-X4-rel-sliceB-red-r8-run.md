# 1358-X4: parent run of the slice B RED r8 at HEAD, with the producer capture in place

1358-F5, 1358-F6 and 1358-F8 ordered a short run before the RED commit. It measures r8
([1358-C8](1358-C8-rel-sliceB-red-r8-handback.md)), which is r6 plus r7's text and r8's three save-v44 leaves and
anchor assertion. **The run equals r8's declarations:**
- 89 failed and 59 passed of 148;
- all 100 classified leaves match their outcome and first message;
- the root type gate gives the 17 declared errors at r8's positions.

1358-D2's conditions for its CONFIRMED verdict hold leaf by leaf.

## How it ran

- **Script.** [run-1358-X3b.sh](1358-stage/x4/run-1358-X3b.sh), alone in the heavy lane under `HEAVY-LANE-LOCK`, on
  2026-10-02 from 02:29:07 to 02:31:52 CDT, Node v20.20.2 ([x3b.lane.meta](1358-stage/x4/x3b.lane.meta),
  [x3b.log.txt](1358-stage/x4/x3b.log.txt)).
- **Tree.** An archive of HEAD e1a793fd, whose `src` and `tests` equal bc2f6007's.
  - The staged [1358-rel-sliceB-red-r8.patch](1358-stage/1358-rel-sliceB-red-r8.patch) (sha256 ef7c456a…, checked by
    the script) went in with `--include='tests/*'`: six test files, 1,929 insertions and 1 deletion.
  - The log line and tree commit still read "r6 tests applied", text the script kept from r6. The hash check names
    r8.
- **The capture in place.** It is laid out as in [1358-X3](1358-X3-rel-sliceB-red-r5-dry-run.md):
  - `tests/fixtures` is a real directory of links to the repository's entries;
  - `p14` is a real directory of links;
  - a real `genuine-v43-pre-romance/` holds 1358-X2's dry-run capture, copied.

  Nothing was written under a link, and the tree read clean afterwards. The parent deleted it after the run.
- **Producer.** Not run. r8's producer hunk is byte-identical to r5's and r6's (the parent compared the patches file
  by file), and 1358-X3 showed that hunk reproduces X2's capture byte for byte.

## The RED

| File | X4 | Declared (1358-C8) |
|---|---|---|
| `p14b10-romance` | 32 failed, 5 passed | 32, 5 |
| `bridge-p14b10-relationship-labels` | 11 failed, 3 passed | 11, 3 |
| `p14b10-competitions-log` | 5 failed, 2 passed | 5, 2 |
| `p14b10-labels` | 12 failed | 12, 0 |
| `p14b10-save-v44` | 25 failed | 25, 0 |
| `p14b5-relationships` | 4 failed, 49 passed | 4, 49 |
| Total | **89 failed, 59 passed (148)**, 54.43 s | 89, 59 |

- **Checker.** `check-x3.py` ([copy](1358-stage/x4/check-x3.py)) on the r8 classification reports 100 rows: 100 ok,
  0 missing, 0 status mismatches, 0 message mismatches ([x3b-check.txt](1358-stage/x4/x3b-check.txt)).
- **1358-D2's five leaves:**

| Leaf | Outcome and first line | D2's condition |
|---|---|---|
| competitions-log P3a/P3b | `TypeError: Cannot read properties of undefined (reading 'filter')`, thrown at :216 | met |
| save-v44 "rejects bonds out of order" | `AssertionError: expected [Function] to throw error matching /romance\|bond\|order/i but got 'mods(...).validateSaveV44 is…'` | met |
| Bridge, three released pictures (runs the spied build) | `TypeError: undefined is not iterable …` at :323, in 39,866 ms | met: under X3's 49,182 ms and the 240,000 ms budget, with no budget, clone or heap failure |
| Bridge, rival picture not yet public | `TypeError: Cannot read properties of undefined (reading 'some')` at :348 | met |
| Bridge, own picture in production | `TypeError: Cannot read properties of undefined (reading 'find')` at :371 | met: the leaf reached :371, so the capture premise and every route premise held |

- **r8's new rows.** The three new save-v44 leaves fail on the missing `validateSaveV44`, as declared. The success
  leaf carrying the anchor assertion fails at its first line, as declared.
- **Edge 0's weeks.** 1358-F6 ruling 4 settled them by a python read: `lastEventWeek` 101 and `firstSharedWeek` 8 in
  the pinned week-130 save.

## Type gates

- **Root: exit 2, with exactly 17 errors at r8's positions** ([x3b-red-sliceB-tsc.txt](1358-stage/x4/x3b-red-sliceB-tsc.txt)):
  - TS2305 ×10: labels (47,10) and (48,10); romance (91,3), (91,24), (91,48), (91,77), (92,3), (92,27), (93,47) and
    (93,81).
  - TS2353 ×5: romance (619,90), (637,90), (656,92), (657,91) and (668,126).
  - TS2578 ×2: romance (677,7) and (679,7).

  These are r5's positions, with each romance position after r8's new line one lower.
- **UI and Bridge:** each exits 0. Only the Bridge gate compiles the changed Bridge file.

## Outputs

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| [x3b-red-sliceB.txt](1358-stage/x4/x3b-red-sliceB.txt) | 117,588 | d442cd7098529f72 |
| [x3b-red-sliceB.json](1358-stage/x4/x3b-red-sliceB.json) | 191,281 | 16f40094ec79a113 |
| [x3b-red-sliceB-tsc.txt](1358-stage/x4/x3b-red-sliceB-tsc.txt) | 2,659 | 4667d3664abf03b4 |
| [x3b-check.txt](1358-stage/x4/x3b-check.txt) | 373 | 63fcba8f67ee0516 |

## Next

The RED lands as staged: `git apply --index` of r8, a commit and a push. Then come the recorded mint (1358-P), a
commit of the capture, and the recorded RED.
