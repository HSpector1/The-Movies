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

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/** Seed a save + the flags. `soundstages` drives the D1-B content gate. */
async function seed(page: Page, fixtureName: string, soundstages: boolean) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, f1, f2, f3, on]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1')
        localStorage.setItem(f2 as string, '1')
        if (on) localStorage.setItem(f3 as string, '1')
        else localStorage.removeItem(f3 as string)
      } catch {
        /* ignore */
      }
    },
    [ACTIVE_SESSION_KEY, save, OVERVIEW_FLAG, IDENTITY_FLAG, SOUNDSTAGES_FLAG, soundstages] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

async function openLot(page: Page) {
  await page.getByTestId('open-studio-lot').click()
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

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })

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
test('displayObjects: content gate OFF vs ON, identical state', async ({ page }) => {
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
  await capture(false, 'A0-management-gate-off-control')
  await capture(false, 'A1-management-gate-off')
  await capture(true, 'A2-management-gate-on')
})

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
