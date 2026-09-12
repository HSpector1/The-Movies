# BREAK-IT Adversarial Verification — `finale-endless.md`

**Lens:** adversarial game designer + economist. **Verdict: VERIFIED_WITH_CAVEATS.**

The analysis is a presentation/architecture document, not a numeric-economy one, so the
usual exploit categories (loans, cancel-and-reannounce, borrow-to-buy, hoarding, reset
counters) mostly do not apply — and that is itself a legitimate strength worth crediting:
by design there is no score, ladder, or meta-reward surface (Annex M.6's anti-score rule,
correctly cited and consistently applied), which forecloses most of the classic exploit
space before it can exist. The attack surface here is instead: (1) whether the "frozen
forever" guarantee is actually enforced or merely conventional, (2) state-machine/legibility
gaps, (3) edge cases the task explicitly asked for, and (4) evidence fidelity (since a
false comparator precedent is this document's version of a bad arithmetic row). I checked
all four.

---

## Arithmetic / bounds recompute (task requirement)

This section contains no dollar- or week-cost paper-scenario table (unlike the
economy/loan/net-worth sibling sections) — there is nothing resembling e.g. a weekly
overhead ledger to recompute. In its place I recomputed every actual numeric claim the
document does make:

1. **§3.2 evidence-budget example:** "5 refs [qualifying] ... 2 refs [contrary] ...
   listing all 7 refs." 5 + 2 = **7 — correct**, and 7 ≤ 12/12 stays inside the bound.
2. **§4.4 authored-arrival weeks**, quoted from direction G: 1930/1939/1950/1956/1969 →
   520/988/1560/1872/2548 weeks. Recomputed as (year − 1920) × 52: 10×52=520, 19×52=988,
   30×52=1560, 36×52=1872, 49×52=2548 — **all correct**, no transcription error.
3. **§22 bound citations** ("max 16 domains / 8 archetypes / 12+12 refs / 12 lens
   summaries"): verified against `authority/P15-PACKAGE.md:781` ("maximum-16-domain
   manifest") and `authority/P15-BUILDER-ANNEX.md:328,446,450` (archetypes max 8;
   qualifying/contrary max 12 each; lens summaries hard max 12). **All four figures are
   quoted correctly.**

No arithmetic errors found. One real bound-accounting risk, however (see Problem 6 below):
the document's own lens table is not obviously ≤16 domains once "lens" and "sub-view" are
disambiguated, and it never does that accounting explicitly.

---

## Problems (most severe first)

### 1. The "frozen forever" guarantee has no enforced mechanism — only a UI convention (MAJOR)
§4.9 correctly identifies that `CampaignRecord` (`bridge/runtime/campaign-library.ts:18`)
has no `readOnly`/`frozen` field, then **recommends adopting the unenforced option as the
default**: "a frozen, non-advancing 2040 record is a stronger guarantee than a flag...
enforced by simply never re-opening that record for ticking (a UI/product policy)." This
is the single load-bearing invariant of the entire package (direction K: Endless "must not
rewrite the frozen Legacy interpretation"), and the recommended default is a policy, not a
guard. Nothing at the engine level stops a future regression, a modded client, or a mundane
UI bug from wiring "Load → Advance simulation" onto that branch and silently invalidating
every dossier and archetype card ever shown for that studio — the exact failure the whole
manifest-freeze design exists to prevent. The document does flag this as remaining-decision
#5, so it isn't hidden, but it undersells the risk by calling the zero-cost option a
"default" rather than a stopgap.
**Smallest fix:** no schema/library-version bump needed — embed a frozen marker *inside*
the already-opaque `checkpointJson` blob itself (e.g. a `postFinaleMode:'ended'|'archive'`
field written into the checkpoint at the mode-transition event) and have the load/tick path
refuse any advance-simulation command when that marker is present. This is strictly cheaper
than the flagged campaign-library format change and turns "UI never offers the button" into
"the engine refuses the command," which is the actual guarantee direction K requires.

### 2. A recommendation rests on a comparator detail the task itself said was stale (MAJOR)
§4.4's table justifies "P08 awards ceremonies... may still accrue after the frozen trigger"
with: "Civ VII 1.2.0 precedent: non-legacy achievements may still accrue after the frozen
trigger." Tracing this to `comp-finale.md:53`, the only supporting detail is that 1.2.0
lets a player "grab Legacy Path achievements" during One More Turn. But the task prompt
this analyst was given explicitly states: *"Civ VII 1.4.0 replaced Legacy Paths with
Triumphs but kept One More Turn"* — and the digest is more direct: *"Civ VII 1.2.0 lets you
'grab Legacy Path achievements'... WHY STALE: Civ VII 1.4.0 Test of Time... states 'Gone are
the old Legacy Paths, and in their place are Triumphs'... do not cite the Legacy-Path-
achievements clause as current behaviour."* (`_DIGEST.md:298`). The word "Triumphs" and
"1.4.0" never appear anywhere in `finale-endless.md` — the exact caveat the task handed the
analyst was dropped. The parts of the Civ VII citation the document leans on elsewhere (the
infinity-symbol HUD marker, the "No More Turns" named exit, One More Turn continuing at all)
are all confirmed still current through 1.4.0 and are fine; only this one achievement-accrual
detail is contaminated.
**Smallest fix:** drop the "Legacy Path achievements" framing from §4.4's citation; if the
"non-legacy content can still accrue after the trigger" lesson is wanted, re-source it to
Civ VII 1.4.0 Triumphs (confirmed current) rather than the retired mechanic, or simply drop
the comparator citation and let the recommendation stand on the roadmap's own "if the Owner
authorizes" framing (which needs no comparator at all).

### 3. Two terminal states are proposed as distinct choices but declared functionally identical (MODERATE-MAJOR, legibility)
§4.2: *"'End the campaign here' → `ended`; the archive remains fully browsable forever; no
further ticks."* / *"'Browse the archive' → `archive-browsable`; **same as above**, framed
as pure epilogue browsing."* The document's own words say there is no behavioral difference
between these two branches of Annex C.5's three-way split (`archive-browsable / ended /
Endless transition`). This fails the task's explicit legibility test — "can a player explain
the number/stage in one sentence?" — because there is nothing to explain: a player who
clicks the wrong one of two identically-behaving buttons has no way to know it didn't matter,
and an implementer has no spec for what, if anything, "ended" should additionally do (lock
the save slot? forbid ever offering Endless later? nothing?).
**Smallest fix:** either name one real distinction (e.g., `ended` permanently forecloses ever
offering the Endless-transition option on that record again, while `archive-browsable`
leaves the option live for a later session) or collapse the two into a single terminal state
and a single button, since presenting two choices with no stated difference is worse than
presenting one.

### 4. Migration edge case only half-covered: a save already past W_2040 when the system ships (MODERATE)
§3.5/§4.1 thoroughly cover *domain-history* honesty for migrated saves (`recordedFromWeek`,
"no fabricated migration past"), but never address the *mechanical* case the task's own
edge-case list names — "migration from pre-P15 saves" as a scheduling problem, not only a
historiography one: a save whose current week is already greater than `W_2040` the first
time it loads under a build that has the finale. Does eligibility fire on the very next
tick evaluation (retroactively, with no ceremony ever having played out for years of prior
"real" playtime), or does the span shown pretend the game only just reached 2040? Unaddressed.
**Smallest fix:** state explicitly that eligibility is evaluated on the ordinary tick cycle
regardless of how far past `W_2040` a freshly-migrated save already is, and that the frozen
span's end date is the week eligibility actually evaluates true — never backdated to a
calendar 2040 the player's save has already passed.

### 5. No atomicity guarantee across the eligible → source-frozen save boundary (MODERATE)
The document states the *interpretation* step is a pure, idempotent function (good — a
re-render can't reroll), but never states that the *freeze itself* ("eligible →
source-frozen") is atomic with respect to save/load. If a save can be captured strictly
between "eligibility became true" and "manifest sealed," a reload could re-evaluate against
a world state that has since ticked further (new releases, a rival closure that fired in
the interim), producing a manifest that differs from what an uninterrupted playthrough would
have sealed — silently, with no error, exactly the "save/load mid-settlement" edge case the
task named.
**Smallest fix:** one sentence stating the eligible→source-frozen transition commits within
the same tick/save write as the eligibility check, so no save file can ever observe (or
reload into) a half-frozen state.

### 6. Duopoly / "zombie rival" degenerate market case unaddressed (MODERATE)
Direction G forbids synthetic replacements once authored arrivals are exhausted, and the
accepted-code fact block confirms rivals below `operatingReserve` "simply stop committing and
can run negative forever" — i.e., a rival can zombie indefinitely without ever producing the
formal closure event the ceremony's "rivals rising & falling" beat (§2.3/§2.1 beat 6) and the
"market dominance periods" lens (§3.1) are keyed to. A 2040 dossier for a run that has
attrited to a near-monopoly (player + one zombie or one genuinely dominant survivor) has no
stated honest degrade for "too few comparable rivals to characterize a dominance period" —
only "insufficient snapshot history" (a *data*-availability degrade, not a *market-shape*
degrade). Left implicit, a string of quarterly snapshots all showing 90%+ share for decades
can visually read as an implicit score even though the anti-score rule forbids one.
**Smallest fix:** extend the existing honesty degrade to also cover "too few active
comparable rivals in this period" as its own named case, distinct from "history not
recorded before week N."

### 7. Endless-era evidence ID namespace never stated (MINOR-MODERATE)
§4.5's "second `LegacyFinaleSnapshot`-shaped record... keyed to its own `triggerWeek`
window" implies but never states that post-2040 `FilmId`/`PersonId`/etc. continue drawing
from the *same* P07/P12/P08 sequences as pre-2040 content. Left unstated, an implementer
could reasonably (and wrongly) start a fresh counter for the "Endless record," creating a
collision risk the moment any Endless-era view cross-references pre-2040 evidence (e.g. an
"all-time highest grosser" comparison spanning both eras).
**Smallest fix:** one sentence: Endless-era IDs are continued draws from the existing
identifier sequences, not a new namespace; only the *presentation record* is second, not the
identifier space.

### 8. "End Endless Play" reversibility is undefined (MINOR)
§4.3 borrows Civ VII's "No More Turns," which is itself just a turn-counter stop that does
not prevent further free-form play — but the document's own gloss, "stops the session
cleanly without implying any retroactive effect," is ambiguous between "pause, resumable
later" and "a second hard terminal lock." If it's the latter, does exiting Endless create
its own frozen record analogous to §4.1's list, or does the live simulation simply stop
accumulating?
**Smallest fix:** state explicitly whether "End Endless Play" is resumable (most consistent
with the Civ VII precedent it cites) or a second one-time freeze.

### 9. No tie-break for a same-tick race between calendar-2040 and player-terminal-bankruptcy triggers (MINOR)
§2.4 treats "the campaign's own terminal ending" (player bankruptcy) and "the 2040 ceremony"
as if temporally separable ("before week `W_2040`"), but doesn't say which trigger wins if
both become eligible in the same tick evaluation.
**Smallest fix:** define an explicit evaluation order (e.g., player-terminal eligibility is
checked before the calendar trigger within a tick), so the outcome is deterministic rather
than dependent on code layout.

### 10. Three code citations are off by enough to fail a spot-check (MINOR, evidence-fidelity)
Checked against the accepted snapshot directly:
- `CampaignRecord` shape cited at `bridge/runtime/campaign-library.ts:17` — the type alias
  is actually on **line 18**.
- The "Current campaign copied; the copy is now active" message cited at
  `bridge/runtime/campaign-library.ts:229` — line 229 is `case 'saveAs': {`; the quoted
  string is actually inside the message map on **line 255**. Line 229 does not contain the
  quoted text at all.
- The `dateLabel` projection cited at `bridge/runtime/campaign-library.ts:44-48` — the
  `summary()` function does start at line 44, but the `dateLabel` field itself is set on
  **line 51** (`campaignDate` call is line 49), just outside the cited range.
None of these change the underlying facts (all three code behaviors are real and correctly
described), but the task's own method rule ("cite file:line when you rely on code") is meant
to let another reader spot-check without re-deriving the claim, and two of these three
citations currently point at the wrong text.
**Smallest fix:** correct to line 18; line 255 (or cite the whole `saveAs` case, 229-235,
plus 255 for the message); and lines 44-51.

---

## Missing items

- No handling for a migrated save whose current week already exceeds `W_2040` on first
  load under the finale-bearing build (Problem 4).
- No atomicity statement for the eligible→source-frozen transition across a save boundary
  (Problem 5).
- No honesty degrade for "too few comparable active rivals" distinct from "history not
  recorded" (Problem 6).
- No statement that Endless-era evidence IDs share the pre-2040 identifier sequences
  (Problem 7).
- No reversibility statement for the "End Endless Play" exit (Problem 8).
- No explicit tie-break for a same-tick calendar-vs-player-bankruptcy race (Problem 9).
- No explicit domain-vs-sub-view accounting against the §22 16-domain cap — the lens table
  pairs several lenses with named "sub-views" (Rivals + entry/closure sub-view; People +
  relationship sub-view) without stating whether each sub-view consumes one of the 16 slots;
  worth an explicit count before implementation approaches the cap silently.
- The document never revisits or corrects itself on the one stale Civ VII 1.2.0 detail
  (Problem 2), despite the task prompt naming that exact correction as a required input.

## Strong points

- The anti-score rule is applied with real teeth, not just quoted: archetype ordering by
  stable ID rather than "best first," no blended aggregate even for internal sort order, and
  loss/failure treated as first-class content — this genuinely forecloses most of the
  exploit space a "break it" pass would otherwise look for (there is no ladder to game).
- Every numeric bound the document cites (16 domains, 8 archetypes, 12+12 refs, 12 lens
  summaries) was independently verified against `P15-PACKAGE.md` and `P15-BUILDER-ANNEX.md`
  and is quoted correctly, including exact line anchors.
- The reuse of existing engine primitives (Save As, `campaignDate`/`dateLabel`) instead of
  inventing new schema is appropriately conservative, and the document is honest that this
  is a stopgap rather than overselling it as a complete solution (see Problem 1's own
  caveat, which the document itself raises as remaining-decision #5 — I am sharpening that
  caveat, not introducing a new one).
- The "not recorded before week N" honesty rule is applied consistently and correctly to
  every one of the Owner-listed dossier items, including the two domains that don't exist
  yet (romance, Awards) and the one that's a hard prerequisite gap (Power Ranking archive
  for "dominance periods") — no domain is silently glossed as complete.
- The player/rival-failure symmetry case (§2.4) correctly identifies that an early
  player-bankruptcy ending should reuse the same finale state machine rather than a second
  ad hoc "game over" screen, which is the right generalization of lesson L1 and avoids a
  plausible source of divergent, buggy "two ways to end the game" code paths.
- Quoted evidence (Prima "you get, well, nothing," p.80/PDF 81; GearCity's "not much
  post-2020 testing... some things might start disappearing," MEDIUM-HIGH; Civ IV's
  "impossible to win another victory type") all check out verbatim and at the correct,
  digest-corrected page/tier against the phase-1 sources.
