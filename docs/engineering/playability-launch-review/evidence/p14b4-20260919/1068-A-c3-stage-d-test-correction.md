# 1068-A — Stage D bounded test correction

Parent1033 recorded24 core leaves on the frozen1065 sources:4PASS/20FAIL,
74.588 seconds, fixed source. The original record and1065 handback remain intact.
The parent released only the two changes below after the original run closed.
No test, simulation, probe, compiler or generator was executed by this author.
All six Stage D sources are frozen again; the other four files are unchanged.

| Corrected path | Original1065 SHA-256 | Corrected SHA-256 | Bytes |
| --- | --- | --- | ---: |
| `tests/bridge-p14c3-read-models.test.ts` | `30662c4b799173816608dd88e3be7ed4e6b104e19bc7c99faca92260c1a522f4` | `f22036172d0534e5a98d8f9957e1c6950a6ec201eaf57e09edb74c8a8d9c7c62` | 25,833 |
| `tests/bridge-p14c3-runtime.test.ts` | `357effc4c58c7604769e323718bff7b7a6163f72d9e266bc7090cdc1fd4917fa` | `f04e2d62630b434e9910f3924d610a002204afc50a05ec7724403b3a2c1416b2` | 21,771 |

Ordered six-new-file patch, using1065 order and concatenated
`git diff --no-index -- /dev/null <path>`:77,642 bytes, SHA-256
`cbf95aa30ea14b31711db2f31910f6189d4b19edb6663485132ea29eee4afdb2`.
The two-file correction alone, using Python `difflib.unified_diff` with original
bytes reconstructed from1033.patch and verified against both original hashes,
`a/<path>`/`b/<path>` names and table order, is8,435 bytes, SHA-256
`82b552aa5dd5f28016425d40815367822c2e1f2fffe5b17bbe6aac10e4803d4d`.
These are source identities, not new measured outcomes.

## M1 false premise and M3 positive development evidence

1033 M1 failed at its initial `existing.rows.length > 0` assertion. This was a
test-premise error: the genuine outgoing953 films used `develop:false`. Their
captured acting credits are real, but they carry no frozen development events.
Existing `buildCareer` in `bridge/people.ts:700–746` truthfully publishes empty
rows and partial attribution for credits without those events. A release must
not be used to invent development history.

The corrected M1 independently recounts captured player/simulation role credits
and the person's player plus Hollywood career events. It requires positive
captured credits, zero actual events and zero uncaptured films, then checks empty
development rows, exact missing-event credit count, partial provenance and the
existing partial-history notice. All additive schema, child enums/nullability,
required fields, unknown-key refusals and unchanged old `career` checks remain.
The missing53 definitions remain downstream requirements to observe on rerun.

M3 already produced a real new-role film with `develop:true` and passed its
relationship requirements in1033. On that same cached branch and its actual
reload, the corrected leaf additionally requires a recorded Director development
event for the newly released film, nonempty public development rows and exact
visible event IDs/order. Public film identity/title, release date/week, genre,
discipline, OVR before/after and reason codes are compared to the actual retained
events. Every existing relationship and disclosure assertion remains. This uses
the existing qualified9-call film branch without adding another call or setup.

## R8 inspection overhead, original timeout retained

1033 R8 timed out at the unchanged5000ms default (reported leaf duration5879ms).
Its first durable advance was reserved but had not completed in the recorded
test; the runtime file's totals were3 reserved/2 completed, including the two
successful R4 Scientist commands. This is an observed timeout, not a claim that
the downstream Save As/Save/Load/restart assertions ran or passed.

The original inspection helper decoded/validated both checkpoint slots and its
journal, then constructed another BridgeSession solely to obtain a GameState.
That session re-imported the already validated current slot. Repeated calls also
decompressed the same unchanged library and decoded the same checkpoint text.

The correction memoizes actual decoded libraries by exact `store.contents` and
full hydrated checkpoints by exact raw checkpoint text. Every distinct observed
checkpoint still uses `decodeBridgeRuntimeCheckpoint`; its already validated
`currentSave.state`/`savedSave.state` provides inspection facts. Cache values are
used only for reads. Real coordinator startup, serialization, atomic writes,
actual commands, duplicate replay, Save As, SAVE B209, requireClean LOAD A207 and
actual restart still execute unchanged. Production performs its own restart
validation; the test caches do not intercept it. The final saved-slot assertion
now reads the strict decoded Save38 slot instead of importing it a second time.

No timeout, command, request, case boundary, test count or required assertion was
removed or relaxed. The first timeout remains evidence. No speed improvement or
future pass is claimed before the parent's next recorded result; a remaining
timeout must stay explicit. The suite remains27 leaves/max486 actual advances.

## Unchanged first causes and remaining scope

The actual changed-world212 simultaneous-active-assignment refusal found by1033
is separate from these test corrections. Neither helper nor production was
changed to bypass it. The reviewer is investigating that real continuation
failure; a bounded diagnostic requires separate release. Prior52 dispatch,
missing53 public fields and other observed downstream limits remain attributed
to their own first causes. Existing frozen51/52/Save37 inputs, known parity
defect, and all earlier failed records remain unchanged.
