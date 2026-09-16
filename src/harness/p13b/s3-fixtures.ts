import { exportSave, importSave, makeSave } from '../../core/save.js'
import type { GameState } from '../../core/types.js'

// P13B-S3 shared evidence (test-author, additive; never edits ../p13a/fixtures.ts
// or ./fixtures.ts). Builders reused by more than one S3 test file live here;
// everything single-file stays local to its test, exactly as this repository's
// existing convention keeps single-file helpers (e.g. `projectRow` in
// tests/p13b-s2-labs.test.ts) out of the shared harness.

/**
 * The one forging technique test 4 (changed-quote drift) and test 8 (validator
 * refusals) both need: round-trip a REAL, lawfully-reached state through its own
 * exported save JSON, letting `mutate` corrupt exactly the named fact on the
 * PARSED envelope before re-import. This is the honest way to produce a fact
 * this constant-tuning, deterministic engine cannot organically produce on its
 * own (a stale quote fingerprint, a broken validator invariant) — recorded as
 * forged, never presented as an organically reached state, the same idiom
 * `tests/p13b-s2-validation.test.ts` and `tests/p13b-s2-save-v22.test.ts` use.
 *
 * Returns the re-imported envelope's `.state`. Typed narrowly by the caller
 * (S3's `SaveFileV23` does not exist yet — that absence is exactly what makes
 * every file below RED).
 */
export function s3ForgeAndReimport(state: GameState, mutate: (parsedEnvelope: Record<string, unknown>) => void): GameState {
  const json = exportSave(makeSave(state))
  const parsed = JSON.parse(json) as Record<string, unknown>
  mutate(parsed)
  const reimported = importSave(JSON.stringify(parsed))
  return (reimported as unknown as { state: GameState }).state
}
