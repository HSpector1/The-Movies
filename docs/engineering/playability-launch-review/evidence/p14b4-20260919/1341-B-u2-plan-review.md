<!-- 1341-B: independent review (contract-auditor, read-only) of 1341-A, saved verbatim by the parent at HEAD 67bf8165 from the agent's final text -->

# Independent review 1341-B

**Verdict: ACCEPT**

## Scope of this review

1341-A is a plan only. No 1341-C (dry run) or 1341-D (dry-run review) exists yet (`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1341-*` returns only 1341-A itself). This ACCEPT covers the plan's design, its factual claims against cited evidence, and its technical premise — not proof that execution will unfold as described. The dry run and its independent review remain the gate that confirms actual behavior.

## Check 1 — stays inside Owner ruling 2

Ruling 2, quoted verbatim from `1340-O-owner-rulings-20260929.md:108-124`:

> "Approved: change the UI project's default testTimeout in the repository's existing Vitest config. Start at 30,000 ms, justified by the recorded 5.6–24.8-second UI test durations. This is an authorized repo-scoped change, not permission for machine/global settings changes. Leave core/bridge budgets and explicit performance requirements unchanged. Do not disable timeouts, add retries, remove assertions, or classify unrelated failures as timing problems. Apply after any active recorded run finishes. Run the affected UI checks and a comparable recorded UI suite, report actual durations and remaining failures, then commit/push. Preserve the earlier failed evidence. Treat this as test-harness stabilization—not proof of acceptable in-game performance or completed Unity/UI acceptance."

1341-A's rules map onto every clause: 30,000 ms in the `ui` block only (`1341-A:25`, matches "30,000 ms"); repo config, not machine/global (`1341-A:4`, echoes the ruling's own "not permission for machine/global settings"); core/bridge budgets, `hookTimeout`, and every U1/T1 per-leaf override left untouched (`1341-A:27-29`); no retries, no disabled timeouts, no assertion or test-file edits (`1341-A:29`, stricter than required); the classification rule requires an actual observed pass before recharacterizing a row as timing-fixed (`1341-A:30-35`, addresses "do not classify unrelated failures as timing problems" — see Check 5); earlier failed evidence preserved explicitly (`1341-A:54`); the opening paragraph repeats the "no evidence of in-game performance and no Unity or UI acceptance" framing almost verbatim (`1341-A:6`). No deviation found. "Bridge budgets" is a non-issue: `test:bridge` in `package.json:11` runs `vitest run tests/bridge*.test.ts`, which matches the **core** project's `include: ['tests/**/*.test.ts']` (`vitest.workspace.ts:20`) — there is no separate "bridge" workspace project, so core/bridge share one unedited block.

## Check 2 — factual claims against cited records

All checked numbers match the source files exactly:
- Gate counts 1331:34, 1334:26, 1336:13, 1339:14 (`1341-A:12-15`) match `1339-I-broad-ui-attribution.md:39-42` verbatim.
- CastingReview durations 9,178 ms / 6,914 ms / 6,904 ms (`1341-A:18`) match `1339-I-broad-ui-attribution.md:24-26` exactly.
- World Inspector durations 6,114 ms / 4,373 ms / 4,523 ms (`1341-A:19`) match `1339-I-broad-ui-attribution.md:28-29` exactly.
- The Owner's "5.6–24.8 s" range is independently reconstructible from `1336-I-broad-ui-attribution.md:23-29`'s seven listed durations (min 5,619 ms → 5.6 s, max 24,785 ms → 24.8 s). Confirmed.
- The 1124-A primary distinction — "a findBy failure as its primary in 1336 and a 5 s timeout in 1339" (`1341-A:33-34`) — is correct and non-trivial: `1336-I-broad-ui-attribution.md:41-43` shows the 1336 primary was `Unable to find an element by: [data-testid="dashboard-releases-heading"]`; `1339-I-failures.json` row 2 shows the 1339 primary changed to `Error: Test timed out in 5000ms.` for the identical leaf identity. The plan correctly reports this shift rather than smoothing it over, and correctly declines to credit U2 with "fixing" it.
- "34 UI test files mount the full `App`" (`1341-A:10`): independently confirmed by grep — `render(<App` appears in exactly 34 files under `ui/`.
- `vitest.workspace.ts:24-32` citation: lines 24-32 span the UI project's comment through the `test:` block's closing brace; the full object literal is actually 23-33 (opening/closing braces of the project entry sit one line outside the cited range). Minor, inherited unchanged from `1339-I-broad-ui-attribution.md:20`, cosmetic only — the substantive claim ("sets no testTimeout") is correct.

## Check 3 — is `testTimeout` honored per-project, and does root `vitest.config.ts` interfere

Confirmed from Vitest 2.1.9 source, not assumed:
- `testTimeout` is a documented `InlineConfig`/project-test field (`node_modules/vitest/dist/chunks/reporters.nr4dxCkA.d.ts:1929-1934`, "Default timeout of a test in milliseconds, @default 5000") and part of `RuntimeConfig`/`SerializedConfig` (`node_modules/vitest/dist/chunks/config.Cy0C388Z.d.ts:83,201`), resolved per project (`node_modules/vitest/dist/chunks/resolveConfig.rBxzbVsl.js:8313`: `resolved.testTimeout ??= resolved.browser.enabled ? 15e3 : 5e3`).
- Workspace project resolution (`node_modules/vitest/dist/chunks/cli-api.DqsSTaIi.js:10272-10278`) builds each project directly from its own object literal in `vitest.workspace.ts`, merged only with CLI overrides — never with the root `vitest.config.ts`.
- Critically, for inline (object-literal) workspace project definitions, `initializeProject` sets `configFile: false` (`cli-api.DqsSTaIi.js:9847-9862`, `workspacePath` is a numeric index → `configFile = false`), which disables Vite's own config-file auto-discovery for that project's server entirely. **`vitest.config.ts` is structurally never loaded for either the `core` or `ui` workspace project.** It cannot override, merge into, or otherwise interact with the `ui` project's `testTimeout`.
- Root `vitest.config.ts` (`vitest.config.ts:1-8`) is effectively inert once `vitest.workspace.ts` exists — its own `test.include` (`src/**/*.test.ts`, `tests/**/*.test.ts`) is never spun up as a project under workspace mode. This is a pre-existing repo-hygiene observation, not something 1341-A introduces or needs to address; worth a note to the parent for future cleanup, not a defect of this plan.

Check 3 is fully satisfied: `testTimeout` in the `ui` project's `test` block will be honored, and there is no root-config override risk.

## Check 4 — verification sufficiency and justification for skipping a core re-gate

The scratch-probe design (6 s probe under `ui/` fails pre-edit/passes post-edit; identical probe under `tests/` fails post-edit at the unchanged 5,000 ms core default) is a real, falsifiable test of project isolation, not just an assertion. It is independently corroborated by the source-level finding in Check 3: since each project's config comes from its own isolated object literal with `configFile: false`, there is no code path by which editing the `ui` block's `test.testTimeout` could reach the `core` block. Given that structural guarantee plus the proposed scratch probe, skipping a full recorded core re-gate is justified — a one-line diff confined to one object literal, in a config system with hard per-project isolation, does not warrant re-running ~4,600 core tests. This is standard proportionate verification, not corner-cutting.

## Check 5 — classification rule discipline

The rule (`1341-A:30-35`) only recharacterizes a row as "passing under the 30 s default" if it **actually passes** after U2 — it does not infer this from the earlier primary text alone. Any row that still fails "keeps its own cause," and a new failure is attributed on its own evidence. The explicit 1124-A carve-out is a demonstrated correct application: despite matching the literal string "Test timed out in 5000ms" in the pre-U2 (1339) gate, the plan does not fold it into the timing-family bucket, because its underlying mechanism (per `1336-F-parent-response-to-1336-J.md:16-22`) is a distinct `findBy` cold-mount race already tracked as its own open intermittent. No violation of "do not classify unrelated failures as timing problems" found.

## Check 6 — explicit short/performance budgets a 30 s default could weaken

Grepped `ui/**/*.test.{ts,tsx}` for `timeout:`, `toBeLessThan(Or Equal)`, duration/performance-style assertions. Findings:
- All four explicit `{ timeout: 10_000 }` overrides (`livingTurn.scheduler.test.tsx:211`, `livingTurn.parity.test.tsx:115`, `WorldFirstLotNativeNextEventApp.test.tsx:563`, `WorldFirstLotNativeCastingReviewApp.test.tsx:254`) are U1/T1 first-mount waits already larger than the old 5 s default; a 30 s project default cannot weaken an explicit per-call override (explicit always wins), and none of these assert an upper bound that 30 s would violate.
- No test in `ui/src/**` asserts that something *should* time out, nor any wall-clock performance ceiling (e.g., "renders within Nms"). The numerous `toBeLessThan`/`toBeLessThanOrEqual` hits are domain/business assertions (cash, percentiles, memory bytes in `hollywood-bridge.test.ts:97`, geometry) unrelated to Vitest's timeout mechanism.
- No `configure()`/`asyncUtilTimeout` override exists anywhere in `ui/src`, so Testing Library's separate 1,000 ms `findBy` default — which the plan claims stays untouched — is in fact untouched.

No explicit short budget or performance requirement is at risk from this change.

## Blocking defects

None found.

## Non-blocking notes

1. Line citation `vitest.workspace.ts:24-32` is off by one line at each end versus the full UI project object literal (23-33); inherited unchanged from `1339-I-broad-ui-attribution.md:20`. Cosmetic.
2. `vitest.config.ts` at repo root is dead code under workspace mode (confirmed structurally, Check 3) — not a defect of 1341-A, but worth flagging to the parent separately since it could confuse a future reader into thinking it governs test behavior.
3. "34 UI test files mount the full `App`" (`1341-A:10`) and the "1331: 34 failures" figure (`1341-A:12`) are independently true but numerically coincidental; the plan lists them as separate bullets and does not claim a 1:1 mapping, so this is a minor readability point only, not a factual error.
4. Owner ruling 2's "Apply after any active recorded run finishes" is an execution-time constraint that cannot be checked from the static plan text; the implementer must confirm no recorded run is active before applying.

## Next concrete action

Proceed to the scratch dry run as designed in 1341-A's Verification §1, then submit it for independent review as 1341-D before applying the one-line edit.
