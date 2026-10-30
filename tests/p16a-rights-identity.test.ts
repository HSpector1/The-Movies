// ── P16A RED: property identity, legacy title resolution, holders and default authority ──
//
// Authority: P16A r3 charter (1370-ad-copy-only-unblock-and-p16a-preparation/p16a-r3/
// P16A-CONTRACT-AND-RED.md) "Exact P16A identity and chronology", "Four rights and read model",
// RED items A1 (source/provenance) and A4 (pure rights lookup); P16 integration contract
// (1367-stage/p16-prep/P16-RIGHTS-ESTATE-CONTRACT.md) §3; 1367-O (branch rights stay with the
// parent until explicit promotion).
//
// Expected values are derived from the charter text and the genuine fixture's own facts
// (manifest rows, release weeks, announcement receipts), never from src/core/rights.ts.

import { describe, expect, it } from 'vitest'
import { HOLLYWOOD_STARTING_MANIFEST } from '../src/core/hollywoodStartingData.js'
import * as rights from '../src/core/rights.js'
import { stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { liveFromGenuine, mintRoute } from './helpers/p16-fixtures.js'

type RightSubject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }

const R1 = (propertyId: string): RightSubject => ({ right: 'R1', propertyId })
const R2 = (filmId: string): RightSubject => ({ right: 'R2', filmId })

describe('P16A identity: story property id grammar', () => {
  it('propertyId is the prefix plus the complete founding conceptId, injective and invertible', () => {
    const samples = ['c-00', 'c-17', 'concept-orig-0042', 'studio-aca408ec-r01:concept:0', 'studio-aca408ec-r01:concept:0-1',
      'studio-aca408ec-r01:historical-concept:1', 'studio-aca408ec-player:concept:3']
    const ids = samples.map((c) => rights.storyPropertyId(c))
    expect(ids).toEqual(samples.map((c) => `story-property:${c}`))
    expect(new Set(ids).size).toBe(samples.length)
    for (const [i, id] of ids.entries()) expect(rights.parseStoryPropertyId(id)).toBe(samples[i])
    // Never normalized, truncated or title-derived.
    expect(rights.storyPropertyId('A Title With Spaces')).toBe('story-property:A Title With Spaces')
    expect(rights.parseStoryPropertyId('c-00')).toBeNull()
    expect(rights.parseStoryPropertyId('story-property:')).toBeNull()
    expect(() => rights.storyPropertyId('')).toThrow(/conceptId/)
  })
})

describe('P16A legacy resolver: authored-start films resolve from the manifest, not a FilmConcept', () => {
  it('each authored film yields a virtual R2 title and R1 property dated beforeCampaign(year) with manifest title and creator', () => {
    const state = liveFromGenuine('week53')
    const h = state.hollywood!
    const resolved = rights.resolveTitles(state)
    const authored = h.films.filter((f) => f.provenance === 'authored-start/v1')
    expect(authored.length).toBe(8)
    for (const film of authored) {
      if (film.provenance !== 'authored-start/v1') continue
      const identity = h.identities.find((i) => i.studioId === film.studioId)!
      const row = HOLLYWOOD_STARTING_MANIFEST.studios[identity.row - 1]!
      const manifestFilm = row.films!.find((r) => r[0] === film.title)!
      const title = resolved.filmTitles.find((t) => t.filmId === film.filmId)
      expect(title, film.filmId).toBeDefined()
      expect(title!.creatorStudioId).toBe(film.studioId)
      expect(title!.title).toBe(manifestFilm[0])
      expect(title!.releasedAt).toEqual({ kind: 'beforeCampaign', year: manifestFilm[1] })
      expect(title!.virtual).toBe(true)
      expect(title!.source.kind).toBe('legacy')
      expect(title!.propertyId).toBe(rights.storyPropertyId(film.conceptId))
      const property = resolved.properties.find((p) => p.propertyId === rights.storyPropertyId(film.conceptId))
      expect(property, film.conceptId).toBeDefined()
      expect(property!.creatorStudioId).toBe(film.studioId)
      expect(property!.createdAt).toEqual({ kind: 'beforeCampaign', year: manifestFilm[1] })
      expect(property!.workLinks).toEqual([film.filmId])
      // No FilmConcept row exists for an authored film, and none is invented.
      expect(state.concepts.some((c) => c.id === film.conceptId)).toBe(false)
      expect(h.concepts.some((c) => c.id === film.conceptId)).toBe(false)
    }
    // Exactly one genesis per subject, priorHolder null, newHolder the creator.
    for (const film of authored) {
      const genesis = resolved.events.filter((e) => e.subject.right === 'R2' && e.subject.filmId === film.filmId)
      expect(genesis).toHaveLength(1)
      expect(genesis[0]!.cause).toBe('genesis')
      expect(genesis[0]!.priorHolder).toBeNull()
      expect(genesis[0]!.newHolder).toBe(film.studioId)
    }
  })

  it('simulated rival films resolve R2 at the release week and R1 at the earliest attested event (the announcement), creator permanent', () => {
    const state = liveFromGenuine('week53')
    const h = state.hollywood!
    const resolved = rights.resolveTitles(state)
    const live = h.films.filter((f) => f.provenance === 'simulation/v1')
    expect(live.length).toBeGreaterThan(0)
    for (const film of live) {
      if (film.provenance !== 'simulation/v1') continue
      const title = resolved.filmTitles.find((t) => t.filmId === film.filmId)!
      expect(title.creatorStudioId).toBe(film.studioId)
      expect(title.title).toBe(film.title)
      expect(title.releasedAt).toEqual({ kind: 'campaign', week: film.result.releaseTick })
      const business = h.businesses.find((b) => b.studioId === film.studioId)!
      const cost = business.projects.find((p) => p.productionId === film.filmId)!
      const property = resolved.properties.find((p) => p.propertyId === rights.storyPropertyId(film.conceptId))!
      expect(property.createdAt).toEqual({ kind: 'campaign', week: cost.announcedWeek })
      expect(property.creatorStudioId).toBe(film.studioId)
      expect(property.workLinks).toContain(film.filmId)
    }
  })

  it('a migration-origin player library resolves from released FilmResults with the player identity as creator; a film with no release-frozen title row has title null, never a fabricated one', () => {
    const state = liveFromGenuine('routeL6240')
    const h = state.hollywood!
    const resolved = rights.resolveTitles(state)
    expect(state.studio.releasedFilms.length).toBe(12)
    const rows = new Map(state.studioHistory.rows.flatMap((r) => (r.kind === 'filmReleased' ? [[r.productionId, r.title] as const] : [])))
    for (const film of state.studio.releasedFilms) {
      const title = resolved.filmTitles.find((t) => t.filmId === film.productionId)!
      expect(title.creatorStudioId).toBe(h.playerStudioId)
      expect(title.releasedAt).toEqual({ kind: 'campaign', week: film.releaseTick })
      expect(title.title).toBe(rows.get(film.productionId) ?? null)
      const property = resolved.properties.find((p) => p.propertyId === rights.storyPropertyId(film.conceptId))!
      expect(property.creatorStudioId).toBe(h.playerStudioId)
      // One property per founding concept: created at the EARLIEST attested event over every film of
      // that concept (the ledger greenlight row, else the release), never backdated past it.
      const siblings = state.studio.releasedFilms.filter((f) => f.conceptId === film.conceptId)
      const earliest = Math.min(...siblings.map((f) => state.ledger.find((e) => e.kind === 'production' && e.productionId === f.productionId)?.week ?? f.releaseTick))
      expect(property.createdAt).toEqual({ kind: 'campaign', week: earliest })
      expect(property.workLinks).toEqual(siblings.map((f) => f.productionId).sort())
      expect(property.createdAt.kind === 'campaign' && property.createdAt.week <= film.releaseTick).toBe(true)
    }
  })

  it('resolution is a pure read: the state bytes are unchanged and two reads agree', () => {
    const state = liveFromGenuine('week53')
    const before = stableStringify(state)
    const a = rights.resolveTitles(state)
    const b = rights.resolveTitles(state)
    expect(stableStringify(state)).toBe(before)
    expect(stableStringify(a)).toBe(stableStringify(b))
  })
})

describe('P16A holders and as-of reads', () => {
  it('currentHolder resolves the creator for every legacy subject, tradeable, with no estate authority involved', () => {
    const state = liveFromGenuine('week53')
    const h = state.hollywood!
    for (const film of h.films) {
      const holder = rights.currentHolder(state, R2(film.filmId), state.market.tick)
      expect(holder).toEqual({ kind: 'holder', holderId: film.studioId, tradeable: true, archived: false })
      const property = rights.currentHolder(state, R1(rights.storyPropertyId(film.conceptId)), state.market.tick)
      expect(property).toEqual({ kind: 'holder', holderId: film.studioId, tradeable: true, archived: false })
    }
  })

  it('an as-of read before a simulated film existed sees no holder for it, while authored (beforeCampaign) titles are held at week 0', () => {
    const state = liveFromGenuine('week53')
    const h = state.hollywood!
    const first = h.films.filter((f) => f.provenance === 'simulation/v1')
      .map((f) => f.provenance === 'simulation/v1' ? f : null!)
      .sort((a, b) => a.result.releaseTick - b.result.releaseTick)[0]!
    expect(rights.currentHolder(state, R2(first.filmId), first.result.releaseTick - 1)).toEqual({ kind: 'unavailable', reason: 'noTitleAtDate' })
    expect(rights.currentHolder(state, R2(first.filmId), first.result.releaseTick).kind).toBe('holder')
    const authored = h.films.find((f) => f.provenance === 'authored-start/v1')!
    expect(rights.currentHolder(state, R2(authored.filmId), 0).kind).toBe('holder')
    expect(rights.currentHolder(state, R2('no-such-film'), 0)).toEqual({ kind: 'unavailable', reason: 'unknownSubject' })
  })

  it('asOfWeek must be a whole week in [0, market.tick]', () => {
    const state = liveFromGenuine('week53')
    const film = state.hollywood!.films[0]!
    expect(rights.currentHolder(state, R2(film.filmId), state.market.tick + 1)).toEqual({ kind: 'unavailable', reason: 'futureWeek' })
    expect(rights.currentHolder(state, R2(film.filmId), -1)).toEqual({ kind: 'unavailable', reason: 'invalidAsOfWeek' })
    expect(rights.currentHolder(state, R2(film.filmId), 1.5)).toEqual({ kind: 'unavailable', reason: 'invalidAsOfWeek' })
  })

  it('a world without an industry has no rights: every read is unavailable (noIndustry) and nothing is minted', () => {
    const state = liveFromGenuine('week53')
    const bare = { ...state, hollywood: null } as GameState
    expect(rights.currentHolder(bare, R2('prod-0000'), 0)).toEqual({ kind: 'unavailable', reason: 'noIndustry' })
    expect(rights.resolveTitles(bare)).toEqual({ properties: [], filmTitles: [], events: [], unavailable: [] })
  })
})

describe('P16A default R3/R4 authority (A4) and parent-bound branches', () => {
  it('with an empty licence set, R3 continuation authority is the current R1 holder and R4 derives from the relevant R1/R2 holder', () => {
    const state = liveFromGenuine('week53')
    const film = state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
    const propertyId = rights.storyPropertyId(film.conceptId)
    expect(state.rights.licences).toEqual([])
    expect(rights.rightsAuthority(state, R1(propertyId), 'R3', state.market.tick)).toEqual({ kind: 'authority', studioId: film.studioId, via: 'title', licenceId: null })
    expect(rights.rightsAuthority(state, R1(propertyId), 'R4', state.market.tick)).toEqual({ kind: 'authority', studioId: film.studioId, via: 'title', licenceId: null })
    expect(rights.rightsAuthority(state, R2(film.filmId), 'R4', state.market.tick)).toEqual({ kind: 'authority', studioId: film.studioId, via: 'title', licenceId: null })
    // R3 is continuation authority on a PROPERTY; a film subject has none of its own.
    expect(rights.rightsAuthority(state, R2(film.filmId), 'R3', state.market.tick)).toEqual({ kind: 'unavailable', reason: 'r3RequiresProperty' })
  })

  it('a spin-off character or branch has no rights of its own: branch authority resolves to the parent property until an explicit promotion exists', () => {
    const state = liveFromGenuine('week53')
    const film = state.hollywood!.films.find((f) => f.provenance === 'simulation/v1')!
    const parent = rights.storyPropertyId(film.conceptId)
    const branch = rights.branchAuthority(state, { parentPropertyId: parent, branch: 'character:lead' }, state.market.tick)
    // r2 (F34/F55): the studio holding the parent's spin-off authority; unlicensed, the title holder.
    expect(branch).toEqual({ kind: 'authority', studioId: film.studioId, via: 'parent', propertyId: parent, promoted: false, licenceId: null })
    // No promotion primitive mints an independent property in this checkpoint; the branch is not a subject.
    expect(rights.currentHolder(state, R1(`${parent}#character:lead`), state.market.tick)).toEqual({ kind: 'unavailable', reason: 'unknownSubject' })
  })
})

describe('P16A live route: identities of a real player greenlight and release', () => {
  it('the released player film resolves with the player identity as creator, the greenlight week as property creation and the release week as the title date', () => {
    const route = mintRoute()
    const state = route.released
    const h = state.hollywood!
    const film = state.studio.releasedFilms.find((f) => f.productionId === route.productionId)!
    const resolved = rights.resolveTitles(state)
    const title = resolved.filmTitles.find((t) => t.filmId === route.productionId)!
    expect(title.creatorStudioId).toBe(h.playerStudioId)
    expect(title.releasedAt).toEqual({ kind: 'campaign', week: film.releaseTick })
    expect(title.title).toBe(route.start.concepts.find((c) => c.id === route.conceptId)!.title)
    const property = resolved.properties.find((p) => p.propertyId === rights.storyPropertyId(route.conceptId))!
    expect(property.createdAt).toEqual({ kind: 'campaign', week: 0 })
    expect(property.creatorStudioId).toBe(h.playerStudioId)
    expect(property.workLinks).toEqual([route.productionId])
  })
})
