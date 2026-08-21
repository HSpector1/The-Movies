# Unity Production Convergence 80H - Promotion Register

This file is the authoritative answer to: **What is currently the best version
of Project: Studio, and is it ready for promotion?** Preserve every Golden tag.
Do not infer a compatible TypeScript/Unity pair from branch names alone.

## CURRENT BEST PROJECT: STUDIO - GOLDEN M3

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `e9c6f06b717a6a106281b189a61072e35770155f` | `golden/unity-convergence-m3` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | `golden/unity-convergence-m3` |

Both annotated tags are pushed and remote tag dereferences were verified at the
exact product SHAs. The Unity campaign branch still points at its M3 product;
the TypeScript campaign branch has pushed continuity descendants and now carries
an uncommitted Phase B candidate, so its moving branch tip is not the M3 product
authority. This is one schema-pinned compatible pair: protocol `3`, projection
`4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Never build, recover, or promote only one side.

### Current Golden tags

- M3 TypeScript: `golden/unity-convergence-m3` ->
  `e9c6f06b717a6a106281b189a61072e35770155f`.
- M3 Unity: `golden/unity-convergence-m3` ->
  `40465d48c191c9dcdda2c6b32c17c9675f4908a4`.
- Preserved M2 TypeScript: `golden/unity-convergence-m2` ->
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- Preserved M2 Unity: `golden/unity-convergence-m2` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Preserved M1 TypeScript: `golden/unity-convergence-m1` ->
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- Preserved M1 Unity: `golden/unity-convergence-m1` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

M3 supersedes M2 as CURRENT BEST. No prior tag was moved or deleted.

### Parent and base SHAs

| Component | Direct parent | Frozen campaign base |
| --- | --- | --- |
| TypeScript authority | `85429f9d18e2b6321e21557bdb068b1047b4c452` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

### Why M3 is better than M2

M3 preserves every M2 queue-law, identity, determinism, save, Movie #2, and
visual capability, then closes the genuine-command rejection experience across
the schema boundary:

- every genuine rejection carries a closed TypeScript-owned category, blocker,
  required-nullable holder, and remedy;
- all 12 codes map centrally while capacity-full commission, auditions, and
  greenlight remain accepted queue receipts;
- Unity consumes the generated DTO, rejects malformed guidance, and binds a
  notice to exact session/revision/week/digest authority tokens;
- same-state polls no longer erase the explanation after one second;
- accepted command/save/load and session changes clear the notice;
- raw engine diagnostics stay in logs/evidence while the HUD shows WHAT
  HAPPENED, optional CURRENT HOLDER, and WHAT NEXT;
- a race-free native proof demonstrates retention across a later successful
  poll without mutating TypeScript truth.

No gameplay formula, GameState field, V14 save shape, RNG stream, identity,
economy rule, construction rule, or simulation authority moved into C#.

### Launch command

Create detached worktrees from both immutable M3 tags so active campaign work
cannot silently change the product being launched:

```bash
git -C '/Users/bruce/The Movies - Unity Production Convergence 80H' \
  worktree add --detach '/tmp/project-studio-golden-m3-ts' \
  golden/unity-convergence-m3
git -C '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  worktree add --detach '/tmp/project-studio-golden-m3-unity' \
  golden/unity-convergence-m3
```

Terminal 1:

```bash
cd '/tmp/project-studio-golden-m3-ts'
npm ci
npm run bridge
```

Build in the detached Unity M3 worktree:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/tmp/project-studio-golden-m3-unity' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-m3-native-build.log \
  -quit
```

Terminal 2:

```bash
cd '/tmp/project-studio-golden-m3-unity'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

### Validation summary

- TypeScript full suite: 327 files, 4,452 passed, 5 skipped, 0 failed.
- Bridge/schema: 26/26; both typechecks; production build; generated drift;
  Movie #2/determinism proof; browser dependency, repository hygiene, and 3D
  provenance gates all passed.
- Unity EditMode: 24/24.
- Native build: 136,938,870 bytes.
- Fresh native Movie #2: Week 22/revision 23; exact title/project/production;
  final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/load: exact saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Structured stale proof: category `state-stale`, null holder, non-empty
  blocker/remedy, unchanged revision/digest, retained from poll 11 to poll 12.
- Reconnect: separate native process recovered Week 22/revision 23/final digest.
- Performance: 119.3803 FPS proof and 118.9993 FPS reconnect on Apple M3 Max.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained screenshot
  SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Independent red-team: no open P0 or P1 finding.

### Movie #2 status

Playable end to end from real TypeScript intents: screenplay, review, auditions,
evidence, package/greenlight, pre-production, director call, scenery load-in,
shooting, save/load, post, release, stale rejection, and reconnect. Exact route:
`The Reluctant Cornerstone`, `script-0001`, `prod-0013`.

### Visual status

M3 improves the retained error presentation only. World art, camera, people,
materials, animation, and activity remain visually equivalent to M2 and below
ADR 0006. The campus still reads too much like a distant diorama; M3 does not
claim the required inhabitable, human-scale filmmaking uplift.

### Known defects

- P1: replay/session/save state remains process-memory-only.
- P1: launch and shutdown still require two manually managed processes.
- P1: visual recognizability/two-scale camera/Hero Stage 7 target remains unmet.
- P2: unexpected server exceptions retain the unstructured HTTP 500 path.
- P2: reason/category pairing is exhaustive in producer tests, not encoded as a
  cross-field JSON Schema relation.
- P2: some Unity rejection-adapter mismatch branches lack isolated direct tests.
- P2: cross-repository Unity-copy drift is locally gated, not automatic CI.

### Promotion decision

M3 is the best known playable overall product and is recoverable as an exact
pair, so it is a Golden checkpoint. It is **not** promoted to canonical: Phase B
runtime durability is absent, TypeScript `main` remains historically diverged,
and the Unity visual product still misses the binding recognizability gate.
Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

## PUSHED PHASE B DURABILITY CHECKPOINT - NON-GOLDEN

The TypeScript durability product is committed and pushed at
`e6fc2047f372e7642c3c2fcee1d3915bb4064620` on parent
`85d865cdd4f38ab4df32e24393e130ca094f6b7f`. The campaign branch may have the
single continuity-only descendant containing this seal. Unity remains clean at
Golden M3 `40465d48c191c9dcdda2c6b32c17c9675f4908a4`. Protocol `3`, projection
`4`, schema identity, generated DTOs, gameplay, and visual output are unchanged.

The pushed checkpoint adds a strict operational checkpoint outside `GameState`/V14,
serialized commit-before-response dispatch, exact response replay, private
atomic storage and process-incarnation locking, controlled bounded-history
rollover, graceful shutdown, and a real command/save/command/load `SIGKILL`
restart proof. Full validation passes: 332 files/4,488 tests/5 skipped;
62/62 bridge tests; both typechecks; build; Movie #2/determinism proof; and all
browser-dependency, repository-hygiene, and 3D provenance gates. Independent
audits report no P0/P1 in the persistence core. Product-SHA GitHub Actions run
`32430904875` passed the same complete gate at
`e6fc2047f372e7642c3c2fcee1d3915bb4064620` in 10m25s.

This checkpoint does **not** supersede Golden M3. The ordinary launch remains
memory-only, localhost accepts unauthorized Host/Origin/`text/plain` requests,
there is no launcher/runtime-instance/Unity engine-kill recovery proof, and no
new native or visual evidence exists. A Golden pair cannot advance on a TS-only
internal primitive whose default product path is not yet durable. CURRENT BEST
therefore remains the exact M3 tagged pair above, and promotion status remains
**GOLDEN — CONTINUE CAMPAIGN**.

## PRIOR GOLDEN M2 REGISTER - HISTORICAL

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `7d76951f6ad641e8940b97b03806b87638ed8ad8` | `golden/unity-convergence-m2` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `golden/unity-convergence-m2` |

Both product SHAs are pushed. They are one schema-pinned compatible pair:
protocol `2`, projection `4`, schema
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.
Do not promote, build, or recover only one side of the pair.

The TypeScript campaign branch may have a continuity-document-only descendant
of the product SHA after this register, the ledger, and the handoff are sealed.
That does not change the product candidate. The M2 tags identify the exact code
pair to build and recover.

## A4 PRE-COMMIT CANDIDATE - HISTORICAL

A4 is a materially stronger compatible working state, but it is still dirty in
both repositories and therefore is not CURRENT BEST, is not Golden, and has no
tag. Golden M2 above remains the sole promotable/recovery answer until A4 is
committed, pushed, and sealed.

| Component | Branch | Current pushed HEAD / A4 parent | Candidate state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `85429f9d18e2b6321e21557bdb068b1047b4c452` | Validated dirty A4 protocol/schema/runtime/generated-golden/tests/README changes |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | Validated dirty generated DTO, strict parser, retention, proof HUD, and EditMode changes |

The A4 candidate contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Every genuine rejection contains a required closed TypeScript-owned
`rejection` object with category, required non-empty blocker, required-nullable
current holder, and required non-empty remedy. All 12 reason codes map in
TypeScript. Capacity queue admission remains accepted and contains no rejection.

Unity strictly parses the generated DTO, binds retained guidance to exact
session/revision/week/digest authority tokens, retains it only across unchanged
polls, and clears it on acceptance or session change. Raw diagnostic messages
remain log-only. The proof HUD renders WHAT HAPPENED, optional CURRENT HOLDER,
and WHAT NEXT.

Validated pre-commit evidence:

- TypeScript: 327 files, 4,452 passed, 5 skipped; 26/26 bridge/schema tests;
  both typechecks, production build, generated drift, Movie #2 proof, repository
  hygiene, adopted-3D guard, and zero-vulnerability browser audit pass.
- Unity: 24/24 EditMode tests; native build 136,938,870 bytes; fresh Movie #2
  release at Week 22/revision 23; exact save/load; retained `state-stale`
  guidance across an unchanged poll; and separate-process reconnect all pass.
- Deterministic final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/load digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Native samples: 119.3803 FPS fresh proof and 118.9993 FPS reconnect.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained-guidance
  screenshot SHA-256
  `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Independent review reports no open P0 or P1 finding.

Known A4 residuals are an unstructured unexpected-fatal HTTP 500 path,
schema-external reason/category pairing enforcement, several Unity adapter
negative branches without isolated direct tests, and a 256-entry replay cache
that remains memory-only. Visuals are unchanged and remain below ADR 0006; the
candidate still reads too much like a distant proof diorama.

Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**. Do not create
or push an A4 Golden tag from dirty worktrees. After coherent commits exist in
both repositories, inspect the exact compatible pair, verify remote SHAs, and
make the Golden supersession decision from the sealed evidence.

## LEGACY M2 REGISTER DETAILS - HISTORICAL

### Parent and base SHAs

| Component | Direct parent of product SHA | Campaign base / frozen adoption authority |
| --- | --- | --- |
| TypeScript authority | `7218368cddc46eaeb0fb99691489d457a89112d6` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `7fb693c78da06cca1c8e688340241e1c9fa0b874` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

### Canonical / default branches at M2

| Repository | Remote default branch | Last audited SHA | Campaign relationship |
| --- | --- | --- | --- |
| TypeScript | `main` | `5914c84e453461240540184e79b2bd7eafeb647f` | Diverged; the campaign is a large semantic line that requires deliberate reconciliation |
| Unity | `unity-typescript-bridge-spike` | `626c2d3a25f21ebdbb2603939378368af925f18c` | Linear ancestor of the campaign |

The Unity repository's local archival `main` at
`17572ceb376fed048f110f34bbaac2fa7a8095ce` is not the remote default or a
production-promotion target.

### M2 Golden tags - historical

- `golden/unity-convergence-m2` in `HSpector1/The-Movies` identifies
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- `golden/unity-convergence-m2` in
  `HSpector1/project-studio-unity-visual-spike` identifies
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Preserved M1: `golden/unity-convergence-m1` in `HSpector1/The-Movies`
  identifies `cd2b15872ac5849fa16beec1775543758cb3139e`.
- Preserved M1: `golden/unity-convergence-m1` in
  `HSpector1/project-studio-unity-visual-spike` identifies
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

M2 supersedes M1 as CURRENT BEST. M1 remains an immutable recovery point and
its tags must never be moved or deleted. The frozen adoption authorities remain
additional recovery authorities but were not retroactively relabeled as
campaign Goldens.

### Why M2 superseded M1

M2 contains the complete M1 A1 generated-contract foundation and A2 atomic
projection bundle, then closes the A3 queue-law parity defects across the bridge
and retained TypeScript client:

- commission, exact-project audition, and exact-project greenlight intents
  remain reachable during Development & Casting contention and enter the
  existing TypeScript-authoritative queue rather than being falsely withheld;
- ambient concurrent front-door choices no longer hijack the exact guided
  picture journey;
- exact queued concept/project duplicate guards and read-model suppression
  contain rerenders, panel reopenings, rapid clicks, and stale retained-client
  affordances;
- accepted bridge and retained-client receipts distinguish queued work from an
  immediately committed screenplay, camera test, or production and claim no
  identity, cash, talent, or room the engine has not committed;
- capacity-only casting completion can hand off to Package so the player can
  queue greenlight, while writer, staffing, founding, and duplicate blockers
  continue to fail closed;
- queued audition and greenlight guidance preserves exact screenplay identity
  through waiting, save/load, dequeue, and continuation.

This is a material functional and architectural improvement, not a visual one.
Unity stays at the same exact SHA used by M1 because A3 changes TypeScript
authority, bridge intent availability, and the retained TypeScript client
without changing the generated wire schema or Unity source. TypeScript remains
the sole simulation authority. M2 changes no gameplay formula, save identity,
RNG stream, or Three.js authority boundary.

The Unity visual state is unchanged from M1 and remains below the
visual-recognizability and two-scale-camera ruling recorded in ADR 0006. M2
supersedes M1 functionally despite not claiming visual uplift.

### M2 launch command - historical

Terminal 1:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
npm run bridge
```

Terminal 2:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

If the ignored native app is absent, rebuild it with:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a3-native-build-seal.log \
  -quit
```

For byte-exact recovery, use clean worktrees at
`golden/unity-convergence-m2` in both repositories. A continuity-only branch
descendant is product-equivalent but is not a replacement for the exact Golden
pair recorded above.

### M2 validation summary

| Gate | Golden M2 result |
| --- | --- |
| TypeScript full suite | 327 files passed; 4,450 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| TypeScript production build | Passed; inherited Vite chunk-size warnings only |
| Bridge typecheck | Passed |
| Bridge/schema tests | 24/24 passed, including exact Movie #2, save/reconnect, stale/duplicate, and queue-contention coverage |
| Generated contract | Passed deterministic generation and cross-repository drift verification; protocol `2`, projection `4` |
| Unity EditMode | 15/15 passed |
| Unity PlayMode | No dedicated suite exists; native automation is the runtime gate |
| Native macOS build | Passed: `Build Finished, Result: Success` |
| Fresh native Movie #2 | Passed through release at Week 22, revision 23 |
| Native save/load | Passed; saved/restored digest identical |
| Native reconnect | Passed in a separate process at the same session, revision, week, and digest |
| Stale command | Rejected with `STALE_REVISION`; truth unchanged |
| Duplicate command / duplicate work | Deterministic command replay and exact queued-work guards passed |
| Determinism | Export/import/export byte-identical; headless and bridge save bytes/digests identical |
| Runtime console | No proof failure, error, exception, or protocol mismatch |
| Whole-diff red team | No P0 or P1 finding remains |
| Product-SHA remote CI | GitHub Actions run `32422095175` passed every expanded gate in 9m36s |

Final native evidence:

- build log: `/tmp/studio-a3-native-build-seal.log`;
- Movie #2 proof log: `/tmp/studio-a3-native-proof-final-seal.log`;
- reconnect proof log: `/tmp/studio-a3-native-reconnect-final-seal.log`;
- structured proof:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-client-proof.json`;
- structured reconnect proof:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-reconnect-proof.json`.

### M2 Movie #2 status

- Status: fully playable end to end through the native Unity proof client.
- Title: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale intent: rejected with `STALE_REVISION` without changing truth.
- Reconnect: a separate native process recovered Week 22, revision 23, the
  exact Movie #2 identity, and the final digest.

The proof covers screenplay, auditions, editable casting, greenlight,
pre-production, blockers, shooting, post, save/load, release, and reconnect.
It also covers the A3 contention path that queues exact authoritative work
instead of hiding or duplicating it.

### M2 visual status

A3 intentionally changes no Unity art, camera, UI composition, animation, or
world layout. The native A3 captures prove that the M1 presentation is
preserved while the queue-law behavior changes underneath it. Campus scale is
readable, but the proof HUD remains intrusive; people and filmmaking activity
remain weak; and Hero Soundstage 7, materials, era readability, and camera
inspection remain below ADR 0006's commercial floor.

Current local, Git-ignored evidence:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/01-whole-lot.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/02-construction.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/03-screenplay-ready.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/04-audition-results-ready.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/05-auditions-reviewed-roles-greenlight.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/06-greenlit.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/07-production-blocker.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/08-shooting.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/09-post-production.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/10-save-load-restored.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/11-movie-2-released.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/12-reconnected.png`

Latest native Movie #2 sample: 119.18 FPS average, 15,394-byte snapshot,
18.52 ms TypeScript serialization, 3.82 ms strict client parse, 0.33 ms apply,
and 33.25 ms command round trip. The separate reconnect application recovered
the final snapshot with 3.96 ms parse and 4.44 ms apply. These are evidence
samples, not yet a formal Phase L percentile budget.

### M2 known defects

- Phase A3 establishes truthful queue-law parity, but the more detailed
  screenplay/development, casting, package/greenlight, and structured
  holder/remedy projections remain future production work.
- Phase B runtime lifecycle is still two manually managed processes with a
  fixed default port and memory-only session/save/replay state. Engine restart
  loses the session.
- The proof HUD and visual client remain pre-production; M2 provides no visual
  uplift and remains below ADR 0006's visual floor.
- TypeScript CI cannot inspect the separate Unity repository unless it is
  checked out and supplied to the cross-repository drift command.
- The response replay cache remains memory-only and evicts after 256 identities.
- No dedicated Unity PlayMode suite exists.
- The browser npm dependency audit is clean, but the development bridge still
  executes through a dev graph with five advisories (3 moderate, 1 high,
  1 critical). Phase B must package and audit an explicit runtime graph.
- The loopback bridge has no per-launch capability, Host/Origin policy, exact
  JSON content-type gate, or request/header timeouts. These are Phase B
  production blockers, not reasons to expose a public bind.
- Dependabot configuration on the campaign branch remains inactive until it
  reaches the repository default branch.
- Vite chunk warnings and first-import glTFast noise remain under documented
  non-destructive handling rules.

No known P0 regression, P1 regression, or TypeScript-authority violation
remains at the M2 seal.

### M2 promotion decision

**GOLDEN — CONTINUE CAMPAIGN**

M2 is the best-known compatible product pair and supersedes M1 functionally.
It is not being promoted to either canonical/default branch during this
checkpoint for three independent technical reasons:

- Phase B has not yet delivered a production runtime lifecycle, disk-backed
  restart recovery, packaged dependency boundary, or completed localhost
  hardening;
- TypeScript `main` and the campaign line still require deliberate
  reconciliation of a large semantic campaign mega-diff rather than an
  uncontrolled wholesale merge;
- the unchanged Unity client remains below ADR 0006's accepted visual floor and
  cannot yet serve as the obvious commercial-quality canonical product line.

This is a technical-PM rejection of premature canonical promotion, not a
request for Owner arbitration. Continue from the exact M2 pair. Do not mistake
functional supersession of M1 for completion of the runtime or visual product.

### M2 promotion package status

Not prepared. M2 is not `READY FOR OWNER MERGE REVIEW` and has not been promoted
to canonical. The primary rollback/recovery point is the compatible M2 pair
named at the top and preserved by `golden/unity-convergence-m2` in both
repositories. The previous M1 pair remains available at
`golden/unity-convergence-m1` in both repositories and must not be moved or
deleted.
