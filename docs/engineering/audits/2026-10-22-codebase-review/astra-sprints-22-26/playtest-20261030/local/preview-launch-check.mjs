// Launch check of the SERVED BUILD on http://127.0.0.1:4180 in an isolated Chrome context (no user profile, no storage).
import { chromium } from '/Users/zacheryspector/The-Movies-headless-program/node_modules/playwright/index.mjs'
import { createHash } from 'node:crypto'
const base = 'http://127.0.0.1:4180'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
const response = await page.goto(base + '/', { waitUntil: 'load' })
const html = await response.text()
console.log('index sha256', createHash('sha256').update(html).digest('hex'), 'status', response.status())
await page.getByTestId('title-card').waitFor({ state: 'visible', timeout: 15000 })
await page.getByTestId('new-game').waitFor({ state: 'visible' })
console.log('start screen: title card and New game visible; import box present:', await page.getByTestId('import-save').count())
await page.screenshot({ path: process.argv[2] + '/01-start.png' })
await page.getByTestId('seed-input').fill('owner-playtest-check')
await page.getByTestId('new-game').click()
await page.getByTestId('found-studio').waitFor({ state: 'visible', timeout: 15000 })
console.log('founding screen reached: Found studio control visible')
await page.screenshot({ path: process.argv[2] + '/02-founding.png' })
const scripts = await page.evaluate(() => Array.from(document.scripts).map((s) => s.src).filter(Boolean))
console.log('served script chunks:', scripts.map((s) => s.replace(base, '')).join(' '))
console.log('errors:', errors.length === 0 ? 'none' : errors.join(' | '))
await browser.close()
if (errors.length) process.exit(2)
