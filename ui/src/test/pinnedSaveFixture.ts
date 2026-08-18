// ── Pinned historical save fixtures — one loader, one set of guards ──────────
//
// Several browser-acceptance suites drive the UI from a save file that was frozen at
// a point in time and committed. Those files are SaveFileV13 artefacts; the live save
// format is SaveFileV14 (C2a-M1), so loading one is a migration.
//
// The guard those suites have always carried is byte-identity: "the file on disk is
// EXACTLY what the writer produces for this state, so nothing was hand-edited and the
// save boundary loses nothing." That guard is kept here at full strength — it is simply
// asked of the writer that owns the format the file is actually in. `makeSaveV13` is
// frozen and refuses to write any state it cannot put back byte-for-byte (save.ts
// `assertFrozenBuilderCanProjectV14State`), so migrating a pinned V13 artefact and
// projecting it home is the strictest statement available about that file: every V13
// byte survived the migration, in order.
//
// A second guard is added on top, which the V13-only version could not make: the LIVE
// V14 artefact the migration produces is itself lossless and re-imports as native.
//
// Regenerating these fixtures at V14 is deliberately NOT what happens here. They are
// historical artefacts whose value is that they are old: they are the corpus proving a
// player's existing studio still opens. A fixture regenerated today would prove only
// that today's writer agrees with itself.

import { readFileSync } from 'node:fs'
import { exportSave, makeSaveV13 } from '../../../src/core/index.ts'
import { exportSaveJson, importSaveJson } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'

/**
 * Load one committed SaveFileV13 fixture, proving it is still exactly the artefact it
 * was frozen as, and return the migrated live state the suite plays against.
 *
 * Throws — loudly and by name — on the first guard that fails.
 */
export function loadPinnedSaveV13Fixture(path: string): GameState {
  const bytes = readFileSync(path, 'utf8')

  const envelope = JSON.parse(bytes) as { saveVersion?: unknown }
  if (envelope.saveVersion !== 13) {
    throw new Error(`expected the pinned SaveFileV13 fixture at ${path}`)
  }

  const imported = importSaveJson(bytes)
  if (!imported.ok) throw new Error(imported.error)
  if (imported.converted !== true) {
    throw new Error(`expected ${path} to report itself as an upgraded older save`)
  }

  // Byte-identity — the frozen writer must put every byte back, in order.
  if (exportSave(makeSaveV13(imported.state)) !== bytes) {
    throw new Error(`fixture roundtrip changed ${path}`)
  }

  // …and the live V14 artefact the migration produced is lossless and native.
  const live = exportSaveJson(imported.state)
  const reloaded = importSaveJson(live)
  if (!reloaded.ok) throw new Error(reloaded.error)
  if (reloaded.converted !== false) {
    throw new Error(`the migrated live save of ${path} did not reload as current`)
  }
  if (exportSaveJson(reloaded.state) !== live) {
    throw new Error(`live replay changed ${path}`)
  }

  return imported.state
}

/**
 * The LIVE save bytes of one pinned SaveFileV13 fixture — the artefact exactly as the
 * running app holds it.
 *
 * This is what a byte-neutrality assertion compares against: "the player did that, and
 * not one byte of the studio moved." `loadPinnedSaveV13Fixture` has already proven these
 * bytes descend from the untampered frozen file, so the comparison is as exact as reading
 * the file was, at the format the app actually writes.
 */
export function pinnedSaveV13LiveBytes(path: string): string {
  return exportSaveJson(loadPinnedSaveV13Fixture(path))
}
