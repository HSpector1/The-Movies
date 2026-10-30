DRAFT for review only. Per the Owner assignments (Sprint 16, ASTRA 17 to 21, ASTRA 22 to 26): a draft integration PR may be prepared; it must not be merged and auto-merge must not be enabled. Promotion to main is a separate Owner authorization.

## What this branch is

`p18-season-20261028` carries the P16 → P17 → P18 gameplay lineage on top of main's 8792de52, as individual commits (no squash, no rebase). Checkpoints, all tagged and pushed:

| Milestone | Tag | Commit |
|---|---|---|
| P16 technical checkpoint | p16-technical-checkpoint-20261027 | a5a66c27 |
| P17 Sprint 10 | p17-sprint10-checkpoint-20261027 | 2c50c9df |
| P17 technical checkpoint | p17-technical-checkpoint-20261028 | ecbc42c9 |
| P18 Sprint 12 | p18-sprint12-checkpoint-20261028 | 31fdb366 |
| P18 Sprint 13 | p18-sprint13-checkpoint-20261028 | 0774e16e |
| Sprint 14 qualification | p18-sprint14-checkpoint-20261028 | e115be4b |
| Sprint 16 playtest candidate | p18-sprint16-playtest-candidate-20261028 | 468d99b8 |
| Sprint 16 playtest candidate r2 (headline closing-quote fix, red-first; Owner route saves exporter) | p18-sprint16-playtest-candidate-r2-20261028 | b3c179b0 |
| Sprint 16 playtest candidate r3 (Owner playtest response slice: automatic season cancellation on lost authority, campaign-library save/load repair, attestation version 2, projection 69) | p18-sprint16-playtest-candidate-r3-20261028 | 6da4206a |
| ASTRA Sprint 17 (rival cost-cutting recovery, decision A) | p18-sprint17-checkpoint-20261029 | ac697d84 |
| ASTRA Sprint 18 (Rights desk, title-sale disclosure, decision B and C copy) | p18-sprint18-checkpoint-20261029 | 61c858b9 |
| ASTRA Sprint 19 (portable saves: market era v3 through portable arithmetic, decision D) | p18-sprint19-checkpoint-20261029 | edb1cee4 |
| ASTRA Sprint 20 (destructive-intent confirmation contract, projection 70, outgoing69 registered; Unity counterpart 08e335fc STATIC-UNRUN, CF09 seal PASS) | p18-sprint20-checkpoint-20261029 | 2e51d30c |
| ASTRA Sprint 21 (main ab65eb20 merged twice, history preserved, records-only conflicts; full-gate integration milestone; FIX-1 one stale test pin) | p18-sprint21-candidate-20261029 | 6c82214f |
| ASTRA Sprint 22 (safe commitments, decision A: takeLoan shortcut and commitPictureToRelease confirmed by a second gesture; the browser release-commit review; Unity release memo arming, STATIC-UNRUN; CF09 seal PASS 901b9b55 × e7dcfc3) | p18-sprint22-checkpoint-20261030 | 901b9b55 |
| ASTRA Sprint 23 (TV estate claims, decision B: closure law closure/v2, typed tvRefund/tvCharge claims behind employment, paid once from the closing cash; closed-studio history) | p18-sprint23-checkpoint-20261030 | 95276c9c |
| ASTRA Sprint 24 (browser acquisition and estate journeys on genuine captures; the Dashboard calendar after an acquisition with a continued picture; the desk's closed estates; the acquisition ask voiced) | p18-sprint24-checkpoint-20261030 | 6ddeeb00 |
| ASTRA Sprint 25 (native client: BLOCKED on this host, no source change; pair standing re-executed; minimum-route matrix) | none | 6ddeeb00 |
| ASTRA Sprint 26 (combined playtest candidate: eight Chrome journeys, the final full gate full-tree-s26-r1) | p18-sprint26-candidate-20261030 | 6ddeeb00 |
| ASTRA Sprint 27 (the Rights desk and the estates on the Bridge: `rights` and `estates` Industry views, the quoteEstateBid and quoteRightsOffer families with the decision B consequence digest-bound to the commit, reject/withdraw/purchase-accept intents; projection 71, outgoing70 registered; decision B ratified; Unity counterpart 4c41676 STATIC-UNRUN, CF09 seals PASS; FIX-1 review fixes and pins, FIX-2 two pins) | p18-sprint27-checkpoint-20261030 | 18c3e8cf |

Gameplay rules last changed in ASTRA Sprints 22 to 24 (2026-10-30): the two-gesture loan shortcut and release commit (af6ad177, 901b9b55), the closure law closure/v2 with television estate claims (95276c9c), and the Rights desk's closed estates with the calendar repair after an acquisition (6ddeeb00). Before that: Sprints 17 to 20 (2026-10-29) and the playtest-response slice (bab5f462, 91f6da7e).

## Verification state (records in HSpector1/The-Movies-headless-program, docs/engineering/audits/2026-10-22-codebase-review/)

- Full gate full-tree-r4 at e115be4b audited CLEAN WITH NOTES, zero new assertion failures (sprint14-qualification/QUALIFICATION.md §10). Eleven inherited bridge-p12-campaign-library save/load timeouts fail alone on the 2-core host; budgets unchanged.
- Playtest-response slice (Owner ruling 2026-10-28 on all eight close-out decisions): full gates full-tree-r1 at 6a846c99 and full-tree-r2 at 6da4206a audited CLEAN WITH NOTES, zero new assertion failures; independent review ACCEPTABLE with ten findings fixed and two product readings for the Owner; CF09 seal PASS on 6da4206a with the Unity counterpart at 8290f2c; the eleven p12 cases now sit within a few hundred ms of their 5,000 ms budget (not timing-qualified); budgets unchanged (playtest-response/RESULTS.md, REVIEW.md, MEASUREMENTS.md).
- Four real-browser journeys pass in installed Chrome at the candidate (sprint16-playtest/RESULTS.md): smoke, d12-economy-journey, p17-continuation, p18-season.
- ASTRA Sprints 17 to 21 (Owner order 2026-10-29, records astra-sprints-17-21/): Sprint 17 lane sprint17-r1 byte-identical natural arms; full gate full-tree-s17-r1 at ac697d84 NEW 0 against full-tree-r2 and r4; Sprint 18 lane r2 typecheck 0, focused core 111 of 111, full ui zero NEW, four Chrome journeys; Sprint 19: the Owner's Chrome-written save imports in Node and round-trips, a Node-built save imports in Chrome and continues identically (astra19-portability.spec.ts); Sprint 20 lane sprint20-r3 at 2e51d30c: typecheck and contract checks 0, Bridge 115 files NEW 0 against full-tree-s17-r1 (34 inherited failures); CF09 seal PASS 777b00bc × 08e335fc. Sprint 21: main merged into the candidate (9f6103f3); reverification of main's one source change (TycoonScene comment) by the lot key-capture journey: ui typecheck 0, ui/e2e/lot-key-capture-v1.spec.ts 1 of 1 in installed Chrome (sprint21/local/s21-lot-key-capture-r1.json); GitHub reports the PR mergeable again. Full gate full-tree-s21-r2 at 9f6103f3 (sprint21/lane/full-tree-s21-r2/, compared against full-tree-s17-r1): static stages 0; core 6,130 of 6,248 passed with 104 failures classified as 93 inherited same, 2 inherited changed by value, 6 missing untracked fixtures, 3 NEW (one stale era pin in p14d1-rival-shelving fixed test-only in 6c82214f, 29 of 29 alone; two timing rows that pass or sit at budget alone); ui 2,755 of 2,763 with 2 inherited and 1 NEW timing row that passes alone. Zero new behaviour defects; no timing waiver; budgets unchanged. Final candidate 6c82214f reverified by the repaired file alone and the root typecheck; not re-gated (one test literal). Integrated report: astra-sprints-17-21/INTEGRATED-REPORT.md.
- ASTRA Sprints 22 to 26 (Owner order 2026-10-30, records astra-sprints-22-26/): Sprint 22 typecheck and contracts 0, core 30 of 30, ui 5 of 5, three Chrome journeys twice, CF09 seal PASS 901b9b55 × e7dcfc3; Sprint 23 eleven owning suites 110 of 110 and seventy closure-related files 656 of 666 with every failure inherited by identity; Sprint 24 journeys astra24-acquisition and astra24-estate PASS in installed Chrome on digest-bound genuine captures, astra18 PASS, core 11 of 11 with the calendar pin red at the parent; Sprint 25 Bridge typecheck and both contract checks 0 on 6ddeeb00, generated Unity files byte-identical to e7dcfc3 (native run BLOCKED on this host); Sprint 26 eight Chrome journeys 8 of 8 on 6ddeeb00 and the final full gate full-tree-s26-r1 at 6ddeeb00: static stages 0; core 6,138 of 6,253 passed with 101 failures classified against the Sprint 21 gate as 94 inherited same, 1 inherited changed by value (the p15c2 downgrade timing budget), 6 missing untracked fixtures, 0 NEW, and 3 of Sprint 21's NEW rows no longer failing; ui 2,755 of 2,763 with 3 inherited and 0 NEW against Sprint 21 (1 timing row NEW against the Sprint 17 baseline, PASS 17.6 s alone). Zero new behaviour defects; no timing waiver; budgets unchanged. Each sprint had one independent read-only review; every BLOCKING finding was fixed before its commit (astra-sprints-22-26/sprint2x/REVIEW.md). Integrated report: astra-sprints-22-26/INTEGRATED-REPORT.md.
- Unity counterpart paired at source level on HSpector1/project-studio-unity-visual-spike branch sprint15-consumer-20261028 (765ff22b, then 8290f2c and 08e335fc for projection 70); CF09 seal PASS on each pair; native build BLOCKED on this host (p16-sprint15/RESULTS.md).

## Integration recommendation

CONDITIONAL GO (astra-sprints-22-26/INTEGRATED-REPORT.md §Technical integration recommendation) for the browser playtest of 6ddeeb00 (tag p18-sprint26-candidate-20261030) on installed Chrome and for integration through this PR: technically integrable now (typecheck, contracts, build, integrity 0; zero new behaviour or pin defects in the full gate full-tree-s26-r1 against both the Sprint 21 gate and the program baseline; main unchanged and an ancestor; mergeable; eight real-browser journeys pass), conditional on the Owner's playtest verdict, acceptance of the inherited failure baseline as the known pre-program state (95 core and 2 ui cases, not green), and the native client run on a Unity-capable host or an explicit STATIC-UNRUN acceptance (Sprint 25 BLOCKED on the coordinator's host). Sprint 27 (18c3e8cf, tag p18-sprint27-checkpoint-20261030) put the two missing §7 routes on the wire (estate bids and the closed estate's disposition; title sale, offers, accept, reject, withdraw with the decision B disclosure) with no browser or core law change; its Bridge lane sprint27-r2 shows zero new behaviour defects against the Sprint 26 gate (two test pins moved in FIX-2); the native client still needs its presentation surfaces and quote drivers for those routes. Decision B is confirmed by the Owner and ratified. Promotion to main is the Owner's separate authorization; this PR stays a draft with auto-merge off until then. No Sprint 28 is started.

## Not in scope

Machinima editor, movie exporter, art overhaul, native Unity build, promotion to main.

🤖 Generated with [Claude Code](https://claude.com/claude-code)






