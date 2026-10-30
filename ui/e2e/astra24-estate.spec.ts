// ── ASTRA Sprint 24 browser journey B: a closing rival's estate, a sealed bid, the disposition at D ──
//
// Genuine input: the week-162 capture of the disclosed drained-R04 route (r04-pre162, Save48); one real week closes R04 at
// week 163 and opens its estate (tests/helpers/p16-actual-estate.ts proves the handoff). In the page: the week advanced,
// the estate and its lots on the Rights desk, a sealed bid at the minimum where the core permits one (or the refusal, by
// name), the weeks to D advanced, the closed estate's disposition read (sold or archived; the bid won, lost or
// disqualified; the closure's creditor claims), then a save through the client and a reload.

import { test, expect } from '@playwright/test'
import { importSaveJson } from '../src/engine/adapter.ts'
import { tick } from '../../src/core/tick.ts'
import { rightsDesk, submitEstateBidAction } from '../src/engine/rights.ts'
import { moneyExact } from '../src/format.ts'
import { STUDIO_LOT_OVERVIEW_FLAG, advanceWeek, genuineCapture, importOnStart, saveReloadWeek, shot } from './astra24-shared.ts'

const CLOSING = 'studio-aca408ec-r04'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

test('ASTRA 24 journey B: the estate opens at the closure, a sealed bid, the disposition at D, and a save and reload', async ({ page }) => {
  test.setTimeout(600_000)
  const bytes = genuineCapture('P16_JOIN_PREC48_PATH', 'P16_JOIN_PREC48_SHA256')
  const node = importSaveJson(bytes)
  if (!node.ok) throw new Error(`premise: Node imports the capture: ${node.error}`)
  const C0 = node.state.market.tick
  // Node premise: one week closes R04 and opens its estate; the desk's own view names the lots and the bid law.
  const opened = tick(node.state)
  const deskAtOpen = rightsDesk(opened)
  const estate = deskAtOpen.estates.find((e) => e.studioId === CLOSING)
  expect(estate, 'premise: the closing rival\'s estate opens at the closure week').toBeDefined()
  expect(estate!.closureWeek).toBe(C0 + 1)
  expect(estate!.lots.length, 'premise: the estate holds lots').toBeGreaterThan(0)
  const lot = estate!.lots[0]!
  expect(lot.bidRefusal, 'premise: the core permits a bid on the first lot (the bid half of the journey is not optional)').toBeNull()
  const D = estate!.closesWeek
  // Node premise for D: the same bid through the same action, then the weeks to D; the desk's own statement of the
  // outcome and of the closure's creditor claims is what the page must show.
  const bidInNode = submitEstateBidAction(opened, estate!.estateId, lot.lotId, lot.minimumBid)
  if (!bidInNode.ok) throw new Error(`premise: the bid the desk permits is accepted: ${bidInNode.error}`)
  let atD = bidInNode.next
  for (let week = C0 + 1; week < D; week++) atD = tick(atD)
  const closedView = rightsDesk(atD).closedEstates.find((e) => e.estateId === estate!.estateId)
  expect(closedView, 'premise: the estate resolves at D').toBeDefined()
  const claimsLine = 'Creditor claims of the closure: ' + closedView!.claims.map((c) => `${c.count} ${c.kind === 'employment' ? 'employment' : c.kind === 'tvRefund' ? 'television refund' : 'television charge'} (${moneyExact(c.paid)} paid, ${moneyExact(c.unpaid)} unpaid)`).join('; ')
  expect(closedView!.claims.length, 'premise: the closure published claims').toBeGreaterThan(0)
  const myName = opened.hollywood!.identities.find((i) => i.studioId === opened.hollywood!.playerStudioId)!.name

  await importOnStart(page, bytes, C0)
  await advanceWeek(page)
  await expect(page.getByTestId('dash-week')).toHaveText(String(C0 + 1))

  // (1) The estate on the desk, as the core published it.
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId('rights-desk')).toBeVisible()
  const estateBlock = page.getByTestId(`rights-estate-${estate!.estateId}`)
  await expect(estateBlock).toContainText(`${estate!.name}: closed at week ${C0 + 1}; bids open weeks ${estate!.opensWeek} to ${D - 1}`)
  await expect(page.locator(`[data-testid^="rights-lot-"]`)).toHaveCount(estate!.lots.length)
  const lotRow = page.getByTestId(`rights-lot-${lot.lotId}`)
  await expect(lotRow).toContainText(`minimum bid $${lot.minimumBid.toLocaleString('en-US')}`)
  await shot(page, 'astra24b-1-estate-open')

  // (2) The sealed bid at the minimum; the row shows it and the control goes.
  await page.getByTestId(`rights-bid-amount-${lot.lotId}`).fill(String(lot.minimumBid))
  await page.getByTestId(`rights-bid-${lot.lotId}`).click()
  await expect(lotRow).toContainText(`your sealed bid $${lot.minimumBid.toLocaleString('en-US')} (week ${C0 + 1})`)
  await expect(page.getByTestId(`rights-bid-${lot.lotId}`)).toHaveCount(0)
  await shot(page, 'astra24b-2-bid')

  // (3) The weeks to D through the Dashboard; the estate leaves the open list and the disposition is readable.
  await page.getByTestId('rights-back').click()
  for (let week = C0 + 1; week < D; week++) await advanceWeek(page)
  await expect(page.getByTestId('dash-week')).toHaveText(String(D))
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId(`rights-estate-${estate!.estateId}`)).toHaveCount(0)
  const closed = page.getByTestId(`rights-closed-estate-${estate!.estateId}`)
  await expect(closed).toContainText(`${estate!.name}: closed at week ${C0 + 1}; the estate resolved at week ${D}`)
  const closedLot = page.getByTestId(`rights-closed-lot-${lot.lotId}`)
  await expect(closedLot).toContainText(/sold for \$[\d,]+ to .+|archived unsold/)
  const lotText = (await closedLot.textContent())!
  const mine = page.getByTestId(`rights-closed-lot-mybid-${lot.lotId}`)
  await expect(mine).toContainText(`Your sealed bid $${lot.minimumBid.toLocaleString('en-US')} (week ${C0 + 1}): `)
  const mineText = (await mine.textContent())!
  expect(mineText).toMatch(/: (won|lost: the lot sold to another bidder|disqualified.*)$/)
  // The outcome the engine recorded, read back from Node's own D state, and the lot's text agreeing with it.
  const nodeLot = closedView!.lots.find((l) => l.lotId === lot.lotId)!
  expect(nodeLot.myBid?.status).toBeDefined()
  expect(mineText.endsWith(nodeLot.myBid!.status === 'won' ? ': won' : nodeLot.myBid!.status === 'lost' ? 'another bidder' : '') || nodeLot.myBid!.status === 'disqualified').toBe(true)
  if (nodeLot.myBid!.status === 'won') expect(lotText).toContain(`sold for $${lot.minimumBid.toLocaleString('en-US')} to ${myName}`)
  else if (nodeLot.myBid!.status === 'lost') expect(lotText).toMatch(/sold for \$[\d,]+ to /)
  await expect(page.getByTestId(`rights-closed-estate-claims-${estate!.estateId}`)).toHaveText(claimsLine)
  await shot(page, 'astra24b-3-disposition')

  // (4) Save through the client, reload; the disposition reads the same.
  await page.getByTestId('rights-back').click()
  await saveReloadWeek(page, D)
  await page.getByTestId('open-rights-desk').click()
  await expect(page.getByTestId(`rights-closed-lot-${lot.lotId}`)).toHaveText(lotText)
  await shot(page, 'astra24b-4-reloaded')
})
