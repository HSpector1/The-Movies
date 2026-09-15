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
| Owner playtest list for Howard's return | `docs/engineering/playability-launch-review/OWNER-PLAYTEST-LIST.md` (grows with each phase) |

## Current position (2026-09-15 20:10Z)
- Build50 (Unity 74c2141a / TS 43b3a6b1, exe c9816921…, seal 45, admission 41): F7–F15 source-corrected, rendered PlayMode 209/209,
  EditMode 1751/1751, TS 5277/5282. NATIVE PROOF NOT EXERCISED (four blocked attempts; blocker corrected to the coordinator's command
  harness; supervised direct-pipe wrapper tested). Preflight → Run A → Run B are the immediate next native actions, unattended under the
  unchanged guard as authorized by the directive.
- N1 remains a labelled PARTIAL; Owner playtest DEFERRED; Build46 = Current Ops-qualified engineering checkpoint; P13A accepted product.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main only after independent
review + gates; otherwise working branches.

## Exact next actions
1. Wait for owner-idle ≥ 120 s, run `preflight-steps.jsonl` through the supervised wrapper; on PASS run A then B with fresh admissions;
   analyze with check-run v2; record K9 in the handoff; publish captures to the review folder.
2. In parallel (read-only planning): derive the remaining R3 overhaul scope from the handoff's coverage register (C6/S2–S7) and the R3
   selected outcome; publish `plans/R3-OVERHAUL-PLAN.md`.
