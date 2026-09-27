# 1116-B — Independent outgoing preservation plan review

**KEEP for the frozen plan.** Reviewed `1116-A-p3-outgoing-preservation-plan.md`, 14,055 bytes / SHA-256 `70fc0fd92af64dde449b8770310bdc12b74b43defb8efb984f5d0a7599bd11b9`. Its four exact ancestors, two-call continuation, six public mutation-route invocations, one quote, nine outputs and current/frozen distinctions fit 1112-A/C. No additional product decision or concrete setup contradiction was found.

This is preparation only. D and final C.3 qualification/publication still precede capture; the producer must be frozen and independently reviewed at the actual final source before execution. No producer, migration, validation function, compiler, test, gameplay or runtime was executed during this review. Inspection used source reads and standard-library gzip/JSON/byte hashing only. No fixture or consumed source changed.

## Independent ancestor checks

All four gzip/raw identities, all three manifest identities and all three separate provenance identities in 1116-A were independently rehashed and match. The raw saves also have the expected canonical JSON representation under an independent data-only sorted-object serializer; this does not substitute for the proposed actual frozen-reader admission/re-export.

| Ancestor | Independently observed immutable data |
| --- | --- |
| Genuine V37 PRE207 | Week 207, 92 people, 59 open count-only promise roots, no tagged P2 or successor link, 85 first takes, two retirement records, three cohorts and 142 market receipts. |
| Genuine V31 bound P2 | Week 52, one bound version-4 `promise-0`, `{count:1, kind:'castRoleCount', seatClass:'lead'}`, window [52,92), progress zero, 20 first takes and three market receipts. |
| Genuine V31 kept/broken | Week 61, two version-4 P1 roots: `promise-0` SATISFIED with progress one and `first-take-event-24`, outcome receipt `talent-market-event-6`; `promise-1` BROKEN with zero progress/no evidence, receipt `talent-market-event-7`. There are 25 first takes and eight market receipts. |
| Genuine V32 owes-two | Week 104, bound player `promise-0`, count two/progress zero/no evidence/no successor, window [104,194), exact named contract; 40 first takes. Real `prod-0013` has five remaining ticks and seats `t-act-09` as support. |

The manifests and provenance are pinned ancestors, not files to rewrite. The plan correctly refuses to infer an old waiver from old B.7 provenance or a projection-49 runtime without that link. Its natural-208 output is a current-source continuation of an admitted genuine ancestor, not a claim that the old V37 bytes already contained C.3 profession changes.

`exportSave` and `importSave` validate the supplied version (`src/core/save.ts:6539–6559`). The proposed original V31/V32/V37 readers plus real `migrateToLive` avoid a historical-state cast to the current type. V31→V32 explicitly appends nullable `supersededByPromiseId` (`save.ts:9172–9181`); compare old promise fields exactly and independently assert governed additions. PRE207's reverse-to-37 check is appropriately before any new transition authority. Neither a broad V31/V38 state-equality claim nor removal of migration fields is needed.

All current full-save admissions, the guarded migrated-207 reverse, and the actual 208 choices remain producer premises. Data-only inspection cannot qualify them in advance. Failure must stop the fixed route rather than patch a clock, root, person or expected hash.

## Coordinator and continuation feasibility

The proposed interfaces exist at `bridge/runtime/runtime-coordinator.ts` and `bridge/runtime/checkpoint-store.ts`. Omitting campaign-library options selects the raw checkpoint path. Startup uses the supplied fresh-session factory only for an empty store; current restart reconstructs from stored checkpoint bytes (`runtime-coordinator.ts:294–318`). Its `read` view exposes session ID/revision/snapshot, so actual state/slot inspection should use the emitted store bytes and codec rather than assume `runtime.read` exposes `gameState`.

SAVE followed by the actual emitted advance intent is a genuine path to distinct 207/208 slots. Coordinator dispatch obtains the real journal delta, requires the new entry to match the route/request/response and writes only first-seen operations (`runtime-coordinator.ts:155–203`). Duplicate dispatch returns historical response bytes without another persistence write when the journal does not grow. This supports the plan's recorded no-write/no-extra-tick oracle; counters must still prove it. Normal Bridge advance calls `tick(state, {develop:true})` through `ui/src/engine/adapter.ts:2483–2485`, matching the independently migrated core branch.

The successful budget is exact: main branch SAVE, advance and original advance replay; waiver branch SAVE, waiver and original waiver replay. That is six public mutation-route invocations/four new accepted operations, plus one quote. Only the main advance and the independently reserved core continuation consume ticks. Quote preflight is not an extra committed mutation or a hidden tick. The future producer must reserve every invocation before dispatch, retain completed counters separately and enforce that both duplicates preserve revision, authority and journal.

The two real coordinator creations/one fresh factory/two closes belong to the main branch. Each coordinator owns its store close (`runtime-coordinator.ts:207–215`, `:281–289`); call coordinator close in cleanup without inventing an extra manual store close or counting a codec-only reconstructed session as another coordinator. Current restart must not call a fresh factory, and the injected migration-session factory for `loadBridgeRuntimeCheckpoint` must remain unused. Preserve the exact original request, including its old expected revision, for duplicate replay.

Current codec decode requires canonical JSON with exactly one final LF and full hydration (`bridge/runtime-checkpoint.ts:1242–1271`). Current load preserves the checkpoint rather than taking a prior-schema migration branch (`:1276–1318`). The producer should compare the actual emitted encoded checkpoint byte-for-byte through the codec, validate both saves independently, and pin journal entries/request/response/digest values. It must compare historical response bytes, not recompute processing telemetry, random session identity or snapshot timing.

## Waiver truth and output boundary

The exact count-two substitute [105,165) is the existing public B8 accepted-route proposal (`tests/bridge-p14b8-waiver-surface.test.ts:208–212`, `:259–267`). That prior source evidence supports a fixed premise, not a new current acceptance result. The immutable active pre-take support seat above is important; do not cancel it, run it forward or substitute an unrelated save if the current quote refuses.

`BridgeSession.quote` preflights and stores the accepted waiver intent without committing authority (`bridge/session.ts:1967–1997`). The one actual submit command must then produce the durable WAIVED original, same-contract successor, outcome join and exact unchanged unrelated history. The plan correctly labels that link as newly created at capture from V32 ancestry and does not claim partial service, an originally captured V38 ancestor, or historical accepted P3. Same-week 104 saved/current slots must differ in complete bytes and authority even though their week numbers agree.

The nine named outputs remain exclusive: eight gzip payloads and one manifest in a previously absent destination. Per-payload 16 MiB, aggregate raw 64 MiB, aggregate gzip 16 MiB and manifest 1 MiB are refusal bounds, not predictions of exact output size or changes to runtime limits. Build/compress/gunzip-verify in memory, finish premises and cleanup, then preserve any partial output if a later write fails. The manifest must be an honest completed-inventory result, never a success marker for an incomplete mint. No existing fixture is overwritten or cleaned up.

The proposed manifest covers raw/gzip identities, old ancestry, actual source HEAD/index/tracked inventory/diff, producer and schema, both slot identities/weeks, command and journal bytes, real counters/factory/close/no-write observations and cleanup. The mint recorder must distinguish the nine declared new outputs from preexisting consumed files; it cannot call the fixture-writing operation an empty whole-source diff. No output identity is frozen before its actual measurement. The captured source must be final qualified C.3, not today's provisional D/maintenance boundary.

**Final disposition: KEEP, no execution release implied.** The plan preserves actual outgoing Save 38/projection 53 authority and replay bytes before P3's future boundary, without repeating Save As coverage or fabricating an old P3/waiver. Its in-memory store proves real coordinator/codec behavior only; it is not real-disk, native, latency or century-journal evidence. The earlier outgoing-37 digest-parity failure and independent C.3 limits remain unchanged.
