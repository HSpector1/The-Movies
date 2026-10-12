// Proposed append to existing ui/src/saves.test.tsx: reuse App/Saves + openCurrentStudioThroughStart.
// No new host/renderer framework. Add namespaced imports coreSave/coreTick, loadActiveSession,
// vi from vitest, node fs/path/zlib/crypto and budgeted/FIXTURE_MS from ../../tests/helpers/p15c2-legacy.ts.
// Existing beforeEach selects dashboard route (Lot override false); test BOTH actual App and session owner.
function wave5SaveControl(week: number, debit = true): GameState {
  const gz = readFileSync(resolve(process.cwd(), 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))
  expect(createHash('sha256').update(gz).digest('hex')).toBe('af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  let state = coreSave.migrateToLive(coreSave.importSave(gunzipSync(gz).toString('utf8'))).state as GameState
  expect(() => coreSave.makeSave(state), 'migrated baseline before constructor').not.toThrow()
  if (debit) {
    const amount = Math.floor(state.studio.cash) + 1
    state = { ...state, studio: { ...state.studio, cash: state.studio.cash - amount }, ledger: [...state.ledger,
      { week: state.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
  }
  expect(() => coreSave.makeSave(state), 'constructed debit admitted before any tick').not.toThrow()
  while (state.market.tick < week) state = coreTick.tick(state)
  expect(() => coreSave.makeSave(state)).not.toThrow(); return state
}
function acceptedActiveState(): GameState {
  const session = loadActiveSession(); expect(session.ok).toBe(true)
  if (!session.ok) throw new Error(session.reason)
  return session.state
}
it('Wave5 genuine47 normal import replaces App session prospectively without old notices', budgeted(FIXTURE_MS, () => {
  localStorage.clear(); openCurrentStudioThroughStart('wave5-host-47-existing')
  const source = wave5SaveControl(130, false)
  const historical = coreSave.migrateToV47(coreSave.makeSave(source))
  expect(() => coreSave.validateSaveV47(historical)).not.toThrow()
  const historicalText = coreSave.exportSave(historical), bytes = coreSave.stableStringify(historical)
  fireEvent.click(screen.getByTestId('open-saves'))
  fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: historicalText } })
  fireEvent.click(screen.getByTestId('saves-import'))
  const restored = acceptedActiveState()
  expect(exportSaveJson(restored)).toBe(coreSave.exportSave(coreSave.migrateToLive(historical)))
  expect(restored.corporateCondition.studios).toEqual([]); expect(restored.studioClosure.closures).toEqual([])
  expect(screen.getByTestId('save-migration-notice')).toBeInTheDocument()
  expect(coreSave.stableStringify(historical)).toBe(bytes)
}), FIXTURE_MS)
it('Wave5 actual terminal import replaces active App state and reloads read-only with exact export/history', budgeted(FIXTURE_MS, () => {
  localStorage.clear(); openCurrentStudioThroughStart('wave5-host-terminal-existing')
  const terminal = wave5SaveControl(163), expected = exportSaveJson(terminal)
  expect(terminal.campaignLegacy.endOfRun).not.toBeNull()
  fireEvent.click(screen.getByTestId('open-saves'))
  fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: expected } })
  fireEvent.click(screen.getByTestId('saves-import'))
  expect(exportSaveJson(acceptedActiveState())).toBe(expected)
  expect(screen.getByRole('heading', { name: /closed studio|ended run|read.only history/i })).toBeVisible()
  const advance = screen.queryByRole('button', { name: /advance.*week/i })
  if (advance) expect(advance).toBeDisabled() // Both omitted and disabled operating controls are lawful presentation.
  fireEvent.click(screen.getByTestId('open-saves'))
  expect((screen.getByTestId('export-text') as HTMLTextAreaElement).value).toBe(expected)
  const activeBytes = localStorage.getItem(ACTIVE_SESSION_KEY)
  cleanup(); render(<App />) // Actual session restoration, not just adapter import.
  expect(exportSaveJson(acceptedActiveState())).toBe(expected)
  expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(activeBytes)
  expect(screen.getByRole('heading', { name: /closed studio|ended run|read.only history/i })).toBeVisible()
}), FIXTURE_MS)
it('Wave5 unsupported due-only draft refuses before App replacement or any autosave', budgeted(FIXTURE_MS, () => {
  localStorage.clear(); openCurrentStudioThroughStart('wave5-host-due-existing')
  const current = exportSaveJson(acceptedActiveState())
  const due = coreTick.tick(wave5SaveControl(162), { deferPlayerClosure: true })
  expect(due.studioClosure.closures.some(c => c.studioId === due.hollywood!.playerStudioId)).toBe(false)
  expect(due.corporateCondition.studios.find(r => r.studioId === due.hollywood!.playerStudioId)!.condition.stage).toBe('closed')
  const text = exportSaveJson(due); fireEvent.click(screen.getByTestId('open-saves'))
  const activeBytes = localStorage.getItem(ACTIVE_SESSION_KEY)
  expect(activeBytes).not.toBeNull()
  const writes = vi.spyOn(Storage.prototype, 'setItem')
  try {
    fireEvent.change(screen.getByTestId('saves-import-text'), { target: { value: text } }); fireEvent.click(screen.getByTestId('saves-import'))
    expect(screen.getByText(/This save was rejected:.*(closure.due.*unsupported|unsupported.*closure.due)/i)).toBeVisible()
    expect(exportSaveJson(acceptedActiveState())).toBe(current)
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(activeBytes)
    expect((screen.getByTestId('export-text') as HTMLTextAreaElement).value).toBe(current)
    expect(screen.queryByTestId('save-migration-notice')).toBeNull()
    expect(exportSaveJson(due)).toBe(text)
    expect(writes.mock.calls.filter(([key]) => key === ACTIVE_SESSION_KEY)).toHaveLength(0)
  } finally { writes.mockRestore() }
}), FIXTURE_MS)
