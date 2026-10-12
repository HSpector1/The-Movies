// Proposed append to ui/src/lot/livingTurn.parity.test.tsx, reusing its existing renderer/mountLot/spend/sessionSave.
// No copied App/renderer harness. Existing MOUNTED_ARM_TIMEOUT_MS60s unchanged.
// Add import namespace coreSave from '../../../src/core/save.ts', coreTick from '../../../src/core/tick.ts',
// readFileSync/resolve/gunzipSync/createHash, corporateNotices, contractLoan/loanMaxPrincipal/studioWeeklyFixedCost, TUNING and moneyExact/within.
// Namespaced imports avoid colliding with existing core/adapter identifiers.
// This helper is a labelled fixture control, not a new gameplay route.
function wave5FixtureAt(week: number): GameState {
  const gz = readFileSync(resolve(process.cwd(), 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))
  expect(createHash('sha256').update(gz).digest('hex')).toBe('af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  const initial = coreSave.migrateToLive(coreSave.importSave(gunzipSync(gz).toString('utf8'))).state as GameState
  expect(() => coreSave.makeSave(initial), 'baseline admission before debit').not.toThrow()
  const amount = Math.floor(initial.studio.cash) + 1
  let state: GameState = { ...initial, studio: { ...initial.studio, cash: initial.studio.cash - amount }, ledger: [...initial.ledger,
    { week: initial.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
  expect(() => coreSave.makeSave(state), 'labelled debit must admit before ticking').not.toThrow()
  while (state.market.tick < week) state = coreTick.tick(state)
  expect(() => coreSave.makeSave(state)).not.toThrow(); return state
}
it('Wave5 mounted warning presents terms before lawful loan commit and autosaves one receipt', async () => {
  const initial = wave5FixtureAt(134)
  const fixed = studioWeeklyFixedCost(initial, initial.hollywood!.playerStudioId)
  const principal = TUNING.LOAN_AMOUNT_STEP
  expect(loanMaxPrincipal(fixed)).toBeGreaterThan(principal) // C17: this case must exercise a real nonmaximum legal choice.
  const terms = contractLoan(principal, fixed, initial.market.tick)
  await mountLot(initial)
  expect(screen.getByText(corporateNotices(initial).find(n => n.id === 'corporate-warning')!.message)).toBeVisible()
  // Existing core permits each positive step up to actual maximum; no new loan gameplay authority.
  const principalChoice = screen.getByRole('combobox', { name: /loan principal/i })
  await act(async () => { fireEvent.change(principalChoice, { target: { value: String(principal) } }) })
  const offer = screen.getByRole('region', { name: /studio loan offer/i }) // proposed bounded accessible offer owner
  expect(within(offer).getByText(moneyExact(terms.principal), { exact: true })).toBeVisible()
  expect(within(offer).getByText(moneyExact(terms.total), { exact: true })).toBeVisible()
  const schedule = screen.getByRole('table', { name: /studio loan repayment schedule/i })
  const rows = within(schedule).getAllByRole('row').slice(1)
  expect(rows).toHaveLength(terms.installments.length)
  for (const [i, amount] of terms.installments.entries()) {
    expect(within(rows[i]!).getByText(`Week ${initial.market.tick + i + 1}`, { exact: true })).toBeVisible()
    expect(within(rows[i]!).getByText(moneyExact(amount), { exact: true })).toBeVisible()
  }
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /take.*studio loan/i })) })
  const restored = loadActiveSession(); expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error(restored.reason)
  expect(restored.state.studio.cash).toBe(initial.studio.cash + terms.principal)
  expect(restored.state.corporateCondition.loans.filter(l => l.studioId === initial.hollywood!.playerStudioId)).toHaveLength(1)
  expect(screen.queryByRole('button', { name: /take.*studio loan/i })).toBeNull()
}, MOUNTED_ARM_TIMEOUT_MS)
it('Wave5 living loop commits terminal once and keeps history/export accessible without operating verbs', async () => {
  const initial = wave5FixtureAt(162)
  const expected = coreTick.tick(initial, { develop: true }); const c = expected.studioClosure.closures.find(c => c.studioId === expected.hollywood!.playerStudioId)!
  expect(c.closureWeek).toBe(163)
  await mountLot(initial)
  await act(async () => { fireEvent.click(screen.getByTestId('lot-transport-toggle')) })
  await spendWeeks(3) // Existing witnessed fake-clock pacing; no independent simulation scheduler.
  expect(shownWeek()).toBe(163); expect(sessionSave()).toBe(exportSaveJson(expected))
  expect(screen.getByText(corporateNotices(expected).find(n => n.id === 'corporate-closed')!.message)).toBeVisible()
  expect(screen.getByTestId('lot-advance-week')).toBeDisabled()
  const saved = sessionSave(); await spendWeeks(3); expect(sessionSave()).toBe(saved)
  // Retained history/save navigation stays available; no operating command hidden behind a stale overlay.
  expect(screen.getByTestId('lot-open-saves')).not.toBeDisabled()
  expect(screen.queryByRole('button', { name: /take.*studio loan/i })).toBeNull()
  const restored = loadActiveSession(); expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error(restored.reason)
  expect(() => coreSave.makeSave(restored.state)).not.toThrow()
}, MOUNTED_ARM_TIMEOUT_MS)
// Remaining host obligation: drive actual SavedStudio import/reload UI and confirm an unsupported due-only
// draft refuses BEFORE replacing an existing active session. Adapter-only import assertions are not that host proof.
