import { developTalent, type DevelopmentContext } from './development.js'
import { stream } from './rng.js'
import { clamp } from './math.js'
import { buildCameoCareerEvent, buildTalentCareerEvent, computeStarPowerDelta, flattenParticipants, roleDiscipline } from './starPower.js'
import { TUNING } from './tuning.js'
import type { CameoCareerEvent, FilmResult, Talent, TalentCareerEvent, Discipline } from './types.js'
export type ReleaseGrowthRecord = {
  filmResult: FilmResult
  develop: {productionId:string; performers:{talentId:string;discipline:Discipline}[];ctx:DevelopmentContext}
  broadcast: {weightedAudienceScore:number}
  // P17 Shape A (cameo contract §3): the picture's COMPLETED guests. Each earns, through this same step, one pass of
  // the ordinary fame law at the cameo visibility weight and ONE permanent `cameo` record; no development, no second
  // award, no work-history counter. Returned separately and stored on its booking. Absent ⇒ the predecessor path.
  cameoGuests?: readonly {talentId:string}[]
}
/** Same growth/credit producer for every owner. Caller supplies canonical film-ID order. */
export function applyReleaseCareers(seed:string, source:Talent[], records:readonly ReleaseGrowthRecord[]):
  {talent:Talent[];careerEvents:TalentCareerEvent[];cameoCareerEvents:CameoCareerEvent[]} {
  let talent=source
  const newCareerEvents:TalentCareerEvent[]=[]
  const cameoCareerEvents:CameoCareerEvent[]=[]
    // Index into the current talent list for O(1) resolution as it evolves.
    const byId = new Map<string, Talent>()
    for (const t of talent) byId.set(t.id, t)

    for (const rec of records) {
      // D-14: snapshot each participant's PRE-development state for the frozen career
      // event's before→after (engaged films only; participants captured at greenlight).
      const parts = rec.filmResult.participants
      const beforeById = new Map<string, Talent>()
      if (parts !== undefined) {
        for (const p of flattenParticipants(parts)) {
          const cur = byId.get(p.talentId)
          if (cur !== undefined) beforeById.set(p.talentId, cur)
        }
      }

      // 1. DEVELOPMENT (D-9.8) — UNCHANGED. Craft grows in the performed discipline.
      for (const performer of rec.develop.performers) {
        const current = byId.get(performer.talentId)
        if (current === undefined) continue // craft with no hire etc. — nothing to develop
        const devStream = stream(seed, 'develop', `${rec.develop.productionId}:${performer.talentId}`)
        const developed = developTalent(current, performer.discipline, rec.develop.ctx, devStream)
        byId.set(performer.talentId, developed)
      }

      // 2. D-14 STAR POWER (fame) — engaged-only (requires frozen participants), so M0A
      //    is untouched. DETERMINISTIC (no RNG): the delta comes only from realized reach,
      //    role, audience response, forecast comparison, and current fame. Applied to the
      //    POST-development talent → affects FUTURE films only; the just-resolved film's
      //    economics (opening/legs/total, computed in step 3 from pre-tick fame) are
      //    untouched. One frozen TalentCareerEvent per participant.
      if (parts !== undefined) {
        const concept = rec.develop.ctx.concept
        for (const p of flattenParticipants(parts)) {
          const before = beforeById.get(p.talentId)
          const developed = byId.get(p.talentId)
          if (before === undefined || developed === undefined) continue
          const sp = computeStarPowerDelta({
            fameBefore: developed.fame,
            role: p.role,
            realizedTotal: rec.filmResult.boxOffice.total,
            audienceScore: rec.broadcast.weightedAudienceScore,
            expectedTotal: rec.filmResult.forecast ? rec.filmResult.forecast.expectedTotal : null,
          })
          const withFame: Talent = { ...developed, fame: clamp(developed.fame + sp.delta, 0, 100) }
          byId.set(p.talentId, withFame)
          newCareerEvents.push(
            buildTalentCareerEvent({
              talentBefore: before,
              talentAfter: withFame,
              role: p.role,
              discipline: roleDiscipline(p.role),
              filmId: rec.develop.productionId,
              filmTitle: concept.title,
              releaseWeek: rec.filmResult.releaseTick,
              genre: concept.genre,
              realizedOpening: rec.filmResult.boxOffice.opening,
              realizedTotal: rec.filmResult.boxOffice.total,
              audienceScore: rec.broadcast.weightedAudienceScore,
              criticScore: rec.filmResult.criticScore,
              sp,
            }),
          )
        }
        // 3. P17 cameo release credit, after the principals and on the post-development talent, in committed order:
        //    the same deterministic law at the cameo visibility weight, one record each. Engaged-only like step 2.
        for (const guest of rec.cameoGuests ?? []) {
          const current = byId.get(guest.talentId)
          if (current === undefined) throw new Error(`release careers: completed cameo guest "${guest.talentId}" is not a known person`)
          const sp = computeStarPowerDelta({
            fameBefore: current.fame,
            role: 'support',
            roleWeight: TUNING.P17_CAMEO_VISIBILITY_WEIGHT,
            realizedTotal: rec.filmResult.boxOffice.total,
            audienceScore: rec.broadcast.weightedAudienceScore,
            expectedTotal: rec.filmResult.forecast ? rec.filmResult.forecast.expectedTotal : null,
          })
          const withFame: Talent = { ...current, fame: clamp(current.fame + sp.delta, 0, 100) }
          byId.set(guest.talentId, withFame)
          cameoCareerEvents.push(buildCameoCareerEvent({
            talentBefore: current,
            talentAfter: withFame,
            filmId: rec.develop.productionId,
            filmTitle: concept.title,
            releaseWeek: rec.filmResult.releaseTick,
            genre: concept.genre,
            realizedOpening: rec.filmResult.boxOffice.opening,
            realizedTotal: rec.filmResult.boxOffice.total,
            audienceScore: rec.broadcast.weightedAudienceScore,
            criticScore: rec.filmResult.criticScore,
            sp,
          }))
        }
      }
    }

    // Rebuild the array in the ORIGINAL talent order (stable serialization),
    // substituting developed objects; untouched talent shared by reference.
    talent = talent.map((t) => byId.get(t.id) ?? t)
  return {talent,careerEvents:newCareerEvents,cameoCareerEvents}
}
