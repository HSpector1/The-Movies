// 1363-N group 5: an independent expected-value oracle for the two additive
// Save46 recovery fields. Never feed this projection to production as a state.
// The caller supplies its existing, independently constructed pre-recovery
// expectation; every old field and every historical finance period is retained.
import assert from 'node:assert/strict'

type PreRecoveryState = { hollywood: { businesses: readonly {
  account: { periods: readonly { movements: object }[] }
}[] } | null }

export function withEmptyRecovery<T extends PreRecoveryState>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood,
    businesses: state.hollywood.businesses.map(business => {
      assert.equal(Object.hasOwn(business, 'costCutting'), false, 'expected input must predate recovery')
      return { ...business, costCutting: { version: 1, since: null },
        account: { ...business.account, periods: business.account.periods.map(period => {
          assert.equal(Object.hasOwn(period.movements, 'facilityDemolitionRefund'), false,
            'expected input period must predate recovery')
          return { ...period, movements: { ...period.movements, facilityDemolitionRefund: 0 } }
        }) } }
    }),
  } }
}
