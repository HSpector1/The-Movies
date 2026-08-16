import { expect, test, type ElementHandle, type Locator, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  signContractAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const outDir = join(repoRoot, 'out', 'world-first-lot-retained-screenplay-commission-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'
/**
 * The byte-neutrality structural fingerprint of the RETAINED PLATE renderer at this file's
 * own `managedIdleSave()` fixture (six contracted employees, no active production).
 *
 * M1.5 RE-MEASURE — an accepted behavior change, not a regression. `eebbefd` put the studio's
 * own contracted roster into `studioLotSnapshot` itself, so roster staff now paint on EVERY
 * world the snapshot feeds, the retained Hollywood plate included. The six employees of this
 * fixture add exactly six dynamic actors and twelve display objects (a person body plus its
 * label), and nothing else moved: decoded texture bytes and the single draw call are
 * unchanged, which is what proves the delta is people and not a renderer leak. Re-measured at
 * HEAD on port 5178, identical across all four tests and across the independent fresh-window
 * comparison at the end of this file.
 *
 * Prior plate value (pre-M1.5, quoted by operational law 25): 30 / 13 / 11,096,896 / 1.
 */
const EXPECTED_STRUCTURE = {
  displayObjects: 42,
  dynamicActors: 19,
  decodedBytes: 11_096_896,
  drawCalls: 1,
}

mkdirSync(outDir, { recursive: true })
test.describe.configure({ timeout: 120_000 })

function managedIdleSave(): string {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state: GameState = newGame('retained-screenplay-commission-browser')
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
  const bytes = exportSaveJson(founded.next)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('managed idle browser fixture does not replay byte-identically')
  }
  return bytes
}

const MANAGED_IDLE_SAVE = managedIdleSave()

type RuntimeSignals = {
  errors: string[]
  warnings: string[]
  failedRequests: string[]
}

function captureRuntimeSignals(page: Page): RuntimeSignals {
  const signals: RuntimeSignals = { errors: [], warnings: [], failedRequests: [] }
  page.on('pageerror', (error) => signals.errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') signals.errors.push(message.text())
    if (message.type() === 'warning') signals.warnings.push(message.text())
  })
  page.on('requestfailed', (request) => {
    signals.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`)
  })
  return signals
}

function expectCleanRuntime(signals: RuntimeSignals) {
  expect(signals.errors, signals.errors.join('\n')).toEqual([])
  const productWarnings = signals.warnings.filter(
    (warning) => !/^\[\.WebGL-.*\]GL Driver Message \(OpenGL, Performance,/.test(warning),
  )
  expect(productWarnings, productWarnings.join('\n')).toEqual([])
  expect(signals.failedRequests, signals.failedRequests.join('\n')).toEqual([])
}

function instrumentRendererSource(source: string): string {
  const constructorMarker = 'constructor(opts) {\n    this.opts = opts;'
  const destroyMarker = 'destroy() {\n    this.destroyed = true;'
  if (!source.includes(constructorMarker) || !source.includes(destroyMarker)) {
    throw new Error('StudioLotView commission evidence bridge marker is absent')
  }
  return source
    .replace(
      constructorMarker,
      `constructor(opts) {
    const evidence = globalThis.__projectStudioCommissionEvidence ??= {
      constructions: 0, destroys: 0, view: null
    };
    evidence.constructions += 1;
    evidence.view = this;
    this.opts = opts;`,
    )
    .replace(
      destroyMarker,
      `destroy() {
    if (globalThis.__projectStudioCommissionEvidence) {
      globalThis.__projectStudioCommissionEvidence.destroys += 1;
    }
    this.destroyed = true;`,
    )
}

async function exposeRendererEvidence(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
}

type RendererEvidence = {
  constructions: number
  destroys: number
  camera: { scrollX: number; scrollY: number; zoom: number } | null
}

async function rendererEvidence(page: Page): Promise<RendererEvidence> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioCommissionEvidence?: {
        constructions: number
        destroys: number
        view: {
          hollywoodScene?: {
            cameras?: { main?: { scrollX: number; scrollY: number; zoom: number } }
          }
        } | null
      }
    }
    const evidence = root.__projectStudioCommissionEvidence
    if (evidence === undefined) throw new Error('commission renderer evidence is unavailable')
    const camera = evidence.view?.hollywoodScene?.cameras?.main
    return {
      constructions: evidence.constructions,
      destroys: evidence.destroys,
      camera: camera === undefined
        ? null
        : { scrollX: camera.scrollX, scrollY: camera.scrollY, zoom: camera.zoom },
    }
  })
}

async function rendererViewIdentity(page: Page) {
  return page.evaluateHandle(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioCommissionEvidence?: { view: object | null }
    }
    const view = root.__projectStudioCommissionEvidence?.view
    if (view === undefined || view === null) throw new Error('commission renderer view is absent')
    return view
  })
}

async function expectSameRendererView(
  page: Page,
  retained: Awaited<ReturnType<typeof rendererViewIdentity>>,
) {
  expect(await page.evaluate((prior) => {
    const root = globalThis as typeof globalThis & {
      __projectStudioCommissionEvidence?: { view: object | null }
    }
    return root.__projectStudioCommissionEvidence?.view === prior
  }, retained)).toBe(true)
}

async function seedManagedLot(page: Page) {
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    localStorage.setItem(config.lotFlag, '1')
    localStorage.setItem(config.hollywoodFlag, '1')
    localStorage.setItem(config.identityFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    identityFlag: IDENTITY_PROOF_FLAG_KEY,
    save: MANAGED_IDLE_SAVE,
  })
  await page.goto('/')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute(
    'data-display-objects',
    String(EXPECTED_STRUCTURE.displayObjects),
    { timeout: 20_000 },
  )
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute(
    'data-draw-calls',
    String(EXPECTED_STRUCTURE.drawCalls),
    { timeout: 20_000 },
  )
}

async function activeSessionBytes(page: Page): Promise<string> {
  const bytes = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (bytes === null) throw new Error('active SaveFileV11 is absent')
  return bytes
}

async function captureLotDomIdentity(page: Page) {
  const lot = await page.getByTestId('studio-lot-screen').elementHandle()
  const mount = await page.getByTestId('studio-lot-canvas').elementHandle()
  const canvas = await page.getByTestId('studio-lot-canvas').locator('canvas').elementHandle()
  if (lot === null || mount === null || canvas === null) throw new Error('Lot identity is absent')
  return { lot, mount, canvas }
}

async function expectCurrentNode(handle: ElementHandle<Node>, selector: string) {
  expect(await handle.evaluate(
    (node, currentSelector) => node.isConnected && document.querySelector(currentSelector) === node,
    selector,
  )).toBe(true)
}

async function expectSameLotDomIdentity(identity: Awaited<ReturnType<typeof captureLotDomIdentity>>) {
  await expectCurrentNode(identity.lot, '[data-testid="studio-lot-screen"]')
  await expectCurrentNode(identity.mount, '[data-testid="studio-lot-canvas"]')
  await expectCurrentNode(identity.canvas, '[data-testid="studio-lot-canvas"] canvas')
}

async function structuralTelemetry(page: Page) {
  const performance = page.getByTestId('hollywood-performance')
  return {
    displayObjects: Number(await performance.getAttribute('data-display-objects')),
    dynamicActors: Number(await performance.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(await performance.getAttribute('data-decoded-bytes')),
    drawCalls: Number(await performance.getAttribute('data-draw-calls')),
  }
}

async function openCommission(page: Page) {
  const opener = page.getByTestId('lot-nav-writers')
  await opener.focus()
  await expect(opener).toBeFocused()
  await opener.press('Enter')
  const workspace = page.getByTestId('lot-commission-workspace')
  await expect(workspace).toBeVisible()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toHaveAttribute('inert', '')
  await expect(page.getByTestId('recovery-notice')).toHaveAttribute('inert', '')
  await expect(page.getByTestId('recovery-notice')).toHaveAttribute('aria-hidden', 'true')
  return { opener, workspace }
}

async function expectVisualReachable(label: string, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  await target.focus()
  await expect(target, label).toBeFocused()
  const geometry = await target.evaluate((node) => {
    const hitOwner = node instanceof HTMLInputElement && node.type === 'checkbox'
      ? node.closest('label') ?? node
      : node
    const rect = hitOwner.getBoundingClientRect()
    const visual = window.visualViewport
    const left = visual?.offsetLeft ?? 0
    const top = visual?.offsetTop ?? 0
    const right = left + (visual?.width ?? window.innerWidth)
    const bottom = top + (visual?.height ?? window.innerHeight)
    return {
      intersects: rect.right > left && rect.left < right && rect.bottom > top && rect.top < bottom,
      width: rect.width,
      height: rect.height,
    }
  })
  expect(geometry.intersects, `${label} must intersect the visual viewport`).toBe(true)
  expect(geometry.width, `${label} target width`).toBeGreaterThanOrEqual(24)
  expect(geometry.height, `${label} target height`).toBeGreaterThanOrEqual(24)
}

async function expectWorkspaceControlsReachable(page: Page) {
  for (const [label, testId] of [
    ['concept', 'script-concept'],
    ['writer', 'script-writer'],
    ['opening', 'script-shape-opening'],
    ['midpoint', 'script-shape-midpoint'],
    ['ending', 'script-shape-ending'],
    ['audience', 'script-segment-adult'],
    ['details', 'lot-commission-workspace-details'],
    ['return', 'lot-commission-workspace-close'],
    ['submit', 'commission-submit'],
  ] as const) {
    await expectVisualReachable(`Commission ${label}`, page.getByTestId(testId))
  }
  expect(await page.evaluate(() => ({
    pageFits: document.documentElement.scrollWidth <= window.innerWidth,
    oneScrollOwner: document.querySelectorAll('.lot-commission-workspace-scroll').length,
    formFits: (() => {
      const owner = document.querySelector<HTMLElement>('.lot-commission-workspace-scroll')
      return owner !== null && owner.scrollWidth <= owner.clientWidth
    })(),
  }))).toEqual({ pageFits: true, oneScrollOwner: 1, formFits: true })
}

type ActivationVariant =
  | 'Enter'
  | 'Space'
  | 'held/cross-key'
  | 'touch/pointer/compatibility/neighbors'

async function activateWithTails(page: Page, button: Locator, variant: ActivationVariant) {
  await button.focus()
  await expect(button).toBeFocused()
  if (variant === 'Enter' || variant === 'Space') {
    await page.keyboard.press(variant)
    return
  }
  if (variant === 'held/cross-key') {
    await page.keyboard.down('Enter')
    await page.keyboard.down('Enter')
    await page.keyboard.up('Enter')
    await page.keyboard.press('Space')
    return
  }
  await button.evaluate((node) => {
    const pointer = {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
    }
    const touch = { bubbles: true, cancelable: true, composed: true, touches: [] }
    const mouse = { bubbles: true, cancelable: true, composed: true, detail: 1 }
    node.dispatchEvent(new PointerEvent('pointerdown', pointer))
    node.dispatchEvent(new TouchEvent('touchstart', touch))
    node.dispatchEvent(new TouchEvent('touchend', { ...touch, changedTouches: [] }))
    node.dispatchEvent(new MouseEvent('mousedown', mouse))
    node.dispatchEvent(new MouseEvent('click', mouse))
    window.dispatchEvent(new Event('blur'))
    document.dispatchEvent(new Event('visibilitychange'))
    document.querySelector<HTMLElement>('[data-testid="lot-commission-workspace-details"]')?.click()
    document.querySelector<HTMLElement>('[data-testid="lot-commission-workspace-close"]')?.click()
    node.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
      repeat: true,
    }))
    node.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: ' ',
    }))
    node.dispatchEvent(new MouseEvent('click', { ...mouse, detail: 2 }))
    node.dispatchEvent(new MouseEvent('dblclick', { ...mouse, detail: 2 }))
    node.dispatchEvent(new PointerEvent('pointercancel', pointer))
    node.dispatchEvent(new PointerEvent('pointerup', pointer))
    node.dispatchEvent(new MouseEvent('mouseup', mouse))
  })
}

test('desktop form-over-world cancel and acceptance retain the exact Lot, view, camera, and structure', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedManagedLot(page)
  const baselineBytes = await activeSessionBytes(page)
  const identity = await captureLotDomIdentity(page)
  const retainedView = await rendererViewIdentity(page)
  const baselineRenderer = await rendererEvidence(page)
  const baselineStructure = await structuralTelemetry(page)
  expect(baselineStructure).toEqual(EXPECTED_STRUCTURE)

  const first = await openCommission(page)
  await expectSameLotDomIdentity(identity)
  await expectSameRendererView(page, retainedView)
  expect(await rendererEvidence(page)).toEqual(baselineRenderer)
  expect(await structuralTelemetry(page)).toEqual(baselineStructure)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)
  await expectWorkspaceControlsReachable(page)
  await page.getByTestId('script-concept').focus()
  await page.screenshot({ path: join(outDir, '01-desktop-form-over-live-world.png') })

  await page.getByTestId('lot-commission-workspace-close').click()
  await expect(first.workspace).toHaveCount(0)
  await expect(first.opener).toBeFocused()
  await expect(page.getByTestId('recovery-notice')).not.toHaveAttribute('inert')
  await expect(page.getByTestId('recovery-notice')).not.toHaveAttribute('aria-hidden')
  await expectSameLotDomIdentity(identity)
  await expectSameRendererView(page, retainedView)
  expect(await rendererEvidence(page)).toEqual(baselineRenderer)
  expect(await structuralTelemetry(page)).toEqual(baselineStructure)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)
  await page.screenshot({ path: join(outDir, '02-cancel-return-same-live-world.png') })

  await openCommission(page)
  const title = ((await page.getByTestId('script-concept').locator('option:checked').textContent()) ?? '')
    .split(' — ')[0]!
  const writer = ((await page.getByTestId('script-writer').locator('option:checked').textContent()) ?? '')
    .split(' — ')[0]!
  await page.getByTestId('commission-submit').click()
  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  await expect(witness).toContainText(title)
  await expect(witness).toContainText(writer)
  await expectSameLotDomIdentity(identity)
  await expectSameRendererView(page, retainedView)
  expect(await rendererEvidence(page)).toEqual(baselineRenderer)
  expect(await structuralTelemetry(page)).toEqual(baselineStructure)
  const saved = JSON.parse(await activeSessionBytes(page)) as {
    state: {
      market: { tick: number }
      studio: { cash: number }
      rngState: string
      ledger: unknown[]
      scriptDevelopment: { projects: unknown[] }
    }
  }
  const baseline = JSON.parse(baselineBytes) as typeof saved
  expect(saved.state.market.tick).toBe(baseline.state.market.tick)
  expect(saved.state.studio.cash).toBe(baseline.state.studio.cash)
  expect(saved.state.rngState).toBe(baseline.state.rngState)
  expect(saved.state.ledger).toEqual(baseline.state.ledger)
  expect(saved.state.scriptDevelopment.projects).toHaveLength(1)
  await page.screenshot({ path: join(outDir, '03-accepted-screenplay-live-world-witness.png') })
  expectCleanRuntime(runtime)
})

test('960x540 and actual page-scale 200% keep the forced-color reduced-motion workspace operable', async ({ page, context }) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await exposeRendererEvidence(page)
  await seedManagedLot(page)
  await openCommission(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
  await expectWorkspaceControlsReachable(page)
  await page.getByTestId('script-concept').focus()
  await page.screenshot({ path: join(outDir, '04-commission-960x540-forced-colors.png') })

  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect.poll(async () => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(2)
  expect(await page.evaluate(() => ({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width,
    visualHeight: window.visualViewport?.height,
  }))).toEqual({ layoutWidth: 960, visualWidth: 480, visualHeight: 270 })
  await expectWorkspaceControlsReachable(page)
  await page.screenshot({ path: join(outDir, '05-commission-page-scale-200.png') })
  await page.getByTestId('lot-commission-workspace-close').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  expectCleanRuntime(runtime)
})

test('480x270 CSS pixels at DSF2 retain one bounded reachable workspace and the same canvas', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 480, height: 270 },
    deviceScaleFactor: 2,
    forcedColors: 'active',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const runtime = captureRuntimeSignals(page)
  try {
    await exposeRendererEvidence(page)
    await seedManagedLot(page)
    const identity = await captureLotDomIdentity(page)
    const retainedView = await rendererViewIdentity(page)
    const { workspace } = await openCommission(page)
    await expectWorkspaceControlsReachable(page)
    const box = await workspace.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(8)
    expect(box!.y).toBeGreaterThanOrEqual(8)
    expect(box!.x + box!.width).toBeLessThanOrEqual(472)
    expect(box!.y + box!.height).toBeLessThanOrEqual(262)
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      compact: matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({ innerWidth: 480, devicePixelRatio: 2, compact: true, scrollWidth: 480 })
    await page.getByTestId('script-concept').focus()
    await page.screenshot({ path: join(outDir, '06-commission-480x270-dsf2.png') })
    await page.getByTestId('commission-submit').click()
    await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()
    await expectSameLotDomIdentity(identity)
    await expectSameRendererView(page, retainedView)
    expectCleanRuntime(runtime)
  } finally {
    await context.close()
  }
})

test('native and hostile physical tails commission exactly one screenplay in one current owner', async ({ browser }) => {
  for (const variant of [
    'Enter',
    'Space',
    'held/cross-key',
    'touch/pointer/compatibility/neighbors',
  ] as const) {
    const context = await browser.newContext()
    const page = await context.newPage()
    const runtime = captureRuntimeSignals(page)
    try {
      await seedManagedLot(page)
      await openCommission(page)
      await activateWithTails(page, page.getByTestId('commission-submit'), variant)
      await expect(page.getByTestId('lot-screenplay-commission-witness')).toHaveCount(1)
      await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
      await expect(page.getByTestId('writers-room')).toHaveCount(0)
      const projects = await page.evaluate((key) => {
        const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
          state?: { scriptDevelopment?: { projects?: Array<{ id?: string }> } }
        }
        return saved.state?.scriptDevelopment?.projects?.map((project) => project.id) ?? []
      }, ACTIVE_SESSION_KEY)
      expect(projects, `${variant} project footprint`).toEqual(['script-0000'])
      expectCleanRuntime(runtime)
    } finally {
      await context.close()
    }
  }
})
