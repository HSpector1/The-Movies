# Campaign 1 — Economy Snapshot

A MEASURED RECORD. Every figure below was produced by running the engine, not by
reading a tuning table. No tuning value was changed to produce it and none is
proposed here: where a number looks wrong it is **FLAGGED** and left alone.

## Provenance

| Fact | Value |
| --- | --- |
| Generating command | `node_modules/.bin/vite-node scripts/measure-c1-economy.mts` |
| Generated at HEAD | `bd6c4ba9c97db58c3491e04e0e34f9d8af5cb23f` |
| Last commit touching `src/` or `ui/src/` | `63339cdb42ee59d58d9553b2b29e5978f4dfdbfb` |
| Direct-measurement seed | `c1-economy-001` |
| Capacity-study seeds | `c1-economy-001`, `c1-economy-002`, `c1-economy-003`, `c1-economy-004`, `c1-economy-005` |
| Capacity-study horizon | 104 weeks per arm |
| Founding roster | 4 actors · 1 director · 2 writers · 1 craft, 208-week terms |
| Studio construction | public adapter/engine actions only — nothing hand-edited |
| Determinism | no clock, no `Math.random`; two runs at one HEAD are byte-identical |

Re-running at a later HEAD changes the HEAD line above and nothing else. The line to
diff is the second one: while the last commit touching `src/` or `ui/src/` is
unchanged, every measured figure below reproduces exactly — and if one of them moves,
something in the economy moved with it.

## 1. The slate, measured one building at a time

Each row is a founded studio that committed exactly one blueprint, ran the clock until
the building opened, paid a week of its running cost, and then demolished it. Capital,
operating cost and refund are read from the STUDIO’S OWN CASH AND LEDGER.

| Blueprint | Capital charged | Weeks to open | Weekly opex (ledger) | Demolition refund | Refund / capital | Cells | Shared slots |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Development & Casting Annex | $780,000 | 13 | $3,500 | $390,000 | 50.0% | 6 | +1 |
| Development & Casting Hall | $1,400,000 | 20 | $6,000 | $700,000 | 50.0% | 12 | +2 |
| Development Office II | $600,000 | 8 | $2,500 | $300,000 | 50.0% | 6 | — |
| Development Office III | $1,200,000 | 12 | $4,000 | $600,000 | 50.0% | 6 | — |
| Craft Services Annex | $400,000 | 6 | $2,000 | $200,000 | 50.0% | 6 | — |

Cross-checks, all of which held:

- **Development & Casting Annex** — cash debit $780,000 equals the catalog price $780,000 and the single `constructionCapex` ledger row $780,000; 13 measured weeks equal the quoted 13; the ledger charged $3,500 in the first open week against a quoted $3,500; the refund credit $390,000 matches its `facilityDemolitionRefund` row. Prerequisite: none — buildable on a founded studio.
- **Development & Casting Hall** — cash debit $1,400,000 equals the catalog price $1,400,000 and the single `constructionCapex` ledger row $1,400,000; 20 measured weeks equal the quoted 20; the ledger charged $6,000 in the first open week against a quoted $6,000; the refund credit $700,000 matches its `facilityDemolitionRefund` row. Prerequisite: none — buildable on a founded studio.
- **Development Office II** — cash debit $600,000 equals the catalog price $600,000 and the single `constructionCapex` ledger row $600,000; 8 measured weeks equal the quoted 8; the ledger charged $2,500 in the first open week against a quoted $2,500; the refund credit $300,000 matches its `facilityDemolitionRefund` row. Prerequisite: none — buildable on a founded studio.
- **Development Office III** — cash debit $1,200,000 equals the catalog price $1,200,000 and the single `constructionCapex` ledger row $1,200,000; 12 measured weeks equal the quoted 12; the ledger charged $4,000 in the first open week against a quoted $4,000; the refund credit $600,000 matches its `facilityDemolitionRefund` row. Prerequisite: Development Office II built and operational first (its own capital and opex are excluded below).
- **Craft Services Annex** — cash debit $400,000 equals the catalog price $400,000 and the single `constructionCapex` ledger row $400,000; 6 measured weeks equal the quoted 6; the ledger charged $2,000 in the first open week against a quoted $2,000; the refund credit $200,000 matches its `facilityDemolitionRefund` row. Prerequisite: none — buildable on a founded studio.

What the refund column means in play: build-then-demolish is always a strict loss, and
the size of that loss is the price of changing your mind.

| Blueprint | Loss if built then demolished | Refund expressed as weeks of its own opex |
| --- | --- | --- |
| Development & Casting Annex | $390,000 | 111 weeks |
| Development & Casting Hall | $700,000 | 117 weeks |
| Development Office II | $300,000 | 120 weeks |
| Development Office III | $600,000 | 150 weeks |
| Craft Services Annex | $200,000 | 100 weeks |

## 2. Founding baseline vs the built-out studio

One studio that built **every blueprint within its instance limits** — one Annex, one
Hall, Office II, Office III, one Craft Services Annex. The two unlimited blueprints are
taken at one copy each; that is a stated choice, not a rule (see §4 for what a second
copy would buy).

| Fact | Founding | Built out |
| --- | --- | --- |
| Placed facilities | 0 | 5 |
| Weekly facility opex (projection) | $0 | $18,000 |
| Weekly facility opex (ledger) | $0 | $18,000 |
| Capital committed | $0 | $4,380,000 |
| Cash | $20,000,000 | $13,545,857 |
| Week the estate was complete | Week 0 | Week 20 |

The whole estate takes **20 weeks** to stand from a day-one start — the Hall's and Office III's clocks, not the money, are what set that horizon. Demolishing all of it would recover $2,190,000 of the $4,380,000 committed (50.0%).

Where the estate sits in the studio's weekly burn, from the ledger's own rows for Week 20:

| Ledger kind | Outflow that week | Share of the week |
| --- | --- | --- |
| `facilityOpex` | $18,000 | 16.1% |
| `overhead` | $27,000 | 24.1% |
| `payroll` | $66,983 | 59.8% |

A fully built C1 estate costs $18,000 a week to run — 16.1% of that week's outflow. It is a real carrying cost and it is nowhere near a death spiral against a founding bank of $20,000,000.

## 3. The Development Office uplift, A/B on one fixed seed

Three arms of seed `c1-economy-001`, all aligned on **Week 20**, all commissioning the SAME concept with the SAME writer, shape and audience promise, and all greenlighting the SAME package at the SAME budget ($4,781,571 negative, $652,058 marketing). The only difference between them is which development office is standing.

**The arms are on the same random stream.** `rngState` at the commission week is BYTE-IDENTICAL across all three arms. That is what makes the receipts delta below a measurement of the office and not of a diverged world.

### 3a. What it does to the draft

| Arm | Uplift in force | EST (perceived) | EST (actual) | Δ perceived vs no office |
| --- | --- | --- | --- | --- |
| No development office | — | 65.7212 | 66.4388 | — |
| Development Office II (operational Week 8) | +4 | 69.7212 | 70.4388 | +4.0000 |
| Development Offices II + III (III operational Week 20) | +9 | 74.7212 | 75.4388 | +9.0000 |

The uplift lands EXACTLY as authored, on both the hidden strength and the visible
estimate, and the tiers replace rather than stack: Office III is +9 and never +13.

### 3b. What it does to the receipts

Each arm carried its picture from commission to the close of its theatrical run.

| Arm | Critic score | Box office | Studio revenue | Δ revenue vs no office | Capital spent by Week 20 |
| --- | --- | --- | --- | --- | --- |
| No development office | 60.122 | $13,206,817 | $6,867,545 | — | $1,879,660 |
| Development Office II (operational Week 8) | 60.902 | $13,472,069 | $7,005,476 | $137,931 | $2,509,660 |
| Development Offices II + III (III operational Week 20) | 61.877 | $13,807,762 | $7,180,036 | $312,491 | $3,709,660 |

| Step | EST points bought | Capital | EST points per $1M | Revenue per picture | Revenue per $1M of capital |
| --- | --- | --- | --- | --- | --- |
| None → Office II | +4 | $600,000 | 6.67 | $137,931 | $229,885 |
| Office II → Office III | +5 | $1,200,000 | 4.17 | $174,560 | $145,467 |

Read the second row as the MARGINAL purchase it is: Office III cannot be bought on its
own, so its true price to a studio starting from nothing is
$1,800,000 of capital and $6,500 a week for +9 EST.

One seed, one picture. The EST figures are exact and would reproduce on any seed; the
receipts figures are one draw of a stochastic reception and should be read as an order
of magnitude, not a constant.

## 4. Shared slots at the two-production ceiling — what does another slot buy TODAY?

Measured with `runFacilitiesArm` from the accepted Facilities & Construction observatory (`src/harness/facilities`), driven at the `scaled-two-team` policy — the policy that tries to keep **2 pictures**, the current ceiling, in production at once. Three arms per seed over 104 weeks: founding capacity, +1 shared slot arriving the week an Annex would open (Week 13), and +2 arriving the week a Hall would open (Week 20).

| Configuration | Releases (mean) | Final cash (mean) | Idle D&C slot-weeks (mean) | D&C capacity refusals (mean) |
| --- | --- | --- | --- | --- |
| +0 · founding capacity (2 shared slots) | 18.8 | $6,247,907 | 89.6 | 9.6 |
| +1 · Development & Casting Annex (open Week 13) | 19.0 | $5,924,375 | 178.0 | 7.2 |
| +2 · Development & Casting Hall (open Week 20) | 19.0 | $5,924,375 | 255.0 | 7.4 |

| Seed | +0 · founding capacity (2 shared slots) | +1 · Development & Casting Annex (open Week 13) | +2 · Development & Casting Hall (open Week 20) |
| --- | --- | --- | --- |
| `c1-economy-001` | 19 releases · $746,390 · 93 idle slot-weeks | 19 releases · $746,390 · 184 idle slot-weeks | 19 releases · $746,390 · 261 idle slot-weeks |
| `c1-economy-002` | 19 releases · $22,500,771 · 86 idle slot-weeks | 19 releases · $22,500,771 · 177 idle slot-weeks | 19 releases · $22,500,771 · 254 idle slot-weeks |
| `c1-economy-003` | 19 releases · $1,240,164 · 87 idle slot-weeks | 19 releases · $1,240,164 · 178 idle slot-weeks | 19 releases · $1,240,164 · 255 idle slot-weeks |
| `c1-economy-004` | 20 releases · $4,999,005 · 80 idle slot-weeks | 20 releases · $4,999,005 · 171 idle slot-weeks | 20 releases · $4,999,005 · 248 idle slot-weeks |
| `c1-economy-005` | 17 releases · $1,753,204 · 102 idle slot-weeks | 18 releases · $135,543 · 180 idle slot-weeks | 18 releases · $135,543 · 257 idle slot-weeks |

**On 4 of the 5 seeds every arm released exactly the same pictures and finished with exactly the same cash, to the byte** (`c1-economy-001`, `c1-economy-002`, `c1-economy-003`, `c1-economy-004`). There the extra capacity converted entirely into idle slot-weeks and changed nothing else.

One seed did diverge, and the divergence is worth reading carefully rather than averaging away:

| Seed | Δ releases with +1 | Δ final cash with +1 | Δ releases with +2 | Δ final cash with +2 |
| --- | --- | --- | --- | --- |
| `c1-economy-005` | +1 | -$1,617,661 | +1 | -$1,617,661 |

An extra slot let that studio commit to one more picture — and the picture it let
through was one the studio was better off not making. More throughput is not the
same thing as more money, and this is the seed where the difference shows.

Averaged over all 5 seeds the marginal slot is worth **0.20 extra releases and -$323,532 of final cash** (+1, Annex) and **0.20 releases and -$323,532** (+2, Hall) — and those figures are BEFORE the building's own capital and running cost, which the counterfactual does not charge. Not one arm on any seed finished richer than its founding-capacity twin.

Founding capacity does bind: the studios were refused a Development & Casting slot 48 times across the 5 founding-capacity arms. 35 of those refusals happened before Week 13 — the earliest week any purchased slot can be standing — so they are unreachable by construction no matter how early the player commits. The remaining 13 are reachable, and buying the slot did reduce refusals (mean 9.6 → 7.2) — it simply did not convert into pictures or money.

Why this is a ceiling result rather than a slot result: a picture holds one shared
Development & Casting slot at a time (its screenplay, then its camera tests, then its
early production work), and the studio may hold at most
2 pictures. Two pictures therefore need two slots, which the founding Development &
Casting building already provides. A refused commission is a screenplay that waits a
week, not a picture that never gets made.

## 5. The Craft Services Annex, whose benefit is a price

Two studios on seed `c1-economy-001` at Week 6, identical except that one has an operational Craft Services Annex, compared on the freelancers they can both see.

| Role | Freelancer | Fee without | Fee with | Saved |
| --- | --- | --- | --- | --- |
| actor | `t-act-02` | $132,993 | $113,044 | $19,949 |
| actor | `t-act-04` | $236,368 | $200,912 | $35,456 |
| actor | `t-act-18` | $96,510 | $82,033 | $14,477 |
| craft | `t-cra-03` | $316,956 | $269,412 | $47,544 |
| craft | `t-cra-07` | $191,974 | $163,178 | $28,796 |
| craft | `t-cra-06` | $245,881 | $208,999 | $36,882 |

Observed discount 15.00%; mean saving $30,517 per freelancer hired. At $400,000 of capital, the Annex pays for its capital after **13.1 freelancer hires** and needs 0.07 hires per week just to cover its own running cost.

The important caveat is not the arithmetic: a studio that staffs its pictures from its
own contracted roster hires no freelancers at all, and for that studio this building’s
measured benefit is exactly zero. It is a building for a studio that has outgrown its
payroll, and nothing in Campaign 1 tells the player that.

## 6. Payback horizons

A picture releases every **5.53 weeks** at the two-production ceiling (mean of 18.8 releases over 104 weeks, 5 seeds). That cadence is what turns a per-picture benefit into a per-week one.

| Blueprint | Capital | Weekly opex | Measured benefit | Net per week | Capital payback |
| --- | --- | --- | --- | --- | --- |
| Development Office II | $600,000 | $2,500 | $137,931 per picture | $22,434 | 26.7 weeks |
| Development Office III (marginal, on top of II) | $1,200,000 | $4,000 | $174,560 per picture | $27,555 | 43.5 weeks |
| Development & Casting Annex | $780,000 | $3,500 | -$323,532 of final cash over 104 weeks (mean, 5 seeds) | -$6,611 | never |
| Development & Casting Hall | $1,400,000 | $6,000 | -$323,532 of final cash over 104 weeks (mean, 5 seeds) | -$9,111 | never |
| Craft Services Annex | $400,000 | $2,000 | $30,517 per freelancer hired | depends entirely on hiring rate | 13.1 freelancer hires |

The two "never" rows are not a claim that capacity is worthless. They are a claim about
TODAY: with the ceiling at 2 concurrent pictures, the founding building already supplies every
slot a studio can use, so a purchased slot has nothing to hold — and the counterfactual
that gives the slot away for free still does not leave the studio richer. Raising the
ceiling is explicitly out of Campaign 1 scope; this is the measurement that says what
that decision is worth when someone takes it.

## 7. The two standing PM flags, answered with data

### (a) Is Development Office III’s value the weakest in the slate?

**FLAGGED — no, not the weakest, but it IS the worst-value office, and by a wide margin.** Office II buys 6.67 EST points per $1M of capital; Office III’s marginal +5 costs 4.17 points per $1M — 37.5% less EST per dollar. On measured receipts the same ordering holds: $229,885 of revenue per picture per $1M for Office II against $145,467 for Office III's marginal step. Its capital payback (43.5 weeks) is 1.6× Office II's (26.7 weeks), and it also carries a 12-week clock and $4,000/week forever.

It is nonetheless NOT the weakest entry in the slate: it returns something on every picture, which the two capacity blueprints measurably do not (§4). The weakest entries today are the Annex and the Hall. Office III is the weakest thing a studio would actually be tempted to buy — a $1,200,000 purchase that doubles down on a lever the $600,000 purchase already pulled most of the way.

### (b) Can the Hall’s 20-week build ever pay back inside a typical campaign horizon?

**FLAGGED — no. Not in 104 weeks, and on this evidence not in any horizon, because its measured benefit is not merely small — it is negative before the building is even paid for.** Given its two shared slots for FREE from the week it would open, the studio finished a two-year run with a mean -$323,532 of final cash against its founding-capacity twin (4 of 5 seeds byte-identical, 1 worse). What the capacity reliably bought was 165 additional idle slot-weeks. Its $1,400,000 of capital and $6,000/week — $624,000 of opex over that same two-year run — are therefore paid against a benefit of zero or less.

The 20-week clock is therefore the second problem, not the first. Even if the Hall opened instantly it would still return nothing, because the constraint it relieves is not the constraint the studio is under: the studio is under the 2-production ceiling, and slots are not what that ceiling is made of. The same measurement condemns the Annex ($780,000, 13 weeks) for the same reason — the Hall is only the more expensive way to buy the same nothing.

One honest counterweight, recorded so the flag is not read as more than it is: extra
slots DO let a studio hold more screenplays and camera tests in flight at once, which is
real optionality a scripted policy does not exercise and a player might. It is worth
nothing in RELEASES today; it is not worth nothing in FEEL.

**No tuning value was changed by this study, and none is recommended by it.** Both
answers above are findings for the PM to rule on.
