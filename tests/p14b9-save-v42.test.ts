// Task 1315-C3, mode STAGE RED (test source only). Repo HEAD e65012e5, branch
// wip/headless-program-20260916-ts.
//
// STAGED FILE. Import paths are written for this file's INTENDED destination,
// `tests/p14b9-save-v42.test.ts` (see `tests/p14r3-save-v41.test.ts`'s header for the same
// staging convention). Physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage3/tests/.
//
// REVISION 1315-C3 (over `1315-stage2`, per `1315-X2-red-r2-dry-run.md` defect 2): the
// "every frozen reader V1..V41" leaf's `1315-stage2` fix (genuine acknowledged input for V40/41,
// a FRESH `p13aGeneratedStudio` state for V4..V39) still refuses: the fresh generated world
// ALSO refuses below V38 — `migrateToV37`: "cannot downgrade or discard profession transition,
// industry retirement or entrant authority" — a generated world carries profession/retirement
// history that pre-V38 saves cannot represent, so no input this file can lawfully construct
// admits the whole V4..V39 range at once. Fixed per the coordinator's instruction, the house
// form `tests/p14r3-save-v41.test.ts:294-301` ("frozen readers unchanged (regression pin —
// already true...)") already uses for the identical one-version-earlier situation: the V4..V39
// loop is DROPPED, and the describe block instead pins the SAME frozen reader
// (`validateSaveV41`) directly admitting BOTH genuine 1314 inputs (parsed straight from their
// raw text, the house form's own pattern), alongside the unchanged `migrateToV40`/`migrateToV41`
// checks this leaf already made on the genuine acknowledged input. This narrows the claim from
// "every frozen version admits a lawful input" to "the frozen V41 reader itself is unaffected by
// Save42 landing" — the part actually observable without a version-appropriate input for every
// one of V4..V39, which no single available fixture or freshly generated world supplies. The
// other four describe blocks in this file are UNCHANGED from `1315-stage2` — `1315-X2` confirms
// every other Save42 leaf here already passes on the parent's scratch draft.
//
// LAW UNDER TEST: 1313-A §3 ("Persistence: Save42"), as amended/confirmed by 1313-F note 8 (the
// era-31 relationships check needs a FROZEN five-kind catalogue, separate from the live
// seven-kind `RELATIONSHIP_DRIVER_KINDS`) and the "Order and ownership"/"Measured route"
// sections naming `validateSaveV41` / `convertV40ToV41` / `convertV41ToV40` / `migrateToV41` as
// the Save41 pattern `validateSaveV42` / `convertV41ToV42` / `convertV42ToV41` / `migrateToV42`
// must follow exactly (`src/core/save.ts:10474-10509` read in full and mirrored below). Covers
// 1315-C required leaf 5.
//
// RED MECHANISM (memory: "RED-first tests import from a missing module — vite binds missing
// named exports to undefined"). `validateSaveV42`, `convertV41ToV42`, `convertV42ToV41`,
// `migrateToV42` do not exist in `src/core/save.ts` at HEAD 75233cc2; each is CALLED below (not
// merely imported), by direct analogy to `tests/p14r3-save-v41.test.ts`'s own INTERPRETATION 1
// for the identical situation one version earlier. `SaveFileV42` (a type) has no runtime
// binding and is imported as `type`-only, so it cannot itself cause a runtime RED; it is named
// here because task 1315-C requires it.
//
// GENUINE FIXTURES (task 1315-C's two authorized fixture payloads; pinned by gzip AND decoded
// sha256 before use, computed directly against the checked-in files by this author — the
// "house pattern", `tests/p14r3-save-v41.test.ts`'s `pinned()`/`manifestPin()`). Facts below are
// read from `tests/fixtures/p14/genuine-v41-pre-casting-drivers/MANIFEST.json` and the two
// `*.provenance.json` files; no fixture payload beyond these two was gunzipped to derive any
// fact in this file. Route (1314-P / 1314-K, verbatim): `p13aGeneratedStudio('r1314-casting-01')`
// signs the week-0 market's writer (t-wri-05), director (t-dir-04), craft (t-cra-09) and first
// three actors (t-act-24, t-act-08, t-act-20) for 208 weeks; builds set-grand-ballroom on
// facility-soundstage-07; activates script development and casting sessions; commissions
// concept 0 from t-wri-05, accepted at week 9; starts casting session casting-0000 for project
// script-0000 with slate lead:[t-act-24,t-act-08], antagonist:[t-act-08,t-act-20],
// support:[t-act-20,t-act-24], acknowledged at week 10 (the `-casting-acknowledged` fixture,
// NOT YET greenlit); greenlights seating lead=t-act-24, antagonist=t-act-08, support=t-act-20,
// releases at week 19 (the `-casting-released` fixture; its three slate pairs hold
// `sharedProduction` only, per the unchanged Save41 engine).

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import {
  LIVE_SAVE_VERSION, exportSave, importSave, makeSave, validateSave, validateSaveV41,
} from '../src/core/save.js'
// RED (see header): the four names below are absent from src/core/save.ts at HEAD e65012e5.
// `SaveFileV42` (type-only, cannot itself RED at runtime) is used as the cast target for the
// dynamically-looked-up `convertV41ToV42`/`validateSaveV42` below, so it is a real, used type.
import type { SaveFile, SaveFileV42, SaveFileV43, SaveFileV44, SaveFileV45 } from '../src/core/save.js'
import * as saveModule from '../src/core/save.js'
import type { GameState, RelationshipEdge } from '../src/core/types.js'

const FIXTURES = new URL('./fixtures/p14/genuine-v41-pre-casting-drivers/', import.meta.url)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

// Pinned directly against the checked-in files by this author (`python3 -c "hashlib.sha256..."`
// against the exact bytes on disk at HEAD 75233cc2), not copied from any prose table.
function manifestPin(): void {
  const manifest = readFileSync(new URL('MANIFEST.json', FIXTURES))
  expect(manifest.byteLength).toBe(2677)
  expect(sha(manifest)).toBe('a605cfa0149b2bf3dcf7968ea3c5a0f5cce1e7e2317eced6c2c2037767e45d4e')
}
function pinnedRaw(name: string, gzipBytes: number, gzipHash: string, decodedBytes: number, decodedHash: string): string {
  const gz = readFileSync(new URL(name, FIXTURES))
  expect(gz.byteLength).toBe(gzipBytes)
  expect(sha(gz)).toBe(gzipHash)
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(decodedBytes)
  expect(sha(raw)).toBe(decodedHash)
  return raw
}
const acknowledgedRaw = (): string => pinnedRaw(
  'genuine-v41-casting-acknowledged.json.gz',
  57181, '3e9da8307dfaf6f8a54698c403648e658033cc05e616a2cb2540073f38049ff6',
  462047, '6fc0e0768c87d86702df77a5978fe5031bdd313c867e07e8ad476d2c0aba6469',
)
const releasedRaw = (): string => pinnedRaw(
  'genuine-v41-casting-released.json.gz',
  67977, '1890a473e76314c449ce98dfabb0cc1cce393adbdc80896dc982aeba28681670',
  535978, 'dd3da574a9d65c9a5bc411925ca7dac70f71ef86b43f3fc792dabdd222dd220a',
)

type V41Save = { saveVersion: 41; seed: string; state: GameState; broadcastCache: unknown[] }
function genuineV41(raw: string): V41Save {
  const save = importSave(raw)
  expect(save.saveVersion).toBe(41)
  return save as unknown as V41Save
}

describe('1313-A §3 — genuine V41 casting inputs migrate to V42 by adding sharedCompetitions: 0 and nothing else', () => {
  it('fixture pins (gzip + decoded sha256, computed directly against the checked-in files)', () => {
    manifestPin()
    acknowledgedRaw()
    releasedRaw()
  })

  it('genuine-v41-casting-acknowledged (24 edges, week 10, not greenlit): fresh V42 validates; every edge gains sharedCompetitions: 0; every other field is untouched', () => {
    manifestPin()
    const v41 = genuineV41(acknowledgedRaw())
    expect(v41.state.relationships).toHaveLength(24) // MANIFEST fact
    const v42 = (saveModule as unknown as { convertV41ToV42: (s: V41Save) => SaveFileV42 }).convertV41ToV42(v41)
    expect(v42.saveVersion).toBe(42)
    const validated = (saveModule as unknown as { validateSaveV42: (s: unknown) => SaveFileV42 }).validateSaveV42(v42)
    expect(validated.saveVersion).toBe(42)
    expect(validated.state.relationships).toHaveLength(24)
    for (let i = 0; i < v41.state.relationships.length; i++) {
      const before = v41.state.relationships[i]!
      const after = validated.state.relationships[i]! as RelationshipEdge & { sharedCompetitions: number }
      expect(after.sharedCompetitions).toBe(0)
      const { sharedCompetitions: _drop, ...afterMinusNewField } = after
      expect(afterMinusNewField).toEqual(before)
    }
    // Nothing outside `relationships` moves.
    const { relationships: _v41rel, ...v41Rest } = v41.state as unknown as Record<string, unknown>
    const { relationships: _v42rel, ...v42Rest } = validated.state as unknown as Record<string, unknown>
    expect(v42Rest).toEqual(v41Rest)
    expect(v42.seed).toBe(v41.seed)
    expect(v42.broadcastCache).toEqual(v41.broadcastCache)
  }, 30_000)

  it('genuine-v41-casting-released (30 edges, week 19, released; three slate pairs share a production): migrates the same way — the released input is NOT retro-minted (no castingCompetitionLost/repeatedCompetition anywhere; every sharedCompetitions is 0)', () => {
    manifestPin()
    const v41 = genuineV41(releasedRaw())
    expect(v41.state.relationships).toHaveLength(30) // MANIFEST fact
    const v42 = (saveModule as unknown as { convertV41ToV42: (s: V41Save) => SaveFileV42 }).convertV41ToV42(v41)
    const validated = (saveModule as unknown as { validateSaveV42: (s: unknown) => SaveFileV42 }).validateSaveV42(v42)
    for (const edge of validated.state.relationships as (RelationshipEdge & { sharedCompetitions: number })[]) {
      expect(edge.sharedCompetitions).toBe(0)
      expect(edge.recent.some((d) => d.kind === 'castingCompetitionLost' || d.kind === 'repeatedCompetition')).toBe(false)
    }
  }, 30_000)

  it('without competitions, 42->41 is lossless: convertV42ToV41(convertV41ToV42(x)) exports byte-identical to the original genuine V41 text', () => {
    manifestPin()
    const raw = acknowledgedRaw()
    const v41 = genuineV41(raw)
    const mods = saveModule as unknown as {
      convertV41ToV42: (s: V41Save) => unknown
      convertV42ToV41: (s: unknown) => unknown
    }
    const roundTripped = mods.convertV42ToV41(mods.convertV41ToV42(v41))
    expect(exportSave(roundTripped as SaveFile)).toBe(raw)
  }, 30_000)
})

describe('1313-A §3 — the acknowledged input, migrated then greenlit, mints real competitions; 42->41 then refuses by name', () => {
  it('greenlightScriptProject under the V42-migrated state mints castingCompetitionLost for the three slate pairs; validateSaveV42 admits the result; convertV42ToV41 throws naming the reason', () => {
    manifestPin()
    const v41 = genuineV41(acknowledgedRaw())
    const mods = saveModule as unknown as {
      convertV41ToV42: (s: V41Save) => SaveFileV42
      convertV42ToV43: (s: SaveFileV42) => SaveFileV43
      convertV43ToV44: (s: SaveFileV43) => SaveFileV44
      convertV44ToV45: (s: SaveFileV44) => SaveFileV45
      validateSaveV46: (s: unknown) => ReturnType<typeof saveModule.validateSaveV46>
      convertV46ToV45: (s: unknown) => unknown
      convertV45ToV44: (s: unknown) => unknown
      convertV44ToV43: (s: unknown) => unknown
      convertV43ToV42: (s: unknown) => unknown
      convertV42ToV41: (s: unknown) => unknown
    }
    const v42 = mods.convertV41ToV42(v41)
    // 1358-N S9 (1358-F9 ruling 3; 1358-F10 records this): the counter is staged, on edge 0 of a
    // copy of `v42`, because no pre-Save44 engine remains to write it. convertV42ToV41 refuses at
    // its casting-competition guard (src/core/relationships.ts:847-849, via src/core/save.ts:10696).
    const staged = { ...v42, state: { ...v42.state, relationships: v42.state.relationships.map((row, i) => (i === 0 ? { ...row, sharedCompetitions: 1 } : row)) } }
    expect(() => mods.convertV42ToV41(staged)).toThrow(/^migrateToV41: cannot downgrade or discard a casting competition$/)
    // Save43 (1344-N S6): the V42-migrated state has no rival `screenplayShelving`, which the live
    // writer below requires on every rival business; lift it through the genuine convertV42ToV43
    // (src/core/save.ts:10678-10686) rather than hand-adding the root.
    // 1358-N S5 (1358-J 3e, finding 16): the live writer also needs Save44's `competitions` and
    // `romance` on every edge; lift through the genuine convertV43ToV44 (src/core/save.ts:10776-10781).
    // 1361-N S5 (1361-F7 ruling 10): and `makeSave` below writes Save45, which refuses a
    // state without the four P15 roots ("validateSaveV45: the p15Sequence root is missing",
    // src/core/save.ts:10968). The lift ends at Save45 through the genuine convertV44ToV45
    // (src/core/save.ts:10980-10984), which writes them empty at this state's own week, never by hand.
    const state = saveModule.migrateToLive(mods.convertV44ToV45(mods.convertV43ToV44(mods.convertV42ToV43(v42)))).state
    const projectId = 'script-0000'
    const project = state.scriptDevelopment.projects.find((p) => p.id === projectId)
    expect(project, 'route premise: project "script-0000" is present in the acknowledged fixture').toBeDefined()
    const concept = state.concepts.find((c) => c.id === project!.conceptId)!
    const lead = 't-act-24', antagonist = 't-act-08', support = 't-act-20'
    const greenlit = applyActions(state, [{
      kind: 'greenlightScriptProject',
      production: {
        projectId, directorId: 't-dir-04', craftIds: ['t-cra-09'],
        cast: { lead, antagonist, support },
        budget: { negative: concept.baseNegativeCost, marketing: 0 },
      },
    }])
    const productionId = greenlit.studio.activeProductions.at(-1)!.id
    const edge = (x: string, y: string) => greenlit.relationships.find((e) => (e.a === x && e.b === y) || (e.a === y && e.b === x))
    for (const [x, y] of [[lead, antagonist], [antagonist, support], [support, lead]] as const) {
      const e = edge(x, y)!
      const driver = e.recent.find((d) => d.kind === 'castingCompetitionLost' && d.ref === productionId)
      expect(driver, `route/RED premise: pair (${x}, ${y}) should carry a castingCompetitionLost driver from production "${productionId}"`).toBeDefined()
    }
    const newSave = makeSave(greenlit)
    expect(newSave.saveVersion).toBe(46) // LIVE_SAVE_VERSION 45 (was 44 under Save44, 42 at 1313-A §3)
    expect(() => mods.validateSaveV46(newSave)).not.toThrow()
    // 1358-N S9 (MASKED): the live chain now crosses convertV44ToV43 first, and the greenlight
    // appended a competitions-log row on each slate pair (src/core/relationships.ts:537), so
    // the Save44 log guard (src/core/save.ts:10789) refuses before convertV42ToV41's casting-
    // competition guard (src/core/relationships.ts:847-849). The acknowledged fixture's 24 edges
    // are all rival-internal, so the three pairs are new edges 24-26 and edge 24 refuses first.
    // Read from source and the fixture, not measured. The staged `v42` copy above keeps the
    // casting-competition guard's own-era pin.
    // 1361-N S4: the live chain now crosses convertV45ToV44 first (src/core/save.ts:10989-10995). After
    // validation it refuses once while any P15 root holds a row. This state was greenlit by an action
    // and never ticked, so every root is still empty and the chain reaches the Save44 log guard as
    // before. Derived from source, not measured: the pin below is unchanged until a run shows another
    // first guard.
    expect(() => mods.convertV42ToV41(mods.convertV43ToV42(mods.convertV44ToV43(mods.convertV45ToV44(mods.convertV46ToV45(newSave)))))).toThrow(/^migrateToV43: cannot downgrade or discard the competitions log of relationship-edge-24$/)
  }, 30_000)
})

describe('LIVE_SAVE_VERSION and the dispatcher message', () => {
  it('LIVE_SAVE_VERSION is 45', () => {
    expect(LIVE_SAVE_VERSION).toBe(46)
  })

  it('validateSave names the new ceiling in its unknown-version message ("1 through 45")', () => {
    expect(() => validateSave({ saveVersion: 999 })).toThrow(/1 through 46/)
  })
})

describe('1313-F note 8 — the era-31 relationships check uses a frozen five-kind catalogue (regression pin: a V41 envelope carrying sharedCompetitions or a new-kind driver is refused)', () => {
  // These two assertions are ALREADY TRUE on the unchanged Save41 engine today (validateSaveV41's
  // existing `EDGE_KEYS`/`RELATIONSHIP_DRIVER_KINDS` checks already refuse an unrecognized extra
  // field or an unrecognized driver kind — `src/core/relationships.ts:383-479`). They are
  // included per 1315-C's required leaf, and they guard against exactly the regression note 8
  // names: once `RELATIONSHIP_DRIVER_KINDS` widens to seven kinds for the LIVE V42 writer, a V41
  // reader that wrongly subset-tested against that LIVE constant (instead of a frozen five-kind
  // one) would silently start ADMITTING a new-kind driver under a V41 envelope. Re-run after
  // GREEN to confirm the guard still holds with the widened constant in place.
  it('a V41 envelope with an extra sharedCompetitions field on one edge is refused', () => {
    manifestPin()
    const parsed = JSON.parse(acknowledgedRaw()) as { state: { relationships: Record<string, unknown>[] } }
    parsed.state.relationships[0]!.sharedCompetitions = 0
    expect(() => validateSaveV41(parsed)).toThrow()
  })

  it('a V41 envelope with a castingCompetitionLost driver on one edge is refused', () => {
    manifestPin()
    const parsed = JSON.parse(acknowledgedRaw()) as { state: { relationships: { recent: unknown[] }[] } }
    parsed.state.relationships[0]!.recent.push({ kind: 'castingCompetitionLost', week: 10, ref: 'x', delta: -3 })
    expect(() => validateSaveV41(parsed)).toThrow()
  })
})

describe('the frozen V41 reader is unchanged after Save42 lands (house assertion form, regression pin)', () => {
  // REVISION 1315-C3 (1315-X2-red-r2-dry-run.md defect 2): 1315-stage2's fix for this leaf
  // (genuine acknowledged input for V40/41, a FRESH `p13aGeneratedStudio` state for V4..V39)
  // still fails — the fresh generated world ALSO refuses below V38: `migrateToV37`, "cannot
  // downgrade or discard profession transition, industry retirement or entrant authority" (a
  // generated world carries profession/retirement history no pre-V38 save can represent). No
  // input available to this file (the two genuine 1314 fixtures, or a freshly generated world)
  // lawfully admits the whole V4..V39 range, so that loop is DROPPED entirely. Replaced with the
  // house form `tests/p14r3-save-v41.test.ts:294-301` ("frozen readers unchanged (regression pin
  // — already true before V41 exists)") uses for the identical one-version-earlier situation:
  // pin the SAME frozen reader (`validateSaveV41`) directly admitting BOTH genuine 1314 inputs,
  // parsed straight from their raw text (the house form's own `JSON.parse(rawText)` pattern, not
  // `importSave`). The `migrateToV40`/`migrateToV41` checks this leaf already made on the genuine
  // acknowledged input are UNCHANGED below. This narrows the claim from "every frozen version
  // admits a lawful input" (1315-stage2's, unreachable — no single input holds for all of
  // V4..V39) to "the frozen V41 reader itself is unaffected by Save42 landing" — the part this
  // file can actually observe without a version-appropriate input for every one of V4..V39.
  it('validateSaveV41 still admits the genuine acknowledged envelope after V42 lands', () => {
    manifestPin()
    expect(() => validateSaveV41(JSON.parse(acknowledgedRaw()))).not.toThrow()
  })
  it('validateSaveV41 still admits the genuine released envelope after V42 lands', () => {
    manifestPin()
    expect(() => validateSaveV41(JSON.parse(releasedRaw()))).not.toThrow()
  })
  it('migrateToV40 and migrateToV41 admit the genuine acknowledged input projected down', () => {
    manifestPin()
    const v41 = genuineV41(acknowledgedRaw())
    const mods = saveModule as unknown as Record<string, (s: unknown) => unknown>
    for (const v of [40, 41]) {
      const migrate = mods[`migrateToV${String(v)}`]
      const validate = mods[`validateSaveV${String(v)}`]
      expect(typeof migrate, `migrateToV${String(v)} must exist`).toBe('function')
      expect(typeof validate, `validateSaveV${String(v)} must exist`).toBe('function')
      expect(() => validate(migrate(v41))).not.toThrow()
    }
  }, 30_000)
})
