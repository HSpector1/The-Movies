# Source-fidelity verification — P15 Prior-Research Claim Register

**Target:** `scratchpad/out/phase1/prior-claims.md` (Phase 1 / prior-claims lane, 2026-09-11)
**Lens:** SOURCE FIDELITY — does the cited source say what the register says, at the cited page/line/URL, and is the evidence tier right?
**Mode:** READ-ONLY. Only `scratchpad/out/phase1-verify/` was written. No git repository, branch, build, test or player data was touched. The Prima PDF was read with `pdftotext -layout -f N -l N` to stdout / this folder only.
**Verdict:** **VERIFIED WITH CAVEATS.** The register's document citations, machine counts and code-existence claims reproduce exactly. Its Prima printed-page numbers are systematically off by one (page numbers are footers, not headers), one Prima line citation points at the wrong weight, one quotation is attributed to the wrong document, and one directly relevant piece of retail evidence (the original's permitted-debt state) was missed.

---

## 0. Method

Twelve consequential claim groups were selected from the author's summary and the register. For each I went to the cited source myself:

- authority docs: `sed -n` on the exact line ranges in `scratchpad/authority/*.md`;
- code: `test -f`, `wc -l`, `sed -n`, `grep -rn` on `scratchpad/accepted-592e926/`;
- original game: `grep -n`/`sed -n` on `scratchpad/original-text/{manual,prima,gamefaqs-*,gamepressure-*}.txt`, then `pdftotext` of the specific Prima PDF page to fix the printed page number;
- GameSpot tier: the live URL returned HTTP 403, so I used the Wayback captures another lane had already cached under `scratchpad/web/` (`gs-2004-preview.html`, `gs-e3-2002-20031223073334.txt`, `gs-e3-2002-20050903180417.txt`, `gs-review-2005.txt`, `eg-review.txt`).

Default rule applied: a citation I could not reproduce is recorded as WEAK.

---

## 1. Claim-by-claim checks

### Check 1 — Register size and verdict counts (summary claim 1)

| Item | Register says | Reproduced |
|---|---|---|
| Rows | 160 (A18 B15 C6 D25 E10 F6 G9 H6 I12 J11 K9 L21 M12) | `grep -cE '^\| [A-M][0-9]+ \|'` = **160**; per-section tally identical |
| Primary verdicts | CONFIRMED 70 · QUALIFIED 43 · SUPERSEDED 31 · CORRECTED 10 · NEEDS CODE CHECK 5 · NEW EVIDENCE 1 | awk on column 8 first token = **70 / 43 / 31 / 10 / 5 / 1** |
| Code-check flags | 36 = all 21 L rows + 15 others (A6, A11, A12, C3, C6, D6, D21, D23, E5, E6, F4, G8, H3, H6, I10) | 15 non-L rows carry the phrase in column 8 — exactly the listed set. Only 5 L rows carry it literally in column 8; the other 16 rely on the section preamble "Every row here is NEEDS CODE CHECK". Arithmetic holds under that convention. |

**Verdict: CONFIRMED (HIGH).**

### Check 2 — "No mandatory hard-bankruptcy game-over … call it asymmetric" (D2, D9, E1–E4, E7, summary claim 2)

| Citation | Source text (paraphrase / ≤40-word quote) | Match |
|---|---|---|
| PKG §2 L92–95 | "P12 already permits rival failure while the player has no mandatory hard-bankruptcy game-over; exact rival closure and any separate player terminal ending remain distinct Owner decisions" | exact, L93–95 |
| PKG §12.3 L470–474 | "PROJECT AUTHORITY VERIFIED: P12 permits rival failure while protecting the player campaign from mandatory hard-bankruptcy game-over … player graph remains recoverable dormancy unless the Owner separately authorizes a player terminal ending" | exact, L469–473 |
| PKG §16 L624–627 | "Terminal eligibility is intentionally not symmetric: accepted P12 law permits rival failure while the player has no mandatory hard-bankruptcy game-over." | exact, L624–625 |
| PKG §17 L651–655 | "Documents and tests must call this terminal law asymmetric rather than demanding terminal parity." | exact, L654–655 |
| ANNEX A L43; M.5 L947–948 | "rival closure and any player terminal endin[g]…" / "P12's terminal asymmetry remains visible: rival closure needs a dedicated policy, while a player terminal ending needs a different Owner ruling." | exact |
| ROADMAP §19.3 L678 | "preserve P12's no-mandatory-hard-bankruptcy law … Terminal eligibility is explicitly asymmetric" | exact |
| RULINGS §4.3 L140–141 | "OWNER DECISION OPEN: … player/rival closure asymmetry …" | exact |

The "SUPERSEDED BY OWNER DIRECTION" status depends only on direction E as supplied to the lane; the register correctly flags (§0.4 governance note, §4 item 1) that no written 2026-09-11 ruling exists in the scratchpad. **Verdict: CONFIRMED (HIGH).**

### Check 3 — Entrant floor / "P12's minimum three active AI rivals" / "prevents an empty century" (D10–D13, G7, summary claim 3)

| Citation | Source text | Match |
|---|---|---|
| PKG §23 L798 | rival-closure row: "…with exact triggers, settlement, entrant floor, immutable archive…" | exact |
| PKG §23 L800 | later-entrants row: "deterministic bounded eligibility with P12's minimum three active AI rivals … prevents an empty century" | exact |
| ROADMAP §19.3 L677 | "…P12 registry settlement, archive, and active-rival-floor proof" | exact |
| ROADMAP §19.3 L679 | "deterministic bounded P15B eligibility with P12's minimum three active AI rivals … Prevents an empty century" | exact |
| ANNEX C.3 L127–129 | "`dormant → closed` only after exact Owner-approved trigger, settlement, archive, and entrant-floor law … Acquisition is never implied." | exact |
| ANNEX K.4 L773–779 | `entrant-no-partial-mint`, `entrant-after-several-standards`, `entrant-duplicate-request` | all present |
| `src/core/calendar.ts:3` | `export const RIVAL_ARRIVAL_WEEKS = [0, 0, 0, 0, 520, 988, 1560, 1872, 2548] as const` | exact; `campaignDate()` at L13; policy string `campaign-calendar-1920-52/v1` at L2 |
| HANDOFF L12 | "four opening rivals and later arrival weeks 520/988/1560/1872/2548 are fixed per campaign" | exact |

The register's caveat that the P12 package doc is not in the scratchpad (so "minimum three" cannot be traced to P12's own wording) is correct — `scratchpad/authority/` holds only the six listed files. **Verdict: CONFIRMED (HIGH).**

### Check 4 — Power Ranking exclusion "never reads Standing, cash/valuation…" and lane rules (B4–B8, summary claim 4)

| Citation | Source text | Match |
|---|---|---|
| PKG §12.2 L448–456 | "publish quarterly after one complete trailing 52-week window … three independent public 0–10 lanes … it never reads Standing, cash/valuation, private slate, technology adoption, talent popularity, or a client calculation … unweighted lane sum (0–30) … dense rank" | exact, L448–455 |
| PKG §23 L803 | "avoids Standing/valuation duplication and volume spam" | exact |
| ROADMAP §19.3 PR-definition row | "excludes Standing, cash/valuation, private slate, and client math" | exact (this phrase is ROADMAP's, not PKG §23's; the register's B8 lists both sources jointly, which is accurate) |
| PKG §11 law 3 L391 | "Standing is not rank." | exact |
| ANNEX D.4 L253–254 | "Do not store an unexplained blended `powerScore` merely to sort rows … TypeScript emits the authoritative order." | exact |
| ANNEX E.7 L482 | "No rank in P15A.1 DTOs—not even an unused nullable field." | exact |
| `src/core/standing.ts` | 207 lines; `grep -i 'rival\|studioId'` → 0 hits | reproduced |

**Verdict: CONFIRMED (HIGH).**

### Check 5 — Valuation / loans / acquisition parking (C1–C2, F1–F2, I1, I5–I7, summary claims 5–6)

| Citation | Source text | Match |
|---|---|---|
| PKG §2 L99–102 | "acquisitions, mergers, labels/subsidiaries, co-productions, and library/IP ownership transactions move to P16+ Studio Empire & Ownership Transactions" | exact |
| PKG §16 L619 | "Loans, bailouts, investors, forced sales, or acquisition are not implied." | exact, L619 |
| PKG §25 L839–847 | P16+ bullets include "studio and library valuation" and "debt/equity/investor integration if separately approved" | exact |
| PKG §25 L860–861 | "Corporate transactions are not allowed to re-enter P15 as 'small' UI options." | exact |
| PKG §11 law 14 L402 | "Corporate transactions wait." | exact |
| PKG §13.2 L539 | "Future acquisition cannot rewrite historical creator/owner facts; this is a P16 requirement" | exact |
| ROADMAP §5.3 L165–167 | "Negative cash is currently recoverable and does not mean bankruptcy. P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger…" | exact |
| ROADMAP §6.3 L215 | "…and valuation belong in P16+, not P15B" | exact |
| RULINGS §4.2 L134–136; §5 L150–151; §8 L202–206 | corporate-title clarification; parking list includes "valuation"; "unless the Owner issues a newer explicit ruling" | exact |
| HANDOFF L15 | "Negative Cash alone is not bankruptcy and runway is not an invented distress threshold." | exact |

**Verdict: CONFIRMED (HIGH).**

### Check 6 — Rival ladder and settlement law (D3–D8, H1, I12, summary claim 7)

PKG §12.3 L462–464 shows the graph `active → warning → distress → recovery → active` with `↘ dormant → recovery`; L466 "A single negative-cash week cannot skip directly to dormancy"; L474–475 settlement invariants; L481–484 P13/P14/P10/P11/P12 dispositions. ANNEX C.3 table L118–123 and B rows reproduce as cited. PKG §16 L615–618 lists the four recovery routes verbatim. **Verdict: CONFIRMED (HIGH).** The "auction ⇒ mini ownership transaction" point is the register's own analysis, not a citation, and is labelled as such.

### Check 7 — Stale code/seam claims (L1–L4, L7–L10, L17–L18, summary claim 8)

| Register claim | Reproduced at 592e926 |
|---|---|
| PKG/ANNEX header base SHA `7811377` (PKG L9, ANNEX L9) | exact; RECEIPT L23 and HANDOFF L7 give `592e926…`; Unity `deca3952…` (build source) / `2bc8d304…` (observed HEAD) — exact |
| PKG §9 L362 "accepted save generation is V15" | exact; HANDOFF L7 / RECEIPT L27 = "4 / 29 / V19 / 1"; `save.ts:363 export type SaveFileV19`, `:364 saveVersion: 19`, `:5018 "…versions 1 through 19 only"`; `GameStateV19` at `types.ts:1689`; no `V20` |
| `src/core/theatrical.ts`, `ledger.ts`, `events.ts` named at PKG L352/356/358 | all three **MISSING** in the snapshot; `studioEvents.ts` (238), `studioHistory.ts` (388), `economy.ts` (92), `economyView.ts` (649), `financeReport.ts` (295), `forecast.ts` (487), `tick.ts` (1065), `studioRunRecap.ts` (1085), `studioWeekTheater.ts` (689), `releaseAuthority.ts` (230) exist with the line counts the register gives |
| PKG L359 "rival studios/projects absent at accepted base" | `hollywood.ts` (201), `hollywoodTick.ts` (316), `hollywoodTypes.ts` (124), `hollywoodValidation.ts` (447), `industryEmployment.ts` (35), `industryCareer.ts` (23), `hollywoodStartingData.ts` (52), `bridge/industry.ts` (189) all exist; `hollywoodTypes.ts:113 identities: StudioIdentity[]` |
| L4 player `Studio` singleton still present | `types.ts:291 export type Studio = {`, `:480 studio: Studio` — the register's "likely still exists" is confirmed |
| L10 `studioCalendar.ts` + new `calendar.ts` | 869 and 31 lines — exact |
| L14 file sizes 7,964 / 2,709 / 2,062 | exact |
| ROADMAP §23 reason 3 L767 "design authority, not accepted implementation roots" | exact |

**Verdict: CONFIRMED (HIGH).** One attribution slip inside L17: the quoted phrase "no continuing coding/runtime queue remains" is RECEIPT L53, not HANDOFF; HANDOFF L39 says "Implementation/runtime ownership is yielded to Current Ops with publication … no such work is queued here." Same meaning, wrong document.

### Check 8 — Placeholders still inert (L5, L6, A16, summary claim 9)

- `reception.ts:679 const competitionFactor = 1.0` — exact. Comment at L596: "competitionFactor ≡ 1.0 (N11). Pure; no sampling." — exact. All other references (L146, L638, L702, L762; harness audit files) only read the value.
- `types.ts:274 CompetingRelease = { marketPressure: number }`, `:276–282 MarketState … competingSlate: CompetingRelease[]` — exact (the register's "276–282" is the `MarketState` block; `CompetingRelease` itself is L274, a two-line offset).
- `worldgen.ts:645 competingSlate: [],` — exact. Repo-wide grep for `competingSlate|marketPressure` in `src`, `bridge`, `ui/src/engine` finds only `types.ts`, `worldgen.ts` and the `save.ts` validators (L1632, 1657, 1661–1662). Nothing ever pushes into the slate. `EraConfig` at `types.ts:284` — exact.

**Verdict: CONFIRMED (HIGH) — and stronger than the register states:** the slate is not merely "empty at worldgen"; no code path writes to it at all.

### Check 9 — Phase-order prerequisite unmet (L16, summary claim 10)

PKG §18.1 L670–673 and ROADMAP §15 L528–531 ("if it is absent, the slice stops at reconnaissance rather than inventing a local order") reproduce exactly. `grep -r 'phaseOrdinal\|phaseOrderVersion\|phaseId'` over `src`, `bridge`, `ui/src/engine`, `docs` = **0** hits. Broader `PhaseId|phaseCatalog|phaseOrder|TickPhase` finds only two harness-local sort helpers (`src/harness/roster-wall/continuation.ts:420`, `src/harness/facilities/index.ts:548`), not a scheduler catalogue. **Verdict: CONFIRMED (MEDIUM, as the register rates it — a behaviour verifier should still confirm the scheduler has no catalogue under another name).**

### Check 10 — Greenfield claims: no status field, no loans, no per-rival Standing (D21, F4, L11, summary claim 11)

- `StudioIdentity` (`hollywoodTypes.ts:6–17`): fields `studioId, role, row, name, mark, color, founding, eligibleWeek, enteredWeek, recordedFromWeek` — no dormant/closed/status field. `grep -i 'dormant\|closed\|insolven\|bankrupt' hollywood*.ts industry*.ts` = 0. HANDOFF L27 says the same. **Confirmed.**
- Loans: `grep -riw 'loan\|loans\|debt' src/core` = 2 hits, both non-symbols: a name in `data/wordlists.ts:61` and a prose string at `studioRunRecap.ts:1003`: "No recovery mechanic (loans/financing) exists in the current rules." The register's "no `loan`/`debt` symbols" is **correct in substance but understated** — the code itself declares the absence, which is better evidence than a silent grep.
- `standing.ts`: 0 hits for `rival`/`studioId` — **confirmed** (first-pass only, as the register says).

**Verdict: CONFIRMED (MEDIUM→HIGH).**

### Check 11 — Original-game rows: Prima and manual citations (M1–M8, M11, summary claim 12) — **the caveat cluster**

Line numbers in `prima.txt` reproduce; **printed page numbers do not.** In the Prima extraction the page number is a *footer* (it sits at the bottom of each page, immediately before the copyright line that opens the next page). The register read it as a header, so every passage that sits *below* a marker was assigned the previous page. Confirmed by `pdftotext -f N -l N` (PDF index N = printed page N−1):

| Register row | Register cites | What I found | Correct printed page |
|---|---|---|---|
| M2 Capital 24 / Movies 24 / Stars 24 | prima.txt L2816, L2843, L2850–2853 "pp. 45–46" | L2816 "24% of Studio Rating" (Movies), L2843–2844 Capital 24%, L2850/2852 Stars 24%; all on PDF idx 47 whose footer reads **46** (`HOW STUDIOS ARE RATED` is at idx47:14) | **p. 46** |
| M2 Lot Prestige 14 | L2889–2890 "pp. 45–46" | L2889 "14% of Studio Rating"; PDF idx 48, footer **47** | **p. 47** |
| M2 Awards 14 | **L2866** | L2866 is "**35% of Lot Prestige**" (the Attractiveness sub-factor), not Awards. Awards 14% is at **L3182** ("Awards / 14% of Studio Rating"), PDF idx 52, footer **51** | **p. 51**, L3182 |
| M11 Capital scale $50k–$1.6M; "impact of individual movies decays over time" | L2794–2812, L2841–2847 "pp. 45–46" | L2792–2810 sidebar, L2834–2836 decay sentence — both PDF idx 47 | **p. 46** |
| M3 all-studio genre saturation | L3656–3663 "p. 57" | "The more movies all studios, including yours, release in a genre, the more tired of the genre the public will get" at L3656–3657; PDF idx 59, footer **58** | **p. 58** |
| M8 / J11 "play past the year 2005" | L5121–5153 "p. 79" | L5121 "Though you can play past the year 2005, the game, reward-wise, ends there."; PDF idx 81, footer **80** | **p. 80** |
| M4 / M6 rival table, nine rivals, four-year windows | L3195–3208 "p. 51" | table Old Rope Cinema 1898–1902 … Booboo & Dingo Films 1967–1971, with "Releasing Movie in Most Popular Genre" and five propensity columns; PDF idx 52, footer 51 | **p. 51 — correct** (the table sits above the footer) |
| M6 "quinquennial" | L2828 | "Awards: The number of awards won in the quinquennial award ceremonies" | L2828 ✓ (also L2663); p. 46 |
| M5 research unlock 1931 for all studios; fired Star joins a rival; rival Stars in Stage School queue | L2454, L1158, L300–314 | all three reproduce verbatim at those lines | ✓ |
| M1 manual charts "in relation to the competition", "your finances" | manual.txt L509–528 "pp. 21–22" | L515–517 and L525–528 reproduce; the `Page 22` header at L532 follows, so the charts text is p. 21 ✓; Awards "Every five years" at L542 is p. 22 ✓ | **correct** (manual markers are headers) |
| M6 "ten-slot chart including the player" rated LOW/inference | — | no "ten"/"10 studios"/"ten-slot" text anywhere in prima.txt or manual.txt; Prima L3163–3164 says "The Studio Charts get longer and longer as more studios enter the studio wars" — a growing chart, not a fixed ten slots | register's LOW is right; the source actually leans against a fixed ten-slot chart |

Weights themselves (24/24/24/14/14 = 100) are correct. Evidence-tier labels (manual = retail shipped; Prima = developer-reviewed guide evidence) are appropriately assigned.

**Verdict: CONFIRMED IN SUBSTANCE, WEAK ON PAGE CITATIONS.** Anyone citing the register's Prima page numbers downstream would cite the wrong page four times out of six.

### Check 12 — Negative evidence and the pre-release tier (D24, I2, M7, summary claim 13)

- Local negative grep re-run with a broader pattern (`bankrupt|goes/go/went bust|out of business|close(d) down|shut(s) down|take ?over|acqui|buy ?out|merger`) over all five extractions: only non-corporate hits (prima L323 experience "acquired", L2411 truncated word, L5244 "Take over the top spot", L5447 "acquiring the Cosmetic Surgery facility"). **Reproduced.**
- Cached GameSpot 2005 retail review and Eurogamer review (`scratchpad/web/gs-review-2005.txt`, `eg-review.txt`): no bust/bankrupt/acquire/takeover text. Adds a CONTEMPORARY PROFESSIONAL negative the register did not have.
- Tier check on the two PKG-cited pre-release items (the register inherited the label without re-fetching; the live URL is 403 to WebFetch):
  - `scratchpad/web/gs-2004-preview.html` (Wayback capture of `gamespot.com/articles/the-movies-preview/1100-6089840/`): "…keeps track of time and any milestones your movies may have reached, at least until the studio goes bust" and "The Movies is scheduled for release on the PC and consoles later this year" — **PRE-RELEASE PROMISE confirmed.**
  - `scratchpad/web/gs-e3-2002-20031223073334.txt` (E3 2002 First Look): "Competition from other studios raises the stakes for success, and one way to grow is to acquire your competitors" and "The Movies has been in development only since January" — **PRE-RELEASE PROMISE confirmed.**

**Verdict: CONFIRMED (HIGH).** The register's "no inspected source establishes X; absence ≠ proof of absence" framing is correct.

### Check 13 (bonus) — 2040 finale and Endless Mode citations (J2–J7, K3–K5, summary claims 14–15)

ROADMAP §18 L609–620 lists exactly eight archetypes and "eight archetypes maximum"; L627–635 the seven "must identify" items including "active rivals and historically important inactive rivals". PKG §22 L781–786: "maximum-16-domain manifest … at most eight archetype IDs, at most twelve qualifying and twelve contrary fact references per archetype, at most twelve lens summaries". PKG §14 L563–564 celebration is presentation-only. ANNEX M.6 L962 "No 'overall 92,' letter grade, world rank, winner, GOAT meter". ROADMAP §21 L731–737: three options; option 3 must answer "catalogue supply, entrant/retirement generation, era presentation, market normalization, awards cadence, balance support, save compatibility, and whether new achievements exist" — eight questions, as the register says; "'Keep ticking' is not a complete design." RULINGS §4.3 L143 "Post-2040 Endless Mode remains undecided. P15 may not silently create or authorize it." ROADMAP §26 L884 "Endless Mode is undecided." ANNEX O L1029/1030/1032 refusal strings verbatim. **All exact. Verdict: CONFIRMED (HIGH).**

---

## 2. Corrections the register should carry

| # | Row(s) | Problem | Corrected statement |
|---|---|---|---|
| C1 | M2, B15, summary claim 12 | Prima printed pages "45–46" | Capital/Movies/Stars 24% each and the Capital $50k–$1.6M scale are on **printed p. 46** (PDF idx 47); Lot Prestige 14% on **p. 47** (PDF idx 48); Awards 14% on **p. 51** (PDF idx 52). |
| C2 | M2 | "L2866" cited for a Studio-Rating weight | L2866 is "35% of Lot Prestige" (Attractiveness sub-factor). Awards 14% is **prima.txt L3182**. |
| C3 | M3, summary claim 12 | genre-saturation passage "p. 57" | **p. 58** (PDF idx 59); lines L3656–3663 are right. |
| C4 | M8, J11, summary claim 12 | Lifetime Honors "p. 79" | **p. 80** (PDF idx 81); lines L5121–5153 are right. |
| C5 | M11 | "pp. 45–46" | **p. 46**. |
| C6 | §0.2 method note | "printed page numbers taken from the page markers embedded in the extraction" | Prima markers are **footers**; text after a marker belongs to the *next* page. Manual markers (`…qxp … Page N`) are headers and were read correctly. |
| C7 | L17 | quote "no continuing coding/runtime queue remains" attributed to HANDOFF | It is **RECEIPT L53**; HANDOFF L39 reads "no such work is queued here". |
| C8 | F4, §2 table | "no `loan`/`debt` symbols in `src/core/*.ts`" | True for symbols; add that `studioRunRecap.ts:1003` states in a player-facing reason string: "No recovery mechanic (loans/financing) exists in the current rules." — explicit code evidence that F is greenfield. |
| C9 | L6 | "still empty at worldgen" | Stronger: no code path in `src`, `bridge` or `ui/src/engine` ever writes to `competingSlate`; the only references are the type, the worldgen literal and the save validator. |

None of these changes a status verdict in the register.

---

## 3. Missing items (evidence the register should have recorded)

1. **Original permitted-debt state — RETAIL SHIPPED MECHANIC, HIGH.** Manual p. 6 (`manual.txt` L124–130, under "Cash Balance"): "Your balance can go into the red but when you're in debt, you won't be able to build new sets or add certain facilities and lot ornamentation." Corroborated by Prima p. 14 "Building in Debt" (`prima.txt` L769–776, with the exception list Casting Office / Production Office / Stage School / Crew Facility / Basic Script Office / Stage Set) and by the GameFAQs Maxx FAQ (`gamefaqs-maxx.txt` L659–660). This is the original's answer to topics E and F: negative cash was allowed, it restricted building, and it was *not* bankruptcy; no loan mechanic is described anywhere. It belongs beside E5/M7 as the retail precedent for "negative cash is not bankruptcy", and beside F1–F4 as evidence that the original shipped **no** loans. The register's negative grep did not include `debt`/`in the red`, so it missed this.
2. **Manual p. 6 also states "Your Cash Balance contributes toward your ranking in the Charts"** (`manual.txt` L127–128) — a second retail (manual, not only Prima) source for the "financial factor in the original composite" point the register makes at M11/B15 from Prima alone.
3. **Prima's "The Studio Charts get longer and longer as more studios enter"** (`prima.txt` L3163–3164, p. 51) should be cited against PKG §5.4's "ten-slot chart" wording; the register already rates that LOW but did not give the contrary text.
4. **Contemporary-professional negative:** the cached GameSpot 2005 review and Eurogamer review contain no bankruptcy/closure/acquisition mechanic — usable to upgrade M7 from "local extractions only" to "manual + Prima + two retail reviews".
5. **PKG §5.5's two GameSpot pre-release items** can now be cited with reproduced text and status (see Check 12) instead of being carried on PKG's word.

---

## 4. Confidence-tier assignment audit

| Register tier label | Sample rows | Assessment |
|---|---|---|
| RETAIL SHIPPED MECHANIC (manual) | M1 | correct |
| PRIMA EVIDENCE / developer-reviewed guide | M2–M6, M8, M11 | correct; register never promotes Prima to executable proof |
| PRE-RELEASE REPORT ONLY | D24, I2, M7 (inherited from PKG) | correct — reproduced from Wayback captures |
| "no inspected source establishes X" | D24, M7 | correct wording; not promoted to proof of absence |
| PROJECT AUTHORITY / OWNER APPROVED / PRELIMINARY RECOMMENDATION | throughout | labels match the documents' own labels at the cited lines |
| First-pass code flags | L-section, D21, F4, etc. | correctly marked "first pass", "grep only", "NEEDS CODE CHECK" |

No tier inflation found.

---

## 5. Verdict

**VERIFIED WITH CAVEATS.**

- **Confirmed strong:** row/verdict counts; every PKG/ANNEX/ROADMAP/RULINGS/HANDOFF/RECEIPT line citation I tested (≈60 line ranges) reproduces verbatim; all file-existence, line-count and symbol-absence claims against 592e926 reproduce; both inert placeholders are inert; the phase-order prerequisite has no matching symbol; the pre-release tier on the GameSpot items is right; the local negative on bankruptcy/acquisition is right.
- **Weak / to correct:** Prima printed-page numbers are off by one in four of six places (footer misread); one Prima line citation (L2866) points at the wrong weight; one quote is mis-attributed between RECEIPT and HANDOFF.
- **Missing:** the original's retail permitted-debt state (manual p. 6 / Prima p. 14 / GameFAQs) — directly relevant to E and F and absent from the register.

Files consulted: `scratchpad/authority/*.md`; `scratchpad/accepted-592e926/{src,bridge,ui/src/engine}`; `scratchpad/original-text/*.txt`; `/Users/bruce/Desktop/big swing art/The_Movies_Prima_Official_eGuide.pdf` (pages 46–48, 51–52, 57–59, 80–81 via `pdftotext`); `scratchpad/web/gs-2004-preview.html`, `gs-e3-2002-*.txt`, `gs-review-2005.txt`, `eg-review.txt`.
