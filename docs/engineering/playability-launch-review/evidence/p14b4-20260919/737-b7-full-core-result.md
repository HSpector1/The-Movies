# 737 — the full core run, and the two sweep misses it caught

Run: `737-b7-full-core`, source `2feacdc0`, node v20.20.2, 3104.83s wall.
`fixedSource: true`, `testedDiffSha256` the empty-tree hash at both ends, exit 1.
Prediction 736 was registered at `b4e90e99` before the run started.

## The prediction is falsified on counts

| quantity | predicted (736) | observed (737) |
| --- | --- | --- |
| test files | 9 failed / 346 passed (355) | **13 failed / 342 passed (355)** |
| cases | 24 failed / 4011 passed / 8 todo (4043) | **30 failed / 4005 passed / 8 todo (4043)** |
| exit code | 1 | 1 |
| `fixedSource` | true | true |

Falsifier 1 fired: new failures appeared, so the sweep's "CANNOT-MOVE residue: none" is wrong.
Six new failures, in two causes, both traced below.

## Nothing vanished, which was the direction that mattered

736 named a vanishing failure as the more serious falsification, because it would mean a sweep
edit had weakened a premise that was legitimately red. It did not happen.

Comparing run 717 against run 737 at cause level, normalising the ephemeral `mkdtempSync` path:

- causes present in 717 and absent from 737: **none**
- causes present in 737 and absent from 717: exactly **6**, in 2 distinct texts

Every one of 717's nine failing files reappears in 737 with an identical per-file count:
`bridge-p12-campaign-library` 11, `p13a-scientist-foundation` 3, `r3n1-stale-schedule-take-02` 2,
`-02p31` 2, `-02p32` 2, `world-first-scenery-load-in-provenance` 1,
`p14b4-ready-replay-stale-target` 1, `p14b4-cast-class-capacity-evaluator5` 1,
`bridge-p13-campaign-isolation` 1. That is 24, the whole inherited set, unmoved.

## The arithmetic confirms the sweep added and removed no case

717 ran 353 files and 4010 cases. 737 ran 355 files and 4043 cases. The deltas are +2 files and
+33 cases, which are exactly B.7's two new suites and their 33 cases. The 98 files the sweep
edited contributed zero. Falsifier 3 did not fire.

## Cause A — three sites probe the version directly above live

`tests/d17a-adv-migration.test.ts:274`, `tests/d17b-save-v7.test.ts:147` and
`tests/contracts/v14-boundary-guards.contract.test.ts:324` each read:

```ts
expect(() => validateSave({ ...save, saveVersion: 32 })).toThrow(/unknown saveVersion 32/)
```

The subject of these assertions is the unknown-version boundary, so they name the version one
above live. While live was V31 they were correct. `LIVE_SAVE_VERSION = 32` makes 32 known, the
dispatcher routes it to `validateSaveV32`, and that validator refuses the forged V14-era envelope
for a different reason: `validateSaveV32: state.promises is not an array`.

### Why the finder could not see them

The sweep did carry this class and applied it correctly to 12 of the 15 files that hold the probe.
`tests/save.test.ts:426` shows the shape it caught:

```
before:  it("rejects an unknown saveVersion 32 with the updated range, …
after:   it("rejects an unknown saveVersion 33 with the updated range, …
```

Every site the sweep found states the handled range on the same line, as
`"1 through 31 only"`. That string carries the outgoing literal. The three missed sites assert
only the unknown-ness and never state the range, and at the pre-bump source `14a1489c` each of
those three files contains **zero occurrences of the string `31` anywhere in the file**. No
finder keyed on the outgoing version could have reached them, at line level or at file level.

The class was present. The finder was structurally incapable of completing it. A live-version
sweep has to grep the **incoming** version as well as the outgoing one, because a site whose
whole purpose is to name the next version holds only the incoming literal.

## Cause B — one site resolves the live boundary by its version-suffixed name

`tests/contracts/studio-events.contract.test.ts:129`:

```ts
const validateLive = requireFunction(requireCore(), 'validateSaveV31', 'P09 live boundary')
```

`makeSave` beside it is the live builder and now stamps 32, so the pair disagreed and
`validateSaveV31` threw `expected version 31` on three cases.

This miss is ordinary, not structural, and it is worth separating from Cause A. The file does
contain `31`, on exactly that one line, so a finder keyed on the outgoing literal would have
surfaced it. The sweep brief listed its classes as literals, sentinels, frozen builders and
harness, id rosters and table bounds. A version-suffixed function identifier passed as a
**string** to a reflective resolver is none of those, so the brief never named it and the sweep
did not edit the file.

The site is genuinely live-boundary rather than frozen-era: its own label argument says
`'P09 live boundary'`.

## Distinguishing this from the frozen readers, which must not move

`validateSaveV31` still has 28 other references. All of them stay. `p14b5-save-v31.test.ts` is
the V31 slice's own suite; `p14b7-promise-waiver.test.ts` and `bridge-p14b7-promise-waiver.test.ts`
validate the frozen V31 fixture first and convert afterwards, which is B.7's design;
`p14b4-material-evidence-core.test.ts` pairs it with `convertV31ToV32`; the rest are comments.
`src/core/relationships.ts:399` keeps the V31-era error prefix. A blanket rename would have
destroyed the frozen-era proofs, which is the failure mode this class invites.

Enumerating the reflective resolver across all of `tests/` returns four hits: `validateSaveV14`
and `makeSaveV14` twice, correctly pinned to the frozen V14 era by that file's stated design, and
the single live-boundary hit above. There is no third case.

## The correction

Four lines in four files, values only, no case added or removed:

| file | line | change |
| --- | --- | --- |
| `tests/d17a-adv-migration.test.ts` | 274 | probe and regex 32 → 33 |
| `tests/d17b-save-v7.test.ts` | 147 | probe and regex 32 → 33 |
| `tests/contracts/v14-boundary-guards.contract.test.ts` | 324 | probe and regex 32 → 33 |
| `tests/contracts/studio-events.contract.test.ts` | 129 | `validateSaveV31` → `validateSaveV32` |

`git diff --stat` reads 4 files changed, 4 insertions, 4 deletions.

Verified after the edit:

- the four files run **100 passed (100)**, 4 files passed
- 64-hex literals added across the diff: **0**; removed: **0**
- typecheck root 0, `tsconfig.bridge.json` 0, `ui/tsconfig.json` 0
- residue sweep: no `unknown saveVersion 32` probe and no live-boundary `validateSaveV31`
  remains anywhere under `tests/`, `ui/`, `bridge/` or `src/`

## Falsifiers that did not fire

- **`bridge-runtime-checkpoint` 64/64.** The full run reads
  `✓ |core| tests/bridge-runtime-checkpoint.test.ts (64 tests) 182416ms`. The sweep's 43 → 64
  recovery holds inside a full run.
- **The prepared-reuse timeout did not return.**
  `✓ |core| tests/bridge-runtime-checkpoint-prepared-reuse.test.ts (21 tests) 188186ms`.
  Record 719's FU-2 does not trigger. Its trigger remains a recurrence, and the threshold stays
  where it is.
- **The case total is 4043**, as predicted.

## Recorded, not fixed

The three Cause A tests carry stale names that describe a boundary many bumps old:
"rejects unknown V22" (d17a, and again in v14-boundary-guards) and "V7 through V20 are known, so
the unknown-version boundary is now 21" (d17b). Those names were already false before B.7 and
they are false now.

They are left alone deliberately. Failure identity in this programme is compared across runs by
full test-name string, which is how 712, 717 and 737 were diffed above. Renaming a test breaks
that comparison for every future run, and these three files belong to the D-17A, D-17B and
C2a-M1 slices rather than to B.7. The names are a truthfulness defect worth a later pass with
explicit authority, not a silent edit under this one.

## What this changes in the sweep record

Record `b4e90e99`'s claim of "CANNOT-MOVE residue: none" covered the residue the sweep could see.
It missed 4 sites across 4 files, 3 of them unreachable by its finder and 1 outside its stated
class list. The claim is corrected here rather than in place, and the sweep's other verified
results stand: production untouched, zero frozen digests re-pinned, both B.7 suites 33/33.
