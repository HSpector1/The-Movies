# Dossier 16 — GAP 6: Rival-to-rival AI acquisition, code-level feasibility check

Assignment §2.J ("when should an AI bid," "preventing every healthy rival from immediately
consolidating") and §2.S (anti-snowball). Follow-up/gap-fill dossier; extends dossiers 02, 04, 09
rather than repeating them. READ-ONLY. No repository edits, no runtime, no implementation.

---

## 1. Scope

Three code-grounded questions, exactly as posed by the gap:

**(a)** Could the existing deterministic per-tick RNG-purpose architecture add an "acquisition bid
decision" without breaking replay-determinism law?

**(b)** Would a rival acquiring another rival's `StudioIdentity`/`RivalBusiness` collide with the
fixed 1-player+9-rival registry (no second registry, no eleventh studio slot, per dossiers 02/04)?

**(c)** Does dossier 09 §5 Scenario F's assumed player/rival symmetry actually hold against these
code facts, or does it need a named correction?

Out of scope (already covered elsewhere, cited not repeated): the pricing/valuation ladder and the
five-condition bid heuristic itself (dossier 09 §4/§4.5), the general identity-primitive audit
(dossier 04 §3 Q1-Q10), the P15↔P16 authority boundary and the ≥3-active-rival floor (dossier 02
F14/F25/F45), comparator evidence on AI-acquires-AI (dossier 07, none found).

## 2. Method & sources consulted

- Read in full: `p12-accepted/src/core/rng.ts` (206 lines), `hollywoodTick.ts` (317 lines),
  `hollywood.ts` (201 lines).
- Targeted `grep -n` / `sed -n` reads: `hollywoodTypes.ts` (`StudioIdentity`, `HollywoodState`,
  `RivalBusiness`, `RivalMoneyKind`, `RivalProjectCosts`), `hollywoodValidation.ts` (registry-size,
  business-bijection, and receipt-ownership predicates), `types.ts` (`Production`, `ScriptProject`,
  `ScriptDevelopment`), `hollywoodPolicy.ts` (`chooseIndustryPackage` signature), `tuning.ts`
  (`HOLLYWOOD_DECISION_WEEKS`, `HOLLYWOOD_CONTRACT_WEEKS`).
- Skimmed before starting, to extend rather than repeat: dossier 00 (§ open questions, comparator
  AI-acquires-AI line), dossier 02 (F13-F15, F25, F45 — registry/floor law), dossier 04 (F9.2 RNG
  law; F1.1-F1.5 identity primitives; F6.1-F6.3 production/facility hazards; F10.1 projection
  privacy; the H1-H3 hazard list), dossier 09 §4.5 (rival-AI bidding heuristic) and §5 Scenario F
  (rival-acquires-rival paper hypothesis).
- Nothing failed; no web fetch was needed for this code-audit gap. No repository worktree was
  touched; no test/build/game was run.

Confidence convention: HIGH = verbatim code read at the cited line; MEDIUM = code read plus a
design-fit inference; LOW/UNVERIFIED stated as such.

---

## 3. Findings

**G1. `RngPurpose` is a closed string-literal union; `stream(seed,purpose,key)` is a pure, stateless
function that never touches `state.rngState`; the file's own history shows purposes added
additively at least seven times post-M9 with no changes to prior purposes.**
- Source: `rng.ts:23-67` (comment log: `migrate`, `develop` added D-9; `hiring` added D-11;
  `discovery-v1`, `casting-v1`, `presence-v1`, `screenplay-v1`, `hollywood-v1` added later, each
  "DERIVED-ONLY, so minting never advances `state.rngState`"); `rng.ts:204-206`
  `export function stream(seed,purpose,key){ return RngStream.fromSeed(\`${seed}::${purpose}::${key}\`) }`.
- Proves: adding one more literal, e.g. `'ownership-v1'`, to the `RngPurpose` union and calling
  `stream(seed,'ownership-v1',key)` at a new decision point is the established, zero-blast-radius
  pattern for adding stochastic behavior — it cannot desynchronize a save's `rngState`, cannot
  change any earlier purpose's output (each purpose+key hashes independently), and needs no save
  schema change (derived streams are "never threaded through save"). This directly confirms
  dossier 04 F9.2's inference by an independent full read of the file it cites, and answers gap
  question (a) in the affirmative at the RNG-mechanism layer.
- Confidence: HIGH. Prior-prose status: **CONFIRMED** (dossier 04 F9.2 already stated this; this
  finding upgrades it from a targeted read to a full-file verification and supplies the literal
  addition pattern).

**G2. RNG-purpose keys in this codebase are chosen from stable, non-recyclable identifiers or
ordinals — never from a bare calendar week — even though nothing in `stream()` itself forbids a
week-only key.**
- Source: `hollywoodTick.ts:155` `key:\`${b.studioId}:package:${ready.id}\`` (script ordinal via
  `ready.id`, not week); `:180` `stream(state.seed,'hollywood-v1',\`${b.studioId}:package:${ordinal}\`)`;
  `:200` `key:\`${b.studioId}:screenplay:${ordinal}\``; `:238`
  `stream(state.seed,'hollywood-v1',\`${p.id}:reception\`)` (production id, not week);
  `rng.ts:59-61` states the strongest version of the rule for `screenplay-v1` specifically:
  "KEYED ON THE MINT ORDINAL, NEVER ON A WEEK OR A YEAR... that is what makes a screenplay
  era-clean."
- Proves: nothing in `stream()`'s pure-function contract requires avoiding week in a key (two
  different weeks legitimately produce two different, valid, deterministic streams); the
  discipline is a codebase convention for collision-safety and (for screenplay-v1) era-cleanliness.
  A new `'ownership-v1'` purpose for an acquisition-bid decision should therefore be keyed on a
  stable pair such as `${bidderStudioId}:acquisition:${targetStudioId}:${roundOrdinal}` (an
  auction-round or approach-attempt ordinal), not on `week` alone — using week alone risks two
  unrelated decisions in the same week (e.g., two different candidate targets) silently drawing
  from the identical stream if the key does not also disambiguate the target and the round.
- Confidence: HIGH on the cited code; MEDIUM on how strictly the "never a week" phrasing
  generalizes beyond `screenplay-v1`'s stated era-cleanliness reason. Prior-prose status: **NEW**
  (no dossier previously extracted this key-discipline requirement for a hypothetical ownership
  purpose).

**G3. Every existing rival decision function is single-business: `staff()` and `decide()` in
`hollywoodTick.ts` read only the calling business `b`, the shared `talent` array, and
`state.market`/`state.era`. No code path anywhere in `hollywoodTick.ts` or `hollywood.ts` has one
`RivalBusiness` read another `RivalBusiness`'s data.**
- Source: `hollywoodTick.ts:85-137` (`staff`, params `state,h,b,talent,week` — `h` is passed only to
  read the *shared* `employment`/`activeEmploymentOrdinals` arrays and to call
  `operatingReserve(b,h,week)`, never to inspect a different business's own fields);
  `:139-210` (`decide`, same parameter shape); `advanceHollywoodWeek` (`:213-290`) iterates
  `for (const b of h.businesses)` strictly one business at a time with no cross-reference to a
  sibling `b2`.
- Proves: an AI "should I bid on rival X" decision is architecturally a *new kind* of read, not an
  extension of an existing pattern — it is the first case in this codebase of one business's
  decision function needing another business's data (target `RivalAccount.cash`, `standing`,
  `films`, `RivalProjectCosts`, `activeScriptOrdinals`, etc. — the paper BPV formula in dossier 09
  §4/§5 draws on exactly these fields). This is not blocked by anything observed, but it is new
  surface area the P16 charter must explicitly authorize and shape (see D3 below), because dossier
  04 F10.1's privacy law ("Rival cash, salaries, budgets, policy, forecasts... are HIDDEN") governs
  only `bridge/industry.ts`, the read-only *player-facing* projection — it says nothing about, and
  does not constrain, what the simulation's own tick code may read from `state.hollywood` internally.
- Confidence: HIGH on the fact (full-file read of the only two rival-decision functions); MEDIUM on
  the inference that F10.1 does not constrain it (F10.1's header is explicit about being a
  `bridge/` read boundary, but I did not exhaustively prove no other engine-side privacy gate
  exists). Prior-prose status: **NEW** — extends dossier 04 F10.1 to a case that dossier did not
  examine (engine-internal cross-business reads for a *decision*, as opposed to the projection).

**G4. The `identities` array is exactly 10 entries, minted once, and permanent; nothing in
`hollywood.ts` or `hollywoodValidation.ts` ever removes, renames, or appends to it.**
- Source: `hollywood.ts:111-136` (`initializeHollywood` builds the player identity plus
  `HOLLYWOOD_STARTING_MANIFEST.studios.forEach` for exactly the nine template rows, once);
  `enterRival` (`:139-201`) only flips `enteredWeek`/`founding` on an *existing* identity found by
  `h.identities.find(s=>s.studioId===studioId)` — it never pushes a new `StudioIdentity`;
  `hollywoodValidation.ts:72` `requireFact(studios.size===10 && h.identities.length===10,'exactly
  player plus nine reserved studios')`.
- Proves: an acquired rival's `StudioId` and its `StudioIdentity` row are structurally incapable of
  disappearing from the registry under current code, and there is no path to mint an eleventh —
  which is exactly the Owner's "historical StudioId does not disappear or get rewritten" principle
  (assignment §2.F) already holding as a hard invariant, not merely a design intention. This
  directly answers gap question (b)'s literal framing: there is **no eleventh-slot collision**,
  because a rival-acquires-rival transaction was never going to need a new slot — the target's
  permanent identity slot is exactly what should persist afterward.
- Confidence: HIGH. Prior-prose status: **CONFIRMED** (restates dossier 02 F13/F25, dossier 04
  F1.1, from an independent full-file read rather than a grep excerpt).

**G5. The registry DOES enforce a strict bijection between "entered rival identities" and "active
`RivalBusiness` rows" — in both directions — which is the actual, previously-uncited collision
point for absorbing a rival.**
- Source: `hollywoodValidation.ts:93`
  `requireFact(!h.businesses.some(b=>b.studioId===s.studioId),'inactive identity has business')`
  (an identity with `enteredWeek===null` must have **no** business row — the direction the earlier
  program dossiers already cited); AND, not previously cited by dossier 02 or 04 in this framing,
  `hollywoodValidation.ts:331`
  `requireFact(businesses.size===h.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).length,'entry missing business')`
  — the *reverse* direction: every rival identity with a non-null `enteredWeek` **must** have
  exactly one live `RivalBusiness` row, with no exception.
- Proves: under current accepted code there is exactly one durable state for an entered rival
  ("operating, with one business row") and no second state ("entered historically, but no longer
  independently operating"). A naive implementation of "Corvid absorbs Halcyon" that simply deletes
  Halcyon's `RivalBusiness` from `h.businesses` while leaving `identities[Halcyon].enteredWeek`
  untouched (as it must remain, per G4/the Owner's immutability principle) fails `'entry missing
  business'` immediately. This is the exact code-level mechanism that makes dossier 02 F14's
  recommendation ("`StudioIdentity` has NO status/dormant/closed/owner field... a P16 status field
  is needed") load-bearing rather than cosmetic: the status field is not just descriptive, it is
  what a widened version of *this specific validator* would need to test
  (e.g. `businesses.size===...filter(enteredWeek!==null && status!=='absorbed').length`), OR the
  alternative minimal-diff path is to keep one frozen/inert `RivalBusiness` row present for an
  absorbed studio (its `productions`/`activeScriptOrdinals`/etc. emptied, its account frozen) so the
  count still balances without touching this predicate at all. Both are small, but the choice is a
  genuine P16 design decision this dossier surfaces for the first time, not previously named in
  dossiers 02/04/09.
- Confidence: HIGH on the two cited predicates (verbatim). Prior-prose status: **NEW** — sharpens
  and gives a concrete code anchor to dossier 02's F14/F45 recommendation ("make the active-rival
  floor a hard eligibility predicate," "add a status field"); does not contradict either finding.

**G6. `RivalBusiness.productions`, `.development` and the shared `HollywoodState.employment` array
use the *identical* TypeScript shapes (`Production`, `ScriptDevelopment`/`ScriptProject`) as the
player's own containers, and both rivals draw from one shared `employment` array distinguished only
by a `studioId` field on each row — whereas a player-crossing transfer must also cross into
player-only companion structures.**
- Source: `types.ts:225-239` (`Production`, used verbatim by `state.studio.activeProductions` and,
  per `hollywoodTick.ts` import line 25, by `RivalBusiness.productions`); `types.ts:680-705`
  (`ScriptProject`/`ScriptDevelopment`, same shared type, used by `state.scriptDevelopment` and by
  `hotDevelopment()`/`RivalBusiness.development` in `hollywoodTick.ts:38-47`); `hollywood.ts:44-53`
  (`rivalEmployment`) and `hollywoodTick.ts:48-50` (`currentEmployees`) both read the ONE shared
  `HollywoodState.employment` array filtered by `.studioId`; the existing renewal/replacement idiom
  at `hollywoodTick.ts:93-107` (end old row with `endedWeek:week`, push a new row with a new
  `contractId` embedding the *receiving* studioId, week, and person) already performs exactly the
  "move a person to a new employer row in the same array" operation a transfer needs, just gated by
  a renewal-window check instead of a transaction event.
- Proves: a rival-to-rival asset move is a same-shape, same-array operation on both ends — unlike a
  player-acquires-rival move, which dossier 04's F6.3 catalogued as needing a full *re-formation*
  (new player-side `ProductionWorkflow`, a `placement.ts` ledger witness, `requiresSetBinding`
  reconciliation, a re-minted `state.scriptDevelopment` row, and receipt-law changes) precisely
  because the player's containers are NOT the same shape as `RivalBusiness`'s. Rival→rival transfer
  reuses the codebase's own existing renewal idiom for contracts, and needs only script/production
  *id re-minting* (per dossier 04 H1) plus a `RivalProjectCosts`/receipt-ownership transfer rule
  (per dossier 04 F3.2's `LedgerKind`/`RivalMoneyKind` widening) — it does not need a new
  cross-shape reformation pipeline at all.
- Confidence: HIGH on the shared-type/shared-array facts (read directly in three files); MEDIUM on
  "does not need reformation" as a full engineering claim (I did not independently re-verify every
  one of dossier 04's seven F6.3 sub-hazards against the rival-only case; see G7 for the one hazard
  I did specifically re-check). Prior-prose status: **NEW** — this is the dossier's central answer
  to gap question (c): it identifies a genuine mechanical *asymmetry*, but one that makes
  rival-to-rival transfer easier than the player-crossing case dossier 04 already flagged as hard,
  not a new difficulty of its own.

**G7. Rival productions never acquire a placement-ledger row or a `requiresSetBinding` flag in the
first place — the single hardest constraint dossier 04 named for re-parenting a production
(`placement.ts:1815-1818`'s ledger-correlation law) cannot arise for a rival-to-rival move, because
neither side's production was ever placement-ledgered.**
- Source: dossier 04 F6.2(a) (rival productions always pass `requiresSetBinding=false` via
  `addManagedProductionWorkflow(b.operations,production,occupied)`, `hollywoodTick.ts:166`,
  contrasted with the player's `state.nextSetId>0` path) and F6.2(c) ("four fixed abstract capacity
  rows... no placement, no property, no sets"), both re-verified in this pass by re-reading
  `hollywoodTick.ts:69-82` (`operateStage`) and `hollywood.ts:98-105` (`rivalStartingFacilities`,
  which returns four fixed capability rows with no facility-placement fields at all — no `x`,`y`,
  no lot-position, nothing `placement.ts` could key a ledger row to).
- Proves: dossier 04's F6.3 hazard #3 (the "single hardest constraint" for a player-directed
  re-parenting) is a player-lot-specific hazard, not a general production-transfer hazard — a
  rival-to-rival transfer of an in-flight production has no ledger row to reconcile and no
  set-binding flag to resolve on either the giving or receiving side, because rival facility
  capacity was abstract on both ends from the moment the production was greenlit.
- Confidence: HIGH (fact re-confirmed at the cited lines). Prior-prose status: **QUALIFIED
  narrowing of dossier 04 F6.3** — F6.3's "feasible only as re-formation" verdict was written and is
  correct for a *player-directed* re-parenting; it does not describe, and should not be read as
  describing, the rival-to-rival case, which this dossier finds structurally easier.

**G8. `rivalCapacityOpex`/`rivalStartingFacilities` give a rival's "physical plant" no land, no
placement, and no per-unit sale value in current code (F7.1, re-confirmed) — so the §2.G
"physical property after acquisition" design problem, which is hard for the player's single lot, is
nearly moot when the acquired party is a rival rather than the player.**
- Source: `hollywood.ts:88-105` (`rivalCapacityOpex` keys weekly cost purely off `capability` type,
  from a fixed lookup table; `rivalStartingFacilities` returns four rows with only
  `{id,name,capability,capacity}` — no location, no upgrade tier per dossier 04 F7.2, no basis for
  a resale price); cross-checked against dossier 04 F7.1 (`PropertyState` is singular, "the studio
  owns its whole lot from week zero," and rival facilities are "abstract capacity rows").
- Proves: assignment §2.G's candidate treatments for target real estate (liquidate / player chooses
  sell-or-liquidate / remote financial-asset-only / transferable equipment) are all questions about
  a *physical, placed* facility that a rival, in the current architecture, simply does not have.
  Absorbing a rival's four abstract capacity rows requires no lot-liquidation ceremony at all under
  present code — the acquiring rival's own `rivalStartingFacilities` capacity either already covers
  the combined slate or a capacity increment can be added as a plain capex line, mirroring how a
  rival's own entry already pays one lump `capacity` cost (`hollywood.ts:158-160`). This narrows,
  for the rival-to-rival case specifically, one of the assignment's harder open design areas.
- Confidence: HIGH on the code facts; MEDIUM on treating this as fully resolving §2.G for
  rival-to-rival (the *player*-facing side of §2.G, i.e. what happens when the player's own single
  lot receives an acquired rival's capacity, is untouched by this finding and remains exactly as
  hard as dossier 04 already described). Prior-prose status: **NEW** design-scoped narrowing;
  applies only to the rival-buys-rival branch of §2.G, not to player-buys-rival.

**G9. `RIVAL_MONEY_KINDS` is a fixed nine-member list with no acquisition-related kind, and
`moveRivalMoney` throws on any kind not in `RivalFinancePeriod.movements`'s exact-key shape — this
holds identically regardless of which studio is the buyer.**
- Source: `hollywood.ts:15-16`
  `export const RIVAL_MONEY_KINDS: readonly RivalMoneyKind[] = ['capacity','signing','payroll',
  'overhead','facilityOpex','development','production','marketing','studioRevenue']`;
  `hollywoodTypes.ts:47-48` (matching `RivalMoneyKind` union); `hollywood.ts:31-42`
  (`moveRivalMoney` — `period.movements[kind]+=amount` on the fixed-key object, so an unlisted kind
  is a type error, not a runtime option).
- Proves: exactly dossier 04 F3.2's finding, re-confirmed by an independent full-file read of
  `hollywood.ts`. No asymmetry here between player-buys-rival and rival-buys-rival: whichever side
  is buyer or seller, both need new symmetric kinds before any acquisition cash can move lawfully.
- Confidence: HIGH. Prior-prose status: **CONFIRMED** (restates dossier 04 F3.2 with independent
  verification, no new claim).

**G10. No comparator evidence exists for AI-acquires-AI (dossier 07), so the deterministic-bid
mechanism this dossier grounds (G1-G3) is the *only* concrete design lead in the whole research
program for how an AI decision to bid would actually run inside this specific engine.**
- Source: dossier 00 line 378 (open questions): "Does any comparator let an AI rival acquire another
  AI rival? None found; MGT2 players hoped for it but no patch note confirms it (relevant to §2.J)."
- Proves: dossier 09 §4.5's five-condition heuristic is not a distillation of any shipped
  comparator's AI — it is original design work for this project. That makes the code-feasibility
  check in G1-G7 above (confirming the heuristic's inputs — post-close cash, BPV vs. price, a
  deterministic ordering key — are all values the engine already computes or could compute from
  existing per-business state) the load-bearing verification step for §4.5, not a formality.
- Confidence: HIGH (restating dossier 07's own stated search result). Prior-prose status:
  **CONFIRMED** (no new search performed; cited to frame why G1-G9 matter).

---

## 4. Direct answers to the three gap questions

**(a) Yes.** Adding an "acquisition bid decision" is architecturally trivial and low-risk under the
existing RNG law: append one literal to `RngPurpose` (e.g. `'ownership-v1'`), call
`stream(seed,'ownership-v1',key)` at the decision point, key on `${bidderStudioId}:acquisition:
${targetStudioId}:${roundOrdinal}` (never on bare week — G2), and never write to `state.rngState`.
This is the exact, seven-times-precedented pattern the file already documents (G1). The genuinely
new work is not the RNG call — it is the cross-business read the decision function needs (G3), which
has no precedent anywhere in `hollywoodTick.ts` today and must be an explicit, charter-authorized
capability, not an incidental side effect of "just calling `stream()` one more time."

**(b) No collision at the registry (identity) layer; a real, specific collision at the operating
(business) layer.** The fixed 10-slot `identities` array (G4) never needs to grow, shrink, or
rename — the target's `StudioId` persisting forever is exactly what current validation already
requires, not something P16 has to newly guarantee. The actual collision is G5's bijection
predicate (`hollywoodValidation.ts:331`, "entry missing business"): a rival cannot go from "has a
business" to "has none" while staying "entered," under the literal current code. This is a small,
precisely locatable amendment (either a `StudioIdentity.status`-aware predicate, per dossier 02
F14's own recommendation, or a frozen placeholder-business convention), not a structural rewrite.

**(c) Scenario F's symmetry claim holds where it was actually tested (the bidding/pricing law) and
was silent on the part that turns out to matter most (the asset-migration mechanics) — so it needs
a named supplement, not a correction of any stated fact.** Dossier 09 §5 Scenario F's numbers and
process description ("the lot sheet... is the same read model the player sees," "every `PersonId`
keeps its P12 employer-history interval," a same-seed harness "must reproduce the identical
clearing bid") are consistent with everything found here and are achievable with a `decide()`-style
pure function (G1, G9's kinds aside). But Scenario F never engages the mechanical path an
acquisition-close actually walks, and this dossier's principal finding (G6/G7) is that that path is
**not symmetric with the already-analyzed player-buys-rival case dossier 04 F6.3 covered** — it is
easier, because both sides of a rival-to-rival transfer share identical container shapes and rival
facilities were never placement-ledgered to begin with. Framed against the assignment's own
symmetry law ("Different strategies are allowed; different legality is not," §2.J): the *legal*
outcome (what transfers, what history is preserved) should indeed be identical whether the buyer is
the player or a rival, and nothing found here threatens that. What differs, and what Scenario F
should be read as silent on rather than wrong about, is the *implementation difficulty*, which is
lower for rival-to-rival than for the player-crossing case — a fact worth keeping in mind if P16
sequencing ever considers shipping rival-to-rival bidding before full player-directed acquisition
tooling, since the harder half of the problem (G7's ledger/set-binding reconciliation) simply does
not arise on that slice.

---

## 5. Design implications for P16 (explicitly my inference)

1. Treat the acquisition-bid decision as a new, named, additive branch alongside (not inside) the
   existing `decide()` function's staffing/package/commission branches, gated by the same
   `nextDecisionWeek` cadence or a dedicated cadence constant (`TUNING.HOLLYWOOD_DECISION_WEEKS` is
   currently `1`, i.e. checked every week) — this keeps the new logic additive and reviewable
   in isolation, matching the file's existing one-branch-per-decision-kind shape.
2. Charter must explicitly state that the engine's own tick logic may read another business's full
   private state for a bid-eligibility check even though the *player-facing* projection
   (`bridge/industry.ts`, dossier 04 F10.1) continues to hide that same data from the human player
   when the human is the one evaluating a bid. This is a new asymmetry-of-information rule (AI
   sees true numbers to bid rationally; player sees only the disclosed lot sheet) that should be
   written down once, not left implicit.
3. Resolve G5 explicitly and name the choice in the P16 charter: either (i) widen
   `StudioIdentity` with a status field and the `hollywoodValidation.ts:331` predicate together in
   the same additive save-version step (per dossier 04 F9.1's "one additive root per version"
   precedent), or (ii) define "absorbed" as a frozen, emptied, but still-present `RivalBusiness` row
   (no productions, no active script ordinals, account frozen) so the existing bijection predicate
   needs no edit at all. (ii) is the smaller diff; (i) is more legible to future systems that will
   want to ask "is this rival currently operating" directly. Either is sufficient; silently deleting
   the business row is not an option under current law.
4. Sequence rival-to-rival acquisition mechanics as the cheaper first slice if P16 is ever split
   into sub-deliverables: it exercises the transaction/RNG/bijection law (G1-G5, G9) without also
   requiring the player-lot placement/set-binding reconciliation (G7) that player-directed
   acquisition needs regardless of which side the player is on.
5. Reuse the existing end-old-row/push-new-row contract idiom (G6, `hollywoodTick.ts:93-107`)
   verbatim for acquisition-triggered contract transfer between two rivals — it is already proven
   in production for the renewal/replacement case and needs no new mechanism, only a new *trigger*
   (an acquisition-close event instead of a renewal-window check).
6. Do not let G8's finding (rival physical plant is trivial to absorb) leak into player-side
   design: it only shows that the rival-to-rival branch of §2.G is easy. The player's own single-lot
   constraint when the player is buyer, and the reverse (what happens to the player's placed
   facilities if a rival ever could acquire the player, which remains an out-of-scope, unapproved
   direction per dossier 02's Builder Annex C.3 quote — "a player terminal ending is a separate
   decision... acquisition is never implied"), are untouched by this dossier and stay exactly as
   dossier 04 described them.

---

## 6. Open questions

1. Should the acquisition-bid RNG purpose be `'ownership-v1'` specifically (matching dossier 04
   F9.2's own suggested name), or folded into `'hollywood-v1'` as one more keyed use within the
   existing purpose? Either is legal under G1; naming is a P16 authoring choice, not a determinism
   question. (Recommend a new versioned purpose, consistent with the file's own practice of one
   purpose per "system," e.g. `casting-v1`/`presence-v1`/`screenplay-v1`.)
2. Is there any engine-side privacy gate for rival-to-rival state reads that this pass did not find
   (G3's confidence is MEDIUM on this specific point)? Not disproven, only not found in
   `hollywoodTick.ts`/`hollywood.ts`; a fuller sweep of `hollywoodPolicy.ts`/`forecast.ts` internals
   was out of this gap's scope.
3. Which of G5's two remediation paths (status field + amended predicate, vs. frozen placeholder
   business row) does the Owner/charter prefer? This dossier surfaces the choice; it does not
   resolve it, per this program's rule against reopening or pre-deciding Owner-facing design
   choices.
4. Does the assignment's §2.J "same transaction law" requirement extend, even hypothetically, to a
   rival someday being able to bid on the *player*? Current Builder Annex language (dossier 02)
   treats that as a separate, unapproved decision; this dossier assumed rival-acquires-rival only,
   consistent with the gap's own framing and with Scenario F's own setup (Corvid buys Halcyon, not
   Corvid buys the player).

---

## 7. Source table

| # | Source | Type | Locator | Used for | Confidence |
|---|---|---|---|---|---|
| S1 | `p12-accepted/src/core/rng.ts` | CURRENT/ACCEPTED CODE | :23-67 (purpose log), :204-206 (`stream`) | RNG purpose addition pattern, statelessness | HIGH |
| S2 | `p12-accepted/src/core/hollywoodTick.ts` | CURRENT/ACCEPTED CODE | :48-137 (`staff`), :139-210 (`decide`), :213-290 (`advanceHollywoodWeek`), :93-107 (contract renewal idiom), :155/180/200/238 (key discipline) | single-business decision scope, key discipline, contract-transfer idiom, absence of cross-business reads | HIGH |
| S3 | `p12-accepted/src/core/hollywood.ts` | CURRENT/ACCEPTED CODE | :15-16, :31-42 (`moveRivalMoney`, `RIVAL_MONEY_KINDS`), :88-105 (facility opex/rows), :107-136 (`initializeHollywood`), :139-201 (`enterRival`) | fixed 10-identity registry, no acquisition money kind, abstract rival facilities | HIGH |
| S4 | `p12-accepted/src/core/hollywoodTypes.ts` | CURRENT/ACCEPTED CODE | :6-16 (`StudioIdentity`), :47-54 (`RivalMoneyKind`/period), :69-77 (`RivalProjectCosts`), :105-114 (`HollywoodState`) | no status field on identity; shared shapes | HIGH |
| S5 | `p12-accepted/src/core/hollywoodValidation.ts` | CURRENT/ACCEPTED CODE | :72 (10-identity), :93 (inactive-identity-no-business), :205 (duplicate/unknown business), :331 (entry-missing-business bijection) | registry-size and business-bijection predicates — G5's central evidence | HIGH |
| S6 | `p12-accepted/src/core/types.ts` | CURRENT/ACCEPTED CODE | :225-239 (`Production`), :680-705 (`ScriptProject`/`ScriptDevelopment`) | shared player/rival type shapes | HIGH |
| S7 | `p12-accepted/src/core/hollywoodPolicy.ts` | CURRENT/ACCEPTED CODE | :32-47 (`chooseIndustryPackage` signature) | deterministic evaluate-then-choose pattern an acquisition decision would mirror | MEDIUM |
| S8 | `p12-accepted/src/core/tuning.ts` | CURRENT/ACCEPTED CODE | :27-28 | decision cadence constant | HIGH |
| S9 | Dossier 02 (`02-authority-corporate.md`) | PRIOR DOSSIER | F13-F15, F25, F45 | registry immutability, no-second-registry law, ≥3-rival floor | HIGH |
| S10 | Dossier 04 (`04-code-audit.md`) | PRIOR DOSSIER | F1.1-F1.5, F3.2, F6.1-F6.3, F9.2, F10.1, H1-H3 | RNG law (pre-confirmation), production/facility hazards, identity hazards | HIGH |
| S11 | Dossier 09 (`09-valuation-finance.md`) | PRIOR DOSSIER | §4.5, §5 Scenario F | rival-AI bidding heuristic and rival-acquires-rival paper hypothesis under review here | HIGH |
| S12 | Dossier 07 (`07-comparators-C.md`) via dossier 00 line 378 | PRIOR DOSSIER | open questions | confirms no comparator precedent for AI-acquires-AI | HIGH |
