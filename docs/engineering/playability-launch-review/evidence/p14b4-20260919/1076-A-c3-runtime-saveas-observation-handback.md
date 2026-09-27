# 1076-A — Standalone R8 observation handback

Parent-authorized producer `1076-c3-runtime-saveas-observation.ts` is frozen at
18,769 bytes, SHA-256
`bfd541c4e7785f960095724b309689aba9a085cc2827ac8830740525d0072806`.
It pins published HEAD `e6475aca1ef3bdfd593d660743ebc311981836cc` and current
protocol 4 / projection 53 schema
`sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d`.
The author has executed no producer, test, compiler, generator or gameplay.
Tests, production, generated artifacts and fixtures are unchanged.

Parent's command, with a recorder stem distinct from this producer:

```sh
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/1076-c3-runtime-saveas-observation.ts
```

The input is only genuine953 pre-retirement week207. The producer checks the
manifest (`b3a3251a…4294`), compressed input (`926de1b2…5a0`) and raw input
(`d6ad88d4…1045`) against complete embedded literals, including outgoing source,
producer, Save37/projection52 and known-parity-FAIL metadata. It proves strict37
original bytes, performs actual live migration, and validates whole Save38
without mutating the state. No fixture helper or Vitest import is used.

The actual coordinator uses its real campaign/checkpoint codecs with an injected
in-memory store and unchanged runtime limits. The original R8 requirements remain:

- Actual Save As A207; actual advance to208; both real Actor-to-target choices.
- Actual Save As B208 with a distinct campaign/session and complete saved slots.
- Repeating the same Save As request returns the original response, writes nothing,
  preserves exact store bytes and leaves exactly the original two records.
- Actual advance to209 and actual SAVE B209, followed by an observed clean catalogue
  and complete saved/current209 slots before `requireClean` Load A207.
- Load A preserves exact B209; actual close and restart retain exact A207/B209
  records, restore A207 and keep its session/journal separate from B209.
- Exactly two advances are reserved before dispatch and completed afterward.
  Exactly one fresh-session factory call across initial start and restart proves
  restart did not fall back to a new game. This is the reviewer's optional
  strengthening; it adds no operation or tick.

Exact immutable store/checkpoint text keys the inspection caches. Every distinct
checkpoint still passes its actual decoder and current-save validation; the
producer does not construct inspection-only sessions or repeat accepted decodes.
Operation and inspection phases report separate elapsed times and bounded failure
messages. A returned operation is not qualified solely by a timing row: subsequent
accepted/state assertions and the final completion marker remain mandatory.

The first failure stops the route, without retry. Cleanup closes the real current
coordinator in `finally`. The success marker
`R8_ALL_ORIGINAL_ASSERTIONS_COMPLETED` is emitted only after all original assertions,
the two-advance accounting, cleanup and source/input/producer rechecks succeed.
Otherwise the producer emits `R8_STOPPED_AT_FIRST_FAILURE` and exits unsuccessfully.
Stdout is bounded to1MiB and contains phases, hashes and counters, not raw worlds or
checkpoint payloads. The producer writes no files; the store is only in memory.

Both recorded Vitest timeout failures (1033 and1043) remain evidence. This separate
observation does not change the test, its timeout or its operation sequence and
cannot establish a latency, native-runtime or real-disk result. No successful
execution is claimed by this handback. The parent separately records the producer
SHA before/after because this docs-only TypeScript path is outside consumed source.
