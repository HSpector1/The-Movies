// ── The first picture's audition path, from a REAL founding ──────────────────
//
// THE GAP THIS CLOSES. Every other retained-audition spec injects a save fixture built
// in-spec by adapter actions (shift law 24), so all of them exercised the planner from a
// roster the fixture author chose. None drove the planner from a studio the PLAYER founds
// through the UI — and that is exactly where it was broken.
//
// The live defect: `strictCard` proved a projected candidate's name with a predicate that
// also demanded the name be unique across the WHOLE roster. Talent names are generated
// from finite pools, so duplicates are ordinary — founding seed `studio-001` produces two
// actors called "Rex Petrov". Any studio holding a duplicate name could never open the
// retained audition planner: a legal world was read as a malformed one, and the Casting
// building silently ejected the player to the full-screen Casting Room instead. Every
// suite stayed green because every fixture seed happened to avoid a collision.
//
// So this spec founds a studio at that exact seed and keeps the collision as its subject.

import { expect, test, type Page } from '@playwright/test'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'

/**
 * The SHIPPED world. The default 5178 origin is deliberately pinned to the retained plate
 * (see the quarantine note in playwright.config.ts), and the plate has no building
 * inspector at all — so a spec about what a BUILDING says must run where the buildings
 * are, exactly as `tycoon-build-mode-v1` does.
 */
const GRID_BASE_URL = 'http://localhost:5179'

/** The seed whose founding roster carries a duplicate talent name. */
const COLLIDING_SEED = 'studio-001'

test.describe.configure({ timeout: 180_000 })

/**
 * The companion rail is visually clipped until focused (it is the renderer's semantic
 * equivalent, not a visible sidebar), so it is activated the way assistive technology
 * activates it rather than by a pointer press.
 */
async function activateSemantic(page: Page, testId: string) {
  const control = page.getByTestId(testId)
  await control.focus()
  await control.press('Enter')
}

/** Found a studio through the real UI: seed, sign the minimum roster, open the doors. */
async function foundFreshStudio(page: Page, seed: string) {
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(seed)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()
  for (const [role, count] of [
    ['actor', 3],
    ['director', 1],
    ['writer', 1],
    ['craft', 1],
  ] as Array<[string, number]>) {
    await page.getByTestId(`founding-tab-${role}`).click()
    const group = page.getByTestId(`founding-group-${role}`)
    for (let signed = 0; signed < count; signed += 1) {
      await group.locator('button[data-testid^="founding-sign-"]').first().click()
    }
  }
  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

/** Commission the first screenplay in the world, let it draft, and accept the draft. */
async function reachReadyForAuditions(page: Page) {
  // In the shipped grid world a building activation lands the BUILDING, never a screen —
  // so the first screenplay is commissioned the way a player meets it: Development's own
  // "Commission a screenplay" verb, which opens the retained workspace over the world.
  await activateSemantic(page, 'lot-nav-writers')
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)

  await page.getByTestId('lot-advance-week').click()
  await expect(page.getByTestId('lot-nav-writers')).toBeVisible()

  await activateSemantic(page, 'lot-nav-writers')
  await expect(page.getByTestId('lot-script-review-panel')).toBeVisible()
  await page
    .getByTestId('lot-script-review-panel')
    .getByRole('button', { name: /^Accept / })
    .click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  await expect(page.getByTestId('lot-nav-casting-state')).toContainText('ready for auditions')
}

/** How many contracted people share the most common name on this studio's roster. */
async function largestNameCollision(page: Page): Promise<number> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    if (raw === null) throw new Error('no active session')
    const parsed = JSON.parse(raw) as { state?: { talent?: { name?: unknown }[] } }
    const talent = parsed.state?.talent
    if (!Array.isArray(talent)) throw new Error('no talent roster')
    const counts = new Map<string, number>()
    for (const person of talent) {
      const name = typeof person.name === 'string' ? person.name : ''
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return Math.max(...counts.values())
  }, ACTIVE_SESSION_KEY)
}

test('a founded studio reaches its first auditions in the world, duplicate roster names and all', async ({
  page,
}) => {
  await foundFreshStudio(page, COLLIDING_SEED)
  await reachReadyForAuditions(page)

  // THE SUBJECT. If this seed ever stops producing a duplicate name, this spec has stopped
  // covering the defect and must be re-pointed at a seed that does — not quietly relaxed.
  expect(await largestNameCollision(page)).toBeGreaterThan(1)

  await activateSemantic(page, 'lot-nav-casting')

  // The retained planner mounts OVER the live lot. Before the repair this refused and the
  // player was ejected to the full-screen Casting Room.
  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('casting-room-heading')).toHaveCount(0)
})

test('the Casting building’s own verb opens the planner when the companion rail cannot vouch for it', async ({
  page,
}) => {
  await foundFreshStudio(page, COLLIDING_SEED)
  await reachReadyForAuditions(page)

  // Move the world's attention off the review receipt so an ordinary Casting activation
  // lands the building's own panel.
  await activateSemantic(page, 'lot-nav-theater')
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()

  // FAULT INJECTION: a second node claims the companion rail's identity, so the rail's
  // uniqueness proof correctly refuses. This is the live condition in which the player
  // meets the building's panel instead of the planner, and the verb must stand on its own.
  await page.evaluate(() => {
    const decoy = document.createElement('button')
    decoy.setAttribute('data-testid', 'lot-nav-casting')
    document.body.insertBefore(decoy, document.body.firstChild)
  })

  const realCastingRow = page.locator('button:has([data-testid="lot-nav-casting-state"])')
  await realCastingRow.focus()
  await realCastingRow.press('Enter')
  await expect(page.getByTestId('lot-building-inspector-casting')).toBeVisible()
  await expect(page.getByTestId('lot-audition-workspace')).toHaveCount(0)

  const verb = page.getByTestId('lot-building-inspector-primary-plan-auditions')
  await expect(verb).toBeVisible()
  await expect(verb).toHaveAttribute('aria-label', /^Plan auditions for .+/)
  await verb.click()

  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('casting-room-heading')).toHaveCount(0)
})
