# P06A W5b — Living Studio Command Layer: execution plan (grounded)

**Status:** AUTHORIZED (charter Appendix B, campaign order §19). Owner-authored bounded
cross-cutting presentation refinement over EXISTING accepted authority. **No new simulation
mechanics; no new bridge/engine truth.** Recon-confirmed 2026-09-02.

## Architectural finding (build economics)

LSCL is **100% Unity presentation over the already-shipped bundle.** Every datum the five
surfaces need is already projected:

- **Rail rows** ← `bundle.productions.productionOperations[]` (`ProductionOperationsState`):
  `operationalState`, `stateLabel`, `stateWeeksRemaining`, `nextMilestone`, `locateTargets`,
  `stageBuildingId` / `primaryWorkTarget.buildingId`, `blockerAnatomy`, `wrapReceipt` — plus
  `development.board.projects` (already the rail's source) for the DEVELOPMENT/CASTING screenplay
  rows.
- **HUD** ← existing living-time + economy + `journeyNotices` / `nextDecisionKind` (already carries
  `release-review`).
- **Building attention** ← existing `development.attentionPennant`, casting `attention`, and the W4
  `StudioPostWorldContracts.Derive` cue.
- **Talent access** ← existing casting shortage route (P05A.3) + roster/market bundle facts.
- **Lot life** ← existing `StudioLotLifePresentation` + `StudioDecorativeIdentity`.

Consequence: **the engine bundle and the six oracle fixtures stay frozen.** Only the Unity player
rebuilds after LSCL. This is exactly the charter's W5b→W7 order — one build. The TS worktree does
NOT change for LSCL.

## The real gap

`StudioProductionRailHud` is today a **Development-only** surface (its own class doc: "carrying
ONLY current screenplay Development states … computes no lifecycle"). It renders
`development.board.projects` and the READY-FOR-CASTING handoff. It shows **nothing** once a
screenplay becomes a production. The §19 rail requires **every active movie** with lifecycle
vocabulary DEVELOPMENT / CASTING / PRODUCTION / POST / RELEASE READY / COMMITTED.

## Work items (each: pure contracts + EditMode tests, then MonoBehaviour render)

1. **Rail lifecycle extension (anchor).** New pure laws mapping `operationalState` →
   {PRODUCTION, POST, RELEASE READY, COMMITTED} lifecycle chips; compose production rows (title ·
   phase · building · time-or-waiting · action-required · blocked/queue · exact Locate · open).
   Merge with the existing DEVELOPMENT/CASTING screenplay rows in authority order. Preserve every
   existing rail law: peripheral shortcut, never required before clicking the physical world owner,
   yields to card/inspection/workspace, ghost-shield. No spreadsheet, no color-only state, no
   percentage. Anti-patterns from the research delta are binding.
2. **HUD truthful decision/pause reason.** Surface the current `nextDecisionKind` / pause reason
   (incl. release-review) and cash truthfully; no ungoverned financial forecast.
3. **Building attention badges (shaped + text).** One restrained shared badge (glyph + word, never
   color alone) that replaces rotated-roof-text reliance; sourced from the owning place's existing
   attention truth. No repeated global alerts.
4. **Talent access entry point.** One persistent discoverable entry point exposing contracted /
   freelance / candidate / busy(+return week)/ assignment from existing facts; a hiring candidate
   never shows available-now; no contract-authority bypass. Reuse the P05A.3 shortage route.
5. **Lot life audit.** Confirm decorative bodies carry no authoritative person ID, no
   payroll/progress/blocker/outcome meaning, reduce to zero without changing simulation, never
   masquerade as named talent. Add tests if any gap.

## Boundaries (hostile criteria this plan must not trip)

#14 current movie leaks into another row/building · #15 side rail becomes gameplay authority ·
#16 visible action silently no-ops · #10 movies bind by array position/title (rows keyed by exact
productionId) · #11 waiting movie disappears · #24 comments/reports contradict code.

## Sequence

Runner compiles (isolated) → implement 1–5 with EditMode green → bake scene if new components →
single player rebuild (contains runner + LSCL) → manifest → W7 oracle six-scene capture.
