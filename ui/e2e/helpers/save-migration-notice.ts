// ── The migrated-save acknowledgement, proved and then cleared ───────────────
//
// V14 boundary follow-up (C2a-M1). Several browser-acceptance suites seed a COMMITTED
// SaveFileV13 fixture into the active session. Before the V14 bump those files were the
// current format, `restore.converted` was false, and the app rendered nothing extra. They
// are legacy now, so `App` correctly raises its one-session acknowledgement above the
// screen — `An older save was upgraded to the current format.` — a 92.5px banner (80.5px
// card + 12px margin) that every seeded session inherits.
//
// That is right for the player and wrong for a VIEWPORT measurement. `.lot-screen` is
// `min-height: 100vh`, so a banner above it pushes exactly its own height of lot below the
// fold, and a suite asking "is this panel reachable at 1920x1080" was measuring the lot plus
// a dismissible notice rather than the lot.
//
// So the notice is acknowledged the way a player acknowledges it — and the acknowledgement
// is ASSERTED, not assumed. Requiring the banner to be there is a claim these suites never
// made before: that seeding a pinned V13 artefact really does migrate, and that the product
// says so. Requiring it to be gone afterwards is a claim that Dismiss works. Neither
// assertion existed while the banner was invisible to the format.

import { expect, type Page } from '@playwright/test'

/**
 * Acknowledge the migrated-save banner a pinned SaveFileV13 fixture legitimately raises,
 * so what follows measures the screen under test and nothing above it.
 *
 * Fails if the banner is absent: a seeded pinned fixture MUST report itself as upgraded.
 */
export async function acknowledgeMigratedSaveNotice(page: Page): Promise<void> {
  await expect(
    page.getByTestId('save-migration-notice'),
    'a pinned SaveFileV13 fixture must report itself as an upgraded older save',
  ).toBeVisible()
  await page.getByTestId('save-migration-dismiss').click()
  await expect(page.getByTestId('save-migration-notice')).toHaveCount(0)
}
