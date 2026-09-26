# 806 — P14C.2b API contract: the single final extension (DRAFT; the RED and the sole writer work from it once final)

Derived from 780 (decisions X1–X11) as amended by §5 (after 780-A) and §6 (after C.4). Behaviour is 780's.
This record fixes names, shapes, order and placement, and adds decisions the source reading forced (§7). The
parent ships a throwing SCAFFOLD after the T0 corpus (genuine V35 worlds, 780 §6.3) is published.

## 1. Tuning (PROVISIONAL)

`RETIREMENT_EXTENSION_WINDOW_WEEKS: 12` (X1; equals `HIRING_RENEWAL_WINDOW_WEEKS`), and
`RETIREMENT_EXTENSION_RESERVATION_FACTOR: 1.10` (X5). `RETIREMENT_EXTENSION_WEEKS` is `RETIREMENT_NOTICE_WEEKS`
(52), not a new constant.

## 2. Types and save V36

- `RetirementRecordV36 = RetirementRecord & { extensionUsed: boolean; extendedFromWeek: number | null }`.
- `TalentMarketCaseV36 = TalentMarketCase & { variant: 'expiry' | 'retirementExtension' }`.
- `GameStateV36` carries both, plus C.4's cohorts unchanged. `LIVE_SAVE_VERSION = 36`.
- `convertV35ToV36`: every record gains `extensionUsed: false, extendedFromWeek: null`; every case gains
  `variant: 'expiry'`. `convertV36ToV35` is lossless iff no record has `extensionUsed` and no case is a
  `retirementExtension`; otherwise it is refused as a downgrade before envelope validation.
- `validateSaveV36` checks exact keys, then: a `retirementExtension` case's subject holds a record that was
  `announced` at its `openedWeek`; at most one extension case per person ever; `extensionUsed` iff exactly one
  SETTLED extension case for that person; when used, `extendedFromWeek === effectiveWeek − 52` and the
  settled contract ends at exactly `effectiveWeek`. It then strips the two record fields and `variant`, hands
  V35 the rest, and C.4's receipt re-derivation runs unchanged (an extension moves `effectiveWeek`, never
  `retiredWeek`).

## 3. Tick order (780 X9 as amended by §5.2 and §6.2)

`advanceCareerLifecycleWeek(state, birthdays)` splits into `advanceLifecycleIntent(state, birthdays)` and
`advanceLifecycleSettlement(state)`, where settlement includes C.4's cohort. The tick tail becomes
`advanceLifecycleSettlement(advanceTalentMarketWeek(advanceLifecycleIntent(advancePromisesWeek(withBonds), birthdays)))`.
`advanceCareerLifecycleWeek` stays exported as intent → settlement, so every C.2a/C.4 test that calls it
directly keeps its meaning: intent writes only `effectiveWeek >= w + 52` and settlement reads only
`effectiveWeek <= w`, so the two orders are equivalent. The C.2a and C.4 suites are the check and must pass
unmodified.

## 4. Discovery, eligibility and proposals (the single carve-out, 780 §5.1)

- Discovery (market step 2): at week `w`, for each record with `status === 'announced'`, `extensionUsed === false`
  and `w === effectiveWeek − 12`, if a player contract or P12 interval of the person is in force at `w`, open ONE
  case `{variant: 'retirementExtension', subjectStudioId: that employer, contractId: that employment row}`.
  Dedupe is on `(contractId, variant)`: C.2a invalidated the row's `expiry` case at announcement, and that must
  not block this one.
- `extensionIssuer(state, personId, week): StudioId | null` (in `careerLifecycle.ts`) returns the subject studio of
  that person's OPEN extension case, else `null`.
- `marketEligibility` for an announced person returns `{status: 'retirement_announced', proposers: issuer ? [issuer] : []}`.
- `submitProposal`: for an announced person, only `extensionIssuer`, on that open case. The term must satisfy
  `decisionWeek + termWeeks === effectiveWeek + 52`, else a typed refusal carrying `retirementExtension`. Pricing
  goes through the existing `studioOffer` → `offerForTalent`, which already accepts any term in [52, 208].
- **No promise on an extension proposal** (§7.1): `attachPromise` refuses on a `retirementExtension` case, and
  `authorRivalPromise` skips it.

## 5. The choice, the commit and the write-back

- Settlement (market step 4) at the decision week, which is the employment row's `endWeekExclusive` and at most
  `E`. There is one proposal at most. It runs through the EXISTING `survivesFreeze`
  (`talentMarket.ts:1110-1150`) with exactly two variant-specific changes:
  (a) the C.2a cap check (`contractEndRefusal(…, week + termWeeks)`, which drops as `retirementCap`) ADMITS the
  proposal iff the case is the live `retirementExtension` case, the issuer is `extensionIssuer`, and
  `week + termWeeks === effectiveWeek + 52`. Every other proposal meets the cap unchanged.
  (b) after `belowAsk`, a new typed drop `belowRetirementReservation` applies when the re-derived annual is below
  `askAnnual × 1.10` (equality accepts), with its own `DROP_SENTENCE` entry.
  Trust, Nemeses, seat budget, start week and material terms apply unchanged.
- Accept, in this order inside the one settlement call:
  1. `commitRetirementExtension(state, personId, week)` (in `careerLifecycle.ts`, the only writer of the record
     fields) sets `extendedFromWeek = effectiveWeek`, `effectiveWeek += 52` and `extensionUsed = true`;
  2. the existing `commitPlayerWinner` / `commitRivalWinner` commit the contract from the decision week to
     exactly the NEW `effectiveWeek`, so every cap reader inside the commit sees the moved week;
  3. the case closes `settled`.
  A throw anywhere in this sequence fails the tick (no partial write-back). Lifecycle settlement runs after the
  market that week and finds the record no longer due.
- Decline, no proposal or tie: the case closes `declined` / `expired` with the existing sentences. The record is
  unchanged, and the person retires at `E` through lifecycle settlement.
- Invalidation: an employment released early invalidates the case (the existing `releasedEarly` path).
- The rival incumbent (X8): at its decision cadence, it proposes iff the signing bonus clears its operating reserve,
  at the LOWEST `MARKET_PREMIUM_TIERS` entry whose price clears `ask × 1.10`, or does not propose when none does.

## 6. Consumers and presentation (780 §5.3)

`bridge/market.ts` case rows, `bridge/people.ts` attention rows and the chooser's single-survivor sentence all
EXCLUDE `retirementExtension` cases. Projection 50 stays; the writer measures `generated/`. The player's surface
is C.2-RM's (Unity backlog).

## 7. Decisions forced by the source reading (parent, DELEGATED)

1. **No promise rides an extension.** Promises × retirement is the open Owner question that only C.2c waits on
   (773 §7). Letting `authorRivalPromise` attach one here would decide that question by default.
2. **Discovery dedupe widens to `(contractId, variant)`.** It is `contractId` only today (`talentMarket.ts`,
   step 2), and the invalidated expiry case already names the same row.
3. **The extension term is priced as-is.** `offerForTalent` clamps any term to [52, 208] and a 52–63-week term
   passes through, so no new pricing path is needed.
4. **The cap check at freeze admits exactly the live extension (§5a), and the record moves BEFORE the contract
   commit (§5).** Found by reading `survivesFreeze`: as drafted, 780 §5.2's commit-then-write-back order would have
   had the C.2a cap drop every extension as `retirementCap`. This AMENDS 780 §5.2's order.

## 8. Amendments after review 806-A (REFINE), parent decisions; the contract is RED-ready with these

1. **The rival extension site is named** (806-A defect 1). The rival-trigger loop (`talentMarket.ts:1296-1312`)
   hard-codes `termWeeks: HOLLYWOOD_CONTRACT_WEEKS` (208) and then calls `authorRivalPromise`. For a
   `retirementExtension` case, only the subject studio evaluates. Its term is `effectiveWeek + 52 − decisionWeek`,
   its tier is the lowest `MARKET_PREMIUM_TIERS` entry ≥ 1.10 (1.1 under today's tuning; if none exists, no
   proposal is made), and reserve affordability is the existing `submitProposal` check. It never attaches a
   promise, and `rivalProposalTrigger` is not consulted, since X8 is the policy.
2. **The V36 validator finds the extension contract by its terms, not by `case.contractId`** (806-A defect 2).
   The case names the pre-extension row. The extension contract is the `hollywood.employment` row (the P12 mirror
   carries player contracts too, and `state.contracts` drops expired ones) whose `terms.talentId` is the person,
   `terms.startWeek` is the settled case's `closedWeek`, and `terms.endWeekExclusive` is the new `effectiveWeek`.
   Exactly one such row must exist when `extensionUsed`.
3. **`submitProposal`'s early refusal is narrowed, not bypassed** (806-A defect 3). The throw at
   `talentMarket.ts:415-416` stays for every record except: `status === 'announced'`, the issuer is
   `extensionIssuer(state, id, week)`, and the open case is that person's `retirementExtension` case.
4. **`attachPromise` refuses on an extension case** (806-A defect 4), reading the beneficiary's open case
   through one exported helper `openMarketCaseFor(state, talentId)` in `talentMarket.ts`.
5. **The pricing cliff is removed** (806-A defect 5). `offerForTalent` reads `CONTRACT_LENGTH_FACTOR[term] ?? 1.0`,
   so terms 53–63 would price about 7% below 52 (1.0 against 1.08). The factor lookup becomes the factor of the
   LARGEST catalogue term ≤ `term`, so a 52–63-week extension prices as a one-year contract, which is what Owner
   direction 10 names. The parent EXPECTS (unverified) that every existing caller prices a catalogue term, so that
   nothing changes for them. The writer must prove it by grep, and the matched pass must show unchanged goldens.
