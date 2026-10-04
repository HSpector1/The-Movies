# Independent review: Save45 targeted follow-up wrapper

Verdict: **PROCEED for the two named follow-ups, sequentially under the existing heavy lane after UI and d16 complete.** No blocking difference found. This is wrapper review, not a test result or approval of a broader rerun.

Reviewed by `/root/founding_charter` on 2026-10-04. Compared the complete files and inspected the named recorder/guard seams and test timeout declarations. `bash -n` passed. Neither wrapper, recorder, test process nor source/index mutation was executed; this report is the only write.

Identities:

- Original `recorded-1361.sh`: `65c9c08f21e452843d35e0f5b29779d88d1a2544541270c38088e8a31bd642b4`.
- Reviewed `recorded-1361-followups.sh`: `26eb23a63022f5ce367ee26dd00d9e686e93978e33c8ac39b215bcaeaf79298f`.

The complete diff adds only the two case selections, their commands, and usage/comment text. All existing modes and their commands are unchanged.

| Mode | Exact stem | Sole selected test file |
|---|---|---|
| `bridge-disclosure` | `1361-save45-bridge-disclosure-followup` | `tests/bridge-p13b-s7-disclosure.test.ts` |
| `bridge-supervisor` | `1361-save45-bridge-supervisor-followup` | `tests/bridge-supervisor.test.ts` |

Both commands retain the bounded-source recorder, select project `core`, and set `--maxWorkers=1 --minWorkers=1`. They run the whole named file, without a test-name filter, timeout override, retry option, fixture rewrite or expectation change. The existing disclosure 30-second test limits remain intact. The distinct stems preserve attribution and do not replace the broad-core artifacts.

The remote-HEAD equality, source cleanliness, landed sibling/hygiene guards, five-GiB disk threshold, stem validation and all five named output nonexistence checks are byte-for-byte unchanged. Preflight still precedes the recorded command; postflight still follows it. The original source, index, stage and manual-file identity checks and recorder fixed-source checks remain in the same owners. The wrapper introduces no commit or staging action.

The parent identified a newly observed disclosure timeout and two supervisor residual failures as the reason for these bounded follow-ups. Running the two full files separately can characterize those failures under reduced worker contention; it does not by itself explain their cause or erase their broad-run results. Compare the recorded individual outcomes with the original failures and retain both records, including any repeated failure.

Scheduling remains an external responsibility: this wrapper does not itself wait for UI/d16 or acquire the lane. The parent must invoke one mode at a time under `lane-run.sh` only after those active predecessors and their postflights finish. Also retain the original recorder interpretation: wrapper process completion is not test success. Read the recorded test exit code, raw results and exact postflight status; no shell-final-status shortcut establishes GREEN.
