# ASTRA Sprints 17 to 21 — integrated results report and playtest candidate (2026-10-29, 20:21 CDT)

Owner order: OWNER-ASSIGNMENT-ASTRA-17-21.txt (decisions A to G recorded in ENTRY.md). Coordinator: Claude Fable 5.1, one writer, one execution lane, subagents Opus 5.5 or lower, read-only reviewers. Sprint 22 not started; gameplay promotion to main not performed; Owner acceptance not claimed.

## The candidate

- Branch p18-season-20261028 (HSpector1/The-Movies), head 6c82214f = Sprint 20 checkpoint 2e51d30c + two history-preserving merges of main (632dc458, then ab65eb20) at 9f6103f3 + Sprint 21 FIX-1 (one test pin, 6c82214f). Draft PR #20, MERGEABLE, auto-merge off, unmerged.
- Checkpoint tags (all pushed): p18-sprint17-checkpoint-20261029 ac697d84; p18-sprint18-checkpoint-20261029 61c858b9; p18-sprint19-checkpoint-20261029 edb1cee4; p18-sprint20-checkpoint-20261029 2e51d30c; p18-sprint21-candidate-20261029 6c82214f (the playtest candidate).
- Unity counterpart HSpector1/project-studio-unity-visual-spike sprint15-consumer-20261028 at 08e335fc, paired by the CF09 seal (PASS, projection 70, schema sha256:aaafd0bd…), STATIC-UNRUN: no editor, dotnet, mono or msbuild on this macOS 12 host.
- Playable artefact on the verified platform: the Vite build (`npm run build && npm run preview`) in installed Google Chrome on macOS 12; launch text and route in sprint21/OWNER-INVITATION.md. Shareable fixtures only: the generated route saves (ui/e2e/owner-route-saves.spec.ts) and the constructed worlds (tests/helpers/p17-cameo-route.ts, p18-season-world.ts). No private Owner save, credential or restricted asset is packaged or copied into any record.

## What each sprint delivered (player-visible first)

| Sprint | Decision | Delivered | Residual |
|---|---|---|---|
| 17 recoverable rivals | A (4a bounded exit/restart) | A cost-cutting rival examines a complete restart plan every 26 weeks through a dry run of its own laws and re-enters only when the plan is affordable; byte-identical on the four natural arms (no natural rival restarts), demonstrated on a constructed rival. | Player-visible effect nil on the measured seeds; one Owner question (should a cutting rival keep its film team when it holds a viable but cash-blocked package). |
| 18 rights and television transactions | B (disclosure a), C (deadline copy) | The Rights desk: offers, diligence, absorption quote and commit, estate bids, with the core's own refusals in plain words; a title sale discloses the season it cancels, the week, the refund and the charge, computed by running the engine forward on a private copy, before the binding confirm; deadline cancellation copy names the inability where the record knows it. | Creditor priority of published TV obligations in P15 closure: one Owner question (recommended a new claim kind paid after employment claims, refund first). |
| 19 portable saves | D (5c) | Market era v3 prices through portable arithmetic (exp and 2^y from basic IEEE operations), sealed v1 and v2 rows reconciled within one ULP on the factor only; the Owner's Chrome-written save imports in Node and round-trips byte for byte; a Node-built save imports in Chrome and continues identically. | p12 campaign-library R05 leaves time out at their 5,000 ms budget as inherited (measured once alone); no waiver. |
| 20 native client parity | E | `StudioBridgeIntentOption.confirmation` none or required (projection 70), derived from the kind and the engine verb; outgoing69 registered with its genuine capture; Unity two-gesture confirm bound to the option identity and displayed authority (STATIC-UNRUN); CF09 seal PASS. | Native compile, EditMode and PlayMode BLOCKED here; the Sprint 15 ACCEPTANCE OPEN item stays open; Owner question on confirming takeLoan and commitPictureToRelease (recommended yes), cancelResearch (recommended no). |
| 21 playtest response and integration | F (no timing waiver), G (acceptance separate) | Main merged into the candidate twice, records-only conflicts; six Chrome journeys 6 of 6; PR #20 refreshed and mergeable; full gate full-tree-s21-r2 at 9f6103f3: static stages 0, core 6,130 of 6,248 and ui 2,755 of 2,763 with every failure classified (below); one Sprint 19 pin omission found and fixed (FIX-1). | OWNER ACCEPTANCE PENDING (no feedback since the Sprint 16 invitation); Firefox and WebKit unrun. |

## Integration milestone

Full gate full-tree-s21-r2 (bound 9f6103f3, 2,280 source entries, 17:54:56 to 20:11:57 CDT; sprint21/lane/full-tree-s21-r2/), compared with compare-full.py against the retained baseline full-tree-s17-r1 (the Sprint 17 gate at ac697d84, itself zero NEW against the pre-program gates). The classes are kept apart as the assignment requires; zero NEW is not "all tests green".

| Class | Core (6,248 tests, 2,153 files) | UI (2,763 tests, 778 files) | Reading |
|---|---|---|---|
| Static stages | root and ui typecheck 0 (117 s), bridge typecheck 0, contract and fixture checks 0, build 0, source integrity 0 | same lane | PASS |
| Passed | 6,130 (3 skipped, 11 todo) | 2,755 (5 skipped) | |
| Inherited, same cause | 93 cases | 2 cases | the pre-program baseline, unchanged; none repaired, none accepted as green |
| Inherited, changed by value | 2 (owner-ux projection pin 53 now sees 70, was 69; p15c2 downgrade 204 s against 120 s, was 226 s) | 0 | same causes as the baseline |
| Missing input | 6 cases (three untracked r3n1 fixtures, as every baseline) | 0 | not evidence either way |
| NEW, behaviour defect | 0 | 0 | |
| NEW, test-pin defect | 1: p14d1 fresh-genesis era pin left at v2 by Sprint 19; FIX-1 6c82214f, 29 of 29 alone | 0 | fixed, test-only |
| NEW, timing | 2: bridge-p13b-s7 (30 s budget; 11.6 s alone, file 22 of 22); p15c1 first-case module load (5,000 ms budget; 5,010, 4,366, 4,571 ms alone; 4,168 ms in the baseline lane) | 1: WorldFirstStudioHome focus (30 s budget; 16.7 s alone, file 33 of 33) | no waiver (decision F); budgets unchanged; the p15c1 load cost sits at the budget and is the program's heavier core graph |
| Over-budget passes | 777 (max 359 s) | 45 (max 27 s) | lane load, as in every baseline |
| Human acceptance | OWNER ACCEPTANCE PENDING: no feedback since the Sprint 16 invitation; six Chrome journeys 6 of 6 on 9f6103f3 are the coordinator's evidence, not the Owner's | | not claimed |
| Native | BLOCKED on this host (no Unity 6000.3, dotnet, mono or msbuild on macOS 12); paired STATIC-UNRUN, CF09 seal PASS | | stated once in sprint20/ENTRY.md |

Final candidate 6c82214f differs from the gated 9f6103f3 by one string literal and one comment in one test file; reverified by that file alone and the root typecheck (0 errors, 20:21 CDT, local/s21-fix1-root-tsc.log); not re-gated (two and a quarter hours; the change cannot reach another file).

## Technical integration recommendation

**CONDITIONAL GO** for integrating p18-season-20261028 at 6c82214f (draft PR #20) into main, on these conditions, none of which the coordinator can meet:

1. The Owner's playtest verdict is KEEP on the route in sprint21/OWNER-INVITATION.md (decision G: acceptance is the Owner's, and promotion is a separate authorization; neither is claimed here).
2. The inherited failure baseline is accepted as the known pre-program state it is: 95 core cases in 24 files and 2 ui cases fail on the candidate for the same reasons they failed before Sprint 17 (named in the s17 gate audit and the Sprint 14 qualification); this program repaired none of them and the candidate is not green.
3. The native client's two-step confirm and the Sprint 15 ACCEPTANCE OPEN items are run on a Unity-capable host, or the Owner accepts the STATIC-UNRUN pairing for this promotion.
4. The three recorded Owner questions (Sprint 17 cutting-rival release law, Sprint 18 creditor priority of published TV obligations, Sprint 20 confirmation set) are answered or explicitly deferred; none blocks the merge mechanically.

Technically the candidate is integrable now: typecheck, contracts, build and integrity 0; zero new behaviour defects across the full core and ui suites against the retained baseline; the one new pin defect fixed; main (ab65eb20) merged twice with history preserved and only records conflicts; GitHub reports PR #20 mergeable; six real-browser journeys pass. Timing rows are measured, not waived. A NO-GO would need a new behaviour defect or a broken contract; none exists. A plain GO would need the Owner's acceptance and the native run, which do not exist.

## Outstanding Owner decisions

1. Playtest verdict on the candidate (sprint21/OWNER-INVITATION.md): KEEP, REVISE or REJECT.
2. Promotion of p18-season-20261028 to main: not authorized by this program; PR #20 stays draft.
3. Sprint 17: cutting rivals keeping a film team while holding a viable, cash-blocked package; market rejections counting toward shelving while the team is released.
4. Sprint 18: creditor priority of published TV refund and charge obligations in P15 closure.
5. Sprint 20: confirmation on takeLoan and commitPictureToRelease (recommended yes), cancelResearch (recommended no); a capable host for the native build, EditMode and PlayMode.
6. Sprint 22: not started; needs a new authorization.
