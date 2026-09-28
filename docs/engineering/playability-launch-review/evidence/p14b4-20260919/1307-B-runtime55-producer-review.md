# 1307-B: independent review of the outgoing projection55 runtime checkpoint producer

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of the parent draft
`1307-runtime55-outgoing-producer.ts` at HEAD 92c60b09, persisted verbatim by the parent. The parent adopted both
optional recommendations before the single execution: a restart from the durable bytes with a replay of the command
(`firstSeen:false`, identical response, zero store writes, bytes unchanged), and `runtime.close()` in a `finally`.
The executed revision is 8,953 B / `461e9679f5c3ce943cd226cc728917b3c1e40788c9bfb4232eacec777cf6c186`.

---

# Verdict: REFINE (2 recommended, non-blocking items)

The producer's mechanics — API usage, access boundary, guard ordering, and determinism — check out cleanly against current source at HEAD 92c60b09. I found no call that would throw or mistype. The two items below are gaps relative to the house's only comparable precedent (1221), not defects in what's written; I flag them because the script is single-shot with no retry, so the cheap time to add them is now.

## Findings by check

**1. Access — MET WITH EVIDENCE.** Reads exactly one fixture (`1307-runtime55-outgoing-producer.ts:21,51`), one read-only `git rev-parse HEAD` (`:48`), and one `existsSync` probe (`:49`). Writes only under the new `tests/fixtures/p14/genuine-runtime55-pre-r3/` with `mkdirSync(..., {recursive:false})` (`:106`) and exclusive-create `writeFileSync(..., {flag:'wx'})` via the `out()` helper (`:30`, used at `:107,111,117`). No broad source hashing (unlike 1221's `snapshot()`), no Owner-data path, no second fixture payload touched. Pinned `INPUT_GZIP`/`INPUT_RAW` hashes at `:22-23` match the reviewed 1306 closure's `genuine-v40-r3-outgoing-week110.json.gz` entry byte-for-byte (`1306-K-parent-save40-inputs-closure.json:56-61`).

**2. API correctness — MET WITH EVIDENCE.** Every call matches current source exactly:
- `new BridgeSession(state, sessionId, savedJson, {limits})` matches the constructor at `bridge/session.ts:1347-1369`, and mirrors 1221's identical call (`1221-p4p5-outgoing-capture.test.ts:205`).
- `createBridgeRuntimeCoordinator({store, fatal, createFreshSession})` matches `BridgeRuntimeCoordinatorOptions` (`bridge/runtime/runtime-coordinator.ts:39-46`).
- `runtime.read`/`dispatch('save'|'command')`/`close()` match the `BridgeRuntimeCoordinator` interface (`bridge/runtime/runtime-coordinator.ts:58-75,137-158`).
- `validateControl`/`validateCommand` shapes match `bridge/protocol.ts:113-137`; the constructed envelopes reproduce 1221's exact field sets.
- `snapshot.availableIntents` with `kind:'advanceWeek'` is a real enum member (`bridge/schema/intent-schema.ts:3-7`) exposed on `StudioBridgeSnapshotResponse` (`bridge/schema/bridge-schema.ts:3412-3427`).
- `decodeBridgeRuntimeCheckpoint` returns `{checkpoint, currentSave, savedSave, ...}` (`bridge/runtime-checkpoint.ts:294-301,1255-1275`); `loadBridgeRuntimeCheckpoint(...).migratedFromProtocolVersion` matches `LoadedBridgeRuntimeCheckpoint` (`:303-309,1282-1324`).
- `PROJECTION_VERSION===55`, `LIVE_SAVE_VERSION===40`, `PROTOCOL_VERSION===4` all hold at current HEAD (`bridge/schema/bridge-schema.ts:281`; `src/core/save.ts:6538`), so the guard assertions at `1307-runtime55-outgoing-producer.ts:43-45` will pass today.
- `assert.ok(control.ok,...)` / `assert.ok(command.ok,...)` narrowing (`node:assert/strict`'s `ok` is a TS assertion function) is the same idiom 1221 already relies on — no type error.

**3. Premises — MOSTLY MET WITH EVIDENCE; one genuinely unverifiable.**
- Current-slot == raw bytes: self-checked at `:67` (`start.checkpoint.currentSaveJson === raw`), backed by `exportSave(makeSave(state)) = stableStringify(makeSave(state))` being a pure function of state structure (`src/core/save.ts:6542-6547,6559-6567`), independent of `structuredClone`'s object identity.
- Saved-slot == week-110 bytes after save: self-checked at `:97`.
- Exactly one week advanced (110→111): self-checked at `:98`.
- **Cannot settle statically:** whether `advanceWeek` is actually offered in `availableIntents` at week 110 on this specific world. `resolveStudioIntents` (`bridge/session.ts:991-1069`) withholds `advanceWeek` when the journey is in `script-review`/`audition-review` (`:1071-1118`, no advanceWeek pushed on those branches) or when a pending decision blocks a commission/casting/package branch (`studioDecision(state) !== null` at `:1013`). The fixture's own route comment (`1306-save40-outgoing-producer-r3.ts:22-23,30,40-41`: `advanceTo(60); releaseTalent; advanceTo(110)`) suggests the world was built by mechanically driving raw ticks rather than parking on a bridge decision, which makes the premise plausible but not provable without execution. The producer names this exact gap itself (`:79`, `'route premise: advanceWeek is offered at week 110'`) and fails safely if it's false: the guard at `:49` and the fact that `mkdirSync`/writes don't happen until `:106` mean a failed premise here leaves zero filesystem side effects.

**4. Fitness — PARTIAL.** The checkpoint's structural shape (distinct `currentSaveJson`/`savedSaveJson`, two-entry `['save','command']` journal, both responses `accepted:true`) matches the minimum shape the house's only comparable consumer test (`tests/bridge-p14p4p5-opportunities.test.ts:308-343` `prior54()`, exercised by `:452-479` `'B55-3 independently migrates genuine54 slots'`) actually parses. That test only calls `loadBridgeRuntimeCheckpoint` on static bytes — it does not exercise coordinator restart or duplicate-dispatch on the fixture — so a parallel B56-equivalent test would likely be satisfied by 1307's output as-is.

What 1307 omits relative to precedent: 1221's `captureRuntime` (`1221-p4p5-outgoing-capture.test.ts:295-315`) closed the runtime, reopened a **second** coordinator from the durable bytes, replayed the same `commandId` twice, and asserted `firstSeen:false` / byte-identical replay before treating the checkpoint as genuine. 1307 dispatches each command exactly once and closes once (`:73-89`) with no restart or duplicate-dispatch self-check. Given the R2/R3 DTO change is two new refusal enum members (not a new save-shape feature the way P4/P5's promise-waiver closure was), and given duplicate/restart idempotency is already covered generically by `tests/bridge-runtime-coordinator.test.ts`/`tests/bridge-runtime-checkpoint.test.ts`, I judge this **optional for the stated downstream purpose**, not a blocking defect — but it's cheap to add before the one authorized execution and expensive to discover missing after.

**5. Determinism / single-shot guards — MET WITH EVIDENCE.** Version guards (`:43-45`), HEAD guard (`:46-48`), and the overwrite guard (`:49`) all run before the input is even read (`:51`), and well before any filesystem write (`:106-118`). The `out()` helper's `{flag:'wx'}` (`:30`) is a second, TOCTOU-safe barrier against overwrite. No `Date.now()`/`new Date()`/`Math.random()` anywhere in the file — the produced `.provenance.json`/`MANIFEST.json` bytes are fully deterministic given the same input and HEAD, which is stricter than 1221's precedent (which embedded `started`/`completed` ISO timestamps).

**6. vite-node execution — MET WITH EVIDENCE.** Top-level `async function main(): Promise<void>` with a trailing `.catch(...)` setting `process.exitCode = 1` (`:42,122`) is the same shape as the confirmed-working 1306 producer, run via `node_modules/.bin/vite-node docs/.../1306-save40-outgoing-producer-r3.ts` (`1306b-save40-outgoing-run.txt:1`). All imports are relative `.ts` paths resolvable from the file's actual depth (5 `../` segments, matching `ROOT`'s own `../../../../../` at `:20`, and matching 1221's identical depth). The one TS-only construct present — the parameter-property constructor on `class Store` (`:36`, `constructor(public contents: string | null = null) {}`) — is standard esbuild-erasable TS and is the exact same idiom 1221 already uses successfully in this repo.

## What I could not verify
- Whether `advanceWeek` is actually present in `session.snapshot().availableIntents` for the specific week-110 world in `genuine-v40-r3-outgoing-week110.json.gz` — this requires executing the code or hand-tracing the fixture's internal `scriptDevelopment`/decision state, neither of which is available to a read-only reviewer. The script's own named assertion (`:79`) and safe pre-write failure ordering make this an acceptable open premise rather than a defect.
- Whether the eventual B56-equivalent consumer test (not yet written, out of scope here) will need restart/duplicate-dispatch coverage on this fixture — I can only judge fitness against the existing B55-3 analog, which doesn't need it.
- I did not execute anything; all "MET WITH EVIDENCE" findings above are static source cross-references, not a native run.

## Recommended changes (both optional in my judgment, not blocking)
1. Add a restart-then-reopen + duplicate-dispatch replay check before the final capture (mirroring `1221-p4p5-outgoing-capture.test.ts:295-315`), or explicitly record in the producer's header comment why it's intentionally scoped out for this narrower R2/R3 DTO change — so the omission is a documented decision, not a silent gap, before the one authorized execution.
2. Wrap `:51-89` in try/finally so `runtime.close()` is attempted even if an assertion throws (e.g., the named advanceWeek premise at `:79`), matching 1221's cleanup-and-report pattern. Low real-world risk since `Store` is in-memory and the process exits either way, but it's the uniform house idiom elsewhere.
