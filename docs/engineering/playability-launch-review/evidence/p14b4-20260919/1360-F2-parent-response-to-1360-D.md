# 1360-F2: parent response to 1360-D

[1360-D](1360-D-p15-wave2-landing-review.md) reviewed [1360-F](1360-F-parent-rulings-p15-wave2-red-landings.md),
[1360-X](1360-X-p15-wave2-landing-replay.md), the P15C r8 classification and the recorded-run script.
- **Verdict.** PROCEED with steps 4 to 7, and HOLD at step 8 (the P15C mint) until two required items close.
- **Steps 1 to 3** were already done; 1360-D checked them blob for blob.

This record closes both items, adopts the recommended hardening, and corrects the records 1360-D found overreaching.

## Rulings

1. **P15C's fallback is declared, so step 8 proceeds** (required item 1). 1360-F ruling 1's fallback covered only the
   shared capture's readers (1355-F5). For P15C, if its production misses the shared Save45 step:
   - a helper edit moves `CAPTURE_DIRECTORY` (`tests/helpers/p15c2-route-l.ts`) to a path named for P15C's own step;
   - 1359-P runs again, as a recorded mint, at the last writer below that step;
   - C2-C4 re-pin to the new captures' messages;
   - the Save44 directory retires in the same commit.

   This is the same kind of cost 1355-F5 declares for P15A.1's capture leaves. Minting now completes P15C's RED
   evidence on the writer that serves the shared step. Holding until P15C's gating G-P passes would leave the RED
   unrecorded until after the sibling productions are authored (1353-F7:64-68).
2. **Ruling 1's standing condition and cost** (required item 2).
   - **Save45 is reserved** for the shared P15 step: P15A.2 slice 2a, P15A.1 and P15C, with P15B's condition root if it
     is ready with them. No other save step takes 45.
   - **No production commit lands in the repository until Save45 lands.** Test, fixture and docs commits do not move
     the writer.
   - **A 1357-Q1 production change.** An Owner answer of (a) to 1357-Q1 makes rival cost-cutting and a fix for the
     filming stall production work (1357-F2 §4). If that work must land before Save45, the parent rules again before
     its commit:
     - the change moves the Save44 writer;
     - so the P15 captures and the 1355 K1, K2 and M0A pins retire;
     - each producer mints again at the new last writer below Save45;
     - the reading leaves re-pin.
   - **The cost of holding slice 2a.** Every campaign that keeps playing on a Save44 build during the wait migrates
     later, so its archive, and P15C's Legacy, record from a later week (`recordedFromWeek`; 1359-A:273-276;
     1356-A:242-243). The Owner's own campaigns pay this cost too. The parent does not read them, so it cannot measure
     the cost; the bound below limits it.
   - **The wait has a bound.** Once slice 2a's production has passed its review and its dry run on the landed REDs,
     the parent rules again if P15A.1's G2 or P15C's G-P has not returned. Slice 2a may then land alone at Save45. The
     others take their declared re-pins at a later step (1355-F5 for P15A.1; ruling 1 here for P15C).
3. **The recorded-run script is hardened as `recorded-p15-v2.sh`** (finding 3). It is a versioned copy:
   `recorded-p15.sh` ran step 2 and stays as it was. The copy adds four checks:
   - **(a) The producer.** It must be in HEAD's tree, match HEAD, and carry its staged sha256 (r3 5007e231…, r4
     78c1d105…).
   - **(b) The meta.** It logs the recorder's `exitCode` from `<stem>.json` and lists what a mint wrote.
   - **(c) Named stops** for each producer's output directories.
   - **(d) The pin and the captures.** `red1355` requires `CAPTURE_MANIFEST_SHA256` to hold a 64-hex literal equal to
     the committed MANIFEST's sha256. `red1359` requires the route L MANIFEST to be tracked.
4. **What "must match 1360-X" means** (finding 4, third item).
   - **A mint** matches when every MANIFEST field matches except `executionHead`, `elapsedMs` and `routeMs`
     (1360-D's `cmp-manifest.py`, staged in [1360-stage/d/](1360-stage/d/)).
   - **A recorded RED** matches when each leaf's status and first message line match, apart from the importing-file
     path inside Vite's load errors. That exception covers two 1355 leaves, and thirteen 1356 leaves after the mint.
5. **Corrections.**
   - **1360-F ruling 2.** The sentence on P15C's forged-root leaves goes: it rests on the production order, not the
     RED order (finding 6). The order stands on 1355-F4 and on ruling 3.
   - **1360-F's step 7** no longer lists the r8 classification, which cfce1f38 already committed.
   - **1360-X** names the right missing module for each type error, gives the 1356 load-error count, and names the
     route L MANIFEST's `routeMs` (finding 4).
6. **Notes carried to the closure and to the production plan.**
   - **The r8 patch header.** It names r7's blob for the integration test (`index 0000000..ed43f1b`). `git apply`
     ignores a new file's postimage id. After step 7 the blob check expects:
     - 80694a20… for `tests/p15c2-campaign-legacy-integration.test.ts`;
     - 2f2acc5f… for the four-key `tests/helpers/p15-roots.ts`.
   - **The `fixturePending` flag.** The two classifications use it differently (finding 8), so a closure census reads
     each file on its own terms.
   - **G2.** G2's rerun at the RED commit is K3's baseline (1355-F4:41). The production plan runs it on an archive of
     e4be3e5c, the 1355 RED commit.
   - **The executing HEAD.** The 1355 mint runs at a docs-only descendant of e4be3e5c. 1360-L states that its source
     equals the RED commit's (1355-A:161).
