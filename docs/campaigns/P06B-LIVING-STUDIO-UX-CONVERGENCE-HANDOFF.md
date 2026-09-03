# P06B — Living Studio UI/UX & Visual Convergence — HANDOFF

> Durable campaign memory. Updated after Entry, after every coherent wave, before any
> compaction/long run/hostile review/final integration/blocker stop, and at least every 4h.
> Nothing meaningful may live only in scratch, /private/tmp, a process, chat, or an unpushed tree.

## Status: ENTRY COMPLETE · P06A HID BASELINE PASSED · P06B WAVES BEGINNING

Current status line: **IN PROGRESS — KEEP CANDIDATE not yet minted.**

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
- [ ] Authorities read + reference delta (§6, §8)
- [ ] Baseline UX audit (§9)
- [ ] W0 visual system · W1 HUD · W2 movie rail (primary) · W3 Talent · W4 building cards · W5–W9
- [ ] Visual review + oracle rerun + UX capture set (§22–23)
- [ ] Profile-copy journey + real HID on P06B build (§24–25)
- [ ] Full test pyramid (§26)
- [ ] Hostile review → ACCEPT (§28)
- [ ] Final integration + candidate + report (§30, §34)

## 8. Exact next action

Read controlling authorities (§6) and run the bounded reference delta (§8, ≤75 min), then produce the ranked baseline UX audit (§9) from actual screenshots of the P06A candidate at four viewports.
