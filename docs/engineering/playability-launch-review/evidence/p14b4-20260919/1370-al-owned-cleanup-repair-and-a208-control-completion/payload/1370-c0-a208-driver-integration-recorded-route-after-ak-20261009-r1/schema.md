# Driver integration controls, held recorded route

This route adds driver-tail integration qualification to the preserved pure-module
control pass. It does not run the 17-method observer route, import either driver's
top-level timer, create test processes inside the tester, signal real targets or
admit game/cleanup acceptance. Source preparation executed no controls or wrapper.

The pinned tester CLI is `controls.py r2DrivePath r2SHA r1DrivePath r1SHA`.
R1 is drive.py `0a4934e6…`; r2 is `73519d81…`. The tester authenticates both source
files, requires r2 to be exactly r1 plus STOP in main's global declaration, and
executes only an AST-derived main tail and injected helpers. File reads and the
summary output authenticate/report the controls; `realIO=false` describes the
synthetic main-tail I/O, not absence of those source/report reads.

The producer is one JSON line at most 12288 bytes, with empty stderr. Its exact
schema is `a208-independent-driver-integration-controls/v1`, successful status
`DRIVER_INTEGRATION_CONTROLS_PASS`, expected/observed RED counts2 and GREEN
counts10, twelve ordered cases, failure null, and game/realIO/realSignals/
driverTopLevelImported all false. CONFIG specifies the full case roster. Both
RED cases must report UnboundLocalError, name STOP, source lines185/187,
refusal/clean branches and zero result writes. GREEN rows must have only case
and GREEN status. Duplicate keys, nonfinite JSON, wrong types/counts/order,
extra fields, a prior module-control producer or any stderr are refused.

The recorder's 17 non-main functions/classes, including owned-before-exec,
READY/GO, stream handling, cleanup and finalization guards, retain exact ASTs
from sealed pure recorder `4d781e20…`. Its changed main authenticates the new
tester/driver roles and exact protocol. Limits remain child20/active25/whole30
seconds and64KiB per stream. The whole recorder clock starts before its role
authentication and remains armed through ownership, cleanup, raw writes and
finalization. Any nonzero, timeout, override or unknown cleanup remains STOP.

CONFIG runtimeGrant/rootSourceOnlyReview and ROUTE review/grant/outcome are null.
The explicit actualGrantAndReviewOutsideConfig contract permits the parent to
invoke only the independently reviewed one-shot wrapper. Direct recorder use is
ungranted. The wrapper requires an exact external receipt with decision
`ACCEPT_SOURCE_ONLY_DRIVER_INTEGRATION_FILLED_ROUTE_AND_WRAPPER`, matching wrapper
role and SOURCE-PINS SHA, then authenticates all pinned sources/tools, current
AK/src/clean state, origin/main/working refs, AC power, disk and absent sole lane.
It writes the once-only actual grant before the helper starts. This external
review/grant contract avoids rewriting sealed CONFIG solely for source review.

Fresh outputs use r2-named driver-integration parent/lane/output paths; previous
pure outputs and failed r1 diagnostics are untouched. Protection is explicitly
bounded physical directory identity/mode/mtime/ctime at the eight named roots,
before/after the helper, with equality required. It is not a full file inventory
or a claim of metadata continuity across documentation publication. Actual
wrapper/helper/recorder/tester exit0, complete protocol, bounds and reviewed
observed evidence are all required before integration controls can be adopted.
