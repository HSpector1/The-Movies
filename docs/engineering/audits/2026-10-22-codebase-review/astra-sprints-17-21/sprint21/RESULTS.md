# Sprint 21 — playtest response and an integration-ready candidate (2026-10-29, 17:35 CDT, IN PROGRESS)

Entry: ENTRY.md. Starts from the Sprint 20 checkpoint (tag p18-sprint20-checkpoint-20261029 at 2e51d30c; Unity 08e335fc; CF09 seal PASS).

## Slice 1 — main merged into the candidate for PR #20

- Two merge commits on p18-season-20261028, both pushed, history preserved (no rebase, reset or force push): 7020053f (parents 2e51d30c and 632dc458) and 9f6103f3 (parents 7020053f and ab65eb20). The first merged the state of a stale remote-tracking ref: the integration worktree's fetch refspec names only one branch, so `git fetch origin` had left origin/main at 632dc458 while GitHub's main stood at ab65eb20 (eleven further records commits). Refetched by explicit refspec and merged again. origin/main (ab65eb20) is now an ancestor of the candidate head.
- Main past the base 8792de52: records publications (Wave 3, C-03 Sprint 1, Sprints 2 to 4, the Sprints 5 to 16 program checkpoints, the retained-writing and native lifecycle records) and one six-line comment in ui/src/lot/tycoon/TycoonScene.ts stating the 17A key-capture rule. No other source.
- First merge, four conflicts, all records (probed read-only first with a temporary index): HANDOFF.md (candidate's later handoffs kept over main's 2026-10-25 header), docs/LESSONS-LEARNED.md and STABILIZATION-REPORT.md (both sides appended at the same tail; main's sections auto-merged, the candidate's later sections kept), LEDGER.md (candidate's later 3A row and appended entries kept; resolved in the index because docs/ is sparse-excluded in the integration worktree).
- Second merge, eight conflicts, all records: HANDOFF.md (both sides kept, candidate first, main's 2026-10-26 Codex sections as history; the one both-edited Sprint 4 line takes main's wording); LESSONS-LEARNED.md, STABILIZATION-REPORT.md, p16-sprint5/RESULTS.md (main appended where the candidate had nothing); LEDGER.md (main's later program header, row 7 state and appended entries supersede the candidate's earlier copy); p16-sprint4 and p16-sprint5 EVIDENCE-MANIFEST.json (main's later manifests; both parse as JSON); p16-sprint7/RESULTS.md (two distinct appended sections, both kept).
- The merge dropped the integration worktree's materialized ui/ files (its sparse patterns excluded /ui/ and the 740 files had been skip-worktree). The pattern was removed and the tree re-materialized (77 MB); the tree is clean. Lanes r1 to r3 ran before the merge with ui present.
- Reverification of the affected behaviour only on 9f6103f3 (17:37 CDT): ui typecheck 0; ui/e2e/lot-key-capture-v1.spec.ts 1 of 1 in installed Chrome, 11.7 s (local/s21-lot-key-capture-r1.json). Not every historical test: the merge changed no other source.
- PR #20: head 9f6103f3, draft, unmerged, auto-merge off; GitHub reports MERGEABLE (it had shown CONFLICTING at 7020053f because its main was already at ab65eb20). Description refreshed with the Sprint 17 to 21 rows and the verification state; the integration recommendation line is refreshed again at the final candidate.

## Slices 2 to 4

Pending: browser journeys on the merged candidate; the full-gate integration lane against full-tree-s17-r1; the candidate report with GO / CONDITIONAL GO / NO-GO.
