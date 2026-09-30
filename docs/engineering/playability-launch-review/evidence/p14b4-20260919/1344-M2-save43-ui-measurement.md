# 1344-M2: recorded broad UI measurement after Save43 shelving (r2), with attribution

## Run identity

`vitest run --project ui`, recorded as [1344-save43-broad-ui-r2](1344-save43-broad-ui-r2.json) at source and HEAD
644b9038 (equal to the remote at preflight). PATH carried the 1345-E environment (`.venv`, Python 3.14, Pillow 12.3.0,
no numpy). It ran 03:37:14Z to 05:37:54Z, exit 1, empty tested diff, `fixedSource: true`, `allGuardsExact: true`.
Raw [1344-save43-broad-ui-r2.txt](1344-save43-broad-ui-r2.txt), 254,566 bytes, sha256 ee85facc06c2530a…

Tally: **11 failed files, 18 failed tests, 2674 passed, 5 skipped** (2697), **0 unhandled errors**. The run took
7,238 s against 1343's 1,113 s. The machine swapped throughout (load average up to 97, under 100 MB free), with the
Save43 sweep authors and other sessions running beside it. Attempt 1 is void on ENOSPC ([1344-M2 attempt 1](1344-M2-ui-attempt1-enospc.md)).

## Attribution against 1343 ([1344-I2-ui-vs1343.json](1344-I2-ui-vs1343.json))

Parser: [1317-I-attribution.py](1317-I-attribution.py), unchanged, output [1344-I2-ui-failures.json](1344-I2-ui-failures.json).
Comparison: [1344-I-compare.py](1344-I-compare.py) by identity. **15 new, 3 changed, 0 same, 7 gone.**

Source change since 1343 (6b73e424): `src/core` only (shelving steps 1-5, P15A.1, P15A.2 and P15B Wave 1 pure laws),
plus the U3 test change `8b984d12` in `StudioLotIdentityReview.test.tsx`. No UI component changed.

| Class | Rows | Cause |
|---|---|---|
| Save43 pin | 11 new | `expected 43 to be 42` |
| Pillow present, numpy absent | 3 changed, 7 gone | environment of 1345-E |
| Intermittent under parallel load | 4 new | timing; see below |

### Save43 pins (11): the UI section of the sweep

Eight direct sites in six files, plus three rows through a helper the sweep's helpers group already edits:
- `ui/src/saves.test.tsx:126`
- `ui/src/session.test.tsx:332`, `:360`, `:387`
- `ui/src/engine/d17-save-migration.test.ts:131`, `:155`
- `ui/src/engine/film-chronicle-adapter.test.ts:289`
- `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts:46`
- `ui/src/screens/StudioCalendar.career.test.tsx` U1-U3, all at `acceptedEvidence`
  (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17`, via `tests/helpers/p14c3-surface-fixtures.ts:50`)

### Environment (3 changed, 7 gone)

1343 ran without Pillow. With the 1345-E environment, seven Pillow rows pass: `authored-stage-a` 4-7 and
`authored-rgba-export` current-production 3-5. The three tool-contract rows 6-8 now fail on
`missing dependency (No module named 'numpy')`, as [1345-E](1345-E-pillow-environment-result.md) recorded. numpy
stays an open Owner question.

### Intermittent rows (4)

Each row failed in the broad run and passed in at least one later run at the same source. Diagnostic outputs are in
[1344-M2-diag/](1344-M2-diag/). "Four files" means the four files below run together in one Vitest invocation.

| Row | HEAD, broad | HEAD, four files (3 runs) | HEAD, alone | 6b73e424, four files (2 runs) |
|---|---|---|---|---|
| `livingTurn.scheduler` "runs 12 consecutive weeks …", 15 s budget | × 17.5 s | ✓ 18.3 s, × 17.9 s, × 19.6 s | not run | × 18.2 s, ✓ 15.8 s |
| `StudioLotScreen` "moves Hollywood keyboard focus …" | × | × , ✓, ✓ | ✓ file ×2, ✓ leaf ×2 | ×, ✓ |
| `WorldFirstLiveWeekAdvance` "returns a real building-origin deep route …" | × | ✓, ×, ✓ | not run | ✓, ✓ |
| `WorldFirstStudioHome` "carries Lot root through … Talent Hub", 30 s | × after a 6,077 s stall | ✓, ✓, ✓ | not run | ✓, ✓ |

- **livingTurn 12-week: pre-existing budget edge.** Its body runs 15.8-19.6 s against a 15 s budget in every run,
  1343 included (16.2 s, passed). It fails or passes by where the timeout lands, at 6b73e424 as at HEAD. When it
  fails at 6b73e424 nine later livingTurn leaves fail as its cascade.
- **StudioLotScreen focus: pre-existing intermittent.** It fails at 6b73e424 too (run 1). The leaf asserts
  `toHaveFocus()` without a wait, straight after a `waitFor` on the status text.
- **WorldFirstStudioHome: environment.** The broad run shows a 6,077 s duration for a leaf that takes 0.3-2.6 s
  elsewhere, which is the swap stall. It passes in all five later runs.
- **WorldFirstLiveWeekAdvance deep route: open.** `findByTestId('studio-lot-screen')` gives up after its wait in 2
  of 4 HEAD runs. It passed in both 6b73e424 runs. Two runs cannot show whether it was intermittent before shelving,
  so its attribution stays open. The recorded UI gate after the sweep re-measures it on a quiet machine.

## Consequence

- The Save43 sweep (1344-N) gains a UI section: the eight direct sites above. The helper edit covers the three
  StudioCalendar rows.
- No row points at the shelving law itself. The deep-route row is the one unresolved attribution.
- The recorded UI gate after the sweep runs alone on a quiet machine, as the core gate does.
