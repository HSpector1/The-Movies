// ── Authored Stage A H2 "Stage Front" — runtime proof ────────────────────────
//
// Proves H2 inside the REAL Phaser lot through the COMMITTED runtime path, not a
// substitution harness: the DEFAULT-OFF flag, the narrow preload, the procedural fallback
// when the asset is unavailable, pixel-perfect selection against an image-backed texture,
// and the matched procedural/H2 evidence matrix. Follows the Stage B proof pattern.
import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'stage-a-h2-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'
const SOUNDSTAGE_PROOF_FLAG = 'project-studio.flags.studio-lot-soundstage-proof'
const H2_FLAG = 'project-studio.flags.studio-lot-stage-a-h2'

const PROCEDURAL_KEY = 'b-stage-a'
const H2_KEY = 'b-stage-a-h2'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn', 'dressed', 'undressed', 'stagger']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/** `chrome` seeds the dev review tooling. Reviewer frames are captured with it OFF. */
async function seed(page: Page, fixtureName: string, h2: boolean, chrome = true) {
  await page.addInitScript(
    ([key, json, f1, f2, f3, f4, on, dev]) => {
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
        // H2 is a PROOF: absence means OFF, '1' turns it on.
        if (on) localStorage.setItem(f4 as string, '1')
        else localStorage.removeItem(f4 as string)
      } catch {
        /* ignore */
      }
    },
    [ACTIVE_SESSION_KEY, fixture(fixtureName), OVERVIEW_FLAG, IDENTITY_FLAG, SOUNDSTAGE_PROOF_FLAG, H2_FLAG, h2, chrome] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

async function openLot(page: Page, chrome = true) {
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (chrome) await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
  // The "Identity review ▸" restore pill is dev tooling, not lot art, but it is absolutely
  // positioned OVER the canvas — so an element screenshot taken after `lot-review-hide`
  // captures it and contaminates the very frames a blind reviewer is shown. Suppress it in
  // the CAPTURE HARNESS only: the product renders exactly as it does for a developer, and
  // nothing about the lot, the flag or the art changes. (Lesson AE, second occurrence.)
  await page.addStyleTag({ content: '.lot-review-show { display: none !important; }' })
  await page.waitForTimeout(1400)
}

/** Which Stage A implementation actually rendered, read from the dev-only panel. */
async function stageA(page: Page): Promise<{ texture: string; h2: boolean; objects: number; fps: number }> {
  const panel = page.getByTestId('lot-perf-panel')
  const texture = (await panel.getAttribute('data-stage-a-texture')) ?? ''
  const h2 = (await panel.getAttribute('data-stage-a-h2')) === '1'
  const text = (await panel.textContent()) ?? ''
  const m = text.match(/(\d+)\s+objects/)
  // The panel already renders fps; the first capture discarded it, which left the
  // performance package thinner than the governed standard asks for.
  const f = text.match(/(\d+)\s*fps/)
  return { texture, h2, objects: m ? Number(m[1]) : -1, fps: f ? Number(f[1]) : -1 }
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

test('default OFF: Stage A is procedural and no H2 asset is fetched', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => { if (r.url().includes('/lot/b-stage-a-h2')) requested.push(r.url()) })
  await seed(page, 'two', false)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture).toBe(PROCEDURAL_KEY)
  expect(s.h2).toBe(false)
  expect(requested, 'the default path must not fetch the H2 assets').toEqual([])
  writeFileSync(join(outDir, 'flag-off.json'), JSON.stringify(s, null, 2))
})

test('explicit ON: Stage A renders from the authored H2 texture', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture).toBe(H2_KEY)
  expect(s.h2).toBe(true)
  writeFileSync(join(outDir, 'flag-on.json'), JSON.stringify(s, null, 2))
})

test('ON but asset unavailable: falls back to procedural, lot still works', async ({ page }) => {
  await page.route('**/lot/b-stage-a-h2*.png', (route) => route.abort())
  await seed(page, 'two', true)
  await openLot(page)
  const s = await stageA(page)
  expect(s.texture, 'a failed load must leave the procedural Stage A in place').toBe(PROCEDURAL_KEY)
  expect(s.h2).toBe(false)
  await expect(page.getByTestId('lot-nav-stage-a')).toBeVisible()
  await page.getByTestId('lot-review-hide').click()
  await page.waitForTimeout(300)
  await shot(page, 'M-load-failure-fallback')
  await page.getByTestId('lot-nav-stage-a').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  writeFileSync(join(outDir, 'load-failure.json'), JSON.stringify(s, null, 2))
})

test('Stage B is unaffected by the Stage A proof', async ({ page }) => {
  await seed(page, 'two', true)
  await openLot(page)
  const panel = page.getByTestId('lot-perf-panel')
  // Stage B keeps its own production-default authored art with H2 on.
  expect(await panel.getAttribute('data-stage-b-texture')).toBe('b-stage-b-authored')
  expect(await panel.getAttribute('data-authored-stage')).toBe('1')
})

// ── 2. same building, same contract ───────────────────────────────────────────

test('authored H2 Stage A is selectable, and its transparent margin is not', async ({ page }) => {
  await seed(page, 'two', true, false)
  await openLot(page, false)
  const canvas = page.getByTestId('studio-lot-canvas')
  const box = (await canvas.boundingBox())!
  const panel = page.getByTestId('lot-selection-panel')
  // Derive Stage A's on-screen position from the lot's own camera maths: overview zoom =
  // clamp(min(W/2944, H/1722), 0.32, 1.9), camera centred on world (64, 711); Stage A's
  // container sits at gridToScreen(17, 4) = (832, 672).
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
  expect(hit, 'the authored H2 sprite must be clickable').not.toBeNull()
  await expect(panel.locator('h3').first()).toHaveText(/Stage A/i)
  await shot(page, 'I-stage-a-selected-h2', true)

  // BuildingId unchanged, and Stage B untouched by the proof
  await expect(page.getByTestId('lot-nav-stage-a')).toBeVisible()
  await expect(page.getByTestId('lot-nav-stage-b')).toBeVisible()

  const close = page.getByRole('button', { name: 'Close details' })
  if (await close.isVisible().catch(() => false)) await close.click()
  await expect(panel).toHaveCount(0)
  // the empty top-left corner is transparent sky: it must NOT select anything
  await canvas.click({ position: { x: 6, y: 6 } })
  await page.waitForTimeout(300)
  await expect(panel, 'transparent margin must not be clickable').toHaveCount(0)
})

// ── 3. displayObjects guard ───────────────────────────────────────────────────

test('displayObjects: H2 vs procedural, identical state', async ({ page }) => {
  await seed(page, 'two', false)
  await openLot(page)
  const before = await stageA(page)
  expect(before.texture).toBe(PROCEDURAL_KEY)
  await seed(page, 'two', true)
  await openLot(page)
  const after = await stageA(page)
  expect(after.texture).toBe(H2_KEY)
  const delta = after.objects - before.objects
  writeFileSync(join(outDir, 'display-objects.json'),
    JSON.stringify({ procedural: before.objects, h2: after.objects, delta }, null, 2))
  expect(delta).toBeLessThanOrEqual(10)
})

// ── 4. worn resolution ────────────────────────────────────────────────────────

test('underDressed resolves to the H2 worn texture', async ({ page }) => {
  await seed(page, 'undressed', true)
  await openLot(page)
  expect((await stageA(page)).texture).toBe(`${H2_KEY}-ud`)
})

test('underDressed with the proof OFF resolves to the procedural worn texture', async ({ page }) => {
  await seed(page, 'undressed', false)
  await openLot(page)
  expect((await stageA(page)).texture).toBe(`${PROCEDURAL_KEY}-ud`)
})

// ── 5. the evidence matrix, matched procedural / H2 ───────────────────────────

for (const [leg, h2] of [['proc', false], ['h2', true]] as const) {
  test(`evidence ${leg}: management 1280 / 1440 / 1920`, async ({ page }) => {
    test.setTimeout(150_000)
    for (const [tag, w, h] of [['1280', 1280, 720], ['1440', 1440, 900], ['1920', 1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await seed(page, 'two', h2, false)
      await openLot(page, false)
      await shot(page, `A-management-${tag}-${leg}`)
    }
  })

  test(`evidence ${leg}: closer, masked, worn, normal, empty`, async ({ page }) => {
    test.setTimeout(240_000)
    await page.setViewportSize({ width: 1920, height: 1080 })
    for (const [fixture, mask, closer, name] of [
      ['two', true, true, `C-masked-closer-${leg}`],
      ['two', true, false, `D-masked-management-${leg}`],
      ['two', false, true, `B-closer-${leg}`],
    ] as const) {
      await seed(page, fixture, h2, true)
      await openLot(page)
      if (mask) { await page.getByTestId('lot-review-mask-signage').click(); await page.waitForTimeout(400) }
      if (closer) { await page.getByTestId('lot-review-closer').click(); await page.waitForTimeout(900) }
      await page.getByTestId('lot-review-hide').click()
      await page.waitForTimeout(300)
      await shot(page, name)
    }
    for (const [fixture, name] of [
      ['undressed', `F-worn-${leg}`], ['dressed', `E-normal-${leg}`], ['empty', `G-empty-${leg}`],
    ] as const) {
      await seed(page, fixture, h2, false)
      await openLot(page, false)
      await shot(page, name)
    }
  })

  test(`evidence ${leg}: active production, whole frame with Stage B`, async ({ page }) => {
    await seed(page, 'two', h2, false)
    await openLot(page, false)
    await shot(page, `H-active-production-${leg}`)
    await page.waitForTimeout(2200) // let crew/vehicles move across the silhouette
    await shot(page, `J-overlap-${leg}`)
  })
}

// ── 6. the performance package ────────────────────────────────────────────────
//
// displayObjects is the hard guard and is asserted above. The rest of the governed
// performance standard — payload, scene-ready cost, fps at each governed viewport —
// was never recorded on the first pass, so it is measured here rather than inferred.

test('performance: payload, scene-ready and fps at the governed viewports', async ({ page }) => {
  test.setTimeout(180_000)
  const bytes: Record<string, number> = {}
  page.on('response', async (r) => {
    const u = r.url()
    if (!u.includes('/lot/b-stage-')) return
    const len = Number(r.headers()['content-length'] ?? 0)
    if (len > 0) bytes[u.split('/').pop()!] = len
  })

  /** Open the lot with a stopwatch: click → the "Preparing the lot…" note clears. */
  async function measuredOpen(page: Page): Promise<number> {
    const t0 = Date.now()
    await page.getByTestId('open-studio-lot').click()
    await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
    await expect(page.getByText('Preparing the lot…')).toHaveCount(0, { timeout: 30_000 })
    return Date.now() - t0
  }

  const legs: Record<string, { ready: number[]; fps: Record<string, number>; fetched: string[] }> = {
    proc: { ready: [], fps: {}, fetched: [] },
    h2: { ready: [], fps: {}, fetched: [] },
  }

  for (const [name, h2] of [['proc', false], ['h2', true]] as const) {
    const fetched: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/lot/b-stage-a-h2')) fetched.push(r.url().split('/').pop()!)
    })
    for (const [tag, w, h] of [['1280', 1280, 720], ['1440', 1440, 900], ['1920', 1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await seed(page, 'two', h2)
      legs[name]!.ready.push(await measuredOpen(page))
      await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
      await page.waitForTimeout(2000) // let the fps counter settle past first paint
      const s = await stageA(page)
      expect(s.texture).toBe(h2 ? H2_KEY : PROCEDURAL_KEY)
      legs[name]!.fps[tag] = s.fps
    }
    legs[name]!.fetched = [...new Set(fetched)]
  }

  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]!
  const h2Payload = (bytes['b-stage-a-h2.png'] ?? 0) + (bytes['b-stage-a-h2-ud.png'] ?? 0)
  const out = {
    payload: {
      h2Normal: bytes['b-stage-a-h2.png'] ?? null,
      h2Worn: bytes['b-stage-a-h2-ud.png'] ?? null,
      h2Total: h2Payload,
      stageBNormal: bytes['b-stage-b.png'] ?? null,
      stageBWorn: bytes['b-stage-b-ud.png'] ?? null,
    },
    // 512x368 RGBA, uncompressed on the GPU, for each of the two added textures.
    textureCountDelta: legs.h2!.fetched.length,
    textureMemoryDeltaBytes: 512 * 368 * 4 * 2,
    sceneReadyMs: { proc: legs.proc!.ready, h2: legs.h2!.ready },
    sceneReadyMedianMs: { proc: median(legs.proc!.ready), h2: median(legs.h2!.ready) },
    fps: { proc: legs.proc!.fps, h2: legs.h2!.fps },
    fetchedWithProofOff: legs.proc!.fetched,
    fetchedWithProofOn: legs.h2!.fetched,
  }
  writeFileSync(join(outDir, 'performance.json'), JSON.stringify(out, null, 2))

  // The proof must not cost the lot its frame budget at any governed viewport, and with
  // the proof OFF it must remain byte-for-byte the production fetch.
  expect(out.fetchedWithProofOff).toEqual([])
  expect(out.fetchedWithProofOn.sort()).toEqual(['b-stage-a-h2-ud.png', 'b-stage-a-h2.png'])
  for (const tag of ['1280', '1440', '1920'] as const) {
    expect(out.fps.h2[tag], `fps at ${tag}`).toBeGreaterThanOrEqual(30)
  }
})
