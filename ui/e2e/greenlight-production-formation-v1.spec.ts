import { expect, test, type Locator, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  advanceWeek,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  signContractAction,
  startDevelopmentCastingAnnexAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixture = join(
  here,
  'world-first-operational-annex-work-presence-v1',
  'week-13-operational-annex-available.save.json',
)
const outDir = join(repoRoot, 'out', 'world-first-greenlight-production-formation-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'
const FIXTURE_SHA256 = '4026c51603afe35605a9d5a71391764cd6dfea3972ef3a8d20ef3b3987dc4652'
const EXPECTED_DECODED_BYTES = 11_096_896
const RICH_MANAGED_SEED = 'world-first-production-formation-rich-browser'
const PERFORMANCE_EVIDENCE = process.env.PROJECT_STUDIO_PERFORMANCE_EVIDENCE === '1'

/**
 * Build the two-picture browser authority through the same public actions as the governed Annex
 * generator. No save field is patched: 13 real Engine advances complete the Annex, and native V11
 * export/import replay must remain byte-identical before Chromium ever sees the state.
 */
function richManagedAvailableSave(): string {
  const counts: Readonly<Record<CreativeRole, number>> = {
    actor: 6,
    director: 2,
    writer: 3,
    craft: 2,
  }
  let state: GameState = newGame(RICH_MANAGED_SEED)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, counts[role])
    if (selected.length !== counts[role]) {
      throw new Error(`rich formation recipe lacks ${role} applicants`)
    }
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(`rich formation signing rejected: ${signed.error}`)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(`rich managed founding rejected: ${founded.error}`)
  state = founded.next
  const started = startDevelopmentCastingAnnexAction(state)
  if (!started.ok) throw new Error(`rich Annex start rejected: ${started.error}`)
  state = started.next
  for (let week = 0; week < 13; week += 1) state = advanceWeek(state).next
  if (
    state.market.tick !== 13 ||
    state.scriptDevelopment.mode !== 'managed' ||
    state.castingSessions.mode !== 'managed' ||
    state.operations.mode !== 'managed' ||
    state.studio.activeProductions.length !== 0 ||
    state.construction.projects[0]?.status !== 'completed'
  ) {
    throw new Error('rich formation recipe did not produce the exact empty managed Week-13 studio')
  }
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('rich formation SaveFileV11 replay changed bytes')
  }
  return bytes
}

const RICH_MANAGED_AVAILABLE_SAVE = richManagedAvailableSave()

type FormedPackage = {
  title: string
  directorId: string
  leadId: string
  directorName: string
  leadName: string
}

mkdirSync(outDir, { recursive: true })

test.beforeAll(() => {
  expect(createHash('sha256').update(readFileSync(fixture)).digest('hex')).toBe(FIXTURE_SHA256)
})

test.describe.configure({ timeout: 120_000 })

function captureRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function seedManagedLot(
  page: Page,
  options: {
    expectCanvas?: boolean
    awaitRenderer?: boolean
    identityProof?: boolean
    saveBytes?: string
    recoveredWeek?: number
  } = {},
) {
  const save = options.saveBytes ?? readFileSync(fixture, 'utf8')
  await page.addInitScript(
    ([sessionKey, corruptKey, saveJson, lotFlag, hollywoodFlag, proofFlag, proof]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      localStorage.removeItem(corruptKey as string)
      // Absence exercises the current ordinary-player world-first defaults.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
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
    ] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText(
    `Week ${options.recoveredWeek ?? 13}`,
  )
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

async function chooseFirstEligible(page: Page, pickerTestId: string): Promise<string> {
  const button = page
    .getByTestId(pickerTestId)
    .locator('button[aria-pressed]:not([disabled])')
    .first()
  await button.scrollIntoViewIfNeeded()
  await expect(button).toBeVisible()
  const testId = await button.getAttribute('data-testid')
  expect(testId).toMatch(/^talent-/)
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  return testId!.replace(/^talent-/, '')
}

async function activateSemanticControl(page: Page, testId: string) {
  const control = page.getByTestId(testId)
  await control.focus()
  await expect(control).toBeFocused()
  await control.press('Enter')
}

/** Commission and form one picture from the currently mounted empty-or-capable Lot. */
async function formPictureFromCurrentLot(
  page: Page,
  activateGreenlight: (button: Locator) => Promise<void> = (button) => button.click(),
): Promise<FormedPackage> {
  const startingWeek = await page.evaluate((sessionKey) => {
    const parsed = JSON.parse(localStorage.getItem(sessionKey as string) ?? '{}') as {
      state?: { market?: { tick?: number } }
    }
    return parsed.state?.market?.tick
  }, ACTIVE_SESSION_KEY)
  expect(startingWeek).toEqual(expect.any(Number))

  // LIVE LOT -> retained Development commission surface. The exact screenplay is formed by
  // the canonical shared form while the Lot stays mounted behind it.
  await activateSemanticControl(page, 'lot-nav-writers')
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expect(page.getByTestId('writers-room')).toHaveCount(0)
  await expect(page.getByTestId('commission-submit')).toBeEnabled()
  await page.getByTestId('commission-submit').click()
  const commissionWitness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(commissionWitness).toBeVisible()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  const projectId = await commissionWitness.getAttribute('data-project-id')
  expect(projectId).toMatch(/^script-/)

  // Let one authoritative studio week complete the draft in that same world root.
  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('studio-lot-screen')).toContainText(
    `Week ${(startingWeek as number) + 1}`,
  )

  // The completed draft is now an exact world-first Development decision. Accept it in the
  // living Lot, then use Writers' Room only for the deeper Package decision.
  await activateSemanticControl(page, 'lot-nav-writers')
  const worldReview = page.getByTestId('lot-script-review-panel')
  await expect(worldReview).toBeVisible()
  await expect(worldReview.getByTestId('lot-script-review-project-id')).toContainText(projectId!)
  const worldAccept = worldReview.getByRole('button', { name: /^Accept / })
  await expect(worldAccept).toBeVisible()
  const title = ((await page.getByTestId('lot-script-review-heading').textContent()) ?? '').trim()
  expect(title).not.toBe('')
  await worldAccept.click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  await activateSemanticControl(page, 'lot-nav-writers')
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await page.getByTestId(`script-action-openPackage-${projectId!}`).click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)

  const directorId = await chooseFirstEligible(page, 'picker-director')
  const leadId = await chooseFirstEligible(page, 'picker-lead')
  await chooseFirstEligible(page, 'picker-antagonist')
  await chooseFirstEligible(page, 'picker-support')
  await chooseFirstEligible(page, 'picker-craft')
  expect(leadId).not.toBe(directorId)

  await activateSemanticControl(page, 'assembly-next')
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await activateSemanticControl(page, 'assembly-next')
  const greenlight = page.getByTestId('greenlight')
  await expect(greenlight).toBeEnabled()
  await activateGreenlight(greenlight)

  // The accepted Lot return must identify the exact package participants selected above.
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  const directorButton = page.getByTestId(`hollywood-select-person-${directorId}`)
  const leadButton = page.getByTestId(`hollywood-select-person-${leadId}`)
  await expect(directorButton).toHaveAttribute('aria-pressed', 'true')
  await expect(leadButton).toHaveAttribute('aria-pressed', 'false')
  const directorName = ((await directorButton.locator('span').textContent()) ?? '').trim()
  const leadName = ((await leadButton.locator('span').textContent()) ?? '').trim()
  expect(directorName).not.toBe('')
  expect(leadName).not.toBe('')
  return { title, directorId, leadId, directorName, leadName }
}

/**
 * Drive the full ordinary managed-player path. The fixture only restores an empty operating
 * studio; commissioning, time, screenplay acceptance, package staffing, and greenlight all use
 * visible player controls against the real App/Engine boundary.
 */
async function greenlightFromLot(
  page: Page,
  options: {
    expectCanvas?: boolean
    awaitRenderer?: boolean
    identityProof?: boolean
    saveBytes?: string
    recoveredWeek?: number
  } = {},
  activateGreenlight?: (button: Locator) => Promise<void>,
): Promise<FormedPackage> {
  await seedManagedLot(page, options)
  return formPictureFromCurrentLot(page, activateGreenlight)
}

async function exactSavedProductionId(
  page: Page,
  formed: Pick<FormedPackage, 'directorId' | 'leadId'>,
): Promise<string> {
  const matches = await page.evaluate(([sessionKey, directorId, leadId]) => {
    const parsed = JSON.parse(localStorage.getItem(sessionKey as string) ?? '{}') as {
      state?: {
        studio?: {
          activeProductions?: Array<{
            id?: string
            directorId?: string
            cast?: { lead?: string }
          }>
        }
      }
    }
    return (parsed.state?.studio?.activeProductions ?? [])
      .filter((production) =>
        production.directorId === directorId && production.cast?.lead === leadId,
      )
      .map((production) => production.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  }, [ACTIVE_SESSION_KEY, formed.directorId, formed.leadId] as const)
  expect(matches).toHaveLength(1)
  return matches[0]!
}

type StructuralTelemetry = {
  displayObjects: number
  dynamicActors: number
  decodedBytes: number
  drawCalls: number
}

/**
 * Test-only exposure of the real view's existing evidence reset. This changes no renderer method,
 * snapshot, or game fact; it only makes the already-public reset callable from Playwright so each
 * side of the parity check owns the governed 120-frame warm-up plus 240 measured frames.
 */
async function exposeRendererEvidenceReset(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const marker = 'constructor(opts) {\n    this.opts = opts;'
    if (!source.includes(marker)) {
      throw new Error('StudioLotView evidence bridge marker is absent')
    }
    await route.fulfill({
      response,
      body: source.replace(
        marker,
        'constructor(opts) {\n    globalThis.__projectStudioFormationView = this;\n    this.opts = opts;',
      ),
    })
  })
}

async function collectFreshStructuralTelemetry(
  page: Page,
  label: string,
): Promise<StructuralTelemetry> {
  const performance = page.getByTestId('hollywood-performance')
  await expect(performance).toBeVisible()
  await page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudioFormationView?: { resetHollywoodPerformance: () => void }
    }).__projectStudioFormationView
    if (!view) throw new Error('real StudioLotView evidence instance is unavailable')
    view.resetHollywoodPerformance()
  })
  await expect.poll(async () => Number(
    await performance.getAttribute('data-frame-samples'),
  ), {
    message: `${label} must visibly enter a fresh post-reset warm-up/sample window`,
    timeout: 5_000,
  }).toBeLessThan(240)
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 20_000 })

  const result = {
    displayObjects: Number(await performance.getAttribute('data-display-objects')),
    dynamicActors: Number(await performance.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(await performance.getAttribute('data-decoded-bytes')),
    drawCalls: Number(await performance.getAttribute('data-draw-calls')),
  }
  expect(result.displayObjects).toBeGreaterThan(0)
  expect(result.dynamicActors).toBeGreaterThan(0)
  expect(result.decodedBytes).toBe(EXPECTED_DECODED_BYTES)
  expect(result.drawCalls).toBe(1)
  return result
}

function productionPanel(page: Page): Locator {
  return page.getByTestId('hollywood-current-production')
}

async function expectFormationFacts(page: Page, formed: FormedPackage) {
  const panel = productionPanel(page)
  await expect(panel).toContainText('PICTURE FORMED')
  await expect(panel).toContainText(formed.title)
  await expect(panel.getByText('Development', { exact: true })).toBeVisible()
  await expect(panel.getByText('Development & Casting', { exact: true })).toBeVisible()
  await expect(panel.getByText('On schedule', { exact: true })).toBeVisible()
  await expect(panel.getByText('8', { exact: true })).toBeVisible()
  await expect(panel).toContainText(formed.directorName)
  await expect(panel).toContainText(formed.leadName)

  const inspector = page.getByTestId('hollywood-person-inspector-status')
  await expect(inspector).toBeFocused()
  await expect(inspector.getByRole('heading', { name: formed.directorName })).toBeVisible()
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(formed.title)
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(
    '8 production weeks remaining',
  )
}

test('Lot-origin managed greenlight forms the exact picture, then repaints the governed early phases', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  const formed = await greenlightFromLot(page)
  await expectFormationFacts(page, formed)

  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await expect(canvas).toHaveCount(1)
  const mountedCanvas = await canvas.elementHandle()
  expect(mountedCanvas).not.toBeNull()
  const formedBytes = await activeSessionBytes(page)
  const stableUrl = page.url()
  await page.screenshot({ path: join(outDir, '01-picture-formed-development-8.png') })

  // The canonical deep profile is an overlay on this exact live world, not a route away.
  // It owns focus/input while open, then restores the exact world opener byte-neutrally.
  const profileOpener = page.getByTestId(
    `hollywood-open-talent-profile-${formed.directorId}`,
  )
  await profileOpener.focus()
  await profileOpener.click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText(formed.directorName)
  await expect(page.getByTestId('studio-lot-screen')).toHaveAttribute('inert', '')
  expect(await canvas.evaluate((node, prior) => node === prior, mountedCanvas!)).toBe(true)
  expect(await activeSessionBytes(page)).toBe(formedBytes)
  expect(page.url()).toBe(stableUrl)
  await page.screenshot({ path: join(outDir, '01a-director-profile-over-formed-picture.png') })
  await page.getByTestId('talent-profile-close').click()
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(profileOpener).toBeFocused()
  await expect(page.getByTestId('hollywood-production-formation-witness')).toBeVisible()
  await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`))
    .toHaveAttribute('aria-pressed', 'true')
  expect(await canvas.evaluate((node, prior) => node === prior, mountedCanvas!)).toBe(true)
  expect(await activeSessionBytes(page)).toBe(formedBytes)

  // First accepted Lot week is the governed greenlight-tick skip: no fake progress.
  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('studio-lot-screen')).toContainText('Week 15')
  await expect(productionPanel(page).getByText('Development', { exact: true })).toBeVisible()
  await expect(productionPanel(page).getByText('8', { exact: true })).toBeVisible()
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveCount(0)
  await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`))
    .toHaveAttribute('aria-pressed', 'true')
  expect(await canvas.evaluate((node, prior) => node === prior, mountedCanvas!)).toBe(true)
  await page.screenshot({ path: join(outDir, '02-greenlight-tick-skip-development-8.png') })

  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('studio-lot-screen')).toContainText('Week 16')
  await expect(productionPanel(page).getByText('Pre-production', { exact: true })).toBeVisible()
  await expect(productionPanel(page).getByText('7', { exact: true })).toBeVisible()
  await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`))
    .toHaveAttribute('aria-pressed', 'true')
  expect(await canvas.evaluate((node, prior) => node === prior, mountedCanvas!)).toBe(true)
  await page.screenshot({ path: join(outDir, '03-pre-production-7.png') })

  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('studio-lot-screen')).toContainText('Week 17')
  await expect(productionPanel(page).getByText('Rehearsal', { exact: true })).toBeVisible()
  await expect(productionPanel(page).getByText('Soundstage 7', { exact: true })).toBeVisible()
  await expect(productionPanel(page).getByText('6', { exact: true })).toBeVisible()
  const stage7Companion = page.getByTestId('lot-nav-stage-a')
  await expect(stage7Companion).toHaveAttribute('data-attention', 'active')
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText(formed.title)
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText('Rehearsal')
  expect(await canvas.evaluate((node, prior) => node === prior, mountedCanvas!)).toBe(true)
  await page.screenshot({ path: join(outDir, '04-rehearsal-6-soundstage-7.png') })

  // At Shooting the Director owns the call. Selecting the exact Lead keeps the picture exact
  // while removing that Director-only affordance from the Lead inspector.
  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('hollywood-production-command-assignShootingDirector'))
    .toBeVisible()
  const lead = page.getByTestId(`hollywood-select-person-${formed.leadId}`)
  await lead.click()
  await expect(lead).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('hollywood-person-inspector-status')).toContainText(formed.leadName)
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText('Lead actor')
  await expect(page.getByTestId('hollywood-production-command-assignShootingDirector'))
    .toHaveCount(0)
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('renderer rejection retains the exact reduced-motion semantic formation journey', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'export class StudioLotView { constructor() { throw new Error("governed renderer rejection") } }',
  }))

  const formed = await greenlightFromLot(page, { expectCanvas: false })
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)
  await expectFormationFacts(page, formed)

  // Native semantic controls retain time, exact identity, and current Engine truth.
  await page.getByTestId('lot-advance-week').focus()
  await page.getByTestId('lot-advance-week').press('Enter')
  await expect(productionPanel(page).getByText('Development', { exact: true })).toBeVisible()
  await expect(productionPanel(page).getByText('8', { exact: true })).toBeVisible()
  await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`))
    .toHaveAttribute('aria-pressed', 'true')
  const lead = page.getByTestId(`hollywood-select-person-${formed.leadId}`)
  await lead.focus()
  await lead.press('Enter')
  await expect(lead).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('hollywood-person-inspector-status')).toContainText(formed.leadName)
  await page.screenshot({ path: join(outDir, '05-renderer-rejection-semantic-formation.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('authoritative advance wins while the renderer module is delayed, then paints exact latest formation truth', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  let releaseRenderer!: () => void
  let rendererRequestHeld = false
  const rendererGate = new Promise<void>((resolve) => { releaseRenderer = resolve })
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    rendererRequestHeld = true
    const response = await route.fetch()
    await rendererGate
    await route.fulfill({ response })
  })

  try {
    const formed = await greenlightFromLot(page, {
      expectCanvas: false,
      awaitRenderer: false,
    })
    await expect.poll(() => rendererRequestHeld).toBe(true)
    await expect(page.getByText('Preparing the lot…', { exact: true })).toBeVisible()
    await expectFormationFacts(page, formed)

    // Advance accepted App/Engine truth before the lazy renderer constructor can exist.
    await page.getByTestId('lot-advance-week').click()
    await expect(page.getByTestId('studio-lot-screen')).toContainText('Week 15')
    await expect(productionPanel(page).getByText('Development', { exact: true })).toBeVisible()
    await expect(productionPanel(page).getByText('8', { exact: true })).toBeVisible()
    await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveCount(0)

    releaseRenderer()
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
    await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
    await expect(productionPanel(page)).toContainText(formed.title)
    await expect(productionPanel(page).getByText('On schedule', { exact: true })).toBeVisible()
    await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`))
      .toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('hollywood-person-inspector-status')).toContainText(
      formed.directorName,
    )
    await page.screenshot({ path: join(outDir, '08-delayed-renderer-latest-week-15.png') })
  } finally {
    releaseRenderer()
  }
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('native keys, held/cross-key tails, touch, and synchronous compatibility clicks each greenlight exactly once', async ({ context }) => {
  for (const variant of [
    'Enter',
    'Space',
    'held Enter repeat and Space cross-key tail',
    'touch and synchronous compatibility tails',
  ] as const) {
    const page = await context.newPage()
    const runtimeErrors = captureRuntimeErrors(page)
    const formed = await greenlightFromLot(page, {}, async (greenlight) => {
      await greenlight.focus()
      await expect(greenlight).toBeFocused()
      if (variant === 'Enter' || variant === 'Space') {
        await page.keyboard.press(variant)
        return
      }
      if (variant === 'held Enter repeat and Space cross-key tail') {
        await page.keyboard.down('Enter')
        await page.keyboard.down('Enter')
        await page.keyboard.up('Enter')
        await page.keyboard.press('Space')
        return
      }

      // Deliver touch, pointer, mouse, repeat/cross-key, and duplicate compatibility clicks in
      // one browser task. React cannot unmount the accepted button until this dispatch stack
      // ends, so the synchronous Assembly latch—not DOM disappearance—must reject every tail.
      await greenlight.evaluate((node) => {
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
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        }))
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
        node.dispatchEvent(new MouseEvent('mouseup', mouse))
      })
    })

    await expectFormationFacts(page, formed)
    const productionIds = await page.evaluate((sessionKey) => {
      const parsed = JSON.parse(localStorage.getItem(sessionKey as string) ?? '{}') as {
        state?: { studio?: { activeProductions?: Array<{ id?: string }> } }
      }
      return (parsed.state?.studio?.activeProductions ?? [])
        .map((production) => production.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    }, ACTIVE_SESSION_KEY)
    expect(productionIds, `${variant} must create one and only one picture`).toHaveLength(1)
    expect(await exactSavedProductionId(page, formed)).toBe(productionIds[0])
    await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveCount(1)
    await expect(page.getByTestId('lot-production-formation-announcement')).toContainText(
      `Picture formed: ${formed.title}`,
    )
    expect(runtimeErrors, `${variant}: ${runtimeErrors.join('\n')}`).toEqual([])
    await page.close()
  }
})

test('a second real picture forms by exact receipt, not array order, and reaches truthful Stage 12 fallback', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  // The in-spec authority above was built solely through public Engine actions and retains the
  // full 2-Director / 6-Actor roster plus an operational Annex. No save field or package is
  // synthesized in this spec.
  await seedManagedLot(page, {
    saveBytes: RICH_MANAGED_AVAILABLE_SAVE,
    recoveredWeek: 13,
    identityProof: true,
  })
  const first = await formPictureFromCurrentLot(page)
  await expectFormationFacts(page, first)
  const firstProductionId = await exactSavedProductionId(page, first)

  // The operational Annex fixture owns three Development/Casting slots, so a second
  // ordinary commission can become a concurrent picture through the real UI and Engine.
  const second = await formPictureFromCurrentLot(page)
  await expectFormationFacts(page, second)
  const secondProductionId = await exactSavedProductionId(page, second)
  expect(secondProductionId).not.toBe(firstProductionId)
  const twoPictureSaveBeforeInspection = await activeSessionBytes(page)

  const firstChoice = page.getByTestId(`hollywood-select-production-${firstProductionId}`)
  const secondChoice = page.getByTestId(`hollywood-select-production-${secondProductionId}`)
  await expect(page.locator('[data-testid^="hollywood-select-production-"]')).toHaveCount(2)
  await expect(firstChoice).toContainText(first.title)
  await expect(firstChoice).toHaveAttribute('aria-pressed', 'false')
  await expect(secondChoice).toContainText(second.title)
  await expect(secondChoice).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId(`hollywood-select-person-${second.directorId}`))
    .toHaveAttribute('aria-pressed', 'true')
  await expect(productionPanel(page)).toContainText(second.directorName)
  await expect(productionPanel(page)).toContainText(second.leadName)

  const companyButtons = page.locator('.hollywood-people [data-production-id]')
  await expect(companyButtons).toHaveCount(12)
  for (const productionId of [firstProductionId, secondProductionId]) {
    const company = page.locator(
      `.hollywood-people [data-production-id="${productionId}"]`,
    )
    await expect(company).toHaveCount(6)
    expect(await company.evaluateAll((buttons) => buttons.map(
      (button) => button.getAttribute('data-production-role'),
    ))).toEqual(['writer', 'director', 'lead', 'antagonist', 'support', 'craft'])
  }
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true)
  const lastCompanyMember = companyButtons.last()
  await lastCompanyMember.focus()
  await expect(lastCompanyMember).toBeFocused()
  expect(await lastCompanyMember.evaluate((button) => {
    const buttonRect = button.getBoundingClientRect()
    const railRect = button.closest('.hollywood-people')!.getBoundingClientRect()
    return buttonRect.left >= railRect.left - 1 && buttonRect.right <= railRect.right + 1
  })).toBe(true)
  expect(await lastCompanyMember.evaluate((button) => {
    const rect = button.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return hit === button || (hit !== null && button.contains(hit))
  }), 'last company member center remains physically selectable above evidence UI').toBe(true)
  await lastCompanyMember.click()
  await expect(lastCompanyMember).toHaveAttribute('aria-pressed', 'true')

  await firstChoice.click()
  await expect(firstChoice).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator(
    `.hollywood-people [data-production-id="${firstProductionId}"].company-active`,
  )).toHaveCount(6)
  await expect(page.locator(
    `.hollywood-people [data-production-id="${secondProductionId}"].company-active`,
  )).toHaveCount(0)
  const firstWriter = page.locator(
    `.hollywood-people [data-production-id="${firstProductionId}"][data-production-role="writer"]`,
  )
  await firstWriter.click()
  await expect(firstWriter).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText('Writer')
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(first.title)

  await secondChoice.click()
  await expect(secondChoice).toHaveAttribute('aria-pressed', 'true')

  const performance = page.getByTestId('hollywood-performance')
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 30_000 })
  await expect(performance).toHaveAttribute('data-display-objects', '54')
  await expect(performance).toHaveAttribute('data-dynamic-actors', '25')
  await expect(performance).toHaveAttribute('data-decoded-bytes', String(EXPECTED_DECODED_BYTES))
  await expect(performance).toHaveAttribute('data-draw-calls', '1')
  expect(await activeSessionBytes(page)).toBe(twoPictureSaveBeforeInspection)
  await lastCompanyMember.focus()
  await page.screenshot({ path: join(outDir, '09-second-exact-picture-not-array-first.png') })

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 960, height: 540 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(companyButtons).toHaveCount(12)
    await companyButtons.first().focus()
    await lastCompanyMember.focus()
    await expect(lastCompanyMember).toBeFocused()
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )).toBe(true)
    expect(await lastCompanyMember.evaluate((button) => {
      const buttonRect = button.getBoundingClientRect()
      const railRect = button.closest('.hollywood-people')!.getBoundingClientRect()
      return buttonRect.left >= railRect.left - 1 && buttonRect.right <= railRect.right + 1
    }), `${String(viewport.width)}×${String(viewport.height)} focused member reachability`).toBe(true)
    expect(await page.evaluate(() => {
      const hud = document.querySelector<HTMLElement>('.hollywood-perf')
      if (hud === null || getComputedStyle(hud).display === 'none') return []
      const hudRect = hud.getBoundingClientRect()
      return [...document.querySelectorAll<HTMLElement>('.hollywood-productions button')].map(
        (button) => {
          const buttonRect = button.getBoundingClientRect()
          const width = Math.max(
            0,
            Math.min(hudRect.right, buttonRect.right) - Math.max(hudRect.left, buttonRect.left),
          )
          const height = Math.max(
            0,
            Math.min(hudRect.bottom, buttonRect.bottom) - Math.max(hudRect.top, buttonRect.top),
          )
          return width * height
        },
      )
    }), `${String(viewport.width)}×${String(viewport.height)} HUD/production overlap`).toEqual([0, 0])
  }
  await page.setViewportSize({ width: 1280, height: 720 })

  // At Week 18 the staggered second picture truthfully occupies Stage 12 while the
  // first picture owns Stage 7. Selecting the exact saved-state ID must not repaint it
  // as Stage 7 merely because that is the physically authored district stage.
  for (const expectedWeek of [16, 17, 18]) {
    await page.getByTestId('lot-advance-week').click()
    await expect(page.getByTestId('studio-lot-screen')).toContainText(`Week ${expectedWeek}`)
  }
  await secondChoice.click()
  await expect(secondChoice).toHaveAttribute('aria-pressed', 'true')
  await expect(firstChoice).toHaveAttribute('aria-pressed', 'false')
  await expect(productionPanel(page)).toContainText(second.title)
  await expect(productionPanel(page).getByText('Rehearsal', { exact: true })).toBeVisible()
  await expect(productionPanel(page)).toContainText('Soundstage 12')
  const stage12 = page.getByTestId('hollywood-stage-12-fallback')
  await expect(stage12).toContainText('Soundstage 12')
  await expect(stage12).toContainText('is authoritative')
  await expect(stage12).toContainText('depicts Soundstage 7')
  await expect(page.getByTestId(
    `hollywood-open-production-details-${secondProductionId}`,
  )).toHaveCount(0)
  await page.screenshot({ path: join(outDir, '10-second-picture-stage-12-fallback.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('GPU evidence run meets the complete two-picture company wall-clock budget', async ({ page }) => {
  test.skip(
    !PERFORMANCE_EVIDENCE,
    'Set PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1 only in a quiescent GPU-accelerated evidence browser.',
  )

  await exposeRendererEvidenceReset(page)
  await seedManagedLot(page, {
    saveBytes: RICH_MANAGED_AVAILABLE_SAVE,
    recoveredWeek: 13,
    identityProof: true,
  })
  await formPictureFromCurrentLot(page)
  await formPictureFromCurrentLot(page)
  const telemetry = await collectFreshStructuralTelemetry(page, 'two-picture GPU evidence')
  expect(telemetry).toEqual({
    displayObjects: 54,
    dynamicActors: 25,
    decodedBytes: EXPECTED_DECODED_BYTES,
    drawCalls: 1,
  })
  const performance = page.getByTestId('hollywood-performance')
  expect(Number(await performance.getAttribute('data-fps'))).toBeGreaterThanOrEqual(50)
  expect(Number(await performance.getAttribute('data-one-percent-low-fps')))
    .toBeGreaterThanOrEqual(30)
})

test('forced colors retains textual formation identity, exact selection, and visible boundaries', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.emulateMedia({ forcedColors: 'active' })
  const formed = await greenlightFromLot(page)
  await expectFormationFacts(page, formed)
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)

  const company = page.locator('.hollywood-people [data-production-id]')
  await expect(company).toHaveCount(6)
  await expect(page.locator('.hollywood-people .company-active')).toHaveCount(6)
  const forcedCompanyCue = await company.first().evaluate((button) => {
    const style = getComputedStyle(button)
    return { borderTopStyle: style.borderTopStyle, borderTopWidth: style.borderTopWidth }
  })
  expect(forcedCompanyCue.borderTopStyle).toBe('double')
  expect(forcedCompanyCue.borderTopWidth).toBe('4px')
  const selectedDirector = page.getByTestId(`hollywood-select-person-${formed.directorId}`)
  await expect(selectedDirector).toHaveClass(/active/)
  expect(await selectedDirector.evaluate((button) => getComputedStyle(button).outlineStyle))
    .toBe('solid')

  const witness = page.getByTestId('hollywood-production-formation-witness')
  await expect(witness).toHaveText('PICTURE FORMED')
  const forcedStyle = await witness.evaluate((node) => {
    const style = getComputedStyle(node)
    const parseColor = (value: string) => {
      const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
      if (!channels || channels.length !== 3) throw new Error(`unresolved color: ${value}`)
      return channels
    }
    const luminance = (channels: number[]) => channels
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
    const foreground = luminance(parseColor(style.color))
    const background = luminance(parseColor(style.backgroundColor))
    const textRange = document.createRange()
    textRange.selectNodeContents(node)
    const textRect = textRange.getBoundingClientRect()
    return {
      adjust: style.forcedColorAdjust,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderStyle: style.borderTopStyle,
      borderWidth: style.borderTopWidth,
      contrastRatio: (Math.max(foreground, background) + 0.05)
        / (Math.min(foreground, background) + 0.05),
      textWidth: textRect.width,
      textHeight: textRect.height,
    }
  })
  expect(forcedStyle.adjust).toBe('none')
  expect(forcedStyle.color).not.toBe(forcedStyle.backgroundColor)
  expect(forcedStyle.contrastRatio).toBeGreaterThanOrEqual(7)
  expect(forcedStyle.textWidth).toBeGreaterThan(0)
  expect(forcedStyle.textHeight).toBeGreaterThan(0)
  expect(forcedStyle.borderStyle).toBe('solid')
  expect(forcedStyle.borderWidth).not.toBe('0px')

  // Sample the actual composited witness, not just its CSS. The inset is only its solid
  // background plus the exact text, so a substantial second color proves painted glyphs.
  const witnessPng = await witness.screenshot()
  const rasterEvidence = await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('2D raster evidence context is unavailable')
    context.drawImage(bitmap, 0, 0)
    bitmap.close()
    const inset = Math.max(2, Math.ceil(devicePixelRatio * 2))
    const pixels = context.getImageData(
      inset,
      inset,
      canvas.width - inset * 2,
      canvas.height - inset * 2,
    ).data
    const histogram = new Map<string, number>()
    for (let index = 0; index < pixels.length; index += 4) {
      const key = `${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`
      histogram.set(key, (histogram.get(key) ?? 0) + 1)
    }
    const [dominant = '0,0,0'] = [...histogram.entries()]
      .sort((left, right) => right[1] - left[1])[0] ?? []
    const dominantChannels = dominant.split(',').map(Number)
    let contrastingPixels = 0
    let minimumLuminance = 255
    let maximumLuminance = 0
    for (const [color, count] of histogram) {
      const channels = color.split(',').map(Number)
      const luminance = channels.reduce((sum, channel) => sum + channel, 0) / 3
      minimumLuminance = Math.min(minimumLuminance, luminance)
      maximumLuminance = Math.max(maximumLuminance, luminance)
      const distance = Math.sqrt(channels.reduce(
        (sum, channel, index) => sum + (channel - dominantChannels[index]!) ** 2,
        0,
      ))
      if (distance >= 100) contrastingPixels += count
    }
    return {
      width: canvas.width,
      height: canvas.height,
      uniqueColors: histogram.size,
      contrastingPixels,
      luminanceSpan: maximumLuminance - minimumLuminance,
    }
  }, witnessPng.toString('base64'))
  expect(rasterEvidence.width).toBeGreaterThan(0)
  expect(rasterEvidence.height).toBeGreaterThan(0)
  expect(rasterEvidence.uniqueColors).toBeGreaterThan(1)
  expect(rasterEvidence.contrastingPixels).toBeGreaterThan(20)
  expect(rasterEvidence.luminanceSpan).toBeGreaterThanOrEqual(100)

  const director = page.getByTestId(`hollywood-select-person-${formed.directorId}`)
  await expect(director).toHaveAttribute('aria-pressed', 'true')
  await director.focus()
  await expect(director).toBeFocused()
  await expect(productionPanel(page)).toContainText(formed.title)
  await page.screenshot({ path: join(outDir, '11-forced-colors-formation.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('formation and neutral context are structurally identical after independent fresh renderer windows', async ({ page, context }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await exposeRendererEvidenceReset(page)
  const formed = await greenlightFromLot(page, { identityProof: true })
  await expectFormationFacts(page, formed)
  await expect.poll(async () => {
    const bytes = await activeSessionBytes(page)
    const parsed = JSON.parse(bytes) as { state?: { market?: { tick?: number } } }
    return parsed.state?.market?.tick
  }).toBe(14)
  const formedBytes = await activeSessionBytes(page)
  const formationTelemetry = await collectFreshStructuralTelemetry(page, 'formation')

  // Remount the byte-identical post-greenlight save in a fresh page. Receipt and world selection
  // are intentionally nonserialized, making this the true neutral control: same authoritative
  // picture and no person/place/formation provenance to offset the comparison.
  const neutralPage = await context.newPage()
  const neutralRuntimeErrors = captureRuntimeErrors(neutralPage)
  await exposeRendererEvidenceReset(neutralPage)
  await seedManagedLot(neutralPage, {
    saveBytes: formedBytes,
    recoveredWeek: 14,
    identityProof: true,
  })
  await expect(neutralPage.getByTestId('hollywood-production-formation-witness')).toHaveCount(0)
  await expect(neutralPage.locator(
    '[data-testid^="hollywood-select-person-"][aria-pressed="true"]',
  )).toHaveCount(0)
  await expect(neutralPage.getByTestId('hollywood-person-inspector-status')).toHaveCount(0)
  await expect(neutralPage.getByTestId('lot-annex-context')).toHaveCount(0)
  await expect(neutralPage.getByTestId('hollywood-gate-context')).toHaveCount(0)
  expect(await activeSessionBytes(neutralPage)).toBe(formedBytes)
  const neutralTelemetry = await collectFreshStructuralTelemetry(neutralPage, 'neutral')
  expect(neutralTelemetry).toEqual(formationTelemetry)
  expect(await activeSessionBytes(neutralPage)).toBe(formedBytes)
  await neutralPage.screenshot({ path: join(outDir, '12-neutral-formation-structural-parity.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  expect(neutralRuntimeErrors, neutralRuntimeErrors.join('\n')).toEqual([])
  await neutralPage.close()
})

test('formation controls remain reachable at compact layouts, world zoom, CSS magnification, and real Chromium page scale', async ({ page, context }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  const formed = await greenlightFromLot(page)

  for (const [label, width, height] of [
    ['1366x768', 1366, 768],
    ['1024x768', 1024, 768],
    ['960x540', 960, 540],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1'
      window.scrollTo(0, 0)
    })
    for (const [targetName, target] of [
      ['Advance one week', page.getByTestId('lot-advance-week')],
      ['formed Director', page.getByTestId(`hollywood-select-person-${formed.directorId}`)],
      ['formed Lead', page.getByTestId(`hollywood-select-person-${formed.leadId}`)],
    ] as const) {
      await target.scrollIntoViewIfNeeded()
      await expect(target).toBeVisible()
      const box = await target.boundingBox()
      expect(box, `formation action @ ${label}`).not.toBeNull()
      expect.soft(box!.width, `${targetName} width @ ${label}`).toBeGreaterThanOrEqual(44)
      expect.soft(box!.height, `${targetName} height @ ${label}`).toBeGreaterThanOrEqual(44)
      await target.click({ trial: true })
    }
    await expect(productionPanel(page)).toContainText(formed.title)
    await expect(page.getByTestId('hollywood-person-inspector-status')).toContainText(
      formed.directorName,
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
      .toBe(false)
  }

  await page.setViewportSize({ width: 1366, height: 768 })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await expect(productionPanel(page)).toContainText(formed.title)
  await expect(page.getByTestId(`hollywood-select-person-${formed.directorId}`)).toBeVisible()
  await page.screenshot({ path: join(outDir, '06-maximum-world-zoom-formation.png') })

  await page.setViewportSize({ width: 960, height: 540 })
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  const lead = page.getByTestId(`hollywood-select-person-${formed.leadId}`)
  await lead.scrollIntoViewIfNeeded()
  await expect(lead).toBeVisible()
  await lead.click({ trial: true })
  await expect(page.getByTestId('lot-advance-week')).toBeVisible()
  await expect(productionPanel(page)).toContainText(formed.title)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
    .toBe(false)
  await page.screenshot({ path: join(outDir, '07-960x540-css-magnification.png') })

  // Keep actual Chromium page-scale evidence distinct from CSS zoom and from the DSF2 case below.
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1'
    window.scrollTo(0, 0)
  })
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect.poll(async () => page.evaluate(() => window.visualViewport?.scale ?? 1))
    .toBe(2)
  const scaledViewport = await page.evaluate(() => ({
    layoutWidth: window.innerWidth,
    visualWidth: window.visualViewport?.width ?? window.innerWidth,
    visualHeight: window.visualViewport?.height ?? window.innerHeight,
    scale: window.visualViewport?.scale ?? 1,
  }))
  expect(scaledViewport.layoutWidth).toBe(960)
  expect(scaledViewport.visualWidth).toBeCloseTo(480, 0)
  expect(scaledViewport.visualHeight).toBeCloseTo(270, 0)
  expect(scaledViewport.scale).toBe(2)

  const expectPageScaledReachable = async (label: string, target: Locator) => {
    await target.focus()
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
        intersects:
          rect.right > left && rect.left < right && rect.bottom > top && rect.top < bottom,
      }
    })
    expect(geometry.intersects, `${label} intersects the real scaled visual viewport`).toBe(true)
    expect(geometry.width, `${label} CSS target width under pageScale=2`)
      .toBeGreaterThanOrEqual(44)
    expect(geometry.height, `${label} CSS target height under pageScale=2`)
      .toBeGreaterThanOrEqual(44)
  }

  const scaledProfile = page.getByTestId(`hollywood-open-talent-profile-${formed.directorId}`)
  await expectPageScaledReachable('Director profile', scaledProfile)
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('talent-profile-name')).toHaveText(formed.directorName)
  await page.keyboard.press('Escape')
  await expect(scaledProfile).toBeFocused()

  const scaledLead = page.getByTestId(`hollywood-select-person-${formed.leadId}`)
  await expectPageScaledReachable('formed Lead', scaledLead)
  await page.keyboard.press('Enter')
  await expect(scaledLead).toHaveAttribute('aria-pressed', 'true')
  const scaledDirector = page.getByTestId(`hollywood-select-person-${formed.directorId}`)
  await expectPageScaledReachable('formed Director', scaledDirector)
  await page.keyboard.press('Enter')
  await expect(scaledDirector).toHaveAttribute('aria-pressed', 'true')
  const scaledAdvance = page.getByTestId('lot-advance-week')
  await expectPageScaledReachable('Advance one week', scaledAdvance)
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('studio-lot-screen')).toContainText('Week 15')
  await expect(productionPanel(page)).toContainText(formed.title)
  await page.screenshot({ path: join(outDir, '07b-chromium-page-scale-200-formation.png') })
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test.describe('formation 480×270 CSS-pixel layout at device scale factor 2', () => {
  test.use({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 2 })

  test('keeps the formed picture, exact people, profile, and time action reachable at 480 CSS pixels', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page)
    const formed = await greenlightFromLot(page)
    await expectFormationFacts(page, formed)
    const productionId = await exactSavedProductionId(page, formed)
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
      compactLayout: window.matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({
      innerWidth: 480,
      devicePixelRatio: 2,
      compactLayout: true,
      scrollWidth: 480,
    })

    const taskChain = page.getByTestId(`hollywood-task-status-${productionId}`)
    await expect(taskChain).toBeVisible()
    const compactTaskGeometry = await taskChain.evaluate((node) => {
      const items = [...node.querySelectorAll<HTMLElement>(':scope > span')]
      return {
        display: getComputedStyle(node).display,
        items: items.map((item) => {
          const value = item.querySelector<HTMLElement>('b')
          if (!value) throw new Error('compact task-chain value is absent')
          const itemRect = item.getBoundingClientRect()
          const valueRect = value.getBoundingClientRect()
          return {
            top: itemRect.top,
            bottom: itemRect.bottom,
            valueWithinItem: valueRect.left >= itemRect.left
              && valueRect.right <= itemRect.right + 1,
            valueFits: value.scrollWidth <= value.clientWidth + 1,
          }
        }),
      }
    })
    expect(compactTaskGeometry.display).toBe('grid')
    expect(compactTaskGeometry.items).toHaveLength(3)
    for (const item of compactTaskGeometry.items) {
      expect(item.valueWithinItem).toBe(true)
      expect(item.valueFits).toBe(true)
    }
    for (let index = 1; index < compactTaskGeometry.items.length; index += 1) {
      expect(compactTaskGeometry.items[index]!.top)
        .toBeGreaterThanOrEqual(compactTaskGeometry.items[index - 1]!.bottom)
    }

    const compactFacts = await productionPanel(page).locator('dl').evaluate((node) => ({
      columns: getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length,
      valuesFit: [...node.querySelectorAll<HTMLElement>('dd')].every(
        (value) => value.scrollWidth <= value.clientWidth + 1,
      ),
    }))
    expect(compactFacts.columns).toBe(2)
    expect(compactFacts.valuesFit).toBe(true)

    for (const [label, target] of [
      ['Advance one week', page.getByTestId('lot-advance-week')],
      ['formed Director', page.getByTestId(`hollywood-select-person-${formed.directorId}`)],
      ['formed Lead', page.getByTestId(`hollywood-select-person-${formed.leadId}`)],
      [
        'Director profile',
        page.getByTestId(`hollywood-open-talent-profile-${formed.directorId}`),
      ],
    ] as const) {
      await target.scrollIntoViewIfNeeded()
      await expect(target).toBeVisible()
      const box = await target.boundingBox()
      expect(box, `${label} @ 480 CSS pixels / DSF 2`).not.toBeNull()
      expect(box!.width, `${label} width @ 480 CSS pixels / DSF 2`)
        .toBeGreaterThanOrEqual(44)
      expect(box!.height, `${label} height @ 480 CSS pixels / DSF 2`)
        .toBeGreaterThanOrEqual(44)
      await target.click({ trial: true })
    }
    await expect(productionPanel(page)).toContainText(formed.title)
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )).toBe(false)
    await page.screenshot({ path: join(outDir, '13-480x270-dsf2-formation.png') })
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  })

  test('keeps both complete companies keyboard-reachable at 480 CSS pixels', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page)
    await seedManagedLot(page, {
      saveBytes: RICH_MANAGED_AVAILABLE_SAVE,
      recoveredWeek: 13,
      identityProof: true,
    })
    const first = await formPictureFromCurrentLot(page)
    const firstProductionId = await exactSavedProductionId(page, first)
    const second = await formPictureFromCurrentLot(page)
    const secondProductionId = await exactSavedProductionId(page, second)
    const beforeInspection = await activeSessionBytes(page)

    const members = page.locator('.hollywood-people [data-production-id]')
    await expect(members).toHaveCount(12)
    await expect(page.locator(
      `.hollywood-people [data-production-id="${firstProductionId}"]`,
    )).toHaveCount(6)
    await expect(page.locator(
      `.hollywood-people [data-production-id="${secondProductionId}"]`,
    )).toHaveCount(6)

    const last = members.last()
    await members.first().focus()
    await last.focus()
    await expect(last).toBeFocused()
    const geometry = await last.evaluate((button) => {
      const rect = button.getBoundingClientRect()
      const rail = button.closest('.hollywood-people')!.getBoundingClientRect()
      return {
        insideRail: rect.left >= rail.left - 1 && rect.right <= rail.right + 1,
        width: rect.width,
        height: rect.height,
      }
    })
    expect(geometry.insideRail).toBe(true)
    expect(geometry.width).toBeGreaterThanOrEqual(44)
    expect(geometry.height).toBeGreaterThanOrEqual(44)
    await page.keyboard.press('Enter')
    await expect(last).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(
      'Production/Craft Lead',
    )
    await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(second.title)
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth === window.innerWidth,
    )).toBe(true)
    expect(await activeSessionBytes(page)).toBe(beforeInspection)
    await page.screenshot({ path: join(outDir, '14-two-companies-480x270-dsf2.png') })
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  })
})
