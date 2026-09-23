# 749-T — P14B.8 RED brief: the waiver's player surface

Author: parent. Audience: the independent test-author specialist. Source `25794023`.

Authority: record 744 **as amended by its §11 log**, and record 745-C. Read 744 §11 first; four of
its amendments change what this suite asserts, and one of them is a requirement the first draft did
not contain at all.

You author tests only. You do not touch `src/`, `bridge/`, `generated/` or `ui/`. Every test you
write must FAIL against the current source for the right reason, and you report the actual failure
text for each.

---

## 1. The behaviour under test

A studio that can no longer keep an open promise offers the person a substitute. On acceptance the
original settles `WAIVED` and the substitute binds to the same employment contract in the same step.
B.7 built that law and it is verified. B.8 gives the player a way to reach it:

> select an open promise → propose a substitute → receive an accurate quote or the specific refusal
> → confirm → see the original marked WAIVED and the replacement recorded.

## 2. The surface being added (do not design it, assert against it)

- A quote family `quoteWaivePromise`, answering with a `StudioPromiseWaiverQuoteSnapshot` carrying
  `intentId`, `kind`, `commitLabel`, `ok`, the refusal sentence, the echoed substitute terms and a
  `consequence`. Shaped on `StudioMarketProposalQuoteSnapshot` (`bridge-schema.ts:2062`).
- A commit arm: a `promiseWaiver` family in `pendingQuotes` and in `quotedIntentFor`, with the
  fail-closed revalidation every other family has.
- A new `AVAILABLE_INTENT_KINDS` member for that commit.
- `StudioMarketPromiseHistoryRow` gains `supersededByPromiseId: string | null` AND
  `progress: number` (744 §11 A12).
- The waiver quote's own draft payload, whose `family` domain admits only the families this surface
  offers (744 §11 A8). `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT` must
  be unexpressible, because their engine refusal publishes "not offered in this slice" to a player.
- `PROJECTION_VERSION` 49 → 50, with `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b`
  registered as `projection-v49` in `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` in the same commit.

## 3. The fixture, and the one fact that is load-bearing

`tests/fixtures/p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz`, Save V32, week 104. One
bound open `APPEARANCE_COUNT` promise, count 2, progress 0, remaining 2, issued by
`studio-aca408ec-player`. Pin its sha from the MANIFEST the way the B.7 suites pin theirs.

Measured at mint time, on the live engine, and again on the state read back from disk:

| substitute | verdict |
| --- | --- |
| count 1, window `[tick+1, tick+61)` | refused: `only 1 of the 2 pictures still owed would be covered` |
| count 2, same window | accepted (`waiverAccepted` returns null) |

**LOAD-BEARING, do not disturb:** the world still holds an ACTIVE throwaway production seating the
beneficiary. That seat supplies `seatedPreFirstTake = 1`, which is why a count-2 substitute is
REASONABLY_ACHIEVABLE rather than FRAGILE. A test that cancels or films that production removes the
accept case.

**Rule ordering (744 §11 A13).** A count-1 substitute reaches rule 7 only if rules 1 through 6 pass.
Hold `family` and seat class EQUAL to the original and vary ONLY the count. A P2 substitute against a
P1 original fires rule 6 (seat-mask strength) first and masks rule 7 entirely.

The other corpus fixtures stay available: `genuine-v31-pre-b7/*` for cases needing a settled,
distrusted or rival-issued world.

## 4. What the suite must assert

Numbered to the completion condition in 744 §2, plus the amendments.

**(1) Propose.** A player can quote a substitute for a named open promise of their own studio,
through `BridgeSession.quote`, with no client-authored engine state.

**(2) Refusal is an ACCEPTED answer, verbatim, and changes nothing.** The count-1 substitute returns
`accepted: true` with `ok: false` and the engine's sentence exactly. Assert the state revision is
unchanged, the promise is still open, and `authoritativeDigest` before equals after. Assert NO intent
is registered: submitting the returned `intentId` afterwards is refused.

**(3) Acceptance.** The count-2 substitute returns `accepted: true`, `ok: true`, one registered
intent.

**(4) Confirm.** Submitting that intent returns one accepted command; the original settles `WAIVED`;
the substitute exists, is bound to the SAME `contractId`, starts at `progress: 0` with empty
`evidenceRefs`; the revision advances by exactly 1.

**(5) History shows which replaced which.** On ALL THREE carriers — the market case block's
`promiseHistory`, `StudioMarketHistory.promises`, and the person profile's `promises` — assert BOTH
rows are present (co-presence, 745-C §8 condition 2) and that the waived original's
`supersededByPromiseId` equals the substitute's `promiseId`. Also assert `progress` is projected.
Note the ordering: `promiseHistoryFor` ends with `.reverse()`, so the SUBSTITUTE appears BEFORE the
original.

**(6) Nothing public.** No waiver reaches any Industry surface. Assert the public kept/broken
announcements for a settled world are UNCHANGED by a waiver in the same state. Note for your own
reasoning, and do not assert the converse: a waived promise DOES carry a non-null `outcomeEventId`
(`settle` coerces it at `src/core/promises.ts:706`), so the exclusion rests on the outcome enum test
alone at `bridge/industry.ts:148`.

**(7) Cannot waive twice, cannot accept a stale offer.** Four cases, each proving an EXISTING generic
protection for this family rather than a new guard: a replayed `intentId` after an accepted command
(`pendingQuotes` is cleared); a stale `expectedStateRevision`; a quote whose board moved before
commit; a replayed `commandId` returning the first response. Each must settle nothing.

**(8) Save and reload.** Save after the waiver, reload, and assert the original is still `WAIVED`,
the substitute still bound, and the link intact. Also assert that a quote minted BEFORE a save cannot
be committed after the reload (`bridge/session.ts:2054` clears `pendingQuotes` on load).

**(A1) THE OWNERSHIP GATE — the most important case in this suite.** Neither `waiverAccepted` nor
`waivePromise` checks who owns the promise. Using a fixture holding a RIVAL-issued open promise
(`genuine-v31-pre-b7/genuine-v31-with-edges` has rival-issued bound rows; verify before relying on
it), assert that quoting a waiver against a promise whose `issuerStudioId` is not the player's studio
is REFUSED, and that submitting such an intent is refused at commit too. Then assert the rival's
promise is untouched: still open, no substitute minted, `state.promises.length` unchanged.

Also assert an unknown or malformed `promiseId` is rejected at conversion with `ENGINE_REJECTED`,
matching the four existing families, NOT returned as an accepted `ok: false` quote.

**(A6) The commit-path copy is curated.** A substitute accepted at quote time and refused at commit
time must NOT publish `promises: this person did not accept the substitute — …`. Assert the message
does not contain the `promises:` namespace prefix. Construct this by quoting, then moving the board
so the substitute is no longer acceptable, then committing.

**(A8) The unoffered families are unexpressible.** Assert a draft naming `DIRECTING_COUNT` is refused
by the wire, not carried into the engine, so "not offered in this slice" never reaches a player.

**(Projection) The bump is complete and consistent.** Assert `PROJECTION_VERSION` is 50; that the
outgoing `sha256:60af24c5…` is registered as `projection-v49`; that the checked-in JSON schema,
the contract manifest and the C# header all equal the running identity (the pattern at
`tests/bridge-p14b5-relationships.test.ts:308-319`); and that
`tests/fixtures/p14/genuine-projection49-runtime` still LOADS through the governed prior path with
`migratedFromProtocolVersion` handled as its siblings are.

## 5. Constraints

- Do not weaken, delete or relax any existing assertion, validator or fixture. If an existing test
  must change because the projection moved, list it and say why; do not edit it yourself.
- Do not add a waiver-specific duplicate of a protection that already exists generically. Assert the
  generic one fires.
- Every case must fail for the RIGHT reason now. Report the actual failure text per case.
- Put engine-law cases in `tests/p14b8-*.test.ts` and bridge cases in `tests/bridge-p14b8-*.test.ts`,
  following the B.7 split.
- Run ONLY your own files, single worker, by positional filename. Do not run the full suite.

## 6. Deliverable

The test files, plus a report giving: every case with its actual current failure text; anything you
found unreachable and why; any existing test you believe the bump will break, listed but not edited;
and any place where 744-as-amended is still wrong or underspecified. State plainly if a required case
cannot be written, rather than writing a weaker one.
