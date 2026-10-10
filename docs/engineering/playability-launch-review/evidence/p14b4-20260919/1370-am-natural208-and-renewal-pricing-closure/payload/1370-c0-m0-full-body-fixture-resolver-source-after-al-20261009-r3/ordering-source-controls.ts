// Finite synthetic witness-consumer inputs only. No game or fixture producer imports.
import assert from 'node:assert/strict'
import {assertFullProjectionOrdering,assertFreezePredicateOrdering} from './ordering.js'
type Edit={op:'set'|'remove'|'swap';path:(string|number)[];value?:unknown;other?:number}
type Args={probe?:unknown;marketValues:unknown[];feasibilityValues?:unknown[];freezeValues?:unknown[];refs?:any[]}
type Case={id:string;base:string;expected:'GREEN'|'RED';assertion?:string;edits:Edit[]}
type Packet={schema:string;claim:string;bases:Record<string,{method:'author'|'freeze';args:Args}>;cases:Case[]}
function apply(args:Args,edits:Edit[]):Args{
  const out=structuredClone(args)
  for(const edit of edits){
    assert.ok(edit.path.length>0)
    let owner:any=out
    for(const segment of edit.path.slice(0,-1))owner=owner[segment]
    const at=edit.path.at(-1)!
    if(edit.op==='set')owner[at]=structuredClone(edit.value)
    else if(edit.op==='remove'){
      if(Array.isArray(owner))owner.splice(Number(at),1)
      else delete owner[at]
    }else{
      assert.ok(Array.isArray(owner)&&Number.isInteger(edit.other))
      const index=Number(at),before=owner[index];owner[index]=owner[edit.other!];owner[edit.other!]=before
    }
  }
  return out
}
export function runOrderingSourceControls(packet:Packet):{id:string;expected:'GREEN'|'RED'}[]{
  assert.equal(packet.schema,'1370-m0-ordering-synthetic-source-inputs/v1')
  assert.equal(packet.claim,'SYNTHETIC_WITNESS_CONSUMER_INPUTS_NOT_GAME_STATES_OR_OBSERVED_RESULTS')
  return packet.cases.map(test=>{
    const base=packet.bases[test.base];assert.ok(base)
    const args=apply(base.args,test.edits)
    const run=()=>base.method==='author'
      ?assertFullProjectionOrdering(args.probe,args.marketValues,args.feasibilityValues!)
      :assertFreezePredicateOrdering(args.marketValues,args.freezeValues!,args.refs!)
    if(test.expected==='GREEN')run()
    else{
      assert.ok(test.assertion)
      assert.throws(run,error=>error instanceof assert.AssertionError&&error.message.includes(test.assertion!),
        `${test.id}: intended consumer assertion, no loader/operational error substitution`)
    }
    return {id:test.id,expected:test.expected}
  })
}
