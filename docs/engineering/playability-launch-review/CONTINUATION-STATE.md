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

## Current position (2026-09-16 02:25Z)
- **N2 delivered on Build53** (Unity 12498560 / TS 681b3fdc, exe e86527f2…, seal 48, admission 44) — record K10 atop the handoff. Native on
  Build53: F16/F18/F20/F22/F23 PASS, overflow PASS, Schedule-take dispatch confirmed; **F21 open (native-only)** — IMPL-22 diagnosing; TEST-20
  fixing five harness-side test failures (product line green: 214/214 pre-existing tests). N2 remainders: C8 measurement (N3), C9 declared,
  people-rail parking asymmetry, mid-display invalidation step of the stale route (driver aim drift on the sliding Development card).
- Next: IMPL-22 fix → TEST-21 → rendered → Build54 → native F21 check; then **N3** (brief `r3n3/IMPL-N3-brief.md` staged: stage sprites,
  fonts + coverage tests, portrait slots, coverage statement) and the batched TS deltas (`r3n4/SIM-N4-DELTAS-brief.md`) after Build54's seal.
- Design sheets ready for N3–N6; plan rulings C8/C9 recorded; evidence mirrored (release 92 assets; review folder 260 files).
- **Budget checkpoint 02:20Z**: whole-program capability ≈ 40.0 h; reserve ≈ 7.2 h with 6 h protected (≈ 1.2 h unprotected). Revised
  stage budgets and the overrun rule are in the plan (verification beyond 1.2 h is reported as overrun; protected hours never drawn).

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. F21: IMPL-22 diagnosis → fix → TEST-21 → rendered → Build54 → guarded native F21 check (N2 key plan) → K10 addendum.
2. N3 implementation (IMPL-N3) + TS deltas (SIM-N4) → TEST → rendered → Build55 → native art/font captures → K11 → N4.
