import { expect, test, type ElementHandle, type Page } from '@playwright/test'
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

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

function managedIdleSave(): string {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state: GameState = newGame('audition-planning-current-break-audit')
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
    throw new Error('audit fixture does not replay byte-identically')
  }
  return bytes
}

const MANAGED_IDLE_SAVE = managedIdleSave()

test.describe.configure({ timeout: 120_000 })

function instrumentRendererSource(source: string): string {
  const constructorMarker = 'constructor(opts) {\n    this.opts = opts;'
  const destroyMarker = 'destroy() {\n    this.destroyed = true;'
  if (!source.includes(constructorMarker) || !source.includes(destroyMarker)) {
    throw new Error('StudioLotView audit marker is absent')
  }
  return source
    .replace(
      constructorMarker,
      `constructor(opts) {
    const evidence = globalThis.__projectStudioAuditionAudit ??= {
      constructions: 0, destroys: 0, view: null
    };
    evidence.constructions += 1;
    evidence.view = this;
    this.opts = opts;`,
    )
    .replace(
      destroyMarker,
      `destroy() {
    if (globalThis.__projectStudioAuditionAudit) {
      globalThis.__projectStudioAuditionAudit.destroys += 1;
    }
    this.destroyed = true;`,
    )
}

async function seed(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
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
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute('data-draw-calls', '1')
}

async function sessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  return value
}

async function capture(selector: string, page: Page): Promise<ElementHandle<Node>> {
  const handle = await page.locator(selector).elementHandle()
  if (handle === null) throw new Error(`missing ${selector}`)
  return handle
}

async function activateSemantic(page: Page, testId: string) {
  const control = page.getByTestId(testId)
  await control.focus()
  await expect(control).toBeFocused()
  await control.press('Enter')
}

test('measures the current Lot → audition planner unmount and exact action footprint', async ({ page }) => {
  await seed(page)

  await activateSemantic(page, 'lot-nav-writers')
  await page.getByTestId('commission-submit').click()
  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  const projectId = await witness.getAttribute('data-project-id')
  expect(projectId).toMatch(/^script-/)

  await activateSemantic(page, 'lot-advance-week')
  await activateSemantic(page, 'lot-nav-writers')
  await page.getByTestId('lot-script-review-panel').getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute('data-draw-calls', '1')

  const beforeBytes = await sessionBytes(page)
  const oldLot = await capture('[data-testid="studio-lot-screen"]', page)
  const oldMount = await capture('[data-testid="studio-lot-canvas"]', page)
  const oldCanvas = await capture('[data-testid="studio-lot-canvas"] canvas', page)
  const beforeStructure = await page.getByTestId('hollywood-performance').evaluate((node) => ({
    displayObjects: Number(node.getAttribute('data-display-objects')),
    dynamicActors: Number(node.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(node.getAttribute('data-decoded-bytes')),
    drawCalls: Number(node.getAttribute('data-draw-calls')),
  }))
  expect(beforeStructure).toEqual({
    displayObjects: 30,
    dynamicActors: 13,
    decodedBytes: 11_096_896,
    drawCalls: 1,
  })

  await activateSemantic(page, 'lot-nav-casting')
  await expect(page.getByTestId('casting-room')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-canvas')).toHaveCount(0)
  expect(await oldLot.evaluate((node) => node.isConnected)).toBe(false)
  expect(await oldMount.evaluate((node) => node.isConnected)).toBe(false)
  expect(await oldCanvas.evaluate((node) => node.isConnected)).toBe(false)
  expect(await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioAuditionAudit?: { constructions: number; destroys: number }
    }
    return {
      constructions: root.__projectStudioAuditionAudit?.constructions,
      destroys: root.__projectStudioAuditionAudit?.destroys,
    }
  })).toEqual({ constructions: 1, destroys: 1 })

  await page.getByTestId(`casting-plan-${projectId!}`).click()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  const actorIds = await page.getByTestId('casting-slate-lead')
    .locator('button:not([disabled])')
    .evaluateAll((nodes) => nodes.slice(0, 3).map((node) =>
      node.getAttribute('data-testid')!.replace(/^casting-candidate-lead-/, ''),
    ))
  expect(actorIds).toHaveLength(3)
  for (const [slot, ids] of [
    ['lead', [actorIds[0]!, actorIds[1]!]],
    ['antagonist', [actorIds[0]!, actorIds[1]!]],
    ['support', [actorIds[0]!, actorIds[2]!]],
  ] as const) {
    for (const id of ids) await page.getByTestId(`casting-candidate-${slot}-${id}`).click()
  }
  await expect(page.getByTestId('casting-start')).toBeEnabled()
  await page.getByTestId('casting-start').click()
  await expect(page.getByTestId('casting-planner')).toHaveCount(0)
  await expect(page.getByTestId(`casting-status-${projectId!}`)).toHaveText('Auditioning')

  const afterBytes = await sessionBytes(page)
  const afterReplay = importSaveJson(afterBytes)
  expect(afterReplay.ok).toBe(true)
  if (!afterReplay.ok) throw new Error(afterReplay.error)
  expect(afterReplay.converted).toBe(false)
  expect(exportSaveJson(afterReplay.state)).toBe(afterBytes)
  const before = JSON.parse(beforeBytes) as { state: Record<string, unknown> }
  const after = JSON.parse(afterBytes) as { state: Record<string, unknown> }
  const { castingSessions: beforeCasting, ...beforeOther } = before.state
  const { castingSessions: afterCasting, ...afterOther } = after.state
  expect(afterOther).toEqual(beforeOther)
  expect(afterCasting).toEqual({
    mode: 'managed',
    sessions: [
      {
        id: 'casting-0000',
        projectId,
        status: 'auditioning',
        slate: {
          lead: [actorIds[0], actorIds[1]],
          antagonist: [actorIds[0], actorIds[1]],
          support: [actorIds[0], actorIds[2]],
        },
        startedWeek: 1,
        dueWeek: 2,
        reservation: {
          sessionId: 'casting-0000',
          facilityId: 'facility-development-casting',
          capability: 'development-casting',
          slot: 0,
        },
        results: null,
      },
    ],
  })
  expect(beforeCasting).toEqual({ mode: 'managed', sessions: [] })

  await page.getByTestId('casting-room-back').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  const newLot = await capture('[data-testid="studio-lot-screen"]', page)
  const newMount = await capture('[data-testid="studio-lot-canvas"]', page)
  const newCanvas = await capture('[data-testid="studio-lot-canvas"] canvas', page)
  expect(await newLot.evaluate((node, prior) => node !== prior, oldLot)).toBe(true)
  expect(await newMount.evaluate((node, prior) => node !== prior, oldMount)).toBe(true)
  expect(await newCanvas.evaluate((node, prior) => node !== prior, oldCanvas)).toBe(true)
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute('data-display-objects', '30')
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute('data-dynamic-actors', '13')
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute(
    'data-decoded-bytes',
    '11096896',
  )
  await expect(page.getByTestId('hollywood-performance')).toHaveAttribute('data-draw-calls', '1')
  expect(await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioAuditionAudit?: { constructions: number; destroys: number }
    }
    return {
      constructions: root.__projectStudioAuditionAudit?.constructions,
      destroys: root.__projectStudioAuditionAudit?.destroys,
    }
  })).toEqual({ constructions: 2, destroys: 1 })
})
