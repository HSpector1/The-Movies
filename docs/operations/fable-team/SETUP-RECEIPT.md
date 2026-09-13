# Fable agent setup — receipt

Prepared 2026-09-13 by an assistant-run SETUP ONLY pass from STUDIO-FABLE-AGENT-KIT.zip.
This is a configuration record, not a claim that delegation, models, or gameplay were exercised.

## Claude Code version and registration method

- Installed CLI: `2.1.270 (Claude Code)` (checked via `claude --version` in this session).
- Registration/reload mechanism per `docs/operations/fable-team/SOURCE-INDEX.md` and
  https://code.claude.com/docs/en/sub-agents: project-local Markdown files under
  `.claude/agents/` with YAML frontmatter, discovered as custom subagents. A session that was
  already running before these files existed will not pick them up — a fresh session started
  from this worktree is required to load them. Not yet independently verified as loaded; that is
  the deferred smoke-test step.

## Setup branch and base

- New branch: `chore/fable-agent-setup-01`.
- New worktree: `~/The Movies - Fable Agent Setup`.
- Explicit base commit: `06a852acdf58e2e02404efdfc980b0bf32ec54a9`
  (`docs/playability-r3-hybrid-execution-01`, repo `HSpector1/The-Movies`, remote `hspector-github`).
- Verified this is not silently `main`: created via `git worktree add -b chore/fable-agent-setup-01
  "<path>" 06a852acdf58e2e02404efdfc980b0bf32ec54a9` against the explicit SHA.
- Checked for newer configuration on the reference branch before use: `git ls-remote hspector-github
  refs/heads/docs/playability-r3-hybrid-execution-01` returned `06a852acdf58e2e02404efdfc980b0bf32ec54a9`
  — the remote tip equals the pinned reference exactly; nothing newer exists on that branch.
  The base commit was not present locally beforehand and was fetched with a normal single-branch
  `git fetch hspector-github docs/playability-r3-hybrid-execution-01` (existing remote, existing
  fetch refspec, no new remote/force-fetch/whole clone).

## Supplied paths installed (9)

- `.claude/agents/contract-auditor.md` (refreshed)
- `.claude/agents/sim-core.md` (refreshed)
- `.claude/agents/test-author.md` (refreshed)
- `.claude/agents/instrumentation.md` (refreshed)
- `.claude/agents/uiux-designer.md` (new)
- `.claude/agents/unity-ui.md` (new)
- `docs/operations/fable-team/FABLE-COORDINATOR.md` (new)
- `docs/operations/fable-team/SOURCE-INDEX.md` (new)
- `docs/operations/fable-team/TASK-TEMPLATE.md` (new)

Root `CLAUDE.md` was NOT copied from the kit. No `settings.json`/`settings.local.json`,
instructions, ignore rules, tests, lockfiles, or gameplay data were created or modified.

## Validation results

- Kit archive integrity: `shasum -a 256 -c SHA256SUMS.txt` — all 15 entries OK.
- `python3 validate_kit.py --worktree "~/The Movies - Fable Agent Setup"` (stdlib only,
  no install, no network, no Claude launch) —
  `STATIC VALIDATION PASS: 15 manifest entries; 6 agent definitions; 9 payload files.` /
  `Installed payload bytes match in the named worktree.` The script itself states what it does
  NOT test: Claude registration, effective model/tool resolution, delegation, game or native input.
- `git diff --check` on the four modified tracked profiles: clean, no whitespace errors.
- Confirmed unique agent names, exact expected model per profile (contract-auditor/test-author/
  instrumentation = sonnet, sim-core/uiux-designer/unity-ui = opus), auditor tool restriction
  (contract-auditor: `Read, Glob, Grep` only, no Bash/Write/Edit), and no `Agent`/`Task` (or other
  delegation) tool on any of the six.
- Confirmed no reference to the historical M0A phase cap in the six installed profiles (they
  explicitly disclaim it, e.g. sim-core: "No historical M0A phase cap").
- Confirmed the changed-path set is exactly the nine paths above — no production/settings/hook/
  lockfile/other-profile path touched (`git status --porcelain` in the setup worktree lists only
  those nine).
- Left everything unstaged (no `git add`, no commit, no push) per instruction.

## Collision / newer-file disposition and backup

- The four existing legacy profiles in the active gameplay checkout (`~/The Movies`, branch
  `gate-d-studio-lot-d1`) were byte-identical (`git hash-object`) to the SHA-1s recorded in
  `expected-legacy-blobs.json` for all four files. No local divergence, no newer local
  improvement, no conflict to resolve or report.
- Originals backed up before overwrite to a timestamped directory under this worktree's
  Git-private metadata (`.git/worktrees/<this-worktree>/fable-agent-setup-backup/<UTC-timestamp>/`),
  outside every auto-loaded `.claude/agents` tree; not copied into `.claude/agents` itself.
  Private path not published here; it exists and is retrievable from this worktree's own
  `.git`-resolved worktree metadata.
- Their Git history is untouched — nothing in this setup rewrites, rebases, or removes prior
  commits; the legacy versions remain reachable through ordinary repository history.
- Checked for duplicate agent names in nested project scopes and user-level definitions: only one
  `.claude/agents` directory exists in this worktree (the root one, no nested project agent dirs),
  and no user-level `~/.claude/agents/` directory exists at all. No duplicates found; nothing to
  preserve-in-place beyond what is already documented above.

## Model aliases and override presence

- Requested aliases: contract-auditor→sonnet, sim-core→opus, test-author→sonnet,
  instrumentation→sonnet, uiux-designer→opus, unity-ui→opus. None use `model: inherit`.
- Global user `~/.claude/settings.json` sets a session default `model: "sonnet"`; no per-agent
  override was found there beyond that global default. No project-level `settings.json` or
  `settings.local.json` exists in either the active gameplay checkout or this setup worktree
  (checked both), so there is no project-level model override file to report.
- **Effective runtime models are NOT VERIFIED YET.** Alias-to-version resolution on the actual
  account, and whether an environment-level policy silently substitutes a different model for any
  of the six, is unconfirmed until the smoke test actually invokes a subagent and the runtime
  reports (or fails to report) its effective model.

## Hooks and permissions

- No `hooks` key found in global `~/.claude/settings.json`.
- No project `settings.json`/`settings.local.json` exists in the active checkout or this setup
  worktree, so no project-level hook configuration exists to disable or conflict with.
- No hook policy was found that would prevent running this session with hooks inactive; nothing
  was changed under `~/.claude`, shell rc, global Git config, login/account, MCP config, or any
  hook configuration. `~/.claude`, parent-folder rules, and global settings were left untouched.

## Active implementation / ownership — unchanged

- `~/The Movies` remains on `gate-d-studio-lot-d1` at `889ae0e2`, verified clean
  (`git status --short --branch` shows no changes) before and after this setup ran.
- This setup created only new worktree/branch metadata (`chore/fable-agent-setup-01`) via ordinary
  `git worktree add -b`; it did not checkout, switch, stash, or reset the active worktree, and did
  not use automatic Claude worktree creation or an unverified default-`main` base.
- No gameplay build, test, runtime, or native input was run. No profile/campaign was accessed. No
  other worker was messaged. No PR, merge, or promotion occurred. No hook was installed.
- This configuration setup carries no gameplay authority and is not an authorization to begin the
  UI/UX overhaul or P13B/P14/P15/P16 program; that sequencing lives in
  `docs/operations/fable-team/FABLE-COORDINATOR.md` and requires its own separate Current Ops order.

## Fresh-session command (for the pending smoke test)

Run from a NEW terminal/session, not from this one and not from `~`, the kit folder, or another
game checkout:

```
cd "~/The Movies - Fable Agent Setup"
claude --model sonnet --permission-mode default --settings '{"disableAllHooks":true}'
```

Then paste the Owner-provided `02-SMOKE-TEST-PROMPT.md` contents. Approve only the setup/smoke
scope; do not select bypass-permissions or extra paid usage.

## Pending / not yet done

- One-agent (`contract-auditor`) read-only registration smoke test — deferred to the fresh session
  above, per the Owner-provided smoke-test prompt.
- Configuration publication/adoption into the actual active coordination checkout (committing this
  branch, and transferring it to whatever worktree Current Ops actually runs Fable from) — a
  separate, explicit later step, not performed here.
- Effective-model verification for all six aliases, and confirmation that Claude Code's current
  version actually delegates to a custom subagent by name rather than a general-purpose
  substitute — both deferred to the smoke test.
