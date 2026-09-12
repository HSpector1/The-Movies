# Dossier 12 — Gap 2: Does P15's shared-market law contain a Hollywood-Animal-style concentratable resource?

## Scope

Follow-up task only (gap 2 from the ten-dossier synthesis): check Dossier 06's inference — "never let an
acquisition or asset class grant exclusive access to the shared audience channel" — against Project:
Studio's own P15 package (Corporate Hollywood / Shared Market / Studio Legacy), read in full, plus its
Builder Annex, cross-checked against P12 (accepted code + design package) and Dossier 06 F3/F4's exact
Hollywood Animal (HA) mechanism. Question to answer precisely: does Project: Studio have, or plan, any
resource that is (a) capacity-limited/contested across all studios AND (b) increasable in share by owning
more of something purchasable/acquirable? This dossier does not re-litigate any other gap and does not
reopen settled Owner decisions.

## Method & sources consulted

- Read `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` in full (1,040 lines: §1–26), not only
  §12.3, at `p13-docs/docs/design/`.
- Read `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md` in full (1,268 lines) at the
  same path, focused on the state-model/lifecycle tables and vocabulary (§B–D and the fixture list).
- Cross-checked `CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` (1,193 lines, accepted-code-era
  design package) and its Builder Annex at `p12-accepted/docs/design/`, targeted at capacity, market,
  screen/exhibition, awards-nomination, and talent-pool language.
- Spot-verified two accepted-code claims directly against the exported accepted tree
  (`p12-accepted/src/core/hollywoodTick.ts`) rather than trusting doc prose alone, since PATHS.md states
  that export's `src/` is byte-identical to the accepted runtime commit.
- Re-read Dossier 06 (`06-comparators-B.md`) F3/F4 in full for the exact HA mechanism, and skimmed
  `00-KEY-FINDINGS.md` for prior treatment of the active-rival floor and employee-contract-transfer
  questions so this dossier extends rather than repeats them.
- No web fetches were needed; every claim below resolves inside the supplied exports. Nothing failed.

## Findings

**F1. [HIGH / CURRENT-ACCEPTED CODE / NEW] Accepted code today has no shared-market law of any kind — no
genre saturation, no release-overlap penalty, no screen/audience-competition formula.**
- Source: `p12-accepted/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:46`. Verbatim:
  "The current engine has no active genre-saturation, release-overlap, screen-capacity, or
  audience-competition law. `MarketState.competingSlate` is empty at world generation and
  `computeBoxOffice()` hard-codes `competitionFactor = 1.0`."
- Proves: as shipped/accepted, there is nothing for a P16 acquisition to concentrate on the demand side —
  the box-office formula does not read studio size, ownership, or any cross-studio share variable at all.

**F2. [HIGH / APPROVED DOCUMENTATION (decision-ready research candidate, not yet implemented) / NEW]
P15A's recommended shared-market mechanic is a symmetric, per-release genre/window saturation pressure,
not an ownership-share or exclusive-access resource.**
- Source: `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:90` ("P15A — Shared Market: symmetric
  genre/release pressure, decay..."); `:216-222` §5.2 ("public genre interest responded to how many films
  all studios were releasing in that genre. Saturation could make a strong film underperform after rival
  output."); `:804` ("**P15A.1 proves genre + governed release-window pressure**"); Builder Annex `:54-55`
  (glossary: "Market pressure | bounded, versioned consequence of known active exposure in a defined
  genre/segment/window | [not] popularity, Standing, rank, or arbitrary penalty"; "Exposure | one film's
  time-bounded contribution to shared market state | [not] its full box office or permanent genre
  damage").
- Proves: the mechanic degrades outcomes for every film (including the releasing studio's own) that
  crowds a genre/window; it is a shared negative externality computed from release *count*, not an
  ownable slot, seat, or channel that one studio can hold and thereby deny to rivals. Nothing is purchased
  or acquired to gain access to it — any studio, of any size, can freely release into any genre/window.
  This is structurally unlike HA's cinemas (F3 below), which are a purchasable, exhaustible, ownable asset
  that directly gates rivals' ability to monetize a release at all.
- Prior-prose status: NEW relative to the gap-2 question (P15 itself was read but never checked against
  Dossier 06's HA finding before now).

**F3. [HIGH / APPROVED DOCUMENTATION + CURRENT-ACCEPTED-CODE-ERA DESIGN PACKAGE / CORRECTS Dossier 06's
inference from "hypothetical risk" to "explicitly considered and explicitly deferred"] The one candidate
resource that would actually replicate HA's mechanism — screen/exhibition capacity — is named in P15's own
decision table and deliberately excluded from approved scope, for exactly the reason Dossier 06 warns
about.**
- Source: `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:805`, the market-formula Owner-decision
  row. Verbatim: "screen/exhibition capacity | absent; abstract audience attention; explicit screen pool |
  **omit from P15A.1; research later before adoption** | avoids fake precision and **a second
  scarce-resource model** | distribution/exhibition authority and explainability study | No".
- Corroborating source: `p12-accepted/.../CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:1151`,
  the "Later" (unapproved) list: "...**theatrical screen scarcity, advertising-space scarcity**, and
  ownership finance." Also P15 §25 explicit deferrals list includes "explicit theatrical
  screen/exhibitor/distributor markets" among "Other later systems."
- Proves: the exact HA analogue has zero footprint in current or approved Project: Studio scope. It was
  considered by name and rejected for the first shared-market checkpoint specifically to avoid introducing
  a second scarce, purchasable, gating resource alongside genre pressure — independently arriving at the
  same caution Dossier 06 drew from HA, before this cross-check ever happened.
- Prior-prose status: CORRECTS Dossier 06's design implication #3 from a pure inference ("never let...")
  into a verified fact: Project: Studio's own design authorities already excluded the one mechanic that
  would trigger the risk, on their own reasoning, independent of the comparator research.

**F4. [HIGH / CURRENT-ACCEPTED CODE / NEW] The one resource in accepted code that genuinely is
capacity-limited and contested across every studio (player and all rivals) is the finite, non-replenishing
talent pool under strict one-employer exclusivity — not anything market/box-office-shaped.**
- Source: `p12-accepted/.../CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:647`. Verbatim:
  "**CURRENT CODE VERIFIED** — The world is not 120-year safe. World generation creates 60 people: 12
  writers, 10 directors, 28 actors, and 10 craft. There is no autonomous entrant, aging, retirement,
  death, or industry replenishment."
- Corroborating: Dossier 04 (`04-code-audit.md` F5.4) verified three enforcement layers for one-employer
  exclusivity directly in accepted code (`hollywoodValidation.ts`, `employment.ts`, `hollywoodTick.ts`);
  this dossier did not re-derive that, only re-used it as already-HIGH-confidence.
- Proves: this population is fixed at world-gen and shared — every signed contract subtracts one person
  from every other studio's (and the player's) available pool, and nothing currently regenerates it. It
  satisfies criterion (a) of the follow-up question (capacity-limited/contested across all studios) far
  more literally than anything in the market/exposure system does.
- Qualification: access to this pool is via signing a free agent, not via "owning more of something
  purchasable" in the P16 acquisition sense — so on its own, today, it does not yet satisfy criterion (b).
  See F5 for where P16 could change that.

**F5. [MEDIUM / INFERENCE, explicitly not settled Owner law / NEW — extends 00-KEY-FINDINGS' existing
contract-succession inference] Whether a P16 acquisition could let one studio concentrate an outsized share
of that finite talent pool depends entirely on the still-open Owner question of whether inherited
contracts transfer intact.**
- Source: ASSIGNMENT.md §2.F Q3 ("Do employee contracts transfer intact?") is listed as a question to
  answer, not a settled fact. `00-KEY-FINDINGS.md:104` already carries the working inference: "Employee
  contracts transfer as a statutory P12 employer transition: end target IndustryEmployment row, mint new
  row under buyer with identical terms and a new reason..."; `00-KEY-FINDINGS.md:158` notes P14 explicitly
  parks "acquisition/merger transfer of workforce" to P16+ and warns "Acquisition is not verified
  original-game parity and cannot be smuggled into a talent transfer implementation."
- Proves: if the Owner adopts the natural-looking rule that signed contracts transfer with the studio (the
  direction every real-world case in Dossier 08 and most comparators in Dossier 06/07 point toward for
  healthy acquisitions), then Paper Scenario E's serial acquirer (three studios in ten years) would, absent
  a boundary rule, progressively concentrate a growing fraction of a *fixed, unreplenished* population of
  60 people under one employer — tightening every remaining and future rival's ability to staff a
  production (P12 requires "assigned writer/director/cast/craft" to produce at all). This is a slower,
  partial, non-binary structural cousin of HA's cinema snowball: it raises rivals' staffing friction rather
  than fully gating their revenue, but the shared/finite/no-replenishment substrate is the same shape of
  risk Dossier 06 warned about, arising in a different subsystem (P10/P12 labor, not P15 market/exposure).
- This is this dossier's own inference, going beyond the literal terms of the follow-up prompt (which
  named only market/exposure mechanics); flagged accordingly and kept to MEDIUM confidence because it
  depends on an unmade Owner ruling.

**F6. [MEDIUM / INFERENCE / NEW — connects two previously separate findings] Serial P16 absorption would
also indirectly reduce genre-saturation pressure on the survivor's own slate, because P15A's pressure
formula is driven by the *count* of active releases across all studios and removing a rival studio removes
an independent source of that pressure.**
- Source: `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:216-222` (pressure driven by "how many
  films all studios were releasing in that genre"); `00-KEY-FINDINGS.md:165` (already-flagged structural
  coupling): "Each absorption permanently reduces active rivals unless a P15B entrant slice exists — a
  structural anti-snowball coupling P16 must address."
- Proves: this is not a new risk category, but it does mean the active-rival-floor/entrant-slice guard
  that 00-KEY-FINDINGS already recommends for registry health (§2.J rival symmetry, awards cohort, Power
  Ranking cohort) is *also* load-bearing for P15A market health once that package ships — a serial acquirer
  that shrinks the field to below the floor would be quietly de-congesting its own genre-pressure exposure
  as a side effect of removing competitors, not by cornering an owned resource. No new mechanism is needed
  beyond the P12 floor already identified; this only widens what that floor is protecting.

**F7. [HIGH / directly answers the assignment's named example candidates, in the negative] None of the
assignment's suggested example resources — a fixed weekly release-slot count, a capped marketing/publicity
pool, or a fixed per-category awards-nomination count — currently exist as accepted code or approved,
adopted law.**
- Source, release slots: no release-slot cap appears anywhere in P15 or P12; P12
  (`.../CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:715`) states "**CURRENT CODE VERIFIED** —
  the current Studio Calendar is a player operational projection and explicitly creates no schedule...
  There is no chosen theatrical date, screen inventory, distributor capacity, or industry calendar." Films
  release automatically on a countdown; there is no admission-controlled release calendar to compete over.
- Source, capacity units (line 637, quoted under F4's neighborhood): "concurrent development and
  production slots" are named as a per-studio capacity resource, "increased only through a cost/time
  action" — this is internal to each studio (like a facility), never a global pool one studio's growth
  subtracts from another's; it fails criterion (a) (not contested across studios).
- Source, awards/nominations: `pkg-docs/docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md:45,362`. Verbatim:
  "Award eligibility, seasons, nominations, winners, effects, rank, certificates, and ceremony state do
  **not** exist" in accepted code; "There is no current `Award`, `AwardSeason`, category registry,
  eligibility selector, candidate pool, nomination, winner, effect, or save root." Even the forward-looking
  "Academy threshold model" (`:395`) is explicitly marked as requiring its own future "explicit Owner
  review," i.e. it is a preliminary recommendation, not adopted law, and it is single-player-shaped (no
  multi-studio nomination-slot competition is even proposed yet).
- Proves: none of the assignment's example capacity resources are live candidates today; the search
  correctly comes back empty for all three named examples, leaving the talent pool (F4/F5) as the one real
  finding beyond a clean "no" on the market/exposure system itself (F1-F3).

## Design implications for P16 (Claude's inference, explicitly labelled)

1. **No correction is needed to P15's market/exposure design.** P15A's own authors already excluded the
   one mechanic (screen/exhibition capacity) that would create an HA-style snowball, and did so for the
   same reason Dossier 06 gives ("a second scarce-resource model"). P16 need only keep not creating one on
   the demand side — Dossier 06's implication is CONFIRMED as correct guidance, now on verified rather than
   inferred grounds, and requires no further action from P16 today.

2. **Forward flag, not a present decision:** if and when the Owner later authorizes screen/exhibition
   capacity (P15A's own deferred option, or any comparable "explicit theatrical screen/exhibitor/
   distributor market" from P15 §25's "Other later systems"), that authorizing package should be required
   to adopt a per-studio cap on the scarce unit that is set independent of facility count, production
   count, or acquisition history — precisely so a P16 acquisition concentrating two studios' facilities
   cannot corner it the way HA's cinemas were cornered. This dossier does not author that rule now (the
   resource does not exist yet, and P15A.1's own stop line forbids adding corporate state to the first
   checkpoint); it only records the trigger condition for whoever authors that future package.

3. **The one live version of "concentrate a contested resource via acquisition" is the talent pool, not
   the market system, and P16C's contract-assumption rule should say so explicitly.** Recommend: an
   acquirer's assumed headcount should be bounded by the acquirer's *own* production/development capacity
   (the same capacity-linked staffing discipline current rival AI already follows — accepted code's
   `staff()` only hires to fill its one active production, never accumulating idle contracts, per
   `hollywoodTick.ts:85-146`), and any inherited contracts beyond that capacity should be required to
   settle (ordinary termination law, cost paid, per §2.F Q4's own direction) within a bounded integration
   window rather than being held indefinitely. This is a size-independent, capacity-linked boundary rather
   than an arbitrary headcount cap, consistent with §2.S's "find the minimum necessary protection" and
   with the existing single-lot/no-teleporting-capacity rules the Owner has already selected in §F/§G. It
   prevents a hoarding-as-lockout exploit (buy studios, freeze their rosters, starve rivals of hires)
   without inventing a new scarce-resource law.

4. **The already-identified active-rival floor (00-KEY-FINDINGS #165/#177) should be understood as
   protecting P15A market health, not only registry/awards/Power-Ranking cohort health.** No new mechanism
   is recommended; this only broadens the stated rationale for a guard P16 already needs for other reasons.

## Open questions

1. Will the Owner rule that inherited employee contracts transfer intact at acquisition (assignment §2.F
   Q3)? This single ruling determines whether F4's fixed talent pool becomes a real P16 concentration
   vector or stays inert. Not this dossier's decision to make.
2. If/when screen/exhibition capacity is ever authorized, will its authoring package adopt a per-studio,
   size-independent cap as implication #2 above recommends, or some other anti-concentration law? Open
   until that future package exists; flagged, not decided, here.
3. Does the 60-person world population ever get a formal replenishment law (P12 mentions only an ad hoc
   "Package 10-compatible seam" for adding deterministic unique people if a fixture can't be satisfied)? A
   real replenishment law would materially reduce F5's concentration risk; its absence keeps the risk
   live but bounded (Scenario E's timescale of "three studios in ten years" is short compared to the
   1920-2040 campaign).
4. Does P15A.1's per-release pressure formula ever get a size-aware term (e.g., discounting a mega-slate's
   own internal saturation differently than an equivalent count of independent studios' releases)? Nothing
   in the read documents suggests this is planned or needed; flagged only because it is the one place a
   studio's raw size (post-acquisition) could interact with the pressure formula's release count, and it
   was not found to do so.

## Source table

| # | Source | Exact locator | Tier | Used for |
|---|---|---|---|---|
| 1 | P15 package | `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md:90,216-222,402,514-516,804-805,§25` | APPROVED DOCUMENTATION (decision-ready research candidate) | F2, F3, F6, implication 1-2 |
| 2 | P15 Builder Annex | `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md:54-58` | APPROVED DOCUMENTATION | F2 (glossary) |
| 3 | P12 design package | `p12-accepted/.../CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md:46,637,647,715,1151` | CURRENT/ACCEPTED-CODE-ERA design package | F1, F3, F4, F7, implication 3 |
| 4 | P12 accepted code (spot-check) | `p12-accepted/src/core/hollywoodTick.ts:85-146` | CURRENT/ACCEPTED CODE | implication 3 (staff() only fills active production) |
| 5 | P08 Awards package | `pkg-docs/docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md:45,362,395` | APPROVED/product-law-track design package for its domain, but awards/nominations themselves are unimplemented and un-adopted | F7 |
| 6 | Dossier 04 (this program) | `dossiers/04-code-audit.md` F5.4 | prior evidence dossier, already HIGH | F4 corroboration |
| 7 | Dossier 06 (this program) | `dossiers/06-comparators-B.md` F3, F4 | prior evidence dossier | scope baseline / comparator mechanism being checked |
| 8 | Dossier 00 (this program) | `dossiers/00-KEY-FINDINGS.md:104,158,165,177` | prior synthesis | F5, F6 cross-reference |
