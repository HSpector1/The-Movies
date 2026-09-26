# 955 — independent promise-receipt continuity regression

2026-09-26. **Authored and frozen; not executed by the specialist.** Parent owns
the sole execution lane and production correction. The only new source file is
`tests/p14c3-promise-digest-continuity.test.ts`; this report is the only other file
written under this assignment. No helper, production or fixture file was changed.

Published outgoing evidence is0fc34e9ec8b6ade9ff18485a215193cdbcbd4591. During
authoring, the parent published the reviewed C.3 contract in docs-only
183252b2c3f1bb8399f68971c0576c213525159d. Inspection found no production or fixture
change between them. 956 now names this bounded prerequisite;942/946 remain the
separate C.3 execution/API authority. No C.3 test or production implementation is
part of955.

Frozen test-file SHA256:
`bb6478d8069143120077c32f0f72ebf5b2a65e3a4e228185da77981f77875e4c`.

New-file binary diff SHA256:
`5e97550af35620f52eca6bfeec56fd25aa9c14ec4d8588405e67f50f51fa8de8`.
This is the exact output of
`git diff --no-index --binary -- /dev/null tests/p14c3-promise-digest-continuity.test.ts`.
The file remains untracked at specialist handback; parent can include its exact
bytes in the recorded source patch without a specialist commit or index mutation.

## Requirements and boundaries

`PromiseFeasibilityReceipt.inputsDigest` identifies the service's inputs so the
same inputs yield a byte-equal receipt (`src/core/types.ts:2160`). The save
canonicalizer explicitly makes object insertion order irrelevant to saved values
(`src/core/save.ts:630`). The existing evaluator comment preserves stored roots
and old receipts while the active evaluator remains revision4
(`src/core/promises.ts:41–47`). Together with the actual945/948/950 continuation
failure and the953 preserved corpus, these establish the regression requirements:

- Equal values must yield the same complete feasibility receipt regardless of
  nested object-key insertion order. Array order and all values remain meaningful.
- Pure evaluation must not change either input world. Classification, bottleneck,
  receipt week and rulesVersion4 remain unchanged by a key-order permutation.
- A real changed pipeline or requested work must still change the digest. A
  constant digest, empty digest or dropped pipeline input cannot satisfy coverage.
- Loading the same actual207 world and continuing it through the public bridge
  must agree with the same normal-development core tick from a value-identical
  in-memory permutation. Full208 state equality is required, not just a digest list.
- Existing historical receipt values are retained on load. Fixing newly computed
  identities must not retroactively replace the two preserved208 histories.

The tests never import/copy a digest serializer or FNV implementation and never
derive an expected new digest literal. Equality/inequality is requirement-driven.
The fixture source/producer identities and compressed/raw artifact hashes identify
existing recorded evidence, not expected future outputs. The detached capacity
kernel, adapter and evaluator5 remain out of scope.

## Concrete setup and declared cases

The new file declares ten runnable cases, with no skips, todos or timeout changes.
Observed outcomes must come from the parent's recorded run.

| Cases | Independent setup and assertion |
| --- | --- |
| 1–2 | A fresh generated world with six actual public-created/hired people, a real standing Set and a publicly greenlit player picture. A real managed workflow and lead cast membership are asserted. P1 and explicitly tagged P2 each compare full receipts between original and recursively key-reversed worlds/drafts. Both require achievable classification, null bottleneck, rules4,16-hex digest and pure evaluation. |
| 3 | The same active workflow, with a due week outside the actual208-week contract. Require the existing exact refusal, unchanged rules4, and the same full receipt under permutation. This covers the refusal receipt path as well as positive classification. |
| 4 | Compare the real same-week state before/after public greenlight using the same draft; require a different digest. Separately increase requested count1→2 in that same active world and require a different digest. Rules4 remains. No arbitrary state-field mutation supplies these controls. |
| 5 | Load actual saved207 from953. Reverse only object-key order, prove structural and canonical equality plus genuinely different native JSON order, then whole-save validate. Tick both worlds once with develop:true. Select the twelve actual historical affected promise identities from the preserved defect record, require their real208 receipts/rules4, compare all non-digest fields, all complete receipts, and the entire resulting save. Both input worlds remain unchanged. |
| 6 | Save that reordered actual207 world; load it through BridgeSession; submit its actual published advance intent. Require accepted command,208,revision1,one journal entry, and exact equality with the uninterrupted develop:true core result. No direct-state substitute for the public command is used. |
| 7–9 | Independently load genuine saved207, continuous208 and runtime208. Require frozen37 reader acceptance, exact import/export bytes, unchanged clock, every stored promise, market receipt, first take and career event, and unchanged live save/file bytes. The two distinct historical208 receipt sets remain distinct genuine evidence. |
| 10 | Explicit **interim current52** compatibility: reopen the actual953 checkpoint without migration, retain distinct real saved/current slots and its existing journal, issue the recorded duplicate command, and require the exact historical response, unchanged state/revision and byte-identical checkpoint. This does not repeat gameplay or re-evaluate stored receipts. |

The fresh player workflow uses the public `createTalent`, `signContract`,
`commissionSet` and `greenlight` actions. The sole non-gameplay setup is the
disclosed existing funded-fixture convention: cash30m plus an equal ledger entry.
Age30 avoids retirement, work history starts at zero, and standing-Set construction
is bounded to at most12 normal-development ticks. No event, promise root, receipt,
clock, profession or work history is hand-built. The fresh world is cached only
inside this test file and detached for each caller.

The genuine207 permutation is deliberately adversarial object representation,
not a claim that the original producer used reversed keys. The helper preserves
every scalar (including negative zero), property membership and array ordering;
deep equality, canonical equality, native-order inequality and complete live-save
validation are explicit premises. The original default-development corpus remains
correctly labelled. Only the single compared207→208 continuations use normal
development, consistently on both sides.

The twelve affected ids are recovered from the preserved manifest's exact
historical promise indices and the validated actual runtime208 save, with twelve
unique roots and receiptWeek208 required. Old digest values are never used as new
expected values. Tests assert actual results relationally, and failures in subject,
clock, public-workflow or whole-save premises must be attributed before production
is released.

## Current52 caveat and upcoming53 gate

The small correction956 changes newly evaluated receipt digests without a new
save/projection shape. Case10 therefore explicitly preserves the existing current52
journal; it cannot authorize carrying that authority through C.3's later schema
cutover. No conditional skip treats the two policies as interchangeable.

At final projection53/Save38, the separately authorized C.3 runtime tests must use
this genuine outgoing52 checkpoint to prove explicit prior-schema registration,
independent current208/saved207 migration, fresh session identity, revision reset,
empty journal and rejection of the old command identity. They must also prove
current53 restart/replay and preservation of the original source artifacts.
The interim current52 assertion must be deliberately superseded at that cutover,
with the exact change attributed in the C.3 verification record.955 does not claim
this future reset behavior or run its tests early.

## Handoff

Parent may record the first bounded RED against the frozen new file and unchanged
production, then attribute every failure before editing `promises.ts`. Expected
order-dependent comparisons and passing controls are hypotheses until that run.
No failure result, GREEN claim, runtime timing or typecheck result is invented here.

Specialist checks performed: source/fixture-manifest inspection, static diff review,
file/diff hashing and whitespace inspection. No test, gameplay probe, typecheck,
generator, commit or push was executed by this specialist. All source remains
frozen at handback until the parent returns the recorded run's closure.

## 960 attribution and test ownership layout correction

The parent recorded957 with the original exact test patch above: five expected
digest-order failures and five passing controls, fixed source.958 then recorded
all ten cases passing after the bounded serializer correction, again fixed source.
Those records and original test hashes remain historical evidence, unchanged.

960 closed with child2 and fixed source:167 TS5097 errors from the root TypeScript
configuration following the core-named test's bridge `.ts` import graph. This was
a test-file ownership/layout defect. It does not identify a defect in the parent’s
serializer correction and does not invalidate the separate recorded behavior
results. Root `tsconfig.json` explicitly excludes `tests/bridge*.test.ts`; the
bridge configuration owns those imports.

Under the parent's narrow maintenance release, the original test source is now
split into:

| File | Cases | Frozen file SHA256 |
| --- | --- | --- |
| `tests/p14c3-promise-digest-continuity.test.ts` | Eight core/save cases; only core `.js` imports and node/Vitest imports | `25c28dde4a7014e245fe86cd1560ed24afd9803bc9fb91317af99bc5aaf14c50` |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | The two actual BridgeSession/current52 journal cases, moved intact | `05f5dba7c4fbec68502535e675f14aedc96d424d02ef617ffd1c5d54bbd1b144` |

The two original leaf bodies and describe names are retained. The existing core
leaf bodies are unchanged. A small copy of the bridge-free artifact reader,
hash/provenance checks,207 loader and pure key-permutation helper lives in the new
bridge file, so the root suite imports no bridge graph. No shared helper module,
configuration change, production change, expectation change, timeout, skip or
weakened assertion is introduced. All ten original acceptance cases remain.

New-file binary patch hashes, produced with the same `git diff --no-index --binary
-- /dev/null <path>` mechanism:

- Bridge file: `8522cf6cbbebb2f26872d9498398e1348f84231602f6738375f5e7945ff5de27`.
- Core file: `0b22d8480616ade67f319d74f8dfcd6a9717e4798cb0b8b6ab76528a3319f4df`.
- Exact concatenation in lexicographic path order (bridge then core):
  `edc72d8e82b531bb142620024eb19b127fc047bcc5595e40b6ced483554392ab`.

The parent owns the next two-file behavior run and root/bridge typechecks. The
specialist did not execute them. Source and both files are frozen at this handback;
the docs-only963 C.3 plan remains paused until the parent releases that work.
