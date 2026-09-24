# 753-W — P14B.8 writer report: the waiver's player surface, implemented

Writer: the single production writer for B.8. Brief `752-W`. Authority: record 744 as amended by its
§11 log, record 745-C, the sweep inventory 751 as corrected, and the RED suite 750-T. Source at
HEAD `ca5eceff`. I committed nothing; the parent owns git.

Mode: implementation. I edited `bridge/`, regenerated `generated/`, and swept the test files the
projection bump and the two new row members mechanically invalidate. I authored no new test, and I
weakened, relaxed and deleted no assertion.

LOGIC VERIFIED, UNITY NOT VERIFIED. No native claim, no Owner acceptance claim, no playtest claim.

---

## 1. Diffstat

39 files, 1202 insertions, 230 deletions. Eight of them are production or generated; 31 are the
mechanical test sweep.

```
 bridge/promises.ts                                 | 150 +++++-
 bridge/runtime-checkpoint.ts                       |   8 +
 bridge/schema/bridge-schema.ts                     | 113 ++++-
 bridge/schema/intent-schema.ts                     |   5 +
 bridge/schema/project-studio-bridge.schema.json    | 305 ++++++++++-
 bridge/session.ts                                  |  68 ++-
 generated/unity/StudioBridgeDtos.Generated.cs      | 561 ++++++++++++++++-----
 .../project-studio-bridge.contract-manifest.json   |  10 +-
 tests/bridge-contract-generator.test.ts            |  23 +-
 tests/bridge-operations-events.test.ts             |   4 +-
 .../bridge-owner-ux-projection20-migration.test.ts |   2 +-
 tests/bridge-owner-ux-projection21-schema.test.ts  |   4 +-
 tests/bridge-p10a-w0-people-projection.test.ts     |   4 +-
 tests/bridge-p11-capital-contributors.test.ts      |   2 +-
 tests/bridge-p11-ready.test.ts                     |   2 +-
 tests/bridge-p13b-r07-setup.test.ts                |   6 +-
 tests/bridge-p13b-s1b-seats.test.ts                |   4 +-
 tests/bridge-p13b-s2-labs.test.ts                  |   4 +-
 tests/bridge-p13b-s3-plans.test.ts                 |   4 +-
 tests/bridge-p13b-s4-office.test.ts                |   4 +-
 tests/bridge-p13b-s5-adoption.test.ts              |   6 +-
 tests/bridge-p13b-s6-cancellation.test.ts          |   6 +-
 tests/bridge-p13b-s7-disclosure.test.ts            |   6 +-
 tests/bridge-p13b-s8-rivals.test.ts                |   6 +-
 tests/bridge-p14a1-market.test.ts                  |   6 +-
 tests/bridge-p14a2-market.test.ts                  |   6 +-
 tests/bridge-p14a3-world.test.ts                   |   6 +-
 tests/bridge-p14b1-promises.test.ts                |  13 +-
 tests/bridge-p14b2-trust.test.ts                   |  13 +-
 tests/bridge-p14b3-promise-command.test.ts         |   6 +-
 tests/bridge-p14b4-cast-class.test.ts              |   7 +-
 tests/bridge-p14b4-runtime47-compatibility.test.ts |  11 +-
 tests/bridge-p14b5-relationships.test.ts           |  18 +-
 .../bridge-p14b6-relationship-read-models.test.ts  |  15 +-
 tests/bridge-p14b7-promise-waiver.test.ts          |   2 +-
 tests/bridge-r3n4-read-model-deltas.test.ts        |   6 +-
 tests/bridge-runtime-checkpoint.test.ts            |   4 +
 tests/bridge-schema.test.ts                        |  10 +-
 tests/bridge.test.ts                               |   2 +-
 39 files changed, 1202 insertions(+), 230 deletions(-)
```

`src/core/` is absent from that list. B.7's law did not move.

## 2. What I built, by the six changes 752-W names

**(1) The history row's two new members.** `StudioMarketPromiseHistoryRow`
(`bridge/schema/bridge-schema.ts`) gains `supersededByPromiseId: nullable(nonEmptyText())` and
`progress: nonNegativeInteger()`. One write site, `promiseHistoryFor` (`bridge/promises.ts:117-120`),
reads both straight off the stored promise and derives neither. The three carriers inherit them
through the shared definition, which the RED's group5 confirms on all three.

**(2) The quote family.** `StudioQuoteWaivePromiseRequest` (`type: 'quoteWaivePromise'`) joins the
closed `StudioBridgeQuoteRequest` union; `StudioPromiseWaiverQuoteSnapshot` joins
`StudioQuoteSnapshot`. Its own draft payload, `StudioPromiseWaiverDraftPayload` =
`{ promiseId, substitute }`, where `substitute` is a closed two-member union whose families are
`APPEARANCE_COUNT` (count-only) and `LEAD_OR_SIGNIFICANT_ROLE_COUNT` (with `seatClass` REQUIRED),
reusing the existing `promiseDraftTerms`. `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and
`SPECIFIC_PROJECT` are unexpressible by construction, and so is a classless P2.

**(3) The commit arm.** `PendingQuote` gains a `promiseWaiver` member (`bridge/session.ts:228-237`);
`quotedIntentFor` gains a conversion branch and a fail-closed revalidation arm.

**(4) The intent kind.** `'waivePromise'` joins `AVAILABLE_INTENT_KINDS`
(`bridge/schema/intent-schema.ts`), taking it from 25 members to 26.

**(5) The ownership gate.** §3.

**(6) The projection bump.** §4.

## 3. The ownership gate, and where I put it

I put it at the BRIDGE and moved no engine law. `src/core/promises.ts` is untouched.

`promiseWaiverDraftToEngine` (`bridge/promises.ts`) resolves the promise from
`allPromises(state)` and refuses when it is absent OR when
`promise.issuerStudioId !== state.hollywood?.playerStudioId`. The two refusals return the SAME
sentence, `This studio has no promise "<id>" on its record.`, so the answer declines to confirm that
a promise the player may not read about exists. The refusal is a conversion refusal, which the
session publishes as `ENGINE_REJECTED` — the treatment 744 §11 A1 and the RED's I5 require, and the
only honest one available, because the RED MEASURED that `waiverAccepted` returns `null` for a
rival's `promise-1` on `genuine-v31-with-edges` and there is therefore no engine sentence an
accepted `ok:false` quote could carry.

`state.hollywood` absent refuses too: `string !== undefined` is true, so the gate fails closed rather
than defaulting permissively.

**It runs again at COMMIT.** `quotedIntentFor` re-converts the pending draft against the LIVE state,
so the `!conversion.ok` arm already refuses a rival's promise even if the board moved between quote
and confirmation. I added the acceptance re-check beside it
(`bridge/session.ts:1699-1716`): a substitute the person no longer accepts fails closed with curated
copy, because letting `waivePromise` throw would republish
`promises: this person did not accept the substitute — …` verbatim through `caught` and `reject`.

I confirm the RED's disclosed limit: no public sequence reaches the commit-side re-check once the
quote gate holds, so 750-T's group9(b) proves the INVARIANT (nothing commits, the rival's promise
stays open, `promises.length` unchanged, the authority byte-identical) rather than a specific
commit-side message. I built the guard anyway, per 752-W.

I did NOT conclude the gate belongs in the engine, so I did not stop. The reasoning I acted on:
`waivePromise` is a pure verb whose caller supplies authority, `playerProposalDraft` makes the same
decision one step earlier by FORCING `issuerStudioId`, and a waiver has no such field to force, so
the same decision can only be a refusal.

## 4. The projection bump, 49 to 50

| artifact | value |
| --- | --- |
| `PROJECTION_VERSION` | 49 → **50** (`bridge/schema/bridge-schema.ts`) |
| running `SCHEMA_ID` | `sha256:60af24c5…` → `sha256:e2d354dcbae1a6dc93a2367756512c14243b11be202a26107de0c81a4f3e0698` |
| prior roster | 37 → **38**; `['sha256:60af24c5…', 'projection-v49']` added at `bridge/runtime-checkpoint.ts:60-67`, in this same change |
| `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)` | `false` |
| `LIVE_SAVE_VERSION` | unchanged at 32 |
| `PROMISE_RULES_VERSION` | unchanged at 4 |

The three generated artifacts were REGENERATED, never hand-edited:

```
npm run generate:bridge-contract
  generated bridge/schema/project-studio-bridge.schema.json
  generated generated/unity/StudioBridgeDtos.Generated.cs
  generated generated/unity/project-studio-bridge.contract-manifest.json
npm run check:bridge-contract
  verified bridge/schema/project-studio-bridge.schema.json
  verified generated/unity/StudioBridgeDtos.Generated.cs
  verified generated/unity/project-studio-bridge.contract-manifest.json
```

## 5. One writer decision the brief did not anticipate: three shared members on the answer

The first generation of the C# DTOs demoted `startsNow`, `queues` and `queueNote` off the abstract
`StudioQuoteSnapshot` base class and into all five existing concrete classes. The generator promotes
exactly the properties every union member shares
(`scripts/bridge-contract-csharp.ts:780-797`), and a sixth member lacking those three shrinks the
promoted set to `commitLabel` and `intentId`.

I read that as a C# source-compatibility change larger than B.8 authorises: every Unity reader
holding a `StudioQuoteSnapshot` base reference would lose three fields as a side effect of a feature
that deferred its own Unity controls. The alternative was editing
`tests/bridge-contract-generator.test.ts:541-543`, which pins the promoted set exactly — an
assertion, which I may not weaken.

So I gave `StudioPromiseWaiverQuoteSnapshot` the union's three shared scheduling slots with honest
values: `startsNow: true`, `queues: false`, `queueNote: null`. A waiver settles the original and
binds the substitute in the SAME accepted command, which is the exact opposite of the market
proposal that settles at its decision week. Regenerating restored the base class to its five
promoted members, byte-identical in shape to projection 49's.

This adds three members the RED's I3 does not enumerate. It removes none, changes no assertion, and
is compatible with every B.8 case (all 32 pass). Flag it if the parent reads I3 as exhaustive.

## 6. The sweep, per line

**Nothing under `tests/fixtures/` moved.** `git status --porcelain tests/fixtures/` returns empty.
The 13 `provenance.json` / `MANIFEST.json` files that carry the literal 49 and `sha256:60af24c5…` as
minted evidence are byte-identical.

**The three historical comments stand**, verbatim: `bridge-p14b4-runtime47-compatibility.test.ts:43`
(line number moved from 42 because I inserted a comment line above it; the text is unchanged),
`bridge-runtime-checkpoint.test.ts:974`, and `bridge-p13b-s8-rivals.test.ts:223`'s trailing
`// RED: today PROJECTION_VERSION is 40`.

**The split is per LINE, as 751's CORRECTION insists.** `bridge-runtime-checkpoint.test.ts` keeps its
frozen comment at `:974` and its live prior-roster `toEqual` gained the new id.

I applied 69 version/URN/identity edits through an assert-then-write script that validates EVERY
(file, line, exact substring) triple before writing anything, then 11 structural edits the same way,
then the row-shape and vocabulary edits by hand. One triple failed validation on the first pass
(`bridge-p14b6-relationship-read-models.test.ts:762` was really `:760`) and nothing was written until
it was corrected.

### 6.1 What moved, and why

| file | what |
| --- | --- |
| `tests/bridge.test.ts` | `SNAPSHOT_VERSION` alias pin (class 2) |
| `tests/bridge-operations-events.test.ts` | version pin; test title naming the served envelope |
| `tests/bridge-owner-ux-projection20-migration.test.ts` | version pin |
| `tests/bridge-owner-ux-projection21-schema.test.ts` | version pin; `$id` URN |
| `tests/bridge-p10a-w0-people-projection.test.ts` | version pin; `$id` URN |
| `tests/bridge-p11-capital-contributors.test.ts`, `tests/bridge-p11-ready.test.ts` | version pins |
| `tests/bridge-p13b-{r07-setup,s1b-seats,s2-labs,s3-plans,s4-office,s5-adoption,s6-cancellation,s7-disclosure,s8-rivals}.test.ts` | version pins, `snapshotVersion` second lines, `x-project-studio.projectionVersion`, `$id` URNs |
| `tests/bridge-p14a{1,2}-market.test.ts`, `tests/bridge-p14a3-world.test.ts` | version pins, `projectionVersion`, `$id` URNs |
| `tests/bridge-r3n4-read-model-deltas.test.ts` | version pin, `snapshotVersion`, `$id` URN |
| `tests/bridge-schema.test.ts` | version pin, `$id` URN, `projectionVersion: 49` argument, the C# constant as quoted text, and a `toThrow(/expected literal 49/)` matcher |
| `tests/bridge-p14b1-promises.test.ts` | version pins; both inline history-row TYPES and both exact `toEqual` rows gained the two new members |
| `tests/bridge-p14b2-trust.test.ts` | version pins; the `expectedHistory` helper gained both members; the exact `AVAILABLE_INTENT_KINDS` list gained `'waivePromise'` |
| `tests/bridge-p14b3-promise-command.test.ts` | version pin; the exact BROKEN-row `toEqual` gained `supersededByPromiseId: null, progress: 0` |
| `tests/bridge-p14b4-cast-class.test.ts` | the `history()` helper's expected row gained both members, read off the LIVE row in `state` (see §6.3) |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | version pin; `EXPECTED_PRIOR_IDS` gained `sha256:60af24c5…` in sorted position; title count 37 → 38 |
| `tests/bridge-p14b5-relationships.test.ts` | version pin; `SCHEMA_ID` literal → the new identity; new `OUTGOING_49` constant added to both prior-roster `toEqual`s; header comment and two titles renumbered |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | `INCOMING_PROJECTION` 49 → 50; new `OUTGOING_49` in the roster `toEqual`; `size).toBe(37)` → 38; the stale title 751 flagged; one roster-count title |
| `tests/bridge-p14b7-promise-waiver.test.ts` | version pin |
| `tests/bridge-runtime-checkpoint.test.ts` | the live prior-roster `toEqual` at `:972` gained the new id in sorted position; the frozen comment below it untouched |
| `tests/bridge-contract-generator.test.ts` | two schema-id literals → the new identity; `projectionVersion: 49` argument; the request-union case list gained `StudioQuoteWaivePromiseRequest`; the F10/F11 declaration-body identities (see §6.4) |

### 6.2 Three sites no class in 751 or 750 reaches, found by the writer

751's CORRECTION generalised the lesson to "grep the VALUE, not the symbol". These three defeat even
that, because the value is not a bare `49` token in any of the greps either party ran.

1. **`projectionVersion: 49` as an object-literal ARGUMENT** — `tests/bridge-schema.test.ts:81` and
   `tests/bridge-contract-generator.test.ts:562`. Neither a `toBe`, nor a definition (`= 49`), nor a
   URN, nor a C# string. The generator one silently kept rendering a 49 constant into a schema whose
   running projection is 50.
2. **`toThrow(/expected literal 49/)`** — `tests/bridge-schema.test.ts:341`. The 49 lives inside a
   regex literal that matches the wire validator's own error text. It FAILED loudly, which is how I
   found it: `expected [Function] to throw error matching /expected literal 49/ but got
   '$.snapshotVersion: expected literal 50'`.
3. **`tests/bridge-p14b3-promise-command.test.ts:512`**, an exact history-row `toEqual`. 750-T listed
   the row-shape breaks in `p14b1`, `p14b2` and `p14b4-cast-class` and missed this one. It also
   failed loudly.

The generalisation that survives all three: **a version sweep is not finished until every test that
touches the bumped surface has actually RUN.** Static enumeration found 42 of 45 version sites and
3 of 4 row-shape sites.

### 6.3 One helper I changed rather than its assertion

`tests/bridge-p14b4-cast-class.test.ts`'s `history()` builds its expected row from a `root` promise
object the CALLER supplies. One caller (`:399`) passes `bound.focus`, a promise read out of a
`migrateToV31` save — a pre-V32 object that never carried `supersededByPromiseId` at all. Reading the
new members off `root` would have pinned `undefined`. I made the helper read exactly those two
members off the live row in the `state` it was given, which is where every other caller's `root`
already comes from. The other ten members still come from `root`, and every assertion in the helper
is unchanged in strength.

### 6.4 The generator's declaration-body identity

`tests/bridge-contract-generator.test.ts` pins the sha256 of the WHOLE rendered C# declaration body
for F10 and F11. B.8 adds six `$defs` and two row members, so it grew, exactly as B.6 did
(`53058c23…` → `d54e9472…`).

I did NOT read the new value off the failure message; that file's own comment forbids it. I computed
it with a disposable `vite-node` probe that renders twice and refuses a non-deterministic render,
mirroring the 700-gen-hash probe:

```
F10_CURRENT_QUOTE_UNIONS      2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e  386222 bytes
F11_CURRENT_COMMAND_UNION     2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e  386222 bytes
F12_P05_PRODUCTION_SENTINEL   78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6   15018 bytes
```

F12 is the frozen P05 subset and is INDEPENDENT of the new `$defs`. The same probe measured it
UNCHANGED, which is the evidence B.8 stayed inside its scope. The probe was deleted.

## 7. The seven residue greps, with their actual output

Run by the writer on the finished tree. `docs/` is excluded throughout: records are prose about past
identities, not code.

```
--- CLASS 1: PROJECTION_VERSION).toBe(49) ---
(no matches)
--- CLASS 2: SNAPSHOT_VERSION).toBe(49) ---
(no matches)
--- CLASS 3: snapshotVersion).toBe(49) ---
(no matches)
--- CLASS 4: projectionVersion).toBe(49) ---
(no matches)
```

```
--- CLASS 5: symbolic '= 49' ---
tests/bridge-p14b8-waiver-surface.test.ts:120:const OUTGOING_PROJECTION = 49
src/core/talentSummary.ts:507:  if (workEthic <= 49) return 'Inconsistent'
```
The first is the RED's own OUTGOING constant and is correct at 49. The second is a work-ethic band
threshold and has nothing to do with the projection.

```
--- CLASS 6: ProjectionVersion = 49 (the C# constant as text) ---
(no matches)
--- CLASS 9 (writer-found): projectionVersion: 49 ---
(no matches)
--- residue: /expected literal 49/ ---
(no matches)
```

```
--- CLASS 7: projection-49 ---
tests/bridge-p14b5-relationships.test.ts:62            // P14B.8: the outgoing projection-49 identity, retired by the B.8 bump.
tests/bridge-p14b4-runtime47-compatibility.test.ts:43  // …schemaId before the projection-49 bump (ad49031f^), read
tests/bridge-p14b4-runtime47-compatibility.test.ts:57  // P14B.8: the OUTGOING projection-49 identity — the checked-in contract-manifest
tests/bridge-runtime-checkpoint.test.ts:974            // …schemaId before the projection-49 bump (ad49031f^), also
tests/bridge-runtime-checkpoint.test.ts:994            // P14B.8: the outgoing projection-49 identity — the checked-in contract-manifest
tests/bridge-p14b6-relationship-read-models.test.ts:94 // P14B.8: the outgoing projection-49 identity, retired by the B.8 bump.
tests/bridge-p14b8-waiver-surface.test.ts:799          it('the genuine projection-49 checkpoint is no longer the CURRENT identity: …
tests/fixtures/p14/genuine-projection49-runtime/MANIFEST.json:3
bridge/runtime-checkpoint.ts:60                        // P14B.8: exact OUTGOING projection-49 identity (Save V32 / rules 4, no waiver quote
tests/fixtures/p14/genuine-projection49-runtime/genuine-projection49-runtime.provenance.json:3
tests/fixtures/p14/genuine-projection49-runtime/genuine-projection49-runtime.provenance.json:96
```
Eleven hits, every one correct: six B.8-authored comments naming what 49 now IS (a prior), the two
frozen historical comments 751 protects, the RED's own test title, and three lines of minted
provenance that must never move. No live pin survives.

```
--- CLASS 8: sha256:60af24c5… (truncated for reading; matched in full) ---
tests/bridge-p14b8-waiver-surface.test.ts:119        const OUTGOING_49 = '…'
tests/bridge-p14b5-relationships.test.ts:63          const OUTGOING_49 = '…'
tests/bridge-p14b6-relationship-read-models.test.ts:95 const OUTGOING_49 = '…'
tests/bridge-p14b4-runtime47-compatibility.test.ts:60  '…',      (roster entry)
tests/bridge-runtime-checkpoint.test.ts:997            '…',      (roster entry)
bridge/runtime-checkpoint.ts:67                        ['…', 'projection-v49']
tests/fixtures/p14/genuine-v31-pre-b7/*.provenance.json        ×9
tests/fixtures/p14/genuine-v31-pre-b7/MANIFEST.json
tests/fixtures/p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.provenance.json
tests/fixtures/p14/genuine-v32-pre-b8/MANIFEST.json
tests/fixtures/p14/genuine-projection49-runtime/genuine-projection49-runtime.provenance.json ×2
tests/fixtures/p14/genuine-projection49-runtime/MANIFEST.json ×2
```
Six live references, all of them naming 60af24c5 as the OUTGOING/PRIOR identity, plus the 13 frozen
evidence files. No live reference treats it as the running identity.

A residue grep returning nothing is the evidence for classes 1, 2, 3, 4, 6 and 9. For classes 5, 7
and 8 the residue is real and each line is accounted for above.

## 8. Checks actually run

### The two B.8 files, on the finished tree

```
node_modules/.bin/vitest run tests/bridge-p14b8-waiver-surface.test.ts tests/p14b8-waiver-surface-oracle.test.ts --minWorkers=1 --maxWorkers=1
  Test Files  2 passed (2)
       Tests  44 passed (44)
    Duration  26.46s
```

32 of 32 in `tests/bridge-p14b8-waiver-surface.test.ts` and 12 of 12 in
`tests/p14b8-waiver-surface-oracle.test.ts`. Before the implementation, at HEAD `ca5eceff`, I
reproduced the RED's own result first: `Tests 32 failed (32)`, duration 7.40s, the last failure being
group12's `expected null to be 4` on the projection-49 checkpoint.

### Every file this change touches, one consolidated run, single worker

```
node_modules/.bin/vitest run --minWorkers=1 --maxWorkers=1 <31 swept test files> \
  tests/bridge-p14b8-waiver-surface.test.ts tests/p14b8-waiver-surface-oracle.test.ts
  Test Files  33 passed (33)
       Tests  539 passed | 2 todo (541)
    Duration  1020.74s
```

Three failures appeared during the sweep and are the three sites §6.2 records; each was fixed at its
cause and the file re-run green. I ran no other suite. The parent owns heavy runs.

Evidence limit on that consolidated run: I trimmed two unused members from `bridge/promises.ts`
(a dead exported type alias and an unread conversion field) while it was executing. The trim is
type-only and behaviour-inert, the bridge typecheck is clean on the finished tree, and I re-ran both
B.8 files afterwards on the final bytes. The other 31 files never call the waiver conversion.

### Typechecks, all three surfaces, on the finished tree

```
npx tsc --noEmit                       errors: 0
npx tsc -p tsconfig.bridge.json        errors: 0
npx tsc -p ui/tsconfig.json --noEmit   errors: 0
```

### The contract check

```
npm run check:bridge-contract
  verified bridge/schema/project-studio-bridge.schema.json
  verified generated/unity/StudioBridgeDtos.Generated.cs
  verified generated/unity/project-studio-bridge.contract-manifest.json
```

## 9. Nothing in the RED I could not satisfy

All 32 bridge cases and all 12 oracle cases pass with no case amended, skipped or relaxed. I adopted
I1 through I8 exactly as the parent's rulings settled them, including the internal `promiseWaiver`
family discriminant that differs from the `waivePromise` wire kind.

The RED's own disclosed limits stand and I did not work around any of them:

- The commit-side ownership re-check is unreachable from the public surface. I built it; this suite
  proves the invariant it protects, not the guard firing.
- "Accepted at quote, refused at commit" cannot be constructed through the session for this family,
  because a digest-equal state is a byte-equal state. I built the curated commit-side refusal anyway.
- `pendingQuotes.clear()` and the digest guard are observationally identical at the surface.
- No single fixture holds both a player-owned and a rival-owned bound open promise, so the gate is
  proved on two worlds in two sessions.

## 10. Where 744-as-amended and 752-W are still wrong or incomplete

**752-W §4's site list is incomplete, and so is 751's corrected class list.** Three live sites are
named by neither (§6.2). Two of them would have shipped silently under the seven published classes.

**751's CORRECTION is right that the split is per-line and wrong about one line number.** The stale
title it flags is at `bridge-p14b6-relationship-read-models.test.ts:750` and the roster assertions it
names as `:766`/`:767` are at `:766`/`:767` only after `INCOMING_PROJECTION`'s own line; the
roster-count TITLE it does not mention is at `:760`.

**744 §11 A13's correction is right and I followed it.** Rule 6 asks whether the SUBSTITUTE's mask is
a SUBSET of the promised mask, a P1 original's mask is every slot, and a P2-lead substitute therefore
PASSES rule 6 and reaches rule 7. No code or comment I wrote asserts the opposite.

**744 §11 A2 is right and I did not re-introduce the withdrawn claim.** A waived promise carries a
NON-NULL `outcomeEventId` because `settle` coerces it. The public Industry exclusion rests on the
outcome enum test at `bridge/industry.ts:148` alone. I added no second guard and touched
`bridge/industry.ts` not at all; the RED's group6 asserts the receipt exists and no activity carries
its eventId.

**Neither 744 nor 752-W anticipated the promoted-property consequence** of adding a sixth member to
`StudioQuoteSnapshot` (§5). That is the one place where a reasonable reading of the brief would have
produced a C# base-class change nobody asked for.

**744 §11 A8 leaves the offered family set unnamed, as 750-T §6 says.** I adopted the RED's reading,
`APPEARANCE_COUNT` and `LEAD_OR_SIGNIFICANT_ROLE_COUNT`, read off `NOT_OFFERED_IN_B1`, and I required
`seatClass` so the engine's build vocabulary for a classless P2 stays unreachable.

## 11. What I refused to do

I did not move `src/core/promises.ts`. I did not add a waiver-specific duplicate of the stale-revision
guard, the digest binding, `pendingQuotes.clear()`, `priorResponse` or clear-on-load. I did not edit
or delete a single assertion to make anything pass: every test change is a version literal, a
schema-identity literal, a roster entry, a new required row member on an exact expected row, or a
title whose number my own change falsified. I did not re-mint, re-hash or edit any fixture. I did not
run the full suite. I did not commit.

One path publishes a raw engine message and I left it that way deliberately: if `waivePromise` threw
after `waiverAccepted` returned `null`, the quote-time preflight would reject with the engine's own
text, namespace included. That mirrors all four sibling families, and the alternative — swallowing
the real cause behind curated copy — hides a genuine fault. The path is unreachable by construction:
`waiverAccepted` checks every condition `waivePromise` throws on, ahead of it. Recorded, not fixed.

## 12. Standing qualifications

Unity controls for the waiver remain deferred; the bump regenerated the C# DTOs, which is a wire fact
and not a native claim. The `ui/` React surface is untouched (FU-1). B.7's inherited disclosed gaps —
the natural waiver route, rule 3 coverage, the rules 4/5 separation — are unchanged, and B.8 adds the
PLAYER-SURFACE half of the rule-7 gap the corpus cannot express. A green run of 44 cases is a wire
claim, not a playtest.
