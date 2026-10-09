export declare function assertRetainedIdentity(
  entry: { ordinal: number; row: { contractId: string; studioId: string }; identity: unknown[] },
  rows: readonly { contractId: string; studioId: string }[],
): void
