# Project: Studio — Start Here

Use this page to orient a new contributor or agent without launching the game or relying on another person's Downloads folder.

The exact repository, commit, branch, and status snapshot is in the [dated source register](docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md). Package designs and their separate implementation/acceptance states are in [docs/PACKAGES.md](docs/PACKAGES.md).

## 1. Find the authority that applies to the task

Mutation authority is task-specific. Apply this order:

1. the Owner's explicit current instruction and product rulings;
2. the applicable Current Ops issued execution or repair order;
3. accepted producer/consumer contracts and exact accepted candidate evidence;
4. the package charter or requirement register named by that order;
5. repository-wide engineering and agent guidance; then
6. historical plans and research as evidence only.

For the active P08–P10 work, the applicable authorization is `OPS-P08P10-20260905-01`, preserved in the [execution order](https://github.com/HSpector1/The-Movies/blob/9bc01ea3682e597ec65acfc624afc41e4f48004a/docs/operations/OPS-P08P10-20260905-01-EXECUTION-ORDER.md) and [Current Ops delta](https://github.com/HSpector1/The-Movies/blob/9bc01ea3682e597ec65acfc624afc41e4f48004a/docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md). These links identify the 2026-09-05 snapshot; later work must resolve a newer explicit order rather than assume this one applies.

If no issued task names the permitted scope, source base, owned branch/worktree, and stopping boundary, inspect read-only and ask for authority before writing. Research, pre-readiness, a draft prompt, a discovery branch, or technical KEEP is not implementation permission.

## 2. Confirm repository and branch ownership

There are two product repositories:

| Layer | Repository | Access and role |
| --- | --- | --- |
| TypeScript simulation and public documentation | `https://github.com/HSpector1/The-Movies.git` | Public. TypeScript owns gameplay law, state, time, RNG, actions, saves, and the generated wire contract. |
| Unity production presentation | `https://github.com/HSpector1/project-studio-unity-visual-spike.git` | Private. Explicit GitHub access is required. Unity consumes generated facts and emits intent; it does not own gameplay law. |

The accepted TypeScript runtime/product is `da848225516fe3ced9a421548d0f5e7cbc8b5b88`; the documentation-inclusive accepted campaign/base is `2753e18ba8fb5f65b936c22cde9531646fecc6cd`; and the accepted Unity product/campaign is `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`. The [Owner acceptance receipt](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md) distinguishes runtime, build, technical-seal, and documentation identities.

Before writing:

- resolve the advertised discovery ref without switching a checkout;
- verify the immutable commit and repository identity;
- inspect existing worktrees and the issued ownership assignment;
- create a new owned branch/worktree from the exact authorized base; and
- never clean, reset, rebase, or reuse an active implementation worktree merely because its branch is named in a document.

A safe retrieval pattern from an owned clone is:

```bash
git ls-remote https://github.com/HSpector1/The-Movies.git refs/heads/BRANCH
git -C /absolute/path/to/owned-clone fetch --no-tags origin SHA
git -C /absolute/path/to/owned-clone cat-file -e 'SHA^{commit}'
git -C /absolute/path/to/owned-clone show 'SHA:PATH'
```

The branch is a movable discovery pointer. The commit is the immutable evidence identity. Use the analogous private URL only when the account has Unity repository access; otherwise record the source-access limitation.

## 3. Know which application surface you are using

- `src/`, the bridge, and save/migration code are the authoritative TypeScript simulation and transport.
- The private Unity repository is the production presentation client for the accepted pair.
- The Three.js/Vite browser application in `ui/` is a reference and debugging surface. It is useful for bounded development checks, but it is not proof of the native player.
- A Unity screen, animation, movement, or enabled control is evidence of presentation only unless it consumes the exact TypeScript authority and accepted wire identity.

For browser-only work that is explicitly authorized:

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. Do not report this as a native-player run.

## 4. Native launch is an explicit, protected operation

Do not use `npm run play` as a cold-start check. On this campaign line its default profile is the user's durable Project: Studio profile.

Native launch requires all of the following:

- the current task explicitly authorizes launching the engine and Unity player;
- the exact compatible TypeScript and private Unity commits are checked out in owned worktrees;
- dependencies, generated consumer, protocol, projection, schema, and save compatibility are verified;
- the required macOS Unity player build already exists and is bound to those commits;
- no other session owns the target profile, bridge, supervisor, player, port, or proof process; and
- an isolated disposable or authorized profile copy is selected. Never use the Owner's durable original for onboarding or automation.

When an authorized task deliberately uses the packaged native route, select the isolated profile explicitly:

```bash
PROJECT_STUDIO_PROFILE_ROOT="/absolute/path/to/private-disposable-profile" npm run play
```

The profile directory must be dedicated to the run and private to the current user. The current task must also verify the script's sibling Unity-project expectation; the command name alone does not select an accepted product pair. Launching Unity, building a player, or copying a private profile requires separate task authority.

## 5. Validation routes already present

Choose the smallest route that covers the authorized change. Report what actually ran.

Focused TypeScript examples:

```bash
npx vitest run tests/declarations.test.ts
npm run test:core
npm run test:ui
```

Package and contract checks:

```bash
npm run test:bridge
npm run check:bridge-contract
npm run typecheck:bridge
```

The accepted campaign also defines `npm run check:bridge-contract:fixtures` and `npm run verify:bridge-contract-consumer`; the latter needs the authorized private Unity checkout or an explicit access limitation.

Full TypeScript routes:

```bash
npm test
npm run typecheck
npm run build
npm run audit:repo-hygiene
npm run audit:3d-assets
```

The private Unity repository's [accepted validation record](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6/EXPERIMENT.md) documents its full EditMode route with editor `6000.3.22f1`; the link requires authorized access. From an authorized Unity worktree, use the equivalent parameterized route below and do not add `-quit`:

```bash
"$PROJECT_STUDIO_UNITY_EDITOR" -batchmode -nographics -runTests \
  -projectPath "$PROJECT_STUDIO_UNITY_PROJECT" \
  -testPlatform EditMode \
  -testResults "$PROJECT_STUDIO_UNITY_RESULTS" \
  -logFile "$PROJECT_STUDIO_UNITY_LOG"
```

For documentation-only work, use changed-path allowlisting, a task-local link/commit/path verifier, instruction-consistency review, and `git diff --check`. The repository has no native Markdown link-check command, so do not invent or claim one. A full runtime suite is not required merely to validate Markdown unless the issued task says otherwise.

## 6. Evidence and handoff discipline

- Separate accepted product, active WIP, future planning, and historical evidence in every handoff.
- Cite immutable commits and exact paths; do not make another person's local filesystem the only retrieval route.
- Preserve exact IDs, save compatibility, deterministic seeded behavior, and TypeScript ownership.
- A blocked or inaccessible private source is a limitation, not a pass.
- Technical proof is not Owner acceptance. An active branch is not accepted until an actual acceptance/integration record says so.
- Do not implement a research or pre-readiness package without a newer explicit execution order.
