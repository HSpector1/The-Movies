# Security

## Scope and threat model

This is a fully client-side browser game (Vite + React). There is no server, no
account system, no network I/O at runtime, and no telemetry. The complete attack
surface is:

1. **Imported save files** — the only untrusted input. Players paste JSON into
   "Continue from a save".
2. **The npm supply chain** — runtime deps are only `react`/`react-dom`; everything
   else is build/test tooling.
3. **The development server** — `npm run dev` is a local tool, not a deployment.

## Standing controls

- **Save import** goes through `importSave` → `validateSave` (`src/core/save.ts`):
  strict version dispatch, loud rejection of anything malformed, unknown versions
  refused. Migrations build fresh objects from fixed key lists — imported keys are
  never merged into existing objects, so `__proto__`-style payloads inert.
  Save content is rendered through React text nodes only; no `dangerouslySetInnerHTML`
  anywhere in the app (the one `innerHTML` in the tree is a test fixture).
- **No ambient I/O**: the sim core has no network, filesystem, `eval`, or dynamic
  import of user input; no `localStorage` (saves are explicit export/import).
- **Dependencies**: Dependabot (weekly) plus CI `npm audit --omit=dev
  --audit-level=high` on runtime deps. Dev-tooling advisories are patched via
  Dependabot PRs rather than blocking CI.
- **Dev server**: keep Vite bound to localhost (the default). Do not run with
  `--host` on untrusted networks; the historical esbuild advisory
  (GHSA-67mh-4wv8-2f99) is exactly this exposure.
- **No secrets**: the repo needs none — no tokens, keys, or credentials belong in it,
  including in evidence archives or session logs. CI runs with `contents: read` only.

## Reporting a vulnerability

Open a GitHub issue. There is no player data at risk (nothing leaves the browser), so
public reports are acceptable; if a report somehow involves private data, use GitHub's
private vulnerability reporting instead.

## Supported versions

The current canonical branch only. Historical session branches are unsupported.
