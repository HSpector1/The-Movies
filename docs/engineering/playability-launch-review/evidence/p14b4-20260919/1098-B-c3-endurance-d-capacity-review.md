# 1098-B — Independent D capacity and evidence-protocol review

**KEEP for the bounded proposal in1098-A**, using one separately named producer
for all remaining B/C/D and only the exact completed original A as an eligible
legacy reference. This is a technical evidence-format amendment, not a gameplay
or cap change. It is not source implementation, execution release or D
qualification. Parent adoption, an exact candidate/source review, codec checks
and the actual type gate still precede use.

The reviewed1098-A is12,804 bytes/SHA
`203139d1e218b58650ccd4745922026569d6e3f924900eacf771afc5f3512295`.
Review used only existing file bytes, standard-library parsing/hashing and
in-memory encoding/decoding; no project imports, gameplay, compiler, artifact
rewrite or consumed-source change.

## Independently reproduced capacity facts

Completed A observations contain9,240 rows/13,032,982 bytes. The2,090 lifecycle
rows account for10,518,323 bytes;121 read rows account for1,196,212. The source
and ordered command trace establish119 first-decision weeks in52-week blocks,
with only block3 absent and no overlap with13-week regular reads. Every trace
week containing a decision command has that command first; no earlier ordinary
weekly command masks that inference. Conditional on the required identical
replay and pure reads,481 regular plus119 decision groups yield600 D groups.
This remains a prospective source/trace derivation, not an executed D schedule.

D omits A's runtime observations and policy-only promise-feasibility rows.
Removing those, generic timing rows and read rows leaves11,747,110 measured
bytes. D's source records1,323 generic timing rows under that schedule. Independent
phase-specific arithmetic reproduces1098-A's minimum/mean/maximum observed-size
scenarios:17,115,650 /17,843,274.835 /18,053,334 bytes against16,777,216.
Those are sensitivity estimates: additional pages, ordinal parity and timing
spellings are unobserved. They are not a rigorous future lower bound. They do
show that launching the current format on an assumed margin is unsupported.

## Independently reproduced lossless demonstration

Using the exact closed log, a separate data-only implementation extracted raw
serialized focus suffixes, assigned first-seen IDs, emitted definitions before
use, retained other lines exactly and replaced only the lifecycle suffix with
its reference. It then independently decoded definitions/references in order.

| Check | Independently reproduced result |
| --- | --- |
|Distinct exact focus payloads|121 /591,151 bytes|
|Original repeated focus bytes|10,328,762|
|Encoded physical rows /bytes|9,361 /3,329,384|
|Encoded SHA|`2c1a9f08b3f5ee20189db844ee16f85fd1787ff006d1febd65c3af550ce8436c`|
|Decoded bytes /SHA|13,032,982 /`87dd429a8b513393c5fdf2daebc64bf51cf08263ddc4ef840597001d9c29ccc7`|
|Exact original-byte equality|PASS|
|Net savings including definitions/references|9,703,598 bytes|

No converted file was persisted. All original boundary weeks, roots, counts,
focus facts, logical ordering and timing precision survived exact reconstruction.
The proposed savings provide substantial empirical headroom, not a guarantee
that a new implementation has passed its bounds or roundtrip checks.

## Required implementation and lineage boundaries

- Keep original A, its metadata/inventory and the original66,372-byte producer
  unchanged. Use one separate producer revision for B/C/D. The original A's
  metadata SHA remains
  `3762178bb4a542b5f10014a55c78fead6bbfbbf2e4cecd70659cb69becc6163d`.
  No additional original-format B/C exception is needed or admitted by this
  proposal; subsequent references must share the new exact producer identity.
- Make the format explicit in new metadata and distinguish the executing
  producer from its reference lineage. The legacy exception must require the
  exact A directory/metadata/producer/seed/schema/source and complete unchanged
  inventory, including PASS/failure-null and original trace/authority checks.
  Matching schema or successful status alone cannot establish eligibility.
- The future allowlisted edit must be confined to artifact encoding/format
  metadata and the enumerated reference admission. In-memory reversal must
  reproduce the entire original source SHA
  `f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d`.
  Independently confirmed original `class Endurance` bounds are[13364,56657),
 43,293 bytes/SHA
  `3c356493a0515e88a75ca945d0ed2d0b0daed1a4b2414aeee811a531fc96ae8d`.
  That class remains byte-identical. Observer and all consumed project-source
  identities also remain identical to A; actual new HEAD/producer lineage must
  still be recorded honestly.
- Preflight the combined definition/reference append before writing and before
  committing dictionary state. Keep deterministic first-use IDs, prior-definition
  requirements, duplicate/unknown/malformed refusal and a dictionary bounded by
  the existing byte budget. Preserve16MiB compact files,256KiB individual read
  result, ten files,256MiB authority and1GiB directory caps. Keep exclusive
  creation, first-failure behavior, final PASS ordering and complete inventory
  guards. No dropped fact, rounded timing, extra artifact or hidden cap change.
- Require independent exact reconstruction and malformed/boundary refusal checks
  for the implemented codec. A successful in-memory proposal demonstration is
  not that implementation's test. Check unchanged append-cap failure behavior
  and source reversal before any long variant. B/C/D keep original sequence,
  command/cadence/read schedules, complete save/root comparisons and retained
 0/3120/6240 literal-byte equality.

No remaining product decision was found. The proposal preserves completed A
without repeating it merely to reformat evidence. Actual B/C/D parity remains
unproved, and all pre-existing failed attempts and coverage limits remain in
their records. A normal-format change cannot be used to normalize promise
receipts, the953 continuity defect or any gameplay difference.
