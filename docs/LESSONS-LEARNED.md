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

# D-15 — Studio Run Recap and Capital Position Explainability — FINALIZED (merged, closed)

> Owner-accepted and merged (merge `152acec`, tag `d15-studio-run-recap`). Related:
> `docs/D-15-studio-run-recap-closure.md`, `docs/D-15-studio-run-recap-phase1.md`,
> `src/core/studioRunRecap.ts`, `ui/src/engine/recap-parity.test.ts`.

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

### Final visual-polish lessons (owner review 3)

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

### Authoritative-actionability lessons (owner review 4)

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

## AD. Base need, minimum package, and normal budget are different values — **MG, BR**

- **Task/defect:** owner-facing reconciliation of several valid-but-differently-scoped production costs.
- **Symptom:** the player saw a concept card showing a **$3.14M base production need** while the recap
  said a ~**$2.02M** package was affordable — creating the impression the recap was wrong.
- **Root cause:** the UI exposed several valid but differently-scoped financial values without making
  their relationship obvious: concept **base production need**; **minimum configured** production
  commitment (0.75× of demand); **minimum marketing**; the **final all-in** greenlight package;
  the **standard-budget** package; the **recent-typical** package.
- **Why earlier safeguards missed it:** action parity verified the final all-in package, but the
  owner-facing relationship between the concept-card number and the recap number had not been tested
  through an actual **human gameplay path**.
- **Resolution:** the authoritative greenlight action *and* the owner's own gameplay confirmed the
  bare-minimum package was affordable (greenlight succeeded, cash $2.83M → $818K). The recap distinguishes
  **bare-minimum**, **standard-budget**, and **recent-typical** affordability, with a component breakdown
  (production + minimum marketing + fees) in Current Position.
- **Regression/verification coverage:** action-parity tests (`recap-parity.test.ts`); the real Week 86
  SaveFile harness (`out/d15-recap-week86/check.mts`, 38/38); the reproduction
  (`out/d15-recap-week86/reproduce.mts`); the actual owner greenlight confirmation; the Current-Position
  component breakdown.
- **Fastest future diagnostic:** (1) load the same save; (2) note the concept-card base need; (3)
  configure the minimum valid package; (4) inspect production/marketing/fee components; (5) compare the
  action preview with the recap; (6) execute the action on a **cloned** state or an owner-approved run.
- **Reusable pattern:** every displayed cost must state its **scope and lifecycle stage**.
- **Anti-pattern:** displaying multiple valid costs as though they answer the same question.
- **Reuse classification:** reusable for future management games; broadly reusable across simulations and
  transactional applications.
- **Related:** `docs/D-15-studio-run-recap-closure.md`; `d90c45d`; `ui/src/engine/recap-parity.test.ts`;
  `out/d15-recap-week86-evidence/`.

---

# D1-A — Concept A Ordinary-Player Enablement — FINALIZED (merged, closed)

> Owner-accepted and merged (merge `cf9758f`, tag `d1a-concept-a-player-enablement`), from
> `main` at `966ae6e`, candidate `0c6ff3d` on branch `art-d1a-concept-a-player-enablement`.
> Concept A — Golden Age Deco became the **default player-facing identity**; the development-review
> tooling stayed **default OFF**; approved visuals and every Engine contract were unchanged.
> Related: `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md`,
> `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md`, `docs/art/D1-A-CLOSURE.md` (the earlier,
> preserved default-OFF proof closure).

## AE. Separate content-enablement from review-tooling in a visual proof — **BR, MG, P**

- **Task/defect:** Concept A — Golden Age Deco was visually approved for ordinary players, but the
  approved presentation could not be shown to a player without also enabling the development review
  interface (mode selector, performance panel, Hide/restore pill).
- **Problem:** the approved visual concept was **coupled to its development-review flag**.
- **Root cause:** proof rendering and review chrome shared **one boolean branch point** — a single
  `studioLotIdentityProofEnabled()` in `StudioLotScreen.tsx` gated *both* whether the scene rendered
  Concept A (`setIdentityMode`) *and* whether the review controls rendered.
- **Why earlier safeguards missed it:** the D1-A default-OFF core-slice review deliberately deferred
  ordinary-player enablement, so nobody had exercised a *player* path — every capture used the review
  harness. The one flag correctly protected `main`; it just wore two hats.
- **Successful correction:** split into two independent capabilities — a player-facing identity
  **content** gate (`studioLotIdentityEnabled()`, default ON, no chrome, env/LS rollback to baseline)
  distinct from the development-review **tooling** gate (`studioLotIdentityProofEnabled()`, default
  OFF). One `effectiveIdentity` derivation drives the scene for both; the chrome render gates stay on
  the dev flag. No `StudioLotSnapshot`/`GameState`/renderer/navigation/visual change.
- **Proof OFF must restore ordinary play, not a remembered review state:** `effectiveIdentity` is
  **derived per render from the two flags**, never stored, so a reviewer's temporary `baseline` /
  `fallback` / `reduced` selection cannot survive turning the dev flag off. Turning review tooling off
  returns the player to Concept A; nothing about the review session persists to `GameState`,
  `StudioLotSnapshot`, or `SaveFile`. A review mode kept in persisted state would have reintroduced the
  same coupling by another route.
- **Why the original proof was still valuable:** the default-OFF core-slice review protected `main`
  while the visual direction was evaluated and revised (labels → building-mounted landmarks) before any
  player exposure — the enablement was a small, reversible wiring change on a proven concept.
- **What failed:** treating the proof flag as **both** the content gate and the review-interface gate.
- **Evidence:** the ordinary-player review proved Concept A visually ready but identified the structural
  chrome leak; the enablement branch's `player-enablement.spec.ts` captures now show Concept A with zero
  review chrome (and a hidden-overlay proof that still leaked an `Identity review ▸` restore pill is
  what a genuine player-clean view must NOT contain).
- **Regression/verification coverage:** `ui/src/flags.test.ts` (player default ON, rollback, key
  separation); `StudioLotIdentityReview.test.tsx` (player Concept A + no chrome, rollback → baseline,
  dev-flag toggle-back leaves no stale mode); `ui/e2e/player-enablement.spec.ts` (14 player-clean
  captures + dev-review-on/off). Full: 1030 unit / 65 Playwright / build / clean console / disposal.
- **Fastest future diagnostic:** for any "show the approved art to players" ask, grep for the flag that
  gates the *content* and confirm it is NOT the same boolean that gates the *review UI*.
- **Management-camera result:** the primary hierarchy (Gate, Stage A/B, Theater) remained legible from
  1920×1080 through 1280×720 and at 125% zoom in ordinary play — the accepted hierarchy held.
- **Most decision-useful evidence:** clean **matched baseline-vs-Concept-A** captures per viewport, and
  the **1280×720 Theater-release** case (smallest-viewport marquee legibility limit).
- **Pattern (reusable rule — BR, MG):** any visual proof intended for later production adoption must
  have **separate content-enablement and review-tooling controls from the start**; keep a default-OFF
  proof gate during experimentation, but design the approved presentation so it can graduate into
  ordinary play **without carrying development chrome**. A hidden review bar that still leaves a restore
  pill is **not** a genuine player-clean view.
- **Anti-pattern:** welding player-facing content to debug selectors, performance panels, fixture
  controls, or review overlays (one flag driving both content and chrome).
- **Reuse classification:** **P** (Project: Studio implementation history above) · **BR / MG** (the
  reusable cross-project Art/UI pipeline rule: split content-enablement from review-tooling from day
  one). These are recorded together but are distinct — the P history is the specific fix; the BR/MG
  rule is what future games/projects should carry forward.
- **Related:** closure `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md`; implementation record
  `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md`; `docs/art/D1-A-CLOSURE.md` (original default-OFF
  closure, **preserved unmodified**); implementation commit `33e1568`; documentation-count correction
  `0c6ff3d`; merge `cf9758f`; tag `d1a-concept-a-player-enablement`; branch
  `art-d1a-concept-a-player-enablement`; `ui/src/flags.ts`; `ui/src/lot/StudioLotScreen.tsx`; tests
  `ui/src/flags.test.ts`, `ui/src/lot/StudioLotIdentityReview.test.tsx`,
  `ui/src/lot/StudioLotScreen.test.tsx`, `ui/e2e/player-enablement.spec.ts`; Lessons **A**, **B**,
  **D** (this extends D's gate-separation from three *decisions* to two *flags*) and **AF** (the
  scope-count correction found during this milestone's review).

## AF. Durable scope counts must match Git, not a subset — **BR, MG, P**

Extends Lesson **E** (generate counts from tooling) with the failure mode E did not cover: the count
*was* generated from real files, but from the **wrong set**. E says "don't type numbers from memory";
AF says "even a correct subset count is wrong if the prose calls it the total."

- **Task/defect:** the durable Concept A enablement record stated that "only the 6 files above
  changed," while `git diff --name-only 966ae6e...0c6ff3d` reported **nine**.
- **Observable symptom:** a merge-review scope claim that disagreed with Git — a reader reconciling
  the document against the repository would find three unaccounted files.
- **Root cause:** the document counted the **code/test/spec subset** (the files a technical reviewer
  cares about) but described it as the **entire commit**. The branch also changed three documentation
  files, which the prose silently excluded from its own total.
- **Why safeguards missed it:** the technical scope list itself was accurate and complete for its
  purpose, and tests/build were green. Nothing distinguishes a *correct subset* from a *claimed
  total*, and no check compares prose counts to `git diff`. Lesson **E** had already been applied —
  the number came from files, not memory — so the existing safeguard read as satisfied.
- **Recurrence:** this is the **second** changed-file count drift on D1-A work. The first was the
  **18-versus-21** discrepancy corrected at `8e40ebf` (Lesson **E**). Different mechanism, same
  owner-facing consequence: a durable scope claim that Git contradicts. Two occurrences make this a
  pattern, not an incident.
- **Resolution:** state both explicitly and label the subset as a subset — **six code/test/spec
  files**, **three documentation files**, **nine files total**. Corrected documentation-only in
  `0c6ff3d`; the six-file technical list was preserved and re-headed as the code subset.
- **Regression / verification coverage:** at every closure, (1) compare each durable scope claim
  against `git diff --name-only <base>...<candidate>`; (2) compare the staged file list against the
  committed file list before committing; (3) count technical and documentation files separately;
  (4) include the exact full total in closure verification, not only the technically interesting
  files. Applied here: the merge, closure, and HANDOFF all state nine.
- **Fastest future diagnostic:**

  ```sh
  git diff --name-only <base>..<candidate>     # full total
  git show --name-only --format= <commit>      # per-commit total
  ```

  Then read every changed-file sentence in the durable docs and check each against that output.
- **Reusable pattern:** when documenting a subset, **label it as a subset** and state the full Git
  total separately — "six code/test/spec files and three documentation files; nine total." One
  sentence carries both the reviewer's view and the repository's view, and they cannot drift apart
  unnoticed.
- **Anti-pattern:** using the technically relevant file count as though it were the whole commit —
  and, more generally, quoting any count whose *scope* is left implicit.
- **Reuse classification:** **BR** — broadly reusable across repositories, release reviews, audit and
  compliance documentation, and any record where a stated scope is later checked against a tool ·
  **MG** — future management games · **P** — the Project: Studio history above.
- **Related:** Lesson **E** (18→21 drift, `8e40ebf`) and Lesson **J** (documentation-only correction
  discipline); correction commit `0c6ff3d`; `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT.md` §6 and §7;
  `docs/art/D1-A-ORDINARY-PLAYER-ENABLEMENT-CLOSURE.md` §9; `docs/art/D1-A-CLOSURE.md` §7 (the
  earlier count correction).

---

# Asset Lab character track — 05H / 05I — CLOSED (builds rejected; human-artist handoff active)

Context: the Asset Lab character work lives in a **separate repository**
(`/Users/bruce/Project Studio - Asset Lab`, remote `backup`) and has **never** entered production `main`.
Owner ruling: the **05H provenance and the authored-base workflow are accepted** as technical and pipeline
research (accepted provenance and accepted technical workflow are **not** visual approval); the **05H visual
character build is rejected** as a production character; **05I** was the **one authorized bounded corrective
milestone**, containing **two owner-reviewed iterations** (Iteration 1 and Iteration 2) — the limit set by the
05I brief — and is **rejected as a production character foundation**. The unresolved major work is the
**human-scale face and cranial form**, **body mass and proportions**, **hand / wrist / forearm topology**, **the
skin-weighting chain that drives their deformation**, and the **concrete close-range defects already enumerated
in the handoff** (residual boot toe seam, close-range neck fold, close-range facial lumpiness, vest V-opening).
The failure is **localized**: the rig as a whole and the animation system as a whole are **not written off** —
though the **hand-chain weighting is itself a blocking defect**, and rig compatibility and manual weight
painting remain live gates. **No further autonomous or procedural character iteration is authorized**, and
autonomous procedural correction has stopped; a qualified human **character artist** and a **rigging /
weight-paint specialist** are required; **character production and Studio Lot integration remain
unauthorized**; **D1-B remains unstarted and separately governed**. *(**SUPERSEDED CURRENT-STATUS NOTE** —
at the time of this entry D1-B was unstarted. Current status is governed by the D1-B status banner in
[`docs/HANDOFF.md`](HANDOFF.md) and by Lesson **AT**: D1-B has since started **only** through the bounded
Soundstage Composer Proof, and broader D1-B remains unauthorized. Nothing else in this entry changes —
D1-B still does **not** include characters.)*

Current governing authority — the handoff packet, **merged and published** on its Asset Lab branch
(fast-forward; remote `backup`, local/remote parity) and **not** merged into production `main`:
`asset-lab-character-human-artist-handoff` @ `66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8`
(packet **CHH-2026-08-07-R2**, revision date **2026-08-07**, packet-content SHA-256
`dbe7c8c31d80ae1218c8a01fe6326a37eb20511274d2e42eb32bd70d2fd9869e`). **R2 is complete, independently
reviewed, and merged by fast-forward into that governing branch** — not pending, deferred or unmerged. The
packet's in-document *"Supersedes Git tip"* field correctly records `7603b2f`; that is a **historical**
field and **not** the current governing branch tip.
Historical checkpoints, all at local/remote parity in one linear chain:
`asset-lab-05h-authored-base-character-proof` @ `9e3c5d7bda39f069b7dac04624584c4fea645332` →
`asset-lab-05h-final-owner-review-package` @ `ddfd69fbc22be313f9dbb548c2b16032c9802daa` →
`asset-lab-05i-corrective-character-pass` @ `8903b1e8bbbc166aa1b74a33167aea964502a1f6` →
`c9445ce55b5d83cc29def9928aec75fa4edd50ed` — the **pre-ruling checkpoint** on that branch, superseded on
current commissioning and production status → `e5a4931` — the **fifth** commit of the reconciliation chain, a
historical intermediate state → `9c0466d` — the **sixth** commit of that chain and a former branch tip, now
**historical and superseded** → `7603b2f` — the **R1 tip** (packet **CHH-2026-08-06-R1**, revision date
**2026-08-06**, digest `013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`), now
**historical and superseded** as the governing tip → **`asset-lab-character-human-artist-handoff` @
`66b44b2`** (current branch tip; the R2 source branch `docs/character-handoff-packet-r2` points at the same
commit). Related (Asset Lab repo): `docs/ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`,
`docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`, `docs/ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`,
`docs/ASSET-LAB-05I-FINAL-REPORT.md` (**preserved; its readiness language is superseded**),
`docs/handoff/*` **@ `66b44b2`** (the packet lives on the handoff branch — it is **not** present in the 05I
checkout), `tools/validate-handoff-packet.mjs` (**the committed R2 packet validator — Asset Lab only; it is
not present on production `main`**), `licenses/asset-lab-05h/PROVENANCE.json`.

## AG. A proof branch preserves history, not a runnable review environment — **P, BR**

- **Task/defect:** an authorized 05H owner visual + real-GPU review was **closed without review setup**.
- **Symptom:** the proof branch tip was exactly the expected candidate and the tree was clean, yet the
  proof could not be inspected — **no worktree was checked out to it**, and the repository's single
  worktree held a later milestone (05I) that the review was forbidden to displace.
- **Root cause:** milestone closure recorded the *commit*, never the *environment*. A SHA proves what the
  artifact was; it does not make the artifact runnable.
- **Why safeguards missed it:** branch-tip, parity, cleanliness and ancestry checks all passed. Nothing
  asserts that an inspectable checkout exists.
- **Resolution / coverage:** at every visual-proof closure, record **the exact review worktree path** or a
  **reproducible worktree-creation command**, and state whether creating one is pre-authorized.
- **Fastest diagnostic:** `git worktree list --porcelain` **before** promising a review; confirm a worktree
  is attached to the branch under review.
- **Pattern:** close a visual proof with branch + SHA **+ how to stand it up**. **Anti-pattern:** treating a
  preserved branch tip as a preserved review environment. **Reuse:** P, BR.

## AH. A later "owner-review package" must be diff-verified — it may carry runtime code — **P, BR**

Extends Lesson **J** (documentation-only correction discipline) to the case J did not cover: a follow-on
labelled as a review package that is **not** documentation-only.

- **Symptom:** the commits after the 05H technical candidate were expected to be documentation. `ed97e78`
  is code — it adds the **fixed-isometric management camera and review tooling**
  (`src/App.tsx`, `src/camera/CameraController.tsx`, `src/components/reviewHarness.tsx`,
  `src/lab/LabContext.tsx`, `src/lab/cameraBridge.ts`, `src/ui/DevPanel.tsx`, plus capture/perf/validate
  tools and a sprite asset). `0acb471` is evidence; only `ddfd69f` is docs-only.
- **Consequence:** the named "technical-completion candidate" **cannot produce** the management-camera review
  state the review itself requires — two defensible review bases exist where the record names one.
- **Fastest diagnostic:** `git show --name-status --format= <commit>` on every commit between the named
  candidate and the package tip; assert docs-only before accepting the label.
- **Pattern:** verify the docs-only claim by delta, per commit. **Anti-pattern:** trusting "review package"
  to mean prose. **Related:** Lesson **J**. **Reuse:** P, BR.

## AI. The management camera concealed defects that were blocker-grade at human scale — **P, MG**

The counterpart to Lesson **B**. B says judge Studio Lot visuals **at** the management camera; AI says the
management camera must not be the **only** distance a character is judged at.

- **Symptom:** at default management framing 05H and 05G were **imperceptibly different** — 05G's brighter
  hats actually read *better* — while human-scale inspection found blocker-grade failures: a ~510-vertex
  hi-vis vest rendering as torn scraps, boots whose geometry did not cover the foot (the worker rendered
  barefoot), a skin-tight shirt reading as a nude torso, and a 112-vertex open-scalp hard hat.
- **Root cause:** the framing that made the crew "read" is exactly the framing that hides close-range defects.
- **Fastest diagnostic:** for any character asset, capture **both** management distance and human-scale
  close-ups before any verdict; if the two disagree, the close range governs the asset verdict.
- **Pattern:** distance-paired character evidence. **Anti-pattern:** letting a flattering camera stand in for
  a human-scale ruling. **Related:** Lesson **B**, **AL**. **Reuse:** P, MG.

## AJ. Repeated autonomous procedural correction was not an efficient path — **P, MG**

- **Evidence:** 05I ran two authorized corrective iterations. It **did** land garments, hard hat, boots,
  proportional slimming, LODs, materials and a console-error-free runtime — but every procedural push at the
  **face** either left it heavy and lumpy or, pushed harder, produced a melting-fold result *worse* than 05H
  (recorded and reverted), and the **hands/wrists/forearms** collapsed into "wax-drip" tendrils across all six
  clips because deterministic inverse-distance skinning cannot hold finger and wrist volume under animation —
  independent of the muscularity settings, and aggravated by decimation.
- **Root cause:** face appeal, anatomy, garment fit, hand topology and deformation are **judgment** problems,
  not parameter-search problems. Iterating a generator cannot converge on them.
- **Fastest diagnostic:** if two bounded corrective passes leave the same defect class, the defect is a
  specialist problem, not a tuning problem.
- **Pattern:** cap procedural correction at a stated iteration budget and reclassify on failure.
  **Anti-pattern:** a third autonomous pass at a defect the first two could not move. **Reuse:** P, MG.

## AK. The human-artist handoff supersedes further autonomous iteration — **P**

- **Resolution:** `asset-lab-character-human-artist-handoff` @ `66b44b2` is the character-track artifact — 8
  packet documents (plus, as of R2, the committed packet validator and its two npm scripts, which live on the
  Asset Lab branch and **not** on production `main`): artist brief, technical contract (65-joint skeleton, bone names,
  orientation, scale, ground, the six accepted clips — supplied by a **locally provisioned, gitignored** rig
  library, not by the repository — and GLB/LOD/material conventions), annotated known defects with exact
  evidence paths, acceptance tests structured as **fourteen staged gates**, scope of work with non-goals,
  source and CC0 provenance chain, export/runtime guide, evidence index.
- **Which packet governs:** the `c9445ce` package is the **pre-ruling checkpoint**, and `9c0466d` and
  `7603b2f` are **superseded former branch tips**. All are **superseded on current commissioning and
  production status** by `asset-lab-character-human-artist-handoff` @
  `66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8` (packet **CHH-2026-08-07-R2**, digest `dbe7c8c3…`), which
  **governs**. See Lesson **AS** for the rule on propagation and supersession.
- **Standing status:** commissioning is **not** authorized; character production is **not** authorized;
  character integration is **not** authorized; role-wide propagation is **not** authorized; **Gate 14 is
  conditional, separately authorized, and not authorized**; D1-B remains unstarted and unauthorized; Asset Lab
  character work remains separate from production `main`. **R2 completed the packet's governance hardening —
  it changed no ruling and authorized nothing.** *(**SUPERSEDED CURRENT-STATUS NOTE**, D1-B clause only — at
  the time of this entry D1-B was unstarted. Current status is governed by the D1-B status banner in
  [`docs/HANDOFF.md`](HANDOFF.md) and by Lesson **AT**: D1-B has since started **only** through the bounded
  Soundstage Composer Proof, and broader D1-B remains unauthorized. Every other clause in this bullet —
  commissioning, character production, character integration, role-wide propagation and Gate 14 — is
  **unchanged and still current**.)*
- **Fastest diagnostic:** before any character work, read the **active handoff packet at `66b44b2`** and the
  preserved 05I final report (`docs/ASSET-LAB-05I-FINAL-REPORT.md`) first — the latter is retained as history,
  but its readiness language is superseded, as the packet's evidence index records.
- **Anti-pattern:** resuming generator iteration while a specialist handoff is the open artifact; reading the
  pre-ruling `c9445ce` package, or the superseded `e5a4931`, `9c0466d` or `7603b2f` tips, for current
  commissioning or production status. **Reuse:** P.

## AL. Preserve both management-distance and human-scale character evidence — **BR, MG**

- **Lesson:** a character proof needs **both** distances captured and retained; neither substitutes for the
  other. Management distance answers "does this read as a crew?"; human scale answers "is this asset
  acceptable?" A pass at one is not a pass at the other.
- **Fastest diagnostic:** if an evidence package has only close-ups or only management shots, it cannot
  support a verdict — collect the missing distance before ruling.
- **Pattern:** distance-paired evidence as a deliverable. **Anti-pattern:** a single-distance package.
  **Related:** **AI**. **Reuse:** BR, MG.

## AM. Verify material data before concluding a colour defect is a material defect — **BR**

- **Symptom:** 05H's torso, arms and face all read blue; the review initially concluded "blue skin material
  bug" and a review panel relied on it.
- **Root cause of the misdiagnosis:** rendered impression was treated as evidence about the material. The GLB
  material dump is authoritative: `mat_authored_skin` = **#e8b58f warm tan** (correct); the blue torso/arms
  are `mat_h_shirt` **#475c75** on 3,540 vertices — a fitted work shirt; the face's cool cast is the harness's
  cool fill light on tan skin.
- **Resolution:** the finding was **retracted mid-review** and the retraction kept visible in the record.
- **Fastest diagnostic:** dump the GLB/glTF material assignments and read the base colours before attributing
  a perceived colour defect to a material.
- **Pattern:** authoritative asset data over rendered impression. **Anti-pattern:** diagnosing a material from
  a screenshot. **Reuse:** BR.

## AN. An isolation test must remove every known confound — **BR**

- **Symptom:** the skin-tint isolation test (`blender-stills/skin-tint-A-blue-fill` / `-B-white-fill`) changed
  the **fill light** but left a **blue-grey world** in place, so it never isolated the material. Its
  "material is blue" conclusion was withdrawn.
- **Root cause:** one variable was controlled; the remaining confound (world/environment colour) was not.
- **Fastest diagnostic:** list every input that could produce the observed effect — material, light, world,
  post-processing, tone mapping — and neutralise **all but one**.
- **Pattern:** enumerate confounds before designing the test. **Anti-pattern:** a one-variable test in a
  multi-variable environment, and citing its result as proof. **Related:** **AM**. **Reuse:** BR.

## AO. Owner-review guides must be versioned or updated when superseded — **BR**

- **Symptom:** the owner-review guide at the 05H technical candidate describes **Iteration 1 only** and asks
  for a decision that three later commits had already overtaken. A reviewer opening the branch tip reads
  instructions for a state that no longer exists.
- **Fastest diagnostic:** check the guide's date/iteration against the branch tip's; if they disagree, the
  guide is stale.
- **Pattern:** stamp a review guide with the iteration it describes and update it at each closure.
  **Anti-pattern:** a review guide left at a branch tip that documents an earlier state. **Reuse:** BR.

## AP. Do not reopen a superseded proof without reading its final ruling and successors — **BR**

- **Symptom:** an 05H owner review was commissioned for `9e3c5d7` after 05H had already received a five-lane
  Art review returning **"accept the foundation, reject this build"**, after a full corrective milestone (05I)
  had completed, and after the human-artist handoff had been cut. Setting the review up would have presented
  an already-rejected build and displaced the successor's checkout.
- **Fastest diagnostic:** before reopening any proof, list every branch that **contains** its tip
  (`git branch -a --contains <sha>`) and read the newest one's final report first.
- **Pattern:** ruling-then-successors before re-review. **Anti-pattern:** re-reviewing a superseded artifact
  because its SHA is the one on file. **Reuse:** BR.

## AQ. A technically reproducible asset is not necessarily a viable production foundation — **BR, MG**

- **Evidence:** 05H passed its validator (65 joints, correct orientation, height, grounded, no stray island),
  exported a clean 3-step LOD chain, ran console-error-free, and was fully deterministic and reproducible from
  committed source — and was still rejected as a production character on visual grounds.
- **Root cause it addresses:** technical gates measure conformance, not appeal, anatomy, or craft.
- **Fastest diagnostic:** ask what the validator **cannot** see; route that to a human reviewer.
- **Pattern:** separate the technical gate from the art gate and require both. **Anti-pattern:** reading
  "validator PASS" as "production ready" — a validator pass is not acceptance. **Reuse:** BR, MG.

## AR. Stop autonomous iteration when the remaining defects need specialist judgment — **BR, MG**

- **Lesson:** when the open defects require **sculpting, topology, rigging, or weight-paint** judgment, further
  autonomous iteration spends budget without converging. Stop, scope the specialist work precisely, and hand
  off with a technical contract, annotated defects, acceptance tests, and a provenance chain.
- **Evidence:** the 05I final report is unanimous — face and hands are "beyond what the procedural pipeline can
  reach on this CC0 base" — and the handoff package exists precisely so a specialist can execute without
  reverse-engineering the repository.
- **Fastest diagnostic:** name the discipline the fix belongs to. If no automated process owns that discipline,
  hand off.
- **Pattern:** classify the remaining work by discipline before authorising another pass. **Anti-pattern:**
  another generator iteration against a judgment problem. **Related:** **AJ**, **AK**. **Reuse:** BR, MG.

## AS. A status ruling must be propagated, not appended — **BR, MG, P**

Extends Lesson **AK** (the handoff supersedes further autonomous iteration) to the failure AK did not cover:
the handoff package itself can carry the *pre-ruling* premise in every document except the one the ruling was
written into.

- **Task/defect — Project: Studio.** The final Owner ruling on the character track was initially added **only**
  to the lead `docs/handoff/CHARACTER-ARTIST-HANDOFF-BRIEF.md` in the Asset Lab repository. The other seven
  independently distributable handoff documents kept the earlier **"finishing correction, not a redesign"** and
  polish-pass premise.
- **Symptom:** the standalone `CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` — the document a producer or artist is
  most likely to receive **on its own** — still promised to *"return a production-ready character"* through
  *"a finishing correction"*, and filed body proportions under **"Minor finishing"**. An artist pricing from
  that page would have quoted **minor face-and-hand polish** against a character already **rejected as a
  production foundation**, whose real scope is a face and cranium sculpt, hand/forearm retopology, a manual
  weight-paint pass, garment refitting and a genuine reduction in body mass.
- **Root cause:** a status block protects **only the document containing it**. The ruling was appended to a
  reading order, not propagated through a packet.
- **Why safeguards missed it:** the diff was correct, documentation-only, one file, and factually accurate on
  its own terms. Branch, SHA, parity, ancestry and scope checks all passed. Nothing compared the *new status*
  against the *surrounding commissioning assumptions*.
- **Consequence in the record:** proportion severity, the count of unfinished areas, deformation language and
  review-gate structure were left inconsistent across the package — the ruling named five unresolved areas while
  the same brief still said the pipeline *"cannot finish two things"*, and the acceptance model was still a
  single end-of-job review.
- **Resolution:** the ruling was reconciled through the scope of work, the known-defects record, the acceptance
  tests, the technical contract and the evidence index. At R1, the reconciliation **was merged and published**
  on `asset-lab-character-human-artist-handoff` at `7603b2f234dfdb11ad6a0691315942c4b16cffac` (Asset Lab repo,
  remote `backup`; a fast-forward on that branch — **not** merged into production `main`) — **seven linear
  documentation-only commits** over the complete range `c9445ce..7603b2f` (`074bb80`, `1dcb263`, `b9f57a0`,
  `2967c1c`, `e5a4931`, `9c0466d`, `7603b2f`; `1dcb263` is the **second intermediate commit** of that chain and
  `e5a4931` the **fifth**, neither a final candidate — `e5a4931` was superseded as the branch tip by `9c0466d`,
  which was in turn superseded as the branch tip by `7603b2f`). The **sixth commit is `9c0466d` —
  *docs(handoff): correct D1-A and D1-B status*** (supporting example 3), now **historical**; the **seventh
  commit is `7603b2f` — *docs(handoff): disclose UAL dependency and stamp packet identity***
  (supporting example 4), the **R1 tip**, now likewise **historical**. R1 published packet
  **CHH-2026-08-06-R1** (revision date **2026-08-06**), packet-content SHA-256
  `013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`. **The current governing commit is
  `66b44b2` and the current packet is CHH-2026-08-07-R2** — see *supporting example 5*, which records the R2
  propagation and the production amendment it forced.
  Across the R1 range (`c9445ce..7603b2f`) **eight** `docs/handoff/*.md` files changed and **0** non-documentation
  files; the D1-A/D1-B correction itself touched **three** of those eight — the brief, the scope of work and
  the evidence index — each an independently distributable document. **No historical 05H or 05I report was
  rewritten** and **no character asset or production code changed**; the evidence index now states that the
  historical reports' status language is superseded. The packet was **published through a linear
  fast-forward**, is **not merged into production `main`**, and **does not authorize execution of the
  commission**.
- **Acceptance restructured — Project: Studio.** The single end-of-job review became **fourteen total staged
  gates**, of which **thirteen are ordinarily required**: art direction and proportion target · face and
  cranial sculpt · body sculpt and silhouette · topology and edge-flow correction · hands, wrists and forearms ·
  garment construction and refit · hair and headwear · rig compatibility · manual weight painting · materials
  and lighting response · animation and deformation · human-scale final review · management-camera final
  review. The **fourteenth — multi-character scalability proof — runs only when separately authorized**, and
  passing the gates does not itself authorize integration. **No fixed loop count is promised or capped**; the
  Owner's planning expectation is that **ten or more total review loops may reasonably occur**, with fewer or
  more depending on the evidence — that is *iteration capacity*, **not** an estimate and **not** a guarantee of
  acceptance after any number of rounds.

Of the supporting examples below, the **first two** surfaced in the same propagation pass. They are not
themselves ruling-propagation failures — they teach the adjacent rule that **a documentation claim must be
verified against the repository**, and they are recorded here because the same pass and the same packet
produced them. The **third, fourth and fifth came from later passes** (`9c0466d`, `7603b2f` and `66b44b2`
respectively) and are **not** covered by that disclaimer: the fourth in particular is **the same failure mode
as this lesson's lede**, and the fifth is where the lede's rule finally had to be applied **across
repositories** — to the production record itself.

**Supporting example 1 — a gitignored dependency described as committed — Project: Studio.** The hard technical
contract called `public/assets/animation/UAL1_Standard.glb` **"the committed rig"**. It is not committed:
`.gitignore` ignores `public/assets/*` and re-includes only `public/assets/studio/`, so that file — and with it
the **43-clip UAL library** it supplies, of which this character uses **six** — is **absent from a clean
checkout**. The **65-joint accounting itself was correct**, and is independently re-derivable from the **three
committed 05I character LOD GLBs** (LOD0/LOD1/LOD2; a fourth tracked file, `_COL.glb`, is a collision proxy and
carries no skeleton); only the **delivery claim attached to it** was false. A sibling packet document
(`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`) had **already** described that gitignore behaviour — reviewing each
document *only in isolation*, with no cross-document reconciliation of the same asset's delivery status, is
what allowed the contradiction to survive between them. The correction now distinguishes the **committed
character GLBs and their embedded skeleton** from the **locally provisioned UAL rig and clip library**, and
requires **authorized provisioning and provenance verification** before the rigging and animation gates (as
this correction then stated them, **8 and 11**) may be **marked complete**. The absence gates *acceptance* and
blocks all **six-clip deformation evidence**; it does not block the sculpt, topology and weighting work,
because the skeleton re-derives from the committed GLBs. **That "8 and 11" enumeration under-counted the
affected set and is superseded** — supporting example 4 records the re-derived partition (**5, 8, 9, 11**
cannot pass; **6, 7, 10, 12, 13** cannot close; **1–4** may proceed; **14** conditional).

**Supporting example 2 — evidence stored at the parent path — Project: Studio.** `EVIDENCE-INDEX.md` pointed at
`proof/lab05i/iteration-01/blender/`. **That directory did not exist** — and never has, on any ref. All
**twelve** Iteration-1 Blender renders **did** exist, tracked **directly under** `proof/lab05i/iteration-01/`.
Iteration 2 stores the **same twelve filenames** one level down, in a nested `blender/`. The incorrect pointer
was created by **assuming the two iterations shared the same directory structure** — it was written as a brace
expansion, `{runtime,real-gpu,blender}/`, of which two thirds resolved correctly, which is why it read as
plausible. The corrected index now distinguishes `runtime/`, `real-gpu/`, the **twelve root-level Iteration-1
renders**, and `root-cause/` where relevant. **No evidence file needed to move.**

**Supporting example 3 — a stale status claim about another repository's milestone — Project: Studio.** The
central 05H/05I rejection ruling **had** been propagated correctly through all eight documents. What survived
was a stale **adjacent-milestone** assertion: three packet documents — `CHARACTER-ARTIST-HANDOFF-BRIEF.md`,
`CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` and `EVIDENCE-INDEX.md` — still said *"D1-A and any subsequent D1-B
Studio Lot character phase remain unstarted and separately governed"*, a single grammatical subject that swept
**D1-A** into **D1-B's** status. **D1-A is owned by the production repository, not by the Asset Lab handoff
branch, and it was already merged, closed and tagged**: `docs/art/D1-A-CLOSURE.md`, merged as `af7c238`,
closed and tagged at `e87c34f` (annotated tag `d1a-studio-identity-package`), with the later ordinary-player
enablement phase closed at `9303560` (tag `d1a-concept-a-player-enablement`). The packet was therefore
**internally consistent and still wrong about an external repository's milestone** — every check that compared
the packet against itself passed, because the claim's referent lived somewhere the packet never looked. The
correction (`9c0466d`) states D1-A as **completed, merged, closed and tagged**, locates its record in the
**production** repository rather than in the handoff branch's history, records that **D1-A did not integrate
this character** and authorized **no** human-artist commissioning, **no** character production and **no**
Studio Lot character integration, and restates D1-B with a **bare subject** — *"D1-B is unstarted and is not
authorized"* — separately governed, not assumed to include characters, with any character integration proposed
under it requiring **separate authorization and acceptance evidence**. **D1-B, by contrast, is genuinely
unstarted and unauthorized**: no D1-B branch, tag or implementation exists in either repository. The
historical reports carrying the old claim — for example `docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`,
which reads *"D1-A was not started, not designed, not scaffolded"* — were **superseded by notice, not
rewritten**.

**Supporting example 4 — a priced dependency disclosed only in the technical annex, and a packet with no
revision identity — Project: Studio.** The seventh commit, `7603b2f` (*docs(handoff): disclose UAL dependency
and stamp packet identity*), publishes packet **CHH-2026-08-06-R1**.

*The disclosure defect.* The specialist-facing `CHARACTER-ARTIST-HANDOFF-BRIEF.md`,
`CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` and `CHARACTER-ACCEPTANCE-TESTS.md` all **required UAL-dependent
work, evidence or acceptance**, but none of them stated clearly enough that the approved dependency —
`public/assets/animation/UAL1_Standard.glb` (Quaternius **Universal Animation Library**, CC0 1.0; the
**65-joint** rig contract and a **43-clip** library of which this track uses **six**) — is **gitignored**,
**absent from a clean checkout**, **not repository-delivered**, and **Owner / authorized-operator
provisioned**. The **technical annexes already carried the correct dependency facts**; the documents a bidder
actually prices from did not. That is a real **schedule and deliverability underbidding risk**, and it is the
same failure mode as the lede of this lesson — a fact correct *somewhere* in the packet is not a fact
disclosed *where it is acted on*.

*The gate-scope defect found by the same pass.* The dependency affects **more gates than the previous
"gates 8 and 11" summary stated**. Re-derived from the actual execution and evidence paths — not copied
forward — and confirmed by primary review:

- **Gates 5, 8, 9, 11 — cannot pass or be marked complete** without approved UAL.
- **Gates 6, 7, 10, 12, 13 — may be prepared and provisionally reviewed, but cannot close** without it
  (six-clip garment and accessory anchoring; and the review harness loads the clip library unconditionally,
  so even the static runtime views cannot be captured).
- **Gates 1–4 — may proceed on Blender-side evidence**: the 65-joint skeleton is embedded in the committed
  character GLBs and independently re-derivable from them.
- **Gate 14 — conditional, separately authorized, and not authorized now.**

R1 also requires a blocked gate to be reported as **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT
AVAILABLE`**, so a **client-input block is distinguishable from a specialist failure**. Substitution of a
different rig or animation library is forbidden, as is committing or redistributing the provisioned file.

*The packet-identity defect.* The packet carried **no in-document revision identity**, so a **copied stale
packet was difficult to distinguish from the governing packet**. R1 stamps all eight documents with an
identical block: **packet name · version (`CHH-2026-08-06-R1`) · revision date (`2026-08-06`) · governing
branch · superseded-tip field (`9c0466d`, correct as R1's origin — *not* a statement that `9c0466d` still
governs) · a packet-content digest intended as a reproducible content identity
(`013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`) · a standalone-currentness warning · an
execution-authorization warning**.

*What R1 deferred to R2 — historical, and all four items now closed.* At R1 the digest was **stable and
identical across all eight documents**, but its **canonical generation/validation method was not published in
governing packet content** and **no committed generator or validator enforced it** (**R2-1**) — a reader given
only the packet could not then re-derive the digest, because the normalization rule was unstated. Carried
forward at R1 and likewise not then fixed: blocked gates were **not yet explicitly forbidden** from being
labelled **FAILED** solely because Owner-provisioned UAL is missing, and providing the UAL was **not yet
stated everywhere** as insufficient by itself to mark a gate **PASSED** (**R2-2**); UAL disclosure coverage in
`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md` and `CHARACTER-KNOWN-DEFECTS.md` remained an open review item
(**R2-3**); and this lesson was to be updated when R2 finalized (**R2-4**). **R2 is now complete,
independently reviewed, merged by fast-forward into the governing branch, and governing.** Supporting example
5 records how each item closed; this paragraph is retained as the historical statement of what was open at R1.

*Unchanged by R1.* No ruling, gate structure, scope or authorization moved: 05H technical/provenance research
remains **useful**, the 05H **visual build remains rejected**, 05I remains **one bounded corrective milestone**
of **two Owner-reviewed iterations** and remains **rejected as a production foundation** requiring
**substantial specialist correction, not polish**; **D1-A is completed**; **D1-B is unstarted and
unauthorized**; **commissioning, character production and integration all remain unauthorized**.

**Supporting example 5 — the ruling moved again, and the production record had to move with it — Project:
Studio.** This is the lede's failure mode applied **across repositories**. Production documentation recorded
the character handoff as packet **CHH-2026-08-06-R1** @ `7603b2f`, packet-content SHA-256
`013b5b05…`, and described R2 as **deferred**. Asset Lab then **completed R2**: packet
**CHH-2026-08-07-R2** (revision date **2026-08-07**) @ `66b44b2`, packet-content SHA-256
`dbe7c8c3…`, **independently reviewed and merged by fast-forward** into the active governing handoff branch
`asset-lab-character-human-artist-handoff` (`7603b2f..66b44b2`, three linear commits, **no merge commit**).
The moment that landed, **every production sentence that encoded the former current ruling became false** —
the governing tip, the packet version, the digest, the "deferred to R2" statements, the reading order, and the
D1-A closure's character-authority pointer. **Production status documentation therefore had to be amended
everywhere that encoded the former current ruling**, in one governed change, while **historical** references
to `7603b2f`, `9c0466d`, `e5a4931` and `c9445ce` stayed historical.

*R2 outcomes and remaining boundaries.*

- **M1 — RESOLVED.** The final validator architecture draws the line that the earlier design blurred:
  **governed identity metadata** (packet name, version, revision date, governing branch, superseded Git tip,
  the presence of the required identity block and the uniqueness of the digest field) **must pass a complete read-only
  preflight before any update-mode write**, and **repairable derived data** (the digest value itself) may be
  repaired through the sanctioned update path. Canonically: **"Digest values are repairable data; governed
  identity metadata is not."** And: **"Update mode must preflight packet identity before any write, but a
  malformed digest alone must remain repairable through the sanctioned update path."** A failed preflight
  writes **zero** files. The superseded expectation — that a malformed digest alone should fail without
  writing — is **not** revived.
- **Deterministic diagnostics.** Failure-safe governance tooling now provides **deterministic
  filesystem-read diagnostics for the corrected path**: a canonical page that is missing or that exists but
  cannot be read is reported against its **repo-relative** path with the runtime's own errno preserved, and
  machine-specific absolute paths are stripped so the diagnostic does not vary with where the packet root
  happens to live. An unreadable page is never repaired, skipped or recreated.
- **A claimed boundary that matches the implementation.** The **validator wording claims only its canonical
  eight-file enforcement boundary** — it enforces the presence and cross-page agreement of exactly those eight
  paths and defines the digest over exactly those eight and nothing else. It is explicitly **not** an
  allowlist for `docs/handoff/`: an unrelated extra file there is not hashed, not verified and not touched.
- **UAL disclosure.** **R2 closed the two identified direct UAL dependency disclosure gaps in the
  Export/Runtime Guide and Known Defects.** That closure covers **exactly those two pages**; no claim is made
  here about direct UAL disclosure on any other packet page.
- **Gate states.** The packet now carries the governing **PASSED / FAILED / BLOCKED** definitions, with the
  canonical blocked wording **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`**. **There is no
  fourth state**, and provisioning the UAL removes the block, produces no evidence by itself, marks nothing
  PASSED and authorizes no integration.
- **M2 — non-blocking note, accepted safe under-claiming.** The Export/Runtime Guide's *"what still works
  without UAL"* list does not enumerate the committed Owner-review index and PNG evidence. That under-claims
  in the **safe direction**; it authorizes no unsafe workflow and was correctly **not** treated as an R2
  blocker.
- **How the tooling was exercised.** There is **no committed validator test suite**. **The R2 review
  exercised intentional negative tests against the committed validator.**

*Scope note.* Unlike R1, **R2 is not documentation-only**: it adds `tools/validate-handoff-packet.mjs` and two
`package.json` scripts alongside the eight packet pages. That tooling lives on the **Asset Lab** branch.
**Production `main` does not contain it**, and this record documents the governing Asset Lab artifact rather
than merging or cherry-picking its history — Asset Lab and production remain separate workstream histories.

*Unchanged by R2.* No ruling, gate architecture, scope or authorization moved. The 05H **visual build remains
rejected**; 05I remains **rejected as a production character foundation**; a **qualified human character
artist** and a **rigging / weight-paint specialist** remain required; **current procedural / autonomous
character iteration remains stopped**; **technical reproducibility is still not production viability** and
**management-camera success still does not replace human-scale review**; **commissioning remains
unauthorized**; **character production remains unauthorized**; **integration remains unauthorized**;
**Gate 14 remains conditional, separately authorized, and is not authorized**; **D1-A remains complete** with
Concept A (**Golden Age Deco**) approved and published; **D1-B remains unstarted and unauthorized**. **Handoff
readiness is not production authorization**, and R2's completion does **not** start D1-B.

**Reusable rule (cross-project).** When a ruling changes an asset's **production status, severity, or scope**,
propagate it through **every independently distributable document in the same governed change**. Reconcile:
ledes · status blocks · verbs · defect counts · severity grades · scope estimates · acceptance tests · technical
contracts · review gates · evidence indexes · supersession notices · dependency status · integration
restrictions · tracked-versus-gitignored status · clean-checkout availability · provisioning responsibility ·
provenance requirements · dependency gating · exact evidence-path resolution.

- **A ruling is not fully closed until every current status surface agrees.** Publishing the ruling in its own
  repository is the *start* of the propagation, not the end of it. Enumerate every surface that states the
  **current** status — in **every** repository that routes readers to it — and move them in one governed
  change. A ruling that is correct at its source and stale in the record that points at it is still a stale
  ruling.
- **Historical references should remain historical; current-status references must move together.** Classify
  every hit before touching it: current governing status · historical record · process/lesson history ·
  unrelated. Update only the first. **Do not rewrite historical evidence merely to eliminate an old SHA** —
  and never let a superseded tip survive as the answer to "what governs now".
- Review a handoff as a **packet of standalone documents**, not only as an ordered reading experience — assume
  each page is the only page its reader receives.
- **Propagation review must validate adjacent milestone and dependency claims, not only the central ruling.**
  A packet can be **internally consistent and still be wrong about another repository**. **Cross-repository
  status claims must be checked against the repository that owns the branch, tag, closure record, or
  implementation** — never against the packet's own history, and never against a sibling document that
  inherited the same assumption. Write such claims with a **bare subject per milestone** ("X is closed",
  "Y is unstarted"), never as one predicate shared across two milestones, and **name the repository that owns
  each record** so a standalone reader can verify it.
- Keep **historical reports preserved**, but make current commissioning documents state **when historical
  readiness language is superseded**.
- When substantial **sculpting, topology, rigging, weight-painting or deformation** work remains, structure the
  commission as **repeatable gated review**, not one-shot delivery: separate gates for art direction, face and
  cranial sculpt, body sculpt, topology, hands, garments, headwear, rig compatibility, weight painting,
  materials, animation, human-scale review and management-camera review, each able to approve, reject, or
  require rework, and each able to repeat. Gate any scalability or performance proof **separately**, and do not
  let a full set of passed gates stand in for integration authorization.
- **No fixed loop count should be promised or capped**, and no single pass or fixed iteration count guarantees
  approval. State any loop expectation as *capacity*, never as an estimate.
- **A technical handoff must distinguish tracked artifacts, gitignored local dependencies, externally
  provisioned packages, and generated derivatives.** Never call an asset **committed** or
  **repository-delivered** merely because a standard local path exists. State **who provisions it**, **how
  provenance is verified**, **whether it exists in a clean checkout**, and **which acceptance work is blocked
  until it is available**.
- **Disclose a client-furnished dependency where it is acted on, not only where it is specified.** Every
  client-furnished or locally provisioned dependency that affects what a reader can **price, schedule,
  execute, review, evidence, or accept** must be disclosed **in each independently distributable document
  whose reader can act on it**. **Do not rely on a technical annex being available somewhere else** — the
  annex protects only the reader who happens to hold it.
- **Keep three states distinguishable: blocked, failed, and passed.** A **blocked client dependency** must be
  reportable as a **client-input block** that is neither **failed specialist work** nor **passed acceptance**.
  Give the blocked state an explicit label, and state that **supplying the dependency removes the block but
  passes nothing by itself**.
- **A multi-document governed packet should expose its own identity.** Publish, in every document:
  **packet/version identity**, **revision date**, **governing authority**, and a **reproducible content
  identity** — and keep **live Git-tip verification separate** from it, since a commit cannot embed its own
  future SHA. A content digest is only as useful as its **published, enforced** derivation method; ship the
  generator and validator with it, or record their absence as an open defect.
- **Separate repairable derived values from authoritative metadata.** A governed artifact holds two different
  kinds of field. **Derived values** (digests, checksums, generated indexes) are **data**: they can be
  recomputed, so they are repairable by tooling. **Authoritative metadata** (identity, version, revision date,
  governing authority, supersession) is **a decision**: it can only be changed deliberately, by the owner.
  Decide which is which **before** writing tooling that touches either.
- **Preflight authoritative metadata before mutation.** Any tool that may write must first complete a
  **read-only** pass over the authoritative metadata and abort having written **zero** files if it disagrees.
  Validate everything, then write — never validate-as-you-write, which leaves a half-repaired artifact whose
  state is worse than the one it started from.
- **Integrity-repair tooling must not repair authority metadata.** A tool built to restore a derived value
  must **refuse** to reconcile identity, version or supersession, and must say so when it stops. The moment
  repair tooling can silently rewrite authority, the artifact's identity is only as trustworthy as the last
  automated run — and a **malformed derived value alone must still remain repairable**, or the sanctioned
  repair path is unusable exactly when it is needed.
- **Failure-safe governance tooling requires deterministic diagnostics.** When a governance tool refuses to
  act, its refusal is the entire product: report the failing item by its **canonical, machine-independent**
  identifier, preserve the underlying error, and strip anything that varies with the machine or checkout
  location. Two operators on two machines must get **byte-identical** diagnostics for the same defect, and no
  failure path may escape as an unhandled exception.
- **Documentation must claim only the enforcement boundary actually implemented.** State exactly what a
  validator covers — and, explicitly, what it does not. A tool that enforces a **fixed canonical set** must
  not be described as if it policed the whole directory; over-claimed coverage converts a passing run into
  false assurance, which is worse than having no tool at all.
- **Re-derive affected gate and dependency lists from the actual execution and evidence paths** — never copy a
  prior list forward. A summary list that was right when written is the most plausible-looking way for an
  under-counted scope to survive review.
- **An evidence index must validate the exact path, not merely the presumed directory pattern.** A broken
  pointer does **not** prove the evidence is absent — inspect the **parent and sibling** structures before
  concluding anything is missing. Record the **real** location, and do **not** move historical evidence merely
  to make two iterations look symmetrical.
- A commissioned artist must be able to **estimate the real work from any standalone scope of work**, without
  relying on undocumented context.
- **Fastest diagnostic:** after any status ruling, grep the whole packet for the superseded framing
  (`finishing correction`, `polish pass`, `minor`, `production-ready`, `viable`, `all viable`) and for the
  **old defect count**; then read each commissioning-facing document **in isolation** and ask whether it alone
  would produce a correct estimate. For every asset the packet calls *committed*, confirm it with
  `git ls-tree` against a clean checkout rather than a local path; for every evidence pointer, resolve the
  **exact** path, not the pattern; and for every claim about an **adjacent milestone in another repository**,
  resolve the branch, tag or closure record **in that repository** before accepting it.
- **Pattern:** ruling propagation as part of the ruling commit — every standalone document either carries the
  ruling or prominently references it. **Anti-pattern:** appending a ruling to one lead document while leaving
  contradictory commissioning assumptions elsewhere; leaving "nearly ready", "finishing correction" or "polish
  pass" language in standalone documents after the asset has been rejected; relying on a producer or artist
  reading the packet in a specific order; collapsing sculpt, topology, garments, rigging, weight painting,
  materials, animation, human-scale review and management-camera review into one final gate; promising
  production readiness after one pass. **Related:** **AK**, **AO**, **AQ**, **AR**. **Reuse:** BR, MG, P.

## AT. Separate visual success from economic success — **BR, MG, P**

An experiment can test two hypotheses at once and get two different answers. If they are not scored
separately, the loud one rewrites the quiet one, and a failed business case gets laundered into a
success because the artefact next to it looked good.

- **Task — Project: Studio.** The **D1-B Soundstage Composer Proof**
  (`docs/art/D1-B-SOUNDSTAGE-COMPOSER-PROOF-CLOSURE.md`, branch
  `art-d1b-soundstage-composer-proof`, base `aadbd63d`, adoption **promotion** commit `a7e4847`,
  merged to production `main` at `00dfbe0`) asked whether the
  existing procedural Phaser building system could produce two coherent but genuinely distinct
  soundstages, **and** whether the second one would be materially cheaper to author once a composer
  existed. The visual hypothesis **passed**; the economic hypothesis **failed**.
- **The framing was too large before inspection.** The work was proposed as an "Art Factory" — a
  generalized asset-authoring system with Lot Stamp serialization, a runtime asset pipeline and
  placement tooling. Direct inspection of the production architecture showed most of the supposed
  tooling **already existed**: an iso projection framework, `beginBuilding`/`drawWalls`, three roof
  primitives, stage aprons, `dressStage()`, relative placement, vignette structures, a
  `displayObjects` instrument and a working evidence harness. The authorization was narrowed to a
  parameterized composer over that existing modularity, and **no** new abstraction was built.
- **Measured cost, unrepaired.** Composer parameterization ≈ **7 min**; Stage A re-expression ≈ **0
  incremental** (it reproduced existing art, which is exactly why the foundation looked cheap); Stage
  B initial incremental authoring ≈ **14 min** — roughly **2×** the foundation, against a target of
  *clearly less than half*. The later corrective pass (≈3 min active) was recorded **separately** and
  not used to move either side. These are agent wall-clock with overlapping segments, not human
  labour; they were not aggregated into a precision metric and no project-wide productivity
  percentage was derived.
- **Why the foundation looked cheap:** it only ever encoded one roof form and a plain wall, because
  that is all Stage A needed. Stage B had to author the vocabulary it used. A third stage reusing
  that vocabulary would plausibly be a spec literal — **but that was not tested, and the closure
  refuses to extrapolate it.** Adding a Stage C purely to obtain a friendlier amortization number was
  explicitly forbidden and not done.
- **Signage-masked review was load-bearing.** Each soundstage wears a large `STAGE A` / `STAGE B`
  facade plate. With signage visible, "can you tell them apart?" is not an architectural question at
  all. Masking it also proved the mask had to reach further than the plates — `Soundstage A/B` is
  additionally printed by vignette markers, activity toasts, character cards, the hover label, the
  selection panel and the companion navigation. An independent blind reviewer then returned
  *"genuinely different buildings, ~98%"* and *"same game, ~97%"* on architecture alone.
- **A control path separated pre-existing defects from introduced ones.** Closer review found Stage A's
  barrel roof reading as a flat "bullseye" decal rather than a vault. The content-rollback capture
  showed the identical artifact in the **pre-D1-B baseline**, so it was recorded as
  **PRE-EXISTING** and deliberately **not** folded into the experiment — fixing it would have
  contaminated the controlled comparison and added unrelated authoring cost. The same control
  distinguished "the images differ" from ambient noise: a second capture of the *same* configuration
  differed by more pixels (663) than rollback-vs-default did (353), which is the only reason the
  baseline-equivalence claim meant anything.
- **A bounded corrective pass prevented creep.** Exactly one pass was authorized, scoped to one
  defect: Stage B's sawtooth fascia reading as a black void. It turned out to be a
  **lighting-convention error, not a taste call** — the fascia sits on the elevation `drawWalls`
  treats as lit but was painted with a shadow tone, making it the darkest element on that face. One
  colour value moved to a lit lot-palette tone, and the field was renamed rather than added to, so the
  roof union gained no vocabulary; blind re-review confirmed *"not one dark pixel on the roof itself"*.
  Pass #2 was neither authorized nor taken, and the remaining minor Stage B notes were carried as
  known non-blocking observations.
- **The failed hypothesis still produced adoptable components,** each judged on its own merit: a
  stable presentation-only stage assignment (a real correctness fix), the StageSpec composer (clearer
  representation and testable baking, adopted explicitly *not* for productivity), the Stage B art,
  the `underDressed` treatment, and an independent camera resize-refit bug fix.
- **Two defects were only visible because of the experiment.** The **stage-assignment defect** — a
  surviving production visually migrating from Stage B to Stage A when the array compacted after a
  release — had been **hidden by the two stages looking identical**. And `underDressed` was a **dead
  existing signal**: computed by the adapter, spread onto all nine buildings, consumed nowhere, and
  unreachable from any existing fixture. Distinct art exposed the first; wiring the second cost
  almost nothing.
- **And one defect the independent review found in the fix itself — presentation memory that outlived
  its game.** The stable stage-assignment resolver correctly survived Lot unmount and re-entry, which
  is exactly what it was built for; but its initial module-level lifetime was too broad and it also
  survived **New Game** and **Load Save**. Because production ids are `prod-<tick>` and repeat across
  games, a slot held by a departed studio's film could be inherited by an unrelated new studio's film
  greenlit in the same week. Closed by ending the presentation session at the authoritative
  GameState-replacement boundaries — not by changing the resolver.
- **Reusable rule — scope presentation memory to the state it decorates.** Persistent presentation
  memory must be scoped to the identity and lifecycle of the *authoritative state it decorates*.
  "Session scoped" does not merely mean *survives component unmount*: it must also define when the
  session **ends**. Where ids can repeat across authoritative sessions, a presentation cache or
  resolver must reset at the replacement boundary, or be keyed to an authoritative session identity.
- **Fastest diagnostic:** before starting, write down each hypothesis and its own pass/fail criterion
  **and its own measurement**; at closure, score them independently and refuse to publish a single
  blended verdict. If a metric fails, record the failure and stop — do not re-baseline, do not
  re-scope the comparison, do not add another data point chosen because it will look better.
- **Pattern:** two-column verdicts (`VISUAL: PASS` / `ECONOMIC: FAIL`); an explicit "no productivity
  multiplier is claimed" statement in the closure; component-by-component adoption rulings; a control
  path retained so pre-existing defects stay attributable; blind independent review of the artefact
  with the identifying labels removed; bounded corrective passes with a hard stop; presentation caches
  whose reset is wired to the authoritative state-replacement boundary and asserted by test.
  **Anti-pattern:** collapsing multiple hypotheses into one PASS/FAIL; letting a visual win imply a
  tooling win; moving the goalposts after a metric fails; extrapolating an untested future unit cost;
  adding a third instance purely to improve amortization; building the abstraction before inspecting
  what already exists; allowing labels or signage to carry a test that is supposed to be about form;
  opportunistically fixing pre-existing defects inside a controlled experiment; declaring components
  worth shipping *because* their parent experiment needs to be called a success; defining a cache's
  lifetime only by what it must **outlive**, without defining what **ends** it.
  **Related:** **AQ**, **AR**, **AS**. **Reuse:** BR, MG, P.

---

# Authored Soundstage Pipeline Proof — Checkpoint C (proof branch `art-authored-soundstage-pipeline-proof`, base `6d08bb0`)

Context: an offline-authored (Blender) replacement for one soundstage, rendered to a 2D PNG pair and
integrated behind a proof flag that was DEFAULT-OFF while these lessons were being learned. The
procedural Stage B remains the control, the explicit rollback and the failure fallback.

**Branch and lineage state, stated precisely.** These lessons were written while Checkpoint C was
open, and originally carried "UNMERGED / production `main` unchanged". That is no longer true of the
lineage, and the distinction is worth keeping exact:

- The proof **branch** is frozen at its accepted authority `81497b4` and has not moved. It was never
  merged back into, and has never been advanced by, production.
- The accepted proof **lineage** was incorporated into production by the authorized **fast-forward**
  adoption, so `81497b4` **is an ancestor of `main`**. There is no merge commit anywhere in
  `6d08bb0..main` — the range is linear.
- `main` then advanced **past** that lineage through the production-adoption governance commit
  `5e75b8e`, which is what flipped the authored gate to DEFAULT-ON.

So on `main` today the authored Stage B is the default. Closure:
[`art/AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md`](art/AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md).

## AU. An absolute-value check cannot catch a relational visual defect — **BR, MG, P**

A metric written to answer the *previous* symptom will keep passing while the cause moves. If the
defect is "this element looks wrong **against what it sits on**", only a relational assertion can see
it — and a global bound will certify the artefact as fixed while a reviewer still sees the fault.

- **Task — Project: Studio.** The authored Stage B carried three small roof units. A blind reviewer
  reported them as reading like "flat smudges… a stain or a recess, not a box".
- **The check passed while the defect stood.** The prior corrective pass had been scoped as "lift the
  vent into the palette's darkest legitimate range", and it was verified exactly that way: darkest
  opaque tone **luma 104.3**, **zero** pixels below the scene backdrop (luma 21.7), against a control
  whose own darkest tone is 107. All true, and the item was reported **closed**. It was not.
- **Root cause of the miss.** The real defect was never absolute. The unit's *up-facing top* rendered
  at luma **152.8** against the *up-facing roof deck* it stands on at **175.5** — a **~20-luma
  inversion between two parallel planes**. The original symptom (a near-black box below the backdrop,
  luma 14.5) had been a lighting-rig bug — an on-axis key casting a degenerate infinite shadow band —
  and fixing that cause left a second, different fault in the same object that the same metric could
  not express.
- **Two reviewers disagreed, and the disagreement was the signal.** One blind reviewer called the
  units holes; the next, on the corrected asset, called them "raised boxes with a shadowed face".
  A split like that is diagnostic of a *relational read* rather than an absolute fact, and it is the
  cue to go and measure the relation rather than to pick a side.
- **One physics correction worth keeping.** The claim "two parallel surfaces under one light cannot
  differ" is only true for identical materials; the measured gap here is **albedo**, not illumination.
  Getting that right changed the severity classification, not the existence of the defect.
- **Resolution.** Reclassified as a known release-blocking Art defect and carried into Checkpoint C
  as an explicit runtime watch item, deliberately **not** fixed during integration so the runtime
  proof observed the frozen candidate.
- **AND MEASURE IT IN THE REPRESENTATION SPACE THE STANDARD WAS DEFINED IN (release-closure
  amendment).** The same proof then failed the same way a second time, on a governed relationship
  rather than an ad-hoc one. D1-B's front-to-side coherence figure (0.859-0.876) is a **displayed
  sRGB luma ratio**. It was applied in the authoring rig as a **linear irradiance** ratio, and sRGB
  encoding compressed it: the shipped asset measured **0.949** against a procedural control at
  0.8737 and Stage A at 0.8589 — roughly half the intended corner separation, present since the
  first authored render. Every check passed it, because they asserted palette *membership* (the
  shadow tone sat within tolerance of a governed constant) and never the *ratio between the two
  faces*. **Rule: never transfer a numeric threshold between linear light, encoded colour, source
  material values and the final quantised asset without re-validating in the final representation
  — and measure the governed relationship on the shipped file, not on the authoring parameter.**
- **A relational number also does not transfer across MATERIALS, not just across spaces
  (standards-hardening amendment).** The same band survived the space correction and was then
  found to be non-transferable a *third* way. `0.859-0.876` was never a universal constant: it is
  the interval spanned by the two soundstages' **own colour families** — buff (Stage A) at 0.8589
  and cream (Stage B) at 0.8737. Derive the same relationship for the other families the lot
  actually uses and they do not fit inside it: **taupe 0.8511** (Administration) and **slate 0.8424**
  (Post-production) both sit *below the entire band*. Holding an authored Administration building to
  Stage B's band would have required painting it out of family to pass its own coherence check.
  **Rule: a relational target is derived from the specific material it governs, and is re-derived
  for each one; only the tolerance around it is shared.** The value contract now lives in
  [`art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`](art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md)
  and is recomputed from `palette.ts` on every test run, so it cannot drift back into prose.
- **A recorded hash is not a reproducible process (standards-hardening amendment).** The accepted
  Stage B PNGs were correctly declared the measurement authority and correctly hashed — and the
  quantisation that produced those exact bytes existed only as an ad-hoc command inside a session
  transcript. "PNG-8, shared palette" reads like a specification and is not one: reproduction also
  needs the quantiser and its method, the palette-sharing construction *and its input ordering*,
  alpha handling, dithering, optimization, compression level, and the library versions. Recovered,
  written down and re-proven byte-identical here. **Rule: an accepted binary asset is only as
  governed as the command that can regenerate it; record the command, not the format.**
- **The rule was re-broken by the very next building, because the METHOD moved and the tooling
  did not (RGBA export-hardening amendment).** Stage B's PNG-8 export was recovered, written
  down and proven — and then Option D (`fdfdfea`) replaced the export method entirely with a
  truecolour RGBA path developed *outside the application repository*. It shipped with exact
  SHA-256 digests in the commit message and **no runnable in-repo command**, which is precisely
  the state this lesson had just finished condemning. The repo's own instrument still described
  only the superseded path, so the standard silently documented an export production no longer
  used. Recovered here and re-proven: three clean runs of `rgba-export` reproduce both committed
  Stage B objects byte-identically, alpha bit-exact against source.
  *Reusable rule:* **when the export METHOD changes, the tooling that performs it moves into the
  application repository in the SAME commit as the bytes it produced.** A recorded hash plus an
  out-of-repo script is not a smaller version of reproducibility — it is the same gap wearing a
  digest. Adding a path also means *labelling the old one*: leaving `quantize` undifferentiated
  next to a new path is how the next author picks the wrong one.
  *Corroborating measurement, worth keeping because it is why the method changed at all:* on one
  source, indexed PNG-8 altered **98,854** alpha bytes (2,862 of them anti-aliased rim pixels)
  and displaced **29.4 %** of opaque pixels by more than 8, against **0** and **0.057 %** for the
  truecolour path. Indexing must encode RGB and alpha in one table; truecolour need not.
- **Fastest future diagnostic:** sample the element and the surface it sits on in the same render and
  compare, rather than comparing either to a global floor; and confirm which space the governing
  number lives in before using it as an input anywhere.
- **Pattern:** assert the *relation* — element vs the plane it shares an orientation with, or vs its
  immediate neighbour — whenever the complaint is about how something reads in context.
  **Anti-pattern:** closing a visual defect on a threshold the defect was never going to violate;
  reusing the previous symptom's metric as the acceptance test for its successor.
  **Related:** **AI**, **AM**, **AT**. **Reuse:** BR, MG, P.

## AV. A constrained offline render can be *more* stylised than the procedural art it replaces — **MG, BR**

The pre-registered risk for importing offline-rendered 3D into flat-shaded 2D art is that it arrives
softer, noisier and more chromatically complex than everything around it. Measured, the opposite
happened — because the render was constrained to reproduce the target's *own* shading convention
rather than a physical one.

- **Pre-registered as HIGH RISK** at Checkpoint A: AA gradients, contact shadows and material
  micro-variation that "literally no other pixel in the frame has".
- **Measured on the shipped assets:** authored **36 distinct colours** vs the procedural control's
  **230**; true soft edge (alpha 1–249) **1.72%** vs **2.73%**; 92–96% of the opaque area within
  ΔRGB 30 of a governed palette constant. The authored sprite is the flatter, harder-edged and more
  palette-disciplined of the two.
  **Both figures carry their definitions now, because their absence caused a contradiction in this
  very record.** "Distinct colours" = *distinct RGB triples over pixels with alpha > 200, normal
  finish*; "true soft edge" = *pixels with alpha 1–249 as a share of non-zero-alpha pixels*. This
  bullet first read **34** and **1.71%**. Those were not a different metric and not an error: they
  are the same definitions measured on the **pre-release-closure candidate**, before the release
  punch list removed the three roof units, one header pinstripe and the two flat wall panels. On the
  asset that actually shipped the same measurements return **36** and **1.72%** — reproducible with
  `scripts/art/authored-asset-pipeline.py measure`. The lesson inside the lesson: a bare count
  quoted without its threshold *and* its asset revision will be read back as a contradiction later.
- **What produced that.** Three white suns aligned to +X/+Y/+Z with zero ambient, at irradiance π so
  a diffuse face renders its albedo exactly, with the shadow-side sun set to the project's own
  governed front-to-side luma ratio (0.8735). This reproduces the game's orientation-based shading
  rule and gives every chamfer, slope and reveal a correct in-between tone for free — the one thing
  hand-authored 2D polygon art cannot cheaply do. No external texture was used at all.
- **The corollary that matters for scope:** at the governed management camera the whole building is
  ~222 px wide and a commodity prop occupies 6–20 px, so the cleared third-party donor geometry was
  acquired, hashed — and then **not used**, because it contributes nothing resolvable at that size
  and its material noise is precisely the failure mode above. Hero identity was authored; commodity
  reuse turned out to be optional rather than necessary.
- **Detail must COLLAPSE cleanly, not merely exist (release-closure amendment).** Runtime review of
  the integrated asset found the opposite failure to **AI**: not defects hidden by the management
  camera, but detail that is correct close up and becomes *noise* at the camera players actually use.
  Three roof units (~10x8 px at management scale) read as smudges, twin ~1px diagonal pinstripes
  aliased into a beaded chain, and two flat single-tone wall panels read as stains. All three were
  **removed**, not reinforced. The resulting rule, adopted as Art direction: a detail that only exists
  at close zoom must not damage the building at the primary management camera — it may resolve away,
  but it may not become dots, stains, smudges or broken diagonals. Note the pairing: **AI** says the
  management camera can *hide* a blocker, this says it can *manufacture* one. Both are reasons to
  review at both distances and to let the primary camera arbitrate.
- **Pattern:** constrain the offline render to the destination's shading convention and palette, and
  judge it on colour count and edge softness against the art it replaces, not on render realism; set
  the detail budget at the primary camera and delete anything that cannot survive it.
  **Anti-pattern:** assuming a 3D render must be softened *toward* the 2D target; treating "cleared
  for use" as "should be used"; keeping detail because effort went into it.
  **Related:** **AI** (its mirror image), **AT**, **AU**. **Reuse:** MG, BR.

---

# Fable Authored Environment Strike Team + Option D (merged `fdfdfea`)

Context: a Director-commissioned, fully isolated experiment (branch
`art-fable-authored-environment-spike` from frozen `9c4d060`, worktree + quarantine at
`Project Studio - Art Source Quarantine/Fable-Authored-Proof/`) testing whether donor-based,
Blender-authored, offline-rendered environment art beats the procedural lot art in the real
game frame. It ran the same day as — and independent of — the production authored-stage lane
(`032dd16`→`5e75b8e`→`4a3025e`). **The Fable branch itself was never merged.** A reconciliation
found the Fable art stronger and the production mechanism stronger; **Option D** selectively
combined them: Candidate A's art + production's integration path + production's worn-state
semantics + four regression guards, as one surgical commit (`fdfdfea`, ff-only, 4 files).
Related: `docs/art/FABLE-AUTHORED-ENVIRONMENT-SPIKE.md` (on the spike branch),
`docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`, quarantine `reports/` + `pm/DECISIONS.md`.

## AW. Reuse-first Art is component-level — donor building shells rarely survive adaptation — **MG, BR**

The project receives no extra credit for creating commodity art from scratch; that ruling was
validated. But the experiment's sharpest acquisition lesson is WHERE reuse pays.

- **Two artists, briefed independently on the same cleared hangar-class donor, both rejected the
  shell** for the same measured reasons (ground-springing Quonset massing, wrong aspect for the
  4×4 plot, ~40 ribs/m photoreal steel that aliases at management scale) and rebuilt clean. The
  winning stage retained one donor canopy and a few solid-silhouette CC0 props, re-materialled
  flat (the rejected candidate applied the same discipline, decimating its props to ≤500 tris).
  The CC0 backup shell was rejected outright (texture-baked slab).
- Reuse should happen at the level that genuinely saves effort — canopy, duct, crate, window
  family, material, massing *reference* — and a whole building only when it truly survives
  adaptation. **Do not measure success by percentage of donor geometry retained**; the AV
  corollary (donor props unnecessary at a 222 px flat target) and this result bracket the same
  truth: donor value is resolution- and style-dependent, decided per asset by the destination
  camera, never by acquisition effort.
- "Reuse-first" does NOT mean "drop premade buildings in unchanged" — Studio silhouette and art
  direction stay authoritative; the donor is raw material.
- Provenance worked without becoming bureaucracy: quarantine outside git, per-asset ledger
  (creator, URL, licence + verbatim load-bearing sentences, SHA-256, acquisition time, tier,
  intended use, disposition), raw restricted sources never entering the repo, and only rendered
  derivatives shipping. One acquisition-path judgment call was escalated, disclosed, and
  Director-ratified rather than buried. Where the Owner knows the creator, one concise
  dual-rights ask (modify + commercial derivatives) beats weeks of licence archaeology.
- Tooling stayed parked (spritesheet renderers, batch converters, material-layer systems):
  repetition had not yet justified automation. D1-B's ruling held again — make things first,
  automate observed repetition.
- **Pattern:** audit the donor with a headless inventory dump, decide shell-vs-components
  honestly, record what was actually used. **Anti-pattern:** donor-shell loyalty; equating
  "cleared" with "should be used"; provenance theatre after the art is already built.

## AX. Whole-frame, same-conditions, signage-masked judgment — and when a concept competition is worth it — **MG, BR**

- The Soundstage was accepted because the GAME improved, judged as: same state, same camera,
  same viewport, same surrounding lot, old vs new. Isolated turntable beauty was never the
  question; "did the frame become more compelling" was.
- **Signage-masked identity was the decisive discriminator** in the authored-vs-authored
  reconciliation: with lettering removed, one stage still read as a Golden-Age soundstage
  through architecture alone (vault + ridge monitor + door hierarchy); the other read as
  factory/depot. Architecture must communicate function, era and hierarchy before signage
  explains it. Keep this test for hero buildings.
- **Two serious competing concepts beat polishing the first idea.** Candidate B was rejected on
  its own measurements (7.8 points busier than the lot; its stated discriminator failed to set
  the silhouette) — cheap to learn from a parallel concept, expensive to learn by iterating one
  mediocre direction. Justified when: hero asset, alternatives are cheap, visual judgment is
  genuinely uncertain. Do not run competitions for props.
- A successful replacement **moved the weakest-object title to Stage A** — each major win
  exposes the next attack target. Raise the visual floor; do not keep polishing winners.
- **The comparison peer is itself a moving authority — re-verify it at the moment of grading
  (Stage A supersession amendment).** This lesson's "same state, same camera, same viewport,
  same surrounding lot" conditions silently assume the *neighbour* is fixed. It is not.
  *Project-specific evidence:* the authored Stage A Concept C was selected, built, measured and
  blind-reviewed against the sawtooth Stage B, and was passed at 95 % "clearly different
  buildings" with "no blocker". Production replaced Stage B with the Option D barrel-vault
  Ridge-Monitor stage **while that work was in flight** — between the proof's authority check
  and its first render. Re-reviewed against the Stage B that would actually ship beside it, the
  same frozen asset drew *"a greybox proxy or an unfinished blockout sitting next to a finished
  asset"*. Nothing about the asset changed; only its neighbour did. The concept's entire
  selection rationale — "the strongest, most differentiated silhouette against Stage B's
  sawtooth" — had evaporated before the first polygon existed.
  *Reusable rule:* **an authored building is graded against the peer that will ship beside it,
  not the peer that existed when the concept was chosen.** Pin the peer's commit in the concept
  document, and re-verify that commit is still current before grading, before blind review, and
  before adoption. A frozen authority protects *your* work from drifting; it does not stop the
  world you are matching from drifting.
  *Corollary, which is the more expensive half:* "calmer than its neighbour" is only a design
  position while the neighbour is comparable in finish. Against a richer peer the identical
  asset reads as unfinished rather than restrained — so **peer finish parity is a moving gate
  too**, and deliberate sparseness must be re-justified whenever the peer is re-authored.
  *Anti-pattern:* treating a frozen production SHA as though it froze production.
- **Pattern:** compare-mock composites into the live frame before integration spend; half-size
  silhouette checks; reviewer questions phrased about the frame, not the model.
  **Anti-pattern:** approving art from renders on checkerboards; polishing an accepted asset
  because attention lingers there.

## AY. Author the best art first; optimize delivery second; measure performance instead of fearing it — **MG, BR**

- Order that worked: author → validate visually → optimize delivery → **reject any optimization
  that visibly damages the win**. True PNG-8 hit production-class bytes (~23 KB pair) but
  averaged the 1-px silhouette rim and posterised tonal ramps; the alpha-lossless quantised
  export (~116 KB pair) was indistinguishable from full fidelity and shipped. Byte counts are
  not a quality metric; a ~100 KB-class hero texture is not a crisis. The +501 % payload was
  accepted deliberately, in writing.
- Performance fears were measured, not assumed: displayObjects 143 → 143 (delta 0), FPS
  unchanged, one decoded texture ≈ 0.74 MB. For pre-rendered buildings the real budget axes are
  **texture bytes, decoded memory, alpha correctness, anchoring, hit behavior** — not source
  polygon count (the 10k-poly donor's cost was authoring-side only).
- **Pattern:** encode-and-compare plates (full vs optimized, 1:1 and 2×, plus a ×-scaled
  difference map) before choosing an encoding. **Anti-pattern:** letting a byte-size contest or
  a hypothetical perf ceiling dictate weaker art; optimizing before the art has won.

## AZ. Adopt components, not branches — and authoritative state must survive better art — **P, MG**

- The reconciliation returned different winners per axis: visual (Fable lane) vs engineering
  (production lane: structurally guaranteed fallback, real-browser e2e, generic worn resolution,
  smaller delivery). The correct outcome was **not** choosing a branch — it was one surgical
  commit combining best art + best runtime path + best state behavior + best tests, and
  explicitly carrying nothing else (no experimental loader/flag, no competition machinery, no
  quarantine tooling). Branch loyalty is not an adoption criterion.
- **A prettier asset cannot erase authoritative gameplay communication.** The winning art
  initially had no worn variant; production's guard (both textures or no swap) correctly refused
  such art. The worn derivative was authored from the lot's own shipped worn transform — duller
  fields, desaturation, reduced glazing, trim dropped not darkened — with **no invented
  condition narrative** (no broken windows, damage, or abandonment the Engine never stated).
  Engine decides state; Art expresses it, at exactly the established signal strength.
- Bit-exact alpha between normal and worn means a state change can never alter the hit area —
  and adopting it fixed a latent 8,652-pixel alpha drift between the previous pair.
- **Pattern:** reconcile parallel lanes with a measured same-conditions comparison, then adopt
  per component. **Anti-pattern:** merging an experiment because it won one axis; strengthening
  or inventing state semantics because the new art could draw them.

## BA. Test the real invariant of an authored asset — measured camera, anchor math, registration, real alpha — **BR**

- **A measured camera contract beat eyeballing**: the Blender↔Phaser rig was proven with
  self-measuring gates against the game's own projection (px/tile, dimetric ratio, axis mapping
  via an asymmetric probe, anchor, shift). Renders then entered the game predictably, twice
  (spike flag-lane and production path). Calibration is DONE when the gates pass — it did not
  become its own project, and should not.
- **Depth slicing was tested and not needed**: one sprite, existing container depth, characters
  already occlude correctly. Build slicing infrastructure only when a real asset fails without
  it.
- The inherited test asserted equal `originY` between textures — true only because two assets
  coincidentally shared a height; a 4 px-taller drop would sink the building 1.37 px with
  nothing failing. Adopted guards test the *invariant*: anchor sits 128 px above the bottom edge
  (`texH × (1 − originY) = 128 ± 0.5`); on-disk IHDR must match the metadata the code assumes;
  and a **registration lock** pins the approved silhouette placement (lowest opaque row, bbox
  insets, centroid) ±1 px so future drops shift art review, not the building. Every guard was
  mutation-tested (wrong-size drop fails; 2 px shift fails; `pixelPerfect:false` fails).
- **Real alpha drives hit behavior**: authored silhouette ≠ texture rectangle. A negative click
  must land on a transparent pixel *inside* the sprite rect — the inherited outside-the-rect
  probe passed vacuously, and a bbox-based locator produced a false positive during evidence
  until replaced. State variants keep identical alpha when geometry doesn't change.
- **Pattern:** derive test coordinates from the committed asset's alpha programmatically;
  mutation-test every new guard. **Anti-pattern:** constants that encode an accident of current
  assets; trusting a claim ("gates pass") measured on a synthetic overlay rather than the art —
  that mislabel survived two reviews here before an implementer re-measured the actual file.

## BB. One expensive PM, many cheap builders — with single write ownership — **BR**

- The Owner's economics (PM-tier tokens scarce; builder-tier abundant) produced the working
  model: **one PM** holding judgment, sequencing, acceptance, checkpoint rulings and synthesis;
  **parallel Opus builders** doing art, integration, evidence, provenance, review and fact
  extraction. Zero PM-tier subagents, ever. The PM reads results and decides; it does not grind
  implementation to save a builder call.
- Parallelism worked because writes never overlapped: artists owned isolated candidate
  directories, the integration engineer owned the runtime files, provenance owned the ledger,
  reviewers were read-only, and competing implementations lived in separate locations with the
  PM choosing a winner. Conflicts are prevented by ownership, not resolved by blending.
- Builders challenged the PM upward when evidence demanded it (a mislabeled measurement, an
  escalated acquisition judgment, a premise-changing discovery on main) — and were right each
  time. A lane exists so its reports can be *corrected*, not just collected.
- **Pattern:** precise bounded briefs; same-builder continuation when context compounds;
  independent review only where independence adds information. **Anti-pattern:** PM-tier
  swarms; two agents editing one file; delegating the acceptance judgment itself.

## How Track A should change Track B (Southeastern) — carried forward before any campus work

1. Audit the ENTIRE family before converting anything; classification per building
   (keep-restyle / heavily modify / harvest components / recombine / reject) with transformation
   estimates — expect component harvest, not seven whole-building conversions (AW).
2. ONE Administration concept first; it is a hero asset, so a bounded concept competition is
   justified (AX). Accumulated-studio-history reading — historic core legible under later
   annexes — is the acceptance axis.
3. Judge offline concepts composited into the live frame at the governed camera before any
   integration spend (AX); no runtime integration until the art direction passes and the
   Director authorizes it.
4. Provenance before significant transformation: the pack ships with no licence, so the
   prepared one-paragraph dual-rights creator ask precedes creator-derived work
   (`Fable-Authored-Proof/southeastern-intake/`); creator-source files preferred over anything
   reverse-extracted (AW).
5. Authoritative state boundaries unchanged: campus-derived buildings express existing Engine
   state at existing signal strength; no new condition vocabulary (AZ).
6. Reuse the measured camera contract and the asset-invariant guard patterns as-is (BA); no new
   calibration project, no slicing infrastructure, no automation until the second or third
   building demonstrates actual repetition (AW).
7. Status at time of writing: **BLOCKED — source bytes not on the machine**; intake directory
   and permission draft are ready; nothing was faked with substitute geometry.
