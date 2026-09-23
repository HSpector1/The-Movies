# 752-W — P14B.8 writer brief: implement the waiver's player surface

Source `18c9d5e6`. Authority: record 744 **as amended by its §11 log**, the audit 745-C, the sweep
inventory 751, and the RED suite (record 750) which lands before you start.

You are the single production writer. You edit `src/`, `bridge/`, `generated/` and the test files
the projection bump mechanically invalidates. You do NOT author new tests and you do NOT weaken,
relax or delete an assertion to make anything pass. If a test's expectation is wrong, stop and report
it; do not edit it.

---

## 1. What you are building

A studio that can no longer keep an open promise offers the person a substitute. B.7 built that law
and it is verified. You are giving the player a way to reach it:

> select an open promise → propose a substitute → receive an accurate quote or the specific refusal
> → confirm → see the original marked WAIVED and the replacement recorded.

## 2. Six changes, and no more

**(1) The history row gains two fields.** `StudioMarketPromiseHistoryRow`
(`bridge/schema/bridge-schema.ts:2320`) gains `supersededByPromiseId: nullable(nonEmptyText())` and
`progress: nonNegativeInteger()`. One write site: `bridge/promises.ts:103-115`. Three carriers share
the definition and all three inherit the fields automatically
(`StudioMarketCaseSnapshot.promiseHistory` `:2410`, `StudioMarketHistory.promises` `:2523`,
`StudioPersonProfileSnapshot.promises` `:2650`).

`progress` is a parent decision recorded at 744 §11 A12, made against the audit's advice: a player
who cannot see the remaining obligation drafts a substitute by trial and error and turns the refusal
sentence into a guessing oracle. One field, same bump, same write site.

**(2) A quote family.** `quoteWaivePromise` request plus `StudioPromiseWaiverQuoteSnapshot`, shaped
on `StudioMarketProposalQuoteSnapshot` (`:2062`): `intentId`, `kind`, `commitLabel`, `ok`, the
refusal sentence, the echoed substitute terms, `consequence`. It widens the closed
`StudioBridgeQuoteRequest` union (`:1840-1847`) and adds one `quote()` overload
(`bridge/session.ts:1757-1763`).

**Its own draft payload**, not the market one. The `family` domain admits ONLY the families this
surface offers. `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT` must be
unexpressible, because their engine refusal publishes *a directing promise is not offered in this
slice* to a player (744 §11 A8). Keep `count: integer({ minimum: 1 })`.

**(3) A commit arm.** A `promiseWaiver` member of `PendingQuote` (`bridge/session.ts:177`) and a
branch in `quotedIntentFor` (`:1625-1694`), with the fail-closed revalidation every other family has
(`:1656-1689`).

**(4) A new `AVAILABLE_INTENT_KINDS` member** (`bridge/schema/intent-schema.ts:3-56`, currently 25).
`quotedIntentFor` copies `kind: pending.kind` into the intent option at `:1630` and that field is
typed from this enum, so the commit arm cannot exist without it. Reusing `marketProposalAction` would
mislabel the commit. The list is pinned by exact `toEqual` at `tests/bridge-p14b2-trust.test.ts:141`;
that pin moves with the member.

**(5) THE OWNERSHIP GATE.** See §3. This is the one the audit found and it is the reason this slice
needed an audit.

**(6) The projection bump**, 49 → 50. See §4.

## 3. The ownership gate, in detail

Neither `waiverAccepted` (`src/core/promises.ts:917-959`) nor `waivePromise` (`:980`) compares the
promise's `issuerStudioId` to anything. `waivePromise` resolves by id alone, and ids are
`promise-${state.promises.length}`: sequential, dense, trivially enumerable. `contractInterval`
(`:821-825`) resolves any studio's employment record, and `substituteDraft` (`:847-863`) sets
`issuerStudioId` from the promise, so a rival's waiver evaluates against the rival's own pipeline and
trust and looks entirely lawful.

No client can reach the verb today. You are building the route, so the gate is yours.

**Mirror the existing pattern.** `playerProposalDraft` (`bridge/contract.ts:585-593`) sets
`issuerStudioId: state.hollywood?.playerStudioId ?? ''` — it FORCES the identity rather than trusting
the payload. The waiver has no such field to force, because the issuer arrives implicitly through the
promise id. So the gate is a refusal, not a substitution:

- Resolve the promise. If `promise.issuerStudioId !== state.hollywood.playerStudioId`, refuse.
- Refuse again at COMMIT, inside `quotedIntentFor`. The board can move between quote and
  confirmation, and a commit arm that trusts the quote is the same hole one step later.
- An unknown or malformed `promiseId` is `ENGINE_REJECTED` at conversion, matching
  `bridge/session.ts:1777`, `:1810`, `:1841`, `:1906`. An accepted `ok: false` quote is reserved for
  a real engine verdict, and "there is no such promise" is not one.

**Put the gate in the engine too, or not at all — decide and say which.** The parent's reading: the
bridge is the right place, because `waivePromise` is a pure verb whose caller supplies authority, and
every other authority decision in this codebase lives at the bridge boundary. But `waiverAccepted`
has no ownership sentence, so the bridge's refusal copy is yours to write and must not pretend to be
the engine's. If you conclude the engine should carry it, stop and report rather than deciding
unilaterally: that would be a law change and B.8 has no authority for one.

## 4. The projection bump

Record 751 is the complete inventory. The two facts that matter most:

**The registration rides the same commit as the bump.** Add
`['sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b', 'projection-v49']` to
`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (`bridge/runtime-checkpoint.ts:59`). `SCHEMA_ID` is a content
hash over the whole schema document (`bridge/protocol.ts:35`), so it moves the moment you add a
`$defs` member, and `validateVersionedRecord` (`:88-95`) strands every checkpoint written under an
unregistered identity. The roster goes to 38 and
`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)` must stay `false`.

**THE SPLIT. 13 files carry the literal 49 as MINTED EVIDENCE and must never move:** every
`provenance.json` and `MANIFEST.json` under `tests/fixtures/p14/`. They record the identity each
artifact was minted UNDER. A `grep -rl … | xargs sed` hits all of them and destroys the provenance
chain. Three more sites are historical comments about past commits
(`bridge-p14b4-runtime47-compatibility:42`, `bridge-runtime-checkpoint:974`,
`bridge-p13b-s8-rivals:223`) and also stay.

Everything else moves: the constant, the four generated artifacts, 22 test files of
running-identity pins, and the two schema-id literal pins at `bridge-contract-generator:564,567` and
`bridge-p14b5-relationships:292`. Record 751 lists every file and line.

**Regenerate, never hand-edit** `bridge/schema/project-studio-bridge.schema.json`,
`generated/unity/StudioBridgeDtos.Generated.cs` and
`generated/unity/project-studio-bridge.contract-manifest.json`:

```
npm run generate:bridge-contract
npm run check:bridge-contract
```

`tests/bridge-p14b5-relationships.test.ts:308-319` asserts all three equal the running identity.

**One title correction, no assertion touched.**
`tests/bridge-p14b6-relationship-read-models.test.ts:750` has a title reading "LIVE_SAVE_VERSION
still 31" over an assertion reading `toBe(32)`. The B.7 sweep updated the assertion and left the
title. Fix the title.

## 5. Traps, each already paid for

**Trap 1, both halves.** The QUOTE reads `waiverAccepted` (`:917`), which returns the bare sentence
and mutates nothing. Never call `waivePromise` inside a `try` to ask a question. And the COMMIT path
must curate too: `caught` (`bridge/session.ts:365-371`) returns the raw `error.message`, which
`reject` publishes unchanged, so relying on the throw ships `promises: this person did not accept the
substitute — …` to a player. Re-ask `waiverAccepted` inside `quotedIntentFor` and return curated
copy.

**Trap 2.** Do not re-derive the contract window. Rule 9 already evaluates
`substituteDraft(promise, substitute, interval)` against the real employment interval (`:954-957`).
A bridge that computes its own comparison will disagree with the commit.

**Trap 3.** The substitute's id does not exist at quote time; it is
`promise-${state.promises.length}` evaluated at commit (`:999`). The quote may describe the
substitute's TERMS and must not name its id. The RECORD afterwards may name it, and already does, in
`outcomeCause`.

**Do not rewrite `outcomeCause`.** `tests/bridge-p14b7-promise-waiver.test.ts:177` pins the exact
attention-row string built from it. That is a deliberately hardened assertion from B.7's gap closure.

**Do not "fix" the conversion cascade's unguarded final `else`** (`:1647`). A new `PendingQuote`
member without a branch routes to `contractDraftToEngine`, which rejects the widened union at compile
time. That is a type error, not a silent misroute.

**Do not add a waiver-specific duplicate** of a protection that already exists generically: stale
revision (`:1562`), digest-bound quotes (`:1628`), `pendingQuotes.clear()` (`:1613`), `priorResponse`
(`:1560`), clear-on-load (`:2054`). The RED proves the generic ones fire for this family.

## 6. Order of work

1. Read the RED (record 750) and run it. Confirm it is red for the reasons it claims.
2. Engine: nothing. B.7's law is complete and you have no authority to move it.
3. Bridge read model, then the quote family, then the commit arm, then the ownership gate.
4. The bump and the registration, in one commit with the regenerated artifacts.
5. The mechanical test sweep per record 751, honouring the split.
6. Report. Do not run the full suite; the parent owns heavy runs and they are serialized.

## 7. What this slice does not do

Unity controls (deferred; the bump regenerates the C# DTOs regardless, which is not a native claim).
The `ui/` React surface (FU-1, unreturned). The natural waiver route, rule 3 coverage and the rules
4/5 separation, all inherited disclosed gaps from B.7. The inverse `supersedesPromiseId` link, ruled
out at 745-C §8 because the derivation is total and the carrier is unpaged.

LOGIC VERIFIED, UNITY NOT VERIFIED. No native claim, no Owner acceptance claim.
