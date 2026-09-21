# 645-A — scoping note: the next P14B family after the B.4 logic families

Sim-core, READ-ONLY. Worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `40451858`
(clean). No edits, no vitest/tsc/npm/node; shell used for grep/sed/ls/wc and read-only git only.
Paper analysis. Every citation is to the file at HEAD. Nothing here is an execution order, an
Owner decision, or a claim that any behaviour was run.

Authority read: companion `docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md`
(§2.2 :157-160, §4.4 :373-383, §4.5 :385-391, §5 :393-492, §6 :493-549, §7 :550-634); rulings
`docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md` §3.4.1 :224-239;
P14 plan `docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md` (§3 :407-413,
B.1 :496-527, B.2 :539-576, B.3 :578-621, B-F2 :623-700, B.4 :702-713); B4 plan
`docs/engineering/playability-launch-review/plans/P14B4-HEADLESS-PLAN.md` :386-415 (the continuation sentence :412-415); Owner ruling
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/600-owner-ruling-578-reopened-program.md`
§1 :10-63, §2 :65-94, §3 :96-146.

---

## 0. Source facts at HEAD (the surface any next slice touches)

| Fact | Where |
|---|---|
| `LIVE_SAVE_VERSION = 30` | `src/core/save.ts:6396` |
| `PROJECTION_VERSION = 47` | `bridge/schema/bridge-schema.ts:233` |
| `PROMISE_RULES_VERSION = 4`; doc line reserves "5" for the joint certificate | `src/core/promises.ts:39-45` |
| Last behavioural `src/core` writer `61833f0d`/`c5a2ecdc` (record 637); `651fea8b` is comment-only | `git log -3 -- src/core` |
| NO genuine outgoing V30 save fixture and NO genuine projection-47 runtime checkpoint exist under `tests/fixtures/p14/` (listing shows `genuine-v29-pre-p2/`, `genuine-v29-pre-b3-evaluator1/`, `genuine-projection46-runtime/`, `legacy-v28-*` only); the runtime registry's last registered outgoing schema is `projection-v46` | `tests/fixtures/p14/`; `bridge/runtime-checkpoint.ts:63` |
| Roots: `GameStateV30 = GameStateV28 (talentMarket) + firstTakes + promises`; `GameState = GameStateV30` | `src/core/types.ts:2126, 2205-2210, 2227-2234` |
| The V-step device a new root reuses: own validator, then strip to the frozen prior (`stripV29Roots` :8583-8600), downgrade refusal (`convertV30ToV29` :8707-8714), `migrateToV30` :8717-8721; `validateSaveV30` :8679-8695 requires both roots by `Object.hasOwn` | `src/core/save.ts` |
| `PromiseOutcome` already enumerates `WAIVED`/`VOIDED`; the root validator admits them (`promises.ts:1102`); NO producer exists ("no B.1 path reaches", `promises.ts:708-710`); the wire enum `PROMISE_OUTCOMES` already carries them | `src/core/types.ts:2170-2173`; `bridge/schema/bridge-schema.ts:1745` |
| Tests PIN the two outcomes as never emitted: `tests/p14b1-promises.test.ts:845-850`; `tests/bridge-p14b2-trust.test.ts:229-235` (loop over `['WAIVED','VOIDED']`) | those files |
| Chooser: `DESCRIPTOR_ORDER` = six descriptors; D5 relationships NEUTRAL and omitted ("no relationship fact exists yet … It arrives with P14B.2") | `src/core/talentMarket.ts:659-669` |
| `priorityOrder` (two archetype orders, D5 reduced out), `preferredTerm`, `publicPriorityOrder`, `publicPreferredOpportunity` | `src/core/talentMarket.ts:698-729` |
| `bandsFor` (D1, D2, D6, D7, D3 opportunity, D4 trust bands) | `src/core/talentMarket.ts:779-816` |
| `chooseProposal` (dominance, Copeland, priority order, submission week, incumbent, decline-all) | `src/core/talentMarket.ts:832-886` |
| Reservation drops: `FreezeDrop` union incl. `promiseNotFeasible`, `issuerDistrusted`; `survivesFreeze` checks Distrusted before seat budget | `src/core/talentMarket.ts:999-1010, 1059-1075` |
| The wire `priorityOrder` enum is CLOSED at six members (B.1 widened it 4→6 with a forced projection bump) | `bridge/schema/bridge-schema.ts:2319-2330` |
| Trust: derived on read, five driver kinds, recording boundary `studioHistory.recordingStartedWeek`, horizon 260, aggregate fallback; `cancelledAfterFirstTake` is DERIVED from `firstTakes` joined against surviving productions/films (the derivation precedent a relationship driver can copy) | `src/core/promises.ts:805-901`, cancel derivation :867-880 |
| Weekly order at the tick tail: `appendFirstTakes` → `advancePromisesWeek` → `advanceTalentMarketWeek` | `src/core/tick.ts:1091-1110` |
| Rival decisions: `decide()` :154-232; the B.4 seating preference :163-169 (`promisedCastMasks`); rival proposal + `authorRivalPromise` inside `advanceTalentMarketWeek` step 3 | `src/core/hollywoodTick.ts`; `src/core/talentMarket.ts:1214-1241, 1275` |
| Studio-caused immediate BROKEN sites: `breakPromisesOnCancel` (actions.ts:599), `breakPromisesOnTermination` (actions.ts:2637) | `src/core/actions.ts` |
| Families P3/P4/P5 refused at the service with typed reasons (`NOT_OFFERED_IN_B1`) | `src/core/promises.ts:213-217, 393-394` |
| Evaluator-5 designated failing case (one live `it`, one `it.todo`) | `tests/p14b4-cast-class-capacity-evaluator5.test.ts:235-247` |
| Facts a relationship slice can READ without a new producer: `FirstTakeReceipt {directorId, cast{lead,antagonist,support}}` (`types.ts:2131-2138`); `FilmResult {criticScore, boxOffice, participants?}` (`types.ts:253-275`); rival films `hollywood.films` (`hollywoodTypes.ts:137`); employment intervals (`hollywoodTypes.ts:134-135`); `CastingSession {slate, results}` player-only (`types.ts:892-906`); no rival casting session exists (`decide()` seats directly) | as cited |
| Market receipts: kind is not a closed enum in `validateTalentMarketRoot` (only `dropped` sentences are checked, :1379-1389); the promise validator requires `outcomeEventId` to name a `promiseOutcome` receipt (`promises.ts:1108-1114`) | `src/core/talentMarket.ts`, `src/core/promises.ts` |
| Unity backlog file and its P14B entries | `docs/engineering/playability-launch-review/UNITY-INTEGRATION-BACKLOG.md:24, 151-157, 222-274, 467-524` |

Source fact (not a recommendation): no module named `relationships`, no `pairChemistry`, no
`closeness`, no `waive*` symbol exists in `src/`, `bridge/` (grep 2026-09-21). Any of the
families below starts from zero engine surface except the enumerated outcome members and the
NEUTRAL D5 slot.

---

## 1. Candidate next families and their authority

### (a) Relationships (companion §5 :393-492)

**Settled by Owner direction (§7.1).** S19 :576 (the Movies+ model: positive, negative,
acquaintances, friendships, close bonds, deep bonds, romance, enemies/nemeses, chemistry
consequences, growth through shared work, explainable effects), S20 :577 (no social grind; work
is the primary driver; the player never commands "talk"), S21 :578 (current closeness may decay;
career history never disappears), S22 :579 (romance regardless of gender; no marriage, children,
households, lineage, inheritance, domestic needs), S23 :580 (ownership unchanged; campaign scope),
S25 :582 (symmetric player/rival law). Rulings text: §3.4.1 items 12 :237 and 13 :238.

**Implementation recommendations (§7.2).** R8 :596 (the person-choice rule, with D5 named in
§2.1.7's descriptor table :116 "D5 relationships at the issuer | close ties here (Close Friends /
Inseparable / Partners on the roster), none, enemies here | neutral in P14A"), R16 :604 (nine-tier
ladder, romance as a separate track, drivers, proximity weights, decay-to-baseline on read,
Partners exemption, evidence joined on employment intervals, the §5.5 compaction rule), R17 :605
(chemistry as a read-only projection consumed by the production result owner within a bound it
sets; casting warning for Enemies/Nemeses, no refusal), R22 :610 (persistence: one governed
inner-save step per wave; roots at top level). Companion §5 header :395 labels the whole section
"IMPLEMENTATION RECOMMENDATION; every threshold, weight and horizon is a NUMERICAL/CONTENT
HYPOTHESIS".

**Genuinely unresolved (§7.3), quoted.**
- Q2 :621: "Should relationship growth use the public temperament descriptor as a compatibility
  prior, or grow at one base rate for every pair? … **Compatibility influence remains a later
  recommendation**; the first slice grows every pair at the base rate (recommended first behavior,
  not an approval) | P14B relationships".
- Q3 :622: "At migration, should anything be reconstructed from existing credits and receipts? …
  **No behavioral backfill by default**; factual shared-credit counts may be shown as facts,
  labeled, and are not reconstructed friendship, romance, chemistry or trust (recommended first
  behavior, not an approval) | P14B migration".
- Q4 :623: "Should a Nemeses/Enemies pair be able to refuse a seating outright, or only incur the
  disclosed penalty? … **Warning plus the disclosed consequence is the recommended first
  behavior**; hard refusal remains unselected later scope (not an approval) | P14B chemistry".

Blocking? Each carries a recommended first behaviour. B.1 landed on exactly this footing for Q1
and Q3 ("Q1 (no override) and Q3 (count-only) as recommendations, not approvals", P14 plan :514,
:527) with no Owner pause; the landed trust derivation already enforces Q3's recording boundary
(`promises.ts:829-834`). A first relationship slice that follows the three recommended first
behaviours and records them as OPEN does not foreclose any option: Q2's prior is an additive
driver-gain factor; Q4's hard refusal is an additive greenlight guard; Q3's behavioural backfill
would be a later labelled migration. Isolated, not blocking. See §3.

**Companion-internal design gaps (not Owner questions, the writer or Fable settles them).**
The closeness value's scale and the nine tier thresholds (:419-433, "hypothesis"); the baseline
(original 45-55 random, :401; Project: Studio has no RNG in this module so a fixed baseline is the
only lawful choice); drift horizons (:467, "no drift for 52 weeks … linear return over 260");
the compaction rule's window (:468, "hypothesis: 260 weeks"); the storage shape of the edge
record (§5.7 :484-491 gives the key and the hot/cold split, not the field list); the P07 success
threshold for the "shared released film that succeeded" driver (:440 "P07 result above a
threshold").

### (b) Waiver — the WAIVED outcome (companion §4.4 :379)

**Is there a waiver acceptance rule anywhere?** YES, as a HYPOTHESIS only, in one place:
companion §4.4 :379, quoted in full: "before the due week the studio proposes a waiver and the
person accepts it under the deterministic acceptance rule (hypothesis: accepted when a substitute
promise of equal or higher family class with a feasible receipt is attached, or when the person's
own announced retirement or profession transition makes the promise moot; refused by a person
whose trust record of the studio is Distrusted) | none; recorded and visible | the waiver
receipt". R14 :602 cites it as "waiver acceptance rule" (an implementation recommendation). §2.1.7
:104 names it as one of the single-proposal acceptances: "A single proposal (the P14C extension,
a P14B waiver, a P14C transition choice) is accepted iff it clears [reservation]". No other
document defines it; no source symbol exists (grep §0). The P14 plan records it deferred at every
slice: B.1 :500 "WAIVED (the waiver acceptance rule)"; B.2 :561 "WAIVED (the waiver acceptance
rule needs an intent and engine law — B.3 candidate)"; B.3 :583 "not P2–P5, waiver,
relationships".

**Settled.** S11 :568 ("mutual waiver carries no penalty"; rulings item 7 :232 "mutual agreement
may produce WAIVED with no broken-promise penalty"); S9/S10 :566-567 govern the substitute
promise (typed, feasible). **Recommendation.** R14 :602. **Unresolved.** None in §7.3 names the
waiver. Q1 :620 (override) does not touch it.

**Companion-internal design gaps.** (1) "equal or higher family class" has no ordering anywhere;
the catalogue is a flat five-member union (`types.ts:2147-2152`) and only P1 and tagged P2 are
offerable today. (2) The substitute promise "is attached" to the waiver, not to a proposal; §4.1
:311 says a promise rides "a proposal — a market proposal (§2.1.4) or the P14C extension
proposal", so the waiver is a third attachment vehicle with no case and no chooser; the landed
`attachPromise` requires a current proposal (`promises.ts:503-513`). (3) The "retirement or
transition makes the promise moot" branch needs P14C facts that do not exist. (4) The typed link
between the waived promise and its substitute has no field on the V30 record; the validator's
exact-key list (`promises.ts:1012-1014`) refuses an extra key, so a typed link is a V31 field.
(5) Rival symmetry: the companion states rivals promise (:333) but says nothing about rivals
proposing waivers; under S25 the LAW would be symmetric, the rival POLICY is unspecified (the R3
"rival release" precedent: Ready work, recorded, not built).

### (c) VOIDED via P14C retirement / profession transition (companion §4.4 :380, §6)

**Settled.** S11 :568 (external cause may be VOIDED), S13-S18 :570-575 (aging, all professionals
age, retirement with notice and one extension, preservation, profession vs industry retirement,
the Actor → Director / Actor → Writer catalogue); rulings items 9-11 :234-236. **Recommendation.**
R14 :602 ("VOIDED limited to the person's own retirement or transition; the issuing studio's own
dormancy, bankruptcy or closure is never VOIDED automatically"), R18-R21 :606-609.
**Unresolved (§7.3).** None named. Plan-labelled OPEN: P14 plan :401 "the Scientist joins market
eligibility, aging and retirement; its retirement window and market rule are OPEN (companion
§7.3-adjacent; no Owner text)". Rulings item 9 :234 says "role-specific retirement ages and rules
may differ later through tuning", so on the ruling's own words the Scientist window is tuning,
not a product choice; Fable should classify it, not the Owner.

**Dependency.** VOIDED cannot be produced before P14C exists: its causes are "the person's own
announced retirement effective before the window can be used; the person's own profession
transition" (:380). P14C itself is a package, not a slice: birth provenance for every
`state.talent` id with validator cross-check (§6.1 :499-500), the P10 lifecycle predicate, term
cap and profession-change receipt (§2.5 :173), the one mint primitive (§6.5 :540), the
`retirement_announced` / `finishing_commitments` states (§6.2 :509-511), the extension as a
one-issuer case (:513). §6.3 :527 lists "recorded collaboration with directors (P14B evidence:
mentorship labels, repeated director–lead work)" among the Actor → Director eligibility inputs:
P14C consumes relationship evidence, so relationships precede P14C in the companion's own
dependency order.

### (d) Evaluator 5 (record 600 §1 D1/D2; §3 step 2(b) :106-110)

**Settled (Owner ruling 600 §1, verbatim :20-36).** "The kernel joint certificate and
UNCERTIFIED→FRAGILE mapping move to evaluator 5." "Keep the 200,000 work cap and the current 162
§2 native Map/Set metric exactly as adopted. Certified offers may continue to exist only where
the current kernel fits. Do not open multi-admission or deferred-admission grammar.
UNCERTIFIED→FRAGILE remains evaluator-5 behavior. Revisit the metric/cap only when evaluator 5 is
actually designed." 515 §6 (c): the 302 stale route stays RED; C9/C10 not authorized.

**Where it stands in source.** `promises.ts:39-45` names 5 as "the bounded joint certificate and
UNCERTIFIED -> FRAGILE"; the detached adapter (553) and enumerator (574) stay unwired (600 §2
:81; `promiseCapacityOwners.ts` header per record 638-W). The designated case
`tests/p14b4-cast-class-capacity-evaluator5.test.ts:236` expects IMPOSSIBLE where the scalar
answers FRAGILE ("`activePromiseReservations` filters by beneficiary, so the antagonist person's
bound lead-class claim is invisible to the SUPPORT target's read", header :6-10); the `it.todo`
:247 pins the certified-bottleneck requirement.

**Unresolved.** No §7.3 entry. The D2 ruling makes the cap/metric revisit CONDITIONAL on the
design existing: designing evaluator 5 is engineering, but if the design needs a different cap or
metric it produces an Owner packet (600 §1 D2). Not a product decision to isolate now; a design
task whose output may be one.

**Version collision to flag (plan-level, for Fable).** `PROMISE_RULES_VERSION` 5 is plan-named
for the joint certificate (600 §2 :78-79; `promises.ts:43-44`). Any other evaluator change (a P3
director mask, the P4/P5 singular tests, or a waiver-time re-classification rule) is a law change
that must stamp a new version (the "version literal is the whole law" rule; record 23 "rules 4 is
stamped only by the evaluator change", 600 §2 :82). Either the families take 5 and the certificate
moves to a later literal (a plan amendment, one doc line at `promises.ts:39-45` plus the plan), or
the certificate is designed first. This is not an Owner question; it is a sequencing decision the
plan must record before any evaluator-touching writer moves.

### (e) Everything else §2.2 / §7 names

| Item | Authority | Class | Startable? |
|---|---|---|---|
| Remaining families P3 `DIRECTING_COUNT`, P4 `PREFERRED_GENRE_OPPORTUNITY`, P5 `SPECIFIC_PROJECT` | S9 :566; R12 :600 (P3 on has-discipline; B-F2 :646-655 corrected the label gate), R13 :601 (singular-family tests); refused today `promises.ts:213-217` | recommendation | Engine-only, no Owner block; collides with the rules-version naming in (d); P4 needs `promise.genre` of pipeline scripts (present: `ScriptProject.promise.genre`, rival `ready.promise` `hollywoodTick.ts:165-171`), P5 needs a named `scriptProjectId` on the draft (a new predicate shape → V31 root union member, projection bump for the draft DTO) |
| Calendar / Upcoming rows for promise due weeks | §4.4 :383 "Ready; two owners: the Studio Calendar V1 owner for the kind, P11-REQ-029 for any Upcoming row"; §7.4 :627 | Ready | Bridge/read-model; no engine law; B.2 :562 "deliberately not taken" |
| Free-agent case with a bounded horizon | R26 :614; §2.1.2 :48; §7.4 | Ready | Changes an accepted P10 behaviour; a separate P14A-family slice |
| Rival release of its own employee (`termination` rival movement kind) | R3 :590; §3.6; P14 plan :403 | Ready | Governed save step (RivalMoneyKind widening); P14A family |
| `WRITING_COUNT` | §4.2 :331; §7.4 | LATER FEATURE / NON-BLOCKER | No |
| Q1 override | Q1 :620 | UNRESOLVED; "First slice: no override" stands | No new work |
| Persisted rival policy v2 | R7 :595; §7.4 | later | No |
| Record 628's three expansion-review questions on the landed seating law (R5 seam ordering; G-1(A) authoring exclusion for sole crew; G-2 ordinary-pool retry) | `evidence/p14b4-20260919/628-seating-qualified-checkpoint.md:78-90` | PENDING OWNER (put to the Owner, nothing adopted) | Do not touch `hollywoodTick.ts:163-169` or `authorRivalPromise` policy in a new family; a relationship-based seating preference in `decide()` would reopen R5 and is excluded from any slice until 628 is ruled |
| B.3's accounting boundary ("existing accounting sums competing CURRENT proposals across issuers although only one may win … its policy remains separately OPEN") | P14 plan :618-621 | OPEN (policy) | Not a family; leave |

---

## 2. Recommended first: **P14B.5 — First Shared-Work Bond Core (relationships, bounded)**

### Why this family before the others

1. Dependency order in the companion: P14C's transition rule consumes relationship evidence
   (§6.3 :527); the waiver's second branch and VOIDED consume P14C (§4.4 :379-380). So
   relationships → P14C → (VOIDED, waiver-moot). The P14 plan's slice order says the same:
   "P14B promises/relationships → P14C lifecycle" (:407-409).
2. It is the one selected P14B experience with NO engine surface (§0), and the chooser has
   carried a documented NEUTRAL D5 slot since A.1 (`talentMarket.ts:659-663`, which still says
   "It arrives with P14B.2"). Promises, trust and the D3/D4 descriptors are landed and qualified
   (616/618/628/637); the market's person-choice rule is complete except D5.
3. It is not Owner-blocked (§1(a)): the three §7.3 entries carry recommended first behaviours,
   the exact footing B.1 used for Q1/Q3.
4. The waiver is smaller but is the weaker first pick: its first branch needs a family-class
   order that does not exist and a third attachment vehicle (§1(b) gaps 1-2); its second branch
   needs P14C; its typed link needs a V31 field anyway. Recommended as the NEXT slice after B.5,
   with its one V31 field riding B.5's save step if Fable wants to avoid a V32 (see "Save version"
   below). The P3-P5 families and evaluator 5 are gated on the version-naming decision in §1(d).

### Engine scope (Save V31; one new root; logic-first)

**Root** `relationships` at the top level beside `talentMarket`/`firstTakes`/`promises` (R22
:610 "roots at top level, never inside `hollywood`"), version = the save version (the V28 root
precedent, `types.ts:2115-2123`). Shape (proposal; field names are mechanical and reversible
exactly as B.1's `promises: readonly string[]` was, plan :516):

```
relationships: readonly RelationshipEdge[]      // append order = first qualifying event
RelationshipEdge = {
  edgeId: string                                 // in-state ordinal `relationship-edge-<i>`
  a: string; b: string                           // canonical (min(PersonId), max(PersonId)), §5.7 :486
  closeness: number                              // bounded integer AT lastSharedEventWeek; never shown
  firstSharedWeek: number
  lastSharedEventWeek: number                    // drift is derived on read from this, §5.2 (2) :413
  sharedProductions: number                      // exact counters (the §5.5 fold target)
  sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  peakTier: RelationshipTier; peakTierWeek: number
  recent: readonly RelationshipDriver[]          // bounded (hypothesis ≤ 8), newest last; older fold into counters AT WRITE
}
RelationshipDriver = { kind, week, ref: string, delta: number, reason: string }
   kind ∈ 'sharedProduction' | 'repeatedCollaboration' | 'sharedSuccess' | 'sharedFailure' | 'cancelledAfterFirstTake'
```

**Drivers in slice 1 (all derivable from landed facts, symmetric for rivals by construction):**
- `sharedProduction` + `repeatedCollaboration`: at `appendFirstTakes` (`tick.ts:1102`), for each
  new `FirstTakeReceipt` every pair among `{directorId, cast.lead, cast.antagonist,
  cast.support}` (six pairs) with proximity weights (§5.4 :439 director–lead and co-leads highest,
  supporting lowest; the writer seat is NOT on the receipt and is excluded from slice 1, recorded).
  Idempotent by `(edgeId, productionId)` exactly as `appendFirstTakes` is by `productionId`.
- `sharedSuccess` / `sharedFailure`: at release, from `FilmResult` (`types.ts:253-275`) for the
  player and `hollywood.films` for rivals, joined to the same production's first take; success
  threshold a named hypothesis constant. Idempotent by `filmId`.
- `cancelledAfterFirstTake`: at the player `cancel` action beside `breakPromisesOnCancel`
  (`actions.ts:599`), for pairs seated on the cancelled production's first take.
- Drift: `currentCloseness(edge, week)` = pure function of `closeness`, `lastSharedEventWeek`,
  `week` (§5.5 :467, hypotheses 52 / 260 weeks); tiers from the value + evidence by a versioned
  rule (`RELATIONSHIP_RULES_VERSION = 1`), nine tiers per §5.3 :421-431.

**Excluded from slice 1 (recorded for B.6+, each with its companion line):** the romance track
(§5.4a :451-462: own eligibility, own value, own threshold, Partners coexistence); `castingCompetitionLost`
and repeated seat competition (§5.4 :443-444: the only lawful source today is the player-only
`CastingSession` (`types.ts:892-906`); rivals run no sessions, so a slice-1 driver would be
asymmetric under S25; deferred with that reason); shared awards (:446, P08 by reference);
compaction by WINDOW (§5.5 :468; slice 1 bounds storage by the `recent` cap and exact counters,
a ponytail ceiling: fold-at-write by count, not by week, upgrade path = the windowed rule when
PERF-010 measures it); chemistry CONSUMPTION by the production result law (§5.6 :476, R17: slice 1
exports a read-only `pairChemistry(state, a, b, week)` with reasons and NO consumer; the bound
constant is the result owner's, `forecast.ts`/`reception.ts`, a separate shared-generalization
slice); the casting warning (bridge, Q4's recommended first behaviour, later); the retention
attention item (:479, bridge); evidence labels Mentor/Rivals (:433, HIS-014, later); Q2's
compatibility prior (base rate only); Q3 backfill (none; edges form only from takes at or after
`recordingStartedWeek`, the validator refuses earlier rows exactly as `recordedWeek` at `promises.ts:956-960` does).

**Market consequences in slice 1 (the reason the slice is worth landing):**
- D5 goes LIVE in `bandsFor`: `close ties here` (2) when any Close Friends / Inseparable edge of
  the subject names a person on the issuer's roster at W (`currentEmployees`-equivalent over
  `hollywood.employment` active rows; Partners does not exist yet), `none` (1), `enemies here` (0)
  when an Enemies/Nemeses edge does. `DESCRIPTOR_ORDER` widens 6 → 7; `priorityOrder` regains
  `relationships` at its companion positions (unproven: opportunity, compensation, relationships,
  term, trust, standing, incumbency; proven: compensation, term, trust, relationships, incumbency,
  standing, opportunity; §2.1.7 :120, `talentMarket.ts:690-702`).
- Reservation: `FreezeDrop` gains `nemesisOnRoster` (§2.1.7 :104 "no `Nemeses`-tier relation of
  the person is on the issuer's roster"), checked beside `issuerDistrusted`
  (`talentMarket.ts:1067`). Enumerated and UNREACHABLE in slice 1 (no slice-1 driver can drive a
  pair below Strained; the A.1 `decision_pending` precedent), pinned as such.
- Nothing in `decide()` / `staff()` / `authorRivalPromise` changes (record 628's questions are
  pending; §1(e)).

### Save version and projection

- **Save V31 is required** (a new root + a widened `FreezeDrop`-driven receipt vocabulary is
  not a leaf value write). Device: `validateSaveV31` validates the root then strips to V30;
  `convertV30ToV31` opens the root EMPTY (Q3: nothing recomputed); `convertV31ToV30` refuses when
  any edge exists (the `projectPromisesPreV29` precedent, `promises.ts:1142-1157`); `migrateToV31`
  becomes the live load route; every `migrateToVn` gains the V31 downgrade-refusal line; the
  live-version sweep (30 → 31 pins) as in `6948e31`.
- **Projection bump is NOT optional even for a logic-first slice** once D5 is live: the wire
  `priorityOrder` enum is closed at six (`bridge-schema.ts:2320-2324`) and `marketCaseProjection`
  publishes `publicPriorityOrder` (B.1's forced 44 → 45 for the same reason, backlog :524 "The
  forced bump adds `opportunity` and `trust` to the priority-order enum"). So projection 47 → 48,
  `sha256:6f6b4880…` registered as `projection-v47` in `bridge/runtime-checkpoint.ts:63`, the
  generator run over its three owned artifacts. The THIN surface (B.1 audit precedent, plan :508):
  the enum widening, the D5 settlement reason string, and nothing else. The profile relationship
  block, the drivers text, the casting warning, chemistry rows and attention items are B.6 read
  models (the B.2 pattern: read models over B.5's facts, no engine law).
- If Fable prefers to keep 47 unchanged: land D5 in the engine but keep `relationships` OUT of the
  public priority order until B.6. Not recommended: the companion order is one rule (§2.1.7 :120)
  and the F1 history (:529-537) shows what a partial order costs.

### RED families (test-author; RED before implementation; imports from the absent
`src/core/relationships.ts` so the RED is module-resolution, the strong precedent)

1. Edge minting: a player first take (reuse `tests/helpers/p14b2-fixtures.ts` and the
   `p14b1-first-take` construction) mints exactly six edges once; re-ticking / replaying does not
   double-count; a rival first take mints under the same law; no edge before `recordingStartedWeek`;
   `rngState` byte-equal before/after.
2. Canonical key: `(a, b)` ordered; the same pair on two productions is ONE edge with
   `sharedProductions = 2` and a `repeatedCollaboration` driver.
3. Drift on read: a pair with `lastSharedEventWeek = w` reads the same tier at `w + 51` and
   drifts toward Acquaintances between `w + 52` and `w + 312` (hypothesis pins as constants, not
   literals); tier never rises by drift; history counters never change by drift.
4. Tier rule: versioned; nine members; byte-equal output for byte-equal edge + week; the
   evidence condition for Enemies (a conflict record) and Strained (a recent negative driver
   without one).
5. Success/failure drivers at release for player and rival; idempotent by film; cancellation
   driver at the player cancel with promise-BROKEN coexistence (both fire once).
6. D5 in the chooser: a constructed two-survivor case where the incumbent holds a Close Friends
   collaborator and bands tie elsewhere settles for the incumbent with the reason "the person's
   close ties there ranked above the others" (wording CANDIDATE); the same case at a week where
   the tier has drifted to Colleagues settles the other way. Use the B.2 T3 controlled-staging
   construction (plan :573).
7. `publicPriorityOrder` byte-equal to the seven-member companion orders for both archetypes;
   `preferredTerm` value-identical (the F1 pins move by test-author reconciliation, the B.1 "widened
   to six" precedent).
8. `nemesisOnRoster` enumerated, never emitted on the standard seeds (the WAIVED/VOIDED pin
   pattern).
9. Save V31: sentinel 32 refused; "1 through 31 only"; V30 fixture migrates with an empty root;
   a V31 world holding an edge refuses `migrateToV30`; the genuine V30 corpus byte-identical
   through V31 load (fixtures minted at T0, below); root validator refuses a duplicate pair, a
   non-canonical key, an edge dated outside the recording interval, a person not in
   `state.talent`, `recent` over the cap, `peakTier` outside the catalogue.
10. Leak: no closeness number and no edge of a rival-employed pair on any serialized DTO (the
    B.1 leak pattern); `pairChemistry` reasons carry no number.
11. Bridge (T3, RED first): `PROJECTION_VERSION 48`, `LIVE_SAVE_VERSION 31`, schema `$id`;
    the seven-member enum; the genuine projection-47 checkpoint migrates through the registry.

### Exact source files the ONE writer touches

- NEW `src/core/relationships.ts` (edge minting, drivers, drift, tier rule, `pairChemistry`,
  the V31 root validator + `projectRelationshipsPreV31`).
- `src/core/types.ts` (edge/driver/tier types; `GameStateV31 = GameStateV30 & { relationships }`;
  `GameState = GameStateV31`).
- `src/core/tick.ts:1102-1110` (one call after `appendFirstTakes`, before `advancePromisesWeek`;
  the release hook where `releasedFilms`/`hollywood.films` are appended).
- `src/core/actions.ts:599` (the cancel seam, beside `breakPromisesOnCancel`).
- `src/core/talentMarket.ts:668-702, 779-816, 999-1010, 1059-1075` (D5 band, order, drop).
- `src/core/save.ts` (`SaveFileV31`, `validateSaveV31`, `convertV30ToV31`, `convertV31ToV30`,
  `migrateToV31`, `makeSave` → 31, the downgrade lines, `LIVE_SAVE_VERSION`).
- `src/core/index.ts` (exports).
- `bridge/schema/bridge-schema.ts:233, 2320-2324` + `bridge/people.ts` (the reason string),
  `bridge/runtime-checkpoint.ts:63` (register 47), the generator's three artifacts.
- Live-version sweep files (pins only), by the `6948e31` checklist.

### What stays frozen

`promises.ts` evaluator and `PROMISE_RULES_VERSION 4` (no feasibility change; relationships are
not a feasibility input, §4.3.1 lists none); `hollywoodTick.ts` `decide()`/`staff()` and the
seating preference (628 pending); `authorRivalPromise` policy; `promiseCapacity*` modules (unwired
by 600 §2); every V12–V30 validator and frozen projection; `TUNING`; every cap, tariff, deadline,
timeout and refusal string; the trust derivation (`promises.ts:823-901`); the 302 stale-route
RED and the bridge OLD TS2353 designated failures; all historical fixtures.

### Natural-chain exposure (paper)

- Rival production digests: UNCHANGED (no rival decision reads an edge in slice 1).
- Market settlements: MOVE only on cases with ≥ 2 survivors where D5 bands differ and the prior
  Copeland/priority result was within one descriptor. Direction of movement: the INCUMBENT gains
  once the subject's collaborators reach Close Friends (a rival roster of six fixed seats makes one
  picture at a time with the same four people, so repeated collaboration accrues fast on rival
  rosters). Disclose as a product consequence: incumbency stickiness through friendships, by
  design (§5.3 :428-429 "market preference"), thresholds hypotheses.
- `publicPriorityOrder` output changes for EVERY case (seven members) → every bridge fixture
  carrying `preferences.priorityOrder` / `line` moves (a wire VALUE move, not a law move).
- Inventory of tests reading chooser outcomes or the public order (grep 2026-09-21):
  `tests/p14a1-f1-priority-order.test.ts`, `tests/p14a1-seat-budget.test.ts`,
  `tests/p14b1-trust-chooser.test.ts` (:170 pins the six-member order), `tests/p14b1-promises.test.ts`,
  `tests/p14b1-t4-regressions.test.ts`, `tests/p14b3-reservations.test.ts`,
  `tests/p14b3-rule-revision.test.ts`, `tests/p14b4-cast-class-{capacity,outcomes,policy}.test.ts`,
  `tests/p14b4-material-evidence-core.test.ts`, `tests/p14bf2-acting-discipline.test.ts`,
  `tests/bridge-p14a1-market.test.ts`, `tests/bridge-p14a2-market.test.ts`,
  `tests/bridge-p14a3-world.test.ts`, `tests/bridge-p14b1-promises.test.ts`,
  `tests/bridge-p14b3-promise-command.test.ts`, `tests/bridge-p14b4-cast-class.test.ts`,
  `tests/bridge-contract-generator.test.ts`, `tests/helpers/p14b2-fixtures.ts`. Test-author
  pre-declares, per the natural-chain rule, which assertions may move and what receipt facts a
  lawful movement must show (a `settled` receipt whose `reasons` names the D5 sentence).
- The B.2 T3 D3 synthetic case (plan :573, "equal bands, causal compensation→opportunity winner
  reversal") is the most exposed single test: if its two survivors' issuers differ in roster
  friendships at W, D5 breaks the equal-band premise. Test-author checks it at T1.

### Caps / tariffs it must not touch

The 200,000 work cap and the 162 §2 metric (600 §1 D2); `PROMISE_SLACK_WEEKS`,
`promiseBuffer`, `TRUST_HORIZON_WEEKS`, `TRUST_DISTRUST_MIN_NEGATIVES` (`promises.ts:53-78`);
`STANDING_BAND_TOLERANCE`; `RIVAL_TEAM_ROLES`; the termination charge law and R4 legacy
terminations; `TUNING.HIRING_RENEWAL_WINDOW_WEEKS`; every timeout in the test files; the
`bounded capacity analysis could not certify this schedule` string.

### Unity backlog implications (record-only; no native work follows)

Projection 48 schema identity and Save V31 loading (prior 47 checkpoints migrate through the
registry; a save holding an edge cannot be downgraded to V30); the `priorityOrder` enum gains
`relationships` (a C# enum widening in `StudioBridgeDtos.Generated.cs`; a switch without a
default breaks); one new settlement reason string on the wire; NO new DTO in the thin surface
(the profile relationship block, drivers text, casting warning, chemistry and attention rows
arrive with B.6 as new DTOs and are the native backlog items then). Coordinate the enum widening
explicitly across TS and Unity in the backlog entry, as records 616/628/637 did (backlog :153-157).

### Narrow design gaps for Fable (two alternatives each; recommendation marked)

1. **Edge storage bound.** (i) Fold-at-write by count (`recent` ≤ N, counters exact) — no weekly
   sweep, no window arithmetic, ceiling = the profile shows at most N recent drivers. (ii) The
   §5.5 windowed compaction (260-week fold under PERF-010's trigger). **Recommend (i)** for slice 1
   with a `ponytail:` note naming (ii) as the upgrade when the endurance envelope is measured.
2. **Baseline and value scale.** (i) Integer 0-100, fixed baseline 50, tier edges as named
   constants mirroring the original bands (:401, :421-431). (ii) A small signed integer around 0.
   **Recommend (i)**: the parity anchor is legible and the tests can pin the constants by name.
3. **Slice-1 negative drivers.** (i) Only `sharedFailure` (small) and `cancelledAfterFirstTake`
   (small), so Enemies/Nemeses are unreachable and `nemesisOnRoster` is pinned unreachable.
   (ii) Add the player-only casting-competition driver now. **Recommend (i)** (S25 symmetry; the
   rival has no casting session to lose).
4. **Where D5 reads the issuer's roster at W.** (i) Active employment rows of the issuer at W
   (`hollywood.employment` + `activeEmploymentOrdinals`), the same source `seatsHeldAfter` reads
   (`talentMarket.ts:1044-1052`). (ii) Roster after this week's commits. **Recommend (i)**; it is
   the fact the subject can see when deciding.

### T0 preconditions (before ANY source change)

Mint genuine outgoing V30 fixtures at HEAD `40451858` (the final V30 writer; `651fea8b` is
comment-only, so the behavioural writer identity is `61833f0d`, record both): empty root; a bound
open P1; a tagged P2; kept-and-broken; a rival current P1; a first-take world at
`remainingTicks === 5`; plus a genuine projection-47 runtime checkpoint (`sha256:6f6b4880…`).
None exists today (§0). Record shas in `tests/fixtures/p14/*/MANIFEST.json` and PROVENANCE. Then
the expansion draft, the contract-auditor read-only audit, then T1 RED.

### The waiver as the following slice (B.6 or bundled)

Engine: `waivePromise(state, {promiseId, substitute?: PromiseAttachment})` in `promises.ts`, a
pure `waiverAccepted()` rule (substitute REASONABLY ACHIEVABLE over the REMAINING contract
interval, class ≥ old class under a mask-inclusion order: P1 any-cast ⊂ P2 leadOrAntagonist ⊂ P2
lead; `promiseCastSlots` :603 already expresses the masks; refused when `trustDescriptor(...).label
=== 'Distrusted'`), outcome `WAIVED` through `settle` (one `promiseOutcome` receipt, the B.1
one-kind ruling), the substitute minted and BOUND to the existing `contractId` in the same step
(no proposal, no case). V31 field `supersededByPromiseId: string | null` on the promise record
(exact-key validator) — this is the one field that could ride B.5's V31 step if bundled. Rival
waiver policy: record-only (R3 pattern). Retirement-moot branch: P14C. Two narrow gaps for Fable:
the family-class order (mask inclusion vs an explicit table; recommend mask inclusion) and whether
the substitute is re-classified at each later freeze (no: it is bound, not proposed).

---

## 3. What cannot start without an Owner decision; what can be researched read-only

**Hard Owner blocks (quoted).**
- VOIDED: none in words, but by construction "the person's own announced retirement … the
  person's own profession transition" (§4.4 :380) require P14C; P14C's product law is settled
  (S13-S18) and is a package, not a slice.
- Evaluator 5's cap/metric: "Revisit the metric/cap only when evaluator 5 is actually designed"
  (600 §1 :36). Designing it is engineering; changing the cap or metric is an Owner packet.
- The landed seating law's three questions: "Owner decisions for the expansion review (plan :187;
  nothing adopted now — 619-R ruling 4)" (628 :78-90). Any relationship-driven rival seating
  preference would reopen R5 and is out of scope until ruled.

**Isolated product decisions a relationship slice carries as recommended first behaviour, not
approval (Q2 :621, Q3 :622, Q4 :623, quoted in §1(a)).** Under the B4 plan's continuation
("isolate only genuine new product decisions. No routine permission pause between settled
engineering tasks", :412-415) and the B.1 precedent (plan :514 "Q1 (no override) and Q3
(count-only) as recommendations, not approvals"), the slice proceeds on the recommendations and
lists them in its OPEN section; whether Fable instead packets Q2/Q3/Q4 to the Owner before
writing is Fable's call, not sim-core's.

**Plan-level decision (Fable, not Owner) required before any evaluator-touching writer:** the
`PROMISE_RULES_VERSION` literal for a non-certificate evaluator change (§1(d)). B.5 as scoped does
not touch the evaluator, so B.5 does not wait on it.

**Read-only research that can run meanwhile (no writer, no Owner):**
- The natural-chain attribution inventory for D5 (the file list in §2), pre-declared per the
  600 §3 step 2(d) pattern.
- A paper count of how many edges the standard seeds would mint by week 260 from the existing
  `firstTakes` roots of the genuine V29/V30 fixtures (six pairs per take; rival takes measured
  at "24 rival promises, 6 SATISFIED at week 216 on 2 first takes", plan :523) to size the root
  against the August envelope (§5.7 :488). A read-only probe over the fixtures needs a separately
  authorized node run; the paper bound is takes × 6.
- The expansion draft for B.5 in the B.1 pattern, and the contract-auditor's read-only audit of it.
- Reading `forecast.ts`/`reception.ts` for the exact seam where the result owner would later
  consume `pairChemistry` (R17), so B.5 exports the shape that seam needs.

---

## 4. Evidence limits

- Paper only. No test, typecheck, probe or generator was run; no natural-chain movement is
  measured, only reasoned from `bandsFor`/`chooseProposal` (`talentMarket.ts:779-886`).
- Line citations are to HEAD `40451858`; the companion citations are to the Revision-3 file in
  this worktree (its own header says symbols are cited at `592e926`, so its source line ranges are
  historical; I cited today's source instead wherever the two differ).
- The "no genuine V30 fixture" finding is a directory listing plus a grep for `genuine-v30` /
  `projection47-runtime` over `tests/` and the B4 evidence folder; a fixture stored elsewhere would
  not have been seen.
- The rival-friendship accrual claim (incumbency stickiness) is an inference from `decide()`'s
  employee selection (`hollywoodTick.ts:160-169`) and the six-seat roster, not a measurement.
- Record 628's three questions are read from `628-seating-qualified-checkpoint.md:78-90`; whether
  the Owner has since ruled on them was not checked beyond the B4 plan and headers named in the
  task (no record ≥ 644 was read).
- `pairChemistry` consumption and the result owner's constant were not designed; only the export
  shape is proposed.
- The waiver family-class order (mask inclusion) is my recommendation; no document states one.
