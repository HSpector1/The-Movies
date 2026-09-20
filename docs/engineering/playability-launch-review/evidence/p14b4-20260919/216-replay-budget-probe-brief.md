# 216 — diagnostic-only copy of the exact installed four-case test

2026-09-20. INERT / UNEXECUTED diagnostic draft. Parent reports215 on frozen207
candidate:23PASS/one workLimit failure, specifically the writing new8 skip →8→7
case whose unchanged assertions passed191 in205. No budget or assertion policy
change follows from that observation.

Original read: `tests/p14b4-started-replay-background-command.test.ts`, SHA256
`de3e976ef97b5b37196327f03ac9905175c881740b1c6bbbed87bba1c40d2b47`.
It was copied in full, including all four cases, fixtures, original provenance
headers, assertions and default timeouts. No original file was edited.

New inert copy: `216-replay-budget-probe.test-draft.ts`, SHA256
`bbe8158b1cdf33c934fc9a7dcfed94e675d883600644d4323839deb38285e80c`.
Intended TEMPORARY installation: `tests/p14b4-replay-budget-probe.test.ts`.

The ONLY insertion is one `console.log(JSON.stringify(...))` immediately after
the actual replay returns inside `observed`, before its original assertions.
Read-only diff confirmed one insertion-only hunk. Removing that exact inserted
string reproduces the full original byte string. No assertion, fixture, action,
spy, timeout, exception path or200000 cap changed. Expected reproduction remains
the actual one failing writing case, not a diagnostic pass substituted for it.

The JSON label is `REPLAY_BUDGET216`. It records:

- Original start week, horizon, actual plans, initial preparation counter/limits;
  returned work/omissions/fixed-hold count; each cut kind/through/reason/detail or
  completed projection week; provenance kind/boundary plus small owner/due/event
  summaries; the already-observed actual sweep calls, IDs and countdowns.
- ORIGINAL cloned input collection counts: productions/workflows/tasks/bindings/
  reservations/facilities/Sets/concepts, script/audition/commitment/first-take roots,
  placement/structures/construction/physical/queue, technology rows/research seats,
  foreign businesses/productions/script/project rows. Each summary includes own
  enumerable key count/span and shallow string/ID-like field spans/maxima.
- Actual initial phases/countdowns/company sizes, facility/Post capacities,
  active background counts, writer-pool counts, physical cell/provision counts,
  own research/pending-adoption counts. It does not serialize a whole GameState,
  private campaign, talent profile, history tree or implementation bill.

The shallow metrics are explicitly source-size observations, NOT an exhaustive
consumed-field catalogue, a logical-cost formula, or a private tariff oracle.
All inspection occurs after the real replay. It calls no additional simulation
owner, does not replay a callback, and cannot alter its already-returned budget.
The original input-purity assertion still follows unchanged.

No runtime/probe/typecheck, protected write, replay implementation inspection,
Git/network or delegation occurred. Hash/diff/static string checks are not test
execution. Parent owns the one serialized run and fixed-source capture, then
archives exact temporary bytes/raw patch/output and removes ONLY the temporary
probe test before the next source writer. Original installed tests remain intact.
