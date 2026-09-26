# 773 — P14C.2 RETIREMENT: task expansion (draft; bounded review before RED)

Source `f3652852` (= remote tip at entry, 2026-09-25 17:3x CEST). Coordinator: Claude Opus 5.5 session
under the Owner packet `OPUS-C2-TO-CODEX-LAUNCH` (01-EXECUTE-IN-OPUS.txt). Authority read for this
record: companion §2.1.2, §4.4, §6.2, §6.3, §6.5, §6.6, §7.2 R14/R19/R22; Owner rulings §3.4.1
directions 6, 7, 9, 10, 11, 14; NEXT772 in `plans/P14-HEADLESS-PLAN.md`; record 772.

## 1. Slices

C.2 is too large for one honest checkpoint. It splits by dependency:

| slice | player behaviour | depends on |
| --- | --- | --- |
| **C.2a** (this record) | people announce retirement with notice, finish binding work, and retire as alumni; nothing binds them past the effective week; player and rival alike | C.1 |
| C.2b | the employer's single one-year extension offer (Owner direction 10) | C.2a |
| C.2c | retirement × promises: feasibility's retirement-boundary input (direction 6) and the promise disposition | C.2a + the Owner ruling in §7 |
| C.2-RM | profile planning fact, announcement on roster / calendar / market attention, alumni summary (bridge projection) | C.2a |

Profession transitions (§6.3, direction 11) and replenishment (§6.5) follow as C.3 and C.4. Record 772's D1
acceptance criterion (mature campaigns keep meaningful access to younger talent) is C.4's
demonstration, not C.2's.

## 2. C.2a player behaviour and completion condition

A professional who reaches their profession's retirement window idle, or its hard boundary at all,
announces retirement at a birthday. The announcement fixes an effective week at least a year out.
From then no contract, renewal, proposal or market case binds them past that week, and no new
production seat is assigned that cannot release before it. At the effective week they retire from
the profession, unless they still hold a seat. A seated person finishes the picture first and
retires the first week the seat clears. Retirement deletes nothing: `PersonId`, the talent row,
provenance, credits, career events, employment intervals, promises and relationships all stay.
Rival employees follow the same law.

**Complete when:** the requirement map in §6 is GREEN on an independently written RED, the V34 save
round-trips and migrates the T0 corpus, the matched full pass attributes every changed result, and
an independent review keeps the stable diff.

## 3. Decisions, each with its class

| # | item | class | rule |
| --- | --- | --- | --- |
| D1 | windows `[start, hard)` | PROVISIONAL TUNING (companion §6.2 hypothesis) | actor 60/70; director 65/75; writer 65/75; craft 62/72 |
| D2 | Scientists | OWNER: include via the all-profession direction; do NOT invent tuning | structural participant (predicate, record shape, symmetric law). NO window, so no Scientist announces until tuned. Open tuning item, recommendation: the craft window |
| D3 | intent rule v1 | DELEGATED IMPLEMENTATION + PROVISIONAL TUNING | evaluated ONLY for people whose age materialized this week (the C.1 due bucket, never a scan). age ≥ hard → announce, cause `hardBoundary`. start ≤ age < hard → announce, cause `idleInWindow`, iff IDLE: no P12 employment interval (player or rival) and no player contract overlapping `[w − 104, w]`, no seat at `w` (`busyTalentIds`), and the person's provenance anchor week ≤ `w − 104` |
| D3a | why the anchor clause | DELEGATED | "no recorded work" is not "no recent work" while the record is younger than the recency horizon. Without it every free agent of a fresh world inside a window would retire at their first birthday for lack of history. The anchor span is also the only tenure fact that exists (no career-start fact is persisted). Tenure is otherwise NOT an input in v1, recorded |
| D4 | horizon | PROVISIONAL TUNING | 52 weeks |
| D5 | effective week | IMPLEMENTATION RECOMMENDATION (companion §6.2, as written) | `E = max(A + 52, endWeekExclusive of the contract or P12 interval in force at A)` |
| D6 | engagement | DELEGATED IMPLEMENTATION | lifecycle engages iff `hollywood !== null`, the market's own gate. The null-hollywood corpus keeps only C.1 aging |
| D7 | term cap | OWNER-SELECTED no-chain (direction 10), realized by the companion §6.2 recommendation | every contract writer refuses `endWeekExclusive > E` with a typed reason and NO mutation: `signContract`, `renewContract`, `submitProposal`/draft, market commit, `staff()` renewal AND fresh hire, `enterRival`'s pick |
| D8 | market | IMPLEMENTATION RECOMMENDATION (companion §2.1.2 / §6.2) | `marketEligibility` returns `retirement_announced`, `finishing_commitments`, `retired_or_ineligible`, each with `proposers: []` (the extension's single issuer is C.2b). An open case is invalidated AT the announcement week with a typed reason; discovery opens no case for an announced person |
| D9 | obligations first | OWNER-SELECTED obligations-first (direction 10), realized by the §6.2 recommendation | a player greenlight and a rival `decide()` refuse an announced person when `week + PRODUCTION_TICKS + 1 > E`; finishing and retired people are refused outright |
| D10 | settlement | DELEGATED READING of the §6.2 recommendation (see §9 item 6) | at `E`: busy (`busyTalentIds`) → `finishing_commitments`; else `retired`. From finishing: `retired` the first week not busy. The lifecycle NEVER ends a contract: D7 guarantees every contract ends ≤ E, so the existing P10 expiry (tick step 8) and P12 `finishHollywoodWeek` write the ends and their `expiry` receipts. Settlement ASSERTS no contract or interval is active past `E` and fails loud if one is |
| D11 | the P10 predicate | IMPLEMENTATION RECOMMENDATION (companion §6.2) | one exported `lifecycleStatus(state, personId, week)`; `signableUniverse`, the free-agent loop of `hiringMarketIds`, `freelancerMarketIds`, `assignableForFilm`, `staff()` and `enterRival` consult it |
| D12 | preservation | OWNER-SELECTED (direction 10) | `state.talent` is never shortened or reordered; nothing else is deleted |
| D13 | migration V33 → V34 | companion §6.6 hypothesis, realized as a DELEGATED choice | the root opens EMPTY with `boundaryWeek = market.tick`. No record is written at migration and none is dated before the boundary. A person already past a hard boundary announces at their next birthday under D3, so `E ≥ migration + 52`: the full announcement horizon from the migration week, as the hypothesis requires, with no invented event |
| D14 | downgrade V34 → V33 | the C.1 D2 support pattern | lossless iff the root holds no record; refused as a DOWNGRADE otherwise |
| D15 | promises | HELD for the Owner (§7) | C.2a adds NO retirement promise outcome and does not touch `promises.ts`. Interim: ordinary law. Reach measured in §5 trap 7 |
| D16 | wire | DELEGATED IMPLEMENTATION | projection 50 UNCHANGED, no C# regeneration. Read models are C.2-RM, recorded in the Unity backlog |

### The V34 root (top level, beside `talentProvenance`, R22)

```ts
type RetirementRecord = {
  personId: string
  profession: CreativeRole          // Talent.role at announcement
  intentRulesVersion: 1
  cause: 'hardBoundary' | 'idleInWindow'
  announcedWeek: number
  ageAtAnnouncement: number         // the materialized integer age
  effectiveWeek: number
  status: 'announced' | 'finishing_commitments' | 'retired'
  finishingFromWeek: number | null  // === effectiveWeek when it passed through finishing
  retiredWeek: number | null
}
type CareerLifecycleRoot = { boundaryWeek: number; records: readonly RetirementRecord[] }
```

At most one record per person in V34 (transitions are C.3's save step). Records append in announcement
order. The validator cross-checks `ageAtAnnouncement === ageAt(provenanceRow, announcedWeek)`, the cause
against D1, `E ≥ A + 52`, the status against the weeks, and the cap: no contract or interval of that
person active at any week ≥ `announcedWeek` ends after `E`.

### Tick placement

Birthdays are captured from the provenance root BEFORE `materializeAges` consumes the due buckets
(one exported helper in `aging.ts`). The lifecycle step runs on the incremented week after
`finishHollywoodWeek`, the first-take append, relationships and `advancePromisesWeek`, and BEFORE
`advanceTalentMarketWeek`, so the market meets the announcement the week it happens. It draws no RNG.

## 4. What exists today, verified at `f3652852`

- `MarketEligibilityStatus` already declares the three P14C rows, unreachable (`talentMarket.ts:74-77`).
- Contract writers: `actions.ts:2484` sign, `:2556` renew; `talentMarket.ts:327` draft, `:955`/`:996`
  commits; `hollywoodTick.ts:110` renewal loop, `:147` fresh hire; `hollywood.ts:241` rival entry.
- `hiringMarketIds` lists `state.freeAgents` BEFORE and OUTSIDE `signableUniverse` (`employment.ts:397`).
- Every promise due week lies inside its proposed contract (`promises.ts:415`, "the due week falls
  outside the proposed contract").
- `busyTalentIds` (`employment.ts:162`) is the one availability set: player seats, writing
  assignments, rival seats and drafting, active research seats.
- Materialization runs at the tick tail on `currentTick + 1` (`tick.ts:1047-1049`).

## 5. Traps, named before the writer meets them

1. **The fixed 208-week rival law.** `staff()`'s fresh hire (`person ??= next.find(...)`) and `enterRival`
   would sign an announced free agent for 208 weeks past `E`. Both must skip them.
2. **`hiringMarketIds` reads `state.freeAgents` first**, outside `signableUniverse`. A retired person
   sits in `freeAgents` after their contract expired. Filter there too.
3. **Due buckets are consumed by materialization.** Capture the birthdays first.
4. **Order inside the tick.** After expiry and `finishHollywoodWeek`, before the market step.
5. **`state.talent` is append-only and order-load-bearing.** Never filter it.
6. **The ENUMERATED ROOT-STRIP LISTS** (NEXT772): `save.ts` (chained), `src/harness/roster-wall/historical-control.ts`,
   `tests/contracts/_v14Contract.ts`, `tests/p13b-r07-save-v25.test.ts`, `tests/facility-move-demolish.test.ts`.
   Each must GROW by the new root. A value-keyed sweep does not find them.
7. **Promise reach, held open.** Due weeks sit inside their contract and `E` is never before the end of
   the contract in force, so retirement never truncates a window by the term cap. It truncates one only
   through D9: greenlights with `g + 9 > E` are refused, so the last weeks before `E` stop producing first
   takes. A promise needing exactly those weeks now misses and goes BROKEN at its due week under
   ordinary law. That residual is the Owner question; C.2c resolves it, and the verification must
   report any test where it occurs.
8. **Idle reads intervals, never `employmentStatus`**, which says `unavailable` for two different facts.

## 6. Requirements → tests (C.2a)

| id | requirement | test |
| --- | --- | --- |
| A1 | hard boundary forces the announcement at the birthday due week, never the week before | actor authored at 69.x crosses 70: no record at `w−1`, record at `w`, cause `hardBoundary` |
| A2 | idle in-window announces; employed or seated does not; record span < 104 does not | three people at the same birthday, one per branch |
| A3 | `E = max(A + 52, end in force)` | player contract ending before and after `A + 52`; one rival interval |
| A4 | Scientists never announce | scientist aged past every window |
| A5 | one record per person; later birthdays change nothing | tick past a second birthday |
| A6 | deterministic, no RNG, idempotent | same input → byte-equal output; `rngState` unmoved by the lifecycle step |
| A7 | null hollywood → no record ever | bare world ticked past a boundary |
| B1 | `renewContract` refused past `E`, typed, no mutation; allowed ending exactly at `E` | byte-equal state on refusal |
| B2 | `signContract` likewise | |
| B3 | `submitProposal` refused; `marketEligibility` → `retirement_announced`, `proposers: []` | |
| B4 | a rival neither renews nor hires an announced person | natural route through `tick` |
| B5 | `enterRival` skips announced, finishing and retired people | scheduled entry |
| C1 | an open case is invalidated at the announcement week with a typed receipt; its proposals dropped | |
| C2 | no case opens for an announced person entering the renewal window | |
| C3 | eligibility rows for finishing and retired | |
| D1 | player greenlight refuses when `g + 9 > E`, allows at equality, typed, no mutation | |
| D2 | a rival does not cast an announced employee past the cap | natural route |
| E1 | not busy at `E` → `retired` at `E`; the contract ended through the existing owners with an `expiry` receipt; talent length and every history row unchanged | |
| E2 | seated at `E` → `finishing_commitments`; still seated; new work refused; `retired` the first week the seat clears, never earlier | a player picture held unreleased |
| E3 | a retired person is absent from both markets and `freeAgents` listings, not assignable, not signable | |
| F1 | a rival employee meets the same announcement, `E` and settlement law | |
| G1 | V34 `makeSave` round trip byte-stable with records in every status | |
| G2 | every T0 V33 fixture migrates: empty root, `boundaryWeek = tick`; a past-boundary person announces at the next birthday with `E ≥ migration + 52` | T0 corpus |
| G3 | V34 → V33 lossless iff no record; refused as a downgrade otherwise | |
| G4 | validator refusals: before boundary, age disagreeing with provenance, `E < A + 52`, unknown or duplicate person, a contract past `E`, status/week disagreement, a Scientist record, wrong cause | one mutation per refusal |
| G5 | replay: save/load mid-notice then continue = the continuous run, byte-equal | |
| W1 | a finishing or retired writer is refused every writing verb by the existing gate; an announced contracted writer may be commissioned, and a draft running past `E` holds them in `finishing_commitments` until it completes (§9 item 1) | player commission across `E` |
| P1 | every open promise to an announced person, player- or rival-authored, has `dueWeekExclusive ≤ E` | invariant asserted on the natural routes (§9 item 4) |

## 7. The one Owner question (sent 2026-09-25, not guessed)

Retirement × an open promise: VOIDED or WAIVED. **Recommended A:** at announcement, an open promise the
announced effective week makes impossible is VOIDED automatically; otherwise ordinary law applies and
retirement is an acceptance ground for a studio-proposed waiver. **B:** never automatic; waiver or BROKEN.
Approval sentence for A: *"Approved: retirement VOIDs an open promise automatically at announcement only
when the announced effective week makes it impossible; otherwise ordinary law applies and retirement is a
waiver-acceptance ground."* Only C.2c depends on it.

## 8. Order of work

T0 (measure the C.2 axes by probe, then mint genuine outgoing V33 worlds at `f3652852`'s writer) →
bounded contract review of this record → independent RED (test-author) → sole production writer
(sim-core; src/bridge/ui/scripts side of the V34 sweep) with the test author owning `tests/`'s sweep
lines → focused runs → independent source review of the stable diff → one matched full pass →
attribution → publication.

## 9. Amendment log (record 773-A, verified by the parent against the code before adoption)

1. **Writing assignments — ADOPTED as a stated rule, no new refusal.** Verified: every player writing
   verb goes through `requireCommissionableWriter` (`actions.ts:1932`; callers `:1980`, `:2063`, `:2162`),
   which refuses a writer without a CURRENT contract or with an active assignment
   (`productionAdmission.ts:~250-285`). A finishing or retired person holds no contract after `E` (D7), so
   both are refused by the existing gate; the RED asserts it. An ANNOUNCED writer still under contract may
   take a new writing assignment: the companion names a release-date refusal only for production seats,
   and a draft that runs past `E` holds the writer in `finishing_commitments` until it completes, which
   the draft length bounds. The rival commission in `decide()` picks from current employees only, so the
   same holds. Recorded as an interpretation of §6.2, not new policy; C.2-RM discloses it.
2. **eventId — DECLINED, with the reason.** In V34 a record's identity is its `personId`: the validator
   allows one record per person, and nothing cites an announcement yet. C.2c's VOIDED outcome writes its
   own `promiseOutcome` market receipt (the B.1 pattern), and C.2-RM reads by person. C.3 transitions make
   the key `(personId, profession)`; that is C.3's save step and it must amend the one-record rule
   explicitly. An id with no reader is a field to validate and nothing else.
3. **`recruitScientist` — ADOPTED as a note.** `actions.ts:2857` signs through `applySignContract`, so it
   inherits the cap. No Scientist announces (D2), so the cap never binds there in C.2a.
4. **Rival promises — the audit's premise is WRONG and the conclusion stands anyway.** Rival-authored
   promises exist: `authorRivalPromise` (`talentMarket.ts:1315`) attaches through the same `attachPromise`
   with the window `[proposal.startWeek, startWeek + termWeeks)`. After an announcement no case opens
   and no proposal is accepted (D8), so no new promise of either issuer can reach an announced person;
   a promise attached before it rode a contract that ends ≤ `E`. ADOPTED anyway as a test: the natural
   routes assert the invariant "every open promise to an announced person has `dueWeekExclusive ≤ E`".
5. **Class column — ADOPTED** (§3 rows now name their class).
6. **D10 — ADOPTED as an explicit delegated reading.** §6.2's settlement write-set names "P10 contract
   end and assignment clearance receipt". Under D7 no contract can outlive `E`, so the contract's end at
   or before `E` IS written, by the existing P10 expiry and P12 `finishHollywoodWeek` with their `expiry`
   receipts. A second ending write at `E` would duplicate an end the owners already recorded. The
   lifecycle asserts no contract or interval is active at retirement and throws if one is.

## 10. Owner rulings (2026-09-26 11:36 CEST, given in the coordinator session after the C.2b checkpoint)

1. **Retirement × open promise (§7).** The Owner's words, verbatim: *"void the promise if they retire"*. This
   selects automatic VOIDED (no trust penalty) over option B ("never automatic; waiver or BROKEN"). The
   parent reads it as approving option A's substance: VOIDED when retirement prevents fulfilment, while a
   promise that can still be kept stays under ordinary law, and a terminal outcome (KEPT, BROKEN, WAIVED) never
   changes. The Owner did not give §7's approval sentence word for word. The C.2c expansion must state the exact
   trigger week (at announcement when the effective week makes the promise impossible, as option A words it, or
   at the effective week) and cite these words. C.2c no longer waits on the Owner.
2. **Scientist retirement (D2).** The Owner's words, verbatim: *"scientists should retire your ruling made sense
   to me"*, approving D2's recommendation: the craft window, eligible from 62 with the hard boundary at 72, as
   PROVISIONAL TUNING. Under the existing C.2a law the hard boundary forces an ANNOUNCEMENT, not a removal:
   notice, obligations first, the effective week, and C.2b's single final extension all apply. Open for the
   slice that implements it (the parent's note, not a ruling): C.4 refills only the four film professions, so
   retiring Scientists are not replaced; whether Scientist supply needs its own replenishment must be measured,
   and the affected Scientist tests and validators reconciled, not a number added to a table.

