# 1344-C4: comment-only correction to the viable-control leaf's root-cause note

Role: independent test engineer. Same scratch tree, same BASE `c214094478f47c3e861d757ef568a124cbf3bd71`.
Authority: [1344-D3](1344-D3-shelving-red-r3-review.md) (ACCEPT of r3; non-blocking note that the
in-line comment's root-cause attribution is wrong) and [1344-X6](1344-X6-shelving-red-r3-dry-run.md)
with its probe [1344-X6-negative-zero-probe.ts](1344-X6-negative-zero-probe.ts) (the governing
correction).

## What changed

One in-line comment block in `tests/p14d1-rival-shelving.test.ts` (`shelving-viable-control`, first
sub-leaf, immediately above the `canon`/`expect` lines). 1344-C3's comment blamed unrelated P15A code
baked into the fixture's mint HEAD for the observed `0`-vs-`-0` divergence. 1344-X6 shows this is
wrong: `sharedMarket.ts`/`powerRanking.ts` are pure and imported by no tick path (grep: only comments
in `tuning.ts` name them — independently reconfirmed this session), so they cannot change any state.
The probe runs current HEAD live from genesis to week 93 and shows the same six `-0` values arise from
ordinary arithmetic (`careerEvents[*].genreExpBefore` x2, `talent[*].genreExperience...perceived` x4),
and that `exportSave(makeSave(state))` equals the minted fixture byte for byte — independently re-ran
the probe this session and reproduced both facts exactly.

The comment now states the true cause: a parsed/genuine save can never hold `-0` (JSON serialization
always writes it as `0`), so comparing a live state against a parsed save with `toEqual`
(`Object.is`-based) is a method error, not a data error; the leaf compares at the serialization level
(canonical, key-sorted JSON) because that is what a save stores. Cites 1344-X6. The key-ordering
rationale for sorting (finding 2 in the old comment) is preserved, since it is still accurate and still
the reason canonical, not raw, `JSON.stringify` is used.

**No assertion, helper, or value changed.** `git diff` on the scratch tree shows only comment lines
(`+`/`-` on `//`-prefixed lines) touching this one file; the `canon` helper and the `expect(...)` line
are unchanged context lines. Confirmed: `git diff --stat` shows 1 file changed, and a line-by-line diff
of the r3 patch against this r4 patch shows the only hunk difference is the same comment block (see
`diff 1344-shelving-red-r3.patch 1344-shelving-red-r4.patch`, checked this session).

## Runs

- Root type gate: `npx tsc --noEmit -p tsconfig.json` → exit 0, 1m52.9s.
- RED, scratch tree, all three files, once: **46 failed | 5 passed (51)** — same as r3, same five
  control-passing leaves, same failure reasons throughout (comment-only changes cannot move a RED
  failure line). Full output: [1344-X7-red-r4-run.txt](1344-X7-red-r4-run.txt).
- Scratch apply check (`GIT_INDEX_FILE`, temp index, real working tree untouched): `git apply --check`
  and `--cached` both OK against BASE.

## Deliverables

- [1344-stage/1344-shelving-red-r4.patch](1344-stage/1344-shelving-red-r4.patch) — full diff vs BASE
  (same four tests-only files as r3), sha256
  `4d6732f3c269fda1ebec84864a5c4f170c2e7b961025afe752cedb153e7ce815`.
- [1344-stage/1344-shelving-red-r4-classification.json](1344-stage/1344-shelving-red-r4-classification.json)
  — the same 51 rows as r3 (verified: 50 rows byte-identical to r3), with row 13 (the viable-control
  genesis-to-week-93 leaf)'s `revision` field appended to note this comment-only correction. No
  `redStatus`, `redReason` fact, `leaf`, or `requirement` value changed on any row.
- This file.

## Not covered here

Real repo HEAD moved again during this pass (background, unrelated work); confirmed (as in 1344-C3)
that no `src/`/`bridge/`/`ui/` file changed since `78af2754`, so the scratch tree remains
representative. No production code was touched; the real working tree contains only this revision's
three new evidence files (this handback, the r4 patch, the r4 classification JSON) plus the RED run
log, and other agents' unrelated untracked work.
