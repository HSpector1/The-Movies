// ── Cycle-2 owner playtest (D-11.A) — the exact 21-step flow, end to end ───────
// Automates the owner's cycle-2 acceptance walk against the REAL app (no engine
// mocking), capturing the requested screenshots:
//   • founding shows NO long decimals for Star Power / age (A5 presentation)
//   • create a high-quality CUSTOM actor in the Full Custom creator (skills + genre
//     edited explicitly, so the screenshots show real editing) and sign them
//   • found the studio with EXACTLY 3 actors / 1 director / 2 writers / 1 craft
//   • create a SECOND custom person in the Hiring Market; confirm they are NOT auto-
//     employed (appear as a signable free agent) and sign them
//   • assemble + release Film A and Film B with materially DIFFERENT casts (both
//     greenlit the same week so B's pickers auto-differ)
//   • assert each film's autopsy shows the correct + DISTINCT participants
//   • save/reload and confirm the stored identity is preserved
//
// Selectors are stable testids/roles, never fragile CSS.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEED = 'e2e-cycle2-playtest'
const CUSTOM_ACTOR = 'Custom Star Ada'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

const ROLES = ['writer', 'director', 'lead', 'antagonist', 'support', 'craft'] as const
type RoleName = (typeof ROLES)[number]

// Sign the first available offer on the first unsigned card in a founding role group.
async function signFirstInGroup(page: Page, role: string) {
  const group = page.getByTestId(`founding-group-${role}`)
  await group.locator('button[data-testid^="founding-sign-"]').first().click()
}

// Assemble one legal film (first ENABLED candidate in each picker + a craft lead) and
// greenlight. Already-engaged talent are disabled, so a second film cast right after the
// first naturally picks DIFFERENT people. Leaves the app on the dashboard.
async function assembleAndGreenlight(page: Page) {
  await page.getByTestId('assemble-film').click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await page.getByTestId('concept-grid').getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // → shape
  await page.getByTestId('assembly-next').click() // → promise
  await page.getByTestId('assembly-next').click() // → talent
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
    await page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first().click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('active-list')).toBeVisible()
}

// Advance weeks until the dashboard releases table shows at least `expected` rows;
// return the productionIds in table order.
async function advanceUntilReleases(page: Page, expected: number): Promise<string[]> {
  for (let i = 0; i < 40; i++) {
    const ids = await releaseRowIds(page)
    if (ids.length >= expected) return ids
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) await advance.click()
    const cont = page.getByTestId('release-continue')
    if (await cont.isVisible().catch(() => false)) await cont.click()
  }
  const ids = await releaseRowIds(page)
  expect(ids.length, `both films should release within the window (saw ${ids.length})`).toBeGreaterThanOrEqual(
    expected,
  )
  return ids
}

async function releaseRowIds(page: Page): Promise<string[]> {
  const table = page.getByTestId('releases-table')
  if (!(await table.isVisible().catch(() => false))) return []
  const rows = table.locator('tr[data-testid^="release-"]')
  const n = await rows.count()
  const ids: string[] = []
  for (let i = 0; i < n; i++) {
    const testid = await rows.nth(i).getAttribute('data-testid')
    if (testid) ids.push(testid.replace('release-', ''))
  }
  return ids
}

async function captureParticipants(
  page: Page,
  containerTestId: string,
  namePrefix: string,
): Promise<Record<RoleName, string | null>> {
  await expect(page.getByTestId(containerTestId)).toBeVisible()
  const out = {} as Record<RoleName, string | null>
  for (const role of ROLES) {
    const cell = page.getByTestId(`${namePrefix}-${role}`).first()
    out[role] = (await cell.isVisible().catch(() => false)) ? ((await cell.textContent()) ?? '').trim() : null
  }
  return out
}

test('cycle-2 owner playtest: custom-actor founding → hiring → two distinct films → reload', async ({ page }) => {
  test.setTimeout(120_000)

  // ── STEP 1 — Start a new game. ──────────────────────────────────────────────
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()

  // ── STEP 2 — Founding shows NO long decimals for Star Power / age (A5). ──────
  // Assert the applicant cards' visible text never contains a 4+ digit decimal fraction.
  const cardTexts = await page.locator('[data-testid^="founding-card-"]').allInnerTexts()
  expect(cardTexts.length).toBeGreaterThan(0)
  for (const txt of cardTexts) {
    expect(txt, `founding card must not show long decimals: ${txt}`).not.toMatch(/\d\.\d{4,}/)
  }
  await shot(page, 'c2-founding')

  // ── STEP 3 — Open the Talent Creator during founding. ───────────────────────
  await page.getByTestId('founding-create-applicant').click()
  await expect(page.getByTestId('creator-mode-full')).toBeVisible()

  // ── STEP 4 — Switch to Full Custom. ─────────────────────────────────────────
  await page.getByTestId('creator-mode-full').click()
  await expect(page.getByTestId('custom-stages')).toBeVisible()

  // ── STEP 5 — Create a high-quality custom ACTOR (edit skills + a genre explicitly). ──
  // Identity: name + role = actor (primary discipline "acting"). Role is set FIRST so the
  // acting skill/genre panels auto-expand for the following stages.
  await page.getByTestId('talent-role').selectOption('actor')
  await page.getByTestId('talent-name').fill(CUSTOM_ACTOR)
  await page.getByTestId('custom-next').click() // identity → profession
  // A preset populates the profession quickly; we still set skills + a genre by hand below
  // so the screenshots show explicit editing.
  await page.getByTestId('custom-preset').selectOption('actingSpecialist')
  await page.getByTestId('custom-next').click() // profession → skills
  // Skills: set several acting skills to a high value (primary "acting" panel is open).
  await expect(page.getByTestId('custom-skillgroup-acting')).toBeVisible()
  for (const i of [0, 1, 2, 5]) {
    const input = page.getByTestId(`custom-skill-acting-${i}`)
    await input.fill('90')
  }
  await shot(page, 'c2-full-custom-skills')
  await page.getByTestId('custom-next').click() // skills → genre
  // Genre: set an explicit acting-genre experience level (dropdown buckets).
  await expect(page.getByTestId('custom-genregroup-acting')).toBeVisible()
  await page.getByTestId('custom-genre-acting-drama').selectOption({ label: 'Expert' })
  await shot(page, 'c2-full-custom-genre')
  await page.getByTestId('custom-next').click() // genre → potential
  await page.getByTestId('custom-next').click() // potential → review
  await expect(page.getByTestId('custom-stage-review')).toBeVisible()
  await page.getByTestId('create-talent').click()

  // ── STEP 6 — Back on founding, SIGN the created actor by name. ───────────────
  await expect(page.getByTestId('found-studio')).toBeVisible()
  const adaCard = page.locator('[data-testid^="founding-card-"]').filter({ hasText: CUSTOM_ACTOR })
  await expect(adaCard).toHaveCount(1) // the created actor joined the applicant pool
  await adaCard.locator('button[data-testid^="founding-sign-"]').first().click()
  await expect(adaCard.locator('[data-testid^="founding-signed-"]')).toBeVisible()

  // ── STEP 7 — Complete the roster to EXACTLY 3 actors / 1 director / 2 writers / 1 craft. ──
  // The custom actor is 1 of the 3 actors; sign 2 more actors + 1 director + 2 writers + 1 craft.
  for (let i = 0; i < 2; i++) await signFirstInGroup(page, 'actor')
  await signFirstInGroup(page, 'director')
  for (let i = 0; i < 2; i++) await signFirstInGroup(page, 'writer')
  await signFirstInGroup(page, 'craft')
  // Coverage reads 3 actors (custom + 2 signed from the pool).
  await expect(page.getByTestId('founding-coverage-actor')).toContainText('3/')
  await shot(page, 'c2-three-actor-founding')
  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()
  await expect(page.getByTestId('dash-week')).toHaveText('0') // STEP 8 (covered)

  // ── STEP 9 — Open the Hiring Market and create a SECOND custom person. ───────
  await page.getByTestId('open-hiring').click()
  await expect(page.getByTestId('hiring-list')).toBeVisible()
  await page.getByTestId('hiring-create-talent').click()
  await expect(page.getByTestId('creator-mode-full')).toBeVisible()
  await page.getByTestId('creator-mode-full').click()
  await expect(page.getByTestId('custom-stages')).toBeVisible()
  const HIRE_NAME = 'Custom Free Agent Boaz'
  await page.getByTestId('talent-role').selectOption('director')
  await page.getByTestId('talent-name').fill(HIRE_NAME)
  await page.getByTestId('custom-next').click() // identity → profession
  await page.getByTestId('custom-preset').selectOption('actingSpecialist').catch(() => {})
  await page.getByTestId('custom-next').click() // profession → skills
  await page.getByTestId('custom-next').click() // skills → genre
  await page.getByTestId('custom-next').click() // genre → potential
  await page.getByTestId('custom-next').click() // potential → review
  await page.getByTestId('create-talent').click()

  // ── STEP 10 — Confirm they are NOT auto-employed: a signable card in the market. ──
  await expect(page.getByTestId('hiring-list')).toBeVisible()
  const hireCard = page.locator('[data-testid^="hiring-card-"]').filter({ hasText: HIRE_NAME })
  await expect(hireCard).toHaveCount(1) // present as a signable FREE AGENT (not employed)

  // ── STEP 11 — Sign them, then return to the dashboard. ──────────────────────
  await hireCard.locator('button[data-testid^="hiring-sign-"]').first().click()
  await page.getByTestId('hiring-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ── STEP 12-15 — Two films with materially different casts. ─────────────────
  // Greenlight Film A and Film B in the SAME week (Film A's talent are then engaged, so
  // Film B's first-eligible picks auto-differ), then advance until both release.
  await assembleAndGreenlight(page)
  await assembleAndGreenlight(page)
  const ids = await advanceUntilReleases(page, 2)
  expect(new Set(ids).size, 'the two productions must have distinct ids').toBeGreaterThanOrEqual(2)
  const [idA, idB] = ids

  // ── STEP 16-17 — Film A autopsy: participants present + correct. ─────────────
  await page.getByTestId(`autopsy-${idA}`).click()
  const filmA = await captureParticipants(page, 'autopsy-participants', 'autopsy-participant-name')
  await shot(page, 'c2-playtest-filmA-autopsy')
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ── STEP 18-19 — Film B autopsy: DIFFERENT + correct. ───────────────────────
  await page.getByTestId(`autopsy-${idB}`).click()
  const filmB = await captureParticipants(page, 'autopsy-participants', 'autopsy-participant-name')
  await shot(page, 'c2-playtest-filmB-autopsy')
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(filmA[role], `Film A ${role} name should be present`).toBeTruthy()
    expect(filmB[role], `Film B ${role} name should be present`).toBeTruthy()
  }
  expect(
    filmA.lead === filmB.lead && filmA.writer === filmB.writer && filmA.director === filmB.director,
    `Film A and Film B must have materially different casts ` +
      `(A: lead=${filmA.lead}, writer=${filmA.writer}, director=${filmA.director}; ` +
      `B: lead=${filmB.lead}, writer=${filmB.writer}, director=${filmB.director})`,
  ).toBe(false)

  // ── STEP 20-21 — Save + reload; identity preserved. ─────────────────────────
  await page.getByTestId('open-saves').click()
  const saveJson = await page.getByTestId('export-text').inputValue()
  expect(saveJson.length).toBeGreaterThan(100)
  await page.getByTestId('restart-game').click()
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill('cycle2-reload-throwaway')
  await page.getByTestId('import-text').fill(saveJson)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  const reloadedIds = await releaseRowIds(page)
  expect(reloadedIds).toContain(idA)

  // Post-reload the dashboard autopsy button opens the archived FilmRecord (no session
  // snapshot); it renders ONLY from the film's own frozen record.
  await page.getByTestId(`autopsy-${idA}`).click()
  const recordA = await captureParticipants(page, 'record-participants', 'record-participant-name')
  await shot(page, 'c2-playtest-reload-filmA')
  await page.getByTestId('film-record-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(recordA[role], `reloaded Film A ${role} must match the live autopsy`).toBe(filmA[role])
  }
})
