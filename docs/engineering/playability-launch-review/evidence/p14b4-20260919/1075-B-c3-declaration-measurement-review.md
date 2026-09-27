# 1075-B — Independent declaration measurement review

Disposition: **KEEP for the bounded parent-run measurement**. This is a static
review; the reviewer ran no generator, test, compiler or gameplay. No new
declaration-body identity is claimed before a recorded successful observation.

The frozen producer is `1075-c3-declaration-measurement.ts`, 6,877 bytes, SHA-256
`21188b750289ad4e51e337b2346cdfff706fbb817b79c2526a49f7b24c85c54b`.
The reviewer independently matched that hash and the handback hash
`f80a56860a57c04183d898e201ecfc72de9a6a3adca50b935d8cee553769a6d8`.
Its exact HEAD pin is published
`e6475aca1ef3bdfd593d660743ebc311981836cc`.

The producer imports the actual declaration generator and immutable fixture
definitions. The fixture source at lines226–235 confirms F10 and F11 both use
the whole current `BRIDGE_SCHEMA`, while F12 remains the separate frozen P05
sentinel. The eight positive names exclude the four negative fixtures. Each is
rendered twice, with exact-string determinism required before recording its
UTF-8 byte count and SHA. All six fixed literals agree with the independent930
record and current exact-pin test; neither expected values nor new measured
values are copied from a failed assertion. F10/F11 must match each other and
differ from their previous `90a51d95…` body.

Protocol4/projection53, canonical schema identity, pretty-schema bytes, manifest
and complete generated C# bytes are checked before rendering. The complete
860,452-byte C# identity is explicitly labelled as distinct from a declaration
body. This avoids substituting the full generated-file hash for either current
fixture's body hash.

Before and after work, the producer compares actual HEAD, consumed-source Git
diff, absence of untracked consumed files, fourteen explicit input hashes and
its own bytes. A pre-existing recorded diff is captured rather than falsely
described as an empty source tree. The parent still records the docs-only
producer hash independently around execution. There are exactly sixteen
renders, zero gameplay calls and no file writes; successful stdout is bounded
to1MiB and emitted only after all assertions and drift checks. An assertion
failure cannot emit the successful completion marker.

The original929/930 evidence, frozen fixture identities, generated artifacts and
tests are preserved. A successful observation may support separately attributed
current F10/F11 pin maintenance; it does not qualify full regression, frozen
readers, gameplay or runtime endurance.

## Recorded1047 result

The reviewer read the complete1047 raw output and closure metadata. The parent's
recorded measurement ran from `2026-09-27T01:53:27.878Z` through
`01:53:29.767Z` (1.889 seconds), exited0 without a signal/error, and recorded
`fixedSource:true` on the pinned `e6475aca…` HEAD with an empty consumed-source
diff and no untracked source. The producer's own hash, fourteen input hashes and
source drift checks passed. Exactly sixteen renders and zero ticks completed.

Both F10 and F11 measured **401,842 UTF-8 bytes**, SHA-256
`4ab4141390d2d17c35da0d1bf64cce841f1608103146b2cbca6212ab114a8cec`.
Both repeated renders were identical and differ from the preserved previous
`90a51d95…` identity. The six fixed positives match their original identities:
F01 452 bytes, F02 648, F03 1,072, F04 5,462, F09 5,087 and F12 15,018.
The actual completion marker is
`ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED`.

Final bounded disposition: **KEEP**. These independent measured current body
identities support subsequent attributed pin maintenance. The complete C# file
remains the separately pinned860,452-byte artifact. No tests, generated files or
historical fixtures were changed by this measurement, and no broader
qualification follows from its success.
