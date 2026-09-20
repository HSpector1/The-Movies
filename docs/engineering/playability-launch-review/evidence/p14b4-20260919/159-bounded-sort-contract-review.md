# 159 — Independent bounded-sort prerequisite review

Native contract-auditor returned this complete review; parent persisted it.

DONE. **KEEP for frozen157 §§1–3 only.** No contract correction is required before independent tests for this prerequisite. Broader replay accounting and useful-total certification remain OPEN.

Reviewed complete157,158 and the three actual owner call sites. No files changed, runtime executed or implementation inspected.

Verified identities:

-157: `2e55e5592a2f43f4fd6be1bdeebc80972e83462cfbe717aa7c3495bfba1fd44d`
-158: `917c7c832749d06eb9ddfa6181ad0aae8a71bc556a56f79ee84715d5b3a6595f`

## Contract assessment

- **MET AS DESIGN — API and finite bounds.** The length-only query has an explicit domain and `RangeError` behavior, requires at most32 doubling steps and no length-proportional allocation. Both returned products remain safe integers throughout the accepted domain.
- **MET BY PAPER PROOF — Merge accounting.** The prescribed algorithm performs exactly `L` passes, at most `n` comparisons per pass, `n` reference writes per pass and `n` initial-copy writes. Explicit unpaired-tail copying and returning the final source without another copy make the stated bounds coherent. Array-capacity reservation remains separately accounted.
- **MET AS DESIGN — Stability and identity.** Left selection for negative, zero or NaN results preserves stable ties. Empty/singleton outputs remain fresh arrays; records, nested markers and duplicate references are not cloned or deduplicated.
- **MET AS DESIGN — Production ordering.** Once-per-row decoration preserves the existing wait priority, numeric ordinal parsing, malformed-ID fallback and final lexical comparison. Crucially, NaN-as-tie applies to the **final comparator result**. `Infinity−Infinity` inside the ordinal expression must still fall through the unchanged `||` chain. Mixed malformed NaN clocks are correctly excluded from blanket native-order parity claims.
- **MET AS DESIGN — Allocator integration.** Existing spread and policy filtering remain in original input order before sorting. No callback is moved into the comparator. Sticky reservation retention, selected-facility validation, first-fit slots and stage/Set composition remain unchanged. `bindableSetsOn` continues its state-order filter.
- **MET AS DESIGN — Release integration.** The same appended row and lexical production-ID comparator preserve commitment identities, existing record references and tie behavior. This remains a lower append owner, not release permission.

## 158 alignment and limits

157 resolves158’s provisional points:

- Row2 now requires a fresh result even for already-sorted input.
- Row10 tests the specified length-only bound and rejection domain; there is no ceiling, saturation or prepaid-owner API to invent.
- Generic comparator-call measurements do not observe element writes, prove owner character costs or discharge before-call replay accounting.

The three production paths are sufficient for this prerequisite. No kernel, validator, phase, Set-selection, technology-policy or version change is authorized.

**NOT VERIFIED:** missing-entry RED, implementation, measured comparator bounds, owner parity, strict typing or regression execution. Full replay budgets in§§4–5 remain unproved; this KEEP does not reinstate137’s withdrawn67,904 estimate or authorize the replay producer.

Next: freeze and review the independent executable tests, preserve actual RED, then separately release the three-file shared-sort implementation.
