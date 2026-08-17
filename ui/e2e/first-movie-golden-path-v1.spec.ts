// ── THE FIRST MOVIE, END TO END, AS A NEW PLAYER MEETS IT ────────────────────
//
// The controlling acceptance test of the first-movie-journey campaign (Wave 4 / M-E).
//
// Every other browser spec in this suite proves one seam. This one proves the JOURNEY:
// a studio founded through the real founding UI on the shipped grid origin reaches its
// FIRST FILM GREENLIT — and then its first day of shooting — driven by the guidance card
// and the buildings themselves: no injected save fixture, no repository knowledge, no
// deep management screen, and no route change at any point. If a player would have had to
// guess, this fails.
//
// The chain, in the order a new player walks it: found → Week 0 "commission a screenplay
// at Development" → the Development inspector's own verb → the retained commission
// workspace → drafting → script review → ready to package → the retained audition planner
// → camera tests → audition review → the retained Package workspace → GREENLIGHT → the
// first shooting decision, answered on the object the world flagged.
//
// TWO THINGS ARE ASSERTED AT EVERY STAGE, because the campaign's thesis is that they
// must agree:
//   • the CARD  — the picture's name, where it stands, and the ONE imperative next step,
//     in the exact words the tree ships (engine-owned copy, rendered verbatim);
//   • the WORLD — `data-guidance-target` on `.lot-stage-wrap`, the building signs, the
//     red decision badge, the blocked "Sim to next event", and above all that the LIVE
//     LOT IS STILL THE MOUNTED SCREEN — the same DOM node and the same canvas node the
//     studio booted with. A step that ejects to a full-screen route fails this spec.
//
// Copy is asserted by exact string on purpose. The strings ARE the product here: the
// Owner's FAIL was "I am still confused about how to get a script made"; a test that
// matched them loosely would let the answer rot back into jargon without going red.
//
// Founding pattern, semantic activation and the grid origin follow the house patterns of
// `lot-founded-audition-path-v1.spec.ts`; the slate and package helpers are duplicated
// here (small, and this spec must not be able to break its neighbours).

import { expect, test, type ElementHandle, type Page } from '@playwright/test'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'

/**
 * The SHIPPED world. The default 5178 origin is pinned to the retained plate (see the
 * quarantine note in `playwright.config.ts`), and the plate has no building inspector at
 * all — so the journey a player actually walks has to be walked where the buildings are.
 */
const GRID_BASE_URL = 'http://localhost:5179'

/**
 * One deterministic founding seed, and deliberately the seed whose roster carries a
 * duplicate talent name (two actors called "Rex Petrov") — the condition that made the
 * retained audition planner unreachable for the whole life of the feature. The golden
 * path is walked on a studio that would have failed before Wave 2, not on a tidy one.
 */
const SEED = 'studio-001'

/** Founding plus six studio weeks through a real renderer is not a 30-second test. */
test.describe.configure({ timeout: 300_000 })

// ── the world, and the proof that it never went away ─────────────────────────

type WorldIdentity = {
  screen: ElementHandle<Node>
  canvas: ElementHandle<Node>
}

/**
 * Full-screen management routes. Each of these mounting means the player was EJECTED out
 * of the lot — the exact seam ("the world goes silent and you must gamble on the only
 * unexplained button") this campaign exists to close.
 */
const ROUTE_EJECTION_TESTIDS = [
  'dash-week', // the Dashboard
  'writers-room', // the full-screen Writers' Room
  'casting-room', // the full-screen Casting Room
  'casting-room-heading',
  'assembly-back-dashboard', // standalone Assembly chrome (never the retained workspace)
] as const

async function captureWorld(page: Page): Promise<WorldIdentity> {
  const screen = await page.getByTestId('studio-lot-screen').elementHandle()
  const canvas = await page.getByTestId('studio-lot-canvas').locator('canvas').elementHandle()
  if (screen === null || canvas === null) throw new Error('the live lot is not mounted')
  return { screen, canvas }
}

/**
 * The lot the studio booted with is STILL the lot on screen — the same DOM node and the
 * same canvas node, not a remount that merely looks the same — and no full-screen route
 * has taken the player anywhere. Called after every move in the chain.
 */
async function expectStillInTheWorld(page: Page, world: WorldIdentity, label: string) {
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
  for (const testId of ROUTE_EJECTION_TESTIDS) {
    await expect(page.getByTestId(testId), `${label}: ${testId} must not be mounted`).toHaveCount(0)
  }
}

/** Where the world is currently pointing, straight off the DOM. 'none' is an answer. */
async function guidanceTarget(page: Page): Promise<string | null> {
  return page.locator('.lot-stage-wrap').getAttribute('data-guidance-target')
}

function guidanceCard(page: Page) {
  return {
    eyebrow: page.getByTestId('lot-picture-guidance-eyebrow'),
    title: page.getByTestId('lot-picture-guidance-title'),
    headline: page.getByTestId('lot-picture-guidance-headline'),
    detail: page.getByTestId('lot-picture-guidance-detail'),
    waiting: page.getByTestId('lot-picture-guidance-waiting'),
    status: page.getByTestId('lot-picture-guidance-status'),
    next: page.getByTestId('lot-picture-guidance-next'),
  }
}

/**
 * The card is WAITING, and says so exactly once.
 *
 * A live playtest found this desk stacking two near-identical sentences that named the
 * same week three times. One quiet line, and no second "Waiting — advance the week"
 * status under it, is the shipped answer.
 */
async function expectOneWaitingLine(page: Page, line: string) {
  const card = guidanceCard(page)
  await expect(card.waiting).toHaveCount(1)
  await expect(card.waiting).toHaveText(line)
  await expect(card.status).toHaveCount(0)
  await expect(card.next).toHaveCount(0)
}

function watchRuntime(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  return { pageErrors, consoleErrors }
}

// ── founding, through the real UI ────────────────────────────────────────────

/** Found a studio the way a new player does: seed, sign the minimum roster, open up. */
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
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

/**
 * The one contracted writer on the founded roster, read from the studio's own save.
 *
 * The cold playtest's trap default: the commission form listed the whole roster and
 * defaulted to an ACTOR with writing Est. 15 while the actual writer sat last. The
 * expectation is therefore computed from truth — never from the form being asserted.
 */
async function contractedWriter(page: Page): Promise<{ id: string; name: string }> {
  const writer = await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    if (raw === null) throw new Error('no active session')
    const parsed = JSON.parse(raw) as {
      state?: {
        talent?: { id: string; name: string; role: string }[]
        contracts?: { talentId: string }[]
      }
    }
    const talent = parsed.state?.talent ?? []
    const signed = new Set((parsed.state?.contracts ?? []).map((contract) => contract.talentId))
    const writers = talent.filter((person) => signed.has(person.id) && person.role === 'writer')
    return writers.length === 1 ? { id: writers[0]!.id, name: writers[0]!.name } : null
  }, ACTIVE_SESSION_KEY)
  if (writer === null) throw new Error('the founded roster does not hold exactly one writer')
  return writer
}

// ── the retained audition planner's slate ────────────────────────────────────

/**
 * Two reads per role from a three-actor founding roster — the smallest legal slate a
 * brand-new studio can field, and exactly what the founding pool affords.
 */
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
    await expect(page.getByTestId(`casting-selection-count-${role}`)).toHaveText('2 of 2 selected')
  }
  await expect(page.getByTestId('casting-unique-count')).toContainText(
    '3 different actors selected',
  )
}

// ── the package stepper ──────────────────────────────────────────────────────

/**
 * Fill one package slot with the first candidate the picker offers, and prove the card is
 * a NAMED control while doing it (the cold playtest found these were unnamed buttons
 * whose computed name was the whole flattened card and never said which role it filled).
 */
async function chooseFirstEligible(
  page: Page,
  pickerTestId: string,
  roleTitle: string,
): Promise<string> {
  const button = page
    .getByTestId(pickerTestId)
    .locator('button[aria-pressed]:not([disabled])')
    .first()
  await button.scrollIntoViewIfNeeded()
  await expect(button).toBeVisible()
  const accessibleName = (await button.getAttribute('aria-label')) ?? ''
  expect(accessibleName, `${pickerTestId} candidate is a named control`).toMatch(/^Select \S/)
  expect(
    accessibleName.endsWith(` for ${roleTitle}`),
    `${pickerTestId} candidate names its role: ${accessibleName}`,
  ).toBe(true)
  const testId = await button.getAttribute('data-testid')
  expect(testId).toMatch(/^talent-/)
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  return testId!.replace(/^talent-/, '')
}

// ── THE GOLDEN PATH ──────────────────────────────────────────────────────────

test('a brand-new studio reaches its first greenlight, and its first day of shooting, without ever leaving the lot', async ({
  page,
}) => {
  const runtime = watchRuntime(page)

  // ── 1. FOUND THE STUDIO, through the founding flow's own buttons ───────────
  await foundFreshStudio(page, SEED)
  const world = await captureWorld(page)
  await expectStillInTheWorld(page, world, 'founded')

  const card = guidanceCard(page)

  // ── 2. WEEK 0 — the desk names the first picture and the first verb ────────
  //
  // The Owner's FAIL was this exact frame: the desk used to read "No active production /
  // The studio lot is idle. Assemble a film to begin production." with nothing clickable
  // and nothing pointing at Development.
  await expect(card.eyebrow).toContainText('YOUR FIRST PICTURE')
  await expect(card.title).toHaveText('No picture yet')
  await expect(card.headline).toHaveText('No screenplay')
  await expect(card.detail).toHaveText(
    'The studio has no picture in the works. Every picture starts with a screenplay.',
  )
  await expect(page.getByTestId('lot-picture-guidance')).toHaveAttribute(
    'data-guidance-stage',
    'no-picture',
  )
  await expect(card.next).toHaveText('Commission a screenplay at Development')
  // …and the WORLD is pointing at the same building the card just named.
  expect(await guidanceTarget(page)).toBe('writers')

  // ── 3. THE FIRST STEP LANDS IN THE WORLD, not on a screen ─────────────────
  await card.next.click()
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await expectStillInTheWorld(page, world, 'guidance opened Development')

  // The building answers "what can I do here right now" with the verb the card named.
  const commission = page.getByTestId('lot-building-inspector-primary-commission')
  await expect(commission).toHaveText('Commission a screenplay')
  await commission.click()

  // The retained workspace mounts OVER the live world, which stays mounted and inert.
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toHaveJSProperty('inert', true)
  await expectStillInTheWorld(page, world, 'commission workspace over the world')

  // THE TRAP DEFAULT IS DEAD: the form opens on the roster's actual writer.
  const writer = await contractedWriter(page)
  const chosenWriter = await page.getByTestId('script-writer').evaluate((node) => {
    const select = node as HTMLSelectElement
    return { value: select.value, label: select.selectedOptions[0]?.textContent ?? '' }
  })
  expect(chosenWriter.value, 'the Contracted writer default').toBe(writer.id)
  expect(chosenWriter.label).toContain(writer.name)

  await page.getByTestId('commission-submit').click()
  const commissionWitness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(commissionWitness).toBeVisible()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  const title = ((await commissionWitness.getByRole('heading', { level: 3 }).textContent()) ?? '')
    .trim()
  expect(title, 'the picture is now a named identity').not.toBe('')
  await expectStillInTheWorld(page, world, 'commissioned')

  // ── 4. DRAFTING — the picture has a name, a writer, and one quiet wait ─────
  await expect(card.title).toHaveText(title)
  await expect(card.headline).toHaveText('Screenplay — drafting')
  await expect(card.detail).toHaveText(`Writer: ${writer.name} · Due Week 1`)
  await expectOneWaitingLine(page, 'The draft is due Week 1 — advance the week.')
  // Nothing is lit: the answer to a wait is the week control on the studio bar, which is
  // not a building — lighting one would point at something that cannot help.
  expect(await guidanceTarget(page)).toBe('none')

  // ── 5. THE DRAFT LANDS — a decision the studio cannot sim past ─────────────
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 1$/)

  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  await expect(page.getByTestId('lot-sim-to-next-event')).toBeDisabled()
  await expect(page.getByTestId('lot-next-event-disabled-reason')).toHaveText(
    `Select Development and review ${title} in the live Studio Lot before simming to another event.`,
  )
  await expect(card.headline).toHaveText('Script review ready')
  await expect(card.detail).toHaveText(`Writer: ${writer.name} · The first draft is in`)
  // The red badge owns this building outright; the marker stands down (one attention
  // system per building).
  expect(await guidanceTarget(page)).toBe('none')

  await expect(card.next).toHaveText('Review the screenplay at Development')
  await card.next.click()
  const scriptReview = page.getByTestId('lot-script-review-panel')
  await expect(scriptReview).toBeVisible()
  await expectStillInTheWorld(page, world, 'script review in the world')

  await scriptReview.getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()
  await expectStillInTheWorld(page, world, 'first draft accepted')

  // ── 6. READY TO PACKAGE — the sign and the card name the same next step ────
  await expect(page.getByTestId('lot-nav-casting-state')).toContainText('ready for auditions')
  await expect(card.headline).toHaveText('Screenplay accepted')
  // The detail names ONLY what this state offers. The package alternative it used to
  // advertise has no control anywhere on this stage's surfaces — Casting's verb opens the
  // audition planner — so naming it sent the player hunting for a button that is not there.
  await expect(card.detail).toHaveText(
    `Writer: ${writer.name} · Auditions show you who can carry the picture`,
  )
  await expect(card.next).toHaveText('Plan auditions at Casting')
  expect(await guidanceTarget(page)).toBe('casting')

  // ── 7. THE AUDITIONS, planned over the live lot ───────────────────────────
  await card.next.click()
  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await expect(page.getByTestId('casting-planner')).toBeVisible()
  await expectStillInTheWorld(page, world, 'retained planner over the world')

  await selectLegalSlate(page)
  const start = page.getByTestId('casting-start')
  await expect(start).toHaveText('Start one-week auditions')
  await expect(start).toBeEnabled()
  await start.click()

  // Starting auditions hands the player back to the STUDIO with a receipt, not to a
  // management screen they then have to escape.
  const receipt = page.getByTestId('lot-audition-planning-witness')
  await expect(receipt).toBeVisible()
  await expect(page.getByTestId('lot-audition-workspace')).toHaveCount(0)
  await expect(receipt.getByTestId('lot-audition-planning-reads').getByRole('listitem'))
    .toHaveCount(6)
  await expectStillInTheWorld(page, world, 'camera tests underway')

  await expect(card.headline).toHaveText('Auditions underway')
  await expect(card.detail).toHaveText('Camera tests are running at Casting · Results due Week 2')
  await expectOneWaitingLine(page, 'The camera tests finish in Week 2 — advance the week.')
  expect(await guidanceTarget(page)).toBe('none')

  // ── 8. THE RESULTS COME IN, and chain straight to the package ─────────────
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 2$/)

  await expect(page.getByTestId('lot-nav-casting')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  await expect(page.getByTestId('lot-sim-to-next-event')).toBeDisabled()
  await expect(card.headline).toHaveText('Audition results ready')
  // The detail leads with the RESULTS, not with stale writer context.
  await expect(card.detail).toHaveText('The camera tests are in — 6 reads are waiting at Casting')
  await expect(card.next).toHaveText('Review audition results at Casting')
  await card.next.click()

  const castingReview = page.getByTestId('lot-casting-review-panel')
  await expect(castingReview).toBeVisible()
  await expect(castingReview.locator('[data-testid^="lot-casting-review-row-"]')).toHaveCount(6)
  await expectStillInTheWorld(page, world, 'audition results in the world')

  const toPackage = castingReview.locator(
    '[data-testid^="lot-casting-review-action-acknowledgeCastingSession-"]',
  )
  await expect(toPackage).toHaveText('Take results to Package')
  await toPackage.click()

  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('assembly-surface')).toHaveAttribute('data-surface', 'lot-workspace')
  await expectStillInTheWorld(page, world, 'retained package over the world')

  // ── 9. THE PACKAGE, completed and greenlit ────────────────────────────────
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)
  const directorId = await chooseFirstEligible(page, 'picker-director', 'Director')
  const leadId = await chooseFirstEligible(page, 'picker-lead', 'Lead')
  await chooseFirstEligible(page, 'picker-antagonist', 'Antagonist')
  await chooseFirstEligible(page, 'picker-support', 'Support')
  await chooseFirstEligible(page, 'picker-craft', 'Production/Craft Lead (required)')
  expect(leadId).not.toBe(directorId)

  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-budget')).toHaveClass(/active/)
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-review')).toHaveClass(/active/)

  const greenlight = page.getByTestId('greenlight')
  await expect(greenlight).toHaveText('Greenlight this film')
  await expect(greenlight).toBeEnabled()
  await greenlight.click()

  // ── 10. FIRST FILM GREENLIT — the picture becomes a world object ──────────
  await expect(page.getByTestId('hollywood-production-formation-witness')).toBeVisible()
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveText(
    'PICTURE FORMED',
  )
  await expect(page.getByTestId('lot-package-workspace')).toHaveCount(0)
  await expectStillInTheWorld(page, world, 'greenlit')

  // The production card now owns the desk, with the picture's own facts on it.
  const production = page.getByTestId('hollywood-current-production')
  await expect(production).toContainText(title)
  expect(await production.locator('dt').allTextContents()).toEqual(
    expect.arrayContaining(['Phase', 'Production facilities', 'Weeks left', 'Director', 'Lead']),
  )
  // …and the guidance card has handed the slot over, so nothing on the property is lit.
  await expect(page.getByTestId('lot-picture-guidance')).toHaveCount(0)
  expect(await guidanceTarget(page)).toBe('none')

  // The roster chips grew role captions: every person now says what they are ON THIS
  // PICTURE, which is the whole point of a film that is a persistent world object.
  const directorChip = page.getByTestId(`hollywood-select-person-${directorId}`)
  await expect(directorChip).toHaveAttribute('data-production-role', 'director')
  await expect(directorChip).toContainText(`Director · ${title}`)
  const leadChip = page.getByTestId(`hollywood-select-person-${leadId}`)
  await expect(leadChip).toHaveAttribute('data-production-role', 'lead')
  await expect(leadChip).toContainText(`Lead actor · ${title}`)
  const directorName = ((await directorChip.locator('span').first().textContent()) ?? '').trim()
  expect(directorName).not.toBe('')

  // ── 11. THE FIRST SHOOTING BEAT, answered on the object the world flagged ──
  //
  // Post-greenlight the game already had the loop this whole campaign rebuilt the
  // pre-greenlight chain to match: world attention → click the flagged object → world
  // verb → resolution → watch the world change. One full turn of it here is what makes
  // this the whole journey rather than the half of it that ends at the greenlight.
  const simNext = page.getByTestId('lot-sim-to-next-event')
  await expect(simNext).toBeEnabled()
  await simNext.focus()
  await simNext.press('Space')

  // The studio runs itself through development, pre-production and rehearsal, and then
  // stops dead the week the picture needs its director on the floor — naming the picture,
  // the problem and the place, with the week control still available.
  await expect(page.locator('.lot-sub')).toHaveText(/Week 6$/)
  const blocker = page.getByTestId('hollywood-production-blocker')
  await expect(blocker).toBeVisible()
  await expect(blocker).toContainText('Director call required')
  await expect(blocker).toContainText(
    `${directorName} is locked to the picture but has not been dispatched to Soundstage 7.`,
  )
  await expect(page.getByTestId('lot-nav-stage-a')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  await expect(page.getByTestId('lot-sim-to-next-event')).toBeDisabled()
  await expect(page.getByTestId('lot-next-event-disabled-reason')).toHaveText(
    `${title} — Director call required at Soundstage 7 + Scenery Shop. Resolve this production problem before simming to another event.`,
  )
  await expectStillInTheWorld(page, world, 'first shooting decision')

  // The verb lives on the object the attention points at: press the flagged problem and
  // the soundstage's own panel offers the call.
  await blocker.click()
  const callDirector = page.getByTestId('hollywood-production-command-assignShootingDirector')
  await expect(callDirector).toBeVisible()
  await expect(callDirector).toHaveText(`Call ${directorName} to Soundstage 7`)
  await callDirector.click()

  // Resolved — and the world does not go quiet: the next physical beat is already flagged
  // on the building that owns it, and the picture's card names its verb.
  await expect(page.getByTestId('hollywood-production-command-assignShootingDirector'))
    .toHaveCount(0)
  await expect(page.getByTestId('lot-nav-service-yard')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  await expect(page.getByTestId('lot-next-event-disabled-reason')).toHaveText(
    `${title} — Scenery load-in blocking camera at Soundstage 7 + Scenery Shop. Resolve this production problem before simming to another event.`,
  )
  await expect(card.headline).toHaveText('Shooting')
  await expect(card.detail).toHaveText(`Director: ${directorName} · 5 weeks of work remain`)
  await expect(page.getByTestId('lot-picture-guidance-blocked')).toContainText(
    'A scenery load-in is blocking the camera.',
  )
  await expect(card.next).toHaveText('Clear the scenery load-in at the soundstage')
  expect(await guidanceTarget(page)).toBe('none')
  await expectStillInTheWorld(page, world, 'shooting decision resolved')

  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})
