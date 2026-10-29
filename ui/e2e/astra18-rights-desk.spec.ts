// ── ASTRA Sprint 18 browser journey: sell the season's property from the Rights desk and watch the disclosed cancellation happen ──
//
// Follows p18-season.spec.ts: the P18 season world built IN THE PAGE by the dev server's own engine, imported through the
// visible control, the season commissioned from Assembly, then the Rights desk: a disclosure request, the sale reviewed
// (the season consequence shown before the binding confirm), confirmed, and two real weeks walked until the season is
// cancelled under cause `rights` at the disclosed week. Constructed world, labelled; nothing here is the Owner's save.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEED } from '../../tests/helpers/p18-season-world.ts'

const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })
const WORLD_MODULE = `/@fs${encodeURI(fileURLToPath(new URL('../../tests/helpers/p18-season-world.ts', import.meta.url)))}`

async function fixture(page: Page): Promise<{ bytes: string; week: number; propertyId: string; buyer: string; buyerName: string; value: number }> {
  return page.evaluate(async ({ world, adapter, rights }) => {
    const route = (await import(/* @vite-ignore */ world)).buildSeasonWorld()
    const engine = await import(/* @vite-ignore */ adapter)
    const { saleOfferRefusal, rightsDesk } = await import(/* @vite-ignore */ rights)
    const bytes: string = engine.exportSaveJson(route.state)
    const replay = engine.importSaveJson(bytes)
    if (!replay.ok) throw new Error(`premise: the p18 fixture imports in the page: ${replay.error}`)
    if (replay.converted || engine.exportSaveJson(replay.state) !== bytes) throw new Error('premise: the p18 fixture replays byte-identically in the page')
    const state = route.state
    const me = state.hollywood.playerStudioId
    const subject = { right: 'R1', propertyId: route.propertyId }
    const buyer = state.hollywood.businesses.map((b: { studioId: string }) => b.studioId).filter((id: string) => id !== me).sort()
      .find((id: string) => saleOfferRefusal(state, id, subject, 1_000) === null)
    if (buyer === undefined) throw new Error('premise: a rival may buy the property')
    const buyerName = state.hollywood.identities.find((i: { studioId: string }) => i.studioId === buyer).name
    const value = rightsDesk(state).titles.find((t: { subject: { propertyId?: string } }) => t.subject.propertyId === route.propertyId).value
    if (typeof value !== 'number') throw new Error('premise: the property has a valuation')
    return { bytes, week: state.market.tick as number, propertyId: route.propertyId as string, buyer: buyer as string, buyerName: buyerName as string, value: value as number }
  }, { world: WORLD_MODULE, adapter: '/src/engine/adapter.ts', rights: '/src/engine/rights.ts' })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

async function advanceWeek(page: Page) {
  const before = Number(await page.getByTestId('dash-week').textContent())
  expect(Number.isSafeInteger(before), 'premise: the Dashboard shows a whole week').toBe(true)
  const continuedWeek = String(before + 1)
  await expect(page.getByTestId('advance-week')).toBeEnabled()
  await page.getByTestId('advance-week').click()
  for (let transition = 0; transition < 4; transition++) {
    let destination = 'pending'
    await expect.poll(async () => {
      if (await page.getByTestId('newspaper-reveal').isVisible()) destination = 'newspaper'
      else if (await page.getByTestId('release-list').isVisible()) destination = 'release'
      else if (await page.getByTestId('dash-week').isVisible()
        && (await page.getByTestId('dash-week').textContent()) === continuedWeek) destination = 'dashboard'
      else destination = 'pending'
      return destination
    }).not.toBe('pending')
    if (destination === 'dashboard') return
    if (destination === 'newspaper') await page.getByTestId('newspaper-continue').click()
    else await page.getByTestId('release-continue').click()
  }
  throw new Error(`premise: week ${continuedWeek} settles within four screens`)
}

test('ASTRA 18 journey: disclosure request, then a title sale disclosed before the confirm, then the season cancels as disclosed', async ({ page }) => {
  test.setTimeout(300_000)
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  const { bytes, week: C, propertyId, buyer, buyerName, value } = await fixture(page)
  await page.getByTestId('import-text').fill(bytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C))
  await expect(page.getByTestId('seed-label')).toContainText(SEED)

  // (1) Commission the season from Assembly (p18-season.spec.ts steps).
  await page.getByTestId('assemble-film').click()
  await page.getByTestId('season-open').click()
  await page.getByTestId('season-title').fill('The Long Night')
  await expect(page.getByTestId('season-commission')).toBeEnabled()
  await page.getByTestId('season-commission').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C))
  await expect(page.locator('[data-testid^="season-progress-"]')).toHaveCount(1)

  // (2) The Rights desk: the held property names its live season; a disclosure request runs through the core.
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId('rights-desk')).toBeVisible()
  await expect(page.getByTestId('rights-standing')).toContainText(`Week ${C}.`)
  await expect(page.getByTestId(`rights-title-row-${propertyId}`)).toContainText('1 live season produced on it')
  await page.getByTestId(`rights-diligence-${buyer}`).click()
  await expect(page.getByTestId(`rights-counterparty-${buyer}`)).toContainText('1 disclosure held (fresh through week')

  // (3) The sale: buyer, price, the core's willingness, the review with the season consequence, then the confirm.
  await page.getByTestId(`rights-sell-${propertyId}`).click()
  await page.getByTestId('rights-sale-counterparty').selectOption(buyer)
  await page.getByTestId('rights-sale-price').fill(String(value + 1_000))
  await expect(page.getByTestId('rights-sale-willingness')).toContainText(`${buyerName} would not accept this price; the most it would pay now is`)
  await page.getByTestId('rights-sale-price').fill(String(value))
  await expect(page.getByTestId('rights-sale-willingness')).toContainText(`${buyerName} would accept this price at the week boundary.`)
  await expect(page.getByTestId('rights-sale-confirm')).toHaveCount(0)
  await page.getByTestId('rights-sale-review').click()
  const disclosure = page.getByTestId('rights-sale-disclosure')
  await expect(disclosure).toContainText(`is answered at the coming week boundary (week ${C + 1})`)
  await expect(disclosure).toContainText(`The Long Night loses its production right and is cancelled at week ${C + 2} (cancelled when the season's rights authority ended)`)
  await expect(disclosure).toContainText('the unearned advance $120,000 is returned and the cancellation charge $120,000 is assessed once')
  await shot(page, 'astra18-1-sale-disclosure')
  await page.getByTestId('rights-sale-confirm').click()
  await expect(page.locator('[data-testid^="rights-offer-row-"]')).toHaveCount(1)
  await expect(page.locator('[data-testid^="rights-offer-row-"]')).toContainText(`you offered to sell the story property`)
  await expect(page.getByTestId('rights-sale-form')).toHaveCount(0)
  await shot(page, 'astra18-2-offer-open')

  // (4) Two real weeks: the rival answers at C + 1 (the season still live), the season cancels at C + 2 as disclosed.
  await page.getByTestId('rights-back').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C))
  await advanceWeek(page)
  await expect(page.locator('[data-testid^="season-state-"]')).toContainText('In production')
  await advanceWeek(page)
  const state = page.locator('[data-testid^="season-state-"]')
  await expect(state).toContainText(`Cancelled at week ${C + 2} (cancelled when the season's rights authority ended)`)
  await expect(state).toContainText('its distribution licence')
  // The settlement was paid from cash at the boundary (the row keeps the received advance; nothing is owed), so no cancel is offered any more.
  await expect(page.locator('button[data-testid^="season-cancel-"]')).toHaveCount(0)
  await expect(page.locator('[data-testid^="season-money-"]')).toContainText('received $120,000')
  await shot(page, 'astra18-3-season-cancelled')

  // (5) The desk no longer lists the sold property; the accepted offer is on record.
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId(`rights-title-row-${propertyId}`)).toHaveCount(0)
  await expect(page.locator('[data-testid^="rights-offer-row-"]')).toContainText('accepted')
})
