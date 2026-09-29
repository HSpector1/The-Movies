<!-- 1351-J2: confirmation (contract-auditor, read-only) of the 1351-J items, saved verbatim by the parent from the agent's final text -->

# Independent review 1351-J2

**Scope:** confirmation of 1351-J's two blocking defects only, against `1351-F2-parent-response-to-1351-J.md`, `1351-C5-p15a2-red-error-handling.md`, `1351-stage/1351-p15a2-red-r5.patch`, `1351-X6-red-r5-dry-run.md`, and `1351-runs/1351-X6-red-r5-over-production-r2.txt`. Production candidate (`1351-p15a2-production-r2.patch`) is unchanged from 1351-J's review.

**Verdict: KEEP**

## (1) Blocking defect 2 (fail-loud paths untested) — CLOSED, MET WITH EVIDENCE

I read the full 13-leaf `describe('p15a2 power ranking: error handling (1351-C5)')` block (`1351-stage/1351-p15a2-red-r5.patch:1251-1476`) and traced each leaf by hand against `computePowerRanking`'s actual execution order in the production r2 patch I already reviewed (studio-loop validation → film-loop validation → per-row `financialStrengthBand` call):

- All 11 named-condition leaves assert a **message-specific substring** (`toThrow('weeks must be integers')`, `toThrow('has a non-integer entry week')`, `toThrow('studio DUP appears twice')` vs. `toThrow('film DUP appears twice')`, etc.) — never a bare `toThrow()`. I checked every fixture against the guard order in the source and confirmed each one isolates exactly the intended condition (e.g. `error-handling-non-integer-release-tick` uses `studios: []` so no earlier studio-loop guard can fire first; `error-handling-critic-score-outside-range` uses valid default `releaseTick`/`totalGross` so only the critic-score guard is exercised at -1/101/NaN). Condition 3 (`week`/`originWeek` share one guard) is correctly split into two leaves, each breaking only one field, per the parent's own directive.
- `error-handling-no-private-balance-in-thrown-messages` (lines 1391-1436) forces four throws — the two finance-specific guards **and** two unrelated guards (duplicate-studio, non-integer-enteredWeek) on a studio object carrying both probe values. I re-read all four production throw statements directly: `cash must be finite` and `weekly fixed cost must be finite and non-negative` are static strings with zero interpolation; `studio ${s.studioId} appears twice` and `studio ${s.studioId} has a non-integer entry week` interpolate only `studioId`. None can carry `987654321` or `123456789` by construction — the leaf is non-vacuous, not merely checking the two obvious finance guards.
- `error-handling-deep-frozen-input-survives-call-byte-identical` (lines 1438-1475) recursively `Object.freeze`s the input, asserts the call doesn't throw, `rows.length===2` (the call actually ran), canonical JSON is unchanged, and every frozen node is still frozen. Since strict-mode mutation of a frozen object throws immediately, this would fail loudly — not silently pass — if production ever wrote into `input.*`. I re-checked the production source: the only array operation on caller-supplied data is `input.studios.map(...)` (non-mutating); the FILM_CAP sort runs on a freshly-built local array (`finished.get(...) ?? []`), never on `input.films` itself. Consistent with a genuine pass, not a coincidental one.
- Independent execution evidence: `1351-runs/1351-X6-red-r5-over-production-r2.txt` — parent-run (not writer-self-reported), `tests/p15a2-power-ranking.test.ts (46 tests)` + harness (2 tests) = **48/48 passed**, matching 33 pre-existing + 13 new. This is the same class of independent confirmation (parent execution, raw output read directly) as 1351-X5.

Defect 2 is closed. No remaining gap.

## (2) Blocking defect 1 (TUNING ranges) — plan is correct with one bound to fix before commit

Checked the parent's proposed seven range statements against the actual "Ranges" assertions in `tuning-power-ranking-bounded-terms` (`1351-stage/1351-p15a2-red-r5.patch:386-394`, unchanged from r4):

| Proposed comment | Test assertion | Match |
|---|---|---|
| `WINDOW_WEEKS > 0 (integer)` | `toBeGreaterThan(0)` | bound matches; "(integer)" is not independently asserted by this leaf (only by the separate exact-value pin `.toBe(52)`) |
| `FILM_CAP > 0 (integer)` | `toBeGreaterThan(0)` | same as above |
| `RELEASE_CAP > 0 (integer)` | `toBeGreaterThan(0)` | same as above |
| `CRITIC_SHARE in (0, 1]` | `toBeGreaterThan(0)` + `toBeLessThanOrEqual(1)` | exact match |
| `REACH_SCALE > 0` | `toBeGreaterThan(0)` | exact match |
| `BAND_STABLE_WEEKS > 0 (integer)` | *(no standalone assertion exists)* | **wrong as stated** |
| `BAND_THRIVING_WEEKS > BAND_STABLE_WEEKS` | `toBeGreaterThan(t.POWER_RANKING_BAND_STABLE_WEEKS)` | exact match |

**The key to fix: `BAND_STABLE_WEEKS`.** The r5 leaf never asserts `POWER_RANKING_BAND_STABLE_WEEKS > 0` on its own — the only thing tested about that key is that `BAND_THRIVING_WEEKS` exceeds it (a relative bound, not an absolute floor). Writing "`BAND_STABLE_WEEKS > 0`" in the comment states a range this test doesn't verify standalone. Recommend either: (a) drop the independent "`> 0`" claim and state only `BAND_STABLE_WEEKS: must be less than POWER_RANKING_BAND_THRIVING_WEEKS (not independently floored above 0 by this test)`, or (b) if the parent wants `> 0` stated, add one line to the RED leaf asserting it directly — but per 1351-F2's order the comment commit is test-untouched, so (a) is the one consistent with "stays consistent with the tests" as written today.

Secondary, non-blocking precision note: the "(integer)" qualifiers on `WINDOW_WEEKS`/`FILM_CAP`/`RELEASE_CAP`/`BAND_STABLE_WEEKS` are true of the current values and semantically sound (they're week counts / caps), but the bounded-term leaf's range lines don't assert `Number.isInteger` for any of them — only the separate exact-value pins (`.toBe(52)`, `.toBe(4)`, etc.) incidentally constrain today's values to integers. This is harmless to keep in the comment (it documents an intended future constraint even where the current test is looser), unlike the `BAND_STABLE_WEEKS > 0` item, which asserts something false about what's tested.

## Remaining blocking item

None on the production patch. One wording correction to make in the still-unwritten comment-only commit (drop or rephrase the standalone `BAND_STABLE_WEEKS > 0` claim) before it lands — this is a one-line accuracy fix to a not-yet-applied commit, not a reopened defect against reviewed code.

**Files:** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1351-stage/1351-p15a2-red-r5.patch`, `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1351-runs/1351-X6-red-r5-over-production-r2.txt`, `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1351-F2-parent-response-to-1351-J.md`.
