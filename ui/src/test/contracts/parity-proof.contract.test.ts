// ── PF1-M2 CONTRACT SUITE — THE BYTE-PARITY PROOF ────────────────────────────
// Written from PROFESSIONAL-FLOOR-V1-CHARTER.md §2 / §5-M2 / §7 / §13.2, NOT
// from the implementation. This is the mechanical core of DONE §13.2 and, per
// §7, it runs from M2 and at every gate from here on.
//
// Governing charter law proved by this file:
//   • "PRESENTATION REACTS TO TRUTH. PRESENTATION NEVER CREATES OR PERSISTS GAME
//      TRUTH."                                                    (§2, heading)
//   • "Proof obligation (the Owner's restraint test, made mechanical): a scripted
//      parity run — the same seeded action sequence with presentation enabled vs
//      disabled/muted — must produce byte-identical exported saves."     (§2)
//   • "Presentation state (volumes, motion preference, audio unlock) lives
//      outside GameState and never enters a save file."                  (§2)
//   • "The presentation layer makes no RNG draws from the sim stream."   (§2)
//   • "The byte-parity proof harness lands here and runs from now on."(§5-M2)
//
// HOW IT IS DRIVEN: the REAL engine, through the REAL adapter, using exactly the
// exported entry points App.tsx dispatches (newGame → signContractAction →
// foundManagedStudioAction → commissionScriptAction → advanceWeek →
// runScriptProjectAction → greenlightScriptProject → runProductionCommand →
// advanceToNextEvent → exportSaveJson). No adapter surface is added, stubbed or
// modified for this proof; the founding idiom is the one already used across
// ui/src/engine/script-assessment-parity.test.ts and
// ui/src/screens/next-event-destination-focus.test.tsx.
//
// ORDERING NOTE (load-bearing): run B is played FIRST, before this file has ever
// touched initAudioService, so "no audio service was initialised" is literally
// true of it rather than merely unused. The audio service is a module singleton;
// initialising it for run A afterwards cannot retroactively reach run B.
//
// DETERMINISM: no Math.random, no Date.now, no timers, no real playback.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../../src/core/index.ts'
import {
  advanceToNextEvent,
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  newGame,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  selectCash,
  selectStanding,
  selectWeek,
  signContractAction,
  studioDecision,
} from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  SimResult,
} from '../../engine/adapter.ts'
import { RecordingSink } from '../../audio/sink.ts'
import { initAudioService } from '../../audio/audioService.ts'
import { PREFS_KEY } from '../../prefs.ts'
import {
  punctuateCommit,
  punctuateFormation,
  punctuateRefusal,
  punctuateSimResult,
  punctuateWeekAdvance,
} from '../../presentation/punctuate.ts'

const SEED = 'pf1-parity-001'
const FOUNDING_COUNTS: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

/**
 * The presentation side of the script. Run A supplies a real one; run B supplies
 * null and never so much as imports a service instance into existence.
 */
type Punctuation = {
  commit: (kind: Parameters<typeof punctuateCommit>[0], week: number) => void
  refusal: (week: number) => void
  formation: (week: number) => void
  weekAdvance: (week: number) => void
  simResult: (result: SimResult) => void
}

const LIVE_PUNCTUATION: Punctuation = {
  commit: (kind, week) => void punctuateCommit(kind, week),
  refusal: (week) => void punctuateRefusal(week),
  formation: (week) => void punctuateFormation(week),
  weekAdvance: (week) => void punctuateWeekAdvance(week),
  simResult: (result) => void punctuateSimResult(result),
}

const SILENT_PUNCTUATION: Punctuation = {
  commit: () => {},
  refusal: () => {},
  formation: () => {},
  weekAdvance: () => {},
  simResult: () => {},
}

function week(state: GameState): number {
  return selectWeek(state)
}

function packageReadyScript(state: GameState): { projectId: string; pkg: DraftPackage } {
  const ready = scriptProjectsBoard(state).packages[0]
  if (ready === undefined) throw new Error('parity script: no Ready screenplay to package')
  const concept = state.concepts.find((candidate) => candidate.id === ready.concept.id)
  if (concept === undefined) throw new Error('parity script: the Ready screenplay lost its concept')
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  const ids = (role: CreativeRole): string[] =>
    state.talent
      .filter((candidate) => candidate.role === role && contracted.has(candidate.id))
      .map((candidate) => candidate.id)
  const actors = ids('actor')
  return {
    projectId: ready.projectId,
    pkg: {
      conceptId: ready.concept.id,
      shape: ready.lockedShape,
      promise: ready.lockedPromise,
      writerId: ready.writer.id,
      directorId: ids('director')[0]!,
      craftIds: [ids('craft')[0]!],
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      budget: { negative: requiredNegative(concept, ready.lockedShape, state), marketing: 0 },
    },
  }
}

/** What the run observed, for the vacuity guards below. */
type RunTrace = { finalState: GameState; save: string; stopReasons: string[]; receipts: number }

/**
 * ONE script, played identically twice. The only difference between the two
 * calls is whether `p` speaks.
 */
function playParityScript(p: Punctuation): RunTrace {
  const stopReasons: string[] = []
  let receipts = 0

  // 1 — found the studio. The formation receipt is the studio's own first beat.
  let state = newGame(SEED)
  const applicants = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of applicants
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(`parity script: signing failed — ${signed.error}`)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(`parity script: founding failed — ${founded.error}`)
  state = founded.next
  p.formation(week(state))
  receipts++

  // 2 — a genuine REFUSAL receipt: an unknown writer id is refused by the engine.
  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )!
  const payload: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'immediateAction', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'],
      ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] },
    },
  }
  const refused = commissionScriptAction(state, { ...payload, writerId: 'no-such-writer' })
  if (refused.ok) throw new Error('parity script: the refusal fixture stopped being a refusal')
  p.refusal(week(state))
  receipts++

  // 3 — commission a screenplay (a commit receipt).
  const commissioned = commissionScriptAction(state, payload)
  if (!commissioned.ok) throw new Error(`parity script: commission failed — ${commissioned.error}`)
  state = commissioned.next
  p.commit('commission', week(state))
  receipts++

  // 4 — advance one week (a week-advance receipt).
  state = advanceWeek(state).next
  p.weekAdvance(week(state))
  receipts++

  // 5 — accept the draft (a commit receipt), then form the picture (a formation receipt).
  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('parity script: no acceptScript action')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(`parity script: accept failed — ${accepted.error}`)
  state = accepted.next
  p.commit('draft-accepted', week(state))
  receipts++

  const { projectId, pkg } = packageReadyScript(state)
  p.commit('package-step', week(state))
  receipts++
  const greenlit = greenlightScriptProject(state, projectId, pkg)
  if (!greenlit.ok) throw new Error(`parity script: greenlight failed — ${greenlit.error}`)
  state = greenlit.next
  p.formation(week(state))
  receipts++

  // 6 — play forward through governed stops. Nine steps reaches the first
  // productionDecision, its three commands, the Release Ready commit (P06A —
  // charter W1), the release, the run's end, the cash crossing and a renewal
  // window: every tier the grammar can speak in.
  for (let step = 0; step < 9; step++) {
    const decision = studioDecision(state)
    if (decision?.kind === 'productionDecision' && decision.decision.command !== null) {
      const commanded = runProductionCommand(state, decision.decision.command)
      if (!commanded.ok) throw new Error(`parity script: command failed — ${commanded.error}`)
      state = commanded.next
      p.commit('package-step', week(state))
      receipts++
      continue
    }
    // P06A W1: a Release Ready picture HOLDS until explicitly committed — resolve
    // the decision the instant it appears so the walk still reaches the release.
    if (decision?.kind === 'releaseReview') {
      state = applyActions(state, [
        { kind: 'commitPictureToRelease', productionId: decision.decision.productionId },
      ])
      p.commit('package-step', week(state))
      receipts++
      continue
    }
    const result = advanceToNextEvent(state)
    stopReasons.push(result.stopReason)
    p.simResult(result)
    receipts++
    state = result.next
  }

  return { finalState: state, save: exportSaveJson(state), stopReasons, receipts }
}

describe('PF1-M2 contract — the byte-parity proof (DONE §13.2)', () => {
  // Run B FIRST — with no audio service in existence — then run A with a
  // RecordingSink installed and unlocked and every receipt punctuated.
  const silent = playParityScript(SILENT_PUNCTUATION)

  const sink = new RecordingSink()
  initAudioService(sink).unlock()
  const punctuated = playParityScript(LIVE_PUNCTUATION)

  it('the script is not vacuous: it reaches real governed stops and real receipts', () => {
    expect(punctuated.receipts, 'every receipt in the script was punctuated').toBeGreaterThanOrEqual(12)
    expect(punctuated.stopReasons.length).toBeGreaterThanOrEqual(3)
    expect(new Set(punctuated.stopReasons).size, 'more than one kind of stop').toBeGreaterThanOrEqual(2)
    expect(punctuated.stopReasons, 'the picture reached the screen').toContain('release')
    expect(silent.stopReasons, 'both runs walked the same road').toEqual(punctuated.stopReasons)
  })

  it('presentation ON and presentation OFF export BYTE-IDENTICAL saves', () => {
    expect(punctuated.save).toBe(silent.save)
    expect(punctuated.save.length, 'the save is a real save, not an empty string').toBeGreaterThan(1000)
  })

  it('the rng stream is byte-identical — presentation drew nothing from it', () => {
    expect(punctuated.finalState.rngState).toBe(silent.finalState.rngState)
    expect(
      punctuated.save.includes(punctuated.finalState.rngState),
      'the compared saves genuinely carry the rng state',
    ).toBe(true)
  })

  it('the two runs stand on the same week, cash and standing', () => {
    expect(selectWeek(punctuated.finalState)).toBe(selectWeek(silent.finalState))
    expect(selectCash(punctuated.finalState)).toBe(selectCash(silent.finalState))
    expect(selectStanding(punctuated.finalState)).toEqual(selectStanding(silent.finalState))
  })

  it('no presentation fact reached the save file (§2: prefs never enter a save)', () => {
    for (const needle of [
      PREFS_KEY,
      'project-studio.prefs',
      'sting-release',
      'sting-completion',
      'held-beat',
      'playCue',
    ]) {
      expect(punctuated.save.includes(needle), `a save must never contain "${needle}"`).toBe(false)
    }
  })

  it('run A really did punctuate — the proof is not passing because nothing sounded', () => {
    const played = sink.log.filter((entry) => entry.call === 'play')
    // Under a hard-muted process (VITE_AUDIO_MUTED=1) the sink is legitimately
    // empty; the parity claim above is then proved against a muted presentation,
    // which is the OTHER half of §2's "enabled vs disabled/muted".
    const forcedMute =
      (process.env.VITE_AUDIO_MUTED ??
        (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUDIO_MUTED) === '1'
    if (forcedMute) {
      expect(played).toEqual([])
      return
    }
    expect(played.length, 'the punctuated run actually drove the audio service').toBeGreaterThanOrEqual(10)
  })
})
