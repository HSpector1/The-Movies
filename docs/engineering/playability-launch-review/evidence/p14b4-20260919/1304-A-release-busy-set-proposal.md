# 1304-A: R2 busy-set release refusal (player), a Core requirement never implemented

Parent proposal, source-only. It closes a selected P14A.1 Core requirement that shipped untested and unimplemented.
No project code, compiler or test ran to produce it.

## The requirement and the gap

The P14 preparation companion §3.4 ("Refusal (recommendation R2)") keeps the screenplay-task refusal and extends it:
"a director, cast member or craft lead seated on an active production (seats are reserved from greenlight through
release) cannot be released until release. Today a released actor keeps shooting because nothing re-checks the
contract inside the production ... Release during the founding draft is refused." §3.6 names the busy-set refusal as
one of two hazards that "ride with the charge change and are Core". The P14A.1 plan's Scope paragraph includes it.

Current source enforces only the screenplay task:

- Engine `src/core/actions.ts:2661` `applyReleaseTalent`: refuses no active contract and an active screenplay
  assignment; nothing else.
- Bridge `bridge/contract.ts:163` `releaseRefusal`: the same two refusals, so the Profile offers release of a seated
  person and the engine accepts it.
- `tests/p14a1-firing.test.ts:59` records "R2 ... is NOT exercised here"; no other test asserts it.

The world-truth consequence the companion names is live: a released Actor, Director or craft lead stays in
`production.cast`, `directorId` or `craftIds` of an active player production while becoming a free agent any studio
may sign.

## Proposed law (engine is the authority, Bridge asks the same question)

1. Seat set: `productionCompanyTalentIds(state.studio.activeProductions)` (`src/core/productionPeople.ts:4`), the
   director, every cast seat and every craft id of every active player production. This is the "greenlight through
   release" reservation; a production leaves `activeProductions` at release. Writers stay governed by the existing
   screenplay-task refusal; a credited-only writer of a production in progress is not seated (credit is not
   occupancy, `employment.ts:147-151`).
2. Research seats are NOT added. `busyTalentIds` (`employment.ts:161`) also contains active technology-project
   seats, and release already has a lawful handler for them (`researchAfterEmploymentRelease`). R2 names production
   seats and writing; widening to research would change P13B behavior without a record.
3. Founding draft: while `state.founding !== null`, release is refused.
4. Engine: `applyReleaseTalent` throws a named refusal before any charge, ledger row, contract removal, promise
   breaking or free-agent change, in the house style of the existing refusals. Order: no contract, founding draft,
   seated, screenplay task (the existing two keep their wording).
5. Bridge: `releaseRefusal` returns typed codes `foundingDraft` and `seatedOnActiveProduction`, with reason copy
   naming the production title and remedy "Release after the picture is released, or recast before shooting." The
   Profile, quote and command paths already route through this one function (`contractActionDecisions`, quote,
   `session.ts:1685`), so the sheet cannot disagree with the engine.
6. `releaseDisclosure` consequences are unchanged (it describes a lawful release); it is never offered for a
   refused one because the Bridge refusal precedes it.
7. No persistence change, no save or projection bump, no tuning constant. Existing saves may contain a historical
   release of a then-seated person; nothing is revalidated or rewritten, because the refusal is a command-time law.

Out of scope here: the rival mirror (R3, next), a "notice, effective at release" variant (§7.4 later feature), and
any change to the charge, floor (R1) or promise breaking.

## Tests (test-author, RED first against unchanged production)

New `tests/p14a1-release-busy-set.test.ts` (core) and one Bridge leaf, deriving expectations from §3.4, not from
current output:

- Director, lead, antagonist, support and one craft seat of an active player production: each release throws the
  seated refusal; cash, ledger, contracts, freeAgents, promises and technology are byte-identical after the refusal.
- The same person after the production releases: release succeeds with the §3.2 charge.
- A person seated only on a technology project (active research seat): release still succeeds and research
  releases the seat as today.
- Founding draft: release refused while `founding` is non-null; allowed after `foundStudio`.
- A credited writer of an in-production picture with no active screenplay task: release allowed.
- Bridge: `contractActionDecisions` reports `releaseAvailable:false` with the new reason; the quote and command
  paths refuse with the typed code; a free unseated person still quotes the exact disclosure.

Each case uses public actions to reach its state (greenlight, cast, shoot) and a named seed; no synthetic contract
editing. The author also greps every existing test that calls `releaseTalent` (29 files at 993e6b01) and lists which
release a seated person or release during founding. Those are intended behavior changes under R2, attributed by
cause with the old and new expectation, staged separately and reviewed; none is silently edited.

## Gates and ownership

Parent is the production writer (two small functions); test-author owns RED and the neighbor list; contract-auditor
reviews plan, RED, implementation and results. Gates: RED run (targeted), root and Bridge type check, GREEN run of the
new file plus every affected neighbor file, each under bounded pre/post guards. The broad 1302/1303 baseline precedes
the implementation so R2's neighbor effects are attributable against it. Unity/native and Owner access stay deferred.
