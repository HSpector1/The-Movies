// ── ASTRA Sprint 24 browser journeys: shared steps ──
//
// The journeys import an admitted genuine P16 closure capture (a Save48 file of the disclosed drained-R04 transaction
// route, bound by digest, read from the lane's capture root; never the Owner's save, never copied into the repository)
// through the Start screen's visible control, and every action after that goes through the UI.

import { expect, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
export const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

/** The genuine capture named by the environment, checked against its recorded digest; a missing binding fails by name. */
export function genuineCapture(pathVar: string, shaVar: string): string {
  const path = process.env[pathVar], sha = process.env[shaVar]
  if (!path || !sha) throw new Error(`premise: ${pathVar} and ${shaVar} bind the genuine capture (the lane env file sets them)`)
  const bytes = readFileSync(path)
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== sha) throw new Error(`premise: ${path} digest ${digest} is not the recorded ${sha}`)
  return bytes.toString('utf8')
}

export async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

/** One real week through the Dashboard, settling the release, newspaper and period screens a week can land on. */
export async function advanceWeek(page: Page) {
  const before = Number(await page.getByTestId('dash-week').textContent())
  expect(Number.isSafeInteger(before), 'premise: the Dashboard shows a whole week').toBe(true)
  const continuedWeek = String(before + 1)
  await expect(page.getByTestId('advance-week')).toBeEnabled()
  await page.getByTestId('advance-week').click()
  for (let transition = 0; transition < 5; transition++) {
    let destination = 'pending'
    await expect.poll(async () => {
      if (await page.getByTestId('newspaper-reveal').isVisible()) destination = 'newspaper'
      else if (await page.getByTestId('release-list').isVisible()) destination = 'release'
      else if (await page.getByTestId('period-continue').isVisible()) destination = 'period'
      else if (await page.getByTestId('dash-week').isVisible()
        && (await page.getByTestId('dash-week').textContent()) === continuedWeek) destination = 'dashboard'
      else destination = 'pending'
      return destination
    }).not.toBe('pending')
    if (destination === 'dashboard') return
    if (destination === 'newspaper') await page.getByTestId('newspaper-continue').click()
    else if (destination === 'period') await page.getByTestId('period-continue').click()
    else await page.getByTestId('release-continue').click()
  }
  throw new Error(`premise: week ${continuedWeek} settles within five screens`)
}

/** The page's own export of the live studio, read through the Saves screen's visible export box. */
export async function exportFromPage(page: Page): Promise<string> {
  await page.getByTestId('open-saves').click()
  await page.getByTestId('saves-raw-toggle').click()
  const text = await page.getByTestId('export-text').inputValue()
  await page.getByTestId('saves-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  return text
}

/** Save through the client (the page's export imported again from the Saves screen) and reload the page; the week holds. */
export async function saveReloadWeek(page: Page, week: number) {
  const bytes = await exportFromPage(page)
  await page.getByTestId('open-saves').click()
  await page.getByTestId('saves-import-text').fill(bytes)
  await page.getByTestId('saves-import').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(week))
  await page.reload()
  await expect(page.getByTestId('dash-week')).toHaveText(String(week))
  return bytes
}

export async function importOnStart(page: Page, bytes: string, week: number) {
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('import-text').fill(bytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(week))
}
