import { expect, test, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const outDir = join(repoRoot, 'out', 'world-first-active-production-company-presence-v1')
const fixtureDir = join(here, 'world-first-scenery-load-in-v1')
const fixtureFile = join(
  fixtureDir,
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'
const EXPECTED_DECODED_BYTES = 11_096_896
const PERFORMANCE_EVIDENCE = process.env.PROJECT_STUDIO_PERFORMANCE_EVIDENCE === '1'

test.describe.configure({ timeout: 60_000 })

test.beforeAll(() => {
  mkdirSync(outDir, { recursive: true })
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
    ([sessionKey, saveJson, lotFlag, hollywoodFlag, identityProofFlag]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence proves the adopted ordinary-player defaults, not a positive test override.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
      localStorage.setItem(identityProofFlag as string, '1')
    },
    [
      ACTIVE_SESSION_KEY,
      save,
      LOT_FLAG_KEY,
      HOLLYWOOD_FLAG_KEY,
      IDENTITY_PROOF_FLAG_KEY,
    ] as const,
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

async function exposeRendererEvidenceReset(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const marker = 'constructor(opts) {\n    this.opts = opts;'
    if (!source.includes(marker)) throw new Error('StudioLotView evidence bridge marker is absent')
    await route.fulfill({
      response,
      body: source.replace(
        marker,
        'constructor(opts) {\n    globalThis.__projectStudioCompanyView = this;\n    this.opts = opts;',
      ),
    })
  })
}

test('named Director and Lead expose exact work/career and return to the same live world', async ({ page }) => {
  await exposeRendererEvidenceReset(page)
  await seedPersonLot(page)
  const beforeSave = await activeSessionBytes(page)
  const originalUrl = page.url()
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-person-inspector-mount', 'original'))

  const completeCompany = [
    ['t-wri-03', 'Writer'],
    ['t-dir-01', 'Director'],
    ['t-act-13', 'Lead actor'],
    ['t-act-04', 'Antagonist'],
    ['t-act-16', 'Supporting actor'],
    ['t-cra-01', 'Production/Craft Lead'],
  ] as const
  await expect(page.locator('[data-production-id="prod-0026"]')).toHaveCount(6)
  for (const [talentId, role] of completeCompany) {
    const member = page.getByTestId(`hollywood-select-person-${talentId}`)
    await expect(member).toHaveAttribute(
      'aria-label',
      new RegExp(` · ${role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} · Nights of Watchtower$`),
    )
    await expect(member).toHaveClass(/company-active/)
  }

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
  await page.screenshot({ path: join(outDir, '01-one-picture-selected-director-fit.png') })

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

  for (const [talentId, role] of completeCompany.filter(
    ([id]) => id !== 't-dir-01' && id !== 't-act-13',
  )) {
    const member = page.getByTestId(`hollywood-select-person-${talentId}`)
    await member.click()
    await expect(member).toHaveAttribute('aria-pressed', 'true')
    const facts = page.getByTestId('hollywood-person-work-facts')
    await expect(facts).toContainText(role)
    await expect(facts).toContainText('Nights of Watchtower')
    await expect(facts.getByText('Director task')).toHaveCount(0)
    const name = ((await member.locator('span').textContent()) ?? '').trim()
    const profile = page.getByTestId(`hollywood-open-talent-profile-${talentId}`)
    await profile.click()
    await expect(page.getByTestId('talent-profile-name')).toHaveText(name)
    await page.keyboard.press('Escape')
    await expect(profile).toBeFocused()
    await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'original')
  }

  expect(page.url()).toBe(originalUrl)
  expect(await activeSessionBytes(page)).toBe(beforeSave)
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'original')

  const performance = page.getByTestId('hollywood-performance')
  await page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudioCompanyView?: { resetHollywoodPerformance: () => void }
    }).__projectStudioCompanyView
    if (!view) throw new Error('real StudioLotView evidence instance is unavailable')
    view.resetHollywoodPerformance()
  })
  await expect.poll(async () => Number(
    await performance.getAttribute('data-frame-samples'),
  )).toBeLessThan(240)
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 30_000 })
  await expect(performance).toHaveAttribute('data-display-objects', '42')
  await expect(performance).toHaveAttribute('data-dynamic-actors', '19')
  await expect(performance).toHaveAttribute(
    'data-decoded-bytes',
    String(EXPECTED_DECODED_BYTES),
  )
  await expect(performance).toHaveAttribute('data-draw-calls', '1')

  await page.setViewportSize({ width: 960, height: 540 })
  await expect(page.getByTestId('hollywood-inspector')).toBeVisible()
  await expect(
    page.getByTestId('hollywood-open-talent-profile-t-cra-01'),
  ).toBeVisible()
  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )
  expect(noHorizontalOverflow).toBe(true)
  const retainedPictureCommand = page.getByTestId(
    'hollywood-production-command-clearSceneryLoadIn',
  )
  await retainedPictureCommand.scrollIntoViewIfNeeded()
  await expect(retainedPictureCommand).toBeVisible()
  expect((await retainedPictureCommand.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(34)
  await page.screenshot({ path: join(outDir, '02-one-picture-craft-lead-960x540.png') })
})

test('GPU evidence run meets the complete one-picture company wall-clock budget', async ({ page }) => {
  test.skip(
    !PERFORMANCE_EVIDENCE,
    'Set PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1 only in a quiescent GPU-accelerated evidence browser.',
  )

  await exposeRendererEvidenceReset(page)
  await seedPersonLot(page)
  const performance = page.getByTestId('hollywood-performance')
  await page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudioCompanyView?: { resetHollywoodPerformance: () => void }
    }).__projectStudioCompanyView
    if (!view) throw new Error('real StudioLotView evidence instance is unavailable')
    view.resetHollywoodPerformance()
  })
  await expect.poll(async () => Number(
    await performance.getAttribute('data-frame-samples'),
  ), {
    message: 'one-picture GPU evidence must enter a fresh renderer window',
    timeout: 5_000,
  }).toBeLessThan(240)
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 30_000 })
  await expect(performance).toHaveAttribute('data-display-objects', '42')
  await expect(performance).toHaveAttribute('data-dynamic-actors', '19')
  await expect(performance).toHaveAttribute('data-decoded-bytes', String(EXPECTED_DECODED_BYTES))
  await expect(performance).toHaveAttribute('data-draw-calls', '1')
  expect(Number(await performance.getAttribute('data-fps'))).toBeGreaterThanOrEqual(50)
  expect(Number(await performance.getAttribute('data-one-percent-low-fps')))
    .toBeGreaterThanOrEqual(30)
})

test('semantic person inspection and profile survive renderer rejection', async ({ page }) => {
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.abort())
  await seedPersonLot(page, false)
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.locator('[data-production-id="prod-0026"]')).toHaveCount(6)
  expect(await page.locator('[data-production-id="prod-0026"]').evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute('data-production-role')),
  )).toEqual(['writer', 'director', 'lead', 'antagonist', 'support', 'craft'])

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
  await expect(page.locator('[data-production-id="prod-0026"]')).toHaveCount(6)
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-person-inspector-mount', 'reduced'))

  await page.getByTestId('hollywood-select-person-t-act-13').click()
  await expect(page.getByTestId('hollywood-person-work-facts')).toContainText('Lead actor')
  await page.getByTestId('hollywood-open-talent-profile-t-act-13').click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText('Vivien Nakamura')
  await page.keyboard.press('Escape')
  await expect(canvas).toHaveAttribute('data-person-inspector-mount', 'reduced')
})
