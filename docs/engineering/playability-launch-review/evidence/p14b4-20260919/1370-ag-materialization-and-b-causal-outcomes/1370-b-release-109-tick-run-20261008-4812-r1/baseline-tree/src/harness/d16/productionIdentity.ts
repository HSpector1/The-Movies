// D-17B production configuration identity. Analysis-only: the production core never imports it.

import { TUNING } from '../../core/index.js'
import { PRODUCTION_PUBLICITY, publicityKey } from './publicity.js'

export function productionCounterFlowIdentity(): {
  authorization: 'production'
  baseline: number
  family: 'C'
  kappa: number
  revertMode: 'pullDownOnly'
} {
  return {
    authorization: 'production',
    baseline: TUNING.AWARENESS_DRIFT_ANCHOR,
    family: 'C',
    kappa: TUNING.AWARENESS_DRIFT_RATE,
    revertMode: 'pullDownOnly',
  }
}

/** Exact frozen candidate identity carried by every production-mode artifact. */
export function productionCandidateKey(): string {
  return (
    `D17B:drift=${String(TUNING.AWARENESS_DRIFT_RATE)}/${String(TUNING.AWARENESS_DRIFT_ANCHOR)}` +
    `;reach=${String(TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED)}/${String(TUNING.AWARENESS_REACH_NEUTRAL)}` +
    `;disc=${String(TUNING.DISC_SUPPORT_THRESHOLD)}/${String(TUNING.DISC_SPREAD)}/${String(TUNING.DISC_SUPPORT_EXP)}/${String(TUNING.DISC_FLOOR)}/rng=discovery-v1` +
    `;marketing=capacity:${TUNING.MARKETING_MENU_MULTIPLIERS.join(',')}` +
    `;publicity=${publicityKey(PRODUCTION_PUBLICITY)!}`
  )
}
