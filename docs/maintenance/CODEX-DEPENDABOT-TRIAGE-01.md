# Codex Dependabot Triage 01

Date: 2026-08-23

Evidence branch: `codex/dependency-triage-01`

Compatibility baseline: canonical TypeScript `main` at `c902a704eb948cc576083d0973c8c23e59937dc1`

## Decision summary

| PR | Dependency | Version | Disposition | Confidence |
|---:|---|---|---|---|
| [#8](https://github.com/HSpector1/The-Movies/pull/8) | `actions/setup-python` | 6.3.0 → 7.0.0 | **SAFE CANDIDATE** | High |
| [#9](https://github.com/HSpector1/The-Movies/pull/9) | `actions/setup-node` | 6.5.0 → 7.0.0 | **SAFE CANDIDATE** | High |
| [#10](https://github.com/HSpector1/The-Movies/pull/10) | `actions/checkout` | 6.1.0 → 7.0.1 | **SAFE CANDIDATE** | High |
| [#11](https://github.com/HSpector1/The-Movies/pull/11) | `vite-node` | 2.1.9 → 6.0.0 | **MIGRATION REQUIRED** | High |
| [#12](https://github.com/HSpector1/The-Movies/pull/12) | `esbuild` | 0.25.12 → 0.28.2 | **SAFE CANDIDATE** | High |
| [#13](https://github.com/HSpector1/The-Movies/pull/13) | `@vitejs/plugin-react` | 4.7.0 → 6.1.0 | **REJECT / SUPERSEDE** | High |
| [#14](https://github.com/HSpector1/The-Movies/pull/14) | `@types/react` | 19.2.17 → 19.2.18 | **SAFE CANDIDATE** | High |
| [#15](https://github.com/HSpector1/The-Movies/pull/15) | `typescript` | 5.9.3 → 7.0.2 | **MIGRATION REQUIRED** | High |

No PR was merged, closed, edited, rebased, or commented on. No campaign, Unity, gameplay, economy, Golden-tag, or `main` content was changed.

## Live truth and common baseline

All eight PRs were verified live as open, Dependabot-authored, and targeted at `main`. Their common PR base is `ce0eaee8772d7e1975b6cfdb62466cd7b60091d3`; the later commits through `c902a704` are documentation-only and do not change `package.json`, `package-lock.json`, or `.github/workflows/bridge-contract.yml`. Each experiment applied only its PR-owned dependency diff to a detached `c902a704` worktree.

Environment: macOS arm64, Node 24.16.0, npm 11.13.0, with npm 10.9.8 used for CI-parity install checks. Live GitHub jobs used `ubuntu-24.04`, runner 2.336.0, Node 22.23.2, and npm 10.9.8.

Unchanged baseline results:

- `npm ci`: pass; 205 packages installed. The five dev-tree audit findings are pre-existing. `npm run audit:browser-deps`: 0 runtime vulnerabilities.
- `npm run audit:repo-hygiene`: pass, 1,041 files. `npm run audit:3d-assets`: pass, 26 assets and no hard violations.
- `npm run check:bridge-contract`, `npm run typecheck:bridge`, `npm run typecheck`: pass.
- `npm run build`: pass, 232 modules; only the pre-existing >500 kB chunk warning.
- `npm run build:studio` and `npm run audit:studio-packaged`: pass. Baseline `studio.mjs` is 114,142 bytes (`24c7597d6f85a2ccdbb16ee8a81fd1f79e68b9bad10b7817b23f9d3ccbb93ae5`); `engine.mjs` is 1,020,266 bytes (`cf2624bb0727e465a538c5238623e75dc64c381690ef816b3d3f019f083b73fd`).
- `npm test`: pass, 337 files; 4,542 passed, 5 skipped, 0 failed. React `act(...)` and jsdom canvas messages were non-fatal baseline warnings.
- `npm@10.9.8 ci` and the subsequent application typecheck also pass on the unchanged baseline.

The historical 23-failure Living Lot caveat was honored. This exact canonical baseline did not reproduce those failures, and no Living Lot test was modified or “fixed.”

## PR findings

### PR #8 — `actions/setup-python` 6.3.0 → 7.0.0 — SAFE CANDIDATE

- **Actual diff:** one pinned SHA in `.github/workflows/bridge-contract.yml`, `ece7cb0…` → verified upstream tag commit `5fda3b95a4ea91299a34e894583c3862153e4b97`.
- **Breaking-change notes:** v7 migrates action internals to ESM and explicitly states no input, output, or behavior change. The Node 24 runner floor (runner ≥2.327.1) arrived before v7; the hosted runner is 2.336.0. Existing `python-version`, `cache`, and `cache-dependency-path` inputs remain supported. Source: [setup-python v7 README](https://github.com/actions/setup-python/blob/v7.0.0/README.md).
- **Validation:** live PR diff/metadata/checks; upstream tag-to-SHA verification; workflow YAML parse; `git diff --check`; both live `TypeScript validation / validate` runs passed.
- **Baseline comparison / regressions:** the unchanged workflow and the v7 workflow both complete the same validation job; no failure or behavior delta found.
- **Migration scope:** none. **Confidence:** high.

### PR #9 — `actions/setup-node` 6.5.0 → 7.0.0 — SAFE CANDIDATE

- **Actual diff:** one pinned SHA in the workflow, `2499707…` → verified upstream tag commit `820762786026740c76f36085b0efc47a31fe5020`.
- **Breaking-change notes:** v7 moves internals to ESM and only exports `NODE_AUTH_TOKEN` when the caller explicitly provides it; this repository sets neither `registry-url` nor publishing/auth inputs. `node-version: 22` and `cache: npm` remain valid, and the root lockfile exists. Sources: [setup-node v7 README](https://github.com/actions/setup-node/blob/v7.0.0/README.md) and [v7 auth handling](https://github.com/actions/setup-node/blob/v7.0.0/src/authutil.ts#L43-L52).
- **Validation:** live PR diff/metadata/checks; tag-to-SHA verification; workflow YAML parse; `git diff --check`; both live validation runs passed.
- **Baseline comparison / regressions:** same Node 22/npm workflow completed as baseline; no cache or install regression.
- **Migration scope:** none. **Confidence:** high.

### PR #10 — `actions/checkout` 6.1.0 → 7.0.1 — SAFE CANDIDATE

- **Actual diff:** one pinned SHA in the workflow, `d23441a…` → verified upstream tag commit `3d3c42e5aac5ba805825da76410c181273ba90b1`.
- **Breaking-change notes:** v7 blocks unsafe fork-PR checkout for `pull_request_target` and `workflow_run`; this workflow uses only `pull_request` and `push`. `persist-credentials: false` is unchanged. v7.0.1 adds hardening/fixes around that check, branch whitespace, and config unsetting. Source: [checkout changelog](https://github.com/actions/checkout/blob/v7.0.1/CHANGELOG.md).
- **Validation:** live PR diff/metadata/checks; tag-to-SHA verification; workflow YAML parse; `git diff --check`; both live validation runs passed.
- **Baseline comparison / regressions:** same repository checkout and full validation job pass; no workflow trigger enters the changed fork-check path.
- **Migration scope:** none. **Confidence:** high.

### PR #11 — `vite-node` 2.1.9 → 6.0.0 — MIGRATION REQUIRED

- **Actual diff:** `package.json` plus lockfile (+748/−492). The direct loader becomes 6.0.0 and resolves its own Vite 8.2.2/Rolldown 1.2.5 stack, while the repository retains direct Vite 6.4.3 and Vitest 2.1.9's Vite 5.4.21/vite-node 2.1.9 stack.
- **Breaking-change notes:** vite-node 6 requires Node `^20.19.0 || >=22.12.0` and Vite 8. Vite 8 replaces the esbuild/Rollup pipeline with Rolldown and documents a deliberate migration path. Sources: [vite-node 6 metadata](https://registry.npmjs.org/vite-node/6.0.0), [Vite 8 announcement](https://vite.dev/blog/announcing-vite8), and [Vite 8 migration guide](https://vite.dev/guide/migration).
- **Exact proposed-state validation:** the unchanged baseline passes `npm@10.9.8 ci`, but the PR's exact lock fails both locally and in both live CI jobs with `EUSAGE`: Vite 8's compatible optional `esbuild@0.28.2` and platform packages are missing. npm 11 permissively installs 215 packages, but `npm ls` reports root `esbuild@0.25.12` invalid for Vite 8's `^0.27 || ^0.28` peer.
- **Forensic broader validation:** under npm 11, `npm run typecheck`, bridge typecheck/contract/proof, browser build, Studio build/audit, Studio CLI help, and the full 4,542-test suite pass. Browser and packaged Studio outputs match baseline. These passes do not erase the npm 10 install failure or invalid dependency tree.
- **Migration probe:** regenerating the lock with npm 10 adds an isolated compatible esbuild 0.28.2 tree; npm 10 install, application/bridge typechecks, bridge contract/proof, browser build, and Studio CLI load then pass.
- **Baseline comparison / regressions:** the install failure is update-attributable. Runtime behavior passed once forcibly or correctly installed. New risks are the Node floor, three concurrent Vite generations, Rolldown loader behavior, and substantial lock churn.
- **Migration scope:** regenerate and review the lock under the CI npm version; declare/enforce the Node floor; explicitly accept/test the split Vite 5/6/8 topology and loader behavior. Do not call this safe by stacking PR #12; the independent state must install cleanly itself. **Confidence:** high.

### PR #12 — `esbuild` 0.25.12 → 0.28.2 — SAFE CANDIDATE

- **Actual diff:** `package.json` plus lockfile (+593/−109). Only the direct esbuild used by `scripts/build-studio.mjs` moves to 0.28.2; Vite 6 retains 0.25.12 and Vitest's Vite 5 retains 0.21.5.
- **Breaking-change notes:** 0.27 raised the binary OS floor (including macOS 12); 0.28 adds integrity verification to the fallback installer, which can expose incomplete custom mirrors. 0.28.1 hardens the Windows dev server and 0.28.2 fixes TypeScript-alias tree shaking. Node ≥18 is required. Sources: [esbuild 0.28 release notes](https://github.com/evanw/esbuild/releases/tag/v0.28.0) and [0.28.2 release](https://github.com/evanw/esbuild/releases/tag/v0.28.2).
- **Validation:** `npm ci`; browser audit; application/bridge typechecks; bridge contract/proof; browser build; Studio build/audit; packaged CLI load. Both live full validation runs passed.
- **Artifact evidence:** browser output is baseline-identical. Expected Studio emitter drift was audited: `studio.mjs` 114,234 bytes (`96acf2bddd453bdcc8e9ceb23093a430420f8749a7e086a675f0428e4e81c50e`); `engine.mjs` 1,020,395 bytes (`dd961cdce8b368d1579144a3c4851ddb20fe7860d948a104f565e0c8ef409f13`). The packaged graph remains first-party plus Node built-ins only.
- **Baseline comparison / regressions:** every relevant gate passes; only expected compiler-emission bytes change. No project migration is needed. Custom registries must carry matching platform binaries.
- **Migration scope:** none in repository code/config. **Confidence:** high.

### PR #13 — `@vitejs/plugin-react` 4.7.0 → 6.1.0 — REJECT / SUPERSEDE

- **Actual diff:** `package.json` plus lockfile (+29/−568). It removes the Babel/react-refresh dependency chain and adds `@rolldown/pluginutils`.
- **Breaking-change notes:** plugin 6 requires Vite `^8.0.0` and Node `^20.19.0 || >=22.12.0`; it uses Oxc for React Refresh and no longer bundles Babel. The repository is on Vite 6.4.3. Sources: [plugin changelog](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md) and [Vite 8/plugin 6 announcement](https://vite.dev/blog/announcing-vite8#vitejs-plugin-react-v6).
- **Validation:** the exact state fails `npm ci` in both live jobs with `ERESOLVE` (`vite@6.4.3` conflicts with peer `vite@^8`). The same conflict reproduces from canonical `c902a704`. An unsupported `--legacy-peer-deps` forensic install lets typecheck pass, but UI tests, bridge test startup, and production build fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` because plugin 6 imports `vite/internal`, absent from Vite 6.
- **Baseline comparison / regressions:** baseline install, UI/bridge tests, and build all pass; every Vite-facing failure above is introduced by the PR.
- **Migration scope:** do not expand or stack this Dependabot PR. Supersede it with a dedicated Vite 8/Rolldown migration that reviews Node support, Vitest/vite-node alignment, emitted assets, and any Babel/React Compiler needs. The current config is only `react()`, but upstream recommends a staged Vite migration and notes plugin 5 can bridge to Vite 8.
- **Failures:** deterministic install and runtime config-loader incompatibility. **Confidence:** high.

### PR #14 — `@types/react` 19.2.17 → 19.2.18 — SAFE CANDIDATE

- **Actual diff:** `package.json` plus lockfile (+5/−5), resolving only `@types/react@19.2.18`.
- **Breaking-change notes:** the patch adds the extensible `RendererUsable<T>` registry to `React.Usable<T>` and raises the package's declared TypeScript floor from 5.3 to 5.6. Canonical main uses TypeScript 5.9.3. Source: [@types/react 19.2.18](https://www.npmjs.com/package/@types/react/v/19.2.18).
- **Validation:** `npm ci`; application typecheck; UI tests (192 files, 2,595 passed/5 skipped); core tests (145 files, 1,947 passed); production build. Both live full validation runs passed.
- **Baseline comparison / regressions:** total tests match the 4,542-pass baseline; emitted asset names/sizes match baseline; only the known non-fatal warnings remain.
- **Migration scope:** none. The stale PR base should be rebased normally at integration time, without importing unrelated dependency changes. **Confidence:** high.

### PR #15 — `typescript` 5.9.3 → 7.0.2 — MIGRATION REQUIRED

- **Actual diff:** `package.json` plus lockfile (+369/−8), replacing the JavaScript compiler package with the native TypeScript 7 package and its platform binaries.
- **Breaking-change notes:** TypeScript 7 is the native Go port, adopts TypeScript 6 defaults including `noUncheckedSideEffectImports: true`, and has no stable programmatic compiler API in 7.0. The repository invokes only the `tsc` CLI and has no source import of the TypeScript API. Sources: [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) and [TypeScript 6 default changes](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/#simple-default-changes).
- **Exact proposed-state validation:** `npm ci`, runtime audit, hygiene, standalone root `npx tsc --noEmit`, bridge typecheck, bridge contract, browser build, and Studio build/audit all pass. UI typecheck fails with three new `TS2882` errors for `LotAuditionWorkspace.css`, `lot.css`, and `styles.css`; both live CI jobs fail on the same three lines.
- **Artifact evidence:** despite the typecheck failure, browser output is byte-for-byte baseline-identical and both packaged Studio hashes remain exactly baseline-identical.
- **Migration probe:** adding `"vite/client"` to `ui/tsconfig.json`'s explicit `types` list supplies the standard Vite asset declarations. Application/bridge typechecks and contract checks then pass, followed by the full suite: 337 files, 4,542 passed, 5 skipped, 0 failed. A fresh repeat also passed the browser build and packaged Studio build/audit; browser assets and both Studio hashes were baseline-identical. Same-machine `npm run typecheck` improved from 8.69 s (5.9.3) to 1.11 s (7.0.2 plus the declaration fix).
- **Baseline comparison / regressions:** the three CSS diagnostics are update-attributable; baseline passes. No runtime, contract, test, or artifact regression was observed after the one-line migration.
- **Migration scope:** add/review the Vite ambient asset types (or an equivalently explicit CSS declaration), then validate CI and editor tooling with the native compiler's API limitation understood. **Confidence:** high.

## Integration guidance

Move #8, #9, #10, #12, and #14 to normal integration review independently. Keep #11 and #15 out of ordinary Dependabot integration until their isolated migration changes are reviewed. Supersede #13 with a dedicated Vite 8 migration rather than combining it opportunistically with unrelated PRs. No dependency update was integrated by this triage.
