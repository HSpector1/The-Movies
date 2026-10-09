import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { observeLedger, SEED, SUBJECT, WEEKS } from './witness-core.mjs'
import { worktreeFile } from './worktree-guard.mjs'
import { ADOPTION, BOUNDS, validateBoundsRoles } from './bounds-guard.mjs'

const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const first = { contractId: 'first', studioId: 'r01', terms: {
  talentId: SUBJECT, annualSalary: 395548, signingBonus: 71199, startWeek: 0,
}, endedWeek: null, reason: 'entry' }
const extra = Array.from({ length: 43 }, (_, i) => ({ contractId: `c${i}`, studioId: 'r02',
  terms: { talentId: `other-${i}`, annualSalary: 100 + i, signingBonus: 10 + i, startWeek: 0 },
  endedWeek: null, reason: 'entry' }))
const make = seed => {
  assert.equal(seed, SEED)
  return { market: { tick: 0 }, hollywood: { employment: [first, ...extra] },
    talent: [{ id: SUBJECT, age: 44 }], talentProvenance: { rows: [
      { personId: SUBJECT, kind: 'authored_exact_week', ageAtEntry: 44.36540781416331, entryWeek: 0 },
    ] }, talentMarket: { receipts: [] }, firstTakes: [], rngState: 'synthetic' }
}
const tick = state => ({ ...state, market: { tick: state.market.tick + 1 } })
const expected = { employment: sha([first, ...extra]), settlement: sha([]), receipts: sha([]),
  takes: sha([]), rng: 'synthetic' }

test('captures exactly 416 ticks and the existing first quote without pricing', () => {
  let calls = 0
  const result = observeLedger(make, state => { calls++; return tick(state) }, expected)
  assert.equal(calls, WEEKS)
  assert.equal(result.digests.employment, expected.employment)
  assert.equal(result.rows, 44)
  assert.deepEqual(JSON.parse(result.employmentBytes.toString('utf8')), [first, ...extra])
  assert.equal(result.firstQuote.committedAge, 44)
  assert.equal(result.firstQuote.row.terms.signingBonus, 71199)
})

test('wrong quote stops before any tick', () => {
  let calls = 0
  assert.throws(() => observeLedger(seed => {
    const state = make(seed)
    state.hollywood.employment[0] = { ...first, terms: { ...first.terms, annualSalary: 1 } }
    return state
  }, state => { calls++; return tick(state) }, expected), /STOP_FIRST_QUOTE/)
  assert.equal(calls, 0)
})

test('changed ledger digest and wrong horizon stop', () => {
  assert.throws(() => observeLedger(make, state => {
    const next = tick(state)
    if (next.market.tick === 416) next.hollywood = { employment: [...state.hollywood.employment.slice(0, 43),
      { ...extra[42], terms: { ...extra[42].terms, annualSalary: 999 } }] }
    return next
  }, expected), /STOP_CONTROL_EMPLOYMENT/)
  assert.throws(() => observeLedger(make, state => ({ ...state, market: { tick: 2 } }), expected), /STOP_TICK_HORIZON/)
})

test('inner deadline stops after bounded tick', () => {
  let now = 0
  assert.throws(() => observeLedger(make, state => { now = 720_001; return tick(state) }, expected, () => now), /STOP_INNER_DEADLINE/)
})

test('skip-worktree modification remains visible to direct byte guard', () => {
  const root = mkdtempSync(join(tmpdir(), 'witness-r5-worktree-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  try {
    git('init', '-q')
    writeFileSync(join(root, 'sample.ts'), 'original\n')
    git('add', 'sample.ts')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'sample')
    const blob = git('rev-parse', 'HEAD:sample.ts')
    const originalSha = createHash('sha256').update(readFileSync(join(root, 'sample.ts'))).digest('hex')
    assert.equal(worktreeFile(root, 'sample.ts', blob, originalSha), originalSha)
    git('update-index', '--skip-worktree', 'sample.ts')
    writeFileSync(join(root, 'sample.ts'), 'changed\n')
    assert.equal(git('status', '--porcelain=v1', '--untracked-files=all'), '')
    assert.throws(() => worktreeFile(root, 'sample.ts', blob, originalSha), /STOP_WORKTREE_BYTES/)
    symlinkSync('sample.ts', join(root, 'linked.ts'))
    assert.throws(() => worktreeFile(root, 'linked.ts', blob, originalSha), /STOP_WORKTREE_KIND/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('frozen external bounds review and parent adoption reject path substitution', () => {
  assert.equal(validateBoundsRoles({ ...BOUNDS }, { ...ADOPTION }).adoptionSha256, ADOPTION.sha256)
  assert.throws(() => validateBoundsRoles({ ...BOUNDS, reviewPath: BOUNDS.path }, { ...ADOPTION }),
    /STOP_BOUNDS_BINDING_PATH/)
  assert.throws(() => validateBoundsRoles({ ...BOUNDS }, { ...ADOPTION, path: BOUNDS.reviewPath }),
    /STOP_BOUNDS_BINDING_PATH/)
})
