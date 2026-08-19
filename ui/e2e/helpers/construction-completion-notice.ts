// ── The build-completion card, proved and then put down ──────────────────────
//
// C2a-M4. When a committed build reaches Operational, the lot raises a card that says
// so. It is `position: absolute` over the middle of the world at `z-index: 18`, and it
// deliberately swallows world input so that reading it never moves the lot. Both of
// those are correct, and until M4 there was no way to close it — so the announcement of
// the building the player just finished stood on top of the buildings they wanted to
// click next, until they advanced another week.
//
// Two journeys measured exactly that: a click meant for the Development building landed
// on this card's heading instead (`c1-golden-path-v1` Act 6, `tycoon-build-catalog-v1`
// §3). The product grew a close control; these helpers use it the way a player does.
//
// The assertions are a TIGHTENING, not an accommodation. Requiring the card to be there
// is a claim the suites already make elsewhere — the product announces a finished
// building. Requiring it to be GONE afterwards is a new claim neither suite could make
// before: that the announcement can be dismissed, and that dismissing it gives the world
// back.

import { expect, type Page } from '@playwright/test'

/**
 * Put down the build-completion card the lot raises when a facility opens.
 *
 * Fails if the card is absent: callers use this immediately after a build completes,
 * where its absence would mean the product stopped announcing a finished building.
 */
export async function dismissConstructionCompletionNotice(page: Page): Promise<void> {
  await expect(
    page.getByTestId('annex-completion-summary'),
    'a build that reached Operational must announce itself on the lot',
  ).toBeVisible()
  await page.getByTestId('lot-event-notice-dismiss').click()
  await expect(page.getByTestId('annex-completion-summary')).toHaveCount(0)
}

/**
 * The same, where the journey does not know whether a build completed on the last
 * advance. Absent is a legitimate answer here, so it is not an error — but when the card
 * IS up, it is still asserted gone afterwards.
 */
export async function clearConstructionCompletionNotice(page: Page): Promise<void> {
  if ((await page.getByTestId('annex-completion-summary').count()) === 0) return
  await dismissConstructionCompletionNotice(page)
}
