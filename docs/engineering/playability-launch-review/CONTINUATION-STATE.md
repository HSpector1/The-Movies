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

## Current position (2026-09-16 01:00Z)
- **Build52** bound on Unity 231585e9 / TS 73ce1a9b (exe 4def44113462cdb0380e590779e00a73b62a7056b241242913511a4d252a51a9, seal 47 PASS,
  admission 43 PASS); rendered suite 215 total / 213 passed (two harness-only failures in the newest test class, TEST-17 fixing). Native on
  Build52: N2C 1440×900 and N2D 1280×720 (dense-01) and **B4 dense-02 1280×720 (100 actions)** all complete with clean input/quit.
  Natively: F16 PASS (spent-press latch), F18 PASS, F17b ring now contiguous, DATA-1 pictures overflow PASS ("1–3 of 4", paging),
  the 1280×720/200 % cell hosts the person overlay. New: F21 (Down steps the ring backwards instead of the row cursor — keyboard row
  navigation broken), F22 (1280×720/200 % with four pictures shows zero cards), F23 (script cards publish no activation element), and the
  Schedule-take execute control was published+enabled but the driver's click found no target (transient; re-run with observe-before-click).
  IMPL-20 read-only diagnosis running; then fixes, TEST-18, rendered, Build53, native rerun, K10.
- Design sheets ready for N3–N6; stage sprites authored (d133f509). Plan rulings C8/C9 recorded.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. N2: integrate IMPL-12 + DESIGN-03 → test-author TEST-09 (EditMode + PlayMode) → rendered PlayMode suite → Build51 + seal + admission →
   native regression of the changed rails/overlay (guard-admitted) → K10 record → N3.
