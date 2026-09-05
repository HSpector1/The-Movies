# Current Ops review — agent onboarding repair 02

Status: **REPAIR CANDIDATE PUBLISHED — LANDING AND ACTIVATION PENDING**

This follow-up closes only Codex repository-instruction discovery. It adds no product law or implementation permission and does not revise the repaired Claude roles. Revision 01 remains preserved as historical evidence.

> **Do not merge `docs/agent-onboarding-repair-01` wholesale into `main`.** The branch descends from accepted-campaign history that is absent from `main`. Current Ops must choose one complete, target-specific Revision 02 patch and revalidate the target at landing.

## Instruction-discovery finding

The reviewed candidate `a934cf944af6a8c3ab734f6b03430eb43f11fb86` did not have a portable Codex entry point. It contained no `AGENTS.md`, `AGENTS.override.md`, nested equivalent, or repository `.codex` fallback configuration. Root `CLAUDE.md`, `START-HERE.md`, and Markdown links are not default Codex instruction-discovery mechanisms.

The [official OpenAI AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/) was consulted on 2026-09-05. It documents that Codex builds the instruction chain once at startup, checks global instruction files, then walks from the Git root to the working directory and selects at most one `AGENTS.override.md`, `AGENTS.md`, or configured fallback per directory. A linked document is not injected merely because it is linked.

Revision 02 therefore adds one root [AGENTS.md](https://github.com/HSpector1/The-Movies/blob/f942fffa16d41f5fa9d80a2611da8ea0105141e3/AGENTS.md). The built-in startup diagnostic found that exact entry automatically. Independent fresh CLI sessions then opened the shared guide and correctly explained the task-authority boundary in the candidate and both target overlays.

These are three separate findings:

1. **Automatic entry-file discovery: PASS.** The exact `# Project: Studio — Codex Entry Point` marker appeared once in each model-visible startup input before a model session ran.
2. **Following the entry: PASS.** Each fresh session's event stream records a successful read of `docs/agent/SHARED-AUTHORITY-GUIDE.md`.
3. **Task-boundary understanding: PASS.** Each final response said the neutral request was read-only, named the required issued authorization/base/owned worktree/allowed paths/scope/validation/stop condition, protected main/campaign/WIP/profile/processes, and rejected research, pre-readiness, draft prompts, technical KEEP, and branch pointers as implementation authority.

## Minimal candidate change

Repair-content identity: `f942fffa16d41f5fa9d80a2611da8ea0105141e3` (tree `6767f5966488c4d95828ac2516877eeec1a3aae6`). The added file has Git blob `a3e78fa3be1c543395ad2bb63240ac84f62b6490` and SHA-256 `1ac2bf6359b027bf8488e1c6eb7eccf916a73f115eee49e286884b98812a1b7c`.

```markdown
# Project: Studio — Codex Entry Point

Before working, read `docs/agent/SHARED-AUTHORITY-GUIDE.md`.
Use `START-HERE.md` and
`docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md`
to resolve repository orientation and exact source references.

This file is a discovery entry point, not a separate authority.
Only the current issued task authorizes changes.
Follow its assigned repository, base, branch, path, and process boundaries.
Research, pre-readiness, draft prompts, and branch pointers do not authorize
implementation. Resolve material conflicts through the shared guide.
```

The complete Revision 02 landing allowlist is the Revision 01 repair plus root `AGENTS.md`, exactly 17 documentation/configuration paths:

```text
.claude/agents/contract-auditor.md
.claude/agents/instrumentation.md
.claude/agents/sim-core.md
.claude/agents/test-author.md
AGENTS.md
CLAUDE.md
README.md
START-HERE.md
docs/PACKAGES.md
docs/agent/SHARED-AUTHORITY-GUIDE.md
docs/history/agent-configuration/accepted-2753e18/CLAUDE.md.archived
docs/history/agent-configuration/accepted-2753e18/PROVENANCE.md
docs/history/agent-configuration/accepted-2753e18/agents/contract-auditor.md
docs/history/agent-configuration/accepted-2753e18/agents/instrumentation.md
docs/history/agent-configuration/accepted-2753e18/agents/sim-core.md
docs/history/agent-configuration/accepted-2753e18/agents/test-author.md
docs/operations/PROJECT-STUDIO-SOURCE-REGISTER-2026-09-05.md
```

No production code, tests, CI, dependencies, schemas, generated DTOs, saves, or Unity assets are in the payload.

## Revised landing artifacts

Artifact commit: `8c772d31e8cda13902858d001d5e76dda79c587c`.

| Target | Exact tested base | Complete Revision 02 patch |
| --- | --- | --- |
| Inspected `main` | `c902a704eb948cc576083d0973c8c23e59937dc1` | [PROJECT-STUDIO-ONBOARDING-REPAIR-02-MAIN.patch.gz](https://github.com/HSpector1/The-Movies/blob/8c772d31e8cda13902858d001d5e76dda79c587c/docs/operations/landing/PROJECT-STUDIO-ONBOARDING-REPAIR-02-MAIN.patch.gz) |
| Accepted campaign | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | [PROJECT-STUDIO-ONBOARDING-REPAIR-02-CAMPAIGN.patch.gz](https://github.com/HSpector1/The-Movies/blob/8c772d31e8cda13902858d001d5e76dda79c587c/docs/operations/landing/PROJECT-STUDIO-ONBOARDING-REPAIR-02-CAMPAIGN.patch.gz) |

Each archive is a deterministic 34,622-byte gzip with SHA-256 `2634802db3028fb766cf82aec274bc07de0294078e3e43c29992c7c0515cd69e`. Each decodes to a 108,928-byte unified patch with SHA-256 `0fbe85fc9e29acc356e9734c3faef4c36a48aa733dba8af2029085e27063ad23`. The payloads are byte-identical because all affected base blobs are identical or absent at both tested bases. They were nevertheless generated and applied against the two targets separately.

Revision 01's two archives remain unchanged at SHA-256 `6024fad82141a9b9871e7a43f43a445770ad388742f15e4c94bcefea79ff708d`, and its [handoff](https://github.com/HSpector1/The-Movies/blob/a934cf944af6a8c3ab734f6b03430eb43f11fb86/docs/operations/CURRENT-OPS-REVIEW-AGENT-ONBOARDING-REPAIR-01.md) remains historical. Do not reuse its 16-path patch or README-primed cold-review result as Revision 02 evidence.

## Client and machine conditions

- Tested client: `/Users/bruce/.local/bin/codex`, `codex-cli 0.153.2`; executable SHA-256 `195ace4100a634a9df39147f493e730e666b5bd87795f3c9f3251d8542400424`.
- `CODEX_HOME` was unset, so the default was `/Users/bruce/.codex`. Read-only inspection found no global `AGENTS.override.md` or `AGENTS.md`, no selected profile, and no `project_doc_fallback_filenames` or `project_doc_max_bytes` setting in the user configuration.
- The repository contained no nested override or fallback configuration. The actual sessions also used `--ignore-user-config`, `--ignore-rules`, an explicit empty fallback list, and a read-only sandbox. No global/user configuration was changed.
- A separate ChatGPT Desktop-bundled Codex binary reported `0.149.0-alpha.4.3`; it was not launched or tested. This CLI result is not generalized to the Desktop app, IDE extension, cloud client, another client version, or another machine.

The startup diagnostic form was:

```bash
/Users/bruce/.local/bin/codex debug prompt-input \
  -c 'project_doc_fallback_filenames=[]' \
  -c project_doc_max_bytes=32768 \
  'DIAGNOSTIC ONLY'
```

The diagnostic command does not offer `--ignore-user-config`; the read-only machine audit above established the relevant global state, and the two discovery keys were explicitly overridden. Raw model-visible prompt dumps were retained only in the isolated local evidence directory because they include unrelated client/session instructions; only hashes and filtered marker counts are recorded here.

| Tree | Identity before overlay | Prompt-input JSON SHA-256 | Entry marker | Full shared-guide marker |
| --- | --- | --- | --- | --- |
| Candidate content | `f942fffa16d41f5fa9d80a2611da8ea0105141e3` | `931ee155a53d11113631b2b8ba2f204fdf78acc32fff5f03b41d7cf1daea0495` | 1 | 0 |
| Disposable `main` overlay | `c902a704eb948cc576083d0973c8c23e59937dc1` | `6501c3a4091f8df7e4b16ea539226bb4774e82fcde4434fcd9eae795537512ef` | 1 | 0 |
| Disposable campaign overlay | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | `6bcdd57c91de36998ce6e1df62b100778727a5603c32c0fc20cf93a7a34059e5` | 1 | 0 |

The zero in the final column is expected: automatic discovery injects the entry file, not a Markdown link target. Reading the shared guide was tested separately in live sessions.

## Fresh-session verification

Three separate, non-resumed, ephemeral CLI sessions received only this neutral request:

> Without editing files or launching project processes, identify the repository instructions and task boundaries that apply to this session. Explain what authorization is required before making code changes.

Each invocation used the following form, with `TREE`, `EVENTS`, and `LAST_MESSAGE` set to the exact row below and standard input connected to `/dev/null`:

```bash
/Users/bruce/.local/bin/codex exec \
  --ephemeral \
  --ignore-user-config \
  --ignore-rules \
  --sandbox read-only \
  --color never \
  --json \
  -C "$TREE" \
  -c 'approval_policy="never"' \
  -c 'project_doc_fallback_filenames=[]' \
  -c project_doc_max_bytes=32768 \
  -o "$LAST_MESSAGE" \
  'Without editing files or launching project processes, identify the repository instructions and task boundaries that apply to this session. Explain what authorization is required before making code changes.' \
  </dev/null > "$EVENTS"
```

Evidence directory: `/Users/bruce/.codex/tmp/project-studio-repair-rev02-evidence.EUOQi0`.

| Session | Exact working directory / identity | Event JSONL SHA-256 | Final-message SHA-256 | Automatic entry | Shared-guide read | Boundaries |
| --- | --- | --- | --- | --- | --- | --- |
| Candidate | `candidate-content` / `f942fffa16d41f5fa9d80a2611da8ea0105141e3` | `9d0f56ce03603127d8f78fd605ad4219da2b9a7513a5f5b3a7bb7108c3b51e19` | `35c45dabf8e94a489be1b9c6afe3dca4bba9e2f7cc050873d8e210986fb27fbc` | PASS | PASS | PASS |
| Main overlay | `main-overlay` / `c902a704eb948cc576083d0973c8c23e59937dc1` | `fae2d5ee8f7fe6fdf6a9ce6ec00e1e8f155c08d5d499933769bbac18f1db6a48` | `ee2820c8d60949d5ea9d1554512302132a3005b37a6c3c910ed8c357cd5cafbc` | PASS | PASS | PASS |
| Campaign overlay | `campaign-overlay` / `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | `8c273098dbe29c57b494615c65444d96f00038fb3556f518d926b9a05a41126a` | `79d3d5a395a4911fd7bc13f9cdc258955c8e1f89334aef16468c7954676dc313` | PASS | PASS | PASS |

In every event stream, `cat docs/agent/SHARED-AUTHORITY-GUIDE.md` completed with exit code 0 before the final response. The sessions also read `START-HERE.md`, the source register, and repository instructions. No session was told to start at README, given this authoring conversation, resumed, or manually supplied `AGENTS.md`. Their only commands were read-only file, repository-identity, status, and discovery inspections. No tests, build, game, Unity, bridge, supervisor, HID, or profile process ran.

The macOS read-only sandbox caused non-fatal Git temporary-cache warnings; every recorded read command and session exited successfully. Candidate content remained clean, and both target overlays retained exactly their pre-existing 17 repair paths.

## Patch and repository validation

- Archive decode and deterministic hash: **PASS** for both Revision 02 artifacts.
- `git apply --check`: **PASS** independently at each exact target base.
- Actual disposable application: **PASS** at each target; exactly 17 allowlisted paths resulted.
- Post-apply byte identity: **PASS**; every resulting file blob matches repair-content commit `f942fffa16d41f5fa9d80a2611da8ea0105141e3`.
- `git diff --check`: **PASS** in both overlays and the candidate.
- `AGENTS.md` and shared-guide resolution: **PASS** in both overlays; no override file superseded the root entry.
- Target refs at `2026-09-05T20:03:43Z`: public `main` remained `c902a704eb948cc576083d0973c8c23e59937dc1`; `campaign/living-lot-ts` and `docs/p06-p07-owner-acceptance-closeout-01` remained `2753e18ba8fb5f65b936c22cde9531646fecc6cd`.
- Product/runtime validation: **not run and not applicable** to this documentation/configuration-only correction.

## Landing boundary

Current Ops' preferred window is after the combined P08–P10 candidate is preserved and its acceptance/integration boundary is resolved, and before the next implementation session. Current Ops selects the target and issues the landing order. Final target-ref and client-surface revalidation still belong to Current Ops.

`main`, accepted campaign refs, and active implementation refs were not moved. The candidate is not active merely because it is published. No P11/P12 implementation was started or authorized.

**REPAIR CANDIDATE PUBLISHED — LANDING AND ACTIVATION PENDING**
