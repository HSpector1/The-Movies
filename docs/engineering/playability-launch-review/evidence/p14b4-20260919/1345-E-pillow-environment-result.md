# 1345-E: scoped Pillow environment, result

Executed after gate 1343 ended, per [1345-A](1345-A-pillow-scoped-environment-plan.md), at HEAD ea65e796. No recorded
run was active.

## Setup ([1345-E-setup.txt](1345-E-setup.txt))

- The `.gitignore` line `/.venv/` was written before the environment existed.
- `/usr/local/bin/python3 -m venv .venv` exited 0.
- `.venv/bin/python -m pip install 'pillow==12.3.0'` exited 0 with "Successfully installed pillow-12.3.0". Nothing else
  was installed. pip stayed at 26.1; pip printed an upgrade notice, and the parent did not follow it.
- `pip list` shows `pillow 12.3.0` and `pip 26.1` only.

## Proof through the tests' own subprocess route ([1345-E-import-proof.txt](1345-E-import-proof.txt))

With `PATH="$PWD/.venv/bin:$PATH"`, Node's `execFileSync('python3', ['-c', …])` prints:
- interpreter `/Users/zacheryspector/The-Movies-headless-program/.venv/bin/python3`, Python 3.14.4;
- `pillow 12.3.0`, Pillow's zlib `1.3.1.zlib-ng`, the same as the repository's image evidence
  (`docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-EVIDENCE.md:71-73`);
- the system zlib is 1.2.11 here and 1.2.12 in that evidence. Pillow encodes with its own bundled zlib.

Without the prefix, the same call still fails with "No module named 'PIL'", so no global state changed.

## The affected tests, run once each under the scoped `PATH`

| File | Result | Rows of the 11 |
|---|---|---|
| `ui/src/lot/authored-stage-a.test.ts` ([run](1345-E-ui-image-tests.txt)) | 17 of 17 pass | 4 of 4 now pass |
| `ui/src/lot/authored-rgba-export.test.ts` (same run) | 5 of 8 pass | 3 of 6 now pass; 3 fail |
| `tests/world-first-scenery-load-in-provenance.test.ts` ([run](1345-E-core-scenery-test.txt)) | 3 of 3 pass | 1 of 1 now passes |

Eight of the eleven rows now pass. That includes the core leaf that replays the exporter and pins its output
(7,043 ms). Pillow 12.3.0 reproduces the pinned bytes here.

The three that still fail are the rgba-export "tool contract" leaves 6, 7 and 8. Each runs
`scripts/art/authored-asset-pipeline.py`, which stops with:

```text
authored-asset-pipeline: missing dependency (No module named 'numpy'). Needs Pillow and numpy.
```

The tool imports `numpy` beside Pillow (`scripts/art/authored-asset-pipeline.py:43-47`). Ruling 1 authorizes "only the
compatible Pillow package", and the execution section says "No installations beyond the narrow Pillow
authorization". The parent did not install numpy. These three rows stay environment failures with this cause, and a
numpy installation is put to the Owner.

## Records

- Setup receipt: `docs/operations/fable-team/SETUP-RECEIPT.md`, section "Python image dependency for the tests".
- From now on, gate commands run with `PATH="$PWD/.venv/bin:$PATH"` in front of the recorder. Attribution against 1338
  and 1343 names this environment change as the reason the eight image rows change status.
