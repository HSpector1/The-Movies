import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  exportSaveJson,
  studioCalendarBoard,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import { operationalAnnexWorkContext } from './snapshot/annexWork.ts'
import { loadPinnedSaveV13Fixture } from '../test/pinnedSaveFixture.ts'

const OUTPUT_DIRECTORY = 'ui/e2e/world-first-operational-annex-work-presence-v1'
const ANNEX_FACILITY_ID = 'facility-development-casting-annex'
const EXPECTED_FILES = [
  'manifest.json',
  'week-13-operational-annex-available.save.json',
  'week-13-operational-annex-script-working.save.json',
  'week-14-operational-annex-production-development-working.save.json',
] as const
const EXPECTED_SAVES = {
  'week-13-operational-annex-available.save.json': {
    byteLength: 223_215,
    sha256: 'a2e60da90ff0475d2340306157cff2a9e7a178850941cd268d85a51dffc025a9',
    week: 13,
    contextState: 'available',
    occupant: null,
  },
  'week-13-operational-annex-script-working.save.json': {
    byteLength: 224_822,
    sha256: 'ca009c6b5f206ac15a7582ff4913da626770eb8d2c2cb483d51f530f8e552186',
    week: 13,
    contextState: 'working',
    occupant: {
      owner: 'script',
      ownerId: 'script-0002',
      title: 'The Silent Widow',
      activity: 'drafting',
      workState: 'working',
      statusLabel: null,
      blocker: null,
    },
  },
  'week-14-operational-annex-production-development-working.save.json': {
    byteLength: 233_963,
    sha256: '664549608c9a36854b4fd30226b2f1e7229f871b72b72e71ef2c99f4819e0cbd',
    week: 14,
    contextState: 'working',
    occupant: {
      owner: 'production',
      ownerId: 'prod-0014-1',
      title: 'Empire of Stranger',
      activity: 'development',
      workState: 'working',
      statusLabel: 'On schedule',
      blocker: null,
    },
  },
} as const

type ManifestFixture = {
  id: string
  file: keyof typeof EXPECTED_SAVES
  saveVersion: number
  importMode: string
  converted: boolean
  byteLength: number
  sha256: string
  seed: string
  claim: {
    week: number
    constructionStatus: string
    completedWeek: number
    annex: {
      capacity: number
      occupied: number
      available: number
      slot: number
      occupant: unknown
    }
    contextState: string
  }
  publicActionDerivation: Array<{ action?: string }>
}

type Manifest = {
  schemaVersion: string
  generatedBy: string
  reproduceCommand: string
  outputDirectory: string
  authority: {
    stateConstruction: string
    allocation: string
    serialization: string
    importMode: string
    deterministic: boolean
    generatedFilesAreHandEdited: boolean
    configuredHeldSave: boolean
  }
  fixtures: ManifestFixture[]
}

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

function manifest(): Manifest {
  return JSON.parse(
    readFileSync(join(OUTPUT_DIRECTORY, 'manifest.json'), 'utf8'),
  ) as Manifest
}

describe('World-First Operational Annex Work Presence V1 — native fixture authority', () => {
  it('pins the dedicated timestamp-free public-action manifest and exact file set', () => {
    expect(readdirSync(OUTPUT_DIRECTORY).sort()).toEqual([...EXPECTED_FILES].sort())

    const evidence = manifest()
    expect(evidence).toMatchObject({
      schemaVersion: 'world-first-operational-annex-work-presence-fixtures-v1',
      generatedBy: 'scripts/gen-world-first-operational-annex-work-presence-fixtures.mts',
      reproduceCommand:
        'node_modules/.bin/vite-node scripts/gen-world-first-operational-annex-work-presence-fixtures.mts',
      outputDirectory: OUTPUT_DIRECTORY,
      authority: {
        stateConstruction: 'public Engine and UI adapter actions only',
        allocation: 'ordinary deterministic shared development-casting allocation',
        serialization: 'exportSaveJson / importSaveJson native SaveFileV13 boundary',
        importMode: 'native SaveFileV13; converted === false',
        deterministic: true,
        generatedFilesAreHandEdited: false,
        configuredHeldSave: false,
      },
    })
    expect(evidence.fixtures.map((fixture) => fixture.file)).toEqual(EXPECTED_FILES.slice(1))
    expect(JSON.stringify(evidence)).not.toMatch(/timestamp|generatedAt|production held|\"held\"/i)

    for (const fixture of evidence.fixtures) {
      const expected = EXPECTED_SAVES[fixture.file]
      expect(fixture).toMatchObject({
        saveVersion: 13,
        importMode: 'native-v13',
        converted: false,
        byteLength: expected.byteLength,
        sha256: expected.sha256,
        seed: 'world-first-operational-annex-work',
        claim: {
          week: expected.week,
          constructionStatus: 'operational',
          completedWeek: 13,
          contextState: expected.contextState,
        },
      })
      expect(fixture.publicActionDerivation.map((step) => step.action)).toEqual(
        expect.arrayContaining([
          'newGame',
          'signContract',
          'foundManagedStudio',
          'startDevelopmentCastingAnnex',
          'advanceWeek',
        ]),
      )
    }
  })

  it('replays all three pinned SaveFileV13 files byte-identically and projects exact Annex truth', () => {
    for (const fixture of manifest().fixtures) {
      const expected = EXPECTED_SAVES[fixture.file]
      const path = join(OUTPUT_DIRECTORY, fixture.file)
      const bytes = readFileSync(path, 'utf8')
      expect(Buffer.byteLength(bytes, 'utf8')).toBe(expected.byteLength)
      expect(sha256(bytes)).toBe(expected.sha256)

      const envelope = JSON.parse(bytes) as { saveVersion?: unknown; seed?: unknown }
      expect(envelope).toMatchObject({
        saveVersion: 13,
        seed: 'world-first-operational-annex-work',
      })

      // C2a-M1/M2 — the live format is V14, so loading this frozen artefact is a migration.
      // Byte-identity is unchanged in strength and is asked of the writer that owns the
      // format the file is in: the frozen V13 builder must put every byte back, in order.
      // The loader additionally proves the live V14 artefact the migration produced is
      // itself lossless and reloads as current.
      const restored = loadPinnedSaveV13Fixture(path)

      const before = exportSaveJson(restored)
      const calendar = studioCalendarBoard(restored)
      const annexRows = calendar.facilities.filter(
        (facility) => facility.facilityId === ANNEX_FACILITY_ID,
      )
      expect(annexRows).toHaveLength(1)
      expect(calendar.studioDevelopment).toMatchObject({
        status: 'operational',
        completedWeek: 13,
      })
      expect(annexRows[0]).toMatchObject({
        facilityId: ANNEX_FACILITY_ID,
        facilityName: 'Development & Casting Annex',
        capability: 'development-casting',
        capacity: 1,
        occupied: fixture.claim.annex.occupied,
        available: fixture.claim.annex.available,
        slots: [
          {
            facilityId: ANNEX_FACILITY_ID,
            facilityName: 'Development & Casting Annex',
            capability: 'development-casting',
            slot: 0,
          },
        ],
      })

      const snapshot = studioLotSnapshot(restored)
      const context = operationalAnnexWorkContext(snapshot)
      expect(context?.state).toBe(expected.contextState)
      expect(fixture.claim.annex.occupant).toEqual(expected.occupant)
      expect(snapshot.annexWork).toEqual({
        facilityId: ANNEX_FACILITY_ID,
        facilityName: 'Development & Casting Annex',
        capability: 'development-casting',
        ...fixture.claim.annex,
      })
      expect(context?.annexWork).toBe(snapshot.annexWork)
      expect(exportSaveJson(restored)).toBe(before)

      if (expected.occupant === null) {
        expect(context).toMatchObject({
          state: 'available',
          occupant: null,
          ownerIntent: null,
        })
        expect(annexRows[0]!.slots[0]!.occupant).toBeNull()
      } else {
        expect(context).toMatchObject({
          state: 'working',
          occupant: expected.occupant,
          ownerIntent: {
            owner: expected.occupant.owner,
            ownerId: expected.occupant.ownerId,
          },
        })
        expect(annexRows[0]!.slots[0]!.occupant).toEqual({
          owner: expected.occupant.owner,
          ownerId: expected.occupant.ownerId,
          title: expected.occupant.title,
          activity: expected.occupant.activity,
        })
      }
    }
  })
})
