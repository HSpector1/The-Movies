# D-17B Recovery Report

Date: 2026-08-13  
Recovery operator: Codex  
Repository: `/Users/bruce/The Movies - D17 Economy`  
Expected branch: `d17-economy-truth-equilibrium`

## Recovery rule

This report records the repository state before Codex changed any tracked or untracked file. No reset, clean, stash, rebase, checkout, discard, or branch switch was performed. The inherited working tree is preserved as evidence and is the continuation point for D-17B.

## Git and process state at takeover

- Takeover HEAD: `b3881678ea18d3ef101f5bb59c0aa0ea83340f53` (`D-17B §2/§5: add deterministic publicity action`).
- Checked-out branch: `d17-economy-truth-equilibrium` (correct).
- Local `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`.
- Fetched `hspector-github/main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`.
- Merge base with both local and fetched main: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`.
- Remote D-17 branch is stale at `52c5f0c`; no push, merge, or history rewrite was performed during recovery.
- Staged changes: none.
- Unstaged tracked changes: `src/core/candidates.ts`, `src/core/reception.ts`, `src/core/tuning.ts`.
- Untracked source: `src/core/marketingMenu.ts`.
- Ignored generated directories include `node_modules/`, `out/`, and `ui/dist/`.
- No process was running from this worktree. Two live Claude processes were inspected and both belonged to `/Users/bruce/dynasty-blueprint`; they were not touched.

## Authority reconstructed

The continuation is governed by, in descending task specificity:

1. `docs/D-17B-OWNER-AUTHORIZATION.md`;
2. `docs/D-17B-CANDIDATE-DESIGN-CONTRACT.md`, REV. 3 (authoritative build contract);
3. `docs/D-17B-PROGRAM-LOG.md`;
4. accepted D-17A closure and evidence at `79a9ab3bb9e31ed7d32c571a56d9cc07792ed72f`, annotated tag `d17a-decision-truth`;
5. `docs/D-16-OWNER-RULINGS.md` and the relevant D-12 through D-16 decision records;
6. `docs/LESSONS-LEARNED.md` and the repository build contract.

Files marked `NOT FOR BUILD` were identified without reading their contents and were not used. The repository remains inside the authorized D-17B equilibrium-and-truth scope; no D1-B financing/failure-ladder work and no Art changes are authorized here.

## Recovered committed implementation

The interrupted implementation had already produced the following local commits after the D-17B analysis base. They are retained.

| Commit | Recovered content | Classification |
| --- | --- | --- |
| `5f943c2` | D-13 `BALANCED` discoverability constants and regression coverage | Contract-compliant and complete for its engine slice |
| `4518963` | Engaged reach-neutral split (`0.45`) with legacy disengaged `0.58` preservation | Contract-compliant and complete for its engine slice |
| `824abba` | Engaged-only awareness pull-down drift at tick step 5.5 | Contract-compliant and complete for its engine slice |
| `846b90a` | Candidate design contract updated to authoritative REV. 3 | Governance commit; complete |
| `d3d2b84` | Save V7 publicity state, V6-to-V7 migration, explicit publicity ledger kind and core finance aggregation | Contract-compliant core/save slice; player-facing rendering still outstanding |
| `b388167` | Deterministic engaged-only publicity action, tiers, costs, cooldowns, diminishing-return lift, ledger debit, and core recap aggregate | Contract-compliant core action slice; menu/UI/harness work still outstanding |

The committed engine tests for awareness drift, publicity, save/migration, replay, and D-17B shape passed in the recovery test run. TypeScript compilation (`npm run typecheck`) passed and `git diff --check` was clean.

## Recovered uncommitted implementation

The four inherited source changes form one coherent marketing-CAP implementation unit:

- `src/core/tuning.ts` defines the authorized `{1.3, 2.4, 3.7}` marketing-capacity multipliers.
- `src/core/reception.ts` extracts pure reach/capacity inputs while preserving the existing box-office arithmetic.
- `src/core/marketingMenu.ts` computes capacity and exact integer-dollar rungs using `Math.round` plus the strict `+$1` monotonicity guard, with a disengaged legacy-grid branch.
- `src/core/candidates.ts` preserves the drawn marketing-rung index and resolves it through the active regime menu.

Classification: **partial but salvageable**. The formulas match REV. 3 and the files typecheck, but the unit had no dedicated contract tests, was not exported through the core barrel, and had not yet replaced static-grid consumers in recap/read-model/UI code. It must be completed in place rather than recreated.

## Missing implementation at recovery

- Production marketing-menu tests, barrel export, and all remaining static-grid consumer migrations.
- Production-aligned D-17B harness execution for the publicity action, including run-identity saturation and a percent/fraction validation guard.
- Player-facing publicity controls and truthful awareness/publicity/marketing/discoverability explanations.
- Explicit publicity rendering in weekly finance and studio recap UI.
- D-17B production-vs-lab agreement tests, final corpus rerun, independent review, program-log phases after A, lessons disposition, evidence, and closure record.

## Generated evidence outside Git

`out/` is ignored, is approximately 12 GB, and contains extensive D-17A/D-17B lab artifacts. It was preserved unchanged. Notable D-17B artifacts include:

- exploratory Stage 1/3/4/6, marketing calibration, long-horizon, validation-packet, continuation, and week-86 corpora;
- `d17b-final-reference`, whose serialized publicity saturation is `1` and is therefore a known percent/fraction configuration error, not acceptable final evidence;
- `d17b-final-reference-sat100` plus nine chunk directories, whose serialized publicity saturation is `100` and whose run identity otherwise records the authorized counter-flow, reach, discoverability, and marketing-grid values.

The `sat100` name is required to remain explicit in final evidence. Existing ignored artifacts are leads, not automatically accepted proof: production alignment and corpus completeness must be re-established after the remaining code changes.

## Test uncertainty recovered

The recovery machine's default Node runtime exposed a non-D-17B test-environment problem: UI/Art suites attempted to use Node's unusable global `localStorage` and failed with `localStorage is not available because --localstorage-file was not provided`. Core D-17B suites shown in that run passed. The full suite must be rerun using the repository-compatible/bundled runtime (or an equivalent isolated test environment) before any gate is reported as passing. No failure is being waived.

## Continuation decision

Continue from HEAD `b388167` and the four-file inherited marketing-CAP unit. Preserve every recovered commit and artifact; finish the missing Phase E, H, and U work; then run the complete gates and independent reviews. Nothing recovered was classified as a source contradiction requiring deletion. The only confirmed incorrect result is the superseded ignored `saturation=1` corpus identity, which remains preserved and must not be cited as final evidence.
