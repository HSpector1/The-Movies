# P06D — Before / After Matrix (§28)

**Before = the P06C control** (`~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/`, exe `2c235c39`, byte-
preserved). **After = the P06D candidate** (exe `076e8c62`). The definitive side-by-side is the Owner's live
comparison (`P06D-OWNER-COMPARISON-PLAYTEST.md`) — both launchers on the same demo. This matrix catalogs the
captured P06D "after" frames (all opened + reviewed during the iteration loops, §5) and the concrete before→after
deltas; the P06C "before" frames live in that candidate's own `evidence/`.

## Rail — the primary surface (oracle management frames, image-reviewed)
| State | After (P06D) evidence | Before→After delta |
|---|---|---|
| Mixed-slate hero (all 3 groups) | `Evidence/P06D-build5-scroll2/mixed-slate-hero/…-management.png` | P06C drew one/two groups from post-heavy fixtures + no location; P06D shows SCRIPTS/MAKING MOVIES/POST & RELEASE at once, title-first, with location lines |
| 10–15-movie scale (scroll owner) | `Evidence/P06D-final-oracle/scale-stress/…-management.png` | P06C silently capped at 6 + unreachable "+N more"; P06D scrolls a bounded column, every row reachable |
| Release-ready row | `Evidence/P06D-build3-clipfix/release-ready/…` | P06C: state-chip-first; P06D: title-first + "▸ Release Ready" + location·time |
| Committed / multi-state | `Evidence/P06D-final-oracle/{committed-to-release,multi-picture-contention}/…` | Six distinct §8 attention states (waiting slate ≠ blocked amber; release-ready/action ▸ thicker accent; committed green) |
| Responsive 1280×800 / 1440×900 / 1720×1045 / 1728×1117 | `Evidence/P06D-responsive/…` + `P06D-build5-scroll2/` | rail stays bounded (scrolls when tight), full-size type, lot dominant at every viewport |

## Cards / workspaces / a11y (real HID proof frames — the static oracle can't open these)
`Evidence/S/OwnerInputProof-1440x900-20260903T170343Z/` (report OVERALL PASS):
| Surface | Frame | Delta |
|---|---|---|
| a11y focus/selection ring | `A-locate-casting-office-after.png` | NEW — a visible focus ring on the clicked rail row (P06C had none); camera not hijacked |
| Casting workspace — Back ranking | `A-open-casting-workspace-after.png` | Back de-emphasised (was `.primary-action`, equal to forward); forward "Plan camera tests" now outranks Back |
| Casting role / candidate flow | `A-select-role-*`, `A-*-badge-*` | unchanged behaviour — the Back restyle did not regress navigation (24/24 attempted steps) |
| People strip — Open Talent | visible in `A-locate-casting-office-after.png` | footer now an actionable "Hire more at the Casting building ▸" affordance |

## Not pixel-captured this pass (documented honestly)
- **Production workspace** (persistent action strip, blocker danger-callout, disabled-CTA styling): the HID
  fixture is pre-production (no active production to open the workspace), so these are **EditMode + code-verified**
  (the `production-operation-execute` button is still found under the new `detailFooter`; EditMode 762/762) and
  will be visible in the Owner's live comparison (which has active productions). Not a regression; a capture gap.
- **P06C control re-capture on common states**: the P06C candidate's own `evidence/` holds its frames; the
  Owner comparison launches both live for the true side-by-side.

All P06D frames above were opened and reviewed in-loop (§5); no improvement is claimed from source alone.
