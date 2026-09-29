# 1341-X: scratch dry run of UI repair U2 (UI project `testTimeout` 30,000 ms)

The parent built the scratch tree from HEAD 67bf8165 by the 1327-C method. It holds an archive of `src`, `bridge`,
`ui`, `generated`, `scripts`, the configs, `AUDIO-PROVENANCE.md`, and `tests/` without fixture payloads.
`tests/fixtures`, `docs`, `node_modules`, `art` and `tools` are linked read-only. The edit is
[1341-u2.patch](1341-stage/1341-u2.patch):
- `vitest.workspace.ts` only, 4 insertions, sha256 35c831bb…;
- a comment and `testTimeout: 30_000` in the `ui` project's `test` block;
- the `core` block is unchanged.
Plan review [1341-B](1341-B-u2-plan-review.md) returned ACCEPT before the edit was made.

## Probes (scratch only, deleted afterwards)

The parent placed one probe in each project. It awaits 6 s, then asserts `1 === 1`:
[before](1341-X-probe-before.txt), [after](1341-X-probe-after.txt).

| Probe | Without the edit | With the edit |
|---|---|---|
| `ui/src/zz-u2-probe.test.ts` | fails, "Test timed out in 5000ms." (5,007 ms) | passes (6,003 ms) |
| `tests/zz-u2-probe.test.ts` (core) | fails, "Test timed out in 5000ms." (5,009 ms) | fails, "Test timed out in 5000ms." (5,120 ms) |

The edit reaches the UI project, and the core default stays 5,000 ms. 1341-B read the same isolation from the Vitest
2.1.9 source: inline workspace projects resolve with `configFile: false`, so the root `vitest.config.ts` never merges
into either project.

## Affected UI checks

The parent ran four files in one command, the way the recorded gate runs them in parallel:
`WorldFirstLotNativeCastingReviewApp`, `WorldFirstWorldInspectorDefault`, `WorldFirstLotNativeNextEventApp` and
`livingTurn.parity` (81 leaves).

| Run | Config | Result | Failures |
|---|---|---|---|
| [base](1341-X-ui-affected-base.txt) | unedited | 79 passed, 2 failed | CastingReview "reviews all six …", "Test timed out in 5000ms." (7,675 ms); 1124-A NextEvent "preserves the exact live-world reaction …", "Unable to find an element by: [data-testid="dashboard-releases-heading"]" (572 ms) |
| [run 1](1341-X-ui-affected-run1.txt) | edited | 81 passed | none |
| [run 2](1341-X-ui-affected-run2.txt) | edited | 80 passed, 1 failed | 1124-A, the same `findBy` failure (3,748 ms) |

Leaves at or above 5,000 ms, edited config, run 1. Every one passes:

| Leaf | ms |
|---|---:|
| World Inspector "never lets any place print its blocks out of the canonical order" | 19,410 |
| NextEvent "orients a cash stop to Administration …" | 13,398 |
| parity "exports FOUR byte-identical saves …" | 11,433 |
| CastingReview "greenlights the canonical Package …" | 9,899 |
| CastingReview "reviews all six event-owned observations …" | 9,616 |
| parity "(a) by hand at the seam …" | 9,024 |
| parity "(b) by the living loop at 1× …" | 7,682 |
| CastingReview "rebuilds an imported pending review …" | 7,678 |
| CastingReview "dispatches the first same-title session …" | 6,917 |
| parity "(c) paused and resumed arbitrarily …" | 6,850 |
| parity "(b′) by the living loop at 4× …" | 6,639 |
| NextEvent "keeps a generic contract stop spatially neutral …" | 6,605 |
| NextEvent "keeps an exact non-release stop on one mounted world …" | 6,524 |
| World Inspector "never navigates from any of the nine places …" | 6,440 |
| CastingReview "keeps the complete blocked world action available …" | 6,274 |
| CastingReview "keeps a blocked acknowledgement …" | 6,006 |
| World Inspector "reaches the canonical deep screen ONLY …" | 5,708 |

The slowest leaf used 19.4 s of the 30 s default.

## Readings

- **Measured:** with the unedited config, several leaves passed above 5 s (base run: "rebuilds an imported pending
  review" 6,599 ms, "never navigates …" 5,500 ms), and one was cut off at 7,675 ms. The parent infers that the
  5 s timer fires only when a body yields, which would explain which leaf a gate cuts off. The dry run does not
  isolate this.
- **1124-A is not a timing row.** Both of its failures here are the `findBy` wait for `dashboard-releases-heading`.
  They came at 572 ms and 3,748 ms, far under either budget. It passed once under the edit (run 1) and failed once
  (run 2). U2 claims nothing about it, and it stays its own open intermittent, as 1341-A rule 3 says.
- 1341-B's Check 5 cites [1336-F](1336-F-parent-response-to-1336-J.md) for 1124-A's mechanism. 1336-F covers the
  `livingTurn.parity` row, not 1124-A. No record has isolated 1124-A's mechanism.

## Not run here

- The full UI project. The recorded gate after application runs it; it is the comparable suite to 1339.
- The core project. The probe shows its default unchanged, and 1341-B found the projects structurally isolated.
- Type gates: `vitest.workspace.ts` is outside the root, UI and Bridge `tsconfig` includes, so no type gate reads it.
  Vitest loaded the edited file in all three edited runs.

Next: independent review 1341-D, then application (1341-E) and the recorded broad UI gate.
