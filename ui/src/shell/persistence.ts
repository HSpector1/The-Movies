// ── Is there a place to write the studio down at all? (PF1-M3) ───────────────
//
// EXACTLY WHAT THIS ANSWERS, and nothing more (PF1-M4 correction): whether a storage
// object is REACHABLE from this document before the first write is attempted. That covers
// the case the shell needs it for — a sandboxed or storage-disabled context, where merely
// touching `localStorage` throws — so the player can be told rather than discover it at
// the moment they lose something.
//
// It does NOT prove a write will land. A quota-exhausted or write-refusing store answers
// `true` here and fails at `setItem`. That case has its own authority and always did: the
// boolean `engine/session.ts` returns from every autosave, which is what the persistence
// notice actually tracks. This probe is only the first-boot answer, before any autosave
// has had a chance to report.
//
// A probe, not a persistence layer. It stores nothing and names no key — deliberately NOT
// an export of `session.ts`: several suites replace that module wholesale with a stub of
// exactly the exports they know about, and a new one there would break them for no gain.

export function browserStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null
  } catch {
    return false // storage unreachable (sandbox / disabled site data)
  }
}
