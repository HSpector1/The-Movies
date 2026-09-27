import type { BridgeMarketPromiseHistoryRow } from '../../../bridge/schema/bridge-schema.ts'

type PromiseTerms = Pick<BridgeMarketPromiseHistoryRow,
  'family' | 'count' | 'qualifyingRole' | 'seatClass' | 'genre' | 'scriptProjectId' | 'scriptProjectTitle' | 'windowStartWeek' | 'dueWeekExclusive'>

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
    : terms.seatClass === 'allCast' ? ' in a lead, antagonist or support role'
      : terms.seatClass === 'lead' ? ' in a lead role' : ' in a lead or antagonist role'
  const genre = terms.genre === undefined ? '' : `${terms.genre} `
  const project = terms.scriptProjectId === undefined ? ''
    : terms.scriptProjectTitle === undefined ? ' of the selected screenplay' : ` of “${terms.scriptProjectTitle}”`
  const title = props.disclosure === 'waiver' ? 'Substitute promise'
    : props.disclosure === 'history' ? 'Promise record' : 'Promise'
  return <section aria-label={title}>
    <p>Begin {work} on {terms.count} {genre}production{terms.count === 1 ? '' : 's'}{project}{role}.</p>
    <p>From Week {terms.windowStartWeek} through Week {terms.dueWeekExclusive - 1}
      {' '}(before Week {terms.dueWeekExclusive}).</p>
    {props.disclosure === 'history' && <p>{props.progress} of {terms.count} begun · {props.outcome ?? 'Open'}</p>}
  </section>
}
