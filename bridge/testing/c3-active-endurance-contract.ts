// Type-only observation protocol copied from frozen1052; no endurance execution
// or current-schema qualification is implied by this compiler dependency boundary.
export type EnduranceVariant = 'A' | 'B' | 'C' | 'D'
export type ByteIdentity = { bytes: number; sha256: string }
export type ObservationTiming = { phase: string; kind: 'operation' | 'inspection'; elapsedMs: number }
export type ObservationFailure = { phase: string; message: string }
export type ReadObservationRequest = {
  variant: EnduranceVariant; week: number; ordinal: number; saveJson: string; saveSha256: string
  order: 'forward' | 'reverse'; focusPersonIds: readonly string[]
}
export type RuntimeObservationRequest = {
  variant: 'A'; week: 0 | 3120 | 6240; saveJson: string; saveSha256: string
  runtimeRoot: string; checkpointPath: string
}
export type ReadObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null; week: number
  input: ByteIdentity; isolatedAfter: ByteIdentity | null
  counts: { snapshots: number; people: number; calendars: number; industry: number; market: number; profilesChecked: number }
  reads: readonly { key: string; surface: string; targetId: string | null; page: number | null
    pageSize: number | null; totalRows: number | null; pageCount: number | null; rows: number
    repeated: boolean; identity: ByteIdentity; elapsedMs: number }[]
  privacyChecks: number; schemaChecks: number; timings: readonly ObservationTiming[]
}
export type RuntimeObservationResult = {
  status: 'PASS' | 'FAIL'; failure: ObservationFailure | null; cleanupFailure: string | null; week: 0 | 3120 | 6240
  input: ByteIdentity; checkpointPath: string; dispatchAttempts: number; firstSeen: number; replayed: number
  campaignAttempts: number; reopenCount: number; rolloverCount: number; freshSessionCalls: number; actualTicks: 0
  limits: { maxCheckpointBytes: number; maxJournalBytes: number; maxJournalEntries: number
    maxLibraryBytes: number; maxRecords: number; maxDecodedLibraryBytes: number }
  boundaries: readonly { phase: string; encodedLibrary: ByteIdentity; decodedCellsBytes: number
    workingCheckpoint: ByteIdentity; currentSave: ByteIdentity; savedSave: ByteIdentity | null
    journalEntries: number; journalBytes: number; recordCount: number; receiptCount: number; sessionId: string; revision: number }[]
  requests: readonly { phase: string; route: 'save' | 'load'; commandId: string; accepted: boolean
    firstSeen: boolean; rolledOver: boolean; request: ByteIdentity; response: ByteIdentity }[]
  store: { reads: number; writes: number; closes: number; readMs: number; writeMs: number; closeMs: number }
  timings: readonly ObservationTiming[]
}

