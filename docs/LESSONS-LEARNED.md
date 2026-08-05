# Project: Studio — Canonical Lessons Learned

> **Before** beginning a substantial milestone, integration, audit, or bug fix, Builders and PMs
> **must read** the relevant entries in this record.
> **Before** closing substantial work, they **must update** it.

This is the single durable lessons record for Project: Studio and for reusable practices that
should inform future game projects. Do not create competing Engine/Art/temporary lessons files;
add entries here and cross-reference.

## How to use

Each entry captures, where applicable: task/defect · domain · symptom or risk · root cause · why
existing safeguards missed it · resolution or deferred action · regression/verification coverage ·
fastest future diagnostic · reusable pattern · anti-pattern · reuse classification · related
commits/tests/docs · open follow-up. Reuse classes: **P** = Project: Studio-specific ·
**MG** = reusable for future management games · **BR** = broadly reusable across repositories.

---

# D1-A — Studio Identity Package (merged `af7c238`, tag `d1a-studio-identity-package`)

Context: a bounded, presentation-only studio-identity visual proof (Concept A — Golden Age Deco),
default OFF, merged onto `main` at starting SHA `ceb271b`. Candidate `8e40ebf` on branch
`art-d1a-studio-identity-visual-proof`. Reviewed by an Engine technical peer review that reopened
**no** accepted visual direction or runtime scope but corrected evidence/governance artifacts.
Related: `docs/art/D1-A-CLOSURE.md`, `docs/art/D1-A-VALIDATION-REPORT.md`,
`docs/art/D1-A-CORE-SLICE-REPORT.md`.

## A. Core-slice-first validation — **MG, BR**

- **Lesson:** Validate a bounded visual **core slice** before broader production adoption.
- **Evidence:** D1-A proved identity, hierarchy, fallback, accessibility, feature isolation, and
  lazy loading on one concept (A) over the real Studio Lot **before** any ordinary-player
  enablement — a small, reversible surface carrying the risky "does the visual system work at all"
  question.
- **Root cause it addresses:** broad visual adoption commits many files and reviewer attention
  before the core visual/interaction/accessibility contract is proven.
- **Resolution / coverage:** merged default OFF with the full contract exercised (984 unit / 21
  identity Playwright / 51 full Playwright / build / console / disposal). Enablement kept as a
  separate decision.
- **Fastest diagnostic:** ask "what is the smallest slice that proves the hard part?" and gate on it.
- **Pattern:** prove identity + hierarchy + fallback + a11y + flag isolation + lazy load on one
  concept behind a flag. **Anti-pattern:** ship a whole visual system before its core is proven.
- **Related:** `D1-A-CORE-SLICE-REPORT.md`; merge `af7c238`.

## B. Management-camera hierarchy — **MG**

- **Lesson:** Judge Studio Lot visuals at the **actual fixed-isometric management camera**, target
  resolutions, and browser zoom — not only through close-up Art review.
- **Symptom:** the first core slice read as small floating labels, too subtle from the D1 baseline;
  it only became visible once judged at the management distance (owner ruled **REVISE**).
- **Root cause:** close-up Art review flatters detail the management camera never shows.
- **Resolution / coverage:** the visual-hierarchy revision made primary landmarks large and
  building-mounted (Gate banner + emblem, Stage A/B facade identifiers, Theater marquee) with tiered
  department labels; verified across 1920×1080 → 1280×720 and 125% zoom in Playwright captures.
- **Fastest diagnostic:** capture matched baseline-vs-candidate pairs at each shipping viewport +
  zoom and compare at the management camera, not zoomed in.
- **Pattern:** review at the real camera/resolutions/zoom. **Anti-pattern:** approving from
  close-ups. **Related:** `D1-A-CORE-SLICE-REPORT.md` (Revision status).

## C. Engine/presentation ownership — **P, BR**

- **Lesson:** Identity, palette, signage, and branding **data** may be presentation-only, while
  occupancy, production, release, title, warning, and navigation **truth** stays behind
  `StudioLotSnapshot`.
- **Evidence:** the `StudioIdentityManifest` type has no field for occupancy/title/money/state;
  `StudioLotSnapshot.ts` is empty-diff vs `main`; `GameState` (`src/core`) is untouched and isolated
  from Phaser; navigation/accessibility are React-owned.
- **Root cause it addresses:** presentation layers tend to accrete authoritative state, coupling the
  renderer to the sim.
- **Resolution / coverage:** unit tests assert GameState is never mutated and identity stays baseline
  with the flag off; snapshot empty-diff verified at merge.
- **Fastest diagnostic:** `git diff main -- <snapshot>` must be empty; grep the presentation type for
  any state-bearing field.
- **Pattern:** presentation reads a snapshot; truth lives behind it. **Anti-pattern:** the renderer
  owning or recomputing sim truth. **Related:** `D1-A-CLOSURE.md` §3.

## D. Default-OFF visual proofs — **BR**

- **Lesson:** Keep experimental/provisional visual packages **default OFF** until a separate owner
  ruling authorizes normal-player exposure. Separate **merge approval**, **production enablement**,
  and **later visual expansion**.
- **Evidence:** `studioLotIdentityProofEnabled()` defaults false; review controls render only with
  the flag on; the merge explicitly does not enable the feature.
- **Root cause it addresses:** conflating "reviewed and merged" with "live to players."
- **Resolution / coverage:** flag + dev-only-controls unit tests; closure records enablement as a
  separate decision.
- **Fastest diagnostic:** confirm the flag default and that no ordinary code path reads it as on.
- **Pattern:** three distinct gates (merge / enable / expand). **Anti-pattern:** a merge that also
  flips the feature live. **Related:** `ui/src/flags.ts`; `D1-A-CLOSURE.md` §5.

## E. Executable evidence over manual counts — **BR**

- **Lesson:** Generate/verify changed-file counts, test totals, commands, and evidence from **Git,
  package scripts, and test output** — never copy them by hand.
- **Symptom (what drift produced):** D1-A docs originally stated **18** files (actual **21**),
  **982** tests (actual **984**), incorrect focused-test counts, a **nonexistent** contract section,
  a non-authoritative build command, and a fixed marquee-bulb count the implementation never
  guarantees.
- **Root cause:** hand-transcribed numbers in owner-facing docs, unbacked by a command.
- **Why safeguards missed it:** tests and build were green; nothing checks prose numbers against
  reality.
- **Resolution / coverage:** corrected Markdown-only at `8e40ebf`; totals re-derived from
  `git diff --name-only … | wc -l`, `vitest` output, and `package.json` scripts.
- **Fastest diagnostic:** regenerate every count from a command before writing it; diff prose numbers
  against tool output.
- **Pattern:** cite the command, paste its output. **Anti-pattern:** typing counts from memory.
  **Related:** `8e40ebf`; `D1-A-VALIDATION-REPORT.md`.

## F. Test-category separation — **BR**

- **Lesson:** Keep these categories **explicitly separate**: unit/component; focused
  unit/component; full Playwright; focused Playwright.
- **Evidence:** D1-A reports 984 unit/component (76 files), 23 focused unit/component, 51 full
  Playwright, and 21 focused (identity) Playwright — each labeled distinctly.
- **Root cause it addresses:** merging categories hides which surface actually passed and invites
  count drift (see Lesson **E**).
- **Fastest diagnostic:** one row per category with its own command and total.
- **Pattern:** name the category + command + total. **Anti-pattern:** one blended "all tests pass"
  number. **Related:** `D1-A-VALIDATION-REPORT.md`.

## G. Contract-citation validation — **BR**

- **Lesson:** Validate owner-facing **section references** against actual headings and current
  document structure.
- **Symptom:** a doc cited a nonexistent "Section 34"; the real reference was section 11 (Explicit
  non-goals).
- **Root cause:** citations written from memory of an older document shape.
- **Resolution / coverage:** corrected in `8e40ebf`.
- **Fastest diagnostic:** open the cited section and confirm the heading text before shipping.
- **Pattern:** resolve every citation against the live doc. **Anti-pattern:** citing a remembered
  section number. **Related:** `8e40ebf`.

## H. Package-script documentation — **BR**

- **Lesson:** Document the **authoritative package script** (e.g. `npm run build`) instead of a
  bare underlying command that may not run from the repository root.
- **Symptom:** docs showed a bare `vite build`; the real, root-runnable command is `npm run build`
  (`vite build --config ui/vite.config.ts`), which matters because the repo path contains a space and
  the config lives under `ui/`.
- **Resolution / coverage:** corrected in `8e40ebf`.
- **Fastest diagnostic:** run the documented command verbatim from the repo root.
- **Pattern:** document `npm run <script>`. **Anti-pattern:** documenting the raw tool invocation.
  **Related:** `package.json`; `8e40ebf`.

## I. Comment drift — **BR**

- **Lesson:** Implementation **comments**, assertions, and owner-facing docs can drift independently
  even while runtime behavior stays correct.
- **Concrete example:** the `draw.test.ts` comment claiming exactly `2 × bulbDensity` bulbs while the
  implementation is responsive/width-scaled (the test asserts an even, non-empty set — runtime
  behavior is right; the comment is stale).
- **Why safeguards missed it:** comments are not executed; the assertion itself was already generic.
- **Resolution / deferred:** **deferred** — recorded as a non-blocking follow-up; not changed during
  the merge (requires separate owner authorization).
- **Fastest diagnostic:** search critical numeric/behavioral claims across source, tests, and docs;
  compare each claim with the actual implementation and assertion.
- **Pattern:** grep numeric claims and reconcile. **Anti-pattern:** trusting a comment as a spec.
  **Related:** `ui/src/lot/identity/draw.test.ts`; see Lesson **L**; `D1-A-CLOSURE.md` (Deferred #3).

## J. Documentation-only correction discipline — **BR**

- **Lesson:** When a correction is proven **Markdown-only**: inspect the exact Git delta, keep the
  correction narrow, verify source remains byte-identical, avoid needlessly rerunning expensive
  suites, and preserve the previously validated evidence at the exact source hash.
- **Evidence:** the `7223fe2..8e40ebf` delta is exactly 5 `docs/art/*.md` files (0 non-Markdown); the
  reviewed evidence stayed pinned at the code hash and was not regenerated.
- **Fastest diagnostic:** `git diff --name-only <a>..<b>` — assert only docs; `git diff <a>..<b>` on
  source paths must be empty.
- **Pattern:** verify docs-only by delta, then trust the pinned evidence. **Anti-pattern:** rerunning
  full suites for a proven prose fix, or letting a "docs" commit smuggle code. **Related:** `8e40ebf`.

## K. Art/Engine peer-review value — **MG, BR**

- **Lesson:** Peer technical review can **correct evidence and governance artifacts without
  reopening** accepted visual direction or runtime scope.
- **Evidence:** the Engine review of the Art candidate produced only the Markdown correction at
  `8e40ebf`; Concept A direction and all runtime code were left intact.
- **Fastest diagnostic:** scope the review to evidence/governance/boundary claims; flag scope creep
  into settled visual decisions.
- **Pattern:** cross-discipline review of evidence + boundaries. **Anti-pattern:** a peer review that
  relitigates an already-approved direction. **Related:** `D1-A-CLOSURE.md` §7.

## L. Responsive procedural presentation — **MG (UI/procedural art)**

- **Lesson:** Do **not** document fixed visual-element counts when the implementation is responsive,
  width-scaled, density-driven, or resolution-dependent.
- **Evidence:** the marquee is density-driven and width-scaled (even, non-empty); the manifest's
  `bulbDensity` is a parameter, not a guaranteed on-screen count. Docs originally implied a fixed
  count and were corrected.
- **Fastest diagnostic:** for any documented count, check whether the code scales it by width/zoom/
  density; if so, describe the rule, not a number.
- **Pattern:** describe the responsive rule. **Anti-pattern:** a literal count for a scaled element.
  **Related:** `ui/src/lot/identity/{manifest,signage}.ts`; see Lesson **I**.

## M. Phaser hidden-tab disposal — **BR (Phaser games)**

- **Lesson:** Normal open-and-close lifecycle testing may **miss deferred destruction** when a Phaser
  loop is asleep (backgrounded/hidden tab).
- **Symptom / risk:** a pre-existing edge case where unmounting the lot while the tab is hidden can
  defer teardown; ordinary mount/unmount disposal is clean (0 orphaned canvases).
- **Status:** **open maintenance lesson**, NOT a D1-A defect and not introduced by D1-A; deferred,
  requires separate owner authorization.
- **Regression/verification coverage to add:** a lifecycle test that (1) opens the Studio Lot;
  (2) backgrounds/pauses the tab; (3) unmounts the lot while hidden; (4) returns to the tab;
  (5) reopens the lot; (6) inspects canvas count, listeners, game instances, and WebGL resources.
- **Fastest diagnostic:** reproduce with the hidden-then-unmount sequence above and count live
  canvases/contexts.
- **Pattern:** test teardown while the render loop is asleep. **Anti-pattern:** trusting only
  open→close disposal. **Related:** `D1-A-CLOSURE.md` (Deferred #2).

## N. Future-game reuse — **BR (future game repositories)**

- **Lesson:** Reusable **Engine/Art boundary, evidence, lifecycle, feature-flag, and review**
  practices must be stored in a **known tracked location** and read when beginning the next game.
- **Resolution / coverage:** this file is that location; `docs/HANDOFF.md` points at it, and the
  read-before/update-before-close instruction is stated at the top.
- **Fastest diagnostic:** when starting new work, open this file first and read the relevant lessons.
- **Pattern:** one canonical, tracked, linked lessons record. **Anti-pattern:** lessons stranded in
  terminal output or scattered per-discipline files. **Related:** `docs/HANDOFF.md`;
  `docs/art/D1-A-CLOSURE.md`.

---

# D-15 — Studio Run Recap (Phase 1) — **DRAFT (pending owner acceptance)**

> These entries are drafted on `phase-5.3-studio-run-recap-v1`. They are NOT closure language;
> finalize on owner acceptance of the Phase-1 gameplay/explainability review. Related:
> `docs/D-15-studio-run-recap-phase1.md`, `src/core/studioRunRecap.ts`.

## O. Run-level explainability from authoritative records — **MG, BR**

- **Symptom:** the Week 86 controlled run lost ~$13.8M in film contribution across 5 heavy-loss
  films, yet the UI showed only per-screen finance metrics — no run-level recap, loss trend,
  concentration signal, or approaching-lockout warning; the player could not see *why* the studio
  declined.
- **Root cause:** individual finance cards answer "this week / this film" but never synthesize the
  whole run; there was no read-model that composed cash, ledger, films, talent, and contracts into
  one explanation.
- **Why safeguards missed it:** every finance number was individually correct and tested; nothing
  tested whether the *player could understand the run*. Correctness ≠ explainability.
- **Resolution:** one pure `studioRunRecap(state)` read-model (capital story, film slate, talent
  development, concentration, current position + recovery classification, inflection points,
  warnings) reconstructed entirely from `SaveFileV5.state` — no new persistence.
- **Coverage:** 16 core tests + 6 component tests + 3 Playwright journeys; a Week-86 real-save
  cross-check (22/22) reproduced every owner figure exactly.
- **Fastest diagnostic:** load the real save through a read-only harness, run the read-model, diff
  its outputs against the owner's stated facts.
- **Pattern:** a single pure run-recap selector fed by frozen records. **Anti-pattern:** scattering
  run-level insight across per-screen widgets. **Reuse:** MG, BR.

## P. Distinguish "cash positive" from "able to finance the next normal film" — **MG, BR**

- **Symptom:** the fixed-cost Runway read reassuring while a normal-budget film was already
  unaffordable; the player conflated a positive balance with production capacity.
- **Root cause:** cash balance and production affordability are different questions; only the former
  was surfaced prominently.
- **Resolution:** the recap computes a **cheapest legal** and **typical recent** commitment and runs
  each through the existing `commitmentPreview`/`canAfford` gate, then states plainly which is
  affordable and the exact shortfall. Recovery is classified from explicit conditions
  (healthy / constrained / severe / normal-production-unavailable / incomplete) and never promises
  success.
- **Financial-metric distinction (owner-critical):** film contribution (Studio Revenue − committed
  cost) is separated from payroll and overhead so the recap does NOT imply payroll caused a collapse
  that film losses drove.
- **Coverage:** tests assert the cash-positive-but-normal-unaffordable path and the recovery
  classes; the Week-86 check confirmed cheapest affordable / typical short by ~$1.59M.
- **Fastest diagnostic:** set cash between the cheapest and typical commitment; assert the
  distinction + the warning fire.
- **Pattern:** answer "can I act?" with the affordability gate, not the balance. **Anti-pattern:**
  a runway/balance number standing in for production capacity. **Reuse:** MG, BR.

## Q. Reconstruct from the signed ledger; do not add persistence — **BR**

- **Lesson:** the D-11/D-12 signed ledger (per-kind, per-`productionId`) plus `theatricalRuns`,
  `careerEvents`, and `contracts` already hold everything a run recap needs. Starting cash falls out
  of the reconciliation invariant (`cash − Σledger = INITIAL_CASH`); per-film commitment is a ledger
  group; per-film contribution reconciles to the total by construction.
- **Resolution:** proved sufficiency with a field-by-field source matrix before writing code — no new
  core field, no save-version bump.
- **Fastest diagnostic:** before adding a field, write the source matrix and try to derive the value
  from existing records; add persistence only when a value is provably unreconstructable.
- **Pattern:** derive-don't-store for read-models. **Anti-pattern:** persisting a recap snapshot to
  avoid ordinary selector cost (measured at ~0.07 ms/derivation — persistence would be pure debt).
  **Reuse:** BR.

## R. Keep finance rules in the pure core, not the UI — **P, BR**

- **Lesson:** the recap's money math lives in `src/core/studioRunRecap.ts` (pure, node-tested) and
  reuses `economyView`; the React screen only formats. This preserves the Engine/presentation
  boundary (the sim never reads the recap) and mirrors the D-14 rule that the UI never computes
  progression.
- **Anti-pattern avoided:** a UI-owned recap that duplicates the contribution/runway/affordability
  formulas and drifts from the engine.
- **Fastest diagnostic:** grep the screen for any arithmetic beyond formatting; business rules should
  resolve to a single core selector. **Reuse:** P (Studio boundary), BR (pattern).

## S. Break-even is a distinct player category — **MG, BR** (from the bounded revision)

- **Symptom:** a film with +$8,334 contribution on a $10.92M commitment (≈0.076%, ROI rounds to 0%) was
  labelled **Profit**, which reads as a success during ordinary play.
- **Root cause:** a strict `>0 / <0` split treats any technically-positive value as profit; economic
  negligibility was not modelled.
- **Why safeguards missed it:** the number was correct; nothing checked whether the *label* was
  meaningful.
- **Correction:** Break-even band `|contribution| ≤ max($25k, 1% × committed cost)` (documented,
  exported as `classifyContribution`); Week 86 → 3 profit / 1 break-even / 5 loss. Contribution/ROI
  values unchanged.
- **Coverage:** core tests on `classifyContribution` (near-zero, sub-floor, meaningful ±) + the Week 86
  3/1/5 acceptance.
- **Fastest diagnostic:** sort the slate by |contribution/commitment| and eyeball the near-zero tail.
- **Pattern:** classify economic outcomes by materiality, not sign. **Anti-pattern:** framing rounded-0%
  as success. Extends **P**. **Reuse:** MG, BR.

## T. Timeline semantics must be explicit — **BR** (from the bounded revision)

- **Symptom:** starting cash showed $20M, but the weekly table's "Week 0" row showed ~$9.04M and "Key
  Moments" claimed cash peaked at Week 0 — three different meanings collided on one label.
- **Root cause:** the opening balance (pre-commitment) and the end-of-week-0 close (post-ledger) were
  both rendered as "Week 0".
- **Correction:** an explicit **Opening balance** point (= `INITIAL_CASH`), end-of-week rows labelled
  **"End of Week N"**, and a `peakCash` inflection emitted only when a close exceeds the opening balance.
- **Coverage:** core tests (opening balance distinct from week-0 close; opening is the peak) + Week 86
  (no false Week-0 peak; Week 54 unaffordability).
- **Fastest diagnostic:** confirm every cash point answers "as of exactly when?" before labelling it.
- **Pattern:** name the observation instant (pre-commitment / post-ledger / end-of-week). **Anti-pattern:**
  an ambiguous shared "Week 0". **Reuse:** BR.

## U. Recaps must synthesize, not dump — **MG, BR** (from the bounded revision)

- **Symptom:** the default view exposed an 86-row weekly cash table — authoritative but spreadsheet-like,
  producing no management insight.
- **Root cause:** raw completeness was treated as the deliverable.
- **Correction:** default to a compact **SVG cash chart** (opening / current / low + accessible text
  equivalent) and a short **Key Moments** list; the full table is collapsed behind "View weekly cash
  data".
- **Coverage:** component + e2e assert the chart renders with an `aria-label`, and the 86-row table's
  `<details>` is closed by default.
- **Fastest diagnostic:** count default-visible rows; if a management screen shows dozens, collapse them.
- **Pattern:** trend + inflections by default, raw detail on demand. **Anti-pattern:** a default data dump.
  Extends **O**. **Reuse:** MG, BR.

## V. A legal action is not a reasonable recovery path — **MG, BR** (from the bounded revision)

- **Symptom:** copy said "a reasonable path exists but is constrained" while cash drained ~$39K/wk with
  no active revenue and contracts (122wk) outlasting the runway (72wk) — too optimistic and partly
  contradictory.
- **Root cause:** "a cheapest legal film is affordable" was conflated with "recovery is credible".
- **Correction:** distinguish **available action** vs **credible recovery**; state that waiting alone
  worsens the position and that contracts cannot be waited out when expiry > runway. New flags
  `waitingAloneWorsens`, `contractsOutliveRunway`; recovery copy narrowed; never promises success.
- **Coverage:** Week 86 asserts `contractsOutliveRunway`, `waitingAloneWorsens`, `recovery=severe`, and
  the reason strings.
- **Fastest diagnostic:** check whether "recovery" language survives the facts (no revenue, burn > 0,
  contracts > runway).
- **Pattern:** separate legality, credibility, and time-horizon. **Anti-pattern:** implying an affordable
  option is a safe plan. Extends **P**. **Reuse:** MG, BR.

## W. Warning hierarchy — **BR** (from the bounded revision)

- **Symptom:** eight identically-styled warning cards read like a log and buried the one decision that
  mattered.
- **Root cause:** no severity/priority; equal visual weight for every observation.
- **Correction:** `RecapWarning { severity: important|caution|observation, priority }`; the screen shows
  the **top 3** and collapses the rest under "More strategic observations"; severity shown as text (not
  colour-only).
- **Coverage:** core (sorted by priority; top = cash-positive/normal-unaffordable) + component/e2e (≤3
  primary; secondary collapsed).
- **Fastest diagnostic:** if everything is a warning, nothing is — cap the primary set.
- **Pattern:** rank + collapse. **Anti-pattern:** a flat wall of equal alerts. **Reuse:** BR.

## X. Format at the read-model/UI boundary — **BR** (from the bounded revision)

- **Symptom:** raw integers (`4422115`, `-4981667`, `39174`) appeared in Key Moments, warning evidence,
  and cash labels.
- **Root cause:** the read-model embedded pre-rounded numbers in prose strings, so the UI could not
  format them.
- **Correction:** the read-model returns **structured numbers** (and inflection *kinds* / warning
  *codes*); the React screen composes every sentence and formats every value with the shared
  `money()`/`signed()` helpers. Internal precision stays raw.
- **Coverage:** component test asserts the rendered text contains **no** 7+ digit raw run.
- **Fastest diagnostic:** grep rendered output for `\d{7,}`; any hit is an unformatted amount.
- **Pattern:** data in the model, formatting in the view. **Anti-pattern:** prose-with-baked-in-numbers
  in a read-model. Extends **R**. **Reuse:** BR.

### Final visual-polish lessons (owner review 3) — still DRAFT

## Y. SVG annotations require boundary testing — **BR**

- **Symptom:** a correct "Opening $20.00M" chart label was clipped at the right canvas edge in the
  owner screenshot.
- **Root cause:** the annotation position accounted for the data point but **not the rendered text
  width** (left-anchored text near the right boundary spilled outside the viewBox).
- **Escaped safeguard:** unit tests checked data, not rendered geometry; the value was right, the pixels
  were not.
- **Correction:** reserve right-side padding and **right-align** edge annotations (`text-anchor="end"`
  ending inside the viewBox); position-aware anchor for the low label. No viewport-specific offsets.
- **Regression coverage:** component test (every `<text>` x within `[0, CHART_W]`; opening/current
  end-anchored); e2e bounding-box check that each label sits within the SVG at 1440×900 / 1366×768 /
  1280×720 / 125% zoom.
- **Fastest diagnostic:** capture the chart at every target viewport/zoom and inspect annotations at
  **both** edges; assert label bounding boxes ⊆ the SVG box.
- **Anti-pattern:** positioning text by its data anchor while ignoring string width; per-viewport hard-
  coded nudges. **Reuse:** BR. **Related:** `b91b026`→ polish commit, `out/d15-recap-evidence/`.

## Z. Observation count is not elapsed-time count — **BR**

- **Symptom:** the UI called 86 recorded closing balances "85 weeks", contradicting "Week 86" and the
  86-row detail table.
- **Root cause:** elapsed intervals (85) and recorded observations (86) are both valid but were not
  distinguished in player-facing language.
- **Escaped safeguard:** no test asserted a single consistent temporal convention across chart/caption/
  table/heading.
- **Correction:** name the convention explicitly — **Opening balance** (pre-commitment), **End of Week N**
  (post-ledger close), current **Week 86**; heading "Cash history through Week 86"; caption "86 recorded
  weekly closing balances, end of Week 0 → end of Week 85"; axis "End Wk 0/85"; control "View 86 weekly
  closing balances".
- **Regression coverage:** component (caption wording; no "over N weeks"); Week 86 harness (86 closes;
  Week 0→85; current Week 86).
- **Fastest diagnostic:** for every time count on screen, state whether it's an opening state, an
  end-of-period observation, or the current period — and check they agree.
- **Anti-pattern:** mixing interval counts and observation counts in one view. **Reuse:** BR.

## AA. Player UI must not expose repository paths — **BR**

- **Symptom:** the runtime methodology disclosure printed `docs/D-15-studio-run-recap-phase1.md`.
- **Root cause:** a developer cross-reference leaked into player-facing copy.
- **Escaped safeguard:** no audit for filenames/paths/dev references in owner/player screens.
- **Correction:** removed the path from the UI (the doc + formulas are unchanged); methodology explains
  the figures in plain language only.
- **Regression coverage:** component test asserts the rendered text contains no `docs/`, no `.md`, no
  source filename.
- **Fastest diagnostic:** grep rendered player UI for path/filename/commit/dev-command patterns before
  acceptance.
- **Anti-pattern:** citing repo paths or source files in gameplay UI. **Reuse:** BR.

## AB. Compact status labels require responsive testing — **BR**

- **Symptom:** the **BREAK-EVEN** result pill wrapped at the hyphen in a narrow table cell despite ample
  page width.
- **Root cause:** a hyphenated status label is breakable; the cell was narrow enough to wrap it.
- **Escaped safeguard:** labels weren't tested as indivisible units at target widths/zoom.
- **Correction:** `white-space: nowrap` on every result pill; the film table scrolls inside an
  `overflow-x:auto` container so the page never overflows.
- **Regression coverage:** component (every result pill `white-space: nowrap`); e2e (no horizontal page
  overflow at each viewport + 125% zoom).
- **Fastest diagnostic:** render semantic status labels at the smallest target width and 125% zoom and
  confirm each stays on one line without page overflow.
- **Anti-pattern:** letting a status token wrap at a hyphen; fixing wrap by widening every column.
  **Reuse:** BR.

### Authoritative-actionability lessons (owner review 4) — still DRAFT

## AC. Actionability claims must use authoritative action rules — **BR**

- **Symptom:** the owner reported the recap said a film was affordable while they could not make one
  in gameplay.
- **Investigation (authoritative reproduction on the real Week 86 save):** the recap's cheapest value
  ($2,015,391) is in fact **greenlightable** — the real `greenlight()` action **completes** it
  (cash $2,833,923 → $818,532, a production is created). So the recap and the action **already agreed**.
  The true gap was a *definition* one: the recap headlined a **bare-minimum** package (cheapest concept,
  lowest budget, minimum marketing) as "affordable," while a **normally-funded** film ($3,544,173) is
  **not** affordable (short $710,250) — which is what the player experiences.
- **Root cause:** an actionability claim ("you can make a film") was framed around a theoretical corner
  (min-everything), not around a realistic action; and the value was computed by a **parallel formula**
  that *could* have diverged from the action even though it happened not to.
- **Escaped safeguard:** numeric reconciliation validated the estimate internally but nothing compared
  it against the **enabled/blocked** state and cost of the real greenlight action.
- **Correction:** (1) compute the cheapest package by the **same rule** the action charges
  (`totalCommittedCost` components; grouped bit-identically to `requiredNegative`), so the recap's
  all-in equals the action's to the cent; (2) add an **action-parity invariant** —
  `recap affordability == greenlight() affordability` and `recap all-in == the real cash deduction` —
  tested at exact-boundary, $1-short, and marketing-shortfall states; (3) distinguish three questions:
  **bare-minimum greenlightable package** (affordable), a **standard-budget film** (unaffordable), and a
  **recent-typical film** (unaffordable), with an all-in breakdown; (4) honest labels + recovery/warnings
  that headline "no *normally-funded* film is affordable" — never the false "no package is affordable."
- **Regression coverage:** `recap-parity.test.ts` (cost + affordability + completion parity); core
  bare-minimum-vs-standard tests; Week-86 harness (bare-minimum greenlightable, standard short $710k).
- **Fastest diagnostic:** load the same save, build the recap's claimed package, run the real action on a
  **clone**, and compare the enabled state, the reason, and the exact deduction.
- **Anti-pattern:** a plausible estimate labeled as actionable truth; a summary that claims "you can do X"
  using different rules than the action that performs X. **Reuse:** BR.
- **Related:** reproduction `out/d15-recap-week86/reproduce.mts`; `src/core/studioRunRecap.ts`
  (`cheapestPackage`/`standardPackage`); `ui/src/engine/recap-parity.test.ts`.

## Q (amended). Reconstruct authoritative behavior — not a competing approximation

Reconstruction from authoritative records (Lesson **Q**) is appropriate **only when it reconstructs the
authoritative behavior**. When a reconstructed value drives an **actionability** claim, it must use the
exact same rules as the action (see **AC**) and be **parity-tested** — a self-consistent approximation
that merely *looks* right is not sufficient.
