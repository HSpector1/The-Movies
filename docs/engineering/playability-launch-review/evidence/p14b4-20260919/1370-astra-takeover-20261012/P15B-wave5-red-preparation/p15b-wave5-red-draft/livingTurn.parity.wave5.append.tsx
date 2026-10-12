// Proposed append to ui/src/lot/livingTurn.parity.test.tsx, reusing its existing renderer/mountLot/spend/sessionSave.
// No copied App/renderer harness. Existing MOUNTED_ARM_TIMEOUT_MS60s unchanged.
// Add import namespace coreSave from '../../../src/core/save.ts', coreTick from '../../../src/core/tick.ts',
// readFileSync/resolve/gunzipSync/createHash, corporateNotices, contractLoan/loanMaxPrincipal/studioWeeklyFixedCost.
// Namespaced imports avoid colliding with existing core/adapter identifiers.
// This helper is a labelled fixture control, not a new gameplay route.
function wave5FixtureAt(week: number): GameState {
  const gz = readFileSync(resolve(process.cwd(), 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))
  expect(createHash('sha256').update(gz).digest('hex')).toBe('af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  const initial = coreSave.migrateToLive(coreSave.importSave(gunzipSync(gz).toString('utf8'))).state as GameState
  const amount = Math.floor(initial.studio.cash) + 1
  let state: GameState = { ...initial, studio: { ...initial.studio, cash: initial.studio.cash - amount }, ledger: [...initial.ledger,
    { week: initial.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
  while (state.market.tick < week) state = coreTick.tick(state)
  expect(() => coreSave.makeSave(state)).not.toThrow(); return state
}
it('Wave5 mounted warning presents terms before lawful loan commit and autosaves one receipt', async () => {
  const initial = wave5FixtureAt(134)
  const fixed = studioWeeklyFixedCost(initial, initial.hollywood!.playerStudioId)
  const terms = contractLoan(loanMaxPrincipal(fixed), fixed, initial.market.tick)
  await mountLot(initial)
  expect(screen.getByText(corporateNotices(initial).find(n => n.id === 'corporate-warning')!.message)).toBeVisible()
  // Actual schedule rendered before commitment, not a renderer-authored maximum/interest approximation.
  expect(screen.getByText(new RegExp(`${terms.installments.length} weeks`))).toBeVisible()
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /take.*studio loan/i })) })
  const restored = loadActiveSession(); expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error(restored.reason)
  expect(restored.state.studio.cash).toBe(initial.studio.cash + terms.principal)
  expect(restored.state.corporateCondition.loans.filter(l => l.studioId === initial.hollywood!.playerStudioId)).toHaveLength(1)
  expect(screen.queryByRole('button', { name: /take.*studio loan/i })).toBeNull()
}, MOUNTED_ARM_TIMEOUT_MS)
it('Wave5 living loop commits terminal once and keeps history/export accessible without operating verbs', async () => {
  const initial = wave5FixtureAt(162)
  const expected = coreTick.tick(initial); const c = expected.studioClosure.closures.find(c => c.studioId === expected.hollywood!.playerStudioId)!
  expect(c.closureWeek).toBe(163)
  await mountLot(initial)
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /roll|play|run/i })) })
  await spendWeeks(3) // Existing witnessed fake-clock pacing; no independent simulation scheduler.
  expect(shownWeek()).toBe(163); expect(sessionSave()).toBe(exportSaveJson(expected))
  expect(screen.getByText(corporateNotices(expected).find(n => n.id === 'corporate-closed')!.message)).toBeVisible()
  expect(screen.getByRole('button', { name: /advance one week/i })).toBeDisabled()
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
