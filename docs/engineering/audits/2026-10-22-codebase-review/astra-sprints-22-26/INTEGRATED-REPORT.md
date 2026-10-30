# ASTRA Sprints 22 to 26 — integrated results report and playtest candidate (2026-10-30, 11:47 CDT)

Owner order: OWNER-ASSIGNMENT-ASTRA-22-26.txt (final; decisions A to E recorded in ENTRY.md). Coordinator: Claude Fable 5.1, one writer, one execution lane, subagents Opus 5.5 or lower, read-only reviewers. Sprint 27 not started; gameplay promotion to main not performed; Owner acceptance not claimed; the Owner's playtest verdict remains pending.

## The candidate

- Branch p18-season-20261028 (HSpector1/The-Movies), head 6ddeeb00 = Sprint 21 candidate 6c82214f + Sprint 22 (af6ad177, 901b9b55) + Sprint 23 (95276c9c) + Sprint 24 (6ddeeb00). origin/main is ab65eb20, unchanged since Sprint 21 and an ancestor of the candidate: no new integration merge. Draft PR #20, MERGEABLE, auto-merge off, unmerged, zero comments.
- Checkpoint tags (all pushed): p18-sprint22-checkpoint-20261030 901b9b55; p18-sprint23-checkpoint-20261030 95276c9c; p18-sprint24-checkpoint-20261030 6ddeeb00; p18-sprint26-candidate-20261030 6ddeeb00 (the playtest candidate, immutable; object f1c483b3).
- Native counterpart: HSpector1/project-studio-unity-visual-spike sprint15-consumer-20261028 at e7dcfc3 (Sprint 22; STATIC-UNRUN), paired by the CF09 seal PASS 901b9b55 × e7dcfc3 (projection 70, schema sha256:aaafd0bd…); Sprints 23 and 24 changed no contract, and Sprint 25 re-executed the Bridge typecheck and both contract checks on 6ddeeb00 and compared the generated Unity DTOs and union fixtures byte for byte with e7dcfc3's copies (identical).
- Platform: the browser client (Vite, installed Google Chrome on this macOS 12 host) is the tested platform. The native client is untested (Sprint 25 BLOCKED on this host).

## What each sprint delivered (player-visible first)

| Sprint | Decision | The player can now | Source | Verification |
|---|---|---|---|---|
| 22 safe commitments | A | Take the loan shortcut and commit a picture to release only after a second gesture that shows what is being committed (the Dashboard's release commit reviews the frozen outlook, the budget already paid, the hold and the finality; the Bridge marks `takeLoan` and `commitPictureToRelease` confirmation=required; a quoted loan commit stays one gesture; cancelResearch stays one gesture). Unity's release memo arms and confirms (STATIC-UNRUN). | bridge/session.ts, ui Dashboard and adapter, Unity ConfirmedIntent and release memo | typecheck and contracts 0; core 30 of 30, ui 5 of 5; three Chrome journeys twice; seal PASS; review one BLOCKING fixed (continued pictures in the review) |
| 23 TV estate claims | B | When the studio closes, its outstanding television refund and cancellation charge become typed estate claims behind every employment claim (refunds before charges), paid once from the closing cash under the versioned law closure/v2; the closed-studio history lists them; historical v1 records untouched. | src/core/studioClosure.ts, tvSettlement.ts, tvSave.ts, corporateNotices.ts, ClosedStudioHistory | eleven owning suites 110 of 110; seventy closure-related files 656 of 666 with all ten failures inherited by identity; review one BLOCKING fixed (the claims-to-agreement join never ran on load) |
| 24 browser acquisition and estate | §6 | Acquire an operating rival from the Rights desk end to end (disclosure, the ask voiced on a refused quote, the quote at the ask, the close) and keep playing: the Dashboard calendar no longer throws after an acquisition with a picture still in production. Read what became of a closed estate (lot dispositions, the own bid's outcome, the closure's creditor claims). | src/core/rightsDesk.ts, studioCalendar.ts, ui RightsDesk and rights voicing, two new journeys | journeys astra24-acquisition and astra24-estate PASS on genuine captures; astra18 PASS; core 11 of 11 with the calendar pin red at the parent; review one BLOCKING fixed (a first concept fix would have listed the picture as commissionable) |
| 25 native client | §7 | Nothing new natively. BLOCKED on this host (recorded once in ENTRY.md). | none | Bridge typecheck and contract checks on 6ddeeb00, generated files byte-identical to e7dcfc3; the minimum-route matrix (sprint25/RESULTS.md): two §7 routes have no Bridge intent at all (estate bids; title sale, offers, licences) |
| 26 combined candidate | §8 | The eight Chrome journeys on 6ddeeb00 (smoke loop new studio → production → release → finances → save/reopen; D-12 economy; P17 continuation; P18 season; astra18 rights desk; astra19 portability; astra24 acquisition; astra24 estate) all PASS. | none (no source change) | the final full gate below |

## Integration milestone

Full gate full-tree-s26-r1 (bound 6ddeeb00, 2,283 source entries, 09:41:41 to 11:44:24 CDT; sprint26/lane/full-tree-s26-r1/), compared with compare-full.py against the Sprint 21 gate full-tree-s21-r2 and the program baseline full-tree-s17-r1. The classes are kept apart as the assignment requires; zero NEW is not "all tests green".

| Class | Core (6,253 tests, 570 files) | UI (2,763 tests, 212 files) | Reading |
|---|---|---|---|
| Static stages | root and ui typecheck 0 (128 s), bridge typecheck 0 (41 s), contract and fixture checks 0, build 0 (25 s), source integrity 0 | same lane | PASS |
| Passed | 6,138 (3 skipped, 11 todo) | 2,755 (5 skipped) | |
| Inherited, same cause | 94 against s21-r2 (93 against s17-r1) | 3 against s21-r2 (2 against s17-r1) | the pre-program baseline, unchanged; none repaired, none accepted as green |
| Inherited, changed by value | 1 against s21-r2: p15c2 legacy-root-downgrade 227 s against 120 s (204 s in s21, 226 s in s17); against s17-r1 also the owner-ux projection pin (53 sees 70, was 69) | 0 | same causes as the baselines |
| Missing input | 6 cases (three untracked r3n1 fixtures, as every baseline) | 0 | not evidence either way |
| Baseline rows no longer failing | 3 against s21-r2: the p14d1 era pin (fixed test-only in 6c82214f) and the bridge-p13b-s7 and p15c1 timing rows now pass | 0 | |
| NEW, behaviour defect | 0 | 0 | |
| NEW, test-pin defect | 0 | 0 | |
| NEW, timing | 0 | 0 against s21-r2; 1 against s17-r1: WorldFirstStudioHome topbar focus (30 s budget) timed out under lane load, PASS 17.6 s alone on 6ddeeb00, file 33 of 33 | no waiver (decision D); budgets unchanged |
| Over-budget passes | 693 | 50 | lane load, as in every baseline |
| Browser journeys | eight of eight in installed Chrome on 6ddeeb00 (the new-studio → release → finances → save/reopen loop, D-12, P17, P18 season, astra18 rights desk, astra19 portability, astra24 acquisition, astra24 estate) | | the coordinator's evidence, not the Owner's |
| Human acceptance | OWNER ACCEPTANCE PENDING: no feedback since the Sprint 21 invitation; PR #20 zero comments | | not claimed |
| Native | BLOCKED on this host (recorded once in ENTRY.md); paired STATIC-UNRUN; CF09 seal PASS 901b9b55 × e7dcfc3 with no contract change since, re-executed checks on 6ddeeb00 | | Sprint 25 |

The candidate gated is the candidate tagged: no change after the gate; no corrective run was needed (the one alone measurement is reported beside the original, not in place of it).

## Launch and build (tested here, in this order)

```
# engine + browser client, Node v20.20.2 (the lane env file); from the checkout root
npm run -s typecheck            # root + ui
npm run -s typecheck:bridge
npm run -s check:bridge-contract && npm run -s check:bridge-contract:fixtures
npm run -s build                # vite build of ui/
npm run dev -- --host 127.0.0.1 # the client at http://127.0.0.1:5173 (Start screen: New game, or Import a save)
# browser journeys (installed Google Chrome; Firefox and WebKit unavailable on macOS 12)
node node_modules/@playwright/test/cli.js test --config ui/playwright.config.ts ui/e2e/smoke.spec.ts
# the Sprint 24 journeys need the lane env file's genuine-capture bindings:
#   P16_JOIN_CLOSED48_PATH/_SHA256 (r04-actual163), P16_JOIN_PREC48_PATH/_SHA256 (r04-pre162)
```

Fixture provenance: the Sprint 24 journeys and the P16 closure tests read the admitted Save48 captures of the disclosed drained-R04 transaction route (studio-scratch/1370-astra-takeover-20261012/p16-original48-closure-capture-r2-run, CAPTURE-MANIFEST.json, sha256 cd11f369… / c17b7aa8… / 94fa74df…), never copied into a repository; the P18 journeys build their worlds in the page from tests/helpers/p18-season-world.ts (seeded); the three r3n1 dense fixtures are untracked on every baseline (MISSING-INPUT). No private save is packaged or named. Native build: Unity 6000.3.22f1 pinned (ProjectSettings/ProjectVersion.txt) on the counterpart at e7dcfc3; not run here.

## Technical integration recommendation

**CONDITIONAL GO** for the browser playtest of p18-season-20261028 at 6ddeeb00 (tag p18-sprint26-candidate-20261030) on installed Google Chrome, and for integrating it into main through draft PR #20, on these conditions, none of which the coordinator can meet:

1. The Owner's playtest verdict is KEEP on the route (the Sprint 21 invitation stands; the route now includes the two-gesture release commit, the Rights desk acquisition and estate flows and the closed-studio television claims).
2. The inherited failure baseline is accepted as the known pre-program state it is: 95 core cases in 24 files and 2 ui cases fail on the candidate for the same reasons they failed before Sprint 17; this program repaired none of them and the candidate is not green.
3. The native client is run on a Unity-capable host (compile, EditMode, PlayMode, build; the Sprint 15, 20 and 22 ACCEPTANCE OPEN items; the two §7 routes with no Bridge intent designed and built), or the Owner accepts the STATIC-UNRUN pairing for this promotion. Until then the native platform is untested, not conditionally good.
4. The Sprint 23 reading of decision B (earlier-cancelled seasons with a balance outstanding at closure become claims) stands or is overruled.

Technically the candidate is integrable now: typecheck, contracts, build and integrity 0; zero new behaviour defects and zero new pin defects across the full core and ui suites against both the Sprint 21 gate and the program baseline; the three rows Sprint 21 called NEW no longer fail; main unchanged and an ancestor; GitHub reports PR #20 mergeable; eight real-browser journeys pass. Timing rows are measured, not waived. A NO-GO would need a new behaviour defect, a broken contract or a serious inherited defect on the playable route; none was found (the inherited baseline is in test families off the route). A plain GO would need the Owner's acceptance and the native run, which do not exist. Promotion to main is the Owner's separate authorization; PR #20 stays a draft with auto-merge off. Sprint 27 is not started.

## Outstanding Owner decisions

1. Playtest verdict on the candidate (the Sprint 21 invitation stands; the route now also includes the Rights desk acquisition and estate flows and the two-gesture release commit): KEEP, REVISE or REJECT.
2. Promotion of p18-season-20261028 to main: not authorized by this program; PR #20 stays draft.
3. Sprint 23 reading of decision B: a season cancelled earlier while the studio still operated, with a balance outstanding at closure, becomes claims too (the coordinator's reading of "genuine outstanding refunds and charges"; one line overrules it).
4. Sprint 24: the Bridge has no estate-bid or title-sale intent, so the native client cannot reach two of §7's minimum routes; a rights projection for the Bridge is design work not yet assigned.
5. Sprint 25: a Unity-capable host for the native build, EditMode and PlayMode, or an explicit STATIC-UNRUN acceptance.
6. Carried from Sprints 17 to 21 and unanswered: the cutting-rival release law (decision C deferred this program), the Sprint 20 confirmation set (now adopted by decision A), the inherited failure baseline's acceptance as the pre-program state.
