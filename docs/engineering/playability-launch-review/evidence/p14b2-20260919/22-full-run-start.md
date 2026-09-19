# B2 full fixed-source verification — actually launched

Published checkpoint `bee7e22f3e1fa402c920cc6c274152256487387f` includes production/
tests `3b978d77c29df2b5de038e3b1b7fc94778257f33`; push6d23466→bee7e22 succeeded,
fresh remote read returned EXACT bee7e22. Clean worktree at launch, no overlapping
runtime. Normal sandbox escalation granted for the server-inclusive suite after
the disposable sandbox localhost preflight returned EPERM.

Command: `node docs/engineering/playability-launch-review/evidence/p14b2-20260919/run-fixed-source.mjs p14b2-20260919-final`.
Actual start `2026-09-19T14:35:26.703Z`; exec session34647. Parent owns sole heavy
runtime. Progress/result: `../p14b2-20260919-final/00-run.json`, per-command raw
logs alongside. ALL repository source/tests and HEAD frozen until completion.
Docs-only notes may change; no commit until the runner seals its fixed-source
check. Never launch a duplicate full run based on an old status paragraph.

Order: root/UI typecheck, bridge typecheck, contract check, fixture check, core
all tests max2workers, bridge tests max2workers, SERIAL. Forecast ~90min from
previous89min observation, not a timeout waiver or guaranteed finish time.

At completion: read exit codes/summaries/unhandled failures and exact identity
hashes. Use existing `../p14b1-20260919-t4/compare-failures.mjs` against canonical
historical `../p14a3-20260918/11-test-core-f32d56c.txt` and corresponding12 bridge
log; also retain previous T4 full results as recent context. Expected historical
set22core/12bridge is NOT a blanket allowance: exact names+diagnostics required,
and matching timeouts do not prove unexecuted assertions or equivalent speed.
Investigate every new/changed failure, preserve all raw evidence, then qualified
closeout/backlog/records/commit/push/remote verification before B3 implementation.

B3 independent drafts remain outside checkout at `/tmp/studio-b3-tests-jWA61F`:
core9cases SHA256 `bb104d96af97c55e9385c332e080c287c953b088721b08134a65b6b5b5dd19ba`;
bridge18cases SHA256 `362fb235ca47766453869d21d156efa5498d1b2a983825d204c966b80de9323b`;
brief SHA256 `c36a7fee3356ada56aaf76361a7b4985ac691d38004e2a5e66e431bb9a05c493`.
No runtime/install claim. Auditor reviews these immutable drafts read-only while
the full run proceeds. B2 qualified closeout remains the gate; no new policy choice.
