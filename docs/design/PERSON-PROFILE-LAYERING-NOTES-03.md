# Person-Profile Deep Dive & Layering Recommendation

**Sources consulted:** `CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md` and `WORLD-INTERACTION-COMPARATIVE-NOTES-02.md` (both reread in full, as directed). Local corpus authorities found and read in full: `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` (4,146 lines) and `THE-MOVIES-2005-SOURCE-REGISTER.md` — these were **not** in either named project directory; a home-directory search located them on the Owner's Desktop. Confidence tags below follow the Bible's own taxonomy: **[V-HIGH/MED/LOW]** = a cited source states it (manual, Prima guide, direct gameplay screenshot, contemporary guide — tier noted), **[I]** = inference, **[UNRESOLVED]** = the Bible itself flags an open question.

---

## 1. What the blueprint already established (context for the recommendation, not repeated in full)

Blueprint §F's information hierarchy — **world marker → compact selected card → "More Details"/compare workspace** — plus the 12-point doctrine (complexity earns a workspace; selection is not commitment; TypeScript owns truth/legality; one route between layers) is the frame this whole answer sits inside. The comparative notes add the load-bearing nuance used below: a "building verb is a **doorway**, not a commit," and the project already has the retained-workspace mechanism (`LotRetainedWorkspace.tsx` — lot stays mounted behind a full-viewport surface) rather than a screen-swap.

---

## 2. Deep dive — how THE MOVIES (2005) actually presented person information

### A. The Star Card system (roster stars)

**Left-click vs. right-click — precise and directly sourced from the manual's own controls table** [V-HIGH, `manual_english.pdf` p.10; Bible §2, §28]:

| Target | Left-click | Right-click |
|---|---|---|
| Person on the lot | Pick up/carry (hold), release to drop | Show **all** information bubbles instantly |
| Star card (side HUD column) | Select + jump camera to them, **or** pick up to drop at cursor | Show all information bubbles |

Hover alone shows only the single highest-priority bubble automatically; right-click is the "show everything" gesture [V-HIGH, manual p.8].

**The information surface itself was never one panel — it was a stack of separate floating info bubbles**, composited here from multiple directly-observed captures rather than one single screenshot [V-HIGH throughout, individually cited]:
- Identity: name, age.
- **Experience** bars, one per relevant genre (Action/Comedy/Horror/Romance/Sci-Fi).
- **Looks / Physique / Fashion** bars (the "Image" sub-components).
- **Work: Stress / Boredom** — two bars under one green bubble.
- **Addictions: Food / Drink** — two bars under one pink bubble.
- **Relationships** — a named per-NPC list, each with its own affinity bar (8 named individuals observed on one director).
- **Salary** (annual) and **Market Value** as plain numbers (one observed case: $50,000 salary / $63,073 market value, age 50).
- A personality-**trait list in plain language** at hiring time (e.g. "Tolerant, Hard To Please, Stress Pot, Easily Bored, Lives To Eat, Loves Alcohol") — these map cleanly onto the underlying StarMaker numeric thresholds (Stress/Boredom/Food/Drink) [I, well-supported cross-reference, Bible §10.3/§6.3].
- **No confirmed on-screen 0–5 Star Rating breakdown.** The Bible itself logs an open capture request for "a live Star Rating breakdown screen (if one exists) showing all nine weighted factors simultaneously" — meaning the original **never definitively showed the composite score's own math to the player** [UNRESOLVED].
- **Portrait format (2D headshot vs. live 3D) is not resolved by any source.** The HUD calls it a "portrait thumbnail" but no source specifies whether it is pre-rendered 2D art or a live 3D bust render [UNRESOLVED — flagged, not guessed].

**Overlay panel, never a full screen — this is the single most decisive, best-evidenced finding.** Section 28 of the Bible catalogs every place the game explicitly swapped away from the lot to a separate screen (Pause Menu, Options, Finance, Charts, Reviews, Release sequence, Movie Player, Advanced Movie-Maker, Post Production, the external StarMaker tool, Movies Online, New Game setup). **A dedicated "Star Profile" full screen is absent from that list** — a systematically compiled table, so the absence is meaningful, not merely unproven [V-HIGH by documented absence across the manual's own exhaustive interaction-grammar table]. The dividing rule the Bible states outright: *"anything that is fundamentally 'move a person/object/card to a place' stays on the lot as an overlay… anything that is fundamentally 'read a report,' 'author content in detail,' or 'configure the application' swaps to a dedicated full screen."* Person info is squarely the former.

**Could you act from the card?** Not directly — the bubble/card is **inspect-only**; the world *is* the action. You act by then dragging the Star (or their card) to a destination: trailer (housing/happiness), Makeover Department (image), Rehab, Cosmetic Surgery, a set (practice/shoot), another Star (relationship/entourage), or the Star & Script Selling Facility (release for cash) [V-HIGH throughout §10]. A stressed/absent Star can be dragged back onto a shoot at the cost of a bad performance — a priced override, not a blocked action [V-HIGH].

### B. Prospective hires at the Stage School

Not a list, not a screen — a **radial (pie) menu opened directly on the walk-in candidate** standing in the queue outside the Stage School, offering **Create Actor / Create Director / Create Extra / Fire** [V-HIGH, directly observed: "Alex Evans, 21 years old"]. Surrounding info bubbles at that moment show genre Experience bars, Looks/Physique bars, and the plain-language trait list above — i.e., the pre-hire information is **the same bubble vocabulary** used post-hire, just attached to an uncommitted candidate. Vetting happens before commitment: the candidate can simply be **Fired (rejected)** from the same radial without ever hiring them [V-HIGH]. Underlying stat block (StarMaker, also generates walk-ins): Looks, Trimness, Chest/Breast Size, five Genre Skills, Stress/Boredom/Drink/Food thresholds, Mood upper/lower bands [V-HIGH, manual pp.34–35]. **No side-by-side candidate comparison tool was found anywhere in any source** — candidates are vetted one at a time at the radial [I, inference from absence across five guides].

### C. The demands system

The manual states demands scale with fame — *"Stars you hire will grow more demanding as their fame increases… you could find yourself flooded with demands from spoiled or unhappy celebrities"* [V-HIGH, manual p.14]. Critically, **there is no formal itemized "contract demand" card or inbox to approve/reject.** Demands surface implicitly through the same threshold-bar grammar (mood/status bubbles cross a line, the Star "looks unhappy," eventually "throw[s] tantrums") and are resolved proactively by the player: salary is adjusted via the Cash Balance → Salary screen (one of the few genuine full-screen exits, F6), trailer/entourage/image demands are satisfied by dragging better resources to the Star. Salary changes hit mood instantly but phase into the Star Rating's salary score gradually via a documented "Future Influence" anti-gaming lag [V-HIGH, Prima guide, developer-reviewed]. **There is no negotiated-demand moment at hiring itself** — starting salary is fixed ($6,000/yr, uncapped upward) and the only hiring-time choice is hire-or-Fire [V-HIGH].

### D. The one converging critique worth carrying into the recommendation

The Bible's own gap analysis states plainly: *"Real casting fit math is never shown to the player… reproducing the original's most-cited complaint (opaque quality)."* Metacritic user sentiment is cited for *"an obtuse system of management and lack of total control… confusion regarding why some things work."* The original consistently **showed the inputs (bars, traits) but never the formula that combined them** — no source found a Star Rating breakdown screen, and Movie Success's own aggregation rule was something even a contemporary walkthrough couldn't pin down. This is a documented weakness, not a design virtue to imitate.

---

## 3. Recommendation for Project: Studio

**Governing law, restated:** TypeScript owns every number and all legality; Unity renders read models and dispatches opaque intents; commitment stays behind an armed contract sheet; selection is never commitment; no drag-as-only-verb. The layering below is built to satisfy those laws while answering the Owner's two stated wants — "a new screen, maybe" and "harder to see all the things I need to see easily."

### Layer 1 — World nameplate (unchanged, per blueprint §F)
```
RAMON ASHLEY
Actor · OVR 52
```
Zero-click ambient signal only, exactly as already specified. Do not deepen this layer — it exists to let the player *notice*, not decide.

### Layer 2 — The overlay profile card (the approved Madden-style card, kept and enlarged)
This is where the original's scattered info-bubble stack (Experience, Looks/Physique/Fashion, Work:Stress/Boredom, Addictions, salary, traits) gets **consolidated into one card** — an explicit improvement over the original, whose "screen can become totally cluttered with pop-up info bubbles" was a named contemporary complaint. The card stays anchored bottom-right over the still-mounted, still-pannable lot; the camera never leaves the world; this is functionally the modern equivalent of "right-click = show all info bubbles at once," done as one authored surface instead of a stack of floating balloons.

**Card contents (sufficient, alone, for the hire/no-hire decision):**
- Live 3D portrait bust, name, role, OVR masthead.
- Five headline stat bars, role-typed per blueprint §F (Actor: performance/genre signal; Director: direction/genre/leadership; Writer: genre/voice/delivery; Production/Craft: department/reliability/throughput) — these are the deliberately-compressed face of the fuller StarMaker-shaped attribute block, not a replacement for it.
- Best signal / one primary concern (text + icon, never color alone).
- Weekly/annual salary + signing bonus.
- `Review offer` and `More Details` — both present, neither optional-away.

**This is the layer that answers "harder to see all the things I need to see easily."** The fix is not more density on the card; it is that the card alone must be *sufficient* — the player should never need to open anything else for an ordinary hire. That is a direct correction of the original, which spread this same information across five-plus separate bubbles the player had to hunt down one at a time.

### Layer 3 — the Full Profile workspace ("new screen," but a retained workspace, per project law)

**Open it from exactly one route:** card's `More Details` button. **Close it back to exactly the same route:** `Locate`/`Return`, restoring the exact card and selection. The lot stays mounted behind it, full-viewport, per the existing `LotRetainedWorkspace` law — this is not a screen-swap, and it must not become one.

**When it should open:** only when the decision genuinely needs depth the card cannot honestly compress — comparing multiple staged applicants, reviewing full contract structure before signing, or inspecting the attribute/fit math behind a surprising OVR. It should never be the required path for an ordinary hire.

**What it contains that the card must not:**
- **Full attribute breakdown** — the complete StarMaker-shaped block (Looks/Trimness/physical, five genre skills, Stress/Boredom/Food/Drink thresholds, Mood bands) with `Est.` ranges and confidence, per the "uncertainty looks uncertain" doctrine.
- **The actual OVR/fit math, shown, not hidden** — this is the single highest-leverage correction of the original's most-cited failure. Project: Studio's own gap analysis already names this as fixable now (`FORCE_VECTORS`/`expectedCriticScore` are already plumbed) — the original never showed this anywhere, and that opacity was its most-quoted weakness. Do not reproduce it.
- **Full contract structure**: weekly/annual salary, signing bonus, guaranteed pay, total obligation, before→after payroll/runway.
- **Comparison across the currently staged applicants** — a capability the original never had at all (candidates were vetted one at a time, hire-or-Fire, no side-by-side tool existed anywhere in five guides). This is a place to exceed the original outright, not merely modernize it.
- **Filmography/career history/relationships** — later, "as systems exist," per blueprint §F; do not stub these now.

**What the card keeps exclusively:** brevity itself. The five-bar/one-concern/one-signal compression is a deliberate simplification the workspace should never also perform in miniature — if the workspace starts restating the card's own summary line instead of showing depth, it has become a second memo, which the comparative notes explicitly warn against ("a card that lists every intent with its detail paragraph — the memo, relocated").

**Demands, specifically:** unlike the original's implicit, threshold-triggered demand system (no formal card at all), Project: Studio's contract sheet already resolves this better — demands should render as an explicit, itemized structure inside the `Review offer`/contract-sheet flow (Layer 2's guided path), never as a passive mood bubble the player has to notice decaying. This is a place the recommendation departs from the original on purpose: the original's implicit-demand design was a documented source of player frustration ("flooded with demands"), and the project's existing armed-contract-sheet law already gives a cleaner, explicit alternative.

**The one route, stated plainly, end to end:**
```
World nameplate → click → Overlay profile card (camera stays, lot mounted)
   → [Review offer] → armed contract sheet → Sign
   → [More Details] → Full Profile workspace (lot mounted behind, full-viewport)
        → Locate/Return → back to the exact card/selection
```
No second path in or out. No drag-only action. No commit without the armed step. Card is sufficient alone; workspace is optional depth, never required, never a second memo.
