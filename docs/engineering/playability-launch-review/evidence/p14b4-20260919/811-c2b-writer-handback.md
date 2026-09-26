# 811: P14C.2b writer handback (sim-core, sole production writer)

Role: the sim-core contract (`.claude/agents/sim-core.md`) run through a general-purpose agent, because
project roles are not registered in this session (disclosed by the parent). No delegation, no installs,
no Git writes (read-only `git`, plus one `git archive HEAD` into the session scratchpad to run seven
suites against HEAD's own source for attribution). I did not open
`/Users/zacheryspector/The-Movies-c2b-red-scaffold` or any `tests/p14c2b-*` file. Times below come from `date`
(2026-09-26, CEST): work 03:37 to 04:13.

## 1. Result

**DONE**, subject to the test-side sweep. `src/`, `bridge/` and `ui/` typecheck clean. Every remaining type
error and every focused-suite failure I introduced sits in `tests/`: a version literal (35), a
`validateSaveV35` or `SaveFileV35` reading what `makeSave` now stamps, or a hand-built live state whose
record or case lacks the V36 keys (section 5). Two `p14b1-trust-chooser` failures predate this diff: they
fail identically at HEAD.

Source identity: HEAD `7c0ee86e7b519b2a63723e7861c4d5152d7e83f6`, which is the scaffold `ddd88d3c` plus
one parent commit touching only `docs/`. At 04:14 HEAD moved to `8e84bb594ee713946c3cace653320937661e60ed`
(the parent's 810, four files under `docs/` only, none opened by me); `src/`, `bridge/`, `ui/`, `scripts/`,
`tests/` and `generated/` did not move, and the diff sha below is the same against either HEAD. Tested working diff:
`git diff HEAD -- src bridge ui scripts | shasum -a 256` =
`3db9f1f648052efbba057834a86d66c437e876df38f3ba8142fdc2eac7b5885d`, 10 files, +523/−169. The sha was
recomputed after the last verification command and had not moved. Node v20.20.2. `git status --porcelain
generated/` is empty. `PROJECTION_VERSION` stays 50.

## 2. Changed paths

| path | change |
| --- | --- |
| `src/core/types.ts` | `GameState = GameStateV36`; comments |
| `src/core/careerLifecycle.ts` | the step splits into `advanceLifecycleIntent` and `advanceLifecycleSettlement` (settlement carries the C.4 cohort); `advanceCareerLifecycleWeek` = intent then settlement; `extensionIssuer`; `commitRetirementExtension`; `initialCareerLifecycle` and `retirementRecordFor` typed V36; intent writes `extensionUsed: false, extendedFromWeek: null` |
| `src/core/talentMarket.ts` | expiry discovery dedupes on (contractId, variant); a separate extension discovery pass; `marketEligibility` admits `extensionIssuer`; `submitProposal`'s early refusal narrowed, plus the term rule; the rival extension branch in the trigger loop; `survivesFreeze` cap carve-out and `belowRetirementReservation` with its `DROP_SENTENCE`; the extension accept path (record, then commit, then close); `authorRivalPromise` skips extension cases; `openMarketCaseFor`; `initialTalentMarket` is the live V36 opener |
| `src/core/promises.ts` | `attachPromise` refuses on an open extension case; the promise-outcome receipt append is typed V36 |
| `src/core/employment.ts` | `offerForTalent` reads the length factor of the largest catalogue term at or below the clamped term |
| `src/core/tick.ts` | tail: `advanceLifecycleSettlement(advanceTalentMarketWeek(advanceLifecycleIntent(advancePromisesWeek(withBonds), birthdays)))` |
| `src/core/save.ts` | `LIVE_SAVE_VERSION = 36`, `LiveSaveFile = SaveFileV36`, the union, the dispatch ("1 through 36"), `makeSave`; `validateSaveV36`, `stripV36Extension`, `convertV35ToV36`, `convertV36ToV35`, `migrateToV36`, `migrateToLive`; `migrateToV35` gains its `36` arm; 18 guards and 10 arms gain `36` siblings; frozen `convertV27ToV28` writes the V28 literal |
| `src/core/index.ts` | scaffold comments replaced; no new barrel names |
| `bridge/people.ts` | `latestCaseIsExtension`; `marketAttentionRows` returns no row and `marketCaseProjection` returns `null` for a person whose latest case is an extension |
| `bridge/market.ts` | `caseEntries` skips that person |

`ui/` and `scripts/` needed no change: every live route reads `LIVE_SAVE_VERSION`, `LiveSaveFile` or
`migrateToLive`.

## 3. Checklist against 806

1. **§1 tuning.** Read from the scaffold's `RETIREMENT_EXTENSION_WINDOW_WEEKS` (12) and
   `RETIREMENT_EXTENSION_RESERVATION_FACTOR` (1.10); the extension length is `RETIREMENT_NOTICE_WEEKS`.
2. **§2 save.** `convertV35ToV36` stamps every record `extensionUsed: false, extendedFromWeek: null` and
   every case `variant: 'expiry'`. `validateSaveV36` checks the envelope; each record's two keys
   (`extendedFromWeek` a whole week exactly when used, else null); each case's exact keys
   (`closedWeek,contractId,openedWeek,outcome,reason,subjectStudioId,talentId,variant`) and its variant;
   then: an extension case's subject holds a record with `announcedWeek <= openedWeek < E_original`
   (`extendedFromWeek` when used, else `effectiveWeek`); at most one extension case per person;
   `extensionUsed` iff that case is `settled`; when used, `extendedFromWeek === effectiveWeek − 52` and
   exactly one `hollywood.employment` row has `terms.talentId` = the person, `terms.startWeek` = the case's
   `closedWeek` and `terms.endWeekExclusive` = `effectiveWeek` (§8.2). It then strips the three keys and
   hands V35 the rest, wrapping V35's refusal. V28's market validator never sees `variant`.
   `convertV36ToV35` refuses before envelope validation when any record is used or any case is an
   extension, naming the counts and the first person.
3. **§3 order.** Tick tail as above. `advanceCareerLifecycleWeek` keeps its signature and meaning.
   Equivalence held in practice: C.2a 38/40 and C.4 52/56 + 1 todo, the only failures being section 5's
   test-side class.
4. **§4 discovery and proposals.** Step 2b runs after the expiry pass, over records in record order:
   `status === 'announced'`, `extensionUsed === false`, `w === effectiveWeek − 12`, and a
   `hollywood.employment` row of the person in force at `w` (`startWeek <= w < (endedWeek ??
   endWeekExclusive)`); one case per (contractId, variant), with its `discovered` receipt.
   `extensionIssuer` reads `openMarketCaseFor`. `submitProposal` keeps the typed throw for every record
   except an announced person's live issuer; that issuer's term must satisfy `decisionWeek + termWeeks ===
   effectiveWeek + 52`, else it is refused with a sentence carrying `retirementExtension`.
5. **§5 choice and commit.** `survivesFreeze` admits the cap only for the live issuer's proposal ending at
   exactly `E + 52`; after `belowAsk`, `belowRetirementReservation` drops it when the re-derived annual is
   below the reservation (section 4, item 1). On accept, inside `settleCase`:
   `commitRetirementExtension`, then `commitPlayerWinner` / `commitRivalWinner`, then `closeCase('settled')`.
   No try/catch, so a throw fails the tick. Decline, no proposal and invalidation use the existing paths.
6. **§6 consumers.** Section 2, bridge rows. `generated/` unchanged.
7. **§8.1 rival.** On an extension case only the subject studio's business evaluates (its decision cadence
   gate unchanged), at `effectiveWeek + 52 − decisionWeek` weeks and the lowest tier ≥ 1.10 (1.1 today; no
   proposal when none exists). The existing `submitProposal` reserve check applies; `rivalProposalTrigger`
   is not consulted; `authorRivalPromise` returns the state unchanged for an extension case.
8. **§8.4 promise.** `attachPromise` throws first when `openMarketCaseFor(state, talentId)` is an extension.
9. **§8.5 pricing, the caller proof.** Every production caller of `offerForTalent`, `contractOffer`,
   `contractOfferOptions`, `playerOffer`, `playerOfferOptions`, `studioOffer`, `proposalDraft` and the
   sign/renew actions in `src/`, `bridge/`, `ui/src/` and `scripts/` prices a catalogue term (52, 104, 156,
   208, `CONTRACT_TERM_OPTIONS`, `HOLLYWOOD_CONTRACT_WEEKS`, `CONTRACT_MIN/MAX_WEEKS`, a published offer
   option) or a term the clamp moves onto a catalogue endpoint before the lookup (`?? 0` → 52 in
   `bridge/contract.ts`, 400 and 1,040 → 208 in scripts and a UI test helper). The bridge validates
   renewal and proposal terms against `CONTRACT_TERM_OPTIONS` before pricing. One caller outside
   production prices a non-catalogue term: `tests/p14c2a-consumers.test.ts` B1/B2 price 110 weeks. Its
   factor was the `?? 1.0` fallback and is now `CONTRACT_LENGTH_FACTOR[104]` = 1.0, so its price is
   unchanged; the suite passes 17/17. `tests/bridge-p10a-r1-contract-quote.test.ts` sends 60, which the
   bridge refuses before pricing. `d11-employment` pricing goldens pass (35/36; the failure is the
   live-version literal). The engine's sign/renew actions accept any number; only the callers keep to the
   catalogue.

## 4. Where 806 was ambiguous or disagreed with source, and my resolution

1. **Reservation arithmetic.** `ask × 1.10` in floating point makes tier 1.1 fail its own reservation
   whenever the product rounds down (`100000 × 1.1 = 110000.00000000001`, price 110000). That contradicts
   §8.1 (the rival's tier 1.1 is the one that clears) and "equality accepts". I compare the price against
   `iround(ask × 1.10)`, the rounding every price uses, so tier 1.1 always clears and 1.05 never does.
2. **§5 versus §8.1 on the rival tier.** §5 says the lowest tier "whose price clears ask × 1.10"; §8.1 says
   the lowest entry ≥ 1.10. I implemented §8.1; under item 1 the two agree.
3. **`openMarketCaseFor` signature.** 806 gives `(state, talentId)`. I added an optional
   `week = state.market.tick`, as every other reader there has, so `extensionIssuer(state, id, week)`
   derives openness at its own week. Two-argument calls behave as specified.
4. **The chooser's single-survivor sentence.** 806 excludes it but names no replacement. An extension case
   skips `chooseProposal` (one issuer, at most one proposal) and settles with the candidate sentence
   `they accepted the one final extension before retiring`.
5. **"Exclude" in the bridge.** `caseForTalent` answers only a person's latest case, so an extension that is
   the latest case hides the person entirely: no case row (their earlier invalidated expiry case goes too,
   the existing "superseded case not listed" limit), no attention row, and `marketCaseProjection` returns
   `null`, which also empties the workspace's selected detail. 806 §6 names attention rows; I excluded the
   whole Profile case block because it would present one issuer's offer beside contest preferences.
6. **Consumers 806 does not name, left unchanged and flagged:** `bridge/world.ts` `personWorldRoute` still
   says "Renewal window open · decides Week D" with a `caseRef` to a market view that now shows nothing
   for that person; `bridge/contract.ts`'s `underMarketCase` renewal refusal says "against every
   competing proposal"; `bridge/promises.ts` `promiseRowsFor` lists the issuer's row; and the Industry
   Pulse fold (`bridge/industry.ts`), read but not run, should print a settled extension as "re-signs
   with …, Settled contract case: 1.1153846153846154 years", because `contractTermLabel(58)` divides by
   52.
7. **Discovery's "player contract or P12 interval".** I scan `hollywood.employment` only: the P12 mirror
   carries player contracts (806 §8.2; 808 finding 2), and the case needs a row id. A player contract with
   no mirror row would get no case; `recordPlayerEmployment` mirrors every commit in a world with an
   industry.
8. **"Announced at its openedWeek".** Checked as `announcedWeek <= openedWeek < E_original`, not the
   stronger `openedWeek === E_original − 12`.
9. **`extensionUsed === false`, literally.** A record that lacks the key (only hand-built test states; live
   loads migrate) never opens an extension, and `makeSave` then refuses that state. The C.4 precedent threw
   at the point of need; that would add failures to C.2a/C.4 tests that tick V35-shaped roots. One line in
   step 2b moves it to a throw if the parent prefers.
10. **A frozen conversion called a live opener.** `initialTalentMarket` became the live V36 opener, so
    `convertV27ToV28` now writes the V28 literal in the same key order (byte-identical output).
11. **`commitRetirementExtension` preconditions** (unspecified): it throws for no record, a non-announced
    record, a used extension, or `week > effectiveWeek`.

## 5. Commands (all on the tested diff above; final run 04:06:28 to 04:12:12)

| command | exit | runtime | result |
| --- | --- | --- | --- |
| `npm run typecheck` | 2 | 33 s | 27 error lines, all under `tests/`; 0 in `src/`. The script stops at its first `tsc`, so I ran its second half alone: |
| `./node_modules/.bin/tsc -p ui/tsconfig.json --noEmit` | 0 | 39 s | clean |
| `npm run typecheck:bridge` | 2 | 26 s | 10 error lines under `tests/`; 0 in `src/` or `bridge/` |
| `npm run check:bridge-contract` | 0 | 2 s | schema, C# DTOs and manifest verified |
| `npm run check:bridge-contract:fixtures` | 0 | 1 s | union fixtures verified |
| `git status --porcelain generated/` | 0 | <1 s | empty |
| each of the 96 `src/core` modules as the first import of a fresh `vite-node` | 0 | ~3 min | 96 loaded, 0 failed (the two new imports close cycles through `talentMarket.ts`); run before two comment-only edits in `careerLifecycle.ts` |

Test-side type errors (37): root, 27 in 19 files (`p14b4-material-evidence-core` 5; two each in
`p14b1-trust-chooser`, `p14b4-cast-class-policy`, `p14b5-relationships`, `p14c2a-save-and-settlement`; one
each in `contracts/cross-owner-refusal.contract`, `contracts/determinism-floor.contract`,
`contracts/phase-table-agreement.contract`, `helpers/p14c4-fixtures.ts`, `legacy-parcel-ground`,
`p14b1-first-take`, `p14b1-t4-regressions`, `p14b3-reservations`, `p14b3-rule-revision`,
`p14b4-save-v30-compatibility`, `p14b5-save-v31`, `p14bf2-acting-discipline`, `p14c4-save-v35`, `save`);
bridge, 10 in 5 files (`bridge-p14b4-cast-class` 4, `bridge-p06-checkpoint-recovery` 2,
`bridge-p14b5-relationships` 2, `bridge-p14b2-trust` 1, `bridge-p14b7-promise-waiver` 1). Kinds: `SaveFileV36`
meeting a `SaveFileV35` annotation (7); a `GameStateV35` state or root, or a hand-built state without the V36 keys, where `GameState` is required (21);
a hand-built `TalentMarketCase` without `variant` (8, four sites); one `RetirementRecord` literal without
the V36 keys. None is fixed here.

### Focused suites, one file each, `node_modules/.bin/vitest run <file> --minWorkers=1 --maxWorkers=1`

| file | exit | result | failures, class |
| --- | --- | --- | --- |
| `p14c2a-core-lifecycle` | 0 | 13 passed | none |
| `p14c2a-consumers` | 0 | 17 passed | none |
| `p14c2a-save-and-settlement` | 1 | 2 failed, 8 passed | (a) `LIVE_SAVE_VERSION` `toBe(35)`; (a) G5 hand-builds a record without the V36 keys and `makeSave` refuses it |
| `p14c4-cohorts` | 0 | 28 passed, 1 todo | none |
| `p14c4-save-v35` | 1 | 4 failed, 24 passed | (a) `toBe(35)`; (a) "makeSave stamps 35" on `c4LiveFixture`, which converts to V35 rather than `migrateToLive`; (a) ×2 D3: `liveEnvelope` wraps the ticked live state as V35, and V34's exact-key check refuses the new records' V36 keys before the downgrade question |
| `p14a1-*` (11 files) | 0 except save-v28 | 41 passed, 2 todo; save-v28 9/10 | (a) the "unknown version 36" sentinel is now a known version |
| `d11-employment` | 1 | 35/36 | (a) live-version literal |
| `bridge-p14a1-market` | 1 | 15/16 | (a) literal |
| `bridge-p14a2-market` | 1 | 12/16 | (a) ×4 literal |
| `p14b1-promises` | 1 | 14/15 | (a) `validateSaveV35` on `makeSave` output |
| `p14b1-trust-chooser` | 1 | 9 passed, 2 failed, 2 todo | pre-existing: the same two tests fail identically at HEAD |
| `bridge-p10a-r1-contract-quote` | 0 | 9 passed | none |

(a) = unswept test-side literal or root. No (b) behaviour failure appeared. Attribution: I extracted HEAD's
tree with `git archive` into the scratchpad and ran `p14a1-save-v28`, `d11-employment`, `bridge-p14a1-market`,
`bridge-p14a2-market`, `p14b1-promises`, `p14c2a-save-and-settlement` and `p14c4-save-v35` there; all seven
pass at HEAD. `p14b1-trust-chooser` fails at HEAD with the same two messages
(`expected 'compensation' to be 'opportunity'`; `search premise failed … within 220 weeks`).

### Scripted end-to-end check (scratchpad `e2e-c2b.mts`, `vite-node`, exit 0, 5 s)

On `genuine-v35-c2b-contract-gap-freeagent-expiry` (sha256 re-checked against 808): `migrateToLive` gives
V36 with every record unused and the one case `expiry`, and `convertV36ToV35` and `migrateToV35` export
byte-identical to the V35 input. No extension case exists at 91. At `E − 12 = 92` exactly one opens:
`{authored-0000, player, studio-d7df6c8e-player:contract:authored-0000:0:player-24, openedWeek 92,
variant 'retirementExtension'}`, decision week 98, and none opens for axis d's free agent. `extensionIssuer`
is the player and `marketEligibility` lists only the player. The bridge shows no row, no attention row and a
null case block. A rival issuer is refused with `retirementAnnounced`, a 52-week term with the
`retirementExtension` sentence ("must end at exactly week 156"), and `attachPromise` too. A 58-week quote
equals the 52-week quote (68,589). The player proposes 58 weeks at tier 1.1 at week 92, which charges no
bonus. **At 98: `effectiveWeek` 104 → 156 (+52), `extendedFromWeek` 104, `extensionUsed` true; one contract and
one employment row `[98, 156)`, term 58, annual 75,448 = round(ask × 1.1); one signing-bonus ledger row
(13,581); receipt reasons = the extension sentence.** `makeSave` validates; `convertV36ToV35`,
`migrateToV26` and `migrateToV20` refuse; a save/reload exports byte-identically. The validator refuses nine
mutations, each with its own message. A second `commitRetirementExtension` throws, no second case opens by
144, and at 157 the person is `retired` at 156 with no contract in force. Branches from week 92: tier 1.05
declines at 98 with the `belowRetirementReservation` sentence, and no offer expires at 98. Both retire at 104
with `extensionUsed` false.

### Probe (scratchpad `probe-rival.mts`, exit 0, 10 s)

The other two C.2b worlds export byte-identically through V35 → V36 → V35; the 50 cohort receipts of the
rival world survive unchanged. World 2 (`D = E = 150`): a 52-week player extension at tier 1.25 moves E to
202, and the person retires at 202. World 3, **no player action**: rival `studio-25969b11-r01` proposes at
2692 (the first window week) for 52 weeks at tier 1.1 with no promise; the case settles at 2704, E goes
2704 → 2756 with a rival row `[2704, 2756)`, and `makeSave` validates at 2705.

## 6. Open risks

1. **Blast radius.** Every industry world now extends announced employees whose employer holds them at
   `E − 12` and bids; rival rosters and later hires move from the first such week. The matched pass will
   measure it; the natural-world suites above (C.2a, C.4, P14A) did not move.
2. **Presentation of the non-catalogue term** (section 4, item 6): the Pulse label and the world route.
3. **V35-shaped roots tick silently** (section 4, item 9).
4. **The bridge proposal path accepts only catalogue terms**, so a player reaches an extension through the
   bridge only when `D = E` (52 weeks). The headless engine path is complete; the player surface is C.2-RM's.
5. **Validator cost.** Linear in cases plus records, plus one employment scan per used extension.

## 7. Next action

The test author sweeps `tests/` (section 5's 37 type errors, the fourteen class (a) suite failures and the
helpers `c4LiveFixture`, `liveEnvelope`, `syntheticRecord` and `withSyntheticCareerLifecycle`). The parent
runs the independent RED against this diff, then the matched pass. I have not run the RED.
