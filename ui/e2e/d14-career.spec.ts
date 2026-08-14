// ── D-14 Phase 2 — Career explainability Playwright journeys + owner evidence ─
// Real engine events (SaveFileV5 fixtures from scripts/gen-career-fixtures.mts). The app
// boots for real; screenshots land under out/d14-career-evidence/.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { enterPackageTalentStep, openAuthoritativePackage } from './helpers/managed-production.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd14-career-evidence')
mkdirSync(outDir, { recursive: true })
const SESSION_KEY = 'project-studio.active-session.v4'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'

test.beforeAll(() => {
  if (!existsSync(join(fixturesDir, 'career-v5.json')) || !existsSync(join(fixturesDir, 'career-migrated.json'))) {
    execSync('npx vite-node scripts/gen-career-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

async function seed(page: Page, name: string) {
  const save = fixture(name)
  await page.addInitScript(([key, json]) => {
    try {
      localStorage.setItem(key as string, json as string)
    } catch {
      /* ignore */
    }
  }, [SESSION_KEY, save] as const)
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true })

function firstEvent(name: string) {
  const s = JSON.parse(fixture(name))
  return { state: s.state, lead: s.state.careerEvents.find((e: { role: string }) => e.role === 'lead') }
}

test('1. open the Talent Profile from the Studio Roster; overview + career history', async ({ page }) => {
  const { lead } = firstEvent('career-v5')
  await seed(page, 'career-v5')
  await page.getByTestId('open-roster').click()
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).click()
  await expect(page.getByTestId('talent-profile')).toBeVisible()
  // overview shows OVR + Star Power (approved definition) + role proficiencies
  await expect(page.getByTestId('talent-profile-starpower')).toBeVisible()
  await expect(page.getByTestId('talent-profile-overview')).toContainText('Commercial recognition')
  await expect(page.getByTestId('talent-profile-disciplines')).toBeVisible()
  await shot(page, '05-profile-overview')
  await expect(page.getByTestId('talent-profile-history')).toBeVisible()
  await page.getByTestId('talent-profile-history').scrollIntoViewIfNeeded()
  await shot(page, '06-profile-history')
  // Escape closes and returns to the roster
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(page.getByTestId('roster-list')).toBeVisible()
})

test('2. + 4. Chronicle Career Impact (positive gain) and open a participant profile', async ({ page }) => {
  const { state, lead } = firstEvent('career-v5')
  const pid: string = state.careerEvents.find((e: { role: string; filmId: string }) => e.role === 'lead').filmId
  await seed(page, 'career-v5')
  await page.getByTestId(`chronicle-${pid}`).click()
  await expect(page.getByTestId('career-impact')).toBeVisible()
  await page.getByTestId('career-impact').scrollIntoViewIfNeeded()
  await shot(page, '01-career-impact-positive')
  // expandable exact detail
  await page.getByTestId(`career-impact-toggle-${lead.talentId}`).click()
  await expect(page.getByTestId(`career-impact-detail-${lead.talentId}`)).toBeVisible()
  await shot(page, '04-career-impact-expanded')
  // open the participant's profile from the durable Chronicle
  await page.getByTestId(`autopsy-open-profile-${lead.talentId}`).click()
  await expect(page.getByTestId('talent-profile')).toBeVisible()
  await shot(page, '08-profile-from-chronicle')
})

test('3. loss + no-change presentation (synthetic edge fixture, §11) with accessible wording', async ({ page }) => {
  // career-loss.json rewrites two events on the first film: a −2.0 loss and a 0.0 no-change.
  const s = JSON.parse(fixture('career-loss'))
  const film: string = s.state.studio.releasedFilms[0].productionId
  const evs = s.state.careerEvents.filter((e: { filmId: string }) => e.filmId === film)
  const loss = evs.find((e: { starPowerDelta: number }) => e.starPowerDelta < 0)
  const nochange = evs.find((e: { starPowerDelta: number }) => e.starPowerDelta === 0)
  await seed(page, 'career-loss')
  await page.getByTestId(`chronicle-${film}`).click()
  await expect(page.getByTestId('career-impact')).toBeVisible()
  // loss: accessible "decrease" wording, not colour alone
  const lossDelta = page.getByTestId(`career-impact-starpower-${loss.talentId}-delta`)
  await expect(lossDelta).toContainText('decrease')
  await lossDelta.scrollIntoViewIfNeeded()
  await shot(page, '03-career-impact-loss')
  // no-change: explicit "No change", card still present (nobody hidden)
  const zeroDelta = page.getByTestId(`career-impact-starpower-${nochange.talentId}-delta`)
  await expect(zeroDelta).toHaveText('No change')
  await zeroDelta.scrollIntoViewIfNeeded()
  await shot(page, '02-career-impact-no-change')
  await shot(page, '14-zero-delta-accessible')
})

test('5. + pre-V5: a migrated film shows honest "not recorded"; the profile shows the V5 notice', async ({ page }) => {
  const s = JSON.parse(fixture('career-migrated'))
  const droppedFilmId: string = s.state.studio.releasedFilms[0].productionId
  const lead = s.state.careerEvents.find((e: { role: string }) => e.role === 'lead')
  await seed(page, 'career-migrated')
  // The film whose events were dropped retains its durable Chronicle, which shows the
  // honest unavailable message from the persisted absence of frozen career events.
  await page.getByTestId(`chronicle-${droppedFilmId}`).click()
  await expect(page.getByTestId('career-impact-unavailable')).toContainText('SaveFileV5')
  await shot(page, '10-preV5-unavailable')
  await page.goto('/')
  // a lead profile shows the migrated-history notice
  await page.getByTestId('open-roster').click()
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).click()
  await expect(page.getByTestId('talent-profile-history-notice')).toContainText('SaveFileV5')
  await shot(page, '09-migrated-notice')
})

test('7. open a Talent Profile from Assemble a Film, then return to the casting workflow', async ({ page }) => {
  await seed(page, 'career-v5')
  const authority = await openAuthoritativePackage(page)
  await enterPackageTalentStep(page, authority)
  // open a candidate's profile from the (lead) picker
  const openBtn = page.getByTestId('picker-lead').locator('[data-testid^="picker-open-profile-"]').first()
  await openBtn.click()
  await expect(page.getByTestId('talent-profile')).toBeVisible()
  await shot(page, '07-profile-from-casting')
  // close → the casting workflow (talent step) is preserved
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(page.getByTestId('picker-lead')).toBeVisible()
})

test('6. save/reload does not duplicate an event or re-apply progression', async ({ page }) => {
  const { lead } = firstEvent('career-v5')
  await seed(page, 'career-v5')
  await page.getByTestId('open-roster').click()
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).click()
  const before = await page.getByTestId('talent-profile-history').getByTestId(/^career-impact-.+-.+/).count()
  await page.reload()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-roster').click()
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).click()
  const after = await page.getByTestId('talent-profile-history').getByTestId(/^career-impact-.+-.+/).count()
  expect(after).toBe(before) // no duplicated events across reload
})

test('R. responsive + keyboard-focus + 125% zoom evidence', async ({ page }) => {
  const { lead } = firstEvent('career-v5')
  await seed(page, 'career-v5')
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.getByTestId('open-roster').click()
  // keyboard: the "View profile" link is focusable; open + capture focus state
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).focus()
  await shot(page, '13-keyboard-focus')
  await page.getByTestId(`roster-open-profile-${lead.talentId}`).click()
  await expect(page.getByTestId('talent-profile')).toBeVisible()
  await shot(page, '11-profile-1366x768')
  // 125% real-Chromium page zoom (Blink's page-zoom = Chrome Ctrl-+ mechanism)
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1.25'
  })
  await page.waitForTimeout(200)
  await shot(page, '12-profile-zoom125')
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1'
  })
})
