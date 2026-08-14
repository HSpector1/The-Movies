// ── D1-B: soundstage composer proof — evidence harness ────────────────────────
// Extends the existing D1-A evidence pattern (lot-identity-final.spec.ts) rather than
// inventing a new one: same fixture generation, same localStorage seeding, same review
// chrome hiding, same viewport classes, same gitignored out/ destination.
//
// Checkpoint A scope: the two things the owner asked to be MEASURED rather than asserted —
// baseline-vs-proof displayObjects, and matched baseline-vs-proof capture at the management
// camera proving the content gate OFF is the pre-spike lot.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd1b-soundstage-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'
const SOUNDSTAGES_FLAG = 'project-studio.flags.studio-lot-soundstages'
const SOUNDSTAGE_PROOF_FLAG = 'project-studio.flags.studio-lot-soundstage-proof'
const OPERATION_HOLLYWOOD_FLAG = 'project-studio.flags.operation-hollywood'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn', 'dressed', 'undressed']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/**
 * Seed a save + the flags.
 *
 * `soundstages` selects the D1-B VISUAL CONTENT path. Post-adoption the content gate is
 * default ON, so `true` clears the key and `false` writes the explicit '0' rollback that
 * restores the pre-D1-B shared stage texture. The stage-assignment correctness fix is NOT
 * controlled by this and stays active on both paths.
 */
async function seed(page: Page, fixtureName: string, soundstages: boolean) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, f1, f2, f3, f4, hollywoodFlag, on]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1')
        localStorage.setItem(f2 as string, '1')
        localStorage.setItem(f4 as string, '1') // D1-B review tooling (capture affordances)
        localStorage.setItem(hollywoodFlag as string, '0') // preserve the procedural proof lot
        if (on) localStorage.removeItem(f3 as string) // default ON
        else localStorage.setItem(f3 as string, '0') // explicit visual rollback
      } catch {
        /* ignore */
      }
    },
    [
      ACTIVE_SESSION_KEY,
      save,
      OVERVIEW_FLAG,
      IDENTITY_FLAG,
      SOUNDSTAGES_FLAG,
      SOUNDSTAGE_PROOF_FLAG,
      OPERATION_HOLLYWOOD_FLAG,
      soundstages,
    ] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

/** Toggle the review-only stage signage mask (proof gate). */
async function maskSignage(page: Page) {
  await page.getByTestId('lot-review-mask-signage').click()
  await page.waitForTimeout(400)
}

/** Toggle the review-only closer framing, which calls the existing 'production' preset. */
async function closerFraming(page: Page) {
  await page.getByTestId('lot-review-closer').click()
  await page.waitForTimeout(600)
}

async function openLot(page: Page) {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-review-mode')).toBeVisible()
  await page.waitForTimeout(1300)
}

async function setMode(page: Page, key: 'baseline' | 'concept-a') {
  await page.getByTestId(`lot-review-${key}`).click()
  await page.waitForTimeout(700)
}

async function hideOverlay(page: Page) {
  await page.getByTestId('lot-review-hide').click()
  await expect(page.getByTestId('lot-review-mode')).toHaveCount(0)
  await page.waitForTimeout(350)
}

/**
 * Capture a clean frame. Clicking review controls that sit over the canvas can leave a
 * building selection panel open; it is dev-tooling noise, not part of the lot being judged,
 * so it is dismissed before the shutter.
 */
async function shot(page: Page, name: string) {
  const close = page.getByRole('button', { name: 'Close details' })
  if (await close.isVisible().catch(() => false)) {
    await close.click()
    await page.waitForTimeout(250)
  }
  await page.screenshot({ path: join(outDir, `${name}.png`) })
}

/** Read `displayObjects` out of the dev performance panel ("60 fps · 143 objects · 8 identity"). */
async function readDisplayObjects(page: Page): Promise<number> {
  const panel = page.getByTestId('lot-perf-panel')
  await expect(panel).toContainText('objects')
  const text = (await panel.textContent()) ?? ''
  const m = text.match(/(\d+)\s+objects/)
  expect(m, `could not parse displayObjects from "${text}"`).not.toBeNull()
  return Number(m![1])
}

// ── H. before/after displayObjects (the §22 performance gate) ─────────────────
test('displayObjects: visual rollback vs accepted default, identical state', async ({ page }) => {
  const measure = async (soundstages: boolean) => {
    await seed(page, 'two', soundstages)
    await openLot(page)
    await setMode(page, 'concept-a')
    await page.waitForTimeout(600)
    return readDisplayObjects(page)
  }

  const before = await measure(false)
  const after = await measure(true)
  const delta = after - before

  writeFileSync(
    join(outDir, 'display-objects.json'),
    JSON.stringify(
      { fixture: 'two', identity: 'concept-a', baseline: before, proof: after, delta },
      null,
      2,
    ),
  )
  // eslint-disable-next-line no-console
  console.log(`[D1-B] displayObjects baseline=${before} proof=${after} delta=${delta}`)

  expect(before).toBeGreaterThan(0)
  // §22 hard stop: more than +10 top-level displayObjects attributable to the proof.
  expect(delta).toBeLessThanOrEqual(10)
})

// ── A. baseline vs proof, same seed / state / framing ─────────────────────────
test('baseline vs proof at the management camera (matched state)', async ({ page }) => {
  const capture = async (soundstages: boolean, name: string) => {
    await seed(page, 'two', soundstages)
    await openLot(page)
    await setMode(page, 'concept-a')
    await hideOverlay(page)
    await shot(page, name)
  }

  // A0 is a CONTROL: a second gate-OFF capture. The lot has ambient agents walking, so two
  // captures of the same configuration never match exactly. A0-vs-A1 is the noise floor that
  // A1-vs-A2 has to be read against — without it, "the images differ" means nothing.
  await capture(false, 'A0-management-rollback-control')
  await capture(false, 'A1-management-rollback')
  await capture(true, 'A2-management-default')
})

// ── B/C. the decisive gates: signage-masked, and closer review ────────────────
test('Stage A/B — normal, signage-masked, and closer review', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  await setMode(page, 'concept-a')

  // B1: normal presentation, management camera
  await hideOverlay(page)
  await shot(page, 'B1-stages-normal')

  // B2: the SAME framing with every stage-naming cue hidden — the decisive test
  await page.getByTestId('lot-review-show').click()
  await maskSignage(page)
  await hideOverlay(page)
  await shot(page, 'B2-stages-signage-masked')

  // C1: closer review, signage still masked (architecture only)
  await page.getByTestId('lot-review-show').click()
  await closerFraming(page)
  await hideOverlay(page)
  await shot(page, 'C1-stages-closer-masked')

  // C2: closer review with signage restored, for defect inspection in context
  await page.getByTestId('lot-review-show').click()
  await maskSignage(page)
  await hideOverlay(page)
  await shot(page, 'C2-stages-closer-normal')
})

// ── D. underDressed OFF / ON, matched week + seed ─────────────────────────────
test('underDressed OFF vs ON (matched fixtures)', async ({ page }) => {
  for (const [name, fx] of [
    ['D1-underdressed-off', 'dressed'],
    ['D2-underdressed-on', 'undressed'],
  ] as const) {
    await seed(page, fx, true)
    await openLot(page)
    await setMode(page, 'concept-a')
    await hideOverlay(page)
    await shot(page, name)
  }
})

// ── E. stable stage assignment across a release, with distinct art ────────────
// Driven the way a player actually would: leave the lot, advance weeks on the dashboard,
// come back. That round trip is exactly what makes this worth proving — the lot screen
// unmounts each time, so the assignment memory has to outlive it.
async function stageStates(page: Page): Promise<{ a: string | null; b: string | null }> {
  return {
    a: await page.getByTestId('lot-nav-stage-a').getAttribute('data-attention'),
    b: await page.getByTestId('lot-nav-stage-b').getAttribute('data-attention'),
  }
}

async function advanceWeeks(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    // Dashboard is now a supporting surface rooted in the Studio Lot. Open it only for
    // its deep simulation control; every completed tick returns to the living world.
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.getByTestId('advance-week').click()
    await page.waitForTimeout(150)
    // A release can route through one or more interstitials. Dismiss them until the
    // Studio Lot remounts; no-release advances return there directly.
    // A tick can route through one or more interstitials (the weekly releases screen, and
    // after a release the autopsy). Dismiss whatever is in the way until the world is back.
    for (let guard = 0; guard < 6; guard++) {
      if (await page.getByTestId('studio-lot-screen').isVisible().catch(() => false)) break
      let clicked = false
      for (const id of ['newspaper-continue', 'release-continue', 'autopsy-close', 'autopsy-back', 'recovery-dismiss']) {
        const el = page.getByTestId(id)
        if (await el.isVisible().catch(() => false)) {
          await el.click()
          await page.waitForTimeout(150)
          clicked = true
          break
        }
      }
      if (!clicked) {
        const ids = await page.evaluate(() =>
          Array.from(document.querySelectorAll('[data-testid]')).map((e) => e.getAttribute('data-testid')),
        )
        throw new Error(`stuck after advancing week ${i + 1}; no known dismiss control. testids=${JSON.stringify(ids)}`)
      }
    }
    await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  }
  await page.waitForTimeout(1300)
}

for (const gate of [true, false] as const) {
  const tag = gate ? 'content-default-ON' : 'content-rolled-back'
  test(`stable assignment across a release — ${tag}`, async ({ page }) => {
    // ticking the engine through the real dashboard is slow; this journey needs the room
    test.setTimeout(180_000)
    await seed(page, 'stagger', gate)
    await openLot(page)
    await setMode(page, 'concept-a')

    const before = await stageStates(page)
    expect(before).toEqual({ a: 'active', b: 'active' })
    await hideOverlay(page)
    await shot(page, `E1-${tag}-both-stages-active`)

    // The Stage A film has 5 weeks left and the Stage B film 7, so six weeks releases the
    // first and leaves the second shooting alone — the array compaction that used to move
    // the survivor onto Stage A.
    await advanceWeeks(page, 6)
    const after = await stageStates(page)
    // eslint-disable-next-line no-console
    console.log(`[D1-B] ${tag}: before=${JSON.stringify(before)} after=${JSON.stringify(after)}`)
    await page.getByTestId('lot-review-hide').click().catch(() => {})
    await page.waitForTimeout(350)
    await shot(page, `E2-${tag}-after-one-release`)

    const survivors = [after.a, after.b].filter((s) => s === 'active').length
    expect(survivors, 'exactly one production should still be shooting').toBe(1)

    // THE FIX, on BOTH paths. After the D1-B adoption ruling the stable assignment is
    // ordinary presentation correctness and is not tied to the visual content gate, so the
    // survivor stays on Stage B even when the stage ART has been rolled back.
    expect(after).toEqual({ a: 'empty', b: 'active' })
  })
}

// ── F/G. the established viewport classes + 125% zoom, content gate ON ────────
test('proof across the established viewport classes and 125% zoom', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  await setMode(page, 'concept-a')
  await hideOverlay(page)

  for (const [label, w, h, zoom] of [
    ['F1-proof-1920x1080', 1920, 1080, 1],
    ['F2-proof-1366x768', 1366, 768, 1],
    ['F3-proof-1280x720', 1280, 720, 1],
    ['G1-proof-zoom125', 1366, 768, 1.25],
  ] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.evaluate((z) => {
      document.documentElement.style.zoom = String(z)
    }, zoom)
    await page.waitForTimeout(450)
    await shot(page, label)
  }
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1'
  })
})
