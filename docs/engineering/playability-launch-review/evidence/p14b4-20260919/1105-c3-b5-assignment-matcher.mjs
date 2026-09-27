// Pure error adapter only: no imports, state mutation, source access or gameplay.
// Exact frames emitted by the unchanged Save38 -> privateV37 -> Hollywood chain.
export const ASSIGNMENT_ERROR_PREFIX = [
  'validateSaveV37: state is invalid — ',
  'validateSaveV36: frozen V35 state is invalid — ',
  'validateSaveV35: frozen V34 state is invalid — ',
  'validateSaveV34: frozen V33 state is invalid — ',
  'validateSaveV33: frozen V32 state is invalid — ',
  'validateSaveV32: frozen V31 state is invalid — ',
  'validateSaveV31: frozen V30 state is invalid — ',
  'validateSaveV30: frozen V28 state is invalid — ',
  'validateSaveV28: frozen V27 state is invalid — ',
  'validateSaveV27: frozen V26 state is invalid — ',
  'validateSaveV26: frozen V25 state is invalid — ',
  'validateSaveV25: frozen V24 state is invalid — ',
].join('')

export function exactAssignmentCollisionPerson(message, collisions) {
  let personId = null, count = 0
  for (const row of collisions) {
    if (typeof row.personId !== 'string' || row.personId.length === 0) continue
    if (message === ASSIGNMENT_ERROR_PREFIX + 'Hollywood save: person ' + row.personId + ' has simultaneous active assignments') {
      personId = row.personId
      count++
    }
  }
  return count === 1 ? personId : null
}
