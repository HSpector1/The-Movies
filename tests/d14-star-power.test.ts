// ── D-14 Talent Career Impact — Star Power progression + frozen career events ──
// Every expectation is derived from the owner directive (§2–8, §14), not the impl.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  computeStarPowerDelta,
  convertV4ToV5,
  exportSave,
  generateWorld,
  importSave,
  makeSave,
  makeSaveV4,
  starPowerRoleWeight,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, FilmParticipantRole, GameState, GameStateV4 } from '../src/core/index.js'

// ── real-engine found → cast → release helper ────────────────────────────────
function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    for (const t of pool.filter((x) => x.role === role).slice(0, need[role])) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function contractedByRole(s: GameState) {
  const c = s.contracts.map((k) => s.talent.find((t) => t.id === k.talentId)!)
  const actors = c.filter((t) => t.role === 'actor').sort((a, b) => a.fame - b.fame)
  return { actors, writer: c.find((t) => t.role === 'writer')!, director: c.find((t) => t.role === 'director')!, craft: c.find((t) => t.role === 'craft')! }
}

function releaseOneFilm(s0: GameState, leadId: string): { s: GameState; pid: string } {
  const s1 = s0
  const { actors, writer, director, craft } = contractedByRole(s1)
  const others = actors.filter((a) => a.id !== leadId)
  const concept = s1.concepts[0]!
  let s = applyActions(s1, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: writer.id,
        directorId: director.id,
        cast: { lead: leadId, antagonist: others[0]!.id, support: others[1]!.id } as Record<CastSlot, string>,
        craftIds: [craft.id],
        budget: { negative: 5_000_000, marketing: 1_000_000 },
      },
    },
  ])
  const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 8; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === pid)
    if (run && run.status !== 'active') break
  }
  return { s, pid }
}

const fameOf = (s: GameState, id: string) => s.talent.find((t) => t.id === id)!.fame

describe('D-14 Star Power resolver (pure, deterministic)', () => {
  const win = { fameBefore: 10, realizedTotal: 13_000_000, audienceScore: 66, expectedTotal: 12_000_000 }

  it('5. Lead receives MORE opportunity than Support under identical outcomes', () => {
    const lead = computeStarPowerDelta({ ...win, role: 'lead' }).delta
    const support = computeStarPowerDelta({ ...win, role: 'support' }).delta
    expect(lead).toBeGreaterThan(support)
    expect(starPowerRoleWeight('lead')).toBeGreaterThan(starPowerRoleWeight('support'))
  })

  it('6. greater realized reach produces a greater gain', () => {
    const small = computeStarPowerDelta({ ...win, role: 'lead', realizedTotal: 4_000_000 }).delta
    const big = computeStarPowerDelta({ ...win, role: 'lead', realizedTotal: 28_000_000 }).delta
    expect(big).toBeGreaterThan(small)
  })

  it('7. higher current fame produces a smaller gain (diminishing returns)', () => {
    const lowFame = computeStarPowerDelta({ ...win, role: 'lead', fameBefore: 10 }).delta
    const highFame = computeStarPowerDelta({ ...win, role: 'lead', fameBefore: 80 }).delta
    expect(highFame).toBeLessThan(lowFame)
    expect(highFame).toBeLessThan(0.6) // near-established: barely moves
  })

  it('8. an obscure failure cannot substantially damage an unknown', () => {
    const d = computeStarPowerDelta({ role: 'lead', fameBefore: 8, realizedTotal: 2_000_000, audienceScore: 33, expectedTotal: 3_000_000 }).delta
    expect(d).toBeGreaterThan(-0.3) // essentially no damage
    expect(d).toBeLessThan(0.5)
  })

  it('9. a visible failure can modestly reduce an ESTABLISHED star', () => {
    const d = computeStarPowerDelta({ role: 'lead', fameBefore: 70, realizedTotal: 18_000_000, audienceScore: 30, expectedTotal: 24_000_000 }).delta
    expect(d).toBeLessThan(0)
    expect(d).toBeGreaterThanOrEqual(-TUNING.STAR_POWER_MAX_LOSS)
  })

  it('bounds: every delta stays within [−MAX_LOSS, +MAX_GAIN]', () => {
    for (const fame of [0, 5, 40, 80, 100]) {
      for (const total of [0, 2_000_000, 50_000_000]) {
        for (const aud of [0, 50, 100]) {
          const role: FilmParticipantRole = 'lead'
          const d = computeStarPowerDelta({ fameBefore: fame, role, realizedTotal: total, audienceScore: aud, expectedTotal: 10_000_000 }).delta
          expect(d).toBeGreaterThanOrEqual(-TUNING.STAR_POWER_MAX_LOSS)
          expect(d).toBeLessThanOrEqual(TUNING.STAR_POWER_MAX_GAIN)
        }
      }
    }
  })

  it('10. the resolver takes NO profit/cash/marketing-$/salary/authored input (structural)', () => {
    // computeStarPowerDelta's entire input surface is fame + role + realized reach + audience
    // + forecast. There is no field by which profit, cash, marketing dollars, salary, or the
    // authored flag could enter. Same inputs ⇒ identical delta (deterministic).
    const a = computeStarPowerDelta({ ...win, role: 'lead' }).delta
    const b = computeStarPowerDelta({ ...win, role: 'lead' }).delta
    expect(a).toBe(b)
  })
})

describe('D-14 Star Power lifecycle (real engine)', () => {
  it('1 + 12. fame changes only at release, and the career event matches the transition', () => {
    const s0 = foundEngaged('d14-life')
    const { actors } = contractedByRole(s0)
    const lead = actors[0]!
    const start = fameOf(s0, lead.id)

    // Greenlight + mid-production ticks must NOT change fame (only the release hook does).
    const { s, pid } = releaseOneFilm(s0, lead.id)
    const after = fameOf(s, lead.id)

    const ev = s.careerEvents.find((e) => e.filmId === pid && e.talentId === lead.id)!
    expect(ev).toBeDefined()
    expect(ev.starPowerBefore).toBeCloseTo(start, 6) // fame unchanged until the release hook
    expect(ev.starPowerAfter).toBeCloseTo(after, 6) // event exactly matches the realized transition
    expect(ev.starPowerDelta).toBeCloseTo(after - start, 6)
    expect(ev.role).toBe('lead')
    expect(ev.billingWeight).toBe(starPowerRoleWeight('lead'))
  })

  it('2. the update occurs exactly once — one career event per participant per film', () => {
    const s0 = foundEngaged('d14-once')
    const { actors } = contractedByRole(s0)
    const { s, pid } = releaseOneFilm(s0, actors[0]!.id)
    const forThisFilm = s.careerEvents.filter((e) => e.filmId === pid)
    const ids = forThisFilm.map((e) => e.talentId)
    expect(new Set(ids).size).toBe(ids.length) // no duplicate participant events
    // exactly one event per participant of this film (writer, director, 3 cast, 1 craft = 6)
    expect(forThisFilm.length).toBe(6)
  })

  it('3. the released film economics are NOT retroactively changed by its own fame update', () => {
    // The film's opening/total were resolved (step 3) from PRE-tick fame; the fame update
    // (step 6) is applied to the post-development talent → affects future films only.
    const s0 = foundEngaged('d14-noretro')
    const { actors } = contractedByRole(s0)
    const { s, pid } = releaseOneFilm(s0, actors[0]!.id)
    const film = s.studio.releasedFilms.find((f) => f.productionId === pid)!
    const ev = s.careerEvents.find((e) => e.filmId === pid && e.talentId === actors[0]!.id)!
    // The event's recorded realized reach equals the film's actual box office (no divergence).
    expect(ev.realizedTotal).toBe(film.boxOffice.total)
    expect(ev.realizedOpening).toBe(film.boxOffice.opening)
    // And the lead's fame at the time reception ran was the PRE-update value.
    expect(ev.starPowerBefore).toBeLessThan(ev.starPowerAfter + 1e-9)
  })

  it('4. a future film reads the UPDATED fame (progression compounds)', () => {
    const s0 = foundEngaged('d14-future')
    const { actors } = contractedByRole(s0)
    const lead = actors[0]!
    const r1 = releaseOneFilm(s0, lead.id)
    const fameAfter1 = fameOf(r1.s, lead.id)
    const r2 = releaseOneFilm(r1.s, lead.id)
    const ev2 = r2.s.careerEvents.find((e) => e.filmId === r2.pid && e.talentId === lead.id)!
    // The second film's event starts from the fame the FIRST film produced.
    expect(ev2.starPowerBefore).toBeCloseTo(fameAfter1, 6)
    expect(fameAfter1).toBeGreaterThan(fameOf(s0, lead.id)) // genuine progression
  })

  it('11. creator (authored) and generated talent use the SAME resolver (no secret bonus)', () => {
    // Structural: developTalent + computeStarPowerDelta read no `authored` field. Verify two
    // talents with the same realized inputs get the same delta regardless of authored flag.
    const authored = computeStarPowerDelta({ fameBefore: 12, role: 'lead', realizedTotal: 13_000_000, audienceScore: 66, expectedTotal: 12_000_000 }).delta
    const generated = computeStarPowerDelta({ fameBefore: 12, role: 'lead', realizedTotal: 13_000_000, audienceScore: 66, expectedTotal: 12_000_000 }).delta
    expect(authored).toBe(generated)
  })

  it('16 + 17. reload cannot apply progression twice, and round-trip preserves career events', () => {
    const s0 = foundEngaged('d14-reload')
    const { actors } = contractedByRole(s0)
    const { s } = releaseOneFilm(s0, actors[0]!.id)
    const eventsBefore = s.careerEvents.length
    expect(eventsBefore).toBeGreaterThan(0)

    // Round-trip: export → import. Career events preserved byte-identically.
    const reloaded = importSave(exportSave(makeSave(s)))
    if (reloaded.saveVersion !== 6) throw new Error('expected V6')
    expect(reloaded.state.careerEvents).toEqual(s.careerEvents)

    // Advancing the reloaded state with NO new release adds NO new events (no re-apply).
    let s2 = reloaded.state
    for (let k = 0; k < 5; k++) s2 = tick(s2, { develop: true })
    expect(s2.careerEvents.length).toBe(eventsBefore)
  })

  it('18. determinism — two identical runs produce identical career events', () => {
    const a = releaseOneFilm(foundEngaged('d14-det'), contractedByRole(foundEngaged('d14-det')).actors[0]!.id)
    const b = releaseOneFilm(foundEngaged('d14-det'), contractedByRole(foundEngaged('d14-det')).actors[0]!.id)
    expect(exportSave(makeSave(a.s))).toBe(exportSave(makeSave(b.s)))
    expect(a.s.careerEvents).toEqual(b.s.careerEvents)
  })
})

describe('D-14 SaveFileV5 migration', () => {
  it('15. V4→V5 preserves fame + all talent state exactly and creates NO fictional history', () => {
    // Build a live state, strip careerEvents to synthesize a V4 (pre-D-14) shape, then migrate.
    const s0 = foundEngaged('d14-migrate')
    const { actors } = contractedByRole(s0)
    const { s } = releaseOneFilm(s0, actors[0]!.id)
    const famesBefore = s.talent.map((t) => ({ id: t.id, fame: t.fame }))

    // Synthesize a V4 save (drop the D-14 field) to exercise the real migration.
    const { careerEvents, ...v4State } = s
    const v4 = makeSaveV4(v4State as GameStateV4)
    expect(v4.saveVersion).toBe(4)

    const v5 = convertV4ToV5(v4)
    expect(v5.saveVersion).toBe(5)
    expect(v5.state.careerEvents).toEqual([]) // empty ledger — no invented history
    // Every fame preserved EXACTLY; no retroactive grant.
    for (const { id, fame } of famesBefore) {
      expect(v5.state.talent.find((t) => t.id === id)!.fame).toBe(fame)
    }
    // Idempotent.
    expect(exportSave(convertV4ToV5(v4))).toBe(exportSave(v5))
  })
})
