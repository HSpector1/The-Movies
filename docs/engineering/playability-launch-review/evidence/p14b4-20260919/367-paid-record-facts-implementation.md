# 367 — Paid dimensions record facts

2026-09-20. Native sim-core. SOURCE FROZEN; sole production write ownership
yielded. Implemented adopted365 against published/exact-remote base
`2ccd87cca17388905a85a27dddd3ff5ab9c8bc66`.

Only `src/core/promiseCapacityOwnerReplay.ts` and this handback were written.
No runtime, tests, probes, typechecks, Git, network or delegation were run.

Source SHA-256 before:
`393d4dc7f8997183468c84b6b6c6e31ff839c626f765607b5391368a20996486`.
Source SHA-256 after:
`4166ea6a00b23741bf0e9f4c945520d80d2834a53d400a1133bc23002a8aa6e1`.

## Exact implementation and scope

The existing private `DimensionCell` gains a paid `records` array. Its entries
are `DimensionRecordFacts`: the exact original `record` reference and two
independent nullable numeric facts, `copy` and `width`. Null explicitly means
unobserved; a measured string maximum of zero remains a valid observation.
The static `value` leaf and its original discovery body remain independent.

New private `dimensionRecordFacts` performs a charged linear reference search.
No native hash lookup, ID, semantic key or shape identity participates. The
helper is called ONLY by dimensions. Generic `Work.copyCost` and every call to
it outside dimensions remain unchanged. Replay holds, ledger rows, calendars,
branches, counters and cells are never measured records in this table.

| Current record | Requested observation |
| --- | --- |
| Operations root, technology root, each full generic P | Copy only; enumerate own string keys without reading their values. |
| Each current reservation | String maximum only; no copy accumulator. |
| Current workflow, bindings, task, setup, Set, technology-production row | Both; cold discovery shares one incremental own-key walk. |

The existing Prepared construction pays and creates the empty table. Ready
sibling Prepared objects already share the same private cell and continue to
do so; no second table, reset or cross-invocation cache is introduced. The cell
is not part of Work's zero-work administrative envelope. No discovery moves
before the existing preparation/admission gates.

## Numeric parity and current membership

For a requested copy observation, the result is EXACTLY the existing formula
`1 + sum(3 + ownKey.length)`, using the existing prepaid saturating add and
calculator receiver for every term. A requested string observation starts at
zero and takes the maximum length of the record's own direct string values,
paying each actual span. Nested values remain opaque references.

Each dimensions call still constructs a fresh complete Dimensions record. The
operations and technology copy facts name the current root references, not a
historical root. Every existing production/workflow/reservation/task/setup/Set/
technology collection traversal remains. Each current member's intrinsic facts
are composed with the existing floors and current maximum; cached rows absent
from the current collections contribute NOTHING. All current P ID/director
and genre-ID reads, counts, external occupancy, technology cardinality and
every method-versus-silent comparison remain paid and executed. No combined
Dimensions or prior-max-seeded width is stored.

Reordering the independent per-record copy/string discovery into a fused walk
does not change those numeric results: copy uses keys only; width uses direct
string values only; all final compositions are maxima over the same current
members. P/root copy-only observations never start scanning opaque values.
There is no owner-copy price reduction, omitted owner call or gameplay change.

## Identity and publication proof

The admitted synchronous source domain is unchanged: genuine plain engine JSON
containers and ordinary own-string generic P fields, no getters/proxies or
enumerable symbols. No new uncharged validation of that premise is claimed.

Inspected actual owners preserve unchanged references and replace changed
records: operations commands/advances copy P/workflows/tasks/setup/bindings;
Set wear/novelty map-and-copy changed rows; the technology collector replaces
its changed root and locked row. Exact-reference reuse therefore preserves
intrinsic shallow observations. New records miss even when their IDs and
shapes equal earlier records. No source record is mutated or cloned by the memo.

A cold observation lives only in local numeric variables during discovery.
On a first entry, the full literal and append are prepaid together BEFORE
construction/publication. On a partial-mode hit, only the missing observation
is discovered; the old completed fact is retained locally. After the full scan,
one payment covers BOTH cache-field writes and the return. No throwing work or
external call occurs between these writes, so an exhausted scan/payment cannot
publish a half-completed mode upgrade. A later hit can use only a nonnull,
fully observed requested fact. Every actual call requests at least one mode.

## Complete new-work inventory

All listed work is charged before the associated source block. There is still
one cumulative allowance across preparation, siblings, frames and output.

| Block | Prepayment and source work |
| --- | --- |
| Prepared cell construction | `literalCost('value','records')=15`, previously7. Added8 covers the records key/write; the surrounding scalar reserve2 becomes3 for the empty-array header. The Prepared literal and original null initialization remain paid. |
| Record entry schema | `literalCost('record','copy','width')=19`: header1 and key/value writes7+5+6. This is a fixed source schema, not input-dependent discovery. |
| Helper entry |8 for table access, previous-reference initialization, empty-loop and return controls. |
| Every visited table entry |6 for visit/reference, record-field read, exact reference equality, conditional and match/break controls. Misses pay the whole actual prefix; hits pay through the matched row. No assumed constant-time lookup. |
| Previous values |12 before both optional field reads/defaults and local bindings. |
| Requested-mode tests |12 before the two mode/null checks and their boolean bindings. |
| Hit dispatch |8 before both missing-flag reads, conjunction, hit reference and return controls. |
| Cold initialization |8 before the two missing-mode guards, copy=1/width=0 assignments and scan setup. Unrequested or previously completed modes are not reinitialized. |
| Each enumerated key |`5 + key.length` before own-property checks, loop/control and both mode guards. This is one common key walk, not the former two enumerations. |
| Each requested own copy key |Unchanged `work.calc(8).add(copy, 3 + key.length)`: receiver8 pays argument arithmetic/reads; add8 pays safe saturation before updating the local accumulator. |
| Each requested own value |2 before direct value read and type check; for a string, another2 plus `Work.text`'s `1 + value.length` before the intrinsic maximum update. Copy-only never executes this block. |
| Finished-scan dispatch |3 before existing/new-entry dispatch and result controls. |
| Partial-mode publication |16 before both keyed writes: copy5 + width6, plus reference/value/return work5. Both completed facts are written without intervening throwing work. |
| New-entry publication |`6 + 19 + APPEND(3)` before literal creation, table append and return. The6 covers source/result/table accesses and control; append includes capacity, invocation and reference write. |
| Root requests |16 before the two copy-only helper calls, their argument reads, result bindings and controls. |
| Dynamic per-row request wrapper |12 before the helper arguments/call/result, mode dispatch and return. If strings were requested, another6 before current-width/fact reads, maximum and d-key write. |
| Current reservation visit |Existing1 becomes3 for the widened per-row request; reservations still request strings only. |
| Composition |Existing full Dimensions literal/scalar64 payment, current outer loops and maximum composition remain. Only observation producers are replaced. |

The two existing local dimensions closures remain two: current ID text handling
and the record-fact wrapper replacing the former string-only wrapper. No new
variable scan is hidden in a fixed block. Fixed schema arithmetic follows the
existing literal/dispatcher convention. No Object.keys allocation, deep copy,
input-derived cache key, historical aggregate, extra owner callback, refund or
metric/cap change is introduced.

## Static review, qualifications and next actions

Static inspection covered both cell construction/sharing sites, every helper
call/mode, null versus zero, cold/partial/hit publication, the current root and
member folds, and the unchanged generic Work.copyCost path. Only the private
schema/cell/helper and dimensions discovery hunks changed. Owner billing
functions, actual owners, reconciliation354, all tests, validators, public
versions and200000/220 caps are untouched. Hashing returned complete hashes
with the host's existing harmless Perl locale warning.

The table is deliberately linear and fully paid. Many fresh record references
can cost more than repeated discovery without a memo; no constant-time or
universal net-saving claim is made. The finite allowance bounds table growth
and comparisons; an unaffordable lookup/scan still yields the genuine work cut.
365's29,597 affected units and Set-repeat bound are not a fit prediction. Parent
must establish actual Ready long-route/stale usefulness, unchanged started
controls and the independent new exact-reference/generic regressions.

Next: parent full source read, bounded independent accounting review and serial
type/Ready15/started26/lookup5/ordinary66/adjacent137/new-facts checks. Preserve
remaining failures without changing limits or assertions. No complete-owner
accounting theorem, domain completeness, Ready/B4 or native acceptance is claimed.

SOURCE FROZEN. Production write ownership is yielded.
