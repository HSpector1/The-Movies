# 780 — P14C.2b THE SINGLE FINAL EXTENSION: task expansion (DRAFT; review before RED; starts after C.2a closes)

Drafted by the parent at `6f7cbf06` while C.2a's RED and writer run. Authority: Owner direction 10
(OWNER-SELECTED: "the current employer receives exactly one opportunity to offer a one-year extension at
newly proposed compensation; the professional accepts or declines under the normal deterministic
person-choice framework; acceptance postpones retirement by exactly one year; there is no infinite chain
… after the extension boundary, retirement from that profession is final"); companion §6.2 "The one final
extension" and §2.1.7 reservation (IMPLEMENTATION RECOMMENDATION; the window width and the retirement
factor are NUMERICAL HYPOTHESES); 773 (C.2a).

## 1. Player behaviour

When a person the player employs has announced retirement and their contract runs into the last 12 weeks
before the effective week, the player gets exactly one chance to offer a one-year extension at a premium
tier the player chooses. The person accepts if the offer clears their retirement-adjusted reservation;
acceptance moves their retirement one year later and can never happen twice. Declining, or making no
offer, leaves the date alone. A rival employer gets the same single chance under its own policy.

## 2. The companion's gap, found on paper, and the delegated reading

The companion writes the extension as `termWeeks = 52, startWeek = E`, "the contract in force ends there and
the extension begins there, with no gap and no overlap". That holds only when the contract in force ends
AT `E`, which under 773 D5 happens only when it outlived `A + 52`. When it ends earlier (`end < E = A + 52`)
the person is either a free agent in the window (companion: no employer, no offer) or still employed at
`E − 12` with a contract ending inside the window. For the second case the literal draft leaves a gap
`[end, E)`, and the ordinary renewal cannot close it because D7 caps any renewal at `E`.

**Delegated reading (flagged for review, alternatives below):** the extension case opens at `E − 12` iff the
person holds a contract or P12 interval in force at `E − 12`; its sole proposer is that employer; its
decision week is that contract's `endWeekExclusive` (`≤ E`); the draft starts there and ends at exactly
`E + 52` (term `E + 52 − end`, between 52 and 63 weeks). No gap, no overlap, and "one year" of extra career
exactly as direction 10 measures it (the effective week moves by 52). Alternatives: (b) literal `[E, E + 52)`
with the gap disclosed; (c) no offer unless `end === E`. (c) contradicts direction 10's "the current
employer receives exactly one opportunity" for a common case; (b) leaves the person unemployable for the
gap because of D7.

## 3. Decisions

| # | item | class | rule |
| --- | --- | --- | --- |
| X1 | window | PROVISIONAL TUNING (companion hypothesis = renewal window width) | opens at `E − 12` |
| X2 | eligibility | DELEGATED (§2) | record `announced`, `extensionUsed === false`, a contract or interval in force at `E − 12` |
| X3 | the case | companion §6.2 | a market case variant `retirementExtension`: discovered publicly, proposable by exactly one `StudioId`, invalidated if the employment ends early; the ordinary expiry case never opens for an announced person (C.2a D8) |
| X4 | the draft | companion §6.2 + §2 reading | one proposal at the employer's chosen premium tier, priced by the existing studio-aware entry; the signing bonus is due at settlement, never at submission |
| X5 | the choice | OWNER-SELECTED single-proposal rule (§2.1.7) | accepted iff it clears reservation with the retirement factor `ask × 1.10` (PROVISIONAL TUNING), plus the live P14B trust/relationship refusals; typed descriptor reasons |
| X6 | acceptance | OWNER-SELECTED | the new contract/interval commits through the existing P10/P12 primitives; `effectiveWeek += 52`; `extensionUsed = true`; D7's cap then applies to the new `E` with NO further exception |
| X7 | decline / no offer | OWNER-SELECTED | nothing changes; retirement at `E` as in C.2a |
| X8 | rival policy | PROVISIONAL (the rival's policy numbers are open, as in P14A) | at its decision cadence, the incumbent rival offers iff the bonus clears its operating reserve, at the lowest premium tier that clears the retirement factor |
| X9 | settlement order | DELEGATED | the extension decision must precede retirement settlement in the same week: C.2b splits the lifecycle step into intent (before the market, as C.2a) and settlement (after the market) |
| X10 | save | DELEGATED | V35: `RetirementRecord` gains `extensionUsed: boolean`, `extendedFromWeek: number \| null`; `TalentMarketCase` gains `variant: 'expiry' \| 'retirementExtension'` (every migrated case `expiry`). Downgrade lossless iff no extension case and no `extensionUsed` |
| X11 | wire | DELEGATED | projection unchanged if the market page filters `retirementExtension` cases out; otherwise a projection step. Decide by reading `bridge/market.ts` and `bridge/people.ts` at the time |

## 4. Tests to require (sketch)

Window opens exactly at `E − 12`; exactly one proposer; any other issuer refused; a second extension
refused after one acceptance (no chain); decline leaves `E`; acceptance moves `E` by exactly 52, contract ends
exactly at the new `E`, no gap and no overlap with the old one; free agent in the window gets no case;
reservation boundary at `ask × 1.10` (equality accepted); bonus charged once at settlement; the extended year
obeys D7/D9 and can end in `finishing_commitments`; rival incumbent under the same law through the natural
tick route; save V35 migration of the C.2a V34 corpus; replay determinism.

## 5. Amendments after 780-A (parent decisions; the draft is RED-ready only with these)

1. **The single carve-out (X2/X4).** One exported lifecycle predicate `extensionIssuer(state, personId, week)`
   returns the incumbent `StudioId` iff an OPEN `retirementExtension` case exists for that person, else `null`.
   `marketEligibility` for an announced person returns `proposers: [extensionIssuer]` (or `[]`); `submitProposal`'s
   record refusal admits exactly that issuer on exactly that case and refuses everyone else with the existing
   token; the proposal's term must end at exactly `E + 52` (anything else refused, typed).
   `bridge/contract.ts:405` needs no edit: it already reads `marketEligibility`.
2. **The write-back owner (X6/X9).** The market settles the extension case through the existing commit
   primitives, then calls ONE lifecycle-owned function `commitRetirementExtension(state, personId, week)`
   (in `careerLifecycle.ts`) that sets `effectiveWeek += 52`, `extensionUsed = true`,
   `extendedFromWeek = old E`, inside the same settlement step, before anything else reads the record. Tick
   order becomes: promises → lifecycle INTENT → market (including extension settlement) → lifecycle
   SETTLEMENT. C.2a's same-week invalidation and discovery skip are unaffected (they read intent).
3. **Presentation (X11), decided:** C.2b adds NO read model and keeps projection 50. Every existing
   case-listing consumer (`bridge/market.ts`, `bridge/people.ts` attention rows, the chooser's sentences)
   EXCLUDES `retirementExtension` cases, so nothing mis-presents a one-issuer offer as a contest; the player's
   surface is C.2-RM's. The engine command path is complete and tested headlessly. Recorded in the Unity
   backlog as a C.2-RM deliverable.
4. **Validator (X10).** A `retirementExtension` case's subject holds an `announced` record; at most one per
   person ever; `extensionUsed` iff exactly one SETTLED extension case whose commit starts at the old E;
   `extendedFromWeek === effectiveWeek − 52` when used.
5. **Tests added to §4:** every issuer except the live extension issuer refused, AND that issuer refused
   outside the window and after the case closes; the write-back happens once, same week, before settlement;
   extension cases absent from every existing bridge listing.

## 6. Consequences of C.4 landing first (parent, 2026-09-26, before C.2b T0)

1. **The save step is V36, not V35.** C.4 took V35 (record 793). X10's `RetirementRecord` fields
   (`extensionUsed`, `extendedFromWeek`) and `TalentMarketCase.variant` form V36. The downgrade is lossless iff no
   extension case and no `extensionUsed`. The V36 validator must keep C.4's receipt re-derivation intact: an
   extension moves `effectiveWeek`, never `retiredWeek`, and the cohort request counts only `retired` records.
2. **X9's split carries the cohort with SETTLEMENT.** The tick becomes promises → lifecycle INTENT → market
   (including extension settlement) → lifecycle SETTLEMENT → COHORT. Moving the cohort after the market is
   behaviour-neutral for C.4's request, on paper: the market signs and settles but appends no talent and writes
   no retirement record, so `active_p`, `young_p` and `talentCountBefore` are unchanged. The C.4 suites
   (`tests/p14c4-*`) and the demonstration harness are the check, and they must stay green unmodified.
3. **T0 for C.2b mints genuine V35 worlds at the FINAL C.4 writer** (after the C.4 checkpoint), holding:
   (a) an announced player employee whose contract ends inside `[E − 12, E)`; (b) one whose contract ends
   exactly at `E`; (c) an announced rival employee over the same window (rival incumbent); (d) an announced free
   agent (no extension case may open); (e) an open ordinary `expiry` case, to pin the V36 `variant` migration;
   (f) a world with cohort receipts, so V35 → V36 preserves them byte for byte.
