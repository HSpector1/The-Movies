# P15 Prior-Research Claim Register

**Package:** P15 — Corporate Hollywood, Shared Market & Studio Legacy
**Lane:** Phase 1 / prior-claims (pure document extraction; no web used)
**Date:** 2026-09-11
**Mode:** READ-ONLY. Nothing under any git repository was modified. No branch other than the pinned 592e926 extraction was inspected. No player profile or campaign data was touched.

## 0. Scope, method and how to read the table

### 0.1 Documents extracted

| Short name | File | Lines read |
|---|---|---|
| PKG | `scratchpad/authority/P15-PACKAGE.md` (`CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md`, written against TS `7811377`, save V15) | all 1,040 |
| ANNEX | `scratchpad/authority/P15-BUILDER-ANNEX.md` | all 1,268 |
| ROADMAP | `scratchpad/authority/P13-P15-LONG-RANGE-ROADMAP.md` | §§1–7, 15, 18–26 (task scope §6.3, §7, §18–21 plus surrounding context needed to place those sections) |
| RULINGS | `scratchpad/authority/P13-P15-OWNER-RULINGS.md` (Owner approved 2026-08-31 at research commit `2a7ff0d`) | all 206 |
| HANDOFF | `scratchpad/authority/P12-TO-P13-PRODUCER-HANDOFF.md` (P12 R05, accepted 2026-09-11, runtime TS `592e926`) | all 39 |
| RECEIPT | `scratchpad/authority/P12-R05-OWNER-ACCEPTANCE-RECEIPT.md` | all 53 (context only) |

### 0.2 Supplementary checks performed (read-only)

- **Code-path existence check** against the accepted snapshot `scratchpad/accepted-592e926/` (file existence + `grep`). This is a first-pass flag for the later code verifier, **not** a verification. Results are in §2.
- **Original-game plain-text check** of the (M) rows against `scratchpad/original-text/prima.txt` and `manual.txt` (line numbers cited; printed page numbers taken from the page markers embedded in the extraction). Results are in §3 and the (M) rows.

### 0.3 The NEW Owner direction (2026-09-11) used for the collision column

| Letter | New direction |
|---|---|
| A | Shared market = genre + release-window competition (~4-week window, tuning open) |
| B | Power Ranking quarterly, transparent multi-factor (commercial, prestige, output/reliability) + financial strength somewhere meaningful |
| C | Studio net worth / valuation to be calculated and displayed |
| D | Rivals CAN fail: healthy → warning → distress → severe → insolvency → settlement/auction/closure; IDs never recycled; history preserved |
| E | PLAYER CAN ultimately fail, with warning/recovery first (revises protected continuity) |
| F | Loans exist, with interest and repayment |
| G | NO automatic replacement studios; consolidation is desirable; authored P12 arrivals preserved; NO artificial floor |
| H | Failed-studio talent → free agency with a big industry notice |
| I | Eventual ability to BUY other studios (package placement open) |
| J | 2040 = ceremony + interactive Legacy dossier, no single score |
| K | Post-2040 = Endless Sandbox that does not rewrite the frozen 1920–2040 Legacy |

### 0.4 Status vocabulary (column 7)

- **CONFIRMED** — the claim stands under the new direction and (where checkable) against the extractions/snapshot.
- **QUALIFIED** — the claim survives but must be narrowed, re-worded or re-parameterised.
- **CORRECTED** — the claim is factually stale or wrong against a source I could inspect (usually the 592e926 snapshot or the P12 handoff).
- **SUPERSEDED BY OWNER DIRECTION** — the claim was correct as a recommendation/open question but the 2026-09-11 direction resolves or reverses it.
- **NEEDS CODE CHECK** — a code/seam claim the later verifier must test against 592e926 (I give a first-pass existence flag where I have one).

Where a row carries two statuses (e.g. "QUALIFIED; NEEDS CODE CHECK") both apply.

**Governance note.** RULINGS §8 says a *newer explicit Owner ruling* governs over the 2026-08-31 record. The 2026-09-11 direction is exactly that, but I have not seen it recorded in a durable ruling document. Every "SUPERSEDED BY OWNER DIRECTION" row therefore assumes the direction will be recorded; until then the 08-31 record is the only written authority.

---

## 1. The register

Columns: **ID | Topic | Doc & section | Claim (paraphrase, ≤30 words) | Doc's own label | Collides with new direction? | Preliminary status**

### A. Shared market / release window / genre saturation / screens

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| A1 | A | PKG §2 (L90–91) | P15A Shared Market = symmetric genre/release pressure, decay, disclosed upcoming releases; Power Ranking separately authorized later. | Recommended sequence (PRELIMINARY RECOMMENDATION) | none; aligned with A | CONFIRMED |
| A2 | A | PKG §2 (L104–111); RULINGS §4.1 (L129–130) | First checkpoint P15A.1 = one player release + one rival release, same window/genre, one versioned symmetric rule, typed reasons. Owner approved this bound. | Bounded checkpoint / OWNER APPROVED | none | CONFIRMED |
| A3 | A | PKG §3.3.1 (L149–163); ROADMAP §5.4, §19.3 row 1 | Re-home P12C shared market → P15A; P12 retains StudioId, projects/releases, scheduling, disclosure. Marked as blocking P15A.1. | OWNER DECISION REQUIRED → approved in ROADMAP §26 / RULINGS §4.1 | none | CONFIRMED (approved 08-31) |
| A4 | A | PKG §11 laws 1, 8, 9; §17 | One market, one law; no player-only penalty; no hidden rival subsidy; no `isPlayer` multiplier. | Binding design law | none | CONFIRMED |
| A5 | A | PKG §12.1 (L427–437); RULINGS §4.1 | Binding same-week law: freeze all eligible releases for week W and pre-batch snapshot; self-exclusion; one all-or-none `GameState` candidate; ID order never a formula advantage. | Binding law / OWNER APPROVED ("frozen same-week batches with exact self-exclusion") | A sets a ~4-week *window*; the same-week *batch* is the commit unit. Not contradictory, but the two must be reconciled in one definition (batch = commit boundary; window = exposure duration). | QUALIFIED |
| A6 | A | PKG §16 (L602–604) | Market pressure affects a release only via a versioned prospective reception input before result commit; never debits cash or rewrites P07 run arithmetic after release. | Binding law | none | CONFIRMED; NEEDS CODE CHECK (which 592e926 seam is the "prospective reception input": candidates `reception.ts`, `receptionVerdict.ts`, `releaseAuthority.ts`) |
| A7 | A | PKG §23 "market formula" row (L804) | Recommend genre + governed release-window pressure; screens only after measured value. Exact first formula choice blocks P15A.1. | PRELIMINARY RECOMMENDATION / OWNER DECISION | A adopts genre + window (~4 weeks). | CONFIRMED (Owner selected; window value now ~4 weeks, tuning open) |
| A8 | A | PKG §23 "screen/exhibition capacity" row (L805); §5.7; §25 | Omit screens/exhibition from P15A.1; research later before adoption; original gives no screen model. | PRELIMINARY RECOMMENDATION | none (direction is silent on screens) | CONFIRMED |
| A9 | A | PKG §24 OQ1 (L817–818) | Which release window is smallest but understandable: same week, four weeks, quarter, run-overlap? | OPEN QUESTION | A answers ~4 weeks, tuning open. | SUPERSEDED BY OWNER DIRECTION |
| A10 | A | PKG §24 OQ2, OQ4, OQ5, OQ6 | Exposure basis (intent vs release vs reach), disclosure lag, era-stable genre taxonomy, cancel/delay unwinding. | OPEN QUESTION | none — still open | CONFIRMED (still open) |
| A11 | A | PKG §12.1 (L421–423); ANNEX B "Industry release schedule" | P12 owns schedule/disclosure/delay/cancel/release facts; P15 never stores an `industryCalendar` copy. | Binding law | none | CONFIRMED; NEEDS CODE CHECK (what P12 disclosure roots exist at 592e926: `hollywoodTick.ts`, `bridge/industry.ts`) |
| A12 | A | PKG §3.1 (L119–121); ANNEX R; §29 HQ19 | P15 begins only when P12 supplies ≥2 conserved studio identities and *real* rival releases. | Precondition / stop condition | none | QUALIFIED; NEEDS CODE CHECK — HANDOFF says P12 R05 delivered 1 player + 9 rival IDs, four opening rivals, real projects → releases with theatrical runs, so the precondition is *probably now met* at 592e926 |
| A13 | A | ANNEX D.1 `exposureWindowWeeks` | Window is a positive bounded integer in the versioned market definition. | Conceptual entity | A → value ~4 | CONFIRMED (parameter, now ~4) |
| A14 | A | ANNEX B rows "Shared Market", "Exposure window", "Decay" | Shared Market ≠ player debuff or UI trend; window = exact weeks; decay is deterministic, not rubber-banding. | Canonical terminology | none | CONFIRMED |
| A15 | A | ROADMAP §6.3 (L211) | P15A = genre demand, saturation/decay, atomic same-week batches, P12-known releases; screens excluded and need separate research. | Recommended slice / approved spine | none | CONFIRMED |
| A16 | A | HANDOFF "P15A / P15A.2" (L26) | P12 adds neither new rival-release box-office penalties nor a composite Standing score; those stay P15A/P15A.2. | Accepted producer boundary | none | CONFIRMED; first-pass code flag: `reception.ts:679 const competitionFactor = 1.0` still neutral at 592e926 (see L5) |
| A17 | A | PKG §19 (L722–727); ANNEX L.2–L.3 | Endurance fixtures: expected 16 studios / 20k films / batch 32; hostile 64 studios / 100k films / batch 512. | Endurance inputs, "not shipping-content promises" | none directly; but G (consolidation, no floor) means studio count can *fall* over the century — fixtures should add a shrinking-cohort case | QUALIFIED |
| A18 | A | PKG §14; ANNEX M.1–M.2 | World-first route: lot pulse → Open Shared Market → source film → exact Back; no camera hijack. | Design law | none | CONFIRMED |

### B. Power Ranking cadence, lanes, exclusions

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| B1 | B | PKG §2, §3.2 (L127), §26 P15A.2; ANNEX A | Power Ranking lives only in P15A.2, authorized separately after real P15A.1 history exists. | Sequence law | B wants quarterly PR but does not name a slice; sequencing not contradicted. | CONFIRMED (placement still P15A.2 unless Owner moves it) |
| B2 | B | PKG §11 law 3; ROADMAP §5.1; RULINGS §4.1 | "Standing is not rank": Standing = persistent reputation, Power Ranking = periodic momentum, History = permanent fact. Not a fourth Standing channel. | Binding law / OWNER APPROVED | B adds a *prestige* factor. If "prestige" is sourced from P08 Industry Prestige Standing, this collides with "never reads Standing" (B5). If sourced from awards/honors in-window, it is the existing recognition lane. | QUALIFIED |
| B3 | B | PKG §12.2 (L448–449); §23 cadence row | Publish quarterly after one complete trailing 52-week window; event publication only after history exists. | PRELIMINARY RECOMMENDATION | B = quarterly. 52-week trailing window is not addressed by direction. | CONFIRMED (cadence); window still open |
| B4 | B | PKG §12.2 (L449–452); ANNEX D.4 laneDefinition | Three independent public 0–10 lanes: film-outcome momentum (≤4 strongest P07 outcomes), recognition momentum (P08 honors), delivery momentum (P12 scheduled→released). | PRELIMINARY RECOMMENDATION | B = commercial, prestige, output/reliability **+ financial strength**. Lanes 1–3 map roughly to B's first three; financial strength is absent. | SUPERSEDED BY OWNER DIRECTION (add a financial lane; keep transparency) |
| B5 | B | PKG §12.2 (L452–454) | The definition "never reads Standing, cash/valuation, private slate, technology adoption, talent popularity, or a client calculation". | PRELIMINARY RECOMMENDATION | B ("financial strength somewhere meaningful") and C (valuation displayed) collide with the cash/valuation exclusion. | SUPERSEDED BY OWNER DIRECTION (cash/valuation exclusion); QUALIFIED (Standing/private-slate/client-calc exclusions should survive) |
| B6 | B | PKG §12.2 (L454–456); ANNEX D.4 | Points = unweighted lane sum 0–30; dense rank on equal totals; `StudioId` orders equal rows but cannot break the tie. | PRELIMINARY RECOMMENDATION | B says "transparent multi-factor"; unweighted sum is one transparent option; Owner may want weights. | QUALIFIED (weights are an Owner choice) |
| B7 | B | PKG §12.2 (L456–458); §26 P15A.2 | Owner must approve/revise/reject lanes, bands, four-film cap, 52-week window, unweighted sum, dense-tie law before P15A.2; P15A.1 does not depend on it. | OWNER DECISION REQUIRED | B partially answers (cadence + factor families). Bands, cap, window, tie law remain open. | QUALIFIED |
| B8 | B | PKG §23 "Power Ranking definition" row (L803); ROADMAP §19.3 | Three lanes "avoids Standing/valuation duplication and volume spam"; "excludes Standing, cash/valuation, private slate, and client math". | PRELIMINARY RECOMMENDATION | B/C re-admit financial strength/valuation. | SUPERSEDED BY OWNER DIRECTION |
| B9 | B | ANNEX D.4 (L253–254) | Do not store an unexplained blended `powerScore` merely to sort rows; TypeScript emits the authoritative order. | Builder rule | none — B's "transparent" matches | CONFIRMED |
| B10 | B | ANNEX C.2 rank state table | insufficient-history → eligible → published → superseded; archived studio excluded with explicit eligibility reason; history retained. | State law | D: failed/closed studios become "archived studio" rows — compatible. | CONFIRMED |
| B11 | B | ANNEX E.7; PKG §27 GJ27 | No rank field in P15A.1 DTOs, "not even an unused nullable field"; no `#1`, arrow or Power Score. | Builder rule | none | CONFIRMED |
| B12 | B | ANNEX M.4 | Persistent banner: Power Ranking is recent momentum; Standing and History are separate. | UI law | none | CONFIRMED |
| B13 | B | RULINGS §4.3 (L140–141) | Power Ranking cadence and formula are OPEN Owner decisions. | OWNER DECISION OPEN | B resolves cadence (quarterly) and factor families; exact formula still open. | SUPERSEDED BY OWNER DIRECTION (partially) |
| B14 | B | PKG §24 OQ7 | What minimum comparable history makes P15A.2 rank honest? | OPEN QUESTION | none | CONFIRMED (still open) |
| B15 | B/M | PKG §5.1, §6 row 2 | Original Studio Rating composite (Capital 24 / Movies 24 / Stars 24 / Lot Prestige 14 / Awards 14) is "historical reconstruction only; do not copy composite". | SOURCE VERIFIED + P15 treatment | B's factor set (commercial, prestige, output, **financial strength**) is *closer in spirit* to the original composite (which included Capital) than the P15 recommendation allowed. Still successor design, not a parity copy. | QUALIFIED (verified against prima.txt L2816–2860, printed pp. 45–46; see M2) |

### C. Valuation / net worth

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| C1 | C | PKG §2 (L99–102); §25 "P16+" bullet "studio and library valuation" | Valuation moves to P16+ Studio Empire & Ownership Transactions. | PRELIMINARY RECOMMENDATION / explicit deferral | C: valuation calculated and displayed (now). | SUPERSEDED BY OWNER DIRECTION |
| C2 | C | ROADMAP §6.3 (L215); §20 "studio valuation"; RULINGS §5 | Valuation belongs in P16+, not P15B; listed in the approved P16+ parking lot. | PRELIMINARY RECOMMENDATION / OWNER APPROVED parking | C | SUPERSEDED BY OWNER DIRECTION (newer explicit ruling per RULINGS §8, once recorded) |
| C3 | C/D/E | ROADMAP §5.3 (L167) | P15B cannot infer debt, valuation, insolvency or an acquisition price from the *present* ledger; P11 runway selectors are incomplete and cannot become distress authority without an accepted read-model repair. | PROJECT AUTHORITY (technical) | C, D, E, F all need exactly these quantities. The claim is a *dependency statement*, not a prohibition: P11 must supply them. | QUALIFIED; NEEDS CODE CHECK (state of P11 runway/forecast selectors at 592e926: `forecast.ts`, `financeReport.ts`, `economyView.ts`) |
| C4 | C | PKG §23 acquisition row (L797) | Acquisition "later needs valuation, contract assumption, ownership/IP history". | Consequence column | C moves valuation earlier, which removes one stated reason to defer acquisition. | QUALIFIED |
| C5 | C/B | ANNEX E.4 IndustryStudioStatusDto; ANNEX F.2; HANDOFF "Financial boundaries" (L15) | Public industry rows carry no private cash; rival Cash/salaries/policy/forecasts stay hidden; public gross ≠ Cash/Contribution/profit. | Builder rule / accepted P12 law | C ("displayed" — for whom?) and B (a financial lane must use *public* facts). A rival's net worth cannot be shown from hidden Cash without a new disclosure rule. | QUALIFIED (Owner must decide what part of valuation is public per studio, or accept a banded/disclosed proxy) |
| C6 | C | PKG §13.1 last para; ANNEX H "film library/IP/rights ownership" | Legal ownership, rights and chain-of-title roots remain P16+; `FilmResult` is not a library/IP model. | DO NOT TOUCH / P16+ | C: a *library value* component of net worth would need at least a film-catalog valuation input, not legal rights. | QUALIFIED; NEEDS CODE CHECK (what a "released-film catalog" projection can be built from at 592e926) |

### D. Rival failure / dormancy / closure / settlement / floor / replacement

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| D1 | D | PKG §2 (L92–95) | P15B only if approved: bounded warning, distress, recovery, later entrants, dormancy under the same pre-terminal gates. | Recommended sequence | D approves failure with a richer ladder (…severe → insolvency → settlement/auction/closure); dormancy not in Owner's ladder; "later entrants" collides with G. | QUALIFIED (P15B now directionally authorized; ladder revised) |
| D2 | D/E | PKG §2 (L93–95); §12.3 (L470–474); §16 (L624–627); §17 (L651–655) | P12 permits rival failure while the player has no mandatory hard-bankruptcy game-over; exact rival closure and any player terminal ending are distinct Owner decisions. | PROJECT AUTHORITY VERIFIED | D and E now decide both. | SUPERSEDED BY OWNER DIRECTION |
| D3 | D | PKG §12.3 (L462–468); ANNEX C.3 | Lifecycle: active → warning → distress → recovery → active, with a dormant branch; one negative-cash week cannot skip to dormancy. | State model / PRELIMINARY RECOMMENDATION | D's ladder: healthy → warning → distress → severe → insolvency → settlement/auction/closure. Dormancy absent; "severe" and "insolvency" new. The no-single-week-skip principle survives. | QUALIFIED |
| D4 | D | PKG §12.3 (L474–475); ANNEX B "Closure" | Settlement invariants: projects, obligations, contracts, people, films, identity and public history resolve or persist explicitly; closure ≠ freeing an ID. | Binding law | D ("settlement/auction/closure; IDs never recycled; history preserved") aligns. "Auction" is a new settlement mode — see I15. | CONFIRMED |
| D5 | D | PKG §11 law 6; §13.2; §29 HQ9; ANNEX P.3 | No identity death: closure, dormancy, retirement or ownership change never deletes or re-mints studio/film/person IDs. | Binding law | D: "IDs never recycled" | CONFIRMED |
| D6 | D | PKG §11 law 16; §12.3 (L477–495); ANNEX D.5, I | Every operating-state edge is an all-owner transaction: P13/P10/P11/P12/P14 receipts + one atomic participant manifest; missing bounded P10/P11/P12 contracts stop P15B. | Binding law / stop condition | none in principle. But P13 and P14 are not implemented at 592e926 (HANDOFF), so a P15B built next must define which participants are real. | QUALIFIED; NEEDS CODE CHECK |
| D7 | D/E | PKG §11 law 5; §16 (L615–619); ANNEX O `negativeCashOnly` | Negative cash is not bankruptcy; distress needs ≥2 legitimate recovery routes before demanding attention. | Binding law | D/E keep "warning/recovery first" — compatible. | CONFIRMED |
| D8 | D/F | PKG §16 (L615–619) | Recovery routes: reduce obligations, delay/cancel uncommitted plan, complete a conserved release, enter dormancy. | Design law | F adds a loan as a recovery route (with interest). | QUALIFIED |
| D9 | D/E | PKG §16 (L621–627); §17 (L648–655) | Same pre-terminal predicates and equivalent remedy capabilities for player and rivals; **terminal eligibility intentionally asymmetric**; docs/tests must call it asymmetric. | PRELIMINARY RECOMMENDATION | E: player can ultimately fail → terminal law may become symmetric; the "must call it asymmetric" instruction is reversed. | SUPERSEDED BY OWNER DIRECTION |
| D10 | D/G | PKG §23 "rival closure" row (L798) | Authorize staged rival closure only in a dedicated P15B terminal slice with exact triggers, settlement, **entrant floor**, immutable archive. | PRELIMINARY RECOMMENDATION | D confirms closure; G rejects any entrant floor. | QUALIFIED (closure CONFIRMED; floor SUPERSEDED) |
| D11 | D/G | PKG §23 "later entrants / active-rival floor" row (L800); ROADMAP §19.3 | Deterministic bounded eligibility with "P12's minimum three active AI rivals"; "prevents an empty century". | PRELIMINARY RECOMMENDATION | G: no automatic replacement, no artificial floor, consolidation desirable. | SUPERSEDED BY OWNER DIRECTION. **Note:** the "minimum three active AI rivals" is attributed to P12 law; the P12 package doc is not in this scratchpad, so its exact wording is unverified here. |
| D12 | D | ROADMAP §19.3 "rival closure" row (L677) | Staged rival closure only in an Owner-approved P15B terminal slice with P12 settlement, archive and **active-rival-floor proof**. | PRELIMINARY RECOMMENDATION | G | QUALIFIED (floor proof SUPERSEDED) |
| D13 | D | ANNEX C.3 (L125–129) | No P15B condition exists until Owner approval and a dedicated charter; `dormant → closed` only after exact trigger/settlement/archive/entrant-floor law; "Acquisition is never implied". | Builder rule | D authorizes design; G removes floor; I says acquisition eventually. | QUALIFIED |
| D14 | D | ANNEX C.3 table (L122–123) | Dormant/distress ↔ re-entry; free restart resources, dormant-period progress and partial activation forbidden. | State law | D's ladder has no dormancy step. Owner may keep dormancy as an optional non-terminal branch or drop it. | QUALIFIED |
| D15 | D | ANNEX B "Dormancy", "Closure", "Entrant" | Dormancy = non-terminal, preserved identity; closure = terminal + settlement + archive; entrant ≠ respawn of a closed ID. | Canonical terminology | D/G: entrant respawn ban still holds (stronger now: no replacement at all). | CONFIRMED (dormancy row QUALIFIED per D14) |
| D16 | D | ANNEX K.4 `corporate-remedy-owner-swap`, `corporate-no-parallel-registry` | Remedy families symmetric under role swap; every transition has exactly one P12 registry receipt and no P15 active/dormant/closed field. | Required future fixture | none | CONFIRMED |
| D17 | D | ANNEX O `corporatePolicyNotAuthorized` ("Corporate fate is not part of the current rules.") | Refusal string for an unauthorized corporate slice. | Refusal language | D authorizes the design; the string remains valid *until built*, then retires. | QUALIFIED |
| D18 | D/G | ROADMAP §6.3 (L212); §7 rows 2000–2019 (L230) | P15B includes later-entrant eligibility orchestration; dormancy/recoveries/closure "only if separately approved". | Recommended slice / timeline | D approves; G removes entrant orchestration for replacement. | SUPERSEDED BY OWNER DIRECTION |
| D19 | D/G | RULINGS §4.1 (L123–124) | Owner approved P15 owning distress, recovery, dormancy, closure **and later-entrant** domain behavior that proposes changes through P12's state. | OWNER APPROVED | G narrows "later-entrant" to authored P12 arrivals only (already delivered by P12 R05). | QUALIFIED |
| D20 | D/E | RULINGS §4.3 (L140–141) | "player/rival closure asymmetry; exact later-entry policy" are OPEN. | OWNER DECISION OPEN | D, E, G decide all three. | SUPERSEDED BY OWNER DIRECTION |
| D21 | D | HANDOFF "P15B / P15C" (L27) | Current `StudioIdentity` has no dormant/closed status field; the older contract vocabulary is a future seam, not implemented transitions. | Accepted producer boundary | none | CONFIRMED (first-pass grep: no `dormant`/`closed`/`insolven`/`bankrupt` in `src/core/hollywood*.ts` or `industry*.ts` at 592e926); NEEDS CODE CHECK |
| D22 | D/G | HANDOFF "P15B / P15C" (L27) | P15B/C scope described as "corporate fate, recovery/dormancy/closure/**replacement**/wider churn". | Preserved downstream ownership | G: no replacement studios. | SUPERSEDED BY OWNER DIRECTION (the word "replacement") |
| D23 | D/G | HANDOFF "Calendar and chronology" (L12) | Four opening rivals and later arrival weeks 520/988/1560/1872/2548 are fixed per campaign; Migration B seeds due entrants without invented past. | Accepted producer contract | G: authored P12 arrivals preserved — aligned. | CONFIRMED (first-pass: `src/core/calendar.ts:3 RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]`); NEEDS CODE CHECK |
| D24 | D/M | PKG §5.5 (L246–249); §6 row "retail studios closed or merged" | No reliable retail source establishes rival bankruptcy, closure, merger, acquisition or replacement; GameSpot 2004 "goes bust" is pre-release only. | OPEN QUESTION / SOURCE VERIFIED AS PRE-RELEASE REPORT ONLY | none — D is successor design, never parity. | CONFIRMED (grep of manual/prima/gamefaqs/gamepressure extractions for bankrupt/bust/out of business/close down/takeover: no relevant hit; absence ≠ proof of absence) |
| D25 | D | PKG §21 tiers | ATTENTION tier lists "studio enters warning; tracked rival recovers/enters"; closure is not enumerated. | Attention law | D/H want a big industry notice on failure. | QUALIFIED (add closure/settlement/talent-release to ATTENTION or DECISION tier) |

### E. Player bankruptcy

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| E1 | E | PKG §2 (L93–95) | Player has no mandatory hard-bankruptcy game-over. | PROJECT AUTHORITY VERIFIED (P12) | E: player CAN ultimately fail. | SUPERSEDED BY OWNER DIRECTION |
| E2 | E | PKG §12.3 (L472–474) | Player graph remains recoverable dormancy unless the Owner separately authorizes a player terminal ending. | PROJECT AUTHORITY VERIFIED + recommendation | E authorizes (direction). | SUPERSEDED BY OWNER DIRECTION |
| E3 | E | PKG §23 "player closure / bankruptcy asymmetry" row (L799) | Retain no-mandatory-hard-bankruptcy law; any player terminal ending is a separately approved experience + settlement policy. | PRELIMINARY RECOMMENDATION | E | SUPERSEDED BY OWNER DIRECTION (the *settlement-policy* requirement survives: a player terminal needs the same all-owner settlement manifest) |
| E4 | E | ANNEX A future gates (L43); ANNEX M.5 (L947–948) | Rival closure and any player terminal ending require distinct rulings; terminal asymmetry stays visible in UI. | Builder rule | E | SUPERSEDED BY OWNER DIRECTION |
| E5 | E | PKG §11 law 5; ROADMAP §5.3 (L165); HANDOFF L15 | Negative cash is not bankruptcy; currently recoverable; runway is not an invented distress threshold. | Binding law / accepted P12 law | E requires warning/recovery *before* failure — compatible. | CONFIRMED; NEEDS CODE CHECK (P11 at 592e926 permits negative Cash without terminal effect) |
| E6 | E | ROADMAP §23 reason 8 (L772) | Corporate distress cannot use present negative cash or incomplete runway selectors as bankruptcy truth. | Reason not to implement now | E/D need a defined insolvency predicate — this is the dependency. | CONFIRMED (technical); NEEDS CODE CHECK |
| E7 | E | ROADMAP §19.3 "Player closure" row (L678) | Preserve no-mandatory-hard-bankruptcy; terminal eligibility explicitly asymmetric. | PRELIMINARY RECOMMENDATION | E | SUPERSEDED BY OWNER DIRECTION |
| E8 | E | RULINGS §4.3 | Player/rival closure asymmetry is OPEN. | OWNER DECISION OPEN | E decides. | SUPERSEDED BY OWNER DIRECTION |
| E9 | E | PKG §29 HQ8; ANNEX Q11 | Hostile check: does negative cash trigger failure by itself? | Hostile-review question | none | CONFIRMED (still a valid gate) |
| E10 | E | PKG §7 Football Manager row | Distress must be warned and remedied without surprise failure; reject player-only rescue or opaque forced sale. | COMPARATOR OBSERVED + PRELIMINARY RECOMMENDATION | E ("warning/recovery first") aligns; D's "auction" must not be an *opaque* forced sale. | CONFIRMED |

### F. Loans / debt

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| F1 | F | PKG §16 (L619) | "Loans, bailouts, investors, forced sales, or acquisition are not implied." | Design law | F (loans with interest/repayment), I (buy studios), D (auction ≈ forced sale). | SUPERSEDED BY OWNER DIRECTION |
| F2 | F | PKG §25 P16+ bullet "debt/equity/investor integration if separately approved"; ROADMAP §20 | Debt/investor/equity parked in P16+. | Explicit deferral | F wants loans now; package placement (P11 vs P15B) is open. | SUPERSEDED BY OWNER DIRECTION |
| F3 | F | ROADMAP §5.3 (L165) | All finance consequences post through P11 vocabulary and TypeScript calculations; obligations sit beside Cash, not secretly subtracted. | PROJECT AUTHORITY | F: loans are new P11 obligations with interest schedules — must be literal, visible obligations. | CONFIRMED (constraint on how F is built) |
| F4 | F | HANDOFF "Financial boundaries" (L15) | Finance observes existing action consequences; it is not a second mutation/affordability owner; preserve literal accounting and exact receipts. | Accepted producer boundary | F: a loan is an *action* with receipts; interest is a scheduled obligation. Compatible if built inside P11 law. | CONFIRMED; NEEDS CODE CHECK (first-pass grep: no `loan`/`debt` symbols in `src/core/*.ts` at 592e926 — loans are entirely new) |
| F5 | F | PKG §7 Football Manager row; §11 law 9 | Reject player-only rescue; rivals cannot receive secret cash. | PRELIMINARY RECOMMENDATION / binding law | F: if the player can borrow, rivals must be able to borrow under the same law (or the asymmetry must be explicit and disclosed). | QUALIFIED (rival-loan symmetry is an open Owner choice) |
| F6 | F | ANNEX F.2; PKG §24 OQ8 | Private rival cash and exact obligations stay private; which P11 facts may be public for rival distress is open. | Builder rule / OPEN QUESTION | F/D: rival loans, defaults and insolvency need a *public disclosure* subset. | QUALIFIED |

### G. Consolidation / later entrants

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| G1 | G | PKG §3.2 (L131–134); §3.3.1 table P12E row | P15B owns later-entrant eligibility/status orchestration; P12 mints/registers the entrant `StudioId` with a five-package manifest. | Ownership proposal | G: no automatic replacement; authored arrivals already P12-delivered. | SUPERSEDED BY OWNER DIRECTION for replacement entrants; the *authored* arrivals are P12-owned and need no P15 orchestration |
| G2 | G | PKG §10 (L375–378) | Product fantasy includes "new challengers enter". | Product fantasy | G: only authored arrivals (through week 2548 ≈ 1969). | QUALIFIED |
| G3 | G | PKG §18.3 (L685–687) | If later entrant timing uses RNG, stream key includes version/week/subject/purpose. | RNG law | G removes the entrant-timing use case; the RNG law itself survives for settlement/tie use. | QUALIFIED |
| G4 | G | ANNEX C.4 entrant state table; ANNEX I "entrant eligibility/request" | not-eligible → eligible candidate (floor predicate) → requested → announced/active; P15 cannot mint a studio. | State law | G | SUPERSEDED BY OWNER DIRECTION |
| G5 | G | ANNEX K.4 `entrant-no-partial-mint`, `entrant-after-several-standards`, `entrant-duplicate-request` | Entrant fixtures. | Required future fixture | G: no replacement entrants → these fixtures apply only if an authored arrival ever runs through a P15 path (it does not; P12 owns it). | SUPERSEDED BY OWNER DIRECTION (retire or re-scope) |
| G6 | G | ROADMAP §7 rows 1920–1927 and 1960–1979 | Authored studios enter per P12 policy; "later rival entrants remain P12/P15 policy". | Systems timeline | G: entrants are P12 authored only. | QUALIFIED (strike "/P15") |
| G7 | G | ROADMAP §19.3 "Later entrants / active-rival floor" row (L679) | Deterministic P15B eligibility with P12's minimum three active AI rivals; prevents an empty century. | PRELIMINARY RECOMMENDATION | G: an emptier century is *acceptable and desirable*. | SUPERSEDED BY OWNER DIRECTION |
| G8 | G | HANDOFF "P15B / P15C" (L27) | Only the initial nine-studio rollout is delivered by P12. | Accepted producer boundary | G: that rollout *is* the whole entrant set. | CONFIRMED; NEEDS CODE CHECK (`hollywoodStartingData.ts`, `calendar.ts`) |
| G9 | G/K | ROADMAP §21 (L737) | Endless Mode must answer "entrant/retirement generation". | OWNER DECISION REQUIRED | G says no automatic replacement pre-2040; whether that extends into the post-2040 sandbox is not stated. | QUALIFIED (open) |

### H. Talent after closure

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| H1 | H | PKG §12.3 (L481–484); ANNEX C.3 table | On dormancy/closure: P10 settles contracts/person refs; P14 resolves open cases; P12 settles roster/employer/exclusivity/intervals via typed dispositions. | Binding law | H ("talent → free agency") is exactly a P12 employer-interval end + P10 contract disposition. Compatible. | CONFIRMED |
| H2 | H | PKG §11 law 6; ROADMAP §17 (L601) | Person identity never deleted or transferred on corporate change; retirees not deleted. | Binding law | H, I | CONFIRMED |
| H3 | H | HANDOFF "Employment" (L13) | One-employer exclusivity binding; P12 records actual employer transitions; a credit alone does not prove employment; public availability hides private terms. | Accepted producer contract | H: free agency must be recorded as a P12 transition; "big industry notice" is a public fact. | CONFIRMED; NEEDS CODE CHECK (`industryEmployment.ts` at 592e926 is 35 lines — does it support mass termination on closure?) |
| H4 | H | PKG §21 tiers (L754–757) | Notification tiers INFO/ATTENTION/DECISION/BLOCKING; no closure or talent-release event enumerated. | Attention law | H wants a *big* notice. | QUALIFIED (add an explicit event) |
| H5 | H | PKG §29 HQ9; ANNEX P.3 | Closure may not orphan a studio's films/people. | Hostile-review gate | H | CONFIRMED |
| H6 | H | ANNEX C.3 (L122); D.5 P14 receipt | Closure manifest requires a P14 case/promise/commitment disposition. | Binding law | P14 not implemented; a closure built before P14 must define a "P14 absent" disposition explicitly. | QUALIFIED; NEEDS CODE CHECK |

### I. Acquisition / M&A / subsidiaries

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| I1 | I | PKG §2 (L99–102); §11 law 14; §25 | Acquisitions, mergers, labels/subsidiaries, co-productions, library/IP transactions move to P16+; "Corporate transactions wait". | PRELIMINARY RECOMMENDATION / binding law | I: eventual ability to buy studios, placement open. "Eventual" is compatible with "wait"; the fixed P16+ home is no longer fixed. | QUALIFIED |
| I2 | I/M | PKG §5.5 (L254–259); §6 row "acquisition shipped" | REFUTED: acquisition was a shipped mechanic; E3 2002 First Look = pre-release only; successor acquisition must never be labeled parity. | REFUTED / SOURCE VERIFIED AS PRE-RELEASE REPORT ONLY | none — I is successor design. | CONFIRMED (no acquisition/takeover hit in any inspected extraction) |
| I3 | I/M | PKG §5.5 (L261–262) | REFUTED: co-production, merger, library/IP transfer, subsidiaries, labels shipped. | REFUTED | none | CONFIRMED |
| I4 | I | PKG §13.2 (L539) | Future acquisition cannot rewrite historical creator/owner facts (P16 requirement). | Identity law | I: applies to wherever acquisition lands. | CONFIRMED |
| I5 | I | PKG §25 (L860–861) | Corporate transactions may not re-enter P15 as "small" UI options. | Explicit deferral | I: placement open — if Owner places buying in P15, this sentence is void; if elsewhere, it stands. | QUALIFIED |
| I6 | I | RULINGS §4.2; ROADMAP §26 (L886–887) | "Corporate Hollywood" title grants no acquisition/merger/stake/subsidiary/co-production/IP authority; those are P16+ possibilities, not parity. | OWNER APPROVED clarification | I is a newer Owner direction; per RULINGS §8 it governs once recorded. | QUALIFIED (record the new ruling) |
| I7 | I | RULINGS §5 | Acquisitions, mergers, subsidiaries, stakes, valuation, IP transfer, co-productions in P16+ parking. | OWNER APPROVED parking | I, C | QUALIFIED |
| I8 | I | HANDOFF "P16 → P17 → P18" (L28) | Library/Rights/ownership → Franchises → Television numbering; P12 films/credits imply no StoryProperty or rights. | Preserved downstream ownership | I: placement open. | CONFIRMED as prior numbering; QUALIFIED |
| I9 | I | ANNEX Q14; PKG §29 HQ11 | Reject if acquisition/merger/co-production/library/IP fields are present in P15 roots or hidden in P15B entities. | Hostile-review gate | I: if buying studios is placed in P15, this gate must be rewritten, not silently dropped. | QUALIFIED |
| I10 | I | PKG §9 row "film library/IP/rights ownership"; ANNEX H | `FilmResult`/production records are not a library, IP, chain-of-title or ownership model; P16+ additive root needed. | DO NOT TOUCH / P16+ ADDITIVE ROOT NEEDED | I: buying a studio transfers its catalog → this root becomes a prerequisite. | CONFIRMED; NEEDS CODE CHECK |
| I11 | I | PKG §3.2 P09 row; §14 (L552) | Corporate ownership is never land placement; P15 adds no physical rival lots. | Binding law | I: buying a studio does not import its lot. | CONFIRMED |
| I12 | I/D | PKG §12.3 settlement invariants; ANNEX B "Closure" | Settlement resolves projects/obligations/contracts/people/films explicitly; no ownership transfer mechanism exists in P15. | Binding law | D's "settlement/**auction**" implies assets move to a buyer. An auction to *another studio* is a mini ownership transaction (collides with I1/I5 unless buying is placed with closure); an auction to a void/market sink is not. | QUALIFIED (Owner must say who can bid) |

### J. 2040 finale

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| J1 | J | PKG §2 (L96–97); §11 law 4; §23 finale row | Multi-archetype, evidence-linked, loss-aware interpretation; no single Legacy score or universal winner. | PRELIMINARY RECOMMENDATION → OWNER APPROVED (RULINGS §4.1) | J: "no single score" — aligned. | CONFIRMED |
| J2 | J | ROADMAP §18 (L609–620); ANNEX E.6; RULINGS §4.1 | Eight archetypes maximum: artistic voice, audience institution, commercial engine, technology pioneer, talent foundry, resilient survivor, awards dynasty, genre specialist/reinvention. Authoring rejects a ninth. Owner approved "exactly the final documented" model. | OWNER APPROVED | none | CONFIRMED |
| J3 | J | PKG §22 (L781–786); ANNEX D.6, E.6 | Manifest limits: ≤16 domains, ≤8 archetype IDs, ≤12 qualifying + ≤12 contrary refs per archetype, ≤12 lens summaries; only used evidence IDs. | Persistence law | J's *interactive* dossier must page beyond the manifest via bounded routes, not widen it. | CONFIRMED (limits) / QUALIFIED (interactivity = paged evidence routes) |
| J4 | J | ROADMAP §18 (L627–635) | Finale must identify trigger week, source IDs, gaps, migrated-save flag, active **and historically important inactive rivals**, facts without recomputation, post-finale mode. | Design law | D: failed/closed rivals will now exist and must appear. | CONFIRMED |
| J5 | J | PKG §11 law 15; §12.4 | "2040 is governed": trigger and post-finale mode explicit, versioned, Owner-approved; Endless begins via a separate one-time transition after the frozen finale and does not alter finale inputs. | Binding law | J, K aligned. | CONFIRMED |
| J6 | J | PKG §14 (L563–564) | The world may acknowledge a 2040 celebration through presentation-only activity; nothing visual calculates results. | Design law | J's "ceremony" = presentation-only celebration. | CONFIRMED |
| J7 | J | ANNEX M.6 (L962) | No "overall 92", letter grade, world rank, winner, GOAT meter or meta-power reward. | UI law | none | CONFIRMED |
| J8 | J | RULINGS §4.3 | Finale presentation is OPEN. | OWNER DECISION OPEN | J decides (ceremony + interactive dossier). | SUPERSEDED BY OWNER DIRECTION |
| J9 | J | PKG §24 OQ10, OQ11, OQ12 | Exact 2040 freeze week and in-production disclosure; migrated-save archetype eligibility; archetypes vs disguised scores. | OPEN QUESTION | none | CONFIRMED (still open) |
| J10 | J | ANNEX E.6 `postFinaleModeOptions only after Owner law`; C.5 last row | Presented → Owner-selected mode → archive-browsable / ended / Endless transition; one explicit mode event. | State law | K selects the Endless transition. | CONFIRMED |
| J11 | J/M | PKG §5.6; §6 row "original finale was one score" | Original: play may continue after 2005; rewards end at the 2005 ceremony; Gold = all nine Achievement Awards; Platinum adds counts. It was a checklist/tally, not one blended score. | SOURCE VERIFIED / REFUTED | none | CONFIRMED (prima.txt L5121–5153, printed p. 79) |

### K. Post-2040 Endless Mode

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status |
|---|---|---|---|---|---|---|
| K1 | K | PKG §3.6 (L182–183); §25 "post-2040 Endless Mode until Owner approval" | Post-2040 continuation is an Owner decision, not an implicit feature. | Boundary / explicit deferral | K decides: Endless Sandbox. | SUPERSEDED BY OWNER DIRECTION |
| K2 | K | PKG §23 Endless Mode row (L807); ROADMAP §19.3 | Owner chooses after finale prototype; no default. | PRELIMINARY RECOMMENDATION | K decided *before* any prototype. | SUPERSEDED BY OWNER DIRECTION |
| K3 | K | ROADMAP §21 (L731–737) | Three honest options; option 3 must answer catalogue supply, entrant/retirement generation, era presentation, market normalization, awards cadence, balance, save compatibility, achievements; "keep ticking is not a complete design". | OWNER DECISION REQUIRED | K picks option 3; the eight design questions remain unanswered. | QUALIFIED (option chosen; design open) |
| K4 | K | ROADMAP §7 Post-2040 row (L233) | If approved: one-time mode-transition event; no identity reset. | Systems timeline | K: "does not rewrite the frozen Legacy" — aligned. | CONFIRMED |
| K5 | K | RULINGS §4.3 (L143) | "Post-2040 Endless Mode remains undecided. P15 may not silently create or authorize it." | OWNER DECISION OPEN | K is an explicit (not silent) Owner decision. | SUPERSEDED BY OWNER DIRECTION |
| K6 | K | ANNEX O `finaleModeUndecided` ("Post-2040 play has not been authorized.") | Refusal string. | Refusal language | K: string must be replaced by a governed sandbox-transition state. | SUPERSEDED BY OWNER DIRECTION |
| K7 | K | PKG §29 HQ21; ANNEX Q19 | Hostile check: does post-2040 continuation appear without Owner approval? | Hostile-review gate | Re-word to "without an explicit versioned mode transition". | QUALIFIED |
| K8 | K | ROADMAP §20 "post-2040 content generation"; RULINGS §5 "post-2040 generated content" | Generated post-2040 content is P16+ parked. | Parking | K: a sandbox that keeps ticking needs a content policy (catalogue supply, cohorts); parked generation is not automatically unparked. | QUALIFIED |
| K9 | K | ROADMAP §7 row 2000–2019; §26 (L884) | Successor campaign continues beyond the original's 2005 horizon to 2040; "Endless Mode is undecided". | Timeline / approval note | K | SUPERSEDED BY OWNER DIRECTION (the "undecided" sentence) |

### L. Code / seam claims made against 7811377 / save V15 (flag for verifier)

First-pass flags come from file existence and `grep` on `scratchpad/accepted-592e926/` only. **Every row here is NEEDS CODE CHECK**; the extra status is my first-pass reading.

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status / first-pass flag |
|---|---|---|---|---|---|---|
| L1 | L | PKG header (L9); ANNEX header (L9); ROADMAP §2.1 | Accepted TypeScript base = `7811377`; Unity = `29aea89`. | Authority register | n/a | CORRECTED — accepted runtime is now `592e926` (RECEIPT/HANDOFF, 2026-09-11); Unity build source `deca3952`, observed HEAD `2bc8d304` |
| L2 | L | PKG §9 row "save version/migrations" (L362) | `src/core/save.ts`; accepted save generation is V15. | EXISTING / ADDITIVE ROOT NEEDED | n/a | CORRECTED — HANDOFF: protocol 4 / projection 29 / inner Save **V19** / outer checkpoint 1; `save.ts` has `SaveFileV19`, `GameStateV19` |
| L3 | L | PKG §9 row "rival studios/projects" (L359); ANNEX H "common identities/rivals" | Rival studios/projects absent at accepted base; P12 designed only. | UPSTREAM PACKAGE DEPENDENCY | n/a | CORRECTED — at 592e926 `src/core/hollywood.ts`, `hollywoodTick.ts`, `hollywoodTypes.ts` (`StudioIdentity[]`, `GameStateV19.hollywood`), `industryEmployment.ts`, `hollywoodValidation.ts`, `bridge/industry.ts` exist; HANDOFF: rival projects advance to releases with theatrical runs |
| L4 | L | PKG §9 row "singleton studio and cash" (L349) | `src/core/types.ts` `Studio`, `GameState` are a singleton; P12 common identity must exist first. | UPSTREAM PACKAGE DEPENDENCY | n/a | CORRECTED (partially) — `GameStateV19 = GameStateV18 & { hollywood: HollywoodState | null }` (types.ts:1689); player `Studio` singleton likely still exists alongside; verifier to confirm shape |
| L5 | L/A | PKG §9 row "competition factor" (L354); ANNEX H "reception boundary" | `src/core/reception.ts` competition factor is an inert placeholder, currently neutral. | INERT PLACEHOLDER | n/a | CONFIRMED (first pass) — `reception.ts:679 const competitionFactor = 1.0`; comment L596 "competitionFactor ≡ 1.0 (N11)" |
| L6 | L/A | PKG §9 row "static market" (L353); ANNEX H "market placeholder" | `MarketState`, `CompetingRelease`, `competingSlate` in `types.ts`/`worldgen.ts` are inert; not shared-market authority. | INERT PLACEHOLDER | n/a | CONFIRMED (first pass) — `types.ts:276–282` `competingSlate: CompetingRelease[]` (`{ marketPressure: number }`), `worldgen.ts:645 competingSlate: []`, `save.ts:1632/1657` validates it; still empty at worldgen |
| L7 | L | PKG §9 row "theatrical runs" (L352); ANNEX H | Theatrical runs live in `src/core/types.ts`, `src/core/theatrical.ts`. | EXISTING | n/a | CORRECTED (path) — `src/core/theatrical.ts` does not exist at 592e926; run logic appears under `tick.ts`, `studioRunRecap.ts`, `studioWeekTheater.ts`, `releaseAuthority.ts` (grep "theatrical") |
| L8 | L | PKG §9 row "ledger/economy" (L356); ANNEX H "finance" | Finance = `src/core/ledger.ts`, `economy.ts`, `economyView.ts`. | EXISTING / P11 OWNED | n/a | CORRECTED (path) — `ledger.ts` absent; `economy.ts` (92 lines), `economyView.ts` (649), plus `financeReport.ts`, `fixedCostAllocation.ts`, `forecast.ts` exist |
| L9 | L | PKG §9 row "studio/event history" (L358); ANNEX H "typed events" | `src/core/events.ts` + film/career event roots; additive industry event root needed (`industryEvents.ts`). | EXISTING PATTERN / UPSTREAM-EXTEND | n/a | CORRECTED (path) — `events.ts` absent; `studioEvents.ts`, `studioHistory.ts`, `industryCareer.ts` exist; `industryEvents.ts` absent |
| L10 | L | PKG §9 row "calendar" (L357); ANNEX H "player calendar", "industry release/disclosure facts" | `studioCalendar.ts` is a player planner; no authoritative industry schedule exists at accepted base. | EXISTING PLAYER PLANNER / UPSTREAM DEPENDENCY | n/a | CORRECTED (partially) — `studioCalendar.ts` still exists (869 lines) **and** a shared `src/core/calendar.ts` (`RIVAL_ARRIVAL_WEEKS`, `campaignDate()`) now exists; HANDOFF says `market.tick` stays authoritative; disclosure law location unverified |
| L11 | L | PKG §9 row "three Standing channels" (L355) | `src/core/standing.ts`; P12 must generalize Standing per studio; P15 never blends. | EXISTING / UPSTREAM GENERALIZATION | B2 | NEEDS CODE CHECK — `standing.ts` exists (207 lines); grep finds no `rival`/`studioId` there, so per-studio Standing is probably **not** generalized at 592e926 (affects any "prestige" lane sourced from Standing) |
| L12 | L | PKG §9 row "technology" (L360) | `EraConfig` plus placeholders; P13 upstream. | UPSTREAM PACKAGE DEPENDENCY | n/a | CONFIRMED (first pass) — `types.ts:284 EraConfig {soundRequired, televisionCompetition, censorship, costScale}`; HANDOFF: P12 implemented no technology state |
| L13 | L | PKG §9 row "cross-studio careers" (L361) | Stable people/career events exist; P14 not implemented. | UPSTREAM PACKAGE DEPENDENCY | H | QUALIFIED — P14 still unimplemented (HANDOFF), but P12 employer transitions now exist (`industryEmployment.ts`, `industryCareer.ts`) |
| L14 | L | PKG §9 rows "history projection", "bridge", "repeated save serialization/hash" (L363–365); ANNEX H | `ui/src/engine/adapter.ts`; `bridge/schema/bridge-schema.ts`; `bridge/session.ts::snapshotFor/availableIntents/exportSaveJson` — O(full-save) projection risk. | EXISTING / ADDITIVE ROOT NEEDED / RECON RISK | n/a | NEEDS CODE CHECK — all three files exist (7,964 / 2,709 / 2,062 lines); RECEIPT records Save p95 9.58 s, serialize+digest p95 199.5 ms, Hollywood storage 37.8 MB, so the risk is a live performance qualification, not hypothetical → QUALIFIED |
| L15 | L | PKG §9 last para (L368–369) | CURRENT CODE VERIFIED: no authoritative rival market, Power Ranking, corporate state, acquisition, co-production or 2040 finale model. | CURRENT CODE VERIFIED (at 7811377) | n/a | QUALIFIED — at 592e926 still no `sharedMarket.ts`/`powerRanking.ts`/`corporateFate.ts`/`studioLegacy.ts`, no dormant/closed fields; but rival *releases* now exist, so "no rival market" is only true in the P15 sense (no shared pressure law) |
| L16 | L | PKG §18.1 (L670–674); ROADMAP §15 preamble (L528–531); ANNEX E.7 | Scheduler-owned `phaseId`/`phaseOrdinal`/`phaseOrderVersion` are a prerequisite; if absent, the slice stops at reconnaissance. | Binding prerequisite | n/a | NEEDS CODE CHECK — first-pass grep finds **no** `phaseOrdinal`/`phaseOrderVersion` in `src`/`bridge` at 592e926 → prerequisite appears unmet |
| L17 | L | PKG §9 row "P05/P06 paths"; ROADMAP §2.3, §23 reasons 1–2; RULINGS §7 | P05 active and unsealed on `wip/p05a-production-shooting-01-ts`; P06 provisional; P05 is "the active implementation workstream". | DO NOT TOUCH / status | n/a | CORRECTED (stale) — HANDOFF 09-11: implementation/runtime ownership yielded to Current Ops, "no continuing coding/runtime queue remains"; P05/P06 seal state must be re-read by the verifier (branch inspection is out of my scope) |
| L18 | L | ROADMAP §23 reason 3 (L767) | P12's rival foundations are design authority, not accepted implementation roots. | Reason not to implement now | n/a | CORRECTED — P12 R05 Owner-accepted 2026-09-11 as code |
| L19 | L | PKG §12.1 (L436–437); ANNEX C.1 (L99–100), R | If the accepted P07 boundary cannot preflight and join an all-or-none candidate, P15A.1 stops. | Stop condition | n/a | NEEDS CODE CHECK — candidates at 592e926: `releaseAuthority.ts` (`withReleaseCommitment`, `releaseCommitmentRefusal`), `receptionVerdict.ts`, `tick.ts` |
| L20 | L | PKG §19 fixture sizes; ANNEX L.2–L.3 | 16-studio/20k-film expected fixture; 64-studio/100k-film hostile. | Endurance inputs | n/a | QUALIFIED — RECEIPT: 12-active/48-project/4,000-film/50-archived-studio stress **unrun**; avg film 3,146 bytes (>1.5 KB target). P15 endurance assumptions must be re-based on measured P12 costs |
| L21 | L | HANDOFF L11–L12 | `GameStateV19.hollywood` = 1 player + 9 reserved rival IDs; a reserved future ID is not an active employer; `campaign-calendar-1920-52/v1` maps week 0 → 1920 W1. | Accepted producer contract | n/a | NEEDS CODE CHECK — first pass agrees: `hollywoodTypes.ts:113 identities: StudioIdentity[]`; `calendar.ts:3` arrival weeks |

### M. Original-game claims (verified against the plain-text extractions)

| ID | Topic | Doc & section | Claim | Doc label | Collision | Status / evidence |
|---|---|---|---|---|---|---|
| M1 | M | PKG §5.1 (L208–211) | Original shipped Studio, Star and Movie Charts showing the player "in relation to the competition" with contributing factors. | SOURCE VERIFIED (manual) | none | CONFIRMED — manual.txt L509–528 (printed p. 21–22): charts "show just how your studio, Stars and movies are doing in relation to the competition"; ranking factors include "your finances". RETAIL SHIPPED MECHANIC (manual). HIGH |
| M2 | M/B | PKG §5.1 (L211–214); §6 row 2 | Prima documents Studio Rating weights: Capital 24 %, Movies 24 %, Stars 24 %, Lot Prestige 14 %, Awards 14 %. | SOURCE VERIFIED (developer-reviewed guide) | B (see B15) | CONFIRMED — prima.txt L2816, L2843, L2850–2853, L2866, L2889–2890 (printed pp. 45–46). PRIMA EVIDENCE, not executable proof. HIGH |
| M3 | M/A | PKG §5.2 (L218–223) | Public genre interest fell with how many films *all studios* released in the genre; a strong film could underperform after rival output; exact window/curves not recovered. | SOURCE VERIFIED (Prima) | none | CONFIRMED — prima.txt L3656–3663 (printed p. 57): "The more movies all studios, including yours, release in a genre, the more tired of the genre the public will get". Window/curve genuinely absent. HIGH |
| M4 | M/D | PKG §5.2 "rival decision implementation … not recovered" | Rival release behaviour was not recovered. | SOURCE VERIFIED (negative) | none | QUALIFIED — Prima's rival table (prima.txt L3195–3208, printed p. 51) *does* document per-rival "Releasing Movie in Most Popular Genre" and genre propensities (e.g. Old Rope Cinema 25/30/50…), i.e. authored rival personalities. More is recoverable than the doc states. PRIMA EVIDENCE. MEDIUM |
| M5 | M | PKG §5.3 (L227–233) | Research gave a temporary lead; every studio got a pack at its natural unlock; rival Stars entered Stage School; fired/unhappy Stars joined rivals; Stars/scripts sold to rivals. | SOURCE VERIFIED | none | CONFIRMED — prima.txt L2454 ("unlocks automatically in 1931 for all studios"), L300–314 (rival Stars in Stage School queue), L1158 (Star "will march off the lot and join a rival studio"), L2800. HIGH |
| M6 | M | PKG §5.4 (L237–242) | Awards every five years; nine named AI rivals; several predate 1920; later rivals entered in variable authored windows through ~1971; exact RNG/opening count unresolved. | SOURCE VERIFIED | G (authored arrivals are the original pattern — supports "authored P12 arrivals preserved") | CONFIRMED — manual.txt L542 ("Every five years an awards ceremony"), prima.txt L2828 ("quinquennial"); rival table L3195–3208: Old Rope 1898–1902 … Booboo & Dingo 1967–1971 (nine rivals, four-year windows). The doc's "ten-slot chart including the player" is inference (9 + 1), not a stated fact. HIGH (nine rivals), LOW (ten-slot) |
| M7 | M/D/I | PKG §5.5 (L246–262); §6 rows 6–8 | No inspected retail source establishes bankruptcy, closure, merger, acquisition, or replacement; GameSpot 2004 "goes bust" and E3 2002 "acquire competitors" are pre-release only; acquisition/co-production/merger/subsidiaries REFUTED as shipped. | OPEN QUESTION / REFUTED / PRE-RELEASE ONLY | none (D, I are successor design) | CONFIRMED — grep of manual.txt, prima.txt, gamefaqs-maxx.txt, gamefaqs-mark.txt, gamepressure-improving.txt for bankrupt/bust/out of business/close down/shut down/acqui/takeover: only unrelated hits (acquiring a facility). "No inspected source establishes X"; absence ≠ proof of absence. The GameSpot pages were not re-fetched (no web in this lane). HIGH for the local negative |
| M8 | M/J/K | PKG §5.6 (L266–271) | Play may continue past 2005; reward structure ends at the 2005 ceremony; Gold = all nine Achievement Awards; Platinum adds prescribed ceremony-award counts; a tally, not one score. | SOURCE VERIFIED | K (original precedent for "continue after the reward horizon") | CONFIRMED — prima.txt L5121–5153 (printed p. 79): "Though you can play past the year 2005, the game, reward-wise, ends there." HIGH |
| M9 | M | PKG §5.7 (L273–280) | Original authorizes no screen model, no overlap formula beyond genre saturation, no momentum ranking, no closure law, no acquisition parity, no single finale formula. | Source audit conclusion | A, B, D, I are all successor design | CONFIRMED (consistent with M2–M8) |
| M10 | M | PKG §6 row "rival research was a full private tree" | REFUTED as established parity. | REFUTED | none | CONFIRMED — Prima says packs unlock for all studios at natural dates; research = early access (L2454). HIGH |
| M11 | M/B | (not in P15 docs; new) | Prima: the Movies factor decays — "the impact of individual movies decays over time"; Capital scored on a nonlinear $50k–$1.6M scale. | PRIMA EVIDENCE | B: the original composite already had *momentum* (decay) and a *financial* factor. Supports the Owner's B as closer to original spirit than P15 recommended, still not a parity copy. | NEW EVIDENCE — prima.txt L2794–2812, L2841–2847 (printed pp. 45–46). MEDIUM |
| M12 | M | PKG §1.3 (L57–58) | Manual cited at printed pp. 13–23; Prima at pp. 8, 45–59, 76–85. | Source register | n/a | CONFIRMED for the pages I touched (manual p. 21–22; Prima pp. 45–46, 51, 57, 79). Other pages not re-checked here |

---

## 2. Code-path existence check (first pass for the verifier)

Read-only `test -f` and `grep` over `scratchpad/accepted-592e926/`. Not a verification of behaviour.

| Path named by P15 docs | At 592e926 | Note |
|---|---|---|
| `src/core/types.ts` | EXISTS (1,943 lines) | `MarketState`/`CompetingRelease`/`competingSlate` at L276–282; `EraConfig` L284; `GameStateV19.hollywood` L1689 |
| `src/core/theatrical.ts` | **MISSING** | P15 §9 path stale |
| `src/core/ledger.ts` | **MISSING** | P15 §9 path stale |
| `src/core/events.ts` | **MISSING** | `studioEvents.ts` exists |
| `src/core/reception.ts` | EXISTS (852) | `competitionFactor = 1.0` at L679 |
| `src/core/worldgen.ts` | EXISTS (749) | `competingSlate: []` at L645 |
| `src/core/standing.ts` | EXISTS (207) | no rival/studioId references found |
| `src/core/studioCalendar.ts` | EXISTS (869) | plus new `src/core/calendar.ts` (31) with `RIVAL_ARRIVAL_WEEKS` |
| `src/core/save.ts` | EXISTS (7,257) | `SaveFileV19`/`GameStateV19` present |
| `src/core/economy.ts`, `economyView.ts` | EXIST (92 / 649) | |
| `ui/src/engine/adapter.ts` | EXISTS (7,964) | |
| `bridge/schema/bridge-schema.ts`, `bridge/session.ts` | EXIST (2,709 / 2,062) | |
| `src/core/hollywood*.ts`, `industryEmployment.ts`, `bridge/industry.ts` | EXIST | not mentioned in P15 docs (post-7811377 P12 delivery) |
| `src/core/sharedMarket.ts`, `powerRanking.ts`, `corporateFate.ts`, `studioLegacy.ts`, `industryEvents.ts` | **MISSING** | as expected (future files) |
| `phaseOrdinal` / `phaseOrderVersion` symbols | **not found** in `src`/`bridge` | L16 prerequisite appears unmet |
| `loan` / `debt` symbols | not found in `src/core/*.ts` | F is greenfield |
| `dormant` / `closed` / `insolven` / `bankrupt` in `hollywood*.ts`, `industry*.ts` | not found | D21 confirmed first-pass |

---

## 3. Collision clusters (what the new direction actually overturns)

| Cluster | Rows | Net effect |
|---|---|---|
| **Terminal asymmetry reversed** (E) | D2, D9, E1–E4, E7–E8 | The single most repeated P15 principle ("player has no mandatory hard-bankruptcy game-over … call it asymmetric") is reversed. Pre-terminal symmetry, staged warning/recovery and all-owner settlement survive unchanged. |
| **Entrant floor / replacement removed** (G) | D10–D13, D18–D19, D22, G1, G4–G5, G7 | Every "minimum three active AI rivals", "prevents an empty century", entrant-eligibility orchestration and entrant fixture is superseded. Authored P12 arrivals (already in code) are the only entrants. Endurance fixtures need a *shrinking-cohort* case (A17). |
| **Finance re-admitted** (B, C, F) | B4–B5, B8, B13, C1–C2, F1–F2 | "Never reads cash/valuation", "valuation → P16+", "loans not implied", "debt → P16+" are superseded. The constraints that survive: literal P11 accounting (F3–F4), hidden rival Cash (C5), symmetric remedies (F5). |
| **Ownership transactions loosened** (I) | I1, I5–I7, I9, I12 | Not reversed, only unfixed from P16+. The parity refutation (I2–I3) and identity law (I4) are untouched. The Owner's "auction" needs a ruling on who may bid (I12). |
| **Endless decided** (K) | K1–K2, K5–K6, K9 | Decision made; ROADMAP §21's eight design questions (K3) are still unanswered. |
| **Ladder vocabulary** (D) | D3, D14–D15 | "severe → insolvency → settlement/auction/closure" replaces "distress → dormant"; dormancy's fate is an open Owner choice. |
| **Code currency** (L) | L1–L4, L7–L10, L17–L18 | Six named paths/versions are stale against 592e926 (base SHA, save V15 → V19, three file paths, "rivals absent"). Two placeholder claims (L5, L6) still hold. One prerequisite (L16 phase-order catalogue) appears unmet. |

Counts (machine-counted over the register's ID column): **160 rows** — A 18 · B 15 · C 6 · D 25 · E 10 · F 6 · G 9 · H 6 · I 12 · J 11 · K 9 · L 21 · M 12. Primary verdicts: CONFIRMED 70 · QUALIFIED 43 · SUPERSEDED BY OWNER DIRECTION 31 · CORRECTED 10 · NEEDS CODE CHECK (as primary) 5 · NEW EVIDENCE 1. Code-check flags: all 21 L-section rows, plus 15 rows elsewhere (A6, A11, A12, C3, C6, D6, D21, D23, E5, E6, F4, G8, H3, H6, I10) = 36 rows for the later verifier.

---

## 4. Open uncertainties this lane could not close

1. **The 2026-09-11 direction is not yet a written ruling** in this scratchpad. RULINGS §8 says a newer explicit ruling governs, but until it is recorded, every SUPERSEDED row rests on the direction text supplied to this lane.
2. **"P12's minimum three active AI rivals"** (D11, G7) is attributed to P12 law; the P12 package doc and its Builder Annex are not in the scratchpad, so I could not verify the exact wording or whether it is a floor, a recommendation, or a fixture parameter.
3. **Which package owns loans** (F): P11 vocabulary is mandatory (F3–F4) but the direction leaves P11-vs-P15B placement open; rival-loan symmetry is undecided (F5).
4. **Who may bid at "auction"** (I12) and whether an auction is an ownership transaction in the P16+ sense.
5. **Dormancy's fate** (D3, D14): the Owner ladder omits it; not stated whether it is deleted or optional.
6. **Public disclosure of rival financial condition** (C5, F6, PKG §24 OQ8) is required by B, C, D and F together and remains unresolved.
7. **Phase-order catalogue prerequisite** (L16): first-pass grep finds no `phaseOrdinal` at 592e926; if that holds, ROADMAP §15 says P15A.1 "stops at reconnaissance". Verifier must confirm.
8. **P07 prospective-input seam** (A6, L19): the doc names `theatrical.ts`, which no longer exists; the actual seam at 592e926 must be located.
9. **Per-studio Standing** (B2, L11): no rival Standing generalization is visible at 592e926; a "prestige" PR lane sourced from Standing has no data for rivals.
10. **Post-2040 entrant/content policy** (G9, K3, K8): the "no automatic replacement" rule's reach into the sandbox is unstated.
11. **GameSpot pre-release/retail pages** (M7) were not re-fetched in this lane; the local extractions confirm only the negative (no shipped bankruptcy/acquisition text in manual/Prima/GameFAQs/gamepressure).
