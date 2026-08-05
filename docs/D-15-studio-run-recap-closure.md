# D-15 — Studio Run Recap and Capital Position Explainability — Closure

**Status:** MERGED, VALIDATED, and CLOSED. Read-only explainability milestone; **no economy,
persistence, or SaveFile change**. Economy/recovery balance remains a separate owner decision.

> Before beginning a substantial milestone, integration, audit, or meaningful bug fix, read the
> relevant entries in [`docs/LESSONS-LEARNED.md`](LESSONS-LEARNED.md); update it before closing
> substantial work. The D-15 lessons (run-level explainability · cash-positive-vs-financeable ·
> reconstruct-authoritative-behavior · finance-in-core · break-even category · timeline semantics ·
> synthesize-not-dump · legal-action-vs-recovery · warning hierarchy · format-at-the-boundary ·
> responsive SVG annotations · observation-vs-elapsed count · no repo paths in UI · responsive status
> labels · **actionability-from-authoritative-rules** · **base-need-vs-package-vs-normal-budget**) are
> finalized there.

## 1. Identity of the work

| Field | Value |
|---|---|
| Milestone | **D-15 — Studio Run Recap and Capital Position Explainability** |
| Starting authoritative `main` | `e87c34f915279ca69a…` → `e87c34f915279ca769a089457fa32213a7b5b555` |
| Authorized candidate branch | `phase-5.3-studio-run-recap-v1` |
| Final candidate SHA | `d90c45d078a4d93478218781cb60291d5875515b` |
| Merge commit (no-fast-forward) | `152acecfe904ab191ab28050ec7579a349fe686c` |
| Merge parents | `e87c34f…` (main) + `d90c45d…` (candidate) |
| Reviewed history preserved | `fa9662d` → `b91b026` → `91a390c` → `d90c45d` |
| Tag | `d15-studio-run-recap` |

Four accepted commits: (1) `fa9662d` initial Phase-1 recap; (2) `b91b026` bounded owner-gameplay
revision (break-even, timeline, chart, warnings, formatting); (3) `91a390c` final visual polish
(chart-label bounds, timeline wording, BREAK-EVEN nowrap, no repo path); (4) `d90c45d` authoritative
affordability parity correction. Merge-base was `main`, so the merge tree is byte-identical to
`d90c45d`; the closure commit adds only Markdown.

## 2. Owner acceptance

D-15 passed technical review, real Week 86 SaveFileV5 validation, first owner gameplay review, a
bounded gameplay revision, a second owner visual review, final visual polish, an authoritative
greenlight-action parity review, and **direct owner confirmation by successfully greenlighting the
bare-minimum film** on the Week 86 studio. The Builder was correct not to claim "no film package is
affordable" after the authoritative greenlight action disproved it.

## 3. Architecture & boundaries

- **One pure `studioRunRecap(state): StudioRunRecap`** in `src/core/studioRunRecap.ts` — reconstructs
  the whole-run recap from the live `GameState` (`SaveFileV5.state`). **No new persistence; no SaveFile
  version change.** Exported via `src/core/index.ts`; the React screen reaches it only through the
  single UI/core boundary `ui/src/engine/adapter.ts`.
- **Pure & read-only:** never mutates `GameState`, never advances the RNG, never recomputes a film
  outcome or a D-14 career event. The sim never reads the recap.
- **React owns presentation** (`ui/src/screens/StudioRunRecap.tsx`); a Dashboard `open-recap` entry;
  reached via the `Screen` union. Nothing in Phaser.
- **Frozen records:** `FilmResult`, `TheatricalRun`, and the `TalentCareerEvent` ledger are read as-is.

## 4. Authoritative source matrix (summary)

Every recap value is a direct field, a shared authoritative selector, an exact deterministic
reconstruction, or a clearly-labeled convention — full matrix in
[`docs/D-15-studio-run-recap-phase1.md`](D-15-studio-run-recap-phase1.md).

- **Capital totals** — ledger-derived (`financeTotals`): commitments = `−(production + freelancerFee)`;
  studio revenue = `studioRevenue`; **film contribution = Studio Revenue − committed cost** (payroll &
  overhead not allocated per film, D-12 §3/§8). Starting/opening cash = `INITIAL_CASH` via the
  reconciliation invariant.
- **Cash timeline** — exact reconstruction (cumulative signed ledger by week).
- **Film contribution / ROI / classification** — per-film `cumulativeStudioRevenuePaid − filmCommittedCost`.
- **Talent development** — aggregate frozen `careerEvents` (no recompute).
- **Affordability** — see §7 (authoritative, parity-tested).
- **Recent-typical commitment** — median of the last three releases' reconstructed commitments (labeled
  convention).

## 5. Presentation contracts

- **Profit / Break-even / Loss:** Break-even = `|contribution| ≤ max($25,000, 1% × committed cost)`
  (negligible return). Week 86 slate → **3 Profit / 1 Break-even / 5 Loss**.
- **Cash-timeline convention:** **Opening balance** (pre-commitment, `INITIAL_CASH`) distinct from
  **End of Week N** (post-ledger close); current week = 86. A compact inline **SVG cash chart** (opening
  reference, current, low; `role="img"` + text caption; not colour-only; annotations right-aligned inside
  the viewBox) is the default; the 86-row table is collapsed behind "View 86 weekly closing balances".
- **Warning hierarchy:** `{code, severity: important|caution|observation, priority}`; the screen shows
  the top 3 and collapses the rest under "More strategic observations"; severity as text.
- **Recovery classification:** `healthy | constrained | severe | noNormalProduction | incomplete`, from
  explicit conditions; never promises success. Week 86 = **severe**.
- **Methodology:** collapsed "How these figures are calculated" in plain language; **no repository
  path, filename, or dev reference** in the player UI.
- **Accessibility/responsive:** semantic headings, tables with column headers, keyboard-operable
  `<details>`, focus-visible, signed values as text; readable at 1440×900 / 1366×768 / 1280×720 / 125%
  zoom with no horizontal page overflow; clean console.

## 6. Test & evidence results (accepted baseline)

| Check | Result |
|---|---|
| Root + UI TypeScript | PASS |
| Unit/component (`npm test`) | **1025 passed / 79 files** |
| Full Playwright (`npx playwright test`) | **54 passed** |
| Focused recap Playwright (`e2e/recap.spec.ts`) | **3 passed** |
| Production build (`npm run build`) | PASS |
| Week 86 real-save acceptance (`out/d15-recap-week86/check.mts`) | **38/38** |
| Affordability action-parity (`ui/src/engine/recap-parity.test.ts`) | **4/4** |
| D1 / D-13 / D-14 / save-migration regressions | PASS (within the suite) |
| Determinism / no-mutation / no-RNG-advance | PASS |

Owner save and evidence screenshots are gitignored and **not tracked**.

## 7. Authoritative affordability semantics (the D-15 correction)

The recap distinguishes **differently-scoped** financial questions, and any "you can do X" claim uses
the **same rules as the action that performs X**:

1. **Base production need** (concept card) — Week 86 cheapest concept ≈ **$3.14M** base negative. This is
   *demand*, **not** the final greenlight commitment.
2. **Bare-minimum all-in greenlight package** — the **authoritative, action-derived** least-expensive
   greenlightable package: production commitment `0.75 × requiredNegative` (min-demand shape, grouped
   bit-identically to the action) **≈ $1.92M** + **minimum marketing $100K** + required immediate fees
   (**$0** when the contracted roster fields the film) = **≈ $2.02M**. Its `affordable` is the **same
   solvency gate** the greenlight action enforces (parity-tested).
3. **Standard-budget film** — a *labeled recap convention*: cheapest concept at the default budget grid
   (1.0×) + neutral demand + default marketing ($400K) **≈ $3.54M** — **unaffordable** at Week 86.
4. **Recent-typical commitment** — a *labeled recap convention*: median committed cost of the last three
   releases **≈ $4.42M** — **unaffordable**.

**Central rule (recorded):** *any recap statement that says the player "can do X" must use the same
authoritative rules as the action that performs X* (Lesson **AC**), and reconstruction is acceptable
only when it reproduces authoritative behavior, not a parallel approximation (Lesson **Q**, amended).

## 8. Week 86 owner evidence (from the owner's run — NOT hard-coded constants)

- Current cash ≈ **$2.83M**; bare-minimum all-in package ≈ **$2.02M** (greenlight **succeeded**; cash
  remaining ≈ **$818K**); standard-budget package ≈ **$3.54M** (unaffordable); recent-typical ≈ **$4.42M**
  (unaffordable); weekly fixed-cost drain ≈ **$39K**; **no** active theatrical revenue; contract horizon
  (~122 wk) beyond fixed-cost runway (~72 wk); **3 Profit / 1 Break-even / 5 Loss**; total film
  contribution ≈ **−$13.8M**; talent improved despite the studio's financial decline. These are read
  from the owner's Week 86 SaveFileV5, not production constants.

The final truthful distinction: a bare-minimum production is technically affordable; a standard-budget
production is not; a recent-typical production is not; making the minimum leaves very little cash;
waiting alone worsens the position; no active revenue offsets fixed costs; **a legal action existing is
not the same as a strong recovery path**.

## 9. Non-goals preserved

No economy retuning; no change to film costs / production-commitment calc / marketing / revenue /
payroll / overhead / contracts / D-13 discoverability / D-14 progression / SaveFileV5; **no financing,
debt, loans, bankruptcy, receivership, grants, emergency cash, or recovery mechanic**; Concept A default
OFF; D1-A untouched; D1-B unstarted; Asset Lab 05H untouched; no characters/GLBs/Three.js.

## 10. Separate owner decisions (deferred, not blocking)

- **Economy & recovery balance** — whether the microbudget-loss/discoverability economics or a recovery
  path should change is a separate owner ruling; D-15 only *explains* the current rules.
- **Recap headline framing** — the recap truthfully presents bare-minimum-affordable + standard/typical
  unaffordable; any future emphasis change is the owner's call.

## Cross-references

- Phase/design + source matrix: [`docs/D-15-studio-run-recap-phase1.md`](D-15-studio-run-recap-phase1.md).
- Canonical lessons: [`docs/LESSONS-LEARNED.md`](LESSONS-LEARNED.md) (D-15 series, finalized).
- Handoff pointer: [`docs/HANDOFF.md`](HANDOFF.md).
- Published branch `phase-5.3-studio-run-recap-v1` @ `d90c45d`; tag `d15-studio-run-recap`.

**Next owner decision required:** economy and recovery mechanics (balance, or whether to add a recovery
path) — a separate milestone/ruling. D-15 itself is closed.
