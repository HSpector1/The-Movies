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

## Current position (2026-09-16 02:55Z)
- **N2 delivered and natively closed on Build54** (Unity a5e8340b / TS eafd551e, exe a332e3bc…, seal 49, admission 45): F13–F24 PASS natively
  (F21/F17a/F17b fixed by IMPL-23); declared: C9 body viewport at 1280×720/200 %, C8 rail font floor (N3 measures), people-rail parking
  asymmetry, the stale route's mid-display step (driver aim drift). K10 + addendum atop the handoff.
- Running now: TEST-21 (re-express one superseded assertion; then the rendered full suite on a5e8340b) and **SIM-20 (the batched TS read-model
  deltas for N4/N5/N6 with schema/DTO regen)** — the Unity DTO regen + paired seal come with N3/N4's next build.
- Next: IMPL-N3 (`r3n3/IMPL-N3-brief.md`: stage sprites, font coverage tests, portrait slots, coverage statement) → tests → rendered → Build55
  (paired with the regenerated DTO) → native art/font captures → K11 → N4.
- Budget checkpoint 02:20Z stands (capability ≈ 40 h; unprotected reserve ≈ 1.2 h; overrun rule published in the plan).

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. F21: IMPL-22 diagnosis → fix → TEST-21 → rendered → Build54 → guarded native F21 check (N2 key plan) → K10 addendum.
2. N3 implementation (IMPL-N3) + TS deltas (SIM-N4) → TEST → rendered → Build55 → native art/font captures → K11 → N4.
