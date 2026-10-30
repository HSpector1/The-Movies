// ── Owner route saves: export the two prepared worlds the P17 and P18 journeys import ──
// OWNER-INVITATION.md §2 step 6 needs the cameo world (seed p17-cameo-booking-01) and the season world
// (seed p18-sprint12-season-01) as save files. This spec writes them to $OWNER_SAVES_DIR exactly as the
// journeys build them (p17 in the runner, p18 in the page: the two engines' arithmetic disagree on one
// assessment, so a Node-built p18 save is refused by the browser) and proves each file imports through
// the visible Start-screen control. Skipped unless OWNER_SAVES_DIR is set; it never writes App state.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cameoRoute } from '../../tests/helpers/p17-cameo-route.ts'
import { SEED as P18_SEED } from '../../tests/helpers/p18-season-world.ts'
import { exportSaveJson, importSaveJson } from '../src/engine/adapter.ts'

const P17_SEED = 'p17-cameo-booking-01'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const OUT = process.env.OWNER_SAVES_DIR
const WORLD_MODULE = `/@fs${encodeURI(fileURLToPath(new URL('../../tests/helpers/p18-season-world.ts', import.meta.url)))}`

test.skip(!OUT, 'set OWNER_SAVES_DIR to export the Owner route saves')

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function importThroughStartScreen(page: Page, bytes: string, week: number, seed: string) {
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('import-text').fill(bytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(week))
  await expect(page.getByTestId('seed-label')).toContainText(seed)
}

function write(name: string, bytes: string) {
  mkdirSync(OUT!, { recursive: true })
  const path = join(OUT!, name)
  writeFileSync(path, bytes)
  console.log(`wrote ${path} (${bytes.length} bytes)`)
}

test('P17 cameo world: written as the journey builds it, imports through the Start screen', async ({ page }) => {
  test.setTimeout(240_000)
  const route = cameoRoute(P17_SEED)
  const bytes = exportSaveJson(route.world)
  const replay = importSaveJson(bytes)
  if (!replay.ok) throw new Error(`premise: the p17 save imports: ${replay.error}`)
  if (replay.converted || exportSaveJson(replay.state) !== bytes) throw new Error('premise: the p17 save replays byte-identically')
  write('p17-cameo-world.json', bytes)
  await importThroughStartScreen(page, bytes, route.world.market.tick, P17_SEED)
})

test('P18 season world: built in the page as the journey builds it, imports through the Start screen', async ({ page }) => {
  test.setTimeout(240_000)
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  const { bytes, week } = await page.evaluate(async ({ world, adapter }) => {
    const route = (await import(/* @vite-ignore */ world)).buildSeasonWorld()
    const engine = await import(/* @vite-ignore */ adapter)
    const bytes: string = engine.exportSaveJson(route.state)
    const replay = engine.importSaveJson(bytes)
    if (!replay.ok) throw new Error(`premise: the p18 save imports in the page: ${replay.error}`)
    if (replay.converted || engine.exportSaveJson(replay.state) !== bytes) throw new Error('premise: the p18 save replays byte-identically in the page')
    return { bytes, week: route.state.market.tick as number }
  }, { world: WORLD_MODULE, adapter: '/src/engine/adapter.ts' })
  write('p18-season-world.json', bytes)
  await importThroughStartScreen(page, bytes, week, P18_SEED)
})
