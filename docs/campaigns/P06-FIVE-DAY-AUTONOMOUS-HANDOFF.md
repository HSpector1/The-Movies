# P06 Five-Day Autonomous Campaign — Durable Handoff

**Campaign:** P05 Owner closeout → P06 Post/Release → Living Studio Command Layer
**Authority:** Owner order of 2026-09-01 (P05A.3 ACCEPTED — KEEP; P05 CLOSED; 120-hour
autonomous window authorized). This document is the campaign's durable memory and must
remain resumable from GitHub without chat history.

---

## 0. Campaign clock

| | |
|---|---|
| Local start | Tue 2026-09-01 22:00:45 CEST |
| UTC start | Tue 2026-09-01 20:00:45 UTC |
| Hard deadline (+120h) | Sun 2026-09-06 22:00:45 CEST (20:00:45 UTC) |
| Machine | Mac15,9 (Apple Silicon, arm64) |
| OS | macOS 26.6.2 (build 25G83) |
| Unity Editor | 6000.3.22f1 |
| Node | v24.16.0 |
| Free disk at start | 650 Gi |
| Display | 3456 × 2234 Retina |

## 1. Repositories and canonical paths

| Repo | Path | Remote |
|---|---|---|
| TypeScript (authority) | main checkout `/Users/bruce/The Movies - Github Push Test`; campaign worktree `/Users/bruce/The Movies - P06 Campaign TS` (branch `campaign/living-lot-ts`) | `hspector-github` → github.com/HSpector1/The-Movies |
| Unity client | `/private/tmp/studio-p05a-impl-01/unity` (P05A.3 worktree; P06 will use fresh worktrees) | `origin` → github.com/HSpector1/project-studio-unity-visual-spike |

## 2. P05 final authority — RESOLVED AND INTEGRATED (2026-09-01 ~22:15 CEST)

The campaign order required exact resolution before any P06 work. Findings:

**Sealed product pair (full 40-char), from the hostile-review-corrected evidence doc
§8 (`docs/engineering/P05A3-CASTING-ROSTER-LIVENESS-EVIDENCE.md`) and the candidate
`build-manifest.json`:**

| | |
|---|---|
| TypeScript product seal | `a994de38e8f87b8680f5ab4bd6fb62e7b594c5db` |
| Unity product seal | `784f2d52e2459f2cf7a12cbde49319f2bb81df6c` |
| Player executable sha256 | `b5108a78895acb727f74fe23931ceaab76c6b36c06bdff603fd76f3d45fdd09e` |
| Assembly-CSharp sha256 | `73a245e50d2e1b8db67b4e967d8259d6c4fe4517db23b6d1f6d63604a9dd70fa` |
| Engine bundle sha256 | `dba4e48b4bcc82e75bc8d20b194e26dbc6cb5c6739c710ae97a2f8da496056c3` |
| Preserved candidate | `~/Desktop/P05A3-Owner-Candidate-a90d1c6-784f2d5` (exe hash re-verified byte-identical at campaign start) |

The candidate folder abbreviation `a90d1c6` names the docs-inclusive WIP tip at
preservation time; commits `a90d1c6` and `18ab9b6` after the product seal `a994de3`
touch only the evidence document (verified by `git diff --name-only`). The TS
campaign tip therefore carries the seal plus its evidence record.

**Discrepancy found and remedied at campaign start:** P05A.3 was NOT integrated.

- TS: local WIP `wip/p05a3-casting-roster-liveness-ts` tip `18ab9b6…` held 11 commits
  absent from the remote (remote WIP was at `aa5f385…`); `campaign/living-lot-ts` was
  still at the P05A.2 authority `9361542131b1feb28a1e14cf3bdefd0a99781d9e`.
- Unity: the ENTIRE P05A.3 implementation (10 commits, `31d3800…→784f2d5…`) existed
  only locally; remote WIP and remote campaign were both at
  `31d38004f485a1fedb21c6274b7abf266a94ba82`.

All Section-3 requirements were verified (manifest SHAs, executable hash byte-match,
clean porcelain in both worktrees, docs-only trailing delta, ordinary fast-forward
ancestry both repos), then remedied by NORMAL pushes and FF-only ref updates — no
force, no rewrite:

| Ref | Before | After (local = remote, verified via ls-remote) |
|---|---|---|
| TS `wip/p05a3-casting-roster-liveness-ts` (remote) | `aa5f385` | `18ab9b6459e90b16b4455ea4695a0938e8f6a87d` |
| TS `campaign/living-lot-ts` (local+remote) | `9361542` | `18ab9b6459e90b16b4455ea4695a0938e8f6a87d` |
| Unity `wip/p05a3-casting-roster-liveness-client` (remote) | `31d3800` | `784f2d52e2459f2cf7a12cbde49319f2bb81df6c` |
| Unity `campaign/living-lot-client` (local was already FF'd; remote) | `31d3800` | `784f2d52e2459f2cf7a12cbde49319f2bb81df6c` |

## 3. Campaign plan of record (Owner order sections → status)

| Step | Status |
|---|---|
| §0 clock + this handoff | DONE (`da8b947`) |
| §3 resolve exact P05 authority | DONE (above) |
| §4 formal P05 closeout (ledger + lessons) | DONE (`f8dbe97` ledger, `59d9a2d` lessons) |
| §5/§11 read P06 authorities; refresh gate/recon/charter to final r2 | **DONE — hostile review round-3 FINAL ACCEPT** (rounds: 12 findings → remediated `d4acc18` → 2 residuals → remediated `fc8800a` → ACCEPT; reviewer independently re-ran both econ probes and reproduced the audit to the dollar). Integrated into `campaign/living-lot-ts` by clean cherry-pick (campaign had one interleaved handoff commit, so direct FF was impossible; the six docs-only commits `1f5c459..fc8800a` on `codex/p06a-final-refresh-01` re-landed as `a44d0bb..e978186` — all seven reviewed files verified byte-identical to the ACCEPTed tip). Launch package is binding W0–W8 authority; the review record lives in this transcript and the refresh branch is preserved as pushed. |
| §7 bounded research delta (≤12h, 4 lanes) | DONE — all four lanes complete in ≈1.5h; `docs/research/P06-LIVING-STUDIO-REFERENCE-DELTA.md` (`4e9df1c`) |
| §21 economic liveness audit | DONE EARLY — `docs/engineering/P06-ECONOMIC-LIVENESS-AUDIT.md`: INTENDED TEMPORARY CASH CONSTRAINT (attentive-player probe: −$314k trough → releases at wk13/14/17 → ~$14M peak; no trap state; visibility is the remedy and is already chartered) |
| §12 create P06 WIP branches | DONE — starting pair: TS `wip/p06a-post-release-living-studio-01-ts` @ `ba55b779f82d51ddd4a20d278eb7a3680b0b64f8` (docs-inclusive campaign tip); Unity `wip/p06a-post-release-living-studio-01-client` @ `784f2d52e2459f2cf7a12cbde49319f2bb81df6c`. Both pushed+verified. Durable worktrees: `/Users/bruce/The Movies - P06A Impl TS`, `/Users/bruce/The Movies - P06A Impl Unity`. |
| §13–18 waves W0–W5 | W0 DONE. **W1+W2 CODE-COMPLETE as one coordinated TS cutover** (disclosed deviation: the bridge floor cannot be truthfully green between the waves — a bridge-only player could not commit). W2 mint at `f946b44`: PROJECTION 14, NEW schema id `sha256:33a54b8258342f46d44df7ccfa8647aec9ff6c6f6dcd2d32715d98a43aa67e91`, P05 id `0474ceaf…` registered prior (projection-v13, governed journal-discard path), generated C# byte-equal in both repos, commit intents + closed Release projection + auto-roll fact on the wire, location REPLACE (ready/committed → post). Older facts: W1 CODE-COMPLETE on `wip/p06a-post-release-living-studio-01-ts` (commits `920caeb` core authority, `d2dda51` decision surfaces; both pushed): V16 `releaseAuthority`, both-arm gate + admission witness, tier-4 decision, journey/calendar/returnWeek truth, next-event zero-week stop, manual-advance carve-out, V15/V16 checkpoint compatibility window. 21 new focused tests green; all three tsc projects clean. Full-floor regression repair IN PROGRESS. |
| §13–18 waves W3–W5 (Unity) | **W3/W4/W5 PURE CORES DONE + EditMode-proven.** W3 `StudioPostPresentationRegistry` + `StudioPostPresentationContracts` (`8cc7485`); W4 `StudioPostWorldContracts` (world-cue derivation) + W5 `StudioReleaseContracts.ReleaseDecisionState` (`63cb828`). Unity EditMode floor 699→**722 green**. Unity WIP tip `63cb828` (contract-consumer at `3f73be3`). **Remaining Unity:** thin MonoBehaviour presenters wiring these pure cores into the lot + the retained workspace route + LSCL rail rows; the W8 shared-host route-enum refactor is lead-integration work. |
| §19 Living Studio Command Layer | PENDING (rail rows derive from `operationalState`; talent access reuses the P05A.3 shortage route; all read-only over existing truth) |
| §22–25 proof pyramid + 6-scene visual oracle + real-profile copy + HID | IN PROGRESS — TS core floor 2232/2232, contract checks verified, EditMode 722/722; ui-project floor repair (187 hold-law fixture fails) 2/4 lanes landed; six-scene oracle FIXTURE GENERATOR being authored (level-1 machine assertions, self-verifying). Packaged-player build + visual capture + HID + real-profile-copy journeys remain the heaviest lift. |
| §28–30 hostile review → quality convergence → seal + candidate | PENDING |

**FLOOR STATUS (all green):** TS core 2232/2232, TS ui **2671/2671** (WIP tip after browser-commit fix), bridge/contract verified, EditMode **722/722** (Unity tip `63cb828`). Browser release-commit affordance landed (adapter action + Dashboard `release-commit` control + App wiring + E2E) — closed a real P04-lesson-4 deadlock the repair lanes refused to paper over. Shared closed-canonical read-model checks moved to the live V16 builder. Six-scene oracle FIXTURE generator still authoring (background).

### Resume pointers (exact next actions if interrupted)
1. **ui floor:** await the 2 running repair lanes (screens-a/screens-b or lot-a/lot-b), then `cd "/Users/bruce/The Movies - P06A Impl TS" && npx vitest run --project ui`; fix stragglers with the bounded commit-at-ready drive idiom (`tickCommittingReady`), commit, push.
2. **oracle fixtures:** verify `scripts/gen-p06-visual-oracle-fixtures.mts` output (`ui/e2e/p06-visual-oracle-v1/`, 6 save+checkpoint+manifest, byte-identical reruns), commit.
3. **Unity presentation:** thin `IStudioPostPresenter`/world-cue MonoBehaviours + `StudioReleaseWorkspace` route (Production-route no-draft model) consuming the W3–W5 pure cores; register in `StudioBridgePresentation.CacheSceneObjects` (lead-integration file); EditMode + a packaged build.
4. **proof:** copy `Tools/p05-run-visual-oracle.sh` → p06 launcher (fresh port), six scenes, actual image inspection; real-profile-copy journey from the baseline at `/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/`.
5. **seal:** fresh hostile reviewer (25 criteria in charter Appendix A), fix at owning seams, FF campaign branches, preserve `~/Desktop/P06A-Owner-Candidate-<short-ts>-<short-unity>/`.

## 4. Key prior authorities (for resume without chat)

- P06 design: branch `codex/post-release-research-06` @ `8ccd8acc253901aadaa2175656c1e0f7d1a2df23`
  (`docs/design/CODEX-POST-RELEASE-PACKAGE-06.md` + `-BUILDER-ANNEX.md`)
- P06 provisional launch package: branch `codex/p06a-launch-package-01` @
  `c74cf79037fe9712247898c340834d0379c8b04c` (readiness gate 00, recon, provisional charter)
- Visual Direction Package: `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`
- P05 lessons: `docs/engineering/P05-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- P04 lessons: `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- Campaign ledger: `docs/campaigns/LIVING-LOT.md`

## 5. Update log

| When (local) | Event |
|---|---|
| 2026-09-01 22:00 | Campaign start; clock + environment recorded |
| 2026-09-01 22:15 | P05 authority resolved; P05A.3 integrated and pushed (see §2) |
| 2026-09-01 22:30 | Handoff created; P05 closeout docs in progress |
| 2026-09-01 22:45 | P05 closeout committed+pushed. CF-09 re-verified at seal (Unity consumer = TS artifact = `9c3df11c…`). Owner profile baseline byte-copy taken: `~/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json` → `/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/` (sha256 `d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b`, chmod 400). Real economic state: cash $74,470; 3 active productions (prod-0004 t5, prod-0005 t6, prod-0008 t8); 0 released films; overhead ≈$25.5k/wk. No stray processes; Owner caffeinate left running deliberately. |
| 2026-09-01 23:00 | Five-lane final-code recon workflow + research lanes A/C/D running. P06 launch commands mapped: `npm run build:studio` → `node dist/studio/studio.mjs --unity-project <unity>`; floors: `npm test`, `typecheck`, `typecheck:bridge`, `test:bridge`, `verify:bridge-contract-consumer`. Decision: P06 implementation worktrees will live under durable `/Users/bruce/` paths (the P05 launcher itself warns `/private/tmp` dies on reboot). |
| 2026-09-02 (waves W3-W5) | Unity: **W3** exact-ID Post registry + pure board contracts (`8cc7485`), **W4** pure world-cue derivation + **W5** the ONE ReleaseDecisionState (`63cb828`), each with full EditMode law suites — EditMode floor 699→722. A truncated unauthored StudioReleaseContracts.cs fragment found in the worktree was deleted and rewritten complete (provenance unknown; W5 authored properly). Unity WIP tip `63cb828` pushed. Remaining Unity: W4/W5 MonoBehaviour presenters + workspace route + LSCL rail — plus the W8 shared-host route-enum refactor (lead integration). ui-project floor repair (187 hold-law fails): 2 of 4 lanes landed, 2 running. | | 2026-09-02 (core green) | **THE CORE FLOOR IS GREEN: 2232/2232** (tip `8e50a9a`), contract checks verified, all three typechecks 0. Remaining floors in flight: ui project (187 fails → 4-lane repair fan-out running), Unity EditMode (18 sample-envelope fails → delegated lane iterating to 699/699). W3 authoring begins (registry+presenter+inspector C#). |
| 2026-09-02 (mint) | **W2 contract minted** (`f946b44`, pushed): see §13–18 row. Regression state: contract family green (96/96-ish incl. generator 31/31, consumer-lock), five central bridge suites 67/67, checkpoint family 65/65 (delegated lane), P05A.1/P05A.3 Owner-fixture journeys 22/22 with pins re-anchored to RAW fixture bytes, three parallel repair lanes (d17/econ-recap/saves-misc) all green with zero timing-value changes. Roster-wall interchange bump to V16 in flight (delegated). Full core floor pass 3 running. |
| 2026-09-02 05:45 | **W1 lesson (preserved evidence):** the first full-floor run hung for 5h — `tests/c2a-m2-set-binding.test.ts` had two unbounded `while(!released) tick()` loops that spin forever under the new hold law (vitest's async timeout cannot interrupt a synchronous loop). Fixed with a bounded `tickCommittingReady` drive (commits every ready picture before each advance; throws after 50 weeks instead of hanging). Known behavioral-fallout files under repair by a bounded lane: film-chronicle, film-package-truthfulness, first-film-journey, p04a2-writer-credit-law, facility-move-demolish, construction-core. Full inventory pending one clean floor run. |
| 2026-09-01 23:59 | Recon complete (5 lanes; lead re-verified `operations.ts` arms + `tick.ts` collector first-hand — the legacy arm DOES decrement blindly, r1 annex right, one recon lane corrected). r2-FINAL gate/recon/charter + research delta + §21 audit written, committed, pushed on `codex/p06a-final-refresh-01` (tip after audit commit). Release-authority design FROZEN (recon §6): V16 `releaseAuthority` root; `commitPictureToRelease` action+intent; both-arm gate + admission witness; decision tier 4 `release-review`; `automaticWeekRollEligible`; `release-committed` operationalState; projection 13→14 with `0474ceaf…` appended as prior. Fresh hostile document review running; FF to campaign after disposition, then §12 WIP branches → W1. |
