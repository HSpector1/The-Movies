// ── Vignette director — deterministic, cosmetic production moments ─────────────
//
// Turns presentation facts into occasional, authored micro-vignettes: a director
// arrives, a stage is prepped, a take is filmed, the studio reacts to a release.
// It is PURELY cosmetic. It never decides whether a film is good, late, a hit, or
// affordable — eligibility is read from the StudioLotSnapshot the host supplies.
//
// Determinism: selection is seeded by sceneSeed + an event counter, so the ORDER
// of vignettes for a given snapshot+seed is reproducible; timing is driven by
// fixed cooldown/quiet gaps. No Math.random. Actors are drawn from a small pool
// the host owns, so nothing churns and everything cleans up.

import { Rng } from './rng'
import { STAGE_APRONS } from './layout'
import type { StudioLotSnapshot, ProductionCard } from '../snapshot/StudioLotSnapshot'

// ── The rollback plate world's stage vocabulary (C2a-M2, §3.1) ────────────────
//
// `ProductionCard.stageId` became the open `BuildingId` when the world stopped being
// hard-wired to two stages, but THIS renderer is the PLATE origin: its aprons are
// hand-measured against the painted plate, and law 27a forbids authoring plate cells
// for a body the painting does not contain. So the plate composes vignettes for the
// founding stages it genuinely has ground for, and a picture on a stage the studio
// BUILT gets no plate vignette at all — silence, not another stage's apron dressed
// with someone else's picture (law 12). The grid origin is where a built stage is
// drawn; this is recorded rollback-world maintenance, not a gap to fill here.

/** The soundstage bodies this plate world has authored apron ground for. */
const PLATE_APRON_STAGE_IDS = ['stage-a', 'stage-b'] as const

type PlateApronStageId = (typeof PLATE_APRON_STAGE_IDS)[number]

/** A picture whose stage this plate world can actually dress. */
type PlateStageProduction = ProductionCard & { stageId: PlateApronStageId }

function isPlateApronStageProduction(card: ProductionCard): card is PlateStageProduction {
  return (PLATE_APRON_STAGE_IDS as readonly string[]).includes(card.stageId)
}

export type MomentKind =
  | 'production-arrival'
  | 'stage-preparation'
  | 'filming-beat'
  | 'studio-reaction'

export type ReactionTone = 'celebration' | 'publicity' | 'disappointment'

/** Presentation-only character descriptor surfaced on inspection. */
export type Inspect = {
  role: string
  activity: string
  production?: string
  building?: string
  description: string
}

export type ActorOpts = { hidden?: boolean; inspect?: Inspect; faceLeft?: boolean }

/** Everything the director needs from the scene. Implemented with closures. */
export interface VignetteHost {
  getSnapshot(): StudioLotSnapshot
  acquire(): number | null
  release(i: number): void
  setActor(i: number, tex: string, gx: number, gy: number, opts: ActorOpts): void
  emphasizeStage(stageId: 'stage-a' | 'stage-b', on: boolean): void
  takeFlash(gx: number, gy: number): void
  marker(gx: number, gy: number, text: string): void
  clearMarker(): void
  toast(text: string | null): void
  setFilmingHush(on: boolean): void
}

type Keyframe = { t: number; gx: number; gy: number; hidden?: boolean }
type VActor = { tex: string; keys: Keyframe[]; inspect: Inspect; faceLeft?: boolean }
type Cue = { t: number; run: () => void; undo?: () => void }

type Plan = {
  kind: MomentKind
  duration: number
  phases: Record<string, number>
  actors: VActor[]
  cues: Cue[]
  label: string
}

// tuning (seconds)
const QUIET_GAP = 7 // minimum calm between vignettes
const COOLDOWN: Record<MomentKind, number> = {
  'production-arrival': 34,
  'stage-preparation': 26,
  'filming-beat': 20,
  'studio-reaction': 40,
}
const REACT_RECENT_WEEKS = 6

export class VignetteDirector {
  private host: VignetteHost
  private baseSeed: string
  private paused = false
  private quietLeft = 3
  private eventCounter = 0
  private cooldownLeft: Record<MomentKind, number> = {
    'production-arrival': 0,
    'stage-preparation': 0,
    'filming-beat': 0,
    'studio-reaction': 0,
  }

  private active: Plan | null = null
  private elapsed = 0
  private firedCues = new Set<number>()
  private runtime: { actor: VActor; handle: number }[] = []

  constructor(host: VignetteHost, seed: string) {
    this.host = host
    this.baseSeed = seed
  }

  setPaused(p: boolean): void {
    this.paused = p
  }

  onSnapshot(): void {
    // Snapshot changed: cancel any running vignette (its participants may no
    // longer make sense) and reset the quiet gap. Eligibility is re-read live.
    this.cancel()
    this.quietLeft = 2
    this.eventCounter = 0
    for (const k of Object.keys(this.cooldownLeft) as MomentKind[]) this.cooldownLeft[k] = 0
  }

  /** Debug: start a specific vignette now, optionally jumped to a named phase. */
  force(kind: MomentKind, phase?: string): boolean {
    const plan = this.buildPlan(kind, this.eventCounter)
    if (!plan) return false
    this.cancel()
    this.start(plan)
    if (phase && plan.phases[phase] !== undefined) {
      // advance to just past the phase mark so its cues have fired
      this.seekTo(plan.phases[phase] + 0.05)
    }
    return true
  }

  /** Debug: seek the active vignette to an absolute time (for frame sequences). */
  seek(t: number): void {
    this.seekTo(t)
  }

  cancel(): void {
    if (!this.active) return
    // run undos in reverse for anything already applied
    for (let i = this.active.cues.length - 1; i >= 0; i--) {
      if (this.firedCues.has(i) && this.active.cues[i].undo) this.active.cues[i].undo!()
    }
    for (const r of this.runtime) this.host.release(r.handle)
    this.host.clearMarker()
    this.host.setFilmingHush(false)
    this.active = null
    this.runtime = []
    this.firedCues.clear()
    this.elapsed = 0
  }

  destroy(): void {
    this.cancel()
  }

  debug(): {
    active: MomentKind | null
    phase: string
    elapsed: number
    quietLeft: number
    actors: number
    events: number
  } {
    let phase = ''
    if (this.active) {
      for (const [name, t] of Object.entries(this.active.phases)) {
        if (this.elapsed >= t) phase = name
      }
    }
    return {
      active: this.active?.kind ?? null,
      phase,
      elapsed: Math.round(this.elapsed * 10) / 10,
      quietLeft: Math.max(0, Math.round(this.quietLeft * 10) / 10),
      actors: this.runtime.length,
      events: this.eventCounter,
    }
  }

  update(dt: number): void {
    for (const k of Object.keys(this.cooldownLeft) as MomentKind[]) {
      this.cooldownLeft[k] = Math.max(0, this.cooldownLeft[k] - dt)
    }
    if (this.active) {
      this.elapsed += dt
      this.applyActive()
      if (this.elapsed >= this.active.duration) this.end()
      return
    }
    // idle: count down the quiet gap, then try to schedule
    this.quietLeft -= dt
    if (this.paused || this.quietLeft > 0) return
    const plan = this.pickEligible()
    if (plan) this.start(plan)
    else this.quietLeft = 1.5 // nothing eligible; check again shortly
  }

  // ── scheduling ────────────────────────────────────────────────────────────

  private pickEligible(): Plan | null {
    const kinds: MomentKind[] = [
      'production-arrival',
      'stage-preparation',
      'filming-beat',
      'studio-reaction',
    ]
    const rng = new Rng(`${this.baseSeed}:pick:${this.eventCounter}`)
    // deterministic shuffle by seeded sort key, then take first eligible off cooldown
    const order = kinds
      .map((k) => ({ k, r: rng.next() }))
      .sort((a, b) => a.r - b.r)
      .map((o) => o.k)
    for (const k of order) {
      if (this.cooldownLeft[k] > 0) continue
      const plan = this.buildPlan(k, this.eventCounter)
      if (plan) return plan
    }
    return null
  }

  private start(plan: Plan): void {
    this.active = plan
    this.elapsed = 0
    this.firedCues.clear()
    this.runtime = []
    for (const a of plan.actors) {
      const h = this.host.acquire()
      if (h === null) continue
      this.runtime.push({ actor: a, handle: h })
    }
    this.applyActive()
  }

  private end(): void {
    const kind = this.active?.kind
    this.cancel()
    if (kind) this.cooldownLeft[kind] = COOLDOWN[kind]
    this.quietLeft = QUIET_GAP
    this.eventCounter++
    this.host.toast(null)
  }

  private seekTo(t: number): void {
    if (!this.active) return
    this.elapsed = t
    this.applyActive()
  }

  private applyActive(): void {
    const plan = this.active
    if (!plan) return
    // fire cues whose time has passed
    plan.cues.forEach((c, i) => {
      if (!this.firedCues.has(i) && this.elapsed >= c.t) {
        this.firedCues.add(i)
        c.run()
      }
    })
    // move actors along their keyframes
    for (const r of this.runtime) {
      const p = sampleActor(r.actor, this.elapsed)
      this.host.setActor(r.handle, r.actor.tex, p.gx, p.gy, {
        hidden: p.hidden,
        inspect: r.actor.inspect,
        faceLeft: r.actor.faceLeft ?? p.gx < prevGx(r.actor, this.elapsed),
      })
    }
  }

  // ── plan builders ───────────────────────────────────────────────────────────

  private activeStages(snap: StudioLotSnapshot): PlateStageProduction[] {
    return snap.activeProductions.filter((p) => p.active).filter(isPlateApronStageProduction)
  }

  private buildPlan(kind: MomentKind, counter: number): Plan | null {
    const snap = this.host.getSnapshot()
    const rng = new Rng(`${this.baseSeed}:${kind}:${counter}`)
    const busy = snap.standing === 'established' || snap.standing === 'prestige'
    const stages = this.activeStages(snap)

    if (kind === 'production-arrival') {
      if (!busy || stages.length === 0) return null
      const prod = stages[rng.int(0, stages.length - 1)]
      return this.planArrival(prod)
    }
    if (kind === 'stage-preparation') {
      if (stages.length === 0) return null
      const prod = stages[rng.int(0, stages.length - 1)]
      return this.planPrep(prod)
    }
    if (kind === 'filming-beat') {
      if (stages.length === 0) return null
      const prod = stages[rng.int(0, stages.length - 1)]
      return this.planFilming(prod)
    }
    // studio-reaction
    const recent = snap.releasedFilms
      .filter((f) => f.weeksAgo <= REACT_RECENT_WEEKS)
      .sort((a, b) => a.weeksAgo - b.weeksAgo)[0]
    if (!recent) return null
    const tone: ReactionTone =
      recent.reception === 'flop'
        ? 'disappointment'
        : recent.reception === 'smash'
          ? 'celebration'
          : recent.reception === 'hit'
            ? 'publicity'
            : 'celebration'
    return this.planReaction(tone, recent.title)
  }

  private planArrival(prod: PlateStageProduction): Plan {
    const a = STAGE_APRONS[prod.stageId]
    const entry = { gx: a.park.gx + 4, gy: a.park.gy }
    const duration = 14
    return {
      kind: 'production-arrival',
      duration,
      phases: { start: 1, action: 6, complete: 11 },
      label: `A director arrives at ${stageName(prod.stageId)}`,
      actors: [
        {
          tex: 'p-van',
          faceLeft: true,
          keys: [
            { t: 0, gx: entry.gx, gy: entry.gy, hidden: true },
            { t: 0.5, gx: entry.gx, gy: entry.gy },
            { t: 3, gx: a.park.gx, gy: a.park.gy },
            { t: 9.5, gx: a.park.gx, gy: a.park.gy },
            { t: 13, gx: entry.gx, gy: entry.gy },
            { t: 14, gx: entry.gx, gy: entry.gy, hidden: true },
          ],
          inspect: {
            role: 'Studio Driver',
            activity: 'Dropping off for a production',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'A studio car pauses at the stage apron.',
          },
        },
        {
          tex: 'p-director',
          keys: [
            { t: 0, gx: a.park.gx, gy: a.park.gy, hidden: true },
            { t: 3, gx: a.park.gx, gy: a.park.gy, hidden: true },
            { t: 3.4, gx: a.park.gx - 0.3, gy: a.park.gy + 0.2 },
            { t: 9, gx: a.door.gx, gy: a.door.gy + 0.3 },
            { t: 9.6, gx: a.door.gx, gy: a.door.gy, hidden: true },
            { t: 14, gx: a.door.gx, gy: a.door.gy, hidden: true },
          ],
          faceLeft: true,
          inspect: {
            role: 'Director',
            activity: `Heading to ${stageName(prod.stageId)}`,
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Arriving to direct the day’s work.',
          },
        },
        {
          tex: 'p-crew',
          keys: [
            { t: 0, gx: a.crew[1].gx, gy: a.crew[1].gy, hidden: true },
            { t: 3, gx: a.crew[1].gx, gy: a.crew[1].gy },
            { t: 6, gx: a.crew[1].gx - 0.4, gy: a.crew[1].gy + 0.1 },
            { t: 10, gx: a.crew[1].gx, gy: a.crew[1].gy },
            { t: 14, gx: a.crew[1].gx, gy: a.crew[1].gy, hidden: true },
          ],
          inspect: {
            role: 'Production Crew',
            activity: 'Greeting an arrival',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Waiting at the stage door.',
          },
        },
      ],
      cues: [
        { t: 1, run: () => this.host.toast(`A director arrives at ${stageName(prod.stageId)}`) },
        {
          t: 3,
          run: () => this.host.marker(a.door.gx, a.door.gy, stageName(prod.stageId)),
          undo: () => this.host.clearMarker(),
        },
      ],
    }
  }

  private planPrep(prod: PlateStageProduction): Plan {
    const a = STAGE_APRONS[prod.stageId]
    const store = { gx: a.gear.gx + 3.5, gy: a.gear.gy + 1.5 }
    const duration = 12
    return {
      kind: 'stage-preparation',
      duration,
      phases: { start: 1, action: 5, complete: 10 },
      label: `${stageName(prod.stageId)} is being prepared`,
      actors: [
        {
          tex: 'p-grip',
          faceLeft: true,
          keys: [
            { t: 0, gx: store.gx, gy: store.gy, hidden: true },
            { t: 0.5, gx: store.gx, gy: store.gy },
            { t: 5, gx: a.gear.gx + 0.4, gy: a.gear.gy + 0.3 },
            { t: 8.5, gx: a.gear.gx + 0.4, gy: a.gear.gy + 0.3 },
            { t: 11.5, gx: store.gx, gy: store.gy },
            { t: 12, gx: store.gx, gy: store.gy, hidden: true },
          ],
          inspect: {
            role: 'Grip',
            activity: 'Wheeling gear to the stage',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Moving a lighting cart into position.',
          },
        },
        {
          tex: 'p-crew',
          keys: [
            { t: 0, gx: a.crew[0].gx, gy: a.crew[0].gy, hidden: true },
            { t: 2, gx: a.crew[0].gx, gy: a.crew[0].gy },
            { t: 9, gx: a.crew[0].gx, gy: a.crew[0].gy },
            { t: 10.5, gx: a.crew[0].gx + 1, gy: a.crew[0].gy - 0.5 },
            { t: 12, gx: a.crew[0].gx + 1, gy: a.crew[0].gy - 0.5, hidden: true },
          ],
          inspect: {
            role: 'Production Crew',
            activity: 'Setting up the stage',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Prepping for the next take.',
          },
        },
      ],
      cues: [
        { t: 1, run: () => this.host.toast(`${stageName(prod.stageId)} is being prepared`) },
        {
          t: 1,
          run: () => this.host.marker(a.gear.gx, a.gear.gy, stageName(prod.stageId)),
          undo: () => this.host.clearMarker(),
        },
        {
          t: 6,
          run: () => this.host.emphasizeStage(prod.stageId, true),
          undo: () => this.host.emphasizeStage(prod.stageId, false),
        },
      ],
    }
  }

  private planFilming(prod: PlateStageProduction): Plan {
    const a = STAGE_APRONS[prod.stageId]
    const duration = 8
    return {
      kind: 'filming-beat',
      duration,
      phases: { start: 1, action: 3, complete: 6 },
      label: `Filming — ${prod.title}`,
      actors: [
        {
          tex: 'p-office',
          keys: [
            { t: 0, gx: a.door.gx - 0.6, gy: a.door.gy + 0.5, hidden: true },
            { t: 1, gx: a.door.gx - 0.6, gy: a.door.gy + 0.5 },
            { t: 6, gx: a.door.gx - 0.6, gy: a.door.gy + 0.5 },
            { t: 7, gx: a.door.gx - 1.2, gy: a.door.gy + 0.6, hidden: true },
          ],
          inspect: {
            role: 'Crew — Slating',
            activity: 'Marking the take',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Holds the slate before "action".',
          },
        },
        {
          tex: 'p-crew',
          keys: [
            { t: 0, gx: a.crew[2].gx, gy: a.crew[2].gy, hidden: true },
            { t: 1, gx: a.crew[2].gx, gy: a.crew[2].gy },
            { t: 6.5, gx: a.crew[2].gx, gy: a.crew[2].gy },
            { t: 7.5, gx: a.crew[2].gx, gy: a.crew[2].gy, hidden: true },
          ],
          inspect: {
            role: 'Production Crew',
            activity: 'On set during a take',
            production: prod.title,
            building: stageName(prod.stageId),
            description: 'Standing by, quiet on the set.',
          },
        },
      ],
      cues: [
        { t: 1, run: () => this.host.toast(`Filming — ${prod.title}`) },
        {
          t: 1,
          run: () => this.host.marker(a.door.gx, a.door.gy, stageName(prod.stageId)),
          undo: () => this.host.clearMarker(),
        },
        {
          t: 3,
          run: () => {
            this.host.takeFlash(a.door.gx - 0.6, a.door.gy + 0.4)
            this.host.setFilmingHush(true)
            this.host.emphasizeStage(prod.stageId, true)
          },
          undo: () => {
            this.host.setFilmingHush(false)
            this.host.emphasizeStage(prod.stageId, false)
          },
        },
        { t: 6, run: () => this.host.setFilmingHush(false) },
      ],
    }
  }

  private planReaction(tone: ReactionTone, title: string): Plan {
    // gather in front of the theater (celebration/disappointment) or the gate
    // (publicity). Ground points are authored to sit on open paving.
    const spot = tone === 'publicity' ? { gx: 10, gy: 18 } : { gx: 5.2, gy: 16.4 }
    const loc = tone === 'publicity' ? 'Studio Gate' : 'Screening Theater'
    const duration = 12
    const celebratory = tone !== 'disappointment'
    const count = tone === 'disappointment' ? 2 : 3
    const toastText =
      tone === 'celebration'
        ? `“${title}” is a smash!`
        : tone === 'publicity'
          ? `Press gathers for “${title}”`
          : `A quiet reception for “${title}”`

    const actors: VActor[] = []
    const spread = [
      { gx: spot.gx - 0.7, gy: spot.gy },
      { gx: spot.gx + 0.7, gy: spot.gy + 0.3 },
      { gx: spot.gx, gy: spot.gy + 0.8 },
    ]
    for (let i = 0; i < count; i++) {
      const s = spread[i]
      const start = { gx: s.gx + (i - 1) * 1.5, gy: s.gy + 2 }
      actors.push({
        tex: i === 0 && celebratory ? 'p-talent' : 'p-office',
        keys: [
          { t: 0, gx: start.gx, gy: start.gy, hidden: true },
          { t: 1 + i * 0.4, gx: start.gx, gy: start.gy },
          { t: 5, gx: s.gx, gy: s.gy },
          { t: celebratory ? 10 : 8, gx: s.gx, gy: s.gy },
          {
            t: 12,
            gx: celebratory ? s.gx : start.gx,
            gy: celebratory ? s.gy : start.gy,
            hidden: !celebratory,
          },
        ],
        inspect: {
          role: i === 0 && celebratory ? 'Talent' : 'Office Staff',
          activity: celebratory ? 'Celebrating a release' : 'Reacting to a release',
          building: loc,
          description: celebratory
            ? 'Gathered to toast the new picture.'
            : 'A subdued few take in the news.',
        },
      })
    }
    if (tone === 'publicity') {
      actors.push({
        tex: 'p-photog',
        keys: [
          { t: 0, gx: spot.gx + 1.4, gy: spot.gy + 0.6, hidden: true },
          { t: 2, gx: spot.gx + 1.4, gy: spot.gy + 0.6 },
          { t: 10, gx: spot.gx + 1.4, gy: spot.gy + 0.6 },
          { t: 12, gx: spot.gx + 2.2, gy: spot.gy + 0.9, hidden: true },
        ],
        faceLeft: true,
        inspect: {
          role: 'Publicity Photographer',
          activity: 'Photographing the moment',
          building: loc,
          description: 'Getting the shot for the trades.',
        },
      })
    }

    const cues: Cue[] = [
      { t: 1, run: () => this.host.toast(toastText) },
      {
        t: 1,
        run: () => this.host.marker(spot.gx, spot.gy, loc),
        undo: () => this.host.clearMarker(),
      },
    ]
    if (celebratory) {
      cues.push({ t: 5.5, run: () => this.host.takeFlash(spot.gx, spot.gy - 0.5) })
      if (tone === 'publicity') cues.push({ t: 7, run: () => this.host.takeFlash(spot.gx + 0.4, spot.gy) })
    }

    return {
      kind: 'studio-reaction',
      duration,
      phases: { start: 1, action: 5, complete: 10 },
      label: toastText,
      actors,
      cues,
    }
  }
}

// ── keyframe sampling ─────────────────────────────────────────────────────────

function sampleActor(a: VActor, t: number): { gx: number; gy: number; hidden: boolean } {
  const keys = a.keys
  if (t <= keys[0].t) return { gx: keys[0].gx, gy: keys[0].gy, hidden: keys[0].hidden ?? false }
  const last = keys[keys.length - 1]
  if (t >= last.t) return { gx: last.gx, gy: last.gy, hidden: last.hidden ?? false }
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i]
    const k1 = keys[i + 1]
    if (t >= k0.t && t <= k1.t) {
      const span = k1.t - k0.t || 1
      const u = (t - k0.t) / span
      // hidden if either endpoint is hidden (avoids appearing mid-move)
      const hidden = (k0.hidden ?? false) || (k1.hidden ?? false)
      return { gx: k0.gx + (k1.gx - k0.gx) * u, gy: k0.gy + (k1.gy - k0.gy) * u, hidden }
    }
  }
  return { gx: last.gx, gy: last.gy, hidden: last.hidden ?? false }
}

/** grid-x a moment earlier, for facing direction. */
function prevGx(a: VActor, t: number): number {
  return sampleActor(a, Math.max(0, t - 0.2)).gx
}

function stageName(id: PlateApronStageId): string {
  return id === 'stage-a' ? 'Soundstage A' : 'Soundstage B'
}
