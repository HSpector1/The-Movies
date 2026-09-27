# 1075-A — Independent53 declaration measurement handback

Parent-released1074 proposal, pinned to published
`e6475aca1ef3bdfd593d660743ebc311981836cc`. New producer
`1075-c3-declaration-measurement.ts` is frozen at6,877 bytes, SHA-256
`21188b750289ad4e51e337b2346cdfff706fbb817b79c2526a49f7b24c85c54b`.
The author executed no generator, compiler, test or gameplay. Original929/930,
all tests, generated artifacts and fixtures are unchanged.

Parent's exact command, using a fresh recorder stem distinct from this producer:

```sh
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/1075-c3-declaration-measurement.ts
```

The producer imports only Node assertions/read tools, actual generator/schema
code and the immutable union-fixture module. It validates protocol4/projection53,
actual schema identity `sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d`,
the generated manifest/schema bytes and complete860,452-byte C# file identity
`c727219216f5f71cb35e9b6116b7288da0d0343810e9cee447c5216988ce48b7`.
That complete-file hash is explicitly separate from the unmeasured declaration
body hashes. No expected body value comes from a failure or a self-derived test.

Exactly8 positive fixtures render twice (16 total renders, zero ticks): F01,
F02, F03, F04, F09, F10, F11, F12. The six fixed literals are copied with930
provenance and must stay unchanged, including frozen P05 F12. Negative fixtures
F05–F08 are not mistakenly treated as positive outputs. F10/F11 must match each
other in body hash/bytes and differ from their prior90a51d95… body. Each body's
bytes/hash/determinism/prior comparison is emitted only after all checks pass.

It records/rechecks HEAD, consumed-source diff,14 explicit input-file hashes and
its own bytes. Unrecorded consumed source or any drift refuses. Output is bounded
to1MiB stdout, with an explicit completion marker; there are no file writes.
The parent must separately record the docs-only producer SHA before/after. A
future observed value can authorize only attributed current pin maintenance;
this handback itself contains no new measurement or qualification.
