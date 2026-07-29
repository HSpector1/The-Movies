// ── Two-film autopsy identity: the merge-blocking regression (D-11.A, cycle-2) ──
// The cycle-1 bug: two DIFFERENT films showed the SAME cast in their autopsies —
// participant identity was not stored per-film. This spec proves the fix end to end
// against the REAL app (no engine mocking):
//   1. Found a studio with a GENEROUS roster.
//   2. Assemble Film A (first-eligible picks) and greenlight — do NOT advance.
//   3. Assemble Film B in the SAME week. Film A's talent are now engaged (disabled in
//      the pickers), so Film B's first-eligible picks are DIFFERENT people. This also
//      exercises the same-week production-id uniqueness fix.
//   4. Advance until BOTH have released (the dashboard releases table grows to 2 rows).
//   5+6. Open each film's autopsy from the dashboard; capture its stored participants.
//   7. ASSERT the two casts differ (the core regression) and both tables are present.
//   8. Save → new game → import; reopen each film's post-reload record and assert the
//      stored identity survived save/reload and is not cross-contaminated.
//
// Selectors are stable testids/roles, never fragile CSS.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEED = 'e2e-two-film-autopsy'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

// Found the studio with a GENEROUS roster so both films can be cast from distinct people
// (Film B's first-eligible picks differ because Film A engaged its own first). Sign the
// first available offer per card, `count` times per role group.
async function foundGenerousStudio(page: Page) {
  await expect(page.getByTestId('found-studio')).toBeVisible()
  const need: Array<[string, number]> = [
    ['actor', 6],
    ['director', 2],
    ['writer', 3],
    ['craft', 2],
  ]
  for (const [role, count] of need) {
    await page.getByTestId(`founding-tab-${role}`).click() // D-11.D: select the profession tab
    const group = page.getByTestId(`founding-group-${role}`)
    for (let i = 0; i < count; i++) {
      await group.locator('button[data-testid^="founding-sign-"]').first().click()
    }
  }
  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()
  await expect(page.getByTestId('dash-week')).toHaveText('0')
}

// Assemble one legal film choosing the first ENABLED candidate in each picker (already-
// engaged talent are disabled, so the second film naturally casts different people), plus
// a craft lead, then greenlight. Leaves the app on the dashboard with the film active.
async function assembleAndGreenlight(page: Page) {
  await page.getByTestId('assemble-film').click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  // Concept → shape → promise → talent (defaults are valid at each step).
  await page.getByTestId('concept-grid').getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // → shape
  await page.getByTestId('assembly-next').click() // → promise
  await page.getByTestId('assembly-next').click() // → talent
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
    const enabled = page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first()
    await enabled.click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('active-list')).toBeVisible()
}

// Advance weeks until the dashboard releases table shows at least `expected` rows.
// Each week either lands on the release screen (continue past it) or stays on the
// dashboard; returns the discovered productionIds in table order.
async function advanceUntilReleases(page: Page, expected: number): Promise<string[]> {
  for (let i = 0; i < 40; i++) {
    const ids = await releaseRowIds(page)
    if (ids.length >= expected) return ids
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) {
      await advance.click()
    }
    // D-11.C PART 2: a release week shows the newspaper reveal first, then the weekly
    // release screen; step through both back to the dashboard.
    const news = page.getByTestId('newspaper-continue')
    if (await news.isVisible().catch(() => false)) {
      await news.click()
    }
    const cont = page.getByTestId('release-continue')
    if (await cont.isVisible().catch(() => false)) {
      await cont.click()
    }
  }
  const ids = await releaseRowIds(page)
  expect(ids.length, `both films should release within the window (saw ${ids.length})`).toBeGreaterThanOrEqual(
    expected,
  )
  return ids
}

// Read the productionIds from the dashboard "Recent releases" table rows.
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

// Open a film's autopsy from the dashboard table and capture the participant name shown
// per role. During a live session this is the full Autopsy screen; after a save/reload it
// is the FilmRecord screen. `container`/`namePrefix` select which.
const ROLES = ['writer', 'director', 'lead', 'antagonist', 'support', 'craft'] as const
type RoleName = (typeof ROLES)[number]

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

test('two different films keep DISTINCT autopsy participants, preserved across save/reload', async ({ page }) => {
  test.setTimeout(120_000)

  // (1) New game → found a generous studio.
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await foundGenerousStudio(page)

  // (2) Assemble + greenlight Film A. Do NOT advance yet.
  await assembleAndGreenlight(page)
  // (3) Assemble + greenlight Film B in the SAME week. Film A's talent are engaged
  // (disabled), so Film B's first-eligible picks are DIFFERENT people, and both share
  // the same greenlight week (exercises the same-week production-id uniqueness fix).
  await assembleAndGreenlight(page)

  // (4) Advance until BOTH films appear in the dashboard releases table.
  const ids = await advanceUntilReleases(page, 2)
  expect(new Set(ids).size, 'the two productions must have distinct ids').toBeGreaterThanOrEqual(2)
  const [idA, idB] = ids

  // (5) Open Film A's autopsy from the dashboard; capture its participant names.
  await page.getByTestId(`autopsy-${idA}`).click()
  const filmA = await captureParticipants(page, 'autopsy-participants', 'autopsy-participant-name')
  await shot(page, 'c2-filmA-autopsy')
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // (6) Open Film B's autopsy; capture its participant names.
  await page.getByTestId(`autopsy-${idB}`).click()
  const filmB = await captureParticipants(page, 'autopsy-participants', 'autopsy-participant-name')
  await shot(page, 'c2-filmB-autopsy')
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // (7) THE REGRESSION: the two films' casts must NOT be identical. Assert the core
  // creative roles (lead/writer/director) differ between the two films.
  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(filmA[role], `Film A ${role} name should be present`).toBeTruthy()
    expect(filmB[role], `Film B ${role} name should be present`).toBeTruthy()
  }
  const sameLead = filmA.lead === filmB.lead
  const sameWriter = filmA.writer === filmB.writer
  const sameDirector = filmA.director === filmB.director
  expect(
    sameLead && sameWriter && sameDirector,
    `two different films must not share the same lead+writer+director cast ` +
      `(A: lead=${filmA.lead}, writer=${filmA.writer}, director=${filmA.director}; ` +
      `B: lead=${filmB.lead}, writer=${filmB.writer}, director=${filmB.director})`,
  ).toBe(false)

  // (8) Round-trip: export the save, start a NEW game, import it, and reopen each film's
  // record. After reload there is no session snapshot, so the dashboard autopsy button
  // opens the archived FilmRecord — which renders ONLY from the film's own frozen record.
  await page.getByTestId('open-saves').click()
  const saveJson = await page.getByTestId('export-text').inputValue()
  expect(saveJson.length).toBeGreaterThan(100)
  // "New Studio" is now a confirmed destructive action (D-12 A5) — a real user accepts the prompt.
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByTestId('restart-game').click()
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill('two-film-reload-throwaway')
  await page.getByTestId('import-text').fill(saveJson)
  await page.getByTestId('import-save').click()

  // Land on the dashboard (imported studio). The releases table still lists both films.
  await expect(page.getByTestId('dash-week')).toBeVisible()
  const reloadedIds = await releaseRowIds(page)
  expect(reloadedIds).toContain(idA)
  expect(reloadedIds).toContain(idB)

  // Film A's archived record shows Film A's cast (the same names as step 5) and NOT B's.
  await page.getByTestId(`autopsy-${idA}`).click()
  const recordA = await captureParticipants(page, 'record-participants', 'record-participant-name')
  await shot(page, 'c2-reload-filmA-record')
  await page.getByTestId('film-record-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(recordA[role], `reloaded Film A ${role} must match the live autopsy`).toBe(filmA[role])
  }

  // Film B's archived record shows Film B's cast — the identities did not cross-contaminate.
  await page.getByTestId(`autopsy-${idB}`).click()
  const recordB = await captureParticipants(page, 'record-participants', 'record-participant-name')
  await page.getByTestId('film-record-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(recordB[role], `reloaded Film B ${role} must match the live autopsy`).toBe(filmB[role])
  }
  // And the reloaded records remain distinct from each other (the regression, post-reload).
  expect(
    recordA.lead === recordB.lead && recordA.writer === recordB.writer && recordA.director === recordB.director,
    'reloaded records must remain distinct casts',
  ).toBe(false)
})
