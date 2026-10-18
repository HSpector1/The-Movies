# Workflow implementation and validation

## Scope and authority

Owner authorized the sole existing Studio coordinator on 2026-10-18 to implement workflow
setup only, explicitly preserving the gameplay stop. No ownership blocker remains. The separate
builder stays parked. Base: `1e3e19161aaa4c57be4e0b2a94a6a3fc0654e862` on explicit
`refs/heads/wip/headless-program-20260916-ts`, not main. The local change is bounded to
instructions, selected instruction copies/licenses, setup helper/tests, archives and prompts.
Game source, runtime/package locks, candidates, runner/bindings and executable hooks are unchanged.

## Reused reference inspection

Prior handback inspection was reused after checking these refs had not changed:
agency workflow PR 1 `80fa6370c984a435d60b5743a178540bfa0bf1ee` (OPEN DRAFT), REA workflow
PR 1 `7a13181ed497aa043d97fabc71b67a85f51abc9e` (OPEN DRAFT), REA newer main
`8327f582765f525da3ef0886361793be7951c182`, SocialMedia main
`ae537139a52b7465cdad0ecde7c6664f1ead50d7` inspected last. Reused navigation, bounded
metadata, immutable pins, portable links and isolated-test ideas only. No private reference
prose, product rules or scripts were copied into Studio or executed. Draft workflows are not
adoption evidence. REA's synthetic matrix result establishes no Studio gameplay/Mac speedup.

## Installation and compatibility

Canonical instructions are in `.agents/skills`; eight individual relative `.claude/skills`
links point into this checkout. One `skill-sources.json` records pins, paths, upstream/local
hashes, licenses, adaptations, resource closure, trigger and both client routes. Ponytail uses
the already-installed 4.10.0 source pin rather than upgrading. Superpowers uses adopted 7.0.0.
Existing Claude differential-review 1.1.4 and pr-review-toolkit source routes are preserved.
The existing standalone Codex Ponytail differs from the repository copy; its hash and the
explicit-path conflict resolution are recorded without altering it. The differential-review instruction/reference copy remains CC-BY-SA-4.0 with its license;
pr-review-toolkit references retain Apache-2.0; Ponytail and Superpowers retain MIT notices.
No vendor hooks, agents, servers, global settings or plugin installation are bundled.

Same-name global Codex Ponytail and user Claude namespaced Ponytail/Superpowers/review plugins
remain installed and unmodified. Global handoff is reused optionally; manual repository resume
instructions remain sufficient. Choose the explicit repository path to avoid loading two routes.
Codex has default project-doc size/fallback settings on this host; no applicable root override
was found. Its existing user AGENTS handoff instructions remain applicable. No root
CLAUDE.local.md or parent CLAUDE.md was found. Fresh-client testing must distinguish the native
shared paths from the existing plugin namespaces.

## Focused tests and preservation

The standard-library helper has 22 isolated tests, all PASS after correction of one fixture
assertion for macOS `/var` versus `/private/var` alias resolution. Original first run:
18 tests, 17 PASS, 1 fixture assertion FAIL; no production helper failure. Final test command:
`python3 -I -B -m unittest discover -s scripts/tests -p 'test_studio_workflow_setup.py' -v`.
Tests cover repeat apply without downloads, missing prerequisites, immutable pins, tampering,
referenced-resource closure, modified/extra files, conflicting/dangling links, symlink escape,
path traversal, interrupted staging, partial publication/recovery, metadata limits, lock
refusal and honest exits/readiness. They use synthetic isolated fixtures, never game assets.

Actual local apply verified all selected instruction hashes and created eight relative links;
no missing instruction download was needed. Check/apply exit 0 certifies only instruction
integrity. Runtime and fresh-client discovery are explicitly separate. Actual repeat apply returned instruction_integrity true with no missing/mismatched paths;
plan listed zero downloads. The five sampled package metadata versions matched package-lock.json;
this is bounded metadata evidence, not full dependency integrity or runtime smoke. No universal setup-ready flag is saved.

Exact entry archives preserve root depth and historical relative references:

| Archive | SHA256 |
| --- | --- |
| HANDOFF-through-workflow-20261018.md | `3c52b0a761296be7d5888afcc75846f4caedf971f685a2feb13f9323b3427bb3` |
| CLAUDE-before-shared-workflow-20261018.md | `e9445ef93bc5f7c0dc67dd96fdbba6be048c8e6314343f6c5dd5ff22e3be1928` |

AUTO block SHA256 at entry: `c3517bd45e78134cb0315d548e97ce8b46e76f4afdcf056b98ca1ac5aa5d5cb9`.
The shortened handoff preserves its exact bytes and the full remaining-requirements table;
protected anchors remain present. Other moved historical headings use the same fragment on
the root archive, as explicitly mapped by the current handoff. The archive is not startup reading.
Current relative links/frontmatter are checked separately from historical prose. The prior
hook chain and executable hook files are unchanged; no runtime launch tests were needed.

## Machine-local limits

Observed for this checkout: Darwin x86_64, Python 3.14.4, Git 2.37.1, shell PATH Node 22.23.2,
npm 10.9.8, Claude Code 2.1.126, Codex CLI 0.162.1. The game still requires the admitted
Node 20.20.2 route; that executable already exists and was not changed. The newer shell Node
is reported MISMATCHED for the game, not silently accepted or upgraded. No credentials,
private configuration or process inventory is published. Version observations are not readiness.

R6 runner `91accb1fd9aa2f779e88277528547d880edac6ee7425d004e5a74e9e75ee25f8`, bindings
`c03d09d1ac763449b465d99a0ddb1213f6c1bd62250ee3e3d038622854a0a0db`, selection
`b4cf712bd6d93de29aba70ed68900a269f28a3abe437d524959eb0221ea9848a` and pins file
`402757ed17460e517cf1b25b83a37cfe23098b69d30cf781aeeaa899048c9cf2` were rechecked.
K/p16 remains at base `2c3024e203abec74db95b8c01334723f10595ed2` with 200 staged paths
and only its HANDOFF metadata unstaged. Those observations do not requalify candidate bodies.
R6 freezes K/p16 HANDOFF at launch; this setup does not edit it. Future runners binding
production HEAD/index/HANDOFF/instructions/scripts require independent prospective reconciliation
before execution. Do not change old binding hashes or historical receipts to match setup.

## Startup measurement and focused review

At the trial snapshot, baseline mandatory root content (old CLAUDE + HANDOFF) was 190,313 bytes /
19,290 whitespace words. Shared AGENTS + thin CLAUDE + current HANDOFF was 25,385 bytes /
2,592 words, including the unchanged 9,171-byte requirements table. Before publication, root content measured 25,777 bytes / 2,643 words;
the trial input hashes are in workflow-trial-snapshot.json.
Conditional WORKFLOW/lesson/skill reads are additional. These are content-size observations,
not measured token savings, orientation time or gameplay/development speed improvements.
The next three normal slices use only the small measurement row in WORKFLOW, with no scheduler.

One focused coordinator read-only review covered instruction precedence/pause, source provenance,
resource closure, downloader path/integrity/overwrite boundaries, error exits, synthetic coverage
and scope. Its actionable findings were: correct a canonical lesson fragment; distinguish the
macOS temporary-path alias in the test; report runtime metadata separately; preserve unexpected
instruction resources; and use explicit skill paths when Glob omits links. All were corrected. Final error-boundary checks also reject non-instruction payloads and
keep malformed runtime metadata separate from verified instruction integrity.
This is coordinator review, not a claimed independent engineering review or reviewer swarm.
Independent game test/review ownership remains unchanged.

## Fresh-client routing trials

The actual native CLIs were invoked sequentially with existing subscription authentication;
no API key was supplied, credentials copied, active session restarted or client installed.
No game provider, shell build/test, worker, engine or server was launched by the trials.
Raw invocation/event logs remain LOCAL in the coordinator's bounded scratch evidence directory.
The published workflow-trial-snapshot.json records exact input hashes (including the limited
instruction changes before the final activation check). Later receipt/inventory metadata is
not retroactively called a tested snapshot.

**Codex CLI 0.162.1:** `codex exec --ignore-user-config --sandbox read-only --ephemeral --json`
from this checkout with the three-scenario prompt. Ignoring user config avoided configured MCP
server startup; existing ChatGPT login remained in use. Native catalog exposed all eight repo
skills. Explicitly read HANDOFF, AGENTS, WORKFLOW, LESSON_MAP; studio-workflow,
systematic-debugging, verification-before-completion and studio-review bodies; bounded canonical
E–H and handoff lesson excerpts; validation/setup instruction and named lane/runner excerpts.
It correctly identified current200, sole workflow ownership, pause, conditional game sequence,
swallowed assertion/timing lessons and optional versus required tool handling. One search was
excessive/truncated; no source or index change resulted. It emitted turn.completed, but the
child did not exit by the 55-second subprocess bound and was terminated. Therefore routing
response and automatic discovery are OBSERVED; clean CLI shutdown remains UNVERIFIED.

**Claude Code 2.1.126:** project-only settings, empty strict MCP configuration and
`--no-session-persistence` avoided user SessionEnd hooks and providers without modifying the
installed hook chain. First trial used `--permission-mode plan --tools Read,Glob,Grep`; it
advertised all eight skills but attempted a plan-file workflow and timed out at 55 seconds.
Second used `--permission-mode dontAsk --effort low` with those read tools and exited 0.
It read HANDOFF/WORKFLOW/LESSON_MAP and reported the correct task/pause/lesson route, but falsely
inferred that .claude/skills was empty from a Glob and never loaded a skill body. This failure
is preserved; it is not a dual-client readiness pass.

A narrow third check retained `Skill` as well as Read/Glob/Grep, kept the same 55-second bound,
and exited 0. It explicitly loaded the studio-workflow body by Read (no Skill invocation was recorded),
and read both
`.claude/skills/studio-workflow/SKILL.md` and `.agents/skills/studio-workflow/SKILL.md`, and
read current HANDOFF. AGENTS/CLAUDE were loaded through project instruction context. It reported
matching bodies, the Owner pause and correct selection of an already-installed pinned Node
rather than installation. Its model-visible catalog named the four Studio/adapted routes;
native initialization advertised all eight, with only studio-workflow explicit body loading tested; native Skill-tool activation remains
unverified.
The parent independently verified all eight link targets and content identities.

Exposed usage is retained as observation, not startup-token measurement: Codex completed event
input 267,765 / cached input 236,160 / output 1,749; Claude second result input 9 / cache-create
37,477 / cache-read 130,695 / output 2,206; third input 6 / cache-create 35,362 / cache-read
24,698 / output 1,352. Cache fields overlap context accounting and are not added into a savings
claim. Timeout-only first Claude trial has no completed usage result.

**UNVERIFIED:** default full user/plugin/IDE profiles, clean Codex CLI exit, every optional skill
body activation, a genuinely new machine, native/browser/platform game smoke and Owner acceptance.
Restricted CLI evidence does not certify those surfaces. No client restart or paid API setup
is needed merely to change this label.

Exact remaining default-profile check, at a future idle authorized client boundary: open the
reviewed checkout in the normally authenticated Claude or Codex client, without restarting an
active run. Give this prompt: "Read-only discovery: list auto-discovered repo skills; read current
HANDOFF and studio-workflow, find current task/candidate/owner/pause/next action, route a swallowed
assertion or over-budget PASS to its existing lesson/regression, and distinguish a missing optional
tool from a PATH mismatch with an existing pinned runtime. Do no setup or game work. List actual
reads and distinguish automatic discovery from explicit loading." Keep provider/worker launch
unavailable and preserve hook-owned AUTO changes through the normal safe process. Record client/
version, exact HEAD/snapshot, read paths and outcomes; use existing subscription authentication.

## Publication and adoption

**ADOPTED by the sole Owner-authorized coordinator at an idle boundary.**
Core implementation: `c6cd29ee1c6c27c7f91a05e0889be0ce123b1593`.
Reviewed publication head: `33066c12aff569803e010728da9aa24b4cd36abf` on
`chore/studio-shared-workflow-20261018`.
[PR 18](https://github.com/HSpector1/The-Movies/pull/18) merged normally into
`wip/headless-program-20260916-ts` as `84943cabbdae298a4a3acfbdc0a53435717e54c3`
at 2026-10-18 17:49:45 UTC. Explicit ls-remote matched the workflow head before merge,
PR state is MERGED, and explicit target advertisement matched the merge commit afterward.
This checkout was fast-forwarded without a branch switch, worktree copy or discarded work.
The containing final receipt commit updates only HANDOFF and this validation record; identify
its exact SHA through Git rather than attempting a self-referential hash in its own content.

Exactly 43 changed paths are listed in WORKFLOW_CHANGED_PATHS.txt. Staged whitespace, current
relative links/anchors, eight frontmatters, all 20 instruction/license hashes, archive/table/AUTO
identity and unchanged gameplay/package locks/hooks passed. Focused tests: 22 PASS, no skips.
Instruction setup is locally installed and integrated on the explicit working ref. Restricted
fresh-client observations above are verified only to their stated scope, not default IDE/plugin
or new-machine/runtime readiness. Gameplay remains PAUSED; canonical-62 is still unrun.

Existing TypeScript validation started automatically on push/PR; no remote job was manually
dispatched or cancelled. Those optional runs were still pending at adoption. The working branch
has no required status-check protection; normal `gh pr merge --merge --match-head-commit` was
used without administrator, force, auto-merge or policy bypass. No CI pass, P16/runtime/player
qualification or acceptance waiver is claimed. No background polling is scheduled. All required
focused workflow checks completed; broader game gates remain at their existing milestones.

Publication does not lift the Owner pause. The one next-session instruction is in
NEXT-SESSION-PROMPT.txt; separate new-machine check/plan/apply instructions are in
NEW-MACHINE-SETUP.txt. No further setup maintenance or gameplay action is automatic.
