# Unity Production Convergence 80H - Current Handoff

START HERE. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, then the campaign
ledger, this handoff, and the promotion register. The TypeScript/Unity engine
decision is settled. Do not restart planning from scratch.

## GOLDEN M3 CURRENT STATE - AUTHORITATIVE

Timestamp: 2026-08-21 00:55 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden M3 product / pushed remote | `e9c6f06b717a6a106281b189a61072e35770155f` |
| TypeScript parent | `85429f9d18e2b6321e21557bdb068b1047b4c452` |
| TypeScript working tree | Clean immediately after product push/tag; this continuity-only update is the sole expected tracked follow-up |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity Golden M3 HEAD / pushed remote | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Unity parent | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity working tree | Clean; only ignored `Builds/`, `Evidence/`, `Library/`, and `Logs/` remain local |
| Golden tags | `golden/unity-convergence-m3` pushed in each repository and peeled to the exact product pair; M1/M2 preserved |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; not promoted to canonical |

The exact compatible live contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Golden M3 supersedes M2 as CURRENT BEST because it preserves M2's queue-law and
Movie #2 integrity while adding a generated, strict, poll-durable player
explanation for every genuine rejection. TypeScript remains sole simulation
authority.

### Current campaign status

- Current phase: Phase A contract durability moving into Phase B local runtime.
- Completed: setup/baseline, A1 generated contract, A2 atomic named projection
  foundation, A3 queue-law parity, A4 structured rejection guidance, donor
  security/governance harvest.
- Partial: command identity/revision/deduplication/rejection are robust within a
  process, but replay/save/session durability does not survive engine restart.
- Untouched: production launcher/lifecycle, authenticated local transport,
  durable disk save, production client layering. Later visual/player phases
  remain inherited partial work.
- Current acceptance gate: exact response replay across save/load and an actual
  TypeScript process restart without changing V14 or `GameState`.

### Just completed

- TS commit `e9c6f06b717a6a106281b189a61072e35770155f` publishes protocol 3 and one
  closed `rejection` object with category, blocker, required-nullable holder, and
  remedy; all 12 codes map centrally; capacity queues remain accepted.
- Unity commit `40465d48c191c9dcdda2c6b32c17c9675f4908a4` consumes the generated DTO,
  validates exact authority tokens, retains the notice across same-state polls,
  clears it on acceptance/session change, and renders WHAT HAPPENED / optional
  CURRENT HOLDER / WHAT NEXT. Raw diagnostics are log/proof-only.
- Generated copies are byte-identical. Both commits/branches/tags are pushed,
  remote-verified, and clean. No asset, simulation, save, RNG, or identity
  authority changed.

### Working build and evidence

Launch:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run bridge

cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

- Runtime: localhost `127.0.0.1:4317`; still two manual processes with
  process-memory-only session/save/replay.
- Playable flow: construction and exact Movie #2 from screenplay through
  release, including save/load, stale rejection, and reconnect.
- Movie #2: `The Reluctant Cornerstone`, `script-0001`, `prod-0013`, Week
  22/revision 23, final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Visual state: rejection notice improved; world/camera/people/materials/activity
  unchanged and still below ADR 0006's inhabitable two-scale target.
- TypeScript: 327 files/4,452 pass/5 skip; bridge 26/26; both typechecks, build,
  proof, generator, browser-dependency, hygiene, and 3D audits passed.
- Unity: EditMode 24/24; native build 136,938,870 bytes; save/load digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  stale notice retained poll 11 to 12; proof/reconnect 119.3803/118.9993 FPS.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained screenshot
  SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Latest logs: `/tmp/studio-a4-rejection-p1-seal-editmode.xml`,
  `/tmp/studio-a4-rejection-p1-native-build-final.log`,
  `/tmp/studio-a4-rejection-p1-native-proof-final.log`, and
  `/tmp/studio-a4-rejection-p1-native-reconnect-final.log`.

### Known blockers

- P1: replay/session/current-state/explicit-save checkpoint is memory-only.
- P1: no one-command supervisor, durable disk save, restart-aware Unity
  handshake, per-launch capability, or coordinated shutdown.
- P1: visual recognizability, two-scale camera, Hero Stage 7, people/animation,
  and visible filmmaking remain below the product target.
- P2: unexpected HTTP 500 remains unstructured; cross-repository DTO copy CI is
  local; several Unity mismatch branches lack isolated tests.
- Do not retry widening V14, persisting bridge metadata in `GameState`, silently
  evicting command IDs in one logical session, or letting async checkpoint
  writes reorder authoritative mutations.

### Next exact action

Implement a separate strict `BridgeRuntimeCheckpointV1` containing untouched
canonical current V14 JSON, last explicit saved V14 JSON, logical session ID,
state revision, and a bounded canonical request/full-response journal. Serialize
all command/save/load dispatch through one persistence queue, atomically commit
the checkpoint before sending a first-seen response, and prove raw response
replay across save/load and a real engine process restart.

### Next 3-5 actions

1. Add a non-persisted `runtimeInstanceId`, harden the HTTP server, and make
   Unity perform health/session/snapshot handshake plus restart-aware reconnect.
2. Add per-launch capability, strict Host/Origin/content-type/timeouts, and an
   emitted dependency-audited bridge runtime.
3. Add the one-command developer supervisor with random port, safe logs, owned
   child shutdown, and stale-lock cleanup.
4. Prove native engine kill/restart during Movie #2, then active-production and
   construction save/recovery.
5. Resume the isolated `location-v1` camera experiment and Hero Stage 7 slice.

### Do not touch

- Frozen authorities, M1/M2/M3 tags, V14 save/game truth, IDs, RNG streams,
  Three.js regression oracle, and TypeScript-only simulation authority.
- Do not merge to main/C2, rebase, force-push, rewrite history, delete tags or
  historical branches, buy assets, use protected assets, or generate images.
- Do not put replay metadata into `GameState`, widen V14, hand-edit generated
  DTOs, infer gameplay remedies in Unity, or expose filesystem/command execution
  over the bridge.
- Local fidelity references, screenshots, builds, evidence JSON, logs, caches,
  `.tmp/`, `dist/`, and `node_modules/` remain excluded from Git.

### Decisions made this session

- M3 is CURRENT BEST and supersedes M2; status remains
  `GOLDEN — CONTINUE CAMPAIGN`, not canonical promotion.
- Protocol is 3 because rejection shape is breaking; projection stays 4 because
  snapshot facts did not change.
- TypeScript owns all rejection facts. Raw diagnostics are not player copy.
- The replay checkpoint must be operational state separate from closed V14 and
  `GameState`; this preserves deterministic gameplay/save parity.
- A logical session must survive process restart for exact replay. A separate
  non-persisted runtime instance identity will later signal process replacement.

### Uncommitted / generated material

- Unity product tree is clean at M3. Ignored current native build and A4 evidence
  remain local and deliberately excluded.
- TypeScript product tree was clean at M3; this ledger/handoff/promotion update
  is a continuity-only descendant and must be committed/pushed separately.
- Generated C# is committed in both repositories and byte-identical. Do not
  regenerate unless the canonical TypeScript schema changes.
- The local visual-fidelity PDF remains outside Git at
  `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
  SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.

### Recovery

1. Read the architecture decision, ledger, this top section, and promotion
   register.
2. Verify both M3 tags peel to the product SHAs above and remote branch refs
   agree. The TypeScript branch may have a docs-only descendant containing this
   section; its product tag remains the recovery authority.
3. Run `npm run test:bridge`, both typechecks, and the cross-repository generated
   check before starting the replay checkpoint.
4. Launch the commands above and inspect the accepted A4 evidence. Do not repeat
   A1-A4 research or ask the Owner to reconstruct the campaign.
5. Preserve M1/M2/M3 tags, frozen authorities, Three.js oracle, V14 bytes, IDs,
   RNG streams, and all ignored evidence/build material.

## A4 PRE-COMMIT STATE - HISTORICAL

This section was the authoritative pre-commit handoff at 2026-08-21 00:48 CEST
(UTC+02:00). It is preserved only as checkpoint history. The Golden M3 section
above supersedes it completely.

### Current exact state

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript HEAD / pushed branch | `85429f9d18e2b6321e21557bdb068b1047b4c452`; local, upstream, and remote agree before the A4 commit |
| TypeScript working tree | Dirty only with the validated A4 contract/runtime/schema/generated/tests/README unit and the three campaign continuity documents |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / pushed branch | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`; local, upstream, and remote agree before the A4 commit |
| Unity working tree | Dirty only with the validated generated DTO, strict parser, rejection retention/client/HUD/proof, tests, and their two new `.meta` files |
| Current Golden | M2: TypeScript `7d76951f6ad641e8940b97b03806b87638ed8ad8` plus Unity `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Golden tags | Immutable/pushed `golden/unity-convergence-m1` and `golden/unity-convergence-m2` in both repositories |
| A4 pushed | No. A4 has no commit or tag yet. Do not call it Golden from dirty worktrees. |

The A4 compatible contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
The TypeScript and Unity generated C# files are byte-identical at SHA-256
`791853b02e1cc0b4fa2e2256f7b984dac71d2689bd7d0205f5d76353a49ccf09`.

### Campaign status

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A4 structured rejection guidance is implementation-complete,
  independently audited, and validated pre-commit.
- Completed: campaign setup/baseline; A1 generated schema/DTO pipeline; A2
  atomic named projection bundle; A3 queue-law parity; PR #5 donor/security
  harvest.
- Partially completed: command IDs, expected revision, stale rejection,
  deduplication, explicit codes, structured player guidance, and bounded
  in-process replay. Replay persistence and fatal-path structure remain.
- Untouched as campaign implementations: Phase B durable product runtime and
  Phase C production-client layering. D through N retain inherited partial
  capabilities only.
- Current acceptance gate: commit and push the exact validated protocol-3 pair,
  verify clean remote SHAs, then decide Golden M3 without weakening the visual
  or runtime requirements.

### What was just done

A4 replaces code-only bridge failures with one closed TypeScript-owned
`rejection` object containing `category`, required non-empty `blocker`, required
nullable `currentHolder`, and required non-empty `remedy`. All 12 reason codes
map centrally. Capacity-full commission, auditions, and greenlight remain
accepted queue admissions and never receive this object.

Unity consumes only the generated DTO. It strictly validates the wire, binds a
notice to the exact session/revision/week/digest, retains it through unchanged
polls, clears it on an accepted command/save/load or session epoch change, and
never invents a holder or remedy. Raw root `message` stays diagnostic-only. The
HUD renders `WHAT HAPPENED`, optional `CURRENT HOLDER`, and `WHAT NEXT`.

TypeScript files changed:

- `BRIDGE-README.md`
- `bridge/protocol.ts`
- `bridge/schema/bridge-schema.ts`
- `bridge/schema/project-studio-bridge.schema.json`
- `bridge/session.ts`
- `generated/unity/StudioBridgeDtos.Generated.cs`
- `tests/bridge-schema.test.ts`
- `tests/bridge.test.ts`
- the three campaign continuity documents

Unity files changed:

- `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs`
- `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- new `Assets/Studio/Runtime/Infrastructure/StudioRejectionRetention.cs` and `.meta`
- `Assets/Studio/Runtime/Presentation/StudioBridgeProofRunner.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgeProtocolTests.cs`
- new `Assets/Studio/Tests/EditMode/StudioRejectionRetentionTests.cs` and `.meta`

Why: the player must see a durable, truthful explanation for a rejected action
after the next one-second poll. Unity may present the answer but may not derive
legality, holders, or remedies. Protocol moved from `2` to `3` because the
closed rejected-response envelope gained a required member; projection stayed
at `4` because the snapshot bundle did not change.

Relevant committed parents are TypeScript `85429f9d18e2b6321e21557bdb068b1047b4c452`
and Unity `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`. A4 commit SHAs do not exist
yet. Frozen authorities remain `f6606ac9db67dc70b12a7d247d74206571d12d2c`
and `d970b81c2b17383ee71c3c66a5622ecc140473b3`.

### What is working right now

Start the protocol-3 TypeScript authority:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run bridge
```

Open Unity:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build and launch the current native client:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a4-native-build.log \
  -quit

cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

- Bridge/runtime: localhost `127.0.0.1:4317`, two manually managed processes,
  in-memory session/save/replay. A4 does not claim Phase B lifecycle completion.
- Playable flow: construction, exact Movie #2 screenplay, auditions, evidence,
  package/greenlight, pre-production, blockers, load-in, shooting, save/load,
  post, release, stale rejection, and reconnect all work through TypeScript
  intents.
- Movie #2: `The Reluctant Cornerstone`, `script-0001`, `prod-0013`, released
  Week 22/revision 23 at digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Visual state: unchanged from M2. The retained rejection frame is clearer, but
  the campus still reads too much like a distant diorama and remains below ADR
  0006's inhabitable, two-scale, filmmaking-first acceptance target.

### Validation state

| Gate | Latest exact result |
| --- | --- |
| TypeScript full tests | 327 files; 4,452 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| TypeScript production build | Passed; inherited chunk warnings only |
| Bridge/schema tests | 26/26 passed |
| Generated drift | Passed across schema, TS C# golden, and Unity generated copy |
| TypeScript Movie #2/determinism proof | Passed; final digest `429b88d5...3ed13`; export/import/headless parity true |
| Browser dependency audit | 0 browser-runtime vulnerabilities |
| Repository hygiene / adopted 3D assets | Both passed |
| Unity EditMode | 24/24; `/tmp/studio-a4-rejection-p1-seal-editmode.xml` |
| Native macOS build | Passed; 136,938,870 bytes; `/tmp/studio-a4-rejection-p1-native-build-final.log` |
| Native runtime playthrough | Fresh Movie #2 complete at Week 22/revision 23 |
| Native save/load | Saved/restored digest `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Stale/retention proof | `state-stale`, non-empty blocker/remedy, null holder, unchanged revision 18/digest, later poll 11 to 12 |
| Native reconnect | Same session state at Week 22/revision 23/final digest |
| Performance | 119.3803 FPS proof; 118.9993 FPS reconnect on Apple M3 Max |
| Evidence | Ignored `Evidence/A4/Rejection-Guidance/`; 13 PNGs, 2 JSON reports |
| Visual evidence | `10b-stale-rejection-retained.png`, SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5` |
| Independent audit | No open P0 or P1 finding |

### Known problems and blockers

1. **Replay journal is process-memory-only - P1 resilience, pre-existing.**
   Reproduce by submitting a command, restarting `npm run bridge`, and trying
   the same identity: the 256-entry cache and session vanish. Save/load within
   one process passes. Do not move this data into `GameState` or V14 gameplay
   history; implement a bounded save-associated bridge journal.
2. **Runtime lifecycle is manual - P1 productization, pre-existing.**
   Reproduce by launching the native app without separately starting the bridge.
   No launcher-owned process, random capability token, durable disk save, or
   graceful coordinated shutdown exists. Do not expose a configurable network
   bind or arbitrary filesystem/command API.
3. **Unexpected HTTP 500 remains unstructured - P2 resilience, pre-existing.**
   The bounded command/control rejection contract is structured, but an
   unexpected server exception still returns the existing fatal response. Do
   not disguise an internal exception as a gameplay holder/remedy.
4. **Reason/category pairing is producer-tested, not schema-relational - P2.**
   Every mapping is exhaustively tested, but JSON Schema does not encode the
   cross-field pairing. Do not duplicate the mapping as gameplay logic in C#.
5. **Some Unity adapter negative branches lack direct tests - P2 test gap.**
   Wrong session/command/revision/week/digest branches are explicit; parser,
   retention, and native positive rejection coverage pass.
6. **Visual target is not met - P1 product quality, pre-existing.**
   Reproduce from any A4 overview capture. People/roles, filmmaking activity,
   materials, camera proximity, and Hero Stage 7 remain below ADR 0006. Do not
   polish the old fixed-diorama premise or import protected reference assets.
7. **Cross-repository contract CI is not automatic - P2 tooling.**
   TS CI verifies its golden, while the external Unity-copy path is checked
   locally. Do not hand-edit generated DTOs.

### Next exact action

Replace `BridgeSession`'s 256-entry memory-only replay map with a bounded,
save-associated command identity journal, then prove exact duplicate response
replay across authoritative save/load and a TypeScript engine process restart.

### Next 3-5 actions after that

1. Implement the Phase B one-command developer launcher with engine startup,
   random port/capability token, health/schema/session handshake, logs, graceful
   shutdown, and stale-process cleanup.
2. Add atomic disk-backed V14 save persistence and recovery without exposing
   arbitrary filesystem access through HTTP.
3. Prove engine restart detection, Unity reconnect, save/load during active
   production and construction, malformed protocol, and temporary outage.
4. Start the isolated `location-v1` two-scale camera experiment after the
   runtime foundation is durable.
5. Use the resulting inspection mode to begin Hero Soundstage 7's professional
   filmmaking vertical slice.

### Do not touch

- Frozen TypeScript authority, Unity adoption authority, architecture decision,
  M1/M2 tags, current IDs, RNG streams, V14 game truth, and Three.js oracle.
- Do not merge to main/C2, rebase, force-push, move/delete Golden tags, rewrite
  history, delete historical branches, or mass-clean repositories.
- Do not move gameplay legality/formulas/saves into C#, infer rejection facts in
  Unity, manually edit generated DTOs, or turn capacity queues into rejection.
- Do not adopt protected The Movies/Lionhead assets, buy assets, generate images,
  or commit the local fidelity PDF/evidence/build/cache/log outputs.
- Keep the unstructured HTTP 500 and launcher/security work isolated from this
  already validated A4 unit until after its checkpoint is sealed.

### Decisions made this session

- Protocol `3`, projection `4`: required rejection envelope is breaking; snapshot
  projection is unchanged. Reversible only through another coordinated protocol
  revision. Evidence: schema/generator/Unity/native gates.
- TypeScript owns category/blocker/holder/remedy; Unity only validates, retains,
  and renders. This is the frozen authority law, not optional.
- `currentHolder` is required-nullable and remains null until an exact causal
  world holder exists. Never select the first member of a plural queue.
- Raw rejection `message` is diagnostic-only. Red-team evidence showed revision
  jargon was unsuitable as player copy; final screenshot renders only structured
  guidance. Reversible presentation detail, authority boundary remains fixed.
- Same-state polls retain a notice; accepted operations/session changes clear it;
  mismatched authority tokens cannot replace it. Reversible lifecycle policy,
  backed by EditMode and native post-poll proof.
- A4 is not Golden while dirty. M2 remains CURRENT BEST pending exact commits,
  remote verification, and deliberate tagging.

### Uncommitted and generated material

- TypeScript tracked A4 source plus these three continuity docs are intentionally
  uncommitted. No unrelated tracked file is present.
- Unity tracked A4 source and two new source/meta pairs are intentionally
  uncommitted. `Builds/`, `Evidence/`, `Library/`, and `Logs/` remain ignored.
- Ignored current evidence: `Evidence/A4/Rejection-Guidance/`, including proof
  JSON SHA-256 `814009e4c5b1a0c2942fbbcf61bdcf1c28f25fb804e5ba70e7d3b6d9b13396a1`,
  reconnect JSON SHA-256 `bf6d70addc525e9a23acc67bdccc16afde1a43fd8f9aa28aba09249878f1e9c7`,
  and retained screenshot SHA above.
- Current logs: `/tmp/studio-a4-rejection-p1-seal-editmode.log`, matching XML,
  `/tmp/studio-a4-rejection-p1-native-build-final.log`,
  `/tmp/studio-a4-rejection-p1-native-proof-final.log`, and
  `/tmp/studio-a4-rejection-p1-native-reconnect-final.log`.
- `.tmp/3d-asset-audit.json`, `dist/`, `node_modules/`, native build, screenshots,
  JSON evidence, logs, caches, and local PDF are deliberately excluded.
- Local PDF: `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`,
  1,087,211 bytes, SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.

### Recovery instructions

1. Read the architecture decision, ledger, this authoritative A4 section, and
   promotion register in that order.
2. Verify both recorded parent HEADs and dirty file lists with `git status`,
   `git rev-parse HEAD`, and the configured upstream refs. M2 tags must remain
   immutable/pushed.
3. Run the minimum smoke:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm run test:bridge
   npm run typecheck
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. If A4 is still uncommitted, do not restart implementation. Inspect the exact
   diff, preserve the validated generated copy, commit/push both repositories,
   verify remote SHAs and clean trees, then update all continuity documents and
   make the M3 Golden decision.
5. If A4 has been sealed by a later top-of-file section, follow that newer exact
   pair and its NEXT EXACT ACTION. Never infer the compatible pair from branch
   names alone.

A replacement agent can launch protocol 3, understand every passed and failed
gate, finish the A4 checkpoint without Owner reconstruction, and continue into
the replay journal. The older M2 handoff remains below for historical context.

## PRIOR GOLDEN M2 HANDOFF - HISTORICAL

Timestamp: 2026-08-21 00:12 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden M2 product SHA | `7d76951f6ad641e8940b97b03806b87638ed8ad8` |
| TypeScript Golden M2 parent | `7218368cddc46eaeb0fb99691489d457a89112d6` |
| TypeScript branch tip | The committed continuity declaration is `103ad1a4a55e27eb6ea3dff5ad10836d7b46a3aa`; this final CI note will create one more docs-only descendant. After that commit, `git rev-parse HEAD` is authoritative because a commit cannot embed its own resulting SHA. Every branch-tip commit after the Golden product SHA must remain documentation-only. |
| TypeScript pushed | Yes through product commit `7d76951f6ad641e8940b97b03806b87638ed8ad8`; the two local docs-only continuity commits are pending one final push. |
| TypeScript working tree | Only the three campaign continuity documents are dirty for the final CI note. Product source is committed. Expected clean after the docs-only commit/push. Ignored `node_modules/`, `dist/`, and `.tmp/` outputs remain local. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity pushed | Yes; local, upstream, and remote campaign refs all resolve to `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity working tree | Clean. `Library/`, `Logs/`, `Builds/`, and `Evidence/` are ignored local outputs. |

Golden M2 is the declared exact compatible pair: TypeScript product
`7d76951f6ad641e8940b97b03806b87638ed8ad8` plus Unity
`a1c27318bec47f1abc4a29b77d9c413bdc8a8778`, under immutable annotated tag name
`golden/unity-convergence-m2` in each repository. Both annotated tag refs are
pushed and resolve to those exact product commits; a later docs-only TypeScript
branch tip does not move the Golden tag. Golden M2 supersedes M1 as CURRENT
BEST. Both `golden/unity-convergence-m1` tags remain preserved and immutable at
their original SHAs.

The compatible live contract remains protocol `2`, projection `4`, schema ID
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.

Remote default/canonical audit remains unchanged:

- TypeScript remote default `main` is
  `5914c84e453461240540184e79b2bd7eafeb647f`, historically diverged from the
  campaign. Do not merge the campaign into it casually.
- Unity remote default `unity-typescript-bridge-spike` is
  `626c2d3a25f21ebdbb2603939378368af925f18c`, a campaign ancestor.
- Neither campaign branch has been promoted to its remote default.

## CAMPAIGN STATUS

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A3 queue-law parity is sealed as Golden M2. Work now moves
  to TypeScript-owned structured guidance for genuine command rejections.
- Completed phases: campaign setup/baseline; A1 generated schema/DTO pipeline;
  A2 atomic named projection foundation; PR #5 donor review and current-architecture
  security/governance harvest.
- Partially completed phases: A3 commands have IDs, expected revisions, stale
  rejection, deduplication, explicit codes/messages, bounded response replay,
  and queue-admissible bridge/UI parity. Structured rejection guidance and
  durable replay remain. D through N retain inherited partial capabilities only.
- Untouched phases: Phase B durable local runtime and Phase C production client
  layering have not begun as campaign implementations.
- Current acceptance gate: add generated TypeScript-owned rejection categories
  and guidance, then prove Unity retains and renders only valid guidance across
  same-revision polls. Capacity remains queue admission, never a rejection.

## WHAT WAS JUST DONE

### Concise description

Committed and pushed A3 queue parity end to end at
`7d76951f6ad641e8940b97b03806b87638ed8ad8`. Commission, audition, and greenlight
intents remain available when both authoritative Development & Casting slots are
occupied. TypeScript accepts those commands into its existing deterministic
queue rather than the bridge or UI suppressing them as capacity failures. Exact
duplicate queued intents are rejected at the normal front door but dequeue
replay remains legal.

The retained Lot now distinguishes immediate acceptance from queue admission.
Queued screenplay and greenlight successors show truthful WHAT HAPPENED / WHY IT
MATTERS / WHAT NEXT copy, claim no premature project or production identity, and
fire no false immediate-commit/formation presentation.

The binding Visual Fidelity / Recognizability Ruling is encoded as ADR
`docs/adr/0006-visual-recognizability-and-two-scale-camera.md`. The approved
production direction is a coherent two-scale Unity camera and an inhabitable,
human-scale period studio, not a permanently high-angle diorama. This changes
the acceptance target, not simulation authority.

### Files and systems changed

TypeScript product commit `7d76951f6ad641e8940b97b03806b87638ed8ad8`:

- `bridge/session.ts`: queue-admissible intent production independent of the
  guided journey; exact project/production routing; authoritative preflight;
  explicit accepted queue messages.
- `bridge/proof.ts`: centralized journey-intent selection rather than fixed
  commission-first proof priority.
- `src/core/productionQueue.ts` and `src/core/actions.ts`: exact queued
  commission/casting/greenlight duplicate guards while preserving dequeue.
- `src/core/scriptReadModel.ts`, `src/core/castingReadModel.ts`, and
  `src/core/firstFilmJourney.ts`: queue-aware legal actions, exact waiting
  states, and advance/cancel remedies without capacity-as-refusal.
- `ui/src/engine/`, `ui/src/screens/`, `ui/src/lot/`: queueable controls,
  casting/package precedence, retained queue receipts, fail-neutral malformed
  receipt behavior, and truthful Lot/world copy.
- `ui/src/lot/snapshot/queueAdmission.ts`: exact whole-successor witnesses for
  pool/original commission and greenlight queue admission. It replays the pure
  TypeScript action and requires byte-equivalent state rather than duplicating
  queue rules in presentation.
- Core, bridge, read-model, contention/property, React, retained-workspace, and
  snapshot tests were added or strengthened. Pressure harnesses now avoid
  resubmitting an already queued exact greenlight.
- `docs/adr/0006-visual-recognizability-and-two-scale-camera.md` and
  `docs/adr/README.md`: binding modern-The-Movies recognizability and two-scale
  camera direction.
- Campaign continuity documents form the docs-only follow-up being prepared now.

Unity tracked source: no file changed. The same Unity client was rebuilt and
revalidated against the A3 TypeScript authority.

### Why

The previous bridge and presentation treated occupied capacity as if the
authoritative action were unavailable. That contradicted the permanent product
law "queue, don't forbid" and the core action implementation. It also produced
false retained-shell copy such as "GREENLIGHT ACCEPTED" when only a queue row
existed. A3 restores one authority: Unity/React submits intent, TypeScript either
commits or queues it, and every client presents that exact outcome.

The visual ADR is required because a technically correct high-angle campus can
still look like the wrong game. It preserves management readability while
requiring lower inspection/production framing, authored materials, believable
people, visible filmmaking, and period-studio UI identity.

### Relevant commits

- Frozen TypeScript adoption authority:
  `f6606ac9db67dc70b12a7d247d74206571d12d2c`.
- Frozen Unity adoption authority:
  `d970b81c2b17383ee71c3c66a5622ecc140473b3`.
- A1 TypeScript implementation:
  `a7ceb56bbac6c2ceb0be534a5753f086c5d51401`.
- A1 Unity implementation:
  `7fb693c78da06cca1c8e688340241e1c9fa0b874`.
- A2 TypeScript implementation / preserved Golden M1:
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- A2 Unity implementation / preserved Golden M1 client:
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Donor harvest:
  `f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2`.
- Donor CI correction:
  `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`.
- A3 parent:
  `7218368cddc46eaeb0fb99691489d457a89112d6`.
- A3 queue-parity product commit / Golden M2 TypeScript product:
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- Golden M2 Unity product:
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

No gameplay formula, GameState schema, protocol/projection version, RNG stream,
save version, existing identity, economy rule, construction rule, or Unity
simulation authority changed.

## WHAT IS WORKING RIGHT NOW

### Launch commands

Start the localhost-only TypeScript authority:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
npm run bridge
```

Open the Unity editor:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build the current native client if the ignored app is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a3-native-build-seal.log \
  -quit
```

Launch the current native client after the bridge is live:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

Run the native Movie #2 proof:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike' \
  -screen-fullscreen 0 \
  -screen-width 1440 \
  -screen-height 900 \
  -studioBridgeAutoProof \
  -studioBridgeProofRoot '/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity' \
  -logFile /tmp/studio-a3-native-proof-final-seal.log
```

### Bridge and runtime status

- No bridge or native process is intentionally running now.
- Bind remains localhost-only at `127.0.0.1:4317`; override through
  `PROJECT_STUDIO_BRIDGE_PORT`, `PROJECT_STUDIO_BRIDGE_URL`, or
  `-studioBridgeUrl`.
- Protocol `2`, projection `4`, and schema identity are unchanged.
- One atomic response still carries `lot`, `productions`, `people`,
  `construction`, `journeyNotices`, and `releaseResults`, plus root
  authority tokens and same-revision legal intents.
- Commission, auditions, and greenlight now remain available under occupied
  capacity and resolve through TypeScript queue admission.
- Lifecycle is still two manually managed processes. Session/save/replay state
  remains bridge-process memory; Phase B is not complete.

### Current playable flow

The current native client completes screenplay, review, auditions, audition
evidence, editable casting/greenlight, pre-production, blockers, director call,
scenery load-in, shooting, save/load, post-production, release, construction,
stale-revision rejection, and reconnect through TypeScript-published legal
intents. Focused bridge/browser tests additionally prove contended commission,
audition, and greenlight queue admission and retained queue-aware presentation.

### Current visual state

A3 did not change Unity visuals. The current client already uses perspective,
Cinemachine, orbit/pan/focus, textured and normal-mapped materials, eight
provenance-cleared Quaternius human variants, and Mecanim animators. Therefore
the local fidelity PDF's Three.js-specific primitive/texture counts are not a
literal Unity inventory.

The important critique remains valid: the standard pitch, narrow lens, focus
behavior, oversized proof HUD, sparse human-scale activity, weak role
readability, prototype weathering/lighting, and sparse Hero Soundstage 7 still
read as a managed diorama rather than an inhabitable filmmaking institution.
Focus changes pivot/distance but retains the high management pitch and lens.
The current visual state fails the new final visual target; do not claim A3 as a
visual improvement.

The next isolated camera experiment, after load-bearing runtime work, is
`location-v1`: keep overview pitch 46.5 degrees, yaw 38.5 degrees, FOV 36,
distance 155; use focus pitch 32 degrees, FOV 42, and distance
`clamp(diagonal * 1.45, 18, 72)`; preserve yaw, smooth transitions, and make
Home restore overview. Keep that experiment isolated from materials, lighting,
HUD, protocol, and simulation changes.

### Current Movie #2 status

- Native proof: `complete`.
- Movie #2: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Saved/restored shooting digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale action: rejected with `STALE_REVISION`.
- Reconnect: a second native process recovered the same session at revision 23,
  Week 22, with the exact Movie #2 identity and final digest.

## VALIDATION STATE

| Gate | Latest accepted result |
| --- | --- |
| TypeScript full tests | 327 files passed; 4,450 passed, 5 skipped, 0 failed in 60.15 seconds; `/tmp/studio-a3-seal-final-full-tests.log` |
| Typecheck | `npm run typecheck` passed after the retained queue-receipt changes |
| Production build | Passed in 3.74 seconds; inherited large-chunk warnings only; `/tmp/studio-a3-build.log` |
| Bridge typecheck | `npm run typecheck:bridge` passed |
| Bridge tests | 24/24 passed across 13 bridge and 11 schema tests; `/tmp/studio-a3-bridge-tests.log` |
| Generated drift | Canonical schema, TypeScript C# golden, and Unity C# copy verified byte-identical |
| Browser dependency audit | Passed with 0 vulnerabilities |
| Full npm audit | Existing dev-graph advisories remain; no whole-product clean claim |
| Repository hygiene | Passed over 1,005 tracked/unignored files |
| 3D asset guard | 26 assets, 0 hard violations |
| Unity EditMode | Final seal 15/15 passed; `/tmp/studio-a3-editmode-results-seal.xml` |
| Unity PlayMode | No dedicated suite; native automation remains the runtime gate |
| Native build | Final seal success; 136,925,846 bytes; `/tmp/studio-a3-native-build-seal.log` |
| Runtime playthrough | Fresh native Movie #2 complete at Week 22/revision 23 with 11 milestones |
| Save/load | Exact saved and restored digest `5543ef56...` |
| Reconnect | Separate native process restored Week 22/revision 23/final digest; `12-reconnected.png` |
| Stale/duplicate commands | Native stale rejection passed; bridge replay/duplicate tests and front-door queued-duplicate tests passed |
| Determinism | Export/import/export, headless/bridge proof, save/load, and reconnect parity passed |
| Runtime console | No proof failure, error, exception, or protocol/schema mismatch; Unity emits known shutdown thread-finalization warnings on exit |
| Native A3 final-seal sample | 119.18 FPS; 15,394-byte snapshot; 18.52 ms serialization; 3.82 ms parse; 0.33 ms apply; 33.25 ms RTT |
| Reconnect final-seal sample | 119.19 FPS; 15,394-byte snapshot; 23.10 ms serialization; 3.96 ms parse; 4.44 ms initial apply; 33.20 ms RTT |
| Inherited baseline | 119.82 FPS; 8.32 ms median; 9.06 ms p95; 680 draw calls; 168,041 triangles; 412 MB working set |
| Screenshot/evidence root | `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/` |
| Product-SHA CI | GitHub Actions run `32422095175` passed every gate for `7d76951f6ad641e8940b97b03806b87638ed8ad8` in 9m36s |

Current accepted evidence:

- `Evidence/A3/Queue-Parity/bridge-client-proof.json`
- `Evidence/A3/Queue-Parity/bridge-reconnect-proof.json`
- `Evidence/A3/Queue-Parity/01-whole-lot.png` through
  `12-reconnected.png`
- `/tmp/studio-a3-seal-final-full-tests.log`
- `/tmp/studio-a3-bridge-tests.log`
- `/tmp/studio-a3-typecheck.log`
- `/tmp/studio-a3-bridge-typecheck.log`
- `/tmp/studio-a3-build.log`
- `/tmp/studio-a3-generated.log`
- `/tmp/studio-a3-hygiene.log`
- `/tmp/studio-a3-assets.log`
- `/tmp/studio-a3-browser-audit.log`
- `/tmp/studio-a3-editmode-results-seal.xml`
- `/tmp/studio-a3-editmode-seal.log`
- `/tmp/studio-a3-native-build-seal.log`
- `/tmp/studio-a3-native-proof-final-seal.log`
- `/tmp/studio-a3-native-reconnect-final-seal.log`
- `/tmp/studio-a3-proof.log`

## KNOWN PROBLEMS / BLOCKERS

### 1. Structured rejection guidance is not yet a generated contract

- Exact defect: genuine command failures expose code/message but no typed
  TypeScript-owned category, holder, remedy, or action guidance that Unity can
  retain across same-revision polls.
- Severity: High for the next Phase A contract unit and player-legible negative
  paths; Golden M2 queue behavior itself is accepted.
- Reproduction: inspect bridge rejection response/schema and Unity rejection
  handling; trigger a legal command that fails for a non-capacity reason, then
  poll the unchanged revision.
- Origin: Pre-existing adoption gap, not an A3 queue regression.
- Attempted fixes: A3 first removed capacity from the rejection category and
  made queue acceptance truthful. Existing codes/messages, stale rejection, and
  fail-neutral UI behavior remain.
- Must not be tried again: do not call capacity a rejection; do not infer holder
  or remedy in C#; do not invent a singular holder where queue authority is
  plural.

### 2. Replay durability remains process-memory-only

- Exact defect: command response replay is bounded to 256 in-memory identities
  and does not survive bridge restart.
- Severity: High resilience gap before product runtime packaging.
- Reproduction: exceed the cache or restart the bridge, then resubmit a prior
  command ID.
- Origin: Pre-existing bridge proof boundary.
- Attempted fixes: command/session IDs, exact expected revision, deterministic
  in-cache replay, and duplicate tests pass.
- Must not be tried again: do not weaken stale/digest checks, use an unbounded
  cache, or write a Unity-side command ledger.

### 3. Runtime lifecycle and save persistence remain experimental

- Exact defect: fixed default port, two manual processes, memory-only
  session/save/replay state, no launcher, restart recovery, stale-process
  cleanup, integrated logs, graceful shutdown, or disk-backed save abstraction.
- Severity: High product lifecycle gap; current developer proof works.
- Reproduction: save, terminate the bridge, restart, and observe a new in-memory
  authority.
- Origin: Phase B untouched.
- Attempted fixes: health/schema/session handshakes and client reconnect while
  the same engine remains alive.
- Must not be tried again: no public bind, arbitrary filesystem/command bridge,
  persistent/logged capability token, or claim that in-process JSON is durable.

### 4. Projection decomposition remains incomplete

- Exact defect: the six atomic sections are still coarse for screenplay,
  casting, package/greenlight, detailed results, and structured notices/remedies.
- Severity: Medium maintainability/client-workspace gap.
- Reproduction: compare the projection bundle to the Phase A2 named surface list.
- Origin: Deliberately bounded A2 foundation.
- Attempted fixes: atomic same-revision bundle and stable-ID Unity store pass.
- Must not be tried again: no independently polled revision clocks, title/index
  routing, or second presentation-owned simulation model.

### 5. Current visuals still fail the new recognizability gate

- Exact defect: high management framing persists into focus, serialized home
  distance and controller limits disagree, the 520-pixel proof HUD dominates,
  people/activity are weak at human scale, and Hero Soundstage 7 remains sparse.
- Severity: High product-identity gap; no functional regression.
- Reproduction: inspect A3 overview, blocker, shooting, and release captures;
  focus a production and compare with the binding visual ruling.
- Origin: Pre-existing Unity spike art/camera boundary, unchanged by A3.
- Attempted fixes: audit only; ADR 0006 defines the two-scale target and a
  reversible `location-v1` experiment.
- Must not be tried again: do not reopen Unity versus Three.js, copy Lionhead
  assets/layout/UI, fabricate production activity, perform a blanket asset
  rewrite, or move simulation truth into Unity.

### 6. Cross-repository generated-copy CI is not automatic

- Exact defect: TypeScript CI checks its C# golden but cannot see the Unity repo
  without an explicit `--unity-project` path.
- Severity: Medium drift risk; current copies are byte-identical.
- Reproduction: run contract check without the Unity path.
- Origin: Separate-repository topology.
- Attempted fixes: deterministic cross-repo check and Unity strict fixtures.
- Must not be tried again: never hand-edit generated C# or add another mirror.

### 7. Canonical promotion remains deferred

- Exact defect: TypeScript default and campaign histories remain a semantic
  mega-diff; Unity alone is incompatible with default TypeScript.
- Severity: High release-management risk, not a runtime defect.
- Reproduction: compare campaign branches with recorded remote defaults.
- Origin: Historical repository topology.
- Attempted fixes: immutable M1 tags plus the explicit Golden M2 compatible pair.
- Must not be tried again: no unilateral default merge, rebase, force push,
  generated-DTO-only cherry-pick, or Golden tag movement.

### 8. Development dependency and localhost security boundaries remain

- Exact defect: browser runtime audit is clean, but the dev-run bridge graph
  still has advisories and lacks per-launch capability, strict Host/Origin and
  content-type gates, and request/header timeouts.
- Severity: High before packaged Phase B; bounded for local developer use.
- Reproduction: run full `npm audit` and inspect `bridge/server.ts`.
- Origin: Pre-existing runtime boundary.
- Attempted fixes: least-privilege CI, repository hygiene, browser audit,
  explicit `vite-node`, and safe `nanoid` patch.
- Must not be tried again: no `npm audit fix --force`, false clean claim,
  browser-only threat model, or non-localhost bind.

No unresolved Owner-decision item blocks the next action.

## NEXT EXACT ACTION

Implement TypeScript-owned structured rejection categories and actionable
guidance in the bridge protocol/schema, regenerate the TypeScript C# golden and
Unity DTO copy, then make Unity retain and render only schema-valid rejection
guidance across same-revision polls. Run `npm run test:bridge`, bridge
typecheck/generated drift checks, and Unity EditMode negative-path tests.

## NEXT 3-5 ACTIONS AFTER THAT

1. Replace the 256-entry memory-only replay eviction boundary with a bounded,
   save-associated command identity journal; prove duplicate commands remain
   deterministic across save/load and engine process restart.
2. Begin Phase B with a start/stop-capable localhost runtime, ephemeral-port
   discovery, per-launch capability, Host/Origin/content-type enforcement,
   request/header timeouts, save-path abstraction, useful logs, and graceful
   shutdown.
3. Add engine restart detection/reconnect and prove disk-backed recovery through
   a native Unity restart and active-production save/load playthrough.
4. Run the isolated `location-v1` two-scale camera experiment, capture control
   and candidate evidence under `Evidence/I1/Camera-Fidelity/`, and accept it
   only if management readability, human-scale framing, clipping, performance,
   and veteran-recognizability gates pass.
5. Refactor the winning Unity client into explicit runtime/session, projection
   store, presentation, interaction, and UI layers without changing simulation
   truth.

## DO NOT TOUCH

- Frozen authorities `737bbe1f`, `f6606ac9`, `d970b81c`, and
  `82c9486a`.
- Existing `golden/unity-convergence-m1` tags; never move or delete them.
- The declared `golden/unity-convergence-m2` product pair. Publish each tag at
  its exact product SHA during the final seal, then never move or delete it.
- TypeScript ownership of GameState, legality, economy, time, RNG, saves,
  migrations, identities, outcomes, production/construction rules, and
  progression truth.
- The authoritative core queue laws now proven by A3. Capacity queues; it is not
  a rejection. A queued intent holds nothing and is revalidated at dequeue.
- Three.js as preserved reference/regression oracle/fallback.
- Permanent IDs, deterministic RNG streams, V14 history, or Owner-set product
  laws.
- Protected/Lionhead assets, unclear-license donors, purchases, or generated
  imagery.
- Generated C# by hand. Change TypeScript schema, regenerate, and verify both
  repositories.
- `StudioOfflineLotSnapshot` semantics merely to simplify the live bundle.
- Local ignored `Evidence/`, `Builds/`, `Library/`, `Logs/`,
  `node_modules/`, `dist/`, `.tmp/`, `/tmp`, or the local PDF as tracked
  source.
- The `location-v1` camera experiment must remain isolated from protocol,
  simulation, material, lighting, and HUD changes until its camera hypothesis is
  measured.
- Remote defaults/historical branches before deliberate promotion validation.
- Localhost-only bridge security boundary.

## DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Preserve capacity as queue admission across bridge and UI | Core TypeScript already owns the permanent queue law; suppressing the intent contradicted authority | The implementation is reversible; the product law is not | Queue-admission core tests, bridge contention tests, retained UI tests |
| Centralize exact journey-intent routing | Fixed commission-first proof priority could choose the wrong exact project/production | Yes | Bridge Movie #2 and opaque-identity tests |
| Guard exact duplicate queued intents at normal front doors, not dequeue | Rapid/stale client resubmission must not clone queue rows, while the existing row must still commit later | Yes internally | Commission/casting/greenlight duplicate and dequeue tests |
| Treat queue success as its own retained presentation | A queue row creates no project/production identity and holds no cash/talent/facility | Yes if equivalent truthful UX replaces it | Whole-successor queue witnesses and App-authority tests |
| Use whole-state pure replay to witness retained queue success | Reusing the TypeScript action avoids a presentation-side queue formula | Yes | Malformed/tampered/stale/null tests |
| Keep protocol 2/projection 4 for A3 queue parity | Wire shape did not change | Yes only through explicit future migration | Generated drift and v4 native proof |
| Ratify visual recognizability and a two-scale camera as binding | A readable diorama can still evoke the wrong game; management and emotional proximity are both required | Supersedable by later ADR, not casually ignored | Owner ruling, local fidelity PDF, Unity code/capture audit |
| Treat PDF numeric Three.js inventory claims as reference-specific | Current Unity already has perspective, Cinemachine, textured materials, humans, and animators | Yes with new evidence | Unity source and A3 capture audit |
| Declare Golden M2 and supersede M1 as CURRENT BEST | The pushed A3 product closes a permanent queue-law/client-parity defect while preserving Movie #2, determinism, native performance, and architecture | No tag movement; a later Golden may supersede it | Product SHA `7d76951...`, Unity `a1c273...`, final full/native seal |
| Preserve Golden M1 | M2 supersession must not erase the prior recovery point | No; tags are immutable | Existing M1 tag pair remains at `cd2b158...` / `a1c273...` |
| Keep promotion status `GOLDEN — CONTINUE CAMPAIGN` | Structured rejection guidance, durable runtime/restart recovery, canonical-history reconciliation, and visual floor remain unfinished | Yes after stronger evidence | Known blockers and unchanged defaults |

## UNCOMMITTED / GENERATED MATERIAL

### TypeScript continuity tail

- Golden M2 product source is committed and pushed at
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`, parent
  `7218368cddc46eaeb0fb99691489d457a89112d6`.
- Only these tracked continuity files are dirty now:
  `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H.md`, this handoff, and
  `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H-PROMOTION.md`.
- No product source or untracked source remains outside the product commit.
- After the continuity commit, the TypeScript branch tip will be a docs-only
  descendant of the Golden product SHA. Use `git rev-parse HEAD` for that branch
  tip; keep `golden/unity-convergence-m2` pinned to `7d76951...`.
- Checked-in generated schema and TypeScript-side C# golden remain intentional
  tracked source; A3 did not change their bytes.
- `node_modules/`, `dist/`, and `.tmp/3d-asset-audit.json` are ignored and
  regenerated locally.

### Unity ignored material

- Tracked Unity source is clean at
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- `Builds/macOS/Project Studio Visual Spike.app`: ignored final-seal native
  build, 136,925,846 bytes.
- `Evidence/A3/Queue-Parity/`: ignored, approximately 16 MB, 12 PNGs and 2
  JSON reports.
- `Evidence/A2/`, `Evidence/A1/`, and `Evidence/Baseline/`: ignored prior
  evidence.
- `Library/` and `Logs/`: ignored Unity cache/logs.

### Local visual-fidelity source

- `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`
- Size: 1,087,211 bytes.
- SHA-256:
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
- This is local reference input, deliberately excluded from Git. Do not adopt
  protected The Movies screenshots/assets into production or source control.

### Machine-local logs/evidence

- `/tmp/studio-a3-seal-final-full-tests.log`
- `/tmp/studio-a3-bridge-tests.log`
- `/tmp/studio-a3-typecheck.log`
- `/tmp/studio-a3-bridge-typecheck.log`
- `/tmp/studio-a3-build.log`
- `/tmp/studio-a3-generated.log`
- `/tmp/studio-a3-hygiene.log`
- `/tmp/studio-a3-assets.log`
- `/tmp/studio-a3-browser-audit.log`
- `/tmp/studio-a3-editmode-results-seal.xml`
- `/tmp/studio-a3-editmode-seal.log`
- `/tmp/studio-a3-native-build-seal.log`
- `/tmp/studio-a3-native-proof-final-seal.log`
- `/tmp/studio-a3-native-reconnect-final-seal.log`
- `/tmp/studio-a3-proof.log`
- `/tmp/studio-a3-headless-proof.json`
- Superseded but deliberately retained diagnostics:
  `/tmp/studio-a3-3d-audit.log`, `/tmp/studio-a3-full-tests.log`,
  `/tmp/studio-a3-editmode-results.xml`, `/tmp/studio-a3-editmode.log`,
  `/tmp/studio-a3-final-full-tests.log`,
  `/tmp/studio-a3-generated-check.log`,
  `/tmp/studio-a3-native-build.log`,
  `/tmp/studio-a3-native-proof.log`,
  `/tmp/studio-a3-native-proof-postbuild.log`,
  `/tmp/studio-a3-native-proof-seal.log`,
  `/tmp/studio-a3-native-reconnect.log`,
  `/tmp/studio-a3-native-reconnect-postbuild.log`,
  `/tmp/studio-a3-native-reconnect-seal.log`,
  `/tmp/studio-a3-queue-proof.json`,
  `/tmp/studio-a3-repo-hygiene.log`, and
  `/tmp/studio-a3-seal-full-tests.log`.

No screenshot, native build, local PDF, token, secret, cache, or temporary report
is intended for the checkpoint commit.

## RECOVERY INSTRUCTIONS

1. Read, in order:
   - `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`
   - `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H.md`
   - this handoff
   - `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H-PROMOTION.md`
2. Verify the recorded committed heads, remote refs, Golden tags, and worktrees:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse hspector-github/campaign/unity-production-convergence-80h-ts
   git rev-parse golden/unity-convergence-m1
   git rev-parse 'golden/unity-convergence-m2^{}'
   git merge-base --is-ancestor \
     7d76951f6ad641e8940b97b03806b87638ed8ad8 HEAD
   git diff --check

   cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse origin/campaign/unity-production-convergence-80h-client
   git rev-parse golden/unity-convergence-m1
   git rev-parse 'golden/unity-convergence-m2^{}'
   ```

   The TypeScript branch tip may be a docs-only descendant and is whatever
   `git rev-parse HEAD` reports after the continuity commit. It must descend from
   product SHA `7d76951...`; the M2 tag itself must dereference exactly to that
   product SHA. The Unity branch and M2 tag both resolve to `a1c273...`. Local,
   upstream, and remote branch refs must agree, and both worktrees should be clean.
3. Run the minimum Golden M2 smoke before modifying it:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm run test:bridge
   npm run typecheck
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. Launch Golden M2 with `npm run bridge`, then the ignored native
   app command above. Confirm protocol 2/projection 4 and exact Movie #2 release
   at Week 22/revision 23. The accepted evidence is already under
   `Evidence/A3/Queue-Parity/`.
5. Verify GitHub Actions run `32422095175` remains successful for the exact
   Golden TypeScript product SHA. Do not rerun it or weaken any gate merely to
   obtain another green result.
6. Perform NEXT EXACT ACTION. Do not repeat A1/A2 research, reopen Unity versus
   Three.js, hand-mirror DTOs, encode remedies in C#, reinterpret capacity as a
   rejection, or ask the Owner to reconstruct history.

A replacement agent with no chat history can now verify both repositories,
launch the current best build, understand the accepted Golden M2 product and its
remaining defects, preserve the local evidence, and continue from the exact
next action.
