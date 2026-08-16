// ── Presence on the Lot V1 — the grid world, in a real browser ───────────────
//
// One spec, the milestone's own acceptance walk: a fresh managed studio commissions a
// screenplay IN THE WORLD, advances one week, and the writer ends the week standing at
// Development's door with the building's sign counting them and the person panel quoting
// what they are doing.
//
// It runs on the 5179 origin — the SHIPPED DEFAULT world — with the grid → screen helper
// `tycoon-build-mode-v1.spec.ts` established, and records its own freshly measured
// structural tuples under its own fixture names (law 25).
//
// Every position assertion is a FINAL-STATE assertion. Mid-animation geometry is not a
// contract: the milestone's law is that the settled frame equals the projection, and that
// is what is measured — after the playback has finished, or after it has been skipped.

import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  advanceWeek,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  signContractAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'
// A spec is not a UI component: the accepted test fixtures already build state through
// the engine's own public surface (see ui/src/lot/studio-lot-snapshot.test.ts).
import { applyActions, studioPresence } from '../../src/core/index.ts'
import { PERSON_HOME, PLACE_BY_BUILDING } from '../src/lot/tycoon/world.ts'
import { PLAYBACK_DURATION_MS } from '../src/lot/tycoon/playback.ts'

const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** Development stands at grid (3,2)–(5,3); this cell is its own ground. */
const DEVELOPMENT_CELL = { gx: 4, gy: 3 }
/** The Theater, used only to move the rail off whatever it was showing. */
const THEATER_CELL = { gx: 4, gy: 17 }

test.describe.configure({ timeout: 240_000 })

// ── the named fixtures ───────────────────────────────────────────────────────
//
// TWO fixtures, because the engine's two kinds of facility work have two different
// shapes and this milestone has to be honest about both:
//
//   • GRID PRESENCE — a founded, managed, script-developing Week-0 studio. Screenplay
//     drafting is a ONE-WEEK engine task (`dueWeek = commissionedWeek + 1`), so a
//     commissioned writer occupies Development for exactly the week they are
//     commissioned in and is released to the roster at the next tick. That is what the
//     commissioning arm below measures — including the release, which is presence
//     following engine truth rather than the renderer keeping a body where it liked it.
//   • GRID PRESENCE GREENLIT — the same studio with one greenlit picture. A production
//     holds its phase's reservation ACROSS weeks (development at remainingTicks 8), so
//     this is the fixture that can prove "advance one week and the company is standing
//     at the building it walked to".
//
// Both are built by calling engine actions in-spec with a named seed. Nothing is
// hand-edited; cash and roster are whatever the engine produced (law 24).

function gridPresenceState(): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state: GameState = newGame('tycoon-presence-on-the-lot-v1')
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, required[role])
    if (selected.length !== required[role]) throw new Error(`fixture lacks ${role} applicants`)
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  // `foundManagedStudioAction` already activates the managed script-development regime,
  // which is the verb this spec drives in the browser.
  if (founded.next.scriptDevelopment.mode !== 'managed') {
    throw new Error('fixture is not a managed script-development studio')
  }
  return founded.next
}

const GRID_PRESENCE_STATE = gridPresenceState()

function roster(state: GameState, role: CreativeRole): { id: string; name: string }[] {
  return state.contracts
    .map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
    .filter((talent) => talent.role === role)
    .map((talent) => ({ id: talent.id, name: talent.name }))
}

/** The one contracted writer — the person this spec follows across the property. */
const WRITER = (() => {
  const writer = roster(GRID_PRESENCE_STATE, 'writer')[0]
  if (writer === undefined) throw new Error('fixture has no contracted writer')
  return writer
})()

const DIRECTOR = (() => {
  const director = roster(GRID_PRESENCE_STATE, 'director')[0]
  if (director === undefined) throw new Error('fixture has no contracted director')
  return director
})()

/**
 * The same studio with one picture greenlit — built the only way a managed studio can:
 * commission a screenplay, let the one-week draft resolve, accept it, greenlight it.
 *
 * A greenlit picture opens at `remainingTicks` 8 = the `development` phase, whose one
 * reservation is a Development & Casting slot held by the writer and the director. A
 * production holds its phase reservation ACROSS weeks, which is exactly why this is the
 * fixture that can prove a company walking to work on a week advance.
 */
function gridGreenlitState(): GameState {
  const concept = GRID_PRESENCE_STATE.concepts[0]!
  const actors = roster(GRID_PRESENCE_STATE, 'actor')
  const crafts = roster(GRID_PRESENCE_STATE, 'craft')
  let state = applyActions(GRID_PRESENCE_STATE, [
    {
      kind: 'commissionScript',
      project: {
        conceptId: concept.id,
        writerId: WRITER.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: {
            intimacy: [-0.5, 0.5],
            tonalWeight: [-0.5, 0.5],
            kineticEnergy: [-0.5, 0.5],
          },
        },
      },
    },
  ])
  state = advanceWeek(state).next
  const projectId = state.scriptDevelopment.projects[0]!.id
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId,
        directorId: DIRECTOR.id,
        craftIds: [crafts[0]!.id],
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
  if (state.studio.activeProductions.length !== 1) {
    throw new Error('greenlit fixture did not produce exactly one active production')
  }
  if (state.studio.activeProductions[0]!.remainingTicks !== 8) {
    throw new Error('greenlit fixture did not open in the development phase')
  }
  return state
}

const GRID_GREENLIT_STATE = gridGreenlitState()
/** The week the greenlit fixture opens on — the commission cost it one real advance. */
const GREENLIT_WEEK = GRID_GREENLIT_STATE.market.tick
/** The picture whose company this spec watches walk to work. */
const PICTURE_TITLE = GRID_PRESENCE_STATE.concepts[0]!.title

function replayableSave(state: GameState, label: string): string {
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error(`${label} fixture does not replay byte-identically`)
  }
  return bytes
}

const GRID_PRESENCE_SAVE = replayableSave(GRID_PRESENCE_STATE, 'grid presence')
const GRID_GREENLIT_SAVE = replayableSave(GRID_GREENLIT_STATE, 'grid presence greenlit')

/** Week 0 presence, from the engine itself: nobody is claimed by anything yet. */
const WEEK_0_PRESENCE = studioPresence(GRID_PRESENCE_STATE)
/** …and with the picture greenlit, the writer and the director are claimed at once. */
const WEEK_0_GREENLIT_PRESENCE = studioPresence(GRID_GREENLIT_STATE)

// ── renderer instrumentation (the seam the build-mode suite established) ─────

function instrumentRendererSource(source: string): string {
  const marker = 'constructor(opts) {\n    this.opts = opts;'
  if (!source.includes(marker)) throw new Error('StudioLotView constructor marker is absent')
  return source.replace(
    marker,
    `constructor(opts) {
    globalThis.__projectStudioGridWorld = this;
    this.opts = opts;`,
  )
}

type SeedOptions = { reducedMotion?: 'reduce' | 'no-preference'; save?: string }

async function seed(page: Page, options: SeedOptions = {}) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    localStorage.removeItem(config.lotFlag)
    localStorage.removeItem(config.hollywoodFlag)
    localStorage.removeItem(config.tycoonFlag)
    localStorage.setItem(config.identityFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    identityFlag: IDENTITY_PROOF_FLAG_KEY,
    save: options.save ?? GRID_PRESENCE_SAVE,
  })
  // DEFAULT is no-preference here, unlike the build-mode suite: this milestone's whole
  // point is motion, and reduced motion is proved as its own explicit arm below.
  await page.emulateMedia({ reducedMotion: options.reducedMotion ?? 'no-preference' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-performance')).toBeVisible()
  await expect(page.getByTestId('hollywood-performance')).not.toHaveAttribute(
    'data-draw-calls',
    '0',
    { timeout: 30_000 },
  )
}

function watchRuntime(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  return { pageErrors, consoleErrors }
}

type GridStand = {
  talentId: string
  stance: 'home' | 'at-site' | 'waiting'
  site: string | null
  destination: { gx: number; gy: number } | null
  sprite: { x: number; y: number } | null
}

type GridDebug = {
  selectedPlaceId: string | null
  selectedPersonId: string | null
  lodBand: 'institution' | 'operations' | 'people'
  buildingLabels: string[]
  presenceWeek: number | null
  presencePlaybackWeek: number | null
  presencePlaybackMs: number | null
  presenceOccupants: [string, number][]
  presenceStands: GridStand[]
}

async function gridDebug(page: Page): Promise<GridDebug> {
  const debug = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: { tycoonDebugState(): unknown }
    }
    return root.__projectStudioGridWorld?.tycoonDebugState() ?? null
  })
  if (debug === null) throw new Error('the grid world renderer is not instrumented')
  return debug as GridDebug
}

async function pointFraction(
  page: Page,
  gx: number,
  gy: number,
): Promise<{ fx: number; fy: number }> {
  const fraction = await page.evaluate(
    ({ gx: px, gy: py }) => {
      const root = globalThis as typeof globalThis & {
        __projectStudioGridWorld?: {
          worldPointFraction(gx: number, gy: number): { fx: number; fy: number } | null
        }
      }
      return root.__projectStudioGridWorld?.worldPointFraction(px, py) ?? null
    },
    { gx, gy },
  )
  if (fraction === null) throw new Error(`grid point ${String(gx)},${String(gy)} has no projection`)
  return fraction
}

async function cellFraction(page: Page, gx: number, gy: number) {
  const fraction = await page.evaluate(
    ({ gx: cx, gy: cy }) => {
      const root = globalThis as typeof globalThis & {
        __projectStudioGridWorld?: {
          worldCellFraction(gx: number, gy: number): { fx: number; fy: number } | null
        }
      }
      return root.__projectStudioGridWorld?.worldCellFraction(cx, cy) ?? null
    },
    { gx, gy },
  )
  if (fraction === null) throw new Error(`cell ${String(gx)},${String(gy)} has no projection`)
  return fraction
}

async function screenPoint(
  page: Page,
  fraction: { fx: number; fy: number },
): Promise<{ x: number; y: number }> {
  const canvas: Locator = page.getByTestId('studio-lot-canvas').locator('canvas')
  const box = await canvas.boundingBox()
  if (box === null) throw new Error('the lot canvas has no box')
  expect(fraction.fx).toBeGreaterThan(0)
  expect(fraction.fx).toBeLessThan(1)
  expect(fraction.fy).toBeGreaterThan(0)
  expect(fraction.fy).toBeLessThan(1)
  return { x: box.x + fraction.fx * box.width, y: box.y + fraction.fy * box.height }
}

async function clickCell(page: Page, gx: number, gy: number): Promise<void> {
  const point = await screenPoint(page, await cellFraction(page, gx, gy))
  await page.mouse.move(point.x, point.y)
  await page.mouse.click(point.x, point.y)
}

async function clickGridPoint(page: Page, gx: number, gy: number): Promise<void> {
  const point = await screenPoint(page, await pointFraction(page, gx, gy))
  await page.mouse.move(point.x, point.y)
  await page.mouse.click(point.x, point.y)
}

async function structure(page: Page) {
  return page.getByTestId('hollywood-performance').evaluate((node) => ({
    displayObjects: Number(node.getAttribute('data-display-objects')),
    dynamicActors: Number(node.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(node.getAttribute('data-decoded-bytes')),
    drawCalls: Number(node.getAttribute('data-draw-calls')),
  }))
}

/** Commission a screenplay entirely inside the world: building → panel → workspace. */
async function commissionInWorld(page: Page): Promise<void> {
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-open-details-writers').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  // Name the writer explicitly. The engine does not require a commission's writer to be
  // a writer by profession, so the form's default is not a safe fixture input: this spec
  // is about ONE named person, and it says which.
  await page.getByTestId('script-writer').selectOption(WRITER.id)
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
}

/** The distance, in world pixels, between a sprite and the grid point it should be on. */
async function spriteOffsetFrom(
  page: Page,
  sprite: { x: number; y: number },
  gx: number,
  gy: number,
): Promise<number> {
  const target = await page.evaluate(
    ({ gx: px, gy: py }) => {
      const root = globalThis as typeof globalThis & {
        __projectStudioGridWorld?: {
          worldProjection(): { tileWidth: number; tileHeight: number }
        }
      }
      const projection = root.__projectStudioGridWorld?.worldProjection()
      if (projection === undefined) return null
      // The same isometric transform the scene uses (../src/lot/scene/iso.ts).
      return {
        x: (px - py) * (projection.tileWidth / 2),
        y: (px + py) * (projection.tileHeight / 2),
      }
    },
    { gx, gy },
  )
  if (target === null) throw new Error('the grid world camera is unavailable')
  return Math.hypot(sprite.x - target.x, sprite.y - target.y)
}


/** The stand for one person in the current settled world, asserted to exist. */
function standFor(debug: GridDebug, talentId: string): GridStand {
  const stand = debug.presenceStands.find((candidate) => candidate.talentId === talentId)
  expect(stand, `a stand exists for ${talentId}`).toBeDefined()
  return stand!
}

/** Assert a person's SPRITE — not just the projection — sits on their standing point. */
async function expectSpriteSettled(page: Page, stand: GridStand): Promise<void> {
  expect(stand.destination, 'the stand names a point on the property').not.toBeNull()
  expect(stand.sprite, 'the person has a rendered body').not.toBeNull()
  expect(
    await spriteOffsetFrom(page, stand.sprite!, stand.destination!.gx, stand.destination!.gy),
    'the body is on the point the projection puts it on',
  ).toBeLessThan(1)
}

// ── 1. THE ACCEPTANCE WALK ───────────────────────────────────────────────────

test('advancing one week walks the company to Development and leaves them there', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, { save: GRID_GREENLIT_SAVE })

  // Week 0, from the engine itself: the picture is in development, and the two people
  // that phase's reservation exists for are claimed by it.
  const claimed = WEEK_0_GREENLIT_PRESENCE.people.filter((person) => person.site !== null)
  expect(claimed.map((person) => person.talentId).sort()).toEqual([WRITER.id, DIRECTOR.id].sort())
  expect(claimed.every((person) => person.site === 'facility-development-casting')).toBe(true)

  const before = await gridDebug(page)
  expect(before.presenceWeek).toBe(GREENLIT_WEEK)
  expect(before.lodBand).toBe('operations')
  expect(before.presenceOccupants).toEqual([['writers', 2]])
  // The picture is already in development at Week 0, so the writer is already claimed.
  const parkedWriter = standFor(before, WRITER.id)
  expect(parkedWriter.stance).toBe('at-site')

  // STRUCTURAL TUPLE — fixture: "grid presence greenlit, Week 0, whole-property framing".
  expect(await structure(page)).toEqual(GRID_GREENLIT_WEEK_0_STRUCTURE)

  // ── advance ONE week: a real playback, of the week just entered ──
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(GREENLIT_WEEK + 1)}$`))
  const playing = await gridDebug(page)
  expect(playing.presenceWeek).toBe(GREENLIT_WEEK + 1)
  expect(playing.presencePlaybackWeek).toBe(GREENLIT_WEEK + 1)
  expect(playing.presencePlaybackMs).not.toBeNull()

  // …and it is a WALK, not a cut. Sampled over two seconds, the writer's body occupies
  // more than one position: the only mid-animation claim this spec makes, and it is a
  // claim about MOTION EXISTING, never about geometry at an instant.
  const walked = new Set<string>()
  for (let sample = 0; sample < 10; sample++) {
    const frame = await gridDebug(page)
    if (frame.presencePlaybackWeek === null) break
    const body = frame.presenceStands.find((stand) => stand.talentId === WRITER.id)?.sprite
    if (body !== undefined && body !== null) walked.add(`${body.x.toFixed(2)},${body.y.toFixed(2)}`)
    await page.waitForTimeout(200)
  }
  expect(walked.size, 'the writer moved across the property during the playback').toBeGreaterThan(1)

  // …which finishes on its own, inside the window the milestone specified.
  await expect
    .poll(async () => (await gridDebug(page)).presencePlaybackWeek, {
      timeout: PLAYBACK_DURATION_MS + 10_000,
    })
    .toBeNull()

  // ── FINAL STATE — the assertion this milestone exists for ──
  const settled = await gridDebug(page)
  expect(settled.presenceWeek).toBe(GREENLIT_WEEK + 1)
  const writerStand = standFor(settled, WRITER.id)
  expect(writerStand.stance).toBe('at-site')
  expect(writerStand.site).toBe('writers')
  const door = PLACE_BY_BUILDING.writers.anchors.work!
  expect(
    Math.hypot(writerStand.destination!.gx - door.gx, writerStand.destination!.gy - door.gy),
    'the writer stands within a tile or two of Development’s own door',
  ).toBeLessThan(2)
  await expectSpriteSettled(page, writerStand)
  // The week settles back onto the same site the projection named before the advance —
  // a played week ENDS on the static truth, which is the law this milestone turns on.
  expect(writerStand.destination).toEqual(parkedWriter.destination)
  // …and that point is nowhere near the home zone an unclaimed person parks in.
  expect(
    Math.hypot(
      writerStand.destination!.gx - PERSON_HOME.talent.gx,
      writerStand.destination!.gy - PERSON_HOME.talent.gy,
    ),
    'the writer is standing at work, not in the Casting forecourt',
  ).toBeGreaterThan(4)
  const directorStand = standFor(settled, DIRECTOR.id)
  expect(directorStand.site).toBe('writers')
  await expectSpriteSettled(page, directorStand)
  // Exactly the two people the phase's reservation exists for; the cast is at home.
  expect(settled.presenceStands.filter((stand) => stand.stance !== 'home')).toHaveLength(2)

  // ── the sign counts them ──
  expect(settled.presenceOccupants).toEqual([['writers', 2]])
  expect(settled.buildingLabels).toContain('Development • 2 here')

  // ── the person panel quotes the week ──
  await clickGridPoint(page, writerStand.destination!.gx, writerStand.destination!.gy)
  await expect(page.getByTestId('hollywood-person-inspector-status')).toBeVisible()
  await expect(page.getByTestId('hollywood-person-inspector-status')).toContainText(WRITER.name)
  const presenceLine = page.getByTestId('hollywood-person-presence')
  await expect(presenceLine).toHaveAttribute('data-presence-kind', 'at-site')
  await expect(presenceLine).toContainText(PICTURE_TITLE)
  await expect(presenceLine).toContainText('at Development & Casting, slot')

  // ── the facility panel lists them by name and credit ──
  await clickCell(page, THEATER_CELL.gx, THEATER_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  const facts = page.getByTestId('lot-building-inspector-facts')
  await expect(facts).toContainText('Who’s here this week')
  await expect(facts).toContainText(WRITER.name)
  await expect(facts).toContainText(DIRECTOR.name)

  // STRUCTURAL TUPLE — fixture: "grid presence greenlit, Week 1, company at Development".
  // People MOVE; moving them creates and destroys nothing, which is what a second tuple
  // against the first one proves.
  expect(await structure(page)).toEqual(GRID_GREENLIT_WEEK_1_STRUCTURE)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. COMMISSIONING, IN THE WORLD ───────────────────────────────────────────

test('commissioning a screenplay in the world stands the writer at Development at once', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // Week 0 of the un-greenlit studio: nobody is claimed, and no sign counts anybody.
  expect(WEEK_0_PRESENCE.people.every((person) => person.site === null)).toBe(true)
  const idle = await gridDebug(page)
  expect(idle.presenceWeek).toBe(0)
  expect(idle.presenceOccupants).toEqual([])
  expect(idle.presenceStands.every((stand) => stand.stance === 'home')).toBe(true)
  expect(idle.buildingLabels).toContain('Development')
  expect(idle.buildingLabels.some((label) => label.includes('here'))).toBe(false)

  // STRUCTURAL TUPLE — fixture: "grid presence, Week 0, whole-property framing".
  expect(await structure(page)).toEqual(GRID_PRESENCE_WEEK_0_STRUCTURE)

  // ── the commission, driven entirely from the world ──
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-open-details-writers').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  // Name the writer explicitly. The engine does not require a commission's writer to be
  // a writer by profession, so the form's default is not a safe fixture input: this spec
  // is about ONE named person, and it says which.
  await page.getByTestId('script-writer').selectOption(WRITER.id)
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()

  // The SAME mounted world repaints: the writer is at Development for the week they
  // were commissioned in, without any advance and without any playback.
  const drafting = await gridDebug(page)
  expect(drafting.presenceWeek).toBe(0)
  expect(drafting.presencePlaybackWeek).toBeNull()
  const writerStand = standFor(drafting, WRITER.id)
  expect(writerStand.stance).toBe('at-site')
  expect(writerStand.site).toBe('writers')
  await expectSpriteSettled(page, writerStand)
  expect(drafting.presenceOccupants).toEqual([['writers', 1]])
  expect(drafting.buildingLabels).toContain('Development • 1 here')

  // …and the panel quotes the drafting line, in the studio's own words.
  await clickGridPoint(page, writerStand.destination!.gx, writerStand.destination!.gy)
  const presenceLine = page.getByTestId('hollywood-person-presence')
  await expect(presenceLine).toHaveAttribute('data-presence-kind', 'at-site')
  await expect(presenceLine).toContainText('Drafting')
  await expect(presenceLine).toContainText('at Development & Casting, slot 1')

  // ── one week later the DRAFT IS DONE, and the lot says so ──
  // A screenplay draft is a one-week engine task. Presence follows that truth: the
  // writer is released to the roster and the sign stops counting them. A renderer that
  // kept the body where it looked best would be lying about the week.
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 1$/)
  await expect
    .poll(async () => (await gridDebug(page)).presencePlaybackWeek, {
      timeout: PLAYBACK_DURATION_MS + 10_000,
    })
    .toBeNull()
  const reviewed = await gridDebug(page)
  expect(reviewed.presenceWeek).toBe(1)
  expect(standFor(reviewed, WRITER.id).stance).toBe('home')
  expect(reviewed.presenceOccupants).toEqual([])
  expect(reviewed.buildingLabels.some((label) => label.includes('here'))).toBe(false)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 3. SKIP, AND REDUCED MOTION ──────────────────────────────────────────────

test('a canvas press skips the playback onto the settled week without breaking the world', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, { save: GRID_GREENLIT_SAVE })

  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(GREENLIT_WEEK + 1)}$`))
  expect((await gridDebug(page)).presencePlaybackWeek).toBe(GREENLIT_WEEK + 1)

  // A press anywhere on the canvas settles the world at once — here, on empty road.
  const point = await screenPoint(page, await cellFraction(page, 13, 24))
  await page.mouse.click(point.x, point.y)
  const skipped = await gridDebug(page)
  expect(skipped.presencePlaybackWeek).toBeNull()
  const writerStand = standFor(skipped, WRITER.id)
  expect(writerStand.stance).toBe('at-site')
  expect(writerStand.site).toBe('writers')
  // A skip lands the FINAL position, never a frozen mid-walk one.
  await expectSpriteSettled(page, writerStand)

  // …and the world is still fully interactive: selection and hotspots survive.
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await clickGridPoint(page, writerStand.destination!.gx, writerStand.destination!.gy)
  await expect(page.getByTestId('hollywood-person-presence')).toBeVisible()
  expect((await gridDebug(page)).selectedPersonId).toBe(WRITER.id)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

test('reduced motion advances straight to the settled week with no playback at all', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, { save: GRID_GREENLIT_SAVE, reducedMotion: 'reduce' })
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)

  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(GREENLIT_WEEK + 1)}$`))
  const settled = await gridDebug(page)
  expect(settled.presencePlaybackWeek).toBeNull()
  expect(settled.presencePlaybackMs).toBeNull()
  const writerStand = standFor(settled, WRITER.id)
  expect(writerStand.stance).toBe('at-site')
  expect(writerStand.site).toBe('writers')
  await expectSpriteSettled(page, writerStand)
  expect(settled.presenceOccupants).toEqual([['writers', 2]])

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 4. A BATCH IS NOT WITNESSED TIME ─────────────────────────────────────────

test('simulating to the next event lands on current truth and animates no skipped week', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, { save: GRID_GREENLIT_SAVE })

  await page.getByTestId('lot-sim-to-next-event').click()
  await expect(page.getByTestId('lot-next-event-rail')).toBeVisible({ timeout: 60_000 })
  const landed = await gridDebug(page)
  // Law 3: no week of that batch was ever a moment the player was present for.
  expect(landed.presencePlaybackWeek).toBeNull()
  expect(landed.presencePlaybackMs).toBeNull()
  expect(landed.presenceWeek).toBeGreaterThan(GREENLIT_WEEK)
  // …and the world nonetheless shows the CURRENT week's truth immediately.
  await expect(page.locator('.lot-sub')).toHaveText(
    new RegExp(`Week ${String(landed.presenceWeek)}$`),
  )
  for (const stand of landed.presenceStands) {
    if (stand.stance === 'home') continue
    await expectSpriteSettled(page, stand)
  }

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── freshly measured tuples ──────────────────────────────────────────────────
//
// Measured on a real run of THIS spec against THESE fixtures (see the milestone report).
// They belong to these fixtures and to no others; in particular they are not comparable
// with the build-mode suite's grid tuple, which names a different studio.

const GRID_PRESENCE_WEEK_0_STRUCTURE = {
  displayObjects: 173,
  dynamicActors: 14,
  decodedBytes: 8_546_680,
  drawCalls: 4,
}

const GRID_GREENLIT_WEEK_0_STRUCTURE = {
  displayObjects: 173,
  dynamicActors: 14,
  decodedBytes: 8_546_680,
  drawCalls: 4,
}

const GRID_GREENLIT_WEEK_1_STRUCTURE = {
  displayObjects: 173,
  dynamicActors: 14,
  decodedBytes: 8_546_680,
  drawCalls: 4,
}
