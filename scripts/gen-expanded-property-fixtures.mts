// C1-M6 Expandability Fixture Proof — the property architecture, proved by DATA.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/gen-expanded-property-fixtures.mts
//
// WHAT THIS GENERATOR CLAIMS, AND WHAT IT DOES NOT.
//
// Owner ruling 4 says 28×26 is the STARTING property, not the maximum; parcels are
// data; coordinates are not identity. This generator writes the evidence for that as
// two committed SaveFileV13 fixtures whose properties are LARGER THAN THE FOUNDING ONE
// AND CARRY GROUND THAT DID NOT EXIST — produced with ZERO change to `src/core/**`,
// `ui/**`, or any renderer or placement rule.
//
// The studio itself is built ONLY through public Engine/adapter actions (found, sign,
// activate, quote, place). The PROPERTY ROOT is then authored here as PURE DATA. That
// is stated plainly rather than dressed up: there is NO land-acquisition action in
// Campaign 1 — land acquisition is Campaign 3's mechanic — so no sequence of public
// actions can grow a property today, and a generator that pretended otherwise would be
// lying about its own authority. The authoring is legitimate precisely BECAUSE the
// engine treats a property as state: every fixture below is then proved through the
// SAME authorities a player's world goes through —
//
//   • `assertStudioPlacementInvariants` (property bounds, road/parcel rectangles,
//     structure geometry, provides-links, and every V12 placement law);
//   • `placementQuote` / `placeFacilityAction` — the one legality authority, which
//     never sees a caller-supplied occupancy set;
//   • `exportSaveJson` / `importSaveJson` — the live V13 save boundary, asserted
//     byte-identical on round-trip.
//
// NOTHING HERE SHIPS TO PLAYERS. `INITIAL_PROPERTY` is untouched, the 28×26 starting
// lot is untouched, and no new zone reaches a live game. These are fixtures.
//
// EVIDENCE CHAIN (the idiom `gen-live-week-advance-fixtures.mts` established): every
// fixture is verified at the SAVE boundary, written, re-read from disk, and hashed;
// the manifest records byteLength + sha256 + the exact property claim; a re-run prints
// `unchanged` for every file when the fixture reproduces byte-identically. NO canvas
// anchors and NO structural tuples are claimed anywhere — these worlds differ from the
// pinned Week-0 studios by design.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertStudioPlacementInvariants,
  clonePropertyState,
  parcelById,
  parcelHasRoadFrontage,
  stableStringify,
} from '../src/core/index.ts'
import type {
  LotParcel,
  LotRect,
  PropertyState,
  PropertyStructure,
} from '../src/core/index.ts'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
  studioPlacement,
} from '../ui/src/engine/adapter.ts'
import type { CreativeRole, GameState } from '../ui/src/engine/adapter.ts'

const GENERATOR = 'scripts/gen-expanded-property-fixtures.mts'
const OUTPUT_DIRECTORY = 'ui/e2e/expanded-property-v1'
const REPRODUCE_COMMAND =
  'node_modules/.bin/vite-node scripts/gen-expanded-property-fixtures.mts'
const TERM_WEEKS = 104
/** The smallest roster that founds a studio, so the fixture boots fast in a browser. */
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 1,
  craft: 1,
}
const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]
const ANNEX_BLUEPRINT = 'development-casting-annex'

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`expanded-property fixture invariant: ${message}`)
}

function sha256(bytes: string): string {
  return createHash('sha256').update(bytes, 'utf8').digest('hex')
}

// ── the studio, through public actions only ──────────────────────────────────

type FoundingSigning = { id: string; name: string; role: CreativeRole; termWeeks: number }

function foundManagedStudio(seed: string): { state: GameState; signings: FoundingSigning[] } {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  const signings: FoundingSigning[] = []
  for (const role of ROLE_ORDER) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    invariant(
      selected.length === FOUNDING_COUNTS[role],
      `${seed} has ${String(selected.length)} founding ${role} applicants, expected ${String(FOUNDING_COUNTS[role])}`,
    )
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, TERM_WEEKS)
      invariant(signed.ok, `signContract(${card.profile.id}) rejected`)
      state = signed.next
      signings.push({
        id: card.profile.id,
        name: card.profile.name,
        role,
        termWeeks: TERM_WEEKS,
      })
    }
  }
  const founded = foundManagedStudioAction(state)
  invariant(founded.ok, 'foundManagedStudio rejected')
  state = founded.next
  invariant(state.operations.mode === 'managed', 'the fixture studio is not in managed operations')
  invariant(state.placement.mode === 'managed', 'the fixture studio is not in managed placement')
  invariant(state.market.tick === 0, 'the fixture studio did not stay in Week 0')
  return { state, signings }
}

// ── zone authoring, as pure data ─────────────────────────────────────────────

function parcel(
  id: string,
  label: string,
  terrain: LotParcel['terrain'],
  rect: LotRect,
): LotParcel {
  return { id, label, terrain, rect, ownedFromStart: true }
}

/**
 * THE SOUTH YARD — a second buildable zone, beyond the founding gate.
 *
 * Eight rows of new ground (depth 26 → 34), two new roads continuing the studio's own
 * circulation through the gate, and FOUR parcels chosen so the zone reproduces the
 * founding property's ENTIRE rule surface rather than a convenient corner of it:
 *
 *   • two buildable parcels that genuinely front a road (the build sites);
 *   • one buildable parcel with NO road frontage, so `noRoadAccess` is a live rule on
 *     the new ground exactly as `north-back-lot` makes it live on the old;
 *   • one `blocked` parcel, so `terrainUnbuildable` has a real subject down here too.
 *
 * The founding 28×26 content is carried through VERBATIM — same bounds width, same
 * five roads, same ten parcels, same eight structures. The zone is purely additive.
 */
function southYardProperty(base: PropertyState): PropertyState {
  const property = clonePropertyState(base)
  property.bounds = { width: property.bounds.width, depth: 34 }
  property.roads = [
    ...property.roads,
    // The studio boulevard, continued south THROUGH the gate arch into the new ground.
    { x0: 9, y0: 26, x1: 10, y1: 33 },
    // The south yard's own service road, crossing it.
    { x0: 2, y0: 28, x1: 20, y1: 29 },
  ]
  property.parcels = [
    ...property.parcels,
    parcel('south-yard-west', 'South Yard West', 'buildable', { x0: 2, y0: 30, x1: 7, y1: 33 }),
    parcel('south-yard-east', 'South Yard East', 'buildable', { x0: 12, y0: 30, x1: 19, y1: 33 }),
    // Owned, graded, and unserved: no road touches it, so nothing may be built there yet.
    parcel('south-yard-back', 'South Yard Back Ground', 'buildable', {
      x0: 23,
      y0: 26,
      x1: 27,
      y1: 27,
    }),
    // Owned and protected: the water tank hardstanding.
    parcel('south-yard-tank', 'South Yard Tank Pad', 'blocked', {
      x0: 22,
      y0: 30,
      x1: 26,
      y1: 33,
    }),
  ]
  return property
}

const FAR_PROPERTY_ROADS: readonly LotRect[] = [
  { x0: 28, y0: 7, x1: 59, y1: 8 }, // the studio avenue, continued east
  { x0: 40, y0: 0, x1: 41, y1: 59 }, // the north–south spine
  { x0: 0, y0: 28, x1: 59, y1: 29 }, // the south avenue
  { x0: 20, y0: 30, x1: 21, y1: 59 }, // the south spur
  { x0: 13, y0: 26, x1: 14, y1: 29 }, // the stage road, joined to the south avenue
]

const FAR_PROPERTY_PARCELS: readonly LotParcel[] = [
  parcel('east-field-north', 'East Field North', 'buildable', { x0: 32, y0: 0, x1: 38, y1: 6 }),
  parcel('east-field-south', 'East Field South', 'buildable', { x0: 32, y0: 9, x1: 38, y1: 25 }),
  parcel('east-ridge-north', 'East Ridge North', 'buildable', { x0: 43, y0: 0, x1: 49, y1: 6 }),
  parcel('east-ridge-south', 'East Ridge South', 'buildable', { x0: 43, y0: 9, x1: 49, y1: 25 }),
  parcel('far-east-north', 'Far East North', 'buildable', { x0: 51, y0: 0, x1: 59, y1: 6 }),
  parcel('far-east-south', 'Far East South', 'buildable', { x0: 51, y0: 9, x1: 59, y1: 25 }),
  parcel('south-yard-west', 'South Yard West', 'buildable', { x0: 0, y0: 30, x1: 18, y1: 44 }),
  parcel('south-yard-east', 'South Yard East', 'buildable', { x0: 23, y0: 30, x1: 38, y1: 44 }),
  parcel('south-ridge-east', 'South Ridge East', 'buildable', { x0: 43, y0: 30, x1: 59, y1: 44 }),
  parcel('far-south-west', 'Far South West', 'buildable', { x0: 0, y0: 46, x1: 19, y1: 59 }),
  parcel('far-south-mid', 'Far South Middle', 'buildable', { x0: 22, y0: 46, x1: 38, y1: 59 }),
  parcel('far-south-east', 'Far South East', 'buildable', { x0: 42, y0: 46, x1: 59, y1: 59 }),
]

/** Sixteen further authored bodies, in the corridor between the old lot and the new. */
function farPropertyStructures(): PropertyStructure[] {
  const origins: { gx: number; gy: number }[] = []
  for (const gy of [0, 2, 4]) for (const gx of [28, 30]) origins.push({ gx, gy })
  for (const gy of [10, 12, 14, 16, 18]) for (const gx of [28, 30]) origins.push({ gx, gy })
  return origins.map((origin, index) => ({
    id: `property-depot-${String(index + 1)}`,
    label: `Property Depot ${String(index + 1)}`,
    // A civic body with no engine capacity, exactly as the Gate and Theater are: every
    // real `INITIAL_STUDIO_FACILITIES` entry already has exactly one home, and claiming
    // one twice is an invariant failure rather than a convenience.
    role: 'landmark' as const,
    origin,
    footprint: { width: 2, depth: 2 },
    providesFacilityIds: [],
  }))
}

/**
 * A property FAR beyond the founding count: 60×60, twenty-two parcels, twenty-four
 * authored structures, ten roads. Nothing in the engine caps any of the three.
 */
function farProperty(base: PropertyState): PropertyState {
  const property = clonePropertyState(base)
  property.bounds = { width: 60, depth: 60 }
  property.roads = [...property.roads, ...FAR_PROPERTY_ROADS.map((road) => ({ ...road }))]
  property.parcels = [
    ...property.parcels,
    ...FAR_PROPERTY_PARCELS.map((entry) => ({ ...entry, rect: { ...entry.rect } })),
  ]
  property.structures = [...property.structures, ...farPropertyStructures()]
  return property
}

/** Every parcel the founding property already had, unchanged, in its original order. */
function assertFoundingContentIsCarriedThrough(
  base: PropertyState,
  expanded: PropertyState,
): void {
  invariant(
    stableStringify(expanded.parcels.slice(0, base.parcels.length)) ===
      stableStringify(base.parcels),
    'the expanded property rewrote a founding parcel',
  )
  invariant(
    stableStringify(expanded.roads.slice(0, base.roads.length)) === stableStringify(base.roads),
    'the expanded property rewrote a founding road',
  )
  invariant(
    stableStringify(expanded.structures.slice(0, base.structures.length)) ===
      stableStringify(base.structures),
    'the expanded property rewrote a founding structure',
  )
}

// ── placements, through the one legality authority ───────────────────────────

/** The first origin on a named parcel that the ENGINE'S OWN quote calls legal. */
function firstLegalOrigin(
  state: GameState,
  parcelId: string,
  blueprintId: string,
): { gx: number; gy: number } {
  const rect = studioPlacement(state).parcels.find((entry) => entry.id === parcelId)?.rect
  invariant(rect !== undefined, `property has no parcel "${parcelId}"`)
  for (let gy = rect.y0; gy <= rect.y1; gy++) {
    for (let gx = rect.x0; gx <= rect.x1; gx++) {
      if (placementQuote(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
    }
  }
  throw new Error(`no legal ${blueprintId} origin exists anywhere on parcel "${parcelId}"`)
}

function place(state: GameState, parcelId: string, blueprintId: string): GameState {
  const origin = firstLegalOrigin(state, parcelId, blueprintId)
  const committed = placeFacilityAction(state, { blueprintId, origin })
  invariant(committed.ok, `placeFacility on "${parcelId}" rejected`)
  return committed.next
}

// ── fixtures ─────────────────────────────────────────────────────────────────

type GeneratedFixture = {
  id: string
  file: string
  seed: string
  state: GameState
  claim: Record<string, unknown>
  actionRecipe: readonly Record<string, unknown>[]
}

function propertyClaim(state: GameState): Record<string, unknown> {
  const view = studioPlacement(state)
  return {
    week: state.market.tick,
    bounds: { width: view.lotWidth, depth: view.lotDepth },
    roadCount: state.property.roads.length,
    parcelCount: state.property.parcels.length,
    parcelIds: state.property.parcels.map((entry) => entry.id),
    buildableParcelIds: state.property.parcels
      .filter((entry) => entry.terrain === 'buildable')
      .map((entry) => entry.id),
    roadServedParcelIds: state.property.parcels
      .filter((entry) => parcelHasRoadFrontage(state.property, entry))
      .map((entry) => entry.id),
    structureCount: state.property.structures.length,
    structureIds: state.property.structures.map((entry) => entry.id),
    placementCount: state.placement.facilities.length,
    placements: state.placement.facilities.map((placed) => ({
      id: placed.id,
      blueprintId: placed.blueprintId,
      parcelId: placed.parcelId,
      facilityId: placed.facilityId,
      projectId: placed.projectId,
      origin: placed.origin,
      status: placed.status,
    })),
    cash: state.studio.cash,
  }
}

function southYardFixture(): GeneratedFixture {
  const seed = 'c1-m6-south-yard'
  const founded = foundManagedStudio(seed)
  const base = founded.state.property
  const property = southYardProperty(base)
  assertFoundingContentIsCarriedThrough(base, property)
  const state: GameState = { ...founded.state, property }

  // Proved through the LIVE authorities, before a byte is written.
  assertStudioPlacementInvariants(state)
  for (const id of ['south-yard-west', 'south-yard-east'] as const) {
    const entry = parcelById(property, id)
    invariant(entry !== null, `the South Yard is missing parcel "${id}"`)
    invariant(parcelHasRoadFrontage(property, entry), `parcel "${id}" has no road frontage`)
    invariant(
      placementQuote(state, { blueprintId: ANNEX_BLUEPRINT, origin: { gx: entry.rect.x0, gy: entry.rect.y0 } }).ok,
      `the studio cannot legally build at the origin of "${id}"`,
    )
  }
  const back = parcelById(property, 'south-yard-back')
  invariant(back !== null, 'the South Yard is missing its unserved back ground')
  invariant(
    !parcelHasRoadFrontage(property, back),
    'the unserved back ground unexpectedly fronts a road',
  )
  // The same origin is OFF-LOT on the founding property: this ground genuinely did not
  // exist a moment ago, which is the whole claim.
  invariant(
    placementQuote(founded.state, { blueprintId: ANNEX_BLUEPRINT, origin: { gx: 12, gy: 30 } })
      .primary === 'offLot',
    'the South Yard origin was already on the founding property',
  )
  invariant(state.placement.facilities.length === 0, 'the South Yard fixture ships pre-built')

  return {
    id: 'week-0-south-yard-second-zone',
    file: 'week-0-south-yard-second-zone.save.json',
    seed,
    state,
    claim: {
      ...propertyClaim(state),
      zone: {
        name: 'South Yard',
        addedDepth: property.bounds.depth - base.bounds.depth,
        addedRoads: property.roads.length - base.roads.length,
        addedParcels: property.parcels.map((entry) => entry.id).slice(base.parcels.length),
        buildSites: ['south-yard-west', 'south-yard-east'],
        unservedGround: 'south-yard-back',
        protectedGround: 'south-yard-tank',
      },
    },
    actionRecipe: [
      { action: 'newGame', seed },
      {
        action: 'signContract',
        selector: 'first N foundingApplicantCards in authoritative draft order for each role',
        roleOrder: ROLE_ORDER,
        counts: FOUNDING_COUNTS,
        termWeeks: TERM_WEEKS,
        resolvedSignings: founded.signings,
      },
      { action: 'foundManagedStudio', resultWeek: 0 },
      {
        authoring: 'property',
        note: 'DATA ONLY. There is no land-acquisition action in Campaign 1, so the property root is authored by this generator and then proved through assertStudioPlacementInvariants, placementQuote, and the live SaveFileV13 boundary.',
        boundsDepth: { from: base.bounds.depth, to: property.bounds.depth },
        addedRoads: [
          { x0: 9, y0: 26, x1: 10, y1: 33 },
          { x0: 2, y0: 28, x1: 20, y1: 29 },
        ],
        addedParcels: property.parcels.slice(base.parcels.length),
        foundingContentChanged: false,
      },
    ],
  }
}

function farPropertyFixture(): GeneratedFixture {
  const seed = 'c1-m6-far-property'
  const founded = foundManagedStudio(seed)
  const base = founded.state.property
  const property = farProperty(base)
  assertFoundingContentIsCarriedThrough(base, property)
  let state: GameState = { ...founded.state, property }
  assertStudioPlacementInvariants(state)

  invariant(property.parcels.length >= 20, 'the far property carries fewer than twenty parcels')
  invariant(property.structures.length >= 24, 'the far property carries fewer than two dozen structures')

  // One placement per NEW parcel, each through the one legality authority.
  for (const entry of FAR_PROPERTY_PARCELS) {
    state = place(state, entry.id, ANNEX_BLUEPRINT)
    assertStudioPlacementInvariants(state)
  }
  invariant(
    state.placement.facilities.length === FAR_PROPERTY_PARCELS.length,
    `the far property carries ${String(state.placement.facilities.length)} placements, expected ${String(FAR_PROPERTY_PARCELS.length)}`,
  )
  invariant(state.studio.cash > 0, 'the far property fixture spent the studio into deficit')
  const facilityIds = state.placement.facilities.map((placed) => placed.facilityId)
  invariant(new Set(facilityIds).size === facilityIds.length, 'two placements share a facility id')
  const parcelIds = state.placement.facilities.map((placed) => placed.parcelId)
  invariant(new Set(parcelIds).size === parcelIds.length, 'two placements landed on one parcel')

  return {
    id: 'week-0-far-property-twenty-two-parcels',
    file: 'week-0-far-property-twenty-two-parcels.save.json',
    seed,
    state,
    claim: {
      ...propertyClaim(state),
      farBeyondFounding: {
        foundingBounds: base.bounds,
        foundingParcelCount: base.parcels.length,
        foundingStructureCount: base.structures.length,
        parcelsAdded: property.parcels.length - base.parcels.length,
        structuresAdded: property.structures.length - base.structures.length,
        roadsAdded: property.roads.length - base.roads.length,
      },
    },
    actionRecipe: [
      { action: 'newGame', seed },
      {
        action: 'signContract',
        selector: 'first N foundingApplicantCards in authoritative draft order for each role',
        roleOrder: ROLE_ORDER,
        counts: FOUNDING_COUNTS,
        termWeeks: TERM_WEEKS,
        resolvedSignings: founded.signings,
      },
      { action: 'foundManagedStudio', resultWeek: 0 },
      {
        authoring: 'property',
        note: 'DATA ONLY, as above. Founding roads, parcels, and structures carried through verbatim; twelve parcels, sixteen structures, and five roads added.',
        bounds: { from: base.bounds, to: property.bounds },
        addedParcels: FAR_PROPERTY_PARCELS.map((entry) => entry.id),
        addedStructures: farPropertyStructures().map((entry) => entry.id),
        foundingContentChanged: false,
      },
      {
        action: 'placeFacility',
        blueprintId: ANNEX_BLUEPRINT,
        selector: 'the first origin on each added parcel that placementQuote calls legal',
        parcelOrder: FAR_PROPERTY_PARCELS.map((entry) => entry.id),
        resultWeek: 0,
      },
    ],
  }
}

// ── the save boundary ────────────────────────────────────────────────────────

function verifiedSave(state: GameState): { bytes: string; sha256: string; byteLength: number } {
  const bytes = exportSaveJson(state)
  const envelope = JSON.parse(bytes) as { saveVersion?: unknown }
  invariant(envelope.saveVersion === 13, `exported envelope is SaveFileV${String(envelope.saveVersion)}`)
  const imported = importSaveJson(bytes)
  invariant(imported.ok, `generated SaveFileV13 import rejected — ${imported.ok ? '' : imported.error}`)
  invariant(imported.converted === false, 'generated SaveFileV13 was reported as converted')
  invariant(exportSaveJson(imported.state) === bytes, 'SaveFileV13 import/export roundtrip changed bytes')
  // The reloaded world is governed by the property the file carried, not by the
  // authored constants — the point of the whole fixture.
  invariant(
    stableStringify(imported.state.property) === stableStringify(state.property),
    'the reloaded world did not keep the property the file described',
  )
  return { bytes, sha256: sha256(bytes), byteLength: Buffer.byteLength(bytes, 'utf8') }
}

function writeVerified(path: string, bytes: string): 'unchanged' | 'written' {
  const unchanged = existsSync(path) && readFileSync(path, 'utf8') === bytes
  writeFileSync(path, bytes, 'utf8')
  const disk = readFileSync(path, 'utf8')
  invariant(disk === bytes, `disk verification failed for ${path}`)
  invariant(sha256(disk) === sha256(bytes), `disk hash verification failed for ${path}`)
  return unchanged ? 'unchanged' : 'written'
}

const fixtures = [southYardFixture(), farPropertyFixture()]
const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(here, '..')
const outputDirectory = join(repositoryRoot, OUTPUT_DIRECTORY)
mkdirSync(outputDirectory, { recursive: true })

const manifestFixtures = fixtures.map((fixture) => {
  const verified = verifiedSave(fixture.state)
  const status = writeVerified(join(outputDirectory, fixture.file), verified.bytes)
  // eslint-disable-next-line no-console
  console.log(
    `${status}: ${fixture.file} · ${String(verified.byteLength)} bytes · sha256 ${verified.sha256}`,
  )
  return {
    id: fixture.id,
    file: fixture.file,
    saveVersion: 13,
    byteLength: verified.byteLength,
    sha256: verified.sha256,
    seed: fixture.seed,
    claim: fixture.claim,
    actionRecipe: fixture.actionRecipe,
  }
})

const manifest = `${JSON.stringify(
  {
    schemaVersion: 'c1-m6-expanded-property-fixtures-v1',
    generatedBy: GENERATOR,
    reproduceCommand: REPRODUCE_COMMAND,
    outputDirectory: OUTPUT_DIRECTORY,
    authority: {
      studioConstruction: 'public Engine actions and UI adapter action boundaries only',
      propertyConstruction:
        'AUTHORED AS DATA BY THIS GENERATOR — Campaign 1 has no land-acquisition action (that is Campaign 3). Every authored property is then proved through assertStudioPlacementInvariants, the one placementQuote/placeFacilityAction legality authority, and the live SaveFileV13 boundary.',
      placements: 'placeFacilityAction, at origins placementQuote called legal',
      serialization: 'exportSaveJson / importSaveJson live SaveFileV13 boundary',
      deterministic: true,
      generatedFilesAreHandEdited: false,
      claimsCanvasAnchors: false,
      claimsStructuralTuples: false,
      shipsToPlayers: false,
      initialPropertyUntouched: true,
    },
    commonFoundingRecipe: {
      applicantSelection: 'first N foundingApplicantCards in authoritative draft order for each role',
      roleOrder: ROLE_ORDER,
      counts: FOUNDING_COUNTS,
      termWeeks: TERM_WEEKS,
      managedSystemsActivated: ['Studio Operations', 'Studio Placement'],
    },
    fixtures: manifestFixtures,
  },
  null,
  2,
)}\n`
const manifestStatus = writeVerified(join(outputDirectory, 'manifest.json'), manifest)
// eslint-disable-next-line no-console
console.log(
  `${manifestStatus}: manifest.json · ${String(Buffer.byteLength(manifest, 'utf8'))} bytes · sha256 ${sha256(manifest)}`,
)
