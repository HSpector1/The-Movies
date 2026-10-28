# Sprint 12 entry — P18 first-season commission and shared workload, 2026-10-28, 02:40 CDT

Predecessor: tag p17-technical-checkpoint-20261028 at ecbc42c9 (Sprint 11 close). Owned descendant branch: p18-season-20261028 (pushed at ecbc42c9). Integration worktree: studio-scratch/p17-continuation-20261027-wt. RED worktree: studio-scratch/p17-slice-red-20261027-wt moved to ecbc42c9 (branch p18-red-20261028).

## Inputs located (read-only)
- Contract: studio-scratch/p18-prep/P18-FIRST-SEASON-CONTRACT.md with INDEPENDENT-REVIEW.md (PROCEED). Decision 19A §3 (19A-greenlight-tail-rights-design.md): the commissioner holds an exclusive R4 televisionDistribution licence; consideration is an Owner figure, disclosed zero until decided.
- Preserved implementation draft: /Users/zacheryspector/studio-specialists/p18 (base f7d0dc0f, uncommitted modifications) and the packages 1370-ar-p18-first-season-implementation-20261010-r1, 1370-ar-p18-r2-scratch-20261011, 1370-as-p17-p18-review-20261010-r1.
- Independent draft review (2026-10-22): domain-reports/P17-P18.md, defects P18-01..P18-09 and P17-06.

## Scope this sprint (commission only)
One series, first season as ONE twelve-unit workload (six episodes as delivery metadata). Producer authority is a live P16 read (permissionFor, use televisionProduction), never a payload grant. The commissioner's R4 televisionDistribution licence is minted by P16's own licence code. One Development & Casting slot held under the occupancy owner tvSeason; the six roster people join the one busy set films use; credits frozen on their real P12 employment rows. Advance paid once as recoupable cash on one tvAdvance ledger row. Weekly work credited by a tick step after the loan instalment, blocks 3/1/1/4/3 at 25,000 per unit, milestones scripts (earn 120,000, pay 0) and picture lock (earn 240,000, pay 240,000). Save51 on Save50 with the lazy root `television` (absent until the first commission; version-only migration; downgrade refused by name while present). Kept for Sprint 13: delivery, lateness, cancellation and refunds, partial repayment, closure treatment, the 52-week distribution term, client surfaces.

## Plan
1. Workhorse (Opus) adapts the draft externally to ecbc42c9; package in studio-scratch/p18-sprint12-20261028/adaptation (four patches, post-images, MANIFEST, NOTES, sweep ledger). Done 02:46 CDT: STATIC-UNRUN, `git apply --check` clean, syntax and import scans clean.
2. Coordinator installs the package as the CANDIDATE commit 5710f748 (post-image hashes verified against MANIFEST, 123 files, 0 mismatches) and the witness tests alone on the RED worktree (61a13e25).
3. Independent review (Opus, read-only) of 5710f748 against the contract, the Owner constraints and the sweep; findings list.
4. Lane: red-r1 (the three P18 files at 61a13e25), green-r2 (root, ui and bridge types; the three P18 files; the hand re-pinned and renamed files; save validator; bridge checkpoint). Fix rounds RED-first; broader gate at the Sprint 13 checkpoint.
5. Budgets unchanged (core 5,000 ms). Foreign Codex/Godot session paused during lane runs; AC power required.
