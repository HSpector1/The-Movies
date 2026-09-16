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

## Current position (2026-09-16 05:10Z)
- **Build55** bound with the paired projection-31 contract (Unity e83c4095 / TS bc5321fa, exe f48f10bd…, seal 50 PASS, DTO blob 253e345a
  both sides, admission 46 PASS). N3 implementation landed (IMPL-19: stage art 8/8, C2 font law + probe, portrait cache + slots, coverage
  statement) + TEST-22/DATA-04/DATA-06; F25 ("rail double-scaling") REFUTED — the probe multiplied twice, the rails did not (IMPL-25,
  Unity 46e0fae7, probe-only fix). TEST-23 (Unity 566a565e) fixed the F23 board fixture (rendered PASS); its six-person rail test still
  fails rendered at its first row (`people-profile-t-sci-00` unpublished at 100 %) — test owner iterating with rendered class runs.
- N3 native chain on the projection-31 fixtures DONE on Build55 (N3A 1440, N3B 1280 clean; B6 dense-02p31 complete). Build56 (same
  Runtime as 46e0fae7 + tests) → seal 51 / admission 47 → N3 chain 56 (N3C/N3D/B7: probe re-measure, portrait slots, stage art, the
  settled Schedule-take accept step) → K11 (N3) are the next steps once the rendered full suite is green.
- Plan rulings C8–C11 recorded (TS 277276f0). Design ahead of implementation: N4 (95ec9a3d), N5 (4d041fb7), N6 (0ad64fa6) and now
  **N7** `r3-n1-design/R3-N7-HELP-AND-ATTENTION-FAMILY-SHEET.md` (TS 79af664d: F1 help sheets per screen, focus-information line, two-tier
  cue law, badge-clears/history-persists via a host-level acknowledgement store, flood cap 3, `operationsEventsProjection` rows into the
  existing History chips; named dependencies: contract-lifecycle rows, casting-review completion). N8 sheet (optional drag) in progress.
- Briefs staged in the coordinator scratch (mirrored to the private evidence branch at the next publish): `r3n4/IMPL-N4-brief.md`
  (film-journey family, 6 ordered items), `r3n7/SIM-N7-01-brief.md` (`operationsEventsProjection`, projection 31 → 32 with DTO regen),
  `r3n8/DESIGN-10-brief.md`.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. TEST-23 iteration → rendered full suite on the final test commit (expect 219 passed + 2 NativeOnly skipped of 221) → Build56 → seal 51 /
   admission 47 → guarded N3 chain 56 → K11 (N3) + evidence publish (spec append) + CLAUDE.md preamble + playtest list.
2. N4: dispatch IMPL-26 (`r3n4/IMPL-N4-brief.md`) to the writer and, in parallel, SIM-N7-01 to sim-core (TS); then regenerate every fixture
   family at projection 32 (memory rule), adopt the DTO in a paired Unity commit, TEST (3-action fixture + per-state contracts), rendered,
   Build57, seal, native on the changed routes, K12 (N4).
3. N5 → N6 → N7 (help owner + attention store + History rows) → N8 (selected drag routes) → N9 → P13B → P14 → P15 → P16.
