# 877-A — independent first extension implementation review

Reviewer c2rm_contract_review read exact877 patch
a63c25e289189f00f3d5ae3f1629ff403a0e7cd6e054705e7a373fd6ffa9569f over c3da0084,
with production frozen. No test, generator, type or rendered execution. REFINE.

One concrete history join is newly exposed by the extension readers. People passes
caseDisclosure.settlementReasons, but core talentMarket.ts:542 selects a person's
latest settled receipt without bounding it to this case. Open/declined/expired
extensions can therefore inherit earlier ordinary contest reasons. Market's
ownDroppedReasons at193 has the same unbounded latest-receipt lookup; its separate
proposal-since-opening check does not bind that receipt to this extension.

Correction required: extensions join reasons to their own case span and terminal
outcome, with no prior settlement on an open case. Keep ordinary behavior and core
gameplay unchanged. Parent requested an independent prior-ordinary-case regression
for the next RED before implementing this filter. This is source-demonstrated,
not yet reproduced by a test at this record.

Remaining bounded source KEEP: exact off-catalogue term/eligible issuer admission;
commit revalidates current state; closed/used block is null with issuer/variant
retained; rival compensation remains under caseDisclosure; actual outgoing51 hash
is enumerated alongside projection52. Generated/type/runtime GREEN and the other
875 surfaces are unverified.

Minor copy correction accepted and applied after review: contract span now reads
“from Week D until Week N (exclusive; …)” rather than the ambiguous “through the
exclusive end of Week N.” The frozen877 patch remains the reviewed original,
not silently replaced with the subsequent correction.

## Separate immutable fixture inspection for remaining test premises

Parent inspected only raw generated corpus bytes using Python gzip/json/hashlib,
not current gameplay code or Owner data. Original
`genuine-v35-c2b-rival-incumbent-cohorts.json.gz` compressed SHA256
`afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d`
was verified. At2600 it contains93 retired people and0 player released films.
Hollywood credit rows for `person-studio-25969b11-r01-1` total230 (230 distinct
films), including2 authored-start credits; retiredWeek2236. Thus the >24 trap and
multi-page alumni data already exist genuinely. No same-person/multiple-role
Hollywood film was found in that corpus. Independent tests must still lift/validate
whole37 and recount their expectations; this inspection is not a behavior PASS.
