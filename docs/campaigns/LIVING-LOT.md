# Living Lot & Production Presentation — Campaign Ledger

Owner-directed Unity-first campaign (2026-08-23) following Golden M6 and
canonical `main`. Question under test: *does this finally feel like a living
movie studio rather than a technically impressive diorama?* Effort split:
65–75% Unity/player-facing quality, 15–20% resilience (Phase M), 5–10%
TypeScript/bridge only where authoritative presentation requires it, Three.js
regression/reference only.

Branches: `campaign/living-lot-ts` (TypeScript, from canonical `main`
`c902a704...`) and `campaign/living-lot-client` (Unity, from M6
`c7a19dcd...`). Golden M6 is the recovery authority; every checkpoint is
non-Golden by default. Human visual judgment is a hard gate; reject slices
that make the real game worse.

Baseline hostile review (Week-22 mid-game overview, M6 build): (1) the lot is
dead — zero visible people despite 7 employed staff and a hit in theaters;
(2) vast empty ground planes; (3) prop sparsity; (4) flat building faces;
(5) static forever-parked vehicles; (6) uniform flat daylight; (7) the
proof-style panel dominates a third of the screen.

## 2026-08-23 — LL-CP1 sealed: contracted staff attend the lot

**Player-visible change:** between engagements, the studio's contracted
company now reports to the lot instead of vanishing — actors, the director,
and the writer at Development & Casting, craft at the Scenery Shop — walking,
working, selectable, and honestly described ("On the lot at Development &
Casting this week — between engagements"). The Week-22 studio no longer looks
abandoned; staff visibly inhabit and cross the lot.

**Engine (attendance canon, presentation-canon layer):**
`studioPresence` roster tier now sends every contracted, unclaimed member to
a profession home facility (`ROSTER_HOME_FACILITY`: writer/director/actor →
`facility-development-casting`, craft → `facility-scenery-shop`) with the
standard staggered work-week beats; the site must exist in
`state.operations.facilities` or the person stays home (fail-neutral).
Deterministic, outcome-neutral, zero simulation RNG — the same canon class as
the departure stagger. Adapter joins the facility's own name for slot-less
roster sites (no occupant strings invented); the person panel states
attendance honestly and degrades without a proven name.

**Unity (stage-safe body seating):** three presentation rules keep the sealed
stage composition immune to attendance — (1) roster-held bodies are ephemeral
and released every apply, so the claimed company always takes preferred
bodies first; (2) a claimed person whose zone changed is re-seated onto an
exact-zone authored body when one is free (upgrade-only, no churn); (3)
roster attendees may never occupy a stage-authored body — when only stage
bodies remain free the attendee is not presented (fail-neutral). The
campaign's fail-closed stage gate caught both underlying defects (a claimed
company wandering role marks on a mismatched body; an attendee parked inside
a hot set) before any player saw them — two intermediate failed stage runs
are retained as local diagnostics (`LLCP1-Stage-20260823T135724Z`,
`...T140347Z`, `LLCP1-StageDbg*`).

**Validation:** TypeScript full suite 337 files / 4,545 passed / 5 skipped
(canon tests added; stale pins updated to the new canon in
`_presenceFixtures`, presence projection/scenario, presence lines, the
Three.js lot presence tests, and the M-B inspector order); both typechecks;
contract drift verified (no schema change); Unity EditMode 271/271; macOS
rebuild + codesign valid; `git diff --check` clean both repos.

**Native evidence (all on the final pair):**
- Stage visual proofs complete 5/5 both aspects:
  `Evidence/R/LLCP1-Stage-Final2-20260823T141715Z/Landscape/stage-visual-proof-landscape.json`
  (SHA-256 `e17f9990396b5d53f806...`) and
  `.../Portrait/stage-visual-proof-portrait.json` (`62c1d68e8d6ad7596efb...`).
- Bridge auto proof complete, exact Movie #2, revision 50, 119.6 FPS:
  `Evidence/R/LLCP1-Bridge-Final-20260823T141953Z/Main/bridge-client-proof.json`
  (`5ec77d591da1528010d4...`).
- Week-22 native overview: attending staff visible at and between facilities;
  shooting-frame composition indistinguishable from the accepted M6 record.

**Ruling: KEEP.** Foundation for lot life is real staff, truthfully placed.
Known boundary: at overview zoom, seven attendees still read sparse — density
(decorative presentation-only extras, street life, arrival/departure flows)
is the next bounded work, guided by the CP22 25/50/100 headroom evidence.

**Next:** LL-CP2 — visible lot density in normal gameplay: classified
presentation-only background extras (non-interactable, non-persistent,
gameplay-inert, never implying staff counts), busy-where-busy/calm-where-calm
placement, and vehicle motion; then character motion quality (locomotion,
idle variation, work loops); then environment passes per the baseline review.
