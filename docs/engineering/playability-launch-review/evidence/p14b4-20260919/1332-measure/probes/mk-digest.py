import sys
src=open(sys.argv[1]).read()
old="      expect(root.feasibilityReceipt).toMatchObject({ week: 208, rulesVersion: 4 })\n"
assert src.count(old)==1
new='''      const r208 = state.talentMarket.receipts.filter((q: any) => q.talentId === root.beneficiaryPersonId && q.week >= 196).map((q: any) => ({ eventId: q.eventId, week: q.week, kind: q.kind, studioId: q.studioId ?? null, reasons: q.reasons ?? null }))
      const props = state.talentMarket.proposals.filter((q: any) => (q.promises ?? []).includes(root.promiseId)).map((q: any) => ({ issuer: q.issuerStudioId, talentId: q.talentId, submittedWeek: q.submittedWeek, startWeek: q.startWeek }))
      console.log('DIGESTFACT ' + JSON.stringify({ label: process.env.LEDGER_COMMIT, promiseId: id, issuer: root.issuerStudioId, beneficiary: root.beneficiaryPersonId, family: root.family, contractId: root.contractId, outcome: root.outcome, receipt: root.feasibilityReceipt, proposals: props, receipts: r208 }))
'''
src=src.replace(old,new)
# make the whole-world assertions after selection not stop the loop: keep them (they come after both selections)
open(sys.argv[2],'w').write(src)
