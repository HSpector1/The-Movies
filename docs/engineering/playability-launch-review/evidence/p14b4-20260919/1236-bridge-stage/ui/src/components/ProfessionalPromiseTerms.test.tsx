import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, within } from '@testing-library/react'
import { ProfessionalPromiseTerms, type ProfessionalPromiseTermsProps } from './ProfessionalPromiseTerms.tsx'

afterEach(cleanup)

type Terms = Extract<ProfessionalPromiseTermsProps, { disclosure: 'history' }>['terms']

// Closed-projection presentation controls only: no engine, session or saved-state authority.
const privateFields = {
  inputsDigest: 'PRIVATE_DIGEST_1179',
  issuerStudioId: 'PRIVATE_ISSUER_1179',
  beneficiaryPersonId: 'PRIVATE_PERSON_1179',
  predicate: { kind: 'PRIVATE_PREDICATE_1179', count: 997 },
  feasibilityReceipt: { rulesVersion: 997, bottlenecks: ['PRIVATE_BOTTLENECK_1179'] },
  evidenceRefs: ['PRIVATE_EVIDENCE_1179'],
}
const privateTokens = [
  ...Object.keys(privateFields), 'rulesVersion', 'bottlenecks', 'PRIVATE_DIGEST_1179',
  'PRIVATE_ISSUER_1179', 'PRIVATE_PERSON_1179', 'PRIVATE_PREDICATE_1179',
  'PRIVATE_BOTTLENECK_1179', 'PRIVATE_EVIDENCE_1179', '997',
]

describe('ProfessionalPromiseTerms closed disclosure', () => {
  it('D16 renders own, unknown, history and waiver terms without private authority', () => {
    const director: Terms = { family: 'DIRECTING_COUNT', count: 2, qualifyingRole: 'director',
      seatClass: null, windowStartWeek: 52, dueWeekExclusive: 112 }
    // The same family can retain historical classless cast meaning; this is a DTO control,
    // not a claim that a naturally captured historical P3 was authored by the current engine.
    const legacyCast: Terms = { ...director, qualifyingRole: 'cast' }
    const examples: { terms: Terms; work: string; window: string }[] = [
      { terms: director, work: 'Begin directing on 2 productions.',
        window: 'From Week 52 through Week 111 (before Week 112).' },
      { terms: legacyCast, work: 'Begin filming on 2 productions.',
        window: 'From Week 52 through Week 111 (before Week 112).' },
      { terms: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 1, qualifyingRole: 'cast',
        seatClass: 'lead', windowStartWeek: 7, dueWeekExclusive: 9 },
      work: 'Begin filming on 1 production in a lead role.',
      window: 'From Week 7 through Week 8 (before Week 9).' },
      { terms: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 3, qualifyingRole: 'cast',
        seatClass: 'leadOrAntagonist', windowStartWeek: 10, dueWeekExclusive: 14 },
      work: 'Begin filming on 3 productions in a lead or antagonist role.',
      window: 'From Week 10 through Week 13 (before Week 14).' },
    ]
    const unknown = { disclosure: 'UNKNOWN' as const, terms: { ...director, ...privateFields }, ...privateFields }
    const unknownBefore = JSON.stringify(unknown)
    const view = render(<ProfessionalPromiseTerms {...unknown} />)
    expect(view.container.textContent).toBe('Promise terms unknown')
    expect(view.queryByRole('region')).toBeNull()
    for (const token of [...privateTokens, 'directing', 'filming', 'Week', '112']) {
      expect(view.container.innerHTML).not.toContain(token)
    }
    expect(JSON.stringify(unknown)).toBe(unknownBefore)

    for (const example of examples) {
      for (const disclosure of ['own', 'waiver', 'history'] as const) {
        const outcomes = disclosure === 'history' ? [null, 'SATISFIED'] as const : [null] as const
        for (const outcome of outcomes) {
          // Extra runtime fields are deliberately present despite the closed public prop type.
          // They must neither influence the selected public meaning nor appear in text/markup.
          const terms = { ...example.terms, ...privateFields }
          const props: ProfessionalPromiseTermsProps = disclosure === 'history'
            ? { disclosure, terms, progress: 1, outcome }
            : { disclosure, terms }
          const supplied = { ...props, ...privateFields }, before = JSON.stringify(supplied)
          view.rerender(<ProfessionalPromiseTerms {...supplied} />)
          const title = disclosure === 'own' ? 'Promise' : disclosure === 'waiver' ? 'Substitute promise' : 'Promise record'
          const section = view.getByRole('region', { name: title })
          const paragraphs = Array.from(section.querySelectorAll('p'), node => node.textContent)
          expect(paragraphs).toEqual([example.work, example.window,
            ...(disclosure === 'history' ? [`1 of ${example.terms.count} begun · ${outcome ?? 'Open'}`] : [])])
          expect(within(section).getByText(example.work)).toBeInTheDocument()
          expect(section.textContent).not.toContain(example.terms.qualifyingRole === 'director' ? 'filming' : 'directing')
          if (example.terms.seatClass === null) expect(section.textContent).not.toMatch(/lead|antagonist/)
          for (const token of privateTokens) expect(view.container.innerHTML).not.toContain(token)
          expect(JSON.stringify(supplied)).toBe(before)
        }
      }
    }
  })
})

describe('ProfessionalPromiseTerms disclosed opportunity material', () => {
  it('B55-UI renders singular genre and named screenplay terms while UNKNOWN hides all material', () => {
    const title = 'A Season of Constellation', projectId = 'CANONICAL_PROJECT_DO_NOT_RENDER_1236'
    const window = 'From Week 52 through Week 111 (before Week 112).'
    const examples: { terms: Terms; work: string }[] = []
    for (const [seatClass, role] of [
      ['allCast', 'lead, antagonist or support'], ['lead', 'lead'], ['leadOrAntagonist', 'lead or antagonist'],
    ] as const) {
      examples.push({ terms: { family: 'PREFERRED_GENRE_OPPORTUNITY', count: 1, qualifyingRole: 'cast',
        seatClass, genre: 'drama', windowStartWeek: 52, dueWeekExclusive: 112 },
      work: `Begin filming on 1 drama production in a ${role} role.` })
      examples.push({ terms: { family: 'SPECIFIC_PROJECT', count: 1, qualifyingRole: 'cast',
        seatClass, scriptProjectId: projectId, scriptProjectTitle: title, windowStartWeek: 52, dueWeekExclusive: 112 },
      work: `Begin filming on 1 production of “${title}” in a ${role} role.` })
    }
    // Same-family old count DTOs omit material: no inferred genre/project restriction.
    for (const family of ['PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const) {
      examples.push({ terms: { family, count: 2, qualifyingRole: 'cast', seatClass: null,
        windowStartWeek: 52, dueWeekExclusive: 112 }, work: 'Begin filming on 2 productions.' })
    }
    // A refused unresolved draft may have no disclosed title; use a generic label, never the raw id.
    examples.push({ terms: { family: 'SPECIFIC_PROJECT', count: 1, qualifyingRole: 'cast', seatClass: 'allCast',
      scriptProjectId: projectId, windowStartWeek: 52, dueWeekExclusive: 112 },
    work: 'Begin filming on 1 production of the selected screenplay in a lead, antagonist or support role.' })
    const hidden = { disclosure: 'UNKNOWN' as const, terms: { ...examples[1]!.terms, genre: 'PRIVATE_GENRE_1236', ...privateFields },
      scriptProjectTitle: title, scriptProjectId: projectId, ...privateFields }
    const hiddenBefore = JSON.stringify(hidden), view = render(<ProfessionalPromiseTerms {...hidden} />)
    expect(view.container.textContent).toBe('Promise terms unknown'); expect(view.queryByRole('region')).toBeNull()
    for (const token of [...privateTokens, title, projectId, 'PRIVATE_GENRE_1236', 'drama', 'Week', 'genre', 'scriptProject']) {
      expect(view.container.innerHTML).not.toContain(token)
    }
    expect(JSON.stringify(hidden)).toBe(hiddenBefore)
    for (const example of examples) for (const disclosure of ['own', 'waiver', 'history'] as const) {
      const outcomes = disclosure === 'history' ? [null, 'SATISFIED', 'WAIVED'] as const : [null] as const
      for (const outcome of outcomes) {
        const props: ProfessionalPromiseTermsProps = disclosure === 'history'
          ? { disclosure, terms: { ...example.terms, ...privateFields }, progress: 0, outcome }
          : { disclosure, terms: { ...example.terms, ...privateFields } }
        const supplied = { ...props, ...privateFields }, before = JSON.stringify(supplied)
        view.rerender(<ProfessionalPromiseTerms {...supplied} />)
        const name = disclosure === 'own' ? 'Promise' : disclosure === 'waiver' ? 'Substitute promise' : 'Promise record'
        const region = view.getByRole('region', { name })
        expect(Array.from(region.querySelectorAll('p'), node => node.textContent)).toEqual([example.work, window,
          ...(disclosure === 'history' ? [`0 of ${example.terms.count} begun · ${outcome ?? 'Open'}`] : [])])
        expect(region.textContent).not.toContain('directing')
        for (const token of [...privateTokens, projectId]) expect(view.container.innerHTML).not.toContain(token)
        if (example.terms.genre === undefined) expect(region.textContent).not.toContain('drama')
        if (example.terms.scriptProjectId === undefined) expect(region.textContent).not.toContain(title)
        if (example.terms.seatClass === null) expect(region.textContent).not.toMatch(/lead|antagonist|support/)
        expect(JSON.stringify(supplied)).toBe(before)
      }
    }
  })
})
