// ── MUTED + REDUCED MOTION = TODAY'S GAME (PF1 red-team, M4) ─────────────────
//
// The charter's DONE §13.4 says it plainly: "a muted, reduced-motion session is exactly
// today's game." §8 asks the red team to prove it "by the §7 DOM-snapshot baseline plus
// adversarial judgment (no punctuation leaks through either axis); reduced-motion users
// still get the information visually; muted users still get it visually."
//
// This spec drives the SHIPPED GRID ORIGIN (5179) through a real first-picture slice —
// found → commission → advance → script review → accept → advance — with the player's own
// preferences seeded to `muted` + `motion: 'reduced'` BEFORE the app boots, and asserts
// the two axes mechanically:
//
//   MOTION  — `data-motion="reduced"` is published on the document element; every
//             punctuation-touched element computes `animation-name: none`; the cash
//             count-up overlay is never created at all (not "created and hidden").
//   SOUND   — every request the page makes for `/audio/**` is recorded through a route
//             interceptor, and no CUE asset is ever fetched.
//
//   STRUCTURE — the renderer's own telemetry tuple is captured at rest and again across a
//             punctuated moment. Punctuation lives in DOM chrome over the canvas
//             (charter §5-M2's world-emphasis fence), so a moving tuple is a defect.
//
// ───────────────────────────────────────────────────────────────────────────────
// AUTHORED BY OPUS-REDTEAM. PF1-M4 FIX WAVE (OPUS-FIX) repaired it in two places and
// still has NOT run it — the Playwright lease belongs to the PM.
//   1. The FINDING assertion (a muted session downloading its beds) is retired: the
//      service now starts no loop while muted, so the charter-intent assertion —
//      `expect(audioRequests).toEqual([])` — is the one that ships.
//   2. The structural telemetry node is DEV-REVIEW CHROME, gated behind the
//      identity-proof flag (`StudioLotScreen.tsx`: `{identityProof && hollywoodPerf && …}`).
//      This spec founded through the UI without setting it, so `hollywood-performance`
//      never existed and `structure()` waited for a node that was never coming. Every
//      other structural spec seeds that flag; this one now does too, through the same
//      init-script idiom, and waits out the renderer's warm-up window before its first
//      read exactly as `tycoon-build-mode-v1.spec.ts` does. No assertion was relaxed.
// ───────────────────────────────────────────────────────────────────────────────
//
// House patterns copied deliberately, so this spec breaks nothing and surprises nobody:
// the grid origin constant and the founding flow from `first-movie-golden-path-v1.spec.ts`,
// the `structure()` telemetry reader and its flag/settle idiom from
// `tycoon-build-mode-v1.spec.ts`.

import { expect, test, type Page } from '@playwright/test'

/** The SHIPPED world (see the quarantine note in `playwright.config.ts`). */
const GRID_BASE_URL = 'http://localhost:5179'

/** The single versioned preferences key (`ui/src/prefs.ts`). */
const PREFS_KEY = 'project-studio.prefs.v1'

/**
 * The renderer telemetry panel is dev-review chrome and ships behind this flag
 * (`ui/src/flags.ts`). Every structural spec seeds it; without it the
 * `hollywood-performance` node simply never mounts.
 */
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** The same deterministic founding seed the golden path walks. */
const SEED = 'studio-001'

/** Longer than both punctuation ceilings (emphasis 320ms, held-beat 600ms) plus slack. */
const PAST_EVERY_ANIMATION_MS = 900

test.describe.configure({ timeout: 300_000 })

// ── the preferences a hostile-to-motion, hostile-to-sound player would have ───

const MUTED_REDUCED_PREFS = {
  version: 1,
  volumes: { master: 0.8, music: 0.5, ambience: 0.6, effects: 0.7 },
  muted: true,
  motion: 'reduced',
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** The renderer's own structural telemetry — the law-25 tuple, read off the DOM. */
async function structure(page: Page) {
  return page.getByTestId('hollywood-performance').evaluate((node) => ({
    displayObjects: Number(node.getAttribute('data-display-objects')),
    dynamicActors: Number(node.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(node.getAttribute('data-decoded-bytes')),
    drawCalls: Number(node.getAttribute('data-draw-calls')),
  }))
}

/**
 * Every element PF1 attaches motion to, and what the browser actually computes for it.
 * `animation-name: none` is the whole contract — reduced motion is NO animation, not a
 * shorter one (`lot.css`: `.lot-notice-line[data-motion='none'] { animation: none }`).
 */
async function motionOfPunctuatedElements(page: Page) {
  return page.evaluate(() => {
    const selectors = ['.lot-notice-line', '.hollywood-activity', '.lot-cash-countup', '.lot-cash']
    const out: { selector: string; animationName: string; transitionProperty: string; text: string }[] = []
    for (const selector of selectors) {
      for (const node of Array.from(document.querySelectorAll(selector))) {
        const style = getComputedStyle(node)
        out.push({
          selector,
          animationName: style.animationName,
          transitionProperty: style.transitionProperty,
          text: (node.textContent ?? '').trim(),
        })
      }
    }
    return out
  })
}

/**
 * Seed the player's own preferences AND the dev telemetry flag before a single module
 * evaluates. The preferences are the subject of this spec; the flag is only how the
 * renderer's structural tuple becomes readable at all (`tycoon-build-mode-v1.spec.ts`
 * idiom). It renders review chrome and changes no world content: with the default
 * `concept-a` review mode the identity and the motion the Lot resolves are identical to
 * an ordinary player's.
 */
async function seedSession(page: Page) {
  await page.addInitScript(
    ([key, value, flag]) => {
      window.localStorage.setItem(key as string, value as string)
      window.localStorage.setItem(flag as string, '1')
    },
    [PREFS_KEY, JSON.stringify(MUTED_REDUCED_PREFS), IDENTITY_PROOF_FLAG_KEY] as const,
  )
}

/**
 * The renderer's draw-call telemetry only begins sampling after its warm-up window, so a
 * structural read taken before it would honestly report zero. Wait for the first committed
 * frame rather than comparing a number the instrument has not measured yet.
 */
async function settleTelemetry(page: Page) {
  await expect(page.getByTestId('hollywood-performance')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('hollywood-performance')).not.toHaveAttribute(
    'data-draw-calls',
    '0',
    { timeout: 30_000 },
  )
}

/** Found a studio the way a new player does (golden-path pattern, minimum roster). */
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
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

// ── THE PROOF ────────────────────────────────────────────────────────────────

test('a muted, reduced-motion studio plays its first picture exactly as today’s game does', async ({
  page,
}) => {
  // ── 0. THE PLAYER'S OWN PREFERENCES, before a single module evaluates ──────
  await seedSession(page)

  // Every audio request the page makes, in order. Nothing is blocked: blocking would
  // prove only that a blocked request fails.
  const audioRequests: string[] = []
  // The pattern is deliberately extension-scoped: on the Vite dev server the SOURCE
  // modules are served from `/src/audio/…​.ts`, and a bare `**/audio/**` would record
  // those too and make "zero audio requests" meaningless.
  await page.route('**/audio/*.{m4a,mp3,ogg,wav}', async (route) => {
    audioRequests.push(new URL(route.request().url()).pathname)
    await route.continue()
  })

  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))

  // ── 1. FOUND ──────────────────────────────────────────────────────────────
  await foundFreshStudio(page, SEED)

  // The resolved motion signal is published on the document element, once, by the shell.
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  // …and the Lot's own renderer flag agrees (the second belt, `.lot-reduced-motion`).
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)

  await settleTelemetry(page)
  const atRest = await structure(page)
  expect(atRest.displayObjects, 'the world telemetry is real').toBeGreaterThan(0)

  // ── 2. COMMISSION — a tier-2 commit receipt, the first punctuated moment ───
  const card = {
    next: page.getByTestId('lot-picture-guidance-next'),
    headline: page.getByTestId('lot-picture-guidance-headline'),
  }
  await expect(card.next).toHaveText('Commission a screenplay at Development')
  await card.next.click()
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()

  // The receipt strip is the punctuation-touched element for a commit. It must be
  // readable and still.
  await page.waitForTimeout(PAST_EVERY_ANIMATION_MS)
  for (const entry of await motionOfPunctuatedElements(page)) {
    expect(entry.animationName, `${entry.selector} must not animate under reduced motion`).toBe(
      'none',
    )
  }
  // A muted, still session still gets the news IN WORDS.
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()

  // ── 3. ADVANCE — the promoted week notice, visible and motionless ─────────
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 1$/)

  const weekNotice = page.getByTestId('lot-week-update-announcement')
  await expect(weekNotice).toHaveText('Week 1 on the lot.')
  // ONE live region owns the sentence — the promotion replaced nothing accessible.
  await expect(weekNotice).toHaveAttribute('aria-live', 'polite')
  await expect(weekNotice).toHaveAttribute('aria-atomic', 'true')
  await expect(page.locator('[data-testid="lot-week-update-announcement"]')).toHaveCount(1)
  // The motion gate is visible in the DOM, not buried in a stylesheet.
  await expect(weekNotice.locator('.lot-notice-line')).toHaveAttribute('data-motion', 'none')

  // THE CASH COUNT-UP IS NEVER CREATED — not created and hidden, not created and
  // instant. Under reduced motion the overlay element does not exist at any instant.
  await expect(page.locator('.lot-cash-countup')).toHaveCount(0)
  await expect(page.locator('.lot-cash-slot[data-counting]')).toHaveCount(0)
  // …and the authoritative figure is in the DOM, where it always is.
  await expect(page.getByTestId('lot-cash')).toHaveText(/^-?\$[\d,]+$/)

  await page.waitForTimeout(PAST_EVERY_ANIMATION_MS)
  await expect(page.locator('.lot-cash-countup')).toHaveCount(0)
  for (const entry of await motionOfPunctuatedElements(page)) {
    expect(entry.animationName, `${entry.selector} after the advance`).toBe('none')
  }

  // STRUCTURE: a punctuated moment moved nothing on the canvas. Decoded bytes and draw
  // calls cannot move without a new texture or a new pipeline batch, which is exactly
  // what the world-emphasis fence forbids.
  const afterPunctuation = await structure(page)
  expect(afterPunctuation.decodedBytes, 'punctuation decoded no new texture').toBe(
    atRest.decodedBytes,
  )
  expect(afterPunctuation.drawCalls, 'punctuation opened no new batch').toBe(atRest.drawCalls)

  // …and it is still not moving a second later with no player action at all.
  await page.waitForTimeout(PAST_EVERY_ANIMATION_MS)
  expect(await structure(page), 'the world is byte-identical while nobody touches it').toEqual(
    afterPunctuation,
  )

  // ── 4. SCRIPT REVIEW → ACCEPT — a tier-2 commit on a decision gate ────────
  await expect(card.headline).toHaveText('Script review ready')
  await expect(card.next).toHaveText('Review the screenplay at Development')
  await card.next.click()
  const scriptReview = page.getByTestId('lot-script-review-panel')
  await expect(scriptReview).toBeVisible()
  await scriptReview.getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()

  await page.waitForTimeout(PAST_EVERY_ANIMATION_MS)
  for (const entry of await motionOfPunctuatedElements(page)) {
    expect(entry.animationName, `${entry.selector} after accepting the draft`).toBe('none')
  }

  // ── 5. ADVANCE AGAIN — the notice is news, and news expires ───────────────
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 2$/)
  await expect(weekNotice).toHaveText('Week 2 on the lot.')
  await expect(page.locator('.lot-cash-countup')).toHaveCount(0)

  // ── 6. THE SOUND AXIS ─────────────────────────────────────────────────────
  //
  // A muted player hears nothing, and the service drops every cue before it reaches the
  // sink — so no CUE asset is ever fetched. This is the assertion that matters and it
  // holds today.
  const cueRequests = audioRequests.filter((path) => /\/audio\/cue-/.test(path))
  expect(cueRequests, 'a muted studio never downloads a cue').toEqual([])

  // And the charter assertion in full (PF1-M4). `setAmbienceScene` and `startMusic` used
  // to start their loops on the sink regardless of mute, and `WebAudioSink.startLoop`
  // fetches the asset as soon as a context exists — so a muted session still downloaded
  // the ambience bed and the era music, roughly 0.75 MB the player would never hear. The
  // service now holds the scene and the era and starts nothing while muted, so "muted" is
  // "no audio work", not merely "a master gain of zero".
  expect(audioRequests, 'a muted studio fetches no audio at all').toEqual([])

  // ── 7. NOTHING BROKE ON THE WAY THROUGH ──────────────────────────────────
  expect(pageErrors, 'a muted, reduced-motion session raises no page error').toEqual([])
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
})

test('the preference survives a reload, and the reload replays no punctuation', async ({ page }) => {
  await seedSession(page)

  const audioRequests: string[] = []
  // The pattern is deliberately extension-scoped: on the Vite dev server the SOURCE
  // modules are served from `/src/audio/…​.ts`, and a bare `**/audio/**` would record
  // those too and make "zero audio requests" meaningless.
  await page.route('**/audio/*.{m4a,mp3,ogg,wav}', async (route) => {
    audioRequests.push(new URL(route.request().url()).pathname)
    await route.continue()
  })

  await foundFreshStudio(page, SEED)
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')

  // A reload of a live session continues it — quietly. The continuation line is a fact,
  // not a rescue, and nothing sounds on hydration (charter §2: punctuation never fires on
  // load).
  audioRequests.length = 0
  await page.reload()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('.lot-cash-countup')).toHaveCount(0)
  expect(
    audioRequests.filter((path) => /\/audio\/cue-/.test(path)),
    'a reload replays no sting',
  ).toEqual([])

  // The stored preferences are untouched by the round trip: presentation state lives
  // outside GameState and outside the save file (charter §2).
  const prefs = await page.evaluate((key) => window.localStorage.getItem(key), PREFS_KEY)
  expect(JSON.parse(prefs ?? 'null')).toMatchObject({ muted: true, motion: 'reduced' })

  const activeSession = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    'project-studio.active-session.v4',
  )
  expect(activeSession, 'the studio is being written down').not.toBeNull()
  expect(activeSession ?? '', 'no preference ever enters a save').not.toContain(PREFS_KEY)
  expect(activeSession ?? '').not.toContain('"motion"')
})
