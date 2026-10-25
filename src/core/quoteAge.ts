// F17: delegated finite quote-age policy. Quote age is not property or subject age.
// v0 is the explicit interpretation of unstamped retained rows. Never rewrite those rows.
// v1 stamps new producers; max12 absorption preview age is a NEW bounded producer choice,
// aligned with the existing exclusive13-week disclosure lifetime, not recovered old law.
export type QuoteAgeKind = 'bilateralOffer' | 'disclosure' | 'absorptionPreview' | 'estateBid'
export type QuoteAgePolicyVersion = 0 | 1
export const QUOTE_AGE_POLICY_VERSION = 1 as const
const bounds = Object.freeze({
  bilateralOffer: Object.freeze({ min: 0, max: 3 }),
  disclosure: Object.freeze({ min: 0, max: 12 }),
  absorptionPreview: Object.freeze({ min: 0, max: 12 }),
  estateBid: Object.freeze({ min: 0, max: 13 }),
})
export const QUOTE_AGE_POLICIES = Object.freeze({ 0: bounds, 1: bounds })

/** Missing persisted stamps mean historical v0, never an implicit rewrite to v1. */
export function quoteAgeVersionRefusal(version: unknown): string | null {
  return version === undefined || version === 0 || version === 1 ? null : 'unknownQuoteAgePolicyVersion'
}

/** Every current acceptance revalidates finite age, including a retained unstamped v0 row. */
export function quoteAgeRefusal(kind: QuoteAgeKind, quotedAtWeek: number, week: number, version: unknown): string | null {
  const invalid = quoteAgeVersionRefusal(version)
  if (invalid !== null) return invalid
  if (!Number.isSafeInteger(quotedAtWeek) || quotedAtWeek < 0 || !Number.isSafeInteger(week) || week < 0) return 'invalidQuoteWeeks'
  const age = week - quotedAtWeek
  if (age < 0) return 'futureQuote'
  const policy = QUOTE_AGE_POLICIES[version === 1 ? 1 : 0][kind]
  if (age < policy.min) return 'quoteTooYoung'
  return age > policy.max ? 'quoteTooOld' : null
}
