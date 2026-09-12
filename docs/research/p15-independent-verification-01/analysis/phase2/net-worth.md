# P15 Paper Scenario — Studio Net Worth / Valuation

**Task:** Direction C (Owner-selected P15 direction, 2026-09-11) — "Game calculates and displays
meaningful STUDIO NET WORTH / VALUE." Supports deliverable sections 1 (value concepts) and 4
(worked scenarios / Power Ranking financial-lane input).
**Role:** independent P15 analyst, READ-ONLY paper scenario. Nothing here is authorized; every
number is PROVISIONAL/HYPOTHETICAL unless cited to code.
**Base code:** accepted TypeScript `592e926` (Owner-accepted P12 R05), read via
`scratchpad/accepted-592e926/`. Evidence: `out/phase1/code-finance.md`, `out/phase1/finance-logic.md`,
`out/phase1/comp-ranking.md` §2, `out/phase1/prior-claims.md`, corrected throughout by
`out/phase1-verify/_DIGEST.md`.

---

## 1. What "value" can mean, and why the game must show more than one number

Four different questions hide behind the word "value" (finance-logic.md §1.1, textbook-sourced,
HIGH confidence):

| Concept | Answers | Formula (game terms) |
|---|---|---|
| **Cash** | "Can I pay this week?" | `studio.cash` — already exists |
| **Book Net Worth** | "Have I built more than I owe, on paper?" | assets at *recorded* value − liabilities |
| **Enterprise/Equity Value** | "What might the whole operating business be worth to a buyer?" | multiple × trailing earning power, adjusted for cash/debt |
| **Sale price** | "What did a specific buyer actually pay?" | negotiated; does not exist without a P16+ transaction |

The project must not collapse these into one figure. Book Net Worth is a *record of the past*
(what was paid, minus depreciation, minus what is owed); Enterprise Value is *a bet about the
future* (earning power); Cash is *now*. A studio can be book-rich and commercially dying (Worked
Example iii below) or book-negative and commercially thriving (Worked Example iv). Showing only
one number would misinform the player in exactly the direction Direction C warns against ("Book ≠
enterprise value/sale price. Player must understand the number").

Comparator precedent for showing more than one number, all HIGH-confidence, OFFICIAL/SOURCE-CODE
tier (`comp-ranking.md` §2):

- **OpenTTD** (source code): *Asset value* → *Company Value* (`assets − current_loan + money`,
  graphed quarterly) → *bankruptcy sale value* (`assets + money`, loan excluded — the acquirer
  does **not** inherit it) → *hostile-takeover price* (`assets + loan + max(0,−money) + 2×trailing
  years of profit`). Four numbers, four different questions, all from one asset/loan/cash base.
- **GearCity** (official wiki `gm_stocks`): *Evaluation* = `Money − Total_Debt + construction
  costs + vehicle inventory + design costs/10 + share holdings` (an asset-at-cost book value) sits
  beside a separately formulaed *share price* (book- and revenue-blended) and a still separate
  *acquisition-cost* premium. A "Networth" report breaks the figure into six categories
  (`_DIGEST.md` comp-ma completeness pass, wiki `gui_reports`, OFFICIAL, HIGH).
- **Capitalism Lab**: market cap, financial statements, and a personal-net-worth Billionaires list
  are three separate surfaces; bankrupt-company acquisition is priced at "a discounted price,
  reflecting its distressed financial condition" (≤40 words, `comp-ranking.md`:144).
- **The original 2005 game**: no valuation existed at all. "Capital" (cash in the bank) was one
  literal 24%-weighted lane of a five-factor Studio Rating on a fixed nominal $50,000–$1,600,000
  scale (Prima printed p.46; `_DIGEST.md` code-finance completeness pass, RETAIL SHIPPED, HIGH).
  This is the retail precedent for folding wealth into a rating — and the precedent the accepted
  code's P12A/P15 law has already deliberately departed from (Power Ranking excludes cash;
  `P15-PACKAGE.md`:803).

Recommendation: adopt the OpenTTD/GearCity pattern — one book number, one range-labeled forward
estimate, never merged, never a single "Studio Rating."

---

## 2. What 592e926 legitimately offers to build from

Everything below is CURRENT ACCEPTED CODE (`code-finance.md`, corrected by `_DIGEST.md`). No
balance sheet, liabilities register, or valuation selector exists today; a Book Net Worth reader
would have to be assembled entirely from already-computed pure values.

| Item | Basis available today | file:line | Note |
|---|---|---|---|
| Cash | literal | `types.ts:291-296`; `tuning.ts:70` (INITIAL_CASH 20,000,000) | reconciles to ledger |
| Facility | ledger `constructionCapex` row (== today's catalog by construction) | `types.ts:1042-1058`; `placement.ts:1719-1721` | no persisted per-asset price field; refund fraction 0.5 flat (`tuning.ts:1599-1613`) |
| Set | ledger `setCapex` row | `types.ts:1336-1356`; `sets.ts:506-512` | refund fraction 0.35 flat (`tuning.ts:816`) |
| Land / founding plant | none — `ownedFromStart: true`, "cost nothing to keep" | `types.ts:864-872, 1005-1009` | no field to read |
| Locked future run revenue | forward *estimate*, provenance class D ("conditional…never a guarantee") | `economyView.ts:95-110`; `P11A-FINANCIAL-TRUTH…md:129` | not a recorded fact |
| Guaranteed contract remainder | `guaranteedComp = weeklySalary × remainingWeeks` | `employment.ts:172-175` | already exposed, never netted from Cash (REQ-016) |
| Termination (exit) cost | 50% of guaranteed remainder | `employment.ts:178-180`; `tuning.ts:391` | the *liquidation* price of the obligation |
| Loans | **absent**; Owner-blocked pending Direction F | `studioRunRecap.ts:1003`; P11-REQ-041 | this analysis assumes F's "simple loan" shape once it exists |
| Library/IP | **absent** — `FilmResult.boxOffice` is a record, not an asset | `code-finance.md` §2.6 | excluded until P16 ownership system exists |
| One partial exception | `ConstructionProject.capex: 780,000` — the V11 legacy Annex **does** carry a persisted historical price | `types.ts:813-823` | `_DIGEST.md` correction to code-finance §2.6's "no facility carries a persisted price" |

The one P11 house rule most relevant here — "never reconstruct a purchase from today's blueprint
price or a title" — is real text (`P11-TO-P12-PRODUCER-HANDOFF.md:37`) but the verifier found it
governs a narrower thing than first read: capital-contributor **history rows**, not a general
engine-wide law binding every future reader (`_DIGEST.md` code-finance source-fidelity, WEAK).
I adopt its *principle* for Book Net Worth **by explicit extension, not as pre-existing law** —
see §3.

---

## 3. Book Net Worth — the definition

### 3.1 Basis: ledger capex, not live catalog lookup

At 592e926 the ledger capex row and today's catalog price are numerically identical by
construction (`placement.ts:1719-1721`), so this choice is currently invisible. It stops being
invisible the moment P13 eras or a revaluation event change catalog prices over time. Two options:

- **(a) Live catalog lookup** — what the code's own *refund* function already does (`blueprint.capex`
  looked up fresh, `placement.ts:1025-1027`). Honest for a *liquidation offer made today*, dishonest
  for a *book record*: a 1925 stage would silently reprice itself to 2035 catalog dollars every time
  someone reads it, with no in-game event explaining the jump.
- **(b) Ledger capex row (what was actually paid)** — matches the P11 handoff's spirit (§2), is
  stable across eras by default, and only changes when an explicit revaluation event says so.

**Recommendation: (b).** Book Net Worth reads the *persisted* ledger capex, not a live catalog
call. This is a new, explicit design decision for this new read model — not a restatement of the
narrower P11-TO-P12 rule — and should be logged as such.

### 3.2 Depreciation

An age curve is explicitly "future tuning" (`tuning.ts:1599-1613` comment); V1 has only the flat
0.5/0.35 refund fractions. Rather than invent a second depreciation schedule, **reuse the existing
refund fractions as the V1 book multiplier**: `bookValue = ledgerCapex × refundFraction`. This
makes Book Net Worth's asset side equal to *exactly the cash the player would receive if they
demolished/struck everything right now* — i.e., it is honestly a **liquidation-basis book value**,
not a going-concern book value. That framing is a feature, not a compromise: it is legible ("what
you'd get if you sold it all today"), needs zero new tuning, and upgrades for free the day an age
curve ships (same function, new fraction curve, no interface change).

### 3.3 Land and founding plant

Carry **$0**, but as an explicit, labeled line — "Founding plant & lot: not appraised" — never a
silent omission. Direction C requires the player understand the number; a founding soundstage that
is simply absent from the math looks like a bug, not a design choice.

### 3.4 Locked future run revenue

**Excluded.** It is provenance class D — a conditional estimate, never a recorded fact
(`P11A-FINANCIAL-TRUTH…md:129`) — and a "book" value is a record of the past by definition
(finance-logic.md §1.1). Cash already received from the run to date is inside `cash`; nothing is
lost by excluding the remainder, and nothing forecast is smuggled into a number labeled "record."

### 3.5 Guaranteed contract remainder — liability, or separate obligations line?

**Recommendation: keep it a separate "Obligations" figure, do not subtract it from Book Net
Worth.** Three reasons:

1. It is the existing law. REQ-016 already requires exposing guarantees "without subtracting from
   Cash" (`bridge/finance.ts:80-81`); Book Net Worth should not quietly re-introduce the subtraction
   REQ-016 was written to forbid.
2. It matches real accounting practice for *executory* service contracts: undelivered future
   service is a disclosed commitment, not a balance-sheet liability, until the service is rendered
   (finance-logic.md's own treatment of guarantee-vs-liability distinctions, §1.2).
3. The code already prices the *actual exit cost* of the obligation — the 50% termination fraction
   — which is a better liability figure than the full nominal remainder, because it is what the
   studio would really pay to make the obligation go away today.

So: publish **two** numbers, never blended:

- **Book Net Worth** = Cash + (Facility book) + (Set book) + $0 (land/plant) − Loan principal −
  Accrued unpaid interest.
- **Guaranteed Obligations** (existing REQ-016 figure, unchanged) shown alongside it.
- A third, clearly secondary **"Wind-Down Position"** = Book Net Worth − (50% × Guaranteed
  Obligations), labeled as a stress test ("what's left if you also paid to exit every contract
  today"), not a claim about real solvency. Worked Example ii shows why this third line earns its
  place: Book Net Worth alone can look calm while a full-unwind number is negative.

### 3.6 Loans, once Direction F ships

Simple and literal, matching OpenTTD's `Company Value = assets − current_loan + money`
(`comp-ranking.md`:129, source code, HIGH) — the same structure this analysis converges on
independently: **subtract principal outstanding and accrued-but-unpaid interest**, nothing more
exotic. P11 is expected to remain authoritative for the ledger/debt math itself (Direction F);
Book Net Worth only *reads* the resulting two numbers.

### 3.7 Library/IP

**Excluded, at $0, with an explicit label**, exactly like land: "Film library: not valued (no
ownership system yet)." No valuation mechanism for a film or its rights exists at 592e926
(`code-finance.md` §2.6 — `FilmResult.boxOffice` is a result record, not an asset), and Direction C
itself only claims book net worth, not a library valuation model. This is the correct default per
the task's own framing and is unaffected by whether the P16+ acquisition boundary work (Direction
I) ever ships.

### 3.8 The read-model card (P11 house style)

Following the existing P11A finance-truth table format (`P11A-FINANCIAL-TRUTH…md`:127-129):

| Number | Definition | Source | Time basis | Included | Excluded |
|---|---|---|---|---|---|
| Book Net Worth | Cash + Σ(facility ledger capex × 0.5) + Σ(set ledger capex × 0.35) − loan principal − accrued interest | new P11 read model over existing ledger + (future) loan fields | instant, at recorded value | cash, depreciated built capital, debt | land/plant, guaranteed remainder, pipeline revenue, library/IP |
| Guaranteed Obligations | Σ `guaranteedComp(contract)` | existing, `bridge/finance.ts:80-81` | forward, current commitments only | unchanged | — |
| Wind-Down Position | Book Net Worth − 0.5×Guaranteed Obligations | new, derived | instant, stress-test framing | — | — |

---

## 4. Enterprise / Studio Value — whether to expose it, and how

### 4.1 Whether to expose it at all

Prior P15 research parked this in P16+ (§9, SUPERSEDED — see §9 below). Direction C now explicitly
authorizes it. **Recommendation: expose it, but only as a labeled range, never a point number**,
with an explicit "Book ≠ Sale Price" disclaimer in the tooltip. This matches finance-logic.md's own
§1.5 recommendation and every comparator that shows a forward number at all (OpenTTD's Company
Value graph, GearCity's share-price formula) — none of them present it as a single confident dollar
figure without a visible formula or a market mechanism behind it, and this game has neither yet.

### 4.2 Method: trailing operating surplus × multiple

The EBITDA-like stand-in already identified is honest and buildable: **trailing Studio Revenue
received minus payroll, overhead, facility Opex, production, marketing, and publicity, all from the
ledger** (finance-logic.md §1.4, "the honest EBITDA-like stand-in"). Because releases are lumpy,
finance-logic.md §1.5 proposed averaging "3–5 years of your recent operating surplus" but the
verifier flagged it as unsourced (`_DIGEST.md` finance-logic completeness pass). An independent
check during verification supplied a real published range: **small-business EBITDA multiples ≈3–6×
for sub-$1M EBITDA; SDE multiples ≈1.5–4× with a 2026 median near 2.7×** (cited in `_DIGEST.md` to
bizworth.com / ctacquisitions.com market-survey summaries — general small-business valuation
practice, not project evidence; PROVISIONAL reference, not verified first-hand here). Recommend
**PROVISIONAL range 3×–6×** applied to a **3-year (156-week) trailing average** of operating
surplus — long enough to smooth one bad or one hit film, short enough to still mean "recent."

### 4.3 Assembling the range

Following the textbook bridge (finance-logic.md §1.1, EV → equity value):

```
Operating Value Range  = [3, 6] × (3-yr trailing operating surplus, floored at $0)
Equity Value Range     = Operating Value Range + Cash − Loan principal − Accrued interest
```

Library/IP contributes **nothing** (§3.7). Brand/Standing contributes a small, **discrete, banded**
adjustment only — never a continuous formula, to avoid the fake-precision the P15 package already
forbids and the Owner's "no Wall Street simulator" instruction reinforces. A PROVISIONAL banding:
below-average / average / above-average / elite Standing → multiplier band shifted by roughly
−0.5 / 0 / +0.5 / +1.0 turns. (Exact Standing tiers were outside this task's evidence scope and
must come from whoever owns Standing's public bands; not invented here.)

### 4.4 Warning language (mandatory, not optional)

Tooltip, PROVISIONAL wording: *"A rough range based on your recent earning power — roughly 3 to 6
times your trailing operating surplus, plus cash, minus loans. This is not a real offer. Nobody is
bidding on your studio."* This must never be consumed by any mechanic (no `canAfford`-style gate,
no acquisition price auto-computed from it without a separate, explicit formula) — it stays
display-only, exactly like `RecoveryPosition` and `runwayState` today (`studioRunRecap.ts:962-1006`;
`financeReport.ts:274-275`), which is precisely why it is safe to ship without reopening the
"one canAfford gate" law (D-12.11).

---

## 5. Worked examples (all figures PROVISIONAL/HYPOTHETICAL)

### (i) Fresh 1920 studio — day one, before any facility/set spend

| Line | Value |
|---|---|
| Cash | $20,000,000 |
| Facilities (book) | $0 (none placed) |
| Sets (book) | $0 |
| Land/plant | $0 (labeled, not omitted) |
| Loans | $0 |
| **Book Net Worth** | **$20,000,000** |
| Guaranteed Obligations | $0 (no contracts yet) |
| Trailing operating surplus | **N/A — no history** |
| **Estimated Studio Value** | **Not shown — requires ≥1 trailing measurement window** |

Rule this example demonstrates: Book Net Worth needs only a snapshot and exists from week 0;
Enterprise Value needs *history* and must be honestly absent, not defaulted to $0 or to cash, until
a trailing window exists.

### (ii) Mid-game studio — 3 facilities, 4 sets, 8 contracts, 2 active runs, one $5M loan

| Line | Basis | Value |
|---|---|---|
| Cash | given | $6,500,000 |
| Facilities (ledger capex, 3: Soundstage 2.4M + Post Bldg 1.15M + Scenery Shop 0.85M) | ×0.5 | $2,200,000 |
| Sets (4 × avg $500,000 capex) | ×0.35 | $700,000 |
| Loan principal | given | −$5,000,000 |
| Accrued unpaid interest (6 mo. @ ~6%) | given | −$150,000 |
| **Book Net Worth** | | **$4,250,000** |
| Guaranteed Obligations (8 contracts, avg $700k/yr, avg 100 wk left) | Σ weeklySalary×remaining | $10,769,231 |
| Wind-Down Position | Book NW − 50%×Obligations | **−$1,134,615** |
| Trailing (3-yr) operating surplus | given | $1,800,000/yr |
| Operating Value Range (3×–6×) | | $5,400,000–$10,800,000 |
| **Estimated Studio Value (equity range)** | + Cash − Loan&interest | **$6,750,000–$12,150,000** |

Illustrates §3.5's point directly: Book Net Worth alone ($4.25M) reads "modestly healthy"; the
Wind-Down stress figure is *negative*, showing why publishing Obligations alongside Book Net Worth
matters even when Book Net Worth itself looks fine. It also shows Estimated Studio Value sitting
**above** Book Net Worth — the going-concern earning power is worth more than the liquidation
assets, the normal case for an operating business (finance-logic.md §1.2).

### (iii) Rich-but-declining studio — big cash pile, shrinking recent output

| Line | Value |
|---|---|
| Cash | $35,000,000 |
| Facilities (book, 5 older placements) | $6,000,000 |
| Sets (book) | $1,000,000 |
| Loans | $0 |
| **Book Net Worth** | **$42,000,000** |
| Trailing surplus, last 3 years | $900,000 / $400,000 / $100,000 → avg **$467,000/yr** |
| Operating Value Range (3×–6×) | $1,400,000–$2,800,000 |
| **Estimated Studio Value** | + Cash − $0 | **$36,400,000–$37,800,000** |

Illustrates finance-logic.md §1.3's warning in reverse: here the studio is not *worthless* (it has
real cash), but its **operating business** is nearly valueless — the $37M estimate is almost all
treasury, not earning power. A pure net-worth ranking would rate this studio #1; direction B's own
instruction ("do not assume wealthiest = most powerful") is exactly the caution this example makes
concrete for whoever designs the Power Ranking financial lane. Also flags the age-curve gap: a
truly aging plant should book below the flat 0.5 fraction eventually; V1 cannot show that yet
(§3.2).

### (iv) Hot-but-negative-equity studio — heavy loan, big slate, strong recent surplus

| Line | Value |
|---|---|
| Cash | $2,000,000 |
| Facilities (ledger capex $9.6M ×0.5) | $4,800,000 |
| Sets (ledger capex $4.2M ×0.35) | $1,470,000 |
| Loan principal | −$9,000,000 |
| Accrued interest | −$300,000 |
| **Book Net Worth** | **−$1,030,000** |
| Trailing (3-yr) operating surplus | $3,200,000/yr |
| Operating Value Range (3×–6×) | $9,600,000–$19,200,000 |
| **Estimated Studio Value (equity range)** | + Cash − Loan&interest | **$2,300,000–$11,900,000** |

The centerpiece example: Book Net Worth is **negative**, but Estimated Studio Value is solidly
**positive** — exactly the "profitable company, negative book equity" pattern finance-logic.md §1.2
describes for real firms that borrow to build. This is the strongest argument for showing both
numbers and never collapsing them: a debt-funded, high-output studio would read as *distressed* on
Book Net Worth alone and *thriving* on Estimated Studio Value alone. Neither number lies; only
showing one would.

---

## 6. Era scaling and revaluation

`era.costScale` (default 1.0, `calendar.ts:17` per finance-logic.md §5.2) is the only field that
already says "how expensive is this era," applied to film cost. Two consequences for Book Net Worth
/ Estimated Studio Value:

1. **Within one era, no conversion is needed.** Book Net Worth reads ledger dollars directly; those
   dollars are already denominated in the operative era's scale by construction (§3.1's ledger-basis
   choice keeps this true even if a later era's catalog changes).
2. **Across eras, never compare raw dollars.** A $2M 1925 net worth and a $2M 2035 net worth are not
   the same achievement. Any cross-era comparison (a Legacy "financial high" callout, a Power
   Ranking historical footnote) must state the figure as a **ratio of the era's own trailing
   baseline** (e.g., "6× the era's median studio surplus"), per finance-logic.md §5.3's unit-free
   rule, never as a nominal dollar rank.
3. **Revaluation events, if ever authorized, must be visible, not silent.** Should P13 ever change a
   blueprint's catalog price across eras, an older asset's book line should carry the `costScale` at
   which it was *built*, and any re-basing to a new scale should be an explicit, dated in-fiction
   event ("your lot has been revalued") — not a number that quietly drifts. No such mechanic is
   proposed here; this is a guardrail for later, not a new feature request.

---

## 7. Disclosure — who sees whose numbers

The player's own Book Net Worth, Obligations, Wind-Down Position, and Estimated Studio Value range
should be **fully visible**, display-only (§4.4), exactly like today's `financeOverview` and
`RecoveryPosition`.

Rivals are a different question, and existing P12A visibility law already answers most of it by
extension (`P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md`:184-195, table, HIGH):

| Rival fact | Existing default | Extension for this task |
|---|---|---|
| Exact cash and reserve target | **HIDDEN** | Exact Book Net Worth / EV: **HIDDEN**, same rule |
| Project budget, spend, forecast, runway | **HIDDEN** by default | feeds rival EV internally, never shown raw |
| Distress/recovery/closure cause | **NOT YET AUTHORIZED** until P15B | any distress *label* derived from rival net worth waits on P15B, not this task |
| Released-film Gross | **PUBLIC AFTER EVENT** | unaffected |

**Recommendation:** rivals' literal dollar figures stay hidden by the same rule that already hides
their cash. If Direction B's fourth financial lane is adopted, it should publish only a **banded**
signal (the same 0–10 lane style already used for the other Power Ranking candidate lanes,
`P15-PACKAGE.md`:803), never a dollar amount — consistent with "Standing channels and film measures
have separate meanings; there is no combined Power score" (`bridge/industry.ts:110`, ≤40 words) and
with the general law that rivals cannot leak private ledgers. This task supplies the *number*; it
does not decide whether or how Power Ranking (P15A.2, a different Owner decision) consumes a banded
version of it.

---

## 8. Recommendation summary

**Expose:** Book Net Worth (with its Obligations and Wind-Down companions) **and** Estimated Studio
Value, both, never merged, both display-only in V1.

**Labels/tooltips (PROVISIONAL wording):**
- *"Book Net Worth"* — "What your studio owns at recorded, wind-down value, minus what it owes on
  loans. A record, not a sale price."
- *"Guaranteed Obligations"* — unchanged existing wording (REQ-016).
- *"Wind-Down Position"* — "Book Net Worth if you also paid to exit every guaranteed contract today.
  A stress test, not your real position."
- *"Estimated Studio Value"* — "A rough range from your recent earning power, plus cash, minus
  loans. Not a real offer."

**Where it lives:** a new P11 read model (parallel to `financeReport.ts`/`economyView.ts`), reading
existing ledger truth plus the future loan fields. It needs its own P11 authorization exactly as
finance-logic.md §1.5 already said, because it is new surface over existing truth, not a new
mechanic.

**Package ownership:**

| Piece | Owner | Note |
|---|---|---|
| Book Net Worth definition, labels, Obligations/Wind-Down split | **new P15D — Studio Value** (recommended) | no existing P15A/B/C sub-package is a clean fit; P15D coordinates, does not implement |
| Read-model implementation | **P11** | reuses existing ledger + refund-fraction functions; needs P11's own sign-off |
| Loan principal/interest math | **P11** (per Direction F: "P11 likely stays authoritative for ledger/debt math") | P15D only reads the two resulting numbers |
| Distress meaning of debt levels | **P15B** | out of this task's scope |
| Rival disclosure rule (banded vs hidden) | **P12** (extends existing visibility table) + **P15D** (specifies the rule) | |
| Power Ranking financial-lane consumption | **P15A.2** | P15D supplies the number; P15A.2 decides whether/how to use it — explicitly not decided here |
| Acquisition/purchase-price formula that *uses* Enterprise Value | **P16+** (per Direction I's still-open boundary question) | P15D exporting a number makes that later slice easier, not harder |
| Library/IP valuation | **P16+**, excluded from P15D entirely | no ownership system exists yet |

---

## 9. Prior P15 claims — CONFIRMED / QUALIFIED / SUPERSEDED

- **SUPERSEDED BY OWNER DIRECTION** — `P15-PACKAGE.md` §25 deferral list, "studio and library
  valuation" (P16+, line ~843); `P13-P15-OWNER-RULINGS.md`:151 ("acquisitions… valuation… defer to
  P16+"); `P13-P15-LONG-RANGE-ROADMAP.md`:699 ("studio valuation" in the P16+ list). Direction C
  explicitly moves *book net worth and a labeled Estimated Studio Value* into P15 now. **QUALIFIED,
  not fully superseded:** the acquisition/ownership-transaction *mechanism* that would consume a
  valuation number (offer, consent, transfer) still defers per Direction I's open boundary question
  — only the valuation *number itself* moved.
- **SUPERSEDED BY OWNER DIRECTION (pending replacement)** — `P15-PACKAGE.md`:803 /
  `P13-P15-LONG-RANGE-ROADMAP.md`:682, prior Power Ranking recommendation explicitly "excludes
  Standing, cash/valuation." Direction B reopens this as a live research question (fourth lane vs.
  separate ranking vs. partial); full exclusion is no longer settled, but no replacement is decided
  either — this task supplies an input, not the answer, to that separate P15A.2 decision.
- **QUALIFIED** — finance-logic.md §1.5's own prior recommendation, "Never label any of these
  'Studio Rating' or fold them into Power Ranking" — correct as a warning against a single fused
  score (still adopted here, §7), but its premise that valuation stays out of Power Ranking
  entirely is now an open question under Direction B, not a closed one.
- **CONFIRMED** — finance-logic.md §7: "'Book Net Worth' read model could be built from existing
  truth, but that is a P11 change needing its own authorization." Still true; this analysis's
  package-ownership table (§8) operationalizes exactly that.
- **CONFIRMED** — `P15-PACKAGE.md`:797, the acquisition mechanism "needs valuation, contract
  assumption, ownership/IP history" that would "overwhelm P15." Direction I already accepts this
  boundary concern by asking for the *smallest* eventual acquisition shape rather than a full system;
  this task does not resolve that shape, only exports a number it could use.
- **CORRECTED** — the P11 handoff's "never reconstruct a purchase from today's blueprint price"
  sentence, previously read as a general engine-wide law, is narrower in context (capital-contributor
  history rows only; `_DIGEST.md` code-finance source-fidelity). §3.1 adopts its *principle* for
  Book Net Worth as a fresh, explicit decision, not as a restatement of existing law.

---

## 10. Remaining Owner decisions

1. Create a dedicated **P15D — Studio Value & Net Worth** sub-package, or fold this scope into
   P15B or P15C — affects sequencing/dependency, not the underlying design in this analysis.
2. Confirm the **Obligations-stays-separate** treatment of guaranteed contract remainder (§3.5) —
   a real, defensible alternative (discounted liability treatment) exists and was rejected here on
   stated grounds, but it is a philosophy call the Owner should bless, not a purely technical one.
3. Confirm or replace the **PROVISIONAL 3-year trailing window** and **3×–6× multiple band** (§4.2)
   — explicitly open tuning per the task framing; nothing here claims these are final.
4. Confirm **disclosure**: does any banded rival signal ship before Power Ranking's financial lane
   is separately approved, or does Book Net Worth/Estimated Studio Value stay player-only until
   P15A.2 ships? (§7 recommends the safer default — player-only until P15A.2 decides.)
5. Confirm whether an **age-depreciation curve** (replacing the flat 0.5/0.35 fractions, §3.2) and a
   **revaluation-event mechanic** (§6.3) are ever wanted; neither is requested here, both are
   guardrails for a future P11/P13 decision.

---

## 11. Open uncertainties

1. The 3×–6× EBITDA-multiple reference and the "3–5 years of trailing surplus" range both rest on
   general small-business valuation practice surfaced during verification (`_DIGEST.md`), not
   independently re-verified against primary sources in this pass — PROVISIONAL, not authoritative.
2. Standing's exact public tiers/bands (needed for §4.3's brand adjustment) were outside this
   task's evidence scope; the banding proposed here is illustrative only.
3. Whether Direction F's eventual loan design uses simple or compound interest, and how "accrued
   unpaid interest" is computed week-to-week, is Direction F's own open question; §3.6 only assumes
   the two resulting numbers (principal, accrued interest) exist to be read.
4. Whether a rival's internal Book Net Worth should be computed at all before P15B needs it for
   distress-ladder purposes is a sequencing question this task does not resolve; §7 assumes it
   would be computed (for a possible banded signal) but never displayed as a dollar figure.
5. The original 2005 game's Capital lane and lifetime-earnings Achievement Award thresholds
   ($500K/$7M/$15M/$35M; Prima p.79-80, RETAIL SHIPPED per `_DIGEST.md` prior-claims completeness
   pass) show the original *did* track cumulative money milestones for Legacy purposes; whether a
   2040 dossier (Direction J, a different task) should cite Book Net Worth history the way it cited
   those thresholds is noted here as a possible input, not decided.
