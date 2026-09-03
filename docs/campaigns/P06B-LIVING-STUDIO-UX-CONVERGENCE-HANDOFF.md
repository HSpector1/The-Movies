# P06B — Living Studio UI/UX & Visual Convergence — HANDOFF

> Durable campaign memory. Updated after Entry, after every coherent wave, before any
> compaction/long run/hostile review/final integration/blocker stop, and at least every 4h.
> Nothing meaningful may live only in scratch, /private/tmp, a process, chat, or an unpushed tree.

## Status: SEALED — KEEP CANDIDATE, OWNER ACCEPTANCE PENDING

Terminal state (SUCCESS): P06A HID baseline completed; the Living Studio UI/UX pass (W0 tokens, W1
executive HUD incl. the 1280×800 heartbeat fix, W2 movie rail = primary) implemented and proven;
all floors green (TS 4903/0, EditMode 731/731, oracle 6/6, profile 25/25, real HID PASS); **two
independent hostile reviews ACCEPT** (0 blocking; the one genuine finding fixed + re-proven); campaign
branches fast-forwarded and pushed (TS `48c419d`, Unity `18a2887`, local==upstream==remote);
Owner candidate preserved at `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/` (P06A candidate NOT
overwritten); worktrees clean; owned processes stopped; **no P07 gameplay begun.**
Final status: **KEEP CANDIDATE — OWNER ACCEPTANCE PENDING.**

## 1. Campaign clock & environment

- **Start (local):** 2026-09-03 09:04:28 CEST
- **Start (UTC):** 2026-09-03 07:04:28 UTC
- **Hard deadline (local):** 2026-09-03 21:04:28 CEST (+12h)
- **Machine:** Bruces-MacBook-Pro.local · macOS 26.6.2 (25G83) · Darwin 25.6.0 · arm64
- **Display:** main 1728×1117 pt @ scale 2.0 (3456×2234 px), online + active; session **unlocked, on-console** (`kCGSSessionOnConsoleKey=Yes`, no `CGSSessionScreenIsLocked`)
- **Unity:** 6000.3.22f1 · **Node:** v24.16.0 · **Disk:** 625 GiB free
- **Accessibility:** `AXIsProcessTrusted=true` (CGEventPost works) · **Screen Recording:** works (`screencapture -l` returns real pixels)

## 2. Exact P06A baseline (resolved, not abbreviated; all verified in sync)

| Item | Exact value |
|---|---|
| TS WIP tip (pushed) | `493ca8091c9df669a6363555a68419731625449e` (`hspector-github/wip/p06a-post-release-living-studio-01-ts`) |
| TS engine-bundle commit (oracle capture binding) | `501859dc9947249da5711d4bbfffe79a313f1a6a` |
| Unity WIP tip (pushed) | `7d6d974850054f67f44ec038e1288d1deffb2e10` (`origin/wip/p06a-post-release-living-studio-01-client`) |
| Packaged exe sha256 | `aabc41f80295c2c6030a46ac276801ff5286a178c5e75611d1731cecd08a00cf` |
| Assembly-CSharp sha256 | `43188ee0a543f3d43f3be3279fec91cb4162c6cba3f90bfba8c88b0f4e22a0d6` |
| engine bundle sha256 | `a74ed0dde22a365eac0b14b8cae168f28dac13b87856e584301a1e15546b9aab` |
| schema / protocol / save | `sha256:71529afd…` (s4) · protocol 4 · save V16 |
| Preserved candidate | `~/Desktop/P06A-Owner-Candidate-465ab45-7d6d974/` (exe sha verified intact; **do not overwrite**) |
| Worktree build (byte-identical to candidate) | `The Movies - P06A Impl Unity/Builds/macOS/…` (exe sha identical) |

## 3. P06A HID baseline (§4) — **PASS** (this resolves the sole P06A blocker)

The P06A F4 blocker was purely environmental (locked/inactive display → no on-screen window).
This session is unlocked/on-console, so the journey ran on the **byte-identical worktree build**
(candidate untouched):

- Bridge on the **s4-release-ready** checkpoint; player windowed 1440×900, element map on; window presented (id 5523).
- **Real CGEventPost click** on the memo "Commit City of Gambit to release" button at screen (107,280); modifiers clean before + after (no stuck-Command).
- **Machine-verified via `/snapshot`:** prod-0000 `operationalState` **release-ready → release-committed**; commit intent consumed; advance-week label "Hold … at Release Ready" → "No action is required this week".
- **Visually verified:** right-side rail flipped **RELEASE READY → COMMITTED · Releases next week**; commit button consumed.
- exe sha256 **unchanged** after the run (binary not swapped mid-run).
- Evidence: `docs/campaigns/evidence/p06a-hid-baseline/` (before/after PNGs, snapshots, run-binding, scrubbed logs).
- **This is the P06A technical baseline, NOT Owner acceptance.**

## 4. P06B branches (§5)

- TS: `wip/p06b-living-studio-ux-convergence-01-ts` from `493ca80` → pushed `hspector-github`.
- Unity: `wip/p06b-living-studio-ux-convergence-01-client` from `7d6d974` → pushed `origin`.
- Worktrees: `~/The Movies - P06B Impl TS`, `~/The Movies - P06B Impl Unity`.

## 5. DISCLOSED integration consideration (§30) — TS campaign-branch divergence

- **Unity:** `campaign/living-lot-client` (`784f2d5`) is already an ancestor of the Unity P06A tip → final FF is a clean fast-forward. No action needed.
- **TS:** `campaign/living-lot-ts` (`828e606`) is **NOT** an ancestor of the P06A TS tip `493ca80`; they diverged at `ba55b77`. The 9 divergent commits are **doc-only P06A-era handoff snapshots** (`docs(p06-campaign): handoff …`), superseded by this P06B handoff.
  - **Resolution at §30:** merge `campaign/living-lot-ts` into the P06B-ts line (resolving the handoff-doc conflict in favor of the current handoff), which makes `campaign/living-lot-ts` an ancestor of the P06B-ts tip; then the campaign advance is a pure `--ff-only` fast-forward (no merge commit created by the integration step). No force-push, no history rewrite.
  - This is deferred to §30 deliberately: the superseding P06B handoff will already exist, making the conflict resolution unambiguous.

## 6. Owned processes

- `caffeinate -dimsu` pid recorded in scratch `caffeinate.pid` (campaign keep-awake; **stop at seal/blocker**).

## 7. Wave ledger (updated as work lands)

- [x] Entry / baseline / preservation (§1, §3)
- [x] P06A HID baseline (§4) — PASS
- [x] P06B branches created + pushed (§5)
- [x] Authorities read + reference delta (§6, §8) — `docs/research/P06B-LIVING-STUDIO-UX-REFERENCE-DELTA.md` (+ full synthesis)
- [x] Baseline UX audit (§9) — `docs/ux/P06B-BASELINE-UX-AUDIT.md` (no P0; P1 = narrow-HUD-vanish + rail title clip)
- [x] **W0 visual system + W1 HUD + W2 movie rail (PRIMARY) — code-complete, EditMode 731/731, committed Unity `75d7467`**
- [ ] Visual capture/iterate of W0/W1/W2 (player building) — then W4 building cards, W3 talent
- [ ] Visual review + oracle rerun + UX capture set (§22–23)
- [ ] Profile-copy journey + real HID on P06B build (§24–25)
- [ ] Full test pyramid (§26)
- [ ] Hostile review → ACCEPT (§28)
- [ ] Final integration + candidate + report (§30, §34)

### W0/W1/W2 — what landed (Unity `75d7467`)
- **W0** `StudioUiTokens.cs` (Infrastructure): one shared semantic language — type ladder, spacing,
  greyscale-safe palette (colour always rides a word + shape), light-family surfaces. No dark reskin.
- **W1** `StudioLivingTimeHud.cs`: fixed the executive-heartbeat disappearing at 1280×800 (chip was
  height-suppressed to clear a *founding* confirm sheet absent post-founding). Added
  `ChipShownForPlay` (post-founding band; NOT an overload, so reflection guards stay exact); HUD +
  Development card branch founding-aware via `ChipShownNow`. Active speed/pause = filled brass chip;
  transport min-height 22→30. Founding-time reserve + `ChipMinimumHeight` derivation UNCHANGED.
- **W2** `StudioProductionRailHud.cs` + geometry consts: unified container behind rows; widened
  264→304 (titles stop clipping); row 74→84 seats a **six-segment lifecycle track** (discrete phase
  truth, never a %); semantic left-accent + coloured time line; committed=green. All behavioural pins
  preserved (Locate-only, commits nothing, exact-ID, statusLabel/title/GhostShield markers intact).
- **Guards:** EditMode 731/731 (updated one TimeVerb source-pin to the corrected call + added a
  post-founding heartbeat coverage test — strengthened, not weakened). No engine/contract/save/economy.

### Proof status (updating)
- **Sealed player build (post N1 fix):** exe sha `130a13a0…`, Assembly-C# `3ba5ba10…`, engine bundle `a74ed0dd…`, Unity `18a288715bb88281` (build-manifest regenerated clean at 18a2887). (The prior pre-FitTitle build was exe `adf9c0bf…`/asmC# `765dfc00…`/af65577 — superseded.)
- **Unity delta vs base 7d6d974:** 7 files, +298/-97, **presentation-only** (no Generated DTOs / contract / engine) → CF-09 contract layer unaffected (§26 L2 N/A).
- **§23 Visual Oracle rerun (6/6 GREEN):** idle-post, wrapped-waiting, active-finishing, release-ready, committed, multi-picture — playerExit=0 (machine assertions pass), all image bytes inspected: unified rail + phase track + no truncation, commit affordance at Release Ready, committed=green "releases next week" (no P07 leak), all 4 movies shown with exact-ID isolation, world dominant. Evidence `scratchpad/p06b-oracle/`.
- **§24 real-profile-copy machine journey: 25/25** (V15→V16 migrate, hold law, commit flow, save/load; durable original sha unchanged + still read-only).
- **Unity EditMode: 731/731** (P06B, at Unity `af65577`).
- **§26 L1 TS floor:** running (P06A worktree = byte-identical TS to P06B branch; docs-only delta verified).
- **§26 L1 TS floor: 4903 passed / 0 failed** (359 files, 5 skipped) — P06A worktree, docs-only-equivalent to P06B.
- **§25 real HID on P06B build: PASS** — exe `adf9c0bf` (== manifest). Commit-to-release via real CGEventPost click (prod-0000 release-ready→release-committed, intent consumed, modifiers clean); physical Stage A click WITHOUT rail priming shows its building card (world independently operable). exe sha unchanged after run. Evidence `evidence/p06b-implementation/hid/`.
- **§28 hostile review:** launched (fresh independent reviewer, 30 criteria, opens image bytes). Awaiting verdict.

### §30 fast-forward viability (pre-checked)
- **Unity: FF CLEAN** — `campaign/living-lot-client` (784f2d5) is an ancestor of P06B-client (af65577); 0 divergent commits. `git merge --ff-only` will just advance it.
- **TS: doc-only reconcile needed** — `campaign/living-lot-ts` (828e606) has 9 doc-only commits not in P06B-ts, touching only `docs/campaigns/P06-FIVE-DAY-AUTONOMOUS-HANDOFF.md` + `docs/engineering/CODEX-P06A-READINESS-GATE-00.md`. Plan: at §30, merge `campaign/living-lot-ts` into P06B-ts (resolve the two doc conflicts, preserving both handoffs' intent), which makes campaign an ancestor → the campaign advance is then a pure `--ff-only`. No force-push, no history rewrite.

## 8. Exact next action

Build finishing → capture s4/s6 at 1440 + 1280 with the P06B player (`scratchpad/p06b-capture.sh`),
inspect the actual image bytes, iterate the rail/HUD if weak; then W4 building-card convergence and
the W3 talent entry point, then the proof pyramid (§22–26), hostile review (§28), integration (§30).
