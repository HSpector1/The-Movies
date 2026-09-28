# 1306-C: first Save40 producer run failed its week-265 premise

The parent ran the reviewed producer r2 once under the bounded recorder on published
`5627fd1147e067dc92ed5827545250fc195ee47f`: bounded pre, `node_modules/.bin/vite-node
.../1306-save40-outgoing-producer-r2.ts` with `P14_SAVE40_PRODUCER_HEAD` set, bounded post. The recorder reports child
exit 1, no signal or recorder error, fixed source, UTC 09:00:50.356–09:01:00.523. The bounded post closed with
`allGuardsExact:true`. Raw [1306-save40-outgoing-run.txt](1306-save40-outgoing-run.txt) is 45,194 bytes /
`b6c7d07179583375790e67d7b2a61bfdb8d75ea4c760f302cc413f207c6c4dbc`.

## What happened

The week-110 input completed every step and premise: 4 rivals with 3 finance periods each, 24 active rival
employments, zero rival termination receipts, exactly one player termination ledger row and one player termination
receipt, 4 `laboratoryCommitted` and 4 `laboratoryOperational`. Its gzip and provenance were written.

The week-265 input then failed its own premise assertion (r2 line 77, "route premise: measured S8 rival research
facts") before writing anything. No MANIFEST was written. The premise required every one of the five
`RIVAL_RESEARCH_RECEIPT_KINDS` to be present at week 265. The measured S8 timeline the route cites
(`tests/bridge-p13b-s8-rivals.test.ts:26-44`, `:199`) records `instrumentOperational` and `researchSeatAssigned` at
265, `researchCompleted` at 276 and the second `laboratoryOperational` at 278. At week 265 `researchCompleted` cannot
be present. The premise was the parent's error, missed in review. The route and engine behaved as measured.

## Disposition

- No retry of r2. The failed run's records stay as they are.
- The partial output (week-110 gzip and provenance) was moved byte for byte from
  `tests/fixtures/p14/genuine-v40-pre-r3/` into [1306-failed-partial-output/](1306-failed-partial-output/), so no
  partial fixture directory remains where a test could mistake it for a complete input. Hashes before and after the
  move are identical: gzip 122,176 B / `196b73d43ac6e346c6b6e6a73e0b13f16bc23a1f5d321947067d6f81ca774bd8`,
  provenance `691260cc10c4b44affa52261f7ac2d68a14bd6a42ebd9ba952f2bbc569312eaf`.
- Revision r3 changes only the second route's week (265 to 280), its name, its comment and the producer path in
  provenance. At 280 all five kinds are present on today's source: `tests/bridge-p13b-s8-rivals.test.ts` passed in
  1302 on `993e6b01` and asserts all of them at its natural week 277.
- The rerun (1306b) re-produces the week-110 input from scratch. Byte equality with the preserved partial gzip is a
  determinism check on the same source.
