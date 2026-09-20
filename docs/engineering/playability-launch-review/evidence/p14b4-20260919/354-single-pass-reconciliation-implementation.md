# 354 — One-pass two-way reconciliation

2026-09-20. Native sim-core. SOURCE FROZEN; sole production write ownership
yielded for parent-owned verification. Base published and separately verified
remote: `52ba3ab8e552c29ffb7b0963411c555412770c14`.

Only `src/core/promiseCapacityOwnerReplay.ts` and this handback were written.
Controlling scope is adopted351; no broader351 RCA optimization was included.
No tests, probes, typechecks, runtime, Git, network or delegation were run.

Source SHA-256 before:
`28e7e010c9887709ade1f3010018487931b710fdad1e14282fa5604e0681bc37`.
Source SHA-256 after:
`393d4dc7f8997183468c84b6b6c6e31ff839c626f765607b5391368a20996486`.

## Exact change and equivalence

Each invocation-local expected resource fact now contains numeric `matches: 0`.
The existing first ledger pass, all its filters and picture lookup, the exact
path-then-subject comparison order, and immediate per-row `matches === 1`
invariant are retained. A successful existing pair comparison increments both
the original local ledger-row count and that expected fact's count.

The second Cartesian expected-by-ledger scan is replaced by one traversal in
the original expected order, checking each fact's count against one with the
unchanged `owner output has an uncertified reservation` diagnostic. No count
is rejected early, converted to a boolean or silently deduplicated.

Let E be the expected facts, and L the live resource ledger rows with nonnull
paths that resolve to prepared pictures. Every e in E is constructed as a
resource on a known prepared-picture path: ordinary reservations come from
`reservationSubject`; bound Set facts are explicit resource subjects. A closed,
person, null-path or non-picture ledger row excluded from L therefore cannot
match any e under the old second scan. For resource subjects the exact path,
kind, slot and resource-key equality is symmetric, so counting each successful
pair during the unchanged first pass gives exactly the old second count.

The first diagnostic still occurs immediately for the same first bad live row:
duplicate expected facts and unmatched/stale live resource rows remain errors.
Only after all first-phase checks does the original-order second diagnostic
reject a missing reservation or multiple live ledger rows matching one fact.
Empty sides, skipped background/person/mount rows and duplicate multiplicity
retain their original meaning. Counters belong only to this reconcile call.
Each increment follows paid pair/row traversal, so the 200000 bound keeps their
values far below the safe-integer limit; there is no unbounded count expansion.

## Complete new-work payment inventory

All payments occur before the corresponding construction, mutation or check.
The existing source-level176 metric and shared saturating allowance are unchanged.

| Changed block | Before-execution payment |
| --- | --- |
| Expected schema | `literalCost('path','subject','matches') = 22`, previously14. The extra `matches` key contributes `1 + 7 = 8`, including its reference/value write. |
| Reservation expected fact | Existing scalar reserve4 becomes5: one additional zero-value initialization step. The extended literal and unchanged append are paid before construction; `reservationSubject` retains its own payments. |
| Bound Set expected fact | Existing scalar reserve5 becomes6 for the same initialization. The extended expected literal, unchanged nested resource literal and append are paid before construction; token payment remains separate. |
| Successful existing pair | Additional16 before either increment: local counter read/add/write3; fact reference/field reads2; fact counter addition1; keyed `matches` write8; branch/control2. Existing pair visit3 and exact string/subject payments are unchanged. |
| Final expected-fact check |12 before each check: iteration/reference3; field read1; strict comparison1; invariant argument/call/return4; loop continuation/termination control3. No nested ledger traversal or string join remains. |

The fixed literal schema is calculated once at module initialization as before;
the new source key introduces no input-dependent scan or calculator. The pay
expressions add only fixed schema constants, under the existing dispatcher
convention. There is no new array, callback, index, sort, key encoding, copied
source record, cache or helper whose variable work needs a separate allowance.

Savings arise solely because the second Cartesian scan and its executed
comparisons are removed. No still-executed owner operation, string comparison,
calculator, construction or callback receives a discounted price or refund.

## Scope, inspection and limits

The only production hunks are the expected literal schema and reconcile's local
fact type/constructions, successful-pair increments and final expected check.
The expected facts retain the same paths, subjects, construction order and
owner-validation calls. `sameSubject`, first-pass filters/find/join order,
`drainEvents`, `closeHold`, `addHold`, `closePath`, all gameplay owners and all
other source paths are untouched. Tests, validators, versions, public types,
200000/220 limits, timeouts and the work metric remain unchanged.

Static inspection covered both fact constructors, both diagnostic phases,
counter lifetime and prepayment order. Hashing produced the host's existing
Perl locale warning but returned complete hashes. No executable verification
or numerical-fit assertion is made. Actual350 established a cut after the take
owner but before reconciliation/output completion; it does not prove that this
candidate reaches wrap, final output or the unchanged kernel within the cap.

Next: parent-owned independent bounded source review and the unchanged serial
type, Ready15, original26, employment5/ordinary66 and adjacent137 checks. Any
remaining work-limit failure must be preserved and attributed. This is not a
whole-owner accounting certification, Ready/B4 acceptance or completeness claim.

SOURCE FROZEN. Production write ownership is yielded.
