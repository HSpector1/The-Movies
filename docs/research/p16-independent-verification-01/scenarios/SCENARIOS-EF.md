# Paper Scenarios E & F — Serial Acquirer / Rival Acquires Rival

Run strictly under `design/ruleset-v2.md` (the Phase-3 repaired ruleset; rule IDs R01–R32 below are
that document's, cited as **R##**). All dollar and week figures in this file are **PAPER
HYPOTHESES** — illustrative round numbers in the game's paper dollar scale, not tuned constants and
not evidence of a balanced economy. No Owner-selected §2 direction is reopened; where a rule
produces a genuinely awkward or open result, that is reported as a finding, not silently smoothed
over. Status tags follow the assignment's vocabulary: CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED
BY OWNER DIRECTION, and every recommendation is explicitly labeled **INFERENCE**.

Both scenarios are additionally contingent, exactly as ruleset-v2 itself already states inline for
R26, on the **same not-yet-authorized P15B pre-settlement/terminal-state slice** (Owner Decision #1,
§20) and on **R13's H5 atomic terminal-state fix**. Nothing below assumes those are shipped; it
assumes they are *authorized on paper* for the purpose of running the arithmetic, exactly as the
ruleset's own Scenario A–D worked examples already do.

---

## SCENARIO E — Serial acquirer (three studios in ten years)

### E.0 Setup (PAPER HYPOTHESIS)

- Registry: fixed 1 player + 9 rivals (R15; F1.1/F15, `p12-accepted/src/core/hollywood.ts:111-201`,
  `hollywoodValidation.ts:72` — HIGH/CONFIRMED, "10-slot identities array is fixed, permanent,
  never appended to or shrunk"). Ten-year window = weeks 0–520.
- Player starting cash at week 0 of this window: **$4,000,000**; own weekly recurring obligations
  (payroll + overhead, paper): **$60,000/wk**; own usable roster capacity ceiling (production +
  development capacity, paper): **40 people**, currently staffed at 30.
- Deal #1 — week 104 (Year 2): healthy acquisition, Willingness `Open` (R24), target "Rival R1."
- Deal #2 — week 260 (Year 5): healthy acquisition, Willingness `Reluctant` (R24), target "Rival
  R2," a larger/more successful studio.
- Deal #3 — week 468 (Year 9): bankruptcy auction (R26), clean asset-lot default path, small
  distressed target.
- Between deals, the player's cash is assumed to grow from ordinary operations net of all
  obligations; the specific accumulated figures used below are stated explicitly at each step as
  a **paper assumption**, not derived from a tick-by-tick simulation — this scenario is a rules
  audit, not an economy-balance run.

### E.1 Deal #1 — week 104, Rival R1 (Open, healthy)

| Input | Value |
|---|---|
| SV excl. target cash (asset basis; R23) | $4,500,000 |
| Target cash | $300,000 |
| Independence-premium band for `Open` (R25; paper subdivision of the $9.7M/1.4–1.8× illustration in ruleset §12 Scenario C, extended here as a PAPER HYPOTHESIS to a second, less-reluctant state) | 1.2×–1.4×, taken at 1.3× |
| Target ongoing obligations (contract guarantees + committed cost; R18) | $700,000 |
| Target headcount | 12 (avg $2,000/wk each = $24,000/wk) |

**Transaction Price (R17-corrected formula):**
`(SV excl. cash × premium) + cash at par − obligations at full value (R18)`
`= (4,500,000 × 1.3) + 300,000 − 700,000 = 5,850,000 + 300,000 − 700,000 = $5,450,000` (floored ≥ $0 per R17 — not binding here).

**Net cash outlay** (price paid minus the target's own cash simultaneously received at par — the
Amazon/MGM par-transfer-then-add-back pattern §15 cites) `= (SV excl. cash × premium) − obligations
= 5,850,000 − 700,000 = $5,150,000`.

**Capacity bound on assumed headcount (R30).** Player roster 30 + inherited 12 = 42 > cap 40 →
**2 excess employees mandatory-terminated at close** (R30's "settlement is mandatory, not optional"
correction) at ordinary 50% cost, paper $80,000 total. Revised net outlay: **$5,230,000**.

**Cash reserve check (R30, 26 weeks).** Assume pre-deal cash (built from 2 years of ordinary
operations) = **$8,000,000**. Post-deal cash = 8,000,000 − 5,230,000 = **$2,770,000**. Combined
weekly obligations after Deal 1 = 60,000 (own) + 24,000 (inherited, unadjusted for the 2 terminated
for simplicity) = **$84,000/wk**. Reserve requirement = 26 × 84,000 = **$2,184,000**.
**$2,770,000 ≥ $2,184,000 → PASSES**, margin **$586,000**. The rule constrains but does not block
Deal 1.

**Active-rival floor (R29):** 9 → 8. Not binding (≥3 by a wide margin).

**Diminishing strategic value (R22, buyer-private only):** Rival R1 holds completed Technology III,
which the player lacks — buyer-relative avoided-research value **$2,000,000** (R22). This is a
private decision input, **not** part of SV/price (R23 keeps "technology shown only in the buyer's
private panel") — it explains *why* the player targeted R1, but does not appear anywhere in the
$5,450,000 headline.

### E.2 Deal #2 — week 260, Rival R2 (Reluctant, healthy, larger)

| Input | Value |
|---|---|
| SV excl. target cash | $6,500,000 |
| Target cash | $500,000 |
| Premium for `Reluctant` (R25 band from ruleset §12 Scenario C) | 1.4×–1.8×, taken at 1.6× |
| Target obligations (R18) | $1,200,000 |
| Target headcount | 20 (avg $2,500/wk = $50,000/wk) |

**Net cash outlay (before capacity correction)** = (6,500,000 × 1.6) − 1,200,000 = 10,400,000 −
1,200,000 = **$9,200,000**.

**Capacity bound (R30).** Player roster after Deal 1's mandatory settlement ≈ 40 (at cap, having
absorbed some facility growth to 45 by Year 5, paper). 45 + 20 = 65 > 45 → **20 excess employees**
must settle at close; 15 of them exceed even a generous retained slice — paper: **15 terminated**
at 50% of remaining guarantee, ≈ $2,500/wk × ~50 wks remaining × 0.5 × 15 ≈ **$937,500**. Revised
net outlay: **$9,200,000 + $937,500 = $10,137,500**.

**Cash reserve check (R30) — this is where the rule actually bites.** Assume the player accumulated
$9,500,000 of net operating cash flow between week 104 and week 260 (paper, net of the new $84,000/wk
obligation floor): pre-Deal-2 cash = 2,770,000 + 9,500,000 = **$12,270,000**. Post-deal cash =
12,270,000 − 10,137,500 = **$2,132,500**. Combined weekly obligations after Deal 2 = 84,000 (prior)
+ 50,000 (R2's payroll, net of the terminated 15 already reflected in the termination cost, not the
flow — paper, keep gross for a conservative check) = **$134,000/wk**. Reserve requirement = 26 ×
134,000 = **$3,484,000**.

**$2,132,500 < $3,484,000 → FAILS.** Under R30's affordability law, **Deal 2 as priced above is
illegal at week 260** with these paper balances — the buyer must either wait and accumulate more
cash, negotiate a smaller/partial deal (not offered by this ruleset — no partial stakes, R31), or
walk away. This is the concrete numeric demonstration the task asked for: the cash-reserve rule is
not decorative here, it genuinely throttles the pace of a three-deal-in-ten-years plan. Continuing
the scenario: assume the player waits an additional 40 weeks (to week 300) and accumulates a further
$1,800,000, reaching **$3,932,500** post-deal cash — **now $3,932,500 ≥ $3,484,000, PASSES** with a
thin $448,500 margin. The serial acquirer's real-world pace in this scenario is **week 300, not week
260** — R30 cost the plan 40 weeks, exactly the kind of friction §S asks anti-snowball levers to
produce without an arbitrary cap.

**Active-rival floor (R29):** 8 → 7. Still not binding.

**Diminishing strategic value:** if Rival R2 also held Technology III, its buyer-private avoided-
research value to *this* buyer would now be **$0** (already possessed) — R22's diminishing term is
real and mechanical. But R2's **SV/premium** ($6.5M × 1.6×) is **not** discounted for the fact this
is the buyer's second deal — nothing in R23/R25 reduces market-facing SV or the premium band based
on acquisition count. This matches ruleset-v2's own §Scenario-E prose ("nothing in the rules makes
later deals cheaper") and is flagged as a finding in E.3 below.

### E.3 Deal #3 — week 468 (post-delay: week 508), small distressed lot, R26 bankruptcy path

Clean asset-lot default (§13/R26): liquidation reserve = tangible + receipts = **$600,000**;
clears via sealed one-shot comparison at **$900,000** (paper, competing-bid pressure). No
obligations assumed, no headcount inherited (estate releases people to the open market, R26 default)
— **R18's netting and R30's headcount cap simply do not engage on this path**, because nothing is
assumed. Net cash outlay: **$900,000** flat. Cash reserve check: negligible new weekly obligation,
trivially passes.

**Active-rival floor (R29):** 7 → 6. Still not binding — comfortably above the floor of 3.

### E.4 The six levers, summarized numerically

| Lever | Rule | Deal 1 | Deal 2 | Deal 3 | Bites? |
|---|---|---|---|---|---|
| Cash reserve | R30 (26 wks) | $2.77M ≥ $2.18M pass, margin $586K | $2.13M < $3.48M **FAIL at wk 260**; passes at wk 300 margin $448K | trivial pass | **Yes — genuinely throttles pace (+40 weeks)** |
| Premium schedule | R25 | 1.3× (Open) | 1.6× (Reluctant, larger target) | n/a (auction, not premium) | **Rises with target health/size — later healthy deals are not cheaper** |
| Inherited obligations | R18 | $700K netted into price | $1.2M netted into price | $0 (none assumed, clean lot) | **Yes — removes the old "hidden windfall" reading; healthy-deal buyers pay full freight** |
| Capacity bound on headcount | R30 | 2 excess terminated, $80K | 15 excess terminated, $937.5K | 0 (none inherited) | **Yes — the more successful/larger the target, the harder this bites** |
| ≥3-active-rival floor | R29 | 9→8 | 8→7 | 7→6 | **No — never binds in this scenario; would need ~6 total consolidations from a 9-rival field before it becomes the active constraint** |
| Diminishing strategic value | R22 (buyer-private only) | Tech III worth $2.0M to buyer | Same tech worth $0 to buyer if duplicated | n/a | **Yes for the R22 tech term specifically; No for SV/premium generally — a real scope gap, see finding E.5-c** |

### E.5 Findings — snowball/exploit problems and rule gaps

**a) Closed exploit — unpriced-obligations flip (pre-correction risk, now closed).** Before R18's
correction, a naive reading would have let a buyer see only the $250,000-style headline in
ruleset's own §13 Scenario A illustration while separately absorbing $900,000 of guarantees as an
"invisible" second step. With R18 applied (as done throughout E.1–E.3), every headline number
already nets obligations at full value — **CONFIRMED closed**, verified arithmetically at both
Deal 1 ($700K) and Deal 2 ($1.2M).

**b) Closed exploit — capacity-bound headcount hoarding.** Without R30's mandatory-settlement
correction, a buyer could accumulate 42, then 65+ employees against a 40–45 capacity ceiling and
simply never act, holding a "hoarding lockout" (dossier 12's own named risk, `12-gap-p15-shared-
market-capacity-concentration-check.md`). R30's correction makes settlement automatic at
window-close — verified: 2 then 15 employees are force-terminated in this scenario without any
buyer action required. **CONFIRMED closed** for the *aggregate* case.

**c) Open rule gap — cherry-picking concentration (Owner Decision #2, already logged in
ruleset-v2 §20 item 2 / §17 R30 correction, reaffirmed here with numbers).** R30's cap bounds
*aggregate* headcount only. In Deal 2, the buyer terminates 15 of 20 inherited employees — **nothing
in the rules constrains which 15**. A rational serial acquirer's dominant strategy across all three
deals is: keep the single best Star from each target, dump the rest at the same $937.5K-style cost
regardless of composition. Across three deals this lets one player systematically concentrate the
*best* talent from nine rivals' worth of history while only ever paying the flat aggregate settlement
cost — exactly the concentration outcome R30 exists to prevent, aimed at value instead of raw count.
**This is the single most load-bearing open question this scenario surfaces** — more than Scenario A
or D, because only a serial, repeated acquirer can execute the cherry-pick pattern to its full effect.
Status: **QUALIFIED** — ruleset-v2 already names this gap (§17, §20 item 2) as pending; this scenario
adds the concrete three-deal numeric demonstration of why it matters most here.

**d) Finding, not a failure — SV/premium do not diminish across deals.** Section E.4's "diminishing
strategic value" row shows the *only* rule-level diminishing term is R22's buyer-private
avoided-research figure. The market-facing SV and premium (R23/R25) that actually set price are
target-specific and performance-driven, not acquirer-history-aware — Deal 2's premium (1.6×) is
higher than Deal 1's (1.3×) purely because Deal 2's target is healthier/more reluctant, not lower
because the buyer already made one deal. Ruleset-v2's own prose (§Scenario E) already states this
plainly ("nothing in the rules makes later deals cheaper") and explicitly declines to add a
"serial-acquirer wariness" ask-price escalation as a second hidden multiplier. **Status: CONFIRMED
by this arithmetic as an intentional, already-considered scope choice — not a new gap** — but the
assignment's §S "diminishing strategic value" lever should be understood by the Owner as narrower
in this ruleset than the phrase might suggest: it diminishes the buyer's private *reason* to buy
(R22 tech fit, and implicitly R06's co-holding library-value discipline as the buyer's collection
grows more complete), not the seller's *asking price*. No correction recommended — flagged for
Owner visibility only.

**e) New finding surfaced by this exercise — the anti-snowball frictions are asymmetric by
acquisition path, creating a real incentive gradient toward bankruptcy shopping.** Comparing E.1/E.2
against E.3: R18's obligation-netting and R30's headcount cap/reserve-eating frictions bite hard on
*healthy* whole-company deals (Deal 2 cost an extra $937,500 in termination and a 40-week delay) but
are essentially inert on the *clean bankruptcy asset-lot* path (Deal 3: no obligations, no headcount,
trivial reserve impact, because nothing is assumed by design — §13's own three-path menu). A
sufficiently patient serial acquirer therefore has a standing rational incentive to prefer waiting
for rivals to go distressed and buying clean lots over paying full freight for healthy targets whose
people and obligations trigger the heavier friction. This is not a rule contradiction — §13's
three-path menu is *designed* to offer a cheaper, obligation-free option — but it means the
concentration-of-power question in (c) is actually **easier**, not harder, via the bankruptcy route,
since a distressed target's best Star can be individually re-hired to the open market and picked up
without even the R30 aggregate-cap friction engaging (no obligations are "assumed," so no cap check
applies to an open-market hire that happens to follow a competitor's estate release). **Status:
NEW/INFERENCE** — worth Owner awareness alongside (c); no rule change is proposed here since it
would require re-litigating §13's already-settled three-path structure, which assignment §2.M
treats as SELECTED subject to Owner refinement, not as open.

**f) Floor genuinely does not bind at this scale.** R29's ≥3-rival floor is real machinery (verified
it is checked at every deal in E.1–E.3) but at a 9-rival starting field, three consolidations only
reach 6 — it would take roughly **six** total successful acquisitions from this exact starting
field before the floor becomes the operative constraint, assuming P15B natural attrition contributes
none in the meantime (R29's own correction already notes ordinary P15 closure is a *separate*,
currently-unguarded vector on the same registry — see §20 decision #1). This scenario's honest
conclusion: **for a 3-deal/10-year serial acquirer, the floor is a distant backstop, not the
operative brake — R30 (cash + headcount) is what actually restrains this player.** That is a useful,
previously-implicit fact this exercise makes explicit and numeric.

### E.6 Verdict — Scenario E

**Handles the scenario without contradiction: YES.** Every rule invoked (R17, R18, R22, R23, R24,
R25, R26, R29, R30) composes coherently across three sequential deals with no arithmetic conflict,
double-count, or dead-end. **One rule (R30's cash reserve) is shown to genuinely bite** at Deal 2 and
delay the plan by 40 weeks under these paper numbers — the anti-snowball system is not merely
decorative. **One already-logged rule gap (talent-concentration cherry-picking, §20 Owner Decision
#2)** is the dominant open risk a serial acquirer specifically exposes, more acutely than any
single-deal scenario could show; this analysis does not reopen it, only sharpens the numeric case
for why it matters. **One new, non-blocking finding (bankruptcy-shopping incentive gradient, E.5-e)**
is offered as Owner-visibility context, not a proposed rule change.

---

## SCENARIO F — Rival acquires rival

### F.0 Setup

- World key illustrative: `abc`. Registry per F1.1/F15: `studio-abc-player`, `studio-abc-r01` … `
  studio-abc-r09` — fixed, ten identities, minted once at `initializeHollywood`, "never appended to
  or shrunk" (`16-gap-rival-ai-acquisition-code-feasibility.md`, HIGH/CONFIRMED,
  `hollywoodValidation.ts:72`).
- **Rival A** = `studio-abc-r01`: founded week 0, created 40 historical films across the campaign,
  three of which have individually varied ownership histories used below. By week 300, Rival A's
  P15 condition is distressed (assumed authorized for this paper exercise, exactly as R26 states its
  own contingency inline) and its public Willingness State reads `Open` (R24).
- **Rival B** = `studio-abc-r03`: healthy, evaluates and bids on Rival A via its `decide()` branch
  (R28) — the same acquisition-transaction law a player-directed bid would use.
- **Rival C** = `studio-abc-r05`, **Rival D** = `studio-abc-r07`: third parties used only in the
  history-preservation ledger (F.2) to demonstrate encumbrance handling.

### F.1 Symmetry proof — same pricing/bidding law, same transfer bundle, same history records

**Price, computed with the identical R17/R18/R25 formula used for the player in Scenario E:**

| Input | Value |
|---|---|
| SV(A) excl. cash (asset basis, distressed target) | $4,200,000 |
| Cash(A) | $150,000 |
| Premium, `Open` (R25, same band as E.1) | 1.25× |
| Obligations(A) (R18) | $650,000 |

`Transaction Price = (4,200,000 × 1.25) + 150,000 − 650,000 = 5,250,000 + 150,000 − 650,000 =
$4,750,000.` Net cash outlay to Rival B = `5,250,000 − 650,000 = $4,600,000` — computed with **the
exact same arithmetic** as E.1/E.2, no isPlayer term anywhere (R28: "no isPlayer multiplier,
exemption, or surcharge anywhere in the transaction, pricing, or disclosure law").

**Affordability, computed with the identical R30 formula:** Rival B pre-deal cash (paper) =
$7,000,000; own weekly obligations $70,000/wk; inherited Rival A payroll 10 × $2,200/wk = $22,000/wk;
combined $92,000/wk; reserve requirement = 26 × 92,000 = **$2,392,000**. Post-deal cash = 7,000,000 −
4,600,000 = **$2,400,000 ≥ $2,392,000 → PASSES**, margin **$8,000** — razor-thin, exactly the kind of
outcome R30 is supposed to produce for *any* bidder, AI or player, when it is genuinely tested rather
than assumed generous. The AI is bound by the same arithmetic wall the player was almost bound by in
E.2 — this is the numeric core of the symmetry proof, not merely an assertion.

**The one and only asymmetry in the whole rule set, confirmed scoped correctly (R16/R28):** R28's own
corrected text carries an inline carve-out — "except that the player's own studio is never an
eligible acquisition target under R16." Applied here: neither Rival A nor Rival B is the player, so
**the carve-out does not engage** and the transaction proceeds under fully general law. Checked the
opposite direction too: nothing analogous exists to make the *player* ineligible as a *buyer* of
Rival A — R16 only ever removes the player from the target side. **CONFIRMED**: the sole asymmetry in
this ruleset is the one the Owner explicitly wanted (§2.J "no player-only M&A superpower," R16
"player never a target") and it runs in exactly one direction, verified by inspecting both directions
of R28's text rather than assumed.

**Same transfer bundle (R17–R22), applied identically:**
- R17: Rival A's $150,000 cash → Rival B's cash at par, netted into the single reconciled
  transaction above, identical formula to a player-directed deal.
- R18: Rival A's $650,000 obligations subtracted at full value from the headline price — same
  formula.
- R19: Rival A's 10 employees get new contracts under Rival B, `signingBonus: 0`, reason code
  `assumed` — the identical end-old-row/mint-new-row idiom "already proven in `staff()` for
  renewals," confirmed reusable as-is for acquisition-triggered transfer
  (`16-gap-rival-ai-acquisition-code-feasibility.md`, HIGH/NEW).
- R20: Rival A's active productions re-form under Rival B, `productionId`/`conceptId` preserved.
  **Confirmed easier, not merely symmetric, here**: rival `RivalBusiness.productions` uses the
  identical `Production`/`ScriptDevelopment` shape on both sides, and rival facilities are always
  placement-ledger-free with `requiresSetBinding=false` (`16-gap-...md`, HIGH/QUALIFIED,
  `hollywoodTick.ts:69-82`, `hollywood.ts:98-105`) — so dossier 04's "single hardest constraint" for
  player-crossing re-parenting (a real placement-ledger/set-binding reconciliation) **cannot arise**
  in a rival-to-rival transfer. This is a genuine, confirmed *difficulty* asymmetry, not a *law*
  asymmetry — the rule text applied is identical; only the engineering cost of applying it differs,
  and it differs in the *easier* direction for this scenario.
- R21: Rival A's abstract capacity liquidates to a credit exactly as it would for a player-target
  acquisition — same rule, same formula, no land to consider on either side (rivals never hold a
  land object at all, per accepted code).
- R22: any of Rival A's completed research grants Rival B verified knowledge only — same uniform
  rule R22 already requires to apply "across every acquisition path," healthy or bankrupt, player-
  or rival-directed.

**Same history records (schema-level, not just outcome-level):** the `CorporateEvent` and
`ownershipEvents` row shapes used below (F.2, F.3) carry no `isPlayer`-conditioned field anywhere —
`{studioId, week, kind, successorStudioId?, brandRetained}` and `{property, right, from, to, week,
event}` are the *same* two record shapes a player-directed acquisition would produce, just populated
with two rival StudioIds instead of one rival and the player.

### F.2 History preservation — concrete ledger (the R14 correction made numeric)

Corporate event at week 300 (Rival B chooses Absorb-Operations-and-Retain-Brand, Model D, R11/R12):

```
{ studioId: 'studio-abc-r01', week: 300, kind: 'acquired',
  successorStudioId: 'studio-abc-r03', brandRetained: true }
```

Displayed exactly per the assignment's own §2.I worked-example style (R14):
**"MERGER/ABSORPTION — [Rival A's name] — Independent operations ended: [year] Week 300 —
Successor owner: [Rival B's name]."**

- **Acquired ≠ closed (HIS-013, `02-authority-corporate.md` line 114, verbatim: "acquired remains
  distinct from closed"):** `kind` is literally `'acquired'`, never `'closed'` — checked and
  distinct. Rival A's `StudioId` is never deleted, renamed, or removed from the fixed ten-slot
  registry (F1.1) — it persists forever as a historical identity even though it stops operating.
- **Creator studioId unchanged (R03/R15):** every one of Rival A's 40 historical films keeps
  `FilmIdentity.studioId = 'studio-abc-r01'` forever — this never changes to `r03`, at week 300 or
  ever after, regardless of who later owns any given film's rights.
- **Successor relation is display-only — the actual test case:**

| Property | Rights held by Rival A? | Real current holder at week 300 (per R03 `ownershipEvents`) | What a naive `successorStudioId`-only read would wrongly conclude |
|---|---|---|---|
| **P1** (1970s original, R1+R2 both) | Yes, still held | Transfers to Rival B at closing (new R17-style ownershipEvents rows) | Correct by coincidence here |
| **P2** (library rights only) | No — Rival A sold P2's R2 to **the player** at week 210 under an ordinary R07–R10 sale, 90 weeks before this acquisition | **The player**, unchanged by this acquisition — nothing about Deal F touches P2 | **WRONG**: would incorrectly show Rival B (or worse, "whoever now owns Rival A's identity") as P2's holder |
| **P3** (R1, with an outbound exclusive R3 licence to **Rival C** granted week 150, running to week 670) | Yes, R1 | R1 transfers to Rival B **encumbered** (R04c: "the licence survives the sale unchanged") — Rival C's exclusive continuation rights to P3 continue undisturbed through week 670 | A read that ignored R04c would wrongly assume the buyer gets unencumbered rights, silently voiding Rival C's licence |
| **P4** (an inbound Licence: Rival A is the *grantee* of **Rival D's** own exclusive R3 on a different property, unrelated to A's own catalog) | N/A (A holds a licence, not the underlying right) | **Reverts to Rival D at closing** unless P4's terms permit assignment or Rival D consents (R20 correction) | A plain "contracts transfer intact" reading would wrongly hand Rival D's exclusive grant to Rival B without Rival D's consent — exactly the backdoor R20's correction closes |

This table is the numeric proof the task asked for: `successorStudioId` correctly answers "who is
Rival A's corporate successor for display," and the `ownershipEvents` ledger (P1–P3) plus the R20
reversion rule (P4) are the only correct sources for "who currently holds this specific right" —
never the corporate-event chain (R14's own restated correction, §9).

### F.3 Registry/business handling — fixed ten identities, "operations ended" representation

- **Fixed registry, verified, not merely asserted:** `hollywoodValidation.ts:72` enforces
  `studios.size===10 && identities.length===10` (`16-gap-...md`, HIGH/CONFIRMED). After this
  acquisition the registry **still has exactly 10 identities** — Rival A's slot is not vacated,
  reused, or reassigned to a would-be 11th entrant; it becomes a **terminal** `RivalBusiness` state.
- **The real code-level collision this scenario surfaces (not a ruleset defect, a build
  prerequisite already named by R13):** `hollywoodValidation.ts:331` enforces a strict bijection
  "businesses.size === count of entered-rival identities" with **no exception for an absorbed-but-
  historically-entered rival** (`16-gap-...md`, HIGH/NEW). Simply deleting Rival A's `RivalBusiness`
  row after week 300 would fail this validator today. This is exactly why R13's H5 terminal-state fix
  is named as a **blocking prerequisite** for P16C (ruleset §5/§13): the "operations ended"
  representation is not just the `CorporateEvent` record in F.2 — it is *also* a terminal flag on
  Rival A's own `RivalBusiness` row, and per R13's correction both must commit as **one atomic
  participant-manifest transition** across P10/P11/P12/P13/P14, not as a validator-and-tick-loop-only
  patch. Scenario F is therefore gated on R13 exactly as Scenario A/B/E are gated on R26/P15B — no
  new gate, but this scenario is where the *registry-bijection* half of that gate becomes concrete
  and testable.
- **"Operations ended" is thus two coordinated facts, not one:** (1) the public `CorporateEvent`
  (F.2) for history/UI, and (2) the internal terminal `RivalBusiness` state (R13/H5) that every
  consumer — the weekly tick, the save validator, the R29 active-rival floor, and any future
  AI-bid-eligibility check — must treat as the single source of truth for "operating," so a cheap
  "frozen zombie row" implementation cannot satisfy R13's text while still being counted as active
  by R29 or by a later bidder's own eligibility check.

### F.4 RNG determinism — derived purpose, no calendar keying

Accepted code's existing RNG law (F9.2, `p12-accepted/src/core/rng.ts:12-19,36-77`, HIGH/CONFIRMED):
`stream(seed, purpose, key)` is a pure, stateless function, never touching `state.rngState` (the one
stateful stream, reserved for reception only — `tick.ts:27-29`); every purpose is additively
versioned (`'-v1'`) and, per the file's own comment, **"KEYED ON THE MINT ORDINAL, NEVER ON A WEEK OR
YEAR."** Existing rival decisions already follow this: `stream(seed, 'hollywood-v1',
'${studioId}:package:${ordinal}')` (`hollywoodTick.ts:155,180`).

Rival B's decision to evaluate/bid on Rival A must follow the same law, per the design implication
already logged in the evidence base (`00-KEY-FINDINGS.md:809`, `16-gap-...md`): a **new** RngPurpose
literal, e.g. `'ownership-v1'`, keyed as:

```
stream(seed, 'ownership-v1', 'studio-abc-r03:acquisition:studio-abc-r01:1')
```

— bidder, action, target, **round ordinal** (the Nth acquisition-relevant decision point for this
exact bidder/target pair) — **never** `week` or a calendar date.

**Concrete failure mode if this were keyed on `week` instead** (the thing this rule must forbid):

1. **Replay drift.** If the key were `stream(seed,'ownership-v1', 300)` (bare week), two saves with
   identical decision history up to week 259 could diverge the moment either loads mid-week versus
   on a tick boundary and re-derives "current week" by a different path — silently changing whether
   Rival B bids at all. Ordinal-keying is invariant to *when in the week* the check runs, because the
   ordinal only advances when a real decision is actually evaluated, not on a calendar tick.
2. **Migration/rebalance fragility.** `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]`
   (`calendar.ts:3`) is fixed per campaign today, but any future rebalance of arrival weeks or a
   week-numbering migration would, under calendar-keying, **retroactively change past AI-bid outcomes
   on replay** — exactly the save-compatibility break the `'-v1'` versioned-purpose convention exists
   to prevent (F9.2's own stated rationale, `rng.ts:44-46`). Ordinal-keying is immune because it
   never reads the calendar at all.
3. **Deterministic-bid guarantee stays intact.** Dossier 09's own finding that "AI bids are
   deterministic functions of state" (`09-valuation-finance.md:511`, "no save-scumming benefit")
   depends on this: a save-scummed reload that changes nothing about the bidder/target/round-ordinal
   inputs must reproduce the identical bid decision. Calendar-keying would not guarantee this across
   a mid-week reload; ordinal-keying does, by construction.

**One genuine prerequisite this proof surfaces (already named in ruleset-v2, not new here):** every
existing rival decision function (`staff()`, `decide()`) reads only its own business, shared talent,
and `state.market/era` — **no `RivalBusiness` currently reads another `RivalBusiness`'s data anywhere
in the engine** (`16-gap-...md`, HIGH/NEW, `hollywoodTick.ts:85-137,139-210,213-290`). An AI
acquisition-bid decision requiring Rival B to read Rival A's data is therefore the engine's **first
cross-business read**, and must be explicitly charter-authorized — exactly what ruleset-v2's own R28
correction area already flags ("whoever eventually authorizes the first-ever cross-business read AI
bid-decision function this section itself flags as needing explicit authorization"). This is a real,
already-logged prerequisite, not a defect in the RNG law itself: the RNG-purpose discipline above is
cheap and zero-blast-radius to apply *once* that authorization exists (`00-KEY-FINDINGS.md:800`,
"7+ purposes already added this way with no changes to prior ones").

**Rule-text gap worth naming (small, drafting-only):** ruleset-v2's Rule List (R01–R32) does not
itself state the "new derived purpose, never calendar-keyed" requirement anywhere in its own text —
it is currently only an implication carried by *already-accepted code's* RNG law, cited via the
dossiers rather than written into the ruleset. **Recommendation (INFERENCE, minor):** add one
sentence to R24 or R28's own text — "any stochastic element this rule introduces uses a new,
versioned `RngPurpose` keyed on exact IDs and a transaction/round ordinal, never on `week` or a
calendar date, per accepted `rng.ts` law" — so the constraint is legible from the ruleset alone
rather than requiring a reader to also find dossier 04/16. This is a documentation completeness gap,
not a new Owner decision.

### F.5 Verdict — Scenario F

**Handles the scenario without contradiction: YES.**

- **Symmetry (F.1): PROVEN**, not merely asserted — identical R17/R18/R25/R30 arithmetic applied to
  a rival-buys-rival deal produces the same formula shapes as the player-directed deals in Scenario
  E, and the *only* asymmetry found (R16's player-as-target exclusion, carved into R28's own text) is
  the one the Owner explicitly selected, confirmed to run in one direction only.
- **History preservation (F.2): PROVEN** with a concrete four-row ownership ledger showing creator-
  studioId permanence, acquired≠closed, and the successor-pointer-is-display-only correction all
  holding simultaneously on the same acquisition.
- **Registry/business handling (F.3): PROVEN**, with the one real code-level collision
  (`hollywoodValidation.ts:331` bijection) correctly identified as exactly what R13's already-named
  H5 fix exists to resolve — no new gate, but this scenario is where that gate becomes concrete.
- **RNG determinism (F.4): PROVEN** in principle (ordinal-keying prevents the two named failure
  modes) but **gated on the same not-yet-authorized cross-business-read charter step ruleset-v2
  already flags at R28**, and **a small documentation gap** is identified: the ruleset's own rule
  text should state the derived-purpose/no-calendar-keying constraint explicitly rather than leaving
  it implicit in accepted code and the dossiers.

No failure (absurd, exploitable, or contradictory result) was found in Scenario F. Two items are
worth Owner/engineering visibility, both already substantially anticipated by ruleset-v2 itself: the
H5/bijection prerequisite (F.3) and the cross-business-read charter step (F.4) — neither is a new
Owner decision beyond what §20 already lists.

---

## Cross-scenario summary table

| Scenario | Handles without contradiction? | Key numbers (paper) | Failure found | Rule gap found |
|---|---|---|---|---|
| E — Serial acquirer | Yes | Deal1 net $5.15M (+$80K cap-settlement); Deal2 net $9.2M (+$937.5K cap-settlement), R30 reserve **fails at wk260** ($2.13M<$3.48M), passes at wk300 ($3.93M≥$3.48M); Deal3 auction clears $900K; rivals 9→8→7→6 | None (all rules compose; R30 shown to bind for real) | Talent-concentration cherry-pick (already logged, §20 #2) sharpened numerically; new non-blocking finding: bankruptcy-shopping incentive gradient (E.5-e) |
| F — Rival acquires rival | Yes | Rival-to-rival deal $4.75M price / $4.6M net outlay, R30 reserve passes by only $8,000 — same formula as player deals | None | Small documentation gap only: RNG derived-purpose/no-calendar-keying rule is implied by accepted code but not stated in ruleset-v2's own rule text (recommend one added sentence to R24/R28) |
