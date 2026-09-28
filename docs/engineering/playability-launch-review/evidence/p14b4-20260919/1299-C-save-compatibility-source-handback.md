# 1299-C — Save30 compatibility literal/title correction, staged

This closes the two "required before execution" deliverables named in [1299-F](1299-F-parent-plan-adoption.md):
the staged postimage/patch/manifest and an exclusive companion guard for gate
`1300-save-v30-compatibility-runtime`. It is source-only evidence. No live-tree edit, Git
index/ref mutation, commit, compiler, test or `vitest`/`tsc`/`node`-on-project-code run
occurred while producing it. Preparation head: `2bb5326ef09255e7f8cd90022e134a889c2335cc`
(current published HEAD of `wip/headless-program-20260916-ts`, verified with `git rev-parse
HEAD` before any read).

## Frozen artifacts

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| [Staged postimage](1299-stage/tests/p14b4-save-v30-compatibility.test.ts) | 25,226 | `f7f97c673abc825dcc3dd64ccde8048fcfb9c626d04368ba1b96d6d9b736cff6` |
| [Exact one-hunk patch](1299-save-compatibility.patch) | 868 | `dbd117a16cb1640ae4d1722b5dd7447814723081800616d9febf44da57004b89` |
| [Correction manifest](1299-save-compatibility-manifest.json) | 9,568 | `01239bdcb25ba6238fa64089f33021c6bf0a2dccb385cb5c4ef04b0e85ce26a9` |
| [Companion guard](1299-C-save-compatibility-manual-guard.py) | 16,708 | `97d5695b5c8c98075dcd77bdfe7bf72e1c3c5d913f0117dbb6c3ece5109075b6` |

The live preimage is unchanged and still on disk: `tests/p14b4-save-v30-compatibility.test.ts`,
25,277 bytes / `9da53d5d64e9015d9dca158c112232e8229872b98d39d1ce9d55b7ddb028e48a`, verified both
before and after the `git apply --check` below. A/B/F remain exactly the bytes 1299-F already
pinned: A 14,762 / `5a4378279fc8fccb391ddaf3d54de28b9d5ff092e90d45cce340489119bcabcb`, B 6,346 /
`cf7fcc5a0121dc3f3e71d4da655f91e1aaee92cfc979946ee912f4e7d4e5d352`. F itself is 3,146 bytes /
`67624fa93f23a40f4cc82a1af37c44e0b52f8c4c6421c21bb8102d1978524a4b` (not previously self-pinned;
recorded here and in the manifest/companion `PLAN_PINS`). `src/core/save.ts` (474,474 /
`88d1bab0db6c1b96c0895af9cdf09a353d8c16993791024bedbebd97cf3d0984`), `vitest.workspace.ts`
(1,228 / `2bb01ef4b7f9f02877e42b425e43f40e3905be769cd6f091cf61a3275563b446`) and
`vitest.config.ts` (176 / `2939ba611a5c025c2974043c98c06af10aadd3065925103d3f506bd1f1d07faa`)
match the identities already frozen in the 1293 manifest and the current tree exactly; no
project source moved underneath this task. `LIVE_SAVE_VERSION` is confirmed declared at
`src/core/save.ts:6538` as `export const LIVE_SAVE_VERSION = 40 as const;`.

## Old to new mapping

Both edits are confined to the file's first leaf, lines 228-229 of the 25,277-byte preimage,
inside `describe('P14B4 Save30: genuine final V29 corpus, exact old-state preservation', ...)`:

| Line | Old | New |
| --- | --- | --- |
| 228 (title) | `pins LIVE_SAVE_VERSION to literal37 (stale number corrected post-C.2b) independently of the value under test (P14B.7, 735-T)` | `pins LIVE_SAVE_VERSION to literal40 independently of the value under test` |
| 229 (assertion) | `expect(LIVE_SAVE_VERSION).toBe(38)` | `expect(LIVE_SAVE_VERSION).toBe(40)` |

Every other byte in the file, including every other `29`/`30`/`37`/`38` literal, frozen reader,
digest pin, synthetic label, downgrade refusal, purity check and the file's default timeout, is
untouched. `git diff --no-index` between the live preimage and the staged postimage shows
exactly one hunk touching only those two lines, with unchanged three-line context on both sides:

```
@@ -225,8 +225,8 @@ function assertActualBacking(save: OldSave, root: OldPromise): void {
 }
 
 describe('P14B4 Save30: genuine final V29 corpus, exact old-state preservation', () => {
-  it('pins LIVE_SAVE_VERSION to literal37 (stale number corrected post-C.2b) independently of the value under test (P14B.7, 735-T)', () => {
-    expect(LIVE_SAVE_VERSION).toBe(38)
+  it('pins LIVE_SAVE_VERSION to literal40 independently of the value under test', () => {
+    expect(LIVE_SAVE_VERSION).toBe(40)
   })
 
   it.each(NAMES)('migrates genuine %s without rewriting roots, receipts, digests or history and downgrades losslessly', (name) => {
```

## Inverse and application proof

The postimage was produced by copying the live preimage byte-for-byte (`cp`, then verified
25,277 / `9da53d5d...` before any edit) and replacing only those two lines. Four checks, all
actually run:

1. `git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-save-compatibility.patch` from the repository root against the live tree: exit 0 ("CHECK-OK"). The live file was re-hashed immediately after and is still 25,277 bytes /
   `9da53d5d64e9015d9dca158c112232e8229872b98d39d1ce9d55b7ddb028e48a`, i.e. the check performed
   no write.
2. In a scratch copy (`.../scratchpad/1299c/apply-check/tests/p14b4-save-v30-compatibility.test.ts`,
   seeded from the live preimage), `git apply --unsafe-paths -p1 1299-save-compatibility.patch`
   actually applied and produced 25,226 bytes / `f7f97c673abc825dcc3dd64ccde8048fcfb9c626d04368ba1b96d6d9b736cff6`,
   an exact match to the staged postimage.
3. `git apply -R 1299-save-compatibility.patch` on that same scratch file (the complete inverse)
   reproduced 25,277 bytes / `9da53d5d64e9015d9dca158c112232e8229872b98d39d1ce9d55b7ddb028e48a`,
   an exact match to the original live preimage.
4. The patch's `index` line (`7d296250..5d890b35`) is the pair of blob hashes `git diff --no-index`
   computed in memory from the two file contents; no object was written to the repository's
   object database (`git diff --no-index` and `git apply --check` do not call `hash-object -w`).

This is a complete two-line replacement and its complete inverse, not a partial or
approximately-matching patch.

## Nineteen-input verification

All nineteen authorized files under `tests/fixtures/p14/genuine-v29-pre-p2/` (the common
`MANIFEST.json` plus, for each of the nine names `empty`, `current-p1`, `replaced-p1`,
`withdrawn-p1`, `bound-open-p1`, `kept-and-broken-p1`, `rival-current-p1`,
`rival-shared-take-terminal-p1`, `refused-p2-count-only-current-draft`, the paired
`.json.gz`/`.provenance.json`) were read with stdlib-only Python (`hashlib`, `gzip`, `os`), with
an explicit `os.path.islink` refusal before each read. All nineteen bytes/SHA256 identities, and
all nine decoded raw bytes/SHA256 identities, match [1299-A](1299-A-save-compatibility-neighbor-proposal.md)'s
table exactly: manifest 39,934 / `77fa32dabb635f4fc839328ac47b07a008b8d26953cff61cf10d1a3dbbb8c1d1`;
compressed/decoded pairs for `empty` 47,265/`93c925eb...` decoding to 383,776/`2ca7733a...`,
`current-p1` 82,610/`4947c31b...` to 675,654/`03017370...`, `replaced-p1` 82,642/`bfd21503...`
to 676,287/`7d5dba1e...`, `withdrawn-p1` 82,599/`4b0d27c3...` to 676,034/`95a01ac1...`,
`bound-open-p1` 88,103/`48ec1b44...` to 729,829/`9d1a1ea1...`, `kept-and-broken-p1` 95,800/
`5ad270aa...` to 796,283/`d4ddc019...`, `rival-current-p1` 122,731/`560f645e...` to
1,132,766/`4902a1b2...`, `rival-shared-take-terminal-p1` 122,548/`c4065d9c...` to 1,131,090/
`51cb83b5...`, `refused-p2-count-only-current-draft` 82,741/`dedd68ed...` to 676,337/
`7f7529cb...`, with matching provenance byte counts/hashes for all nine. No mismatch was found;
no stop-and-report condition was triggered. No fixture payload outside these nineteen paths, no
`ui/e2e/`, no `ui/public/` content and no producer filename recorded in a provenance was read or
executed. All nineteen identities are embedded, unmodified, in the manifest's `fixtureInputs`
array and in the companion's `FILES` constant.

## Companion differences from 1297-C

The companion was written fresh; it does not import, load or execute
[1297-C](1297-C-legacy-neighbors-manual-guard.py). A `git diff --no-index` between the two
Python sources (1297-C 195 lines / 13,645 bytes reviewed hash `4a7e946729e84cbe27bdadf7aeab46ee51d7e524368464c40d53488068e3e63b`,
this companion 197 lines / 16,708 bytes) shows the structural differences are confined to:

- Docstring: "Fixed 1298 manual companion" becomes "Fresh 1300 manual companion. Written
  independently from the 1297-C shape with its own constants; it does not import, modify or
  repurpose 1297-C" plus the renamed required env vars.
- `SELF`, `MANIFEST`, `GATE` constants: `1297-C-legacy-neighbors-manual-guard.py` /
  `1297-legacy-neighbors-manifest.json` / `1298-legacy-neighbors-runtime` become
  `1299-C-save-compatibility-manual-guard.py` / `1299-save-compatibility-manifest.json` /
  `1300-save-v30-compatibility-runtime`.
- `FILES`: 1297-C's twelve rows (two P14B4/B3 test files, a fixture helper, two Vitest configs,
  a 7-entry generated-corpus manifest/pair set) become this companion's twenty-three rows (the
  manifest's four `sourceConfigPins` — the test file pinned at its **postimage** identity for
  the run, `src/core/save.ts`, both Vitest configs — plus all nineteen `fixtureInputs`).
- `COMMAND`: the two-file `-t`-filtered 1297/1298 argv becomes the single-file, unfiltered
  `1300` argv from 1299-F.
- A new `EXPECTED_SELECTION` constant (absent in 1297-C, which inlined its selection literal)
  holds the exact `manifest["selection"]` object, so `snapshot()` compares against a named
  constant instead of an inline dict; the comparison itself is the same kind of literal-equality
  gate.
- `snapshot()`'s manifest-shape check: 1297-C compares `manifest["files"] == FILES` (its
  manifest has one `files` key); this manifest carries the source/config and the fixture rows
  under two separate keys, so the companion checks
  `manifest["sourceConfigPins"] + manifest["fixtureInputs"] == FILES` instead. This is the same
  frozen-content requirement expressed against this manifest's actual shape.
- Cardinality constants: `len(FILES) == 12` / `len(rows) == 17` / `sum(... ) == 3` (1297-C)
  become `len(FILES) == 23` / `len(rows) == 28` / `sum(... ) == 9` (28 = 23 `FILES` + 4
  `PLAN_PINS` [A, B, F, this manifest] + 1 self; 9 decoded = the nine `fixtureInputs` gzip
  pairs).
- `PLAN_PINS`: A/B/F/manifest content, all four re-pinned to this task's actual bytes/hashes.
- `main()`'s two `os.environ.get(...)` calls: `P14_NEIGHBORS_EXPECTED_HEAD` /
  `P14_NEIGHBORS_GUARD_SHA256` become `P14_SAVE30_EXPECTED_HEAD` / `P14_SAVE30_GUARD_SHA256`.

Every other function is byte-identical in structure and behavior to 1297-C: `require`,
`digest`, `read` (undeclared-read refusal plus the symlink-refusal walk over the candidate and
all its parents), `pin`, `load`, `git` (metadata-only subprocess, `GIT_OPTIONAL_LOCKS=0`),
`timestamp`, `check_bounded` (same `SOURCE`/`EXCLUDED` bounded-guard-scope checks, unchanged),
`write_exclusive` (the same two-path `open('x')` allowlist, no cleanup on failure), and `main`'s
overall flow: fixed-path/argv checks, HEAD equality, `snapshot()`, bounded preflight/advanceCap0
check, the pre-mode refusal when any run/post artifact already exists, chronology, the post-mode
manual pre/post key join, the bounded pre/post key join, `allGuardsExact`/`fixedSource`
requirements, executed-argv/HEAD/fixedSource/untracked checks, the **empty recorded source diff**
requirement (`read(...patch) == b""`, `testedDiffSha256 == digest(b"")["sha256"]`), the
filename-only tracked/excluded comparison via `git ls-files`, the raw-header-joins-closed-record
check, full chronology across manual-pre -> record.start -> record.end -> bounded-post -> now,
and `runtimePassInferred: False` in the final manual postflight. The bounded preflight's
`advanceCap` must still be `0`.

The "empty recorded source diff" check is unchanged deliberately, not loosened: gate 1300 is
expected to run only **after** the parent applies and publishes (commits) this patch, at which
point `P14_SAVE30_EXPECTED_HEAD` is the new commit and the working tree is clean against it, so
`git diff HEAD -- <sourcePaths>` is empty again, exactly as it was for 1298. If the parent instead
runs gate 1300 against an uncommitted working-tree edit, the bounded recorder's diff will be
non-empty and the companion will correctly refuse in post mode ("nonempty recorded source diff"
or "executed source changed"), rather than silently accepting a dirty tree.

Only a standard-library syntax check was run on the companion:
`python3 -c 'import ast,sys; ast.parse(open(sys.argv[1]).read())' 1299-C-save-compatibility-manual-guard.py`
passed. It was not imported as a module and not executed in `pre` or `post` mode.

## Commands actually run

```sh
# preimage / declaration / source identity
wc -c tests/p14b4-save-v30-compatibility.test.ts
shasum -a 256 tests/p14b4-save-v30-compatibility.test.ts
sed -n '6530,6545p' src/core/save.ts
grep -n "export const LIVE_SAVE_VERSION" src/core/save.ts
git rev-parse HEAD
git status --short
wc -c src/core/save.ts vitest.workspace.ts vitest.config.ts
shasum -a 256 src/core/save.ts vitest.workspace.ts vitest.config.ts
wc -c docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-c2.mjs \
      docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-guards.py
shasum -a 256 docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-c2.mjs \
              docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-guards.py
wc -c docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-{A,B,F}*
shasum -a 256 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-{A,B,F}*

# nineteen fixture inputs, stdlib-only hashing/gzip decode
python3 <script using only hashlib, gzip, os, json, reading the MANIFEST.json plus the nine
        genuine-v29-<name>.json.gz / .provenance.json pairs, with an os.path.islink refusal
        before each read>

# staged postimage
cp tests/p14b4-save-v30-compatibility.test.ts docs/.../1299-stage/tests/p14b4-save-v30-compatibility.test.ts
wc -c / shasum -a 256 <staged file, before and after the two-line edit>
sed -n '225,232p' docs/.../1299-stage/tests/p14b4-save-v30-compatibility.test.ts

# patch and inverse proof
git diff --no-index -- tests/p14b4-save-v30-compatibility.test.ts docs/.../1299-stage/tests/p14b4-save-v30-compatibility.test.ts
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-save-compatibility.patch
git status --short tests/p14b4-save-v30-compatibility.test.ts   # confirms no write
wc -c / shasum -a 256 tests/p14b4-save-v30-compatibility.test.ts # confirms no write
git apply --unsafe-paths -p1 <patch>     # in a scratch copy only
git apply -R <patch>                     # in the same scratch copy, reproduces the preimage

# companion syntax check
python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read()); print('syntax OK')" \
  docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-C-save-compatibility-manual-guard.py
wc -c / shasum -a 256 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-C-save-compatibility-manual-guard.py

# companion structural diff against 1297-C (read-only)
git diff --no-index --stat -- 1297-C-legacy-neighbors-manual-guard.py 1299-C-save-compatibility-manual-guard.py
git diff --no-index -U1 -- 1297-C-legacy-neighbors-manual-guard.py 1299-C-save-compatibility-manual-guard.py
wc -l 1297-C-legacy-neighbors-manual-guard.py 1299-C-save-compatibility-manual-guard.py
```

No `vitest`, `tsc`, `node` on project code, producer, fixture enumeration beyond the nineteen
listed paths, `ui/e2e/`/`ui/public/` read, Git index/ref mutation or commit was run at any point.

## Prospective parent commands (not run here)

After independent 1299-D review of this handback and the companion, and after the parent's own
1299-E application/publication (apply `1299-save-compatibility.patch` to the live tree, commit,
and treat the resulting commit as the new published HEAD):

```sh
# bounded preflight, cap 0
python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-guards.py \
  pre 1300-save-v30-compatibility-runtime 0

# companion pre (env vars supplied by the parent post-publication)
P14_SAVE30_EXPECTED_HEAD=<published-execution-HEAD> \
P14_SAVE30_GUARD_SHA256=97d5695b5c8c98075dcd77bdfe7bf72e1c3c5d913f0117dbb6c3ece5109075b6 \
  python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-C-save-compatibility-manual-guard.py pre

# recorder, exact adopted argv, no name filter
node docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-c2.mjs \
  1300-save-v30-compatibility-runtime node_modules/.bin/vitest run --project core \
  --no-file-parallelism tests/p14b4-save-v30-compatibility.test.ts

# bounded postflight
python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-bounded-source-guards.py \
  post 1300-save-v30-compatibility-runtime

# companion post
P14_SAVE30_EXPECTED_HEAD=<same-published-execution-HEAD> \
P14_SAVE30_GUARD_SHA256=97d5695b5c8c98075dcd77bdfe7bf72e1c3c5d913f0117dbb6c3ece5109075b6 \
  python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1299-C-save-compatibility-manual-guard.py post
```

The angle-bracket HEAD value is an explanatory placeholder, not literal shell syntax. Expected
collection is 36 selected, 0 filtered; that is prospective metadata until the raw result is
read, not a measured invocation counter. Stop at the first failure and attribute it with the
masked remainder; no repeat, filter, timeout change, assertion edit or broader selection follows
from a failure, per 1299-F's failure policy. Independent 1299-D review of this handback and the
companion is the next concrete action.
