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

## Current position (2026-09-15 20:15Z)
- Build50 (Unity 74c2141a / TS 43b3a6b1, exe c9816921…, seal 45, admission 41): F7–F15 source-corrected, rendered PlayMode 209/209,
  EditMode 1751/1751, TS 5277/5282. **Preflight PASS at 20:10Z** (first scripted input acknowledged, clean owned shutdown, evidence
  `early-2026-09-15T20-09-57-345Z`) through the supervised direct-pipe wrapper `coordinator-scratch/r3n1e/native-supervised.sh` (mirrored).
  Run A (tag A5, 1440×900 dense-01) and Run B (tag B1, 1280×720 dense-02) are executing unattended in a detached chain; results go to K9.
- Phase plan published: `plans/R3-OVERHAUL-PLAN.md` (N2–N9, budgets, C1–C7 dispositions). **N2 started 20:13Z** (unity-ui IMPL-12 on the
  rails/overlay close-out; uiux-designer DESIGN-03 on the workspace text-rule addendum + N4–N6 sheet skeletons).
- Local-evidence mirror: text-class evidence, ledgers and coordinator scratch pushed to the private evidence branch
  (`docs/evidence/local-mirror-20260915/`, commit b8e57059); large captures/movies/payloads uploading as release assets
  (`evidence-mirror-20260915`, resumable uploader running detached).
- N1 remains a labelled PARTIAL until the native matrix is recorded; Owner playtest DEFERRED.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. When the A5/B1 chain ends: analyze with check-run v2 (`<run>-check-v2.txt`), fill the K2 native columns, write K9 (runs, per-defect
   PASS/FAIL/NOT EXERCISED, new defects), publish captures to the review folder, push.
2. N2: integrate IMPL-12 + DESIGN-03 → test-author TEST-09 (EditMode + PlayMode) → rendered PlayMode suite → Build51 + seal + admission →
   native regression of the changed rails/overlay (guard-admitted) → K10 record → N3.
