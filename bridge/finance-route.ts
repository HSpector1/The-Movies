/** Presentation destinations only. These never authorize or execute an action. */
export type FinanceRoute = {
  kind: 'profile' | 'facilityHistory' | 'casting' | 'production' | 'releaseResult' | 'filmHistory' | 'development'
  targetId: string
  label: string
}
