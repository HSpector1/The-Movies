// ── ASTRA Sprint 24 browser journey A: acquire an operating rival from the Rights desk ──
//
// Genuine input: the week-163 capture of the disclosed drained-R04 route (r04-actual163, Save48), in which the retained
// rival R02 operates and tests/p16-absorption-continued-production.test.ts proves the player may absorb it. In the page:
// a full disclosure, a quote below the ask refused with the ask voiced, the quote at the ask read before the close, the
// explicit close, the acquired titles under the player, the rival gone from the counterparties, then a save through the
// client and a reload. Labelled constructed route; nothing here is the Owner's save or a natural campaign.

import { test, expect } from '@playwright/test'
import { importSaveJson } from '../src/engine/adapter.ts'
import { rightsDesk } from '../src/engine/rights.ts'
import { STUDIO_LOT_OVERVIEW_FLAG, advanceWeek, genuineCapture, importOnStart, saveReloadWeek, shot } from './astra24-shared.ts'

const TARGET = 'studio-aca408ec-r02'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

test('ASTRA 24 journey A: disclosure, a refused low quote naming the ask, the quote at the ask, the close, and a save and reload', async ({ page }) => {
  test.setTimeout(300_000)
  const bytes = genuineCapture('P16_JOIN_CLOSED48_PATH', 'P16_JOIN_CLOSED48_SHA256')
  const node = importSaveJson(bytes)
  if (!node.ok) throw new Error(`premise: Node imports the capture: ${node.error}`)
  const state = node.state
  const C = state.market.tick
  const desk = rightsDesk(state)
  const target = desk.counterparties.find((c) => c.studioId === TARGET)
  expect(target, 'premise: the retained rival is an operating counterparty').toBeDefined()
  expect(target!.diligence, 'premise: the player may request a disclosure').toBeNull()
  const titlesBefore = desk.titles.length
  const targetName = target!.name

  await importOnStart(page, bytes, C)
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId('rights-desk')).toBeVisible()
  await expect(page.getByTestId('rights-standing')).toContainText(`Week ${C}.`)
  await expect(page.locator('[data-testid^="rights-title-row-"]')).toHaveCount(titlesBefore)
  const row = page.getByTestId(`rights-counterparty-${TARGET}`)
  await expect(row).toContainText(targetName)

  // (1) Diligence: the fee is paid through the core; the row shows the fresh disclosure.
  await page.getByTestId(`rights-diligence-${TARGET}`).click()
  await expect(row).toContainText('1 disclosure held (latest fresh through week')
  await shot(page, 'astra24a-1-disclosed')

  // (2) A quote below the ask is refused and the refusal names the ask in dollars (the one figure a buyer must know).
  await page.getByTestId(`rights-quote-consideration-${TARGET}`).fill('0')
  await page.getByTestId(`rights-quote-${TARGET}`).click()
  const refusal = page.getByTestId(`rights-quote-refusal-${TARGET}-line`)
  await expect(refusal).toContainText('the target would not consent: its ask is $')
  const asked = (await refusal.textContent())!.match(/its ask is \$([\d,]+)/)
  expect(asked, 'the refusal carries the ask').not.toBeNull()
  const ask = Number(asked![1]!.replace(/,/g, ''))
  expect(Number.isSafeInteger(ask) && ask > 0).toBe(true)
  await shot(page, 'astra24a-2-ask-voiced')

  // (3) The quote at the ask: the summary reads what the close would do before the binding gesture.
  await page.getByTestId(`rights-quote-consideration-${TARGET}`).fill(String(ask))
  await page.getByTestId(`rights-quote-${TARGET}`).click()
  const summary = page.getByTestId(`rights-quote-summary-${TARGET}`)
  await expect(summary).toContainText(`against the target's ask $${ask.toLocaleString('en-US')}`)
  await expect(summary).toContainText('affordable now.')
  await expect(summary).toContainText(`Quoted at week ${C}.`)
  const summaryText = (await summary.textContent())!
  const rightsCount = Number(summaryText.match(/; (\d+) rights?/)![1])
  expect(rightsCount, 'premise: the target holds titles').toBeGreaterThan(0)
  await expect(page.getByTestId(`rights-absorb-${TARGET}`)).toBeEnabled()
  await shot(page, 'astra24a-3-quoted')

  // (4) The close: the rival leaves the counterparties, its titles are the player's, the week has not moved.
  await page.getByTestId(`rights-absorb-${TARGET}`).click()
  await expect(page.getByTestId(`rights-counterparty-${TARGET}`)).toHaveCount(0)
  await expect(page.locator('[data-testid^="rights-title-row-"]')).toHaveCount(titlesBefore + rightsCount)
  await expect(page.getByTestId('rights-action-refusal')).toHaveCount(0)
  await shot(page, 'astra24a-4-closed')

  // (5) Save through the client, reload, and the desk reads the same.
  await page.getByTestId('rights-back').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C))
  await saveReloadWeek(page, C)
  await page.getByTestId('open-rights-desk').click()
  await expect(page.locator('[data-testid^="rights-title-row-"]')).toHaveCount(titlesBefore + rightsCount)
  await expect(page.getByTestId(`rights-counterparty-${TARGET}`)).toHaveCount(0)
  // One real week after the acquisition settles in the page.
  await page.getByTestId('rights-back').click()
  await advanceWeek(page)
  await expect(page.getByTestId('dash-week')).toHaveText(String(C + 1))
  await shot(page, 'astra24a-5-reloaded-and-continued')
})
