# 961 — serialization prerequisite verification (focused gates complete)

Source183252b2c3f1bb8399f68971c0576c213525159d plus recorded patches. Production
change only promises.ts: local pure input serializer sorts object keys before the
existing FNV hash, keeping arrays/scalars/omission semantics and receipt/rules4 law.
No stored receipt, fixture, classifier, input membership or capacity kernel changed.

| Record | Exact result | Source patch |
| --- | --- | --- |
|957 independent RED|5 expectedFAIL /5PASS, fixedSource:true,23.137s|5e97550af35620f52eca6bfeec56fd25aa9c14ec4d8588405e67f50f51fa8de8|
|958 GREEN|10PASS, fixedSource:true,19.765s|06e41a0f2658276e874d889c18c6c5a4d8e221aaea706c54d3a4a4621856c9d8|
|959 existing neighbors|3files36PASS, fixedSource:true,14.729s|same958patch|
|960 root/UI types attempt|child2,167×TS5097, fixedSource:true,31.727s; UI stage not reached|same958patch|

957's expected failures reach the P1/P2 digest equality, exact refusal equality,
twelve genuine208 receipts and actual BridgeSession208 full-save equality. Setup,
classification, non-digest facts and original-history controls pass. All five fail
solely due to object ordering, not absent APIs or fixture construction. Raw3.4MB
diagnostic retained.958 passes all ten without altering an assertion or timeout.
959 covers p14b3-reservations, p14b4-cast-class-capacity and p14bf2-acting-discipline.

Independent reviewer c2rm_contract_review: KEEP stable production diff and955 tests.
Only serialization changes; recursive sorting preserves native JSON semantics and
does not mutate inputs. Tests are relational requirements, no copied serializer or
new expected digest literals. The interim52 duplicate-command control proves cached
historical authority preservation, not re-execution of old gameplay under corrected
code. Both genuine208 files and their parityFAIL remain unchanged. Final52→53 reset
still requires its own gate; no new schema/product law is needed for this repair.

960 attribution: the new core-named test imports four bridge.ts modules, pulling the
entire bridge/UI .ts import graph into root tsconfig, which excludes only
tests/bridge*.test.ts and owns emitted core .js imports. All167 diagnostics are
TS5097, no different error class. The explicit bridge config permits.ts imports and
includes bridge-prefixed tests. This is a new test ownership/layout defect, not a
serializer type error or justification to loosen compiler configuration.

At the960 checkpoint, the author was splitting two bridge/runtime cases into bridge-p14c3-promise-digest-
continuity.test.ts, leaving eight core cases. All ten requirements remain; no config,
timeout or fixture change. After frozen handback, parent repeats the changed test
files and root/UI plus bridge types under the exact new patch. Those gates were
pending at960; their final results are recorded below.

All four listed runs are closed. C.3 actual implementation remains gated;963 plans
independent RED after the corrected prerequisite checkpoint. The complete C.3 full
regression/endurance/native limits remain as942/946, not discharged by focused tests.

## Final layout and closed gates

All ten original case bodies preserved exactly,8core+2bridge. Independent bounded
layout reviewKEEP: all seven original declarations (including parametrizations)
appear exactly once; shared provenance/permutation helpers unchanged. No assertions,
timeouts, expected digests or compatibility requirements weakened. Existing root
exclusion/bridge inclusion owns the split; no compiler configuration changed.

Final exact combined production/tests patch:
4d84f709b1608a037959b6e15496bd7f7d1287eab3a7d18c5f3e49ba52327b46.

-962:2files10PASS, fixedSource:true,19:30:34.717Z–19:30:51.491Z,16.774seconds.
-964:root AND UI typesPASS, fixedSource:true,19:31:34.450Z–19:32:44.888Z,70.438seconds.
-965:bridge typesPASS, fixedSource:true,19:32:59.597Z–19:33:28.062Z,28.465seconds.

Source/HEAD remained fixed during every run. No process is active.959's36neighbor
cases remain applicable: production has not changed since that run, only the test
ownership split. No broader repeat is justified before C.3's required final gates.
The original960 type failure remains preserved and attributed above.

Serialization prerequisite: focused verification COMPLETE, independentKEEP. Genuine
old receipts and runtime cached duplicate authority are preserved; no old-gameplay
re-execution compatibility claim. Save37/projection52/protocol4/promise4 unchanged.
This is not a new full-suite/native qualification. Publish966 recoverable checkpoint,
then begin independent C.3 RED under reviewed942/946 and946-A/B; no routine approval.
