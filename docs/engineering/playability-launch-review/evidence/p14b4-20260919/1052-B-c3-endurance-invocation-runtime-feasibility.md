# 1052-B — Endurance invocation, encoding and policy refinement

Docs-only source addendum to1052-A. No compiler, Vite process, gameplay, codec,
snapshot or store was executed. Parent has accepted the explicitly labelled
initial2B endowment as a funded generated stress scenario, not campaign economics.
The remaining source/execution release is still pending after D. No runtime
production change or new persistence law is proposed.

## Actual compilation and invocation

The existing file is **`tsconfig.bridge.json` at the repository root**. It extends
root strict options, retains `rootDir:"."`, permits `.ts` imports, uses Node
types/noEmit, and includes `bridge/**/*.ts`. Root tsconfig does not include
evidence TypeScript and excludes bridge-named tests; repeating root tsc alone
would miss the proposed producer.

Smallest explicit graph for the two proposed paths:

- Driver exports its typed observation request/result contracts and imports the
  observer implementation from `bridge/testing/c3-active-endurance-observer.ts`.
- The observer uses an **`import type`** of that exact contract from
  `../../docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-active-endurance-driver.ts`.
  This pulls the evidence source into the bridge TypeScript program. It causes
  no runtime import cycle or driver side effect. Use those types in the actual
  observer function signature; no unused marker import or duplicated loose type.
- The driver is not imported by a core-named test/helper or production module.
  Its CLI start is guarded by the actual entry path, with no import-time world,
  I/O or gameplay. Its exported observation contract is declarative.

After source release, one parent-recorded command can typecheck both files and
record the consumed paths without modifying configuration:

```sh
node_modules/.bin/tsc -p tsconfig.bridge.json --listFiles
```

Require both exact absolute paths in that command's file list and no diagnostic.
`--listFilesOnly` would list without a complete checking claim and is not the
substitute. Preserve the source/producer hashes around this gate. The existing
root/UI checks remain separate as appropriate; never claim evidence coverage
from include globs alone.

Reviewed local `node_modules/vite-node/dist/cli.mjs:25–47` and the existing1035
invocation precedent. The installed runner accepts the entry and forwards script
arguments with `--script`; no absent tsx or compiler emission is needed:

```sh
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-active-endurance-driver.ts --variant A --output <exclusive-directory>
```

This is a proposed later invocation, not an executed command. Freeze the actual
CLI argument grammar, entry guard and recorder output stem when source exists.
Recorder metadata must use a different stem from producer-owned result JSON.
Source-ready existence/type proof precedes any6,240-week execution.

## Bounded real encoding and coordinator segment

Yes: actual codecs at0/3120/6240 plus bounded actual disk/coordinator segments
can satisfy **sampled encoding, persistence and replay measurements at those
three attained scales**. They cannot satisfy full-century journal I/O, every
intermediate persistence size, or default journal exhaustion if it is not reached.
Retain this distinction in the eventual qualification matrix.

Use only variant A's actual current38 captured bytes; B/C/D need not duplicate
these disk segments. For each sampled week, create an independent exclusively
owned output subdirectory and actual
`openBridgeCheckpointStore(path,{runtimeRoot,maxBytes:CAMPAIGN_LIBRARY_MAX_BYTES})`.
Its normal default is32MiB, so silently using the default would test a different
storage allowance. Use the actual coordinator with campaigns enabled,
`durable:true`, endowed regime, default checkpoint limits and a fresh-session
factory returning `BridgeSession.fromSaveJson(capturedJson,undefined,limits)`.
Every session graph is imported independently. Do not share the driver state.

One bounded default-limit segment per sample:

1. Actual coordinator initialization must write/decode its working checkpoint.
   Use `campaign('saveAs')` once with a distinct label and `requireClean`; construct
   the request from actual session/catalogue revisions and active campaign id.
   No overwrite, delete, discard or hidden prior record is required.
2. Dispatch an actual Save control; retain its exact request/response bytes and
   retry the same envelope once, requiring exact replay/no second first-seen
   append. Dispatch a fresh Save and a Load using freshly observed envelopes.
   These commands consume no gameplay tick. They still generate real journal
   authority and real atomic writes; save/load of identical state is explicitly
   what this sample proves.
3. Close the coordinator/store, reopen from its actual persisted bytes, decode
   through `loadCampaignLibrary`/`loadBridgeRuntimeCheckpoint`, and repeat the
   retained idempotent request only if the same logical session still exists.
   Require exact accepted inner current/saved bytes, retained record identity,
   actual journal order/response bytes, unchanged game week and no fatal callback.
   Read persisted encoded bytes from the store and the accepted decoded objects,
   not an independently reconstructed imitation library.

Cap each segment at8 dispatch attempts, one saveAs campaign command, one close/
reopen cycle and zero ticks. If real byte pressure causes a rollover, preserve
the actual rejection and re-read the session/revision; allow at most one retry
within the same8-attempt cap. No unbounded loop on a Save response that itself
exceeds the byte allowance. Such a failure is genuine measured capacity evidence,
not permission to raise limits. Three segments therefore add at most24 actual
dispatch attempts/3 campaign commands, zero gameplay; include these separately
from1052-A's core mutation trace and output counts.

Keep1052-A's default ten persistent files for A by allocating its five authority
artifacts as the three real sample library files plus complete3120/6240 core saves.
The week0 library already retains its complete imported inner save; no sixth
standalone week0 save is required. Normal store-owned lock/atomic temporary files
follow the existing store lifecycle and are not hand-cleaned by this driver.
The optional reduced-limit segment below would add one explicitly released
runtime-library artifact (eleven persistent A files); it is outside the default
ten-file selection and still subject to the same byte/directory caps.

If a specifically named rollover witness is needed, one additional isolated
3120 segment may use `maxJournalEntries:2` with all byte limits unchanged. It
requires a separate parent release,≤6 real Save/load dispatches and zero ticks.
The third first-seen operation exercises actual history-full handling; confirm
state/saved bytes survive, session id changes, revision resets, journal resets,
and the rejected operation was not committed. Reissue once with the new envelope
and verify its actual persistence/replay. Label this an intentionally reduced
entry-limit control, never default512-entry or64MiB exhaustion. Existing
`bridge-runtime-coordinator.test.ts:345–448` is the precise semantic precedent,
not evidence that this new real-disk sample already ran.

`runtime-coordinator.ts:158–204` persists actual first-seen prepared responses.
Its218–245 rollover reimports preserved authority, atomically persists the new
session and returns SESSION_MISMATCH for the triggering request; it does not
continue that request automatically. This is bounded replay retention, not career
history compaction. `campaign-library.ts` separately handles campaign transaction
receipts; do not infer those are ordinary dispatch journal entries.

Measure actual UTF-8 current/saved/outer checkpoint bytes, journal bytes/entries,
encoded library bytes and sum of decoded cells. Current limits are192MiB outer,
64MiB journal/512 entries,256MiB encoded library,32 records and1GiB decoded cells
(`runtime-checkpoint.ts:205`, `campaign-library.ts:14`, codec:7/22–29/51–58).
Report real gzip-base64 encoding costs; an uncompressed object estimate is not
the encoded library size. Include disk initialization/write/reopen time separately
from core tick/projection time. A bounded segment is not a6,240-command runtime
driver, and empty/small observed journals do not prove the high journal envelope.

## Concrete activity-policy corrections before source freeze

1. **Startup cap:** six creations plus six signings already use12 actions.
   Operations activation, script activation, strike/commission and the first
   script would exceed16 if all dispatched at week0. Count initialization calls
   explicitly, keep a stable pending startup list, and drain at most16 total
   attempts per week. Public set commission/first screenplay can occur in the
   first26-week slot after week0. No private helper advances time, and no startup
   action is exempted from the counter. First-six release deadlines remain loud.
2. **Repair predicate:** “needs repair” must be fixed, not interpreted as every
   worn set. Use standing, unbound selected set condition≤44 and the actual
   `repairSetRefusal===null`; continue normal work otherwise. Current wear9,
   unusable threshold35 and two-week repair mean a fresh set reaches37 after
   seven wraps and is repaired before another binding. With at most122 films
   the routine is comfortably below96 maintenance commands; record actual usage,
   including the initial strike/commission. A genuinely retired set is already
   struck and must not be struck again. Query `setMountedOn` and commission only
   when no live mount exists; repair an unusable standing set through its lawful
   repair path. Every command remains subject to capacity/cash/refusal law.
3. **Public review score:** the proposed threshold55 is source-supported:
   `estimatedScriptAssessment` at355–398 returns `score` explicitly, and
   `scriptProjectsReadModel(...).sections` exposes that view. Read this actual
   estimate, not actualStrength/private latents or an invented field on
   `nextStudioDecision` (that decision has projectId/title/legalActions only).
   Require its actual legal `requestScriptRewrite` action and rewriteCount0;
   otherwise accept via its legal action. Recompute each decision after commit.
4. **Slots are opportunities, not promised immediate production:** the actual
   managed script must be accepted and current staffing/capacity ready before
   `greenlightScriptProject`. One original project may be legitimately still
   drafting or a screenplay queue intent may already exist; do not commission
   another each week within a slot. Track actual queue ordinal/project identity,
   count a slot's accepted queue as its attempt, and wait for engine admission.
   Ready permanent Writer credit survives contract expiry, while commission or
   rewrite still requires actual current writing authority. Later novel screenplays
   provide renewable premises; no old30-concept exhaustion workaround.
5. **First-six context:** both named focus people must remain in the actual cast
   during their first-six alternating lead films; keep the same initial Writer/
   Director when lawful. Three desired slates are not three retained first takes.
   Growth, contract settlement, notices and new-role selection remain actual
   premises; no branch may substitute current raw skills for recorded historic
   input evidence. The new-role replacement preference is only this player's
   policy, not a change to rival chooser/game law.

Initial2B funding is now accepted by parent as the disclosed scenario setup.
These policy precisions and the proposed compilation graph should be incorporated
when the final source contract is released. Sampled runtime encoding can close
its stated finite seam; full-century durable I/O remains an explicit separate
qualification decision. Neither this addendum nor the accepted funding releases
source implementation, runtime production edits, a probe or a heavy run.
