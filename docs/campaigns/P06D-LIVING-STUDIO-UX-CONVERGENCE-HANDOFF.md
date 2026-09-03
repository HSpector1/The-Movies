# P06D — Living Studio UX Convergence II — HANDOFF

> Durable campaign memory (§4). Updated + pushed after Entry, after every coherent loop, before
> compaction, before the full visual matrix, before hostile review, before stopping.
> Nothing meaningful may live only in scratch, /private/tmp, a process, chat, or an unpushed tree.
> **Isolated successor candidate — NO campaign integration** (§31). P06B and P06C are byte-preserved controls.

## Status: ENTRY — environment set up, investigation next

Setup complete: both controls verified byte-stable; campaign branches confirmed frozen (local==remote);
P06D branches created + pushed from the exact P06C WIP tips; isolated clean worktrees with COW-warmed
caches; keep-awake started; this handoff written + pushed. Investigation of every touched surface is the
next loop (feeds a committed design; no source-only improvement claims — §5).

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
  real HID PASS. To be re-established green on the P06D build before seal.

## 8. Screenshots / hostile findings / final candidate

- (To be filled per loop under `docs/campaigns/evidence/p06d/…` and `~/Desktop/P06D-Comparison-Candidate-…/`.)

## 9. Owned processes

- `caffeinate -dimsu` (P06D keep-awake) — pid in scratch `p06d-caffeinate.pid`. **Stop at seal.**

## 10. Exact next action

Run the investigation loop: map the rail HUD internals, the five building-card HUDs, the Production and
Post/Release workspaces, the guidance card, the current focus/accessibility handling, and the
capture/oracle tooling + fixture path — to commit a design before any edit.
