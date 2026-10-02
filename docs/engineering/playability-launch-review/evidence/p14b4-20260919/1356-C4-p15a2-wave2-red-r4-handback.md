# 1356-C4: P15A.2 Wave 2 slice 2a RED, revision r4 (answers 1356-F5)

**Status: DONE, unexecuted.** I ran no measurement because `HEAVY-LANE-LOCK` held the heavy lane from my first check at 20:08:57 CDT. The coordinator then told me to finish r4 without tests, because the recorded core gate, the UI gate and §7 hold the lane for hours. No vitest or tsc ran for r4. The parent's 1356-X3 runs the harness file alone at RED and at the reference.

In the scratch tree `tree/`, `main` moves from a5bd03c (r3) to fb7a38e in one commit, tests only. Branch `ref` stays at 61f13b2, and the reference patch is unchanged (sha256 83cb2a59…). No temporary branch exists, and `main` is clean.

## The change (fb7a38e)

H and A mean the harness and archive test files at fb7a38e.

| File | Change |
|---|---|
| H | `campaign()` (H:46-62) reads `performance.now() - started` after each `tick` and throws `CEILING: week <W> reached after <N> ms, past CEILING_MS 300000 (1356-F5)` once the time passes `CEILING_MS` (H:53-56). After `validate(save)` (H:83), the leaf asserts that campaign, makeSave and validator milliseconds sum to at most `CEILING_MS`, with a message naming each part (H:90-93). `CEILING_MS` stays the `it` timeout (H:95). |
| H | The BUDGET note (H:15-23) gives the reason. The body is synchronous, and `withTimeout` in `@vitest/runner` 2.1.9 calls the body before it builds the timer (`node_modules/@vitest/runner/dist/index.js:37-48`), so the `it` timeout cannot fire. "Run it alone" stays at H:8 and H:22-23. |
| A | One header note, TIMEOUTS (A:47-50): `HEAVY` and `MEDIUM` are vitest timeouts, not budgets, and neither can stop a synchronous body. Nothing else in A changed. |

Four choices inside the ruling:
1. The ceiling check runs after the week-13 `archiveOf` probe in the same iteration, so the RED stays the week-13 `archiveOf` error.
2. The sum assertion follows the proof line, so a breach still prints the bytes and times.
3. A's note gives two reasons. A also has async leaves whose campaigns run after an `await`, once vitest has armed the timer, and a timer never interrupts running code.
4. No header tag this time. 1356-F5 says A changes nothing else, and H carries only the D-1 fix.

## Expected results for 1356-X3, by reading

- **RED.** `rank-bounded-harness` fails at week 13 with `RED: the state at week 13 has no top-level powerRanking root (1356-A §5)`. Thirteen ticks take far less than 300,000 ms, so the CEILING check cannot fire first.
- **Reference.** The leaf passes while campaign, makeSave and validate sum to at most 300,000 ms. 1356-X2 measured 65,404, 825 and 317 ms, a sum of 66,546.

## Classification

The file keeps r3's 72 rows in order, with the 2 controls. One row changes. `rank-bounded-harness` adds `1356-F5 :6-14` (the in-leaf ceiling), and its expected RED failure stays the week-13 `archiveOf` message.

## Hashes

- `1356-p15a2-wave2-red-r4.patch` (`git diff 45b2782..main`, 4 files under `tests/`): sha256 `32397525d8c178eab61de834af08c1b2936f530e594cb144053d9bde710bf8f1`
- `1356-p15a2-wave2-red-r4-classification.json`: sha256 `ad40421c35911a477b88e44bb2f0e15bcab6dd59696cee87e33fa8a489d8f26f`
- `reference/1356-reference-r2.patch`, unchanged: sha256 `83cb2a59d207f8f9b1da12a90bc3b712d40fdf1943c222b4ac73cf56dd700884`

## Real HEAD

The r4 patch passes `git apply --check --cached` at real HEAD 469a9547 under a temporary index, since deleted. Since the base ff05430d, one commit there touches `src` or `tests`: cec3902c, the Save43 pin sweep, which changes tests only. It edits `tests/helpers/p14c3-fixtures.ts`, but only the `saveApi` key and the `envelope38` version pin. `migrated()` and `c3Raw()`, which case (c) calls, are unchanged.

## Not run

- No vitest or tsc ran for r4. My poller (a scratchpad script that checked every 60 s) saw the lock and six vitest processes at every check, the last at 20:20:17. I stopped it at 20:20 after the coordinator's message.
- Compilation is UNVERIFIED, as in r3. r4 adds no import: H already imports `performance` (H:25).
