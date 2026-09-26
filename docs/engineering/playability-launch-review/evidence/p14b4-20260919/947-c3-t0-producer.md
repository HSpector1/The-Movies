# 947 — bounded diagnosis of945's runtime equality failure

2026-09-26. **Prepared, not executed.** The failed944 producer remains unchanged at
SHA256 `133507f0628cc8e4662b35dcfa1a890236f520346bde3f1acf692c85898b8156`.
945 remains the raw failed record: child1, fixedExistingSource:true, no outputs,
source `1f44aa505c0d677430451ab5fcacaf5e0ce205d6`, existing consumed source equal to
qualified9afae887. Nothing here rewrites or relabels that evidence.

945 reached genuine releases at17/26/35, announcement104, natural retirement208,
and accepted BridgeSession advance207→208. The first runtime-versus-continuous
serialized save equality failed. Node truncated the long actual/expected strings;
there is not yet an exact difference attribution. No fixture file was written.

Frozen947 producer SHA256 (file inspection only):
`938615b2c2a74cca8f025d21f586cae6ef107f8fc87c6fcc4ae9c2200a2f5a5f`.

947 is a diagnostic copy of944. Public authoring, funding, action/tick sequence,
timing bounds, real takes/releases, retirement assertions, source pins, validation,
runtime command and safe-write policy are unchanged. Its own header/producer path
identify947. Two pre207 structured clones are retained for diagnostics; they run no new
tick, import, action, migration or state mutation and preserve negative zero. The exact byte-equality oracle
still fails on every difference; it is not replaced with structural equality.

The mismatch handler prints bounded evidence before throwing:

- Both serialized208 hashes/byte counts and the first differing string offset.
- Every structural differing-leaf count after parsing both208 JSON payloads,
  with the first32 paths and values plus omitted count.
- Pre207 in-memory state against the serialized207 state, serialized207 against
  the actual BridgeSession import, and in-memory207 against that import.
- Actual player film ids released at208 in each branch, to assess the source-path
  difference described below without guessing whether it affected this tick.

The structural walk covers the full values and sorts object keys for stable paths.
It distinguishes arrays, missing keys, null, undefined, scalar types, nonfinite
numbers and negative zero. Strings longer than160 characters report a bounded
prefix, length and hash; whole object/array differences report shape summaries.
Negative zero is one inspectable fact, not the proposed explanation. No full save
is printed by this failure handler, and artifact creation remains after all checks.

## Source inspection finding, not runtime attribution

`BridgeSession.advanceOutcome` (`bridge/session.ts:388`) invokes the UI adapter's
`advanceWeek`. `ui/src/engine/adapter.ts:2485` calls `tick(state,{develop:true})`.
944's `step` calls `tick(state)`; its default develop flag is false
(`src/core/tick.ts:193–194`). The flagged growth branch uses player releases from
the current tick; rival releases apply their shared career consequences under both
modes (`tick.ts:923–947`). All three deliberately produced player films had already
released by35, while the mismatch is207→208. These source facts alone therefore do
not establish the mismatch's cause. The producer's earlier player releases also
used default development; their genuine first takes and captured credits must not
be mistaken for proof that normal-play development/career-event effects occurred.

`BridgeSession.fromSaveJson` parses through the actual current importer/migrator
and reconstructs its saved slot from the imported state (`session.ts:1371`). The
new pre207 diagnostics distinguish serialization/import differences from changes
that arise only during the advance. No production or oracle correction is made.

Parent may run947 under a new recorded attempt after review, using the same
fixture-safe mode as944:

```sh
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/947-c3-t0-producer.ts --write
```

All source and both producers remain frozen during execution. Any failure remains
a separate retained result; only concrete diagnostics can authorize a subsequent
premise or implementation correction. No probe, test, typecheck or generator was
executed by this specialist while preparing947.
