import { expect, test, type Locator, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { performance as nodePerformance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import {
  acknowledgeCastingSessionAction,
  advanceToNextEvent,
  castingSessionsBoard,
  exportSaveJson,
  findConcept,
  greenlightScriptProject,
  importSaveJson,
  marketingMenu,
  releaseTalentAction,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  type DraftPackage,
  type SimResult,
} from '../src/engine/adapter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixtureDir = join(here, 'lot-native-next-event-v1')
const outDir = join(repoRoot, 'out', 'world-first-lot-native-next-event-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

type ExpectedTarget =
  | { kind: 'script'; projectId: string; title: string; buildingId: 'writers' }
  | {
      kind: 'casting'
      sessionId: string
      projectId: string
      title: string
      buildingId: 'casting'
    }
  | {
      kind: 'production'
      productionId: string
      title: string
      location: 'stage-7' | 'stage-12-semantic'
    }
  | {
      kind: 'run-completed'
      runs: Array<{ productionId: string; title: string }>
      buildingId: 'theater'
    }
  | { kind: 'cash'; buildingId: 'admin' }
  | { kind: 'contracts'; change: 'expired' | 'renewal'; buildingId: null }
  | {
      kind: 'construction'
      projectId: string
      facilityId: string
      name: string
      buildingId: 'expansion'
    }
  | {
      kind: 'release'
      route: 'gazette-newspaper' | 'release-result'
      releases: Array<{ productionId: string; title: string }>
    }

type CorpusFixture = {
  id: string
  file: string
  seed: string
  saveVersion: number
  byteLength: number
  sha256: string
  expectedStartWeek: number
  expectedEndWeek: number
  expectedWeeksAdvanced: number
  expectedStopReason: SimResult['stopReason']
  expectedPresentation: {
    arm: 'exact' | 'neutral' | 'release'
    target: ExpectedTarget | null
    neutralKind?: 'next-event-neutral'
  }
  expectedConstructionCompletion: {
    projectId: string
    facilityId: string
    name: string
    completedWeek: number
    message: string
  } | null
  expectedFinalSaveSha256: string
}

type CorpusManifest = {
  schemaVersion: string
  fixtures: CorpusFixture[]
}

const manifest = JSON.parse(
  readFileSync(join(fixtureDir, 'manifest.json'), 'utf8'),
) as CorpusManifest
const fixtures = new Map(manifest.fixtures.map((fixture) => [fixture.id, fixture]))
const directResults = new Map<string, SimResult>()
const finalSaveBytes = new Map<string, string>()
const directAdapterWallMs = new Map<string, number>()

const measuredBrowserEvidence: {
  browserWallMs: {
    oneDigit: number | null
    longerGoverned: number | null
    releaseCoevent: number | null
    guard520: number | null
  }
  structural: { exact: StructuralTelemetry | null; neutral: StructuralTelemetry | null }
} = {
  browserWallMs: {
    oneDigit: null,
    longerGoverned: null,
    releaseCoevent: null,
    guard520: null,
  },
  structural: { exact: null, neutral: null },
}

mkdirSync(outDir, { recursive: true })

function corpusFixture(id: string): CorpusFixture {
  const fixture = fixtures.get(id)
  if (fixture === undefined) throw new Error(`Unknown next-event fixture: ${id}`)
  return fixture
}

function fixtureBytes(id: string): string {
  return readFileSync(join(fixtureDir, corpusFixture(id).file), 'utf8')
}

function directResult(id: string): SimResult {
  const result = directResults.get(id)
  if (result === undefined) throw new Error(`Direct next-event oracle is absent: ${id}`)
  return result
}

function expectedFinalBytes(id: string): string {
  const bytes = finalSaveBytes.get(id)
  if (bytes === undefined) throw new Error(`Final next-event save is absent: ${id}`)
  return bytes
}

test.beforeAll(() => {
  expect(manifest.schemaVersion).toBe('world-first-lot-native-next-event-hostile-corpus-v1')
  expect(manifest.fixtures).toHaveLength(12)

  for (const fixture of manifest.fixtures) {
    const bytes = fixtureBytes(fixture.id)
    expect(Buffer.byteLength(bytes), `${fixture.id} byte length`).toBe(fixture.byteLength)
    expect(createHash('sha256').update(bytes).digest('hex'), `${fixture.id} SHA-256`)
      .toBe(fixture.sha256)

    const imported = importSaveJson(bytes)
    expect(imported.ok, `${fixture.id} imports as native SaveFileV11`).toBe(true)
    if (!imported.ok) throw new Error(imported.error)
    expect(imported.converted, `${fixture.id} does not migrate`).toBe(false)
    expect(exportSaveJson(imported.state), `${fixture.id} byte-identical replay`).toBe(bytes)
    expect(imported.state.seed).toBe(fixture.seed)
    expect(imported.state.market.tick).toBe(fixture.expectedStartWeek)

    const adapterStarted = nodePerformance.now()
    const result = advanceToNextEvent(imported.state)
    directAdapterWallMs.set(fixture.id, nodePerformance.now() - adapterStarted)
    const finalBytes = exportSaveJson(result.next)
    expect(result.stopReason, `${fixture.id} stop`).toBe(fixture.expectedStopReason)
    expect(result.toWeek, `${fixture.id} final week`).toBe(fixture.expectedEndWeek)
    expect(result.weeks, `${fixture.id} elapsed weeks`).toBe(fixture.expectedWeeksAdvanced)
    expect(createHash('sha256').update(finalBytes).digest('hex'), `${fixture.id} final SHA-256`)
      .toBe(fixture.expectedFinalSaveSha256)
    directResults.set(fixture.id, result)
    finalSaveBytes.set(fixture.id, finalBytes)
  }
})

test.afterAll(() => {
  const evidence = {
    directAdapterWallMs: {
      oneDigitWeek: directAdapterWallMs.get('script-review') ?? null,
      longerGoverned117Weeks: directAdapterWallMs.get('cash-negative-crossing') ?? null,
      releaseCoeventOneWeek:
        directAdapterWallMs.get('gazette-release-with-annex-completion') ?? null,
      guard520Weeks: directAdapterWallMs.get('week-520-guard') ?? null,
    },
    ...measuredBrowserEvidence,
  }
  // Durable reporter output for the closure evidence record; browser-console cleanliness is
  // captured independently and this Node-side line does not alter the application surface.
  console.info(`[lot-native-next-event-v1 evidence] ${JSON.stringify(evidence)}`)
})

test.describe.configure({ timeout: 120_000 })

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
    if (
      message.type() === 'warning' &&
      !/GL Driver Message|GPU stall due to ReadPixels/i.test(message.text())
    ) signals.warnings.push(message.text())
  })
  page.on('requestfailed', (request) => {
    signals.failedRequests.push(
      `${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`,
    )
  })
  return signals
}

function expectCleanRuntime(signals: RuntimeSignals) {
  expect(signals.errors, signals.errors.join('\n')).toEqual([])
  expect(signals.warnings, signals.warnings.join('\n')).toEqual([])
  expect(signals.failedRequests, signals.failedRequests.join('\n')).toEqual([])
}

type SeedOptions = {
  saveBytes?: string
  recoveredWeek?: number
  expectCanvas?: boolean
  awaitRenderer?: boolean
  identityProof?: boolean
  operationHollywoodRollback?: boolean
}

async function seedLot(page: Page, fixtureId: string, options: SeedOptions = {}) {
  const fixture = corpusFixture(fixtureId)
  const save = options.saveBytes ?? fixtureBytes(fixtureId)
  const recoveredWeek = options.recoveredWeek ?? fixture.expectedStartWeek
  await page.addInitScript(
    ([
      sessionKey,
      corruptKey,
      saveJson,
      lotFlag,
      hollywoodFlag,
      proofFlag,
      proof,
      hollywoodRollback,
    ]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      localStorage.removeItem(corruptKey as string)
      // Absence exercises the shipped world-first defaults instead of a positive test override.
      localStorage.removeItem(lotFlag as string)
      if (hollywoodRollback) localStorage.setItem(hollywoodFlag as string, '0')
      else localStorage.removeItem(hollywoodFlag as string)
      if (proof) localStorage.setItem(proofFlag as string, '1')
      else localStorage.removeItem(proofFlag as string)
    },
    [
      ACTIVE_SESSION_KEY,
      ACTIVE_SESSION_CORRUPT_KEY,
      save,
      LOT_FLAG_KEY,
      HOLLYWOOD_FLAG_KEY,
      IDENTITY_PROOF_FLAG_KEY,
      options.identityProof === true,
      options.operationHollywoodRollback === true,
    ] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText(`Week ${recoveredWeek}`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (options.expectCanvas !== false) {
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  }
  if (options.awaitRenderer !== false) {
    await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  }
  await page.getByTestId('recovery-dismiss').click()
}

async function activeSessionBytes(page: Page): Promise<string> {
  const bytes = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  expect(bytes).not.toBeNull()
  return bytes!
}

async function chooseFirstEligiblePackageTalent(
  page: Page,
  pickerTestId: string,
): Promise<{ id: string; name: string }> {
  const candidate = page
    .getByTestId(pickerTestId)
    .locator('button[aria-pressed]:not([disabled])')
    .first()
  await candidate.scrollIntoViewIfNeeded()
  await expect(candidate).toBeVisible()
  const testId = await candidate.getAttribute('data-testid')
  expect(testId).toMatch(/^talent-/)
  const name = await candidate.locator('.opt-title').evaluate(
    (node) => node.firstChild?.textContent?.trim() ?? '',
  )
  expect(name).not.toBe('')
  await candidate.click()
  await expect(candidate).toHaveAttribute('aria-pressed', 'true')
  return { id: testId!.replace(/^talent-/, ''), name }
}

async function expectDirectSuccessor(page: Page, fixtureId: string) {
  expect(await activeSessionBytes(page), `${fixtureId} browser/direct SaveFileV11 parity`)
    .toBe(expectedFinalBytes(fixtureId))
}

async function expectExactRail(page: Page, fixtureId: string) {
  const fixture = corpusFixture(fixtureId)
  const rail = page.getByTestId('lot-next-event-rail')
  await expect(rail).toBeVisible()
  await expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-exact')
  await expect(rail.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(rail).toContainText(`From week${fixture.expectedStartWeek}`)
  await expect(rail).toContainText(`To week${fixture.expectedEndWeek}`)
  await expect(rail).toContainText(
    `Advanced${fixture.expectedWeeksAdvanced} ${fixture.expectedWeeksAdvanced === 1 ? 'week' : 'weeks'}`,
  )
  await expect(page.getByTestId('studio-lot-screen')).toContainText(
    `Week ${fixture.expectedEndWeek}`,
  )
  await expectDirectSuccessor(page, fixtureId)
  return rail
}

function instrumentRendererSource(source: string): string {
  const constructorMarker = 'constructor(opts) {\n    this.opts = opts;'
  const snapshotMarker = 'setSnapshot(snapshot) {\n    this.pendingSnapshot = snapshot;'
  const destroyMarker = 'destroy() {\n    this.destroyed = true;'
  if (
    !source.includes(constructorMarker) ||
    !source.includes(snapshotMarker) ||
    !source.includes(destroyMarker)
  ) {
    throw new Error('StudioLotView next-event evidence bridge marker is absent')
  }
  return source
    .replace(
      constructorMarker,
      `constructor(opts) {
    const evidence = globalThis.__projectStudioNextEventEvidence ??= {
      constructions: 0, destroys: 0, snapshotWeeks: [], view: null
    };
    evidence.constructions += 1;
    evidence.snapshotWeeks.push(opts.snapshot.week);
    evidence.view = this;
    this.opts = opts;`,
    )
    .replace(
      snapshotMarker,
      `setSnapshot(snapshot) {
    globalThis.__projectStudioNextEventEvidence?.snapshotWeeks.push(snapshot.week);
    this.pendingSnapshot = snapshot;`,
    )
    .replace(
      destroyMarker,
      `destroy() {
    if (globalThis.__projectStudioNextEventEvidence) {
      globalThis.__projectStudioNextEventEvidence.destroys += 1;
    }
    this.destroyed = true;`,
    )
}

async function exposeRendererEvidence(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    const source = instrumentRendererSource(await response.text())
    await route.fulfill({ response, body: source })
  })
}

type RendererEvidence = {
  constructions: number
  destroys: number
  snapshotWeeks: number[]
  pendingWeek: number | null
  camera: { scrollX: number; scrollY: number; zoom: number } | null
  debug: {
    selectedPersonId: string | null
    selectedPlaceId: string | null
    selectedProductionId: string | null
    expansionStatus: string
  } | null
}

async function rendererEvidence(page: Page): Promise<RendererEvidence> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioNextEventEvidence?: {
        constructions: number
        destroys: number
        snapshotWeeks: number[]
        view: {
          pendingSnapshot?: { week?: number }
          hollywoodScene?: {
            cameras?: { main?: { scrollX: number; scrollY: number; zoom: number } }
          }
          hollywoodDebugState?: () => RendererEvidence['debug']
        } | null
      }
    }
    const evidence = root.__projectStudioNextEventEvidence
    if (evidence === undefined) throw new Error('next-event renderer evidence is unavailable')
    const camera = evidence.view?.hollywoodScene?.cameras?.main
    return {
      constructions: evidence.constructions,
      destroys: evidence.destroys,
      snapshotWeeks: [...evidence.snapshotWeeks],
      pendingWeek: evidence.view?.pendingSnapshot?.week ?? null,
      camera: camera === undefined
        ? null
        : { scrollX: camera.scrollX, scrollY: camera.scrollY, zoom: camera.zoom },
      debug: evidence.view?.hollywoodDebugState?.() ?? null,
    }
  })
}

async function rendererViewIdentity(page: Page) {
  return page.evaluateHandle(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioNextEventEvidence?: { view: object | null }
    }
    const view = root.__projectStudioNextEventEvidence?.view
    if (view === undefined || view === null) {
      throw new Error('next-event renderer identity is unavailable')
    }
    return view
  })
}

async function expectSameRendererView(
  page: Page,
  prior: Awaited<ReturnType<typeof rendererViewIdentity>>,
) {
  expect(await page.evaluate((retained) => {
    const root = globalThis as typeof globalThis & {
      __projectStudioNextEventEvidence?: { view: object | null }
    }
    return root.__projectStudioNextEventEvidence?.view === retained
  }, prior)).toBe(true)
}

type StructuralTelemetry = {
  displayObjects: number
  dynamicActors: number
  decodedBytes: number
  drawCalls: number
}

async function collectFreshStructuralTelemetry(
  page: Page,
  label: string,
): Promise<StructuralTelemetry> {
  const performance = page.getByTestId('hollywood-performance')
  await expect(performance).toBeVisible()
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioNextEventEvidence?: {
        view?: { resetHollywoodPerformance?: () => void } | null
      }
    }
    const view = root.__projectStudioNextEventEvidence?.view
    if (view?.resetHollywoodPerformance === undefined) {
      throw new Error('real StudioLotView performance reset is unavailable')
    }
    view.resetHollywoodPerformance()
  })
  await expect.poll(
    async () => Number(await performance.getAttribute('data-frame-samples')),
    { message: `${label} must enter a fresh renderer window`, timeout: 5_000 },
  ).toBeLessThan(240)
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 20_000 })
  const telemetry = {
    displayObjects: Number(await performance.getAttribute('data-display-objects')),
    dynamicActors: Number(await performance.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(await performance.getAttribute('data-decoded-bytes')),
    drawCalls: Number(await performance.getAttribute('data-draw-calls')),
  }
  expect(telemetry.displayObjects).toBeGreaterThan(0)
  expect(telemetry.dynamicActors).toBeGreaterThan(0)
  expect(telemetry.decodedBytes).toBeGreaterThan(0)
  expect(telemetry.drawCalls).toBe(1)
  return telemetry
}

function expectEarlierInDocument(earlier: Locator, later: Locator) {
  return expect.poll(async () => earlier.evaluate(
    (node, laterNode) => (
      (node.compareDocumentPosition(laterNode as Node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    ),
    await later.elementHandle(),
  )).toBe(true)
}

async function expectNoVisualOverlap(label: string, first: Locator, second: Locator) {
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()])
  expect(firstBox, `${label}: first surface is absent`).not.toBeNull()
  expect(secondBox, `${label}: second surface is absent`).not.toBeNull()
  const horizontal = Math.min(
    firstBox!.x + firstBox!.width,
    secondBox!.x + secondBox!.width,
  ) - Math.max(firstBox!.x, secondBox!.x)
  const vertical = Math.min(
    firstBox!.y + firstBox!.height,
    secondBox!.y + secondBox!.height,
  ) - Math.max(firstBox!.y, secondBox!.y)
  expect(
    horizontal > 0 && vertical > 0,
    `${label}: ${horizontal.toFixed(1)}×${vertical.toFixed(1)} px overlap`,
  ).toBe(false)
}

async function expectInsideVisualViewport(label: string, target: Locator, page: Page) {
  const box = await target.boundingBox()
  expect(box, `${label}: focused owner is absent`).not.toBeNull()
  const viewport = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  expect(box!.x, `${label}: left edge`).toBeGreaterThanOrEqual(0)
  expect(box!.y, `${label}: top edge`).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width, `${label}: right edge`).toBeLessThanOrEqual(viewport.width)
  expect(box!.y + box!.height, `${label}: bottom edge`).toBeLessThanOrEqual(viewport.height)
}

async function measureActivation(page: Page, fixtureId: string, activate: () => Promise<void>) {
  const started = await page.evaluate(() => performance.now())
  await activate()
  const fixture = corpusFixture(fixtureId)
  if (fixture.expectedPresentation.arm === 'release') {
    await expect(
      fixture.expectedPresentation.target?.kind === 'release' &&
        fixture.expectedPresentation.target.route === 'gazette-newspaper'
        ? page.getByTestId('newspaper-reveal')
        : page.getByTestId('release-list'),
    ).toBeVisible()
  } else {
    await expect(page.getByTestId('lot-next-event-rail')).toBeVisible()
  }
  return page.evaluate((then) => performance.now() - then, started)
}

test('screenplay stop keeps one mounted camera, exposes complete accounting, and returns to the exact reaction', async ({ page }, testInfo) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await exposeRendererEvidence(page)
  await seedLot(page, 'script-review')

  const stopped = directResult('script-review')
  const accept = stopped.scriptDecision?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('script-review fixture has no Accept action')
  const accepted = runScriptProjectAction(stopped.next, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  const review = scriptProjectsBoard(stopped.next).sections.needsReview.find(
    (card) => card.projectId === accept.projectId,
  )
  if (review === undefined || review.assessment === null) {
    throw new Error('script-review fixture has no complete review card')
  }

  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-next-event-canvas-proof', 'script'))
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 3; step += 1) await page.mouse.wheel(0, -500)
  const before = await rendererEvidence(page)
  expect(before.camera).not.toBeNull()

  const wallMs = await measureActivation(
    page,
    'script-review',
    () => page.getByTestId('lot-sim-to-next-event').click(),
  )
  measuredBrowserEvidence.browserWallMs.oneDigit = wallMs
  testInfo.annotations.push({ type: 'one-digit-event-wall-ms', description: wallMs.toFixed(2) })
  testInfo.annotations.push({
    type: 'one-digit-direct-adapter-wall-ms',
    description: directAdapterWallMs.get('script-review')!.toFixed(3),
  })
  const rail = await expectExactRail(page, 'script-review')
  await expect(rail).toContainText('Fires of Gambit')
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(canvas).toHaveAttribute('data-next-event-canvas-proof', 'script')
  const reviewPanel = rail.getByTestId('lot-script-review-panel')
  await expect(reviewPanel).toContainText(review.writer.name)
  await expect(reviewPanel.getByTestId('lot-script-review-estimate')).toContainText('Est.')
  await expect(reviewPanel.getByTestId('lot-script-review-estimate')).toContainText(
    Number.isInteger(review.assessment.score)
      ? `${review.assessment.score}`
      : review.assessment.score.toFixed(1),
  )
  await expect(reviewPanel.getByTestId('lot-script-review-estimate')).toContainText(
    review.assessment.band,
  )
  for (const fact of [
    ...review.assessment.strengths,
    ...review.assessment.concerns,
    review.consequence,
  ]) await expect(reviewPanel).toContainText(fact)
  for (const blocker of review.blockers) {
    await expect(reviewPanel).toContainText(blocker.headline)
    await expect(reviewPanel).toContainText(blocker.detail)
    await expect(reviewPanel).toContainText(blocker.remedy)
  }
  const lotAccept = reviewPanel.getByTestId(
    `lot-script-review-action-acceptScript-${accept.projectId}`,
  )
  await expectEarlierInDocument(lotAccept, page.getByTestId('lot-next-event-open-details'))
  await expectNoVisualOverlap(
    '960×540 screenplay rail / production desk',
    rail,
    page.getByRole('region', { name: 'Current production' }),
  )
  await expectNoVisualOverlap(
    '960×540 screenplay rail / studio inspector',
    rail,
    page.getByTestId('hollywood-inspector'),
  )

  const after = await rendererEvidence(page)
  expect(after.constructions).toBe(1)
  expect(after.destroys).toBe(0)
  expect(after.pendingWeek).toBe(1)
  expect(after.snapshotWeeks.slice(before.snapshotWeeks.length)).toEqual([1])
  expect(after.camera, 'the accepted event must not refit, pan, or zoom the live camera')
    .toEqual(before.camera)
  expect(after.debug).toMatchObject({
    selectedPersonId: null,
    selectedPlaceId: null,
    selectedProductionId: null,
  })

  await page.getByTestId('lot-next-event-accounting').locator('summary').click()
  const accounting = page.getByTestId('lot-next-event-accounting')
  for (const label of [
    'Studio Revenue',
    'Legacy box-office lump',
    'Payroll',
    'Overhead',
    'Production spend',
    'Publicity',
    'Studio construction',
    'Other cash',
    'Net this period',
    'Releases',
    'Runs completed',
    'Cash now',
  ]) await expect(accounting).toContainText(label)

  const scriptDetails = page.getByTestId('lot-next-event-open-details')
  await scriptDetails.evaluate((node) => {
    const pointerInit: PointerEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 51,
      pointerType: 'mouse',
      isPrimary: true,
    }
    const compatibilityMouseInit: MouseEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: 1,
    }
    node.dispatchEvent(new PointerEvent('pointerdown', pointerInit))
    node.dispatchEvent(new PointerEvent('pointercancel', pointerInit))
    node.dispatchEvent(new MouseEvent('mousedown', compatibilityMouseInit))
    node.dispatchEvent(new MouseEvent('click', compatibilityMouseInit))
  })
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('writers-room')).toHaveCount(0)
  await expect(page.getByTestId('lot-next-event-rail')).toBeVisible()

  await scriptDetails.focus()
  await page.keyboard.press('Space')
  const exactAction = page.getByTestId('script-action-acceptScript-script-0000')
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('script-card-script-0000')).toContainText('Fires of Gambit')
  await expect(exactAction).toBeFocused()
  await page.getByTestId('writers-room-back').click()
  await expect(page.getByTestId('lot-next-event-rail')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(page.getByTestId('lot-next-event-announcement')).toHaveCount(0)
  await expect(page.getByTestId('annex-completion-summary')).toHaveCount(0)
  await page.screenshot({ path: join(outDir, '01-screenplay-exact-deep-return.png') })

  const returnedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await returnedCanvas.evaluate((node) => {
    node.setAttribute('data-lot-native-script-action-proof', 'same-mounted-world')
  })
  const beforeAction = await rendererEvidence(page)
  await page.getByTestId(
    `lot-script-review-action-acceptScript-${accept.projectId}`,
  ).click()
  const success = page.getByTestId('lot-script-review-success')
  await expect(success).toContainText(review.title)
  await expect(success).toContainText(review.writer.name)
  await expect(success).toContainText('Ready to package')
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(page.getByTestId('writers-room')).toHaveCount(0)
  await expect(returnedCanvas).toHaveAttribute(
    'data-lot-native-script-action-proof',
    'same-mounted-world',
  )
  const afterAction = await rendererEvidence(page)
  expect(afterAction.constructions).toBe(beforeAction.constructions)
  expect(afterAction.destroys).toBe(beforeAction.destroys)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))
  await page.screenshot({ path: join(outDir, '01b-screenplay-accepted-in-live-lot.png') })
  expectCleanRuntime(runtime)
})

test('grayscale screenplay review keeps exact meaning, world actions, focus, and width', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await seedLot(page, 'script-review')
  await page.evaluate(() => {
    document.documentElement.style.filter = 'grayscale(1)'
  })

  const stopped = directResult('script-review')
  const legalActions = stopped.scriptDecision?.legalActions ?? []
  expect(legalActions.map((action) => action.kind)).toEqual([
    'acceptScript',
    'requestScriptRewrite',
  ])
  const review = scriptProjectsBoard(stopped.next).sections.needsReview.find(
    (card) => card.projectId === legalActions[0]?.projectId,
  )
  if (review === undefined || review.assessment === null) {
    throw new Error('script-review fixture has no complete exact review')
  }

  await page.getByTestId('lot-sim-to-next-event').click()
  const rail = await expectExactRail(page, 'script-review')
  const panel = rail.getByTestId('lot-script-review-panel')
  await expect(panel).toHaveAccessibleName(`Screenplay review · ${review.title}`)
  await expect(panel.getByTestId('lot-script-review-writer')).toHaveText(review.writer.name)
  await expect(panel.getByTestId('lot-script-review-state')).toHaveText('First draft')
  await expect(panel.getByTestId('lot-script-review-estimate')).toContainText('Est.')
  await expect(panel.getByTestId('lot-script-review-estimate')).toContainText(
    `${Number.isInteger(review.assessment.score)
      ? review.assessment.score
      : review.assessment.score.toFixed(1)} · ${review.assessment.band}`,
  )
  await expect(panel.getByTestId('lot-script-review-consequence')).toContainText(
    review.consequence,
  )

  const deepAction = page.getByTestId('lot-next-event-open-details')
  const worldActions = legalActions.map((action) => ({
    action,
    locator: panel.getByTestId(
      `lot-script-review-action-${action.kind}-${action.projectId}`,
    ),
  }))
  for (const { action, locator: worldAction } of worldActions) {
    await expectReachableAction(`grayscale ${action.label}`, worldAction)
    await expect(worldAction).toHaveAccessibleName(action.label)
    await expectEarlierInDocument(worldAction, deepAction)
  }
  await worldActions[0]!.locator.focus()
  await expect(worldActions[0]!.locator).toBeFocused()
  for (const { locator: worldAction } of worldActions.slice(1)) {
    await page.keyboard.press('Tab')
    await expect(worldAction).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(deepAction).toBeFocused()
  await expect(deepAction).toHaveAccessibleName(`Open Writers’ Room · ${review.title}`)

  expect(await page.evaluate(() => {
    const eventRail = document.querySelector<HTMLElement>('[data-testid="lot-next-event-rail"]')
    const reviewPanel = document.querySelector<HTMLElement>('[data-testid="lot-script-review-panel"]')
    if (eventRail === null || reviewPanel === null) throw new Error('screenplay review is absent')
    return {
      filter: getComputedStyle(document.documentElement).filter,
      pageFits: document.documentElement.scrollWidth <= window.innerWidth,
      railFits: eventRail.scrollWidth <= eventRail.clientWidth,
      panelFits: reviewPanel.scrollWidth <= reviewPanel.clientWidth,
    }
  })).toEqual({ filter: 'grayscale(1)', pageFits: true, railFits: true, panelFits: true })

  const rewrite = legalActions.find((action) => action.kind === 'requestScriptRewrite')
  if (rewrite === undefined) throw new Error('script-review fixture has no rewrite action')
  const rewritten = runScriptProjectAction(stopped.next, rewrite)
  if (!rewritten.ok) throw new Error(rewritten.error)
  await worldActions[0]!.locator.focus()
  await expect(worldActions[0]!.locator).toBeFocused()
  await worldActions[1]!.locator.click()
  const rewriteSuccess = page.getByTestId('lot-script-review-rewrite-success')
  await expect(rewriteSuccess).toContainText(review.writer.name)
  await expect(rewriteSuccess).toContainText('Development & Casting')
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(rewritten.next))
  expectCleanRuntime(runtime)
})

test('already-pending screenplay review acts from Development and deep return restores exact current Lot truth', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await exposeRendererEvidence(page)

  const stopped = directResult('script-review')
  const accept = stopped.scriptDecision?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('script-review fixture has no Accept action')
  const accepted = runScriptProjectAction(stopped.next, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  await seedLot(page, 'script-review', {
    saveBytes: expectedFinalBytes('script-review'),
    recoveredWeek: corpusFixture('script-review').expectedEndWeek,
  })

  const pendingBytes = await activeSessionBytes(page)
  await expect(page.getByTestId('lot-sim-to-next-event')).toBeDisabled()
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  const development = page.getByTestId('lot-nav-writers')
  await development.focus()
  await expect(development).toBeFocused()
  await page.keyboard.press('Enter')
  const panel = page.getByTestId('lot-script-review-panel')
  await expect(panel).toBeVisible()
  const pendingHeading = panel.getByTestId('lot-script-review-heading')
  await expect(pendingHeading).toContainText('Fires of Gambit')
  await expect(pendingHeading).toBeFocused()
  await expectInsideVisualViewport('960×540 pending screenplay heading', pendingHeading, page)
  const worldAction = panel.getByTestId(
    `lot-script-review-action-acceptScript-${accept.projectId}`,
  )
  const deepAction = panel.getByTestId('lot-script-review-open-details')
  await expectEarlierInDocument(worldAction, deepAction)
  expect(await activeSessionBytes(page)).toBe(pendingBytes)

  await deepAction.click()
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId(`script-card-${accept.projectId}`)).toContainText('Fires of Gambit')
  await page.getByTestId('writers-room-back').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveAttribute(
    'data-entry-focus',
    'script-review',
  )
  await expect(page.getByTestId('lot-script-review-heading')).toContainText('Fires of Gambit')
  expect(await activeSessionBytes(page)).toBe(pendingBytes)

  const returnedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await returnedCanvas.evaluate((node) => {
    node.setAttribute('data-pending-script-action-proof', 'same-mounted-world')
  })
  const beforeAction = await rendererEvidence(page)
  await page.getByTestId(
    `lot-script-review-action-acceptScript-${accept.projectId}`,
  ).click()
  await expect(page.getByTestId('lot-script-review-feedback')).toContainText('Ready to package')
  await expect(returnedCanvas).toHaveAttribute(
    'data-pending-script-action-proof',
    'same-mounted-world',
  )
  const afterAction = await rendererEvidence(page)
  expect(afterAction.constructions).toBe(beforeAction.constructions)
  expect(afterAction.destroys).toBe(beforeAction.destroys)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(960)
  await page.screenshot({ path: join(outDir, '01c-pending-screenplay-development-action.png') })
  expectCleanRuntime(runtime)
})

test('casting stop keeps all six advisory results in the world, preserves optional exact detail, then opens Package after the accepted save', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedLot(page, 'casting-review')
  const stopped = directResult('casting-review')
  const review = castingSessionsBoard(stopped.next).sections.needsReview.find(
    (card) => card.sessionId === 'casting-0000' && card.projectId === 'script-0000',
  )
  if (review === undefined || review.results === null) {
    throw new Error('casting-review fixture has no complete six-row review')
  }
  const acknowledge = review.legalActions.find(
    (action) => action.kind === 'acknowledgeCastingSession',
  )
  if (acknowledge === undefined || !acknowledge.opensPackage) {
    throw new Error('casting-review fixture has no clear Package handoff')
  }
  const accepted = acknowledgeCastingSessionAction(stopped.next, acknowledge.sessionId)
  if (!accepted.ok) throw new Error(accepted.error)
  const sim = page.getByTestId('lot-sim-to-next-event')
  await sim.focus()
  await page.keyboard.press('Space')

  const rail = await expectExactRail(page, 'casting-review')
  await expect(rail).toContainText(review.title)
  // M-B re-pin: the rail's identity line is player language now. The ids remain
  // asserted structurally on the casting-review panel's data-* provenance attributes.
  await expect(rail).toContainText('The camera tests are in, at Casting')
  await expect(rail).not.toContainText(review.projectId)
  await expect(rail).not.toContainText(review.sessionId)
  await expect(page.getByTestId('lot-nav-casting')).toHaveAttribute('aria-current', 'true')
  expect((await rendererEvidence(page)).debug).toMatchObject({
    selectedPersonId: null,
    selectedPlaceId: null,
    selectedProductionId: null,
  })

  const panel = rail.getByTestId('lot-casting-review-panel')
  await expect(panel).toHaveAttribute('data-opens-package', 'true')
  await expect(panel.getByTestId('lot-casting-review-writer')).toHaveText(review.writer.name)
  await expect(panel.getByTestId('lot-casting-review-consequence')).toContainText(
    'results remain advisory and select no winner',
  )
  await expect(panel.getByTestId('lot-casting-review-package-state')).toContainText(
    'Known package gates clear',
  )
  const roleOrder = ['lead', 'antagonist', 'support'] as const
  await expect(panel.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
  for (const role of roleOrder) {
    const candidates = review.results[role]
    expect(candidates).toHaveLength(2)
    for (let index = 0; index < candidates.length; index += 1) {
      const evidence = candidates[index]!
      await expect(panel.getByTestId(`lot-casting-review-name-${role}-${index}`))
        .toHaveText(evidence.name)
      await expect(panel.getByTestId(`lot-casting-review-talent-id-${role}-${index}`))
        .toContainText(evidence.talentId)
      await expect(panel.getByTestId(`lot-casting-review-estimate-${role}-${index}`))
        .toContainText(`${evidence.estimate} · ${evidence.low}–${evidence.high}`)
      await expect(panel.getByTestId(`lot-casting-review-fit-${role}-${index}`))
        .toHaveText(Number.isInteger(evidence.fit.score)
          ? String(evidence.fit.score)
          : evidence.fit.score.toFixed(1))
      await expect(panel.getByTestId(`lot-casting-review-availability-${role}-${index}`))
        .toContainText(evidence.availabilityLabel)
      for (const language of [...evidence.strengths, ...evidence.concerns]) {
        await expect(panel.getByTestId(`lot-casting-review-role-${role}`)).toContainText(language)
      }
    }
  }
  await expect(panel).not.toContainText(/combined score|recommended cast|ranked first/i)
  const worldAction = panel.getByTestId(
    `lot-casting-review-action-acknowledgeCastingSession-${acknowledge.sessionId}`,
  )
  await expect(worldAction).toHaveText(acknowledge.label)
  await expectEarlierInDocument(worldAction, page.getByTestId('lot-next-event-open-details'))
  await page.screenshot({ path: join(outDir, '02a-casting-review-six-rows-live-lot.png') })

  await page.getByTestId('lot-next-event-open-details').click()
  const exactStatus = page.getByTestId(`casting-status-${review.projectId}`)
  await expect(page.getByTestId('casting-room')).toBeVisible()
  await expect(page.getByTestId(`casting-project-${review.projectId}`)).toContainText(review.title)
  await expect(exactStatus).toContainText('Results need review')
  await expect(exactStatus).toBeFocused()
  await page.getByTestId('casting-room-back').click()
  await expect(page.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(page.getByTestId('lot-next-event-announcement')).toHaveCount(0)
  await expect(page.getByTestId('lot-casting-review-panel')).toBeVisible()

  const retainedLot = page.getByTestId('studio-lot-screen')
  const retainedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const retainedLotNode = await retainedLot.elementHandle()
  const retainedCanvasNode = await retainedCanvas.elementHandle()
  if (retainedLotNode === null || retainedCanvasNode === null) {
    throw new Error('retained Casting Package identity cannot capture the live Lot/canvas')
  }
  const retainedView = await rendererViewIdentity(page)
  const beforePackage = await rendererEvidence(page)
  const stableUrl = page.url()

  await page.getByTestId(
    `lot-casting-review-action-acknowledgeCastingSession-${acknowledge.sessionId}`,
  ).click()
  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('assembly-surface')).toHaveAttribute(
    'data-surface',
    'lot-workspace',
  )
  await expect(page.getByTestId('assembly-steps')).toHaveCount(1)
  await expect(page.getByTestId('assembly-back-dashboard')).toHaveCount(0)
  await expect(page.getByTestId('assembly-casting-handoff')).toContainText(
    `${review.title} casting review complete`,
  )
  await expect(page.getByTestId('assembly-casting-handoff')).toContainText(
    'Auditions did not select anyone',
  )
  await expect(page.getByTestId('assembly-talent-heading')).toBeFocused()
  await expect(retainedLot).toHaveCount(1)
  await expect(retainedLot).toHaveAttribute('inert', '')
  await expect(retainedCanvas).toHaveCount(1)
  expect(await retainedLot.evaluate((node, prior) => node === prior, retainedLotNode)).toBe(true)
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  await expectSameRendererView(page, retainedView)
  const packageOpen = await rendererEvidence(page)
  expect(packageOpen.constructions).toBe(beforePackage.constructions)
  expect(packageOpen.destroys).toBe(beforePackage.destroys)
  expect(packageOpen.camera).toEqual(beforePackage.camera)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))
  expect(page.url()).toBe(stableUrl)
  await page.screenshot({ path: join(outDir, '02-casting-lot-native-package-handoff.png') })

  const profileOpener = page
    .getByTestId('picker-director')
    .locator('[data-testid^="picker-open-profile-"]')
    .first()
  await profileOpener.scrollIntoViewIfNeeded()
  await profileOpener.focus()
  await expect(profileOpener).toBeFocused()
  await profileOpener.click()
  await expect(page.getByTestId('talent-profile')).toBeVisible()
  await expect(page.getByTestId('lot-package-workspace-layer')).toHaveAttribute('inert', '')
  await expect(page.getByTestId('lot-package-workspace-layer')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(retainedLot).toHaveAttribute('inert', '')
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  await expectSameRendererView(page, retainedView)
  await page.screenshot({ path: join(outDir, '02b-casting-profile-over-retained-package.png') })

  await page.getByTestId('talent-profile-close').click()
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('lot-package-workspace-layer')).not.toHaveAttribute('inert')
  await expect(page.getByTestId('lot-package-workspace-layer')).not.toHaveAttribute('aria-hidden')
  await expect(profileOpener).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))

  await page.setViewportSize({ width: 960, height: 540 })
  const workspaceBox = await page.getByTestId('lot-package-workspace').boundingBox()
  expect(workspaceBox, '960×540 retained Package workspace').not.toBeNull()
  expect(workspaceBox!.x).toBeGreaterThan(0)
  expect(workspaceBox!.x + workspaceBox!.width).toBeLessThanOrEqual(960)
  await expectReachableAction(
    '960×540 retained Package close',
    page.getByTestId('lot-package-workspace-close'),
  )
  expect(await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    scrollOwners: document.querySelectorAll('[data-testid="assembly-workspace-scroll"]').length,
  }))).toEqual({ pageWidth: 960, scrollOwners: 1 })
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  await expectSameRendererView(page, retainedView)
  await page.screenshot({ path: join(outDir, '02c-casting-package-960x540.png') })

  await page.getByTestId('lot-package-workspace-close').click()
  await expect(page.getByTestId('lot-package-workspace')).toHaveCount(0)
  await expect(page.getByTestId('assembly-steps')).toHaveCount(0)
  await expect(retainedLot).toHaveAttribute(
    'data-entry-focus',
    'next-event-reaction',
  )
  await expect(retainedLot).not.toHaveAttribute('inert')
  await expect(retainedCanvas).toHaveCount(1)
  expect(await retainedLot.evaluate((node, prior) => node === prior, retainedLotNode)).toBe(true)
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  await expectSameRendererView(page, retainedView)
  const afterCancel = await rendererEvidence(page)
  expect(afterCancel.constructions).toBe(beforePackage.constructions)
  expect(afterCancel.destroys).toBe(beforePackage.destroys)
  expect(afterCancel.camera).toEqual(beforePackage.camera)
  await expect(page.getByTestId('lot-casting-review-panel')).toHaveCount(0)
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveCount(0)
  const castingSuccess = page.getByTestId('lot-casting-review-success')
  await expect(castingSuccess).toBeVisible()
  await expect(castingSuccess.getByRole('heading', { name: review.title })).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))
  expect(page.url()).toBe(stableUrl)
  await page.screenshot({ path: join(outDir, '02c-casting-package-cancel-same-lot.png') })
  expectCleanRuntime(runtime)
})

test('retained Casting Package greenlight forms the exact picture in the same Lot, canvas, camera, and renderer', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedLot(page, 'casting-review')
  const stopped = directResult('casting-review')
  const review = castingSessionsBoard(stopped.next).sections.needsReview.find(
    (card) => card.sessionId === 'casting-0000' && card.projectId === 'script-0000',
  )
  const acknowledge = review?.legalActions.find(
    (action) => action.kind === 'acknowledgeCastingSession',
  )
  if (review === undefined || acknowledge === undefined || !acknowledge.opensPackage) {
    throw new Error('casting-review fixture has no clear retained Package handoff')
  }
  const accepted = acknowledgeCastingSessionAction(stopped.next, acknowledge.sessionId)
  if (!accepted.ok) throw new Error(accepted.error)

  await page.getByTestId('lot-sim-to-next-event').click()
  const rail = await expectExactRail(page, 'casting-review')
  const retainedLot = page.getByTestId('studio-lot-screen')
  const retainedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const retainedLotNode = await retainedLot.elementHandle()
  const retainedCanvasNode = await retainedCanvas.elementHandle()
  if (retainedLotNode === null || retainedCanvasNode === null) {
    throw new Error('retained greenlight cannot capture the live Lot/canvas')
  }
  const retainedView = await rendererViewIdentity(page)
  const beforePackage = await rendererEvidence(page)
  const stableUrl = page.url()

  await rail.getByTestId(
    `lot-casting-review-action-acknowledgeCastingSession-${acknowledge.sessionId}`,
  ).click()
  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('assembly-surface')).toHaveAttribute(
    'data-surface',
    'lot-workspace',
  )
  await expect(retainedLot).toHaveAttribute('inert', '')
  await expect(
    page.locator('[data-testid^="talent-"][aria-pressed="true"]'),
  ).toHaveCount(0)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))

  const director = await chooseFirstEligiblePackageTalent(page, 'picker-director')
  const lead = await chooseFirstEligiblePackageTalent(page, 'picker-lead')
  const antagonist = await chooseFirstEligiblePackageTalent(page, 'picker-antagonist')
  const support = await chooseFirstEligiblePackageTalent(page, 'picker-support')
  const craft = await chooseFirstEligiblePackageTalent(page, 'picker-craft')

  const locked = scriptProjectsBoard(accepted.next).packages.find(
    (candidate) => candidate.projectId === review.projectId,
  )
  if (locked === undefined) throw new Error('accepted Casting successor has no exact Ready screenplay')
  const concept = findConcept(accepted.next, locked.concept.id)
  if (concept === undefined) throw new Error('accepted Casting successor has no exact concept')
  const negative = requiredNegative(concept, locked.lockedShape, accepted.next)
  const withoutMarketing: DraftPackage = {
    conceptId: locked.concept.id,
    shape: locked.lockedShape,
    promise: locked.lockedPromise,
    writerId: locked.writer.id,
    directorId: director.id,
    cast: {
      lead: lead.id,
      antagonist: antagonist.id,
      support: support.id,
    },
    craftIds: [craft.id],
    budget: { negative, marketing: 0 },
  }
  const exactPackage: DraftPackage = {
    ...withoutMarketing,
    budget: {
      negative,
      marketing: marketingMenu(
        accepted.next,
        withoutMarketing,
        review.projectId,
      ).levels[1],
    },
  }
  const directGreenlight = greenlightScriptProject(
    accepted.next,
    review.projectId,
    exactPackage,
  )
  if (!directGreenlight.ok) throw new Error(directGreenlight.error)
  expect(directGreenlight.next.studio.activeProductions).toHaveLength(1)
  const productionId = directGreenlight.next.studio.activeProductions[0]!.id

  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('greenlight')).toBeEnabled()
  const beforeGreenlight = await rendererEvidence(page)
  expect(beforeGreenlight.constructions).toBe(beforePackage.constructions)
  expect(beforeGreenlight.destroys).toBe(beforePackage.destroys)
  expect(beforeGreenlight.camera).toEqual(beforePackage.camera)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))

  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('lot-package-workspace')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveText(
    'PICTURE FORMED',
  )
  await expect.poll(() => activeSessionBytes(page)).toBe(exportSaveJson(directGreenlight.next))

  await expect(retainedLot).toHaveCount(1)
  await expect(retainedLot).not.toHaveAttribute('inert')
  await expect(retainedCanvas).toHaveCount(1)
  expect(await retainedLot.evaluate((node, prior) => node === prior, retainedLotNode)).toBe(true)
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  await expectSameRendererView(page, retainedView)
  const afterGreenlight = await rendererEvidence(page)
  expect(afterGreenlight.constructions).toBe(beforePackage.constructions)
  expect(afterGreenlight.destroys).toBe(beforePackage.destroys)
  expect(afterGreenlight.camera).toEqual(beforePackage.camera)
  expect(page.url()).toBe(stableUrl)

  const production = page.getByTestId('hollywood-current-production')
  await expect(production).toContainText(review.title)
  await expect(production.getByText('Development', { exact: true })).toBeVisible()
  await expect(production.getByText('Development & Casting', { exact: true })).toBeVisible()
  await expect(production.getByText('On schedule', { exact: true })).toBeVisible()
  await expect(production.getByText('8', { exact: true })).toBeVisible()
  await expect(production).toContainText(director.name)
  await expect(production).toContainText(lead.name)
  await expect(page.getByTestId(`hollywood-select-person-${director.id}`))
    .toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId(`hollywood-select-person-${lead.id}`))
    .toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator(
    `[data-testid^="hollywood-select-person-"][data-production-id="${productionId}"]`,
  )).toHaveCount(6)
  await expect(page.getByTestId('lot-production-formation-announcement')).toContainText(
    `Picture formed: ${review.title}`,
  )
  await expect(page.getByTestId('hollywood-person-inspector-status')).toBeFocused()
  await page.screenshot({ path: join(outDir, '02d-casting-greenlight-same-canvas-formation.png') })
  expectCleanRuntime(runtime)
})

test('blocked casting review completes on the same living Lot with exact current remedies', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await exposeRendererEvidence(page)
  const reviewState = directResult('casting-review').next
  const clearReview = castingSessionsBoard(reviewState).sections.needsReview[0]
  if (clearReview === undefined) throw new Error('casting review card is absent')
  const released = releaseTalentAction(reviewState, clearReview.writer.id)
  if (!released.ok) throw new Error(released.error)
  const blockedReview = castingSessionsBoard(released.next).sections.needsReview[0]
  const acknowledge = blockedReview?.legalActions.find(
    (action) => action.kind === 'acknowledgeCastingSession',
  )
  if (
    blockedReview === undefined ||
    acknowledge === undefined ||
    acknowledge.opensPackage ||
    blockedReview.packageAvailability === null ||
    blockedReview.packageAvailability.blockers.length === 0
  ) throw new Error('test-only writer release did not create the expected Package blocker')
  const accepted = acknowledgeCastingSessionAction(released.next, acknowledge.sessionId)
  if (!accepted.ok) throw new Error(accepted.error)

  await seedLot(page, 'casting-review', {
    saveBytes: exportSaveJson(released.next),
    recoveredWeek: released.next.market.tick,
  })
  const canvas = page.getByTestId('studio-lot-canvas')
  await canvas.evaluate((node) => node.setAttribute('data-blocked-casting-proof', 'same-world'))
  const casting = page.getByTestId('lot-nav-casting')
  await casting.focus()
  await expect(casting).toBeFocused()
  await page.keyboard.press('Enter')

  const panel = page.getByTestId('lot-casting-review-panel')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveAttribute('data-opens-package', 'false')
  await expect(panel.getByTestId('lot-casting-review-package-state')).toContainText(
    'Package gates blocked',
  )
  for (const blocker of blockedReview.packageAvailability.blockers) {
    await expect(panel.getByTestId('lot-casting-review-blockers')).toContainText(blocker.headline)
    await expect(panel.getByTestId('lot-casting-review-blockers')).toContainText(blocker.detail)
    await expect(panel.getByTestId('lot-casting-review-blockers')).toContainText(blocker.remedy)
  }
  const beforeAction = await rendererEvidence(page)
  await panel.getByTestId(
    `lot-casting-review-action-acknowledgeCastingSession-${acknowledge.sessionId}`,
  ).click()

  const success = page.getByTestId('lot-casting-review-success')
  await expect(success).toContainText('casting review is complete')
  await expect(success).toContainText('Persisted evidence remains available')
  await expect(success.getByTestId('lot-casting-review-blocked-success')).toContainText(
    'Six persisted camera-test observations remain available',
  )
  for (const blocker of blockedReview.packageAvailability.blockers) {
    await expect(success).toContainText(blocker.headline)
    await expect(success).toContainText(blocker.detail)
    await expect(success).toContainText(blocker.remedy)
  }
  await expect(page.getByTestId('lot-casting-review-announcement')).toContainText(
    'Persisted evidence remains available',
  )
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(canvas).toHaveAttribute('data-blocked-casting-proof', 'same-world')
  const afterAction = await rendererEvidence(page)
  expect(afterAction.constructions).toBe(beforeAction.constructions)
  expect(afterAction.destroys).toBe(beforeAction.destroys)
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(accepted.next))
  await page.screenshot({ path: join(outDir, '02b-casting-blocked-same-lot.png') })
  expectCleanRuntime(runtime)
})

test('casting review keeps six-row world truth reachable at effective 200% in forced colors', async ({ page }, testInfo) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await seedLot(page, 'casting-review')
  await page.getByTestId('lot-sim-to-next-event').click()
  await expectExactRail(page, 'casting-review')

  const panel = page.getByTestId('lot-casting-review-panel')
  const action = panel.getByTestId(
    'lot-casting-review-action-acknowledgeCastingSession-casting-0000',
  )
  const details = page.getByTestId('lot-next-event-open-details')
  const retainedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const retainedCanvasNode = await retainedCanvas.elementHandle()
  if (retainedCanvasNode === null) throw new Error('200% Casting canvas identity is absent')
  await expect(panel.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
  await expectEarlierInDocument(action, details)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)

  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  await expectReachableAction('Casting 200% world action', action)
  await expectReachableAction('Casting 200% deep detail', details)
  expect(await page.evaluate(() => ({
    pageFits: document.documentElement.scrollWidth <= window.innerWidth,
    rows: document.querySelectorAll('[data-testid^="lot-casting-review-row-"]').length,
    panelFits: (() => {
      const owner = document.querySelector<HTMLElement>('[data-testid="lot-casting-review-panel"]')
      return owner !== null && owner.scrollWidth <= owner.clientWidth
    })(),
  }))).toEqual({ pageFits: true, rows: 6, panelFits: true })
  await page.screenshot({ path: join(outDir, '02c-casting-forced-colors-css-zoom-200.png') })

  await action.click()
  const workspace = page.getByTestId('lot-package-workspace')
  const closeWorkspace = page.getByTestId('lot-package-workspace-close')
  await expect(workspace).toBeVisible()
  await expect(page.getByTestId('assembly-surface')).toHaveAttribute(
    'data-surface',
    'lot-workspace',
  )
  await expect(page.getByTestId('step-talent')).toHaveAttribute('aria-current', 'step')
  await expect(page.getByTestId('studio-lot-screen')).toHaveAttribute('inert', '')
  await expect(retainedCanvas).toHaveCount(1)
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  expect(await page.evaluate(() => ({
    pageFits: document.documentElement.scrollWidth <= window.innerWidth,
    oneScrollOwner: document.querySelectorAll('[data-testid="assembly-workspace-scroll"]').length,
  }))).toEqual({ pageFits: true, oneScrollOwner: 1 })

  const pointerViewport = await closeWorkspace.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    const visual = window.visualViewport
    const left = visual?.offsetLeft ?? 0
    const top = visual?.offsetTop ?? 0
    const width = visual?.width ?? window.innerWidth
    const height = visual?.height ?? window.innerHeight
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      visualLeft: left,
      visualTop: top,
      visualWidth: width,
      visualHeight: height,
      fullyInside:
        rect.left >= left &&
        rect.top >= top &&
        rect.right <= left + width &&
        rect.bottom <= top + height,
    }
  })
  testInfo.annotations.push({
    type: 'effective-200-package-close-pointer-viewport',
    description: JSON.stringify(pointerViewport),
  })
  expect(pointerViewport.width).toBeGreaterThanOrEqual(44)
  expect(pointerViewport.height).toBeGreaterThanOrEqual(44)
  expect(pointerViewport.fullyInside).toBe(true)
  await closeWorkspace.click({ trial: true })
  await closeWorkspace.focus()
  await expect(closeWorkspace).toBeFocused()
  await page.screenshot({ path: join(outDir, '02d-casting-package-forced-colors-200.png') })
  await page.keyboard.press('Enter')
  await expect(workspace).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert')
  expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
  expectCleanRuntime(runtime)
})

test('480x270 DSF2 keeps all six Casting observations and both world-first actions reachable', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 480, height: 270 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    forcedColors: 'active',
  })
  const page = await context.newPage()
  const runtime = captureRuntimeSignals(page)
  try {
    await seedLot(page, 'casting-review')
    await page.getByTestId('lot-sim-to-next-event').click()
    await expectExactRail(page, 'casting-review')
    const panel = page.getByTestId('lot-casting-review-panel')
    const action = panel.getByTestId(
      'lot-casting-review-action-acknowledgeCastingSession-casting-0000',
    )
    const details = page.getByTestId('lot-next-event-open-details')
    const retainedCanvas = page.getByTestId('studio-lot-canvas').locator('canvas')
    const retainedCanvasNode = await retainedCanvas.elementHandle()
    if (retainedCanvasNode === null) throw new Error('480/DSF2 Casting canvas identity is absent')

    await expect(panel.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
    await expectEarlierInDocument(action, details)
    await expectReachableAction('480/DSF2 Casting world action', action)
    await expectReachableAction('480/DSF2 Casting details', details)
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      compact: matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
      rows: document.querySelectorAll('[data-testid^="lot-casting-review-row-"]').length,
      evidenceScrolls: (() => {
        const evidence = document.querySelector<HTMLElement>('.lot-casting-review-evidence')
        return evidence !== null && evidence.scrollHeight > evidence.clientHeight
      })(),
    }))).toEqual({
      innerWidth: 480,
      devicePixelRatio: 2,
      compact: true,
      scrollWidth: 480,
      rows: 6,
      evidenceScrolls: true,
    })
    await expectNoVisualOverlap(
      '480/DSF2 Casting rail / production desk',
      page.getByTestId('lot-next-event-rail'),
      page.getByRole('region', { name: 'Current production' }),
    )
    await expectNoVisualOverlap(
      '480/DSF2 Casting rail / studio inspector',
      page.getByTestId('lot-next-event-rail'),
      page.getByTestId('hollywood-inspector'),
    )
    await page.screenshot({ path: join(outDir, '02d-casting-480x270-dsf2.png') })

    await action.click()
    const workspace = page.getByTestId('lot-package-workspace')
    await expect(workspace).toBeVisible()
    await expect(page.getByTestId('assembly-surface')).toHaveAttribute(
      'data-surface',
      'lot-workspace',
    )
    await expect(page.getByTestId('step-talent')).toHaveAttribute('aria-current', 'step')
    await expect(page.getByTestId('studio-lot-screen')).toHaveAttribute('inert', '')
    await expect(retainedCanvas).toHaveCount(1)
    expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
    await expectReachableAction(
      '480/DSF2 Casting Package close',
      page.getByTestId('lot-package-workspace-close'),
    )
    const compactBox = await workspace.boundingBox()
    expect(compactBox, '480/DSF2 Package workspace').not.toBeNull()
    expect(compactBox!.x).toBeGreaterThanOrEqual(8)
    expect(compactBox!.x + compactBox!.width).toBeLessThanOrEqual(472)
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      scrollWidth: document.documentElement.scrollWidth,
      oneScrollOwner: document.querySelectorAll('[data-testid="assembly-workspace-scroll"]').length,
    }))).toEqual({
      innerWidth: 480,
      devicePixelRatio: 2,
      scrollWidth: 480,
      oneScrollOwner: 1,
    })
    await page.screenshot({ path: join(outDir, '02f-casting-package-480x270-dsf2.png') })
    await page.getByTestId('lot-package-workspace-close').click()
    await expect(workspace).toHaveCount(0)
    await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert')
    expect(await retainedCanvas.evaluate((node, prior) => node === prior, retainedCanvasNode)).toBe(true)
    expectCleanRuntime(runtime)
  } finally {
    await context.close()
  }
})

test('already-pending Casting review keeps both actions physically reachable in Hollywood and Classic at governed viewports', async ({ browser }) => {
  const pending = directResult('casting-review').next
  const review = castingSessionsBoard(pending).sections.needsReview.find(
    (card) => card.sessionId === 'casting-0000' && card.projectId === 'script-0000',
  )
  const acknowledge = review?.legalActions.find(
    (action) => action.kind === 'acknowledgeCastingSession',
  )
  if (review === undefined || review.results === null || acknowledge === undefined) {
    throw new Error('casting-review fixture has no pending six-row review action')
  }

  const configurations = [
    { label: 'Hollywood desktop', width: 1280, height: 720, dsf: 1, classic: false },
    { label: 'Hollywood 960', width: 960, height: 540, dsf: 1, classic: false },
    { label: 'Hollywood 480/DSF2', width: 480, height: 270, dsf: 2, classic: false },
    { label: 'Classic desktop', width: 1280, height: 720, dsf: 1, classic: true },
    { label: 'Classic 960', width: 960, height: 540, dsf: 1, classic: true },
    { label: 'Classic 480/DSF2', width: 480, height: 270, dsf: 2, classic: true },
  ] as const

  for (const configuration of configurations) {
    const context = await browser.newContext({
      viewport: { width: configuration.width, height: configuration.height },
      deviceScaleFactor: configuration.dsf,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const runtime = captureRuntimeSignals(page)
    try {
      await seedLot(page, 'casting-review', {
        saveBytes: exportSaveJson(pending),
        recoveredWeek: pending.market.tick,
        operationHollywoodRollback: configuration.classic,
      })
      const casting = page.getByTestId('lot-nav-casting')
      await casting.focus()
      await expect(casting).toBeFocused()
      await page.keyboard.press('Enter')

      const owner = page.getByTestId('lot-casting-review-context')
      const panel = page.getByTestId('lot-casting-review-panel')
      const action = panel.getByTestId(
        `lot-casting-review-action-acknowledgeCastingSession-${acknowledge.sessionId}`,
      )
      const details = panel.getByTestId('lot-casting-review-open-details')
      await expect(owner).toBeVisible()
      await expect(panel.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
      await expect(
        panel.getByTestId('lot-casting-review-heading'),
        `${configuration.label} pending review heading owns focus`,
      ).toBeFocused()
      await expect(action).toHaveText(acknowledge.label)
      await expectEarlierInDocument(action, details)
      await expectReachableAction(`${configuration.label} pending world action`, action)
      await expectReachableAction(`${configuration.label} pending deep detail`, details)

      expect(await page.evaluate(() => {
        const owner = document.querySelector<HTMLElement>(
          '[data-testid="lot-casting-review-context"]',
        )
        const evidence = document.querySelector<HTMLElement>('.lot-casting-review-evidence')
        const screen = document.querySelector<HTMLElement>('[data-testid="studio-lot-screen"]')
        return {
          pageFits: document.documentElement.scrollWidth <= window.innerWidth,
          ownerClipsItsPanel: owner === null || owner.scrollHeight > owner.clientHeight + 1,
          evidenceScrolls: evidence !== null && evidence.scrollHeight > evidence.clientHeight,
          hollywood: screen?.classList.contains('lot-hollywood') ?? false,
        }
      })).toEqual({
        pageFits: true,
        ownerClipsItsPanel: false,
        evidenceScrolls: true,
        hollywood: !configuration.classic,
      })
      expectCleanRuntime(runtime)
    } finally {
      await context.close()
    }
  }
})

test('Stage 7 physically selects the exact picture, keeps its world command first, and consumes the receipt on command', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedLot(page, 'stage-7-production-decision')
  await page.getByTestId('lot-sim-to-next-event').click()
  const rail = await expectExactRail(page, 'stage-7-production-decision')
  await expect(rail).toContainText('House of Aviator')
  await expect(rail).toContainText('Soundstage 7')
  await expect(page.getByTestId('hollywood-current-production')).toContainText('House of Aviator')

  const result = directResult('stage-7-production-decision')
  const command = result.productionDecision?.command
  expect(command).not.toBeNull()
  expect(command).not.toBeUndefined()
  const worldCommand = page.getByTestId(`hollywood-production-command-${command!.kind}`)
  await expect(worldCommand).toHaveText(command!.label)
  await expectEarlierInDocument(worldCommand, page.getByTestId('lot-next-event-open-details'))
  expect((await rendererEvidence(page)).debug).toMatchObject({
    selectedPersonId: null,
    selectedPlaceId: 'stage-7',
    selectedProductionId: 'prod-0000',
  })
  await page.screenshot({ path: join(outDir, '03-stage-7-physical-next-event.png') })

  const commanded = runProductionCommand(result.next, command!)
  expect(commanded.ok).toBe(true)
  if (!commanded.ok) throw new Error(commanded.error)
  await worldCommand.click()
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  expect(await activeSessionBytes(page)).toBe(exportSaveJson(commanded.next))
  expectCleanRuntime(runtime)
})

test('same-title Stage 12 truth remains a semantic production and never borrows Stage 7', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedLot(page, 'stage-12-production-decision')
  await page.getByTestId('lot-sim-to-next-event').click()
  const rail = await expectExactRail(page, 'stage-12-production-decision')
  await expect(rail).toContainText('City of Cascade')
  await expect(rail).toContainText('Soundstage 12')
  await expect(page.getByTestId('hollywood-current-production')).toContainText('City of Cascade')
  await expect(page.getByTestId('hollywood-stage-12-fallback')).toContainText(
    'Soundstage 12 + Scenery Shop is authoritative',
  )
  await expect(page.getByTestId('lot-nav-stage-a')).not.toHaveAttribute('aria-current', 'true')
  expect((await rendererEvidence(page)).debug).toMatchObject({
    selectedPersonId: null,
    selectedPlaceId: null,
    selectedProductionId: null,
  })
  await page.screenshot({ path: join(outDir, '04-stage-12-semantic-no-substitution.png') })
  expectCleanRuntime(runtime)
})

test('Annex completion owns one focus/live instance and exact Back does not replay it', async ({ page }) => {
  const runtime = captureRuntimeSignals(page)
  await exposeRendererEvidence(page)
  await seedLot(page, 'construction-only-completion')
  await page.getByTestId('lot-sim-to-next-event').click()
  const rail = await page.getByTestId('lot-next-event-rail')
  await expect(rail).toHaveAttribute('data-feedback-kind', 'next-event-exact')
  await expectDirectSuccessor(page, 'construction-only-completion')
  const completion = page.getByTestId('annex-completion-summary')
  await expect(completion).toHaveCount(1)
  await expect(completion).toBeFocused()
  await expect(completion).toContainText(
    corpusFixture('construction-only-completion').expectedConstructionCompletion!.message,
  )
  await expect(page.getByTestId('lot-next-event-announcement')).toHaveCount(0)
  await expect(page.getByTestId('lot-nav-expansion')).toHaveAttribute('aria-current', 'true')
  expect((await rendererEvidence(page)).debug).toMatchObject({
    selectedPlaceId: 'annex-parcel',
    expansionStatus: 'operational',
  })
  await page.screenshot({ path: join(outDir, '05-annex-completion-first-arrival.png') })

  await page.getByTestId('lot-next-event-open-details').click()
  await expect(page.getByTestId('studio-development')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Studio Development' })).toBeFocused()
  await page.getByTestId('development-back').click()
  await expect(page.getByTestId('lot-next-event-rail')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(page.getByTestId('annex-completion-summary')).toHaveCount(0)
  await expect(page.getByTestId('lot-next-event-announcement')).toHaveCount(0)
  await page.screenshot({ path: join(outDir, '05-annex-completion-restored-without-replay.png') })
  expectCleanRuntime(runtime)
})

test('Gazette/co-event and non-Gazette releases retain their exact chains and return receipt-free', async ({ context, page }, testInfo) => {
  const gazetteRuntime = captureRuntimeSignals(page)
  await seedLot(page, 'gazette-release-with-annex-completion')
  const releasingCompany = page.locator(
    '[data-production-id="prod-0004"][data-production-role]',
  )
  await expect(releasingCompany).toHaveCount(6)
  const releaseReadyDirector = page.locator(
    '[data-production-id="prod-0004"][data-production-role="director"]',
  )
  await expect(releaseReadyDirector).toHaveCount(1)
  await releaseReadyDirector.click()
  await expect(releaseReadyDirector).toHaveAttribute('aria-pressed', 'true')
  const releaseReadyPersonFacts = page.getByTestId('hollywood-person-work-facts')
  await expect(releaseReadyPersonFacts).toContainText('Release Ready')
  await expect(releaseReadyPersonFacts).toContainText('The Crimson Prizefighter')
  const gazetteWallMs = await measureActivation(
    page,
    'gazette-release-with-annex-completion',
    () => page.getByTestId('lot-sim-to-next-event').click(),
  )
  measuredBrowserEvidence.browserWallMs.releaseCoevent = gazetteWallMs
  testInfo.annotations.push({ type: 'release-event-wall-ms', description: gazetteWallMs.toFixed(2) })
  await expectDirectSuccessor(page, 'gazette-release-with-annex-completion')
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(page.getByTestId('newspaper-headline')).toContainText(
    /THE CRIMSON PRIZEFIGHTER/i,
  )
  const completion = page.getByTestId('annex-completion-summary')
  await expect(completion).toHaveCount(1)
  await expect(completion).toBeFocused()
  await page.screenshot({ path: join(outDir, '06-gazette-release-annex-coevent.png') })

  await page.getByTestId('newspaper-continue').click()
  await expect(page.getByTestId('release-list')).toBeVisible()
  await expect(page.getByTestId('release-card-prod-0004')).toContainText(
    'The Crimson Prizefighter',
  )
  await expect(page.getByTestId('annex-completion-summary')).toHaveCount(0)
  await page.getByTestId('open-autopsy-prod-0004').click()
  await expect(page.getByTestId('autopsy')).toBeVisible()
  await expect(page.getByTestId('autopsy-participants')).toBeVisible()
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-sim-to-next-event')).toBeFocused()
  await expect(page.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(page.getByTestId('annex-completion-summary')).toHaveCount(0)
  await expect(page.getByTestId('lot-annex-operational-announcement')).toHaveText('')
  await expect(releasingCompany).toHaveCount(0)
  await page.screenshot({ path: join(outDir, '07-gazette-receipt-free-lot-return.png') })
  expectCleanRuntime(gazetteRuntime)

  const directPage = await context.newPage()
  const directRuntime = captureRuntimeSignals(directPage)
  await seedLot(directPage, 'non-gazette-release')
  await directPage.getByTestId('lot-sim-to-next-event').click()
  await expect(directPage.getByTestId('newspaper-reveal')).toHaveCount(0)
  await expect(directPage.getByTestId('release-list')).toBeVisible()
  await expect(directPage.getByTestId('release-card-prod-0000')).toContainText(
    'The Crimson Gambit',
  )
  await expectDirectSuccessor(directPage, 'non-gazette-release')
  await directPage.getByTestId('release-continue').click()
  await expect(directPage.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(directPage.getByTestId('lot-sim-to-next-event')).toBeFocused()
  await expect(directPage.getByTestId('lot-next-event-rail')).toHaveCount(0)
  expectCleanRuntime(directRuntime)
  await directPage.close()
})

test('held keyboard and same-stack touch/pointer compatibility tails advance the 520-week guard once', async ({ context }, testInfo) => {
  const keyboardPage = await context.newPage()
  const keyboardRuntime = captureRuntimeSignals(keyboardPage)
  await seedLot(keyboardPage, 'week-520-guard')
  const keyboardButton = keyboardPage.getByTestId('lot-sim-to-next-event')
  await keyboardButton.focus()
  const started = await keyboardPage.evaluate(() => performance.now())
  await keyboardPage.keyboard.down('Enter')
  await expect(keyboardPage.getByTestId('lot-next-event-rail')).toBeVisible()
  await keyboardPage.keyboard.down('Enter')
  await keyboardPage.keyboard.down('Space')
  await keyboardPage.keyboard.up('Space')
  await keyboardPage.keyboard.up('Enter')
  const guardWallMs = await keyboardPage.evaluate((then) => performance.now() - then, started)
  measuredBrowserEvidence.browserWallMs.guard520 = guardWallMs
  testInfo.annotations.push({ type: 'guard-520-wall-ms', description: guardWallMs.toFixed(2) })
  testInfo.annotations.push({
    type: 'guard-520-direct-adapter-wall-ms',
    description: directAdapterWallMs.get('week-520-guard')!.toFixed(3),
  })
  const neutral = keyboardPage.getByTestId('lot-next-event-rail')
  await expect(neutral).toHaveAttribute('data-feedback-kind', 'next-event-neutral')
  await expect(neutral).toContainText('Week 520. The studio advanced to the next event.')
  await expect(neutral).not.toContainText('Period accounting')
  await expect(keyboardPage.getByTestId('lot-next-event-open-details')).toHaveCount(0)
  await expectDirectSuccessor(keyboardPage, 'week-520-guard')
  expectCleanRuntime(keyboardRuntime)
  await keyboardPage.close()

  const compatibilityPage = await context.newPage()
  const compatibilityRuntime = captureRuntimeSignals(compatibilityPage)
  await seedLot(compatibilityPage, 'week-520-guard')
  await compatibilityPage.getByTestId('lot-sim-to-next-event').evaluate((node) => {
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
    node.dispatchEvent(new MouseEvent('mousedown', mouse))
    node.dispatchEvent(new MouseEvent('click', mouse))
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
    node.dispatchEvent(new PointerEvent('pointerup', pointer))
    node.dispatchEvent(new TouchEvent('touchend', { ...touch, changedTouches: [] }))
    node.dispatchEvent(new MouseEvent('mouseup', mouse))
  })
  await expect(compatibilityPage.getByTestId('lot-next-event-rail')).toHaveAttribute(
    'data-feedback-kind',
    'next-event-neutral',
  )
  await expectDirectSuccessor(compatibilityPage, 'week-520-guard')
  expectCleanRuntime(compatibilityRuntime)
  await compatibilityPage.close()
})

test('renderer rejection preserves exact semantic action, while delayed readiness paints only final Stage 7 truth', async ({ context }) => {
  const rejectedPage = await context.newPage()
  const rejectedRuntime = captureRuntimeSignals(rejectedPage)
  await rejectedPage.route('**/src/lot/StudioLotView.ts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'export class StudioLotView { constructor() { throw new Error("governed renderer rejection") } }',
  }))
  await seedLot(rejectedPage, 'stage-7-production-decision', { expectCanvas: false })
  await expect(rejectedPage.getByTestId('lot-canvas-fallback')).toBeVisible()
  await rejectedPage.getByTestId('lot-sim-to-next-event').click()
  await expectExactRail(rejectedPage, 'stage-7-production-decision')
  await expect(rejectedPage.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)
  await expect(rejectedPage.getByTestId('hollywood-current-production')).toContainText(
    'House of Aviator',
  )
  await expect(rejectedPage.getByTestId('hollywood-production-command-assignShootingDirector'))
    .toBeVisible()
  await rejectedPage.getByTestId('lot-next-event-open-details').click()
  await expect(rejectedPage.getByTestId('production-command-assignShootingDirector-prod-0000'))
    .toBeFocused()
  await rejectedPage.getByTestId('back-to-studio-lot').click()
  await expect(rejectedPage.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(rejectedPage.getByTestId('lot-canvas-fallback')).toBeVisible()
  await rejectedPage.screenshot({ path: join(outDir, '08-renderer-rejection-exact-semantic.png') })
  expectCleanRuntime(rejectedRuntime)
  await rejectedPage.close()

  const delayedPage = await context.newPage()
  const delayedRuntime = captureRuntimeSignals(delayedPage)
  let rendererRequestHeld = false
  let releaseRenderer!: () => void
  const rendererGate = new Promise<void>((resolve) => { releaseRenderer = resolve })
  await delayedPage.route('**/src/lot/StudioLotView.ts*', async (route) => {
    rendererRequestHeld = true
    const response = await route.fetch()
    const source = instrumentRendererSource(await response.text())
    await rendererGate
    await route.fulfill({ response, body: source })
  })
  try {
    await seedLot(delayedPage, 'stage-7-production-decision', {
      expectCanvas: false,
      awaitRenderer: false,
    })
    await expect.poll(() => rendererRequestHeld).toBe(true)
    await expect(delayedPage.getByText('Preparing the lot…', { exact: true })).toBeVisible()
    await delayedPage.getByTestId('lot-sim-to-next-event').click()
    await expectExactRail(delayedPage, 'stage-7-production-decision')
    await expect(delayedPage.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)

    releaseRenderer()
    await expect(delayedPage.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
    await expect(delayedPage.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
    await expect.poll(async () => (await rendererEvidence(delayedPage)).debug?.selectedProductionId)
      .toBe('prod-0000')
    const evidence = await rendererEvidence(delayedPage)
    expect(evidence.constructions).toBe(1)
    expect(evidence.destroys).toBe(0)
    expect(evidence.pendingWeek).toBe(4)
    expect(evidence.snapshotWeeks).toEqual([4])
    expect(evidence.debug).toMatchObject({
      selectedPlaceId: 'stage-7',
      selectedProductionId: 'prod-0000',
    })
    await delayedPage.screenshot({ path: join(outDir, '09-delayed-renderer-final-truth-only.png') })
  } finally {
    releaseRenderer()
  }
  expectCleanRuntime(delayedRuntime)
  await delayedPage.close()
})

test('run, cash, and generic contract reactions retain authorized identity and exact deep focus', async ({ context }, testInfo) => {
  const runsPage = await context.newPage()
  const runsRuntime = captureRuntimeSignals(runsPage)
  await exposeRendererEvidence(runsPage)
  await seedLot(runsPage, 'simultaneous-completed-runs')
  await runsPage.getByTestId('lot-sim-to-next-event').click()
  const runsRail = await expectExactRail(runsPage, 'simultaneous-completed-runs')
  await expect(runsRail).toContainText('The Fading Cathedral')
  await expect(runsRail).toContainText('The Restless Undertaker')
  await expect(runsPage.getByTestId('lot-nav-theater')).toHaveAttribute('aria-current', 'true')
  expect((await rendererEvidence(runsPage)).debug).toMatchObject({
    selectedPersonId: null,
    selectedPlaceId: null,
    selectedProductionId: null,
  })
  await runsPage.getByTestId('lot-next-event-open-details').click()
  await expect(runsPage.getByTestId('dashboard-releases-heading')).toBeFocused()
  await runsPage.getByTestId('back-to-studio-lot').click()
  await expect(runsPage.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  await expect(runsPage.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(runsPage.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await runsPage.screenshot({ path: join(outDir, '10-theater-semantic-two-runs.png') })
  expectCleanRuntime(runsRuntime)
  await runsPage.close()

  const cashPage = await context.newPage()
  const cashRuntime = captureRuntimeSignals(cashPage)
  await exposeRendererEvidence(cashPage)
  await seedLot(cashPage, 'cash-negative-crossing')
  const cashWallMs = await measureActivation(
    cashPage,
    'cash-negative-crossing',
    () => cashPage.getByTestId('lot-sim-to-next-event').click(),
  )
  measuredBrowserEvidence.browserWallMs.longerGoverned = cashWallMs
  testInfo.annotations.push({
    type: 'longer-governed-117-week-wall-ms',
    description: cashWallMs.toFixed(2),
  })
  testInfo.annotations.push({
    type: 'longer-governed-117-week-direct-adapter-wall-ms',
    description: directAdapterWallMs.get('cash-negative-crossing')!.toFixed(3),
  })
  const cashRail = await expectExactRail(cashPage, 'cash-negative-crossing')
  await expect(cashRail).toContainText('Studio cash crossed below $0')
  await expect(cashPage.getByTestId('lot-nav-admin')).toHaveAttribute('aria-current', 'true')
  expect((await rendererEvidence(cashPage)).debug?.selectedPlaceId).toBe('publicity')
  await cashPage.getByTestId('lot-next-event-open-details').click()
  await expect(cashPage.getByTestId('dashboard-finances-heading')).toBeFocused()
  await cashPage.getByTestId('back-to-studio-lot').click()
  await expect(cashPage.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
  expectCleanRuntime(cashRuntime)
  await cashPage.close()

  for (const fixtureId of ['contract-expiry', 'renewal-window-opening'] as const) {
    const page = await context.newPage()
    const runtime = captureRuntimeSignals(page)
    await exposeRendererEvidence(page)
    await seedLot(page, fixtureId)
    await page.getByTestId('lot-sim-to-next-event').click()
    const rail = await expectExactRail(page, fixtureId)
    await expect(rail).toContainText('No person identity is inferred')
    expect((await rendererEvidence(page)).debug).toMatchObject({
      selectedPersonId: null,
      selectedPlaceId: null,
      selectedProductionId: null,
    })
    await page.getByTestId('lot-next-event-open-details').click()
    await expect(page.getByTestId('roster-heading')).toBeFocused()
    await expect(page.locator('[data-testid^="talent-"][aria-pressed="true"]')).toHaveCount(0)
    await page.getByTestId('roster-back').click()
    await expect(page.getByRole('heading', { name: 'NEXT EVENT' })).toBeFocused()
    expectCleanRuntime(runtime)
    await page.close()
  }
})

test('exact Stage 7 orientation has zero structural renderer delta against byte-identical neutral entry', async ({ context, page }) => {
  const exactRuntime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await exposeRendererEvidence(page)
  await seedLot(page, 'stage-7-production-decision', { identityProof: true })
  await page.getByTestId('lot-sim-to-next-event').click()
  await expectExactRail(page, 'stage-7-production-decision')
  const exactBytes = await activeSessionBytes(page)
  const exactTelemetry = await collectFreshStructuralTelemetry(page, 'exact next-event orientation')
  measuredBrowserEvidence.structural.exact = exactTelemetry

  const neutralPage = await context.newPage()
  const neutralRuntime = captureRuntimeSignals(neutralPage)
  await exposeRendererEvidence(neutralPage)
  await seedLot(neutralPage, 'stage-7-production-decision', {
    saveBytes: exactBytes,
    recoveredWeek: 4,
    identityProof: true,
  })
  await expect(neutralPage.getByTestId('lot-next-event-rail')).toHaveCount(0)
  await expect(neutralPage.getByTestId('hollywood-current-production')).toContainText(
    'House of Aviator',
  )
  expect(await activeSessionBytes(neutralPage)).toBe(exactBytes)
  const neutralTelemetry = await collectFreshStructuralTelemetry(neutralPage, 'neutral entry')
  measuredBrowserEvidence.structural.neutral = neutralTelemetry
  expect(exactTelemetry).toEqual(neutralTelemetry)
  await neutralPage.screenshot({ path: join(outDir, '11-neutral-structural-parity.png') })
  expectCleanRuntime(exactRuntime)
  expectCleanRuntime(neutralRuntime)
  await neutralPage.close()
})

async function expectReachableAction(
  label: string,
  target: Locator,
  options: { trial?: boolean } = {},
) {
  await target.scrollIntoViewIfNeeded()
  await expect(target).toBeVisible()
  const box = await target.boundingBox()
  expect(box, `${label} has a box`).not.toBeNull()
  expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44)
  expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44)
  if (options.trial !== false) await target.click({ trial: true })
}

/** Find a genuinely exposed pixel of the canvas instead of forcing input through the event rail. */
async function exposedCanvasPoint(canvas: Locator): Promise<{ x: number; y: number }> {
  return canvas.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    for (let y = rect.bottom - 8; y >= rect.top + 8; y -= 16) {
      for (let x = rect.left + 8; x <= rect.right - 8; x += 16) {
        if (document.elementFromPoint(x, y) === node) return { x, y }
      }
    }
    throw new Error('no exposed live-world canvas point remains around the event rail')
  })
}

test('reduced-motion/forced-colors event truth remains reachable through viewports, world zoom, CSS zoom, and page scale 200%', async ({ context, page }) => {
  const runtime = captureRuntimeSignals(page)
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await seedLot(page, 'simultaneous-completed-runs')
  await page.getByTestId('lot-sim-to-next-event').click()
  await expectExactRail(page, 'simultaneous-completed-runs')
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)

  for (const [label, width, height] of [
    ['1920x1080', 1920, 1080],
    ['1366x768', 1366, 768],
    ['1024x768', 1024, 768],
    ['960x540', 960, 540],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1'
      window.scrollTo(0, 0)
    })
    await expectReachableAction(`${label} Sim`, page.getByTestId('lot-sim-to-next-event'))
    await expectReachableAction(`${label} details`, page.getByTestId('lot-next-event-open-details'))
    await expectReachableAction(`${label} dismiss`, page.getByTestId('lot-next-event-dismiss'))
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      `${label} page-level horizontal overflow`,
    ).toBe(false)
  }

  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const worldPoint = await exposedCanvasPoint(canvas)
  await page.mouse.move(worldPoint.x, worldPoint.y)
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await expect(page.getByTestId('lot-next-event-rail')).toContainText('The Fading Cathedral')
  await page.screenshot({ path: join(outDir, '12-maximum-world-zoom-event.png') })

  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  await expectReachableAction('CSS zoom 200% details', page.getByTestId('lot-next-event-open-details'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  await page.screenshot({ path: join(outDir, '13-css-zoom-200-event.png') })

  await page.evaluate(() => {
    document.documentElement.style.zoom = '1'
    window.scrollTo(0, 0)
  })
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect.poll(async () => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(2)
  await page.getByTestId('lot-next-event-open-details').focus()
  await expect(page.getByTestId('lot-next-event-open-details')).toBeFocused()
  await page.screenshot({ path: join(outDir, '14-browser-page-scale-200-event.png') })
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  expectCleanRuntime(runtime)
})

test('480x270 CSS pixels at DSF2 keeps the world and complete event rail reachable', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 480, height: 270 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    forcedColors: 'active',
  })
  const page = await context.newPage()
  const runtime = captureRuntimeSignals(page)
  try {
    await seedLot(page, 'script-review')
    await page.getByTestId('lot-sim-to-next-event').click()
    await expectExactRail(page, 'script-review')
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      compact: matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({ innerWidth: 480, devicePixelRatio: 2, compact: true, scrollWidth: 480 })
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
    // This exact stop deliberately disables the newly rendered Sim control until the screenplay
    // decision is handled. Reachability and its connected reason remain the applicable proof.
    await expectReachableAction(
      '480/DSF2 Sim',
      page.getByTestId('lot-sim-to-next-event'),
      { trial: false },
    )
    await expect(page.getByTestId('lot-next-event-disabled-reason')).toContainText(
      'Development',
    )
    await expectReachableAction(
      '480/DSF2 Accept screenplay',
      page.getByTestId('lot-script-review-action-acceptScript-script-0000'),
    )
    await expectNoVisualOverlap(
      '480/DSF2 screenplay rail / production desk',
      page.getByTestId('lot-next-event-rail'),
      page.getByRole('region', { name: 'Current production' }),
    )
    await expectNoVisualOverlap(
      '480/DSF2 screenplay rail / studio inspector',
      page.getByTestId('lot-next-event-rail'),
      page.getByTestId('hollywood-inspector'),
    )
    await expectReachableAction('480/DSF2 details', page.getByTestId('lot-next-event-open-details'))
    await expectReachableAction('480/DSF2 dismiss', page.getByTestId('lot-next-event-dismiss'))
    await page.getByTestId('lot-next-event-accounting').locator('summary').click()
    await expect(page.getByTestId('lot-next-event-accounting')).toContainText('Other cash')
    await page.screenshot({ path: join(outDir, '15-480x270-dsf2-event.png') })
    expectCleanRuntime(runtime)
  } finally {
    await context.close()
  }
})
