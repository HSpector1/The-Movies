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

## Current position (2026-09-15 23:05Z)
- **Build51** bound on Unity bb23f87e / TS 69737725 (exe dc4d480628a5eb6bce31643bf3a529ce462166264342a3c810618810c626c5de, seal 46 PASS,
  admission 42 PASS); rendered suite 210/211 (one More-actions cell assertion still iterating). N2 native runs on Build51 DONE (N2A 1440×900,
  N2B 1280×720; K10 draft in the review folder): F18 PASS natively; the 1280×720/200 % cell hosts the person overlay but its footer wraps
  and leaves a 52-px body; F16/F17a/F17b still open natively. Root cause found for several of these: the lane inspector fonts are scaled
  twice (150 % renders at 225 %) — IMPL-17 is fixing that plus registry withdrawal, F16, F17a, F17b. Then TEST-14 (re-derive number pins),
  rendered rerun, Build52, N2 native rerun + Run B (dense-02; manifest path spelling corrected), K10 record.
- Design sheets ready for N3–N6 (d9b5e239, 95ec9a3d, 4d041fb7, 0ad64fa6); DESIGN-08 authoring the two missing stage sprites.
- Evidence: review folder updated (Build51 runs); release assets uploading.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. N2: integrate IMPL-12 + DESIGN-03 → test-author TEST-09 (EditMode + PlayMode) → rendered PlayMode suite → Build51 + seal + admission →
   native regression of the changed rails/overlay (guard-admitted) → K10 record → N3.
