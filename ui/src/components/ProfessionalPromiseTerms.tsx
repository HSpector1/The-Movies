import type { BridgeMarketPromiseHistoryRow } from '../../../bridge/schema/bridge-schema.ts'

type PromiseTerms = Pick<BridgeMarketPromiseHistoryRow,
  'family' | 'count' | 'qualifyingRole' | 'seatClass' | 'windowStartWeek' | 'dueWeekExclusive'>

export type ProfessionalPromiseTermsProps =
  | { disclosure: 'UNKNOWN' }
  | { disclosure: 'own' | 'waiver'; terms: PromiseTerms }
  | { disclosure: 'history'; terms: PromiseTerms; progress: number; outcome: BridgeMarketPromiseHistoryRow['outcome'] }

/** Renders disclosed facts only; no engine reads or private promise authority. */
export function ProfessionalPromiseTerms(props: ProfessionalPromiseTermsProps) {
  if (props.disclosure === 'UNKNOWN') return <p>Promise terms unknown</p>
  const { terms } = props
  const work = terms.qualifyingRole === 'director' ? 'directing' : 'filming'
  const role = terms.qualifyingRole === 'director' || terms.seatClass === null ? ''
    : terms.seatClass === 'lead' ? ' in a lead role' : ' in a lead or antagonist role'
  const title = props.disclosure === 'waiver' ? 'Substitute promise'
    : props.disclosure === 'history' ? 'Promise record' : 'Promise'
  return <section aria-label={title}>
    <p>Begin {work} on {terms.count} production{terms.count === 1 ? '' : 's'}{role}.</p>
    <p>From Week {terms.windowStartWeek} through Week {terms.dueWeekExclusive - 1}
      {' '}(before Week {terms.dueWeekExclusive}).</p>
    {props.disclosure === 'history' && <p>{props.progress} of {terms.count} begun · {props.outcome ?? 'Open'}</p>}
  </section>
}
