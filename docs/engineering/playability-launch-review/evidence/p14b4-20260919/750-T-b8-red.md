# 750-T — P14B.8 RED: the waiver's player surface

Author: the independent test engineer. Brief: 749-T. Authority: record 744 as amended by its §11 log,
and record 745-C. Source measured at `25794023`. HEAD moved to `f78dcb83` while this ran; the diff
`25794023..f78dcb83` touches four files, all under `docs/`, so every measurement below still holds
against the current tree.

Mode: tests only. I wrote two new files under `tests/` and this record. I edited no file under
`src/`, `bridge/`, `generated/`, `ui/`, and no existing test. I committed nothing.

---

## 1. The two files

| path | sha256 | lines | cases | result |
| --- | --- | --- | --- | --- |
| `tests/bridge-p14b8-waiver-surface.test.ts` | `21f7b75688594a03eeb394c162279cc87b55eafa6f59c3a2ff3b8ee5263a20ef` | 813 | 32 | **32 fail** |
| `tests/p14b8-waiver-surface-oracle.test.ts` | `6880536cce287968cf13d67b8c2882893abf39d3399a00e285d7395f42396b88` | 335 | 12 | **12 pass, by design** |

Commands, run exactly as the brief requires, single worker, positional filename:

```
node_modules/.bin/vitest run tests/bridge-p14b8-waiver-surface.test.ts --minWorkers=1 --maxWorkers=1
  -> Tests  32 failed (32)     Duration 7.95s
node_modules/.bin/vitest run tests/p14b8-waiver-surface-oracle.test.ts --minWorkers=1 --maxWorkers=1
  -> Tests  12 passed (12)     Duration 3.29s
```

Node `v20.20.2`, vitest `2.1.9`, both files in the `core` project. I ran no other suite.

`npx tsc --noEmit` reports zero errors on `tests/p14b8-waiver-surface-oracle.test.ts`, which the root
tsconfig includes. The bridge file matches the existing `tests/bridge*.test.ts` exclude and therefore
carries no typecheck coverage, by the same convention every bridge test file already uses.

### Why the split, and why the oracle passes

B.8 moves no engine law. 744 §1 says so and the source agrees, so there is no engine-side RED to
write. The engine file is the oracle, and each of its twelve case names says "PASSES TODAY" and why.
It earns its place three ways:

- It pins the fixture bytes. `genuine-v32-owes-two-p1` is consumed by no other test in the
  repository. Its minter was archived out of `tests/` at `6d93e62c`, so before this file nothing
  guarded those bytes at all.
- It pins the verbatim sentences the bridge must publish, on the law. A future failure is then
  attributable on sight: oracle red means the law moved, bridge-only red means the surface published
  the wrong copy.
- It measures the ownership exposure on a genuine rival-issued promise, so the bridge gate is pinned
  against a demonstrated hole rather than a suspected one.

---

## 2. Every case, with its ACTUAL failure text

All 32 bridge cases fail. The 15 distinct assertion messages collapse to 5 root causes. Every string
below is copied from the run, not predicted.

### Cause 1: the quote family does not exist (24 cases)

`session.quote` has an explicit final guard since P14A.1, so the refusal is clean rather than a
misrouted casting draft. Two surfaces answer, and both messages appear below verbatim.

**group1** `CC1: the propose leg exists on the wire and on the session`

- *the closed quote-request validator ADMITS a waiver draft and coerces nothing, and the session
  answers with the waiver family*
  ```
  AssertionError: the wire must admit this family; validateQuote said "Command envelope is invalid:
  $: matched no allowed type ($.draft.conceptId: required property is missing; $.draft.budgetMarketing:
  required property is missing; $.draft.blueprintId: required property is missing; $.draft.blueprintId:
  required property is missing; $.draft.talentId: required property is missing; $.draft.premiumTier:
  required property is missing).": expected false to be true // Object.is equality
  ```
- *the draft carries NO engine state: no studio id, no contract id, no feasibility receipt, no
  outcome*
  ```
  AssertionError: non-vacuous premise: the negatives above mean nothing unless the wire actually
  accepts this exact state-free draft: expected false to be true // Object.is equality
  ```

**Fifteen cases share one text.** Each calls `session.quote` and gets the same refusal:

```
AssertionError: the waiver quote family must ANSWER, not refuse the envelope. The surface said:
"Unknown quote type \"quoteWaivePromise\"." ("INVALID_COMMAND"): expected false to be true
```

| group | case |
| --- | --- |
| group2 | CC2 the count-1 substitute answers accepted:true / ok:false with the engine's sentence VERBATIM |
| group2 | CC2 a refused quote registers NO commit intent |
| group3 | CC3 a count-2 substitute answers ok:true with one digest-bound intent |
| group3 | CC3 Trap 3, the quote never names the substitute's future id |
| group4 | CC4 one accepted command settles the original WAIVED and binds the substitute |
| group5 | CC5 (b) through the player's own route, all three carriers agree |
| group6 | CC6 the player's route publishes nothing public |
| group7 | CC7 (a) replayed intentId after an accepted command |
| group7 | CC7 (b) stale expectedStateRevision |
| group7 | CC7 (c) the board moved before commit |
| group7 | CC7 (d) replayed commandId returns the first response |
| group8 | CC8 save after the waiver, reload, link intact |
| group8 | CC8 a quote minted before a save cannot be committed after the reload |
| group10 | A6 the refusal is the BARE sentence |
| group10 | A6 no message on any leg carries the engine namespace prefix |

**group9** `A1: the ownership gate`. Four cases stop at the group's own premise, which asserts the
surface exists before "refused because the player does not own this promise" can mean anything:

```
AssertionError: premise: the waiver family must EXIST before "refused because the player does not
own this promise" means anything: expected false to be true // Object.is equality
```
covering (a) QUOTE refused, (b) COMMIT settles nothing, (c) unknown promiseId is ENGINE_REJECTED,
(e) the refusal discloses nothing about the rival.

- *(d) a MALFORMED promiseId never reaches the session*
  ```
  AssertionError: non-vacuous premise: the wire admits a WELL-formed waiver draft:
  expected false to be true // Object.is equality
  ```

**group11** `A8: the waiver draft offers only what this surface has`

- *the two OFFERED families validate and the three unoffered ones are refused at the wire*
  ```
  AssertionError: APPEARANCE_COUNT is offered by the engine and must be expressible on this surface:
  expected false to be true // Object.is equality
  ```
- *a seat-class substitute REQUIRES its explicit class*
  ```
  AssertionError: non-vacuous premise: an explicitly classed P2 substitute IS expressible:
  expected false to be true // Object.is equality
  ```

The premise ordering in group9 and group11 is deliberate. Without it, group9(b) and group9(e) PASSED
against current source, for the wrong reason: no family exists, so nothing can commit and no message
can name a rival. I caught both on the first run and made them red. That is the only change I made to
a case after seeing its result.

### Cause 2: the schema has no waiver definitions (1 case)

**group1** *the schema publishes the waiver quote family and its own draft payload as named
definitions*
```
AssertionError: I3: the answer type must exist in $defs: expected [] to not have a length of +0
```

### Cause 3: the history row carries neither new member (2 cases)

**group5(a)** *PROJECTION ONLY: after an engine waiver, every carrier holds BOTH rows, newest first,
with the typed link and the projected progress*
```
AssertionError: StudioMarketCaseSnapshot.promiseHistory: 744 §4 item 3 — the TYPED link, so no
consumer parses outcomeCause: expected undefined to be 'promise-1' // Object.is equality
```
This case waives through the ENGINE, so its red is the projection alone. Co-presence, ordering and
`outcomeCause` all pass before it; the case reaches the link assertion, which is the point.

**group5(c)** *the wire ADMITS both new members*
```
AssertionError: I6: supersededByPromiseId is a first-class row member:
expected [ 'contractId', 'count', …(8) ] to include 'supersededByPromiseId'
```

### Cause 4: the intent vocabulary has no waiver (1 case)

**group4** *744 §11 A4: the commit rides a NEW AVAILABLE_INTENT_KINDS member*
```
AssertionError: expected [ 'signFoundingContract', …(24) ] to include 'waivePromise'
```

### Cause 5: the projection has not moved (4 cases)

**group12**

- *PROJECTION_VERSION is 50 and the schema document agrees* → `AssertionError: expected 49 to be 50`
- *the running identity moves OFF sha256:60af24c5… and that identity is registered as projection-v49
  in the SAME commit*
  ```
  AssertionError: the new quote family and the two new row members alone mint a new content hash:
  expected 'sha256:60af24c58bc4bea8f04e7fc818f840…' not to be 'sha256:60af24c58bc4bea8f04e7fc818f840…'
  ```
- *the checked-in JSON schema, the contract manifest and the C# header all equal the running identity*
  ```
  AssertionError: the regenerated DTOs must carry the new history-row member: expected false to be true
  ```
  The three identity assertions above it pass today, correctly: the artifacts are in sync at 49. The
  case fails on the regenerated members, which is the half the bump owes.
- *the genuine projection-49 checkpoint is no longer the CURRENT identity*
  ```
  AssertionError: handled exactly as its projection-47 and -48 siblings are: expected null to be 4
  ```
  Measured: today the fixture's `schemaId` equals `SCHEMA_ID`, so `loadBridgeRuntimeCheckpoint`
  returns `migratedFromProtocolVersion: null` and mints no session. After the bump it must return 4
  and mint exactly one, as the 47 and 48 checkpoints already do.

### The oracle, all 12 passing

group1 pins the owes-two world (one bound open player-issued P1, count 2, progress 0, remaining 2,
null link, empty evidence) and `LIVE_SAVE_VERSION` 32 / `PROMISE_RULES_VERSION` 4. group2 pins the
full measured verdict table. group3 records the A13 refutation in §6 below. group4 measures the
ownership exposure and the non-null `outcomeEventId`.

---

## 3. Measurements this suite rests on

Every row measured live on `25794023` with a disposable `vite-node` probe, then re-asserted inside
the committed test files. Nothing here is read off the source.

**`waiverAccepted` on `genuine-v32-owes-two-p1`, `promise-0`, week 104:**

| substitute | verdict |
| --- | --- |
| P1 count 1, window `[105,165)` | `only 1 of the 2 pictures still owed would be covered` |
| P1 count 2, window `[105,165)` | `null` (accepted) |
| P1 count 3, window `[105,165)` | `what remains of the contract cannot reasonably carry the substitute — needs a picture not yet commissioned` |
| P1 count 2, window `[104,194)` | `an identical substitute changes nothing this studio owes` |
| P1 count 2, window `[104,165)` | `a substitute is a forward obligation, and this window opens no later than the week of the waiver` |
| P1 count 2, window `[105,504)` | `what remains of the contract cannot reasonably carry the substitute — the due week falls outside the proposed contract` |
| DIRECTING_COUNT count 2 | `what remains of the contract cannot reasonably carry the substitute — a directing promise is not offered in this slice` |
| P2 lead count 2 | `what remains of the contract cannot reasonably carry the substitute — needs a picture not yet commissioned` |
| P2 lead count 1 | `only 1 of the 2 pictures still owed would be covered` |

Count 2 is the ONLY accepted count on this world. Count 3 hits the `existingPath` ceiling that record
747 measured, the same wall that blocked the Owner's literal 3/1/2 case.

**The ownership exposure, on `genuine-v31-with-edges` at week 213**, player `studio-aca408ec-player`:

- Nine rival-issued BOUND OPEN promises. I decompressed all nine `genuine-v31-pre-b7` artifacts and
  read every promise row: this is the only fixture that has any. `rival-current-p1-and-p2` holds 48
  promises and none is both rival-issued and bound-open.
- `waiverAccepted(state, promise-1, substitute, 213)` returns **null** for both a count-1 and a
  count-2 substitute. There is no engine sentence, so the bridge's refusal cannot be an accepted
  `ok:false` quote carrying "the engine's own sentence". That measurement forces I5 below.
- `waivePromise(state, {promiseId: 'promise-1', ...})` settles rival `studio-aca408ec-r02`'s promise
  `WAIVED`, mints `promise-48` bound to the RIVAL's own employment contract
  (`studio-aca408ec-r02:contract:person-studio-aca408ec-r01-0:208`), and names the player's studio
  nowhere. 48 promises become 49.

**The Industry fold.** `genuine-v31-kept-and-broken` publishes exactly two outcome rows,
`promiseKept` and `promiseBroken`, so group6's control is real. The owes-two world's Pulse fold holds
13 rows before an engine waiver and 13 after, with zero `outcomeKind` rows, so group6's exclusion is
a comparison and not a vacuum.

**Fixture sha256, re-read from disk, all matching their manifests:**

```
genuine-v32-owes-two-p1.json.gz          gz 56f62999…3daa   raw ccd30fdf…6ea6d
genuine-v31-with-edges.json.gz           gz 2dce6bfe…8e6c   raw eb516760…7054
genuine-v31-kept-and-broken.json.gz      gz 57362b7e…2841   raw 734f671b…10d1
genuine-projection49-runtime.…json.gz    gz 55f2a2fd…d972   raw c92774f5…5c45
```

**Session mechanics, measured so the cases are constructible:** `session.load()` restores a
byte-identical state, so `authoritativeDigest` before a save equals the digest after the reload; that
is what lets group8's second case isolate `pendingQuotes.clear()` at `session.ts:2054` from the digest
guard. The owes-two world offers no `advanceWeek` intent (a production blocker is open), so group7(c)
moves the board with `startConstruction`, measured to change the digest while touching no promise, no
production and no week.

---

## 4. Interpretations I had to name

744 and 749-T pin the requirement, not every identifier. Each name below is declared in the test
file's own header, reached through one accessor, and is a rename the writer may make with the ruling
recorded, the convention 654-T and 725-T both used. Nothing here is a refusal.

| id | interpretation |
| --- | --- |
| I1 | request `type: 'quoteWaivePromise'`, standard envelope, `draft` member |
| I2 | draft `StudioPromiseWaiverDraftPayload` = `{ promiseId, substitute }`; `substitute` is a closed family-discriminated union reusing `promiseDraftTerms` with the family domain narrowed to `APPEARANCE_COUNT` and `LEAD_OR_SIGNIFICANT_ROLE_COUNT`, the second requiring its explicit `seatClass` |
| I3 | answer `StudioPromiseWaiverQuoteSnapshot`: `intentId`, `kind`, `commitLabel`, `ok`, `refusalReason` (string or null, null exactly when ok), `promiseId`, `talentId`, `family`, `count`, `seatClass`, `windowStartWeek`, `dueWeekExclusive`, `consequence` |
| I4 | intent kind `'waivePromise'`, matching the one-verb naming of `placeFacility` and `commissionSet`, not the family-router naming of `marketProposalAction` |
| I5 | the ownership refusal is a protocol rejection with `ENGINE_REJECTED`, indistinguishable from an unknown id. Forced by measurement, not chosen: `waiverAccepted` returns null for a rival's promise, so no engine verdict exists to publish, and answering "not found" also declines to confirm that a promise the player may not see exists |
| I6 | `supersededByPromiseId: string \| null` and `progress: number` on `StudioMarketPromiseHistoryRow` |
| I7 | the waiver answer rides the existing `StudioBridgeQuoteResponse` union |
| I8 | `PROJECTION_VERSION` 50, with `sha256:60af24c5…` registered as `projection-v49` |

The writer brief 752-W, published after I began, names `promiseWaiver` for the internal `PendingQuote`
family. I assert nothing about that name: it is private and unobservable from the surface. 752-W names
no intent-kind literal and no quote-snapshot member names, so I4 and I3 remain this suite's to
propose.

---

## 5. What I could not write, stated plainly

### The commit-time ownership re-check is unreachable from the public surface

744 §11 A1 requires the gate at quote AND again at commit. Once the quote gate holds, no public
sequence can register a waiver intent against a rival's promise, because the quote is the only route
to one, and `issuerStudioId` never changes and `state.hollywood.playerStudioId` is set at world
construction by no action. group9(b) therefore asserts the INVARIANT that nothing commits (a forged
intent id and, if the surface ever answers, the returned one; then the rival's promise still open,
`promises.length` unchanged, the whole authority byte-identical) rather than a specific commit-time
refusal message. I did not write a weaker case pretending to reach the arm. The re-check remains the
right defence in depth and the writer should build it; this suite cannot prove it fired.

### The "accepted at quote, refused at commit" construction (744 §11 A6) is also unreachable

`authoritativeDigest` is SHA-256 over the canonical save JSON (`bridge/snapshot-build-context.ts:124`),
so a digest-equal state is a byte-equal state, and `quotedIntentFor` returns undefined the moment the
digest differs (`session.ts:1628`). A deterministic verdict cannot change under a digest-equal state,
so the namespaced throw A6 warns about cannot reach a player through the session for this family, any
more than it can for the four landed ones. That is why the P10-R1 suite tests its own revalidation arm
at the conversion entry point instead (`tests/bridge-p10a-r1-contract-quote.test.ts:285`, with the
reason written out in the case). I pinned the reachable half instead: group10 asserts the quote-side
sentence is bare, and sweeps every message the family publishes on a full journey (refusal quote,
unknown-id rejection, commit label, consequence, stale rejection, accepted message, replay rejection)
for the `promises:` prefix and the throw wrapper. A6's hazard is real on the QUOTE path and that is
where the suite holds it.

### `pendingQuotes.clear()` and the digest guard are observationally identical

Every board movement reachable from the surface goes through an accepted command or a load, and both
clear the map before the digest is ever compared. Both publish `INTENT_NOT_AVAILABLE`. group7(c)
asserts the outcome and names both mechanisms rather than claiming to separate them.

### No single fixture holds both a player-owned and a rival-owned bound open promise

`with-edges` has nine rival rows and zero player rows; owes-two has one player row and no rival. So
group9 cannot show the gate admitting one and refusing the other inside one session. Two sessions on
two worlds is what the suite does. Minting a world with both is a T0 job, not a RED job, and I did not
mint one.

### Not exercised at all

Native and Unity. The `ui/` React surface (744 §9, owner FU-1). The natural waiver route, rule 3
coverage and the rules 4/5 separation, all B.7's inherited disclosed gaps. The full core suite and the
evidence runner: the parent owns heavy runs and I ran only my own two files.

---

## 6. Where 744-as-amended is still wrong or underspecified

### A13 is wrong as stated, and oracle group3 records the measurement

744 §11 A13 says "a P2 substitute against a P1 original fires rule 6 (the seat-mask strength test)
first and masks rule 7 entirely". It does not. Rule 6 refuses a substitute whose seat mask is NOT a
subset of the promised mask. A P1 original's mask is every slot, so a lead-only substitute is a
SUBSET and rule 6 passes. Measured on the owes-two world: a P2-lead count-2 substitute reaches rule 9
(`needs a picture not yet commissioned`), and a P2-lead count-1 substitute reaches rule 7 and returns
the Owner's own sentence. The direction A13 names is inverted.

A13's ADVICE still binds this suite, for a different reason than the one it gives: the P2 route
cannot express the ACCEPT half, because rule 9 refuses the only count rule 7 would admit. Holding
family and seat class equal and varying count alone is correct practice; the stated mechanism is not
the reason.

### 744 §4 item 1 and §11 A8 leave the offered family set unnamed

A8 says the draft's family domain admits "only the families this surface offers" without saying which
those are. I read it off `NOT_OFFERED_IN_B1` (`src/core/promises.ts:213-217`): the engine refuses
`DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT`, leaving `APPEARANCE_COUNT`
and `LEAD_OR_SIGNIFICANT_ROLE_COUNT`. group11 pins that reading in both directions.

### A8's principle reaches one more sentence than A8 names

A classless `LEAD_OR_SIGNIFICANT_ROLE_COUNT` substitute would publish `a seat-class promise needs its
seat class selected (lead, or lead-or-antagonist); without one it is not offered`
(`src/core/promises.ts:399`), which is the same build vocabulary A8 exists to keep away from players.
The P14B.4 market draft already makes `seatClass` required for that family. I extended I2 the same
way and pinned it; if the writer chooses otherwise, the sentence becomes reachable and A8's decision
should be reopened rather than quietly narrowed.

### 744 does not say what the quote's `consequence` should contain

I assert only that it is a non-empty string and that it never names the substitute's future id. A
consequence sheet for a waiver has no cash movement to publish and 744 gives no copy requirement, so
anything stronger would be invention.

---

## 7. Existing tests the bump will break: LISTED, NOT EDITED

Record 751 inventories the sweep and is thorough. I ran the greps independently and agree with its
split, its 13 files of minted evidence and its three historical comments. I found sites 751's
patterns do not reach. Each is listed for the parent and the writer; I edited none of them.

### Additions to 751's MOVES list

**(a) `tests/bridge.test.ts:167`, `expect(SNAPSHOT_VERSION).toBe(49)`.** The file appears nowhere in
751. `SNAPSHOT_VERSION = PROJECTION_VERSION` (`bridge/protocol.ts:34`), so the alias carries the same
running identity while staying invisible to class 1's pattern `PROJECTION_VERSION).toBe(49)`. 751
names this failure mode itself, under class 4: a finder keyed on one spelling of the version is blind
to the others.

**(b) Five second `toBe(49)` lines inside files 751 lists at one line each.** A writer editing only
the named lines leaves these:

```
tests/bridge-p13b-s1b-seats.test.ts:102        expect(page.snapshotVersion).toBe(49)
tests/bridge-p13b-s2-labs.test.ts:126          expect(response.snapshotVersion).toBe(49)
tests/bridge-p13b-s3-plans.test.ts:214         expect(plans.snapshotVersion).toBe(49)
tests/bridge-p13b-s4-office.test.ts:235        expect(response.snapshotVersion).toBe(49)
tests/bridge-r3n4-read-model-deltas.test.ts:351 expect(response.snapshotVersion).toBe(49)
```
(`tests/bridge-operations-events.test.ts:332` already pins `toBe(PROJECTION_VERSION)` and needs
nothing.)

**(c) `tests/bridge-p14b6-relationship-read-models.test.ts` is missing from 751's 22-file list.** 751
cites it twice, for the prior-roster arithmetic and as the symbolic precedent, but never puts it in
MOVES. It breaks in four places:

```
:95   const INCOMING_PROJECTION = 49                    -> 50
:766  [...keys].sort()).toEqual([...EXPECTED_36_PRIOR_IDS, OUTGOING_48].sort())
:767  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.size).toBe(37)   -> 38
:750  the title 751 already flags for correction
```
The symbolic pinning 751 praises is real, but the symbol is a literal in the same file.

**(d) `tests/bridge-runtime-checkpoint.test.ts:972`.** 751 places this file under MUST NOT MOVE for
the comment at `:974`, correctly. The assertion three lines above it is an exact 37-literal
`toEqual` over the whole prior roster and must gain `sha256:60af24c5…`. A writer reading the split
could reasonably leave the entire file alone.

**(e) `tests/bridge-p14b4-runtime47-compatibility.test.ts:177`.** 751 lists this file at `:173` for
the version pin only. `:177` asserts `[...keys].sort()).toEqual(EXPECTED_PRIOR_IDS)` against the
literal roster defined at `:40`, which also gains the new entry.

**(f) `tests/bridge-p14b4-cast-class.test.ts:330-337`, the history-row helper.** The file has no
projection pin, so no class in 751 reaches it. Its `history()` helper builds an exact expected row
and asserts `toEqual([expected])` plus `parseWireValue(...).toEqual(expected)`. Both break the moment
the row gains `supersededByPromiseId` and `progress`.

### The row-shape and vocabulary breaks, which 751 does not cover at all

751 inventories the projection identity. These break on the two new row members and the new intent
kind instead:

| site | why |
| --- | --- |
| `tests/bridge-p14b1-promises.test.ts:301`, `:319` | exact `toEqual` on a promise-history row, plus the inline row type at `:295` and `:316` |
| `tests/bridge-p14b2-trust.test.ts:50` (`expectedHistory`), used at `:219`, `:239`, `:250`, `:342` | builds the expected row literally, ten members, no link and no progress |
| `tests/bridge-p14b4-cast-class.test.ts:330-337` | as (f) above |
| `tests/bridge-p14b2-trust.test.ts:141-145` | exact `toEqual` over all 25 `AVAILABLE_INTENT_KINDS` members; it breaks by design (744 §11 A4) |

`tests/bridge-p14b2-trust.test.ts:157` (`profile.promises` vs `models.promises`) does NOT break: both
sides come from the same function.

### Schema-identity literals, agreeing with 751

`tests/bridge-contract-generator.test.ts:564` and `:567`; `tests/bridge-p14b5-relationships.test.ts:292`
with the outgoing constant then flowing into `:295` and `:342`.

### Standing qualification

These are static enumerations at `25794023`. Which of them actually fail is unknown until the bump
runs, and no count here is a prediction of the failure set. I ran none of them.

---

## 8. Evidence limits

LOGIC VERIFIED, UNITY NOT VERIFIED. This record is acceptance of nothing.

I ran two test files and a handful of disposable `vite-node` probes, all deleted. I ran no other
suite, no native build and no Unity player. I touched no production file, no generated artifact, no
existing test and no fixture. The suite proves that a surface does not exist and states precisely what
it must do; it proves nothing about whether an implementation of it is usable, and a green run of
these 44 cases would still be a wire claim, not a playtest.

The A13 refutation in §6 is a measurement on one fixture at one week. It shows the stated mechanism is
wrong there; it does not survey rule 6 in general.

The oracle's 12 passing cases are a fixture and copy contract, not coverage of B.8. Counting them as
B.8 coverage would be double counting: B.7 already proved the law and record 743 proved the
discrimination by defect injection.
