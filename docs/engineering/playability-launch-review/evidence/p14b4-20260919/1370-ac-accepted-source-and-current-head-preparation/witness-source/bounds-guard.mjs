import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export const HISTORICAL_SOURCE = '3aaf55e0c06c4b745b0b722cc56913050b1ee229'
export const BOUNDS = Object.freeze({
  path: '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-source-r6/AMENDMENT-BOUNDS-PROPOSED.md',
  sha256: '3e705b81cd4991b628eff0a084e8088f53005be49098ee449b025c1d8606f0d4',
  reviewPath: '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-bounds-independent-design-review-r1/RECEIPT.json',
  reviewSha256: '8dc9c50b2ba7edf3702b42fd3dbeefb2e26e4089891af32127fa816c1704df3d',
})
export const ADOPTION = Object.freeze({
  path: '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-bounds-parent-adoption-r1/ADOPTION.json',
  sha256: '6b4b83cd3470a9a882d8045ae6300bca0a39635c793c4a3b312c8d0fed94dc46',
})
const SOURCE_REVIEW_PATH = '/Users/zacheryspector/studio-scratch/1370-c0-aging-era-employment-witness-independent-static-review-r6/RECEIPT.json'
const SOURCE_REVIEW_SHA = '02b6052169f67c29464f1b8b6c08b1fc7921a7a13f0e3b0328537b8e8e7ba8f0'
const REVIEW_CLAIM = 'Design-only independent acceptance of historical diagnostic time bounds; no Owner adoption, no real witness/game/H/dependency/native run, no output preimage and no 1363 or C0 acceptance.'
const ADOPTION_CLAIM = 'Historical diagnostic witness bounds only; exact filled launch review and observed run remain required. No C0, 1363, native or game acceptance. Prior 300/330 and 600/630 labels unchanged. Timeout or survivor is STOP.'
const fail = name => { throw new Error(`STOP_${name}`) }
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const exact = (value, expected) => value && typeof value === 'object' &&
  Object.keys(value).length === Object.keys(expected).length &&
  Object.keys(expected).every(key => value[key] === expected[key])

/** Exact frozen cross-version roles. No arbitrary scratch path or receipt copying. */
export function validateBoundsRoles(bounds, adoption) {
  if (!exact(bounds, BOUNDS) || !exact(adoption, ADOPTION)) fail('BOUNDS_BINDING_PATH')
  const amendmentBytes = readFileSync(BOUNDS.path)
  const reviewBytes = readFileSync(BOUNDS.reviewPath)
  const adoptionBytes = readFileSync(ADOPTION.path)
  if (sha(amendmentBytes) !== BOUNDS.sha256 || sha(reviewBytes) !== BOUNDS.reviewSha256 ||
      sha(adoptionBytes) !== ADOPTION.sha256) fail('BOUNDS_BYTES')
  const review = JSON.parse(reviewBytes.toString('utf8'))
  const owner = JSON.parse(adoptionBytes.toString('utf8'))
  if (review.schema !== '1370-c0-aging-era-employment-witness-bounds-independent-design-review-r1' ||
      review.kind !== 'bounds' || review.status !== 'FROZEN_DESIGN_ONLY_UNRUN' ||
      review.verdict !== 'ACCEPT_WITNESS_BOUNDS_DESIGN_ONLY' ||
      review.decision !== 'INDEPENDENT_ACCEPT' || review.ownerAdoption !== false ||
      review.executionAuthorization !== false || review.sourceSha !== HISTORICAL_SOURCE ||
      review.amendmentPath !== BOUNDS.path || review.amendmentSha256 !== BOUNDS.sha256 ||
      review.sourceReviewPath !== SOURCE_REVIEW_PATH || review.sourceReviewSha256 !== SOURCE_REVIEW_SHA ||
      review.claimLimit !== REVIEW_CLAIM) fail('BOUNDS_REVIEW_ROLE')
  if (owner.schema !== '1370-c0-aging-era-employment-witness-bounds-parent-adoption-r1' ||
      owner.status !== 'ADOPTED_OPERATIONAL_BOUNDS_UNRUN' ||
      owner.decision !== 'PARENT_ADOPT_HISTORICAL_WITNESS_BOUNDS_ONLY' ||
      owner.executionAuthorization !== false || owner.sourceSha !== HISTORICAL_SOURCE ||
      owner.amendmentPath !== BOUNDS.path || owner.amendmentSha256 !== BOUNDS.sha256 ||
      owner.independentReviewPath !== BOUNDS.reviewPath ||
      owner.independentReviewSha256 !== BOUNDS.reviewSha256 ||
      owner.innerSeconds !== 720 || owner.activeStopSeconds !== 742 ||
      owner.wholeRecorderSeconds !== 750 || owner.weeks !== 416 ||
      owner.seed !== 'p13a-core-causal-01' || owner.claimLimit !== ADOPTION_CLAIM) fail('BOUNDS_ADOPTION_ROLE')
  return { kind: 'bounds', amendmentSha256: BOUNDS.sha256,
    reviewSha256: BOUNDS.reviewSha256, adoptionSha256: ADOPTION.sha256 }
}
