// ── D-17B · AWARENESS COUNTER-FLOW SHIM ──────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// WHAT THIS IS. R9 authorizes a weekly awareness counter-flow as a candidate repair for the
// one-way ratchet A1/A4 measured (1472/1472 non-zero 4-week awareness steps NEGATIVE for P3;
// 68/100 P3 runs absorbed at the 0 floor). This module is the LAB's model of that flow: a pure
// function applied to the POST-tick awareness stock, inside the D-16 driver, touching nothing
// else. It is NOT a production change and nothing here is authorized to ship.
//
// WHERE IT RUNS (A4 §1.1, exact): `driver.ts`, after `tick(...)`, after the release backfill,
// BEFORE the reconciliation assert and BEFORE slice capture. After the tick so the shim sees
// the engine's own step-4 `updateStanding`; after the backfill because that block is where the
// driver knows a film released this week and still holds `preTick`; before the assert so an
// (illegal) cash touch is caught in the same iteration; before slice capture so
// `SliceRecord.audienceAwareness` records the post-shim stock rather than lying.
//
// WHAT IT TOUCHES. `state.studio.standing.audienceAwareness` and NOTHING else, via a spread
// copy. No cash, no ledger, no `rngState` — the reconciliation invariant is untouched by
// construction.
//
// THE NEUTRAL-ARM RULE (A4 §1.5). With `family: 'off'` (or no config at all) `applyCounterFlow`
// returns the SAME OBJECT it was handed — object identity, not a value-equal copy — so the
// neutral corpus is byte-identical to `d17a-final`. Any field this module causes to be emitted
// must be ABSENT (never `null`) when the shim is off.
//
// DETERMINISM. A–F are pure: no clock, no stream. If a family declares `noiseSigma` the draw
// comes from a PRIVATE keyed stream `RngStream.fromSeed(seed::d17b-counterflow-v1::week)` —
// never `state.rngState` (the sim stream, consumed by the critic gaussian) and never
// `stream(seed, purpose, key)` (whose `RngPurpose` union is a production type).
//
// AUTHORIZATION (D-17B Phase-A gate ruling 2). Every config declares whether it is an
// implementation-eligible CANDIDATE or a labelled REFERENCE arm. The taxonomy is a REPORTING
// distinction, but the label is enforced here so no artifact can present a reference arm as
// something the game could ship: two-sided mean reversion with a free pull-up (C without
// `revertMode: 'pullDownOnly'`), loss-leg damping (D) and the endogenous EMA pivot (F) THROW
// when declared `candidate`.

import { RngStream, TUNING } from '../../core/index.js'
import type { GameState } from '../../core/index.js'

export type CounterFlowFamily = 'off' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

/**
 * `candidate` — inside the authorized lever family (R9 decay + `AWARENESS_REACH_NEUTRAL` +
 * paid publicity); may be proposed for implementation.
 * `reference` — a LABELLED reference arm run for honest §27 reporting only. Never
 * implementable without an Owner extension.
 */
export type CounterFlowAuthorization = 'candidate' | 'reference'

/** Family C only: whether the pull-UP leg (A < baseline) is active. */
export type RevertMode = 'twoSided' | 'pullDownOnly'

export type CounterFlowConfig = {
  family: CounterFlowFamily
  /** REQUIRED. Gate ruling 2 — flows into the artifact tag; see the module header. */
  authorization: CounterFlowAuthorization
  /** hard lower bound the flow will not push below (default 0). */
  floor?: number
  /** hard upper bound (default 100 — the engine clamp, `standing.ts:139`). */
  ceiling?: number
  // ── A linear ──
  pointsPerWeek?: number
  // ── B proportional ──
  rho?: number
  // ── C mean-reverting ──
  kappa?: number
  baseline?: number
  /** default `twoSided` (the REFERENCE form). `pullDownOnly` is the authorized one-sided form. */
  revertMode?: RevertMode
  // ── D asymmetric ──
  gainKeep?: number
  lossKeep?: number
  idleDrain?: number
  // ── E event-responsive ──
  idleRate?: number
  tauWeeks?: number
  releaseGraceWeeks?: number
  // ── F endogenous pivot ──
  pivotHalfLifeReleases?: number
  pivotInit?: number
  /** optional stochastic variant — ABSENT ⇒ fully deterministic (the default everywhere). */
  noiseSigma?: number
}

/** The disabled shim. `applyCounterFlow` is an object-identity pass-through under it. */
export const COUNTER_FLOW_OFF: CounterFlowConfig = { family: 'off', authorization: 'candidate' }

/** Per-run memo. Lives in the driver closure — NEVER on `GameState`, never serialized. */
export type CounterFlowMemo = {
  /** family F: the studio's own EMA of recent reach, in reach space. */
  pivotEma: number
  /** absolute engine tick of the most recent release (the run's start until one happens). */
  lastReleaseWeek: number
  /** releases observed by the shim (family F's EMA sample count). */
  releases: number
  /** weeks in which the shim actually moved the stock. */
  appliedWeeks: number
  /** Σ (post-shim − post-tick) awareness — the net flow the arm injected. */
  netFlow: number
}

/** One release, as the shim sees it (post-tick, all player-observable). */
export type CounterFlowRelease = {
  productionId: string
  /** `clamp(total / max(bMV,1) / AWARENESS_REACH_SCALE, 0, 1)` — the engine's own reach. */
  reach: number
  /** `clamp(mean(cast fames)/100, 0, 1)` — the engine's own star attention. */
  starAttention: number
}

/** Everything a family may read. Pure inputs; the shim never reaches into the state itself. */
export type CounterFlowCtx = {
  seed: string
  /** absolute engine tick AFTER the advance (i.e. `state.market.tick`). */
  week: number
  /** awareness BEFORE the tick (start-of-tick standing — what `updateStanding` folded from). */
  aPre: number
  /** awareness AFTER the tick (what the engine produced). */
  aPost: number
  /** releases resolved by THIS tick, in the engine's ascending-id order. Empty ⇒ idle week. */
  releases: readonly CounterFlowRelease[]
  /** weeks since the run's most recent release (0 in a week that released). Family E reads it. */
  weeksSinceRelease: number
}

/** What the shim did in one week — logged per run, never per week in an artifact. */
export type CounterFlowPoint = {
  week: number
  aPre: number
  aPost: number
  aShimmed: number
  releases: number
}

const clamp = (x: number, lo: number, hi: number): number => (x < lo ? lo : x > hi ? hi : x)

/** The private keyed stream. NEVER `state.rngState`; never a `RngPurpose` member. */
export function counterFlowStream(seed: string, week: number): RngStream {
  return RngStream.fromSeed(`${seed}::d17b-counterflow-v1::${String(week)}`)
}

export function newCounterFlowMemo(startWeek: number, cfg: CounterFlowConfig): CounterFlowMemo {
  return {
    pivotEma: cfg.pivotInit ?? TUNING.AWARENESS_REACH_NEUTRAL,
    lastReleaseWeek: startWeek,
    releases: 0,
    appliedWeeks: 0,
    netFlow: 0,
  }
}

// ── validation ───────────────────────────────────────────────────────────────

/** Which families may be declared `candidate`, and why not (gate ruling 2). */
const REFERENCE_ONLY: Record<string, string> = {
  C: 'two-sided mean reversion has a FREE PULL-UP leg (awareness rises with no film and no spend), which is outside the R9 lever family — D-17B Phase-A gate ruling 2 runs it as a LABELLED REFERENCE ARM only. The authorized one-sided form is `revertMode: "pullDownOnly"`.',
  D: 'loss-leg damping (`lossKeep < 1`) rewrites the engine\'s own per-release delta, which R9 does not authorize — D-17B Phase-A gate ruling 2 runs family D as a LABELLED REFERENCE ARM only.',
  F: 'the endogenous EMA pivot replaces AWARENESS_REACH_NEUTRAL with a self-referential bar (a treadmill; A4 §1.3 names the risk) — D-17B Phase-A gate ruling 2 runs family F as a LABELLED REFERENCE ARM only.',
}

/**
 * Reject a configuration that could not mean what it says. Throws loudly, naming the ruling.
 * Called by `applyCounterFlow`'s first use and by every CLI entry point.
 */
export function validateCounterFlow(cfg: CounterFlowConfig): void {
  const problems: string[] = []
  if (cfg.authorization !== 'candidate' && cfg.authorization !== 'reference') {
    problems.push(`authorization must be "candidate" or "reference", got ${String(cfg.authorization)}`)
  }
  const floor = cfg.floor ?? 0
  const ceiling = cfg.ceiling ?? 100
  if (!(floor >= 0 && floor <= 100)) problems.push(`floor ${String(floor)} is outside [0,100]`)
  if (!(ceiling >= 0 && ceiling <= 100)) problems.push(`ceiling ${String(ceiling)} is outside [0,100]`)
  if (floor > ceiling) problems.push(`floor ${String(floor)} > ceiling ${String(ceiling)}`)
  if (cfg.noiseSigma !== undefined && !(cfg.noiseSigma >= 0)) {
    problems.push(`noiseSigma ${String(cfg.noiseSigma)} must be >= 0`)
  }
  switch (cfg.family) {
    case 'off':
      break
    case 'A':
      if (!((cfg.pointsPerWeek ?? 0) >= 0)) problems.push('family A needs pointsPerWeek >= 0')
      break
    case 'B':
      if (!((cfg.rho ?? 0) >= 0 && (cfg.rho ?? 0) <= 1)) problems.push('family B needs rho in [0,1]')
      break
    case 'C':
      if (!((cfg.kappa ?? 0) >= 0 && (cfg.kappa ?? 0) <= 1)) problems.push('family C needs kappa in [0,1]')
      if (!((cfg.baseline ?? 0) >= 0 && (cfg.baseline ?? 0) <= 100)) problems.push('family C needs baseline in [0,100]')
      break
    case 'D':
      if (!((cfg.gainKeep ?? 1) >= 0)) problems.push('family D needs gainKeep >= 0')
      if (!((cfg.lossKeep ?? 1) >= 0)) problems.push('family D needs lossKeep >= 0')
      if (!((cfg.idleDrain ?? 0) >= 0)) problems.push('family D needs idleDrain >= 0')
      break
    case 'E':
      if (!((cfg.idleRate ?? 0) >= 0)) problems.push('family E needs idleRate >= 0')
      if (!((cfg.tauWeeks ?? 1) > 0)) problems.push('family E needs tauWeeks > 0')
      if (!((cfg.releaseGraceWeeks ?? 0) >= 0)) problems.push('family E needs releaseGraceWeeks >= 0')
      break
    case 'F':
      if (!((cfg.pivotHalfLifeReleases ?? 1) > 0)) problems.push('family F needs pivotHalfLifeReleases > 0')
      if (cfg.pivotInit !== undefined && !(cfg.pivotInit >= 0 && cfg.pivotInit <= 1)) {
        problems.push('family F needs pivotInit in [0,1] (it is a REACH, not an awareness)')
      }
      break
    default: {
      const never: never = cfg.family
      problems.push(`unknown family ${String(never)}`)
    }
  }
  // The authorization gate. A one-sided C is authorized; a two-sided C is not.
  if (cfg.authorization === 'candidate') {
    const twoSidedC = cfg.family === 'C' && (cfg.revertMode ?? 'twoSided') === 'twoSided'
    const barred = cfg.family === 'D' || cfg.family === 'F' || twoSidedC
    if (barred) {
      throw new Error(
        `d17b/counterflow: family ${cfg.family} may not be declared "candidate" — ${REFERENCE_ONLY[cfg.family]!} Declare authorization: "reference".`,
      )
    }
  }
  if (problems.length > 0) {
    throw new Error(`d17b/counterflow: rejected config — ${problems.join(' | ')}`)
  }
}

// ── the six families (A4 §1.3) ───────────────────────────────────────────────
//
// | Fam | Rule                                                        | Fixed point |
// |-----|-------------------------------------------------------------|-------------|
// | A   | max(F, aPost − d)                                           | none (→ F)  |
// | B   | aPost · (1 − ρ)                                             | 0           |
// | C   | aPost + κ·(A* − aPost)  [pullDownOnly: only when aPost > A*] | A*          |
// | D   | aPre + (Δ≥0 ? g·Δ : l·Δ) − d_idle,  Δ = aPost − aPre         | g/l ratio   |
// | E   | max(F, aPost − d₀·min(1, wsr/τ)), 0 inside the grace window | none        |
// | F   | re-fold the tick's release deltas against the studio's OWN   | reach-space |
// |     | EMA of recent reach instead of AWARENESS_REACH_NEUTRAL       | reversion   |

/**
 * The pure family kernel. Takes the memo READ-ONLY (family F's EMA update is a separate,
 * explicit step in `applyCounterFlow`) so this function can be property-tested for purity.
 */
export function counterFlowValue(cfg: CounterFlowConfig, ctx: CounterFlowCtx, memo: CounterFlowMemo): number {
  const floor = cfg.floor ?? 0
  const ceiling = cfg.ceiling ?? 100
  const { aPre, aPost } = ctx
  let out: number
  switch (cfg.family) {
    case 'off':
      return aPost
    case 'A':
      out = Math.max(floor, aPost - (cfg.pointsPerWeek ?? 0))
      break
    case 'B':
      out = Math.max(floor, aPost * (1 - (cfg.rho ?? 0)))
      break
    case 'C': {
      const kappa = cfg.kappa ?? 0
      const baseline = cfg.baseline ?? 0
      const pullDownOnly = (cfg.revertMode ?? 'twoSided') === 'pullDownOnly'
      out = pullDownOnly && aPost <= baseline ? aPost : aPost + kappa * (baseline - aPost)
      break
    }
    case 'D': {
      const delta = aPost - aPre
      const kept = delta >= 0 ? (cfg.gainKeep ?? 1) * delta : (cfg.lossKeep ?? 1) * delta
      out = Math.max(floor, aPre + kept - (cfg.idleDrain ?? 0))
      break
    }
    case 'E': {
      const grace = cfg.releaseGraceWeeks ?? 0
      const wsr = Math.max(0, ctx.weeksSinceRelease)
      const rate = wsr < grace ? 0 : (cfg.idleRate ?? 0) * Math.min(1, wsr / (cfg.tauWeeks ?? 1))
      out = Math.max(floor, aPost - rate)
      break
    }
    case 'F': {
      // No release ⇒ the engine did not move awareness ⇒ the alternative pivot has nothing to
      // re-price. IDENTITY, by construction.
      if (ctx.releases.length === 0) return aPost
      // Re-fold the SAME sequence of per-release deltas the engine folded (standing.ts:100-111,
      // clamped per channel per film, in ascending-id order), with the fixed
      // AWARENESS_REACH_NEUTRAL pivot replaced by the studio's own reach EMA. Starting from
      // `aPre` and re-applying reproduces the engine's own sequential clamping exactly.
      let a = aPre
      for (const r of ctx.releases) {
        const altDelta = clamp(
          TUNING.AWARENESS_REACH_WEIGHT * (r.reach - memo.pivotEma) +
            TUNING.AWARENESS_STAR_WEIGHT * r.starAttention,
          -TUNING.AWARENESS_DELTA_CAP,
          TUNING.AWARENESS_DELTA_CAP,
        )
        a = clamp(a + altDelta, 0, 100)
      }
      out = a
      break
    }
    default: {
      const never: never = cfg.family
      throw new Error(`d17b/counterflow: unknown family ${String(never)}`)
    }
  }
  if (cfg.noiseSigma !== undefined && cfg.noiseSigma > 0) {
    out += counterFlowStream(ctx.seed, ctx.week).gaussian(0, cfg.noiseSigma)
  }
  return clamp(clamp(out, floor, ceiling), 0, 100)
}

/**
 * THE SHIM. Rewrites ONLY `studio.standing.audienceAwareness`, returns the new state, the
 * advanced memo and the week's log point.
 *
 * OFF ⇒ the SAME state object, the SAME memo object, and `point: null`. That object identity
 * is the neutral-arm invariant's implementation obligation (A4 §1.5 rule 2).
 */
export function applyCounterFlow(
  state: GameState,
  memo: CounterFlowMemo,
  cfg: CounterFlowConfig,
  ctx: CounterFlowCtx,
): { state: GameState; memo: CounterFlowMemo; point: CounterFlowPoint | null } {
  if (cfg.family === 'off') return { state, memo, point: null }

  const aNew = counterFlowValue(cfg, ctx, memo)

  // Family F's EMA is advanced AFTER the delta is priced, so a release is judged against the
  // studio's PAST reach, not against a bar that already contains today's film.
  let next = memo
  if (ctx.releases.length > 0) {
    const alpha = 1 - Math.pow(0.5, 1 / (cfg.pivotHalfLifeReleases ?? 1))
    let ema = memo.pivotEma
    for (const r of ctx.releases) ema += alpha * (r.reach - ema)
    next = {
      ...memo,
      pivotEma: ema,
      lastReleaseWeek: ctx.week,
      releases: memo.releases + ctx.releases.length,
    }
  }
  const moved = aNew !== ctx.aPost
  next = {
    ...next,
    appliedWeeks: next.appliedWeeks + (moved ? 1 : 0),
    netFlow: next.netFlow + (aNew - ctx.aPost),
  }

  const point: CounterFlowPoint = {
    week: ctx.week,
    aPre: ctx.aPre,
    aPost: ctx.aPost,
    aShimmed: aNew,
    releases: ctx.releases.length,
  }
  if (!moved) return { state, memo: next, point }
  return {
    state: {
      ...state,
      studio: {
        ...state.studio,
        standing: { ...state.studio.standing, audienceAwareness: aNew },
      },
    },
    memo: next,
    point,
  }
}

/**
 * The artifact stamp (Lesson BH). `undefined` when the shim is off, so the field is ABSENT —
 * never `null` — in the neutral arm.
 */
export function counterFlowKey(cfg: CounterFlowConfig | undefined): string | undefined {
  if (cfg === undefined || cfg.family === 'off') return undefined
  const parts: string[] = [`auth=${cfg.authorization}`]
  const add = (k: string, v: number | string | undefined): void => {
    if (v !== undefined) parts.push(`${k}=${String(v)}`)
  }
  switch (cfg.family) {
    case 'A':
      add('pointsPerWeek', cfg.pointsPerWeek)
      break
    case 'B':
      add('rho', cfg.rho)
      break
    case 'C':
      add('kappa', cfg.kappa)
      add('baseline', cfg.baseline)
      add('revertMode', cfg.revertMode ?? 'twoSided')
      break
    case 'D':
      add('gainKeep', cfg.gainKeep)
      add('lossKeep', cfg.lossKeep)
      add('idleDrain', cfg.idleDrain)
      break
    case 'E':
      add('idleRate', cfg.idleRate)
      add('tauWeeks', cfg.tauWeeks)
      add('releaseGraceWeeks', cfg.releaseGraceWeeks)
      break
    case 'F':
      add('pivotHalfLifeReleases', cfg.pivotHalfLifeReleases)
      add('pivotInit', cfg.pivotInit)
      break
    default:
      break
  }
  add('floor', cfg.floor)
  add('ceiling', cfg.ceiling)
  add('noiseSigma', cfg.noiseSigma)
  return `${cfg.family}:${parts.join(';')}`
}
