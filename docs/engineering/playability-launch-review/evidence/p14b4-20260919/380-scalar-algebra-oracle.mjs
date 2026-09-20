// INDEPENDENT HYPOTHESIS ORACLE — no production imports or implementation claim.
// Parent owns execution. Original nested formulas are evaluated with exact BigInt.
import assert from 'node:assert/strict'

const C = 200001
const BIG_C = 200001n
const MAX_SAFE = Number.MAX_SAFE_INTEGER

function validInteger(value, name) {
  assert.ok(Number.isSafeInteger(value) && value >= 0, `${name} must be a nonnegative safe integer`)
}

// Exact reference arithmetic. In particular, multiply before saturation:
// saturation is NOT permission to turn 0 * an already-ceiling operand into C.
function saturatedBig(value) {
  return value < BIG_C ? value : BIG_C
}
function productBig(left, right) {
  return saturatedBig(left * right)
}
function oldEqualityBig(length) {
  return saturatedBig(1n + productBig(2n, BigInt(length)))
}
function oldKeyBillBig(count, length) {
  const l = BigInt(length), n = BigInt(count)
  return saturatedBig(1n + l + productBig(n, saturatedBig(1n + 2n * l)))
}

// Explicitly HYPOTHETICAL Number rewrites supplied for examination. These do
// not import, wrap, inspect or impersonate an actual production calculator.
function candidateEqualityNumber(length) {
  return length >= 100000 ? C : 1 + 2 * length
}
function candidateKeyBillNumber(count, length) {
  if (length >= C) return C
  const base = 1 + length
  const unit = 1 + 2 * length
  if (count > Math.floor((C - base) / unit)) return C
  return base + count * unit
}

const counts = {
  referenceSanity: 0,
  equalityBoundary: 0,
  keyBillBoundary: 0,
  equalityLargeEdges: 0,
  keyBillLargeEdges: 0,
}

function referenceSanity(actual, expected, label) {
  assert.equal(actual, expected, `BigInt reference sanity: ${label}`)
  counts.referenceSanity++
}
referenceSanity(productBig(BIG_C, 0n), 0n, 'ceiling times zero')
referenceSanity(productBig(0n, BigInt(MAX_SAFE)), 0n, 'zero times large operand')
referenceSanity(productBig(BIG_C, 1n), BIG_C, 'ceiling times one')
referenceSanity(productBig(BigInt(MAX_SAFE), 2n), BIG_C, 'large positive product')
referenceSanity(oldEqualityBig(0), 1n, 'equality zero length')
referenceSanity(oldEqualityBig(99999), 199999n, 'equality below saturation')
referenceSanity(oldEqualityBig(100000), BIG_C, 'equality saturation boundary')
referenceSanity(oldKeyBillBig(0, 0), 1n, 'zero count and length')
referenceSanity(oldKeyBillBig(0, C - 2), BigInt(C - 1), 'zero count preserves unsaturated base')
referenceSanity(oldKeyBillBig(MAX_SAFE, 0), BIG_C, 'large count, unit one')
referenceSanity(oldKeyBillBig(0, MAX_SAFE), BIG_C, 'zero product, independently saturated outer base')

function compareEquality(length, group) {
  validInteger(length, 'L')
  const expected = oldEqualityBig(length)
  const actual = candidateEqualityNumber(length)
  assert.ok(Number.isSafeInteger(actual) && actual >= 0 && actual <= C,
    `equality output domain: L=${length}, actual=${actual}`)
  assert.equal(BigInt(actual), expected,
    `FIRST MISMATCH equality: L=${length}; actual=${actual}; expected=${expected}`)
  counts[group]++
}

function compareKeyBill(count, length, group) {
  validInteger(count, 'N')
  validInteger(length, 'L')
  const expected = oldKeyBillBig(count, length)
  const actual = candidateKeyBillNumber(count, length)
  assert.ok(Number.isSafeInteger(actual) && actual >= 0 && actual <= C,
    `keyBill output domain: N=${count}, L=${length}, actual=${actual}`)
  assert.equal(BigInt(actual), expected,
    `FIRST MISMATCH keyBill: N=${count}, L=${length}; actual=${actual}; expected=${expected}`)
  counts[group]++
}

// Complete bounded L sweep, including both endpoints. Derive the division edge
// in exact BigInt, independently of Number's division/floor in the candidate.
// Local Set removes only repeated input pairs, never a failing observation.
for (let length = 0; length <= C + 1; length++) {
  compareEquality(length, 'equalityBoundary')
  const selectedCounts = new Set([0, 1, 2])
  const residual = BIG_C - (1n + BigInt(length))
  if (residual >= 0n) {
    const threshold = residual / (1n + 2n * BigInt(length))
    for (const delta of [-1n, 0n, 1n]) {
      const n = threshold + delta
      if (n >= 0n) selectedCounts.add(Number(n))
    }
  }
  for (const count of selectedCounts) compareKeyBill(count, length, 'keyBillBoundary')
}

// Includes zero, already-C operands, equality cutoff, both sides of the exact
// division envelope, and adjacent integers near Number's safe-integer boundary.
const largeEdges = [...new Set([
  0, 1, 2,
  99999, 100000, 100001,
  C - 2, C - 1, C, C + 1, C + 2, 2 * C,
  2 ** 52 - 1, 2 ** 52, 2 ** 52 + 1,
  MAX_SAFE - 2, MAX_SAFE - 1, MAX_SAFE,
])]
for (const length of largeEdges) {
  compareEquality(length, 'equalityLargeEdges')
  for (const count of largeEdges) compareKeyBill(count, length, 'keyBillLargeEdges')
}

// Reaching this line means every asserted finite case completed. On the first
// mismatch the process throws instead, with exact input/expected/actual values.
console.log(JSON.stringify({
  oracle: '380-scalar-algebra-hypotheses',
  status: 'PASS',
  ceiling: C,
  boundaryLengthMinimum: 0,
  boundaryLengthMaximum: C + 1,
  largeEdgeCount: largeEdges.length,
  counts,
  candidateComparisons: counts.equalityBoundary + counts.keyBillBoundary +
    counts.equalityLargeEdges + counts.keyBillLargeEdges,
  productionImports: 0,
  scope: 'Finite algebra comparisons only; no implementation, prepayment, numerical-fit or runtime-performance proof',
}))
