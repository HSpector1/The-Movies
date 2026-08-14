// ── Authored Soundstage Pipeline Proof — Checkpoint C runtime evidence ────────
//
// Proves the authored Stage B inside the REAL Phaser lot, not a composite: the
// default-OFF flag, the narrow preload, the procedural fallback when the asset is
// unavailable, and the matched OLD/NEW evidence matrix. Follows the D1-B harness
// pattern (same fixture generation, same localStorage seeding, same gitignored out/).
import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'authored-stage-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'
const SOUNDSTAGE_PROOF_FLAG = 'project-studio.flags.studio-lot-soundstage-proof'
const AUTHORED_FLAG = 'project-studio.flags.studio-lot-authored-stage'
const OPERATION_HOLLYWOOD_FLAG = 'project-studio.flags.operation-hollywood'

const PROCEDURAL_KEY = 'b-stage-b'
const AUTHORED_KEY = 'b-stage-b-authored'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn', 'dressed', 'undressed', 'stagger']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/**
 * `chrome` seeds the dev review tooling (perf panel + closer-camera toolbar). Comparison
 * frames are captured with it OFF so no developer UI can leak which implementation is
 * active into an image a blind reviewer will see.
 */
async function seed(page: Page, fixtureName: string, authored: boolean, chrome = true) {
  await page.addInitScript(
    ([key, json, f1, f2, f3, f4, hollywoodFlag, on, dev]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1') // lot overview
        localStorage.setItem(hollywoodFlag as string, '0') // preserve the procedural proof lot
        if (dev) {
          localStorage.setItem(f2 as string, '1') // identity proof -> dev perf panel
          localStorage.setItem(f3 as string, '1') // soundstage review tooling
        } else {
          localStorage.removeItem(f2 as string)
          localStorage.removeItem(f3 as string)
        }
        // authored Stage B is the production DEFAULT: absence of the key means ON,
        // and the explicit '0' rollback is what selects the procedural build.
        if (on) localStorage.removeItem(f4 as string)
        else localStorage.setItem(f4 as string, '0')
      } catch {
        /* ignore */
      }
    },
    [ACTIVE_SESSION_KEY, fixture(fixtureName), OVERVIEW_FLAG, IDENTITY_FLAG, SOUNDSTAGE_PROOF_FLAG, AUTHORED_FLAG, OPERATION_HOLLYWOOD_FLAG, authored, chrome] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

async function openLot(page: Page, chrome = true) {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (chrome) await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
  await page.waitForTimeout(1400)
}

/** Which Stage B implementation actually rendered, read from the dev-only panel. */
async function stageB(page: Page): Promise<{ texture: string; authored: boolean; objects: number }> {
  const panel = page.getByTestId('lot-perf-panel')
  const texture = (await panel.getAttribute('data-stage-b-texture')) ?? ''
  const authored = (await panel.getAttribute('data-authored-stage')) === '1'
  const text = (await panel.textContent()) ?? ''
  const m = text.match(/(\d+)\s+objects/)
  return { texture, authored, objects: m ? Number(m[1]) : -1 }
}

async function hideOverlay(page: Page) {
  await page.getByTestId('lot-review-hide').click()
  await page.waitForTimeout(300)
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

// ── 1. the gate ───────────────────────────────────────────────────────────────

test('rollback: Stage B is the procedural build and no authored asset is fetched', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => { if (r.url().includes('/lot/b-stage-b')) requested.push(r.url()) })
  await seed(page, 'two', false)
  await openLot(page)
  const s = await stageB(page)
  expect(s.texture).toBe(PROCEDURAL_KEY)
  expect(s.authored).toBe(false)
  expect(requested, 'the rollback path must not fetch the authored assets').toEqual([])
  await hideOverlay(page)
  await shot(page, 'K-flag-off-production-control')
  writeFileSync(join(outDir, 'flag-off.json'), JSON.stringify(s, null, 2))
})

test('default (no override): Stage B renders from the authored texture', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageB(page)
  expect(s.texture).toBe(AUTHORED_KEY)
  expect(s.authored).toBe(true)
  writeFileSync(join(outDir, 'flag-on.json'), JSON.stringify(s, null, 2))
})

test('default but asset unavailable: falls back to procedural, lot still works', async ({ page }) => {
  await page.route('**/lot/b-stage-b*.png', (route) => route.abort())
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageB(page)
  expect(s.texture, 'a failed load must leave the procedural Stage B in place').toBe(PROCEDURAL_KEY)
  expect(s.authored).toBe(false)
  // the building is still there and its destination is still reachable
  await expect(page.getByTestId('lot-nav-stage-b')).toBeVisible()
  await hideOverlay(page)
  await shot(page, 'J-load-failure-fallback')
  await page.getByTestId('lot-nav-stage-b').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  writeFileSync(join(outDir, 'load-failure.json'), JSON.stringify(s, null, 2))
})

test('explicit enable also yields the authored texture', async ({ page }) => {
  await seed(page, 'two', true)
  await page.addInitScript((k) => localStorage.setItem(k as string, '1'), AUTHORED_FLAG)
  await page.goto('/')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await openLot(page)
  expect((await stageB(page)).texture).toBe(AUTHORED_KEY)
})

// ── 2. same building, same contract ───────────────────────────────────────────

/**
 * Pixel-perfect selection against an IMAGE-backed texture. The sprite uses
 * `pixelPerfect: true, alphaTolerance: 1`, so this is the assertion that matters most
 * for the swap: opaque building pixels must select, transparent ones must not.
 */
test('authored Stage B is selectable, and its transparent margin is not', async ({ page }) => {
  // No dev chrome: this frame is shown to blind reviewers, so nothing in it may
  // reveal which implementation is active. The authored texture is asserted by the
  // dedicated flag-ON test above.
  await seed(page, 'two', true, false)
  await openLot(page, false)
  const canvas = page.getByTestId('studio-lot-canvas')
  const box = (await canvas.boundingBox())!
  const panel = page.getByTestId('lot-selection-panel')

  // Derive Stage B's on-screen position from the lot's own camera maths rather than
  // guessing: overview zoom = clamp(min(W/2944, H/1722), 0.32, 1.9), camera centred on
  // world (64, 711); Stage B's ground anchor is gridToScreen(17, 11) = (384, 896).
  const zoom = Math.min(Math.max(Math.min(box.width / 2944, box.height / 1722), 0.32), 1.9)
  const anchorX = (384 - 64) * zoom + box.width / 2
  const anchorY = (896 - 711) * zoom + box.height / 2
  // click into the wall mass, a little above the ground anchor
  let hit: { x: number; y: number } | null = null
  for (const dy of [-30, -45, -18, -60]) {
    const pt = { x: anchorX, y: anchorY + dy * zoom * 2 }
    if (pt.x < 0 || pt.y < 0 || pt.x > box.width || pt.y > box.height) continue
    await canvas.click({ position: pt })
    await page.waitForTimeout(250)
    if (await panel.isVisible().catch(() => false)) {
      const heading = (await panel.locator('h3').first().textContent()) ?? ''
      if (/stage b/i.test(heading)) { hit = pt; break }
      // a different building answered — dismiss before trying again
      await page.getByRole('button', { name: 'Close details' }).click()
      await expect(panel).toHaveCount(0)
    }
  }
  expect(hit, 'the authored sprite must be clickable').not.toBeNull()
  await expect(panel).toBeVisible()
  await expect(panel.locator('h3').first()).toHaveText(/Stage B/i)
  await shot(page, 'D-stage-b-selected', true) // keep the panel — the point of this frame

  // BuildingId is unchanged, and Stage A is untouched by the proof
  await expect(page.getByTestId('lot-nav-stage-b')).toBeVisible()
  await expect(page.getByTestId('lot-nav-stage-a')).toBeVisible()

  // ── the negative probe: transparent pixels INSIDE the sprite's own rect ──────
  //
  // The previous probe clicked canvas (6,6), which is nowhere near Stage B — it lies
  // outside the sprite's bounding rect entirely, so it passed whether the hit area was
  // pixel-perfect or a plain rectangle. It asserted nothing about alpha.
  //
  // These points are derived from the COMMITTED texture's own alpha channel: a
  // chamfer distance transform picks transparent pixels that are far from any opaque
  // one, so the probes follow the art instead of encoding a guess about it.
  // (shot() already dismissed the panel; close it only if something is still open.)
  const close = page.getByRole('button', { name: 'Close details' })
  if (await close.isVisible().catch(() => false)) await close.click()
  await expect(panel).toHaveCount(0)

  const art = await page.evaluate(async (url) => {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error(`could not load ${url}`))
      i.src = url
    })
    const W = img.width
    const H = img.height
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    const ctx = cv.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, W, H)

    // distance (in px) from each pixel to the nearest opaque one, two-pass chamfer
    const dist = new Int32Array(W * H)
    const BIG = 1 << 20
    for (let i = 0; i < W * H; i++) dist[i] = data[i * 4 + 3] > 0 ? 0 : BIG
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (y > 0 && dist[i - W] + 1 < dist[i]) dist[i] = dist[i - W] + 1
        if (x > 0 && dist[i - 1] + 1 < dist[i]) dist[i] = dist[i - 1] + 1
      }
    for (let y = H - 1; y >= 0; y--)
      for (let x = W - 1; x >= 0; x--) {
        const i = y * W + x
        if (y < H - 1 && dist[i + W] + 1 < dist[i]) dist[i] = dist[i + W] + 1
        if (x < W - 1 && dist[i + 1] + 1 < dist[i]) dist[i] = dist[i + 1] + 1
      }

    // keep a margin off the texture edge so click rounding cannot fall out of the rect,
    // and require real depth so sub-pixel zoom cannot land the click on the silhouette
    const MARGIN = 8
    const MIN_DEPTH = 24
    const found: { x: number; y: number; dist: number }[] = []
    for (let y = MARGIN; y < H - MARGIN; y++)
      for (let x = MARGIN; x < W - MARGIN; x++) {
        const i = y * W + x
        if (data[i * 4 + 3] === 0 && dist[i] >= MIN_DEPTH) found.push({ x, y, dist: dist[i] })
      }
    found.sort((a, b) => b.dist - a.dist)
    const probes: { x: number; y: number; dist: number }[] = []
    for (const p of found) {
      if (probes.some((q) => Math.abs(q.x - p.x) < 100 && Math.abs(q.y - p.y) < 100)) continue
      probes.push(p)
      if (probes.length >= 4) break
    }
    return { W, H, transparent: found.length, probes }
  }, '/lot/b-stage-b.png')

  expect(art.probes.length, 'the authored art must have transparent pixels inside its own rect').toBeGreaterThan(0)
  console.log(`[authored] negative-probe candidates: ${art.transparent} px, using ${JSON.stringify(art.probes)}`)

  // the sprite is drawn with origin (0.5, originY) ON the ground anchor, so texture
  // space maps to canvas space by that offset and the camera zoom.
  const ORIGIN_Y = 246 / 374
  const rect = {
    left: anchorX - (art.W / 2) * zoom,
    right: anchorX + (art.W / 2) * zoom,
    top: anchorY - art.H * ORIGIN_Y * zoom,
    bottom: anchorY + art.H * (1 - ORIGIN_Y) * zoom,
  }

  let selectedNothing = 0
  for (const p of art.probes) {
    const pt = { x: anchorX + (p.x - art.W / 2) * zoom, y: anchorY + (p.y - art.H * ORIGIN_Y) * zoom }
    const where = `texture (${p.x},${p.y}) -> canvas (${pt.x.toFixed(1)},${pt.y.toFixed(1)})`
    // the whole point of the change: unlike (6,6), this IS inside the sprite's rect,
    // so only the alpha channel can be what rejects the click
    expect(pt.x, `${where} must be inside the sprite rect`).toBeGreaterThan(rect.left)
    expect(pt.x, `${where} must be inside the sprite rect`).toBeLessThan(rect.right)
    expect(pt.y, `${where} must be inside the sprite rect`).toBeGreaterThan(rect.top)
    expect(pt.y, `${where} must be inside the sprite rect`).toBeLessThan(rect.bottom)

    await canvas.click({ position: pt })
    await page.waitForTimeout(300)
    if (await panel.isVisible().catch(() => false)) {
      // a neighbouring building may legitimately own that patch of ground; Stage B
      // may not, because at that texel Stage B is transparent
      const heading = (await panel.locator('h3').first().textContent()) ?? ''
      expect(heading, `${where} is alpha 0 and must not select Stage B`).not.toMatch(/stage b/i)
      await page.getByRole('button', { name: 'Close details' }).click()
      await expect(panel).toHaveCount(0)
    } else {
      selectedNothing++
    }
  }
  expect(selectedNothing, 'a transparent pixel inside the rect must select nothing at all').toBeGreaterThan(0)
})

// ── 3. displayObjects guard ───────────────────────────────────────────────────

test('displayObjects: authored vs procedural, identical state', async ({ page }) => {
  await seed(page, 'two', false)
  await openLot(page)
  const beforeState = await stageB(page)
  const before = beforeState.objects
  expect(beforeState.texture, 'baseline leg must be procedural').toBe(PROCEDURAL_KEY)
  // Re-seed with the flag ON. seed() registers another init script, which runs AFTER the
  // first on the next navigation and therefore wins — a plain reload would let the first
  // script clear the flag again and we would silently measure procedural twice.
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageB(page)
  const after = s.objects
  expect(s.texture, 'authored leg must actually be authored').toBe(AUTHORED_KEY)
  const delta = after - before
  console.log(`[authored] displayObjects procedural=${before} authored=${after} delta=${delta} texture=${s.texture}`)
  writeFileSync(join(outDir, 'display-objects.json'), JSON.stringify({ before, after, delta, texture: s.texture }, null, 2))
  expect(delta).toBeLessThanOrEqual(10)
})

// ── 4. the evidence matrix, matched OLD / NEW ─────────────────────────────────

for (const [leg, authored] of [['old', false], ['new', true]] as const) {
  test(`evidence ${leg}: management, active production, closer, worn`, async ({ page }) => {
    await seed(page, 'two', authored, false)
    await openLot(page, false)
    await shot(page, `${leg === 'old' ? 'A' : 'B'}-management-active-${leg}`)
    await page.waitForTimeout(2500) // let crew/vehicles move — character movement near Stage B
    await shot(page, `H-character-movement-${leg}`)
    await shot(page, `I-door-glow-active-${leg}`)
  })

  test(`evidence ${leg}: closer production camera`, async ({ page }) => {
    await seed(page, 'two', authored)
    await openLot(page)
    await page.getByTestId('lot-review-closer').click()
    await page.waitForTimeout(900)
    await hideOverlay(page)
    await shot(page, `C-closer-${leg}`)
    await shot(page, `G-apron-occlusion-${leg}`)
  })

  test(`evidence ${leg}: underDressed`, async ({ page }) => {
    await seed(page, 'undressed', authored, false)
    await openLot(page, false)
    await shot(page, `${leg === 'old' ? 'F' : 'E'}-underdressed-${leg}`)
  })

  test(`underDressed resolves to the ${leg} worn texture`, async ({ page }) => {
    await seed(page, 'undressed', authored)
    await openLot(page)
    expect((await stageB(page)).texture).toBe(authored ? `${AUTHORED_KEY}-ud` : `${PROCEDURAL_KEY}-ud`)
  })

  test(`evidence ${leg}: whole frame with Stage A`, async ({ page }) => {
    await seed(page, 'two', authored, false)
    await openLot(page, false)
    await shot(page, `L-whole-frame-${leg}`)
  })
}


// ── 5. occlusion, actually exercised ──────────────────────────────────────────
// The earlier "occlusion" frames caught the lot at moments when nothing was over
// the building, which tests nothing. This captures a burst so an ambient character
// or vehicle is genuinely somewhere across Stage B's silhouette in at least one
// frame; the overlap is measured offline from the burst.
for (const [leg, authored] of [['old', false], ['new', true]] as const) {
  test(`evidence ${leg}: occlusion burst around Stage B`, async ({ page }) => {
    // 14 frames at ~1.2s plus screenshots sits right on the 30s default and flakes.
    test.setTimeout(90_000)
    await seed(page, 'two', authored)
    await openLot(page)
    await page.getByTestId('lot-review-closer').click()
    await page.waitForTimeout(900)
    await hideOverlay(page)
    for (let i = 0; i < 14; i++) {
      await shot(page, `M-occlusion-burst-${leg}-${String(i).padStart(2, '0')}`)
      await page.waitForTimeout(1200)
    }
  })
}
