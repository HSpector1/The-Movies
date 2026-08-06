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
Owner ruling: the **authored-base technical workflow and its CC0 provenance are accepted** as pipeline
research; the **05H character build is rejected** as a production character; **05I**, the one authorized
bounded corrective attempt, did not resolve the human-scale face, proportions, hands, deformation, and
surface quality and is **rejected as the production character foundation**; **no further autonomous or
procedural character iteration is authorized**; a human character artist plus a rigging / weight-paint
specialist are required. Verified checkpoints, all at local/remote parity in one linear chain:
`asset-lab-05h-authored-base-character-proof` @ `9e3c5d7bda39f069b7dac04624584c4fea645332` →
`asset-lab-05h-final-owner-review-package` @ `ddfd69fbc22be313f9dbb548c2b16032c9802daa` →
`asset-lab-05i-corrective-character-pass` @ `8903b1e8bbbc166aa1b74a33167aea964502a1f6` →
`asset-lab-character-human-artist-handoff` @ `c9445ce55b5d83cc29def9928aec75fa4edd50ed`.
Related (Asset Lab repo): `docs/ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`,
`docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`, `docs/ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`,
`docs/ASSET-LAB-05I-FINAL-REPORT.md`, `docs/handoff/*`, `licenses/asset-lab-05h/PROVENANCE.json`.

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

- **Resolution:** `asset-lab-character-human-artist-handoff` @ `c9445ce` is the **active** character-track
  artifact — 8 documents, **0** non-documentation files: artist brief, technical contract (65-joint skeleton,
  bone names, orientation, scale, ground, six clips, GLB/LOD/material conventions), annotated known defects
  with exact evidence paths, acceptance tests, scope of work with non-goals, source and CC0 provenance chain,
  export/runtime guide, evidence index.
- **Standing status:** character integration is **not** authorized; role-wide propagation is **not**
  authorized; D1-B remains unstarted; Asset Lab character work remains separate from production `main`.
- **Fastest diagnostic:** before any character work, read this handoff package and the 05I final report first.
- **Anti-pattern:** resuming generator iteration while a specialist handoff is the open artifact. **Reuse:** P.

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
  tests, the technical contract and the evidence index — branch
  `docs/character-handoff-owner-ruling`, final candidate
  `1dcb263dfaf0398db75fa9cb80ce7e2d948e101c` (Asset Lab repo, remote `backup`; not merged), eight documentation
  files, **0** non-documentation files. Historical 05H/05I reports were **not** rewritten; the evidence index
  now states that their status language is superseded.

**Reusable rule (cross-project).** When a ruling changes an asset's **production status, severity, or scope**,
propagate it through **every independently distributable document in the same governed change**. Reconcile:
ledes · status blocks · verbs · defect counts · severity grades · scope estimates · acceptance tests · technical
contracts · review gates · evidence indexes · supersession notices · integration restrictions.

- Review a handoff as a **packet of standalone documents**, not only as an ordered reading experience — assume
  each page is the only page its reader receives.
- Keep **historical reports preserved**, but make current commissioning documents state **when historical
  readiness language is superseded**.
- When substantial **sculpting, topology, rigging, weight-painting or deformation** work remains, structure the
  commission as **repeatable gated review**, not one-shot delivery: separate gates for art direction, face and
  cranial sculpt, body sculpt, topology, hands, garments, headwear, rig compatibility, weight painting,
  materials, animation, human-scale review and management-camera review, each able to approve, reject, or
  require rework, and each able to repeat.
- **No fixed loop count should be promised or capped.** For this character the **Owner's planning expectation is
  that ten or more review loops may reasonably occur** — that is *iteration capacity*, **not** a guaranteed
  iteration estimate, and not a promise of acceptance after any number of rounds. Each gate repeats on the
  evidence.
- A commissioned artist must be able to **estimate the real work from any standalone scope of work**, without
  relying on undocumented context.
- **Fastest diagnostic:** after any status ruling, grep the whole packet for the superseded framing
  (`finishing correction`, `polish pass`, `minor`, `production-ready`, `viable`, `all viable`) and for the
  **old defect count**; then read each commissioning-facing document **in isolation** and ask whether it alone
  would produce a correct estimate.
- **Pattern:** ruling propagation as part of the ruling commit — every standalone document either carries the
  ruling or prominently references it. **Anti-pattern:** appending a ruling to one lead document while leaving
  contradictory commissioning assumptions elsewhere; leaving "nearly ready", "finishing correction" or "polish
  pass" language in standalone documents after the asset has been rejected; relying on a producer or artist
  reading the packet in a specific order; collapsing sculpt, topology, garments, rigging, weight painting,
  materials, animation, human-scale review and management-camera review into one final gate; promising
  production readiness after one pass. **Related:** **AK**, **AO**, **AQ**, **AR**. **Reuse:** BR, MG, P.
