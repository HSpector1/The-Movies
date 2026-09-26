# 951 — preserve the genuine outgoing C.3 input corpus and its known parity defect

2026-09-26. **Prepared and frozen; not executed by the specialist.** This new
producer implements the parent's explicit post950 preservation decision. It does
not fix the digest defect, revise an earlier failed record, or qualify C.3.

Producer: `951-c3-t0-preservation-producer.ts`.
Frozen SHA256: `aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c`.
Exact HEAD: `1f44aa505c0d677430451ab5fcacaf5e0ce205d6`.
Existing consumed production/tests/fixtures must remain byte-identical to
`9afae8874486fbb20dc5d373526698aacbec2114`.
Outgoing format: Save37, projection52, protocol4, current schema
`sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2`.

## Preservation decision and evidence

The original continuous scenario is unchanged from944/947: the same seed,
disclosed funding bootstrap, six publicly authored people, public actions, three
real film releases,209 default core ticks, actual announcement104 and natural
retirement208. There are no diagnostic tick forks and no negative-zero or key-order
normalization. No age, clock, skill, work history, receipt or digest is fabricated.

This is explicitly the supported `tick(state)` path with `develop:false`, not a
normal-play development corpus. Its acting takes and release credits are genuine;
the flag suppresses the player development consequences that normal play enables.
The separate actual BridgeSession command imports saved207 and advances to208
with the adapter's `develop:true`. The manifest records both settings and sets
`normalPlayDevelopmentClaimed:false`.

Prior records remain authoritative and unchanged:

- 945: first mint attempt failed the original exact continuous/runtime equality;
  zero files written.
- 948: the bounded diagnostic found exactly12 parsed208 differences, all promise
  `feasibilityReceipt.inputsDigest` fields; zero files written.
- 950: controlled comparisons showed raw default equals raw development, raw
  development equals the negative-zero-only branch, and imported development
  equals the actual bridge advance. Every raw-versus-imported continuation still
  differed at those same12 digest fields. Input comparison found9376 differing
  object key orders and zero different key sets. The raw nested-object
  `JSON.stringify` digest path supplies the source attribution. The unchanged
  original parity oracle still failed. No production change or fixture write ran.

951 **replaces the original parity requirement with an explicit known-defect
preservation check under the parent's new authorization**. It is not a relaxed
implementation test or a claim that parity has become correct. Its manifest and
log retain `knownParityDefect.status:'FAIL'`, exact actual differences, both hashes,
the earlier evidence references, and the limit of a successful preservation run.
Independent regression coverage must precede the later production digest fix.

The two exact recorded raw Save37 identities are required again before writing:

| Actual branch at208 | SHA256 |
| --- | --- |
| Continuous default core ticks | `7de879a5c7a5ab4ffdac819734957572aa58349c5d59768c572c249339739a7f` |
| Actual public runtime current state | `414b3491ad4d6a7244c9af71e24a7bbe491106d9cf290e1ee30cb9a62b57fb84` |

These literals identify already measured baseline artifacts from948/950. They are
not invented expected future behavior. The producer obtains each world through
its original real continuation, exports and validates it, then checks its hash.
It also walks the entire pair of parsed saves, requires exactly12 distinct
differing leaves with no omitted differences, and admits only paths matching
`state.promises[index].feasibilityReceipt.inputsDigest`. Each differing value must
be an actual16-digit hexadecimal digest string. Any additional change refuses
preservation before writing. No actual receipt is overwritten with either value.

## Actual runtime provenance remains mandatory

Saved207 remains the actual original continuous save. The public command uses its
published `advanceWeek` intent, real session/revision identity and actual accepted
response. The exported checkpoint must contain exactly one real journal entry,
the original saved207 bytes and **the actual runtime current208 bytes**. Its
current digest names those runtime bytes; the continuous208 file is deliberately
recorded separately with parity FAIL.

All prior codec and recovery requirements remain:

- Whole Save37 validation and exact save export/import/export for every captured
  save, including both208 branches.
- Exact checkpoint encode/decode round trip, current52 load without migration,
  exact BridgeSession reopen and checkpoint re-export.
- Exact duplicate-command response replay after reopen with no second state
  change or journal append.
- Distinct current/saved slots, correct actual save and journal hashes, unchanged
  continuous retirement at209, and exactly209 continuous ticks.

The previous failed producers never reached these later runtime assertions. Their
success is still unproven until the parent executes951; the script does not claim
them from source inspection.

## Declared new outputs

The sole new directory remains `tests/fixtures/p14/genuine-v37-c3-corpus`.
There are exactly **nine gzip payloads plus one manifest**, ten new files:

| Filename | Actual origin |
| --- | --- |
| `genuine-v37-c3-created-week0.json.gz` | Continuous default-development state after public authoring/contracts |
| `genuine-v37-c3-three-real-releases.json.gz` | Continuous state after the three actual releases |
| `genuine-v37-c3-preannouncement-week103.json.gz` | Continuous state before announcement |
| `genuine-v37-c3-announced-week104.json.gz` | Continuous state with actual announcement |
| `genuine-v37-c3-preretirement-week207.json.gz` | Continuous state and the runtime's actual explicit saved slot |
| `genuine-v37-c3-retired-week208.json.gz` | Actual continuous retirement result, retaining its original receipts |
| `genuine-v37-c3-runtime-current208.json.gz` | Actual imported-and-advanced runtime result, retaining its distinct receipts |
| `runtime52-current208-saved207.json.gz` | Genuine accepted-command runtime checkpoint and journal |
| `genuine-v37-c3-postretirement-week209.json.gz` | Original continuous continuation after retirement |
| `MANIFEST.json` | Source/producer identities, authoring/action trace, actual evidence, hashes and explicit parity FAIL |

The exact nine payload filenames and unique count are asserted. The manifest adds
an origin label for each artifact and explicitly maps the runtime saved slot,
actual current slot and separate continuous208 artifact. It retains compressed
and uncompressed hashes/lengths, the actual film/take/credit evidence, source
identity, disclosure of funding, and the real command. No C.3 transition law or
transition outcome exists in these outgoing bytes.

Every premise, comparison, save/runtime validation and compression round trip runs
before any directory/file creation. The existing no-overwrite policy remains:
refuse an existing corpus, create only the declared new files with exclusive
`wx`, read back their compressed hashes, and verify existing source/HEAD/producer
identity plus the exact newly untracked output list. A later write failure must
be retained as evidence; no cleanup or retry over existing artifacts is authorized.

## Parent execution handoff

Default mode prepares and validates entirely in memory without creating files.
After review, only the parent may run the authorized mint with its dedicated
existing-source/new-output recorder:

```sh
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/951-c3-t0-preservation-producer.ts --write
```

The recorder should declare all ten outputs above. Existing source and HEAD stay
frozen for the full run. A successful child exit means the known-defect baseline
was faithfully preserved and the mandatory artifact checks completed; **runtime
versus continuous parity remains FAIL**. The specialist performed only file
authoring, source/diff inspection and file hashing, with no gameplay execution,
tests, typechecks, generators, commits or pushes.
