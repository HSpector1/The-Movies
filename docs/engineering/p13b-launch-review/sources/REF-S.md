# REF-S — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/save.ts`
Full source Git blob: `686c40c3cb3facbc06206344a684231deabf299e`
Full source SHA-256: `eafd6bf264416ecb29137086ef104f20e328ef4011b24bb626281f44da182b41`
Full source bytes: 286057

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/save.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 6138–6160

```text
// makeSave — the live V20 boundary. Frozen prior values migrate explicitly.
// The new plain-JSON root is detached once; only final serialization sorts it.
export function makeSave(state: GameState): SaveFileV20 {
  const save = validateSaveV20({ saveVersion: 20, seed: state.seed, state, broadcastCache: state.broadcastItems });
  // Validation precedes detachment, so undefined/non-JSON authority cannot be
  // silently repaired by stringify before the boundary sees it.
  return JSON.parse(JSON.stringify(save)) as SaveFileV20;
}

// ── Load / export / import ───────────────────────────────────────────────────

// Validate then return the save (the load-path entry point), dispatching on
// version. Kept distinct from validateSave so intent at call sites is legible.
export function loadSave(save: unknown): SaveFile {
  return validateSave(save);
}

// Serialize a save to a deterministic JSON string (stable key order → §15.7).
// Validates first (either version) so an invalid save never reaches output.
export function exportSave(save: SaveFile): string {
  validateSave(save);
  return stableStringify(save);
}
```
