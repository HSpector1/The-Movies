// ── D-16 · typed counterfactual TUNING overrides ─────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// The mechanism is the D-12 idiom (run-owner-calibration-study.ts:390-395): TUNING is
// declared `as const` but is never frozen, so an in-process save → assign → try/finally
// restore works. That study's version had four defects this module fixes:
//
//   1. `(TUNING as any)[k]` — a typo'd key silently no-ops. Here the key type is
//      `NumericTuningKey`, so a bad key is a compile error.
//   2. no restoration canary — here `assertTuningPristine()` deep-compares against a
//      module-load snapshot and throws loudly.
//   3. no read-timing discipline — here every sweepable constant is in an ALLOWLIST that
//      records WHERE it is read (worldgen-time vs use-time). A worldgen-time constant is
//      REJECTED unless the caller declares `regeneratesWorlds: true`.
//   4. untagged output — here `tagArtifact()` is the only way to build an emittable
//      object, and it always stamps { mode, overrides }. No experimental number can be
//      emitted without its tag.
//
// SINGLE PROCESS ONLY. TUNING mutation is process-global: it is NOT safe under vitest
// worker parallelism. Overrides are used from the vite-node CLI, never from a *.test.ts.

import { TUNING } from '../../core/index.js'

type NumericTuningKey = {
  [K in keyof typeof TUNING]: (typeof TUNING)[K] extends number ? K : never
}[keyof typeof TUNING]

export type TuningOverrides = Partial<Record<NumericTuningKey, number>>

export type ReadTiming =
  | 'worldgen' // consumed inside generateWorld — a mid-run change does nothing
  | 'founding' // consumed at beginFounding / signContract
  | 'use' // consumed at the point of use, every time (tick / greenlight / reception)

export type AllowlistEntry = {
  key: NumericTuningKey
  timing: ReadTiming
  /** where the value is read, verified by inspection at 33eb33ae. */
  readAt: string
  note: string
}

/**
 * The ONLY constants D-16 may sweep, with their verified read timing.
 * `timing: 'worldgen'` entries are rejected unless the experiment regenerates worlds
 * INSIDE the override scope — otherwise the sweep silently measures nothing.
 */
export const TUNING_ALLOWLIST: readonly AllowlistEntry[] = [
  {
    key: 'INITIAL_CASH',
    timing: 'worldgen',
    readAt: 'worldgen.ts:617 (studio.cash at generation)',
    note: 'Also the base of the reconciliation invariant (types.ts:350-352). Must be set BEFORE generateWorld.',
  },
  {
    key: 'SALARY_BASE',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve, stamped onto talent.salary at generation',
    note: 'salaryCurve is ALSO called at use time by offerForTalent/freelancerFee, so a mid-run change moves contract and fee quotes but not talent.salary. Sweep only with world regeneration.',
  },
  {
    key: 'SALARY_SKILL_COEF',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve',
    note: 'Same dual-read caveat as SALARY_BASE.',
  },
  {
    key: 'SALARY_FAME_COEF',
    timing: 'worldgen',
    readAt: 'worldgen.ts:147-153 salaryCurve',
    note: 'Same dual-read caveat as SALARY_BASE.',
  },
  {
    key: 'HIRING_FOUNDING_BUDGET',
    timing: 'founding',
    readAt: 'employment.ts:391 (beginFounding seeds founding.budget)',
    note: 'Must be set before beginFounding; changing it later has no effect on an open draft.',
  },
  {
    key: 'OVERHEAD_BASE',
    timing: 'use',
    readAt: 'tick.ts:477 (step 7.5) and economyView.ts:21',
    note: 'Read every tick. Safe to change mid-run.',
  },
  {
    key: 'OVERHEAD_PER_EMPLOYEE',
    timing: 'use',
    readAt: 'tick.ts:477 and economyView.ts:21',
    note: 'Read every tick. Safe to change mid-run.',
  },
  {
    key: 'STUDIO_RENTAL_BLENDED',
    timing: 'use',
    readAt: 'economy.ts:53-73 openTheatricalRun (LOCKED onto the run at open); tick.ts:330 uses run.studioShare',
    note: 'Locked per run at RELEASE. A run already open keeps its old share — so a mid-run change applies only to films released after it.',
  },
  {
    key: 'ECONOMY_BOX_OFFICE_SCALE',
    timing: 'use',
    readAt: 'reception.ts:599 (engaged opening scale)',
    note: 'Read at every reception resolve and every forecast. Safe mid-run.',
  },
  {
    key: 'AWARENESS_REACH_NEUTRAL',
    timing: 'use',
    readAt: 'standing.ts:98-108 (per-release awareness delta)',
    note: 'The A3 §10 ratchet pivot. Read per release. Safe mid-run.',
  },
  {
    key: 'AWARENESS_REACH_SCALE',
    timing: 'use',
    readAt: 'standing.ts:98-108',
    note: 'Read per release. Safe mid-run.',
  },
  {
    key: 'ORGANIC_AWARENESS_FLOOR_WEIGHT',
    timing: 'use',
    readAt: 'reception.ts:569 (engaged baseAwareness)',
    note: 'Read per reception/forecast. Safe mid-run.',
  },
  {
    key: 'FAME_REACH_HALF_SAT',
    timing: 'use',
    readAt: 'economy.ts:17-20 fameReach, via reception.ts:456-458 / forecast',
    note: 'Read per reception/forecast. Safe mid-run.',
  },
  {
    key: 'FREELANCER_FEE_PREMIUM',
    timing: 'use',
    readAt: 'employment.ts:219-221 freelancerFee, charged at actions.ts:417-434',
    note: 'Read at each greenlight. Safe mid-run.',
  },
  {
    key: 'CONTRACT_ANNUAL_MULT',
    timing: 'use',
    readAt: 'employment.ts:170-193 offerForTalent',
    note: 'Read when an offer is priced; existing contracts keep their locked annualSalary.',
  },
  {
    key: 'HIRING_TERMINATION_FRACTION',
    timing: 'use',
    readAt: 'employment.ts:115-123 terminationCost',
    note: 'Read at each release. Safe mid-run.',
  },
  // MAX_CONCURRENT_PRODUCTIONS is not a knob any more — C2a-M4 DELETED it
  // (owner law 1: capacity and reservations limit throughput, a global movie
  // counter does not). The sweep axis it declared no longer exists in the
  // engine; the harness agents' own slate bound is `AGENT_MAX_SLATE`, which is a
  // POLICY constant and therefore not an engine knob either.

  // ── D-17B extension (A4 §4; Phase-A gate ruling 1) ─────────────────────────
  // 20 DISC_*/MARKETING_*/OVEREXPOSURE_* keys + the 3 awareness-delta keys. Read timing was
  // MEASURED, not assumed: each key was mutated before `generateWorld` and the generated world
  // compared by `stableStringify` — ZERO keys are worldgen-baked — then mutated at use time and
  // 14 observables diffed. `assertTuningPristine` restored cleanly for all 23 (`restoreOk=true`).
  {
    key: 'MARKETING_HALF_SATURATION',
    timing: 'use',
    readAt: 'reception.ts:553-559 (LEGACY fixed-capacity Hill, disengaged path only)',
    note: 'INERT IN EVERY ENGAGED D-17B CORPUS (A4 §4 / risk 3): it moved only legacyOpening/legacyTotal and never an engaged observable, because the engaged path uses the awareness-conditioned capacity instead. Allowlisted so a sweep that includes it is legal, but a sweep that includes it MEASURES NOTHING post-R2 — say so in the artifact.',
  },
  {
    key: 'MARKETING_CAPACITY_MIN',
    timing: 'use',
    readAt: 'tuning.ts:357, read at reception.ts:553-559 (engaged box-office capacity)',
    note: 'Measured: moved 12/14 observables. Read per reception/forecast. Safe mid-run.',
  },
  {
    key: 'MARKETING_CAPACITY_MAX',
    timing: 'use',
    readAt: 'tuning.ts:358, read at reception.ts:553-559',
    note: 'Measured: moved 12/14 observables. Safe mid-run.',
  },
  {
    key: 'MARKETING_AWARENESS_STANDING_WEIGHT',
    timing: 'use',
    readAt: 'tuning.ts:359, read at reception.ts:547-551 (pre-marketing awareness blend)',
    note: 'Measured: moved 12/14 observables. Safe mid-run.',
  },
  {
    key: 'MARKETING_AWARENESS_EXP',
    timing: 'use',
    readAt: 'tuning.ts:360, read at reception.ts:553-559',
    note: 'Measured: moved 12/14 observables. Safe mid-run.',
  },
  {
    key: 'MARKETING_REACH_MIN',
    timing: 'use',
    readAt: 'tuning.ts:368, read at reception.ts:565-567 (marketing reach ceiling)',
    note: 'Measured: moved 12/14 observables. Safe mid-run.',
  },
  {
    key: 'MARKETING_REACH_MAX',
    timing: 'use',
    readAt: 'tuning.ts:369, read at reception.ts:565-567',
    note: 'Measured: moved 12/14 observables. Safe mid-run.',
  },
  {
    key: 'OVEREXPOSURE_THRESHOLD',
    timing: 'use',
    readAt: 'reception.ts:608 (overexposure onset)',
    note: 'Binds ONLY at intermediate campaigns: inert at $400k and at >= $2M, −2.18%…−2.51% of total at $700k–$1.5M. A sweep at the shipped grid’s outer rungs measures nothing.',
  },
  {
    key: 'OVEREXPOSURE_RANGE',
    timing: 'use',
    readAt: 'reception.ts:608',
    note: 'Same window as OVEREXPOSURE_THRESHOLD: inert at $400k/$2M+, −0.17%…−3.32% at $700k–$1.5M.',
  },
  {
    key: 'OVEREXPOSURE_LEGS_COEF',
    timing: 'use',
    readAt: 'tuning.ts:404, read in the legs channel of reception.ts §5.5',
    note: 'Monotone from $700k (+0.13%) to saturation (+4.00% at >= $2M).',
  },
  {
    key: 'OVEREXPOSURE_DELIVERY_REF',
    timing: 'use',
    readAt: 'tuning.ts:407, read in the delivery term of reception.ts §5.5',
    note: 'Measured: moved engagedTotal and forecast.expectedTotal at a $5M campaign.',
  },
  {
    key: 'OVEREXPOSURE_DELIVERY_RANGE',
    timing: 'use',
    readAt: 'tuning.ts:408',
    note: 'Same read site and same measured effect as OVEREXPOSURE_DELIVERY_REF.',
  },
  {
    key: 'DISC_SUPPORT_AWARENESS',
    timing: 'use',
    readAt: 'reception.ts §5.6 discoverability support / filmPackage.ts:604',
    note: 'D-13 shape family. Measured: moved openingN2. THRESHOLD-family keys must be calibrated against the POST-repair awareness distribution (A2), never the current one.',
  },
  {
    key: 'DISC_SUPPORT_STAR',
    timing: 'use',
    readAt: 'reception.ts §5.6 / filmPackage.ts:604',
    note: 'D-13 shape family. Measured: moved openingN2.',
  },
  {
    key: 'DISC_SUPPORT_THRESHOLD',
    timing: 'use',
    readAt: 'reception.ts §5.6 / filmPackage.ts:604',
    note: 'D-13 shape family. Measured: moved openingP2, N2 and N9 — the widest-binding DISC key.',
  },
  {
    key: 'DISC_SPREAD',
    timing: 'use',
    readAt: 'reception.ts §5.6 / filmPackage.ts:604',
    note: 'D-13 shape family. Measured: moved openingN2. KEEP the discovery-v1 stream key for the whole constant family; bump it only for a functional-form change (A2).',
  },
  {
    key: 'DISC_SUPPORT_EXP',
    timing: 'use',
    readAt: 'reception.ts §5.6 / filmPackage.ts:604',
    note: 'D-13 shape family. Measured: moved openingN2.',
  },
  {
    key: 'DISC_FLOOR',
    timing: 'use',
    readAt: 'reception.ts:645-647 (the discoverability clip)',
    note: 'Measured: moved openingN9 ONLY — it is the lower clip. A2 measures a floor raise as ~96% inert for survivability; useful for loss truncation, not for recovery.',
  },
  {
    key: 'DISC_CEIL',
    timing: 'use',
    readAt: 'reception.ts:645-647',
    note: 'Measured: moved openingP2 and P9 — the upper clip.',
  },
  {
    key: 'DISC_FORECAST_LOW_Z',
    timing: 'use',
    readAt: 'filmPackage.ts:613, filmPackage.ts:793 (read inside the call)',
    note: 'DISPLAY-ONLY, verified by read-site inspection rather than by a moved observable: no package on seed d16-0001 at week 0 is discovery-`exposed` (shortfall 0 even at the bare-minimum $100k/0.75x), so the probe could not make it bind (A4 F11). A sweep must state that it moves the player-facing low band, not the realized draw.',
  },
  {
    key: 'AWARENESS_REACH_WEIGHT',
    timing: 'use',
    readAt: 'standing.ts:106-111 (per-release awareness delta)',
    note: 'LAB SWEEPS ONLY — production change NOT authorized by R4. Same function body as the two measured awareness keys (derived read-timing). Family F’s re-derivation and any gain-side calibration need it; changing it in the game would need an Owner extension.',
  },
  {
    key: 'AWARENESS_STAR_WEIGHT',
    timing: 'use',
    readAt: 'standing.ts:106-111',
    note: 'LAB SWEEPS ONLY — production change NOT authorized by R4. Secondary (star-attention) coefficient of the same delta.',
  },
  {
    key: 'AWARENESS_DELTA_CAP',
    timing: 'use',
    readAt: 'standing.ts:106-111',
    note: 'LAB SWEEPS ONLY — production change NOT authorized by R4. A1 measured that the ±6 cap NEVER binds in real play (raw delta range [−4.06, +4.14]), so a sweep of it is expected to be inert until the reach term itself moves.',
  },
]

const ALLOWED = new Map(TUNING_ALLOWLIST.map((e) => [e.key as string, e]))

/** Snapshot taken at module load, used by the restoration canary. */
const PRISTINE: Record<string, unknown> = {}
for (const k of Object.keys(TUNING)) PRISTINE[k] = (TUNING as unknown as Record<string, unknown>)[k]

export function assertTuningPristine(label = ''): void {
  const live = TUNING as unknown as Record<string, unknown>
  const drift: string[] = []
  for (const k of Object.keys(PRISTINE)) {
    const a = PRISTINE[k]
    const b = live[k]
    if (typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean') {
      if (a !== b) drift.push(`${k}: ${String(a)} → ${String(b)}`)
    }
  }
  if (drift.length > 0) {
    throw new Error(`d16/experiment: TUNING was not restored${label ? ` (${label})` : ''}: ${drift.join('; ')}`)
  }
}

export type OverrideScopeOptions = {
  /** the experiment regenerates worlds INSIDE the scope, so worldgen-time keys are legal. */
  regeneratesWorlds?: boolean
}

/** Reject a sweep whose constants cannot possibly bind under the experiment's design. */
export function validateOverrides(overrides: TuningOverrides, opts: OverrideScopeOptions = {}): void {
  const problems: string[] = []
  for (const key of Object.keys(overrides)) {
    const entry = ALLOWED.get(key)
    if (entry === undefined) {
      problems.push(`"${key}" is not in TUNING_ALLOWLIST (read timing unverified)`)
      continue
    }
    if ((entry.timing === 'worldgen' || entry.timing === 'founding') && opts.regeneratesWorlds !== true) {
      problems.push(
        `"${key}" is read at ${entry.timing} time (${entry.readAt}) — the experiment must regenerate worlds inside the override scope, or the sweep measures nothing`,
      )
    }
  }
  if (problems.length > 0) {
    throw new Error(`d16/experiment: rejected override set — ${problems.join(' | ')}`)
  }
}

/**
 * Apply overrides for the duration of `fn`, then restore in a `finally` and verify.
 * Nesting is safe (save/restore is symmetric per scope).
 */
export function withTuningOverrides<T>(
  overrides: TuningOverrides,
  fn: () => T,
  opts: OverrideScopeOptions = {},
): T {
  validateOverrides(overrides, opts)
  const live = TUNING as unknown as Record<string, number>
  const saved: Record<string, number> = {}
  const keys = Object.keys(overrides).sort()
  for (const k of keys) {
    saved[k] = live[k]!
    live[k] = (overrides as Record<string, number>)[k]!
  }
  try {
    return fn()
  } finally {
    for (const k of keys) live[k] = saved[k]!
  }
}

// ── artifact tagging ─────────────────────────────────────────────────────────

export type ArtifactMode = 'CURRENT' | 'COUNTERFACTUAL'

/**
 * D-17B lab levers that are NOT TUNING overrides but ARE counterfactual changes to the
 * simulated world. Each is a stable, human-readable key; ABSENT (never `null`) when its
 * lever is off, so the neutral arm's stamp is byte-identical to D-17A's.
 */
export type LabLevers = {
  /** e.g. 'C:auth=candidate;kappa=0.02;baseline=30;revertMode=pullDownOnly'. */
  counterFlowKey?: string
  /** e.g. 'whisper=60000/1.5/exp1/dur0/cd4;…;gcd=2'. */
  publicityKey?: string
  /** e.g. '200000,700000,2000000' or 'capacity:1.3,2,2.5'. */
  marketingGridKey?: string
  /** Exact identity of production mechanics; unlike a lab lever, this does not make CURRENT counterfactual. */
  productionCandidateKey?: string
}

export type Tag = LabLevers & {
  mode: ArtifactMode
  overrides: TuningOverrides
  /** stable, sorted, human-readable key: '' for CURRENT, 'K=v;K2=v2' otherwise. */
  overrideKey: string
  /**
   * D-16 §13.4 DEFECT FIX. The lab used to stamp a prose note reading 'CURRENT' onto files
   * whose `mode` was correctly `COUNTERFACTUAL`; a reader who trusted the note read a
   * counterfactual arm as shipped behaviour. The note is now DERIVED from the same lever set
   * `mode` is derived from, so it cannot contradict it, and it is ABSENT on a CURRENT artifact
   * (there is nothing to warn about, and an absent field keeps the neutral arm byte-identical).
   */
  tagNote?: string
}

/**
 * Build the artifact tag. `mode` is `COUNTERFACTUAL` when there is ANY override **or any lab
 * lever** — a counter-flow / publicity / marketing-grid arm can no longer be emitted as
 * `CURRENT` just because its TUNING override set happens to be empty.
 */
export function makeTag(overrides: TuningOverrides = {}, levers: LabLevers = {}): Tag {
  const keys = Object.keys(overrides).sort()
  const leverEntries = (['counterFlowKey', 'publicityKey', 'marketingGridKey'] as const).filter(
    (k) => levers[k] !== undefined,
  )
  const mode: ArtifactMode = keys.length === 0 && leverEntries.length === 0 ? 'CURRENT' : 'COUNTERFACTUAL'
  const overrideKey = keys.map((k) => `${k}=${String((overrides as Record<string, number>)[k])}`).join(';')
  const copy: TuningOverrides = {}
  for (const k of keys) (copy as Record<string, number>)[k] = (overrides as Record<string, number>)[k]!

  const tag: Tag = { mode, overrides: copy, overrideKey }
  for (const k of leverEntries) {
    const v = levers[k]
    if (v !== undefined) tag[k] = v
  }
  if (levers.productionCandidateKey !== undefined) {
    tag.productionCandidateKey = levers.productionCandidateKey
  }
  if (mode === 'COUNTERFACTUAL') {
    const what: string[] = []
    if (overrideKey !== '') what.push(`TUNING overrides {${overrideKey}}`)
    for (const k of leverEntries) what.push(`${k.replace(/Key$/, '')} ${levers[k]!}`)
    tag.tagNote = `COUNTERFACTUAL — not shipped behaviour. Levers: ${what.join(' + ')}.`
  }
  return tag
}

/**
 * The ONLY sanctioned way to build an emittable object. Every artifact row and every
 * summary passes through here, so a number can never reach a file untagged.
 *
 * The optional lever stamps are copied ONLY when present: `stableJson` drops `undefined`, but
 * an explicitly-emitted `null` would change every byte of `rows.jsonl` and break the
 * neutral-arm invariant — the single easiest way to fail that gate (A4 §1.5 rule 1).
 */
export function tagArtifact<T extends object>(payload: T, tag: Tag): T & Tag {
  const out = { ...payload, mode: tag.mode, overrides: tag.overrides, overrideKey: tag.overrideKey } as T & Tag
  if (tag.counterFlowKey !== undefined) out.counterFlowKey = tag.counterFlowKey
  if (tag.publicityKey !== undefined) out.publicityKey = tag.publicityKey
  if (tag.marketingGridKey !== undefined) out.marketingGridKey = tag.marketingGridKey
  if (tag.productionCandidateKey !== undefined) out.productionCandidateKey = tag.productionCandidateKey
  if (tag.tagNote !== undefined) out.tagNote = tag.tagNote
  return out
}

/** The read-timing table, for the build report / an artifact header. */
export function readTimingTable(): { key: string; timing: ReadTiming; readAt: string; note: string }[] {
  return TUNING_ALLOWLIST.map((e) => ({ key: e.key as string, timing: e.timing, readAt: e.readAt, note: e.note }))
}
