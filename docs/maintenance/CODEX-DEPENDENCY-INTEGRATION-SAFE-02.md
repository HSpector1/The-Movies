# Codex Dependency Integration Safe 02

Date: 2026-08-24

Branch: `codex/dependency-integration-safe-02`

Exact base SHA: `c902a704eb948cc576083d0973c8c23e59937dc1`

Exact dependency-state SHA: `9702df8c5cf35d6befc0762c850562182e1953b6` (the validated three-file candidate; this report is added separately)

## Disposition

**READY FOR INTEGRATION REVIEW**

The five previously safe updates remain compatible when combined. No install, dependency-tree, type, contract, test, build, artifact-graph, or workflow interaction regression was found.

## Combined candidate updates

| PR | Dependency | Version |
|---:|---|---|
| [#8](https://github.com/HSpector1/The-Movies/pull/8) | `actions/setup-python` | 6.3.0 → 7.0.0 |
| [#9](https://github.com/HSpector1/The-Movies/pull/9) | `actions/setup-node` | 6.5.0 → 7.0.0 |
| [#10](https://github.com/HSpector1/The-Movies/pull/10) | `actions/checkout` | 6.1.0 → 7.0.1 |
| [#12](https://github.com/HSpector1/The-Movies/pull/12) | `esbuild` | 0.25.12 → 0.28.2 |
| [#14](https://github.com/HSpector1/The-Movies/pull/14) | `@types/react` | 19.2.17 → 19.2.18 |

Excluded versions remain unchanged: `vite-node@2.1.9`, `@vitejs/plugin-react@4.7.0`, and `typescript@5.9.3`. PRs #11, #13, and #15 are not present.

## Scope and changed paths

- `.github/workflows/bridge-contract.yml`: three independently reviewed action pins only.
- `package.json`: direct `esbuild` and `@types/react` requirements only.
- `package-lock.json`: exact combined PR #12 lock state plus PR #14's four lockfile replacements.
- `docs/maintenance/CODEX-DEPENDENCY-INTEGRATION-SAFE-02.md`: this evidence report only.

No campaign, Unity, gameplay, presentation, simulation, economy, save/RNG, Golden-tag, or `main` content was changed. No Dependabot branch or PR metadata was changed.

## Remote and workflow verification

Remote truth was checked before branching: `main` was still `c902a704eb948cc576083d0973c8c23e59937dc1`, and completed triage branch `codex/dependency-triage-01` was still `cdd7ec5cfc304f3ba9196d31bd5091a7229dfb5e`. All eight expected Dependabot PRs remained open, bot-authored, and targeted at `main`.

The combined workflow parses as YAML and `git diff --check` passes. The full pins match upstream tags:

- setup-python v7.0.0: `5fda3b95a4ea91299a34e894583c3862153e4b97`
- setup-node v7.0.0: `820762786026740c76f36085b0efc47a31fe5020`
- checkout v7.0.1: `3d3c42e5aac5ba805825da76410c181273ba90b1`

Triggers remain `pull_request` and `push`; permissions remain `contents: read`; checkout retains `persist-credentials: false`; no secrets, registry authentication, or privileged trigger was introduced. Existing Node, Python, and cache inputs remain supported. The actions' Node 24 runtime floor is compatible with GitHub-hosted runners; an outdated self-hosted runner would remain the only operational caveat.

## Dependency-tree result

Validation environment: macOS arm64, Node 26.3.1, npm 11.16.0; npm 10.9.8 was also used for CI parity.

- Native `npm ci`: pass, 207 packages installed.
- `npm@10.9.8 ci`: pass, 207 packages installed; lock SHA remained `e1a7e5f95259b92916dba1fc8aae7cefde87feccff0d5e7a350bac2fa9ce7c12` before and after.
- `npm ls --all`: pass. Lock-only full-tree audit reports zero problems and no invalid peers.
- Runtime audit: zero vulnerabilities. The five dev-tree findings (3 moderate, 1 high, 1 critical) are unchanged from baseline.

The lock contains 326 package entries versus 299 at baseline. Its `+596/−112` line delta is exactly PR #12's `+592/−108` plus PR #14's `+4/−4`. The only version changes are direct esbuild and its 26 platform packages at 0.28.2, plus `@types/react@19.2.18`. Vite 6.4.3 correctly retains a nested esbuild 0.25.12 tree because its `^0.25.0` range excludes 0.28; Vitest/Vite 5 retains esbuild 0.21.5. No Vite, Rollup, Vitest, React runtime, or other package version changed.

## Validation matrix

| Gate | Unchanged base | Combined candidate |
|---|---:|---:|
| Native npm install/tree | Pass | Pass |
| npm 10.9.8 CI-parity install | Pass | Pass |
| Root `tsc --noEmit` | Pass | Pass |
| UI `tsc -p ui/tsconfig.json --noEmit` | Pass | Pass |
| Bridge typecheck | Pass | Pass |
| Bridge contract drift check | Pass | Pass |
| Bridge proof | Not needed for attribution | Pass |
| Focused bridge tests | Covered by full baseline | 12 files / 116 passed |
| Focused UI tests | Covered by full baseline | 192 files / 2,595 passed / 5 skipped |
| Browser production build | Pass, 232 modules | Pass, 232 modules |
| Studio emitted build | Pass | Pass |
| Packaged Studio graph audit | Pass | Pass |
| Packaged CLI `--help` smoke | Pass | Pass |
| Repository hygiene / 3D asset audit | Pass / 26 assets, 0 violations | Pass / 26 assets, 0 violations |
| Complete repository suite | 337 files / 4,542 passed / 5 skipped | 337 files / 4,542 passed / 5 skipped |

The same-environment unchanged base was rerun from a detached `c902a704` worktree. Both runs retained the known non-fatal React `act(...)`, jsdom canvas, and >500 kB chunk warnings. No historical Living Lot failure reproduced, and no test was changed or weakened.

## Artifact comparison

Browser output is byte-identical across every file. Both trees have aggregate manifest hash `90d1dc26a5135508e6dc3ccb0e1f114de3a70e3df2bdff05a00ee035aeb7a6b3`.

| Artifact | Base bytes / SHA-256 | Candidate bytes / SHA-256 |
|---|---|---|
| `studio.mjs` | 114,142 / `24c7597d6f85a2ccdbb16ee8a81fd1f79e68b9bad10b7817b23f9d3ccbb93ae5` | 114,234 / `96acf2bddd453bdcc8e9ceb23093a430420f8749a7e086a675f0428e4e81c50e` |
| `engine.mjs` | 1,020,266 / `cf2624bb0727e465a538c5238623e75dc64c381690ef816b3d3f019f083b73fd` | 1,020,395 / `dd961cdce8b368d1579144a3c4851ddb20fe7860d948a104f565e0c8ef409f13` |

The candidate Studio sizes and hashes exactly match the isolated PR #12 evidence. The packaged audit still finds 78 first-party inputs and permits only first-party modules plus Node built-ins. The CLI smoke and complete tests pass, so the Studio byte drift is attributable to the approved esbuild emitter update rather than an interaction or bundled dependency change.

## Interaction finding

No combination-specific behavior was observed. The action changes are workflow-only, the React types patch passes the whole type/test surface, and direct esbuild affects only the expected Studio emission path while Vite keeps its compatible nested compiler. The five-update candidate therefore satisfies the fail-closed rule and is ready for normal integration review; it has not been merged.
