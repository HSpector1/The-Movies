# Studio workflow

## Normal resume

Read AGENTS.md and current HANDOFF, inspect the named lock/run and Git metadata with the
required safe flags, and reconcile actual ownership/candidate/pause. Choose one route below,
read its LESSON_MAP sources and skill by explicit path, and perform the next authorized action.
No automatic installation, broad archive reading, full-suite rerun or skill-use forms.
The current Owner gameplay stop remains; setup completion does not permit generation or play.

| Task | Read / skill | Verification selection |
| --- | --- | --- |
| Resume, checkpoint or stop | `studio-workflow`; current HANDOFF and relevant active lessons | Metadata and exact publication only; no game preflight just for orientation |
| Persistence, money, ownership | LESSON_MAP persistence route; `ponytail`; `systematic-debugging` for failure | Nearest core complete file, affected save readers and transaction boundaries |
| Input, focus, visible player behavior | LESSON_MAP input route; `studio-playtest` | Existing journey, focus regression, actual screenshots/input at authorized platform gate |
| Scene/resource lifetime | LESSON_MAP lifetime route; `studio-playtest` | Existing scene lifecycle complete file and affected close/reopen journey |
| Compiler, Bridge, schema | LESSON_MAP Bridge route; `systematic-debugging` | Affected compilers, canonical generation/checks and complete consumers at the existing milestone |
| Harness, performance, continuation | LESSON_MAP harness route; `systematic-debugging` | Original budgets, full affected files; keep assertions/timing/exclusivity separate |
| Review / completion | `studio-review`, matching differential or Ponytail review references; `verification-before-completion` | One stable read-only pass and one actionable findings list; no reviewer swarm |
| Instruction setup/repair | This setup section and source inventory | Bounded helper and isolated tooling tests only |

Skills live in `.agents/skills/NAME/SKILL.md`; Claude uses individual relative links under
`.claude/skills`. Read only selected bodies/references. Instructions here override generic
skill suggestions to plan again, request repeated approvals, delegate, install services or
run a broader suite than the current order allows. Ponytail full is default unless Howard
opts out; its complexity review never replaces correctness or player verification.

## Verification and review

Cheap focused checks during edits; affected complete files for slice verification; required
broad gates at their existing milestones. Preserve original failures, downstream unreached
assertions, source/test ownership and inherited timing budgets. Do not extend timeouts or
remove end-to-end journeys to claim improvement. Any matrix optimization is a separate bounded
change proving policy combinations and lifecycle coverage. The REA synthetic patch is not used.

Actual game commands come from package.json and the admitted checkpoint runner, not a generic
skill: `npm run test:core`, `npm run test:ui`, `npm run test:bridge`, `npm run typecheck`,
`npm run typecheck:bridge`, `npm run check:bridge-contract`,
`npm run check:bridge-contract:fixtures`, and relevant existing browser/native harnesses.
These are entrypoint names, NOT permission to bypass the sole lane or paused game order.
Heavy execution requires the current HANDOFF preflight/lane and freeze through independent audit.
Never execute an archived one-shot runner as a reusable launch command.

At an authorized milestone, review a stable candidate and its actual evidence read-only.
Inspect changed callers/consumers and regression adequacy; record one list of consequential
findings with location, symptom and correction. Preserve independent test ownership. A second
opinion is for a consequential dispute. Engineering correctness, visible play, native/browser/
platform evidence and Owner acceptance must be reported separately.

For each future slice use ONE small acceptance record in the existing checkpoint:

```text
Behavior / actual candidate:
Changed dependencies / affected owners:
Focused checks / complete files / required broad gate:
Required player journeys and platform evidence:
Reused evidence: identity, scope and why unaffected:
Invalidation conditions / original failures / remaining uncertainty:
```

For the next three normal slices only, add a compact measurement row to that same record:
orientation reads/time; repeated lookups; required/repeated verification; blocked time;
late regressions; actual player-facing progress. Use tokens only if the client exposes real
counts. No benchmark claim, extra register, scheduler or recurring monitoring job.

## Explicit setup or repair

Prerequisite for this helper: already-installed Python 3.10+ standard library and the intended
owned checkout at an idle, non-frozen boundary. Missing Git/Python/client needs an Owner-visible
bootstrap step, not an implicit installer. Optional clients or tools do not block other work.

```sh
python3 -I -B scripts/studio-workflow-setup.py --check
python3 -I -B scripts/studio-workflow-setup.py --plan
python3 -I -B scripts/studio-workflow-setup.py --apply --select all
# Or select just one missing route, e.g. --apply --select ponytail
python3 -I -B -m unittest discover -s scripts/tests -p 'test_studio_workflow_setup.py' -v
```

CHECK performs bounded local hash/link inspection and version-only probes, with no network,
provider/engine launch or configuration writes. It separates missing, mismatched and unverified.
It does not inspect private saves/assets or credentials. stdout includes the local checkout
path; keep raw host observations private, not in published receipts.

PLAN gives exact missing pinned sources, byte estimates, destinations, links, conflicts,
prerequisites and side effects without downloads/writes. A complete Git checkout already
contains the selected instructions; typical apply downloads zero bytes and only repairs links.
APPLY requires an explicit selection, stages/verifies every missing unmodified upstream file,
then exposes files and portable links. Original/adapted instructions must be restored from
the reviewed Git version manually if missing. Modified files, unrelated links, unsafe paths
and a recorded run/lock cause refusal. A late/partial write failure is not rolled back over
other work: keep the accurate partial state, run check/plan and reconcile it. No ready flag
is written. Repeated apply uses matching bytes without downloads.

Exit 0 for check/apply means selected instruction integrity only; 1 means incomplete inventory;
2 means unsafe/malformed/conflicting operation or failure (argparse also uses 2).
Plan may exit 0 while listing repairable missing downloads/links; it is not a readiness claim.
Runtime readiness and fresh client discovery always remain separately unverified by this helper.

### Runtime restoration is separate

Use package.json/package-lock.json as the only JavaScript dependency inventory. The admitted
P16 lane uses Node 20.20.2; an available newer Node is not an upgrade instruction. A PATH
mismatch alone is not a missing installation: select an already-installed compatible runtime
first. Do not restore dependencies or request downloads when existing pinned tools/bytes match. Detect OS,
architecture, checkout and tool identities again on a new machine. Do not copy node_modules,
credentials, old native executables or the old Python environment. Resolve original local
candidate/evidence prerequisites explicitly; an absent fixture is not permission to invent it.

If a genuinely new machine needs runtime restoration, present one exact plan and ask once for
the additional runtime downloads/configuration changes. After authorization use the existing
pinned Node/npm and lockfile-based `npm ci` procedure, restore only the applicable documented
Python environment and approved browser/native prerequisites, then run the real applicable
smoke through the existing resource/lane rules. Owner gameplay pause still controls execution.
This instruction helper neither installs runtimes nor certifies game readiness.

## Client loading and overrides

Official docs checked 2026-10-18: [Codex skills](https://developers.openai.com/codex/skills/),
[Codex AGENTS](https://developers.openai.com/codex/guides/agents-md/),
[Claude skills](https://code.claude.com/docs/en/skills),
[Claude memory](https://code.claude.com/docs/en/memory).
Codex scans repository .agents/skills; symlinked skill folders are supported. Same-name skills
can both appear rather than merge. AGENTS.override.md takes precedence within its directory;
deeper instructions and configured fallback names matter. The usual project instruction cap
is 32 KiB; this entrypoint keeps detail in explicitly read task references.
Claude supports individual skill-directory symlinks and `@AGENTS.md` import. Parent memory,
CLAUDE.local.md, path rules and plugin/user/project precedence remain applicable. Codex does
not execute Claude imports, hooks, path rules, agent YAML or plugin preload declarations.
A Glob may omit symlinked directories even when the client initialization discovers them.
Do not diagnose a missing skill from that Glob: explicitly read its canonical SKILL.md, or
read the individual Claude link. In a constrained trial retain the Skill tool to test activation.
Neither file presence nor a subagent trial proves a fresh CLI/IDE session loaded the skill.

Existing user handoff, Codex Ponytail and namespaced Claude Ponytail/Superpowers/review plugins
are preserved. Prefer one explicit repository path for this task when a same-name route appears;
no global settings are rewritten. Plugin versions/source routes are in the single inventory;
local discovery limitations and exact remaining trials are in WORKFLOW_VALIDATION.

## Optional references — never auto-install

| Reference | Concrete trigger / scope |
| --- | --- |
| Official Godot examples; GUT/gdUnit4 | Separately authorized Godot work only; not Studio's current TypeScript runtime |
| fast-check techniques | Simulation-invariant/property-test design; no dependency installation in this setup |
| GDScript toolkit | A relevant authorized Godot workflow; not this TypeScript setup |
| Unity MCP / GameCI | Future authorized Unity capability evaluation only; no server/CI installation here |

REA remains outside active Studio setup. Reference workflow documents grant no binary-analysis
permission and introduce no REA/Ghidra/Wine, restricted assets or decompilation.
