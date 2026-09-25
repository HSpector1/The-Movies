# 783 — P14C.2a independent source review (contract-auditor), persisted by the parent

Candidate: implementation `ad154f5b` (RED `0ee95a08`, scaffold base `947d8b5c`); src diff sha256
`68af54de…` (verified equal to the writer's reported identity). Reviewer: contract-auditor role contract run
through a general-purpose agent (project roles not registered in this session), model Sonnet. Returned
2026-09-25 ≈20:25 CEST.

**Process deviation, disclosed by the reviewer:** its profile allows Read/Glob/Grep only; it used Bash for
read-only `grep`/`git log`/`git diff --stat`/`git show --stat` to confirm file identity. Nothing was written
or executed beyond inspection. Recorded as a tool-allowlist breach, not hidden.

## Verdict: KEEP — no demonstrated defect

Every D1–D16 row and every 777 §5 consumer traced MET WITH EVIDENCE (file:line in the reviewer's report,
summarized): windows and horizon `tuning.ts:412-419`; idle `careerLifecycle.ts:118-128` (inclusive `w − 104`
verified algebraically; reads intervals, never `employmentStatus`); E `careerLifecycle.ts:97-110,200`; cap on
every writer (`actions.ts:2508`, `:2597`; `talentMarket.ts:1117`; `hollywoodTick.ts:112,133,141-142`;
`hollywood.ts:227-228`); market `talentMarket.ts:84-97,1253-1268`; seat cap `actions.ts:347-350`,
`hollywoodTick.ts:183`; fail-loud retire `careerLifecycle.ts:133-142`, traced UNREACHABLE from a lawful state
under D7 (a regression guard, not dead code); listings `employment.ts:359-363,397-431,450-460`; validator and
conversions `save.ts:9336-9486`. Out-of-scope paths untouched (`promises.ts`, projection, `generated/`); bridge
and UI edits are mechanical live-route swaps. No RNG or module state; `state.talent` never filtered.

Sanctioned deviation: `enterRival` implements 777 §5's cap-based skip, not 773 B5's literal "skips announced
people"; an announced free agent with `E ≥ week + 208` stays pickable. MET against 777, disclosed by the
writer (779 risk 4).

## Performance notes (not defects)

- `idle()` scans the whole world employment history per in-window birthday; grows with accumulated history.
- Settlement iterates every record ever written, every week (D12 forbids compaction); cheap per record.
- `withdrawnPersonIds` rebuilds a Set per listing call, the same class as `busyTalentIds`.

## Test-coverage gaps found (drive the follow-up task)

1. **The RED does not verify the tick wiring.** `tests/helpers/p14c2a-fixtures.ts:143-147`
   `stepWeekWithLifecycle` calls `advanceCareerLifecycleWeek` AGAIN after `tick()`; idempotence makes it
   harmless, but A1, A2a, A2b, A5, E1, E2 and F1 would all still pass if `tick.ts`'s own wiring were removed
   or misordered.
2. G4 covers 5 of 9 validator causes (untested: duplicate person, contract past E, status/week mismatch,
   Scientist record).
3. P1 has no rival-authored complement.
4. Amendment A1: the "stays listed at exactly `CONTRACT_MIN_WEEKS` remaining" boundary is unasserted.

Preference: `convertV34ToV33`'s messages say `migrateToV33:` (the V33→V32 precedent uses the same
`migrateToV32:` form, so this follows the file's existing convention).
