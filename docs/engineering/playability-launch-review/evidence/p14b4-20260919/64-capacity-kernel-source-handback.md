# B4 detached capacity kernel — initial source handback

2026-09-20. Sole sim-core production writer, native Fable role. Base supplied by
parent: published `17247843921781e3ad873db2e45d1737520a5623`. Independent RED62 was
missing-module RED, with zero test bodies reached; this handback does not upgrade
that evidence into behavioral verification.

## Exact scope and freeze

Added only `src/core/promiseCapacityKernel.ts` and this handback. The module exports
`searchPromiseCapacity` and the immutable input/result types fixed by49. It imports
nothing and has no live callers, index export, GameState, Production, forecast,
action, tick, policy, save, version, schema or generated-contract change. All
independent tests, helpers, fixtures and historical evidence remain untouched.

SOURCE FROZEN for parent-owned66 and typechecks. No tests, executable probes,
typechecks, generators, Git or network commands were run by this writer. Source
inspection only; parent records exact source hash and execution identity.

## Implemented mechanism

- Strict internal input validation, safe nonnegative integer arithmetic and
  ordered `(week,step)` comparisons. Duplicate source identities, malformed
  calendars/masks, wrong-path or immutable-prefix replacement, and duplicate
  fixed/additional identities throw input Errors, not gameplay classifications.
- Canonical copied masks, claim/debit/hold/replacement/alternative/omission
  collections. A bounded merge sort uses precharged deterministic allowances;
  branch order and work disposition do not depend on incoming array order.
- One shared budget starts at preparationWork, scans scalar/string/array inputs
  before semantic work, also charges empty containers, then covers search setup,
  branches, counter/profile comparisons, compatibility and witness construction.
  Governed maxima remain32 rows including target,64 units including B,1024
  alternatives,200000 work,220 weeks from now. Large admitted counts/windows are
  checked before count arithmetic/expansion. Cap exhaustion returns UNCERTIFIED.
- Foreign rows are structurally checked, then filtered by the exact56 boundary.
  A retained debit keeps its source identity while consuming its full remaining
  demand through generic-cast local tokens in the target window. Tuple namespaces
  separate target/prior/debit identities without concatenation collisions.
- Iterative exhaustive-small-domain path search selects one whole alternative
  or none per physical path. Each actual distinct cast seat may pay one eligible
  demand or none; counters avoid per-count objects. Same-person/path planning
  credit cannot be shared, while different actual seats may satisfy different
  people's obligations. No prior obligation is dropped to produce a winner.
- Exact fixed ledger replacements preserve identity and immutable prefixes.
  Early pruning considers selected additional holds and only fixed immutable
  prefixes. Full suffix compatibility is checked on the selected continuation
  set, so a later no-event release can repair an earlier tentative conflict.
  Null takes never earn event/profile credit. An explicit path stack avoids
  recursion proportional to the1024-path limit.
- Prior optimization maximizes aggregate existing units, then the complete
  cumulative-boundary profile lexicographically. An independent per-demand,
  distinct-path optimistic bound can prove the entire optimum when every entry
  is attained and the existing domain is complete. Otherwise the complete finite
  domain is enumerated. Equivalent optima remain available by rerunning probes
  against the aggregate profile rather than freezing a first assignment.
- Protected X and B probes use the same profile. B witnesses contain all prior
  credits and B target events together; their sorted first X must be existing,
  with eight-week slack at the Xth. Failed protected X is followed by an
  unoptimized joint probe. A reallocation witness is prior-protection FRAGILE
  only with the failed protected search proved complete. Complete joint failure
  is scoped only to the joint offer, never causal BROKEN.
- Missing future alternatives can still permit a lawful positive witness with
  a proved full prior optimum. Missing relevant holds, an unproved optimum,
  incomplete negative searches or exhausted work cannot certify a result. A
  bound target whose actual qualified evidence already meets its count returns
  only ALREADY_MET, without writing an outcome.

## Static review and remaining limits

Static review covered permutation-normalized traversal, same-path exclusivity,
seat-count rollback, equivalent-prior retention, safe early hold pruning, exact
replacement ownership, zero-event continuations, incomplete-domain proof gates,
and safe arithmetic before B/aggregate expansion. No execution result is claimed.

This is an exponential finite search behind a deterministic work cap, not a
polynomial matching theorem or a maximum-capacity oracle. It deliberately returns
uncertainty if exhaustive proof does not fit. The optional direct hard-bound
result variant is defined but not emitted by this initial implementation; size
caps can therefore conservatively return uncertainty without expanding a large
otherwise complete domain. The all-zero prior profile is trivial; a constructive
joint witness still has to establish ledger compatibility.

The kernel trusts owner attestations for actual staffing, complete alternative
domains and membership. It cannot prove that a staffing reference corresponds to
real engine actions, fill missing calendars, allocate a real seat, settle a
promise or establish natural-chain performance. Those adapter/policy/live-wire
obligations remain pending. Independent41-case execution and typechecks are the
next diagnostic gate; any failures should retain actual source identity and be
fixed under a separate parent release, not hidden by changed tests or caps.
