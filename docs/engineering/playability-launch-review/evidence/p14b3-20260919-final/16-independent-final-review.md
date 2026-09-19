# P14B.3 independent final bridge and fixed-source review

Date: 2026-09-19. Native `contract-auditor`. **KEEP for qualified B3 logic
closeout; full suites are not all green.** No new blocking finding from the
completed bridge evidence or sealed run identity. Parent owns the final label,
records, publication and exact remote verification.

## Inspected identities

| Artifact | SHA256 |
|---|---|
| `00-run.json` | `bcdcbe429fc41569eefac0a6a5f0e810db852329a1742d984931e61c60c6822b` |
| `12-test-bridge-359f636.txt` | `08edf4698d893f33ff9254cd36125cb28c76bf505b396f77ba2056efb0e1cc62` |
| `15-bridge-comparison.json` | `6a8d055e3ab4dd7a972d407a60040cdd74a70d2c6e3e33a5d34e8602e467411a` |
| Canonical `../p14a3-20260918/12-test-bridge-f32d56c.txt` | `07b9f9558d544afbfa26e81473c7944554b28d6de2875e40b033d910e9ba8602` |
| Prior independent `14-independent-core-review.md` | `a9c61cc9167391738f3f40c14b28c656a1d2e035fe896fc9cb10f45184f1880b` |

The existing core review stands. Its raw core hash was rechecked unchanged:
`48e621170b00d1dd5530bc326ca5d19ca033452732203a4d47fba9601bd7f77d`.
This task does not repeat that audit or replace its retained limitations.

## Bridge attribution — MET WITH EVIDENCE

The reviewer independently parsed both complete raw bridge logs, expanded every
grouped FAIL identifier separately and compared each full test identifier plus
complete diagnostic/trace text. Only ANSI display escapes and the previously
documented generated exporter-directory suffix normalization were allowed; the
bridge failures require no exporter-suffix substitution. No identifier, timeout
threshold, source trace or diagnostic content was generalized.

There are **12 baseline and 12 candidate identifiers; all 12 have exact matching
diagnostics; zero new/changed failures, zero absent baseline failures, zero
duplicate identifiers**. Every individual candidate/baseline diagnostic and
diagnostic SHA256 in `15-bridge-comparison.json` agrees with the independent
extraction. The entire normalized failure section is also byte-identical, SHA256
`849e7f5d0f7c0d0e98414e032f487c4fbd8f4248264abd8459fe234f7cce7dab`.

The exact inherited groups are eleven tests in
`tests/bridge-p12-campaign-library.test.ts` (nine 5000ms timeouts and two 20000ms
timeouts), and the Save As/inactive/renamed/new-campaign isolation test in
`tests/bridge-p13-campaign-isolation.test.ts` (60000ms timeout). Complete individual
names and error text are retained in the pinned comparison JSON, not reduced to
counts for attribution. These diagnostics provide no further execution trace;
the reviewer does not invent one or infer which later assertions ran.

The completed bridge stage reports **72 files: 70 passed, 2 failed; 775 tests:
761 passed, 12 failed, 2 todo**, exit **1**, signal null. Raw start is
`2026-09-19T17:54:20.093Z`, end `2026-09-19T18:27:20.789Z`, duration **1979.63s**.
The independently counted 70 passing-file records agree with the footer.
Scanning the complete log found no Failed Suites, Unhandled Error(s), Unhandled
Rejection or Uncaught Exception diagnostic.

Positive checks are actual full-bridge observations: all **19** cases in
`tests/bridge-p14b3-promise-command.test.ts` passed (raw line229), and all **61**
cases in `tests/bridge-runtime-checkpoint.test.ts` passed (line25). The latter
includes the strict independent historical-identity array with the genuine
outgoing45 literal; it was inspected in core review14 and remains unchanged.
No corrective test edit or retest is indicated by this bridge result.

## Sealed full-run identity and prerequisite checks — MET WITH EVIDENCE

The complete run spans `2026-09-19T16:52:49.457Z` to
`2026-09-19T18:27:20.807Z`. The sealed metadata records identical start/end HEAD
`359f6361c130e7d0b2808e2d82d328843c9e90a3`, `fixedSource: true`, no untracked
protected source at completion, and the SHA256 of the empty protected diff at
both endpoints: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
End-of-run dirt is documentation/evidence only, not a clean-whole-worktree claim.

The runner was read, not executed. Its protected set covers `src`, `bridge`,
`tests`, `ui`, `generated`, `scripts`, package/lock files, Vitest config/workspace
and root/bridge TypeScript configs. Independent current read-only Git checks
confirm the same HEAD, an empty `git diff HEAD` over that exact set, and no
untracked files in that set. The runner's six command intervals are serialized;
every raw header, start/end timestamp, exit and signal matches its metadata row.
All command error fields are null.

Complete raw prerequisite logs01–04 were read. Root/UI typecheck and bridge
typecheck each exited0. Contract verification exited0 and verified the JSON
schema, generated C# DTO and manifest. Contract-fixture verification exited0 and
verified the generated union fixtures. No TypeScript error is present in those
logs. The inspected manifest remains protocol4/projection46, schema
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`,
generated C# SHA256
`1b5c7e889ffe3454858afa8960b4a4c099d88cfe25a9553212ba67f11a4c3268`.
These generator checks are not Unity compilation or native verification.

Core summary consistency: **308 files, 301 passed/7 failed; 3338 passed/22 failed/
6 todo tests**, exit1. Review14 established all22 exact historical signatures,
all34 new B3 cases passing and the checkpoint file passing. Core includes bridge
files, so core and bridge totals must not be summed as distinct tests.

## Disposition and limits

The parent's completed-but-review-pending `17-attribution.md` was inspected after
handoff and agrees with the sealed metadata, raw results and independent
comparisons. Its remaining independent-review condition is satisfied by this
KEEP. No new source/test correction is requested. Qualified **LOGIC VERIFIED ·
UNITY NOT VERIFIED** is supportable for the bounded B3 slice with the inherited
failures and limits preserved; final documentation/publication remains the
parent's next action, not something performed by this reviewer.

Exact historical timeouts establish attribution only: not identical causes,
performance equivalence, completed assertions or a green suite. Core's inherited
three digest failures, six absent private-fixture ENOENTs and missing-PIL exporter
failure likewise remain unresolved with their blocked behavior unverified.
Nothing here accepts B-F2/P2 drafts, the rest of P14, Unity handwritten code,
rendering, native UI/UX or Owner acceptance. The future B-F2 source writer remains
gated on the parent's qualified closeout/publication and separate ownership handoff.

Reviewer activity: read-only source/evidence inspection, lightweight independent
log parsing/hashing and this sole authorized documentation write. No engine,
tests, probes, typechecks, installs, network, source/test/config edits, commits
or delegation were performed.
