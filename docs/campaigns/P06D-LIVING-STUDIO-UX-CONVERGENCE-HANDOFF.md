# P06D — Living Studio UX Convergence II — HANDOFF

> **CURRENT STATUS — P06 OWNER ACCEPTED — CLOSED. Verdict: ACCEPTED / KEEP / CLOSED.**
> Accepted 2026-09-04 through the combined P06/P07 journey; recorded 19:51:49Z (21:51:49
> CEST), actual playtest time not supplied. Original comparison/pending/process instructions
> below are retained history. They are superseded by the appended final handoff and do not
> request a replay or restart P06 execution.

> Durable campaign memory (§4). Updated + pushed after Entry, after every coherent loop, before
> compaction, before the full visual matrix, before hostile review, before stopping.
> Nothing meaningful may live only in scratch, /private/tmp, a process, chat, or an unpushed tree.
> **Isolated successor candidate — NO campaign integration** (§31). P06B and P06C are byte-preserved controls.

## Status: SEALED — P06D COMPARISON CANDIDATE READY (hostile ACCEPT) — OWNER COMPARISON PENDING

Terminal state: isolated candidate at `~/Desktop/P06D-Comparison-Candidate-050b98e-23c000a/` (player exe
`076e8c62` byte-verified · asmC# `2328c855` · engine `c00cbfd5` unchanged from P06C). All floors green — TS
4905/0 · EditMode 762/762 · Oracle 8/8 · real-profile 25/25 · real HID OVERALL PASS. Fresh hostile review
**ACCEPT (0 blocking, all 26 §30 items pass)**. P06C `2c235c39` + P06B `130a13a0` byte-preserved; campaign
`04b67ec`/`18a2887` UNCHANGED (local==remote); worktrees clean; caffeinate stopped; no owned processes; no
P07; NOT integrated. Owner next: `P06D-OWNER-COMPARISON-PLAYTEST.md` — compare P06C vs P06D, ACCEPT or report
the worse step. Only a later explicit ruling authorizes integration.

## (history) Status: INVESTIGATION DONE — committed design written; implementing next

Setup + investigation complete. Both controls byte-stable; campaign frozen; P06D branches pushed from exact
P06C tips; caches warmed; keep-awake up. An 8-mapper read-only Workflow mapped every touched surface; the
committed design is in **`docs/campaigns/P06D-COMMITTED-DESIGN.md`** (every decision cites an authoritative
fact — no source-only claims). Headline findings: (1) rows never draw location/plain-state though
`facilityLabel`/`stateLabel`/`nextMilestone`/`weeksRemaining` are authoritative → title-first rework; (2) no
scroll owner (cap silently drops >6 movies) → one scroll owner; (3) no focus system anywhere → smallest
shared focus ring; (4) money ABSENT from rail/card DTOs → §26 amounts not renderable without a forbidden wire
change (no fabrication); (5) real workspace defects (Production CTA scrolls off; Casting Back styled primary);
(6) Post building has no card; (7) fixtures are digest-bound → mixed-slate hero added to the generator.
Implementation order: hero fixture → rail row anatomy → scroll owner + identity → a11y focus → workspace
convergence → building-card truth agreement → guidance → People/economy → docs → matrix/proof → hostile → seal.

## 1. Campaign clock & environment

- **Entry (local):** 2026-09-03 17:2x CEST · **Machine:** Bruces-MacBook-Pro.local · macOS 26.6.2 (Darwin 25.6.0) · arm64
- **Unity:** 6000.3.22f1 · **Node:** v24.16.0
- **P06D keep-awake:** `caffeinate -dimsu` pid recorded in scratch `p06d-caffeinate.pid` (stop at seal). The
  Owner's own `~/Desktop/project-studio-caffeinate.pid` is separate and is **never touched**.

## 2. Exact control candidates (§2) — resolved from manifests + Git, verified byte-stable

Both are comparison controls. **Do not overwrite either; do not move campaign refs.**

### P06B control — `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/`
| Item | Exact value |
|---|---|
| TS product/engine commit | `493ca8091c9df669a6363555a68419731625449e` (engine bundle `a74ed0dde22a365e…`) |
| TS docs/campaign tip | `04b67eccb50ac59484372a2c78b9455cee0ef9f3` (`campaign/living-lot-ts`) |
| Unity product/campaign tip | `18a288715bb88281dcc51f4252858f2fbabff404` (`campaign/living-lot-client`) |
| Player exe sha256 | `130a13a0f19e688fc2bb4b8ba4bd9282430b3d62ecd105f3ff7ad4651d534d49` ✅ verified on disk |
| Assembly-CSharp sha256 | `3ba5ba105bd2c4d757b0dbdb8695bb98f278c5a24cbc8ed5c92ed22d502ff623` |

### P06C control — `~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/`
| Item | Exact value |
|---|---|
| TS engine-binding commit | `d66b7ab3de418ff91c50cdef38711d9521bc7efa` (engine bundle `c00cbfd5de82b7d1…`) |
| TS docs tip (branch head) | `cf5afc9618b59a993dc0161067a4f1d568d15857` (`wip/p06c-movie-pipeline-ux-01-ts`) |
| Unity build commit | `438feb2b7446eaa7fedf63992aa4c2049af30b3e` (comment-only `43c401eb414f9e89…` after = branch head) |
| Player exe sha256 | `2c235c390ae7fc8dce28ae62ab7c8e0b8479cac3706523c4200f04bec9f6474a` ✅ verified on disk |
| Assembly-CSharp sha256 | `12478c050f626117258694f655e5ab1308a8062812d88a1684a6518d4fed5e3b` |
| schema / protocol / save | `sha256:71529afd…` · protocol 4 · save **V16** |

P06A candidate also intact: `~/Desktop/P06A-Owner-Candidate-465ab45-7d6d974/` exe `aabc41f8…`.

## 3. Campaign refs baseline (must remain UNCHANGED through P06D — §31)

- `campaign/living-lot-ts` = `04b67ec` (local == remote hspector-github confirmed at setup)
- `campaign/living-lot-client` = `18a2887` (local == remote origin confirmed at setup)

P06D never touches these. Recorded so the final report can prove they never moved.

## 4. P06D isolated branches + worktrees (§3)

| Repo | Branch | Base (P06C tip) | Worktree | Pushed |
|---|---|---|---|---|
| TypeScript | `wip/p06d-living-studio-ux-convergence-02-ts` | `cf5afc9` | `/Users/bruce/The Movies - P06D Impl TS` | hspector-github ✅ |
| Unity | `wip/p06d-living-studio-ux-convergence-02-client` | `43c401e` | `/Users/bruce/The Movies - P06D Impl Unity` | origin ✅ |

Caches COW-warmed from the P06C worktrees (TS node_modules+dist; Unity 2.1G Library). One editing owner
per checkout / collision-prone file. Campaign branches are not edited. No end merge (§31).

## 5. Planned loops (§5 iteration model: baseline → hypothesis → implement → same-state capture → OPEN IMAGE → review → keep/revise/revert; ≤4 visual iterations/surface)

1. **Investigate** all touched surfaces (rail internals, 5 building cards, 2 workspaces, guidance card,
   a11y/focus state, capture/oracle tooling, mixed-slate fixture path).
2. **Mixed-slate hero fixture** (§12) — deterministic UI-proof fixture, all three groups, 6–8 movies.
3. **P1 rail row anatomy + lifecycle + attention** (§6–9).
4. **P2 rail scale + one scroll owner + cap law** (§10–11); **title/identity stress** (§7).
5. **P3 building-card convergence** (§13–18).
6. **P4 workspace convergence + guidance de-emphasis** (§19–20).
7. **P5 accessibility / visible focus** (§21); **responsive stress** (§22).
8. **People strip refinement** (§23) + **economic clarity** (§26).
9. **Docs**: Original *The Movies* adaptation (§24), Hollywood Wire/P07 future seam (§25), performance (§27).
10. **Before/after matrix** (§28) + full **proof floors** (§29).
11. **Hostile review** (§30) → ACCEPT.
12. **Seal**: preserve candidate (§31), owner comparison (§32), final report (§33).

## 6. Owner map (one editing owner per file/checkout)

- **TS worktree** (`P06D Impl TS`): engine/projection/fixtures/tests — sole owner.
- **Unity worktree** (`P06D Impl Unity`): all Presentation/Infrastructure HUD + tests — sole owner.
- No cross-editing of campaign, P06B, or P06C worktrees.

## 7. Test state

- Baseline inherited from P06C seal: TS 4904/0 · Unity EditMode 750/750 · oracle 6/6 · real-profile 25/25 ·
  real HID PASS.
- **After row-anatomy loop (#48):** Unity EditMode **755/755** (+5 new §6/§8 rail-contract tests). Oracle
  (incl. new **s7 mixed-slate-hero**) playerExit 0 on the P06D build. TS floor + full matrix + HID re-run
  scheduled for the proof phase (§29).

## 8. Progress log (loops kept)

- **#47 mixed-slate hero fixture (§12) — DONE + committed (TS `a96df6c`).** Generator scenario 7
  `mixed-slate-hero` (week 37): SCRIPTS (script-0004 readyToPackage + script-0005 needsReview), MAKING
  MOVIES (prod-0001 shooting + prod-0002 director-required), POST & RELEASE (prod-0000 release-ready +
  prod-0029 post-handoff). s1–s6 byte-identical (verified). Public actions only; no law change.
- **#48 rail row anatomy (§6–9) — DONE + committed (Unity `71e3373`), proven in pixels.** Title-first
  hierarchy; plain-language SECONDARY state (`stateLabel`); TERTIARY `facilityLabel · N weeks left`
  (authoritative — big win vs P06C which drew no location); six distinct §8 attention states via new
  `AttentionOf` (WAITING slate ≠ BLOCKED amber; RELEASE READY/ACTION ▸ + thicker accent; COMMITTED green;
  AUTONOMOUS calm); discrete 6-seg track kept; truncated-title tooltip (§7); new `StudioUiTokens.Waiting`
  + `.Focus`. Wired s7 into the oracle (runner + shell) for §29 mixed-slate machine proof. Two §5
  revise-loops: (a) long state wrapped past the plate → clip+no-wrap; (b) state ran under LOCATE → clip to
  title column. Evidence: `Evidence/P06D-build{1,2,3}-*` (Unity worktree).
- Sealed P06D exe after #48: `fad37ee1…` (rail changed; not the final seal). P06B/P06C controls untouched;
  campaign refs still `04b67ec` / `18a2887`.
- **#49 rail scale + ONE scroll owner + cap law (§10–11) — DONE + committed (Unity `10ac5e8`), proven in
  pixels.** Single `BeginScrollView` owner; NO silent cap (all rows reachable — §11); bounded viewport
  (never overruns the lot); content-space hit-test + screen-space LOCATE publish (HID-safe) + withheld when
  scrolled out; wheel + PageUp/Down/End (arrows/Home stay with the camera). Tuned so a ~6-row slate fits
  unscrolled at 1440×900 (clean hero) while 8+/14 scroll. EditMode 758/758 (+3 viewport-law tests).
  Scale-stress oracle scenario (14 rows) proves bounded scrolling (playerExit 0); hero proven unscrolled.
- **#47b scale-stress fixture — DONE + committed (TS `67c6352`).** Generator scenario 8 `scale-stress` (week
  12, 14 readyToPackage screenplays, no productions); additive `writerReuseCount` param keeps s1–s7 byte-
  identical (verified).
- **#53 accessibility / visible focus (§21) — DONE + committed (Unity `538b9ae`).** Rail: Tab/Shift+Tab blue
  focus ring (wrapping, visible order) + brass selection ring (selected != focused, both outline shapes),
  Enter/Space activates (Locate), focused/selected auto-scroll into view. UI-Toolkit workspaces: visible
  `Button:focus` outline. New `StudioUiTokens.Focus`. EditMode 760/760 (+2 focus-advance-law tests). The
  interactive rings are input-driven → their visual confirmation comes from the real-HID proof (§29); the
  static oracle capture is unchanged (no regression). People-strip focus rides the §54 pass.
- **#55 docs (§24 adaptation, §25 Hollywood Wire/P07 future seam, §27 rail performance) — DONE + committed
  (TS `e16f87d`).** §27 honestly notes IMGUI BeginScrollView clips but does not virtualize → drawn work is
  O(total rows); virtualization recommended as a future option. RowHeight is 96f (code-true).
- Sealed P06D exe after #53: `a129eb3d…` (not the final seal).

- **#52 workspace convergence (§19) + #51 building-card truth (§13–18) + #54 People (§23) — DONE + committed
  (Unity `23c000a`).** §19: Casting Back de-emphasised (`.workspace-back`, no longer `.primary-action` — forward
  outranks Back, CONFIRMED in the HID Casting-workspace capture); Production disabled-CTA styling; Production
  blocker → left-rule amber danger callout; Production primary CTA pinned in a persistent action strip (never
  scrolls off). §51: rail↔world-card↔workspace↔guidance TRUTH agreement proven by a new contract test (TS
  `050b98e`); the Casting entry STATUS *sentence* was SKIPPED honestly (no authoritative sentence field — would
  fabricate state). §54 People: footer is now an actionable "Open Talent" affordance + keyboard focus ring.
  §7 identity: duplicate-title + same-suffix rows proven distinct by exact id.

## PROOF (§29) — ALL GREEN on the final build (exe `076e8c62`, ts `050b98e`, unity `23c000a`)
- **TS floor 4905/0** (+item-2 truth test) · **Unity EditMode 762/762** (+5 §6/§8 rail, +3 scroll, +2 focus, +2 identity) ·
  **Visual Oracle 8/8** playerExit 0 (incl. s7 hero + s8 scale-stress) · **real-profile journey 25/25** (original
  untouched + read-only) · **real owner-input HID OVERALL PASS** (calibration PASS on the reworked
  rail-locate-casting; journey A 24/24 attempted / 5 state-gated BLOCKED = not regressions; E 4/4; F 1/1) ·
  bridge/CF-09 unaffected (no wire change).
- **a11y runtime (§21 item 4) CONFIRMED in pixels:** the HID click-selection capture shows the blue focus ring
  on the clicked rail row; camera not hijacked; Tab moves focus only (no camera, no activation — EditMode + code).
- **Seven pre-hostile proofs all PASS:** no cap hides selected/blocked/ready/action rows (scroll owner = no cap);
  "+N more" not used live (no omission); one scroll owner at 10–15 (scale-stress 14 + viewport law); rail/card/
  workspace truth agrees (item-2 test); no P07 state on the rail (lifecycle stops at COMMITTED); P06C `2c235c39`
  + P06B `130a13a0` byte-preserved; campaign `04b67ec`/`18a2887` unchanged.

### Remaining: §22 responsive captures (1280/1720/native) · #57 hostile ACCEPT (§30) · #58 seal + owner comparison (§31–33)

## 9. Owned processes

- `caffeinate -dimsu` (P06D keep-awake) — pid in scratch `p06d-caffeinate.pid`. **Stop at seal.**

## 10. Exact next action

Run the investigation loop: map the rail HUD internals, the five building-card HUDs, the Production and
Post/Release workspaces, the guidance card, the current focus/accessibility handling, and the
capture/oracle tooling + fixture path — to commit a design before any edit.

## Final Owner-accepted handoff — 2026-09-04

**P06 OWNER ACCEPTED — CLOSED; Owner verdict ACCEPTED / KEEP / CLOSED.** The technical
promotion preceded Owner acceptance. Accepted P06D.1 authority: TypeScript product/source
checkpoint `050b98ee15d83883b209b4e0700a06e064a4eb60`, documentation/campaign seal
`72217af1fb580d9d3ae7557e2cdb280a6f29eb11`; Unity product
`23c000a7e0aa1d61d3ad4a620b5dfea7d7ac0bde`, clean build/campaign
`b0c780bb7abd1c81e1c30b59391b7effb86f490f`. Preserved clean candidate:
`~/Desktop/P06D1-Clean-Comparison-Candidate-050b98e-23c000a/`, executable SHA256
`7c2213ba732d761c3f7cb23ab28f7ce92edc11105e6ea7ec50dce14bca19e9c3`.

The actual combined playtest used `~/Desktop/P07A-Owner-Candidate-a6f4f82-c4c65db/`, executable
`c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813`. Its inherited P06
journey passed: readable lot/grouped rail, independent physical Production/Post access,
safe Release Ready hold, exact-title commitment with no time advance, next-week release,
correct result/history/Save-Load, and usable Talent/cards/workspaces/Back/Locate/focus/Menu/Quit.
Acceptance of both packages is explicit; no separate replay of the old comparison is claimed.
Recording time: 2026-09-04 19:51:49Z (21:51:49 CEST); actual playtest time was not supplied.

[The final findings register](P06-TECHNICAL-PROMOTION-P06D1.md#findings-disposition-at-acceptance)
retains and classifies all P06 findings. The Production open-panel screenshot gap, People footer
wording, click-selection/focus observation, and optional memo-placement refinement are DEFERRED
NON-BLOCKER; earlier blocked HID/reviewer-coverage observations are SUPERSEDED for acceptance,
not relabeled in their original evidence. P06D.1's three evidence-index/identity nits are FIXED;
unshipped backlog, missing authoritative fields, broader accessibility, and profiling ideas
remain FUTURE PACKAGE. Rollback candidates remain preserved; no candidate was modified.

No owned Unity/player/engine/bridge/supervisor/proof processes remain; the historical keep-awake
instructions above are inactive. Next is P08A planning/reconciliation through
[the final P07 → P08 handoff](../engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md).
P08 production implementation is **NOT YET AUTHORIZED**. No gameplay change, main merge, or tag.
