// ── P16A RED A3: atomic mint at accepted greenlight (R1) and actual release (R2) ──
//
// Authority: P16A r3 charter "Exact P16A identity and chronology" ("For a newly accepted original
// player/rival greenlight, atomically mint a StoryProperty and one R1 genesis event; refusal leaves
// both and all other state unchanged ... At an actual release, append one R2 FilmTitle/genesis")
// and RED item A3; P16 integration contract §3 ("Adopt original greenlight as the new-property
// mint boundary").
//
// Routes: tests/helpers/p16-fixtures.ts `mintRoute` (one real player greenlight on a fresh
// hollywood world, held, committed, released) and natural rival ticks on the same world.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as rights from '../src/core/rights.js'
import { convertV48ToV49, convertV49ToV48, convertV50ToV49, convertV51ToV50, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { beginFounding } from '../src/core/employment.js'
import { generateWorld } from '../src/core/worldgen.js'
import { freshHollywoodWorld, greenlightPayload, mintRoute } from './helpers/p16-fixtures.js'

describe('P16A mint: player greenlight', () => {
  it('an accepted greenlight mints exactly one property with one R1 genesis, titled from the greenlight concept, linked to the production', () => {
    const route = mintRoute()
    const h = route.greenlit.hollywood!
    expect(route.start.rights.properties).toEqual([])
    expect(route.start.rights.titleEvents).toEqual([])
    const propertyId = rights.storyPropertyId(route.conceptId)
    expect(route.greenlit.rights.properties).toHaveLength(1)
    const property = route.greenlit.rights.properties[0]!
    expect(property.propertyId).toBe(propertyId)
    expect(property.conceptId).toBe(route.conceptId)
    expect(property.creatorStudioId).toBe(h.playerStudioId)
    expect(property.createdAt).toEqual({ kind: 'campaign', week: 0 })
    expect(property.title).toBe(route.start.concepts.find((c) => c.id === route.conceptId)!.title)
    expect(property.titleSource).toBe('greenlight')
    expect(property.origin).toBe('original')
    expect(property.parentPropertyId).toBeNull()
    expect(property.workLinks).toEqual([route.productionId])
    expect(route.greenlit.rights.titleEvents).toHaveLength(1)
    const genesis = route.greenlit.rights.titleEvents[0]!
    expect(genesis).toMatchObject({ subject: { right: 'R1', propertyId }, ordinal: 1, cause: 'genesis', priorHolder: null, newHolder: h.playerStudioId,
      date: { kind: 'campaign', week: 0 }, source: { kind: 'greenlight', productionId: route.productionId } })
    expect(route.greenlit.rights.filmTitles).toEqual([])
    expect(rights.currentHolder(route.greenlit, { right: 'R1', propertyId }, 0)).toEqual({ kind: 'holder', holderId: h.playerStudioId, tradeable: true, archived: false })
  })

  it('a refused greenlight leaves the root, the slate, the wallet, the RNG and the queue unchanged', () => {
    const start = freshHollywoodWorld()
    const concept = start.concepts[0]!
    const before = stableStringify(start)
    const payload = greenlightPayload(start, concept)
    // The greenlight header refuses an unknown concept before anything is written.
    expect(() => applyActions(start, [{ kind: 'greenlight', production: { ...payload, conceptId: 'concept-nobody-wrote' } }])).toThrow(/concept/i)
    expect(stableStringify(start)).toBe(before)
    expect(start.rights.properties).toEqual([])
  })

  it('a second greenlight of the same concept by its R1 holder links the new production to the one property; a non-holder is refused and changes nothing', () => {
    const route = mintRoute()
    const h = route.greenlit.hollywood!
    const production = route.greenlit.studio.activeProductions.find((p) => p.id === route.productionId)!
    const again = { ...production, id: 'prod-remake' }
    const linked = rights.mintStoryPropertyAtGreenlight(route.greenlit, { studioId: h.playerStudioId, production: again, week: 0 })
    expect(linked.rights.properties).toHaveLength(1)
    expect(linked.rights.properties[0]!.workLinks).toEqual([route.productionId, 'prod-remake'])
    expect(linked.rights.titleEvents).toHaveLength(1)
    const before = stableStringify(route.greenlit)
    const rival = h.identities[1]!.studioId
    expect(() => rights.mintStoryPropertyAtGreenlight(route.greenlit, { studioId: rival, production: again, week: 0 })).toThrow(/no continuation authority/)
    expect(stableStringify(route.greenlit)).toBe(before)
  })
})

describe('P16A mint: player release', () => {
  it('the releasing tick appends exactly one R2 FilmTitle with the release week, release title, creator and work link; the committed state has none', () => {
    const route = mintRoute()
    const h = route.released.hollywood!
    expect(route.committed.rights.filmTitles).toEqual([])
    const film = route.released.studio.releasedFilms.find((f) => f.productionId === route.productionId)!
    expect(route.released.rights.filmTitles).toHaveLength(1)
    const title = route.released.rights.filmTitles[0]!
    expect(title).toMatchObject({ filmId: route.productionId, conceptId: route.conceptId, propertyId: rights.storyPropertyId(route.conceptId),
      creatorStudioId: h.playerStudioId, releasedAt: { kind: 'campaign', week: film.releaseTick }, titleSource: 'release' })
    expect(title.title).toBe(route.start.concepts.find((c) => c.id === route.conceptId)!.title)
    const r2 = route.released.rights.titleEvents.filter((e) => e.subject.right === 'R2')
    expect(r2).toHaveLength(1)
    expect(r2[0]).toMatchObject({ subject: { right: 'R2', filmId: route.productionId }, ordinal: 1, cause: 'genesis', priorHolder: null, newHolder: h.playerStudioId,
      date: { kind: 'campaign', week: film.releaseTick }, source: { kind: 'release', productionId: route.productionId } })
    // The work link is appended once on the existing property; no second property is minted for the concept
    // (the other properties in the root are the rivals' own week-5 greenlights).
    const playerProperties = route.released.rights.properties.filter((p) => p.creatorStudioId === h.playerStudioId)
    expect(playerProperties).toHaveLength(1)
    expect(playerProperties[0]!.workLinks).toEqual([route.productionId])
    // The released FilmResult and the concept are not rewritten by the mint.
    expect(film.conceptId).toBe(route.conceptId)
    expect(route.released.concepts.find((c) => c.id === route.conceptId)).toEqual(route.start.concepts.find((c) => c.id === route.conceptId))
  })

  it('cancellation preserves the genuine R1 history and never invents an R2 title', () => {
    const route = mintRoute()
    const cancelled = applyActions(route.greenlit, [{ kind: 'cancel', productionId: route.productionId }])
    expect(cancelled.rights.properties).toEqual(route.greenlit.rights.properties)
    expect(cancelled.rights.titleEvents).toEqual(route.greenlit.rights.titleEvents)
    let state = cancelled
    for (let i = 0; i < 10; i++) state = tick(state)
    expect(state.rights.filmTitles.some((t) => t.filmId === route.productionId)).toBe(false)
    expect(state.rights.properties.find((p) => p.propertyId === rights.storyPropertyId(route.conceptId))!.workLinks).toEqual([route.productionId])
  })

  it('tick is deterministic and reload/replay never duplicates a mint', () => {
    const route = mintRoute()
    expect(stableStringify(tick(route.committed))).toBe(stableStringify(route.released))
    const reloaded = migrateToLive(importSave(stableStringify(makeSave(route.released)))).state as GameState
    expect(stableStringify(reloaded.rights)).toBe(stableStringify(route.released.rights))
    expect(stableStringify(tick(reloaded).rights)).toBe(stableStringify(tick(route.released).rights))
    // Replay: the same action on the same base mints the same records.
    const again = applyActions(route.start, [{ kind: 'greenlight', production: greenlightPayload(route.start, route.start.concepts[0]!) }])
    expect(stableStringify(again.rights)).toBe(stableStringify(route.greenlit.rights))
  })
})

describe('P16A mint: rival greenlight and release', () => {
  it('each rival greenlight mints one property with the rival as creator at its decision week, and each rival release mints one R2 title', () => {
    const route = mintRoute()
    let state = route.released
    const h = state.hollywood!
    const rivalProductions = h.businesses.flatMap((b) => b.productions.map((p) => ({ studioId: b.studioId, production: p })))
    expect(rivalProductions.length).toBeGreaterThan(0)
    for (const { studioId, production } of rivalProductions) {
      const propertyId = rights.storyPropertyId(production.conceptId)
      const property = state.rights.properties.find((p) => p.propertyId === propertyId)
      expect(property, propertyId).toBeDefined()
      expect(property!.creatorStudioId).toBe(studioId)
      expect(property!.createdAt).toEqual({ kind: 'campaign', week: production.startTick })
      expect(property!.title).toBe(h.concepts.find((c) => c.id === production.conceptId)!.title)
      expect(property!.workLinks).toEqual([production.id])
      const genesis = state.rights.titleEvents.filter((e) => e.subject.right === 'R1' && e.subject.propertyId === propertyId)
      expect(genesis).toHaveLength(1)
      expect(genesis[0]).toMatchObject({ cause: 'genesis', priorHolder: null, newHolder: studioId, source: { kind: 'greenlight', productionId: production.id } })
    }
    // Tick until the first rival release; then its R2 title exists exactly once.
    const authoredCount = h.films.length
    let weeks = 0
    while (state.hollywood!.films.length === authoredCount && weeks < 40) { state = tick(state); weeks++ }
    const released = state.hollywood!.films.filter((f) => f.provenance === 'simulation/v1')
    expect(released.length).toBeGreaterThan(0)
    for (const film of released) {
      if (film.provenance !== 'simulation/v1') continue
      const titles = state.rights.filmTitles.filter((t) => t.filmId === film.filmId)
      expect(titles).toHaveLength(1)
      expect(titles[0]).toMatchObject({ creatorStudioId: film.studioId, conceptId: film.conceptId, propertyId: rights.storyPropertyId(film.conceptId),
        releasedAt: { kind: 'campaign', week: film.result.releaseTick }, titleSource: 'release' })
      expect(titles[0]!.title).toBe(film.title)
      expect(state.rights.titleEvents.filter((e) => e.subject.right === 'R2' && e.subject.filmId === film.filmId)).toHaveLength(1)
      // A persisted record and the (now unnecessary) virtual resolver agree exactly.
      const resolved = rights.resolveTitles(state).filmTitles.find((t) => t.filmId === film.filmId)!
      expect(resolved.virtual).toBe(false)
      expect(resolved.creatorStudioId).toBe(film.studioId)
    }
    // The authored-start films were never minted into the root: they stay virtual.
    expect(state.rights.filmTitles.some((t) => t.releasedAt.kind === 'beforeCampaign')).toBe(false)
  })
})

// ── the recording boundary of a world whose industry opens later (route L: a late founding) ──
describe('P16A recording boundary: a world that greenlights before its industry opens', () => {
  it('records rights from the week the industry opens: pre-industry work is legacy (derived, never persisted), the save validates, and the holder resolves to the player', () => {
    const world = generateWorld('p16a-pre-industry-01')
    expect(world.hollywood).toBeNull()
    expect(world.rights.recordedFromWeek).toBe(0)
    const concept = world.concepts[0]!
    const greenlit = applyActions(world, [{ kind: 'greenlight', production: greenlightPayload(world, concept) }])
    expect(greenlit.studio.activeProductions.some((p) => p.conceptId === concept.id)).toBe(true)
    expect(greenlit.rights.properties).toEqual([]) // no industry: no identity to record a title against
    let s = greenlit
    for (let i = 0; i < 3; i++) s = tick(s)
    // The real founding path: beginFounding opens the industry as a 'migration' campaign when the
    // world is past week 0 (employment.ts); a 'fresh' campaign must start at week zero.
    const opened = beginFounding(s)
    const openedWeek = opened.market.tick
    expect(openedWeek).toBe(3)
    expect(opened.rights.recordedFromWeek).toBe(openedWeek)
    expect(opened.rights.properties).toEqual([])
    expect(opened.rights.titleEvents).toEqual([])
    const propertyId = rights.storyPropertyId(concept.id)
    expect(rights.isLegacyDate({ kind: 'campaign', week: 0 }, opened.rights.recordedFromWeek)).toBe(true)
    expect(rights.currentHolder(opened, { right: 'R1', propertyId }, openedWeek)).toMatchObject({ kind: 'holder', holderId: opened.hollywood!.playerStudioId, tradeable: true })
    expect(() => makeSave(opened)).not.toThrow()
    const reloaded = migrateToLive(importSave(stableStringify(makeSave(opened)))).state as GameState
    expect(stableStringify(reloaded.rights)).toBe(stableStringify(opened.rights))
    // A second initialization is a no-op for the root too.
    expect(stableStringify(initializeHollywood(opened, 'migration').rights)).toBe(stableStringify(opened.rights))
  })
})

// F15: current rootv2 frontier distinguishes genuinely pre-opening facts in the same week.
describe('F15 boundary mint integrity', () => {
  it('rejects deletion of a newly hooked boundary property and genesis, without mutating the save', () => {
    const route = mintRoute('p16-f15-new-boundary'), state = route.greenlit
    expect(state.market.tick).toBe(state.rights.recordedFromWeek)
    expect(state.rights.legacyBoundary.propertyIds).toEqual([])
    expect(() => makeSave(state)).not.toThrow()
    const id = rights.storyPropertyId(route.conceptId), mutant = JSON.parse(stableStringify(state)) as GameState
    expect(mutant.rights.properties.some(p => p.propertyId === id)).toBe(true)
    mutant.rights.properties = mutant.rights.properties.filter(p => p.propertyId !== id)
    mutant.rights.titleEvents = mutant.rights.titleEvents.filter(e => !(e.subject.right === 'R1' && e.subject.propertyId === id))
    const before = stableStringify(mutant)
    expect(() => makeSave(mutant)).toThrow(/has no persisted record/)
    expect(stableStringify(mutant)).toBe(before)
  })
  it('retains an actual pre-opening greenlight at the same boundary week as derived legacy', () => {
    let state = generateWorld('p16-f15-preopening-boundary')
    for (let i = 0; i < 3; i++) state = tick(state)
    const concept = state.concepts[0]!
    const before = stableStringify(state)
    const greenlit = applyActions(state, [{ kind: 'greenlight', production: greenlightPayload(state, concept) }])
    expect(stableStringify(state)).toBe(before)
    expect(greenlit.hollywood).toBeNull()
    const opened = beginFounding(greenlit), id = rights.storyPropertyId(concept.id)
    expect(opened.market.tick).toBe(3)
    expect(opened.rights.recordedFromWeek).toBe(3)
    expect(opened.rights.legacyBoundary.propertyIds).toContain(id)
    expect(opened.rights.properties).toEqual([])
    expect(opened.rights.titleEvents).toEqual([])
    // A public-converter-derived predecessor, not an original historical capture.
    const originalFrontier = stableStringify(opened.rights.legacyBoundary), originalOpened = stableStringify(opened)
    const predecessor = convertV49ToV48(convertV50ToV49(convertV51ToV50(makeSave(opened))))
    expect(predecessor.saveVersion).toBe(48)
    const predecessorBefore = stableStringify(predecessor), relifted = convertV48ToV49(predecessor)
    expect(relifted.saveVersion).toBe(49)
    expect(stableStringify(relifted.state.rights.legacyBoundary)).toBe(originalFrontier)
    expect(relifted.state.rights.properties).toEqual([])
    expect(relifted.state.rights.titleEvents).toEqual([])
    expect(stableStringify(predecessor)).toBe(predecessorBefore)
    expect(stableStringify(opened)).toBe(originalOpened)
    expect(rights.currentHolder(opened, { right: 'R1', propertyId: id }, 3)).toMatchObject({ kind: 'holder', holderId: opened.hollywood!.playerStudioId })
    const saved = stableStringify(makeSave(opened))
    expect(stableStringify(makeSave(migrateToLive(importSave(saved)).state as GameState))).toBe(saved)
    const unknown = JSON.parse(stableStringify(opened)) as GameState
    unknown.rights.legacyBoundary.propertyIds = ['story-property:unknown']
    expect(() => makeSave(unknown)).toThrow(/not an authentic boundary property anchor/)
  })
})

// The anchor survives disappearance of the sole transient production and preserves its original date.
it('F15 actual cancel/save/reload/regreenlight retains cutover identity and original creation week', () => {
  let state = generateWorld('p16-f15-cancel-boundary')
  for (let i = 0; i < 3; i++) state = tick(state)
  const concept = state.concepts[0]!, greenlit = applyActions(state, [{ kind: 'greenlight', production: greenlightPayload(state, concept) }])
  const productionId = greenlit.studio.activeProductions.at(-1)!.id
  const opened = initializeHollywood(greenlit, 'migration'), id = rights.storyPropertyId(concept.id)
  expect(opened.rights.legacyBoundary.propertyIds).toContain(id)
  const anchor = stableStringify(opened.rights.legacyBoundary), before = stableStringify(opened)
  const cancelled = applyActions(opened, [{ kind: 'cancel', productionId }])
  expect(stableStringify(opened)).toBe(before)
  expect(cancelled.studio.activeProductions.some(p => p.id === productionId)).toBe(false)
  expect(() => convertV49ToV48(convertV50ToV49(convertV51ToV50(makeSave(cancelled))))).toThrow(/unique cutover provenance/)
  const saved = stableStringify(makeSave(cancelled)), loaded = migrateToLive(importSave(saved)).state as GameState
  expect(stableStringify(loaded.rights.legacyBoundary)).toBe(anchor)
  expect(rights.currentHolder(loaded, { right: 'R1', propertyId: id }, 3)).toMatchObject({ kind: 'holder', holderId: loaded.hollywood!.playerStudioId })
  const later = tick(loaded), renewed = applyActions(later, [{ kind: 'greenlight', production: greenlightPayload(later, concept) }])
  expect(stableStringify(renewed.rights.legacyBoundary)).toBe(anchor)
  expect(rights.resolveTitles(renewed).properties.find(p => p.propertyId === id)!.createdAt).toEqual({ kind: 'campaign', week: 3 })
  expect(() => makeSave(renewed)).not.toThrow()
  const missingEvidence = JSON.parse(stableStringify(cancelled)) as GameState
  missingEvidence.ledger = missingEvidence.ledger.filter(row => row.productionId !== productionId)
  expect(() => rights.validateRightsRoot(missingEvidence as unknown as Record<string, unknown>, 'F15 anchor')).toThrow(/no retained boundary production evidence/)
})

it('F15 observed active fallback without a greenlight ledger survives disappearance without inventing a debit', () => {
  const route = mintRoute('p16-f15-fallback-source-unit'), source = JSON.parse(stableStringify(route.greenlit)) as GameState
  // Independently constructed legacy-reader input, not a historical save/campaign claim.
  source.ledger = source.ledger.filter(row => !(row.kind === 'production' && row.productionId === route.productionId))
  source.rights = rights.initialRightsRoot(source.market.tick)
  const original = stableStringify(source), frontier = rights.cutoverRightsRoot(source)
  expect(stableStringify(source)).toBe(original)
  expect(frontier.legacyBoundary.propertyAnchors).toMatchObject([{propertyId:rights.storyPropertyId(route.conceptId),sources:[{productionId:route.productionId,kind:'player-active'}]}])
  source.rights = frontier
  expect(() => rights.validateRightsRoot(source as unknown as Record<string,unknown>, 'fallback unit')).not.toThrow()
  source.studio.activeProductions = source.studio.activeProductions.filter(p => p.id !== route.productionId)
  const before = stableStringify(source)
  expect(() => rights.validateRightsRoot(source as unknown as Record<string,unknown>, 'cancelled fallback unit')).not.toThrow()
  expect(stableStringify(source)).toBe(before)
  expect(source.ledger.some(row => row.kind === 'production' && row.productionId === route.productionId)).toBe(false)
})
