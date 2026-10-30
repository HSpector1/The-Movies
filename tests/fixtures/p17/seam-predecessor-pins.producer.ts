// ── P17 seam predecessor pins — producer ─────────────────────────────────────
//
// Run ONCE on the UNMODIFIED reception/forecast (base 6510c971bed8079f7ca02e528b224988de092c87):
//   nice -n 10 npx vite-node tests/fixtures/p17/seam-predecessor-pins.producer.ts
// It writes seam-predecessor-pins.json beside itself. tests/p17-continuation-seam.test.ts asserts that
// the ABSENT continuation input reproduces these bytes after the seam lands. Not a test (no `.test.`).

import { writeFileSync } from 'node:fs'
import { computeForecast, type ForecastContext } from '../../../src/core/forecast.js'
import { resolveReception } from '../../../src/core/reception.js'
import { stream } from '../../../src/core/rng.js'
import { makeReceptionInputs, makeTalent } from '../../_fixtures.js'

const SEED = 'p17-seam-pins'

function fixture() {
  return makeReceptionInputs({
    cast: {
      lead: makeTalent({ id: 'lead', role: 'actor', skill: 60, fame: 70 }),
      antagonist: makeTalent({ id: 'ant', role: 'actor', skill: 55, fame: 30 }),
      support: makeTalent({ id: 'sup', role: 'actor', skill: 50, fame: 10 }),
    },
    writer: makeTalent({ id: 'writer', role: 'writer', skill: 60 }),
    director: makeTalent({ id: 'director', role: 'director', skill: 65 }),
    standing: { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 },
  })
}

const ctx: ForecastContext = { seed: 'p17-seam', productionId: 'prod-1', directorId: 'director', releasedFilms: [], concepts: [] }
const r = resolveReception(fixture(), stream(SEED, 'hollywood-v1', 'pin:reception'))
const e = resolveReception(fixture(), stream(SEED, 'hollywood-v1', 'pin:reception'), true, true, 0.25)
const f = computeForecast(fixture(), ctx)
const pins = {
  base: '6510c971bed8079f7ca02e528b224988de092c87',
  seed: SEED,
  reception: { opening: r.opening, total: r.total, criticScore: r.criticScore, legs: r.legs, awarenessFactor: r.awarenessFactor },
  receptionEngaged: { opening: e.opening, total: e.total, legs: e.legs },
  forecast: { expectedOpening: f.expectedOpening, expectedTotal: f.expectedTotal, expectedCriticScore: f.expectedCriticScore },
}
writeFileSync(new URL('./seam-predecessor-pins.json', import.meta.url), JSON.stringify(pins, null, 2) + '\n')
console.log(JSON.stringify(pins))
