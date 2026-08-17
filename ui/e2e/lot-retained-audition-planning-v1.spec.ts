import { expect, test, type ElementHandle, type Locator, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const outDir = join(repoRoot, 'out', 'world-first-lot-retained-audition-planning-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const FIXTURE_SEED = 'lot-retained-audition-planning-browser'

mkdirSync(outDir, { recursive: true })
test.describe.configure({ timeout: 120_000 })

function managedIdleState(seed: string): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state = newGame(seed)
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
  return founded.next
}

function readyCastingState(seed: string): GameState {
  let state = managedIdleState(seed)
  const commission = scriptProjectsBoard(state).commission
  const concept = commission.concepts[0]
  const writer = commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('fixture has no legal screenplay commission')
  }
  const commissioned = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: {
      opening: 'mysteryHook',
      midpoint: 'revelation',
      ending: 'bittersweet',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next
  const review = scriptProjectsBoard(state).sections.needsReview[0]
  const accept = review?.legalActions.find((action) => action.kind === 'acceptScript')
  if (review === undefined || accept === undefined) {
    throw new Error('fixture screenplay did not reach review')
  }
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  const board = castingSessionsBoard(accepted.next)
  if (
    accepted.next.market.tick !== 1 ||
    board.sections.readyToPlan.length !== 1 ||
    board.sections.auditioning.length !== 0 ||
    board.sections.needsReview.length !== 0 ||
    board.sections.history.length !== 0 ||
    board.sections.readyToPlan[0]?.legalActions.filter(
      (action) => action.kind === 'planAuditions',
    ).length !== 1
  ) throw new Error('fixture does not expose one unambiguous first-session project')
  return accepted.next
}

function replayCheckedSave(state: GameState): string {
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('browser fixture does not replay byte-identically')
  }
  return bytes
}

const MANAGED_IDLE_SAVE = replayCheckedSave(managedIdleState(FIXTURE_SEED))
const READY_CASTING_SAVE = replayCheckedSave(readyCastingState(`${FIXTURE_SEED}-ready`))

function instrumentRendererSource(source: string): string {
  const constructorMarker = 'constructor(opts) {\n    this.opts = opts;'
  const destroyMarker = 'destroy() {\n    this.destroyed = true;'
  if (!source.includes(constructorMarker) || !source.includes(destroyMarker)) {
    throw new Error('StudioLotView acceptance marker is absent')
  }
  return source
    .replace(
      constructorMarker,
      `constructor(opts) {
    const evidence = globalThis.__projectStudioAuditionAcceptance ??= {
      constructions: 0, destroys: 0, view: null
    };
    evidence.constructions += 1;
    evidence.view = this;
    this.opts = opts;`,
    )
    .replace(
      destroyMarker,
      `destroy() {
    if (globalThis.__projectStudioAuditionAcceptance) {
      globalThis.__projectStudioAuditionAcceptance.destroys += 1;
    }
    this.destroyed = true;`,
    )
}

function captureRuntime(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} · ${request.failure()?.errorText ?? ''}`)
  })
  return { pageErrors, consoleErrors, failedRequests }
}

function expectCleanRuntime(runtime: ReturnType<typeof captureRuntime>) {
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
  expect(runtime.failedRequests, runtime.failedRequests.join('\n')).toEqual([])
}

async function installRendererEvidence(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
}

async function seedLot(page: Page, save: string) {
  await installRendererEvidence(page)
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    localStorage.setItem(config.lotFlag, '1')
    localStorage.setItem(config.hollywoodFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    save,
  })
  await page.goto('/')
  await expectLotReady(page)
}

async function expectLotReady(page: Page) {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/\blot-hollywood\b/)
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

async function activeSessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is absent')
  return value
}

async function rendererEvidence(page: Page) {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioAuditionAcceptance?: {
        constructions: number
        destroys: number
      }
    }
    return {
      constructions: root.__projectStudioAuditionAcceptance?.constructions ?? 0,
      destroys: root.__projectStudioAuditionAcceptance?.destroys ?? 0,
    }
  })
}

async function captureLotDomIdentity(page: Page) {
  const lot = await page.getByTestId('studio-lot-screen').elementHandle()
  const mount = await page.getByTestId('studio-lot-canvas').elementHandle()
  const canvas = await page.getByTestId('studio-lot-canvas').locator('canvas').elementHandle()
  if (lot === null || mount === null || canvas === null) {
    throw new Error('one connected Lot, renderer mount, and canvas are required')
  }
  return { lot, mount, canvas }
}

async function expectCurrentNode(handle: ElementHandle<Node>, selector: string) {
  expect(await handle.evaluate(
    (node, currentSelector) =>
      node.isConnected && document.querySelector(currentSelector) === node,
    selector,
  )).toBe(true)
}

async function expectSameLotDomIdentity(
  identity: Awaited<ReturnType<typeof captureLotDomIdentity>>,
) {
  await expectCurrentNode(identity.lot, '[data-testid="studio-lot-screen"]')
  await expectCurrentNode(identity.mount, '[data-testid="studio-lot-canvas"]')
  await expectCurrentNode(identity.canvas, '[data-testid="studio-lot-canvas"] canvas')
}

async function expectDisconnectedLotDomIdentity(
  identity: Awaited<ReturnType<typeof captureLotDomIdentity>>,
) {
  for (const handle of [identity.lot, identity.mount, identity.canvas]) {
    expect(await handle.evaluate((node) => node.isConnected)).toBe(false)
  }
}

async function activateSemantic(page: Page, testId: string) {
  const control = page.getByTestId(testId)
  await control.focus()
  await expect(control).toBeFocused()
  await control.press('Enter')
}

async function prepareReadyThroughLiveLot(page: Page) {
  await seedLot(page, MANAGED_IDLE_SAVE)
  await activateSemantic(page, 'lot-nav-writers')
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await page.getByTestId('commission-submit').click()
  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  const projectId = await witness.getAttribute('data-project-id')
  const title = await witness.getByRole('heading', { level: 3 }).textContent()
  if (projectId === null || title === null) throw new Error('commission witness lacks identity')

  await activateSemantic(page, 'lot-advance-week')
  await activateSemantic(page, 'lot-nav-writers')
  const review = page.getByTestId('lot-script-review-panel')
  await expect(review).toBeVisible()
  await review.getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  // M-B re-pin: the Casting sign now leads with the action ("ready for auditions")
  // instead of advertising that auditions can be skipped. Same cue, same attention.
  await expect(page.getByTestId('lot-nav-casting-state')).toContainText('ready for auditions')
  return { projectId, title }
}

async function openRetainedPlanner(page: Page) {
  const opener = page.getByTestId('lot-nav-casting')
  await opener.focus()
  await expect(opener).toBeFocused()
  await opener.press('Enter')
  const workspace = page.getByTestId('lot-audition-workspace')
  await expect(workspace).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  await expectFocusedVisible(
    'Retained planner initial focus',
    page.getByTestId('lot-audition-workspace-close'),
  )
  return { opener, workspace }
}

async function selectLegalSlate(page: Page) {
  const actorIds = await page.getByTestId('casting-slate-lead')
    .locator('button:not([disabled])')
    .evaluateAll((nodes) => nodes.slice(0, 3).map((node) =>
      node.getAttribute('data-testid')!.replace(/^casting-candidate-lead-/, ''),
    ))
  expect(actorIds).toHaveLength(3)
  const slate = {
    lead: [actorIds[0]!, actorIds[1]!] as [string, string],
    antagonist: [actorIds[0]!, actorIds[1]!] as [string, string],
    support: [actorIds[0]!, actorIds[2]!] as [string, string],
  }
  const names = new Map<string, string>()
  for (const [role, ids] of Object.entries(slate) as Array<
    ['lead' | 'antagonist' | 'support', [string, string]]
  >) {
    for (const id of ids) {
      const candidate = page.getByTestId(`casting-candidate-${role}-${id}`)
      names.set(id, (await candidate.locator('.opt-title').textContent())!.trim())
      if (await page.evaluate(() => (visualViewport?.scale ?? 1) > 1)) {
        await candidate.scrollIntoViewIfNeeded()
        await candidate.focus()
        const point = await candidate.evaluate((node) => {
          const rect = node.getBoundingClientRect()
          const viewport = visualViewport
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          const hit = document.elementFromPoint(x, y)
          if (hit !== node && !node.contains(hit)) {
            throw new Error('candidate center is not pointer-reachable in the visual viewport')
          }
          return {
            x: x - (viewport?.offsetLeft ?? 0),
            y: y - (viewport?.offsetTop ?? 0),
          }
        })
        // Chromium's CDP pointer coordinates are visual-viewport-relative after an actual
        // page-scale transform, while locator geometry remains layout-viewport-relative.
        await page.mouse.click(point.x, point.y)
      } else await candidate.click()
      await expect(candidate).toHaveAttribute('aria-pressed', 'true')
    }
    await expect(page.getByTestId(`casting-selection-count-${role}`)).toHaveText('2 of 2 selected')
  }
  await expect(page.getByTestId('casting-unique-count')).toContainText('3 different actors selected')
  await expect(page.getByTestId('casting-start')).toBeEnabled()
  return { slate, names }
}

async function expectFocusedVisible(label: string, target: Locator) {
  await expect(target).toBeFocused()
  const geometry = await target.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    const viewport = window.visualViewport
    const left = viewport?.offsetLeft ?? 0
    const top = viewport?.offsetTop ?? 0
    const right = left + (viewport?.width ?? window.innerWidth)
    const bottom = top + (viewport?.height ?? window.innerHeight)
    return {
      width: rect.width,
      height: rect.height,
      intersects: rect.right > left && rect.left < right && rect.bottom > top && rect.top < bottom,
    }
  })
  expect(geometry.intersects, `${label} intersects the visual viewport`).toBe(true)
  expect(geometry.width, `${label} width`).toBeGreaterThanOrEqual(44)
  expect(geometry.height, `${label} height`).toBeGreaterThanOrEqual(44)
}

async function expectReachableAtVisualViewport(label: string, target: Locator) {
  await target.scrollIntoViewIfNeeded()
  await target.focus()
  await expectFocusedVisible(label, target)
}

async function expectTrapWrapReveal(page: Page) {
  const first = page.getByTestId('lot-audition-workspace-details')
  const last = page.getByTestId('casting-start')
  await first.scrollIntoViewIfNeeded()
  await first.focus()
  await expectFocusedVisible('First retained-workspace action before reverse wrap', first)

  await page.keyboard.press('Shift+Tab')
  await expectFocusedVisible('Last retained-workspace action after reverse wrap', last)

  await page.keyboard.press('Tab')
  await expectFocusedVisible('First retained-workspace action after forward wrap', first)
}

test('ordinary Lot planning cancels byte-neutrally, then deliberately opens full Casting details', async ({ page }) => {
  const runtime = captureRuntime(page)
  const prepared = await prepareReadyThroughLiveLot(page)
  const beforeBytes = await activeSessionBytes(page)
  const identity = await captureLotDomIdentity(page)
  const beforeRenderer = await rendererEvidence(page)
  expect(beforeRenderer).toEqual({ constructions: 1, destroys: 0 })
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow)

  const { opener } = await openRetainedPlanner(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveJSProperty('inert', true)
  await expectSameLotDomIdentity(identity)
  expect(await rendererEvidence(page)).toEqual(beforeRenderer)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await selectLegalSlate(page)
  await page.screenshot({ path: join(outDir, '01-desktop-planner-over-live-lot.png') })
  await expectTrapWrapReveal(page)

  await page.getByTestId('lot-audition-workspace-close').click()
  await expect(page.getByTestId('lot-audition-workspace')).toHaveCount(0)
  await expect(opener).toBeFocused()
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert', '')
  await expectSameLotDomIdentity(identity)
  expect(await rendererEvidence(page)).toEqual(beforeRenderer)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(bodyOverflow)

  await opener.press('Enter')
  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toContainText(prepared.title)
  await expect(page.getByTestId('casting-unique-count')).toContainText('0 different actors selected')
  await expectSameLotDomIdentity(identity)
  await page.getByTestId('lot-audition-workspace-details').click()

  await expect(page.getByTestId('casting-room')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toContainText(prepared.title)
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expectDisconnectedLotDomIdentity(identity)
  expect(await rendererEvidence(page)).toEqual({ constructions: 1, destroys: 1 })
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '02-explicit-full-casting-details.png') })
  expectCleanRuntime(runtime)
})

test('accepted slate saves before close, returns to the same Lot witness, then reaches six-row review', async ({ page }) => {
  const runtime = captureRuntime(page)
  const prepared = await prepareReadyThroughLiveLot(page)
  const beforeBytes = await activeSessionBytes(page)
  const beforeSave = JSON.parse(beforeBytes) as { state: Record<string, unknown> }
  const identity = await captureLotDomIdentity(page)
  const beforeRenderer = await rendererEvidence(page)
  const { workspace } = await openRetainedPlanner(page)
  await expect(workspace).toBeVisible()
  const { slate, names } = await selectLegalSlate(page)
  await page.screenshot({ path: join(outDir, '03-complete-six-read-slate.png') })

  await page.evaluate((sessionKey) => {
    const observed = window as typeof window & {
      __auditionAcceptance?: {
        recordingSeen: boolean
        witnessSave: string | null
      }
    }
    observed.__auditionAcceptance = { recordingSeen: false, witnessSave: null }
    const inspect = () => {
      const evidence = observed.__auditionAcceptance!
      if (document.querySelector('[data-testid="lot-audition-workspace-recording"]')) {
        evidence.recordingSeen = true
      }
      if (
        evidence.witnessSave === null &&
        document.querySelector('[data-testid="lot-audition-planning-witness"]')
      ) evidence.witnessSave = localStorage.getItem(sessionKey)
    }
    const observer = new MutationObserver(() => {
      inspect()
      if (observed.__auditionAcceptance?.witnessSave !== null) observer.disconnect()
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    inspect()
  }, ACTIVE_SESSION_KEY)

  await page.getByTestId('casting-start').click()
  const witness = page.getByTestId('lot-audition-planning-witness')
  await expect(witness).toBeVisible()
  await expect(page.getByTestId('lot-audition-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert', '')
  await expectSameLotDomIdentity(identity)
  expect(await rendererEvidence(page)).toEqual(beforeRenderer)
  await expect(witness).toHaveAttribute('data-project-id', prepared.projectId)
  await expect(witness).toHaveAttribute('data-session-id', 'casting-0000')
  await expect(witness.getByRole('heading', { level: 3, name: prepared.title })).toBeFocused()
  await expect(page.getByTestId('lot-nav-casting')).toHaveAttribute('aria-current', 'true')

  const afterBytes = await activeSessionBytes(page)
  const afterReplay = importSaveJson(afterBytes)
  expect(afterReplay.ok).toBe(true)
  if (!afterReplay.ok) throw new Error(afterReplay.error)
  expect(afterReplay.converted).toBe(false)
  expect(exportSaveJson(afterReplay.state)).toBe(afterBytes)
  const afterSave = JSON.parse(afterBytes) as { state: Record<string, unknown> }
  const { castingSessions: beforeCasting, ...beforeOther } = beforeSave.state
  const { castingSessions: afterCasting, ...afterOther } = afterSave.state
  expect(afterOther).toEqual(beforeOther)
  expect(beforeCasting).toEqual({ mode: 'managed', sessions: [] })
  expect(afterCasting).toEqual({
    mode: 'managed',
    sessions: [{
      id: 'casting-0000',
      projectId: prepared.projectId,
      status: 'auditioning',
      slate,
      startedWeek: 1,
      dueWeek: 2,
      reservation: {
        sessionId: 'casting-0000',
        facilityId: 'facility-development-casting',
        capability: 'development-casting',
        slot: 0,
      },
      results: null,
    }],
  })
  expect(await page.evaluate(() =>
    (window as typeof window & {
      __auditionAcceptance?: { recordingSeen: boolean; witnessSave: string | null }
    }).__auditionAcceptance,
  )).toEqual({ recordingSeen: true, witnessSave: afterBytes })

  const expectedReads = [
    ['lead', slate.lead[0]],
    ['lead', slate.lead[1]],
    ['antagonist', slate.antagonist[0]],
    ['antagonist', slate.antagonist[1]],
    ['support', slate.support[0]],
    ['support', slate.support[1]],
  ] as const
  const reads = witness.getByTestId('lot-audition-planning-reads').getByRole('listitem')
  await expect(reads).toHaveCount(6)
  for (let index = 0; index < expectedReads.length; index += 1) {
    const [role, talentId] = expectedReads[index]!
    await expect(reads.nth(index)).toHaveAttribute('data-role', role)
    await expect(reads.nth(index)).toHaveAttribute('data-talent-id', talentId)
    await expect(reads.nth(index)).toContainText(names.get(talentId)!)
  }
  await expect(witness.getByTestId('lot-audition-planning-facts')).toContainText('Week 1')
  await expect(witness.getByTestId('lot-audition-planning-facts')).toContainText('Week 2')
  await expect(witness.getByTestId('lot-audition-planning-facts')).toContainText(
    'Development & Casting',
  )
  await expect(witness.getByTestId('lot-audition-planning-boundary')).toContainText(
    'did not hire, sign, hold, pay, reserve, make busy, assign, move, or choose any Actor',
  )
  await page.screenshot({ path: join(outDir, '04-camera-tests-underway-same-lot.png') })

  const nextEvent = page.getByTestId('lot-sim-to-next-event')
  await nextEvent.focus()
  await nextEvent.press('Space')
  const rail = page.getByTestId('lot-next-event-rail')
  await expect(rail).toBeVisible()
  await expect(rail.getByTestId('lot-next-event-identity')).toContainText('Casting review')
  const review = rail.getByTestId('lot-casting-review-panel')
  await expect(review).toBeVisible()
  await expect(review).toHaveAttribute('data-session-id', 'casting-0000')
  await expect(review.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
  await expectSameLotDomIdentity(identity)
  expect(await rendererEvidence(page)).toEqual(beforeRenderer)
  expect((JSON.parse(await activeSessionBytes(page)) as { state: { market: { tick: number } } })
    .state.market.tick).toBe(2)
  await page.screenshot({ path: join(outDir, '05-next-event-six-row-casting-review.png') })
  expectCleanRuntime(runtime)
})

test('planner remains operable at 960×540, actual page scale 200%, forced colors, and reduced motion', async ({ page, context }) => {
  const runtime = captureRuntime(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await seedLot(page, READY_CASTING_SAVE)
  const identity = await captureLotDomIdentity(page)
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect.poll(async () => page.evaluate(() => visualViewport?.scale ?? 1)).toBe(2)
  await openRetainedPlanner(page)
  const { slate } = await selectLegalSlate(page)
  expect(new Set(Object.values(slate).flat()).size).toBe(3)
  await expectSameLotDomIdentity(identity)
  expect(await page.evaluate(() => ({
    forced: matchMedia('(forced-colors: active)').matches,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    layoutWidth: innerWidth,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  }))).toEqual({ forced: true, reduced: true, layoutWidth: 960, horizontalOverflow: false })
  const workspaceStyle = await page.getByTestId('lot-audition-workspace').evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      borderStyle: style.borderTopStyle,
      borderWidth: style.borderTopWidth,
      animationDuration: style.animationDuration,
      transitionDuration: style.transitionDuration,
    }
  })
  expect(workspaceStyle.borderStyle).toBe('solid')
  expect(workspaceStyle.borderWidth).not.toBe('0px')
  expect(workspaceStyle.animationDuration).toBe('0s')
  expect(workspaceStyle.transitionDuration).toBe('0s')

  expect(await page.evaluate(() => ({
    layoutWidth: innerWidth,
    visualWidth: visualViewport?.width ?? innerWidth,
    visualHeight: visualViewport?.height ?? innerHeight,
  }))).toEqual({ layoutWidth: 960, visualWidth: 480, visualHeight: 270 })
  await expectReachableAtVisualViewport(
    'Lead candidate',
    page.getByTestId(`casting-candidate-lead-${slate.lead[0]}`),
  )
  await expectReachableAtVisualViewport(
    'Start one-week auditions',
    page.getByTestId('casting-start'),
  )
  await expectReachableAtVisualViewport(
    'Return to live Lot',
    page.getByTestId('lot-audition-workspace-close'),
  )
  await expectTrapWrapReveal(page)
  await expectSameLotDomIdentity(identity)
  await page.screenshot({ path: join(outDir, '06-960x540-page-scale-200-forced-reduced.png') })
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  expectCleanRuntime(runtime)
})

test.describe('retained planner at 480×270 CSS pixels / DSF2', () => {
  test.use({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 2 })

  test('keeps all six choices, submit, cancel, and live world reachable', async ({ page }) => {
    const runtime = captureRuntime(page)
    await seedLot(page, READY_CASTING_SAVE)
    const identity = await captureLotDomIdentity(page)
    await openRetainedPlanner(page)
    const { slate } = await selectLegalSlate(page)
    expect(await page.evaluate(() => ({
      innerWidth,
      devicePixelRatio,
      compact: matchMedia('(max-width: 760px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({ innerWidth: 480, devicePixelRatio: 2, compact: true, scrollWidth: 480 })
    for (const [label, target] of [
      ['Lead candidate', page.getByTestId(`casting-candidate-lead-${slate.lead[0]}`)],
      ['Support candidate', page.getByTestId(`casting-candidate-support-${slate.support[1]}`)],
      ['Start one-week auditions', page.getByTestId('casting-start')],
      ['Open full Casting Room details', page.getByTestId('lot-audition-workspace-details')],
      ['Return to live Lot', page.getByTestId('lot-audition-workspace-close')],
    ] as const) {
      await target.scrollIntoViewIfNeeded()
      await expect(target).toBeVisible()
      const box = await target.boundingBox()
      expect(box, label).not.toBeNull()
      expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44)
      expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44)
      await target.click({ trial: true })
    }
    await expectTrapWrapReveal(page)
    await expectSameLotDomIdentity(identity)
    await page.screenshot({ path: join(outDir, '07-480x270-dsf2-complete-planner.png') })
    expectCleanRuntime(runtime)
  })
})
