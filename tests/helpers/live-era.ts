// ── The live save era, named once (1370-AR r3) ─────────────────────────────────
//
// A test whose meaning is "the live save" imports these instead of a numbered reader, chain or
// literal, so a save bump edits this file alone. Era reads of a genuine numbered artifact keep
// their numbered reader and never route through here.
//
// `validateSave` in src/core/save.ts is the version dispatcher (it admits every known version and
// returns the all-eras union), so it cannot stand in for the live reader; the live reader is the
// strict validator of the envelope `makeSave` writes, named here.
//
// P16 Save49 uses its strict reader; rightsStripped in predecessorSave admits the unchanged Save48 operand before the established P15B projection.
// P15B (record 1370-ar, Save48 over founding's Save47): the live reader is the P15B step's. Its public
// downgrade (`convertFromP15BSave`, alias `convertV48ToV47`) refuses any evaluated condition record, and
// every ticked industry state holds one, so the live chain down to the Save45 era starts from the
// predecessor envelope `predecessorSave` builds (tests/helpers/p15-roots.ts): the two P15B roots and the
// zero loan movements leave deliberately and visibly, anything a predecessor cannot carry refuses by
// name, and every public step below it (Save47 fund, Save46 recovery) still runs with its refusal kept.
import { convertV46ToV45, convertV47ToV46, validateSaveV49, type LiveSaveFile, type SaveFileV45 } from '../../src/core/save.js'
import { predecessorSave } from './p15-roots.js'

/** What `LIVE_SAVE_VERSION` must equal; `expect(LIVE_SAVE_VERSION).toBe(EXPECTED_LIVE_SAVE_VERSION)` guards pin it here. */
export const EXPECTED_LIVE_SAVE_VERSION = 49

/** The live reader: the strict validator of the envelope `makeSave` writes. */
export const validateLiveSave: (input: unknown) => LiveSaveFile = validateSaveV49

/** The live envelope down to the Save45 era: the predecessor envelope first (see the header), then every public step, each refusal preserved. */
export const downgradeLiveTo45 = (save: LiveSaveFile): SaveFileV45 => convertV46ToV45(convertV47ToV46(predecessorSave(save.state)))
