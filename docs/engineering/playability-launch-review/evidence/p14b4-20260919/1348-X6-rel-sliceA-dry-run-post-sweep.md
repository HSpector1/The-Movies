# 1348-X6: parent dry run of slice A at the post-sweep HEAD

1348-X5 ran slice A before the Save43 sweep, so 28 of its failures were Save43 fallout. This run repeats the 1348-F5
dry run at HEAD 85764cd5, which carries the sweep (cec3902c).

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1358-x/run-1348-X6-1358-X.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK`, 21:59:38-22:09:51 CDT on 2026-10-01. Node v22.23.2, the session default.
- **Tree.** A fresh scratch tree from 85764cd5, then the staged patches:
  - RED r5 (sha256 34c5be75…), commit `slice-a-red-r5`;
  - then the cumulative step 3 (80540869…), commit `slice-a-step3`.
- **Reporters.** `--no-cache`, with the verbose and JSON reporters.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1358-x/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x6-red-sliceA.txt` | 48,420 | 85d2e031ca987a8d |
| `x6-red-transitions.txt` | 139,829 | 6b89232a47e47b6f |
| `x6-step3-sliceA.txt` | 27,894 | d32320fe3913d8cf |
| `x6-step3-transitions.txt` | 139,833 | dc89f85745d8bd7e |
| `x6-step3-tsc.txt` | 82 | 2fa87edefb065678 |

## Results

| Run | Files | Result |
|---|---|---|
| r5 at HEAD | the four slice A files | 30 failed, 62 passed (92) |
| step 3 | the four slice A files | **3 failed, 89 passed (92)** |
| r5 at HEAD | the seven transition files of 1348-J check 3 | 2 failed, 69 passed (71) |
| step 3 | the seven transition files | 2 failed, 69 passed (71) |
| step 3 | root, UI and Bridge type gates | each exits 0 |

## Attribution

- **The RED's failures.** The 30 at r5 are the 27 slice A RED leaves and the three row 6 leaves of
  `tests/p14b5-relationships.test.ts` that [1344-F6](1344-F6-parent-ruling-declared-exceptions.md) declares
  exceptions:
  - conflict-evidence, 12;
  - mentor-label, 9;
  - p14b5-relationships, 9, made of 6 slice A leaves and the three exceptions.
- **Step 3 fixes all 27 slice A leaves and breaks none.** The three failures left at step 3 are the row 6
  exceptions. They fail at `rivalWorld` (:397:53) with the primary that 1344-F6 quotes, as they do in the recorded core
  gate of [1344-M3](1344-M3-save43-sweep-recorded-gates.md). They are not slice A defects.
- **The shared helper preserves behaviour** (1348-F4 item 4, 1348-J check 3). The transition files fail the same two
  identities before and after step 3: the two retained 1338 rows of `p14c3-canonical-rival-history`.
- **No Save43 fallout remains.** The six mentor-label failures of 1348-X5 (`expected 43 to be 42` at
  `acceptedEvidence`) are gone, because the sweep set that helper to 43.
- **The type gates are clean,** so slice A adds no type error.

## Consequence for the landing

1348-F5 expected 80 of 80 and 12 of 12. The three row 6 leaves keep that from holding: they belong to slice A's files
but fail under the shelving law, as declared exceptions. The landing's recorded GREEN therefore expects **89 passed and
the three row 6 exceptions failing**. [1348-L](1348-L-rel-sliceA-landing.md) records it.
