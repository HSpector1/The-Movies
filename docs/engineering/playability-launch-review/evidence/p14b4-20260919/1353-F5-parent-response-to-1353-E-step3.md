# 1353-F5: parent response to the P15C Wave 1 step 3 handback

[1353-E](1353-E-p15c1-production-handback.md), Step 3 section: RED r4 passes 72/72 on the step-3 module, both at the
writer's base c614b7e9 and rebased onto 3b2dc509. The patch applies over r4 at b91c2f2f.
- **Reference check:** 63/63 manifests match, and each of the six refusals fires for its own rule.
- **Defect injection:** three injected defects, each caught.
- **Type gates:** unchanged apart from the expected missing-module error disappearing.

The five rulings of [1353-F4](1353-F4-parent-rulings-on-1353-E.md) are implemented. A3 needed no change
(`campaignLegacy.ts:682`, `:699`).

## The writer's observation: "cannot pioneer"

1353-F4 OPEN-12 says both "A studio that entered after a technology became commercial cannot pioneer it" and "Held-or-
not is unchanged". The two conflict for a studio that enters shortly after `commercialWeek` and adopts within
`LEGACY_PIONEER_WEEKS`. The held predicate does not read entry, so such a studio holds pioneer. The writer followed the
explicit "unchanged" sentence.

**Ruling: the writer's reading stands. "Cannot pioneer it" is withdrawn as imprecise.**
- OPEN-12 narrows only the contrary side. A technology is cited as late or never adopted only when it became
  commercial during S's span.
- A studio that enters after `commercialWeek` and adopts within 52 weeks of it is early to a new technology, and it
  holds pioneer for it under the unchanged predicate.
- No code or RED change follows.

## Next

- The parent dry run 1353-X3: r4 over step 3 at the then-current HEAD, plus Part A over r4. The Wave R file is
  byte-identical to r3; its run is queued locally behind the recorded UI measurement.
- Then implementation review 1353-J, then landing.
