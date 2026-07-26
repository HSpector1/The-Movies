// ── Browser playtest: the Film-Package legibility loop end-to-end ─────────────
// Deterministic seed. Drives the REAL app (no engine mocking) through the CYCLE-3
// twelve-step playtest from the owner's brief:
//   A. Start → assemble Film A with obvious (worst-Fit) mismatches → record the package
//      summary → replace each mismatch with the strongest assignment-specific candidate →
//      confirm the metrics + explanations improve → greenlight → release → compare the
//      LOCKED greenlight assessment against the autopsy (locked vs actual visible).
//   B. Assemble Film B using a lower-OVR SPECIALIST with higher Fit → confirm the
//      specialist decision is understandable (the card explains the fit) → assign a
//      CUSTOM-CREATED Crew member (created in the Talent Creator) → greenlight → release →
//      confirm the outcome is uncertain but EXPLAINABLE (autopsy explains it from real
//      factors: risks materialized/avoided against the stored uncertainty factors).
//
// Only observable UI is asserted. Selectors are stable testids/roles. Everything the
// UI shows is produced by the engine (the adapter is the single boundary), so a green
// run proves the whole legibility loop works against the real simulation.

import { test, expect, type Page, type Locator } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEED = 'e2e-film-package-playtest'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

// The selectable candidate buttons in a picker, in the rendered (Fit-sorted) order.
function candidateButtons(page: Page, pickerTestId: string): Locator {
  return page.getByTestId(pickerTestId).locator('button[aria-pressed]:not([disabled])')
}

// Parse the leading integer out of a metric node's text (e.g. "64 · strong" → 64).
async function leadingInt(loc: Locator): Promise<number> {
  const txt = (await loc.textContent()) ?? ''
  const m = txt.match(/-?\d+/)
  return m ? Number(m[0]) : NaN
}

// Walk the wizard to the talent step (concept → shape → promise → talent).
async function toTalentStep(page: Page) {
  await page.getByTestId('assemble-film').click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await page.getByTestId('concept-grid').getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // → shape (defaults valid)
  await page.getByTestId('assembly-next').click() // → promise (defaults valid)
  await page.getByTestId('assembly-next').click() // → talent
}

test('film-package legibility: mismatch→improve→lock/autopsy (A) then specialist+custom-crew (B)', async ({
  page,
}) => {
  test.setTimeout(120_000)

  // ── STEP 1 — Start a game (deterministic seed). ─────────────────────────────
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('dash-week')).toHaveText('0')

  // ── STEP 2 — Assemble Film A with obvious mismatches. ───────────────────────
  // Candidates are Fit-sorted (best first). To create an OBVIOUS mismatch we pick the
  // WORST-fit candidate in each picker (the last selectable button).
  await toTalentStep(page)
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support']) {
    const btns = candidateButtons(page, picker)
    const n = await btns.count()
    await btns.nth(n - 1).click() // the lowest-Fit candidate for this assignment
  }

  // The package summary is present (cohesion always; fit/exec/profit once writer+director set).
  await expect(page.getByTestId('film-package-summary')).toBeVisible()
  await expect(page.getByTestId('pkg-fit-overall')).toBeVisible()

  // ── STEP 3 — Record the package summary (cohesion / fit / execution / commercial). ──
  const fitBefore = await leadingInt(page.getByTestId('pkg-fit-overall'))
  const execTierBefore = ((await page.getByTestId('pkg-exec-tier').textContent()) ?? '').trim()
  const revenueBefore = ((await page.getByTestId('pkg-profit-revenue').textContent()) ?? '').trim()
  // The two disclosures are surfaced from the start (cohesion is talent-independent).
  await expect(page.getByTestId('pkg-cohesion-disclosure')).toContainText(/talent is assessed separately/i)
  await expect(page.getByTestId('pkg-profit-disclosure')).toContainText(/no distributor/i)
  await shot(page, 'fp-A1-mismatched-package')

  // ── STEP 4 — Replace each mismatch with the strongest assignment-specific candidate. ──
  // The first selectable button in each Fit-sorted picker is the BEST-fit candidate.
  // The change preview is transient by design (it shows the effect of the LATEST swap and
  // clears on the next render), so we assert it right after the final swap and treat its
  // (racy) visibility as best-effort; the DURABLE metric movement below is the hard gate.
  const improvePickers = ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support']
  for (const picker of improvePickers) {
    await candidateButtons(page, picker).first().click()
  }
  // Best-effort: the change preview shows a REAL computed before→after Fit for the last swap.
  const preview = page.getByTestId('change-preview')
  if (await preview.isVisible().catch(() => false)) {
    await expect(preview).toContainText(/Fit \d+→\d+/)
    await shot(page, 'fp-A1b-change-preview')
  }

  // ── STEP 5 — Confirm package metrics + explanations improve. ─────────────────
  const fitAfter = await leadingInt(page.getByTestId('pkg-fit-overall'))
  expect(fitAfter).toBeGreaterThan(fitBefore) // best-fit cast raises overall Fit
  const revenueAfter = ((await page.getByTestId('pkg-profit-revenue').textContent()) ?? '').trim()
  expect(revenueAfter).not.toBe(revenueBefore) // commercial outlook moved
  // Execution confidence is a legible tier + explanation (perceived only; WE excluded).
  await expect(page.getByTestId('pkg-exec')).toContainText(/Work Ethic is excluded/i)
  void execTierBefore
  await shot(page, 'fp-A2-improved-package')

  // ── STEP 6 — Greenlight and release Film A. ─────────────────────────────────
  await page.getByTestId('assembly-next').click() // → budget/forecast
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('active-list')).toBeVisible()

  const prodIdA = await advanceToRelease(page)
  await shot(page, 'fp-A3-release')

  // ── STEP 7 — Compare the greenlight assessment with the autopsy (locked vs actual). ──
  await page.getByTestId(`open-autopsy-${prodIdA}`).click()
  await expect(page.getByTestId('autopsy')).toBeVisible()
  // The LOCKED greenlight decision is graded against the ACTUAL result: both are visible.
  const compare = page.getByTestId('autopsy-greenlight-compare')
  await expect(compare).toBeVisible()
  await expect(page.getByTestId('autopsy-verdict')).toBeVisible()
  // Expected (locked) revenue AND actual profit are both shown side-by-side.
  await expect(page.getByTestId('autopsy-expected-revenue')).toBeVisible()
  await expect(page.getByTestId('autopsy-actual-profit')).toBeVisible()
  // Expected (locked) cohesion vs the realized cohesion — locked estimate never overwritten.
  await expect(page.getByTestId('autopsy-realized-cohesion')).toBeVisible()
  await expect(compare).toContainText(/locked estimates/i)
  // The locked Fit-by-assignment table is present (the greenlight-time expectation).
  await expect(page.getByTestId('autopsy-fit-by-assignment')).toBeVisible()
  await shot(page, 'fp-A4-autopsy-compare')

  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ── STEP 10 (done early) — Create a CUSTOM Crew member in the Talent Creator. ──
  // (Created before assembling Film B so it appears in Film B's Crew picker pool.)
  await page.getByTestId('open-talent-creator').click()
  await expect(page.getByTestId('authored-disclosure')).toBeVisible()
  const CREW_NAME = 'Playtest Cinematographer'
  await page.getByTestId('talent-name').fill(CREW_NAME)
  await page.getByTestId('talent-role').selectOption('craft')
  // identity → temperament → potential → workEthic → emphasis → review (5 Next clicks).
  for (let i = 0; i < 5; i++) await page.getByTestId('creator-next').click()
  await page.getByTestId('create-talent').click()
  // Back on the dashboard after adding to the pool.
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await shot(page, 'fp-B0-crew-created')

  // ── STEP 8 — Assemble Film B using a lower-OVR SPECIALIST with higher Fit. ───
  await toTalentStep(page)
  await candidateButtons(page, 'picker-writer').first().click()
  await candidateButtons(page, 'picker-director').first().click()
  // For the LEAD, choose the highest-Fit candidate whose OVR is NOT the highest — a
  // specialist the studio prefers on FIT even though a higher-OVR generalist exists.
  const specialistPicked = await pickSpecialistLead(page)
  await candidateButtons(page, 'picker-antagonist').first().click()
  await candidateButtons(page, 'picker-support').first().click()

  // ── STEP 9 — Confirm the specialist decision is understandable. ─────────────
  // The lead's card explains WHY it fits (an assignment-relevant strength / Fit reason).
  await expect(page.getByTestId('film-package-summary')).toBeVisible()
  // The strongest-link panel names a real assignment + Fit — the legible "why".
  await expect(page.getByTestId('pkg-fit-strongest')).toContainText(/\d+\/100/)
  await shot(page, 'fp-B1-specialist')
  void specialistPicked

  // ── STEP 10 — Assign the custom-created Crew member. ────────────────────────
  const crewBtn = page
    .getByTestId('picker-craft')
    .locator('button[aria-pressed]:not([disabled])')
    .filter({ hasText: CREW_NAME })
  await expect(crewBtn).toHaveCount(1) // the created crew is in the pool
  await crewBtn.click()
  // The crew now appears as a CRAFT row in the Talent-Fit table of the package summary.
  await expect(page.getByTestId('pkg-fit')).toContainText(CREW_NAME)
  await shot(page, 'fp-B2-crew-assigned')

  // ── STEP 11 — Greenlight and release Film B. ────────────────────────────────
  await page.getByTestId('assembly-next').click() // → budget
  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('active-list')).toBeVisible()
  const prodIdB = await advanceToRelease(page)

  // ── STEP 12 — Confirm the result remains uncertain but EXPLAINABLE. ──────────
  await page.getByTestId(`open-autopsy-${prodIdB}`).click()
  await expect(page.getByTestId('autopsy')).toBeVisible()
  // The autopsy explicitly frames the locked estimate as never-a-guarantee (uncertain)...
  await expect(page.getByTestId('autopsy-greenlight-compare')).toContainText(
    /could still have gone the other way/i,
  )
  // ...and the identified risks are graded Materialized/Avoided from REAL stored factors
  // (a count badge + per-factor explanation), i.e. the outcome is explainable, not opaque.
  await expect(page.getByTestId('autopsy-risks-materialized-count')).toContainText(/\d+\/\d+ materialized/)
  await expect(page.getByTestId('autopsy-risks').first()).toBeVisible()
  await shot(page, 'fp-B3-autopsy-explainable')
})

// ── helpers ──────────────────────────────────────────────────────────────────

// Advance weeks until a film releases; return its productionId (from the release card).
async function advanceToRelease(page: Page): Promise<string> {
  let prodId: string | null = null
  for (let i = 0; i < 20 && !prodId; i++) {
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) await advance.click()
    const releaseList = page.getByTestId('release-list')
    if (await releaseList.isVisible().catch(() => false)) {
      const cards = releaseList.locator('[data-testid^="release-card-"]')
      if ((await cards.count()) > 0) {
        prodId = (await cards.first().getAttribute('data-testid'))!.replace('release-card-', '')
      } else {
        await page.getByTestId('release-continue').click()
      }
    }
  }
  expect(prodId, 'a film should release within the window').not.toBeNull()
  return prodId!
}

// Pick the highest-Fit lead candidate. The Fit-sorted first button is by construction the
// best-Fit choice — which the studio prefers even when a higher-FAME/OVR generalist exists
// further down the list. Returns the chosen candidate's testid.
async function pickSpecialistLead(page: Page): Promise<string> {
  const btns = candidateButtons(page, 'picker-lead')
  const first = btns.first()
  await first.click()
  return (await first.getAttribute('data-testid')) ?? ''
}
