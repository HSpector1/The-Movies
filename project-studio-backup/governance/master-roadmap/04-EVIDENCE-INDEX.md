# Project: Studio — Evidence Index

Where truth lives. Every source this roadmap was reconstructed from, its authority, and its read/write status. All inspected **read-only** on 2026-07-27. **A fresh terminal should re-verify live git state before relying on any HEAD/dirty claim** — the main tree is a moving base.

---

## 1. Code repositories (git)

| Path | Authority | Status when to touch |
|---|---|---|
| `/Users/bruce/The Movies` | **Sim source of truth.** Governed by `docs/build-contract.md`. | Active track. `phase-5.2-economy @ 0f9e4bd`, dirty (D-12 in-flight). Do not merge spikes here or touch `src/core` from a renderer. |
| `/Users/bruce/The Movies - Studio Lot Spike` | Frozen 2.5D presentation reference. | `studio-lot-spike @ 3806ef6`, clean. **Read-only. Do not merge to main / do not touch `src/core`.** |
| `/Users/bruce/The Movies - 3D Visual Spike` | Frozen 3D presentation reference (Gate C PASS). | `studio-3d-visual-spike @ 591f3aa`, source clean (dirty = re-captured PNGs only, leave untouched). **Read-only.** |

Key in-repo docs: `docs/build-contract.md`, `docs/rev4-open-questions.md` (D-1…D-5, ~168 k, normative on conflict), `docs/HANDOFF.md`, `docs/D-12-economy-contract.md`, `docs/D-12-calibration-record.md`, `M0A-REPORT.md`, `ROADMAP.md`, `START-HERE.md`. 3D-spike docs: `GATE-A/B/C-REPORT.md`, `ARCHITECTURE.md`, `DECISION-LOG.md`, `ASSET-POLICY.md`, `PROVENANCE.md`, `PERFORMANCE-BASELINE.md`, `M3-*`. 2.5D-spike docs: `lot-spike/README.md`, `lot-spike/docs/PASS-4-*`.

> **Design-archive files are NOT-FOR-BUILD.** The main repo root holds gitignored design docs (`design-spec.md`, `1-career-talent-market.md`, `2-historical-talent.md`, `3-acquisition.md`, `4-filmmaker-pitches.md`, `KICKOFF-PROMPT.md`). The docs repeatedly instruct: never open/read/reconstruct/commit them. Wanting one is the signal to **stop and report a finding**.

## 2. Desktop document packages (not git repos — safe to read; this roadmap is written alongside them)

| Path | What it is | Authority |
|---|---|---|
| `~/Desktop/Project Studio Source Docs/PROJECT-STUDIO-VISUAL-CHARTER.md` | **Final-product visual charter** (36 phases, V0–V9). | Long-range guide; immediate ask = a 20-section review report. **Rank 2** in source precedence (R-2026-07-27-A): governs presentation *intent* only; cannot authorize work. |
| `~/Desktop/Project Studio Source Docs/MASTER-ROADMAP/` | **This package** (incl. `05-RULINGS.md`, the owner rulings ledger). | Governance/reconciliation; authorizes nothing. Rulings in `05` override any other package doc on conflict. |
| `~/Desktop/Meridian Hybrid Presentation Integration - DECISION/` (docs 00–10 + `GATE-D-PREP/`) | Hybrid decision + Gate-D canonical contract spec / entry status / runbook. | The hybrid go/no-go + Gate-D definition. Gate D **AUTHORIZED, HELD**. |
| `~/Desktop/Meridian 3D Spike - RETROSPECTIVE/` (18 docs) | Verified lessons, reusable inventory, risks, playbooks. | Post-hoc analysis of the 3D spike; docs 13–17 are generic game-dev reference. |
| `~/Desktop/Meridian Pictures Art Direction/02 Concept Brief/` (+ `Renders/`) | Approved Meridian visual identity + 8 concept renders + provenance. | Concept phase **APPROVED**; 3D implementation LOCKED pending PM sign-off. |
| `~/Desktop/studio-economy-review/` (8 docs + `calibration/`) | Economy design proposal (Blended-Share Theatrical Run) + calibration data. | **Ratified** into the repo as the D-12 contract; the review is now the "accepted research." |
| `~/Desktop/studio-d12-core-snapshot/` | Snapshot of the dirty D-12 tree (inventory + patch + untracked tarball), 2026-07-27 17:14. | Evidence backup of the in-flight D-12 work. |
| `~/Desktop/Meridian 3D Vertical Slice - PLAN/`, `~/Desktop/Meridian 3D Gate A Review/`, `~/Desktop/Studio GitHub Comparables/`, `~/Desktop/Movies Visual Review/` | Adjacent spike-plan, gate review, OSS comparables, and current-work visual-review material. | Supporting evidence; not deep-read here. Flagged for the charter's V0 audit / Phase-1 reconstruction. |

## 3. Verifications performed for this reconstruction (2026-07-27)
- **Live git** on all three repos (branch/HEAD/porcelain) — see `01-CURRENT-STATE.md §1`.
- **Real test run**: `npm test` (`vitest run`) on the dirty D-12 tree → **49 files / 767 tests pass, 0 fail** (30.38 s). Not a documented figure — actually executed.
- **Protection guard**: `The Movies - 3D Visual Spike/tools/verify-protected.mjs` executed read-only → **RED** (`HEAD 0f9e4bd (expect 0f9d23d) DRIFT`), confirming the retrospective's known false-positive (now formally **deprecated** by ruling R-2026-07-27-B).
- **Charter gate**: confirmed present (2,650 lines) after initially being absent; the package was **BLOCKED** until the owner created it.
- Nine parallel read-only reader agents digested the charter, decision package, retrospective, art direction, both main-repo doc sets, the economy review, and both spikes (687 k tokens, 135 tool calls). Findings cross-checked against live git and the test run.

## 4. Read order for a fresh terminal
0. `05-RULINGS.md` — the owner rulings ledger. Read first; it overrides every other doc on conflict (currently: source precedence + the protection-guard deprecation).
1. `00-MASTER-ROADMAP.md` (the "Source precedence" meta-rule + §2 numbering decoder first, then §3 snapshot, §6 findings).
2. `01-CURRENT-STATE.md` — then **re-run `git -C "/Users/bruce/The Movies" status`** to confirm the moving base.
3. `02-FEATURE-LEDGER.md` / `03-CONTRACT-REGISTRY.md` as needed.
4. For sim work: `The Movies/docs/build-contract.md` + `HANDOFF.md` (authoritative). For presentation work: the DECISION package + spike Gate reports. For visual horizon: the charter.

## 5. Standing guardrails (carried from the owner's operating rules)
- The two spikes are **presentation-only, isolated, never merged to main, never touching `src/core`**; seeded RNG only.
- No repository may be reset/cleaned/committed/merged/checked-out as part of a documentation task.
- Do not begin Phase 5/6, OC-01, Gate D, a new branch/worktree, or dependency installs without explicit owner authorization for that specific step.
- The build-contract is the sim's sole source of truth *for mechanics/scope*; gaps get **reported, not silently filled**.
- **Source precedence (R-2026-07-27-A):** each source owns its domain (Build Contracts = mechanics/scope · Charter = long-range intent · Roadmap = gates · CURRENT-STATE = reality); the **Charter cannot authorize** mechanics/integration/implementation; conflicts **escalate to the owner**, never resolved silently.
- **Protection guard (R-2026-07-27-B):** the exact-HEAD check is **deprecated**; its structural-isolation replacement must **not** be implemented while main is dirty or D-12 is active. Exact commit pins remain valid only for genuinely frozen spikes / release baselines.
