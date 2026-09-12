# Verification memo — Phase 1 / prior-claims register

**Lens:** COMPLETENESS & OVERCLAIM (adversarial)
**Report verified:** `scratchpad/out/phase1/prior-claims.md` (160-row P15 prior-claims register, 2026-09-11)
**Verifier mode:** READ-ONLY. Sources touched: the six authority docs in `scratchpad/authority/`, the `scratchpad/accepted-592e926/` snapshot (`src/`, `bridge/`, `docs/`), the plain-text extractions in `scratchpad/original-text/`, and `pdftotext` page checks of the Prima PDF in `/Users/bruce/Desktop/big swing art/`. No git command, build, test, or player data. One attempt to re-fetch the GameSpot preview (403) and one Wayback attempt (blocked) — both failed, so the pre-release label is left as the package doc states it.

**Verdict: VERIFIED WITH CAVEATS.** The register is structurally sound (counts, section citations, and code-path existence flags all reproduce), and the collision analysis against the 2026-09-11 direction is fair. But three things a hostile reviewer would find: (1) one code claim repeated in the summary is wrong (per-rival Standing *does* exist at 592e926, and an existing quarterly Standing-lane rank with movement is already served by the accepted bridge); (2) an uncertainty the author declared unresolvable ("P12 package doc is not in this scratchpad") was resolvable from the snapshot's own `docs/` tree; (3) the original-game pass missed the single most relevant shipped mechanic for topics E/F (the player balance can go "into the red"; debt restricts building; no documented game-over), and three of five printed Prima page cites are off by one page.

---

## 1. Spot-checks performed (12 claims)

| # | Report claim | Source checked | Result |
|---|---|---|---|
| 1 | Row counts 160 = A18 B15 C6 D25 E10 F6 G9 H6 I12 J11 K9 L21 M12; verdicts 70/43/31/10/5/1 | `grep`/`awk` over the register's ID and status columns | **CONFIRMED** exactly. |
| 2 | B5: PKG §12.2 says the definition "never reads Standing, cash/valuation, private slate, technology adoption, talent popularity, or a client calculation" | `P15-PACKAGE.md` L452–453 | **CONFIRMED** verbatim. |
| 3 | F1: PKG §16 "Loans, bailouts, investors, forced sales, or acquisition are not implied" | `P15-PACKAGE.md` L619 | **CONFIRMED** verbatim. D9/§17 "Documents and tests must call this terminal law asymmetric" at L654–655 also confirmed. |
| 4 | D3: PKG §12.3 lifecycle `active → warning → distress → recovery → active` with dormant branch; single negative-cash week cannot skip to dormancy | `P15-PACKAGE.md` L462–467 | **CONFIRMED.** |
| 5 | M2: Prima weights Capital/Movies/Stars 24 %, Lot Prestige/Awards 14 % at prima.txt L2816, L2843, L2850–2853, L2866, L2889–2890, printed pp. 45–46 | `prima.txt` + `pdftotext -f 47 -l 52` | **Weights CONFIRMED; citation partly wrong.** L2889 is *Lot Prestige* 14 %. *Awards* 14 % is at L3181–3182. Page footers (verified against the PDF: page numbers are footers, so a passage sits *before* its number) put Capital/Movies/Stars on printed **p. 46**, Lot Prestige on **p. 47**, Awards on **p. 51** — not "pp. 45–46". |
| 6 | M3: saturation passage prima.txt L3656–3663, printed p. 57 | `prima.txt`; PDF page 59 carries footer "58" | Passage **CONFIRMED** ("The more movies all studios, including yours, release in a genre, the more tired…"); printed page is **58**, not 57. A second, earlier statement of the same law sits on p. 51 (L3174–3176, "a high number of movies released by all studios in a genre actually drives down interest") and was not cited. |
| 7 | M8: "Though you can play past the year 2005, the game, reward-wise, ends there" L5121–5153, printed p. 79 | `prima.txt`; PDF page 81 carries footer "80" | Passage **CONFIRMED**; printed page is **80**, not 79. |
| 8 | M6: nine named rivals, four-year entry windows 1898–1971, p. 51 | `prima.txt` L3195–3208; PDF page 52 footer "51" | Table and page **CONFIRMED.** "Four-year" is Prima's own phrase (L3162–3163 "this can vary over a four-year period") but the table itself shows Lionear Productions **1905–1907**; the summary's "four-year entry windows" over-generalises one row. |
| 9 | L5/L6/D23: `reception.ts:679 const competitionFactor = 1.0`; comment L596; `types.ts:276–282 competingSlate`; `worldgen.ts:645 competingSlate: []`; `calendar.ts:3 RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]` | `sed` on the snapshot | **All CONFIRMED** line-exact. `save.ts:1632/1657` validation of `competingSlate` also confirmed. |
| 10 | L7–L9: `src/core/theatrical.ts`, `ledger.ts`, `events.ts` absent; `sharedMarket.ts`, `powerRanking.ts`, `industryEvents.ts` absent | `test -f` | **CONFIRMED** absent. Caveat: the register cannot tell whether these were wrong at `7811377` or renamed since; "CORRECTED" is only provable as "stale against 592e926". The report's L-section header says exactly that, so this is a wording caveat, not an error. |
| 11 | L16: no `phaseOrdinal`/`phaseOrderVersion`/`phaseId` in `src`/`bridge` | `grep -rn` incl. alternate spellings (`phaseCatalog`, `unknown-phase`, `phaseOrder`) | **CONFIRMED** absent (the only `phaseOrder` hit is a local sort map in `src/harness/roster-wall/continuation.ts:420`, not a scheduler catalogue). L16 stands. |
| 12 | L11 / B2 / summary claim 11: "standing.ts has no per-rival generalization … any Standing-sourced prestige lane [is] greenfield" | `src/core/hollywoodTypes.ts`, `hollywoodTick.ts`, `bridge/industry.ts`, `bridge/schema/industry-schema.ts` | **REFUTED.** See §2.1. |

Additional checks: HANDOFF L11–L15, L26–L28 quotes (D21, D22, D23, G8, A16, I8) all reproduce; RECEIPT numbers (L1, L14, L20: 592e926 / deca3952 / 2bc8d304; Save p95 9.58 s; serialize+digest p95 199.5 ms; Hollywood storage 37.8 MB; avg film 3,146 B; 12/48/4,000/50 stress unrun) all reproduce; RULINGS §4.1 L123–124, §4.3 L140–143, §5, §8 reproduce; ROADMAP §5.3 L165–167, §6.3 L211–215, §7 rows, §15 L528–531, §18 L609–635, §19.3 L677–679, §20, §21 L731–737, §23 reasons 3 & 8, §26 L884–887 reproduce; ANNEX A L43, C.2, C.3 L122–129, C.4, D.4 L253–254, H, K.4 fixture names, M.5/M.6, O refusal strings reproduce. `StudioIdentity` (hollywoodTypes.ts:6–17) has no dormant/closed/insolvency field — D21 confirmed.

---

## 2. Overclaims (report asserts more than its evidence supports)

### 2.1 REFUTED — "no per-rival Standing generalization at 592e926" (L11, B2, §4 item 9, summary claim 11)

The author grepped only `standing.ts` for `rival`/`studioId`. The generalisation was done by *reusing* the `Standing` type per rival, not by editing `standing.ts`:

- `src/core/hollywoodTypes.ts:83` — `RivalBusiness.standing: Standing`.
- `src/core/hollywoodTick.ts:19, 250` — imports `updateStanding` and applies it to each rival on `filmReleased` (before/after recorded in the receipt at L253); weekly awareness drift per rival at L277–278.
- `src/core/hollywoodTypes.ts:104` — `HollywoodChartSnapshot = { week; rows: { studioId; standing: Standing; output }[] }`.

So PKG §9's "P12 must generalize per studio" **was delivered** by P12 R05. L11 should read CORRECTED (delivered), not "probably not generalized". The knock-on: the report's §4 item 9 ("a 'prestige' PR lane sourced from Standing has no data for rivals") is wrong — the data exists; the *law* question (B2, "Standing is not rank") is the only obstacle.

### 2.2 MISSED — an existing quarterly Standing-lane rank with movement is already served by the accepted bridge (affects B1, B2, B10, B11, L15)

- `src/core/hollywoodTick.ts:306–313` — every `week % 13 === 0` (quarterly) a chart snapshot is taken; `previousChart` retained.
- `bridge/schema/industry-schema.ts:3–6` — `INDUSTRY_LANES = ['audienceAwareness','industryPrestige','commercialConfidence','output']`, each lane DTO carrying `rank`, `priorRank`, `movement` (`new | unavailable | up | down | unchanged`).
- `bridge/industry.ts:68–83` — rank = 1 + count of studios with a higher lane value; movement labels such as "Up 2 since 1931 · Week 14".

This is *not* a composite score (HANDOFF L26 stays true), and it is not the P15 Power Ranking. But it **is** a periodic rank + movement indicator derived directly from the three Standing channels — the exact thing PKG §11 law 3 ("Standing is not rank"), B11 ("no `#1`, arrow or Power Score") and the P12 Annex's own "No Power arrow appears before authority exists" (P12 Builder Annex L642) guard against. L15's "no Power Ranking … model at 592e926" is therefore literally true but materially incomplete: the register should carry a row flagging the delivered industry chart as either (a) the seam P15A.2 must subsume, or (b) an existing tension with B2/B11 that the Owner's "transparent multi-factor" ranking must reconcile. A hostile reviewer would call this the most important omitted code fact in the L section.

### 2.3 OVERSTATED — "P12 package doc is not in this scratchpad" (D11 note, §4 item 2)

The P12 package and its Builder Annex are present in the snapshot at `scratchpad/accepted-592e926/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` and `…-BUILDER-ANNEX.md`, plus `docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md`. The claim was verifiable:

- P12 package L883–885, "Ecosystem guardrail": recommended envelope **6–10 active AI rivals**, hard stress cap **12**, deterministic entrants maintaining a minimum of **3 active AI rivals** after the early game — explicitly "**design/benchmark bounds, not final balance**. P12A uses three rivals and does not need closure."
- P12 Builder Annex L626: "active-count floor | deterministic entrant scheduling, not cash resurrection".
- R05 Owner decisions L30: "Three rivals are enough for completion → Superseded: nine rivals plus player and all five later arrivals must be demonstrated"; L31: arrival RNG superseded by the fixed calendar.

So "P12's minimum three active AI rivals" (PKG §23 L800; ROADMAP §19.3 L679) is a *P12 design/benchmark recommendation*, never accepted P12 law, and the R05 acceptance replaced entrant generation with a fixed authored schedule. This strengthens the report's SUPERSEDED verdict on D11/G7 but the register should say so with the citation rather than declaring it unverifiable.

### 2.4 OVERSTATED — M4 "rival release behaviour is more recoverable than 'not recovered'"

Prima p. 50–51 (L3157–3158) says outright: "Though much of each studio's behavior is random, several things … contribute to what could be termed a 'personality'." The propensity *parameters* are recoverable (the report is right about that); the *decision implementation* — sampling, cadence, when a release happens — remains unrecovered, which is what PKG §5.2 actually said. QUALIFIED on M4 is defensible only if the row quotes Prima's "random" caveat. As written it reads as a stronger downgrade of the package doc than the evidence supports.

### 2.5 MINOR — summary claim 8 "'rival studios/projects absent at accepted base' is false"

False *at 592e926*. The register has no `7811377` snapshot and cannot say whether the PKG was wrong when written. The L-section header handles this ("stale against 592e926"); the summary line does not.

### 2.6 MINOR — M6 "four-year entry windows"

See spot-check 8: Lionear 1905–1907. Prima's own generalisation, repeated without the exception.

---

## 3. Completeness gaps (what the prompt asked, or the sources plainly offer, that the report skipped)

| # | Gap | Where it should have landed | Evidence |
|---|---|---|---|
| G1 | **Original shipped debt mechanic** — the player's balance "can go into the red", and debt blocks building most sets/facilities (with a listed exception set); no inspected source documents a game-over. | New M row(s) feeding E5/D7 (original precedent for "negative cash is not bankruptcy") and F (the original had an implicit overdraft, not loans). | `manual.txt` L129–130 (printed p. 10): "Your balance can go into the red but when you're in debt, you won't be able to build new sets…"; `prima.txt` L769–775 "Building in Debt" (printed p. 14) with per-facility "Build in Debt: Yes/No" flags throughout pp. 14–20; `gamefaqs-maxx.txt` L659–660 corroborates. **RETAIL SHIPPED MECHANIC, HIGH.** The report's grep terms (bankrupt/bust/out of business/close down/takeover) were tuned to rival closure and missed "in debt"/"in the red". This is the strongest original-game anchor for topic E and the report's own M11 shows it was willing to add new evidence. |
| G2 | **PKG §24 OQ9** ("Does dormancy retain a minimal operating presence or become archive-only?") is not in the register. | D-section; it is the package doc's own open question on exactly the point the report lists as unresolved (§4 item 5, "dormancy's fate"). | `P15-PACKAGE.md` L828. OQ3 ("Which current P07 boundary can accept market pressure prospectively") is likewise absent as a row, though A6/L19 cover the substance. |
| G3 | **Existing rival cash-reserve gate** — rivals already stop greenlighting when cash falls below an operating reserve (`hollywoodTick.ts:176`, `:98`, `:126`, `:197–200`; `policy.reserveWeeks`). | D-section NEEDS CODE CHECK: P15B's warning/distress predicates must be defined relative to this delivered de-facto stall behaviour, which is neither "dormancy" nor "distress" in P15 vocabulary. | Snapshot. |
| G4 | **`studioRunRecap.ts:1003`** already states in shipped copy: "No recovery mechanic (loans/financing) exists in the current rules." | F4 — a stronger, citable code fact than "no `loan`/`debt` symbols found", and a string that F will make false. | Snapshot. |
| G5 | **ROADMAP §19.3 L679 option text "responding to floor/cap"** and P12's **hard stress cap of 12** — a *cap* as well as a floor. Direction G removes the floor; it says nothing about a cap, and the P12 envelope is silent on what happens if consolidation drives the count below the P15 endurance fixtures' assumptions. | A17/G7 collision column. | ROADMAP L679; P12 package L885. |
| G6 | **ROADMAP §20 "ownership-aware legacy presentation"** (P16 candidate) — if direction I lands buying studios before 2040, the Legacy dossier (J) inherits an item the roadmap parked. | I/J cross-reference. | ROADMAP L703. |
| G7 | **ROADMAP §23 reasons 7 and 11** ("P15 market symmetry requires real conserved rival releases" — now met; "client bridge has not been designed for bounded paged P13–P15 projections" — `bridge/industry.ts` now serves `IndustryPage`/`IndustryQuery`, so partially met). | L18 already corrects reason 3; reasons 7 and 11 deserve the same CORRECTED (stale) treatment. | ROADMAP L771, L775; `bridge/schema/industry-schema.ts:16`. |
| G8 | **Prima's Awards factor is recency-only** ("the number of awards your studio has won at the most recent award ceremony", L3183–3186, p. 51). | M11 — strengthens the report's own "the original composite already had momentum" argument; not cited. | `prima.txt`. |
| G9 | **"Consolidation" (topic G)** — the register has no row on industry *shrinkage*. Fair, because none of the five docs discusses it, but the report should state that explicitly ("no inspected P15 doc addresses a shrinking cohort") rather than leave the topic implicit in A17. | G-section preamble. | grep for consolidat/shrink/fewer across all four docs: no hits. |

Prompt coverage otherwise: all thirteen topic letters have rows; the seven required columns are present; the 60–120 row target was exceeded (160) without padding — the extra rows are mostly ANNEX/HANDOFF cross-references and are legitimate.

---

## 4. Alternative sources the report could have used (all local, read-only)

- `accepted-592e926/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` and its annex (resolves §4 item 2).
- `accepted-592e926/docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md` (R05 supersession table; resolves the "three rivals" lineage).
- `bridge/schema/industry-schema.ts` (the delivered lane/rank/movement DTO — see §2.2).
- `pdftotext -layout` on the Prima PDF for footer-based page numbers (the extraction's page markers are footers; the report read them as headers for three of five passages).

---

## 5. What survives intact (confirmed strong claims)

- The register's counts and verdict distribution.
- The terminal-asymmetry cluster (D2, D9, E1–E4, E7–E8) is correctly identified as reversed by direction E; the surviving constraints (pre-terminal symmetry, staged warning/recovery, all-owner settlement manifest) are correctly retained.
- The entrant-floor cluster is correctly SUPERSEDED by G, and the code fact that authored arrivals already exist (`calendar.ts:3`) is exact.
- B4/B5/B8 (cash/valuation exclusion superseded; three-lane transparency, dense ties, no blended `powerScore` retained) are correctly read from PKG §12.2 and ANNEX D.4.
- C1–C2, F1–F2, I1/I5–I7 placement/parking rows and the I2–I3 parity refutations are correct against the docs; my independent grep of all five extractions found no shipped bankruptcy/closure/acquisition/takeover text (only "acquiring the Cosmetic Surgery facility"), so "no inspected source establishes X" stands.
- L1–L4, L7–L10, L17–L18 staleness corrections are correct against 592e926; L5, L6, L12, L16, L21 first-pass flags are exact.
- J1–J7, J10–J11 and K1–K9 are faithful to ROADMAP §18/§21, ANNEX E.6/M.6 and PKG §12.4.
- The governance caveat (RULINGS §8; the 09-11 direction is not yet a recorded ruling) is correct and appropriately prominent.

---

## 6. Recommended corrections before the register is relied on

1. Rewrite L11 as CORRECTED (delivered): per-rival Standing exists (`hollywoodTypes.ts:83`, `hollywoodTick.ts:250`); drop §4 item 9's "no data for rivals".
2. Add an L row for the delivered quarterly Standing-lane industry chart (`hollywoodTick.ts:306–313`, `bridge/industry.ts:68–83`, `industry-schema.ts:3–6`) and re-mark B2, B10, B11 and L15 as QUALIFIED; NEEDS CODE CHECK with the "Standing is not rank" tension named.
3. Replace the D11/G7 unverifiable note with the P12 package L883–885 citation ("design/benchmark bounds, not final balance") and the R05 supersession (L30–31).
4. Add M rows for the shipped debt mechanic (manual p. 10; Prima p. 14; GameFAQs Maxx) and cross-reference E5/D7/F.
5. Fix the Prima page cites: weights pp. 46–47 and 51 (Awards at L3181–3182), saturation p. 58, Lifetime Honors p. 80; note Lionear's 1905–1907 window.
6. Add PKG §24 OQ9 (and OQ3) as rows; add Prima's "much of each studio's behavior is random" caveat to M4.
7. Optional: G3–G8 above.

None of these changes the report's headline collision clusters; items 1–2 change what the later code verifier must test for topic B.
