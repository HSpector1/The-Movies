# 646-T — P14B.5 T0 minters authored (NOT executed): genuine outgoing Save V30 corpus + projection-47 runtime checkpoint

Status: **DONE** (authoring). The mint itself has NOT run; both ONE-SHOT cases refused cleanly without the token and no output directory exists.

Worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `d6c11b9b4809d361e356ef74495e731f9296acc2`, tree clean apart from the three new untracked files. Git read-only (rev-parse / log / diff / ls-files / status only). One test process at a time, never `--watch`. No existing file, fixture, source, cap or version touched.

## Files (new, untracked; no other change)

| Path | bytes | sha256 |
|---|---|---|
| `/Users/zacheryspector/The-Movies-headless-program/scripts/v30-mint-support.ts` | 12816 | `1133a18071be70f939e605413c7e0b03e17436cbf6f1d3a579d9083a85d1e79b` |
| `/Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b5-mint-v30.test.ts` | 30509 | `46b8306ede81e9b4d03eabd84bb5444623a634029c63002acfe28dea886e4512` |
| `/Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b5-mint-projection47.test.ts` | 10698 | `a91c316856b41b3a4bbe00a08fd98a4e479f69753744d5f988e6bc4ddb387800` |

Patch (three `git diff --no-index /dev/null <file>` outputs concatenated): `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/646-T.patch` (55411 bytes, sha256 `bda071059a3dd68bd9317e954f2ae3251a3cdb9dc363e17419191d97184a779b`).

Pattern followed: B4 T0 (evidence 01 support/minter, corrected 05 runtime minter with the 03/08 −0→0 premise, 09 closeout). Adaptations, each stated in the file headers:
1. **Gate diff pins.** `git diff --exit-code <testedSourceSha> -- PRODUCER_PATHS` (the B4 check) FAILS at HEAD because `651fea8b` (638-W) is a comment-only pass over `src/core/promiseCapacityOwners.ts` and `src/core/promises.ts` on top of the behavioural writer. `MinterAuthority` therefore carries `testedSourceSha` (61833f0d, behavioural) **plus** `textOnlySourceSha` (651fea8b) and `textOnlyProducerDiffSha256` (sha256 of the raw `git diff --no-color --no-ext-diff 61833f0d 651fea8b -- PRODUCER_PATHS`); the gate asserts ancestry tested→textOnly→published, `git diff --exit-code 651fea8b -- PRODUCER_PATHS` empty, and the exact hash of the comment-only diff. Nothing is restamped.
2. **DRY case before the ONE-SHOT.** Each minter file has a first `it` that builds every world/readback in memory (no token, no write) and prints the facts, then the gated ONE-SHOT `it` (B4's construction-before-directory-creation, now also runnable standalone). Worlds are memoized in the module, so a token run does not rebuild them.
3. **Refusal names the variable.** Gate message: `REFUSED: <VAR> must equal the independently accepted publication <sha>; only the parent sets it, and only for the one-shot mint`.
4. The projection-47 minter imports the shared `gate`/`sha`/`git` from the support script instead of duplicating them (B4's runtime minter was standalone).
5. The tagged-P2 route (`sign`/`realPlayerPromise`/`playerPayload`/`playerToFive`) is **copied** from `tests/p14b4-cast-class-outcomes.test.ts` :143-190/:312-347, not imported (importing a test file registers its cases). `variant()` (labeled synthetic material) is NOT used anywhere. The route file is hashed into `sourceFiles` and listed in `PRODUCER_PATHS`.

## Authority block (`APPROVED_FINAL_V30` / `APPROVED`) — every value and how it was verified

| Field | Value | Verified by |
|---|---|---|
| phase | `qualified P14B.4 logic closeout / exact last-V30 upstream before B.5` | task text |
| testedSourceSha | `61833f0df4ffdb5673903d5a81680b2d37ba254b` | `git rev-parse 61833f0d`; `git log -1` = "629-W S2 … (record 630 R6)"; `git log 61833f0d..d6c11b9b -- src bridge ui generated` shows only `651fea8b` |
| textOnlySourceSha | `651fea8ba28450ad20dccf45f209bde6ab058aaa` | `git rev-parse 651fea8b`; `git diff 61833f0d 651fea8b` over PRODUCER_PATHS touches exactly `src/core/promiseCapacityOwners.ts` (header comment) and `src/core/promises.ts` (reclassifyPromise doc comment); I read both hunks: comment text only |
| textOnlyProducerDiffSha256 | `456a099e448f5c4f7ff2a3506dd1cf3c82611c5e7b16ddfc29cb26d70cc0b31a` | `git diff --no-color --no-ext-diff 61833f0d 651fea8b -- <PRODUCER_PATHS exactly as in the support file> \| shasum -a 256` (git 2.37.1 Apple); `git diff --exit-code 651fea8b -- <same>` exit 0 |
| publishedRecoverySha | `d6c11b9b4809d361e356ef74495e731f9296acc2` | `git rev-parse HEAD`; `git status` clean before authoring. **Remote not re-verified by me** (parent's step) |
| closeoutRelativePath | `docs/engineering/playability-launch-review/evidence/p14b4-20260919/637-cancel-causal-qualified-checkpoint.md` | `git ls-files --error-unmatch` (tracked) |
| closeoutSha256 | `382eee596901b28e4c597cd46ec09ffd6ee15f54f4c443d23090dde57e23f6a4` | `shasum -a 256` on the file at HEAD |
| schemaId | `sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538` | `generated/unity/StudioBridgeDtos.Generated.cs:3` and `:20`; the gate also asserts the live `SCHEMA_ID` from `bridge/protocol.ts:35` equals it (the dry runs' checkpoint `schemaId` printed this value) |
| projectionVersion | 47 | `bridge/schema/bridge-schema.ts:233` |
| protocolVersion | 4 | checkpoint `protocolVersion` printed 4; `bridge/protocol.ts` PROTOCOL_VERSION |
| saveVersion | 30 | `src/core/save.ts:6396` `LIVE_SAVE_VERSION = 30` |
| promiseRulesVersion | 4 | `src/core/promises.ts:45` `PROMISE_RULES_VERSION = 4` |
| approvalEnvironmentVariable | `STUDIO_MINT_V30_APPROVED_FINAL` (corpus) / `STUDIO_MINT_PROJECTION47_APPROVED` (runtime) | task text |
| outputRelativePath | `tests/fixtures/p14/genuine-v30-pre-b5` / `tests/fixtures/p14/genuine-projection47-runtime` | task text; both absent before and after every run (`test ! -e`) |

Registry fact (read): `bridge/runtime-checkpoint.ts:63` last registered prior schema is `projection-v46` = `sha256:584bdd…`; the current schema `6f6b4880…` is NOT in `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`, so `loadBridgeRuntimeCheckpoint` takes the decode path with `migratedFromProtocolVersion === null` (asserted in the runtime minter with a throwing `createSessionId`).

`PRODUCER_PATHS` = B4 list + `tests/p14b4-cast-class-outcomes.test.ts` + `tests/fixtures/p14/genuine-v29-pre-p2`.
`EVIDENCE_FILES` (hashed into provenance, 41 entries) = B4's 23 + `src/core/index.ts`, `tuning.ts`, `worldgen.ts`, `hollywood.ts`, `operations.ts`, `technologyProduction.ts`, `hollywoodPolicy.ts`, `hollywoodTick.ts`, `promiseCapacityOwners.ts`, `promiseCapacityEnumerator.ts`, `promiseCapacityOwnerReplay.ts`, `bridge/protocol.ts`, `bridge/runtime-checkpoint.ts`, `bridge/promises.ts`, `bridge/people.ts`, `tests/p14b4-cast-class-outcomes.test.ts`, `tests/fixtures/p14/genuine-v29-pre-p2/MANIFEST.json`, `…/genuine-v29-refused-p2-count-only-current-draft.json.gz`. (The `git diff --exit-code` over `src`/`bridge`/`ui`/`generated` covers the transitive closure exhaustively; the list is the readable subset.)

## Case table (dry-built in memory at HEAD, no token; all 10 built, readbacks passed; hashes IDENTICAL across two runs)

Seed `p13a-core-causal-01` for every case; player studio `studio-aca408ec-player`. Every readback in `prepareV30Corpus`: `exportSave(makeSave(state))` → `validateSaveV30(JSON.parse)` → re-export equal → `validateSaveV30(importSave)` re-export equal → `BridgeSession.fromSaveJson` re-export equal + promises/firstTakes/talentMarket deep-equal → gzip/gunzip identity.

| # | case (file `genuine-v30-<case>.json.gz`) | route | key facts (week / roots / focus) | raw sha256 · gz sha256 (dry run; expected identical on the real mint) |
|---|---|---|---|---|
| 1 | `empty` | `p13aGeneratedStudio()` | w0; promises 0, firstTakes 0, receipts 0, proposals 0 | `34f772fb643c0df0c63882511a396bcc296b7e327096c5970bc6f4a107be0525` · `7c237fef11cbc7c1f8e41b3ca8a4d3fad076f3e5df53ad72af2be1d37f2c2d9a` |
| 2 | `current-p1` | `retentionFixture().submitted` | w45; promises 2, firstTakes 20, receipts 4, proposals 2; focus promise-0 (t-act-09) and promise-1 (t-act-08), APPEARANCE_COUNT {count:1}, v4, rules-4 REASONABLY_ACHIEVABLE @45, window [52,92), unbound, CURRENT | `b7a32680df6f002c10829e7edd644a394b9b0cdac1427a7af0aef5395501aebe` · `a13704632d58909b9edc330f2f6d946f3e3fe7bfc1d9d2adb3ab2a430fd540fd` |
| 3 | `bound-open-p1` | `retentionFixture().bound` | w52; promises 2, firstTakes 20, receipts 6, proposals 0; promise-0 → contract `…:t-act-09:52:player-31`, promise-1 → `…:t-act-08:52:player-32`; OPEN; receipts rules-4 @52 | `afca923d2979caad72ffe660d069849e9e08f4eddf8642162c09ed8bd0f48c33` · `48962fd2c47d0b6557a8c68d281d11ed3b7528ddc1ad075372981dab40516bae` |
| 4 | `bound-open-p2-lead` | copied `realPlayerPromise('lead')`: fund → 6 real signContracts → real set commission → advanceTo(45) → real submitProposal(52w, 1.25) + real attachPromise {kind:'castRoleCount',count:1,seatClass:'lead'} window [52,92) → real freeze at 52 binds | w52; promises 1, firstTakes 20, receipts 3, proposals 0; promise-0 t-act-09, v4, rules-4 REASONABLY_ACHIEVABLE @52, contract `…:t-act-09:52:player-30`, OPEN; submittedWeek 45 | `68651875e6382887050e7057c4d30f2b6251a9070cb71dcef41c9213c63ec702` · `4966e51b75bf2ae7fcabf67bc27fd50781a42ce3833d0eb83847ed5573b59f7b` |
| 5 | `bound-open-p2-lead-or-antagonist` | same route, seatClass `leadOrAntagonist` | identical facts to #4 except the predicate (asserted `notDeepEqual`) | `ab53968320371d261d0ec4c7083691512283e2af7365905914ebdc3a11408077` · `14508b4bdf5cb1242fb5f7891c92da13ed9c0719f4a1282d59850c4d17832ebe` |
| 6 | `kept-and-broken` | `retentionFixture().outcomes` | w61; promises 2, firstTakes 25, receipts 8; promise-0 SATISFIED @61 evidence `first-take-event-24` (prod-0052) own receipt `talent-market-event-6`; promise-1 BROKEN @61 own receipt `talent-market-event-7`, evidence []. **BROKEN seam: `breakPromisesOnTermination` (actions.ts) via the real `releaseTalent` action in the unchanged B2 recipe — same week as the take; NOT the due-week owner and NOT the cancel seam.** Genuine: a real action through `applyActions` with its own `promiseOutcome` receipt; the employment row `endedWeek === outcomeWeek` is asserted | `6336f7560f1cb7896cb62162908f80d412bf87370b0df002b2f80cf9ceea2e36` · `5c55f3ac3f510643ce72405d65f0391fcf096a7ee64ad014d2ebd10851c716f5` |
| 7 | `rival-current-p1-and-p2` (**renamed**, see below) | `rivalFixture().open`; focus derived from actual current rival proposals with attachments (B4 derivation) | w196; promises 48, firstTakes 45, receipts 96, proposals 72; 48 current rival attachments (r01/r02 issuers), ALL unbound/OPEN, v4, rules-4 REASONABLY_ACHIEVABLE @196, window [208,416); 42 × APPEARANCE_COUNT {count:1} and **6 × tagged LEAD_OR_SIGNIFICANT_ROLE_COUNT {castRoleCount,1,leadOrAntagonist}** (promise-10/11/28/29/32/33) | `c155f636a8758f33e6ee002f124e5da2f51ffb5f37404cbbcf9d7cea736a52a1` · `e2e8ac939875a1b23bd898c10773f707f8c64d77d476802499a591961d2316c1` |
| 8 | `rival-shared-take-terminal` | `rivalFixture().terminal` + bounded real tick/receipt-group search ≤230 (T4 sharedTakeOutcomes) | w213; promises 48, firstTakes 46, receipts 123, proposals 0; take `first-take-event-45` on `studio-aca408ec-r01:film:11` @213, cast lead r02-3 / antagonist r02-2 / support r02-0; SATISFIED promise-12 (r02-0, own receipt `talent-market-event-120`), promise-16 (r02-2, `-121`), promise-18 (r02-3, `-122`) — **matches the landed 619-T2 receipts exactly** (post-seam film:11 / 12-16-18, not the pre-seam film:6 / 16-18-20) | `a90f97cefd7031bbec526f94c1f6b714f54d6e5c4c89cf510ad3670bbe5a9eb6` · `0430ea318f96efaae373c1010eb0a9fc24f24de4b20a358fbe2b1f795f71ab3c` |
| 9 | `first-take-at-five` | #4 world → copied `playerToFive(lead)`: real greenlight @52 (`prod-0052`, cast lead t-act-09 / antagonist t-act-12 / support t-act-11, director t-dir-01) → 3 ticks → real setProductionSetupRecipe → ticks to remainingTicks 5 | w60; promises 1, firstTakes 24, receipts 3; promise-0 tagged lead, bound, OPEN, window holds w61; shooting task `unassigned`, technology locked, no take for prod-0052. **Premise proof on a discarded clone** (recorded as `additionalFacts.nextTakeIfScheduled`, not saved): assign director + schedule + one tick → `first-take-event-24` @61 with that cast, promise-0 SATISFIED, own receipt `talent-market-event-3` | `3eab4f7af55917d3a011776850f129dc5dc135da8215d8ebec6845dfb8db620d` · `62df3d07eee0a01da767203f51b0ce89edfdb281177511f848a740293ca4ceb7` |
| 10 | `legacy-count-only-p2-current-draft` (**substituted for `legacy-count-only-p2-bound`**, see below) | ORIGIN = genuine V29 corpus `tests/fixtures/p14/genuine-v29-pre-p2/genuine-v29-refused-p2-count-only-current-draft.json.gz` (gz `dedd68ed…5497`, raw `7f7529cb…a253`, MANIFEST `77fa32da…8c1d1`, authority 89b5ad2c/c06db6ea/V29/rules 3, all re-hashed and matched against its provenance) → `validateSaveV29` → real `migrateToV30(importSave(raw))` at HEAD | w45; promises 3, firstTakes 20, receipts 5, proposals 2; `migrated.state` deep-equal to the V29 state; `JSON.parse(exportSave(migrated))` equals the V29 envelope with only `saveVersion: 30`; focus promise-2 LEAD_OR_SIGNIFICANT_ROLE_COUNT **{count:1} (no kind)**, v3, rules-3 IMPOSSIBLE @45 (bottleneck as frozen in V29), unbound, still referenced by a CURRENT player proposal for t-act-09 | `3c46a87473dea1c231dfad248d5af483ed4331bc9ba6787262bba442a993a494` · `e7b33115f37605656649df2544885418680679b0dd5548afaaaeee52bcb4f174` |

Byte sizes (raw / gz): empty 383776/47265; current-p1 675654/82610; bound-open-p1 729829/88103; p2-lead 726927/87978; p2-lead-or-antagonist 726939/87990; kept-and-broken 796283/95800; rival-current 1133174/122805; rival-shared 1131552/122599; at-five 779578/94125; legacy 676337/82742.

**Dropped / renamed, with reasons**
- `legacy-count-only-p2-bound` → **dropped; substituted by `legacy-count-only-p2-current-draft`.** No genuine V29 fixture holds a BOUND count-only P2 (scanned all 12 gz under `genuine-v29-pre-p2/` and `genuine-v29-pre-b3-evaluator1/`: the only P2 root anywhere is the refused current draft promise-2, unbound, IMPOSSIBLE). P2 was nonofferable in V29 (IMPOSSIBLE at attach, `promiseNotFeasible` drop at the freeze), and at HEAD `promiseFeasibility` refuses a count-only P2 at any new quote/freeze (`src/core/promises.ts:395-397` "a seat-class promise needs its seat class selected …"), so no real route can bind one. The only bound count-only P2 in the repo is the outcomes test's labeled synthetic `variant(atFive(...), legacyP2())` (material rewritten in memory), which "no fixture field written by hand" forbids. The substitute is the "legacy generic cast" record shape carried into V30 by the real `migrateToV30`; provenance `recipe.origin`/`recipe.droppedVariant` state this.
- `rival-current-p1` → **renamed `rival-current-p1-and-p2`.** At HEAD `authorRivalPromise` (`talentMarket.ts:1275-1296`) offers a tagged leadOrAntagonist P2 before the P1 for an unproven person; the default seed's open world holds 6 such tagged rival attachments beside 42 P1s. The definition ("a rival's CURRENT attachment") is met; the name now says what the world holds. If the parent prefers the literal name, it is a one-token change at `tests/bridge-p14b5-mint-v30.test.ts:402` before the mint.
- `current-p1`: focus lists BOTH current attachments (promise-0 kept, promise-1 broken) instead of B4's single one — provenance metadata only, bytes unaffected.

**Runtime checkpoint (`tests/fixtures/p14/genuine-projection47-runtime/`)** — route: `retentionFixture().submitted` (= corpus `current-p1`) → `new BridgeSession(state, 'p14b5-genuine-outgoing47')` → real `save` (`save-current-p1`) → real `quoteMarketProposal` withdraw of t-act-09 → real `submitIntent` (`commit-withdraw`) → `exportRuntimeCheckpoint()`. Dry facts: schema `6f6b4880…`, protocol 4, projection 47, revision 1, journal `['save','command']`, journalDigest `8847518a4baccd40985dd3cd310cd2c1838329e28f293669fd832db47ee47bb4`, **savedSaveSha256 `b7a32680…aebe` = corpus `current-p1` raw sha256 (byte-identical, as in B4)**, currentSaveSha256 `6788225135a0c7a2eca94faaf6d0d068b8dac1ba00e7b6b8ad29c7d4338c7388`, both V30 @w45, saved 2 proposals / current 1, promises deep-equal across slots, quote intent `intent-v4-b0002a249cabc02e6b099e2269db0407002c76976b579bec7f2623c5cf26ea78`. Assertions kept from 05: both slots strict-`validateSaveV30` + canonical re-export, **each slot equal to `exportSave(makeSave(<its own expected state>))`** (the −0→0 premise), decode without migration, reopen → identical bytes, same-identity retry replays the journal response, bytes unchanged after retry, gzip identity. Dry uncompressed 3183647 B / gz 301367 B, uncompressed sha `4fb26dae8daa24367161f38daaea60e5e217a48d766e45688ac2f586d87d0a61`, gz `16b30eea8914d946ee5fc8aaaad7294e2bcdac2c1658fc8942a4a6cf0bdc51dd` — **these two outer hashes WILL differ on the real mint**: journaled responses carry `processingMs` (`bridge/session.ts:1599/:1992`), which B4 08 also noted ("processing-time fields are not restamped"). The inner slot hashes, week, revision, routes, intent id and command id are deterministic and comparable.

## Checks actually run (all at HEAD d6c11b9b, one process at a time, no token set: `env | grep -c STUDIO_MINT` = 0)

| Check | Command | Result | Log |
|---|---|---|---|
| root + ui typecheck (as directed) | `npm run typecheck` | EXIT 0. Note: root `tsconfig.json` EXCLUDES `tests/bridge*.test.ts` and does not include `scripts/`, so this run does not see the three new files | `…/scratchpad/646-T-typecheck.log` |
| bridge typecheck (the project that includes `tests/bridge*.test.ts` and, via import, `scripts/v30-mint-support.ts`) | `npm run typecheck:bridge` | EXIT 0 on the final bytes (an earlier iteration failed on a self-referential return type in the runtime minter; fixed with an explicit `PreparedRuntime` type) | `…/scratchpad/646-T-typecheck-bridge.log` |
| corpus minter without token, run 1 (pre-rename of case 7) | `node_modules/.bin/vitest run tests/bridge-p14b5-mint-v30.test.ts --minWorkers=1 --maxWorkers=1` | DRY ✓ 10953 ms (10 worlds + readbacks, facts printed); ONE-SHOT × 13 ms `REFUSED: STUDIO_MINT_V30_APPROVED_FINAL must equal … d6c11b9b…`; exit 1; `tests/fixtures/p14/genuine-v30-pre-b5` absent before and after | `…/scratchpad/646-T-mint-v30-no-token-run1-prerename.log` |
| corpus minter without token, final bytes | same | DRY ✓ 10741 ms; ONE-SHOT × 15 ms same refusal; exit 1; output absent before/after; **all 10 raw+gz hashes identical to run 1** | `…/scratchpad/646-T-mint-v30-no-token.log` |
| runtime minter without token | `node_modules/.bin/vitest run tests/bridge-p14b5-mint-projection47.test.ts --minWorkers=1 --maxWorkers=1` | DRY ✓ 6432 ms (facts printed); ONE-SHOT × 11 ms `REFUSED: STUDIO_MINT_PROJECTION47_APPROVED must equal … d6c11b9b…`; exit 1; `tests/fixtures/p14/genuine-projection47-runtime` absent before/after | `…/scratchpad/646-T-mint-projection47-no-token.log` |

`git status --short` after everything: only the three `??` new files. No stash, commit, checkout, add, reset or push.

## Exact commands for the parent (after re-verifying the remote at d6c11b9b; the three operational files must stay UNTRACKED so HEAD remains d6c11b9b — B4 ran them untracked; `PRODUCER_PATHS` does not cover `scripts/` or `tests/bridge*`)

```
cd /Users/zacheryspector/The-Movies-headless-program
git rev-parse HEAD            # must print d6c11b9b4809d361e356ef74495e731f9296acc2
git status --short            # only the three ?? operational files
test ! -e tests/fixtures/p14/genuine-v30-pre-b5 && test ! -e tests/fixtures/p14/genuine-projection47-runtime
STUDIO_MINT_V30_APPROVED_FINAL=d6c11b9b4809d361e356ef74495e731f9296acc2 node_modules/.bin/vitest run tests/bridge-p14b5-mint-v30.test.ts --minWorkers=1 --maxWorkers=1
STUDIO_MINT_PROJECTION47_APPROVED=d6c11b9b4809d361e356ef74495e731f9296acc2 node_modules/.bin/vitest run tests/bridge-p14b5-mint-projection47.test.ts --minWorkers=1 --maxWorkers=1
```
Run them one at a time (never concurrently: both call `retentionFixture()` in their own process, fine, but the parent's single test slot applies). Each run executes the DRY case first (facts printed again) and then the ONE-SHOT, which gates, prepares (memoized), gates again and writes. Expected: 2 passed / 0 failed per file, exit 0.

Expected output files (23 + 3):
```
tests/fixtures/p14/genuine-v30-pre-b5/MANIFEST.json                                   (written LAST)
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-empty.json.gz                      + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-current-p1.json.gz                 + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-bound-open-p1.json.gz              + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-bound-open-p2-lead.json.gz         + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-bound-open-p2-lead-or-antagonist.json.gz + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-kept-and-broken.json.gz            + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-rival-current-p1-and-p2.json.gz    + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-rival-shared-take-terminal.json.gz + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-first-take-at-five.json.gz         + .provenance.json
tests/fixtures/p14/genuine-v30-pre-b5/genuine-v30-legacy-count-only-p2-current-draft.json.gz + .provenance.json
tests/fixtures/p14/genuine-projection47-runtime/genuine-projection47-runtime.checkpoint.json.gz
tests/fixtures/p14/genuine-projection47-runtime/genuine-projection47-runtime.provenance.json
tests/fixtures/p14/genuine-projection47-runtime/MANIFEST.json                        (written LAST)
```
Parent artifact check (the 04/07 pattern): every corpus raw/gz sha256 in MANIFEST/provenance should equal the dry-run table above (deterministic; two runs agreed); the runtime `savedSaveSha256` should equal `genuine-v30-current-p1`'s `uncompressedSha256` (`b7a32680…aebe`) and `currentSaveSha256` should be `67882251…7388`; the runtime outer hashes will not match the dry run (processingMs). Provenance `command` fields embed the env assignment for the record.

Counts: 10 corpus cases (10 requested: 9 as requested by definition, 1 substituted with reason; 1 renamed); 1 runtime checkpoint; 2 test files + 1 support script; 2 typecheck runs EXIT 0; 3 no-token vitest runs (2 tests each: DRY passed, ONE-SHOT refused); 0 output directories created.

## Evidence limits

- Nothing was minted. The dry hashes are in-memory readbacks at HEAD, not published artifacts; the parent's real mint produces the bytes, and a KEEP still needs the independent auditor (06/08 pattern).
- The gate's remote verification, branch/HEAD equality and untracked-producer check ran only in their refusing branch order (the env check is first, as in B4), so the later git/hash assertions have not been exercised in a passing run here. They are the B4 assertions plus the two new diff pins; the two new pins were verified by the equivalent shell commands above, not by the gate itself.
- `npm run typecheck` does not type-check the three new files (root tsconfig exclusion); `npm run typecheck:bridge` does and is EXIT 0.
- The diff-hash pin assumes the parent's `git diff` output is byte-identical to mine (same machine, git 2.37.1 Apple, `--no-color --no-ext-diff`). If a different git produced different diff text, the gate refuses loudly; that is a false refusal, not a producer drift.
- `first-take-at-five` facts.nextTakeIfScheduled is a discarded-clone probe recorded in provenance; it is not part of the saved world.
- Case 8's search reads the first ≥2-beneficiary group found from `rival.terminal` forward; it is the landed default-seed result (film:11, 12/16/18). The pre-seam alternative (film:6, 16/18/20 at the same take id) no longer occurs, matching 619-T2.
- Not run: any broader suite, the outcomes test, the bridge fixtures generator, native/UI. No Owner campaign touched.

## Next concrete action

Parent: re-verify the remote at d6c11b9b, keep the three files untracked, run the two commands above one at a time, run the 04/07-style artifact check against the dry-run table, dispatch the contract-auditor KEEP (06/08 pattern), then archive the three operational files as `.executed.ts.txt` under the B.5 evidence folder and remove them from discovery before committing the fixtures (09 pattern).
