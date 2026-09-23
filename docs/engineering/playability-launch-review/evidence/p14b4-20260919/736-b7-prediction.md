# 736 — the P14B.7 full core run, predicted BEFORE it is started

Registered at source `b4e90e99`, clean tree, before the run begins. Written so the run can
falsify it rather than be read to fit it. The device has caught a real coupling three times in
this programme (records 704, 706, 713).

## Basis

Run 717 at `5ba2b8d6` observed **9 files failed / 344 passed (353); 24 failed / 3978 passed /
8 todo (4010)**, and its failure set was byte-identical to 712's in identity AND cause.

Since then B.7 added exactly two test files, both under `tests/` and therefore both inside the
`core` project's `tests/**/*.test.ts` glob:

| file | cases |
| --- | --- |
| `tests/p14b7-promise-waiver.test.ts` | 28 |
| `tests/bridge-p14b7-promise-waiver.test.ts` | 5 |

Both read 33/33 green in isolation at this source. The sweep touched 98 further test files
values-only, which should move no count at all: it added no case and removed none, and it
re-pinned no frozen digest (0 hex literals added, 0 removed, across the whole diff).

## Predicted

| quantity | predicted |
| --- | --- |
| test files | **9 failed / 346 passed (355)** |
| cases | **24 failed / 4011 passed / 8 todo (4043)** |
| exit code | 1 |
| `fixedSource` | true, and `testedDiffSha256` the empty-tree hash at both ends |

The failure IDENTITIES are predicted to be the 717 set exactly, with nothing new and nothing
vanished, and their CAUSES byte-identical after normalising the known ephemeral `mkdtempSync`
suffix.

## What falsifies it, and what each falsification would mean

- **IF ANY NEW FAILURE APPEARS**, the V31 → V32 bump reaches further than the sweep enumerated,
  and the sweep's "CANNOT-MOVE residue: none" is wrong. The failure is to be attributed, not
  absorbed.
- **IF A 717 FAILURE VANISHES**, a sweep edit weakened a premise that was legitimately red. That
  is the more serious direction and is NOT to be recorded as an improvement.
- **IF THE CASE TOTAL IS NOT 4043**, the sweep added or removed a case, which it was forbidden to
  do.
- **IF `bridge-runtime-checkpoint` IS NOT 64/64**, the 43 → 64 recovery the sweep reported does
  not hold inside a full run.
- **IF THE PREPARED-REUSE TIMEOUT RETURNS**, record 719's FU-2 triggers: identify the operation
  that failed to finish with comparable timings on both sides. It is not to be defaulted to
  either an engine defect or environmental noise, and the threshold is not to be widened.

## Not predicted, and deliberately not run

The `ui` project. Record 713 established that its aggregate carries no signal about a source
change while 14 of its cases are intermittent, and record 719's FU-1 has not returned. B.7 makes
no UI-affecting claim. A run would produce a number, not evidence.
