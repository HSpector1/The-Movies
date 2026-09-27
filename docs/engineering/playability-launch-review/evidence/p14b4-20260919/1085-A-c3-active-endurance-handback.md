# 1085-A — Active endurance driver source handback

Independent driver under1052-A/B, parent1056 and final1083. No gameplay,
compiler, probe, store operation or driver execution was performed by this
author. Parent owns the observer, execution, source/index freeze and publication.
Current HEAD at handback is `e6475aca1ef3bdfd593d660743ebc311981836cc`;
the existing scaffold patch and parent observer remain separate source owners.

The only authored source is
`1052-c3-active-endurance-driver.ts`: 66,305 bytes,
SHA-256 `e6ab333af9b7f1bb4727515ab018f58f6b34c82dfe85672581b0727b6a82d658`.
Its exported request/result types are the exact1083 contract consumed through
the parent's type-only observer import. There is no module-time I/O or world
creation. Before gameplay, a successful parent bridge typecheck with
`--listFiles` must actually list both this file and
`bridge/testing/c3-active-endurance-observer.ts`; ordinary root types do not
silently validate a docs driver. No expected gameplay result or runtime limit
was inferred from a compiler or execution.

## Exact invocation and sequential closure

From repository root, the initial invocation on the currently recorded HEAD is:

```sh
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-active-endurance-driver.ts --variant A --output docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-endurance-A-first --source-sha e6475aca1ef3bdfd593d660743ebc311981836cc
```

If parent publishes first, replace only `--source-sha` with that actual observed
40-character HEAD. Record complete consumed source/index/diff and this docs
producer's exact hash before and after. The producer checks the same identities,
rejects untracked consumed source and refuses an existing output directory.
It never launches another variant. Only after each predecessor closes PASS and
is reviewed may parent invoke B, C, then D with the same driver, their own new
`1052-c3-endurance-B-first` / `-C-first` / `-D-first` directory and:

| Variant | `--baseline` | `--predecessor` |
| --- | --- | --- |
| B | A's exact output directory | A's exact output directory |
| C | A's exact output directory | B's exact output directory |
| D | A's exact output directory | C's exact output directory |

Reference loading requires actual PASS metadata and failure record, exact
complete allowed file inventory, every listed hash,6240 completed/reserved
ticks, the same producer and consumed tracked/diff identities. It does not
accept a partial directory merely because selected baseline files exist.
The comparison files actually read by the driver are pinned before/after.

## Fixed authority and limits

The driver creates only seed `p14c3-active-endurance-6240-01`, captures its
whole38 initial bytes, and records one disclosed2B endowment with the exact
balancing original-cash ledger delta. All nonfinancial authority is preserved;
there is no later cash intervention. Startup is counted within16 weekly
attempts: operations activation and actual fresh Hollywood, six public creators
and paid208-week hires, script activation, actual unbound stage07 strike and
grand-ballroom commission. Startup drains across weeks without hidden ticks.

Each variant reserves at most6240 actual `tick(...,{develop:true})` calls and
12480 command attempts, including refused/failed attempts; at most122 screenplay
commissions,122 greenlights,122 releases, six creators,96 set commands and128
promise attachments. The policy has no additional branch, seed search, alternate
funding or fallback. Failed public availability is recorded; an unexpected throw
ends the route. Every first public refusal/quote read has a complete canonical
state-byte preimage and unchanged postimage, including its first invocation.
Refused repeated reads retain the same explicit purity check.

All first six films must actually release by208 inclusive with both focus Actors,
alternating lead and real initial Writer credits. Both genuine profession changes
and their actual new-role releases must occur by416 inclusive. Later real releases
must satisfy the104-week activity bounds. These are unmeasured policy premises,
never permission to change timing, growth, retirement, cash or history. Slot
tracking uses the actual screenplay ordinal, queued identities, project and film.

A derives the policy; B replays its exact typed commands/statuses; C derives the
same commands while actually exporting/importing at the accepted1–104/26/52
cadences; D replays A with13-week reads plus the first actual actionable decision
in each52-week block. Same-week read groups coalesce. Caps are121 groups for
A/B/C and601 for D. Each1083 observation has at most28 projection calls plus
four profile measurement records,32 records total,64 timings and256KiB of
compact result. Variant A alone owns three real0/3120/6240 runtime samples,
at most24 total dispatch attempts/three Save As commands/zero additional ticks,
with unchanged actual checkpoint/journal/library limits.

Complete canonical Save38 and each complete state-root SHA-256 are independently
measured at121 boundaries. Full bytes are compared where retained at0/3120/6240;
the other boundaries compare complete-save and per-root identities. This is not
a claim that121 raw saves are persisted. Current serializer authority is retained;
the historical953 parity failure and old R8 Vitest timeouts remain unchanged.

## Output and first failure

Each newly owned variant directory has at most ten files and1GiB total. Compact
files are individually capped at16MiB; each authority artifact is capped at256MiB.
The fixed compact files are `commands.jsonl`, `observations.jsonl`,
`checkpoints.jsonl`, `failure.json`, `metadata.json`. Successful variants retain
raw `authority-3120.json` and `authority-6240.json`; A additionally retains the
three real `runtime/week-W.library.json` files. Initial generated/funded and
week0 checkpoint bytes are in metadata. A failure may use one remaining authority
slot for `authority-failure.json`, explicitly distinguishing the last qualified
save from unvalidated observed state. No artifact is overwritten or cleaned.
The real store alone owns temporary/lock lifecycle.

Capacity checks include the intended new file before writing. Final inventory
and all byte/count checks precede the final metadata commit; PASS metadata is
the last authoritative write, with no later fallible artifact inspection.
An artifact failure is reported on bounded stdout and cannot qualify a later
variant without complete PASS metadata/inventory. Tick timings exclude save/read
work; command/codec/read timings and actual counts, roots, append/lifecycle facts,
memory and retained scales stay explicit. At most121 bounded progress lines
report fully observed checkpoint boundaries, followed by one final completion or
first-failure marker. An observed failure remains evidence, not an implicit rerun.

This source does not qualify activity, passive rival Writer work, profitability,
Annex population envelopes, native parity, default journal exhaustion or6240
weeks of durable I/O. Parent execution and independent result review remain due.

## 1054 compiler attribution and narrow correction

Parent1054 closed exit2 after27.711s with fixed source. Its `--listFiles` graph
contains both required paths. Preserve that original result and the original
66,305-byte `e6ab333a…a82d658` source identity above. The driver has exactly two
TS2769 sites, lines668/688: optional `failure?.message` is `string | undefined`
and does not satisfy the selected Node assertion overload. Parent separately
owns the ten observer response-union diagnostics.

The only driver correction adds a literal `??` message fallback to those two
`assert.equal(status, 'PASS', message)` calls. Actual failure messages, expected
PASS status, null-failure/cleanup assertions, commands, policy, limits and timing
remain unchanged. Corrected driver is66,372 bytes, SHA-256
`f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d`.
This source is frozen for parent1055; this author performed no compiler or
gameplay execution, and1054 is not relabelled PASS.
