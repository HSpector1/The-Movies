# 1036 — G4 first result and test identity attribution

1020 closed2026-09-26T23:17:50.895Z→23:18:14.960Z,24.065seconds,child1
with fixedSource:true on0d22d885d251d0a02bd1cbd7fb1b51358518a32b plus
6b436c00c451f57680b18f40c7a22691c4f42e96f6a7491f10c5be8be4ebf2b0.
Three cases passed; T3 failed before its downstream choice/digest assertions.
All consumed-source identities remained fixed and untrackedSource stayed empty.
No failure, source or raw log is overwritten.

Actual successful route calls were main260+repeat9=269, below300. Four main
A/B/A/B first takes occurred13/22/31/40 and releases16/25/34/43, observed in
settled17/26/35/44. The separate second-A branch took9 weeks and released25.
T1 repeated versus split contexts and T2 later-encountered smaller-id witnesses
passed. T4 actual208 declinedAll finality and loaded209–260 persistence passed.
Do not infer that all assertions later in the failing T3 ran.

The sole first failure is test line170:
`state.talentMarket.cases.find(row => row.id === kase.id)`. Market cases have
no `id` field (types.ts TalentMarketCase and talentMarket.ts discover). Both
properties are undefined, so the predicate selects the first unrelated case.
Its observed settled outcome is not evidence that the subject received an extension.
The actual no-offer path at talentMarket.ts1214 closes the selected case as expired;
that expectation must stay. This is an invalid test join, not a production defect
or a product-law change. Parent missed the join in the pre-run static read.

Released correction is only the new test's case selection: require exactly one
match using its actual person/subject/contract/opened-week identity, then retain
expired/closed208 and all other assertions. The author owns this test edit; parent
owns the next fixed-source run after re-freeze. The helper and all production stay
unchanged. Independent1033 review must confirm attribution and corrected source.
No timeout, skip, bounds, historical fixture or expected gameplay value changes.
