// ── P16A RED A2: the Save49 rights root, its validators and the V48 <-> V49 migration ──
//
// Authority: P16A r3 charter "Exact P16A identity and chronology" (the root and title-event
// validation rules) and RED item A2; P16 integration contract §7 group S (era/integrity:
// "new kinds/roots/reasons refused below their era; empty migration lawful without fabricated
// history; no lossy downgrade with terminal/title/licence/claims state; save/load deterministic").
//
// Era note: actual P15B Save48 is the predecessor, so P16 takes49 here. `P16_SAVE_VERSION` and
// `P16_PREDECESSOR_SAVE_VERSION` are read through the module so the parent can renumber at landing.
//
// Pattern: tests/p14b10-save-v44.test.ts (genuine predecessor through the REAL converter, then a
// hand-projected envelope for validator-focused leaves). Content-specific refusal patterns only.

import { describe, expect, it } from 'vitest'
import { HOLLYWOOD_STARTING_MANIFEST } from '../src/core/hollywoodStartingData.js'
import * as rights from '../src/core/rights.js'
import * as saveModule from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuinePredecessorEnvelope, genuineV45Envelope, genuineV45Raw } from './helpers/p16-fixtures.js'

type Envelope = { saveVersion: number; seed: string; state: GameState & Record<string, unknown>; broadcastCache: unknown[] }
const P16_KINDS = ['rightsConsideration', 'dueDiligenceFee', 'acquisitionOutlay', 'estateSaleProceeds'] as const

function v49(): Envelope {
  return saveModule.convertV48ToV49(genuinePredecessorEnvelope('week53')) as unknown as Envelope
}
function stripRights(state: Record<string, unknown>): Record<string, unknown> {
  const { rights: _rights, ...rest } = state
  const h = rest.hollywood as { businesses: { account: { periods: { movements: Record<string, number> }[] } }[] } | null
  const out = JSON.parse(JSON.stringify(rest)) as Record<string, unknown>
  for (const b of (out.hollywood as typeof h)?.businesses ?? []) for (const p of b.account.periods) for (const k of P16_KINDS) delete p.movements[k]
  return out
}

describe('Save49 era surface', () => {
  it('LIVE_SAVE_VERSION is P16_SAVE_VERSION (49 at this base) with predecessor48, and the V49 functions exist', () => {
    expect(saveModule.P16_SAVE_VERSION).toBe(49)
    expect(saveModule.P16_PREDECESSOR_SAVE_VERSION).toBe(48)
    // P17 (Save50) is live one step above the P16 step.
    expect(saveModule.LIVE_SAVE_VERSION).toBe(saveModule.P16_SAVE_VERSION + 1)
    for (const name of ['validateSaveV49', 'convertV48ToV49', 'convertV49ToV48', 'migrateToV49'] as const) {
      expect(typeof (saveModule as unknown as Record<string, unknown>)[name], name).toBe('function')
    }
  })

  it('validateSave dispatches49 and names the handled range up to the live version (P17: "1 through 50")', () => {
    const envelope = v49()
    expect(saveModule.validateSave(envelope as never).saveVersion).toBe(49)
    expect(() => saveModule.validateSave({ ...envelope, saveVersion: 51 } as never)).toThrow(/unknown saveVersion 51.*versions 1 through 50 only/)
  })
})

describe('Save49 migration from a public-chain Save48 predecessor derived from genuine Save45', () => {
  it('convertV48ToV49 adds exactly the empty rights root at the save week and zero P16 movements on every rival period; nothing else moves', () => {
    const genuine = genuinePredecessorEnvelope('week53') as unknown as Envelope
    const before = saveModule.stableStringify(genuine)
    const lifted = saveModule.convertV48ToV49(genuine as never) as unknown as Envelope
    expect(saveModule.stableStringify(genuine), 'the predecessor input is not mutated').toBe(before)
    expect(lifted.saveVersion).toBe(49)
    const root = lifted.state.rights
    expect(root).toEqual({ version: 2, recordedFromWeek: genuine.state.market.tick, legacyBoundary: { propertyIds: [], filmIds: [], propertyAnchors: [] }, properties: [], filmTitles: [], titleEvents: [], licences: [],
      offers: [], transactions: [], diligence: [], estates: [], absorptions: [], nextId: 1 })
    for (const b of lifted.state.hollywood!.businesses) for (const p of b.account.periods) {
      for (const k of P16_KINDS) expect(p.movements[k]).toBe(0)
    }
    expect(saveModule.stableStringify(stripRights(lifted.state))).toBe(saveModule.stableStringify(genuine.state))
    expect(() => saveModule.validateSaveV49(lifted)).not.toThrow()
    // No past transaction, title or estate is invented from history.
    expect(root.titleEvents).toEqual([])
  })

  it('migrateToLive lifts the genuine raw capture to 46 through importSave, and a second migration is a no-op', () => {
    // P17: the era read is migrateToV49 (the live chain now continues one step to Save50, which adds nothing here).
    const live = saveModule.migrateToV49(saveModule.importSave(genuineV45Raw('week53')))
    expect(live.saveVersion).toBe(49)
    expect(saveModule.stableStringify(saveModule.migrateToV49(live))).toBe(saveModule.stableStringify(live))
    expect(saveModule.stableStringify(saveModule.convertV50ToV49(saveModule.makeSave(live.state as GameState)))).toBe(saveModule.stableStringify(live))
    expect(saveModule.stableStringify(saveModule.migrateToLive(saveModule.importSave(genuineV45Raw('week53'))).state)).toBe(saveModule.stableStringify(live.state))
  })

  it('convertV49ToV48 is lossless while the root is empty and every P16 movement is zero, round-tripping to the genuine bytes', () => {
    const genuine = genuinePredecessorEnvelope('week53')
    const down = saveModule.convertV49ToV48(saveModule.convertV48ToV49(genuine))
    expect(saveModule.stableStringify(down)).toBe(saveModule.stableStringify(genuine))
    expect(saveModule.migrateToV45(saveModule.convertV48ToV49(genuine)).saveVersion).toBe(45)
    // Below 45 the P15 step's own refusal governs this fixture (recorded quarters): P16 adds nothing to it.
    expect(() => saveModule.migrateToV44(saveModule.convertV48ToV49(genuine))).toThrow(/migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter/)
  })

  it('the downgrade refuses by name once a rights record exists; a P16 movement or ledger row without its transaction is refused by the validator first', () => {
    const base = v49()
    const film = base.state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
    const materialized = rights.materializeLegacyTitles(base.state as GameState, { right: 'R2', filmId: film.filmId })
    expect(() => saveModule.convertV49ToV48({ ...base, state: materialized } as never)).toThrow(/migrateToV48: cannot downgrade or discard a recorded rights root/)
    // A forged movement with no transaction is not a lawful V49 state at all: the reconciliation refuses it
    // (the downgrade refusal for a REAL movement is proved with real transactions in the P16B tests).
    const moved = detached(base)
    moved.state.hollywood!.businesses[0]!.account.periods[0]!.movements.rightsConsideration = 1
    moved.state.hollywood!.businesses[0]!.account.periods[0]!.closing += 1
    moved.state.hollywood!.businesses[0]!.account.cash += 1
    expect(() => saveModule.convertV49ToV48(moved as never)).toThrow(/rights\.transactions .*rightsConsideration 1 does not reconcile/)
    const ledgered = detached(base)
    ledgered.state.ledger = [...ledgered.state.ledger, { week: ledgered.state.market.tick, kind: 'dueDiligenceFee', amount: -1, note: 'test' } as never]
    ledgered.state.studio.cash -= 1
    expect(() => saveModule.convertV49ToV48(ledgered as never)).toThrow(/rights\.transactions .*dueDiligenceFee -1 does not reconcile/)
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

it('the actual migrated Save48 predecessor refuses rights authority below Save49 without retagging a modern envelope', () => {
  const predecessor = genuinePredecessorEnvelope('week53')
  expect(saveModule.validateSaveV48(predecessor)).toBe(predecessor)
  const before = saveModule.stableStringify(predecessor)
  const root = { ...predecessor, state: { ...predecessor.state, rights: rights.cutoverRightsRoot(predecessor.state as GameState) } }
  expect(() => saveModule.validateSaveV48(root)).toThrow(/rights|unknown field|exact keys/i)
  const moved = detached(predecessor)
  ;(moved.state.hollywood!.businesses[0]!.account.periods[0]!.movements as Record<string, number>).rightsConsideration = 0
  expect(() => saveModule.validateSaveV48(moved)).toThrow(/exact keys|movements|rightsConsideration/i)
  expect(saveModule.stableStringify(predecessor)).toBe(before)
})

describe('Save49 rights root validator: shape, title events, holders, estates', () => {
  const film = (e: Envelope) => e.state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
  function materialized(): Envelope {
    const base = v49()
    const f = film(base)
    let state = rights.materializeLegacyTitles(base.state as GameState, { right: 'R2', filmId: f.filmId })
    state = rights.materializeLegacyTitles(state, { right: 'R1', propertyId: rights.storyPropertyId(f.conceptId) })
    return { ...base, state: state as Envelope['state'] }
  }
  const expectRefusal = (e: Envelope, pattern: RegExp) => expect(() => saveModule.validateSaveV49(e)).toThrow(pattern)

  it('the control: a materialized genesis pair validates', () => {
    const e = materialized()
    expect(() => saveModule.validateSaveV49(e)).not.toThrow()
    expect(e.state.rights.titleEvents).toHaveLength(2)
  })

  it('refuses a missing root, a wrong version, a recordedFromWeek outside [0, tick], or unknown keys', () => {
    const base = v49()
    const { rights: _r, ...without } = base.state
    expectRefusal({ ...base, state: without as Envelope['state'] }, /rights root is missing/)
    const wrong = detached(base); (wrong.state.rights as { version: number }).version = 3
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
    orphan.state.rights.estates.push({ origin: { kind: 'closure49', closureId: 'closure-x' }, estateId: 'estate:studio-nobody', closureId: 'closure-x', studioId: 'studio-nobody', closureWeek: 1, opensWeek: 1, closesWeek: 14,
      lots: [], bids: [], proceeds: [], closedWeek: null, pending: [], claimsContext: { priorityVersion: 'test', claimIds: [] }, cashReconciliation: { terminalCash: 0, loanRemainder: 0 } })
    expectRefusal(orphan, /estate.*identity|identity.*estate|unknown studio/)
  })

  it('every authored-start manifest film stays resolvable after migration: the root invents none of them', () => {
    const lifted = v49()
    const resolved = rights.resolveTitles(lifted.state as GameState)
    const manifestTitles = HOLLYWOOD_STARTING_MANIFEST.studios.slice(0, 4).flatMap((s) => s.films!.map((f) => f[0]))
    const virtual = resolved.filmTitles.filter((t) => t.virtual && t.releasedAt.kind === 'beforeCampaign').map((t) => t.title)
    expect(virtual.sort()).toEqual([...manifestTitles].sort())
    expect(lifted.state.rights.filmTitles).toEqual([])
  })
})

it('F15 genuine predecessor migration keeps observational frontier and lossless empty-era roundtrip', () => {
  const genuine = genuinePredecessorEnvelope('week53'), before = saveModule.stableStringify(genuine)
  const lifted = saveModule.convertV48ToV49(genuine), root = lifted.state.rights
  expect(root.version).toBe(2)
  expect(root.legacyBoundary).toEqual({ propertyIds: [], filmIds: [], propertyAnchors: [] })
  expect(root.properties).toEqual([]);expect(root.titleEvents).toEqual([])
  const raw = saveModule.exportSave(lifted)
  expect(saveModule.exportSave(saveModule.importSave(raw))).toBe(raw)
  expect(saveModule.stableStringify(saveModule.convertV49ToV48(lifted))).toBe(before)
  expect(saveModule.stableStringify(genuine)).toBe(before)
})
