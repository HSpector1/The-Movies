// Append to proposed p15b-browser-wave5.test.ts. Existing generic core operating guard, real adapter paths.
// Tests stale rendered publicity/hiring decisions after latest authoritative state became terminal.
it('browser-stale-nonloan-operating-requests-refuse-on-latest-terminal-and-preserve-all-bytes', budgeted(FIXTURE_MS, () => {
  const rendered = base(); const offers = adapter.publicityDecision(rendered)
  expect(offers.some(o => o.tier === 'whisper')).toBe(true)
  const hire = rendered.freeAgents[0]!; expect(hire).toBeDefined()
  const closed = at(163); expect(playerClosure(closed)).toBeDefined()
  const bytes = canon(closed)
  for (const commit of [
    () => adapter.runPublicity(closed, 'whisper'),
    () => adapter.signContractAction(closed, hire, 52),
    () => adapter.commitPictureToReleaseAction(closed, 'stale-open-production'),
  ]) {
    const outcome = commit(); expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error).toMatch(/closed.*read.only|read.only.*closed/i)
    expect(canon(closed)).toBe(bytes)
  }
  // The bogus retained production ID must hit the generic terminal guard BEFORE per-subject errors.
  // Mounted live-loop/terminal tests separately require controls suspended; stale adapter callbacks remain safe.
}), FIXTURE_MS)
