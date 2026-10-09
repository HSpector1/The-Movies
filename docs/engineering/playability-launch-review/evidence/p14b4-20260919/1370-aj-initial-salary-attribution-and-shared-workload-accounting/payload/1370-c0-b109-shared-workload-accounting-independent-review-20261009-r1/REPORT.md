The benchmark factor110×(16state +9whole-row encodes) models approximately ONE arm of the frozen B109 implementation. It cannot be treated as the complete shared300-second route workload or as87seconds of headroom. This corrects interpretation of the workload label; it does not invalidate original equivalence/refusal tests or the measured same-run308benchmark.

I authenticated MANIFEST67945d92, continuation56623bb2, streaming12c37ac and recorderbbffa0b6. admit serializes2states and2whole rows; capture including its admit serializes5states/2rows; parseRow serializes1state; ordinary append uses jsonLine to serialize1whole row. proveRepresentation itself adds no full-state encoder call. Both baseline and intervention execute these same fixed core checks.

| Successful scope, per arm | State calls | Whole ordinary row calls |
| --- | ---: | ---: |
| Initial307 parse/admit/clone/hash |5|2|
|110capture/append/external admissions +109tick purity pairs |1098|550|
|110actual+external full readback admissions |660|440|
|Exact per-arm total |1763|992|
|Exact both-arm total |3526|1984|

The coarse110×(16,9) factor gives1760states/990rows per arm. Missing307tick purity subtracts2states while initial admission/clone adds5states/2rows, making the exact difference +3states/+2rows per arm. Readback includes two parseRow+admit paths at every boundary for BOTH arms, as source143–146shows. Intervention additionally serializes difference/family data; those variable serializers are outside this fixed full-state/ordinary-row count.

run.py sets started_tests only once at first child launch (444–446). Both READY/GO, polling and late-exit guards use started_tests+COMBINED with COMBINED300; it is not reset for the intervention. Inter-arm verification and second mirror assembly also consume that elapsed clock. The per-test Vitest300000ms literal creates no second recorder budget. Active375andwhole390are unchanged.

Using the parent-provided already accepted early308candidate medians62.986398ms/state and102.508800ms/row, the original coarse212.33977248seconds is one-arm illustrative encoder arithmetic. Two like arms give424.67954496seconds; exact frozen call weights give212.733749274seconds per arm or425.467498548seconds for two like arms. These are illustrations, not measured complete runtime or lower bounds. Actual intervention and later states can differ, and native save/export/import serialization, tick, gzip, readback decoding/hashing, comparisons/family/summary/helper operations, assembly and framework costs are omitted. No new execution or capture decoding occurred.

Preserve original benchmark status/payload/pins and the accepted narrow31.709468168percent same-run workload reduction. Authoritative future notes should label its projection as one-arm early-fixture encoder-only proxy, attach the shared-workload correction, and retain no-integration/no-full109-retry limits. A later performance design must account for both arms within the unchanged shared300cap; this accounting alone supplies no new launch or bounds authorization.
