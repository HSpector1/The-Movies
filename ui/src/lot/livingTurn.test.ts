import { describe, expect, it } from 'vitest'

import type { SimStopDetail, SimStopReason } from '../engine/adapter.ts'
import {
  INITIAL_LIVING_TURN,
  LIVING_TURN_MAX_SPEED,
  LIVING_TURN_NOTICE_LIMIT,
  LIVING_TURN_NOTIFY_CLASS,
  LIVING_TURN_PAUSE_CLASS,
  LIVING_TURN_PLAYED_BEATS,
  LIVING_TURN_SPEEDS,
  LIVING_TURN_WITNESSED_BEAT_CEILING,
  isLivingTurnSpeed,
  livingTurnAfterCommand,
  livingTurnAfterCommit,
  livingTurnBeatMs,
  livingTurnCollapsesWitnessedBeats,
  livingTurnConsumed01,
  livingTurnNoticesFor,
  livingTurnPausesOn,
  livingTurnRemainingMs,
  livingTurnStopClass,
  livingTurnWeekMs,
  nextLivingTurnSpeed,
  withLivingTurnNotices,
  type LivingTurnNotice,
  type LivingTurnSpeed,
} from './livingTurn.ts'
import { PLAYBACK_BEAT_MS, PLAYBACK_DURATION_MS, PLAYBACK_LAST_BEAT } from './tycoon/playback.ts'

// The whole union, written out once here so a new engine member breaks THIS test
// as well as the compiler — the partition must stay total by measurement too.
const EVERY_STOP_REASON: SimStopReason[] = [
  'release',
  'scriptReview',
  'castingReview',
  'productionDecision',
  'wrap',
  'constructionCompleted',
  'runCompleted',
  'contractExpired',
  'renewalWindow',
  'cashNegative',
  'limit',
]

const EMPTY_DETAIL: SimStopDetail = {
  reason: 'wrap',
  released: [],
  completedRuns: [],
  wrapped: [],
  productionDecision: null,
  releaseDecision: null,
  scriptDecision: null,
  castingDecision: null,
  constructionCompletion: null,
}

describe('Living Turn V1 — the speed ladder (§4.1)', () => {
  it('offers exactly 1x / 2x / 4x and names 4x as the ceiling', () => {
    expect([...LIVING_TURN_SPEEDS]).toEqual([1, 2, 4])
    expect(LIVING_TURN_MAX_SPEED).toBe(4)
    expect(LIVING_TURN_SPEEDS[LIVING_TURN_SPEEDS.length - 1]).toBe(LIVING_TURN_MAX_SPEED)
  })

  it('1x is the shipped played window exactly — 10.35s, nine beats', () => {
    expect(livingTurnWeekMs(1)).toBe(PLAYBACK_DURATION_MS)
    expect(livingTurnWeekMs(1)).toBe(10_350)
    expect(LIVING_TURN_PLAYED_BEATS).toBe(PLAYBACK_LAST_BEAT + 1)
    expect(LIVING_TURN_PLAYED_BEATS).toBe(9)
  })

  it('2x and 4x land on the figures the charter states', () => {
    expect(livingTurnWeekMs(2)).toBeCloseTo(5_175, 6)
    expect(livingTurnWeekMs(4)).toBeCloseTo(2_587.5, 6)
    expect(livingTurnBeatMs(1)).toBe(PLAYBACK_BEAT_MS)
    expect(livingTurnBeatMs(4)).toBeCloseTo(PLAYBACK_BEAT_MS / 4, 6)
  })

  it('a week is strictly shorter at every step up the ladder', () => {
    for (let i = 1; i < LIVING_TURN_SPEEDS.length; i++) {
      expect(livingTurnWeekMs(LIVING_TURN_SPEEDS[i]!)).toBeLessThan(
        livingTurnWeekMs(LIVING_TURN_SPEEDS[i - 1]!),
      )
    }
  })

  it('collapses witnessed beats only ABOVE 2x — 1x and 2x play in full', () => {
    expect(livingTurnCollapsesWitnessedBeats(1)).toBe(false)
    expect(livingTurnCollapsesWitnessedBeats(2)).toBe(false)
    expect(livingTurnCollapsesWitnessedBeats(4)).toBe(true)
    expect(LIVING_TURN_WITNESSED_BEAT_CEILING).toBe(2)
  })

  it('recognises its own ladder and refuses anything else', () => {
    for (const speed of LIVING_TURN_SPEEDS) expect(isLivingTurnSpeed(speed)).toBe(true)
    for (const n of [0, 0.5, 3, 5, 8, -1, Number.NaN]) expect(isLivingTurnSpeed(n)).toBe(false)
  })

  it('steps up and saturates at the ceiling', () => {
    expect(nextLivingTurnSpeed(1)).toBe(2)
    expect(nextLivingTurnSpeed(2)).toBe(4)
    expect(nextLivingTurnSpeed(4)).toBe(4)
  })
})

describe('Living Turn V1 — the auto-pause partition (§4.1 / 08A §3)', () => {
  it('is TOTAL over SimStopReason', () => {
    for (const reason of EVERY_STOP_REASON) {
      expect(['pause', 'notify']).toContain(livingTurnStopClass(reason))
    }
  })

  it('classifies every charter-named member exactly where the charter puts it', () => {
    for (const reason of LIVING_TURN_PAUSE_CLASS) expect(livingTurnStopClass(reason)).toBe('pause')
    for (const reason of LIVING_TURN_NOTIFY_CLASS) expect(livingTurnStopClass(reason)).toBe('notify')
  })

  it('the two published classes partition the union with limit named separately', () => {
    const published = [...LIVING_TURN_PAUSE_CLASS, ...LIVING_TURN_NOTIFY_CLASS] as SimStopReason[]
    expect(new Set(published).size).toBe(published.length)
    const missing = EVERY_STOP_REASON.filter((r) => !published.includes(r))
    // `limit` is the batch verb's alone (§4.1): the loop commits one tick at a
    // time and can never raise it, so it belongs to neither published class.
    expect(missing).toEqual(['limit'])
    expect(livingTurnStopClass('limit')).toBe('pause')
  })

  it('an ordinary week never pauses; wrap never pauses; cash crossing always does', () => {
    expect(livingTurnPausesOn(null)).toBe(false)
    expect(livingTurnPausesOn('wrap')).toBe(false)
    expect(livingTurnPausesOn('constructionCompleted')).toBe(false)
    expect(livingTurnPausesOn('cashNegative')).toBe(true)
    expect(livingTurnPausesOn('release')).toBe(true)
  })
})

describe('Living Turn V1 — the attention channel', () => {
  it('says nothing at all for a PAUSE-class stop (no second announcement)', () => {
    for (const reason of LIVING_TURN_PAUSE_CLASS) {
      expect(livingTurnNoticesFor(9, reason, null)).toEqual([])
    }
  })

  it('names the picture and the stage a wrap cleared', () => {
    const notices = livingTurnNoticesFor(12, 'wrap', {
      ...EMPTY_DETAIL,
      wrapped: [
        {
          productionId: 'prod-1',
          title: 'The Long Afternoon',
          stageFacilityId: 'facility-stage-07',
          stageName: 'Stage A',
          setId: 'set-1',
        },
      ],
    })
    expect(notices).toHaveLength(1)
    expect(notices[0]!.headline).toBe(
      'Principal photography wrapped on The Long Afternoon — Stage A is clearing.',
    )
    expect(notices[0]!.week).toBe(12)
    expect(notices[0]!.reason).toBe('wrap')
  })

  it('never prints an id when the engine could not name the picture', () => {
    const notices = livingTurnNoticesFor(3, 'wrap', EMPTY_DETAIL)
    expect(notices[0]!.headline).toBe('Principal photography wrapped.')
    expect(notices[0]!.headline).not.toMatch(/prod-|facility-|set-/)
  })

  it('lists several wrapped pictures without a stage claim', () => {
    const notices = livingTurnNoticesFor(4, 'wrap', {
      ...EMPTY_DETAIL,
      wrapped: [
        { productionId: 'a', title: 'One', stageFacilityId: 'f1', stageName: 'Stage A', setId: null },
        { productionId: 'b', title: 'Two', stageFacilityId: 'f2', stageName: 'Stage B', setId: null },
      ],
    })
    expect(notices[0]!.headline).toBe('Principal photography wrapped on One and Two.')
  })

  it('carries the engine s own completion sentence for a finished build', () => {
    const notices = livingTurnNoticesFor(7, 'constructionCompleted', {
      ...EMPTY_DETAIL,
      constructionCompletion: {
        projectId: 'p1',
        facilityId: 'facility-stage-12',
        name: 'Stage B',
        completedWeek: 7,
        message: 'Stage B is Operational in Week 7. One shared Production slot is now available.',
      },
    })
    expect(notices[0]!.headline).toBe(
      'Stage B is Operational in Week 7. One shared Production slot is now available.',
    )
  })

  it('speaks in filmmaking for runs and contracts', () => {
    expect(
      livingTurnNoticesFor(5, 'runCompleted', {
        ...EMPTY_DETAIL,
        completedRuns: [{ productionId: 'a', title: 'Rain on the Boulevard' }],
      })[0]!.headline,
    ).toBe('Rain on the Boulevard finished its theatrical run.')
    expect(livingTurnNoticesFor(5, 'contractExpired', null)[0]!.headline).toBe(
      'A talent contract ended.',
    )
    expect(livingTurnNoticesFor(5, 'renewalWindow', null)[0]!.headline).toBe(
      'A contract renewal window opened.',
    )
  })

  it('never uses the batch verb s stopped-at sentence — nothing stopped', () => {
    for (const reason of LIVING_TURN_NOTIFY_CLASS) {
      for (const notice of livingTurnNoticesFor(11, reason, EMPTY_DETAIL)) {
        expect(notice.headline).not.toMatch(/Stopped at Week/)
      }
    }
  })

  it('retains a bounded bulletin, newest last', () => {
    let retained: LivingTurnNotice[] = []
    for (let week = 1; week <= LIVING_TURN_NOTICE_LIMIT + 3; week++) {
      retained = withLivingTurnNotices(
        retained,
        livingTurnNoticesFor(week, 'contractExpired', null),
      )
    }
    expect(retained).toHaveLength(LIVING_TURN_NOTICE_LIMIT)
    expect(retained[retained.length - 1]!.week).toBe(LIVING_TURN_NOTICE_LIMIT + 3)
    expect(retained[0]!.week).toBe(4)
  })

  it('returns the same array reference when nothing was added', () => {
    const retained: LivingTurnNotice[] = []
    expect(withLivingTurnNotices(retained, [])).toBe(retained)
  })
})

describe('Living Turn V1 — the loop state', () => {
  it('starts paused at 1x with nothing to say', () => {
    expect(INITIAL_LIVING_TURN).toEqual({ mode: 'paused', speed: 1, pausedBy: null, notices: [] })
  })

  it('play clears the stop that paused the loop', () => {
    const stopped = livingTurnAfterCommit(
      { ...INITIAL_LIVING_TURN, mode: 'running' },
      9,
      'cashNegative',
      null,
    )
    expect(stopped.mode).toBe('paused')
    expect(stopped.pausedBy).toBe('cashNegative')
    const resumed = livingTurnAfterCommand(stopped, { kind: 'play' })
    expect(resumed.mode).toBe('running')
    expect(resumed.pausedBy).toBeNull()
  })

  it('a NOTIFY-class stop keeps the loop running and adds one line', () => {
    const running = { ...INITIAL_LIVING_TURN, mode: 'running' as const }
    const after = livingTurnAfterCommit(running, 14, 'wrap', {
      ...EMPTY_DETAIL,
      wrapped: [
        { productionId: 'a', title: 'Nightfall', stageFacilityId: 'f', stageName: 'Stage A', setId: null },
      ],
    })
    expect(after.mode).toBe('running')
    expect(after.pausedBy).toBeNull()
    expect(after.notices).toHaveLength(1)
  })

  it('an ordinary week changes nothing at all', () => {
    const running = { ...INITIAL_LIVING_TURN, mode: 'running' as const }
    expect(livingTurnAfterCommit(running, 2, null, null)).toBe(running)
  })

  it('speed and dismissal are idempotent when nothing changes', () => {
    const run = { ...INITIAL_LIVING_TURN, speed: 2 as LivingTurnSpeed }
    expect(livingTurnAfterCommand(run, { kind: 'speed', speed: 2 })).toBe(run)
    expect(livingTurnAfterCommand(run, { kind: 'dismiss-notices' })).toBe(run)
    expect(livingTurnAfterCommand(run, { kind: 'pause' })).toBe(run)
    expect(livingTurnAfterCommand(run, { kind: 'speed', speed: 4 }).speed).toBe(4)
  })
})

describe('Living Turn V1 — the witnessed-week clock', () => {
  it('a fresh week owes the whole week at the current speed', () => {
    expect(livingTurnRemainingMs(0, 1)).toBe(PLAYBACK_DURATION_MS)
    expect(livingTurnRemainingMs(0, 4)).toBeCloseTo(PLAYBACK_DURATION_MS / 4, 6)
  })

  it('a speed change mid-week keeps the FRACTION, not the milliseconds', () => {
    // Half a week consumed at 1x, then 4x: half a week remains at the new pace.
    const consumed = livingTurnConsumed01(PLAYBACK_DURATION_MS / 2, 1)
    expect(consumed).toBeCloseTo(0.5, 9)
    expect(livingTurnRemainingMs(consumed, 4)).toBeCloseTo(PLAYBACK_DURATION_MS / 8, 6)
  })

  it('clamps both ends and never returns a negative wait', () => {
    expect(livingTurnConsumed01(-5, 1)).toBe(0)
    expect(livingTurnConsumed01(Number.NaN, 1)).toBe(0)
    expect(livingTurnConsumed01(PLAYBACK_DURATION_MS * 10, 1)).toBe(1)
    expect(livingTurnRemainingMs(1, 1)).toBe(0)
    expect(livingTurnRemainingMs(5, 1)).toBe(0)
    expect(livingTurnRemainingMs(Number.NaN, 1)).toBe(PLAYBACK_DURATION_MS)
  })
})
