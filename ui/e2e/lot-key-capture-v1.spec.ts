// ── Lot key capture V1 — Owner decision 17A for audit finding L-09 ──────────
//
// Phaser's KeyboardManager listens on `window` and preventDefaults the keys a scene
// captures, whatever has focus. Batch 6 freed the letters and released the capture under
// a modal; the unsuspended Lot still took the arrows and Space from every control on the
// page, so a focused loan select lost its arrows. The ruling: the world captures arrows
// and Space only while its canvas has focus; everything else is standard browser
// behaviour. `StudioLotView` now follows the canvas's focus (a press on it focuses it).
//
// Runs on the SHIPPED grid origin (5179, see the quarantine note in `playwright.config.ts`):
// the grid world is the scene that captures cursor keys; the plate captures none.
//
// The focused controls are a native listbox and a native button the spec adds outside the
// canvas, because the capture is page-wide and every control meets it the same way: the
// loan select only renders under a corporate notice, a collapsed <select> opens a popup on
// macOS arrows instead of changing value, and the Lot's own buttons pan the camera when
// activated. A listbox moves its selection and a button clicks on Space on every platform.
// At the parent commit both steps, and the canvas focus in step 3, are expected red (the
// captured keydown cancels their default; the canvas is not focusable); a parent run proves it.

import { expect, test, type Page } from '@playwright/test'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  signContractAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

/** Frames a key is held for: long enough for a captured arrow to pan the camera visibly. */
const HELD_FRAMES = 20

test.use({ channel: 'chrome' })
test.describe.configure({ timeout: 180_000 })

// ── the fixture: a founded managed Week-0 studio, built by adapter actions ────

function managedIdleSave(): string {
  const required: Readonly<Record<CreativeRole, number>> = { actor: 3, director: 1, writer: 1, craft: 1 }
  let state: GameState = newGame('lot-key-capture-v1')
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
  return exportSaveJson(founded.next)
}

// ── renderer instrumentation (the seam `tycoon-build-mode-v1.spec.ts` uses) ───

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

type WorldView = { x: number; y: number; width: number; height: number }

async function worldView(page: Page): Promise<WorldView | null> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: { worldProjection(): { worldView: WorldView } | null }
    }
    return root.__projectStudioGridWorld?.worldProjection()?.worldView ?? null
  })
}

async function camera(page: Page): Promise<WorldView> {
  const view = await worldView(page)
  if (view === null) throw new Error('the grid world camera is unavailable')
  return view
}

async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((total) => new Promise<void>((resolve) => {
    let left = total
    const tick = () => {
      left -= 1
      if (left <= 0) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }), count)
}

/** The camera after any glide has finished: two reads five frames apart agree. */
async function settledCamera(page: Page): Promise<WorldView> {
  let previous = await camera(page)
  await expect.poll(async () => {
    await frames(page, 5)
    const next = await camera(page)
    const still = JSON.stringify(next) === JSON.stringify(previous)
    previous = next
    return still
  }, { message: 'the camera settles' }).toBe(true)
  return previous
}

async function hold(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key)
  await frames(page, HELD_FRAMES)
  await page.keyboard.up(key)
  await frames(page, 2)
}

/** Whether the last keydown of `key` reached the end of dispatch cancelled. */
async function lastKeydownPrevented(page: Page, key: string): Promise<boolean | null> {
  return page.evaluate((name) => {
    const log = (globalThis as typeof globalThis & {
      __lotKeyLog?: Array<{ key: string; prevented: boolean }>
    }).__lotKeyLog ?? []
    return log.filter((entry) => entry.key === name).at(-1)?.prevented ?? null
  }, key)
}

async function worldSelection(page: Page): Promise<{ place: string | null; parcel: string | null }> {
  const debug = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: {
        tycoonDebugState(): { selectedPlaceId: string | null; selectedParcelId: string | null } | null
      }
    }
    return root.__projectStudioGridWorld?.tycoonDebugState() ?? null
  })
  if (debug === null) throw new Error('the grid world renderer is not instrumented')
  return { place: debug.selectedPlaceId, parcel: debug.selectedParcelId }
}

/** Zoom the live camera in by dispatching real wheel events at the canvas centre. */
async function wheelZoomIn(page: Page, notches: number): Promise<void> {
  await page.evaluate((count) => {
    const target = document.querySelector<HTMLCanvasElement>('[data-testid="studio-lot-canvas"] canvas')
    if (target === null) throw new Error('the lot canvas is absent')
    const box = target.getBoundingClientRect()
    for (let i = 0; i < count; i++) {
      target.dispatchEvent(new WheelEvent('wheel', {
        deltaY: -120,
        clientX: box.x + box.width / 2,
        clientY: box.y + box.height / 2,
        bubbles: true,
        cancelable: true,
      }))
    }
  }, notches)
}

/**
 * A canvas point a press can take focus from without selecting anything: open haze off
 * the property, outside the 26 px edge-scroll band, with the canvas itself on top.
 *
 * A 9 x 7 grid scan over the canvas, bottom row first. A point qualifies when it lies
 * outside the ground diamond grown by 8 cells, or outside it grown by 2 cells AND south of
 * its side vertices: bodies stand UP from the ground, so a tall sprite can reach into the
 * north haze but never below the ground. The diamond comes from the live camera
 * (`worldPointFraction`), never from a spec-side transform. When no point qualifies the
 * error names what covered each candidate, so the next run says what sits on the canvas.
 */
async function freeOffPropertyPoint(page: Page): Promise<{ x: number; y: number }> {
  const scan = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: {
        worldProjection(): { lotWidth: number; lotDepth: number } | null
        worldPointFraction(gx: number, gy: number): { fx: number; fy: number } | null
      }
    }
    const world = root.__projectStudioGridWorld
    const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="studio-lot-canvas"] canvas')
    const projection = world?.worldProjection() ?? null
    if (world === undefined || canvas === null || projection === null) {
      throw new Error('the grid world is not instrumented')
    }
    const box = canvas.getBoundingClientRect()
    const at = (gx: number, gy: number) => {
      const fraction = world.worldPointFraction(gx, gy)
      if (fraction === null) throw new Error(`grid point ${String(gx)},${String(gy)} has no projection`)
      return { x: box.left + fraction.fx * box.width, y: box.top + fraction.fy * box.height }
    }
    const width = projection.lotWidth
    const depth = projection.lotDepth
    const diamond = (m: number) => [at(-m, -m), at(width + m, -m), at(width + m, depth + m), at(-m, depth + m)]
    const inside = (polygon: Array<{ x: number; y: number }>, x: number, y: number) => {
      let crossings = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i]!
        const b = polygon[j]!
        if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
          crossings = !crossings
        }
      }
      return crossings
    }
    const near = diamond(2)
    const far = diamond(8)
    const southOf = Math.max(near[1]!.y, near[3]!.y)
    const band = 40
    const covered = new Set<string>()
    let onProperty = 0
    for (let row = 6; row >= 0; row--) {
      for (let col = 0; col <= 8; col++) {
        const x = box.left + band + ((box.width - 2 * band) * col) / 8
        const y = box.top + band + ((box.height - 2 * band) * row) / 6
        const open = !inside(far, x, y) || (!inside(near, x, y) && y > southOf)
        if (!open) {
          onProperty += 1
          continue
        }
        const hit = document.elementFromPoint(x, y)
        if (hit === canvas) return { point: { x, y }, covered: [], onProperty }
        covered.add(hit === null
          ? 'nothing (outside the viewport)'
          : `${hit.tagName.toLowerCase()}${hit.getAttribute('data-testid') ? `[data-testid="${hit.getAttribute('data-testid')}"]` : ''}${typeof hit.className === 'string' && hit.className ? `.${hit.className.trim().split(/\s+/).join('.')}` : ''}`)
      }
    }
    return { point: null, covered: [...covered], onProperty }
  })
  if (scan.point === null) {
    throw new Error(
      `no open canvas point: ${String(scan.onProperty)} of 63 grid points are on or above the property; ` +
      `the rest are covered by ${scan.covered.join(', ') || 'nothing'}`,
    )
  }
  return scan.point
}

async function seed(page: Page): Promise<void> {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    // The player gates stay on their SHIPPED DEFAULTS: absence, not a positive `1`.
    localStorage.removeItem(config.lotFlag)
    localStorage.removeItem(config.hollywoodFlag)
    localStorage.removeItem(config.tycoonFlag)
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    save: managedIdleSave(),
  })
  // Reduced motion freezes the ambient crowd; keyboard panning is unaffected by it.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  await expect.poll(async () => (await worldView(page)) !== null).toBe(true)
}

test('a focused control keeps the arrows and Space; the world takes them once the canvas has focus', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  await seed(page)
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')

  // Two native controls outside the canvas, and a window keydown log registered after
  // Phaser's own window listener, so it reads each keydown's cancelled state as dispatch ends.
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __lotKeyLog?: Array<{ key: string; prevented: boolean }>
    }
    root.__lotKeyLog = []
    window.addEventListener('keydown', (event) => {
      root.__lotKeyLog!.push({ key: event.key, prevented: event.defaultPrevented })
    })
    const probe = document.createElement('div')
    // Top of the viewport: the canvas point search below never uses the north half.
    probe.style.cssText = 'position:fixed;left:8px;top:8px;z-index:2147483647;background:#fff'
    const list = document.createElement('select')
    list.size = 3
    list.setAttribute('data-testid', 'key-probe-select')
    for (const value of ['first', 'second', 'third']) list.append(new Option(value, value))
    list.value = 'first'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'Probe'
    button.dataset.clicks = '0'
    button.setAttribute('data-testid', 'key-probe-button')
    button.addEventListener('click', () => {
      button.dataset.clicks = String(Number(button.dataset.clicks) + 1)
    })
    probe.append(list, button)
    document.body.append(probe)
  })
  const select = page.getByTestId('key-probe-select')
  const button = page.getByTestId('key-probe-button')

  const opening = await settledCamera(page)

  // ── 1. a focused select keeps ArrowDown ──
  await select.focus()
  await expect(select).toBeFocused()
  await hold(page, 'ArrowDown')
  await expect(select).toHaveValue('second')
  expect(await lastKeydownPrevented(page, 'ArrowDown')).toBe(false)
  expect(await camera(page), 'ArrowDown belonged to the select').toEqual(opening)

  // ── 2. a focused button keeps Space ──
  await button.focus()
  await expect(button).toBeFocused()
  await page.keyboard.press('Space')
  await expect(button).toHaveAttribute('data-clicks', '1')
  expect(await lastKeydownPrevented(page, ' ')).toBe(false)
  await frames(page, HELD_FRAMES)
  expect(await camera(page), 'Space belonged to the button').toEqual(opening)

  // ── 3. a press on the canvas focuses it, and the world takes ArrowRight ──
  const point = await freeOffPropertyPoint(page)
  const selectionBefore = await worldSelection(page)
  await page.mouse.click(point.x, point.y)
  await expect(canvas).toBeFocused()
  expect(await worldSelection(page), 'the focusing press landed on open ground').toEqual(selectionBefore)
  // Park the pointer on DOM chrome so edge scrolling cannot move the camera; focus stays.
  const parked = await button.boundingBox()
  if (parked === null) throw new Error('the probe button has no box')
  await page.mouse.move(parked.x + parked.width / 2, parked.y + parked.height / 2)
  // Zoom in a little (wheel at the canvas centre; no focus change), so the camera has room
  // to pan inside its bounds.
  await wheelZoomIn(page, 3)
  await expect(canvas).toBeFocused()
  const before = await settledCamera(page)

  await hold(page, 'ArrowRight')
  expect(await lastKeydownPrevented(page, 'ArrowRight')).toBe(true)
  const after = await camera(page)
  expect(after.x, 'ArrowRight panned the world').toBeGreaterThan(before.x)
  expect(after.y).toBe(before.y)

  expect(pageErrors).toEqual([])
})
