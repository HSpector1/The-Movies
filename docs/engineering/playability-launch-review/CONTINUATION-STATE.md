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
| Unity source candidate | HSpector1/project-studio-unity-visual-spike `wip/playability-interaction-01-client` (currently 288c4ddb; Build56) |
| TS source candidate | HSpector1/The-Movies `wip/playability-interaction-01-ts` (currently 70a8c3ec + this record; production TS at projection 31 since d02230a8) |
| Private review evidence (reports, xml, captures, native attempts, manifests) | HSpector1/project-studio-unity-visual-spike `docs/playability-delivery-review-20260913-01` → `docs/evidence/r3n1-native-correction-20260915-01/00-START-HERE.md` (c80743db) and `docs/evidence/playability-delivery-20260913-01/` |
| Budget ledger (git-ignored evidence, local) and private stamps | TS `evidence/Playability-Interaction-01/entry/budget-ledger.json`; git-private `fable-local-transfer-20260914-01/r3n1-ledger-local.json`; totals are restated in every handoff record |
| Full local-evidence mirror (nothing stays local): text-class evidence in Git; captures/movies/large payloads as release assets | private Unity repo, branch `docs/playability-delivery-review-20260913-01` → `docs/evidence/local-mirror-20260915/` and GitHub Release tag `evidence-mirror-20260915` (assets listed in its notes) |
| Owner playtest list for Howard's return | `docs/engineering/playability-launch-review/OWNER-PLAYTEST-LIST.md` (grows with each phase) |

## Current position (2026-09-16 06:45Z)
- **Build56** bound and admitted: Unity 288c4ddb / TS 70a8c3ec, exe 84f1a896…, seal 51 PASS (DTO blob 253e345a, projection 31), **admission 46
  PASS** (admission script now contract-driven). Correction: Build55 was sealed (50) but never admitted — the earlier "admission 46" claim
  for it was wrong; 46 is Build56's. **N3 delivered** (record K11 in the handoff): stage art 8/8, C2 font law + probe (F25 refuted), C1
  portrait cache/slots (0 captures until N5's BodyResolver, declared), TS read-model deltas at projection 31 with every fixture family
  regenerated; EditMode 1916/1916; rendered PlayMode 219/221 + 2 NativeOnly; native chains 55 + 56 clean except **F26**.
- **F26 (product, native):** at 1280×720 @ 100 % on the dense-02p31 route the Development card's `development-review-open` publishes above the
  viewport (y = −82) under `inspector-fallback` ("lane not composed") after a workspace closes → review route unreachable; the UX-STALE
  mid-display invalidation step stays NOT EXERCISED. Assigned to N4 IMPL-26 item 3a.
- **Independent review AUDIT-01 (N3): REFINE** — §5.1–§5.4 font tests against the real face and the §5.5 proof set missing → TEST-24
  (running); stale C8 comment blocks → IMPL-26 item 0; portrait invalidation bookkeeping → N5.
- **IMPL-26 landed** (Unity 6de4d41d…e360b608, pushed; EditMode 1926/1926 ×2): shared measured bottom (`StudioResponsiveChromeContracts.Surface*`
  + `StudioSurfaceFooter`), F2 footer (reason pinned beside execute, context height derived), F1 card scrolls/clips at every text size
  (**F26 root cause**: the Development card only scrolled and clipped at text ≠ 100 %, so at 100 % its bottom band was published off-screen),
  W3 hit heights, 4B attention word, F3/F5 retained, F4 casting cluster under More-actions. Declared: the 4-action review footer is not under
  More-actions (the card has no pinned footer); Escape rung 2 for the new disclosures is the host input owner's. Rendered full suite on
  e360b608 (`r3n4-03/playmode-rendered-n4-01.xml`): 223 total / 218 passed / 3 failed — two N1/N2-proven viewport floors regressed
  (Production decision context 0 px at 1280×720 @ 100 %; Profile renew explanation 74 px at 1280×720 @ 200 %) → **IMPL-27** (writer, running);
  one TEST-24 sparse-control expectation contradicts the empty-roster rail law → TEST-25 item 0.
- **IMPL-27 landed** (Unity f391d20b, e3597859, caec24ef; EditMode 1926/1926): F2 context block measured (a ScrollView has no intrinsic
  height, so "auto" was 0); Profile mid-decision floor `ApplyContractReviewFloor` (the W3 control floor had eaten the explanation at 200 %);
  `CompactInspectionRouteFor` names the fallback's real reason. Rendered confirmation pending.
- **Projection 32 adopted in Unity** (DATA-08 DTO blob f84700be, DATA-09 P11 fixtures, DATA-11 embedded wire; TS DATA-10 generator
  idempotence): whole-platform EditMode then showed 293 failures, all "Cannot write a null value for property 'operationsEvents'" from
  hand-built test snapshots → **TEST-26** (test-author, running) adds the member via the shared builder. TEST-25 (N4 contracts, F26 rendered
  regression, DATA-07 p32 fixtures) running concurrently.
- **N4 in progress:** IMPL-26 (writer, `r3n4/IMPL-N4-brief.md`: shared bottom clamp, F2 footer redesign, F1 card refine + `attention`
  cue, F3/F5 retain, F4 casting refine, F6 route geometry, F26) running concurrently with TEST-24. Next: SIM-N7-01 (TS
  `operationsEventsProjection`, projection 31 → 32) once IMPL-26's Runtime edits are built, then fixture regeneration, DTO adoption, TEST,
  rendered, Build57, seal 52 / admission 47, native on the changed routes, K12.
- TEST-24 landed (Unity d859de9e / 4e5e3a36, EditMode 1926/1926): 188 drawn glyphs all resolve in the tier-0 face, atlas rebuild re-measures,
  XAG ladder measured → **C8 amended** (TS c581287f: ink-basis deviation declared for all five faces; title anchor holds on the box basis
  only). Its PlayMode §5.5 class still needs the rendered Editor slot (after IMPL-26 commits). SIM-N7-01 (sim-core, TS) dispatched 05:49Z.
- Design ahead: N7 sheet (C12 adopted), N8 sheet (C13: four routes ratified). Budget: capability remaining ≈ 38.3 h; reserve ≈ 5.9 h —
  the unprotected reserve is exhausted, 0.08 h drawn past the 6-h protection line; all further verification is reported as overrun.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. IMPL-26 report → TEST-25 (N4 per-state contracts + the F26 rendered regression + the 3-action fixture) → rendered full suite → Build57.
2. SIM-N7-01 (`r3n7/SIM-N7-01-brief.md`) → regenerate P11 EditMode fixtures, PlayMode embedded wire, native p32 fixtures (memory rule) → adopt
   the DTO in a paired Unity commit → seal 52 / admission 47 → guarded native on the N4 routes incl. F26 and the mid-display invalidation step
   → K12 (N4) + evidence publish + playtest list.
3. N5 → N6 → N7 (help owner + attention store + History rows) → N8 (four ratified drag routes) → N9 → P13B → P14 → P15 → P16.
