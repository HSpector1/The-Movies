# Dossier 11 — Gap Reconciliation: P15 Closure-Settlement Invariants vs the P16 Bankruptcy/Auction "Estate Step"

**Program:** Project: Studio P16 targeted independent research (READ-ONLY)
**Dossier:** 11-gap-p15-closure-settlement-estate-auction-reconciliation (follow-up gap-closing pass, gap 1)
**Date:** 2026-09-12
**Mode:** documentation and read-only reconnaissance only; no repository edits, no runtime

---

## 1. Scope

This is a targeted follow-up, not a fresh survey. It resolves one specific tension flagged by the
program: dossier 02 found that no P15 document contains "auction" or "liquidation" and that P15
closure-settlement "resolves or persists" everything, leaving nothing transferable; dossier 09
nonetheless built an "estate step" and a whole-studio/asset-lot auction architecture (§4.3) and three
paper scenarios (A, B, E, and F) that assume a rival's estate becomes purchasable after `dormant →
closure-settlement`. Assignment §2.M (HIGH-PRIORITY §2.N) and Paper Scenarios A/B/E depend on this
being buildable.

This dossier:

1. re-reads §12.3 of `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` and its Builder Annex
   companion verbatim, independently confirming (with a fresh, targeted grep) that no estate,
   unsold-asset, or holding concept survives closure-settlement under current approved P15 law;
2. checks whether P15 as currently approved defines any trigger that distinguishes ordinary
   "dormant/closed" from "bankrupt" (it does not — see §4b);
3. determines whether dossier 09's "estate step" is existing law or a new, not-yet-authorized
   extension, and if the latter, names the smallest correction that preserves §12.3's invariants;
4. confirms, at the code level, dossier 04's claim that the accepted runtime has no way to represent
   a rival's operations as "ended" while the rival remains a registered identity;
5. returns a final verdict with a confidence rating.

It does not redesign P16's auction/valuation system (dossier 09 already did that at the level of
detail the assignment wants) and does not reopen any settled P13-P15 boundary decision.

**Authority classes** follow dossier 02/09's convention: CURRENT/ACCEPTED CODE (`p12-accepted/`,
commit `13370d42…`); APPROVED DOCUMENTATION (`p13-docs/docs/`, commit `4734e409…`); OWNER-SELECTED NEW
DIRECTION (assignment §2, not yet recorded anywhere); FUTURE RECOMMENDATION (labelled
"PRELIMINARY RECOMMENDATION" in source, or my own inference, marked as such).

---

## 2. Method and sources consulted

**Read in full before starting:**
- `dossiers/02-authority-corporate.md` (405 lines, entire file) — establishes F1–F45, especially
  F12/F13/F19/F25/F34/F35/F36 and design inference #2 (the "pre-settlement estate window" idea this
  dossier tests and refines).
- `dossiers/09-valuation-finance.md` §4.3 "Auction price" (lines 286–312 of the saved copy), §4.4/§4.5,
  §5 Scenarios A, B, E, F (lines 362–527), §6 design implications and §7 open questions (lines
  530–581) — establishes the auction architecture under review and confirms it labels itself
  PAPER HYPOTHESIS / FUTURE RECOMMENDATION, not law.

**Read fresh for this task (sed ranges + full-file greps, this session):**
- `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` lines 440–540
  (§12.2 tail, §12.3 P15B corporate fate lifecycle, §12.4 P15C, §13.1–13.2 identity/roots) and lines
  605–628 (§16 distress remedy law) — read in full, not excerpted from dossier 02.
- `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` lines
  113–340 (§C.3 P15B corporate state table, §C.4 Entrant state, §C.5 P15C, §D.5 Corporate condition /
  transition-manifest sketch) — read in full.
- `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` §5 (lines 245–263), full section headings
  checked (`grep -n "^## \|^### "`) to confirm there is no separate "Horizon" section inside this
  document (the task's "Horizon §3" locator resolves to the *other* document below, exactly as
  dossier 02 F18 already cited it).
- `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3 "PLAYER BANKRUPTCY VS RIVAL FAILURE" and
  §4 "HOLLYWOOD ECOSYSTEM" (lines 56–80) — read in full, verbatim.
- `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` §6.3 "P15 boundary" (lines 205–216) —
  read in full.
- `p12-accepted/src/core/hollywoodTick.ts` lines 200–300 (the `advanceHollywoodWeek` per-business
  weekly loop, opening at line 221).
- `p12-accepted/src/core/hollywoodValidation.ts` lines 300–340 (the `requireFact` invariants
  surrounding line 331).

**Fresh greps run for this dossier (not reused from dossier 02):**
- `grep -n "estate" CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` → **0 hits**.
- `grep -n "estate" CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` → **0 hits**.
- `grep -n "auction\|liquidat" CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` →
  **0 hits** (dossier 02's F34 grep covered the main package and the whole `p13-docs` tree but did not
  separately report the Builder Annex; confirmed here).
- `grep -n "bankrupt\|receivership"` across the P15 package, the roadmap, and
  `CODEX-P13-P15-OWNER-RULINGS.md` — every hit is either the *player's* no-mandatory-hard-bankruptcy
  law, an *original-game parity* open question, or a generic list item; none defines "bankrupt" as an
  operational P15 state (full hit list in §4b below).

**What failed:** nothing. No web access was needed for this follow-up (it is a pure internal
document/code reconciliation); no repository file was created, edited, checked out, or run.

---

## 3. Findings

Numbering continues informally as **G1–G8** to avoid colliding with dossier 02's F-numbers, which are
cited directly where extended.

**G1. §12.3 verbatim — settlement is defined as universal resolution, not disposal into a holding
estate; a fresh, targeted grep confirms "estate" does not appear anywhere in either P15 document.**
- Source: APPROVED DOCUMENTATION — `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:472–475`.
- Verbatim: "A separately approved rival path may therefore add `dormant → closure-settlement →
  archived`, while the player graph remains recoverable dormancy unless the Owner separately
  authorizes a player terminal ending. **Settlement invariants remain strict for every applicable
  path: projects, obligations, contracts, people, films, immutable identity, and public history
  resolve or persist explicitly.**"
- Independently verified: `grep -n "estate"` returns zero hits in both `…PACKAGE-15.md` and
  `…PACKAGE-15-BUILDER-ANNEX.md`.
- Proves: every category settlement touches is either *resolved* (projects, obligations, contracts —
  i.e., cancelled/paid/terminated) or *persisted as history* (people's employment record, films,
  identity, public history — i.e., kept as an unowned, non-transferable historical fact per F30). There
  is no third bucket ("held pending sale"). This directly confirms, with independent verification
  rather than inherited trust, dossier 02's F34/F35 conclusion and answers task part (a): **no estate
  or unsold-asset concept survives closure-settlement under current approved P15 law.**
- Confidence: HIGH. Status: CONFIRMS dossier 02 F34/F35 (independently re-verified, not merely relied
  upon).

**G2. The Builder Annex's own state-transition table does not contain a "closed" row at all; the
`dormant → closure-settlement → archived` edge exists only as prose, gated a second time.**
- Source: `…PACKAGE-15-BUILDER-ANNEX.md` §C.3 (lines 113–129). The table's rightmost committed
  transition is `dormant/distress → active/recovery` (re-entry). Immediately below the table (lines
  125–129): "No P15B condition exists until Owner approval and a dedicated implementation charter.
  P12 owns every operating-state transition in this composite table. Its accepted law permits rival
  failure while the player has no mandatory hard-bankruptcy game-over. **A future rival extension may
  request `dormant → closed` only after exact Owner-approved trigger, settlement, archive, and
  entrant-floor law**; a player terminal ending is a separate decision. **Acquisition is never
  implied.**"
- Proves: the closure-settlement edge dossier 09 builds its estate step onto is not merely
  "unauthorized" in the abstract — it is not even present in the one artifact (the state table) that
  would receive an implementation charter. It is a *named future extension* requiring its own
  "exact Owner-approved trigger, settlement, archive, and entrant-floor law" before it exists at all.
  An estate/auction step would be a second, nested extension on top of that first one.
- Confidence: HIGH. Status: NEW (refines dossier 02 F12, which quoted the §12.3 prose graph but did
  not note that the Annex's authoritative table stops one edge short of it).

**G3. The distress-remedy law independently forecloses a "for sale while still active" state — the
gap is not only at the terminal edge.**
- Source: `…PACKAGE-15.md:619`: "Distress must have at least two legitimate recovery routes—such as
  reducing future obligations, delaying/cancelling an uncommitted plan, completing a conserved
  release, or entering dormancy—before it may demand attention. Each route belongs to a typed remedy
  capability family with the same eligibility predicate, conserved cost, timing, and state effect for
  player and rival studios... **Loans, bailouts, investors, forced sales, or acquisition are not
  implied.**"
- Proves: even before any closure/dormancy question, the *distress* stage's own remedy menu explicitly
  excludes "forced sale" and "acquisition" as legitimate recovery routes. There is no point anywhere
  in the currently-sketched lifecycle — warning, distress, recovery, or dormancy — where "put up for
  sale" is a lawful state effect. This reinforces G1/G2: the gap is structural across the whole
  lifecycle sketch, not a one-line omission at the archived edge.
- Confidence: HIGH. Status: CONFIRMS dossier 02 F23/F24 (extends them to the specific "forced sale"
  phrase, which neither dossier previously quoted).

**G4. "Bankrupt" is never an operational P15 state; it is one word in an undifferentiated list of
future-direction synonyms, and P15 as currently approved defines no trigger separating it from
ordinary "dormant/closed."**
- Source: `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md:56–72` (verbatim, current authority,
  Owner order 2026-08-18): "## 3. PLAYER BANKRUPTCY VS RIVAL FAILURE — The existing
  **no-hard-bankruptcy / no-receivership ruling applies to the player's studio.** It does **NOT**
  permanently prohibit future **rival** studios from experiencing distress, bankruptcy, receivership,
  sale, merger or acquisition, when and if the Hollywood Ecosystem is authorized. **This ruling adds
  no rival mechanics now.**" / "## 4. HOLLYWOOD ECOSYSTEM — Rival studios, rival films, multi-studio
  awards, film-library / IP economics, creative dynasties, acquisitions / subsidiaries and related
  competition are **legitimate long-term product directions**. They are **NOT currently authorized
  implementation scope.**"
- Cross-checked: every other "bankrupt"/"receivership" occurrence across `…PACKAGE-15.md`, the
  roadmap, and `CODEX-P13-P15-OWNER-RULINGS.md` is (i) the *player's* no-mandatory-hard-bankruptcy
  law (five separate restatements — dossier 02 F23/F19 already catalogued these), (ii) an
  original-game-parity open question ("no reliable inspected retail source establishes rival
  bankruptcy..." — `PACKAGE-15.md:246`), or (iii) the same "player closure/bankruptcy asymmetry" row
  label used as shorthand for the player's own terminal-ending question (`PACKAGE-15.md:799`,
  roadmap:678). None defines a threshold, predicate, or state named "bankrupt" that is distinct from
  "distress" or "dormant/closed."
- Proves — answers task part (b) directly: **No.** P15 as currently approved (not a hypothetical
  P15B) does not define any trigger distinguishing ordinary "dormant/closed" from "bankrupt." The only
  approved-if-authorized lifecycle is `active → warning → distress → recovery`, with `dormant`
  reachable from `distress` (Annex C.3), and even plain `closed` is not yet in that table (G2) — let
  alone a separate, harsher "bankrupt" branch. The Owner Horizon ruling's list ("distress, bankruptcy,
  receivership, sale, merger or acquisition") is a *permission grant for future design*, not a design;
  it explicitly "adds no rival mechanics now."
- Confidence: HIGH. Status: NEW (dossier 02 F18 quoted this same passage for a different purpose —
  establishing that rival M&A is legitimate direction — but did not test it for an operational
  bankrupt/closed distinction, which is what this follow-up specifically asks).

**G5. The Owner-approved roadmap already places acquisitions/valuation/mergers/library-transfer
*outside* P15B and inside P16+, which fixes where any correction must live.**
- Source: `CODEX-P13-P15-LONG-RANGE-ROADMAP.md:205–216` (§6.3 P15 boundary), verbatim: "**P15B —
  Corporate Fate:** if authorized, the same pre-terminal player/rival warning, distress and recovery
  gates, equivalent remedy capabilities, and later-entrant eligibility orchestration. P12 remains the
  sole active/dormant/closed registry and entrant initializer; accepted P12 law permits rival failure
  without mandatory player hard-bankruptcy, so exact rival closure and any player terminal ending are
  separate policy decisions." / "**PRELIMINARY RECOMMENDATION:** acquisitions, mergers,
  co-productions, labels/subsidiaries, library/IP ownership transfer, and valuation belong in P16+,
  not P15B."
- Proves: the package-boundary answer is already drafted by the project's own roadmap — P15B's job
  is trigger/eligibility/settlement/registry; P16's job is the transaction. This matches dossier 02's
  §4 inference #13 (P16C depends on the P15B distress/terminal slice) and directly shapes the smallest
  correction in §4c below: the correction must be phrased as "P15B settlement accepts one new input
  from P16," never as "P15B grows an acquisition system."
- Confidence: HIGH. Status: CONFIRMED (consistent with dossier 02 F21 and inference #13; this is the
  first time the exact §6.3 sentence has been quoted for this specific reconciliation).

**G6. Code-level confirmation #1 — the weekly business tick has no conditional gate of any kind; every
`RivalBusiness` runs its full weekly economy unconditionally.**
- Source: CURRENT/ACCEPTED CODE `p12-accepted/src/core/hollywoodTick.ts:221–273`
  (`advanceHollywoodWeek`). Verbatim opening: `for(const b of h.businesses) { if(week>=b.nextDecisionWeek)talent=staff(state,h,b,talent,week); decide(state,h,b,talent,week); operateStage(b); ...}`
  — the loop body (through line 273) unconditionally runs staffing, strategic `decide`, stage
  operation, production advancement, release resolution, theatrical-run settlement, standing decay,
  and, at the close of each iteration, payroll (`moveRivalMoney(b.account,'payroll', ...)`), overhead,
  and facility-Opex debits. No `if` in this loop tests any status/lifecycle field on `b`.
- Proves: there is no branch point where a "closed" or "dormant" business could be skipped even if
  such a field existed — which, per dossier 02 F14, it does not (`RivalBusiness` in
  `hollywoodTypes.ts:79–95` carries `account`, `operations`, `productions`, `runs`, `projects`,
  `policy`, nothing else). This is the direct, line-cited confirmation the task requested of dossier
  04's code-audit claim.
- Confidence: HIGH (code, read directly). Status: CONFIRMS dossier 04 (code audit) and dossier 02 F14
  from a second, independent code location.

**G7. Code-level confirmation #2 — an accepted validation invariant hard-requires exactly one live
business per entered rival identity; there is no schema value meaning "this rival's operations have
ended."**
- Source: CURRENT/ACCEPTED CODE `p12-accepted/src/core/hollywoodValidation.ts:331`. Verbatim:
  `requireFact(businesses.size === h.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).length,'entry missing business')`
- Proves: the accepted runtime treats "entered rival identity" and "has exactly one live business" as
  synonymous by construction. This is stronger than "no field exists to mark closure" (G6/F14) — it
  is an active, enforced equality that would *reject* any naive attempt to represent "rival N's
  operations ended" by simply removing its business row while leaving its identity in place (the
  count would no longer match), and G6 shows that adding a status flag to the surviving row would not
  by itself stop the weekly tick from continuing to run that business's full economy. Any lifecycle
  extension (dormancy, closure, or a pre-settlement estate step) therefore requires a real, additive
  schema and tick-loop change — not a flag — consistent with every "additive root, not a widened
  frozen leaf" rule dossier 02 catalogued (F9, F29, F30).
- Confidence: HIGH (code, read directly). Status: CONFIRMS dossier 04; NEW as the specific mechanism
  (equality invariant, not merely absence) that makes the gap concrete.

**G8. Dossier 09's "estate step" is presented as a recommendation dependent on an unapproved P15B
rival-closure policy, not as something it believed was already law — but its own scenario prose
contains an internal sequencing ambiguity that this dossier resolves.**
- Source: `dossiers/09-valuation-finance.md` §4.3 point 1 (line ~290–294): "**Estate step (before any
  lot).** At the P15/P12 closure-settlement boundary, the estate (a P16-owned settlement actor, not a
  studio) liquidates tangible at demolition credit and holds the overdraft." — this places the estate
  logically *before or coincident with* settlement. Contrast §5 Scenario F (line 517): "Corvid buys
  Halcyon (**Halcyon dormant → closure-settlement → lot**)." — read literally, this places the lot
  *after* settlement, which G1 shows leaves nothing to sell. Dossier 09's own §7 open questions #7
  ("Whether the estate catalogue of unsold properties should exist... and its reserve") and #10
  ("Rival closure itself remains an Owner-gated P15B policy; without it, only healthy and asset-lot
  transactions can exist") show dossier 09 already knew the rival-closure/estate mechanism was
  Owner-gated and unbuilt — it labelled the whole apparatus a FUTURE RECOMMENDATION / PAPER HYPOTHESIS
  throughout, per the assignment's own source-discipline requirement, and never asserted §12.3 already
  supports it.
- Proves: the two dossiers are not in factual disagreement about authority level; dossier 09 simply
  did not spell out, in the words the assignment now asks for, that its estate step is an *additive
  disposition value inserted before settlement finalizes*, not a step that runs on the settlement's
  output. That clarification is exactly what §4c below supplies.
- Confidence: HIGH (both texts read directly). Status: NEW — this is the specific reconciliation the
  follow-up task requested.

---

## 4. Direct answers to the four questions posed

### (a) What closure-settlement cancels/settles, verbatim, and whether any estate/unsold-asset concept survives it

Verbatim (`PACKAGE-15.md:474–475`): **"Settlement invariants remain strict for every applicable path:
projects, obligations, contracts, people, films, immutable identity, and public history resolve or
persist explicitly."** Every noun in that sentence is disposed of one of two ways: *resolve*
(projects are completed/cancelled, obligations are paid/discharged, contracts are terminated per
lawful category, people are released back to the market) or *persist as history* (films, immutable
identity, public history remain forever as an unowned historical record, per F11/F19/F30 — attributed
to the closed studio, never orphaned into a pool). A fresh, targeted grep of both the package and its
Builder Annex for the word "estate" returns **zero hits in either document**. **No estate or
unsold-asset concept survives closure-settlement under current approved P15 law.** (G1, G2)

### (b) Does P15 as currently approved define any trigger distinguishing "dormant/closed" from "bankrupt"?

**No.** The only approved-if-authorized state machine is `active → warning → distress → recovery`,
with a `dormant` branch off `distress` (Builder Annex §C.3) — and the table itself stops there; even
ordinary `closed` exists only as a named-but-ungated future prose extension ("`dormant → closed` only
after exact Owner-approved trigger, settlement, archive, and entrant-floor law," Annex:127–128), not a
committed row. "Bankrupt" and "receivership" appear exactly once as operative words, in the Owner
Horizon ruling's permission list ("distress, bankruptcy, receivership, sale, merger or acquisition"),
which is explicitly a *future-direction grant*, not a design ("this ruling adds no rival mechanics
now" — Horizon:62). Nowhere does any document define a cash, obligation, or duration threshold that
would make a studio "bankrupt" as opposed to merely "dormant." (G4)

### (c) Is dossier 09's "estate step" a new P15B/P16 extension requiring Owner authorization, and what is the smallest correction?

**Yes — it is new, on two counts, not one.** Per G2/G3, even the *closure-settlement edge itself* is
an unapproved "future rival extension" requiring its own Owner-approved trigger/settlement/archive/
entrant-floor law; an estate/auction step would be a second extension layered on top of that first,
still-unbuilt one. Per G5, the roadmap already places acquisitions/valuation outside P15B, so the
correction must not grow P15B into an acquisition system — it must let P16 supply one input that
P15B's existing settlement machinery already knows how to consume.

**Smallest correction (my inference, building on and sharpening dossier 02 §4 inference #2):**

Do **not** invent a holding "estate" actor that persists assets in limbo for N weeks — that would
require a genuinely new root, a new form of non-atomic interim state, and would sit awkwardly against
the "one candidate commits atomically, or nothing changes" law (F13, D.5 sketch). Instead:

1. **Sequence the transaction before the settlement manifest freezes, not after.** A P16 whole-studio
   or asset-lot transaction is only ever offered/cleared while the target is `dormant` (or `distress`,
   if the Owner extends eligibility that far) — i.e., strictly *before* any `dormant → closure`
   request is issued. This requires no new operating state; it only requires that the (still
   unauthorized) closure-settlement *request* be gated on first checking whether a P16
   `AcquisitionTransactionReceipt` already exists for that `StudioId` at that `GameState` revision —
   exactly the same "frozen source revision" pattern the participant manifest already uses (F13).
2. **Add exactly one new lawful disposition value to the existing typed-disposition vocabulary**,
   used only when step 1 found a cleared transaction: alongside whatever "cancel / release / settle"
   dispositions P10 (contracts/people), P11 (finance), P12 (projects/capacity/roster), P13 (research/
   adoption), and P14 (open cases) already apply during settlement (`PACKAGE-15.md:481–486`, quoted in
   dossier 02 F12/F13), each of those same five owners gains one additional disposition:
   **"assign to acquirer `StudioId`"** — contracts are assigned (a category already named as a lawful
   contract terminator in P12 design authority per dossier 02 F31: "lawful release, sale/assignment"),
   people's employer interval is transferred rather than ended, in-flight productions continue under
   the new employer, remaining cash/proceeds move per the transaction's agreed terms, and (P16, not
   P15) StoryProperty/library rights records the acquirer as new owner via a dated relation (never
   rewriting the creator, per F11). If step 1 found no cleared transaction, every owner's disposition
   is exactly what §12.3 already specifies today (cancel/release/settle), unchanged.
3. **Make the terminal edge a sibling, not a variant, of closure-settlement:** the registry lands on
   `acquired` (already named and distinguished from `closed` by settled Owner law — P12 §30 line 881,
   "Acquired is a later distinct outcome, never an alias for closed," HIS-013) when step 1 found a
   transaction, and on `closed`/`archived` otherwise. Both edges consume the *same* participant
   manifest shape (F13); only the disposition values and the terminal registry label differ.
4. **No forced-sale exploit and no §16 contradiction:** because the transaction must already have
   cleared (a willing bidder, an accepted price) before the settlement request is issued, this never
   makes "forced sale" an automatic *remedy* of distress (§16's prohibition, G3, is untouched — the
   sale is a voluntary P16 transaction that happens to exist by the time settlement is requested, not
   a P15B-invented remedy option); and because everything still resolves inside one atomic manifest,
   §12.3's "resolve or persist explicitly" invariant (G1) is preserved to the letter — "assign to
   acquirer" is just one more explicit resolution, not a suspension of resolution.

This correction needs a genuine new Owner authorization (both because the closure-settlement edge
itself is still unauthorized, per G2, and because the new disposition value is new scope), but it
does not reopen any settled boundary: P15B still exclusively owns the trigger, eligibility, and
settlement mechanics (G5, roadmap §6.3); P16 still exclusively owns the transaction, valuation, and
ownership relation (dossier 02 F4/F13); no estate-holding root, no second registry, and no violation
of the atomic all-owner-manifest law are introduced. Dossier 09's *whole-studio-lot* auction (§4.3
step 2) fits this correction directly — it is simply "the transaction that must clear before step 1's
gate opens." Dossier 09's *estate catalogue of unsold properties, purchasable indefinitely after
settlement* (its own open question #7) is a **larger, separate extension** — it would require an
actual persistent post-settlement holding root, contradicting the "or persist explicitly" resolution
requirement as written today — and should be flagged to the Owner as an explicitly bigger ask than
the minimal version above, which needs no such root (unsold lots, under the minimal version, are
simply released/cancelled exactly as current §12.3 already specifies).

### (d) Final verdict

**RECONCILABLE (not a confirmed structural contradiction, and not a misreading).** Confidence: HIGH.

Dossier 02's factual finding stands and is independently reconfirmed here: read literally, current
approved P15 documentation (§12.3, §16, and the Builder Annex's own state table) leaves no estate for
a P16 auction to act on, and does not even contain an approved plain-closure edge yet, let alone a
bankruptcy-specific one. Assignment §2.M/§2.N's premise and dossier 09's architecture therefore
describe genuinely new scope, not an implementation of existing law — this is a real gap, not a
misreading on dossier 09's part (dossier 09 itself flagged the dependency as open, per G8). But the
gap closes with a small, additive change that both prior dossiers were already gesturing toward: gate
the (still-to-be-authorized) closure-settlement request on an optional prior P16 transaction, and add
one new lawful disposition value ("assign to acquirer") to the same typed-disposition machinery §12.3
already specifies, landing on the already-distinct `acquired` terminal state rather than `closed`. No
existing settled invariant is weakened, no second registry or holding-estate root is required for the
minimal version, and the package boundary the roadmap already drew (P15B = trigger/eligibility/
settlement; P16 = transaction/valuation/ownership) is respected rather than crossed.

**Flag as a genuine remaining Owner decision** (this is new authorization, not implementation detail):
whether to authorize (i) the P15B rival-closure/settlement slice at all (a prerequisite dossier 02 and
dossier 09 both already named as open), and if so (ii) whether to add the minimal
"pre-settlement transaction gate + one new disposition value" described above, or (iii) the larger
"persistent estate catalogue" dossier 09 floated as its own open question #7. Nothing here should be
read as the Owner having already chosen among these.

---

## 5. Design implications for P16 (explicitly my inference, not project law)

1. **INFERENCE** — Charter language for a future P15B revision and the future P16C charter should
   both state the gate explicitly: "A closure-settlement request for a `dormant` studio first checks,
   at the frozen source `GameState` revision, whether a P16 `AcquisitionTransactionReceipt` already
   exists for that `StudioId`. If so, the settlement manifest's per-owner disposition is `assign to
   acquirer`; otherwise it is `cancel/release/settle` exactly as already specified." This one sentence
   is the entire correction; it should live in whichever document the Owner designates as the P15B↔P16
   interface note, not duplicated in both.
2. **INFERENCE** — Dossier 09's whole-studio-lot auction (§4.3 step 2) and Scenario B's clearing-bid
   mechanics need no change under this correction; only Scenario F's one-line gloss ("dormant →
   closure-settlement → lot") should be corrected in any future revision of dossier 09 to read
   "dormant → [P16 transaction clears] → acquired" to avoid the sequencing ambiguity found in G8.
3. **INFERENCE** — The "estate catalogue" (dossier 09 open question #7) should be treated as an
   explicitly separate, larger P16+ candidate, not bundled into the minimal correction above. Recommend
   the P16 charter default to "unsold lots are released/cancelled at settlement, exactly as current law
   specifies" and treat a persistent post-settlement shelf as a later enhancement requiring its own
   Owner ruling and its own additive root.
4. **INFERENCE** — Because G6/G7 show the accepted tick/validation code has zero conditional surface
   for "operations ended," any P15B implementation (dormancy, closure, or this correction) needs new
   fields/branches, not flags bolted onto `RivalBusiness`/`StudioIdentity` — consistent with dossier
   02's "additive root, not a widened frozen leaf" rule (F9/F29/F30). This is a build-order note for
   whoever eventually implements P15B, not a P16-scope decision.
5. **INFERENCE** — Because "acquired" is already a settled, distinct terminal label (P12 §30, HIS-013),
   the correction above requires no new enum value at the *registry* level beyond what dossier 02's F19
   already anticipated — only the *route* to that label (via a cleared P16 transaction found during a
   P15B settlement request) is new.

---

## 6. Open questions (genuine, not resolved by any inspected document)

1. Does the Owner authorize the P15B rival-closure/settlement slice at all? (Restates dossier 02 open
   question #1 and dossier 09 open question #10 — this dossier does not resolve it, only shows what
   the slice would need to contain if authorized.)
2. If authorized, does the Owner want the minimal "pre-settlement transaction gate" correction in §4c,
   or the larger "persistent estate catalogue" dossier 09 floated? These are different amounts of new
   scope and should be presented to the Owner as a genuine choice, not conflated.
3. What deterministic, bounded window (if any) is a P16 transaction allowed to run *before* a
   closure-settlement request is issued — i.e., how long may a studio sit `dormant` while a sale is
   negotiated before settlement simply proceeds unchanged? Dossier 09's paper auction uses "N rounds,
   one per week" as a hypothesis; no document sets this today.
4. Which package formally owns the one-sentence gate described in §5.1 above — a P15B revision, or the
   future P16C charter referencing P15B? Either placement is consistent with existing law; this is an
   authorship/filing decision, not a design one.
5. Does "assign to acquirer" as a contract disposition require the P14D placement decision dossier 02
   flagged (open question #8: is contract assignment at acquisition P14D scope or an ordinary P12
   employer transition)? This dossier does not re-resolve that; it only confirms the assignment
   category already exists in prior design authority (F31).

---

## 7. Source table

| # | Source | Class | Exact locator | Notes |
|---|---|---|---|---|
| T1 | `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` | APPROVED DOCUMENTATION | §12.3 L460–486 (fate lifecycle, settlement invariant); §16 L605–628 (distress remedy law, "forced sales... not implied" L619); §13.1 L510–529 (roots, identity law) | commit `4734e409`; read in full range, not excerpted secondhand |
| T2 | `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` | APPROVED DOCUMENTATION (research candidate) | §C.3 L113–129 (state table + "future rival extension" gate); §C.4 L131–144; §D.5 L256–316 (transition-manifest sketch) | commit `4734e409`; fresh grep for "estate"/"auction"/"liquidat" = 0 hits |
| T3 | `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` | Durable Owner ruling | §5 L245–263 (P16+ parking lot, verbatim) | commit `4734e409`; confirmed no "Horizon §3" subsection exists inside this file — that locator resolves to T4 |
| T4 | `p12-accepted/docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` | Owner ruling (2026-08-18, current authority) | §3 L56–65 ("PLAYER BANKRUPTCY VS RIVAL FAILURE," verbatim); §4 L67–80 ("HOLLYWOOD ECOSYSTEM," verbatim) | commit `13370d42`; this is the assignment's "Horizon §3" |
| T5 | `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` | APPROVED DOCUMENTATION (Owner-approved 2026-08-31) | §6.3 L205–216 (P15 boundary, "acquisitions... belong in P16+, not P15B") | commit `4734e409` |
| T6 | `p12-accepted/src/core/hollywoodTick.ts` | CURRENT/ACCEPTED CODE | L221–273 (`advanceHollywoodWeek`, unconditional per-business loop) | commit `13370d42` (src == `592e926b`) |
| T7 | `p12-accepted/src/core/hollywoodValidation.ts` | CURRENT/ACCEPTED CODE | L331 (`requireFact(businesses.size === ... 'entry missing business')`) | commit `13370d42` |
| T8 | `dossiers/02-authority-corporate.md` | Prior evidence dossier (this program) | full file (405 lines); F12, F13, F14, F19, F23, F24, F30, F31, F34, F35, F36 and §4 inference #2 | read in full for this follow-up |
| T9 | `dossiers/09-valuation-finance.md` | Prior evidence dossier (this program) | §4.3 L286–312; §4.4–4.5 L313–359; §5 Scenarios A/B/E/F L375–527; §6–7 L530–581 | read in full for the cited sections; labels its own architecture PAPER HYPOTHESIS / FUTURE RECOMMENDATION throughout |
| T10 | `p12-accepted/docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` row HIS-013 | ACCEPTED requirement register | L168 ("acquired remains distinct from closed") | cited via T8/F8; not independently re-read this session beyond what T8 already quoted verbatim |

---

*End of dossier. No repository file was created, edited, checked out, branched, built, tested or run.
The only file written is this dossier.*
