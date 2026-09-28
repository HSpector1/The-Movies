// 984 B1 / 995: independently coherent questions must still match retained facts.
// The test-only encoder follows the published946 tuple, never the production
// transition digest helper. Detached mutants are not historical fixtures.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { fnv1a64 } from '../src/core/math.js'
import { stableStringify } from '../src/core/save.js'
import { FOCUS, chosen, clone, compareText, envelope38, saveApi } from './helpers/p14c3-fixtures.js'
import type { Evaluation, PictureRef, Save38, TargetInput } from './helpers/p14c3-fixtures.js'

function questionDigest(question: Evaluation): string {
  const input = question.inputs
  const targets = input.targets.map(target => [target.profession, target.capability, target.roleTier,
    target.workHistory, target.proven, target.potentialTier, target.contextCount, target.contextBand,
    [target.contextWitness.counterpartId, target.contextWitness.pictures.map(picture => [picture.studioId, picture.pictureId])]])
  return fnv1a64(JSON.stringify([1, question.personId, question.week,
    [question.source.personId, question.source.profession],
    [input.age, input.actingFirstTakes, input.leadFirstTakes, input.actingWitnesses, targets]]))
}
function evaluation(save: Save38, id: string): Evaluation {
  const rows = save.state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function target(question: Evaluation, profession: 'director' | 'writer'): TargetInput {
  const value = question.inputs.targets.find(row => row.profession === profession)
  assert.ok(value)
  return value
}
let accepted: Save38 | undefined
function control(): Save38 {
  if (accepted === undefined) {
    const actual = envelope38(chosen())
    expect(saveApi('validateSaveV41')(actual)).toBe(actual)
    const reencoded = clone(actual)
    for (const id of Object.values(FOCUS)) {
      const row = evaluation(reencoded, id)
      expect(questionDigest(row), 'independent946 encoder must first admit the actual recorded question').toBe(row.inputsDigest)
      row.inputsDigest = questionDigest(row)
    }
    expect(saveApi('validateSaveV41')(reencoded)).toBe(reencoded)
    expect(stableStringify(reencoded)).toBe(stableStringify(actual))
    accepted = actual
  }
  return clone(accepted)
}
const pictureOrder = (a: PictureRef, b: PictureRef) => compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId)
function coherentRefusal(id: string, edit: (row: Evaluation, save: Save38) => void, cause: RegExp): void {
  const original = control(), before = stableStringify(original), malformed = clone(original)
  expect(saveApi('validateSaveV41')(original)).toBe(original)
  const row = evaluation(malformed, id), oldDigest = row.inputsDigest
  const outcome = { outcome: row.outcome, selected: row.selected, reason: row.reason }
  edit(row, malformed)
  row.inputsDigest = questionDigest(row)
  expect(row.inputsDigest).toMatch(/^[0-9a-f]{16}$/)
  expect(row.inputsDigest).not.toBe(oldDigest)
  expect({ outcome: row.outcome, selected: row.selected, reason: row.reason }).toEqual(outcome)
  expect(malformed.state.firstTakes).toEqual(original.state.firstTakes)
  expect(malformed.state.studio.releasedFilms).toEqual(original.state.studio.releasedFilms)
  expect(malformed.state.hollywood).toEqual(original.state.hollywood)
  expect(() => saveApi('validateSaveV41')(malformed)).toThrow(cause)
  expect(stableStringify(original)).toBe(before)
}

describe('C.3 B1 retained evidence independently binds coherent recorded questions', () => {
  it('B1-01 accepts independent question encoding with exact totals and genuine bounded references', () => {
    const saved = control(), state = saved.state, owner = state.hollywood!.playerStudioId
    for (const id of Object.values(FOCUS)) {
      const row = evaluation(saved, id)
      const takes = state.firstTakes.filter(take => take.week <= row.week && Object.values(take.cast).includes(id))
        .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
          || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
      const takesByPicture = new Set(takes.map(take => JSON.stringify([take.studioId, take.productionId])))
      expect(takesByPicture.size).toBe(3)
      expect(takes).toHaveLength(takesByPicture.size)
      expect(row.inputs.actingFirstTakes).toBe(takesByPicture.size)
      expect(row.inputs.actingWitnesses).toEqual(takes.map(take => take.eventId))
      const leads = takes.filter(take => take.cast.lead === id)
      expect(row.inputs.leadFirstTakes).toBe(leads.length)
      const directing = target(row, 'director')
      if (id === FOCUS.director) {
        expect(leads).toHaveLength(3)
        expect(new Set(leads.map(take => take.directorId))).toEqual(new Set([directing.contextWitness.counterpartId]))
        const pictures = leads.map(take => ({ studioId: take.studioId, pictureId: take.productionId })).sort(pictureOrder)
        expect(directing.contextCount).toBe(pictures.length)
        expect(directing.contextWitness.pictures).toEqual(pictures.slice(0, 2))
      } else {
        expect(leads).toEqual([])
        expect(directing).toMatchObject({ contextCount: 0, contextBand: 0, contextWitness: { counterpartId: null, pictures: [] } })
      }
      const films = state.studio.releasedFilms.filter(film => film.releaseTick <= row.week && film.participants !== undefined
        && Object.values(film.participants.cast).some(credit => credit.talentId === id))
      expect(films).toHaveLength(3)
      // This bounded genuine corpus has only captured player credits for these
      // subjects. Wider cross-representation and authored-entry cases remain971.
      expect(state.hollywood!.films.some(film => film.credits.some(credit => credit.talentId === id))).toBe(false)
      const writing = target(row, 'writer')
      expect(new Set(films.map(film => film.participants!.writer.talentId))).toEqual(new Set([writing.contextWitness.counterpartId]))
      const pictures = films.map(film => ({ studioId: owner, pictureId: film.productionId })).sort(pictureOrder)
      expect(new Set(pictures.map(picture => JSON.stringify([picture.studioId, picture.pictureId]))).size).toBe(3)
      expect(writing.contextCount).toBe(pictures.length)
      expect(writing.contextWitness.pictures).toEqual(pictures.slice(0, 2))
      expect(writing.contextCount).toBeGreaterThan(writing.contextWitness.pictures.length)
      expect(row.inputs.actingFirstTakes).toBe(row.inputs.actingWitnesses.length)
      expect(questionDigest(row)).toBe(row.inputsDigest)
    }
    expect(saveApi('validateSaveV41')(saved)).toBe(saved)
  })

  it('B1-02 refuses a digest-correct total of four with three actual takes and three witnesses', () => {
    coherentRefusal(FOCUS.director, row => {
      expect(row.inputs).toMatchObject({ actingFirstTakes: 3, leadFirstTakes: 3 })
      expect(row.inputs.actingWitnesses).toHaveLength(3)
      row.inputs.actingFirstTakes = 4
    }, /acting counts or bounded witness differ from retained evidence/)
  })

  it('B1-03 refuses a digest-correct lead total of two against three actual lead takes', () => {
    coherentRefusal(FOCUS.director, row => {
      expect(row.inputs).toMatchObject({ actingFirstTakes: 3, leadFirstTakes: 3 })
      row.inputs.leadFirstTakes = 2
    }, /acting counts or bounded witness differ from retained evidence/)
  })

  it('B1-04 refuses a digest-correct directing total reduced to its two-witness cap', () => {
    coherentRefusal(FOCUS.director, row => {
      const value = target(row, 'director')
      expect(value).toMatchObject({ contextCount: 3, contextBand: 2 })
      expect(value.contextWitness.pictures).toHaveLength(2)
      value.contextCount = 2
    }, /target context count or bounded witness differs from retained evidence/)
  })

  it('B1-05 refuses a digest-correct writing total reduced to its two-witness cap', () => {
    coherentRefusal(FOCUS.writer, row => {
      const value = target(row, 'writer')
      expect(value).toMatchObject({ contextCount: 3, contextBand: 2 })
      expect(value.contextWitness.pictures).toHaveLength(2)
      value.contextCount = 2
    }, /target context count or bounded witness differs from retained evidence/)
  })

  it('B1-06 refuses genuine take witnesses rotated out of canonical order with a fresh digest', () => {
    coherentRefusal(FOCUS.director, row => {
      const refs = row.inputs.actingWitnesses
      expect(new Set(refs).size).toBe(3)
      row.inputs.actingWitnesses = [refs[1]!, refs[2]!, refs[0]!]
    }, /acting counts or bounded witness differ from retained evidence/)
  })

  it('B1-07 refuses genuine context pictures reversed out of canonical order with a fresh digest', () => {
    coherentRefusal(FOCUS.director, row => {
      const refs = target(row, 'director').contextWitness.pictures
      expect(refs).toHaveLength(2)
      expect(refs[0]).not.toEqual(refs[1])
      refs.reverse()
    }, /target context count or bounded witness differs from retained evidence/)
  })

  it('B1-08 refuses a real but wrong counterpart despite valid picture ids and a fresh digest', () => {
    coherentRefusal(FOCUS.director, (row, saved) => {
      const directing = target(row, 'director'), replacement = target(row, 'writer').contextWitness.counterpartId
      assert.ok(replacement)
      expect(replacement).not.toBe(directing.contextWitness.counterpartId)
      expect(saved.state.talent.some(person => person.id === replacement)).toBe(true)
      directing.contextWitness.counterpartId = replacement
    }, /target context count or bounded witness differs from retained evidence/)
  })
})
