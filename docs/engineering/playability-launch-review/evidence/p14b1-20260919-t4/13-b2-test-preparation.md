# Current qualification — 2026-09-19

Read-only preparation, not B.2 implementation or executed fixture evidence.
The native test-author's original brief is preserved below. Its item 2 is now
superseded: the guessed SATISFIED contract identity was corrected during T4 at
`ee91913`, with native employment-party assertions; the new independent T4 file
also provides a naturally generated populated V29 shared-take round-trip fixture.
Current B.2 plan reconciles item 1's producer shape and item 3's legitimate
run-to-end driver. Source/tests remain frozen for the T4 full run.

Additional coordinator read-only finding at `ee91913`: the engine's `label`
function is private, and `trustDescriptor` requires a non-null person ID. The
Industry aggregate must not invent a sentinel person or label only its top-three
display drivers. At B.2, expose a pure aggregate descriptor through the existing
engine trust owner (no persisted fact or law change) and reuse it in the fallback
and Industry bridge. This is an explicit pure-helper exception to the plan's
expected bridge-only implementation; test the all-drivers-before-display-cap rule.

Attention implementation should use a dedicated pure promise scan shared by
the market page and profile case carrier, without importing the case's viewer
guard. No promise may disappear from workspace attention simply because the
latest case is absent/closed/belongs to its previous studio. Native/Unity views
remain deferred. Poaching and D3 recipes below have not been executed.

---

# P14B.2 independent test/fixture preparation

Status: design complete; not executed; no repository files changed.
Source inspected: d19c45b2d873653b4cd4488608e4e411f15a2c34 in
/Users/zacheryspector/The-Movies-headless-program. Parent owns the heavy-test slot.
This work may be used only after P14B.1 T4 closes. No B.2 implementation is implied.

Authority: current Owner continuation and OWNER-DIRECTIVE-LOGIC-FIRST-20260916.md;
P14-HEADLESS-PLAN.md lines 165–186; companion §4.4, §4.5 and R5; native application
of .claude/agents/test-author.md. Requirements below are independent of bridge
implementation. Source reads establish APIs and fixture constraints, not desired
behavior. No runtime probe, test, network call, production edit or publication ran.

## Material findings before authoring

1. `bridge/promises.ts:91` is already bound-only (`contractId !== null`) but its
   `MarketPromiseHistoryRow` has NO `contractId` or `outcomeCause` and emits mint
   order. The B.2 plan's description of these fields as the same landed B.1 shape
   is inaccurate. Projection 46 must intentionally widen the shared row with both
   fields and reverse to newest first, then update the two exact B.1 history
   expectations at `tests/bridge-p14b1-promises.test.ts:302` / `:327`. Do not pretend
   this was already the projection-45 shape. Preserve bound-only/issuer filtering.
2. `tests/p14b1-promises.test.ts:579` still fabricates
   `player:contract:${cast.lead}`. The real-row helper already exists at :174;
   replace ONLY that value with
   `activeEmploymentContractId(state, cast.lead, state.hollywood!.playerStudioId)`.
   The engine gate currently tests non-null, so green today does not prove a real
   employment identity. This is a test-fixture correction, not a validator change.
3. A promise won by retaining an employee necessarily follows the original
   contract's real expiry. The pair therefore already has `ranToEnd` trust history.
   A real retention-then-first-take fixture should assert EXACTLY ONE promiseKept
   driver, not exactly one driver TOTAL. For exactly one total driver, use a real
   poaching winner with no prior player history, or label a synthetic bound-record
   premise explicitly. Never delete the legitimate ranToEnd driver to fit the test.
4. `marketAttentionRows` at people.ts:900 returns before doing work when neither a
   current own proposal nor original `subjectStudioId` belongs to the viewer. Closed
   cases have no current proposals. This is exactly why the new promise attention
   scan must stand alone and run even with no case or a different latest case.
5. Pulse outcome receipts carry only `kind: promiseOutcome` plus their reason, not
   a typed SATISFIED/BROKEN field. Join to `state.promises` by
   `promise.outcomeEventId === receipt.eventId`; do not infer the outcome by parsing
   prose or joining only (person, week), which can collide across studios.

## Reusable fixture recipes

### Real first take

Reuse `buildScheduledPlayerProduction` from `tests/p14b1-first-take.test.ts:185`
(duplicated in promises.test.ts:262): generated industry world; lawful signContract
for writer/director/three actors/craft; disclosed cash bootstrap with matching
ledger delta; grand-ballroom set on facility-soundstage-07; greenlight through the
real production action; walk to rehearsal; set ballroom-reveal-lighting-01 with
current planRevision; walk until remainingTicks is 5; assignShootingDirector and
scheduleShootingTake. Assert scheduled and no blocker, firstTakes empty for this
production, then tick once: remainingTicks 4, exactly one new take, correct studio,
director/cast/week. Never use raw legacy-v28-shooting-5 for this: it has hollywood
null and an unscheduled task. That old file remains unchanged migration evidence.

For a compact bridge unit fixture, a declared synthetic OPEN ProfessionalPromise
may be attached to the real lead employment row before this actual take. Use the
full ProfessionalPromise type (version, full feasibilityReceipt, outcomeEventId,
real contractId), append at the live promise ordinal, and let tick produce the
outcome and its own outcomeEventId. This tests real take/outcome/bridge integration
but must not be called proof of proposal-origin binding.

For fully action-derived binding, combine the B.1 retention construction below
with that same production recipe, greenlighting only after the contract binds.
Pre-hire supporting roster and construct the set before the window to leave enough
time. Derive actor IDs from the legal sign actions, not current array positions.

### Real bound kept + broken state (preferred round-trip fixture)

Start a generated industry world with recorded bootstrap. Sign two free-agent
actors for 52 weeks at week 0, all other needed crew for 208. Keep these two actors
unseated until their week-52 cases settle; construct the ballroom beforehand.
At week 45 submit player tier 1.25 / 52-week proposals and attach X=1 promises with
start 52, due 92 (the B.1 bridge test proved the 40-week window survives freeze).
At week 52 assert actual settlement receipts name the player and each promise's
contractId equals its new real employment row. Current proposals must be absent.

Use actor A in the real filming recipe, other actors for the remaining cast seats.
After the actual take, assert A SATISFIED, evidenceRefs includes its real take ID,
and outcomeEventId names its ONE promiseOutcome receipt at the same week. Actor B
remains unseated; legally releaseTalent B after A's take. Assert B BROKEN immediately
and a different, real promiseOutcome receipt. This creates two outcomes and distinct
causes without manually fabricating terminal history; save/load it through
BridgeSession, require Save V29 accepted, and compare all read-model surfaces.

Alternative existing slow/simple BROKEN recipe: openCaseWithBothProposals in
tests/bridge-p14b1-promises.test.ts:172; seed p14b1-bridge-promise-history; actor
52-week contract, submit at45, attach start52/due92, bind52, no filming, advance92.
The genuine legacy-v28-open-case-45 fixture is also reusable via migrateToV29 and
its pinned c9ff26fe... SHA. Do not replace it with a freshly minted save.

### Poaching winner after closed case

No player seat cap exists (`talentMarket.ts:1040`); the known founding cap prevents
rivals hiring extra people. The separate A.3 difficulty for player poaching is
chooser Standing, not a player admission cap. Source-derived candidate, NOT YET
RUN: seed p13-public-commercial-adoption, FIRST expiry window 196→208, naturally
unproven actor person-studio-5a47d054-r04-3 at studio-5a47d054-r04. Prior recorded
measurement says r04 was solvent at196 (+12,284,652) but insolvent at404. Assert
the unproven/solvent predicates at runtime; do not reuse the known insolvent404
scenario or rewrite insolvency away.

Submit a player maximum-tier, shortest-term proposal with feasible X1 P1, and
resubmit the incumbent at minimum tier/longest term with NO promise (material
revision via submitProposal clears it). Then actual tick settlement should give
the player compensation/short-term/opportunity wins versus rival incumbency/
Standing (possibly trust). For the unproven archetype opportunity is first in a
residual equal-wins comparison. This is a candidate requiring an authorized probe;
if it does not settle as predicted, report the precise freeze or ranking reasons.

Required assertions before attention: actual settled case has
subjectStudioId !== playerStudioId; winning receipt.studioId === playerStudioId;
bound promise names player's NEW employment; currentProposals is empty; both
old expiry and new start employment receipts exist. Then read at due−9 and due−8
while open; reach due with no filming for promiseOutcome. Do not substitute a
retention fixture, a forged settled flag, or a hand-bound promise for this pin.

## RED test groups for tests/bridge-p14b2-trust.test.ts

Import the absent `trustBlockFor` and `promiseRowsForPerson` from ../bridge/trust.ts
and call both in each group as specified; module resolution must be the initial
RED. A mechanical choice is signatures (state, talentId, viewerStudioId,
week = state.market.tick), matching the current promise helper. Mark that API choice
as implementation detail, not Owner law. Do not add production code to get RED.

1. Version/schema: projection46, Save29, schema urn projection46; exact existing
   AVAILABLE_INTENT_KINDS retained; MARKET_ATTENTION_CAUSES is the old five plus
   promiseDue and promiseOutcome. Actual session profile/market/Pulse/industry
   payloads must still validate against generated schema after implementation.
2. Trust: real kept and broken fixtures, exact kind/week/positive/reason from the
   known conduct event; campaignDate(week).label and .year; Reliable for all-positive
   pair; separate no-pair-history person sees scope studio and real aggregate
   drivers; fresh world Mixed record, empty drivers, 'No record yet'. Include four
   real material events so top THREE recency order is asserted, not just ≤3 on a
   one-event fixture. Respect stable same-week ordering only if publicly selected.
   The line must include each listed reason and campaign year joined by U+00B7.
3. History: bound own open/settled only, newest first, actual contractId and
   outcomeCause; an attached then withdrawn/losing unbound record never appears;
   another studio's promises never appear. The case and profile rows match after
   filtering by person. Multiple history rows are necessary to test order.
4. Pulse: exactly one people row per real outcome receipt, same eventId/week,
   expected outcomeKind, names the real studio and person, detail EXACTLY
   receipt.reasons.join(' '), no promise terms. Advance one week and assert no
   duplicate event row. Query bounded/paginated Pulse until exhausted or filter by
   subject/studio; absence from only the first 50 rows is not absence from Pulse.
5. Attention: own bound open X1 at due−9 absent / due−8 present; unknown/unbound/
   rival-issued excluded; due gone after the qualifying take; outcome only on its
   week; both outcomes dedup by (cause, talentId). Test both promiseDue and
   promiseOutcome on the actual poaching winner above, after proposals vanished.
   Add a no-case synthetic bridge unit state if needed to pin independence from
   caseEntries. Existing A.1 five causes retain their requirement-based tests.
6. Workspace: during a subsequent real open case, selected.history.promises equals
   current profile.promises for this talent, including previous bound outcomes.
   For a simpler fixture, the original open case has no bound history yet; an empty
   equality there is insufficient coverage. Keep at least one real prior record.
7. Privacy both ways: use a RIVAL-ONLY promise outcome state so own legal terms
   cannot collide; profile/market/attention/Pulse/industry have no family/count/
   window/classification fields for that promise; proposal is literal UNKNOWN
   while open. Positively assert rival kept/broken activity and rival studio
   trustLabel survive. For terminal rival promises, varying private terms while
   keeping outcome/events fixed should leave public DTO bytes unchanged; this is a
   read-only disclosure probe, not a saved campaign. Avoid searching for raw count
   1 globally: ordinary page/cast/rank values legitimately equal it. Structural
   field/path checks and semantic public equality avoid false positives.
8. Industry: every entered studio including player has its aggregate trustLabel;
   no per-person driver list leaks into studio rows. Labels must use ALL aggregate
   drivers before the top-three display cap, not label only the displayed subset.
9. Save/load: actual V29 state containing kept AND broken outcomes, all read-model
   surfaces equal after BridgeSession save/load (normalize only actual JSON -0).
   Keep same query sessionId/requestId/revision on both sides or compare the DTO
   payloads, so intentionally different envelope IDs cannot fake a round-trip
   regression. No test should accept an unvalidated fabricated save.

## D3 synthetic test: replace ONLY the designated first todo

Target tests/p14b1-trust-chooser.test.ts:288, title beginning
'opportunity breaks an otherwise 1-1 tie'. Preserve both remaining todos verbatim.

Use a solvent rival incumbent and a naturally unproven actor. Build the synthetic
case from its REAL employment interval; actual TalentMarketCase has no caseId
counter. Its discovered receipt must append `talent-market-event-${receipts.length}`
at the LIVE receipt counter (never zero). Do not overwrite existing roots, ended
intervals, receipt arrays, cash history or unrelated cases. Favor first natural
196→208 expiry above if it avoids synthesizing inconsistent employment facts.

Create TWO matched branches from the same pre-settlement state. Both branches
have player better compensation, incumbent rival better incumbency, equal term,
equal Standing band and equal trust band. A genuine earlier player contract run to
end can provide Reliable aggregate fallback; the rival candidate's genuine expiry
provides its Reliable pair record at settlement. If Standing must be equalized,
state that explicit synthetic input and apply it to BOTH branches only; no fake
win or promise outcome. Ensure each branch has exactly the two relevant survivors
(dropped reasons cannot hide a one-survivor non-test).

Baseline: no promise; the 1−1 pairwise tie resolves to player compensation under
the unproven priority order. Treatment: attach a feasible promise to incumbent,
use actual proposal digest recomputation, then actual settlement; opportunity adds
the second winning descriptor, so incumbent wins. Assert baseline winner differs,
treatment reason includes opportunity, no dropped proposal accounts for the
difference, and treatment promise bound to the real winner employment. This pins
opportunity's causal contribution, not merely that a reason string exists.

If the real chooser contradicts those established descriptor inputs, record a
bounded finding for the Owner track. No chooser fix inside B.2. No expectation
relaxation, new todo, or unrelated test cleanup to get green.

## Handoff

Exact draft path: /tmp/studio-b2-tests-fCvmA5/P14B2-TEST-FIXTURE-BRIEF.md.
Next: after parent closes T4 and grants the test slot, implement RED bridge tests
and execute source-derived fixture candidates serially. The main risks are lawful
poaching construction, retention's unavoidable ranToEnd driver, and bridge-history
shape drift between the B.2 plan and actual B.1 DTO. None requires a product choice.
