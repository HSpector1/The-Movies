# Sprint 21 — playtest response and an integration-ready candidate (entry, 2026-10-29, 16:25 CDT)

Assignment §7 and decision G (Owner acceptance and main promotion stay the Owner's). Starts from the Sprint 20 checkpoint on p18-season-20261028 (engine FIX-1 777b00bc, Unity 08e335fc, CF09 seal PASS) once lane sprint20-r2 has ended. No new feature family.

## Inputs read at entry

- Owner feedback: none supplied since the Sprint 16 invitation (sprint16-playtest/OWNER-INVITATION.md, candidate r3 at 6da4206a). OWNER ACCEPTANCE PENDING stays; the invitation is refreshed once for the final candidate with its new tag, the Sprint 17 to 20 changes and honest limits; no repeated request.
- Draft PR #20 (HSpector1/The-Movies, base main, head p18-season-20261028, draft, open): GitHub reports CONFLICTING. Probe with a temporary index (`git read-tree -m` of merge-base 8792de52, head 777b00bc, main 632dc458; no working tree touched): four unmerged paths, all records (HANDOFF.md, docs/LESSONS-LEARNED.md, docs/engineering/audits/2026-10-22-codebase-review/LEDGER.md, docs/engineering/audits/2026-10-22-codebase-review/STABILIZATION-REPORT.md). Main is eight commits past the base, all records publications except one six-line comment in ui/src/lot/tycoon/TycoonScene.ts (merges clean). Integration method: merge main into the candidate (history preserved; no rebase, no force push, no reset), resolve the four records conflicts by keeping both sides' entries, reverify the Tycoon scene's affected behaviour only (the lot key-capture spec), not every historical test.
- Baselines for the integration milestone: full-tree-s17-r1 on ac697d84 (core 6227 tests, 101 failed; ui 2757, 2 failed), itself NEW 0 against full-tree-r2 (6da4206a) and full-tree-r4 (e115be4b). compare-full.py (p16-sprint10/tools) classes NEW, INHERITED-SAME, INHERITED-CHANGED, MISSING-INPUT, LOAD-FAILURE, BASELINE-NOT-REPRODUCED, OVER-BUDGET-PASS. The three gitignored r3n1 fixtures stay MISSING-INPUT (not recoverable here; named, never passed).
- Real-browser journeys to exercise (installed Chrome, channel chrome, fixed port 5178, one worker): the four Sprint 16 route journeys, p17-continuation.spec.ts, p18-season.spec.ts, and the new paths astra18-rights-desk.spec.ts (rights desk, title-sale disclosure) and astra19-portability.spec.ts (save portability). Firefox and WebKit unavailable on this host (named as unrun).

## Slices (one coordinator writer)

1. Merge main into the candidate (above); push; refresh PR #20's description to the Sprint 20 state; keep draft; no auto-merge.
2. Browser journeys on the merged candidate; fix reproducible high-impact input, focus, clarity, cancellation, save-loss and progression defects found, each with a red reproduction only where a real defect exists.
3. Integration milestone: one full-gate lane (root, ui and bridge typecheck, contract checks, build, full core including bridge, full ui, integrity) on the final candidate commit with the required inputs present; compare against full-tree-s17-r1 with compare-full.py; separate inherited, new, missing-input, unsupported-producer, timing and human-acceptance classes.
4. Candidate report: exact identities (engine commit and tag, Unity commit, seal), the playable artefact and launch instructions on the verified platform (the Vite build in installed Chrome), the shareable generated fixtures only (never the Owner's private saves), GO / CONDITIONAL GO / NO-GO with exact remaining blockers, and the outstanding Owner decisions.

Finish line: one recoverable playable candidate and the integrated Sprints 17 to 21 report; no Sprint 22.
