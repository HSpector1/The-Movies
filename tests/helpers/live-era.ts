// ── The live save era, named once (1370-AR r3) ─────────────────────────────────
//
// A test whose meaning is "the live save" imports these instead of a numbered reader, chain or
// literal, so a save bump edits this file alone. Era reads of a genuine numbered artifact keep
// their numbered reader and never route through here.
//
// `validateSave` in src/core/save.ts is the version dispatcher (it admits every known version and
// returns the all-eras union), so it cannot stand in for the live reader; the live reader is the
// strict validator of the envelope `makeSave` writes, named here.
import { convertV46ToV45, convertV47ToV46, validateSaveV47, type LiveSaveFile, type SaveFileV45 } from '../../src/core/save.js'

/** What `LIVE_SAVE_VERSION` must equal; `expect(LIVE_SAVE_VERSION).toBe(EXPECTED_LIVE_SAVE_VERSION)` guards pin it here. */
export const EXPECTED_LIVE_SAVE_VERSION = 47

/** The live reader: the strict validator of the envelope `makeSave` writes. */
export const validateLiveSave: (input: unknown) => LiveSaveFile = validateSaveV47

/** The live envelope down to the Save45 era through every public step, each refusal preserved. */
export const downgradeLiveTo45 = (save: LiveSaveFile): SaveFileV45 => convertV46ToV45(convertV47ToV46(save))
