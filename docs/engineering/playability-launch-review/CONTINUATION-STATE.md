# CONTINUATION STATE — three-week autonomous window (Owner directive 2026-09-15)

**Purpose.** The one file a fresh coordinator (or Howard on return) reads first. It is rewritten at every recovery point and pushed on
`wip/playability-interaction-01-ts` (The-Movies). Everything else it names is pinned by commit. Nothing that matters lives only in a session.

## Where everything is documented (if the session closes, start here)
| What | Where (GitHub, private) |
|---|---|
| Governing authority for the window | `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md` (this repo, `wip/playability-interaction-01-ts`) |
| Running handoff (decisions, failures, evidence, remaining work, next actions) | `docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md` — newest record on top (K8 → K1, then C, R, S) |
| This state file | `docs/engineering/playability-launch-review/CONTINUATION-STATE.md` |
| Phase plans published before each phase | `docs/engineering/playability-launch-review/plans/<phase>-PLAN.md` (created per phase) |
| Unity source candidate | HSpector1/project-studio-unity-visual-spike `wip/playability-interaction-01-client` (currently 74c2141a) |
| TS source candidate | HSpector1/The-Movies `wip/playability-interaction-01-ts` (currently a8d2a75f; production TS unchanged since 31f6e70d) |
| Private review evidence (reports, xml, captures, native attempts, manifests) | HSpector1/project-studio-unity-visual-spike `docs/playability-delivery-review-20260913-01` → `docs/evidence/r3n1-native-correction-20260915-01/00-START-HERE.md` (c80743db) and `docs/evidence/playability-delivery-20260913-01/` |
| Budget ledger (git-ignored evidence, local) and private stamps | TS `evidence/Playability-Interaction-01/entry/budget-ledger.json`; git-private `fable-local-transfer-20260914-01/r3n1-ledger-local.json`; totals are restated in every handoff record |
| Full local-evidence mirror (nothing stays local): text-class evidence in Git; captures/movies/large payloads as release assets | private Unity repo, branch `docs/playability-delivery-review-20260913-01` → `docs/evidence/local-mirror-20260915/` and GitHub Release tag `evidence-mirror-20260915` (assets listed in its notes) |
| Owner playtest list for Howard's return | `docs/engineering/playability-launch-review/OWNER-PLAYTEST-LIST.md` (grows with each phase) |

## Current position (2026-09-15 20:28Z)
- Build50 native runs DONE (K9): preflight PASS; F7, F8 (Production excursion), F10, F11, F12 (no menu), F13, F14, F15 PASS natively at
  1440×900; F9 typing PASS; new defects F17 (keyboard Return opens no inspection), F18 (Escape never closes Find), F16 (check), F20 (minor)
  handed to the N2 writer. Run B (1280×720/200 % cell, dense-02 overflow, Schedule-take route) NOT RUN on Build50: stale-source guard once
  N2 edits entered the tree → runs on Build51.
- N2 in progress (IMPL-12 running with the K9 native defects and the rail font floor added; DESIGN-03 done, TS 321448c1). N7/N8 legality
  and retrievability inventory filed (`plans/N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md`, plan C5/N7 amended, f9b1d28c). N3 visual
  standard sheet + icon SVGs + PROVENANCE done (`r3-n1-design/R3-N3-VISUAL-STANDARD-SHEET.md`, d9b5e239): fonts = LegacyRuntime tier-0 +
  gated OS preference; six-portrait proof ids named; two missing stage sprites (committed, intheaters) specified; F-N3-1/F-N3-2 findings.
- Evidence mirror: text-class in Git (b8e57059); release `evidence-mirror-20260915` uploading (60+ assets so far, resumable).

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. N2: integrate IMPL-12 + DESIGN-03 → test-author TEST-09 (EditMode + PlayMode) → rendered PlayMode suite → Build51 + seal + admission →
   native regression of the changed rails/overlay (guard-admitted) → K10 record → N3.
