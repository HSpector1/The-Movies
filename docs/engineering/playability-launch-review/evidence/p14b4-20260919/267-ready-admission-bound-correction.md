# 267 — Ready admission bounds: frozen implementation handback

Date: 2026-09-20. Mode: IMPLEMENT, native sim-core, sole production writer.

Base: published/exact-remote `41bc14db9efb2bf52ab263a7d5ea3db4a91b65ad`.
Production scope: **only** `src/core/promiseCapacityOwnerReplay.ts`.
Frozen source SHA-256:
`2e8feba725d9e949762017859bf572a00887d970e25b58ad133c770a1b7ed6fa`.

SOURCE FROZEN; production write ownership yielded to parent. No tests, probes,
typechecks, generators, Git, network, delegates or owner-module edits were run.
Static source reading and whitespace/conflict-marker search only; no matches.

## Observed baseline, not candidate results

255 identifies unpaid empty-person background visits and the missing requested
ID in the unknown-project diagnostic. 257 has three real work-limit failures.
264 establishes these locations without identifying an exact scalar expression:

- Original + Ready completes the whole actual `[8,8] -> [7,8]` sweep, then cuts
  through `(2,5)`; kernel is unreached.
- First sibling completes; the second reaches identity allocation but not its
  initial workflow add/link, cutting through `(1,0)`.
- The unavailable-freelancer case reaches header/staffing but not the actual
  market owner, cutting through `(1,0)`.

Original26, identity1 and Ready-command3 passed on that predecessor. Those are
not tests of this candidate. In particular, this handback does NOT certify
usefulness or claim the remaining freelancer cost fits 200000.

## Exact delta

### Review corrections

The Ready busy-row traversal now pays four units at the beginning of EACH
picture/background visit, before `people` access/iteration. Inner person append
charges remain. Casting backgrounds with `people: []` therefore pay their visit.

Unknown project now returns the exact action diagnostic:
`applyActions: greenlightScriptProject references unknown project "<requested ID>"`.
Its template is prepaid with `69 + requestedId.length`, with a separately paid
16-unit scalar receiver before the expression. `commandRefused` still separately
pays its Error/message construction. No downstream owner is called for this
refusal; no fabricated project is used.

### Initial Development allocation

`initialAdmissionBill` now receives the actual pre-admission operations root.
It inspects that root with paid loops before the real allocator is invoked.
The existing new-draft construction, workflow visits and output reserves remain.

| Component | Old bound | New source-derived bound |
| --- | --- | --- |
| Eager claims | `4 * N`, including empty new draft | All existing reservations + nonnull shooting-task rows + bound-Set row only when an actual soundstage reservation exists |
| Indexed production claims | Every guessed raw claim | Existing reservation rows + actual occupied bound-Set rows; shooting-task rows still emitted/paid but excluded before the production index |
| Bound-Set guard | Coarse workflow reserve | Retain coarse workflow reserve and additionally count/pay the actual `.some(soundstage)` prefix visits |
| Occupancy cardinality | Guessed claims + external slots | Indexed production-claim occurrences + external slots (duplicates conservatively retained) |
| Facility pass/sort | All facilities | Unchanged: all facilities copied, filtered, sorted and traversed |
| Slot-search capacity | Sum of every capability | Sum of actual `development-casting` capacities only |

The appended draft has no reservations, task or occupied Set, so contributes
ZERO raw/indexed claims, but remains in N for BOTH workflow walks and duplicate/
replacement visits. The current stage-binding guard does not confuse a retained
historical Set ID with tenancy. The same actual occupancy owner still eagerly
emits every row before filtering, and the allocator still uses the complete
external Set. Non-Development facility outer visits are not omitted.

The raw claim literal/key/append charge is unchanged. Raw filtering retains
`16 + 2*E(d)` per emitted row. Only the Map get/set + occupied-Set insert term
(`3*K`) uses indexed rows. The external-copy/insertion, all-facility sort,
reservation/allocation literals, both operations copies, draft/replacement
workflow, binding copies, transition and event reserves are unchanged. The
caller's bill-calculator receiver grows from8 to16 for the extra operations
argument; there is no unpaid discovery call.

The three earlier occupied-slot owners and `readyOccupancyBill` are unchanged.
Their broad Set view still pays eager operations, script, casting and mount
claims even when the final selected Set-slot output is empty.

### Freelancer owner: consumer-specific spans and actual reachability

New private `Work.keySpanBill(p,S,L)` uses the SAME comparison metric:

`K(p,S,L) = 1 + L + p*(1 + L) + S`

Here p counts stored-key occurrences, S sums their lengths, and L is the actual
query length. This is exactly `1+L + sum(1+L+storedLength)`, not an assumption
about native hash complexity, warm caches, early unequal-length rejection or
free comparisons. Duplicate stored occurrences overcount distinct Map/Set keys.
Sums/products saturate through the existing `add`/`times` methods. The method
pays20 before its receiver/argument arithmetic and separately pays one product
and two binary sums. Its callers prepay their argument expressions.

| Actual owner block | Candidate bill |
| --- | --- |
| `activeScriptWriterAssignments` title Map | Each concept insert uses its pre-insert concept-ID occurrence count/span and its own query-ID length. All tuples/callbacks/Map construction remain. Title values are references here, not copied strings. |
| Player writer lookup/label | One concept-key lookup per active player project; real pooled-row count pays writer-assignment literals and label copies using maximum actual title length. Foreign indexed writers do not fabricate player assignment/label records. |
| Pooled writer helper | Every actual active pool remains counted, with the full `.includes(writerId)` comparison-span upper bound, including the attributed writer. This uses the genuine validated-current-root invariant, not a new legacy-reader rule. |
| Company/industry/research busy Sets | Exact source-now member occurrences, conservatively retaining duplicates. At most three Set layers per occurrence (foreign company -> industry -> busy), each with full occurrence span. Player/writer/research layers are no larger. |
| Current-contract `.find` | For a query of length L with q visited rows and prefix stored span S, reserve `6 + q*(10+L) + S`. Inactive rows remain in this OWNER comparison reserve. Half-open dates are unchanged. |
| Signable-universe short circuit | All talent still pays busy lookup/filter overhead. Only nonbusy people incur contract work; only nonbusy/uncontracted people incur rival lookups. The calculator derives those counts with separately paid source comparisons, not a fabricated market result. |
| Cold employment index | TWO Map operations per employment row: get and set against its PRE-insert prefix. Optional array construction, push and row controls remain in24 per row. All source rows are included whenever a rival lookup is reachable. |
| Rival row predicates | Separately reserve `12 + row.studioId.length + playerStudioId.length` per employment row. Employer IDs never inflate person-key widths. Unique source talent means each grouped employment row can be visited at most once across these queries; the bill pays all rows even if some groups are not visited. |
| Rival queries | Each reachable person's actual ID length against the FULL employment-key occurrence count/span. No assumed warm WeakMap and no shortened positive Map lookup. |
| Scientist filter/stream/sample | Original full talent control/copy bound and derived-stream/sample-size bill retained; actual market owner still performs all selection. |

The bill calculator's source-now membership work is not gameplay authoring.
It collects actual director/cast/craft seats (never credited writers), actual
drafting/rewriting pools and only unreleased research seats with current
contracts. Its date flags are the original `startWeek <= now && now < end`.
It uses these facts ONLY to price the owner's reachable calls. The unchanged
`freelancerMarketIds(source)` is still invoked after the ENTIRE returned bill is
paid, and `greenlightFreelancers` remains the actual refusal/acceptance owner.

### Calculator/construction inventory

- The local freelancer calculator prepays48 for its initial scalar variables,
  four arrays (including the one-element zero prefix), and local closures.
- Contract-prefix discovery pays each row's scalar/date reads, both array
  appends and text span, then the paid saturating prefix addition. Each local
  contract-search visit pays16 BEFORE prefix-index/active-flag/comparison access;
  actual calculator string comparisons are separately paid by `Work.equal`.
- Concept discovery pays16 BEFORE text-call arguments, title-width update and
  prefix count. Text scans, span sums and returned owner-bill sums pay separately.
- Every company/project/indexed-writer/research loop keeps a visit charge,
  including rows producing no member. Busy-member append pays its literal array
  write and text span, plus the paid stored-span sum.
- The talent walk prepays visit/text/busy-lookup argument work; its local busy
  scan pays visits and exact comparisons. Query-array appends are prepaid.
- Cold-index discovery prepays row/text/control work. Prefix count updates,
  stored-span additions, both key calculations, all bill sums/products and later
  query calculations are charged BEFORE evaluation.
- No free calculation, tail refund, per-plan reset, remaining-budget estimate,
  global cache or source-identity memo was introduced. `persistedProductionIds`
  and the actual allocator still run separately for each admitted sibling.

## Preserved scope / limitations

All actual owner modules, identity/actions exact move, kernel, validators,
protected tests, limits and timeouts are untouched. Original ready/started
orchestration, provenance, complete ledger, project linkage, command ordering,
affordability exclusion and the cumulative200000 counter remain unchanged.
No new unsupported-phase cut or market eligibility rule was introduced.

These are source-derived tighter reservations, not numerical acceptance. The
freelancer path STILL pays full all-stored-key Map comparisons plus a genuinely
cold full index. Its calculator itself also consumes work; therefore remaining
work-limit behavior is a concrete possibility until parent checks. Do not infer
Green from the width/count improvement or change the metric to force it.

Next: parent bounded source review270, root/UI271, Ready13 target272, original26
273, adjacent274 and bridge275, all on this fixed candidate. Attribute any
remaining failure from new raw evidence before another correction. No source
writer remains active after this handback.
