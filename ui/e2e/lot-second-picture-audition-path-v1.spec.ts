// ── THE STUDIO'S SECOND PICTURE PLANS ITS AUDITIONS TOO ──────────────────────
//
// THE DEFECT THIS CLOSES. The retained audition planner worked exactly ONCE per studio.
// `strictContextForState` (ui/src/lot/snapshot/auditionPlanning.ts) required
// `state.castingSessions.sessions.length === 0` and an empty `history` section, and
// `castingSessions.sessions` is APPEND-ONLY (src/core/castingSessions.ts:315) — so from a
// studio's first camera test onward the strict context refused every world it would ever
// be in again. Picture #2's "Plan auditions" fell through to the full-screen Casting Room
// from the guidance card, the Casting building's own verb and the companion rail alike:
// the player was ejected out of the world at exactly the step the whole campaign exists to
// keep inside it.
//
// It is the same class of over-strict world-rejection as the Wave-2 duplicate-name defect,
// left behind in the sibling clauses — and, exactly like that one, invisible to every
// vitest-level proof and to every existing browser spec, because all of them plan the
// FIRST session of a fresh studio and stop.
//
// So this spec plays the only shape of world that could catch it: a studio that has
// already RELEASED a picture. Founding, the whole first film through to its release, then
// a second screenplay, and the assertion that Casting still opens its planner over the
// live lot. Against the unfixed tree the final step mounts the Casting Room instead and
// this fails.
//
// Founding, semantic activation, the grid origin, the slate and the package helpers follow
// the house patterns of `lot-founded-audition-path-v1` and `first-movie-golden-path-v1`;
// they are duplicated here so this spec cannot break its neighbours.

import { expect, test, type ElementHandle, type Page } from '@playwright/test'

/**
 * The SHIPPED world. The default 5178 origin is pinned to the retained plate (see the
 * quarantine note in `playwright.config.ts`), which has no building inspector at all — so a
 * journey a player actually walks has to be walked where the buildings are.
 */
const GRID_BASE_URL = 'http://localhost:5179'

/** The same deterministic founding seed the rest of this campaign's specs use. */
const SEED = 'studio-001'

/** A whole picture from founding to release, then a second screenplay, in one browser. */
test.describe.configure({ timeout: 600_000 })

type WorldIdentity = {
  screen: ElementHandle<Node>
  canvas: ElementHandle<Node>
}

async function captureWorld(page: Page): Promise<WorldIdentity> {
  const screen = await page.getByTestId('studio-lot-screen').elementHandle()
  const canvas = await page.getByTestId('studio-lot-canvas').locator('canvas').elementHandle()
  if (screen === null || canvas === null) throw new Error('the live lot is not mounted')
  return { screen, canvas }
}

/** The lot on screen is the SAME lot the studio booted with, not a remount that resembles it. */
async function expectSameLot(page: Page, world: WorldIdentity, label: string) {
  expect(
    await world.screen.evaluate(
      (node) =>
        node.isConnected && document.querySelector('[data-testid="studio-lot-screen"]') === node,
    ),
    `${label}: the live Lot is still the mounted screen`,
  ).toBe(true)
  expect(
    await world.canvas.evaluate(
      (node) =>
        node.isConnected &&
        document.querySelector('[data-testid="studio-lot-canvas"] canvas') === node,
    ),
    `${label}: the live world canvas was never torn down`,
  ).toBe(true)
}

function guidanceCard(page: Page) {
  return {
    eyebrow: page.getByTestId('lot-picture-guidance-eyebrow'),
    title: page.getByTestId('lot-picture-guidance-title'),
    headline: page.getByTestId('lot-picture-guidance-headline'),
    detail: page.getByTestId('lot-picture-guidance-detail'),
    next: page.getByTestId('lot-picture-guidance-next'),
  }
}

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
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
}

/**
 * Commission a screenplay from Development's own verb and accept the draft it produces.
 * Returns the picture's title, which is how the player knows it from here on.
 */
async function commissionAndAccept(page: Page): Promise<string> {
  const card = guidanceCard(page)
  await expect(card.next).toHaveText('Commission a screenplay at Development')
  await card.next.click()
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await page.getByTestId('commission-submit').click()

  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  const title = ((await witness.getByRole('heading', { level: 3 }).textContent()) ?? '').trim()
  expect(title, 'the picture is a named identity from commission onward').not.toBe('')

  await page.getByTestId('lot-advance-week').click()
  await expect(card.next).toHaveText('Review the screenplay at Development')
  await card.next.click()
  const review = page.getByTestId('lot-script-review-panel')
  await expect(review).toBeVisible()
  await review.getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  return title
}

/** Two reads per role from a three-actor roster — the smallest legal slate. */
async function selectLegalSlate(page: Page): Promise<void> {
  const actorIds = await page
    .getByTestId('casting-slate-lead')
    .locator('button[data-testid^="casting-candidate-lead-"]:not([disabled])')
    .evaluateAll((nodes) =>
      nodes
        .slice(0, 3)
        .map((node) => node.getAttribute('data-testid')!.replace(/^casting-candidate-lead-/, '')),
    )
  expect(actorIds, 'a founded roster fields three actors').toHaveLength(3)
  const slate: Record<'lead' | 'antagonist' | 'support', [string, string]> = {
    lead: [actorIds[0]!, actorIds[1]!],
    antagonist: [actorIds[0]!, actorIds[1]!],
    support: [actorIds[0]!, actorIds[2]!],
  }
  for (const [role, ids] of Object.entries(slate) as Array<
    ['lead' | 'antagonist' | 'support', [string, string]]
  >) {
    for (const id of ids) {
      const candidate = page.getByTestId(`casting-candidate-${role}-${id}`)
      await candidate.scrollIntoViewIfNeeded()
      await candidate.click()
      await expect(candidate).toHaveAttribute('aria-pressed', 'true')
    }
  }
}

async function chooseFirstEligible(page: Page, pickerTestId: string): Promise<void> {
  const button = page
    .getByTestId(pickerTestId)
    .locator('button[aria-pressed]:not([disabled])')
    .first()
  await button.scrollIntoViewIfNeeded()
  await expect(button).toBeVisible()
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
}

/**
 * Run the picture's camera tests, take the results to the package, and greenlight it.
 * Everything here is the accepted golden path; this spec only needs it to have HAPPENED.
 */
async function auditionPackageAndGreenlight(page: Page): Promise<void> {
  const card = guidanceCard(page)
  await expect(card.next).toHaveText('Plan auditions at Casting')
  await card.next.click()
  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await selectLegalSlate(page)
  await page.getByTestId('casting-start').click()
  await expect(page.getByTestId('lot-audition-planning-witness')).toBeVisible()

  await page.getByTestId('lot-advance-week').click()
  await expect(card.next).toHaveText('Review audition results at Casting')
  await card.next.click()
  const castingReview = page.getByTestId('lot-casting-review-panel')
  await expect(castingReview).toBeVisible()
  await castingReview
    .locator('[data-testid^="lot-casting-review-action-acknowledgeCastingSession-"]')
    .click()

  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  for (const picker of [
    'picker-director',
    'picker-lead',
    'picker-antagonist',
    'picker-support',
    'picker-craft',
  ]) {
    await chooseFirstEligible(page, picker)
  }
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-budget')).toHaveClass(/active/)
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-review')).toHaveClass(/active/)
  const greenlight = page.getByTestId('greenlight')
  await expect(greenlight).toBeEnabled()
  await greenlight.click()
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveText(
    'PICTURE FORMED',
  )
}

/**
 * Run the greenlit picture out to its release, answering each shooting decision on the
 * object the world flags — the loop the Owner's own playtest walks. Deliberately written
 * as a state machine rather than a fixed script of weeks: this spec is about what happens
 * AFTER the release, and must not become a second pin on the production schedule.
 */
async function runPictureToRelease(page: Page): Promise<void> {
  /**
   * Every control that IS a production command, wherever the world put it: the stage's own
   * panel and the flagged object's context use different testid families, and which one
   * answers depends on which beat the picture is on (the director call is offered on the
   * Studio Desk's blocker, the scenery load-in on the Scenery & Service ground).
   */
  const anyCommand = page.locator(
    '[data-testid^="hollywood-production-command-"], [data-testid^="lot-building-inspector-command-"]',
  )

  for (let step = 0; step < 40; step += 1) {
    if ((await page.getByTestId('newspaper-continue').count()) > 0) {
      await page.getByTestId('newspaper-continue').click()
      continue
    }
    if ((await page.getByTestId('release-continue').count()) > 0) return

    if ((await anyCommand.count()) > 0) {
      const command = anyCommand.first()
      // Resolving one beat often reveals the NEXT one on the same surface, so progress is
      // proven against the exact control that was pressed, not against its whole family.
      const pressed = await command.getAttribute('data-testid')
      await command.click()
      await expect(page.locator(`[data-testid="${pressed!}"]`)).toHaveCount(0)
      continue
    }

    // The picture's own card names the verb and lands the object that owns it — the
    // campaign's own affordance, and the one that works for every shooting beat.
    if ((await page.getByTestId('lot-picture-guidance-blocked').count()) > 0) {
      await page.getByTestId('lot-picture-guidance-next').click()
      await expect(anyCommand.first()).toBeVisible()
      continue
    }

    const blocker = page.getByTestId('hollywood-production-blocker')
    if ((await blocker.count()) > 0) {
      await blocker.click()
      await expect(anyCommand.first()).toBeVisible()
      continue
    }

    const sim = page.getByTestId('lot-sim-to-next-event')
    const advance = page.getByTestId('lot-advance-week')
    const control =
      (await sim.count()) > 0 && (await sim.isEnabled())
        ? sim
        : (await advance.count()) > 0 && (await advance.isEnabled())
          ? advance
          : null
    if (control === null) throw new Error('the studio offered no way forward')
    const before = (await page.locator('.lot-sub').textContent()) ?? ''
    await control.click()
    await page.waitForFunction(
      (previous) => {
        if (document.querySelector('[data-testid="hollywood-production-blocker"]') !== null) {
          return true
        }
        if (document.querySelector('[data-testid="studio-lot-screen"]') === null) return true
        return (document.querySelector('.lot-sub')?.textContent ?? '') !== previous
      },
      before,
      { timeout: 60_000 },
    )
  }
  throw new Error('the first picture never reached release')
}

test('a studio that has already released a picture still plans its next picture’s auditions in the world', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))

  // ── 1. THE FIRST PICTURE, all the way to the theater ──────────────────────
  await foundFreshStudio(page, SEED)
  const firstTitle = await commissionAndAccept(page)
  await auditionPackageAndGreenlight(page)
  await runPictureToRelease(page)

  // The studio's first picture has RELEASED: the week's releases own the screen, and the
  // finished camera test is now permanent history on the studio's books.
  await expect(page.getByTestId('release-list')).toContainText(firstTitle)
  await page.getByTestId('release-continue').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  // ── 2. BACK ON THE LOT — the desk asks for the NEXT picture ───────────────
  //
  // The week's releases legitimately own the screen for one beat, so the lot the second
  // picture is planned from is a fresh mount. THAT lot is the one every step from here has
  // to leave standing.
  const world = await captureWorld(page)
  const card = guidanceCard(page)
  await expect(card.eyebrow).toContainText('YOUR NEXT PICTURE')
  await expect(card.headline).toHaveText('In release')
  await expect(card.next).toHaveText('Commission a screenplay at Development')

  // ── 3. THE SECOND SCREENPLAY, commissioned and accepted the same way ──────
  const secondTitle = await commissionAndAccept(page)
  expect(secondTitle).not.toBe(firstTitle)

  // ── 4. THE STEP THAT USED TO EJECT THE PLAYER ────────────────────────────
  //
  // The studio now holds one completed casting session. Before the repair, the strict
  // planner context read that as a malformed world and refused, and this click landed the
  // full-screen Casting Room with the lot gone.
  await expect(card.title).toHaveText(secondTitle)
  await expect(card.next).toHaveText('Plan auditions at Casting')
  await card.next.click()

  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  await expect(page.getByTestId('casting-room-heading')).toHaveCount(0)
  await expect(page.getByTestId('casting-room')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  // …over the SAME live lot the studio was founded on, still mounted behind it.
  await expectSameLot(page, world, 'second picture’s planner')

  // …and it plans a real second session: the slate can be filled and started in the world.
  await selectLegalSlate(page)
  const start = page.getByTestId('casting-start')
  await expect(start).toHaveText('Start one-week auditions')
  await expect(start).toBeEnabled()
  await start.click()
  const receipt = page.getByTestId('lot-audition-planning-witness')
  await expect(receipt).toBeVisible()
  await expect(receipt.getByTestId('lot-audition-planning-reads').getByRole('listitem'))
    .toHaveCount(6)
  await expectSameLot(page, world, 'second picture’s camera tests underway')

  expect(pageErrors, pageErrors.join('\n')).toEqual([])
})
