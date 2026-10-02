// ── P15C Wave 1 — the pure Legacy law `campaign-legacy/v2`, RED tests (record 1353-C, revision 1353-C4/r4; v2 values: 1359-C6) ──
//
// r4 (1353-C4, per 1353-F4's rulings on the production handback 1353-E):
// (D1) LegacyFacts gains a required top-level `baseMarketValue`, supplied in
// baseFacts; (D2) the pioneer contrary-ref expectations now compare SORTED
// ids and include `lighting-control-01`, since every enteredWeek:0 studio in
// baseFacts was entered while lighting control was already commercial
// (week 936); (D3) the row-before-recordedFromWeek leaf's film now carries
// domainId 'playerFilms' (it tested the wrong domain before); (D4) the
// 20,000-film bounds fixture keeps every release below B via `% 6230`.
// 1359-A §3.3's three Wave-2-charter amendments land in Wave 1 (1353-F4):
// (A1) LegacyRankingSnapshotFact gains `recordId`; every ranking ref cites it,
// never a week-derived id. (A2) LegacyMarketAssessmentFact gains `week`; the
// law cuts market rows at B like every other domain. (A3) closedWeek >= B
// reads open: no closure contrary, no closure in the survivor predicate.
// Two more 1353-E §9 open points changed by 1353-F4: OPEN-12, "commercial
// while S was entered" means enteredWeek <= commercialWeek < end of S's span
// (closure, else B) -- an entrant after a technology's commercialWeek carries
// no contrary for it, adopted late or never. OPEN-19, `settledWeek` before
// `releaseWeek` refuses; this file's `filmFact` factory now derives its
// DEFAULT settledWeek from the caller's own releaseWeek (`releaseWeek + 10`)
// rather than a fixed literal, since a fixed default broke under the new
// refusal the moment any caller overrode releaseWeek upward (nearly every
// N-1/N and archetype-edge leaf in this file does) -- re-derived and
// confirmed leaf by leaf in the 1353-C4 revision record, not merely asserted.
//
// Authority: 1353-A-p15c-finale-legacy-charter.md §5 (the law), §8 (RED list
// items 1-17), as AMENDED by 1353-F (§5.3 amendments 1-4 govern over the
// original §5.3 text; the 13th-lens-refusal addition to RED 9; the new
// `legacy-closed-before-boundary` leaf); confirmed by 1353-B2 (ACCEPT, no
// further blocking gaps); and as FURTHER AMENDED by 1353-F2 (the parent's
// adoption of this file's proposed `LegacyFacts`, with five amendments that
// govern this revision: (1) every film/career-event fact now carries its own
// source `domainId`, and RED 10 pins exact domainId values on refs; (2) one
// leaf per v1 lens asserting its exact `counts` key set plus one concrete
// value; (3) the static bounds invariant is accepted unchanged; (4) RED 13's
// domain-status table is now exact (absent/null -> notRecorded; recordedFrom
// >= B -> notRecorded; recordedFrom after a studio's entry and < B -> limited,
// carrying the week; otherwise -> complete); (5) RED 15's "no events" leaf now
// asserts BOTH effects -- the film excluded from decade counting AND the
// studio's audience-institution `limitedBy` naming that film's career-event
// domain). Model RED suites: tests/p15a1-shared-market.test.ts,
// tests/p15a2-power-ranking.test.ts (landed; same per-leaf dynamic-import
// pattern reused here).
//
// SCOPE: Wave 1 only — the pure law as a function of explicit `LegacyFacts`.
// NO GameState anywhere in this file (per brief PITFALLS): every fixture below
// is a hand-built plain-data fact object, never `generateWorld`/`tick`/a save.
//
// RED-BY-DESIGN: `src/core/campaignLegacy.ts` does not exist yet. Every leaf
// below dynamic-imports the module first (`loadCampaignLegacy()` + `requireFn`/
// `requireValue`), so each leaf fails RED for the MODULE-MISSING reason before
// any of its own fixture-specific assertions run (1346-C precedent, reused
// verbatim from tests/p15a2-power-ranking.test.ts's header rationale). The one
// partial exception is RED 17 (`tuning-legacy-bounded-terms`), which imports
// the real, already-existing `src/core/tuning.js` and gets a genuine
// value-mismatch RED reason (the LEGACY_* keys are simply absent from today's
// TUNING object) instead of a module-load failure — exactly as
// POWER_RANKING_*'s own TUNING leaf did in 1351-C.
//
// PARENT API DECISIONS (this file imports exactly these from
// src/core/campaignLegacy.ts, per the brief):
//   CAMPAIGN_LEGACY_DEFINITION, LEGACY_BOUNDARY_WEEK, LEGACY_BOUNDS,
//   LEGACY_ARCHETYPE_IDS, LEGACY_LENS_IDS, buildLegacyManifest, freezeLegacy.
// `LegacyFacts` was this file's PROPOSAL at 1353-C; the parent has now ADOPTED
// it, with the five 1353-F2 amendments above, in
// $E/1353-F2-parent-rulings-on-1353-C.md. It governs this revision and
// production.
//
// EXPECTED VALUES: every non-trivial number is derived by hand in a comment at
// its call site, from the formula text in 1353-A §5.3 as amended by 1353-F,
// never imported from production (none exists yet).

import { describe, expect, it } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { TUNING } from '../src/core/tuning.js'

// ── module loading (per-leaf attributed failure; see header) ──────────────
async function loadCampaignLegacy(): Promise<Record<string, unknown>> {
  return (await import('../src/core/campaignLegacy.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/campaignLegacy.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}

function requireValue(mod: Record<string, unknown>, name: string): unknown {
  if (!(name in mod)) {
    throw new Error(`RED: src/core/campaignLegacy.ts does not export a binding named '${name}'.`)
  }
  return mod[name]
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(value as object).sort()) out[k] = canonicalize((value as Record<string, unknown>)[k])
    return out
  }
  return value
}
function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

// ── PROPOSED LegacyFacts shape (this file's proposal; see handback) ───────
// Public facts only: no rival cash, cost or revenue field anywhere. Derived
// strictly from 1353-A §5.1-§5.4 as amended. See the handback's "Proposed
// LegacyFacts" section for the field-by-field rationale.
type Genre = 'comedy' | 'drama' | 'crime' | 'romance' | 'horror' | 'adventure'
type Standing = { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }

type LegacyCredit = { talentId: string; role: string }

// 1353-F2 §1: the pure law has no role flag, so it cannot tell a player film
// from a rival film. The adapter tags each row with its source domain instead
// -- data provenance, not a role -- so a manifest ref `{domainId, id}` can name
// the exact v1 domain a caller should look it up in (RED 10).
type PlayerOrIndustryFilmDomain = 'playerFilms' | 'industryFilms'
type PlayerOrIndustryCareerEventDomain = 'playerCareerEvents' | 'industryCareerEvents'

type LegacyFilmFact = {
  filmId: string
  studioId: string
  domainId: PlayerOrIndustryFilmDomain
  provenance: 'campaign' | 'authored'
  releaseWeek: number | null // null only for 'authored' (pre-1920, no absolute week)
  genre: Genre // fallback genre: authored film's own genre; campaign film's concept genre
  criticScore: number
  audienceScore: number | null // authored only; campaign films read their score off careerEvents
  status: 'settled' | 'inRun'
  settledWeek: number | null
  grossSettled: number | null // null while inRun; never a mid-run running total
  credits: LegacyCredit[] // authored: direct; campaign: [] (credits live on careerEvents)
}

type LegacyCareerEventFact = {
  eventId: string
  filmId: string
  talentId: string
  domainId: PlayerOrIndustryCareerEventDomain
  role: string
  releaseWeek: number
  genre: Genre
  audienceScore: number
}

type LegacyAdoptionFact = {
  adoptionId: string
  studioId: string
  technologyId: string
  operationalWeek: number | null
  cancelledWeek: number | null
}

type LegacyTechnologyFact = { technologyId: string; commercialWeek: number }

type LegacyConditionEventFact = { eventId: string; studioId: string; week: number; from: string; to: string }
// A1 (1359-A §3.3 / 1355-F2 item 5): the fact gains its own recordId (annex
// D.7 forbids a week-only id); the ref cites recordId, never a week-derived
// string. Production mints `power-ranking-<p15DomainSequence>`; this pure-law
// fixture uses plain ids like 'PR-6240' so the r3 leaf at patch :715 (this
// file's periodic-snapshot-window leaf) keeps its `.includes('6240')` meaning.
type LegacyRankingSnapshotFact = { recordId: string; week: number; studioId: string; rank: number | null; band: string }
// A2 (1359-A §3.3): the fact gains `week`, so the law cuts market rows at B
// like every other domain (otherwise the adapter alone would do the cutting).
type LegacyMarketAssessmentFact = { assessmentId: string; studioId: string; week: number; assessed: boolean; underPressure: boolean }

type LegacyDomainFact = { domainId: string; highWatermark: number; recordedFromWeek: number | null }

type LegacyStudioFact = {
  studioId: string
  row: number
  enteredWeek: number | null
  closedWeek: number | null
  standing: Standing
}

type LegacyFacts = {
  boundaryWeek: number
  // PROBE-B D1 / 1353-F4 ruling: a required top-level baseMarketValue, finite
  // and positive (RankingInput.baseMarketValue precedent, powerRanking.ts:53).
  baseMarketValue: number
  studios: LegacyStudioFact[]
  films: LegacyFilmFact[]
  careerEvents: LegacyCareerEventFact[]
  adoptions: LegacyAdoptionFact[]
  technologies: LegacyTechnologyFact[]
  domains: LegacyDomainFact[]
  conditionEvents?: LegacyConditionEventFact[]
  rankingSnapshots?: LegacyRankingSnapshotFact[]
  marketAssessments?: LegacyMarketAssessmentFact[]
}

// The 11 v1 domains (1353-A §5.2). `awards` is never in `facts.domains` (always notRecorded).
const V1_DOMAIN_IDS = [
  'playerFilms', 'industryFilms', 'playerRuns', 'playerCareerEvents', 'industryCareerEvents',
  'technologyAdoptions', 'technologyCatalogue', 'powerRanking', 'corporateCondition',
  'marketAssessments',
] as const // 10 named + 'awards' (never present) = 11 domains named in §5.2; 16 is the annex bound, not today's count.

function domainFact(domainId: string, overrides: Partial<LegacyDomainFact> = {}): LegacyDomainFact {
  return { domainId, highWatermark: 1000, recordedFromWeek: 0, ...overrides }
}

function allV1DomainsComplete(): LegacyDomainFact[] {
  return V1_DOMAIN_IDS.map((id) => domainFact(id))
}

function studioFact(overrides: Partial<LegacyStudioFact> & { studioId: string }): LegacyStudioFact {
  return {
    row: 0,
    enteredWeek: 0,
    closedWeek: null,
    standing: { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 },
    ...overrides,
  }
}

// OPEN-19 (1353-F4, changed): settledWeek < releaseWeek refuses (no real run
// settles before it opens), so this fixture's DEFAULT settledWeek must derive
// from the FINAL releaseWeek the caller supplies, never a fixed literal -- a
// hardcoded '10' broke the moment any caller overrode releaseWeek above 10
// (nearly every N-1/N and archetype-edge leaf in this file does). Authored
// films carry releaseWeek: null, for which this rule never applies; they keep
// the old fixed default so their unrelated settled/grossSettled validation
// still passes with no caller change.
function defaultSettledWeek(releaseWeek: number | null | undefined): number {
  const week = releaseWeek === undefined ? 10 : releaseWeek
  return week === null ? 10 : week + 10
}

function filmFact(overrides: Partial<LegacyFilmFact> & { filmId: string; studioId: string }): LegacyFilmFact {
  return {
    domainId: 'industryFilms', // arbitrary consistent default; 'playerFilms' used explicitly where the leaf cares
    provenance: 'campaign',
    releaseWeek: 10,
    genre: 'comedy',
    criticScore: 50,
    audienceScore: null,
    status: 'settled',
    settledWeek: defaultSettledWeek(overrides.releaseWeek),
    grossSettled: 0,
    credits: [],
    ...overrides,
  }
}

function careerEventFact(
  overrides: Partial<LegacyCareerEventFact> & { filmId: string; talentId: string },
): LegacyCareerEventFact {
  return {
    eventId: `${overrides.filmId}:${overrides.talentId}`,
    domainId: 'industryCareerEvents', // see filmFact's default note
    role: 'director',
    releaseWeek: 10,
    genre: 'comedy',
    audienceScore: 50,
    ...overrides,
  }
}

function adoptionFact(
  overrides: Partial<LegacyAdoptionFact> & { adoptionId: string; studioId: string; technologyId: string },
): LegacyAdoptionFact {
  return { operationalWeek: null, cancelledWeek: null, ...overrides }
}

const SYNC_SOUND: LegacyTechnologyFact = { technologyId: 'synchronized-sound', commercialWeek: 416 }
const LIGHTING: LegacyTechnologyFact = { technologyId: 'lighting-control-01', commercialWeek: 936 }

function baseFacts(overrides: Partial<LegacyFacts> = {}): LegacyFacts {
  return {
    boundaryWeek: 6240,
    baseMarketValue: BMV, // PROBE-B D1
    studios: [],
    films: [],
    careerEvents: [],
    adoptions: [],
    technologies: [SYNC_SOUND, LIGHTING],
    domains: allV1DomainsComplete(),
    ...overrides,
  }
}

function archetype(manifest: any, studioId: string, archetypeId: string): any {
  const studio = manifest.studios.find((s: any) => s.studioId === studioId)
  if (!studio) throw new Error(`fixture error: no studio ${studioId} in manifest`)
  const result = studio.archetypes.find((a: any) => a.archetypeId === archetypeId)
  if (!result) throw new Error(`fixture error: no archetype ${archetypeId} on studio ${studioId}`)
  return result
}

function lens(manifest: any, studioId: string, lensId: string): any {
  const studio = manifest.studios.find((s: any) => s.studioId === studioId)
  if (!studio) throw new Error(`fixture error: no studio ${studioId} in manifest`)
  const result = studio.lenses.find((l: any) => l.lensId === lensId)
  if (!result) throw new Error(`fixture error: no lens ${lensId} on studio ${studioId}`)
  return result
}

// 1353-A §5.5's TUNING values as retuned by 1353-T and 1353-F6 (critic 60, hit line 49, share floor 20),
// restated here (never imported from production); used to derive every fixture's expected outcome by hand.
const LEGACY_CRITIC_ACCLAIM_MIN = 60
const LEGACY_CRITIC_PAN_BELOW = 35
const LEGACY_AUDIENCE_LIKED_MIN = 57
const LEGACY_MIN_FILMS = 5
const LEGACY_MIN_SHARE_PERCENT = 20
const LEGACY_HIT_REACH_PERCENT = 49
const LEGACY_FLOP_REACH_PERCENT = 30
const LEGACY_AUDIENCE_MIN_DECADES = 4
const LEGACY_DECADE_MIN_RELEASES = 2
const LEGACY_PIONEER_WEEKS = 52
const LEGACY_TECH_LATE_WEEKS = 260
const LEGACY_FOUNDRY_MIN_PEOPLE = 3
const LEGACY_FOUNDRY_MIN_CREDITS = 10
const LEGACY_FOUNDRY_SETTLE_WEEKS = 260
const LEGACY_GENRE_MIN_FILMS = 8
const BMV = 1_000_000 // baseMarketValue, an arbitrary but fixed fixture constant

// ═══════════════════════════════════════════════════════════════════════
// A. module surface: definition, boundary week, bounds, id lists
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: module surface (1353-A §5.1/§5.2, PARENT API DECISIONS)', () => {
  it('campaign-legacy-definition-version-export', async () => {
    const mod = await loadCampaignLegacy()
    expect(requireValue(mod, 'CAMPAIGN_LEGACY_DEFINITION')).toBe('campaign-legacy/v2')
  })

  it('legacy-boundary-week', async () => {
    // RED 1. B = (2040-1920)*52 = 120*52 = 6240 (1353-A §5.1; confirmed Q1 by
    // 1353-B/1353-F). campaignDate's own behaviour at 6239/6240 is already
    // real production (src/core/calendar.ts, landed) and is not re-asserted
    // here as a RED fact; this leaf's RED reason is the missing module below.
    const mod = await loadCampaignLegacy()
    expect(requireValue(mod, 'LEGACY_BOUNDARY_WEEK')).toBe(6240)
    const freezeLegacy = requireFn<(root: any, producedWeek: number, facts: LegacyFacts) => any>(mod, 'freezeLegacy')
    const emptyRoot = { version: 1, recordedFromWeek: 0, official: null, endOfRun: null }
    // Freeze fires ONLY at produced week 6240, never one week either side.
    expect(freezeLegacy(emptyRoot, 6239, baseFacts()).official).toBeNull()
    expect(freezeLegacy(emptyRoot, 6241, baseFacts()).official).toBeNull()
    expect(freezeLegacy(emptyRoot, 6240, baseFacts()).official).not.toBeNull()
  })

  it('legacy-bounds-constants', async () => {
    const mod = await loadCampaignLegacy()
    expect(requireValue(mod, 'LEGACY_BOUNDS')).toEqual({ domains: 16, archetypes: 8, refsPerSide: 12, lenses: 12 })
    const archetypeIds = requireValue(mod, 'LEGACY_ARCHETYPE_IDS') as string[]
    const lensIds = requireValue(mod, 'LEGACY_LENS_IDS') as string[]
    // Roadmap §18's eight, in 1353-A §5.3's table order (1353-B2 confirmed the
    // set; the parent's export order is this file's own reasonable reading of
    // "in that order" from the brief, restated here so a reorder is RED too).
    expect(archetypeIds).toEqual([
      'artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
      'talent-foundry', 'genre-specialist', 'resilient-survivor', 'awards-dynasty',
    ])
    expect(archetypeIds.length).toBe(8) // = LEGACY_BOUNDS.archetypes exactly: a 9th is structurally impossible
    // v1 ships 8 of the annex's 12 lens slots (1353-A §5.4), in that section's order.
    expect(lensIds).toEqual([
      'catalog', 'people', 'technology', 'ranking', 'financialBand', 'market', 'resilience', 'awards',
    ])
    expect(lensIds.length).toBeLessThanOrEqual(12) // v1's 8 <= the annex's 12; a 13th is structurally impossible for v1
  })
})

// ═══════════════════════════════════════════════════════════════════════
// B. the cut (RED 2) and in-run-at-boundary treatment (RED 3)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: the boundary cut (1353-A §5.1, RED 2)', () => {
  it('legacy-boundary-cut-film-before-and-at-b', async () => {
    // A film released at B-1=6239 is inside; one released AT B=6240 is outside
    // (1353-A §5.1: "A fact is inside when its effective week is below B").
    // Both films are acclaimed (critic 70 >= LEGACY_CRITIC_ACCLAIM_MIN=60), so
    // artistic-voice's qualifyingCount directly observes whether the cut ran:
    // 1 if F-OUT was correctly excluded from n entirely, 2 if the cut leaked.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod,
      'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S1' })],
      films: [
        filmFact({ filmId: 'F-IN', studioId: 'S1', releaseWeek: 6239, criticScore: LEGACY_CRITIC_ACCLAIM_MIN + 10, genre: 'comedy' }),
        filmFact({ filmId: 'F-OUT', studioId: 'S1', releaseWeek: 6240, criticScore: LEGACY_CRITIC_ACCLAIM_MIN + 10, genre: 'comedy' }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const voice = archetype(manifest, 'S1', 'artistic-voice')
    expect(voice.qualifyingCount).toBe(1) // only F-IN; F-OUT (at B, not below B) never enters n
    expect(voice.qualifying.map((r: any) => r.id)).toEqual(['F-IN'])
    expect(JSON.stringify(manifest)).not.toContain('F-OUT')
  })

  it('legacy-boundary-cut-periodic-snapshot-window', async () => {
    // "A periodic snapshot is inside when its window ends at or before B: the
    // 6240 ranking is inside, 6253 is not" (1353-A §5.1, restating W0 §1's
    // [6188,6240) window fact). Two power-ranking-archive snapshots for the
    // same studio: one AT week 6240 (inside), one at 6253 (outside).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod,
      'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S1' })],
      rankingSnapshots: [
        { recordId: 'PR-6240', week: 6240, studioId: 'S1', rank: 1, band: 'stable' }, // A1
        { recordId: 'PR-6253', week: 6253, studioId: 'S1', rank: 1, band: 'stable' }, // A1
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const ranking = lens(manifest, 'S1', 'ranking')
    expect(ranking.refs.some((r: any) => r.id.includes('6240'))).toBe(true)
    expect(ranking.refs.some((r: any) => r.id.includes('6253'))).toBe(false)
    expect(JSON.stringify(ranking)).not.toContain('6253')
  })
})

describe('p15c1 campaign legacy: in-run-at-boundary treatment (1353-A §5.1, RED 3)', () => {
  it('legacy-in-run-at-boundary-counts-critic-not-commercial', async () => {
    // A film released at 6235 (>= 6188, "in run at B" per 1353-A §5.1) and
    // still running at B: counts in the catalog/critic/audience/genre/foundry
    // rules, never in commercial engine, and no gross of it enters the
    // manifest. F-RUN: inRun, critic=90 (acclaimed). F-OTHER: settled long
    // ago, critic=20 (not acclaimed), gross=500 (a flop: 500 < 30%*BMV).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod,
      'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S1' })],
      films: [
        filmFact({
          filmId: 'F-RUN', studioId: 'S1', releaseWeek: 6235, criticScore: 90, genre: 'comedy',
          status: 'inRun', settledWeek: null, grossSettled: null,
        }),
        filmFact({
          filmId: 'F-OTHER', studioId: 'S1', releaseWeek: 100, criticScore: LEGACY_CRITIC_PAN_BELOW - 15, genre: 'drama',
          status: 'settled', settledWeek: 100, grossSettled: 500,
        }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    // Critic pool (artistic-voice): F-RUN counts (a=1: only F-RUN is acclaimed).
    const voice = archetype(manifest, 'S1', 'artistic-voice')
    expect(voice.qualifyingCount).toBe(1)
    expect(voice.qualifying.map((r: any) => r.id)).toEqual(['F-RUN'])
    // Commercial engine: F-RUN is excluded from `s` (settled) entirely, so it
    // can be neither a hit nor a flop; only F-OTHER (settled, a flop) is seen.
    const engine = archetype(manifest, 'S1', 'commercial-engine')
    expect(engine.qualifyingCount).toBe(0) // no hits: F-OTHER is a flop, F-RUN excluded
    expect(engine.contraryCount).toBe(1) // F-OTHER only
    expect(engine.contrary.map((r: any) => r.id)).toEqual(['F-OTHER'])
    expect(JSON.stringify(engine)).not.toContain('F-RUN')
    // No gross of an in-run film may ever enter the manifest: a malformed fact
    // that leaks a non-null grossSettled on an inRun film is invalid input.
    const leaked = baseFacts({
      studios: [studioFact({ studioId: 'S2' })],
      films: [
        filmFact({
          filmId: 'F-LEAK', studioId: 'S2', releaseWeek: 6235, status: 'inRun',
          settledWeek: null, grossSettled: 123_456, // malformed: inRun must never carry a gross
        }),
      ],
    })
    expect(() => buildLegacyManifest(leaked, 'official2040')).toThrow()
  })
})

// helper: `count` campaign films for `studioId`, each crediting `talentId` on
// a `role`, first release at `startWeek`, spaced 20 weeks apart (well inside
// one decade unless the caller overrides `startWeek`/spacing needs).
function creditedCampaign(
  studioId: string, talentId: string, role: string, count: number, startWeek: number, filmPrefix: string,
): { films: LegacyFilmFact[]; careerEvents: LegacyCareerEventFact[] } {
  const films: LegacyFilmFact[] = []
  const careerEvents: LegacyCareerEventFact[] = []
  for (let i = 0; i < count; i++) {
    const filmId = `${filmPrefix}-${i}`
    const releaseWeek = startWeek + i * 20
    films.push(filmFact({ filmId, studioId, releaseWeek, criticScore: 50, genre: 'comedy' }))
    careerEvents.push(careerEventFact({ filmId, talentId, role, releaseWeek, genre: 'comedy', audienceScore: 50 }))
  }
  return { films, careerEvents }
}

// ═══════════════════════════════════════════════════════════════════════
// C. archetype edges (RED 4): N-1/N, share-exact, pioneer +-1 week windows,
// a cancelled adoption, a foundry authored credit and a shared first week.
// (The "exactly half liked"/"exactly half genre"/"mid-decade entrant"/"own
// earliest adoption" amendment edges get their OWN dedicated leaves below,
// per the brief's "one leaf per §5.3 amendment edge".)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: archetype edges (1353-A §8 item 4)', () => {
  it('legacy-archetype-edges-artistic-voice-min-films-n-minus-1-vs-n', async () => {
    // LEGACY_MIN_FILMS=5. a=4 (N-1): notHeld regardless of share. a=5 (N): held.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const acclaimed = (studioId: string, n: number) =>
      Array.from({ length: n }, (_, i) =>
        filmFact({ filmId: `${studioId}-F${i}`, studioId, releaseWeek: 10 + i * 20, criticScore: 90 }))
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-N1' }), studioFact({ studioId: 'S-N' })],
      films: [...acclaimed('S-N1', LEGACY_MIN_FILMS - 1), ...acclaimed('S-N', LEGACY_MIN_FILMS)],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'S-N1', 'artistic-voice').outcome).toBe('notHeld')
    expect(archetype(manifest, 'S-N1', 'artistic-voice').qualifyingCount).toBe(LEGACY_MIN_FILMS - 1)
    expect(archetype(manifest, 'S-N', 'artistic-voice').outcome).toBe('held')
    expect(archetype(manifest, 'S-N', 'artistic-voice').qualifyingCount).toBe(LEGACY_MIN_FILMS)
  })

  // 1353-D note / 1353-F3 §2: RED item 4's "N-1 against N" closed for every
  // MIN-style threshold, not just artistic-voice's LEGACY_MIN_FILMS.
  it('legacy-archetype-edges-audience-institution-min-decades-n-minus-1-vs-n', async () => {
    // LEGACY_AUDIENCE_MIN_DECADES=4. Each decade: 2 liked releases (audienceScore
    // 80 >= 57), well clear of the "exactly half" edge (covered by amendment-1).
    // S-N1: 3 audience decades (192/193/194) -> notHeld. S-N: 4 (192/193/194/195) -> held.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const decadeWeeks = [[10, 20], [530, 540], [1060, 1070], [1580, 1590]] // 192, 193, 194, 195
    const buildDecades = (studioId: string, decadeCount: number) => {
      const films: LegacyFilmFact[] = []
      const careerEvents: LegacyCareerEventFact[] = []
      for (let d = 0; d < decadeCount; d++) {
        for (const [i, week] of decadeWeeks[d]!.entries()) {
          const filmId = `${studioId}-D${d}-${i}`
          films.push(filmFact({ filmId, studioId, releaseWeek: week }))
          careerEvents.push(careerEventFact({ filmId, talentId: `${studioId}-T`, releaseWeek: week, audienceScore: 80 }))
        }
      }
      return { films, careerEvents }
    }
    const n1 = buildDecades('AI-N1', 3)
    const n = buildDecades('AI-N', 4)
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'AI-N1' }), studioFact({ studioId: 'AI-N' })],
      films: [...n1.films, ...n.films],
      careerEvents: [...n1.careerEvents, ...n.careerEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'AI-N1', 'audience-institution').outcome).toBe('notHeld')
    expect(archetype(manifest, 'AI-N', 'audience-institution').outcome).toBe('held')
  })

  it('legacy-archetype-edges-genre-specialist-min-films-n-minus-1-vs-n', async () => {
    // LEGACY_GENRE_MIN_FILMS=8, all one genre so majority is never in doubt --
    // isolating the `n` threshold itself. S-N1: n=7 (n<8, notHeld regardless of
    // majority). S-N: n=8 (2*8=16>8, held).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const allComedy = (studioId: string, n: number) =>
      Array.from({ length: n }, (_, i) => filmFact({ filmId: `${studioId}-F${i}`, studioId, releaseWeek: 10 + i * 20, genre: 'comedy' }))
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'GS-N1' }), studioFact({ studioId: 'GS-N' })],
      films: [...allComedy('GS-N1', LEGACY_GENRE_MIN_FILMS - 1), ...allComedy('GS-N', LEGACY_GENRE_MIN_FILMS)],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'GS-N1', 'genre-specialist').outcome).toBe('notHeld')
    expect(archetype(manifest, 'GS-N', 'genre-specialist').outcome).toBe('held')
  })

  it('legacy-archetype-edges-commercial-engine-min-films-n-minus-1-vs-n', async () => {
    // LEGACY_MIN_FILMS=5 (h, the hit count). S-N1: h=4 settled hits (54% BMV
    // each) -> h<5, notHeld even though share (100*4/4=100%) is fine. S-N: h=5 -> held.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const hits = (studioId: string, n: number) =>
      Array.from({ length: n }, (_, i) =>
        filmFact({
          filmId: `${studioId}-F${i}`, studioId, releaseWeek: 10 + i * 20,
          status: 'settled', settledWeek: 10 + i * 20, grossSettled: ((LEGACY_HIT_REACH_PERCENT + 5) / 100) * BMV,
        }))
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'CE-N1' }), studioFact({ studioId: 'CE-N' })],
      films: [...hits('CE-N1', LEGACY_MIN_FILMS - 1), ...hits('CE-N', LEGACY_MIN_FILMS)],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'CE-N1', 'commercial-engine').outcome).toBe('notHeld')
    expect(archetype(manifest, 'CE-N', 'commercial-engine').outcome).toBe('held')
  })

  it('legacy-archetype-edges-talent-foundry-min-people-n-minus-1-vs-n', async () => {
    // LEGACY_FOUNDRY_MIN_PEOPLE=3, each discovery independently satisfying
    // LEGACY_FOUNDRY_MIN_CREDITS=10 so only the PEOPLE count is under test.
    // TF-N1: 2 discoveries -> notHeld. TF-N: 3 discoveries -> held.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const n1a = creditedCampaign('TF-N1', 'TF-N1-P1', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'TFN1A')
    const n1b = creditedCampaign('TF-N1', 'TF-N1-P2', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 500, 'TFN1B')
    const nA = creditedCampaign('TF-N', 'TF-N-P1', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'TFNA')
    const nB = creditedCampaign('TF-N', 'TF-N-P2', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 500, 'TFNB')
    const nC = creditedCampaign('TF-N', 'TF-N-P3', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 1000, 'TFNC')
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'TF-N1' }), studioFact({ studioId: 'TF-N' })],
      films: [...n1a.films, ...n1b.films, ...nA.films, ...nB.films, ...nC.films],
      careerEvents: [...n1a.careerEvents, ...n1b.careerEvents, ...nA.careerEvents, ...nB.careerEvents, ...nC.careerEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'TF-N1', 'talent-foundry').outcome).toBe('notHeld')
    expect(archetype(manifest, 'TF-N1', 'talent-foundry').qualifyingCount).toBe(2)
    expect(archetype(manifest, 'TF-N', 'talent-foundry').outcome).toBe('held')
    expect(archetype(manifest, 'TF-N', 'talent-foundry').qualifyingCount).toBe(3)
  })

  it('legacy-archetype-edges-artistic-voice-share-exactly-at-threshold', async () => {
    // a=5 acclaimed (critic 90) + padding non-acclaimed (critic 50) releases.
    // S-EXACT: n=25 -> 100*5=500 = 20*25=500 (exact equality) -> held.
    // S-BELOW: n=26 -> 100*5=500 < 20*26=520 -> notHeld (one padding film more).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const build = (studioId: string, padding: number) => {
      const acclaimed = Array.from({ length: LEGACY_MIN_FILMS }, (_, i) =>
        filmFact({ filmId: `${studioId}-A${i}`, studioId, releaseWeek: 10 + i * 20, criticScore: 90 }))
      const pad = Array.from({ length: padding }, (_, i) =>
        filmFact({ filmId: `${studioId}-P${i}`, studioId, releaseWeek: 2000 + i * 20, criticScore: 50 }))
      return [...acclaimed, ...pad]
    }
    // n at exact equality: 100*LEGACY_MIN_FILMS = LEGACY_MIN_SHARE_PERCENT*n
    // -> n = 100*LEGACY_MIN_FILMS/LEGACY_MIN_SHARE_PERCENT = 100*5/20 = 25.
    const nExact = (100 * LEGACY_MIN_FILMS) / LEGACY_MIN_SHARE_PERCENT
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-EXACT' }), studioFact({ studioId: 'S-BELOW' })],
      films: [...build('S-EXACT', nExact - LEGACY_MIN_FILMS), ...build('S-BELOW', nExact - LEGACY_MIN_FILMS + 1)],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'S-EXACT', 'artistic-voice').outcome).toBe('held')
    expect(archetype(manifest, 'S-BELOW', 'artistic-voice').outcome).toBe('notHeld')
  })

  it('legacy-archetype-edges-technology-pioneer-plus52-qualifies-plus53-does-not', async () => {
    // commercialWeek(synchronized-sound)=416. +52=468 (LEGACY_PIONEER_WEEKS):
    // operational AT 468 qualifies ("by" = inclusive); operational at 469 (+53)
    // does not -- and 469 is nowhere near late (416+260=676), so it also earns
    // no contrary: a genuine "middle" adopter, neither pioneer nor laggard.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-P52' }), studioFact({ studioId: 'S-P53' })],
      adoptions: [
        adoptionFact({ adoptionId: 'A-P52', studioId: 'S-P52', technologyId: 'synchronized-sound', operationalWeek: 416 + LEGACY_PIONEER_WEEKS }),
        adoptionFact({ adoptionId: 'A-P53', studioId: 'S-P53', technologyId: 'synchronized-sound', operationalWeek: 416 + LEGACY_PIONEER_WEEKS + 1 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const p52 = archetype(manifest, 'S-P52', 'technology-pioneer')
    expect(p52.outcome).toBe('held')
    expect(p52.qualifying.map((r: any) => r.id)).toEqual(['A-P52'])
    const p53 = archetype(manifest, 'S-P53', 'technology-pioneer')
    expect(p53.outcome).toBe('notHeld')
    expect(p53.qualifyingCount).toBe(0)
    // PROBE-B D2 (1353-F4 ruling): every enteredWeek:0 studio in baseFacts was
    // entered when lighting control became commercial (week 936), so a studio
    // with no lighting adoption carries the contrary technology-id ref too.
    // S-P53 is a sync-sound middle adopter (neither pioneer nor late) but
    // never adopts lighting at all -> exactly one contrary, the tech id.
    expect(p53.contraryCount).toBe(1)
    expect(p53.contrary.map((r: any) => r.id)).toEqual(['lighting-control-01'])
  })

  it('legacy-archetype-edges-technology-pioneer-late-plus260-no-plus261-yes', async () => {
    // "later than commercialWeek + LEGACY_TECH_LATE_WEEKS" is a STRICT >.
    // 416+260=676 exactly: not late. 677: late (contrary = the adoption ID).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-L260' }), studioFact({ studioId: 'S-L261' })],
      adoptions: [
        adoptionFact({ adoptionId: 'A-L260', studioId: 'S-L260', technologyId: 'synchronized-sound', operationalWeek: 416 + LEGACY_TECH_LATE_WEEKS }),
        adoptionFact({ adoptionId: 'A-L261', studioId: 'S-L261', technologyId: 'synchronized-sound', operationalWeek: 416 + LEGACY_TECH_LATE_WEEKS + 1 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    // PROBE-B D2: both studios also never adopt lighting-control-01 (commercial
    // at 936, and each was entered at week 0), so each carries that technology
    // id as an additional contrary alongside its own sync-sound result.
    const l260 = archetype(manifest, 'S-L260', 'technology-pioneer')
    expect(l260.contraryCount).toBe(1) // lighting only: L260's own sync-sound adoption is on time, not late
    expect(l260.contrary.map((r: any) => r.id)).toEqual(['lighting-control-01'])
    const l261 = archetype(manifest, 'S-L261', 'technology-pioneer')
    expect(l261.contraryCount).toBe(2)
    expect(l261.contrary.map((r: any) => r.id).sort()).toEqual(['A-L261', 'lighting-control-01'])
  })

  it('legacy-archetype-edges-technology-pioneer-cancelled-adoption-excluded', async () => {
    // A cancelled adoption is never a pioneer AND is skipped when locating "S's
    // own earliest operational, non-cancelled adoption" for the contrary ref
    // (amendment 4). With no other adoption, S falls to "no operational
    // adoption before B": contrary = the TECHNOLOGY's own ID, never the
    // cancelled adoption's ID.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-CANCEL' })],
      adoptions: [
        adoptionFact({ adoptionId: 'A-CANCELLED', studioId: 'S-CANCEL', technologyId: 'synchronized-sound', operationalWeek: null, cancelledWeek: 500 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const result = archetype(manifest, 'S-CANCEL', 'technology-pioneer')
    expect(result.qualifyingCount).toBe(0)
    // PROBE-B D2: S-CANCEL also never adopts lighting-control-01 (entered week
    // 0, commercial at 936) -> a second contrary, the lighting technology id.
    expect(result.contraryCount).toBe(2)
    expect(result.contrary.map((r: any) => r.id).sort()).toEqual(['lighting-control-01', 'synchronized-sound'])
    expect(JSON.stringify(result)).not.toContain('A-CANCELLED')
  })

  it('legacy-archetype-edges-talent-foundry-authored-credit-never-a-discovery', async () => {
    // P1's first-ever credit is on an AUTHORED film -> never a discovery of any
    // studio, even with 10 later campaign credits with S. Control: P2 has no
    // authored credit and the same 10 campaign credits -> IS a discovery.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const p1Campaign = creditedCampaign('S', 'P1', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'P1FILM')
    const p2Campaign = creditedCampaign('S', 'P2', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'P2FILM')
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({
          filmId: 'AUTHORED-P1', studioId: 'S', provenance: 'authored', releaseWeek: null,
          credits: [{ talentId: 'P1', role: 'director' }],
        }),
        ...p1Campaign.films, ...p2Campaign.films,
      ],
      careerEvents: [...p1Campaign.careerEvents, ...p2Campaign.careerEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const foundry = archetype(manifest, 'S', 'talent-foundry')
    expect(foundry.qualifyingCount).toBe(1) // only P2
    expect(JSON.stringify(foundry)).not.toContain('P1')
    expect(JSON.stringify(foundry)).toContain('P2')
  })

  it('legacy-archetype-edges-talent-foundry-shared-first-week-counts-for-each-studio', async () => {
    // P3's very first-ever credit is a TIE: S_A and S_B each release a film
    // crediting P3 in the SAME week. "A shared first week counts for each
    // studio" -> P3 is a discovery of BOTH S_A and BOTH S_B, each needing its
    // own 10 credits with P3 to fully qualify.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const aCampaign = creditedCampaign('S-A', 'P3', 'director', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'SAFILM')
    const bCampaign = creditedCampaign('S-B', 'P3', 'lead', LEGACY_FOUNDRY_MIN_CREDITS, 10, 'SBFILM')
    // Both campaigns' first film is at week 10 (the tie); later weeks diverge
    // by construction (creditedCampaign spaces at +20/week from the same start,
    // so both series share week 10 exactly and diverge from index 1 onward).
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-A' }), studioFact({ studioId: 'S-B' })],
      films: [...aCampaign.films, ...bCampaign.films],
      careerEvents: [...aCampaign.careerEvents, ...bCampaign.careerEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'S-A', 'talent-foundry').qualifyingCount).toBe(1)
    expect(JSON.stringify(archetype(manifest, 'S-A', 'talent-foundry'))).toContain('P3')
    expect(archetype(manifest, 'S-B', 'talent-foundry').qualifyingCount).toBe(1)
    expect(JSON.stringify(archetype(manifest, 'S-B', 'talent-foundry'))).toContain('P3')
  })

  it('legacy-archetype-edges-talent-foundry-one-credit-contrary-settle-weeks', async () => {
    // Contrary: "discoveries with one credit, first credited before
    // B - LEGACY_FOUNDRY_SETTLE_WEEKS, earliest first". P4 is discovered by S
    // at week 10 (its own first-ever credit, a campaign release of S) but
    // never gets a second credit anywhere -- and week 10 is far earlier than
    // B - LEGACY_FOUNDRY_SETTLE_WEEKS = 6240 - 260 = 5980, so P4 had ample
    // time to earn a second credit and didn't.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    expect(6240 - LEGACY_FOUNDRY_SETTLE_WEEKS).toBe(5980)
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [filmFact({ filmId: 'P4FILM-ONLY', studioId: 'S', releaseWeek: 10 })],
      careerEvents: [careerEventFact({ filmId: 'P4FILM-ONLY', talentId: 'P4', releaseWeek: 10, audienceScore: 50 })],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const foundry = archetype(manifest, 'S', 'talent-foundry')
    expect(foundry.qualifyingCount).toBe(0) // only 1 credit, never reaches LEGACY_FOUNDRY_MIN_CREDITS
    expect(foundry.contraryCount).toBeGreaterThanOrEqual(1)
    expect(JSON.stringify(foundry.contrary)).toContain('P4')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// D. notRecorded vs notHeld (RED 5)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: notRecorded vs notHeld (1353-A §8 item 5)', () => {
  it('legacy-not-recorded-resilient-survivor-without-condition-domain', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    // No `conditionEvents` key at all (P15B absent): resilient-survivor MUST
    // read notRecorded, never notHeld, even for a studio that later closes.
    const facts = baseFacts({ studios: [studioFact({ studioId: 'S', closedWeek: 1000 })] })
    expect('conditionEvents' in facts).toBe(false)
    const manifest = buildLegacyManifest(facts, 'official2040')
    const survivor = archetype(manifest, 'S', 'resilient-survivor')
    expect(survivor.outcome).toBe('notRecorded')
    expect(survivor.qualifyingCount).toBe(0)
    expect(survivor.contraryCount).toBe(0)
  })

  it('legacy-not-recorded-awards-dynasty-always-not-recorded-no-number', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [filmFact({ filmId: 'F1', studioId: 'S', criticScore: 99, grossSettled: BMV })],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const dynasty = archetype(manifest, 'S', 'awards-dynasty')
    expect(dynasty.outcome).toBe('notRecorded')
    expect(dynasty.qualifyingCount).toBe(0)
    expect(dynasty.contraryCount).toBe(0)
    expect(dynasty.qualifying).toEqual([])
    expect(dynasty.contrary).toEqual([])
  })

  it('legacy-not-recorded-closure-before-boundary-gives-not-held', async () => {
    // Domain PRESENT (the P15B condition stream exists) but the studio closed
    // before B with no recovery: notHeld, with the closure as a contrary ref.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S', closedWeek: 1000 })],
      conditionEvents: [{ eventId: 'CE-CLOSE', studioId: 'S', week: 1000, from: 'distress', to: 'closed' }],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const survivor = archetype(manifest, 'S', 'resilient-survivor')
    expect(survivor.outcome).toBe('notHeld')
    expect(survivor.contraryCount).toBeGreaterThanOrEqual(1)
    expect(survivor.contrary.map((r: any) => r.id)).toContain('CE-CLOSE')
  })
})

// helper: a studio that holds all 7 EVALUATED archetypes at once (awards-dynasty
// excluded: it is never evaluated in v1). 10 campaign releases across exactly
// LEGACY_AUDIENCE_MIN_DECADES=4 calendar decades (weeks chosen so
// floor((1920+floor(week/52))/10) lands in four distinct decade blocks), all
// acclaimed (critic 90) and hits (54% BMV, settled); 8 comedy + 2 drama (a
// genre-specialist majority); one on-time technology-pioneer adoption; three
// people (P1/P2/P3) each credited on all 10 films (talent-foundry); one
// distress -> recovery -> stable condition sequence with no closure
// (resilient-survivor).
const ALLSTAR_WEEKS = [10, 20, 25, 530, 540, 1060, 1070, 1580, 1590, 1595]
function buildAllStarFacts(studioId: string, row: number, peoplePrefix: string, filmPrefix: string) {
  const films: LegacyFilmFact[] = ALLSTAR_WEEKS.map((week, i) =>
    filmFact({
      filmId: `${filmPrefix}-${i}`, studioId, releaseWeek: week, criticScore: 90,
      grossSettled: ((LEGACY_HIT_REACH_PERCENT + 5) / 100) * BMV, status: 'settled', settledWeek: week,
      genre: i < 8 ? 'comedy' : 'drama',
    }))
  const people = [`${peoplePrefix}1`, `${peoplePrefix}2`, `${peoplePrefix}3`]
  const roles = ['director', 'lead', 'writer']
  const careerEvents: LegacyCareerEventFact[] = []
  films.forEach((f) => {
    people.forEach((talentId, pi) => {
      careerEvents.push(
        careerEventFact({
          filmId: f.filmId, talentId, role: roles[pi]!, releaseWeek: f.releaseWeek!,
          genre: f.genre, audienceScore: 80,
        }),
      )
    })
  })
  const adoptions: LegacyAdoptionFact[] = [
    adoptionFact({ adoptionId: `${filmPrefix}-ADOPT`, studioId, technologyId: 'synchronized-sound', operationalWeek: 426 }),
  ]
  const conditionEvents: LegacyConditionEventFact[] = [
    { eventId: `${filmPrefix}-CE1`, studioId, week: 100, from: 'stable', to: 'distress' },
    { eventId: `${filmPrefix}-CE2`, studioId, week: 120, from: 'distress', to: 'recovery' },
    { eventId: `${filmPrefix}-CE3`, studioId, week: 150, from: 'recovery', to: 'stable' },
  ]
  return { studio: studioFact({ studioId, row }), films, careerEvents, adoptions, conditionEvents }
}

// helper: a studio that holds NONE of the 7 evaluated archetypes: unacclaimed
// flops (critic 20, gross 5% BMV), an even genre split (no majority), no
// shared discoveries, no technology adoption, and a condition history that
// never reaches distress->stable.
function buildNoneFacts(studioId: string, row: number, filmPrefix: string) {
  const films: LegacyFilmFact[] = ALLSTAR_WEEKS.map((week, i) =>
    filmFact({
      filmId: `${filmPrefix}-${i}`, studioId, releaseWeek: week, criticScore: 20,
      grossSettled: ((LEGACY_FLOP_REACH_PERCENT - 25) / 100) * BMV, status: 'settled', settledWeek: week,
      genre: i < 5 ? 'comedy' : 'drama', // even 5/5 split: no majority
    }))
  // A distinct, single-credit talent per film: nobody ever reaches 10 credits.
  const careerEvents: LegacyCareerEventFact[] = films.map((f, i) =>
    careerEventFact({
      filmId: f.filmId, talentId: `${filmPrefix}-solo-${i}`, role: 'director',
      releaseWeek: f.releaseWeek!, genre: f.genre, audienceScore: 20, // not liked
    }))
  const conditionEvents: LegacyConditionEventFact[] = [
    { eventId: `${filmPrefix}-CE1`, studioId, week: 50, from: 'stable', to: 'warning' },
  ]
  return { studio: studioFact({ studioId, row }), films, careerEvents, adoptions: [] as LegacyAdoptionFact[], conditionEvents }
}

// ═══════════════════════════════════════════════════════════════════════
// E. coexistence, no winner (RED 6)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: coexistence, no winner, row order (1353-A §8 item 6)', () => {
  it('legacy-coexist-every-evaluated-archetype-held', async () => {
    // Sanity-check this fixture's own arithmetic against the §5.5 constants
    // before asserting against production: ALLSTAR_WEEKS must land in exactly
    // LEGACY_AUDIENCE_MIN_DECADES distinct calendar decades, each with at
    // least LEGACY_DECADE_MIN_RELEASES releases, and exactly
    // LEGACY_FOUNDRY_MIN_PEOPLE shared discoveries per studio (P1/P2/P3).
    const decadesOf = ALLSTAR_WEEKS.map((w) => Math.floor((1920 + Math.floor(w / 52)) / 10))
    const byDecade = new Map<number, number>()
    for (const d of decadesOf) byDecade.set(d, (byDecade.get(d) ?? 0) + 1)
    expect(byDecade.size).toBe(LEGACY_AUDIENCE_MIN_DECADES)
    for (const count of byDecade.values()) expect(count).toBeGreaterThanOrEqual(LEGACY_DECADE_MIN_RELEASES)
    expect(3).toBe(LEGACY_FOUNDRY_MIN_PEOPLE)

    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const a2 = buildAllStarFacts('ALLSTAR2', 1, 'P2-', 'A2FILM')
    const facts = baseFacts({
      studios: [a1.studio, a2.studio],
      films: [...a1.films, ...a2.films],
      careerEvents: [...a1.careerEvents, ...a2.careerEvents],
      adoptions: [...a1.adoptions, ...a2.adoptions],
      conditionEvents: [...a1.conditionEvents, ...a2.conditionEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const evaluated = [
      'artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
      'talent-foundry', 'genre-specialist', 'resilient-survivor',
    ]
    for (const studioId of ['ALLSTAR1', 'ALLSTAR2']) {
      for (const archetypeId of evaluated) {
        expect(archetype(manifest, studioId, archetypeId).outcome, `${studioId}/${archetypeId}`).toBe('held')
      }
      expect(archetype(manifest, studioId, 'awards-dynasty').outcome).toBe('notRecorded')
    }

    // 1353-D Defect 1 / 1353-F3 §1 (blocking): `qualifying` is capped to ONE
    // ref per audience decade, not one ref per liked film. ALLSTAR_WEEKS puts
    // three films in decade 192 (weeks 10/20/25) and three in decade 195
    // (weeks 1580/1590/1595) -- exactly the case that would expose a wrong
    // implementation pushing every liked release into `qualifying` instead of
    // just the best one. Hand derivation (all films in a decade share
    // audienceScore=80, so every within-decade tie is broken by "release
    // week, then film id" -- the earliest week wins as "best" in every decade
    // here, and there is no genuine score spread to test the score-ordering
    // half of the rule; that already comes from `amendment-1`'s two-film,
    // two-score decades):
    //   decade 192 (192=floor(1920/10)): weeks 10/20/25, ids A1FILM-0/1/2,
    //     all audienceScore 80 (tied) -> earliest week (10) wins -> A1FILM-0.
    //   decade 193: weeks 530/540, ids A1FILM-3/4, tied at 80 -> A1FILM-3.
    //   decade 194: weeks 1060/1070, ids A1FILM-5/6, tied at 80 -> A1FILM-5.
    //   decade 195: weeks 1580/1590/1595, ids A1FILM-7/8/9, tied at 80 ->
    //     earliest week (1580) wins -> A1FILM-7.
    // Exactly 4 qualifying refs (one per audience decade), never 10 (one per
    // liked film). Every decade here is an audience decade (all liked), so
    // there is no "other eligible decade" left to contribute a contrary ref:
    // contrary is correctly empty, not a missing case.
    const institution = archetype(manifest, 'ALLSTAR1', 'audience-institution')
    expect(institution.qualifying.length).toBe(LEGACY_AUDIENCE_MIN_DECADES) // 4, never 10
    expect(new Set(institution.qualifying.map((r: any) => r.id))).toEqual(
      new Set(['A1FILM-0', 'A1FILM-3', 'A1FILM-5', 'A1FILM-7']),
    )
    expect(institution.contrary).toEqual([]) // no other eligible (non-audience) decade exists here
  })

  it('legacy-coexist-no-studio-holds-any-evaluated-archetype', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const n1 = buildNoneFacts('NONE1', 0, 'N1FILM')
    const n2 = buildNoneFacts('NONE2', 1, 'N2FILM')
    const facts = baseFacts({
      studios: [n1.studio, n2.studio],
      films: [...n1.films, ...n2.films],
      careerEvents: [...n1.careerEvents, ...n2.careerEvents],
      adoptions: [],
      conditionEvents: [...n1.conditionEvents, ...n2.conditionEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const evaluated = [
      'artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
      'talent-foundry', 'genre-specialist', 'resilient-survivor',
    ]
    for (const studioId of ['NONE1', 'NONE2']) {
      for (const archetypeId of evaluated) {
        expect(archetype(manifest, studioId, archetypeId).outcome, `${studioId}/${archetypeId}`).toBe('notHeld')
      }
    }
  })

  it('legacy-coexist-schema-walk-no-score-total-rank-grade-winner-key', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const facts = baseFacts({
      studios: [a1.studio], films: a1.films, careerEvents: a1.careerEvents,
      adoptions: a1.adoptions, conditionEvents: a1.conditionEvents,
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const banned = new Set(['score', 'total', 'rank', 'grade', 'winner'])
    function walk(value: unknown) {
      if (Array.isArray(value)) { value.forEach(walk); return }
      if (value && typeof value === 'object') {
        for (const key of Object.keys(value as object)) {
          expect(banned.has(key.toLowerCase())).toBe(false)
          walk((value as Record<string, unknown>)[key])
        }
      }
    }
    walk(manifest)
  })

  it('legacy-coexist-studios-keep-registry-row-order', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const a2 = buildAllStarFacts('ALLSTAR2', 1, 'P2-', 'A2FILM')
    // Feed studios in REVERSED array order; the output must still be row-order.
    const facts = baseFacts({
      studios: [a2.studio, a1.studio],
      films: [...a1.films, ...a2.films],
      careerEvents: [...a1.careerEvents, ...a2.careerEvents],
      adoptions: [...a1.adoptions, ...a2.adoptions],
      conditionEvents: [...a1.conditionEvents, ...a2.conditionEvents],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(manifest.studios.map((s: any) => s.studioId)).toEqual(['ALLSTAR1', 'ALLSTAR2'])
  })
})

// ═══════════════════════════════════════════════════════════════════════
// F. owner swap, no role input (RED 7)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: owner swap, no role field (1353-A §8 item 7)', () => {
  it('legacy-owner-swap-no-role-field-structural', async () => {
    // Structural: none of the proposed fact shapes carry a role/player flag.
    // Forces the same module-missing RED as every other leaf (see file header)
    // even though this specific check does not itself call the module.
    const mod = await loadCampaignLegacy()
    requireFn(mod, 'buildLegacyManifest')
    const studioKeys = Object.keys(studioFact({ studioId: 'X' }))
    const filmKeys = Object.keys(filmFact({ filmId: 'F', studioId: 'X' }))
    for (const key of [...studioKeys, ...filmKeys]) {
      expect(key.toLowerCase()).not.toBe('role')
      expect(key.toLowerCase()).not.toContain('isplayer')
      expect(key.toLowerCase()).not.toContain('rival')
    }
  })

  it('legacy-owner-swap-same-facts-relabelled-give-swapped-results', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    // Studio A: 5 acclaimed films (artistic-voice holds). Studio B: none.
    // Swap which studioId owns which fact set; the RESULT must swap with it.
    // The HIGH fact set is tagged 'playerFilms' throughout -- 1353-F2 §1:
    // "Relabelled facts carry their tags along" -- so the tag travels WITH the
    // fact set to whichever studioId currently holds it, never fixed to a
    // particular studioId.
    const build = (idOfHigh: string, idOfLow: string) =>
      baseFacts({
        studios: [studioFact({ studioId: idOfHigh, row: 0 }), studioFact({ studioId: idOfLow, row: 1 })],
        films: [
          ...Array.from({ length: LEGACY_MIN_FILMS }, (_, i) =>
            filmFact({ filmId: `HIGH-${i}`, studioId: idOfHigh, domainId: 'playerFilms', releaseWeek: 10 + i * 20, criticScore: 90 })),
          filmFact({ filmId: 'LOW-0', studioId: idOfLow, domainId: 'playerFilms', releaseWeek: 10, criticScore: 10 }),
        ],
      })
    const original = buildLegacyManifest(build('A', 'B'), 'official2040')
    const swapped = buildLegacyManifest(build('B', 'A'), 'official2040')
    expect(archetype(original, 'A', 'artistic-voice').outcome).toBe('held')
    expect(archetype(original, 'B', 'artistic-voice').outcome).toBe('notHeld')
    // Now B holds (it has the 5-acclaimed fact set) and A does not.
    expect(archetype(swapped, 'B', 'artistic-voice').outcome).toBe('held')
    expect(archetype(swapped, 'A', 'artistic-voice').outcome).toBe('notHeld')
    // The tag travels with the fact set regardless of which studioId holds it.
    for (const ref of archetype(swapped, 'B', 'artistic-voice').qualifying) expect(ref.domainId).toBe('playerFilms')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// G. determinism (RED 8)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: determinism (1353-A §8 item 8)', () => {
  it('legacy-determinism-byte-identical-two-independent-calls', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const build = (): LegacyFacts =>
      baseFacts({
        studios: [a1.studio], films: a1.films, careerEvents: a1.careerEvents,
        adoptions: a1.adoptions, conditionEvents: a1.conditionEvents,
      })
    // Independently constructed via a JSON round-trip, so no shared references.
    const factsA = JSON.parse(JSON.stringify(build()))
    const factsB = JSON.parse(JSON.stringify(build()))
    const manifestA = buildLegacyManifest(factsA, 'official2040')
    const manifestB = buildLegacyManifest(factsB, 'official2040')
    expect(canonicalJSON(manifestA)).toBe(canonicalJSON(manifestB))
  })

  it('legacy-determinism-permuted-input-arrays-byte-identical', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const a2 = buildAllStarFacts('ALLSTAR2', 1, 'P2-', 'A2FILM')
    const inOrder = baseFacts({
      studios: [a1.studio, a2.studio],
      films: [...a1.films, ...a2.films],
      careerEvents: [...a1.careerEvents, ...a2.careerEvents],
      adoptions: [...a1.adoptions, ...a2.adoptions],
      conditionEvents: [...a1.conditionEvents, ...a2.conditionEvents],
    })
    const reversed = baseFacts({
      studios: [a2.studio, a1.studio],
      films: [...a2.films, ...a1.films].reverse(),
      careerEvents: [...a2.careerEvents, ...a1.careerEvents].reverse(),
      adoptions: [...a2.adoptions, ...a1.adoptions].reverse(),
      conditionEvents: [...a2.conditionEvents, ...a1.conditionEvents].reverse(),
    })
    expect(canonicalJSON(buildLegacyManifest(inOrder, 'official2040'))).toBe(
      canonicalJSON(buildLegacyManifest(reversed, 'official2040')),
    )
  })

  it('legacy-determinism-no-rng-or-clock-import', async () => {
    // RED reason: the module-load guard below (fails for the missing-module
    // reason, per file header). Once production exists, the second half of
    // this leaf becomes live: campaignLegacy.ts's own import list must name
    // neither './rng.js' nor a Date/performance.now call.
    const mod = await loadCampaignLegacy()
    requireFn(mod, 'buildLegacyManifest') // forces RED now
    const modulePath = path.join(process.cwd(), 'src/core/campaignLegacy.ts')
    if (fs.existsSync(modulePath)) {
      const source = fs.readFileSync(modulePath, 'utf8')
      expect(source).not.toMatch(/from ['"]\.\/rng\.js['"]/)
      expect(source).not.toMatch(/Date\.now|Math\.random|performance\.now/)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// H. bounds (RED 9): 16/8/12+12/12, exact counts past 12, over-cap refusals
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: bounds (1353-A §8 item 9, 1353-F 13th-lens addition)', () => {
  it('legacy-bounds-refs-capped-at-12-counts-exact-past-12-on-20000-films', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const N = 20_000
    // PROBE-B D4: `10 + i` put weeks 6240-20009 (13,770 films) past B; every
    // release must stay below B, so wrap with `% 6230` (max week 10+6229=6239).
    const films: LegacyFilmFact[] = Array.from({ length: N }, (_, i) =>
      filmFact({ filmId: `BIG-${i}`, studioId: 'BIG', releaseWeek: 10 + (i % 6230), criticScore: 90 }))
    const facts = baseFacts({ studios: [studioFact({ studioId: 'BIG' })], films })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const voice = archetype(manifest, 'BIG', 'artistic-voice')
    expect(voice.qualifyingCount).toBe(N) // exact, past 12
    expect(voice.qualifying.length).toBeLessThanOrEqual(12) // LEGACY_BOUNDS.refsPerSide
  }, 30_000) // explicit headroom: constructing + scanning 20,000 fixture rows

  it('legacy-bounds-seventeenth-domain-refuses-sixteen-succeeds', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const sixteen = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      domains: [...allV1DomainsComplete(), domainFact('extraDomainA'), domainFact('extraDomainB'), domainFact('extraDomainC'), domainFact('extraDomainD'), domainFact('extraDomainE'), domainFact('extraDomainF')],
    })
    expect(sixteen.domains.length).toBe(16)
    expect(() => buildLegacyManifest(sixteen, 'official2040')).not.toThrow()
    const seventeen = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      domains: [...sixteen.domains, domainFact('oneDomainTooMany')],
    })
    expect(seventeen.domains.length).toBe(17)
    expect(() => buildLegacyManifest(seventeen, 'official2040')).toThrow()
  })

  it('legacy-bounds-ninth-archetype-thirteenth-lens-structurally-impossible', async () => {
    // 1353-F2 §3 (accepted as authored): the parent-decided API surface
    // (facts + kind only) gives no caller-supplied channel for archetype or
    // lens IDENTITY -- LEGACY_ARCHETYPE_IDS (8) and LEGACY_LENS_IDS (<=12, v1
    // ships 8) are fixed exported constants, not derived from `facts`. A 9th
    // archetype or 13th lens summary therefore cannot be dynamically
    // constructed through this API, and no caller can supply one, so a ninth
    // or a thirteenth is STRUCTURALLY IMPOSSIBLE -- confirmed as the correct
    // Wave 1 treatment, not a gap. A runtime refusal of a MALFORMED PERSISTED
    // manifest (e.g. a save tampered to carry 9 archetype results) belongs to
    // the Wave 2 validator; Wave 2's own RED adds that check.
    const mod = await loadCampaignLegacy()
    const bounds = requireValue(mod, 'LEGACY_BOUNDS') as { archetypes: number; lenses: number }
    const archetypeIds = requireValue(mod, 'LEGACY_ARCHETYPE_IDS') as string[]
    const lensIds = requireValue(mod, 'LEGACY_LENS_IDS') as string[]
    expect(archetypeIds.length).toBe(bounds.archetypes) // exactly 8, never 9
    expect(lensIds.length).toBeLessThanOrEqual(bounds.lenses) // v1's 8 <= 12, never 13
  })
})

// ═══════════════════════════════════════════════════════════════════════
// I. refs resolve (RED 10)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: refs resolve below the boundary (1353-A §8 item 10, 1353-F2 §1)', () => {
  it('legacy-refs-resolve-every-ref-is-a-real-id-below-boundary-with-exact-domainId', async () => {
    // 1353-F2 §1: film/career-event refs carry the fact's OWN `domainId` field
    // ('playerFilms'/'industryFilms', 'playerCareerEvents'/'industryCareerEvents');
    // adoption/condition-event refs carry the FIXED domainId for their kind
    // ('technologyAdoptions', 'corporateCondition') regardless of which studio
    // owns them. Two studios, tagged oppositely, prove the adapter threads
    // EITHER tag through rather than hard-coding one.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const acclaimed = (studioId: string, domainId: PlayerOrIndustryFilmDomain, n: number) =>
      Array.from({ length: n }, (_, i) =>
        filmFact({ filmId: `${studioId}-F${i}`, studioId, domainId, releaseWeek: 10 + i * 20, criticScore: 90 }))
    const foundryCampaign = (
      studioId: string, filmDomain: PlayerOrIndustryFilmDomain, eventDomain: PlayerOrIndustryCareerEventDomain,
    ) => {
      const films = Array.from({ length: LEGACY_FOUNDRY_MIN_CREDITS }, (_, i) =>
        filmFact({ filmId: `${studioId}-FOUNDRY${i}`, studioId, domainId: filmDomain, releaseWeek: 500 + i * 20 }))
      const events = films.map((f) =>
        careerEventFact({ filmId: f.filmId, talentId: `${studioId}-DISCOVERY`, domainId: eventDomain, releaseWeek: f.releaseWeek! }))
      return { films, events }
    }
    const pFoundry = foundryCampaign('P', 'playerFilms', 'playerCareerEvents')
    const iFoundry = foundryCampaign('I', 'industryFilms', 'industryCareerEvents')
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'P', row: 0 }), studioFact({ studioId: 'I', row: 1 })],
      films: [...acclaimed('P', 'playerFilms', LEGACY_MIN_FILMS), ...pFoundry.films, ...acclaimed('I', 'industryFilms', LEGACY_MIN_FILMS), ...iFoundry.films],
      careerEvents: [...pFoundry.events, ...iFoundry.events],
      adoptions: [
        adoptionFact({ adoptionId: 'P-ADOPT', studioId: 'P', technologyId: 'synchronized-sound', operationalWeek: 426 }),
      ],
      conditionEvents: [
        { eventId: 'P-CE1', studioId: 'P', week: 100, from: 'stable', to: 'distress' },
        { eventId: 'P-CE2', studioId: 'P', week: 120, from: 'distress', to: 'recovery' },
        { eventId: 'P-CE3', studioId: 'P', week: 150, from: 'recovery', to: 'stable' },
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')

    const pVoiceRefs = archetype(manifest, 'P', 'artistic-voice').qualifying
    expect(pVoiceRefs.length).toBeGreaterThan(0)
    for (const ref of pVoiceRefs) expect(ref.domainId).toBe('playerFilms')
    const iVoiceRefs = archetype(manifest, 'I', 'artistic-voice').qualifying
    expect(iVoiceRefs.length).toBeGreaterThan(0)
    for (const ref of iVoiceRefs) expect(ref.domainId).toBe('industryFilms')

    const pFoundryRefs = archetype(manifest, 'P', 'talent-foundry').qualifying
    expect(pFoundryRefs.length).toBeGreaterThan(0)
    for (const ref of pFoundryRefs) expect(ref.domainId).toBe('playerCareerEvents')
    const iFoundryRefs = archetype(manifest, 'I', 'talent-foundry').qualifying
    expect(iFoundryRefs.length).toBeGreaterThan(0)
    for (const ref of iFoundryRefs) expect(ref.domainId).toBe('industryCareerEvents')

    const pioneerRefs = archetype(manifest, 'P', 'technology-pioneer').qualifying
    expect(pioneerRefs.length).toBeGreaterThan(0)
    for (const ref of pioneerRefs) expect(ref.domainId).toBe('technologyAdoptions') // fixed, not read from a fact field

    const survivorRefs = archetype(manifest, 'P', 'resilient-survivor').qualifying
    expect(survivorRefs.length).toBeGreaterThan(0)
    for (const ref of survivorRefs) expect(ref.domainId).toBe('corporateCondition') // fixed

    // Every ref's id is a real, known fact id, and its underlying week is below B.
    const filmWeeks = new Map(facts.films.map((f) => [f.filmId, f.releaseWeek!]))
    const eventWeeks = new Map(facts.careerEvents.map((e) => [e.eventId, e.releaseWeek]))
    const adoptionWeeks = new Map(facts.adoptions.map((ad) => [ad.adoptionId, ad.operationalWeek ?? -1]))
    const conditionWeeks = new Map((facts.conditionEvents ?? []).map((ce) => [ce.eventId, ce.week]))
    // PROBE-B D2: pioneer contrary refs are lawfully cited by TECHNOLOGY id too
    // (1353-F2 §1 maps them to 'technologyCatalogue'); this leaf's own known-id
    // set must include them or a lawful ref would wrongly fail as fabricated.
    const technologyWeeks = new Map(facts.technologies.map((t) => [t.technologyId, t.commercialWeek]))
    const knownIds = new Set<string>([
      ...filmWeeks.keys(), ...eventWeeks.keys(), ...adoptionWeeks.keys(), ...conditionWeeks.keys(), ...technologyWeeks.keys(),
    ])
    let refsChecked = 0
    for (const studio of manifest.studios) {
      for (const a of studio.archetypes) {
        for (const ref of [...a.qualifying, ...a.contrary]) {
          refsChecked++
          expect(knownIds.has(ref.id)).toBe(true) // only cited IDs -- never fabricated
          const week = filmWeeks.get(ref.id) ?? eventWeeks.get(ref.id) ?? adoptionWeeks.get(ref.id) ?? conditionWeeks.get(ref.id) ?? technologyWeeks.get(ref.id)
          expect(week).toBeLessThan(facts.boundaryWeek)
        }
      }
    }
    expect(refsChecked).toBeGreaterThan(0)
  })

  it('legacy-refs-resolve-playerRuns-domain-never-cited-by-a-ref', async () => {
    // 1353-F2 §1: "'playerRuns' supplies the run status of player films through
    // the adapter, and no v1 ref cites it." A structural check that our own
    // proposed domain roster still names it (it is one of the 11 v1 domains,
    // 1353-A §5.2), plus a RED-forcing module-load call per the file header.
    const mod = await loadCampaignLegacy()
    requireFn(mod, 'buildLegacyManifest')
    expect(V1_DOMAIN_IDS as readonly string[]).toContain('playerRuns')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// I2. lens counts key sets (1353-F2 §2, one leaf per v1 lens)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: lens counts key sets (1353-F2 §2)', () => {
  it('lens-counts-catalog-exact-keys-and-one-value', async () => {
    // catalog: releases, settled, inReleaseAtBoundary, authoredPre1920.
    // Fixture: 1 settled campaign film, 1 inRun campaign film, 1 authored film.
    // releases counts campaign releases only (authored is a separate count):
    // releases=2, settled=1, inReleaseAtBoundary=1, authoredPre1920=1.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({ filmId: 'F-SETTLED', studioId: 'S', releaseWeek: 10, status: 'settled', settledWeek: 10 }),
        filmFact({ filmId: 'F-INRUN', studioId: 'S', releaseWeek: 6235, status: 'inRun', settledWeek: null, grossSettled: null }),
        filmFact({ filmId: 'F-AUTHORED', studioId: 'S', provenance: 'authored', releaseWeek: null, credits: [] }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const catalog = lens(manifest, 'S', 'catalog')
    expect(Object.keys(catalog.counts).sort()).toEqual(['authoredPre1920', 'inReleaseAtBoundary', 'releases', 'settled'].sort())
    expect(catalog.counts.releases).toBe(2)
    expect(catalog.counts.settled).toBe(1)
    expect(catalog.counts.inReleaseAtBoundary).toBe(1)
    expect(catalog.counts.authoredPre1920).toBe(1)
    expect(catalog.refs).toEqual([]) // "no refs, since legacyCatalog pages the list" (1353-A §5.4)
  })

  it('lens-counts-people-exact-keys-and-one-value', async () => {
    // people: credited, discoveries. "discoveries" here is the BROAD set --
    // anyone whose earliest-ever credit is a campaign release of S -- not
    // gated by talent-foundry's own >=10-credit qualifying threshold (an
    // authoring decision, flagged in the handback): T1 gets only 2 credits,
    // well under LEGACY_FOUNDRY_MIN_CREDITS, and still counts as 1 discovery
    // and 1 credited person here.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({ filmId: 'F1', studioId: 'S', releaseWeek: 10 }),
        filmFact({ filmId: 'F2', studioId: 'S', releaseWeek: 30 }),
      ],
      careerEvents: [
        careerEventFact({ filmId: 'F1', talentId: 'T1', releaseWeek: 10 }),
        careerEventFact({ filmId: 'F2', talentId: 'T1', releaseWeek: 30 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const people = lens(manifest, 'S', 'people')
    expect(Object.keys(people.counts).sort()).toEqual(['credited', 'discoveries'].sort())
    expect(people.counts.credited).toBe(1)
    expect(people.counts.discoveries).toBe(1)
  })

  it('lens-counts-technology-exact-keys-and-one-value', async () => {
    // technology: operationalAdoptions (before B). A non-operational adoption
    // (operationalWeek: null) must not be counted.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      adoptions: [
        adoptionFact({ adoptionId: 'A-OP', studioId: 'S', technologyId: 'synchronized-sound', operationalWeek: 426 }),
        adoptionFact({ adoptionId: 'A-NOTYET', studioId: 'S', technologyId: 'lighting-control-01', operationalWeek: null }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const technology = lens(manifest, 'S', 'technology')
    expect(Object.keys(technology.counts).sort()).toEqual(['operationalAdoptions'])
    expect(technology.counts.operationalAdoptions).toBe(1)
  })

  it('lens-counts-ranking-exact-keys-and-one-value', async () => {
    // ranking: rankedQuarters, quartersAtFirst, bestRank.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      rankingSnapshots: [
        { recordId: 'PR-100', week: 100, studioId: 'S', rank: 2, band: 'stable' }, // A1
        { recordId: 'PR-200', week: 200, studioId: 'S', rank: 1, band: 'stable' }, // A1
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const ranking = lens(manifest, 'S', 'ranking')
    expect(Object.keys(ranking.counts).sort()).toEqual(['bestRank', 'quartersAtFirst', 'rankedQuarters'].sort())
    expect(ranking.counts.rankedQuarters).toBe(2)
    expect(ranking.counts.quartersAtFirst).toBe(1)
    expect(ranking.counts.bestRank).toBe(1)
  })

  it('lens-counts-financialBand-exact-keys-and-one-value', async () => {
    // financialBand: inTheRed, strained, stable, thriving (quarters per band).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      rankingSnapshots: [
        { recordId: 'PR-B100', week: 100, studioId: 'S', rank: 1, band: 'stable' }, // A1
        { recordId: 'PR-B200', week: 200, studioId: 'S', rank: 1, band: 'stable' }, // A1
        { recordId: 'PR-B300', week: 300, studioId: 'S', rank: 1, band: 'thriving' }, // A1
        { recordId: 'PR-B400', week: 400, studioId: 'S', rank: 1, band: 'inTheRed' }, // A1
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const band = lens(manifest, 'S', 'financialBand')
    expect(Object.keys(band.counts).sort()).toEqual(['inTheRed', 'stable', 'strained', 'thriving'].sort())
    expect(band.counts.inTheRed).toBe(1)
    expect(band.counts.strained).toBe(0)
    expect(band.counts.stable).toBe(2)
    expect(band.counts.thriving).toBe(1)
  })

  it('lens-counts-market-exact-keys-and-one-value', async () => {
    // market: assessed, underPressure.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      marketAssessments: [
        { assessmentId: 'M1', studioId: 'S', week: 10, assessed: true, underPressure: false }, // A2
        { assessmentId: 'M2', studioId: 'S', week: 20, assessed: true, underPressure: true }, // A2
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const market = lens(manifest, 'S', 'market')
    expect(Object.keys(market.counts).sort()).toEqual(['assessed', 'underPressure'].sort())
    expect(market.counts.assessed).toBe(2)
    expect(market.counts.underPressure).toBe(1)
  })

  it('lens-counts-resilience-exact-keys-and-one-value', async () => {
    // resilience: warnings, distressEntries, returnsToStable, closures.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      conditionEvents: [
        { eventId: 'CE-WARN', studioId: 'S', week: 10, from: 'stable', to: 'warning' },
        { eventId: 'CE-DISTRESS', studioId: 'S', week: 20, from: 'stable', to: 'distress' },
        { eventId: 'CE-RETURN', studioId: 'S', week: 40, from: 'recovery', to: 'stable' },
        { eventId: 'CE-CLOSE', studioId: 'S', week: 60, from: 'distress', to: 'closed' },
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const resilience = lens(manifest, 'S', 'resilience')
    expect(Object.keys(resilience.counts).sort()).toEqual(['closures', 'distressEntries', 'returnsToStable', 'warnings'].sort())
    expect(resilience.counts.warnings).toBe(1)
    expect(resilience.counts.distressEntries).toBe(1)
    expect(resilience.counts.returnsToStable).toBe(1)
    expect(resilience.counts.closures).toBe(1)
  })

  it('lens-counts-awards-no-keys-always-not-recorded', async () => {
    // awards: none; the status is always notRecorded (1353-F2 §2).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({ studios: [studioFact({ studioId: 'S' })] })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const awards = lens(manifest, 'S', 'awards')
    expect(awards.status).toBe('notRecorded')
    expect(Object.keys(awards.counts)).toEqual([])
    expect(awards.refs).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════
// J. no leak from later state (RED 11)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: no leak from later state (1353-A §8 item 11)', () => {
  it('legacy-no-leak-later-state-facts-extended-through-6500-byte-identical', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const baseline = baseFacts({
      studios: [a1.studio], films: a1.films, careerEvents: a1.careerEvents,
      adoptions: a1.adoptions, conditionEvents: a1.conditionEvents,
    })
    const extended: LegacyFacts = {
      ...baseline,
      films: [
        ...a1.films,
        filmFact({ filmId: 'LATER-FILM', studioId: 'ALLSTAR1', releaseWeek: 6300, criticScore: 99, grossSettled: BMV }),
      ],
      careerEvents: [
        ...a1.careerEvents,
        careerEventFact({ filmId: 'LATER-FILM', talentId: 'LATER-PERSON', releaseWeek: 6300, audienceScore: 99 }),
      ],
      adoptions: [
        ...a1.adoptions,
        adoptionFact({ adoptionId: 'LATER-ADOPT', studioId: 'ALLSTAR1', technologyId: 'lighting-control-01', operationalWeek: 6400 }),
      ],
      conditionEvents: [
        ...a1.conditionEvents,
        { eventId: 'LATER-CE', studioId: 'ALLSTAR1', week: 6350, from: 'stable', to: 'distress' },
      ],
    }
    expect(canonicalJSON(buildLegacyManifest(baseline, 'official2040'))).toBe(
      canonicalJSON(buildLegacyManifest(extended, 'official2040')),
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════
// K. frozen once (RED 12)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: frozen once (1353-A §8 item 12)', () => {
  it('legacy-frozen-once-second-official-write-refuses', async () => {
    const mod = await loadCampaignLegacy()
    const freezeLegacy = requireFn<(root: any, producedWeek: number, facts: LegacyFacts) => any>(mod, 'freezeLegacy')
    const emptyRoot = { version: 1, recordedFromWeek: 0, official: null, endOfRun: null }
    const factsA = baseFacts({ studios: [studioFact({ studioId: 'S' })] })
    const afterFirst = freezeLegacy(emptyRoot, 6240, factsA)
    expect(afterFirst.official).not.toBeNull()
    expect(afterFirst.official.postFinaleMode).toBe('ordinary-simulation/v1')
    // A later week with DIFFERENT facts: root stays unchanged (byte-identical).
    const factsB = baseFacts({ studios: [studioFact({ studioId: 'DIFFERENT-STUDIO' })] })
    const afterLater = freezeLegacy(afterFirst, 6300, factsB)
    expect(canonicalJSON(afterLater)).toBe(canonicalJSON(afterFirst))
    // A second call at the EXACT freeze week, still with different facts, also refuses.
    const afterSecondOfficial = freezeLegacy(afterFirst, 6240, factsB)
    expect(canonicalJSON(afterSecondOfficial)).toBe(canonicalJSON(afterFirst))
  })

  it('legacy-frozen-once-non-freeze-week-returns-root-unchanged', async () => {
    const mod = await loadCampaignLegacy()
    const freezeLegacy = requireFn<(root: any, producedWeek: number, facts: LegacyFacts) => any>(mod, 'freezeLegacy')
    const emptyRoot = { version: 1, recordedFromWeek: 0, official: null, endOfRun: null }
    const facts = baseFacts({ studios: [studioFact({ studioId: 'S' })] })
    for (const week of [0, 1, 6238, 6239, 6241, 7000]) {
      const result = freezeLegacy(emptyRoot, week, facts)
      expect(result.official).toBeNull()
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// L. no-backfill completeness (RED 13)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: no-backfill completeness (1353-A §8 item 13, law 7, 1353-F2 §4)', () => {
  // 1353-F2 §4's exact status table:
  //   absent, or recordedFromWeek null           -> notRecorded
  //   recordedFromWeek >= B                       -> notRecorded (no row can fall before B)
  //   recordedFromWeek after a studio's enteredWeek and below B -> limited, carrying the week
  //   otherwise (recordedFromWeek <= every entered studio's enteredWeek) -> complete

  it('legacy-completeness-absent-domain-not-recorded', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      domains: allV1DomainsComplete().filter((d) => d.domainId !== 'marketAssessments'),
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const source = manifest.sources.find((s: any) => s.domainId === 'marketAssessments')
    expect(source.status).toBe('notRecorded')
    const awards = manifest.sources.find((s: any) => s.domainId === 'awards')
    expect(awards).toBeUndefined() // 'awards' is never in facts.domains; it is
    // synthesized as notRecorded only on the per-archetype/lens result, not
    // necessarily as its own LegacySource row -- see the handback's note on
    // this leaf's scoping decision.
  })

  it('legacy-completeness-null-recorded-from-week-not-recorded', async () => {
    // Present domain entry, but recordedFromWeek is explicitly null.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      domains: [
        ...allV1DomainsComplete().filter((d) => d.domainId !== 'marketAssessments'),
        domainFact('marketAssessments', { recordedFromWeek: null }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(manifest.sources.find((s: any) => s.domainId === 'marketAssessments').status).toBe('notRecorded')
  })

  it('legacy-completeness-recorded-from-week-at-or-after-boundary-not-recorded', async () => {
    // recordedFromWeek >= B: no row can ever fall before B, so this reads
    // notRecorded -- never 'limited', regardless of any studio's enteredWeek.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    for (const recordedFromWeek of [6240, 7000]) {
      const facts = baseFacts({
        studios: [studioFact({ studioId: 'S', enteredWeek: 0 })],
        domains: [
          ...allV1DomainsComplete().filter((d) => d.domainId !== 'playerFilms'),
          domainFact('playerFilms', { recordedFromWeek }),
        ],
      })
      const manifest = buildLegacyManifest(facts, 'official2040')
      expect(manifest.sources.find((s: any) => s.domainId === 'playerFilms').status, `recordedFromWeek=${recordedFromWeek}`).toBe('notRecorded')
    }
  })

  it('legacy-completeness-limited-with-recorded-from-week-after-studio-entry', async () => {
    // recordedFromWeek(500) is AFTER S's own enteredWeek(0) and below B: limited, carrying the week.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S', enteredWeek: 0 })],
      domains: [
        ...allV1DomainsComplete().filter((d) => d.domainId !== 'playerFilms'),
        domainFact('playerFilms', { recordedFromWeek: 500 }),
      ],
      films: [filmFact({ filmId: 'F-AFTER', studioId: 'S', releaseWeek: 600, criticScore: 90 })],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const source = manifest.sources.find((s: any) => s.domainId === 'playerFilms')
    expect(source.status).toBe('limited')
    expect(source.recordedFromWeek).toBe(500)
  })

  it('legacy-completeness-complete-when-recorded-from-week-at-or-before-every-entry', async () => {
    // recordedFromWeek(500) is AT OR BEFORE every entered studio's enteredWeek
    // (600 and 500 exactly): neither studio has a gap -> complete, not limited.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'LATE', enteredWeek: 600, row: 0 }), studioFact({ studioId: 'EXACT', enteredWeek: 500, row: 1 })],
      domains: [
        ...allV1DomainsComplete().filter((d) => d.domainId !== 'playerFilms'),
        domainFact('playerFilms', { recordedFromWeek: 500 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(manifest.sources.find((s: any) => s.domainId === 'playerFilms').status).toBe('complete')
  })

  it('legacy-completeness-row-before-recorded-from-week-refuses', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      domains: [
        ...allV1DomainsComplete().filter((d) => d.domainId !== 'playerFilms'),
        domainFact('playerFilms', { recordedFromWeek: 500 }),
      ],
      // Invalid: a film dated BEFORE its domain's own recordedFromWeek.
      // PROBE-B D3: domainId must be 'playerFilms' -- filmFact defaults to
      // 'industryFilms' (recordedFromWeek 0), which is never before week 500.
      films: [filmFact({ filmId: 'F-TOO-EARLY', studioId: 'S', domainId: 'playerFilms', releaseWeek: 100, criticScore: 90 })],
    })
    expect(() => buildLegacyManifest(facts, 'official2040')).toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// M. public facts only (RED 14)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: public facts only (1353-A §8 item 14, §5.1 "never read")', () => {
  it('legacy-public-facts-only-structural-no-cash-cost-revenue-key', async () => {
    const mod = await loadCampaignLegacy()
    requireFn(mod, 'buildLegacyManifest') // force RED now
    const allKeys = [
      ...Object.keys(studioFact({ studioId: 'X' })),
      ...Object.keys(filmFact({ filmId: 'F', studioId: 'X' })),
      ...Object.keys(careerEventFact({ filmId: 'F', talentId: 'T' })),
      ...Object.keys(adoptionFact({ adoptionId: 'A', studioId: 'X', technologyId: 'synchronized-sound' })),
    ]
    for (const key of allKeys) {
      expect(key.toLowerCase()).not.toMatch(/cash|cost|revenue/)
    }
  })

  it('legacy-public-facts-only-injected-sentinel-never-leaks', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const a1 = buildAllStarFacts('ALLSTAR1', 0, 'P1-', 'A1FILM')
    const facts: any = baseFacts({
      studios: [{ ...a1.studio, rivalCash: 987_654_321 } as any], // bogus, untyped field smuggled in
      films: a1.films, careerEvents: a1.careerEvents, adoptions: a1.adoptions, conditionEvents: a1.conditionEvents,
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(JSON.stringify(manifest)).not.toContain('987654321')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// N. audience score from career events, end-of-run (RED 15)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: audience score and end-of-run (1353-A §8 item 15)', () => {
  it('legacy-audience-score-from-career-events-agreeing', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    // A decade with 2 scored releases, both liked (audienceScore 80) via two
    // AGREEING career events per film -> an audience decade.
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({ filmId: 'F1', studioId: 'S', releaseWeek: 10 }),
        filmFact({ filmId: 'F2', studioId: 'S', releaseWeek: 20 }),
      ],
      careerEvents: [
        careerEventFact({ filmId: 'F1', talentId: 'T1', releaseWeek: 10, audienceScore: 80 }),
        careerEventFact({ filmId: 'F1', talentId: 'T2', releaseWeek: 10, audienceScore: 80 }), // agrees
        careerEventFact({ filmId: 'F2', talentId: 'T1', releaseWeek: 20, audienceScore: 80 }),
      ],
    })
    expect(() => buildLegacyManifest(facts, 'official2040')).not.toThrow()
  })

  it('legacy-audience-score-disagreeing-events-refuses', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [filmFact({ filmId: 'F1', studioId: 'S', releaseWeek: 10 })],
      careerEvents: [
        careerEventFact({ filmId: 'F1', talentId: 'T1', releaseWeek: 10, audienceScore: 80 }),
        careerEventFact({ filmId: 'F1', talentId: 'T2', releaseWeek: 10, audienceScore: 81 }), // disagrees
      ],
    })
    expect(() => buildLegacyManifest(facts, 'official2040')).toThrow()
  })

  it('legacy-audience-score-no-events-excludes-film-from-decade-counting', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    // 1353-F2 §5: BOTH effects hold for a film with no career events. One
    // decade with only ONE scored release (F2) despite two films (F1 has NO
    // career events) -- below LEGACY_DECADE_MIN_RELEASES=2 -- so this decade
    // never becomes an audience decade purely for lack of evidence (effect 1);
    // AND the studio's audience-institution result lists F1's OWN career-event
    // domain ('industryCareerEvents', since F1 is tagged 'industryFilms') in
    // `limitedBy`, because its audience evidence is incomplete (effect 2) --
    // the narrower reading alone would hide this gap from the dossier.
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({ filmId: 'F1', studioId: 'S', domainId: 'industryFilms', releaseWeek: 10 }), // no career events at all
        filmFact({ filmId: 'F2', studioId: 'S', domainId: 'industryFilms', releaseWeek: 20 }),
      ],
      careerEvents: [careerEventFact({ filmId: 'F2', talentId: 'T1', domainId: 'industryCareerEvents', releaseWeek: 20, audienceScore: 80 })],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const institution = archetype(manifest, 'S', 'audience-institution')
    expect(institution.outcome).not.toBe('held') // only 1 scored release in this decade, need >=2
    expect(JSON.stringify(institution)).not.toContain('"F1"') // effect 1: excluded from decade counting
    expect(institution.limitedBy).toContain('industryCareerEvents') // effect 2: the gap is surfaced
  })

  it('legacy-end-of-run-boundary-c-plus-1-null-mode', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const C = 3000
    const facts = baseFacts({ boundaryWeek: C + 1, studios: [studioFact({ studioId: 'S' })] })
    const manifest = buildLegacyManifest(facts, 'endOfRun')
    expect(manifest.kind).toBe('endOfRun')
    expect(manifest.boundaryWeek).toBe(C + 1)
    expect(manifest.postFinaleMode).toBeNull()
  })

  it('legacy-official-2040-requires-boundary-week-6240', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({ boundaryWeek: 6241, studios: [studioFact({ studioId: 'S' })] })
    expect(() => buildLegacyManifest(facts, 'official2040')).toThrow()
    const ok = baseFacts({ boundaryWeek: 6240, studios: [studioFact({ studioId: 'S' })] })
    expect(() => buildLegacyManifest(ok, 'official2040')).not.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// O. mode inert (RED 16)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: postFinaleMode inert (1353-A §8 item 16, §6)', () => {
  it('legacy-mode-inert-no-other-src-core-module-reads-it', async () => {
    // RED reason: the module-load guard below (module-missing, per header).
    const mod = await loadCampaignLegacy()
    requireFn(mod, 'buildLegacyManifest')
    const coreDir = path.join(process.cwd(), 'src/core')
    if (fs.existsSync(coreDir)) {
      const offenders: string[] = []
      for (const file of fs.readdirSync(coreDir)) {
        if (!file.endsWith('.ts')) continue
        if (file === 'campaignLegacy.ts' || file === 'save.ts') continue // the law itself + the validator
        const text = fs.readFileSync(path.join(coreDir, file), 'utf8')
        if (text.includes('postFinaleMode')) offenders.push(file)
      }
      expect(offenders).toEqual([])
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// P. TUNING (RED 17) -- real, already-existing module
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: TUNING bounded terms (1353-A §5.5, RED 17)', () => {
  it('tuning-legacy-bounded-terms', () => {
    const t = TUNING as unknown as Record<string, unknown>
    expect(t.LEGACY_CRITIC_ACCLAIM_MIN).toBe(60)
    expect(t.LEGACY_CRITIC_PAN_BELOW).toBe(35)
    expect(t.LEGACY_AUDIENCE_LIKED_MIN).toBe(57)
    expect(t.LEGACY_MIN_FILMS).toBe(5)
    expect(t.LEGACY_MIN_SHARE_PERCENT).toBe(20)
    expect(t.LEGACY_HIT_REACH_PERCENT).toBe(49)
    expect(t.LEGACY_FLOP_REACH_PERCENT).toBe(30)
    expect(t.LEGACY_AUDIENCE_MIN_DECADES).toBe(4)
    expect(t.LEGACY_DECADE_MIN_RELEASES).toBe(2)
    expect(t.LEGACY_PIONEER_WEEKS).toBe(52)
    expect(t.LEGACY_TECH_LATE_WEEKS).toBe(260)
    expect(t.LEGACY_FOUNDRY_MIN_PEOPLE).toBe(3)
    expect(t.LEGACY_FOUNDRY_MIN_CREDITS).toBe(10)
    expect(t.LEGACY_FOUNDRY_SETTLE_WEEKS).toBe(260)
    expect(t.LEGACY_GENRE_MIN_FILMS).toBe(8)
    // Range: every one of the above is a positive integer.
    for (const key of [
      'LEGACY_CRITIC_ACCLAIM_MIN', 'LEGACY_CRITIC_PAN_BELOW', 'LEGACY_AUDIENCE_LIKED_MIN',
      'LEGACY_MIN_FILMS', 'LEGACY_MIN_SHARE_PERCENT', 'LEGACY_HIT_REACH_PERCENT', 'LEGACY_FLOP_REACH_PERCENT',
      'LEGACY_AUDIENCE_MIN_DECADES', 'LEGACY_DECADE_MIN_RELEASES', 'LEGACY_PIONEER_WEEKS', 'LEGACY_TECH_LATE_WEEKS',
      'LEGACY_FOUNDRY_MIN_PEOPLE', 'LEGACY_FOUNDRY_MIN_CREDITS', 'LEGACY_FOUNDRY_SETTLE_WEEKS', 'LEGACY_GENRE_MIN_FILMS',
    ]) {
      const value = t[key] as number
      expect(Number.isInteger(value), key).toBe(true)
      expect(value, key).toBeGreaterThan(0)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Q. 1353-F addition: a studio closed before B stays in the roll call
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: closed-before-boundary studio (1353-F note)', () => {
  it('legacy-closed-before-boundary-stays-in-roll-call-with-pre-closure-facts', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const acclaimedFilms = (studioId: string) =>
      Array.from({ length: LEGACY_MIN_FILMS }, (_, i) =>
        filmFact({ filmId: `${studioId}-F${i}`, studioId, releaseWeek: 10 + i * 20, criticScore: 90 }))
    const facts = baseFacts({
      studios: [
        studioFact({ studioId: 'OPEN', row: 0 }),
        studioFact({ studioId: 'CLOSED', row: 1, closedWeek: 1000 }),
      ],
      films: [...acclaimedFilms('OPEN'), ...acclaimedFilms('CLOSED')],
      conditionEvents: [{ eventId: 'CLOSED-CE', studioId: 'CLOSED', week: 1000, from: 'distress', to: 'closed' }],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    // Roll call: both studios present, registry row order.
    expect(manifest.studios.map((s: any) => s.studioId)).toEqual(['OPEN', 'CLOSED'])
    // Pre-closure facts survive: CLOSED still holds artistic-voice.
    expect(archetype(manifest, 'CLOSED', 'artistic-voice').outcome).toBe('held')
    // The closure itself: resilient-survivor notHeld, closure as contrary
    // (the dossier VIEW, Wave 3, derives "closure date" from this ref).
    const survivor = archetype(manifest, 'CLOSED', 'resilient-survivor')
    expect(survivor.outcome).toBe('notHeld')
    expect(survivor.contrary.map((r: any) => r.id)).toContain('CLOSED-CE')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// R. one dedicated leaf per §5.3 amendment edge (1353-F, brief requirement)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: §5.3 amendment edges (1353-F amendments 1-4)', () => {
  it('amendment-1-audience-institution-exactly-half-liked-qualifies', async () => {
    // Amendment 1: `2*liked >= scored`. Decade A: scored=2, liked=1 (2*1=2>=2)
    // -> an audience decade (exactly half qualifies). Decade B: scored=2,
    // liked=0 (0<2) -> not an audience decade (an "eligible" decade instead,
    // since it still has >=2 scored releases).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [
        filmFact({ filmId: 'DA-LIKED', studioId: 'S', releaseWeek: 10 }),
        filmFact({ filmId: 'DA-UNLIKED', studioId: 'S', releaseWeek: 20 }),
        filmFact({ filmId: 'DB-1', studioId: 'S', releaseWeek: 530 }),
        filmFact({ filmId: 'DB-2', studioId: 'S', releaseWeek: 540 }),
      ],
      careerEvents: [
        careerEventFact({ filmId: 'DA-LIKED', talentId: 'T1', releaseWeek: 10, audienceScore: LEGACY_AUDIENCE_LIKED_MIN }), // liked, exactly at the floor
        careerEventFact({ filmId: 'DA-UNLIKED', talentId: 'T1', releaseWeek: 20, audienceScore: LEGACY_AUDIENCE_LIKED_MIN - 1 }),
        careerEventFact({ filmId: 'DB-1', talentId: 'T1', releaseWeek: 530, audienceScore: LEGACY_AUDIENCE_LIKED_MIN - 1 }),
        careerEventFact({ filmId: 'DB-2', talentId: 'T1', releaseWeek: 540, audienceScore: LEGACY_AUDIENCE_LIKED_MIN - 1 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const institution = archetype(manifest, 'S', 'audience-institution')
    expect(institution.qualifying.map((r: any) => r.id)).toContain('DA-LIKED') // decade A's best film
    const contraryIds = institution.contrary.map((r: any) => r.id)
    expect(contraryIds).toContain('DB-1') // decade B's worst (both score 56, tie -> release week then ID)
    expect(JSON.stringify(institution.qualifying)).not.toContain('"DB-')
  })

  it('amendment-2-genre-specialist-exactly-half-does-not-qualify', async () => {
    // Amendment 2: `2*genreCount > n`. S-HALF: n=8, comedy=4 (2*4=8, NOT>8)
    // -> notHeld. S-MAJORITY: n=8, comedy=5 (2*5=10>8) -> held.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const build = (studioId: string, comedyCount: number) =>
      Array.from({ length: LEGACY_GENRE_MIN_FILMS }, (_, i) =>
        filmFact({
          filmId: `${studioId}-F${i}`, studioId, releaseWeek: 10 + i * 20,
          genre: i < comedyCount ? 'comedy' : 'drama',
        }))
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S-HALF' }), studioFact({ studioId: 'S-MAJORITY' })],
      films: [...build('S-HALF', 4), ...build('S-MAJORITY', 5)],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'S-HALF', 'genre-specialist').outcome).toBe('notHeld')
    expect(archetype(manifest, 'S-MAJORITY', 'genre-specialist').outcome).toBe('held')
  })

  it('amendment-3-mid-decade-entrant-decades-by-calendar-block', async () => {
    // MIDENTRANT enters week 300 (year 1925, decade block 192 = 1920-1929) and
    // only ever releases from week 300 on. It still reaches 4 audience decades
    // using its OWN releases in that partial first block plus three full later
    // blocks. INCUMBENT's own, much larger 1920s presence (weeks 0-99) must
    // not affect MIDENTRANT's result at all (decades are per-studio).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const midWeeks = [300, 310, 530, 540, 1060, 1070, 1580, 1590]
    const midFilms = midWeeks.map((w, i) => filmFact({ filmId: `MID-${i}`, studioId: 'MIDENTRANT', releaseWeek: w }))
    const midEvents = midFilms.map((f) =>
      careerEventFact({ filmId: f.filmId, talentId: 'T', releaseWeek: f.releaseWeek!, audienceScore: 80 }))
    const incumbentFilms = Array.from({ length: 10 }, (_, i) =>
      filmFact({ filmId: `INC-${i}`, studioId: 'INCUMBENT', releaseWeek: i * 5 }))
    const withoutIncumbent = buildLegacyManifest(
      baseFacts({
        studios: [studioFact({ studioId: 'MIDENTRANT', enteredWeek: 300 })],
        films: midFilms, careerEvents: midEvents,
      }),
      'official2040',
    )
    const withIncumbent = buildLegacyManifest(
      baseFacts({
        studios: [studioFact({ studioId: 'MIDENTRANT', enteredWeek: 300 }), studioFact({ studioId: 'INCUMBENT', row: 1 })],
        films: [...midFilms, ...incumbentFilms], careerEvents: midEvents,
      }),
      'official2040',
    )
    expect(archetype(withoutIncumbent, 'MIDENTRANT', 'audience-institution').outcome).toBe('held')
    expect(canonicalJSON(archetype(withIncumbent, 'MIDENTRANT', 'audience-institution'))).toBe(
      canonicalJSON(archetype(withoutIncumbent, 'MIDENTRANT', 'audience-institution')),
    )
  })

  it('amendment-4-pioneer-contrary-uses-own-earliest-adoption-not-industrys-first', async () => {
    // Studio X: the industry's first-ever adoption of synchronized-sound
    // (operational at 416+10=426) -- a clear pioneer for X. Studio Y: a
    // CANCELLED early adoption (never operational) followed by its own only
    // operational adoption, late (416+300=716, > 416+260=676). Y's contrary
    // ref must be Y's OWN late adoption -- never X's industry-first adoption,
    // and never Y's own cancelled one.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'X', row: 0 }), studioFact({ studioId: 'Y', row: 1 })],
      adoptions: [
        adoptionFact({ adoptionId: 'X-FIRST', studioId: 'X', technologyId: 'synchronized-sound', operationalWeek: 426 }),
        adoptionFact({ adoptionId: 'Y-CANCELLED', studioId: 'Y', technologyId: 'synchronized-sound', operationalWeek: null, cancelledWeek: 200 }),
        adoptionFact({ adoptionId: 'Y-LATE', studioId: 'Y', technologyId: 'synchronized-sound', operationalWeek: 716 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    expect(archetype(manifest, 'X', 'technology-pioneer').outcome).toBe('held')
    const yResult = archetype(manifest, 'Y', 'technology-pioneer')
    expect(yResult.outcome).toBe('notHeld')
    // PROBE-B D2: Y also never adopts lighting-control-01 (entered week 0,
    // commercial at 936) -> that technology id joins Y's own late adoption.
    expect(yResult.contrary.map((r: any) => r.id).sort()).toEqual(['Y-LATE', 'lighting-control-01'])
    expect(JSON.stringify(yResult)).not.toContain('X-FIRST')
    expect(JSON.stringify(yResult)).not.toContain('Y-CANCELLED')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// S. RED r4: the three Wave-2-charter amendments folded into Wave 1
// (1359-A §3.3 A1-A3, adopted by 1353-F4)
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: Wave 1 amendments A1-A3 (1359-A §3.3, 1353-F4)', () => {
  it('a1-ranking-ref-cites-record-id-never-week-derived', async () => {
    // A1 (1359-A §3.3 / 1355-F2 item 5): a ranking ref must cite the archive
    // record's own recordId (production mints `power-ranking-<p15DomainSequence>`;
    // annex D.7 forbids a week-only id). This pure-law fixture's recordId is
    // an arbitrary opaque string ('PR-777') -- unrelated to its week (100) --
    // so a ref built from `${week}:${studioId}` cannot coincidentally match it.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      rankingSnapshots: [{ recordId: 'PR-777', week: 100, studioId: 'S', rank: 1, band: 'stable' }],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const ranking = lens(manifest, 'S', 'ranking')
    expect(ranking.refs.length).toBe(1)
    expect(ranking.refs[0].id).toBe('PR-777')
    expect(ranking.refs[0].id).not.toBe('100:S') // never the week:studioId form
  })

  it('a2-market-assessment-cut-by-week-outside-b-excluded', async () => {
    // A2 (1359-A §3.3): LegacyMarketAssessmentFact gains `week`; the law cuts
    // market rows at B like every other domain, rather than leaving the
    // adapter as the one place that cuts. One assessment AT B (outside,
    // excluded), one at B-1 (inside, counted).
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const B = 6240
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      marketAssessments: [
        { assessmentId: 'M-OUTSIDE', studioId: 'S', week: B, assessed: true, underPressure: true },
        { assessmentId: 'M-INSIDE', studioId: 'S', week: B - 1, assessed: true, underPressure: true },
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const market = lens(manifest, 'S', 'market')
    expect(market.counts.assessed).toBe(1) // only M-INSIDE; M-OUTSIDE is AT B, never below B
    expect(market.counts.underPressure).toBe(1)
  })

  it('a3-closure-at-or-after-boundary-reads-open', async () => {
    // A3 (1359-A §3.3) / OPEN-7 (1353-F4, ratified as implemented): a closure
    // counts only when its event is dated before B, or when closedWeek < B.
    // closedWeek >= B reads open -- no closure contrary, no closure in the
    // survivor predicate. A studio with a genuine distress -> recovery ->
    // stable return (which alone holds resilient-survivor) and closedWeek
    // stamped EXACTLY at B (the freeze tick's condition step can stamp one
    // there, 1359-A §4.1) must still hold, with no closure contrary.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const B = 6240
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S', closedWeek: B })],
      conditionEvents: [
        { eventId: 'CE1', studioId: 'S', week: 100, from: 'stable', to: 'distress' },
        { eventId: 'CE2', studioId: 'S', week: 120, from: 'distress', to: 'recovery' },
        { eventId: 'CE3', studioId: 'S', week: 150, from: 'recovery', to: 'stable' },
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const survivor = archetype(manifest, 'S', 'resilient-survivor')
    expect(survivor.outcome).toBe('held') // the closedWeek=B closure reads open: it never counts
    expect(survivor.contrary).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════
// T. RED r4: OPEN-12, changed (1353-F4) -- "commercial while S was entered"
// means enteredWeek <= commercialWeek < end of S's span (closure, else B).
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: OPEN-12 changed, the pioneer entry gate (1353-F4)', () => {
  it('open-12-entrant-after-commercial-week-carries-no-contrary-for-it', async () => {
    // LATE-ENTRANT enters at week 1000, after BOTH technologies became
    // commercial (sync 416, lighting 936): it cannot pioneer either and is
    // not cited as late to either, whether it never adopts (sync-sound) or
    // adopts very late (lighting, operational at week 5000 -- long past
    // 936+260=1196, which WOULD be a late contrary under the old, ungated
    // reading). Under the ruled reading neither technology was ever
    // "commercial while S was entered", so contrary is empty for both.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'LATE-ENTRANT', enteredWeek: 1000 })],
      adoptions: [
        adoptionFact({ adoptionId: 'LATE-ENTRANT-LIGHT', studioId: 'LATE-ENTRANT', technologyId: 'lighting-control-01', operationalWeek: 5000 }),
      ],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const result = archetype(manifest, 'LATE-ENTRANT', 'technology-pioneer')
    expect(result.outcome).toBe('notHeld') // the lighting adoption is nowhere near a pioneer window either
    expect(result.qualifyingCount).toBe(0)
    expect(result.contraryCount).toBe(0)
    expect(result.contrary).toEqual([])
  })

  it('open-12-entrant-one-week-before-commercial-week-keeps-the-ref', async () => {
    // JUST-BEFORE enters one week before synchronized-sound's own
    // commercialWeek (416): enteredWeek(415) <= commercialWeek(416), so it IS
    // judged on sync-sound, and never adopting it earns the technology-id
    // contrary -- the boundary case the entry gate must not over-exclude.
    // Isolated to one technology so the default lighting-control-01 contrary
    // (commercial at 936, well after this studio's entry) cannot obscure it.
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'JUST-BEFORE', enteredWeek: SYNC_SOUND.commercialWeek - 1 })],
      technologies: [SYNC_SOUND],
    })
    const manifest = buildLegacyManifest(facts, 'official2040')
    const result = archetype(manifest, 'JUST-BEFORE', 'technology-pioneer')
    expect(result.contraryCount).toBe(1)
    expect(result.contrary.map((r: any) => r.id)).toEqual(['synchronized-sound'])
  })
})

// ═══════════════════════════════════════════════════════════════════════
// U. RED r4: OPEN-19, changed (1353-F4) -- settledWeek < releaseWeek refuses
// (fail loud: no real run settles before it opens).
// ═══════════════════════════════════════════════════════════════════════
describe('p15c1 campaign legacy: OPEN-19 changed, settledWeek before releaseWeek refuses (1353-F4)', () => {
  it('open-19-settled-week-before-release-week-refuses', async () => {
    const mod = await loadCampaignLegacy()
    const buildLegacyManifest = requireFn<(facts: LegacyFacts, kind: 'official2040' | 'endOfRun') => any>(
      mod, 'buildLegacyManifest',
    )
    const facts = baseFacts({
      studios: [studioFact({ studioId: 'S' })],
      films: [filmFact({ filmId: 'F-BAD', studioId: 'S', releaseWeek: 100, status: 'settled', settledWeek: 99, grossSettled: 0 })],
    })
    expect(() => buildLegacyManifest(facts, 'official2040')).toThrow()
  })
})
