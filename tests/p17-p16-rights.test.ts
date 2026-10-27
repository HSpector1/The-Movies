// ── P17 on the landed P16 rights: link versus mint, parent-bound spin-offs, licence terms, reboot legality ──
//
// RED-first against the predecessor a5a66c27 (tag p16-technical-checkpoint-20261027). Independent draft review
// (1370-codebase-review-20261022 P17-P18.md): P17-01 — P16's greenlight tail minted `story-property:<concept>` for every
// player greenlight, so a sequel greenlit under a licence handed its producer a clean, unencumbered title and the
// third installment could not resolve; P17-02 — a sequel on a spin-off continuity asked the `sequel` use while P16's
// `branchAuthority` is the parent's `spinoff` use. P16 contract §3: "A licensed continuation links to the existing
// parent and does not mint an unencumbered R1"; 1367-O: a branch stays with its parent until P16 promotes it.
// Charter r2 RED item (1): healthy reboot legal, branch cap on opening only, refused greenlight leaves state unchanged.
//
// Every route is real: P16's own mint hooks, bilateral sales and licences (tests/helpers/p17-route.ts); no rights
// stand-in. This file imports only modules the predecessor has, so each law fails there by assertion: the predecessor
// ignores `continuation`, mints the clean title, refuses nothing and keeps no franchise root.

import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { resolveTitles, storyPropertyId } from '../src/core/rights.js'
import { LIVE_SAVE_VERSION, exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { mintRoute } from './helpers/p16-fixtures.js'
import { buyLicence, freshConcept, grantLicence, greenlightAs, releaseNow, sellTitle } from './helpers/p17-route.js'

type Edge = { childProductionId: string; parentProductionId: string | null; type: string; branchId: string }
type Root = { properties: { storyPropertyId: string; installments: Edge[]; branches: { branchId: string; kind: string }[]; subProperties: { subPropertyId: string }[] }[] }
const rootOf = (s: GameState): Root | undefined => (s as GameState & { franchises?: Root }).franchises
const worksOf = (s: GameState, propertyId: string): string[] => resolveTitles(s).properties.find((p) => p.propertyId === propertyId)?.workLinks ?? []
const lineage = (s: GameState) => rootOf(s)?.properties.map((p) => ({ property: p.storyPropertyId, edges: p.installments.map((e) => [e.childProductionId, e.type, e.parentProductionId]) }))

describe('P17-01 link versus mint: a continuation joins its parent property and never founds a clean title', () => {
  let A: string, P: string, released: GameState, b: { state: GameState; productionId: string }, bConcept: string
  beforeAll(() => {
    const route = mintRoute('p17-p16-link-01')
    A = route.productionId
    P = storyPropertyId(route.conceptId)
    released = route.released
    const concept = freshConcept(released)
    bConcept = concept.id
    b = greenlightAs(released, concept, { type: 'directSequel', predecessorProductionId: A })
  })

  it('the player\'s own sequel is a work of the parent property; its own concept founds no property and no R1 genesis', () => {
    expect(b.state.rights.properties.map((p) => p.propertyId)).toEqual([P])
    expect(b.state.rights.titleEvents.filter((e) => e.subject.right === 'R1' && e.subject.propertyId === storyPropertyId(bConcept))).toEqual([])
    expect(worksOf(b.state, P)).toContain(b.productionId)
    expect(lineage(b.state)).toEqual([{ property: P, edges: [[A, 'origin', null], [b.productionId, 'directSequel', A]] }])
  })

  describe('released, then continued again', () => {
    let bReleased: GameState, c: { state: GameState; productionId: string }
    beforeAll(() => {
      bReleased = releaseNow(b.state, b.productionId)
      c = greenlightAs(bReleased, freshConcept(bReleased), { type: 'directSequel', predecessorProductionId: b.productionId })
    })

    it('the sequel\'s release is titled under the parent; the third installment resolves through it to the same property', () => {
      expect(bReleased.rights.filmTitles.find((t) => t.filmId === b.productionId)!.propertyId).toBe(P)
      expect(c.state.rights.properties.map((p) => p.propertyId)).toEqual([P])
      expect(lineage(c.state)).toEqual([{ property: P, edges: [[A, 'origin', null], [b.productionId, 'directSequel', A], [c.productionId, 'directSequel', b.productionId]] }])
    })

    it('the live save carries the franchise root at Save50 and round-trips byte for byte', () => {
      expect(LIVE_SAVE_VERSION).toBe(50)
      const save = makeSave(c.state)
      expect(save.saveVersion).toBe(50)
      const bytes = exportSave(save)
      expect(exportSave(migrateToLive(importSave(bytes)))).toBe(bytes)
      expect(lineage(importSave(bytes).state as GameState)).toEqual(lineage(c.state))
    })
  })
})

describe('P17-01 under a licence: the licensee links to the licensor\'s property; the licence term covers the release', () => {
  let A: string, P: string, sold: GameState, r01: string
  beforeAll(() => {
    const route = mintRoute('p17-p16-licence-01')
    A = route.productionId
    P = storyPropertyId(route.conceptId)
    r01 = route.released.hollywood!.identities[1]!.studioId
    sold = sellTitle(route.released, P, r01)
  })

  it('an exclusive sequel licensee\'s sequel links to the rival\'s property and gains no title of its own', () => {
    const licensed = buyLicence(sold, r01, P, 'sequel', 26)
    const concept = freshConcept(licensed)
    const b = greenlightAs(licensed, concept, { type: 'directSequel', predecessorProductionId: A })
    expect(b.state.rights.properties.some((p) => p.propertyId === storyPropertyId(concept.id))).toBe(false)
    expect(worksOf(b.state, P)).toContain(b.productionId)
    expect(lineage(b.state)).toEqual([{ property: P, edges: [[A, 'origin', null], [b.productionId, 'directSequel', A]] }])
  })

  it('without the licence the player holds no sequel right in the rival\'s property: refused by name, nothing written', () => {
    const before = stableStringify(sold)
    expect(() => greenlightAs(sold, freshConcept(sold), { type: 'directSequel', predecessorProductionId: A })).toThrow(new RegExp(`noAuthority:${r01}`))
    expect(stableStringify(sold)).toBe(before)
  })

  it('a licence that ends before the picture\'s earliest release week refuses at the greenlight, and the state is unchanged', () => {
    const short = buyLicence(sold, r01, P, 'sequel', TUNING.PRODUCTION_TICKS)
    const before = stableStringify(short)
    expect(() => greenlightAs(short, freshConcept(short), { type: 'directSequel', predecessorProductionId: A }))
      .toThrow(new RegExp(`only until week ${short.market.tick + TUNING.PRODUCTION_TICKS}; the grant must cover the picture's earliest release week ${short.market.tick + TUNING.PRODUCTION_TICKS}`))
    expect(stableStringify(short)).toBe(before)
  })

  describe('a licence that lapses while the picture waits at Release Ready', () => {
    let waiting: GameState, productionId: string
    beforeAll(() => {
      const licensed = buyLicence(sold, r01, P, 'sequel', TUNING.PRODUCTION_TICKS + 1)
      const b = greenlightAs(licensed, freshConcept(licensed), { type: 'directSequel', predecessorProductionId: A })
      productionId = b.productionId
      waiting = b.state
      for (let i = 0; i <= TUNING.PRODUCTION_TICKS; i++) waiting = tick(waiting) // one week past Release Ready, uncommitted
    })

    it('committing it to release reads the grant again and refuses with P16\'s expiry; the tick never throws and the picture waits', () => {
      expect(waiting.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(1)
      const before = stableStringify(waiting)
      expect(() => applyActions(waiting, [{ kind: 'commitPictureToRelease', productionId }])).toThrow(/commitPictureToRelease rejected — .*expired:rights-licence-/)
      expect(stableStringify(waiting)).toBe(before)
      const later = tick(waiting)
      expect(later.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks).toBe(1)
    })
  })
})

describe('P17-02 parent-bound spin-off authority: a spin-off continuity answers to the parent\'s spin-off use', () => {
  let A: string, P: string, S: string, granted: GameState, r01: string
  beforeAll(() => {
    const route = mintRoute('p17-p16-branch-01')
    A = route.productionId
    P = storyPropertyId(route.conceptId)
    r01 = route.released.hollywood!.identities[1]!.studioId
    const hooked = applyActions(route.released, [{ kind: 'mintSubProperty', productionId: A, hookKind: 'location', citedTalentIds: [] } as never])
    const sub = rootOf(hooked)!.properties[0]!.subProperties[0]!.subPropertyId
    const spin = greenlightAs(hooked, freshConcept(hooked), { type: 'spinOff', predecessorProductionId: A, subPropertyId: sub })
    S = spin.productionId
    granted = grantLicence(releaseNow(spin.state, S), r01, P, 'spinoff', 52)
  })

  it('once the parent\'s spin-off use is licensed away, a sequel to the spin-off film refuses naming the licensee', () => {
    const before = stableStringify(granted)
    expect(() => greenlightAs(granted, freshConcept(granted), { type: 'directSequel', predecessorProductionId: S })).toThrow(new RegExp(`holds no lawful spinoff right in ${P} .*noAuthority:${r01}`))
    expect(stableStringify(granted)).toBe(before)
  })

  it('the main continuity is the title holder\'s sequel use and stays lawful for the player', () => {
    const main = greenlightAs(granted, freshConcept(granted), { type: 'directSequel', predecessorProductionId: A })
    const property = rootOf(main.state)!.properties[0]!
    const edge = property.installments.find((e) => e.childProductionId === main.productionId)!
    expect(property.branches.find((x) => x.branchId === edge.branchId)!.kind).toBe('main')
  })
})

describe('P17 reboot legality and atomic refusal on the live route', () => {
  let A: string, released: GameState
  beforeAll(() => {
    const route = mintRoute('p17-p16-reboot-01')
    A = route.productionId
    released = route.released
  })

  it('a healthy property may be rebooted (Owner choice); a fourth concurrent continuity refuses at three open and writes nothing', () => {
    const used = new Set<string>(), skip = new Set<string>()
    const next = (s: GameState) => { const c = freshConcept(s, skip); skip.add(c.id); return c }
    const r1 = greenlightAs(released, next(released), { type: 'reboot', predecessorProductionId: A }, used)
    const r2 = greenlightAs(r1.state, next(r1.state), { type: 'reboot', predecessorProductionId: A }, used)
    expect(rootOf(r2.state)!.properties[0]!.branches.map((b) => b.kind)).toEqual(['main', 'reboot', 'reboot'])
    const before = stableStringify(r2.state)
    expect(() => greenlightAs(r2.state, next(r2.state), { type: 'reboot', predecessorProductionId: A }, used)).toThrow(/3 continuities are open/)
    expect(stableStringify(r2.state)).toBe(before)
  })

  it('a continuation citing an unknown film refuses before any write; a greenlight without a request writes no franchise root', () => {
    const before = stableStringify(released)
    expect(() => greenlightAs(released, freshConcept(released), { type: 'directSequel', predecessorProductionId: 'prod-nobody' })).toThrow(/no P16 StoryProperty links prod-nobody/)
    expect(stableStringify(released)).toBe(before)
    expect(Object.hasOwn(greenlightAs(released, freshConcept(released)).state, 'franchises')).toBe(false)
  })
})
