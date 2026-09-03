# P06C — Movie Pipeline Rail + Living Lot Iteration Lab — FINAL REPORT (§25)

## P06C ITERATION STATUS
**COMPARISON CANDIDATE — isolated, NOT integrated.** Three surfaces delivered to a proven candidate:
Priority Zero (rail↔guidance-card state-truth fix), the grouped movie pipeline rail (primary target),
and a bounded People/Talent awareness strip. All proof floors green; **fresh hostile review: ACCEPT
(0 blocking)**.

## CAMPAIGN WINDOW & ENVIRONMENT
- Start 2026-09-03 12:00:43 CEST · hard deadline 20:00:43 CEST (+8h).
- Bruces-MacBook-Pro.local · macOS 26.6.2 arm64 · Unity 6000.3.22f1 · Node v24.16.0 · session unlocked/on-console.

## EXACT P06B CONTROL (preserved, verified intact — never overwritten)
| Item | Value |
|---|---|
| Candidate dir | `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/` |
| TS campaign tip | `04b67eccb50ac59484372a2c78b9455cee0ef9f3` (`campaign/living-lot-ts`) |
| TS engine/product commit | `493ca8091c9df669a6363555a68419731625449e` |
| Unity product/campaign tip | `18a288715bb88281dcc51f4252858f2fbabff404` (`campaign/living-lot-client`) |
| Player exe sha256 | `130a13a0f19e688fc2bb4b8ba4bd9282430b3d62ecd105f3ff7ad4651d534d49` ✅ verified on disk |
| Assembly-CSharp sha256 | `3ba5ba105bd2c4d757b0dbdb8695bb98f278c5a24cbc8ed5c92ed22d502ff623` |
| Engine bundle sha256 | `a74ed0dde22a365eac0b14b8cae168f28dac13b87856e584301a1e15546b9aab` |
| schema / protocol / save | `sha256:71529afd…` · protocol 4 · save V16 (no separate projectionVersion — protocol 4 governs the DTO) |
| P06A candidate (also intact) | `~/Desktop/P06A-Owner-Candidate-465ab45-7d6d974/` exe `aabc41f8…` ✅ |

## EXACT P06C WIP (isolated branches, pushed; campaign branches untouched)
| Repo | Branch | Tip |
|---|---|---|
| TypeScript | `wip/p06c-movie-pipeline-ux-01-ts` (hspector-github) | (docs tip advances; engine-binding `d66b7ab`) |
| Unity | `wip/p06c-movie-pipeline-ux-01-client` (origin) | `438feb2b7446…` |

- **Sealed P06C player:** exe sha256 `2c235c390ae7fc8dce28ae62ab7c8e0b8479cac3706523c4200f04bec9f6474a`,
  Assembly-CSharp `12478c050f626117…`, engine bundle `c00cbfd5de82b7d1…` (rebuilt WITH the Priority Zero
  fix — differs from P06B's `a74ed0dd…`), Unity `438feb2`. schema/protocol/save unchanged (V16, protocol 4).
- Delta vs P06B: **TS** `src/core/firstFilmJourney.ts` (Priority Zero) + one contract test; **Unity**
  presentation-only — new `StudioMovieSlateContracts`, `StudioPeopleRailContracts`, `StudioPeopleRailHud`,
  reworked `StudioProductionRailHud`, bootstrap + camera-input wiring, 3 guard tests updated, 2 new test
  files. **No engine/contract/DTO/save/economy change** beyond the guidance-card copy owner.

## TRUTH-CONTRADICTION FIX (Priority Zero, §5)
Reproduced on the control (Oracle scenario 2): the left guidance card said **SHOOTING** while the rail
said **POST · WAITING** for the same `prod-0002`. Root cause (the state OWNER, not a string):
`firstFilmJourney.ts` composed the card from the raw `workflow.phase`, which stays `'shooting'` for a
wrapped picture until a Post reservation frees. Fix: `inProductionView()` now derives
`wrapped-waiting-for-post` from the **same core facts** `closedOperationalState()` uses (phase +
facility-capacity blocker → postProduction), ahead of the phase-keyed branches, and emits agreeing copy
(**WAITING FOR POST** / beat `post-production` / "Principal photography wrapped."). Raw `phase`
(oracle-pinned engine truth) is untouched. **Regression test:** `p05a-w2-closed-production.contract.test.ts`
loads the canonical scenario-2 fixture and asserts the rail projection AND `firstFilmJourney` agree.
**Proven in pixels:** `evidence/p06c/priority-zero/` before(SHOOTING)/after(WAITING FOR POST) at 1440×900.

## MOVIE RAIL (§7–§13, §17–§18)
- **Grouping:** one continuous rail, restrained headers **SCRIPTS · MAKING MOVIES · POST & RELEASE**
  (a header only for a non-empty group), via new pure `StudioMovieSlateContracts`. Render, hit-test, and
  height all read ONE shared slate, so the eye and the click model can never disagree.
- **Row anatomy / lifecycle / attention:** unchanged from the P06B-reviewed row (title + specific state +
  six-segment discrete lifecycle track, never a %; semantic accent + chip word — colour always rides a
  word/shape; committed=green "releases next week"; graceful title ellipsis).
- **Interaction:** world-first preserved — a row selects/Locates only, commits nothing; physical buildings
  open without rail priming (real-HID calibration clicked the rail's `rail-locate-casting` control).
- **Grouping / collapse (§10):** attention-priority cap — an action-required/blocked row is NEVER dropped;
  steady rows overflow first with an honest "+N more". Assembly unit-proven for 0/1/many, same-phase (one
  header), and same-title (exact-id keying — the p05a-w2 same-title contract still passes).
- **No P07:** no Released/In-Theaters/earnings group; no blank "coming later" rows.
- **Performance:** the slate is assembled from already-projected rows (no per-frame scene search); the
  layout is a single cumulative pass shared by draw + hit-test.

## PEOPLE / TALENT AWARENESS (§14)
A compact, **read-only** right-column strip below the movie rail (`StudioPeopleRailHud` +
`StudioPeopleRailContracts`) built ENTIRELY from `snapshot.people.presence.people[]` — **no engine/DTO
change**. Shows COMPANY count (N working · M available), who is working and on which movie, reserved rows
for available talent (so "who is available" is answerable on its face, not buried), and "Hire more at the
Casting building". Carries **no hidden skills or rankings** (never touches the casting-candidate pools),
**invents no return week** (the presence projection has none), commits nothing, yields to every deeper
surface, and is wired into the camera-input world-pick guard. The Casting shortage→Find route is untouched.

## BUILDING CARDS (§15) · WORKSPACE/GUIDANCE (§16) · deeper §8/§17-20
Documented, ready-to-execute backlog (`P06C-NEXT-WAVES-BACKLOG.md`) — deferred to keep the pass focused
(§21) and protect the mandatory closers. The building selection surfaces already read `operationalState`
current-truth (no contradiction there); this is a grammar/layout convergence, not a truth fix.

## ORIGINAL THE MOVIES ADAPTATION (§6)
`docs/research/P06C-ORIGINAL-THE-MOVIES-IA-MATRIX.md` — retained principle: **one named movie stays
visible as it moves through the studio** (stable `productionId`). Adopted: right-side per-picture rows
grouped by pipeline stage; persistent movie identity; peripheral people awareness; physical department
ownership. Rejected: pixels/trade dress, draggable film cans, tiny cards, manual archive, naked %
bars, released/earning rows on the active rail (P07).

## BEFORE / AFTER REVIEW (§4/§19 — iterations)
- **Priority Zero:** 1 implementation → kept (before/after captured; the fix flipped the card in pixels).
- **Movie rail grouping:** 1 implementation → kept (rendered clean; POST & RELEASE header over the slate).
- **People strip:** 2 iterations — v1 buried available talent under overflow (§14 gap); **revised** to
  reserve slots for available people; kept. **Reverted:** none.
- All comparisons use the same oracle fixtures/camera/viewport (1440×900). The oracle scenarios are
  post-family, so the live rail capture exercises the POST & RELEASE group; the three-group assembly is
  unit-proven (a mixed-slate hero capture is backlog §19).

## TEST FLOOR (§22)
- **TypeScript:** 4904 passed / 0 failed (5 skipped) — includes the new Priority Zero §5 contract test.
- **Unity EditMode:** **750/750** (new `StudioMovieSlateContractsTests` + `StudioPeopleRailContractsTests`;
  3 signature-pinned guards updated faithfully — not weakened).
- **Bridge/contract (CF-09):** unaffected — no DTO/Generated/projection change (presentation + guidance-copy only).
- **Visual Oracle:** 6/6 playerExit=0 on the sealed exe `2c235c39` (machine assertions + image bytes inspected).
- **Real-profile-copy journey (§24):** 25/25; durable original sha unchanged + still read-only.
- **Real owner-input HID (§25):** **OVERALL PASS** on the sealed build — element map on, calibration PASS
  on the rail's own `rail-locate-casting`, journeys A 24/24 · E 4/4 · F 1/1 (5 state-gated casting steps
  BLOCKED, not regressions). `evidence/p06c/hid/owner-input-proof-report.txt`.

## HOSTILE REVIEW (§23)
**VERDICT: ACCEPT — 0 blocking findings.** A fresh independent reviewer verified all three claims against
source, tests, and image bytes in both worktrees; re-ran the TS floor (**4904/0**) and the Priority-Zero
§5 contract test (**11/11**); opened the before/after and oracle PNGs; and confirmed the three
signature-pinned guard-test edits track a real API change and were **not weakened**. It confirmed: the
Priority Zero fix reads `workflow.blocker + phase` (the state owner, not a relabel) via the identical
predicate the rail uses; the rail renders/hit-tests/heights from ONE shared slate (no disagreement),
keys same-title movies distinctly, shows no P07/Released/earnings group, and uses a discrete track (no %);
the People strip carries no hidden ratings (the DTO has none), invents no return week, surfaces available
talent (reserve), is read-only, and leaves the casting shortage→Find route intact.
- **Non-blocking observations (accepted, none require a code change):**
  1. The slate joins entry→row by a per-frame array index, not a stable id — safe because render + hit-test
     rebuild+read the same list within one `RailWanted()` pass. **Addressed** with an explicit INVARIANT
     comment (`StudioProductionRailHud`, source-only — sealed binary unchanged).
  2. No single oracle image shows all three group headers at once (the P06 oracle fixtures are
     Post/Release-heavy; two groups appear in `committed-to-release`); the full three-group ordering is
     unit-proven by `StudioMovieSlateContractsTests`. A mixed-slate hero capture is backlog (§19).
  3. "Attention never dropped" holds until attention rows alone exceed the cap (6); beyond that even
     attention rows overflow, reported honestly in `hidden`. Inherent to any capped list; not reachable
     in the evidence. Backlog notes a scroll/expand owner for >6 movies.

## COMPARISON CANDIDATE PATH (§24)
`~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/` — sealed app + one-command launcher + manifest +
P06B/P06C before-after images + oracle/HID evidence + docs + this report. **P06B candidate NOT
overwritten** (verified intact). Created after hostile ACCEPT.

## CAMPAIGN BRANCHES — UNCHANGED (§24)
`campaign/living-lot-ts` = `04b67ec` and `campaign/living-lot-client` = `18a2887` — recorded at setup,
never touched by P06C. No fast-forward, no merge, no P06-accepted claim, no P07.

## WORKTREES / PROCESSES
- Isolated worktrees `~/The Movies - P06C Impl TS` / `~/The Movies - P06C Impl Unity`, clean + pushed.
- Owned processes: the P06C `caffeinate` (scratch pid) — **stopped at seal**. No engine/player/Unity left running.

## OWNER COMPARISON SCRIPT & NEXT ACTION
`docs/campaigns/P06C-OWNER-COMPARISON-PLAYTEST.md`. **Owner:** launch the P06B control and the P06C
candidate on the same demo, compare the three surfaces (Priority Zero truth-agreement, grouped rail,
People strip), and either ACCEPT P06C as the replacement candidate (a later explicit ruling authorizes
integration) or report the exact worse step. **Nothing is integrated until that ruling. No P07.**
