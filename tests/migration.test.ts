// ── AGENT D — INDEPENDENT tests for the D-9.15 (owner-overridden) V1→V2 talent
// migration + deterministic legacy import. ────────────────────────────────────
//
// SOURCE OF TRUTH: the D-9.15 ruling in docs/rev4-open-questions.md (§"D-9.15
// SaveFileV1 migration") AS OVERRIDDEN by the owner: the migration TARGET is a NEW
// SaveFileV2 envelope (not an in-place V1 rewrite). SaveFileV1 stays FROZEN. Every
// expectation below is derived from the ruling text + the owner override; the
// bodies of save.ts / talentSummary.ts / worldgen.ts are NEVER read for an
// expectation. Imports use ONLY the public surface (src/core/index.js) plus the
// exported V1/V2 types (src/core/save.js) needed to type fixtures.
//
// Ruling basis (D-9.15, numbered steps):
//   1  primary discipline = role→discipline (ROLE_TO_DISCIPLINE)
//   2  primary skills CENTERED ON old.skill, per-skill variation (not all identical)
//   3  perceived primary near actual
//   4  10–20% usable secondary discipline (MIGRATE_SECONDARY_P 0.15 centers it)
//   5  ceilings ≥ actual
//   6  workEthic 1..99
//   7  devRate 0.5..1.5 per discipline
//   8  genre experience defaults (primary seeded small; others 0)
//   9  workHistory all-zero
//   10 skill / salary / authored kept as-is from old
//   Idempotency: a talent already carrying `skills` is NOT re-migrated (no-op).
//   Replay-exactness: draws come ONLY from stream(seed,'migrate',...), which never
//     advances state.rngState; the migrated state's rngState == the imported one.
//
// KNOWN D-9 INCONSISTENCY (reported): the acceptance-list line (§ Migration bullet)
// says "migrated primary-discipline OVR centered near old.skill (mean |Δ| < ~3)".
// But D-9.2's roleOVR SUBTRACTS weakness + breadth penalties and floor-gates below
// the weighted skill mean, so OVR sits STRUCTURALLY BELOW the skill mean — that OVR
// metric is UNSATISFIABLE. The faithful requirement (D-9.15 step 2 + owner
// guardrail #1 "comparable ability + D-6 economics") is the one on the ACTUAL SKILL
// VALUES: the primary-discipline ACTUAL-SKILL MEAN is within ~3 of old.skill.
// This suite asserts the SKILL-MEAN metric, NOT the OVR metric. (See report.)

import { describe, expect, it } from 'vitest'
import {
  convertV1ToV2,
  DISCIPLINE_ORDER,
  exportSave,
  importLegacyV1,
  makeSaveV2,
  migrateTalent,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  stableStringify,
  TUNING,
  validateSaveV1,
  validateSaveV2,
} from '../src/core/index.js'
import type { CreativeRole, Discipline, Talent } from '../src/core/index.js'
import type { GameStateV1, SaveFileV1, TalentV1 } from '../src/core/save.js'
import {
  makeFixedSkillCorpus,
  makeLegacyCorpus,
  makeLegacySaveV1,
  makeLegacyStateV1,
  makeLegacyTalent,
} from './_legacyV1Fixtures.js'

// ── Derived-from-ruling helpers (compute metrics; never copy an implementation) ─

const SEED = 'agentD-migrate-seed'

function primaryOf(role: CreativeRole): Discipline {
  return ROLE_TO_DISCIPLINE[role]
}

// The 6 ACTUAL skill values of `discipline`, in SKILL_ORDER (the faithful metric).
function actualSkillVector(t: Talent, discipline: Discipline): number[] {
  return SKILL_ORDER[discipline].map((k) => t.skills[discipline][k]!.actual)
}
function perceivedSkillVector(t: Talent, discipline: Discipline): number[] {
  return SKILL_ORDER[discipline].map((k) => t.skills[discipline][k]!.perceived)
}
function meanOf(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}
// The primary-discipline ACTUAL-SKILL MEAN — the metric the ruling's step 2 defines
// ("centered near the old scalar"). NOT roleOVR.
function primaryActualSkillMean(t: Talent): number {
  return meanOf(actualSkillVector(t, primaryOf(t.role)))
}

// A validated legacy save whose talent are the reproducible corpus.
function legacyCorpusSave(n: number, prefix = 'm'): SaveFileV1 {
  return makeLegacySaveV1({ seed: SEED, talent: makeLegacyCorpus(n, prefix) })
}

// A deep snapshot of any JSON value, used to prove non-mutation.
function snapshot<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) SaveFileV1 immutability + loud version dispatch (owner override §4)
// ─────────────────────────────────────────────────────────────────────────────
describe('SaveFileV1 immutability + loud version dispatch', () => {
  it('an original-shape V1 save still validates under the ORIGINAL V1 rules', () => {
    // A legacy (scalar-`skill`, NO `skills` record) save is still a valid V1 save.
    const v1 = legacyCorpusSave(5)
    expect(v1.saveVersion).toBe(1)
    expect(() => validateSaveV1(v1)).not.toThrow()
    // It carries OLD-shape talent (no D-9 `skills` marker field).
    for (const t of v1.state.talent) {
      expect((t as unknown as { skills?: unknown }).skills).toBeUndefined()
      expect(typeof t.skill).toBe('number') // legacy scalar present
    }
  })

  it('validateSaveV1 LOUDLY rejects a V2 envelope handed to the V1 validator', () => {
    // A converted V2 is NOT a V1 — the V1 validator must reject it (version guard).
    const v2 = convertV1ToV2(legacyCorpusSave(3))
    expect(v2.saveVersion).toBe(2)
    expect(() => validateSaveV1(v2 as unknown as SaveFileV1)).toThrow()
  })

  it('validateSaveV2 LOUDLY rejects an unknown saveVersion', () => {
    const v2 = convertV1ToV2(legacyCorpusSave(3))
    const bad = { ...v2, saveVersion: 7 }
    expect(() => validateSaveV2(bad as unknown as ReturnType<typeof makeSaveV2>)).toThrow()
  })

  it('V1 and its converted V2 are NOT byte-identical (different talent shapes)', () => {
    const v1 = legacyCorpusSave(4)
    const v2 = convertV1ToV2(v1)
    expect(exportSave(v2)).not.toBe(exportSave(v1))
    // The divergence is the talent shape: V2 gained the D-9 `skills` record.
    for (const t of v2.state.talent) {
      expect((t as Talent).skills).toBeDefined()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2) Deterministic, NON-DESTRUCTIVE conversion
// ─────────────────────────────────────────────────────────────────────────────
describe('convertV1ToV2 / importLegacyV1 — non-destructive + full new shape', () => {
  it('produces a V2 whose talent carry the FULL D-9 shape (all new fields present)', () => {
    const v2 = convertV1ToV2(legacyCorpusSave(6))
    expect(v2.saveVersion).toBe(2)
    for (const t of v2.state.talent as Talent[]) {
      // Every discipline's 6 skills present with actual+perceived, plus ceilings,
      // devRate, workEthic, genreExperience, workHistory (D-9.16 shape).
      for (const d of DISCIPLINE_ORDER) {
        expect(Object.keys(t.skills[d]).sort()).toEqual([...SKILL_ORDER[d]].sort())
        for (const k of SKILL_ORDER[d]) {
          const pair = t.skills[d][k]!
          expect(pair.actual).toBeGreaterThanOrEqual(1)
          expect(pair.actual).toBeLessThanOrEqual(99)
          expect(pair.perceived).toBeGreaterThanOrEqual(1)
          expect(pair.perceived).toBeLessThanOrEqual(99)
          // Step 5: ceiling ≥ actual.
          expect(t.ceilings[d][k]!).toBeGreaterThanOrEqual(pair.actual)
          expect(t.ceilings[d][k]!).toBeLessThanOrEqual(99)
        }
        // Step 7: devRate in [0.5, 1.5].
        expect(t.devRate[d]).toBeGreaterThanOrEqual(TUNING.DEV_RATE_MIN)
        expect(t.devRate[d]).toBeLessThanOrEqual(TUNING.DEV_RATE_MAX)
        // Step 9: workHistory all-zero.
        expect(t.workHistory[d]).toBe(0)
      }
      // Step 6: workEthic 1..99.
      expect(t.workEthic).toBeGreaterThanOrEqual(1)
      expect(t.workEthic).toBeLessThanOrEqual(99)
    }
  })

  it('NEVER mutates the V1 input object (deep-equals a pre-call snapshot)', () => {
    const v1 = legacyCorpusSave(8)
    const before = snapshot(v1)
    convertV1ToV2(v1)
    expect(v1).toEqual(before)
    // In particular the input talent are still old-shape (no `skills` leaked in).
    for (const t of v1.state.talent) {
      expect((t as unknown as { skills?: unknown }).skills).toBeUndefined()
    }
  })

  it('importLegacyV1 NEVER mutates the input JSON string and yields a fresh V2', () => {
    const v1 = legacyCorpusSave(5)
    const json = exportSave(v1)
    const jsonBefore = json // strings are immutable; this proves no in-place edit
    const v2 = importLegacyV1(json)
    expect(json).toBe(jsonBefore)
    expect(v2.saveVersion).toBe(2)
    // importLegacyV1(json) must equal convertV1ToV2(parse+validate(json)) — same seed.
    const reValidated = validateSaveV1(JSON.parse(json))
    expect(stableStringify(v2)).toBe(stableStringify(convertV1ToV2(reValidated)))
  })

  it('carries rngState through UNCHANGED (replay anchor)', () => {
    const chosenRng = '111111111,222222222,333333333,444444444'
    const v1 = makeLegacySaveV1({
      seed: SEED,
      talent: makeLegacyCorpus(4),
      rngState: chosenRng,
    })
    const v2 = convertV1ToV2(v1)
    expect(v2.state.rngState).toBe(chosenRng)
    expect(v2.state.seed).toBe(v1.state.seed)
    expect(v2.seed).toBe(v1.seed) // envelope seed preserved (M14 self-consistency)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3) Idempotency — same V1 twice ⇒ byte-identical V2 talent; no double-migration
// ─────────────────────────────────────────────────────────────────────────────
describe('idempotency of the conversion', () => {
  it('converting the SAME V1 twice yields byte-identical V2 talent (stableStringify)', () => {
    const v1 = legacyCorpusSave(12)
    const a = convertV1ToV2(v1)
    const b = convertV1ToV2(v1)
    expect(stableStringify(a.state.talent)).toBe(stableStringify(b.state.talent))
    // The whole envelope is byte-identical too.
    expect(exportSave(a)).toBe(exportSave(b))
  })

  it('migrateTalent is a deterministic function of (old, seed): same in ⇒ same out', () => {
    const old = makeLegacyTalent({ id: 'idem-1', skill: 63, role: 'director' })
    const t1 = migrateTalent(old, SEED)
    const t2 = migrateTalent(old, SEED)
    expect(stableStringify(t1)).toBe(stableStringify(t2))
  })

  it('a DIFFERENT seed yields DIFFERENT migrated talent (draws are seed-keyed)', () => {
    const old = makeLegacyTalent({ id: 'idem-2', skill: 63, role: 'director' })
    const a = migrateTalent(old, 'seed-A')
    const b = migrateTalent(old, 'seed-B')
    expect(stableStringify(a)).not.toBe(stableStringify(b))
  })

  it('a V2 (already-migrated) talent is NOT double-migrated: re-converting via V2 path is a fixpoint', () => {
    // True idempotency of the PIPELINE: convertV1ToV2 applies only to a V1 input.
    // Re-exporting a V2 and re-validating it as V2 leaves the migrated talent
    // byte-identical (no second migration pass happens on a V2 envelope).
    const v2 = convertV1ToV2(legacyCorpusSave(6))
    const roundTripped = validateSaveV2(JSON.parse(exportSave(v2)))
    expect(stableStringify(roundTripped.state.talent)).toBe(
      stableStringify(v2.state.talent),
    )
    // And convertV1ToV2 refuses a V2 envelope outright (it is not a V1 save).
    expect(() => convertV1ToV2(v2 as unknown as SaveFileV1)).toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4) Determinism / replay-exactness of the migration draws
// ─────────────────────────────────────────────────────────────────────────────
describe('migration draws never touch state.rngState (replay-exactness)', () => {
  it('the migrated GameState.rngState equals the imported one for many talent', () => {
    // Every draw is from stream(seed,'migrate',...), a stateless derived stream, so
    // the sim stream string is copied through verbatim regardless of talent count.
    for (const rng of [
      '1,2,3,4',
      '4294967295,0,4294967295,0',
      '123456789,2345678901,3456789012,987654321',
    ]) {
      const v1 = makeLegacySaveV1({ seed: SEED, talent: makeLegacyCorpus(20), rngState: rng })
      const v2 = convertV1ToV2(v1)
      expect(v2.state.rngState).toBe(rng)
    }
  })

  it('convertV1ToV2 is a pure function of the input: two conversions match byte-for-byte', () => {
    // (No hidden clock/entropy dependence — a second conversion, later in wall time,
    // is byte-identical. Guards against any Date.now()/UUID/locale leak.)
    const v1 = legacyCorpusSave(15)
    const first = exportSave(convertV1ToV2(v1))
    const second = exportSave(convertV1ToV2(snapshot(v1) as SaveFileV1))
    expect(second).toBe(first)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5) FAITHFUL-ABILITY PRESERVATION — the SKILL-MEAN metric (NOT OVR)
//    (see the file header for why the acceptance-list OVR metric is unsatisfiable)
// ─────────────────────────────────────────────────────────────────────────────
describe('faithful ability preservation — primary-discipline ACTUAL-SKILL MEAN ≈ old.skill', () => {
  it('mean |Δ| between primary actual-skill-mean and old.skill is < ~3 across a large corpus', () => {
    // Ruling step 2: primary skills are centered on old.skill with per-skill N(0,SD).
    // So E[actual skill mean] = old.skill (modulo clamp at the 1/99 rails). We assert
    // the MEAN absolute deviation over a big corpus is under the acceptance ~3.
    const N = 4000
    // Use mid-range skills so the 1..99 clamp does not bias the mean (a talent at
    // skill 97 cannot have a symmetric spread — that is a rail artifact, not drift).
    // We still cover the range in other tests; here we isolate the centering claim.
    const talent: TalentV1[] = []
    for (let i = 0; i < N; i++) {
      // deterministic mid-range skills 35..80 spread across the corpus
      const skill = 35 + (i % 46)
      const role: CreativeRole = (['writer', 'director', 'actor', 'craft'] as const)[i % 4]!
      talent.push(makeLegacyTalent({ id: `mean-${i}`, skill, role }))
    }
    const v1 = makeLegacySaveV1({ seed: SEED, talent })
    const v2 = convertV1ToV2(v1)

    let sumAbsDelta = 0
    for (let i = 0; i < N; i++) {
      const migrated = v2.state.talent[i] as Talent
      const delta = primaryActualSkillMean(migrated) - talent[i]!.skill
      sumAbsDelta += Math.abs(delta)
    }
    const meanAbsDelta = sumAbsDelta / N
    // Per-talent the 6-skill mean has SD ≈ MIGRATE_SKILL_SD/√6 ≈ 2.86, so the mean
    // ABSOLUTE deviation ≈ 0.8·2.86 ≈ 2.3 < 3. Acceptance line: mean |Δ| < ~3.
    expect(meanAbsDelta).toBeLessThan(3)
  })

  it('the SIGNED mean deviation is ~0 (no systematic upward/downward bias)', () => {
    const N = 4000
    const talent: TalentV1[] = []
    for (let i = 0; i < N; i++) {
      const skill = 40 + (i % 40) // 40..79 mid-range
      talent.push(makeLegacyTalent({ id: `signed-${i}`, skill, role: 'actor' }))
    }
    const v1 = makeLegacySaveV1({ seed: SEED, talent })
    const v2 = convertV1ToV2(v1)
    let sumSigned = 0
    for (let i = 0; i < N; i++) {
      sumSigned += primaryActualSkillMean(v2.state.talent[i] as Talent) - talent[i]!.skill
    }
    expect(Math.abs(sumSigned / N)).toBeLessThan(1) // centered, not offset
  })

  it('per-skill values are NOT all identical within the primary discipline (step 2 variation)', () => {
    // A single talent whose 6 primary skills came from N(old.skill, SD>0) must vary.
    const old = makeLegacyTalent({ id: 'vary-1', skill: 60, role: 'writer' })
    const t = migrateTalent(old, SEED)
    const vec = actualSkillVector(t, primaryOf(t.role))
    const distinct = new Set(vec)
    expect(distinct.size).toBeGreaterThan(1)
    // Corpus-level: essentially no talent should have all six identical.
    const corpus = makeLegacyCorpus(200, 'vary')
    let allSameCount = 0
    for (const o of corpus) {
      const m = migrateTalent(o, SEED)
      if (new Set(actualSkillVector(m, primaryOf(m.role))).size === 1) allSameCount++
    }
    expect(allSameCount).toBe(0)
  })

  it('perceived primary skills track actual (near, not wild) — step 3', () => {
    // Perceived = actual + N(0, MIGRATE_PERCEIVED_SD 5) clamped. Mean |perceived-actual|
    // across a big corpus should sit near E|N(0,5)| ≈ 4, comfortably < 12.
    const corpus = makeLegacyCorpus(1000, 'perc')
    let sumAbs = 0
    let count = 0
    for (const o of corpus) {
      const m = migrateTalent(o, SEED)
      const d = primaryOf(m.role)
      const a = actualSkillVector(m, d)
      const p = perceivedSkillVector(m, d)
      for (let i = 0; i < a.length; i++) {
        sumAbs += Math.abs(p[i]! - a[i]!)
        count++
      }
    }
    expect(sumAbs / count).toBeLessThan(12)
  })

  it('salary / persona / age / role / fame / authored preserved EXACTLY (steps 1 & 10)', () => {
    const corpus = makeLegacyCorpus(50, 'preserve')
    for (const old of corpus) {
      const m = migrateTalent(old, SEED)
      expect(m.id).toBe(old.id)
      expect(m.name).toBe(old.name)
      expect(m.role).toBe(old.role)
      expect(m.age).toBe(old.age)
      expect(m.fame).toBe(old.fame)
      expect(m.salary).toBe(old.salary) // step 10 — no ledger drift on load
      expect(m.authored).toBe(old.authored)
      expect(m.actual).toEqual(old.actual) // persona (temperament) preserved exactly
      expect(m.perceived).toEqual(old.perceived)
    }
  })

  it('10–20% of migrated talent have a USABLE secondary discipline (step 4 target)', () => {
    // "Usable secondary" per the ruling: a NON-primary discipline whose skill center
    // was drawn from the SECONDARY branch (μ = old.skill − penalty), which lands it
    // well above the weak μ≈34 floor. We detect it structurally: a non-primary
    // discipline whose actual-skill MEAN is clearly above the weak-mean band. Using
    // the calibration line's own bar (secondary is a genuine second aptitude, sitting
    // near old.skill − ~15), a threshold of 45 cleanly separates secondary from weak
    // (weak μ=34) without needing to read the implementation.
    const N = 3000
    const talent = makeFixedSkillCorpus(N, 70, 'actor', 'sec') // high skill → secondary well-separated
    const v1 = makeLegacySaveV1({ seed: SEED, talent })
    const v2 = convertV1ToV2(v1)

    const SECONDARY_MEAN_BAR = 45 // between weak μ=34 and secondary μ≈55 (70−15)
    let withSecondary = 0
    for (const tt of v2.state.talent as Talent[]) {
      const primary = primaryOf(tt.role)
      const hasSecondary = DISCIPLINE_ORDER.some(
        (d) => d !== primary && meanOf(actualSkillVector(tt, d)) >= SECONDARY_MEAN_BAR,
      )
      if (hasSecondary) withSecondary++
    }
    const share = withSecondary / N
    // MIGRATE_SECONDARY_P is 0.15 → the ruling's stated 10–20% band.
    expect(share).toBeGreaterThanOrEqual(0.1)
    expect(share).toBeLessThanOrEqual(0.2)
  })

  it('non-secondary disciplines default to a WEAK band (μ≈34), not to old.skill', () => {
    // The talent WITHOUT a rolled secondary should have its three non-primary
    // disciplines centered low — proving migration does not smear primary ability
    // across every discipline. Corpus mean of non-primary, non-secondary disciplines
    // should sit near the weak mean, far below a high old.skill.
    const N = 2000
    const talent = makeFixedSkillCorpus(N, 80, 'writer', 'weak')
    const v1 = makeLegacySaveV1({ seed: SEED, talent })
    const v2 = convertV1ToV2(v1)
    // Take the LOWEST-mean non-primary discipline of each talent (guaranteed weak).
    let sumLowest = 0
    for (const tt of v2.state.talent as Talent[]) {
      const primary = primaryOf(tt.role)
      const nonPrimaryMeans = DISCIPLINE_ORDER.filter((d) => d !== primary).map((d) =>
        meanOf(actualSkillVector(tt, d)),
      )
      sumLowest += Math.min(...nonPrimaryMeans)
    }
    const meanLowest = sumLowest / N
    // Old skill is 80; the weakest discipline must be nowhere near it (weak μ≈34).
    expect(meanLowest).toBeLessThan(50)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6) No entropy — determinism does not depend on field ORDER or object identity
// ─────────────────────────────────────────────────────────────────────────────
describe('no wall-clock / UUID / locale / fs-order entropy in the conversion', () => {
  it('reordering the talent array does NOT change any individual migration (id-keyed draws)', () => {
    // Draws key on old.id, not array position — so a permuted input yields the SAME
    // per-talent output (only the array order differs). Proves no fs/iteration-order
    // dependence in the field derivation.
    const talent = makeLegacyCorpus(10, 'order')
    const forward = makeLegacyStateV1({ seed: SEED, talent })
    const reversed = makeLegacyStateV1({ seed: SEED, talent: [...talent].reverse() })

    const vF = convertV1ToV2(validateSaveV1(makeSaveOf(forward)))
    const vR = convertV1ToV2(validateSaveV1(makeSaveOf(reversed)))

    // Build id → serialized-talent maps and compare per id.
    const mapF = new Map(
      (vF.state.talent as Talent[]).map((t) => [t.id, stableStringify(t)]),
    )
    const mapR = new Map(
      (vR.state.talent as Talent[]).map((t) => [t.id, stableStringify(t)]),
    )
    expect(mapF.size).toBe(mapR.size)
    for (const [id, s] of mapF) {
      expect(mapR.get(id)).toBe(s)
    }
  })

  it('two identical old talent that differ ONLY by id migrate DIFFERENTLY (id enters the key)', () => {
    const base = { skill: 55, role: 'craft' as CreativeRole, age: 33 }
    const a = migrateTalent(makeLegacyTalent({ id: 'ent-a', ...base }), SEED)
    const b = migrateTalent(makeLegacyTalent({ id: 'ent-b', ...base }), SEED)
    // Same seed, same scalar inputs, different id ⇒ different derived skills.
    expect(stableStringify(a.skills)).not.toBe(stableStringify(b.skills))
  })
})

// Local helper: wrap a GameStateV1 into a V1 save via the public makeSaveV2's V1
// sibling. (makeSaveV1 is imported through save.js in the fixtures; re-derive here
// from validateSaveV1 to keep this file's imports on the public surface.)
function makeSaveOf(state: GameStateV1): SaveFileV1 {
  const save: SaveFileV1 = {
    saveVersion: 1,
    seed: state.seed,
    state,
    broadcastCache: state.broadcastItems,
  }
  return validateSaveV1(save)
}
