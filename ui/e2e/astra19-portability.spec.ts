// ── ASTRA Sprint 19 browser journey: a Node-written save in Chrome, a Chrome-written save back in Node, one continuation ──
//
// The retained failure (FIX-S13B-1 green-r6 B): the P18 season world built in Node was refused by the page because the
// save validator re-derived a shared-market factor with the engine's Math.exp, and Chrome's and Node's differ in the
// last bit. Under the v3 era the two engines price identically, so this spec takes the reverse of the p18 journey: the
// season world is built HERE in Node, imported through the visible Start-screen control, exported back by the page
// (byte-identical to Node's export), advanced two real weeks in the page, and the page's export after those weeks is
// compared with Node's own two ticks of the same state: an identical-input continuation across the two engines.
// Then the page's export is imported again (save, reload) and the week holds. Constructed world, labelled.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tick } from '../../src/core/tick.ts'
import { buildSeasonWorld, SEED } from '../../tests/helpers/p18-season-world.ts'
import { exportSaveJson, importSaveJson } from '../src/engine/adapter.ts'

const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

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

/** The page's own export of the live studio, read through the Saves screen's visible export box. */
async function exportFromPage(page: Page): Promise<string> {
  await page.getByTestId('open-saves').click()
  await page.getByTestId('saves-raw-toggle').click()
  const text = await page.getByTestId('export-text').inputValue()
  await page.getByTestId('saves-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  return text
}

test('ASTRA 19 portability: Node-built season world imports in Chrome, exports identically, continues identically, and reloads', async ({ page }) => {
  test.setTimeout(300_000)
  // Node side: the world and its export; Node must accept its own bytes back.
  const route = buildSeasonWorld()
  const nodeBytes = exportSaveJson(route.state)
  const nodeReplay = importSaveJson(nodeBytes)
  if (!nodeReplay.ok) throw new Error(`premise: Node imports its own export: ${nodeReplay.error}`)
  const C = route.state.market.tick

  // (1) The page imports the Node-written save through the visible control (the reverse of the p18 journey's direction).
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('import-text').fill(nodeBytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C))
  await expect(page.getByTestId('seed-label')).toContainText(SEED)

  // (2) The page's export of the imported studio is Node's bytes.
  const pageBytes = await exportFromPage(page)
  expect(pageBytes, 'Chrome re-exports the Node-written save byte for byte').toBe(nodeBytes)

  // (3) Two real weeks in the page; Node ticks the same state twice; the exports agree byte for byte.
  await advanceWeek(page)
  await advanceWeek(page)
  await expect(page.getByTestId('dash-week')).toHaveText(String(C + 2))
  const pageAfter = await exportFromPage(page)
  const nodeAfter = exportSaveJson(tick(tick(route.state)))
  expect(pageAfter, 'the identical-input continuation agrees across Chrome and Node').toBe(nodeAfter)
  // Chrome-written bytes import in Node (the retained failure's direction).
  const back = importSaveJson(pageAfter)
  if (!back.ok) throw new Error(`Node refuses the Chrome-written save: ${back.error}`)
  expect(back.state.market.tick).toBe(C + 2)
  expect(exportSaveJson(back.state)).toBe(pageAfter)

  // (4) Save and reload in the page: import the page's own export again; the week and the seed hold.
  await page.getByTestId('open-saves').click()
  await page.getByTestId('saves-import-text').fill(pageAfter)
  await page.getByTestId('saves-import').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(C + 2))
  await expect(page.getByTestId('seed-label')).toContainText(SEED)
  await page.screenshot({ path: join(shotsDir, 'astra19-1-reloaded.png'), fullPage: true })
})
