// Installed exact independent106; post-patch table evidence is separate from behavioral RED67.
// INERT / UNEXECUTED. Intended tests/p14b4-d3-matching.test.ts.
// Independent POST-patch table coverage of the adopted B4 D3 match law.
// No claim that this new API was exercised in the historical behavioral RED67.
import { describe, expect, it } from 'vitest'
import { careerIdentity } from '../src/core/talentSummary.js'
import { promiseMatchesPreferredOpportunity, publicPreferredOpportunity } from '../src/core/talentMarket.js'
import type { GameState, ProfessionalPromiseV30 } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

type Material = Pick<ProfessionalPromiseV30, 'family' | 'predicate'>
const P1 = { family: 'APPEARANCE_COUNT', predicate: { count: 1 } } as const satisfies Material
const P2_LEAD = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
  predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' } } as const satisfies Material
const P2_FLEX = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
  predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' } } as const satisfies Material

function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}

function readFixture(age: 29 | 30): { state: GameState; id: string } {
  const generated = p13aGeneratedStudio()
  const beforeGenerated = structuredClone(generated)
  const subject = generated.talent.find((person) => person.age < 30
    && Object.values(person.workHistory).every((count) => count === 0))
  if (subject === undefined) throw new Error('fixture: genuine generated uncredited subject required')
  expect(careerIdentity(subject).identityDisciplines).toEqual([])
  // Explicit pure-read input variant, NOT a birthday, game action, save or
  // fabricated past career. Preserve the complete subject except this age.
  const state = { ...generated, talent: generated.talent.map((person) => person.id === subject.id ? { ...person, age } : person) }
  const changed = state.talent.find((person) => person.id === subject.id)!
  expect({ ...changed, age: subject.age }).toEqual(subject)
  expect(changed.workHistory).toEqual(subject.workHistory)
  expect(careerIdentity(changed).identityDisciplines).toEqual([])
  expect({ ...state, talent: generated.talent }).toEqual(generated)
  expect(generated).toEqual(beforeGenerated)
  // Literal expected preference; do not infer it from priority-array position.
  expect(publicPreferredOpportunity(state, subject.id)).toBe(age === 29 ? 'significantCastRole' : 'anyCastAppearance')
  return { state, id: subject.id }
}

function checkRead(state: GameState, id: string, promise: Material, expected: boolean): void {
  const beforeState = structuredClone(state)
  const beforePromise = structuredClone(promise)
  expect(promiseMatchesPreferredOpportunity(freeze(state), id, freeze(promise))).toBe(expected)
  expect(state).toEqual(beforeState) // includes history, promises, receipts, ledger and RNG
  expect(promise).toEqual(beforePromise)
}

const pairs = [
  { age: 29, label: 'significant / P1', promise: P1, matches: false },
  { age: 29, label: 'significant / P2 lead', promise: P2_LEAD, matches: true },
  { age: 29, label: 'significant / P2 flexible', promise: P2_FLEX, matches: true },
  { age: 30, label: 'any appearance / P1', promise: P1, matches: true },
  { age: 30, label: 'any appearance / P2 lead', promise: P2_LEAD, matches: true },
  { age: 30, label: 'any appearance / P2 flexible', promise: P2_FLEX, matches: true },
] as const

describe('B4 D3 public pure matcher: literal adopted match table', () => {
  it.each(pairs)('$label matches=$matches without mutating the read input', ({ age, promise, matches }) => {
    const { state, id } = readFixture(age)
    checkRead(state, id, promise, matches)
  })

  it.each([29, 30] as const)('at age%i, historical untagged P2 and other families acquire no invented cast class', (age) => {
    const { state, id } = readFixture(age)
    const neutral: readonly Material[] = [
      { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { count: 1 } },
      { family: 'DIRECTING_COUNT', predicate: { count: 1 } },
      { family: 'PREFERRED_GENRE_OPPORTUNITY', predicate: { count: 1 } },
      { family: 'SPECIFIC_PROJECT', predicate: { count: 1 } },
    ]
    for (const promise of neutral) {
      expect(promise.predicate).not.toHaveProperty('kind')
      expect(promise.predicate).not.toHaveProperty('seatClass')
      checkRead(state, id, promise, false)
    }
  })
})
