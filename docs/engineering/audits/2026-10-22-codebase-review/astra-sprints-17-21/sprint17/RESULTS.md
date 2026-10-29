# Sprint 17 — recoverable rival studios (2026-10-29, IN PROGRESS from 08:05 CDT)

Decision A (ENTRY.md): the 4a direction, a bounded exit/restart policy for 1363-F cost cutting. Candidate commit 60531b94 on p18-season-20261028 (pushed). Parent 6da4206a.

## Diagnosis reused (corrected)

The retained Sprint 14 harness output (studio-scratch/sprint14-20261028/harness-r2/out/rival) and playtest-response/MEASUREMENTS.md §4c with its dated correction: 25 of 25 cutting rivals closed with no further greenlight. Each entered with its team intact and cash above the operating reserve (the commission's package was unaffordable under the larger commission reserve, weeklyCost × max(reserveWeeks, draftWeeks + PRODUCTION_TICKS + 1)); the R3 release law then shed its people with real termination charges; weekly cost fell to the facility and overhead floor; cash burned to negative over 33 to 109 weeks; at distress each took the O6 loan (1.0 to 1.4 M), which cleared cutting for one evaluation, and re-entered the same week because the entry law held at negative cash; each closed 40 to 50 weeks later. No producer resumed commissioning or hiring between entry and distress: the only exits were a greenlight the shed team could not stage and a loan that came too late and too small.

## The rule (src/core/hollywoodPolicy.ts, src/core/hollywoodTick.ts)

- Cadence (`rivalCostCuttingRestartDue`): a cutting rival is examined at a decision week when the weeks since entry are a positive multiple of TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS (26), the existing interval for re-examining a stalled screenplay. Provisional hysteresis, stated in the policy comment: nothing is examined before one interval has passed and every 1363-F restriction holds between examinations.
- Examination (`restartWouldCommit`): the ordinary staffing, admission, research and decision laws run once on private copies of the business and the industry registry with the restrictions lifted. It passes only if that pass would commission a screenplay or greenlight a film this week. Nothing from the copies is kept.
- Exit: when the examination passes, `costCutting.since` is cleared before the real staff()/decide() pass of the same week, which repeats the same deterministic laws on the real records: every hire pays its signing bonus against the reserve, every commission and greenlight pays its own cost, and the entry law may re-enter cutting at a later decision.
- Unchanged: the 1363-F entry law, the R3 release law and its charges, the greenlight exit, the 1366-O O6 loan exit, O1 facility disposal, the validator's cost-cutting invariants. No subsidy, no cash injection, no lending, no replacement rivals, no minimum population, no change to any tuning constant.

## Evidence

| Item | Result |
|---|---|
| RED at the parent 6da4206a (local/astra17-red-at-6da4206a.json) | the cadence seam is missing (`expected 'undefined' to be 'function'`); the restart case fails by assertion (`cutting ended: expected 3 to be null`); the no-opportunity case passes on both trees (a regression control) |
| GREEN at 60531b94 (local/astra17-green-at-60531b94.json) | 3 of 3 pass; root and bridge typecheck exit 0 |
| Demonstration route (tests/astra17-rival-restart.test.ts, p13a-core-causal-01, rival row one; a labelled synthetic entry at week 3, then natural ticks) | entry: cash 24.44 M, weekly cost 97.7 K, team of six, one ready screenplay. Week 3 pass: the release law shed all six (termination 1,305,330), weekly cost 38.5 K; the O1 refund 450,000 arrived during the episode. Weeks 4 to 28: cutting holds, no hire. Week 29 (26 weeks after entry): the examination passed; the ordinary pass re-hired the rival's own six former people at fresh offers (signing 470,104; receipts reason `renewal`), greenlit the ready screenplay (production 3,304,115 and marketing 758,393 paid) and commissioned a new one, cash 17.95 M afterwards. The film released at week 37; through week 150 the rival never re-entered cutting, released repeatedly (production spend 22.6 M, studio revenue 31.8 M, cash 14.27 M). No loan was taken. The save round-trips through exportSave/importSave/migrateToLive byte-for-byte under stable serialization |
| Contrast (genuine v42 week-130 stall fixture, rival r01: 18.4 M cash, a full index of market-rejected screenplays) | examined at the interval, no commission or greenlight possible, cutting continues, no hire, no loan, no film; the save validates |
| Lane sprint17-r1 (studio-scratch/astra-20261029/sprint17-r1, snapshot branch astra17-snapshot-20261029 = 60531b94 + the unchanged Sprint 14 harness scripts, bound 8892b693; lane/sprint17-r1/) | 08:20:47 to 08:26:18 CDT, exit 0. Focused core: 19 files, 444 passed, 2 skipped, 0 failed (focused-core.json). Natural routes: RIVAL-RECEIPT MEASURED, determinism identical; all four per-week rival samples (p13-public-commercial-adoption 520, p13b-s8-bridge-probe-01 520, p15a1-w2-market-01 default 1366 and closure-deferred 6240) are byte-identical to the retained Sprint 14 harness-r2 output: no natural cutting rival passed an examination; every closure, loan, greenlight and charge is unchanged |
| Independent review of 60531b94 | RUNNING (one Opus 5.5 read-only reviewer) |

## Why no natural rival restarts (read from the weekly samples, lane/sprint17-r1/out)

At each examination week the shed team is gone and cash is far below what the ordinary laws need. p13-public-commercial-adoption r03: entry at 242 with 4.74 M, weekly cost 121 K, six people, an average film of 3.11 M over 19 films; the R3 releases at entry charged 1.84 M; at the examinations (268, 294, 320) cash was 2.34 M, 1.18 M and 0.03 M at 38.5 K per week with nobody employed. r04: entry 4.32 M, average film 3.55 M, termination 1.22 M, examinations at 1.24 M and −0.06 M. r02: entry 4.45 M, average film 4.18 M, examinations at 0.75 M and 0.47 M. The p15a1 rivals never greenlit a film in their lives (0 films, 6 to 14 commissions each; the low-market seed) and sat at 0.4 to 2.5 M at their examinations. A restart under the ordinary laws needs the signing bonuses for six people, the commission reserve (weekly cost of the restored team × max(reserveWeeks, draft + 9)) and an affordable package of the rival's kind (3 to 4 M here): roughly 6 M of cash. No measured rival had it; the first examination already finds about half the entry cash because the release law's termination charges (1.2 to 1.8 M on 208-week contracts) are paid at entry.

Reading: the policy is correct to the decision (an exit exists exactly when the ordinary laws would restart; nothing is forced) and the measured routes contain no lawful restart opportunity under the existing affordability and release laws. The one concrete follow-up question for the Owner, outside this sprint's bounds because it changes the release law: should a cutting rival with a viable-but-cash-blocked package retain its film team (so that the restart examination can find the team and the team's cost does not return as termination charges)? Not implemented; not assumed.

## Claims so far

- LANDED (candidate): the restart examination, source-bound at 60531b94; red at the parent by assertion; green with typecheck.
- MEASURED (constructed, labelled entry): one legitimate restart with real costs and a real recovery on the p13a world; one genuine stall fixture that stays in cutting.
- MEASURED (natural): the four Sprint 14 rival arms are byte-identical under the new policy; no natural rival restarts, borrows differently or closes differently; the reasons are in the section above.
- REGRESSION: the nineteen affected core files pass in the lane (444 tests), source-bound at 8892b693.
- PENDING: the independent review; the full gate on the checkpoint.
- NOT CLAIMED: survival of any natural rival; the natural C-08 witness (not pursued; scope limit retained); Owner acceptance.
