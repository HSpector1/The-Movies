# Project: Studio — Start Here

> **Current-branch notice:** the setup/status narrative below describes the original M0A launch and
> is retained for provenance. It is not current authority for
> `operation-hollywood-autonomous-marathon`. Begin with `CURRENT-BEST.md`, `PROGRESS.md`,
> `DECISIONS.md`, `NEXT-HIGHEST-LEVERAGE.md`, `MARATHON-LOG.md`, and
> `AUTONOMOUS-MARATHON-HANDOFF.md`, then current Git. The game is now playable, SaveFileV11 is the
> current writer, and the Owner has ruled that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE**.

## Current launch

From this repository root:

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. Stop with `Ctrl+C` in the terminal that owns Vite.

Studio Lot and Operation Hollywood are adopted ordinary-player content and default on. If an old
QA session deliberately rolled either back, remove these two localStorage keys and reload:

```js
localStorage.removeItem('project-studio.flags.studio-lot-overview')
localStorage.removeItem('project-studio.flags.operation-hollywood')
location.reload()
```

The app is local and deterministic. For a clean checkout prefer `npm ci`; `npm install` is retained
above because it is safe for this existing worktree. The autonomous marathon is sealed; do not
begin a successor feature without fresh Owner authorization.

A studio management sim, spiritual successor to *The Movies* (2005). Private project.

## Historical: original two-folder setup

```
studio-project/
├── studio/           ← OPEN THIS in VS Code
└── design-archive/   ← reference only, NEVER opened in VS Code
```

Claude Code reads everything in the workspace you open. If it can see the design
archive it will build systems that are deliberately a long way off. **Open `studio/`.**

## Historical original setup — provenance only

Needs **VS Code 1.94+**, a paid Claude subscription (no API key), and **Node.js LTS**
from nodejs.org. Node is for the project, not for Claude — the extension bundles its
own CLI.

1. Put `studio-project` somewhere plain. Avoid OneDrive/Dropbox-synced folders.
2. **File → Open Folder → `studio`.** Not `studio-project`. The sidebar should show
   only `CLAUDE.md` and `docs/`. If you see `Downloads` or `Library`, wrong folder.
3. Install the extension: `Cmd/Ctrl+Shift+X`, search "Claude Code", Install.
   Open it with **✱ Claude Code** in the status bar, bottom-right.
4. Set Plan mode as default: `Cmd/Ctrl+,` → Extensions → Claude Code →
   **Initial Permission Mode** → `plan`.
5. In VS Code's terminal (`` Ctrl+` ``), once:
   ```
   git init
   git add .
   git commit -m "Build contract and agent instructions"
   ```

New session: the `+` at the top of the Claude panel, or `Cmd+Shift+Esc`.
`Cmd+Esc` toggles your cursor between the editor and Claude's prompt box.

Then paste the kickoff prompt (`KICKOFF-PROMPT.md`).

## Historical: original two undo buttons

- **Rewind** — hover any message → rewind → "Rewind code to here". Reverts the file
  changes, keeps the conversation. Use for "no, not like that."
- **Git** — for whole sessions. Just say *"commit my changes with a descriptive message."*

## Historical: what was happening at the M0A launch

**M0A.** A headless simulation harness. Nothing is playable yet, on purpose. Its only
output is a report telling you whether the game's core maths produce interesting
decisions. Everything downstream depends on that answer.

The agent works autonomously through the whole M0A loop — implement, run, read flags,
tune, re-run — and stops before building any UI. That stop is where your judgment is
needed, not the model's.

**Expect failing tests.** The numbers in the contract are first guesses. §15 tests
failing is the instrument working, not a broken build.

## Historical: where the M0A files were

| Path | What |
|---|---|
| `studio/docs/build-contract.md` | the spec being implemented now |
| `studio/CLAUDE.md` | standing instructions, read automatically each session |
| `ROADMAP.md` | the whole staged plan, M0A → M1A → M0B → V1 |
| `design-archive/design-spec.md` | why the design is what it is |
| `design-archive/next-contracts/` | what gets built after M0A, numbered in order |
