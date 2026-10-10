from pathlib import Path
import hashlib,json,difflib
P=Path(__file__).resolve().parent
S=P.parent/'1370-c0-m0-full-body-fixture-resolver-source-after-al-20261009-r2'
R=P.parent/'1370-c0-m0-full-body-fixture-resolver-independent-source-review-after-al-20261009-r2/RECEIPT.json'
def role(p):
 raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(name,value):
 target=P/name;target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('x') as f:f.write(value if isinstance(value,str) else json.dumps(value,indent=2,sort_keys=True)+'\n')
assert role(R)['sha256']=='949ff2cfa022bbaeed177d7d8ba75ec4e388f58d33be9edb608b0ae63f451c12'
assert role(S/'SOURCE-PINS.json')['sha256']=='c588b4aa72d84ceab8fa67030e0b747345b4fc58820fbf56ed0978b9aa379722'
pins=json.loads((S/'SOURCE-PINS.json').read_text())
for name,expected in pins['files'].items():
 assert role(Path(expected['path']))==expected
 if name not in ['ordering.ts','LESSONS.md','NEXT-STEPS.md','RECORDED-ROUTE-UNFILLED.json','RESOLUTION-SOURCE-BINDING.json','SOURCE-PROOF.json']:
  put(name,Path(expected['path']).read_text())
original=(S/'ordering.ts').read_text()
updated=original.replace('issuer:string|null','issuerStudioId:string|null').replace('r.issuer===order.issuer','r.issuerStudioId===order.issuerStudioId').replace('s.context.issuer===order.issuer','s.context.issuer===order.issuerStudioId')
assert updated!=original and 'order.issuer)' not in updated
helper="""
// Exact unchanged m0FreezeOrder from the complete talentMarket producer.
const FREEZE_ORDER=['issuerNotEntered','retirementCap','issuerDistrusted','nemesisOnRoster',
  'subjectCommittedElsewhere','startWeekMoved','noSeatForRole','belowAsk',
  'belowRetirementReservation','materialTermsChanged','promiseNotFeasible','bonusUnaffordable'] as const
export function assertFreezePredicateOrdering(marketValues:readonly unknown[],freezeValues:readonly unknown[],refs:readonly Ref[]):void{
  const market=marketValues as Row[],freezes=freezeValues as Row[]
  assert.equal(freezes.length,refs.length,'one freeze identity per submitted proposal')
  const predicates=market.filter(row=>row.phase==='freezePredicate')
  const project=(row:Row)=>({issuerStudioId:row.issuerStudioId,digest:row.detail.proposalDigest,
    proposalSourceIndex:row.detail.proposalSourceIndex,proposalOccurrence:row.detail.proposalOccurrence,
    predicateOrdinal:row.detail.predicateOrdinal,predicate:row.detail.predicate})
  exactly(predicates.map(project),refs.flatMap((ref,i)=>FREEZE_ORDER.map((predicate,predicateOrdinal)=>({
    issuerStudioId:freezes[i]!.issuerStudioId,...ref,predicateOrdinal,predicate}))),
    'complete identity-bound freeze predicate order')
  for(const [i,freeze] of freezes.entries()){
    const rows=predicates.slice(i*FREEZE_ORDER.length,(i+1)*FREEZE_ORDER.length)
    const drop=freeze.detail.drop as string|null
    const failedAt=drop===null?-1:(FREEZE_ORDER as readonly string[]).indexOf(drop)
    assert.ok(drop===null||failedAt>=0,'freeze drop names an existing predicate')
    exactly(rows.filter(row=>row.detail.result==='FAILED').map(row=>row.detail.predicateOrdinal),
      failedAt<0?[]:[failedAt],'freeze predicate FAILED slot agrees with drop')
    for(const [ordinal,row] of rows.entries()){
      assert.equal(row.week,freeze.week,'freeze predicate week binds its proposal')
      if(failedAt>=0&&ordinal>failedAt){
        assert.equal(row.detail.result,'NOT_REACHED','freeze predicate suffix is NOT_REACHED')
        assert.equal(row.detail.values,'NOT_EVALUATED','unreached predicate has no evaluated values')
      }else if(ordinal===failedAt){
        assert.equal(row.detail.result,'FAILED','freeze predicate first failure matches drop')
      }else{
        // Only noSeatForRole is conditionally NOT_EVALUATED in the real source:
        // player issuer or absent primary role. Every other prefix slot is PASSED.
        assert.ok(row.detail.result==='PASSED'||(FREEZE_ORDER[ordinal]==='noSeatForRole'&&row.detail.result==='NOT_EVALUATED'),
          'freeze predicate prefix status')
      }
    }
  }
}
"""
anchor="export function assertFullProjectionOrdering"
assert updated.count(anchor)==1
updated=updated.replace(anchor,helper+'\n'+anchor)
anchor="  const dropped=freezes.map((r,i)=>({r,i})).filter(({r})=>r.detail.drop!==null)"
assert updated.count(anchor)==1
integration="  exactly(freezes.map(row=>row.issuerStudioId),freezeSources.map((source:any)=>source.context.issuer),'freeze issuer binds actual source context')\n  assertFreezePredicateOrdering(market,freezes,freezeRefs)\n"
updated=updated.replace(anchor,integration+anchor)
put('ordering.ts',updated);put('predecessor/ordering.ts',original)
put('diffs/ordering.ts.forward.diff',''.join(difflib.unified_diff(original.splitlines(True),updated.splitlines(True),fromfile='r2/ordering.ts',tofile='r3/ordering.ts')))
put('diffs/ordering.ts.inverse.diff',''.join(difflib.unified_diff(updated.splitlines(True),original.splitlines(True),fromfile='r3/ordering.ts',tofile='r2/ordering.ts')))
reconstructed=updated.replace(helper+'\n','').replace(integration,'').replace('issuerStudioId:string|null','issuer:string|null').replace('r.issuerStudioId===order.issuerStudioId','r.issuer===order.issuer').replace('s.context.issuer===order.issuerStudioId','s.context.issuer===order.issuer')
assert reconstructed.encode()==original.encode()
binding=json.loads((S/'RESOLUTION-SOURCE-BINDING.json').read_text())
binding['derivativeRoot']=str(P/'derivative')
for key,value in binding['derivatives'].items():
 value['path']=str(P/Path(value['path']).relative_to(S));assert role(Path(value['path']))==value
binding['typedCatchMutant']['path']=str(P/'mutants/typed-propagation-removed-talentMarket.ts')
assert role(Path(binding['typedCatchMutant']['path']))==binding['typedCatchMutant']
put('RESOLUTION-SOURCE-BINDING.json',binding)
route=json.loads((S/'RECORDED-ROUTE-UNFILLED.json').read_text());route['cwd']=str(P)
for key in ['config','entrypoint','resolution','fixtureProducer','baselineMethods','mutant']:
 old=Path(route[key]['path']);route[key]=role(P/old.relative_to(S))
put('RECORDED-ROUTE-UNFILLED.json',route)
proof=json.loads((S/'SOURCE-PROOF.json').read_text())
proof['r2SourceStop']=role(R)
proof['consumerRepair']={'predecessor':role(S/'ordering.ts'),'current':role(P/'ordering.ts'),
 'wholeFileInverseByteExact':True,'findings':['F1_MARKET_ISSUER_FIELD_MISMATCH','F2_FREEZE_PREDICATE_COMPLETENESS_OMITTED'],
 'gameBodiesChanged':False,'resolverChanged':False,'fixtureMethodsChanged':False}
proof['r2PredecessorSourceProof']=role(S/'SOURCE-PROOF.json')
put('SOURCE-PROOF.json',proof)
put('LESSONS.md',(S/'LESSONS.md').read_text()+"\n- R2's ordering consumer used issuer where the actual recorder emits issuerStudioId. Undefined fields accidentally grouped different issuers, while actual context.issuer failed correlation. Compare the emitted field and bridge it explicitly to the differently named context field. Preserve the independently rejected R2 source.\n- R2 asserted freeze summaries but omitted the twelve individual freezePredicate slots. Summary membership cannot prove completeness or order of the predicates that produced it. Bind every slot to issuer/digest/source index/occurrence, require the exact producer name/ordinal order, first failure/drop agreement and unreached suffix. Only noSeatForRole permits NOT_EVALUATED before failure in this producer.\n- Finite synthetic witness inputs isolate consumer checks without claiming actual fixture validity or runtime outcomes. Expected RED mutations must fail the intended assertion after an intact synthetic GREEN baseline; missing fixtures, loader errors and timers never substitute. No such controls are executed in source preparation.\n")
put('NEXT-STEPS.md',(S/'NEXT-STEPS.md').read_text()+"\n## R3 bounded consumer correction\n\nIndependent source STOP949ff2 found two consumer defects in R2. R3 repairs the emitted issuerStudioId/context.issuer binding and verifies the unchanged twelve freezePredicate slots, exact per-proposal identity/order, allowed prefix statuses, first FAILED/drop agreement, and NOT_REACHED/NOT_EVALUATED suffix. Only ordering.ts gameplay-consumer source changes; all complete module bodies, resolver, fixtures, configuration and main entrypoint remain byte-identical to R2. Paths/roles are rebound to this fresh package. Whole ordering file inverse reconstructs R2 byte-exactly. R2 and preparatory r1 remain preserved.\n\nORDERING-SOURCE-CASES.json and ordering-source-controls.ts provide finite synthetic GREEN/expected RED input methods for independent review and later separately authorized consumer qualification. They are not generated game states, not meaningful catch-mutant RED, and have not run. Runtime adapter, fixture/protection/types dependencies remain null/pending.\n")
print(json.dumps({'consumer':role(P/'ordering.ts'),'inverse':role(P/'diffs/ordering.ts.inverse.diff'),'gameModulesUnchanged':True},indent=2))
