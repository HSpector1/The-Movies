# 1083-A — Exact bounded endurance observer interface

Source-ready contract under1052-A/B and parent1056 only. No source, compiler,
gameplay, store or probe was executed. Parent owns the later
`bridge/testing/c3-active-endurance-observer.ts`; the existing author owns the
later `1052-c3-active-endurance-driver.ts`. This document grants no execution.

## Module boundary and requests

The driver exports the following types and imports the observer implementation.
The observer imports these exact types with `import type` from the driver; no
runtime import, duplicated interface or callback importing the driver is needed.
The driver has no import-time work and guards its CLI entry. Both paths must
appear in the successful `tsc -p tsconfig.bridge.json --listFiles` result before
execution. There is no configuration or runtime-production change.

```ts
export type EnduranceVariant = 'A' | 'B' | 'C' | 'D'
export type ByteIdentity = { bytes: number; sha256: string }
export type ObservationTiming = {
  phase: string; kind: 'operation' | 'inspection'; elapsedMs: number
}
export type ObservationFailure = { phase: string; message: string }
export type ReadObservationRequest = {
  variant: EnduranceVariant; week: number; ordinal: number
  saveJson: string; saveSha256: string
  order: 'forward' | 'reverse'
  focusPersonIds: readonly string[] // 0–2 actual created identities, never guesses
}
export type RuntimeObservationRequest = {
  variant: 'A'; week: 0 | 3120 | 6240
  saveJson: string; saveSha256: string
  runtimeRoot: string; checkpointPath: string // one new sample artifact
}
export type ReadObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null
  week: number; input: ByteIdentity; isolatedAfter: ByteIdentity | null
  counts: { snapshots: number; people: number; calendars: number;
    industry: number; market: number; profilesChecked: number }
  reads: readonly {
    key: string; surface: string; targetId: string | null; page: number | null
    pageSize: number | null; totalRows: number | null; pageCount: number | null; rows: number
    repeated: boolean; identity: ByteIdentity; elapsedMs: number
  }[]
  privacyChecks: number; schemaChecks: number; timings: readonly ObservationTiming[]
}
export type RuntimeObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null
  cleanupFailure: string | null; week: 0 | 3120 | 6240
  input: ByteIdentity; checkpointPath: string
  dispatchAttempts: number; firstSeen: number; replayed: number
  campaignAttempts: number; reopenCount: number; rolloverCount: number
  freshSessionCalls: number; actualTicks: 0
  limits: { maxCheckpointBytes: number; maxJournalBytes: number;
    maxJournalEntries: number; maxLibraryBytes: number; maxRecords: number;
    maxDecodedLibraryBytes: number }
  boundaries: readonly {
    phase: string; encodedLibrary: ByteIdentity; decodedCellsBytes: number
    workingCheckpoint: ByteIdentity; currentSave: ByteIdentity
    savedSave: ByteIdentity | null; journalEntries: number; journalBytes: number
    recordCount: number; receiptCount: number; sessionId: string; revision: number
  }[]
  requests: readonly {
    phase: string; route: 'save' | 'load'; commandId: string
    accepted: boolean; firstSeen: boolean; rolledOver: boolean
    request: ByteIdentity; response: ByteIdentity
  }[]
  store: { reads: number; writes: number; closes: number;
    readMs: number; writeMs: number; closeMs: number }
  timings: readonly ObservationTiming[]
}
```

Exact exports from the observer:
`observeC3EnduranceReads(request): ReadObservationResult` and
`observeC3EnduranceRuntime(request): Promise<RuntimeObservationResult>`.
Use the corresponding imported request/result types on both signatures.
`isolatedAfter` is null only when failure occurs before the post-read measurement;
PASS requires its actual byte identity. Nullable page fields apply to unpaged
surfaces. Never report a guessed zero as a successful measured boundary. Return
the first failure and actual partial counters/boundaries,
close resources, and require the driver to persist it and stop the variant.
PASS always requires failure/cleanupFailure null and every applicable assertion.

Both entrypoints require actual canonical current38 bytes, matching independent
Node SHA-256, and exact requested week. Reject old inputs rather than using the
observer to disguise an additional migration. Require current protocol4/
projection53 and its actual schema identity. Construct an independent graph with
`BridgeSession.fromSaveJson`; never receive or share the driver's GameState.
The driver separately compares its complete authoritative bytes before/after the
call. Within the observer, compare complete exported38 bytes before/after every
read group, alongside their independent hashes. Do not use only stateDigest.

## Synchronous public reads: exact bounds

Per request, hard caps are two `session.snapshot()` calls, one `peopleProjection`,
one `studioCalendar`, eighteen Industry calls, six Market calls and four selected
profile checks: at most28 projection calls. Reserve counters before invocation.
No action, intent dispatch, tick, quote mutation, save replacement or store access
is permitted. The driver owns the already accepted52/13-week schedules and finite
decision-boundary sampling; this interface does not add a new read schedule.

Use the actual APIs `BridgeSession.industry(IndustryQuery)`, `peopleProjection`,
`marketPage` and `studioCalendar`. Queries use actual session/revision and stable
request IDs, pageSize25 (within1–50), and actual returned totals. Snapshot calls
are identical first/repeat reads. Construct the finite query descriptors before
executing them; `order` reverses execution, not game state or requested sort law.

- Five base Industry descriptors: studios; alumni; films; pulse; player-studio
  history. Execute page0 and, only when its actual pageCount exceeds1, page1.
  Studios alternate the existing audienceAwareness/output lanes; films alternate
  actual `lane:'recent', period:'all'` chronological order and
  `lane:'critics', period:'live'`; history alternates all/recent. Pulse and
  alumni retain their existing order. Choose alternation from ordinal parity.
- Select at most four unique known public people: supplied existing focus IDs,
  then the code-point-first additional retired and employed profiles. Missing
  supplied IDs fail; unavailable supplementary categories are recorded empty.
  The first two selected IDs additionally receive person and employment page0
  queries (at most four calls). Missing IDs never manufacture a replacement.
- Repeat the exact base page0 alumni, films, pulse and history requests once
  (four calls), recording first/repeat timings and exact response equality for
  the same request/session authority. Total Industry calls are at most18.
- Market: base closed page0, page1 only when its actual closed total exceeds20;
  for the first two selected IDs read historyPage0 and historyPage1 only when
  their actual history total exceeds10. Closed/history page sizes stay the real
  constants20/10, not the outer Industry request's25. At most six direct calls.

The Industry wire exposes no arbitrary ascending-sort switch. Do not invent one;
alternate existing lanes/periods and call order as above. Page1 is not a claim
to have read every page. Record totalRows/pageCount and sampled pages so late
large histories remain explicit coverage limits. Do not walk unbounded totals.
Industry history's authored-film side list and Market's open buckets are not
paged by this interface; measure their actual envelope bytes rather than claiming
the entire response has at most25 rows.

Validate snapshots with `StudioBridgeSnapshotResponse`, Industry responses with
`StudioIndustryResponse`, Market with `StudioMarketPage`, and selected profiles
with `StudioPersonProfileSnapshot`, via actual `parseWireValue`/BRIDGE_SCHEMA.
Each actual career object keeps strict released53 fields. Targeted privacy checks
exclude inputs/inputsDigest/witnesses/ceilings/private magnitude from career
objects and career news. Rival proposals retain literal UNKNOWN compensation;
rival employment history exposes no private salary/bonus. Do not globally ban
salary from the player's own lawful contract/Market data. Core Calendar is a
typed public view, not a nonexistent wire definition. Check its actual career
facts/counts and return digest/byte/count observations rather than raw private
authority. No synthetic mutants are introduced during endurance.

Read results contain at most32 read records (28 calls plus four selected-profile
measurements) and64 timing
rows; each serialized result is capped at256KiB. Larger actual DTOs are measured
then discarded, not copied into the compact result. Cap failure is reported, not
silent truncation. Full input/output bytes remain equality authority in memory.

## Asynchronous attained-scale sample

Variant A alone invokes this at attained0/3120/6240 using its captured bytes.
Each checkpointPath is a newly exclusive file below the driver's own runtimeRoot,
one of A's three allocated library artifacts; refuse a pre-existing target.
Use `openBridgeCheckpointStore(path,{runtimeRoot,
maxBytes:CAMPAIGN_LIBRARY_MAX_BYTES})`, not its smaller32MiB default. Wrap only
read/writeAtomic/close to count/time and forward actual calls unchanged. No
mock store, Owner path, deletion, manual lock cleanup or temporary-file handling.

Use actual `createBridgeRuntimeCoordinator`, durable/endowed campaigns, default
runtime limits, and a fresh factory importing captured bytes independently.
Exactly one factory call is expected across initial start and disk reopen.
The fixed normal sequence is:

1. Initialize, read/decode its actual written library, and issue one Save As
   `C3 endurance sample W` with actual revisions and `requireClean`. Require one
   record, actual campaign receipt and exact imported inner state.
2. Dispatch Save S1; repeat that identical envelope once and require exact
   responseJson, firstSeen false, identical persisted bytes and no second write.
3. Dispatch fresh Save S2 and then fresh Load L1 using actual current envelopes.
   All inner current/saved bytes must still equal captured input and week W.
4. Close, reopen the actual file through the real store/coordinator and decode
   retained authority. If the logical session is retained, replay exact L1 and
   require original responseJson/no new first-seen entry/write. A legitimate
   rollover is separately recorded; never send an old envelope as a new command.
5. Verify exact retained record identity and current/saved bytes, actual journal
   order and request/response text, then close in finally. Recheck input/driver
   authority; no gameplay was dispatched and week is unchanged.

Reserve at most8 dispatch attempts, one Save As and one close/reopen per sample.
The ordinary path has five dispatch attempts (including two replays). If an
actual default-limit dispatch reports `sessionRolledOver`, preserve the rejected
attempt, assert unchanged current/saved state and the actual session/revision/
journal reset, and allow at most one newly enveloped retry within the same cap.
No repeated retry, alternate sample or reduced limit is included. A further
capacity/refusal stops and retains evidence. Expected journal rows come from
accepted first-seen operations, not an assumed count after rollover. Campaign
Save As receipts are separate authority, not ordinary journal entries.

Decode actual persisted bytes with `loadCampaignLibrary` and
`loadBridgeRuntimeCheckpoint`; exact-byte inspection caches may avoid duplicate
decodes but cannot replace real startup/reopen validation. Measure actual UTF-8
working checkpoint/current save/saved save, the sum of UTF-8
`canonicalJson({route,commandId,requestJson,responseJson})` bytes for each actual
journal entry (the exact `journalEntryBytes` rule at runtime-checkpoint.ts:631),
encoded gzip/base64 library and decoded
cell total (working + every record + optional legacy cell, including duplicates).
Measure each returned decoded cell against actual encoded packed metadata. Never
multiply an average entry or infer encoded size from uncompressed GameState.

Record limits exactly: checkpoint201326592 bytes, journal67108864 bytes/512
entries, library268435456 bytes,32 records and1073741824 decoded-cell bytes.
Record at most twelve boundary summaries, eight dispatch records and64 timings;
compact result cap256KiB. Separate coordinator/store/codec timings and count
nested store time as included in operation time, not additive extra runtime.
Boundary hashes/byte counts may vary with real session UUIDs; compare exact inner
save bytes and retained same-session responses, not cross-sample outer equality.

These three samples add at most24 dispatches/three campaign commands/zero ticks.
They measure persistence at three attained scales, not6240 weeks of durable
journal I/O, default-limit exhaustion, crash injection or native parity. Original
R8 timeout records and the separate1050 standalone observation keep their exact
scopes. The optional reduced-entry sample is excluded by1056.
