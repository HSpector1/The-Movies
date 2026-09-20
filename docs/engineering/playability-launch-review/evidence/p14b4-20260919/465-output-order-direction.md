# 465 — Paid canonical output fast path (adopted, baseline before writer)

2026-09-20. Base/exactremote0bbf2843e8fc4e658a22e1d140fe8bb1c609983f.
452sourcea1761d8e14d744f28f6a4b3dd66c26fbf9f6db30183f31edcdd8c5abb2caa7e8 FROZEN.
462firsttakecuts197387/request11361 atadditionalHolds full-sort reserve.
StalecutsBEFOREPost3owner; thisoutput-onlychangecannotalonefixthatprefix.
Original457firsttake/staleRED areacceptancefailures; nobudgetfitclaim.

## Exact scope and helper

ONLYreplaymodule+466handback afterindependenttestbaseline.
Keep existing sorted and EVERY inputcanonicalization call unchanged.
Add private sortedOutput, replacing ONLY four same-signature calls:
completeTrace paths/fixedHoldReplacements/additionalHolds and
replayPlans completedBackgroundPathKeys. Keep allcallsiteargument/closurepayments
andexactexistingpurefield/identitycallbacks; no extra wrapper/closure.

```ts
function sortedOutput<T>(
  values: readonly T[],
  keyOf: (value: T) => string,
  work: Work,
): T[] {
  work.pay(16)
  const count = values.length
  if (count < 2) {
    work.pay(12)
    return values.slice()
  }
  work.pay(24)
  let previous = keyOf(values[0]!)
  let index = 1
  for (;;) {
    work.pay(10)
    if (index === count) break
    work.pay(20)
    const current = keyOf(values[index]!)
    work.pay(12)
    if (work.less(current, previous)) {
      work.pay(12)
      return sorted(values, keyOf, work)
    }
    work.pay(10)
    previous = current
    index++
  }
  work.pay(work.calc(16).add(10, work.calc(8).times(2, count)))
  return values.slice()
}
```

Payments:16len/bind/shortdispatch;12shortfreshsliceatmost1reference;
24firstindexedpurekeycallback/bind/indexinit; each10guard/branch/termination,
20indexedread/purecallback/bind,12Work.lessinvocation/branch,10assignment/increment;
12fallback3args/invoke/return. ActualWork.less pays complete comparedstringspans.
Final10+2N coversslice/callreturn/fresharraysetup/capacity/referencewrites;
calc16+calc8+times10+add8=42 additional arithmetic units, allbeforecopy.
Saturatinghelpersunchanged. No unprepaid bulkcopy or max-key scan.

Privateprecondition: these fourarrays areinternallyconstructed denseplainarrays;
callbacks areexactlyexistingpurefield/identityprojections. Skippingkeycallbacks
for0/1 is therefore safe. Adjacentcurrent<previous uses SAMEordinalstringorder
asoldsort. Equalkeysretainoriginalorder. No numericID/order assumption/dedup.
EveryreturnarrayisFRESH, evenempty/singleton; elementreferences unchanged.
Inversion paysallprecheck ANDfulloldsort, no refund/reused-sortallowance.
Thusunsortedroutescanbe MOREexpensive; preserveanyrealnewfailure. Precheck
worklimit isordinarycut, neverpermissiontoreturnpartialoutput.

No owner/state/calendar/ledgerjoin/memo/pricing/cap/testvalidator/API/schema
change. PriorRehearsal/wrap/Post fixes remain untouched.

## Independent prospective review and adoption

Native sim gave exactcode/paymentinventory; nativecontract-auditor qualifiedKEEP
for ordering/stability/reference/copy/paymentsemantics undertheseprivatepremises.
Preservecallsitepayments; anynewwrapper/callbackneedsadditionalpayment.
No actual-source oruniversalpricing/fitacceptance. Parent hasread actualsorted,
fouroutputsites, Work.less/calc/primitives. ParentADOPTS exactlythisscope.
Written465candidate review and467actualsource review remain required.

## Additive independent controls

AuthorauthorizedONLYadditions within existingcases inTHREEtestfiles plus
465-output-order-test-brief.md. Preserveeveryoriginalimport/helper/fixture/
assertion/cap/timeout. NOnewfixtureoradditionalreplaycall orprivateoracle.

Baselinepins:
- Readybackground a4b409f9072ba1ed96c2a53bab47cb109024e91c55d1f56fc76d000bd277e960.
- Startedbackground de3e976ef97b5b37196327f03ac9905175c881740b1c6bbbed87bba1c40d2b47.
- Readyowner0e1a25ed6e9b5c1c88d8e4459845636ca7caef6e131f78ff823c5d3cc542f864.

Readyactiveaudition: assert exactemittedpathorder againstindependentlyconstructed
castingSession/screenplay/setMountkeys sortedEXPECTEDsideonly. Assertadditional
holdIDsequence equalsits copiedplainstring-sortedsequence; oldmembership/6holds/
timing checksremain. Started duewriting: exactemittedpaths; exactTWOreal
fixedreplacements fromalreadyidentifiedwriter/Developmentholds andcompletion.at,
sortedEXPECTEDbyholdId; exactcompletedBackgroundPathKeys=[pathB].
ReadySAMEsiblings andexistingzeroOffsetrepeat: publicfouroutputarraysfresh
acrosssiblings/repeat, canonicalkeyorderingperbranch. Preserveintentionalglobal
fixedHoldsharing andoldHold/subjectfreshness. Neverin-placesortreturnedarrays
oruse localeCompare. NOprivatehelperexport orcreatedtest-onlyproductioncode.

Limits: existingcompletedbackgroundfixturesonly0/1keys, NOTmulti-keyordering
coverage. PublicarrayisolationdoesNOTprovefreshcopyrelative to aprivateinput
temporary orhelper tariff. These are retained-propertycontrols, baseline may
PASS; originalfirsttakeRED remainsseparateacceptancetarget.

## Ownership / verification

Freeze/hash all3files+brief; parentFULLdiff/exactadd-only reconstruction and
independentactualtestreview. Run465-output-order-control onUNCHANGED452 with
THREEwholefiles (9+2+4=15tests) SERIAL. No sourcewriter beforebaselinecloses.
ThenONE466simwriter onlyreplay+handback; freeze/hash/yield;467actualreview.
468rootUI/469lookup/470ordinary/471Ready/472started/473adjacent/474bridge/
475facts freshSERIAL onfrozenprotectedsource/test/HEAD.476passivediagnostics
onlyafterALLclosed, remove/restore;477qualifiedcheckpoint/478exactpublication.
Do notstopthere. Max2nativeFablespecialists,oneproductionwriter, noClaude/install.
ContinueB4/restP14/P15/P16/specifiedP17/P18; Unity/native/Ownerdeferred.

## Independent review of written465

Auditor FULLread candidate
d6ac8f9a0bfa42ea27ffaa2fd831595ca53d9d289db9727de390aa0241d58f26:
KEEP. Exacthelper/payments/foursites/callsiteclosurepayments/fullfallback match.
Fresh0/1,stableequals,actualstringspans andordinarycuts explicit. Testscope and
limits accurate; no written correction. Designonly, notsource/tariff-wide/fit
acceptance. Parentadoptionstands;466sourcewriter stillunreleased pendingtest
freeze/actualreview andunchanged452baseline.
