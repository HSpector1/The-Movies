import { expect, test, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixtureDir = join(here, 'world-first-scenery-load-in-v1')
const fixtureFile = join(
  fixtureDir,
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'

test.beforeAll(() => {
  if (!existsSync(fixtureFile)) {
    execSync('npx vite-node scripts/gen-world-first-scenery-load-in-fixtures.mts', {
      cwd: repoRoot,
      stdio: 'inherit',
    })
  }
})

async function seedPersonLot(page: Page, expectCanvas = true) {
  const save = readFileSync(fixtureFile, 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence proves the adopted ordinary-player defaults, not a positive test override.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
    },
    [ACTIVE_SESSION_KEY, save, LOT_FLAG_KEY, HOLLYWOOD_FLAG_KEY] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (expectCanvas) {
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  }
}

async function activeSessionBytes(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
}

test('named Director and Lead expose exact work/career and return to the same live world', async ({ page }) => {
  await seedPersonLot(page)
  const beforeSave = await activeSessionBytes(page)
  const originalUrl = page.url()
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-person-inspector-mount', 'original'))

  const director = page.getByTestId('hollywood-select-person-t-dir-01')
  await director.click()
  await expect(director).toHaveAttribute('aria-pressed', 'true')
  const directorFacts = page.getByTestId('hollywood-person-work-facts')
  await expect(directorFacts).toContainText('Director')
  await expect(directorFacts).toContainText('Nights of Watchtower')
  await expect(directorFacts).toContainText('Shooting')
  await expect(directorFacts).toContainText('Soundstage 7 + Scenery Shop')
  await expect(directorFacts).toContainText('Production hold')
  await expect(directorFacts).toContainText('5 production weeks remaining')
  await expect(directorFacts).toContainText('blocked')
  await expect(page.getByTestId('hollywood-person-career-summary')).toContainText(
    'Engaged on Nights of Watchtower',
  )

  const directorProfile = page.getByTestId('hollywood-open-talent-profile-t-dir-01')
  await directorProfile.focus()
  await directorProfile.click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText('Estelle Delgado')
  await expect(page.getByTestId('talent-profile-status')).toHaveText(
    'Engaged on Nights of Watchtower',
  )
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'original')
  await expect(page.locator('canvas')).toHaveCount(1)

  // Bypass hit testing and dispatch directly at the covered canvas. Phaser input
  // suspension—not only the scrim—must prevent a world selection behind the modal.
  await canvas.dispatchEvent('pointerdown', { clientX: 40, clientY: 40, pointerId: 1 })
  await canvas.dispatchEvent('pointerup', { clientX: 40, clientY: 40, pointerId: 1 })
  await canvas.dispatchEvent('wheel', { deltaY: -120 })
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(directorProfile).toBeFocused()
  await expect(director).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'original')

  const lead = page.getByTestId('hollywood-select-person-t-act-13')
  await lead.click()
  await expect(lead).toHaveAttribute('aria-pressed', 'true')
  const leadFacts = page.getByTestId('hollywood-person-work-facts')
  await expect(leadFacts).toContainText('Lead actor')
  await expect(leadFacts).toContainText('Nights of Watchtower')
  await expect(leadFacts.getByText('Director task')).toHaveCount(0)

  const leadProfile = page.getByTestId('hollywood-open-talent-profile-t-act-13')
  await leadProfile.click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText('Vivien Nakamura')
  await expect(page.getByTestId('talent-profile-status')).toHaveText(
    'Engaged on Nights of Watchtower',
  )
  await page.getByTestId('talent-profile-close').click()
  await expect(leadProfile).toBeFocused()

  expect(page.url()).toBe(originalUrl)
  expect(await activeSessionBytes(page)).toBe(beforeSave)
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'original')

  await page.setViewportSize({ width: 960, height: 540 })
  await expect(page.getByTestId('hollywood-inspector')).toBeVisible()
  await expect(leadProfile).toBeVisible()
  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )
  expect(noHorizontalOverflow).toBe(true)
})

test('semantic person inspection and profile survive renderer rejection', async ({ page }) => {
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.abort())
  await seedPersonLot(page, false)
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()

  await page.getByTestId('hollywood-select-person-t-dir-01').click()
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText(
    'Nights of Watchtower',
  )
  await page.getByTestId('hollywood-open-talent-profile-t-dir-01').click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText('Estelle Delgado')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('hollywood-select-person-t-dir-01')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('reduced motion preserves exact person facts and profile continuity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedPersonLot(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-person-inspector-mount', 'reduced'))

  await page.getByTestId('hollywood-select-person-t-act-13').click()
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText('Lead actor')
  await page.getByTestId('hollywood-open-talent-profile-t-act-13').click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText('Vivien Nakamura')
  await page.keyboard.press('Escape')
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'reduced')
})
