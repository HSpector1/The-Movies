# 1308-C: revised and completed staged R2/R3 RED tests — handback

Independent-test-engineer authored, mode IMPLEMENT (staged test source + evidence only — no
live-tree edit, no execution). Worktree `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, HEAD `3c6a7732cbcb256ccdec38f0fe1824387361c4aa`
(live: `LIVE_SAVE_VERSION` 40 at `src/core/save.ts:6538`, `PROJECTION_VERSION` 55 at
`bridge/schema/bridge-schema.ts:281`). No `vitest`/`tsc`/`vite-node`/`node` was run against
project code in this pass. Source and already-committed fixture bytes were read freely;
gunzip/parse was applied **only** to the two files named in the task brief
(`tests/fixtures/p14/genuine-v40-pre-r3/MANIFEST.json` and
`tests/fixtures/p14/genuine-runtime55-pre-r3/MANIFEST.json`, plus the `.json.gz`/
`.provenance.json` files each MANIFEST names) — every fact below cites the MANIFEST/provenance
JSON or a source-code read, never a value I invented. One additional file's *existence* was
checked with `ls` only (`tests/fixtures/p14/genuine-v38-pre-p3/`), never gunzipped by me.

Mid-task, the parent sent a measured premise correction (probe `E/1308-P-r3-unseated-probe.ts`/
`.txt`, unchanged HEAD `3c6a7732`): the happy-path leaf's original `WEEK = 20` is actually a
week where the craft founder is genuinely seated, which would fail that leaf's own sanity check
before any R3 law runs, and a reminder that the synthetic `Talent.role` rewrite must never be
piped through `makeSave`/`validateSaveV41`. Both are addressed below (file 4, WEEK moved to 22;
confirmed no leaf in that file ever calls `makeSave`/`validateSaveV41`).

All six deliverables plus the neighbor row are staged under
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/`.

## Staged files: bytes and sha256

| # | Staged path (destination file name) | Bytes | SHA-256 |
|---|---|---:|---|
| 1 | `1308-stage/tests/p14a1-release-busy-set.test.ts` | 23226 | `4eb02b8e43cf17dd07b14eb76e9d3ee4dfda97ae2e7a0f6cf615790b93cbf170` |
| 2 | `1308-stage/tests/bridge-p14a1-release-busy-set.test.ts` | 18985 | `35c8aed54852c83687bec8eb38c67e4e4b18d6231cdee8dae619685497df3a54` |
| 3 | `1308-stage/tests/bridge-p14r2r3-prior55.test.ts` (new) | 11552 | `116d191ddb51bbc7df26493906c3a35fbb8ce14dfb3fdd7e7efbe94ea4795d27` |
| 4 | `1308-stage/tests/p14r3-rival-release.test.ts` | 26661 | `3ceae7e55bec922eb3432dd5a69946de243ebdd34e917f46e6bccd80076c5da5` |
| 5 | `1308-stage/tests/p14r3-save-v41.test.ts` | 25442 | `8dc2d52ebcdc8c0b6aaf80b087ca238feeff03175cca3ba8d36a23bf8227e954` |
| 6 | `1308-stage/tests/p13b-rival-scientist-staffing.test.ts` | 8428 | `faba4bbcff1318226da1adc7ef1a109491ec0ff6d05621a1291bb07e472d14b0` |
| 7 | `1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts` (full modified copy) | 62894 | `9ffe87d9fd9fb19b3f6c47f282546f85fc5e804ff6ee0c830dc5a4c86f0dc842` |

Bytes/sha256 computed via `wc -c` / `shasum -a 256` immediately after writing, 2026-09-28.

---

## File 1 — `p14a1-release-busy-set.test.ts`

**Change versus `1304-stage/tests/p14a1-release-busy-set.test.ts`:** exactly one line deleted —
`import { stableStringify } from '../src/core/save.js'` (1304-D required change 1: the symbol
is never referenced anywhere else in the file; confirmed again by my own full-file grep).
Verified byte-identical to the source modulo that one line (`diff` run, confirmed). Nothing
else touched.

**Leaf-by-leaf predicted status (unchanged from 1304-D's own review, since no logic changed):**

| Leaf | Predicted status |
|---|---|
| PREMISE: seats reserved/cleared | Passes today (fixture-only, no R2 assertion) |
| director/lead/antagonist/support/craft seated refusal (5 leaves) | RED — `applyReleaseTalent` (`actions.ts:~2661`) has no seat check today; `applyActions(...)` returns normally instead of throwing `/seated\|active production/i`, so `expect(...).toThrow(...)` fails with "expected function to throw" |
| credited writer, no active screenplay task, releasable | Already-true regression witness — cites `tests/p04a2-writer-credit-law.test.ts:845` |
| post-release release succeeds | Already-true regression witness (no R2 gate exists to break it) |
| research-seat-only person releasable | Already-true regression witness — cites `tests/p13a-research-employment.test.ts:12-34` |
| founding-draft release refused | RED — `applyReleaseTalent` never reads `state.founding`; throw expected, none occurs |
| same person releasable after `foundStudio` | Already-true regression witness |

---

## File 2 — `bridge-p14a1-release-busy-set.test.ts`

**Change versus `1304-stage`:** none. Diffed byte-identical against the 1304-stage source. I
re-checked for a defect as instructed (not just trusted 1304-D): re-read
`bridge/schema/bridge-schema.ts:281` (`PROJECTION_VERSION = 55`), `:1753-1764`
(`CONTRACT_REFUSAL_KINDS`, missing both new codes), `:3760/:3785` (`$id` /
`x-project-studio.projectionVersion` construction) directly against HEAD `3c6a7732` — all match
the file's premises exactly. No defect found.

**Leaf-by-leaf predicted status (unchanged from 1304-D):**

| Leaf | Predicted status |
|---|---|
| schema leaf (PROJECTION_VERSION 56, `$id`, both refusal codes in the enum) | RED — today `PROJECTION_VERSION===55`, `$id` ends `projection-55`, and the enum lacks both `foundingDraft`/`seatedOnActiveProduction` |
| seated director/lead/antagonist/support/craft, Bridge refusal (5 leaves) | RED — `releaseRefusal` (`bridge/contract.ts:163`) checks only `noActiveContract`/`onScreenplayTask` today; `decision.releaseAvailable` is `true`, the quote accepts, the command commits |
| founding-draft Bridge refusal | RED — same reason, no founding check in `releaseRefusal` today |
| unseated person still quotes disclosure | Already-true regression witness |
| release copy, cap-applies branch | RED — `bridge/contract.ts:303` unconditionally emits "half of the ... still guaranteed"; the new two-branch copy and the `not.toContain('half')` assertion both fail |
| release copy, no-cap branch | RED, same cause |

---

## File 3 — `bridge-p14r2r3-prior55.test.ts` (new)

Mirrors `tests/bridge-p14p4p5-opportunities.test.ts`'s landed leaf `'B55-3 independently
migrates genuine54 slots...'`, one version bump later (prior55 -> current56). Consumes the
genuine outgoing projection55 checkpoint the parent minted and reviewed for exactly this
purpose (1307-K closure). All fixture facts below are read directly from
`tests/fixtures/p14/genuine-runtime55-pre-r3/MANIFEST.json` and
`runtime55-current111-saved110.provenance.json`, and independently cross-checked by me against
the actual committed `.json.gz` (gzip bytes/sha256 verified with `shasum`/`wc -c`; decoded
bytes/sha256 verified by gunzipping — the one file this deliverable is explicitly permitted to
open):

- gzip: 435601 bytes, `3e9ca499555dfcca262078329f66030fc0a49f52e350dec38749bb51e2af7447`
- decoded: 4850473 bytes, `939da0b79a2b9fbef45b7f71c71e3717d80d885b7c3a2e6244cdebc1bf379036`
- schemaId `sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158`,
  protocolVersion 4, sessionId `1307-outgoing55`, stateRevision 1, journal routes
  `['save','command']`, journalDigest
  `e8b9748d6870e02f99306dd0f534043832e11fbb61b41d640b12f3f3925c2f82`, saved slot week 110
  (1094789 bytes), current slot week 111 (1095023 bytes) — confirmed against the checkpoint's
  own top-level fields directly (`format`, `checkpointVersion`, `protocolVersion`, `schemaId`,
  `sessionId`, `stateRevision`, `journal`, `currentSaveJson`/`savedSaveJson` digests all
  present and byte-matching).

**One self-correction before finalizing:** the file's own first draft imported
`decodeBridgeRuntimeCheckpoint` (by direct analogy to B55-3's `resume()` helper) but never
called it — this file never opens a live `BridgeSession`, only loads/migrates/re-encodes the
checkpoint directly. Caught by my own grep pass (the same class of defect 1304-D found in file
1) and removed before finalizing; final import list is fully used.

**Leaf-by-leaf predicted status:**

| Leaf | Predicted status |
|---|---|
| `PROTOCOL_VERSION===4` | Already-true (unaffected by this increment) |
| `PROJECTION_VERSION===56`, `BRIDGE_SCHEMA.$id` ends `projection-56` | RED — today 55 / `...-55` |
| `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` maps the outgoing55 schema id to `'projection-v55'` | RED — today that schema id is the LIVE `SCHEMA_ID` (confirmed: `SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`, `bridge/protocol.ts:35`, and `BRIDGE_SCHEMA` is still projection55), so it is NOT a member of the prior map at all; `.filter(...)` returns `[]`, not `[[OLD_SCHEMA,'projection-v55']]` |
| `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)` is false | Already-true today (vacuously, for a different reason — the live schema is never its own prior); stays true post-increment for the real reason |
| `loadBridgeRuntimeCheckpoint` migrates: `migratedFromProtocolVersion===4`, factory called once, fresh session id, `stateRevision===0`, `journal===[]` | RED today by a DIFFERENT path than the schema leaf: since the fixture's schema id is currently the LIVE one, `loadBridgeRuntimeCheckpoint` today does NOT treat it as a prior checkpoint needing migration at all (`migratedFromProtocolVersion` would be `null`, factory never called) — a real, distinguishable RED, not a coincidental pass |
| each slot: `validateSaveV40(old)`/`validateSaveV41(new)`, `now.state` equals `old.state` with `termination:0` added to every rival period and nothing else | RED — `validateSaveV41` does not exist (absent-export RED, same class as file 5) |
| slot bytes equal `exportSave(migrateToLive(previous))` | RED — `migrateToLive` today is literally `migrateToV40` (`save.ts:10007-10009`), so it returns a V40 envelope, not V41; the byte comparison fails structurally even before content is considered |
| current slot != saved slot | Already-true (weeks 111 vs 110) |
| re-encoding the migrated checkpoint loads without migration | Not independently reachable as RED until the prior leaf's migration exists; written per the B55-3 precedent and will report its own real result once the increment lands |
| original prior-schema bytes unmutated | Already-true (a `readFileSync`/no-mutation guarantee, unaffected by the increment) |

---

## File 4 — `p14r3-rival-release.test.ts`

**Changes versus `1305-stage/tests/p14r3-rival-release.test.ts`** (all disclosed in the file's
own revised header):

1. Import paths corrected from the 1305-stage physical-location depth (`../../../../../../../src/...`,
   7 levels — correct only for where the file physically sat under `1305-stage/tests/`) to the
   destination `tests/` depth (`../src/...`). Mechanical only.
2. **1305-D required change 1**: the surplus-mechanism comment's citation
   `hollywoodTick.ts:198` (which is `decide()`'s cast-selection `.slice(0,3)`, a different
   function) corrected to `hollywoodTick.ts:138-141` (`staff()`'s own slot loop, no `.slice`) —
   re-verified directly against current source (`grep -n` confirms lines 138/139/141 match
   exactly). The mechanism and every assertion were already correct per 1305-D; only the cited
   line numbers were wrong.
3. **1305-D required change 2**: the `describe` block titled `'worlds without surplus are
   unaffected (comparison method stated below)'` renamed to
   `'no rival exceeds its RIVAL_TEAM_ROLES role targets, and no rival termination receipt
   appears, on an unmodified generated world'`, with a comment explaining the rename claims
   only the checked invariant, not 1305-A's stronger "byte-identical" framing (1305-D's other
   recommended option — a real full-state-diff leaf — was not added; left to the parent per
   1305-D's own phrasing, "the parent" being whoever adopts the stronger guarantee).
4. **Parent's mid-task measured correction**: the happy-path leaf's `WEEK` moved from 20 to 22.
   The parent's probe (`E/1308-P-r3-unseated-probe.ts`/`.txt`, unchanged HEAD `3c6a7732`, weeks
   0-190) shows `person-studio-aca408ec-r02-5` (this file's `CRAFT_ID` for row 2) genuinely
   seated (`industryBusyTalentIds`) at week 20 — the leaf's own condition-(a) sanity assertion
   (`expect(industryBusyTalentIds(state.hollywood).has(CRAFT_ID)).toBe(false)`) would fail
   there, for a reason unrelated to R3. Week 22 is on the probe's own measured unseated list.
   I did not re-run the probe myself (no execution in this mode); I trust the parent's own
   measured, cited artifact, which is itself reproducible (script + output both staged at
   `E/1308-P-r3-unseated-probe.ts`/`.txt`).

**Save-validation exclusion note** (parent's other mid-task point): confirmed by my own
full-file read that no leaf in this file ever calls `makeSave`/`validateSaveV41` on a
`withSurplusActor`-rewritten state — the synthetic rewrite's states are only ever passed to
`tick()`, `industryBusyTalentIds()`, and read directly. No code change was needed; recorded in
the file's header for the record.

**Leaf-by-leaf predicted status:**

| Leaf | Predicted status |
|---|---|
| Happy path (week 22, all 4 conditions hold) | RED — `staff()` has no release logic today (confirmed: full read of `hollywoodTick.ts:93-174`, no charge/end/receipt code for a non-slot-filling own employee); `period.movements.termination` reads `undefined` (`RivalFinancePeriod` has no such key, `hollywoodTypes.ts:53-55`), `expect(undefined).toBe(-expectedCharge)` fails first |
| Condition (b) fails (week 190, 18 remain) | Already-true (negative-space: nothing releases anyone today regardless of R3); becomes a meaningful regression guard once R3 lands |
| Condition (a) fails (bounded natural search, weeks 1-150) | Already-true, same negative-space reasoning; parent's probe independently confirms seated weeks exist in-window (e.g. weeks 5-12 per the probe's own list, though the leaf's own `while` loop finds its own week, not necessarily the probe's) |
| Condition (c) / (d) | `it.skip`, STOPPED, unchanged from 1305-C (parent prerequisite: a public rival-promise route, or a rival-cash-near-reserve natural week, or explicit fabrication authorization — neither supplied to me in this task) |
| Scientists never R3-surplus (week 265 natural world) | Already-true, cites `tests/bridge-p13b-s8-rivals.test.ts`'s own measured header |
| "no rival exceeds role targets / zero termination receipts" (renamed block, weeks 1-150) | Already-true today (no R3 exists to write a termination receipt); becomes a real regression guard once R3 lands |

---

## File 5 — `p14r3-save-v41.test.ts`

**Change versus `1305-stage/tests/p14r3-save-v41.test.ts`: a full rewrite of the fixture
strategy**, per the task's explicit instruction. The 1305-C original reconstructed a V40
envelope at test-run time from the already-committed genuine V38 corpus via `migrateToV40` —
flagged by its own header as a DEVIATION from the literal "mint a genuine outgoing Save40
fixture" instruction, left for 1305-D to rule on; 1305-D's four required changes never
addressed that deviation either way. This file now loads the two genuine Save40 inputs the
parent minted directly for this purpose (1306-K closure, `tests/fixtures/p14/genuine-v40-pre-r3/`),
pinned by MANIFEST gzip/decoded hashes, cross-verified by me directly:

- `genuine-v40-r3-outgoing-week110`: gzip 122176 bytes /
  `196b73d43ac6e346c6b6e6a73e0b13f16bc23a1f5d321947067d6f81ca774bd8`; decoded 1094789 bytes /
  `2e717382e952fa0f175f07d5f7055d6d3f37c66eb4bf86a783dd169ae21d2ddc`. Gunzip-verified by me
  directly (Python `gzip`+`json`, the one class of file this deliverable is explicitly
  permitted to open): `saveVersion` 40, ledger `termination` rows = 1, `hollywood.receipts`
  with `kind:'employment', reason:'termination'` = 1 (studioId = `playerStudioId`), 4
  businesses, 3 periods each, movements keys = the 14 current `RIVAL_MONEY_KINDS` (no
  `termination`), 6 candidate active rival employment rows on business 0 available for the
  tamper leaves' `.find(...)` (none of the four tamper leaves' premise-throw fallback fires).
- `genuine-v40-r3-research-week280`: gzip 238161 bytes /
  `13cff0da503ee23249fdc1d3c2209daae7807745d3f38530f853e11d65258699`; decoded 2308264 bytes /
  `55284c8c5a78da67227f1c35aa82773e5b59f4a2b0b9075a8f2f5284006686b7`. Gunzip-verified: 4
  businesses, 6 periods each, real nonzero `researchCapacity`/`researchSpend` movements on
  business 0 (e.g. `[-900000,0,0,0,0,-1250000]` / `[0,0,0,0,0,-440000]`) — confirms "research
  kinds... preserved exactly" is a meaningful, non-vacuous check for this input.
- `MANIFEST.json` itself: 2694 bytes /
  `0dbee376a442a02424f83c7665c80b6af7516ae4c2321455f305e9784e6df0e0`, both independently
  re-hashed by me and matching 1306-K's own record.

The already-committed genuine V38 corpus is kept for exactly one leaf (multi-hop chain
composition, `migrateToV41` vs `convertV40ToV41(migrateToV40(...))`), per the task's "keep only
if it adds coverage" instruction — its existence was confirmed by `ls` only, never gunzipped by
me; the leaf asserts no fact about its content beyond structural chain-equality.

Required leaves present (all named in the task): fresh V41 validates;
`migrateToV41`/`convertV40ToV41` parity on BOTH genuine inputs; 40->41 adds only
`termination:0` on BOTH inputs (with an explicit "research kinds preserved" framing on
week280); frozen `validateSaveV40` still admits BOTH genuine inputs; the player's-own-
termination witness (week110); 41->40 lossless for the zero-termination case; 41->40 refused
(two leaves, isolating the movement half and the receipt half of the stated "and" condition —
the task's wording implies both must independently refuse, which the 1305-C original did not
separately test); `validateSaveV41` refused (two leaves: unreconciled nonzero movement with no
receipt; receipt without its movement — the 1305-C original only had the second of these); the
trimmed V38-chain leaf.

**Leaf-by-leaf predicted status:**

| Leaf | Predicted status |
|---|---|
| `LIVE_SAVE_VERSION===41` | RED — pinned 40 today |
| `makeSave` stamps 41 | RED — stamps 40 today |
| fresh V41 validates | Import-level RED (`validateSaveV41` absent) |
| `migrateToV41`/`convertV40ToV41` parity, week110 and week280 (2 leaves) | Import-level RED (both) |
| 40->41 adds only `termination:0`, week110 and week280 (2 leaves) | Import-level RED (both); the week280 leaf additionally exercises non-trivial `rest` equality on real nonzero research movements once the increment exists |
| `validateSaveV40` still admits week110 / week280 (2 leaves) | Already-true today (V41 doesn't exist yet, so obviously unaffected) |
| player's-own-termination witness | RED (import-level for the V41 half; the pre-migration precondition assertions — 1 ledger row, 1 player receipt, 0 rival receipts — are already-true today, confirmed by my own gunzip read above) |
| 41->40 lossless (zero-termination) | Import-level RED |
| 41->40 refused, nonzero movement | Import-level RED |
| 41->40 refused, receipt present (movement left 0) | Import-level RED |
| `validateSaveV41` refused, unreconciled nonzero movement | Import-level RED |
| `validateSaveV41` refused, receipt without movement | Import-level RED |
| V38-chain multi-hop parity | Import-level RED (`migrateToV41` absent) |

"Import-level RED": one of the four new names (`validateSaveV41`, `convertV40ToV41`,
`convertV41ToV40`, `migrateToV41`) is absent from `src/core/save.ts` at this HEAD (confirmed by
direct `grep -n` against the full file) and is actually CALLED, not merely imported unused, in
every such leaf — a real, non-spurious RED per the project's own "RED-first tests import from a
missing module" caution.

---

## File 6 — `p13b-rival-scientist-staffing.test.ts`

**Change versus `1305-stage`:** import paths only (same mechanical depth correction as file 4),
plus a header note restating that this file is a separate hypothesis-witness gate, not part of
R3 GREEN, per the task brief. No assertion, seed, week, or margin changed. Diff confirmed
scoped to exactly the header block and the five import lines.

**Leaf-by-leaf predicted status (unchanged from 1305-D's own review):**

| Leaf | Predicted status |
|---|---|
| Precondition: 4 employed Scientists at week 265 | Already-true, cites `tests/bridge-p13b-s8-rivals.test.ts`'s own measured header |
| Deficit-zero across affordable weeks 265-270 | Genuine hypothesis witness, NOT a guaranteed RED: fails (witnessing 1305-F's suspected defect) if the hypothesis holds for this seed/window, passes otherwise — either outcome is informative, not a broken test |

---

## Neighbor row — `tests/bridge-p14b6-relationship-read-models.test.ts:466`

**Old expectation (unchanged production):** `applyActions(before, [{ kind: 'releaseTalent',
talentId: dropped }])` succeeds directly. `dropped` (`W1_SEATS.support = 't-act-13'`) is the
support seat of `prod-0052`, an active player production (`retentionFixture()` never cancels or
completes it — confirmed independently by 1304-D and by my own read of
`tests/helpers/p14b2-fixtures.ts:62-124`). The release closes the employment tie in the same
week and the read-model DTO stops disclosing the counterpart.

**New expectation under R2:** the direct release call now throws the `seatedOnActiveProduction`
refusal (support is a live R2 seat), making every assertion after that line unreachable — the
test as originally written fails for a genuinely new, unrelated-to-its-own-purpose reason.

**Cause:** R2 busy-set release refusal (1304-A/F), landing in the same production increment as
R3/Save41.

**Fix staged (smallest change that keeps the leaf's own purpose — a same-week employment-close
and disclosure-flip witness — lawful under R2):** insert one `cancel` action for `prod-0052`
immediately before the `releaseTalent` call, in the same week (`applyCancel`,
`actions.ts:588-611`, never ticks). `applyCancel` removes the production from
`state.studio.activeProductions` (clearing the R2 seat, same mechanism 1304's own neighbor
inventory already relies on for two OTHER UNAFFECTED rows —
`tests/p14p3-directing-promises.test.ts:489` and
`tests/helpers/p14c2rm-fixtures.ts:306`) without touching `state.relationships` or
`state.hollywood.employment` (confirmed by full read of `applyCancel`'s body). I independently
traced `rosterAt` (`bridge/relationships.ts:105-112`, the function the disclosure check
ultimately depends on) and confirmed it keys purely off `state.hollywood.employment`
start/end weeks for the studio — never off active-production membership — so cancelling first
does not change the disclosure-boundary semantics the leaf exists to test.

**Disclosed side effect (not silently absorbed):** `prod-0052` has a first take
(`retentionFixture` ticks once past `remainingTicks 5`), so cancelling it also fires
`recordCancelledAfterFirstTake` (`src/core/relationships.ts:320-329`), which drives a
`cancelledAfterFirstTake` relationship-driver event (a negative closeness delta) between the
picture's seated pairs. This does not affect any assertion the leaf makes (it checks edge
*existence* only, never tier/closeness/driver content), but it is a real, incidental behavior
change I am disclosing rather than omitting.

**Not independently verified:** I could not execute vitest to confirm this fix actually
produces the leaf's originally-intended PASS once R2 lands (my reasoning is a static trace of
`applyCancel`, `rosterAt`, and `recordCancelledAfterFirstTake`, not an observed run). I also did
not trace `breakPromisesOnCancel`'s behavior on this fixture in full (whether `prod-0052` has
any promise reservations at cancel time) — this is immaterial to the leaf's own assertions
(none touch `state.promises`), so I did not chase it further, but it is named here as an
un-chased premise per the task's "every premise you could not settle" instruction.

---

## Premises I could not settle

1. **No execution anywhere in this pass.** Every "RED" classification above is a derived
   expectation from reading `src/core/save.ts`, `src/core/hollywoodTick.ts`,
   `bridge/schema/bridge-schema.ts`, `bridge/contract.ts`, `bridge/runtime-checkpoint.ts`, and
   `bridge/relationships.ts` at HEAD `3c6a7732`, confirming the cited symbols/logic are absent
   or unconditional — not an observed failure. This mode forbids `vitest`/`tsc`/`vite-node`/
   `node` against project code; none was run.
2. **File 4's condition (a)/(c)/(d) leaves** (bounded natural search; both `it.skip`s) are
   unchanged from 1305-C's own honest disclosure: condition (a)'s search is not guaranteed to
   land inside its own bound without execution (though the parent's separate probe confirms
   seated weeks DO exist for this exact person in [1,150), e.g. weeks 5-12); conditions (c)/(d)
   remain STOPPED pending a parent-supplied public route or explicit fabrication authorization,
   neither of which this task's brief supplied.
3. **File 3's `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` label string `'projection-v55'`** is taken
   directly from this task's own brief text, not independently re-derived by me from a design
   document — I did not find (and did not search broadly for, per the read-only-relevant-
   entries instruction) an authoritative naming-convention document beyond the `'projection-v54'`
   precedent already landed in `bridge-p14p4p5-opportunities.test.ts`.
4. **File 3's re-encode-without-migration leaf** cannot be independently classified as "RED" or
   "already-true" without the earlier migration leaves in the same file actually running first
   (it operates on `current`, the OUTPUT of the migration step) — flagged in its own table row
   rather than guessed.
5. **The neighbor fix's real-world PASS**, and whether `breakPromisesOnCancel` does anything
   observable on `prod-0052` at cancel time — both named above, not chased further since neither
   is load-bearing for the leaf's own assertions.
6. **File 5's exact refusal-message wording** for the two `validateSaveV41` tamper leaves and
   the two `convertV41ToV40` tamper leaves is asserted only by `/termination/i` (downgrade
   leaves, per the task's own explicit wording) or generically (`.toThrow()`, validation leaves,
   since the task did not name a message pattern for those two) — if a future implementation
   throws for a structurally different, unrelated reason, or does not throw at all, that is a
   reportable finding per each leaf's own in-file comment, not a silently accepted pass.

## Summary

DONE. All seven staged artifacts (6 test files + 1 modified neighbor copy) are written under
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/`, plus this
handback. No file under `tests/`, `src/`, `bridge/`, or `ui/` was touched. Production is
unchanged; every RED classification above is derived from source reading and the two permitted
fixture MANIFESTs, cross-verified by direct `wc -c`/`shasum -a 256`/gunzip on exactly the files
the task named, never by running project code.
