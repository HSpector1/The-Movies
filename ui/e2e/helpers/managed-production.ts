import { expect, type Page } from '@playwright/test'

/**
 * Open the package wizard through whichever screenplay authority owns the loaded studio.
 *
 * Migrated studios may still expose legacy direct assembly. A studio founded through the
 * current player flow is managed: commission a screenplay, advance exactly to its review,
 * accept it, then open its locked package. The helper deliberately drives only visible App
 * controls; it never writes GameState or calls the Engine from the browser harness.
 */
export async function openAuthoritativePackage(page: Page): Promise<'legacy' | 'managed'> {
  await page.getByTestId('assemble-film').click()
  const assembly = page.getByTestId('assembly-steps')
  const writersRoom = page.getByTestId('writers-room')
  await expect(assembly.or(writersRoom).first()).toBeVisible()
  if (await assembly.isVisible()) return 'legacy'

  await expect(writersRoom).toBeVisible()
  await page.getByTestId('commission-open').click()
  await expect(page.getByTestId('commission-submit')).toBeEnabled()
  await page.getByTestId('commission-submit').click()

  await page.getByTestId('writers-room-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('sim-to-event').click()
  await expect(page.getByTestId('period-summary')).toBeVisible()
  await page.getByTestId('period-continue').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()

  const accept = page.locator('[data-testid^="script-action-acceptScript-"]').first()
  await expect(accept).toBeVisible()
  await accept.click()
  const openPackage = page.locator('[data-testid^="script-action-openPackage-"]').first()
  await expect(openPackage).toBeVisible()
  await openPackage.click()
  await expect(assembly).toBeVisible()
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)
  return 'managed'
}

/** Move either package shape to the shared Talent step. */
export async function enterPackageTalentStep(
  page: Page,
  authority: 'legacy' | 'managed',
): Promise<void> {
  if (authority === 'managed') {
    await expect(page.getByTestId('step-talent')).toHaveClass(/active/)
    return
  }

  await page.getByTestId('concept-grid').getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // concept → shape
  await page.getByTestId('assembly-next').click() // shape → promise
  await page.getByTestId('assembly-next').click() // promise → talent
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)
}
