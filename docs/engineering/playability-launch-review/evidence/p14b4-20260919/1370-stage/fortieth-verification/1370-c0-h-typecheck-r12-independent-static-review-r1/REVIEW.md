# Independent static review: H r12 runner

**REFINE; frozen r12 remains unrun.** Source/binding/selfcheck/manifest hashes match the freeze. The synthetic selfcheck passes, source pin and historical/current role guards remain, and the EPERM process inventory takes two spaced, bounded, fully parsed numeric `ps` samples before an alternate no-group conclusion. The r11 observed STOP remains pinned without claiming its failing line.

Two deterministic refusal gaps remain:

1. `runner.py:183-187` catches a denied `killpg(SIGTERM/SIGKILL)` and returns when a later `group_alive` check reports clear. A synthetic call with initial `group_alive=True`, `killpg=PermissionError`, then `group_alive=False` returned normally (`RED_DENIED_SIGNAL_ACCEPTED`). The package PLAN explicitly says denied signals remain STOP. Record the denial and fail even if a subsequent alternate proof finds no survivor.
2. `runner.py:188-192` accepts `group_alive=False` and suppresses `proc.wait(timeout=1)` expiration. A synthetic unreaped direct child with `group_alive=False` returned normally (`RED_UNREAPED_CHILD_ACCEPTED`). Require a completed/reaped direct child before declaring cleanup successful; a timeout is STOP.

Add focused REDs for both actual helper paths and preserve the existing EPERM two-sample tests, phase/traceback recording, child result, source/root/dependency guards, 300-second child and 320/330 recorder bounds. Version a corrected proposal; do not mutate r12 or launch it. No H mirror, type route, or Git mutation occurred in this review.
