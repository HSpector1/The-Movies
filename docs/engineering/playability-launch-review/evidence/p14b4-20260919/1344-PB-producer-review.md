<!-- 1344-PB: independent review (contract-auditor, read-only) of the producer 1344-P, saved verbatim by the parent at HEAD f5b2ab92 from the agent's final text -->

# Independent review 1344-PB

**Verdict: ACCEPT**

Read-only review (Read/Glob/Grep only) of `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-P-save42-rival-stall-producer.ts`, not yet executed (absent from `tests/fixtures/p14/genuine-v42-pre-shelving/`, confirmed by Glob). No code was run by me; conclusions rest on direct source reads and the archived C8 probe output.

## Check 1 — Correctness against current source: MET WITH EVIDENCE

- All six imports resolve to real, correctly-named exports at the cited relative depth (`'../../../../../'` = 5 levels up from the evidence directory = repo root, same pattern as 1314's producer, confirmed against both files):
  - `PROJECTION_VERSION`/`SCHEMA_ID` — `bridge/protocol.ts:26,35`.
  - `p13aGeneratedStudio` — `src/harness/p13a/fixtures.ts:9`, default seed literally `'p13a-core-causal-01'`, matching the producer's explicit `SEED` (belt-and-suspenders, not a silent dependency on the default).
  - `tick` — `src/core/tick.ts:194`, signature `tick(state: GameState, options?: TickOptions): GameState`.
  - `exportSave`/`importSave`/`LIVE_SAVE_VERSION`/`makeSave`/`validateSaveV42` — `src/core/save.ts:6553` (`LIVE_SAVE_VERSION = 42`), `:6557`, `:6574`, `:6586`, `:10565`.
  - `GameState` type — `src/core/types.ts:2297` (`= GameStateV42`).
- **Capture logic / off-by-one — checked, none found.** Traced the loop by hand: `state.market.tick` starts at 0 (confirmed `worldgen.ts:676` `tick: 0`), each `tick()` call increments it by exactly 1 (empirically confirmed below), and the loop captures *before* ticking each iteration. Stepping through: week=100 is captured after exactly 100 `tick()` calls (`state.market.tick===100`), then one more block of ticking to week=130 is captured after exactly 130 calls, and the loop stops (`130<130` is false) without an extra tick. `captured.map(c=>c.week)` deep-equals `[100,130]` by construction. This exactly mirrors `advanceTo`'s `while (state.market.tick < week) state = tick(state)` semantics.
- **Independent corroboration.** The archived probe `1329-c8/probe-rival-economy.test.ts.txt` uses the identical "capture-then-tick" loop shape and its output `1329-c8/rival-economy-head-133aca7a.jsonl` shows `"week":100`/`"week":130` rows whose `week` field equals the tick count taken — same architecture, same result, no drift between the two independently-authored loops.
- **Save round trip / gzip — mirrors 1314 exactly.** `exportSave(validateSaveV42(makeSave(s)))`, `assert.equal(exportSave(importSave(raw)), raw, …)`, `gzipSync(…,{level:9})`, `gunzipSync` round-trip check — line-for-line the same pattern as `1314-save41-casting-outgoing-producer-r2.ts:104-107`, only the V41→V42 function names changed.
- **Genuineness of state aliasing (spot check beyond 1314-B's scope).** 1314-B validated purity only at `applyActions`/`tick` top level. Since 1344-P's route runs entirely through `hollywoodTick.ts` (no `applyActions` calls at all — pure natural ticks), I additionally spot-checked that a captured mid-route state can't be silently corrupted by later ticking: `advanceHollywoodWeek` (`hollywoodTick.ts:303-304`) clones a fresh `HollywoodState` (`{...source, businesses: source.businesses.map(b=>({...b,...}))}`) at the top of every call, and `finishHollywoodWeek` (`:399-407`) only mutates `h.employment[i]` after first cloning `employment:[...h.employment]`. Copy-on-write holds; the week-100 snapshot's `hollywood` subtree is not aliased into week-130's mutations.

## Check 2 — Week-130 premise vs. 1329-A's measured stall: MET WITH EVIDENCE

- The premise operationalization (`stalled = rivals.filter(r => r.productions===0 && r.readyActive===2 && r.activeScriptOrdinals.length===2)`) matches 1329-A's finding text precisely ("holds two ready screenplays… activeScriptOrdinals.length>=2 blocks every commission").
- **Empirically confirmed against the archived route.** `1329-c8/rival-economy-head-133aca7a.jsonl` line 14 (week 130): `r01 {"prod":0,"dev":{"produced":10,"ready":2}}`, `r02 {"prod":0,"dev":{"produced":12,"ready":2}}` — both satisfy the stalled predicate (r03 is filming, r04 has only one ready screenplay). So `stalled.length>=1` holds with margin (2 rivals, not just 1) at week 130 on this exact seed. Week 100 (line 11) correctly predates the stall (no rival yet at `prod:0 && ready:2`), consistent with "one from before it."
- **Source-drift check (no Bash/git tool available to me — reasoned from files, as the task permits).**
  - Direct line-for-line read of the cited decision code against 1344-A's own citations, all matching exactly at current HEAD: `hollywoodTick.ts:200` (`function decide`), `:210` (ready-project loop), `:254` (`if(b.activeScriptOrdinals.length>=2||…)return`); `hollywoodPolicy.ts:57` (cash gate `if(negative+marketing>options.cashAvailable)continue`), `:67` (viability gate `if(options.lockScreenplay&&score<=holdOperatingMargin)continue`); `hollywood.ts:147` (`development-casting` capacity `2`).
  - `1333-I-broad-core-attribution.md:41-43` states explicitly: "Nothing under `src`, `bridge`, `generated` or `scripts` changed between the 1330 source (350f9db5) and 59e2666a," and confirms the C8 42 rows (including this rival stall) are still retained and unresolved, "waiting on D-1329-1" — i.e. still un-fixed by anything landed through 1333.
  - The record trail from 1333 to current HEAD (1335 UI retained-repair, 1338-1343 UI testTimeout work, 1340/1342 Owner-rulings docs, 1344/1347 charters) is UI/docs-scoped; the shelving charter's own §8 order places "Production by sim-core" as step 4, *after* this fixture-minting step — it has not run yet.
  - Residual gap I cannot close without a git diff tool: the exact byte range between 59e2666a and current HEAD `0a8796b3` is not directly diffed by me. Mitigated by (a) the line-exact citation match above, (b) the record-trail argument, and (c) the producer's own self-verifying `assert.ok(stalled.length>=1, …)` at line 69 — a drifted engine fails loudly with no week-130 fixture written, per this repo's fail-loud convention (same mitigation 1314-B relied on for its analogous gap).

## Check 3 — Safety: MET WITH EVIDENCE

- `out()` (`:26`) writes with `{flag:'wx'}` exclusively — every per-file write (`:70,77,80`) goes through it.
- `mkdirSync(…, {recursive:false})` (`:56`) throws if the directory exists — a second, independent guard beyond the `!existsSync` assert at `:32`.
- `tests/fixtures/p14/genuine-v42-pre-shelving/` confirmed absent via Glob — the guards will pass cleanly on the real run.
- HEAD pin: `P14_SAVE42_PRODUCER_HEAD` cross-checked against `git rev-parse HEAD` (`:29-31`), same pattern as 1314's accepted precedent.
- No `readFileSync` anywhere in the file — no fixture payload is read. No Owner save is touched; the only state source is `p13aGeneratedStudio(SEED)`.

## Check 4 — Provenance: MET WITH EVIDENCE

- Per-file provenance (`purpose, record, plan, finding, producer, executionHead, saveVersion, projectionVersion, schemaId, route, gzip, decoded, facts`) and `MANIFEST.json` (`purpose, record, executionHead, saveVersion, elapsedMs, inputs`) match the shape of the 1314 precedent, confirmed by direct read of `tests/fixtures/p14/genuine-v41-pre-casting-drivers/MANIFEST.json`. Using `finding: '1329-A'` instead of a `probe` field is correct here — there is no separate 1344-scoped route-probe document; 1329-A's archived `probe-rival-economy.test.ts.txt`/`.jsonl` is the grounding evidence, and it's cited.

## Check 5 — Genuineness: MET WITH EVIDENCE

- Single fixed seed, one continuous natural-tick route with no `applyActions` calls at all (a stronger genuineness property than 1314's action-driven route — nothing is steered), no seed search, no retries, no state surgery. Both snapshots come from one continuous execution (the "stronger genuineness" pattern 1314-B already credited).

## Blocking defects

None found.

## Non-blocking notes

1. **No scratch dry-run record exists for this producer** (unlike `1314-X-producer-dry-run.md` / 1306's precedent). Given the `wx`+`mkdirSync(recursive:false)` guards mean this is genuinely a single-shot execution with no free retry, I recommend — but do not block on — a scratch dry-run first, matching house practice.
2. **Partial-output-on-premise-failure is possible, same accepted risk class as 1314-B Check 4.** `mkdirSync` (`:56`) runs before the loop; the only in-loop premise assert (`:69`, week-130 stall) fires *after* week-100's files are already written. If it fails, the directory is left with a week-100 fixture only, no week-130, no `MANIFEST.json` — recoverable by the same manual-salvage procedure `1306-C-producer-premise-failure.md` used, not a new risk pattern. Given the strength of the Check 2 evidence, I judge this low-probability but worth the parent having the salvage procedure ready before the run.

## What I could not verify

Exact byte-for-byte identity of `src/`, `bridge/` between 1333's measured HEAD (59e2666a) and current HEAD (0a8796b3) — no git-diff-capable tool under this role. Mitigated as described in Check 2; not treated as a blocking gap given the convergent evidence.

Relevant paths: `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-P-save42-rival-stall-producer.ts`, `.../1344-A-rival-screenplay-shelving-charter.md`, `.../1344-F-parent-shelving-charter-adoption.md`, `.../1329-A-c8-natural-chain-finding.md`, `.../1329-c8/rival-economy-head-133aca7a.jsonl`, `.../1329-c8/probe-rival-economy.test.ts.txt`, `.../1333-I-broad-core-attribution.md`, `.../1314-save41-casting-outgoing-producer-r2.ts`, `.../1314-B-save41-producer-review.md`, `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodTick.ts:200,210,254`, `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodPolicy.ts:57,67`, `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywood.ts:147`, `/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts:6553`, `/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts:9`, `/Users/zacheryspector/The-Movies-headless-program/bridge/protocol.ts:26,35`, `/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v41-pre-casting-drivers/MANIFEST.json`.
