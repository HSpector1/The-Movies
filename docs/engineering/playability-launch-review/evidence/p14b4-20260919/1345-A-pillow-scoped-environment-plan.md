# 1345-A: scoped Pillow environment for the image tests (Owner ruling 1 of 1342-O)

## Which rows need it (measured)

Eleven recorded failures stop at `python3` without Pillow ("No module named 'PIL'"):
- **UI, 10 rows** in [1339](1339-I-failures.json): `ui/src/lot/authored-rgba-export.test.ts` (6) and
  `ui/src/lot/authored-stage-a.test.ts` (4).
- **Core, 1 row** in [1338](1338-I-failures.json): `tests/world-first-scenery-load-in-provenance.test.ts` "replays the
  clean exporter and pins its deliberately …". It runs `tools/hollywood/export_district.py`, which imports
  `from PIL import Image, ImageDraw` (`:16`). Its 1302 label, "RETAINED-benign-tmp-suffix", describes the temporary
  path in its primary. The failure itself is the missing module; the raw log shows "No module named 'PIL'" twice.

Correction: 1342-O's table and the parent's question list gave "13 rows (10 UI, 3 core)". Core cluster C3 (3 rows) is
`acceptedEvidence-helper-literal` and does not involve Python. The count is 11: 10 UI and 1 core.

## The interpreter the tests use

The tests call the bare name through the Vitest process's `PATH`:
- `execFileSync('python3', …)` in `authored-rgba-export.test.ts:119`, `:138`, `:164`, `:178`;
- `python3 …/export_district.py` in the core row's command.

On this machine that resolves to `/usr/local/bin/python3`, a symlink to Homebrew `python@3.14` 3.14.4_1. Its standard
library carries `EXTERNALLY-MANAGED`
(`/usr/local/opt/python@3.14/Frameworks/Python.framework/Versions/3.14/lib/python3.14/EXTERNALLY-MANAGED`), so pip
refuses a user-site install. Under ruling 1 this means "a project-local virtual environment and scoped test-runner
environment instead of bypassing its protections".

## Rules

1. **Virtual environment:** `.venv/` at the repository root, created from the same interpreter:
   `/usr/local/bin/python3 -m venv .venv`. No sudo, no `--break-system-packages`, no other Python, no shell-profile
   change.
2. **One package:** `.venv/bin/python -m pip install 'pillow==12.3.0'`, pinned to the version in the repository's
   own image evidence (`docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-EVIDENCE.md:71`). pip installs no other upgrade.
   The parent records what pip actually installed, including any wheel dependency.
3. **Git:** one `.gitignore` line, `/.venv/`. The environment and its binaries never enter Git. The line goes in
   before the environment exists, so no recorded run ever sees `.venv/` untracked.
4. **Scoping:** only the commands that run tests get `PATH="<repo>/.venv/bin:$PATH"`, set on that command line. That
   covers targeted runs and the recorded gates from now on. Nothing global changes. A test run already in progress is
   never touched: the install happens after gate 1343 ends.
5. **Proof through the same subprocess route:** under the scoped `PATH`, a Node one-liner that calls
   `execFileSync('python3', ['-c', 'import sys, PIL; from PIL import Image; print(sys.executable, PIL.__version__)'])`
   must print the `.venv` interpreter and 12.3.0. An import that succeeds is not evidence that a test passes.
6. **Affected tests:** the three files above run under the scoped `PATH`, once each, and the results are reported as
   they come. A row that still fails after the import works has another cause, and the parent attributes it on its own
   evidence (for example a pinned byte digest that depends on the zlib build). No assertion or pin changes here.
7. **Setup record:** the interpreter, the Pillow version, the two setup commands and the scoped `PATH` go in
   [SETUP-RECEIPT.md](../../../../operations/fable-team/SETUP-RECEIPT.md) under a new dated section, and in the gate
   commands of the handoff CURRENT block.
8. **Gate comparability:** later recorded gates run with the scoped `PATH`. Their attribution names this environment
   change as the reason any image row changes status.

## Order

After gate 1343 ends: the `.gitignore` line (committed), then the environment, the proof, the three files, and the
setup record. Independent review of the result (1345-B) comes before the next recorded gates.
