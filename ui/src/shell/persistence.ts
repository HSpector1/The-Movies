// ── Is the studio being written down? (PF1-M3) ───────────────────────────────
//
// The shell must be able to answer that BEFORE the first write, so private mode is a
// condition the player is told about rather than a discovery they make at the moment they
// lose something.
//
// This is a probe, not a persistence layer. It stores nothing, names no key, and knows
// nothing about saves — `engine/session.ts` remains the only writer, and the boolean it
// returns from every autosave remains the authority afterwards. Deliberately NOT an export
// of that module: several suites replace it wholesale with a stub of exactly the exports
// they know about, and a new one there would break them for no gain.

export function browserStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null
  } catch {
    return false // storage disabled (private mode / sandbox)
  }
}
