# 175 — Restricted first-take owner-work bill review

Native contract-auditor returned this complete review; parent persisted it.

DONE — **KEEP as a conditional paper bill.** No concrete undercharge found in the restricted existing-owner body. `SORT_AND_KEYS` and replay-wide composition remain incomplete; this is not executable replay authorization.

No files changed and no runtime, tests, typechecks or probes performed.

## Exact inspected identities

- `162-first-take-owner-work-bill.md`: `15a727826adc355fa6aab2829194aa957626c8a89809028ba76679c0dc7ba72c`
- `src/core/operations.ts`: `9935b09495df1d11f39bf3b1a37b244c3d7bf7d0994cd4c8ce286571b3be3411`
- `src/core/boundedStableSort.ts`: `87861f3ceefe2b2a9163a34bd9762a991d5c8a7f1640b84fbe6d1133f33ff964`

Reviewed against the accepted restrictions in137/148/157. Did not inspect mutable169.

## MET WITH SOURCE/PAPER EVIDENCE

**Restricted branches and repetition.** At `operations.ts:1654–1783`, every allowed picture settles on its first visit. Only admitted releases set `progressed`; their required empty reservations prevent the restart/break arm. Therefore `1 + indicator(R > 0)` rounds, `N × rounds` visits, `A` workflow finds, `T` replacement maps and `R` removal filters are correct. The optional second round performs only settled-membership checks. No allocation, setup, geometry, policy, genre or Set-wear callback executes in this domain.

**Repeated collections, strings and copies.** The associative coefficient correctly includes initial writes, every settled check/add, active lookup, changed-value write and both final-map lookups. Original workflow-array size safely bounds later shortened arrays. Equality charges include both operands on every find/map/filter visit. Production, workflow, task and operations spreads retain their separately measured shallow-copy costs; nested opaque values are not falsely traversed.

Phase/task/mode comparisons and output construction are represented. `recordReservationTransition` at `operations.ts:554–574` is still invoked for each release: its two empty maps, allocations and iteration setup are covered by the11-unit reservation; zero callback bodies or receipt appends are claimed.

**Literal footprints and arithmetic.** Independently checked against `types.ts:237`, `623`, `740` and `760`:

| Record | Keys | Key-length sum | Copy bill |
| --- | ---: | ---: | ---: |
| Production with participants |13|110|150|
| StudioOperations |3|23|33|
| ProductionWorkflow |8|73|98|
| ShootingTask |5|50|66|

The resulting component substitutions and sums are correct: **962 for one picture;2,436 for two, excluding `SORT_AND_KEYS`.** These are conditional upper bounds for the stated records and ID lengths—not generic record caps.

**Honest accounting model.** The bill expressly measures named source blocks, primitive invocations, consumed string spans and shallow reference/property work. It does not claim a bound on native hashing, regex/number-conversion machine code, backing-store allocation or CPU time.

## PARTIAL — sorting and composition

The inventory agrees with the actual helper: fresh initial copy, optional auxiliary array, arithmetic passes/runs, complete tail writes, left selection for final NaN/ties, and no trailing copy (`boundedStableSort.ts:31–59`). Production keys are prepared once per row at `operations.ts:1486–1501`; repeated lexical comparisons remain separately chargeable.

Before a prepaid caller exists, explicitly scalarize:

- Helper initialization, allocation/copy invocation, early return, pass/run setup and termination, two `Math.min` calls per run, merge/tail control, NaN selection, swaps and return.
- Decoration/undecoration invocation, allocation, tuple/record construction, callbacks and reference writes; regex/Number span charges and both possible lexical comparisons per comparator.
- Checked/saturating preparation arithmetic and any cost-query execution itself.

Then compose—not silently absorb—context validation/footprints, commands, other owner calls, sink handling, ledger/projection construction and kernel work. No whole-replay total or compliance with the shared200,000 allowance follows yet.

## Required interpretation retained

A sweep from weekw stamps its first take at(w+1,0). IfH=w+1, that event is outside the half-open credited interval. Extending throughH>=w+2 requires accounting for the actual subsequent **4→3 wrap**, outside this restricted bill, including its real owner consequences.

Even an in-window single take does not establish the buffer targetB=2, eight-week slack, ACHIEVABLE status, or complete choice coverage.

Next action: complete the sorting scalar against the frozen implementation, then review the full proposed caller composition and independently guarded reachable controls before granting replay implementation authority.
