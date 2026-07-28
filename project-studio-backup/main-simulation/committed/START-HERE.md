# Project: Studio — Start Here

A studio management sim, spiritual successor to *The Movies* (2005). Private project.

## Two folders

```
studio-project/
├── studio/           ← OPEN THIS in VS Code
└── design-archive/   ← reference only, NEVER opened in VS Code
```

Claude Code reads everything in the workspace you open. If it can see the design
archive it will build systems that are deliberately a long way off. **Open `studio/`.**

## Setup

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

## Two undo buttons

- **Rewind** — hover any message → rewind → "Rewind code to here". Reverts the file
  changes, keeps the conversation. Use for "no, not like that."
- **Git** — for whole sessions. Just say *"commit my changes with a descriptive message."*

## What's happening right now

**M0A.** A headless simulation harness. Nothing is playable yet, on purpose. Its only
output is a report telling you whether the game's core maths produce interesting
decisions. Everything downstream depends on that answer.

The agent works autonomously through the whole M0A loop — implement, run, read flags,
tune, re-run — and stops before building any UI. That stop is where your judgment is
needed, not the model's.

**Expect failing tests.** The numbers in the contract are first guesses. §15 tests
failing is the instrument working, not a broken build.

## Where things are

| Path | What |
|---|---|
| `studio/docs/build-contract.md` | the spec being implemented now |
| `studio/CLAUDE.md` | standing instructions, read automatically each session |
| `ROADMAP.md` | the whole staged plan, M0A → M1A → M0B → V1 |
| `design-archive/design-spec.md` | why the design is what it is |
| `design-archive/next-contracts/` | what gets built after M0A, numbered in order |
