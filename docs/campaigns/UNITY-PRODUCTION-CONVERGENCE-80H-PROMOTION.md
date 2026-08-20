# Unity Production Convergence 80H - Promotion Register

This file is the authoritative answer to: **What is currently the best version
of Project: Studio, and is it ready for promotion?** Preserve every Golden tag.
Do not infer a compatible TypeScript/Unity pair from branch names alone.

## CURRENT BEST PROJECT: STUDIO

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact candidate SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `cd2b15872ac5849fa16beec1775543758cb3139e` | `golden/unity-convergence-m1` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `golden/unity-convergence-m1` |

The two SHAs above are one schema-pinned compatible pair: protocol `2`,
projection `4`, schema
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.
Do not promote, build, or recover only one side of the pair.

## CANONICAL / DEFAULT BRANCHES

| Repository | Remote default branch | Audited SHA | Campaign relationship |
| --- | --- | --- | --- |
| TypeScript | `main` | `5914c84e453461240540184e79b2bd7eafeb647f` | Diverged: merge base `c0c9561`; default has 3 unique commits and campaign has 185 before A2 |
| Unity | `unity-typescript-bridge-spike` | `626c2d3a25f21ebdbb2603939378368af925f18c` | Linear ancestor of the campaign |

The Unity repository's local archival `main` at
`17572ceb376fed048f110f34bbaac2fa7a8095ce` is not a remote default or a
production-promotion target.

## CURRENT GOLDEN TAGS

- `golden/unity-convergence-m1` in `HSpector1/The-Movies` points immutably to
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- `golden/unity-convergence-m1` in
  `HSpector1/project-studio-unity-visual-spike` points immutably to
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

No earlier campaign Golden tag exists. The frozen adoption authorities remain
recovery authorities but were not retroactively relabeled as campaign Goldens.

## WHY THIS IS THE CURRENT BEST

M1 combines the complete A1 generated-contract foundation with the A2 atomic
projection bundle. TypeScript still owns all simulation truth. Unity now receives
six purpose-specific, closed projections (`lot`, `productions`, `people`,
`construction`, `journeyNotices`, and `releaseResults`) under one authoritative
revision/digest envelope instead of one growing snapshot DTO. Stable-ID caches
are updated atomically; stale, conflicting same-revision, duplicate-ID, missing
section, and incompatible projection payloads fail closed.

This is materially safer and more maintainable than the A1 branch tips while
preserving the same native Movie #2, save/load, stale-command, reconnect, and
visual behavior. It changes no gameplay rule, formula, save identity, RNG stream,
or Three.js behavior.

## POST-GOLDEN CAMPAIGN DESCENDANTS

The TypeScript campaign branch has a validated non-Golden governance descendant
that harvests current-architecture ADR, security, dependency, CI, and repository
hygiene value from PR #5 without adopting either stale donor commit. Its exact
checkpoint SHA is recorded by the immediate continuity follow-up. Unity remains
at `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

This descendant does not supersede M1 as CURRENT BEST: it changes no simulation,
protocol, player flow, Unity client, native build, screenshots, or visual state.
Build and recover the exact tagged M1 pair above until a later compatible pair
earns a new Golden. No Golden tag was created or moved for the donor checkpoint.

## LAUNCH COMMAND

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
  -logFile /tmp/studio-a2-build.log \
  -quit
```

## VALIDATION SUMMARY

| Gate | Golden M1 result |
| --- | --- |
| TypeScript full suite | 325 files; 4,421 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| TypeScript production build | Passed; inherited Vite chunk-size warnings only |
| Bridge typecheck | Passed |
| Bridge/schema tests | 20/20 passed |
| Generated cross-repo drift | Passed; C# copies byte-identical, SHA-256 `3805f4d54cba772d0670697d3d356b9c480c7a35d1bd4a295a63c5110e8ca004` |
| Unity EditMode | 15/15 passed |
| Unity PlayMode | No dedicated suite exists; native automation is the runtime gate |
| Native macOS build | Passed, `Build Finished, Result: Success` |
| Fresh native Movie #2 | Passed through release at Week 22, revision 23 |
| Native save/load | Passed; saved/restored digest identical |
| Native reconnect | Passed in a second process against the same session/revision/digest |
| Stale command | Rejected with `STALE_REVISION`; truth unchanged |
| Duplicate command | Passed deterministic response replay test |
| Determinism | Export/import/export byte-identical; headless and bridge save bytes identical |
| Runtime console | No proof failure, error, exception, or protocol mismatch |

## MOVIE #2 STATUS

- Status: fully playable through the native Unity proof client.
- Title: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.

## VISUAL STATUS

A2 intentionally changes no art, camera, UI composition, animation, or world
layout. Inspection of the whole-lot, blocker, release, and reconnect captures
confirms the A1 visual state is preserved: campus scale reads, the proof HUD is
clear but intrusive, people and filmmaking activity remain weak, and Hero
Soundstage 7 remains below the commercial target. This Golden is an architecture
and reliability improvement, not a visual-quality claim.

Current evidence is local and ignored by Git:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/01-whole-lot.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/07-production-blocker.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/11-movie-2-released.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/12-reconnected.png`

Latest native sample: 119.40 FPS average, 15,394-byte snapshot, 17.22 ms
TypeScript serialization, 3.81 ms strict parse, 0.29 ms apply, and 33.01 ms
command round trip. The separate reconnect application measured 3.89 ms.

## KNOWN DEFECTS

- Phase A2 is only a decomposition foundation. Detailed screenplay/development,
  casting, package/greenlight, and structured holder/remedy projections remain.
- Runtime lifecycle is still two manual processes with a fixed default port and
  memory-only session/save/replay state. Engine restart loses the session.
- The proof HUD and visual client remain pre-production; no A2 visual uplift was
  claimed.
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

No known P0 regression or TypeScript-authority violation remains.

## PROMOTION DECISION

**GOLDEN — CONTINUE CAMPAIGN**

Do not promote M1 to the remote defaults yet. The TypeScript default and
campaign line diverge by a large semantic history (3 default-only versus at
least 185 campaign-only commits), so a merge would promote far more than this
bounded A1/A2 checkpoint. Unity is fast-forwardable, but promoting it alone
would publish a client incompatible with the TypeScript default. The two-repo
promotion cannot be atomic, Phase B runtime durability is untouched, and the
current product still requires manual lifecycle management.

This is a technical-PM rejection of premature canonical promotion, not a request
for Owner arbitration. Continue on the campaign pair. Reassess promotion after
a deliberately constructed two-repository candidate diff, durable runtime
lifecycle, and validation of the actual merge candidates.

## PROMOTION PACKAGE STATUS

Not prepared. M1 is not `READY FOR OWNER MERGE REVIEW` and is not being promoted
to canonical. The rollback/recovery point is the compatible pair named at the
top of this file and preserved by `golden/unity-convergence-m1` in both repos.
