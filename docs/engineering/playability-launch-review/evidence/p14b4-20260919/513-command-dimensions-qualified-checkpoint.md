# 513 — Qualified command-dimensions checkpoint: 507–512 on fixed source 34a8db7

2026-09-20. Claude Code parent after the runtime transfer recorded in 506. The frozen 505
source `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a` was tested as
commit `34a8db7b2a82eb9e9a495bb41f8089dcdbffc6d1` (IN-PROGRESS recovery commit, pushed and
exact-remote verified by `git ls-remote` at 14:14:37Z). `git diff 80aec8b 34a8db7 --binary`
over the record-check source paths reproduces the protected patch
`b6bcfff304a93651577fa662b12e42e6a6e5ecb2007f65a4fa125371a540aa07` byte for byte, so the
tested identity IS the recorded 505 candidate. During every run the working-tree patch was
empty (SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) with no
untracked source. The plan (507 = 495 args, 508 = 496, 509 = 494, 510 = 497, 511 = 498,
512 = 499) is the one the previous coordinator stored at 12:53:29Z before exhaustion.

## Results — serial, one process at a time, `record-check.mjs`, all fixedSource:true

| Check | UTC interval | Exit | Actual result | 494–499 baseline on 492 |
| --- | --- | --- | --- | --- |
| 507 six Ready files | 14:15:40.815–14:15:57.113 | 1 | 17 PASS; sole original stale-after-release FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234`, `expected 'workLimit' to be 'commandRefused'` | identical (495) |
| 508 six Started files | 14:15:57.328–14:16:14.354 | 0 | 28 PASS: 27 original + additive 504 same-week duplicate-commit control | 27 PASS (496) |
| 509 root + UI typecheck | 14:16:14.538–14:17:38.224 | 0 | PASS | PASS (494) |
| 510 seventeen adjacent/caller files | 14:17:49.182–14:18:28.571 | 0 | 203 PASS | 203 PASS (497) |
| 511 bridge types | 14:18:28.769–14:18:59.690 | 2 | sole OLD future-P2 kind TS2353 at `tests/bridge-p14b4-cast-class.test.ts(364,20)`; no other diagnostic | identical (498) |
| 512 facts + employment lookup | 14:18:59.934–14:19:07.421 | 0 | 7 PASS | 7 PASS (499) |

255 focused passes (254 + the 504 case). The original 276 first-take + shared-kernel test
remains GREEN (507, 3947 ms). No new failure, no new diagnostic, no cap, timeout, assertion,
fixture or expected-failure change. Intervals disjoint and ascending; every start/end
`sourceSha` is 34a8db7; every patch empty at start and end. Complete raw output and JSON
read for all six. This is not a whole-suite pass and not B4, live P2, Unity or Owner
acceptance.

## Review status

506 Codex contract-auditor verdict Qualified KEEP was recovered verbatim from the local
thread log; the independent Claude contract-auditor verdict is recorded in the 506 record.
Only 21 pinned test/owner/kernel files were untouched by construction: the recovery commit
changed exactly `src/core/promiseCapacityOwnerReplay.ts` and
`tests/p14b4-started-replay-background-command.test.ts` under source paths.

## What 505 did NOT do

The original stale route still cuts at workLimit; 505 inherits no claim of fixing it.
The reached boundary on the 505 source is NOT yet measured. The archived 500 probes
measured the 492 source: week 8 `dimensions` finished at 199381 and `frame` cut at
199996 requesting 15, before the setup collector, Post-exit bill or owner. The two
command discoveries then cost 4542 and 3176; the 2221 gross omitted fact units are not
net saving because cold discovery can shift into the next full frame.

## Next exact action

514: temporary passive, unmetered observation on the frozen 505 source following the
archived 500 pattern (payFailure, dimensionsEntry/Done, frameEntry, sweepBillDone, result)
plus commandDimensions entry/done and command entry/done, applied by the parent as a
diagnostic only; first-take then stale files run serially under record-check; exact
removal and hash-verified restoration of `5d4851…2941a` before any further source task.
Then derive the next evidence-led bounded reduction from the measured stale route, with
independent review before any writer. Unity/native/Owner acceptance remain outside.
