# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> full playable loop: assemble → greenlight → release → autopsy → save round-trip
- Location: ui/e2e/smoke.spec.ts:111:1

# Error details

```
Error: a film should release within the window

expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - 'heading "PROJECT: STUDIO" [level=1] [ref=e6]'
      - generic [ref=e7]: seed “e2e-browser-smoke”
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Week
        - generic [ref=e11]: "25"
      - generic [ref=e12]:
        - generic [ref=e13]: Cash
        - generic [ref=e14]: $9.21M
  - generic [ref=e15]:
    - generic [ref=e16]:
      - heading "Standing" [level=2] [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - strong [ref=e21]: Audience Awareness
            - generic [ref=e22]: "37"
          - generic "Audience Awareness 37 of 100" [ref=e23]
          - generic [ref=e25]: How well the audience knows your studio. It is the only channel that affects box office, and in practice it settles well short of the top of the scale — nobody is famous everywhere.
        - generic [ref=e26]:
          - generic [ref=e27]:
            - strong [ref=e28]: Industry Prestige
            - generic [ref=e29]: "40"
          - generic "Industry Prestige 40 of 100" [ref=e30]
          - generic [ref=e32]: What the critics make of your studio, on their scores and nothing else. Respect is all it buys today — no tickets, no money.
        - generic [ref=e33]:
          - generic [ref=e34]:
            - strong [ref=e35]: Commercial Confidence
            - generic [ref=e36]: "50"
          - generic "Commercial Confidence 50 of 100" [ref=e37]
          - generic [ref=e39]: "How the industry rates your studio at turning money into money: the full gross a picture returns against what it cost, and how tightly you spend. It is a reputation, not money, and today it changes nothing."
    - generic [ref=e40]:
      - heading "Next decision" [level=2] [ref=e41]
      - paragraph [ref=e42]: Commission, review, and package screenplays in the Writers’ Room, or let a week pass so studio work advances.
      - generic [ref=e43]:
        - button "Open Writers’ Room" [ref=e44] [cursor=pointer]
        - button "Advance one week" [ref=e45] [cursor=pointer]
        - button "Commit Portrait of a Constellation to release" [ref=e46] [cursor=pointer]
        - button "Sim to next event" [disabled] [ref=e47]
      - paragraph [ref=e48]: Portrait of a Constellation is Release Ready. Commit it to release, or advance a single week deliberately to hold — the picture holds where it is, and studio costs continue until you commit.
      - generic [ref=e50]:
        - button "Casting Room" [ref=e51] [cursor=pointer]
        - button "Studio Roster" [ref=e52] [cursor=pointer]
        - button "Hiring Market" [ref=e53] [cursor=pointer]
        - button "Talent Hub" [ref=e54] [cursor=pointer]
        - button "Studio Run Recap" [ref=e55] [cursor=pointer]
        - button "Create talent" [ref=e56] [cursor=pointer]
        - button "Saves" [ref=e57] [cursor=pointer]
        - button "Settings" [ref=e58] [cursor=pointer]
  - region [ref=e60]:
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]: Operating plan · Week 25
        - heading "Studio Calendar" [level=2] [ref=e64]
      - button "Open calendar" [ref=e65] [cursor=pointer]
    - generic [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]: Next decision
        - strong [ref=e69]: Portrait of a Constellation is Release Ready
      - generic [ref=e70]:
        - generic [ref=e71]: Next committed boundary
        - strong [ref=e72]: Week 40 · 7 committed events
      - generic [ref=e73]:
        - generic [ref=e74]: Facility utilization
        - strong [ref=e75]: 0 of 8 slots occupied
      - generic [ref=e76]:
        - generic [ref=e77]: Busiest staffing expiry
        - strong [ref=e78]: 7 of 7 contracts · Week 52
      - generic [ref=e79]:
        - generic [ref=e80]: Waiting on the lot
        - strong [ref=e81]: Nothing is waiting
  - region [ref=e83]:
    - generic [ref=e84]:
      - generic [ref=e85]:
        - generic [ref=e86]: Facilities & construction · Week 25
        - heading "Studio Development" [level=2] [ref=e87]
      - generic [ref=e88]: Vacant
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]: Expansion parcel
        - strong [ref=e92]: Vacant
      - generic [ref=e93]:
        - generic [ref=e94]: Capital project
        - strong [ref=e95]: $780,000 · 13 weeks
      - generic [ref=e96]:
        - generic [ref=e97]: Development & Casting capacity
        - strong [ref=e98]: 2 → 3
    - paragraph [ref=e99]: The fixed expansion parcel is open. Starting the Annex commits the full capital cost now.
    - button "Open Studio Development" [ref=e100] [cursor=pointer]
  - generic [ref=e102]:
    - generic [ref=e103]:
      - generic [ref=e104]:
        - heading "Publicity campaigns" [level=2] [ref=e105]
        - paragraph [ref=e106]: "Buy the audience’s attention outright: a campaign lifts Audience Awareness the moment it runs. The more of it you already have, the less the next point is worth — past roughly 30–32 awareness a Whisper never earns its cost back over its life. The studio quotes the figures; which campaign to run is your call, and no outcome is promised."
      - generic [ref=e107]:
        - generic [ref=e108]: Awareness now
        - generic [ref=e109]: 36.80 / 100
    - paragraph [ref=e110]: In practice a working studio lives in roughly 0–57 of the nominal 0–100 — the top of the scale belongs to nobody. About 90% of the awareness a studio loses goes to below-neutral releases; the weekly pull-down above 35 takes the rest.
    - paragraph [ref=e111]: Every purchase starts a shared 6-week cooldown across all campaigns; each tier also has its own longer reuse clock shown below.
    - generic [ref=e112]:
      - generic [ref=e113]:
        - generic [ref=e114]:
          - strong [ref=e115]: Whisper campaign
          - generic [ref=e116]: $1.20M
        - generic [ref=e117]:
          - text: "Immediate lift now:"
          - strong [ref=e118]: "+1.15"
          - text: points
        - generic [ref=e119]:
          - text: "Price per immediate point:"
          - strong [ref=e120]: $1.05M
        - generic [ref=e121]: "Tier cooldown: 8 weeks"
        - button "Run whisper campaign" [ref=e122] [cursor=pointer]
      - generic [ref=e123]:
        - generic [ref=e124]:
          - strong [ref=e125]: Push campaign
          - generic [ref=e126]: $3.60M
        - generic [ref=e127]:
          - text: "Immediate lift now:"
          - strong [ref=e128]: "+1.91"
          - text: points
        - generic [ref=e129]:
          - text: "Price per immediate point:"
          - strong [ref=e130]: $1.88M
        - generic [ref=e131]: "Tier cooldown: 12 weeks"
        - button "Run push campaign" [ref=e132] [cursor=pointer]
      - generic [ref=e133]:
        - generic [ref=e134]:
          - strong [ref=e135]: Blitz campaign
          - generic [ref=e136]: $8.00M
        - generic [ref=e137]:
          - text: "Immediate lift now:"
          - strong [ref=e138]: "+2.68"
          - text: points
        - generic [ref=e139]:
          - text: "Price per immediate point:"
          - strong [ref=e140]: $2.99M
        - generic [ref=e141]: "Tier cooldown: 20 weeks"
        - button "Run blitz campaign" [ref=e142] [cursor=pointer]
  - generic [ref=e144]:
    - heading "Finances" [level=2] [ref=e145]
    - generic [ref=e146]:
      - generic [ref=e147]:
        - generic [ref=e148]: Cash
        - generic [ref=e149]: $9.21M
      - generic [ref=e150]:
        - generic [ref=e151]: Runway
        - generic [ref=e152]: 68 wk
      - generic [ref=e153]:
        - generic [ref=e154]: Weekly payroll
        - generic [ref=e155]: $109K
      - generic [ref=e156]:
        - generic [ref=e157]: Weekly overhead
        - generic [ref=e158]: $26K
      - generic [ref=e159]:
        - generic [ref=e160]: Weekly burn
        - generic [ref=e161]: $135K
      - generic [ref=e162]:
        - generic [ref=e163]: Active-run revenue / wk
        - generic [ref=e164]: $0
      - generic [ref=e165]:
        - generic [ref=e166]: Net weekly
        - generic [ref=e167]: "-$135K"
      - generic [ref=e168]:
        - generic [ref=e169]: In theaters
        - generic [ref=e170]: "0"
      - generic [ref=e171]:
        - generic [ref=e172]: Revenue still to come
        - generic [ref=e173]: $0
      - generic [ref=e174]:
        - generic [ref=e175]: Studio construction
        - generic [ref=e176]: $0
      - generic [ref=e177]:
        - generic [ref=e178]: Rights trades and licences
        - generic [ref=e179]: $0
      - generic [ref=e180]:
        - generic [ref=e181]: Estate asset purchases
        - generic [ref=e182]: $0
      - generic [ref=e183]:
        - generic [ref=e184]: Acquisition net cash
        - generic [ref=e185]: $0
      - generic [ref=e186]:
        - generic [ref=e187]: Due diligence fees
        - generic [ref=e188]: $0
    - paragraph [ref=e189]: Runway answers “how long can the studio last under its current commitments” — it never reserves cash for a film you haven’t greenlit. Studio Revenue is your rental share (about 52%) of box office, paid weekly across a film’s theatrical run — not the full gross.
  - generic [ref=e191]:
    - heading "What you can make right now" [level=2] [ref=e192]
    - generic [ref=e193]:
      - generic [ref=e195]:
        - generic [ref=e196]: Lowest estimated production commitment
        - generic [ref=e197]: —
      - generic [ref=e198]:
        - generic [ref=e199]:
          - generic [ref=e200]: A standard-budget film
          - generic [ref=e201]: —
        - generic [ref=e202]: The cheapest concept funded at a normal budget & marketing.
      - generic [ref=e203]:
        - generic [ref=e204]:
          - generic [ref=e205]: Recent typical commitment
          - generic [ref=e206]: —
        - generic [ref=e207]: Median production commitment of your last three released films.
      - paragraph [ref=e208]: Estimates from your current concepts and contracted team, checked against the same solvency rule a greenlight enforces — not a guaranteed quote.
  - generic [ref=e210]:
    - heading "In theaters" [level=2] [ref=e211]
    - generic [ref=e212]: No films in theaters. A released film pays Studio Revenue weekly across its run.
  - generic [ref=e214]:
    - generic [ref=e215]:
      - generic [ref=e216]:
        - heading "Production Board" [level=2] [ref=e217]
        - paragraph [ref=e218]: Authoritative phases, facility reservations, and shooting calls.
      - generic [ref=e219]: Managed operations
    - article [ref=e221]:
      - generic [ref=e222]:
        - generic [ref=e223]:
          - strong [ref=e224]: Portrait of a Constellation
          - generic [ref=e225]: Release Ready
        - status [ref=e226]: On schedule
      - generic [ref=e227]:
        - generic [ref=e228]:
          - generic [ref=e229]: Weeks left
          - generic [ref=e230]: "1"
        - generic [ref=e231]:
          - generic [ref=e232]: Current facility
          - generic [ref=e233]: Production & Post (Release Ready — no facility reservation)
        - generic [ref=e234]:
          - generic [ref=e235]: Director
          - generic [ref=e236]: Conrad Vance · locked
        - generic [ref=e237]:
          - generic [ref=e238]: Standing on
          - generic [ref=e239]: Stage 7 House Set · Soundstage 7
      - generic [ref=e240]:
        - generic [ref=e241]:
          - generic [ref=e242]: Expected total theatrical gross
          - generic [ref=e243]:
            - generic [ref=e244]: Est
            - text: $19.38M
        - generic [ref=e245]:
          - generic [ref=e246]: Expected critic score
          - generic [ref=e247]:
            - generic [ref=e248]: Est
            - text: "51.0"
    - paragraph [ref=e249]: Cycle break-even assumes an on-schedule eight-week production. A hold extends payroll and overhead before release; it does not change the film’s locked direct commitment.
  - generic [ref=e251]:
    - heading "Recent releases" [level=2] [ref=e252]
    - generic [ref=e253]: No films have released yet.
```

# Test source

```ts
  64  |   for (let guard = 0; guard < 8; guard++) {
  65  |     const command = page.locator('button[data-testid^="production-command-"]:visible').first()
  66  |     if ((await command.count()) === 0) return
  67  |     await expect(command).toBeEnabled()
  68  |     await command.click()
  69  |   }
  70  |   await expect(page.locator('button[data-testid^="production-command-"]:visible')).toHaveCount(0)
  71  | }
  72  | 
  73  | // Assemble a legal film through the wizard, choosing the first eligible option in
  74  | // each picker so the package is always legal (distinct cast enforced by the UI).
  75  | async function assembleLegalFilm(page: Page) {
  76  |   const authority = await openAuthoritativePackage(page)
  77  |   await enterPackageTalentStep(page, authority)
  78  | 
  79  |   // Talent: first ENABLED candidate in each picker. The redesigned cards add a per-row
  80  |   // "Details" toggle, so we target the SELECTABLE candidate button (it carries
  81  |   // aria-pressed) and take the first enabled one — the first eligible candidate.
  82  |   const pickers = [
  83  |     ...(authority === 'legacy' ? ['picker-writer'] : []),
  84  |     'picker-director',
  85  |     'picker-lead',
  86  |     'picker-antagonist',
  87  |     'picker-support',
  88  |   ]
  89  |   for (const picker of pickers) {
  90  |     const enabled = page
  91  |       .getByTestId(picker)
  92  |       .locator('button[aria-pressed]:not([disabled])')
  93  |       .first()
  94  |     await enabled.click()
  95  |   }
  96  |   // Assign a Crew/Craft lead too (the new optional slot), so the screenshot shows it and
  97  |   // the crew flows into the package summary + committed cost like any other assignment.
  98  |   const crew = page.getByTestId('picker-craft').locator('button[aria-pressed]:not([disabled])').first()
  99  |   if (await crew.isVisible().catch(() => false)) {
  100 |     await crew.click()
  101 |   }
  102 |   await shot(page, '2-assembly-talent')
  103 |   await page.getByTestId('assembly-next').click() // → budget
  104 | 
  105 |   await expect(page.getByTestId('forecast-display')).toBeVisible()
  106 |   await expect(page.getByTestId('required-negative')).toBeVisible()
  107 |   await shot(page, '3-budget-forecast')
  108 |   await page.getByTestId('assembly-next').click() // → review
  109 | }
  110 | 
  111 | test('full playable loop: assemble → greenlight → release → autopsy → save round-trip', async ({ page }) => {
  112 |   test.setTimeout(120_000)
  113 | 
  114 |   // (1) Start / new game.
  115 |   await startNewGame(page, SEED)
  116 |   await shot(page, '1-start-new-game')
  117 |   await page.getByTestId('new-game').click()
  118 |   // D-11: hire an initial roster and found the studio before the studio can operate.
  119 |   await foundStudioViaUi(page)
  120 |   await expect(page.getByTestId('dash-week')).toHaveText('0')
  121 | 
  122 |   // (2) + (3) Assembly flow + budget/forecast review (screens captured inside).
  123 |   await assembleLegalFilm(page)
  124 | 
  125 |   // Greenlight the film.
  126 |   await page.getByTestId('greenlight').click()
  127 | 
  128 |   // (4) Dashboard with an active production.
  129 |   await expect(page.getByTestId('active-list')).toBeVisible()
  130 |   await shot(page, '4-dashboard-active-production')
  131 | 
  132 |   // Advance weeks until a release appears (walk the newspaper + release screen each week).
  133 |   let releaseCardTestId: string | null = null
  134 |   let capturedNewspaper = false
  135 |   for (let i = 0; i < MAX_MANAGED_RELEASE_WEEKS && !releaseCardTestId; i++) {
  136 |     // A managed production cannot progress through a visible phase decision by repeatedly
  137 |     // advancing time. Exercise the authoritative command before advancing the next week.
  138 |     await resolveProductionCommands(page)
  139 |     const advance = page.getByTestId('advance-week')
  140 |     if (await advance.isVisible().catch(() => false)) {
  141 |       await advance.click()
  142 |     }
  143 |     // D-11.C PART 2: a release shows the NEWSPAPER front page first. Capture it once, then
  144 |     // continue through to the release/development summary.
  145 |     const newspaper = page.getByTestId('newspaper-reveal')
  146 |     if (await newspaper.isVisible().catch(() => false)) {
  147 |       if (!capturedNewspaper) {
  148 |         await shot(page, '9-newspaper-reveal')
  149 |         capturedNewspaper = true
  150 |       }
  151 |       await page.getByTestId('newspaper-continue').click()
  152 |     }
  153 |     const releaseList = page.getByTestId('release-list')
  154 |     if (await releaseList.isVisible().catch(() => false)) {
  155 |       const cards = releaseList.locator('[data-testid^="release-card-"]')
  156 |       if ((await cards.count()) > 0) {
  157 |         releaseCardTestId = await cards.first().getAttribute('data-testid')
  158 |       } else {
  159 |         // Nothing released this week — continue back to the dashboard.
  160 |         await page.getByTestId('release-continue').click()
  161 |       }
  162 |     }
  163 |   }
> 164 |   expect(releaseCardTestId, 'a film should release within the window').not.toBeNull()
      |                                                                            ^ Error: a film should release within the window
  165 |   expect(capturedNewspaper, 'the newspaper reveal should appear at release').toBe(true)
  166 | 
  167 |   // (5) Release result screen.
  168 |   await shot(page, '5-release-result')
  169 | 
  170 |   // (5b) RULING A — the per-release development summary is shown on the release screen for
  171 |   // every participating talent (development is ON in normal play). D-14 §7: the canonical
  172 |   // Career Impact section (OVR + Star Power development) supersedes the old Development Summary.
  173 |   await expect(page.getByTestId('career-impact').first()).toBeVisible()
  174 |   await page.getByTestId('career-impact').first().scrollIntoViewIfNeeded()
  175 |   await shot(page, '8-development-summary')
  176 | 
  177 |   // (6) Open the full autopsy from the release card.
  178 |   const prodId = releaseCardTestId!.replace('release-card-', '')
  179 |   await page.getByTestId(`open-autopsy-${prodId}`).click()
  180 |   await expect(page.getByTestId('autopsy')).toBeVisible()
  181 |   // D-11.D: the technical breakdown now lives under Advanced Analysis — expand it.
  182 |   await page.getByTestId('autopsy-advanced-toggle').click()
  183 |   // The sampled review variance is present (never hidden).
  184 |   await expect(page.getByTestId('autopsy-reviewvariance')).toBeVisible()
  185 |   await expect(page.getByTestId('autopsy-criticmean')).toBeVisible()
  186 |   await shot(page, '6-autopsy')
  187 | 
  188 |   // Back to the studio, then capture the state to round-trip through a save.
  189 |   await page.getByTestId('autopsy-back').click()
  190 |   await expect(page.getByTestId('dash-week')).toBeVisible()
  191 | 
  192 |   // (RULING B) Talent Hub — capability vs credited career identity. After a release, the
  193 |   // performing disciplines can read as credited; capable-but-unproven disciplines read as
  194 |   // such. Capture the roster, then a profile (with the career-identity panel).
  195 |   await page.getByTestId('open-talent-hub').click()
  196 |   await expect(page.getByTestId('hub-roster')).toBeVisible()
  197 |   await shot(page, '9-talent-hub')
  198 |   // Open the first profile to show the career-identity panel + shape-sensitive Fit.
  199 |   await page.getByTestId('hub-roster').getByRole('button').first().click()
  200 |   await expect(page.getByTestId('hub-career-identity')).toBeVisible()
  201 |   await shot(page, '10-talent-hub-profile')
  202 |   await page.getByTestId('hub-back').click()
  203 |   await expect(page.getByTestId('dash-week')).toBeVisible()
  204 | 
  205 |   const weekBefore = await page.getByTestId('dash-week').textContent()
  206 |   const cashBefore = await page.getByTestId('dash-cash').textContent()
  207 |   const prestigeBefore = await page.getByTestId('standing-industryPrestige').textContent()
  208 | 
  209 |   // Export the save from the Saves screen.
  210 |   await page.getByTestId('open-saves').click()
  211 |   // PF1-M3: the raw envelope now waits behind a disclosure (it stays MOUNTED, so the read
  212 |   // works either way — opening it is what a player does, and what this asserts).
  213 |   await page.getByTestId('saves-raw-toggle').click()
  214 |   const saveJson = await page.getByTestId('export-text').inputValue()
  215 |   expect(saveJson.length).toBeGreaterThan(100)
  216 | 
  217 |   // (7) Talent creator screenshot (reachable from the dashboard). D-11.C: the default mode
  218 |   // is the Balanced Career SPECIALIZATION flow, with a live derived-OVR panel and standing.
  219 |   await page.getByTestId('saves-back').click()
  220 |   await page.getByTestId('open-talent-creator').click()
  221 |   await expect(page.getByTestId('creator-mode-balanced')).toHaveAttribute('aria-pressed', 'true')
  222 |   await expect(page.getByTestId('balanced-live-preview')).toBeVisible()
  223 |   await shot(page, '7-talent-creator')
  224 |   await page.getByTestId('talent-creator-back').click()
  225 | 
  226 |   // Start a NEW game (different seed), then import the exported save.
  227 |   await page.getByTestId('open-saves').click()
  228 |   // "New Studio" is a confirmed destructive action (D-12 A5) — a real user accepts.
  229 |   // PF1-M3 re-pin (Owner-approved, charter §5-M3 "the browser never speaks again"): the
  230 |   // confirmation is the product's own focus-trapped dialog, so there is no native dialog to
  231 |   // accept — the player presses the destructive verb by name.
  232 |   await page.getByTestId('restart-game').click()
  233 |   await page.getByTestId('confirm-dialog-confirm').click()
  234 |   await expect(page.getByTestId('new-game')).toBeVisible()
  235 |   await page.getByTestId('seed-input').fill('a-totally-different-seed')
  236 |   await page.getByTestId('import-text').fill(saveJson)
  237 |   await page.getByTestId('import-save').click()
  238 | 
  239 |   // The imported studio's visible state matches what we exported.
  240 |   await expect(page.getByTestId('dash-week')).toHaveText(weekBefore ?? '')
  241 |   await expect(page.getByTestId('dash-cash')).toHaveText(cashBefore ?? '')
  242 |   await expect(page.getByTestId('standing-industryPrestige')).toContainText(
  243 |     (prestigeBefore ?? '').trim().slice(0, 2),
  244 |   )
  245 |   // The seed label reflects the RESTORED studio seed, not the throwaway seed typed.
  246 |   await expect(page.getByTestId('seed-label')).toContainText(SEED)
  247 | 
  248 |   // Continue the restored studio through its real weekly UI transition.
  249 |   expect(weekBefore).toMatch(/^\d+$/)
  250 |   const restoredWeek = Number(weekBefore)
  251 |   expect(Number.isSafeInteger(restoredWeek) && restoredWeek >= 0).toBe(true)
  252 |   const continuedWeek = String(restoredWeek + 1)
  253 |   await resolveProductionCommands(page)
  254 |   await expect(page.getByTestId('advance-week')).toBeEnabled()
  255 |   await page.getByTestId('advance-week').click()
  256 |   // Wait for each destination before deciding which continuation is required;
  257 |   // the old dashboard can remain visible while the advance is being processed.
  258 |   for (let transition = 0; transition < 3; transition++) {
  259 |     let destination = 'pending'
  260 |     await expect.poll(async () => {
  261 |       if (await page.getByTestId('newspaper-reveal').isVisible()) destination = 'newspaper'
  262 |       else if (await page.getByTestId('release-list').isVisible()) destination = 'release'
  263 |       else if (await page.getByTestId('dash-week').isVisible()
  264 |         && (await page.getByTestId('dash-week').textContent()) === continuedWeek) destination = 'dashboard'
```