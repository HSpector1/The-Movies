// ── OPUS-REDTEAM (PF1-M4) — the parity proof, re-run hostile ─────────────────
//
// Charter §8: "Determinism: parity proof re-run adversarially on unfamiliar seeds and
// long scripts; cue log divergence; any state write from presentation; any RNG touch."
//
// This is NOT a copy of ui/src/test/contracts/parity-proof.contract.test.ts. It differs
// in every way that could hide a defect:
//   • an UNFAMILIAR seed the campaign never used;
//   • a LONGER, nastier script — two refusals, a real build commit, an ILLEGAL build,
//     a facility MOVE, a facility DEMOLISH, a publicity commit, and many governed stops;
//   • THREE runs, not two: silent / punctuated-and-unlocked / punctuated-but-MUTED,
//     because the charter's "enabled vs disabled/muted" has two halves and a defect
//     could live in either;
//   • byte equality is asserted on the exported save AND on a full JSON dump of the
//     final state AND on rngState AND on every intermediate week's export.
//
// Findings-only: this file asserts; it fixes nothing.

import { describe, expect, it } from 'vitest'
import {
  advanceToNextEvent,
  advanceWeek,
  commissionScriptAction,
  demolishFacilityAction,
  exportSaveJson,
  facilityDemolitionRefusal,
  facilityMoveRefusal,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  moveFacilityAction,
  newGame,
  placeFacilityAction,
  placementQuote,
  publicityDecision,
  requiredNegative,
  runPublicity,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioDecision,
  studioPlacement,
} from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  DraftPackage,
  GameState,
  PlacementRequest,
  SimResult,
} from '../../engine/adapter.ts'
import { RecordingSink } from '../../audio/sink.ts'
import { initAudioService } from '../../audio/audioService.ts'
import { PREFS_KEY } from '../../prefs.ts'
import {
  punctuateAdvanceWeek,
  punctuateCommit,
  punctuateFormation,
  punctuateRefusal,
  punctuateSimResult,
  punctuateWeekAdvance,
} from '../../presentation/punctuate.ts'

/** A seed no PF1 suite has ever named. */
const SEED = 'opus-redteam-m4-9c1756e-unfamiliar'
const FOUNDING_COUNTS: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

type Punctuation = {
  commit: (kind: Parameters<typeof punctuateCommit>[0], week: number) => void
  refusal: (week: number) => void
  formation: (week: number) => void
  weekAdvance: (week: number) => void
  advance: (result: { toWeek: number; released: readonly unknown[]; constructionCompletion: unknown }) => void
  simResult: (result: SimResult) => void
}

const LIVE: Punctuation = {
  commit: (kind, week) => void punctuateCommit(kind, week),
  refusal: (week) => void punctuateRefusal(week),
  formation: (week) => void punctuateFormation(week),
  weekAdvance: (week) => void punctuateWeekAdvance(week),
  advance: (result) => void punctuateAdvanceWeek(result),
  simResult: (result) => void punctuateSimResult(result),
}

const SILENT: Punctuation = {
  commit: () => {},
  refusal: () => {},
  formation: () => {},
  weekAdvance: () => {},
  advance: () => {},
  simResult: () => {},
}

function firstLegalAnnexRequest(state: GameState): PlacementRequest | null {
  const view = studioPlacement(state)
  const annex = view.catalog[0]
  if (annex === undefined) return null
  for (const parcel of view.parcels) {
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: annex.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  return null
}

function packageReadyScript(state: GameState): { projectId: string; pkg: DraftPackage } | null {
  const ready = scriptProjectsBoard(state).packages[0]
  if (ready === undefined) return null
  const concept = state.concepts.find((candidate) => candidate.id === ready.concept.id)
  if (concept === undefined) return null
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

type Trace = {
  finalState: GameState
  save: string
  weeklySaves: string[]
  stopReasons: string[]
  events: string[]
}

/** One long, hostile script, played identically however loudly presentation speaks. */
function playHostileScript(p: Punctuation): Trace {
  const stopReasons: string[] = []
  const events: string[] = []
  const weeklySaves: string[] = []

  let state = newGame(SEED)
  const applicants = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of applicants
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(`redteam script: signing failed — ${signed.error}`)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(`redteam script: founding failed — ${founded.error}`)
  state = founded.next
  p.formation(state.market.tick)
  events.push('formation')
  weeklySaves.push(exportSaveJson(state))

  // REFUSAL 1 — an unknown writer. The engine refuses; the studio makes a noise.
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
  if (refused.ok) throw new Error('redteam script: refusal fixture stopped refusing')
  p.refusal(state.market.tick)
  events.push('refusal:commission')

  // REFUSAL 2 — an ILLEGAL placement, off the property entirely.
  const illegal = placeFacilityAction(state, {
    blueprintId: studioPlacement(state).catalog[0]!.blueprintId,
    origin: { gx: -99, gy: -99 },
  })
  if (illegal.ok && illegal.next !== state) {
    throw new Error('redteam script: an off-property placement was accepted')
  }
  p.refusal(state.market.tick)
  events.push('refusal:placement')

  // A REAL build commit.
  const buildRequest = firstLegalAnnexRequest(state)
  if (buildRequest === null) throw new Error('redteam script: no legal placement anywhere')
  const built = placeFacilityAction(state, buildRequest)
  if (!built.ok) throw new Error(`redteam script: build failed — ${built.error}`)
  state = built.next
  p.commit('build-commit', state.market.tick)
  events.push('commit:build')
  weeklySaves.push(exportSaveJson(state))

  // A MOVE — attempted through the engine's own refusal probe, punctuated either way.
  const placed = studioPlacement(state).placements[0]
  if (placed !== undefined) {
    const destination = { gx: placed.origin.gx + 1, gy: placed.origin.gy }
    const move = { placementId: placed.id, origin: destination }
    const refusal = facilityMoveRefusal(state, move)
    if (refusal === null) {
      const moved = moveFacilityAction(state, move)
      if (moved.ok && moved.next !== state) {
        state = moved.next
        p.commit('move-commit', state.market.tick)
        events.push('commit:move')
      } else {
        p.refusal(state.market.tick)
        events.push('refusal:move')
      }
    } else {
      p.refusal(state.market.tick)
      events.push('refusal:move')
    }
    weeklySaves.push(exportSaveJson(state))
  }

  // A DEMOLISH — same discipline.
  const standing = studioPlacement(state).placements[0]
  if (standing !== undefined) {
    const demolition = { placementId: standing.id }
    const refusal = facilityDemolitionRefusal(state, demolition)
    if (refusal === null) {
      const demolished = demolishFacilityAction(state, demolition)
      if (demolished.ok && demolished.next !== state) {
        state = demolished.next
        p.commit('demolish-commit', state.market.tick)
        events.push('commit:demolish')
      } else {
        p.refusal(state.market.tick)
        events.push('refusal:demolish')
      }
    } else {
      p.refusal(state.market.tick)
      events.push('refusal:demolish')
    }
    weeklySaves.push(exportSaveJson(state))
  }

  // Commission for real.
  const commissioned = commissionScriptAction(state, payload)
  if (!commissioned.ok) throw new Error(`redteam script: commission failed — ${commissioned.error}`)
  state = commissioned.next
  p.commit('commission', state.market.tick)
  events.push('commit:commission')

  // Two plain single-week advances, punctuated through BOTH advance paths.
  for (let i = 0; i < 2; i++) {
    const advanced = advanceWeek(state)
    state = advanced.next
    p.advance({
      toWeek: state.market.tick,
      released: advanced.released,
      constructionCompletion: advanced.constructionCompletion ?? null,
    })
    p.weekAdvance(state.market.tick)
    events.push('advance')
    weeklySaves.push(exportSaveJson(state))
  }

  // Accept the draft, package it, form the picture.
  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('redteam script: no acceptScript action')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(`redteam script: accept failed — ${accepted.error}`)
  state = accepted.next
  p.commit('draft-accepted', state.market.tick)
  events.push('commit:accept')

  const ready = packageReadyScript(state)
  if (ready === null) throw new Error('redteam script: nothing packageable')
  p.commit('package-step', state.market.tick)
  const greenlit = greenlightScriptProject(state, ready.projectId, ready.pkg)
  if (!greenlit.ok) throw new Error(`redteam script: greenlight failed — ${greenlit.error}`)
  state = greenlit.next
  p.formation(state.market.tick)
  events.push('formation:greenlight')
  weeklySaves.push(exportSaveJson(state))

  // PUBLICITY — the first affordable offer the engine itself is willing to sell.
  const offer = publicityDecision(state).find((candidate) => candidate.available)
  if (offer !== undefined) {
    const bought = runPublicity(state, offer.tier)
    if (bought.ok) {
      state = bought.next
      p.commit('publicity', state.market.tick)
      events.push('commit:publicity')
    } else {
      p.refusal(state.market.tick)
      events.push('refusal:publicity')
    }
    weeklySaves.push(exportSaveJson(state))
  }

  // TWELVE governed steps — long enough to reach a release, a run's end, and whatever
  // contract/cash boundary this unfamiliar seed happens to put in the way.
  for (let step = 0; step < 12; step++) {
    const decision = studioDecision(state)
    if (decision?.kind === 'productionDecision' && decision.decision.command !== null) {
      const commanded = runProductionCommand(state, decision.decision.command)
      if (!commanded.ok) throw new Error(`redteam script: command failed — ${commanded.error}`)
      state = commanded.next
      p.commit('package-step', state.market.tick)
      events.push('commit:command')
      weeklySaves.push(exportSaveJson(state))
      continue
    }
    const result = advanceToNextEvent(state)
    stopReasons.push(result.stopReason)
    p.simResult(result)
    events.push(`stop:${result.stopReason}`)
    state = result.next
    weeklySaves.push(exportSaveJson(state))
  }

  return { finalState: state, save: exportSaveJson(state), weeklySaves, stopReasons, events }
}

// ORDER IS LOAD-BEARING, exactly as in the contract suite: the silent run happens
// BEFORE any audio service has ever been constructed in this module registry.
const silent = playHostileScript(SILENT)

const loudSink = new RecordingSink()
initAudioService(loudSink).unlock()
const loud = playHostileScript(LIVE)

// And the OTHER half of §2 — presentation ON, player MUTED.
localStorage.setItem(
  PREFS_KEY,
  JSON.stringify({
    version: 1,
    volumes: { master: 1, music: 1, ambience: 1, effects: 1 },
    muted: true,
    motion: 'reduced',
  }),
)
const mutedSink = new RecordingSink()
initAudioService(mutedSink).unlock()
const muted = playHostileScript(LIVE)

describe('REDTEAM — adversarial parity on an unfamiliar seed and a long, nasty script', () => {
  it('the script is not vacuous', () => {
    expect(loud.events.length, 'a long script').toBeGreaterThanOrEqual(18)
    expect(loud.events.filter((e) => e.startsWith('refusal')).length).toBeGreaterThanOrEqual(2)
    expect(loud.events).toContain('commit:build')
    expect(loud.events).toContain('commit:commission')
    expect(loud.stopReasons.length).toBeGreaterThanOrEqual(4)
    expect(new Set(loud.stopReasons).size, 'more than one kind of governed stop').toBeGreaterThanOrEqual(2)
    expect(loud.weeklySaves.length).toBeGreaterThanOrEqual(12)
  })

  it('all three runs walked the same road', () => {
    expect(loud.events).toEqual(silent.events)
    expect(muted.events).toEqual(silent.events)
    expect(loud.stopReasons).toEqual(silent.stopReasons)
    expect(muted.stopReasons).toEqual(silent.stopReasons)
  })

  it('exports are BYTE-IDENTICAL across silent / loud / muted', () => {
    expect(loud.save).toBe(silent.save)
    expect(muted.save).toBe(silent.save)
    expect(silent.save.length).toBeGreaterThan(1000)
  })

  it('EVERY intermediate save is byte-identical, not only the last one', () => {
    expect(loud.weeklySaves).toEqual(silent.weeklySaves)
    expect(muted.weeklySaves).toEqual(silent.weeklySaves)
  })

  it('the rng stream never moved: presentation drew nothing', () => {
    expect(loud.finalState.rngState).toBe(silent.finalState.rngState)
    expect(muted.finalState.rngState).toBe(silent.finalState.rngState)
    expect(silent.save.includes(silent.finalState.rngState)).toBe(true)
  })

  it('the whole final state is deep-identical, not merely the exported subset', () => {
    expect(JSON.stringify(loud.finalState)).toBe(JSON.stringify(silent.finalState))
    expect(JSON.stringify(muted.finalState)).toBe(JSON.stringify(silent.finalState))
  })

  it('no presentation fact reached the save file', () => {
    for (const needle of [
      PREFS_KEY,
      'project-studio.prefs',
      'sting-release',
      'held-beat',
      'count-up',
      'noticeEpoch',
      // NOTE: a bare "motion" needle is a FALSE POSITIVE — the engine's own
      // `emotionalRange` talent axis contains it. The prefs keys are matched exactly.
      '"motion"',
      '"muted"',
      'lot-notice',
    ]) {
      expect(silent.save.includes(needle), `a save must never contain "${needle}"`).toBe(false)
    }
  })

  it('the loud run really was loud, and the muted run really was silent', () => {
    const forcedMute =
      (process.env.VITE_AUDIO_MUTED ??
        (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUDIO_MUTED) === '1'
    const played = loudSink.log.filter((entry) => entry.call === 'play')
    if (!forcedMute) {
      expect(played.length, 'the punctuated run drove the service').toBeGreaterThanOrEqual(15)
    }
    expect(
      mutedSink.log.filter((entry) => entry.call === 'play'),
      'a muted player hears no cue at all',
    ).toEqual([])
  })

  it('the cue log itself is deterministic: replaying the script sounds identical', () => {
    // Wipe the muted preference the third run installed FIRST, so the replay service
    // is constructed against the same defaults the loud run had.
    localStorage.removeItem(PREFS_KEY)
    const replaySink = new RecordingSink()
    initAudioService(replaySink).unlock()
    const replay = playHostileScript(LIVE)
    expect(replay.save).toBe(loud.save)
    expect(JSON.stringify(replaySink.log)).toBe(JSON.stringify(loudSink.log))
  })
})
