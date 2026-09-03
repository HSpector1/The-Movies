# P06C — Deferred-Waves Backlog (documentation-only)

P06C delivered the highest-value surfaces to a proven, isolated comparison candidate: **Priority Zero**
(the rail↔guidance-card state-truth fix, §5), the **grouped movie pipeline rail** (§7, the primary
target), and a **bounded People/Talent awareness strip** (§14). The waves below were deliberately
deferred to keep the pass focused and avoid a broad reskin (§21) and to protect the mandatory closers
(proof pyramid, hostile review, candidate, report). Each is scoped, evidence-backed, and ready to
execute in a follow-on checkpoint. **Do not implement here — the P06C candidate is preserved.**

## §8 (deeper) — rail row anatomy: title-first
The grouped rail keeps the P06B row order (phase chip on line 1, title on line 2). With the new group
headers, the per-row phase chip is partly redundant with the section header. A follow-up could lead each
row with the **title** (§8 "LINE 1 = Movie title") and demote the chip to a specific state word, reducing
redundancy. Deferred because it is a taste change over an already-reviewed-good row and would touch the
row draw + the phase-track offsets; the current row already answers phase/state/attention clearly.
File: `StudioProductionRailHud.DrawProductionRow` / `DrawScreenplayRow`.

## §15 — building-card convergence (bounded)
Converge the highest-value world cards (Development, Casting, Stage/Production, Production/Post, Talent)
to one anatomy: place title / exact subject / current state / action-remedy strip / one primary CTA /
secondary Locate·Details / Back-context; handle zero/one/multiple/stale subjects; no enabled button
silently returns; no rail priming. The seam map (P06B backlog + P06B seam analysis) already confirmed the
selection double-surface (`StudioProductionEntryCard.cs` UITK + `StudioHud.cs` IMGUI "LOT SELECTION")
reads current-truth (`operationalState`); this wave is a grammar/layout convergence, not a truth fix.
**Trap:** keep reading `operationalState`/`presentationState` — never the raw `phase` (the same class of
defect Priority Zero fixed on the guidance card).

## §16 — workspace/guidance convergence (smallest shared)
Apply the smallest shared header/Back/CTA-hierarchy/focus/scroll improvements to touched workspaces
(Development, Casting, Talent Market, Production, Post/Release; UITK `Presentation/UI/`, hosted by
`StudioWorkspaceHost`). **Forward action must outrank Back** (the memo's commit vs secondary buttons in
`StudioBridgeClient.OnGUI` are equal-weight today). Apply `.focus-visible` (declared, never applied).
Reduce dependence on the large left guidance memo only AFTER rail/card/workspace independently carry the
truth — note P06C already moved one truth off the memo (the wrapped-waiting state now reads correctly).

## §17/§19 (deeper) — accessibility + full before/after matrix
P06C verified the grouped rail + People strip render at the oracle's 1440×900 and confirmed the
Priority-Zero before/after. A follow-up should run the full §17 responsive stress (1280×800 / 1440×900 /
1720×1045 / fullscreen; keyboard/controller focus; 200% text; reduced motion; 10 movies) and produce the
complete §19 twelve-comparison before/after matrix (incl. a mixed-slate capture that exercises all three
rail groups at once — the oracle scenarios are post-family, so P06C's live rail capture shows the
POST & RELEASE group; the three-group assembly is unit-proven by `StudioMovieSlateContractsTests`).

## §10 (deeper) — rail scroll owner for >6 movies
The grouped slate caps at `MaximumMovieRows` and never hides an action-required row (steady rows overflow
with an honest "+N more"). True reachability for >6 movies wants one scroll owner or an
expand-a-collapsed-group affordance. Deferred (IMGUI scroll in this HUD is a larger change); the cap +
attention-priority + honest overflow is the bounded interim.

## People strip (deeper)
Optional exact per-person **return week** would need a small TS projection addition
(`PersonPresence.returnWeek`) — **Owner-authorized, not silently invented** (P06C shows only the
current-week assignment/availability). A per-person Locate affordance (click a person → focus their
building) is also possible but was left out to keep the strip read-only and bounded.

## Global constraints (unchanged)
Engine-authority hard line (UI/world projection over existing authority only); the rail is
active-lifecycle only (no P07 Released/In-Theaters/earnings/awards); no date/era progression baked into
the HUD; no economy retune; do not roll back shipped surfaces; open Owner decisions stay Owner calls.
