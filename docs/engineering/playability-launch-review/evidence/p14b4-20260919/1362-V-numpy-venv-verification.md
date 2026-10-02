# 1362-V: numpy in the project `.venv`, verified

The Owner approved numpy on 2026-10-02 ([1362-O](1362-O-owner-response-20261002.md)), with four conditions:
- in the existing project `.venv` only, between recorded runs;
- record the interpreter and package versions;
- verify the import through the actual test environment;
- run the three affected image-export tests, with no unrelated upgrade or system-wide change.

The parent ran it at 13:26-13:27 CDT, at HEAD cbdd8cdc, when no recorded run was active (the heavy-lane lock was free).
It completes [1345-E](1345-E-pillow-environment-result.md), which installed Pillow and left these three tests failing.

## Versions ([1362-V-setup.txt](1362-V-setup.txt))

- **Interpreter:** `.venv/bin/python3` points to `python3.14`, Python 3.14.4 (Homebrew `python@3.14`, as in 1345-E).
- **Before:** `pip list` showed `pillow 12.3.0` and `pip 26.1`.
- **Install:** `.venv/bin/python -m pip install --only-binary=:all: 'numpy==2.5.1'`.
  - The version is the repository's own pin, `.github/requirements-tests.txt` (`numpy==2.5.1`, `Pillow==12.3.0`).
  - pip downloaded the wheel `numpy-2.5.1-cp314-cp314-macosx_10_15_x86_64.whl` (16.8 MB) and reported "Successfully
    installed numpy-2.5.1".
- **After:** `pip list` shows `numpy 2.5.1`, `pillow 12.3.0` and `pip 26.1`. numpy is the only addition. pip offered
  26.2.1, and the parent did not upgrade it.
- **Health:** `pip check` reports "No broken requirements found."

## The import, through the tests' route ([1362-V-import-proof.txt](1362-V-import-proof.txt))

The tests call the bare `python3` through Node's `execFileSync`, under `PATH="$PWD/.venv/bin:$PATH"` (1345-E). The
proof ran on Node v20.20.2.

| Run | Interpreter | numpy | Pillow | zlib |
|---|---|---|---|---|
| With the scoped PATH | `/Users/zacheryspector/The-Movies-headless-program/.venv/bin/python3`, 3.14.4 | 2.5.1 | 12.3.0 | 1.2.11 |
| Without it | the system `python3` | `ModuleNotFoundError: No module named 'numpy'` | | |

- **Nothing changed system-wide.** The system `python3` still lacks numpy.
- **The tool loads.** Under the scoped PATH, `python3 scripts/art/authored-asset-pipeline.py --help` exits 0 and prints
  its usage. Its dependency gate (`:43-47`) passes.

## The three affected tests ([1362-V-ui-rgba-export-test.txt](1362-V-ui-rgba-export-test.txt))

`node_modules/.bin/vitest run --project ui ui/src/lot/authored-rgba-export.test.ts` ran under the scoped PATH, alone
in the heavy lane, from 13:27:04 CDT.
- **The file:** 8 passed (8), exit 0, in 13.6 s.
- **The three tool-contract leaves** that failed in 1345-E for lack of numpy now pass:
  - "6. output is truecolour RGBA with no PLTE/tRNS, alpha preserved exactly" (8,904 ms);
  - "7. repeated runs are byte-identical" (2,154 ms);
  - "8. the historical PNG-8 path is still available and clearly separate" (680 ms).

## What changes for the gates

- **The three rows leave the UI gate's failures.** 1358-M3's UI gate failed 3, "the numpy rows". From the next
  recorded UI gate on, these three should pass. Attribution names this record as the cause of the change, as 1345-E
  did for the Pillow rows.
- **The recorded gates already carry the PATH.** They run with `PATH="$PWD/.venv/bin:$PATH"` (1345-E), so no gate
  command changes.
- **The setup receipt** (`docs/operations/fable-team/SETUP-RECEIPT.md`, "Python image dependency for the tests")
  records the install.
