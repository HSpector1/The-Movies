# 484 — Reconciled cost profile; rejected hints; exact restoration

2026-09-20. Diagnostic source only; no production optimization adopted here.
Published base `32d04de361ae41534bf7e69345a8e061f8cbad4c` remains intact.

## Fixed-source execution and neutrality

481 independently accepted the complete temporary480 diff before runtime.
482 first-take: 11:57:10.419–11:57:17.993Z, exit1.
483 stale target: 11:57:35.413–11:57:43.112Z, exit1.
Intervals are disjoint; both fixedSource:true, same start/end HEAD, no protected
untracked files, protected patch
`dc61ac2c3e7d4cbf914729cfb55da92a59a80e8c205a9b4abd8de97042b87f75`.
Complete raw output and JSON were read; original assertions stayed unchanged.

482 reproduces complete Ready producer and every preceding actual parity/control,
then original line325 kernel reason workLimit instead of domainIncomplete.
483 reproduces original line234 producer workLimit instead of commandRefused.
No added observer failure or timeout. No post-cut assertion is counted as passed.

| Observer | 482 first-take | 483 stale prefix |
| --- | ---: | ---: |
| Initial / limit | 0 / 200000 | 0 / 200000 |
| Successful payment count | 9296 | 9851 |
| Successful units | 196468 | 199998 |
| Saturation gap | 0 | 2 |
| Final usage | 196468 | 200000 |
| Reconciles / consistency failures | true / 0 | true / 0 |
| Incomplete fact call | none | none |

The stale failed request is separately recorded: frame.sweep at week7,
reserve.sweepAndObservation requested673 at199998 with2 remaining.
It is NOT included in successful units. This is before the Post3 owner.

## Measured attribution

Successful category totals sum exactly to the above successful units.
All calculator categories together cost50290 / 52456; these are real existing
calculator execution/argument prepayments, not refunds or hypothetical savings.

| Category | First-take | Stale prefix |
| --- | ---: | ---: |
| Unclassified direct | 50966 | 51324 |
| Sweep plus observation reserve | 39380 | 39380 |
| Calculator arguments | 26672 | 27720 |
| Calculator add | 11000 | 11552 |
| String equality | 9601 | 9664 |
| Token serialization | 9284 | 8678 |
| Original fact lookup scans | 7410 | 9192 |
| Persisted identity union reserve | 5012 | 5012 |
| Initial admission reserve | 4579 | 4579 |
| Calculator keyBill | 4288 | 4544 |
| Calculator times | 4070 | 4160 |
| String text | 4024 | 4270 |
| Fact discovery | 3428 | 4029 |
| Arrival reserve | 3219 | 3479 |
| Calculator plus | 3020 | 3140 |
| Sort reserve | 2286 | 2292 |
| Command reserve | 1436 | 1436 |
| String less | 1351 | 0 |
| Calculator equality | 1240 | 1340 |

Smaller categories remain in complete raw482/483, not silently discarded.
Phase totals: admission45524/45664; sweep40028/40128;
dimensions26157/30533; sweep-bill calculation24647/26448;
drainEvents15642/15786; admission.identity9649/9649; prepare9573/9943.
Within admission, unclassified direct payments are20283 in400 calls in BOTH
runs. This is a concrete further attribution target, not evidence they are
unnecessary. Repeated calculators also merit structural, not tariff-only review.

## Ten-role hint model rejected

Observed model31*cells +4*roots +8*others +40*calls +6*completed
+12*completedMisses −6*paidVisitsOnHits adds3211 / 3479 units.

482: one cell;81 calls,18 root/63 other,81 completed,60 misses/21 hits,
307 paid scan visits on hint hits;38 cold/43 mode-complete/0 upgrades.
483: one cell;90 calls,20 root/70 other,90 completed,67 misses/23 hits,
356 paid scan visits on hint hits;44 cold/46 mode-complete/0 upgrades.

This proposed implementation would ADD work on both measured prefixes.
Do not implement it. This rejects this particular tariff/design, not all
possible identity lookup algorithms; no unobserved suffix is extrapolated.

Chronological completed cold rows independently derive the original table size:
each cold scan visited exactly its current cardinality before one append.
482:38 final records, sum of entry cardinalities1716 across81 calls,1235 actual
paid visits.483:44 records, cardinality sum2086 across90 calls,1532 visits.
Original lookup base plus scan totals are8058 / 9912.
This derivation is checked against every cold row; cardinality was not a
separately recorded observer field. No Map tariff or claimed saving adopted.

## Exact restoration and next work

All480 observers/tags/shadow storage removed using reverse hunks at11:58:33Z.
Replay restored byte-for-byte to466:
`956a0245872f02e625c93a41cc2cc2033c4279129b85e100f315045d4d4f8ca4`.
Entire protected tree equals published32d04de; no protected untracked files.
Therefore kernel, tests and other owner pins are also unchanged. Raw diagnostic
patches are archived in482/483; no instrumentation remains in production.

Next: bounded read-only sim-core review of admission direct20283; independent
contract-auditor review of dominant calculator structure. Identify the real
operation and preserve exact numeric owner bills, pre-call payment, native
logical footprint and every calculator cost. If precise attribution is missing,
add only neutral small probes and restore again before choosing implementation.
Do not ship speculative ten-role hints, arbitrary lower prices, cap changes,
weakened validators/tests or whole-suite reruns. One production writer when a
concrete change is released; max two specialists; heavy execution serialized.

T4/B2/B3/B-F2 remain qualified closed. B4 remains in progress; first-take producer
complete is NOT combined-kernel acceptance, stale post-exit remains unexecuted.
Unity/native/rendering/Owner acceptance deferred; live Save29/rules3/projection46
unchanged until coherent cutover. Continue engineering beyond this checkpoint.
