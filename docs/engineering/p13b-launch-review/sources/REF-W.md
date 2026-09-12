# REF-W — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/tick.ts`
Full source Git blob: `acbac69c19fa828b63f26bc5ac4bb037fd886db4`
Full source SHA-256: `18db2563414fc796ece488ea82fcf6d222490d57cd2644c9ba76f2c5d577ca39`
Full source bytes: 55193

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/tick.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 499–510

```text
  // already debited its negative, its marketing and its freelancer fees, exactly
  // as the same greenlight played by hand would have.
  let cash = admitted.studio.cash
  const releasedFilms: FilmResult[] = [...admitted.studio.releasedFilms]
  // D-11.18 financial ledger — every cash movement is recorded (reconciles with cash).
  const ledger: LedgerEntry[] = [...admitted.ledger]
  const researchAdvance = advanceResearchWeek(admitted)
  cash -= researchAdvance.cost
  ledger.push(...researchAdvance.entries)
  // ── D-12 economy (gated) — a shallow copy of the run history so weekly progress can be
  // recorded without mutating the input. Empty (and untouched) for the M0A corpus.
  const engaged = economyEngaged(state)
```

## Original lines 921–968

```text
  // Weekly Σ contracted salaries, debited from cash EXACTLY ONCE per tick and
  // logged to the ledger. Applied for the week being advanced (currentTick).
  // Naturally 0 — and no ledger entry — when no contracts exist (the headless M0A
  // corpus), so M0A/D-6 stay byte-identical. Skipped during a founding draft
  // (no operations before the studio is founded).
  if (state.founding === null) {
    const payroll = weeklyPayroll(state, currentTick)
    const researchPayroll = weeklyResearchPayroll(state, currentTick)
    if (payroll > 0) {
      cash -= payroll
      if (payroll > researchPayroll) ledger.push({ week: currentTick, kind: 'payroll', amount: -(payroll-researchPayroll), note: 'weekly payroll' })
      if (researchPayroll > 0) ledger.push({week: currentTick, kind:'researchPayroll', amount:-researchPayroll, note:'weekly research payroll'})
    }
  }

  // ── 7.5 STUDIO OVERHEAD (D-12; gated) ──────────────────────────────────────
  // Fixed weekly base + per contracted employee, debited once per tick when the economy is
  // engaged and the studio is founded. Absent for the headless corpus → byte-identical.
  if (engaged && state.founding === null) {
    const overhead = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length
    if (overhead > 0) {
      cash -= overhead
      ledger.push({ week: currentTick, kind: 'overhead', amount: -overhead, note: 'weekly studio overhead' })
    }
  }

  // ── 7.6 PLACED-FACILITY OPERATING COST (V12; gated) ────────────────────────
  // INSERTION, NOT A REORDERING. One aggregated row per week — the convention
  // payroll and overhead already use — charged for every facility that was
  // OPERATIONAL at the start of this advance (`state.placement`, deliberately not
  // the post-completion set): a site that becomes operational during this advance
  // was still a construction site for the week being charged, so its first
  // operating charge lands on the NEXT advance. Absent for every state with no
  // operational placement, so M0A and all pre-V12 histories stay byte-identical.
  if (engaged && state.founding === null) {
    const facilityOpex = weeklyPlacementOperatingCost(state.placement)
    if (facilityOpex > 0) {
      cash -= facilityOpex
      ledger.push({
        week: currentTick,
        kind: 'facilityOpex',
        amount: -facilityOpex,
        note: FACILITY_OPEX_LEDGER_NOTE,
      })
    }
  }

  // ── 8. CONTRACT EXPIRATION (D-11.8) ────────────────────────────────────────
```

## Original lines 1055–1064

```text
    studioHistory: commitStudioHistory(state.studioHistory, history, currentTick + 1, facilityCompletionDrafts(placementCompletion.completed)),
  }
  for(const identity of finalized.hollywood?.identities ?? []) {
    if(identity.role==='rival' && identity.enteredWeek===null && identity.eligibleWeek<=finalized.market.tick) {
      finalized=enterRival(finalized,identity.studioId,'scheduled')
    }
  }
  return finishHollywoodWeek(finishTechnologyWeek(finalized))
}

```
