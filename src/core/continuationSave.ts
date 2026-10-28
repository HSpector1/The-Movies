// ── P17 save step — the `franchises` and `cameos` roots ─────────────────────────
//
// Rev02 §10 save law: the next governed version after the accepted predecessor (P16's Save49), forward-only and
// root-additive; migration infers no franchise, edge or meter from old films; downgrade refuses recorded authority the
// target cannot retain. The root is absent until its first property exists and never empties again, so absence is the
// one encoding of "no franchise": migration writes nothing but the version, and a downgrade is lossless exactly while
// the root is absent. Era-neutral step names; the version pair lives in save.ts (P17_SAVE_VERSION, P17_PREDECESSOR_SAVE_VERSION),
// beside the other step constants, so no import cycle reads it before initialization.
// The Shape A `cameos` root (cameo.ts) joins the same step under the same law: additive, absent until its first
// booking and never emptied, so a Save49 world migrates by version alone and no new save version is needed.

import { validateCameoRoot } from './cameo.js'
import { validateFranchiseRoot, type P17ValidationContext } from './continuationValidate.js'
import { persistedProductionIds } from './productionIdentity.js'
import { resolveTitles } from './rights.js'
import type { CameoRoot, FilmParticipants, FranchiseRoot, GameState } from './types.js'

export const P17_ROOT_KEYS = ['franchises', 'cameos'] as const

/** The state without the step's root, every other key kept in its order. */
export function stripP17Roots(raw: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(raw).filter(([key]) => !(P17_ROOT_KEYS as readonly string[]).includes(key)))
}

/** Recorded P17 authority refuses a downgrade, by name. */
export function p17DowngradeRefusal(state: Record<string, unknown>): string | null {
  const franchises = state.franchises as FranchiseRoot | undefined
  const cameos = state.cameos as CameoRoot | undefined
  const recorded = [
    ...(franchises === undefined ? [] : [`${franchises.properties.length} recorded franchise root(s)`]),
    ...(cameos === undefined ? [] : [`${cameos.bookings.length} recorded cameo booking(s)`]),
  ]
  return recorded.length === 0 ? null : `cannot downgrade or discard ${recorded.join(' and ')}`
}

/** Each root, when present, leaf-exact and exact-joined to the productions, films, people, ledger and P16 work links the
 * (already validated) rest of the state persists. `careerEventLeaf` is save.ts's frozen V8 career-event leaf. */
export function validateP17Roots(raw: Record<string, unknown>, label: string, careerEventLeaf: (value: unknown, label: string) => void): void {
  if (Object.hasOwn(raw, 'cameos')) validateP17Cameos(raw, label, careerEventLeaf)
  if (!Object.hasOwn(raw, 'franchises')) return
  const rest = stripP17Roots(raw) as unknown as GameState
  const hollywood = rest.hollywood ?? null
  if (hollywood === null) throw new Error(`${label}: a franchise root needs the living industry whose P16 rights it was greenlit under`)
  const releaseWeeks = new Map<string, number>()
  const participants = new Map<string, FilmParticipants>()
  for (const f of rest.studio.releasedFilms) {
    releaseWeeks.set(f.productionId, f.releaseTick)
    if (f.participants) participants.set(f.productionId, f.participants)
  }
  for (const p of rest.studio.activeProductions) if (p.participants) participants.set(p.id, p.participants)
  for (const f of hollywood.films) {
    if (f.provenance !== 'simulation/v1') continue
    releaseWeeks.set(f.filmId, f.result.releaseTick)
    if (f.result.participants) participants.set(f.filmId, f.result.participants)
  }
  for (const b of hollywood.businesses) for (const p of b.productions) if (p.participants) participants.set(p.id, p.participants)
  const works = new Map(resolveTitles(rest).properties.map((p) => [p.propertyId, new Set(p.workLinks)]))
  const ctx: P17ValidationContext = {
    productionIds: persistedProductionIds(rest),
    week: rest.market.tick,
    playerStudioId: hollywood.playerStudioId,
    releaseWeekOf: (id) => releaseWeeks.get(id),
    participantsOf: (id) => participants.get(id),
    worksOf: (id) => works.get(id) ?? new Set(),
  }
  validateFranchiseRoot(raw.franchises, `${label}.franchises`, ctx)
}

function validateP17Cameos(raw: Record<string, unknown>, label: string, careerEventLeaf: (value: unknown, label: string) => void): void {
  const rest = stripP17Roots(raw) as unknown as GameState
  const hollywood = rest.hollywood ?? null
  if (hollywood === null) throw new Error(`${label}: a cameo root needs the living industry whose employment law its bookings read`)
  const releaseWeeks = new Map(rest.studio.releasedFilms.map((f) => [f.productionId, f.releaseTick]))
  const participants = new Map<string, FilmParticipants>()
  for (const f of rest.studio.releasedFilms) if (f.participants) participants.set(f.productionId, f.participants)
  for (const p of rest.studio.activeProductions) if (p.participants) participants.set(p.id, p.participants)
  validateCameoRoot(raw.cameos, `${label}.cameos`, {
    talentIds: new Set(rest.talent.map((t) => t.id)),
    productionIds: persistedProductionIds(rest),
    week: rest.market.tick,
    playerStudioId: hollywood.playerStudioId,
    engaged: rest.economyEngagedEver,
    activeStartTick: new Map(rest.studio.activeProductions.map((p) => [p.id, p.startTick])),
    releaseWeekOf: (id) => releaseWeeks.get(id),
    participantsOf: (id) => participants.get(id),
    careerCreditedFilmIds: new Set(rest.careerEvents.map((e) => e.filmId)),
    ledger: rest.ledger,
    careerEventLeaf,
  })
}
