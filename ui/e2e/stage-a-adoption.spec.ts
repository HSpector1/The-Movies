// ── Authored Stage A — PRODUCTION ADOPTION ────────────────────────────────────
//
// The proof asked "can the authored art run in the real lot?". This asks the adoption
// question: "is the authored art safe as the DEFAULT presentation of Stage A?" — which
// inverts the gate. There is no proof switch any more: absence of an override means
// AUTHORED, an explicit '0' rolls a developer back to the procedural build, and a failed
// asset fetch falls back to the procedural build on its own.
//
// Same shape as the shipped Stage B adoption. Nothing here is a design review: it is a
// regression matrix over gate, fallback, state, identity, interaction and accessibility.
import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'stage-a-adoption-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'
const SOUNDSTAGE_PROOF_FLAG = 'project-studio.flags.studio-lot-soundstage-proof'
/** Rollback key. Its ABSENCE is the production default, so tests opt IN to procedural. */
const STAGE_A_ROLLBACK = 'project-studio.flags.studio-lot-authored-stage-a'

const PROCEDURAL_KEY = 'b-stage-a'
const AUTHORED_KEY = 'b-stage-a-h2'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn', 'dressed', 'undressed', 'stagger']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/** `chrome` seeds the dev review tooling. Reviewer frames are captured with it OFF. */
async function seed(page: Page, fixtureName: string, rollback: boolean, chrome = true) {
  await page.addInitScript(
    ([key, json, f1, f2, f3, f4, back, dev]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1')
        if (dev) {
          localStorage.setItem(f2 as string, '1')
          localStorage.setItem(f3 as string, '1')
        } else {
          localStorage.removeItem(f2 as string)
          localStorage.removeItem(f3 as string)
        }
        // Production default is AUTHORED: only an explicit '0' rolls back.
        if (back) localStorage.setItem(f4 as string, '0')
        else localStorage.removeItem(f4 as string)
      } catch {
        /* ignore */
      }
    },
    [ACTIVE_SESSION_KEY, fixture(fixtureName), OVERVIEW_FLAG, IDENTITY_FLAG, SOUNDSTAGE_PROOF_FLAG, STAGE_A_ROLLBACK, rollback, chrome] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

async function openLot(page: Page, chrome = true) {
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (chrome) await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
  // Dev review chrome is absolutely positioned OVER the canvas, so an element screenshot
  // captures it. Suppress in the CAPTURE HARNESS only — never in product code. (Lesson AE.)
  await page.addStyleTag({ content: '.lot-review-show { display: none !important; }' })
  await page.waitForTimeout(1400)
}

/** Which Stage A implementation actually rendered, read from the dev-only panel. */
async function stageA(page: Page): Promise<{ texture: string; authored: boolean; failed: boolean; objects: number; fps: number }> {
  const panel = page.getByTestId('lot-perf-panel')
  const texture = (await panel.getAttribute('data-stage-a-texture')) ?? ''
  const authored = (await panel.getAttribute('data-authored-stage-a')) === '1'
  const failed = (await panel.getAttribute('data-authored-stage-a-failed')) === '1'
  const text = (await panel.textContent()) ?? ''
  const m = text.match(/(\d+)\s+objects/)
  const f = text.match(/(\d+)\s*fps/)
  return { texture, authored, failed, objects: m ? Number(m[1]) : -1, fps: f ? Number(f[1]) : -1 }
}

async function shot(page: Page, name: string, keepPanel = false) {
  if (!keepPanel) {
    const close = page.getByRole('button', { name: 'Close details' })
    if (await close.isVisible().catch(() => false)) await close.click()
  }
  await page.waitForTimeout(200)
  await page.locator('.lot-canvas, [data-testid="studio-lot-screen"] canvas').first()
    .screenshot({ path: join(outDir, `${name}.png`) })
}

// ── 1. the production default ─────────────────────────────────────────────────

test('1. NO OVERRIDE: Stage A renders from the authored art', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => { if (r.url().includes('/lot/b-stage-a-h2')) requested.push(r.url().split('/').pop()!) })
  await seed(page, 'two', false)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture).toBe(AUTHORED_KEY)
  expect(s.authored).toBe(true)
  expect(s.failed).toBe(false)
  expect(requested.sort()).toEqual(['b-stage-a-h2-ud.png', 'b-stage-a-h2.png'])
  writeFileSync(join(outDir, 'default.json'), JSON.stringify(s, null, 2))
})

test('2. NO OVERRIDE + underDressed: Stage A renders the authored WORN art', async ({ page }) => {
  await seed(page, 'undressed', false)
  await openLot(page)
  expect((await stageA(page)).texture).toBe(`${AUTHORED_KEY}-ud`)
})

// ── 2. the developer rollback ─────────────────────────────────────────────────

test('3. EXPLICIT ROLLBACK: Stage A is the procedural build, and no authored asset is fetched', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => { if (r.url().includes('/lot/b-stage-a-h2')) requested.push(r.url()) })
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture).toBe(PROCEDURAL_KEY)
  expect(s.authored).toBe(false)
  expect(requested, 'a rolled-back building must not fetch its authored art').toEqual([])
  writeFileSync(join(outDir, 'rollback.json'), JSON.stringify(s, null, 2))
})

test('4. EXPLICIT ROLLBACK + underDressed: the procedural worn Stage A', async ({ page }) => {
  await seed(page, 'undressed', true)
  await openLot(page)
  expect((await stageA(page)).texture).toBe(`${PROCEDURAL_KEY}-ud`)
})

// ── 3. the safety fallback ────────────────────────────────────────────────────

test('5. NORMAL asset unavailable: falls back to procedural, lot still fully works', async ({ page }) => {
  await page.route('**/lot/b-stage-a-h2.png', (route) => route.abort())
  await seed(page, 'two', false)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture, 'a failed load must leave the procedural Stage A in place').toBe(PROCEDURAL_KEY)
  expect(s.authored).toBe(false)
  expect(s.failed, 'the failure must be attributed to Stage A, not Stage B').toBe(true)
  // Stage B is a separate authored building and must be untouched by Stage A's failure.
  const panel = page.getByTestId('lot-perf-panel')
  expect(await panel.getAttribute('data-stage-b-texture')).toBe('b-stage-b-authored')
  await expect(page.getByTestId('lot-nav-stage-a')).toBeVisible()
  await page.getByTestId('lot-review-hide').click()
  await page.waitForTimeout(300)
  await shot(page, 'K-fallback-missing-normal')
  await page.getByTestId('lot-nav-stage-a').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  writeFileSync(join(outDir, 'fallback-normal.json'), JSON.stringify(s, null, 2))
})

test('6. WORN asset unavailable: the whole building falls back, so no half-authored state', async ({ page }) => {
  await page.route('**/lot/b-stage-a-h2-ud.png', (route) => route.abort())
  await seed(page, 'undressed', false)
  await openLot(page)
  const s = await stageA(page)
  // The re-point requires BOTH textures, so a worn-only failure cannot leave the normal
  // authored texture standing in for an under-dressed stage.
  expect(s.texture).toBe(`${PROCEDURAL_KEY}-ud`)
  expect(s.authored).toBe(false)
  expect(s.failed).toBe(true)
  writeFileSync(join(outDir, 'fallback-worn.json'), JSON.stringify(s, null, 2))
})

// ── 4. identity, state and Stage B ────────────────────────────────────────────

test('7. BuildingId, navigation and accessibility are unchanged by adoption', async ({ page }) => {
  await seed(page, 'two', false)
  await openLot(page)
  // The companion navigation is the accessible truth; its ids are the gameplay identity.
  await expect(page.getByTestId('lot-nav-stage-a')).toBeVisible()
  await expect(page.getByTestId('lot-nav-stage-b')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas')).toHaveAttribute('aria-hidden', 'true')
  await page.getByTestId('lot-nav-stage-a').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
})

test('8. Stage B is unaffected by the Stage A adoption', async ({ page }) => {
  await seed(page, 'two', false)
  await openLot(page)
  const panel = page.getByTestId('lot-perf-panel')
  expect(await panel.getAttribute('data-stage-b-texture')).toBe('b-stage-b-authored')
  expect(await panel.getAttribute('data-authored-stage')).toBe('1')
})

test('9. the authored Stage A is selectable, and its transparent margin is not', async ({ page }) => {
  await seed(page, 'two', false, false)
  await openLot(page, false)
  const canvas = page.getByTestId('studio-lot-canvas')
  const box = (await canvas.boundingBox())!
  const panel = page.getByTestId('lot-selection-panel')
  const zoom = Math.min(Math.max(Math.min(box.width / 2944, box.height / 1722), 0.32), 1.9)
  const ax = (832 - 64) * zoom + box.width / 2
  const ay = (672 - 711) * zoom + box.height / 2
  let hit: { x: number; y: number } | null = null
  for (const dy of [-30, -45, -18, -60, -70, -85]) {
    const pt = { x: ax, y: ay + dy * zoom * 2 }
    if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) continue
    await canvas.click({ position: pt })
    await page.waitForTimeout(250)
    if (await panel.isVisible().catch(() => false)) {
      const heading = (await panel.locator('h3').first().textContent()) ?? ''
      if (/stage a/i.test(heading)) { hit = pt; break }
      await page.getByRole('button', { name: 'Close details' }).click()
      await expect(panel).toHaveCount(0)
    }
  }
  expect(hit, 'the authored sprite must be clickable').not.toBeNull()
  await expect(panel.locator('h3').first()).toHaveText(/Stage A/i)
  // keepPanel: shot() otherwise clicks "Close details", which also calls clearSelection()
  // on the view — so the frame would show neither the panel NOR the on-canvas selection
  // treatment, and a reviewer would be handed an ordinary frame labelled "selected".
  await shot(page, 'G-selected', true)

  const close = page.getByRole('button', { name: 'Close details' })
  if (await close.isVisible().catch(() => false)) await close.click()
  await expect(panel).toHaveCount(0)
  await canvas.click({ position: { x: 6, y: 6 } })
  await page.waitForTimeout(300)
  await expect(panel, 'transparent margin must not be clickable').toHaveCount(0)
})

test('10. displayObjects: authored vs procedural, identical state', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  const before = await stageA(page)
  expect(before.texture).toBe(PROCEDURAL_KEY)
  await seed(page, 'two', false)
  await openLot(page)
  const after = await stageA(page)
  expect(after.texture).toBe(AUTHORED_KEY)
  const delta = after.objects - before.objects
  writeFileSync(join(outDir, 'display-objects.json'),
    JSON.stringify({ procedural: before.objects, authored: after.objects, delta }, null, 2))
  expect(delta).toBeLessThanOrEqual(10)
})

// ── 5. release evidence, at production semantics ──────────────────────────────

test('11. evidence: management 1280 / 1440 / 1920', async ({ page }) => {
  test.setTimeout(150_000)
  for (const [tag, w, h] of [['1280', 1280, 720], ['1440', 1440, 900], ['1920', 1920, 1080]] as const) {
    await page.setViewportSize({ width: w, height: h })
    await seed(page, 'two', false, false)
    await openLot(page, false)
    await shot(page, `${tag === '1280' ? 'A' : tag === '1440' ? 'B' : 'C'}-management-${tag}`)
  }
})

test('12. evidence: closest framing, normal, worn, active production, rollback', async ({ page }) => {
  test.setTimeout(240_000)
  await page.setViewportSize({ width: 1920, height: 1080 })

  await seed(page, 'two', false)
  await openLot(page)
  await page.getByTestId('lot-review-closer').click()
  await page.waitForTimeout(900)
  await page.getByTestId('lot-review-hide').click()
  await page.waitForTimeout(300)
  await shot(page, 'D-closest-framing')

  for (const [fx, name] of [['dressed', 'E-normal'], ['undressed', 'F-worn'], ['two', 'H-active-production'], ['two', 'I-stage-a-and-stage-b']] as const) {
    await seed(page, fx, false, false)
    await openLot(page, false)
    await shot(page, name)
  }
  // J: the developer rollback, same frame, for a like-for-like comparison
  await seed(page, 'two', true, false)
  await openLot(page, false)
  await shot(page, 'J-explicit-rollback')
})

// ── 6. performance ────────────────────────────────────────────────────────────

test('13. performance: payload, scene-ready and fps at the governed viewports', async ({ page }) => {
  test.setTimeout(180_000)
  const bytes: Record<string, number> = {}
  page.on('response', async (r) => {
    const u = r.url()
    if (!u.includes('/lot/b-stage-')) return
    const len = Number(r.headers()['content-length'] ?? 0)
    if (len > 0) bytes[u.split('/').pop()!] = len
  })

  async function measuredOpen(page: Page): Promise<number> {
    const t0 = Date.now()
    await page.getByTestId('open-studio-lot').click()
    await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
    await expect(page.getByText('Preparing the lot…')).toHaveCount(0, { timeout: 30_000 })
    return Date.now() - t0
  }

  const legs: Record<string, { ready: number[]; fps: Record<string, number> }> = {
    procedural: { ready: [], fps: {} },
    authored: { ready: [], fps: {} },
  }
  for (const [name, rollback] of [['procedural', true], ['authored', false]] as const) {
    for (const [tag, w, h] of [['1280', 1280, 720], ['1440', 1440, 900], ['1920', 1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await seed(page, 'two', rollback)
      legs[name]!.ready.push(await measuredOpen(page))
      await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
      await page.waitForTimeout(2000)
      const s = await stageA(page)
      expect(s.texture).toBe(rollback ? PROCEDURAL_KEY : AUTHORED_KEY)
      legs[name]!.fps[tag] = s.fps
    }
  }

  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!
  const out = {
    payload: {
      stageANormal: bytes['b-stage-a-h2.png'] ?? null,
      stageAWorn: bytes['b-stage-a-h2-ud.png'] ?? null,
      stageATotal: (bytes['b-stage-a-h2.png'] ?? 0) + (bytes['b-stage-a-h2-ud.png'] ?? 0),
      stageBNormal: bytes['b-stage-b.png'] ?? null,
      stageBWorn: bytes['b-stage-b-ud.png'] ?? null,
    },
    textureCountDelta: 2,
    textureMemoryDeltaBytes: 512 * 368 * 4 * 2,
    sceneReadyMs: { procedural: legs.procedural!.ready, authored: legs.authored!.ready },
    sceneReadyMedianMs: { procedural: median(legs.procedural!.ready), authored: median(legs.authored!.ready) },
    fps: { procedural: legs.procedural!.fps, authored: legs.authored!.fps },
  }
  writeFileSync(join(outDir, 'performance.json'), JSON.stringify(out, null, 2))
  for (const tag of ['1280', '1440', '1920'] as const) {
    expect(out.fps.authored[tag], `fps at ${tag}`).toBeGreaterThanOrEqual(30)
  }
})
