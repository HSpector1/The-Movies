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
/** Every P16 property id; the route's other films (mintRoute's world, rival releases) found their own lawfully. */
const propertyIds = (s: GameState): string[] => s.rights.properties.map((p) => p.propertyId).sort()
/** The properties whose works include `workId`: a linked continuation sits under exactly its parent. */
const homesOf = (s: GameState, workId: string): string[] => resolveTitles(s).properties.filter((p) => p.workLinks.includes(workId)).map((p) => p.propertyId)

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

  // Lane GREEN r4 (fix 2, G2): the route's other films found their own properties lawfully, so the law is pinned as the
  // property set across the continuation greenlight (the predecessor grows it by exactly the sequel's own mint).
  it('the player\'s own sequel is a work of the parent property; its own concept founds no property and no R1 genesis', () => {
    expect(propertyIds(b.state)).toEqual(propertyIds(released))
    expect(propertyIds(b.state)).not.toContain(storyPropertyId(bConcept))
    expect(b.state.rights.titleEvents.filter((e) => e.subject.right === 'R1' && e.subject.propertyId === storyPropertyId(bConcept))).toEqual([])
    expect(homesOf(b.state, b.productionId)).toEqual([P])
    expect(lineage(b.state)).toEqual([{ property: P, edges: [[A, 'origin', null], [b.productionId, 'directSequel', A]] }])
  })

  describe('released, then continued again', () => {
    let bReleased: GameState, c: { state: GameState; productionId: string }, cConcept: string
    beforeAll(() => {
      bReleased = releaseNow(b.state, b.productionId)
      const concept = freshConcept(bReleased)
      cConcept = concept.id
      c = greenlightAs(bReleased, concept, { type: 'directSequel', predecessorProductionId: b.productionId })
    })

    // Fix 2, G3: rival releases during the sequel's production may found their own properties; none is the sequel's.
    it('the sequel\'s release is titled under the parent; the third installment resolves through it to the same property', () => {
      expect(propertyIds(bReleased)).not.toContain(storyPropertyId(bConcept))
      expect(homesOf(bReleased, b.productionId)).toEqual([P])
      expect(bReleased.rights.filmTitles.find((t) => t.filmId === b.productionId)!.propertyId).toBe(P)
      expect(propertyIds(c.state)).toEqual(propertyIds(bReleased))
      expect(propertyIds(c.state)).not.toContain(storyPropertyId(cConcept))
      expect(homesOf(c.state, c.productionId)).toEqual([P])
      expect(lineage(c.state)).toEqual([{ property: P, edges: [[A, 'origin', null], [b.productionId, 'directSequel', A], [c.productionId, 'directSequel', b.productionId]] }])
    })

    // Review S2 (P16 contract §3; P16's same-concept rule "producing the same story again is a remake"): the sequel's
    // concept founded nothing, so a later PLAIN greenlight of it is a remake of the parent's story, linked to the parent.
    it('a plain greenlight of the linked sequel\'s concept founds no clean title: the title holder\'s remake links to the parent', () => {
      const again = greenlightAs(bReleased, bReleased.concepts.find((x) => x.id === bConcept)!)
      expect(propertyIds(again.state)).toEqual(propertyIds(bReleased))
      expect(again.state.rights.titleEvents.filter((e) => e.subject.right === 'R1' && e.subject.propertyId === storyPropertyId(bConcept))).toEqual([])
      expect(homesOf(again.state, again.productionId)).toEqual([P])
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

  // Review S2: the remake of a licensed sequel's concept is a remake of the licensor's story. Without the parent's remake
  // authority it refuses before any write; it never founds an unencumbered title for the licensee.
  it('a plain greenlight of the licensed sequel\'s concept needs the parent\'s remake authority, and refuses without it', () => {
    const licensed = buyLicence(sold, r01, P, 'sequel', 26)
    const concept = freshConcept(licensed)
    const b = greenlightAs(licensed, concept, { type: 'directSequel', predecessorProductionId: A })
    const out = releaseNow(b.state, b.productionId)
    const before = stableStringify(out)
    expect(() => greenlightAs(out, concept)).toThrow(new RegExp(`has no continuation authority over ${P} .*; ${concept.id} is a linked continuation work of it`))
    expect(stableStringify(out)).toBe(before)
    expect(propertyIds(out)).not.toContain(storyPropertyId(concept.id))
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

// Review B1 (blocking): the tick's release read must see the films this same tick already released, because the root
// records them as released the moment they do. A sequel (greenlit first, so released first: ascending ids) and a reboot of
// the same property releasing in one week made the reboot's prior-continuity comparison cite the sequel, whose result the
// read could not see, and the tick threw on every replay.
describe('P17 same-week release: a sequel and a reboot of one property release in the same tick', () => {
  let committed: GameState, after: GameState, A: string, seqId: string, rebootId: string
  beforeAll(() => {
    const route = mintRoute('p17-p16-same-week-01')
    A = route.productionId
    const used = new Set<string>()
    const seq = greenlightAs(route.released, freshConcept(route.released), { type: 'directSequel', predecessorProductionId: A }, used)
    const reboot = greenlightAs(seq.state, freshConcept(seq.state), { type: 'reboot', predecessorProductionId: A }, used)
    seqId = seq.productionId
    rebootId = reboot.productionId
    let s = reboot.state
    for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)
    committed = applyActions(s, [{ kind: 'commitPictureToRelease', productionId: seqId }, { kind: 'commitPictureToRelease', productionId: rebootId }])
    after = tick(committed)
  })

  it('both release that week, the sequel first; each continuity records its own release once', () => {
    expect(seqId < rebootId).toBe(true)
    const weeks = after.studio.releasedFilms.filter((f) => f.productionId === seqId || f.productionId === rebootId).map((f) => [f.productionId, f.releaseTick])
    expect(weeks.map(([id]) => id)).toEqual([seqId, rebootId])
    expect(weeks[0]![1]).toBe(weeks[1]![1])
    const property = rootOf(after)?.properties[0]
    expect(property?.installments.map((e) => [e.childProductionId, e.type, (e as Edge & { releasedWeek: number | null }).releasedWeek]))
      .toEqual([[A, 'origin', expect.any(Number)], [seqId, 'directSequel', weeks[0]![1]], [rebootId, 'reboot', weeks[1]![1]]])
    expect(property?.branches.map((x) => x.kind)).toEqual(['main', 'reboot'])
  })

  it('the release week replays byte for byte, and its save validates and round-trips', () => {
    expect(stableStringify(tick(committed))).toBe(stableStringify(after))
    const bytes = exportSave(makeSave(after))
    expect(exportSave(migrateToLive(importSave(bytes)))).toBe(bytes)
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
