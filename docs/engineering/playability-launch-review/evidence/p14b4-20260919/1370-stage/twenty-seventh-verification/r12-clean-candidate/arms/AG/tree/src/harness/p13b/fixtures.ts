import { applyActions } from '../../core/actions.js'
import { hasOperationalFacilityInstallation } from '../../core/facilityEffects.js'
import { commitFacilityInstallation, commitPlacement, queryFacilityInstallation, queryPlacement } from '../../core/placement.js'
import { researchCandidates } from '../../core/technology.js'
import type { GameState } from '../../core/types.js'
import { advanceTo, p13aLaboratorySlice } from '../p13a/fixtures.js'

/**
 * P13B-S1 shared evidence: N named seats staffed on the one Laboratory an
 * `entry`-shaped state already carries (`p13aResearchEntry()`), research
 * begun at the given weekly ceiling and advanced a few funded weeks so the
 * caller has real receipts to inspect or mutate. Generated worlds only; the
 * caller supplies `entry` so a shared world build is never repeated.
 */
export function p13bStaffedProject(entry: GameState, weeks = 3, budgetPerWeek = 40_000, seatCount = 4): {
  state: GameState
  laboratoryFacilityId: string
  projectId: string
  scientistIds: string[]
} {
  const laboratoryFacilityId = entry.operations.facilities.find(f => f.capability === 'laboratory')!.id
  const scientistIds = researchCandidates(entry).slice(0, seatCount).map(c => c.id)
  let state = applyActions(entry, scientistIds.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
  state = applyActions(state, scientistIds.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId })))
  const projectId = state.technology.projects[0]!.id
  state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
  state = advanceTo(state, state.market.tick + weeks)
  return { state, laboratoryFacilityId, projectId, scientistIds }
}

/** The first lawful origin `queryPlacement` accepts for one more Research Laboratory on this lot. Never a guessed cell. */
export function nextLaboratoryOrigin(state: GameState): { gx: number; gy: number } {
  for (let gy = 0; gy < 24; gy++) for (let gx = 0; gx < 24; gx++) {
    if (queryPlacement(state, { blueprintId: 'research-laboratory', origin: { gx, gy } }).ok) return { gx, gy }
  }
  throw new Error('This generated lot offers no lawful site for one more Research Laboratory')
}

/**
 * P13B-S2 shared evidence (companion 03, [780,832) fixtures): a generated world
 * with TWO operational Laboratories, each carrying BOTH discipline modules
 * (acoustic instruments for synchronized-sound, electrical/control instruments
 * for lighting-control-01) fully operational, advanced to week 780 — the week
 * document 03 opens lighting research — with all eight named Scientist
 * candidates recruited on 208-week contracts. No seat is assigned and no
 * research is begun; callers stage their own scenario from here.
 *
 * Two lawful constraints shape the build (measured 2026-09-16): P09 refuses a
 * second installation on one body while another runs (`targetEngaged`), so the
 * two modules per Laboratory are sequenced; and a generated studio that holds two
 * Laboratories and four modules idle from week 24 is insolvent by 780 (−$5.46M),
 * so the department is committed late (Lab 2 at 750, modules 750→772) exactly as
 * document 03 treats its capital: sunk before 780, outside the horizon. Every
 * commit is quoted first and throws loudly if refused; nothing silently degrades.
 */
export function p13bTwoLabWorld(): { state: GameState; laboratoryFacilityIds: [string, string]; candidateIds: string[] } {
  const install = (state: GameState, blueprintId: string, targetFacilityId: string): GameState => {
    const quote = queryFacilityInstallation(state, { blueprintId, targetFacilityId })
    if (!quote.ok) throw new Error(`p13bTwoLabWorld: ${blueprintId} on ${targetFacilityId} refused at week ${state.market.tick}: ${JSON.stringify(quote.rejections)}`)
    return commitFacilityInstallation(state, { blueprintId, targetFacilityId })
  }
  let state = advanceTo(p13aLaboratorySlice(), 750)
  const lab1 = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
  state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(state) })
  state = install(state, 'acoustic-instruments', lab1)                       // 750 → 755
  state = advanceTo(state, 755)
  state = install(state, 'electrical-control-instruments', lab1)             // 755 → 760
  state = advanceTo(state, 762)                                              // Lab 2 completes 750 + 12
  const lab2 = state.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1)?.id
  if (lab2 === undefined) throw new Error('p13bTwoLabWorld: the second Research Laboratory never completed construction')
  state = install(state, 'acoustic-instruments', lab2)                       // 762 → 767
  state = advanceTo(state, 767)
  state = install(state, 'electrical-control-instruments', lab2)             // 767 → 772
  state = advanceTo(state, 780)
  for (const laboratoryFacilityId of [lab1, lab2]) {
    for (const blueprintId of ['acoustic-instruments', 'electrical-control-instruments']) {
      if (!hasOperationalFacilityInstallation(state, laboratoryFacilityId, blueprintId)) {
        throw new Error(`p13bTwoLabWorld: "${blueprintId}" never became operational on "${laboratoryFacilityId}" by week 780`)
      }
    }
  }
  if (state.studio.cash < 0) throw new Error(`p13bTwoLabWorld: the generated studio is insolvent at week 780 (cash ${state.studio.cash})`)
  const candidateIds = researchCandidates(state).map(c => c.id)
  state = applyActions(state, candidateIds.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId: lab1, scientistId })))
  return { state, laboratoryFacilityIds: [lab1, lab2], candidateIds }
}

/**
 * P13B-S2 test 6 (test-author, additive — never edits `p13bTwoLabWorld`): the same
 * generated two-Laboratory world, except the FIRST named candidate (`t-sci-00`) is
 * recruited at `earlyWeek` instead of at week 780 with the other seven, so its
 * 208-week contract lapses at `earlyWeek + 208` — a genuine mid-project employment
 * expiry, not a forged one. `earlyWeek` must be within [12, 750): the rest of the
 * build (second Laboratory, both instrument modules) is unchanged from
 * `p13bTwoLabWorld` and still commits starting at week 750.
 */
export function p13bTwoLabWorldWithEarlyHire(earlyWeek: number): { state: GameState; laboratoryFacilityIds: [string, string]; candidateIds: string[]; earlyCandidateId: string } {
  const install = (state: GameState, blueprintId: string, targetFacilityId: string): GameState => {
    const quote = queryFacilityInstallation(state, { blueprintId, targetFacilityId })
    if (!quote.ok) throw new Error(`p13bTwoLabWorldWithEarlyHire: ${blueprintId} on ${targetFacilityId} refused at week ${state.market.tick}: ${JSON.stringify(quote.rejections)}`)
    return commitFacilityInstallation(state, { blueprintId, targetFacilityId })
  }
  let state = advanceTo(p13aLaboratorySlice(), earlyWeek)
  const earlyCandidateId = researchCandidates(state)[0]!.id
  const lab1 = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
  state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId: lab1, scientistId: earlyCandidateId }])
  state = advanceTo(state, 750)
  state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(state) })
  state = install(state, 'acoustic-instruments', lab1)                       // 750 → 755
  state = advanceTo(state, 755)
  state = install(state, 'electrical-control-instruments', lab1)             // 755 → 760
  state = advanceTo(state, 762)                                              // Lab 2 completes 750 + 12
  const lab2 = state.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1)?.id
  if (lab2 === undefined) throw new Error('p13bTwoLabWorldWithEarlyHire: the second Research Laboratory never completed construction')
  state = install(state, 'acoustic-instruments', lab2)                       // 762 → 767
  state = advanceTo(state, 767)
  state = install(state, 'electrical-control-instruments', lab2)             // 767 → 772
  state = advanceTo(state, 780)
  for (const laboratoryFacilityId of [lab1, lab2]) {
    for (const blueprintId of ['acoustic-instruments', 'electrical-control-instruments']) {
      if (!hasOperationalFacilityInstallation(state, laboratoryFacilityId, blueprintId)) {
        throw new Error(`p13bTwoLabWorldWithEarlyHire: "${blueprintId}" never became operational on "${laboratoryFacilityId}" by week 780`)
      }
    }
  }
  if (state.studio.cash < 0) throw new Error(`p13bTwoLabWorldWithEarlyHire: the generated studio is insolvent at week 780 (cash ${state.studio.cash})`)
  const candidateIds = researchCandidates(state).map(c => c.id)
  state = applyActions(state, candidateIds.filter(id => id !== earlyCandidateId).map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId: lab1, scientistId })))
  return { state, laboratoryFacilityIds: [lab1, lab2], candidateIds, earlyCandidateId }
}
