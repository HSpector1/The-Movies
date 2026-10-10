// ── P16A RED A2: the Save46 rights root, its validators and the V45 <-> V46 migration ──
//
// Authority: P16A r3 charter "Exact P16A identity and chronology" (the root and title-event
// validation rules) and RED item A2; P16 integration contract §7 group S (era/integrity:
// "new kinds/roots/reasons refused below their era; empty migration lawful without fabricated
// history; no lossy downgrade with terminal/title/licence/claims state; save/load deterministic").
//
// Era note: at base 6510c971 the live era is Save45, so P16 takes 46 here. `P16_SAVE_VERSION` and
// `P16_PREDECESSOR_SAVE_VERSION` are read through the module so the parent can renumber at landing.
//
// Pattern: tests/p14b10-save-v44.test.ts (genuine predecessor through the REAL converter, then a
// hand-projected envelope for validator-focused leaves). Content-specific refusal patterns only.

import { describe, expect, it } from 'vitest'
import { HOLLYWOOD_STARTING_MANIFEST } from '../src/core/hollywoodStartingData.js'
import * as rights from '../src/core/rights.js'
import * as saveModule from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuineV45Envelope, genuineV45Raw } from './helpers/p16-fixtures.js'

type Envelope = { saveVersion: number; seed: string; state: GameState & Record<string, unknown>; broadcastCache: unknown[] }
const P16_KINDS = ['rightsConsideration', 'dueDiligenceFee', 'acquisitionOutlay'] as const

function v46(): Envelope {
  return saveModule.convertV45ToV46(saveModule.validateSaveV45(genuineV45Envelope('week53'))) as unknown as Envelope
}
function stripRights(state: Record<string, unknown>): Record<string, unknown> {
  const { rights: _rights, ...rest } = state
  const h = rest.hollywood as { businesses: { account: { periods: { movements: Record<string, number> }[] } }[] } | null
  const out = JSON.parse(JSON.stringify(rest)) as Record<string, unknown>
  for (const b of (out.hollywood as typeof h)?.businesses ?? []) for (const p of b.account.periods) for (const k of P16_KINDS) delete p.movements[k]
  return out
}

describe('Save46 era surface', () => {
  it('LIVE_SAVE_VERSION is P16_SAVE_VERSION (46 at this base) with predecessor 45, and the V46 functions exist', () => {
    expect(saveModule.P16_SAVE_VERSION).toBe(46)
    expect(saveModule.P16_PREDECESSOR_SAVE_VERSION).toBe(45)
    expect(saveModule.LIVE_SAVE_VERSION).toBe(saveModule.P16_SAVE_VERSION)
    for (const name of ['validateSaveV46', 'convertV45ToV46', 'convertV46ToV45', 'migrateToV46'] as const) {
      expect(typeof (saveModule as unknown as Record<string, unknown>)[name], name).toBe('function')
    }
  })

  it('validateSave dispatches 46 and names the handled range "1 through 46"', () => {
    const envelope = v46()
    expect(saveModule.validateSave(envelope as never).saveVersion).toBe(46)
    expect(() => saveModule.validateSave({ ...envelope, saveVersion: 47 } as never)).toThrow(/unknown saveVersion 47.*versions 1 through 46 only/)
  })
})

describe('Save46 migration from a genuine Save45 predecessor', () => {
  it('convertV45ToV46 adds exactly the empty rights root at the save week and zero P16 movements on every rival period; nothing else moves', () => {
    const genuine = saveModule.validateSaveV45(genuineV45Envelope('week53')) as unknown as Envelope
    const before = saveModule.stableStringify(genuine)
    const lifted = saveModule.convertV45ToV46(genuine as never) as unknown as Envelope
    expect(saveModule.stableStringify(genuine), 'the predecessor input is not mutated').toBe(before)
    expect(lifted.saveVersion).toBe(46)
    const root = lifted.state.rights
    expect(root).toEqual({ version: 1, recordedFromWeek: genuine.state.market.tick, properties: [], filmTitles: [], titleEvents: [], licences: [],
      offers: [], transactions: [], diligence: [], estates: [], nextId: 1 })
    for (const b of lifted.state.hollywood!.businesses) for (const p of b.account.periods) {
      for (const k of P16_KINDS) expect(p.movements[k]).toBe(0)
    }
    expect(saveModule.stableStringify(stripRights(lifted.state))).toBe(saveModule.stableStringify(genuine.state))
    expect(() => saveModule.validateSaveV46(lifted)).not.toThrow()
    // No past transaction, title or estate is invented from history.
    expect(root.titleEvents).toEqual([])
  })

  it('migrateToLive lifts the genuine raw capture to 46 through importSave, and a second migration is a no-op', () => {
    const live = saveModule.migrateToLive(saveModule.importSave(genuineV45Raw('week53')))
    expect(live.saveVersion).toBe(46)
    expect(saveModule.stableStringify(saveModule.migrateToV46(live))).toBe(saveModule.stableStringify(live))
    expect(saveModule.stableStringify(saveModule.makeSave(live.state as GameState))).toBe(saveModule.stableStringify(live))
  })

  it('convertV46ToV45 is lossless while the root is empty and every P16 movement is zero, round-tripping to the genuine bytes', () => {
    const genuine = saveModule.validateSaveV45(genuineV45Envelope('week53'))
    const down = saveModule.convertV46ToV45(saveModule.convertV45ToV46(genuine))
    expect(saveModule.stableStringify(down)).toBe(saveModule.stableStringify(genuine))
    expect(saveModule.migrateToV45(saveModule.convertV45ToV46(genuine)).saveVersion).toBe(45)
    // Below 45 the P15 step's own refusal governs this fixture (recorded quarters): P16 adds nothing to it.
    expect(() => saveModule.migrateToV44(saveModule.convertV45ToV46(genuine))).toThrow(/migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter/)
  })

  it('the downgrade refuses by name once a rights record exists; a P16 movement or ledger row without its transaction is refused by the validator first', () => {
    const base = v46()
    const film = base.state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
    const materialized = rights.materializeLegacyTitles(base.state as GameState, { right: 'R2', filmId: film.filmId })
    expect(() => saveModule.convertV46ToV45({ ...base, state: materialized } as never)).toThrow(/migrateToV45: cannot downgrade or discard a recorded rights root/)
    // A forged movement with no transaction is not a lawful V46 state at all: the reconciliation refuses it
    // (the downgrade refusal for a REAL movement is proved with real transactions in the P16B tests).
    const moved = detached(base)
    moved.state.hollywood!.businesses[0]!.account.periods[0]!.movements.rightsConsideration = 1
    moved.state.hollywood!.businesses[0]!.account.periods[0]!.closing += 1
    moved.state.hollywood!.businesses[0]!.account.cash += 1
    expect(() => saveModule.convertV46ToV45(moved as never)).toThrow(/rights\.transactions .*rightsConsideration 1 does not reconcile/)
    const ledgered = detached(base)
    ledgered.state.ledger = [...ledgered.state.ledger, { week: ledgered.state.market.tick, kind: 'dueDiligenceFee', amount: -1, note: 'test' } as never]
    ledgered.state.studio.cash -= 1
    expect(() => saveModule.convertV46ToV45(ledgered as never)).toThrow(/rights\.transactions .*dueDiligenceFee -1 does not reconcile/)
  })

  it('a Save45 envelope is refused the P16 kinds below their era: a rightsConsideration movement or ledger row cannot be written under version 45', () => {
    const genuine = detached(saveModule.validateSaveV45(genuineV45Envelope('week53')) as unknown as Envelope)
    const period = genuine.state.hollywood!.businesses[0]!.account.periods[0]!
    ;(period.movements as Record<string, number>).rightsConsideration = 0
    expect(() => saveModule.validateSaveV45(genuine)).toThrow(/exact keys|movements|rightsConsideration/i)
    const ledgered = detached(saveModule.validateSaveV45(genuineV45Envelope('week53')) as unknown as Envelope)
    ledgered.state.ledger = [...ledgered.state.ledger, { week: 1, kind: 'dueDiligenceFee', amount: -1, note: 'test' } as never]
    ledgered.state.studio.cash -= 1
    expect(() => saveModule.validateSaveV45(ledgered)).toThrow(/kind|dueDiligenceFee/i)
  })
})

describe('Save46 rights root validator: shape, title events, holders, estates', () => {
  const film = (e: Envelope) => e.state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
  function materialized(): Envelope {
    const base = v46()
    const f = film(base)
    let state = rights.materializeLegacyTitles(base.state as GameState, { right: 'R2', filmId: f.filmId })
    state = rights.materializeLegacyTitles(state, { right: 'R1', propertyId: rights.storyPropertyId(f.conceptId) })
    return { ...base, state: state as Envelope['state'] }
  }
  const expectRefusal = (e: Envelope, pattern: RegExp) => expect(() => saveModule.validateSaveV46(e)).toThrow(pattern)

  it('the control: a materialized genesis pair validates', () => {
    const e = materialized()
    expect(() => saveModule.validateSaveV46(e)).not.toThrow()
    expect(e.state.rights.titleEvents).toHaveLength(2)
  })

  it('refuses a missing root, a wrong version, a recordedFromWeek outside [0, tick], or unknown keys', () => {
    const base = v46()
    const { rights: _r, ...without } = base.state
    expectRefusal({ ...base, state: without as Envelope['state'] }, /rights root is missing/)
    const wrong = detached(base); (wrong.state.rights as { version: number }).version = 2
    expectRefusal(wrong, /rights.*version/)
    const future = detached(base); future.state.rights.recordedFromWeek = future.state.market.tick + 1
    expectRefusal(future, /rights.*recordedFromWeek/)
    const extra = detached(base); (extra.state.rights as Record<string, unknown>).extra = 1
    expectRefusal(extra, /rights.*exactly/)
  })

  it('refuses a duplicate genesis, a broken priorHolder chain, a future-dated event, bad ordinals, duplicate ids, a mismatched subject and an unknown holder', () => {
    const base = materialized()
    const f = film(base)
    const genesis = base.state.rights.titleEvents.find((e) => e.subject.right === 'R2')!
    const dupe = detached(base); dupe.state.rights.titleEvents.push({ ...genesis, id: 'rights-event-99', ordinal: 2 }); dupe.state.rights.nextId = 100
    expectRefusal(dupe, /genesis/)
    const broken = detached(base)
    broken.state.rights.titleEvents.push({ ...genesis, id: 'rights-event-99', ordinal: 2, cause: 'sale', priorHolder: 'studio-someone-else', newHolder: f.studioId,
      date: { kind: 'campaign', week: broken.state.market.tick }, boundaryOrder: 99, source: { kind: 'transaction', transactionId: 'rights-tx-missing' } })
    broken.state.rights.nextId = 100
    expectRefusal(broken, /priorHolder/)
    const future = detached(base)
    future.state.rights.titleEvents.push({ ...genesis, id: 'rights-event-99', ordinal: 2, cause: 'sale', priorHolder: f.studioId, newHolder: future.state.hollywood!.identities[2]!.studioId,
      date: { kind: 'campaign', week: future.state.market.tick + 1 }, boundaryOrder: 99, source: { kind: 'transaction', transactionId: 'rights-tx-missing' } })
    future.state.rights.nextId = 100
    expectRefusal(future, /future/)
    const ordinal = detached(base); ordinal.state.rights.titleEvents[0]!.ordinal = 5
    expectRefusal(ordinal, /ordinal/)
    const ids = detached(base); ids.state.rights.titleEvents[1]!.id = ids.state.rights.titleEvents[0]!.id
    expectRefusal(ids, /duplicate.*id|id.*duplicate/)
    const subject = detached(base); subject.state.rights.titleEvents[0]!.subject = { right: 'R2', filmId: 'no-such-film' }
    expectRefusal(subject, /unknown subject|subject/)
    const holder = detached(base); holder.state.rights.titleEvents[0]!.newHolder = 'studio-nobody'
    expectRefusal(holder, /holder/)
  })

  it('refuses a persisted record that contradicts the authentic source (creator, date or title) as ambiguous provenance', () => {
    const base = materialized()
    const creator = detached(base); creator.state.rights.filmTitles[0]!.creatorStudioId = creator.state.hollywood!.identities[2]!.studioId
    expectRefusal(creator, /creator|provenance/)
    const title = detached(base); title.state.rights.filmTitles[0]!.title = 'A Title Nobody Released'
    expectRefusal(title, /title|provenance/)
    const date = detached(base); date.state.rights.properties[0]!.createdAt = { kind: 'beforeCampaign', year: 1901 }
    expectRefusal(date, /date|provenance/)
  })

  it('an archive event needs its estate record, and an estate record must name a reserved identity', () => {
    const base = materialized()
    const f = film(base)
    const archived = detached(base)
    archived.state.rights.titleEvents.push({ id: 'rights-event-99', subject: { right: 'R2', filmId: f.filmId }, ordinal: 2, cause: 'archive', priorHolder: f.studioId,
      newHolder: `estate:${f.studioId}`, date: { kind: 'campaign', week: archived.state.market.tick }, boundaryOrder: 99, source: { kind: 'estate', estateId: `estate:${f.studioId}` } })
    archived.state.rights.nextId = 100
    expectRefusal(archived, /estate/)
    const orphan = detached(base)
    orphan.state.rights.estates.push({ estateId: 'estate:studio-nobody', closureId: 'closure-x', studioId: 'studio-nobody', closureWeek: 1, opensWeek: 1, closesWeek: 14,
      lots: [], bids: [], proceeds: [], closedWeek: null, claimsContext: { priorityVersion: 'test', claimCount: 0 }, cashReconciliation: { terminalCash: 0, loanRemainder: 0 } })
    expectRefusal(orphan, /estate.*identity|identity.*estate|unknown studio/)
  })

  it('every authored-start manifest film stays resolvable after migration: the root invents none of them', () => {
    const lifted = v46()
    const resolved = rights.resolveTitles(lifted.state as GameState)
    const manifestTitles = HOLLYWOOD_STARTING_MANIFEST.studios.slice(0, 4).flatMap((s) => s.films!.map((f) => f[0]))
    const virtual = resolved.filmTitles.filter((t) => t.virtual && t.releasedAt.kind === 'beforeCampaign').map((t) => t.title)
    expect(virtual.sort()).toEqual([...manifestTitles].sort())
    expect(lifted.state.rights.filmTitles).toEqual([])
  })
})
