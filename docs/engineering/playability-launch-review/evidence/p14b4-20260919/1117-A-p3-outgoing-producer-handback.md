# 1117-A — outgoing preservation producer handback

Prepared under frozen 1116-A and independent 1116-B KEEP. No producer, compiler,
test, migration or gameplay was executed by the author. No live source, old
fixture, staged maintenance, index or HEAD was changed. The parent must finish
final C.3 qualification/publication and obtain independent source disposition
before running this producer at that actual source. This is preparation, not
P3 activation or a claim that the new premises already pass.

| New source | Bytes | SHA256 |
| --- | ---: | --- |
| `1117-p3-outgoing-preservation.ts` | 35,254 | `4c20d4ab26e55d283f17b91a518feac429063b60852931a429b589907a7f034d` |
| `1117-p3-outgoing-typecheck.mjs` | 3,786 | `4c78c5b781122cfc4f462a9e035d4d7023ad2b491f7cd4635cf54665fb471474` |

The producer uses direct public core/Bridge/coordinator APIs, Node assertions
and a local pinned gzip reader. It imports no Vitest tests or helpers. The
compiler wrapper uses the existing installed TypeScript library without
evaluating the producer or changing project compiler options.

## Exact later invocation

The separate no-evaluation compiler command is:

```sh
node docs/engineering/playability-launch-review/evidence/p14b4-20260919/1117-p3-outgoing-typecheck.mjs
```

It parses the unchanged Bridge configuration, adds the producer as an explicit
root and requires its actual graph to include the core save module, session,
runtime codec and coordinator. It also guards the original 1052 docs producer
already imported by the observer, both frozen 1116 documents, its own source and
the new producer. It reports actual roots/files/diagnostics, preserves all
options including `noEmit`, and checks consumed bytes, HEAD and index before and
after. This command itself has not been run.

After final C.3 is qualified and published, supply its actual HEAD and exact
qualification evidence path/hash. Use the installed `vite-node --script` path
with arguments directly after the producer; do not add a literal `--` argument:

```text
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/1117-p3-outgoing-preservation.ts --expected-head <actual final C3 HEAD> --qualification docs/engineering/playability-launch-review/evidence/p14b4-20260919/<actual qualification record> --qualification-sha256 <exact record SHA256> --audit-prefix docs/engineering/playability-launch-review/evidence/p14b4-20260919/1117-capture-01
```

Those four arguments are mandatory and closed. There is no default execution,
rehearsal, dry-run gameplay, alternate seed, retry, extra tick or write toggle.
The source inspection of installed `vite-node/dist/cli.mjs` confirms that script
mode forwards the direct arguments after removing its script flag and filename;
this is not an executed invocation check.

The producer verifies actual HEAD equality, clean consumed diff and no untracked
consumed input. It hashes the supplied qualification record and records it; it
does not infer qualification from a date, a stale HEAD pin or prose heuristics.
The parent supplies that authority only after the final qualification is real.
No existing Git state is checked out, reset or staged.

## Frozen inputs and bounded route

All four old gzip/raw pairs, three manifests and three provenance files in
1116-A are literal byte/size pins in the producer. Both 1116-A/B documents are
pinned too. Original frozen V31/V32/V37 readers admit their own bytes before
actual `migrateToLive(importSave(raw))`; each complete current boundary is
admitted through `makeSave`, `validateSaveV38` and canonical export/reload.
Original promise fields, first takes, market receipts and relationships must
survive migration exactly, with the already-governed nullable successor field
asserted independently for V31. PRE207 must additionally roundtrip through the
actual guarded 38 -> 37 converter to its exact original bytes before ticking.

There are four fixed source branches:

- P2 at 52 and kept/broken P1 at 61 are migrated and serialized without actions
  or ticks. Their exact predicate, versions, windows, outcome/evidence facts and
  actual contract/outcome-receipt joins remain assertions.
- Natural PRE207 runs through the real raw-checkpoint coordinator: SAVE207,
  actual emitted advance208, close, restart from exact stored bytes and duplicate
  replay of the original request. Read-only state inspection uses emitted bytes
  and the codec because the coordinator read view does not expose `gameState`.
- An independently migrated PRE207 receives the second and last actual tick,
  explicitly with `develop: true`. Its complete canonical Save 38 must equal
  the coordinator's actual 208 current slot; both focus choices/evaluations and
  retained acting retirement facts are required. No digest normalization or
  partial-field comparison substitutes for full equality.
- Genuine V32 owes-two is migrated at 104, actually saved, quoted once with the
  reviewed count-two window `[105,165)`, and waived through one returned public
  intent. The saved/current slots retain the true before/after distinction at
  the same week. Actual WAIVED outcome, same-contract successor, one new receipt,
  preserved first takes/history and duplicate replay are asserted. The link is
  newly created at the current capture source, never relabelled as old authority.

Exactly six mutation-route invocations are reserved before dispatch: main SAVE,
advance and replay; waiver SAVE, commit and replay. Four must be new accepted
operations and two duplicates. Quote has its own one-call counter. The tick
counter reserves before the main advance and independent core tick only;
duplicates must preserve exact bytes, revision and journal without a new tick.
Reserved and completed counts are recorded separately on failure.

Main coordinator startup/restart must total two creations, one actual fresh
factory and two coordinator-owned store closes. There is no manual duplicate
store close. Current load's migration-session factory is forbidden. Both
coordinator responses and session duplicates compare original stored response
bytes, including their historical timing fields; no fresh timing measurement is
used as a replay oracle. Restart/duplicate must cause zero writes in the new
store. All runtime limits remain the existing 192 MiB checkpoint, 512 journal
entries and 64 MiB journal values. No campaign-library/Save As operation is added
to this small capture; existing R8/1076 evidence remains separate.

## Exclusive outputs and failure truth

The fixed, previously absent destination is
`tests/fixtures/p14/genuine-v38-pre-p3/`. Its exact allowed inventory is:

```text
genuine-v38-p3-migrated-week207.json.gz
genuine-v38-p3-natural-week208.json.gz
runtime53-current208-saved207.json.gz
genuine-v38-p3-bound-p2-lead-week52.json.gz
genuine-v38-p3-kept-broken-week61.json.gz
genuine-v38-p3-before-waiver-week104.json.gz
genuine-v38-p3-after-waiver-week104.json.gz
runtime53-waiver-current104-saved104.json.gz
MANIFEST.json
```

The producer finishes all gameplay/admission/codec/replay premises and real
coordinator cleanup before creating that directory. It builds and gzip-roundtrips
all eight payloads in memory, enforcing the reviewed 16 MiB per raw payload,
64 MiB total raw, 16 MiB total compressed and 1 MiB manifest refusal bounds.
These do not alter runtime capacity or test timeouts. Files use exclusive writes;
there is no overwrite, cleanup or replacement of any old artifact.

The manifest records measured raw/gzip identities, exact old ancestry, current
source/qualification/producer identities, Save 38/projection 53/protocol 4 and
schema, limits, request/response hashes, runtime slot/journal identities,
no-write/replay observations, C.3/promise facts, counters and environment. Full
request/response bytes remain in the two real journal artifacts. Its status is
`CAPTURED_OUTGOING_AUTHORITY_NOT_P3_QUALIFICATION`, not a P3 or full-suite PASS.
It is written only after all eight payloads have been written and read back.
The final result audit remains authoritative if a later write or final guard
fails; preserve any partial output unchanged for attribution.

Every existing tracked consumed file and input is hashed before/after. The final
guard compares the exact same tracked inventory and source diff/index/HEAD,
while admitting only the declared new untracked fixture paths. During writing
it admits only the already-written declared prefix; final inventory must be all
nine names. The parent's mint recorder must use the corresponding
`fixedExistingSource`/exact-declared-output interpretation, not claim an empty
whole-source delta. The docs producer and supplied qualification evidence are
explicit inputs outside recorder SOURCE and need separate byte guards.

Audit outputs are exclusive `<audit-prefix>.started.json` and
`<audit-prefix>.json`; the latter reports PASS or FAIL, phase, source/input guards,
reserved/completed counts, actual operations, failure/cleanup cause and written
artifact identities. The completion marker is `OUTGOING_38_53_CAPTURE`. A startup
argument/output collision refuses before gameplay; an interrupted started record
is not a success. The producer stops the first premise failure, performs only
owned cleanup/guard accounting afterward and never extends the route.

All old fixtures, the original V37 parity FAIL, canonical passive Writer-work
gap, original R8 timeouts and other C.3 qualification limits remain intact. This
capture can establish current pre-P3 serializer/coordinator authority with an
in-memory store; it cannot establish native, real-disk, latency, old accepted P3,
partly served waiver behavior or P3 implementation. Actual new output hashes and
PASS results remain unmeasured until the authorized parent run.
