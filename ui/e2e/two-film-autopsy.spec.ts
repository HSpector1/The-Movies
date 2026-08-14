// ── Two-film autopsy identity: the merge-blocking regression (D-11.A, cycle-2) ──
// The cycle-1 bug: two DIFFERENT films showed the SAME cast in their autopsies —
// participant identity was not stored per-film. This spec proves the fix end to end
// against the REAL app (no engine mocking):
//   1. Found a studio with a GENEROUS roster.
//   2. Commission two authoritative screenplays together and advance to their shared review.
//   3. Accept and package both in the SAME week. Film A's talent are engaged (disabled in
//      Film B's pickers), so Film B's first-eligible picks are DIFFERENT people. This also
//      preserves coverage of the same-week production-id uniqueness fix.
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
import { enterPackageTalentStep } from './helpers/managed-production.ts'

const SEED = 'e2e-two-film-autopsy'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

// Found the studio with a GENEROUS roster so both films can be cast from distinct people
// (Film B's first-eligible picks differ because Film A engaged its own first). Sign the
// first available offer per card, `count` times per role group.
async function foundGenerousStudio(page: Page): Promise<string[]> {
  await expect(page.getByTestId('found-studio')).toBeVisible()
  const need: Array<[string, number]> = [
    ['actor', 6],
    ['director', 2],
    ['writer', 3],
    ['craft', 2],
  ]
  const primaryWriterIds: string[] = []
  for (const [role, count] of need) {
    await page.getByTestId(`founding-tab-${role}`).click() // D-11.D: select the profession tab
    const group = page.getByTestId(`founding-group-${role}`)
    for (let i = 0; i < count; i++) {
      const sign = group.locator('button[data-testid^="founding-sign-"]').first()
      if (role === 'writer') {
        const testId = await sign.getAttribute('data-testid')
        expect(testId).toMatch(/^founding-sign-/)
        // Founding buttons identify the market offer (`talentId-termWeeks`); screenplay
        // options identify the authoritative talent. Strip only the offer-term suffix.
        primaryWriterIds.push(testId!.replace(/^founding-sign-/, '').replace(/-\d+$/, ''))
      }
      await sign.click()
    }
  }
  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()
  await expect(page.getByTestId('dash-week')).toHaveText('0')
  return primaryWriterIds
}

// Commission two scripts in parallel through the current managed authority. The opening
// Development & Casting building owns two slots, so both reach review on the same week.
async function commissionTwoScreenplays(
  page: Page,
  primaryWriterIds: readonly string[],
): Promise<string[]> {
  await page.getByTestId('assemble-film').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()
  const writerIds: string[] = []
  for (let i = 0; i < 2; i++) {
    await page.getByTestId('commission-open').click()
    const writer = page.getByTestId('script-writer')
    const availableWriterIds = await writer.locator('option').evaluateAll((options) =>
      options
        .filter((option) => !(option as HTMLOptionElement).disabled)
        .map((option) => (option as HTMLOptionElement).value),
    )
    // A multi-hyphenate actor/director/craft worker may also appear in this writing-capable
    // menu. Keep the two screenplay credits on the explicitly signed primary Writers so a
    // later package cannot engage the other ready screenplay's author in a different role.
    const writerId = availableWriterIds.find(
      (candidate) => primaryWriterIds.includes(candidate) && !writerIds.includes(candidate),
    )
    expect(
      writerId,
      `screenplay ${i + 1} should use a distinct primary Writer; signed=${JSON.stringify(primaryWriterIds)} available=${JSON.stringify(availableWriterIds)}`,
    ).toBeTruthy()
    await writer.selectOption(writerId!)
    writerIds.push(writerId!)
    await expect(page.getByTestId('commission-submit')).toBeEnabled()
    await page.getByTestId('commission-submit').click()
    // Wait for App to commit and repaint the authoritative project before opening the
    // next commission panel. Otherwise a fast synthetic click can reuse stale writer
    // availability from the preceding render.
    await expect(page.locator('[data-testid^="script-card-"]')).toHaveCount(i + 1)
  }
  await page.getByTestId('writers-room-back').click()
  await page.getByTestId('sim-to-event').click()
  await expect(page.getByTestId('period-summary')).toBeVisible()
  await page.getByTestId('period-continue').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()

  for (let i = 0; i < 2; i++) {
    const accept = page.locator('[data-testid^="script-action-acceptScript-"]').first()
    await expect(accept).toBeVisible()
    await accept.click()
  }
  await expect(page.locator('[data-testid^="script-action-openPackage-"]')).toHaveCount(2)
  return writerIds
}

// Package one accepted screenplay, choosing the first ENABLED candidate in each open
// picker. Already-engaged talent are disabled, so the second film naturally uses a
// different team. The screenplay writer is already locked by the authoritative project.
async function packageAndGreenlight(page: Page) {
  if (!(await page.getByTestId('writers-room').isVisible().catch(() => false))) {
    await page.getByTestId('assemble-film').click()
    await expect(page.getByTestId('writers-room')).toBeVisible()
  }
  await page.locator('[data-testid^="script-action-openPackage-"]').first().click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await enterPackageTalentStep(page, 'managed')
  for (const picker of ['picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
    const enabled = page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first()
    await enabled.click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click() // → review
  const greenlight = page.getByTestId('greenlight')
  await expect(greenlight).toBeEnabled()
  await greenlight.click()
  await expect(page.getByTestId('active-list')).toBeVisible()
}

// Advance weeks until the dashboard releases table shows at least `expected` rows.
// Each week either lands on the release screen (continue past it) or stays on the
// dashboard; returns the discovered productionIds in table order.
async function advanceUntilReleases(page: Page, expected: number): Promise<string[]> {
  for (let i = 0; i < 40; i++) {
    const ids = await releaseRowIds(page)
    if (ids.length >= expected) return ids
    await resolveProductionCommands(page)
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

// Managed productions pause on exact Engine-owned decisions. Resolve every currently
// visible legal command before advancing; capacity holds have no button and remain owned
// by the following authoritative week allocation.
async function resolveProductionCommands(page: Page) {
  for (let guard = 0; guard < 16; guard++) {
    const command = page.locator('button[data-testid^="production-command-"]:visible').first()
    if ((await command.count()) === 0) return
    await command.click()
  }
  await expect(page.locator('button[data-testid^="production-command-"]:visible')).toHaveCount(0)
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
  const primaryWriterIds = await foundGenerousStudio(page)

  // (2) Develop both authoritative screenplays in parallel, then accept them together.
  const screenplayWriters = await commissionTwoScreenplays(page, primaryWriterIds)
  expect(new Set(screenplayWriters).size).toBe(2)
  // (3) Package + greenlight both in the SAME week. Film A's talent are engaged
  // (disabled), so Film B's first-eligible picks are DIFFERENT people, and both retain
  // the same greenlight week (the same-week production-id uniqueness boundary).
  await packageAndGreenlight(page)
  const sharedGreenlightWeek = await page.getByTestId('dash-week').textContent()
  await packageAndGreenlight(page)
  await expect(page.getByTestId('dash-week')).toHaveText(sharedGreenlightWeek ?? '')

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
    expect(filmB[role], `Film B ${role} must differ from Film A`).not.toBe(filmA[role])
  }

  // (8) Round-trip: export the save, start a NEW game, import it, and reopen each film's
  // record. After reload there is no session snapshot, so the transient Autopsy action is
  // disabled and the durable Chronicle renders only from the film's frozen record.
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
  await expect(page.getByTestId(`autopsy-${idA}`)).toBeDisabled()
  await page.getByTestId(`chronicle-${idA}`).click()
  const recordA = await captureParticipants(page, 'record-participants', 'record-participant-name')
  await shot(page, 'c2-reload-filmA-record')
  await page.getByTestId('film-record-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  for (const role of ['lead', 'writer', 'director'] as RoleName[]) {
    expect(recordA[role], `reloaded Film A ${role} must match the live autopsy`).toBe(filmA[role])
  }

  // Film B's archived record shows Film B's cast — the identities did not cross-contaminate.
  await expect(page.getByTestId(`autopsy-${idB}`)).toBeDisabled()
  await page.getByTestId(`chronicle-${idB}`).click()
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
