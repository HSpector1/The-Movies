# 1344-X6: parent dry run of the shelving RED r3 (1344-C3), and a corrected root cause

The scratch tree runs from HEAD 78af2754 (src unchanged through abfcd580). The patch
[1344-shelving-red-r3.patch](1344-stage/1344-shelving-red-r3.patch), sha256 5450bf08…, applies cleanly.

| Run | Result |
|---|---|
| r3 alone ([output](1344-X6-red-r3-run.txt)) | 46 fail, 5 control-passes |
| r3 over production step 5 (sha256 567ccec3…; [output](1344-X6-red-r3-over-step5.txt)) | **51 of 51 pass**, 90.8 s. Other agents were running at the time, and no leaf timed out |

## The negative-zero finding: the comparison fix holds, the stated cause does not

[1344-C3](1344-C3-shelving-red-revision.md) §"Additional finding" reports the viable control's `toEqual` failing on six
leaves, `0` against `-0`. It moved to a canonical, key-sorted JSON comparison, and that fix is right. Its root cause
is wrong. It blamed P15A.1/P15A.2 code "baked into the fixture's mint commit". Those modules are pure: no tick path
imports them (grep: only comments in `tuning.ts` name them), so they cannot change any state.

The parent's probe ([1344-X6-negative-zero-probe.ts](1344-X6-negative-zero-probe.ts)) ran HEAD abfcd580 live from
genesis to week 93:
- the live state holds exactly those six `-0` values: `careerEvents[92,182].genreExpBefore` and four
  `talent[..].genreExperience...perceived`;
- `exportSave(makeSave(state))` equals the minted week-93 fixture byte for byte.

So live arithmetic produces `-0`, and JSON serialization writes it as `0` (`JSON.stringify(-0) === "0"`). A parsed
fixture can never hold `-0`, so comparing a live state with `toEqual`, which uses `Object.is`, against a parsed save
is a method error.

The canonical JSON comparison compares what a save stores. The fixture's mint HEAD is clean: the probe also shows its
bytes equal a fresh HEAD run. The handback's advice about mint HEADs carrying parallel-track commits does not apply
here, because pure, unintegrated modules cannot change a minted save.

Lesson: compare a live state with a genuine save at the serialization level, never with `toEqual` on objects.

## Next

Two passes run in parallel:
- the re-review 1344-D3 of r3, including the canonical comparison;
- the implementation review 1344-J of the five production steps.
