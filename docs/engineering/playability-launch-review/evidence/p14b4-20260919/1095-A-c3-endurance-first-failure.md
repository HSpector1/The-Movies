# 1095-A — Initial endurance observation and bounded snapshot diagnosis

1056 A first closed2026-09-27T02:45:00.691Z,6.184s, child1/fixed source8599ee2a
with empty consumed diff. The driver remains66,372B/f7d19d39. Original exclusive
`1052-c3-endurance-A-first` is retained unchanged, including failure metadata,
commands, observations, checkpoints and explicitly labelled failure authority.

Actual counts: zero tick attempts/completions;16 accepted startup commands,
six creators, one set-maintenance command; no commissions/greenlights/releases;
one attempted read group; zero runtime samples. The initial complete checkpoint
is430,333 bytes/SHA597997206fa098ec8664e58b797db30dee30ccd2063cdce371762f5c4159e614.
Discovery and its full-byte purity guard pass. Both snapshot calls and schema
parses occur. The second response hits the observer's whole-envelope equality
before its identity is recorded. Calendar/Industry/Market reads, runtime samples,
all gameplay and all activity deadlines remain unreached. B/C/D are unreleased.

Source inspection finds `session.ts:1511–1583` deliberately measures
`metrics.serializationMs` per snapshot invocation. This is an observer comparison
premise to investigate; no simulation defect follows from1056. The snapshot's
other fields, including actual payloadBytes, remain subject to exact comparison.

The parent-owned zero-tick diagnostic `1095-c3-snapshot-repeat-observation.ts`
is frozen3,670B/SHA56e49b9ea218d91e9cfc233692df65071fe43614f86f682ce956cfa418651ed7.
It pins the original1,126,479-byte metadata SHA
6bdc57689fd61d77c26fb35ce1fd1768bc376a81e9d3102c43840e1829cb5181, admits its exact
retained current38 week0 checkpoint and issues exactly two same-session snapshot
reads. Full current authority remains exact before and after each. It hashes both
actual raw responses before comparing their bounded recursive changed paths;
only serializationMs may differ, each actual time must be finite/nonnegative,
and omission of only that field must yield exact complete response bytes.
Timing values are not required to differ. The retained input is checked unchanged.
No generation/action/tick/store path exists. This diagnostic requires source
review before one recorded invocation; no observer correction has yet been made.

## Actual diagnosis and narrow correction

1057 closed2026-09-27T02:48:15.100Z,5.002s, child0/fixed8599ee2a/empty diff.
Exactly two same-session reads, zero ticks. Both actual response payloadBytes are
603724; full envelopes are603794 bytes with distinct raw SHA values recorded in
the log. Independent recursive comparison finds exactly one changed path:
`/metrics/serializationMs`,547.8463750000001 versus424.3255329999997.
All remaining complete response bytes compare exact. Full current state after
each call and original input bytes remain exact. Producer56e49b9e and metadata
6bdc5768 match their pre-command pins. This confirms the observer premise failure.

After1057 closed, parent changed only the repeated snapshot comparison: preserve
both actual raw-response identities before comparing, require each actual timing
finite/nonnegative, and compare a detached view omitting only serializationMs.
Actual payloadBytes, every other response member, strict schema and full-state
purity remain exact. No production snapshot, driver, policy, clock or limit changes.
This correction needs independent narrow review and applicable Bridge types
before a new exclusive A invocation. Original1056 remains FAIL with zero ticks.

Corrected observer freeze:29,949 bytes, SHA256
`a8685dc06b3ab0d9386420d762b017ac4198d7cb6f21305770dbcd499a763f4a`.
1058 is the separate full Bridge --listFiles verification of this exact delta.

1058 closed2026-09-27T02:49:33.580Z after29.092s, child0/fixed source. Both exact
paths appear and no diagnostics occur. Observera8685dc0 and driverf7d19d39 remain
unchanged. This checks the correction's actual graph; it does not convert1056 to
a pass or qualify any unreached endurance surface/activity/runtime boundary.
