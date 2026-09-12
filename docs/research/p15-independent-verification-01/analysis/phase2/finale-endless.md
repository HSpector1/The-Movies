# P15 Phase-2 Analysis — Section 11: 2040 Finale + Endless Sandbox Presentation Principles

**Analyst:** independent research analyst (paper scenarios only; nothing implemented)
**Date:** 2026-09-11
**Directions in scope:** J (2040 finale = ceremony + interactive Legacy dossier) and K (post-2040
Endless Sandbox). Owner-selected direction is SETTLED; this report proposes presentation principles
inside it and does not reopen the archetype model, the multi-factor Power Ranking, or the loan/distress
math — those belong to sibling P15 sub-packages and other Phase-2 sections.

Evidence base: `comp-finale.md` + its two verification passes (`comp-finale.completeness-overclaim.md`,
`comp-finale.source-fidelity.md`), `orig-ending.md` + its two verification passes, `P15-PACKAGE.md`
§§12.4/15.4/20/22/23, `P15-BUILDER-ANNEX.md` §§C.5/D.6/M.6/N.5/O, `P13-P15-LONG-RANGE-ROADMAP.md`
§§18/20/21, `P13-P15-OWNER-RULINGS.md` §4, and the accepted code snapshot
(`docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md`, `docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md`,
`bridge/runtime/campaign-library.ts`, `ui/src/engine/adapter.ts`). Every corrected verification caveat
from the digest is folded in; superseded prior text is labelled.

---

## 1. What is SETTLED versus what this report may still shape

Owner direction J and K settle the shape (ceremony + dossier; frozen 2040 + optional Endless Sandbox
that never rewrites the frozen record) but leave the *presentation and boundary mechanics* open. Per
the task's own SUPERSEDED-labelling rule, three prior-package rows must be marked now, before anything
else is built on top of them:

| Prior text | Status | Why |
|---|---|---|
| P15-PACKAGE §23 "Endless Mode: Owner chooses after finale prototype; no default" | **SUPERSEDED BY OWNER DIRECTION K** | The Owner has chosen: Endless Sandbox exists, frozen-record/never-rewrite. Remaining work is *how*, not *whether*. |
| P13-P15-OWNER-RULINGS §4 "Post-2040 Endless Mode remains undecided. P15 may not silently create or authorize it." | **SUPERSEDED BY OWNER DIRECTION K** | Predates the 2026-09-11 direction; is the exact ruling direction K revises. |
| P13-P15-LONG-RANGE-ROADMAP §21 "No P13–P15 document assumes option 3 [Endless Mode]" | **SUPERSEDED BY OWNER DIRECTION K** | Option 3 is now authorized; the roadmap's own checklist (catalogue supply, entrant/retirement generation, era presentation, market normalization, awards cadence, balance, save compatibility, achievements) is **CONFIRMED** correct and used throughout §4 below. |

Everything else this report touches from the prior package — the finale lifecycle state machine
(§12.4/Annex C.5), the manifest bound (§22: max 16 domains / 8 archetypes / 12+12 refs / 12 lens
summaries), the dossier opening order (§15.4/Annex M.6), the anti-score rule (Annex M.6), and the
accessibility rules (Annex N.5, §20) — is **CONFIRMED** and adopted as the frame for this section.
Comparator evidence (`comp-finale.md`, corrected) is used to fill the *how*, never to reopen the *what*.

---

## 2. (a) The CEREMONY

### 2.1 What it celebrates, and why the order matters

The strongest comparator lesson (L1, `comp-finale.md` §8, CONFIRMED across Civ IV's manual, Civ VI
Gathering Storm's Hall of Fame, and OpenRCT2's `Scenario.cpp`/`ScenarioObjective.cpp` set-once guard)
is: **the official record is written exactly once, at the trigger, before any presentation runs.**
This maps directly onto Annex C.5's state machine:

```text
not-due → eligible → source-frozen → interpreted → presented → archive-browsable / ended / Endless transition
```

The ceremony is the **presented** state, nothing earlier. It must never compute; it only narrates
what `source-frozen`/`interpreted` already wrote into `LegacyFinaleSnapshot` (Annex D.6). This is the
practical meaning of "the ceremony references the frozen manifest": every sentence the ceremony speaks
must resolve to a `usedEvidenceIds` entry already sealed before the ceremony script ever runs, exactly
as P15-PACKAGE §22 forbids "generated finale prose as primary truth."

**Recommended celebration order** (adapting Annex M.6's dossier opening hierarchy to a linear ceremony
beat, and Civ VII's "emphasize the journey" endgame-celebration principle, `comp-finale.md` §2 row
"Civ VII Test of Time," OFFICIAL COMPARATOR DOC, HIGH):

| Beat | What it shows | Source law it reads | Comparator precedent |
|---|---|---|---|
| 1. Span & completeness | Studio identity, 1920–[trigger week] span, `recordedFromWeek`/completeness flags | `sourceManifest` | Annex M.6 item 1 |
| 2. Archetype cards (plural, order stable by archetypeId, not by "best first") | Up to 8 nonexclusive archetype cards, each already carrying qualifying + contrary refs | `archetypes[]` | Roadmap §18 archetype list; Annex D.6 |
| 3. Defining films/people/rivals/eras | The lens summaries the interpretation reducer already froze (max 12) | `usedEvidenceIds` | Annex M.6 item 3 |
| 4. Best period / worst period, named | A "Golden stretch" and a "Crisis" window, each with evidence, no score | derived from finance/market/standing lenses, frozen | CivFanatics 698177 "designated Golden Age" request (digest-corrected: one small 7-user thread, illustrative not a demand measure, MEDIUM) |
| 5. Setbacks and recoveries | P15B events if approved; explicit incompleteness if not | `unresolvedDomains` | Direction J: "financial highs and crises... bankruptcies & recoveries" |
| 6. Rivals as history | Runner-up recognition, links to their own frozen or closed profiles | cross-studio evidence refs, never a leaderboard | Same thread's "runner-up recognition" request vs. the OpenTTD title-ladder anti-pattern (HIGH) |
| 7. Post-finale choice | The Owner-approved mode options, presented, not defaulted | `postFinaleMode` (absent until committed) | Annex M.6 item 7; Civ VII 1.2.0 "No More Turns" named exit |

This order is a **ceremony-level rendering choice**, not new persisted state — it reads the same
manifest Annex M.6 already specifies for the dossier, just paced as a sequence rather than browsed as
cards. That keeps the ceremony inexpensive: it is a presentation layer over an already-frozen manifest,
with no independent computation path to diverge from the dossier.

### 2.2 How the ceremony references the frozen manifest (mechanically)

- The ceremony's script is a pure function of `LegacyFinaleSnapshot` — same input the dossier reads.
  There must be exactly one reducer that turns `sourceManifest` + `usedEvidenceIds` into both the
  ceremony beats and the dossier cards, so the two surfaces cannot drift (Annex P.2's "client contains
  no formula... calculation" rule extended: neither may the ceremony script).
- Every quoted number/name in the ceremony carries the same source-linkable ID the dossier card for
  that fact carries. A ceremony line without a resolvable `usedEvidenceIds` member cannot be authored;
  this is the direct ceremony-level reading of P15-PACKAGE §22's "manifest retains only evidence IDs
  actually used."
- If a domain is incomplete (`unresolvedDomains` nonempty, or `recordedFromWeek` interior to the span —
  e.g. a migrated campaign, per the digest's migration-origin caveat: origin===`migration` rivals have
  no authored pre-recording history and the validator forbids a "fabricated migration past"), the
  ceremony states the gap in the same voice as everything else rather than silently omitting the beat.
  This directly answers Prima's own worst failure mode: a studio that misses every Achievement Award
  "gets, well, nothing" (Prima p.80, PDF 81) — the successor's ceremony gives every studio a dignified,
  complete beat sequence regardless of archetype count, including zero.

### 2.3 How rivals and closed studios appear

Direction J requires the ceremony to acknowledge "rivals rising & falling," and direction D requires a
closed rival's "films, people, awards, releases, events" to remain accessible forever with StudioId and
identity never recycled. The ceremony beat 6 above (Rivals as history) is the mechanism:

- Active rivals at the trigger week appear as **comparative context**, never a ranked list (Annex M.4's
  persistent banner — "Power Ranking is recent comparative momentum... Standing and History are
  separate" — is the house style to reuse verbatim in ceremony captioning).
- Closed rivals appear the same way active ones do, with their closure event dated and evidence-linked
  (`CorporateConditionEvent`, Annex D.5, once P15B exists) rather than erased or footnoted. This is the
  direct reading of direction D ("historic identity NEVER disappear or recycle") applied to ceremony
  copy, not just database rows.
- The ceremony never states or implies "you won"; per Annex M.6 there is no "winner" field to read from.

### 2.4 A studio that failed EARLIER (mid-campaign closure/bankruptcy) treated at the 2040 ceremony

Two cases:

1. **A rival that failed before 2040.** Its historical record participates in the ceremony's "rivals
   rising & falling" beat exactly as any other closed rival (§2.3). Nothing about mid-campaign timing
   changes its treatment — the frozen manifest cites it by dated events, and the ceremony narrates those
   events without re-litigating them.
2. **The player's OWN studio, if direction E's player-bankruptcy path fires before 2040.** This is the
   harder case, and the comparator evidence gives a clean precedent: Civ IV's manual states victory or
   defeat is a single trigger after which "it is also impossible to win another victory type," and
   further play does not mutate the Hall of Fame (`comp-finale.md` §2, OFFICIAL COMPARATOR DOC, HIGH).
   Applied here: if the player studio reaches a terminal bankruptcy state (a separately Owner-gated
   experience per P15-PACKAGE §23's "player closure" row) **before** week `W_2040`, the campaign's own
   terminal ending — not the 2040 ceremony — is the authoritative finale for that run, and it must use
   the **same** manifest-freeze mechanics (source-frozen → interpreted → presented) rather than a
   separate ad hoc "game over" screen. There is only ever one finale lifecycle state machine; an early
   player-bankruptcy ending is that same state machine triggered by a different eligibility condition
   (bankruptcy-final rather than calendar-2040), not a second, undocumented ending path. This is a
   **structural recommendation**, not a reopening of the settled bankruptcy design (owned by P15B/E);
   it only says the finale *presentation* machinery must be shared, echoing lesson L1 (write the record
   once, at whichever trigger actually fires first) and preventing two divergent implementations of
   "how do we show a studio's life story."

### 2.5 Accessibility and reduced motion

Annex N.5 and P15-PACKAGE §20/§24 journey 24 already state the house rule for this surface family:
"Reduced motion removes rank/graph flourishes and finale camera movement" (P15-PACKAGE:744) and
"reduced motion removes graph tween/rank movement/finale flourish" (Annex:1007) — both explicitly name
the finale. Applied to the ceremony specifically:

- Every ceremony beat has a static, text-first equivalent; the pacing/animation layer is strictly
  additive presentation, never a carrier of information not also in the static card (Annex N.5's "chart
  cursor announces date/value/reason and has list equivalent" generalized to ceremony beats).
- No camera move, pan, or flythrough is required to reach any fact; reduced motion collapses transitions
  to instant cuts, per the journey-24 acceptance criterion, and the ceremony remains fully legible as a
  sequential list.
- Screen-reader summaries follow Annex N.5's existing pattern (describe current fact, source, and
  incomplete-history notice) applied per beat rather than per chart.
- 200% text scaling must not clip any beat's reason/consequence text (Annex N.5, §20), and narrow width
  collapses the ceremony to the same one-column card list the dossier uses (§20 narrow-layout rule) —
  i.e., the ceremony and the dossier should be able to share one responsive component tree, reducing
  the chance the two surfaces disagree about what a given fact says.

---

## 3. (b) The INTERACTIVE LEGACY DOSSIER

### 3.1 Information architecture

Annex M.6's opening hierarchy is CONFIRMED as the spine (identity/span → archetype cards → defining
films/people/rivals/eras → awards/technology/finance/market/resilience lenses → setbacks/gaps →
source-linked chronology → post-finale option). This report's addition is to name the **lens set**
against every item direction J actually lists, and to state — per the task's explicit instruction —
how each lens degrades honestly given what 592e926 does and does not implement.

| Owner-listed dossier item (direction J) | Dossier lens | Evidence source when it exists | Status at 592e926 / honest degrade |
|---|---|---|---|
| Biggest films | Films lens (mandatory released-film catalog, §15.4/§22 — not a legal-library/ownership model) | P07 result + P12 release identity | Available once P07/P12 exist; top releases by frozen, non-recomputed result (Annex M.3 "no live recomputation") |
| Biggest failures | Films lens, failure sub-view | Same identities, worst outcomes | Same as above; a frozen fact display, never a second score |
| Legendary Actors/Directors/Writers | People lens | P10/P14 career facts | Available once P10/P14 career history exists; each name links to its career record, not a rating |
| Famous collaborations | People lens, relationship sub-view | P14B sparse work-derived collaboration graph ("production pairs... event refs," ROADMAP §19.2, no social-sim spam) | Available once P14B ships; cites shared productions, never a "chemistry score" |
| Romances (only public/relevant) | People lens, relationship sub-view | **P14 relationships/romance are NOT approved** (parked deferral, per task framing) | **Domain does not exist.** Render exactly like any other unimplemented domain — a typed `legacyEvidenceIncomplete`/"not recorded" notice (Annex O), never a placeholder or silently missing tab. If ever approved, it becomes one more evidence-linked relationship type inside the same People lens, gated "public and relevant" the way §13.3's no-hidden-data contract already gates everything else |
| Rivalries | Rivals lens | P12 identity + market/standing head-to-head history | Degrades to "insufficient comparable history" per the same completeness law as Power Ranking (Annex O `rankingNotAvailable`) |
| Awards/honors | Awards lens | P08 | **Awards simulation does not exist at 592e926 — stub only (P08B blocked).** Explicit "not recorded" per domain, never a silently empty tab |
| Financial highs and crises | Finance lens | P11 ledger (peaks, CONFIRMED live) + P15B distress events (not yet built) | *Peaks* derivable now from P11; *crises* (direction D/F ladder) only once P15B ships — until then, peaks only, with an explicit "crisis sub-view not yet recorded" note |
| Technology leadership | Technology lens | P13 adoption/first-use/standardization | **P13 not implemented.** An entire "not recorded" domain — must not imply "no leadership occurred" |
| Studio growth | Facilities lens | Facility placement/capex/decay history (engine, live) | Available now: capex and facility count over time are already persisted |
| Bankruptcies/recoveries | Resilience lens | P15B `CorporateConditionEvent` (Annex D.5), once approved | Not yet built; degrades the same way |
| Rival studios that rose/fell | Rivals lens, entry/closure sub-view | P12 entry/closure receipts (entry live per R05 authored arrivals; closure not yet built, direction D) | Entries recordable now; closures degrade to "not recorded" until P15B/D ships |
| Market dominance periods | Market/Power lens | Power Ranking archive (P15A.2) | **Prerequisite gap, not a missing feature:** only two `HollywoodChartSnapshot` periods retained today (digest-CONFIRMED) — a "dominance period" needs a retained quarterly archive first, a named **P15A.2 prerequisite**; dossier says "insufficient snapshot history" rather than reconstructing from live state |
| Major acquisitions, if they exist | Acquisitions lens (conditional) | Whatever package direction I ultimately assigns | Entirely conditional on direction I's boundary research (§6); if M&A never ships, the lens is absent, not a stub — Annex M.6's own "if they exist" framing already anticipates this |
| Legacy archetypes | Archetype cards (top of dossier) | Interpretation reducer over the above | Governed by the max-8/12+12/12-lens-summary bound (§22); nonexclusive, no score |

### 3.2 Card and lens shape (concrete, PROVISIONAL illustration)

The following is a **HYPOTHETICAL, PROVISIONAL** worked example of one archetype card's evidence
budget, to make the §22 bound concrete — the studio name, film titles, and numbers are invented for
illustration only and are not claims about actual game content:

| Field | PROVISIONAL example content | Bound (P15-PACKAGE §22) |
|---|---|---|
| `archetypeId` | `technologyPioneer` | 1 of ≤8 authored archetype IDs |
| `qualifyingRefs` | 5 refs: first-adoption event (Technicolor-analog, hypothetical), 3 top-grossing tech-forward films, 1 industry-standardization event | ≤12 |
| `contraryRefs` | 2 refs: a costly failed early-adoption production, one multi-year gap with no new adoption | ≤12 |
| `confidence/completeness` | "complete since Week 104; technology domain not recorded before P13 ships" | required field, honest |
| Card rendering | headline archetype name + 1-line qualifying summary + 1-line contrary summary + "see evidence" expansion listing all 7 refs by source link | no hidden aggregate score |

This illustrates why the bound matters: a studio could in principle *earn* far more than 12 qualifying
facts over 120 years; the manifest keeps only the evidence an interpretation actually *used*, which is
also why the dossier must show its incompleteness honestly rather than imply "these are the only good
things that ever happened" (Annex D.6 `usedEvidenceIds`: "only stable IDs actually cited... never every
history ID").

### 3.3 Timeline with best/worst period

A single chronology view (not a duplicate of P08 History, but a source-linked merge, per
P15-PACKAGE §22's cross-domain manifest) with two explicitly labelled bands overlaid — "Golden stretch"
and "Crisis" — each pointing at the evidence that earned the label (market/finance/awards peaks and
troughs respectively). This directly answers the CivFanatics-sourced request for a "designated Golden
Age" (`comp-finale.md` §5, MEDIUM community, one small thread) **without** adopting a numeric score: the
band is a *named era* backed by facts, not a computed rank, matching Civ VI's Historic Moments pattern
(dated, typed, always-open — `comp-finale.md` §5, HIGH for existence) rather than OpenTTD's title-ladder
anti-pattern (a 0–1000 rating mapped to seven titles — HIGH, the explicit counter-example the dossier
must avoid, Annex M.6 "No... letter grade... GOAT meter").

### 3.4 The claim → evidence provenance rule

Every sentence, card, or lens value in the dossier must resolve to one or more entries in
`usedEvidenceIds`, each an immutable ID (`FilmId`, `PersonId`, `AwardOutcomeId`, `IndustryEventId`, …
per §13.2) already present in `sourceManifest` before the dossier renders. Concretely:

1. The interpretation reducer runs once, at `source-frozen → interpreted` (Annex C.5), and is the
   *only* place archetype/lens content is computed.
2. The dossier (and the ceremony, §2.2) are pure renderers of the resulting `LegacyFinaleSnapshot`;
   neither may recompute, reorder by a hidden weight, or synthesize a sentence not backed by a ref.
3. A UI element with no resolvable evidence ref cannot be authored — this is the same discipline Annex
   P.2 already requires client-side ("no formula, decay, rank, status, closure, or archetype calculation"
   in the client) extended explicitly to prose generation.
4. Prose *summaries* (e.g., "This studio built its reputation on musicals in the 1930s") are a
   **Derive**, not a Fact — the Annex's Derive table already marks "generated finale prose/layout" as
   Derive, not truth (digest-corrected locator: Annex C.5, not the report's original mis-cited E.7).
   Derived prose must never be persisted as if it were sourced fact, and re-deriving it from the same
   frozen manifest must be idempotent (same inputs → same sentence), so a re-render is not a re-roll.

### 3.5 The "not recorded before week N" honesty rule

Two related but distinct honesty mechanisms already exist in the accepted design and should be reused
verbatim rather than reinvented per lens:

- **Domain-level:** `recordedFromWeek`/`completeness` on every `SourceDomainOrderingManifestEntry`
  (Annex D.6) states, per domain, from which week that domain's history is trustworthy — this is the
  general form of the Annex O `historyNotRecorded` error ("Shared-market history was not recorded
  before Week <N>. Show forward facts only; no backfill.") applied to every dossier lens, not only
  Shared Market.
- **Whole-run level:** for a migrated save, the dossier must say the run began (or was recorded) from
  the migration boundary and never fabricate a pre-migration history — this generalizes the
  migration-origin rule already enforced for rivals (origin===`migration` rivals have no authored films
  and the validator forbids "a fabricated migration past," per the digest) to the player's own Legacy
  dossier: a migrated campaign's dossier states plainly "recorded from Week N (migrated save); earlier
  history was not recorded," exactly the Annex O `legacyEvidenceIncomplete` wording pattern ("Name
  domains and recorded-from boundaries").

Both mechanisms are the same design already used for the digest's own strongest caution: **do not let
absence read as negation.** A "not recorded" domain must never render as "this never happened" — Prima's
own lesson (its research-pack table simply stops in 1999, and the game's own 1999–2005 "tail" is
otherwise unlabelled — `comp-finale.md` §1 row 7, digest-corrected: not literally "nothing new," since
ceremonies/Achievement unlocks/taste shifts continued, but no *new authored content* arrived) is what the
successor must NOT repeat: label the gap, do not let it pass silently.

### 3.6 The anti-score rule

Verbatim house law, already settled and reused here without modification (Annex M.6): *"No 'overall
92,' letter grade, world rank, winner, GOAT meter, or meta-power reward."* Three concrete
implementation consequences follow directly from the comparator evidence:

1. **No blended aggregate anywhere in the dossier**, even an unlabelled one used only for sort order —
   this is the same law P08's Standing and P15A.2's Power Ranking already enforce (SAF-012's "do not
   add a fourth field to frozen Standing," P12A register :236) applied to the dossier's own internal
   ordering; archetype cards are ordered by a stable ID, never by a hidden score (§3.1 table, "order
   stable by archetypeId, not by 'best first'").
2. **No score-to-title ladder.** OpenTTD's 0–1000-rating-to-seven-titles pattern
   (`comp-finale.md` §5, HIGH) is the explicit anti-pattern; an archetype is a *nonexclusive label with
   attached evidence*, never a tier computed from a hidden number.
3. **Loss and gaps are first-class content, not penalties.** Direction J explicitly wants "biggest
   failures... crises... bankruptcies" acknowledged; the comparator lesson (Civ VII's "Make Losing Fun"
   framing, `comp-finale.md` §5 — digest-corrected to an OFFICIAL dev-diary framing claim, not a proven
   player-reception fact) supports showing failure with the same visual grammar as success, never a
   muted/red/shamed treatment that implies a penalty score exists underneath.

---

## 4. ENDLESS SANDBOX

### 4.1 What is frozen at 2040 (exact list)

Per direction K and Annex C.5/D.6, exactly the following is frozen at the moment the finale reaches
`presented` and the player selects an Endless-continuing `postFinaleMode`:

| Frozen element | Field | Why it must be frozen (comparator law) |
|---|---|---|
| The source snapshot | `sourceManifest` (per-domain revision, ordering version, `recordedFromWeek`, completeness) | L1: write once at the trigger |
| The archetype set | `archetypes[]` (≤8, with `qualifyingRefs`/`contraryRefs`) | Civ IV: "further accomplishments will not be recorded" on the frozen record |
| Completeness/incompleteness notices | `unresolvedDomains` | Prevents later play from quietly "completing" a gap that was honestly marked open at 2040 |
| Interpretation/presentation version | `interpretationVersion`, dossier presentation version | So a later UI redesign cannot be mistaken for the historical dossier having changed its verdict |
| The chosen mode event itself | `postFinaleMode` | Annex C.5: "one explicit mode event; no implicit continuation" |

Everything in this list is **read-only forever** after the freeze. Nothing Endless play does — no new
film, no new archetype-qualifying fact, no new rival closure — may append to, re-rank, or silently
supersede this manifest. This is the literal meaning of direction K's "must not rewrite the frozen
Legacy interpretation."

### 4.2 The one-time mode transition event

A single, named, player-chosen, irreversible event recorded at `presented → archive-browsable / ended /
Endless transition` (Annex C.5). Recommended concrete choices, modelled on the industry's cleanest
precedent — Civ VII 1.2.0's explicit button plus persistent state marker rather than Victoria 3's
confusing "Switch Country" UI workaround (`comp-finale.md` §6, "UI workaround rather than design" row,
CONFIRMED as a comparator anti-pattern):

- **"End the campaign here"** → `ended`; the archive remains fully browsable forever; no further ticks.
- **"Browse the archive"** → `archive-browsable`; same as above, framed as pure epilogue browsing.
- **"Continue in Endless Sandbox"** → the Endless transition; simulation ticking resumes under the
  post-2040 policy (§4.4).

This choice is made *once*, presented on the finale screen itself (not buried in a settings menu), and
recorded as a dated fact — exactly the ceremony beat 7 in §2.1's table.

### 4.3 HUD mode marker and named exit

Civ VII 1.2.0's pattern — an always-visible Age Progress indicator that becomes a persistent infinity
symbol after the victory trigger, plus a named "No More Turns" exit — is the strongest inspected
precedent (`comp-finale.md` §8 L3, OFFICIAL, HIGH) precisely because it prevents the exact failure mode
Victoria 3 exhibits (players confused whether "Switch Country" play still counts, `comp-finale.md` §3,
COMMUNITY, MEDIUM). Recommended:

- A **permanent HUD element**, visible at all times during Endless play, reading something in the shape
  of `Endless Sandbox — post-2040 play, legacy frozen [dateLabel of trigger week]` (reusing the existing
  `campaignDate`/`dateLabel` projection the engine already computes for save summaries,
  `bridge/runtime/campaign-library.ts:44-48`).
- A **named exit** ("End Endless Play" or similar) that stops the session cleanly without implying any
  retroactive effect on the frozen 2040 dossier — exiting Endless is not a second finale trigger.

### 4.4 What continues, and what does not

| Continues in Endless | Frozen / does not continue |
|---|---|
| The simulation itself (ticking, production, hiring, releases) | The 2040 `LegacyFinaleSnapshot` and every archetype/lens it contains |
| P08 Standing (a live, permanent, ever-updating record per its own package law) | The *2040 dossier's* archetype cards — Endless play cannot add an archetype to the 2040 card set |
| P15A.2 Power Ranking, if the Owner wants ongoing quarterly publication (Stellaris precedent: "victory... is of little concern... players may continue normally," `comp-finale.md` §3, HIGH, cited as support for low-stakes continuation) | Any 2040-dossier reference to Power Ranking — that reference is to the archived pre-2040 snapshots only |
| P08 awards ceremonies, if the Owner authorizes their continued cadence (Civ VII 1.2.0 precedent: non-legacy achievements may still accrue after the frozen trigger) | The 2040 ceremony itself — it does not replay or re-fire |
| P12/P15B rival entry, distress, and (per §4.6) failure | The authored P12 arrival list (weeks 0×4, 520, 988, 1560, 1872, 2548) — direction G's "no synthetic replacements" law continues to apply post-2040 exactly as pre-2040; Endless does not relax it |

### 4.5 Endless gets its own dated, dated-separate record set

Direction K is explicit that Endless must not merge into the frozen dossier. The concrete mechanism:
a **second** `LegacyFinaleSnapshot`-shaped record (or an explicitly `postFinale`-tagged extension of the
same shape) keyed to its own `triggerWeek` window, generated only if/when the Owner authorizes a
post-2040 presentation surface at all. Its cards must carry a visibly distinct label —
**"Endless Sandbox record, post-[trigger date]"** — and the two record sets are never interleaved in a
single chronology view without a hard visual boundary (`comp-finale.md` §9b.7, CONFIRMED as best
practice: "Label the two histories distinctly... never interleave... without a hard visual boundary").
This is the direct application of FM26's cautionary tale (reducing/merging visible history produced the
sharpest community backlash found in the whole comparator sweep, `comp-finale.md` §5 L11, MEDIUM) run in
reverse: keep both, but never let them blur into one interpretation.

### 4.6 Era/technology content policy after the authored catalogue runs out

Roadmap §21's checklist (CONFIRMED by the comparator failures in §4.7) names exactly the axis this
report must resolve: catalogue supply, era presentation, and balance support post-2040. `comp-finale.md`
§9b.5 lays out three honest, evidence-backed policies; this report adopts all three as a **named,
labelled menu** rather than picking one irrevocably, because P13 (which owns the technology catalogue)
is not yet built and should not be pre-committed past its own future Owner decisions:

| Policy | Mechanism | Comparator precedent | Recommended status |
|---|---|---|---|
| **Freeze at last authored era (default)** | No new authored technology after the 2040 (or P13's actual last-authored) horizon; existing methods remain valid; no supersession events fire | OpenTTD's "Never expire vehicles" setting — freezes at peak, does not fabricate anything new (`comp-finale.md` §4/§9b.5, OFFICIAL wiki, HIGH) | **Default policy.** Cheapest, most honest, matches the original's own unlabelled 1999–2005 tail but *labelled* this time |
| **Repeatable generic stub** | A small number of explicitly-generic, incrementally-scaled sinks (never given fabricated proper names/dates) for systems that need something to do post-catalogue | Stellaris repeatable tier-5 techs; Civ Future Tech (`comp-finale.md` §3/§4, OFFICIAL wiki, HIGH) | Optional, per-system, only where a genuine "nothing left to spend on" dead-end would otherwise result |
| **Procedural future — disclaimer required** | A separately-authorised generator producing plausible-but-fabricated post-catalogue content | GearCity's "random history mode" — developer's own words: "not much post-2020 testing... some things might start disappearing" (`comp-finale.md` §4, developer statement, MEDIUM-HIGH) | Permitted only with a persistent in-UI disclaimer that content is non-historical and less-tested, and **never** exposed inside the archive as if it were recorded history — this is the accepted-code ruling's own "plausible alternate-future progression" clause (`docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md:33-34`), permitted but not required |
| **No fabricated future history** (hard rule, not a policy option) | — | GearCity's own admission that its procedural mode is under-tested; the roadmap's own "No P13–P15 document assumes option 3" caution generalized | Applies regardless of which of the three above is chosen: nothing presented as *recorded history* may be invented |

### 4.7 How P13 (not yet built) should plan for this

Because P13 owns the technology catalogue and is unbuilt, the concrete, *actionable* planning
requirement this report can state without reopening P13's own design is: **P13's catalogue schema must
carry an explicit "last authored era" boundary field and support the freeze policy (§4.6 row 1) as its
zero-cost default**, so that shipping P13 with, say, technologies authored only through the 1990s–2030s
does not implicitly create an unlabelled dead zone the way the original's 1999–2005 research gap did
(`orig-ending.md` §1.1 row 3, PRIMA, HIGH — "last research pack natural unlock 1999... nothing... unlocks
in 2000–2005"). This is a **structural correction worth naming now**: if the successor repeats the
original's exact failure mode — an authored catalogue that quietly stops years before the frozen
horizon — Endless Sandbox inherits an already-broken catalogue on day one. The smallest correction is a
schema field, not a P13 redesign.

### 4.8 Consolidation and failure after 2040 — can the player still fail?

**Recommendation: yes, the player CAN still fail post-2040**, under the exact same law that governs
pre-2040 play. Reasoning:

- Direction E already authorizes ultimate player bankruptcy with warning and recovery *as a general
  campaign law*, not as a pre-2040-only law; nothing in direction K narrows it.
- The accepted-code ruling itself frames the horizon as a *display/support* commitment ("progression
  must intentionally support play through at least 2040"), not a *safety net* commitment — it never
  states failure becomes impossible after the horizon, and P15-PACKAGE §16's symmetric warning/
  distress/recovery predicates (subject to the SUPERSEDED-by-direction-E note below) are stated as
  ongoing engine law, not a pre-2040 feature.
- Treating "post-2040 = consequence-free" would be its own unlabelled tail — precisely the anti-pattern
  §3.5 and §4.6 both warn against (an unmarked boundary where the rules silently change).
- Rival consolidation (direction G: no synthetic replacements once authored arrivals are exhausted) must
  keep operating post-2040 exactly as pre-2040; an artificial "floor" invented only for the Endless era
  would itself be exactly the "artificial floor" direction G rejects.

One necessary correction to a P15-PACKAGE §16 clause that this recommendation interacts with:
**P15-PACKAGE §16's "PRELIMINARY RECOMMENDATION: apply the same... predicates... to player and rivals"
row was written when player terminal failure was still a live Owner question; direction E has now
settled that question in favor of eventual player failure, so §16's "the player may receive richer
decision UX... rivals may use deterministic P12 selection policy, but neither gets a secret pre-terminal
rescue" language is CONFIRMED as still correct, while the row's framing as merely "preliminary" is
SUPERSEDED BY OWNER DIRECTION E** — it should be read as settled symmetry-of-guards law, not an open
recommendation, with the asymmetry only in *whether* terminal failure is currently implemented for the
player (an implementation-sequencing fact, not a design option anymore).

### 4.9 Save As branching support for freezing

The accepted code already ships the exact primitive this needs: `bridge/runtime/campaign-library.ts`
defines a `CAMPAIGN_OPERATIONS` set including `'saveAs'`
(`bridge/schema/bridge-schema.ts:2304`), whose handler explicitly rejects overwriting the active record
("Save As must preserve the original record,"
`bridge/runtime/campaign-library.ts:181`) and copies the current session into a new, independently
labelled `CampaignRecord` that becomes active
(`bridge/runtime/campaign-library.ts:229`, message: "Current campaign copied; the copy is now active").

This is the right mechanism to **reuse**, not replace, for the 2040/Endless split: at the finale's mode
event (§4.2), a Save-As-shaped operation can branch the campaign into (a) a permanently non-advancing
"2040 Legacy" record and (b) the live, ticking Endless continuation, both descending from the same
frozen manifest. However, today's `CampaignRecord` shape — `{id, label, revision, checkpointJson}`
(`bridge/runtime/campaign-library.ts:17`) — **has no status/read-only/frozen field.** Nothing in the
current schema distinguishes "this record must never advance again" from an ordinary save. Two paths
follow directly from that gap, and this report's recommendation is the first:

1. **A frozen, non-advancing 2040 record is a stronger guarantee than a flag**, because it is enforced
   by simply never re-opening that record for ticking (a UI/product policy), matching every comparator's
   actual mechanism (Civ IV/OpenRCT2/Civ VI GS: the record is written once and separately from whatever
   continues) — no schema change is strictly required to *ship* the freeze.
2. **A `readOnly`/`frozen` flag on `CampaignRecord` is the more defensible engineering guarantee**
   (preventing an accidental "Load → advance" on the historical branch, not just a UI convention) but
   is a **campaign-library format change** — a new field, a new library version, and a migration rule
   for existing single-branch saves, i.e., real implementation cost outside P15C's own manifest work.

**Recommendation: adopt (1) now as the zero-cost default** (the product simply never offers "advance
simulation" controls on a record flagged, by *label convention* and UI routing, as the historical
2040 branch), **and register (2) as a named, scoped follow-up** for whichever package ends up owning
campaign-library/session infrastructure (it is shared bridge infrastructure, not clearly P15-owned) —
this keeps P15A.1/P15C unblocked while flagging the real gap rather than silently assuming the schema
already supports it.

### 4.10 Distinguishing Historical Campaign from Endless Sandbox in every archive view

A single rule, applied everywhere history is shown, generalizing §4.5's dossier-specific version:

- **Every** archive surface (P08 History portal, Power Ranking archive, the 2040 dossier, any future
  Endless-era record view, and the campaign library's own save list) must carry an explicit,
  always-visible label distinguishing `Historical Campaign (1920–[trigger], frozen)` from
  `Endless Sandbox ([trigger]–present, live)`. This is not a new law — it is the direct generalization
  of Annex O's existing typed-error discipline (`finaleModeUndecided`: "Post-2040 play has not been
  authorized... Offer only governed ending/archive behavior") and of `comp-finale.md`'s L4 ("Name the
  modes; do not rely on a menu workaround") applied consistently rather than only at the finale screen
  itself.
- The campaign library's own summary projection already computes a `dateLabel`
  (`bridge/runtime/campaign-library.ts:44-48`); extending that same summary with a mode label
  (`historical` vs `endless`) is the natural, low-cost place to carry this distinction end-to-end,
  again without requiring the full frozen-flag schema change from §4.9(2) to be useful immediately.

---

## 5. Package ownership summary

| Component | Owning package | Basis |
|---|---|---|
| Ceremony beats, dossier cards/lenses, provenance rule, anti-score rule | **P15C** | P15-PACKAGE §12.4/§15.4/§22; Annex C.5/D.6/M.6 |
| Finale lifecycle state machine, `LegacyFinaleSnapshot`, mode-transition event | **P15C** | Annex C.5/D.6 |
| Power Ranking snapshot archive (prerequisite for "dominance periods") | **P15A.2** | Digest-confirmed two-snapshot retention gap; P15-PACKAGE §15.3 |
| P08 Awards/Standing content the dossier reads | **P08** (P08B currently blocked) | Task framing; P15-PACKAGE §22 |
| Technology-leadership lens content | **P13** (not yet built) | Direction/roadmap §18 |
| Finance peaks (now) / financial crises (future) | **P11** (now) / **P15B** (future) | P15-PACKAGE §16/§22 |
| Facilities/growth lens | **P11/engine** (live) | Existing engine facts |
| Bankruptcy/recovery events, rival rise/fall closure | **P15B** | Direction D/F; P15-PACKAGE §23 |
| Relationship/romance domain, if ever approved | **P14** | Task framing (P14 deferral) |
| Acquisitions lens, if M&A ships | **P16+ or a scoped new package per direction I's own research question** | Direction I; see §6 |
| Endless Sandbox mode/HUD marker/record separation | **P15C** | Annex C.5's own state-machine already names the Endless transition |
| Campaign-library frozen/read-only flag (schema change) | **Shared bridge/session infrastructure — no current P-package owner** | `bridge/runtime/campaign-library.ts`; flagged as a named gap, §4.9 |
| P13 catalogue "last authored era" boundary field | **P13** | §4.7 |

---

## 6. Remaining Owner decisions (genuine, not reopening settled choices)

1. **Exact 2040 trigger week** (`W_2040`) and how already-in-production films at that week are
   disclosed in the frozen manifest — open in P15-PACKAGE §24 Q10, unresolved by this report.
2. **Whether Endless play gets any presentation surface at all** beyond the raw continuing simulation —
   i.e., does the Owner want a second, dated, Endless-era record set (§4.5) built, or is "the live game
   itself" sufficient and no post-2040 archive view is authorized? This is a real scope decision, not a
   design detail.
3. **Which of the three era/technology policies (§4.6) is default per catalogue/system**, and whether
   the procedural-future option is ever authorized at all — this report recommends "freeze" as the
   zero-cost default but the Owner may pick differently per system once P13 exists.
4. **Whether P08 awards ceremonies and P15A.2 Power Ranking continue firing during Endless play**, and
   if so, whether their post-2040 output feeds any Endless-era record set or stays purely live-UI
   (§4.4's table lists this as "if the Owner authorizes").
5. **Whether the `CampaignRecord` schema change for a true `frozen`/`readOnly` flag (§4.9 path 2) is
   worth its migration cost**, versus relying on the zero-cost UI-routing convention (§4.9 path 1)
   indefinitely.
6. **Package boundary for the Acquisitions lens** (§5 row), entirely deferred to direction I's own
   research question about M&A's package boundary — this report only states the dossier lens is
   conditional on that decision, per Annex M.6's own "if they exist" framing.
7. **Whether an early (pre-2040) player-bankruptcy ending reuses the identical finale-presentation
   machinery** described in §2.4, or whether the Owner wants a visibly distinct "early ending" treatment
   — this report recommends sharing the machinery but flags it as a design choice the Owner should
   confirm once P15B/E's player-bankruptcy experience is actually scoped.
