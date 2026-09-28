# 1314-B: independent review of the Save41 casting-input producer

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of
[1314-save41-casting-outgoing-producer.ts](1314-save41-casting-outgoing-producer.ts) at HEAD 45bc66d6, persisted verbatim
by the parent. The parent applied both changes in [r2](1314-save41-casting-outgoing-producer-r2.ts).

---

# 1314-B: Independent review of the Save41 casting-input producer

Reviewed candidate (frozen): `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-save41-casting-outgoing-producer.ts` at repo HEAD `45bc66d6`. Read-only (Read/Glob/Grep only); no execution performed by me. Compared against the measured route (`1314-P-casting-route-probe.ts` / `.txt`), the parent's scratch dry run (`1314-X-producer-dry-run.md`), the governing plan (`1313-A` §3 last bullet / §4 item 4, as read through `1313-F`), and house precedent (`1306-save40-outgoing-producer-r3.ts`, `1306-B`, `1306-C`, `1306-K`, `tests/fixtures/p14/genuine-v40-pre-r3/MANIFEST.json` + one `.provenance.json`).

## Check 1 — Genuineness

**PARTIAL — MET WITH EVIDENCE except one uncited deviation from 1314-P.**

- Public actions/ticks only, `p13aGeneratedStudio`/`applyActions`/`tick`/`advanceTo`, no fixture reads, no cash/state surgery, single fixed seed `'r1314-casting-01'` matching `1314-P-casting-route-probe.ts:14`'s default — confirmed by full read of `1314-save41-casting-outgoing-producer.ts:30-75`.
- `advanceTo` (`src/harness/p13a/fixtures.ts:13-17`) is confirmed literally equivalent to the probe's manual `while (s.market.tick < …) s = tick(s)` loop — not a genuineness gap.
- Both output states (`acknowledged`, `released`) are two snapshots along **one** continuous route execution rather than two separate builds (unlike 1306's two independent `build()` calls). This is a stronger genuineness property, not a weaker one, provided `applyActions`/`tick` never mutate the input state in place. Spot-checked `applyActions` (`src/core/actions.ts:2878-2896`) and `tick` (`src/core/tick.ts:194-208`): both thread `let next = state`/reassign rather than mutate — consistent with CLAUDE.md's "pure core" invariant. Not exhaustively re-audited across every action handler.
- **Deviation found:** `1314-save41-casting-outgoing-producer.ts:70` —
  ```
  if (remaining <= 5 && flow()?.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))
  ```
  vs. the measured `1314-P-casting-route-probe.ts:53`:
  ```
  if (prod()!.remainingTicks <= 5 && w?.phase !== undefined && w.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))
  ```
  The producer drops the probe's `w?.phase !== undefined` (i.e. `flow()?.phase !== undefined`) guard. On today's route this is very likely inert: `1314-P-casting-route-probe.txt:5-6` shows `flow()` already has `phase:"development"` at the very first loop iteration after greenlight (week 10), so the guarded branch is never reached with `flow()` undefined in the measured trace. But it is an unexplained, uncited textual deviation from the route the plan says this producer replays (`1313-F` "Measured route for the Save41 producer and the RED"), and the review brief specifically asked for a line-by-line comparison.

## Check 2 — Coverage for the Save42 RED

**MET WITH EVIDENCE. No missing input.**

`1313-A-casting-drivers-expansion.md:70-72` (§4 item 4) needs: fresh-V42 validation (built directly by the RED, not from this producer), genuine-V41-migrates-adding-zero-counters-only, every frozen reader admitting its own version, and 42→41 lossless-without-competitions/refused-by-name-after-one. The two inputs map cleanly onto the two directions a migration test needs:
- **acknowledged** (week 10, session complete, `project==='ready'`, `production==='none'`, and per `1314-X-producer-dry-run.md:11` zero edges among the slate a/b/c) is the pre-greenlight state a RED migrates to V42 and then drives through a **new**, post-migration `greenlightScriptProject` — exercising the Save42-only competition-mint seam forward, and giving the RED its 42→41-refused-after-one fixture (migrate → new greenlight mints a competition → downgrade must refuse by name).
- **released** (week 19, production released, `slateEdges.length===3`, kinds `['sharedProduction']` only — confirmed both in `1314-save41-casting-outgoing-producer.ts:121` and `1314-P-casting-route-probe.txt:9`) is a greenlight that already happened **under Save41 law**, before the competition driver existed. Migrating it must add only `sharedCompetitions: 0` and must not retroactively invent a `castingCompetitionLost` driver for history that predates the feature — exactly the "must NOT be retro-minted" input the task names.

No plan-required input is missing from this pair.

## Check 3 — Premise asserts

**MET WITH EVIDENCE, one non-blocking asymmetry.**

- `session?.status==='complete'` (line 118) is asserted for both inputs — this is the one fact both migration directions structurally depend on (a Save42 mint/no-mint both require a complete session).
- `released` branch (line 121) asserts the sharp fact the RED needs: `production==='released' && slateEdges.length===3`.
- `acknowledged` branch (line 120) asserts `project==='ready' && production==='none'` but does **not** assert `facts.slateEdges.length===0` — that fact is only recorded, not gated. A route that accidentally arrived with pre-existing slate edges would still pass. **This is currently moot**: confirmed by direct read of `src/core/types.ts:2246` that `RelationshipDriverKind` today has exactly five kinds (`'sharedProduction' | 'repeatedCollaboration' | 'sharedSuccess' | 'sharedFailure' | 'cancelledAfterFirstTake'`) — `castingCompetitionLost`/`repeatedCompetition`/`sharedCompetitions` do not exist anywhere in `src/core/relationships.ts` yet (grep: no matches), so no route on today's engine can produce a pre-existing competition edge. Non-blocking; would be worth symmetric hygiene, not correctness.
- `facts.edges > 0` (line 119) is comparatively weak/tautological (counts the whole world's relationship edges, not slate-scoped) but is not load-bearing — the load-bearing facts are `session.status`, `project`/`production` status, and `slateEdges`.
- Provenance/MANIFEST fields (`purpose, record, plan, probe, producer, executionHead, saveVersion, projectionVersion, schemaId, route, cast, gzip, decoded, facts`) are at least as complete as the 1306 precedent's provenance shape (`tests/fixtures/p14/genuine-v40-pre-r3/genuine-v40-r3-outgoing-week110.provenance.json`), sufficient to pin the inputs.

## Check 4 — Write safety

**MET WITH EVIDENCE.**

- `LIVE_SAVE_VERSION===41` asserted (`1314-save41-casting-outgoing-producer.ts:82`), and confirmed true on current source (`src/core/save.ts:6545`: `export const LIVE_SAVE_VERSION = 41 as const;`).
- HEAD pinned by env and cross-checked against real `git rev-parse HEAD` (`:83-85`), same pattern 1306-B required and 1306 r2/r3 carry.
- `!existsSync(OUTPUT)` guard (`:86`); confirmed via Glob that `tests/fixtures/p14/genuine-v41-pre-casting-drivers/` does not currently exist — the guard will pass on the real run.
- Every file write goes through `out()` (`:80`), which is `writeFileSync(..., {flag:'wx'})` — exclusive create, used for both per-input files (`:122,129`) and `MANIFEST.json` (`:132`).
- Directory creation ordering, per the task's explicit prompt: `mkdirSync` (`:99`) runs **after `route()` fully completes** (including its internal route-premise asserts at `:36,49,57`), but **before** the per-input `facts`-based premise asserts inside the loop (`:118-121`). Per-input file writes for a given input happen only after that input's own facts asserts pass (`:118-121` before `:122`). This means: if input 2's premise fails after input 1 succeeds, the directory is left non-empty with a partial fixture set — the same class of partial-failure state that occurred for real in `1306-C-producer-premise-failure.md` and was handled there by hand-moving the partial output out. `1306-B-save40-producer-review.md` explicitly accepted this "directory created before all per-input premises are known" ordering as safe ("directory-exists guards... correctly ordered before any write"), and 1314's window is narrower than 1306's (1306 created the directory before *either* route ran at all; 1314 creates it only after the *entire* route has already produced both states and passed all of route()'s own internal premises). No new risk relative to accepted precedent.

## Check 5 — Determinism

**MET WITH EVIDENCE — acceptable under 1306 precedent.**

`elapsedMs: Date.now() - started` appears only in `MANIFEST.json` (`1314-save41-casting-outgoing-producer.ts:88,133`), never inside `raw`, `gz`, or the per-input `facts`/`provenance` objects whose `gzip`/`decoded` sha256 identities (`id()`, `:77-78`) are computed from content alone. This differs cosmetically from 1306, which recorded `elapsedMs` per-input inside each `provenance.json` (confirmed: `genuine-v40-r3-outgoing-week110.provenance.json:56`, and absent from 1306's own `MANIFEST.json`) rather than once at the top level — but it is the same class of metadata-only, non-content-affecting placement that `1306-B` reviewed and accepted ("`elapsedMs` confirmed provenance-only, not in `raw`/`gz`"). No output byte of the actual save fixture depends on wall clock or environment.

## Check 6 — Dry-run vs. recorded-run risk

**NOT VERIFIABLE by me (no Bash/git tool); partially mitigated by design.**

- `ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))` (`:21`) is self-consistent with the file's own relative-import depth (the same 5-levels-up path is used for every static import at `:12-19`). Since the dry run's scratch repo executed successfully (imports resolved, exit 0 per `1314-X-producer-dry-run.md:9`), the scratch tree must have preserved the same relative structure, and `ROOT` would resolve correctly there and on the real repo alike. Not a path-fragility risk.
- Operational precondition (not a code defect): the parent must export `P14_SAVE41_PRODUCER_HEAD` equal to the actual `git rev-parse HEAD` in the real repo before the recorded run, exactly as 1306's precedent required.
- I have no tool to confirm `src/`/`bridge/` are byte-identical between 1314-P's measured HEAD (`2dd7768c`, per `1314-P-casting-route-probe.txt:1`) and the current HEAD `45bc66d6` three commits later. The intervening commit subjects (`test(p14)`, `docs(p14)`) are suggestive of no engine change but are not proof; I cannot run `git diff` or `git log -p` under this role's tool set. Mitigation: the producer's own internal route-premise asserts (`1314-save41-casting-outgoing-producer.ts:36,49,57,67`) and fact-premise asserts (`:118-121`) are self-verifying — a drifted engine would very likely fail loudly (nonzero exit, no fixture written) rather than silently mint a wrong fixture, consistent with this repo's fail-loud convention.

## Verdict: REFINE

The write-safety, determinism, coverage and premise design are sound and, where compared, meet or exceed the 1306 house precedent that this exact review lineage already validated. One real, precisely-locatable deviation from the measured route must be fixed or explicitly justified before the sole recorded run, since this producer gets exactly one shot and a 1306-C-style manual salvage is the only recovery path after a bad run.

### Required changes

1. **`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-save41-casting-outgoing-producer.ts:70`** — restore the probe's guard exactly, or add one sentence justifying its removal.
   - Old: `if (remaining <= 5 && flow()?.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))`
   - New: `if (remaining <= 5 && flow()?.phase !== undefined && flow()?.shootingTask?.status !== 'scheduled' && !s.firstTakes.some(t => t.productionId === productionId))`
   - Matches `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-P-casting-route-probe.ts:53`. Traced as behaviorally inert on the measured trace (`1314-P-casting-route-probe.txt:5-6` shows `flow()` already defined at the first loop iteration), so this does not block the recorded run on safety grounds — but the review brief calls for a line-by-line match to the measured route, and this is the one place the code doesn't have it.

2. **Non-blocking, optional.** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-save41-casting-outgoing-producer.ts:120` — add a symmetry assert for the `acknowledged` branch, e.g. append `&& facts.slateEdges.length === 0` to the existing `assert.ok`, mirroring the `released` branch's `slateEdges.length === 3` at line 121. Currently moot (confirmed `src/core/types.ts:2246` has no competition-kind driver yet), so not required before this run.

### What I could not verify

- Whether `src/`/`bridge/` changed between 1314-P's measured HEAD (`2dd7768c`) and current HEAD (`45bc66d6`) — no Bash/git diff tool available under this role.
- No independent execution of the producer was performed (read-only role); all conclusions above are from source/document reads plus the parent's reported dry-run result (`1314-X-producer-dry-run.md`), which I did not re-run.
- Did not exhaustively audit every `applyActions`/`tick` action handler for in-place mutation beyond the two spot-checked entry points; relied on the codebase's stated pure-core convention plus the spot check.

Relevant paths: `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1314-save41-casting-outgoing-producer.ts`, `.../1314-P-casting-route-probe.ts`, `.../1314-P-casting-route-probe.txt`, `.../1314-X-producer-dry-run.md`, `.../1313-A-casting-drivers-expansion.md`, `.../1313-F-parent-casting-drivers-adoption.md`, `.../1306-save40-outgoing-producer-r3.ts`, `.../1306-B-save40-producer-review.md`, `.../1306-C-producer-premise-failure.md`, `.../1306-K-parent-save40-inputs-closure.json`, `/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v40-pre-r3/MANIFEST.json`, `.../genuine-v40-r3-outgoing-week110.provenance.json`, `/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts`, `/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts:6545`, `/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts:2246`, `/Users/zacheryspector/The-Movies-headless-program/src/core/actions.ts:2878`, `/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts:194`.
