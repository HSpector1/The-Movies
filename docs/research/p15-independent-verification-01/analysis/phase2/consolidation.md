# P15 Section 10 — Consolidation / No-Replacement Analysis

**Scope:** Direction G (no synthetic replacement studios). Century-long field: 10 active
studios (player + nine authored rivals, arrivals fixed at weeks 0×4, 520, 988, 1560, 1872,
2548 — `src/core/calendar.ts:3 RIVAL_ARRIVAL_WEEKS`) thinning toward 2 or 1 over the
remaining ~71 years (weeks 2548–6240, i.e. 1969–2040) once every authored entrant has
arrived and none ever follow.

**Method note on `phase2/market-window.md`:** that file does not exist in this scratchpad
(`ls` on `scratchpad/out/phase2/` returned empty before this report). Per the task
instruction, this report states and labels its own PROVISIONAL market-window assumptions
rather than citing a missing artifact.

---

## 1. Baseline facts this analysis is built on

| Fact | Value | Source |
|---|---|---|
| Total eventual population | 10 (1 player + 9 rivals) | `calendar.ts:3`; `hollywoodStartingData.ts:8-34` (nine studios) |
| Last entrant | week 2548 = 1969 | `RIVAL_ARRIVAL_WEEKS` |
| Post-1969 entrant count | 0, forever | task premise; confirmed no floor/entrant logic exists post-schedule (`hollywood.ts` grep for minimum/floor: none, per `comp-ranking.md` §5) |
| Rival roster per business | 6 roles (writer, director, 3×actor, craft) | `RIVAL_TEAM_ROLES`, `hollywoodStartingData.ts:38` |
| Rival capacity | Dev&Casting 2, 1 stage, Scenery 2, Post 2 — **fixed at entry, no growth code found** | task facts; `hollywood.ts:88 rivalCapacityOpex`, `hollywoodValidation.ts:8 rivalStartingFacilities` (name implies static; no `acquire`/`buildFacility` rival function exists in `hollywood*.ts`) |
| Rival reserve policy | 12–20 weeks of operating cost, authored per studio (13,18,20,15,15,18,13,16,12) | `hollywoodStartingData.ts:12-34` |
| Rival opening capital | 20M–38M | same |
| Rival borrowing today | **none** — no loan/debt code exists anywhere (task facts); reserve gate only blocks *voluntary* new commitments (`hollywoodTick.ts:98,126,176,197`); fixed weekly obligations (payroll/overhead/opex) post unconditionally and cash can go negative forever (`hollywoodTick.ts:280-282`) |
| Per-tick cost driver | `for(const b of h.businesses)` — one full pass per active business every week | `hollywoodTick.ts:221` |
| Power Ranking state machine already anticipates a shrinking cohort | `insufficient-history` / `published` / `superseded` / **`archived studio → excluded/archived; history retained`** | `P15-BUILDER-ANNEX.md` §C.2 rank-state table (lines ~104-110) |
| "Minimum three active AI rivals" | P12A register **SIM-015**: "not Owner law," a bounded-proof convenience; 6–10 later target, 12 stress | `_DIGEST.md` line 5, 53, 63 |
| ROADMAP's own floor recommendation | "deterministic bounded P15B eligibility with P12's minimum three active AI rivals" | `P13-P15-LONG-RANGE-ROADMAP.md` §19.3, "Later entrants / active-rival floor" row — **SUPERSEDED BY OWNER DIRECTION G** |

---

## 2. Does market competition still work as the field thins?

**PROVISIONAL model** (no `market-window.md` exists; these numbers illustrate *shape*, not
tuned values):

- Primary pressure window W = 4 weeks (Owner-given).
- Assume a solvent studio completes a film roughly every 16 weeks (8-week `PRODUCTION_TICKS`
  production run plus overlapped development/casting under the "one production at a time,
  ≤2 screenplays" cap) — call this λ ≈ 0.0625 films/week/studio. **Hypothetical.**
- Assume releases spread across ~6 effective genre buckets (comedy, romance, horror,
  adventure, drama, action-adjacent) — **hypothetical, uniform for illustration only.**
- Expected same-genre releases from *other* active studios inside a trailing 4-week window,
  Poisson-style: `E = (N−1) × (λ/6) × W`.

| Active studios (N, incl. player) | Rival count | E[same-genre collisions in 4-wk window] |
|---|---|---|
| 10 | 9 | 0.375 |
| 8 | 7 | 0.292 |
| 6 | 5 | 0.208 |
| 4 | 3 | 0.125 |
| 2 | 1 | 0.042 |
| 1 | 0 | 0.000 |

**Reading:** under these illustrative cadence assumptions, genre-collision pressure is
already modest at full population (an average release faces well under one same-genre
rival in its window even with all nine rivals live) and thins roughly linearly with N,
reaching zero only when the last rival is gone. Two structural conclusions, independent of
the exact λ chosen:

1. **The mechanic degrades gracefully, not catastrophically.** There is no discontinuity —
   pressure falls smoothly to the boundary case (a solitary studio racing only its own
   back-catalogue and re-release, which "exact self-exclusion" already handles per the
   P15A boundary). Nothing in the shared-market design requires a minimum N to remain
   well-defined; N=0 rivals is the same code path as N=1, just with an empty aggregate.
2. **The real risk is not "the market breaks," it is "the market becomes uninteresting."**
   By the time two or fewer rivals remain, pressure is near its floor already — the
   player's *decisions* about genre timing stop mattering much sooner than the studio
   count would suggest, because low-N Poisson collision rates are small at any plausible
   per-studio cadence. This is the honest answer to "does market competition still work":
   **mechanically yes, experientially it thins out well before the last rival closes.**

The one lever that changes this picture is λ itself — see §8 (capacity growth as an
emergent counterweight).

---

## 3. Does the talent market become too easy?

This is the most structurally serious of the questions asked, because Directions G and H
compound in one direction only.

- Full-population labor demand ≈ 10 studios × 6 roles = **60 filled roles** (player
  included; player headcount may differ but is bounded by the same role list).
- Each closure (Direction H) is a **talent supply shock**: the failed studio's roster
  (up to 6 people, more if it had grown) enters free agency at once, high-visibility, per
  the mandated notice format ("14 contracted professionals entering free agency").
- Each closure *simultaneously* removes one bidder from demand.
- P14C's own proposed law caps a cohort mint at **32 people** and is explicitly
  "era-aware" (`P13-P15-LONG-RANGE-ROADMAP.md` §19.2, "Century-scale talent supply" row) —
  but that law sizes new-blood *entry*, not the standing size of a labor pool built to
  serve ten employers.

**Illustrative arithmetic (PROVISIONAL):**

| Active studios remaining | Employer demand (studios × 6) | Cumulative free agents dumped by closures (up to) | Effect |
|---|---|---|---|
| 10 → 8 | 48 | ~12 (2 closures) | mild — supply and demand both large |
| 8 → 4 | 24 | ~36 | demand halves, supply triples: bidding pressure collapses |
| 4 → 2 | 12 | ~48 | player can plausibly outbid every surviving rival for anyone it wants |
| 2 → 1 | 6 | ~54 | player is the only employer in the world |

At the low end this is exactly the failure mode the task names: "fewer employers bidding;
salary pressure vanishes; the player can hire everyone." It is also a legibility problem
independent of difficulty: a monotonically growing pool of named, never-rehired NPCs
sitting idle for decades contradicts the spirit (if not the letter) of Direction H, which
frames free agency as a market state, not a graveyard — and Direction K's frozen-Legacy
finale must eventually account for what happened to all of them.

**This is the one finding in this report severe enough to name as a genuine risk under
extreme consolidation** (see §12). The smallest correction is not a floor on studio count;
it is a floor on *what closes the loop for freed talent* — see §8's capacity-growth lever,
which is the only mechanism in this analysis that repairs both §2's saturation problem and
this one with a single, non-subsidized cause.

---

## 4. Does genre saturation vanish?

Yes, asymptotically — see §2's table. It does not "break" (no divide-by-zero, no special
case needed for N=0 competing releases; self-exclusion already means a studio never counts
its own release as competition). It becomes **vestigial** well before the last rival
closes, because per-studio release cadence is inherently slow (one production at a time,
8-week builds, contract-length talent locks). The honest framing for the Owner is: *genre
saturation was never going to be the dominant late-game challenge even at full population
under a plausible cadence; consolidation mainly compresses an already-modest effect toward
zero faster.*

---

## 5. Does Power Ranking become silly with 3 rows?

**No — and the state machine already anticipated this.** `P15-BUILDER-ANNEX.md` §C.2 (rank
state table) already defines an `archived studio → excluded/archived` transition with
"explicit eligibility reason; history retained," separate from the `insufficient-history`
gate on the *live* cohort. This is precisely the "3 active studios; 7 closed" presentation
the task proposes — it does not need to be invented, only *specified*:

- **Live Power Ranking** shows only studios in the currently-eligible cohort
  (`P15-PACKAGE.md:158`, "eligible studio cohort"). At 3 active studios this is a 3-row
  table, honestly labeled, not a defect — a 3-team league table is still meaningful (it is
  exactly what a real declining industry looks like; compare GearCity's authored roster
  thinning "toward the player," `comp-ranking.md` §3.2, with no inspected complaint about
  a small late-game field, only about *unopposed dominance*).
- **Closed studios move to a separate historical/legacy list**, not off the game, with
  their last snapshot, full career and release history intact — consistent with Direction
  D's "historic identity NEVER disappears" and with the Closure definition itself
  ("permanent archive," Annex glossary).
- **Open decision (genuinely unresolved in any authority doc):** no document specifies a
  numeric minimum cohort size for `insufficient-history` vs `published`. Is a 2-studio
  Power Ranking (player + 1 rival) still "published," or does it downgrade to
  insufficient-history with an explanatory reason? Recommend: publish down to N=2 (a
  ranking of two is still a comparison); at N=1 (player alone) the *lane values* still
  exist but ranking is definitionally moot — show the player's own trailing lane values
  with an explicit "no rival comparison currently exists" reason rather than suppressing
  the screen. This is a UX decision, not a mechanical blocker, and should be handed to the
  Owner as an open item rather than resolved here.

---

## 6. Does M&A create irreversible snowballing?

Package boundary for the M&A system itself belongs to the sibling `comp-ma` research and
Direction I, not this section. The interaction worth flagging here: **if** M&A ships in any
form (subsidiary absorption, bankruptcy-auction-only, or healthy buyout), it operates on
exactly the same shrinking pool this report analyzes, and "the player buys the last rival"
becomes a *reachable, not hypothetical* end state. Direction G already answers whether that
is acceptable — "consolidation is acceptable/desirable emergent history" — so a
player-owns-everything outcome is not a bug to prevent, it is a sanctioned outcome to
*present honestly* (2040 finale legacy archetypes should be able to name "dominance" or
"absorption" outright, which Direction J's list already includes: "dominance
periods...acquisitions if they exist"). The one thing this report recommends explicitly:
**whatever M&A boundary is chosen, it must not be the mechanism that makes rival failure
happen** — failure should occur (or not) under Direction D's economic law regardless of
whether M&A exists at all; M&A should only ever act on studios *already* in an eligible
distress/closure state (or, for "healthy M&A," on studios that opt in) — never a shortcut
that manufactures closures to feed acquisitions. That ordering constraint is a boundary
note for `comp-ma`/P15I, not a finding this section needs to resolve further.

---

## 7. Is two AI rivals enough? Is one?

Mechanically: **yes to both.** Nothing inspected in the market, ranking, or tick-loop code
requires N≥2. The shared-market law is explicitly symmetric and self-excluding per studio,
not per-population; the tick loop is a plain iteration over whatever businesses exist
(`hollywoodTick.ts:221`); OpenTTD ships and supports `max_no_competitors=0` as a normal
setting (`comp-ranking.md` §3.1); Transport Fever 2 ships with **zero** AI companies as its
base design (`_DIGEST.md` line 31/58 — corrected to COMMUNITY/LOW-MEDIUM tier, but the
product fact of zero AI competitors shipping is undisputed).

Experientially, the honest distinction is the one the corrected Transport Fever 2 evidence
itself draws: TF2's zero-AI-forever is an **authored, permanent, advertised** design
choice that its own players call "no competitive objective" and "a deal breaker"
(`_DIGEST.md` line 31). Project: Studio's zero-or-one-rival state, if it happens, is an
**emergent, rare, late-run tail outcome** of a 120-year simulation that spent most of its
runtime with 6-10 competitors — a structurally different thing to hand a player, much
closer to what a real declining industry looks like than to a design that ships hollow.
The risk is real only if it becomes *common*, which is exactly why §9 (failure-rate
tuning) matters more than any headcount rule.

---

## 8. Legitimate emergent counterweights vs. forbidden difficulty subsidies

The task explicitly asks for this distinction. The line drawn here: **a counterweight is
legitimate if a surviving studio pays the same costs, under the same law, that any studio
always pays for that benefit; it is a forbidden subsidy if the benefit appears without a
matching cost, or applies only because rivals failed rather than because the survivor did
something.**

| Candidate | Legitimate? | Why |
|---|---|---|
| Surviving studio spends capex to add a second soundstage / more Dev&Casting capacity, raising its own release cadence λ | **Legitimate, if built** | Same capex law the player already has (400k-2.4M facility range); costs real cash, is optional, symmetric. **Not yet implemented for rivals** — `rivalStartingFacilities` and the `capacity` money-kind are entry-time-only in the inspected code; a rival post-entry capacity-growth policy would be new P15/P11/P12 scope. This is the single highest-leverage lever in this report: it is the *only* mechanism that would organically refill both §2 (saturation) and §3 (talent absorption) at once, because a bigger surviving studio needs more staff and releases more often, absorbing exactly the free agents and calendar slack that consolidation otherwise leaves idle. |
| Free-agent talent gravitating to the few remaining employers because they are the only bidders | **Legitimate** | This is just supply and demand under the existing offer/hiring law (`hollywoodTick.ts` reserve-gated hiring); no new rule needed, it already happens. It is also the direct cause of §3's "too easy" risk — legitimate and undesirable are not mutually exclusive. |
| Market pressure per release rising because fewer films exist in a genre window | **Legitimate** | Same aggregate-pressure formula, smaller population; not a rule change. This is the flip side of §2 — less competition also means each of the *survivor's own* releases faces less friction, which is a real, earned, emergent benefit of outlasting rivals, exactly mirroring real-world market consolidation. |
| A rule that raises a survivor's Standing/box-office multiplier simply because rival count dropped below N | **Forbidden subsidy** | No cost, no in-fiction cause, keyed directly to headcount — the mirror image of the floor Direction G forbids. Nothing in the reviewed code or authority docs proposes this; flagged only to draw the line explicitly, since the task asks for it. |
| Auto-granting a surviving studio extra capacity/staff for free when a rival closes | **Forbidden subsidy** | Same reasoning — "free" capacity is a floor on the survivor's *power*, not the population's count, but it is the same category of hidden rescue Direction G rejects for headcount. |

---

## 9. Do the failure triggers themselves make consolidation likely or rare?

This is, per the task, decisive, and the evidence in this codebase already answers half of
it. **Today, under the accepted code alone, consolidation is structurally impossible**,
because rivals have no failure law at all: `decide()` simply stops committing once
`cash < operatingReserve` and does nothing further (`hollywoodTick.ts:174`); fixed weekly
costs still post and cash can run arbitrarily negative with zero consequence
(`hollywoodTick.ts:280-282`; matches the already-established "run negative forever" fact
and the digest's correction that the current stall state is a de-facto zombie, not a
failure — `_DIGEST.md` line 34). So the entire premise of this section — a field that
thins from 10 to 1 — depends entirely on P15B/P11 authoring a *real* failure law, and the
single biggest lever inside that law is **whether rivals can borrow**:

- **If rivals never borrow** and simply hold to their authored reserve policy (12-20 weeks,
  per studio), they behave the way OpenTTD's human player behaves in singleplayer or the
  way a maximally conservative firm behaves: they stall, they don't grow, but under
  Direction D's "sustained inability to meet real obligations" test they may never actually
  cross into insolvency, because they always stop spending before their fixed obligations
  outrun their reserve. **Consolidation becomes rare-to-never** — which quietly reintroduces
  something close to an artificial floor by omission (rivals survive not because they are
  competent, but because the rule never lets them truly fail).
- **If rivals borrow under the same law the player will use** (Direction F: interest,
  must-repay, debt contributes to bankruptcy), each rival's fixed weekly burn
  (payroll + `OVERHEAD_BASE` + `OVERHEAD_PER_EMPLOYEE`×headcount + facility opex, already
  15,000 + 1,500/employee + up to 23,500 opex per the established facts) becomes a real,
  compounding liability whenever box-office revenue is weak for a sustained stretch.
  **Consolidation becomes possible and observable**, and — critically — it becomes
  *differentiated* by the same per-studio policy fields the manifest already authors:
  `reserveWeeks` (12-20), `negativeScale` (0.94-1.20), `marketingRatio` (0.14-0.24). A
  studio authored with reserveWeeks=12 and negativeScale=1.20 (Bright Meridian) is already,
  by design, the most exposed; one with reserveWeeks=20 and negativeScale=0.94 (Night
  Orchard) is already the most conservative. **Failure rate differentiation therefore
  already exists in the authored data and requires no new "who fails" logic — only a real
  law that lets the existing policy differences bite.**

**Recommendation:** give rivals loan access symmetric to the player's under Direction F,
and let failure rate emerge entirely from the existing per-studio `reserveWeeks` /
`negativeScale` / `marketingRatio` spread plus real market outcomes — never from a target
headcount, cadence, or "every N years, kill one studio" rule. This is exactly the
"emergent and observable rather than tuned to a target count" instruction in the task, and
it is achievable with data Project: Studio has already authored. If observed failure rates
in playtest run far outside a comfortable band, the correct dial is the *authored policy
spread* (loosen/tighten `reserveWeeks` ranges), never a hidden target-count throttle.

---

## 10. Late-game difficulty and performance

Confirmed mechanically: the weekly rival tick is `for(const b of h.businesses)` — one full
pass per active business (`hollywoodTick.ts:221`), so per-tick cost scales linearly with
active-business count and a 10→1 thinning genuinely is cheaper to simulate. **But this
saving is not automatic.** `StudioIdentity` currently has no status field at all (per task
facts); until P12 adds a durable active/dormant/closed registry fact and the tick loop is
changed to skip closed studios, a "closed" studio would either (a) still run the full
weekly business loop for no gameplay benefit (no savings, and worse, dead code paths
running against a business with no valid staff), or (b) require an explicit filter to be
added at the same time closure ships. This is a concrete engineering requirement to attach
to whichever package implements Direction D's closure transition, not a risk that needs
new design — just a checklist item so the performance benefit the task asks about actually
materializes.

Difficulty, separately from performance: nothing in this report finds late-game
consolidation makes the *player's own* economy harder — if anything §2-§4 show it gets
easier (less competitive pressure). The one place late-game difficulty could legitimately
rise is Direction E: as eras advance, `era.costScale` and rising overhead-per-employee at
larger scale make the *player's own* obligations heavier regardless of rival count, so a
monopolist player is not automatically "safe" — see §11.

---

## 11. Is a minimum active-studio floor actually needed?

**No.** Every mechanical surface this report inspected — shared-market pressure (§2),
Power Ranking (§5), the tick loop (§10) — already degrades gracefully to N=0 or N=1 rivals
without special-casing, matching OpenTTD's supported `max_no_competitors=0` and Transport
Fever 2's shipped zero-AI base design. The only authority-doc text recommending a floor
(`P13-P15-LONG-RANGE-ROADMAP.md` §19.3, "Later entrants / active-rival floor") predates the
2026-09-11 Owner direction and is **SUPERSEDED BY OWNER DIRECTION G**; its own source
citation (P12A SIM-015) was itself never Owner law (`_DIGEST.md` line 5/53/63). No comparator
in the reviewed set *praises* a synthetic floor (`comp-ranking.md` §3.5: "No source praises
synthetic respawn"); the comparator whose design is closest to Project: Studio's
authored-window entrants (GearCity) ships **without** one and the developer accepts a
thinning field as normal (`comp-ranking.md` §3.2).

---

## 12. The one severe risk found, and the least-intrusive safeguard

**Severe risk (named plainly): the talent-market collapse in §3**, driven by Direction G
(no replacement) and Direction H (closures dump rosters into free agency) compounding
without an offsetting sink. This is not a "too few studios" problem in the abstract; it is
a specific, evidenced supply/demand asymmetry with no closing mechanism in the currently
inspected code.

**Smallest correction — not a floor.** Ranked by intrusiveness, per the task's requested
option set:

| Rank (least → most intrusive) | Option | Verdict |
|---|---|---|
| 1 | **None beyond what Direction E already provides** | Baseline; insufficient alone for §3's risk |
| 2 | **Owner-visible "industry may consolidate" disclosure at new game** | **Adopt.** Zero gameplay-mechanic cost; matches the comparator lesson that a *disclosed* rule reads as policy, never as respawn, and that hidden rules (OpenTTD's settings-only floor) draw no praise while transparent ones draw no complaint either (`comp-ranking.md` §(c)) |
| 3 | **Player's own closure eligible under the same law (Direction E)** | **Already decided, not new.** This is the report's actual structural answer to "is a lone survivor still a game" — a monopolist still faces the same overhead/payroll/era.costScale law and can still fail; note it explicitly to the Owner as the real counterweight, not a floor |
| 3 | **Dormancy-with-return as a P15B recovery route (Blockbuster Inc. precedent — "pausing operations for a year before returning")** | **Already required by Direction D/E ("meaningful warning and recovery first") and by P15B's own "≥2 legitimate recovery routes."** Not a new mechanic for this section to invent — just confirm the recovery route reaches distressed rivals before terminal closure, softening the closure *rate* for free |
| 4 | **Capacity growth for surviving studios (§8)** | **Recommend as the actual fix for the severe risk.** Not "intrusive" in the sense of overriding player agency, but it is genuinely new scope (rival post-entry capex law does not exist yet) — costed, optional, emergent, and it is the only option here that closes the loop on freed talent rather than merely disclosing or softening the closure rate |
| 5 | **Authored optional late-entrant content pack, opt-in at world creation** | Evaluate only if the Owner wants authored end-game variety for its own sake (NBA 2K25 MyNBA precedent: a user *setting*, not simulated consolidation, `comp-ranking.md` §3.6). Real production cost (a full studio identity per entrant); does not violate Direction G because it is opt-in and non-synthetic in-fiction (a dated founding, not a respawn) |
| 6 (reject) | **Monopoly/antitrust ceiling (GearCity's >75%-share lawsuit)** | **Reject as a gameplay mechanic.** It is the mirror image of the floor the Owner explicitly rejected — an artificial *downward* force on earned dominance instead of an artificial *upward* force on headcount. The same instinct that forbids silently propping up a failing count should forbid silently punishing an earned one. (Real film-industry antitrust history — the 1948 studio-system divestiture — is a thematically apt idea for 2040 finale *narrative* content under Direction J, but that is unresearched here and a separate Owner decision, not a proposed mechanic.) |

---

## 13. Conclusion

**Consolidation is acceptable as the Owner selected it — say so plainly.** Nothing
mechanical breaks as the field thins from 10 toward 1; the market, ranking, and
performance surfaces all degrade gracefully; the comparator evidence favors GearCity's
"authored dates, real economic attrition, no synthetic respawn" pattern over any refill
timer, and no floor recommendation in the prior authority docs survives contact with either
the new Owner direction or its own P12A source (SIM-015, never law). No structural reason
was found to reopen Direction G.

**What must be reported to the Owner, specifically:**

1. **The talent-market risk (§3, §12)** is the one finding serious enough to flag on its
   own merits, independent of this section's "no floor" conclusion — it is a talent-market
   design problem (Directions G+H interaction), not a studio-count problem, and the
   proposed fix (rival capacity growth, §8) is new scope that does not currently exist for
   rivals.
2. **Rival loan symmetry (§9) is the actual dial that decides whether consolidation happens
   at all**, and it is currently undecided beyond Direction F's general "a studio can
   borrow." Recommend rivals borrow under the same law as the player, with failure rate left
   to the already-authored `reserveWeeks`/`negativeScale`/`marketingRatio` spread — never a
   target count.
3. **Power Ranking's minimum eligible-cohort size (§5)** is a genuine open UX decision with
   no numeric answer anywhere in the authority docs; the state machine to hold it already
   exists (`archived`/`insufficient-history`), only the threshold is undecided.
4. **The engineering requirement in §10** (closed studios must be excluded from the weekly
   tick loop once a status field exists) should ride along with whichever package implements
   Direction D's closure transition, or the claimed performance benefit of a thinned field
   will not materialize.
5. **The monopoly-lawsuit ceiling is recommended against** as a gameplay mechanic (§12); if
   the Owner wants late-game dominance to carry narrative weight, that belongs in the 2040
   finale's legacy archetypes (Direction J), not as an interrupting penalty.

---

## Package ownership

| Item | Owner |
|---|---|
| Rival closure/dormancy/distress transitions, "no synthetic replacement" enforcement | P15B (proposes/coordinates) through P12 (authoritative registry state) |
| Rival loan symmetry, interest, obligation law | P11 (ledger/debt math authority) with P15B supplying distress context, per Direction F |
| Power Ranking cohort/eligibility/archived-studio presentation | P15A.2 |
| Rival post-entry capacity growth (the §8 counterweight) | New scope — not currently owned by any inspected package; likely P15B/P11/P12 joint, flagged here for Owner package-boundary assignment |
| Talent free-agency absorption / P14C cohort sizing interaction with a shrinking employer pool | P14C, coordinating with P15B closure events |
| Weekly-tick performance filtering of closed studios | Whichever package lands the `StudioIdentity` status field (P12) |
| M&A boundary and its interaction with a shrinking field | P15I / new package per Direction I — out of scope here, flagged as an interaction only |
| 2040 finale treatment of dominance/consolidation/possible antitrust narrative flavor | P15C (finale) — Direction J |

---

## Corrections to prior P15 text touched by this section

- **SUPERSEDED BY OWNER DIRECTION G** — `P13-P15-LONG-RANGE-ROADMAP.md` §19.3 "Later
  entrants / active-rival floor" row's recommendation of "P12's minimum three active AI
  rivals" as ongoing law.
- **SUPERSEDED BY OWNER DIRECTION G** (already corrected by the phase1-verify digest before
  reaching this report) — any reading of P12A SIM-015 or PERF-001's 6-10/12 envelope as
  Owner-binding; both are explicitly "not Owner law."
- **QUALIFIED** — P15's Corporate-title clarification and P16+ parking of "acquisitions,
  mergers...valuation" (`P13-P15-OWNER-RULINGS.md` §4.2, §5) is partially superseded by
  Direction I (eventual buyout ability) and Direction C (net worth must be shown); this
  section defers the exact boundary to `comp-ma`/P15I and notes the interaction only.
